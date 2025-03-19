/***
 2023.09.10
 갱신시 동의 일자 체크하는 로직




 **/
const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require("../UTIL/date_lib");
const _fileUtil = require("../UTIL/file_lib");
const deployConfig = require("../SERVER/deploy_config.json");
const batchService = require("../SERVICES/batchService");
var network_api = require('../UTIL/network_lib');

const sConfig = require('../CONFIG/sftp_config');
const sCon = new sConfig();
let sftpConfig =sCon[deployConfig.deploy];

const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy];



var banList = [0,2,3,4,5,6,7,8,9,10,11]; // 작동금지 업체
/**
 * 갱신시 개인정보설계동의 여부 확인
 * 확인 절차
 * bikeRenewal의 newAgreeCheckYN is null 인 대상자들에 대해 전부 확인
 * SIMG -> 현대해상
 *
 *
 */
cron.schedule('10 30 09 * * *', () => {
    // let toDay = _dateUtil.GET_DATE('YYMMDD','NONE',0);
    start();
});

/** 수동처리  **/
// start('AGREECHECK'); // 개인정보동의 확인
start('CONTRACTCHECK'); // 체결이행확인

/**
 *
 * @param process : 체크프로세스
 * @returns {Promise<void>}
 */
async function start(process){


    /** 순차실행을 이용하여 진행 **/
    for (const service of svs) {
        var schema = "";
        var bpk = "";
        schema = service.dbAccess;
        bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){
            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);
            checkAgree(bpk, schema, process)
        }else{
            console.log("제외 대상 업체 ", service.serviceName);

        }

    }




}





function checkAgree(bpk, schema, process){

    let job = "";

    if(process == 'AGREECHECK'){
        job = 'RENEWCHECK';
    }

    if(process == 'CONTRACTCHECK'){
        job = 'RENEW_C_LIST';
    }



    let query = "CALL hyundaiCheck("+
        "'" + job + "'" +
        ", '" + 0 + "'" +
        ", '" + bpk + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ");";



    console.log(query);
    _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
        console.log('MYSQL RESULT : ', result[0]);
        let data = result[0];
        let valueRow = data;

        if(process == 'CONTRACTCHECK'){

            if (result[0][0].code == '999') {

                console.log('체결이행체크대상없음');

            }else{

                /** 비동기 처리 ***/
                const timer = ms => new Promise(res=>setTimeout(res,ms))
                load(valueRow);
                async function load(valueRow){
                    let obj;
                    for(var i=0; i< valueRow.length; i++){
                        obj = valueRow[i];
                        // console.log(obj);
                        sendData(obj, schema, bpk, process);
                        await timer(800);
                    }
                    console.log("end")
                }
            }

        }else{

            /** 비동기 처리 ***/
            const timer = ms => new Promise(res=>setTimeout(res,ms))
            load(valueRow);
            async function load(valueRow){
                let obj;
                for(var i=0; i< valueRow.length; i++){
                    obj = valueRow[i];
                    // console.log(obj);
                    await sendData(obj, schema, bpk, process);
                    await timer(500);
                }
                console.log("end")
            }

        }


    });


}

async function sendData(obj, schema, bpk, process){

    let data = {};
    let S_JOB = "";
    let U_JOB = "";
    let resPlyNo = ""; // 체결이행에는 받은 정보가 들어가게끔 처리되어야한다.
    let recvPlyNo = "";
    /* 개인정보동의 확인 */
    if(process == 'AGREECHECK'){
        data = {
            "bizCode":'003',
            "drvrResdNo":obj.socialNo,
            "agmtCncsAgrmReqDt":_dateUtil.GET_DATE("YYYYMMDDHHMMSS", "NONE",0),
            "reqAgmtCncsAgrmRslt":"1",
            "resAgmtCncsAgrmDt":"",
            "resAgmtCncsAgrmValidDt":""
        };

        S_JOB = "RENEW_S";
        U_JOB = "RENEW_U";
    }
    /* 체결이행 확인 */
    if(process == 'CONTRACTCHECK'){

        data = {
            "bizCode":'008',
            "drvrResdNo":obj.socialNo,
            "resPlyNo"  : obj.pNo,
            "agmtCncsAgrmReqDt":_dateUtil.GET_DATE("YYYYMMDDHHMMSS", "NONE",0),
            "reqAgmtCncsAgrmRslt":"", // 요청할때 빈값으로?
            // "reqAgmtCncsAgrmRslt":"1",
            "resAgmtCncsAgrmDt":"",
            "resAgmtCncsAgrmValidDt":""
        };

        S_JOB = "RENEW_C_S";
        U_JOB = "RENEW_C_U";
    }

    // console.log("request data Check : ", data);

    /* 알림톡 세팅 필요함 [ 09-10 일요일 ]*/
    network_api.network_h001(data).then(function(response){

        console.log("동의 결과 ", response);

        if(process == 'CONTRACTCHECK'){
            resPlyNo = data.resPlyNo;
        }else{
            resPlyNo = "";
        }

        let query = "CALL hyundaiCheck("+
            "'" + S_JOB + "'" +
            ", '" + 0 + "'" +
            ", '" + bpk + "'" +
            ", '" + data.drvrResdNo + "'" +
            ", '" + data.agmtCncsAgrmReqDt + "'" +
            ", '" + "" + "'" +
            ", '" + "" + "'" +
            ", '" + "" + "'" +
            ", '" + "" + "'" +
            ", '" + resPlyNo + "'" +
            ");";


        console.log(query);
        _mysqlUtil.mysql_proc_exec(query, schema).then(async function (result) {


            // console.log(result)
            var hpk = result[0][0].rCnt;


            if (response.code == 200) {
                if (response.receive.reqAgmtCncsAgrmRslt == '0') {

                    let responseData = {
                        rCnt: 0,
                        msg: "동의 필요"
                    };
                    console.log('동의 필요 response :', responseData);

                    // res.status(200).send(responseData);
                } else if (response.receive.reqAgmtCncsAgrmRslt == '') {

                    let responseData = {
                        rCnt: 0,
                        msg: "동의 대상 확인 필요"
                    };
                    /* 빈값으로 결과 받는 경우에는 받은 즉시 확인 절차 중단 후 슬랙에 알림톡 보낼 수 있도록 한다. */
                    console.log('체결이행 미 대상자 response :', responseData);

                    // let slackBotObj = {
                    //     "channel": "#에러로그",
                    //     "username": "현대해상 갱신 에러감지봇",
                    //     "text": '체결이행동의 진행중 reqAgmtCncsAgrmRslt 값 누락. 점검 바랍니다.\n*갱신 체결이행 확인 중단*',
                    //     "icon_emoji": ":ghost:"
                    // };
                    //
                    // _apiUtil.simg_slackWebHook(data).then(function(result){
                    //     console.log(result);
                    //     return;
                    // });

                    // response.receive.reqAgmtCncsAgrmRslt = 0; // 값 0으로 설정한다.
                } else if (response.receive.reqAgmtCncsAgrmRslt == '2'){ // 서류 스캔했을 때 ~

                    let responseData = {
                        rCnt: 2,
                        msg: "서류스캔 동의 완료"
                    };

                    console.log('서류 동의 완료 response : ', responseData);



                } else {

                    let responseData = {
                        rCnt: 1,
                        msg: "동의 완료"
                    };

                    console.log('동의완료 response :', responseData);
                    // res.status(200).send(responseData);
                }
            } else {
                let responseData = {
                    rCnt: 0,
                    msg: "동의 필요"
                };


                console.log(responseData)


            }


            if (process == 'CONTRACTCHECK') {
                recvPlyNo = response.receive.resPlyNo;
            } else {
                recvPlyNo = "";
            }

            let query = "CALL hyundaiCheck(" +
                "'" + U_JOB + "'" +
                ", '" + hpk + "'" +
                ", '" + bpk + "'" +
                ", '" + data.drvrResdNo + "'" +
                ", '" + data.agmtCncsAgrmReqDt + "'" +
                ", '" + response.receive.reqAgmtCncsAgrmRslt + "'" +
                ", '" + response.code + "'" +
                ", '" + response.receive.resAgmtCncsAgrmDt + "'" +
                ", '" + response.receive.resAgmtCncsAgrmValidDt + "'" +
                ", '" + recvPlyNo + "'" +
                ");";

            console.log(query);
            await _mysqlUtil.mysql_proc_exec(query, schema).then(function (result) {


                console.log(result)


            });


        });










    });




}
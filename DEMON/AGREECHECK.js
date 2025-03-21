/***
 2022.07.18
 동의 일자 체크하는 로직




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


// var banList = [1, 6, 8]; // 작동금지 업체
var banList = [1,2,3,4,5,6,7,8,9,10]
cron.schedule('10 30 23 * * *', () => {
    let toDay = _dateUtil.GET_DATE('YYMMDD','NONE',0);
    start(toDay);
});
/**
 * 당일 심사인원은 2시간에 한 번씩 동의여부 체크한다.
 * 근무시간에 적용 (평일 8시 ~ 18시)
 * 1,2,3,4,5 = day of week(월,화,수,목,금)
 * **/
// cron.schedule('0 0 */1 * * *', () => {
//     let toDay = _dateUtil.GET_DATE('YYMMDD','NONE',0);
//     start(toDay);
// });
// cron.schedule('0 30 */3 * * *', () => {
//     let yesterDay = _dateUtil.GET_DATE('YYMMDD','NONE',-1);
//     start(yesterDay);
// });
start();


async function start(underwriteDay){


    /** 순차실행을 이용하여 진행 **/
    for (const service of svs) {
        var schema = "";
        var bpk = "";
        schema = service.dbAccess;
        bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){
            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);
            checkAgree(bpk, underwriteDay, schema)
        }else{
            console.log("제외 대상 업체 ", service.serviceName);

        }




    }




}





function checkAgree(bpk, underwriteDay, schema){

    underwriteDay = underwriteDay || 'all';

    let job = 'LIST';

    let query = "CALL hyundaiCheck("+
        "'" + job + "'" +
        ", '" + 0 + "'" +
        ", '" + bpk + "'" +
        ", '" + "" + "'" +
        ", '" + underwriteDay + "'" +
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

        /** 비동기 처리 ***/
        const timer = ms => new Promise(res=>setTimeout(res,ms))
        load(valueRow);
        async function load(valueRow){
            let obj;
            for(var i=0; i< valueRow.length; i++){
                obj = valueRow[i];
                // console.log(obj);
                sendData(obj, schema, bpk);
                await timer(500);
            }
            console.log("end")
        }

    });


}

function sendData(obj, schema, bpk){



    let data = {
        "bizCode":'003',
        "drvrResdNo":obj.socialNo,
        "agmtCncsAgrmReqDt":_dateUtil.GET_DATE("YYYYMMDDHHMMSS", "NONE",0),
        "reqAgmtCncsAgrmRslt":"1",
        "resAgmtCncsAgrmDt":"",
        "resAgmtCncsAgrmValidDt":""
    };


    network_api.network_h001(data).then(function(response){

        console.log("동의 결과 ", response);



        let query = "CALL hyundaiCheck("+
            "'" + "S" + "'" +
            ", '" + 0 + "'" +
            ", '" + bpk + "'" +
            ", '" + data.drvrResdNo + "'" +
            ", '" + data.agmtCncsAgrmReqDt + "'" +
            ", '" + "" + "'" +
            ", '" + "" + "'" +
            ", '" + "" + "'" +
            ", '" + "" + "'" +
            ", '" + "" + "'" +
            ");";


        console.log(query);
        _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){


            // console.log(result)
            var hpk = result[0][0].rCnt;


            if(response.code ==200){
                if(response.receive.reqAgmtCncsAgrmRslt=='0'){

                    let responseData = {
                        rCnt :0,
                        msg : "동의 필요"
                    };
                    console.log(responseData)

                    // res.status(200).send(responseData);
                }else{

                    let responseData = {
                        rCnt :1,
                        msg : "동의 완료"
                    };

                    console.log(responseData)
                    // res.status(200).send(responseData);
                }
            }else{
                let responseData = {
                    rCnt :0,
                    msg : "동의 필요"
                };


                console.log(responseData)




            }


            let query = "CALL hyundaiCheck("+
                "'" + "U" + "'" +
                ", '" + hpk + "'" +
                ", '" + bpk + "'" +
                ", '" + data.drvrResdNo + "'" +
                ", '" + data.agmtCncsAgrmReqDt + "'" +
                ", '" + response.receive.reqAgmtCncsAgrmRslt + "'" +
                ", '" + response.code + "'" +
                ", '" + response.receive.resAgmtCncsAgrmDt + "'" +
                ", '" + response.receive.resAgmtCncsAgrmValidDt + "'" +
                ", '" + "" + "'" +
                ");";


            console.log(query);
            _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){


                console.log(result)


            });


        });










    });




}






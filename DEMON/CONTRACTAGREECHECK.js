/***
 작성자 : SIMG ICT 오정현
 작성일자 : 2024.08.12
 개발 내용 : 체결동의여부 확인 데몬
 - HYUNDAI 에서 신규 / 갱신 심사시 체결동의 URL SIMG 에서 발송하고, 해당 URL 통해서 설계동의한 라이더의 설계동의여부 확인하는 스케쥴러
 *기본 방식은 agreeCheck와 동일하게 진행됨
 * 통신 방식 : POST 실시간
 * SIMG에서 통신량 조절해야함
 *
 *
 * 요청 전문 Object :
 * {
 *          "bizCode":'003',
 *         "drvrResdNo": "", // 확인요청 주민등록번호
 *         "agmtCncsAgrmReqDt": "", // 요청일자
 *         "reqAgmtCncsAgrmRslt":"1",
 *         "resAgmtCncsAgrmDt":"",
 *         "resAgmtCncsAgrmValidDt":""
 * }
 * 회신 전문 Object :
 * {
 *     BIZ_CODE : "008", // 체결이행 확인 전문은 이걸로 고정
 *     DRIVER_RESD_NO : "", // 주민등록번호
 *     DLY_NO : "", // 증권번호 ( 갱신일때는 어쩔건지 문의 )
 *     AGMT_CNCS_AGRM_RSLT : "", // 체결이행동의 여부(결과) - 0 미동의 , 1 동의
 *     AGMT_CNCS_AGRM_DT : "", 체결이이행동의일자
 *     AGMT_CNCS_AGRM_VALID_DT : "", // 체결이행 동의 유효일자
 * }


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


// var banList = [6, 8]; // 작동금지 업체
var banList = [2,3,4,5,6,7,8,9,10,11,12]; // 작동금지 업체

// cron.schedule('10 30 23 * * *', () => {
//     let toDay = _dateUtil.GET_DATE('YYMMDD','NONE',0);
//     start(toDay);
// });
// /**
//  * 당일 심사인원은 2시간에 한 번씩 동의여부 체크한다.
//  * 근무시간에 적용 (평일 8시 ~ 18시)
//  * 1,2,3,4,5 = day of week(월,화,수,목,금)
//  * **/
// cron.schedule('0 0 */1 * * *', () => {
//     let toDay = _dateUtil.GET_DATE('YYMMDD','NONE',0);
//     start(toDay);
// });
// cron.schedule('0 30 */3 * * *', () => {
//     let yesterDay = _dateUtil.GET_DATE('YYMMDD','NONE',-1);
//     start(yesterDay);
// });

let toDay = _dateUtil.GET_DATE('YYMMDD','NONE',0)
start(toDay);


async function start(day){


    /** 순차실행을 이용하여 진행 **/
    for (const service of svs) {
        var schema = "";
        var bpk = "";
        schema = service.dbAccess;
        bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){
            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);
            checkContract(bpk, day, schema)
        }else{
            console.log("제외 대상 업체 ", service.serviceName);

        }




    }


}



function checkContract(bpk, day, schema){

    day = day || 'all';

    let job = 'C_LIST';

    let query = "CALL hyundaiCheck("+
        "'" + job + "'" +
        ", '" + 0 + "'" +
        ", '" + bpk + "'" +
        ", '" + "" + "'" +
        ", '" + day + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ");";



    console.log('checkContractQuqery : ',query);
    _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
        console.log('MYSQL RESULT : ', result[0]);
        let data = result[0];
        let valueRow = data;
        let dataCnt = data.length;

        if(dataCnt > 0){ // 체결이행 동의할게 있으면~
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
                console.log(`${bpk} - ${dataCnt} is end`);
            }
        }

        console.log(`${bpk} - ${dataCnt} is end`);

    });


}

function sendData(obj, schema, bpk){



    let data = {
        "bizCode":'008',
        "drvrResdNo":obj.socialNo,
        "resPlyNo"  : obj.pNo,
        "agmtCncsAgrmReqDt":_dateUtil.GET_DATE("YYYYMMDDHHMMSS", "NONE",0),
        "reqAgmtCncsAgrmRslt":"", // 요청할때 빈값으로?
        // "reqAgmtCncsAgrmRslt":"1",
        "resAgmtCncsAgrmDt":"",
        "resAgmtCncsAgrmValidDt":""
    };


    network_api.network_h001(data).then(function(response){

        console.log("체결동의 확인 결과 ", response);



        let query = "CALL hyundaiCheck("+
            "'" + "C_S" + "'" +
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
                "'" + "C_U" + "'" +
                ", '" + hpk + "'" +
                ", '" + bpk + "'" +
                ", '" + data.drvrResdNo + "'" +
                ", '" + data.agmtCncsAgrmReqDt + "'" +
                ", '" + response.receive.reqAgmtCncsAgrmRslt + "'" +
                ", '" + response.code + "'" +
                ", '" + response.receive.resAgmtCncsAgrmDt + "'" +
                ", '" + response.receive.resAgmtCncsAgrmValidDt + "'" +
                ", '" + response.receive.reqPlyNo + "'" +
                ");";


            console.log(query);
            _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){


                console.log(result)


            });


        });



    });




}






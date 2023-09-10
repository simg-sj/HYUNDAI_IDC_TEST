const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require("../UTIL/date_lib");
const _fileUtil = require("../UTIL/file_lib");
const _apiUtil = require("../UTIL/network_lib");
const deployConfig = require("../SERVER/deploy_config.json");
const batchService = require("../SERVICES/batchService");
var network_api = require('../UTIL/network_lib');

const sConfig = require('../CONFIG/sftp_config');
const sCon = new sConfig();
let sftpConfig =sCon[deployConfig.deploy];

const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy];


var banList = [1, 6]; // 작동금지 업체



cron.schedule('*/30 * * * * *', () => {
    start();
});




async function start(){


    /** 순차실행을 이용하여 진행 **/
    for (const service of svs) {
        var schema = "";
        var bpk = "";
        schema = service.dbAccess;
        bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){
            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);
            sendList(bpk, schema);

        }else{
            console.log("제외 대상 업체 ", service.serviceName);

        }















    }




}



/*** 전송해야할 실시간 데이터 가져오기 **/
function sendList(bpk, schema){

    let job = 'L';
    let code = '';
    let msg = '';
    let rpk = '';
    let type = '';
    let query = "CALL bikeDrivingSendList(" +
        "'" + job + "'" +
        ", '" + bpk + "'" +
        ", '" + code + "'" +
        ", '" + msg + "'" +
        ", '" + rpk + "'" +
        ", '" + type + "'" +
        ");";
    // CALL bikeDrivingSendList('L', '2', '', '', '', '');


    console.log(query);
    _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
        // console.log('MYSQL RESULT : ', result[0]);
        let d = result[0];
        sendingData(d, bpk, schema);

    });


}



/*** 데이터 전송하기  **/
function sendingData(data, bpk, schema){
    let result = data;

    let obj;

    let sendStartObj = {
        "bizCode":"001",
        "resDrvrID": "",
        "resDrvgID": "",
        "resAutoNo": "",
        "resPlyNo": "",
        "resDrvgStDtm": "",
        "resRsltCd": "",
        "resRsltMsg": ""


    };
    let sendFinishObj = {
        "bizCode":"002",
        "resDrvrID": "",
        "resDrvgID": "",
        "resAutoNo": "",
        "resPlyNo": "",
        "resDrvgEdDtm": "",
        "resDrvgCancYn": "0",
        "resRsltCd": "",
        "resRsltMsg": ""

    };
    if(result.length>0){
        console.log('-----------SENDING START NOW :: ', result.length);
        for(let i=0; i<result.length; i++){
            obj = result[i];
            console.log(obj.type);



            if(obj.type=='STARTED'){
                sendStartObj.resDrvrID = obj.engi_no;
                sendStartObj.resDrvgID = obj.oprt_id;
                sendStartObj.resAutoNo = obj.vh_no;
                sendStartObj.resPlyNo = obj.plno;
                sendStartObj.resDrvgStDtm = obj.oprt_str_dttm;
                sendStartObj.rsl_cd = "";
                sendStartObj.rsl_msg = "";


                _apiUtil.network_h001(sendStartObj).then(function(result){
                    // console.log(result);
                    resultSave(result, obj.type, bpk, schema);
                });
            }else{

                sendFinishObj.resDrvrID = obj.engi_no;
                sendFinishObj.resDrvgID = obj.oprt_id;
                sendFinishObj.resAutoNo = obj.vh_no;
                sendFinishObj.resPlyNo = obj.plno;
                sendFinishObj.resDrvgEdDtm = obj.oprt_str_dttm;
                sendFinishObj.resDrvgCancYn = "0";
                sendFinishObj.rsl_cd = "";
                sendFinishObj.rsl_msg = "";

                _apiUtil.network_h001(sendFinishObj).then(function(result){
                    console.log("RESPONSE", result);
                    resultSave(result, obj.type, bpk, schema);
                });
            }


        }
    }else{
        console.log('-----------NO SENDING DATA :: ', result.length);
    }



}

/*** 응답코드 받아서 저장하기  **/
function resultSave(data, gubun, bpk, schema){

    let job,  code, msg, rpk, type;
    if(data.code=='200'){
        job = 'F';
        code = data.receive.rsl_cd;
        msg = data.receive.rsl_msg;
        rpk = data.receive.resDrvgID;
        type = gubun;

        if(data.resDrvgEdDtm){
            type = 'FINISHED'
        }


    }else{
        job = 'F';
        code = data.code;
        msg = 'DB 서버에러 ';
        rpk = data.receive.resDrvgID;
        type = 'STARTED';

        if(data.resDrvgEdDtm){
            type = 'FINISHED'
        }

    }

    let query = "CALL bikeDrivingSendList(" +
        "'" + job + "'" +
        ", '" + bpk + "'" +
        ", '" + code + "'" +
        ", '" + msg + "'" +
        ", '" + rpk + "'" +
        ", '" + type + "'" +
        ");";

    console.log(query);
    _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
        console.log('MYSQL RESULT : ', result[0]);
        let d = result[0];
        // console.log('SENT DRIVING : ', d[0].rCnt);
        if(d[0].rCnt>0){

            // console.log('SENT DRIVING : ', d[0].rpk);
            console.log('자동차 SENT DRIVING : ', "처리완료");
        }else{
            console.log('********************INNER DATA BASE ERROR------------');
        }

    });






}

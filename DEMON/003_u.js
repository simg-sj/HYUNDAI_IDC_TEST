const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require('../UTIL/date_lib');
var network_api = require('../UTIL/network_lib');

const deployConfig = require("../SERVER/deploy_config.json");
const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy]; // 테스트 운영계모드
var schema = ""; // 플랫폼 별로 변경됨

const bpk = 3; // 딜버 전용



/**
 *
 *
 * 심사 리스트 전송 하기
 *
 * 매분의 20초에 한번씩 실행
 *
 *
 *
 *
 */

svs.forEach(function(e){
    if(e.bpk == bpk){
        schema = e.dbAccess;
    }

});

// test();
// underwriteRequest();
cron.schedule('20 * * * * *', () => {
    underwriteRequest();
});








function underwriteRequest(){

    let job = 'BATCH';
    let regiGbn = 'NEW';
    let limitCount = '100000';
    let fileDay = _dateUtil.GET_DATE("YYMMDD", "NONE",0);
    let bpk = '3';
    let dpk = '';
    let dName = '';
    let result = '';
    let resultDetail = '';
    let dambo = '';
    let recvDay = '';
    let validDay = '';
    let mangi = '';

    let query = "CALL bike000012(" +
        "'" + job + "'" +
        ", '" + regiGbn + "'" +
        ", '" + limitCount + "'" +
        ", '" + fileDay + "'" +
        ", '" + bpk + "'" +
        ", '" + dpk + "'" +
        ", '" + dName + "'" +
        ", '" + result + "'" +
        ", '" + resultDetail + "'" +
        ", '" + dambo + "'" +
        ", '" + recvDay + "'" +
        ", '" + validDay + "'" +
        ", '" + mangi + "'" +
        ", '" + '_recvCode' + "'" +
        ", '" + '_recvDetailCode' + "'" +
        ", '" + '_recvFromDay' + "'" +
        ", '" + '_recvToDay' + "'" +
        ", '" + '_recvValidDay' + "'" +
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
                console.log(obj);
                sendData(obj);
                await timer(1000);
            }
            console.log("end")
        }

    });


}

function sendData(obj){






    let underwriteObj = {
        "bizCode":"004",
        "resDrvrID": "",
        "resDrvrNm": "",
        "resDrvrMpNo": "",
        "resDrvrResdNo": "",
        "resInsdPlnAgrmYN": "Y",
        "resInsdplnAgrmDt": "",
        "resInsdPlnAgrmMthd": "03",
        "resAutoNo": "",
        "resDrvgAutoTyp": "1",
        "resOwcrInsdChcYn": "",
        "resAutoOwrSameYn": "",
        "resDrvrOwrRl": "",
        "resAutoOwrNm": "",
        "resAutoOwrMpNo": "",
        "resAutoOwrResdNo": "",
        "resAutoOwrInsPlnAgrmYn": "",
        "resAutoOwrInsdPlnAgrmDt": "",
        "resAutoOwrInsdPlnAgrmNo": "",
        "resAutoOwrInsdplnAgrmMthd": "",
        "resAutoNoModYn": "N",
        "resPrevAutoNo": "",
        "resDataTrDt": "",
        "resPerinj2InsdYn": "1",
        "resObiInsdYn": "1",
        "resOwcrInsdYn": "1",
        "resPlyNo": "",
        "resAgmtEdDt": "",
        "resInsdCo": "",
        "resProdCd": "",
        "resCoprCat": "",
        "resTwhvcUsedUsage": ""
    };


    underwriteObj.resDrvrID = obj.bdpk;
    underwriteObj.resDrvrNm = obj.dName;
    underwriteObj.resDrvrMpNo = obj.cell;
    underwriteObj.resDrvrResdNo = ""; // 빈값으로 전달할것
    underwriteObj.resInsdplnAgrmDt = _dateUtil.GET_DATE("YYYYMMDDHHMMSS", "NONE",0);
    underwriteObj.resAutoNo = obj.dCarNum;
    underwriteObj.resAutoOwrResdNo = obj.socialNo;
    underwriteObj.resDataTrDt = _dateUtil.GET_DATE("YYMMDD", "NONE",0);
    underwriteObj.resAgmtEdDt = obj.reqPnoToDay; // 사전에 전달된 보험종기로만 전달해야함

    underwriteObj.resPlyNo = obj.reqPno;
    // underwriteObj.resInsdCo = String(bpk).padStart(3,'0');
    underwriteObj.resCoprCat = String(bpk).padStart(3,'0');
    underwriteObj.resProdCd = "5802";



    network_api.network_h001(underwriteObj).then(function(result){
        console.log(result);
        // resultSave(result);
    });




}




/***
 2022.07.18
 심사보내는 로직 : 배민제외 업체 통합
    실시간 심사전송


 **/
const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require("../UTIL/date_lib");
const _fileUtil = require("../UTIL/file_lib");
var underwriteRoute  = require('../ROUTES/underwriteResult');
const network_api = require('../UTIL/network_lib');
const deployConfig = require("../SERVER/deploy_config.json");
const batchService = require("../SERVICES/batchService");

const sConfig = require('../CONFIG/sftp_config');
const sCon = new sConfig();
let sftpConfig =sCon[deployConfig.deploy];

const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy];

console.log('deploy 모드 : ', deployConfig.deploy)
var banList = [1, 6]; // 작동금지 업체



// start();
cron.schedule('20 * * * * *', () => {
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
            underwriteRequest(bpk, schema )
        }else{
            console.log("제외 대상 업체 ", service.serviceName);

        }




    }




}







function underwriteRequest(bpk, schema ){

    let job = 'BATCH';
    let regiGbn = 'NEW';
    let limitCount = '100000';
    let fileDay = _dateUtil.GET_DATE("YYMMDD", "NONE",0);

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
                console.log(obj, bpk);
                sendData(obj, bpk);
                await timer(1000);
            }
            console.log("end")
        }

    });


}

function sendData(obj, bpk){





    // 전문 Object
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
        "resTwhvcUsedUsage": "",
        "resDsgn1ManOwCd" : "", // 지정1인 관계 코드 추가 [ 2024-01 ] by ICT - 오정현
    };


    underwriteObj.resDrvrID = obj.bdpk;
    underwriteObj.resDrvrNm = obj.dName;
    underwriteObj.resDrvrMpNo = obj.cell;
    underwriteObj.resDrvrResdNo = ""; // 빈값으로 전달할것
    // underwriteObj.resInsdplnAgrmDt = _dateUtil.GET_DATE("YYYYMMDDHHMMSS", "NONE",0);
    underwriteObj.resInsdplnAgrmDt = ""; // [ 2022.12.06 빈값으로 들어가야 설계동의요청시에 문제안생김 ]

    underwriteObj.resAutoNo = obj.dCarNum;
    underwriteObj.resAutoOwrResdNo = obj.socialNo;
    underwriteObj.resDataTrDt = _dateUtil.GET_DATE("YYMMDD", "NONE",0);
    underwriteObj.resAgmtEdDt = obj.reqPnoToDay; // 사전에 전달된 보험종기로만 전달해야함

    underwriteObj.resPlyNo = obj.reqPno;
    // underwriteObj.resInsdCo = String(bpk).padStart(3,'0');
    underwriteObj.resCoprCat = String(bpk).padStart(3,'0');
    underwriteObj.resProdCd = "5802";


    console.log('underwriteObj CHECK : ',underwriteObj); // 전문내용 생성
    return;

    network_api.network_h001(underwriteObj).then(function(result){
        console.log('현대 응답값', result);


        // 심사 오류 및 예외처리(슬랙푸시)
        if(result.code != 200){
            let resultMessage = result.receive.Fault.message;

            let msg = ''
            msg += '[심사오류 알림]' + '\n'
            msg += ` • 오류자 : service.serviceName ${obj.bdpk} | ${obj.dName}` + '\n'
            msg += ` • 결과코드 : ${result.code}` + '\n'
            msg += ` • 결과메세지 : ${resultMessage}` + '\n'

            let data = {
                "channel": "#개발팀",
                "username": "현대해상 시간제 보험",
                "text": msg,
                "icon_emoji": ":ghost:"
            };
            // 테스트계요청은 슬랙 처리 x
            /*
            network_api.slackWebHook(data).then(function(result){
                console.log(result);
            })
             */

            return
        }


        let res_data = {
            reqCoprCat:underwriteObj.resCoprCat,
            reqDrvrID:result.receive.reqDrvrID,
            reqDrvrNm:result.receive.reqDrvrNm,
            reqUnwrRslt:result.receive.reqUnwrRslt,
            reqUnwrRsltDet:result.receive.reqUnwrRsltDet,
            reqUnwrCpltDt:result.receive.reqUnwrCpltDt,
            reqUnwrValidDt:result.receive.reqUnwrValidDt,
            reqAutoInagAgmtEdDt:result.receive.reqAutoInagAgmtEdDt
        }

        console.log(res_data)



        underwriteRoute.UNDERWRITERESULT(res_data).then(function(result){
            console.log("심사결과 반영", result);

        })

    });




}






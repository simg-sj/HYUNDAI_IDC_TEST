const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require('../UTIL/date_lib');
var network_api = require('../UTIL/network_lib');
var cancelsignRoute  = require('../ROUTES/cancelsignResult');
const deployConfig = require("../SERVER/deploy_config.json");
const serviceList = require("../CONFIG/service_config");
const date_api = require("../UTIL/date_lib");
var services = new serviceList();
var svs = services[deployConfig.deploy]; // 테스트 운영계모드
var schema = ""; // 플랫폼 별로 변경됨

const bpk = 1; // 딜버 전용



/**
 *
 *
 * 기명 취소
 *
 * 현대는 실시간 이지만 기명취소 취소를 할수있기 떄문에 하루 한번 20시 50분 50초에 실행
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


// underwriteRequest();
// cron.schedule('50 50 20 * * *', () => {
//     cancelSignRequest();
// });

cancelSignRequest();





function cancelSignRequest(){

    let job = 'BATCH';
    let limitCount = '100000';
    let fileDay = _dateUtil.GET_DATE("YYMMDD", "NONE",0);


    let query = "CALL bike000078(" +
        "'" + job + "'" +
        ", '" + limitCount + "'" +
        ", '" + fileDay + "'" +
        ", '" + bpk + "'" +
        ", '" + '_dpk' + "'" +
        ", '" + '_policyNumber' + "'" +
        ", '" + '_dDambo' + "'" +
        ", '" + '_dSocialNo' + "'" +
        ", '" + '_dCarNum' + "'" +
        ", '" + '_resultCode' + "'" +
        ", '" + '_resultMsg' + "'" +
        ", '" + '_resultDambo' + "'" +
        ", '" + '_resultSday' + "'" +
        ", '" + '_resultEday' + "'" +
        ", '" + '_resultValidDay' + "'" +
        ");";

    console.log("query is ::::: ", query)
    _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
        // console.log('MYSQL RESULT : ', result[0]);
        let data = result[0];
        let valueRow = data;

        /** 비동기 처리 ***/
        const timer = ms => new Promise(res=>setTimeout(res,ms))
        load(valueRow);
        async function load(valueRow){
            let obj;
            for(var i=0; i< valueRow.length; i++){
                obj = valueRow[i];
                console.log("obj is ::::::", obj);
                sendData(obj);
                await timer(1000);
            }
            console.log("end")
        }

    });


}

function sendData(obj){

    /*
    * 기명취소 정상 전문
    *
    */

    let cancelSignObj = {
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
        "resTermYn": "1" // 신규심사요청시에는 빈값 ~/ 기명취소요청은 1
    };


    cancelSignObj.resDrvrID = obj.bdpk;
    cancelSignObj.resDrvrNm = obj.dName;
    cancelSignObj.resDrvrMpNo = obj.cell;
    cancelSignObj.resDrvrResdNo = ""; // 빈값으로 전달할것
    // underwriteObj.resInsdplnAgrmDt = _dateUtil.GET_DATE("YYYYMMDDHHMMSS", "NONE",0);

    cancelSignObj.resInsdplnAgrmDt = ""; // [ 2022.12.06 빈값으로 들어가야 설계동의요청시에 문제안생김 ]



    cancelSignObj.resAutoNo = obj.dCarNum;
    cancelSignObj.resAutoOwrResdNo = obj.socialNo;
    cancelSignObj.resDataTrDt = _dateUtil.GET_DATE("YYMMDD", "NONE",0);
    cancelSignObj.resAgmtEdDt = obj.pNoToDay; // 사전에 전달된 보험종기로만 전달해야함

    cancelSignObj.resDrvrOwrRl = obj.relation;  // resDrvrOwrRl 을 관계코드로 활용 [ 2024-01 ]
    cancelSignObj.resPlyNo = obj.pNo;
    // cancelSignObj.resInsdCo = String(bpk).padStart(3,'0');
    cancelSignObj.resCoprCat = String(bpk).padStart(3,'0');
    cancelSignObj.resProdCd = "5802";
    if(obj.bdSoyuja === 'bonin'){ // 본인인경우
        console.log('본인소유자')
        cancelSignObj.resDrvrOwrRl = ""; // 본인인경우 공백
    }else{  //본인이 아닌경우 [ 지정 1인 인 경우 ]
        console.log('타인소유자')
        cancelSignObj.resDrvrOwrRl = obj.relation;  // resDrvrOwrRl 을 관계코드로 활용 [ 2024-01 ]
    }

    console.log('cancelSignObj : ', cancelSignObj); // 전송전문 확인

    network_api.network_h001(cancelSignObj).then(function(result){
        console.log('현대 응답값 check 1 : ', result);


        // 심사 오류 및 예외처리(슬랙푸시)
        if(result.code != 200){
            let resultMessage = result.receive.Fault.message;

            let msg = ''
            msg += '[심사오류 알림]' + '\n'
            msg += ` • 오류자 : 배민 ${obj.bdpk} | ${obj.dName}` + '\n'
            msg += ` • 결과코드 : ${result.code}` + '\n'
            msg += ` • 결과메세지 : ${resultMessage}` + '\n'

            let data = {
                "channel": "#ict팀",
                "username": "현대해상 시간제 보험",
                "text": msg,
                "icon_emoji": ":ghost:"
            };

            network_api.simg_slackWebHook(data).then(function(result){
                console.log(result);
            })

            return
        }



        let res_data = {
            reqCoprCat:cancelSignObj.resCoprCat,
            reqDrvrID:result.receive.reqDrvrID,
            reqDrvrNm:result.receive.reqDrvrNm,
            reqUnwrRslt:result.receive.reqUnwrRslt,
            reqUnwrRsltDet:result.receive.reqUnwrRsltDet,
            reqUnwrCpltDt:result.receive.reqUnwrCpltDt,
            reqUnwrValidDt:result.receive.reqUnwrValidDt,
            reqAutoInagAgmtEdDt:result.receive.reqAutoInagAgmtEdDt,
            reqErrTypCd:result.receive.reqErrTypCd,
        }

        console.log('현대 응답값 check 2 : ',res_data);



        cancelsignRoute.CANCELSIGNRESULT(res_data).then(function(result){
             console.log("기명취소 결과 반영", result);

        })


    });

}




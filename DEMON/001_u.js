const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require('../UTIL/date_lib');
var network_api = require('../UTIL/network_lib');
var underwriteRoute  = require('../ROUTES/underwriteResult');
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


// underwriteRequest();
cron.schedule('20 * * * * *', () => {
    underwriteRequest();
});


underwriteRequest();





function underwriteRequest(){

    let job = 'BATCH';
    let regiGbn = 'NEW';
    let limitCount = '100000';
    let fileDay = _dateUtil.GET_DATE("YYMMDD", "NONE",0);
    // let bpk = bpk;
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
        // console.log('MYSQL RESULT : ', result[0]);
        let data = result[0];
        let valueRow = data;
        console.log('batch count : ',data.length);

        /** 비동기 처리 ***/
        const timer = ms => new Promise(res=>setTimeout(res,ms))
        load(valueRow);
        async function load(valueRow){
            let obj;
            for(var i=0; i< valueRow.length; i++){
                obj = valueRow[i];
                // console.log(obj);
                sendData(obj);
                await timer(1000);
            }
            console.log("end")
        }

    });


}

function sendData(obj){





    // 전송 전문~ Object 정의
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
        "resDrvrOwrRl": "", // 지정1인 관계 코드 추가 [ 2024-01 ] by ICT - 오정현
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
    if(obj.bdSoyuja === 'bonin'){ // 본인인경우
        underwriteObj.resDrvrOwrRl = ""; // 본인인경우 공백
    }else{  //본인이 아닌경우 [ 지정 1인 인 경우 ]
        underwriteObj.resDrvrOwrRl = obj.relation;  // resDrvrOwrRl 을 관계코드로 활용 [ 2024-01 ]
    }

    // console.log('underwriteObjRength : ', underwriteObj.length)
    console.log('underwriteObj : ', underwriteObj); // 전송전문 확인
    // return;
    network_api.network_h001(underwriteObj).then(function(result){
        console.log('현대 응답값', result);


        // 심사 오류 및 예외처리(슬랙푸시)
        if(result.code != 200){
            let resultMessage = result.receive.Fault.message;

            let msg = ''
            msg += '[심사오류 알림]' + '\n'
            msg += ` • 오류자 : 배민 ${obj.bdpk} | ${obj.dName}` + '\n'
            msg += ` • 결과코드 : ${result.code}` + '\n'
            msg += ` • 결과메세지 : ${resultMessage}` + '\n'

            let data = {
                "channel": "#개발팀",
                "username": "현대해상 시간제 보험",
                "text": msg,
                "icon_emoji": ":ghost:"
            };

            network_api.slackWebHook(data).then(function(result){
                console.log(result);
            })

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
            reqAutoInagAgmtEdDt:result.receive.reqAutoInagAgmtEdDt,
            reqErrTypCd:result.receive.reqErrTypCd,
        }

        console.log(res_data)



        underwriteRoute.UNDERWRITERESULT(res_data).then(function(result){
            console.log("심사결과 반영", result);

        })


    });




}




/***
 *
 *
 * 갱신 스케쥴러
 *
 *
 *
 *
 *
 *
 *
 */
const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require("../UTIL/date_lib");
const _fileUtil = require("../UTIL/file_lib");
const deployConfig = require("../SERVER/deploy_config.json");
const underwriteService = require("../SERVICES/underwriteService");

const sConfig = require('../CONFIG/sftp_config');
const sCon = new sConfig();
let sftpConfig =sCon[deployConfig.deploy];

const serviceList = require("../CONFIG/service_config");
const _apiUtil = require("../UTIL/network_lib");
const _kakaoMsg = require("../UTIL/kakao_lib");
const network_api = require("../UTIL/network_lib");
const _baseUtil = require("../UTIL/base_lib");
var services = new serviceList();
var svs = services[deployConfig.deploy];
var banList = [2]; // 작동금지 업체
// 1,9,10

const timer = ms => new Promise(res=>setTimeout(res,ms));

let active = []
let inactive = []
for (const service of svs) {
    let bpk = service.bpk;
    if (banList.indexOf(bpk) < 0) {
        active.push(service.serviceName)
    } else {
        inactive.push(service.serviceName)
    }
}
console.log("작동업체: ", active.toString())
console.log("제외업체: ", inactive.toString())

// var day = _dateUtil.GET_DATE("YYMMDD", "DAY",0);


// R001_setRenewalPeriod();
// R002_setRenewalList();

// sendAgreeURL()

// R001_setRenewalPeriod();
// R002_setRenewalList();
/*
R008_initRenewalFailedMember()
R009_updatePolicyNumber()
R010_updateFileResult()
sendAgreeURL() // 설계동의 요청 알림톡 발송
renwalSignedDataLIST(); // 갱신결과 결과전송테이블에 적재
*/
// renwalSignedDataLIST(); // 갱신결과 결과전송테이블에 적재
// R010_updateFileResult();

cron.schedule('0 0 05 01 * *', () => { // 매달 1일 05시 심사기간 적재
    R001_setRenewalPeriod(); // R001 심사기간 적재 policyDet
});

cron.schedule('0 0 06 01 * *', () => { // 매달 1일 06시 심사대상자 분류
    R002_setRenewalList(); // R002 심사대상자 bikeRenewal 적재
});

cron.schedule('50 00 00 * * *', () => { // 매일 00시 50분에 어제 신규통과자 적재
    R005_addNewListToRenewal(); // 신규심사 신청자 적재
});


cron.schedule('30 01 10 01-20 * *', () => { // 매일 10시 01분 개인정보동의 알림톡 발송
    R003_kakao_send(); // 개인정보동의 알림톡 발송
});

cron.schedule('30 00 09 * * *', () => {
    R010_updateFileResult(); // R10 갱신정보 맵핑작업
});

cron.schedule('50 20 08 01 * *', () => { // 매월 1일 출근전에
    // 갱신 심사파일 결과를 심사테이블에 적재한다.
    // 갱신 심사결과 bikeRenewal 에 업데이트 newState
    R007_saveRenewalUnderwriteLog(); //갱신기간종료 후 익일 바로 실행
});

cron.schedule('55 25 08 01 * *', () => {
    // 갱신 실패인원 데이터 반영
    // 갱신 심사 거절자 정보 초기화 [ bikeDriverMaster REJECTED ]
    R008_initRenewalFailedMember(); //갱신기간종료 후 익일 바로 실행
});

cron.schedule('50 35 08 01 * *', () => {
    R009_updatePolicyNumber(); //갱신기간마지막일 함수실행 시 이벤트작동
});
/*



*/
// R007_saveRenewalUnderwriteLog();
// R008_initRenewalFailedMember();
// R009_updatePolicyNumber();
/*




cron.schedule('50 05 00', ()=>{
    R010_updateFileResult()
})




cron.schedule('50 50 15 * * *', () => {
    // 갱신 심사파일 결과를 심사테이블에 적재한다.
    R007_saveRenewalUnderwriteLog(); //갱신기간종료 후 익일 바로 실행
});



cron.schedule('50 10 00 * * *', () => {
    renwalSignedDataLIST // 갱신기간 말일에 실행하기

    // 갱신결과를 결과전송테이블에 전송하는 로직
    // 실행시점 : 기사테이블에 갱신데이터 업데이트 한 뒤에 결과전송테이블에 적재가 되어야한다.
})
*/
// R001_setRenewalPeriod(); // 갱신기간 설정
// R002_setRenewalList(); // 갱신대상자 분류 [ 개인정보동의만기 기준 ]
// R003_kakao_send(); // 개인정보동의 알림톡 발송
// R005_addNewListToRenewal(); // 갱신대상자 분류이후 신규심사 들어온 라이더 추가 적재
// R006_cancelListOutOfRenewal(); // 기명취소자 갱신대상에서 제외처리
// R007_saveRenewalUnderwriteLog(); // 갱신심사결과 bikeUnderwrite에 적재 [ cs팀에서 갱신심사결과 확인할 수 있게 ]
// R010_updateFileResult();


async function R001_setRenewalPeriod() {

    for (const service of svs) {
        let schema = service.dbAccess;
        let bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){

            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);

        }else{
            console.log("제외 대상 업체 ", service.serviceName);

            continue

        }


        let query = "CALL bikeRenewal_Bulk('R001', '" +  bpk + "', 'bdpk','dpk', 'dName','dCell','dJumin','dCarNum','dDambo','dMangi','dSoyuja','soyujaName','soyujaCell','soyujaJumin','carType','relation','planCi','planCi2','','','');";

        console.log('query :', query)

        let mysqlResult = await _mysqlUtil.mysql_proc_exec(query, schema)
        console.log(mysqlResult)
        let result = mysqlResult[0][0];


        let {code, msg, renewalSday, renewalEday} = result


        let slackMessage ='[갱신기간설정 : R001] 실행'+`\n`
        slackMessage += `• 업체코드 : ${service.bpk}`+`\n`
        slackMessage += `• 업체이름 : ${service.serviceName}`+`\n`

        if (code === '200') {
            slackMessage += `• 결과 : ${msg}`+`\n`;
            slackMessage += `• 갱신기간 : ${renewalSday} ~ ${renewalEday}`+`\n`
        } else {
            slackMessage += `• 결과 : ${msg}`+`\n`

            if (code === '300') {
                slackMessage += `• 갱신기간 : ${renewalSday} ~ ${renewalEday}`+`\n`
            }
        }

        await slackAlarmStart(slackMessage)
        await timer(5000)

    }
}


async function R002_setRenewalList() {

    for (const service of svs) {

        let schema = service.dbAccess;
        let bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){

            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);

        }else{
            console.log("제외 대상 업체 ", service.serviceName);

            continue

        }


        let query = "CALL bikeRenewal_Bulk('R002', '" +  bpk + "', 'bdpk','dpk', 'dName','dCell','dJumin','dCarNum','dDambo','dMangi','dSoyuja','soyujaName','soyujaCell','soyujaJumin','carType','relation','planCi','planCi2','','','');";
        console.log('query :', query)


        let mysqlResult = await _mysqlUtil.mysql_proc_exec(query, schema)
        console.log(mysqlResult)

        let result = mysqlResult[0][0];

        let {rCnt, msg} = result



        let slackMessage ='[+ ' + service.serviceName + '갱신인원 선별 : R002] 실행'+`\n`
        if (rCnt > 0) {
            slackMessage += `• 결과 : ${msg}`+`\n`
            slackMessage += `• 선별인원 수 : ${rCnt}명`

        } else {
            slackMessage += `• 결과 : ${msg}`+`\n`
        }

        await slackAlarmStart(slackMessage)
        await timer(5000)
    }
}





async function R005_addNewListToRenewal() {
    for (const service of svs) {

        let schema = service.dbAccess;
        let bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){

            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);

        }else{
            console.log("제외 대상 업체 ", service.serviceName);

            continue

        }

        let query = "CALL bikeRenewal_Bulk ('R005', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";
        let mysqlResult = await _mysqlUtil.mysql_proc_exec(query, schema)
        console.log(mysqlResult)
        let result = mysqlResult[0][0];

        let {msg, rCnt} = result

        let slackMessage ='[신규인원 갱신대상자 추가 : R005] 결과'+`\n`
                    + `• 서비스코드 : ${service.bpk}`+`\n`
                    + `• 플랫폼 : ${service.serviceName}`+`\n`
                    + `• 결과 : ${msg}`+`\n`
                    + `• 추가 인원 수 : ${rCnt}명`


        await slackAlarmStart(slackMessage)
        await timer(5000)

    }
}


async function R006_cancelListOutOfRenewal() {
    for (const service of svs) {
        let schema = service.dbAccess;
        let bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){

            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);

        }else{
            console.log("제외 대상 업체 ", service.serviceName);

            continue

        }

        let query = "CALL bikeRenewal_Bulk ('R006', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";

        let mysqlResult = await _mysqlUtil.mysql_proc_exec(query, schema)
        console.log(mysqlResult)
        let result = mysqlResult[0][0];

        let {msg, rCnt} = result

        let slackMessage ='[기명취소인원 갱신 제외 : R006] 결과'+`\n`
                        + `• 서비스코드 : ${service.bpk}`+`\n`
                        + `• 플랫폼 : ${service.serviceName}`+`\n`
                        + `• 결과 : ${msg}`+`\n`
                        + `• 제외 인원 수 : ${rCnt}명`


        await slackAlarmStart(slackMessage)
        await timer(5000)

    }
}

async function R007_saveRenewalUnderwriteLog() {
    for (const service of svs) {
        let schema = service.dbAccess;
        let bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){

            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);

        }else{
            console.log("제외 대상 업체 ", service.serviceName);

            continue

        }

        let query = "CALL bikeRenewal_bulk ('R007', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";
        let mysqlResult = await _mysqlUtil.mysql_proc_exec(query, schema)
        console.log(mysqlResult)
        let result = mysqlResult[0][0];

        let {msg, rCnt} = result

        let slackMessage ='[갱신인원 선별 : R007] 실행'+`\n`
                        + `• 업체코드 : ${service.bpk}`+`\n`
                        + `• 업체이름 : ${service.serviceName}`+`\n`
                        + `• 결과 : ${msg}`+`\n`
                        + `• 인원 : ${rCnt}명`





        await slackAlarmStart(slackMessage)
        await timer(5000)

    }
}

async function R008_initRenewalFailedMember() {
    for (const service of svs) {

        let schema = service.dbAccess;
        let bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){

            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);

        }else{

            console.log("제외 대상 업체 ", service.serviceName);

            continue

        }

        let query = "CALL bikeRenewal ('R008', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";

        let mysqlResult = await _mysqlUtil.mysql_proc_exec(query, schema)
        console.log(mysqlResult)
        let result = mysqlResult[0][0];

        let {msg, rCnt, renewalSDay, checkDay} = result

        let slackMessage ='[갱신실패인원 기사정보 초기화 : R008] 실행'+`\n`
                        + `• 업체코드 : ${service.bpk}`+`\n`
                        + `• 업체이름 : ${service.serviceName}`+`\n`
                        + `• 결과 : ${msg}`+`\n`
                        + `• 인원 수 : ${rCnt}명`


        await slackAlarmStart(slackMessage)
        await timer(5000)

    }
}


// 갱신
async function R009_updatePolicyNumber() {
    for (const service of svs) {

        let schema = service.dbAccess;
        let bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){

            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);

        }else{

            console.log("제외 대상 업체 ", service.serviceName);

            continue

        }

        let query = "CALL bikeRenewal ('R009', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";

        let mysqlResult = await _mysqlUtil.mysql_proc_exec(query, schema)
        console.log(mysqlResult)
        let result = mysqlResult[0][0];

        /** 메시지 작성 미완 **/
        let {rCnt, msg} = result

        let slackMessage ='[기사 갱신심사 고유키 업데이트 : R009] 실행'+`\n`
                        + `• 업체코드 : ${service.bpk}`+`\n`
                        + `• 업체이름 : ${service.serviceName}`+`\n`
                        + `• 결과 : ${msg}`+`\n`
                        + `• 인원 : ${rCnt}`+`\n`


        await slackAlarmStart(slackMessage)
        await timer(5000);
    }
}

/**
 * 갱신마지막날 갱신테이블(bikeRenewal) 에 갱신증권 정보 입력(입력대상 : 갱신심사통과자)하고,
 * bikeDriverMaster의 증권정보도 맵핑한다.
 * */
async function R010_updateFileResult() {
    var BUSINESSDAY = _dateUtil.GET_DATE("YYMMDD", "NONE",0);
    let lastDatCheck = isLastDayOfMonth(BUSINESSDAY);
    console.log('갱신 마지막날 체크 : ', lastDatCheck);

    if(lastDatCheck){
        for (const service of svs) {

            let schema = service.dbAccess;
            let bpk = service.bpk;

            if (banList.indexOf(bpk) < 0) {

                console.log("작동 대상 업체 ", service.serviceName);
                console.log("작동 대상 업체 ", bpk);

            } else {

                console.log("제외 대상 업체 ", service.serviceName);

                continue

            }

            let query = "CALL bikeRenewal_Bulk ('R010', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";
            console.log('R010 query : ', query);
            let mysqlResult = await _mysqlUtil.mysql_proc_exec(query, schema)
            console.log('R010 RESULT : ',mysqlResult);
            let result = mysqlResult[0][0];

            let {msg, rCnt, renewalSday, renewalEday, renewalPno} = result

            let slackMessage ='[파일 심사요청자 결과 업데이트 : R010] 실행'+`\n`
                + `• 업체코드 : ${service.bpk}`+`\n`
                + `• 업체이름 : ${service.serviceName}`+`\n`
                + `• 결과 : ${msg}`+`\n`
                + `• 인원 : ${rCnt}`+`\n`

            if (rCnt > 0) {
                slackMessage += `• 갱신증권 시기 : ${renewalSday}`+`\n`
                    + `• 갱신증권 종기 : ${renewalEday}`+`\n`
                    + `• 갱신증권 번호 : ${renewalPno}`+`\n`
            }


            await slackAlarmStart(slackMessage)
            await timer(5000);

        }
    }else{
        console.log(BUSINESSDAY, '- R010 실행 x');
    }

}

async function renwalSignedDataLIST() {
    for (const service of svs) {

        let schema = service.dbAccess;
        let bpk = service.bpk;

        if (banList.indexOf(bpk) < 0) {

            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);

        } else {

            console.log("제외 대상 업체 ", service.serviceName);

            continue

        }

        let job = 'RENEWLIST';
        var BUSINESSDAY = _dateUtil.GET_DATE("YYMMDD", "NONE",0);
        let query = "CALL bikeResult(" +
            "'" + job + "'" +
            ", '" + '10000' + "'" +
            ", '" + BUSINESSDAY + "'" +
            ", '" + 'RENEW' + "'" +
            ", '" + bpk + "'" +
            ", '" + '_dpk' + "'" +
            ", '" + '_dpk' + "'" +
            ", '" + '_dNo' + "'" +
            ", '" + '_pNo' + "'" +
            ", '" + 'requestTime' + "'" +
            ");";
        console.log(query);
        // return;
        let mysqlResult = await _mysqlUtil.mysql_proc_exec(query, schema)
        console.log(mysqlResult)
        let result = mysqlResult[0][0];

        let {msg, rCnt } = result

        let slackMessage ='[갱신대상자 전송리스트 적재 : RENEWLIST] 실행'+`\n`
                        + `• 업체코드 : ${service.bpk}`+`\n`
                        + `• 업체이름 : ${service.serviceName}`+`\n`
                        + `• 결과 : ${msg}`+`\n`
                        + `• 인원 : ${rCnt}`+`\n`

        await slackAlarmStart(slackMessage)
        await timer(5000);

    }
}




async function slackAlarmStart(slackMessage){

    let data = {
        "channel": "#개발팀_push메세지",
        "username": "현대해상 시간제 보험_갱신봇",
        "text": slackMessage,
        "icon_emoji": ":ghost:"
    };

    await _apiUtil.simg_slackWebHook(data).then(function(result){
        console.log(result);
    })
}


async function R003_kakao_send() {
    console.log('R003 START');
    let serviceName = "";
    for (const service of svs) {

        let schema = service.dbAccess;
        let bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){

            console.log("작동 대상 업체 ", service.serviceName);
            serviceName = service.serviceName;
            console.log("작동 대상 업체 ", bpk);

        }else{
            console.log("제외 대상 업체 ", service.serviceName);

            continue

        }

        // return;
        let query = "CALL bikeRenewal_Bulk('R003', '" +  bpk + "', 'bdpk','dpk', 'dName','dCell','dJumin','dCarNum','dDambo','dMangi','dSoyuja','soyujaName','soyujaCell','soyujaJumin','carType','relation','planCi','planCi2','','','');";
        console.log('QUERY : ', query);

        let result = await _mysqlUtil.mysql_proc_exec(query, schema);
        console.log('result : ', result);
        let data = result[0];
        console.log('data : ', data);
        console.log("rCnt : ", data[0].rCnt);

        // if(data[0].rCnt == ''){
        //     console.log('보낼 대상 없음');
        //     return;
        // }

        if (data[0].rCnt > 0) {
            let valueRow = data;


            /** 비동기 처리 ***/
            const timer = ms => new Promise(res => setTimeout(res, ms));
            // load(valueRow);
            // async function load(valueRow){
            let obj;
            for (var i = 0; i < valueRow.length; i++) {
                obj = valueRow[i];
                // console.log(obj);
                // console.log('serviceName is : ',serviceName);
                // console.log('obj is :',obj);
                sendData(obj, bpk, schema, serviceName);
                // console.log(obj);
                await timer(1000);
            }
            console.log("end")
            // }

            // let data = {
            //     "channel": "#개발팀",
            //     "username": "현대해상 시간제 보험",
            //     "text": slackMessage,
            //     "icon_emoji": ":ghost:"
            // };

            // _apiUtil.slackWebHook(data).then(function(result){
            //     console.log(result);
            // })
        }


    }
}

async function sendData(obj, bpk, schema, serviceName){




    let data = {
        platform:serviceName,
        cell:obj.cell,
        dName:obj.bdName,
        dCarNum:obj.bdCarNum,
        limitDay:obj.limitDay,
        // url : 'https://mdirect.hi.co.kr/service.do?m=3c8865986a&cnc_no=654&media_no=B648&companyId=654'
        url : 'https://mdirect.hi.co.kr/service.do?m=3c8865986a%26cnc_no=654%26media_no=B648%26companyId=654'
    };
    // console.log('msgSendData : ', data);
    // return;

    let msg = _kakaoMsg.baemin008(data);


    network_api.sendAligoKakao(msg).then(function(data){

        console.log('RESPONSE :', data);


        let job = 'RS';
        let dpk = "0";
        let dCell = obj.cell;
        let dName = "";
        let dDambo = "";
        let dCarNum = "";
        let pState = "BIKE_AGREE_RENEWAL_MSG";

        msg = JSON.stringify(msg);
        let fileDay = _baseUtil.getTimeyymmddhhmmss('dash');

        let query = "CALL bikeKakaoSendRS(" +
            "'" + job + "'" +
            ", '" + bpk + "'" +
            ", '" + dpk + "'" +
            ", '" + dCell + "'" +
            ", '" + dName + "'" +
            ", '" + dDambo + "'" +
            ", '" + dCarNum + "'" +
            ", '" + msg + "'" +
            ", '" + pState + "'" +
            ", '" + fileDay + "'" +
            ");";



        console.log(query);
        _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
            // res.json(result)
            console.log('MYSQL RESULT : ', result[0]);
            let d = result[0][0];

            let resData  ={
                rCnt : d.rCnt,
                spk : d.spk,
                receiver : d.receiver,
                testmode : d.testmode
            };

            // res.json(resData);

        });

    });


}


async function updateExpiredDriverData() {
    for (const service of svs) {

        let schema = service.dbAccess;
        let bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){

            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);

        }else{
            console.log("제외 대상 업체 ", service.serviceName);

            continue

        }

    }
}

/*
* 갱신마지막일 감지 함수
* */
function isLastDayOfMonth(dateString) {
    // 주어진 문자열을 Date 객체로 변환
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // 월은 0부터 시작하므로 -1
    const day = parseInt(dateString.substring(6, 8), 10);
    const givenDate = new Date(year, month, day);

    // 다음 날을 계산
    const nextDay = new Date(givenDate);
    nextDay.setDate(givenDate.getDate() + 1);

    // 다음 날의 월이 다른지 확인
    return nextDay.getMonth() !== givenDate.getMonth();
}

/*
* 매 달 1일을 감지 [ R007 ~ R009 ] 에서 처리
*
* */
function isFirstDayOfMonth(dateString) {
    // 주어진 문자열을 Date 객체로 변환
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // 월은 0부터 시작하므로 -1
    const day = parseInt(dateString.substring(6, 8), 10);
    const givenDate = new Date(year, month, day);

    // 해당 날짜가 1일인지 확인
    return givenDate.getDate() === 1;
}
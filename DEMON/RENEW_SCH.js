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
var banList = [ 2,4,6,7,8,9 ]; // 작동금지 업체


const timer = ms => new Promise(res=>setTimeout(res,ms));


// var day = _dateUtil.GET_DATE("YYMMDD", "DAY",0);


/*
R001_setRenewalPeriod()
R002_setRenewalList()
R006_cancelListOutOfRenewal();
R008_initRenewalFailedMember()
R009_updatePolicyNumber()
R010_updateFileResult()
sendAgreeURL() // 설계동의 요청 알림톡 발송
renwalSignedDataLIST(); // 갱신결과 결과전송테이블에 적재
*/


cron.schedule('50 16 17 * * *', () => {
    R001_setRenewalPeriod();
});

cron.schedule('50 33 17 * * *', () => {
    R002_setRenewalList();
});

cron.schedule('50 00 00 * * *', () => {
    R005_addNewListToRenewal();  // 00시 30분 이전으로 변동해야함 작성일시 2022-10-31 정훈
});

/*


cron.schedule('50 01 17 * * *', () => {
    R006_cancelListOutOfRenewal();
});

cron.schedule('50 05 00', ()=>{
    R010_updateFileResult()
})


cron.schedule('50 18 16 * * *', () => {
    R009_updatePolicyNumber(); //갱신기간마지막일 함수실행 시 이벤트작동
});

cron.schedule('50 50 15 * * *', () => {
    // 갱신 심사파일 결과를 심사테이블에 적재한다.
    R007_saveRenewalUnderwriteLog(); //갱신기간종료 후 익일 바로 실행
});

cron.schedule('50 10 00 * * *', () => {
    // 갱신 실패인원 데이터 반영
    R008_initRenewalFailedMember(); //갱신기간종료 후 익일 바로 실행
});

cron.schedule('50 10 00 * * *', () => {
    renwalSignedDataLIST // 갱신기간 말일에 실행하기
})
*/


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


        let query = "CALL bikeRenewal ('R001', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";

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


        let query = "CALL bikeRenewal ('R002', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";
        console.log('query :', query)


        let mysqlResult = await _mysqlUtil.mysql_proc_exec(query, schema)
        console.log(mysqlResult)

        let result = mysqlResult[0][0];

        let {rCnt, msg} = result



        let slackMessage ='[갱신인원 선별 : R002] 실행'+`\n`
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

        let query = "CALL bikeRenewal ('R005', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";
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

        let query = "CALL bikeRenewal ('R006', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";

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

        let query = "CALL bikeRenewal ('R007', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";
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


async function R010_updateFileResult() {
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

        let query = "CALL bikeRenewal ('R010', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";

        let mysqlResult = await _mysqlUtil.mysql_proc_exec(query, schema)
        console.log(mysqlResult)
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
        "channel": "#개발팀",
        "username": "현대해상 시간제 보험",
        "text": slackMessage,
        "icon_emoji": ":ghost:"
    };

    await _apiUtil.slackWebHook(data).then(function(result){
        console.log(result);
    })
}


async function R003() {
    for (const service of svs) {

        let schema = service.schema;
        let bpk = service.bpk;

        let query = "CALL bikeRenewal ('R003', '" + bpk + ", '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_pi2', '_startDay', '_endDay', '_primaryKey'";

        let result = await _mysqlUtil.mysql_proc_exec(query, schema)
        console.log(mysqlResult)
        let data = result[0];
        let valueRow = data;


        /** 비동기 처리 ***/
        const timer = ms => new Promise(res=>setTimeout(res,ms));
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

        function sendData(obj){




            let data = {
                platform:bizInfo.serviceName,
                cell:obj.cell,
                dName:obj.bdName,
                dCarNum:obj.bdCarNum,
                url:bizInfo.agreeUrl
            };
            let msg = _kakaoMsg.baemin004(data);


            network_api.sendAligoKakao(msg).then(function(data){

                console.log('RESPONSE :', data);


                let job = 'RS';
                let dpk = "0";
                let dCell = obj.cell;
                let dName = "";
                let dDambo = "";
                let dCarNum = "";
                let pState = "BIKE_AGREE_MSG";

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


        // let data = {
        //     "channel": "#개발팀",
        //     "username": "현대해상 시간제 보험",
        //     "text": slackMessage,
        //     "icon_emoji": ":ghost:"
        // };

        _apiUtil.slackWebHook(data).then(function(result){
            console.log(result);
        })

    }
}


/**
 *
 * 작성일 : 2022-11-22
 * 작성자 : 이정훈
 * 함수설명 : 배민 11월 만기 증권의 기명된 기사분들 중 설계동의 값이 무효된 인원 약 2400명 인원이 확인되었다.
 *          해당 인원에게 설계동의를 요청하기 위해서 알림톡을 발송한다.
 *
 * @returns {Promise<void>}
 */
async function sendAgreeURL() {

    for (const service of svs) {


        // 배민만 전송한다.
        if(service.bpk !== 1){
          continue
        }
        console.log('작동 서비스 ::', service);




        let schema = service.dbAccess;
        let bpk = service.bpk;

        let query = "CALL bikeRenewal ('R003', '" + bpk + "', '_dpk', '_bdpk', '_dName', '_dCell', '_dJumin', '_dCarNum', '_dDambo', '_dMangi', '_dSoyuja', '_soyujaName', '_soyujaCell',' soyujaJumin','_carType',' _relation', '_pi1', '_pi2', '_startDay', '_endDay', '_primaryKey')";

        let mysqlResult = await _mysqlUtil.mysql_proc_exec(query, schema)
        console.log(mysqlResult)
        let data = mysqlResult[0];
        let valueRow = data;
        console.log(valueRow)




        /** 비동기 처리 ***/

        const timer = ms => new Promise(res => setTimeout(res, ms));
        load(valueRow);

        async function load(valueRow) {
            console.log('LENGTH : ',valueRow.length)
            let obj;
            for (var i = 0; i < valueRow.length; i++) {
            // for (var i = 0; i < 2; i++) {
                obj = valueRow[i];
                // console.log('i :: ', i);
                sendData(obj);
                await timer(1000);
            }
            console.log("end")
        }




        function sendData(obj){

            let data = {
                platform:service.serviceName,
                cell:obj.cell,
                // cell:'01063000205',
                dName:obj.bdName,
                dCarNum:obj.bdCarNum,
                url:service.agreeUrl
            };
            let msg = bike007(data);


            network_api.sendAligoKakao(msg).then(function(data){

                console.log('RESPONSE :', data);


                let job = 'RS';
                let dpk = "0";
                let dCell = obj.cell;
                let dName = "";
                let dDambo = "";
                let dCarNum = "";
                let pState = "BIKE_AGREE_MSG";

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



        function bike007 (data){
            console.log(data);
            let platform = data.platform;
            let cell = data.cell;
            let dName = data.dName;
            let carNum = data.dCarNum;
            let url = data.url;

            let infoMsg = "신규 가입 시 진행하셨던 개인정보 제공 동의 시효가 만료되어, 아래 URL에서 본인 인증동의 부탁드립니다.\n\n" +
                "동의 완료 시, 보험 갱신 심사가 진행됩니다.\n\n";
            infoMsg += "* 동의를 하지 않으실 경우, 11월 30일까지만 운행가능하오니 이 점 양해 부탁드립니다.\n\n"
            infoMsg += url

            return  {
                "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
                "ALIGO_USER_ID":"yoojjtt",
                "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
                "token":"",
                "templateCode":"tpl_code=TI_8231",
                "sender":"sender=18773006",
                "receiver":"receiver_1="+cell,
                "subject":"subject_1=현대해상 시간제보험 개인정보 제공동의 안내",
                "message":"message_1="+
                    "안녕하세요, 현대해상 오토바이 시간제보험안내 채널입니다.\n" +
                    "\n" +
                    "개인정보 제공 동의절차가 필요하여 안내드립니다.\n" +
                    "\n" +
                    infoMsg+"\n" +
                    "\n" +
                    "■ 신청 정보\n" +
                    "- 플랫폼 : "+platform+"\n" +
                    "- 신청자명 : "+dName+"\n" +
                    "- 차량번호 : "+carNum+"\n" ,

                "failover":"Y",
                "fsubject_1":"현대해상 시간제보험 개인정보 제공동의 안내",
                "fmessage_1":
                    "안녕하세요, 현대해상 오토바이 시간제보험안내 채널입니다.\n" +
                    "\n" +
                    "개인정보 제공 동의절차가 필요하여 안내드립니다.\n" +
                    "\n" +
                    infoMsg+"\n" +
                    "\n" +
                    "■ 신청 정보\n" +
                    "- 플랫폼 : "+platform+"\n" +
                    "- 신청자명 : "+dName+"\n" +
                    "- 차량번호 : "+carNum+"\n"

            };
        }


    }


}
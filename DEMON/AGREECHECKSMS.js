/***
 2022.07.18
 동의 일자체크하고 안되있으면 SMS 발송할것





 **/

const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require('../UTIL/date_lib');
const _baseUtil = require('../UTIL/base_lib');
const network_api = require('../UTIL/network_lib');
const _kakaoMsg = require('../UTIL/kakao_lib');
const deployConfig = require("../SERVER/deploy_config.json");
const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy]; // 테스트 운영계모드














// 통과인 인원중에 동의안한사람 상시보낼것
cron.schedule('10 40 09 * * *', () => {
    start(0);
});

// 통과인 인원중에 한번 보내는데 동의안한사람 아침 9시 50분 10초에 다시보낼것
cron.schedule('10 50 09 * * *', () => {
    start(1);
});

// 통과인 인원중에 두번 보내는데 동의안한사람 아침 10시 50분 10초에 다시보낼것
cron.schedule('10 50 10 * * *', () => {
    start(2);
});

// 통과인 인원중에 세번 보내는데 동의안한사람 아침 11시 50분 10초에 다시보낼것
cron.schedule('11 40 10 * * *', () => {
    start(3);
});







async function start(sendCnt){


    /** 순차실행을 이용하여 진행 **/
    for (const service of svs) {
        var schema = "";
        var bpk = "";
        schema = service.dbAccess;
        bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){
            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);
            checkAgree(sendCnt, bpk, schema, service)

        }else{
            console.log("제외 대상 업체 ", service.serviceName);

        }




    }




}








function checkAgree(sendCnt, bpk, schema, bizInfo){

    let job = 'LIST';

    let query = "CALL hyundaiCheck("+
        "'" + job + "'" +
        ", '" + sendCnt + "'" +
        ", '" + bpk + "'" +
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
        const timer = ms => new Promise(res=>setTimeout(res,ms));
        load(valueRow);
        async function load(valueRow){
            let obj;
            for(var i=0; i< valueRow.length; i++){
                obj = valueRow[i];
                // console.log(obj);
                sendData(obj, bpk, schema, bizInfo);
                await timer(1000);
            }
            console.log("end")
        }

    });


}

function sendData(obj, bpk, schema, bizInfo){




    let data = {
        platform:bizInfo.serviceName,
        cell:obj.cell,
        dName:obj.bdName,
        dCarNum:obj.bdCarNum,
        url:bizInfo.agreeUrl
    };
    let msg = _kakaoMsg.bike006(data);


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






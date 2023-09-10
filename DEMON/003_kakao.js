/**
 *
 *
 *  심사받고
 *
 *
 * **/



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
var schema = ""; // 플랫폼 별로 변경됨
var bizInfo;
const bpk = 3; // 딜버 전용


svs.forEach(function(e){
    if(e.bpk == bpk){
        schema = e.dbAccess;
        bizInfo = e;
    }

});

// sendMsg('ACCEPTED', '20220525'); // 수동 한번도 안보낸인원ㄴ
// sendMsg('REJECTED', '20220520'); // 수동 한번도 안보낸인원ㄴ
// sendMsg('EXPIRED', '20220520'); // 수동 한번도 안보낸인원ㄴ


// 통과 안내
cron.schedule('*/20 * * * * *', () => {
    let fileDay = _dateUtil.GET_DATE("YYMMDD", "DAY",0);

    sendMsg('ACCEPTED', fileDay); // 수동 한번도 안보낸인원ㄴ
});

// 거절자 안내
cron.schedule('*/30 * * * * *', () => {

    let fileDay = _dateUtil.GET_DATE("YYMMDD", "DAY",0);


    sendMsg('REJECTED', fileDay); // 수동 한번도 안보낸인원ㄴ
});

// 만료 안내
cron.schedule('*/50 * * * * *', () => {

    let fileDay = _dateUtil.GET_DATE("YYMMDD", "DAY",0);


    sendMsg('EXPIRED', fileDay); // 수동 한번도 안보낸인원ㄴ
});




function sendMsg(TYPE, fileDay){

    let job = TYPE;

    let query = "CALL bikeKakaoSend("+
        "'" + job + "'" +
        ", '" + '' + "'" +
        ", '" + fileDay + "'" +
        ", '" + bpk + "'" +
        ", '" + "dpk" + "'" +
        ", '" + "resultMsg" + "'" +
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
                sendData(obj, TYPE);
                await timer(1000);
            }
            console.log("end")
        }

    });


}


function sendData(obj, TYPE){

    let msg = ""
    if(TYPE =='ACCEPTED'){
        let data = {
            platform:bizInfo.serviceName,
            cell:obj.cell,
            dName:obj.bdName,
            dCarNum:obj.bdCarNum,
            infoMsg: "■ 유의사항\n" +
                "- 운행 오토바이가 변경될 경우, 반드시 보험사에 통보해주세요. \n" +
                "- 계약한 오토바이의 책임보험 용도 및 계약 내용 변경 시, 반드시 보험사에 통보해주세요.\n" +
                "- 계약시 등록한 오토바이 및 보험 계약 내용과 상이할 경우 보상에 제한이 있을 수 있습니다.\n" +
                "- 배달 중의 사고 발생 문의는 현대해상 사고접수번호로 접수해주세요. (1588-5656 )",

        };
        msg = _kakaoMsg.bike005(data);
    }
    if(TYPE =='REJECTED'){
        let data = {
            platform:bizInfo.serviceName,
            cell:obj.cell,
            dName:obj.bdName,
            dCarNum:obj.bdCarNum,
            resultWhy:obj.remark
        };
        msg = _kakaoMsg.bike003(data);
    }

    if(TYPE =='EXPIRED'){
        let data = {
            platform:bizInfo.serviceName,
            cell:obj.cell,
            dName:obj.bdName,
            dCarNum:obj.bdCarNum,
        };
        msg = _kakaoMsg.bike004(data);
    }



    network_api.sendAligoKakao(msg).then(function(data){

        console.log('RESPONSE :', data);


        let job = 'RS';
        let dpk = "0";
        let dCell = obj.cell;
        let dName = "";
        let dDambo = "";
        let dCarNum = "";
        let pState = TYPE;

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




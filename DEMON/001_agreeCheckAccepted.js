/**
 *
 *
 *  Only Baemin Service
 *
 *  Every 30 sec check demon
 *  Check if there is person who does not check agree
 *  And then if the one checked, Send Accepted finish SMS
 *  And then if the one not checked, Send Agree SMS
 *
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
const bpk = 1; // 딜버 전용


svs.forEach(function(e){
    if(e.bpk == bpk){
        schema = e.dbAccess;
        bizInfo = e;
    }

});

// checkAgree(0); // 수동 한번도 안보낸인원ㄴ
//  checkAgree(1); // 수동 한번도 안보낸인원


// 통과인 인원중에 동의안한사람 상시보낼것
cron.schedule('*/30 * * * * *', () => {
    checkAgree(0);
});



function checkAgree(sendCnt){

    let job = 'CHECKLIST';

    let query = "CALL hyundaiCheck("+
        "'" + job + "'" +
        ", '" + sendCnt + "'" +
        ", '" + bpk + "'" +
        ", '" + "" + "'" +
        ", '" + _dateUtil.GET_DATE("YYMMDD", "DAY",0) + "'" +
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
                sendData(obj);
                await timer(1000);
            }
            console.log("end")
        }

    });


}

function sendData(obj){



    let data = {
        "bizCode":'003',
        "drvrResdNo":obj.socialNo,
        "agmtCncsAgrmReqDt":_dateUtil.GET_DATE("YYYYMMDDHHMMSS", "NONE",0),
        "reqAgmtCncsAgrmRslt":"1",
        "resAgmtCncsAgrmDt":"",
        "resAgmtCncsAgrmValidDt":""
    };


    network_api.network_h001(data).then(function(response){

        console.log(response);



        let query = "CALL hyundaiCheck("+
            "'" + "S" + "'" +
            ", '" + 0 + "'" +
            ", '" + bpk + "'" +
            ", '" + data.drvrResdNo + "'" +
            ", '" + data.agmtCncsAgrmReqDt + "'" +
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
                    // console.log(responseData)
                    afterCheck(obj, 0);
                    // res.status(200).send(responseData);
                }else{

                    let responseData = {
                        rCnt :1,
                        msg : "동의 완료"
                    };

                    // console.log(responseData)
                    // res.status(200).send(responseData);
                    afterCheck(obj, 1);

                }
            }else{
                let responseData = {
                    rCnt :0,
                    msg : "동의 필요"
                };

                afterCheck(obj, 0);
                // console.log(responseData)




            }


            let query = "CALL hyundaiCheck("+
                "'" + "U" + "'" +
                ", '" + hpk + "'" +
                ", '" + bpk + "'" +
                ", '" + data.drvrResdNo + "'" +
                ", '" + data.agmtCncsAgrmReqDt + "'" +
                ", '" + response.receive.reqAgmtCncsAgrmRslt + "'" +
                ", '" + response.code + "'" +
                ", '" + response.receive.resAgmtCncsAgrmDt + "'" +
                ", '" + response.receive.resAgmtCncsAgrmValidDt + "'" +
                ");";


            console.log(query);
            _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){


                console.log(result)


            });


        });










    });




}



function afterCheck(obj, check){

    console.log(obj);
    console.log("check agree", check);
    sendAligoSms(obj, check);

}





function sendAligoSms(obj, type){
    let data = {};
    let msg = "";
    // type =0; // for test
    if(type==1){
        console.log('CHECK FINISHED');
        let data = {
            platform:bizInfo.serviceName,
            cell:obj.cell,
            dName:obj.bdName,
            dCarNum:obj.bdCarNum,
            infoMsg:"■ 유의사항\n" +
                "- 기존에 다른 수단, 보험을 이용 후 변경하는 경우, 카카오톡 채널(@배민커넥트)로 반드시 변경 신청해주세요.\n" +
                "- 운행 오토바이, 계약내용, 책임보험 용도가 변경될 경우, 반드시 보험사에 통보해주세요. \n" +
                "- 계약 내용이 실제와 다를 경우 보상에 제한이 있을 수 있습니다.\n" +
                "- 배달 중의 사고 발생 문의는 현대해상 사고접수번호로 접수해주세요. (1588-5656)\n" +
                "- 배달 수단 및 오토바이 개인유상보험으로 변경을 원하시는 경우, 카카오톡 채널(@배민커넥트)로 문의해주세요."

        };
        msg = _kakaoMsg.baemin003(data);



    }
    if(type==0){
        console.log('CHECK NOT');
        data = {
            platform:bizInfo.serviceName,
            cell:obj.cell,
            dName:obj.bdName,
            dCarNum:obj.bdCarNum,
            url:bizInfo.agreeUrl,
            infoMsg:"■ 유의사항\n" +
                "- 기존에 다른 수단, 보험을 이용 후 변경하는 경우, 카카오톡 채널(@배민커넥트)로 반드시 변경 신청해주세요.\n" +
                "- 운행 오토바이, 계약내용, 책임보험 용도가 변경될 경우, 반드시 보험사에 통보해주세요. \n" +
                "- 계약 내용이 실제와 다를 경우 보상에 제한이 있을 수 있습니다.\n" +
                "- 배달 중의 사고 발생 문의는 현대해상 사고접수번호로 접수해주세요. (1588-5656)\n" +
                "- 배달 수단 및 오토바이 개인유상보험으로 변경을 원하시는 경우, 카카오톡 채널(@배민커넥트)로 문의해주세요."

        };
        msg = _kakaoMsg.baemin002(data);

    }





    network_api.sendAligoKakao(msg).then(function(data){

        console.log('RESPONSE :', data);
        let pState = "ACCEPTED"; // resultSendDate, resultSendYN UPDATE
        if(!type){
            pState ="BIKE_AGREE_MSG"; // agreeCheckCnt, agreeCheckSendCnt UPDATE
        }
        let job = 'RS';
        let dpk = "0";
        let dCell = obj.cell;
        let dName = "";
        let dDambo = "";
        let dCarNum = "";

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





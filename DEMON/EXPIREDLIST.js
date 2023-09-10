/***


 업체별 최종 심사리스트 적재
 20:30:10 초에 진행
 ==> 21시에 보내기위하여

 **/

const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require("../UTIL/date_lib");
const _apiUtil = require("../UTIL/network_lib");

const deployConfig = require("../SERVER/deploy_config.json");

const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy];

// svs.forEach(function(service){
//     // console.log(service)
//     var BUSINESSDAY =  _dateUtil.GET_DATE("YYMMDD", "NONE",0);
//     resultSetting(BUSINESSDAY, service.bpk, service.type, service.dbAccess);
// });



/** * 전송리스트 리스트 적재 : * 영업일 정오 1분 50초에 적재 */
cron.schedule('10 30 20 * * *', () => {

    svs.forEach(function(service){
        // console.log(service)
        var BUSINESSDAY =  _dateUtil.GET_DATE("YYMMDD", "NONE",0);
        resultSetting(BUSINESSDAY, service.bpk, service.type, service.dbAccess);
    });

});



/** 기명취소 결과 처리하기 **/
cron.schedule('01 00 00 * * *', () => {

    svs.forEach(function(service){
        // console.log(service)
        var BUSINESSDAY =  _dateUtil.GET_DATE("YYMMDD", "NONE",0);
        cancelComplete(BUSINESSDAY, service.bpk, service.type, service.dbAccess);
    });

});


/**
 *
 *
 * 플랫폼업자에게 보낼 결과리스트 적재
 *
 *
 *
 */
function resultSetting(BUSINESSDAY, bpk, type, schema){

    let query = "";
    // if(type=='CAR'){
    //     query = "call send2002('L','NEW','1000','"+BUSINESSDAY+"');"; // 오늘날짜로 체결이행 하지않은 리스트 출력
    // }

    if(type=='BIKE'){
        query = "call bikeResult ('EXLIST','10000','"+BUSINESSDAY+"','NEW','"+bpk+"','_dpk','_bdpk','_dNo','_pNo','requestTime')";
    }
    console.log(BUSINESSDAY, bpk, type, schema, query);

    executeMyql(bpk, type, schema, query,"결과리스트");
}





/** QUERT 실행 **/
function executeMyql(bpk, type, schema, query, title){
    _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
        console.log('MYSQL RESULT : ', result[0]);
        // console.log(result[0]);
        let msg = "";
        let data = {};
        if(result[0][0].rCnt>0){
            msg = "현대해상 만료 전송리스트 데몬 작동 :  " + title + " | " + JSON.stringify(result[0][0]) ;

            data = {
                "channel": "#개발팀",
                "username": "현대해상 시간제 보험",
                "text": msg,
                "icon_emoji": ":ghost:"
            };
        }else{
            msg = "현대해상 만료 전송리스트 데몬 작동  : " + title + " | "+ "데이터 처리 없음" ;

            data = {
                "channel": "#개발팀",
                "username": "현대해상 시간제 보험",
                "text": msg,
                "icon_emoji": ":ghost:"
            };
        }



        _apiUtil.slackWebHook(data).then(function(result){
            console.log(result);
        })


    });

}




/**
 *
 *
 * 플랫폼업자에게 보낼 결과리스트 적재
 *
 *
 *
 */
function cancelComplete(BUSINESSDAY, bpk, type, schema){

    let query = "";
    // if(type=='CAR'){
    //     query = "call send2002('L','NEW','1000','"+BUSINESSDAY+"');"; // 오늘날짜로 체결이행 하지않은 리스트 출력
    // }

    if(type=='BIKE'){
        query = "CALL bike000078('DEMON', '', '"+BUSINESSDAY+"', '"+bpk+"', '', '', '', '', '', '', '', '', '', '', '');";
    }
    console.log(BUSINESSDAY, bpk, type, schema, query);

    executeMyql(bpk, type, schema, query,"기명처리완료처리");
}





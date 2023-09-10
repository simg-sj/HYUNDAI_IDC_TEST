/**
 *
 *
 *
 * 20220906 00:30분에 MT02_202220906 생성하면
 * 20220906 08:00분에 MT03_20220906 생성
 *
 *
 */


const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require("../UTIL/date_lib");
const _fileUtil = require("../UTIL/file_lib");
const deployConfig = require("../SERVER/deploy_config.json");
const sConfig = require('../CONFIG/sftp_config');
const sCon = new sConfig();
let sftpConfig =sCon[deployConfig.deploy];
const underwriteService = require("../SERVICES/underwriteService");
const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy];
var banList = [ 2,6 ]; // 작동금지 업체
// var banList = [ ]; // 작동금지 업체


var BUSINESSDAY =  _dateUtil.GET_DATE("YYMMDD", "DAY",-1);
fileRead(BUSINESSDAY);

cron.schedule('50 10 09 * * *', () => {

    var BUSINESSDAY =  _dateUtil.GET_DATE("YYMMDD", "DAY",-1);
    fileRead(BUSINESSDAY);

});
async function fileRead( BUSINESSDAY){

    var PATH = "";
    var yyyymmdd = BUSINESSDAY;
    var fileName = "MT03_"+yyyymmdd;
    var REMOTEPATH = "/home/hyundai_user001/SEND/"+fileName;
    if(sftpConfig=="development"){
        REMOTEPATH = "/home/hyundai_user002/SEND/"+fileName;
    }

    PATH = REMOTEPATH;

    _fileUtil.FILE_READ(PATH).then(function(result){
        if(result==undefined) {
            console.log("["+PATH+"]파일이 존재하지 않음");
            return;
        }

        let valueRow = result.split('\n');
        valueRow.pop();

        /** multi query**/
        version003(valueRow, BUSINESSDAY);


    }).catch(function(e){
        console.log(e);
    })


}







function version003(valueRow, BUSINESSDAY){

    for (const service of svs) {


        var schema = "";
        var bpk = "";
        schema = service.dbAccess;
        bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){
            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);
            queryStart(service, valueRow, BUSINESSDAY);
        }else{
            console.log("제외 대상 업체 ", service.serviceName);

        }







    }

}

function queryStart(service, valueRow, BUSINESSDAY){

    let  query = "CALL RENEWMAP(" +
        "'" + 'INSERT012' + "'" +
        ", '" + service.bpk + "'" +
        ", '" + '' + "'" +
        ", '" + '' + "'" +
        ", '" + '' + "'" +
        ", '" + '' + "'" +
        ", '" + BUSINESSDAY + "'" +
        ");";
    console.log(query);
    _mysqlUtil.mysql_proc_exec(query, service.dbAccess).then(function(result){

        var code = result[0][0].code;
        console.log(code);
        if(code=='200'){




            console.log(service.type);
            var returnValues = underwriteService.UNDERWRITE_READ(valueRow, service.bpk, BUSINESSDAY);
            // console.log(service.serviceName, service.type, returnValues);

            var newGroup = arrayGrouping(returnValues, 1000);
            console.log(newGroup.length);



            /** 비동기 처리 ***/
            const timer = ms => new Promise(res=>setTimeout(res,ms));
            load(newGroup);
            async function load(valueRow){
                let obj;
                for(var i=0; i< valueRow.length; i++){
                    obj = valueRow[i];
                    // console.log(obj);
                    let muultiquery = "insert into send000002( bpk, dpk,dName,result,resultDetail,dambo,damboCode,resultDay,validUnderwriteDay,productType,pNo,recvState,remark,fileDay,createdYMD,useYNull) values ?;";


                    _mysqlUtil.mysql_proc_exec_multi(muultiquery,obj, service.dbAccess).then(function(result){
                        console.log(result);
                    });


                    await timer(1000);
                }
                console.log("end");
                insertRowMapping(service, BUSINESSDAY, service.type);
            }


        }


    });

}

function insertRowMapping(service, BUSINESSDAY, type ){
    let job = "BIKEMAP";

    let  query = "CALL RENEWMAP(" +
        "'" + job + "'" +
        ", '" + service.bpk + "'" +
        ", '" + '' + "'" +
        ", '" + '' + "'" +
        ", '" + '' + "'" +
        ", '" + '' + "'" +
        ", '" + BUSINESSDAY + "'" +
        ");";
    console.log("최종 완료", service.bpk, service.serviceName, query);
    _mysqlUtil.mysql_proc_exec(query, service.dbAccess).then(function(result){
        var code = result[0][0].msg;
        console.log(code);
    });
}


/** max_allowed_packet 에러 때문에 잘라서 업데이트 **/
function arrayGrouping(masterArray, n){

    // var array = masterArray.division(groupCnt);
    var arr = masterArray;
    var len = masterArray.length;
    var cnt = Math.floor(len/n)+ (Math.floor(len%n) > 0 ? 1 :0);
    var tmp = [];

    for (var i=0; i< cnt; i++){
        tmp.push(arr.splice(0,n));
    }

    return tmp;



}







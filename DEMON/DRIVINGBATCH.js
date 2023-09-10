const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require("../UTIL/date_lib");
const _fileUtil = require("../UTIL/file_lib");
const deployConfig = require("../SERVER/deploy_config.json");
const batchService = require("../SERVICES/batchService");

const sConfig = require('../CONFIG/sftp_config');
const sCon = new sConfig();
let sftpConfig =sCon[deployConfig.deploy];

const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy];
var banList = [ 6 ]; // 작동금지 업체


// start();
/** * 운행배치 작동 -> 이륜차  */
cron.schedule('10 50 07 * * *', () => {
    start();
});


async function start(){
    var BUSINESSDAY =  _dateUtil.GET_DATE("YYMMDD", "DAY",0);
    var resultText ="";

    /** 순차실행을 이용하여 진행 **/
    for (const service of svs) {
        var schema = "";
        var bpk = "";
        schema = service.dbAccess;
        bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){
            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);
            resultText += await batch(BUSINESSDAY, service.bpk, service.type, service.dbAccess, service.key, service.iv);
        }else{
            console.log("제외 대상 업체 ", service.serviceName);

        }


    }

    // console.log("결과텍스트", resultText)
    fileMake(BUSINESSDAY,resultText )

}


/** QUERY 생성 ***/
function batch(BUSINESSDAY, bpk, type, schema, key, iv){
    let query = "";

    if(type=='BIKE'){
        query = "call bikeDrivingBatchList('BATCH','"+bpk+"','NOW','"+BUSINESSDAY+"')";
    }
    console.log(query);
    return new Promise(function (resolve, reject) {
        _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
            console.log('MYSQL RESULT : ',bpk, type, schema, result[0].length);
            // console.log(result[0]);
            console.log(key,iv);
            var resulttest = batchService.BATCH(result, key, iv, bpk,BUSINESSDAY, type);

            resolve(resulttest)

        });
    });
}




/*** 파일 생성 **/
function fileMake(BUSINESSDAY, writeString){
    console.log('최종파일 생성');

    var path = "../UPLOAD";
    var fileName = "MT01_"+BUSINESSDAY;
    var fullPath = path + "/" +fileName;
    var pathDri = path.split("/");
    var pathString = "";
    pathDri.forEach(function(element){
        pathString += element + "/";
        _fileUtil.FILE_DIRECTORY_CHECK(pathString);
    });
    _fileUtil.FILE_MAKE(fileName, fullPath, "euc-kr",writeString);

    var config = sftpConfig;
    console.log(fullPath);
    console.log(config);
    setTimeout(()=>{
        _fileUtil.SFTP_FILE_UPLOAD(fullPath,config, "/RECV/"+fileName);
    }, 5*1000)



    setTimeout(()=>{


        for (const service of svs) {

            if(banList.indexOf(service.bpk) < 0 ){
                console.log("작동 대상 업체 ", service.serviceName);
                console.log("작동 대상 업체 ", service.bpk);
                sendCheck(BUSINESSDAY, service.bpk, service.type, service.dbAccess, service.key, service.iv);
            } else {
                console.log("제외 대상 업체 ", service.serviceName);
            }

        }

    }, 120*1000);



}





/** 보냄 처리 프로시져 호출 **/
function sendCheck(YESTERDAY, bpk,  type, schema){

    console.log(YESTERDAY, '배치 보낸파일 보낸 처리 시작 ');

    let job = 'SENT';
    let query = "";
    if(type=='BIKE'){
        query = "CALL bikeDrivingBatchList(" +
            "'" + job + "'" +
            ", '" + bpk + "'" +
            ", '" + 'NOW' + "'" +
            ", '" + YESTERDAY + "'" +
            ");";
    }


    console.log(type, bpk, query, schema);
    _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
        console.log('MYSQL RESULT : ',bpk, type, schema, result[0].length);

    });




}








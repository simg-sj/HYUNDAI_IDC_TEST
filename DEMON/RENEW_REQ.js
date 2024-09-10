/***
 *
 *
 * 갱신스케쥴러 작동 파일로 진행
 *
 * 최초 갱신진행이후에
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
var services = new serviceList();
var svs = services[deployConfig.deploy];
// var banList = [ 2,6,8 ]; // 작동금지 업체
// var banList = [ ]; // 작동금지 업체
var banList = [ 2,3,4,5,6,7,8,9 ]; // 작동금지 업체


// start();
var day = _dateUtil.GET_DATE("YYMMDD", "DAY",0);
console.log(day);

/** * 심사배치 작동 자동차 -> 이륜차  */
// cron.schedule('50 30 00 * * *', () => {
//     start();
// });

start();
async function start(){
    // var BUSINESSDAY =  _dateUtil.GET_DATE("YYMMDD", "NONE",0);
    var BUSINESSDAY = _dateUtil.GET_DATE("YYMMDD", "DAY",0);
    var resultText ="";

    console.log("DAEMON BUSINESSDAY : ", BUSINESSDAY)

    /** 순차실행을 이용하여 진행 **/
    for (const service of svs) {
        var schema = "";
        var bpk = "";
        schema = service.dbAccess;
        bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){
            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);
            resultText += await RENEW_REQ(BUSINESSDAY, service.bpk, service.type, service.dbAccess, service.key, service.iv);
        }else{
            console.log("제외 대상 업체 ", service.serviceName);

        }


    }

    // console.log("결과텍스트", resultText)
    fileMake(BUSINESSDAY,resultText )

}


/** QUERY 생성 ***/
function RENEW_REQ(BUSINESSDAY, bpk, type, schema, key, iv){
    let query = "";

    if(type=='BIKE'){
        // query = "CALL bike000012('RENEWBATCH','NEW','10000','"+BUSINESSDAY+"','"+bpk+"','_dpk','_dName','_result','_resultDetail','_dambo','_recvDay','_validDay','_mangi','_recvCode','_recvDetailCode','_recvFromDay','_recvValidDay','_recvToDay')";
        query = "call bikeRenewal_Bulk('R004','"+bpk+"','dpk','bdpk','dName','dCell','dJumin','dCarNum','dDambo','dMangi','dSoyuja','soyujaName','soyujaCell','soyujaJumin','carType','relation','pi1','pi2','startDay','endDay','primarykey');";
    }
    console.log(query);
    return new Promise(function (resolve, reject) {
        _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){

            let resultLength = result[0] ? result[0].length : 0
            let resultText = ''

            console.log('MYSQL RESULT : ',bpk, type, schema, resultLength);
            console.log(key,iv);
            console.log("result : ", result);
            if (resultLength > 0) {
                resultText = underwriteService.UNDERWRITE(result, key, iv, bpk,BUSINESSDAY, type);
            }


            resolve(resultText)

        });
    });
}




/*** 파일 생성 **/
function fileMake(BUSINESSDAY, writeString){
    console.log('최종파일 생성');

    var path = "../UPLOAD";
    var fileName = "MT02_"+BUSINESSDAY;
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




}






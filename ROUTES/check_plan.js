var express = require('express');
var router = express.Router();
var network_api = require('../UTIL/network_lib');
var date_api = require('../UTIL/date_lib');
var sql_api = require('../UTIL/sql_lib');


const deployConfig = require("../SERVER/deploy_config.json");
const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy]; // 테스트 운영계모드










router.get('/', function(req, res, next) {
    console.log("PROTOCOL: ", req.get('x-forwarded-proto'));
    console.log("REMOTE IP : ", req.get('x-forwarded-for'));
    console.log("ORIGIN : ", req.get('origin'));
    console.log("HOST : ", req.headers.host);
    console.log("AGENT : ", req.get('User-Agent'));
    console.log("CONTENT-TYPE : ", req.get('content-type'));
    res.status(200).send('respond with a resource :: IDC API SIMG SERVER');

});


/***
 *
 * 가입설계동의 여부 확인
 *
 */
router.post("/v1/planagree",  function(req, res) {
    var request_data = req.body;
    var workCode = req.headers.workcode;
    let today = date_api.GET_DATE("YYYYMMDDHHMMSS", "NONE",0);
    console.log("__________________API CALL",today, "ROUTER : ", 'ROOT REQUEST');
    console.log("HEADERS__ : ", req.headers);
    console.log("BODY__ : ", request_data);
    console.log("PROTOCOL: ", req.get('x-forwarded-proto'));
    console.log("REMOTE IP : ", req.get('x-forwarded-for'));
    console.log("ORIGIN : ", req.get('origin'));
    console.log("HOST : ", req.headers.host);
    console.log("AGENT : ", req.get('User-Agent'));
    console.log("CONTENT-TYPE : ", req.get('content-type'));
    console.log('WORKCODE :: ', workCode);

    console.log(request_data.checkKey);

    var bizCode = request_data.bizCode;
    var drvrResdNo = request_data.drvrResdNo;
    var agmtCncsAgrmReqDt = request_data.agmtCncsAgrmReqDt;
    var reqAgmtCncsAgrmRslt = request_data.reqAgmtCncsAgrmRslt;
    var resAgmtCncsAgrmDt = request_data.resAgmtCncsAgrmDt;
    var resAgmtCncsAgrmValidDt = request_data.resAgmtCncsAgrmValidDt;


    let data = {
        "bizCode":bizCode,
        "drvrResdNo":drvrResdNo,
        "agmtCncsAgrmReqDt":agmtCncsAgrmReqDt,
        "reqAgmtCncsAgrmRslt":reqAgmtCncsAgrmRslt,
        "resAgmtCncsAgrmDt":resAgmtCncsAgrmDt,
        "resAgmtCncsAgrmValidDt":resAgmtCncsAgrmValidDt
    };


    var schema = "";
    var bpk = "";


    svs.forEach(function(e){
        if(e.key== request_data.checkKey){
            schema = e.dbAccess;
            bpk = e.bpk;
        }

    });

    let query = "CALL hyundaiCheck("+
        "'" + "S" + "'" +
        ", '" + 0 + "'" +
        ", '" + bpk + "'" +
        ", '" + drvrResdNo + "'" +
        ", '" + agmtCncsAgrmReqDt + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ");";


    console.log(schema, query);
    sql_api.mysql_proc_exec(query, schema).then(function(result){


        // console.log(result)
        var hpk = result[0][0].rCnt;



        network_api.network_h001(data).then(function(response){
            console.log(response);

            if(response.code ==200){
                if(response.receive.reqAgmtCncsAgrmRslt=='0'){

                    let responseData = {
                        rCnt :0,
                        msg : "동의 필요"
                    };


                    res.status(200).send(responseData);
                }else{

                    let responseData = {
                        rCnt :1,
                        msg : "동의 완료"
                    };


                    res.status(200).send(responseData);
                }
            }else{
                let responseData = {
                    rCnt :0,
                    msg : "동의 필요"
                };


                res.status(200).send(responseData);




            }


            let query = "CALL hyundaiCheck("+
                "'" + "U" + "'" +
                ", '" + hpk + "'" +
                ", '" + bpk + "'" +
                ", '" + drvrResdNo + "'" +
                ", '" + agmtCncsAgrmReqDt + "'" +
                ", '" + response.receive.reqAgmtCncsAgrmRslt + "'" +
                ", '" + response.code + "'" +
                ");";


            console.log(query);
            sql_api.mysql_proc_exec(query, schema).then(function(result){


                console.log(result)


            });



        }).catch(function(e){
            console.log(e);
        })




    });


    // console.log(data);





});









module.exports = router;
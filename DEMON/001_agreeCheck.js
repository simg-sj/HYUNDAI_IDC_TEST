/**
 *
 *
 *  Every Day
 *  23:45:10 CHECK
 *  agree time Valid
 *
 *
 *
 * **/



const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require('../UTIL/date_lib');
var network_api = require('../UTIL/network_lib');

const deployConfig = require("../SERVER/deploy_config.json");
const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy]; // 테스트 운영계모드
var schema = ""; // 플랫폼 별로 변경됨

const bpk = 1; // 딜버 전용


svs.forEach(function(e){
    if(e.bpk == bpk){
        schema = e.dbAccess;
    }

});

checkAgree();
// cron.schedule('10 45 23 * * *', () => {
//     checkAgree();
// });








function checkAgree(underwriteDay){

    underwriteDay = underwriteDay || 'all';

    let job = 'LIST';

    let query = "CALL hyundaiCheck("+
        "'" + job + "'" +
        ", '" + 0 + "'" +
        ", '" + bpk + "'" +
        ", '" + "" + "'" +
        ", '" + underwriteDay + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ", '" + "" + "'" +
        ");";



    console.log(query);
    _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
        // console.log('MYSQL RESULT : ', result[0]);
        let data = result[0];
        let valueRow = data;

        /** 비동기 처리 ***/
        const timer = ms => new Promise(res=>setTimeout(res,ms))
        load(valueRow);
        async function load(valueRow){
            let obj;
            for(var i=0; i< valueRow.length; i++){
                obj = valueRow[i];
                // console.log(obj);
                sendData(obj);
                await timer(500);
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

        // console.log(response);



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
                    console.log(responseData)

                    // res.status(200).send(responseData);
                }else{

                    let responseData = {
                        rCnt :1,
                        msg : "동의 완료"
                    };

                    console.log(responseData)
                    // res.status(200).send(responseData);
                }
            }else{
                let responseData = {
                    rCnt :0,
                    msg : "동의 필요"
                };


                console.log(responseData)




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
                ", '" + "" + "'" + // 변수 하나 확장함
                ");";


            console.log(query);
            _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){


                console.log(result)


            });


        });










    });




}




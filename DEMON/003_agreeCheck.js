/***
 *
 * 동의체크
 *
 * 매일 23시 45분에 동의체크
 * CALL hyundaiCheck('LIST', '0', '3', '', '', '', '');
 * 리스트를 가져와서 한건씩 조회한다.
 * - 프로시져내에 _checktype 이 'base' 일 경우 1) 동의 체크 안된있는인원, 2) 동의일자가 1년이 지난 인원에 대해서 리스트를 가져와서 확인
 * - 프로시져내에 _checktype 이 'all' 일 경우  1) 전체 기사에 대해서 확인한다.
 *
 *
 *
 * ***/

const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require('../UTIL/date_lib');
var network_api = require('../UTIL/network_lib');

const deployConfig = require("../SERVER/deploy_config.json");
const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy]; // 테스트 운영계모드
var schema = ""; // 플랫폼 별로 변경됨

const bpk = 3; // 딜버 전용


svs.forEach(function(e){
    if(e.bpk == bpk){
        schema = e.dbAccess;
    }

});

checkAgree();
cron.schedule('10 45 23 * * *', () => {
    checkAgree();
});








function checkAgree(){

    let job = 'LIST';

    let query = "CALL hyundaiCheck("+
        "'" + job + "'" +
        ", '" + 0 + "'" +
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

        console.log("동의 결과 ", response);



        let query = "CALL hyundaiCheck("+
            "'" + "S" + "'" +
            ", '" + 0 + "'" +
            ", '" + bpk + "'" +
            ", '" + data.drvrResdNo + "'" +
            ", '" + data.agmtCncsAgrmReqDt + "'" +
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
                                ", '" + response.receive.resAgmtCncsAgrmValidDt + "'" +
                                ", '" + response.receive.reqAgmtCncsAgrmRslt + "'" +
                                ", '" + response.code + "'" +
                                ");";


                            console.log(query);
                            _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){


                                console.log(result)


                            });


        });










    });




}




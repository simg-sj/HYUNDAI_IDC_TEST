const _mysqlUtil = require('../UTIL/sql_lib');
var network_api = require('../UTIL/network_lib');
var date_api = require('../UTIL/date_lib');

const deployConfig = require("../SERVER/deploy_config.json");
const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy]; // 테스트 운영계모드
var schema = ""; // 플랫폼 별로 변경됨

var _gpsService  = require("../SERVICES/accidentGps");


module.exports = {
    /**

     * 심사결과
     *
     */
    ACCIDENTREQUEST: function(  request_data){

        return new Promise(function (resolve, reject) {



            if(!request_data.reqDrvgID){
                let msg = {
                    "code": 101,
                    "resDrvrID": "",
                    "resDrvgID":"",
                    "resDrvgStDtm":"",
                    "resDrvgEdDtm":"",
                    "resDrvgCancYn":"",
                    "resPosInfoInvstDtm":"",
                    "resPosInfoRecDtm":"",
                    "resLatd":"",
                    "resLgtd":"",
                    "resDlvStAddr":"",
                    "resDlvEdAddr":"",
                    "message": "운행 ID, 필수값이 누락되었습니다. "
                };
                resolve(msg)
            }
            else if(!request_data.reqAcdtRcpNo){
                let msg = {
                    "code": 102,
                    "resDrvrID": "",
                    "resDrvgID":"",
                    "resDrvgStDtm":"",
                    "resDrvgEdDtm":"",
                    "resDrvgCancYn":"",
                    "resPosInfoInvstDtm":"",
                    "resPosInfoRecDtm":"",
                    "resLatd":"",
                    "resLgtd":"",
                    "resDlvStAddr":"",
                    "resDlvEdAddr":"",
                    "message": "사고접수번호, 필수값이 누락되었습니다."
                };
                resolve(msg)
            }
            else if(!request_data.reqAcdtDtm){
                let msg = {
                    "code": 103,
                    "resDrvrID": "",
                    "resDrvgID":"",
                    "resDrvgStDtm":"",
                    "resDrvgEdDtm":"",
                    "resDrvgCancYn":"",
                    "resPosInfoInvstDtm":"",
                    "resPosInfoRecDtm":"",
                    "resLatd":"",
                    "resLgtd":"",
                    "resDlvStAddr":"",
                    "resDlvEdAddr":"",
                    "message": "사고시간, 필수값이 누락되었습니다."
                };
                resolve(msg)
            }
            else if(!request_data.reqDrvrID){
                let msg = {
                    "code": 104,
                    "resDrvrID": "",
                    "resDrvgID":"",
                    "resDrvgStDtm":"",
                    "resDrvgEdDtm":"",
                    "resDrvgCancYn":"",
                    "resPosInfoInvstDtm":"",
                    "resPosInfoRecDtm":"",
                    "resLatd":"",
                    "resLgtd":"",
                    "resDlvStAddr":"",
                    "resDlvEdAddr":"",
                    "message": "기사 ID, 필수값이 누락되었습니다."
                };
                resolve(msg)
            }
            else if(!request_data.reqPlyNo){
                let msg = {
                    "code": 105,
                    "resDrvrID": "",
                    "resDrvgID":"",
                    "resDrvgStDtm":"",
                    "resDrvgEdDtm":"",
                    "resDrvgCancYn":"",
                    "resPosInfoInvstDtm":"",
                    "resPosInfoRecDtm":"",
                    "resLatd":"",
                    "resLgtd":"",
                    "resDlvStAddr":"",
                    "resDlvEdAddr":"",
                    "message": "증권번호, 필수값이 누락되었습니다."
                };
                resolve(msg)
            }
            else{

                /** 임시 테스트 **/
                /*
                if(request_data.reqDrvgID=='B3100014289'){
                    // 취소케이스
                    let msg = {
                        "resDrvrID": request_data.reqDrvrID,
                        "resDrvgID":request_data.reqDrvgID,
                        "resDrvgStDtm":"",
                        "resDrvgEdDtm":"20220505225620",
                        "resDrvgCancYn":"1",
                        "resPosInfoInvstDtm":"",
                        "resPosInfoRecDtm":"",
                        "resLatd":"",
                        "resLgtd":"",
                        "resDlvStAddr":"",
                        "resDlvEdAddr":""
                    };

                    resolve(msg);
                }else{
                    // Normal Case
                    let msg = {
                        "resDrvrID": request_data.reqDrvrID,
                        "resDrvgID":request_data.reqDrvgID,
                        "resDrvgStDtm":"20220505195620",
                        "resDrvgEdDtm":"20220505205620",
                        "resDrvgCancYn":"0",
                        "resPosInfoInvstDtm":"20220505205620",
                        "resPosInfoRecDtm":"20220505205620",
                        "resLatd":"37.21698442",
                        "resLgtd":"126.95177035",
                        "resDlvStAddr":"경기도 화성시 봉담",
                        "resDlvEdAddr":"경기도 화성시 봉담"
                    };

                    resolve(msg);
                }
                */


                // 0. 업체증권번호 어디 쪽 서버정보인지 찾느다.
                // 1. 규칙 데이터가 없으면 -> 운행키 매핑해서 -> API요청 -> 결과값 매핑및 저장하고 -> RESPONSE
                // 2. 규칙 데이터가 있으면 -> 운행키 매핑해서 -> RESPONSE
                var masterPolicy =""; // IF policy number has been selected
                var searchPolicy =0;
                for (const service of svs) {
                    // console.log(service.dbAccess);

                    let insurNumber =  request_data.reqPlyNo;
                    let query = "call masterPolicy('"+service.type+"','"+insurNumber+"')";
                    console.log("사고 정보 증권 탐색");
                    console.log(service.serviceName, query);





                    /** 증권 정보를 조회한다 **/
                   var policyResult = _mysqlUtil.mysql_proc_exec(query, service.dbAccess).then(function(result){
                        var res = result[0][0];
                        var returnData = {};
                        returnData = {
                           bpk : res.bpk,
                           policyNumber: res.policyNumber
                        };
                        return returnData
                    }).catch(function(e){
                        return "fail";
                    });


                    /** 사고 조회 처리 ***/
                    policyResult.then(function(data){


                        if(data.bpk !='0'){
                            searchPolicy=1; //
                            console.log("증권 탐색 결과");
                            console.log(service.serviceName);
                            console.log(data);
                            console.log("GPS INFORMATION BIZNUMBER : ", data.bpk);
                            if(data.bpk=='1'){
                                console.log("BAEMIN GPS");
                                _gpsService.BAEMIN(request_data, service.dbAccess, data.bpk).then(function(success){
                                    resolve(success);
                                })
                            }
                            if(data.bpk=='3'){
                                console.log("DILVER GPS");
                                _gpsService.DILVER(request_data, service.dbAccess, data.bpk).then(function(success){
                                    resolve(success);
                                })
                            }
                            if(data.bpk=='5'){
                                console.log("PLUSANDSOFT GPS");
                                _gpsService.PLUSSOFT(request_data, service.dbAccess, data.bpk).then(function(success){
                                    resolve(success);
                                })
                            }
                            if(data.bpk=='4' || data.bpk=='7' || data.bpk=='8' || data.bpk=='9'){
                                console.log("PLATFORM GPS"); // 비욘드, 배달시대, 배고파딜리버리, 두잇
                                _gpsService.PLATFORM(request_data, service.dbAccess, data.bpk).then(function(success){
                                    resolve(success);
                                })
                            }

                        }







                    })




                }
                setTimeout(()=>{
                    console.log("policy search : ", searchPolicy);
                    if(searchPolicy ==0){
                        let msg = {
                            "resDrvrID": request_data.reqDrvrID,
                            "resDrvgID":request_data.reqDrvgID,
                            "resDrvgStDtm":"",
                            "resDrvgEdDtm":"",
                            "resDrvgCancYn":"1",
                            "resPosInfoInvstDtm":"",
                            "resPosInfoRecDtm":"",
                            "resLatd":"",
                            "resLgtd":"",
                            "resDlvStAddr":"",
                            "resDlvEdAddr":""
                        };

                        resolve(msg)
                    }
                }, 5000)








            }


        });




    },

}

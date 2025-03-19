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
                // 모든 policyResult를 처리하기 위한 promise 배열을 저장할 변수 선언
                let policyPromises = [];

                for (const service of svs) {
                    console.log('*************',service.bpk, '*************')
                    let insurNumber = request_data.reqPlyNo;
                    let query = "call masterPolicy('" + service.type + "','" +  service.bpk + "','" + insurNumber + "')";
                    console.log("사고 정보 증권 탐색");
                    console.log(service.serviceName, query);

                    // 각 서비스의 policyResult를 수집
                    let policyPromise = _mysqlUtil.mysql_proc_exec(query, service.dbAccess)
                        .then(function (result) {
                            var res = result[0][0];

                            var returnData = {
                                bpk: res.bpk,
                                policyNumber: res.policyNumber
                            };
                            console.log(service.serviceName, " 증권조회 결과 1", returnData);
                            return returnData;
                        })
                        .catch(function (e) {
                            return "fail";
                        });

                    policyPromises.push(policyPromise);
                }

                // return;
                // 모든 policyResult가 완료될 때까지 기다린 후 처리
                Promise.all(policyPromises).then(function (results) {
                    let searchPolicy = 0;

                    // 적절한 bpk에 대한 처리를 한 번만 수행
                    results.forEach(function (data, index) {
                        console.log('[ bpk : ',data.bpk, '] 플랫폼 위치정보 조회 시작~')
                        if (data.bpk != '0') {
                            searchPolicy = 1;
                            console.log("증권 탐색 결과");
                            console.log(svs[index].serviceName);
                            console.log(data);
                            console.log("GPS INFORMATION BIZNUMBER : ", data.bpk);

                            switch (data.bpk) {
                                case '1':
                                    console.log("BAEMIN GPS");
                                    _gpsService.BAEMIN(request_data, svs[index].dbAccess, data.bpk).then(function (success) {
                                        resolve(success);
                                    });
                                    break;
                                case '3':
                                    console.log("DILVER GPS");
                                    _gpsService.DILVER(request_data, svs[index].dbAccess, data.bpk).then(function (success) {
                                        resolve(success);
                                    });
                                    break;
                                case '5':
                                    console.log("PLUSANDSOFT GPS");
                                    _gpsService.PLUSSOFT(request_data, svs[index].dbAccess, data.bpk).then(function (success) {
                                        resolve(success);
                                    });
                                    break;
                                default:
                                    if (['4', '6', '7', '8', '9', '10', '11', '12', '13'].includes(data.bpk)) {
                                        console.log("PLATFORM GPS"); // 비욘드, 배달시대, 배고파딜리버리, 두잇
                                        _gpsService.PLATFORM(request_data, svs[index].dbAccess, data.bpk).then(function (success) {
                                            resolve(success);
                                        });
                                    }
                                    break;
                            }
                        }
                    });
                });
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

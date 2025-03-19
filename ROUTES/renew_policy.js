const _mysqlUtil = require('../UTIL/sql_lib');
var network_api = require('../UTIL/network_lib');
var date_api = require('../UTIL/date_lib');

const deployConfig = require("../SERVER/deploy_config.json");
const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy]; // 테스트 운영계모드
var schema = ""; // 플랫폼 별로 변경됨

var _gpsService  = require("../SERVICES/accidentGps");
const _apiUtil = require("../UTIL/network_lib");




module.exports = {
    /**
     * 갱신 증권번호 암호화값 [ 라이더들에게 나갈 체결이행동의 URL 의 증권암호화 쿼리파라미터 값 수신 ]
     * {
     *     "bizCode" : "009",
     *     "inagId" : "", // 증권 암호화값으로 들어올듯
     *     "coprCat" : "업체번호",
     *     "plyNo" : "증권번호",
     *     "resCd" : "SIMG반환값 00/101/102..."
     * }
     *
     * 실제 들어온 전문 내용
     *     {
     *          bizCode: '009',
     *          coprCat: '001',
     *          plyNo: 'M2024E36847100000', // 증권번호
     *          resCd: null,
     *          inagId: 'zvKrwdu7QUtRtR',
     *          inagNo: 'M2024E368471', // 계약번호
     *          inagNoSeq: '00000',
     *          insStDt: '20240801',
     *          insEdDt: '20250201',
     *          insrdNm: null,
     *          insrdNo: null,
     *          polhldrNm: null,
     *          polhldrNo: null,
     *          hndlrNm: null,
     *          hndlrNo: null
     *      }
     * 
     *
     * */
    RENEW_POLICY_CIDATA : function (request_data) {

        console.log('bizCode : 009 Request Process start');
        console.log('bizCode - 009 request_data ', request_data);
        let contractNo = request_data.inagNo;
        let pNo = request_data.plyNo;
        let key = request_data.inagId;
        let bpk = request_data.coprCat; // 613이 아닌 경우는 0 제거 해야함
        let businessDay = date_api.GET_DATE("YYMMDD", "NONE",0);

        let startDay = request_data.insStDt;
        let endDay = request_data.insEdDt;

        if( request_data.coprCat == '613' ){ /* 613 인 경우 라스 / 다스 / KJ스테이션 관련 증권번호 임 */

            console.log('613 svs check : ',svs[0].dbAccess);
            schema = svs[0].dbAccess; // db scheam 설정
            // return;

        }else{ // 그외에는 전부 현대 이륜차 시간제보험 처리로 인지하게


            bpk = bpk.replace(/(^0+)/, ""); // 0 왼쪽 패딩 0 제거

            svs.forEach(function(e){
                if(e.bpk == bpk){
                    schema = e.dbAccess;
                }

            });

        }



        return new Promise(function (resolve, reject){

            if(!request_data.bizCode){
                // let msg = {
                //     "resCd": 101,
                // }
                // resolve(msg);
                request_data.resCd = "101";
                resolve(request_data);
            }
            else if(!request_data.inagId){
                // let msg = {
                //     "resCd": 102,
                // }
                // resolve(msg);
                request_data.resCd = "102";
                resolve(request_data);

            }else if(!request_data.coprCat){
                // let msg = {
                //     "resCd": 103,
                // }
                // resolve(msg);
                request_data.resCd = "103";
                resolve(request_data);
            }else if(!request_data.plyNo) {
                // let msg = {
                //     "resCd": 104,
                // }
                // resolve(msg);
                request_data.resCd = "104";
                resolve(request_data);
            }else if(!request_data.inagNo){
                // let msg = {
                //     "resCd": 105,
                // }
                // resolve(msg);
                request_data.resCd = "105";
                resolve(request_data);
            }else if(!request_data.insStDt){
                // let msg = {
                //     "resCd": 106,
                // }
                // resolve(msg);
                request_data.resCd = "106";
                resolve(request_data);
            }else if(!request_data.insEdDt){
                // let msg = {
                //     "resCd": 107,
                // }
                // resolve(msg);
                request_data.resCd = "107";
                resolve(request_data);
            }else{

                request_data.resCd = "00";

                let query = "";

                if( request_data.coprCat == '613' ) { /* 613 인 경우 라스 / 다스 / KJ스테이션 관련 증권번호 임 */

                    query = "CALL daeriPolicy_manager('S', 'SERVER', '" + pNo + "', '" + contractNo + "', '" + key + "', '" + businessDay + "', '_page', '_npp', '" + startDay + "', '" + endDay + "', '_searchGbn', '_searchVal', '_tSort', '_tOrder');"

                }else{

                    query = "CALL bike000009('S', '" + bpk + "', '" + key + "', '" + contractNo + "', '" + pNo + "', '" + businessDay + "', '_Page', '_npp', '" + startDay + "', '" + endDay + "', '_searchGbn', '_searchVal', '_tSort', '_tOrder');";

                }

                console.log("scheam : ", schema);
                console.log("query : ", query);

                _mysqlUtil.mysql_proc_exec(query, schema).then(function(result) {
                    let d = result[0];
                    console.log('MYSQL RESULT : ', d);

                    let code = d[0].code;
                    let msg = d[0].msg;

                    let slackBotObj = {}
                    if ( code == '200' ){

                        slackBotObj = {
                            "channel": "#simg_운영",
                            "username": "현대해상 증권등록시스템(정상)",
                            "text": `- code : ${code}\n- msg : ${msg}\n- 업체코드 : ${request_data.coprCat}\n- 증권번호 : ${pNo}\n- 계약번호 : ${contractNo}\n- 암호화값 : ${key}\n- 증권시기 : ${startDay}\n- 증권만기 : ${endDay}`,
                            "icon_emoji": ":ghost:"
                        }

                    }else{

                        slackBotObj = {
                            "channel": "#simg_운영",
                            "username": "현대해상 증권등록시스템(에러)",
                            "text": `- code : ${code}\n- msg : ${msg}\n- 업체코드 : ${request_data.coprCat}\n- 증권번호 : ${pNo}\n- 계약번호 : ${contractNo}\n- 암호화값 : ${key}\n- 증권시기 : ${startDay}\n- 증권만기 : ${endDay}`,
                            "icon_emoji": ":ghost:"
                        }

                    }

                    _apiUtil.simg_slackWebHook(slackBotObj).then(function(result){
                        console.log(result);
                    })

                    resolve(request_data);

                });

            }



        });


    }


}
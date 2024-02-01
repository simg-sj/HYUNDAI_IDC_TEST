const _mysqlUtil = require('../UTIL/sql_lib');
var network_api = require('../UTIL/network_lib');
var date_api = require('../UTIL/date_lib');

const deployConfig = require("../SERVER/deploy_config.json");
const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy]; // 테스트 운영계모드
var schema = ""; // 플랫폼 별로 변경됨


module.exports = {
    /**

     * 심사결과 전문 샘플
     * {
     *      "reqDrvrID":"B100039008",                    -- 라이더 아이디 [SIMG 생성 bikeDriverMaster bdpk ]
     *      "reqDrvrNm":"이**",                           -- 라이더 이름
     *      "reqUnwrRslt":"01",                           -- 심사결과코드 [ 01 - ACCEPTED / 02 - REJECTED / 03 - DELAY / 04 - ERROR ]
     *      "reqUnwrRsltDet":" ",                         -- 심사결과상세코드 [ function filterResultDetail() 참고 ]
     *      "reqPolInsdTyp":null,
     *      "reqUnwrCpltDt":"20240118",                   -- 책임 개시 일자
     *      "reqUnwrValidDt":"20240901",                  -- 책임 개시 만료 일자
     *      "reqAutoInagAgmtEdDt":"20240531",             -- 심사 결과 유효 만료 일자
     *      "reqProdCd":"5802",                           -- 현대해상 상품코드
     *      "reqCoprCat":"001",                           -- 업체코드 [ bpk ]
     *      "reqTwhvcUsedUsage":" ",
     *      "reqPlyNo":"M2023L90995300000",               -- 증권번호
     *      "reqErrTypCd":null                            -- 유효성검사시 에러코드
     * }
     *
     */
    UNDERWRITERESULT: function(  request_data){

        return new Promise(function (resolve, reject) {



            let job = 'RS';
            let regiGbn = 'NEW';
            let limitCount = '100000';
            let fileDay = date_api.GET_DATE("YYMMDD", "NONE",0);
            let bpk = request_data.reqCoprCat;
            bpk = bpk.replace(/(^0+)/, ""); // 0 왼쪽 패딩 0 제거
            let dpk = request_data.reqDrvrID;
            let dName = request_data.reqDrvrNm;
            let reqErrTypCd = request_data.reqErrTypCd; // 심사전 유효성검사시 에러관련 코드
            let result = "";
            let resultDetail = "";
            console.log('유효성체크 값 : ', reqErrTypCd);
            if(reqErrTypCd === null){
                result = filterResult(request_data.reqUnwrRslt);
                resultDetail = filterResultDetail(request_data.reqUnwrRsltDet);
            }else{
                result = 'ERROR';
                resultDetail = filterErrorCodeResult(reqErrTypCd);

            }


            // let result = filterResult(request_data.reqUnwrRslt);
            // let resultDetail = filterResultDetail(request_data.reqUnwrRsltDet);
            let dambo = '';
            let recvDay = request_data.reqUnwrCpltDt;
            let validDay = request_data.reqUnwrValidDt;
            let mangi = '만기일 조회없음';
            let recvCode = request_data.reqUnwrRslt;
            let recvDetailCode = request_data.reqUnwrRsltDet;
            let recvFromDay = request_data.reqUnwrCpltDt;
            let recvToDay = request_data.reqUnwrValidDt;
            let recvValidDay = request_data.reqAutoInagAgmtEdDt;


            svs.forEach(function(e){
                if(e.bpk == bpk){
                    schema = e.dbAccess;
                }

            });


            let query = "CALL bike000012(" +
                "'" + job + "'" +
                ", '" + regiGbn + "'" +
                ", '" + limitCount + "'" +
                ", '" + fileDay + "'" +
                ", '" + bpk + "'" +
                ", '" + dpk + "'" +
                ", '" + dName + "'" +
                ", '" + result + "'" +
                ", '" + resultDetail + "'" +
                ", '" + dambo + "'" +
                ", '" + recvDay + "'" +
                ", '" + validDay + "'" +
                ", '" + mangi + "'" +
                ", '" + recvCode + "'" +
                ", '" + recvDetailCode + "'" +
                ", '" + recvFromDay + "'" +
                ", '" + recvToDay + "'" +
                ", '" + recvValidDay + "'" +
                ");";


            console.log(schema, query);


            _mysqlUtil.mysql_proc_exec(query, schema).then(function(result) {
                let d = result[0];
                console.log('MYSQL RESULT : ', d);
                resolve(d)

            });


        });



        function filterResult(result){
            var returnValue = '';
            switch(result){
                case '01': returnValue = 'ACCEPTED'; break;
                case '02': returnValue = 'REJECTED'; break;
                case '03': returnValue = 'DELAY'; break;  // 심사중
                case '04': returnValue = 'ERROR'; break;  // 오류
            }

            return returnValue;

        }


        function filterResultDetail(result){
            var returnValue = '';
            switch(result){
                case '': returnValue = ''; break;
                case '01': returnValue = '법규위반이력 존재'; break;
                case '02': returnValue = '가입경력조건 미충족'; break;
                case '03': returnValue = '책임보험 가입이력 미존재'; break;
                case '04': returnValue = '가입가능연령 조건 미충족'; break;
                case '05': returnValue = '사고횟수기준 초과'; break;
                case '06': returnValue = '본인소유 확인필요'; break;
                case '99': returnValue = '기타'; break;
            }

            return returnValue;

        }


        function filterDambo(result){
            var returnValue = '';
            switch(result){
                case '01': returnValue = '자차가입'; break;
                case '02': returnValue = '자차미가입'; break;
                case '03': returnValue = '담보미가입'; break;

            }

            return returnValue;

        }

        function filterErrorCodeResult(result){
            var returnValue = '';
            var defaultText = '심사전유효성체크에러 - ';
            switch(result){
                case '01' : returnValue = defaultText + '주민등록번호 빈값'; break;
                case '02' : returnValue = defaultText + '차량번호 빈값'; break;
                case '03' : returnValue = defaultText + '계약(증권)번호 빈값'; break;
                case '04' : returnValue = defaultText + '주민번호체계 오류'; break;
                // case '05' : returnValue = defaultText + '지정1인추가요청 - 피보험자 미존재';
                case '06' : returnValue = defaultText + '유효하지않은 라이더정보'; break; // 지정1인 유효값외 유입되는 경우
                case '07' : returnValue = defaultText + '기등록자'; break;
            }
            return returnValue;
        }




    },

}

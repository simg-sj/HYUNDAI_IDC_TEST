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

     * 심사결과
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
                let result = filterResult(request_data.reqUnwrRslt);
                let resultDetail = filterResultDetail(request_data.reqUnwrRsltDet);
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

            return returnValue

        }


        function filterResultDetail(result){
            var returnValue = '';
            switch(result){
                case '': returnValue = ''; break;
                case '01': returnValue = '중대법규위반이력 존재'; break;
                case '02': returnValue = '가입경력조건 미충족'; break;
                case '03': returnValue = '책임보험 가입이력 미존재'; break;
                case '04': returnValue = '가입가능연령 조건 미충족'; break;
                case '05': returnValue = '사고횟수기준 초과'; break;
                case '99': returnValue = '기타'; break;
            }

            return returnValue

        }


        function filterDambo(result){
            var returnValue = '';
            switch(result){
                case '01': returnValue = '자차가입'; break;
                case '02': returnValue = '자차미가입'; break;
                case '03': returnValue = '담보미가입'; break;

            }

            return returnValue

        }




    },

}

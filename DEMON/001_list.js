const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require('../UTIL/date_lib');
const bpk = 1;
const deployConfig = require("../SERVER/deploy_config.json");
const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy]; // 테스트 운영계모드
var schema = ""; // 플랫폼 별로 변경됨
svs.forEach(function(e){
    if(e.bpk == bpk){
        schema = e.dbAccess;
    }

});


/**
 *
 *
 * 심사 리스트 적재
 *
 * 매분의 10분에 한번씩 실행  -/10 * * * *
 *
 *
 *
 *
 */
// underwriteList();

cron.schedule('*/15 * * * * *', () => {
    underwriteList();
});

underwriteList();

function underwriteList(){

    let job = 'LIST';
    let regiGbn = 'NEW';
    let limitCount = '100000';
    let fileDay = _dateUtil.GET_DATE("YYMMDD", "NONE",0);
    // let bpk = bpk;
    let dpk = '';
    let dName = '';
    let result = '';
    let resultDetail = '';
    let dambo = '';
    let recvDay = '';
    let validDay = '';
    let mangi = '';

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
        ", '" + '_recvCode' + "'" +
        ", '" + '_recvDetailCode' + "'" +
        ", '" + '_recvFromDay' + "'" +
        ", '" + '_recvToDay' + "'" +
        ", '" + '_recvValidDay' + "'" +
        ");";


    console.log(query);
    _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
        console.log('MYSQL RESULT : ', result[0]);
        let d = result[0];


    });


}

/**
 *
 *
 *
 * 디비 엔진 확인 이슈사항 발생시에 flush hosts;
 *
 *
 *select count(*) from information_schema.processlist where command='Sleep'
 select * from information_schema.processlist where command='Sleep'
 show processlist
 SHOW STATUS LIKE 'Threads_connected';
 */
const _mysqlUtil = require('../UTIL/sql_lib');
const deployConfig = require("../SERVER/deploy_config.json");
const serviceList = require("../CONFIG/service_config");
const _apiUtil = require("../UTIL/network_lib");
const cron = require('node-cron');
var services = new serviceList();
var svs = services[deployConfig.deploy];




/** 실시간 운행 확인 1시간마다 한번씩정검 **/
cron.schedule('0 0 */1 * * *', () => {
    accessTest();
});


function accessTest(){
    /** 순차실행을 이용하여 진행 **/
    for (const service of svs) {

        let query = 'SHOW STATUS LIKE \'Threads_connected\';';
        // let query = 'flush hosts;';

        _mysqlUtil.mysql_proc_exec(query, service.dbAccess).then(function(result){
            console.log(service.serviceName, result);
            // console.log('MYSQL RESULT : ',result);
            // console.log(result[0]);

            var msg ="DB  connected threads " + service.serviceName + "  " +result[0].Value + "건";
            var data = {
                "channel": "#개발팀",
                "username": "현대해상 시간제 보험 ",
                "text": msg,
                "icon_emoji": ":ghost:"
            };

            _apiUtil.slackWebHook(data).then(function(result){
                console.log(result);
            })
        });

    }
}
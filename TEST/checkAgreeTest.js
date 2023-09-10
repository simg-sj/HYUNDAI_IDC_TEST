

const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require("../UTIL/date_lib");
const _fileUtil = require("../UTIL/file_lib");
const deployConfig = require("../SERVER/deploy_config.json");
const underwriteService = require("../SERVICES/underwriteService");

const sConfig = require('../CONFIG/sftp_config');
const sCon = new sConfig();
let sftpConfig =sCon[deployConfig.deploy];

const serviceList = require("../CONFIG/service_config");
const _apiUtil = require("../UTIL/network_lib");
const _kakaoMsg = require("../UTIL/kakao_lib");
const network_api = require("../UTIL/network_lib");
const _baseUtil = require("../UTIL/base_lib");
const {network_h001} = require("../UTIL/network_lib");
var services = new serviceList();
var svs = services[deployConfig.deploy];
var banList = [ 1,2,4,5,6,7,8,9 ]; // 작동금지 업체



selectCheckList();

async function selectCheckList() {

    for (const service of svs) {

        let schema = service.dbAccess;
        let bpk = service.bpk;

        if (banList.indexOf(bpk) < 0) {

            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);

        } else {

            console.log("제외 대상 업체 ", service.serviceName);

            continue

        }

        // 갱신심사에서 심사승인 받은 인원들
        // let query = `select bdpk, bdName, convert(aes_decrypt(unhex(bdJumin), 'jumin23456@#$%^'), CHAR) socialNo from bikeRenewal where startDay ='20221201' and newState ='ACCEPTED' and useYNull ='Y'`
        // let query = `select bdpk, bdName, convert(aes_decrypt(unhex(bdJumin), 'jumin23456@#$%^'), CHAR) socialNo from bikeRenewal where startDay ='20221201' and newState ='REJECTED' and useYNull ='Y' and remark ='책임보험 가입이력 미존재'`

        // let query = `select convert(aes_decrypt(unhex(bdJumin), 'jumin23456@#$%^'), CHAR) socialNo from bikeDriverMaster where bdpk = 'V3300001212'`
        // let query = `select b.bdpk,b.dpk,b.bpk,b.bdName,b.pState,b.bdCarNum,
        //             convert(aes_decrypt( unhex(b.bdCell),'cell23456@#$%^') USING utf8) cell,
        //             cast(aes_decrypt( unhex(b.bdJumin),'jumin23456@#$%^') as char) socialNo,
        //             concat(CONVERT_TZ(b.createdYMD,'GMT','UTC')) as created
        //             from bikeDriverMaster b
        //             where b.pState = 'ACCEPTED'
        //             and b.agreeCheckYN is null
        //             and b.useYNull = 'Y'`;

        let query = `select b.bdpk,b.dpk,b.bpk,b.bdName,b.pState,b.bdCarNum,
                    convert(aes_decrypt( unhex(b.bdCell),'cell23456@#$%^') USING utf8) cell,
                    cast(aes_decrypt( unhex(b.bdJumin),'jumin23456@#$%^') as char) socialNo,
                    concat(CONVERT_TZ(b.createdYMD,'GMT','UTC')) as created
                    from bikeRenewal b WHERE useYNull ='Y'`

        console.log('query :: ', query)

        const timer = ms => new Promise(res => setTimeout(res, ms));
        await timer(1000);

        _mysqlUtil.mysql_proc_exec(query, schema).then(async result => {

            console.log(result)
            console.log('결과인원 :: ', result.length)

            let checkNormal = []
            let checkAbnormal = []
            for (let i = 0; i < result.length; i++) {

                let driver = result[i];

                let checkResult = await checkPlanAgree(driver);


                if(checkResult.reqAgmtCncsAgrmRslt === '1'){
                    checkNormal.push(driver)
                } else {
                    checkAbnormal.push(driver)
                }

            }
            console.log('checkNormal :: ', checkNormal)
            console.log('checkAbnormal :: ', checkAbnormal)
            console.log('checkNormal 인원 :: ', checkNormal.length)
            console.log('checkAbnormal 인원 :: ', checkAbnormal.length)



        })



    }


    
}


async function checkPlanAgree(obj){



    let data = {
        "bizCode":'003',
        "drvrResdNo":obj.socialNo,
        "agmtCncsAgrmReqDt":_dateUtil.GET_DATE("YYYYMMDDHHMMSS", "NONE",0),
        "reqAgmtCncsAgrmRslt":"1",
        "resAgmtCncsAgrmDt":"",
        "resAgmtCncsAgrmValidDt":""
    };

    return await network_h001(data).then(result => {
        console.log(result)
        return result.receive
    })


}
/***
 2022.07.18
 심사보내는 로직 : 배민제외 업체 통합
 심사리스트 적재
 매분의 10분에 한번씩 실행

 **/
const cron = require('node-cron');
const _mysqlUtil = require('../UTIL/sql_lib');
const _dateUtil = require('../UTIL/date_lib');
const _baseUtil = require('../UTIL/base_lib');
const network_api = require('../UTIL/network_lib');
const _kakaoMsg = require('../UTIL/kakao_lib');
const _fileUtil = require("../UTIL/file_lib");
const deployConfig = require("../SERVER/deploy_config.json");
const batchService = require("../SERVICES/batchService");

const sConfig = require('../CONFIG/sftp_config');
const sCon = new sConfig();
let sftpConfig =sCon[deployConfig.deploy];

const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy];


// var banList = [6, 8]; // 작동금지 업체

var banList = [2,3,4,5,6,7,8,9,10,11,12]; // 작동금지 업체




// 통과 안
// cron.schedule('*/20 * * * * *', () => {
//     let fileDay = _dateUtil.GET_DATE("YYMMDD", "DAY",0);
//
//     start('CONTRACT', 'contractClear',fileDay); // 신규 심사 통과후 체결이행동의 완료시 발송 알림톡
// });
let fileDay = _dateUtil.GET_DATE("YYMMDD", "DAY",0);
start('CONTRACT', 'contractClear',fileDay); // 신규 심사 통과후 체결이행동의 완료시 발송 알림톡

// cron.schedule('30 30 09,12,15 * * *', () => {
//
//     let fileDay = _dateUtil.GET_DATE("YYMMDD", "DAY",0);
//
//
//     start('CONTRACT', 'delay',fileDay); // 신규 심사 통과후 체결이행동의 완료시 발송 알림톡
// });
//     let fileDay = _dateUtil.GET_DATE("YYMMDD", "DAY",0);
//     start('CONTRACT', 'delay',fileDay); // 신규 심사 통과후 체결이행동의 완료시 발송 알림톡

// cron.schedule('30 35 09 * * *', () => {
//
//     let fileDay = _dateUtil.GET_DATE("YYMMDD", "DAY",0);
//
//
//     start('CONTRACT', 'all',fileDay); // 신규 심사 통과후 체결이행동의 완료시 발송 알림톡
// });
// let fileDay = _dateUtil.GET_DATE("YYMMDD", "DAY",0);
// start('CONTRACT', 'all',fileDay); // 신규 심사 통과후 체결이행동의 완료시 발송 알림톡

// cron.schedule('30 00 */1 * * *', () => { // 1시간마다 체크로 변경해야함
//
//     let fileDay = _dateUtil.GET_DATE("YYMMDD", "DAY",0);
//
//
//     start('CONTRACT', 'com',fileDay); // 신규 심사 통과후 체결이행동의 완료시 발송 알림톡
// });
// let fileDay = _dateUtil.GET_DATE("YYMMDD", "DAY",0);
// start('CONTRACT', 'com',fileDay); // 신규 심사 통과후 체결이행동의 완료시 발송 알림톡

/**
 *
 * @param JOB : bikeKakaoSendContract-Job
 * @param checkType : 알림톡발송타입구분
 * @param fileDay : 전송일
 * @returns {Promise<void>}
 */
async function start(JOB, checkType,fileDay){


    /** 순차실행을 이용하여 진행 **/
    for (const service of svs) {
        var schema = "";
        var bpk = "";
        schema = service.dbAccess;
        bpk = service.bpk;

        if(banList.indexOf(bpk) < 0){
            console.log("작동 대상 업체 ", service.serviceName);
            console.log("작동 대상 업체 ", bpk);
            sendMsg(JOB, checkType, fileDay, bpk, schema, service);

        }else{
            console.log("제외 대상 업체 ", service.serviceName);

        }




    }




}


/**
 *
 * @param JOB : bikeKakaoSendConttrac-job
 * @param checkType : 알림톡발송타입구분
 * @param fileDay : 전송일
 * @param bpk : 업체키
 * @param schema : db스키마
 * @param bizInfo : 업체정보
 */
function sendMsg(JOB, checkType, fileDay, bpk, schema, bizInfo){

    let job = JOB;

    let query = "CALL bikeKakaoSendContract("+
        "'" + job + "'" +
        ", '" + '_limitCount' + "'" +
        ", '" + checkType + "'" +
        ", '" + fileDay + "'" +
        ", '" + bpk + "'" +
        ", '" + 0 + "'" +
        ", '" + "resultMsg" + "'" +
        ");";


    console.log(`start Query : ${query}`);


    _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
        console.log('MYSQL RESULT : ', result[0]);
        let data = result[0];
        let valueRow = data;

        /** 비동기 처리 ***/
        const timer = ms => new Promise(res=>setTimeout(res,ms));
        load(valueRow);
        async function load(valueRow){
            let obj;
            for(var i=0; i< valueRow.length; i++){
                obj = valueRow[i];
                console.log('responseObj : ',obj);
                sendData(obj, JOB, checkType, bpk,  schema, bizInfo);
                await timer(1000);
            }
            console.log("end")
        }

    });


}


function sendData(obj, JOB, checkType, bpk, schema, bizInfo){
    bpk = 10;
    let msg = ""
    if(checkType == 'contractClear'){ // 체결이행 완료 알림톡
        let data = {
            platform:bizInfo.serviceName,
            cell:obj.cell,
            dName:obj.bdName,
            dCarNum:obj.bdCarNum,
            infoMsg: "■ 유의사항\n" +
                "- 신규 가입시 보험의 책임개시는 다음날 00시 기준이나, 플랫폼사 연동 시작 시간에 따라 상이할 수 있습니다.\n" +
                "- 신규 가입이 아닌, 기존 시간제보험 통과 라이더님의 경우 이 알림이후 운행부터 적용됩니다.\n" +
                "- 운행 오토바이가 변경될 경우, 반드시 보험사에 통보해주세요.\n" +
                "- 계약한 오토바이의 책임보험 용도 및 계약 내용 변경 시, 반드시 보험사에 통보해주세요.\n" +
                "- 계약시 등록한 오토바이 및 보험 계약 내용과 상이할 경우 보상에 제한이 있을 수 있습니다.\n" +
                "- 배달 중 사고 발생 시 현대해상 고객센터로 접수해주세요. (1588-5656 )\n",

        };
        if(bpk == '1'){
            msg = _kakaoMsg.contractComplete_baemin(data);
        }else{
            msg = _kakaoMsg.contractComplete_gita(data);
        }

    }
    if(checkType =='delay'){ // 기존 기명자들한테는 받지 않기로함 * 갱신때 받으면 됨.
        let data = {
            platform:bizInfo.serviceName,
            bdpk:obj.bdpk,
            cell:obj.cell,
            dName:obj.bdName,
            dCarNum:obj.bdCarNum,
            resultWhy:obj.remark,
            contractKey:obj.recvContractKey,
            // infoMsg: "■ 유의사항\n" +
            //     "- 보험심사 통과이후 체결이행 동의를 하지 않은 경우 시간제보험 적용이 되지 않습니다.\n" +
            //     "- 체결이행 동의를 하지 않은 상태에서의 운행 중 사고 발생 시 시간제보험이 적용되지 않습니다.\n" +
            //     "- 계약시 등록한 오토바이 및 보험 계약 내용과 상이할 경우 보상에 제한이 있을 수 있습니다.\n",
        };
        msg = _kakaoMsg.contract_delay(data);
    }

    if(checkType =='all'){ // 기존 심사 통과자들한테 알림톡 ~
        let data = {
            platform:bizInfo.serviceName,
            cell:obj.cell,
            dName:obj.bdName,
            dCarNum:obj.bdCarNum,
            infoMsg: "■ 유의사항\n" +
                "- (2024-00-00) 까지 체결이행 동의가 진행되지 않은 라이더님의 경우 보험해지가 되어, 시간제보험 이용이 불가합니다.\n" +
                "- (2024-00-00) 이후부터 체결이행 동의를 하지 않은 상태에서 운행 중 사고 발생 시 보험이 적용되지 않습니다.\n" +
                "- 계약한 오토바이의 책임보험 용도 및 계약 내용 변경 시, 반드시 보험사에 통보해주세요. \n" +
                "- 계약시 등록한 오토바이 및 보험 계약 내용과 상이할 경우 보상에 제한이 있을 수 있습니다. \n" +
                "- 배달 중 사고 발생 시 현대해상 고객센터로 접수해주세요. (1588-5656 )\n" +
                "- 체결이행 동의를 진행을 원하지 않거나 미수신을 원할 경우 아래 링크에서 미수신동의 바랍니다\n"
        };
        msg = _kakaoMsg.bike004(data);
    }

    // if(checkType == 'com'){
    //     let data = {
    //         platform:bizInfo.serviceName,
    //         cell:obj.cell,
    //         dName:obj.bdName,
    //         dCarNum:obj.bdCarNum,
    //     };
    //     msg = _kakaoMsg.bike004(data);
    // }



    network_api.sendAligoKakao(msg).then(function(data){

        console.log('RESPONSE :', data);


        let job = 'RS';
        let dpk = "0";
        let dCell = obj.cell;
        let dName = "";
        let dDambo = "";
        let dCarNum = "";
        let pState = checkType;

        msg = JSON.stringify(msg);
        let fileDay = _baseUtil.getTimeyymmddhhmmss('dash');

        let query = "CALL bikeKakaoSendRS(" +
            "'" + job + "'" +
            ", '" + bpk + "'" +
            ", '" + dpk + "'" +
            ", '" + dCell + "'" +
            ", '" + dName + "'" +
            ", '" + dDambo + "'" +
            ", '" + dCarNum + "'" +
            ", '" + msg + "'" +
            ", '" + pState + "'" +
            ", '" + fileDay + "'" +
            ");";



        console.log(query);
        _mysqlUtil.mysql_proc_exec(query, schema).then(function(result){
            // res.json(result)
            console.log('MYSQL RESULT : ', result[0]);
            let d = result[0][0];

            let resData  ={
                rCnt : d.rCnt,
                spk : d.spk,
                receiver : d.receiver,
                testmode : d.testmode
            };

            // res.json(resData);

        });

    });


}




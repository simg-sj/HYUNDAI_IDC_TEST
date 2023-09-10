var unirest = require('unirest');
const crypto = require('crypto');
const {
    v1: uuidv1,
    v4: uuidv4,
} = require('uuid');

var u1 = uuidv1();
var u2 = uuidv4();

console.log(u1.toUpperCase());
console.log(u2.toUpperCase());



/** 01. KEY 와 IV 값 생성하기 **/
// key 생성 32비트 짜리
crypto.randomBytes(16, (err, buf) => {
    console.log('KEY : ', buf.toString('hex').toUpperCase());
});

// iv 생성 16비트 짜리
crypto.randomBytes(8, (err, buf) => {
    console.log('IV : ', buf.toString('hex'));
});


/** 02. 값 체 크하기 KEY는 AES256일경우 256bit, 32바이트 문자열, iv는 16바이트 문자열**/
let key = '9d3c3baea8a704e6bd3906d9233d100e';
let iv = 'c49f39ac4bc7ba90';
console.log('암호화 키  : ', key);
console.log('암호화 키 길이 : ', key.length); // 32자리가 나와야함
console.log('IV  : ', iv);
console.log('IV 길이 : ', iv.length); // 16자리가 나와야함
// accientRouteTest();


// accientRouteTestClient();

const _apiUtil = require('../UTIL/network_lib');
const _mysqlUtil = require('../UTIL/sql_lib');
const deployConfig = require("../SERVER/deploy_config.json");
const serviceList = require("../CONFIG/service_config");
var services = new serviceList();
var svs = services[deployConfig.deploy];
// accessTest();
function accessTest(){
    /** 순차실행을 이용하여 진행 **/
    for (const service of svs) {

        let query = 'SHOW STATUS LIKE \'Threads_connected\';';
        // let query = 'flush hosts;';

        _mysqlUtil.mysql_proc_exec(query, service.dbAccess).then(function(result){
           console.log(service.serviceName, result);
            // console.log('MYSQL RESULT : ',result);
            // console.log(result[0]);


        });

    }
}

baeminAccdeint();
function baeminAccdeint(){

    let sendData =
        {
            "apiDriverId": 'B100000406',
            "drivingId": '20220805-21081331038897163796-001',
            "investigateDateTime": '2022-08-05T17:36:00+0900',
        };


    _apiUtil.getBaeminBikeGps(sendData).then(function(result){
        console.log(result);

    });
}

function accientRouteTest(){





   var sendData =  {
        "reqDrvgID": "B3100000006",
        "reqAcdtRcpNo": "2204024020",
        "reqAcdtDtm": "20220413200000",
        "reqDrvrID": "V3300000006",
        "reqPlyNo": "M2022598784600000"
    }
    //




    var url = "http://localhost:30118";
    console.log("End point is : ", url);
    console.log("Send Data is : ", sendData);



    unirest.post(url)
        .timeout(30000)
        .headers(
            {
                'Content-Type': 'application/x-www-form-urlencoded',
            })
        .type('json')
        .json(sendData)
        .end(function (response) {
            console.log('RESPONSE : ', response.body);

            var d = {
                'receive':response.body,
            };
            console.log(d);




        });


}




function accientRouteTestClient(){





    let sendData =
        {
            "apiDriverId": "V3300000006",
            "drivingId": "200222222",
            "investigateDateTime": "20220416180000",
        };




    var url = "https://connect-bike-dealver.simginsu.net/api/v1/request/client/accident";
    console.log("End point is : ", url);
    console.log("Send Data is : ", sendData);



    unirest.post(url)
        .timeout(30000)
        .headers(
            {
                'Content-Type': 'application/x-www-form-urlencoded',
            })
        .type('json')
        .json(sendData)
        .end(function (response) {
            console.log('RESPONSE : ', response.body);

            var d = {
                'receive':response.body,
            };
            console.log(d);




        });


}

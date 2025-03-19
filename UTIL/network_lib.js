var unirest = require('unirest');
var hConfig = require('../CONFIG/hyundai_config');
const deployConfig = require("../SERVER/deploy_config.json");
var hyundai_con = new hConfig();
var connection = hyundai_con[deployConfig.deploy];


var accidentConfig = require("../CONFIG/accident_config");
var accident_con = new accidentConfig();
var accon = accident_con[deployConfig.deploy];



module.exports={
    network_h001:function(data){
        let url = connection.host;
        let port = connection.port;
        let endpoint = "http://"+url + ":" +port;


        return new Promise(function(resolve,reject){
            console.log("SENDING : ", endpoint, data);

            unirest.post(endpoint)
                .headers(
                    {
                        'Content-Type':'application/json;charset=UTF-8'
                    }
                )
                .type('json')
                .json(data)
                .end(function(response){
                    console.log('ERROR CHECK', response.error);

                    if(response.error){
                        let res = {
                            'code':response.error.status,
                            'receive':response.body
                        }
                        resolve(res);
                    }else{
                        let res = {
                            'code':200,
                            'receive':response.body
                        }
                        resolve(res);
                    }
                })
        })
    },
    slackWebHook : function(data, url){
        if(!url){
            var BASEURL = "https://hooks.slack.com/services/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";
            url = BASEURL;
        }

        console.log(url);
        console.log("SLACK : ", data);

        return new Promise(function (resolve, reject) {

            unirest.post(url)

                .headers(
                    {
                        'Content-Type': 'application/json',
                    })
                .type('json')
                .json(data)
                .end(function (response) {
                    console.log('from SLACK RESPONSE : ', response.body);
                    // console.log('send ', data);
                    let d = {
                        'receive':response.body,
                        // 'sendD':data

                    }
                    resolve(d);
                });
        });
    },
    simg_slackWebHook : function(data){

        var BASEURL = "https://center-api.simg.kr/v1/api/simg/slackbot";


        console.log(BASEURL);
        console.log("SLACK : ", data);

        return new Promise(function (resolve, reject) {

            unirest.post(BASEURL)

                .headers(
                    {
                        'Content-Type': 'application/json',
                    })
                .type('json')
                .json(data)
                .end(function (response) {
                    console.log('from SLACK RESPONSE : ', response.body);
                    // console.log('send ', data);
                    let d = {
                        'receive':response.body,
                        // 'sendD':data

                    }
                    resolve(d);
                });
        });
    },
    getDilverBikeGps : function(data){

        var BASEURL ="";
        var ROUTE = "";
        var bpk = 3; // ONLY DILVER

        accon.forEach(function(e){
            if(e.bpk == bpk){
                BASEURL = e.apiUrl;
                ROUTE = e.route;
            }
        });




        var url = BASEURL + ROUTE;
        console.log("딜버 사고접수 URL ", url);


        return new Promise(function (resolve, reject) {

            unirest.post(url)

                .headers(
                    {
                        'Content-Type': 'application/json',
                    })
                .type('json')
                .json(data)
                .end(function (response) {
                    console.log('from  RESPONSE : ', response.body);
                    // console.log('send ', data);
                    let d = {
                        'receive':response.body,
                        // 'sendD':data

                    }
                    resolve(d);
                });
        });

    },
    getBaeminBikeGps : function(data){

        var BASEURL ="";
        var ROUTE = "";
        var key = "ED3EC342-9A34-4A90-81EE-AFCFD299886E";
        var bpk = 1;

        accon.forEach(function(e){
            if(e.bpk == bpk){
                BASEURL = e.apiUrl;
                ROUTE = e.route;
            }
        });

        const deployConfig = require("../SERVER/deploy_config.json");
        if(deployConfig.deploy=="production"){
            key = "ED3EC342-9A34-4A90-81EE-AFCFD299886E";

        }



        var url = BASEURL + ROUTE;


        console.log("배민 사고정보 요청 데이터 : ", data);
        console.log("배민 사고정보 요청 URL : ", url);



        return new Promise(function (resolve, reject) {

            unirest.post(url)

                .headers(
                    {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-BIKE-INSURANCE-HYUNDAI-SECRET': key,
                    })
                .type('json')
                .json(data)
                .end(function (response) {
                    console.log('from  RESPONSE : ', response.body);
                    // console.log('send ', data);


                    if(!response.body.deliveries[0]){

                        let t = {pickupAddress : "",deliveryAddress:"" };
                        response.body.deliveries.push(t);
                    }

                    if(!response.body.deliveries[0]){
                        let t = {pickupAddress : "",deliveryAddress:"" };
                        response.body.deliveries.push(t);
                    }


                    let d = {
                        'receive':response.body,
                        // 'sendD':data

                    }
                    resolve(d);
                });
        });

    },
    getPlusAndSOftBikeGps : function(data){

        var BASEURL ="";
        var ROUTE = "";
        var bpk = 5; // ONLY DILVER

        accon.forEach(function(e){
            if(e.bpk == bpk){
                BASEURL = e.apiUrl;
                ROUTE = e.route;
            }
        });




        var url = BASEURL + ROUTE;
        console.log(url);


        return new Promise(function (resolve, reject) {

            unirest.post(url)

                .headers(
                    {
                        'Content-Type': 'application/json',
                    })
                .type('json')
                .json(data)
                .end(function (response) {
                    console.log('from  RESPONSE : ', response.body);
                    // console.log('send ', data);
                    let d = response.body;
                    resolve(d);
                });
        });

    },
    getPlatformBikeGps : function(data, bpk){

        var BASEURL ="";
        var ROUTE = "";

        accon.forEach(function(e){
            if(e.bpk == bpk){
                BASEURL = e.apiUrl;
                ROUTE = e.route;
            }
        });




        var url = BASEURL + ROUTE;
        console.log(url);


        return new Promise(function (resolve, reject) {

            unirest.post(url)

                .headers(
                    {
                        'Content-Type': 'application/json',
                    })
                .type('json')
                .json(data)
                .end(function (response) {
                    console.log('from  RESPONSE : ', response.body);
                    // console.log('send ', data);
                    let d = {
                        'receive':response.body,
                        // 'sendD':data

                    }
                    resolve(d);
                });
        });

    },

    sendAligoKakao: function(data){
        let _this = this;

        return new Promise(function (resolve, reject) {

            let endpoint = "https://hvu4nwsphl.execute-api.ap-northeast-2.amazonaws.com" + "/prod/";
            console.log(endpoint);

            unirest.post(endpoint)
                .headers(
                    {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    })
                .type('json')
                .json(data)
                .end(function (response) {

                    console.log('send ', data);
                    console.log('from AWS LAMBDA_SEND: ', response.body);

                    let d = {
                        'receive':response.body,
                        'sendD':data

                    }
                    resolve(d);
                });
        });
    },
    sendAligoSms: function(data){
        let _this = this;

        return new Promise(function (resolve, reject) {
            console.log('Aligo Lambda AWS SERVICE ~!');
            unirest.post('https://0j8iqqmk2l.execute-api.ap-northeast-2.amazonaws.com/aligo-send')
                .headers(
                    {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    })
                .type('json')
                .json(data)
                .end(function (response) {
                    console.log('from AWS LAMBDA_SEND: ', response.body);
                    console.log('send ', data);
                    let d = {
                        'receive':response.body,
                        'sendD':data

                    }
                    resolve(d);
                });
        });
    }
}
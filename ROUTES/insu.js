var express = require('express');
var router = express.Router();





var underwriteRoute  = require('./underwriteResult');
var accidentRoute = require('./accidentRequest');
var renewPolicyRoute = require('./renew_policy');




router.get('/', function(req, res, next) {
    console.log("PROTOCOL: ", req.get('x-forwarded-proto'));
    console.log("REMOTE IP : ", req.get('x-forwarded-for'));
    console.log("ORIGIN : ", req.get('origin'));
    console.log("HOST : ", req.headers.host);
    console.log("AGENT : ", req.get('User-Agent'));
    console.log("CONTENT-TYPE : ", req.get('content-type'));
    res.status(200).send('respond with a resource :: IDC API SIMG SERVER');

});

/***
 *
 * 심사요청 보냈을경우 해당 URL 통해서 전달됨 실시간으로
 *
 *
 */
router.post('/', function(req, res, next) {
    console.log("PROTOCOL: ", req.get('x-forwarded-proto'));
    console.log("REMOTE IP : ", req.get('x-forwarded-for'));
    console.log("ORIGIN : ", req.get('origin'));
    console.log("HOST : ", req.headers.host);
    console.log("AGENT : ", req.get('User-Agent'));
    console.log("CONTENT-TYPE : ", req.get('content-type'));



    var request_data = req.body;
    console.log(request_data);






    if(request_data.reqUnwrRslt){
        console.log("심사 결과 라우트");
        res.status(200).send(request_data);

        underwriteRoute.UNDERWRITERESULT(request_data).then(function(result){
            console.log(result);

        })
    }
    if(request_data.reqAcdtRcpNo){
        console.log("사고 조회 라우트");
        accidentRoute.ACCIDENTREQUEST(request_data).then(function(result){
            res.status(200).send(result);
        })
    }

    /** **/
    if(request_data.bizCode == '009'){
        console.log("증권번호 암호화값 라우트 수신 라우트");
        renewPolicyRoute.RENEW_POLICY_CIDATA(request_data).then(function(result){
           res.status(200).send(result);
        });
    }











});



module.exports = router;
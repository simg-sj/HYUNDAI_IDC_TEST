/****
 *
 *
 * 현대 접근정보 30118
 * 심사결과
 * 사고조회 라우트 한곳으로 옴
 *
 *
 *
 */



var express = require('../node_modules/express');
var bodyParser  = require("body-parser");
var app = express();
var port = 30118;
var insuRoute = require("../ROUTES/insu");
var checkRoute = require("../ROUTES/check_plan");
const deployConfig = require("../SERVER/deploy_config.json");

var allowCORS = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); //*,
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, XMLHttpRequest');
    (req.method === 'OPTIONS') ?
        res.send(200) :
        next();
};

app.use(bodyParser({limit: '50mb'}));  // pdf body 용량문제 해결
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(allowCORS); // localhost 에서 개발할 때 이걸 열어주지 않으면 들어올 수 없다


app.use('/', insuRoute);
app.use('/check', checkRoute);






app.listen(port, function() {
    console.log(deployConfig.deploy);
    console.log('connection for Server' + port);

});

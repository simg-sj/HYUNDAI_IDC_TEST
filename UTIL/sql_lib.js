/**
 * 작성자 : 유종태
 * 작성일 : 2020.05.18
 * 내용 :
 * mysql_proc_exec DB 접속용
 * msg_mysql_proc_exec MSG 데이터
 * log_exec Log 용
 *
 *
 */
var mysql = require("mysql");
var Config = require('../CONFIG/db_config.js');
var Con = new Config();
const _apiUtil = require("./network_lib");


module.exports = {

    mysql_proc_exec: function(q, schema){

        console.log('schema', schema);

        return new Promise(function (resolve, reject) {

            var dbConnection = mysql.createPool(Con[schema]);

            // console.log(dbConnection);
            // console.log(schema);


            dbConnection.getConnection(function (err, connection) {  //.getConnection 메소드 err와 connection 한경우 두가지 내부콜백함수

                if (err) {
                    console.log(err);
                    console.log("MYSQL ERROR 코드 : ", err.code);

                    var Co = JSON.stringify(Con[schema]);
                    var msg ="[ERROR] 실패 쿼리 : " + "Schema : " + Co+ "CODE : "+ err.code +" Query : "+ q;
                    var data = {
                        "channel": "#개발팀",
                        "username": "현대해상 시간제 보험 ",
                        "text": msg,
                        "icon_emoji": ":ghost:"
                    };

                    _apiUtil.slackWebHook(data).then(function(result){
                        console.log(result);
                    })
                    resolve(err);
                    return
                }

                connection.query(q, function (err, result) {  //query를 던짐

                    var error = false;  // 에러가 없다면 false
                    if (err) {
                        error = true;  // 에러가 있다면 true
                        console.log(err);  //console창에 error값 출력
                        //console.log(result);

                    }
                    resolve(result);
                    // res.status(200).json(result);

                    connection.destroy();
                    connection.release();

                });
            });
        });
    },
    mysql_proc_exec_multi: function (query, values, schema ){

        var dbConnection = mysql.createPool(Con[schema]);

        return new Promise(function (resolve, reject) {

            dbConnection.getConnection(function (err, connection) {  //.getConnection 메소드 err와 connection 한경우 두가지 내부콜백함수

                if (err) {
                    console.log(err);
                    console.log('에러남');
                }

                connection.query(query, [values],function (err, result) {  //query를 던짐

                    var error = false;  // 에러가 없다면 false
                    if (err) {
                        error = true;  // 에러가 있다면 true
                        // console.log(err);  //console창에 error값 출력
                        console.log(err);

                        //console.log(result);

                    }
                    resolve(result);
                    // res.status(200).json(result);


                    connection.release();

                });
            });
        });

    },


};

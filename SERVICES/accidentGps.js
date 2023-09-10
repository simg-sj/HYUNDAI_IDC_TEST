const _util = require("../UTIL/base_lib");
const _dateUtil = require("../UTIL/date_lib");
const _apiUtil = require('../UTIL/network_lib');
const _mysqlUtil = require('../UTIL/sql_lib');
const _baseUtil = require('../UTIL/base_lib');




module.exports = {
    /**
     *  업체별 사고 GPS 기록 가져오기
     *
     *
     */
    BAEMIN: function(request_data, schema, bpk){


        console.log("BAEMIN ACCIDENT REQUEST", request_data);
        console.log(schema);
        console.log(bpk);


        let job = "SEARCH";
        let gpspk = "";
        let driverId = request_data.resDrvrID;
        let drivingId = request_data.reqDrvgID;
        let startedTime = "";
        let finishedTime = "";
        let phoneNumber = "";
        let locationRecordDateTime = "";
        let searchDateTime = "";
        let lat = "";
        let lng = "";
        let message = "";
        let cancelType = "";
        let pickupPosition = "";
        let finishPosition = "";
        let insureNumber = request_data.reqPlyNo;
        let accidentNumber = request_data.reqAcdtRcpNo;
        let accidentDate = request_data.reqAcdtDtm;




        let query = "CALL accidentGps(" +
            "'" + job + "'" +
            ", '" + gpspk + "'" +
            ", '" + driverId + "'" +
            ", '" + drivingId + "'" +
            ", '" + startedTime + "'" +
            ", '" + finishedTime + "'" +
            ", '" + phoneNumber + "'" +
            ", '" + locationRecordDateTime + "'" +
            ", '" + searchDateTime + "'" +
            ", '" + lat + "'" +
            ", '" + lng + "'" +
            ", '" + message + "'" +
            ", '" + cancelType + "'" +
            ", '" + pickupPosition + "'" +
            ", '" + finishPosition + "'" +
            ", '" + insureNumber + "'" +
            ", '" + accidentNumber + "'" +
            ", '" + accidentDate + "'" +
            ");";



        console.log(query);

        return new Promise(function (resolve, reject) {


            _mysqlUtil.mysql_proc_exec(query, schema).then(function(result) {

                let d = result[0][0];
                let code =result[0][0].code;
                let gubun =result[0][0].gubun;

                console.log(d);

                if(code=='200'){

                    console.log('GPS 조회 내역없음 ~~~~~~~ 조회시작');

                    let apiDriverId = result[0][0].apiDriverId;
                    let bizDrivingId = result[0][0].bizDrivingId;
                    let startedTime = result[0][0].startedTime;
                    let finishedTime = result[0][0].finishedTime;
                    let returnVal = 'GPS 내역없음 ' + apiDriverId;
                    // res.json(returnVal)


                    let sendData =
                        {
                            "apiDriverId": apiDriverId,
                            "drivingId": bizDrivingId,
                            "investigateDateTime": _util.TimeIsoConvert(accidentDate),
                        };

                    console.log('요청 정보 : ', sendData);



                    /**  이륜차일경우 **/
                    if(gubun=='BIKE'){
                        _apiUtil.getBaeminBikeGps(sendData).then(function(result){

                            console.log(result);


                            let query = "CALL accidentGps(" +
                                "'" + "SAVE" + "'" +
                                ", '" + "0" + "'" +
                                ", '" + "" + "'" +
                                ", '" + result.receive.drivingId + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + result.receive.locationRecordDateTime + "'" +
                                ", '" + result.receive.investigateDateTime + "'" +
                                ", '" + result.receive.lat + "'" +
                                ", '" + result.receive.lng + "'" +
                                ", '" + "SEARCH FINISH" + "'" +
                                ", '" + "0" + "'" +
                                ", '" + result.receive.deliveries[0].pickupAddress + "'" +
                                ", '" + result.receive.deliveries[0].deliveryAddress + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ");";


                            console.log(query);

                            _mysqlUtil.mysql_proc_exec(query, schema);





                            let success = {
                                "resDrvrID": apiDriverId,
                                // "resDrvgID":result.receive.drivingId,
                                "resDrvgID":request_data.reqDrvgID,
                                "resDrvgStDtm":startedTime,
                                "resDrvgEdDtm":finishedTime,
                                "resDrvgCancYn":"0",
                                "resPosInfoInvstDtm":    _util.isoTimeConvert( result.receive.investigateDateTime),
                                "resPosInfoRecDtm":_util.isoTimeConvert( result.receive.locationRecordDateTime) ,
                                "resLatd":result.receive.lat,
                                "resLgtd":result.receive.lng,
                                "resDlvStAddr":result.receive.deliveries[0].pickupAddress,
                                "resDlvEdAddr":result.receive.deliveries[0].deliveryAddress
                            };

                            // res.json(success);
                            resolve(success)
                        }).catch(function(e){
                            console.log('NO DRIVING ID MATCH');
                            let success = {
                                "resDrvrID": request_data.reqDrvrID,
                                "resDrvgID":request_data.reqDrvgID,
                                "resDrvgStDtm":"",
                                "resDrvgEdDtm":"",
                                "resDrvgCancYn":"",
                                "resPosInfoInvstDtm":"",
                                "resPosInfoRecDtm":"",
                                "resLatd":"",
                                "resLgtd":"",
                                "resDlvStAddr":"",
                                "resDlvEdAddr":""
                            };

                            // res.json(success);
                            resolve(success)
                        });
                    }


                }else if (code=='300'){

                    console.log('GPS 조회 내역있음');



                    console.log(result[0][0]);
                    var responseDate = result[0][0];

                    let success = {
                        "resDrvrID": responseDate.driverId,
                        "resDrvgID":request_data.reqDrvgID,
                        "resDrvgStDtm":responseDate.startedDateTime,
                        "resDrvgEdDtm":responseDate.finishedDateTime,
                        "resDrvgCancYn":"0",
                        "resPosInfoInvstDtm":    _util.isoTimeConvert( responseDate.searchDateTime),
                        "resPosInfoRecDtm":_util.isoTimeConvert( responseDate.locationRecordDateTime) ,
                        "resLatd":responseDate.lat,
                        "resLgtd":responseDate.lng,
                        "resDlvStAddr":responseDate.pickupPosition,
                        "resDlvEdAddr":responseDate.finishPosition
                    };

                    // res.json(success);
                    resolve(success)


                }else if (code == '400'){

                    console.log('NO DRIVING ID MATCH');
                    let success = {
                        "resDrvrID": request_data.reqDrvrID,
                        "resDrvgID":request_data.reqDrvgID,
                        "resDrvgStDtm":"",
                        "resDrvgEdDtm":"",
                        "resDrvgCancYn":"",
                        "resPosInfoInvstDtm":"",
                        "resPosInfoRecDtm":"",
                        "resLatd":"",
                        "resLgtd":"",
                        "resDlvStAddr":"",
                        "resDlvEdAddr":""
                    };

                    // res.json(success);
                    resolve(success)



                }else{
                    console.log('NO DRIVING ID MATCH');
                    let success = {
                        "resDrvrID": request_data.reqDrvrID,
                        "resDrvgID":request_data.reqDrvgID,
                        "resDrvgStDtm":"",
                        "resDrvgEdDtm":"",
                        "resDrvgCancYn":"",
                        "resPosInfoInvstDtm":"",
                        "resPosInfoRecDtm":"",
                        "resLatd":"",
                        "resLgtd":"",
                        "resDlvStAddr":"",
                        "resDlvEdAddr":""
                    };

                    // res.json(success);
                    resolve(success)
                }


            });

        });








    },

    DILVER: function(request_data, schema, bpk) {
        console.log("DILVER ACCIDENT REQUEST", request_data);
        console.log(schema);
        console.log(bpk);


        let job = "SEARCH";
        let gpspk = "";
        let driverId = request_data.resDrvrID;
        let drivingId = request_data.reqDrvgID;
        let startedTime = "";
        let finishedTime = "";
        let phoneNumber = "";
        let locationRecordDateTime = "";
        let searchDateTime = "";
        let lat = "";
        let lng = "";
        let message = "";
        let cancelType = "";
        let pickupPosition = "";
        let finishPosition = "";
        let insureNumber = request_data.reqPlyNo;
        let accidentNumber = request_data.reqAcdtRcpNo;
        let accidentDate = request_data.reqAcdtDtm;




        let query = "CALL accidentGps(" +
            "'" + job + "'" +
            ", '" + gpspk + "'" +
            ", '" + driverId + "'" +
            ", '" + drivingId + "'" +
            ", '" + startedTime + "'" +
            ", '" + finishedTime + "'" +
            ", '" + phoneNumber + "'" +
            ", '" + locationRecordDateTime + "'" +
            ", '" + searchDateTime + "'" +
            ", '" + lat + "'" +
            ", '" + lng + "'" +
            ", '" + message + "'" +
            ", '" + cancelType + "'" +
            ", '" + pickupPosition + "'" +
            ", '" + finishPosition + "'" +
            ", '" + insureNumber + "'" +
            ", '" + accidentNumber + "'" +
            ", '" + accidentDate + "'" +
            ");";



         console.log(query);

        return new Promise(function (resolve, reject) {


            _mysqlUtil.mysql_proc_exec(query, schema).then(function(result) {

                let d = result[0][0];
                let code =result[0][0].code;
                let gubun =result[0][0].gubun;

                console.log(d);

                if(code=='200'){

                    console.log('GPS 조회 내역없음 ~~~~~~~ 조회시작');

                    let apiDriverId = result[0][0].apiDriverId;
                    let bizDrivingId = result[0][0].bizDrivingId;
                    let startedTime = result[0][0].startedTime;
                    let finishedTime = result[0][0].finishedTime;
                    let returnVal = 'GPS 내역없음 ' + apiDriverId;
                    // res.json(returnVal)


                    let sendData =
                        {
                            "apiDriverId": apiDriverId,
                            "drivingId": bizDrivingId,
                            "investigateDateTime": accidentDate,
                        };

                     console.log('요청 정보 : ', sendData);



                    /**  이륜차일경우 **/
                    if(gubun=='BIKE'){
                        _apiUtil.getDilverBikeGps(sendData).then(function(result){

                            console.log(result);


                            let query = "CALL accidentGps(" +
                                "'" + "SAVE" + "'" +
                                ", '" + "0" + "'" +
                                ", '" + "" + "'" +
                                ", '" + result.receive.drivingId + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + result.receive.locationRecordDateTime + "'" +
                                ", '" + result.receive.investigateDateTime + "'" +
                                ", '" + result.receive.lat + "'" +
                                ", '" + result.receive.lng + "'" +
                                ", '" + "SEARCH FINISH" + "'" +
                                ", '" + "0" + "'" +
                                ", '" + result.receive.deliveries[0].pickupAddress + "'" +
                                ", '" + result.receive.deliveries[0].deliveryAddress + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ");";


                            console.log(query);

                            _mysqlUtil.mysql_proc_exec(query, schema);





                            let success = {
                                "resDrvrID": apiDriverId,
                                "resDrvgID":request_data.reqDrvgID,
                                "resDrvgStDtm":startedTime,
                                "resDrvgEdDtm":finishedTime,
                                "resDrvgCancYn":"0",
                                "resPosInfoInvstDtm":_baseUtil.isoTimeConvert(result.receive.investigateDateTime),
                                "resPosInfoRecDtm":_baseUtil.isoTimeConvert(result.receive.locationRecordDateTime),
                                "resLatd":result.receive.lat,
                                "resLgtd":result.receive.lng,
                                "resDlvStAddr":result.receive.deliveries[0].pickupAddress,
                                "resDlvEdAddr":result.receive.deliveries[0].deliveryAddress
                            };

                            // res.json(success);
                            resolve(success)
                        });
                    }


                }else if (code=='300'){

                    console.log('GPS 조회 내역있음');



                    console.log(result[0][0]);
                    var responseDate = result[0][0];

                        let success = {
                            "resDrvrID": responseDate.driverId,
                            "resDrvgID":request_data.reqDrvgID,
                            "resDrvgStDtm":responseDate.startedDateTime,
                            "resDrvgEdDtm":responseDate.finishedDateTime,
                            "resDrvgCancYn":"0",
                            "resPosInfoInvstDtm":_baseUtil.isoTimeConvert(responseDate.searchDateTime),
                            "resPosInfoRecDtm":_baseUtil.isoTimeConvert(responseDate.locationRecordDateTime),
                            "resLatd":responseDate.lat,
                            "resLgtd":responseDate.lng,
                            "resDlvStAddr":responseDate.pickupPosition,
                            "resDlvEdAddr":responseDate.finishPosition
                        };

                    // res.json(success);
                    resolve(success)


                }else if (code == '400'){

                    console.log('NO DRIVING ID MATCH');
                    let success = {
                        "resDrvrID": request_data.reqDrvrID,
                        "resDrvgID":request_data.reqDrvgID,
                        "resDrvgStDtm":"",
                        "resDrvgEdDtm":"",
                        "resDrvgCancYn":"",
                        "resPosInfoInvstDtm":"",
                        "resPosInfoRecDtm":"",
                        "resLatd":"",
                        "resLgtd":"",
                        "resDlvStAddr":"",
                        "resDlvEdAddr":""
                    };

                    // res.json(success);
                    resolve(success)



                }


            });

        });








    },

    PLUSSOFT: function(request_data, schema, bpk) {
        console.log("PLUSNSOFT ACCIDENT REQUEST", request_data);
        console.log(schema);
        console.log(bpk);


        let job = "SEARCH";
        let gpspk = "";
        let driverId = request_data.resDrvrID;
        let drivingId = request_data.reqDrvgID;
        let startedTime = "";
        let finishedTime = "";
        let phoneNumber = "";
        let locationRecordDateTime = "";
        let searchDateTime = "";
        let lat = "";
        let lng = "";
        let message = "";
        let cancelType = "";
        let pickupPosition = "";
        let finishPosition = "";
        let insureNumber = request_data.reqPlyNo;
        let accidentNumber = request_data.reqAcdtRcpNo;
        let accidentDate = request_data.reqAcdtDtm;




        let query = "CALL accidentGps(" +
            "'" + job + "'" +
            ", '" + gpspk + "'" +
            ", '" + driverId + "'" +
            ", '" + drivingId + "'" +
            ", '" + startedTime + "'" +
            ", '" + finishedTime + "'" +
            ", '" + phoneNumber + "'" +
            ", '" + locationRecordDateTime + "'" +
            ", '" + searchDateTime + "'" +
            ", '" + lat + "'" +
            ", '" + lng + "'" +
            ", '" + message + "'" +
            ", '" + cancelType + "'" +
            ", '" + pickupPosition + "'" +
            ", '" + finishPosition + "'" +
            ", '" + insureNumber + "'" +
            ", '" + accidentNumber + "'" +
            ", '" + accidentDate + "'" +
            ");";



        console.log(query);

        return new Promise(function (resolve, reject) {


            _mysqlUtil.mysql_proc_exec(query, schema).then(function(result) {

                let d = result[0][0];
                let code =result[0][0].code;
                let gubun =result[0][0].gubun;

                console.log(d);

                if(code=='200'){

                    console.log('GPS 조회 내역없음 ~~~~~~~ 조회시작');

                    let apiDriverId = result[0][0].apiDriverId;
                    let bizDrivingId = result[0][0].bizDrivingId;
                    let startedTime = result[0][0].startedTime;
                    let finishedTime = result[0][0].finishedTime;
                    let returnVal = 'GPS 내역없음 ' + apiDriverId;
                    // res.json(returnVal)


                    let sendData =
                        {
                            "apiDriverId": apiDriverId,
                            "drivingId": bizDrivingId,
                            "investigateDateTime": accidentDate,
                        };

                    console.log('요청 정보 : ', sendData);



                    /**  이륜차일경우 **/
                    if(gubun=='BIKE'){
                        _apiUtil.getPlusAndSOftBikeGps(sendData).then(function(result){

                            console.log(result);



                            let query = "CALL accidentGps(" +
                                "'" + "SAVE" + "'" +
                                ", '" + "0" + "'" +
                                ", '" + "" + "'" +
                                ", '" + result.receive.drivingId + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + result.receive.locationRecordDateTime + "'" +
                                ", '" + result.receive.investigateDateTime + "'" +
                                ", '" + result.receive.lat + "'" +
                                ", '" + result.receive.lng + "'" +
                                ", '" + "SEARCH FINISH" + "'" +
                                ", '" + "0" + "'" +
                                ", '" + result.receive.deliveries[0].pickupAddress + "'" +
                                ", '" + result.receive.deliveries[0].deliveryAddress + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ");";


                            console.log(query);

                            _mysqlUtil.mysql_proc_exec(query, schema);





                            let success = {
                                "resDrvrID": apiDriverId,
                                "resDrvgID":request_data.reqDrvgID,
                                "resDrvgStDtm":startedTime,
                                "resDrvgEdDtm":finishedTime,
                                "resDrvgCancYn":"0",
                                "resPosInfoInvstDtm":result.receive.investigateDateTime,
                                "resPosInfoRecDtm":result.receive.locationRecordDateTime,
                                "resLatd":result.receive.lat,
                                "resLgtd":result.receive.lng,
                                "resDlvStAddr":result.receive.deliveries[0].pickupAddress,
                                "resDlvEdAddr":result.receive.deliveries[0].deliveryAddress
                            };

                            // res.json(success);
                            resolve(success)
                        });
                    }


                }else if (code=='300'){

                    console.log('GPS 조회 내역있음');



                    console.log(result[0][0]);
                    var responseDate = result[0][0];

                    let success = {
                        "resDrvrID": responseDate.driverId,
                        "resDrvgID":request_data.reqDrvgID,
                        "resDrvgStDtm":responseDate.startedDateTime,
                        "resDrvgEdDtm":responseDate.finishedDateTime,
                        "resDrvgCancYn":"0",
                        "resPosInfoInvstDtm":responseDate.searchDateTime,
                        "resPosInfoRecDtm":responseDate.locationRecordDateTime,
                        "resLatd":responseDate.lat,
                        "resLgtd":responseDate.lng,
                        "resDlvStAddr":responseDate.pickupPosition,
                        "resDlvEdAddr":responseDate.finishPosition
                    };

                    // res.json(success);
                    resolve(success)


                }else if (code == '400'){

                    console.log('NO DRIVING ID MATCH');
                    let success = {
                        "resDrvrID": request_data.reqDrvrID,
                        "resDrvgID":request_data.reqDrvgID,
                        "resDrvgStDtm":"",
                        "resDrvgEdDtm":"",
                        "resDrvgCancYn":"",
                        "resPosInfoInvstDtm":"",
                        "resPosInfoRecDtm":"",
                        "resLatd":"",
                        "resLgtd":"",
                        "resDlvStAddr":"",
                        "resDlvEdAddr":""
                    };

                    // res.json(success);
                    resolve(success)



                }


            });

        });


    },
    PLATFORM: function(request_data, schema, bpk) {
        console.log("PLATFORM ACCIDENT REQUEST", request_data);
        console.log(schema);
        console.log(bpk);


        let job = "SEARCH";
        let gpspk = "";
        let driverId = request_data.resDrvrID;
        let drivingId = request_data.reqDrvgID;
        let startedTime = "";
        let finishedTime = "";
        let phoneNumber = "";
        let locationRecordDateTime = "";
        let searchDateTime = "";
        let lat = "";
        let lng = "";
        let message = "";
        let cancelType = "";
        let pickupPosition = "";
        let finishPosition = "";
        let insureNumber = request_data.reqPlyNo;
        let accidentNumber = request_data.reqAcdtRcpNo;
        let accidentDate = request_data.reqAcdtDtm;




        let query = "CALL accidentGps(" +
            "'" + job + "'" +
            ", '" + gpspk + "'" +
            ", '" + driverId + "'" +
            ", '" + drivingId + "'" +
            ", '" + startedTime + "'" +
            ", '" + finishedTime + "'" +
            ", '" + phoneNumber + "'" +
            ", '" + locationRecordDateTime + "'" +
            ", '" + searchDateTime + "'" +
            ", '" + lat + "'" +
            ", '" + lng + "'" +
            ", '" + message + "'" +
            ", '" + cancelType + "'" +
            ", '" + pickupPosition + "'" +
            ", '" + finishPosition + "'" +
            ", '" + insureNumber + "'" +
            ", '" + accidentNumber + "'" +
            ", '" + accidentDate + "'" +
            ");";



        console.log(query);

        return new Promise(function (resolve, reject) {


            _mysqlUtil.mysql_proc_exec(query, schema).then(function(result) {

                let d = result[0][0];
                let code =result[0][0].code;
                let gubun =result[0][0].gubun;

                console.log(d);

                if(code=='200'){

                    console.log('GPS 조회 내역없음 ~~~~~~~ 조회시작');

                    let apiDriverId = result[0][0].apiDriverId;
                    let bizDrivingId = result[0][0].bizDrivingId;
                    let startedTime = result[0][0].startedTime;
                    let finishedTime = result[0][0].finishedTime;
                    let returnVal = 'GPS 내역없음 ' + apiDriverId;
                    // res.json(returnVal)


                    let sendData =
                        {
                            "apiDriverId": apiDriverId,
                            "drivingId": bizDrivingId,
                            "investigateDateTime": accidentDate,
                        };

                    console.log('요청 정보 : ', sendData);



                    /**  이륜차일경우 **/
                    if(gubun=='BIKE'){
                        _apiUtil.getPlatformBikeGps(sendData, bpk).then(function(result){

                            console.log(result);



                            let query = "CALL accidentGps(" +
                                "'" + "SAVE" + "'" +
                                ", '" + "0" + "'" +
                                ", '" + "" + "'" +
                                ", '" + result.receive.drivingId + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + result.receive.locationRecordDateTime + "'" +
                                ", '" + result.receive.investigateDateTime + "'" +
                                ", '" + result.receive.lat + "'" +
                                ", '" + result.receive.lng + "'" +
                                ", '" + "SEARCH FINISH" + "'" +
                                ", '" + "0" + "'" +
                                ", '" + result.receive.deliveries[0].pickupAddress + "'" +
                                ", '" + result.receive.deliveries[0].deliveryAddress + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ");";


                            console.log(query);

                            _mysqlUtil.mysql_proc_exec(query, schema);





                            let success = {
                                "resDrvrID": apiDriverId,
                                "resDrvgID":request_data.reqDrvgID,
                                "resDrvgStDtm":startedTime,
                                "resDrvgEdDtm":finishedTime,
                                "resDrvgCancYn":"0",
                                "resPosInfoInvstDtm":result.receive.investigateDateTime,
                                "resPosInfoRecDtm":result.receive.locationRecordDateTime,
                                "resLatd":result.receive.lat,
                                "resLgtd":result.receive.lng,
                                "resDlvStAddr":result.receive.deliveries[0].pickupAddress,
                                "resDlvEdAddr":result.receive.deliveries[0].deliveryAddress
                            };

                            // res.json(success);
                            resolve(success)
                        });
                    }


                }else if (code=='300'){

                    console.log('GPS 조회 내역있음');



                    console.log(result[0][0]);
                    var responseDate = result[0][0];

                    let success = {
                        "resDrvrID": responseDate.driverId,
                        "resDrvgID":request_data.reqDrvgID,
                        "resDrvgStDtm":responseDate.startedDateTime,
                        "resDrvgEdDtm":responseDate.finishedDateTime,
                        "resDrvgCancYn":"0",
                        "resPosInfoInvstDtm":responseDate.searchDateTime,
                        "resPosInfoRecDtm":responseDate.locationRecordDateTime,
                        "resLatd":responseDate.lat,
                        "resLgtd":responseDate.lng,
                        "resDlvStAddr":responseDate.pickupPosition,
                        "resDlvEdAddr":responseDate.finishPosition
                    };

                    // res.json(success);
                    resolve(success)


                }else if (code == '400'){

                    console.log('NO DRIVING ID MATCH');
                    let success = {
                        "resDrvrID": request_data.reqDrvrID,
                        "resDrvgID":request_data.reqDrvgID,
                        "resDrvgStDtm":"",
                        "resDrvgEdDtm":"",
                        "resDrvgCancYn":"",
                        "resPosInfoInvstDtm":"",
                        "resPosInfoRecDtm":"",
                        "resLatd":"",
                        "resLgtd":"",
                        "resDlvStAddr":"",
                        "resDlvEdAddr":""
                    };

                    // res.json(success);
                    resolve(success)



                }


            });

        });








    },


}

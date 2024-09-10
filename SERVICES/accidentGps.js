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


                            let drivingId = "";
                            let locationDateTime = "";
                            let investTime = "";
                            let lat = "";
                            let lng = "";
                            let pickup = "";
                            let delievery = "";

                            drivingId = result.receive.drivingId;
                            locationDateTime = result.receive.locationRecordDateTime;
                            investTime =result.receive.investigateDateTime;
                            lat = result.receive.lat;
                            lng = result.receive.lng;
                            lat = String(lat).padEnd(10,"0");
                            lng = String(lng).padEnd(10,"0");


                            if(!result.receive.deliveries[0].pickupAddress){
                                pickup = "";
                            }else{
                                pickup = result.receive.deliveries[0].pickupAddress;
                            }

                            if(!result.receive.deliveries[0].deliveryAddress){
                                delievery = "";
                            }else{
                                delievery = result.receive.deliveries[0].deliveryAddress;
                            }




                            let query = "CALL accidentGps(" +
                                "'" + "SAVE" + "'" +
                                ", '" + "0" + "'" +
                                ", '" + "" + "'" +
                                ", '" + drivingId + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + "" + "'" +
                                ", '" + locationDateTime + "'" +
                                ", '" + investTime + "'" +
                                ", '" + lat + "'" +
                                ", '" + lng + "'" +
                                ", '" + "SEARCH FINISH" + "'" +
                                ", '" + "0" + "'" +
                                ", '" + pickup + "'" +
                                ", '" + delievery + "'" +
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
                                "resPosInfoInvstDtm":    _util.isoTimeConvert(investTime),
                                "resPosInfoRecDtm":_util.isoTimeConvert(locationDateTime),
                                "resLatd":lat,
                                "resLgtd":lng,
                                "resDlvStAddr":pickup,
                                "resDlvEdAddr":delievery
                            };

                            // res.json(success);
                            resolve(success)
                        }).catch(function(e){
                            console.log('NO DRIVING ID MATCH', e);
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


                    let lat = String(responseDate.lat).padEnd(10,"0");
                    let lng = String(responseDate.lng).padEnd(10,"0");
                    let success = {
                        "resDrvrID": responseDate.driverId,
                        "resDrvgID":request_data.reqDrvgID,
                        "resDrvgStDtm":responseDate.startedDateTime,
                        "resDrvgEdDtm":responseDate.finishedDateTime,
                        "resDrvgCancYn":"0",
                        "resPosInfoInvstDtm":    _util.isoTimeConvert( responseDate.searchDateTime),
                        "resPosInfoRecDtm":_util.isoTimeConvert( responseDate.locationRecordDateTime) ,
                        "resLatd":lat,
                        "resLgtd":lng,
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
        console.log("PLATFORM ACCIDENT REQUEST - data :: ", request_data);
        console.log("PLATFORM ACCIDENT REQUEST - schema :: ", schema);
        console.log("PLATFORM ACCIDENT REQUEST - bpk :: ", bpk);


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

                            console.log('accident result 1 : ', result);

                            let query = ""

                            if (bpk == '11'){
                                console.log('운행아이디 : ',result.receive[0].drivingId);
                                console.log('운행 기록 시간 : ',result.receive[0].locationRecordDateTime);
                                console.log('사고 발생 시간 : ',result.receive[0].investigateDateTime);
                                console.log('위도 : ',result.receive[0].lat);
                                console.log('경도 : ',result.receive[0].lng);
                                console.log('픽업지 ~ : ', result.receive[0].deliveries[0].pickupAddress)
                                console.log('목적지 ~ : ', result.receive[0].deliveries[0].deliveryAddress);

                                query = "CALL accidentGps(" +
                                    "'" + "SAVE" + "'" +
                                    ", '" + "0" + "'" +
                                    ", '" + "" + "'" +
                                    ", '" + result.receive[0].drivingId + "'" +
                                    ", '" + "" + "'" +
                                    ", '" + "" + "'" +
                                    ", '" + "" + "'" +
                                    ", '" + result.receive[0].locationRecordDateTime + "'" +
                                    ", '" + result.receive[0].investigateDateTime + "'" +
                                    ", '" + result.receive[0].lat + "'" +
                                    ", '" + result.receive[0].lng + "'" +
                                    ", '" + "SEARCH FINISH" + "'" +
                                    ", '" + "0" + "'" +
                                    ", '" + result.receive[0].deliveries[0].pickupAddress + "'" +
                                    ", '" + result.receive[0].deliveries[0].deliveryAddress + "'" +
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
                                    "resPosInfoInvstDtm":result.receive[0].investigateDateTime,
                                    "resPosInfoRecDtm":result.receive[0].locationRecordDateTime,
                                    "resLatd":result.receive[0].lat,
                                    "resLgtd":result.receive[0].lng,
                                    "resDlvStAddr":result.receive[0].deliveries[0].pickupAddress,
                                    "resDlvEdAddr":result.receive[0].deliveries[0].deliveryAddress
                                };

                                // res.json(success);
                                resolve(success)
                            }else{
                                console.log('운행아이디 : ',result.receive[0].drivingId);
                                console.log('운행 기록 시간 : ',result.receive[0].locationRecordDateTime);
                                console.log('사고 발생 시간 : ',result.receive[0].investigateDateTime);
                                console.log('위도 : ',result.receive[0].lat);
                                console.log('경도 : ',result.receive[0].lng);
                                console.log('픽업지 ~ : ', result.receive[0].deliveries[0].pickupAddress)
                                console.log('목적지 ~ : ', result.receive[0].deliveries[0].deliveryAddress);

                                query = "CALL accidentGps(" +
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
                            }



                        });
                    }


                }else if (code=='300'){

                    console.log('GPS 조회 내역있음');



                    console.log(result[0][0]);
                    var responseDate = result[0][0];
                    // date 변환
                    responseDate.locationRecordDateTime = _util.getTimeyymmddhhmmss('no');
                    responseDate.searchDateTime = _util.getTimeyymmddhhmmss('no');

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
                    console.log('real response : ', success);

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

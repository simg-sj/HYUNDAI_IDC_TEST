
/**
 * 작성자 : 유종태
 * 작성일 :2020.06.04
 * 내용 :
 *
 * 01. toLocaleString  : 세자리 숫자마다 , 부여
 * 02. getTime : 날짜 YYYYMMDD 로 생성 인자값으로 숫자 -1, 0, 1  들어갈 수 있고 그에따라 오늘날짜 기준으로 계산함
 * 02. zero_plus : 날짜에서 그냥 1 -> 01 로 변환
 * 03. lpad : 왼쪽 문자열 채우기  ( str : 원 문자열, padLen : 최대 채우고자 하는 길이, padStr : 채우고자하는 문자(char))
 * 04. rpad : 우측 문자열 채우기
 * 05. rpadKr : 우측 문자열 채우기 ( 한글 3바이트임을 고려하여 )
 * 06. getByteLength : 바이트 길이 구하기 ( 한글 3바이트임을 고려하여 )
 *
 charByteSize(ch) : 한글자에 대한 byte를 계산합니다.
 getByteLength(s) : 입력된 글자 전체의 byte를 계산해서 알려줍니다.
 cutByteLength(s) : 원하는 byte 만큼 글자를 잘라서 반환합니다.


 * **/

var unirest = require('unirest');
const crypto = require('crypto');
var pkcs7 = require('pkcs7-padding');
let fs = require('fs');
var beautify = require("json-beautify");



module.exports = {

    toLocaleString: function(num){
        if (num == null) {
            return 0;
        }
        let parts = num.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    },
    getTimeyymmddhhmmss: function(format){
        // var v = new Date().toLocaleString("ko-KR", {timeZone: "Asia/Seoul"});
        var v = new Date()
        // v = new Date(v);

        var year = v.getFullYear();
        var month = v.getMonth()+1;
        month = this.zero_plus(month);

        var day = v.getDate();
        day = this.zero_plus(day);

        var hh = v.getHours();
        hh = this.zero_plus(hh);

        var mm = v.getMinutes();
        var mm = this.zero_plus(mm);

        var ss = v.getSeconds();
        ss = this.zero_plus(ss);

        var currentTime =  String(year)+"-"+String(month)+"-"+String(day)+" "+String(hh)+":"+String(mm)+":"+String(ss);
        if(format=='dash'){
            currentTime =  String(year)+"-"+String(month)+"-"+String(day)+" "+String(hh)+":"+String(mm)+":"+String(ss);
        }
        if(format=='no'){
            currentTime =  String(year)+String(month)+String(day)+String(hh)+String(mm)+String(ss);
        }
        if(format=='file'){
            currentTime =  String(year)+String(month)+String(day)+String(hh)+String(mm); // 오류가 생길지 몰라서 시간까지로만 자르자~ 같은시간데에 업로드하면 업데이트 됨..
        }

        // console.log('DATE TIME CALL : ', currentTime);


        return currentTime;
    },
    getTime: function(gapTime){
        var v = new Date().toLocaleString("ko-KR", {timeZone: "Asia/Seoul"});
        v = new Date(v);

        var gapCal = gapTime*24*60*60*1000;
        var gap = new Date(v.getTime()+gapCal).toLocaleString("ko-KR", {timeZone: "Asia/Seoul"});
        gap = new Date(gap);
        v.setTime(gap);

        var year = v.getFullYear();
        var month = v.getMonth()+1;
        month = this.zero_plus(month);

        var day = v.getDate();
        day = this.zero_plus(day);

        var hh = v.getHours();
        hh = this.zero_plus(hh);

        var mm = v.getMinutes();
        var mm = this.zero_plus(mm);

        var ss = v.getSeconds();
        ss = this.zero_plus(ss);

        // var result = year+"-"+month+"-"+day+" "+hh+":"+mm+":"+ss;
        var result = String(year)+String(month)+String(day);
        // console.log('y', year);
        // console.log('m', month);
        // console.log('d', day);
        // console.log('h', hh);
        // console.log('m', mm);
        // console.log('s', ss);
        var currentTime =  String(year)+"-"+String(month)+"-"+String(day)+" "+String(hh)+":"+String(mm)+":"+String(ss);
        // console.log('DATE TIME CALL : ', currentTime);
        // console.log('CHECK TIME : ', result);
        return result;
    },
    getTimeContract: function(gapTime){
        var v = new Date().toLocaleString("ko-KR", {timeZone: "Asia/Seoul"});
        v = new Date(v);

        var gapCal = gapTime*18*60*60*1000;
        var gap = new Date(v.getTime()+gapCal).toLocaleString("ko-KR", {timeZone: "Asia/Seoul"});
        gap = new Date(gap);
        v.setTime(gap);

        var year = v.getFullYear();
        var month = v.getMonth()+1;
        month = this.zero_plus(month);

        var day = v.getDate();
        day = this.zero_plus(day);

        var hh = v.getHours();
        hh = this.zero_plus(hh);

        var mm = v.getMinutes();
        var mm = this.zero_plus(mm);

        var ss = v.getSeconds();
        ss = this.zero_plus(ss);

        // var result = year+"-"+month+"-"+day+" "+hh+":"+mm+":"+ss;
        var result = year+month+day;
        var currentTime =  String(year)+String(month)+String(day)+String(hh)+String(mm)+String(ss);
        console.log('DATE TIME CALL : ', currentTime);
        // console.log('CHECK TIME : ', result);
        return currentTime;
    },
    timeAddMin: function(yyyymmddhhssii, num){

        var year = yyyymmddhhssii.substring(0,4);
        var month = yyyymmddhhssii.substring(4,6);
        var day = yyyymmddhhssii.substring(6,8);

        var time = yyyymmddhhssii.substring(8,10);
        var min = yyyymmddhhssii.substring(10,12);
        var sec = yyyymmddhhssii.substring(12,14);

        var format = String(year)+'-'+String(month)+'-'+String(day)+'T'+String(time)+":"+String(min)+":"+String(sec);

        // console.log(format);
        var d = new Date(format).toLocaleString("ko-KR", {timeZone: "Asia/Seoul"});

        d = new Date(d);

        // console.log('BEFORE', d.getFullYear());
        // console.log('BEFORE', d.getMonth()+1);
        // console.log('BEFORE', d.getDate());
        // console.log('BEFORE', d.getHours());
        // console.log('BEFORE', d.getMinutes());
        // console.log('BEFORE', d.getSeconds());

        d.setMinutes(d.getMinutes()+num);
        // console.log('AFTER', d);

        // console.log('AFTER', d.getFullYear());
        // console.log('AFTER', d.getMonth()+1);
        // console.log('AFTER', d.getDate());
        // console.log('AFTER', d.getHours());
        // console.log('AFTER', d.getMinutes());
        // console.log('AFTER', d.getSeconds());

        var ay = this.zero_plus(d.getFullYear().toString());
        var aM = this.zero_plus((d.getMonth()+1).toString());
        var ad = this.zero_plus(d.getDate().toString());
        var at = this.zero_plus(d.getHours().toString());
        var am = this.zero_plus(d.getMinutes().toString());
        var as = this.zero_plus(d.getSeconds().toString());

        var returnVlaue =ay+aM+ad+at+am+as;

        // console.log(returnVlaue);

        return returnVlaue


    },
    timeAddSec: function(yyyymmddhhssii, num){

        var year = yyyymmddhhssii.substring(0,4);
        var month = yyyymmddhhssii.substring(4,6);
        var day = yyyymmddhhssii.substring(6,8);

        var time = yyyymmddhhssii.substring(8,10);
        var min = yyyymmddhhssii.substring(10,12);
        var sec = yyyymmddhhssii.substring(12,14);

        var format = String(year)+'-'+String(month)+'-'+String(day)+'T'+String(time)+":"+String(min)+":"+String(sec);

        // console.log(format);
        var d = new Date(format).toLocaleString("ko-KR", {timeZone: "Asia/Seoul"});

        d = new Date(d);

        // console.log('BEFORE', d.getFullYear());
        // console.log('BEFORE', d.getMonth()+1);
        // console.log('BEFORE', d.getDate());
        // console.log('BEFORE', d.getHours());
        // console.log('BEFORE', d.getMinutes());
        // console.log('BEFORE', d.getSeconds());

        d.setSeconds(d.getSeconds()+num);
        // d.setMinutes(d.getMinutes()+num);
        // console.log('AFTER', d);

        // console.log('AFTER', d.getFullYear());
        // console.log('AFTER', d.getMonth()+1);
        // console.log('AFTER', d.getDate());
        // console.log('AFTER', d.getHours());
        // console.log('AFTER', d.getMinutes());
        // console.log('AFTER', d.getSeconds());

        var ay = this.zero_plus(d.getFullYear().toString());
        var aM = this.zero_plus((d.getMonth()+1).toString());
        var ad = this.zero_plus(d.getDate().toString());
        var at = this.zero_plus(d.getHours().toString());
        var am = this.zero_plus(d.getMinutes().toString());
        var as = this.zero_plus(d.getSeconds().toString());

        var returnVlaue =ay+aM+ad+at+am+as;

        // console.log(returnVlaue);

        return returnVlaue


    },
    toDate : function(){
        var v = new Date();

        var year = v.getFullYear();
        var month = v.getMonth()+1;
        month = this.zero_plus(month);

        var day = v.getDate();
        day = this.zero_plus(day);

        var hh = v.getHours();
        hh = this.zero_plus(hh);

        var mm = v.getMinutes();
        var mm = this.zero_plus(mm);

        var ss = v.getSeconds();
        ss = this.zero_plus(ss);

        var result = String(year)+"-"+String(month)+"-"+String(day)+" "+String(hh)+":"+String(mm)+":"+String(ss);
        return result;
    },
    zero_plus: function(str){
        var result;
        if(str.toString().length==1)
        {
            result = "0"+str;
        }
        else {
            result = str;
        }
        return result;

    },
    lpad: function(str, padLen, padStr){

        if (padStr.length > padLen) {
            console.log("오류 : 채우고자 하는 문자열이 요청 길이보다 큽니다");
            return str;
        }
        str += ""; // 문자로
        padStr += ""; // 문자로
        while (str.length < padLen)
            str = padStr + str;
        str = str.length >= padLen ? str.substring(0, padLen) : str;
        return str;
    },
    rpad: function(str, padLen, padStr) {
        // console.log(str.length);
        if (padStr.length > padLen) {
            console.log("오류 : 채우고자 하는 문자열이 요청 길이보다 큽니다");
            return str + "";
        }
        str += ""; // 문자로
        padStr += ""; // 문자로
        while (str.length < padLen)
            str += padStr;
        str = str.length >= padLen ? str.substring(0, padLen) : str;
        return str;
    },
    rpadKr: function(str, padLen, padStr) {
        // console.log('변환할 한글 ', this.getByteLength(str));


        if(str==''){
            // console.log('예외;')
            while (this.getByteLength(str)< padLen)
                str += padStr;

            // console.log(str);
            return str
        }

        if (padStr.length > padLen) {
            console.log("오류 : 채우고자 하는 문자열이 요청 길이보다 큽니다");
            return str + "";
        }
        str += ""; // 문자로
        padStr += ""; // 문자로
        while (this.getByteLength(str)< padLen)
            str += padStr;

        // console.log('글자수', this.getByteLength(str));
        str = this.getByteLength(str) >= padLen ? str.substring(0, padLen) : str;
        // console.log(str.length);
        // if(str > padLen){
        //     str = str.slice(0,padLen);
        // }

        return str;
    },
    filieMake: function(filePath, fileName, DATA){

        // var sampleData = 'Hello FileSystem';
        var makePath = filePath + fileName;

        fs.writeFile(makePath, DATA, 'utf8', function(err) {
            console.log('비동기적 파일 쓰기 완료');

        });

    },
    getRemainAligoSms: function(data){
        let _this = this;

        return new Promise(function (resolve, reject) {
            console.log('Aligo Lambda AWS SERVICE ~!');
            unirest.get('https://0j8iqqmk2l.execute-api.ap-northeast-2.amazonaws.com/aligo-remain-check-get')
                .headers(
                    {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    })
                .end(function (response) {
                    // console.log('from AWS LAMBDA_CHECK : ', response.body);
                    resolve(response.body);
                });
        });
    },
    promiEncModule: function(key, iv, secret_message){
        secret_message = pkcs7.pad(secret_message, 16); //Use 32 = 256 bits block sizes

        let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        cipher.setAutoPadding(false);  // pkcs7 default
        let encrypted = cipher.update(secret_message, 'utf-8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted

    },
    promiDecModule: function(key, iv, encrypted){
        let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        // cipher.setAutoPadding(false);
        let decrypted = decipher.update(encrypted, 'base64', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted
    },

    promiShaDec: function(secret_message){
        return crypto.createHash('sha256').update(secret_message).digest('hex');

    },
    promiShaDec128: function(secret_message){
        return crypto.createHash('sha256').update(secret_message).digest('hex');

    },
    timeFilter: function(timetxt){
        // 2020-06-25 10:37:51
        let returnValue = timetxt.trim();

        returnValue = returnValue.replace(/:/g,"");
        returnValue = returnValue.replace(/-/g,"");
        returnValue = returnValue.replace(" ","");

        return returnValue



    },
    dayAdd: function(d, addDay, addHour, addMinute, addSecond){
        let currentDay =  new Date(d);

        var year = currentDay.getFullYear();
        var month = currentDay.getMonth()+1;
        month = this.zero_plus(month);

        var day = currentDay.getDate() + addDay;
        day = this.zero_plus(day);

        var hh = currentDay.getHours() + addHour;
        hh = this.zero_plus(hh);

        var mm = currentDay.getMinutes() + addMinute;
        var mm = this.zero_plus(mm);

        var ss = currentDay.getSeconds() + addSecond;
        ss = this.zero_plus(ss);

        var currentTime =  String(year)+"-"+String(month)+"-"+String(day)+" "+String(hh)+":"+String(mm)+":"+String(ss);
        console.log('DATE TIME CALL : ', currentTime);

        return currentTime;


    },
    byteCalc: function(string){
        var stringByteLength = string.replace(/[\0-\x7f]|([0-\u07ff]|(.))/g,"$&$1$2").length;
        return stringByteLength;
    },
    cutByLen: function(str, maxByte){


        if(!str){
            return str = ''
        }
        str = str.toString();
        // console.log(str);
        for(b=i=0;c=str.charCodeAt(i);) {

            b+=c>>7?2:1;

            if (b > maxByte)

                break;

            i++;

        }

        return str.substring(0,i);




    },
    cutByteLen: function(str, maxByte){
        function cutStr(str, limit){

            var strLength = 0;
            var strTitle = "";
            var strPiece = "";

            for (i = 0; i < str.length; i++){
                var code = str.charCodeAt(i);
                var ch = str.substr(i,1).toUpperCase();
                //체크 하는 문자를 저장
                strPiece = str.substr(i,1)
                code = parseInt(code);

                if ((ch < "0" || ch > "9") && (ch < "A" || ch > "Z") && ((code > 255) || (code < 0))){
                    strLength = strLength + 3; //UTF-8 3byte 로 계산
                }else{
                    strLength = strLength + 1;
                }

                if(strLength>limit){ //제한 길이 확인
                    break;
                }else{
                    strTitle = strTitle+strPiece; //제한길이 보다 작으면 자른 문자를 붙여준다.
                }
            }

            return strTitle

        }
    },
    getByteLength:function ( data ) {
        var len = 0;
        var str = data.substring(0);

        if (str == null) return 0;

        for (var i = 0; i < str.length; i++) {
            var ch = escape(str.charAt(i));

            if (ch.length == 1) len++;
            else if (ch.indexOf("%u") != -1) len += 2;//Db가 한글을 3byte로 인식하여 2->3
            else if (ch.indexOf("%") != -1) len += ch.length / 3;
        }
        return len;

    },
    cutByteLength : function(s, len) {

        if (s == null || s.length == 0) {
            return 0;
        }
        var size = 0;
        var rIndex = s.length;

        for ( var i = 0; i < s.length; i++) {
            size += this.charByteSize(s.charAt(i));
            if( size == len ) {
                rIndex = i + 1;
                break;
            } else if( size > len ) {
                rIndex = i;
                break;
            }
        }

        return s.substring(0, rIndex);
    },
    charByteSize : function(ch) {

        if (ch == null || ch.length == 0) {
            return 0;
        }

        var charCode = ch.charCodeAt(0);

        if (charCode <= 0x00007F) {
            return 1;
        } else if (charCode <= 0x0007FF) {
            return 2;
        } else if (charCode <= 0x00FFFF) {
            return 3;
        } else {
            return 4;
        }
    },
    isoTimeConvert: function(time){

        if(time==null || time=="" || time==undefined){
            return ""
        }
        // let DAT = new Date(time).toLocaleString("ko-KR", {timeZone: "Asia/Seoul"});
        // DAT = new Date(DAT);
        // let dt;
        let DAT = new Date(time);


        //safari & IE 예외처리
        if(!DAT.getFullYear()){

            // let d = Date.parse(date);
            var date = date.replace(/([+\-]\d\d)(\d\d)$/, "$1:$2");
            // date = date.replace(/-/g, "/");
            // console.log('safari & IE8', date)
            DAT = new Date(date);


        }

        let year = DAT.getFullYear();
        let month = this.zero_plus(DAT.getMonth() + 1);
        let day = this.zero_plus(DAT.getDate());

        let hours = this.zero_plus(DAT.getHours());
        let minutes = this.zero_plus(DAT.getMinutes());
        let seconds = this.zero_plus(DAT.getSeconds());

        //2020-07-28 23:45:00
        // var formattedTime = String(year) +"-" + String(month) + "-" + String(day) + " " +  String(hours) + ":" + String(minutes) + ":" + String(seconds);

        //20200728234500
        var formattedTime = String(year) + String(month)  + String(day) +  String(hours)+ String(minutes) + String(seconds);


        // console.log(formattedTime);
        // console.log(this.localCurrentTime());
        return formattedTime;
    },
    TimeIsoConvert: function(time){

        let year = time.substring(0,4);
        let month = time.substring(4,6);
        let day = time.substring(6,8);
        let hours = time.substring(8,10);
        let minutes = time.substring(10,12);
        let seconds = time.substring(12,14);


        var formattedTime = String(year) + "-"+String(month) +"-" + String(day) +"T"+  String(hours)+":"+ String(minutes) +":"+ String(seconds)+"+0900";


        // console.log(formattedTime);
        // console.log(this.localCurrentTime());
        return formattedTime;
    },
    TimeMsgValidTime: function(time){

        let year = time.substring(0,4);
        let month = time.substring(4,6);
        let day = time.substring(6,8);
        let hours = time.substring(8,10);
        let minutes = time.substring(10,12);
        let seconds = time.substring(12,14);


        var formattedTime = String(year) + "년 "+String(month) +"월 " + String(day) +"일 "+  String(hours)+"시 "+ String(minutes) +"분 "+ String(seconds)+"초 ";


        // console.log(formattedTime);
        // console.log(this.localCurrentTime());
        return formattedTime;
    },

    minDiff: function(start, end){
        /**
         *
         * 운행시간계산: 30분40초 + 40분30초 => 71분10초 => 분단위 올림하여 72분
         */

        var old = new Date(start);
        var end = new Date(end);

        var gap = end.getTime() - old.getTime();

        var min_gap = gap/1000/60;
        // console.log('min_gap : ', min_gap);
        // min_gap =Math.floor(min_gap);
        // min_gap =Math.min_gap); //올림
        if(gap == NaN){
            return 0
        }else{
            return min_gap
        }

    },
    secDiff: function(start, end){
        /**
         *
         * 운행시간계산: 30분40초 + 40분30초 => 71분10초 => 분단위 올림하여 72분
         */

        var old = new Date(start);
        var end = new Date(end);

        var gap = end.getTime() - old.getTime();

        var sec_gap = gap/1000;

        if(gap == NaN){
            return 0
        }else{
            return sec_gap
        }
        // console.log('sec_gap : ', min_gap);
        // min_gap =Math.floor(min_gap);
        // min_gap =Math.ceil(min_gap); //올림

    },
    rawDatalogfile: function (info, type, pageNumber, bpk ) {

        var d = new Date();
        let yyyy = d.getFullYear();
        let mm = this.zero_plus(d.getMonth() + 1);
        let dd = this.zero_plus(d.getDate());
        let hh = this.zero_plus(d.getHours());
        let MM = this.zero_plus(d.getMinutes());
        let ss = this.zero_plus(d.getSeconds());
        // console.log('request raw data save : test');
        let root = '../logs/'
        let logDir = root+bpk + '/';
        let logDirType = logDir + type;
        let logFile = logDirType + "/" + String(yyyy) +String(mm) + String(dd) + "_" + String(hh) + String(MM) + String(ss) + "_" + pageNumber;
        console.log('LOG FILE NAME : ', logFile);

        if(!fs.existsSync(root)) {
            fs.mkdirSync(root, {recursive: true}, (error) => {
                if (error) {
                    console.error('an error occurred : ', error);
                } else {
                    console.log('LOG Directory is made : ', log);
                }
            });
        }

        let fileGroup = logFile.split("/");
        let filepath = "";
        fileGroup.forEach(function(element, index){
            // ../logs/1/batch/20211027_....json
            filepath += element + "/";

            if(index>0 && index != fileGroup.length-1){
                // 루트 경로는 제외
                // console.log(filepath);

                if(!fs.existsSync(filepath)) {
                    fs.mkdirSync(filepath, {recursive: true}, (error) => {
                        if (error) {
                            console.error('an error occurred : ', error);
                        } else {
                            console.log('LOG Directory is made : ', log);
                        }
                    });
                }
            }


        });









        let infoLog = beautify(info, null, 2, 100);
        if (!fs.existsSync(logFile + "_request.json")) {
            fs.writeFile(logFile + "_request.json", infoLog, 'utf8', function (err) {
                    if (err) throw err;
                    console.log('complete log file ');
                }
            );
        }
    },
    specialCharEx: function regExp(str){
        var reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
        //특수문자 검증
        if(reg.test(str)){
            //특수문자 제거후 리턴
            return str.replace(reg, "");
        } else {
            //특수문자가 없으므로 본래 문자 리턴
            return str;
        }
    },
    emptySpace: function(string){
        var returnData ="";
        returnData = string.replace(/ /gi, "");

        return returnData;

    },
    expiredTIme: function(){
        let currentDay =  new Date();

        var year = currentDay.getFullYear();
        var month = currentDay.getMonth()+1;
        month = this.zero_plus(month);

        var day = currentDay.getDate();
        day = this.zero_plus(day);

        var hh = currentDay.getHours();
        hh = this.zero_plus(hh);

        var mm = currentDay.getMinutes();
        var mm = this.zero_plus(mm);

        var ss = currentDay.getSeconds();
        ss = this.zero_plus(ss);

        var currentTime =  String(year)+"년 "+String(month)+"월 "+String(day)+"일 "+"21시";
        // console.log('DATE TIME CALL : ', currentTime);

        return currentTime;


    },
    fixDamboTxt: function(dambo){
        // console.log(dambo);
        let returnValue = '';
        if(dambo =="nojacha"){
            returnValue = "자기차량 담보 미포함";
        }
        else{
            returnValue = "자기차량 담보 포함"
        }

        return returnValue;


    }

}




;

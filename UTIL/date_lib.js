
/**
 * 작성자 : 유종태
 * 작성일 :2022.04.13
 * 내용 :
 * 날짜처리관련 유틸
 * **/


module.exports = {
    /**
     *
     *
     * 시간 문자열 가져오기
     * 갭은 날짜 갭
     * _dateUtil.GET_DATE("YYYYMMDDHHMMSS", "NONE",0);
     * _dateUtil.GET_DATE("SEMI", "NONE",0);
     * _dateUtil.GET_DATE("YYMMDD", "NONE",0);
     * _dateUtil.GET_DATE("HHMMSS", "NONE",0);
     *
     * _dateUtil.GET_DATE("YYYYMMDDHHMMSS", "YEAR",1);
     * _dateUtil.GET_DATE("YYYYMMDDHHMMSS", "YEAR",-1);
     *
     */
    GET_DATE: function(FORMAT,TYPE, GAB){
        var RETURNVAL = "";
        let DAT = new Date();
        //safari & IE 예외처리
        if(!DAT.getFullYear()){
            var date = date.replace(/([+\-]\d\d)(\d\d)$/, "$1:$2");
            DAT = new Date(date);
        }

        switch (TYPE) {
            case "YEAR": DAT.setFullYear(DAT.getFullYear()+GAB); break;
            case "MONTH": DAT.setMonth(DAT.getMonth()+GAB); break;
            case "DAY":  DAT.setDate(DAT.getDate()+GAB); break;
            case "HOUR": DAT.setHours(DAT.getHours()+GAB); break;
            case "MIN": DAT.setMinutes(DAT.getMinutes()+GAB); break;
            case "SEC": DAT.setSeconds(DAT.getSeconds()+GAB); break;
            case "NONE":  break;
        }


        let year = DAT.getFullYear();
        let month = this.zero_plus(DAT.getMonth() + 1);
        let day = this.zero_plus(DAT.getDate());
        let hours = this.zero_plus(DAT.getHours());
        let minutes = this.zero_plus(DAT.getMinutes());
        let seconds = this.zero_plus(DAT.getSeconds());

        switch (FORMAT) {
            case "YYYYMMDDHHMMSS": RETURNVAL = String(year) + String(month)  + String(day) +  String(hours)+ String(minutes) + String(seconds); break;
            case "SEMI": RETURNVAL = String(year) + "-" +String(month)  + "-" +String(day) +  " " + String(hours)+ ":" + String(minutes) + ":" +String(seconds); break;
            case "YYMMDD":  RETURNVAL = String(year) + String(month)  + String(day); break;
            case "HHMMSS":RETURNVAL = String(hours) + String(minutes)  + String(seconds); break;
            case "YY":RETURNVAL = String(year); break;
            case "MM":RETURNVAL = String(month); break;
            case "DD":RETURNVAL = String(day); break;
        }


        return RETURNVAL;

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


}




;

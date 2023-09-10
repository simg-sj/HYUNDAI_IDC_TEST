const _util = require("../UTIL/base_lib");
const _dateUtil = require("../UTIL/date_lib");
module.exports = {
    /**
     * 배치시간 : 07:50:50 초에 생성,
     * 보험사에서 읽는시간 : 08:00:00
     * 체결요청 전문 ID : 00011 파일명 BMN.00011.YYYYMMDD.RCV
     *

     *
     *
     *
     *
     *
     *
     *
     */
    BATCH: function(result, POMI_DB_key, POMI_DB_iv, bpk, BUSINESSDAY, type){

        let res = result[0];
        var writeString = ""; //  최종 쓰일 파일


        for(let i=0; i<res.length; i++){

            var obj;
            var dpk ="";
            var rpk="";
            var carNum="";
            var pNo="";
            var start="";
            var finish ="";
            var cancelType ="";
            var productType ="";
            var BPK ="";


            obj = res[i];
            // console.log(obj);


            // 기사번호 12 필수
            if(obj.dpk){
                dpk = obj.dpk;
            }


            if(obj.rpk){
                rpk = obj.rpk;
            }


            // 기사 차량번호
            if(obj.dCarNum){
                // console.log(obj.dCarNum);
                // carNum = _util.rpad(obj.dCarNum, 20,' '); // 빈칸으로 채움
                carNum = obj.dCarNum.trim();
                carNum = carNum.replace(/(\s*)/g, "");
            }else{
                // carNum = _util.rpad('', 20,' '); // 빈칸으로 채움
                carNum = '';
            }



            if(obj.pNo){
                pNo = obj.pNo;
            }


            if(obj.startedDateTime){
                start = _util.isoTimeConvert(obj.startedDateTime);
            }


            if(obj.finishedDateTime){
                finish = _util.isoTimeConvert(obj.finishedDateTime);
            }

            cancelType = "0";


            if(type=='CAR'){
                productType = "5802";
            }
            if(type=='BIKE') {
                productType = "5802";
            }
            BPK = String(bpk).padStart(3,'0');

            var rowTxt = '';
            rowTxt += dpk + ";";
            rowTxt += rpk + ";";
            rowTxt += carNum + ";";
            rowTxt += pNo + ";";
            rowTxt += start + ";";
            rowTxt += finish + ";";
            rowTxt += cancelType + ";";
            rowTxt += productType + ";";
            rowTxt += BPK + ";";

            rowTxt +='\n';

            writeString += rowTxt;


        }


        return writeString;








    },

}

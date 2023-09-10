const _util = require("../UTIL/base_lib");
const _dateUtil = require("../UTIL/date_lib");
module.exports = {
    /**
     * 배치시간 : 00:10:50 초에 생성, 배치파일날짜는 익일날짜로 생성된다
     * 보험사에서 읽는시간 : 02:00:00
     * 심사요청 전문 ID : 00001 파일명 BMN.00001.YYYYMMDD.RCV
     *
     * 기사번호 (12),
     * 기사명 (20),
     * 기사핸드폰번호 (11),
     * 주민번호 (50),
     * 가입설계동의여부 (1),
     * 가입설계동의일시 (14),
     * 가입설계동의번호 (50)(CI값),
     * 가입설계동의방법 (2),
     * 차량번호 (20),
     * 운행차량 차종 (1),  --> 2
     * 자차가입 선택여부 (1),
     * 차량소유주 일치여부 (1),  --> 빠졌음
     * 기사와 차량소유주와의 관계 (3),
     * 차량소유주 이름 (20),
     * 차량소유주 핸드폰번호 (11),
     * 차량소유주 주민번호 (50),
     * 차량소유주 가입설계동의여부 (1),
     * 차량소유주 가입설계동의일시 (14),
     * 차량소유주 가입설계동의번호 (20) (CI값),
     * 차량소유주 가입설계동의방법 (2),
     * 차량번호 변경여부 (1),
     * 이전차량번호 (20),
     * 자료전송일자 (8)
     * 대인 2 가입여부 (1)
     * 자손 가입여부 (1)
     * 자차 가입여부 (1)
     * 증권 번호 (20)
     * 보험종기 (8)
     * 가입회사 (2)
     * 상품코드 : 5802 고정
     * 업체구분 : 배민 01, 딜리온 02, 03 딜버, 04 비욘드, 05 플러스앤소프트, 06 배달구, 07 오투
     * 사용용도(이륜차) : 가정용  401, 비유상 402, 유상 403
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     */
    UNDERWRITE: function(result, POMI_DB_key, POMI_DB_iv, bpk, BUSINESSDAY, type){
        let res = result[0]; // 결과 데이터
        let obj; // 개별 오브젝트
        var writeString = ""; //  최종 쓰일 파일
        let apiDriverId, dName, dCell, dJumin, planAgree, planTime, planCi, planMethod, carNum, carType, damboType, soyuJu, soyuJuRelation;
        let soyujaName, soyujaCell, soyujaJumin, soyujaPlanAgree, soyujaPlanTime, soyujaPlanCi, soyujaPlanMethod;
        let carChange, beforeCarNum, sendDate;
        let certiDaein, certiBody, certiCar, certiNum, certiTime, certiCompany;
        let prodcutCode,  bikeType, errType;

        for(let i=0; i<res.length; i++){

            obj = res[i];
            // console.log(obj);

            // 기사번호 12 필수
            if(obj.dpk){
                apiDriverId = obj.bdpk;
            }

            // 기사명 20 필수
            if(obj.bdName){
                dName = obj.bdName;
            }
            dName = String(dName).toUpperCase();  // 대문자 처리

            // 기사 핸드폰번호 11 기호없이 숫자만   ==> 암호화하면 길이가 좀길어짐
            if(obj.cell){
                // let encCell = _util.promiEncModule(POMI_DB_key, POMI_DB_iv, obj.cell);
                // dCell = encCell;
                dCell = obj.cell;
            }

            // 기사 주민번호
            if(obj.socialNo){
                // let encJumin = _util.promiEncModule(POMI_DB_key, POMI_DB_iv, obj.socialNo);
                // dJumin = encJumin;
                dJumin = obj.socialNo;
                soyujaJumin = obj.socialNo;
            }

            // 기사설계동의 여/부 무조건 1
            planAgree = '1';

            // 기사설계동의 날짜
            // planTime = _util.timeFilter(obj.planCiDate);
            planTime = "";

            // 기사설계동의 방법 핸드폰 무조건 03
            planMethod = '03';
            let planCi = obj.planCi;

            // 기사 차량번호
            if(obj.bdCarNum){
                carNum = _util.emptySpace(obj.bdCarNum);
            }else{
                carNum = '';
            }

            // 차종
            carType = obj.carType; // 승합은 02 / 승용은 01

            // 담보
            if(obj.dDambo){
                if(obj.dDambo == 'nojacha'){
                    damboType = 0;
                }else{
                    damboType = 1;
                }
            }

            // 소유자여부 본인 1 타인 0
            if(obj.dSoyuja){
                if(obj.dSoyuja =='bonin'){
                    soyuJu = 1;
                }else{
                    soyuJu = 0;
                }
            }

            // 관계 코드
            if(obj.relation){
                soyuJuRelation = '11';
            }else{
                soyuJuRelation = '11'; // 만약값이없다면 101본인으로
            }



            // 차량소유자 동의 여부
            if(soyuJu == 1){
                soyujaPlanAgree = "";
                soyujaPlanTime = "";
                soyujaPlanMethod = "";
                soyujaPlanCi ="";
                soyujaName = "";
                soyujaCell = "";
                soyujaJumin = "";
            }else{
                soyujaPlanAgree = '1';
                soyujaPlanTime =_util.timeFilter(obj.created);
                soyujaPlanMethod = '03';
                soyujaPlanCi = obj.planCi2;
                // 차량소유자명
                if(obj.soyujaName){
                    soyujaName = obj.soyujaName;
                    soyujaName = soyujaName.toUpperCase();  // 대문자 처리

                }else{
                    soyujaName = "";
                }


                // 차량소유자 핸드폰 번호
                if(obj.soyujaCellDec){
                    // soyujaCell = _util.promiEncModule(POMI_DB_key, POMI_DB_iv, obj.soyujaCellDec);
                    soyujaCell = obj.soyujaCellDec;
                }else{
                    soyujaCell = "";
                }

                // 차량소유자의 주민번호
                if(obj.soyujaJuminDec){
                    // soyujaJumin = _util.promiEncModule(POMI_DB_key, POMI_DB_iv, obj.soyujaJuminDec);
                    soyujaJumin = obj.soyujaJuminDec;
                }else{
                    soyujaJumin = "";
                }
            }

            // 차량 변경여부
            carChange = "0";


            //null 인 경우는 신규

            /**
             *
             * 차량번호 변경건에 대해서 1로 처리하고 들어오게 된다면,
             *
             * 개발원 심사를 전체 타게되어 진행된다.
             *
             * 유효기간이 남아있는경우라면 1을 찍으면 안되지만,
             * 유효기간이 있는경우라면 0 ==> 그러나 이경우 자동갱신시 기명만 처리하게 되어 없음
             *
             * 결론 ::
             * 무조건 1로 찍어서 진행함
             * 2020.12.02
             */
            // if(!obj.oldCarNum){
            //     carChange = "0";
            // }else{
            //     if(obj.oldCarNum != obj.dCarNum){
            //         carChange = "1";
            //     }
            //
            // }
            carChange = "1";




            // 전에 차량 번호
            if(carChange=='1'){

                // 만약에 값이없다면, 기존 차량번호로 찍고들어옴 null 이 가는경우가 있음
                if(obj.oldCarNum){
                    beforeCarNum = obj.oldCarNum;
                }else{
                    beforeCarNum = obj.dCarNum;
                }


            }else{
                beforeCarNum = obj.dCarNum;
            }


            if(beforeCarNum=='null'){
                beforeCarNum = obj.dCarNum;
            }


            // 보내는 날짜
            sendDate = BUSINESSDAY;


            if(!obj.certiDaein){
                certiDaein = '';
            }else{
                certiDaein = obj.certiDaein;
            }
            //예외 20210408
            if(certiDaein=='un'){
                certiDaein = '0'
            }

            if(!obj.certiBody){
                certiBody = '';
            }else{
                certiBody = obj.certiBody;
            }
            //예외 20210408
            if(certiBody=='un'){
                certiBody = '0'
            }


            if(!obj.certiCar){
                certiCar = '';
            }else{
                certiCar = obj.certiCar;
            }
            //예외 20210408
            if(certiCar=='un'){
                certiCar = '0'
            }

            // 공백제거
            // 특수문자제거
            // 대시제거
            // 자리수 15자리
            // 15 byte 까지만
            if(!obj.certiConvert){
                certiNum = '';
            }else{
                certiNum = obj.certiConvert;

            }


            // 증권종기
            certiTime = obj.toDay;



            if(!obj.certiCompany){
                certiCompany = '';
            }else{
                certiCompany = obj.certiCompany;
            }

            if(type == 'CAR'){
                prodcutCode ='5802'; // 자동차 상품코드 고정값.
                bikeType = ''; // 가정 / 비유상 / 유상 자동차는 없이 진행
            }
            if(type == 'BIKE'){
                prodcutCode ='5802'; // 이륜차 상품코드 고정값.
                bikeType = obj.carType; // 가정 / 비유상 / 유상 자동차는 없이 진행
                carType = ""; // 승합은 02 / 승용은 01 // 이륜차는 빈값
                damboType = "0";
            }

            bpk =String(bpk).padStart(3,'0');

            soyujaJumin = obj.socialNo;
            bikeType ="";
            errType=""

            /**
             *
             * 갱신 유효기간을 입력해서 넘기지 않으면, 빈값으로 들어가게되고
             * 다음갱신때에 유효기간이 만료가된상태로 처리가 된다.
             *
             *
             */
            planTime = obj.validAgree;
            soyujaPlanTime = obj.validAgree;

            apiDriverId = _util.cutByLen(apiDriverId.toString(), 12);
            dName = _util.cutByLen(dName, 20);
            dCell = _util.cutByLen(dCell, 60);
            dJumin = _util.cutByLen(dJumin, 60);
            planAgree = _util.cutByLen(planAgree, 1);
            planTime = _util.cutByLen(planTime, 14);
            planCi = _util.cutByLen(planCi, 50);
            planMethod = _util.cutByLen(planMethod, 2);
            carNum = _util.cutByLen(carNum, 20);
            carType = _util.cutByLen(carType, 2);
            // damboType = _util.cutByLen(damboType, 1);
            // soyuJu = _util.cutByLen(soyuJu, 1);
            // soyuJuRelation = _util.cutByLen(soyuJuRelation, 3);
            soyujaName = _util.cutByLen(soyujaName, 20);
            soyujaCell = _util.cutByLen(soyujaCell, 60);
            soyujaJumin = _util.cutByLen(soyujaJumin, 60);
            soyujaPlanAgree = _util.cutByLen(soyujaPlanAgree, 1);
            soyujaPlanTime = _util.cutByLen(soyujaPlanTime, 14);
            soyujaPlanCi = _util.cutByLen(soyujaPlanCi, 50);
            soyujaPlanMethod = _util.cutByLen(soyujaPlanMethod, 2);
            // carChange = _util.cutByLen(carChange, 1);
            beforeCarNum = _util.cutByLen(beforeCarNum, 20);
            sendDate = _util.cutByLen(sendDate, 8);
            // certiDaein = _util.cutByLen(certiDaein, 1);
            // certiBody = _util.cutByLen(certiBody, 1);
            // certiCar = _util.cutByLen(certiCar, 1);
            certiNum = _util.cutByLen(certiNum, 30);
            certiTime = _util.cutByLen(certiTime, 8);
            certiCompany = _util.cutByLen(certiCompany, 2);
            // prodcutCode = _util.cutByLen(prodcutCode, 5);
            bpk = _util.cutByLen(bpk, 3);
            // bikeType = _util.cutByLen(bikeType, 3);

            // 차량번호
            // 증권번호 certiNum
            // 보험 종기 certiTime
            // 소유자관계코드는 자릿수 2자리
            // certiNum ="M2022877547200000"; // 테스트용도 // 증궈번호 뒷 5자리는 00000
            soyuJu = "0";
            // certiTime = ""; // 종기일

            console.log(certiNum);

            var rowTxt = '';
            rowTxt += apiDriverId + ";";
            rowTxt += dName + ";";
            rowTxt += dCell + ";";
            rowTxt += dJumin + ";";
            rowTxt += planAgree + ";";
            rowTxt += planTime + ";";
            rowTxt += planCi + ";";
            rowTxt += planMethod + ";";
            rowTxt += carNum + ";";
            rowTxt += carType + ";";
            rowTxt += damboType + ";";
            rowTxt += soyuJu + ";";
            rowTxt += soyuJuRelation + ";";
            rowTxt += soyujaName + ";";
            rowTxt += soyujaCell + ";";
            rowTxt += soyujaJumin + ";";
            rowTxt += soyujaPlanAgree + ";";
            rowTxt += soyujaPlanTime + ";";
            rowTxt += soyujaPlanCi + ";";
            rowTxt += soyujaPlanMethod + ";";
            rowTxt += carChange + ";";
            rowTxt += beforeCarNum + ";";
            rowTxt += sendDate + ";";
            rowTxt += certiDaein+ ";";
            rowTxt += certiBody+ ";";
            rowTxt += certiCar+ ";";
            rowTxt += certiNum+ ";";
            rowTxt += certiTime+ ";";
            rowTxt += certiCompany+ ";";
            rowTxt += prodcutCode+ ";";
            rowTxt += bpk+ ";";
            rowTxt += bikeType+ ";";
            rowTxt += errType+ ";";
            rowTxt +='\n';
            writeString += rowTxt;
        }



        return writeString;








    },
    UNDERWRITE_READ: function(valueRow,  matchbpk, BUSINESSDAY){

        let obj;
        let bikevalue = [];
        /**  bpk, dpk,dName,result,resultDetail,dambo,damboCode,resultDay,validUnderwriteDay,productType,pNo,recvState,remark,fileDay,createdYMD,useYNull **/
        for(var i=0; i<valueRow.length; i++){
            obj = valueRow[i];
            let v = [];

            let o = obj.split(';');
            let dpk = o[0];
            let bdpk = o[0];
            let dName = o[1];
            let result = o[2];
            let resultDetail = o[3];
            let dambo = o[4];
            let damboCode = o[4];
            let resultDay = o[5];
            let validUnderwriteDay  = o[6];
            let toDay = o[7];
            let productType = o[8];
            let bpk = o[9]; // 업체 구분
            bpk = bpk.replace("0","");
            let nowdate = _util.toDate();
            let pNo = o[11];



            if(matchbpk ==bpk){
                v.push(bpk);
                v.push(dpk);
                v.push(dName);
                v.push(result);
                v.push(resultDetail);
                v.push(dambo);
                v.push(damboCode);
                v.push(resultDay);
                v.push(validUnderwriteDay);
                v.push(productType);
                v.push(pNo);
                v.push(filterResult(result));
                v.push(filterResultDetail(resultDetail));
                v.push(BUSINESSDAY);
                v.push(nowdate);
                v.push('Y');


                    bikevalue.push(v);

            }




        }

            console.log(matchbpk,  bikevalue.length);
            return bikevalue;



        function filterResult(result){
            var returnValue = '';
            switch(result){
                case '01': returnValue = 'ACCEPTED'; break;
                case '02': returnValue = 'REJECTED'; break;
                case '03': returnValue = 'DELAY'; break;  // 심사중
                case '04': returnValue = 'ERROR'; break;  // 오류
            }

            return returnValue

        }


        function filterResultDetail(result){
            var returnValue = '';
            switch(result){
                case '': returnValue = ''; break;
                case '01': returnValue = '중대법규위반이력 존재'; break;
                case '02': returnValue = '가입경력조건 미충족'; break;
                case '03': returnValue = '책임보험 가입이력 미존재'; break;
                case '04': returnValue = '가입가능연령 조건 미충족'; break;
                case '05': returnValue = '사고횟수기준 초과'; break;
                case '99': returnValue = '기타'; break;
            }

            return returnValue

        }

    },

}

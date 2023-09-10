
/**
 * 작성자 : 유종태
 * 작성일 :2022.05.01
 * 내용 :
 * 카카오 템플릿
 *
 *
 * 001 : 가입신청 접수안내 ( 공통 )
 * 002 : 통과시 개인정보 동의안내 ( 배민 )
 * 003 : 거절시 안내 ( 공통 ) : 배민 제외
 * 004 : 만료 안내 ( 공통 ) : 배민 제외
 * 005 : 통과인데 개인정보 동의완료한 이후에 통과인 경우 ( 공통 ) : 배민 제외
 * 006 : 개인정보 동의 정기 요청 ( 공통 )
 *
 * **/
module.exports = {


    bike001: function(data){
        console.log(data);
        let platform = data.platform;
        let cell = data.cell;
        let dName = data.dName;
        let carNum = data.dCarNum;
        let url = data.url;

        return result = {
            "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
            "ALIGO_USER_ID":"yoojjtt",
            "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
            "token":"",
            "templateCode":"tpl_code=TI_6218",
            "sender":"sender=18773006",
            "receiver":"receiver_1="+cell,
            "subject":"subject_1=현대해상 시간제보험 가입접수 안내",
            "message":"message_1="+
                "안녕하세요.현대해상 오토바이 시간제보험을 신청해주셔서 감사합니다.\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항\n" +
                "- 개명 및 신청정보의 변경이력이 있으시면 심사 지연이 발생할 수 있으니 문의부탁드립니다.\n" +
                "- 보험 심사에 최대 1~2영업일이 소요되며, 심사 완료 시 문자로 안내해드립니다.\n" +
                "- 아래 링크에서 심사 상태 및 결과를 조회하실 수 있으며, 문의사항이 있을 경우 보험사로 연락해주세요. (1877-3006)\n" +
                "\n"+
                url,
            "failover":"Y",
            "fsubject_1":"현대해상 시간제보험 가입접수 안내",
            "fmessage_1":
                "안녕하세요.현대해상 오토바이 시간제보험을 신청해주셔서 감사합니다.\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항\n" +
                "- 개명 및 신청정보의 변경이력이 있으시면 심사 지연이 발생할 수 있으니 문의부탁드립니다.\n" +
                "- 보험 심사에 최대 1~2영업일이 소요되며, 심사 완료 시 문자로 안내해드립니다.\n" +
                "- 아래 링크에서 심사 상태 및 결과를 조회하실 수 있으며, 문의사항이 있을 경우 보험사로 연락해주세요. (1877-3006)\n" +
                "\n"+
                url,
        };
    },
    bike002: function(data){
        console.log(data);
        let platform = data.platform;
        let cell = data.cell;
        let dName = data.dName;
        let carNum = data.dCarNum;
        let url = data.url;

        return result = {
            "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
            "ALIGO_USER_ID":"yoojjtt",
            "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
            "token":"",
            "templateCode":"tpl_code=TI_6219",
            "sender":"sender=18773006",
            "receiver":"receiver_1="+cell,
            "subject":"subject_1=현대해상 시간제보험 개인정보 제공동의 안내",
            "message":"message_1="+
                "안녕하세요, 현대해상 오토바이 시간제보험 심사 결과 안내해드립니다.\n" +
                "\n" +
                "심사 결과 통과되어 아래의 URL 에서 개인정보제공에 동의해주시기 바랍니다. \n" +
                "개인정보 동의절차 진행완료 이후에 운행가능한 보험정보가 플랫폼사로 전달됩니다. \n" +
                "\n" +
                url+"\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항\n" +
                "- 운행 오토바이가 변경될 경우, 반드시 보험사에 통보해주세요. \n" +
                "- 계약한 오토바이의 책임보험 용도 및 계약 내용 변경 시, 반드시 보험사에 통보해주세요.\n" +
                "- 계약시 등록한 오토바이 및 보험 계약 내용과 상이할 경우 보상에 제한이 있을 수 있습니다.\n" +
                "- 배달 중의 사고 발생 문의는 현대해상 사고접수번호로 접수해주세요. (1588-5656 )",
            "failover":"Y",
            "fsubject_1":"현대해상 시간제보험 개인정보 제공동의 안내",
            "fmessage_1":
                "안녕하세요, 현대해상 오토바이 시간제보험 심사 결과 안내해드립니다.\n" +
                "\n" +
                "심사 결과 통과되어 아래의 URL 에서 개인정보제공에 동의해주시기 바랍니다. \n" +
                "개인정보 동의절차 진행완료 이후에 운행가능한 보험정보가 플랫폼사로 전달됩니다. \n" +
                "\n" +
                url+"\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항\n" +
                "- 운행 오토바이가 변경될 경우, 반드시 보험사에 통보해주세요. \n" +
                "- 계약한 오토바이의 책임보험 용도 및 계약 내용 변경 시, 반드시 보험사에 통보해주세요.\n" +
                "- 계약시 등록한 오토바이 및 보험 계약 내용과 상이할 경우 보상에 제한이 있을 수 있습니다.\n" +
                "- 배달 중의 사고 발생 문의는 현대해상 사고접수번호로 접수해주세요. (1588-5656 )",
        };
    },
    bike003: function(data){
        console.log(data);
        let platform = data.platform;
        let cell = data.cell;
        // let cell = "01085371398";

        let dName = data.dName;
        let carNum = data.dCarNum;
        let resultWhy = data.resultWhy;

        return result = {
            "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
            "ALIGO_USER_ID":"yoojjtt",
            "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
            "token":"",
            "templateCode":"tpl_code=TI_6227",
            "sender":"sender=18773006",
            "receiver":"receiver_1="+cell,
            "subject":"subject_1=현대해상 시간제보험 심사결과 안내",
            "message":"message_1="+


                "안녕하세요, 현대해상 오토바이 시간제보험 심사 결과 안내해드립니다.\n" +
                "\n" +
                "보험 심사 결과, 주요 인수 심사 기준에 부합하지 않아 오토바이 시간제보험 이용이 어렵습니다.\n" +
                "\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "\n" +
                "■ 거절 사유\n" +
                "- "+resultWhy+"\n" +
                "\n" +
                "상세 이력조회는 아래의 연락처로 연락부탁드립니다. (1877-3006)",
            "failover":"Y",
            "fsubject_1":"현대해상 시간제보험 심사결과 안내",
            "fmessage_1":


                "안녕하세요, 현대해상 오토바이 시간제보험 심사 결과 안내해드립니다.\n" +
                "\n" +
                "보험 심사 결과, 주요 인수 심사 기준에 부합하지 않아 오토바이 시간제보험 이용이 어렵습니다.\n" +
                "\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "\n" +
                "■ 거절 사유\n" +
                "- "+resultWhy+"\n" +
                "\n" +
                "상세 이력조회는 아래의 연락처로 연락부탁드립니다. (1877-3006)"
        };
    },
    bike004: function(data){
        console.log(data);
        let platform = data.platform;
        let cell = data.cell;
        let dName = data.dName;
        let carNum = data.dCarNum;

        return result = {
            "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
            "ALIGO_USER_ID":"yoojjtt",
            "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
            "token":"",
            "templateCode":"tpl_code=TI_6231",
            "sender":"sender=18773006",
            "receiver":"receiver_1="+cell,
            "subject":"subject_1=현대해상 계약 종료 안내",
            "message":"message_1="+




                "안녕하세요, 현대해상 오토바이 시간제보험 계약해지 안내드립니다.\n" +
                "\n" +
                "계약하신 내용이 계약 해지 처리되었습니다.\n" +
                "\n" +
                "■ 계약 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항\n" +
                "- 재가입을 원하시는 경우 가입페이지에서 재신청 바랍니다.\n" +
                "\n" +
                " \n",
            "failover":"Y",
            "fsubject_1":"현대해상 계약 종료 안내",
            "fmessage_1":




                "안녕하세요, 현대해상 오토바이 시간제보험 계약해지 안내드립니다.\n" +
                "\n" +
                "계약하신 내용이 계약 해지 처리되었습니다.\n" +
                "\n" +
                "■ 계약 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항\n" +
                "- 재가입을 원하시는 경우 가입페이지에서 재신청 바랍니다.\n" +
                "\n" +
                " \n"
        };
    },

    bike005: function(data){
        console.log(data);
        let platform = data.platform;
        let cell = data.cell;
        let dName = data.dName;
        let carNum = data.dCarNum;
        let url = data.url;
        let infoMsg = data.infoMsg;

        return result = {
            "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
            "ALIGO_USER_ID":"yoojjtt",
            "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
            "token":"",
            "templateCode":"tpl_code=TI_6219",
            "sender":"sender=18773006",
            "receiver":"receiver_1="+cell,
            "subject":"subject_1=현대해상 시간제보험 개인정보 제공동의 안내",
            "message":"message_1="+
                "안녕하세요, 현대해상 오토바이 시간제보험 심사 결과 안내해드립니다.\n" +
                "\n" +
                "- 심사 결과 통과되어 안내드립니다.\n" +
                "\n" +
                "- 실제 보험의 적용은 심사결과를 받은 다음날 00시 기준으로 적용됩니다. \n" +
                "\n" +
                "- 플랫폼사에 해당시간에 보험정보 연동이 완료되니 운행시 주의바랍니다.\n" +
                ''+"\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                infoMsg,
            "failover":"Y",
            "fsubject_1":"현대해상 시간제보험 개인정보 제공동의 안내",
            "fmessage_1":
                "안녕하세요, 현대해상 오토바이 시간제보험 심사 결과 안내해드립니다.\n" +
                "\n" +
                "- 심사 결과 통과되어 안내드립니다.\n" +
                "\n" +
                "- 실제 보험의 적용은 심사결과를 받은 다음날 00시 기준으로 적용됩니다. \n" +
                "\n" +
                "- 플랫폼사에 해당시간에 보험정보 연동이 완료되니 운행시 주의바랍니다.\n" +
                ''+"\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                infoMsg,
        };
    },

    bike006: function(data){
        console.log(data);
        let platform = data.platform;
        let cell = data.cell;
        let dName = data.dName;
        let carNum = data.dCarNum;
        let url = data.url;

        let infoMsg = "현대해상 개인정보 제공동의 본은인증 절차를 위하여 아래의 URL로 이동하여 절차를 진행 부탁드립니다.\n"+url;

        return result = {
            "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
            "ALIGO_USER_ID":"yoojjtt",
            "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
            "token":"",
            "templateCode":"tpl_code=TI_8231",
            "sender":"sender=18773006",
            "receiver":"receiver_1="+cell,
            "subject":"subject_1=현대해상 시간제보험 개인정보 제공동의 안내",
            "message":"message_1="+
                "안녕하세요, 현대해상 오토바이 시간제보험안내 채널입니다.\n" +
                "\n" +
                "개인정보 제공 동의절차가 필요하여 안내드립니다.\n" +
                "\n" +
                infoMsg+"\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" ,

            "failover":"Y",
            "fsubject_1":"현대해상 시간제보험 개인정보 제공동의 안내",
            "fmessage_1":
                "안녕하세요, 현대해상 오토바이 시간제보험안내 채널입니다.\n" +
                "\n" +
                "개인정보 제공 동의절차가 필요하여 안내드립니다.\n" +
                "\n" +
                infoMsg+"\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n"

        };
    },
    baemin001: function(data){
        console.log(data);
        let platform = data.platform;
        let cell = data.cell;
        let dName = data.dName;
        let carNum = data.dCarNum;
        let url = data.url;

        return result = {
            "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
            "ALIGO_USER_ID":"yoojjtt",
            "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
            "token":"",
            "templateCode":"tpl_code=TI_8938",
            "sender":"sender=18773006",
            "receiver":"receiver_1="+cell,
            "subject":"subject_1=현대해상 시간제보험 가입접수 안내",
            "message":"message_1="+
                "배민커넥트 현대해상 오토바이 시간제보험을 신청해주셔서 감사합니다.\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항\n" +
                "- 기존에 다른 수단, 보험을 이용 후 변경하는 경우 보험 심사 통과 후 카카오톡 채널(@배민커넥트)로 반드시 변경 신청해주세요.\n" +
                "- 개명 및 신청정보의 변경이력이 있으시면 심사 지연이 발생할 수 있으니 문의부탁드립니다.\n" +
                "- 보험 심사에 최대 1~2영업일이 소요되며, 심사 완료 시 문자로 안내해드립니다.\n" +
                "- 아래 링크에서 심사 상태 및 결과를 조회하실 수 있으며, 문의사항이 있을 경우 보험사로 연락해주세요. (1877-3006)\n"+
                "\n"+
                url,
            "failover":"Y",
            "fsubject_1":"현대해상 시간제보험 가입접수 안내",
            "fmessage_1":
                "배민커넥트 현대해상 오토바이 시간제보험을 신청해주셔서 감사합니다.\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항\n" +
                "- 기존에 다른 수단, 보험을 이용 후 변경하는 경우 보험 심사 통과 후 카카오톡 채널(@배민커넥트)로 반드시 변경 신청해주세요.\n" +
                "- 개명 및 신청정보의 변경이력이 있으시면 심사 지연이 발생할 수 있으니 문의부탁드립니다.\n" +
                "- 보험 심사에 최대 1~2영업일이 소요되며, 심사 완료 시 문자로 안내해드립니다.\n" +
                "- 아래 링크에서 심사 상태 및 결과를 조회하실 수 있으며, 문의사항이 있을 경우 보험사로 연락해주세요. (1877-3006)\n"+
                "\n"+
                url,
        };
    },
    baemin002: function(data){
        console.log(data);
        let platform = data.platform;
        let cell = data.cell;
        let dName = data.dName;
        let carNum = data.dCarNum;
        let url = data.url;

        return result = {
            "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
            "ALIGO_USER_ID":"yoojjtt",
            "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
            "token":"",
            "templateCode":"tpl_code=TI_8939",
            "sender":"sender=18773006",
            "receiver":"receiver_1="+cell,
            "subject":"subject_1=현대해상 시간제보험 개인정보 제공동의 안내",
            "message":"message_1="+

                "배민커넥트 현대해상 오토바이 시간제보험 심사가 통과되었습니다.\n" +
                "\n" +
                "아래 링크에서 개인정보제공에 동의해주세요. 이후 운행가능한 보험정보가 배민커넥트에 전달됩니다.\n" +
                "\n" +
                url+"\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항\n" +
                "- 기존에 다른 수단, 보험을 이용 후 변경하는 경우, 카카오톡 채널(@배민커넥트)로 반드시 변경 신청해주세요.\n" +
                "- 운행 오토바이, 계약내용, 책임보험 용도가 변경될 경우, 반드시 보험사에 통보해주세요. \n" +
                "- 계약 내용이 실제와 다를 경우 보상에 제한이 있을 수 있습니다.\n" +
                "- 배달 중의 사고 발생 문의는 현대해상 사고접수번호로 접수해주세요. (1588-5656)\n" +
                "- 배달 수단 및 오토바이 개인유상보험으로 변경을 원하시는 경우, 카카오톡 채널(@배민커넥트)로 문의해주세요.",
            "failover":"Y",
            "fsubject_1":"현대해상 시간제보험 개인정보 제공동의 안내",
            "fmessage_1":

                "배민커넥트 현대해상 오토바이 시간제보험 심사가 통과되었습니다.\n" +
                "\n" +
                "아래 링크에서 개인정보제공에 동의해주세요. 이후 운행가능한 보험정보가 배민커넥트에 전달됩니다.\n" +
                "\n" +
                url+"\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항\n" +
                "- 기존에 다른 수단, 보험을 이용 후 변경하는 경우, 카카오톡 채널(@배민커넥트)로 반드시 변경 신청해주세요.\n" +
                "- 운행 오토바이, 계약내용, 책임보험 용도가 변경될 경우, 반드시 보험사에 통보해주세요. \n" +
                "- 계약 내용이 실제와 다를 경우 보상에 제한이 있을 수 있습니다.\n" +
                "- 배달 중의 사고 발생 문의는 현대해상 사고접수번호로 접수해주세요. (1588-5656)\n" +
                "- 배달 수단 및 오토바이 개인유상보험으로 변경을 원하시는 경우, 카카오톡 채널(@배민커넥트)로 문의해주세요.",
        };
    },
    baemin003: function(data){
        console.log(data);
        let platform = data.platform;
        let cell = data.cell;
        let dName = data.dName;
        let carNum = data.dCarNum;
        let url = data.url;

        return result = {
            "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
            "ALIGO_USER_ID":"yoojjtt",
            "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
            "token":"",
            "templateCode":"tpl_code=TI_8940",
            "sender":"sender=18773006",
            "receiver":"receiver_1="+cell,
            "subject":"subject_1=현대해상 시간제보험 개인정보 제공동의 안내",
            "message":"message_1="+

                "배민커넥트 현대해상 오토바이 시간제보험 심사가 통과되었습니다.\n" +
                "\n" +
                "- 실제 보험의 적용은 심사결과를 받은 다음날 00시 기준으로 적용됩니다. \n" +
                "\n" +
                "- 플랫폼사에 해당시간에 보험정보 연동이 완료되니 운행시 주의바랍니다. \n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항\n" +
                "- 기존에 다른 수단, 보험을 이용 후 변경하는 경우, 카카오톡 채널(@배민커넥트)로 반드시 변경 신청해주세요.\n" +
                "- 운행 오토바이, 계약내용, 책임보험 용도가 변경될 경우, 반드시 보험사에 통보해주세요. \n" +
                "- 계약 내용이 실제와 다를 경우 보상에 제한이 있을 수 있습니다.\n" +
                "- 배달 중의 사고 발생 문의는 현대해상 사고접수번호로 접수해주세요. (1588-5656)\n" +
                "- 배달 수단 및 오토바이 개인유상보험으로 변경을 원하시는 경우, 카카오톡 채널(@배민커넥트)로 문의해주세요.",
            "failover":"Y",
            "fsubject_1":"현대해상 시간제보험 개인정보 제공동의 안내",
            "fmessage_1":
                "배민커넥트 현대해상 오토바이 시간제보험 심사가 통과되었습니다.\n" +
                "\n" +
                "- 실제 보험의 적용은 심사결과를 받은 다음날 00시 기준으로 적용됩니다. \n" +
                "\n" +
                "- 플랫폼사에 해당시간에 보험정보 연동이 완료되니 운행시 주의바랍니다. \n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항\n" +
                "- 기존에 다른 수단, 보험을 이용 후 변경하는 경우, 카카오톡 채널(@배민커넥트)로 반드시 변경 신청해주세요.\n" +
                "- 운행 오토바이, 계약내용, 책임보험 용도가 변경될 경우, 반드시 보험사에 통보해주세요. \n" +
                "- 계약 내용이 실제와 다를 경우 보상에 제한이 있을 수 있습니다.\n" +
                "- 배달 중의 사고 발생 문의는 현대해상 사고접수번호로 접수해주세요. (1588-5656)\n" +
                "- 배달 수단 및 오토바이 개인유상보험으로 변경을 원하시는 경우, 카카오톡 채널(@배민커넥트)로 문의해주세요.",
        };
    },
    baemin004: function(data){
        console.log(data);
        let platform = data.platform;
        let cell = data.cell;
        let dName = data.dName;
        let carNum = data.dCarNum;
        let url = data.url;

        return result = {
            "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
            "ALIGO_USER_ID":"yoojjtt",
            "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
            "token":"",
            "templateCode":"tpl_code=TI_8941",
            "sender":"sender=18773006",
            "receiver":"receiver_1="+cell,
            "subject":"subject_1=현대해상 시간제보험 개인정보 제공동의 안내",
            "message":"message_1="+
                "배민커넥트 현대해상 오토바이 시간제보험 적용을 원하시는 경우, 아래 링크에서 본인인증 후 개인정보 제공에 동의해주세요.\n" +
                "\n" +
                "동의 완료 후 시간제 보험이 적용 가능합니다.\n" +
                "\n" +
                url+"\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" ,

            "failover":"Y",
            "fsubject_1":"현대해상 시간제보험 개인정보 제공동의 안내",
            "fmessage_1":
                "배민커넥트 현대해상 오토바이 시간제보험 적용을 원하시는 경우, 아래 링크에서 본인인증 후 개인정보 제공에 동의해주세요.\n" +
                "\n" +
                "동의 완료 후 시간제 보험이 적용 가능합니다.\n" +
                "\n" +
                url+"\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n"

        };
    },
    baemin005: function(data){
        console.log(data);
        let platform = data.platform;
        let cell = data.cell;
        // let cell = "01085371398";

        let dName = data.dName;
        let carNum = data.dCarNum;
        let resultWhy = data.resultWhy;

        return result = {
            "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
            "ALIGO_USER_ID":"yoojjtt",
            "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
            "token":"",
            "templateCode":"tpl_code=TI_8942",
            "sender":"sender=18773006",
            "receiver":"receiver_1="+cell,
            "subject":"subject_1=현대해상 시간제보험 심사결과 안내",
            "message":"message_1="+

                "배민커넥트 현대해상 오토바이 시간제보험 심사 결과 안내해드립니다.\n" +
                "\n" +
                "보험사 인수 심사 기준에 따라 현대해상 시간제보험 이용이 어렵습니다. 다른 보험 및 배달수단 이용을 원하시는 경우, 카카오톡 채널(@배민커넥트)로 문의해주세요.\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 거절 사유\n" +
                "- "+resultWhy+"\n" +
                "\n" +
                "상세 이력조회는 아래의 연락처로 연락부탁드립니다. (1877–3006)\n" +
                "\n" +
                "오토바이 개인유상보험 또는 다른 수단(자동차, 자전거, 도보 등)으로 배민커넥트 활동을 원하실 경우, 아래 링크에서 변경 신청해주세요.\n" +
                "https://pf.kakao.com/_xdhKKT",
            "failover":"Y",
            "fsubject_1":"현대해상 시간제보험 심사결과 안내",
            "fmessage_1":

                "배민커넥트 현대해상 오토바이 시간제보험 심사 결과 안내해드립니다.\n" +
                "\n" +
                "보험사 인수 심사 기준에 따라 현대해상 시간제보험 이용이 어렵습니다. 다른 보험 및 배달수단 이용을 원하시는 경우, 카카오톡 채널(@배민커넥트)로 문의해주세요.\n" +
                "\n" +
                "■ 신청 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 거절 사유\n" +
                "- "+resultWhy+"\n" +
                "\n" +
                "상세 이력조회는 아래의 연락처로 연락부탁드립니다. (1877–3006)\n" +
                "\n" +
                "오토바이 개인유상보험 또는 다른 수단(자동차, 자전거, 도보 등)으로 배민커넥트 활동을 원하실 경우, 아래 링크에서 변경 신청해주세요.\n" +
                "https://pf.kakao.com/_xdhKKT"
        };
    },
    baemin006: function(data){
        console.log(data);
        let platform = data.platform;
        let cell = data.cell;
        let dName = data.dName;
        let carNum = data.dCarNum;

        return result = {
            "ALIGO_API_KEY":"xme5by3owdpvjw22tr57qzc2dwh7ch8f",
            "ALIGO_USER_ID":"yoojjtt",
            "ALIGO_SENDER_KEY":"04cdd54e4b161c3dbc2b9acb58259d44b94176d3",
            "token":"",
            "templateCode":"tpl_code=TI_8943",
            "sender":"sender=18773006",
            "receiver":"receiver_1="+cell,
            "subject":"subject_1=현대해상 계약 종료 안내",
            "message":"message_1="+

                "배민커넥트 현대해상 오토바이 시간제보험 계약이 해지되었습니다.\n" +
                "\n" +
                "■ 계약 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항 \n" +
                "- 보험 재가입을 원하시는 경우 가입페이지에서 다시 한 번 신청해주세요.  \n" +
                "- 오토바이 개인유상운송보험 또는 다른 이동수단으로 변경을 원하실 경우 카카오톡 채널(@배민커넥트)에 문의해주세요.  \n (https://pf.kakao.com/_xdhKKT)"

            ,
            "failover":"Y",
            "fsubject_1":"현대해상 계약 종료 안내",
            "fmessage_1":

                "배민커넥트 현대해상 오토바이 시간제보험 계약이 해지되었습니다.\n" +
                "\n" +
                "■ 계약 정보\n" +
                "- 플랫폼 : "+platform+"\n" +
                "- 신청자명 : "+dName+"\n" +
                "- 차량번호 : "+carNum+"\n" +
                "\n" +
                "■ 유의사항 \n" +
                "- 보험 재가입을 원하시는 경우 가입페이지에서 다시 한 번 신청해주세요.  \n" +
                "- 오토바이 개인유상운송보험 또는 다른 이동수단으로 변경을 원하실 경우 카카오톡 채널(@배민커넥트)에 문의해주세요.  \n (https://pf.kakao.com/_xdhKKT)"


        };
    },



};

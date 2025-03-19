
function service_config() {

    var return_val = {
        "production" : [
            {
                serviceName : "현대-대리",
                dbAccess     : "simg_center",
                bpk     : 0,
                type : 'DAERI',
                key: 'CB1C198B747B87D03DFF8FA2CE776F1D',
                iv:'f95ef629cdc8e11a',
                joinUrl     : "",
                agreeUrl     : "",
            },
            {
                serviceName : "배민커넥트",
                dbAccess     : "hyundai_baemin_prod",
                bpk     : 1,
                type : 'BIKE',
                key: '93604C5065704BDF815A2ECE825F55B5',
                iv:'f3fba9e6300393bf',
                joinUrl     : "https://connect-bike-hyundai.simginsu.net",
                agreeUrl     : "https://connect-bike-hyundai.simginsu.net/check",
            },
            {
                serviceName : "딜버",
                dbAccess     : "hyundai_dilver_prod",
                bpk     : 3,
                type : 'BIKE',
                key: 'D90CB5D7EDE0A6749B67EA1AA2082717',
                iv:'5686575af168b38f',
                joinUrl     : "https://connect-bike-hyundai.simginsu.net",
                agreeUrl     : "https://connect-bike-hyundai.simginsu.net/check",

            },
            {
                serviceName : "비욘드",
                dbAccess     : "hyundai_run2u_prod",
                bpk     : 4,
                type : 'BIKE',
                key: '14B33A902F889725A842E197CB55AD4C',
                iv:'c7d5e747e2fe7c3e',
                joinUrl     : "https://connect-bike-hyundai.simginsu.net",
                agreeUrl     : "https://connect-bike-hyundai.simginsu.net/check",

            },
            {
                serviceName : "플러스앤소프트",
                dbAccess     : "hyundai_plussoft_prod",
                bpk     : 5,
                type : 'BIKE',
                key: 'BD55734EB6776EB3482ADF7224020EB2',
                iv:'6e3f17d5de3c4c32',
                joinUrl     : "https://connect-bike-plusnsoft.simginsu.net",
                agreeUrl     : "https://connect-bike-plusnsoft.simginsu.net/check",

            },
            {
                serviceName : "배나구",
                dbAccess     : "hyundai_run2u_prod",
                bpk     : 6,
                type : 'BIKE',
                key: 'E2B8A2B9477D3810BDEB5F6066DF429C',
                iv:'56a6787e8ec5fbd8',
                joinUrl     : "https://connect-bike-run2u.simginsu.net/",
                agreeUrl     : "https://connect-bike-run2u.simginsu.net/check",

            },
            {
                serviceName : "배달시대",
                dbAccess     : "hyundai_run2u_prod", // 배나구(06)와 같은 dbAccess
                bpk     : 7,
                type : 'BIKE',
                key: 'DB825529EC1C58813F278197407654BD',
                iv:'078c042d92281b0a',
                joinUrl     : "https://connect-bike-owra.simginsu.net/",
                agreeUrl     : "https://connect-bike-owra.simginsu.net/check",

            },
            {
                serviceName : "배고파딜리버리",
                dbAccess     : "hyundai_run2u_prod",
                bpk     : 8,
                type : 'BIKE',
                key: 'D25B00B7205CE9C1520B8F79EEE8BAB5',
                iv:'3851df6f0386f97e',
                joinUrl     : "https://connect-bike-baegopa.simginsu.net/",
                agreeUrl     : "https://connect-bike-baegopa.simginsu.net/check",

            },
            {
                serviceName : "두잇",
                dbAccess     : "hyundai_run2u_prod",
                bpk     : 9,
                type : 'BIKE',
                key: 'CC80F25F889C355BDA4AF7314D059F7D',
                iv:'087c07a4c2be3c21',
                joinUrl     : "https://connect-bike-doeat.simginsu.net/",
                agreeUrl     : "https://connect-bike-doeat.simginsu.net/check",

            },
            {
                serviceName : "바로고",
                dbAccess     : "hyundai_run2u_prod",
                bpk     : 10,
                type : 'BIKE',
                key: 'B59AF5619C709B708DE7D07CA8EF6359',
                iv:'24fd6008eb256184',
                joinUrl     : "https://connect-bike-barogo.simginsu.net",
                agreeUrl     : "https://connect-bike-barogo.simginsu.net/check",

            },
            {
                serviceName : "공감파트너스",
                dbAccess     : "hyundai_run2u_prod",
                bpk     : 11,
                type : 'BIKE',
                key: 'B59AF5619C709B708DE7D07CA8EF6359',
                iv:'24fd6008eb256184',
                joinUrl     : "https://connect-bike-gonggam.simginsu.net/",
                agreeUrl     : "https://connect-bike-gonggam.simginsu.net/check",
            },
        ],
        "development" : [
            {
                serviceName : "현대-대리",
                dbAccess     : "simg_center",
                bpk     : 0,
                type : 'DAERI',
                key: 'CB1C198B747B87D03DFF8FA2CE776F1D',
                iv:'f95ef629cdc8e11a',
                joinUrl     : "",
                agreeUrl     : "",
            },
            {
                serviceName : "배민커넥트",
                dbAccess     : "hyundai_baemin_dev",
                bpk     : 1,
                type : 'BIKE',
                key: 'BDAD115A53DACAD3E6C93D515396DF76',
                iv:'30d1a85cd25da460',
                joinUrl     : "https://connect-bike-hyundai.simginsu.net",
                agreeUrl     : "https://connect-bike-hyundai.simginsu.net/check",
            },
            {
                serviceName : "딜버",
                dbAccess     : "hyundai_dilver_dev",
                bpk     : 3,
                type : 'BIKE',
                key: '73C7E3853590C2F0FE454772DF82F9FD',
                iv:'bb3b04d9b8ae308a',
                joinUrl     : "https://connect-bike-dealver.simginsu.net",
                agreeUrl     : "https://connect-bike-dealver.simginsu.net/check",

            },
            {
                serviceName : "비욘드",
                dbAccess     : "hyundai_run2u_dev",
                bpk     : 4,
                type : 'BIKE',
                key: '2EB3013C1AE402F2D680B78D8D68164B',
                iv:'a88ffd0b3e379e51',
                joinUrl     : "https://connect-bike-beyond-dev.simginsu.net",
                agreeUrl     : "https://connect-bike-beyond-dev.simginsu.net/check",

            },
            {
                serviceName : "플러스앤소프트",
                dbAccess     : "hyundai_plussoft_dev",
                bpk     : 5,
                type : 'BIKE',
                key: 'D3DE9968D02D195C0EF9ADD83402878A',
                iv:'e866c5f7104a965e',
                joinUrl     : "https://connect-bike-plusnsoft-dev.simginsu.net",
                agreeUrl     : "https://connect-bike-plusnsoft-dev.simginsu.net/check",

            },
            {
                serviceName : "배나구",
                dbAccess     : "hyundai_run2u_dev",
                bpk     : 6,
                type : 'BIKE',
                key: '07552FA9C59BA29AAA14DB9244EDA15E',
                iv:'bb3b04d9b8ae308a',
                joinUrl     : "https://connect-bike-run2u-dev.simginsu.net/",
                agreeUrl     : "https://connect-bike-run2u-dev.simginsu.net/check",

            },
            {
                serviceName : "배달시대",
                dbAccess     : "hyundai_run2u_dev",
                bpk     : 7,
                type : 'BIKE',
                key: 'F7213AD9465BC3F45ED8A061B2CD4793',
                iv:'2a3c7e62d92d36c9',
                joinUrl     : "https://connect-bike-owra-dev.simginsu.net/",
                agreeUrl     : "https://connect-bike-owra-dev.simginsu.net/check",

            },
            {
                serviceName : "배고파딜리버리",
                dbAccess     : "hyundai_run2u_dev",
                bpk     : 8,
                type : 'BIKE',
                key: 'B149A051503CCC346389828C6294A940',
                iv:'bd1b3c68a7d5353a',
                joinUrl     : "https://connect-bike-baegopa-dev.simginsu.net/",
                agreeUrl     : "https://connect-bike-baegopa-dev.simginsu.net/check",

            },
            {
                serviceName : "두잇",
                dbAccess     : "hyundai_run2u_dev",
                bpk     : 9,
                type : 'BIKE',
                key: '5C7400D50FB870DCED454003B85C8B63',
                iv:'dc7ee041c6033f59',
                joinUrl     : "https://connect-bike-doeat-dev.simginsu.net/",
                agreeUrl     : "https://connect-bike-doeat-dev.simginsu.net/check",

            },
            {
                serviceName : "바로고",
                dbAccess     : "hyundai_run2u_dev",
                bpk     : 10,
                type : 'BIKE',
                key: 'E995900C166C4340A4B6A7FC864E9B7E',
                iv:'52759feb043a0909',
                joinUrl     : "https://connect-bike-barogo-dev.simginsu.net/",
                agreeUrl     : "https://connect-bike-barogo-dev.simginsu.net/check",

            },
            {
                serviceName : "공감",
                dbAccess     : "hyundai_run2u_dev",
                bpk     : 11,
                type : 'BIKE',
                key: 'CC88FD60-3A71-11EF-9E64-6FAD2203D7C2',
                iv:'dc7ee041c6033f59',
                joinUrl     : "https://connect-bike-gonggam-dev.simginsu.net/",
                agreeUrl     : "https://connect-bike-gonggam-dev.simginsu.net/check",

            },
            {
                serviceName : "(주)캐치",
                dbAccess     : "hyundai_run2u_dev",
                bpk     : 12,
                type : 'BIKE',
                key: 'CC88FD60-3A71-11EF-9E64-6FAD2203D7C2',
                iv:'dc7ee041c6033f59',
                joinUrl     : "https://deliverycatch-test.simginsu.net/",
                agreeUrl     : "https://deliverycatch-test.simginsu.net/check",

            },
        ]
    };
    return return_val;
}

module.exports = service_config;

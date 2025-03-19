
function accident_config() {

    var return_val = {
        "production" : [
            {
                apiUrl : "https://brms-external-api.baemin.com",
                route     : "/api/v1/insurance/bike/hyundai/accident-history",
                bpk     : 1,
                type : 'BIKE',
            },
            {
                apiUrl : "https://connect-bike-dealver.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 3,
                type : 'BIKE',


            },
            {
                apiUrl : "https://connect-bike-beyond.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 4,
                type : 'BIKE',


            },
            {
                apiUrl : "https://connect-bike-plusnsoft.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 5,
                type : 'BIKE',


            },
            {
                apiUrl : "https://connect-bike-run2u.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 6,
                type : 'BIKE',


            },
            {
                apiUrl : "https://connect-bike-owra.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 7,
                type : 'BIKE',


            },
            {
                apiUrl : "https://connect-bike-baegopa.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 8,
                type : 'BIKE',


            },
            {
                apiUrl : "https://connect-bike-doeat.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 9,
                type : 'BIKE',


            },
            {
                apiUrl : "https://connect-bike-barogo.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 10,
                type : 'BIKE',


            },
        ],
        "development" : [
            {
                apiUrl : "http://brms-external-api.betabaemin.com",
                route     : "/api/v1/insurance/bike/hyundai/accident-history",
                bpk     : 1,
                type : 'BIKE',

            },
            {
                apiUrl : "https://connect-bike-dealver.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 3,
                type : 'BIKE',

            },
            {
                apiUrl : "https://connect-bike-beyond-dev.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 4,
                type : 'BIKE',


            },
            {
                apiUrl : "https://connect-bike-plusnsoft.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 5,
                type : 'BIKE',


            },
            {
                apiUrl : "https://connect-bike-owra-dev.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 7,
                type : 'BIKE',


            },
            {
                apiUrl : "https://connect-bike-baegopa-dev.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 8,
                type : 'BIKE',


            },
            {
                apiUrl : "https://connect-bike-doeat-dev.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 9,
                type : 'BIKE',


            },
            {
                apiUrl : "https://connect-bike-gonggam-test.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 11,
                type : 'BIKE',


            },
            {
                apiUrl : "https://deliverycatch-test.simginsu.net",
                route     : "/api/v1/request/client/accident",
                bpk     : 12,
                type : 'BIKE',


            },
        ]
    };
    return return_val;
}

module.exports = accident_config;

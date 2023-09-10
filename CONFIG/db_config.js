
function db_config() {

    var return_val = {
        "hyundai_baemin_dev" : {
            connectionLimit : 1000,
            host     : 'baemin-hyundai.c73he84duiho.ap-northeast-2.rds.amazonaws.com',
            port     : 3210,
            user     : 'simg',
            password : 'simg1234',
            database : 'hyundai_dev',
            options: {
                connectTimeout  : 1000 * 480000,
                requestTimeout  : 1000 * 480000
            },
            multipleStatements: true
        },
        "hyundai_baemin_prod" : {
            connectionLimit : 1000,
            host     : 'baemin-hyundai.c73he84duiho.ap-northeast-2.rds.amazonaws.com',
            port     : 3210,
            user     : 'simg',
            password : 'simg1234',
            database : 'hyundai',
            options: {
                connectTimeout  : 1000 * 480000,
                requestTimeout  : 1000 * 480000
            },
            multipleStatements: true
        },
        "hyundai_dilion_dev" : {
            connectionLimit : 1000,
            host     : 'hana-hand-prod.c73he84duiho.ap-northeast-2.rds.amazonaws.com',
            port     : 3306,
            user     : 'simg',
            password : 'simg4*7^3',
            database : 'hyundai_dev',
            options: {
                connectTimeout  : 1000 * 480000,
                requestTimeout  : 1000 * 480000
            },
            multipleStatements: true
        },
        "hyundai_dilion_prod" : {
            connectionLimit : 1000,
            host     : 'hana-hand-prod.c73he84duiho.ap-northeast-2.rds.amazonaws.com',
            port     : 3306,
            user     : 'simg',
            password : 'simg4*7^3',
            database : 'hyundai',
            options: {
                connectTimeout  : 1000 * 480000,
                requestTimeout  : 1000 * 480000
            },
            multipleStatements: true
        },
        "hyundai_dilver_dev" : {
            connectionLimit : 1000,
            host     : '3.39.40.75',
            port     : 3306,
            user     : 'simg',
            password : 'simg123@',
            database : 'hyundai_dev',
            options: {
                connectTimeout  : 1000 * 480000,
                requestTimeout  : 1000 * 480000
            },
            multipleStatements: true
        },
        "hyundai_dilver_prod" : {
            connectionLimit : 1000,
            host     : '3.39.40.75',
            port     : 3306,
            user     : 'simg',
            password : 'simg123@',
            database : 'hyundai',
            options: {
                connectTimeout  : 1000 * 480000,
                requestTimeout  : 1000 * 480000
            },
            multipleStatements: true
        },
        "hyundai_beyond_dev" : {
            connectionLimit : 1000,
            host     : '3.37.139.188',
            port     : 3306,
            user     : 'simg',
            password : 'simg123@',
            database : 'hyundai-dev',
            options: {
                connectTimeout  : 1000 * 480000,
                requestTimeout  : 1000 * 480000
            },
            multipleStatements: true
        },
        "hyundai_beyond_prod" : {
            connectionLimit : 1000,
            host     : '3.37.139.188',
            port     : 3306,
            user     : 'simg',
            password : 'simg123@',
            database : 'hyundai',
            options: {
                connectTimeout  : 1000 * 480000,
                requestTimeout  : 1000 * 480000
            },
            multipleStatements: true
        },
        "hyundai_plussoft_dev" : {
            connectionLimit : 1000,
            host     : '3.39.207.2',
            port     : 3306,
            user     : 'simg',
            password : 'simg@716671',
            database : 'plussoftDev',
            options: {
                connectTimeout  : 1000 * 480000,
                requestTimeout  : 1000 * 480000
            },
            multipleStatements: true
        },
        "hyundai_plussoft_prod" : {
            connectionLimit : 1000,
            host     : '3.39.207.2',
            port     : 3306,
            user     : 'simg',
            password : 'simg@716671',
            database : 'plussoftProd',
            options: {
                connectTimeout  : 1000 * 480000,
                requestTimeout  : 1000 * 480000
            },
            multipleStatements: true
        },
        "hyundai_run2u_dev" : {
            connectionLimit : 1000,
            host     : '3.37.139.188',
            port     : 3306,
            user     : 'simg',
            password : 'simg123@',
            database : 'hyundai_dev',
            // options: {
            //     connectTimeout  : 1000 * 480000,
            //     requestTimeout  : 1000 * 480000
            // },
            // multipleStatements: true
        },
        "hyundai_run2u_prod" : {
            connectionLimit : 1000,
            host     : '3.37.139.188',
            port     : 3306,
            user     : 'simg',
            password : 'simg123@',
            database : 'hyundai',
            options: {
                connectTimeout  : 1000 * 480000,
                requestTimeout  : 1000 * 480000
            },
            multipleStatements: true
        },




    }

    return return_val;
}

module.exports = db_config;

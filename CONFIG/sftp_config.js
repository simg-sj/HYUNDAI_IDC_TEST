
function SFTP_config() {

    var return_val = {
        "simg_production":{
            "host":"218.236.58.142",
            "port":"22142",
            "username":"simg",
            "password":"@)@)simg@)!!",
            "readyTimeout":30000
        },
        "simg_development":{
            "host":"218.236.58.143",
            "port":"22143",
            "username":"simg",
            "password":"@)@)simg@)!!",
            "readyTimeout":30000
        },
        "production":{
            "host":"218.236.58.142",
            "port":"30041",
            "username":"hyundai_user001",
            "password":"@)hyundai!)*",
            "readyTimeout":30000
        },
        "development":{
            "host":"218.236.58.143",
            "port":"30041",
            "username":"hyundai_user002",
            "password":"!(hyundai$#",
            "readyTimeout":30000
        }
    }

    return return_val;
}

module.exports = SFTP_config;

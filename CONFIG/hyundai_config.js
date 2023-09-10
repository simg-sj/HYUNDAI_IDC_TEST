function hyundai_config(){
    var return_val = {
        "production":{
            host:"211.192.0.114",
            port:"56050"
        },
        "development":{
            host:"115.21.8.33",
            port:"56050"
        }
    }

    return return_val;
}

module.exports = hyundai_config;

/**
 * 작성자 : 유종태
 * 작성일 :2021.07.16
 * 내용 :
 * 파일처리관련 유틸
 * **/

const iconv = require('iconv-lite');
const fs = require("fs"); // Use node filesystem
const Client = require('ssh2').Client; //SSH
const Iconv = require('iconv').Iconv;
const jschardet = require('jschardet');
module.exports = {
    /**
     *
     *
     * 로컬 파일 만들기
     *
     */
    FILE_MAKE: function(FILENAME, PATH, ENCODING, DATA){
        var fileCompletePath = "";

        if (DATA == null) {
            fileCompletePath = "파일 없음";
            return fileCompletePath;
        }



        /**
         * encoding type
         * euc-kr
         * utf8
         *
         * **/
        var encoding = ENCODING;
        if(ENCODING == 'euc-kr' || ENCODING == 'utf8'){
            DATA = iconv.encode(DATA, encoding);
        }else{
            fileCompletePath = "인코딩 실패";
            return fileCompletePath;
        }


        /**
         * 삭제 옵션없으면 새로 생성
         *
         */
        if(!fs.existsSync(PATH)){

            fs.writeFile(PATH, DATA, {recursive:true}, (error)=>{
                if(error) {
                    console.error('에러 : ', error);
                }else{
                    console.log('파일 생성  : ', PATH);
                }

            });
        }else{

            fs.appendFile(PATH, DATA, {recursive:true}, (error)=>{
                if(error) {
                    console.error('에러 : ', error);
                }else{
                    console.log('파일 덮어쓰기  : ', PATH);
                }
            });
        }










    },

    /** 파일경로에 해당하는 디렉토리없으면 디렉토리생성 **/
    FILE_DIRECTORY_CHECK: function(PATH){


        if(!fs.existsSync(PATH)){
            fs.mkdirSync(PATH, {recursive:true}, (error)=>{
                if(error) {
                    console.error('에러 : ', error);
                }else{
                    console.log('디렉토리 생성  : ', log);
                }

            });
        }

    },
    /**
     *
     * 로컬 파일 읽기
     *
     */
    FILE_READ: function(PATH){
        console.log(PATH);
        var returnData = null;
        return new Promise(function (resolve, reject) {

            fs.readFile(PATH,  function(err, data){
                if(data==undefined) {
                    console.log( PATH + " 파일이 존재하지 않음");
                    return;
                }

                data = iconv.decode(data,"euc-kr").toString(); /** DB encoding type 이 euc-kr 이여서  **/

                // console.log(data);
                resolve(data);


            });

        });



    },
    /**
     *
     * 경로의 디렉토리의 파일목록만 읽음
     */
    SFTP_FILE_READ_DIR: function(CONFIG, PATH) {

        var conn = new Client();
        conn.on('ready', function() {
            conn.sftp(function(err, sftp) {
                if (err) throw err;


                console.log('ACCESS SUCCESS');
                sftp.readdir(PATH, function(err, list) {
                    if (err) throw err;
                    // List the directory in the console
                    console.dir(list);
                    // Do not forget to close the connection, otherwise you'll get troubles
                    conn.end();
                });

            });
        }).connect(CONFIG);
    },
    /***
     *
     * 원격지 파일 읽은이후 로컬에 파일 쓰기
     *
     */
    SFTP_FILE_READ_DOWN: function(CONFIG, PATH, DOWNPATH) {

        console.log(CONFIG);
        console.log(PATH);
        console.log(DOWNPATH);
        const conn = new Client();
        // sftp 파일 읽기 시작..
        conn.on('ready', function() {

            conn.sftp(function(err, sftp) {
                if (err) throw err;

                var streamErr = "";
                const stream = sftp.createReadStream(PATH); // 원격지섭에 읽을 파일의 경로 ( 방금업로드한 파일 )
                const fileOptions = { encoding: 'utf8' };
                const wstream = fs.createWriteStream(DOWNPATH, fileOptions); // 로컬환경에 저장할 저장할 파일


                stream.pipe(wstream);

                stream.on('data', function(d){

                });

                stream.on('error', function(e){
                    streamErr = e;
                })
                stream.on('close', function(){
                    if(streamErr) {
                        console.log("downloadFile(): Error retrieving the file: " + streamErr);
                    } else {

                    }
                    conn.end();
                });

                wstream.on('finish', function () {
                    console.log('LOCAL SAVE PATH : ',DOWNPATH);

                    const content = fs.readFileSync(DOWNPATH);
                    const content2 = jschardet.detect(content);

                    const iconv = new Iconv(content2.encoding, "utf-8");
                    const content3 = iconv.convert(content); // UTF-8 로 변환
                    const utf8Text = content3.toString('utf-8'); // 버퍼를 문자열로 변환 console.log(utf8Text);
                    // UTF-8으로 다시 파일 저장
                    fs.writeFileSync(DOWNPATH, utf8Text, 'utf-8');

                    // fs.writeFileSync(DOWNPATH, content);
                });
            });

        }).connect(CONFIG);
    },
    /**
     *  원격지 파일 업로드
     * 로컬파일읽어서 파일업로드
     *
     *
     */
    SFTP_FILE_UPLOAD: function(LOCALFILE, CONNECT, REMOTEPATH){

        var conn = new Client();
        conn.on('ready', function() {
            conn.sftp(function(err, sftp) {
                if (err) throw err;


                var readStream = fs.createReadStream(LOCALFILE); // 업로드할 로컬파일
                var writeStream = sftp.createWriteStream(REMOTEPATH); // 원격지의 파일

                writeStream.on('close',function () {
                    console.log( "------------FINISHED  :: file transferred succesfully" );
                    console.log(REMOTEPATH)
                    // readAndSend(BUSINESSDAY); // 업로드한곳의 파일을 다시 다운로드하여 메일로 보낸다. [ 검증하기 위해서 ]
                });

                writeStream.on('end', function () {
                    console.log( "sftp connection closed!!!!!!!!!!!" );
                    conn.close();
                });

                // initiate transfer of file
                readStream.pipe( writeStream );
            });
        }).connect(CONNECT);
    }

}




;

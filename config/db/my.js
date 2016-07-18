/**
 * Created by kevin on 15/11/27.
 */
var mysql = require('mysql');
var conn;
var logger = require('../log/log4-js');

var os = require('os');

function handleError () {

    var ipv4;

    if(os.networkInterfaces().eth1){
        for(var i=0;i<os.networkInterfaces().eth1.length;i++){
            if(os.networkInterfaces().eth1[i].family=='IPv4'){
                ipv4=os.networkInterfaces().eth1[i].address;
            }
        }
        var hostname = os.hostname();
        //console.log(hostname,ipv4);
        if(ipv4 == '121.41.41.46'){
            conn = mysql.createConnection({
                host: 'rdsf39n5tp6w482946xa.mysql.rds.aliyuncs.com',
                user: 'ecp_test',
                password: 'ecp_test',
                database: 'questionnaire',
                port: 3306
            });
            console.log('informal');
        }else if(ipv4 == '121.41.123.2'){
            conn = mysql.createConnection({
                host: 'rdsvy6jrfrbi2a2.mysql.rds.aliyuncs.com',
                user: 'ecp',
                password: 'CqmygDsx2s_MYSQL',
                database: 'questionnaire',
                port: 3306
            });
            console.log('formal');
        }
    }else if(os.networkInterfaces().lo0){
        for(var i=0;i<os.networkInterfaces().lo0.length;i++){
            if(os.networkInterfaces().lo0[i].family=='IPv4'){
                ipv4=os.networkInterfaces().lo0[i].address;
            }
        }
        if(ipv4 == '127.0.0.1'){
            conn = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root',
                database: 'questionnaire',
                port: 3306
                //,
                //multipleStatements: true
            });
            console.log('localhost');
        }
    }



    //conn = mysql.createConnection({
    //    host:'rdsvy6jrfrbi2a2.mysql.rds.aliyuncs.com',
    //    user:'ecp',
    //    password:'CqmygDsx2s_MYSQL',
    //    database:'project',
    //    port:'3306'
    //});

    //连接错误，2秒重试
    conn.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleError , 2000);
        }
    });

    conn.on('error', function (err) {
        console.log('db error', err);
        logger.info(err);
        // 如果是连接断开，自动重新连接
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            logger.info('connection_lost');
            handleError();
        }
        if(err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR'){
            logger.info(new Date()+'enqueue');
            handleError();
        } else {
            logger.info('else');
            handleError();
        }
    });

    setInterval(function(){
        conn.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
            if (err) throw err;

            console.log('The solution is: ', rows[0].solution);
        });
    },3600000);
    console.log('mysql ready!');
}
handleError();

var Mysql = {
  questionnaire:conn
};
module.exports = Mysql;
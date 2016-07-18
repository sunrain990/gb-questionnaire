/**
 * Created by kevin on 16/1/21.
 */
var redis = require('redis');
var redisInfo = {
    port:6380,
    url:'localhost'
};
var os = require('os');

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
        console.log('dev-redis');
    }else if(ipv4 == '121.41.123.2'){
        console.log('formal-redis');
    }else if(ipv4 == '120.26.245.233'){
        redisInfo.url = '10.168.161.193';
        console.log('test-redis');
    }else if(ipv4 == '120.55.90.62') {
        redisInfo.url = '10.168.247.105';
    }
}

//创建redis连接
var pub;
var sub;
var store;
var zero;
function handleRedis(port,url){
    zero = redis.createClient(port,url);
    pub = redis.createClient(port,url);
    sub = redis.createClient(port,url);
    store = redis.createClient(port,url);
    zero.select(0);
    pub.select(12);
    store.select(13);
    sub.select(14);
    //pub.on("error", function(error) {
    //    handleRedis();
    //});
    //
    //sub.on("error", function(error) {
    //    handleRedis();
    //});
    //
    //store.on("error", function(error) {
    //    handleRedis();
    //});
}
handleRedis(redisInfo.port,redisInfo.url);
var Redis = {
    zero:zero,
    pub:pub,
    sub:sub,
    store:store
};

module.exports = Redis;
/**
 * Created by kevin on 16/1/21.
 */
var redis = require('redis');
var redisInfo = {
    port:6380,
    url:'localhost'
};
//创建redis连接
var pub;
var sub;
var store;
function handleRedis(port,url){
    pub = redis.createClient(port,url);
    sub = redis.createClient(port,url);
    store = redis.createClient(port,url);
    pub.select(12);
    store.select(13);
    sub.select(14);
    console.log('redis ready!');
    pub.on("error", function(error) {
        setTimeout(handleRedis , 2000);
    });

    sub.on("error", function(error) {
        setTimeout(handleRedis , 2000);
    });

    store.on("error", function(error) {
        setTimeout(handleRedis , 2000);
    });
}
handleRedis(redisInfo.port,redisInfo.url);
var Redis = {
    pub:pub,
    sub:sub,
    store:store
};

module.exports = Redis;
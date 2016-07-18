/**
 * Created by kevin on 16/2/1.
 */
var later = require('later');
var uuid = require('node-uuid');

//function Timer(master,uuid,schedule){
//    this.master = master;
//    this.uuid = uuid;
//    this.schedule = schedule;
//}
//
//Timer.prototype = {
//    constructor:Timer,
//    setInterval:function(fn,time){
//        var t =later.setInterval(fn, this.schedule);
//        return t;
//    },
//    setTimeout:function(fn,time){
//        var t = later.setTimeout(fn,this.schedule);
//        return t;
//    },
//    storemysql:function(){
//
//    },
//    clear:function(){
//        this.schedule
//    }
//};
//
//var schedule = later.parse.recur().every(1).second();
//var time = new Timer(1,'1234',schedule);
//var tt = time.setInterval(function(){
//    console.log(new Date()+'time');
//},schedule);

//later.date.localTime();
//
//console.log("Now:"+new Date());
//
var schedule = later.parse.recur().every(1).second();
var uuid = uuid.v4();
console.log(uuid,'this is uuid!');
var master = 1;
var trigger = later.setInterval(function(){test(Math.random(10));},schedule);

var Schedules = {
    uuid:{
        master:master,
        schedule:schedule,
        trigger:trigger
    }
};


function test(val) {
    console.log(new Date());
    console.log(val);
}

module.exports = Schedules;

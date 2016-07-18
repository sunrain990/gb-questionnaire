/**
 * Created by kevin on 16/2/17.
 */
var later = require('later');
var uuuid = require('node-uuid');

//var schedule = later.parse.recur().every(1).second();
//var uuid = uuid.v4();

function Later(cron_text){
    this.schedule = later.parse.text(cron_text);
    this.uuid = uuuid.v4();
    //this.schedule = schedule;
}

Later.prototype = {
    constructor:Later,
    setInterval:function(fn){
        this.sched =later.setInterval(fn, this.schedule);
        return this.sched;
    },
    setTimeout:function(fn){
        this.sched = later.setTimeout(fn,this.schedule);
        return this.sched;
    },
    storemysql:function(){

    },
    clear:function(){
        this.sched.clear();
    }
};

var abc = Later('every 2 secs').setInterval(function(){console.log('yoyoyo!');});
console.log(abc);
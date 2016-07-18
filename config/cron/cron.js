/**
 * Created by kevin on 16/2/2.
 */
var later = require('later');
var uuid = require('node-uuid');

var schedule = later.parse.recur().every(1).second();
var uuid = uuid.v4();
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
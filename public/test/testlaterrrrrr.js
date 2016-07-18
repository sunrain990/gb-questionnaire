/**
 * Created by kevin on 16/2/2.
 */
var Schedules = require('./latertest');

setTimeout(function(){
    Schedules.uuid.trigger.clear();
},5000);
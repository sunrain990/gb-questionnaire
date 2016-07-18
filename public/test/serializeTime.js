/**
 * Created by kevin on 16/2/1.
 */
var CronJob = require('cron').CronJob;

var uuid = require('node-uuid');

var schedule = {
    userid1:[
        {
            uuid:'',
            job:job
        },{

        },{

        }
],
    userid2:[]
};

console.log(uuid.v4());
var uuidv4 = uuid.v4();

var job = new CronJob({
    cronTime: '*/1 * * * * *',
    onTick: function() {
        /*
         * Runs every weekday (Monday through Friday)
         * at 11:30:00 AM. It does not run on Saturday
         * or Sunday.
         */
        console.log('every second!',new Date());
    },
    start: false,
    context:'',
    timeZone: 'Asia/Shanghai'
});

schedule["'"+uuidv4+"'"] = job;

console.log(schedule);

job.start();

setTimeout(function(){
    schedule["'"+uuidv4+"'"].stop();
},5000);
/**
 * Created by kevin on 16/1/8.
 */
var log4js = require('log4js');

log4js.configure({
    appenders:[
        {type:'console'},
        {
            type:'file',
            filename:'logger/Whisper.log',
            category:'normal',
            maxLogSize:204800,
            backups:10
        }
    ]
});

var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

module.exports = logger;
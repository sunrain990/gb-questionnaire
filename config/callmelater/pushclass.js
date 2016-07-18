/**
 * Created by kevin on 16/3/2.
 */
var later = require('later');
later.date.localTime();
//var uuuid = require('node-uuid');
var Mysql = require('../db/my');
var Schedules = require('../memoto/Schedules');
var async = require('async');

function pushclass(){
    Mysql.questionnaire.query('select * from cron where `status`=1 and `repeat`=0',function(err,res){
        if(!err){
            console.log(res);

            async.each(res,function(item,callback){

                if(item.pushtpl&&item.pushtpl!=0&&item.sendto&&item.sendto!=0){

                    console.log(item,'this is item!');

                    if(Schedules[item.uuid]){
                        Schedules[item.uuid].trigger.clear();
                    }

                    var schedule;
                    var teacherid = item.teacherid;
                    if(item.hassecond == 1){
                        console.log('task.task.true');
                        schedule = later.parse.cron(item.task,true);
                    }else{
                        console.log('task.task.true else');
                        schedule = later.parse.cron(item.task);
                    }
                    var trigger;
                    if(item.repeat == 0){
                        console.log('task.type.0');
                        trigger = later.setInterval(function(){
                            console.log(new Date());

                            function pushmsg(to,msg){
                                async.each(to, function(item1, callback) {
                                    Mysql.questionnaire.query('select * from paper where id='+item.pushtpl,function(err,re2){
                                        if(!err){
                                            var task = re2[0];
                                            console.log(task,to,item1,'this is re2 task-----------------------------');
                                            var msg = {
                                                paperid:item.pushtpl,
                                                studentid:item1,
                                                teacherid:teacherid,
                                                topics:task.senddata,
                                                name:task.name,
                                                topicnums:task.topicnums,
                                                classid:item.sendto,
                                                cronid:item.id
                                            };
                                            Mysql.questionnaire.query('insert into usertask set ?',msg,function(err,re3){
                                                if(!err){
                                                    var id = re3.insertId;
                                                    //console.log(id,item1,'this is id toi----------------------------');
                                                    var msg = {
                                                        type:4,
                                                        title:'<a href="/_pages/usertask/usertask.html?usertaskid='+id+'">调查问卷：'+task.name+'</a>',
                                                        authorid:teacherid,
                                                        targetid:item1
                                                    };
                                                    Mysql.questionnaire.query('insert into project.chat_post set ?',msg,function(err,re4){
                                                        if(!err){
                                                            console.log('发送通知成功');
                                                        }
                                                    });
                                                }else{
                                                    logger.info(err);
                                                    //console.log(err);
                                                }
                                            });
                                        }else{
                                            console.log(err);
                                            logger.info(err);
                                            return res.json({code:-1,text:'推送查询出错',data:{err:err}});
                                        }
                                        //return res.json({code:1,text:'启动任务成功！',data:task});
                                    });
                                }, function(err) {
                                    if(!err){
                                        console.log('> done2');
                                    }else{
                                        console.log('> done1');
                                        //return res.json({code:-1,text:'启动任务失败！',data:{err:err}});
                                    }
                                });
                                console.log(':)');
                            }
                            Mysql.questionnaire.query('select uid from project.class_user where classid='+item.sendto,function(err,re){
                                if(!err){
                                    var mapre = re.map(function(i){return i.uid});
                                    pushmsg(mapre,'heheda lalala');
                                }else{
                                    console.log(err);
                                }
                            });
                        },schedule);
                    }
                    Schedules[item.uuid]={
                        task:item.task,
                        schedule:schedule,
                        trigger:trigger
                    };

                }else{
                    console.log('no pushtpl or sendto');
                }

            }, function(err) {
                if(!err){
                    console.log('> doneeee2');
                }else{
                    console.log('> doneeee1');
                }
            });
        }else{
            console.log(err);
        }
    });
}

module.exports = pushclass;


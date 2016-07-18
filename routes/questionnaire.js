var express = require('express');
var router = express.Router();
var logger = require('../config/log/log4-js');
var Mysql = require('../config/db/my');
var moment = require('moment');
var later = require('later');
later.date.localTime();
var uuid = require('node-uuid');
var Redis = require('../config/db/red-is');
var async = require('async');
var nodeExcel = require('excel-export');
var _ = require('lodash');

var Schedules = require('../config/memoto/Schedules');

function Filtermsg(msg){
    var tmpstr="";
    for(var i in msg){
        if(msg[i] == undefined){
            continue;
        }else if(i == 'id'){
            continue;
        }else if(i.indexOf('time')>-1){
            msg[i] = moment(msg[i]).format('YYYY-MM-DD HH:mm:ss');
        }else if(i.indexOf('$$')>-1){
            continue;
        }
        console.log(i,msg[i]);
        tmpstr += " `"+i+"`="+"'"+msg[i]+"'"+" ,"
    }
    //去and
    var remtmpstr = tmpstr.slice(0,-1);
    return remtmpstr;
}

function where(obj,createtime){
    var tmpstr=" where";
    for(var i in obj){
        if(i.indexOf('time')>-1){
            obj[i] = moment(obj[i]).format('YYYY-MM-DD HH:mm:ss');
        }
        if(obj[i] == undefined){
            continue;
        }else if(i.indexOf('$$')>-1){
            continue;
        }else if(i.indexOf('starttime')>-1){
            tmpstr += " `"+createtime+"`>"+"'"+obj[i]+"'"+" and";
            continue;
        }else if(i.indexOf('endtime')>-1){
            tmpstr += " `"+createtime+"`<"+"'"+obj[i]+"'"+" and";
            continue;
        }
        console.log(i,obj[i]);
        tmpstr += " `"+i+"`="+"'"+obj[i]+"'"+" and";
    }
    //去and
    var remtmpstr = tmpstr.slice(0,-3);
    return remtmpstr;
}


function geneSendDate(data){
    return data;
}



/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.json({ title: 'Express' });
});

router.post('/listpaper',function(req,res,next){
    var paper = req.body.paper;
    if(!paper){
        return res.json({code:-1,text:'失败，未有paper对象'});
    }
    var paperid = paper.paperid;
    if(!paperid){
        return res.json({code:-1,text:'失败，未有paperid'});
    }
    Mysql.questionnaire.query('select * from paper'+' where id='+paperid,function(err,re){
        //Mysql.questionnaire.query('select * from paper where id=7;select * from paper where id=6',function(err,re1,re2){
        if(!err){
            var paper = re[0];
            paper.topics = JSON.parse(paper.topics);
            console.log(paper,'this is listpaper');
            return res.json({code:1,text:'返回成功！',data:paper});
        }else{
            return res.json({code:-1,text:'返回失败！',data:{err:err}});
        }
    });
})


router.post('/addpaper',function(req,res,next){
    var paper = req.body.paper;
    console.log(paper);
    //id:paper.id,
    //name:paper.name,
    //teacher:paper.teacher,
    //pubtime:paper.pubtime,
    //topics:paper.topics

    if(!paper){
        return res.json({code:-1,text:'失败，未有paper对象'});
    }

    if(!paper.id){
        return res.json({code:-1,text:'失败，未有paperid'});
    }

    if(paper.id == 0){
        var msg = {
            //id:paper.id,
            template:0,
            data:"",
            senddata:"",
            results:"",
            summits:"",
            teacherid:paper.teacherid,
        };

        Mysql.questionnaire.query('insert into paper set ?',msg,function(err,re){
            if(!err){
                var id = re.insertId;
                Mysql.questionnaire.query('select * from paper'+' where id='+id,function(err,re1){
                    //Mysql.questionnaire.query('select * from paper where id=7;select * from paper where id=6',function(err,re1,re2){
                    if(!err){
                        console.log(re1);
                        return res.json({code:1,text:'创建成功！',data:{rows:re1}});
                    }else{
                        return res.json({code:-1,text:'创建失败！',data:{err:err}});
                    }
                });
            }else{
                return res.json({code:-1,text:'新建失败！',data:{err:err}});
            }
        });
    }else{
        var id = paper.id;
        Mysql.questionnaire.query('select * from paper'+' where id='+id,function(err,re1){
            //Mysql.questionnaire.query('select * from paper where id=7;select * from paper where id=6',function(err,re1,re2){
            if(!err){
                console.log(re1);
                return res.json({code:1,text:'返回成功！',data:{rows:re1}});
            }else{
                return res.json({code:-1,text:'返回失败！',data:{err:err}});
            }
        });
    }


});

router.post('/editpaper',function(req,res,next){
    var paper = req.body.paper;
    console.log(paper);
    console.log(req.body,'this body');
    if(paper == undefined){
        return res.json({code:-1,text:'未传有paper对象'});
    }
    var id = paper.id;
    if(!id){
        console.log('here');
        return res.json({code:-1,text:'未传有paperid'});
    }
    console.log('here1',paper.topics);

    var senddata = [];
    var tmptopics = paper.topics;
    paper.topics = JSON.stringify(paper.topics);

    for(var i=0;i<tmptopics.length;i++){
        delete tmptopics[i]['answer'];
        senddata.push(tmptopics[i]);
    }

    paper.senddata = JSON.stringify(senddata);

    //var msg = {
    //    template:paper.template,
    //    data:paper.data,
    //    senddata:paper.senddata,
    //    results:paper.results,
    //    summits:paper.summits,
    //    teacherid:paper.teacherid,
    //    //createtime:paper.createtime,
    //    name:paper.name
    //};

    console.log(Filtermsg(paper));

    //var updatesql = 'update paper set  teacherid="1" and name="name" and createtime="2016-01-30 23:11:11" and template="5"  where id =11';
    var updatesql = "update paper set "+Filtermsg(paper)+" where id ="+id;
    console.log(updatesql);
    Mysql.questionnaire.query(updatesql,function(err,re){
        if(!err){
            console.log(re);
            return res.json({code:1,text:'编辑返回成功！',data:{re:re}});
        }else{
            return res.json({code:-1,text:'编辑返回失败！',data:{err:err}});
        }
    });
});

router.post('/addtopic',function(req,res,next){
    var paper = req.body.paper;
    console.log(paper,'thi is paper');

    var paperid = paper.id;
    var teacherid = paper.teacherid;

    if(!paperid){
        return res.json({code:-1,text:'未传有paperid'});
    }else if(!teacherid){
        return res.json({code:-1,text:'未传teacherid'});
    }
    var optionnums = req.body.optionnums;
    if(!optionnums){
        optionnums = 4;
    }
    if(optionnums>26){
        return res.json({code:-1,text:'传的值不能大于26个字母的长度'});
    }

    var optchoices = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var substroptchoices = optchoices.substr(0,optionnums);

    var options = [];
    for(var i=0;i<substroptchoices.length;i++){
        var tmpobj = {};
        tmpobj.option = substroptchoices[i];
        tmpobj.content = "";
        tmpobj.checked = false;
        options.push(tmpobj);
    }

    //var options = [
    //    {
    //        option:"A",
    //        content:"",
    //        checked:false
    //    },
    //    {
    //        option:"B",
    //        content:"",
    //        checked:false
    //    },
    //    {
    //        option:"C",
    //        content:"",
    //        checked:false
    //    },
    //    {
    //        option:"D",
    //        content:"",
    //        checked:false
    //    }
    //];

    var optionstr = JSON.stringify(options);

    var msg = {
        //title:"",
        //answer:"",
        //score:"",
        options:optionstr,
        teacherid:1
    };

    //Mysql.questionnaire.query('insert into topic(`title`,`answer`,`score`,`options`,`teacherid`) values("","",1,"",1)',function(err,re){
    Mysql.questionnaire.query('insert into topic set ?',msg,function(err,re){
        if(!err){
            var topicid = re.insertId;
            var msg = {
                paperid:paperid,
                topicid:topicid
            };
            console.log(topicid,'this is topicid');
            Mysql.questionnaire.query('insert into paper_topic set ?',msg,function(err,re1){
                if(!err){
                    console.log(re1);
                    var insertId = re1.insertId;
                    Mysql.questionnaire.query('select * from topic'+' where id="'+topicid+'"',function(err,re2){
                        if(!err){
                            console.log(re2);
                            return res.json({code:1,text:'创建题目成功！',data:{rows:re2}});
                        }else{
                            return res.json({code:-1,text:'创建题目失败！',data:{err:err}});
                        }
                    });
                }else{
                    return res.json({code:-1,text:'创建paper_topic失败！',data:{err:err}});
                }
            });
            //res.json({code:1,msg:'列出成功！',data:{id:id}});
        }else{
            res.json({code:-1,msg:'服务器更新错误！'+err});
        }
    });

});

router.post('/edittopic',function(req,res,next){


    var topic = req.body.topic;
    console.log(topic);
    if(topic == undefined){
        return res.json({code:-1,text:'未传有topic对象'});
    }
    var id = topic.id;
    if(!id){
        console.log('here');
        return res.json({code:-1,text:'未传有topicid'});
    }
    console.log('here1');

    topic.options = JSON.stringify(topic.options);

    console.log(Filtermsg(topic));

    var updatesql = "update topic set "+Filtermsg(topic)+" where id ="+id;
    console.log(updatesql);
    Mysql.questionnaire.query(updatesql,function(err,re){
        if(!err){
            console.log(re);
            return res.json({code:1,text:'编辑返回成功！',data:{re:re}});
        }else{
            return res.json({code:-1,text:'编辑返回失败！',data:{err:err}});
        }
    });
});

router.post('/listcron',function(req,res,next){
    var cron = req.body.cron;
    if(!cron) {
        return res.json({code: -1, text: '未传cron对象！', data: {}});
    }
    var teacherid = cron.teacherid;
    if(!teacherid){
        return res.json({code:-1,text:'未传老师信息！',data:{}});
    }

    Mysql.questionnaire.query('select * from cron where teacherid='+teacherid,function(err,re){
        if(!err) {
            var task = re;
            console.log(task, 'this is startinfo');
            return res.json({code:1,text:'列出成功！',data:re});
        }else{
            return res.json({code:-1,text:'列出cron失败',data:{err:err}});
        }
    });
});

router.post('/editcron',function(req,res,next){
    var dt = req.body.dt;
    if(!dt){
        return res.json({code: -1, text: '未传cron对象！', data: {}});
    }
    console.log(dt);

    var dtmsg = Filtermsg(dt);
    console.log(dtmsg);
    var updatesql = "update cron set "+Filtermsg(dt)+" where id ="+dt.id;
    console.log(updatesql);
    Mysql.questionnaire.query(updatesql,function(err,re){
        if(!err){
            console.log(re);
            return res.json({code:1,text:'编辑成功！',data:re});
        }else{
            return res.json({code:1,text:'编辑失败！',data:{err:err}});
        }
    });
});

router.post('/addcron',function(req,res,next){
    var uuidtmp = uuid.v4();
    console.log(uuidtmp,'this is uuid!');
    var cron = req.body.cron;
    var task = cron.task;

    console.log(task,'-->taskid');

    if(!cron){
        return res.json({code:-1,text:'未传cron对象！',data:{}});
    }else if(!cron.task){
        return res.json({code:-1,text:'未传老师信息！',data:{}});
    }else if(!task.teacherid){
        return res.json({code:-1,text:'未传任务信息！',data:{}});
    }else if(!task.task){
        return res.json({code:-1,text:'未传任务内容！',data:{}});
    }else if(!task.title){
        return res.json({code:-1,text:'未传任务标题！',data:{}});
    }else if(!task.repeat){
        return res.json({code:-1,text:'未传任务类型！',data:{}});
    }else if(task.repeat!=0&&task.repeat!=1){
        return res.json({code:-1,text:'传入type类型错误！',data:{}});
    }

    task.uuid =uuidtmp;

    delete task.id;
    //var msg = {
    //    teacherid:task.teacherid,
    //    uuid:uuidtmp,
    //    task:task.task,
    //    title:task.title,
    //    second:task.second,
    //    type:task.type
    //};
        //
        //id:0,
        //teacherid:teacherid,
        //title:'新建定时任务',
        //task:'（定时规则）',
        //second:1,
        //type:0

    console.log(task,'-->msgmessage');

    Mysql.questionnaire.query('insert into cron set ?',task,function(err,re){
        if(!err){
            console.log(re);
            var id = re.insertId;

            Mysql.questionnaire.query('select * from cron'+' where id='+id,function(err,re1){
                if(!err){
                    console.log(re1);
                    return res.json({code:1,text:'创建成功！',data:re1[0]});
                }else{
                    return res.json({code:-1,text:'创建失败！',data:{err:err}});
                }
            });
        }else{
            return res.json({code:-1,text:'新建cron失败',data:{err:err}});
        }
    });
});

router.post('/startcron',function(req,res,next){
    var task = req.body.task;
    if(!task){
        return res.json({code:-1,text:'未传task对象',data:{}});
    }
    var teacherid = task.teacherid;
    if(!teacherid){
        return res.json({code:-1,text:'未传teacherid对象',data:{}});
    }
    console.log(task);
    var cronid = task.id;
    var pushtpl = task.pushtpl;
    if(!cronid){
        return res.json({code:-1,text:'未传cronid',data:{}});
    }else if(!pushtpl||pushtpl == 0){
        return res.json({code:-1,text:'传送模版pushtpl出错！',data:{}});
    }
    var sendto = task.sendto;
    console.log(sendto,'this is sendto..........');
    if(!sendto){
        return res.json({code:-1,text:'未传推给班级ID',data:{}});
    }
    Mysql.questionnaire.query('select * from cron'+' where id='+cronid,function(err,re){
        if(!err){
            var task = re[0];
            console.log(task,'this is startinfo');

            //如果状态已经启动
            if(task.status == 1){
                //清除任务
                if(Schedules[task.uuid]){
                    Schedules[task.uuid].trigger.clear();
                }
            }

            console.log(Schedules);
            Mysql.questionnaire.query('update cron set status=1 where id='+cronid,function(err,re1){
                if(!err){
                    var schedule;

                    if(task.hassecond == 1){
                        console.log('task.task.true');
                        schedule = later.parse.cron(task.task,true);
                    }else{
                        console.log('task.task.true else');
                        schedule = later.parse.cron(task.task);
                    }

                    var trigger;
                    if(task.repeat == 0){
                        console.log('task.type.0');
                        trigger = later.setInterval(function(){
                            console.log(new Date());

                            function pushmsg(to,msg){
                                async.each(to, function(item, callback) {
                                    Mysql.questionnaire.query('select * from paper where id='+pushtpl,function(err,re2){
                                        if(!err){
                                            var task = re2[0];
                                            console.log(task,to,item,sendto,cronid,'this is re2 task-----------------------------');
                                            var msg = {
                                                paperid:pushtpl,
                                                studentid:item,
                                                teacherid:teacherid,
                                                topics:task.senddata,
                                                name:task.name,
                                                topicnums:task.topicnums,
                                                classid:sendto,
                                                cronid:cronid
                                            };
                                            Mysql.questionnaire.query('insert into usertask set ?',msg,function(err,re3){
                                                if(!err){
                                                    var id = re3.insertId;
                                                    console.log(id,item,'this is id toi----------------------------');
                                                    var msg = {
                                                        type:4,
                                                        title:'<a href="/_pages/usertask/usertask.html?usertaskid='+id+'">调查问卷：'+task.name+'</a>',
                                                        authorid:teacherid,
                                                        targetid:item
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
                            Mysql.questionnaire.query('select uid from project.class_user where classid='+sendto,function(err,re){
                                if(!err){
                                    var mapre = re.map(function(i){return i.uid});
                                    console.log(mapre,'this is classresult!');
                                    pushmsg(mapre,'heheda lalala');
                                }else{
                                    console.log(err);
                                }
                            });
                        },schedule);
                    }else if(task.repeat == 1){
                        console.log('task.type.1');
                        trigger = later.setTimeout(function(){
                            console.log(new Date());

                            function pushmsg(to,msg){
                                async.each(to, function(item, callback) {
                                    Mysql.questionnaire.query('select * from paper where id='+pushtpl,function(err,re2){
                                        if(!err){
                                            var task = re2[0];
                                            console.log(task,to,item,sendto,cronid,'this is re2 task-----------------------------');
                                            var msg = {
                                                paperid:pushtpl,
                                                studentid:item,
                                                teacherid:teacherid,
                                                topics:task.senddata,
                                                name:task.name,
                                                topicnums:task.topicnums,
                                                classid:sendto,
                                                cronid:cronid
                                            };
                                            Mysql.questionnaire.query('insert into usertask set ?',msg,function(err,re3){
                                                if(!err){
                                                    var id = re3.insertId;
                                                    console.log(id,item,'this is id toi----------------------------');
                                                    var msg = {
                                                        type:4,
                                                        title:'<a href="/_pages/usertask/usertask.html?usertaskid='+id+'">调查问卷</a>',
                                                        authorid:teacherid,
                                                        targetid:item
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
                            Mysql.questionnaire.query('select uid from project.class_user where classid='+sendto,function(err,re){
                                if(!err){
                                    var mapre = re.map(function(i){return i.uid});
                                    console.log(mapre,'this is classresult!');
                                    pushmsg(mapre,'heheda lalala');
                                }else{
                                    console.log(err);
                                }
                            });

                        },schedule);
                    }

                    Schedules[task.uuid]={
                        task:task,
                        schedule:schedule,
                        trigger:trigger
                    };

                    console.log(Schedules[task.uuid],'this trigger?!!-');

                    task.status = 1;
                    return res.json({code:1,text:'启动任务成功！',data:task});
                }else{
                    return res.json({code:-1,text:'设置cron状态失败！',data:{err:err}});
                }
            });
        }else{
            return res.json({code:-1,text:'启动任务失败！',data:{err:err}});
        }
    });
});



router.post('/stopcron',function(req,res,next){
    var teacherid;
    var task = req.body.task;
    var cronid = task.id;
    console.log(task,'this is task');

    if(!Schedules[task.uuid]){
        Mysql.questionnaire.query('select * from cron'+' where id='+cronid,function(err,re){
            if(!err){

                Mysql.questionnaire.query('update cron set status=0 where id='+cronid,function(err,re1){
                    if(!err){
                        var task = re[0];
                        if( Schedules[task.uuid]){
                            Schedules[task.uuid].trigger.clear();
                            delete Schedules[task.uuid];
                            console.log(Schedules);
                        }
                        task.status = 0;
                        return res.json({code:-1,text:'停止任务失败！已经停止',data:task});
                    }else{
                        return res.json({code:-1,text:'停止任务，更新status失败！',data:{err:err}});
                    }
                });
            }else{
                return res.json({code:-1,text:'停止任务失败！',data:{err:err}});
            }
        });
    }else{
        Mysql.questionnaire.query('select * from cron'+' where id='+cronid,function(err,re){
            if(!err){

                Mysql.questionnaire.query('update cron set status=0 where id='+cronid,function(err,re1){
                    if(!err){
                        var task = re[0];
                        if( Schedules[task.uuid]){
                            Schedules[task.uuid].trigger.clear();
                            delete Schedules[task.uuid];
                            console.log(Schedules);
                        }
                        task.status = 0;
                        return res.json({code:1,text:'停止任务成功！',data:task});
                    }else{
                        return res.json({code:-1,text:'停止任务，更新status失败！',data:{err:err}});
                    }
                });
            }else{
                return res.json({code:-1,text:'停止任务失败！',data:{err:err}});
            }
        });
    }

});


router.post('/rmcron',function(req,res,next){
    var dt = req.body.dt;
    if(!dt){
        return res.json({code:-1,text:'未传dt对象',data:{}});
    }else if(!dt.id){
        return res.json({code:-1,text:'未传任务id',data:{}});
    }
    Mysql.questionnaire.query('select * from cron'+' where id='+dt.id,function(err,re){
        if(!err){
            var task = re[0];
            if(Schedules[task.uuid]){
                Schedules[task.uuid].trigger.clear();
                delete Schedules[task.uuid];
            }
            console.log(Schedules);
            Mysql.questionnaire.query('delete from cron where id='+dt.id,function(err,re1){
                if(!err){
                    console.log('删除成功！'+re1);
                    return res.json({code:1,text:'删除任务成功！',data:{}});
                }else{
                    return res.json({code:-1,text:'删除cron信息失败！',data:{err:err}});
                }
            });
        }else{
            return res.json({code:-1,text:'删除cron时，查询cron信息失败！',data:{err:err}});
        }
    });
});

router.post('/listusertask',function(req,res,next){
    var usertask = req.body.usertask;
    if(!usertask) {
        return res.json({code: -1, text: '未传usertask对象！', data: {}});
    }
    var usertaskid = usertask.usertaskid;
    if(!usertaskid){
        return res.json({code:-1,text:'未传usertaskid！',data:{}});
    }

    Mysql.questionnaire.query('select * from usertask where id='+usertaskid,function(err,re){
        if(!err) {
            var task = re[0];
            task.createtime = moment(task.createtime).format('YYYY-MM-DD HH:mm:ss');
            task.topics = JSON.parse(task.topics);
            console.log(task, 'this is usertaskinfo');
            return res.json({code:1,text:'列出成功！',data:task});
        }else{
            return res.json({code:-1,text:'列出cron失败',data:{err:err}});
        }
    });
});

router.post('/listusertask_beta',function(req,res,next){
    var usertask = req.body.usertask;
    if(!usertask) {
        return res.json({code: -1, text: '未传usertask对象！', data: {}});
    }
    //var usertaskid = usertask.usertaskid;
    //if(!usertaskid){
    //    return res.json({code:-1,text:'未传usertaskid！',data:{}});
    //}

    var selectstr = 'select * from usertask'+where(usertask,'createtime');

    console.log(selectstr);
    Mysql.questionnaire.query(selectstr,function(err,re){
        if(!err) {
            var task = re;
            for(var i=0;i<task.length;i++){
                task[i].createtime = moment(task[i].createtime).format('YYYY-MM-DD HH:mm:ss');
                task[i].commit = JSON.parse(task[i].commit);
                task[i].topics = JSON.parse(task[i].topics);
            }
            //task.topics = JSON.parse(task.topics);
            //console.log(task, 'this is usertaskinfo');
            return res.json({code:1,text:'列出成功！',data:task});
        }else{
            return res.json({code:-1,text:'列出cron失败',data:{err:err}});
        }
    });
});

router.post('/editusertask',function(req,res,next){
    var usertask = req.body.usertask;
    if(!usertask) {
        return res.json({code: -1, text: '未传usertask对象！', data: {}});
    }
    var usertaskid = usertask.id;
    if(!usertaskid){
        return res.json({code:-1,text:'未传usertaskid！',data:{}});
    }
    var commit = usertask.commit;
    if(!commit){
        return res.json({code:-1,text:'未传commit！',data:{}});
    }
    usertask.commit = JSON.stringify(usertask.commit);

    var updatesql = "update usertask set "+Filtermsg(usertask)+" where id ="+usertaskid;
    console.log(updatesql);
    Mysql.questionnaire.query(updatesql,function(err,re){
        if(!err){
            console.log(re);
            return res.json({code:1,text:'编辑返回成功！',data:{re:re}});
        }else{
            return res.json({code:-1,text:'编辑返回失败！',data:{err:err}});
        }
    });
});

router.get('/exportexcel',function(req,res,next){
    console.log('i am here');
    //var excel = req.body.excel;
    //if(!excel){
    //    return res.json({code:-1,text:'获取excel对象失败！',data:{}});
    //}
    //var starttime = excel.starttime;
    //var endtime = excel.endtime;
    //if(!starttime){
    //    return res.json({code:-1,text:'获取starttime对象失败！',data:{}});
    //}else if(!endtime){
    //    return res.json({code:-1,text:'获取endtime对象失败！',data:{}});
    //}
    //var paper = excel.paper;
    //if(!paper){
    //    return res.json({code:-1,text:'获取paper对象失败！',data:{}});
    //}

    //var conf = {};
    //conf.cols = [
    //    {
    //        caption:'string',
    //        captionStyleIndex:1,
    //        type:'string',
    //        width:20
    //    },{
    //        caption:'number',
    //        type:'number',
    //        width:30
    //    }
    //];
    //conf.rows = [
    //    ['pi',3],
    //    ["e", 2.7182],
    //    ["M&M<>'", 1.61803]
    //];


    var conf ={};
    // uncomment it for style example
    // conf.stylesXmlFile = "styles.xml";
    conf.cols = [{
        caption:'string',
        captionStyleIndex: 1,
        type:'string',
        beforeCellWrite:function(row, cellData){
            return cellData.toUpperCase();
        }
        , width:200
    },{
        caption:'date',
        type:'date',
        beforeCellWrite:function(){
            var originDate = new Date(Date.UTC(1899,11,30));
            return function(row, cellData, eOpt){
                // uncomment it for style example
                // if (eOpt.rowNum%2){
                // eOpt.styleIndex = 1;
                // }
                // else{
                // eOpt.styleIndex = 2;
                // }
                if (cellData === null){
                    eOpt.cellType = 'string';
                    return 'N/A';
                } else
                    return (cellData - originDate) / (24 * 60 * 60 * 1000);
            }
        }()
        , width:20.85
    },{
        caption:'bool',
        type:'bool'
    },{
        caption:'number',
        type:'number',
        width:30
    }];
    conf.rows = [
        ['pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14159],
        ["e", new Date(2012, 4, 1), false, 2.7182],
        ["M&M<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.61803],
        ["null date", null, true, 1.414]
    ];
    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    res.end(result, 'binary');
});

router.post('/exportexcel',function(req,res,next){
    console.log('i am here');
    var excel = req.body.excel;
    //console.log(excel,'is there--------------');
    //if(!excel){
    //    return res.json({code:-1,text:'获取excel对象失败！',data:{}});
    //}
    var starttime = excel.starttime;
    var endtime = excel.endtime;
    //if(!starttime){
    //    return res.json({code:-1,text:'获取starttime对象失败！',data:{}});
    //}else if(!endtime){
    //    return res.json({code:-1,text:'获取endtime对象失败！',data:{}});
    //}
    var paper = excel.paper;
    console.log(paper,'this is paper!!!-----------');
    var name = paper.name;
    var total = paper.total;
    //if(!paper){
    //    return res.json({code:-1,text:'获取paper对象失败！',data:{}});
    //}

    var conf = {};

    //var logestopt = 0;
    //for(var h=0;h<paper.topics.length-1;h++){
    //    if(paper.topics[h].options&&paper.topics[h].options.length>logestopt){
    //        logestopt = paper.topics[h].options.length;
    //    }
    //}


    var finalarr = [];
    for(var i=0;i<paper.topics.length;i++){
        console.log('here i am!');
        var tmparr = [];
        var topicID = paper.topics[i].id;
        var title = paper.topics[i].title;
        var chosenums = paper.topics[i].chosenums;

        tmparr.push(topicID,title,chosenums);
        //var optarr = [];
        for(var j=0;j<paper.topics[i].options.length;j++){
            console.log('here i am1!');
            var optionx = paper.topics[i].options[j].option;
            var content = paper.topics[i].options[j].content;
            var pcount = paper.topics[i][paper.topics[i].options[j]['option']];
            console.log('here i am2!');
            var percentage = 0;
            if(chosenums == 0){
                percentage = 0;
            }else{
                percentage = (pcount/chosenums*100).toFixed(2)+'%';
            }
            tmparr.push(optionx,content,pcount,percentage);
        }
        finalarr.push(tmparr);
    }
    console.log(finalarr,'this is final arr');

    var longest = 0;
    for(var m=0;m<finalarr.length;m++){
        if(finalarr[m].length>longest){
            longest = finalarr[m].length;
        }
    }
    console.log(longest,'longest!!!');

    //longest = longest-3;
    //if(longest-3<0){
    //    longest = 0;
    //}
    var optionn = (longest-3)/4;
    console.log(optionn,'this is optionn');

    var toppp = ["topicID",'标题','总提交'];
    for(var i=0;i<optionn;i++){
        var optn = i+1;
        toppp.push('option'+optn,'内容','选择人数','选择占比');
    }
    console.log(toppp,'this is toppp');

    //var toppp = ["topicID",'标题','总提交','option1','内容','选择人数','选择占比'];

    conf.cols = [
        {
            caption:'strings',
            captionStyleIndex:1,
            type:'string',
            width:30
        },{
            caption:'',
            type:'string',
            width:30
        },{
            caption:'',
            type:'string',
            width:30
        }
    ];

    for(var n=0;n<longest-3;n++){
        conf.cols.push({
            caption:'',
            type:'string',
            width:30
        });
    }

    console.log(conf.cols,'conf----cols!!!---');

    function fillarr(arr,num){
        console.log(num,arr.length);
        for(var i=arr.length;i<num;i++){
            arr.push(null);
        }
        return arr;
    }


    //var abc = fillarr(['试卷名',''+name],longest);
    //console.log(abc,'this is abc');


    conf.rows = [];
    conf.rows.push(
        fillarr(['试卷名',''+name],longest),
        fillarr(["总推", ''+total],longest),
        fillarr(["总提交", ''+paper.totalchose],longest),
        fillarr(["开始", ''+starttime],longest),
        fillarr(["结束", ''+endtime],longest),
        fillarr(["教师", ''+paper.teacherid],longest),
        toppp
    );
        //['试卷名',paper.name,null,null,null,null,null,null],
        //["总推", paper.total,null,null,null,null,null,null],
        //["提交", paper.submit,null,null,null,null,null,null],
        //["开始", starttime,null,null,null,null,null,null],
        //["结束", endtime,null,null,null,null,null,null]
        //["topicID",'数目文字','总提交','option1','选择人数','选择占比']
        //[paper.topics[0].id,paper.topics[0].title,paper.topics[0].chosenums,paper.topics[0].options[0].content]

        //["topicID",'标题','总提交','option1','内容','选择人数','选择占比']

    for(var i=0;i<finalarr.length;i++){
        conf.rows.push(fillarr(finalarr[i],longest));
    }

    console.log(conf,'this is conffffing');

    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    res.end(result, 'binary');
});

module.exports = router;

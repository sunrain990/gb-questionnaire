var express = require('express');
var router = express.Router();
var logger = require('../config/log/log4-js');
var Mysql = require('../config/db/my');
var moment = require('moment');
var later = require('later');
var uuid = require('node-uuid');

var Schedules = {
};

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







/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.json({ title: 'Express' });
});

router.post('/addpaper',function(req,res,next){
    var paper = req.body.paper;
    console.log(paper);
    //id:paper.id,
    //name:paper.name,
    //teacher:paper.teacher,
    //pubtime:paper.pubtime,
    //topics:paper.topics

    if(!paper.id){
        return res.json({code:1,text:'失败，未有paperid'});
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
    console.log('here1');

    paper.topics = JSON.stringify(paper.topics);



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

    var options = [
        {
            option:"A",
            content:"",
            checked:false
        },
        {
            option:"B",
            content:"",
            checked:false
        },
        {
            option:"C",
            content:"",
            checked:false
        },
        {
            option:"D",
            content:"",
            checked:false
        }
    ];

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

                    //Schedules["'"+uuidtmp+"'"]={
                    //    teacherid:teacherid,
                    //    taskid:id
                    //};

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
    var teacherid;
    var task = req.body.task;
    console.log(task);
    var cronid = task.id;
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
                        },schedule);
                    }else if(task.repeat == 1){
                        console.log('task.type.1');
                        trigger = later.setTimeout(function(){
                            console.log(new Date());
                        },schedule);
                    }

                    Schedules[task.uuid]={
                        task:task,
                        schedule:schedule,
                        trigger:trigger
                    };

                    return res.json({code:1,text:'启动任务成功！',data:{rows:re}});
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
    var cronid = 8;
    var task = req.body.task;
    console.log(task,'this is task');

    if(!Schedules[task.uuid]){
        return res.json({code:-1,text:'停止任务失败！已经停止',data:{}});
    }
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
                    return res.json({code:1,text:'停止任务成功！',data:{status:0}});
                }else{
                    return res.json({code:-1,text:'停止任务，更新status失败！',data:{err:err}});
                }
            });
        }else{
            return res.json({code:-1,text:'停止任务失败！',data:{err:err}});
        }
    });
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
            Mysql.questionnaire.query('delete * from cron where id='+dt.id,function(err,re1){
                if(!err){
                    console.log('删除成功！'+re1);
                    return res.json({code:1,text:'停止任务成功！',data:{}});
                }else{
                    return res.json({code:-1,text:'删除cron信息失败！',data:{err:err}});
                }
            });
        }else{
            return res.json({code:-1,text:'删除cron时，查询cron信息失败！',data:{err:err}});
        }
    });
});

module.exports = router;

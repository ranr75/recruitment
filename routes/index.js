var express = require('express');
var router = express.Router();
const {UserModel,ChatModel} = require('../db/models')
const md5 = require('blueimp-md5');
const { set } = require('mongoose');

/* GET home page. */
router.get('/', function(req, res, next) {//注册路由，处理get类型请求，一个参数为path,第二个参数回调函数
  res.render('index', { title: 'Express' });
});

//注册一个注册路由
router.post('/register',function(req,res){
    //1.获取请求中的参数
    const  {username,password,type} =req.body;
    //2.处理
    //判断用户名是否存在
    UserModel.findOne({username},function(err,user){
      if(user != null){
        res.send({
          code:1,
          msg:'用户名已被占用'
        })
      }
      else{
         new UserModel({username,password: md5(password),type}).save(function(err,user){
           //cookie
           res.cookie('userid',user._id,{maxAge:1000*60*30})
           //返回浏览器
           const data ={username,type,id:user._id}
           res.send({
             code:0,
             data
           })
         })
      }
    })
})
const filter = {password:0,__v:0}
//注册一个登录路由
router.post('/login',function(req,res){
  const {username,password} = req.body;
  UserModel.findOne({username,password:md5(password)},filter,function(err,user){
    if(user){
      //登录成功
      res.cookie('userid',user._id,{maxAge:1000*60*5})
      res.send({code:0,data:user})
    }
    else{
      //登录失败
      res.send({code:1,msg:'用户名或密码不正确'})
    }
  })
})


//注册更新信息的路由
router.post('/update',function(req,res){
  const user = req.body;
  //发送过来的数据user中没有id信息（只有post,info,header等信息）
  //所以从cookie中获取(cookie是存在浏览器端的！)
  const userid = req.cookies.userid
  if(!userid){
     res.send({
      code:1,
      msg:'请先登录'
    })
  }
  else{
    UserModel.findByIdAndUpdate({_id:userid},user,function(error,oldUser){
      if(!oldUser){
        //通知浏览器删除该cookie
        res.clearCookie('userid')
        res.send({code:1,msg:'请先登录'})
      }
      else{
        const {_id,username,type} = oldUser
        const data = Object.assign({_id,username,type},user)
        res.send({code:0,data})
      }
    })
  }

})

router.get('/user',function(req,res){
  const userid = req.cookies.userid
  if(!userid){
    res.send({
     code:1,
     msg:'请先登录'
   })
 }
 else{
   UserModel.findOne({_id:userid},filter,function(error,user){
     res.send({code:0,data:user})
   })
 }
})

// 获取用户列表(根据类型)
router.get('/userlist', function (req, res) {
  const {type} = req.query
  UserModel.find({type}, filter, function (error, users) {
    res.send({code: 0, data: users})
  })
})




/*
获取当前用户所有相关聊天信息列表
 */
router.get('/msglist', function (req, res) {
  // 获取cookie中的userid
  const userid = req.cookies.userid
  // 查询得到所有user文档数组
  UserModel.find(function (err, userDocs) {
    // 用对象存储所有user信息: key为user的_id, val为name和header组成的user对象
    /*const users = {} // 对象容器
    userDocs.forEach(doc => {
      users[doc._id] = {username: doc.username, header: doc.header}
    })*/
    const users = userDocs.reduce((users, user) => {
      users[user._id] = {username: user.username, header: user.header}
      return users
    } , {})
    /*
    查询userid相关的所有聊天信息
     参数1: 查询条件
     参数2: 过滤条件
     参数3: 回调函数
    */
   const involve_user = new Set();
    ChatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, function (err, chatMsgs) {
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据
      res.send({code: 0, data: {users, chatMsgs}})
    })
  })
})

/*
修改指定消息为已读
 */
router.post('/readmsg', function (req, res) {
  // 得到请求中的from和to
  const from = req.body.from
  const to = req.cookies.userid
  /*
  更新数据库中的chat数据
  参数1: 查询条件
  参数2: 更新为指定的数据对象
  参数3: 是否1次更新多条, 默认只更新一条
  参数4: 更新完成的回调函数
   */
  ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
    console.log('/readmsg', doc)
    res.send({code: 0, data: doc.nModified}) // 更新的数量,使用了一个自带的函数
  })
})



module.exports = router;

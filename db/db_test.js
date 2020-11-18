const md5 = require('blueimp-md5')  //加密函数

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/gzhipin_test') //mongodb是协议名称（类似于http)，localhost：port是url，gzhipin_test是数据库名称。
const conn = mongoose.connection  //获取连接对象
conn.on('connected',function(){
    console.log('数据库连接成功')
})

//定义文档（mongodb里的概念，就是一个对象。还有一个集合的概念，就是对象的数组）结构
const userSchema =mongoose.Schema({
    //定义文档结构
    username:{type:String,required:true},
    password:{type:String,required:true},
    type:{type:String,required:true},
})

//定义Model,即mongodb里的集合概念,定义的是构造函数！！！
const UserModel = mongoose.model('user',userSchema)  //定义一个集合，名字为user，UserModel指向它。文档结构为userSchema

//crud
//1.增
function testSave(){
    const userModel = new UserModel({username:'Tom',password:md5('123'),type:'qiuzhizhe'})
    userModel.save(function(error,doc){
        console.log(error,doc)
    })
}
testSave();
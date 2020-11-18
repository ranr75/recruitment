//定义model,以便于后面操作集合。


const md5 = require('blueimp-md5')  //加密函数

const mongoose = require('mongoose') //引入mongoose
mongoose.connect('mongodb://localhost:27017/gzhipin') //连接数据库，mongodb是协议名称（类似于http)，localhost：port是url，gzhipin_test是数据库名称。
const conn = mongoose.connection  //获取连接对象
conn.on('connected',function(){
    console.log('数据库连接成功')
})

//定义文档（mongodb里的概念，就是一个对象。还有一个集合的概念，就是对象的数组）结构
const userSchema = mongoose.Schema({
    username: {type: String, required: true}, // 用户名
    password: {type: String, required: true}, // 密码
    type: {type: String, required: true}, // 用户类型: dashen/laoban
    header: {type: String}, // 头像名称
    post: {type: String}, // 职位
    info: {type: String}, // 个人或职位简介
    company: {type: String}, // 公司名称
    salary: {type: String} // 工资
    })
//定义Model,即mongodb里的集合概念,定义的是构造函数！！！
const UserModel = mongoose.model('user',userSchema)  //定义一个集合，名字为user，UserModel指向它。文档结构为userSchema

//向外暴露Model
exports.UserModel =UserModel



// 定义 chats 集合的文档结构
const chatSchema = mongoose.Schema({
    from: {type: String, required: true}, // 发送用户的 id
    to: {type: String, required: true}, // 接收用户的 id
    chat_id: {type: String, required: true}, // from 和 to 组成的字符串
    content: {type: String, required: true}, // 内容
    read: {type:Boolean, default: false}, // 标识是否已读
    create_time: {type: Number} // 创建时间
    })
    // 定义能操作 chats 集合数据的 Model
    const ChatModel = mongoose.model('chat', chatSchema)
    // 向外暴露 Model
    exports.ChatModel = ChatModel
var _ = require('underscore-node');
const {ChatModel} =require('../db/models')
module.exports = function(server){
    const io =require('socket.io')(server,{ origins: '*:*'})
    io.on('connection',function(socket){
        console.log('新连接客户端')
        socket.on('setname',function(userid){
            socket.name = userid              //这个setname步骤必须要！，因为最开始把socket.name赋值放到sendmsg里面，那么如果客户端不发sendmsg，socket.name就不会设置，客户端就接受不到信息
        })
        socket.on('sendMsg',function({from,to,content}){
            
            const chat_id = [from,to].sort().join('_')
            const create_time = Date.now()
            new ChatModel({from,to,content,chat_id,create_time}).save(function(error,chatMsg){
                if(toSocket = _.findWhere(io.sockets.sockets,{name:from})){
                    toSocket.emit('receiveMsg',chatMsg);
                }
                if(toSocket = _.findWhere(io.sockets.sockets,{name:to})){
                    toSocket.emit('receiveMsg',chatMsg);
                }
            })
        })
    })
}
const express = require('express')
const app = require('express')();
const URL = require('url');
const server = require('http').Server(app);
const cookieParser = require('cookie-parser')
const io = require('socket.io')(server,{
    cors: {
        origin: "http://localhost:3000", // client address 
    }});
const { v4: uuidV4 } = require('uuid');
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/:room', (req, res) => {
    if(req.cookies.name){
        res.clearCookie('name');
        res.render('room', { roomId: req.params.room })
        // console.log(req.cookies)
    }
    else{
        res.redirect('/')
    }
    
    
  })

app.get('/',(req,res)=>{
    let to_room = '';
    if(req.cookies.room){
        to_room = req.cookies.room;
        res.clearCookie('room')
    }
    res.render('lobby',{value:to_room});
})
app.post('/create',(req,res)=>{
    res.cookie('room',uuidV4())
    res.redirect('/')
})

app.post('/join',(req,res)=>{
    const room = req.body.room;
    const name = req.body.name;
    res.cookie('name',name)
    res.redirect(`/${room}`)
})

let members = []
let disconnected_members = []

io.on('connection', socket => {

    socket.on('join-room', (roomId, userId, name) => {
        socket.join(roomId);
        members.push({name:name,room:roomId,userId:userId});
        // console.log(members);
        room_members_list = []
        disconnected_members_list = []
        for (let i = 0; i < disconnected_members.length; i++) {if(disconnected_members[i].room == roomId){disconnected_members_list.push(members[i].userId)}}
        userId_list = []
        for (let i = 0; i < members.length; i++) {if(members[i].room == roomId){room_members_list.push(members[i].name)}}
        for (let i = 0; i < members.length; i++) {if(members[i].room == roomId){userId_list.push(members[i].userId)}}
        // console.log(room_members_list);

        io.to(roomId).emit('new-user-connected',room_members_list, name,userId_list,disconnected_members_list);  
        socket.to(roomId).broadcast.emit('user-connected', userId)
        
    
    socket.on('disconnect', () => {
        console.log("user "+name + "having user id "+userId+ " from room "+roomId+" disconnected");
        // disconnected_members.push({name:name,room:roomId,userId:userId});
        // console.log("disconnected members: ",disconnected_members);
        // for (let i = 0; i < disconnected_members.length; i++) {if(disconnected_members[i].room == roomId){disconnected_members_list.push(members[i].userId)}}
        for (let i = 0; i< members.length;i++){
            if(members[i].userId==userId){
                console.log("members:",members)
                members.splice(i,1);
                console.log("members:",members)
                break
            }
        }
        for (let i = 0; i< room_members_list.length;i++){
            if(userId_list[i]==userId){
                userId_list.splice(i,1);
                room_members_list.splice(i,1);
                console.log("room_members",room_members_list)
                break
            }
        }
        // room_members_list = []
        // userId_list = []
        // for (let i = 0; i < members.length; i++) {if(members[i].room == roomId){room_members_list.push(members[i].name)}}
        // for (let i = 0; i < members.length; i++) {if(members[i].room == roomId){userId_list.push(members[i].userId)}}
        // console.log("useridlist: ",userId_list)
        socket.to(roomId).emit('user-disconnected', userId, name);
        
      });
    socket.on('chat message', (msg,roomId) => {
        console.log('message: ' + msg);
        io.to(roomId).emit('chat message', msg);
    
      });
    })
   
  })

  server.listen(3000)
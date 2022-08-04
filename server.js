
const express = require('express')
const app = require('express')();
const URL = require('url');
const server = require('http').Server(app);
const io = require('socket.io')(server,{
    cors: {
        origin: "http://localhost:3000", // client address 
    }});
const { v4: uuidV4 } = require('uuid');
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
  })

app.get('/',(req,res,send)=>{
    res.sendFile(__dirname+'/lobby.html');
})
app.post('/create',(req,res)=>{
    (res.redirect(`/${uuidV4()}`))
})

app.post('/join',(req,res)=>{
    const room = req.body.room;
    res.redirect(`/${room}`)
})
// let n_members = 0
// let members = []
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, name,members) => {
        // n_members += 1;
        members.push(name);
        console.log(members)
        io.emit('new-user-connected',members, name)
        // socket.emit('joined-room',name);
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)
  
    socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('user-disconnected', userId)
        // n_members -= 1
      });
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    
      });
    })
  })

  server.listen(3000)
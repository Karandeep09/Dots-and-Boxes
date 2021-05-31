const PORT = process.env.PORT || 3000;
const { urlencoded } = require("express");
const express = require("express");
const app = express();
const http = require("http").Server(app);

const server = app.listen(PORT, ()=>{
    console.log(`Running on PORT : ${PORT}`);
});

const io = require('socket.io')(server);

app.use(express.static(__dirname+'/public'));

app.get('/page',(req,res)=>{
    //console.log(req.query);
    res.sendFile(__dirname+"/public/page.html");
});

var clientInfo = {};
var active = {};

app.get('/online',(req,res)=>{
  res.json({Online :Object.keys(clientInfo).length});
});

function getuser(room)
{
    var user = {};
    Object.keys(clientInfo).forEach((data)=>{
        //console.log(data);
          if(clientInfo[data].room == room){
          user[data] = clientInfo[data];
          user[data].id = data;
          }
    });
    return user;
}
io.on("connection", function(socket) {

    socket.on('joinRoom', function(req) {
        if(active[req.room] !== 1){
        clientInfo[socket.id] = req;
        socket.join(req.room);
        //console.log(req);
        //broadcast new user joined room
        io.in(req.room).emit("display", 
             getuser(req.room)
          );
        }
        else{
            req.room = '000000000';
            clientInfo[socket.id] = req;
            socket.join(req.room);
            socket.emit("msg","Can't join, game is already running");
        }
      });
      socket.on("disconnect", function() {
        var userdata = clientInfo[socket.id];
        
        if (userdata !== undefined && userdata.room !== undefined) {
          // delete user data-
          delete clientInfo[socket.id];
          socket.leave(userdata.room); 
          io.in(userdata.room).emit("left",socket.id);
          io.in(userdata.room).emit("display", 
              getuser(userdata.room)
          );
        } 
        obj = getuser(userdata.room);
        if(obj && Object.keys(obj).length === 0 && obj.constructor === Object)
        {
          delete active[userdata.room]; 
        }
      });
    socket.on("start",(room)=>{
        //io.in(room).emit("start",getuser(room));
        io.in(room).emit("start",{});
        active[room] = 1;
    });
    socket.on('play',(player)=>{
      io.in(player.room).emit("play",player.id);
      //console.log(player.name);
    });
});


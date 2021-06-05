var socket = io();
console.log(socket);
// listen for server connection
// get query params from url
var name = getQueryVariable("name") || 'Anonymous';
var room = getQueryVariable("room") || 'No Room Selected';
// fires when client successfully conencts to the server
$("#rno").html("Room Code: "+room);
var message = "Hi, I am playing Dots and Boxes"+"\r\n"+"https://dotboxes.herokuapp.com"+"\r\n"+"Join using "+`Room Code: ${room}`
message = window.encodeURIComponent(message);
$("#wapp").attr("href",`whatsapp://send?text=${message}`);
var sid;
//var users;
var admin = 0;
var start = 0;
//var joined;
var Game;
socket.on("connect", function() {
  console.log("Connected to Socket I/O Server!");
  console.log(name + " wants to join  " + room);
  // to join a specific room
  sid = socket.id;
  //console.log(sid);
  socket.emit('joinRoom', {
    name: name,
    room: room
  });
});


socket.on("start",(user)=>{
  start = 1;
  //alert("Hi");
  //users = user
  //console.log(users);
});

socket.on("msg",(msg)=>{
  alert(msg);
});


function game(players)
{
  this.circular = {};
  this.prev = '';
  this.root = '';
  this.next = '';
  this.last = '';
  this.curr = '';
  Object.keys(players).forEach((pl)=>{
      players[pl].score = 0;
      this.circular[pl] = players[pl];
        if(this.prev == '')
        {
          this.root = players[pl].id;
        }
        else{
          this.circular[this.prev].next = players[pl].id;
          this.circular[pl].prev = players[this.prev].id;
        }
        this.prev = pl;
  });
  this.circular[this.prev].next = players[this.root].id;
  this.circular[this.root].prev = players[this.prev].id;
  console.log(this.circular);

  // this.getNext = function(){
  //   return this.circular[sid].next;
  // }
  this.next = function(id){
    var next_id = Game.circular[id].next;
    Game.curr = next_id;
    socket.emit('play',Game.circular[next_id]);
  }
  this.delete = function(id){
      var prev = this.circular[id].prev;
      var next = this.circular[id].next;
      this.circular[prev].next = next;
      this.circular[next].prev = prev;
      
      if(this.root == id)
      this.root = this.circular[id].next;
      if(sid == this.root && id == this.curr){ //alternate turn if player left
        console.log("Left", id);   
        this.next(id);
      }
      delete this.circular[id];
      this.inactive(id);
      console.log("Deleted",this.circular);
  }
  this.active = function(id)
  {
    $("#"+id).css("border","2px solid green");
  }
  this.inactive = function(id)
  {
    $("#"+id).css("border","none");
  }
}

$(document).ready(function(){
  $("#btn").click(function(){
     if(Object.keys(Game.circular).length != 1){
     start = 1;
     $("#btn").css("display","none");
     socket.emit('start',room);
     socket.emit('play',Game.circular[sid]);
     }
     else{
       alert("Atleast 2 players required");
     }
  });
  $("#btn1").click(function(){
      Game.next(sid);
  });
});

socket.on('play',(id)=>{
  $("#canvas").css("display","block");
  // if(sid == id)
  // {
  //   $("#btn1").css("display","inline");
  // }
  // else {
  //   $("#btn1").css("display","none");
  // } 
  Game.curr = id; //current chance player
  Game.inactive(Game.circular[id].prev);
  Game.active(id);
  $(".para").html("Playing as "+Game.circular[sid].name);
});


socket.on("display",(arr)=>{
  if(start == 0){
    var items = [];
    Object.values(arr).forEach((data)=>{
        items.push(`<li id = ${data.id}>` + data.name + "</li>");
        //console.log(data);
    });
    $(".players").empty();
    $(".players").append(items.join(''));
       
      //joined = arr;
      Game = new game(arr);
      if(sid == Game.root){
        document.getElementById("btn").style.display = "inline";
        admin = 1;
      }
    }
    else{
      //users = arr;
      //console.log(users);
    }
    //console.log("sid "+sid);
    //console.log("next ",Game.getNext());
});

socket.on("left",(id)=>{
  //console.log("Users : ", users,"\nJoined:",joined);
  Game.delete(id);
  var x = document.getElementById(id);
   if(x != null)
    x.style.color = "#aa0000";
});

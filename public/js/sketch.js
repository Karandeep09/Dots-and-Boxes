var arr = [];
var vert = {};
var horz = {};
var Box = {};
function createLine(i,j,x,y)
{
  strokeWeight(5);
  stroke(0,255,70);
  line(i,j,x,y); 
}
function setBox(x,y,ch)
{
  if(Box[x+" "+y] == null)
    {
      Box[x+" "+y] = 1;
    }
  else{
    Box[x+" "+y] += 1;
  }
  //fill(255,255,255);
  textSize(16);
  text(Box[x+" "+y],x-10,y+10);
  if(Box[x+" "+y] == 4){
  //text(ch,x-10,y+10);
    return true;
  }
  else{
      //Game.next(Game.curr);
      return false;
  }
}
function setup() {
   var myCanvas = createCanvas(245, 245);
   myCanvas.parent("canvas");
  background(0);
  
  var cnt = 0;
  for(let i = 20; i < 250; i += 40)
    {
      for(let j = 20; j < 250; j += 40)
        {
          
            for(let x = 20; x < 250; x += 40)
          {
            for(let y = 20; y < 250; y += 40)
            {
                if(i == x && y != j && y < j && abs(j - y) <= 250/6+1)
                  {
                    strokeWeight(5);
                    stroke(80);
                    line(i,j,x,y); // vertical
                    vert[i+" "+j+" "+x+" "+y] = 0;
                    cnt++;
                  }
              
              if(j == y && i != x && i < x && abs(i - x) <= 250/6+1)
                  {
                    strokeWeight(5);
                    stroke(80);
                    line(i,j,x,y); // horizontal
                    horz[i+" "+j+" "+x+" "+y] = 0;
                    cnt++;
                  }
            }
          }
          
        }
    }
  console.log(cnt);
  for(let i = 20; i < 250; i += 40)
    {
      for(let j = 20; j < 250; j += 40)
        {
          strokeWeight(10);
          stroke(255);
          point(i,j);
        }
    }
}
function mousePressed()
{
   if(sid != Game.curr)
     return;
  var x = mouseX;
  var y = mouseY;
  Object.keys(horz).forEach((key)=>{
       let h = key.split(" ");
       if( x >= +h[0] + 10 && x <= +h[2] - 10 && y >= +h[1] - 10 && y <= +h[1] + 10)
         {
           if(horz[key] == 0){
             socket.emit('horz',{h:h,sid:sid,key:key}); 
             horz[key] = 1;
           }
         }
         
  });
  Object.keys(vert).forEach((key)=>{
       let v = key.split(" ");
    //console.log(v[0],v[1],v[2],v[3]);   
    if( y >= +v[3] + 10 && y <= +v[1] - 10 && x >= +v[0] - 10 && x <= +v[2] + 10)
         {
           //console.log(v[0],v[1],v[2],v[3]);
           if(vert[key] == 0){ 
               socket.emit('vert',{v:v,sid:sid,key:key});
               vert[key] = 1;
           }
         }
         
  });
}
  socket.on('horz',(data)=>{
    createLine(data.h[0],data.h[1],data.h[2],data.h[3]);
    var nm = Game.circular[data.sid].name;
    var ln = Math.min(nm.length,2);
    nm = nm.slice(0,ln);
    var p = setBox(+data.h[0]+20,+data.h[1]+20,nm);
    var q = setBox(+data.h[0]+20,+data.h[1]-20,nm);
    if(p | q){}
    else
    Game.next(Game.curr);
    horz[data.key] = 1;
  });
  socket.on('vert',(data)=>{
    createLine(data.v[0],data.v[1],data.v[2],data.v[3]);
    var nm = Game.circular[data.sid].name;
    var ln = Math.min(nm.length,2);
    nm = nm.slice(0,ln);
    var p = setBox(+data.v[0]+20,+data.v[3]+20,nm);
    var q = setBox(+data.v[0]-20,+data.v[3]+20,nm);
    if(p | q){}
    else
    Game.next(Game.curr);
    vert[data.key] = 1;
  }); 
function draw() {
  //background(220);
}
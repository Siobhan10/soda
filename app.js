// board
var boardgraphic;
var topimg;
var greenface;

// board state
var board=[];  // 7*6
var heights=[];// column heights
var tokencount;
var winline=[];

// player state
var startplayer;
var currentplayer; // false=left true=right
var leftwins=0;
var rightwins=0;
var gamedraws=0;

// token state
var currentX;
var currentY;
var isfalling;
var keyposition;

// show win draw timers
var showdraw=0;
var showwin=0;

// sounds
var fall;
var drawn;
var redwins;
var yellowwins;

function preload(){
  topimg=loadImage('images/top.png');  
  greenface=loadImage('images/greenface.png');
  fall=loadSound('sounds/fall.mp3');
  drawn=loadSound('sounds/draw.mp3');
  redwins=loadSound('sounds/redwins.mp3');
  yellowwins=loadSound('sounds/yellowwins.mp3');
}

function setup(){
  var cc=createCanvas(560,560);
  cc.parent('myContainer');
  boardgraphic=createGraphics(560,480); //board graphic
  boardgraphic.background('blue');
  boardgraphic.erase();
  for(var i=0;i<7;i++){
    for(var j=0;j<6;j++){
      var x=i*80+40;
      var y=j*80+40;
      boardgraphic.circle(x,y,70);    
    }
  }
  startplayer=random(-1,1)<0;
  noStroke();
  nextgame();  
}

function nextgame(){
  startplayer=!startplayer
  currentplayer=startplayer;
  for(var i=0;i<7*6;i++) board[i]=0;
  for(var i=0;i<7;i++) heights[i]=0;
  tokencount=0;
  swapplayer();
}

function swapplayer(){
  currentplayer=!currentplayer;
  if(currentplayer){
    currentX=40;
    currentY=40;
    keyposition=0;
  }else{
    currentX=520;
    currentY=40;
    keyposition=6;
  }
}

function draw(){
  if(keyIsDown(83) && keyIsDown(38) && showdraw===0 && showwin===0){
    gamedraws++;
    showdraw=300;
    drawn.play();
  }
  // draw background and current player piece
  background('white');
  image(topimg,0,0,560,80);
  currentplayer? fill('red'):fill('yellow');
  circle(currentX,currentY,70);
  fill(0,100).strokeWeight(10).textSize(30);
   text(leftwins,5,30);
   text(rightwins,500,30);
   if(gamedraws!==0){
     text('Draws:'+gamedraws,200,30);
   }
   noStroke();
  // draw board pieces
  for(var x=0;x<7;x++){
    for(var y=0;y<6;y++){
      var piece=board[y*7+x];
      if(piece===0) continue;
      piece===1? fill('yellow'):fill('red');
      circle(x*80+40,520-y*80,70);
    }
  }
  image(boardgraphic,0,80);
  if(showdraw>0){
    showdraw--;
    fill('white').strokeWeight(10).textSize(70);
    text('DRAW!',150,300);
    if(showdraw===0){
      nextgame();
      noStroke();
    }
    return;
  }  
  if(showwin>0){
    showwin--;
     if((int(showwin/30) & 1)===0 ){
      for(var i=0;i<4;i++){
        var x=winline[i]%7;
        var y=int(winline[i]/7);
        image(greenface,x*80+3,485-y*80,75,75);
      }
    }
    if(currentplayer){
       fill('red').strokeWeight(10).textSize(70);
       text('RED WINS!',30,300);
    }else{
      fill('yellow').strokeWeight(10).textSize(70);
      text('YELLOW WINS!',30,300);
    }    
    if(showwin===0){
    //  isfalling=false;
      nextgame();
      noStroke();
    }
    return;
  }
  
  var currentColumn=int(currentX/80);
  if(isfalling){//A
    if(heights[currentColumn]===6){  //column full
      isfalling=false;
      return;
    }
    var destX=currentColumn*80+40;
    
    if(currentX===destX){  // if lined up on column center
      
       var destY=520-heights[currentColumn]*80;
       if(currentY===destY){ // insert token in table
           var h=heights[currentColumn];
           board[h*7+currentColumn]=currentplayer? 2:1;
           heights[currentColumn]++;   
           tokencount++;
           isfalling=false;
           fall.play();
           if(checkwin(currentColumn,h)){
             if(currentplayer){
                leftwins++;
                redwins.play();                  
             }else{
               rightwins++;
               yellowwins.play();
             }
             showwin=300; 
           }else{  // continue with game
             if(tokencount===6*7){
               gamedraws++;
               showdraw=300;
               drawn.play();
             }
            // isfalling=false;
             swapplayer();  // next payers turn
           }
         
       }else{
         currentY+=10;
         currentY=int(currentY);
         if(currentY>destY){ currentY=destY;}
       }
      
    }else{ // move to column center
       var dx=destX-currentX;
       dx=dx<0? int(0.4*dx)-1:int(0.4*dx)+1;
       currentX+=dx;
       currentX=int(currentX);
    } 
    return;
  }
  
}

function keyPressed(){
  if(isfalling) return;
  if(currentplayer){
      if(keyCode==90){
        keyposition--;
        if(keyposition<0) keyposition=0;
      }
      if(keyCode==67){
        keyposition++;
        if(keyposition>6) keyposition=6;
      }
      if(keyCode==88){
        isfalling=true;
      }
  }else{
      if(keyCode==37){
        keyposition--;
        if(keyposition<0) keyposition=0;
      }
      if(keyCode==39){
        keyposition++;
        if(keyposition>6) keyposition=6;
      }
      if(keyCode==40){
        isfalling=true;
      }
  }
  currentX=keyposition*80+40;
  currentY=40;
}

function touchMoved(){
  currentX=mouseX;
  currentY=min(mouseY,65);
  if(currentY<10) currentY=10;
}

function touchEnded(){
  isfalling=currentY>55;
}

function checkwin(x,y){
   var pl=currentplayer? 2:1;
   winline[0]=x+7*y;
   var ct=1;
   for(var i=1;i<4;i++){
     var u=x-i;
     if(u<0) break;
     if(board[u+7*y]!=pl) break;
     winline[ct++]=u+7*y;
     if(ct==4) return true;
   }
   for(var i=1;i<4;i++){
     var u=x+i;
     if(u>6) break;
     if(board[u+7*y]!=pl) break;
     winline[ct++]=u+7*y;
     if(ct==4) return true;
   }
  
   ct=1;
   for(var i=1;i<4;i++){
     var v=y-i;
     if(v<0) break;
     if(board[x+7*v]!=pl) break;
     winline[ct++]=x+7*v;
     if(ct==4) return true;
   }
   for(var i=1;i<4;i++){
     var v=y+i;
     if(v>5) break;
     if(board[x+7*v]!=pl) break;
     winline[ct++]=x+7*v;
     if(ct==4) return true;
   }
  
   ct=1;
   for(var i=1;i<4;i++){
     var u=x-i;
     var v=y-i;
     if(u<0) break;
     if(v<0) break;
     if(board[u+7*v]!=pl) break;
     winline[ct++]=u+7*v;
     if(ct==4) return true;
   }
    for(var i=1;i<4;i++){
     var u=x+i;
     var v=y+i;
     if(u>6) break;
     if(v>5) break;
     if(board[u+7*v]!=pl) break;
     winline[ct++]=u+7*v;
     if(ct==4) return true;
   }  
  
   ct=1;
   for(var i=1;i<4;i++){
     var u=x+i;
     var v=y-i;
     if(u>6) break;
     if(v<0) break;
     if(board[u+7*v]!=pl) break;
     winline[ct++]=u+7*v;
     if(ct==4) return true;
   }
    for(var i=1;i<4;i++){
     var u=x-i;
     var v=y+i;
     if(u<0) break;
     if(v>5) break;
     if(board[u+7*v]!=pl) break;
     winline[ct++]=u+7*v;
     if(ct==4) return true;
   }  
   return false;
}

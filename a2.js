
var time = 60;
var score = 0;
var level = 1;
//Interval variables
var i;
var up;
//whether the game is happening
var a = 0;

//food
var foodx= [];
var foody= [];
makeFood(5);

//timer for bug creation
var bugTimer = 48;

//bugs
var bugx =[];
var bugy =[];
var bugAng =[];
var bugColour =[];


document.addEventListener('DOMContentLoaded',domloaded,false);

function domloaded(){
  document.getElementById("game").style.display = "none";
  document.getElementById("hs").innerHTML = "Highscore: " + localStorage.getItem("Highscore");
}
function init(){
	
	document.getElementById("startPage").style.display = "none";
	document.getElementById("game").style.display = "initial";
  	var canvas = document.getElementById("myCanvas");
 	var ctx = canvas.getContext("2d");
 	canvas.addEventListener('mousedown', getPosition, false);
 	
 	if (document.getElementById("level2").checked) {
  		level = document.getElementById('level2').value;
	}
}

function reset(start){
	if (start){
		level = 2;
	}else{
		level = 1;
		score = 0;
	}
	time =  60;
	a = 0;
	makeFood(5);
	bugTimer = 48;
	bugx =[];
	bugy =[];
	bugAng = [];
	bugColour =[];
}

function t(){
	 if (time > 0 && foodx.length != 0){
	  	time = time-1;
	    document.getElementById("timer").innerHTML = time;
	 }else {
	 	if (level == 2 || foodx.length == 0){ //GAMEOVER
	 		if (score > localStorage.getItem("Highscore")){
	 			localStorage.setItem("Highscore", score);
	 		}
	 		if (!window.confirm("Score: "+score + 
	 				"\nHighscore: "+ localStorage.getItem("Highscore") +
	 				"\nPlay Again?")){
	 			document.getElementById("game").style.display = "none";
				document.getElementById("startPage").style.display = "initial";	
	 		}
	 		reset(false);
	 	}else{
	 		reset(true);
	 		window.alert("Level 2");
	 	}
	 		pauseTime();
	 		clear();
	 }
}
function clear(){
	var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, 400, 600);
    document.getElementById("score").innerHTML = score;
    document.getElementById("timer").innerHTML = time;
}
function update(){
	var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, 400, 600);
    document.getElementById("score").innerHTML = score;
	if (bugTimer%24 ==0 && bugTimer > randomloc(24, 24*3)){
		bugx[bugx.length] = randomloc(10,390);
		bugy[bugy.length] = 20;
		bugAng[bugAng.length] = 180*Math.PI/180;
		var rand = randomloc(0,10);
		if (rand <= 3){
			bugColour[bugColour.length] = "red";
		}else if (rand <= 6){
			bugColour[bugColour.length] = "black";
		}else {
			bugColour[bugColour.length] = "orange";
		}
		bugTimer = 0;
	}else{
		bugTimer += 1;
	}
	for (var j = 0; j < bugx.length; j++){
		var closestFood = 10000000;
		var cf;
		for (var k = 0; k < foodx.length; k++){
			var dist = Math.sqrt(Math.pow(bugx[j]-foodx[k], 2) + Math.pow(bugy[j]-foody[k], 2))
			if (dist < closestFood){
				closestFood = dist;
				cf = k;
			}
		}
		//Check for collisions with other bugs
		var above = false;
		var below = false;
		var right = false;
		var left = false;
		for (var m = 0; m < bugx.length; m++){
			if (j != m){
				var xdis = bugx[m]-bugx[j];
				var ydis = bugy[m]-bugy[j];
				
				if (xdis > 0 && xdis <= 10+(getSpeed(bugColour[j])/24)
					&& Math.abs(ydis) < 40 
					&& getSpeed(bugColour[j]) <= getSpeed(bugColour[m])){
					right = true;
				}else if (xdis < 0 && Math.abs(xdis) <= 10+(getSpeed(bugColour[j])/24)
					&& Math.abs(ydis) < 40
					&& getSpeed(bugColour[j]) < getSpeed(bugColour[m])){
						left = true;
				}
				//m is below
				if (ydis > 0 && ydis <= 40+(getSpeed(bugColour[j])/24)
					&& Math.abs(xdis) <= 10
					&& getSpeed(bugColour[j]) < getSpeed(bugColour[m])){
						below = true;
				}else if (ydis < 0 && Math.abs(ydis) <= 40+(getSpeed(bugColour[j])/24)
					&& Math.abs(xdis) <= 10
					&& getSpeed(bugColour[j]) < getSpeed(bugColour[m])){
						above = true;
					}
				
			}
		}
		
		//update bug loc based on the closest food 
		bugAng[j] = Math.atan2((foody[cf]-bugy[j]), (foodx[cf]-bugx[j]));

		if (bugx[j] < foodx[cf] && foodx[cf] - bugx[j] > 5 && !right){
			bugx[j] += Math.sin(bugAng[j]+ 90*Math.PI/180)*getSpeed(bugColour[j])/24;
		}else if (bugx[j] > foodx[cf] && bugx[j] - foodx[cf] > 5 && !left){
			bugx[j] += Math.sin(bugAng[j]+ 90*Math.PI/180)*getSpeed(bugColour[j])/24;
		}

		if (bugy[j] < foody[cf] && foody[cf] - bugy[j] > 5 && !below){
			bugy[j] += Math.cos(bugAng[j]+ 270*Math.PI/180)*getSpeed(bugColour[j])/24;
		}else if (bugy[j] > foody[cf] && bugy[j] - foody[cf] > 5 && !above){
			bugy[j] += Math.cos(bugAng[j]+ 270*Math.PI/180)*getSpeed(bugColour[j])/24;
		}
		
		//Remove Eaten Food
		if (Math.abs(bugy[j] - foody[cf]) <= 10
			&& Math.abs(bugx[j] - foodx[cf]) <= 10){
				foodx.splice(cf, 1);
				foody.splice(cf, 1);
				//foodx[cf] = randomloc(0, 400);
				//foody[cf] = randomloc(120, 600);
		}
		//Draw Bug
		ctx.save()
		ctx.translate(bugx[j], bugy[j]);
		ctx.rotate(bugAng[j] + 90*Math.PI/180);
		drawbug(ctx, bugColour[j], 0, 0);
		ctx.restore();
		
	}
	
	//Draw Food
	for (var f = 0; f < foodx.length; f++){
		drawFood(ctx, foodx[f], foody[f]);
	}

}

function getSpeed(colour){
	if (level == 1){
		if (colour == "red"){
			return 75;
		} else if (colour == "orange"){
			return 60;
		} else {
			return 150;
		}
	}else{
		if (colour == "red"){
			return 100;
		} else if (colour == "orange"){
			return 80;
		} else {
			return 200;
		}
	}
}

function randomloc(min, max){
  return (Math.random() *10000) % (max-min) + min;
}

function drawbug(ctx, colour, x, y){
  if (colour == "red"){
    ctx.fillStyle = "#FF0000"; //org: #FF9933 //red: #FF0000
  } else if (colour == "orange"){
    ctx.fillStyle = "#FF9933";
  } else if (colour == "black"){
    ctx.fillStyle = "#000000";
  }
  //Body
  ctx.beginPath();
  ctx.arc(x,y+5,5,0,2*Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x,y+15,5,0,2*Math.PI);
  ctx.fill();
  //Legs
  ctx.moveTo(x+5,y+5);
  ctx.lineTo(x+8,y+2);
  ctx.moveTo(x+5,y+15);
  ctx.lineTo(x+8,y+18);
 
  ctx.moveTo(x-5,y+5);
  ctx.lineTo(x-8,y+2);
  ctx.moveTo(x-5,y+15);
  ctx.lineTo(x-8,y+18);
  //Antena
  ctx.moveTo(x, y);
  ctx.lineTo(x-5,y-20);
  ctx.moveTo(x, y);
  ctx.lineTo(x+5,y-20);
  
  ctx.stroke();
}

function drawFood(ctx, x, y){
  ctx.beginPath();
  ctx.fillStyle = "#FF0000";
  ctx.arc(x,y,7,0,2*Math.PI);
  ctx.fill();
  ctx.moveTo(x, y-7);
  ctx.lineTo(x, y-10);
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = "#66FF66";
  ctx.arc(x+2,y-10,2,0,2*Math.PI);
  ctx.fill();
}

function makeFood(num){
	for (var j = 0; j < num; j++){
		foodx[j] = randomloc(0,400);
		foody[j] = randomloc(120,600);
	}
}

function startTime(){
  if (a == 0){
    i = window.setInterval(t, 1000);
    up = window.setInterval(update, 1000/24);
    document.getElementById("playpause").innerHTML = "Pause";
    a = 1;
  } else{
    pauseTime();
  }
}

function pauseTime(){
	window.clearInterval(i);
    window.clearInterval(up);
    document.getElementById("playpause").innerHTML = "Play";
    a = 0;
}

function killBug(x, y){
	if (a == 1){ //if the game is happening
		for (var j = 0; j < bugx.length; j++){
			if (Math.abs(bugx[j]-x) <= 30 && Math.abs(bugy[j]-y) <= 30){
				bugx.splice(j, 1);
				bugy.splice(j, 1);
				if (bugColour[j] == "black"){
					score += 5;
				}else if (bugColour[j] == "red"){
					score += 3;
				}else if (bugColour[j] == "orange"){
					score += 1;
				}
				bugColour.splice(j, 1);
			}
		}
	}
}
//adapted from: http://miloq.blogspot.ca/2011/05/coordinates-mouse-click-canvas.html
function getPosition(event){
	var x = new Number();
	var y = new Number();
	var canvas = document.getElementById("myCanvas");

	if (event.x != undefined && event.y != undefined){
		x = event.x;
		y = event.y;
	}
	else{
		x = event.clientX + document.body.scrollLeft +
		document.documentElement.scrollLeft;
		y = event.clientY + document.body.scrollTop +
		document.documentElement.scrollTop;
	}
    
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
	killBug(x, y);
}

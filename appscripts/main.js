require(
    [],
    function () {
    	console.log("yo, I'm alive!");

    	//------- Creating counters and relevant functions--------//
    	var time = 20; //for keeping track of time, each round is only 20 seconds 
    	var countdown = function(){ //this countdown function will be executed every second using setInterval 
    		time--; 
    		console.log(time)
    	};
    	var then= Date.now();

    	var counter=0;//for keeping track of the mushroom score 
    	var highest=0;//for keeping track of the highest score 
    	var maxObs=0;//for keeping track of the maximum number of obstacles (i.e. Goomba) to be created, each game mode has different number of obstacles

    	//-------- Creating variables to hold game and mode status ------//
    	var modeSelected = false; //to be used in if-statement to test if user has selected a game mode
    	var startGame = false; //to be used in setInterval function: if true, mainGame function will be executed 

    	//-------- Creating canvas and buttons ---------------------//
    	var paper = new Raphael(document.getElementById("mySVGCanvas"));
    	var pWidth = paper.canvas.offsetWidth;
        var pHeight = paper.canvas.offsetHeight;
        var bgRect = paper.rect(0,0,pWidth,pHeight);
		bgRect.attr({
            "fill": "url(resources/sky.JPG)", 
            stroke: 'black',
            "stroke-width": 5,
            "stroke-opacity": .2
        });

		var beginButt = paper.rect(250, 230, 100, 50)
        beginButt.attr({
                stroke: "none",
            'fill': "url(resources/begin.png)"
        });//the 'begin' button that will bring them to game mode page

        var startButton = paper.rect(220, 320, 160, 50);
        startButton.attr({
            stroke: "none",
            'fill': "url(resources/startbutton.png)"
        }); //the 'start game' button 

        var instructButton = paper.rect(200, 275, 200, 50);
        instructButton.attr({
            stroke: "none",
            'fill': "url(resources/instructions.png)"
        }); //the 'instructions' button

        var instructBG = paper.rect(150,75,305,250)
        instructBG.attr({
            fill:'white',
            stroke:'none'
        }); //the white background to enhance readability of instructions 

        var instructionSheet = paper.rect(150,75,300,250)
        instructionSheet.attr({
            fill:'url(resources/instructionSheet.png)',
            stroke:'none'
        });//providing a set of instructions for the game        

        var backButt = paper.rect(250,325,100,40)
        backButt.attr({
            fill:'url(resources/backbutton.png)',
            stroke:'none'
        });//for user to get back to homescreen from instructions page

        var backButt2 = paper.rect(250,355,100,40)
        backButt2.attr({
            fill:'url(resources/backbutton.png)',
            stroke:'none'
        }); //a second back button to homescreen from game mode page

        var title = paper.rect(125,60,350,150);
        title.attr({
                stroke: "none",
            'fill': "url(resources/gametitle.png)"
        }); //the game title "Mario's Mushroom Feast"

        	//----buttons and arrows for the three levels of difficulty--------//
        var easyButt = paper.rect(250,210,100,40)
        easyButt.attr({
                stroke: "none",
            'fill': "url(resources/easy.png)"
        });

        var normButt = paper.rect(250,245,100,40)
        normButt.attr({
                stroke: "none",
            'fill': "url(resources/normal.png)"
        });

        var hardButt = paper.rect(250,280,100,40)
        hardButt.attr({
                stroke: "none",
            'fill': "url(resources/hard.png)"
        });

        var arrowE = paper.rect(244,222,30,30)
        arrowE.attr({
                stroke: "none",
            'fill': "url(resources/arrow.png)"
        }); //arrow that will appear when easy button is clicked
        
        var arrowN = paper.rect(228,260,30,30)
        arrowN.attr({
                stroke: "none",
            'fill': "url(resources/arrow.png)"
        }); //arrow that will appear when normal button is clicked

        var arrowH = paper.rect(244,293,30,30)
        arrowH.attr({
                stroke: "none",
            'fill': "url(resources/arrow.png)"
        }); //arrow that will appear when hard button is clicked

        var hideMode = function(){
        	easyButt.hide();
            normButt.hide();
            hardButt.hide();
            startButton.hide();
            backButt2.hide();
            arrowE.hide();
            arrowN.hide();
            arrowH.hide();
        }; //to hide the game mode buttons and arrows 

        var homePage = function(){ //for setting the homescreen, showing and hiding relevant buttons and objects
            title.show();
            beginButt.show();
            instructButton.show();
            instructionSheet.hide();
            instructBG.hide();
            backButt.hide();
            
            hideMode();
        }; 

        var keysDown = {}; //to hold keysDown status and keyCode because arrow keys will be used to move Mario

		//-------- Creating functions for mapping and checking of collision ---------//
			//both functions will be used in the creation of game objects, hence they are placed at the top of the code
			//this mapping function will be used to randomize the position of the mushroom and goombas
		var map = function(x,a,b,m,n) { //mapping the function which takes variable x in the range [a,b] 
            return Math.floor(m+(n-m)*(x-a)/(b-a)); //function returns a value mapped into the range [m,n]
        }; 

        	//this check collision function is adapted from the website, 
        	//will be used to check the collision of (1)mario and goomba, (2) mario and mushroom and (3) mushroom and goomba
        	//the value is set to 40 as it is the height and width of all the game objects
        	//if the four conditions are fulfilled, it would mean that there is collision (i.e. checkcoll=true)
        var checkColl = function(stuff1, stuff2){
            if (stuff1.xpos <= (stuff2.xpos + 40) 
                && stuff2.xpos <= (stuff1.xpos + 40)
                && stuff1.ypos <= (stuff2.ypos + 40)
                && stuff2.ypos <= (stuff1.ypos +40)) {
                return true;
            } else {
                return false;
            }
        }; 

        //---------- Creating Game Objects: Mario, Mushroom and Goombas ------------//
        var mario = paper.rect(100,100,40,40);
        mario.attr({
            "fill": "url(resources/mario.png)",
            'stroke': 'none'

        });
        mario.xpos=100;
        mario.ypos=100;
        mario.hide();
            

		var mushroom = paper.rect(300,200,40,40);
        mushroom.attr({
            "fill": "url(resources/mushroom.png)",
            'stroke': 'none'
        });
        mushroom.xpos=300;
        mushroom.ypos=200;
        mushroom.hide();

        //creating an array to hold the obstacles 
        var obstacle = [];
        var obsCount =0; //for keeping track of the number of obstacles created, different from maxObs
        while (obsCount < 5) { // 5 goomba obstacles would be created using a while loop, maximum number of goomba obstacles is 5
            obstacle[obsCount] = paper.rect(300,200,40,40); 
            x = Math.random()*1; 
            obstacle[obsCount].xpos= map(x,0,1,50,550); //to get a random x-coordinate
            x = Math.random()*1; 
            obstacle[obsCount].ypos= map(x,0,1,50,350); //to get a random y-coordinate
            
            while(checkColl(obstacle[obsCount], mushroom) || checkColl(obstacle[obsCount], mario)){ 
            // logical operator || is used so that if either of the conditions (collision between mario and goomba, and mushroom and goomba), obstacle will be repositioned
                x = Math.random()*1; 
                obstacle[obsCount].xpos= map(x,0,1,50,550); //550 is used to ensure goomba obstacle does not end up beyond of the right side of the game area
                x = Math.random()*1; 
                obstacle[obsCount].ypos= map(x,0,1,50,350); //350 is used to ensure goomba obstacle does not end up beyond of the bottom of the game area    
            };

            obstacle[obsCount].attr({
                'fill': 'url(resources/goomba.png)',
                'stroke': 'none',
                'x':obstacle[obsCount].xpos, //setting the x-position to the random xpos value
                'y':obstacle[obsCount].ypos  //setting the y-position to the random ypos value
            });

            obstacle[obsCount].hide(); //to hide the goomba obstacle so that it does not show when the page is first loaded 
            obsCount++; 
        };

        //------------- Inserting sounds -------------//
        var bgsound = new Audio("resources/mariomusic.m4a");
        function enableAutoplay() { 
            bgsound.autoplay = true;
            bgsound.loop = true;
            bgsound.load();
        };

        function stopPlay() { 
            bgsound.pause();
        };

        var ting = new Audio("resources/mushroombeep.wav");
        function enableTing() { 
            ting.autoplay = true;
            ting.load();
        }; //sound when eaten one mushroom    
        
        var beep = new Audio("resources/beepsound2.wav");
        function enableBeep() {
            beep.autoplay = true;
            beep.load();
        }; //sound when button is clicked

        var goombabeep = new Audio("resources/goombabeep.wav");
        function enablegoombabeep() {
            beep.autoplay = true;
            beep.load();
        }; //sound when collided with goomba obstacle

        //----------------- Creating functions for various situations --------------//
        	//ready function will be executed to set the homescreen 
        var ready = function(){
        	homePage(); //hiding and showing relevant buttons
            mario.hide();
            mushroom.hide();

            obsCount = 0;
            while (obsCount < obstacle.length) { //hide the number of obstacles created 
                obstacle[obsCount].hide();
                obsCount++;
            };
        };
        
        var start = function (){
			// In order to ensure that the player selects a game mode, if-else statement and the variable modeSelected are used 
            // in such a way that the game will only begin if game mode selection status is true (i.e. selected) 
            // if the mode selection status is false, an alert box will pop up reminding the player to select a game mode. 
            
        	if (modeSelected === false) {
                alert('Please select the difficulty level before starting the game.');
            } else {
                // game starts here
                console.log("game is starting");
                startGame = true; //this will execute the mainGame function below
                enableAutoplay();
                
                // hides buttons and other objects 
                title.hide();
                startButton.hide();
                instructButton.hide();
                hideMode();

                // reveals game objects 
                
                mario.show();
                mushroom.show();
            	obsCount = 0; 
                while (obsCount < maxObs) {  
                    obstacle[obsCount].show();
                    obsCount++;
                };

                // countDownTime function comprises of a setInterval function that will decrease the time count and update the screen every second
                var countDownTime = setInterval(function(){
	                if (time>0){
	                	countdown();
	                	document.getElementById("timeCount").innerHTML = "TIME LEFT:   " + time;
                }},1000);

                // using the Timeout method to stop the game (by executing the endGame function) after 20 seconds
                var timeOutFunc; 
                gameUp = function(){
                	timeOutFunc = setTimeout(endGame,20000);
                };

                gameUp();

                then = Date.now();

                //resetting counters, keysDown and x- and y-coordinates 
                obsCount = 0;
                counter = 0;
                document.getElementById("scoreCount").innerHTML = "MUSHROOMS EATEN:   " + counter;
                time=20;
                keysDown = {};
                mario.xpos = 100;
                mario.ypos = 100;
                mario.attr({
                    'x': mario.xpos,
                    'y': mario.ypos
                });
            };
        };

        // a function variable is created to initialize all the event listeners 
        var initEventListeners = function(){
        	
        	instructButton.node.addEventListener('click',function(){ 
            	enableBeep();
            	instructionSheet.show();
            	backButt.show();
            	instructBG.show();
            	title.hide();
            	beginButt.hide();
            	instructButton.hide();
            });

        	startButton.node.addEventListener('click', function(){
                enableBeep();
                start();
            });

            backButt.node.addEventListener('click',function(){
            enableBeep();
            homePage();
            });

            backButt2.node.addEventListener('click',function(){
            enableBeep();
            homePage();
            });

            beginButt.node.addEventListener('click', function(){
                enableBeep();
                instructButton.hide();
                beginButt.hide();
                easyButt.show();
                normButt.show();
                hardButt.show();
                startButton.show();
                backButt2.show();
            })
            
            easyButt.node.addEventListener('click',function(){
                arrowE.show();
                arrowN.hide();
                arrowH.hide();
                mario.xrate=400;
                mario.yrate=400;
                maxObs = 2;
                modeSelected = true;
                enableBeep();
            });

            normButt.node.addEventListener('click',function(){
                enableBeep();
                arrowN.show();
                arrowE.hide();
                arrowH.hide();
                mario.xrate=600;
                mario.yrate=600;
                maxObs = 3;
                modeSelected = true;
            });

            hardButt.node.addEventListener('click',function(){
                enableBeep();
                arrowH.show();
                arrowE.hide();
                arrowN.hide();
                mario.xrate=900;
                mario.yrate=900;
                maxObs = 4;
                modeSelected = true;
            });

            //adapted from the website, these event listeners listen to key down and key up events 
            addEventListener('keydown', function(e){
                keysDown[e.keyCode] = true
            }, false);

            addEventListener('keyup', function(e){
                delete keysDown[e.keyCode];
            }, false);

            
        };

        //a reset function for resetting the game 
        var reset = function(){
        	//generating new x- and y-position of the mushroom by random, adapted from website 
        	mushroom.xpos= 50 + Math.floor((Math.random() * (pWidth - 100)));
            mushroom.ypos= 50 + Math.floor((Math.random() * (pHeight - 100)));
            mushroom.attr({
                'x': mushroom.xpos,
                'y': mushroom.ypos
            });
            //generating new x- and y-position of the goomba obstacles by random,
            obsCount=0;
            while (obsCount < maxObs) { 
                x = Math.random()*1; 
                obstacle[obsCount].xpos= map(x,0,1,50,500);
                x = Math.random()*1; 
                obstacle[obsCount].ypos= map(x,0,1,50,300);
                while(checkColl(obstacle[obsCount], mushroom)){
                    x = Math.random()*1; 
                    obstacle[obsCount].xpos= map(x,0,1,50,500);
                    x = Math.random()*1; 
                    obstacle[obsCount].ypos= map(x,0,1,50,300);       
                };

                obstacle[obsCount].attr({
                    'fill': 'url(resources/goomba.png)',
                    'x':obstacle[obsCount].xpos,
                    'y':obstacle[obsCount].ypos
                });                
                obsCount++;
            };
        };

        //a function to
      	var movemario = function(){
			// This ensures that Mario does not move out of the game box. 40 is used as it is the width and height of Mario 
            if (mario.xpos > pWidth-40) {mario.xpos = pWidth-40};
            if (mario.ypos > pHeight-40) {mario.ypos = pHeight-40};
            if (mario.xpos < 0) { mario.xpos = 0}; 
            if (mario.ypos < 0) { mario.ypos = 0};
            //updates the position of Mario
            mario.attr({
            	'x': mario.xpos, 
            	'y': mario.ypos
            });
        };
        //an update function to updating the position of game objects, adapting from the website
        var update = function(modi){
        	// down = 40, left = 37, right = 39, up = 38
        	//modifier will be passed to determine the amount of increment in ypos, 
        	//i.e. determining the distance Mario will move according to how much time has passed since the last processing 
        	if (38 in keysDown){
                mario.ypos -= (mario.yrate * modi); 
            }

            if (40 in keysDown){
                mario.ypos += (mario.yrate * modi);
            }

            if (37 in keysDown){
                mario.xpos -= (mario.xrate * modi);
            }

            if (39 in keysDown){
                mario.xpos += (mario.xrate * modi);
            }
            
            movemario();

            // checking for collision 
            if (checkColl(mushroom, mario)) {
                enableTing();
                counter++;
                document.getElementById("scoreCount").innerHTML = "MUSHROOMS EATEN:   " + counter;
                reset(); //each time Mario eats a mushroom, position of mushroom and goomba obstacles will change 
            };

            obsCount =0; 
            while (obsCount < maxObs){
                if(checkColl(obstacle[obsCount], mario)) {
                    enablegoombabeep();
                    counter--;
                    document.getElementById("scoreCount").innerHTML = "MUSHROOMS EATEN:   " + counter;
                    reset();//each time Mario hits a goomba, position of mushroom and goomba obstacles will change 
                };
                obsCount++;
            };
        };

        //adapted from the main game loop code provided by the website 
        var mainGame = function(){
        	var now = Date.now();
            var duration = now - then; 
            update(duration/1000); //the value will be passed in the update function as the modifier to ensure smooth movement and constant speed 
            then = now; 
        };

        var endGame = function (){
        	// alert message varies according to number of times clicked
            if (counter > 3) {
                confirm("Great job! You managed to eat " + counter + " mushrooms. Let's play again!");
            } 
            else {
                confirm("Oh man! You only managed to eat " + counter + " mushrooms. Try harder! Let's play again!")
            };

            //the highest score counter will be updated from the current score is higher than the last highest score
            if (highest < counter) {
            document.getElementById("highCount").innerHTML = "HIGHEST SCORE:   " + counter;
            confirm("You've created a new high score!")
            };
            highest = counter;//updating the highest score counter
            
            //resetting time and score counters
            counter=0;
            time=0;
            document.getElementById("scoreCount").innerHTML = "MUSHROOMS EATEN:   " + counter;
            document.getElementById("timeCount").innerHTML = "TIME LEFT:   " + counter;

            //resetting position of Mario 
            mario.xpos = 100;
            mario.ypos = 100;
            mario.attr({
                'x': mario.xpos,
                'y': mario.ypos
            });

            startGame = false;
            // pauses the background sound
            stopPlay();

            // resets the game
            ready();
        };

        setInterval(function(){
            if (startGame) {
            	mainGame();
            };
        }, 2);//the mainGame function will be executed so rapidly to execute Mario's movements and checking of collision 

       	initEventListeners();
       	ready();
});


































                


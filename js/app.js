console.log('link');

// create a new scene named "Game"
var gameScene = new Phaser.Scene('Game');

// our game's configuration
let config = {
  type: Phaser.AUTO, //Phaser will decide how to render our game (WebGL or Canvas)
  width: 800, // game width
  height: 600, // game height

  backgroundColor: '#D3D3D3', // game background
  scene: gameScene,
  // scene: {
  //   // key: 'game',
  //   preload: preload,
  //   create: create,
  //   update: update,
  //   // gameOver: this.scene.restart()
  // }, // our newly created scene
  physics: {
    default: 'arcade',
    arcade: {
      // gravity: { y: 500}, // include gravity
      debug: false
    }
  },
  parent: 'game'
};

// create the game, and pass it the configuration
var game = new Phaser.Game(config);

// Blank canvas to populate with sub arrays
var gameMap = [];

// dynamically generate 2D array with subarrays of 0's
function populateGameMap(col, row) {
  for (var i = 0; i < row; i++) {
    gameMap.push(new Array(col).fill(0));
  }

  return gameMap;
}

// Platform object constructor function
function Platform(x, y, width, val = 1) {
  this.x = x; // the first column the object occupies
  this.y = y; // the first row the object occupies
  this.width = width; // the number of columns the object occupies
  this.val = val; // the objects corresponding sprite skinning
}

// Prototype method to turn platform object into an array of usable data
// n is number of indeces, which is equal to columns
Platform.prototype.generatePlatform = function(n) {
  var platform = new Array(n).fill(0);
  var mappedObject = platform.map((el, idx) => {
    if (idx >= this.x && idx < this.x + this.width) {
      return this.val;
    }
    return el;
  });

  return mappedObject;
};

// Make array of game platform objects to iterate over and call prototype method
var gamePlatforms = []; // This array variable holds all the platforms
var numPlatforms = 7; // This variable specifies the number of platforms the game creates
var numColumns = 8; // This variable specifies the number of horizantal boxes the game creates
var numRows = 20; // This variable specifies the number of vertical boxes the game creates
var endGame;


// This function generates x & y coordinates and widths for the ground and platforms,
// constructs them using the Platform constructor, and then stores them in the gamePlatform array
function generatePlatform(){
  var ground = new Platform(0, 0, numColumns, 1);
  var spriteIndex = new Platform(2, 2, 1, 2);

  gamePlatforms.push(ground);
  gamePlatforms.push(spriteIndex);

  for (var i = 2; i < numPlatforms + 2; i++){
    var y = gamePlatforms[i-1].y + 2;
    var xPrev = gamePlatforms[i-1].x;
    var w = generateRandomXCoord(1, 3);
    var x = generateRandomXCoord(0, 7, xPrev, w);

    gamePlatforms[i] = new Platform(x,y,w);
  }

  return gamePlatforms;
}

function generateRandomXCoord(xMin, xMax, xPrev, platWidth){
  do{
    var min = Math.ceil(xMin);
    var max = Math.floor(xMax);
    var xNew = Math.floor(Math.random() * (max - min)) + min;
    var maxSpace;

    if(platWidth === 1){
      maxSpace = 2;
    } else{
      maxSpace = 3;
    }
  }while((xNew === xPrev) || (Math.abs(xNew-xPrev) > maxSpace));

  return xNew;
}

// sprite starts at row 2, which is .length-2 in the 2D array
// for every even row >= .length-4, create new Platform object
// invoke prototype method to turn Platform object into an array of 0's and 1's
// iterate over pre-populated 2D array, and replace existing subarray of 0's with newly generated platform array

function refillGameMap(gamePlatforms, col, row) {
  // start at gamePlatforms.indexOf(sprite) because loop increments every other row
  let j = 1;
  // initialize gameMap and assign with a 2D array filled with 0's
  let gameMap = populateGameMap(col, row);
  // hard code ground in game map array
  gameMap[gameMap.length-1] = gamePlatforms[0].generatePlatform(col); // ground platform is always the first element in the gamePlatforma array

  for (var i = gameMap.length - 2; i >= 2; i -= 2) {
    if (gamePlatforms[j]) {
      gameMap[i] = gamePlatforms[j].generatePlatform(col);
      j++;
    }
  }
  return gameMap;
}

gameScene.replay = function(){
  this.scene.restart();
};

gameScene.preload = function() {
  // this.load.image('sprite', 'assets/dead.png', { frameWidth: 32, frameHeight: 48 });
  this.load.image('tile', 'assets/15-01.png');
  this.load.spritesheet('red', 'assets/red-sprites.png', { frameWidth: 50, frameHeight: 50 });

};

//Global variable for key input
var cursors;
var tile;
var gameOver = false;
var player;

gameScene.create = function() {
  const gameMap = refillGameMap(generatePlatform(), numColumns, numRows);
  tile = this.physics.add.staticGroup();
  cursors = this.input.keyboard.createCursorKeys();

  //Endgame object creation. Place on page is temporary.
  var endX = gamePlatforms.slice(-1)[0].x;
  var endY = gamePlatforms.slice(-1)[0].y;
  console.log(endX, endY);
  endGame = this.physics.add.staticGroup();
  endGame.create((endX*120), ((numRows-endY-1)*30), 'tile');

  for (var i = 0; i < gameMap.length; i++) {
    for (var j = 0; j < gameMap[i].length; j++) {

      if (gameMap[i][j] === 1) {
        tile.create(j * 120, i * 30, 'tile');
        tile.displayOriginX = 0;
        tile.displayOriginY = 0;
        tile.displayWidth = 120;
        tile.displayHeight = 20;
      } else if (gameMap[i][j] === 2) {
        player = this.physics.add.sprite(100, 450, 'red');
        //Set gravity to player sprite only
        player.body.gravity.y = 500;
        // sprite.body.setSize(0, 500);
        // sprite.displayWidth = 30;
        // sprite.displayHeight = 40;
        player.setCollideWorldBounds(true);
      }
    }
  }

  //Create main character sprite, and have collision
  this.physics.add.collider(player, tile);
  player.body.checkCollision.up = false;
  player.body.checkCollision.down = true;
  player.body.checkCollision.left = false;
  player.body.checkCollision.right = false;

  //Idle animation creation
  this.anims.create({
    key: 'idle',
    frames: this.anims.generateFrameNumbers('red', { start: 4, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  //Left
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('red', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  //Right
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('red', { start: 8, end: 11 }),
    frameRate: 10,
    repeat: -1
  });

  //Airborne Right
  this.anims.create({
    key: 'jump-right',
    frames: this.anims.generateFrameNumbers('red', { start: 12, end: 15 }),
    frameRate: 10,
    repeat: -1
  });

  //Airborne left
  this.anims.create({
    key: 'jump-left',
    frames: this.anims.generateFrameNumbers('red', { start: 16, end: 19 }),
    frameRate: 10,
    repeat: -1
  });


  //Once player overlaps with object, invoke ender function to end user input and game.
  this.physics.add.overlap(player, endGame, ender, null, this);
};

gameScene.update = function(){
  if (gameOver){
    player.setVelocityX(0);
    return;
  }

  if (cursors.left.isDown){
    player.setVelocityX(-160);
    if (!player.body.touching.down){
      player.anims.play('jump-left', true);
    } else {
      player.anims.play('left', true);
    }

  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    if (!player.body.touching.down){
      player.anims.play('jump-right', true);
    } else {
      player.anims.play('right', true);
    }

  } else {
    player.setVelocityX(0);
    player.anims.play('idle', true);
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-350);
  }
};

//Function that gets called when player sprite collides with  endGame object.
function ender(){
  gameOver = true;

  //Double check that we're hitting this function.
  player.setVelocityY(-500);
  player.body.gravity.y = 0;
  player.setCollideWorldBounds(false);
  clearTimeout(t);

  setTimeout(function(){
    saveScoreToLocalStorage(t);
    window.location.href = '/scoreboard.html';
  }, 1000);
}

var re = document.getElementById('restart');
re.addEventListener('click', gameScene.replay);

var h1 = document.getElementsByTagName('h1')[0];
var seconds = 0;
var t;

function addTime(){
  seconds++;
  h1.textContent = 'Time: ' + seconds + ' seconds';
  timer();
}

function timer(){
  t = setTimeout(addTime, 1000);
}

document.addEventListener('keydown', startGame);

function startGame(){
  if(event.which){
    timer();
    document.removeEventListener('keydown', startGame);
  }
}

// trigger when player finishes game
// calculate high score by a multiplier
function calculateScore(timeInSec) {
  return Math.floor((100000 - timeInSec) * .2);
  // return timeInSec;
}

// why won't this create an array and save to local storage?
function saveScoreToLocalStorage(seconds) {
  let newScore = calculateScore(seconds);

  localStorage.setItem('recentScore', JSON.stringify(newScore));
  localStorage.setItem('gameOver', JSON.stringify(true));
}
'use strict';

console.log('link');

// const gameMap = [
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 1, 1, 1],
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [1, 1, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 1, 1, 1, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 1, 1],
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 1, 1, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [1, 1, 1, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 1, 1, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 1, 1, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 1, 1, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 2, 0, 0, 0, 0],
//   [1, 1, 1, 1, 1, 1, 1, 1],
// ];

// Blank canvas to populate with sub arrays
var gameMap = [];

// dynamically generate 2D array with subarrays of 0's
function populateGameMap(row, column) {
  var sub = new Array(row).fill(0);

  for (var i = 0; i < column; i++) {
    gameMap.push(sub);
  }

  return gameMap;
}

// Platform object constructor function
function Platform(x, y, width = 2, val = 1) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.val = val;
}

// Prototype method to turn platform object into an array of usable data
// n is number of indeces, which is equal to columns
Platform.prototype.generatePlatform = function(n) {
  var platform = new Array(n).fill(0);
  var mappedObject = platform.map((el, idx) => {
    // debugger;
    if (idx >= this.x && idx < this.x + this.width) {
      return this.val;
    }
    return el;
  });

  return mappedObject;
};

// Generate platform objects to repopulate game array with data
var ground = new Platform(0, 0, 8, 1);
var sprite = new Platform(2, 2, 1, 2);
var one = new Platform(4, 3);
var two = new Platform(1, 5);
var three = new Platform(4, 7);
var four = new Platform(2, 9);
var five = new Platform(5, 11);
var six = new Platform(3, 13);
var seven = new Platform(0, 15);
var eight = new Platform(4, 17);

// Make array of game platform objects to iterate over and call prototype method
var gamePlatforms = [
  ground,
  sprite,
  one,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight
];

// sprite starts at row 2, which is .length-2 in the 2D array
// for every even row >= .length-4, create new Platform object
// invoke prototype method to turn Platform object into an array of 0's and 1's
// iterate over pre-populated 2D array, and replace existing subarray of 0's with newly generated platform array

function refillGameMap(gamePlatforms, row, col) {
  // start at gamePlatforms.indexOf(sprite) because loop increments every other row
  let j = 1;
  // initialize gameMap and assign with a 2D array filled with 0's
  let gameMap = populateGameMap(row, col);
  // hard code ground in game map array
  gameMap[gameMap.length-1] = gamePlatforms[gamePlatforms.indexOf(ground)].generatePlatform(8);

  for (var i = gameMap.length - 2; i >= 2; i -= 2) {
    gameMap[i] = gamePlatforms[j].generatePlatform(row);
    j++;
  }

  return gameMap;
}

refillGameMap(gamePlatforms, 8, 20);

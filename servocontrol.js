var five = require("johnny-five");
var positions = {};
var servos = {};

//initialize servo control module
function init(board, options, callback){
	//creation of global variable to call within move
	opts = options;

	for (servo in options.servos){
		//alias servo config
		var servoConfig = options.servos[servo];

		//store start position of the servo
		positions[servo] = servoConfig.startPosition

		//instanciate the new servo
		servos[servo] = new five.Servo({
			pin: servoConfig.pin,
			isInverted: servoConfig.isInverted
		});

		//move servo to starting position
		servos[servo].to(positions[servo]);
	}

	setTimeout(callback, 1000);
}

//Move the servos
function move(destinations, callback){
	var largestChange = 0
	for (var servo in destinations){
		var delta = Math.abs(destinations[servo] - positions[servo])
		if(delta > largestChange){
			largestChange = delta;
		}
	}

	//apply short-circuit if none of the servos need to move
	if (largestChange===0){
		process.nextTick(callback);
		return;
	}

	//based on largest change in angle, calc how long should take to move --> one servo will move at full speed and others will accomodate to reach at same time
	var duration = largestChange / opts.rate;

	//finally, move the servos to their final destinations
	for (servo in destinations) {
		positions[servo] = destinations[servo];
		servos[servo].to(destinations[servo], duration);
	}

	//when done, call the callback
	setTimeout(callback, duration + opts.settleTime);
}

//Export public methods
module.exports = {
	init: init,
	move: move,
	servos: servos
};

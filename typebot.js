var five = require("johnny-five"),
	servocontrol = require("./servocontrol")

var SEQUENCE = ['p', 'a'],
	SERVO_RATE = 0.05,
	STEP_SETTLE_TIME = 500;

var SERVO_CONFIG = {
	servos: {
		shoulder: {
			pin: 3,
			startPosition: 90,
			isInverted: false
		},
		elbow: {
			pin: 6,
			startPosition: 60,
			isInverted: false
		},
		wrist: {
			pin: 5,
			startPosition: 30,
			isInverted: true
		}
	},
	rate: SERVO_RATE,
	settleTime: STEP_SETTLE_TIME
}

var KEYS = {
  a: { shoulder: 125, elbow: 19, wrist: 87 },
  b: { shoulder: 88, elbow: 21, wrist: 62 },
  c: { shoulder: 105, elbow: 21, wrist: 65 },
  d: { shoulder: 114, elbow: 21, wrist: 77 },
  e: { shoulder: 114, elbow: 19, wrist: 87 },
  f: { shoulder: 107, elbow: 21, wrist: 74 },
  g: { shoulder: 100, elbow: 21, wrist: 72 },
  h: { shoulder: 92, elbow: 21, wrist: 70 },
  i: { shoulder: 81, elbow: 20, wrist: 79 },
  j: { shoulder: 84, elbow: 21, wrist: 70 },
  k: { shoulder: 77, elbow: 21, wrist: 71 },
  l: { shoulder: 69, elbow: 21, wrist: 73 },
  m: { shoulder: 70, elbow: 21, wrist: 65 },
  n: { shoulder: 78, elbow: 21, wrist: 63 },
  o: { shoulder: 75, elbow: 20, wrist: 81 },
  p: { shoulder: 68, elbow: 20, wrist: 83 },
  q: { shoulder: 124, elbow: 16, wrist: 98 },
  r: { shoulder: 108, elbow: 20, wrist: 83 },
  s: { shoulder: 120, elbow: 20, wrist: 82 },
  t: { shoulder: 102, elbow: 20, wrist: 81 },
  u: { shoulder: 88, elbow: 21, wrist: 78 },
  v: { shoulder: 97, elbow: 21, wrist: 63 },
  w: { shoulder: 119, elbow: 18, wrist: 92 },
  x: { shoulder: 113, elbow: 21, wrist: 68 },
  y: { shoulder: 95, elbow: 20, wrist: 79 },
  z: { shoulder: 120, elbow: 21, wrist: 72 }
};

function run(){
	var STATE_IDLE = 0,
		STATE_MOVING = 1,
		STATE_PRESSING = 2,
		STATE_RELEASING = 3,
		STATE_RESETTING = 4

	var sequencePosition = -1,
		state = STATE_IDLE,
		key

	function tick(){
		switch(state){
			case STATE_IDLE:
				sequencePosition++;
				key = KEYS[SEQUENCE[sequencePosition]];
				
				console.log('Typing key ' + SEQUENCE[sequencePosition]);

				// if(!key){
				// 	console.log('DONE, moving back to original position')
				// 	process.exit()
				// } 

				//to resting above the key
				state = STATE_MOVING;
				servocontrol.move({
					shoulder: key.shoulder,
					elbow: key.elbow + 10,
					wrist: key.wrist - 5
				}, tick);
				break;

			case STATE_MOVING:
				state = STATE_PRESSING;
				servocontrol.move({
					elbow: key.elbow,
					wrist: key.wrist
				}, tick);
				break;

			case STATE_PRESSING:
				state = STATE_RELEASING;
				servocontrol.move({
					elbow: key.elbow + 10,
					wrist: key.wrist - 5
				}, tick);
				break;

			case STATE_RELEASING:
				var nextKey = KEYS[SEQUENCE[sequencePosition + 1]]
				if (nextKey){
					state = STATE_IDLE;
				} else{
					state = STATE_RESETTING
				}
				tick();
				break;

			//this case is logging out, but not listening to servocontrol.move to move back to original position
			case STATE_RESETTING:
				console.log('state resetting')
				servocontrol.move({
					shoulder: 90,
					elbow: 60,
					wrist: 30
				}, process.exit())
		}
	}

	tick()
}

var board = new five.Board()
board.on("ready", function(){
	servocontrol.init(board, SERVO_CONFIG, run)
})
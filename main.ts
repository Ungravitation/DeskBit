/**
 * Control keyestudio DeskBitCar
 * author: xiuxian
 * github:https://github.com/Ungravitation/DeskBit
 * Write the date: 2021-01-05
 */

enum state {
        state1=0x10,
        state2=0x11,
        state3=0x20,
        state4=0x21
    }
interface KV {
    key: state;
    action: Action;
}


//% color="#ff6800" icon="\uf1b9" 
//% groups='["Car", "Servo", "Configuration"]'
namespace DeskBit {

    //% fixedInstances
    export class Servo {
        private _minAngle: number;
        private _maxAngle: number;
        private _stopOnNeutral: boolean;

        constructor() {
            this._minAngle = 0;
            this._maxAngle = 180;
            this._stopOnNeutral = false;
        }

        private clampDegrees(degrees: number): number {
            degrees = degrees | 0;
            degrees = Math.clamp(this._minAngle, this._maxAngle, degrees);
            return degrees;
        }

        /**
         * Set the servo angle
         */
        //% weight=100 help=servos/set-angle
        //% blockId=servoservosetangle block="set %servo angle to %degrees=protractorPicker °"
        //% degrees.defl=90
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        //% parts=microservo trackArgs=0
        //% group="Servo"
        setAngle(degrees: number) {
            degrees = this.clampDegrees(degrees);
            this.internalSetAngle(degrees);
        }

        protected internalSetAngle(angle: number): void {

        }

        /**
         * Stop sending commands to the servo so that its rotation will stop at the current position.
         */
        // On a normal servo this will stop the servo where it is, rather than return it to neutral position.
        // It will also not provide any holding force.
        //% weight=10 help=servos/stop
        //% blockId=servoservostop block="stop %servo"
        //% servo.fieldEditor="gridpicker"
        //% servo.fieldOptions.width=220
        //% servo.fieldOptions.columns=2
        //% parts=microservo trackArgs=0
        //% group="Servo"
        stop() {
            this.internalStop();
        }
        protected internalStop() { }

        /**
         * Gets the minimum angle for the servo
         */
        public get minAngle() {
            return this._minAngle;
        }

        /**
         * Gets the maximum angle for the servo
         */
        public get maxAngle() {
            return this._maxAngle;
        }

    }

    export class PinServo extends Servo {
        private _pin: PwmOnlyPin;

        constructor(pin: PwmOnlyPin) {
            super();
            this._pin = pin;
        }

        protected internalSetAngle(angle: number): void {
            this._pin.servoWrite(angle);
        }

        protected internalSetPulse(micros: number): void {
            this._pin.servoSetPulse(micros);
        }

        protected internalStop() {
            this._pin.digitalWrite(false);
        }

        InternalSetAngle(angle: number): void {
            this._pin.servoWrite(angle);
        }
    }

    let leftWheel = new PinServo(pins.P2);
    let rightWheel = new PinServo(pins.P1);
    let shovel = new PinServo(pins.P0);

    /**
     * Set the car speed
     * angle can control speed
     */
    //% block="Car %directe speed: %Speed"
    //% Speed.min=0 Speed.max=100
    //% group="Car"
    export function Run(directe: DIR, Speed: number) {
        let CW = Math.map(Speed, 0, 100, 90, 180);
        let CCW = Math.map(Speed, 0, 100, 90, 0);
        if (directe == 0) {
            leftWheel.InternalSetAngle(CW);
            rightWheel.InternalSetAngle(CCW);
        }
        if (directe == 1) {
            leftWheel.InternalSetAngle(CCW);
            rightWheel.InternalSetAngle(CW);
        }
        if (directe == 2) {
            leftWheel.InternalSetAngle(CW);
            rightWheel.InternalSetAngle(CW);
        }
        if (directe == 3) {
            leftWheel.InternalSetAngle(CCW);
            rightWheel.InternalSetAngle(CCW);
        }
    }
    /**
     * Set the car speed
     * angle can control speed
     */
    //% block="Car %select wheel %directe speed: %Speed"
    //% Speed.min=0 Speed.max=100
    //% group="Car"
    export function Run2(select: L_R, directe: F_B, Speed: number) {
        let CW = Math.map(Speed, 0, 100, 90, 180);
        let CCW = Math.map(Speed, 0, 100, 90, 0);
        if ((select == 0) && (directe == 0)) {
            leftWheel.InternalSetAngle(CW);
        }
        if ((select == 0) && (directe == 1)) {
            leftWheel.InternalSetAngle(CCW);
        }
        if ((select == 1) && (directe == 0)) {
            rightWheel.InternalSetAngle(CCW);
        }
        if ((select == 1) && (directe == 1)) {
            rightWheel.InternalSetAngle(CW);
        }
    }
    /**
     * Car stop
     */
    //% block="Car Stop"
    //% group="Car"
    export function Stop() {
        leftWheel.InternalSetAngle(90);
        rightWheel.InternalSetAngle(90);
    }

    /**
     * car's shovel
     */
    //% block="Angle of Car's arm: %angle °"
    //% angle.min=0 angle.max=180
    //% group="Car"
    export function Shovel(angle: number) {
        shovel.InternalSetAngle(angle);
    }

    let irstate:number;
    let state:number;

    //% advanced=true shim=maqueenIRV2::irCode
    function irCode(): number {
        return 0;
    }

    //% weight=5
    //% group="micro:bit(v2)"
    //% blockId=IR_readv2 block="read IR key value"
    export function IR_readV2(): number {
        return valuotokeyConversion();
    }
    //% weight=2
    //% group="micro:bit(v2)"
    //% blockId=IR_callbackUserv2 block="on IR received"
    //% draggableParameters
    export function IR_callbackUserV2(cb: (message: number) => void) {
        state = 1;
        control.onEvent(11, 22, function() {
            cb(irstate)
        }) 
    }
    function valuotokeyConversion():number{
        let irdata:number;
        switch(irCode()){
            case 0xf629D:irdata = 12;break;
            case 0xf22DD:irdata = 13;break;
            case 0xfA857:irdata = 14;break;
            case 0xfC23D:irdata = 15;break;
            case 0xf02FD:irdata = 16;break;
            case 0xf4AB5:irdata = 0;break;
            case 0xf6897:irdata = 1;break;
            case 0xf9867:irdata = 2;break;
            case 0xfB04F:irdata = 3;break;
            case 0xf30CF:irdata = 4;break;
            case 0xf18E7:irdata = 5;break;
            case 0xf7A85:irdata = 6;break;
            case 0xf10EF:irdata = 7;break;
            case 0xf38C7:irdata = 8;break;
            case 0xf5AA5:irdata = 9;break;
            case 0xf42BD:irdata = 10;break;
            case 0xf52AD:irdata = 11;break;
            default:
            irdata = -1;
        }
        return irdata;
    }
    basic.forever(() => {
        if(state == 1){
            irstate = valuotokeyConversion();
            if(irstate != -1){
                control.raiseEvent(11, 22)
            }
        }
        
        basic.pause(20);
    })
}

enum DIR {
    runForward = 0,
    runBack = 1,
    leftRotation = 3,
    rightRotation = 2,
}

enum L_R {
    left = 0,
    right = 1,
}

enum F_B {
    forward = 0,
    back = 1,
}


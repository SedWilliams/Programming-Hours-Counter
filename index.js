//const Date = require("date");
const mongo = require("mongodb");
const convertTime = require("convert-time");
const date = new Date();
const readline = require("readline");
const month = date.getMonth() + 1;
const day = date.getDate();
const year = date.getFullYear();

//going to remove seconds and instead convert all times to time in minutes and subtract
//to find a singular runtimeMinutes which will be converted back into the hours/minutes format
// and stored into the runtime member

readline.emitKeypressEvents(process.stdin);

class Time {
    constructor() {
        //counter for getTime(), can only be run twice to prevent logging more data
        this.i = 0;

        //variables holding calculations for runtime
        this.startHours = null;
        this.startMinutes = null;
        //this.startSeconds = null;

        this.endHours = null;
        this.endMinutes = null;
        //this.endSeconds = null;

        this.runtimeHours = null;
        this.runtimeMinutes = null;
        //this.runtimeSeconds = null;
        
        this.runtime = null;

        //date/time info
        this.hours = null;
        this.minutes = null;
        //this.seconds = null;
    }

    updateTime() {
        const date = new Date();
        //this.hours = date.getHours();
        this.hours = () => {
            if (date.getHours() < 12) {
                return date.getHours();
            } else if (date.getHours > 12) {
                return date.getHours - 12;
            }
        }
        this.minutes = date.getMinutes();
        //this.seconds = date.getSeconds();
        //this.operationalTime = Number(`${this.hours}${this.minutes}${this.seconds}`);
    }

    convertToMinutes(hours, minutes) {
        hoursInMinutes = hours * 60;
        return  hoursInMinutes + minutes;
    }

    calculateTimeDifference(start, finish, runtimeHolder) {
        const minutesAt12 = 720;
        start = this.convertToMinutes(start.startHours, start.startMinutes);
        finish = this.convertToMinutes(finish.endHours, finish.endMinutes);
        
        if (start > finish) {
            //720 is the number of minutes at 12:00
            start = 720 - start;
            runtimeHolder = start + finish;
        } else if (start < finish) {
            runtimeHolder = start - finish;
        }
        
    }

    getTime() {

        if(this.i == 0) {

            this.startHours = this.hours;
            this.startMinutes = this.minutes;
            //this.startSeconds = this.seconds;
            console.log("Start time: " +  convertTime(`${this.startHours}:${this.startMinutes}`));

        } else if(this.i == 1) {

            this.endHours = this.hours;
            this.endMinutes = this.minutes;
            //this.endSeconds = this.seconds;

            //this.runtime = `${this.runtimeHours}:${this.runtimeMinutes}`;
            console.log("End time : " +  convertTime(`${this.endHours}:${this.endMinutes}`));
            console.log(`Total Runtime: ${this.calculateTimeDifference((this.startHours, this.startMinutes),(this.endHours, this.endMinutes), this.runtime)}`);

        } else {
            console.log("Time already logged.");
            console.log(`Runtime was: ${this.runtime}`);
        }

        this.i++;
        //return `${this.hours}:${this.minutes}:${this.seconds}`;
    }



}

var time = new Time();

time.updateTime();
time.getTime();

process.stdin.on('keypress', (chunk, key) => {
    if(key && key.name == 'l') {
        time.updateTime();
        time.getTime();
        //time.calculateTimeDifference((time.startHours, time.startMinutes), (time.endHours, time.endMinutes));
    }
});
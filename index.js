//const Date = require("date");
const mongo = require("mongodb");
const convertTime = require("convert-time");
const readline = require("readline");
const {connected} = require("process");

const date = new Date();
const month = date.getMonth() + 1;
const day = date.getDate();
const year = date.getFullYear();

const uri = "mongodb+srv://lilshed3:9168689565@cluster0.jpmmpcc.mongodb.net/?retryWrites=true&w=majority";
const client = new mongo.MongoClient("mongodb+srv://lilshed3:9168689565@cluster0.jpmmpcc.mongodb.net/?retryWrites=true&w=majority");
let globalCollPlaceholder = null;

readline.emitKeypressEvents(process.stdin);

async function connectDB() {
    await client.connect();
    const db = client.db("hoursCounter");
    globalCollPlaceholder = db.collection("logs");
    console.log("Connected!");
}

async function dbQuery(docs) {
    await globalCollPlaceholder.insertMany(docs);
    console.log("Data logged!");
}

async function disconnectDB() {
    await client.close();
    console.log("Disconnected");   
}

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

        //this.runtimeHours = null;
        //this.runtimeMinutes = null;
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
        if (date.getHours() < 12) {
            this.hours = date.getHours();
        } else if (date.getHours() > 12) {
            this.hours = date.getHours() - 12;
        }
        this.minutes = date.getMinutes();
    }

    convertToMinutes(hours, minutes) {
        let hoursInMinutes = hours * 60;
        return  hoursInMinutes + minutes;
    }

    calculateTimeDifference(start, finish) {
        const minutesAt12 = 720;
        let [startHours, startMinutes] = start;
        let [endHours, endMinutes] = finish;
        let startTime = this.convertToMinutes(startHours, startMinutes);
        let finishTime = this.convertToMinutes(endHours, endMinutes);
        
        if (startTime > finishTime) {
            //720 is the number of minutes at 12:00
            startTime = 780 - startTime;
            this.runtime = startTime + finishTime;
        } else if (startTime < finishTime) {
            this.runtime = finishTime - startTime;
        }
    }
    
    display(i) {
        if(this.startMinutes < 10 && i == 0) {
            console.log("Start time: " +  `${this.startHours}:` + "0" + `${this.startMinutes}`);
        } else if (this.endMinutes < 10 && i == 1) {
            console.log("End time: " +  `${this.endHours}:` + "0" + `${this.endMinutes}`);
        } 
    }

    getTime() {

        if(this.i == 0) {
            this.startHours = this.hours;
            this.startMinutes = this.minutes;
            //this.startSeconds = this.seconds;
            //this.display(this.i);
            //console.log("Start time: " +  `${this.startHours}:` + "0" + `${this.startMinutes}`);
            if(this.startMinutes < 10 && this.i == 0) {
                console.log("Start time: " +  `${this.startHours}:` + "0" + `${this.startMinutes}`);
            } else {
                console.log("Start time: " + `${this.startHours}:${this.startMinutes}`);
            }

        } else if(this.i == 1) {

            this.endHours = this.hours;
            this.endMinutes = this.minutes;
            //this.endSeconds = this.seconds;
            
            if(this.endMinutes < 10 && this.i == 0) {
                console.log("End time: " +  `${this.endHours}:` + "0" + `${this.endMinutes}`);
            } else {
                console.log("End time: " + `${this.endHours}:${this.endMinutes}`);
            }

            //this.display(this.i);
            this.calculateTimeDifference([this.startHours, this.startMinutes], [this.endHours, this.endMinutes]); 
            console.log("Total Runtime: " + `${this.runtime} Minute(s)`);

        } else {
            console.log("Time already logged.");
            console.log(`Runtime was: ${this.runtime}`);
        }

        this.i++;
    }
}

const time = new Time();

time.updateTime();
time.getTime();
connectDB();


process.stdin.on('keypress', async (chunk, key) => {
    if(key && key.name == 'l') {
        time.updateTime();
        time.getTime();
        await dbQuery([{runtime: time.runtime, month: month, day: day, year: year}]);
        disconnectDB();
    }
});


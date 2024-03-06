//TO-DO:
//    -Add type annotations
//    -Add error handling in case of failure
//    -Create a DB handling class, with connectDB method ommited
//    -create type definitions for Time class (DONE)
//    -create interface for Time class (DONE)

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

interface Time {
    private i: Number;
    
    //variables holding calculations for runtime
    private startHours: Number;
    private startMinutes: Number;
    private endHours: Number;
    private endMinutes: Number;
    
    //storage for total runtime
    private runtime: Number;
    
    //holds queries from date class
    private hours: Number;
    private minutes: Number;

    public updateTime(): void;
    private convertToMinutes(): void;
    private calculateTimeDifference(): void;
    private display(): void;
    public getTime(): void;
    
}

class Time {
    
    //This is used as a counter for getTime()
    //getTime is run each time a user sends input (startup and end)
    //when the counter is = 2, a third request will not be able to be made
    private i: Number = 0;
    
    //variables holding calculations for runtime
    private startHours: Number = 0;
    private startMinutes: Number = 0;
    private endHours: Number = 0;
    private endMinutes: Number = 0;
    
    //storage for total runtime
    private runtime: Number = 0;
    
    //holds queries from date class
    private hours: Number = 0;
    private minutes: Number = 0;

    constructor() {

        this.i = 0;

        this.startHours = 0;
        this.startMinutes = 0;

        this.endHours = 0;
        this.endMinutes = 0;

        this.runtime = 0;

        this.hours = 0;
        this.minutes = 0;
    }

    updateTime() {
        const date = new Date();
        //this.hours = date.getHours();
        if (date.getHours() < 12) {
            this.hours = date.getHours();
        } else if (date.getHours() > 12) {
            //This is to account for date class returning time
            //in a 24 hour format
            this.hours = date.getHours() - 12;
        }
        this.minutes = date.getMinutes();
    }

    //globalize function since it is utility
    convertToMinutes(hours, minutes) {
        let hoursInMinutes = hours * 60;
        return  hoursInMinutes + minutes;
    }

    calculateTimeDifference(start: Number, finish: Number) {
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


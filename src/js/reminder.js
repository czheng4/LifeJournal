const months = {  
	"Jan": "1",
	"Feb": "2",
	"Mar": "3",
	"Apr": "4",
	"May": "5",
	"Jun": "6",
	"Jul": "7",
	"Aug": "8",
	"Sep": "9",
	"Oct": "10",
	"Nov": "11",
	"Dec": "12",
};


class Reminder
{
	constructor()
	{
		this.startTime = "";
		this.endTime = "";
		this.title = "";
		this.description = "";
		
		this.startTimeMilliseconds = 0;
		this.endTimeMilliseconds = 0;
	}
	/* 'Wed, Nov 20, 2019   10:23 PM' to date(yyyy,mm,dd,hour, minute). */
	timeSplit(type)
	{
		let time;
		let hourMinute;
		let date;
		let year, month,day,hour,minute;
		if(type == "startTime") time = this.startTime.replace(/,/g," ");
		else if(type == "endTime") time = this.endTime.replace(/,/g," ");
		else return;

		time = time.replace(/\s+/g," ");
		time = time.split(" ");
		year = parseInt(time[3]);
		month = parseInt(months[time[1]]);
		day = parseInt(time[2]);
		
		hourMinute = time[4];
		hourMinute = hourMinute.split(":");
		hour = parseInt(hourMinute[0]);
		minute = parseInt(hourMinute[1]);

		if(time[5] == "AM" && hour == 12) hour -= 12;
		if(time[5] == "PM" && hour != 12) hour += 12;
		
	
		date = new Date(year, month - 1, day, hour, minute);
		if(type == "startTime") this.startTimeMilliseconds = date.getTime();
		else this.endTimeMilliseconds = date.getTime();

		console.log(date);
		console.log(date.getTime());
			
	}
}


module.exports = {
	Reminder:Reminder
}
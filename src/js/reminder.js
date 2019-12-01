/*
    reminder.js
    ChaoHuiZheng
    11/21/2019

    This lib is for filling out all infor we need for reminder.
    This lib is for reading reminder from files and write reminder to the files.

    I have to make the member function static as when we use .send to share the same object, It won't keep the member function.

*/



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
const alarmDictMilliseconds = {
	"At time of event":0,
	"5 minutes before": 300000,
	"10 minutes before": 600000,
	"15 minutes before": 900000,
	"20 minutes before": 1.2e+6,
	"25 minutes before": 1.5e+6,
	"30 minutes before":1.8e+6,
	"1 hour before": 3.6e+6,
	"2 hours before":7.2e+6,
	"1 day before": 8.64e+7,
	"2 days before": 1.728e+8,
	"1 week before":6.048e+8,
};

const weekToNumber = {
	"Sun.": 0,
	"Mon.": 1,
	"Tue.": 2,
	"Wed.": 3,
	"Thu.": 4,
	"Fri.": 5,
	"Sat.": 6,
}
/* turn date object to a string(yyyy-mm-dd)*/
function getDateString(date)
{
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let day = date.getDate();
	let content = "";

	content += year;
	if(month < 9) content += "-0" + month;
	else content += "-" + month;

	if(day < 9) content += "-0" + day;
	else content += "-" + day;
	return content;
	
}
class Reminder
{
	constructor()
	{


		/*
			date is yyyy-mm-dd
			startTime and endTime is "week, month day, yerar hour:minute AM/PM" (e.g "Sun, Nov 24, 2019 7:11 PM")
			title is the title of reminder
			repeatText is the text of repeat.
			alarmText is all the texts of alarm and each alram is seperated by ','.
			alarmTime is the time in millsencond before the event happens and each time is seperated by ','
			startTimeMilliseconds is when the event start to happens.
			endTimeMilliseconds is when the event ends.
			startTimeHourMinute store the hour and minute of starting time with the format of "hour:minute"
	
		*/
		this.date = "";
		this.startTime = "";
		this.endTime = "";
		this.title = "";
		this.description = "";
		this.repeatText = "";
		this.alarmText = "";
		this.startTimeHourMinute = "";

		this.alarmTime = "";
		this.startTimeMilliseconds = 0;
		this.endTimeMilliseconds = 0;


		/*
			frequecy is how often this event happens(frequency = 1 for every 1 week, month, frequency = 2 for every 2 weeks ...)
			repeatType can be 'n'(never),'w'(week),'y'(year),'m'(month),'d'(day),'c'(custom)
			week is set when repeatType = 'w'. week stores the day of the week in number(Sunday is 0, Monday is 1 and so on).
			effectiveType can be 'F'(forever), 'N'(for a number of event) and 'U'(until a date)
			effectiveData is empty when effectiveType = 'n', effectiveData = 'date' and effectiveData = 'U', effectiveData = NUMBER when effectiveType = 'N'.

		*/
		this.frequency = 0;
		this.repeatType;
		this.week = "";

		this.effectiveType = "";
		this.effectiveData = "";

		/* filenmae is where we store this reminder */
		this.filePath = "";


		/* vitually delete this reminder */
		this.isdeleted = false;
		this.isSchedule = false;
		
	}


	/* 
		split the string 'Wed, Nov 20, 2019   10:23 PM' to get date(yyyy,mm,dd,hour, minute) to get millsenconds. 
	*/
	static timeSplit(reminder,type)
	{
		let time;
		let hourMinute;
		let date;
		let year, month,day,hour,minute;
		if(type == "startTime") time = reminder.startTime.replace(/,/g," ");
		else if(type == "endTime") time = reminder.endTime.replace(/,/g," ");
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
		if(type == "startTime") 
		{
			reminder.startTimeMilliseconds = date.getTime();
			if(hour < 10) reminder.startTimeHourMinute = '0' + hour + ':';
			else reminder.startTimeHourMinute = hour + ':';

			if(minute < 10) reminder.startTimeHourMinute += '0' + minute;
			else reminder.startTimeHourMinute += minute;
		}
		else reminder.endTimeMilliseconds = date.getTime();
	
		//console.log(date);
		//console.log(this.startTimeMilliseconds);
			
	}

	/* set alarmTime. The unit is millsenconds and it's seperated by ',' 
	   alarmDict is a dict whose key is on string, val is bool (true means the alarm is added).
	*/
	static setAlarm(reminder,alarmDict)
	{

		/*  We have to trigger the alarm further away from the starting time. so I sorted the keys in reverse order */
		
		let alarmTime = "";
		let keys = Object.keys(alarmDict).reverse();
		let firstAlarm = true;

		reminder.alarmText = "";
		reminder.alarmTime = "";
		for(var i = 0; i < keys.length; i++)
		{
			if(alarmDict[keys[i]] == 1) 
			{
				if(firstAlarm == true) 
				{
					reminder.alarmText += keys[i];
					alarmTime += alarmDictMilliseconds[keys[i]];
					firstAlarm = false;
				}
				else 
				{
					alarmTime += "," + alarmDictMilliseconds[keys[i]];
					reminder.alarmText += "," + keys[i];
				}
			}
		}
		console.log(reminder.alarmText);
		
		reminder.alarmTime = alarmTime;
		console.log(reminder.alarmTime);
		
	}

	/* 
	   set week array. 
	   Sun. represents 0, Mon. represent 1 and so on. 
		
	*/
	static setRepeat(reminder,repeatString)
	{
		reminder.repeatText = repeatString;
		reminder.week = "";
		let frequency;
		let isFirst = false;
		let arr;
		if(repeatString == "Never") 
		{

			reminder.date = getDateString(new Date(reminder.startTimeMilliseconds));
			console.log(reminder.date);
			reminder.repeatType = 'n';
			return;
		}
		
		arr = repeatString.split(" ");

		reminder.frequency =  arr[1];
		reminder.repeatType = arr[2][0];

		for(var i = 4; i < arr.length; i++) 
		{
			if(arr[i] == "For" || arr[i] == "Until") break;
			if(isFirst == false) 
			{
				isFirst = true;
				reminder.week += weekToNumber[arr[i]];
			}
			else reminder.week += "," + weekToNumber[arr[i]];
		}
		if(reminder.repeatType == 'w' && arr.length >= 4)
		{	

			let date = new Date(reminder.startTimeMilliseconds);

			/* offset of date */
			reminder.startTimeMilliseconds  += ( parseInt(reminder.week[0]) - date.getDay() ) * 1000 * 60 * 60 * 24;
			reminder.endTimeMilliseconds += ( parseInt(reminder.week[0]) - date.getDay() ) * 1000 * 60 * 60 * 24;
		}  
		reminder.date = getDateString(new Date(reminder.startTimeMilliseconds))
	}

	/* set effective type and data */
	static setEffective(reminder,effectiveString)
	{
		let arr = effectiveString.split(" ");

		if(effectiveString.indexOf("Forever") != -1) reminder.effectiveType = 'F';
		else if(effectiveString.indexOf("Until") != -1) 
		{
			reminder.effectiveType = 'U';
			reminder.effectiveData = arr[arr.length - 1];
		}
		else
		{
			reminder.effectiveType = 'N';
			reminder.effectiveData = arr[1];
		}
	}

	/* write to files */
	static writeToFile(reminder,filePath)
	{

		var f = new File(filePath);
		var content = "";
		reminder.filePath = filePath;

		content += reminder.title;
		
		content += "REMINER_ZCH";
		content += reminder.startTime;

		content += "REMINER_ZCH";
		content += reminder.endTime;

		content += "REMINER_ZCH";
		content += reminder.alarmText;

		content += "REMINER_ZCH";
		content += reminder.description;

		content += "REMINER_ZCH";
		content += reminder.repeatText;

		content += "REMINER_ZCH";
		content += reminder.frequency;

		content += "REMINER_ZCH";
		content += reminder.repeatType;

		content += "REMINER_ZCH";
		content += reminder.week;

		content += "REMINER_ZCH";
		content += reminder.effectiveType;

		content += "REMINER_ZCH";
		content += reminder.effectiveData;

		content += "REMINER_ZCH";
		content += reminder.startTimeMilliseconds;

		content += "REMINER_ZCH";
		content += reminder.endTimeMilliseconds;

		content += "REMINER_ZCH";
		content += reminder.date;

		content += "REMINER_ZCH";
		content += reminder.filePath;

		content += "REMINER_ZCH";
		content += reminder.startTimeHourMinute;

		content += "REMINER_ZCH";
		content += reminder.alarmTime;

		f.write(content);
	}


	/* read from files */
	static readFromFile(reminder,filePath)
	{
		var {File} = require("../js/file.js");
		let f = new File(filePath);
		let arr = f.readBySeparator("REMINER_ZCH");
		
		reminder.title = arr[0];
		reminder.startTime = arr[1];
		reminder.endTime = arr[2];
		reminder.alarmText = arr[3];
		reminder.description = arr[4];
		reminder.repeatText = arr[5];
		reminder.frequency = parseInt(arr[6]);
		reminder.repeatType = arr[7];
		reminder.week = arr[8];
		reminder.effectiveType = arr[9];
		reminder.effectiveData = arr[10];
		reminder.startTimeMilliseconds = parseInt(arr[11]);
		reminder.endTimeMilliseconds = parseInt(arr[12]);
		reminder.date = arr[13];
		reminder.filePath = arr[14];
		reminder.startTimeHourMinute = arr[15];
		reminder.alarmTime = arr[16];
	}

	/* get reminder array */
	static getReminders(dir)
	{	
		
		var reminderArray = [];
		var reminder;
		var files = fs.readdirSync(dir);
	
		for(var i = 0; i < files.length; i++)
		{
			reminder = new Reminder();
			Reminder.readFromFile(reminder,dir + "/" + files[i]);
			reminderArray.push(reminder);
		}
		reminderArray = reminderArray.sort(function(r1,r2){
			if(r1.date == r2.date) return (r1.startTimeHourMinute > r2.startTimeHourMinute)? 1 : -1;
			else return (r1.date > r2.date)? 1:-1;
		});
	
		return reminderArray;
	}
	
	static addToReminders(reminderArray, reminder)
	{
		var myDate = reminder.date; 
		var tempDate;
		var start = 0;
		var end = reminderArray.length - 1;
		var middle;
		var index;
	
		/* binary search to add it to reminder array */
		while(start <= end)
		{
			//console.log(start + " " + end);
			middle = Math.floor((start + end) / 2);
			tempDate = reminderArray[middle].date;
			if(tempDate == myDate) 
			{
				index = middle;
				
				while((index - 1) >= 0 && reminderArray[index - 1].date == myDate) index--; 
				
				while(index <= end && reminderArray[index].date == myDate)
				{
					if(reminderArray[index].startTimeHourMinute < reminder.startTimeHourMinute) index++;
					else break;
				}
				break;
			}
			else if(tempDate < myDate) start = middle + 1;
			else end = middle - 1;
		}

		if(start > end) index = start;

		reminderArray.splice(index,0,reminder);
		return index;
	}

	static findReminder(reminderArray,reminder)
	{
		var myDate = reminder.date; 
		var tempDate;
		var start = 0;
		var end = reminderArray.length - 1;
		var middle;
		var index;
		var filePath = reminder.filePath;
	
		/* binary search to find where the reminder is in the reminderArray */
		while(start <= end)
		{
			middle = Math.floor((start + end) / 2);
			tempDate = reminderArray[middle].date;
			if(tempDate == myDate) 
			{
				index = middle;

				while(index >= 0 && myDate == reminderArray[index].date) 
				{
					if(filePath == reminderArray[index].filePath) return index;
					else index--;
				}
				index = middle + 1;
				while(index <= end && reminderArray[index].date == myDate)
				{
					if(filePath == reminderArray[index].filePath) return index;
					else index++;
				}
				return -1;
			}
			else if(tempDate < myDate) start = middle + 1;
			else end = middle - 1;
		}

		return -1;
	}
	static deleteFromReminderArray(reminderArray,reminder)
	{
		let index = Reminder.findReminder(reminderArray,reminder);
		if(index != -1) reminderArray[index].isdeleted = true;

	}
	static changeFromReminders(reminderArray,reminder)
	{
		let index = Reminder.findReminder(reminderArray,reminder);
		if(index != -1) 
		{
			reminderArray[index] = reminder;
			reminderArray[index].isSchedule = false;
		}
		
	}

	/* get the reminder dictionary */
	static getRemindersDict(reminderArray)
	{
		//var reminderArray = getReminders(dir);
		var dict = {};
		var reminder;
		for(var i = 0; i < reminderArray.length; i++)
		{
			reminder = reminderArray[i];
			if(reminder.date in dict) dict[reminder.date].push(reminder);
			else dict[reminder.date] = [reminder];
		}
		return dict;
	}
	
	/* return true when we can mark the reminder */
	static isMarkOnCalendar(date, reminder)
	{
		/* 
			dayDifference is how many days pass between date and reminder date.
			frequency is the number of times repeating.
		*/
		let dayDifference = date.getTime() - reminder.startTimeMilliseconds + 86400000 - 1;
		let frequency = reminder.frequency;
		let reminderDate = new Date(reminder.startTimeMilliseconds);
		let monthDifference;
		let week;
	
		/* date is before the reminder */
		if(dayDifference < 0) return false;
	
		/* Until a specific date */
		if(reminder.effectiveType == "U" && getDateString(date) > reminder.effectiveData) return false; 
		
	
		dayDifference = Math.floor(dayDifference / 86400000);
		
		/* never repeat */
		if(reminder.repeatType == 'n') // "Nerver"
		{
			if(dayDifference == 0) return true;
			else return false;
		}
	
		/* evert ? days. ? means positive number */
		if(reminder.repeatType == 'd')
		{
			if(dayDifference % frequency == 0) 
			{
				if(reminder.effectiveType == "N") // For a number of event 
				{
					if(dayDifference / frequency < parseInt(reminder.effectiveData)) return true;
				}
				else return true;
			}
			
			return false;
		}
	
		/* repeat ? year */
		if(reminder.repeatType == 'y')
		{	
	
			if((date.getFullYear() - reminderDate.getFullYear()) % frequency == 0)
			{
				/* they must have same day and month */
				if(date.getMonth() == reminderDate.getMonth() && date.getDate() == reminderDate.getDate())
				{
					if(reminder.effectiveType == "N")
					{
						if((date.getFullYear() - reminderDate.getFullYear()) / frequency < parseInt(reminder.effectiveData)) return true;
					}
					else return true;
				}
			}
			return false;
		}
	
		/* evert ? month */
		if(reminder.repeatType == 'm')
		{	
			monthDifference = (date.getFullYear() - reminderDate.getFullYear()) * 12;
			monthDifference += date.getMonth() - reminderDate.getMonth();
			if(monthDifference % frequency == 0)
			{
				/* same day */
				if(date.getDate() == reminderDate.getDate()) 
				{
					if(reminder.effectiveType == "N")
					{
						if( monthDifference / frequency < parseInt(reminder.effectiveData)) return true;
					}
					else return true;
				}
			}
			return false;
		}
	
		/* every ? week (on Mon. Tue. and so on) */
		if(reminder.repeatType == 'w')
		{
			let num_reminders = 0;
			let total = parseInt(reminder.effectiveData);
			/*
			if((dayDifference % (7 * frequency) == 0)) return true;
			*/
			/* create week that stores interger */
			if(reminder.week == "") week = [0];
			else week = reminder.week.split(",").map(function(element){ return parseInt(element); });
			
			num_reminders = Math.floor(dayDifference / (7 * frequency)) * week.length;
	
			//if(num_reminders > total) return false;
	
			for(var i = 0; i < week.length; i++)
			{
				if(num_reminders >= total) return false;
				num_reminders++;
				if(( dayDifference % (7 * frequency))  ==  (week[i] - week[0]) ) return true;
			}
			return false;
		}
	}
}


module.exports = {
	Reminder:Reminder,
	getDateString:getDateString
}

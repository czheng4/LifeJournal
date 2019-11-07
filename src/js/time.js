/*
	time.js
	ChaoHuiZheng
	10/12/2019

	This lib is for sorting the files and move files keeping the same timestamp.
*/


const fs = require("fs")

/* 
	timeStamp stores:
		name => fileName
		data => Date object
		year => yyyy
		month => mm/m
		day => dd/d
		stringDate => yyyy-mm-dd
		time => the time in decimal number
*/
class timeStamp
{
	constructor(date,name)
	{
		let stringDay, stringMonth;
		this.date = date;
		this.name = name;
		this.year = date.getFullYear();
		this.month = date.getMonth() + 1;
		this.day = date.getDate();
		if(this.day < 10) stringDay = "0" + this.day;
		else stringDay = this.day;

		if(this.month < 10) stringMonth = "0" + this.month;
		else stringMonth = this.month;
		this.stringDate = this.year + "-" + stringMonth + "-" + stringDay;
		this.time = date.getTime();
	}
	
}
/* return an array of files sorted by the time */
function getSortedFiles(dir,files)
{
	if(files.length == 0) return [];
	return files.sort(function(t1,t2) { return fs.statSync(dir + t1).mtime.getTime() - fs.statSync(dir + t2).mtime.getTime(); });
}

/* return the timeStamps array in the ascending order */
function sortFilesByTime(dir,files)
{
	if(files.length == 0) return [];
	return files.map(function(f) { 
                 return  new timeStamp(fs.statSync(dir + f).mtime,f);        
          	})
           	.sort(function(t1, t2) { return t1.time - t2.time; })
}

/* The timestamps is an array.
   retrun a dict where key is the time("yyyy-mm-dd") and val is the array of timeStamp whose stringDate is key.
*/
function getDictByTime(timeStamps)
{
	if(timeStamps.length == 0) return {};
	var dict = {};
	var timeStamp;
	for(var i = 0; i < timeStamps.length; i++)
	{	
		timeStamp = timeStamps[i];
		if(!(timeStamp.stringDate in dict)) dict[timeStamp.stringDate] = []
		dict[timeStamp.stringDate].push(timeStamp);
	}
	return dict
}

/* move a file without changing the timestamp */
function mvFileKeepTimeStamp(from,to)
{
	var date = fs.statSync(from).mtime
	fs.renameSync(from, to);
	fs.open(to, (err,fd)=>{
		fs.futimesSync(fd, date, date);
	})
	
}


module.exports = {
	timeStamp:timeStamp,
	sortFilesByTime:sortFilesByTime,
	getDictByTime:getDictByTime,
	mvFileKeepTimeStamp:mvFileKeepTimeStamp

}


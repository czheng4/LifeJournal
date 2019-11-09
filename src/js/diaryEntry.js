/*
	diaryEntry.js
	ChaoHuiZheng
	10/23/2019
	
	This lib is for storing the info from textbox: title, text, date.
	This lib also sort the diary entry by the date.
*/




/* import from "js" directory
const {Cryptography} = require("../js/cryptography.js");
var {File} = require("../js/file.js");
*/
const fs = require("fs");
const {Cryptography} = require("./Cryptography.js");
var {File} = require("./file.js");

var months = {  
	"01": "Jan.",
	"02": "Feb.",
	"03": "Mar.",
	"04": "Apr.",
	"05": "May",
	"06": "Jun.",
	"07": "Jul.",
	"08": "Aug.",
	"09": "Sep.",
	"10": "Oct.",
	"11": "Nov.",
	"12": "Dec."
};

class diaryEntry
{
	constructor(filePath)
	{
		if(filePath == null)
		{
			return;
		}
		let f = new File(filePath);
		console.log(f.read());
		let arr = f.readBySeparator("TITLE_ENTRY_DATE_PHOTO:");
		let ymd = arr[2].split("-"); // year month day
		
		this.filePath = filePath;
		this.title = arr[0];
		this.entry = arr[1];
		this.date = arr[2];
		if(arr[3] == "|,|") this.photo = [];
		else this.photo = arr[3].split(["|,|"]);
		this.index = -1;   // keep track of where it belongs in the array of diaryEntries.
		/* split the date to year, month and day*/
		this.year = ymd[0];
		this.month = months[ymd[1]];
		this.day = ymd[2];
		this.isdeleted = false;
	}

}


/* add one diary entry to sorted diaryEntries array 
   return the position of where we add it.
*/
function addDiaryEntry(diaryEntries, filePath)
{
	var myDiaryEntry = new diaryEntry(filePath);
	var myDate = myDiaryEntry.date; 
	var tempDate;
	var start = 0;
	var end = diaryEntries.length - 1;
	var middle;
	var index;
	/* binary search */
	while(start <= end)
	{
		console.log(start + " " + end);
		middle = Math.floor((start + end) / 2);
		tempDate = diaryEntries[middle].date;
		if(tempDate == myDate) 
		{
			index = middle;
			break;
		}
		else if(tempDate < myDate) start = middle + 1;
		else end = middle - 1;
	}

	if(start > end) index = start;

	diaryEntries.splice(index,0,myDiaryEntry);
	return index;
}

/* return sorted array of diaryEntries */
function getDiaryEntry(dir)
{
	var diaryEntries = [];
	files = fs.readdirSync(dir);

	for(var i = 0; i < files.length; i++)
	{
		diaryEntries.push(new diaryEntry(dir + "/" + files[i]));
	}
	diaryEntries = diaryEntries.sort(function(d1,d2){return (d1.date > d2.date)? 1:-1;});

	return diaryEntries;
}

/* return a dict where key is date(yyyy-mm-dd) and val is diaryEntry object array */
function getDiaryEntryDict(dir)
{
	var diaryEntries = getDiaryEntry(dir);
	var dict = {};
	var entry;
	for(var i = 0; i < diaryEntries.length; i++)
	{
		entry = diaryEntries[i];
		entry.index = i;
		if(entry.date in dict) dict[entry.date].push(entry);
		else dict[entry.date] = [entry];
	}
	return dict;
}

function storeDiaryEntryTofFile(filename,diaryEntry){
	var f = new File(filename);
	var photo = diaryEntry.photo;
	content = "";

	content += diaryEntry.title;

    content += "TITLE_ENTRY_DATE_PHOTO:"
    content += diaryEntry.entry;

    content += "TITLE_ENTRY_DATE_PHOTO:"
    content += diaryEntry.date;

    content += "TITLE_ENTRY_DATE_PHOTO:"
            
    for(var i = 0; i < photo.length - 1; i++)
    {
        content += photo[i] + "|,|";    // "|,|" is a seperator i choose as i think it won't be part of file name.
    }
    if(photo.length != 0) content += photo[photo.length - 1];
    else content += "|,|";

    f.write(content);
}


module.exports = {
	diaryEntry:diaryEntry,
	getDiaryEntry:getDiaryEntry,
	months:months,
	storeDiaryEntryTofFile:storeDiaryEntryTofFile,
	getDiaryEntryDict:getDiaryEntryDict,
	addDiaryEntry
}





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
		let filename;
		//console.log(f.read());
		let arr = f.readBySeparator("TITLE_ENTRY_DATE_PHOTO:");
		let ymd = arr[2].split("-"); // year month day
		
		filename = filePath.split('/');
		this.filePath = filePath;
		this.title = arr[0];
		this.entry = arr[1];
		this.date = arr[2];
		if(arr[3] == "|,|") this.photo = [];
		else this.photo = arr[3].split(["|,|"]);

		this.indexOfWindow = parseInt(filename[filename.length - 1]); 
		this.indexOfArray = -1; // keep track of where it belongs in the array of diaryEntries.
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
function addToDiaryEntry(diaryEntries, myDiaryEntry)
{
	var myDate = myDiaryEntry.date; 
	var tempDate;
	var start = 0;
	var end = diaryEntries.length - 1;
	var middle;
	var index;
	
	/* binary search to add it to diaryEntries array */
	while(start <= end)
	{
		//console.log(start + " " + end);
		middle = Math.floor((start + end) / 2);
		tempDate = diaryEntries[middle].date;
		if(tempDate == myDate) 
		{
			index = middle;
			
			while((index + 1) <= end && diaryEntries[index + 1].date == myDate) index++;
			index++;
			//console.log(index);
			break;
		}
		else if(tempDate < myDate) start = middle + 1;
		else end = middle - 1;
	}

	if(start > end) index = start;

	diaryEntries.splice(index,0,myDiaryEntry);
	return index;
}

function findDiaryEntry(diaryEntries, myDiaryEntry)
{
	var myDate = myDiaryEntry.date; 
	var tempDate;
	var start = 0;
	var end = diaryEntries.length - 1;
	var middle;
	var index;
	var indexOfWindow = myDiaryEntry.indexOfWindow;
	/* reakinary search to add it to diaryEntries array */
	while(start <= end)
	{
		//console.log(start + " " + end);
		middle = Math.floor((start + end) / 2);
		tempDate = diaryEntries[middle].date;
		if(tempDate == myDate) 
		{
			index = middle;
			while(myDate == diaryEntries[index].date) 
			{
				if(indexOfWindow == diaryEntries[index].indexOfWindow) return index;
				else index--;
			}
			index = middle + 1;
			while(myDate == diaryEntries[index].date) 
			{
				if(indexOfWindow == diaryEntries[index].indexOfWindow) return index;
				else index++;
			}
			return -1;

		}
		else if(tempDate < myDate) start = middle + 1;
		else end = middle - 1;
	}

	return -1;
}

function addToDiaryEntryDict(diaryEntryDict, myDiaryEntry)
{
	var myDate = myDiaryEntry.date;

	if(myDate in diaryEntryDict) diaryEntryDict[myDate].push(myDiaryEntry);
	else diaryEntryDict[myDate] = [myDiaryEntry];

}

function deleteFromDiaryEntryDict(diaryEntryDict,myDiaryEntry)
{
	let date = myDiaryEntry.date;
	
	for(var i = 0; i <  diaryEntryDict[date].length; i++)
	{
		if(diaryEntryDict[date][i].indexOfWindow == myDiaryEntry.indexOfWindow) 
		{
			diaryEntryDict[date][i].isdeleted = true;
			break;
		}
	}
}

function changeFromDiaryEntry(diaryEntries,myDiaryEntry,oldDiaryEntry)
{
	if(oldDiaryEntry.date == myDiaryEntry.date) 
	{
		diaryEntries[oldDiaryEntry.indexOfArray] = myDiaryEntry;
		return -1;
	}
	else
	{
		diaryEntries[oldDiaryEntry.indexOfArray].isdeleted = true;
		return addToDiaryEntry(diaryEntries, myDiaryEntry);
	}
}
function changeFromDiaryEntryDict(diaryEntryDict,myDiaryEntry, oldDiaryEntry)
{
	let date = myDiaryEntry.date;
	if(oldDiaryEntry.date == myDiaryEntry.date)
	{
		for(var i = 0; i <  diaryEntryDict[date].length; i++)
		{
			if(diaryEntryDict[date][i].indexOfWindow == myDiaryEntry.indexOfWindow) 
			{
				diaryEntryDict[date][i] = myDiaryEntry;
				break;
			}
		}
	}
	else
	{
		deleteFromDiaryEntryDict(diaryEntryDict,oldDiaryEntry);
		addToDiaryEntryDict(diaryEntryDict,myDiaryEntry);
	}
}
/* return sorted array of diaryEntries */
function getDiaryEntry(dir)
{
	var diaryEntries = [];
	var entry;
	files = fs.readdirSync(dir);
	files = files.sort(function(f1,f2){return parseInt(f2) - parseInt(f1);})
	for(var i = 0; i < files.length; i++)
	{
		entry = new diaryEntry(dir + "/" + files[i]);
		
		diaryEntries.push(entry);
	}
	diaryEntries = diaryEntries.sort(function(d1,d2){return (d1.date > d2.date)? 1:-1;});

	return diaryEntries;
}

/* return a dict where key is date(yyyy-mm-dd) and val is diaryEntry object array */
function getDiaryEntryDict(diaryEntries)
{
	var dict = {};
	var entry;

	for(var i = 0; i < diaryEntries.length; i++)
	{
		entry = diaryEntries[i];
		
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
	addToDiaryEntry:addToDiaryEntry,
	addToDiaryEntryDict:addToDiaryEntryDict,
	deleteFromDiaryEntryDict:deleteFromDiaryEntryDict,
	changeFromDiaryEntryDict:changeFromDiaryEntryDict,
	findDiaryEntry:findDiaryEntry,
	changeFromDiaryEntry:changeFromDiaryEntry
}





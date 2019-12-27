/*
    calendar.js
    ChaoHuiZheng
    11/05/2019
*/

/* 
    currentYear is year
    currentMonth is month
    daySelector hold the previous selector with what we clicked on calendar.
*/
const months = {  
    1: "Jan.",
    2: "Feb.",
    3: "Mar.",
    4: "Apr.",
    5: "May",
    6: "Jun.",
    7: "Jul.",
    8: "Aug.",
    9: "Sep.",
    10: "Oct.",
    11: "Nov.",
    12: "Dec."
};
const $ = require("jQuery");
const remote = require('electron').remote;
const calendarThread = require('electron').ipcRenderer;
const {addToDiaryEntryDict,deleteFromDiaryEntryDict,changeFromDiaryEntryDict} = require("../js/diaryEntry.js");
const {Reminder,getDateString} = require("../js/reminder.js");
const fs = require("fs");
const user = remote.getGlobal('share').user;  
const path = "./data/" + user + "/entry"; 
const {changeThemeMode, loadThemeMode} = require("../js/theme.js");
loadThemeMode();

var currentYear;
var currentMonth;
var currentDate;  // yyyy-mm-dd
var daySelector = null; 
var diaryEntryDict = remote.getGlobal('share').diaryEntryDict;
var reminderDict = {}
var reminderArray;
var slot_width;
var markDay = remote.getGlobal('share').markDay;

const dot = "&#8226";

function load()
{
    var type = remote.getGlobal('share').calendarType;
    if(type == "MONTH")
    {
        $(".MONTH").css("display","table-row-group");
        $(".SCHEDULE").css("display","none");
    }
    else if(type == "SCHEDULE")
    {
        $(".MONTH").css("display","none");
        $(".SCHEDULE").css("display","table-row-group");
    }
}
/* milliseconds to the format of string n1 days n2 hours and n3 minutes */
function millisecondsToString(time)
{
    const millisecondsHour = 1000 * 60;
    
    let minute = parseInt(time / (1000 * 60));
    let hour = parseInt(minute / 60);
    let day = parseInt(hour / 24);
    let rv = "";
    minute = minute - hour * 60;
    hour = hour - day * 24;

    if(day <= 1) rv += day + " day ";
    else rv += day + " days ";

    if(hour <= 1) rv += hour + " hour ";
    else rv += hour + " hours ";

    if(minute <= 1) rv += minute + " minute";
    else rv += minute + " minutes";

    return rv;

}
function showCalendar(year, month, markDay = null)
{
    currentMonth = month;
    currentYear = year;
    reminderDict = {};
    const date = new Date(year, month - 1, 32);
    const num_days = 32 - date.getDate();
    const day = (new Date(year,month - 1,1)).getDay();
    const num_weeks = 1 + Math.ceil((num_days - (7 - day)) / 7);
    
    var calendar = "";
    var days_array = [];
    var stringDate;
    var tempDate;
    if(month < 10) stringDate = year + "-0" + month + "-";
    else stringDate = year + "-" + month + "-";
    for(var i = 0; i < day; i++) days_array.push("");
    for(var i = 1; i <= num_days; i++) days_array.push(i.toString());
    for(var i = day + num_days; i < 7 * num_weeks; i++) days_array.push("");
    


    for(var i = 0; i < num_weeks; i++)
    {

        calendar += "<tr style = \"cursor: pointer\">\n"
        for(var j = 0; j < 7; j++)
        {
            let d = days_array[i*7 + j];
            if(d.length == 0) tempDate = "";
            if(d.length == 1) tempDate = stringDate + "0" + d;
            if(d.length == 2) tempDate = stringDate + d;

            if(markDay != null && tempDate == markDay) calendar += '<th id = "markDay" style = "background-color:#f5f8d7; color:black" name = "' + tempDate + '">' + days_array[i*7 + j] + "<div class = \"slot\">";
            else  calendar += '<th name = "' + tempDate + '">' + days_array[i*7 + j] + "<div class = \"slot\">";
            
            if(tempDate in diaryEntryDict)
            {   
                
                for(var k = 0; k < diaryEntryDict[tempDate].length; k++)
                {
                    if(diaryEntryDict[tempDate][k].isdeleted == false) calendar += "<div class = \"diaryBox\" >" + diaryEntryDict[tempDate][k].title + "</div>";
                }
            }

            if(tempDate != "")
            {
                for(var k = 0; k < reminderArray.length; k++)
                {
                    if(reminderArray[k].isdeleted == true) continue;
                    if(Reminder.isMarkOnCalendar(new Date(tempDate.replace(/-/g,"/")), reminderArray[k]))
                    {
                        calendar += "<div class = \"reminderBox\" >" + reminderArray[k].title + "</div>";
                        if(tempDate in reminderDict) reminderDict[tempDate].push(reminderArray[k]);
                        else reminderDict[tempDate] = [reminderArray[k]];
                    }
                }
            }
            calendar += "</div>";
            calendar += "</th>\n";
            
        }
        calendar += "</tr>\n"
        
    }
    
    $("#calendar").text("");
    $("#calendar").append(calendar);
    $("#title").text(months[month] + "  " + year);
}
function markToday()
{
    var date = new Date();
   
    if(markDay == null) markDay = getDateString(date);
    showCalendar(date.getFullYear(),date.getMonth() + 1, markDay);
    showReminderDiary(markDay);
    currentDate = markDay;
    $(".slot").css("width", slot_width);

}


function showReminderDiary(date)
{   
    content  = "";
    $("#diaryAndReminder").text("");
    if(date != undefined && date in diaryEntryDict) 
    {
        entryArray = diaryEntryDict[date];
        for(i = 0; i < entryArray.length; i++)
        {
            console.log(entryArray[i].isdeleted)
            if(entryArray[i].isdeleted == false) content +=  '<div name = "' + date + '&' + i + '&D' + '"><span class = "diaryDot">&#8226;</span>\
                         <span class = "diaryTitle">' + entryArray[i].title + '</span></div>\n';
        }
       
    }
    console.log(reminderDict)
    console.log(date)

    if(date in reminderDict)
    {
        for(var i = 0; i < reminderDict[date].length; i++)
        {
            startHM = reminderDict[date][i].startTime.replace(/,\s/g,' ').split(' ');
            startHM = startHM[startHM.length - 2] + " " + startHM[startHM.length - 1];
           
            endHM = reminderDict[date][i].endTime.replace(/,\s/g,' ').split(' ');
            endHM = endHM[endHM.length - 2] + " " + endHM[endHM.length - 1];
            console.log(reminderDict[date][i].endTimeMilliseconds)
            console.log(reminderDict[date][i].startTimeMilliseconds)
            dayDifference = Math.floor((reminderDict[date][i].endTimeMilliseconds - reminderDict[date][i].startTimeMilliseconds) / (1000 * 60 * 60 * 24));
            if(dayDifference > 0) 
            {
                reminderTitleStyle = '"left: 180px"';
                endHM += " (in " + dayDifference + " days)";
            }
            else reminderTitleStyle = ""
           
            content +=  '<div name = "' + date + '&' + i + '&R' + '" class = "time">\
                            <span class = "reminderDot">&#8226;</span>\
                            <span class = "startTime">'+ startHM + '</span>\
                            <span class = "endTime">' + endHM + '</span>\
                         <span class = "reminderTitle" style = ' + reminderTitleStyle + '>' + reminderDict[date][i].title + '</span></div>\n';
        }
    }

    $("#diaryAndReminder").append(content);
}


function showAlarmSchedule()
{
    let alarmTime;
    let today ;
    const oneDay = 86400000;
    let todayMilliseconds = new Date().getTime();
    //let beginningReminderDate = new Date(getDateString(today).replace(/-/g,"/"));
    let reminderDate = new Date();
    let oneWeek = [];
    let hour;
    let minute;
    let timeInterval;
    let content = "";
    let isChecked = "";
    for(i = 0; i < 7; i++)
    {
        today = new Date(new Date().getTime() + oneDay * i);
        oneWeek.push(new Date(getDateString(today).replace(/-/g,"/")));
    }
   

    for(var i = 0; i < reminderArray.length; i++)
    {
        
        if(reminderArray[i].alarmTime == "" || reminderArray[i].isdeleted == true) continue;
        alarmTime = reminderArray[i].alarmTime;
       
        for(var j = 0; j < alarmTime.length; j++)
        {
            
            hour = parseInt(reminderArray[i].startTimeHourMinute);
            minute = parseInt(reminderArray[i].startTimeHourMinute.substr(3))
            reminderDate.setTime(todayMilliseconds + alarmTime[j]);
            reminderDate.setHours(hour);
            reminderDate.setMinutes(minute);
            isChecked = (reminderArray[i].isSchedule[j] == true)? "unchecked": "checked";
            for(var day = 0; day < 7; day++)
            {

                if(day != 0)reminderDate.setDate(reminderDate.getDate() + 1);
                timeInterval = reminderDate.getTime() - todayMilliseconds - alarmTime[j];
                if(timeInterval <= 0) continue;
                beginningReminderDate = new Date(getDateString(reminderDate).replace(/-/g,"/"));
                if(Reminder.isMarkOnCalendar(beginningReminderDate, reminderArray[i]))
                {
                    console.log(millisecondsToString(timeInterval));
                    console.log("call reminder " + reminderArray[i].title + " in " + timeInterval);

                    content += '<hr><div name =' + i + '>\
                                    <span style="margin-left: 10px;">' + reminderArray[i].title + '&emsp;(Ring in ' + millisecondsToString(timeInterval) + ')</span>\
                                    <label class="switch" style="position: absolute; right:40px; margin-top:-3px">\
                                        <input type="checkbox"' + isChecked + '>\
                                        <span class="slider round" name = ' + i + '&' + j + '></span>\
                                    </label>\
                                </div>';

                }
            }
            $("#alarmSchedule").text("");
            $("#alarmSchedule").append(content);
            
        }
        
    }
    console.log(oneWeek);
}





$(document).ready(function(){
//load();
calendarThread.send("CALENDAR_REGISTER");

calendarThread.send("getReminderArray");
calendarThread.on("getReminderArray",function(event,reminderArray1){
    reminderArray = reminderArray1;
    console.log(reminderArray);
    markToday();
    showAlarmSchedule();
  
    setInterval(showAlarmSchedule,1000 * 60);
})


$("body").on("click","#alarmSchedule div",function(){
    let index = parseInt($(this).attr("name"));
    window.location.href = "reminder.html";
    calendarThread.send("setGlobalVal","markDay",markDay);
    calendarThread.send("setGlobalVal","reminder",reminderArray[index]);
    calendarThread.send("setGlobalVal","calendarType","SCHEDULE");
})

$("body").on("click",".switch", function(event){
    event.stopPropagation();
})
$("body").on("click",".switch span",function(event){
    
    let name = $(this).attr("name").split("&");
    let index1 = parseInt(name[0]);
    let index2 = parseInt(name[1]);
    reminderArray[index1].isSchedule[index2] =  !reminderArray[index1].isSchedule[index2];
    calendarThread.send("updateReminders", "ALARM", index1, index2);

    event.stopPropagation();
    
})



$("#previous").click(function(){
    if((currentMonth - 1) == 0) showCalendar(currentYear - 1, 12);
    else showCalendar(currentYear, currentMonth - 1,markDay);
    $(".slot").css("width", slot_width);
})

$("#next").click(function(){
    if((currentMonth + 1) == 13) showCalendar(currentYear + 1, 1);
    else showCalendar(currentYear, currentMonth + 1,markDay);
    $(".slot").css("width", slot_width);
})

$("#year").change(function(){

    let newYear = $(this).children("option:selected").val();
    let newMonth = $("#month").children("option:selected").val();
    showCalendar(parseInt(newYear),parseInt(newMonth),markDay);
    $(".slot").css("width", slot_width);

})

$("#month").change(function(){
    let newYear = $("#year").children("option:selected").val();
    let newMonth = $(this).children("option:selected").val();

    showCalendar(parseInt(newYear),parseInt(newMonth),markDay);
    $(".slot").css("width", slot_width);
})


$("body").on("click","#calendar th",function(){
    let date = $(this).attr("name");
    let entryArray;
    let content = "";
    let dayDifference = 0;
    let startHM;
    let endHM;
    let reminderTitleStyle = "";
    currentDate = date;
    if(daySelector == null) daySelector = $("#markDay");
    if(daySelector != null) daySelector.removeAttr("style");
    if($(this).text() != "")
    {
        $(this).css({"background-color":"#f5f8d7","color":"black"});
    }
    daySelector = $(this);
    markDay = daySelector.attr("name");
    showReminderDiary(date);
})

/* open associated diary entry */
$("body").on('click', "#diaryAndReminder div",function(){
    let temp = $(this).attr("name").split("&");
    let date = temp[0];
    let index = temp[1];
    let type = temp[2];
    let reminder;
    if(type == "D") calendarThread.send("openEntry",diaryEntryDict[date][index].indexOfWindow,diaryEntryDict[date][index]);
    if(type == "R")
    {

        reminder = reminderDict[date][index];
        window.location.href = "reminder.html";
        calendarThread.send("setGlobalVal","markDay",markDay);
        calendarThread.send("setGlobalVal","reminder",reminder);
        calendarThread.send("setGlobalVal","calendarType","MONTH");
    }
})


/* mark today */ 
$("#currentTime").click(function(){
    daySelector = null;
    var date = new Date();
    showCalendar(date.getFullYear(),date.getMonth() + 1, getDateString(date));
    showReminderDiary(getDateString(date));
    $(".slot").css("width", slot_width);
})


$("#reminder").click(function(){
   
    calendarThread.send("setGlobalVal","markDay",markDay);
    window.location.href = "reminder.html";
})


$("#month").click(function(){

    $(".MONTH").css("display","table-row-group");
    $(".SCHEDULE").css("display","none");
})

$("#schedule").click(function(){
    $(".MONTH").css("display","none");
    $(".SCHEDULE").css("display","table-row-group");
})
calendarThread.on("refreshCalendar",function(event,type,entryData, oldEntryData){
    console.log(type, entryData);
    
    if(type == "DELETE") deleteFromDiaryEntryDict(diaryEntryDict,entryData);
    if(type == "ADD") addToDiaryEntryDict(diaryEntryDict,entryData);
    if(type  == "CHANGE") changeFromDiaryEntryDict(diaryEntryDict,entryData,oldEntryData);

    showCalendar(currentYear,currentMonth,markDay);
    daySelector = null;
    showReminderDiary(currentDate);

    $(".slot").css("width", slot_width);
})


calendarThread.on("resizeCalendar",function(event,width){
    slot_width = 0.83 * width / 7 + "px";
    $(".slot").css("width", slot_width);
    //console.log($("table").css("height"));

})

calendarThread.send("resizeCalendar");


calendarThread.on("changeThemeMode",changeThemeMode);
})


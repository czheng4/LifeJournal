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
const {getDiaryEntryDict} = require("../js/diaryEntry.js");
const {Reminder} = require("../js/reminder.js");
const fs = require("fs");
const user = remote.getGlobal('share').user;  
const path = "./data/" + user + "/entry"; 
const {changeThemeMode, loadThemeMode} = require("../js/theme.js");
loadThemeMode();

var currentYear;
var currentMonth;
var currentDate;  // yyyy-mm-dd
var daySelector = null; 
var diaryEntries = getDiaryEntryDict(path);
var reminderDict = {}
var reminderArray = Reminder.getReminders("./data/" + user + "/reminder");
const dot = "&#8226";


function showCalendar(year, month, today = null)
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

            if(today != null && d == today) 
            {
                if(tempDate in diaryEntries)
                {   
                    calendar += '<th id = "today" style = "background-color:#f5f8d7; color:black" name = "' + tempDate + '">' + days_array[i*7 + j] + "<div class = \"slot\">"
                    for(var k = 0; k < diaryEntries[tempDate].length; k++)
                    {
                        calendar += "<div class = \"diaryBox\" >" + diaryEntries[tempDate][k].title + "</div>";
                    }
                    calendar += "</div>";
                }
                else
                    calendar += '<th id = "today" style = "background-color:#f5f8d7; color:black" name = "' + tempDate + '">' + days_array[i*7 + j] + '<div class = "slot">';

                if(tempDate != "")
                {
                    for(var k = 0; k < reminderArray.length; k++)
                    {
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
            else 
            {
                if(tempDate in diaryEntries)
                {
                     calendar += '<th name = "' + tempDate + '">' + days_array[i*7 + j] + "<div class = \"slot\">"
                    for(var k = 0; k < diaryEntries[tempDate].length; k++)
                    {
                        calendar += "<div class = \"diaryBox\" >" + diaryEntries[tempDate][k].title + "</div>";
                    }
            
                }
                else calendar += "<th name = \"" + tempDate + "\">" + days_array[i*7 + j] + '<div class = "slot">';

                if(tempDate != "")
                {
                    for(var k = 0; k < reminderArray.length; k++)
                    {
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
        }
        calendar += "</tr>\n"
        
    }
    console.log(calendar);
    $("#calendar").text("");
    $("#calendar").append(calendar);
    $("#title").text(months[month] + "  " + year);
}
function markToday()
{
    var date = new Date();
    showCalendar(date.getFullYear(),date.getMonth() + 1, date.getDate());
}

$(document).ready(function(){

calendarThread.send("CALENDAR_REGISTER");

markToday();
$("#previous").click(function(){
    if((currentMonth - 1) == 0) showCalendar(currentYear - 1, 12);
    else showCalendar(currentYear, currentMonth - 1);
})

$("#next").click(function(){
    if((currentMonth + 1) == 13) showCalendar(currentYear + 1, 1);
    else showCalendar(currentYear, currentMonth + 1);
})

$("#year").change(function(){

    let newYear = $(this).children("option:selected").val();
    let newMonth = $("#month").children("option:selected").val();
    showCalendar(parseInt(newYear),parseInt(newMonth));
})

$("#month").change(function(){
    let newYear = $("#year").children("option:selected").val();
    let newMonth = $(this).children("option:selected").val();

    showCalendar(parseInt(newYear),parseInt(newMonth));
})


$("body").on("click","#calendar th",function(){
    let date = $(this).attr("name");
    let entryArray;
    let content = "";

    currentDate = date;
    if(daySelector == null) daySelector = $("#today");
    if(daySelector != null) daySelector.removeAttr("style");
    if($(this).text() != "")
    {
        $(this).css({"background-color":"#f5f8d7","color":"black"});
    }
    daySelector = $(this);

    $("#diaryAndReminder").text("");
    if(date != undefined && date in diaryEntries) 
    {
        entryArray = diaryEntries[date];
        for(i = 0; i < entryArray.length; i++)
        {
            content +=  '<div name = "' + date + '&' + i + '&D' + '"><span class = "diaryDot">&#8226;</span>\
                         <span class = "diaryTitle">' + entryArray[i].title + '</span></div>\n';
        }
       
    }
    console.log(reminderDict)
    console.log(date)

    if(date in reminderDict)
    {
        for(var i = 0; i < reminderDict[date].length; i++)
             content +=  '<div name = "' + date + '&' + i + '&R' + '" class = "time">\
                            <span class = "reminderDot">&#8226;</span>\
                            <span class = "startTime">'+ reminderDict[date][i].startTime + '</span>\
                            <span class = "endTime">' + reminderDict[date][i].endTime + '</span>\
                         <span class = "reminderTitle">' + reminderDict[date][i].title + '</span></div>\n';
    }

    $("#diaryAndReminder").append(content);
})

/* open associated diary entry */
$("body").on('click', "#diaryAndReminder div",function(){
    let temp = $(this).attr("name").split("&");
    let date = temp[0];
    let index = temp[1];
    let type = temp[2];
    let reminder;
    if(type == "D") calendarThread.send("openEntry",diaryEntries[date][index].index,diaryEntries[date][index]);
    if(type == "R")
    {
        reminder = reminderDict[date][index];
        window.location.href = "reminder.html";
        calendarThread.send("setGlobalVal","reminder",reminder);
    }
})


/* mark today */ 
$("#currentTime").click(function(){
    daySelector = null;
    markToday();
})


$("#reminder").click(function(){
    window.location.href = "reminder.html";
})
calendarThread.on("refreshCalendar",function(){
    diaryEntries = getDiaryEntryDict(path);
    showCalendar(currentYear,currentMonth);
    
    let date = currentDate;
    let entryArray;
    let content = "";
    $("#diaryAndReminder").text("");
    if(date != undefined && date in diaryEntries) 
    {
       
        entryArray = diaryEntries[date];
        for(i = 0; i < entryArray.length; i++)
        {
            content +=  '<div name = "' + date + '&' + i + '"><span class = "diaryDot">&#8226;</span>\
                         <span class = "diaryTitle">' + entryArray[i].title + '</span></div>\n';
        }
        
        $("#diaryAndReminder").append(content);
    }
})

calendarThread.on("resizeCalendar",function(event,width){
    let w = 0.83 * width / 7 + "px";
    $(".slot").css("width", w);

})

calendarThread.send("resizeCalendar");


calendarThread.on("changeThemeMode",changeThemeMode);
})


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
var currentYear;
var currentMonth;
const $ = require("jQuery")
var daySelector = null; 
var months = {  
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
function showCalendar(year, month, today = null)
{
    currentMonth = month;
    currentYear = year;
    
    var date = new Date(year, month - 1, 32);
    var num_days = 32 - date.getDate();
    var day = (new Date(year,month - 1,1)).getDay();
    var num_weeks = 1 + Math.ceil((num_days - (7 - day)) / 7);
    var calendar = "";
    var days_array = [];

    for(var i = 0; i < day; i++) days_array.push("");
    for(var i = 1; i <= num_days; i++) days_array.push(i.toString());
    for(var i = day + num_days; i < 7 * num_weeks; i++) days_array.push("");
    

    for(var i = 0; i < num_weeks; i++)
    {

        calendar += "<tr style = \"cursor: pointer\">\n"
        for(var j = 0; j < 7; j++)
        {
            if(today != null && days_array[i*7 + j] == today) calendar += "<th id = \"today\" style = \"background-color:lightblue\">" + days_array[i*7 + j] + "</th>\n";
            else calendar += "<th>" + days_array[i*7 + j] + "</th>\n";
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
    showCalendar(date.getFullYear(),date.getMonth() + 1, date.getDate());
}
$("#previous").click(function(){
    if((currentMonth - 1) == 0) showCalendar(currentYear - 1, 1);
    else showCalendar(currentYear, currentMonth - 1);
})

$("#next").click(function(){
    if((currentMonth + 1) == 13) showCalendar(currentYear + 1, 1);
    else showCalendar(currentYear, currentMonth + 1);
})

$("#year").change(function(){
    let newYear = $(this).children("option:selected").val();
    let newMonth = $("#month").children("option:selected").val();
    showCalendar(newYear,newMonth);
})

$("#month").change(function(){
    let newYear = $("#year").children("option:selected").val();
    let newMonth = $(this).children("option:selected").val();
    showCalendar(newYear,newMonth);
})

$("body").on("click","#calendar th",function(){
    if(daySelector == null) daySelector = $("#today");
    if(daySelector != null) daySelector.removeAttr("style");
    if($(this).text() != "")
    {
        $(this).css("background-color","lightblue");
    }
    daySelector = $(this);
})

$("#currentTime").click(function(){
    daySelector = null;
    markToday();
})
markToday();



const months = {  
	"1": "Jan",
	"2": "Feb",
	"3": "Mar",
	"4": "Apr",
	"5": "May",
	"6": "Jun",
	"7": "Jul",
	"8": "Aug",
	"9": "Sep",
	"10": "Oct",
	"11": "Nov",
	"12": "Dec"
};

const days = {
	"0" : "Sun, ",
	"1" : "Mon, ",
	"2" : "Tue, ",
	"3" : "Wed, ",
	"4" : "Thu, ",
	"5" : "Fri, ",
	"6" : "Sat, "
}
const $ = require("jquery");
const time_span = 366;
const background_color = $(".content").css("background-color");
const highlight_color = "red";

/*
	date is Date object
	date_picker is a string to hold the date from (date - time_span) to (date + time_span)
	day is the day of the week(0-6)
	month is the month of year(0-11)
	year is four digits year
	day_of_month is the day of the month
*/
var date = new Date();
var date_picker = ""
var day;
var month;
var year;
var day_of_month;

/*
	prev_hour is the previus jquery selector for hour(id) section
	prev_date is the previus jquery selector for date(id) section
	prev_period is the previus jquery selector for period(id) section
	prev_minute is the previus jquery selector for minute(id) section

	string_hour is a string holds the hour text(1-12)
	string_date is a string holds date text (e.g. Tue, Nov 12, 2019)
	string_minute is a string holds date text (00-59)
	string_period is a string holds date text (either 'AM' or 'PM')
*/

var prev_hour;
var prev_date;
var prev_period;
var prev_minute;
var string_hour;
var string_date;
var string_period;
var string_minute;

/* generate the date to pick */
date.setDate(date.getDate() - time_span);
for(var i = 1; i <= time_span * 2; i++)
{
	year = date.getFullYear();
	day = date.getDay();
	month = date.getMonth();
	day_of_month = date.getDate();
	
	if(i == 1) date_picker += '<a href = "#" id = "first">' + days[day] + months[month + 1] + " " + day_of_month + ", " + year +'</a>\n';
	else if(i == time_span + 1) date_picker += '<a href = "#" id = "last">' + days[day] + months[month + 1] + " " + day_of_month + ", " + year +'</a>\n';
	else date_picker += '<a href = "#">' + days[day] + months[month + 1] + " " + day_of_month + ", " + year +'</a>\n';
	date.setDate(date.getDate() + 1);
}
$("#date").append(date_picker);



/* grab the jqeury selector and highlight the current time */
date = new Date();
let hour = date.getHours();
let minute = date.getMinutes();
let	 period = hour >= 12? "pm":"am";
if(hour > 12) hour -= 12;

prev_hour = $("#hour" + hour);
prev_date = $("#last");
prev_period = $("#" + period);
prev_minute = $("#minute" + minute);
string_hour = prev_hour.text();
string_date = prev_date.text();
string_period = prev_period.text();
string_minute = prev_minute.text();


$("#title").text("");
$("#title").append(string_date + " &ensp;&ensp;" + string_hour + ":" + string_minute + " " + string_period);
prev_hour.css("background-color",highlight_color);
prev_minute.css("background-color",highlight_color);
prev_period.css("background-color",highlight_color);
prev_date.css("background-color",highlight_color);

/* scoll to the correct position */
$("#hour").scrollTop((prev_hour.offset().top - $("#first").offset().top))
$("#minute").scrollTop((prev_minute.offset().top - $("#first").offset().top))
$("#date").scrollTop((prev_date.offset().top - $("#first").offset().top))


/* reset time */
$('body').on('click','a',function(){
	var id = $(this).parents().attr("id");
	if(id == "date")
	{
		if(prev_date != null) prev_date.css("background-color","");
		prev_date = $(this);
		prev_date.css("background-color",highlight_color);
		string_date = prev_date.text();
	}

	if(id == "hour")
	{
		if(prev_hour != null) prev_hour.css("background-color","");
		prev_hour = $(this);
		prev_hour.css("background-color",highlight_color);
		string_hour = prev_hour.text();
	}

	if(id == "minute")
	{
		if(prev_minute != null) prev_minute.css("background-color","");
		prev_minute = $(this);
		prev_minute.css("background-color",highlight_color);
		string_minute = prev_minute.text();
	}

	if(id == "period")
	{
		if(prev_period != null) prev_period.css("background-color",background_color);
		prev_period = $(this);
		prev_period.css("background-color",highlight_color);
		string_period = prev_period.text();
	}

	$("#title").text("");
	$("#title").append(string_date + " &ensp;&ensp;" + string_hour + ":" + string_minute + " " + string_period);

})


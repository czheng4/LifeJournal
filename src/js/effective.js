/*
    effective.js
    ChaoHuiZheng
    11/21/2019

    effective event. 
*/

/* choose among forever, until a date and for a number of events */
$(".effective div div").click(function(){
	let text = $(this).children("span").text();
	$(this).children("input").prop("checked", true);
	$("#effectiveText").text(text);
	$(".effective").css("display","none");
	
	if(text == "Forever")
	{
		$("#until_a_date").css("display","none");
		$("#numEvent").css("display","none");
	}
	else if(text == "Until a date")
	{
		let today = new Date().toISOString().substring(0, 10);
		$("#until_a_date").css("display","block");
		$("#numEvent").css("display", "none");
		$("#dateUntil").val(today);
		$("#effectiveText").text("Until a date " + today);
	}

	else if(text == "For a number of events")
	{

		$("#until_a_date").css("display","none");
		$("#numEvent").css("display", "block");
		$("#effectiveText").text("For " + $("#repeatNumberText").text() + " events");
	}

})


/* For a number of events dropdown */
$(".numEventDropDown").click(function(){
	let height = $(".numEventDropDownText").css("height");
	$(".numEventDropDownText").css("height",height == "0px"? "200px":"0px");
})



/* choose a number from "for a number of events dropdown" */
$(".numEventDropDownText a").click(function(){
	$("#effectiveText").text("For " + $(this).text() + " events");
	$("#repeatEventText").text($(this).text());
	$(".numEventDropDownText").css("height","0px");
})


/* choose a date for "until a date" */
$("#dateUntil").change(function(){
	$("#effectiveText").text("Until a date " + $(this).val());
})


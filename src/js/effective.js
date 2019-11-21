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

$(".numEventDropDown").click(function(){
	let height = $(".numEventDropDownText").css("height");
	console.log(height);
	$(".numEventDropDownText").css("height",height == "0px"? "200px":"0px");
})

$("#dateUntil").change(function(){
	$("#effectiveText").text("Until a date " + $(this).val());
	//console.log($(this).val());
})


$(".numEventDropDownText a").click(function(){
	$("#effectiveText").text("For " + $(this).text() + " events");
	$("#repeatEventText").text($(this).text());
	$(".numEventDropDownText").css("height","0px");
})


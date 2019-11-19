$("#repeatNumberDropDown").click(function(){
	let height1 = $("#repeatNumber").css("max-height");
	let height2 = $("#repeatType").css("max-height");

	$("#repeatNumber").css("max-height", height1 == "0%"? "50%": "0%");
	if(height1 == "50%" && height2 == "0%") $(".week").css("top","15%");
	else $(".week").css("top","66%");
	

})

$("#repeatTypeDropDown").click(function(){
	let height1 = $("#repeatType").css("max-height");
	let height2 = $("#repeatNumber").css("max-height");
	$("#repeatType").css("max-height", height1 == "0%"? "50%": "0%");
	if(height1 == "50%" && height2 == "0%") $(".week").css("top","15%");
	else $(".week").css("top","66%");
})

$("#repeatNumber a").click(function(){
	$("#repeatNumberText").text($(this).text());
	$("#repeatNumber").css("max-height", "0%");
	if($("#repeatType").css("max-height")  == "0%") $(".week").css("top","15%");
})

$("#repeatType a").click(function(){
	let type = $(this).text();
	$("#repeatTypeText").text(type);
	$("#repeatType").css("max-height", "0%");
	if($("#repeatNumber").css("max-height")  == "0%") $(".week").css("top","15%");

	$("#days").css("display",type == "week"? "block" : "none");
})

$(":checkbox").on("click", function(){
	$(this)[0].checked = !$(this)[0].checked;
});
$(".week div div").click(function(){
	console.log($(this).text());
	let checked = $(this).children()[0].checked;
	$(this).children()[0].checked = !checked;
})



$(".repeat div div").click(function(){
	if($(this).text() == "Custom")
	{
		$(".repeat").css("display","block");
	}
})


$("#effectiveEntry").click(function(){
	$(".effective").css("display","block");
})

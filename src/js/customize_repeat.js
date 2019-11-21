$("#repeatNumberDropDown").click(function(){
	let height1 = $("#repeatNumber").css("max-height");
	let height2 = $("#repeatType").css("max-height");
	//let type = $("#repeatTypeText").text();
	$("#repeatNumber").css("max-height", height1 == "0px"? "170px": "0px");
	if(height1 == "170px" && height2 == "0px") $(".week").css("top","110px");
	else $(".week").css("top","290px");
	

})

$("#repeatTypeDropDown").click(function(){
	let height1 = $("#repeatType").css("max-height");
	let height2 = $("#repeatNumber").css("max-height");
	$("#repeatType").css("max-height", height1 == "0px"? "170px": "0px");
	if(height1 == "170px" && height2 == "0px") $(".week").css("top","110px");
	else $(".week").css("top","290px");
})

$("#repeatNumber a").click(function(){
	let num = $(this).text();
	let type = $("#repeatTypeText").text();
	if(parseInt(num) > 1) type += "s";
	$("#repeatNumberText").text($(this).text());
	$("#customHeader").text("Every " + num + " " +type)

	$("#repeatNumber").css("max-height", "0px");
	if($("#repeatType").css("max-height")  == "0px") $(".week").css("top","110px");
})

$("#repeatType a").click(function(){
	let num = $("#repeatNumberText").text();
	let type = $(this).text();

	$("#days").css("display",type == "week"? "block" : "none");
	
	if(parseInt(num) > 1) type += "s";
	$("#repeatTypeText").text(type);
	$("#customHeader").text("Every " + num + " " + type);

	$("#repeatType").css("max-height", "0px");
	if($("#repeatNumber").css("max-height")  == "0px") $(".week").css("top","110px");

	
})

$(":checkbox").on("click", function(){
	$(this)[0].checked = !$(this)[0].checked;
});
$("#days div").click(function(){
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


$("#cancelCustom").click(function(){
	$(".custom").css("display","none");
})

$("#okCustom").click(function(){

	let s = "";
	let days = $("#days input");

	if(days[0].checked) s+= " Sun.";
	if(days[1].checked) s+= " Mon.";
	if(days[2].checked) s+= " Tue.";
	if(days[3].checked) s+= " Wed.";
	if(days[4].checked) s+= " Thu.";
	if(days[5].checked) s+= " Fri.";
	if(days[6].checked) s+= " Sat.";
	
	if(s == "" || $("#repeatTypeText").text().indexOf("week") == -1) $("#repeatText").text($("#customHeader").text());
	else $("#repeatText").text($("#customHeader").text() + " on" + s);
	$(".custom").css("display","none");
})

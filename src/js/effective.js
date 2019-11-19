$(".effective div div").click(function(){
	let text = $(this).children("span").text();
	$(this).children("input").prop("checked", true);
	$("#effectiveText").text(text);
	$(".effective").css("display","none");
	
})
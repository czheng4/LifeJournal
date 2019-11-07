'use strict'
const $ = require("jQuery");
const photoThread = require('electron').ipcRenderer;
const remote = require('electron').remote;  

/*
	usr is user nmae
	album is album name
	images is where we are gonna append to photo section
	filenames store what files we wanna download
	size is the number of photos
	isSelect is whether we show checkbox(true: show, false: hidden)
	recentTime stores the recentest photo imported time
	visible is a dict for hiding and showing checkbox
	timeDict is sorted dictionary storing the date of image, the name of image and so on(see time.js in detail)
	newSection is a selector holds the the data with the timeStamp not existing in the database 
	deletedDiaryPhotos stores the attached photos we try to delete and we use it to check the checkbox after we refresh the photos.

*/
var isTransfer;
const user = remote.getGlobal('share').user; 
var album = remote.getGlobal('share').album; 
const {Confirmation} = require("../js/confirmation.js");
const {changeThemeMode, loadThemeMode} = require("../js/theme.js");
loadThemeMode();

var images = "";
var filenames;
var isSelect = false;
var size = 0;
var id;
var timeDict;
var recentTime = -1;
var visible = {false:"hidden",true:"visible"};
var newSection = null;
var deletedDiaryPhotos = []
/* when isSelect is true, show the check box on the right top corner of images. */
function showImage(isSelect)
{
	/* reset newSection */
	newSection = null;
	
	/*name is the name of image */
	var name;
	var path;
	/* show the album name and clean up all photos*/
	$("h2").text(album);
	document.getElementById("photos").innerHTML = "";
	images = "";
	
	/* path that is relative to html file */
	path = "../../data/" + user + "/photo/" + album + "/"; 

	/* traverse the photo directory to show all images */
	var files = fs.readdirSync("./data/" + user + "/photo/" + album + "/");
		

	/* keep track of image id */
	var i = 0;
	
	/* sort the images by the time */
	timeDict = sortFilesByTime("./data/" + user + "/photo/" + album + "/",files);
	timeDict = getDictByTime(timeDict);
	  
	
	/* show the number of photos */
	size = files.length;
	$("#quantity").text(size + " photos");
	
	/* reset the recentTime when the album is empty */
	if(Object.keys(timeDict).length == 0) recentTime = -1;

	/* traverse the timeDict and grop the images with the same date */
	for(var timeStamps in timeDict) 
	{
		recentTime = timeStamps;
		

		/* DATE is the format of yyyy-mm-dd 
		   The id of span has a leading uppercase 'S' to distinguish it from "section" id
		   The name attr of input is the format of start-length. Start is where the image id begin in this section. Length is how many images are in this section.
		*/

		/* <span id = SDATE>DATE(NUM_PHOTOS)<a href = "#" id = "ADATE">▲</a><input type= "checkbox"  class = "check1" id = "groupPhotos" style = "visibility:hidden/visible" name = "0-5"><br> <section class = "photo" id = "DATE"><img src = "../../data/475887291/photo/1/car.jpg"> */
		images += "<span id = \"S" + timeStamps + "\">" + timeStamps + " (" + timeDict[timeStamps].length + ")</span><a id = \"A" + timeStamps + "\">"+String.fromCharCode(9650)+"</a><input type= \"checkbox\"  class = \"check1\" id = " + "\"groupPhotos\"" + " style = \"visibility:" + visible[isSelect] + "\" name = \"" + i + "-" + timeDict[timeStamps].length + "\"><br> <section class = \"photo\" id = \"" + timeStamps + "\">";
		
		/* show images which have same date */
		for(var j = 0; j < timeDict[timeStamps].length; j++)
		{
			
			name = timeDict[timeStamps][j].name;

			/* check the attached photos we try to delete */
			if(isSelect == true && deletedDiaryPhotos.indexOf(name) != -1) 
			{
				/* <img src = "../../data/USER_NAME/photo/ALBUM_NAME/IMAGE_NAME" name = "ID"> */
				images += "<img src = \"" + path + name + "\" name = \"" + i + "\" style = \"opacity: 0.5\">\n";
				/* <input type= "checkbox" class = "check" id = NUMBER style = "visibility:hidden/visible" name = "IMAGE_NAME"> */
				images += "<input type= \"checkbox\" class = \"check\" id = " + i + " style = \"visibility: visible" + "\" name = \"" + name + "\" checked>\n";	
			}
	
			else 
			{
				images += "<img src = \"" + path + name + "\" name = \"" + i + "\">\n";
				images += "<input type= \"checkbox\" class = \"check\" id = " + i + " style = \"visibility:" + visible[isSelect] + "\" name = \"" + name + "\">\n";	
			}
			i++;				
		}
		images += "</section>\n"
	}
	
	$("#photos").append(images);
		
}

/* select button callback */
function select()
{
	/* traverse the checkbox to show or hide */
	isSelect = !isSelect;
	for(var i = 0; i < size; i++) 
	{	
	 	id = "#" + i;
	 	$(id).css("visibility",visible[isSelect]);
		if(isSelect == false)
		{
			$(id).prop("checked", false);
			$(id).prev().css("opacity","1");
		}
	 	
	}
	$(".check1").css("visibility",visible[isSelect]);
	$(".check1").prop("checked", !isSelect);
}

/* select all checkbox callback */
function selectAll()
{
	/* select all images */
	
	if($("#selectAll").is(':checked'))
	{
		$(".check1").css("visibility","visible");
		$(".check1").prop("checked", true);
		for(var i = 0; i < size; i++) 
	   	{	
	   		id = "#" + i;
	   		$(id).css("visibility","visible");
	   		$(id).prop("checked", true); // check it 
	   		$(id).prev().css("opacity","0.5");
	   	}
		isSelect = true;
	}
	/* unselect all images */
	else
	{
		$(".check1").css("visibility","hidden");
		$(".check1").prop("checked", false);
		for(var i = 0; i < size; i++) 
		{
			id = "#" + i;
			$(id).css("visibility","hidden");
			$(id).prop("checked", false); // uncheck it 
			$(id).prev().css("opacity","1");
		}
		isSelect = false;
	}

}

/* delete button callback */
function deletion()
{
	/* send the message to main.js to open cofimation page */
	var confirmation = new Confirmation(
		"BULK_PHOTO_DELETION",     //type
		"Delete",			  //title
		"Are you sure you want to delete the photos you selected?", // text
		["Cancel","Delete"]   //buttonlabels 
	);
	photoThread.send("openConfirmation",confirmation);
}

/* import(upliad) button callback */
function upload()
{
	album = remote.getGlobal('share').album; 
	photoThread.send("upload","photo/" + album + "/");
}


/* export(download) button callback */
function download()
{
	filenames = [];
	for(var i = 0; i < size; i++)
	{
		id = "#" + i;
		
		if($(id).is(":checked")) filenames.push($(id).attr("name"));
	}
	if(filenames.length == 0)photoThread.send("errorMessage","Error","select thephotos first!!!");
	else photoThread.send("download","photo/" + album + "/" ,filenames);
}

/* edit button callback */
function edit()
{
	photoThread.send("openEditAlbum");
}


/* transfer button callback */
function transfer()
{

	/* update the album in case we change the name of album */
		//album = remote.getGlobal('share').album; 
		
		/* isTransfer is true when we transfer something */
	isTransfer = false;
	var moveFrom = []
	var name;
	var path;
	//var toName;	
	path = "./data/" + user + "/photo/" + album + "/"; 
	//to = "./data/" + user + "/photo/" + to + "/"
	//var files = fs.readdirSync(to).sort(function(t1,t2){return parseInt(t1) - parseInt(t2);};
   	//var num;
  		/* name our files with number. Therefore, we can have multiple same files */
   	//if(files.length == 0) num = 1;
  		/* grab the biggest number */
  		//else num =  1 + parseInt(files[files.length - 1]);
  		//console.log(num);
	
	for(var i = 0; i < size; i++) 
	{
		id = "#" + i;
		if($(id).is(':checked')) 
		{	
			name = $(id).attr("name");
			moveFrom.push(name);
			
			//let toName = name.split('-');
			//toName = to + num + "-" + toName[toName.length - 1];
			//mvFileKeepTimeStamp(path + name, toName);
			//num++;
			isTransfer = true;
		}
	}
	console.log(moveFrom);
	photoThread.send("openTransferPhoto",album,moveFrom);
}

/* refresh the single_photo.html whenever we delete, transfer or import images */
function refreshSinglePhoto()
{
	photoThread.send("refreshSinglePhoto");
}

/* hide and display images */
function hideDisplayImages()
{
	if($(this).attr("id") == "goBack") return;
	let time = $(this).attr("id");
	let id = "#" + time.split('A')[1];
	let display = $(id).css("display");
	if(display == "grid")
	{
		$(id).css("display","none");	
		$(this).text(String.fromCharCode(9660));
		
	}
	else 
	{
		$(id).css("display","grid");
		$(this).text(String.fromCharCode(9650));
		
	}
	
}

$(document).ready(function(){

	photoThread.send("MAIN_PHOTO_REGISTER");

	showImage(false);

	/* click button */
	$("#select").click(select);
	$("#delete").click(deletion);
	$("#selectAll").click(selectAll);
	$("#upload").click(upload);
	$("#download").click(download);
	$("#edit").click(edit);
	$("#transfer").click(transfer);
	

	$('body').on('dblclick','img',function(event){
		if(isSelect == false) photoThread.send("openSinglePhoto",$(this).attr("src"));
		//window.location.href = "single_image.html";
		//console.log($(this).attr("src"));
	})

	/* click to hide and display image */
	$('body').on('click','a',hideDisplayImages);

	/* click the image to check and uncheck */
	$('body').on('click','img',function(){
		id = "#" + $(this).attr("name");

		if(isSelect == true)
		{
			if($(id).is(':checked') == true) 
			{
				$(this).css("opacity","1");
				$(id).prop("checked",false);
			}
			else
			{
				$(this).css("opacity","0.5");
				$(id).prop("checked",true);
			}
		}
	})

	/* click the checkbox to check and uncheck */
	$('body').on('click','input',function(){
	
		if($(this).is(':checked') == true) $(this).prev().css("opacity","0.5");
		else $(this).prev().css("opacity","1");
	})

	/* check or uncheck all photos under a specific time stamp*/
	$('body').on('click','#groupPhotos',function(){
		var name = $(this).attr("name");
		var start,length;
		var isCheck = false;
		name = name.split("-");
		start = parseInt(name[0])
		length = parseInt(name[1])

		if($(this).is(':checked') == true) isCheck = true;
		
		for(var i = start; i < start + length; i++)
		{
			
	   		id = "#" + i;
	   		$(id).prop("checked", isCheck); // check it 
	   		if(isCheck == true) $(id).prev().css("opacity","0.5");
	   		else $(id).prev().css("opacity","1")
		}

	})
	
	/* shortcuts 
	   ctr-d alt-d delete
	   ctr-i alt-i import
	   ctr-s alt-s export
          ctr-t alt-t transfer
          ctr-a alt-a selectAll
          ctr-x alt-x select
          ctr-b alt-b go back
	*/
	$("body").keydown(function(event){
		if(event.ctrlKey || event.altKey)
		{
			switch(event.keyCode)
			{
				case 88:            // 'x' key
					select(); break;
					
				case 68: 			// 'd' key
					deletion();	break;
				
				case 83:            // 's' key
					download(); break;

				case 65:      		// 'a' key
					if($("#selectAll").is(':checked')) $("#selectAll").prop("checked", false);
					else $("#selectAll").prop("checked", true);
					selectAll(); break; 

				case 73:            // 'i' key
					upload(); break;

				case 84:  			// 't' key
					transfer(); break;

				case 69:   			// 'e' key
					edit(); break;

				case 66:  			// 'b' key
					window.location.href = "album.html";
			}
		}
	})

	
	
	/* get confirmed from confirmation page and execute deletion */
	photoThread.on(("BULK_PHOTO_DELETION"),(event)=>{

		/* update the album in case we change the name of album */
		//album = remote.getGlobal('share').album; 
		
		/* isDelete is true when we delete something 
		   isDeleteDiaryPhoto is true when we delete attached photos.
		*/
		let isDelete = false;
		let isDeleteDiaryPhoto = false;
		let name;
		let path;
		deletedDiaryPhotos = [];
		path = "./data/" + user + "/photo/" + album + "/"; 

		/* traverse the ids to delete checked files */
		for(var i = 0; i < size; i++) 
		{
			id = "#" + i;
			name = $(id).attr("name");
			/* $(id).attr("name")) grab the IMGAGE_NAME */
			if($(id).is(':checked')) 
			{	
				/* check if is a photo attached to diary */ 
				if(name.indexOf("DIARY_ENTRY") != -1) 
				{
					deletedDiaryPhotos.push(name);
					isDeleteDiaryPhoto = true;
				}
				else fs.unlinkSync(path + name,(err) => {if (err) throw err; });
				isDelete = true;
			}
		}
		if(isDeleteDiaryPhoto) photoThread.send("errorMessage","Error","Can't delete photos attached to your diary!!!");

		if(isDelete === false) photoThread.send("errorMessage","Error","Select photos first!!!");
		else 
		{
			showImage(isSelect);
			refreshSinglePhoto();
		}
	})
	
	/* get confirmed from confirmation page and execute transfer */
	photoThread.on(("PHOTO_TRANSFER_DONE"),(event)=>{

		//album = remote.getGlobal('share').album; 
		
		if(isTransfer === false) photoThread.send("errorMessage","Error","select the photos first!!!");
		else 
		{
			console.log("here" + isTransfer);
			showImage(isSelect);
			refreshSinglePhoto();
		}
	})
	/* add image */

	photoThread.on("doneUpload",(event,files) =>{


		/* one way to implement this part is we can just call showImage. However, it is expensive as we have to reload all the images.
		*/

		/* 
		   oldName is the attr name of tag "input"(size-length).
		   newName is what the new attr name should be when uploading images.
		*/

		
		var oldName, newName, path;
		
		if(files.length == 0) return;
		refreshSinglePhoto();
		
		images = "";
		path = "./data/" + user + "/photo/" + album + "/"; // relative to main.js
		
		/* The timeDict should only contain one key unless we upload images around 11:59:59. Then, it may have two keys.
		*/
		timeDict = sortFilesByTime(path,files)
		timeDict = getDictByTime(timeDict)
		
		/* update the number of photos */
		$("#quantity").text((files.length + size) + " photos");
		
		var i = size;
		path = "../." + path; // relative to html
		
		/* timeStamps is the time on the format of yyyy-mm-dd */
		for(var timeStamps in timeDict)
		{
			/* The "timeStamps" section doesn't exist and create the section. */
			/* see the detain about images string in showImage function */
			if(timeStamps != recentTime)
			{

				images += "<span id = \"S" + timeStamps + "\">" + timeStamps + " (" + timeDict[timeStamps].length + ")" + "</span> <a id = \"A" + timeStamps + "\">"+String.fromCharCode(9650)+"</a><input type= \"checkbox\"  class = \"check1\" id = " + "\"groupPhotos\"" + " style = \"visibility:" + visible[isSelect] + "\" name = \"" + size + "-" + timeDict[timeStamps].length + "\"><br> <section class = \"photo\" id = \"" + timeStamps + "\">";
			}
			for(var j = 0; j < timeDict[timeStamps].length; j++)
			{
				
				images += "<img src = \"" + path + timeDict[timeStamps][j].name +  "\" name = \"" + i + "\">\n";
				images += "<input type= \"checkbox\" class = \"check\" id = " + i + " style = \"visibility:" + visible[isSelect] + "\" name = \"" + timeDict[timeStamps][j].name + "\">\n";
				i++;
			}
			if(timeStamps != recentTime)
			{
				images += "</section>\n";
			}
		}
		/* update the size */
		size += files.length;

		/* append the new photo section */
		if(recentTime != timeStamps)
		{
			recentTime = timeStamps;

			/* we have to hold the selector for new TimeStamps as that's how we get access to jquery element that just appended. 
			   If we don't hold the selector, when we try to select the $("#SDATE input:first"), we won't find the element.
			*/
			newSection = $(images);
			
			$("#photos").append(newSection);

		}
		else 
		{

			/* append the photos to the photo section */
			id = "#" + recentTime;
			$(id).append(images);

			/* update the name attr of input */
			if(newSection != null)
			{
				/* newSection[3] hold the first checkbox input
				   We can print out newSection to figure out what index holds what tag info.
				*/
				/* update the checkbox tag */
				let oldName, newName, text;
				oldName = newSection[3].name; 
				oldName = oldName.split("-");
				newName = oldName[0] + "-" + (parseInt(oldName[1]) + files.length);
				newSection[3].name = newName;

				
				/* update the span tag */
				text = newSection[0].innerHTML;
				text = text.match(/\(([^()]*)\)/g);
				text = parseInt(text[0].substring(1,text[0].length-1)) + files.length;
			
				newSection[0].innerHTML = recentTime + " (" + text + ")";

			}
			else
			{
				/* update the number of photos for showing purpose */
				id = "#S" + recentTime;
				let text = $(id).text();
				text = text.match(/\(([^()]*)\)/g); // select whatever is inside of "()".
				text = parseInt(text[0].substring(1,text[0].length-1)) + files.length;
				$(id).text(recentTime + " (" + text + ")"); 
				
				/* update the number of phtoos for selection purpose */
				id = "#S" + recentTime + " ~ input";
				oldName = $(id).attr("name");
				oldName = oldName.split("-");
				newName = oldName[0] + "-" + (parseInt(oldName[1]) + files.length);
				$(id).attr("name",newName);
			}
		}

	})
	
})

/* refresh the photos when we delete or transfer photo in sigle_photo.html */
photoThread.on("refreshPhotos",(event)=>{
	let files = fs.readdirSync("./data/" + user + "/photo/" + album + "/");
	if(files.length != size) showImage(isSelect);
})
/* rename the album */
photoThread.on("rename",(event,albumName)=>{
	album = albumName;

	showImage(isSelect);
})

photoThread.on("changeThemeMode",changeThemeMode);
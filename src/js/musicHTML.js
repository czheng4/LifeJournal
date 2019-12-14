/*
	musicHTML.js
    ChaoHui Zheng
    12/14/2019

    The functions for music.html


*/
/* a helper function to generate the html string of each song */
function musicPlayListStr(node)
{
    return '<div id = "playList_' + node.val.index + '">\
                        <a href="#" name = "' + node.val.index + '">' + node.val.name + '</a>\
                        <button name = "' + node.val.index + '"><i class="fas fa-trash"></i></button>\
            <hr></div>'
}

/* it updates the play list play order */
function updatePlayListOrder(indexOfTitle)
{
    if(indexOfTitle == 0) orderType = 'i';
    else if(indexOfTitle == 1) orderType = 'r';
    else orderType = 's';

    showMusicList();
    if(playingMusicNode != null && $("#playList_" + playingMusicNode.val.index) != undefined) 
    {
        $("#playList_" + playingMusicNode.val.index).css("color","blue");
        $(".playList").scrollTop($("#playList_" + playingMusicNode.val.index).offset().top - $('.playList').offset().top);
    }
    
    $("#playListTitle").text("");
    $("#playListTitle").append(playListTitle[indexOfTitle % 3]);
}

/* it shows all the music we have in the main page */
function showMusic()
{
    var dirs = fs.readdirSync(path);
    var files;
    var content = "";

    /* sor the dirs by birthtime */
    dirs = dirs.sort(function(t1, t2) { return fs.statSync(path + t1).birthtime - fs.statSync(path + t2).birthtime; })

    /* set the myMusicCategory */
    if(dirs.length > 0) myMusicCategory = dirs[0];

    /* show the music list. initialize the musicListDict. Generate the musicDict */
    for(var i = 0; i < dirs.length; i++)
    {
        musicListDict[dirs[i]] = {'i':null, 'r':null, 's':null};
        files = fs.readdirSync(path + dirs[i]);
        files = files.sort(function(m1,m2){return parseInt(m1) - parseInt(m2);});
        musicDict[dirs[i]] = [];
        content += '<div style = "margin-top:5px">\
                        <div class = "musicCategoryTitle" name = "' + dirs[i] + '">' + dirs[i] + '\
                            <span style="right: 60px; position: absolute; cursor:pointer">▼</span>\
                            <input type="checkbox" style="position: absolute; right: 20px; margin-top:5px; visibility:hidden" value = "" name = "myMusic_' + dirs[i] + '">\
                        </div>\
                        <br>\
                    </div>\
                    <div class = "musicCategorySong" id = "myMusic_' + dirs[i] + '">';
        for(var j = 0; j < files.length; j++)
        {
            newMusic = new Music(path + dirs[i] + '/' + files[j],files[j], dirs[i]);
            newMusic.musicIndex = j;
            musicDict[dirs[i]].push(newMusic);
            content += '<div id = "' + j + '_' + dirs[i] + '"><hr>\
                            <i class="fas fa-plus-square" style = "cursor:pointer" name = "' + j + '_' + dirs[i] +'"></i>\
                            <a href="#" contenteditable="false" name = "'+ j  + '_' + dirs[i] +'">' + newMusic.name + '</a>\
                            <input type="checkbox" style="position: absolute; right: 20px; margin-top:5px; visibility:hidden" value = "' + j + "-" + dirs[i] + '">\
                        </div>';
            
        }
        content += "</div>"
    }

    $("#musicContent").text("");
    $("#musicContent").append(content);

}

/* it shows the playing list */
function showMusicList()
{
    if(myMusicCategory == null) return;
    let content = "";
    let node;
    let list;
    let musicIndex;
    let category;
    let pointer_index;
    
    /* we haven't generate the playList for this specific category and orderType*/
    if(musicListDict[myMusicCategory][orderType] == null || musicListDict[myMusicCategory][orderType].head == null) 
    {   

        if(orderType == 's')
        {
            if(playingMusicNode != null)  musicListDict[myMusicCategory][orderType] = generatePlayList([musicDict[myMusicCategory][playingMusicNode.val.musicIndex]], musicNodePointers, orderType);
            else  musicListDict[myMusicCategory][orderType] = generatePlayList(musicDict[myMusicCategory], musicNodePointers, orderType);
        }
        else
        {
            musicListDict[myMusicCategory][orderType] = generatePlayList(musicDict[myMusicCategory],musicNodePointers, orderType);
        }
    }
    

    /* we switch the the playList */
    if(playingMusicNode != null) 
    {
        musicIndex = playingMusicNode.val.musicIndex;
        category = playingMusicNode.val.category;
        pointer_index = playingMusicNode.val.index;

        playingMusicNode =  findMusicOfList(musicDict[category][musicIndex], myMusicCategory, orderType, musicNodePointers);
        

        /* if we can't find it, it indicates we delete it from the playList before. We add in the beginning of the playList */
        if(playingMusicNode == null)
        {                
            playingMusicNode = musicListDict[myMusicCategory][orderType].push_front(musicDict[category][musicIndex].deepCopy(myMusicCategory));
           
            playingMusicNode.val.index = musicNodePointers.length;
            playingMusicNode.val.orderType = orderType;
            musicDict[category][musicIndex].listIndices.push(musicNodePointers.length);

            musicNodePointers.push(playingMusicNode);     
        }

    }
    /* first time to load, we set it to the beginning of the playList */
    if(playingMusicNode == null) 
    {
        playingMusicNode = musicListDict[myMusicCategory][orderType].head;
        if(playingMusicNode != null) playingMusic.src = playingMusicNode.val.src;
    }

    /* show the playList */
    content += '<div id = "playListTitle">'
    if(orderType == 'i') content += playListTitle[0];
    else if(orderType == 'r') content += playListTitle[1];
    else if(orderType == 's') content += playListTitle[2];
    content += '</div>'

    list = musicListDict[myMusicCategory][orderType];
    node = list.head;
    for(var i = 0; i < list.size; i++)
    {
        if(node.val.isdelete == false) content += musicPlayListStr(node);
        node = node.next;
    }
    
    $(".playList").text("");
    $(".playList").append(content);
    
}




/* click events for control buttons */
function deletion()
{
	var confirmation = new Confirmation(
        "MUSIC_DELETION",     //type
        "Delete",             //title
        "Are you sure you want to delete the musics you selected?", // text
        ["Cancel","Delete"]   //buttonlabels 
    );
    musicThread.send("openConfirmation",confirmation);
}

function transfer()
{
	typeTransferImport = "transfer";
    $("#chosenCategory").text("Transfer to ...");
    $(".importCategory").css("display","block");
}

function select()
{
	isSelect = !isSelect;
    $("[type='checkbox']").css("visibility",visible[isSelect]);
    $(".musicCategorySong div a").prop("contenteditable",isSelect);
}

function upload()
{
	typeTransferImport = "import";
    $("#chosenCategory").text("Import to ...");
    $(".importCategory").css("display","block");
}

function createCategoryWindow()
{
	$(".create").css("display","block");
}

function order()
{
	$(".playOrder").css("display","block");
}

function previous()
{
	if(playingMusicNode == null) return;
	let isPaused = playingMusic.paused;
    $("#playList_" + playingMusicNode.val.index).css("color","");
    $("#" + playingMusicNode.val.musicIndex  + "_" + playingMusicNode.val.category).css("color","");
    

    if(isPaused == false) playingMusic.pause();
    playingMusicNode = playingMusicNode.previous;
    playingMusic.src = playingMusicNode.val.src;
    if(isPaused == false) playingMusic.play();
    

    if(playingMusicNode == musicListDict[playingMusicNode.val.category][orderType].tail) $(".playList").scrollTop(0xfffffff);
}

function next()
{
    if(playingMusicNode == null) return;
    let isPaused = playingMusic.paused;
    $("#playList_" + playingMusicNode.val.index).css("color","");
    $("#" + playingMusicNode.val.musicIndex  + "_" + playingMusicNode.val.category).css("color","");
    
    if(isPaused == false) playingMusic.pause();
    playingMusicNode = playingMusicNode.next;
    playingMusic.src = playingMusicNode.val.src;
    if(isPaused == false) playingMusic.play();
    
    if(playingMusicNode == musicListDict[playingMusicNode.val.category][orderType].head)
    {
        $(".playList").scrollTop(0);
    }
}

function playPause()
{
	if(playingMusic.src == "" || playingMusicNode == null) return;
    type = $("#playPause").attr("name");
    $("#playPause").text("");
    if(type == "pause")
    {
       
        $("#playPause").attr("name","play");
        $("#playPause").append('<i class="fas fa-play"></i><span class = "shortcut"> space </span>');
        $("#playPauseText").text("pause");
        playingMusic.play();
    }
    else
    {
        $("#playPause").attr("name","pause");
        $("#playPause").append('<i class="fas fa-pause"></i><span class = "shortcut"> space </span>');
       
        $("#playPauseText").text("play");
        playingMusic.pause();
    }
}

function playList()
{
	let visibility = $('.playList').css("visibility");
    if(visibility == "hidden") $('.playList').css("visibility","visible");
    else $('.playList').css("visibility","hidden");
}

function volume()
{
	$("#volume").text("")
    if($(".volumeSlider")[0].name == "mute")
    {
        $(".volumeSlider")[0].name = "on";
        $("#volume").append('<i class="fas fa-volume-up"></i><span class = "shortcut"> ctr-m/alt-m </span>');
        playingMusic.volume = myVolume;
    }
    else
    {
        $(".volumeSlider")[0].name = "mute";
        $("#volume").append('<i class="fas fa-volume-mute"></i><span class = "shortcut"> ctr-m/alt-m </span>');  
        myVolume = playingMusic.volume;
        playingMusic.volume = 0;
    }
 
}



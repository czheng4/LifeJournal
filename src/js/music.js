/*
	ChaoHuiZheng
	2019/12/05

	This lib is for stroing music info and getenrate the music play list.
*/

const {List} = require("../js/list.js");
const {Random} = require("../js/cryptography.js");
class Music
{	

	/* 
		The fileName is in the format of NUM-FILENAME.SUFFIX.(e.g., 10-My Love.mp3)
		The reason I put number front is we can have duplicate musics.
	*/
	constructor(filePath = null, fileName = null, category = null)
	{
		if(filePath == null || fileName == null || category == null) return;
		let suffix;
		this.fileName = fileName;
		this.filePath = filePath;
		this.src = "../." + filePath;
		this.category = category;
		suffix = fileName.indexOf(".mp3");
		if(suffix != -1) this.name = fileName.substring(fileName.indexOf('-') + 1, suffix);
		else this.name = fileName.substr(fileName.indexOf('-') + 1);



		/* 
			1. I have a musicDict[category][orderType] to store all the music in your music list.
			   orderType can be 'r'(random) or 's'(single) or 'o'(order).
			2. I have a musicNodePointers to store all the Node through all lists. I use the this.index to rememer
			   where the is node is in the musicNodePointers.(it will only be set for the node of list, see list.js) 
			3. All the music in the playList are extension of musics in musicDict[][]. 
			   The musicIndex and category keeps track where this musci belongs in the musciDict.
			4. listIndices keeps track all the musics in the playList. It stores where they are in the musicNodePointers.
			   We can use it to do quick deletion, insertion. For example, if we delete one music in the music list. we 
			   traverse the listIndices to grab the node and delete it from the list.
			5. The index stores where it is in the musicNodePointers.(it's used for node in the list)
			
			6. The playListCategory stores which playList it is.
			   (For example, if we are at playList '1', we may add the song from playList '2' to '1').
			7. The musicIndex is set for both music in the musicDict and list.
			   The index is set for music in the list.
			   the listIndices is set for music in the musicDict.
			   The isdelete is set for music in the node when it's deleted.

		*/
		this.playListCategory = "";
		this.isdelete = false;
		this.musicIndex = -1;
		this.index = -1;
		this.listIndices = [];
	}
	/* As in Javascript, it is shallow copy, I create a deepcopy function. 
	   Therefore, they won't interfere with each other.
	*/
	deepCopy(playListCategory = null)
	{
		var newMusic = new Music();
		
		newMusic.filePath = this.filePath;
		newMusic.src = this.src;
		newMusic.name = this.name;
		newMusic.index = -1;
		newMusic.category = this.category;
		newMusic.musicIndex = this.musicIndex;
		newMusic.fileName = this.fileName;
		newMusic.isdelete = false;
		newMusic.orderType = "";
		
		if(playListCategory == null) newMusic.playListCategory = this.category;
		else newMusic.playListCategory = playListCategory;
		return newMusic;
	}
}

/* conver seconds to the format of minute:second (for example 5:02)*/
function secondsToTimeString(seconds)
{
	let min = parseInt(seconds / 60);
	let sec = parseInt(seconds - min * 60);
	if(sec < 10) return min + ":0" + sec;
	else return min + ":" + sec; 
}

/* find the node in the current playList. They must have same category and orderType */
function findMusicOfList(music, category, orderType, musicNodePointers)
{
	if(music == null || orderType == null || category == null || musicNodePointers == null) return null;
	let node;
	for(var i = 0; i < music.listIndices.length; i++)
	{
		node = musicNodePointers[music.listIndices[i]];
		if(node.val.isdelete == true) continue;
		if(node.val.orderType == orderType && node.val.playListCategory == category) return node;
	}
	return null;
}

/* update the src, filePath, fileName, name when we rename the file */
function updateMusicFromList(music, newMusic, musicNodePointers)
{
	if(music == null || musicNodePointers == null || newMusic == null) return null;
	
	for(var i = 0; i < music.listIndices.length; i++)
	{
		if(musicNodePointers[music.listIndices[i]].val.isdelete == true) continue;
		musicNodePointers[music.listIndices[i]].val.src = newMusic.src;
		musicNodePointers[music.listIndices[i]].val.filePath = newMusic.filePath;
		musicNodePointers[music.listIndices[i]].val.fileName = newMusic.fileName;
		musicNodePointers[music.listIndices[i]].val.name = newMusic.name;
	}
	music.src =  newMusic.src;
	music.filePath = newMusic.filePath;
	music.fileName = newMusic.fileName;
	music.name = newMusic.name;
	
}

function deleteFromList(music, musicNodePointers)
{
	if(music == null || musicNodePointers == null) return null;
	let node;
	for(var i = 0; i < music.listIndices.length; i++)
	{
		node = musicNodePointers[music.listIndices[i]];
		node.val.isdelete == true;
	}
	return null;
	

}
/* i stands for in order, r stands for random order */
function generatePlayList(music, musicNodePointers, type = 'i')
{
	var list = new List();
	var musicIndexArray = [];
	var tmp;
	var rn;
	var length = music.length;
	var random = new Random("123");
	var newNode;
	var pointers_length = musicNodePointers.length;
	console.log(pointers_length);
	/* in order */
	console.log(type)
	if(type == 'i')
	{
		for(var i = 0; i < length; i++)
		{
			newNode = list.push_back(music[i].deepCopy());
			newNode.val.index = pointers_length;
			newNode.val.orderType = "i";
			music[i].listIndices.push(pointers_length);

			//newNode.val.musicIndex = music[i].musicIndex;
			musicNodePointers.push(newNode);
			pointers_length++;
		}
		return list;
	}
	if(type == 's')
	{
		if(length > 0)
		{
			newNode = list.push_back(music[0].deepCopy());
			console.log(music[0]);

			music[0].listIndices.push(pointers_length);
			newNode.val.index = pointers_length;
			newNode.val.orderType = "s";
			//newNode.val.musicIndex = music[0].musicIndex;
			musicNodePointers.push(newNode);
		}
		return list;
	}
	
	/* random */
	for(var i = 0; i < length; i++) musicIndexArray.push(i);
	for(var i = length - 1; i >= 0; i--)
	{
		//rn = parseInt(Math.random() * (i + 1));
		rn = random.getNumber() % (i + 1);
		tmp = musicIndexArray[rn];
		musicIndexArray[rn] = musicIndexArray[i]
		musicIndexArray[i] = tmp;
	}

	for(var i = 0; i < length; i++)
	{
		newNode = list.push_back(music[musicIndexArray[i]].deepCopy());

		newNode.val.index = pointers_length;
		newNode.val.orderType = "r";
		music[musicIndexArray[i]].listIndices.push(pointers_length);
		//newNode.val.musicIndex = music[musicIndexArray[i]].musicIndex;
		musicNodePointers.push(newNode);
		pointers_length++;
	}
	console.log(list);
	return list;
	
}


module.exports = {
	Music:Music,
	secondsToTimeString:secondsToTimeString,
	generatePlayList:generatePlayList,
	findMusicOfList:findMusicOfList,
	updateMusicFromList:updateMusicFromList
}
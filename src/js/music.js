/*
	ChaoHuiZheng
	2019/12/05

	This lib is for stroing music info and getenrate the music play list.
*/

const {List} = require("../js/list.js");
const {Random} = require("../js/cryptography.js");
class Music
{
	constructor(filePath = null, fileName = null)
	{
		if(filePath == null || fileName == null) return;
		let suffix;
		this.filePath = filePath;
		this.src = "../." + filePath;
		suffix = fileName.indexOf(".mp3");
		if(suffix != -1) this.name = fileName.substring(fileName.indexOf('-') + 1, suffix);
		else this.name = fileName.substr(fileName.indexOf('-') + 1);

		this.isdelete = false;
		this.node = null;
		//this.randomNode = null;		// play in random order.
		//this.orderNode = null;		// play in order.
		this.index = -1;
	}
	deepCopy()
	{
		var newMusic = new Music();
		
		newMusic.filePath = this.filePath;
		newMusic.src = this.src;
		newMusic.name = this.name;
		newMusic.index = -1;
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

function findMusicOfList(music, list)
{
	if(music == null || list == null) return null;
	var node = list.head;
	for(var i = 0; i < list.size; i++)
	{
		if(music.src == node.val.src) return node;
		node = node.next;
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
			newNode.val.index = pointers_length;
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
	findMusicOfList:findMusicOfList
}
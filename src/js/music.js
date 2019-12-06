
class Music
{
	constructor(filePath, fileName)
	{
		let suffix;
		this.filePath = filePath;
		this.src = "../." + filePath;
		suffix = fileName.indexOf(".mp3");
		if(suffix != -1) this.name = fileName.substring(fileName.indexOf('-') + 1, suffix);
		else this.name = fileName.substr(fileName.indexOf('-') + 1);

		this.isdelete = false;
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

module.exports = {
	Music:Music,
	secondsToTimeString,
}
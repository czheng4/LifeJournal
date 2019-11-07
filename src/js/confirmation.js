/*
	file.js
	ChaoHuiZheng
	10/05/2019
	
	Confirmation class:
		hold the info: title, text, data 
*/

class Confirmation
{	
	constructor(type,title,text,buttonlabels,isConfirm = false, data = null)
	{
		this.type = type;
		this.title = title;
		this.text = text;
		this.buttonlabels = buttonlabels;
		this.isConfirm = isConfirm;
		this.data = data
	}
}

module.exports = {
	Confirmation:Confirmation
}


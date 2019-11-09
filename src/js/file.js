/*
	file.js
	ChaoHuiZheng
	10/02/2019
	
	File class:
		read file content, append a string to file, write to file with the use of 
		Cryptography
*/



// import from html file
const {Cryptography} = require("../js/cryptography.js");

// import from current directory
//const {Cryptography} = require("./Cryptography.js");
//const fs = require("fs");
class File
{	

	constructor(filename)
	{
		this.filename = filename;
		this.fs = require("fs");
		this.cryptography = new Cryptography(this.filename)
	}

	/* split the string by the sperator and return an array of substrings */
	readBySeparator(sperator)
	{
		if(this.fs.existsSync(this.filename)) 
		{
			var content = this.fs.readFileSync(this.filename,'utf-8');
			content = this.cryptography.decodeString(content)
			content = content.split(sperator);
			return content;
		}
		else return [];
	}
	
	// return a dictonary with key on username and val on password.
	readDict()
	{
		
		var dic = {};

		if(this.fs.existsSync(this.filename)) var content = this.fs.readFileSync(this.filename,'utf-8');
		else return dic;


		// the format of data has to be "key:val\n" each line
		content = this.cryptography.decodeString(content);
		content = content.split("\n");
		
		for(var i = 0; i < content.length - 1; i++)
		{
			let index = content[i].indexOf(":");
			dic[content[i].substr(0,index)] = content[i].substr(index + 1);
		}
	
		return dic;
	}

	//write dict to the file with the format of "val:key\n"
	writeDict(dict)
	{
		let content = "";
		for(var key in dict) content += key + ":" + dict[key] + "\n";
		content = this.cryptography.encodeString(content);
		this.fs.writeFileSync(this.filename,content,'utf8',function(err){
			if(err) throw err;
		});
	}
	// read and decode the file 
	read()
	{
		if(this.fs.existsSync(this.filename)) 
		{
			var content = this.fs.readFileSync(this.filename,'utf-8');
			return this.cryptography.decodeString(content);
		}
		else return "";
	}

	// write to file
	write(content)
	{
		content = this.cryptography.encodeString(content);
		this.fs.writeFileSync(this.filename,content,'utf8',function(err){
			if(err) throw err;
		});
	}

	// append the content to file
	append(content)
	{

		content = this.read() + content;
		content = this.cryptography.encodeString(content);
		this.fs.writeFileSync(this.filename,content,'utf8',function(err){
			if(err) throw err;
		});
	}
}

module.exports = {
	File:File
}



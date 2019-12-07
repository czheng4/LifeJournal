/*
	cryptography.js
	ChaoHuiZheng
	09/22/2019
	

	Random class:
		I use the hash function to implement Random class. we can generate random number
		by call getNumber(). If we pass the same seed to the class. The random number
		generatin will be the same. 
		Note:  	
	
	Cryptography class:
		Encode the data and decode the data.
		The data can be video, image, plain text, music.
		However, I don't recommend to encode music as it's expensive with my algorithm.

		Encryption class is implemented by using utf-8 table.
		Each char has it's own number. Each number has it's own char value.
		I shuffle the utf-8 table with the use of random number(Random class).
		After shuffling, the corresponding char value of a number and corresponding number of a char are
		changed to hide infomation.

		However, it's still easy to decode as a number always has same corresponding char
		and a char always has the same corresponding number even though they are in a messy order. 
		Therefore, when encoding, I take the position of current character into consideration. 
		As a result, we are most likely to have different numbers for same char 
		and different chars for same number. (See implentation below)
		Note: That is why I append a string to a file(see file.js), I have to encode
		the while file again.
	
*/

//const this.fs = require('this.fs');
//const this.path = require('this.path');
/* generate utf8 table from 0 to 55203 */
var utf8_table_to_character = {}
var utf8_table_to_number = {}

for(var i = 0; i <= 55203; i++)
{
	utf8_table_to_character[i] = String.fromCharCode(i);
	utf8_table_to_number[String.fromCharCode(i)] = i;
}


// return the next "stride"th char code 
String.prototype.nextChar = function(stride = 1) 
{
    return String.fromCharCode((this.charCodeAt(0) + stride) % 50000);
}

// replace the this[index] with string "s"
String.prototype.replaceAt = function(index,s)
{
	return this.substr(0,index) + s + this.substr(index + 1,this.length); 
}

// add string "s" at index "index"
String.prototype.addAt = function(index,s)
{
	return this.substr(0,index) + s + this.substr(index,this.length); 
}

/*DJB" hash function from the York University page: http://www.cse.yorku.ca/~oz/hash.html*/
function hash(filename)
{
	var h = 5381;
	
	for(var i = 0; i < filename.length;i++)
	{
		h = (h << 5) + h + utf8_table_to_number[filename[i]];
	}
	if(h < 0) h = -h;
	return h;
}



/* big random number generator */
class Random
{
	constructor(seed)
	{
		// make sure the hash function generators big numbers
		if(seed.length < 3) this.seed = seed + seed[0] + seed[0];
		
		else this.seed = seed;

		this.s = this.seed;
		this.pointer = 0;
		this.length = this.seed.length;
	}
	getNumber()
	{
		/* 
		   we call hash function first to get random number, 
		   and then we increase the s[pointer] by it's value and increase the pointer by one.
		   string is immutable in javascript
		*/
		var rv = hash(this.s);
		var c = this.s.nextChar(utf8_table_to_number[this.s]);
		this.s = this.s.replaceAt(this.pointer,c);
		this.pointer = (this.pointer + 1) % this.length;
		return rv;
	}
}

class Cryptography
{
	// seed is for generating random number
	// size is the size of utf8 table.
	// you may change the size to supporot multiple languages for this app.
	constructor(seed,size = 1000)
	{
		this.fs = require("fs");
		this.path = require("path");
		if(size > 55203) this.size = 55203;
		else this.size = size;
		
		this.seed = seed;
		
		// generate the utf8 table
		var number_to_character = {}
		var character_to_number = {}
		for(var i = 0; i <= this.size; i++)
		{
			number_to_character[i] = String.fromCharCode(i);
			character_to_number[String.fromCharCode(i)] = i;
		}

		
		// shuffle the utf8 table based on seed.
		// so we can encrypt the data by using different tables for different users.
		var random = new Random(seed);
		for(var i = this.size; i >= 0; i--)
		{
			var rn = random.getNumber() % (i+1);
			var tmp = number_to_character[rn];
	
			number_to_character[rn] = number_to_character[i];
			number_to_character[i] = tmp;
		
			character_to_number[number_to_character[rn]] = rn;
			character_to_number[number_to_character[i]] = i;
		}
		this.number_to_character = number_to_character;
		this.character_to_number = character_to_number;

	}

	//encode file "from" and write to "to"
	encodeFile(from, to)
	{

		// encodeing
		var encode = "";
		var content = this.fs.readFileSync(from,"utf8");
		for(var i = 0; i < content.length; i++)
		{
			// find the normal value of character in utf8 table,
			// and then pass it to shffled table to encode.
			var num = utf8_table_to_number[content[i]]; 
			num = (num + i) % this.size; // make sure we have different encoding with same character.
			encode += this.number_to_character[num];
			
		}

		this.fs.writeFileSync(to,encode,"utf8",function(err){
			if(err) throw err;
		})
	}

	//decode file "from" and write to "to"
	decodeFile(from,to)
	{
		//decodeing 
		var decode = "";
		var content = this.fs.readFileSync(from,'utf8');
		
		for(var i = 0; i < content.length; i++)
		{
			// reverse proocess of encoding. find the value in shuffled table and pass it to normal
			// table to decode.
			var num = this.character_to_number[content[i]];
			num = num - i;
			while(num < 0) num += this.size;
			
			decode += utf8_table_to_character[num];
		}
		this.fs.writeFileSync(to,decode,"utf8",function(err){
			if(err) throw err;
		})
	}

	//encode a string.
	encodeString(content)
	{
		var encode = "";
		for(var i = 0; i < content.length; i++)
		{
			// find the normal value of character in utf8 table,
			// and then pass it to shffled table to encode.
			var num = utf8_table_to_number[content[i]];
			num = (num + i) % this.size; // make sure we have different encoding with same character.
			encode += this.number_to_character[num];
			
		}
		return encode;	
	}


	//decode a string
	decodeString(content)
	{

		//decodeing 
		var decode = "";
		for(var i = 0; i < content.length; i++)
		{
			// reverse proocess of encoding. find the value in shuffled table and pass it to normal
			// table to decode.
			var num = this.character_to_number[content[i]];
			num = num - i;
			while(num < 0) num += this.size;
			
			decode += utf8_table_to_character[num];
		}
		return decode;
	}


	// Encyption for video and image.
	encodeRawData(from,to,bytes = 100,isDelete = false)
	{

		/*
			I change the first "bytes" bytes of data to destroy the data
		*/
		var date;
		var random = new Random(to);
		var content = this.fs.readFileSync(from);
		for(var i = 0; i < bytes; i++)
		{	
			content[i] = content[i] + this.character_to_number[utf8_table_to_character[i]];
		}
		this.fs.writeFileSync(to,content);
		
		/* keep same date */
		date = this.fs.statSync(from).mtime
		this.fs.open(to, (err,fd)=>{
			this.fs.futimesSync(fd, date, date);
		})
		if(isDelete == true) this.fs.unlinkSync(from);
		
	}
	decodeRawData(from,to, bytes = 100,isDelete = false)
	{
		/*
			restore data
		*/
		var date;
		var random = new Random(from);
		var content = this.fs.readFileSync(from)
		for(var i = 0; i < bytes; i++)
		{
			content[i] = content[i] - this.character_to_number[utf8_table_to_character[i]];
		}

		this.fs.writeFileSync(to,content);

		/* keep same date */
		date = this.fs.statSync(from).mtime
		this.fs.open(to, (err,fd)=>{
			this.fs.futimesSync(fd, date, date);
		})
		if(isDelete == true) this.fs.unlinkSync(from);
		
	}
}

/* decodoe all the files in dir */
function decodeAll(dir)
{

	/* traverse the ENCODE_DIR and decode all the files to DIR */
	var e = new Cryptography(dir,50000);
	var basename = e.path.parse(dir).base;
	var from = e.path.join(e.path.parse(dir).dir, "ENCODE" + e.path.parse(dir).base);
	var files;
	
	/* decode files.
	   the reason I don't empty the DIR is the user may exit the program the way it didn't get the chance to encode.
	*/
	files = e.fs.readdirSync(from);
	for(var i = 0; i < files.length; i++)
	{
		e.decodeRawData(e.path.join(from,files[i]), e.path.join(dir,files[i]),20);
	}
}

/* encode all the files in dir */
function encodeAll(dir)
{

	/* traverse the DIR and encode all the files to ENCODE_DIR */
	var e = new Cryptography(dir,50000);
	var basename = e.path.parse(dir).base;
	var files;
	var to = e.path.join(e.path.parse(dir).dir, "ENCODE" + e.path.parse(dir).base);
	
	/* delete the original files in ENCODE_DIR in case the users add and delete files */
	files = e.fs.readdirSync(to);
	for(var i = 0; i < files.length; i++) e.fs.unlinkSync(e.path.join(to,files[i]));
	
	/* encode and delete the corresponding decoded files */
	files = e.fs.readdirSync(dir);
	for(var i = 0; i < files.length; i++)
	{
		e.encodeRawData(e.path.join(dir,files[i]), e.path.join(to,files[i]),20,true);
	}


}


module.exports = {
	Random:Random,
	Cryptography: Cryptography,
	decodeAll:decodeAll,
	encodeAll:encodeAll
}


/* encoding a string example */

/*
var e = new Encryption("123",20000);
var a = e.encodeString("12345");
console.log(a);
var b = e.decodeString(a);
console.log(b);
*/

/* encodeing the content of a file. The content of 2.txt is exactly as 2.txt */

/*
var e = new Encryption("123",20000);
e.encodeFile("encryption.js", "1.txt");
e.decodeFile("1.txt","2.txt");
*/

/* encode the raw data(image, video) */

/*
var e = new Encryption("123",20000);
e.encodeRawData("./data/test.avi","./data/2.avi",10);
e.decodeRawData("./data/2.avi","./data/3.avi",10);
*/

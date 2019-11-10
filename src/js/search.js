/*
	search.js
	ChaoHuiZheng
	11/07/2019

	This lib is uesed to highlight a substring(searchValue) in a string(string)
*/

class Search
{

	/*
		1. color is a color code in html
		2. staring_tag and ending_tag will be put around the searchValue to have a highlight effect.
	*/
	constructor(color)
	{
		this.starting_tag = '<span class = "myHighlight" style = "background-color:' + color + '">';
		this.ending_tag = '</span>';
		this.isFind = false;
	}
	/* 
		1. string is a string we search at.
		2. searchValue is a string we are looking at string "string".
		3. return a string with starting_tag and ending_tag around the searchValue in the string "string".
	*/
	search(string, searchValue, case_sensitive = true)
	{
		var regex = case_sensitive == true? new RegExp(searchValue, 'g'): new RegExp(searchValue, 'ig');
		this.isFind = regex.test(string);
		// '$&' means the whole mathed srting
		return string.replace(regex,this.starting_tag + '$&' + this.ending_tag);
		
		// hard code to find the return string.
		/*
		var rv = "";
		var start = 0;
		var pos;
		var searchValueSize = searchValue.length;
		var myString;
		var mySearchValue;
		if(case_sensitive == false)
		{
			myString = string.toLowerCase();
			mySearchValue = searchValue.toLowerCase();
		}
		else
		{
			myString = string;
			mySearchValue = searchValue;
		}

		this.isFind = false;
		while((pos = myString.indexOf(mySearchValue,start)) != -1)
		{
			this.isFind = true;
			rv += string.substr(start, pos - start);
			console.log(string + " " + pos + " " + searchValueSize);
			rv += this.starting_tag + string.substr(pos,searchValueSize) + this.ending_tag;
			start = pos + searchValueSize;

		}
		rv += string.substr(start);
		
		return rv;
		*/
	}
	/* 
		we have to call search first to check if we find it or not.
	*/
	isFindSearchValue()
	{
		return this.isFind;
	}
	color(color)
	{
		this.starting_tag = '<span style = "background-color:' + color + '">';
		this.ending_tag = '</span>';
	}
}

module.exports = {
    Search:Search
}

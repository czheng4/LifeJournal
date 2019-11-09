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
		this.starting_tag = '<span style = "background-color:' + color + '">';
		this.ending_tag = '</span>';
		this.isFind = false;
	}
	/* 
		1. string is a string we search at.
		2. searchValue is a string we are looking at string "string".
		3. return a string with starting_tag and ending_tag around the searchValue in the string "string", 
		or -1 if it never find the searchValue
	*/
	search(string, searchValue)
	{
		var rv = "";
		var start = 0;
		var pos;
		var searchValueSize = searchValue.length;
		this.isFind = false;
		while((pos = string.indexOf(searchValue,start)) != -1)
		{
			this.isFind = true;
			rv += string.substr(start, pos - start);
			rv += this.starting_tag + searchValue + this.ending_tag;
			start = pos + searchValueSize;

		}
		rv += string.substr(start);
		return rv;
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

/*
    theme.js
    ChaoHui Zheng
    11/03/2019
    this lib is for loading and changing the theme mode.
*/

/* when we swap mode in the setting page, we swap mode througout all windows */
function changeThemeMode(event,mode)
{   
    const $ = require("jQuery");
	if(mode == "dark")
	{
		$('link[rel=stylesheet][href~="light.css"]').remove();
		$("head").append('<link rel="stylesheet" type="text/css" href="../css/dark.css">');
	}
	else
	{
		$('link[rel=stylesheet][href~="dark.css"]').remove();
		$("head").append('<link rel="stylesheet" type="text/css" href="../css/light.css">');
	}
}

/* load theme mode when we first load html */
function loadThemeMode()
{
    const remote = require('electron').remote;
    const {File} = require("../js/file.js")
    const user = remote.getGlobal('share').user; 
    let setting = new File("./data/" + user + "/setting.txt");
    let dict = setting.readDict();
    
    if(dict["mode"] == "light") $("head").append('<link rel="stylesheet" type="text/css" href="../css/light.css">');
    else $("head").append('<link rel="stylesheet" type="text/css" href="../css/dark.css">');

    return dict["mode"];
}


module.exports = {
    changeThemeMode:changeThemeMode,
    loadThemeMode:loadThemeMode
}
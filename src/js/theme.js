/*
    theme.js
    ChaoHui Zheng
    11/03/2019
    this lib is for loading and changing the theme mode.
*/

/* when we swap mode in the setting page, we swap mode througout all windows */
function changeThemeMode(event,oldMode, newMode)
{   
    const $ = require("jQuery");

    $('link[rel=stylesheet][href~="' + oldMode + '.css"]').remove();
    $("head").append('<link rel="stylesheet" type="text/css" href="../css/' + newMode + '.css">');
}

/* load theme mode when we first load html */
function loadThemeMode()
{
    const remote = require('electron').remote;
    const {File} = require("../js/file.js")
    const user = remote.getGlobal('share').user; 
    const setting = new File("./data/" + user + "/setting.txt");
    const dict = setting.readDict();
    const mode = dict["mode"];
    $("head").append('<link rel="stylesheet" type="text/css" href="../css/' + mode + '.css">');
    
    return mode;
}


module.exports = {
    changeThemeMode:changeThemeMode,
    loadThemeMode:loadThemeMode
}
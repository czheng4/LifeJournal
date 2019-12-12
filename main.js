// please download libs below
// nmp install bootstrap
// nmp install jquery
'use strict'
const {dialog} = require('electron');
const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');
const os = require('os');
const fs = require("fs");
const mainThread = require('electron').ipcMain;
const {Confirmation} = require("./src/js/confirmation.js");
const {Reminder} = require("./src/js/reminder.js");
const {Cryptography,decodeAll,encodeAll} = require("./src/js/cryptography.js");
const {addToDiaryEntryDict,deleteFromDiaryEntryDict,FromDiaryEntryDict,changeFromDiaryEntryDict} = require("./src/js/diaryEntry.js");
var login, diary, photo, musicWindow, calendarWindow, upload, download, taskConfirm, createAlbum,entryWindow,editAlbum,transferPhoto,singlePhoto,settingWindow;

var entryWindows = {};

/* user holds user name
   album holds album name we are currently in 

   albumFrom holds what album opens the tranfer photo page.
   moverFrom holds the name of photos that being tranfered.
   albumFrom and moveFrom is used in transfer_photo.html.

   image holds the image name when we manipulate a single image(signle_image.html)
   status holds two strings "loading" and "saving" where we decode info when the status is
   loading and encode when the status is saving.

   calendarType is "MONTH", "WEEK" or "SCHEDULE".
*/
global.share = {
    user: null, 
    album : null, 
    image:null, 
    status: null, 
    entryData: null, 
    albumFrom: null,
    moveFrom: null,
   // reminder: null,
    diaryEntryDict: null,
    diaryEntries: null,
    reminderArray: null,
    markDay: null,
    calendarType: "MONTH"
};

var confirmation;
 
/*  process relationship
    login => diary
    diary => photo, musicWindow, calendarWindow, entryWindow
    photo => taskConfirm, upload, download, createAlbum
    
    we store the event when lauching a new window.
    So we can communicate between two children windows.
*/

/*
    photo.html and album.html shares same window.(MAIN_PHOTO <=> MAIN_ALBUM)
    DIARY_PHOTO <=> TEXTBOX

*/
const eventList = {
    "TASK_CONFIRM":null,        // whatever processes open the confirmation page
    "MAIN_ALBUM":null,          // album.html
    "MAIN_PHOTO": null,         // photo.html
    "SINGLE_PHOTO": null,       // single_photo.html
    "MAIN_DIARY":null,          // diary.html
    "PHOTO_TRANSFER_FROM":null, // either photo.html or single_photo.html
    "MAIN_SETTING":null,        // setting.html
    "CONFIRMATION_PAGE":null,   // confirmation.html 
    "DIARY_PHOTO":null,         // diary_photo.html
    "EDIT_ALBUM":null,          // edit_album.html
    "PHOTO_TRANSFER":null,      // photo_transfer.html
    "CREATE_ALBUM":null,        // create_album.html
    "ALBUM_BACKGROUND":null,    // choose_album_background.html
    "CALENDAR":null,            // calendar.js
    "TEXTBOX":{},               // text_box.html
    "MUSIC":null                // music.html
};

mainThread.on("MAIN_ALBUM_REGISTER",(event)=>{
    eventList["MAIN_ALBUM"] = event;
})

mainThread.on("SINGLE_PHOTO_REGISTER",(event)=>{
    eventList["SINGLE_PHOTO"] = event;
})

mainThread.on("MAIN_DIARY_REGISTER",(event)=>{
    eventList["MAIN_DIARY"] = event;
})

mainThread.on("MAIN_PHOTO_REGISTER",(event)=>{
    eventList["MAIN_PHOTO"] = event;
})

mainThread.on("MAIN_SETTING_REGISTER",(event)=>{
    eventList["MAIN_SETTING"] = event;
})

mainThread.on("PHOTO_TRANSFER_REGISTER",(event)=>{
    eventList["PHOTO_TRANSFER"] = event;
})

mainThread.on("EDIT_ALBUM_REGISTER",(event)=>{
    eventList["EDIT_ALBUM"] = event;
})

mainThread.on("CREATE_ALBUM_REGISTER",(event)=>{
    eventList["CREATE_ALBUM"] = event;
})

mainThread.on("ALBUM_BACKGROUND_REGISTER",(event)=>{
    eventList["ALBUM_BACKGROUND"] = event;
})

mainThread.on("CALENDAR_REGISTER",(event)=>{
    eventList["CALENDAR"] = event;
})

mainThread.on("MUSIC_REGISTER",(event)=>{
    eventList["MUSIC"] = event;
})

mainThread.on("TEXTBOX_REGISTER",(event,index)=>{
    eventList["TEXTBOX"][index] = event;
    console.log(eventList["TEXTBOX"]);
})

// set globalVal 
mainThread.on("setGlobalVal",function(event,key,val){
    console.log(key + " " + val);
    global.share[key] = val;
    
})

// open/close "music" page
mainThread.on("openSetting", function(event){
    if(settingWindow != null) 
    {
        if(settingWindow.isMinimized() == true) settingWindow.restore();
        settingWindow.focus();
        return;
    } 
    settingWindow = new BrowserWindow(
    {
        height:500,
        width: 500,
        //resizable: false,
        //frame:false,
        title: "Setting",
        //alwaysOnTop:true,
        webPreferences: { nodeIntegration: true }
    });
    //settingWindow.webContents.openDevTools();
    settingWindow.on('closed',() => {settingWindow = null;});
    //settingWindow.on('blur',() => {settingWindow.close(); settingWindow = null;});
    settingWindow.loadFile("./src/html/setting.html");
})

mainThread.on("closeSetting", function(event){
    settingWindow.close();
    settingWindow = null;
})

mainThread.on("changeThemeMode",function(event,oldMode,newMode){
    eventList["MAIN_DIARY"].sender.send("changeThemeMode",oldMode,newMode);
    if(eventList["MAIN_ALBUM"] != null)         eventList["MAIN_ALBUM"].sender.send("changeThemeMode",oldMode, newMode);
    //if(eventList["MAIN_PHOTO"] != null)       eventList["MAIN_PHOTO"].sender.send("changeThemeMode",mode);
    if(eventList["CONFIRMATION_PAGE"] != null)  eventList["CONFIRMATION_PAGE"].sender.send("changeThemeMode",oldMode, newMode);
    if(eventList["SINGLE_PHOTO"] != null)       eventList["SINGLE_PHOTO"].sender.send("changeThemeMode",oldMode, newMode);
    if(eventList["EDIT_ALBUM"] != null)         eventList["EDIT_ALBUM"].sender.send("changeThemeMode",oldMode, newMode);
    if(eventList["PHOTO_TRANSFER"] != null)     eventList["PHOTO_TRANSFER"].sender.send("changeThemeMode",oldMode, newMode);
    if(eventList["CREATE_ALBUM"] != null)       eventList["CREATE_ALBUM"].sender.send("changeThemeMode",oldMode, newMode);
    if(eventList["ALBUM_BACKGROUND"] != null)   eventList["ALBUM_BACKGROUND"].sender.send("changeThemeMode",oldMode, newMode);
    if(eventList["CALENDAR"] != null)   eventList["CALENDAR"].sender.send("changeThemeMode",oldMode, newMode);
    if(eventList["MUSIC"] != null)   eventList["MUSIC"].sender.send("changeThemeMode",oldMode, newMode);
    for(var key in eventList["TEXTBOX"]) eventList["TEXTBOX"][key].sender.send("changeThemeMode",oldMode, newMode);
    
})
mainThread.on("changeCaseSensitive",function(event,newCaseSensitive){
    eventList["MAIN_DIARY"].sender.send("changeCaseSensitive",newCaseSensitive);
    if(eventList["MUSIC"] != null) eventList["MUSIC"].sender.send("changeCaseSensitive",newCaseSensitive);
    for(var key in eventList["TEXTBOX"]) eventList["TEXTBOX"][key].sender.send("changeCaseSensitive",newCaseSensitive);
})



// open/close diary page
mainThread.on("openDiary",function(event,data){

    diary = new BrowserWindow( 
    { 
        height:700, 
        width: 1000, 
        minHeight:550,
        minWidth:850,
        title: "Doyoument",
        closable: false,
        webPreferences: { nodeIntegration: true }
    });
    diary.webContents.openDevTools();
    global.share.status = "loading";
    global.share.user = data;
    diary.loadFile("./src/html/progress_bar.html");
   
})

mainThread.on("closeDiary",function(event){
    diary.destroy();
    diary = null;
    createWindow();
})


// open/close login page
mainThread.on("openLogin",function(event){
    createWindow();
}) 

mainThread.on("closeLogin",function(event){
    login.close();
    login = null;
}) 


// open/close "music" page
mainThread.on("openMusic", function(event){
    if(musicWindow != null) 
    {
        if(musicWindow.isMinimized() == true) musicWindow.restore();
        musicWindow.focus();
        return;
    } 
    musicWindow = new BrowserWindow(
    {
        height:500,
        width: 500,
        //resizable: false,
        title: "Music",
        webPreferences: { nodeIntegration: true }
    });
    musicWindow.webContents.openDevTools();
    musicWindow.on('closed',() => { musicWindow = null;});
    musicWindow.loadFile("./src/html/music.html");
})

mainThread.on("closeMusic", function(event){
    musicWindow.close();
    musicWindow = null;
})

// open/close "photo" page
mainThread.on("openPhoto", function(event){

    if(photo != null) 
    {
        if(photo.isMinimized() == true) photo.restore();
        photo.focus();
        return;
    } 
    photo = new BrowserWindow(
    {
        height:620,
        width: 770,
        minHeight:600,
        minWidth: 710,
        //resizable: false,
        title: "Album",
        webPreferences: { nodeIntegration: true }
    });
    //photo.webContents.openDevTools();
    photo.on('closed',() => { eventList["MAIN_PHOTO"] = null; eventList["MAIN_ALBUM"] = null; photo = null;});
    
    photo.on('resize',function(){
        eventList["MAIN_ALBUM"].sender.send("resizeImg",photo.getSize()[0]);
    })
   
    //photo.webContents.openDevTools();
    photo.loadFile("./src/html/album.html");
})

mainThread.on("requireResizeImg",function(){
    eventList["MAIN_ALBUM"].sender.send("resizeImg",photo.getSize()[0]);
})

mainThread.on("closePhoto", function(event){
    photo.close();
    eventList["MAIN_PHOTO"] = null;
    eventList["MAIN_ALBUM"] = null;
    photo = null;
})



mainThread.on("openCreateAlbum",function(event){
    
    
   // eventList["MAIN"] = event;
    if(createAlbum != null) 
    {
        if(createAlbum.isMinimized() == true) createAlbum.restore();
        createAlbum.focus();
        return;
    } 
    createAlbum = new BrowserWindow( 
    { 
        height:230, 
        width: 500, 
        //resizable: false,
        title: "Create Album",
        alwaysOnTop:true,
        webPreferences: { nodeIntegration: true }
    });
    createAlbum.on('closed',()=>{ eventList["CREATE_ALBUM"] = null; createAlbum = null; });
    //createAlbum.webContents.openDevTools();
    createAlbum.loadFile("./src/html/create_album.html");
})

mainThread.on("closeCreateAlbum",function(event,dir){
    if(dir !== null) eventList["MAIN_ALBUM"].sender.send("addAlbum",dir);
    createAlbum.close();
    createAlbum = null;
    eventList["CREATE_ALBUM"] = null;
})

// open/close calendar
mainThread.on("openCalendar", function(event){
    if(calendarWindow != null) 
    {
        calendarWindow.focus();
        return;
    } 
    calendarWindow = new BrowserWindow(
    {
        height:800,
        width: 800,
        //resizable: false,
        title: "Calendar",
        webPreferences: { nodeIntegration: true }
    });
    calendarWindow.webContents.openDevTools();
    calendarWindow.on('closed',() => { eventList["CALENDAR"] = null;calendarWindow = null;});
    calendarWindow.loadFile("./src/html/calendar.html");

    calendarWindow.on('resize',function(){
        console.log(calendarWindow.getSize()[0]);
        eventList["CALENDAR"].sender.send("resizeCalendar",calendarWindow.getSize()[0]);
    })
})

mainThread.on("resizeCalendar",function(event){
    event.sender.send("resizeCalendar",calendarWindow.getSize()[0]);
})

mainThread.on("closeCalendar", function(event){
    calendarWindow.close();
    calendarWindow = null;
    eventList["CALENDAR"] = null;
})

mainThread.on("refreshCalendar",function(event,type, entryData, oldEntryData = null){
    if(type == "DELETE")
    {
        deleteFromDiaryEntryDict(global.share.diaryEntryDict,entryData);
        if(eventList["CALENDAR"] != null) eventList["CALENDAR"].sender.send("refreshCalendar",type,entryData);
    }
    if(type == "ADD")
    {
        addToDiaryEntryDict(global.share.diaryEntryDict,entryData);
        if(eventList["CALENDAR"] != null) eventList["CALENDAR"].sender.send("refreshCalendar",type,entryData);
    }
    if(type  == "CHANGE")
    {
        changeFromDiaryEntryDict(global.share.diaryEntryDict,entryData, oldEntryData);
        if(eventList["CALENDAR"] != null) eventList["CALENDAR"].sender.send("refreshCalendar",type,entryData,oldEntryData);
    }
})



mainThread.on("updateReminders", function(event, type, reminder, index2 = -1){
    if(type == "DELETE") Reminder.deleteFromReminderArray(global.share.reminderArray,reminder);
    if(type == "ADD") Reminder.addToReminders(global.share.reminderArray,reminder);
    if(type == "CHANGE") Reminder.changeFromReminders(global.share.reminderArray,reminder);
    if(type == "ALARM") global.share.reminderArray[reminder].isSchedule[index2] =  !global.share.reminderArray[reminder].isSchedule[index2];
    eventList["MAIN_DIARY"].sender.send("updateReminders",type, reminder,index2);
    
})

mainThread.on("getReminderArray",function(event){
    event.sender.send("getReminderArray",global.share.reminderArray);
})
// deletion confirm window
mainThread.on("openConfirmation",function(event,data){
    
   
    // fix the bug where we have multiple same windows
    if(taskConfirm != null) 
    {
        taskConfirm.focus();
        return;
    } 
    confirmation = data;
    console.log(confirmation.type);
    eventList["TASK_CONFIRM"] = event;
    
    taskConfirm = new BrowserWindow( 
    { 
        height:230, 
        width: 500, 
        resizable: false,
        title: confirmation.title,
        alwaysOnTop: true,
        movable: false,
        minimizable: false,
        maximizable: false,
        //frame:false,
        webPreferences: { nodeIntegration: true }
    });
   
    //taskConfirm.webContents.openDevTools();
    taskConfirm.on('closed',()=>{ eventList["CONFIRMATION_PAGE"] = null; taskConfirm = null; });
    //taskConfirm.on('blur',() => { taskConfirm.close(); eventList["CONFIRMATION_PAGE"] = null; taskConfirm = null;});
    taskConfirm.loadFile("./src/html/confirmation.html");
  
})

mainThread.on(("askConfirmationData"), function(event){
    eventList["CONFIRMATION_PAGE"] = event;
    event.sender.send("getConfirmationData",confirmation);
})

mainThread.on("closeConfirmation",function(event,confirmation){
    
    taskConfirm.close();
    taskConfirm = null;
    if(confirmation.isConfirm == true) 
    {
        switch(confirmation.type)
        {
            case "BULK_PHOTO_DELETION":
                eventList["TASK_CONFIRM"].sender.send("BULK_PHOTO_DELETION");
                break;

            case "SINGLE_PHOTO_DELETION":
                eventList["TASK_CONFIRM"].sender.send("SINGLE_PHOTO_DELETION");
                break;

            case "ALBUM_DELETION":
                eventList["TASK_CONFIRM"].sender.send("ALBUM_DELETION");
                break;
            
            case "PHOTO_TRANSFER":
                //transferPhoto.close();
                //transferPhoto = null;
                eventList["TASK_CONFIRM"].sender.send("PHOTO_TRANSFER");
                
                break;
            
            case "ENTRY_DELETION":
                eventList["TASK_CONFIRM"].sender.send("ENTRY_DELETION");
                break;

            case "ENTRY_CANCELLATION":
                eventList["TASK_CONFIRM"].sender.send("ENTRY_CANCELLATION");
                break;

            case "DIARY_PHOTO_DELETION":
                eventList["TASK_CONFIRM"].sender.send("DIARY_PHOTO_DELETION");
                break;

            case "REMINDER_CANCELLATION":
                eventList["TASK_CONFIRM"].sender.send("REMINDER_CANCELLATION");
                break;

            case "REMINDER_DELETION":
                eventList["TASK_CONFIRM"].sender.send("REMINDER_DELETION");
                break;
            case "ALARM_SOUND":
                eventList["TASK_CONFIRM"].sender.send("ALARM_SOUND_RENEW",confirmation.data);
                break;

            case "MUSIC_DELETION":
                eventList["TASK_CONFIRM"].sender.send("MUSIC_DELETION");
                break;
            case "SIGN_OUT":
                global.share.status = "saving";
                diary.loadFile("./src/html/progress_bar.html");
                break;
        }
       
    }
    else
    {
        switch(confirmation.type)
        {
            case "ALARM_SOUND":
                eventList["TASK_CONFIRM"].sender.send("ALARM_SOUND_CANCEL");
                break;
        }
    }
    eventList["CONFIRMATION_PAGE"] = null;
})

// album edit
mainThread.on("openEditAlbum",function(event){
    
    eventList["MAIN_PHOTO"] = event;
    // fix the bug where we have multiple same windows
    if(editAlbum != null) 
    {
        editAlbum.focus();
        return;
    } 
    editAlbum = new BrowserWindow( 
    { 
        height:400, 
        width: 600, 
        resizable: false,
        title: "Edit",
        alwaysOnTop: true,
        minimizable: false,
        maximizable: false,
        webPreferences: { nodeIntegration: true }
    });
    //editAlbum.webContents.openDevTools();
    editAlbum.on('closed',()=>{ 
        eventList["ALBUM_BACKGROUND"] = null;
        eventList["EDIT_ALBUM"] = null; 
        editAlbum = null; 
    });
    editAlbum.loadFile("./src/html/edit_album.html");
})

mainThread.on("closeEditAlbum",function(event,name,isGoBackToAlbumPage){
    if(name != null) 
    {
        if(name == "loadAlbumPage") 
        {
            if(isGoBackToAlbumPage == true) photo.loadFile("./src/html/album.html");
        }
        else eventList["MAIN_PHOTO"].sender.send("rename",name);
    }

    editAlbum.close();
    editAlbum = null;
    eventList["EDIT_ALBUM"] = null;
    eventList["ALBUM_BACKGROUND"] = null;
})


// album edit
mainThread.on("openTransferPhoto",function(event,albumFrom,moveFrom){
    
    global.share.albumFrom = albumFrom;
    global.share.moveFrom = moveFrom;

    // fix the bug where we have multiple same windows
    if(transferPhoto != null) 
    {
        transferPhoto.focus();
        return;
    } 
    eventList["PHOTO_TRANSFER_FROM"] = event;
    transferPhoto = new BrowserWindow( 
    { 
        height:400, 
        width: 600, 
       // resizable: false,
        title: "Transfer",
        alwaysOnTop: true,
        webPreferences: { nodeIntegration: true }
    });
    //transferPhoto.webContents.openDevTools();
    transferPhoto.on('closed',()=>{ eventList["PHOTO_TRANSFER"] = null; transferPhoto = null; });
    transferPhoto.loadFile("./src/html/transfer_photo.html");
})

mainThread.on("closeTransferPhoto",function(event){
   
    transferPhoto.close();
    transferPhoto = null;
    eventList["PHOTO_TRANSFER"] = null;
})
/* reshow the photos at the single_photo.html or photo.html 
   update the diaryEntries in diary.html
*/
mainThread.on("PHOTO_TRANSFER_DONE",(event,filePaths)=>{
    eventList["MAIN_DIARY"].sender.send("updateDiaryEntries",filePaths);
    eventList["PHOTO_TRANSFER_FROM"].sender.send("PHOTO_TRANSFER_DONE");
})

mainThread.on("openSinglePhoto",function(event,data){
    //eventList["MAIN_PHOTO"] = event;
    if(singlePhoto != null)
    {
        singlePhoto.focus();
        global.share.image = data;
        eventList["SINGLE_PHOTO"].sender.send("changePhoto");
        return;
    }
    singlePhoto = new BrowserWindow( 
    { 
        height:700, 
        width: 1000,
        minWidth:800,
        minHeight:600,
        title: "Photo",
        webPreferences: { nodeIntegration: true }
    });
   // singlePhoto.webContents.openDevTools();
    singlePhoto.loadFile("./src/html/single_photo.html");
    singlePhoto.on('closed',()=>{ eventList["SINGLE_PHOTO"] = null; singlePhoto = null; });
    global.share.image = data;
})

mainThread.on("closeSinglePhoto",function(event){
    eventList["SINGLE_PHOTO"] = null;
    singlePhoto.close();
    singlePhoto = null;
})


mainThread.on("refreshSinglePhoto",(event)=>{
    if(eventList["SINGLE_PHOTO"] != null) eventList["SINGLE_PHOTO"].sender.send("refreshSinglePhoto");
})

mainThread.on("refreshPhotos",(event)=>{
   
    if(eventList["MAIN_PHOTO"] != null) eventList["MAIN_PHOTO"].sender.send("refreshPhotos");
})

// Open Textbox for Entry Input
mainThread.on("openEntry", function(event,index, data = null){
    
    /* index = 0xffffff is reserved for wirting a new diary */


    global.share.entryData = data;
   
    if(index in entryWindows)
    {
        entryWindows[index].focus();
        return;
    }
    entryWindow = new BrowserWindow(
    {
        height: 600,
        width: 550,
        minHeight:450,
        minWidth:550,
        closable:false,
        title: "Entry",
        webPreferences: {nodeIntegration: true}
    });
    //entryWindow.webContents.openDevTools();
    entryWindow.on('closed', ()=> {
        delete entryWindows[index];
        delete eventList["TEXTBOX"][index];
    });
    entryWindow.loadFile("./src/html/text_box.html");

    entryWindows[index] = entryWindow;
})

mainThread.on("closeEntry",function(event, type, entryData){
    
    let indexOfWindow;
    if(entryData == null || type == "ADD") indexOfWindow = 0xffffff;
    else indexOfWindow = entryData.indexOfWindow;

    if(entryData != null) eventList["MAIN_DIARY"].sender.send("reload",type, entryData);
    entryWindows[indexOfWindow].destroy();
    delete entryWindow[indexOfWindow];
    delete eventList["TEXTBOX"][indexOfWindow];
    
})

/* send info to diary_photo.html */
mainThread.on("sendInfoToDiaryPhoto",(event,index,oldDiaryEntry,newDiaryEntry)=>{
    mainThread.once("getDiaryInfo",(event1)=>{
        event1.sender.send("getDiaryInfo",index,oldDiaryEntry,newDiaryEntry);
    })
})

/* restore info back to text_box.html */
mainThread.on("sendDiaryEntry",(event,oldDiaryEntry,newDiaryEntry)=>{
    mainThread.once("getDiaryInfo",(event1)=>{
        event1.sender.send("getDiaryInfo",oldDiaryEntry,newDiaryEntry);
    })
})


// file dialog
mainThread.on("upload", function(event,data, specifier = ""){
    if(upload != null) return; 

    //dummy window to make dialog always on the top.
    var win = new BrowserWindow({
        height: 550,
        width: 797,
        resizable: false,
        alwaysOnTop: true,
        webPreferences: { nodeIntegration: true }
    });
    upload = dialog.showOpenDialog(win,{
        buttonLabel: 'upload',
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif','jpeg'] },
            { name: 'Music', extensions: ['mp3'] },
            { name: 'Video', extensions: ['avi'] },
            { name: 'All Files', extensions: ['*'] }]
    }, (filenames) => {


        var paths = []
        win.close();
        /* sort files with the number in the FILE_NAME */
        var files = fs.readdirSync("./data/" + global.share.user + "/" + data).sort(function(t1,t2){return parseInt(t1) - parseInt(t2);});
        var size;

        /* name our files with NUMBER-FILE_NAME. Therefore, we can have multiple same files */
        if(files.length == 0) size = 1;

        /* grab the biggest number */
        else size =  1 + parseInt(files[files.length - 1]);
        console.log(files);
        console.log("size" + size);
        for(var i = 0; i < filenames.length; i++)
        {
            var path = filenames[i];
            
            path = path.split("/");
            paths.push((i + size) + "-" + specifier + path[path.length - 1]);
            path = "./data/" + global.share.user + "/" + data + (i + size) + "-" + specifier + path[path.length - 1];
           
            
            fs.copyFileSync(filenames[i], path, (err) => {if(err) throw err;});
        }

        upload = null;
       
        event.sender.send("doneUpload",paths);
        
    });
   
})

//download files
mainThread.on("download", function(event,type,filenames){
    if(download != null) return; 

    //dummy window to make dialog always on the top.
    var win = new BrowserWindow({
        height: 550,
        width: 797,
        resizable: false,
        alwaysOnTop: true,
        webPreferences: { nodeIntegration: true }
    });
    download = dialog.showOpenDialog(win,{
        buttonLabel: 'save',
        filters: [{ name: 'None', extensions: [''] }],
        properties: ['openDirectory','createDirectory']
    }, (directory)=>{
        if(directory.length == 0)  // clicked cancel button
        {
            download = null;
            win.close();
            return;
        }
        var path = "./data/" + global.share.user + "/" + type;
        var dir = directory[0] + "/";
        for(var i = 0; i < filenames.length; i++)
        {
            fs.copyFile(path + filenames[i], dir + filenames[i],(err) => {if(err) throw err;});
        }
        download = null;
        win.close();
    });
           
})

/*
mainThread.on("scheduleAlarm",function(event,reminder){
   eventList["MAIN_DIARY"].sender.send("scheduleAlarm",reminder);
})
*/

mainThread.on("getReminder",function(event){
    event.sender.send("getReminder",global.share.reminder);
})
// show error meesage
mainThread.on("errorMessage", function(event,title,content){
    dialog.showErrorBox(title,content);
})



// when the program is lauched, create the first window which is login page.
function createWindow() 
{ 
    
    login= new BrowserWindow( 
    { 
        height:600, 
        width: 550, 
        //resizable: false,
        title: "Login",
        webPreferences: { nodeIntegration: true },
    })
    //login.loadFile("./src/html/progress_bar.html");
    //login.loadFile("./src/html/reminder.html");
    login.loadFile("./src/html/login.html");
    //login.webContents.openDevTools();
    login.on('closed',()=>{ login = null; })
            
}  

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
    app.quit();
    }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
    if (login === null) {
    createWindow();
    }
})



var eServerState = 
{
    eReady : 0,
    eSynchronizing : 1,
    eStopped: 2,
    eNotEnoughSpace : 3,
    eBusy : 4,
    eStorageNotFound : 5
};

var eTabPages = 
{
    eSync : 0,
    eSettings : 1,
    eDevices: 2,
    eAuth : 3,
    eLicense : 4,
    eAbout : 5
};

var DTHttpServPage = function()
{
    this.arrDevices = new Array();
    this.arrMediaSettings = new Array();
    this.arrState = new Array();
    this.arrAuth = new Array();
    this.bMediaSyncStarted = true;
    this.bWarnIsShown = false;
    this.bPassIsShown = false;
    this.bLangListIsShown = false;
}
/**********************************************************************************************************************/
function OnDocumentReady()
{
    CompatibilityObj.Initialize();
    $('.fancybox').fancybox();

    TranslationObj.Initialize();    

    MainPageObj.UpdateTabNav();
     
    MainPageObj.LoadDefaults();
    
    DirBrowserObj.InitializeCtrl('DirControlHolder');
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.LoadDefaults = function()
{
    sendAjaxRequest('ajax_get_defaults', this.StoreDefaultValues, this);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.StoreDefaultValues = function(strDefaults, selfObj)
{
    var arrDefaults = eval( '(' + strDefaults + ')' );

    var selectLanguages = document.getElementById('ListLanguages');
    var arrLanguages = arrDefaults[0].Languages.split(",");
    for (var i = 0; i < arrLanguages.length; i++) 
    {
        var lang = GetLangNameByISO(arrLanguages[i]);
        
        var elemLI = document.createElement('li');
        elemLI.id = arrLanguages[i];
        elemLI.setAttribute('Searchable', true);
        var elemA = document.createElement('a');
        var elemSPAN = document.createElement('span');
        elemSPAN.className = 'icons-language ' + arrLanguages[i];
        elemA.innerHTML = lang;
        elemA.href = 'javascript:void(0);';
        elemA.appendChild(elemSPAN);
        elemLI.appendChild(elemA);
        AttachEvent(elemLI, "click", OnLanguageChanged);
        selectLanguages.appendChild(elemLI);
    }

    document.getElementById('ProductVersion').innerHTML = arrDefaults[0].Version;
    selfObj.UpdateStartStopButtonState(arrDefaults[0].State);
    selfObj.UpdateMediaSyncStatus();
    selfObj.UpdateMediaSettings();
    selfObj.UpdateDevicesList();
    selfObj.UpdateAuthInfo();
    /*if (arrDefaults[0].OS == 'MAC') // should stay commented while app isn't is App Atore
    {        
        document.getElementById('LicenseType').outerHTML = "";
        document.getElementById('LicenseTypeLabel').outerHTML = "";
        document.getElementById('DaysOrSerialLabel').outerHTML = "";
        document.getElementById('DaysOrSerial').outerHTML = "";
        document.getElementById('InstallationName').outerHTML = "";
        document.getElementById('InstallationNameLabel').outerHTML = "";
        document.getElementById('SystemID').outerHTML = "";
        document.getElementById('SystemIDLabel').outerHTML = "";
        document.getElementById('CheckForUpdatesButton').outerHTML = ""; 
    }
    else
    {*/
        LicenseWizardObj.InitializeWizard();
    //}
    if (arrDefaults[0].OS == 'LINUX')
    {
        document.getElementById('CheckForUpdatesButton').outerHTML = "";
    }    
}
/**********************************************************************************************************************/
function GetLangNameByISO(strISOName) {
    var lang = "English";
    switch (strISOName) {
        case "cs":
            lang = "Czech";
            break;
        case "de":
            lang = "Deutsch";
            break;
        case "en":
            lang = "English";
            break;
        case "es":
            lang = "Spanish";
            break;
        case "fr":
            lang = "Français";
            break;
        case "fi":
            lang = "Suomi";
            break;
        case "it":
            lang = "Italiano";
            break;
        case "ja":
            lang = "日本語";
            break;
        case "kr":
            lang = "한국어";
            break;
        case "pt":
            lang = "Portuguese";
            break;
        case "pl":
            lang = "Polski";
            break;
        case "ru":
            lang = "Русский";
            break;
        case "sv":
            lang = "Svenska";
            break;
        case "tr":
            lang = "Türkçe";
            break;
        case "uk":
            lang = "Українська"
            break;
        case "zh-rCN":
            lang = "简体中文";
            break;
	    case "zh-rTW":
            lang = "正體中文";
            break;
    }
    return lang;
}

/**********************************************************************************************************************/
function AttachEvent(element, type, handler) {
    if (element.addEventListener) element.addEventListener(type, handler, false);
    else element.attachEvent("on" + type, handler);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.UpdateMediaSettings = function()
{
    sendAjaxRequest('ajax_get_msettings', this.LoadMediaSettings, this);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.UpdateTabNav = function()
{
    var activeNumb = GetFromStorage("ActiveTab", "0");

    var url = document.location.toString();
    if (url.match('#'))
    {
        var startTab = url.split('#')[1];
        
        startTab = startTab.trim();
        if (startTab.length != 0 && startTab !== "" && !isNaN(parseInt(startTab)))
        {
            activeNumb = startTab; 
        }
    } 
    
    var activeItem = document.getElementById("tabHeader_" + activeNumb );
    activeItem.parentNode.setAttribute("data-current", activeNumb);
    activeItem.setAttribute("class","active");

    var container = document.getElementById("container");
    var pages = container.querySelectorAll(".tabpage");
    for (var i = 0; i < pages.length; i++) 
    {
        if (i == activeNumb)
        {
            pages[i].style.display = "block";
            continue;
        }
        pages[i].style.display = "none";
    }

    var tabs = document.getElementById("header-inner").querySelectorAll("#tabs ul li");
    for (var i = 0; i < tabs.length; i++)
    {
        if (i != 4)
            tabs[i].onclick = displayPage;
    }
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.LoadMediaSettings = function(strSettingsData, selfObj)
{
    var prevLang = '';   
    if (this.arrMediaSettings)
    {
        prevLang = this.arrMediaSettings[0].InterfaceLanguage; 
    }
    try 
    { 
        delete selfObj.arrMediaSettings;
    } 
    catch(e) 
    { 
        selfObj["arrMediaSettings"] = undefined; 
    }         
    
    if (strSettingsData != '')
    {
        selfObj.arrMediaSettings = eval( "(" + strSettingsData + ")" );
        SetCurrentPath(selfObj.arrMediaSettings[0].MainFolder);
        SetServerName(selfObj.arrMediaSettings[0].ServerName);
        var currentLang = selfObj.arrMediaSettings[0].InterfaceLanguage;
        if (currentLang == '') 
        {
            currentLang = "en";
        }
        var selectLanguages = document.getElementById('CurrentLanguage');
        var elemSPAN = document.createElement('span');
        elemSPAN.className = 'icons-language ' + currentLang;
        selectLanguages.innerHTML = GetLangNameByISO(currentLang);
        selectLanguages.appendChild(elemSPAN);
    }
    if (currentLang != prevLang)
    {
       TranslationObj.Retranslate(currentLang);
    }
    selfObj.UpdateSaveFolderButtonState();
}
/**********************************************************************************************************************/
function GetParentElement(elemChild, strParentNodeType)
{
    var elemTemp = elemChild;
    while (elemTemp)
    {
        if (elemTemp.nodeName == strParentNodeType && elemTemp.getAttribute('Searchable'))
            break;

        elemTemp = elemTemp.parentNode;
    }
    
    return elemTemp;
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.onClickDispatcher = function(event)
{
    var eventObjNew = event || window.event;
    if (eventObjNew && eventObjNew.stopPropagation)
        eventObjNew.stopPropagation();

    var objSender = eventObjNew.target || eventObjNew.toElement || eventObjNew.srcElement;
    var elemParentLI = GetParentElement(objSender, 'LI');
    if (!elemParentLI)
        return;

    var strDeviceMAC = elemParentLI.getAttribute('mac');
    var strDeviceName = elemParentLI.getAttribute('DeviceName');

    var objSenderNodeName = objSender.nodeName;
    if (objSenderNodeName == 'A')
    {
        if (objSender.className == 'ico delete')
        {
            this.RequestDeviceRemove(strDeviceName, strDeviceMAC);
        }
    }
    else if (objSenderNodeName == 'INPUT')
    {
        var CbID = elemParentLI.getAttribute('AllowBrowseCheckboxID');
        var command = 'Browse';
        if ( objSender.id == elemParentLI.getAttribute('NotifyCheckboxID') )
        {
            CbID = elemParentLI.getAttribute('NotifyCheckboxID');
            command = 'Notify';
        }
        this.OnDeviceSettingsChanged(strDeviceMAC,  CbID, command );
    }
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.RequestDeviceRemove = function(strDeviceName, strDeviceMAC)
{
    var selfObj = this;
    QuestionCtrlObj.SetText(TranslationObj.getStringValue("unlinkdevice"), TranslationObj.getStringValue("wannaunlink") + strDeviceName + '?', strDeviceName);
    QuestionCtrlObj.AddButton(TranslationObj.getStringValue("yes"), ButtonRoleEnum.ID_BUTTON_OK, function(bRemove){selfObj.OnUnlinkDevice(strDeviceMAC, bRemove);});
    QuestionCtrlObj.AddButton(TranslationObj.getStringValue("no"), ButtonRoleEnum.ID_BUTTON_CLOSE);
    QuestionCtrlObj.Open();
}
/**********************************************************************************************************************/
function ShowErrorMsg(strCode)
{
    QuestionCtrlObj.SetText(TranslationObj.getStringValue("err" + strCode), TranslationObj.getStringValue("errdesc" + strCode));
    QuestionCtrlObj.AddButton(TranslationObj.getStringValue("yes"), ButtonRoleEnum.ID_BUTTON_OK);
    QuestionCtrlObj.RemoveButton(ButtonRoleEnum.ID_BUTTON_CLOSE);
    QuestionCtrlObj.Open();
}
/**********************************************************************************************************************/
function HandleMediaSyncSwitchResult(strResult)
{
    var arrResp = eval( '(' + strResult + ')' );
    if (!arrResp)
       return;
    DTWaitDialogObj.Stop();

    if (arrResp[0].Result != '0')
    {
        ShowErrorMsg(arrResp[0].Result);
    }
    else
    {
        MainPageObj.UpdateStartStopButtonState(arrResp[0].State);        
        MainPageObj.bMediaSyncStarted = !MainPageObj.bMediaSyncStarted;
        UpdateStartStopButtonText();        
    }
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.ProceedSwitchStartStop = function()
{
    DTWaitDialogObj.Start();
    sendAjaxRequest('ajax_mediasync_control?SetMediaSyncEnabled=' + (this.bMediaSyncStarted ? 'FALSE' : 'TRUE'), HandleMediaSyncSwitchResult);    
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.OnStartStopServiceBtnClick = function()
{
    if (!this.bMediaSyncStarted)
    {
        this.ProceedSwitchStartStop();
        return;
    }

    var selfObj = this;
    QuestionCtrlObj.SetText(TranslationObj.getStringValue("stopservice"), TranslationObj.getStringValue("doyouwannastop"));
    QuestionCtrlObj.AddButton(TranslationObj.getStringValue("stop"), ButtonRoleEnum.ID_BUTTON_OK, function(){selfObj.ProceedSwitchStartStop();});
    QuestionCtrlObj.AddButton(TranslationObj.getStringValue("cancel"), ButtonRoleEnum.ID_BUTTON_CLOSE);
    QuestionCtrlObj.Open();
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.OnSetAdminPage = function()
{ 
    MainPageObj.SetActivePageByIdent(4);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.OnSetSettingsPage = function()
{ 
    MainPageObj.SetActivePageByIdent(2);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.SetActivePageByIdent = function(ident)
{
    var adminHeader = document.getElementById("tabHeader_" + ident);
    var current = adminHeader.parentNode.getAttribute("data-current");
    document.getElementById("tabHeader_" + current).removeAttribute("class");
    document.getElementById("tabpage_" + current).style.display="none";

    adminHeader.setAttribute("class","active");
    UpdatePageOnSwitch(ident);
    adminHeader.parentNode.setAttribute("data-current",ident);
    SaveToStorage('ActiveTab', ident); 
}
/**********************************************************************************************************************/
function OnBuyNowClicked()
{
    window.open("https://www.disc-soft.com/order/iscsi-target");
}
/**********************************************************************************************************************/
function OnSelectFolder()
{
    DirBrowserObj.OpenBrowser();
}
/**********************************************************************************************************************/
function OnRecreateMainFolder()
{
    sendAjaxRequest('ajax_recreate_mainfolder', ChangeSettingsResultHandler, null);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.OnSaveFolderSettingsClick = function()
{
    var selfObj = this;
    if (IsActionDisabled("SaveMainFolderButton"))
    {
        return;
    }
    QuestionCtrlObj.SetText(TranslationObj.getStringValue("wannachangefolder"), TranslationObj.getStringValue("relocatewarning"));
    QuestionCtrlObj.AddButton("OK", ButtonRoleEnum.ID_BUTTON_OK, function(){selfObj.ProceedChangeMainFolder();});
    QuestionCtrlObj.AddButton(TranslationObj.getStringValue("cancel"), ButtonRoleEnum.ID_BUTTON_CLOSE);
    QuestionCtrlObj.Open();
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.OnCheckForUpdatesClick = function()
{
    sendAjaxRequest('ajax_check_updates', this.ChangeSettingsResultHandler, this);
}
/**********************************************************************************************************************/
function OnLanguageChanged(e) {
    var parentLi = GetParentElement(e.target, "LI");
    MainPageObj.ProceedChangeInterfaceLanguage(parentLi.id);
}
/**********************************************************************************************************************/
function OnLanguageExpand() {
    var curLang = document.getElementById("CurrentLanguage").parentNode;
    this.bLangListIsShown = !this.bLangListIsShown;
    if (this.bLangListIsShown) {
        curLang.className = "lang-link active";
    }
    else {
        curLang.className = "lang-link";
    }
}
/**********************************************************************************************************************/
function OnSaveLoginPassClicked()
{
    MainPageObj.ProceedChangeLoginPassword();
}
/**********************************************************************************************************************/
function OnMainFolderChanged()
{
    MainPageObj.UpdateSaveFolderButtonState();
}
/**********************************************************************************************************************/
function OnServerNameChanged()
{
    MainPageObj.ServerNameChanged();
}
/**********************************************************************************************************************/
function OnLoginChanged()
{
    MainPageObj.HandleLoginChanged();
}
/**********************************************************************************************************************/
function OnPassChanged()
{
    MainPageObj.UpdateSaveLoginPassButtonState();
}
/**********************************************************************************************************************/
function OnShowPass()
{
    MainPageObj.OnShowPassChanged();
}
/**********************************************************************************************************************/
function ChangeSettingsResultHandler(strResult, selfObj)
{
    if (strResult != '0')
    {
        ShowErrorMsg(strResult);
    }
}
/**********************************************************************************************************************/
function ChangeFolderResultHandler(strResult, strPath)
{    
    if (strResult == 'ResendData') // crutch
    {
        MainPageObj.ProceedChangeMainFolder();
        return;
    }

    DTWaitDialogObj.Stop();                      
    if (strResult == '0')
    {
        MainPageObj.arrMediaSettings[0].MainFolder = strPath;
        MainPageObj.UpdateSaveFolderButtonState();
    }
    else if (strResult == '1014')
    {               
        OnStorageLost();
    }
    else
    {
        ShowErrorMsg(strResult);
    }
    
}
/**********************************************************************************************************************/
function ChangeAuthResultHandler(strResult, strLogin)
{
    if (strResult != '0')
    {
        ShowErrorMsg(strResult);
    }
    else
    {
        MainPageObj.arrAuth[0].Login = strLogin;
        SetCurrentPass('');
        SetCurrentPassConfirm('');
        MainPageObj.UpdateSaveLoginPassButtonState();
    }
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.ProceedChangeMainFolder = function()
{
    var path = GetCurrentPath();
    var lastSymbol = path.slice(-1);
    if (lastSymbol != "\\" && lastSymbol != "/")
    {
        path += "/";
        SetCurrentPath(path);
    }
    DTWaitDialogObj.Start();
    sendAjaxRequest('ajax_change_mainfolder?MainFolder=' + path, ChangeFolderResultHandler, path);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.ProceedChangeInterfaceLanguage = function(lang) {
    var currLang = document.getElementById("CurrentLanguage");
    var selectedLI = document.getElementById(lang);
    currLang.innerHTML = selectedLI.firstChild.innerHTML;
    TranslationObj.Retranslate(lang);
    OnLanguageExpand();
    sendAjaxRequest('ajax_change_language?InterfaceLanguage=' + lang, ChangeSettingsResultHandler, this);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.ProceedChangeLoginPassword = function()
{
    if (IsActionDisabled("SaveLoginPassButton"))
    {
        return;
    }
    var strLogin = GetCurrentLogin();
    var strRequest = "Login=";
    strRequest += strLogin;
    strRequest += "&Password=";
    strRequest += encodeURIComponent(document.getElementById('UserPass').value);

    sendAjaxRequest('ajax_change_auth?' + strRequest, ChangeAuthResultHandler, strLogin);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.HandleLoginChanged = function()
{
    var elemPwd = document.getElementById('UserPass');        
    var elemPwdConfirm = document.getElementById('UserPassConfirm');
    if (GetCurrentLogin().length > 0)
    {
        elemPwd.removeAttribute('disabled');
        elemPwdConfirm.removeAttribute('disabled');
    }
    else
    {
        elemPwd.setAttribute('disabled', 'disabled');
        elemPwdConfirm.setAttribute('disabled', 'disabled');
    }
    MainPageObj.UpdateSaveLoginPassButtonState();
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.OnShowPassChanged = function()
{
    var passElement = document.getElementById("UserPass");
    var passConfirmElement = document.getElementById("UserPassConfirm");
    var visElementPass = document.getElementById("UserPassVis");
    var visElementPassConfirm = document.getElementById("UserPassConfirmVis");
    this.bPassIsShown = !this.bPassIsShown;
    if (this.bPassIsShown)
    { 
        passElement.type = "text";
        passConfirmElement.type = "text";
        visElementPass.className = "visibility active";
        visElementPassConfirm.className = "visibility active";
    }
    else
    {
        passElement.type = "password";
        passConfirmElement.type = "password";
        visElementPass.className = "visibility";
        visElementPassConfirm.className = "visibility";
    }
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.OnDeviceSettingsChanged = function(strMAC, elemId, command)
{
    var cbElement = document.getElementById(elemId);
    if (cbElement)
    { 
        var strRequest = 'mac=' + strMAC;
        strRequest += '&' + command +'=' + (cbElement.checked ? '1' : '0');
        sendAjaxRequest('ajax_change_dsettings?' + strRequest, ChangeSettingsResultHandler, this);
    }
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.OnUnlinkDevice = function(strDeviceMAC, bRemove)
{
    sendAjaxRequest('ajax_unlink_device?' + strDeviceMAC +'=' + (bRemove ? 'TRUE' : 'FALSE'), DeviceUnlinkResultHandler, this);
}
/**********************************************************************************************************************/
function DeviceUnlinkResultHandler(strResult, selfObj)
{
    if (strResult != '0')
    {
        ShowErrorMsg(strResult);
    }    

    selfObj.UpdateDevicesList();
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.UpdateMediaSyncStatus = function()
{
    sendAjaxRequest('query_status', ProceedUpdateMediaSyncStatus, this);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.ServerNameChanged = function()
{
    var strName = GetServerName();
    strName = strName.trim();
    if (strName.length == 0 || strName === "")
    {
        QuestionCtrlObj.SetText('', TranslationObj.getStringValue("servernameempty"));
        QuestionCtrlObj.AddButton(TranslationObj.getStringValue("yes"), ButtonRoleEnum.ID_BUTTON_OK, function(){document.getElementById("ServerName").focus();});
        QuestionCtrlObj.RemoveButton(ButtonRoleEnum.ID_BUTTON_CLOSE);
        QuestionCtrlObj.Open();
        return;
    }   
    sendAjaxRequest('ajax_change_servername?newname=' + strName, ChangeSettingsResultHandler, this);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.UpdateSaveFolderButtonState = function()
{
    var strPath = GetCurrentPath();
    if (strPath != MainPageObj.arrMediaSettings[0].MainFolder)
    {
        EnableButton('SaveMainFolderButton', true);
    }
    else
    {
        EnableButton('SaveMainFolderButton', false);
    }
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.UpdateSaveLoginPassButtonState = function()
{       
    var strLogin = GetCurrentLogin();
    var strPassword = GetCurrentPass();
    var strPassConfirm = GetCurrentPassConfirm();
    if ( (strLogin.length > 0) && 
         ((strLogin != MainPageObj.arrAuth[0].Login) || (strPassword != MainPageObj.arrAuth[0].Password))
       )
    {
        if (strPassword == strPassConfirm)
        {
            document.getElementById('PassNotMatch').style.display = "none";
            document.getElementById('UserPassConfirm').removeAttribute('required');
            EnableButton('SaveLoginPassButton', true);
            return;
        }
        else
        {
            document.getElementById('PassNotMatch').style.display = "block";
            document.getElementById('UserPassConfirm').setAttribute('required','required');
        }
    }
    EnableButton('SaveLoginPassButton', false);
}
/**********************************************************************************************************************/
function GetCurrentLogin()
{
    return document.getElementById('UserLogin').value;
}
/**********************************************************************************************************************/
function GetCurrentPass()
{
    return document.getElementById('UserPass').value;
}
/**********************************************************************************************************************/
function GetCurrentPassConfirm()
{
    return document.getElementById('UserPassConfirm').value;
}
/**********************************************************************************************************************/
function SetCurrentLogin(newValue)
{
    document.getElementById('UserLogin').value = newValue;
}
/**********************************************************************************************************************/
function SetCurrentPass(newValue)
{
    document.getElementById('UserPass').value = newValue;
}
/**********************************************************************************************************************/
function SetCurrentPassConfirm(newValue)
{
    document.getElementById('UserPassConfirm').value = newValue;
}
/**********************************************************************************************************************/
function UpdateStartStopButtonText()
{
    var elem = document.getElementById('StartStopButtonText');
    if (elem != null)
    {
        elem.parentNode.title = MainPageObj.bMediaSyncStarted ? TranslationObj.getStringValue("stopservice") : TranslationObj.getStringValue("startservice");
        elem.innerHTML = MainPageObj.bMediaSyncStarted ? TranslationObj.getStringValue("stop") : TranslationObj.getStringValue("start");
    }
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.UpdateStartStopButtonState = function(state)
{
    var btn = document.getElementById('StartStopButton');
    switch( Number(state) )
    {
        case eServerState.eReady:
        case eServerState.eNotEnoughSpace:
        case eServerState.eBusy:
        case eServerState.eStorageNotFound:
            btn.className = "stop";
            break;
        case eServerState.eSynchronizing:
            btn.className = "syncing";
            break;
        case eServerState.eStopped:
            btn.className = "start";
            break;
    }

    if (Number(state) == eServerState.eStorageNotFound && !this.bWarnIsShown)
    {
        this.bWarnIsShown = true;
        OnStorageLost();
    }    
}    
/**********************************************************************************************************************/
function ProceedUpdateMediaSyncStatus(strResult, selfObj)
{
    if (selfObj.arrState != null && selfObj.arrState[0] != null && Number(selfObj.arrState[0].ServerState) == eServerState.eSynchronizing)
    {
        var devices = document.getElementById('DevicesTable').children;
        for (var i = 0; i < devices.length; i++)
        {
            var syncNow = getElementsByClassName(devices[i], 'syncNowIcon');
            if (syncNow == null)
               continue;
            syncNow[0].style.display = "none";
        }            
    }

    try 
    { 
        delete selfObj.arrState;
    } 
    catch(e) 
    { 
        selfObj["arrState"] = undefined; 
    }         
    selfObj.arrState = eval( '(' + strResult + ')' );

    MainPageObj.UpdateStartStopButtonState(selfObj.arrState[0].ServerState);
    MainPageObj.bMediaSyncStarted = 'true' == selfObj.arrState[0].bMediaSyncStarted;
    UpdateStartStopButtonText();
    setTimeout(MainPageObj.UpdateMediaSyncStatus, 3000);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.UpdateDevicesList = function()
{
    sendAjaxRequest('ajax_get_devinfo', this.LoadDevices, this);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.UpdateAuthInfo = function()
{
    sendAjaxRequest('ajax_get_authinfo', this.LoadAuthInfo, this);
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.LoadDevices = function(strDevicesData, selfObj)
{
    var elemMainUL = document.getElementById('DevicesTable');
    while (elemMainUL.firstChild)
        elemMainUL.removeChild(elemMainUL.firstChild);

    try 
    { 
        delete selfObj.arrDevices;
    } 
    catch(e) 
    { 
        selfObj["arrDevices"] = undefined; 
    }         

    selfObj.arrDevices = eval( "(" + strDevicesData + ")" );
    var nDevicesCount = selfObj.arrDevices.length;
    for (var i = 0; i < nDevicesCount; i++)
    {
        var elemNewLI = document.createElement('li');
        elemMainUL.appendChild(elemNewLI);
        elemNewLI.setAttribute('Searchable', true);
        elemNewLI.setAttribute('NotifyCheckboxID', 'cbNotifyDevice' + i);
        elemNewLI.setAttribute('AllowBrowseCheckboxID', 'cbAllowBrowsingForDev' + i);
        elemNewLI.setAttribute('MAC', selfObj.arrDevices[i].MAC);
        elemNewLI.setAttribute('DeviceName', selfObj.arrDevices[i].deviceName);
        elemNewLI.onclick = function(event) {selfObj.onClickDispatcher(event);};
        
        AddDeviceElementToList(elemNewLI, selfObj.arrDevices[i].deviceName, 
                               selfObj.arrDevices[i].lastSyncDate, selfObj.arrDevices[i].shouldBeNotified, 
                               selfObj.arrDevices[i].allowBrowsing, selfObj.arrDevices[i].DeviceType,
                               selfObj.arrDevices[i].DeviceOS, i);
    }
}
/**********************************************************************************************************************/
DTHttpServPage.prototype.LoadAuthInfo = function(strAuthData, selfObj)
{
    try 
    { 
        delete selfObj.arrAuth;
    } 
    catch(e) 
    { 
        selfObj["arrAuth"] = undefined; 
    }         
    selfObj.arrAuth = eval( "(" + strAuthData + ")" );
    SetCurrentLogin(selfObj.arrAuth[0].Login);
    SetCurrentPass("");
    SetCurrentPassConfirm("");
    document.getElementById('PINCode').value = selfObj.arrAuth[0].PIN;
    //document.getElementById('QRCode').src = "images/qr.png?time=" + new Date();
    selfObj.HandleLoginChanged();
}
/**********************************************************************************************************************/
function sendAjaxRequest(url, handlerFunc, objContext, elemParent)
{
    var reqObj = null;
    if (window.XMLHttpRequest) 
    {               
        try 
        {
            reqObj = new XMLHttpRequest();
        }
        catch (e){}
    } 
    else if (window.ActiveXObject) 
    {
        try
        {
            reqObj = new ActiveXObject('Msxml2.XMLHTTP');
        }
        catch (e)
        {
            try 
            {
                reqObj = new ActiveXObject('Microsoft.XMLHTTP');
            }
            catch (e){}
        }
    }
 
    if (reqObj) 
    {       
        reqObj.open("POST", url, true);
        reqObj.onreadystatechange = function() 
        {
            if (reqObj.readyState == 4 && reqObj.status == 200)
                handlerFunc(reqObj.responseText, objContext, elemParent);
        };
        reqObj.send(null);
    }
}
/**********************************************************************************************************************/
function displayPage() 
{
    if (!CheckIfChangesAreSaved())
    {
        if(confirm(TranslationObj.getStringValue("wannachangetab") + '\n' + TranslationObj.getStringValue("changesnotsaved")))
        {
            SetCurrentPath(MainPageObj.arrMediaSettings[0].MainFolder);
            SetCurrentLogin(MainPageObj.arrAuth[0].Login);
            SetCurrentPass('');
            SetCurrentPassConfirm('');
            MainPageObj.UpdateSaveFolderButtonState();
            MainPageObj.UpdateSaveLoginPassButtonState();
        }
        else
        {
            return;
        } 
    }
    
    var current = this.parentNode.getAttribute("data-current");
    document.getElementById("tabHeader_" + current).removeAttribute("class");
    document.getElementById("tabpage_" + current).style.display="none";

    var ident = this.id.split("_")[1];
    this.setAttribute("class","active");
    UpdatePageOnSwitch(ident);
    this.parentNode.setAttribute("data-current",ident);
    SaveToStorage('ActiveTab', ident);
}
function UpdatePageOnSwitch(ident)
{
    switch( Number(ident) )
    {
        case eTabPages.eDevices:
            MainPageObj.UpdateDevicesList();
            break;
        case eTabPages.eSync:
            MainPageObj.UpdateAuthInfo();
            break;
    }
    document.getElementById("tabpage_" + ident).style.display = "block"; 
}
/**********************************************************************************************************************/
function isLocalStorageAvailable()
{
    try 
    {
        return 'localStorage' in window && window['localStorage'] !== null;
    } 
    catch (e) 
    {
        return false;
    }
}
/**********************************************************************************************************************/
function GetFromStorage(strKey, strDefaultValue)
{
    if (!bLocalStorageAvailable)
    {
        return strDefaultValue;
    }
    var value = localStorage.getItem(strKey);
    if ( value === null)
    {
        return strDefaultValue;
    }
    return value;
}
/**********************************************************************************************************************/
function SaveToStorage(strKey, strValue)
{
    if (!bLocalStorageAvailable)
    {
        return;
    }

    try 
    {
        localStorage.setItem(strKey, strValue);
    } 
    catch (e) 
    {
    }
}
/**********************************************************************************************************************/
window.onbeforeunload = function (e)
{
    var message = TranslationObj.getStringValue("changesnotsaved");
    var e = e || window.event;
    
    if ( !CheckIfChangesAreSaved() )
    {
        // For IE and Firefox
        if (e) 
        {
           e.returnValue = message;
        }

        // For Safari
        return message;
    }        
};
/**********************************************************************************************************************/
function CheckIfChangesAreSaved()
{
    if (!MainPageObj.arrMediaSettings[0])
    {
        return true;
    }
    if ( GetCurrentPath() != MainPageObj.arrMediaSettings[0].MainFolder ||
         GetCurrentLogin() != MainPageObj.arrAuth[0].Login ||
         GetCurrentPass() != MainPageObj.arrAuth[0].Password
       )
    {
        return false;
    }

    return true;
}
/**********************************************************************************************************************/
function GetCurrentPath()
{
    return document.getElementById("MainFolderPath").value;
}
/**********************************************************************************************************************/
function OnStorageLost()
{
    QuestionCtrlObj.SetText(TranslationObj.getStringValue("err1014"), TranslationObj.getStringValue("errdesc1014"));
    QuestionCtrlObj.AddButton(TranslationObj.getStringValue("createnew"), ButtonRoleEnum.ID_BUTTON_OK, function(){OnRecreateMainFolder();});
    QuestionCtrlObj.AddButton(TranslationObj.getStringValue("setfolder"), ButtonRoleEnum.ID_BUTTON_CUSTOM_CANCEL, function(){MainPageObj.OnSetSettingsPage();DirBrowserObj.OpenBrowser();});
    QuestionCtrlObj.Open();
}
/**********************************************************************************************************************/
function SetCurrentPath(strPath)
{
    var elem = document.getElementById("MainFolderPath");
    if (elem)
    {
        elem.value = strPath;
    }
}
/**********************************************************************************************************************/
function SetServerName(strName)
{
    var elem = document.getElementById("ServerName");
    if (elem)
    {
        elem.value = strName;
    }
}
/**********************************************************************************************************************/
function GetServerName(strName)
{
    return document.getElementById("ServerName").value;
}
/**********************************************************************************************************************/
function getElementsByClassName(node, classname) {
    var a = [];
    var re = new RegExp('(^| )'+classname+'( |$)');
    var els = node.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
        if(re.test(els[i].className))a.push(els[i]);
    return a;
}
/**********************************************************************************************************************/
function EnableButton(strButtonName, bEnable) {
    var elemButton = document.getElementById(strButtonName);
    elemButton.setAttribute('enabled', bEnable);
    elemButton.firstChild.className = 'button_status '+ (bEnable ? 'green' : 'green');
}
/**********************************************************************************************************************/
function IsActionDisabled(strButtonName) {
    var elemButton = document.getElementById(strButtonName);
    if (!elemButton) {
        alert('Button with ID "' + strButtonName + '" missing!');
        return true;
    }

    return elemButton.getAttribute('enabled') == 'false';
}
/**********************************************************************************************************************/

var bLocalStorageAvailable = isLocalStorageAvailable();
MainPageObj = new DTHttpServPage();
var DTDirBrowser = function()
{
    this.nControlWidth = 500;
    this.nControlHeight = 500;
    this.strContainerObjectName = 'DTFileSelectControl';
    this.strDirViewObjectName = 'DTDirectoryView';
    this.strDirViewTableObjectName = 'DTDirectoryViewTable';
    
    this.arrLogicalDrives = new Array();
    this.strCurrentFolder = '';
    this.elemSelectedFolder = 0;
    
    this.nDirExpandCollapseWidth = 9;
    this.funcResult = 0;
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.InitializeCtrl = function(strParentElementID)
{
    var elemDivHolder = document.getElementById(strParentElementID);
    if (!elemDivHolder)
    {
        alert('Failed to find parent element "' + strParentElementID + '" for DTDirBrowser');
        return;
    }
    var elemContainer = document.createElement('div');
    elemContainer.id = this.strContainerObjectName;
    elemContainer.style.height = 287 + 'px';
    elemDivHolder.appendChild(elemContainer);
    
    this.CreateView(this.strDirViewObjectName, this.strDirViewTableObjectName);

    var selfObj = this;
  
    sendAjaxRequest('ajax_get_logical_drives', this.LoadLogicalDevicesNew, this);
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.OnOKClicked = function()
{
    document.getElementById("MainFolderPath").value = document.getElementById("dirFullPath").value;
    OnMainFolderChanged();
    $.fancybox.close();
     
    if (this.funcResult)
    {
        this.funcCustomCancel(true);
        this.funcCustomCancel = 0;
    }
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.OnCancelClicked = function()
{
    $.fancybox.close();
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.OpenBrowser = function(funcResult)
{
    CompatibilityObj.WizardOpenHelper(FancyBoxEnum.eDirBrowserDlg);
    this.funcResult = funcResult;
    var elem = document.getElementById("MainFolderPath");
    var strPath = elem.value;
    if (strPath.slice(-1) == '/')
    {
        strPath = strPath.slice(0, -1);
    }
    document.getElementById("dirFullPath").value = strPath;
    var pathEnd = strPath.lastIndexOf("/");
    this.strCurrentFolder =  strPath.substring(0, pathEnd + 1);
    document.getElementById("dirName").value = strPath.substring(pathEnd + 1, strPath.length);

    $('a[href="#DirBrowser"]').click();
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.CreateDirectoryElement = function(elemParentTableBody, strPath, strLabel, bExpandable, objThis)
{
    var elemTR = document.createElement('tr');

    var elemTDMargin = document.createElement('td');
    var elemTDContainer = document.createElement('td');
    elemTDMargin.width = objThis.nDirExpandCollapseWidth;
    elemTDContainer.colSpan = 2;
    elemTR.appendChild(elemTDMargin);
    elemTR.appendChild(elemTDContainer);

    var elemTable = document.createElement('table');
    elemTable.className = 'dirCtrlTable';
    elemTable.cellSpacing = '0';
    elemTable.cellPadding = '0';
    elemTDContainer.appendChild(elemTable);
        
    var elemTableBody = document.createElement('tbody');
    elemTable.appendChild(elemTableBody);
    
    var elemTRContainer = document.createElement('tr');
    elemTableBody.appendChild(elemTRContainer);

    var elemTDButton = document.createElement('td');
    elemTDButton.style.padding = '0px 5px 0px 0px';
    var elemDivBtn = document.createElement('div');
    elemDivBtn.className = bExpandable ? 'dirCollapsed' : 'dirEmpty';
    if (bExpandable)
    {
        elemDivBtn.onclick = function(event) {objThis.OnPlusButtonClick(event);};
        elemTRContainer.setAttribute('IsCollapsed', 'true');
    }
    elemTRContainer.setAttribute('pathToElement', strPath);
    elemTDButton.width = objThis.nDirExpandCollapseWidth;
    elemTDButton.appendChild(elemDivBtn);
    elemTRContainer.appendChild(elemTDButton);
    elemTRContainer.elemPlusButton = elemDivBtn;

    var elemTDIcon = document.createElement('td');
    var elemDivIco = document.createElement('div');
    elemDivIco.className = 'closedFolder dirCtrlIcon';
    elemTDIcon.width = objThis.nDirExpandCollapseWidth;
    elemTDIcon.appendChild(elemDivIco);
    elemTRContainer.appendChild(elemTDIcon);
    
    var elemTDLabel = document.createElement('td');
    elemTDLabel.align = 'left';
    elemTDLabel.noWrap = 'true';
    elemTDLabel.innerHTML = strLabel;
    elemTDLabel.className = 'dirFileElement';
    elemTDLabel.onclick = function(event) {objThis.OnDirectoryClick(event);};
    if (bExpandable)
        elemTDLabel.ondblclick = function(event) {objThis.OnDirectoryDblClick(event);};
    elemTRContainer.appendChild(elemTDLabel);
    
    elemParentTableBody.appendChild(elemTR);
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.LoadLogicalDevicesNew = function(strLogicalDevices, objThis)
{
    try 
    { 
        delete objThis.arrLogicalDrives;
    } 
    catch(e) 
    { 
        objThis["arrLogicalDrives"] = undefined; 
    }         
    
    objThis.arrLogicalDrives = eval( "(" + strLogicalDevices + ")" );

    var elemTableBody = document.createElement('tbody');
    document.getElementById(objThis.strDirViewTableObjectName).appendChild(elemTableBody);
    
    var nLogDrvCount = objThis.arrLogicalDrives.length;
    for (var i = 0; i < nLogDrvCount; i++)
        objThis.CreateDirectoryElement(elemTableBody, objThis.arrLogicalDrives[i].DriveLetter, objThis.arrLogicalDrives[i].DriveLetter[0], true, objThis);
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.CreateView = function(strViewID, strViewTableID)
{
    var elemMainControl = document.getElementById(this.strContainerObjectName);
    var elemViewDiv = document.createElement('div');
    elemViewDiv.id = strViewID;
    elemViewDiv.style.top = '0px';
    elemViewDiv.style.left = '0px';
    elemViewDiv.style.height = 287 + 'px';
    elemViewDiv.className = 'dirCtrlDiv';
    
    var elemViewTable = document.createElement('table');
    elemViewTable.id = strViewTableID;
    elemViewTable.cellSpacing = '0';
    elemViewTable.cellPadding = '0';
    elemViewTable.className = 'dirCtrlTable';
    elemViewDiv.appendChild(elemViewTable);
    
    elemMainControl.appendChild(elemViewDiv);
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.OnPlusButtonClick = function(eventObj)
{
    eventObj = eventObj || window.event;
    var objTDSender = eventObj.target || eventObj.srcElement;
    this.OnPlusButtonClickProceed(objTDSender);
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.OnPlusButtonClickProceed = function(objTDSender)
{
    var elemParentTR = objTDSender.parentNode.parentNode;
    if (objTDSender.nodeName != 'DIV')
    {
        alert('WRONG element connected to OnPlusButtonClick handler!');
        return;
    }

    var bIsCollapsed = elemParentTR.getAttribute('IsCollapsed') == 'true';
    if (bIsCollapsed)
        this.ExpandDirectory(objTDSender);
    else
        this.CollapseDirectory(objTDSender);

    elemParentTR.setAttribute('IsCollapsed', bIsCollapsed ? 'false' : 'true');
    objTDSender.className = bIsCollapsed ? 'dirExpanded' : 'dirCollapsed';
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.ExpandDirectory = function(elemToExpand)
{
    var elemParentTR = elemToExpand.parentNode.parentNode;
    var elemDivIco = elemToExpand.parentNode.parentNode.children[1].children[0];
    elemDivIco.className = 'openedFolder dirCtrlIcon';
    
    var elemNext = elemParentTR.nextSibling;
    if (elemNext)
    {
        while (elemNext)
        {
            elemNext.style.display = 'table-row';
            elemNext = elemNext.nextSibling;
        }
    }
    else
    {
        var strParam = 'Folder=' + encodeURIComponent(elemParentTR.getAttribute('pathToElement'));
        sendAjaxRequest('ajax_load_subdirs?' + strParam, this.LoadSubDirectories, this, elemParentTR);
    }
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.CollapseDirectory = function(elemToCollapse)
{
    var elemDivIco = elemToCollapse.parentNode.parentNode.children[1].children[0];
    elemDivIco.className = 'closedFolder dirCtrlIcon';
    
    var elemParentTR = elemToCollapse.parentNode.parentNode;
    var elemNext = elemParentTR.nextSibling;
    while (elemNext)
    {
        elemNext.style.display = 'none';
        elemNext = elemNext.nextSibling;
    }
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.LoadSubDirectories = function(strSubDirs, objThis, elemParent)
{
    var elemParentTBody = elemParent.parentNode; // div->td->tr->tbody

    var arrDirectories = eval( "(" + strSubDirs + ")" );
    for (var i = 0; i < arrDirectories.length; i++)
        objThis.CreateDirectoryElement(elemParentTBody, elemParent.getAttribute('pathToElement') + arrDirectories[i].DirectoryName + '/', arrDirectories[i].DirectoryName, '0' != arrDirectories[i].HasSubDirs, objThis);
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.OnDirectoryClick = function(eventObj)
{
    eventObj = eventObj || window.event;
    var objTDSender = eventObj.target || eventObj.srcElement;
    var elemParentTR = objTDSender.parentNode;
    
    if (this.elemSelectedFolder)
        this.elemSelectedFolder.className = '';
    this.elemSelectedFolder = elemParentTR;
    this.elemSelectedFolder.className = 'selectedFolder';
    
    this.strCurrentFolder = elemParentTR.getAttribute('pathToElement');
    
        
    var elemDirPath = document.getElementById("dirFullPath");
    elemDirPath.value = this.strCurrentFolder + document.getElementById("dirName").value;
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.OnDirectoryDblClick = function(eventObj)
{
    eventObj = eventObj || window.event;
    var objTDSender = eventObj.target || eventObj.srcElement;
    var elemParentTR = objTDSender.parentNode;
    var elemCollExpBtn = elemParentTR.elemPlusButton;

    this.OnPlusButtonClickProceed(elemCollExpBtn);
}
/**********************************************************************************************************************/
DTDirBrowser.prototype.OnStandardNameChanged = function()
{
    if (this.strCurrentFolder != '')
    {
        var elemDirPath = document.getElementById("dirFullPath");
        elemDirPath.value = this.strCurrentFolder + document.getElementById("dirName").value;
    }        
}
/**********************************************************************************************************************/

 
DirBrowserObj = new DTDirBrowser();
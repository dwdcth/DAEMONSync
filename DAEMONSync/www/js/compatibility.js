var FancyBoxEnum = 
{
    eQuestionDlg : {ContainerID: 'AQuestionHolder'},
    eDirBrowserDlg : {ContainerID: 'ADirBrowser'},
    eWaitDialog : {ContainerID: 'AWaitDialog'}
};

var DeviceTypeEnum =
{ 
    PHONE : 1,  
    TABLET : 2
}; 
 
var OSTypeEnum =
{ 
    ANDROID : 1,  
    IOS : 2  
};

/**********************************************************************************************************************/
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  };
} 
/**********************************************************************************************************************/
var DTCompatibility = function()
{
    this.bIsIE = false;
    this.bOldIE = false;// IE version < 10
    this.strTextTop = '14px';
    this.strTextHeight = '20px';
}
/**********************************************************************************************************************/
DTCompatibility.prototype.Initialize = function()
{
    if ($.browser.msie) 
    {
        this.bIsIE = true;
        if ( parseInt($.browser.version, 10) < 10)
            this.bOldIE = true;
    }
}
/**********************************************************************************************************************/
function AddColElement(elemParent, strValue)
{
    var elemCol = document.createElement('col');
    elemCol.setAttribute('width', strValue); // to be compatible with IE
    elemParent.appendChild(elemCol);
}
/**********************************************************************************************************************/
function AddColGroup(elemParent)
{
    var elemColGroup = document.createElement('colgroup');
    AddColElement(elemColGroup, '25%');
    AddColElement(elemColGroup, '25%');
    AddColElement(elemColGroup, '5%');
    AddColElement(elemColGroup, '20%');
    AddColElement(elemColGroup, '20%');
    AddColElement(elemColGroup, '5%');
    elemParent.appendChild(elemColGroup);
}
/**********************************************************************************************************************/
function NormalizeElementWidth(elem, strValue, nMaxLength)
{
    var nHolderWidth = $(elem).width();
    if (nHolderWidth > nMaxLength)
    {
        elem.style.width = (nMaxLength - 10) + 'px';
        elem.style.overflow = 'hidden';
        elem.title = strValue;
    }
}
/**********************************************************************************************************************/
function AddCheckboxElement(elemParent, strId, checked)
{
    var elemTD = document.createElement('td');
    var elemDIV = document.createElement('div');
    elemDIV.className = 'squaredThree';
    var elemInput = document.createElement('input');
    elemInput.type = 'checkbox';
    elemInput.id = strId;
    elemInput.checked = checked == "1" ? true : false;
    elemInput.name = 'check';
    var elemLabel = document.createElement('label');
    elemLabel.htmlFor = strId;
    elemDIV.appendChild(elemInput);
    elemDIV.appendChild(elemLabel);
    elemTD.appendChild(elemDIV);
    elemParent.appendChild(elemTD);

    return elemTD;
}
/**********************************************************************************************************************/
function AddDeviceElementToList(elemParent, strName, strDate, bShouldBeNotified, bAllowBrowsing, nDeviceType, nDeviceOS, nDeviceNo)
{                                                         
    if (CompatibilityObj.bIsIE && CompatibilityObj.bOldIE)
    {
        var elemTable = document.createElement('div');
        elemTable.style.width = '892px';
        elemTable.style.height = '43px';
        elemTable.style.position = 'relative';

        var elemDivName = document.createElement('div');
        elemDivName.className = 'ieUnderline';
        elemDivName.style.width = '215px';
        elemDivName.style.height = CompatibilityObj.strTextHeight;
        elemDivName.style.top = CompatibilityObj.strTextTop;
        elemDivName.style.left = '35px';
        elemDivName.style.position = 'absolute';

        var elemDivNameHolder = document.createElement('div');
        elemDivNameHolder.innerHTML = strName;
        elemDivName.appendChild(elemDivNameHolder);

        var elemDivDate = document.createElement('div');
        elemDivDate.className = 'ieUnderline';
        elemDivDate.style.width = '415px';
        elemDivDate.style.height = CompatibilityObj.strTextHeight;
        elemDivDate.style.top = CompatibilityObj.strTextTop;
        elemDivDate.style.left = '245px';
        elemDivDate.style.position = 'absolute';

        var elemDivDateHolder = document.createElement('div');
        elemDivDateHolder.innerHTML = strName;
        elemDivDate.appendChild(elemDivDateHolder);

        elemTable.appendChild(elemDivName);
        elemTable.appendChild(elemDivDate);
        elemParent.appendChild(elemTable);

        NormalizeElementWidth(elemDivNameHolder, strName, 214);
        NormalizeElementWidth(elemDivDateHolder, strDate, 414);

        return;
    }

    var elemTable = document.createElement('table');
    elemParent.appendChild(elemTable);
    
    elemTable.cellSpacing = '0';
    elemTable.cellPadding = '0';
    elemTable.border = '0';
    elemTable.style.width = '100%';
    
    AddColGroup(elemTable);

    var elemTR = document.createElement('tr');
    elemTable.appendChild(elemTR);
       
    var strFormattedDate = strDate;
    if (strDate != 'Never')
    {
        var dateChunk = strDate.split('-');
        var date = new Date(/*dateChunk[0], dateChunk[1] - 1, dateChunk[2], dateChunk[3], dateChunk[4], dateChunk[5]*/);
        date.setUTCFullYear(dateChunk[0]);
        date.setUTCMonth(dateChunk[1] - 1);
        date.setUTCDate(dateChunk[2]);
        date.setUTCHours(dateChunk[3]);
        date.setUTCMinutes(dateChunk[4]);
        date.setUTCSeconds(dateChunk[5]);
        
        strFormattedDate = date.toLocaleString();
    }
    else
    {
        strFormattedDate = TranslationObj.getStringValue("never");
    }
     
    var elemDeviceName = document.createElement('td');
    var elemDIVName = document.createElement('div');
    elemDIVName.innerHTML = strName;
    var elemSPANDevType = document.createElement('span');
    var icoClassName = '';
    switch( Number(nDeviceType) )
    {
        case DeviceTypeEnum.PHONE:
            icoClassName = 'phone';
            break;
        case DeviceTypeEnum.TABLET:
            icoClassName = 'tab';
            break;
    }
    switch( Number(nDeviceOS) )
    {
        case OSTypeEnum.IOS:
            icoClassName += 'ios';
            break;
        case OSTypeEnum.ANDROID:
            icoClassName += 'android';
            break;
    }
    elemSPANDevType.className = icoClassName;    
    elemDeviceName.appendChild(elemSPANDevType);
    elemDeviceName.appendChild(elemDIVName);
    elemTR.appendChild(elemDeviceName);

    var elemDate = document.createElement('td');
    var elemDIVDate = document.createElement('div');
    elemDIVDate.innerHTML = strFormattedDate;
    elemDate.appendChild(elemDIVDate);
    elemTR.appendChild(elemDate);

    var elemSyncNow = document.createElement('td');
    elemSyncNow.className = 'icon-td';
    var elemDivSyncNow = document.createElement('div');
    elemDivSyncNow.className = 'syncNowIcon';
    elemDivSyncNow.title = TranslationObj.getStringValue("syncnow");
    elemSyncNow.appendChild(elemDivSyncNow);
    elemTR.appendChild(elemSyncNow);
    
    AddCheckboxElement(elemTR, 'cbNotifyDevice' + nDeviceNo, bShouldBeNotified);
    AddCheckboxElement(elemTR, 'cbAllowBrowsingForDev' + nDeviceNo, bAllowBrowsing);

    var elemTD6 = document.createElement('td');
    elemTD6.className = 'icon-td';
    var elemADelete = document.createElement('a');
    elemADelete.className = 'ico delete';
    elemADelete.title = TranslationObj.getStringValue("unlinkdevice");
    elemTD6.appendChild(elemADelete);
    elemTR.appendChild(elemTD6);
    
    //NormalizeElementWidth(elemDeviceName, strName, 200);
    //NormalizeElementWidth(elemDeviceDate, strFormattedDate, 200);
}
/**********************************************************************************************************************/
DTCompatibility.prototype.WizardOpenHelper = function(eBoxName)
{
    for (var eBox in FancyBoxEnum)
        document.getElementById(FancyBoxEnum[eBox].ContainerID).className = (eBoxName.ContainerID == FancyBoxEnum[eBox].ContainerID) ? 'fancybox' : 'tempfancy';
}
/**********************************************************************************************************************/


CompatibilityObj = new DTCompatibility();
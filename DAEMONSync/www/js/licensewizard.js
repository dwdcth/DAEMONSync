/**********************************************************************************************************************/
var DTLicenseWizard = function()
{
    this.bWizardInitialized = false;
    this.nFancyBoxMargin = 15;
    this.nAnimationTime = 500;
    this.arrInstanceInfo = new Array(); 
}
/**********************************************************************************************************************/
DTLicenseWizard.prototype.UpdateInstanceInfo = function()
{
    sendAjaxRequest('ajax_get_licenseinfo', this.LoadInstanceInfo, this);
} 
/**********************************************************************************************************************/
DTLicenseWizard.prototype.LoadInstanceInfo = function(strInstanceData, selfObj)
{   
    try 
    { 
        delete selfObj.arrInstanceInfo;
    } 
    catch(e) 
    { 
        selfObj["arrInstanceInfo"] = undefined; 
    }         

    if (strInstanceData != '')
    {
        selfObj.arrInstanceInfo = eval( "(" + strInstanceData + ")" );
        document.getElementById('LicenseType').innerHTML = selfObj.arrInstanceInfo[0].LicenseType == "Paid" ? TranslationObj.getStringValue("paidlicense") : TranslationObj.getStringValue("freelicense");
        document.getElementById('DaysOrSerialLabel').innerHTML = selfObj.arrInstanceInfo[0].LicenseType == "Paid" ? TranslationObj.getStringValue("serialnumber") : TranslationObj.getStringValue("daysleft");
        document.getElementById('DaysOrSerial').innerHTML = selfObj.arrInstanceInfo[0].LicenseType == "Paid" ? selfObj.arrInstanceInfo[0].DaysOrSerial : TranslationObj.getStringValue("infinite");        
        document.getElementById('InstallationName').innerHTML = selfObj.arrInstanceInfo[0].InstallationName;        
        document.getElementById('SystemID').innerHTML = selfObj.arrInstanceInfo[0].SystemID;
    }    
}
/**********************************************************************************************************************/
DTLicenseWizard.prototype.InitializeWizard = function()
{
    this.UpdateInstanceInfo();
}
/**********************************************************************************************************************/

LicenseWizardObj = new DTLicenseWizard();
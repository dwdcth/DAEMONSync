var DTHttpTranslation = function()
{
    this.languageFile = {};
    this.defaultLanguageFile = {};    
}
/**********************************************************************************************************************/
DTHttpTranslation.prototype.Initialize = function()
{
    this.Retranslate('en');

    var data = GetTranslationFromFile("/i18n/strings-en.json");
    if (data)
    {
       defaultLanguageFile = parseJson(data);
    }
}
/**********************************************************************************************************************/
DTHttpTranslation.prototype.ReadLanguageFile = function(lang)
{
    var data = GetTranslationFromFile("/i18n/strings-" + lang + ".json");
    if (data)
    {
        try 
        { 
            delete this.languageFile;
        } 
        catch(e) 
        { 
            this["languageFile"] = undefined; 
        }         
        languageFile = parseJson(data);
    }
}
/**********************************************************************************************************************/
DTHttpTranslation.prototype.Retranslate = function(lang)
{
    this.ReadLanguageFile(lang);
    this.ReplaceStrings();
    LicenseWizardObj.InitializeWizard();
    UpdateStartStopButtonText();
}
/**********************************************************************************************************************/
DTHttpTranslation.prototype.getStringValue = function(key) 
{
    if (!languageFile)
    {
        return "";
    }
    if (languageFile[key]) 
    {
        return languageFile[key].value;
    } 
    else 
    {
        if (defaultLanguageFile[key]) 
        {
            return defaultLanguageFile[key].value;
        }
        else 
        {
            return "";
        }
    }
}
/**********************************************************************************************************************/
DTHttpTranslation.prototype.ReplaceStrings = function() 
{
    try 
    {
        var allNodes = document.getElementsByTagName("*");
        for (var i=0, max=allNodes.length; i < max; i++)
        {
            var child = allNodes[i];
            for (var j = 0; j < child.attributes.length; j++)
            {
                if (!(child.attributes[j].name == "translatable")) continue;
                if (typeof child.textContent == "undefined")
                    child.nodeValue = this.getStringValue(child.attributes[j].value);
                else
                    child.textContent = this.getStringValue(child.attributes[j].value);
                break;
            }
        }
    } 
    catch (e) {}
}
/**********************************************************************************************************************/
function GetTranslationFromFile(urlin)
{
    var req;
    req = false;
  
    if (window.XMLHttpRequest) // native
    {
        try 
        {
            req = new XMLHttpRequest();
        } 
        catch (e) 
        {
            req = false;
        }     
    } 
    else if (window.ActiveXObject) // IE/Windows
    {
        try 
        {
            req = new ActiveXObject("Msxml2.XMLHTTP");
        } 
        catch (e) 
        {
            try 
            {
                req = new ActiveXObject("Microsoft.XMLHTTP");
            } 
            catch (e)
            {
                req = false;
            }
        }
    }
    if (req) 
    {
        req.open("POST", urlin, false);
        try 
        {
            req.send("");
        } 
        catch (e) 
        {
            req = false;
        }
        return req.responseText;
    }
    return "";
}
/**********************************************************************************************************************/
function parseJson(jsonData) {
    return eval("(" + jsonData + ")");
}
/**********************************************************************************************************************/

TranslationObj = new DTHttpTranslation();
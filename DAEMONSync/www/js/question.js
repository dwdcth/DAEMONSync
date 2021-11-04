ButtonRoleEnum = 
{
    ID_BUTTON_OK : 0,  
    ID_BUTTON_CLOSE : 1,
    ID_BUTTON_CUSTOM_CANCEL : 2
};
/**********************************************************************************************************************/
var DTQuestionControl = function()
{
    this.funcOK = 0;
    this.funcCustomCancel = 0;
}
/**********************************************************************************************************************/
DTQuestionControl.prototype.Initialize = function(strCb)
{
    var bWithCb = true;
    if ( (typeof(strCb) === 'undefined') || strCb == '' )
    {
        bWithCb = false;
    }
    
    var cbElemParent = document.getElementById('QuestionCb').parentNode.parentNode.parentNode;
    var label = document.getElementById("QuestionCbLabel");
    label.innerHTML = TranslationObj.getStringValue("deletefilesbackuped");
    cbElemParent.style.display = bWithCb ? 'block' : 'none';
    document.getElementById('QuestionCb').checked = false;     
}
/**********************************************************************************************************************/
DTQuestionControl.prototype.SetText = function(strTitle, strText, strCb)
{
    this.Initialize(strCb);
    document.getElementById('QuestionTitle').innerHTML = strTitle;
    document.getElementById('QuestionText').innerHTML = strText;
}
/**********************************************************************************************************************/
DTQuestionControl.prototype.OnCloseClicked = function()
{
    $.fancybox.close();
    if (this.funcCustomCancel)
    {
        this.funcCustomCancel();
        this.funcCustomCancel = 0;
    }
}
/**********************************************************************************************************************/
DTQuestionControl.prototype.OnOKClicked = function()
{
    $.fancybox.close();
    if (this.funcOK)
    {
        this.funcOK(document.getElementById('QuestionCb').checked);
        this.funcOK = 0;
    }                                         
}
/**********************************************************************************************************************/
DTQuestionControl.prototype.Open = function()
{
    CompatibilityObj.WizardOpenHelper(FancyBoxEnum.eQuestionDlg);
    $('a[href="#QuestionHolder"]').click();
}
/**********************************************************************************************************************/
DTQuestionControl.prototype.AddButton = function(strName, nAction, funcToTrigger)
{
    var btn;
    var btnText;
    if (nAction == ButtonRoleEnum.ID_BUTTON_OK)
    {   
        btn = document.getElementById("QuestionOKButton");
        btnText = document.getElementById("QuestionOKInner");
        this.funcOK = funcToTrigger;
    }
    else if (nAction == ButtonRoleEnum.ID_BUTTON_CUSTOM_CANCEL)
    {
        btn = document.getElementById("QuestionCloseButton");
        btnText = document.getElementById("QuestionCloseInner");
        this.funcCustomCancel = funcToTrigger;
    }
    else if (nAction == ButtonRoleEnum.ID_BUTTON_CLOSE)
    {
        btn = document.getElementById("QuestionCloseButton");
        btnText = document.getElementById("QuestionCloseInner");
    }
    if (btn)
    {
        btn.style.display = 'block';
        if (strName != '' && btnText)
        {
            btnText.innerHTML = strName;                
        }
    }
}
/**********************************************************************************************************************/
DTQuestionControl.prototype.RemoveButton = function(nAction)
{
    var btn;
    if (nAction == ButtonRoleEnum.ID_BUTTON_OK)
    {   
        btn = document.getElementById("QuestionOKButton");                                 
    }
    else if (nAction == ButtonRoleEnum.ID_BUTTON_CLOSE)
    {
        btn = document.getElementById("QuestionCloseButton");                                 
    }
    if (btn)
    {
        btn.style.display = 'none';
    }
}
/**********************************************************************************************************************/

QuestionCtrlObj = new DTQuestionControl();
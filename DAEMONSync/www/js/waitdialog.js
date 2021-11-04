var DTWaitDialog = function()
{
    this.bStarted = false;
}
/**********************************************************************************************************************/
DTWaitDialog.prototype.Stop = function()
{
    if (this.bStarted)
    {
        $(".fancybox").fancybox({
            modal : false
        });
        $.fancybox.close();
        this.bStarted = false;
    }
}
/**********************************************************************************************************************/
DTWaitDialog.prototype.Start = function()
{
    if (!this.bStarted)
    {
       CompatibilityObj.WizardOpenHelper(FancyBoxEnum.eWaitDialog);
     
       $(".fancybox").fancybox({
           modal : true,
          'scrolling' : 'no'
       });
       
       $('a[href="#WaitDialog"]').click();
       this.bStarted = true;
    }
}
/**********************************************************************************************************************/

DTWaitDialogObj = new DTWaitDialog();
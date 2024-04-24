sap.ui.define([], function() {
    return {
        onInitSmartFilterBarExtension: function(oEvent) {
        // the custom field in the filter bar might have to be bound to a custom data model
        // if a value change in the field shall trigger a follow up action, this method is the 
        // place to define and bind an event handler to the field
        // Example:
        var oSmartFilterBar = oEvent.getSource();
        oSmartFilterBar.getControlByKey("CustomFilters").attachSelectionChange(function(oChangeEvent){
            console.log(b)
        //code
        },this);
        jQuery.sap.log.info("onInitSmartFilterBarExtension initialized");
        console.log('onInitSmartFilterBarExtension')
        console.log(a)
        },
        onBeforeRebindTableExtension: function(oEvent) {
        // usually the value of the custom field should have an effect on the selected data in the table. 
        // So this is the place to add a binding parameter depending on the value in the custom field.
        },
        onBeforeRebindChartExtension: function(oEvent) {
            // usually the value of the custom field should have an effect on the selected data in the chart. 
            // So this is the place to add a binding parameter depending on the value in the custom field.
        },
        getCustomAppStateDataExtension : function(oCustomData) {
            // the content of the custom field shall be stored in the app state, so that it can be restored
            // later again e.g. after a back navigation. The developer has to ensure that the content of the
            // field is stored in the object that is returned by this method.
            // Example:
            var oComboBox = this.byId("CustomFilters-combobox");
                if (oComboBox){
            oCustomData.CustomPriceFilter = oComboBox.getSelectedKey();
        }
            },
        restoreCustomAppStateDataExtension : function(oCustomData) {
            // in order to to restore the content of the custom field in the filter bar e.g. after a 
            // back navigation, an object with the content is handed over to this method and the developer 
            // has to ensure, that the content of the custom field is set accordingly
            // also, empty properties have to be set
            // Example:
            if ( oCustomData.CustomPriceFilter !== undefined ){
                if ( this.byId("CustomFilters-combobox") ) {
                    this.byId("CustomFilters-combobox").setSelectedKey(oCustomData.CustomPriceFilter);
                }
            }
        }
    }
});

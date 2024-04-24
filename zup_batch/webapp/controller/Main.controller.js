sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
    'sap/ui/model/json/JSONModel',
    './xlsx/xlsx',
    "sap/ui/core/Fragment",
    'sap/m/p13n/Engine',
    'sap/m/p13n/MetadataHelper',
    'sap/m/p13n/SelectionController',
    'sap/m/p13n/SortController',
    'sap/m/p13n/GroupController',
    'sap/ui/model/odata/v2/ODataModel',
    'sap/m/MessageItem',
    'sap/m/MessageView',
    "sap/m/MessageBox",
    'sap/m/Dialog',
    'sap/m/Button',
    'sap/m/Bar',
    'sap/m/Title',
    'sap/ui/core/IconPool',
    'sap/ui/core/library',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/plugins/CellSelector",
    "sap/m/plugins/CopyProvider"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        Controller,
        MessageToast,
        JSONModel,
        XLSXjs,
        Fragment,
        Engine,
        MetadataHelper,
        SelectionController,
        SortController,
        GroupController,
        ODataModel,
        MessageItem,
        MessageView,
        MessageBox,
        Dialog,
        Button,
        Bar,
        Title,
        IconPool,
        coreLibrary,
        Filter,
        FilterOperator,
        CellSelector,
        CopyProvider
    ) {
        "use strict";
        var TitleLevel = coreLibrary.TitleLevel
        var oCellSelector
        var oCopyProvider
        return Controller.extend("zupbatch.controller.Main", {
            // global variable
            pDialog: null,
            busyDialog: null,
            pFileName: null,
            dataUpload: [],
            dataUploadMap: new Map(),
            batchCharInternalID: {},
            onInit: function () {
                var thatController = this
                var oModel = new JSONModel();
                this.getView().setModel(oModel);
                this._zupBatchregisterForP13n();
                if (window.isSecureContext) {
                    let oTable = this.getView().byId('idMainTable');
                   // oTable.getPlugins()[0].setSelectionMode('None');
                    oCellSelector = new CellSelector();
                    oTable.addDependent(oCellSelector);
                    oCopyProvider = new CopyProvider({ extractData: this.extractData, copy: this.onCopy });
                    oTable.addDependent(oCopyProvider);
                    
                }
                let getBatchCharc = this.getBatchCharc()
                Fragment.load({
                    id: "busyFragment",
                    name: "zupbatch.controller.fragment.Busy",
                    type: "XML",
                    controller: this
                })
                .then((oDialog) => {
                    this.busyDialog = oDialog;
                })
                .catch(error => {
                    MessageBox.error('Vui lòng tải lại trang')
                });  
                getBatchCharc
                .then((data) => {
                    if  (data.results) {
                        data.results.forEach((value, index) => {
                            if (value.Characteristic == 'Z_LOBM_HSDAT') {
                                thatController.batchCharInternalID.Z_LOBM_HSDAT  = value.CharcInternalID
                            }
                            if (value.Characteristic == 'YB_SUPPLIER_BATCH_NUMBER') {
                                thatController.batchCharInternalID.YB_SUPPLIER_BATCH_NUMBER  = value.CharcInternalID
                            }
                        })
                    }
                })
                .catch((error)=>{
                    console.error(error.message)
                })
            },
            getBatchCharc: function (){
                return new Promise((resolve, reject)=>{
                    let batchCharModel = new ODataModel("https://" + window.location.hostname + "/sap/opu/odata/sap/Z_API_BATCH_CHARC_O2", { json: true })
                    batchCharModel.read("/zi_batch_charc", {
                        filters: [new Filter("Characteristic", "EQ", 'Z_LOBM_HSDAT'), new Filter("Characteristic", "EQ", 'YB_SUPPLIER_BATCH_NUMBER')],
                        success: function (oData, response) { //found
                            resolve(oData, response)
                        },
                        error: function (error) { //not found
                            reject(error)
                        }
                    })
                })
            },
            _zupBatchregisterForP13n: function () {
                var oTable = this.byId("idMainTable");
                this.oMetadataHelper = new MetadataHelper([                                        
                    { key: "postingdate", label: "Posting date", path: "postingdate" },
                    { key: "companycode", label: "Company code", path: "companycode" },
                    { key: "plant", label: "Plant", path: "plant" },
                    { key: "material", label: "Material", path: "material" },
                    { key: "batchncc", label: "Batch NCC", path: "batchncc" },
                    { key: "batch", label: "Batch SAP", path: "batch" },
                    { key: "ngaysanxuat", label: "Ngày sản xuất", path: "ngaysanxuat" },
                    { key: "hansudung", label: "Hạn sử dụng", path: "hansudung" },
                    { key: "valuationtype", label: "Valuation type", path: "valuationtype" },
                    { key: "newprice", label: "New price", path: "newprice" },
                    { key: "per", label: "Per", path: "per" },
                    { key: "currency", label: "Currency", path: "currency" },
                    { key: "crtbatchstt", label: "Create Batch Status", path: "crtbatchstt" },
                    { key: "updpricestt", label: "Update price Status", path: "updpricestt" }
                ]);
                Engine.getInstance().register(oTable, {
                    helper: this.oMetadataHelper,
                    controller: {
                        Columns: new SelectionController({
                            targetAggregation: "columns",
                            control: oTable
                        }),
                        Sorter: new SortController({
                            control: oTable
                        }),
                        Groups: new GroupController({
                            control: oTable
                        })
                    }
                });

                Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
            },
            openUploadFragment: function () {
                this.dataUpload = [];
                this.dataUploadMap = new Map()
                
                if (!this.pDialog) {
                    Fragment.load({
                        id: "excel_upload",
                        name: "zupbatch.controller.fragment.ExcelUpload",
                        type: "XML",
                        controller: this
                    }).then((oDialog) => {
                        var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                        oFileUploader.removeAllItems();
                        this.pDialog = oDialog;
                        this.pDialog.open();
                    })
                    .catch(error => {
                        MessageBox.error('Đã có lỗi xảy ra, vui lòng refresh lại trang')
                    });
                } else {
                    var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                    oFileUploader.removeAllItems();
                    this.pDialog.open();
                }
            },
            onCloseDialog: function () {
                this.pDialog.close();
            },
            checkFileBeenUploaded: function (filename){
                let thatController = this
                let urlFileLog = "https://" + window.location.hostname + "/sap/opu/odata/sap/ZSD_API_UPL_BATCH_LOG_O2";
                let oFilter = new Filter("filename", "EQ", filename)
                let oFileLogModel = new ODataModel(urlFileLog, { json: true });
                return new Promise((resolve, reject) => {
                    oFileLogModel.read("/ZSD_I_UPL_BATCH_LOG", {
                        filters: [oFilter],
                        success: function (oData, response) {
                            if (!oData.results || oData.results.length == 0) {
                                resolve({existed : false})
                            } else {
                                resolve({ existed : true})
                            }
                        },
                        error: function(error){
                            reject(error)
                        }
                    })
                }) 
            },
            onUploadSetComplete: function (oEvent) {
                var thatController = this;
                var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                var oFile = oFileUploader.getItems()[0].getFileObject();
                var reader = new FileReader();
                thatController.pFileName = oFile.name
                thatController.dataUpload = []
                thatController.dataUploadMap = new Map()
                reader.onload = (e) => {
                    let xlsx_content = e.currentTarget.result;
                    let workbook = XLSX.read(xlsx_content, { type: 'binary' });
                    var excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets["Data"]);
                    excelData.forEach((value, index) => {
                        thatController.dataUpload.push(value)
                        thatController.dataUploadMap.set(`${value.material}${value.batchncc}${value.plant}`,value)
                    })
                    thatController.dataUpload = Array.from(thatController.dataUploadMap.values())
                    this.pDialog.close();
                    thatController.busyDialog.open()
                    let checkFileBeenUploaded = this.checkFileBeenUploaded()
                    checkFileBeenUploaded
                    .then((result) => {
                        if (result.existed) {
                            MessageBox.error('File đã được upload')
                            thatController.busyDialog.close()
                        } else {
                            var model = thatController.getView().getModel()
                            model.setProperty("/items", thatController.dataUpload, null, true)
                            thatController.busyDialog.close()
                            MessageToast.show("Upload Successful");
                        }
                    })
                    .catch((error) => {
                        MessageBox.error(`Có lỗi xảy ra: ${error.message}`)
                        console.error(error)
                        thatController.busyDialog.close()
                    })
                };
                reader.readAsBinaryString(oFile)
            },
            openSetting: function (oEvt) {
                var oTable = this.byId("idMainTable");
                Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
                    contentHeight: "35rem",
                    contentWidth: "32rem",
                    source: oEvt.getSource()
                });
            },
            handleStateChange: function (oEvt) {
                var oTable = this.byId("idMainTable");
                var oState = oEvt.getParameter("state"); 
                oTable.getColumns().forEach(function (oColumn) {
                    oColumn.setVisible(false);
                });

                oState.Columns.forEach(function (oProp, iIndex) {
                    var oCol = this.byId(oProp.key);
                    oCol.setVisible(true);
                    oTable.removeColumn(oCol);
                    oTable.insertColumn(oCol, iIndex);
                }.bind(this));
            },
            checkNullDate: function (str) {
                if (!str || str.length !== 10) {
                    return ''
                }
                else {
                    return `${str.substring(6)}${str.substring(3, 5)}${str.substring(0, 2)}`
                }
            },
            checkNullData: function (str) {
                if (!str) {
                    return ''
                }
                else {
                    return `${str}`
                }
            },
            checkNullNumber: function (str) {
                if (!str || str === '') {
                    return '0'
                }
                else {
                    return `${str}`
                }
            },
            postData: function (oEvent) {
                var thatController = this
                thatController.busyDialog.open()
                this.callApiBatch()

            },
            callApiBatch: function () {
                var thatController = this
                let requestsArr = []
                thatController.dataUpload.forEach((value, index) => {
                    if (!value.crtbatchstt || value.crtbatchstt == 'Failed') {
                        let request = {
                            filename : thatController.pFileName,
                            postingdate : value.postingdate,
                            companycode : value.companycode,
                            plant : value.plant,      
                            material : value.material,   
                            batchncc : value.batchncc,   
                            ngaysanxuat : value.ngaysanxuat,
                            hansudung : value.hansudung,
                            newprice : value.newprice,
                            per : value.per,
                            currency : value.currency,
                            option : 'BATCH'
                        }
                        requestsArr.push(thatController.callSingleRequest(request))
                    }
                })
                Promise
                .all(requestsArr)
                .then((value)=>{
                    console.log(value)
                    let messages = []
                    value.forEach((item, index)=>{
                        item.result.messages.forEach((message, index)=>{
                            messages.push({
                                type : message.type,
                                title: message.message,
                                group: `${item.request.material} - ${item.request.batchncc}`
                            })
                        })
                        if  (item.result.batch && item.result.batch !== '') {
                            thatController.dataUploadMap.get(`${item.request.material}${item.request.batchncc}${item.request.plant}`).batch = item.result.batch
                            thatController.dataUploadMap.get(`${item.request.material}${item.request.batchncc}${item.request.plant}`).valuationtype = item.result.batch
                            thatController.dataUploadMap.get(`${item.request.material}${item.request.batchncc}${item.request.plant}`).crtbatchstt = 'Success'
                        } else {
                            thatController.dataUploadMap.get(`${item.request.material}${item.request.batchncc}${item.request.plant}`).crtbatchstt = 'Failed'
                        }

                    })
                    var model = thatController.getView().getModel()
                    thatController.dataUpload = Array.from(thatController.dataUploadMap.values())
                    model.setProperty("/items", thatController.dataUpload, null, true)
                    thatController.showMessageView(messages)
                    thatController.busyDialog.close()
                })
                .catch((error)=>{
                    MessageBox.error('Đã có lỗi xảy ra')
                    console.error(JSON.stringify(error))
                    thatController.busyDialog.close()
                })
            },
            callSingleRequest: function (request) { 
                return new Promise((resolve, reject) => {
                    let postUrl = "https://" + window.location.hostname + "/sap/bc/http/sap/ZSD_API_UPLOAD_BATCH"
                    $.ajax({
                        url: postUrl,
                        type: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify(request),
                        success: function (response, textStatus, jqXHR) {
                            resolve({result: JSON.parse(response), request: request})
                        },
                        error: function (error) {
                            reject(error)
                        }
                    });
                })
            },
            callSingleRequestUpdatePrice: function (request) { 
                return new Promise((resolve, reject) => {
                    let postUrl = "https://" + window.location.hostname + "/sap/bc/http/sap/ZSD_API_UPDATE_PRICE"
                    $.ajax({
                        url: postUrl,
                        type: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify(request),
                        success: function (response, textStatus, jqXHR) {
                            resolve({result: JSON.parse(response), request: request})
                        },
                        error: function (error) {
                            reject(error)
                        }
                    });
                })
            },
            showMessageView : function(messages) {
                var thatController = this
                var oMessageTemplate = new MessageItem({ // Message view template
                    type: '{type}',
                    title: '{title}',
                    groupName: '{group}'
                });
                thatController.oCallApiMsgView = new MessageView({ //MessageView for response from Post FI Doc API
                    showDetailsPageHeader: false, itemSelect: function () {
                        oBackButton.setVisible(true);
                    },
                    items: {
                        path: "/",
                        template: oMessageTemplate
                    },
                    groupItems: true
                })
                var oBackButton = new Button({ //Back button for response from Post FI Doc API
                    icon: IconPool.getIconURI("nav-back"),
                    visible: false,
                    press: function () {
                        thatController.oCallApiMsgView.navigateBack();
                        this.setVisible(false);
                    }
                });
                thatController.oCallApiMsgViewDialog = new Dialog({ //Dialog for response from Post FI Doc API
                    resizable: true,
                    content: this.oCallApiMsgView,
                    state: 'Information',
                    beginButton: new Button({
                        press: function () {
                            this.getParent().close();
                        },
                        text: "Close"
                    }),
                    customHeader: new Bar({
                        contentLeft: [oBackButton],
                        contentMiddle: [
                            new Title({
                                text: "Message",
                                level: TitleLevel.H1
                            })
                        ]
                    }),
                    contentHeight: "50%",
                    contentWidth: "50%",
                    verticalScrolling: false
                })
                let messageJSON = JSON.parse(JSON.stringify(messages))
                var oMsgModel = new JSONModel();
                oMsgModel.setData(messageJSON)
                thatController.oCallApiMsgView.setModel(oMsgModel)
                thatController.oCallApiMsgView.navigateBack();
                thatController.oCallApiMsgViewDialog.open();
            },
            updatePrice: function (oEvent){
                var thatController = this
                let requestsArr = []
                let materialPrice = new Map()
                thatController.busyDialog.open()
                thatController.dataUpload.forEach((value, index) => {
                    if ( (value.crtbatchstt !== 'Failed') || ( value.batch && value.batch !== '' ) ){
                        if   (!materialPrice.get(value.material)) {
                            materialPrice.set(value.material, {
                                filename : thatController.pFileName,
                                postingdate : value.postingdate,
                                companycode : value.companycode,
                                material : value.material,   
                                items : [{ 
                                    plant : value.plant,     
                                    newprice : value.newprice,
                                    per : value.per,
                                    currency : value.currency,
                                    batch : value.batch,
                                    batchncc: value.batchncc
                                }]
                            })
                        } else {
                            materialPrice.get(value.material).items.push({
                                plant : value.plant,     
                                newprice : value.newprice,
                                per : value.per,
                                currency : value.currency,
                                batch : value.batch,
                                batchncc: value.batchncc
                            })
                        }
                        //requestsArr.push(thatController.callSingleRequest(request))
                    }
                })
                materialPrice.forEach((function(value, key) {
                    requestsArr.push(thatController.callSingleRequestUpdatePrice(value))
                }))
                Promise
                .all(requestsArr)
                .then((value)=>{
                    console.log(value)
                    let messages = []
                    value.forEach((item, index)=>{
                        item.result.messages.forEach((message, index)=>{
                            messages.push({
                                type : message.type,
                                title: message.message,
                                group: `${item.request.material} - ${item.request.batchncc}`
                            })
                        })
                        if  (item.result.updateprice && item.result.updateprice == 'S') {
                            item.request.items.forEach((itemRequest, index)=>{
                                thatController.dataUploadMap.get(`${item.request.material}${itemRequest.batchncc}${itemRequest.plant}`).updpricestt = 'Success'
                            })
                            
                        } else {
                            item.request.items.forEach((itemRequest, index)=>{
                                thatController.dataUploadMap.get(`${item.request.material}${itemRequest.batchncc}${itemRequest.plant}`).updpricestt = 'Failed'
                            })
                        }

                    })
                    var model = thatController.getView().getModel()
                    thatController.dataUpload = Array.from(thatController.dataUploadMap.values())
                    model.setProperty("/items", thatController.dataUpload, null, true)
                    thatController.showMessageView(messages)
                    thatController.busyDialog.close()
                })
                .catch((error)=>{
                    MessageBox.error('Đã có lỗi xảy ra')
                    console.error(JSON.stringify(error))
                    thatController.busyDialog.close()
                })
            },
            extractData: function (oRowContext, oColumn) {
                const oValue = oRowContext.getProperty(oColumn.getName());
                return oColumn.__type ? oColumn.__type.formatValue(oValue, "string") : oValue;
            },
            onCopy: function (oEvent) {
                MessageToast.show("Selection copied to clipboard");
            },
            downloadTemplate: function () {

                var excelColumnList = [
                    {
                        postingdate: '',
                        companycode: '',
                        plant: '',
                        material: '',
                        batch: '',
                        batchncc: '',
                        ngaysanxuat: '',
                        hansudung: '',
                        valuationtype: '',
                        newprice: '',
                        currency: ''
                    }

                ]
                const xlsxData = XLSX.utils.json_to_sheet(excelColumnList)
                const spreadsheet = XLSX.utils.book_new()
                var header_styles = {
                    fill: {
                        bgColor: {
                            rgb: "00586F"
                        }
                    },
                    font: {
                        bold: true,
                        sz: 11
                    },
                    alignment: {
                        horizontal: "center"
                    }
                };
                xlsxData["!cols"] = [
                    { wch: 20 },
                    { wch: 20 },
                    { wch: 20 },
                    { wch: 20 },
                    { wch: 20 },
                    { wch: 20 },
                    { wch: 20 },
                    { wch: 20 },
                    { wch: 20 },
                    { wch: 20 }
                ];
                XLSX.utils.book_append_sheet(spreadsheet, xlsxData, 'Data')
                spreadsheet.Sheets["Data"].A1.s = header_styles
                spreadsheet.Sheets["Data"].B1.s = header_styles
                spreadsheet.Sheets['Data'].C1.s = header_styles
                spreadsheet.Sheets['Data'].D1.s = header_styles
                spreadsheet.Sheets['Data'].E1.s = header_styles
                spreadsheet.Sheets['Data'].F1.s = header_styles
                spreadsheet.Sheets['Data'].G1.s = header_styles
                spreadsheet.Sheets['Data'].H1.s = header_styles
                spreadsheet.Sheets['Data'].I1.s = header_styles
                spreadsheet.Sheets['Data'].J1.s = header_styles
                XLSX.writeFile(spreadsheet, 'Upload_Batch_and_Price.xlsx')
                MessageToast.show("Template File Downloading...")
            },
        });
    });

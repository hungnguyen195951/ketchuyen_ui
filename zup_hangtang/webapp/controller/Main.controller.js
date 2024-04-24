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
    "sap/ui/model/FilterOperator"
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
        FilterOperator
    ) {
        "use strict";
        var TitleLevel = coreLibrary.TitleLevel;
        return Controller.extend("zuphangtang.controller.Main", {
            // global variable
            pDialog: null,
            pFileName: null,
            dataUpload: [],
            oCallApiMsgView: null,
            isBatchDeterm: false,
            
            onInit: function () {
                var oModel = new JSONModel();
                this.getView().setModel(oModel);
                this._registerForP13n();

                var oMessageTemplate = new MessageItem({ // Message view template
                    type: '{type}',
                    title: '{message}',
                    groupName: '{group}'
                });
                let thatController = this
                this.oCallApiMsgView = new MessageView({ //MessageView for response from Post FI Doc API
                    showDetailsPageHeader: false, itemSelect: function () {
                        oBackButton.setVisible(true);
                    },
                    items: {
                        path: "/",
                        template: oMessageTemplate
                    },
                    groupItems: true
                })
                var oBackButton = new Button({
                    icon: IconPool.getIconURI("nav-back"),
                    visible: false,
                    press: function () {
                        thatController.oCallApiMsgView.navigateBack();
                        this.setVisible(false);
                    }
                });
                this.oCallApiMsgViewDialog = new Dialog({
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

            },
            onBeforeRebindTableExtension : function(oEvent){
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters = oBindingParams.parameters || {};
                oBindingParams.filters.push(new sap.ui.model.Filter("HoaDonDieuChinh", "EQ", ""));
            },
            _registerForP13n: function () {
                var oTable = this.byId("idMainTable");
                this.oMetadataHelper = new MetadataHelper([
                    { key: "movementtype", label: "Movement Type", path: "movementtype" },
                    { key: "sohoadon", label: "Số hoá đơn", path: "sohoadon" },
                    { key: "sohoadongoc", label: "Số hoá đơn gốc", path: "sohoadongoc" },
                    { key: "postingdate", label: "Posting date", path: "postingdate" },
                    { key: "headertext", label: "Header text", path: "headertext" },
                    { key: "material", label: "Material", path: "material" },
                    { key: "quantity", label: "quantity", path: "quantity" },
                    { key: "unitofentry", label: "Unit of entry", path: "unitofentry" },
                    { key: "sloc", label: "Sloc", path: "sloc" },
                    { key: "batchncc", label: "Batch NCC", path: "batchncc" },
                    { key: "plant", label: "Plant", path: "plant" }
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
                if (!this.pDialog) {
                    Fragment.load({
                        id: "excel_upload",
                        name: "zuphangtang.controller.fragment.ExcelUpload",
                        type: "XML",
                        controller: this
                    }).then((oDialog) => {
                        var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                        oFileUploader.removeAllItems();
                        this.pDialog = oDialog;
                        this.pDialog.open();
                    })
                        .catch(error => alert('Try again'));
                } else {
                    var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                    oFileUploader.removeAllItems();
                    this.pDialog.open();
                }
            },
            onCloseDialog: function () {
                this.pDialog.close();
            },
            onUploadSetComplete: function (oEvent) {

                var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                var oFile = oFileUploader.getItems()[0].getFileObject();

                var reader = new FileReader();
                var thatController = this;
                thatController.pFileName = oFile.name
                reader.onload = (e) => {
                    let xlsx_content = e.currentTarget.result;
                    let workbook = XLSX.read(xlsx_content, { type: 'binary' });
                    var excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets["Data"]);
                    excelData.forEach((value, index) => {
                        thatController.dataUpload.push(value)
                    })
                    this.pDialog.close();
                    var model = thatController.getView().getModel()
                    model.setProperty("/items", thatController.dataUpload, null, true)
                    MessageToast.show("Upload Successful");
                }
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
                let thatController = this

                let oSelectedIndices = this.byId('idMainTable').getSelectedIndices();
                let oSelectedData = []
                if (oSelectedIndices.length == 0) {
                    MessageBox.error('Vui lòng chọn ít nhất 1 dòng')
                } else {
                    oSelectedIndices.forEach((index) => {
                        oSelectedData.push(this.dataUpload[index])
                    })
                    this.callApiPO(oSelectedData)
                }
            },
            callApiPO: function (oSelectedData) {
                let oBusyDialog = this.byId("idBusyDialog")
                if (!this.isBatchDeterm) {
                    MessageBox.error('Thực hiện Batch Determination trước khi post')
                    return
                }
                oBusyDialog.open()
                let thatController = this
                let batchURL = "https://" + window.location.hostname + "/sap/bc/http/sap/ZMM_API_UPLOAD_HTANG"
                $.ajax({
                    url: batchURL,
                    type: "POST",
                    contentType: 'application/json',
                    data: JSON.stringify({
                        option: 'POST',
                        items: oSelectedData
                    }),
                    success: function (response, textStatus, jqXHR) {

                        let model = thatController.getView().getModel()
                        thatController.dataUpload = JSON.parse(response).data
                        model.setProperty("/items", thatController.dataUpload, null, true)

                        if (JSON.parse(response).message && JSON.parse(response).message.length > 0) {
                            var oMsgModel = new JSONModel();
                            oMsgModel.setData(JSON.parse(response).message)
                            thatController.oCallApiMsgView.setModel(oMsgModel)
                            thatController.oCallApiMsgView.navigateBack();
                            thatController.oCallApiMsgViewDialog.open();
                        }

                        oBusyDialog.close()

                    },
                    error: function (error) {
                        MessageBox.error(`Đã có lỗi xảy ra: ${JSON.stringify(error)}`)
                        oBusyDialog.close()
                    }
                });

            },
            downloadTemplate: function () {

                var excelColumnList = [
                    {
                        sohoadon: '',
                        sohoadongoc: '',
                        movementtype: '',
                        postingdate: '',
                        headertext: '',
                        material: '',
                        plant: '',
                        sloc: '',
                        batchncc: '',
                        quantity: '',
                        unitofentry: ''
                    }

                ]
                const xlsxData = XLSX.utils.json_to_sheet(excelColumnList)
                const spreadsheet = XLSX.utils.book_new()
                var header_styles = {
                    fill: {
                        fgColor: {
                            rgb: "0091e4"
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
                XLSX.writeFile(spreadsheet, 'Upload_HangTang_template.xlsx')
                MessageToast.show("Template File Downloading...")
            },
            onBatchDetermination: function (oEvent) {
                let thatController = this
                let batchURL = "https://" + window.location.hostname + "/sap/bc/http/sap/ZMM_API_UPLOAD_HTANG";
                let oSelectedIndices = this.byId('idMainTable').getSelectedIndices();
                let oSelectedData = []
                let oBusyDialog = this.byId("idBusyDialog")
                oBusyDialog.open()
                if (oSelectedIndices.length == 0) {
                    MessageBox.error('Vui lòng chọn ít nhất 1 dòng')
                    oBusyDialog.close()
                } else {
                    oSelectedIndices.forEach((index) => {
                        oSelectedData.push(this.dataUpload[index])
                    })
                    $.ajax({
                        url: batchURL,
                        type: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify({
                            option: 'SIMU',
                            items: oSelectedData
                        }),
                        success: function (response, textStatus, jqXHR) {

                            thatController.isBatchDeterm = true
                            let model = thatController.getView().getModel()
                            thatController.dataUpload = JSON.parse(response).data
                            model.setProperty("/items", thatController.dataUpload, null, true)

                            if (JSON.parse(response).message && JSON.parse(response).message.length > 0) {
                                var oMsgModel = new JSONModel();
                                oMsgModel.setData(JSON.parse(response).message)
                                thatController.oCallApiMsgView.setModel(oMsgModel)
                                thatController.oCallApiMsgView.navigateBack();
                                thatController.oCallApiMsgViewDialog.open();
                            }

                            oBusyDialog.close()

                        },
                        error: function (error) {
                            MessageBox.error(`Đã có lỗi xảy ra: ${JSON.stringify(error)}`)
                            oBusyDialog.close()
                        }
                    });
                }
            }
        });
    });

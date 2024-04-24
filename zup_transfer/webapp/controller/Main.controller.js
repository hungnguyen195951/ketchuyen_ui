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
        return Controller.extend("zuptransfer.controller.Main", {
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
            _registerForP13n: function () {
                var oTable = this.byId("idMainTable");
                this.oMetadataHelper = new MetadataHelper([
                    { key: "movementtype", label: "Movement Type", path: "movementtype" },
                    { key: "postingdate", label: "Posting date", path: "postingdate" },
                    { key: "headertext", label: "Header text", path: "headertext" },
                    { key: "materialfrom", label: "Material from", path: "materialfrom" },
                    { key: "materialto", label: "Material to", path: "materialto" },
                    { key: "plantfrom", label: "Plant from", path: "plantfrom" },
                    { key: "plantto", label: "Plant to", path: "plantto" },
                    { key: "slocfrom", label: "Sloc From", path: "slocfrom" },
                    { key: "slocto", label: "Sloc to", path: "slocto" },
                    { key: "batchncc", label: "Batch NCC", path: "batchncc" },
                    { key: "batch", label: "Batch SAP", path: "batch" },
                    // { key: "batchto", label: "Lot to", path: "batchto" },
                    { key: "quantity", label: "quantity", path: "quantity" },
                    { key: "unitofentry", label: "Unit of entry", path: "unitofentry" },
                    { key: "ponumberZeta", label: "PO number ZETA", path: "ponumberZeta" },
                    { key: "moveprice", label: "Inventory Price", path: "moveprice" },
                    { key: "movepricecurrency", label: "Currency", path: "movepricecurrency" },
                    { key: "totalvalue", label: "Total value", path: "totalvalue" }
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
                        name: "zuptransfer.controller.fragment.ExcelUpload",
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
                        value.batchncc = this.upperCase(value.batchncc)
                        value.ponumberZeta = this.upperCase(value.ponumberZeta)
                        thatController.dataUpload.push(value)
                       
                    })
                    this.pDialog.close();
                    let checkExisted = new Promise((resolve, reject) => {
                        let logTrsfUrl = "https://" + window.location.hostname + "/sap/opu/odata/sap/ZMM_API_TRSF_POSTING_O2";
                        let oFilter = new Filter("filename", "EQ", thatController.pFileName)
                        let oLogTrsfModel = new ODataModel(logTrsfUrl, { json: true });
                        oLogTrsfModel.read("/zmm_i_upl_trsf", {
                            filters: [oFilter],
                            success: function (oData, response) { //found
                                resolve(oData, response)
                            },
                            error: function (error) { //not found
                                reject(error)
                            }
                        })
                    })
                    checkExisted
                        .then((oData, response) => {
                            var model = thatController.getView().getModel()
                            if (oData.results[0]) {
                                thatController.dataUpload = []
                                MessageBox.error(`File ${thatController.pFileName} đã được upload`);
                                model.setProperty("/items", thatController.dataUpload, null, true)
                                thatController.pDialog.close();
                            } else {
                                let oFilterPOZETA = []
                                thatController.dataUpload.forEach((value, index) => {
                                    oFilterPOZETA.push(new Filter("ponumber_zeta", "EQ", value.ponumberZeta))
                                })
                                let checkExistPOZETA = new Promise((resolve, reject) => {
                                    let logTrsfUrl = "https://" + window.location.hostname + "/sap/opu/odata/sap/ZMM_API_TRSF_POSTING_O2";
                                    let oLogTrsfModel = new ODataModel(logTrsfUrl, { json: true });
                                    oLogTrsfModel.read("/zmm_i_upl_trsf", {
                                        filters: oFilterPOZETA,
                                        success: function (oData, response) {
                                            resolve(oData, response)
                                        },
                                        error: function (error) {
                                            reject(error)
                                        }
                                    })
                                })
                                checkExistPOZETA
                                    .then((oData, response) => {
                                        if (oData.results[0]) {
                                            MessageBox.warning("Trong file có PO ZETA đã được post, bạn có muốn huỷ upload?", {
                                                actions: ["Huỷ upload", "Tiếp tục"],
                                                emphasizedAction: "Huỷ upload",
                                                onClose: function (sAction) {
                                                    if (sAction == 'Huỷ upload') {
                                                        thatController.dataUpload = []
                                                    } else {
                                                        model.setProperty("/items", thatController.dataUpload, null, true)
                                                        MessageToast.show("Upload Successful");
                                                    }

                                                }
                                            });
                                        } else {
                                            model.setProperty("/items", thatController.dataUpload, null, true)
                                            MessageToast.show("Upload Successful");
                                        }
                                        thatController.pDialog.close();
                                    })
                                    .catch((error) => {
                                        thatController.dataUpload = []
                                        thatController.pDialog.close();
                                    })
                            }

                        })
                        .catch((error) => {
                            //  MessageBox.error(error);
                            MessageBox.error(`Đã có xảy ra: ${JSON.stringify(error)}`)
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
            postData: async function (oEvent) {
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
            callApiPO: async function (oSelectedData) {
                let oBusyDialog = this.byId("idBusyDialog")
                if (!this.isBatchDeterm) {
                    MessageBox.error('Thực hiện Batch Determination trước khi post')
                    return
                }
                oBusyDialog.open()
                let thatController = this
                let oCallSingleAPI = []
                var listDoc = new Map()
                let isValid = true
                oSelectedData.forEach((value, index) => {
                    if (value.status == 'Error') {
                        isValid = false
                        return
                    }
                    if (!listDoc.has(`${value.ponumberZeta}${value.postingdate}`)) {
                        listDoc.set(`${value.ponumberZeta}${value.postingdate}`, [value])
                    } else {
                        listDoc.get(`${value.ponumberZeta}${value.postingdate}`).push(value)
                    }
                })

                if (!isValid) {
                    MessageBox.error('Data vẫn còn lỗi, không thể post')
                    oBusyDialog.close()
                    return
                }
                let message = []
                let index = 0
                async function recursionData(indexDoc) {
                    let value = listDoc.get(Array.from(listDoc.keys())[indexDoc]); 
                    // listDoc.forEach( async function (value, ponumberZeta, map) {
                        let item_doc = []
                        value.forEach(function (item, index) {
                            item_doc.push({
                                movementtype: thatController.checkNullData(item.movementtype),
                                materialfrom: thatController.checkNullData(item.materialfrom),
                                materialto: thatController.checkNullData(item.materialto),
                                plantfrom: thatController.checkNullData(item.plantfrom),
                                plantto: thatController.checkNullData(item.plantto),
                                slocfrom: thatController.checkNullData(item.slocfrom),
                                slocto: thatController.checkNullData(item.slocto),
                                batchfrom: thatController.checkNullData(item.batch),
                                // postingdate: thatController.checkNullData(item.postingdate),
                                batchto: thatController.checkNullData(item.batch),
                                quantity: thatController.checkNullNumber(item.quantity),
                                unitofentry: thatController.checkNullData(item.unitofentry)
                            })
                        })
                        thatController.getView().byId("radHuyHang").getSelected()
                        let option = ((thatController.getView().byId("radHuyHang").getSelected()) ? 'HUY' : 'CHUYEN')
                        let request = {
                            option: option,
                            filename: thatController.pFileName,
                            ponumberZeta: value[0].ponumberZeta,
                            postingdate: thatController.checkNullData(value[0].postingdate),
                            headertext: value[0].headertext,
                            toItem: item_doc
                        }                  
                        let callAPI = thatController.callSingleRequest(request)
                        await callAPI
                        .then((value)=> {
                            value.results.forEach(async (value, index) =>{
                                message.push({
                                    type: value.type,
                                    message: value.message,
                                    group: `PO Number ZETA ${value.ponumberZeta}`
                                })
                                indexDoc = indexDoc + 1
                                if (indexDoc >= listDoc.size) {
                                    let messageJSON = JSON.parse(JSON.stringify(message))
                                    var oMsgModel = new JSONModel();
                                    oMsgModel.setData(messageJSON)
                                    thatController.oCallApiMsgView.setModel(oMsgModel)
                                    thatController.oCallApiMsgView.navigateBack();
                                    thatController.oCallApiMsgViewDialog.open();
                                    oBusyDialog.close();
                                    thatController.dataUpload = []
                                    var model = thatController.getView().getModel()
                                    model.setProperty("/items", thatController.dataUpload, null, true)                                        
                                    return
                                } else {
                                    recursionData(indexDoc)
                                }
                                
                            })            
                        })
                                
                }
                recursionData(0)
            

                //NganNM_02.02.2024_start comment 
                // Promise.all(oCallSingleAPI)
                //     .then((value) => {
                //         let message = []
                //         value.forEach(response => {
                //             response.results.forEach(function (value, index) {
                //                 message.push({
                //                     type: value.type,
                //                     message: value.message,
                //                     group: `PO Number ZETA ${value.ponumberZeta}`
                //                 })
                //             })
                //         })
                //         let messageJSON = JSON.parse(JSON.stringify(message))
                //         var oMsgModel = new JSONModel();
                //         oMsgModel.setData(messageJSON)
                //         thatController.oCallApiMsgView.setModel(oMsgModel)
                //         thatController.oCallApiMsgView.navigateBack();
                //         thatController.oCallApiMsgViewDialog.open();
                //         oBusyDialog.close();
                //         thatController.dataUpload = []
                //         var model = thatController.getView().getModel()
                //         model.setProperty("/items", thatController.dataUpload, null, true)
                //     })
                //     .catch((error) => {
                //         MessageBox.error(JSON.stringify(error));
                //         oBusyDialog.close();
                //     })
                //NganNM_02.02.2024_end comment 
            },
            callSingleRequest: function (request) {
                return new Promise((resolve, reject) => {
                    let postFIUrl = "https://" + window.location.hostname + "/sap/bc/http/sap/ZMM_API_UPLOAD_TRSF_POSTING";
                    $.ajax({
                        url: postFIUrl,
                        type: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify(request),
                        success: function (response, textStatus, jqXHR) {
                            resolve(JSON.parse(response))
                        },
                        error: function (error) {
                            reject(error)
                        }
                    });
                })
            },
            callApiPOErrorHandle: function (error) {
                MessageBox.error(JSON.stringify(error));
            },
            downloadTemplate: function () {

                var excelColumnList = [
                    {
                        movementtype: '',
                        postingdate: '',
                        headertext: '',
                        materialfrom: '',
                        materialto: '',
                        plantfrom: '',
                        plantto: '',
                        slocfrom: '',
                        slocto: '',
                        batchncc: '',
                        quantity: '',
                        unitofentry: '',
                        ponumberZeta: ''
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
                spreadsheet.Sheets['Data'].K1.s = header_styles
                spreadsheet.Sheets['Data'].L1.s = header_styles
                spreadsheet.Sheets['Data'].M1.s = header_styles
                XLSX.writeFile(spreadsheet, 'Upload_TranferPsting_template.xlsx')
                MessageToast.show("Template File Downloading...")
            },
            upperCase : function(string){
                if (typeof string == "string" ) {
                    return string.toUpperCase()
                } else {
                    return string
                }
                
            },
            onBatchDetermination: function(oEvent) {
                let thatController = this
                let batchURL = "https://" + window.location.hostname + "/sap/bc/http/sap/ZMM_API_BATCHDETERM_TRSFPST";
                let oSelectedIndices = this.byId('idMainTable').getSelectedIndices();
                let oSelectedData = []
                let oBusyDialog = this.byId("idBusyDialog")
                oBusyDialog.open()
                if  (oSelectedIndices.length == 0) {
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
                        data: JSON.stringify(oSelectedData),
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

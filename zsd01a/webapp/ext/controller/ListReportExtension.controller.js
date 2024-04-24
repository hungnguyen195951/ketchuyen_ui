sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageItem",
    "sap/m/MessageView",
    "sap/m/MessageBox",
    'sap/ui/core/library',
    'sap/m/Dialog',
    'sap/m/Button',
    'sap/m/Bar',
    'sap/m/Title',
    "sap/ui/model/Filter",
    'sap/ui/core/IconPool',
    "./xlsx/xlsx",
    './xlsx/xlsx.bundle'
],
    function (Controller, Fragment, JSONModel, MessageItem, MessageView, MessageBox, coreLibrary, Dialog, Button, Bar, Title, Filter, IconPool) {
        "use strict";
        return {
            simulateDialog: null,
            zsd01abusyDialog: null,
            htmlDialog: null,
            arrData: [],
            onInit: function (oEvent) {
                //Load Busy
                Fragment.load({
                    id: "zsd01abusyFragment",
                    name: "zsd01a.ext.fragment.Busy",
                    type: "XML",
                    controller: this
                })
                    .then((oDialog) => {
                        this.zsd01abusyDialog = oDialog;
                    })
                    .catch(error => {
                        MessageBox.error('Vui lòng tải lại trang')
                    });
                //Load HTML
                Fragment.load({
                    id: "htmlFragment",
                    name: "zsd01a.ext.fragment.HTML",
                    type: "XML",
                    controller: this
                })
                    .then((oDialog) => {
                        this.htmlDialog = oDialog;
                    })
                    .catch(error => {
                        MessageBox.error('Vui lòng tải lại trang')
                    });


                //Load Simulate
                Fragment.load({
                    id: "simulateFragment",
                    name: "zsd01a.ext.fragment.SimulateObject",
                    type: "XML",
                    height: "300px",
                    controller: this
                })
                    .then((oDialog) => {
                        thatController.simulateDialog = oDialog;
                    })
                    .catch(error => {
                        MessageBox.error('Vui lòng tải lại trang')
                    });

                //Initial MessageView
                let thatController = this
                var oMessageTemplate = new MessageItem({ // Message view template
                    type: '{type}',
                    title: '{title}',
                    groupName: '{group}'
                });
                this.oCallApiMsgView = new MessageView({
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
                                level: coreLibrary.TitleLevel.H1
                            })
                        ]
                    }),
                    contentHeight: "50%",
                    contentWidth: "50%",
                    verticalScrolling: false
                })
            },
            onBeforeRebindTableExtension: function (oEvent) {
                // var oBindingParams = oEvent.getParameter("bindingParams");
                // oBindingParams.parameters = oBindingParams.parameters || {};
                // oBindingParams.filters.push(new sap.ui.model.Filter("HoaDonDieuChinh", "EQ", "N"));
            },
            onActionCreateMaterialDocument: async function (oEvent) {
                var component = this.getOwnerComponent();
                let thatController = this
                let oSelectedContext = this.extensionAPI.getSelectedContexts();
                this.zsd01abusyDialog.open()
                let oGetBillingData = []
                oSelectedContext.forEach(element => {
                    oGetBillingData.push(thatController.getBillingDataNew(element))
                })
                Promise.all(oGetBillingData)
                    .then((value) => {
                        let keyStock = new Map()
                        let data = []
                        //plant product batchncc storagelocation
                        value.forEach(entry => {
                            entry.billingItems.forEach((item) => {
                                if (keyStock.has(`${item.Plant}${item.Product}${item.Z001}${item.Storagelocation}`)) {
                                    keyStock.get(`${item.Plant}${item.Product}${item.Z001}${item.Storagelocation}`).push({
                                        billingDocument: item.BillingDocument,
                                        billingDocumentItem: item.BillingDocumentItem
                                    })
                                } else {
                                    keyStock.set(`${item.Plant}${item.Product}${item.Z001}${item.Storagelocation}`, [
                                        {
                                            billingDocument: item.BillingDocument,
                                            billingDocumentItem: item.BillingDocumentItem
                                        }
                                    ])
                                }
                            })
                        })
                        return keyStock
                    })
                    .then((data) => {
                        let callList = []
                        data.forEach((value, key) => {
                            callList.push(thatController.getFunction(value, 'SIMU'))
                        });
                        Promise.all(callList)
                            .then((value) => {
                                let message = []
                                let transactionidlist = []
                                let isValid = true
                                value.forEach((request) => {
                                    if (request.errors && request.errors.length !== 0) { // Có lỗi
                                        request.errors.forEach(error => {
                                            message.push({
                                                type: error.type,
                                                title: error.message,
                                                group: `Billing ${error.billingdocument}`
                                            })
                                            if (error.type == 'Error') {
                                                isValid = false
                                            }
                                        })
                                    }
                                    request.transactionidlist.forEach(transactionid => {
                                        transactionidlist.push({
                                            transactionid: transactionid.transactionid
                                        })
                                    })
                                })
                                if (!isValid) {
                                    let messageJSON = JSON.parse(JSON.stringify(message))
                                    var oMsgModel = new JSONModel();
                                    oMsgModel.setData(messageJSON)
                                    oMsgModel.setSizeLimit(message.length ? message.length : 1000 )
                                    thatController.oCallApiMsgView.setModel(oMsgModel)
                                    thatController.oCallApiMsgView.navigateBack();
                                    thatController.oCallApiMsgViewDialog.open();
                                    thatController.zsd01abusyDialog.close();
                                    thatController.getView().getModel().refresh()
                                } else {
                                    let request = JSON.stringify({
                                        method: 'POST',
                                        transactionidlist: transactionidlist
                                    })
                                    let url = "https://" + window.location.hostname + "/sap/bc/http/sap/ZSD_API_BILL_TO_MATDOC?=";
                                    $.ajax({
                                        url: url,
                                        type: "POST",
                                        contentType: "application/json",
                                        data: request,
                                        success: function (response, textStatus, jqXHR) {
                                            let responseJSON = JSON.parse(response)
                                            responseJSON.errors.forEach(error => {
                                                message.push({
                                                    type: error.type,
                                                    title: error.message,
                                                    group: `Billing ${error.billingdocument}`
                                                })
                                            })
                                            let messageJSON = JSON.parse(JSON.stringify(message))
                                            var oMsgModel = new JSONModel();
                                            oMsgModel.setData(messageJSON)
                                            oMsgModel.setSizeLimit(message.length ? message.length : 1000 )
                                            thatController.oCallApiMsgView.setModel(oMsgModel)
                                            thatController.oCallApiMsgView.navigateBack();
                                            thatController.oCallApiMsgViewDialog.open();
                                            thatController.zsd01abusyDialog.close();
                                            thatController.getView().getModel().refresh()
                                        },
                                        error: function (error) {
                                            MessageBox.error(`Có lỗi xảy ra ${error.message}`)
                                            thatController.zsd01abusyDialog.close()
                                        }
                                    });
                                }
                            })
                            .catch((error) => {
                                thatController.zsd01abusyDialog.close()
                                if (error.status == 500) {
                                    thatController.htmlDialog.byId('idHTMLContent').setContent(error.responseText)
                                    thatController.htmlDialog.open()
                                } else {
                                    console.error(error);
                                    MessageBox.error(`Có lỗi xảy ra ${error.message}`)
                                }
                            });
                    })
                    .catch((error) => {
                        thatController.zsd01abusyDialog.close()
                        if (error.status == 500) {
                            thatController.htmlDialog.byId('idHTMLContent').setContent(error.responseText)
                            thatController.htmlDialog.open()
                        } else {
                            console.error(error);
                            MessageBox.error(`Có lỗi xảy ra ${error.message}`)
                        }
                    });
            },
            onActionSimulate: async function (oEvent) {
                let thatController = this
                let simulationData = {}
                let oSelectedContext = this.extensionAPI.getSelectedContexts();
                this.zsd01abusyDialog.open()
                let oGetBillingData = []
                oSelectedContext.forEach(element => {
                    // oGetBillingData.push(thatController.getBillingData(element))
                    oGetBillingData.push(thatController.getBillingDataNew(element))
                })
                Promise.all(oGetBillingData)
                    .then((value) => {
                        let keyStock = new Map()
                        let data = []
                        //plant product batchncc storagelocation
                        value.forEach(entry => {
                            entry.billingItems.forEach((item) => {
                                if (keyStock.has(`${item.Plant}${item.Product}${item.Z001}${item.Storagelocation}`)) {
                                    keyStock.get(`${item.Plant}${item.Product}${item.Z001}${item.Storagelocation}`).push({
                                        billingDocument: item.BillingDocument,
                                        billingDocumentItem: item.BillingDocumentItem
                                    })
                                } else {
                                    keyStock.set(`${item.Plant}${item.Product}${item.Z001}${item.Storagelocation}`, [
                                        {
                                            billingDocument: item.BillingDocument,
                                            billingDocumentItem: item.BillingDocumentItem
                                        }
                                    ])
                                }
                            })
                        })
                        return keyStock
                    })
                    .then((data) => {
                        let callList = []
                        data.forEach((value, key) => {
                            callList.push(thatController.getFunction(value, 'SIMU'))
                        });
                        Promise.all(callList)
                            .then((value) => {
                                let returnSimulate = []
                                let message = []
                                value.forEach((request) => {
                                    request.results.forEach((item) => {
                                        returnSimulate.push(item)
                                    })
                                    if (request.errors && request.errors.length !== 0) { // Có lỗi
                                        request.errors.forEach(error => {
                                            message.push({
                                                type: error.type,
                                                title: error.message,
                                                group: `Billing ${error.billingdocument}`
                                            })
                                        })
                                    }
                                })
                                simulationData.Items = returnSimulate
                                let oModel = new JSONModel(simulationData);
                                thatController.arrData = simulationData
                                oModel.setSizeLimit(returnSimulate.length ? returnSimulate.length  : 1000 );
                                thatController.simulateDialog.setModel(oModel, "SimulateData")
                                thatController.simulateDialog.open()
                                thatController.zsd01abusyDialog.close()
                                if (message.length != 0) {
                                    let messageJSON = JSON.parse(JSON.stringify(message))
                                    var oMsgModel = new JSONModel();
                                    oMsgModel.setData(messageJSON)
                                    oMsgModel.setSizeLimit(message.length ? message.length : 1000 );
                                    thatController.oCallApiMsgView.setModel(oMsgModel)
                                    thatController.oCallApiMsgView.navigateBack();
                                    thatController.oCallApiMsgViewDialog.open();
                                }

                            })
                    })
                    .catch((error) => {
                        thatController.zsd01abusyDialog.close()
                        MessageBox.error(`Có lỗi xảy ra ${error.message}`)
                    });
                    let calSingle = new Promise((resolve, reject)=>{
                        //calll api
                        //success: resolve
                    })
                    calSingle
                    .then((value)=>{

                      //  return { attr1 = '111', attr = '222'}
                    })
                    .then((data)=>{

                    })
                    .catch((error)=>{

                    })
            },
            getFunction: function (input, funcname) {
                return new Promise((resolve, reject) => {
                    let request = JSON.stringify({
                        method: funcname,
                        data: input
                    })
                    let url = "https://" + window.location.hostname + "/sap/bc/http/sap/ZSD_API_BILL_TO_MATDOC?=";
                    $.ajax({
                        url: url,
                        type: "POST",
                        contentType: "application/json",
                        data: request,
                        success: function (response, textStatus, jqXHR) {
                            let data = JSON.parse(response)
                            resolve(data)
                        },
                        error: function (data) {
                            reject(data)
                        }
                    });
                })
            },
            getBillingData: function (element) {
                return new Promise((resolve, reject) => {
                    let oBillingModel = element.getModel()
                    // let listItem = []
                    oBillingModel.read(element.getPath(), {
                        success: function (oData, oResponse) {
                            resolve({ billingDocument: oData.BillingDocument })
                        },
                        error: function (error) {
                            reject(error)
                        }
                    })
                })
            },
            getBillingDataNew: function (element) {
                return new Promise((resolve, reject) => {
                    let oBillingModel = element.getModel()
                    oBillingModel.read(element.getPath(),
                        {
                            success: function (oHeader, oResponse) {
                                let urlItem = '/ZSD_C_BILLING_TO_MATDOC_ITEM'
                                let arrDataFilter = []
                                arrDataFilter.push(new Filter("BillingDocument", "EQ", oHeader.BillingDocument))
                                oBillingModel.read(urlItem, {
                                    filters: arrDataFilter,
                                    urlParameters: {
                                        '$top': 999999
                                    },
                                    success: function (oItem) {
                                        resolve({
                                            billingHeader: oHeader,
                                            billingItems: oItem.results
                                        })
                                    },
                                    error: function (error) {
                                        reject(error)
                                    }
                                })
                            },
                            error: function (error) {
                                reject(error)
                            }
                        })
                })
            },
            getBatchesForPGI: function (data) {
                return new Promise((resolve, reject) => {
                    let request = JSON.stringify(data)
                    let url = "https://" + window.location.hostname + "/sap/bc/http/sap/ZSD_API_GET_BATCHES_FOR_PGI?=";
                    $.ajax({
                        url: url,
                        type: "POST",
                        contentType: "application/json",
                        data: request,
                        success: function (response, textStatus, jqXHR) {
                            let data = JSON.parse(response)
                            resolve(data)
                        },
                        error: function (data) {
                            reject(data)
                        }
                    });
                })
            },
            onExport: function (oEvent) {
                let thatController = this
                thatController.zsd01abusyDialog.open()
                let listCol = []
                let excelData = []
                listCol.push({ name: "Billing Document", colField: "billingdocument" })
                listCol.push({ name: "Billing Document Item", colField: "billingdocumentitem" })
                listCol.push({ name: "Plant", colField: "plant" })
                listCol.push({ name: "Billing Document Date", colField: "billingdocumentdate" })
                listCol.push({ name: "Product", colField: "product" })
                listCol.push({ name: "Inventory Price", colField: "moveprice" })
                listCol.push({ name: "Currency", colField: "movepricecurrency" })
                listCol.push({ name: "Total Value", colField: "totalvalue" })
                listCol.push({ name: "Goods Movement Type", colField: "goodmvt" })
                listCol.push({ name: "Batch", colField: "batch" })
                listCol.push({ name: "Batch NCC", colField: "batchncc" })
                listCol.push({ name: "Unit", colField: "baseunit" })
                listCol.push({ name: "Quantity", colField: "quantity" })
                listCol.push({ name: "Sale Org", colField: "salesorganization" })
                listCol.push({ name: "Storage Loc", colField: "storagelocation" })
                listCol.push({ name: "GL Account", colField: "glaccount" })

                let row = []
                listCol.forEach(col => {
                    row.push(col.name)
                })
                excelData.push(row)
                thatController.arrData.Items.forEach(item => {
                    row = []
                    listCol.forEach(col => {
                        row.push(item[col.colField] ? item[col.colField] : '')
                    })
                    excelData.push(row)
                })
                var worksheet = XLSX.utils.aoa_to_sheet(excelData)

                var colWidth = [
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 },
                    { wch: 60 }
                ]


                worksheet['!cols'] = colWidth
                var workbook = XLSX.utils.book_new()

                const rowNum = excelData.length
                var alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"]

                XLSX.utils.book_append_sheet(workbook, worksheet, "BillingExcel")
 
                var header_style = {
                    font: {
                        name: "times new roman",
                        bold: true,
                        sz: 14
                    },
                    alignment: {
                        horizontal: "center"
                    },
                    border: {
                        top: { style: "thin", color: "#000000" },
                        bottom: { style: "thin", color: "#000000" },
                        left: { style: "thin", color: "#000000" },
                        right: { style: "thin", color: "#000000" }
                    }
                }

                var content_style = {
                    font: {
                        name: "times new roman",
                        sz: 13
                    },
                    alignment: {
                        horizontal: "center"
                    },
                    border: {
                        bottom: { style: "thin", color: "#000000" },
                        right: { style: "thin", color: "#000000" },
                        left: { style: "thin", color: "#000000" }
                    }
                }

                var cur_style = {
                    alignment: {
                        horizontal: "right"
                    },
                    font: {

                        name: "times new roman",
                        sz: 14
                    },
                    border: {
                        top: { style: "thin", color: "#000000" },
                        bottom: { style: "thin", color: "#000000" },
                        right: { style: "thin", color: "#000000" },
                        left: { style: "thin", color: "#000000" }
                    },

                }

                workbook.Sheets["BillingExcel"].A1.s = header_style
                workbook.Sheets["BillingExcel"].B1.s = header_style
                workbook.Sheets["BillingExcel"].C1.s = header_style
                workbook.Sheets["BillingExcel"].D1.s = header_style
                workbook.Sheets["BillingExcel"].E1.s = header_style
                workbook.Sheets["BillingExcel"].F1.s = header_style
                workbook.Sheets["BillingExcel"].G1.s = header_style
                workbook.Sheets["BillingExcel"].H1.s = header_style
                workbook.Sheets["BillingExcel"].I1.s = header_style
                workbook.Sheets["BillingExcel"].J1.s = header_style
                workbook.Sheets["BillingExcel"].K1.s = header_style
                workbook.Sheets["BillingExcel"].L1.s = header_style
                workbook.Sheets["BillingExcel"].M1.s = header_style
                workbook.Sheets["BillingExcel"].N1.s = header_style
                workbook.Sheets["BillingExcel"].O1.s = header_style
                workbook.Sheets["BillingExcel"].P1.s = header_style

                for(let i = 2;i <= rowNum;i ++){
                    for (let j = 0;j < alphabet.length;j ++){
                        var a = alphabet[j] + i
                        worksheet[a].s = content_style
                    }
                }

                XLSX.writeFile(workbook, "BillingExcel.xlsx")
                thatController.zsd01abusyDialog.close()
            },
            handleOdataError: function (error) {
                MessageBox.error(`Có lỗi xảy ra ${error.message}`)
            },
            onCloseDialog: function (oEvent) {
                this.simulateDialog.close()
            }
        }
    }
)

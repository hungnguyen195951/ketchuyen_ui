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
    'sap/ui/core/IconPool',
],
    function (Controller, Fragment, JSONModel, MessageItem, MessageView, MessageBox, coreLibrary, Dialog, Button, Bar, Title, IconPool) {
        "use strict";

        return {
            simulateDialog: null,
            busyDialog: null,
            onInit: function (oEvent) {
                //Load Busy
                Fragment.load({
                    id: "busyFragment",
                    name: "zuppolog.ext.fragment.Busy",
                    type: "XML",
                    controller: this
                })
                    .then((oDialog) => {
                        this.busyDialog = oDialog;
                    })
                    .catch(error => {
                        MessageBox.error('Vui lòng tải lại trang')
                    });


                let thatController = this
                var oMessageTemplate = new MessageItem({ // Message view template
                    type: '{type}',
                    title: '{title}',
                    groupName: '{group}'
                });
                thatController.oCallApiMsgView = new MessageView({
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
                thatController.oCallApiMsgViewDialog = new Dialog({
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
            onActionPost: function (oEvent) {
                let thatController = this
                let oSelectedContext = this.extensionAPI.getSelectedContexts();
                this.busyDialog.open()
                let getPOUploadData = []
                oSelectedContext.forEach(element => {
                    getPOUploadData.push(thatController.getPOUploadData(element))
                })
                Promise
                    .all(getPOUploadData)
                    .then((value) => {
                        let message = []
                        let listMiroRequest = []
                        let mapFileName = new Map()
                        value.forEach(response => {
                            if (!mapFileName.get(response.filename)) {
                                mapFileName.set(response.filename, response.filename)
                                listMiroRequest.push(thatController.callMiroForEachFile({ filename: response.filename }))
                            }
                            response.data.results.forEach(function (value, index) {
                                message.push({
                                    type: value.type,
                                    title: value.message,
                                    group: `PO Number ZETA ${value.ponumberZeta}`
                                })
                            })
                        })
                        if (listMiroRequest.length !== 0) {
                            Promise
                                .all(listMiroRequest)
                                .then((value) => {
                                    value.forEach((response) => {
                                        response.results.forEach((result) => {
                                            message.push({
                                                type: result.type,
                                                title: result.message,
                                                group: `Invoice ${value.reference}`
                                            })
                                        })

                                    })
                                    let messageJSON = JSON.parse(JSON.stringify(message))
                                    var oMsgModel = new JSONModel();
                                    oMsgModel.setData(messageJSON)
                                    thatController.oCallApiMsgView.setModel(oMsgModel)
                                    thatController.oCallApiMsgView.navigateBack();
                                    thatController.oCallApiMsgViewDialog.open();
                                    thatController.busyDialog.close();
                                    thatController.getView().getModel().refresh()

                                })
                        } else {
                            let messageJSON = JSON.parse(JSON.stringify(message))
                            var oMsgModel = new JSONModel();
                            oMsgModel.setData(messageJSON)
                            thatController.oCallApiMsgView.setModel(oMsgModel)
                            thatController.oCallApiMsgView.navigateBack();
                            thatController.oCallApiMsgViewDialog.open();
                            thatController.busyDialog.close();
                            thatController.getView().getModel().refresh()
                        }
                        
                    })
            },
            callMiroForEachFile: function (request) {
                return new Promise((resolve, reject) => {
                    let postFIUrl = `https://${window.location.hostname}/sap/bc/http/sap/ZMM_API_UPLOAD_POINV`
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
            getPOUploadData: function (element) {
                return new Promise((resolve, reject) => {
                    let oPoUploadZeta = element.getModel()
                    oPoUploadZeta.read(element.getPath(), {
                        success: function (oData, oResponse) {
                            let request = {
                                filename: oData.filename,
                                update: 'X',
                                doc: {
                                    ponumberZeta: oData.ponumber_zeta,
                                    purchaseorder: oData.purchaseorder
                                }
                            }
                            let requestJSON = JSON.stringify(request)
                            let url = "https://" + window.location.hostname + "/sap/bc/http/sap/ZMM_API_UPLOAD_PO?=";
                            $.ajax({
                                url: url,
                                type: "POST",
                                contentType: "application/json",
                                data: requestJSON,
                                success: function (response, textStatus, jqXHR) {
                                    let data = JSON.parse(response)
                                    resolve({
                                        filename: oData.filename,
                                        data: data
                                    })
                                },
                                error: function (error) {
                                    reject(error)
                                }
                            });
                        },
                        error: function (error) {
                            reject(error)
                        }
                    })
                })
            }
        }
    }
)

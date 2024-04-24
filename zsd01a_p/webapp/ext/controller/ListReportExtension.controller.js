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
            onInit: function (oEvent) {
                let thatController = this
                var oMessageTemplate = new MessageItem({ // Message view template
                    type: '{type}',
                    title: '{title}'
                });
                thatController.oCallApiMsgView = new MessageView({
                    showDetailsPageHeader: false, itemSelect: function () {
                        oBackButton.setVisible(true);
                    },
                    items: {
                        path: "/",
                        template: oMessageTemplate
                    }
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
            onActionCancelMaterialDocument: function (oEvent) {
                let thatController = this
                let oSelectedContext = this.extensionAPI.getSelectedContexts();
                if (!this.busyDialog) {
                    Fragment.load({
                        id: "busyFragment",
                        name: "zsd01ap.ext.fragment.Busy",
                        type: "XML",
                        controller: this
                    })
                        .then((oDialog) => {
                            this.busyDialog = oDialog;
                            this.busyDialog.open()
                        })
                        .catch(error => alert(error.message));
                } else {
                    this.busyDialog.open()
                }
                let oGetBillingData = []
                oSelectedContext.forEach(element => {
                    oGetBillingData.push(thatController.getBillingData(element))
                })

                let model = this.getView().getModel()
                Promise.all(oGetBillingData)
                    .then((value) => {
                        let data = []
                        value.forEach(billing => {
                            data.push(billing)
                        })
                        return data
                    })
                    .then((data) => {
                        let oCancelMatdoc = []
                        data.forEach(function (element, index) {
                            oCancelMatdoc.push(thatController.cancelMatDoc(element))
                        });
                        Promise.all(oCancelMatdoc)
                            .then((value) => {
                                thatController.busyDialog.close()
                                let message = []
                                value.forEach((result) => {
                                    result.results.forEach((error)=>{
                                        message.push({
                                            type: error.type,
                                            title: error.message,
                                            group: `Billing ${error.billingdocument}`
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
                                model.refresh()
                            })
                            .catch((error) => {
                                thatController.busyDialog.close()
                                model.refresh()
                            })
                    })
                    .catch((error) => {
                        MessageBox.error(`Có lỗi xảy ra: ${ error.message }`)
                        thatController.busyDialog.close()
                        console.log(error)
                    })
            },
            cancelMatDoc: function (element) {
                return new Promise((resolve, reject) => {

                    // //url
                    // console.log(this.getView().getModel().oHeaders['x-csrf-token'])
                    // let cancelURl = `https://${window.location.hostname}/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/Cancel?MaterialDocument='${element.matdoc}'&MaterialDocumentYear='${element.matdocyear}'&PostingDate=datetime'2023-12-03T00:00'`
                    // $.ajax({
                    //     url: cancelURl,
                    //     type: "POST",
                    //     // contentType: "application/json",
                    //     // data: request,
                    //     success: function (response, textStatus, jqXHR) {
                    //         let data = JSON.parse(response)
                    //         resolve(data)
                    //     },
                    //     error: function (data) {
                    //         reject(data)
                    //     }
                    // });
                     let request = JSON.stringify(element)
                     let url = "https://" + window.location.hostname + "/sap/bc/http/sap/ZSD_API_REV_MATDOC?=";
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
                            resolve({
                                billingDocument: oData.BillingDocument,
                                matdoc: oData.Matdoc,
                                matdocyear: oData.Matdocyear,
                                postingdate: oData.PostingDate
                            })
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

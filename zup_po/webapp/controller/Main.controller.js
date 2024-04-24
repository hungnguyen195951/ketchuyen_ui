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
        return Controller.extend("zuppo.controller.Main", {
            // global variable
            pDialog: null,
            pFileName: null,
            dataUpload: [],
            onInit: function () {
                this.getView().byId("chkTaoDonHang").setSelected(true);
                this.getView().byId("chkNhapKho").setSelected(true);
                this.getView().byId("chkGhiNhanHD").setSelected(true);
                var oModel = new JSONModel();
                this.getView().setModel(oModel);
                this._zupporegisterForP13n();
                if (window.isSecureContext) {
                    const oTable = this.getView().byId('idMainTable');
                    oCellSelector = new CellSelector();
                    oTable.addDependent(oCellSelector);
                    oCopyProvider = new CopyProvider({ extractData: this.extractData, copy: this.onCopy });
                    oTable.addDependent(oCopyProvider);
                }
                var oMessageTemplate = new MessageItem({ // Message view template
                    type: '{type}',
                    title: '{title}',
                    groupName: '{group}'
                });
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
                let thatController = this
                var oBackButton = new Button({ //Back button for response from Post FI Doc API
                    icon: IconPool.getIconURI("nav-back"),
                    visible: false,
                    press: function () {
                        thatController.oCallApiMsgView.navigateBack();
                        this.setVisible(false);
                    }
                });
                this.oCallApiMsgViewDialog = new Dialog({
                    resizable: true,
                    content: thatController.oCallApiMsgView,
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
            _zupporegisterForP13n: function () {
                var oTable = this.byId("idMainTable");
                this.oMetadataHelper = new MetadataHelper([
                    { key: "companycode", label: "Company code", path: "companycode" },
                    { key: "companycode_txt", label: "Company code Des", path: "companycode_txt" },
                    { key: "purchasingorg", label: "Purchasing Org", path: "purchasingorg" },
                    { key: "purchasingorg_txt", label: "Purchasing Org Des", path: "purchasingorg_txt" },
                    { key: "purchasinggroup", label: "Purchasing group", path: "purchasinggroup" },
                    { key: "purchasinggroup_txt", label: "Purchasing group Des", path: "purchasinggroup_txt" },
                    { key: "potype", label: "PO Type", path: "potype" },
                    { key: "potype_txt", label: "PO Type Name", path: "potype_txt" },
                    { key: "ponumber_zeta", label: "PO Numbe Zeta", path: "ponumber_zeta" },
                    { key: "supplier", label: "Supplier", path: "supplier" },
                    { key: "supplier_txt", label: "Supplier Name", path: "supplier_txt" },
                    // { key: "accountassigmentcate", label: "Acc Assignment Category", path: "accountassigmentcate" },
                    // { key: "itemcate", label: "Item Category", path: "itemcate" },
                    { key: "material", label: "Material", path: "material" },
                    { key: "material_txt", label: "Material Name", path: "material_txt" },
                    { key: "materialgroup_txt", label: "Material Group", path: "materialgroup_txt" },
                    { key: "poquantity", label: "PO Quantity", path: "poquantity" },
                    { key: "orderunit", label: "Order unit", path: "orderunit" },
                    { key: "deliverydate", label: "Delivery date", path: "deliverydate" },
                    { key: "netprice", label: "Net price", path: "netprice" },
                    { key: "per", label: "Net price", path: "per" },
                    { key: "orderpriceuom", label: "Order price UOM", path: "orderpriceuom" },
                    { key: "plant", label: "Plant", path: "plant" },
                    { key: "plant_txt", label: "Plant", path: "plant_txt" },
                    { key: "storagelocation", label: "Storage Location", path: "storagelocation" },
                    { key: "storagelocation_txt", label: "Storage Location Name", path: "storagelocation_txt" },
                    // { key: "batch", label: "Batch", path: "batch" },
                    { key: "soloncc", label: "Số lô NCC", path: "soloncc" },
                    { key: "ngaysanxuat", label: "Ngày sản xuất", path: "ngaysanxuat" },
                    { key: "hansudung", label: "Hạn sử dụng", path: "hansudung" },
                    { key: "username", label: "Username", path: "username" },
                    // { key: "purchasinginforecord", label: "Purchasing Info Record", path: "purchasinginforecord" },
                    { key: "freeofcharge", label: "Free of charge", path: "freeofcharge" },
                    // { key: "outlineagreement", label: "Outline Agreement", path: "outlineagreement" },
                    // { key: "contractitem", label: "Contract Item", path: "contractitem" },
                    // { key: "costcenter", label: "Cost Center", path: "costcenter" },
                    // { key: "glaccount", label: "GL Account", path: "glaccount" },
                    { key: "reference", label: "Reference", path: "reference" },
                    { key: "taxcode", label: "Tax Code", path: "taxcode" },
                    { key: "ngayhoadon", label: "Ngày hoá đơn", path: "ngayhoadon" },
                    { key: "paymentterm", label: "Payment term", path: "paymentterm" },
                    { key: "documentcurrency", label: "Currency", path: "documentcurrency" },
                    { key: "calculatetax", label: "Calculate tax", path: "calculatetax" },
                    { key: "taxamt", label: "Tax amount", path: "taxamt" },
                    { key: "taxbaseamt", label: "Tax base amount", path: "taxbaseamt" },
                    { key: "thuenhapkhau", label: "Thuế nhập khẩu", path: "thuenhapkhau" },
                    { key: "vatuythac", label: "VAT uỷ thác", path: "vatuythac" },
                    { key: "exchangerate", label: "Exchange rate", path: "exchangerate" }
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
                        name: "zuppo.controller.fragment.ExcelUpload",
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
            getDescription: function (data) {
                var thatController = this
                return new Promise((resolve, reject) => {
                    let requestMap = new Map()
                    let tempData = []
                    data.forEach((value, index) => {
                        requestMap.set(`${index}`, value)
                        tempData.push({
                            index: `${index}`,
                            ponumber_zeta: value.ponumber_zeta,
                            companycode: value.companycode,
                            purchasingorg: value.purchasingorg,
                            purchasinggroup: value.purchasinggroup,
                            potype: value.potype,
                            supplier: value.supplier,
                            material: value.material,
                            materialgroup: value.materialgroup,
                            plant: value.plant,
                            storagelocation: value.storagelocation
                        })
                    })
                    let request = {
                        filename: thatController.pFileName,
                        toItem: tempData
                    }
                    let getDesUrl = "https://" + window.location.hostname + "/sap/bc/http/sap/ZMM_API_GET_INFO_UPL_PO";
                    $.ajax({
                        url: getDesUrl,
                        type: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify(request),
                        success: function (response, textStatus, jqXHR) {
                            let responseJSON = JSON.parse(response)
                            responseJSON.toItem.forEach((value, index) => {
                                requestMap.get(value.index).companycode_txt = value.companycodeTxt
                                requestMap.get(value.index).purchasingorg_txt = value.purchasingorgTxt
                                requestMap.get(value.index).purchasinggroup_txt = value.purchasegroupTxt
                                requestMap.get(value.index).potype_txt = value.potypeTxt
                                requestMap.get(value.index).supplier_txt = value.supplierTxt
                                requestMap.get(value.index).material_txt = value.materialTxt
                                requestMap.get(value.index).materialgroup_txt = value.materialgroupTxt
                                requestMap.get(value.index).plant_txt = value.plantTxt
                                requestMap.get(value.index).storagelocation_txt = value.storagelocationTxt
                            })
                            resolve(Array.from(requestMap.values()))
                        },
                        error: function (error) {
                            reject(error)
                        }
                    });
                })
            },
            checkExisted: function () {
                let thatController = this
                return new Promise((resolve, reject) => {
                    let logTrsfUrl = "https://" + window.location.hostname + "/sap/opu/odata/sap/ZSD_UI_UPLOAD_PO_O2";
                    let oFilter = new Filter("filename", "EQ", thatController.pFileName)
                    let oLogTrsfModel = new ODataModel(logTrsfUrl, { json: true });
                    oLogTrsfModel.read("/ZMM_I_UPLOAD_PO", {
                        filters: [oFilter],
                        success: function (oData, response) { //found
                            resolve(oData, response)
                        },
                        error: function (error) { //not found
                            reject(error)
                        }
                    })
                })
            },
            upperCase: function (string) {
                if (typeof string == 'string'){
                    return string.toUpperCase()
                } else {
                    return string
                }
            },
            containsOnlyNumbers: function(str) {
                if (str && str !== ''){
                    return /^[0-9]+$/.test(str)
                } else {
                    return true
                }
                
            },
            onUploadSetComplete: function (oEvent) {
                var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                var oFile = oFileUploader.getItems()[0].getFileObject();

                var reader = new FileReader();
                var thatController = this;
                thatController.pFileName = oFile.name


                //Lấy dữ liệu excel
                reader.onload = (e) => {
                    let xlsx_content = e.currentTarget.result;
                    let workbook = XLSX.read(xlsx_content, { type: 'binary' });
                    var excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets["Data"]);
                    let isValid = true
                    for (let index = 0; index < excelData.length; index++) {
                        excelData[index].soloncc = this.upperCase(excelData[index].soloncc)
                         /* check data */
                         if (!thatController.containsOnlyNumbers(excelData[index].deliverydate) ) {
                            MessageBox.error(`Lỗi định dạng ngày Delivery date: ${excelData[index].deliverydate} - ${excelData[index].ponumber_zeta}, vui lòng nhập yyyymmdd`)
                            this.pDialog.close();
                            this.dataUpload = []
                            isValid = false
                            break
                        }

                        if (!thatController.containsOnlyNumbers(excelData[index].ngaysanxuat) ) {
                            MessageBox.error(`Lỗi định dạng ngày sản xuất: ${excelData[index].ngaysanxuat} - ${excelData[index].ponumber_zeta}, vui lòng nhập yyyymmdd`)
                            this.pDialog.close();
                            this.dataUpload = []
                            isValid = false
                            break
                        }         
                        
                        if (!thatController.containsOnlyNumbers(excelData[index].hansudung) ) {
                            MessageBox.error(`Lỗi định dạng ngày hạn sử dụng: ${excelData[index].hansudung} - ${excelData[index].ponumber_zeta}, vui lòng nhập yyyymmdd`)
                            this.pDialog.close();
                            this.dataUpload = []
                            return
                        }   
                        
                        if (!thatController.containsOnlyNumbers(excelData[index].ngayhoadon) ) {
                            MessageBox.error(`Lỗi định dạng ngày hoá đơn: ${excelData[index].ngayhoadon} - ${excelData[index].ponumber_zeta}, vui lòng nhập yyyymmdd`)
                            this.pDialog.close();
                            this.dataUpload = []
                            isValid = false
                            break
                        }               

                        this.dataUpload.push(excelData[index])
                        
                    }
                    if (!isValid){
                        return
                    }
                    // excelData.forEach((value, index) => {
                    //     value.soloncc = this.upperCase(value.soloncc)
                    //     /* check data */
                    //     if (!thatController.containsOnlyNumbers(value.deliverydate) ) {
                    //         MessageBox.error(`Lỗi định dạng ngày Delivery date: ${value.deliverydate}, vui lòng nhập yyyymmdd`)
                    //         this.pDialog.close();
                    //         this.dataUpload = []
                    //         return
                    //     }

                    //     if (!thatController.containsOnlyNumbers(value.ngaysanxuat) ) {
                    //         MessageBox.error(`Lỗi định dạng ngày sản xuất: ${value.ngaysanxuat}, vui lòng nhập yyyymmdd`)
                    //         this.pDialog.close();
                    //         this.dataUpload = []
                    //     }         
                        
                    //     if (!thatController.containsOnlyNumbers(value.hansudung) ) {
                    //         MessageBox.error(`Lỗi định dạng ngày hạn sử dụng: ${value.hansudung}, vui lòng nhập yyyymmdd`)
                    //         this.pDialog.close();
                    //         this.dataUpload = []
                    //         return
                    //     }   
                        
                    //     if (!thatController.containsOnlyNumbers(value.ngayhoadon) ) {
                    //         MessageBox.error(`Lỗi định dạng ngày hoá đơn: ${value.ngayhoadon}, vui lòng nhập yyyymmdd`)
                    //         this.pDialog.close();
                    //         this.dataUpload = []
                    //         return
                    //     }               

                    //     this.dataUpload.push(value)
                    // })
                    this.pDialog.close();
                    let oBusyDialog = thatController.byId("idBusyDialog")
                    oBusyDialog.open()
                    let getDescription = this.getDescription(this.dataUpload)
                    getDescription
                        .then((data) => {
                            thatController.dataUpload = JSON.parse(JSON.stringify(data))
                            let checkExisted = thatController.checkExisted()
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
                                            oFilterPOZETA.push(new Filter("ponumber_zeta", "EQ", value.ponumber_zeta))
                                        })
                                        let checkExistPOZETA = new Promise((resolve, reject) => {
                                            let logTrsfUrl = "https://" + window.location.hostname + "/sap/opu/odata/sap/ZSD_UI_UPLOAD_PO_O2";
                                            let oLogTrsfModel = new ODataModel(logTrsfUrl, { json: true });
                                            oLogTrsfModel.read("/ZMM_I_UPLOAD_PO", {
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
                                                                MessageToast.show("Huỷ upload");
                                                            } else {
                                                                model.setProperty("/items", thatController.dataUpload, null, true)
                                                                MessageToast.show("Upload Successful");
                                                                thatController.getView().byId('idMainTable').selectAll()

                                                            }

                                                        }
                                                    });
                                                } else {
                                                    model.setProperty("/items", thatController.dataUpload, null, true)
                                                    MessageToast.show("Upload Successful");
                                                    thatController.getView().byId('idMainTable').selectAll()
                                                }
                                                thatController.pDialog.close();
                                                oBusyDialog.close()
                                            })
                                            .catch((error) => {
                                                thatController.dataUpload = []
                                                thatController.pDialog.close();
                                                oBusyDialog.close()
                                                MessageBox.error(`Error exists: ${error.message}`);

                                            })
                                    }

                                })
                                .catch((error) => {
                                    MessageBox.error(`Error exists: ${error.message}`);
                                    oBusyDialog.close()

                                })
                        })
                        .catch((error) => {
                            MessageBox.error(`Error exists: ${error}`);
                            oBusyDialog.close()
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
            checkRequiredData: function (str, messages, fieldname, ponumberZeta) {
                if (!str || str == '') {
                    messages.push({
                        type: 'Error',
                        title: `${fieldname} is required`,
                        group: `PO Number ZETA ${ponumberZeta}`
                    })
                }
            },
            checkRequiredNumber: function (num, messages, fieldname, ponumberZeta) {
                if (!num || num == 0) {
                    messages.push({
                        type: 'Error',
                        title: `${fieldname} is required`,
                        group: `PO Number ZETA ${ponumberZeta}`
                    })
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
                oBusyDialog.open()
                let thatController = this
                let oCallSingleAPI = []
                var listDoc = new Map()
                oSelectedData.forEach((value, index) => {
                    if (!listDoc.has(value.ponumber_zeta)) {
                        listDoc.set(value.ponumber_zeta, [value])
                    } else {
                        listDoc.get(value.ponumber_zeta).push(value)
                    }
                })
                let step = null
                if (this.getView().byId("chkGhiNhanHD").getSelected()) {
                    step = 2
                } else if (this.getView().byId("chkNhapKho").getSelected()) {
                    step = 2
                } else if (this.getView().byId("chkTaoDonHang").getSelected()) {
                    step = 1
                }
                let messageUICheck = []
                listDoc.forEach(function (value, ponumberZeta, map) {
                    let doc = null
                    let item_doc = []
                    value.forEach(function (item, index) {
                        thatController.checkRequiredData(item.material, messageUICheck, 'material', item.ponumber_zeta)
                        thatController.checkRequiredNumber(item.poquantity, messageUICheck, 'poquantity', item.ponumber_zeta)
                        thatController.checkRequiredData(item.orderunit, messageUICheck, 'orderunit', item.ponumber_zeta)
                        thatController.checkRequiredData(item.deliverydate, messageUICheck, 'deliverydate', item.ponumber_zeta)
                        if (item.freeofcharge == '' && item.freeofcharge) {
                            thatController.checkRequiredNumber(item.netprice, messageUICheck, 'netprice', item.ponumber_zeta)
                            thatController.checkRequiredNumber(item.per, messageUICheck, 'per', item.ponumber_zeta)
                            thatController.checkRequiredData(item.orderpriceuom, messageUICheck, 'orderpriceuom', item.ponumber_zeta)
                        }
                        // thatController.checkRequiredNumber(item.hansudung, messageUICheck, 'hansudung', item.ponumber_zeta)
                        // thatController.checkRequiredData(item.plant, messageUICheck, 'plant', item.ponumber_zeta )
                        thatController.checkRequiredData(item.storagelocation, messageUICheck, 'storagelocation', item.ponumber_zeta)
                        // thatController.checkRequiredData(item.batch, messageUICheck, 'batch', item.ponumber_zeta )
                        thatController.checkRequiredData(item.soloncc, messageUICheck, 'soloncc', item.ponumber_zeta)
                        item_doc.push({
                            // accountassigmentcate:  `${item.accountassigmentcate}` ,
                            // itemcate:  `${item.itemcate}` ,
                            material: thatController.checkNullData(item.material),
                            poquantity: thatController.checkNullNumber(item.poquantity),
                            orderunit: thatController.checkNullData(item.orderunit),
                            deliverydate: thatController.checkNullData(item.deliverydate),
                            netprice: thatController.checkNullData(item.netprice),
                            per: thatController.checkNullNumber(item.per),
                            orderpriceuom: thatController.checkNullNumber(item.orderpriceuom),
                            plant: thatController.checkNullData(item.plant),
                            storagelocation: thatController.checkNullData(item.storagelocation),
                            // batch:  thatController.checkNullData(item.batch) ,
                            soloncc: thatController.checkNullData(item.soloncc),
                            ngaysanxuat: thatController.checkNullData(item.ngaysanxuat),
                            hansudung: thatController.checkNullData(item.hansudung),
                            username: thatController.checkNullData(item.username),
                            // purchasinginforecord:  `${item.purchasinginforecord}` ,
                            freeofcharge: thatController.checkNullData(item.freeofcharge),
                            // outlineagreement:  `${item.outlineagreement}` ,
                            // contractitem:  `${item.contractitem}` ,
                            // costcenter:  `${item.costcenter}` ,
                            // glaccount:  `${item.glaccount}` ,
                            taxcode: thatController.checkNullData(item.taxcode),
                            reference: thatController.checkNullData(item.reference),
                            ngayhoadon: thatController.checkNullData(item.ngayhoadon),
                            paymentterm: thatController.checkNullData(item.paymentterm),
                            calculatetax: thatController.checkNullData(item.calculatetax),
                            taxamt: thatController.checkNullData(item.taxamt),
                            taxbaseamt: thatController.checkNullData(item.taxbaseamt),
                            thuenhapkhau: thatController.checkNullData(item.thuenhapkhau),
                            vatuythac: thatController.checkNullData(item.vatuythac),
                            exchangerate: thatController.checkNullData(item.exchangerate)
                        })
                    })
                    thatController.checkRequiredData(value[0].material, messageUICheck, 'material', value[0].ponumber_zeta)
                    thatController.checkRequiredData(value[0].companycode, messageUICheck, 'companycode', value[0].ponumber_zeta)
                    thatController.checkRequiredData(value[0].purchasingorg, messageUICheck, 'purchasingorg', value[0].ponumber_zeta)
                    thatController.checkRequiredData(value[0].purchasinggroup, messageUICheck, 'purchasinggroup', value[0].ponumber_zeta)
                    thatController.checkRequiredData(value[0].potype, messageUICheck, 'potype', value[0].ponumber_zeta)
                    thatController.checkRequiredData(value[0].supplier, messageUICheck, 'supplier', value[0].ponumber_zeta)
                    doc = {
                        ponumberZeta: value[0].ponumber_zeta,
                        companycode: value[0].companycode,
                        purchasingorg: value[0].purchasingorg,
                        purchasinggroup: value[0].purchasinggroup,
                        potype: value[0].potype,
                        supplier: value[0].supplier,
                        documentcurrency: value[0].documentcurrency,
                        // vatuythac: value[0].vatuythac,
                        toItem: item_doc
                    }
                    let request = {
                        steps: step,
                        filename: thatController.pFileName,
                        doc: doc
                    }
                    if (!messageUICheck || messageUICheck.length == 0) {
                        oCallSingleAPI.push(thatController.callSingleRequest(request, 'ZMM_API_UPLOAD_PO'))
                    } else {
                        oCallSingleAPI = []
                        return
                    }
                });

                //get Message view
                if (messageUICheck && messageUICheck.length !== 0) {
                    let messageUiCheckJSON = JSON.parse(JSON.stringify(messageUICheck))
                    var oMsgUiCheckModel = new JSONModel();
                    oMsgUiCheckModel.setData(messageUiCheckJSON)

                    thatController.oCallApiMsgView.setModel(oMsgUiCheckModel)
                    thatController.oCallApiMsgView.navigateBack();
                    thatController.oCallApiMsgViewDialog.open();
                    oBusyDialog.close();
                } else {
                    Promise.all(oCallSingleAPI)
                        .then((resultPOandPGR) => {
                            let requestInvList = []
                            let callApiPOforMiro = null
                            let callApiBatch = null
                            let requestInv = {
                                filename: thatController.pFileName
                            }

                            //BATCH
                            callApiBatch = thatController.callSingleRequest(requestInv, 'ZMM_API_UPLOAD_POBATCH')
                            callApiBatch.
                            then((batchResponse) => {
                                // requestInvList.push(batchResponse)
                            }).
                            catch((error)=>{
                                MessageBox.error(JSON.stringify(error));
                            })
                            // INVOICE
                            if (thatController.getView().byId("chkGhiNhanHD").getSelected()) {
                                callApiPOforMiro = thatController.callSingleRequest(requestInv, 'ZMM_API_UPLOAD_POINV')
                            } else {
                                callApiPOforMiro = new Promise((resolve, reject) => {
                                    resolve()
                                })
                            }
                            callApiPOforMiro
                                .then((response) => {
                                    return ({
                                        poPGR: resultPOandPGR,
                                        invoices: response
                                    })
                                })
                                .then((returnMessage) => {
                                    //get message
                                    let message = []
                                    returnMessage.poPGR.forEach(response => {
                                        response.results.forEach(function (value, index) {
                                            message.push({
                                                type: value.type,
                                                title: value.message,
                                                group: `PO Number ZETA ${value.ponumberZeta}`
                                            })
                                        })
                                    })
                                    if (thatController.getView().byId("chkGhiNhanHD").getSelected()) {
                                        returnMessage.invoices.results.forEach(value => {
                                            message.push({
                                                type: value.type,
                                                title: value.message,
                                                group: `Invoice ${value.reference}`
                                            })
                                        })
                                    }

                                    //get Message view
                                    let messageJSON = JSON.parse(JSON.stringify(message))
                                    var oMsgModel = new JSONModel();
                                    oMsgModel.setData(messageJSON)

                                    thatController.oCallApiMsgView.setModel(oMsgModel)
                                    thatController.oCallApiMsgView.navigateBack();
                                    thatController.oCallApiMsgViewDialog.open();

                                    //get initialize data
                                    thatController.dataUpload = []
                                    var model = thatController.getView().getModel()
                                    model.setProperty("/items", thatController.dataUpload, null, true)
                                    oBusyDialog.close();
                                })
                                .catch((error) => {
                                    MessageBox.error(JSON.stringify(error));
                                    oBusyDialog.close();
                                    var model = thatController.getView().getModel()
                                    model.setProperty("/items", thatController.dataUpload, null, true)
                                    oBusyDialog.close();
                                })
                        })
                        .catch((error) => {
                            MessageBox.error(JSON.stringify(error));
                            oBusyDialog.close();
                            thatController.dataUpload = []
                            var model = thatController.getView().getModel()
                            model.setProperty("/items", thatController.dataUpload, null, true)
                            oBusyDialog.close();
                        })
                }
            },
            callSingleRequest: function (request, url) {
                return new Promise((resolve, reject) => {
                    let postFIUrl = `https://${window.location.hostname}/sap/bc/http/sap/${url}`
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
            onchkTaoDonHangChanged: function (oEvent) {
                var bChecked = oEvent.getParameter("selected");
                if (!bChecked) {
                    if (this.getView().byId("chkNhapKho").getSelected() || this.getView().byId("chkGhiNhanHD").getSelected()) {
                        this.getView().byId("chkTaoDonHang").setSelected(true);
                    }
                }
            },
            onchkNhapKhoChanged: function (oEvent) {
                var bChecked = oEvent.getParameter("selected");
                if (!bChecked) {
                    if (this.getView().byId("chkGhiNhanHD").getSelected()) {
                        this.getView().byId("chkNhapKho").setSelected(true);
                    }
                } else {
                    this.getView().byId("chkTaoDonHang").setSelected(true);
                }
            },
            onchkGhiNhanHDChanged: function (oEvent) {
                var bChecked = oEvent.getParameter("selected");
                if (bChecked) {
                    this.getView().byId("chkNhapKho").setSelected(true);
                    this.getView().byId("chkTaoDonHang").setSelected(true);
                }
            },
            downloadTemplate: function (oEvent) {
                var excelColumnList = [
                    {
                        companycode: '',
                        purchasingorg: '',
                        purchasinggroup: '',
                        potype: '',
                        ponumber_zeta: '',
                        supplier: '',
                        // accountassigmentcate: '',
                        // itemcate: '',
                        material: '',
                        poquantity: '',
                        orderunit: '',
                        deliverydate: '',
                        netprice: '',
                        per: '',
                        documentcurrency: '',
                        orderpriceuom: '',
                        plant: '',
                        storagelocation: '',
                        // batch: '',
                        soloncc: '',
                        ngaysanxuat: '',
                        hansudung: '',
                        username: '',
                        // purchasinginforecord: '',
                        freeofcharge: '',
                        // outlineagreement: '',
                        // contractitem: '',
                        // costcenter: '',
                        // glaccount: '',
                        reference: '',
                        taxcode: '',
                        ngayhoadon: '',
                        paymentterm: '',
                        calculatetax: '',
                        taxamt: '',
                        taxbaseamt: '',
                        thuenhapkhau: '',
                        vatuythac: '',
                        exchangerate: ''
                    }

                ]
                const xlsxData = XLSX.utils.json_to_sheet(excelColumnList)
                const spreadsheet = XLSX.utils.book_new()
                var header_styles = {
                    fill: {
                        fgColor: {
                            rgb: "4E8DC9"
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
                spreadsheet.Sheets['Data'].N1.s = header_styles
                spreadsheet.Sheets['Data'].O1.s = header_styles
                spreadsheet.Sheets['Data'].P1.s = header_styles
                spreadsheet.Sheets['Data'].Q1.s = header_styles
                spreadsheet.Sheets['Data'].R1.s = header_styles
                spreadsheet.Sheets['Data'].S1.s = header_styles
                spreadsheet.Sheets['Data'].T1.s = header_styles
                spreadsheet.Sheets['Data'].U1.s = header_styles
                spreadsheet.Sheets['Data'].V1.s = header_styles
                spreadsheet.Sheets['Data'].W1.s = header_styles
                spreadsheet.Sheets['Data'].X1.s = header_styles
                spreadsheet.Sheets['Data'].Y1.s = header_styles
                spreadsheet.Sheets['Data'].Z1.s = header_styles
                spreadsheet.Sheets['Data'].AA1.s = header_styles
                spreadsheet.Sheets['Data'].AB1.s = header_styles
                spreadsheet.Sheets['Data'].AC1.s = header_styles
                spreadsheet.Sheets['Data'].AD1.s = header_styles
                XLSX.writeFile(spreadsheet, 'Upload_PO_template.xlsx')
                MessageToast.show("Template File Downloading...")
            },
            extractData: function (oRowContext, oColumn) {
                const oValue = oRowContext.getProperty(oColumn.getName());
                return oColumn.__type ? oColumn.__type.formatValue(oValue, "string") : oValue;
            },
            onCopy: function (oEvent) {
                MessageToast.show("Selection copied to clipboard");
            },
        });
    });

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/odata/v2/ODataModel',
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    'sap/m/Button',
    'sap/m/Dialog',
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, ODataModel, MessageBox, Fragment, Button, Dialog, JSONModel,MessageToast) {
        "use strict";

        return Controller.extend("zttu.controller.Main", {
            busyDialog: null,
            reviewDialog: null,
            postData: {},
            amount:0,
            daChi:0,
            sumSoTienHD:0,
            sumSoTien:0,
            flag:false,
            onInit: function () {
                // let url = `https://${window.location.host}/sap/opu/odata/sap/ZFI_UI_TTTU_O2/`
                // let model = new ODataModel(url)
                // this.getView().setModel(model)

                //Initialize busy dialog
                Fragment.load({
                    id: "busyFragment",
                    name: "zttu.controller.fragment.Busy",
                    type: "XML",
                    controller: this
                })
                    .then((oDialog) => {
                        this.busyDialog = oDialog;
                    })
                    .catch(error => {
                        MessageBox.error('Vui lòng tải lại trang')
                    });

                //Initialize review dialog
                Fragment.load({
                    id: "reviewDataFragment",
                    name: "zttu.controller.fragment.ReviewDialog",
                    type: "XML",
                    controller: this
                })
                    .then((oDialog) => {
                        this.reviewDialog = oDialog;
                    })
                    .catch(error => {
                        MessageBox.error('Vui lòng tải lại trang')
                    });

                //Hide adapt filter
                var btnFilters = this.getView().byId("smartFilterBar-btnFilters");
                btnFilters.setVisible(false);
            },
            onBeforeRebindChungTuChi: function (oEvent) {
                var oSmartTable = oEvent.getSource();
                var oSmartFilterBar = this.getView().byId('smartFilterBar');
                var path = oSmartFilterBar.getParameterBindingPath();
                let newPath = path.replace("ZFI_I_TTTU", 'ZFI_I_TTTU_CTC')
                oSmartTable.setTableBindingPath(newPath);
            },
            onBeforeRebindHoaDon: function (oEvent) {
                var oSmartTable = oEvent.getSource();
                var oSmartFilterBar = this.getView().byId('smartFilterBar');
                var path = oSmartFilterBar.getParameterBindingPath();
                let newPath = path.replace("ZFI_I_TTTU", 'ZFI_I_TTTU_HD')
                oSmartTable.setTableBindingPath(newPath);
            },
            onChange: function(oEvent){
                this.flag =true
                var arrValue = []
                var oButton = oEvent.getSource();
                var oBindingContext = oButton.getBindingContext('ReviewData');
                var oBindingObject = oBindingContext.getObject();
                this.amount = 0
                console.log('Dataposst',this.postData)
                //this.postData.sotien = this.daChi + Number(this.postData.sotien)
                this.postData.sumSoTienDaChi = this.daChi + Number(this.postData.sotien)
                //this.postData.sotientamung = Number(this.postData.sumSoTienDaChi) + Number(this.postData.SoTienChuaChiHet)
                if (this.postData.sotientamung - this.postData.sumSoTienDaChi > 0 ){
                    //Số tạm ứng chi không hết Chỉ tiêu (13) – chỉ tiêu (18) nếu số dương thì điền ở field này
                    this.postData.soTamUngChiKhongHet = this.postData.sotientamung - this.postData.sumSoTienDaChi
                    this.postData.soChiQuaSoTamUng =  0

                } else if  (this.postData.sotientamung - this.postData.sumSoTienDaChi < 0 ) {
                    //Sô chi quá số tạm ứng: Chỉ tiêu (13) – chỉ tiêu (18) nếu số âm thì điền ở field này
                    this.postData.soChiQuaSoTamUng = this.postData.sumSoTienDaChi - this.postData.sotientamung
                    this.postData.soTamUngChiKhongHet = 0
                }else{
                    this.postData.soChiQuaSoTamUng = 0
                    this.postData.soTamUngChiKhongHet = 0
                }
                console.log('this.postData',this.postData)
                let oModel = new JSONModel(this.postData);
                console.log('DataposstModel',oModel)
                this.reviewDialog.setModel(oModel, "ReviewData")
                oBindingObject.sotien =  this.postData.sotien
                console.log('Data change:',oBindingObject)
                
                //this.reviewDialog.setModel(oModel, "ReviewData")
                return oBindingContext.sotien
            },
            onReviewThanhToanTamUng: function (oEvent) {
                this.busyDialog.open()
                let thatController = this
                let readListModel = []
                let selContextChungTuChi = this.byId('chungTuChiTable').getSelectedContexts();
                readListModel.push(this.readModel(
                    this.getView(),
                    'INFO',
                    this.getView().byId('smartFilterBar').getParameterBindingPath())
                )
                if (selContextChungTuChi.length == 0) {
                    thatController.busyDialog.close()
                    MessageBox.error('Chọn ít nhất 1 chứng từ chi')
                    return
                } else {
                    selContextChungTuChi.forEach((context) => {
                        readListModel.push(this.readModel(context, 'CTC'))
                    })
                }
                let selContextHoaDon = this.byId('hoaDonTable').getSelectedContexts();
                if (selContextHoaDon.length == 0) {
                    thatController.busyDialog.close()
                    MessageBox.error('Chọn ít nhất 1 hoá đơn')
                    return
                } else {
                    selContextHoaDon.forEach((context) => {
                        readListModel.push(this.readModel(context, 'HD'))
                    })
                }
                Promise
                    .all(readListModel)
                    .then((listData) => {
                        thatController.postData.chungtuchi = []
                        thatController.postData.hoadon = []
                        let sumSoTienTamUng =  0
                        let sumSoTienDaChi =  0
                        
                        listData.forEach((value) => {
                            console.log("Values",value)
                            if (value.objectType == 'INFO') {
                                if (value.data.results) {
                                    thatController.postData.CompanyNameUi = value.data.results[0].Name
                                    thatController.postData.companycode = value.data.results[0].CompanyCode
                                    thatController.postData.CompanyAddressUi = value.data.results[0].Address
                                    thatController.postData.AllPhoneNumberUi = value.data.results[0].AllPhoneNumber
                                    thatController.postData.EmailAddressUi = value.data.results[0].EmailAddress
                                    thatController.postData.WebsiteUi = value.data.results[0].Website
                                    thatController.postData.AllFaxNumberUi = value.data.results[0].AllFaxNumber
                                    thatController.postData.SoTienChuaChiHet = Math.abs(value.data.results[0].SoTienChuaChiHet)
                                    thatController.postData.sotienno = value.data.results[0].SoTienNo
                                    thatController.postData.sotienco = value.data.results[0].SoTienCo
                                    thatController.postData.TransactionCurrency = value.data.results[0].TransactionCurrency
                                    thatController.postData.account = value.data.results[0].Account,
                                    thatController.postData.ngaylapdenghi = value.data.results[0].P_AtKeyDate
                                    thatController.postData.nguoithanhtoan = ''
                                    thatController.postData.donvicongtac = ''
                                }
                            }
                            
                            if (value.objectType == 'CTC') {
                                thatController.postData.chungtuchi.push({
                                    accountingdocument: value.data.AccountingDocument,
                                    postingdate_ui: `${String(value.data.PostingDate.getDate()).padStart(2, '0')}/${value.data.PostingDate.getMonth() + 1}/${value.data.PostingDate.getFullYear()}`,
                                    postingdate: value.data.PostingDate,
                                    sotien: value.data.soTienDeNghi, //AmountInTransactionCurrency,
                                    transactioncurrency: value.data.TransactionCurrency,
                                    accountingdocumentyear: value.data.FiscalYear,
                                    accountingcompanycode: value.data.CompanyCode,
                                    accountingdocumentitem: value.data.AccountingDocumentItem
                                })
                                sumSoTienTamUng += Number.parseInt(value.data.soTienDeNghi)
                            }

                            
                            if (value.objectType == 'HD') {
                                thatController.postData.hoadon.push({
                                    accountingdocument: value.data.AccountingDocument,
                                    postingdate_ui: `${String(value.data.PostingDate.getDate()).padStart(2, '0')}/${value.data.PostingDate.getMonth() + 1}/${value.data.PostingDate.getFullYear()}`,
                                    postingdate: value.data.PostingDate,
                                    sotien:value.data.soTienDeNghi, //thatController.postData.sotientamung-thatController.postData.sumSoTienDaChi, //Math.abs(value.data.Tien),
                                    transactioncurrency: value.data.TransactionCurrency,
                                    accountingdocumentyear: value.data.FiscalYear,
                                    accountingcompanycode: value.data.CompanyCode,
                                    accountingdocumentitem: value.data.AccountingDocumentItem
                                })
                                sumSoTienDaChi += Number.parseInt(value.data.Tien)
                                thatController.amount += Number.parseInt(value.data.Tien)
                                thatController.sumSoTienHD += Number.parseInt(value.data.AmountInTransactionCurrency)
                                thatController.sumSoTien +=Number.parseInt(value.data.soTienDeNghi)
                            }
                        })
                        thatController.postData.sotien = thatController.sumSoTien
                        thatController.postData.chungtuchiLength = thatController.postData.chungtuchi.length
                        thatController.postData.hoadonLength = thatController.postData.hoadon.length
                        if(!thatController.postData.SoTienChuaChiHet){
                            thatController.postData.SoTienChuaChiHet
                        }
                        else{
                            thatController.postData.SoTienChuaChiHet -= Number(sumSoTienTamUng)
                        }
                        
                        //Chỉ tiêu 13:  Chỉ tiêu (14) + chỉ tiêu (17) (17: số tiền chứng từ chi)
                        thatController.postData.sotientamung = Number(sumSoTienTamUng) + Number(thatController.postData.SoTienChuaChiHet) 
                        
                        //Chỉ tiêu 18: Sum số tiền chứng từ chi
                        thatController.postData.sumSoTienDaChi = sumSoTienDaChi//thatController.onChange() ? thatController.onChange(): 
                        
                        thatController.daChi = thatController.postData.sumSoTienDaChi 
                        if (thatController.sumSoTienHD - thatController.postData.sumSoTienDaChi > 0 ){
                            //Số tạm ứng chi không hết Chỉ tiêu (13) – chỉ tiêu (18) nếu số dương thì điền ở field này
                            thatController.postData.soTamUngChiKhongHet = thatController.sumSoTienHD - thatController.postData.sumSoTienDaChi
                            thatController.postData.soChiQuaSoTamUng =  0
                            //thatController.postData.hoadon.edit = true

                        } else if  (thatController.sumSoTienHD - thatController.postData.sumSoTienDaChi < 0 ) {
                            //Sô chi quá số tạm ứng: Chỉ tiêu (13) – chỉ tiêu (18) nếu số âm thì điền ở field này
                            thatController.postData.soChiQuaSoTamUng = thatController.postData.sumSoTienDaChi - thatController.sumSoTienHD
                            thatController.postData.soTamUngChiKhongHet = 0
                        }else{
                            thatController.postData.soChiQuaSoTamUng = 0
                            thatController.postData.soTamUngChiKhongHet = 0
                        }
                         // - thatController.postData.sumSoTienDaChi //thatController.postData.sotientamung-thatController.postData.sumSoTienDaChi
                        console.log('DataLog:',thatController.postData)
                        let oModel = new JSONModel(thatController.postData);

                        thatController.reviewDialog.setModel(oModel, "ReviewData")
                        thatController.reviewDialog.open()
                        thatController.busyDialog.close()
                    })

            },
            readModel: function (context, objectType, path) {
                let oModel = context.getModel()
                let inputPath = ''
                if (path) {
                    inputPath = `${path}`
                } else {
                    inputPath = `${context.getPath()}`
                }
                return new Promise((resolve, reject) => {
                    oModel.read(inputPath, {
                        success: function (oData, oResponse) {
                            resolve({ data: oData, objectType: objectType })
                        },
                        error: function (error) {
                            reject(error)
                        }
                    })
                })
            },
            formatDataForPosting: function(data){
                let items =  []
                data.chungtuchi.forEach((value)=>{
                    items.push({
                        type : 'B',
                        accountingdocument: value.accountingdocument,
                        accountingdocumentyear: value.accountingdocumentyear,
                        accountingcompanycode: value.accountingcompanycode,
                        postingdate : value.postingdate,
                        sotien: value.sotien,
                        transactioncurrency: value.transactioncurrency,
                        accountingdocumentitem: value.accountingdocumentitem
                    }) 
                })
                data.hoadon.forEach((value)=>{
                    items.push({
                        type : 'A',
                        accountingdocument: value.accountingdocument,
                        accountingdocumentyear: value.accountingdocumentyear,
                        accountingcompanycode: value.accountingcompanycode,
                        postingdate : value.postingdate,
                        sotien: value.sotien,
                        transactioncurrency: value.transactioncurrency,
                        accountingdocumentitem: value.accountingdocumentitem
                    }) 
                })
                let request = {
                    companycode : data.companycode,
                    ctdenghi : 'C',
                    account: data.account,
                    donvicongtac: data.donvicongtac,
                    nguoithanhtoan: data.nguoithanhtoan,
                    currency: data.currency,
                    sotientamungkytruoc: data.SoTienChuaChiHet,
                    sotientamung: data.sotientamung,
                    sumsotiendachi : items[1].sotien,
                    sotienno : data.sotienno,
                    sotienco : data.sotienco,
                    items: items

                }
                return request
            },
            onPostThanhToanTamUng: function (oEvent) {
                //THANHTOANHOANUNG
                var checkSoTienDaChi = 0
                this.busyDialog.open();
                if(!this.flag){
                    this.postData.sumSoTienDaChi +=this.sumSoTien
                    if (this.postData.sotientamung - this.postData.sumSoTienDaChi > 0 ){
                        //Số tạm ứng chi không hết Chỉ tiêu (13) – chỉ tiêu (18) nếu số dương thì điền ở field này
                        this.postData.soTamUngChiKhongHet = this.postData.sotientamung - this.postData.sumSoTienDaChi
                        this.postData.soChiQuaSoTamUng =  0
                        //thatController.postData.hoadon.edit = true

                    } else if  (this.postData.sotientamung - this.postData.sumSoTienDaChi < 0 ) {
                        //Sô chi quá số tạm ứng: Chỉ tiêu (13) – chỉ tiêu (18) nếu số âm thì điền ở field này
                        this.postData.soChiQuaSoTamUng = this.postData.sumSoTienDaChi - this.postData.sotientamung
                        this.postData.soTamUngChiKhongHet = 0
                    }else{
                        this.postData.soChiQuaSoTamUng = 0
                        this.postData.soTamUngChiKhongHet = 0
                    }
                }else{
                    checkSoTienDaChi = (this.amount + this.postData.sumSoTienDaChi)
                }
                if( this.sumSoTienHD  < this.postData.sumSoTienDaChi ||this.sumSoTienHD  < checkSoTienDaChi ){
                    MessageToast.show('Số chi đã vượt quá số đề nghị.')
                    this.busyDialog.close();
                    return
                }
                let thatController = this
                let request = thatController.formatDataForPosting(thatController.postData)
                console.log('Data Post:',request)
                console.log('Data:',thatController.postData)
                var url = "https://" + window.location.hostname + "/sap/bc/http/sap/ZFI_API_TTTAMUNG?=";
                $.ajax({
                    url: url,
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(request),
                    success: function (responseString, textStatus, jqXHR) {
                        let response = JSON.parse(responseString)
                        if (response.status == 'F') {
                            thatController.busyDialog.close();
                            MessageBox.error(response.message)
                        } else if (response.status = 'S') {
                            console.log("DataPost:",thatController.postData)
                            thatController.postData.soDeNghi = response.zdenghi
                            let xmlData = thatController.getXMLData(thatController.postData)
                            console.log("XML:",xmlData)
                            let dataEncode = window.btoa(unescape(encodeURIComponent(xmlData)))
                            var urlAdobe = "https://" + window.location.hostname + "/sap/bc/http/sap/z_api_adobe?="
                            var raw = JSON.stringify({
                                "id": `${response.zdenghi}`,
                                "xdpTemplate": "THANHTOANHOANUNG/THANHTOANHOANUNG",
                                "zxmlData": dataEncode,
                                "formType": "print",
                                "formLocale": "en_US",
                                "taggedPdf": 1,
                                "embedFont": 0,
                                "changeNotAllowed": false,
                                "printNotAllowed": false
                            })
                            $.ajax({
                                url: urlAdobe,
                                type: 'POST',
                                contentType: "application/json",
                                data : raw,
                                success: function(response, textStatus, jqXHR){
                                    let json = JSON.parse(response)
                                    console.log("Data: " ,json);
                                    console.log('FileContent: ',  json.fileContent)
                                    var decodePDFContent = atob(json.fileContent) // base64 to string ?? to PDF
                                    var byteArray = new Uint8Array(decodePDFContent.length);
                                    for (var i = 0; i < decodePDFContent.length; i++ ){
                                        byteArray[i] = decodePDFContent.charCodeAt(i);
                                    }
                                    var blob = new Blob([byteArray.buffer], {
                                        type: 'application/pdf'
                                    });
                                    var _pdfurl = URL.createObjectURL(blob);
                                        this._PDFViewer = new  sap.m.PDFViewer({
                                            width: 'auto',
                                            source: _pdfurl
                                        });
                                        jQuery.sap.addUrlWhitelist("blob");
                                   // }
                                    this._PDFViewer.downloadPDF()
                                    thatController.busyDialog.close()
                                    
                                },
                                error: function (data) {
                                    console.log('Message Error: ' + JSON.stringify(json));
                                }
                            })
                        }
                    },
                    error: function (error) {
                        thatController.busyDialog.close();
                        MessageBox.error(`Đã có lỗi xảy ra. ${error.message}`)
                        console.log('message Error' + JSON.stringify(data));
                    }
                });
            },
            getXMLData: function (data) {
                const VND = new Intl.NumberFormat('en-DE');
                let listItemPhieuChi = ''
                data.chungtuchi.forEach((value) => {
                    listItemPhieuChi = listItemPhieuChi + `<Data>
                                                <DienGiai>- Phiếu chi số ${value.accountingdocument} ngày ${value.postingdate_ui}</DienGiai>
                                                <SoTien>${VND.format(value.sotien)}</SoTien>
                                            </Data>`
                })
                let listItemHoaDon = ''
                data.hoadon.forEach((value) => {
                    listItemHoaDon = listItemHoaDon + `<Data>
                                                <DienGiai>- Chứng từ số ${value.accountingdocument} ngày ${value.postingdate_ui}</DienGiai>
                                                <SoTien>${VND.format(value.sotien)}</SoTien>
                                            </Data>`
                })
                let xmlData =
                    `<?xml version="1.0" encoding="UTF-8"?>
                    <form1>
                    <SubPage>
                        <MAIN>
                            <Heading>
                                <companyCodeName>${data.CompanyNameUi}</companyCodeName>
                                <companyCodeAdress>Trụ sở:${data.CompanyAddressUi}</companyCodeAdress>
                                <Tel_Fax>
                                <companyCodePhone>Tel: ${data.AllPhoneNumberUi}</companyCodePhone>
                                <companyCodeFax>Fax: ${data.AllFaxNumberUi}</companyCodeFax>
                                </Tel_Fax>
                                <Email_Web>
                                <companyCodeEmail>Email: ${data.EmailAddressUi}  </companyCodeEmail>
                                <companyCodeWeb>Website: ${data.WebsiteUi}</companyCodeWeb>
                                </Email_Web>
                            </Heading>
                        </MAIN>
                        <title>GIẤY THANH TOÁN TIỀN TẠM ỨNG</title>
                        <Date>Ngày ${String(data.ngaylapdenghi.getDate()).padStart(2, '0')} tháng ${data.ngaylapdenghi.getMonth() + 1} năm ${data.ngaylapdenghi.getFullYear()}</Date>
                        <Account>
                            <So>${data.soDeNghi}</So>
                            <No>${VND.format(Math.abs(data.sotienno))}</No>
                            <Co>${VND.format(Math.abs(data.sotienco))}</Co>
                        </Account>
                        <HeaderInfo>
                            <NguoiThanhToan>${data.nguoithanhtoan}</NguoiThanhToan>
                            <BoPhan>${data.donvicongtac}</BoPhan>
                        </HeaderInfo>
                        <Data>
                            <Part1>
                                <HeaderRow/><subHeaderRow/>
                                <rowSoTienTamUng>
                                    <sotientamung>${VND.format(data.sotientamung)}</sotientamung>
                                </rowSoTienTamUng>
                                <rowSoTienTamUngChuaChiHet>
                                    <SoTienChuaChiHet>${VND.format(data.SoTienChuaChiHet)}</SoTienChuaChiHet>
                                </rowSoTienTamUngChuaChiHet>
                                <rowSoTamUngKyNay></rowSoTamUngKyNay>
                            </Part1>                        
                            <PhieuChi>
                                ${listItemPhieuChi}
                            </PhieuChi>
                            <Part2>
                                <rowSoTienDaChi>
                                    <sumSoTienDaChi>${VND.format(data.sumSoTienDaChi)}</sumSoTienDaChi>
                                </rowSoTienDaChi>
                            </Part2>
                            <HoaDon>
                                ${listItemHoaDon}
                            </HoaDon>
                            <Part3>
                                <rowSoTamUngChiKhongHet>
                                    <soTamUngChiKhongHet>${VND.format(data.soTamUngChiKhongHet)}</soTamUngChiKhongHet>
                                </rowSoTamUngChiKhongHet>
                                <rowChiQuaSoTamUng>
                                <soChiQuaSoTamUng>${VND.format(data.soChiQuaSoTamUng)}</soChiQuaSoTamUng>
                                </rowChiQuaSoTamUng>
                            </Part3>
                        </Data>
                    </SubPage>
                    <Sign/>
                    </form1>`
                    return xmlData
            },
            onCloseReviewDialog: function (oEvent) {
                this.reviewDialog.close()
                this.busyDialog.close()
                this.sumSoTienHD = 0
            }
        });
    });

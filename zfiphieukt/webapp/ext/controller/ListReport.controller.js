sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/core/Fragment", "sap/ui/model/json/JSONModel"
], function (Controller, Fragment, JSONModel) {
    return { 
            busyDialog: null,
            noiDung: null,
            dataHeader: null,
            reviewDialog: null,
            detail: null,
            finalXmL: null,
            noiDung:[],
            arrayND:[],
            chuki: null,
            onInit: function(oEvent) {
                Fragment.load({
                    id: "busyFragmentZFIPhieuKT",
                    name: "zfiphieukt.ext.fragment.Busy",
                    type: "XML",
                    controller: this
                }).then((oDialog) => {
                    this.busyDialog = oDialog
                    console.log(oDialog)
                }).catch(error => {
                    MessageBox.error('Vui lòng tải lại trang')
                });

                Fragment.load({
                    id: "reviewFragment",
                    name: "zfiphieukt.ext.fragment.Review",
                    type: "XML",
                    controller: this
                }).then((oDialog) => {
                    this.reviewDialog = oDialog
                    console.log(oDialog)
                }).catch(error => {
                    MessageBox.error('Vui lòng tải lại trang')
                });
            },
            onInitSmartFilterBarExtension: function(oSource) {
                console.log('onInitSmartFilterBarExtension')
                var filterObject = this.getView().byId("listReportFilter")
                console.log(filterObject)
                 let defaultValue = {
                 "FiscalYear": new Date().getFullYear().toString()
                }
                 filterObject.setFilterData(defaultValue)
            },  
            onCloseDialog: function(oEvent) {
                this.reviewDialog.close()
            },
        onActionPrint: function (oEvent) {
            let thatController = this
            this.busyDialog.open()
            // Lay du lieu dong da chon
            let data = this.extensionAPI.getSelectedContexts();
            // console.log(data.length);
            this.dataHeader = data;
            console.log(data)
            data.forEach(element => { // lay model tu data da chon
                let oModel = element.getModel()
                // doc du lieu tu path
                oModel.read(`${
                    element.getPath()
                }`, {
                    success: function (value, response) {
                        console.log(value)
                        thatController.arrayND = value
                        thatController.chuki = value.NL
                        console.log(thatController.chuki)
                          
                        const date = new Date();
                        
                        var listItem = '';
                        var xml = '';
                        var tn;
                        var tc;
                        var tongNo = 0;
                        var tongCo = 0;
                        var tongno;
                        var tongco;
                        var cur;
                        var dataWord;
                        var makh = '';
                        var tenkh = '';
                        var noidung = '';
                        const VND = new Intl.NumberFormat('en-DE');
                        oModel.read(`${
                            element.getPath()
                        }/to_Item`, {
                            success: function (item, hres) {
                            console.log(thatController.arrayND)
                            var result = []
                            //thatController.arrayND.results.forEach(e => {
                                //var obj = {}
                                //obj.AccountingDocument = e.AccountingDocument
                                //obj.AccountingDocumentItem = e.AccountingDocumentItem
                                //obj.ma_kh = e.ma_kh
                                //obj.ten_kh = e.ten_kh
                                //obj.tai_khoan = e.tai_khoan
                                //obj.noi_dung = e.noi_dung
                                //result.push(obj)
                            //})
                            
                            var obj = {}
                            obj.AccountingDocument = thatController.arrayND.AccountingDocument
                            obj.noi_dung = thatController.arrayND.noi_dung
                            obj.nguoi_lap = thatController.chuki
                            result.push(obj)

                            thatController.noiDung.results = result

                            console.log("result:", result)
                            let model = new JSONModel(thatController.noiDung)
                            console.log("model:", model)
                            thatController.reviewDialog.setModel(model, "NoiDung")
                            thatController.reviewDialog.open()
                            thatController.busyDialog.close()
                            }
                        }) // Item
                    }
                }) // read patch
            }) // for each
            //this.busyDialog.close()
        },
        Print: function(oEvent) {
            let thatController = this
            thatController.busyDialog.open()
            let data = this.extensionAPI.getSelectedContexts();
            // console.log(data.length);
            this.dataHeader = data;
            data.forEach(element => { // lay model tu data da chon
                let oModel = element.getModel()
                // doc du lieu tu path
                oModel.read(`${
                    element.getPath()
                }`, {
                    success: function (value, response) {
                        console.log(element.getPath())

                        //Format định dạng ngày 2 số cho ngày và tháng nhỏ hơn 10 cho ngày chứng từ và ngày hạch toán
                        var documentDate = value.ngay_chung_tu.getDate() < 10 ? '0' + value.ngay_chung_tu.getDate(): value.ngay_chung_tu.getDate()
                        var documentMonth = value.ngay_chung_tu.getMonth() < 10 ? '0' + (value.ngay_chung_tu.getMonth() + 1): (value.ngay_chung_tu.getMonth() + 1)

                        var postingDate = value.ngay_hach_toan.getDate() < 10 ? '0' + value.ngay_hach_toan.getDate(): value.ngay_hach_toan.getDate()
                        var postingMonth = value.ngay_hach_toan.getMonth() < 10 ? '0' + (value.ngay_hach_toan.getMonth() + 1): (value.ngay_hach_toan.getMonth() + 1)

                        console.log("ngày chứng từ: " , documentDate + "/" + documentMonth)
                        console.log("ngày hạch toán: " , postingDate + "/" + postingMonth)



                         console.log(thatController.noiDung.results)
                         var newND =  '';
                         var nguoiLap = '';
                         thatController.noiDung.results.forEach(e=> {
                            newND = e.noi_dung
                            nguoiLap = e.nguoi_lap
                         })
                         console.log("Người lập: ", nguoiLap)
                         console.log("New noi dung: ",newND)
                        var listItem = '';
                        var xml = '';
                        var tn;
                        var tc;
                        var tongNo = 0;
                        var tongCo = 0;
                        var tongno;
                        var tongco;
                        var cur;
                        var dataWord;
                        var makh = '';
                        var tenkh = '';
                        var noidung = '';
                        const VND = new Intl.NumberFormat('en-DE');
                        oModel.read(`${
                            element.getPath()
                        }/to_Item`, {
                            success: function (item, hres) {
                                item.results.forEach(it => {
                                    if(it.ma_kh){
                                        makh = it.ma_kh
                                    }

                                    if (it.ten_kh){
                                        tenkh = it.ten_kh
                                    }

                                    if (it.noi_dung ) {
                                        noidung = it.noi_dung
                                    }  

                                    cur = it.CompanyCodeCurrency
                                    tongNo = Number(tongNo) + Number(it.phat_sinh_no)
                                    tongCo = Number(tongCo) + Number(it.phat_sinh_co)
                                    
                                    console.log('phatsinhno: ', it.phat_sinh_no)
                                    console.log('phatsinhco:', it.phat_sinh_co)
                                    console.log('negative:', it.IsNegativePosting)
                                    console.log(tongNo)
                                    console.log(tongCo)

                                    if ((it.phat_sinh_no <= 0 && it.IsNegativePosting == true) || (it.phat_sinh_no >= 0 && it.IsNegativePosting == true)) {
                                        tn =  "(" + VND.format(Math.abs(it.phat_sinh_no)) + ")"
                                    } else if ((it.phat_sinh_no <= 0 && it.IsNegativePosting == false) || (it.phat_sinh_no >= 0 && it.IsNegativePosting == false)){
                                        tn = VND.format(Math.abs(it.phat_sinh_no))
                                    }

                                    if ((it.phat_sinh_co <= 0 && it.IsNegativePosting == true) || (it.phat_sinh_co >= 0 && it.IsNegativePosting == true)) {
                                        tc = "(" + VND.format(Math.abs(it.phat_sinh_co)) + ")"
                                    } else if ((it.phat_sinh_co <= 0 && it.IsNegativePosting == false) || (it.phat_sinh_co >= 0 && it.IsNegativePosting == false)){
                                        tc = VND.format(Math.abs(it.phat_sinh_co))
                                    }

                                    if ((tongNo <= 0 && it.IsNegativePosting == true) || (tongNo >= 0 && it.IsNegativePosting == true)) {
                                        tongno = "(" + VND.format(Math.abs(tongNo)) + ")"
                                    } else if ((tongNo <= 0 && it.IsNegativePosting == false) || (tongNo >= 0 && it.IsNegativePosting == false)){
                                        tongno = VND.format(Math.abs(tongNo))
                                    }

                                    if ((tongCo <= 0 && it.IsNegativePosting == true) || (tongCo >= 0 && it.IsNegativePosting == true)) {
                                        tongco = "(" + VND.format(Math.abs(tongCo)) + ")"
                                    } else if ((tongCo <= 0 && it.IsNegativePosting == false) || (tongCo >= 0 && it.IsNegativePosting == false)){
                                        tongco = VND.format(Math.abs(tongCo))
                                    }
                                    

                                    var list = `<Data> 
                                                        <DienGiai>${
                                        it.noi_dung
                                    }</DienGiai>
                                                        <Vuviec>${
                                        it.vu_viec
                                    }</Vuviec>
                                                        <Taikhoan>${
                                        it.tai_khoan
                                    }</Taikhoan>
                                                        <PhatSinhNo>${
                                        tn
                                    }</PhatSinhNo>
                                                        <PhatSinhco>${
                                        tc
                                    }</PhatSinhco>
                                                        </Data>`

                                    listItem += list;
                                    console.log(listItem)
                                    //thatController.detail = listItem
                                    //console.log(thatController.detail);
                                })

                                var spellAmount = tongNo ? JSON.stringify({"amount": `${tongNo}`, "waers": `${cur}`, "lang": "VI"}) : JSON.stringify({"amount": `${tongCo}`, "waers": `${cur}`, "lang": "VI"})

                                var url_amountWords = "https://" + window.location.hostname + "/sap/bc/http/sap/zcore_api_amount_in_words";
                                $.ajax({
                                    url: url_amountWords,
                                    type: "POST",
                                    contentType: "application/json",
                                    data: spellAmount,
                                    beforeSend: function (xhr) {
                                        xhr.setRequestHeader('Authorization', 'Basic UFRQOnhucEtmbkxUcFNwa2N2SEdiSnBVOXUmTmVXZ3hEYXhXWVBwTHV2Vnk=');
                                    },
                                    success: function (resp, textStatus, jqHXR) {
                                        dataWord = JSON.parse(resp);
                                        xml = `<?xml version="1.0" encoding="UTF-8"?>
                                                        <form1>
                                                           <CongTy>${
                                            value.cong_ty
                                        }</CongTy>
                                                           <DiaChi>${
                                            value.dia_chi
                                        }</DiaChi>
                                                           <Subform10>
                                                              <TextField6></TextField6>
                                                           </Subform10>
                                                           <Subform2>
                                                              <SoChungTu>${
                                            value.AccountingDocument
                                        }</SoChungTu>
                                                              <NgayChungTu>${
                                            documentDate + "/" + documentMonth + "/" + value.ngay_chung_tu.getFullYear()
                                        }</NgayChungTu>
                                                              <NgayHachToan>${
                                            postingDate + "/" + postingMonth + "/" + value.ngay_hach_toan.getFullYear()
                                        }</NgayHachToan>
                                                           </Subform2>
                                                           <Subform3>
                                                              <MaKhachHang>${makh}</MaKhachHang>
                                                              <TenKhachHang>${tenkh}</TenKhachHang>
                                                           </Subform3>
                                                           <Subform4>
                                                              <NoiDung>${newND}</NoiDung>
                                                           </Subform4>
                                                           <Subform1>
                                                              <Table1>
                                                                 <HeaderRow/>
                                                                 ${listItem}
                                                                 <TongCong>
                                                                    <TongNo>${tongno}</TongNo>
                                                                    <TongCo>${tongco}</TongCo>
                                                                 </TongCong>
                                                              </Table1>
                                                           </Subform1>
                                                           <Subform5>
                                                                <TienBangChu>${
                                            dataWord.Result
                                        }</TienBangChu>
                                                           </Subform5>
                                                           <Subform7/>
                                                           <Subform8>
                                                              <TextField5></TextField5>
                                                              <TextField4></TextField4>
                                                           </Subform8>
                                                           <Subform9/>
                                                           <Subform11/>
                                                           <Subform6>
                                                              <KTTruong>${value.KTT}</KTTruong>
                                                              <TextField2></TextField2>
                                                              <NguoiLap>${nguoiLap}</NguoiLap>
                                                              <TextField3></TextField3>
                                                              <NguoiKS>${value.NKS}</NguoiKS>
                                                           </Subform6>
                                                        </form1>`
                                       
                                        console.log('xml:', xml)

                                        var dataEncode = window.btoa(unescape(encodeURIComponent(xml)))

                                        var raw = JSON.stringify({
                                            "id": `${
                                                value.CompanyCode
                                            }${
                                                value.FiscalYear
                                            }${
                                                value.AccountingDocument
                                            }`,
                                            "xdpTemplate": "PHIEUKETOAN/PhieuKeToan",
                                            "zxmlData": dataEncode,
                                            "formType": "print",
                                            "formLocale": "en_US",
                                            "taggedPdf": 1,
                                            "embedFont": 0,
                                            "changeNotAllowed": false,
                                            "printNotAllowed": false,
                                            "printMoi": "X"
                                        })
                                        var url_render = "https://" + window.location.hostname + "/sap/bc/http/sap/z_api_adobe?=";
                                        $.ajax({
                                            url: url_render,
                                            type: 'POST',
                                            contentType: "application/json",
                                            data : raw,
                                            beforeSend: function (xhr) {
                                                xhr.setRequestHeader('Authorization', 'Basic UFRQOnhucEtmbkxUcFNwa2N2SEdiSnBVOXUmTmVXZ3hEYXhXWVBwTHV2Vnk=');
                                            },
                                            success: function(response, textStatus, jqXHR){
                                                console.log(response)
                                                let json = JSON.parse(response)
                                                //goi thanh cong -> in form
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
                                                thatController.reviewDialog.close()
                                                
                                            },
                                            error: function (data) {
                                                console.log('Message Error: ' + JSON.stringify(json));
                                            }
                                        })
                                    }
                                })
                            }
                        }) // Item
                    }
                }) // read patch
            }) // for each
        }
    }
})

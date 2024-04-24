sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/Fragment",
        "sap/ui/model/odata/v2/ODataModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/model/json/JSONModel"
    ],
    function (Controller,Fragment, ODataModel,MessageBox, MessageToast, JSONModel) {
        "use strict";
        return {
            busyDialog: null,
            reviewDialog: null,
            arrayData:[],
            noidung:[],
            onInit: function(oEvent){
                Fragment.load({
                    id: "busyFragment",
                    name: "zfiphthu.controller.fragment.Busy",
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
                    name: "zfiphthu.controller.fragment.Review",
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
            PrintReview: function(oEvent){
                let thatController = this
                this.busyDialog.open()
                
                //Goi single promise
                // oPromiseForCal
                // .then((value))
                // .catch((errorr))
                let multiPromiseCal = []
                let data = this.extensionAPI.getSelectedContexts();
                data.forEach(element => {

                    let oPromiseForCal = new Promise((resolve, reject)=>{
                        let oModel = element.getModel()
                        oModel.read(`${element.getPath()}`, {
                            success: function (oDataRoot, oResponse){
                                console.log(oDataRoot)
                                thatController.arrayData = oDataRoot
                                console.log(thatController.arrayData)
                                console.log("thatController:", thatController.arrayData.results)
                                    var obj = {}
                                    obj.AccountingDocument = thatController.arrayData.AccountingDocument
                                    obj.NguoiNhanTien = thatController.arrayData.NguoiNhanTien
                                    obj.NguoiLap = ""
                                    obj.Reference = thatController.arrayData.Reference
                                    resolve(obj)
                            }
                        })
                    })
                    multiPromiseCal.push(oPromiseForCal)

                    // let oModel = element.getModel()
                    // oModel.read(`${element.getPath()}`, {
                    //     success: function (oDataRoot, oResponse){
                    //         console.log(oDataRoot)
                    //         thatController.arrayData = oDataRoot
                    //         console.log(thatController.arrayData)
                    //         console.log("thatController:", thatController.arrayData.results)
                    //         var result = []

                    //         //    thatController.arrayData.results.forEach (e => {
                    //         //         var obj = {}
                    //         //         obj.AccountingDocument = e.AccountingDocument
                    //         //         obj.NguoiNhanTien = e.NguoiNhanTien
                    //         //         obj.NguoiLap = " "
                    //         //         result.push(obj)
                    //         //     })
                    //             var obj = {}
                    //             obj.AccountingDocument = thatController.arrayData.AccountingDocument
                    //             obj.NguoiNhanTien = thatController.arrayData.NguoiNhanTien
                    //             obj.NguoiLap = " "
                    //             result.push(obj)


                    //             thatController.arrayData.results = result
                    //             console.log("result: ", result)
                    //     }
                    // })
                })
                Promise.all(multiPromiseCal)
                .then((value)=>{
                    console.log(value)
                    thatController.noidung.results = value
                    console.log(thatController.noidung.results)
                    let model = new JSONModel(thatController.noidung)
                    console.log("model:", model)
                    thatController.reviewDialog.setModel(model, "NoiDung")
                    thatController.reviewDialog.open()
                    thatController.busyDialog.close()
                })
            },
            onPrint: async function(oEvent){
                let thatController = this
                this.busyDialog.open()
                const VND = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                });
                let headingPromise = []
                let diaChiPromise = []
                let nguoiNhanPromise = []

                var kemtheo = []
                var diaChiArr = []
                var nguoinhan = []

                var heading = ''
                var diaChi = ''
                var nguoiNhan = ''
                thatController.noidung.results.forEach(nd => {
                    let hPromise = new Promise((resolve, reject) => {
                        var hd = `<KemTheo>${nd.Reference ? nd.Reference :''}</KemTheo>`
                        heading = hd
                        resolve(heading)
                    })
                    headingPromise.push(hPromise)

                    let fPromise = new Promise((resolve, reject) => {
                        var nl = `<AddressNguoiNhanTien>${nd.DiaChi ? nd.DiaChi : ''}</AddressNguoiNhanTien>`
                        diaChi = nl
                        resolve(diaChi)
                    })
                    diaChiPromise.push(fPromise)

                    let nPromise = new Promise((resolve, reject) => {
                        var nn = `<tenNguoiNhanTien>${nd.NguoiNhanTien ? nd.NguoiNhanTien :''}</tenNguoiNhanTien>`
                        nguoiNhan = nn
                        resolve(nguoiNhan)
                    })
                    nguoiNhanPromise.push(nPromise)
                })
                Promise.all(headingPromise)
                .then((value) => {
                    console.log('value:', value)
                    value.forEach(e => {
                        kemtheo.push(e)
                    })
                    console.log(kemtheo)
                })

                Promise.all(diaChiPromise)
                .then((value) => {
                    console.log('nguoi_lap: ', value)
                    value.forEach(l => {
                        diaChiArr.push(l)
                    })
                    console.log(nguoilap)
                })

                Promise.all(nguoiNhanPromise)
                .then((value) => {
                    console.log('nguoi_nhan: ', value)
                    value.forEach(n => {
                        nguoinhan.push(n)
                    })
                    console.log(nguoinhan)
                })
                
                let aContexts = this.extensionAPI.getSelectedContexts();
                for (let i = 0;i < aContexts.length;i ++){
                    let oModel = aContexts[i].getModel()
                    oModel.read(`${aContexts[i].getPath()}`, {
                        success: async function (oDataRoot, oResponse){
                            var lstNo = ''
                            var lstCo = ''
                          
                            console.log(oDataRoot)
                            console.log("Dia chi: ", oDataRoot.DiaChiCty)
                            oModel.read(`${aContexts[i].getPath()}/to_Item`, {
                                success: async function (oDataItem, oRes){
                                    oDataItem.results.forEach(data => {
                                        var no = `<noRow>
                                        <taiKhoanNo>${data.TaiKhoanNo}</taiKhoanNo>
                                        <sotienNo>${VND.format(data.SoTienNo)}</sotienNo>
                                    </noRow>`
                                    var tienCo = Number(data.SoTienCo)
                                    if(tienCo < 0){
                                        tienCo *= -1
                                    }
                                        var co = `<coRow>
                                        <taiKhoanCo>${data.TaiKhoanCo}</taiKhoanCo>
                                        <soTienCo>${VND.format(tienCo)}</soTienCo>
                                    </coRow>`
                                    if(Number(data.SoTienNo) != 0){
                                        lstNo+=no;
                                    }
                                    else{lstCo+=co}
                                    })
                                    console.log("XMLNO",lstNo)
                                    console.log("XMLCO",lstCo)

                                    var rawAmoutWords = JSON.stringify({
                                        "amount": `${oDataRoot.SoTien}`,
                                        "waers": `${oDataRoot.CompanyCodeCurrency}`,
                                        "lang": "VI"
                                    });
                                    var url_amountWords = "https://" + window.location.hostname + "/sap/bc/http/sap/zcore_api_amount_in_words?=";
                                    console.log(url_amountWords)
                                    $.ajax ({
                                        url: url_amountWords,
                                        type: "POST",
                                        contentType: "application/json",
                                        data: rawAmoutWords,
                                        success: function (resp, textStatus, jqXHR) {
                                            var data = JSON.parse(resp);
                                            var xml =`<?xml version="1.0" encoding="UTF-8"?>
                                                    <form1>
                                                    <Subform2>
                                                        <Subform1>
                                                            <NameCompany>${oDataRoot.TenCongTy}</NameCompany>
                                                            <AddressCompany>${oDataRoot.DiaChiCTy}</AddressCompany>
                                                        </Subform1>
                                                    </Subform2>
                                                    <Subform9>
                                                        <Subform8>
                                                            <Title>
                                                                <DMY>Ngày ${oDataRoot.PostingDate.getDate()} tháng ${oDataRoot.PostingDate.getMonth() + 1} năm ${oDataRoot.PostingDate.getFullYear()}</DMY>
                                                            </Title>
                                                            <infomation>
                                                                <headingInfo>
                                                                
                                                                </headingInfo>
                                                            </infomation>
                                                        </Subform8>
                                                        <taiKhoan>
                                                            <So>${oDataRoot.AccountingDocument}</So>
                                                            <taiKhoanNoSubform>
                                                                <taiKhoanNoDetailSubform>
                                                                <taiKhoanNoTable>
                                                                    ${lstNo}
                                                                </taiKhoanNoTable>
                                                                </taiKhoanNoDetailSubform>
                                                            </taiKhoanNoSubform>
                                                            <taiKhoanCoSubform>
                                                                <taiKhoanCoDetailSubform>
                                                                <taiKhoanCoTable>
                                                                    ${lstCo}
                                                                </taiKhoanCoTable>
                                                                </taiKhoanCoDetailSubform>  
                                                            </taiKhoanCoSubform>
                                                        </taiKhoan>
                                                                ${nguoinhan[i]}
                                                                ${diaChiArr[i]}
                                                                <LyDoThu>${oDataRoot.LyDoThu}</LyDoThu>
                                                                <SoTien>${VND.format(oDataRoot.SoTien)}</SoTien>
                                                                <BangChu>${data.Result}</BangChu>
                                                                ${kemtheo[i]}
                                                                <TienNhanDuBangChu></TienNhanDuBangChu>
                                                    </Subform9>
                                                    <Subform7>
                                                    <TongGiamDoc>${oDataRoot.IdGiamDoc}</TongGiamDoc>
                                                    <Ketoantruong>${oDataRoot.IdKeToan}</Ketoantruong>
                                                    <ThuQuy>${oDataRoot.IdThuQuy}</ThuQuy>
                                                    <NguoiLap>${sap.ushell.Container.getService("UserInfo").getFullName().toUpperCase()}</NguoiLap>
                                                 </Subform7>
                                                    </form1>`
                                                    console.log('xmlData: ', xml)
                                                    var dataEncode = window.btoa(unescape(encodeURIComponent(xml)))
                                                    var raw = JSON.stringify({
                                                        "id": `${oDataRoot.FiscalYear}${oDataRoot.CompanyCode}${oDataRoot.AccountingDocument}`,
                                                        "report": "phthu",
                                                        "xdpTemplate": "PHIEUTHU/PHIEUTHU",
                                                        "zxmlData": dataEncode,
                                                        "formType": "interactive",
                                                        "formLocale": "en_US",
                                                        "taggedPdf": 1,
                                                        "embedFont": 0,
                                                        "changeNotAllowed": false,
                                                        "printNotAllowed": false
                                                    });
                                                    var url_render = "https://" + window.location.hostname + "/sap/bc/http/sap/z_api_adobe?=";
                                            $.ajax({
                                                url: url_render,
                                                type: "POST",
                                                contentType: "application/json",
                                                data: raw,
                                                success: function (response, textStatus, jqXHR) {
                                                    let data = JSON.parse(response)
                                                            //once the API call is successfull, Display PDF on screen
                                                            console.log("Data:", data)
                                                            console.log("FileContent: ", data.fileContent)
                                                            var decodedPdfContent = atob(data.fileContent)//base65 to string ?? to pdf

                                                            var byteArray = new Uint8Array(decodedPdfContent.length);
                                                            for (var i = 0; i < decodedPdfContent.length; i++) {
                                                                byteArray[i] = decodedPdfContent.charCodeAt(i);
                                                            }
                                                            var blob = new Blob([byteArray.buffer], {
                                                                type: 'application/pdf'
                                                            });
                                                            var _pdfurl = URL.createObjectURL(blob);
                                                            this._PDFViewer = new sap.m.PDFViewer({
                                                                width: "auto",
                                                                source: _pdfurl
                                                            });
                                                            jQuery.sap.addUrlWhitelist("blob");
                                                            this._PDFViewer.downloadPDF();
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
                            })
                        }
                    })
                }
            },
            onCloseDialog: function(oEvent){
                this.reviewDialog.close()
            },
            // PrintPdf: async function (oContext, aSelectedContexts) {
             
            //     const VND = new Intl.NumberFormat('vi-VN', {
            //         style: 'currency',
            //         currency: 'VND',
            //     });
            //     let thisController = this
            //     MessageBox.information("Bạn có muốn tải xuống?", {
            //         actions: ["Tải ngay","Xem trước","Huỷ"],
            //         emphasizedAction: "Tải ngay",
            //         onClose: async function(sAction) {
            //             if (sAction == "Tải ngay") {
            //                  //thêm model load
            //                  if  (!thisController.busyDialog) {
            //                     Fragment.load({
            //                         id: "idBusyDialog1",
            //                         name: "zfiphthu.controller.fragment.Busy",
            //                         type: "XML",
            //                         controller: thisController })
            //                     .then((oDialog) => {
            //                         thisController.busyDialog = oDialog;
            //                         thisController.busyDialog.open();
                                    
            //                     })
            //                     .catch(error => alert(error.message));
            //                 } else {
            //                     thisController.busyDialog.open();
            //                 }
            //                 var that = thisController
            //                 let aContexts = thisController.extensionAPI.getSelectedContexts();
            //                 let downloadPromise = new Promise((resolve, reject) => {
            //                     aContexts.forEach(element => {
            //                         let oModel = element.getModel()
            //                         oModel.read(`${element.getPath()}`, {
            //                             success: async function (oDataRoot, oResponse) {
            //                                 var lstNo = ''
            //                                 var lstCo = ''
            //                                 console.log(oDataRoot)
            //                                 oModel.read(`${element.getPath()}/to_Item`, {
            //                                     success: async function (oDataItem, oResponse) {
            //                                         oDataItem.results.forEach(data => {
            //                                             var no = `<noRow>
            //                                             <taiKhoanNo>${data.TaiKhoanNo}</taiKhoanNo>
            //                                             <sotienNo>${VND.format(data.SoTienNo)}</sotienNo>
            //                                         </noRow>`
            //                                         var tienCo = Number(data.SoTienCo)
            //                                         if(tienCo < 0){
            //                                             tienCo *= -1
            //                                         }
            //                                             var co = `<coRow>
            //                                             <taiKhoanCo>${data.TaiKhoanCo}</taiKhoanCo>
            //                                             <soTienCo>${VND.format(tienCo)}</soTienCo>
            //                                         </coRow>`
            //                                         if(Number(data.SoTienNo) != 0){
            //                                             lstNo+=no;
            //                                         }
            //                                         else{lstCo+=co}
            //                                         })
            //                                         console.log("XMLNO",lstNo)
            //                                     console.log("XMLCO",lstCo)
            //                                 var rawAmoutWords = JSON.stringify({
            //                                     "amount": `${oDataRoot.SoTien}`,
            //                                     "waers": `${oDataRoot.CompanyCodeCurrency}`,
            //                                     "lang": "VI"
            //                                 });
            //                                 var url_amountWords = "https://" + window.location.hostname + "/sap/bc/http/sap/zcore_api_amount_in_words?=";
            //                                 console.log(url_amountWords)
            //                                 $.ajax({
            //                                     url: url_amountWords,
            //                                     type: "POST",
            //                                     contentType: "application/json",
            //                                     data: rawAmoutWords,
            //                                     success: function (resp, textStatus, jqXHR) {
            //                                         var data = JSON.parse(resp);
            //                                         var xml =`<?xml version="1.0" encoding="UTF-8"?>
            //                                         <form1>
            //                                         <Subform2>
            //                                             <Subform1>
            //                                                 <NameCompany>${oDataRoot.TenCongTy}</NameCompany>
            //                                                 <AddressCompany>${oDataRoot.DiaChiCTy}</AddressCompany>
            //                                             </Subform1>
            //                                         </Subform2>
            //                                         <Subform9>
            //                                             <Subform8>
            //                                                 <Title>
            //                                                     <DMY>Ngày ${oDataRoot.PostingDate.getDate()} tháng ${oDataRoot.PostingDate.getMonth() + 1} năm ${oDataRoot.PostingDate.getFullYear()}</DMY>
            //                                                 </Title>
            //                                                 <infomation>
            //                                                     <headingInfo>
                                                                
            //                                                     </headingInfo>
            //                                                 </infomation>
            //                                             </Subform8>
            //                                             <taiKhoan>
            //                                                 <So>${oDataRoot.AccountingDocument}</So>
            //                                                 <taiKhoanNoSubform>
            //                                                     <taiKhoanNoDetailSubform>
            //                                                     <taiKhoanNoTable>
            //                                                         ${lstNo}
            //                                                     </taiKhoanNoTable>
            //                                                     </taiKhoanNoDetailSubform>
            //                                                 </taiKhoanNoSubform>
            //                                                 <taiKhoanCoSubform>
            //                                                     <taiKhoanCoDetailSubform>
            //                                                     <taiKhoanCoTable>
            //                                                         ${lstCo}
            //                                                     </taiKhoanCoTable>
            //                                                     </taiKhoanCoDetailSubform>  
            //                                                 </taiKhoanCoSubform>
            //                                             </taiKhoan>
            //                                             <tenNguoiNhanTien>${oDataRoot.NguoiNhanTien}</tenNguoiNhanTien>
            //                                                     <AddressNguoiNhanTien>${oDataRoot.DiaChiNguoiNhanTien}</AddressNguoiNhanTien>
            //                                                     <LyDoThu>${oDataRoot.LyDoThu}</LyDoThu>
            //                                                     <SoTien>${VND.format(oDataRoot.SoTien)}</SoTien>
            //                                                     <BangChu>${data.Result}</BangChu>
            //                                                     <KemTheo>${oDataRoot.Reference}</KemTheo>
            //                                                     <TienNhanDuBangChu></TienNhanDuBangChu>
            //                                         </Subform9>
            //                                         <Subform7>
            //                                         <TongGiamDoc>${oDataRoot.IdGiamDoc}</TongGiamDoc>
            //                                         <Ketoantruong>${oDataRoot.IdKeToan}</Ketoantruong>
            //                                         <ThuQuy>${oDataRoot.IdThuQuy}</ThuQuy>
            //                                         <NguoiLap></NguoiLap>
            //                                         <NguoiNhanTien></NguoiNhanTien>
            //                                      </Subform7>
            //                                         </form1>`
            //                                         console.log("dataXml",xml)
            //                                         var dataEncode = window.btoa(unescape(encodeURIComponent(xml)))
            //                                         var raw = JSON.stringify({
            //                                             "id": `${oDataRoot.FiscalYear}${oDataRoot.CompanyCode}${oDataRoot.AccountingDocument}`,
            //                                             "report": "phthu",
            //                                             "xdpTemplate": "PHIEUTHU/PHIEUTHU",
            //                                             "zxmlData": dataEncode,
            //                                             "formType": "interactive",
            //                                             "formLocale": "en_US",
            //                                             "taggedPdf": 1,
            //                                             "embedFont": 0,
            //                                             "changeNotAllowed": false,
            //                                             "printNotAllowed": false
            //                                         });
            //                                         var url_render = "https://" + window.location.hostname + "/sap/bc/http/sap/z_api_adobe?=";
            //                                         $.ajax({
            //                                             url: url_render,
            //                                             type: "POST",
            //                                             contentType: "application/json",
            //                                             data: raw,
            //                                             success: function (response, textStatus, jqXHR) {
            //                                                 let data = JSON.parse(response)
            //                                                 //once the API call is successfull, Display PDF on screen
            //                                                 console.log("Data:", data)
            //                                                 console.log("FileContent: ", data.fileContent)
            //                                                 var decodedPdfContent = atob(data.fileContent)//base65 to string ?? to pdf

            //                                                 var byteArray = new Uint8Array(decodedPdfContent.length);
            //                                                 for (var i = 0; i < decodedPdfContent.length; i++) {
            //                                                     byteArray[i] = decodedPdfContent.charCodeAt(i);
            //                                                 }
            //                                                 var blob = new Blob([byteArray.buffer], {
            //                                                     type: 'application/pdf'
            //                                                 });
            //                                                 var _pdfurl = URL.createObjectURL(blob);
            //                                                 //in mà k cho xem trước
            //                                                 let link = document.createElement('a')
            //                                                 link.href = _pdfurl
            //                                                 link.download = `${oDataRoot.FiscalYear}${oDataRoot.CompanyCode}${oDataRoot.AccountingDocument}.pdf`
            //                                                 link.dispatchEvent(new MouseEvent('click'))   
            //                                             //     if (!thisController._PDFViewer) {
            //                                             //         thisController._PDFViewer = new sap.m.PDFViewer({
            //                                             //             width: "auto",
            //                                             //             source: _pdfurl
            //                                             //         });
            //                                             //         jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
            //                                             //     }

            //                                             // // thisController._PDFViewer.open();
            //                                             //     thisController._PDFViewer.downloadPDF();
                                                            
            //                                             resolve("Thành công")
            //                                             },
            //                                             error: function (data) {
            //                                                 that.busyDialog.close();
            //                                                 console.log('message Error' + JSON.stringify(data));
            //                                             }
            //                                         });
            //                                     },
            //                                     error: function (data) {
            //                                         that.busyDialog.close();
            //                                         console.log('message Error' + JSON.stringify(data));
            //                                     }
            //                                 });
            //                                     }})
                                                

            //                             }
            //                         })
            //                         console.log("Đã in");
            //                     });  
            //                 })
            //                 downloadPromise.then((data)=>{
            //                     console.log("Đã vào Promise")
            //                     thisController.busyDialog.close();
            //                 })  
            //             }
            //             else if(sAction == "Xem trước") {
            //                 //thêm model load
            //                 if  (!thisController.busyDialog) {
            //                     Fragment.load({
            //                         id: "idBusyDialog1",
            //                         name: "zfiphthu.controller.fragment.Busy",
            //                         type: "XML",
            //                         controller: thisController })
            //                     .then((oDialog) => {
            //                         thisController.busyDialog = oDialog;
            //                         thisController.busyDialog.open();
                                    
            //                     })
            //                     .catch(error => alert(error.message));
            //                 } else {
            //                     thisController.busyDialog.open();
            //                 }
            //                 var that = thisController
            //                 let aContexts = thisController.extensionAPI.getSelectedContexts();
            //                 let downloadPromise = new Promise((resolve, reject) => {
            //                     aContexts.forEach(element => {
            //                         let oModel = element.getModel()
            //                         oModel.read(`${element.getPath()}`, {
            //                             success: async function (oDataRoot, oResponse) {
            //                                 var lstNo = ''
            //                                 var lstCo = ''
            //                                 oModel.read(`${element.getPath()}/to_Item`, {
            //                                     success: async function (oDataItem, oResponse) {
            //                                         oDataItem.results.forEach(data => {
            //                                             var no = `<noRow>
            //                                             <taiKhoanNo>${data.TaiKhoanNo}</taiKhoanNo>
            //                                             <sotienNo>${VND.format(data.SoTienNo)}</sotienNo>
            //                                         </noRow>`
            //                                         var tienCo = Number(data.SoTienCo)
            //                                         if(tienCo < 0){
            //                                             tienCo *= -1
            //                                         }
            //                                             var co = `<coRow>
            //                                             <taiKhoanCo>${data.TaiKhoanCo}</taiKhoanCo>
            //                                             <soTienCo>${VND.format(tienCo)}</soTienCo>
            //                                         </coRow>`
            //                                         if(Number(data.SoTienNo) != 0){
            //                                             lstNo+=no;
            //                                         }
            //                                         else{lstCo+=co}
            //                                         })
            //                                         console.log("XMLNO",lstNo)
            //                                     console.log("XMLCO",lstCo)
            //                                 var rawAmoutWords = JSON.stringify({
            //                                     "amount": `${oDataRoot.SoTien}`,
            //                                     "waers": `${oDataRoot.CompanyCodeCurrency}`,
            //                                     "lang": "VI"
            //                                 });
            //                                 var url_amountWords = "https://" + window.location.hostname + "/sap/bc/http/sap/zcore_api_amount_in_words?=";
            //                                 console.log(url_amountWords)
            //                                 $.ajax({
            //                                     url: url_amountWords,
            //                                     type: "POST",
            //                                     contentType: "application/json",
            //                                     data: rawAmoutWords,
            //                                     success: function (resp, textStatus, jqXHR) {
            //                                         var data = JSON.parse(resp);
            //                                         var xml =`<?xml version="1.0" encoding="UTF-8"?>
            //                                         <form1>
            //                                         <Subform2>
            //                                             <Subform1>
            //                                                 <NameCompany>${oDataRoot.TenCongTy}</NameCompany>
            //                                                 <AddressCompany>${oDataRoot.DiaChiCTy}</AddressCompany>
            //                                             </Subform1>
            //                                         </Subform2>
            //                                         <Subform9>
            //                                             <Subform8>
            //                                                 <Title>
            //                                                     <DMY>Ngày ${oDataRoot.PostingDate.getDate()} tháng ${oDataRoot.PostingDate.getMonth() + 1} năm ${oDataRoot.PostingDate.getFullYear()}</DMY>
            //                                                 </Title>
            //                                                 <infomation>
            //                                                     <headingInfo>
                                                                
            //                                                     </headingInfo>
            //                                                 </infomation>
            //                                             </Subform8>
            //                                             <taiKhoan>
            //                                                 <So>${oDataRoot.AccountingDocument}</So>
            //                                                 <taiKhoanNoSubform>
            //                                                     <taiKhoanNoDetailSubform>
            //                                                     <taiKhoanNoTable>
            //                                                         ${lstNo}
            //                                                     </taiKhoanNoTable>
            //                                                     </taiKhoanNoDetailSubform>
            //                                                 </taiKhoanNoSubform>
            //                                                 <taiKhoanCoSubform>
            //                                                     <taiKhoanCoDetailSubform>
            //                                                     <taiKhoanCoTable>
            //                                                         ${lstCo}
            //                                                     </taiKhoanCoTable>
            //                                                     </taiKhoanCoDetailSubform>  
            //                                                 </taiKhoanCoSubform>
            //                                             </taiKhoan>
            //                                             <tenNguoiNhanTien>${oDataRoot.NguoiNhanTien}</tenNguoiNhanTien>
            //                                                     <AddressNguoiNhanTien>${oDataRoot.DiaChiNguoiNhanTien}</AddressNguoiNhanTien>
            //                                                     <LyDoThu>${oDataRoot.LyDoThu}</LyDoThu>
            //                                                     <SoTien>${VND.format(oDataRoot.SoTien)}</SoTien>
            //                                                     <BangChu>${data.Result}</BangChu>
            //                                                     <KemTheo>${oDataRoot.Reference}</KemTheo>
            //                                                     <TienNhanDuBangChu></TienNhanDuBangChu>
            //                                         </Subform9>
            //                                         <Subform7>
            //                                         <TongGiamDoc>${oDataRoot.IdGiamDoc}</TongGiamDoc>
            //                                         <Ketoantruong>${oDataRoot.IdKeToan}</Ketoantruong>
            //                                         <ThuQuy>${oDataRoot.IdThuQuy}</ThuQuy>
            //                                      </Subform7>
            //                                         </form1>`
            //                                         console.log("dataXml",xml)
            //                                         var dataEncode = window.btoa(unescape(encodeURIComponent(xml)))
            //                                         var raw = JSON.stringify({
            //                                             "id": `${oDataRoot.FiscalYear}${oDataRoot.CompanyCode}${oDataRoot.AccountingDocument}`,
            //                                             "report": "phthu",
            //                                             "xdpTemplate": "PHIEUTHU/PHIEUTHU",
            //                                             "zxmlData": dataEncode,
            //                                             "formType": "interactive",
            //                                             "formLocale": "en_US",
            //                                             "taggedPdf": 1,
            //                                             "embedFont": 0,
            //                                             "changeNotAllowed": false,
            //                                             "printNotAllowed": false
            //                                         });
            //                                         var url_render = "https://" + window.location.hostname + "/sap/bc/http/sap/z_api_adobe?=";
            //                                         $.ajax({
            //                                             url: url_render,
            //                                             type: "POST",
            //                                             contentType: "application/json",
            //                                             data: raw,
            //                                             success: function (response, textStatus, jqXHR) {
            //                                                 let data = JSON.parse(response)
            //                                                 //once the API call is successfull, Display PDF on screen
            //                                                 console.log("Data:", data)
            //                                                 console.log("FileContent: ", data.fileContent)
            //                                                 var decodedPdfContent = atob(data.fileContent)//base65 to string ?? to pdf

            //                                                 var byteArray = new Uint8Array(decodedPdfContent.length);
            //                                                 for (var i = 0; i < decodedPdfContent.length; i++) {
            //                                                     byteArray[i] = decodedPdfContent.charCodeAt(i);
            //                                                 }
            //                                                 var blob = new Blob([byteArray.buffer], {
            //                                                     type: 'application/pdf'
            //                                                 });
            //                                                 var _pdfurl = URL.createObjectURL(blob);
            //                                                 //in mà k cho xem trước
            //                                                 // let link = document.createElement('a')
            //                                                 // link.href = _pdfurl
            //                                                 // link.download = `${oDataRoot.FiscalYear}${oDataRoot.CompanyCode}${oDataRoot.AccountingDocument}.pdf`
            //                                                 // link.dispatchEvent(new MouseEvent('click'))   
            //                                                // if (thisController._PDFViewer) {
            //                                                     thisController._PDFViewer = new sap.m.PDFViewer({
            //                                                         width: "auto",
            //                                                         source: _pdfurl
            //                                                     });
            //                                                     jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
            //                                                //}
            //                                             // thisController._PDFViewer.open();
            //                                                 thisController._PDFViewer.downloadPDF();
            //                                                 resolve("Thành công")

            //                                             },
            //                                             error: function (data) {
            //                                                 that.busyDialog.close();
            //                                                 console.log('message Error' + JSON.stringify(data));
            //                                             }
            //                                         });
            //                                     },
            //                                     error: function (data) {
            //                                         that.busyDialog.close();
            //                                         console.log('message Error' + JSON.stringify(data));
            //                                     }
            //                                 });
            //                                     }})
                                                

            //                             }
            //                         })
            //                         console.log("Đã in");
            //                     });  
            //                 })
            //                 downloadPromise.then((data)=>{
            //                     console.log("Đã vào Promise")
            //                     thisController.busyDialog.close();
            //                 })
            //             }
            //             else{

            //             }
            //         }
            //     })
                
            // },
        };
    }
);
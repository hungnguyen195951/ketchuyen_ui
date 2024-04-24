sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
	      "sap/ui/core/Fragment",
          "sap/ui/model/odata/v2/ODataModel",
          "sap/m/MessageBox",
	    "sap/m/MessageToast"
    ],
    function (Controller,Fragment, ODataModel,MessageBox, MessageToast) {
         "use strict";
         return {

            busyDialog: null,
            onInitSmartFilterBarExtension: function(oSource) {
                console.log('onInitSmartFilterBarExtension')
                var filterObject = this.getView().byId("listReportFilter")
                console.log(filterObject)
                 let defaultValue = {
                 "MaterialDocumentYear": new Date().getFullYear().toString()
                }
                 filterObject.setFilterData(defaultValue)
            },
            Print: async function (oEvent) {

                let thisController = this
                MessageBox.information("Bạn có muốn tải xuống?", {
                    actions: ["Tải ngay","Xem trước","Huỷ"],
                    emphasizedAction: "Tải ngay",
                   // initialFocus: MessageBox.Action.PREVIEW,
                    onClose: async function(sAction) {
                        if (sAction == "Tải ngay") {
                            let aContexts = thisController.extensionAPI.getSelectedContexts();
                            console.log(aContexts.length);
                            const dateNow = new Date();
                            const VND = new Intl.NumberFormat('en-DE');
                            //var countPrint = 0;

                            //thêm model load
                            if  (!thisController.busyDialog) {
                                Fragment.load({
                                    id: "idBusyDialog1",
                                    name: "zpxkho.controller.fragment.Busy",
                                    type: "XML",
                                    controller: thisController })
                                .then((oDialog) => {
                                    thisController.busyDialog = oDialog;
                                    thisController.busyDialog.open();
                                    
                                })
                                .catch(error => alert(error.message));
                            } else {
                                thisController.busyDialog.open();
                            }
                        //     var urlApi = `https://${window.location.hostname}/sap/opu/odata/sap/ZMM_API_PXKHO_COUNT_PRINT`;
                        //     console.log(urlApi);
                        // var oModelApi = new sap.ui.model.odata.v2.ODataModel( urlApi, { json : true } );//"https://my402249.s4hana.cloud.sap/sap/opu/odata/sap/ZMM_API_PNKHO_COUNT_PRINT");
                        //     await oModelApi.read("/ZMM_I_PXKHO_COUNT_PRINT", {
                        //         success: function (oData, oResponse) {
                        //             console.log(oData)
                        //             console.log(oResponse)
                        //         }, 
                        //         error: function (oData, error ){
                        //             console.log(oData)
                        //             console.log(error)

                        //         }
                        //     });
                            
                        // console.log('Data: ');
                            //console.log(data);
                            var that = thisController
                            let downloadPromise = new Promise((resolve, reject) => {
                                aContexts.forEach(element => {
                                    let oModel = element.getModel()
                                    
                                    oModel.read( `${element.getPath()}`, {
                                    success: async function(oDataRoot, oResponse){
                                    var lstItem ='' ;
                                        var sumTienHang = 0;
                                        var tongSoLuong = 0;
                                        var tongCong = 0;
                                        
                                        oModel.read(`${element.getPath()}/to_Item`, {
                                            success: async function (oDataItem, oResponse) {
                                                console.log(oDataItem);
                                                oDataItem.results.forEach(data => {
                                                    console.log(data.MaterialDocumentItem)
                                                    
                                                    var hanSuDung = ''
                                                    if(data.HanSuDung != '' && data.HanSuDung !== 0 && data.HanSuDung && data.HanSuDung !== '0'){
                                                        var arr = data.HanSuDung.split("")
                                                        console.log('Hạn sử dụng',arr)
                                                        var nam = `${arr[0]}${arr[1]}${arr[2]}${arr[3]}`
                                                        var thang = `${arr[4]}${arr[5]}`
                                                        var ngay = `${arr[6]}${arr[7]}`
                                                        var xmlItem= `<Data>
                                                        <STT>${data.MaterialDocumentItem}</STT>
                                                        <MaVatTu>${data.MaVatTu}</MaVatTu>
                                                        <TenVatTu><![CDATA[${data.TenVatTu}]]></TenVatTu>
                                                        <DVT>${data.DVT}</DVT>
                                                        <MaLo>${data.MaLo}</MaLo>
                                                        <HanSuDung>${ngay}/${thang}/${nam}</HanSuDung>
                                                        <YeuCau>${data.SoLuongYeuCau}</YeuCau>
                                                        <ThucXuat>${data.QuantityInEntryUnit}</ThucXuat>
                                                        <Gia>${VND.format(Number(data.Gia))}</Gia>
                                                        <Tien>${VND.format(Number(data.Tien))}</Tien>
                                                    </Data>`
                                                    }else{
                                                        var xmlItem= `<Data>
                                                        <STT>${data.MaterialDocumentItem}</STT>
                                                        <MaVatTu>${data.MaVatTu}</MaVatTu>
                                                        <TenVatTu><![CDATA[${data.TenVatTu}]]></TenVatTu>
                                                        <DVT>${data.DVT}</DVT>
                                                        <MaLo>${data.MaLo}</MaLo>
                                                        <HanSuDung></HanSuDung>
                                                        <YeuCau>${data.SoLuongYeuCau}</YeuCau>
                                                        <ThucXuat>${data.QuantityInEntryUnit}</ThucXuat>
                                                        <Gia>${VND.format(Number(data.Gia))}</Gia>
                                                        <Tien>${VND.format(Number(data.Tien))}</Tien>
                                                    </Data>`
                                                    }
                                                sumTienHang += Number(data.Tien);
                                                tongSoLuong += Number(data.QuantityInEntryUnit);
                                                lstItem += xmlItem;
                                                })
                                                console.log(lstItem);
                                                var rawAmoutWords = JSON.stringify({
                                                    "amount":`${sumTienHang}`,
                                                    "waers":`${oDataRoot.CompanyCodeCurrency}`,
                                                    "lang":"VI"
                                                });
                                                var url_amountWords = "https://" + window.location.hostname + "/sap/bc/http/sap/zcore_api_amount_in_words?=";
                                                console.log(url_amountWords)
                                                $.ajax({
                                                    url:url_amountWords,
                                                    type: "POST",
                                                    contentType: "application/json",
                                                    data: rawAmoutWords,
                                                    success: function (resp, textStatus, jqXHR) {
                                                        var dataWord = JSON.parse(resp);
                                                        console.log('Chữ: ',resp);
                                                var xml = `<?xml version="1.0" encoding="UTF-8"?>
                                                <form1>
                                                <subpage>
                                                    <Subform5>
                                                        <Name-Address>
                                                            <name>${oDataRoot.CompanyCodeName}</name>
                                                            <address>${oDataRoot.StreetNameDiaDiemCompany}, ${oDataRoot.CityNameDiaDiemCompany}</address>
                                                        </Name-Address>
                                                        <MauSo><![CDATA[Mẫu Số: ${oDataRoot.MauSo}]]></MauSo>
                                                    </Subform5>
                                                    <Subform6>
                                                        <Information_2>
                                                            <txtSo>Số: ${oDataRoot.MaterialDocument}</txtSo>
                                                            <txtNo>Nợ: ${oDataRoot.accountNo}</txtNo>
                                                            <txtCo>Có: ${oDataRoot.accountCo}</txtCo>
                                                        </Information_2>
                                                        <title>PHIẾU XUẤT KHO</title>
                                                        <Date>Ngày ${oDataRoot.PostingDate.getDate()} tháng ${oDataRoot.PostingDate.getMonth()+1} năm ${oDataRoot.PostingDate.getFullYear()}</Date>
                                                    </Subform6>
                                                    <Information>
                                                        <txtXuatTaiKho><![CDATA[Xuất tại kho (ngăn lô): ${oDataRoot.PlantName}            Địa Điểm: ${oDataRoot.StreetNamePlant}, ${oDataRoot.CityNamePlant}]]></txtXuatTaiKho>
                                                        <txtNhapTaiKho>Lý do xuất kho: ${oDataRoot.LyDoXuatHang}</txtNhapTaiKho>
                                                        <txtNguoiGiaoHang><![CDATA[Họ và tên người nhận hàng: ${oDataRoot.nameNguoiNhanHang}]]></txtNguoiGiaoHang>
                                                        <txtTheoHoaDon><![CDATA[Địa chỉ (Bộ phận): ${oDataRoot.DiaChiBoPhan}]]></txtTheoHoaDon>
                                                    </Information>
                                                    <Header>
                                                        <HeaderRow>
                                                            <Subform2>
                                                            <Table2>
                                                                <Row1/>
                                                                <Row2>
                                                                    <Subform3>
                                                                        <Table3>
                                                                        <Row1/>
                                                                        </Table3>
                                                                    </Subform3>
                                                                </Row2>
                                                            </Table2>
                                                            </Subform2>
                                                        </HeaderRow>
                                                    </Header>
                                                    <Subform4>
                                                        <MainData>
                                                            <subHeader/>
                                                            ${lstItem}
                                                            <FooterRow>
                                                            <TongCong>${tongSoLuong}</TongCong>
                                                            <TongTien>${VND.format(Number(sumTienHang))}</TongTien>
                                                            </FooterRow>
                                                        </MainData>
                                                    </Subform4>
                                                    <Table1>
                                                        <Footer>
                                                            <soTienBangChu>Số tiền (viết bằng chữ): ${dataWord.Result}</soTienBangChu>
                                                            <soChungTuGoc>Số chứng từ gốc kèm theo: ${oDataRoot.DocumentReferenceID}</soChungTuGoc>
                                                            <Subform2>
                                                                <txtKeToanTruong>HOÀNG ĐĂNG ÁNH</txtKeToanTruong>
                                                                <ngayThangNamFooter>Ngày ${dateNow.getDate()} tháng ${dateNow.getMonth()+1} năm ${dateNow.getFullYear()}</ngayThangNamFooter>
                                                                <txtnguoiLap>NGƯỜI LẬP</txtnguoiLap>
                                                                <txtTongGiamDoc>TỔNG GIÁM ĐỐC</txtTongGiamDoc>
                                                                <txtNameNguoiLap></txtNameNguoiLap>
                                                                <txtnameTongGiamDoc>ĐÀO VĂN ĐAI</txtnameTongGiamDoc>
                                                            </Subform2>
                                                        </Footer>
                                                    </Table1>
                                                </subpage>
                                                </form1>`
                                                console.log('Table: ',xml);
                                                var dataEncode = window.btoa(unescape(encodeURIComponent(xml)))
                                                    var raw = JSON.stringify({
                                                        "id":`${oDataRoot.MaterialDocumentYear}${oDataRoot.Plant}${oDataRoot.MaterialDocument}`,
                                                        "report":"pxkho",
                                                        "xdpTemplate": "PHIEUXUATKHO/PHIEUXUATKHO",
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
                                                        beforeSend: function (xhr) {
                                                            xhr.setRequestHeader('Authorization', 'Basic TkdNSE5HQU5fQ1VTOmh6amNwRXM4VVZycnpQaVVZVWxFUUNCQ3hIY0J2e0dwVmlLQUF3WW4=');
                                                        },
                                                        success: function (response, textStatus, jqXHR) {
                                                            let data = JSON.parse(response)
                                                            //once the API call is successfull, Display PDF on screen
                                                            console.log("Data:",data)
                                                            console.log("FileContent: ",data.fileContent)
                                                            var decodedPdfContent = atob(data.fileContent)//base65 to string ?? to pdf
                                                            
                                                            var byteArray = new Uint8Array(decodedPdfContent.length);
                                                            for (var i = 0; i < decodedPdfContent.length; i++) {
                                                                byteArray[i] = decodedPdfContent.charCodeAt(i);
                                                            }
                                                            var blob = new Blob([byteArray.buffer], {
                                                                type: 'application/pdf'
                                                            });
                                                            var _pdfurl = URL.createObjectURL(blob);
                                                            console.log('Link download:',_pdfurl)
                                                            //in mà k cho xem trước
                                                            let link = document.createElement('a')
                                                            link.href = _pdfurl
                                                            link.download = `${oDataRoot.MaterialDocumentYear}${oDataRoot.Plant}${oDataRoot.MaterialDocument}.pdf`
                                                            link.dispatchEvent(new MouseEvent('click'))   
    
                                                        // document.location.href = url;
                                                            //window.open(url,'_blank')
                                                            //(_pdfurl, '_blank');
                                                            //window.open(_pdfurl, '_blank');
                                                            //window.location.reload();
                                                            // if (!thisController._PDFViewer) {
                                                            //     thisController._PDFViewer = new sap.m.PDFViewer({
                                                            //         width: "auto",
                                                            //         source: _pdfurl
                                                            //     });
                                                            //     jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                                                            // }
                                                            //thisController._PDFViewer.open();
                                                            //thisController._PDFViewer.downloadPDF();
                                                            //that.busyDialog.close();
                                                            // if(thisController._PDFViewer.close()){
                                                            //     console.log("Đã vào reload")
                                                            //     window.location.reload();
                                                            // }
                                                            resolve('Thành công');
                        
                                                        },
                                                        error: function (data) {
                                                            that.busyDialog.close();
                                                            console.log('message Error' + JSON.stringify(data));
                                                        }
                                                    }); 
                                                },
                                                error: function (data) {
                                                    that.busyDialog.close();
                                                    console.log('message Error' + JSON.stringify(data));
                                                }
                                            }); 
                                            }
                                        })
                                    }
                                    })
                                })
                            })
                            downloadPromise.then((data)=>{
                                thisController.busyDialog.close();
                            })
                            
                            console.log('Người dùng Ok');
                        } else if(sAction == "Xem trước") {
                            let aContexts = thisController.extensionAPI.getSelectedContexts();
                            console.log(aContexts.length);
                            const dateNow = new Date();
                            const VND = new Intl.NumberFormat('en-DE');
                            //var countPrint = 0;
            
                            //thêm model load
                            if  (!thisController.busyDialog) {
                                Fragment.load({
                                    id: "idBusyDialog1",
                                    name: "zpxkho.controller.fragment.Busy",
                                    type: "XML",
                                    controller: thisController })
                                .then((oDialog) => {
                                    thisController.busyDialog = oDialog;
                                    thisController.busyDialog.open();
                                    
                                })
                                .catch(error => alert(error.message));
                            } else {
                                thisController.busyDialog.open();
                            }
                            // var urlApi = `https://${window.location.hostname}/sap/opu/odata/sap/ZMM_API_PXKHO_COUNT_PRINT`;
                            // console.log(urlApi);
                        //    var oModelApi = new sap.ui.model.odata.v2.ODataModel( urlApi, { json : true } );//"https://my402249.s4hana.cloud.sap/sap/opu/odata/sap/ZMM_API_PNKHO_COUNT_PRINT");
                        //     await oModelApi.read("/ZMM_I_PXKHO_COUNT_PRINT", {
                        //         success: function (oData, oResponse) {
                        //             console.log(oData)
                        //             console.log(oResponse)
                        //         }, 
                        //         error: function (oData, error ){
                        //             console.log(oData)
                        //             console.log(error)
            
                        //         }
                        //     });
                            
                           // console.log('Data: ');
                            //console.log(data);
                            var that = thisController
                            let openNewWindow = new Promise((resolve,reject)=>{

                            
                             aContexts.forEach(element => {
                                let oModel = element.getModel()
                                
                                oModel.read( `${element.getPath()}`, {
                                  success: async function(oDataRoot, oResponse){
                                    console.log('odataa root', oDataRoot);
                                   var lstItem ='' ;
                                    var sumTienHang = 0;
                                    var tongSoLuong = 0;
                                    var tongCong = 0;
                                    
                                    oModel.read(`${element.getPath()}/to_Item`, {
                                        success: async function (oDataItem, oResponse) {
                                            console.log(oDataItem);
                                            oDataItem.results.forEach(data => {
                                                console.log(data.MaterialDocumentItem)
                                                // var arr = data.HanSuDung.split("")
                                                // console.log('Hạn sử dụng',arr)
                                                // var nam = `${arr[0]}${arr[1]}${arr[2]}${arr[3]}`
                                                // var thang = `${arr[4]}${arr[5]}`
                                                // var ngay = `${arr[6]}${arr[7]}`
                                                // console.log(ngay,thang,nam)
                                                var hanSuDung = '';
                                                if(data.HanSuDung != '' && data.HanSuDung !== 0 && data.HanSuDung && data.HanSuDung !== '0'){
                                                    var arr = data.HanSuDung.split("")
                                                    console.log('Hạn sử dụng',arr)
                                                    var nam = `${arr[0]}${arr[1]}${arr[2]}${arr[3]}`
                                                    var thang = `${arr[4]}${arr[5]}`
                                                    var ngay = `${arr[6]}${arr[7]}`
                                                    var xmlItem= `<Data>
                                                    <STT>${data.MaterialDocumentItem}</STT>
                                                    <MaVatTu>${data.MaVatTu}</MaVatTu>
                                                    <TenVatTu><![CDATA[${data.TenVatTu}]]></TenVatTu>
                                                    <DVT>${data.DVT}</DVT>
                                                    <MaLo>${data.MaLo}</MaLo>
                                                    <HanSuDung>${ngay}/${thang}/${nam}</HanSuDung>
                                                    <YeuCau>${data.SoLuongYeuCau}</YeuCau>
                                                    <ThucXuat>${data.QuantityInEntryUnit}</ThucXuat>
                                                    <Gia>${VND.format(data.Gia)}</Gia>
                                                    <Tien>${VND.format(data.Tien)}</Tien>
                                                </Data>`
                                                }else{
                                                    var xmlItem= `<Data>
                                                    <STT>${data.MaterialDocumentItem}</STT>
                                                    <MaVatTu>${data.MaVatTu}</MaVatTu>
                                                    <TenVatTu><![CDATA[${data.TenVatTu}]]></TenVatTu>
                                                    <DVT>${data.DVT}</DVT>
                                                    <MaLo>${data.MaLo}</MaLo>
                                                    <HanSuDung></HanSuDung>
                                                    <YeuCau>${data.SoLuongYeuCau}</YeuCau>
                                                    <ThucXuat>${data.QuantityInEntryUnit}</ThucXuat>
                                                    <Gia>${VND.format(data.Gia)}</Gia>
                                                    <Tien>${VND.format(data.Tien)}</Tien>
                                                </Data>`
                                                }
                                             sumTienHang += Number(data.Tien);
                                             tongSoLuong += Number(data.QuantityInEntryUnit);
                                             //tongCong = sumTienHang + data.TaxAmountInCoCodeCrcy;
                                             //console.log('Item: ',xmlItem);
                                             lstItem += xmlItem;
                                            })
                                            console.log(lstItem);
                                        //     //Dữ liệu cung cấp cho api number to word
                                            var rawAmoutWords = JSON.stringify({
                                                "amount":`${sumTienHang}`,
                                                "waers":`${oDataRoot.CompanyCodeCurrency}`,
                                                "lang":"VI"
                                            });
                                            var url_amountWords = "https://" + window.location.hostname + "/sap/bc/http/sap/zcore_api_amount_in_words?=";
                                            console.log(url_amountWords)
                                            $.ajax({
                                                url:url_amountWords,
                                                type: "POST",
                                                contentType: "application/json",
                                                data: rawAmoutWords,
                                                success: function (resp, textStatus, jqXHR) {
                                                    var dataWord = JSON.parse(resp);
                                                    console.log('Chữ: ',resp);
                                            var xml = `<?xml version="1.0" encoding="UTF-8"?>
                                            <form1>
                                               <subpage>
                                                  <Subform5>
                                                     <Name-Address>
                                                        <name>${oDataRoot.CompanyCodeName}</name>
                                                        <address>${oDataRoot.StreetNameDiaDiemCompany}, ${oDataRoot.CityNameDiaDiemCompany}</address>
                                                     </Name-Address>
                                                     <MauSo><![CDATA[Mẫu Số: ${oDataRoot.MauSo}]]></MauSo>
                                                  </Subform5>
                                                  <Subform6>
                                                     <Information_2>
                                                        <txtSo>Số: ${oDataRoot.MaterialDocument}</txtSo>
                                                        <txtNo>Nợ: ${oDataRoot.accountNo}</txtNo>
                                                        <txtCo>Có: ${oDataRoot.accountCo}</txtCo>
                                                     </Information_2>
                                                     <title>PHIẾU XUẤT KHO</title>
                                                     <Date>Ngày ${oDataRoot.PostingDate.getDate()} tháng ${oDataRoot.PostingDate.getMonth()+1} năm ${oDataRoot.PostingDate.getFullYear()}</Date>
                                                  </Subform6>
                                                  <Information>
                                                     <txtXuatTaiKho><![CDATA[Xuất tại kho (ngăn lô): ${oDataRoot.PlantName}            Địa Điểm: ${oDataRoot.StreetNamePlant}, ${oDataRoot.CityNamePlant}]]></txtXuatTaiKho>
                                                     <txtNhapTaiKho>Lý do xuất kho: ${oDataRoot.LyDoXuatHang}.</txtNhapTaiKho>
                                                     <txtNguoiGiaoHang><![CDATA[Họ và tên người nhận hàng: ${oDataRoot.nameNguoiNhanHang}]]></txtNguoiGiaoHang>
                                                     <txtTheoHoaDon><![CDATA[Địa chỉ (Bộ phận): ${oDataRoot.DiaChiBoPhan}]]></txtTheoHoaDon>
                                                  </Information>
                                                  <Header>
                                                     <HeaderRow>
                                                        <Subform2>
                                                           <Table2>
                                                              <Row1/>
                                                              <Row2>
                                                                 <Subform3>
                                                                    <Table3>
                                                                       <Row1/>
                                                                    </Table3>
                                                                 </Subform3>
                                                              </Row2>
                                                           </Table2>
                                                        </Subform2>
                                                     </HeaderRow>
                                                  </Header>
                                                  <Subform4>
                                                     <MainData>
                                                        <subHeader/>
                                                        ${lstItem}
                                                        <FooterRow>
                                                           <TongCong>${tongSoLuong}</TongCong>
                                                           <TongTien>${VND.format(sumTienHang)}</TongTien>
                                                        </FooterRow>
                                                     </MainData>
                                                  </Subform4>
                                                  <Table1>
                                                     <Footer>
                                                        <soTienBangChu>Số tiền (viết bằng chữ): ${dataWord.Result}</soTienBangChu>
                                                        <soChungTuGoc>Số chứng từ gốc kèm theo: ${oDataRoot.DocumentReferenceID}</soChungTuGoc>
                                                        <Subform2>
                                                            <txtKeToanTruong>HOÀNG ĐĂNG ÁNH</txtKeToanTruong>
                                                            <ngayThangNamFooter>Ngày ${dateNow.getDate()} tháng ${dateNow.getMonth()+1} năm ${dateNow.getFullYear()}</ngayThangNamFooter>
                                                            <txtnguoiLap>NGƯỜI LẬP</txtnguoiLap>
                                                            <txtTongGiamDoc>TỔNG GIÁM ĐỐC</txtTongGiamDoc>
                                                            <txtNameNguoiLap></txtNameNguoiLap>
                                                            <txtnameTongGiamDoc>ĐÀO VĂN ĐAI</txtnameTongGiamDoc>
                                                        </Subform2>
                                                     </Footer>
                                                  </Table1>
                                               </subpage>
                                            </form1>`
                                            console.log('Table: ',xml);
                                            var dataEncode = window.btoa(unescape(encodeURIComponent(xml)))
                                                var raw = JSON.stringify({
                                                    "id":`${oDataRoot.MaterialDocumentYear}${oDataRoot.Plant}${oDataRoot.MaterialDocument}`,
                                                    "report":"pxkho",
                                                    "xdpTemplate": "PHIEUXUATKHO/PHIEUXUATKHO",
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
                                                    beforeSend: function (xhr) {
                                                        xhr.setRequestHeader('Authorization', 'Basic TkdNSE5HQU5fQ1VTOmh6amNwRXM4VVZycnpQaVVZVWxFUUNCQ3hIY0J2e0dwVmlLQUF3WW4=');
                                                    },
                                                    success: function (response, textStatus, jqXHR) {
                                                        let data = JSON.parse(response)
                                                        //once the API call is successfull, Display PDF on screen
                                                        console.log("Data:",data)
                                                        console.log("FileContent: ",data.fileContent)
                                                        var decodedPdfContent = atob(data.fileContent)//base65 to string ?? to pdf
                                                        
                                                        var byteArray = new Uint8Array(decodedPdfContent.length);
                                                        for (var i = 0; i < decodedPdfContent.length; i++) {
                                                            byteArray[i] = decodedPdfContent.charCodeAt(i);
                                                        }
                                                        var blob = new Blob([byteArray.buffer], {
                                                            type: 'application/pdf'
                                                        });
                                                        var _pdfurl = URL.createObjectURL(blob);
                                                        console.log('Link download:',_pdfurl)
                                                        window.open(_pdfurl,'_blank')
                                                        resolve("Thành công")
                                                        // }
                                                        
                                                    },
                                                    error: function (data) {
                                                        that.busyDialog.close();
                                                        console.log('message Error' + JSON.stringify(data));
                                                    }
                                                }); 
                                            },
                                            error: function (data) {
                                                that.busyDialog.close();
                                                console.log('message Error' + JSON.stringify(data));
                                            }
                                        }); 
                                        }
                                    })
                                  }
                                })
                            })
                            
                        })
                        openNewWindow.then((data)=>{
                            console.log("đã vào promise",data)
                            thisController.busyDialog.close();
                        })
                        }
                        else{

                        }
                    }
                });
            },
            
        }
    }
)
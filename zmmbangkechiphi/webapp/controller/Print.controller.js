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
            VND : new Intl.NumberFormat('en-DE'),
            busyDialog: null,
            LoaiChiPhiOld:'',
            onInit: function(oEvent){
                Fragment.load({
                    id: "busyFragment",
                    name: "zmmbangkechiphi.controller.fragment.Busy",
                    type: "XML",
                    controller: this
                }).then((oDialog) => {
                    this.busyDialog = oDialog
                    console.log(oDialog)
                }).catch(error => {
                    MessageBox.error('Vui lòng tải lại trang')
                });
            },
            Print: async function(oEvent){
                let thatController = this
                thatController.busyDialog.open()
                MessageBox.information("Bạn có muốn tải xuống?", {
                    actions: ["Tải ngay", "Xem trước", "Huỷ"],
                    emphasizedAction: "Tải ngay",
                    // initialFocus: MessageBox.Action.PREVIEW,
                    onClose: async function (sAction) {
                        if (sAction == "Tải ngay") {
                            let aContexts = thatController.extensionAPI.getSelectedContexts();
                            var url = `https://${window.location.hostname}/sap/opu/odata/sap/ZMM_UI_BANGKECHIPHI_O2`
                            console.log("ACOntext:",aContexts)
                            aContexts.forEach(element => {
                                var model = element.getModel(``)
                                model.read(element.getPath(),{
                                    success: async function(oDataRoot,response){
                                        console.log("Data:",oDataRoot)
                                        var lstXmlItem = ''
                                        var stt = 0
                                        var sttItem = 1
                                        var loaiChiPhiHeader = ''
                                        var thanhTienChuaThue = 0
                                        model.read(`${element.getPath()}/toItem`,
                                            {
                                                urlParameters: {
                                                    "$orderby": 'SalesOrderItem asc'
                                            },
                                            success: async function(oDataItem,response){
                                                console.log('Dta Item',oDataItem);
                                                oDataItem.results.forEach(data=>{
                                                    console.log('Dta Item Type of Purchase',typeof data.PurchaseOrder);
                                                    console.log('Dta',data);
                                                    //if(data.PurchaseOrder == ''){
                                                        //loaiChiPhiHeader = ''
                                                        if(data.YY1_LoaichiphiNew_SDI == ''){
                                                            stt += 1
                                                            var xml = `<Row1>
                                                                    <STT>${stt}</STT>
                                                                    <KhoanMuc>${data.KhoanMucPONull}</KhoanMuc>
                                                                    <DVT>${data.DVTPONull}</DVT>
                                                                    <SoLuong>${data.SoLuongPONull}</SoLuong>
                                                                    <DonGia>${thatController.VND.format(data.DonGiaPONull)}</DonGia>
                                                                    <ThanhTien>${thatController.VND.format(data.SoLuongPONull*data.DonGiaPONull)}</ThanhTien>
                                                                    <GhiChu>${data.GhiChu}</GhiChu>
                                                                </Row1>`
                                                                lstXmlItem += xml
                                                                thanhTienChuaThue += data.SoLuongPONull*data.DonGiaPONull
                                                        }else{
                                                            if(thatController.LoaiChiPhiOld != data.YY1_LoaichiphiNew_SDI){
                                                                loaiChiPhiHeader = ''
                                                                stt += 1
                                                                sttItem = 1
                                                                loaiChiPhiHeader = `<Row1>
                                                                    <STT>${stt}</STT>
                                                                    <KhoanMuc>${data.YY1_LoaichiphiNew_SDI}</KhoanMuc>
                                                                    <DVT></DVT>
                                                                    <SoLuong></SoLuong>
                                                                    <DonGia></DonGia>
                                                                    <ThanhTien></ThanhTien>
                                                                    <GhiChu></GhiChu>
                                                                </Row1>
                                                                <Row1>
                                                                        <STT>${stt}.1</STT>
                                                                        <KhoanMuc>${data.KhoanMucPONull}</KhoanMuc>
                                                                        <DVT>${data.DVTPONull}</DVT>
                                                                        <SoLuong>${data.SoLuongPONull}</SoLuong>
                                                                        <DonGia>${thatController.VND.format(data.DonGiaPONull)}</DonGia>
                                                                        <ThanhTien>${thatController.VND.format(data.SoLuongPONull * data.DonGiaPONull)}</ThanhTien>
                                                                        <GhiChu>${data.GhiChu}</GhiChu>
                                                                    </Row1>
                                                                `
                                                                lstXmlItem += loaiChiPhiHeader
                                                                thanhTienChuaThue += (data.SoLuongPONull * data.DonGiaPONull)
                                                            }
                                                            else{
                                                                sttItem += 1
                                                                var xml = `<Row1>
                                                                        <STT>${stt}.${sttItem}</STT>
                                                                        <KhoanMuc>${data.KhoanMucPONull}</KhoanMuc>
                                                                        <DVT>${data.DVTPONull}</DVT>
                                                                        <SoLuong>${data.SoLuongPONull}</SoLuong>
                                                                        <DonGia>${thatController.VND.format(data.DonGiaPONull)}</DonGia>
                                                                        <ThanhTien>${thatController.VND.format(data.SoLuongPONull * data.DonGiaPONull)}</ThanhTien>
                                                                        <GhiChu>${data.GhiChu}</GhiChu>
                                                                    </Row1>`
                                                                lstXmlItem += xml
                                                                thanhTienChuaThue += (data.SoLuongPONull * data.DonGiaPONull)
                                                            }
                                                        }
                                                        thatController.LoaiChiPhiOld = data.YY1_LoaichiphiNew_SDI
                                                })
                                                console.log("XML:",lstXmlItem)
                                                //Xử lý số thuế
                                                var newTax = oDataRoot.Tax.replace('%', '')
                                                newTax = parseFloat(newTax)/100
                                                //Xử lý tháng
                                                const options = { year: 'numeric', month: 'short'}; //, day: 'numeric' 
                                                const formatter = new Intl.DateTimeFormat('en-US', options);
                                                var xml = `<?xml version="1.0" encoding="UTF-8"?>
                                                                <form1>
                                                                <SubformHeader>
                                                                    <SubformHeader1>
                                                                        <ImageField1/>
                                                                        <Subform4>
                                                                            <TenCty>${oDataRoot.Name}</TenCty>
                                                                            <DiaChiCty>Trụ sở: ${oDataRoot.Address}</DiaChiCty>
                                                                            <Tel>Tel: ${oDataRoot.AllPhoneNumber}</Tel>
                                                                            <Email>Email: ${oDataRoot.EmailAddress}</Email>
                                                                            <Website>Website: ${oDataRoot.Website}</Website>
                                                                            <Fax>Fax: ${oDataRoot.AllFaxNumber}</Fax>
                                                                        </Subform4>
                                                                    </SubformHeader1>
                                                                    <SubformHeader2>
                                                                        <BangKeVNM><![CDATA[BẢNG KÊ CHI PHÍ TRIỂN KHAI CHƯƠNG TRÌNH ${oDataRoot.YY1_tenchuongtrinhso_SDH}/]]></BangKeVNM>
                                                                        <BangKeEng><![CDATA[LIST OF FEES - ${oDataRoot.YY1_tenchuongtrinhso_SDH} PROGRAM]]></BangKeEng>
                                                                    </SubformHeader2>
                                                                </SubformHeader>
                                                                <SubformContent>
                                                                    <BangKeHangThang>Bảng kê chi phí tháng ${oDataRoot.CustomerPurchaseOrderDate ? `${oDataRoot.CustomerPurchaseOrderDate.getMonth()+1}/${oDataRoot.CustomerPurchaseOrderDate.getFullYear()}` : ''}/ LIST OF FEES - ${oDataRoot.CustomerPurchaseOrderDate ? formatter.format(oDataRoot.CustomerPurchaseOrderDate) : ''}</BangKeHangThang>
                                                                    <SubformTable>
                                                                        <Table1>
                                                                            <HeaderRow/>
                                                                            ${lstXmlItem}
                                                                            <ThanhTienChuaThue>${thatController.VND.format(thanhTienChuaThue)}</ThanhTienChuaThue>
                                                                            <TaxDescription>Thuế giá trị gia tăng/ VAT(${oDataRoot.Tax})</TaxDescription>
                                                                            <Thue>${thatController.VND.format(Math.round(thanhTienChuaThue * newTax))}</Thue>
                                                                            <ThanhTienCoThue>${thatController.VND.format(thanhTienChuaThue + Math.round(thanhTienChuaThue * newTax))}</ThanhTienCoThue>
                                                                        </Table1>
                                                                        <Include><![CDATA[(*) Đã bao gồm ${oDataRoot.PhiThuHo} phí thu hộ chi trả cho PP/Included ${oDataRoot.PhiThuHo} management fee of PP]]></Include>
                                                                    </SubformTable>
                                                                </SubformContent>
                                                                <Subform5>
                                                                    <Subform6>
                                                                        <TruongDonVi>${oDataRoot.TruongDonVi}</TruongDonVi>
                                                                    </Subform6>
                                                                    <Subform6>
                                                                        <NguoiLap>${oDataRoot.NguoiLap}</NguoiLap>
                                                                    </Subform6>
                                                                    <DateSign><![CDATA[Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}/ ${thatController.ChangeDate(new Date())}]]></DateSign>
                                                                </Subform5>
                                                                </form1>`
                                                console.log("XML:",xml)
                                                var dataEncode = window.btoa(unescape(encodeURIComponent(xml)))
                                                            var raw = JSON.stringify({
                                                                "id": `${oDataRoot.SalesOrder}`,
                                                                "report": "BANGKE",
                                                                "xdpTemplate": "BANGKECHIPHI/BANGKECHIPHI",
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
                                                                    console.log("Trả về:",response)
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
                                                                    console.log('Link download:', _pdfurl)
                                                                    //in mà k cho xem trước
                                                                    let link = document.createElement('a')
                                                                    link.href = _pdfurl
                                                                    link.download = `${oDataRoot.SalesOrder}.pdf`
                                                                    link.dispatchEvent(new MouseEvent('click'))
                                                                    // thatController._PDFViewer = new sap.m.PDFViewer({
                                                                    //         width: "auto",
                                                                    //         source: _pdfurl,
                                                                    //     });
                                                                    //     jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                                                                    
                                                                    //     thatController._PDFViewer.downloadPDF();
                                                                        thatController.busyDialog.close();

                                                                },
                                                                error: function (data) {
                                                                    thatController.busyDialog.close();
                                                                    console.log('message Error' + JSON.stringify(data));
                                                                }
                                                            });
                                            },
                                            error: async function(error){
                                                console.log("Lỗi:",error)
                                                thatController.busyDialog.close();
                                            }
                                        })
                                    },
                                    error: async function(error){
                                        console.log(error)
                                        thatController.busyDialog.close();
                                    }
                                })
                            });
                        }
                        else if (sAction == "Xem trước") {
                            let aContexts = thatController.extensionAPI.getSelectedContexts();
                            var url = `https://${window.location.hostname}/sap/opu/odata/sap/ZMM_UI_BANGKECHIPHI_O2`
                            console.log("ACOntext:",aContexts)
                            aContexts.forEach(element => {
                                var model = element.getModel()
                                model.read(element.getPath(),{
                                    success: async function(oDataRoot,response){
                                        console.log("Data:",oDataRoot)
                                        var lstXmlItem = ''
                                        var stt = 0
                                        var sttItem = 1
                                        var loaiChiPhiHeader = ''
                                        var thanhTienChuaThue = 0
                                        model.read(`${element.getPath()}/toItem`,
                                            {
                                                urlParameters: {
                                                    "$orderby": 'SalesOrderItem asc'
                                            },
                                            success: async function(oDataItem,response){
                                                console.log('Dta Item',oDataItem);
                                                oDataItem.results.forEach(data=>{
                                                    console.log('Dta Item Type of Purchase',typeof data.PurchaseOrder);
                                                    console.log('Dta',data);
                                                    //if(data.PurchaseOrder == ''){
                                                        //loaiChiPhiHeader = ''
                                                        if(data.YY1_LoaichiphiNew_SDI == ''){
                                                            stt += 1
                                                            var xml = `<Row1>
                                                                    <STT>${stt}</STT>
                                                                    <KhoanMuc>${data.KhoanMucPONull}</KhoanMuc>
                                                                    <DVT>${data.DVTPONull}</DVT>
                                                                    <SoLuong>${data.SoLuongPONull}</SoLuong>
                                                                    <DonGia>${thatController.VND.format(data.DonGiaPONull)}</DonGia>
                                                                    <ThanhTien>${thatController.VND.format(data.SoLuongPONull*data.DonGiaPONull)}</ThanhTien>
                                                                    <GhiChu>${data.GhiChu}</GhiChu>
                                                                </Row1>`
                                                                lstXmlItem += xml
                                                                thanhTienChuaThue += data.SoLuongPONull*data.DonGiaPONull
                                                        }else{
                                                            if(thatController.LoaiChiPhiOld != data.YY1_LoaichiphiNew_SDI){
                                                                loaiChiPhiHeader = ''
                                                                stt += 1
                                                                sttItem = 1
                                                                loaiChiPhiHeader = `<Row1>
                                                                    <STT>${stt}</STT>
                                                                    <KhoanMuc>${data.YY1_LoaichiphiNew_SDI}</KhoanMuc>
                                                                    <DVT></DVT>
                                                                    <SoLuong></SoLuong>
                                                                    <DonGia></DonGia>
                                                                    <ThanhTien></ThanhTien>
                                                                    <GhiChu></GhiChu>
                                                                </Row1>
                                                                <Row1>
                                                                        <STT>${stt}.1</STT>
                                                                        <KhoanMuc>${data.KhoanMucPONull}</KhoanMuc>
                                                                        <DVT>${data.DVTPONull}</DVT>
                                                                        <SoLuong>${data.SoLuongPONull}</SoLuong>
                                                                        <DonGia>${thatController.VND.format(data.DonGiaPONull)}</DonGia>
                                                                        <ThanhTien>${thatController.VND.format(data.SoLuongPONull * data.DonGiaPONull)}</ThanhTien>
                                                                        <GhiChu>${data.GhiChu}</GhiChu>
                                                                    </Row1>
                                                                `
                                                                lstXmlItem += loaiChiPhiHeader
                                                                thanhTienChuaThue += (data.SoLuongPONull * data.DonGiaPONull)
                                                            }
                                                            else{
                                                                sttItem += 1
                                                                var xml = `<Row1>
                                                                        <STT>${stt}.${sttItem}</STT>
                                                                        <KhoanMuc>${data.KhoanMucPONull}</KhoanMuc>
                                                                        <DVT>${data.DVTPONull}</DVT>
                                                                        <SoLuong>${data.SoLuongPONull}</SoLuong>
                                                                        <DonGia>${thatController.VND.format(data.DonGiaPONull)}</DonGia>
                                                                        <ThanhTien>${thatController.VND.format(data.SoLuongPONull * data.DonGiaPONull)}</ThanhTien>
                                                                        <GhiChu>${data.GhiChu}</GhiChu>
                                                                    </Row1>`
                                                                lstXmlItem += xml
                                                                thanhTienChuaThue += (data.SoLuongPONull * data.DonGiaPONull)
                                                            }
                                                        }
                                                        thatController.LoaiChiPhiOld = data.YY1_LoaichiphiNew_SDI
                                                    //}
                                                    // else{
                                                        
                                                    //     if(data.YY1_Loaichiphi_PDI == ''){
                                                    //         //loaiChiPhiHeader = ''
                                                    //         stt += 1
                                                    //          //.${sttItem
                                                    //         var xml = `<Row1>
                                                    //                     <STT>${stt}</STT>
                                                    //                     <KhoanMuc>${data.KhoanMucChiPhi}</KhoanMuc>
                                                    //                     <DVT>${data.DVTChiPhi}</DVT>
                                                    //                     <SoLuong>${data.SoLuongChiPhi}</SoLuong>
                                                    //                     <DonGia>${thatController.VND.format(data.DonGiaChiPhi)}</DonGia>
                                                    //                     <ThanhTien>${thatController.VND.format(data.SoLuongChiPhi * data.DonGiaChiPhi)}</ThanhTien>
                                                    //                     <GhiChu>${data.GhiChu}</GhiChu>
                                                    //                 </Row1>`
                                                    //         lstXmlItem += xml
                                                    //     }
                                                    //     else{
                                                    //         if(loaiChiPhiHeader == ''){
                                                    //             stt += 1
                                                    //             sttItem = 1
                                                    //             loaiChiPhiHeader = `<Row1>
                                                    //                 <STT>${stt}</STT>
                                                    //                 <KhoanMuc>${data.YY1_Loaichiphi_PDI}</KhoanMuc>
                                                    //                 <DVT></DVT>
                                                    //                 <SoLuong></SoLuong>
                                                    //                 <DonGia></DonGia>
                                                    //                 <ThanhTien></ThanhTien>
                                                    //                 <GhiChu></GhiChu>
                                                    //             </Row1>
                                                    //             <Row1>
                                                    //                     <STT>${stt}.1</STT>
                                                    //                     <KhoanMuc>${data.KhoanMucChiPhi}</KhoanMuc>
                                                    //                     <DVT>${data.DVTChiPhi}</DVT>
                                                    //                     <SoLuong>${data.SoLuongChiPhi}</SoLuong>
                                                    //                     <DonGia>${thatController.VND.format(data.DonGiaChiPhi)}</DonGia>
                                                    //                     <ThanhTien>${thatController.VND.format(data.SoLuongChiPhi * data.DonGiaChiPhi)}</ThanhTien>
                                                    //                     <GhiChu>${data.GhiChu}</GhiChu>
                                                    //                 </Row1>
                                                    //             `
                                                    //             lstXmlItem += loaiChiPhiHeader
                                                    //             thanhTienChuaThue += (data.SoLuongChiPhi * data.DonGiaChiPhi)
                                                    //         }
                                                    //         else{
                                                    //             sttItem += 1
                                                    //             var xml = `<Row1>
                                                    //                     <STT>${stt}.${sttItem}</STT>
                                                    //                     <KhoanMuc>${data.KhoanMucChiPhi}</KhoanMuc>
                                                    //                     <DVT>${data.DVTChiPhi}</DVT>
                                                    //                     <SoLuong>${data.SoLuongChiPhi}</SoLuong>
                                                    //                     <DonGia>${thatController.VND.format(data.DonGiaChiPhi)}</DonGia>
                                                    //                     <ThanhTien>${thatController.VND.format(data.SoLuongChiPhi * data.DonGiaChiPhi)}</ThanhTien>
                                                    //                     <GhiChu>${data.GhiChu}</GhiChu>
                                                    //                 </Row1>`
                                                    //             lstXmlItem += xml
                                                    //             thanhTienChuaThue += (data.SoLuongChiPhi * data.DonGiaChiPhi)
                                                    //         }
                                                    //     }
                                                    // }
                                                })
                                                console.log("XML:",lstXmlItem)
                                                //Xử lý số thuế
                                                var newTax = oDataRoot.Tax.replace('%', '')
                                                newTax = parseFloat(newTax)/100
                                                //Xử lý tháng
                                                const options = { year: 'numeric', month: 'short'}; //, day: 'numeric' 
                                                const formatter = new Intl.DateTimeFormat('en-US', options);
                                                var xml = `<?xml version="1.0" encoding="UTF-8"?>
                                                                <form1>
                                                                <SubformHeader>
                                                                    <SubformHeader1>
                                                                        <ImageField1/>
                                                                        <Subform4>
                                                                            <TenCty>${oDataRoot.Name}</TenCty>
                                                                            <DiaChiCty>Trụ sở: ${oDataRoot.Address}</DiaChiCty>
                                                                            <Tel>Tel: ${oDataRoot.AllPhoneNumber}</Tel>
                                                                            <Email>Email: ${oDataRoot.EmailAddress}</Email>
                                                                            <Website>Website: ${oDataRoot.Website}</Website>
                                                                            <Fax>Fax: ${oDataRoot.AllFaxNumber}</Fax>
                                                                        </Subform4>
                                                                    </SubformHeader1>
                                                                    <SubformHeader2>
                                                                        <BangKeVNM><![CDATA[BẢNG KÊ CHI PHÍ TRIỂN KHAI CHƯƠNG TRÌNH ${oDataRoot.YY1_tenchuongtrinhso_SDH}/]]></BangKeVNM>
                                                                        <BangKeEng><![CDATA[LIST OF FEES - ${oDataRoot.YY1_tenchuongtrinhso_SDH} PROGRAM]]></BangKeEng>
                                                                    </SubformHeader2>
                                                                </SubformHeader>
                                                                <SubformContent>
                                                                    <BangKeHangThang>Bảng kê chi phí tháng ${oDataRoot.CustomerPurchaseOrderDate ? `${oDataRoot.CustomerPurchaseOrderDate.getMonth()+1}/${oDataRoot.CustomerPurchaseOrderDate.getFullYear()}` : ''}/ LIST OF FEES - ${oDataRoot.CustomerPurchaseOrderDate ? formatter.format(oDataRoot.CustomerPurchaseOrderDate) : ''}</BangKeHangThang>
                                                                    <SubformTable>
                                                                        <Table1>
                                                                            <HeaderRow/>
                                                                            ${lstXmlItem}
                                                                            <ThanhTienChuaThue>${thatController.VND.format(thanhTienChuaThue)}</ThanhTienChuaThue>
                                                                            <TaxDescription>Thuế giá trị gia tăng/ VAT(${oDataRoot.Tax})</TaxDescription>
                                                                            <Thue>${thatController.VND.format(Math.round(thanhTienChuaThue * newTax))}</Thue>
                                                                            <ThanhTienCoThue>${thatController.VND.format(thanhTienChuaThue + Math.round(thanhTienChuaThue * newTax))}</ThanhTienCoThue>
                                                                        </Table1>
                                                                        <Include><![CDATA[(*) Đã bao gồm ${oDataRoot.PhiThuHo} phí thu hộ chi trả cho PP/Included ${oDataRoot.PhiThuHo} management fee of PP]]></Include>
                                                                    </SubformTable>
                                                                </SubformContent>
                                                                <Subform5>
                                                                    <Subform6>
                                                                        <TruongDonVi>${oDataRoot.TruongDonVi}</TruongDonVi>
                                                                    </Subform6>
                                                                    <Subform6>
                                                                        <NguoiLap>${oDataRoot.NguoiLap}</NguoiLap>
                                                                    </Subform6>
                                                                    <DateSign><![CDATA[Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}/ ${thatController.ChangeDate(new Date())}]]></DateSign>
                                                                </Subform5>
                                                                </form1>`
                                                console.log("XML:",xml)
                                                var dataEncode = window.btoa(unescape(encodeURIComponent(xml)))
                                                            var raw = JSON.stringify({
                                                                "id": `${oDataRoot.SalesOrder}`,
                                                                "report": "BANGKE",
                                                                "xdpTemplate": "BANGKECHIPHI/BANGKECHIPHI",
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
                                                                    console.log("Trả về:",response)
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
                                                                    console.log('Link download:', _pdfurl)
                                                                    //in mà k cho xem trước
                                                                    // let link = document.createElement('a')
                                                                    // link.href = _pdfurl
                                                                    // link.download = `${oDataRoot.MaterialDocumentYear}${oDataRoot.Plant}${oDataRoot.MaterialDocument}.pdf`
                                                                    // link.dispatchEvent(new MouseEvent('click'))
                                                                    thatController._PDFViewer = new sap.m.PDFViewer({
                                                                            width: "auto",
                                                                            source: _pdfurl,
                                                                        });
                                                                        jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                                                                    
                                                                        thatController._PDFViewer.downloadPDF();
                                                                        thatController.busyDialog.close();

                                                                },
                                                                error: function (data) {
                                                                    thatController.busyDialog.close();
                                                                    console.log('message Error' + JSON.stringify(data));
                                                                }
                                                            });
                                            },
                                            error: async function(error){
                                                console.log("Lỗi:",error)
                                                thatController.busyDialog.close();
                                            }
                                        })
                                    },
                                    error: async function(error){
                                        console.log(error)
                                        thatController.busyDialog.close();
                                    }
                                })
                            });
                        }
                        else{}
                    }
                })
            },
            ChangeDate: function(date){
                const options = { year: 'numeric', month: 'short'}; //, day: 'numeric' 
                const formatter = new Intl.DateTimeFormat('en-US', options);
                const formattedDate = formatter.format(date);

                // Chuyển đổi ngày thành chuỗi và thay thế số thứ tự cuối cùng của ngày bằng 'st', 'nd', 'rd', hoặc 'th'
                const daySuffix = (day) => {
                if (day >= 11 && day <= 13) {
                    return 'th';
                }
                const lastDigit = day % 10;
                switch (lastDigit) {
                    case 1:
                    return 'st';
                    case 2:
                    return 'nd';
                    case 3:
                    return 'rd';
                    default:
                    return 'th';
                }
                };

                const dayWithSuffix = `${date.getDate()}${daySuffix(date.getDate())}`;
                // Thay thế ngày trong chuỗi định dạng
                const FormattedDate2 = formattedDate.replace(/(\d+)$/, dayWithSuffix); 
                const finalFormattedDate = `${FormattedDate2}, ${date.getFullYear()}` 
                return finalFormattedDate
            }
        }
    }
)
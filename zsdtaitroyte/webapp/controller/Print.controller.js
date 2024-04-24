sap.ui.define(
    [
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
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/odata/v2/ODataModel"
    ],
    function (Controller, Fragment, JSONModel, MessageItem, MessageView, MessageBox, coreLibrary, Dialog, Button, Bar, Title, IconPool,Filter,FilterOperator) {
        "use strict";
        return {
            VND : new Intl.NumberFormat('en-DE'),
            onInit: function(oEvent){
                Fragment.load({
                    id: "idBusyDialog",
                    name: "zsdtaitroyte.controller.fragment.Busy",
                    type: "XML",
                    controller: this
                }).then((oDialog) => {
                        this.busyDialog = oDialog;
                        //this.busyDialog.open();

                }).catch(error => alert(error.message));
                Fragment.load({
                    id: "idUnit",
                    name: "zsdtaitroyte.controller.fragment.Unit",
                    type: "XML",
                    //height: "300px",
                    controller: this
                })
                .then((oDialog) => {
                    this.UnitDialog = oDialog;
                    //this.UnitDialog.open()
                })
                .catch(error => {
                    MessageBox.error('Vui lòng tải lại trang')
                });
            },
            Print:  async function (oEvent) {
                let thisController = this
                let aContexts = thisController.extensionAPI.getSelectedContexts();
                aContexts.forEach(element =>{
                    console.log(element)
                    let oModel = element.getModel()
                    oModel.read(`${element.getPath()}`, {
                        success: async function (oDataRoot, oResponse) {
                            console.log("OdataaRooot",oDataRoot)
                            oModel.read(`${element.getPath()}/to_Item`, {
                                success: async function (oDataItem, oResponse) {
                                    console.log("OdataaItem",oDataItem)
                                    var stt = 1;
                                    var lstItem = ''
                                    const result = {};
                                    oDataItem.results.forEach(data => {
                                        console.log("Data Foreach:",data)
                                        const groupKey = `${data.Material}-${data.DeliveryQuantityUnit}`;
                                        // Nếu khóa nhóm chưa tồn tại, thì tạo mới với giá trị là số lượng của đối tượng hiện tại
                                        if (!result[groupKey]) {
                                            result[groupKey] = Number(data.SoLuong);
                                        } else {
                                            // Ngược lại, cộng thêm số lượng của đối tượng hiện tại vào giá trị hiện tại
                                            result[groupKey] += Number(data.SoLuong);
                                        }
                                    })
                                    const arrSumQuantity = oDataItem.results.filter(obj => {
                                        const groupKey = `${obj.Material}-${obj.DeliveryQuantityUnit}`;
                                        if (result[groupKey] !== undefined && obj.HSD && obj.LotNo) {
                                            obj.SoLuong = result[groupKey];
                                            delete result[groupKey]; // Đánh dấu đã sử dụng giá trị này để tránh gán lại
                                            return true;
                                        }
                                        return false;
                                    });
                                    console.log("Kết quả: ",arrSumQuantity)
                                    if(oDataRoot.quyDoi == '0'){
                                        arrSumQuantity.forEach(element=>{
                                            if (element.HSD != '' && element.HSD !== 0 && element.HSD && element.HSD !== '0') {
                                                var arr = element.HSD.split("")
                                                console.log('Hạn sử dụng', arr)
                                                var nam = `${arr[0]}${arr[1]}${arr[2]}${arr[3]}`
                                                var thang = `${arr[4]}${arr[5]}`
                                                var ngay = `${arr[6]}${arr[7]}`
                                                var xmlItem = `<Row1>
                                                                    <STT>${stt}</STT>
                                                                    <TenSanPham>${element.Material} - ${element.ProductName}</TenSanPham>
                                                                    <SoLuong>${element.SoLuong}</SoLuong>
                                                                    <DVT>${element.DeliveryQuantityUnit}</DVT>
                                                                    <DonGia>${thisController.VND.format(element.DonGia)}</DonGia>
                                                                    <SoHoaDon>${element.SoHoaDon}</SoHoaDon>
                                                                    <NgayHoaDon>${element.NgayHoaDon}</NgayHoaDon>
                                                                    <SoLo>${element.LotNo}</SoLo>
                                                                    <HSD>${ngay}-${thang}-${nam}</HSD>
                                                                    <GiaTri>${thisController.VND.format(element.DonGia * element.SoLuong)}</GiaTri>
                                                                </Row1>`
                                            }
                                            else{
                                                var xmlItem = `<Row1>
                                                <STT>${stt}</STT>
                                                <TenSanPham>${element.Material} - ${element.ProductName}</TenSanPham>
                                                <SoLuong>${element.SoLuong}</SoLuong>
                                                <DVT>${element.DeliveryQuantityUnit}</DVT>
                                                <DonGia>${thisController.VND.format(element.DonGia)}</DonGia>
                                                <SoHoaDon>${element.SoHoaDon}</SoHoaDon>
                                                <NgayHoaDon>${element.NgayHoaDon}</NgayHoaDon>
                                                <SoLo>${element.LotNo}</SoLo>
                                                <HSD>${element.HSD}</HSD>
                                                <GiaTri>${thisController.VND.format(element.DonGia * element.SoLuong)}</GiaTri>
                                            </Row1>`
                                            }
                                            lstItem += xmlItem                  
                                            stt+=1
                                        })
                                        console.log("LstXmlItem:",lstItem)
                                                var time = new Date()
                                                var xml = `<?xml version="1.0" encoding="UTF-8"?>
                                                <form1>
                                                   <SubformHeader>
                                                      <OD>${oDataRoot.DeliveryDocument}</OD>
                                                   </SubformHeader>
                                                   <SubFormContent>
                                                      <TextField1></TextField1>
                                                      <DonViNhan>${oDataRoot.ShipToPartyName}</DonViNhan>
                                                      <DiaChiDonViNhan>${oDataRoot.DiaChiKhachHang}</DiaChiDonViNhan>
                                                      <MSTDonViNhan>${oDataRoot.TaxNumber1}</MSTDonViNhan>
                                                      <TenNCC>${oDataRoot.TenNCC}</TenNCC>
                                                      <DiaChiNCC>${oDataRoot.DiaChiNCC}</DiaChiNCC>
                                                      <SDTNCC>${oDataRoot.SDTNCC}</SDTNCC>
                                                      <FAXNCC>${oDataRoot.FAX}</FAXNCC>
                                                      <MSTNCC>${oDataRoot.taxNCC}</MSTNCC>
                                                      <XacNhan>Cùng xác nhận ${oDataRoot.TenNCC} đã giao hàng tài trợ cho cơ sở y tế/đơn vị nhận tài trợ: ${oDataRoot.ShipToPartyName}</XacNhan>
                                                   </SubFormContent>
                                                   <SubformTaiTro>
                                                      <TaiTroYTe>${oDataRoot.TaiTroYTe}</TaiTroYTe>
                                                      <TaiTroThietBi>${oDataRoot.TaiTroThuoc}</TaiTroThietBi>
                                                      <TaiTroTien>${oDataRoot.TaiTroTien}</TaiTroTien>
                                                   </SubformTaiTro>
                                                   <SubformTable>
                                                      <Table1>
                                                         <HeaderRow/>
                                                         ${lstItem}
                                                      </Table1>
                                                   </SubformTable>
                                                   <SubformFooter>
                                                      <BienBanLap>Biên bản này được lập hồi ${time.getHours()}h${time.getMinutes()} tại TP. HCM, ngày ${time.getDate()} tháng ${time.getMonth() + 1} năm ${time.getFullYear()} và được lập thành 03 bản như nhau, mỗi bên giữ 01 bản.</BienBanLap>
                                                   </SubformFooter>
                                                   <SubformKyTen>
                                                      <Subform1/>
                                                      <Subform2/>
                                                      <Subform3/>
                                                   </SubformKyTen>
                                                </form1>`
                        
                                                console.log('Table: ', xml);
                                                var dataEncode = window.btoa(unescape(encodeURIComponent(xml)))
                                                var raw = JSON.stringify({
                                                    "id": `${oDataRoot.DeliveryDocument}${thisController.flag}`,
                                                    "report": "NGHIEMTHU",
                                                    "xdpTemplate": "NGHIEMTHU/NGHIEMTHU",
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
                                                        thisController._PDFViewer = new sap.m.PDFViewer({
                                                                width: "auto",
                                                                source: _pdfurl,
                                                            });
                                                            jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                                                        
                                                            thisController._PDFViewer.downloadPDF();
                                                            thisController.busyDialog.close();

                                                    },
                                                    error: function (data) {
                                                        thisController.busyDialog.close();
                                                        console.log('message Error' + JSON.stringify(data));
                                                    }
                                                });
                                    }
                                }
                            })
                        }
                    })
                })
            },
            PrintTest: async function (){
                window.location = ''
            }
        }
    }
)
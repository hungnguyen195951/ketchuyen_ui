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
            busyDialog: null,
            UnitDialog:null,
            downloafFlag:false,
            preViewFlag: false,
            dataFinal: {},
            aContextsGob:{},
            arrSumGob:[],
            arrShowAll:[],
            flag:1,
            VND : new Intl.NumberFormat('en-DE'),
            onInit: function(oEvent){
                Fragment.load({
                    id: "idBusyDialogTaiTroYTe",
                    name: "zsdtaitroytev2.controller.fragment.Busy",
                    type: "XML",
                    controller: this
                }).then((oDialog) => {
                        this.busyDialog = oDialog;
                        //this.busyDialog.open();

                }).catch(error => alert(error.message));
                Fragment.load({
                    id: "idUnit",
                    name: "zsdtaitroytev2.controller.fragment.Unit",
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
            onInitSmartFilterBarExtension: function (oEvent) {
                //Get SmartFilterBar
                var oGlobalFilter = oEvent.getSource();
                var oDefaultFilter = {
                   "Plant": {
                      "ranges": [{
                         "exclude": false,
                         "operation": "EQ",
                         "keyField": "Plant",
                         "value1": 1000,
                         "value2": null
                      },
                      {
                         "exclude": false,
                         "operation": "EQ",
                         "keyField": "Plant",
                         "value1": 1100,
                         "value2": null
                      }]
                   }
                };
                //Set SmartFilterBar initial values
                oGlobalFilter.setFilterData(oDefaultFilter);
             },
            Print:  async function (oEvent) {
                let thisController = this
                thisController.busyDialog.open()
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
                                        if ((result[groupKey] !== undefined && obj.HigherLvlItmOfBatSpltItm != '0') || (result[groupKey] !== undefined && obj.HSD && obj.LotNo) ) { //&& 
                                            obj.SoLuong = result[groupKey];
                                            delete result[groupKey]; // Đánh dấu đã sử dụng giá trị này để tránh gán lại
                                            return true;
                                        }
                                        return false;
                                    });
                                    console.log("Kết quả: ",arrSumQuantity)
                                    if(oDataRoot.quyDoi == '0'){
                                        arrSumQuantity.forEach(element=>{
                                            var ngayHoaDon = element.NgayHoaDon ? `${element.NgayHoaDon.getDate()}-${element.NgayHoaDon.getMonth() +1}-${element.NgayHoaDon.getFullYear()}` : ''
                                            if (element.HSD != '' && element.HSD !== 0 && element.HSD && element.HSD !== '0') {
                                                var arr = element.HSD.split("")
                                                console.log('Hạn sử dụng', arr)
                                                var nam = `${arr[0]}${arr[1]}${arr[2]}${arr[3]}`
                                                var thang = `${arr[4]}${arr[5]}`
                                                var ngay = `${arr[6]}${arr[7]}`
                                                var xmlItem = `<Row1>
                                                                    <STT>${stt}</STT>
                                                                    <TenSanPham><![CDATA[${element.Material} - ${element.ProductName}]]></TenSanPham>
                                                                    <SoLuong>${element.SoLuong}</SoLuong>
                                                                    <DVT>${element.DeliveryQuantityUnit}</DVT>
                                                                    <DonGia>${thisController.VND.format(element.DonGia)}</DonGia>
                                                                    <SoHoaDon>${element.SoHoaDon}</SoHoaDon>
                                                                    <NgayHoaDon>${ngayHoaDon}</NgayHoaDon>
                                                                    <SoLo><![CDATA[${element.LotNo}]]></SoLo>
                                                                    <HSD>${ngay}-${thang}-${nam}</HSD>
                                                                    <GiaTri>${thisController.VND.format(element.DonGia * element.SoLuong)}</GiaTri>
                                                                </Row1>`
                                            }
                                            else{
                                                var xmlItem = `<Row1>
                                                <STT>${stt}</STT>
                                                <TenSanPham><![CDATA[${element.Material} - ${element.ProductName}]]></TenSanPham>
                                                <SoLuong>${element.SoLuong}</SoLuong>
                                                <DVT>${element.DeliveryQuantityUnit}</DVT>
                                                <DonGia>${thisController.VND.format(element.DonGia)}</DonGia>
                                                <SoHoaDon>${element.SoHoaDon}</SoHoaDon>
                                                <NgayHoaDon>${ngayHoaDon}</NgayHoaDon>
                                                <SoLo><![CDATA[${element.LotNo}]]></SoLo>
                                                <HSD>${element.HSD}</HSD>
                                                <GiaTri>${thisController.VND.format(element.DonGia * element.SoLuong)}</GiaTri>
                                            </Row1>`
                                            }
                                            lstItem += xmlItem                  
                                            stt+=1
                                        })
                                        console.log("LstXmlItem:",lstItem)
                                                var time = new Date()
                                                var tenNCC = oDataRoot.TenNCC + ' (PHYTOPHARMA)'
                                                var xml = `<?xml version="1.0" encoding="UTF-8"?>
                                                <form1>
                                                   <SubformHeader>
                                                      <OD>${oDataRoot.DeliveryDocument}</OD>
                                                   </SubformHeader>
                                                   <SubFormContent>
                                                      <TextField1></TextField1>
                                                      <DonViNhan><![CDATA[${oDataRoot.ShipToPartyName}]]></DonViNhan>
                                                      <DiaChiDonViNhan>${oDataRoot.DiaChiKhachHang}</DiaChiDonViNhan>
                                                      <MSTDonViNhan>${oDataRoot.TaxNumber1}</MSTDonViNhan>
                                                      <TenNCC>${oDataRoot.TenNCC}</TenNCC>
                                                      <DiaChiNCC>${oDataRoot.DiaChiNCC}</DiaChiNCC>
                                                      <SDTNCC>${oDataRoot.SDTNCC}</SDTNCC>
                                                      <FAXNCC>${oDataRoot.FAX}</FAXNCC>
                                                      <MSTNCC>${oDataRoot.taxNCC}</MSTNCC>
                                                      <Subform4>
                                                      <XacNhan>${tenNCC}</XacNhan>
                                                      <XacNhan1>${oDataRoot.ShipToPartyName}</XacNhan1>
                                                   </Subform4>
                                                   </SubFormContent>
                                                   <SubformTaiTro>
                                                      <TaiTroYTe><![CDATA[${oDataRoot.TaiTroYTe}]]></TaiTroYTe>
                                                      <TaiTroThietBi><![CDATA[${oDataRoot.TaiTroThuoc}]]></TaiTroThietBi>
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
                                                    "id": `${oDataRoot.DeliveryDocument}`,
                                                    "report": "BIENBANYTE",
                                                    "xdpTemplate": "BIENBANYTE/BIENBANYTE",
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
                                    else if(oDataRoot.quyDoi == '1'){
                                        console.log('Đã vào quy đổi 1')
                                        console.log('DaaTa Quy đổi:',oDataItem)
                                        var url = `https://${window.location.hostname}/sap/opu/odata/sap/ZSD_API_DONVIQUYDOI`
                                        var oModelData = new sap.ui.model.odata.v2.ODataModel( url , { json : true });
                                        var arrDataFilter = []
                                        //var arrDataView = []
                                        arrSumQuantity.forEach(element=>{
                                            arrDataFilter.push(new Filter("Product", "EQ", element.Material))
                                        })
                                        console.log("Data filter",arrDataFilter)
                                        console.log("Data arrSumQuantity",arrSumQuantity)
                                        oModelData.read('/ZSD_I_DONVIQUYDOI',{
                                            filters: arrDataFilter,
                                            success:function (data){
                                                var mergedData = {};
                                                data.results.forEach(e=>{
                                                    var key = e.Product
                                                    if (!mergedData[key]) {
                                                        mergedData[key] = { Product: e.Product, AlternativeUnit: [{unit:e.AlternativeUnit}], QuantityNumerator: e.QuantityNumerator, QuantityDenominator: e.QuantityDenominator };
                                                    }else{
                                                        mergedData[key].AlternativeUnit.push({unit:e.AlternativeUnit});
                                                    }
                                                })
                                                console.log("MergedDaata",mergedData)
                                                var resultArray = Object.values(mergedData);
                                                
                                                thisController.dataFinal.result = resultArray
                                                console.log("Result Data:",resultArray)
                                                let oModel = new JSONModel(thisController.dataFinal);
                                                console.log("Model:",oModel)
                                                thisController.UnitDialog.setModel(oModel, "DonVi")
                                                thisController.UnitDialog.open()
                                                thisController.busyDialog.close()
                                                thisController.aContextsGob = aContexts
                                                thisController.arrSumGob = arrSumQuantity
                                                thisController.flag = 1
                                            }
                                        })
                                    }
                                    else{
                                        console.log("Đã vào quy đổi 2")
                                        thisController.UnitDialog.open()
                                        var url = `https://${window.location.hostname}/sap/opu/odata/sap/ZSD_API_DONVIQUYDOI`
                                        var oModelData = new sap.ui.model.odata.v2.ODataModel( url , { json : true });
                                        var arrDataFilter = []
                                        //var arrDataView = []
                                        arrSumQuantity.forEach(element=>{
                                            arrDataFilter.push(new Filter("Product", "EQ", element.Material))
                                        })
                                        oModelData.read('/ZSD_I_DONVIQUYDOI',{
                                            filters: arrDataFilter,
                                            success:function (data){
                                                var mergedData = {};
                                                data.results.forEach(e=>{
                                                    var key = e.Product
                                                    if (!mergedData[key]) {
                                                        mergedData[key] = { Product: e.Product, AlternativeUnit: [{unit:e.AlternativeUnit}], QuantityNumerator: e.QuantityNumerator, QuantityDenominator: e.QuantityDenominator };
                                                    }else{
                                                        mergedData[key].AlternativeUnit.push({unit:e.AlternativeUnit});
                                                    }
                                                })
                                                console.log("MergedDaata",mergedData)
                                                var resultArray = Object.values(mergedData);
                                                
                                                thisController.dataFinal.result = resultArray
                                                console.log("Result Data:",resultArray)
                                                let oModel = new JSONModel(thisController.dataFinal);
                                                console.log("Model:",oModel)
                                                thisController.UnitDialog.setModel(oModel, "DonVi")
                                                thisController.UnitDialog.open()
                                                thisController.busyDialog.close()
                                                thisController.aContextsGob = aContexts
                                                thisController.arrSumGob = arrSumQuantity
                                                thisController.arrShowAll = arrSumQuantity
                                                thisController.flag = 2
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                })
            },
            onCloseDialog: async function(oEvent){
                this.UnitDialog.close()
            },
            Download: async function(oEvent){
                this.UnitDialog.close()
                this.busyDialog.open()
                let thisController = this
                this.aContextsGob.forEach(element => {
                    var dataModel = new sap.ui.model.odata.v2.ODataModel( `https://${window.location.hostname}/sap/opu/odata/sap/ZSD_UINGHIEMTHU_O2` , { json : true });
                    var urlAPI = `https://${window.location.hostname}/sap/opu/odata/sap/ZSD_API_DONVIQUYDOI_O2`
                    var oModelDataAPI = new sap.ui.model.odata.v2.ODataModel( urlAPI , { json : true });
                    let oModel = element.getModel()
                    var arrLineReport = []
                    var lstItem = ''
                    var stt = 1
                    var newArrData= []
                    oModel.read(`${element.getPath()}`, {
                        success: async function (oDataRoot, oResponse) {
                            oModel.read(`${element.getPath()}/to_Item`, {
                                success: async function (oDataItem, oResponse) {
                                    var waitXmltData = new Promise((resovle,reject)=>{
                                        thisController.dataFinal.result.forEach(e=>{
                                            thisController.arrSumGob.forEach(r=>{
                                                if(e.Product == r.Material){
                                                    console.log("Loại đơn giá:",typeof r.DonGia)
                                                    console.log("Loại đơn giá:",parseFloat( r.DonGia))
                                                    oModelDataAPI.read(`/ZSD_I_QUYDOISOLUONG_YTE(productParam='${e.Product}',AlterUnit='${e.selected}',donGia=${parseFloat(r.DonGia)},quantity=${r.SoLuong}M)/Set`,{
                                                        success: function (result,error){
                                                            var dataLineReport ={}
                                                            var key = `${r.Material}-${e.selected}}`
                                                            if(!dataLineReport[key]){
                                                                dataLineReport = {Material:r.Material,ProductName:r.ProductName ,DVT:e.selected,SoLuong:result.results[0].newQuantity,DonGia:result.results[0].newDonGia, LotNo: r.LotNo, HSD: r.HSD,SoHoaDon:r.SoHoaDon,NgayHoaDon:r.NgayHoaDon}                                                            
                                                                console.log("Result API",result)
                                                                arrLineReport.push(dataLineReport)
                                                                // newArrData = arrLineReport
                                                                resovle(arrLineReport)
                                                            }
                                                        }
                                                    })
                                                }
                                            })
                                        })
                                        
                                    })
                                    waitXmltData.then((data)=>{
                                        var sortedArray = []
                                        if(thisController.flag == 1){
                                            sortedArray = data
                                        }
                                        if(thisController.flag == 2){
                                            var arrTemp = []
                                            thisController.arrShowAll.forEach(r=>{
                                                var temp = {}
                                                temp = {Material:r.Material, ProductName:r.ProductName, DVT:r.DeliveryQuantityUnit, SoLuong:r.SoLuong, LotNo:r.LotNo, HSD:r.HSD,SoHoaDon:r.SoHoaDon,NgayHoaDon:r.NgayHoaDon,DonGia:r.DonGia}
                                                arrTemp.push(temp)
                                            })
                                            data.forEach(r=>{
                                                var temp = {}
                                                temp = {Material:r.Material, ProductName:r.ProductName, DVT:r.DVT, SoLuong:r.SoLuong, LotNo:r.LotNo, HSD:r.HSD,SoHoaDon:r.SoHoaDon,NgayHoaDon:r.NgayHoaDon,DonGia:r.DonGia}
                                                arrTemp.push(temp)
                                            })
                                            // Gộp dữ liệu theo MaHang và DonVi
                                            const groupedData = arrTemp.reduce((result, current) => {
                                                const key = current.Material + current.DVT;
                                                if (!result[key]) {
                                                result[key] = { ...current, SoLuong: 0 };
                                                }
                                                result[key].SoLuong = Number(current.SoLuong);
                                                result[key].DonGia = Number(current.DonGia)
                                                return result;
                                            }, {});
                                            
                                            // Chuyển dữ liệu từ object thành mảng
                                            const mergedArray = Object.values(groupedData);
                                            
                                            // Sắp xếp theo MaHang
                                            sortedArray = mergedArray.sort((a, b) => a.Material.localeCompare(b.Material));
                                        }
                                        console.log("Test số lượng array:",sortedArray)
                                        sortedArray.forEach(element=>{
                                            var ngayHoaDon = element.NgayHoaDon ? `${element.NgayHoaDon.getDate()}-${element.NgayHoaDon.getMonth() +1}-${element.NgayHoaDon.getFullYear()}` : ''
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
                                                                    <DVT>${element.DVT}</DVT>
                                                                    <DonGia>${thisController.VND.format(element.DonGia)}</DonGia>
                                                                    <SoHoaDon>${element.SoHoaDon}</SoHoaDon>
                                                                    <NgayHoaDon>${ngayHoaDon}</NgayHoaDon>
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
                                                <DVT>${element.DVT}</DVT>
                                                <DonGia>${thisController.VND.format(element.DonGia)}</DonGia>
                                                <SoHoaDon>${element.SoHoaDon}</SoHoaDon>
                                                <NgayHoaDon>${ngayHoaDon}</NgayHoaDon>
                                                <SoLo>${element.LotNo}</SoLo>
                                                <HSD>${element.HSD}</HSD>
                                                <GiaTri>${thisController.VND.format(element.DonGia * element.SoLuong)}</GiaTri>
                                            </Row1>`
                                            }
                                            lstItem += xmlItem                
                                            stt+=1
                                        })
                                        console.log("XML item:",lstItem)
                                        //Dữ liệu cung cấp cho api number to word
                                        var rawAmoutWords = JSON.stringify({
                                            "amount": 10,
                                            "waers": 'VND',
                                            "lang": "VI"
                                        });
                                        console.log("OdataRooot:",oDataRoot)
                                        var url_amountWords = "https://" + window.location.hostname + "/sap/bc/http/sap/zcore_api_amount_in_words?=";
                                        console.log(url_amountWords)
                                        $.ajax({
                                            url: url_amountWords,
                                            type: "POST",
                                            contentType: "application/json",
                                            data: rawAmoutWords,
                                            success: function (resp, textStatus, jqXHR) {
                                                var dataWord = JSON.parse(resp);
                                                var time = new Date();
                                                var tenNCC = oDataRoot.TenNCC + ' (PHYTOPHARMA)'
                                                var xml = `<?xml version="1.0" encoding="UTF-8"?>
                                                <form1>
                                                   <SubformHeader>
                                                      <OD>OD: ${oDataRoot.DeliveryDocument}</OD>
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
                                                      <Subform4>
                                                      <XacNhan>${tenNCC}</XacNhan>
                                                      <XacNhan1>${oDataRoot.ShipToPartyName}</XacNhan1>
                                                   </Subform4>
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
                                                    "report": "BIENBANYTE",
                                                    "xdpTemplate": "BIENBANYTE/BIENBANYTE",
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
                                            },
                                            error: function (data) {
                                                thisController.busyDialog.close();
                                                console.log('message Error' + JSON.stringify(data));
                                            }
                                        });
                                    })
                                   
                                }
                            })
                        }
                    })
                })
                //ZSD_I_QUYDOISOLUONG(productParam='000000000014000010',AlterUnit='Kit',quantity=10M)/Set
                //https://my407293.s4hana.cloud.sap/sap/opu/odata/sap/ZSD_UINGHIEMTHU_O2/ZSD_I_QUYDOISOLUONG(productParam='000000000014000010',AlterUnit='Kit',quantity=10M)/Set
                    // console.log("Data acontext G:",this.aContextsGob)
                    // console.log("array Data G:",this.arrSumGob)
                    // console.log("DataFInal Root:",this.dataFinal.result)
                    
                    // 
            }
        }
    }
)
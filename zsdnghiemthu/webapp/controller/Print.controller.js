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
            //time: new Date(),
            onInit: function(oEvent){
                Fragment.load({
                    id: "idBusyDialogBanGiaoNghiemThu",
                    name: "zsdnghiemthu.controller.fragment.Busy",
                    type: "XML",
                    controller: this
                }).then((oDialog) => {
                        this.busyDialog = oDialog;
                        //this.busyDialog.open();

                }).catch(error => alert(error.message));
                Fragment.load({
                    id: "idUnit",
                    name: "zsdnghiemthu.controller.fragment.Unit",
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
                console.log("Data type of aCOntext:",typeof aContexts)
                aContexts.forEach(element => {
                    let oModel = element.getModel()

                    oModel.read(`${element.getPath()}`, {
                        success: async function (oDataRoot, oResponse) {
                            var lstItem = '';
                            var sumTienHang = 0;
                            var tongSoLuong = 0;
                            var tongCong = 0;
                            console.log(oDataRoot)
                            
                            oModel.read(`${element.getPath()}/to_Item`, {
                                success: async function (oDataItem, oResponse) {
                                    var stt = 1;
                                    var lstItem = ''
                                    var count = 1
                                    var arr = []
                                    var sumSoLuong = 0
                                    const result = {};
                                    console.log("Odataa Items:",oDataItem)
                                    oDataItem.results.forEach(data => {
                                        // Tạo khóa nhóm bằng cách kết hợp MaHang và DonViTinh
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
                                        if (result[groupKey] !== undefined && obj.HSD) {
                                            obj.SoLuong = result[groupKey];
                                            delete result[groupKey]; // Đánh dấu đã sử dụng giá trị này để tránh gán lại
                                            return true;
                                        }
                                        return false;
                                    });
                                    console.log("Kết quả: ",arrSumQuantity)
                                    var xmlPromise = new Promise((resovle,reject)=>{
                                        if(oDataRoot.quyDoi == '0'){
                                            arrSumQuantity.forEach(element=>{
                                                if (element.HSD != '' && element.HSD !== 0 && element.HSD && element.HSD !== '0') {
                                                    var arr = element.HSD.split("")
                                                    console.log('Hạn sử dụng', arr)
                                                    var nam = `${arr[0]}${arr[1]}${arr[2]}${arr[3]}`
                                                    var thang = `${arr[4]}${arr[5]}`
                                                    var ngay = `${arr[6]}${arr[7]}`
                                                    var xmlItem = `<RowData>
                                                                    <txtSTT>${stt}</txtSTT>
                                                                    <txtTenHangHoa>${element.Material} - ${element.ProductName}</txtTenHangHoa>
                                                                    <txtDVT>${element.DeliveryQuantityUnit}</txtDVT>
                                                                    <txtSoLuong>${element.SoLuong}</txtSoLuong>
                                                                    <txtSoLo>${element.LotNo}</txtSoLo>
                                                                    <txtHanDung>${ngay}-${thang}-${nam}</txtHanDung>
                                                                </RowData>`
                                                }
                                                else{
                                                    var xmlItem = `<RowData>
                                                                    <txtSTT>${stt}</txtSTT>
                                                                    <txtTenHangHoa>${element.Material} - ${element.ProductName}</txtTenHangHoa>
                                                                    <txtDVT>${element.DeliveryQuantityUnit}</txtDVT>
                                                                    <txtSoLuong>${element.SoLuong}</txtSoLuong>
                                                                    <txtSoLo>${element.LotNo}</txtSoLo>
                                                                    <txtHanDung>${element.HSD}</txtHanDung>
                                                                </RowData>`
                                                }
                                                lstItem += xmlItem                
                                                stt+=1
                                            })
                                            //Dữ liệu cung cấp cho api number to word
                                            var rawAmoutWords = JSON.stringify({
                                                "amount": `${tongCong}`,
                                                "waers": `${oDataRoot.CompanyCodeCurrency}`,
                                                "lang": "VI"
                                            });
                                            var url_amountWords = "https://" + window.location.hostname + "/sap/bc/http/sap/zcore_api_amount_in_words?=";
                                            console.log(url_amountWords)
                                            $.ajax({
                                                url: url_amountWords,
                                                type: "POST",
                                                contentType: "application/json",
                                                data: rawAmoutWords,
                                                success: function (resp, textStatus, jqXHR) {
                                                    var dataWord = JSON.parse(resp);
                                                    var time = new Date()
                                                    var xml = `<?xml version="1.0" encoding="UTF-8"?>
                                                                    <form1>
                                                                    <SubformHeader>
                                                                        <OD>OD: ${oDataRoot.DeliveryDocument}</OD>
                                                                    </SubformHeader>
                                                                    <SubformIntro>
                                                                        <txtIntro>- Căn cứ theo thoả thuận hợp tác giữa ${oDataRoot.TenCongTy} và ${oDataRoot.ShipToPartyName} về việc ${oDataRoot.NoiDung}</txtIntro>
                                                                    </SubformIntro>
                                                                    <SubformContent>
                                                                        <txtNameDonViCC>${oDataRoot.TenCongTy}</txtNameDonViCC>
                                                                        <txtDiaChiDVCC>${oDataRoot.DiaChiNCC}</txtDiaChiDVCC>
                                                                        <txtSDTDVCC>${oDataRoot.SDTNCC}</txtSDTDVCC>
                                                                        <txtMSTDVCC>${oDataRoot.taxNCC}</txtMSTDVCC>
                                                                        <txtDaiDienBenGiao>${oDataRoot.DaiDienBenGiao}</txtDaiDienBenGiao>
                                                                        <txtNameCus>${oDataRoot.ShipToPartyName}</txtNameCus>
                                                                        <txtDiaChiCus>${oDataRoot.DiaChiKhachHang}</txtDiaChiCus>
                                                                        <txtSDTCus>${oDataRoot.TelephoneNumber1}</txtSDTCus>
                                                                        <txtMSTCus>${oDataRoot.TaxNumber1}</txtMSTCus>
                                                                        <TimeField12>${oDataRoot.DaiDienBenNhan}</TimeField12>
                                                                        <txtChucVuCus>${oDataRoot.ChucVuBenNhan}</txtChucVuCus>
                                                                    </SubformContent>
                                                                    <txtNgayThangNam>${oDataRoot.ActualGoodsMovementDate ? `Hôm nay, ngày ${oDataRoot.ActualGoodsMovementDate.getDate()} tháng ${oDataRoot.ActualGoodsMovementDate.getMonth() + 1} năm ${oDataRoot.ActualGoodsMovementDate.getFullYear()}, chúng tôi gồm có:`:'Hôm nay, chúng tôi gồm có:'}</txtNgayThangNam>
                                                                    <SubFormTable>
                                                                        <Table1>
                                                                            <HeaderRow/>
                                                                            ${lstItem}
                                                                        </Table1>
                                                                        </SubFormTable>
                                                                        <SubFormFooter>
                                                                        <txtSoHoaDon>${oDataRoot.SoHoaDon}</txtSoHoaDon>
                                                                        <CheckBox4>0</CheckBox4>
                                                                        <CheckBox3>0</CheckBox3>
                                                                        <CheckBox1>0</CheckBox1>
                                                                        <CheckBox2>0</CheckBox2>
                                                                        <txtTimeLapBB>Biên bản kết thúc lúc ${time.getHours()} giờ ${time.getMinutes()} phút cùng ngày.</txtTimeLapBB>
                                                                        <SignA/>
                                                                        <SignB/>
                                                                        </SubFormFooter>
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
                                                    console.log(data.results)
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
                                        resovle(lstItem)
                                    })
                                    xmlPromise.then((lstItem)=>{
                                        console.log('List bData Line Item:',lstItem)
                                                
                                    })
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
                    let oModel = element.getModel()
                    var arrLineReport = []
                    var lstItem = ''
                    var stt = 1
                    var newArrData= []
                    oModel.read(`${element.getPath()}`, {
                        success: async function (oDataRoot, oResponse) {
                            oModel.read(`${element.getPath()}/to_Item`, {
                                success: async function (oDataItem, oResponse) {
                                    console.log( thisController.dataFinal)
                                    var waitXmltData = new Promise((resovle,reject)=>{
                                        thisController.dataFinal.result.forEach(e=>{
                                            thisController.arrSumGob.forEach(r=>{
                                                if(e.Product == r.Material){
                                                    dataModel.read(`/ZSD_I_QUYDOISOLUONG(productParam='${e.Product}',AlterUnit='${e.selected}',quantity=${r.SoLuong}M)/Set`,{
                                                        success: function (result,error){
                                                            var dataLineReport ={}
                                                            var key = `${r.Material}-${e.selected}}`
                                                            if(!dataLineReport[key]){
                                                                dataLineReport = {Material:r.Material,ProductName:r.ProductName ,DVT:e.selected,SoLuong:result.results[0].newQuantity, LotNo: r.LotNo, HSD: r.HSD}                                                            
                                                                
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
                                                temp = {Material:r.Material, ProductName:r.ProductName, DVT:r.DeliveryQuantityUnit, SoLuong:r.SoLuong, LotNo:r.LotNo, HSD:r.HSD}
                                                arrTemp.push(temp)
                                            })
                                            data.forEach(r=>{
                                                var temp = {}
                                                temp = {Material:r.Material, ProductName:r.ProductName, DVT:r.DVT, SoLuong:r.SoLuong, LotNo:r.LotNo, HSD:r.HSD}
                                                arrTemp.push(temp)
                                            })
                                            // Gộp dữ liệu theo MaHang và DonVi
                                            const groupedData = arrTemp.reduce((result, current) => {
                                                const key = current.Material + current.DVT;
                                                if (!result[key]) {
                                                result[key] = { ...current, SoLuong: 0 };
                                                }
                                                result[key].SoLuong = Number(current.SoLuong);
                                                return result;
                                            }, {});
                                            
                                            // Chuyển dữ liệu từ object thành mảng
                                            const mergedArray = Object.values(groupedData);
                                            
                                            // Sắp xếp theo MaHang
                                            sortedArray = mergedArray.sort((a, b) => a.Material.localeCompare(b.Material));
                                        }
                                        console.log("Test số lượng array:",sortedArray)
                                        sortedArray.forEach(e=>{
                                            if (e.HSD != '' && e.HSD !== 0 && e.HSD && e.HSD !== '0') {
                                                var arr = e.HSD.split("")
                                                console.log('Hạn sử dụng', arr)
                                                var nam = `${arr[0]}${arr[1]}${arr[2]}${arr[3]}`
                                                var thang = `${arr[4]}${arr[5]}`
                                                var ngay = `${arr[6]}${arr[7]}`
                                                var xmlItem = `<RowData>
                                                                <txtSTT>${stt}</txtSTT>
                                                                <txtTenHangHoa><![CDATA[${e.Material} - ${e.ProductName}]]></txtTenHangHoa>
                                                                <txtDVT>${e.DVT}</txtDVT>
                                                                <txtSoLuong>${e.SoLuong}</txtSoLuong>
                                                                <txtSoLo>${e.LotNo}</txtSoLo>
                                                                <txtHanDung>${ngay}-${thang}-${nam}</txtHanDung>
                                                            </RowData>`
                                            }
                                            else{
                                                var xmlItem = `<RowData>
                                                                <txtSTT>${stt}</txtSTT>
                                                                <txtTenHangHoa><![CDATA[${e.Material} - ${e.ProductName}]]></txtTenHangHoa>
                                                                <txtDVT>${e.DVT}</txtDVT>
                                                                <txtSoLuong>${e.SoLuong}</txtSoLuong>
                                                                <txtSoLo>${e.LotNo}</txtSoLo>
                                                                <txtHanDung>${e.HSD}</txtHanDung>
                                                            </RowData>`
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
                                                var xml = `<?xml version="1.0" encoding="UTF-8"?>
                                                                <form1>
                                                                <SubformHeader>
                                                                    <OD>OD: ${oDataRoot.DeliveryDocument}</OD>
                                                                </SubformHeader>
                                                                <SubformIntro>
                                                                    <txtIntro><![CDATA[- Căn cứ theo thoả thuận hợp tác giữa ${oDataRoot.TenCongTy} và ${oDataRoot.ShipToPartyName} về việc ${oDataRoot.NoiDung}]]></txtIntro>
                                                                </SubformIntro>
                                                                <SubformContent>
                                                                    <txtNameDonViCC><![CDATA[${oDataRoot.TenCongTy}]]></txtNameDonViCC>
                                                                    <txtDiaChiDVCC><![CDATA[${oDataRoot.DiaChiNCC}]]></txtDiaChiDVCC>
                                                                    <txtSDTDVCC>${oDataRoot.SDTNCC}</txtSDTDVCC>
                                                                    <txtMSTDVCC>${oDataRoot.taxNCC}</txtMSTDVCC>
                                                                    <txtDaiDienBenGiao>${oDataRoot.DaiDienBenGiao}</txtDaiDienBenGiao>
                                                                    <txtNameCus>${oDataRoot.ShipToPartyName}</txtNameCus>
                                                                    <txtDiaChiCus>${oDataRoot.DiaChiKhachHang}</txtDiaChiCus>
                                                                    <txtSDTCus>${oDataRoot.TelephoneNumber1}</txtSDTCus>
                                                                    <txtMSTCus>${oDataRoot.TaxNumber1}</txtMSTCus>
                                                                    <TimeField12>${oDataRoot.DaiDienBenNhan}</TimeField12>
                                                                    <txtChucVuCus>${oDataRoot.ChucVuBenNhan}</txtChucVuCus>
                                                                </SubformContent>
                                                                <txtNgayThangNam>Hôm nay, ngày ${oDataRoot.ActualGoodsMovementDate.getDate()} tháng ${oDataRoot.ActualGoodsMovementDate.getMonth() + 1} năm ${oDataRoot.ActualGoodsMovementDate.getFullYear()}, chúng tôi gồm có:</txtNgayThangNam>
                                                                <SubFormTable>
                                                                    <Table1>
                                                                        <HeaderRow/>
                                                                        ${lstItem}
                                                                    </Table1>
                                                                    </SubFormTable>
                                                                    <SubFormFooter>
                                                                    <txtSoHoaDon>${oDataRoot.SoHoaDon}</txtSoHoaDon>
                                                                    <CheckBox4>0</CheckBox4>
                                                                    <CheckBox3>0</CheckBox3>
                                                                    <CheckBox1>0</CheckBox1>
                                                                    <CheckBox2>0</CheckBox2>
                                                                    <txtTimeLapBB>Biên bản kết thúc lúc ${time.getHours()} giờ ${time.getMinutes()} phút cùng ngày.</txtTimeLapBB>
                                                                    <SignA/>
                                                                    <SignB/>
                                                                    </SubFormFooter>
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
            },
            //Download: async function(element){}

            
        }
    }
)
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/odata/v2/ODataModel',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    './xlsx/xlsx',
    './xlsx/xlsx.bundle',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, ODataModel, Filter, FilterOperator, MessageBox, MessageToast, Fragment) {
        "use strict";

        return Controller.extend("zfisoquyv2.controller.Main", {
            onInit: function () {
            },
            onAfterVariantLoad: function (oSource) {
                var oSmartFilterBar = oSource.getSource();
                var oInitialValues = oSmartFilterBar.getFilterData();
                //console.log('onInitSmartFilterBarExtension')
                // Thiết lập giá trị mặc định cho trường FiscalYear
                oInitialValues['$Parameter.NgayMoSo'] = new Date();
                // Cập nhật giá trị mặc định trở lại vànew Date(o Smart Filter Bar
                //console.log("Data filter",oInitialValues)
                oInitialValues['$Parameter.IsIncludeReversed'] = false;
                oSmartFilterBar.setFilterData(oInitialValues);
                //oSmartFilterBar.search();
            },
            arrItemFilter: [],
            busyDialog: null,
            nameAccount: [],
            flag: 0,
            count: 0,
            mapData: new Map(),
            arrHeaderData: [],
            lstGlaccount: [],
            arrData: [],
            i:0, // i for read model
            flagReadModel:false,
            checkReadModel:false,
            onPress: function () {
                const lstObjData = this.getView().byId("smartFilterBar").getFilterData()
                if (lstObjData['$Parameter.ToDate'] < lstObjData['$Parameter.FromDate']) {
                    MessageToast.show('Ngày bắt đầu không được lớn hơn ngày kết thúc.')
                    return
                }
                const VND = new Intl.NumberFormat('en-DE');
                var waitFormatIn = new Promise((resolve, reject) => {
                    MessageBox.information("Hãy chọn định dạng in.", {
                        actions: ["VND & Ngoại tệ", "VND", "Huỷ"],
                        emphasizedAction: "VND & Ngoại tệ",
                        // initialFocus: MessageBox.Action.PREVIEW,
                        onClose: async function (sAction) {
                            if (sAction == "VND & Ngoại tệ") {
                                this.flag = 2
                                resolve(this.flag)
                            }
                            else if (sAction == "VND") {
                                this.flag = 1
                                resolve(this.flag)
                            }
                            else {
                                return
                            }
                        }
                    })
                })
                waitFormatIn.then((form) => {
                    if (!this.busyDialog) {
                        Fragment.load({
                            id: "idBusyDialog1",
                            name: "zfisoquyv2.controller.fragment.Busy",
                            type: "XML",
                            controller: this
                        })
                            .then((oDialog) => {
                                this.busyDialog = oDialog;
                                this.busyDialog.open();

                            })
                            .catch(error => alert(error.message));
                    } else {
                        this.busyDialog.open();
                    }
                    const VND = new Intl.NumberFormat('en-DE');
                    const thatController = this
                    var finalXml = ''
                    var countTest = 0
                    var xmlHeader = ''
                    var headerTonDauKyVND = 0;
                    var headerTonDauKyNT = 0;
                    var headerThuPhatSinhTrongKyVND = 0;
                    var headerThuPhatSinhTrongKyNT = 0;
                    var headerChiPhatSinhTrongKyVND = 0;
                    var headerChiPhatSinhTrongKyNT = 0;
                    var headerTonCuoiKyVND = 0;
                    var headerTonCuoiKyNT = 0;
                    let objData = {}
                    this.getData().then(data => {
                        if (data.size == 0) {
                            MessageToast.show("Không có dữ liệu.")
                            thatController.busyDialog.close();
                            return
                        }
                        data.forEach(result => {
                            console.log("result", result)
                            // var waitLoopModel = new Promise((resolve,reject)=>{
                            //     if(!thatController.flagReadModel){
                            //         this.getData().then(dataLoop => {
                            //             dataLoop.forEach(resultLoop => {
                            //                 result.unshift(resultLoop)
                            //                 resolve(result)
                            //             })
                            //         })
                            //     }else{
                            //         resolve(result)
                            //     }
                            // })
                            // waitLoopModel.then(data=>{
                            //     console.log("DAta Looop Model",data)
                            // })
                            // return
                            var xmlItem = ''
                            var sumThuVND = 0
                            var sumChiVND = 0
                            var sumThuNT = 0
                            var sumChiNT = 0
                            var sumTonCuoiKyVND = 0
                            var sumTonCuoiKyNT = 0
                            var preTonVND = Number(result.headerTonDauKyVND);
                            var preTonNT = Number(result.headerTonDauKyNT);
                            var arrSorted = result.items.sort(function (arr1, arr2) { return arr1.PostingDate - arr2.PostingDate; })
                            arrSorted.forEach(dataLine => {
                                var chiVnd = ''
                                var thuVnd = ''
                                if (dataLine.IsNegativePosting && Number(dataLine.SoTienChiVND != 0)) {
                                    chiVnd = `(${VND.format(Number(Math.abs(dataLine.SoTienChiVND)))})`
                                }
                                else {
                                    chiVnd = VND.format(Number(Math.abs(dataLine.SoTienChiVND)))
                                }
                                if (dataLine.IsNegativePosting && Number(dataLine.SoTienThuVND != 0)) {
                                    thuVnd = `(${VND.format(Number((Math.abs(dataLine.SoTienThuVND))))})`
                                }
                                else {
                                    thuVnd = VND.format(Number(Math.abs(dataLine.SoTienThuVND)))
                                }
                                var chiNT = ''
                                var thuNT = ''
                                if (dataLine.IsNegativePosting && Number(dataLine.SoTienChiNT != 0)) {
                                    chiNT = `(${VND.format(Number(Math.abs(dataLine.SoTienChiNT)))})`
                                }
                                else {
                                    chiNT = VND.format(Number(Math.abs(dataLine.SoTienChiNT)))
                                }
                                if (dataLine.IsNegativePosting && Number(dataLine.SoTienThuNT != 0)) {
                                    thuNT = `(${VND.format(Number(Math.abs(dataLine.SoTienThuNT)))})`
                                }
                                else {
                                    thuNT = VND.format(Number(Math.abs(dataLine.SoTienThuNT)))
                                }
                                preTonVND += (Number(Math.abs(dataLine.SoTienThuVND)) - Number(Math.abs(dataLine.SoTienChiVND)))
                                preTonNT += (Number(Math.abs(dataLine.SoTienThuNT)) - Number(Math.abs(dataLine.SoTienChiNT)))
                                var showPreTonVND = ''
                                var showPreTonNT = ''
                                if (preTonVND < 0) {
                                    showPreTonVND = `(${VND.format(preTonVND * -1)})`
                                } else { showPreTonVND = VND.format(preTonVND) }
                                if (preTonNT < 0) {
                                    showPreTonNT = result.Currency != 'VND' ? `(${VND.format(preTonNT * -1)})` : 0
                                } else { showPreTonNT = result.Currency != 'VND' ? VND.format(preTonNT) : 0 }

                                var lineXml = `<Data>
                                <NgayGhiSo>${dataLine.PostingDate.getDate()}-${dataLine.PostingDate.getMonth() + 1}-${dataLine.PostingDate.getFullYear()}</NgayGhiSo>
                                <NgayChungTu>${dataLine.DocumentDate.getDate()}-${dataLine.DocumentDate.getMonth() + 1}-${dataLine.DocumentDate.getFullYear()}</NgayChungTu>
                                <SoThuChungTu>${dataLine.SoChungTuThu}</SoThuChungTu>
                                <SoChiChungTu>${dataLine.SoChungTuChi}</SoChiChungTu>
                                <TenNguoiNhanTien><![CDATA[${dataLine.TenNguoiNNTien}]]></TenNguoiNhanTien>
                                <MaNguoiNop>${dataLine.MaNguoiNNTien}</MaNguoiNop>
                                <DienGiai><![CDATA[${dataLine.DienGiai}]]></DienGiai>
                                <LoaiTien>${dataLine.TransactionCurrency}</LoaiTien>
                                <ThuVND>${thuVnd}</ThuVND>
                                <ChiVND>${chiVnd}</ChiVND>
                                <TonVND>${showPreTonVND}</TonVND>
                                <ThuNT>${thuNT}</ThuNT>
                                <ChiNT>${chiNT}</ChiNT>
                                <TonNT>${showPreTonNT}</TonNT>
                                </Data>`
                                xmlItem += lineXml
                                sumThuVND += Number(Math.abs(dataLine.SoTienThuVND))
                                sumThuNT += Number(Math.abs(dataLine.SoTienThuNT))
                                sumChiVND += Number(Math.abs(dataLine.SoTienChiVND))
                                sumChiNT += Number(Math.abs(dataLine.SoTienChiNT))
                            })
                            console.log("XML line item", xmlItem)
                            sumTonCuoiKyVND = Number(result.headerTonDauKyVND) + sumThuVND - Math.abs(sumChiVND)
                            sumTonCuoiKyNT = Number(result.headerTonDauKyNT) + sumThuNT - Math.abs(sumChiNT)
                            //Data truyền ra header
                            headerTonDauKyVND += Number(result.headerTonDauKyVND)
                            headerTonDauKyNT += Number(result.headerTonDauKyNT)
                            headerThuPhatSinhTrongKyVND += sumThuVND
                            headerThuPhatSinhTrongKyNT += sumThuNT
                            headerChiPhatSinhTrongKyVND += sumChiVND
                            headerChiPhatSinhTrongKyNT += sumChiNT
                            headerTonCuoiKyVND += sumTonCuoiKyVND
                            headerTonCuoiKyNT += sumTonCuoiKyNT
                            if (sumChiVND < 0) {
                                sumChiVND *= (-1)
                            }
                            if (sumChiNT < 0) {
                                sumChiNT *= (-1)
                            }
                            var showTonDauKyVND = ''
                            var showTonDauKyNT = ''
                            var showTonCuoiKyNT = ''
                            if (Number(result.TonDauKyVND) < 0) {
                                showTonDauKyVND = `(${VND.format(Number(result.headerTonDauKyVND) * (-1))})`
                            } else { showTonDauKyVND = VND.format(Number(result.headerTonDauKyVND)) }
                            if (Number(result.TonDauKyNT) < 0) {
                                showTonDauKyNT = result.Currency != 'VND' ? `(${VND.format(Number(result.headerTonDauKyNT) * (-1))})` : 0
                            } else { showTonDauKyNT = result.Currency != 'VND' ? VND.format(Number(result.headerTonDauKyNT)) : 0 }
                            if (sumTonCuoiKyNT < 0) {
                                showTonCuoiKyNT = result.Currency != 'VND' ? `(${VND.format(sumTonCuoiKyNT * (-1))})` : 0
                            } else { showTonCuoiKyNT = result.Currency != 'VND' ? VND.format(sumTonCuoiKyNT) : 0 }
                            xmlHeader = `<DataTable>
                            <Sum>
                                <TaiKhoan>${result.GLAccount} - ${result.GLAccountLongName}</TaiKhoan>
                            </Sum>
                            <Sum>
                                <Description>Tồn đầu kỳ</Description>
                                <ThuVND></ThuVND>
                                <ChiVND></ChiVND>
                                <TonVND>${showTonDauKyVND}</TonVND>
                                <ThuNT></ThuNT>
                                <ChiNT></ChiNT>
                                <TonNT>${showTonDauKyNT}</TonNT>
                            </Sum>
                            <Sum>
                                <Description>Phát sinh trong kỳ</Description>
                                <ThuVND>${sumThuVND < 0 ? `(${VND.format(Math.abs(sumThuVND))})` : VND.format(Math.abs(sumThuVND))}</ThuVND>
                                <ChiVND>${VND.format(sumChiVND)}</ChiVND>
                                <TonVND></TonVND>
                                <ThuNT>${sumThuNT < 0 ? `(${VND.format(Math.abs(sumThuNT))})` : VND.format(Math.abs(sumThuNT))}</ThuNT>
                                <ChiNT>${VND.format(sumChiNT)}</ChiNT>
                                <TonNT></TonNT>
                            </Sum>
                            <Sum>
                                <Description>Cuối kỳ</Description>
                                <ThuVND></ThuVND>
                                <ChiVND></ChiVND>
                                <TonVND>${sumTonCuoiKyVND < 0 ? `(${(VND.format(Math.abs(sumTonCuoiKyVND)))})` : VND.format(sumTonCuoiKyVND)}</TonVND>
                                <ThuNT></ThuNT>
                                <ChiNT></ChiNT>
                                <TonNT>${showTonCuoiKyNT}</TonNT>
                            </Sum>
                            ${xmlItem}
                            </DataTable> `
                            finalXml += xmlHeader
                            objData.accountName = data.Length > 1 ? '' : `${result.GLAccount}-${result.GLAccountLongName}`
                            objData.headerTonDauKyVND = headerTonDauKyVND
                            objData.headerTonDauKyNT = headerTonDauKyNT
                            objData.headerThuPhatSinhTrongKyVND = headerThuPhatSinhTrongKyVND
                            objData.headerThuPhatSinhTrongKyNT = headerThuPhatSinhTrongKyNT
                            objData.headerChiPhatSinhTrongKyVND = headerChiPhatSinhTrongKyVND
                            objData.headerChiPhatSinhTrongKyNT = headerChiPhatSinhTrongKyNT
                            objData.headerTonCuoiKyVND = headerTonCuoiKyVND
                            objData.headerTonCuoiKyNT = headerTonCuoiKyNT
                            objData.xmlHeader = finalXml
                            objData.nameCompany = result.nameCompany ? result.nameCompany : objData.nameCompany
                            objData.DiaChiCty = result.DiaChiCty ? result.DiaChiCty : objData.DiaChiCty
                            objData.Currency = result.Currency ? result.Currency : objData.Currency
                            objData.GLAccount = result.GLAccount ? result.GLAccount : objData.GLAccount
                            objData.ThuQuy = result.ThuQuy ? result.ThuQuy : objData.ThuQuy
                            objData.KeToan = result.KeToan ? result.KeToan : objData.KeToan
                            objData.ToDate = result.ToDate ? result.ToDate : objData.ToDate
                            objData.FromDate = result.FromDate ? result.FromDate : objData.FromDate
                            objData.NgayMoSo = result.NgayMoSo ? result.NgayMoSo : objData.NgayMoSo
                            objData.NguoiDaiDien = result.NguoiDaiDien ? result.NguoiDaiDien : objData.NguoiDaiDien
                        })
                        var showHeaderTonDauKyVND = ''
                        var showHeaderTonDauKyNT = ''
                        var showHeaderThuPhatSinhTrongKyVND = ''
                        var showHeaderChiPhatSinhTrongKyVND = ''
                        var showHeaderThuPhatSinhTrongKyNT = ''
                        var showHeaderChiPhatSinhTrongKyNT = ''
                        var showHeaderTonCuoiKyVND = ''
                        var showHeaderTonCuoiKyNT = ''
                        if (objData.headerTonDauKyVND < 0) {
                            showHeaderTonDauKyVND = `(${VND.format(objData.headerTonDauKyVND * -1)})`
                        } else { showHeaderTonDauKyVND = VND.format(objData.headerTonDauKyVND) }

                        if (objData.headerTonDauKyNT < 0) {
                            showHeaderTonDauKyNT = objData.Currency != 'VND' ? `(${VND.format(objData.headerTonDauKyNT * -1)})` : 0
                        } else { showHeaderTonDauKyNT = objData.Currency != 'VND' ? VND.format(objData.headerTonDauKyNT) : 0 }

                        if (objData.headerThuPhatSinhTrongKyVND < 0) {
                            showHeaderThuPhatSinhTrongKyVND = `(${VND.format(objData.headerThuPhatSinhTrongKyVND * -1)})`
                        } else { showHeaderThuPhatSinhTrongKyVND = VND.format(objData.headerThuPhatSinhTrongKyVND) }

                        if (objData.headerChiPhatSinhTrongKyVND < 0) {
                            showHeaderChiPhatSinhTrongKyVND = `${VND.format(objData.headerChiPhatSinhTrongKyVND * -1)}`
                        } else { showHeaderChiPhatSinhTrongKyVND = VND.format(objData.headerChiPhatSinhTrongKyVND) }

                        if (objData.headerThuPhatSinhTrongKyNT < 0) {
                            showHeaderThuPhatSinhTrongKyNT = `(${VND.format(objData.headerThuPhatSinhTrongKyNT * -1)})`
                        } else { showHeaderThuPhatSinhTrongKyNT = VND.format(objData.headerThuPhatSinhTrongKyNT) }

                        if (objData.headerChiPhatSinhTrongKyNT < 0) {
                            showHeaderChiPhatSinhTrongKyNT = `${VND.format(objData.headerChiPhatSinhTrongKyNT * -1)}`
                        } else { showHeaderChiPhatSinhTrongKyNT = VND.format(objData.headerChiPhatSinhTrongKyNT) }

                        if (objData.headerTonCuoiKyVND < 0) {
                            showHeaderTonCuoiKyVND = `(${VND.format(objData.headerTonCuoiKyVND * -1)})`
                        } else { showHeaderTonCuoiKyVND = VND.format(objData.headerTonCuoiKyVND) }

                        if (objData.headerTonCuoiKyNT < 0) {
                            showHeaderTonCuoiKyNT = objData.Currency != 'VND' ? `(${VND.format(objData.headerTonCuoiKyNT * -1)})` : 0
                        } else { showHeaderTonCuoiKyNT = objData.Currency != 'VND' ? VND.format(objData.headerTonCuoiKyNT) : 0 }



                        // if(thatController.nameAccount.items){
                        //     if(thatController.nameAccount.items.length <= 1){
                        //         thatController.nameAccount.items.forEach(e=>{
                        //             accountName += `Tài khoản: ${e.key} - ${e.text} `
                        //         })
                        //     }

                        // }
                        // if(thatController.nameAccount.ranges){
                        //     if(thatController.nameAccount.ranges.length <= 1){
                        //         thatController.nameAccount.ranges.forEach(element => {
                        //             accountName += `Tài khoản: ${element.value2}  `
                        //         });
                        //     }

                        // }
                        // if(thatController.nameAccount.value){
                        //     accountName = `Tài khoản: ${thatController.nameAccount.value}`
                        // }
                        var mainXml = `<?xml version="1.0" encoding="UTF-8"?>
                        <form1>
                        <Heading>
                            <Subform2>
                                <nameCty><![CDATA[${objData.nameCompany}]]></nameCty>
                                <addressCty>${objData.DiaChiCty}</addressCty>
                            </Subform2>
                            <Subform3/>
                            <Subform8>
                                <taiKhoan3> ${objData.accountName} </taiKhoan3>
                                <time4>Từ ngày ${objData.FromDate ? `${String(objData.FromDate.getDate()).padStart(2, '0')}-${String(objData.FromDate.getMonth() + 1).padStart(2, '0')}-${objData.FromDate.getFullYear()}` : ''} đến ngày ${objData.ToDate ? `${String(objData.ToDate.getDate()).padStart(2, '0')}-${String(objData.ToDate.getMonth() + 1).padStart(2, '0')}-${objData.ToDate.getFullYear()}` : ''}</time4>
                            </Subform8>
                        </Heading>
                        <Content>
                            <HeaderTable>
                                <Row1>
                                    <Subform9>
                                    <Table8>
                    <Row1/>
                    <Row2/>
                                    </Table8>
                                    </Subform9>
                                    <SoTienVND>
                                    <Table6>
                    <HeaderRow/>
                    <Row1>
                        <Table7>
                            <HeaderRow/>
                        </Table7>
                    </Row1>
                                    </Table6>
                                    </SoTienVND>
                                    <SoTienNT>
                                    <Table6>
                    <HeaderRow/>
                    <Row1>
                        <Table7>
                            <HeaderRow/>
                        </Table7>
                    </Row1>
                                    </Table6>
                                    </SoTienNT>
                                </Row1>
                            </HeaderTable>
                            <SubHeaderTable>
                                <SoTonDauKy>
                                    <TonDauKyHeaderVND>${showHeaderTonDauKyVND}</TonDauKyHeaderVND>
                                    <TonDauKyHeaderNT>${showHeaderTonDauKyNT}</TonDauKyHeaderNT>
                                </SoTonDauKy>
                                <SoPhatSinhTrongKy>
                                    <ThuTrongKyHeaderVND>${showHeaderThuPhatSinhTrongKyVND}</ThuTrongKyHeaderVND>
                                    <ChiTrongKyHeaderVND>${showHeaderChiPhatSinhTrongKyVND}</ChiTrongKyHeaderVND>
                                    <ThuTrongKyHeaderNT>${showHeaderThuPhatSinhTrongKyNT}</ThuTrongKyHeaderNT>
                                    <ChiTrongKyHeaderNT>${showHeaderChiPhatSinhTrongKyNT}</ChiTrongKyHeaderNT>
                                </SoPhatSinhTrongKy>
                                <SoTonCuoiKy>
                                    <TonCuoiKyHeaderVND>${showHeaderTonCuoiKyVND}</TonCuoiKyHeaderVND>
                                    <TonCuoiKyHeaderNT>${showHeaderTonCuoiKyNT}</TonCuoiKyHeaderNT>
                                </SoTonCuoiKy>
                            </SubHeaderTable>
                                    ${objData.xmlHeader}
                            <Subform6>
                                <Subform7>
                                    <thuQuy>THỦ QUỸ</thuQuy>
                                    <kiHoTen1>(Ký, họ tên)</kiHoTen1>
                                    <nameThuQuy>${objData.ThuQuy}</nameThuQuy>
                                </Subform7>
                                <Subform7>
                                    <nameNguoiDaiDien>${objData.NguoiDaiDien}</nameNguoiDaiDien>
                                    <nguoiDaiDienTheoPhapLuat>NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT</nguoiDaiDienTheoPhapLuat>
                                    <kiHoTen3>(Ký, họ tên)</kiHoTen3>
                                </Subform7>
                                <Subform7>
                                    <nameKeToanTruong>${objData.KeToan}</nameKeToanTruong>
                                    <keToanTruong>KẾ TOÁN TRƯỞNG</keToanTruong>
                                    <kiHoTen2>(Ký, họ tên)</kiHoTen2>
                                </Subform7>
                                <NgayThangNamKiTen>Ngày … tháng … năm …</NgayThangNamKiTen>
                                <Subform5>
                                    <SoTrang></SoTrang>
                                    <ChiTieu24>Ngày mở sổ: ${objData.NgayMoSo ? `${String(objData.NgayMoSo.getDate()).padStart(2, '0')}-${String(objData.NgayMoSo.getMonth() + 1).padStart(2, '0')}-${objData.NgayMoSo.getFullYear()}` : ''}</ChiTieu24>
                                </Subform5>
                            </Subform6>
                        </Content>
                        </form1>`
                        console.log('Data XML', mainXml)
                        var dataEncode = window.btoa(unescape(encodeURIComponent(mainXml)))
                        var raw = JSON.stringify({
                            "id": "131211",//"${oDataRoot.FiscalYear}${oDataRoot.CompanyCode}${oDataRoot.AccountingDocument}",
                            "report": "SOQUY",
                            "xdpTemplate": `${form == 2 ? "SOQUY/SOQUY" : "SOQUYVND/SOQUYVND"}`,
                            "zxmlData": dataEncode,
                            "formType": "interactive",
                            "formLocale": "en_US",
                            "taggedPdf": 1,
                            "embedFont": 0,
                            "changeNotAllowed": false,
                            "printNotAllowed": false,
                            "printMoi": 'X'
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
                                var decodedPdfContent = atob(data.fileContent)//base65 to string ?? to pdf

                                var byteArray = new Uint8Array(decodedPdfContent.length);
                                for (var i = 0; i < decodedPdfContent.length; i++) {
                                    byteArray[i] = decodedPdfContent.charCodeAt(i);
                                }
                                var blob = new Blob([byteArray.buffer], {
                                    type: 'application/pdf'
                                });
                                var _pdfurl = URL.createObjectURL(blob);

                                if (!this._PDFViewer) {
                                    this._PDFViewer = new sap.m.PDFViewer({
                                        width: "auto",
                                        source: _pdfurl
                                    });
                                    jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                                }

                                // this._PDFViewer.open();
                                this._PDFViewer.downloadPDF();
                                thatController.busyDialog.close();
                                thatController.arrItemFilter = []
                                thatController.lstGlaccount = []
                                thatController.arrHeaderData = []
                                thatController.arrData = []
                                thatController.mapData = new Map()
                            },
                            error: function (data) {
                                thatController.busyDialog.close();
                                thatController.arrItemFilter = []
                                thatController.lstGlaccount = []
                                thatController.arrHeaderData = []
                                thatController.arrData = []
                                thatController.mapData = new Map()
                            }
                        });
                    })

                })
            },
            /* 
                get header => list ctu fi doc + gl account (*, unique số ctu + gl account) => lấy ra map với key là gl acount , gọi là mapData 
                get item => lấy được list item => append phát sinh vào mapData ứng với Gl account
            */

            getData: function () {
                return new Promise((resolve, reject) => {
                    let thatController = this
                    const lstObjData = this.getView().byId("smartFilterBar").getFilterData() //.getFilters()
                    thatController.arrData.push(new Filter("CompanyCode", "EQ", lstObjData.CompanyCode))

                    if (lstObjData.GLAccount.items) {
                        lstObjData.GLAccount.items.forEach(element => {
                            thatController.arrData.push(new Filter('GLAccount', 'EQ', element.key))
                            //this.lstGlaccount.push(`${element.key}-${element.text}`)
                            this.lstGlaccount.push({
                                key: element.key,
                                text: element.text
                            })
                        });
                    }
                    if (lstObjData.GLAccount.ranges) {
                        lstObjData.GLAccount.ranges.forEach(element => {
                            thatController.arrData.push(new Filter(element.keyField, element.operation, element.value1, element.value2))
                            this.lstGlaccount.push({
                                key: element.value1
                                // text: element.text
                            })
                        });
                    }
                    if (lstObjData.GLAccount.value) {
                        thatController.arrData.push(new Filter('GLAccount', 'EQ', lstObjData.GLAccount.value))
                        this.lstGlaccount.push({
                            key: lstObjData.GLAccount.value
                            // text: element.text
                        })
                    }

                    this.nameAccount = lstObjData.GLAccount
                    var startDate = new Date(lstObjData['$Parameter.FromDate'])
                    var endDate = new Date(lstObjData['$Parameter.ToDate'])
                    /* Get unix time - format lại ngày theo time zone của hệ thống (tránh việc user đổi time zone)*/

                    //Tạo ngày ứng với ngày trên parameter không có time zone theo định dạng yy-mm-dd 
                    var fromDate = startDate.getFullYear() + '-' + (startDate.getMonth() < 9 ? '0' + (startDate.getMonth() + 1) : (startDate.getMonth() + 1)) + '-' + (startDate.getDate() < 9 ? ('0' + startDate.getDate()) : startDate.getDate())
                    var toDate = endDate.getFullYear() + '-' + (endDate.getMonth() < 9 ? '0' + (endDate.getMonth() + 1) : (endDate.getMonth() + 1)) + '-' + (endDate.getDate() < 9 ? ('0' + endDate.getDate()) : endDate.getDate())
                    if (startDate < endDate) {
                        this.arrItemFilter.push(new Filter('PostingDate', 'BT', Date.parse(fromDate), Date.parse(toDate)))
                        //thatController.arrData.push(new Filter('PostingDate','BT', startDate.setDate(startDate.getDate()),endDate.setDate(endDate.getDate())))

                        // Truyền ngày vừa tạo vào filter không dùng hàm setDate
                        // Vì khi dùng hàm setDate sẽ lấy ngày theo timezone của hệ thống nên khi khác time zone sẽ bị sai ngày
                        // Date.parse() dùng để parse ngày vừa tạo về unix date
                        thatController.arrData.push(new Filter('PostingDate', 'BT', Date.parse(fromDate), Date.parse(toDate)))
                    } else {
                        this.arrItemFilter.push(new Filter('PostingDate', 'EQ', Date.parse(fromDate)))
                        thatController.arrData.push(new Filter('PostingDate', 'EQ', Date.parse(fromDate)))
                    }
                    /* 
                    * BE -> lay dau ky cua cac GL acct -> lay phat sinh
                    * Loop roi tinh ra
                    */

                    var urlMain = "https://" + window.location.hostname + "/sap/opu/odata/sap/ZFI_SOQUY_V2"
                    var oDataModel = new ODataModel(urlMain, { json: true });
                    var url = this.getView().byId("smartFilterBar").getParameterBindingPath();
                    oDataModel.read(`${url}`, {
                        filters: thatController.arrData,
                        urlParameters: {
                            "$inlinecount": "allpages"
                        }, success: function (count, response) {
                            thatController.count = count.__count


                            let getDataPrint = new Promise((resolve, reject) => {
                                var i = 0
                                do {
                                    oDataModel.read(url, {
                                        filters: thatController.arrData,
                                        urlParameters: {
                                            "$top": 5000,
                                            "$skip": i
                                        },
                                        success: function (oData, response) {
                                            oData.results.forEach(element => {
                                                thatController.arrHeaderData.push(element)
                                            })
                                            resolve(thatController.arrHeaderData)
                                        },
                                        error: function (error) {
                                            reject(error)
                                        }
                                    })
                                    i += 5000
                                    if (i > thatController.count) {
                                        i = thatController.count
                                    }
                                    console.log("I=", i)
                                }
                                while (i < thatController.count)
                            })

                            
                            // getDataPrint.then((oData, response) => {
                            //     var promises = [];
                            //     var arrPro = [];

                            //     var promise = new Promise((innerResolve, innerReject) => {
                            //         for( var i = 0; i<oData.length; i+=20){
                            //             for(var j=i; j<i+20; j++){
                            //                 if(j == oData.length){
                            //                     j=i+20
                            //                 }else{
                            //                     arrPro.push(thatController.getXmlItem(oData[j]))
                            //                 }
                            //             }
                            //             Promise.all(arrPro).then(()=>{
                            //                 innerResolve();
                            //             })
                            //         }
                            //     })
                            //     promises.push(promise);
                            //     Promise.all(promises)
                            //         .then(() => {
                            //             resolve(thatController.mapData)
                            //         })
                            //         .catch((error) => {
                            //             thatController.busyDialog.close();
                            //             thatController.arrItemFilter = []
                            //             thatController.lstGlaccount = []
                            //         })
                            // })
                            getDataPrint.then((oData, response) => {
                                var chunkSize = 500; // Số lượng yêu cầu trong mỗi nhóm
                                var chunks = []; // Mảng chứa các nhóm yêu cầu
                            
                                // Chia oData thành các nhóm nhỏ hơn
                                for (var i = 0; i < oData.length; i += chunkSize) {
                                    chunks.push(oData.slice(i, i + chunkSize));
                                }
                                // Gửi từng nhóm yêu với thời gian đợi
                                chunks.reduce((prevPromise, chunk, index) => {
                                    return prevPromise.then(() => {
                                        return thatController.sendChunkWithDelay(chunk, index);
                                    });
                                }, Promise.resolve())
                                .then(() => {
                                    resolve(thatController.mapData);
                                })
                                .catch((error) => {
                                    thatController.busyDialog.close();
                                    thatController.arrItemFilter = [];
                                    thatController.lstGlaccount = [];
                                });
                            });
                        },
                        error: function (error) {
                            MessageToast.show('Đã có lỗi xảy ra.')
                            return
                        }
                    })
                })
            },
            // Hàm để gửi một nhóm yêu cầu và đợi một khoảng thời gian
            sendChunkWithDelay: function(chunk, index) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        Promise.all(chunk.map(item => {
                            return this.getXmlItem(item);
                        }))
                        .then(() => {
                            resolve();
                        })
                        .catch((error) => {
                            reject(error);
                        });
                    }, index * 1);
                });
            },
            getXmlItem: function (data) {
                /* 
                Loop 
                Lay phat sinh cua dau ky cuar GL Account
                */
                return new Promise((resolve, reject) => {
                    const VND = new Intl.NumberFormat('en-DE');
                    var thatController = this
                    let urlMain = "https://" + window.location.hostname + "/sap/opu/odata/sap/ZFI_SOQUY_V2"
                    let oDataModel = new ODataModel(urlMain, { json: true });
                    /* 
                    thatController.mapData : list uniqe chưa gl account đã được chọn
                    */
                    if (!thatController.mapData.get(data.GLAccount)) {
                        thatController.mapData.set(data.GLAccount, {
                            items: [],
                            GLAccount: data.GLAccount,
                            GLAccountLongName: data.GLAccountLongName,
                            headerTonDauKyVND: data.SumAmountInCompanyCodeCurrency,
                            headerTonDauKyNT: data.SumAmountInTransactionCurrency,
                            nameCompany: data.CompanyCodeName,
                            DiaChiCty: data.DiaChiCty,
                            Currency: data.Currency,
                            ThuQuy: data.ThuQuy,
                            KeToan: data.KeToan,
                            ToDate: data.ToDate,
                            FromDate: data.FromDate,
                            NgayMoSo: data.NgayMoSo,
                            NguoiDaiDien: data.NguoiDaiDien,
                        })

                    }

                    var urlFull = data.to_Item.__deferred.uri.split("")
                    var urlItem = urlFull.slice(68, urlFull.length + 1).join("") //304
                    var arr = []
                    var arrSorted = []
                    var temp = {}
                    oDataModel.read(urlItem, {
                        //filters:this.arrItemFilter,
                        urlParameters: {
                            "$inlinecount": "allpages",
                            "$top": 10000
                        },
                        /* ThuyNM xử lý*/
                        /* 
                                1: FiDoc có 1 đối tượng => lấy dòng đối tượng lên phát sinh
                                2: Có 2 dòng đối tượng => lấy line 111 lên
                                3: Có line chí phí đặc biệt 64170106, 64250104 => lấy line 111 lên
                                4: Có line chi ko đặc biệt đầu 6 còn lại => Lấy line chi phí + dòng đối tượng =>> ZCORE_I_PROFILE_FIDOC : cocode - fisyear - account doc => lấy đối tượng của ctu
                        */
                        success: function (dataItem) {
                            var dataTemp = []
                            var seen = {};
                            dataItem.results.forEach(function(item) {
                                var key = item.AccountingDocument + '|' + item.AccountingDocumentItem + '|' + item.CompanyCode + '|' + item.FiscalYear+ '|' + item.GLAccount;
                                if (!seen[key]) {
                                    dataTemp.push(item);
                                  seen[key] = true;
                                }
                            });
                            var count_K_D = 0
                            dataTemp.forEach(resultCheck => {
                                if (resultCheck.FinancialAccountType == 'K' || resultCheck.FinancialAccountType == 'D') {
                                    count_K_D++
                                }
                            })
                            for (var i = 0; i < dataTemp.length; i++) {
                                if (dataTemp.length == 1) {
                                    arr.push(dataTemp[i])
                                }
                                else if (dataTemp.length == 2) {

                                    if (dataTemp[i]["AccountingDocumentItem"] == 1) {
                                        temp = dataTemp[i]
                                    }
                                    else if (dataTemp[i]["FinancialAccountType"] != 'S') {
                                        arr.push(dataTemp[i])
                                    }
                                    else if (dataTemp[i]["FinancialAccountType"] == 'S' && dataTemp[i]["AccountingDocumentItem"] == 2) {
                                        if (dataTemp[i]["GLAccount"] == data.GLAccount) {
                                            arr.push(dataTemp[i])
                                        } else {
                                            arr.push(temp)
                                        }
                                    }
                                }
                                else {
                                    if (dataTemp[i]["MarkFee"] == 'X' && dataTemp[i]["AccountingDocumentItem"] != 1) {
                                    arr.push(dataTemp[i])
                                    continue;
                                    }
                                    
                                    if(dataTemp[i].GLAccount.startsWith("111") || dataTemp[i].GLAccount.startsWith("112")){
                                        if(!count_K_D>=2){
                                            if (!dataTemp[i].TenNguoiNNTien && !dataTemp[i].MaNguoiNNTien && !dataTemp[i].GLAccount.startsWith("64") && dataTemp[i]["MarkFee"] != 'X') {
                                                var accountingDocument = dataTemp[i].AccountingDocument;
                                                // Tìm đối tượng có cùng AccountingDocument nhưng có thông tin TenNguoiNNTien và MaNguoiNNTien
                                                for (var j = 0; j < dataTemp.length; j++) {
                                                    if (dataTemp[j].AccountingDocument == accountingDocument &&
                                                        dataTemp[j].TenNguoiNNTien && dataTemp[j].MaNguoiNNTien) {
                                                        // Cập nhật thông tin của đối tượng hiện tại
                                                        dataTemp[i].TenNguoiNNTien = dataTemp[j].TenNguoiNNTien;
                                                        dataTemp[i].MaNguoiNNTien = dataTemp[j].MaNguoiNNTien;
                                                        break; // Thoát khỏi vòng lặp khi tìm được thông tin
                                                    }
                                                }
                                                arr.push(dataTemp[i])
                                                continue;
                                            }
                                        }
                                        arr.push(dataTemp[i])
                                    }
                                }
                                // else {
                                //     var count_K_D = 0
                                //     var count_S = 0
                                //     dataTemp.forEach(resultCheck => {
                                //         if (resultCheck.FinancialAccountType == 'K' || resultCheck.FinancialAccountType == 'D') {
                                //             count_K_D++
                                //         }
                                //         if (resultCheck.FinancialAccountType == 'S') {
                                //             count_S++
                                //         }
                                //     })
                                //     if (count_K_D>= 2 && count_S >=2) {
                                //         if(dataTemp[i].GLAccount.startsWith("111") || dataTemp[i].GLAccount.startsWith("112"))
                                //         {
                                //             arr.push(dataTemp[i])
                                //             continue;
                                //         }
                                //     }
                                //     if (count_K_D >= 2) {
                                //         if (dataTemp[i]["AccountingDocumentItem"] == 1) {
                                //             arr.push(dataTemp[i])
                                //         }
                                //         else {
                                //             continue;
                                //         }
                                //     }
                                //     else {
                                //         if (dataTemp[i]["MarkFee"] == 'X' && dataTemp[i]["AccountingDocumentItem"] != 1) {
                                //             arr.push(dataTemp[i])
                                //             continue;
                                //         }
                                //         // Nếu đối tượng hiện tại không có TenNguoiNNTien và MaNguoiNNTien
                                //         else if (!dataTemp[i].TenNguoiNNTien && !dataTemp[i].MaNguoiNNTien && !dataTemp[i].GLAccount.startsWith("64") && dataTemp[i]["MarkFee"] != 'X') {
                                //             var accountingDocument = dataTemp[i].AccountingDocument;
                                //             // Tìm đối tượng có cùng AccountingDocument nhưng có thông tin TenNguoiNNTien và MaNguoiNNTien
                                //             for (var j = 0; j < dataTemp.length; j++) {
                                //                 if (dataTemp[j].AccountingDocument == accountingDocument &&
                                //                     dataTemp[j].TenNguoiNNTien && dataTemp[j].MaNguoiNNTien) {
                                //                     // Cập nhật thông tin của đối tượng hiện tại
                                //                     dataTemp[i].TenNguoiNNTien = dataTemp[j].TenNguoiNNTien;
                                //                     dataTemp[i].MaNguoiNNTien = dataTemp[j].MaNguoiNNTien;
                                //                     break; // Thoát khỏi vòng lặp khi tìm được thông tin
                                //                 }
                                //             }
                                //             arr.push(dataTemp[i])
                                //             break;
                                //         }
                                //         // else if (dataTemp[i]["MarkFee"] != 'X' && dataTemp[i]["AccountingDocumentItem"] == 1) {
                                //         //     arr.push(dataTemp[i])
                                //         //     continue;
                                //         // }
                                //         else if (dataTemp[i]["AccountingDocumentItem"] != 1) {
                                //             arr.push(dataTemp[i])
                                //         }
                                //     }
                                // }
                            }
                            arrSorted = arr.sort(function (arr1, arr2) { return arr1.PostingDate - arr2.PostingDate; });

                            let existingValue = thatController.mapData.get(data.GLAccount);
                            if (thatController.mapData.has(data.GLAccount)) {
                                // If the key exists, get the existing array and add a node it
                                //check concat
                                let existingArray = existingValue.items;
                                existingValue.items = existingArray.concat(arrSorted);
                                thatController.mapData.set(data.GLAccount, existingValue); // Update the value associated with the key
                            } else {
                                existingValue.items = arrSorted
                                thatController.mapData.set(data.GLAccount, existingValue)
                            }
                            resolve(thatController.mapData)
                        },
                        error: function (error) {
                            reject(error)
                        }
                    })

                }
                )
            },
            onExport: function () {

                let thatController = this
                const lstObjData = this.getView().byId("smartFilterBar").getFilterData()
                if (lstObjData['$Parameter.ToDate'] < lstObjData['$Parameter.FromDate']) {
                    MessageToast.show('Ngày bắt đầu không được lớn hơn ngày kết thúc.')
                    return
                }
                const VND = new Intl.NumberFormat('en-DE');
                var waitFormatIn = new Promise((resolve, reject) => {
                    MessageBox.information("Hãy chọn định dạng in.", {
                        actions: ["VND & Ngoại tệ", "VND", "Huỷ"],
                        emphasizedAction: "VND & Ngoại tệ",
                        // initialFocus: MessageBox.Action.PREVIEW,
                        onClose: async function (sAction) {
                            if (sAction == "VND & Ngoại tệ") {
                                this.flag = 2
                                resolve(this.flag)
                            }
                            else if (sAction == "VND") {
                                this.flag = 1
                                resolve(this.flag)
                            }
                            else {
                                return
                            }
                        }
                    })
                })
                waitFormatIn.then((form) => {
                    if (form == 1) {
                        if (!this.busyDialog) {
                            Fragment.load({
                                id: "idBusyDialog1",
                                name: "zfisoquyv2.controller.fragment.Busy",
                                type: "XML",
                                controller: this
                            })
                                .then((oDialog) => {
                                    this.busyDialog = oDialog;
                                    this.busyDialog.open();

                                })
                                .catch(error => alert(error.message));
                        } else {
                            this.busyDialog.open();
                        }
                        var text = 'Mẫu số S07' + '- DN\n' + '(Ban hành theo Thông tư số\n' + '200/2014/TT-BTC ngày 22/1/2021\n' + 'của Bộ Tài Chính)'
                        let thatController = this
                        const VND = new Intl.NumberFormat('en-DE');
                        var headerTonDauKyVND = 0;
                        var headerThuPhatSinhTrongKyVND = 0;
                        var headerChiPhatSinhTrongKyVND = 0;
                        var headerTonCuoiKyVND = 0;
                        thatController.getData().then(data => {
                            if (data.size == 0) {
                                MessageToast.show("Không có dữ liệu.")
                                thatController.busyDialog.close();
                                return
                            }
                            var excelData = []
                            var excelStyle = []
                            var headerRow = []
                            var blankRow = []

                            var blankCol = []
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "Chứng từ" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "Số tiền VND" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.forEach((item, index) => {
                                blankRow.push(item.name)
                                var headerIndex = 8
                                excelStyle.push({
                                    cell: `${thatController.convertExcelColCharacter(index)}${headerIndex}`,
                                    style: {
                                        font: {
                                            name: "times new roman",
                                            bold: true,
                                            sz: 13
                                        },
                                        alignment: {
                                            horizontal: "center",
                                            vertical: "center"
                                        },
                                        border: {
                                            top: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            bottom: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            left: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            right: {
                                                style: "thin",
                                                color: "#000000"
                                            }
                                        },
                                        fill: {
                                            fgColor: { rgb: "92D050" }
                                        }
                                    } 
                                })
                            })

                            var listColMapping = []
                            listColMapping.push({ name: "Ngày ghi sổ", colField: "PostingDate", type: "text" })
                            listColMapping.push({ name: "Ngày", colField: "DocumentDate", type: "text" })
                            listColMapping.push({ name: "Số thu", colField: "SoChungTuThu", type: "text" })
                            listColMapping.push({ name: "Số chi", colField: "SoChungTuChi", type: "text" })
                            listColMapping.push({ name: "Tên người nộp/nhận tiền", colField: "TenNguoiNNTien", type: "text"})
                            listColMapping.push({ name: "Mã người nộp/nhận tiền", colField: "MaNguoiNNTien", type: "text" })
                            listColMapping.push({ name: "Diễn giải", colField: "DienGiai", type: "text" })
                            listColMapping.push({ name: "Loại tiền", colField: "CompanyCodeCurrency", type: "text" })
                            listColMapping.push({ name: "Thu", type: "currency" })
                            listColMapping.push({ name: "Chi", type: "currency" })
                            listColMapping.push({ name: "Tồn", type: "currency" })
                            listColMapping.forEach((item, index) => {
                                headerRow.push(item.name)
                                var headerIndex = 9
                                excelStyle.push({
                                    cell: `${thatController.convertExcelColCharacter(index)}${headerIndex}`,
                                    style: {
                                        font: {
                                            name: "times new roman",
                                            bold: true,
                                            sz: 13
                                        },
                                        alignment: {
                                            horizontal: "center",
                                            vertical: "center"
                                        },
                                        border: {
                                            top: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            bottom: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            left: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            right: {
                                                style: "thin",
                                                color: "#000000"
                                            }
                                        },
                                        fill: {
                                            fgColor: { rgb: "92D050" }
                                        }
                                    } 
                                })
                            })

                            
                            var merge = [
                                { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },//Merge tên cty
                                { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },//Merge địa chỉ
                                { s: { r: 0, c: 9 }, e: { r: 1, c: 10 } },//Merger Mẫu số S07
                                { s: { r: 3, c: 0 }, e: { r: 3, c: 10 } },//Mege title
                                { s: { r: 4, c: 0 }, e: { r: 4, c: 10 } },//Merge tên tk
                                { s: { r: 5, c: 0 }, e: { r: 5, c: 10 } },//Merge from date to date
                                { s: { r: 7, c: 1 }, e: { r: 7, c: 3 } },//Merge chứng từ
                                { s: { r: 7, c: 8 }, e: { r: 7, c: 10 } },//Merger số tiền vnd
                                { s: { r: 7, c: 0 }, e: { r: 8, c: 0 } },//Merge ngày ghi sổ
                                { s: { r: 7, c: 4 }, e: { r: 8, c: 4 } },//Merge tên người nộp
                                { s: { r: 7, c: 5 }, e: { r: 8, c: 5 } },//Merge mã người nộp
                                { s: { r: 7, c: 6 }, e: { r: 8, c: 6 } },//Merge diễn giải
                                { s: { r: 7, c: 7 }, e: { r: 8, c: 7 } },//Merge loại tiền
                                { s: { r: 9, c: 0 }, e: { r: 9, c: 7 } },
                                { s: { r: 10, c: 0 }, e: { r: 10, c: 7 } },
                                { s: { r: 11, c: 0 }, e: { r: 11, c: 7 } }
                            ]

                            //lấy data cho header
                            var objData = {}
                            var mergeRow = 12
                            var tongRow = 13
                            var arrTong = []
                            var footer = 12
                            var arrFooter = []
                            var rowIndex = 17
                            data.forEach(result => {
                                var tonDauGL = []
                                var psGL = []
                                var tonCuoiGL = []
                                var gl = []
                                var sumThuVND = 0
                                var sumChiVND = 0
                                var sumTonCuoiKyVND = 0
                                var preTonVND = Number(result.headerTonDauKyVND);
                                var arrSorted = result.items.sort(function (arr1, arr2) { return arr1.PostingDate - arr2.PostingDate; })
                                //xử lý data cho header
                                arrSorted.forEach(dataLine => {
                                    sumThuVND += Number(Math.abs(dataLine.SoTienThuVND))
                                    sumChiVND += Number(Math.abs(dataLine.SoTienChiVND))
                                })
                                sumTonCuoiKyVND = Number(result.headerTonDauKyVND) + sumThuVND - Math.abs(sumChiVND)
                                if (sumChiVND < 0) {
                                    sumChiVND *= (-1)
                                }
                                var showTonDauKyVND = ''
                                if (Number(result.TonDauKyVND) < 0) {
                                    showTonDauKyVND = `(${VND.format(Number(result.headerTonDauKyVND) * (-1))})`
                                } else { showTonDauKyVND = VND.format(Number(result.headerTonDauKyVND)) }

                                mergeRow = mergeRow + 1

                                var glRow = []
                                glRow.push({ name: `${result.GLAccount + " - " + result.GLAccountLongName}`})
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: ""})
                                merge.push({ s: { r: mergeRow - 1, c: 0 } , e: { r: mergeRow - 1, c: 7}})
                                glRow.forEach((item, index) => {
                                    gl.push(item.name)
                                    excelStyle.push({
                                        cell: `${thatController.convertExcelColCharacter(index)}${mergeRow}`,
                                        style: {
                                            font: {
                                                name: "times new roman",
                                                sz: 13
                                            },
                                            alignment: {
                                                horizontal: "left"
                                            },
                                            border: {
                                                top: {
                                                    style: "thin",
                                                    color: "#000000"
                                                },
                                                bottom: {
                                                    style: "thin",
                                                    color: "#000000"
                                                },
                                                left: {
                                                    style: "thin",
                                                    color: "#000000"
                                                },
                                                right: {
                                                    style: "thin",
                                                    color: "#000000"
                                                }
                                            }
                                        }
                                    })
                                })
                                mergeRow = mergeRow + result.items.length + 3
                                for (var i = 0;i < 3;i ++){
                                    tongRow += 1
                                    arrTong.push(tongRow)
                                }
                                
                                var tonDauKy = []
                                tonDauKy.push({ name: "Tồn đầu kỳ" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: showTonDauKyVND })
                                tonDauKy.forEach(item => {
                                    tonDauGL.push(item.name)
                                })
                                for (let i = 0;i < arrTong.length;i ++){
                                    merge.push({ s: { r: arrTong[i] - 1, c: 0 } , e: { r: arrTong[i] - 1, c: 7}})
                                    tonDauKy.forEach((item, index) => {
                                        excelStyle.push({
                                            cell: `${thatController.convertExcelColCharacter(index)}${arrTong[i]}`,
                                            style: {
                                                font: {
                                                    name: "times new roman",
                                                    sz: 13
                                                },
                                                alignment: {
                                                    horizontal: "right"
                                                },
                                                border: {
                                                    top: {
                                                        style: "thin",
                                                        color: "#000000"
                                                    },
                                                    bottom: {
                                                        style: "thin",
                                                        color: "#000000"
                                                    },
                                                    left: {
                                                        style: "thin",
                                                        color: "#000000"
                                                    },
                                                    right: {
                                                        style: "thin",
                                                        color: "#000000"
                                                    }
                                                }
                                            }
                                        })
                                    })
                                }
                                

                                var tonCuoiKy = []
                                tonCuoiKy.push({ name: "Tồn cuối kỳ" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: VND.format(sumTonCuoiKyVND) })
                                tonCuoiKy.forEach(item => {
                                    tonCuoiGL.push(item.name)
                                })

                                var psTrongKy = []
                                psTrongKy.push({ name: "Phát sinh trong kỳ" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: sumThuVND })
                                psTrongKy.push({ name: sumChiVND })
                                psTrongKy.push({ name: "" })
                                psTrongKy.forEach(item => {
                                    psGL.push(item.name)
                                })

                                tongRow = tongRow + result.items.length + 1
                                footer += 4 + result.items.length
   
                                excelData.push(gl)
                                excelData.push(tonDauGL)
                                excelData.push(psGL)
                                excelData.push(tonCuoiGL)


                                //xử lý data cho item
                                arrSorted.forEach(dataLine => {
                                    var chiVnd = ''
                                    var thuVnd = ''
                                    if (dataLine.IsNegativePosting && Number(dataLine.SoTienChiVND != 0)) {
                                        chiVnd = `(${VND.format(Number(Math.abs(dataLine.SoTienChiVND)))})`
                                    }
                                    else {
                                        chiVnd = VND.format(Number(Math.abs(dataLine.SoTienChiVND)))
                                    }
                                    if (dataLine.IsNegativePosting && Number(dataLine.SoTienThuVND != 0)) {
                                        thuVnd = `(${VND.format(Number((Math.abs(dataLine.SoTienThuVND))))})`
                                    }
                                    else {
                                        thuVnd = VND.format(Number(Math.abs(dataLine.SoTienThuVND)))
                                    }
                                    
                                    preTonVND += (Number(Math.abs(dataLine.SoTienThuVND)) - Number(Math.abs(dataLine.SoTienChiVND)))
                                    var showPreTonVND = ''
                                    if (preTonVND < 0) {
                                        showPreTonVND = `(${VND.format(preTonVND * -1)})`
                                    } else { showPreTonVND = VND.format(preTonVND) }

                                    var row = []
                                    listColMapping.forEach((col, index) => {
                                        if (col.name == 'Ngày ghi sổ' || col.name == 'Ngày'){
                                            dataLine[col.colField] = (dataLine[col.colField].getDate() + "/" + (dataLine[col.colField].getMonth() + 1) + "/" + dataLine[col.colField].getFullYear())
                                        }

                                        if (col.type == 'currency'){
                                            if (col.name == 'Thu'){
                                                row.push(thuVnd)
                                            }else if (col.name == 'Chi'){
                                                row.push(chiVnd)
                                            }else if (col.name == 'Tồn'){
                                                row.push(showPreTonVND)
                                            }
                                            excelStyle.push({
                                                cell: `${thatController.convertExcelColCharacter(index)}${rowIndex}`,
                                                style: {
                                                    font: {
                                                        name: "times new roman",
                                                        sz: 13
                                                    },
                                                    alignment: {
                                                        horizontal: "right"
                                                    },
                                                    border: {
                                                        top: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        bottom: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        left: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        right: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        }
                                                    }
                                                }
                                            })
                                        }else{
                                            row.push(dataLine[col.colField] ? dataLine[col.colField] : " ")
                                            excelStyle.push({
                                                cell: `${thatController.convertExcelColCharacter(index)}${rowIndex}`,
                                                style: {
                                                    font: {
                                                        name: "times new roman",
                                                        sz: 13
                                                    },
                                                    alignment: {
                                                        horizontal: "center"
                                                    },
                                                    border: {
                                                        top: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        bottom: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        left: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        right: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        }
                                                    }
                                                }
                                            })
                                        }
                                    })
                                    excelData.push(row)
                                    rowIndex += 1
                                })
                                rowIndex += 4


                                //Data truyền ra header
                                headerTonDauKyVND += Number(result.headerTonDauKyVND)
                                headerThuPhatSinhTrongKyVND += sumThuVND
                                headerChiPhatSinhTrongKyVND += sumChiVND
                                headerTonCuoiKyVND += sumTonCuoiKyVND

                                objData.accountName = data.Length > 1 ? '' : `${result.GLAccount}-${result.GLAccountLongName}`
                                objData.headerTonDauKyVND = headerTonDauKyVND
                                objData.headerThuPhatSinhTrongKyVND = headerThuPhatSinhTrongKyVND
                                objData.headerChiPhatSinhTrongKyVND = headerChiPhatSinhTrongKyVND
                                objData.headerTonCuoiKyVND = headerTonCuoiKyVND
                                objData.nameCompany = result.nameCompany ? result.nameCompany : objData.nameCompany
                                objData.DiaChiCty = result.DiaChiCty ? result.DiaChiCty : objData.DiaChiCty
                                objData.Currency = result.Currency ? result.Currency : objData.Currency
                                objData.GLAccount = result.GLAccount ? result.GLAccount : objData.GLAccount
                                objData.ThuQuy = result.ThuQuy ? result.ThuQuy : objData.ThuQuy
                                objData.KeToan = result.KeToan ? result.KeToan : objData.KeToan
                                objData.ToDate = result.ToDate ? result.ToDate : objData.ToDate
                                objData.FromDate = result.FromDate ? result.FromDate : objData.FromDate
                                objData.NgayMoSo = result.NgayMoSo ? result.NgayMoSo : objData.NgayMoSo
                                objData.NguoiDaiDien = result.NguoiDaiDien ? result.NguoiDaiDien : objData.NguoiDaiDien
                            })
                           

                            var showHeaderTonDauKyVND = ''
                            var showHeaderThuPhatSinhTrongKyVND = ''
                            var showHeaderChiPhatSinhTrongKyVND = ''
                            var showHeaderTonCuoiKyVND = ''

                            if (objData.headerTonDauKyVND < 0) {
                                showHeaderTonDauKyVND = `(${VND.format(objData.headerTonDauKyVND * -1)})`
                            } else { showHeaderTonDauKyVND = VND.format(objData.headerTonDauKyVND) }

                            if (objData.headerThuPhatSinhTrongKyVND < 0) {
                                showHeaderThuPhatSinhTrongKyVND = `(${VND.format(objData.headerThuPhatSinhTrongKyVND * -1)})`
                            } else { showHeaderThuPhatSinhTrongKyVND = VND.format(objData.headerThuPhatSinhTrongKyVND) }

                            if (objData.headerChiPhatSinhTrongKyVND < 0) {
                                showHeaderChiPhatSinhTrongKyVND = `${VND.format(objData.headerChiPhatSinhTrongKyVND * -1)}`
                            } else { showHeaderChiPhatSinhTrongKyVND = VND.format(objData.headerChiPhatSinhTrongKyVND) }

                            if (objData.headerTonCuoiKyVND < 0) {
                                showHeaderTonCuoiKyVND = `(${VND.format(objData.headerTonCuoiKyVND * -1)})`
                            } else { showHeaderTonCuoiKyVND = VND.format(objData.headerTonCuoiKyVND) }

                            var concatDate = "Từ ngày " + ((objData.FromDate.getDate() < 10 ? '0' + objData.FromDate.getDate() : objData.FromDate.getDate()) + "/" + ((objData.FromDate.getMonth() + 1) < 10 ? '0' + (objData.FromDate.getMonth() + 1) : (objData.FromDate.getMonth() + 1)) + "/" + objData.FromDate.getFullYear())
                                + " đến ngày " + ((objData.ToDate.getDate() < 10 ? '0' + objData.ToDate.getDate() : objData.ToDate.getDate()) + "/" + ((objData.ToDate.getMonth() + 1) < 10 ? '0' + (objData.ToDate.getMonth() + 1) : (objData.ToDate.getMonth() + 1)) + "/" + objData.ToDate.getFullYear())

                            var mangTongTonDauKy = []
                            var mangTongPS = []
                            var mangTongTonCuoiKy = []
                            var tonDauKy = []
                            tonDauKy.push({ name: "Số tồn đầu kỳ" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: showHeaderTonDauKyVND })
                            var headerIndexDauKy = 10
                            tonDauKy.forEach((item, index) => {
                                mangTongTonDauKy.push(item.name)
                                excelStyle.push({
                                    cell: `${thatController.convertExcelColCharacter(index)}${headerIndexDauKy}`,
                                    style: {
                                        font: {
                                            name: "times new roman",
                                            sz: 13
                                        },
                                        alignment: {
                                            horizontal: "right",
                                        },
                                        border: {
                                            top: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            bottom: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            left: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            right: {
                                                style: "thin",
                                                color: "#000000"
                                            }
                                        }
                                    } 
                                })
                            })

                            var tonCuoiKy = []
                            tonCuoiKy.push({ name: "Số tồn cuối kỳ" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: showHeaderTonCuoiKyVND })
                            var headerIndexCuoiKy = 12
                            tonCuoiKy.forEach((item, index) => {
                                mangTongTonCuoiKy.push(item.name)
                                excelStyle.push({
                                    cell: `${thatController.convertExcelColCharacter(index)}${headerIndexCuoiKy}`,
                                    style: {
                                        font: {
                                            name: "times new roman",
                                            sz: 13
                                        },
                                        alignment: {
                                            horizontal: "right",
                                        },
                                        border: {
                                            top: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            bottom: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            left: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            right: {
                                                style: "thin",
                                                color: "#000000"
                                            }
                                        }
                                    } 
                                })
                            })

                            var psTrongKy = []
                            psTrongKy.push({ name: "Phát sinh trong kỳ" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: showHeaderThuPhatSinhTrongKyVND })
                            psTrongKy.push({ name: showHeaderChiPhatSinhTrongKyVND })
                            psTrongKy.push({ name: "" })
                            var headerIndexPS = 11
                            psTrongKy.forEach((item, index) => {
                                mangTongPS.push(item.name)
                                excelStyle.push({
                                    cell: `${thatController.convertExcelColCharacter(index)}${headerIndexPS}`,
                                    style: {
                                        font: {
                                            name: "times new roman",
                                            sz: 13
                                        },
                                        alignment: {
                                            horizontal: "right",
                                        },
                                        border: {
                                            top: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            bottom: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            left: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            right: {
                                                style: "thin",
                                                color: "#000000"
                                            }
                                        }
                                    } 
                                })
                            })

                            footer += 2
                            arrFooter.push(footer)
                            footer += 2
                            arrFooter.push(footer)
                            footer += 3
                            arrFooter.push(footer)
                            merge.push({s : {r: arrFooter[0] - 1, c: 0}, e : {r: arrFooter[0] - 1, c: 1}})
                          

                            var blankCol = []
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            var blank = []
                            blankCol.forEach(item => {
                                blank.push(item.name) 
                            })
                            excelData.push(blank)

                            var ngay = []
                            ngay.push({name: objData.NgayMoSo ? `Ngày mở sổ: ${String(objData.NgayMoSo.getDate()).padStart(2, '0')}-${String(objData.NgayMoSo.getMonth() + 1).padStart(2, '0')}-${objData.NgayMoSo.getFullYear()}` : ''})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: "Ngày...tháng...năm"})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            var n = []
                            ngay.forEach(item => {
                                n.push(item.name)
                            })
                            for(let i =0;i < arrFooter.length;i ++){
                                ngay.forEach((item, index) => {
                                    excelStyle.push({
                                        cell: `${thatController.convertExcelColCharacter(index)}${arrFooter[i]}`,
                                        style: {
                                            font: {
                                                name: "times new roman",
                                                bold: true,
                                                sz: 13
                                            },
                                            alignment: {
                                                horizontal: "center",
                                                wrapText: '1',
                                                vertical: "center"
                                            }
                                        } 
                                    })
                                })
                            }
                            excelData.push(n)
                            excelData.push(blank)
                            
                            var ten = []
                            ten.push({name: ""})
                            ten.push({name: "THỦ QUỸ\n" + "(Ký, họ tên)"})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: "KẾ TOÁN TRƯỞNG\n" + "(Ký, họ tên)"})
                            ten.push({name: ""})
                            ten.push({name: "NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT\n" + "(Ký, họ tên)"})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            var name = []
                            ten.forEach(item => {
                                name.push(item.name)
                            })
                            excelData.push(name)
                            excelData.push(blank)
                            excelData.push(blank)

                            var chuKy = []
                            chuKy.push({name: ""})
                            chuKy.push({name: objData.ThuQuy})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            chuKy.push({name: objData.KeToan})
                            chuKy.push({name: ""})
                            chuKy.push({name: objData.NguoiDaiDien})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            var chuky = []
                            chuKy.forEach(item => {
                                chuky.push(item.name)
                            })
                            excelData.push(chuky)




                            var arrData = [
                                [objData.nameCompany, "", "", "", "", "", "", "", "", "", text],
                                [objData.DiaChiCty, "", "", "", "", "", "", "", "", "", ""],
                                ["", "", "", "", "", "", "", "", "", "", ""],
                                ["Sổ quỹ", "", "", "", "", "", "", "", "", "", ""],
                                [objData.accountName, "", "", "", "", "", "", "", "", "", ""],
                                [concatDate, "", "", "", "", "", "", "", "", "", ""],
                                ["", "", "", "", "", "", "", "", "", "", ""],
                                blankRow,
                                headerRow,
                                mangTongTonDauKy,
                                mangTongPS,
                                mangTongTonCuoiKy
                            ]

                            var worksheet = XLSX.utils.aoa_to_sheet(arrData)


                            worksheet["!merges"] = merge;

                            // Tạo độ rộng cho các ô
                            var colWidth = [
                                { wch: 20 },
                                { wch: 30 },
                                { wch: 20 },
                                { wch: 20 },
                                { wch: 50 },
                                { wch: 40 },
                                { wch: 40 },
                                { wch: 10 },
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
                            ]
                            worksheet["!cols"] = colWidth
                            console.log(excelData)
                            XLSX.utils.sheet_add_aoa(worksheet, excelData, { origin: -1 });
                            console.log("Sheet: ", worksheet)
                            var workbook = XLSX.utils.book_new()
                            XLSX.utils.book_append_sheet(workbook, worksheet, "SoQuy")

                            var style = {
                                font: {
                                    name: "times new roman",
                                    bold: true,
                                    sz: 13
                                },
                                alignment: {
                                    horizontal: "left"
                                }
                            }

                            var style_text = {
                                font: {
                                    name: "times new roman",
                                    bold: true,
                                    sz: 13
                                },
                                alignment: {
                                    horizontal: "center",
                                    wrapText: '1'
                                }
                            }

                            workbook.Sheets["SoQuy"].A1.s = style
                            workbook.Sheets["SoQuy"].A2.s = style
                            workbook.Sheets["SoQuy"].A4.s = style_text
                            workbook.Sheets["SoQuy"].A5.s = style_text
                            workbook.Sheets["SoQuy"].A6.s = style_text
                          
                            workbook.Sheets["SoQuy"].A8.v = "Ngày ghi sổ"
                            workbook.Sheets["SoQuy"].E8.v = "Tên người nộp/nhận tiền"
                            workbook.Sheets["SoQuy"].F8.v = "Mã người nộp/nhận tiền"
                            workbook.Sheets["SoQuy"].G8.v = "Diễn giải"
                            workbook.Sheets["SoQuy"].H8.v = "Loại tiền"
                            workbook.Sheets["SoQuy"].J1.v = text
                            workbook.Sheets["SoQuy"].J1.s = style_text
                            

                            excelStyle.forEach(value => {
                                workbook.Sheets["SoQuy"][value.cell].s = value.style
                            })
                            
                            XLSX.writeFile(workbook, "SoQuy.xlsx")
                            thatController.busyDialog.close()
                            thatController.arrItemFilter = []
                            thatController.lstGlaccount = []
                            thatController.arrHeaderData = []
                            thatController.arrData = []
                            thatController.mapData = new Map()
                        })
                    } else {
                        if (!this.busyDialog) {
                            Fragment.load({
                                id: "idBusyDialog1",
                                name: "zfisoquyv2.controller.fragment.Busy",
                                type: "XML",
                                controller: this
                            })
                                .then((oDialog) => {
                                    this.busyDialog = oDialog;
                                    this.busyDialog.open();

                                })
                                .catch(error => alert(error.message));
                        } else {
                            this.busyDialog.open();
                        }
                        var text = 'Mẫu số S07' + '- DN\n' + '(Ban hành theo Thông tư số\n' + '200/2014/TT-BTC ngày 22/1/2021\n' + 'của Bộ Tài Chính)'
                        let thatController = this
                        const VND = new Intl.NumberFormat('en-DE');
                        var headerTonDauKyVND = 0;
                        var headerTonDauKyNT = 0;
                        var headerThuPhatSinhTrongKyVND = 0;
                        var headerThuPhatSinhTrongKyNT = 0;
                        var headerChiPhatSinhTrongKyVND = 0;
                        var headerChiPhatSinhTrongKyNT = 0;
                        var headerTonCuoiKyVND = 0;
                        var headerTonCuoiKyNT = 0;
                        thatController.getData().then(data => {
                            if (data.size == 0) {
                                MessageToast.show("Không có dữ liệu.")
                                thatController.busyDialog.close();
                                return
                            }
                            var excelData = []
                            var excelStyle = []
                            var headerRow = []
                            var blankRow = []

                            var blankCol = []
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "Chứng từ" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "Số tiền VND" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "Số tiền ngoại tệ" })
                            blankCol.push({ name: "" })
                            blankCol.push({ name: "" })
                            blankCol.forEach((item, index) => {
                                blankRow.push(item.name)
                                var headerIndex = 8
                                excelStyle.push({
                                    cell: `${thatController.convertExcelColCharacter(index)}${headerIndex}`,
                                    style: {
                                        font: {
                                            name: "times new roman",
                                            bold: true,
                                            sz: 13
                                        },
                                        alignment: {
                                            horizontal: "center",
                                            vertical: "center"
                                        },
                                        border: {
                                            top: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            bottom: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            left: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            right: {
                                                style: "thin",
                                                color: "#000000"
                                            }
                                        },
                                        fill: {
                                            fgColor: { rgb: "92D050" }
                                        }
                                    } 
                                })
                            })

                            var listColMapping = []
                            listColMapping.push({ name: "Ngày ghi sổ", colField: "PostingDate", type: "text" })
                            listColMapping.push({ name: "Ngày", colField: "DocumentDate", type: "text" })
                            listColMapping.push({ name: "Số thu", colField: "SoChungTuThu", type: "text" })
                            listColMapping.push({ name: "Số chi", colField: "SoChungTuChi", type: "text" })
                            listColMapping.push({ name: "Tên người nộp/nhận tiền", colField: "TenNguoiNNTien", type: "text"})
                            listColMapping.push({ name: "Mã người nộp/nhận tiền", colField: "MaNguoiNNTien", type: "text" })
                            listColMapping.push({ name: "Diễn giải", colField: "DienGiai", type: "text" })
                            listColMapping.push({ name: "Loại tiền", colField: "CompanyCodeCurrency", type: "text" })
                            listColMapping.push({ name: "Thu", type: "currency" })
                            listColMapping.push({ name: "Chi", type: "currency" })
                            listColMapping.push({ name: "Tồn", type: "currency" })
                            listColMapping.push({ name: "Thu", type: "transcurrency" })
                            listColMapping.push({ name: "Chi", type: "transcurrency" })
                            listColMapping.push({ name: "Tồn", type: "transcurrency" })
                            listColMapping.forEach((item, index) => {
                                headerRow.push(item.name)
                                var headerIndex = 9
                                excelStyle.push({
                                    cell: `${thatController.convertExcelColCharacter(index)}${headerIndex}`,
                                    style: {
                                        font: {
                                            name: "times new roman",
                                            bold: true,
                                            sz: 13
                                        },
                                        alignment: {
                                            horizontal: "center",
                                            vertical: "center"
                                        },
                                        border: {
                                            top: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            bottom: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            left: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            right: {
                                                style: "thin",
                                                color: "#000000"
                                            }
                                        },
                                        fill: {
                                            fgColor: { rgb: "92D050" }
                                        }
                                    } 
                                })
                            })

                            
                            var merge = [
                                { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },//Merge tên cty
                                { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },//Merge địa chỉ
                                { s: { r: 0, c: 12 }, e: { r: 1, c: 13 } },//Merger Mẫu số S07
                                { s: { r: 3, c: 0 }, e: { r: 3, c: 10 } },//Mege title
                                { s: { r: 4, c: 0 }, e: { r: 4, c: 10 } },//Merge tên tk
                                { s: { r: 5, c: 0 }, e: { r: 5, c: 10 } },//Merge from date to date
                                { s: { r: 7, c: 1 }, e: { r: 7, c: 3 } },//Merge chứng từ
                                { s: { r: 7, c: 8 }, e: { r: 7, c: 10 } },//Merger số tiền vnd
                                { s: { r: 7, c: 11 }, e: { r: 7, c: 13 } },//Merge số tiền ngoại tệ
                                { s: { r: 7, c: 0 }, e: { r: 8, c: 0 } },//Merge ngày ghi sổ
                                { s: { r: 7, c: 4 }, e: { r: 8, c: 4 } },//Merge tên người nộp
                                { s: { r: 7, c: 5 }, e: { r: 8, c: 5 } },//Merge mã người nộp
                                { s: { r: 7, c: 6 }, e: { r: 8, c: 6 } },//Merge diễn giải
                                { s: { r: 7, c: 7 }, e: { r: 8, c: 7 } },//Merge loại tiền
                                { s: { r: 9, c: 0 }, e: { r: 9, c: 7 } },
                                { s: { r: 10, c: 0 }, e: { r: 10, c: 7 } },
                                { s: { r: 11, c: 0 }, e: { r: 11, c: 7 } }
                            ]

                            //lấy data cho header
                            var objData = {}
                            var mergeRow = 12
                            var tongRow = 13
                            var arrTong = []
                            var footer = 12
                            var arrFooter = []
                            var rowIndex = 17
                            data.forEach(result => {
                                var tonDauGL = []
                                var psGL = []
                                var tonCuoiGL = []
                                var gl = []
                                var sumThuVND = 0
                                var sumChiVND = 0
                                var sumThuNT = 0
                                var sumChiNT = 0
                                var sumTonCuoiKyVND = 0
                                var sumTonCuoiKyNT = 0
                                var preTonVND = Number(result.headerTonDauKyVND);
                                var preTonNT = Number(result.headerTonDauKyNT);
                                var arrSorted = result.items.sort(function (arr1, arr2) { return arr1.PostingDate - arr2.PostingDate; })
                                //xử lý data cho header
                                arrSorted.forEach(dataLine => {
                                    sumThuVND+=Number(Math.abs(dataLine.SoTienThuVND))
                                    sumThuNT+=Number(Math.abs(dataLine.SoTienThuNT))
                                    sumChiVND+=Number(Math.abs(dataLine.SoTienChiVND))
                                    sumChiNT+=Number(Math.abs(dataLine.SoTienChiNT))
                                })
                                sumTonCuoiKyVND = Number(result.headerTonDauKyVND) + sumThuVND - Math.abs(sumChiVND)
                                sumTonCuoiKyNT = Number(result.headerTonDauKyNT) + sumThuNT - Math.abs(sumChiNT)
                                if (sumChiVND < 0) {
                                    sumChiVND *= (-1)
                                }
                                if (sumChiNT < 0){
                                    sumChiNT *= (-1)
                                }
                                var showTonDauKyVND = ''
                                var showTonDauKyNT = ''
                                var showTonCuoiKyNT = ''
                                if (Number(result.TonDauKyVND) < 0) {
                                    showTonDauKyVND = `(${VND.format(Number(result.headerTonDauKyVND) * (-1))})`
                                } else { showTonDauKyVND = VND.format(Number(result.headerTonDauKyVND)) }
                                if(Number(result.TonDauKyNT) < 0){
                                    showTonDauKyNT = result.Currency != 'VND' ? `(${VND.format(Number(result.headerTonDauKyNT) * (-1))})` : 0
                                }else{showTonDauKyNT = result.Currency != 'VND' ? VND.format(Number(result.headerTonDauKyNT)) : 0}
                                if(sumTonCuoiKyNT < 0){
                                    showTonCuoiKyNT = result.Currency != 'VND' ? `(${VND.format(sumTonCuoiKyNT*(-1))})` : 0
                                }else{showTonCuoiKyNT = result.Currency != 'VND' ? VND.format(sumTonCuoiKyNT) : 0}

                                mergeRow = mergeRow + 1

                                var glRow = []
                                glRow.push({ name: `${result.GLAccount + " - " + result.GLAccountLongName}`})
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: ""})
                                glRow.push({ name: "" })
                                glRow.push({ name: "" })
                                glRow.push({ name: ""})
                                merge.push({ s: { r: mergeRow - 1, c: 0 } , e: { r: mergeRow - 1, c: 7}})
                                glRow.forEach((item, index) => {
                                    gl.push(item.name)
                                    excelStyle.push({
                                        cell: `${thatController.convertExcelColCharacter(index)}${mergeRow}`,
                                        style: {
                                            font: {
                                                name: "times new roman",
                                                sz: 13
                                            },
                                            alignment: {
                                                horizontal: "left"
                                            },
                                            border: {
                                                top: {
                                                    style: "thin",
                                                    color: "#000000"
                                                },
                                                bottom: {
                                                    style: "thin",
                                                    color: "#000000"
                                                },
                                                left: {
                                                    style: "thin",
                                                    color: "#000000"
                                                },
                                                right: {
                                                    style: "thin",
                                                    color: "#000000"
                                                }
                                            }
                                        }
                                    })
                                })
                                mergeRow = mergeRow + result.items.length + 3
                                for (var i = 0;i < 3;i ++){
                                    tongRow += 1
                                    arrTong.push(tongRow)
                                }
                                
                                var tonDauKy = []
                                tonDauKy.push({ name: "Tồn đầu kỳ" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: showTonDauKyVND })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: "" })
                                tonDauKy.push({ name: showTonDauKyNT })
                                tonDauKy.forEach(item => {
                                    tonDauGL.push(item.name)
                                })
                                for (let i = 0;i < arrTong.length;i ++){
                                    merge.push({ s: { r: arrTong[i] - 1, c: 0 } , e: { r: arrTong[i] - 1, c: 7}})
                                    tonDauKy.forEach((item, index) => {
                                        excelStyle.push({
                                            cell: `${thatController.convertExcelColCharacter(index)}${arrTong[i]}`,
                                            style: {
                                                font: {
                                                    name: "times new roman",
                                                    sz: 13
                                                },
                                                alignment: {
                                                    horizontal: "right"
                                                },
                                                border: {
                                                    top: {
                                                        style: "thin",
                                                        color: "#000000"
                                                    },
                                                    bottom: {
                                                        style: "thin",
                                                        color: "#000000"
                                                    },
                                                    left: {
                                                        style: "thin",
                                                        color: "#000000"
                                                    },
                                                    right: {
                                                        style: "thin",
                                                        color: "#000000"
                                                    }
                                                }
                                            }
                                        })
                                    })
                                }
                                

                                var tonCuoiKy = []
                                tonCuoiKy.push({ name: "Tồn cuối kỳ" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: VND.format(sumTonCuoiKyVND) })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: "" })
                                tonCuoiKy.push({ name: showTonCuoiKyNT })
                                tonCuoiKy.forEach(item => {
                                    tonCuoiGL.push(item.name)
                                })

                                var psTrongKy = []
                                psTrongKy.push({ name: "Phát sinh trong kỳ" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: sumThuVND })
                                psTrongKy.push({ name: sumChiVND })
                                psTrongKy.push({ name: "" })
                                psTrongKy.push({ name: sumThuNT })
                                psTrongKy.push({ name: sumChiNT })
                                psTrongKy.push({ name: "" })
                                psTrongKy.forEach(item => {
                                    psGL.push(item.name)
                                })

                                tongRow = tongRow + result.items.length + 1
                                footer += 4 + result.items.length
   
                                excelData.push(gl)
                                excelData.push(tonDauGL)
                                excelData.push(psGL)
                                excelData.push(tonCuoiGL)


                                //xử lý data cho item
                                arrSorted.forEach(dataLine => {
                                    var chiVnd = ''
                                    var thuVnd = ''
                                    if (dataLine.IsNegativePosting && Number(dataLine.SoTienChiVND != 0)) {
                                        chiVnd = `(${VND.format(Number(Math.abs(dataLine.SoTienChiVND)))})`
                                    }
                                    else {
                                        chiVnd = VND.format(Number(Math.abs(dataLine.SoTienChiVND)))
                                    }
                                    if (dataLine.IsNegativePosting && Number(dataLine.SoTienThuVND != 0)) {
                                        thuVnd = `(${VND.format(Number((Math.abs(dataLine.SoTienThuVND))))})`
                                    }
                                    else {
                                        thuVnd = VND.format(Number(Math.abs(dataLine.SoTienThuVND)))
                                    }

                                    var chiNT = ''
                                    var thuNT = ''
                                    if (dataLine.IsNegativePosting && Number(dataLine.SoTienChiNT != 0)) {
                                        chiNT = `(${VND.format(Number(Math.abs(dataLine.SoTienChiNT)))})`
                                    }
                                    else {
                                        chiNT = VND.format(Number(Math.abs(dataLine.SoTienChiNT)))
                                    }
                                    if (dataLine.IsNegativePosting && Number(dataLine.SoTienThuNT != 0)) {
                                        thuNT = `(${VND.format(Number(Math.abs(dataLine.SoTienThuNT)))})`
                                    }
                                    else {
                                        thuNT = VND.format(Number(Math.abs(dataLine.SoTienThuNT)))
                                    }
                                    preTonVND += (Number(Math.abs(dataLine.SoTienThuVND)) - Number(Math.abs(dataLine.SoTienChiVND)))
                                    preTonNT += (Number(Math.abs(dataLine.SoTienThuNT)) - Number(Math.abs(dataLine.SoTienChiNT)))
                                    var showPreTonVND = ''
                                    var showPreTonNT = ''
                                    if (preTonVND < 0) {
                                        showPreTonVND = `(${VND.format(preTonVND * -1)})`
                                    } else { showPreTonVND = VND.format(preTonVND) }
                                    if (preTonNT < 0) {
                                        showPreTonNT = result.Currency != 'VND' ? `(${VND.format(preTonNT * -1)})` : 0
                                    } else { showPreTonNT = result.Currency != 'VND' ? VND.format(preTonNT) : 0 }

                                    var row = []
                                    listColMapping.forEach((col, index) => {
                                        if (col.name == 'Ngày ghi sổ' || col.name == 'Ngày'){
                                            dataLine[col.colField] = (dataLine[col.colField].getDate() + "/" + (dataLine[col.colField].getMonth() + 1) + "/" + dataLine[col.colField].getFullYear())
                                        }

                                        if (col.type == 'currency'){
                                            if (col.name == 'Thu'){
                                                row.push(thuVnd)
                                            }else if (col.name == 'Chi'){
                                                row.push(chiVnd)
                                            }else if (col.name == 'Tồn'){
                                                row.push(showPreTonVND)
                                            }
                                            excelStyle.push({
                                                cell: `${thatController.convertExcelColCharacter(index)}${rowIndex}`,
                                                style: {
                                                    font: {
                                                        name: "times new roman",
                                                        sz: 13
                                                    },
                                                    alignment: {
                                                        horizontal: "right"
                                                    },
                                                    border: {
                                                        top: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        bottom: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        left: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        right: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        }
                                                    }
                                                }
                                            })
                                        }else if (col.type == 'transcurrency'){
                                            if (col.name == 'Thu'){
                                                row.push(thuNT)
                                            }else if (col.name == 'Chi'){
                                                row.push(chiNT)
                                            }else if (col.name == 'Tồn'){
                                                row.push(showPreTonNT)
                                            }
                                            excelStyle.push({
                                                cell: `${thatController.convertExcelColCharacter(index)}${rowIndex}`,
                                                style: {
                                                    font: {
                                                        name: "times new roman",
                                                        sz: 13
                                                    },
                                                    alignment: {
                                                        horizontal: "right"
                                                    },
                                                    border: {
                                                        top: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        bottom: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        left: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        right: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        }
                                                    }
                                                }
                                            })
                                        }else{
                                            row.push(dataLine[col.colField] ? dataLine[col.colField] : " ")
                                            excelStyle.push({
                                                cell: `${thatController.convertExcelColCharacter(index)}${rowIndex}`,
                                                style: {
                                                    font: {
                                                        name: "times new roman",
                                                        sz: 13
                                                    },
                                                    alignment: {
                                                        horizontal: "center"
                                                    },
                                                    border: {
                                                        top: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        bottom: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        left: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        },
                                                        right: {
                                                            style: "thin",
                                                            color: "#000000"
                                                        }
                                                    }
                                                }
                                            })
                                        }
                                    })
                                    excelData.push(row)
                                    rowIndex += 1
                                })
                                rowIndex += 4


                                //Data truyền ra header
                                headerTonDauKyVND += Number(result.headerTonDauKyVND)
                                headerTonDauKyNT += Number(result.headerTonDauKyNT)
                                headerThuPhatSinhTrongKyVND += sumThuVND
                                headerThuPhatSinhTrongKyNT += sumThuNT
                                headerChiPhatSinhTrongKyVND += sumChiVND
                                headerChiPhatSinhTrongKyNT += sumChiNT
                                headerTonCuoiKyVND += sumTonCuoiKyVND
                                headerTonCuoiKyNT += sumTonCuoiKyNT

                                objData.accountName = data.Length > 1 ? '' : `${result.GLAccount}-${result.GLAccountLongName}`
                                objData.headerTonDauKyVND = headerTonDauKyVND
                                objData.headerTonDauKyNT = headerTonDauKyNT
                                objData.headerThuPhatSinhTrongKyVND = headerThuPhatSinhTrongKyVND
                                objData.headerThuPhatSinhTrongKyNT = headerThuPhatSinhTrongKyNT
                                objData.headerChiPhatSinhTrongKyVND = headerChiPhatSinhTrongKyVND
                                objData.headerChiPhatSinhTrongKyNT = headerChiPhatSinhTrongKyNT
                                objData.headerTonCuoiKyVND = headerTonCuoiKyVND
                                objData.headerTonCuoiKyNT = headerTonCuoiKyNT
                                objData.nameCompany = result.nameCompany ? result.nameCompany : objData.nameCompany
                                objData.DiaChiCty = result.DiaChiCty ? result.DiaChiCty : objData.DiaChiCty
                                objData.Currency = result.Currency ? result.Currency : objData.Currency
                                objData.GLAccount = result.GLAccount ? result.GLAccount : objData.GLAccount
                                objData.ThuQuy = result.ThuQuy ? result.ThuQuy : objData.ThuQuy
                                objData.KeToan = result.KeToan ? result.KeToan : objData.KeToan
                                objData.ToDate = result.ToDate ? result.ToDate : objData.ToDate
                                objData.FromDate = result.FromDate ? result.FromDate : objData.FromDate
                                objData.NgayMoSo = result.NgayMoSo ? result.NgayMoSo : objData.NgayMoSo
                                objData.NguoiDaiDien = result.NguoiDaiDien ? result.NguoiDaiDien : objData.NguoiDaiDien
                            })
                           

                            var showHeaderTonDauKyVND = ''
                            var showHeaderTonDauKyNT = ''
                            var showHeaderThuPhatSinhTrongKyVND = ''
                            var showHeaderChiPhatSinhTrongKyVND = ''
                            var showHeaderThuPhatSinhTrongKyNT = ''
                            var showHeaderChiPhatSinhTrongKyNT = ''
                            var showHeaderTonCuoiKyVND = ''
                            var showHeaderTonCuoiKyNT = ''
                            if (objData.headerTonDauKyVND < 0) {
                                showHeaderTonDauKyVND = `(${VND.format(objData.headerTonDauKyVND * -1)})`
                            } else { showHeaderTonDauKyVND = VND.format(objData.headerTonDauKyVND) }

                            if (objData.headerTonDauKyNT < 0) {
                                showHeaderTonDauKyNT = objData.Currency != 'VND' ? `(${VND.format(objData.headerTonDauKyNT * -1)})` : 0
                            } else { showHeaderTonDauKyNT = objData.Currency != 'VND' ? VND.format(objData.headerTonDauKyNT) : 0 }

                            if (objData.headerThuPhatSinhTrongKyVND < 0) {
                                showHeaderThuPhatSinhTrongKyVND = `(${VND.format(objData.headerThuPhatSinhTrongKyVND * -1)})`
                            } else { showHeaderThuPhatSinhTrongKyVND = VND.format(objData.headerThuPhatSinhTrongKyVND) }

                            if (objData.headerChiPhatSinhTrongKyVND < 0) {
                                showHeaderChiPhatSinhTrongKyVND = `${VND.format(objData.headerChiPhatSinhTrongKyVND * -1)}`
                            } else { showHeaderChiPhatSinhTrongKyVND = VND.format(objData.headerChiPhatSinhTrongKyVND) }

                            if (objData.headerThuPhatSinhTrongKyNT < 0) {
                                showHeaderThuPhatSinhTrongKyNT = `(${VND.format(objData.headerThuPhatSinhTrongKyNT * -1)})`
                            } else { showHeaderThuPhatSinhTrongKyNT = VND.format(objData.headerThuPhatSinhTrongKyNT) }

                            if (objData.headerChiPhatSinhTrongKyNT < 0) {
                                showHeaderChiPhatSinhTrongKyNT = `${VND.format(objData.headerChiPhatSinhTrongKyNT * -1)}`
                            } else { showHeaderChiPhatSinhTrongKyNT = VND.format(objData.headerChiPhatSinhTrongKyNT) }

                            if (objData.headerTonCuoiKyVND < 0) {
                                showHeaderTonCuoiKyVND = `(${VND.format(objData.headerTonCuoiKyVND * -1)})`
                            } else { showHeaderTonCuoiKyVND = VND.format(objData.headerTonCuoiKyVND) }

                            if (objData.headerTonCuoiKyNT < 0) {
                                showHeaderTonCuoiKyNT = objData.Currency != 'VND' ? `(${VND.format(objData.headerTonCuoiKyNT * -1)})` : 0
                            } else { showHeaderTonCuoiKyNT = objData.Currency != 'VND' ? VND.format(objData.headerTonCuoiKyNT) : 0 }

                            var concatDate = "Từ ngày " + ((objData.FromDate.getDate() < 10 ? '0' + objData.FromDate.getDate() : objData.FromDate.getDate()) + "/" + ((objData.FromDate.getMonth() + 1) < 10 ? '0' + (objData.FromDate.getMonth() + 1) : (objData.FromDate.getMonth() + 1)) + "/" + objData.FromDate.getFullYear())
                                + " đến ngày " + ((objData.ToDate.getDate() < 10 ? '0' + objData.ToDate.getDate() : objData.ToDate.getDate()) + "/" + ((objData.ToDate.getMonth() + 1) < 10 ? '0' + (objData.ToDate.getMonth() + 1) : (objData.ToDate.getMonth() + 1)) + "/" + objData.ToDate.getFullYear())

                            var mangTongTonDauKy = []
                            var mangTongPS = []
                            var mangTongTonCuoiKy = []
                            var tonDauKy = []
                            tonDauKy.push({ name: "Số tồn đầu kỳ" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: showHeaderTonDauKyVND })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: "" })
                            tonDauKy.push({ name: showHeaderTonDauKyNT })
                            var headerIndexDauKy = 10
                            tonDauKy.forEach((item, index) => {
                                mangTongTonDauKy.push(item.name)
                                excelStyle.push({
                                    cell: `${thatController.convertExcelColCharacter(index)}${headerIndexDauKy}`,
                                    style: {
                                        font: {
                                            name: "times new roman",
                                            sz: 13
                                        },
                                        alignment: {
                                            horizontal: "right",
                                        },
                                        border: {
                                            top: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            bottom: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            left: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            right: {
                                                style: "thin",
                                                color: "#000000"
                                            }
                                        }
                                    } 
                                })
                            })

                            var tonCuoiKy = []
                            tonCuoiKy.push({ name: "Số tồn cuối kỳ" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: showHeaderTonCuoiKyVND })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: "" })
                            tonCuoiKy.push({ name: showHeaderTonCuoiKyNT })
                            var headerIndexCuoiKy = 12
                            tonCuoiKy.forEach((item, index) => {
                                mangTongTonCuoiKy.push(item.name)
                                excelStyle.push({
                                    cell: `${thatController.convertExcelColCharacter(index)}${headerIndexCuoiKy}`,
                                    style: {
                                        font: {
                                            name: "times new roman",
                                            sz: 13
                                        },
                                        alignment: {
                                            horizontal: "right",
                                        },
                                        border: {
                                            top: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            bottom: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            left: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            right: {
                                                style: "thin",
                                                color: "#000000"
                                            }
                                        }
                                    } 
                                })
                            })

                            var psTrongKy = []
                            psTrongKy.push({ name: "Phát sinh trong kỳ" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: showHeaderThuPhatSinhTrongKyVND })
                            psTrongKy.push({ name: showHeaderChiPhatSinhTrongKyVND })
                            psTrongKy.push({ name: "" })
                            psTrongKy.push({ name: showHeaderThuPhatSinhTrongKyNT })
                            psTrongKy.push({ name: showHeaderChiPhatSinhTrongKyNT })
                            psTrongKy.push({ name: "" })
                            var headerIndexPS = 11
                            psTrongKy.forEach((item, index) => {
                                mangTongPS.push(item.name)
                                excelStyle.push({
                                    cell: `${thatController.convertExcelColCharacter(index)}${headerIndexPS}`,
                                    style: {
                                        font: {
                                            name: "times new roman",
                                            sz: 13
                                        },
                                        alignment: {
                                            horizontal: "right",
                                        },
                                        border: {
                                            top: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            bottom: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            left: {
                                                style: "thin",
                                                color: "#000000"
                                            },
                                            right: {
                                                style: "thin",
                                                color: "#000000"
                                            }
                                        }
                                    } 
                                })
                            })

                            footer += 2
                            arrFooter.push(footer)
                            footer += 2
                            arrFooter.push(footer)
                            footer += 3
                            arrFooter.push(footer)
                            merge.push({s : {r: arrFooter[0] - 1, c: 0}, e : {r: arrFooter[0] - 1, c: 1}})
                          

                            var blankCol = []
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            blankCol.push( {name: ""})
                            var blank = []
                            blankCol.forEach(item => {
                                blank.push(item.name) 
                            })
                            excelData.push(blank)

                            var ngay = []
                            ngay.push({name: objData.NgayMoSo ? `Ngày mở sổ: ${String(objData.NgayMoSo.getDate()).padStart(2, '0')}-${String(objData.NgayMoSo.getMonth() + 1).padStart(2, '0')}-${objData.NgayMoSo.getFullYear()}` : ''})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: "Ngày...tháng...năm"})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            ngay.push({name: ""})
                            var n = []
                            ngay.forEach(item => {
                                n.push(item.name)
                            })
                            for(let i =0;i < arrFooter.length;i ++){
                                ngay.forEach((item, index) => {
                                    excelStyle.push({
                                        cell: `${thatController.convertExcelColCharacter(index)}${arrFooter[i]}`,
                                        style: {
                                            font: {
                                                name: "times new roman",
                                                bold: true,
                                                sz: 13
                                            },
                                            alignment: {
                                                horizontal: "center",
                                                wrapText: '1',
                                                vertical: "center"
                                            }
                                        } 
                                    })
                                })
                            }
                            excelData.push(n)
                            excelData.push(blank)
                            
                            var ten = []
                            ten.push({name: ""})
                            ten.push({name: "THỦ QUỸ\n" + "(Ký, họ tên)"})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: "KẾ TOÁN TRƯỞNG\n" + "(Ký, họ tên)"})
                            ten.push({name: ""})
                            ten.push({name: "NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT\n" + "(Ký, họ tên)"})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            ten.push({name: ""})
                            var name = []
                            ten.forEach(item => {
                                name.push(item.name)
                            })
                            excelData.push(name)
                            excelData.push(blank)
                            excelData.push(blank)

                            var chuKy = []
                            chuKy.push({name: ""})
                            chuKy.push({name: objData.ThuQuy})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            chuKy.push({name: objData.KeToan})
                            chuKy.push({name: ""})
                            chuKy.push({name: objData.NguoiDaiDien})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            chuKy.push({name: ""})
                            var chuky = []
                            chuKy.forEach(item => {
                                chuky.push(item.name)
                            })
                            excelData.push(chuky)




                            var arrData = [
                                [objData.nameCompany, "", "", "", "", "", "", "", "", "", "","", "", text],
                                [objData.DiaChiCty, "", "", "", "", "", "", "", "", "", "", "", "", ""],
                                ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                                ["Sổ quỹ", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                                [objData.accountName, "", "", "", "", "", "", "", "", "", "", "", "", ""],
                                [concatDate, "", "", "", "", "", "", "", "", "", "", "", "", ""],
                                ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                                blankRow,
                                headerRow,
                                mangTongTonDauKy,
                                mangTongPS,
                                mangTongTonCuoiKy
                            ]

                            var worksheet = XLSX.utils.aoa_to_sheet(arrData)


                            worksheet["!merges"] = merge;

                            // Tạo độ rộng cho các ô
                            var colWidth = [
                                { wch: 20 },
                                { wch: 30 },
                                { wch: 20 },
                                { wch: 20 },
                                { wch: 50 },
                                { wch: 40 },
                                { wch: 40 },
                                { wch: 10 },
                                { wch: 20 },
                                { wch: 20 },
                                { wch: 20 },
                                { wch: 20 },
                                { wch: 20 },
                                { wch: 20 },
                            ]
                            worksheet["!cols"] = colWidth
                            console.log(excelData)
                            XLSX.utils.sheet_add_aoa(worksheet, excelData, { origin: -1 });
                            console.log("Sheet: ", worksheet)
                            var workbook = XLSX.utils.book_new()
                            XLSX.utils.book_append_sheet(workbook, worksheet, "SoQuy")

                            var style = {
                                font: {
                                    name: "times new roman",
                                    bold: true,
                                    sz: 13
                                },
                                alignment: {
                                    horizontal: "left"
                                }
                            }

                            var style_text = {
                                font: {
                                    name: "times new roman",
                                    bold: true,
                                    sz: 13
                                },
                                alignment: {
                                    horizontal: "center",
                                    wrapText: '1'
                                }
                            }

                            workbook.Sheets["SoQuy"].A1.s = style
                            workbook.Sheets["SoQuy"].A2.s = style
                            workbook.Sheets["SoQuy"].A4.s = style_text
                            workbook.Sheets["SoQuy"].A5.s = style_text
                            workbook.Sheets["SoQuy"].A6.s = style_text
                          
                            workbook.Sheets["SoQuy"].A8.v = "Ngày ghi sổ"
                            workbook.Sheets["SoQuy"].E8.v = "Tên người nộp/nhận tiền"
                            workbook.Sheets["SoQuy"].F8.v = "Mã người nộp/nhận tiền"
                            workbook.Sheets["SoQuy"].G8.v = "Diễn giải"
                            workbook.Sheets["SoQuy"].H8.v = "Loại tiền"
                            workbook.Sheets["SoQuy"].M1.v = text
                            workbook.Sheets["SoQuy"].M1.s = style_text
                            

                            excelStyle.forEach(value => {
                                workbook.Sheets["SoQuy"][value.cell].s = value.style
                            })
                            
                            XLSX.writeFile(workbook, "SoQuy.xlsx")
                            thatController.busyDialog.close()
                            thatController.arrItemFilter = []
                            thatController.lstGlaccount = []
                            thatController.arrHeaderData = []
                            thatController.arrData = []
                            thatController.mapData = new Map()
                        })
                    }
                })
            },
            convertExcelColCharacter: function (index){
                var result = '';
                do {
                    result = (index % 26 + 10).toString(36) + result;
                    index = Math.floor(index / 26) - 1;
                } while (index >= 0)
                return result.toUpperCase();
            }
        });
    });

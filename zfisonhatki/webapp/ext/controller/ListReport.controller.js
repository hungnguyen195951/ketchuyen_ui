sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/core/Fragment", "sap/m/MessageToast", "sap/ui/model/odata/v2/ODataModel", "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator","./xlsx/xlsx", './xlsx/xlsx.bundle'
],function(Controller, Fragment, MessageToast, ODataModel, Filter, FilterOperator){
    return {
        busyDialog: null,
        onInit: function(oEvent) {
            Fragment.load({
                id: "busyFragmentZFISONHATKI",
                name: "zfisonhatki.ext.fragment.Busy",
                type: "XML",
                controller: this
            }).then((oDialog) => {
                this.busyDialog = oDialog
                console.log(oDialog)
            }).catch(error => {
                MessageBox.error('Vui lòng tải lại trang')
            });

        },
        // onBeforeRebindTableExtension: function (oEvent) {
        //     console.log("Rebind Table: ", oEvent.getSource())
        //     //oEvent.getSource().deactivateColumns(['Posting View Item']);
            
        // },
        onInitSmartFilterBarExtension: function(oSource) {
            console.log('onInitSmartFilterBarExtension')
            var filterObject = this.getView().byId("listReportFilter")
            let defaultValue = {
                "FiscalYear": new Date().getFullYear().toString(),
                "CompanyCode": 1000,
                "$Parameter.FromDate": (new Date().getMonth() + 1) + "/" + new Date().getDate().toString() + "/" + new Date().getFullYear().toString(),
                "$Parameter.ToDate": (new Date().getMonth() + 1) + "/" + new Date().getDate().toString() + "/" + new Date().getFullYear().toString()
                // {
                //     "ranges": [{
                //         "exclude": false,
                //         "keyField": "$Parameter.FromDate",
                //         "operation": "EQ",
                //         "value1": new Date()
                //     }]
                // }
             }
             filterObject.setFilterData(defaultValue)
             console.log(filterObject.getFilterData())
             
        },
        count: 0,
        arrData: [],
        onExport: function(oEvent) {
            let thatController = this
            this.busyDialog.open()
            const VND = new Intl.NumberFormat('en-DE');
            var filter  = this.getView().byId("listReportFilter").getFilterData()
            var filters = this.getView().byId("listReportFilter").getFilters() 
            // var arrFilter = []
            
            // if (filter.CompanyCode) {
            //     if (filter.CompanyCode.items) {
            //         filter.CompanyCode.items.forEach(element => {
            //             arrFilter.push(new Filter("CompanyCode", "EQ", element.key))
            //         })
            //     }
            // }

            // if (filter.FiscalYear) {
            //     if (filter.FiscalYear.ranges) {
            //         filter.FiscalYear.ranges.forEach(element => {
            //             arrFilter.push(new Filter("FiscalYear", "EQ", element.value1))
            //         })
            //     }
            // }

            // if (filter.AccountingDocument) {
            //     if (filter.AccountingDocument.ranges) {
            //         filter.AccountingDocument.ranges.forEach(element => {
            //             arrFilter.push(new Filter("AccountingDocument", "EQ", element.value1))
            //         })
            //     }
            // }


            var mainUrl = "https://" + window.location.hostname + "/sap/opu/odata/sap/ZFI_UI_SONHATKI_V2";
            var oModel = new ODataModel(mainUrl, { json: true });         
            var url = this.getView().byId("listReportFilter").getParameterBindingPath();


            
            oModel.read(`${url}`, {
                filters: filters,
                urlParameters: {
                    "$inlinecount": "allpages"
                },
                success: function (count, response) {
                    thatController.count = count.__count
                    console.log(thatController.count)

                    var data = new Promise((resolve, reject) => {
                        var i = 0 
                        do {
                            oModel.read(`${url}`, {
                                filters: filters,
                                urlParameters: {
                                    "$top": 5000,
                                    "$skip": i,
                                    "$orderby": "PostingDate asc"
                                },
                                success: function (oData, response) {
                                    oData.results.forEach(element => {
                                        thatController.arrData.push(element)
                                    })
                                    resolve(thatController.arrData)
                                },
                                error: function (error) {
                                    console.log("Lỗi",)
                                    // reject(error)
                                }
                            })
                            i += 5000
                            if (i > thatController.count) {
                                i = thatController.count
                            }
                        } while (i < thatController.count)
                    })  
 
                    data.then((result) => {
                        if (result.length == 0){
                            MessageToast.show('Không có dữ liệu đã lọc')
                        }
                        
                        var excelData = []
                        var excelStyle = []
                        var headerRow = []
                        var subHeader = []

                        var blankCol = []
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "Chứng từ" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "Khách hàng" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "Số tiền VND" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "Số tiền ngoại tệ" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.push({ name: "" })
                        blankCol.forEach((item, index) => {
                            var headerindex = 8
                            headerRow.push(item.name)
                            excelStyle.push({
                                cell: `${thatController.convertExcelColCharacter(index)}${headerindex}`,
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
                                        top: { style: "thin", color: "#000000" },
                                        bottom: { style: "thin", color: "#000000" },
                                        left: { style: "thin", color: "#000000" },
                                        right: { style: "thin", color: "#000000" }
                                    },
                                    fill: {
                                        fgColor: { rgb: "92D050" }
                                    }
                                }
                            })
                        })

                        var listColMapping = []
                        listColMapping.push({ name: "Ngày ghi sổ", colField: "PostingDate", type: "text" })
                        listColMapping.push({ name: "Ngày chứng từ", colField: "DocumentDate", type: "text" })
                        listColMapping.push({ name: "Số chứng từ", colField: "AccountingDocument", type: "text" })
                        listColMapping.push({ name: "Reversal Reference Document", colField: "ReversalReferenceDocument", type: "text" })
                        listColMapping.push({ name: "Số hóa đơn", colField: "DocumentReferenceID", type: "text" })
                        listColMapping.push({ name: "Mã đối tượng", colField: "cus_sup", type: "text" })
                        listColMapping.push({ name: "Tên đối tượng", colField: "ten_dt", type: "text" })
                        listColMapping.push({ name: "Mã đối tượng (Customer Segment)", colField: "cus_segment", type: "text" })
                        listColMapping.push({ name: "Tên đối tượng (Customer Segment)", colField: "name_cus_segment", type: "text" })
                        listColMapping.push({ name: "Diễn giải", colField: "dien_giai", type: "text" })
                        listColMapping.push({ name: "Tài khoản", colField: "GLAccount", type: "text" })
                        listColMapping.push({ name: "Tài khoản đối ứng", colField: "tk_doi_ung", type: "text" })
                        listColMapping.push({ name: "Loại tiền", colField: "TransactionCurrency", type: "text" })
                        listColMapping.push({ name: "Nợ", colField: "no_VND", type: "currency" })
                        listColMapping.push({ name: "Có", colField: "co_VND", type: "currency" })
                        listColMapping.push({ name: "Nợ", colField: "no_NT", type: "currency" })
                        listColMapping.push({ name: "Có", colField: "co_NT", type: "currency" })
                        listColMapping.push({ name: "Bộ phận", colField: "CostCenter", type: "text" })
                        listColMapping.push({ name: "Vụ việc", colField: "vu_viec", type: "text" })
                        listColMapping.push({ name: "Sản phẩm", colField: "Product", type: "text" })
                        listColMapping.push({ name: "Hợp đồng", colField: "AssetContract", type: "text" })
                        listColMapping.push({ name: "Ngày tạo", colField: "ngay_tao", type: "text" })
                        listColMapping.push({ name: "Ngày sửa", colField: "JournalEntryLastChangeDateTime", type: "text" })
                        listColMapping.push({ name: "Người tạo", colField: "AccountingDocCreatedByUser", type: "text" })
                        listColMapping.forEach((item, index) => {
                            var headerindex = 9
                            subHeader.push(item.name)
                            excelStyle.push({
                                cell: `${thatController.convertExcelColCharacter(index)}${headerindex}`,
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
                                        top: { style: "thin", color: "#000000" },
                                        bottom: { style: "thin", color: "#000000" },
                                        left: { style: "thin", color: "#000000" },
                                        right: { style: "thin", color: "#000000" }
                                    },
                                    fill: {
                                        fgColor: { rgb: "92D050" }
                                    }
                                }
                            })
                        })

                        var totalRow = []
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.push({ name: "" })
                        totalRow.forEach((item, index) => {
                            var headerindex = 10
                            if ((thatController.convertExcelColCharacter(index) + headerindex) == 'A10'){
                                excelStyle.push({
                                    cell: `${thatController.convertExcelColCharacter(index)}${headerindex}`,
                                    style: {
                                        font: {
                                            name: "times new roman",
                                            bold: true,
                                            sz: 13
                                        },
                                        alignment: {
                                            horizontal: "right"
                                        },
                                        border: {
                                            top: { style: "thin", color: "#000000" },
                                            bottom: { style: "thin", color: "#000000" },
                                            left: { style: "thin", color: "#000000" },
                                            right: { style: "thin", color: "#000000" }
                                        }
                                    }
                                })
                            }else{
                                excelStyle.push({
                                    cell: `${thatController.convertExcelColCharacter(index)}${headerindex}`,
                                    style: {
                                        font: {
                                            name: "times new roman",
                                            sz: 13
                                        },
                                        alignment: {
                                            horizontal: "right"
                                        },
                                        border: {
                                            top: { style: "thin", color: "#000000" },
                                            bottom: { style: "thin", color: "#000000" },
                                            left: { style: "thin", color: "#000000" },
                                            right: { style: "thin", color: "#000000" }
                                        }
                                    }
                                })
                            }
                        })


                        var noVND
                        var coVND
                        var noNT
                        var coNT

                        var tenCTY = ''
                        var diaChi = ''
                        var mst = ''
                        var tongNoVND = 0;
                        var tongCoVND = 0
                        var tongNoNgoaiTe = 0
                        var tongCoNgoaiTe = 0

                        var tuNgay
                        filter['$Parameter.FromDate'].ranges.forEach(item => {
                            tuNgay = item.value1
                        })

                        var denNgay
                        filter['$Parameter.ToDate'].ranges.forEach(item => {
                            denNgay = item.value1
                        })

                        var rowIndex = 11
                        
                        result.forEach(value => {
                            tenCTY = value.ten_cty
                            diaChi = value.dia_chi
                            mst = value.VATRegistration
                            tongNoVND += Number(value.no_VND)
                            tongCoVND += Number(value.co_VND)
                            tongNoNgoaiTe += Number(value.no_NT)
                            tongCoNgoaiTe += Number(value.co_NT)
    
                            /*157 - 179: Xử lý phát sinh có tích negative hoặc không tích negative*/
                            if ((value.no_VND <= 0 && value.IsNegativePosting == true) || (value.no_VND >= 0 && value.IsNegativePosting == true)) {
                                noVND =  (value.no_VND = 0 ? 0 : ("(" + VND.format(Math.abs(value.no_VND)) + ")"))
                            } else if ((value.no_VND <= 0 && value.IsNegativePosting == false) || (value.no_VND >= 0 && value.IsNegativePosting == false)){
                                noVND = VND.format(Math.abs(value.no_VND))
                            }
    
                            if ((value.co_VND <= 0 && value.IsNegativePosting == true) || (value.co_VND >= 0 && value.IsNegativePosting == true)) {
                                coVND =  (value.co_VND = 0 ? 0 : ("(" + VND.format(Math.abs(value.co_VND)) + ")"))
                            } else if ((value.co_VND <= 0 && value.IsNegativePosting == false) || (value.co_VND >= 0 && value.IsNegativePosting == false)){
                                coVND = VND.format(Math.abs(value.co_VND))
                            }
    
                            if ((value.no_NT <= 0 && value.IsNegativePosting == true) || (value.no_NT >= 0 && value.IsNegativePosting == true)) {
                                noNT = (value.no_NT = 0 ? 0 : ("(" + VND.format(Math.abs(value.no_NT)) + ")"))
                            } else if ((value.no_NT <= 0 && value.IsNegativePosting == false) || (value.no_NT >= 0 && value.IsNegativePosting == false)){
                                noNT = VND.format(Math.abs(value.no_NT))
                            }
    
                            if ((value.co_NT <= 0 && value.IsNegativePosting == true) || (value.co_NT >= 0 && value.IsNegativePosting == true)) {
                                coNT = (value.co_NT = 0 ? 0 : ("(" + VND.format(Math.abs(value.co_NT)) + ")"))
                            } else if ((value.co_VND <= 0 && value.IsNegativePosting == false) || (value.co_NT >= 0 && value.IsNegativePosting == false)){
                                coNT = VND.format(Math.abs(value.co_NT))
                            }
                            
                            var row = []
                        
                            listColMapping.forEach((col, index) => {
                                // if (col.colField == 'PostingDate' || col.colField == 'DocumentDate' || col.colField == 'ngay_tao' || col.colField == 'JournalEntryLastChangeDateTime'){
                                //     value[col.colField] = ((value[col.colField].getDate() < 10 ? '0' + value[col.colField].getDate() : value[col.colField].getDate()) + "/" +((value[col.colField].getMonth() + 1) < 10 ? '0' + (value[col.colField].getMonth() + 1) : (value[col.colField].getMonth() + 1)) + "/" + value[col.colField].getFullYear())
                                // }
    
                                if(col.type == 'currency'){
                                    if (col.colField == 'no_VND'){
                                        value[col.colField] = noVND
                                    }else if (col.colField == 'co_VND'){
                                        value[col.colField] = coVND
                                    }else if (col.colField == 'no_NT'){
                                        value[col.colField] = noNT
                                    }else if (col.colField == 'co_NT'){
                                        value[col.colField] = coNT
                                    }
    
                                    excelStyle.push({
                                        cell: `${thatController.convertExcelColCharacter(index)}${rowIndex}`,
                                        style: {
                                            alignment: {
                                                horizontal: "right"
                                            },
                                            font: {
    
                                                name: "times new roman",
                                                sz: 13
                                            },
                                            border: {
                                                top: { style: "thin", color: "#000000" },
                                                bottom: { style: "thin", color: "#000000" },
                                                right: { style: "thin", color: "#000000" },
                                                left: { style: "thin", color: "#000000" }
                                            }
                                        }
                                    })
                                }else{
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
                                                bottom: { style: "thin", color: "#000000" },
                                                right: { style: "thin", color: "#000000" },
                                                left: { style: "thin", color: "#000000" }
                                            }
                                        }
                                    })
                                }
                                row.push(value[col.colField] ? value[col.colField] : " ")
                            })
                            excelData.push(row)
                            rowIndex += 1
                        })

                        var concatDate = "Từ ngày " + ((tuNgay.getDate() < 10 ? '0' + tuNgay.getDate() : tuNgay.getDate()) + "/" + ((tuNgay.getMonth() + 1) < 10 ? '0' + (tuNgay.getMonth() + 1) : (tuNgay.getMonth() + 1)) + "/" + tuNgay.getFullYear()) + " đến ngày " + ((denNgay.getDate() < 10 ? '0' + denNgay.getDate() : denNgay.getDate()) + "/" + ((denNgay.getMonth() + 1) < 10 ? '0' + (denNgay.getMonth() + 1) : (denNgay.getMonth() + 1)) + "/" + denNgay.getFullYear())

                        var arrData = [
                            [tenCTY, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                            [diaChi, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                            [("MST (VAT Reg. No.): " + mst), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", "Bảng Kê Chứng Từ", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", concatDate, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                            headerRow,
                            subHeader,
                            ["Tổng cộng", "", "", "", "", "", "", "", "", "", "", "", "", "", VND.format(tongNoVND), VND.format(tongCoVND), VND.format(tongNoNgoaiTe), VND.format(tongCoNgoaiTe), "", "", "", "", "", "", ""]
                        ]

                        var worksheet = XLSX.utils.aoa_to_sheet(arrData)


                        var merge = [
                            { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, //Merge tên cty
                            { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, //Merge địa chỉ
                            { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, //Merge mst
                            { s: { r: 4, c: 4 }, e: { r: 4, c: 14 } }, //Merge title
                            { s: { r: 5, c: 4 }, e: { r: 5, c: 14 } }, //Merge từ ngày đến ngày
                            { s: { r: 7, c: 0 }, e: { r: 8, c: 0 } }, //Merge ngày ghi sổ
                            { s: { r: 7, c: 1 }, e: { r: 7, c: 4 } }, //Merge chứng từ
                            { s: { r: 7, c: 5 }, e: { r: 7, c: 8 } }, //Khách hàng
                            { s: { r: 7, c: 9 }, e: { r: 8, c: 9 } }, //Merge diễn giải
                            { s: { r: 7, c: 10 }, e: { r: 8, c: 10 } }, //Merge tài khoản
                            { s: { r: 7, c: 11 }, e: { r: 8, c: 11 } }, //Merge tài khoản đối ứng
                            { s: { r: 7, c: 12 }, e: { r: 8, c: 12 } }, //Merge loại tiền
                            { s: { r: 7, c: 13 }, e: { r: 7, c: 14 } }, //Merge số tiền VND
                            { s: { r: 7, c: 15 }, e: { r: 7, c: 16 } }, //Merge số tiền ngoại tệ
                            { s: { r: 7, c: 17 }, e: { r: 8, c: 17 } }, //Merge bộ phận
                            { s: { r: 7, c: 18 }, e: { r: 8, c: 18 } }, //Merge sản phẩm
                            { s: { r: 7, c: 19 }, e: { r: 8, c: 19 } }, //Merge hợp đồng
                            { s: { r: 7, c: 20 }, e: { r: 8, c: 20 } }, //Merge ngày tạo
                            { s: { r: 7, c: 21 }, e: { r: 8, c: 21 } }, //Merge ngày sửa
                            { s: { r: 7, c: 22 }, e: { r: 8, c: 22 } }, //Merge ngày tạo
                            { s: { r: 9, c: 0 }, e: { r: 9, c: 12 } },//Merge tổng cộng
                            { s: { r: 7, c: 23 }, e: { r: 8, c: 23 } }//Merge người tạo
                        ]

                        var colWidth = [
                            { wch: 20 },
                            { wch: 20 },
                            { wch: 20 },
                            { wch: 40 },
                            { wch: 30 },
                            { wch: 20 },
                            { wch: 124 },
                            { wch: 40 },
                            { wch: 124 },
                            { wch: 55 },
                            { wch: 20 },
                            { wch: 30 },
                            { wch: 20 },
                            { wch: 30 },
                            { wch: 30 },
                            { wch: 30 },
                            { wch: 30 },
                            { wch: 55 },
                            { wch: 60 },
                            { wch: 65 },
                            { wch: 20 },
                            { wch: 20 },
                            { wch: 20 },
                            { wch: 20 }
                        ]


                        worksheet['!cols'] = colWidth
                        worksheet['!merges'] = merge
                        console.log('Sheet: ', worksheet)
                        XLSX.utils.sheet_add_aoa(worksheet, excelData, { origin: -1 });
                        var workbook = XLSX.utils.book_new()
                        XLSX.utils.book_append_sheet(workbook, worksheet, "SoNhatKyChung")

                        var style = {
                            font: {
                                name: "times new roman",
                                sz: 14,
                                color: {
                                    rgb: "000000"
                                }
                            }
                        }

                        var title = {
                            // fill: {
                            //     fgColor: {
                            //         rgb: "CCFFCC"
                            //     }
                            // },
                            font: {
                                name: "times new roman",
                                bold: true,
                                sz: 24,
                                color: {
                                    rgb: "000000"
                                }
                            },
                            alignment: {
                                horizontal: "center"
                            }
                        }

                        var date_style = {
                            font: {
                                name: "times new roman",
                                sz: 14,
                                color: {
                                    rgb: "000000"
                                }
                            },
                            alignment: {
                                horizontal: "center"
                            }
                        }


                        workbook.Sheets["SoNhatKyChung"].A1.s = style
                        workbook.Sheets["SoNhatKyChung"].A1.v = tenCTY
                        workbook.Sheets["SoNhatKyChung"].A2.s = style
                        workbook.Sheets["SoNhatKyChung"].A2.v = diaChi
                        workbook.Sheets["SoNhatKyChung"].A3.s = style
                        workbook.Sheets["SoNhatKyChung"].A3.v = ("MST (VAT Reg. No.): " + mst)
                        workbook.Sheets["SoNhatKyChung"].E5.s = title
                        workbook.Sheets["SoNhatKyChung"].E5.v = "Bảng kê chứng từ"
                        workbook.Sheets["SoNhatKyChung"].E6.s = date_style
                        workbook.Sheets["SoNhatKyChung"].E6.v = concatDate

                        //header
                        workbook.Sheets["SoNhatKyChung"].A8.v = "Ngày ghi sổ"
                        workbook.Sheets["SoNhatKyChung"].B8.v = "Chứng từ"
                        workbook.Sheets["SoNhatKyChung"].F8.v = "Khách hàng"
                        workbook.Sheets["SoNhatKyChung"].J8.v = "Diễn giải"
                        workbook.Sheets["SoNhatKyChung"].K8.v = "Tài khoản"
                        workbook.Sheets["SoNhatKyChung"].L8.v = "Tài khoản đối ứng"
                        workbook.Sheets["SoNhatKyChung"].M8.v = "Loại tiền"
                        workbook.Sheets["SoNhatKyChung"].N8.v = "Số tiền VND"
                        workbook.Sheets["SoNhatKyChung"].P8.v = "Số tiền ngoại tệ"
                        workbook.Sheets["SoNhatKyChung"].R8.v = "Bộ phận"
                        workbook.Sheets["SoNhatKyChung"].S8.v = "Vụ việc"
                        workbook.Sheets["SoNhatKyChung"].T8.v = "Sản phẩm"
                        workbook.Sheets["SoNhatKyChung"].U8.v = "Hợp đồng"
                        workbook.Sheets["SoNhatKyChung"].V8.v = "Ngày tạo"
                        workbook.Sheets["SoNhatKyChung"].W8.v = "Ngày sửa"
                        workbook.Sheets["SoNhatKyChung"].X8.v = "Người tạo"
                        workbook.Sheets["SoNhatKyChung"].A10.v = "Tổng cộng"


                        workbook.Sheets["SoNhatKyChung"].N10.v = VND.format(tongNoVND)
                        workbook.Sheets["SoNhatKyChung"].O10.v = VND.format(tongCoVND)
                        workbook.Sheets["SoNhatKyChung"].P10.V = VND.format(tongNoNgoaiTe)
                        workbook.Sheets["SoNhatKyChung"].Q10.V = VND.format(tongCoNgoaiTe)

                        excelStyle.forEach(value => {
                            workbook.Sheets["SoNhatKyChung"][value.cell].s = value.style
                        })

                        XLSX.writeFile(workbook, "SoNhatKyChung.xlsx")                    
                        thatController.clearArray(thatController.arrData)
                        thatController.busyDialog.close()    
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
        },
        clearArray: function (array) {
            while (array.length > 0) {
                array.pop();
            }
        }
    }
})
sap.ui.define([
   "sap/ui/core/mvc/Controller", "sap/ui/core/Fragment", "sap/ui/model/odata/v2/ODataModel", "sap/m/MessageBox"
], function (Controller, Fragment, MessageBox) {
   return {
      busyDialog: null,
      onInitSmartFilterBarExtension: function (oEvent) {
         //Get SmartFilterBar
         var oGlobalFilter = this.getView()
         var oGlobalFilter2 = oEvent.getSource();

         var oGlobalFilter1 = this.getView().byId("zbbtrahang::sap.suite.ui.generic.template.ListReport.view.ListReport::ZFI_I_BIENBANTRAHANG--listReportFilter"
         );
         var lowValue = new Date(new Date().getFullYear(), 0, 1);
         var oToday = new Date();
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
         console.log(oDefaultFilter)
         console.log(oGlobalFilter)
         console.log(oGlobalFilter1)
         console.log(oGlobalFilter2)
         //Set SmartFilterBar initial values
         oGlobalFilter2.setFilterData(oDefaultFilter);
         //   oGlobalFilter1.setFilterData(oDefaultFilter);
         //   oGlobalFilter2.setFilterData(oDefaultFilter);
      },
      onInit: function (oEvent) {
         Fragment.load({
            id: "idBusyDialogBBTraHang",
            name: "zbbtrahang.ext.fragments.Busy",
            type: "XML",
            controller: this
         })
            .then((oDialog) => {
               this.busyDialog = oDialog;
               console.log(this.busyDialog())
            })
            .catch(error => {
               // MessageBox.error('Vui lòng tải lại trang')
            });
      },
      onActionPrint: function (oEvent, aSelectedContexts, ODataModel, oContext) {
         function getFormatDate(dateFormat,so) {
            var date = dateFormat.getDate() < 10 ? `0${dateFormat.getDate()
               }` : dateFormat.getDate();
            var month = dateFormat.getMonth() + 1 < 10 ? `0${dateFormat.getMonth() + 1
               }` : dateFormat.getMonth() + 1;
            var year = dateFormat.getFullYear();
            if(so == 1){
               var dateDone = `${date}/${month}/${year}`;
               return dateDone;
            }
            else{
               var dateDone = `ngày ${date} tháng ${month} năm ${year}`;
               return dateDone;
            }

         }
         function getForMatTax(tax){
            var taxFormat = tax.charAt(0)
            for (let i = 1 ; i < tax.length ; i++){
               taxFormat += ` ` + tax.charAt(i);
            }
            return taxFormat;
         }
         let controller = this
         this.busyDialog.open()
         let aContexts = this.extensionAPI.getSelectedContexts();
         var ListHeader = [];
         let arrSOs = []

         // arrPromise = []
         // arrSOs.forEach
         //  arrPromise.push(new Promise(arrSO))
         // Promise.all(arrPromise)
         // .then((value)=>{

         // })
         console.log(aContexts)
         aContexts.forEach(element => {
            let OModal = element.getModel()
            console.log(OModal)
            OModal.read(`${element.getPath()
               }`, {
               success: function (dataHeader, oResponse) {
                  console.log(dataHeader)
                  var ListItem = '';
                  OModal.read(`${element.getPath()
                     }/to_ITEM`, {
                     success: function (oDataItem, oResponse) {
                        
                        var optionReturn = dataHeader.SD02
                        var optioneDoc = dataHeader.SD03
                        var isExistSO = ListHeader.find((element) => element == dataHeader.SalesDocument);
                        console.log(isExistSO)
                        console.log(dataHeader.SalesDocument)
                        console.log(!isExistSO)
                        console.log(ListHeader)
                        if (isExistSO == undefined) {
                           ListHeader.push(dataHeader.SalesDocument);
                           var mstBenBan = getForMatTax(dataHeader.TaxCodeOrg)
                           var mstBenMua = getForMatTax(dataHeader.TaxCustomer);
                           var dateHoaDon = dataHeader.NgayHoaDonBanHang != null ? getFormatDate(dataHeader.NgayHoaDonBanHang,1) : '';
                           var lsHeader = `
                        <Subform1>
                           <Subform11>
                              <Subform12/>
                              <Subform13/>
                           </Subform11>
                           <Subform14/>
                        </Subform1>
                        <Subform2>
                           <SO>${dataHeader.SalesDocument
                              }</SO>
                           <Subform7>
                                        <NgayChungTu>${getFormatDate(dataHeader.SalesDocumentDate,0)}</NgayChungTu>        
                           </Subform7>
                           <TenCongTyA><![CDATA[${dataHeader.NameOrg
                              }]]></TenCongTyA>
                           <DiaChiCongTyA>${dataHeader.AdddressOrg
                              }</DiaChiCongTyA>
                           <Subform3>
                              <DienThoaiCongTyA>${dataHeader.PhoneNumberOrg
                              }</DienThoaiCongTyA>
                              <FaxCongTyA>${dataHeader.FaxOrg
                              }</FaxCongTyA>
                           </Subform3>
                           <MaSoThueA>${mstBenBan
                              }</MaSoThueA>
                           <Subform4>
                              <ChucVuA>${dataHeader.ChucVuBenBan}</ChucVuA>
                              <DaiDienA>${dataHeader.DaiDienBenBan}</DaiDienA>
                           </Subform4>
                           <TenCongTyB><![CDATA[${dataHeader.NameCustomer
                              }]]></TenCongTyB>
                           <DiaChiCongTyB>${dataHeader.AddressCustomer
                              }</DiaChiCongTyB>
                           <Subform5>
                              <DienThoaiCongTyB>${dataHeader.TelephoneCustomer
                              }</DienThoaiCongTyB>
                              <FaxCongTyB>${dataHeader.FaxCustomer
                              }</FaxCongTyB>
                           </Subform5>
                           <MaSoThueB>${mstBenMua
                              }</MaSoThueB>
                           <Subform6>
                              <DaiDienB>${dataHeader.DaiDienBenNhan}</DaiDienB>
                              <ChucVuB>${dataHeader.ChucVuBenNhan}</ChucVuB>
                           </Subform6>
                           <Subform17>
                           <CheckBox2>${optionReturn == 'Z1' ? 1 : 0}</CheckBox2>
                           <CheckBox3>${optionReturn == 'Z2' ? 1 : 0}</CheckBox3>
                        </Subform17>
                           <Subform8>
                              <SoHoaDonBanHang>${dataHeader.SoHoaDonBanHang
                              }</SoHoaDonBanHang>
                              <PostingDate>${dateHoaDon
                              }</PostingDate>
                                        <KiHieu>${dataHeader.KiHieuHoaDonBanHang
                              }</KiHieu>
                           </Subform8>
                        </Subform2>
                        <Subform9>`
                           var ThueGTGT = Number(Number(dataHeader.SumThanhTien) * 5 / 100);
                           console.log(ThueGTGT.toFixed(0))
                           var SumTongCong = Number(ThueGTGT.toFixed(0)) + Number(dataHeader.SumThanhTien)
                           var lsFooterItem = ` <FooterRow>
                     <SumTruocThue>${dataHeader.SumThanhTien.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")
                              }</SumTruocThue>
                  </FooterRow>
                  <FooterRow>
                     <GiaThue>${ThueGTGT.toFixed(0).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")
                              }</GiaThue>
                  </FooterRow>
                  <FooterRow>
                     <SumTongCong>${SumTongCong.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")
                              }</SumTongCong>
                  </FooterRow>`;


                           console.log(oDataItem.results)
                           var stt = 0;
                           oDataItem.results.forEach(data => {
                              var convertNumericToNumber = Number(data.CharcToNumericValue).toFixed(0).toString();
                              var dateFormatHSD =
                                 convertNumericToNumber = '0' ? '00/00/0000' : convertNumericToNumber.substring(6) + '/' +
                                    convertNumericToNumber.substring(4, 6) + '/' +
                                    convertNumericToNumber.substring(0, 4)
                              stt++;
                              console.log(dateFormatHSD)
                              console.log(convertNumericToNumber)
                              console.log(convertNumericToNumber.substring(6))
                              var displayTenHang
                              if(data.SalesText != ''){
                                 displayTenHang = data.Material + ` ` + data.SalesText 
                              }else{
                                 displayTenHang = data.Material + ` ` +  data.ProductName
                              }
                              ListItem = ListItem + `   <Row1>
                        <STT>${stt}</STT>
                        <TenHang><![CDATA[${displayTenHang}]]></TenHang>
                        <SoLo><![CDATA[${data.CharcValue
                                 }]]></SoLo>
                        <HanDung><![CDATA[${dateFormatHSD
                                 }]]></HanDung>
                        <ĐVT>${data.UnitOfMeasureLongName
                                 }</ĐVT>
                        <SoLuong>${data.SumOrderQuanity
                                 }</SoLuong>
                        <DonGia>${data.NetPriceAmount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")
                                 }</DonGia>
                        <ThanhTien>${data.SumNetAmount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")
                                 }</ThanhTien>
                     </Row1>`;

                           })
                           console.log(ListItem)
                           console.log(lsHeader)
                           console.log(lsFooterItem)
                           var lsFooter = `       <Subform20>
                                    <LyDoTraHang>${dataHeader.LyDoTraHang}</LyDoTraHang>
                                 </Subform20>
                                 <Subform19>
                                    <Subform10>
                                    ${optioneDoc == 'Z1' ? ` <CheckBox1>1</CheckBox1>
                                    <LapDieuChinhHoaDon>${dataHeader.SoHoaDonBanHang}</LapDieuChinhHoaDon>
                                    <NgayLapDieuChinhHoaDon>${dateHoaDon}</NgayLapDieuChinhHoaDon>
                                    <KiHieuLapDieuChinh>${dataHeader.KiHieuHoaDonBanHang}</KiHieuLapDieuChinh>` : `
                                    <CheckBox1>0</CheckBox1>
                                    <LapDieuChinhHoaDon></LapDieuChinhHoaDon>
                                    <NgayLapDieuChinhHoaDon></NgayLapDieuChinhHoaDon>
                                    <KiHieuLapDieuChinh></KiHieuLapDieuChinh>`}
                                    </Subform10>
                                    <Subform10>
                                    ${optioneDoc == 'Z2' ? ` <CheckBox1>1</CheckBox1>
                                    <HuyHoaDon>${dataHeader.SoHoaDonBanHang}</HuyHoaDon>
                                    <NgayHuyHoaDon>${dateHoaDon}</NgayHuyHoaDon>
                                    <KiHieuHuy><![CDATA[${dataHeader.KiHieuHoaDonBanHang}]]></KiHieuHuy>` : `
                                    <CheckBox1>0</CheckBox1>
                                    <HuyHoaDon></HuyHoaDon>
                                    <NgayHuyHoaDon></NgayHuyHoaDon>
                                    <KiHieuHuy></KiHieuHuy>`}
                                    </Subform10>
                                 </Subform19>
                                 <TaiKhoanThanhToan>${dataHeader.TaiKhoan}</TaiKhoanThanhToan>
                                 <SoTaiKhoanThanhToan>${dataHeader.SoTaiKhoan}</SoTaiKhoanThanhToan>
                                 <ThanhToanTai>${dataHeader.TenNganHang}</ThanhToanTai>
                                 <Subform15>
                                    <Subform16/>
                                    <Subform16/>
                                 </Subform15>
                                 <Subform18/>
                              </Subform9>`;
                           var xml = `<?xml version="1.0" encoding="UTF-8"?>
                    <form1>
                    ${lsHeader}
                    <Table1>
                    <HeaderRow/>
                    ${ListItem}
                    ${lsFooterItem}
                    </Table1>
                    ${lsFooter}
                    </form1>
                    `;
                           var xml1 = `<?xml version="1.0" encoding="UTF-8"?>
                                    <form1>
                                       <Subform1>
                                          <Subform11>
                                             <Subform12/>
                                             <Subform13/>
                                          </Subform11>
                                          <Subform14/>
                                       </Subform1>
                                       <Subform2>
                                          <SO>Ego ille</SO>
                                          <Subform7>
                                             <NgayChungTu>Si manu vacuas</NgayChungTu>
                                          </Subform7>
                                          <TenCongTyA>Apros tres et quidem</TenCongTyA>
                                          <DiaChiCongTyA>Mirum est</DiaChiCongTyA>
                                          <Subform3>
                                             <DienThoaiCongTyA>Licebit auctore</DienThoaiCongTyA>
                                             <FaxCongTyA>Proinde</FaxCongTyA>
                                          </Subform3>
                                          <MaSoThueA>Am undique</MaSoThueA>
                                          <Subform4>
                                             <ChucVuA>Ad retia sedebam</ChucVuA>
                                             <DaiDienA>Vale</DaiDienA>
                                          </Subform4>
                                          <TenCongTyB>Ego ille</TenCongTyB>
                                          <DiaChiCongTyB>Si manu vacuas</DiaChiCongTyB>
                                          <Subform5>
                                             <DienThoaiCongTyB>Apros tres et quidem</DienThoaiCongTyB>
                                             <FaxCongTyB>Mirum est</FaxCongTyB>
                                          </Subform5>
                                          <MaSoThueB>Licebit auctore</MaSoThueB>
                                          <Subform6>
                                             <DaiDienB>Proinde</DaiDienB>
                                             <ChucVuB>Am undique</ChucVuB>
                                          </Subform6>
                                          <Subform17>
                                             <CheckBox2>0</CheckBox2>
                                             <CheckBox3>0</CheckBox3>
                                          </Subform17>
                                          <Subform8>
                                             <SoHoaDonBanHang>Ad retia sedebam</SoHoaDonBanHang>
                                             <PostingDate>Vale</PostingDate>
                                             <KiHieu>Ego ille</KiHieu>
                                          </Subform8>
                                       </Subform2>
                                       <Subform9>
                                          <Table1>
                                             <HeaderRow/>
                                             <Row1>
                                                <STT>Mirum est ut animus agitatione motuque corporis excitetut.</STT>
                                                <TenHang>Ad retia sedebam: erat in proximo non venabulum aut lancea, sed stilus et pugilares:</TenHang>
                                                <SoLo>meditabar aliquid enotabamque, ut, si manus vacuas, plenas tamen ceras reportarem.</SoLo>
                                                <HanDung>Iam undique silvae et solitudo ipsumque illud silentium quod venationi datur magna cogitationis incitamenta sunt.</HanDung>
                                                <ĐVT>Proinde cum venabere, licebit, auctore me, ut panarium et lagunculam sic etiam pugillares feras.</ĐVT>
                                                <SoLuong>Experieris non Dianam magis montibus quam Minervam inerare.</SoLuong>
                                                <DonGia>Mirum est ut animus agitatione motuque corporis excitetut.</DonGia>
                                                <ThanhTien>Ad retia sedebam: erat in proximo non venabulum aut lancea, sed stilus et pugilares:</ThanhTien>
                                             </Row1>
                                             <Row1>
                                                <STT>meditabar aliquid enotabamque, ut, si manus vacuas, plenas tamen ceras reportarem.</STT>
                                                <TenHang>Iam undique silvae et solitudo ipsumque illud silentium quod venationi datur magna cogitationis incitamenta sunt.</TenHang>
                                                <SoLo>Proinde cum venabere, licebit, auctore me, ut panarium et lagunculam sic etiam pugillares feras.</SoLo>
                                                <HanDung>Experieris non Dianam magis montibus quam Minervam inerare.</HanDung>
                                                <ĐVT>Mirum est ut animus agitatione motuque corporis excitetut.</ĐVT>
                                                <SoLuong>Ad retia sedebam: erat in proximo non venabulum aut lancea, sed stilus et pugilares:</SoLuong>
                                                <DonGia>meditabar aliquid enotabamque, ut, si manus vacuas, plenas tamen ceras reportarem.</DonGia>
                                                <ThanhTien>Iam undique silvae et solitudo ipsumque illud silentium quod venationi datur magna cogitationis incitamenta sunt.</ThanhTien>
                                             </Row1>
                                             <Row1>
                                                <STT>Proinde cum venabere, licebit, auctore me, ut panarium et lagunculam sic etiam pugillares feras.</STT>
                                                <TenHang>Experieris non Dianam magis montibus quam Minervam inerare.</TenHang>
                                                <SoLo>Mirum est ut animus agitatione motuque corporis excitetut.</SoLo>
                                                <HanDung>Ad retia sedebam: erat in proximo non venabulum aut lancea, sed stilus et pugilares:</HanDung>
                                                <ĐVT>meditabar aliquid enotabamque, ut, si manus vacuas, plenas tamen ceras reportarem.</ĐVT>
                                                <SoLuong>Iam undique silvae et solitudo ipsumque illud silentium quod venationi datur magna cogitationis incitamenta sunt.</SoLuong>
                                                <DonGia>Proinde cum venabere, licebit, auctore me, ut panarium et lagunculam sic etiam pugillares feras.</DonGia>
                                                <ThanhTien>Experieris non Dianam magis montibus quam Minervam inerare.</ThanhTien>
                                             </Row1>
                                             <FooterRow>
                                                <SumTruocThue>Si manu vacuas</SumTruocThue>
                                             </FooterRow>
                                             <FooterRow>
                                                <GiaThue>Apros tres et quidem</GiaThue>
                                             </FooterRow>
                                             <FooterRow>
                                                <SumTongCong>Mirum est</SumTongCong>
                                             </FooterRow>
                                          </Table1>
                                          <Subform20>
                                             <LyDoTraHang>Mirum est ut animus agitatione motuque corporis excitetut.</LyDoTraHang>
                                          </Subform20>
                                          <Subform19>
                                             <Subform10>
                                                <CheckBox1>0</CheckBox1>
                                                <LapDieuChinhHoaDon>Licebit auctore</LapDieuChinhHoaDon>
                                                <NgayLapDieuChinhHoaDon>Proinde</NgayLapDieuChinhHoaDon>
                                                <KiHieuLapDieuChinh>Am undique</KiHieuLapDieuChinh>
                                             </Subform10>
                                             <Subform10>
                                                <CheckBox1>0</CheckBox1>
                                                <HuyHoaDon>Ad retia sedebam</HuyHoaDon>
                                                <NgayHuyHoaDon>Vale</NgayHuyHoaDon>
                                                <KiHieuHuy>Ego ille</KiHieuHuy>
                                             </Subform10>
                                          </Subform19>
                                          <TaiKhoanThanhToan>Si manu vacuas</TaiKhoanThanhToan>
                                          <SoTaiKhoanThanhToan>Apros tres et quidem</SoTaiKhoanThanhToan>
                                          <ThanhToanTai>Mirum est</ThanhToanTai>
                                          <Subform15>
                                             <Subform16/>
                                             <Subform16/>
                                          </Subform15>
                                          <Subform18/>
                                       </Subform9>
                                    </form1>`
                           console.log(xml);
                           var dataEncode = window.btoa(unescape(encodeURIComponent(xml)))
                           var raw_input_pdf = JSON.stringify({
                              "id": `${dataHeader.SalesDocument}`,
                              "report": "bbtrahang",
                              "xdpTemplate": "BIENBANTRAHANG/BienBanTraHangA03",
                              "zxmlData": dataEncode,
                              "formType": "interactive",
                              "formLocale": "en_US",
                              "taggedPdf": 1,
                              "embedFont": 0,
                              "changeNotAllowed": false,
                              "printNotAllowed": false
                           });
                           console.log(dataEncode);
                           var url_render = "https://" + window.location.hostname + "/sap/bc/http/sap/z_api_adobe?=";
                           var url_render1 = "https://my402230-api.s4hana.cloud.sap/sap/bc/http/sap/z_api_adobe?";
                           console.log(url_render)
                           $.ajax({
                              url: url_render,
                              type: "POST",
                              contentType: "application/json",
                              data: raw_input_pdf,
                              // headers: {
                              // 'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vY2l0ZWstcGFnLWR5MXNtcjYzLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vdG9rZW5fa2V5cyIsImtpZCI6ImRlZmF1bHQtand0LWtleS0xMDMwNDA2Mjg0IiwidHlwIjoiSldUIiwiamlkIjogIjIybk5iWlFMaFh4ZzdycHJPZ3lQb28wZHJ1eXViN2psdko1aThRaG1HUDA9In0.eyJqdGkiOiJmNzA2M2VlMzZmZDM0NTdlYTU5NzhlN2Y2N2MxYjE1ZSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI3NTZlNjliZC00MWEyLTRhOGItODBlNi1hOWUxY2E2ZWE0ZDYiLCJ6ZG4iOiJjaXRlay1wYWctZHkxc21yNjMiLCJzZXJ2aWNlaW5zdGFuY2VpZCI6IjM5MjdkN2FhLWIzZTgtNGIxMi05ODAxLWViNTU3N2E1MTE3ZCJ9LCJzdWIiOiJzYi0zOTI3ZDdhYS1iM2U4LTRiMTItOTgwMS1lYjU1NzdhNTExN2QhYjIwNzE2NnxhZHMteHNhcHBuYW1lIWI2NTQ4OCIsImF1dGhvcml0aWVzIjpbInVhYS5yZXNvdXJjZSIsImFkcy14c2FwcG5hbWUhYjY1NDg4LkFEU0NhbGxlciIsImFkcy14c2FwcG5hbWUhYjY1NDg4LlRlbXBsYXRlU3RvcmVDYWxsZXIiXSwic2NvcGUiOlsidWFhLnJlc291cmNlIiwiYWRzLXhzYXBwbmFtZSFiNjU0ODguVGVtcGxhdGVTdG9yZUNhbGxlciIsImFkcy14c2FwcG5hbWUhYjY1NDg4LkFEU0NhbGxlciJdLCJjbGllbnRfaWQiOiJzYi0zOTI3ZDdhYS1iM2U4LTRiMTItOTgwMS1lYjU1NzdhNTExN2QhYjIwNzE2NnxhZHMteHNhcHBuYW1lIWI2NTQ4OCIsImNpZCI6InNiLTM5MjdkN2FhLWIzZTgtNGIxMi05ODAxLWViNTU3N2E1MTE3ZCFiMjA3MTY2fGFkcy14c2FwcG5hbWUhYjY1NDg4IiwiYXpwIjoic2ItMzkyN2Q3YWEtYjNlOC00YjEyLTk4MDEtZWI1NTc3YTUxMTdkIWIyMDcxNjZ8YWRzLXhzYXBwbmFtZSFiNjU0ODgiLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6ImYzMTUxZjQ2IiwiaWF0IjoxNzAyNDM4Mjc4LCJleHAiOjE3MDI0NDE4NzgsImlzcyI6Imh0dHBzOi8vY2l0ZWstcGFnLWR5MXNtcjYzLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiI3NTZlNjliZC00MWEyLTRhOGItODBlNi1hOWUxY2E2ZWE0ZDYiLCJhdWQiOlsic2ItMzkyN2Q3YWEtYjNlOC00YjEyLTk4MDEtZWI1NTc3YTUxMTdkIWIyMDcxNjZ8YWRzLXhzYXBwbmFtZSFiNjU0ODgiLCJ1YWEiLCJhZHMteHNhcHBuYW1lIWI2NTQ4OCJdfQ.HopRWxY_aoBnTl8TVGvWBUlZLk5KbVcrS8yZLma-nsMSDXVtURYaNfqttxAUo5FcXMYC4sYeDCHR1UUsxonljb2m6MkGAeLpGzhV0zxxb5LDVmkpsKCZTNAxZtTPOizAEd1lwG1bHNRzGClnK_733KKFoDz13o3TWzNUGDWBJwaQboeyQO0HDRXYRezNpvoNnZ6fhElq1RCp8-ZqWwoIdg39LRSlQsn_3qH3QsNFIwXMWWT5t4BnMFkS9sze2gRp4cqFnvH6-DCRK5mB6kMOs83o8bH6zRA0ewvr1oAkfhPonnTjB15uH7v4d6NC6u7L0mhhjbLbDwSijETQQBTK4A'
                              // },
                              beforeSend: function (xhr) {
                                 xhr.setRequestHeader('Authorization', 'Basic TkdNSE5HQU5fQ1VTOmh6amNwRXM4VVZycnpQaVVZVWxFUUNCQ3hIY0J2e0dwVmlLQUF3WW4=');
                              },
                              // beforeSend: function (xhr) {
                              //     xhr.setRequestHeader('Authorization', 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vY2l0ZWstcGFnLWR5MXNtcjYzLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vdG9rZW5fa2V5cyIsImtpZCI6ImRlZmF1bHQtand0LWtleS0xMDMwNDA2Mjg0IiwidHlwIjoiSldUIiwiamlkIjogIjIybk5iWlFMaFh4ZzdycHJPZ3lQb28wZHJ1eXViN2psdko1aThRaG1HUDA9In0.eyJqdGkiOiJmNzA2M2VlMzZmZDM0NTdlYTU5NzhlN2Y2N2MxYjE1ZSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI3NTZlNjliZC00MWEyLTRhOGItODBlNi1hOWUxY2E2ZWE0ZDYiLCJ6ZG4iOiJjaXRlay1wYWctZHkxc21yNjMiLCJzZXJ2aWNlaW5zdGFuY2VpZCI6IjM5MjdkN2FhLWIzZTgtNGIxMi05ODAxLWViNTU3N2E1MTE3ZCJ9LCJzdWIiOiJzYi0zOTI3ZDdhYS1iM2U4LTRiMTItOTgwMS1lYjU1NzdhNTExN2QhYjIwNzE2NnxhZHMteHNhcHBuYW1lIWI2NTQ4OCIsImF1dGhvcml0aWVzIjpbInVhYS5yZXNvdXJjZSIsImFkcy14c2FwcG5hbWUhYjY1NDg4LkFEU0NhbGxlciIsImFkcy14c2FwcG5hbWUhYjY1NDg4LlRlbXBsYXRlU3RvcmVDYWxsZXIiXSwic2NvcGUiOlsidWFhLnJlc291cmNlIiwiYWRzLXhzYXBwbmFtZSFiNjU0ODguVGVtcGxhdGVTdG9yZUNhbGxlciIsImFkcy14c2FwcG5hbWUhYjY1NDg4LkFEU0NhbGxlciJdLCJjbGllbnRfaWQiOiJzYi0zOTI3ZDdhYS1iM2U4LTRiMTItOTgwMS1lYjU1NzdhNTExN2QhYjIwNzE2NnxhZHMteHNhcHBuYW1lIWI2NTQ4OCIsImNpZCI6InNiLTM5MjdkN2FhLWIzZTgtNGIxMi05ODAxLWViNTU3N2E1MTE3ZCFiMjA3MTY2fGFkcy14c2FwcG5hbWUhYjY1NDg4IiwiYXpwIjoic2ItMzkyN2Q3YWEtYjNlOC00YjEyLTk4MDEtZWI1NTc3YTUxMTdkIWIyMDcxNjZ8YWRzLXhzYXBwbmFtZSFiNjU0ODgiLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6ImYzMTUxZjQ2IiwiaWF0IjoxNzAyNDM4Mjc4LCJleHAiOjE3MDI0NDE4NzgsImlzcyI6Imh0dHBzOi8vY2l0ZWstcGFnLWR5MXNtcjYzLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiI3NTZlNjliZC00MWEyLTRhOGItODBlNi1hOWUxY2E2ZWE0ZDYiLCJhdWQiOlsic2ItMzkyN2Q3YWEtYjNlOC00YjEyLTk4MDEtZWI1NTc3YTUxMTdkIWIyMDcxNjZ8YWRzLXhzYXBwbmFtZSFiNjU0ODgiLCJ1YWEiLCJhZHMteHNhcHBuYW1lIWI2NTQ4OCJdfQ.HopRWxY_aoBnTl8TVGvWBUlZLk5KbVcrS8yZLma-nsMSDXVtURYaNfqttxAUo5FcXMYC4sYeDCHR1UUsxonljb2m6MkGAeLpGzhV0zxxb5LDVmkpsKCZTNAxZtTPOizAEd1lwG1bHNRzGClnK_733KKFoDz13o3TWzNUGDWBJwaQboeyQO0HDRXYRezNpvoNnZ6fhElq1RCp8-ZqWwoIdg39LRSlQsn_3qH3QsNFIwXMWWT5t4BnMFkS9sze2gRp4cqFnvH6-DCRK5mB6kMOs83o8bH6zRA0ewvr1oAkfhPonnTjB15uH7v4d6NC6u7L0mhhjbLbDwSijETQQBTK4A');
                              // },
                              success: async function (response, textStatus, jqXHR) { // console.log(response)
                                 console.log(response)
                                 let data = JSON.parse(response)
                                 // once the API call is successfull, Display PDF on screen
                                 // console.log("Data:",data)
                                 console.log("FileContent: ", data.fileContent)
                                 var decodedPdfContent = atob(data.fileContent) // base65 to string ?? to pdf

                                 console.log(decodedPdfContent);
                                 var byteArray = new Uint8Array(decodedPdfContent.length);
                                 for (var i = 0; i < decodedPdfContent.length; i++) {
                                    byteArray[i] = decodedPdfContent.charCodeAt(i);
                                 }
                                 console.log(byteArray);
                                 var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
                                 console.log(blob);
                                 var _pdfurl = URL.createObjectURL(blob);
                                 console.log(_pdfurl);
                                 // if (!this._PDFViewer) {
                                 this._PDFViewer = new sap.m.PDFViewer({ width: "auto", source: _pdfurl });
                                 jQuery.sap.addUrlWhitelist("blob");
                                 // register blob url as whitelist
                                 // }
                                 // console.log(this._PDFViewer);
                                 this._PDFViewer.downloadPDF()
                                 controller.busyDialog.close()
                                 this._PDFViewer.open()
                                 demDocument = 0;
                                 console.log(ListHeader)
                              },
                              error: function (data) {
                                 console.log('message Error' + JSON.stringify(data));
                              }
                           });

                           console.log(aContexts.length);
                        }
                     }
                  });

                  //     setTimeout(function(){
                  //       console.log(ListHeader)
                  //       console.log(ListItem)
                  //       ListHeader.forEach(dataHeader=>{
                  //       var lsItem= '';
                  //       var STT = 0;
                  //       var  lsHeader = `
                  //            <Subform1>
                  //               <Subform11>
                  //                  <Subform12/>
                  //                  <Subform13/>
                  //               </Subform11>
                  //               <Subform14/>
                  //            </Subform1>
                  //            <Subform2>
                  //               <SO>${dataHeader.SalesOrganization}</SO>
                  //               <Subform7>
                  //                  <NgayChungTu>${dataHeader.SalesOrganization}</NgayChungTu>
                  //               </Subform7>
                  //               <TenCongTyA>${dataHeader.NameOrg}</TenCongTyA>
                  //               <DiaChiCongTyA>${dataHeader.AdddressOrg}</DiaChiCongTyA>
                  //               <Subform3>
                  //                  <DienThoaiCongTyA>${dataHeader.PhoneNumberOrg}</DienThoaiCongTyA>
                  //                  <FaxCongTyA>${dataHeader.FaxOrg}</FaxCongTyA>
                  //               </Subform3>
                  //               <MaSoThueA>${dataHeader.TaxCodeOrg}</MaSoThueA>
                  //               <Subform4>
                  //                  <ChucVuA></ChucVuA>
                  //                  <DaiDienA></DaiDienA>
                  //               </Subform4>
                  //               <TenCongTyB>${dataHeader.NameCustomer}</TenCongTyB>
                  //               <DiaChiCongTyB>${dataHeader.AddressCustomer}</DiaChiCongTyB>
                  //               <Subform5>
                  //                  <DienThoaiCongTyB>${dataHeader.AddressCustomer}</DienThoaiCongTyB>
                  //                  <FaxCongTyB>${dataHeader.AddressCustomer}</FaxCongTyB>
                  //               </Subform5>
                  //               <MaSoThueB>${dataHeader.AddressCustomer}</MaSoThueB>
                  //               <Subform6>
                  //                  <DaiDienB>Proinde</DaiDienB>
                  //                  <ChucVuB>Am undique</ChucVuB>
                  //               </Subform6>
                  //               <Subform8>
                  //                  <SoHoaDonBanHang>${dataHeader.SoHoaDonBanHang}</SoHoaDonBanHang>
                  //                  <KiHieu>${dataHeader.KiHieuHoaDonBanHang}</KiHieu>
                  //                  <PostingDate>${dataHeader.AddressCustomer}</PostingDate>
                  //               </Subform8>
                  //            </Subform2>
                  //            <Subform9>`
                  //         var SumThanhTien = 0;
                  //         ListItem.forEach(data=>{
                  //           if(data.DeliveryDocument == dataHeader.DeliveryDocument){
                  //             STT++;
                  //             lsItem += ` <Row1>
                  //             <STT>${STT}</STT>
                  //             <TenHang>${data.DeliveryDocumentItemText}</TenHang>
                  //             <SoLo>${data.SoLo}</SoLo>
                  //             <HanDung>${data.NgayHetHanDen}</HanDung>
                  //             <ĐVT>${data.UnitOfMeasureLongName}</ĐVT>
                  //             <SoLuong>${data.SoLuong}</SoLuong>
                  //             <DonGia>${data.DonGia}</DonGia>
                  //             <ThanhTien>${data.ThanhTien}</ThanhTien>
                  //          </Row1>`;
                  //          SumThanhTien+= data.ThanhTien;
                  //           }
                  //         })
                  //         var ThueGTGT = SumThanhTien * 0.05;
                  //         var SumTienHang = SumThanhTien + ThueGTGT;
                  //         var lsFooterItem = ` <FooterRow>
                  //         <SumTruocThue>${SumThanhTien}</SumTruocThue>
                  //      </FooterRow>
                  //      <FooterRow>
                  //         <GiaThue>${ThueGTGT}</GiaThue>
                  //      </FooterRow>
                  //      <FooterRow>
                  //         <SumTongCong>${SumTienHang}</SumTongCong>
                  //      </FooterRow>`;
                  //         var lsFooter =` <LyDoTraHang>Vỡ</LyDoTraHang>
                  //         <GhiChu></GhiChu>
                  //         <LyDoTraHangfieldxmlnshttpwww.xfa.orgschemaxfa-template2.6nameKiHieuy0inx0inw28.575mmh7.729mmuitextEditborderpresencehiddenmargintextEdituifontsize9pttypefaceArialmargintopInset1mmbottomInset1mmleftInset1mmrightInset1mmparavAlignmiddlecaptionreserve10.58mmparavAlignmiddlevaluetextkíhiệutextvaluecaptionfield>Ego ille</LyDoTraHangfieldxmlnshttpwww.xfa.orgschemaxfa-template2.6nameKiHieuy0inx0inw28.575mmh7.729mmuitextEditborderpresencehiddenmargintextEdituifontsize9pttypefaceArialmargintopInset1mmbottomInset1mmleftInset1mmrightInset1mmparavAlignmiddlecaptionreserve10.58mmparavAlignmiddlevaluetextkíhiệutextvaluecaptionfield>
                  //         <Subform10>
                  //            <CheckBox1>0</CheckBox1>
                  //            <XuatHoaDonB></XuatHoaDonB>
                  //            <NgayXuatHoaDonB></NgayXuatHoaDonB>
                  //         </Subform10>
                  //         <Subform10>
                  //            <CheckBox1>0</CheckBox1>
                  //            <HuyHoaDonA></HuyHoaDonA>
                  //            <NgayHuyHoaDonA></NgayHuyHoaDonA>
                  //            <XuatHoaDonAfieldxmlnshttpwww.xfa.orgschemaxfa-template2.6nameNgayHuyHoaDonAh9.525mmminW31.1mmx0iny0inuitextEditborderedgestrokeloweredbordermargintextEdituifonttypefaceArialmargintopInset1mmbottomInset1mmleftInset1mmrightInset1mmparavAlignmiddlecaptionreserve8.46mmparavAlignmiddlevaluetextNgàytextvaluecaptionfield>Proinde</XuatHoaDonAfieldxmlnshttpwww.xfa.orgschemaxfa-template2.6nameNgayHuyHoaDonAh9.525mmminW31.1mmx0iny0inuitextEditborderedgestrokeloweredbordermargintextEdituifonttypefaceArialmargintopInset1mmbottomInset1mmleftInset1mmrightInset1mmparavAlignmiddlecaptionreserve8.46mmparavAlignmiddlevaluetextNgàytextvaluecaptionfield>
                  //            <NgayHuyHoaDonA></NgayHuyHoaDonA>
                  //         </Subform10>
                  //         <TaiKhoanThanhToan></TaiKhoanThanhToan>
                  //         <SoTaiKhoanThanhToan></SoTaiKhoanThanhToan>
                  //         <ThanhToanTai></ThanhToanTai>
                  //         <Subform15>
                  //            <Subform16/>
                  //            <Subform16/>
                  //         </Subform15>
                  //      </Subform9>`;
                  //     var xml = `<?xml version="1.0" encoding="UTF-8"?>
                  //     <form1>
                  //     ${lsHeader}
                  //     <Table1>
                  //     ${lsItem}
                  //     ${lsFooterItem}
                  //     </Table1>
                  //     ${lsFooter}
                  //     </form1>
                  //     `;
                  //     console.log(xml);
                  //     var dataEncode = window.btoa(unescape(encodeURIComponent(xml)))
                  //     var raw_input_pdf = JSON.stringify({
                  //       "id": `${dataHeader.DeliveryDocument}${dataHeader.SalesOrganization}`,
                  //       "report" : "bienbantrahang",
                  //       "xdpTemplate": "BienBanTraHang/BienBanTraHangA03",
                  //       "zxmlData": dataEncode,
                  //       "formType": "interactive",
                  //       "formLocale": "en_US",
                  //       "taggedPdf": 1,
                  //       "embedFont": 0,
                  //       "changeNotAllowed": false,
                  //       "printNotAllowed": false
                  // });
                  // console.log(dataEncode);
                  // var url_render = "https://" + window.location.hostname + "/sap/bc/http/sap/z_api_adobe?=";
                  // $.ajax({
                  //     url: url_render,
                  //     type: "POST",
                  //     contentType: "application/json",
                  //     data: raw_input_pdf,
                  //     // headers: {
                  //     //   'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vY2l0ZWstcGFnLWR5MXNtcjYzLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vdG9rZW5fa2V5cyIsImtpZCI6ImRlZmF1bHQtand0LWtleS0xMDMwNDA2Mjg0IiwidHlwIjoiSldUIiwiamlkIjogIjIybk5iWlFMaFh4ZzdycHJPZ3lQb28wZHJ1eXViN2psdko1aThRaG1HUDA9In0.eyJqdGkiOiJmNzA2M2VlMzZmZDM0NTdlYTU5NzhlN2Y2N2MxYjE1ZSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI3NTZlNjliZC00MWEyLTRhOGItODBlNi1hOWUxY2E2ZWE0ZDYiLCJ6ZG4iOiJjaXRlay1wYWctZHkxc21yNjMiLCJzZXJ2aWNlaW5zdGFuY2VpZCI6IjM5MjdkN2FhLWIzZTgtNGIxMi05ODAxLWViNTU3N2E1MTE3ZCJ9LCJzdWIiOiJzYi0zOTI3ZDdhYS1iM2U4LTRiMTItOTgwMS1lYjU1NzdhNTExN2QhYjIwNzE2NnxhZHMteHNhcHBuYW1lIWI2NTQ4OCIsImF1dGhvcml0aWVzIjpbInVhYS5yZXNvdXJjZSIsImFkcy14c2FwcG5hbWUhYjY1NDg4LkFEU0NhbGxlciIsImFkcy14c2FwcG5hbWUhYjY1NDg4LlRlbXBsYXRlU3RvcmVDYWxsZXIiXSwic2NvcGUiOlsidWFhLnJlc291cmNlIiwiYWRzLXhzYXBwbmFtZSFiNjU0ODguVGVtcGxhdGVTdG9yZUNhbGxlciIsImFkcy14c2FwcG5hbWUhYjY1NDg4LkFEU0NhbGxlciJdLCJjbGllbnRfaWQiOiJzYi0zOTI3ZDdhYS1iM2U4LTRiMTItOTgwMS1lYjU1NzdhNTExN2QhYjIwNzE2NnxhZHMteHNhcHBuYW1lIWI2NTQ4OCIsImNpZCI6InNiLTM5MjdkN2FhLWIzZTgtNGIxMi05ODAxLWViNTU3N2E1MTE3ZCFiMjA3MTY2fGFkcy14c2FwcG5hbWUhYjY1NDg4IiwiYXpwIjoic2ItMzkyN2Q3YWEtYjNlOC00YjEyLTk4MDEtZWI1NTc3YTUxMTdkIWIyMDcxNjZ8YWRzLXhzYXBwbmFtZSFiNjU0ODgiLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6ImYzMTUxZjQ2IiwiaWF0IjoxNzAyNDM4Mjc4LCJleHAiOjE3MDI0NDE4NzgsImlzcyI6Imh0dHBzOi8vY2l0ZWstcGFnLWR5MXNtcjYzLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiI3NTZlNjliZC00MWEyLTRhOGItODBlNi1hOWUxY2E2ZWE0ZDYiLCJhdWQiOlsic2ItMzkyN2Q3YWEtYjNlOC00YjEyLTk4MDEtZWI1NTc3YTUxMTdkIWIyMDcxNjZ8YWRzLXhzYXBwbmFtZSFiNjU0ODgiLCJ1YWEiLCJhZHMteHNhcHBuYW1lIWI2NTQ4OCJdfQ.HopRWxY_aoBnTl8TVGvWBUlZLk5KbVcrS8yZLma-nsMSDXVtURYaNfqttxAUo5FcXMYC4sYeDCHR1UUsxonljb2m6MkGAeLpGzhV0zxxb5LDVmkpsKCZTNAxZtTPOizAEd1lwG1bHNRzGClnK_733KKFoDz13o3TWzNUGDWBJwaQboeyQO0HDRXYRezNpvoNnZ6fhElq1RCp8-ZqWwoIdg39LRSlQsn_3qH3QsNFIwXMWWT5t4BnMFkS9sze2gRp4cqFnvH6-DCRK5mB6kMOs83o8bH6zRA0ewvr1oAkfhPonnTjB15uH7v4d6NC6u7L0mhhjbLbDwSijETQQBTK4A'
                  //     // },
                  //     beforeSend: function (xhr) {
                  //         xhr.setRequestHeader('Authorization', 'Basic TkdNSE5HQU5fQ1VTOmh6amNwRXM4VVZycnpQaVVZVWxFUUNCQ3hIY0J2e0dwVmlLQUF3WW4=');
                  //     },
                  // //   beforeSend: function (xhr) {
                  // //     xhr.setRequestHeader('Authorization', 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vY2l0ZWstcGFnLWR5MXNtcjYzLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vdG9rZW5fa2V5cyIsImtpZCI6ImRlZmF1bHQtand0LWtleS0xMDMwNDA2Mjg0IiwidHlwIjoiSldUIiwiamlkIjogIjIybk5iWlFMaFh4ZzdycHJPZ3lQb28wZHJ1eXViN2psdko1aThRaG1HUDA9In0.eyJqdGkiOiJmNzA2M2VlMzZmZDM0NTdlYTU5NzhlN2Y2N2MxYjE1ZSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI3NTZlNjliZC00MWEyLTRhOGItODBlNi1hOWUxY2E2ZWE0ZDYiLCJ6ZG4iOiJjaXRlay1wYWctZHkxc21yNjMiLCJzZXJ2aWNlaW5zdGFuY2VpZCI6IjM5MjdkN2FhLWIzZTgtNGIxMi05ODAxLWViNTU3N2E1MTE3ZCJ9LCJzdWIiOiJzYi0zOTI3ZDdhYS1iM2U4LTRiMTItOTgwMS1lYjU1NzdhNTExN2QhYjIwNzE2NnxhZHMteHNhcHBuYW1lIWI2NTQ4OCIsImF1dGhvcml0aWVzIjpbInVhYS5yZXNvdXJjZSIsImFkcy14c2FwcG5hbWUhYjY1NDg4LkFEU0NhbGxlciIsImFkcy14c2FwcG5hbWUhYjY1NDg4LlRlbXBsYXRlU3RvcmVDYWxsZXIiXSwic2NvcGUiOlsidWFhLnJlc291cmNlIiwiYWRzLXhzYXBwbmFtZSFiNjU0ODguVGVtcGxhdGVTdG9yZUNhbGxlciIsImFkcy14c2FwcG5hbWUhYjY1NDg4LkFEU0NhbGxlciJdLCJjbGllbnRfaWQiOiJzYi0zOTI3ZDdhYS1iM2U4LTRiMTItOTgwMS1lYjU1NzdhNTExN2QhYjIwNzE2NnxhZHMteHNhcHBuYW1lIWI2NTQ4OCIsImNpZCI6InNiLTM5MjdkN2FhLWIzZTgtNGIxMi05ODAxLWViNTU3N2E1MTE3ZCFiMjA3MTY2fGFkcy14c2FwcG5hbWUhYjY1NDg4IiwiYXpwIjoic2ItMzkyN2Q3YWEtYjNlOC00YjEyLTk4MDEtZWI1NTc3YTUxMTdkIWIyMDcxNjZ8YWRzLXhzYXBwbmFtZSFiNjU0ODgiLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6ImYzMTUxZjQ2IiwiaWF0IjoxNzAyNDM4Mjc4LCJleHAiOjE3MDI0NDE4NzgsImlzcyI6Imh0dHBzOi8vY2l0ZWstcGFnLWR5MXNtcjYzLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiI3NTZlNjliZC00MWEyLTRhOGItODBlNi1hOWUxY2E2ZWE0ZDYiLCJhdWQiOlsic2ItMzkyN2Q3YWEtYjNlOC00YjEyLTk4MDEtZWI1NTc3YTUxMTdkIWIyMDcxNjZ8YWRzLXhzYXBwbmFtZSFiNjU0ODgiLCJ1YWEiLCJhZHMteHNhcHBuYW1lIWI2NTQ4OCJdfQ.HopRWxY_aoBnTl8TVGvWBUlZLk5KbVcrS8yZLma-nsMSDXVtURYaNfqttxAUo5FcXMYC4sYeDCHR1UUsxonljb2m6MkGAeLpGzhV0zxxb5LDVmkpsKCZTNAxZtTPOizAEd1lwG1bHNRzGClnK_733KKFoDz13o3TWzNUGDWBJwaQboeyQO0HDRXYRezNpvoNnZ6fhElq1RCp8-ZqWwoIdg39LRSlQsn_3qH3QsNFIwXMWWT5t4BnMFkS9sze2gRp4cqFnvH6-DCRK5mB6kMOs83o8bH6zRA0ewvr1oAkfhPonnTjB15uH7v4d6NC6u7L0mhhjbLbDwSijETQQBTK4A');
                  // // },
                  //     success: function (response, textStatus, jqXHR) {
                  //       // console.log(response)
                  //         let data = JSON.parse(response)
                  //         //once the API call is successfull, Display PDF on screen
                  //         // console.log("Data:",data)
                  //         // console.log("FileContent: ",data.fileContent)
                  //         var decodedPdfContent = atob(data.fileContent)//base65 to string ?? to pdf

                  //         // console.log(decodedPdfContent);
                  //         var byteArray = new Uint8Array(decodedPdfContent.length);
                  //         for (var i = 0; i < decodedPdfContent.length; i++) {
                  //             byteArray[i] = decodedPdfContent.charCodeAt(i);
                  //         }
                  //         // console.log(byteArray);
                  //         var blob = new Blob([byteArray.buffer], {
                  //             type: 'application/pdf'
                  //         });
                  //         // console.log(blob);
                  //         var _pdfurl = URL.createObjectURL(blob);
                  //         // console.log(_pdfurl);
                  //         // if (!this._PDFViewer) {
                  //             this._PDFViewer = new sap.m.PDFViewer({
                  //                 width: "auto",
                  //                 source: _pdfurl
                  //             });
                  //             jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                  //         // }
                  //         // console.log(this._PDFViewer);
                  //         this._PDFViewer.downloadPDF()
                  //          this._PDFViewer.open()
                  //     },
                  //     error: function (data) {
                  //         console.log('message Error' + JSON.stringify(data));
                  //     }
                  // });
                  //       })
                  // }, 2000);


               }
            })
         })

      }
   }
})

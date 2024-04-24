// sap.ui.define([
//     "sap/ui/core/mvc/Controller"
// ],
//     /**
//      * @param {typeof sap.ui.core.mvc.Controller} Controller
//      */
//     function (Controller) {
//         "use strict";

//         return Controller.extend("zichuky.controller.Main", {
//             onInit: function () {

//             }
//         });
//     });

sap.ui.define([
	"sap/base/Log",
	"sap/ui/table/library",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/date/UI5Date",
    "sap/ui/model/odata/v2/ODataModel",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment"
], function(Log, library, Controller, MessageToast, JSONModel, DateFormat, jQuery, UI5Date,ODataModel,MessageBox,Fragment) {
	"use strict";

	var SelectionBehavior = library.SelectionBehavior,
		SelectionMode = library.SelectionMode;

	return Controller.extend("sap.ui.table.sample.Selection.Controller", {
		odata2:[],
		objFooterHidden:{},
		busyDialog: null,
		onInit: function() {
			//Wait load data
			//thêm model load
			if  (!this.busyDialog) {
				Fragment.load({
					id: "idBusyDialog1",
					name: "zichuky.controller.fragment.Busy",
					type: "XML",
					controller: this })
				.then((oDialog) => {
					this.busyDialog = oDialog;
					this.busyDialog.open();
					
				})
				.catch(error => alert(error.message));
			} else {
				this.busyDialog.open();
			}


			// set explored app's demo model on this sample
			var jModel = new JSONModel();
			var footerModel = new JSONModel();
			var oJSONModel = this.initSampleDataModel();
			// var odata2 = []
			oJSONModel.then((odata)=>{
				odata.forEach(element=>{
					element.editableId = false
					element.visible = true
					element.isExist = true
					element.btnLuu = false
					this.odata2.push(element)
				})
				console.log("DataPromise:",this.odata2)
				this.odata2.push({ editableId : true })
				this.odata2.forEach(element=>{
					if(!element.Id){
						element.visible = false
					}
				})
				this.objFooterHidden.footerHidden = false
		
				footerModel.setData(this.objFooterHidden)
				jModel.setData(this.odata2)
				console.log("Json data Model:",jModel)
				console.log("Json data footer:",footerModel)
				var oView = this.getView();
				oView.setModel(jModel, 'itemsData');
				oView.setModel(footerModel, 'footerData');
				this.busyDialog.close()
			})
		},
		// onBeforeRendering: function() {
		// 	this.byId('tbChuKy').setModel(this.jModel);	
		// },
        Add: function(oEvent){
            //alert("Đã thêm.")
			var oButton = oEvent.getSource();
			var oBindingContext = oButton.getBindingContext('itemsData'); 
			var oBindingObject = oBindingContext.getObject();
			var objData = {}
			objData.Id = oBindingObject.Id
			objData.Chucvu = oBindingObject.Chucvu
			objData.Hoten = oBindingObject.Hoten
			//Tạo Url để gọi đến odata
			var url = `https://${window.location.hostname}/sap/opu/odata/sap/ZI_API_CHUKY` //"https://my407293.s4hana.cloud.sap/sap/opu/odata/sap/ZI_API_CHUKY" //
            console.log("URL: ",url)
            var oModelData = new sap.ui.model.odata.v2.ODataModel( url , { json : true });
			if(objData.Id && objData.Chucvu && objData.Hoten){
				if(oBindingObject.editableId){
					oModelData.create('/ZI_CHUKY',objData,{
						success:function(data){
							MessageToast.show("Thêm thành công")
							setTimeout(5000);
							location.reload()
						},
						error:function(error){
							console.log("Error:",error)
							var messageError = JSON.parse(error.responseText)
							console.log("Error 2:",messageError)

							MessageToast.show(`Thêm không thành công: ${messageError.error.message.value}`)
						}
					})
				}
				else{
					oModelData.update(`/ZI_CHUKY('${objData.Id}')`,objData,{
						success:function(data){
							MessageToast.show("Cập nhật thành công")
						}
					})
				}
			}
			else{
				MessageToast.show("Vui lòng điền đầy đủ thông tin.")
			}
        },
        Delete: function(oEvent){
			var oButton = oEvent.getSource();
			var oBindingContext = oButton.getBindingContext('itemsData'); 
			var oBindingObject = oBindingContext.getObject();
			MessageBox.information("Bạn có xoá ?", {
				actions: ["Xoá","Huỷ"],
				emphasizedAction: "Xoá",
			   // initialFocus: MessageBox.Action.PREVIEW,
				onClose: async function(sAction) {
					if (sAction == "Xoá") {
						//Tạo Url để gọi đến odata
						var url = `https://${window.location.hostname}/sap/opu/odata/sap/ZI_API_CHUKY` //"https://my407293.s4hana.cloud.sap/sap/opu/odata/sap/ZI_API_CHUKY" //
						console.log("URL: ",url)
						var oModelData = new sap.ui.model.odata.v2.ODataModel( url , { json : true });
						oModelData.remove(`/ZI_CHUKY('${oBindingObject.Id}')`,{
							success: function(data){
								MessageToast.show("Đã xoá.")
								setTimeout(5000);
								location.reload()
							},
							error: function(error){
								MessageToast.show("Xoá không thành công.")
							}	
						})
					}
					else{ }
				}
			})
			
		},
		onChangeData: function(oEvent){
			//this.objFooterHidden.footerHidden = true

			// var oButtonFooter = oEvent.getSource();
			// var oBindingContextFooter = oButtonFooter.getBindingContext('footerData');
			// var oBindingObjectFooter = oBindingContextFooter.getObject();


			var oButton = oEvent.getSource();
			var oBindingContext = oButton.getBindingContext('itemsData');
			var oBindingObject = oBindingContext.getObject();
			oBindingObject.isUpdate = true
			oBindingObject.btnLuu = true
			console.log("Change: ",oBindingObject)
			console.log("DataFooter: ",this.objFooterHidden)
			console.log("Odataa 2: ",this.odata2)
			this.getView().getModel('footerData').getData().footerHidden = true
			this.getView().getModel('footerData').refresh()
		},
		initSampleDataModel: async function() {
			//var oModel = new JSONModel();
			var oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});
            var url = `https://${window.location.hostname}/sap/opu/odata/sap/ZI_API_CHUKY` //"https://my407293.s4hana.cloud.sap/sap/opu/odata/sap/ZI_API_CHUKY" //
            console.log("URL: ",url)
            var oModelData = new sap.ui.model.odata.v2.ODataModel( url , { json : true });
			console.log("oModelData : ",oModelData)
            
			let waitReadModel = new Promise((resolve,reject)=>{
				var oData = []
				 oModelData.read('/ZI_CHUKY',{
					success:function (data){
						data.results.forEach((r)=>{
							oData.push(r)
						})
						resolve(oData)
					},
					error: function(error){
						reject(error)
					}
				})
			})
			return waitReadModel;
		},
		Save: function (oEvent) {  
			var url = `https://${window.location.hostname}/sap/opu/odata/sap/ZI_API_CHUKY` //"https://my407293.s4hana.cloud.sap/sap/opu/odata/sap/ZI_API_CHUKY" //
            console.log("URL: ",url)
            var oModelData = new sap.ui.model.odata.v2.ODataModel( url , { json : true });                             
			this.odata2.forEach(element => {
				var objData = {}
				objData.Id = element.Id
				objData.Chucvu = element.Chucvu
				objData.Hoten = element.Hoten
				if(element.isUpdate){
					if(element.isExist){
						oModelData.update(`/ZI_CHUKY('${objData.Id}')`,objData,{
							success:function(data){
								MessageToast.show("Lưu thành công")
								setTimeout(5000);
								location.reload()
							},
							error:function(error){
								MessageToast.show("Có lỗi xảy ra")
							}
						})
					}else{
						if(objData.Id && objData.Chucvu && objData.Hoten){
							oModelData.create('/ZI_CHUKY',objData,{
								success:function(data){
									MessageToast.show("Lưu thành công")
								setTimeout(5000);
								location.reload()
								},error:function(error){
									console.log("Error:",error)
									var messageError = JSON.parse(error.responseText)
									console.log("Error 2:",messageError)
		
									MessageToast.show(`Thêm không thành công: ${messageError.error.message.value}`)
								}
							})
						}else{
							MessageToast.show("Vui lòng điền đầy đủ thông tin.")
						}
					}
				}
				
			})
		},
		DontSave: function(oEvent){
			// this.getView().getModel('itemsData').refresh()
			// this.getView().getModel('footerData').refresh()
			location.reload()
		},
	 });
});

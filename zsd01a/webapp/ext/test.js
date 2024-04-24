// var oObjPage = that.getView().byId("__ObjectPageLayout");
// //Add Object page Section
// var sId = "__" + sType + "HR";
// var oSection =
//     sap.uxap.ObjectPageSection({
//         titleUppercase: false, id: sId, title: "{i18n>HR_COMMENTS}"
//     });
// oObjPage.addSection(oSection);
// //Add SubSectio
// var oSubSection = new sap.uxap.ObjectPageSubSection({
//     titleUppercase: false
// });
// oSection.addSubSection(oSubSection);
// //Add a form to Subsection
// sId = "__" + sType + "HRForm";
// var oForm = new sap.ui.layout.form.SimpleForm(
//     {
//         id: sId,
//         editable: true,
//         layout: "ColumnLayout",
//         labelSpanXL: 4,
//         labelSpanL: 5,
//         labelSpanM: 5,
//         labelSpanS: 12,
//         adjustLabelSpan: false,
//         emptySpanXL: 0,
//         emptySpanL: 2,
//         emptySpanM: 2,
//         emptySpanS: 0,
//         columnsXL: 2,
//         columnsL: 1,
//         columnsM: 1,
//         singleContainerFullSize: true
//     });

// oSubSection.addBlock(oForm);
// //Add content to form
// var sPath = "test”
// oForm.addContent(new sap.m.Label({
//     text: "{i18n>COMMENT_HR}"
// }));
// oForm.addContent(new sap.m.TextArea({
//     value: sPath,
//     enabled: false
// }));
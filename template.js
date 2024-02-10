const { PDFDocument } = require("pdf-lib")
const fs = require('fs');

const createPDF = async () => {
    try {
        const pdfDoc = await PDFDocument.load(fs.readFileSync(`./template/template.pdf`), {
            ignoreEncryption: true,
            throwOnInvalidObject: true,
        });
        const form = pdfDoc.getForm();
        let fieldNames = pdfDoc.getForm().getFields();
        fieldNames = fieldNames.map(f => f.getName())
        console.log(fieldNames)
        let coiIndex = fieldNames.indexOf('connectionLink')
        if (coiIndex >= 0) {
            form.getTextField(fieldNames[coiIndex]).setText('https://www.appgambit.com/')
        }
        fs.writeFileSync("./template/template-output.pdf", await pdfDoc.save());
    } catch (error) {
        console.log(error)
    }
}
createPDF()
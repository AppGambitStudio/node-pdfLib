const { PageSizes, StandardFonts, rgb, PDFAcroField, PDFDocument, PDFName, PDFSignature, PDFAcroSignature, PDFWidgetAnnotation, AnnotationFlags } = require('pdf-lib');
const { PDFDict } = PDFAcroField;
var fs = require('fs');

function calculateTextWidth(text, font, fontSize) {
    return font.widthOfTextAtSize(text, fontSize);
}

const openMailTo = (subject) => {
    this.mailDoc({
        cTo: 'custom-lib-pdf@yopmail.com',
        cSubject: subject,
        // cBody:   ''  
    });
}

const setSubmitButton = (pdfDoc, page, form, font, x, y) => {
    //set action button
    let date = new Date();
    let subject = `Enter Your Subject- ${date}`;
    let btnText = 'Click on button to submit for invoicing -';
    let textwidth = font.widthOfTextAtSize(btnText, 12)
    page.drawText(btnText, { x: x, y: y, font: font, size: 12 });
    const buttonWidth = 120;
    const buttonHeight = 20;
    const button = form.createButton('submitBtn')
    button.addToPage('Submit', page, {
        x: textwidth + x + 10,
        y: y - 5,
        width: buttonWidth,
        height: buttonHeight,
        borderWidth: 1,
        font: font,
    })
    button.setFontSize(8);
    button.acroField.getWidgets().forEach((widget) => {
        widget.dict.set(
            PDFName.of('AA'),
            pdfDoc.context.obj({
                U: {
                    Type: 'Action',
                    S: 'JavaScript',
                    JS: `(${openMailTo})(${subject});`
                },
            }),
        );
    });
}

const setParagraph = (page, str, font, x, y, fontSize, lineHeight) => {
    let lines = str.split('\n');
    if (lines && lines.length) {
        lines.forEach((line, index) => {
            //   page.drawText(line, { x: centerX, y: centerY - index * lineHeight, font: font, fontSize });
            page.drawText(line, { x: x, y: y - (index + 1) * lineHeight, font: font, size: fontSize });
        });
    }
}

const createSignature = (page, name, x, y, width, height) => {
    const signatureDict = page.doc.context.obj({
        FT: 'Sig',
        Kids: [],
    })
    const signatureDictRef = page.doc.context.register(signatureDict)
    const acroSigField = PDFAcroSignature.fromDict(
        signatureDict,
        signatureDictRef
    )
    acroSigField.setPartialName(name)
    page.doc.getForm().acroForm.addField(acroSigField.ref)
    const sigField = PDFSignature.of(
        acroSigField,
        acroSigField.ref,
        page.doc
    )
    const sigWidget = PDFWidgetAnnotation.create(
        page.doc.context,
        sigField.ref
    )
    sigWidget.setRectangle({ x, y, width, height, borderColor: rgb(1, 1, 1) })
    sigWidget.setP(page.ref)
    sigWidget.setFlagTo(AnnotationFlags.Print, true)
    sigWidget.setFlagTo(AnnotationFlags.Hidden, false)
    sigWidget.setFlagTo(AnnotationFlags.Invisible, false)
    const sigWidgetRef = page.doc.context.register(sigWidget.dict)
    sigField.acroField.addWidget(sigWidgetRef)
    page.node.addAnnot(sigWidgetRef)
}

const createEditablePDF = async () => {
    try {
        const pdfDoc = await PDFDocument.create();
        // 'Courier', 'Courier-Bold', 'Courier-Oblique', 'Courier-BoldOblique', 'Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique', 'Helvetica-BoldOblique', 'Times-Roman', 'Times-Bold', 'Times-Italic', 'Times-BoldItalic', 'Symbol', 'ZapfDingbats',
        const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
        const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
        const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)
        const fontBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic)
        // create Page
        const pageOne = pdfDoc.addPage(PageSizes.A4);
        const pageTwo = pdfDoc.addPage(PageSizes.A4);

        // form
        const form = pdfDoc.getForm();

        pdfDoc.setTitle('Appgambit')
        // pdfDoc.setAuthor('')
        pdfDoc.setSubject('Create Editable PDF📖')
        pdfDoc.setKeywords(['PDF', 'Appgambit', 'Edit'])
        pdfDoc.setProducer('Elisa')
        pdfDoc.setCreator('Yogesh Rajput')
        pdfDoc.setCreationDate(new Date())

        let headerI = 'APPGAMBIT', headerII = 'Second Sub Header';
        let fontSize = 14;
        let lineHeight = 1.0 * fontSize;
        const xStart = 15;

        let headerWidth = calculateTextWidth(headerI, fontBold, fontSize)
        let centerX = ((pageOne.getWidth() - headerWidth) / 2);
        let pageOneY = pageOne.getHeight() - 30;
        pageOne.drawText(headerI, { x: centerX, y: pageOneY, font: fontBold, size: fontSize });

        pageOneY -= 15;
        let headerIIWidth = calculateTextWidth(headerII, fontBold, fontSize)
        centerX = ((pageOne.getWidth() - headerIIWidth) / 2);
        pageOne.drawText(headerII, { x: centerX, y: pageOneY, font: fontBold, size: fontSize });

        pageOneY -= 5;
        pageOne.drawLine({ start: { x: 5, y: pageOneY }, end: { x: pageOne.getWidth() - 5, y: pageOneY }, color: rgb(0, 0, 0) });

        pageOneY -= 25;
        let stdConnection = 'Standard Connection Instructions: '
        pageOne.drawText(stdConnection, { x: xStart, y: pageOneY, font: font, size: fontSize });
        //draw underline
        pageOneY -= 3; // Adjust the Y position for the underline
        const underlineWidth = font.widthOfTextAtSize(stdConnection, fontSize);
        pageOne.drawLine({ start: { x: xStart, y: pageOneY }, end: { x: underlineWidth + 20, y: pageOneY }, color: rgb(0, 0, 0) });

        pageOneY -= 15;
        pageOne.drawText('Enter the meeting Link: ', {
            x: xStart,
            y: pageOneY,
            font: font,
            size: 12
        });

        pageOneY -= 25;
        let linkInput = form.createTextField(`connectionLink`)
        // vriLinkControl.setText('One Punch Man')
        linkInput.addToPage(pageOne, {
            x: xStart,
            y: pageOneY,
            width: pageOne.getWidth() - 40,
            height: 1.5 * 14,
            textColor: rgb(0, 0, 0),
            borderWidth: 0.5,
            borderColor: rgb(1, 0, 0.35),
        });
        linkInput.setFontSize(12)


        pageOneY -= 50;
        lineHeight = 1.4 * 14;
        let activityColumn = ['No', 'IJ Code', 'A-Number', 'Start Time', 'End Time', 'Note'],
            cellWidth = [60, 90, 90, 90, 90, 90];
        for (let rowIndex = 0; rowIndex < 7; rowIndex++) {
            let x = xStart
            for (let colIndex = 0; colIndex < activityColumn.length; colIndex++) {
                if (rowIndex == 0) {
                    pageOne.drawText(activityColumn[colIndex], { x: x + 4, y: pageOneY + 5, font: fontBold, size: 12 });
                } else if (colIndex < activityColumn.length) {
                    let yPosition = pageOneY
                    if (colIndex < activityColumn.length) {
                        let activityField = form.createTextField(`wo_activity_${rowIndex}_${colIndex}`)
                        activityField.addToPage(pageOne, {
                            x: x + 3,
                            y: yPosition,
                            width: cellWidth[colIndex],
                            height: lineHeight,
                            borderColor: rgb(1, 1, 1),
                            textColor: rgb(0, 0, 0),
                        });
                        activityField.setFontSize(10);
                        // activityField.set
                        if (colIndex == 0) {
                            // let text = `${rowIndex}_${colIndex}`
                            // activityField.setTooltip('Enter numeric value only');
                            // activityField.setText(text)
                            // activityField.setMaxLength(3)
                            activityField.setMaxLength(10);
                        }
                    }
                }
                x += (cellWidth[colIndex] + 6);
            }
            pageOneY -= 25
        }

        // pdfDoc.addJavaScript(
        //     'main',
        //     'console.show(); console.println("Hello World!"); console.println("Hello")'
        // );

        let colorBackgroundText = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the\nindustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type\nand scrambled it to make a type specimen book. It has survived not only five centuries, but also the\nleap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with\nthe release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing\nsoftware like Aldus PageMaker including versions of Lorem Ipsum.`
        // const maxWidth = pageOne.getWidth() - 2;
        lines = colorBackgroundText.split('\n');
        const totalHeight = lines.length * font.heightAtSize(14) + 10;

        pageOneY -= totalHeight

        const startY = pageOneY;
        pageOne.drawRectangle({
            x: xStart - 10, //(xStart - 2),
            y: startY + font.heightAtSize(fontSize) + 4,
            width: pageOne.getWidth() - 10,
            height: totalHeight,
            color: rgb(1, 1, 0),
            // borderWidth: 1,
            borderColor: rgb(1, 1, 1)
        });
        // set the lines of text
        (lines.reverse()).forEach((line, index) => {
            y = startY + (index + 2) * font.heightAtSize(fontSize);
            pageOne.drawText(line, { x: xStart, y, height: lineHeight + 5, font: font, size: fontSize, });
        });


        pageOneY -= 20;
        pageOne.drawText('COMMENTS:', { x: xStart, y: pageOneY, font: fontBold, size: fontSize });
        const textFieldHeight = 80;
        const textField = {
            x: xStart,
            y: (pageOneY - textFieldHeight) - 3,
            font: font,
            width: pageOne.getWidth() - 40,
            height: textFieldHeight,
            borderColor: rgb(0, 0, 0),
        };
        const textareaField = form.createTextField('comment');
        textareaField.enableMultiline()
        textareaField.addToPage(pageOne, textField);
        textareaField.setFontSize(10)

        pageOneY -= (textFieldHeight + 80);
        createSignature(pageOne, `formSign`, 255, pageOneY, 300, 60)

        const signatureMsg = "------------------------------------------------------------------------------ \n Authorized EOIR Representative’s Signature".split('\n');
        signatureMsg.forEach((line, index) => {
            const centerPosition = index ? 290 : 250;
            pageOne.drawText(line, { x: centerPosition, y: index ? 210 : 220, font: font, size: 12, });
        });

        pageOneY -= 80;
        setSubmitButton(pdfDoc, pageOne, form, font, xStart, pageOneY)


        const notesStartY = 100;
        setParagraph(pageOne, colorBackgroundText, fontItalic, xStart + 10, notesStartY, 12, 1 * 14)


        // SecondPage
        let text = 'Appgambit Second Page';
        let x = calculateTextWidth(text, fontBoldItalic, fontSize)
        let pageTwoY = pageTwo.getHeight() / 2;
        pageTwo.drawText(text, { x: centerX, y: pageTwoY, font: fontBold, size: fontSize });

        fs.writeFileSync("appgambit.pdf", await pdfDoc.save());
        console.log('pdf generated successfully!')

    } catch (error) {
        console.error('Error while creating the PDF', error)
    }
}

createEditablePDF()
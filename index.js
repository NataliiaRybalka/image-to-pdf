import fs from 'fs';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

const imagePaths = [];

async function createPDFWithImages(imagePaths, outputSmallPDFPath) {
	const pdfDoc = await PDFDocument.create();

	for (const imagePath of imagePaths) {
		const imageBuffer = fs.readFileSync(imagePath);
	
		const sharpImage = sharp(imageBuffer);
		const metadata = await sharpImage.metadata();
	
		let embeddedImage;
		if (metadata.format === 'jpeg') {
			embeddedImage = await pdfDoc.embedJpg(imageBuffer);
		} else if (metadata.format === 'png') {
			embeddedImage = await pdfDoc.embedPng(imageBuffer);
		}
	
		const { width, height } = embeddedImage.scale(1);
		
		const page = pdfDoc.addPage([width, height]);
	
		page.drawImage(embeddedImage, {
			x: 0,
			y: 0,
			width: width,
			height: height,
		});
	}
	
	const pdfBytes = await pdfDoc.save();
	
	fs.writeFileSync(outputSmallPDFPath, pdfBytes);
	console.log(`PDF created successfully at: ${outputSmallPDFPath}`);
}

async function saveImagesPathes(folderName) {
	const files = fs.readdirSync(`../${folderName}`);
	files.forEach(file => imagePaths.push(`../${folderName}/${file}`));

	createPDFWithImages(imagePaths, `${folderName}.pdf`);
}

saveImagesPathes('01');

const pdfPaths = [];
const outputPDFPath = 'planner.pdf';

async function mergePDFs(pdfPaths, outputPDFPath) {
	const mergedPdf = await PDFDocument.create();

	for (const pdfPath of pdfPaths) {
		const pdfBytes = fs.readFileSync(pdfPath);
		const pdfDoc = await PDFDocument.load(pdfBytes);
		const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

		copiedPages.forEach((page) => mergedPdf.addPage(page));
	}

	const mergedPdfBytes = await mergedPdf.save();

	fs.writeFileSync(outputPDFPath, mergedPdfBytes);

	console.log(`Merged PDF saved to: ${outputPDFPath}`);
}

// mergePDFs(pdfPaths, 'planner.pdf');
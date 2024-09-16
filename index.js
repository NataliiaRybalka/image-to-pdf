import fs from 'fs';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

async function createPDFWithImages(imagePaths, outputPDFPath) {
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
	
	fs.writeFileSync(outputPDFPath, pdfBytes);
	console.log(`PDF created successfully at: ${outputPDFPath}`);
}
	
const imagePaths = ['image1.jpg', 'image2.png', 'image3.jpg'];
const outputPDFPath = 'planner.pdf';
	
createPDFWithImages(imagePaths, outputPDFPath)
	.then(() => console.log('PDF generation complete'))
	.catch((err) => console.error('Error generating PDF:', err));
class Files {
constructor() {
this.texts = [];
}

// Method to process files and extract text based on file type
async addFiles(files) {
for (const file of files) {
if (file.type.startsWith('image/')) {
// Process image files with Tesseract.js
const text = await this.extractTextFromImage(file);
if (text) {
this.texts.push(text);
}
} else if (file.type === 'application/pdf') {
// Process PDF files with pdf.js
const text = await this.extractTextFromPdf(file);
if (text) {
this.texts.push(text);
}
}
}
return this.texts;
}

// Extract text from an image file using Tesseract.js
async extractTextFromImage(imageFile) {
return new Promise((resolve, reject) => {
const reader = new FileReader();
reader.onload = () => {
Tesseract.recognize(reader.result, 'eng', {
logger: info => console.log(info)
}).then(({ data: { text } }) => {
// Remove any text that consists entirely or partially of numbers
const filteredText = text
.split('\n')
.map(line => line.replace(/\d+/g, '').trim()) // Remove numbers from lines
.filter(line => line && !/^\d+$/.test(line)) // Remove empty or numeric-only lines
.join('\n');
resolve(filteredText || null);
}).catch(err => reject(err));
};
reader.readAsDataURL(imageFile);
});
}

// Extract text from a PDF file using pdf.js
async extractTextFromPdf(pdfFile) {
const pdfText = [];
const pdf = await pdfjsLib.getDocument(URL.createObjectURL(pdfFile)).promise;
const numPages = pdf.numPages;

for (let pageNum = 1; pageNum <= numPages; pageNum++) {
const page = await pdf.getPage(pageNum);
const textContent = await page.getTextContent();
const text = textContent.items.map(item => item.str).join(' ');
pdfText.push(text);
}

return pdfText.join('\n');
}
}

class UniqueTexts {
constructor(filesInstance) {
this.texts = filesInstance.texts;
}

// Find unique/rare texts
findUniqueTexts() {
const textOccurrences = this.countTextOccurrences();
return Object.keys(textOccurrences)
.filter(text => textOccurrences[text] === 1 && !this.isInteger(text)); // Filter out integer texts
}

countTextOccurrences() {
const textOccurrences = {};
for (let text of this.texts) {
const lines = text.split('\n');
for (let line of lines) {
const filteredLine = line.trim();
if (filteredLine && !/^\d+$/.test(filteredLine)) {
textOccurrences[filteredLine] = (textOccurrences[filteredLine] || 0) + 1;
}
}
}
return textOccurrences;
}

// Helper method to check if a text is an integer
isInteger(text) {
return /^\d+$/.test(text);
}
}

class RepeatedTexts {
constructor(filesInstance) {
this.texts = filesInstance.texts;
}

// Find most repeated texts
findMostRepeatedTexts() {
const textOccurrences = this.countTextOccurrences();
const maxCount = Math.max(...Object.values(textOccurrences));
return Object.keys(textOccurrences)
.filter(text => textOccurrences[text] === maxCount && !this.isInteger(text)); // Filter out integer texts
}

countTextOccurrences() {
const textOccurrences = {};
for (let text of this.texts) {
const lines = text.split('\n');
for (let line of lines) {
const filteredLine = line.trim();
if (filteredLine && !/^\d+$/.test(filteredLine)) {
textOccurrences[filteredLine] = (textOccurrences[filteredLine] || 0) + 1;
}
}
}
return textOccurrences;
}

// Helper method to check if a text is an integer
isInteger(text) {
return /^\d+$/.test(text);
}
}

// Event listener for the 'Process Files' button
document.getElementById('processFiles').addEventListener('click', async () => {
const filesInput = new Files();
const files = document.getElementById('fileUploader').files;

if (files.length === 0) {
alert('Please upload files to process.');
return;
}

// Step 1: Process and extract text from files (images and PDFs)
await filesInput.addFiles(files);
const extractedTexts = filesInput.texts.join('\n\n');
document.getElementById('extractedTexts').textContent = extractedTexts;

// Step 2: Find unique texts
const uniqueTextsInstance = new UniqueTexts(filesInput);
const uniqueTexts = uniqueTextsInstance.findUniqueTexts();
document.getElementById('uniqueTexts').textContent = uniqueTexts.join('\n');

// Step 3: Find most repeated texts
const repeatedTextsInstance = new RepeatedTexts(filesInput);
const mostRepeatedTexts = repeatedTextsInstance.findMostRepeatedTexts();
document.getElementById('mostRepeatedTexts').textContent = mostRepeatedTexts.join('\n');
});

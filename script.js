class Images {
    constructor() {
        this.imageTexts = []; // Stores text extracted from each image
    }

    // Method to input images and extract their text
    async addImages(imageFiles) {
        for (const imageFile of imageFiles) {
            const text = await this.extractText(imageFile);
            if (text) {
                this.imageTexts.push(text);
            }
        }
        return this.imageTexts;
    }

    // Method to extract text from an image using Tesseract.js
    async extractText(imageFile) {
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
                    resolve(filteredText || null); // Return filtered text or null if empty
                }).catch(err => reject(err));
            };
            reader.readAsDataURL(imageFile);
        });
    }
}

class UnqImages {
    constructor(imagesInstance) {
        this.imageTexts = imagesInstance.imageTexts;
    }

    // Method to find unique/rare texts
    findUniqueTexts() {
        const textOccurrences = this.countTextOccurrences();
        return Object.keys(textOccurrences)
            .filter(text => textOccurrences[text] === 1 && !this.isInteger(text)); // Filter out integer texts
    }

    countTextOccurrences() {
        const textOccurrences = {};
        for (let text of this.imageTexts) {
            const lines = text.split('\n');
            for (let line of lines) {
                const filteredLine = line.trim(); // Remove extra spaces
                if (filteredLine && !/^\d+$/.test(filteredLine)) { // Ignore numeric-only lines
                    textOccurrences[filteredLine] = (textOccurrences[filteredLine] || 0) + 1;
                }
            }
        }
        return textOccurrences;
    }

    // Helper method to check if a text is an integer
    isInteger(text) {
        return /^\d+$/.test(text); // Checks if the text is purely a number
    }
}

class ReImages {
    constructor(imagesInstance) {
        this.imageTexts = imagesInstance.imageTexts;
    }

    // Method to find most repeated texts
    findMostRepeatedTexts() {
        const textOccurrences = this.countTextOccurrences();
        const maxCount = Math.max(...Object.values(textOccurrences));
        return Object.keys(textOccurrences)
            .filter(text => textOccurrences[text] === maxCount && !this.isInteger(text)); // Filter out integer texts
    }

    countTextOccurrences() {
        const textOccurrences = {};
        for (let text of this.imageTexts) {
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

// Event listener for the 'Process Images' button
document.getElementById('processImages').addEventListener('click', async () => {
    const imageInput = new Images();
    const imageFiles = document.getElementById('imageUploader').files;

    if (imageFiles.length === 0) {
        alert('Please upload images to process.');
        return;
    }

    // Step 1: Process and extract text from images
    await imageInput.addImages(imageFiles);
    const extractedTexts = imageInput.imageTexts.join('\n\n');
    document.getElementById('extractedTexts').textContent = extractedTexts;

    // Step 2: Find unique texts (without integers)
    const unqImages = new UnqImages(imageInput);
    const uniqueTexts = unqImages.findUniqueTexts();
    document.getElementById('uniqueTexts').textContent = uniqueTexts.join('\n');

    // Step 3: Find most repeated texts (without integers)
    const reImages = new ReImages(imageInput);
    const mostRepeatedTexts = reImages.findMostRepeatedTexts();
    document.getElementById('mostRepeatedTexts').textContent = mostRepeatedTexts.join('\n');
});

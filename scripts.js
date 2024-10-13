const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const cropButton = document.getElementById('crop-button');
const splitSection = document.getElementById('split-section');
const splitImagesContainer = document.getElementById('split-images');
const sourceCanvas = document.getElementById('source-canvas');
const splitCanvas1 = document.getElementById('split-canvas-1');
const splitCanvas2 = document.getElementById('split-canvas-2');
const downloadImage1Button = document.getElementById('download-image-1');
const downloadImage2Button = document.getElementById('download-image-2');

let originalImage = new Image();
let cropper = null; // Cropper instance

// Handle Image Upload
imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage.src = e.target.result;
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            cropButton.style.display = 'block';

            // Initialize cropper after image loads
            if (cropper) {
                cropper.destroy(); // Destroy any existing cropper instance
            }
            cropper = new Cropper(imagePreview, {
                viewMode: 2,
                ready() {
                    // Default crop area focuses on the vertical black bar (middle part)
                    const cropBoxData = cropper.getCropBoxData();
                    const imageData = cropper.getImageData();
                    
                    // Assuming the vertical black bar is in the middle of the image
                    cropBoxData.left = imageData.width * 0.45;
                    cropBoxData.width = imageData.width * 0.1;  // Adjust based on estimated black bar width
                    cropper.setCropBoxData(cropBoxData);
                }
            });
        };
        reader.readAsDataURL(file);
    }
});

// Crop Vertical Bar and Split Image
cropButton.addEventListener('click', function() {
    if (cropper) {
        const cropData = cropper.getData(true); // Get crop data including dimensions

        // Calculate the positions for the remaining sides of the image
        const leftX = 0; // Starting x for the left photo
        const rightX = cropData.x + cropData.width; // Starting x for the right photo

        // Draw the cropped image on the source canvas
        sourceCanvas.width = originalImage.width;
        sourceCanvas.height = originalImage.height;
        const ctx = sourceCanvas.getContext('2d');
        ctx.drawImage(originalImage, 0, 0);

        // Left side (Photo 1)
        splitCanvas1.width = cropData.x; // Width of the left side
        splitCanvas1.height = originalImage.height;
        splitCanvas1.getContext('2d').drawImage(sourceCanvas, leftX, 0, cropData.x, originalImage.height, 0, 0, cropData.x, originalImage.height);

        // Right side (Photo 2)
        splitCanvas2.width = originalImage.width - rightX; // Width of the right side
        splitCanvas2.height = originalImage.height;
        splitCanvas2.getContext('2d').drawImage(sourceCanvas, rightX, 0, originalImage.width - rightX, originalImage.height, 0, 0, originalImage.width - rightX, originalImage.height);

        // Display the split images
        displaySplitImages(splitCanvas1.toDataURL(), splitCanvas2.toDataURL());
    }
});

// Display the split images
function displaySplitImages(url1, url2) {
    splitImagesContainer.innerHTML = ''; // Clear previous images

    // First split image (left half)
    const img1 = document.createElement('img');
    img1.src = url1;
    img1.alt = 'Split Image 1 (Left Side)';
    img1.style.width = '100%'; // Set width to 100% for better layout
    img1.style.maxWidth = '400px'; // Optional: Limit max width for images
    splitImagesContainer.appendChild(img1);

    // Second split image (right half)
    const img2 = document.createElement('img');
    img2.src = url2;
    img2.alt = 'Split Image 2 (Right Side)';
    img2.style.width = '100%'; // Set width to 100% for better layout
    img2.style.maxWidth = '400px'; // Optional: Limit max width for images
    splitImagesContainer.appendChild(img2);

    // Show the download buttons
    downloadImage1Button.style.display = 'inline-block';
    downloadImage2Button.style.display = 'inline-block';

    // Show the split section
    splitSection.style.display = 'block';
}

// Download functionality
downloadImage1Button.addEventListener('click', function() {
    const link = document.createElement('a');
    link.href = splitCanvas1.toDataURL(); // Get data URL of the cropped image
    link.download = 'split_image_1.png'; // Set download filename
    link.click(); // Trigger download
});

downloadImage2Button.addEventListener('click', function() {
    const link = document.createElement('a');
    link.href = splitCanvas2.toDataURL(); // Get data URL of the cropped image
    link.download = 'split_image_2.png'; // Set download filename
    link.click(); // Trigger download
});

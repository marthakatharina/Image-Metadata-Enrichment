// Initialize the Image Classifier with MobileNet
let classifier;
let imagePreview;
let tagsDiv;

// Load the MobileNet model
async function initializeClassifier() {
    classifier = await ml5.imageClassifier("MobileNet");
    console.log("MobileNet model loaded!");
}

// Function to handle image upload
function uploadImage() {
    const fileInput = document.getElementById("image-upload");
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function (event) {
            // Set the image source to the uploaded file
            imagePreview.src = event.target.result;

            // After the image is displayed, classify it
            await classifyImage(imagePreview);
        };
        reader.readAsDataURL(file);
    }
}

// Function to classify the image
async function classifyImage(imageElement) {
    try {
        // Classify the image using MobileNet
        const results = await classifier.classify(imageElement);

        console.log("Classification results:", results);

        // Clear previous tags
        tagsDiv.innerHTML = "";

        // Check if results is an array and has at least one item
        if (Array.isArray(results) && results.length > 0) {
            // Display the results
            results.forEach((result) => {
                const tag = `${result.label}`;
                const p = document.createElement("p");
                p.textContent = tag;
                tagsDiv.appendChild(p);
            });
        } else {
            console.error("Invalid results format:", results);
            tagsDiv.innerHTML = "No tags found. Please try another image.";
        }
    } catch (error) {
        console.error("Classification error:", error);
        tagsDiv.innerHTML = "Error classifying the image. Please try again.";
    }
}

// Initialize the app
async function initializeApp() {
    imagePreview = document.getElementById("image-preview");
    tagsDiv = document.getElementById("tags");

    // Initialize the classifier
    await initializeClassifier();
}

// Start the app when the page loads
window.onload = initializeApp;

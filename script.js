// Initialize the Image Classifier with MobileNet
let classifier;
let imagePreview;
let tagsDiv;

// Load the MobileNet model
async function initializeClassifier() {
    classifier = await ml5.imageClassifier("MobileNet");
    console.log("MobileNet model loaded!");
}

function uploadImage() {
    const fileInput = document.getElementById("image-upload");

    fileInput.addEventListener("change", async function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async function (event) {
                // Set the image source to the uploaded file
                imagePreview.src = event.target.result;

                // Change styling after image loads
                const imageContainer =
                    document.getElementById("image-container");
                const previewIcon = document.getElementById("image-preview");
                const tagsContainer = document.getElementById("tags-container");
                imageContainer.style.backgroundColor = "";
                imageContainer.style.width = "";
                imageContainer.style.height = "auto";
                previewIcon.style.width = "100%";

                // Create tags container if it doesn't exist
                if (!tagsDiv) {
                    tagsDiv = document.createElement("div");
                    tagsDiv.className = "tags";
                    tagsDiv.id = "tags";
                    tagsContainer.appendChild(tagsDiv);
                } else {
                    // Clear previous tags
                    tagsDiv.innerHTML = "";
                }

                // After the image is displayed, classify it
                await classifyImage(imagePreview);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Function to classify the image
async function classifyImage(imageElement) {
    try {
        // Classify the image using MobileNet
        const results = await classifier.classify(imageElement);
        // console.log("Classification results:", results);

        const pTag = document.createElement("p");
        pTag.textContent = "Extracted Tags: ";
        tagsDiv.appendChild(pTag);

        // Check if results is an array and has at least one item
        if (Array.isArray(results) && results.length > 0) {
            const uniqueWords = new Set(); // To track unique words

            // Process all results
            results.forEach((result) => {
                // Split label into individual words
                const words = result.label.split(/,\s*|\s+/); // Split by commas or spaces

                // Create a tag for each unique word
                words.forEach((word) => {
                    const cleanedWord = word.trim().toLowerCase();
                    if (
                        cleanedWord.length > 0 &&
                        !uniqueWords.has(cleanedWord)
                    ) {
                        uniqueWords.add(cleanedWord);

                        const tag = document.createElement("span");
                        tag.className = "tag";
                        tag.textContent = word.trim();
                        tagsDiv.appendChild(tag);

                        // Add space after tag (optional)
                        tagsDiv.appendChild(document.createTextNode(" "));
                    }
                });
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

    // Attach event listener to file input for automatic upload
    uploadImage();

    // Initialize the classifier
    await initializeClassifier();
}

// Start the app when the page loads
window.onload = initializeApp;

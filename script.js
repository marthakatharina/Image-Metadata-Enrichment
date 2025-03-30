// Initialize variables
let classifier;
let imagePreview;
let tagsDiv;
let selectedTagsContainer;

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

                // Clear existing containers
                tagsContainer.innerHTML = "";

                // Create heading for extracted tags
                const pTag = document.createElement("p");
                pTag.textContent = "Tags extracted from the image:";
                tagsContainer.appendChild(pTag);

                // Create tags container
                tagsDiv = document.createElement("div");
                tagsDiv.className = "tags";
                tagsDiv.id = "tags";
                tagsContainer.appendChild(tagsDiv);

                // Create selected tags section
                const selectedTagsHeading = document.createElement("p");
                selectedTagsHeading.textContent = "Selected Tags:";
                selectedTagsHeading.style.marginTop = "20px";
                tagsContainer.appendChild(selectedTagsHeading);

                selectedTagsContainer = document.createElement("div");
                selectedTagsContainer.className = "selected-tags";
                selectedTagsContainer.id = "selected-tags";
                tagsContainer.appendChild(selectedTagsContainer);

                // Update image styling
                imageContainer.style.backgroundColor = "";
                imageContainer.style.width = "";
                imageContainer.style.height = "auto";
                previewIcon.style.width = "100%";

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

        // Check if results is an array
        if (Array.isArray(results)) {
            const uniqueWords = new Set();

            // Process all results
            results.forEach((result) => {
                // Split label into individual words
                const words = result.label.split(/,\s*|\s+/);

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

                        // Create plus sign element
                        const plusSign = document.createElement("span");
                        plusSign.className = "plus-sign";
                        plusSign.innerHTML = "➕";
                        plusSign.addEventListener("click", (e) => {
                            e.stopPropagation();
                            addToSelectedTags(word.trim());
                        });

                        tag.appendChild(plusSign);
                        tagsDiv.appendChild(tag);
                        tagsDiv.appendChild(document.createTextNode(" "));
                    }
                });
            });
        } else {
            tagsDiv.innerHTML = "No tags found. Please try another image.";
        }
    } catch (error) {
        console.error("Classification error:", error);
        tagsDiv.innerHTML = "Error classifying the image. Please try again.";
    }
}

// Function to add tag to selected tags container
function addToSelectedTags(tagText) {
    // Check if tag already exists in selected tags
    const existingTags = Array.from(
        selectedTagsContainer.querySelectorAll(".selected-tag")
    ).map((tag) => tag.textContent.replace("×", "").trim());

    if (!existingTags.includes(tagText)) {
        const selectedTag = document.createElement("span");
        selectedTag.className = "selected-tag";
        selectedTag.textContent = tagText;

        // Add remove button
        const removeBtn = document.createElement("span");
        removeBtn.className = "remove-tag";
        removeBtn.innerHTML = " ×";
        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            selectedTag.remove();
        });

        selectedTag.appendChild(removeBtn);
        selectedTagsContainer.appendChild(selectedTag);
    }
}

// Initialize the app
async function initializeApp() {
    imagePreview = document.getElementById("image-preview");

    // Attach event listener to file input for automatic upload
    uploadImage();

    // Initialize the classifier
    await initializeClassifier();
}

// Start the app when the page loads
window.onload = initializeApp;

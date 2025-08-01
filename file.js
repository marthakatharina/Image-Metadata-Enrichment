// Initialize variables
let classifier;
let imagePreview;
let tagsDiv;
let selectedTagsContainer;
let selectedTagsEmpty;
let savedTags = new Set();
let customTagInput;
let addTagBtn;
let savedTagsContainer;

// Load the MobileNet model
async function initializeClassifier() {
    classifier = await ml5.imageClassifier("MobileNet");
    console.log("MobileNet model loaded!");
}

function uploadImage() {
    const fileInput = document.getElementById("image-upload");

    // Clear file input on page load
    fileInput.value = "";

    fileInput.addEventListener("change", async function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async function (event) {
                // Set the image source to the uploaded file
                imagePreview.src = event.target.result;

                // Change styling after image loads
                const h1 = document.getElementById("intro-heading");
                h1.style.display = "none";
                const h2 = document.getElementById("upload-heading");
                h2.textContent = "Upload another image";
                const imageContainer =
                    document.getElementById("image-container");
                const previewIcon = document.getElementById("image-preview");
                const tagsContainer = document.getElementById("tags-container");

                // Clear existing containers
                tagsContainer.innerHTML = "";
                const tagsWrap = document.createElement("div");
                tagsWrap.className = "extracted-tags";
                tagsContainer.appendChild(tagsWrap);
                // Create heading for extracted tags
                const pTag = document.createElement("h3");
                pTag.textContent = "Image Analysis Results";
                tagsWrap.appendChild(pTag);

                // Create tags container
                tagsDiv = document.createElement("div");
                tagsDiv.className = "tags";
                tagsDiv.id = "tags";
                tagsWrap.appendChild(tagsDiv);

                // Add remove button
                const removeExtractedTags = document.createElement("span");
                removeExtractedTags.className = "remove-extracted-tags";
                removeExtractedTags.innerHTML = " ×";
                removeExtractedTags.addEventListener("click", (e) => {
                    e.stopPropagation();
                    tagsWrap.remove();
                });

                tagsWrap.appendChild(removeExtractedTags);

                // Create selected tags section

                const selectedTagsWrapper = document.createElement("div");
                selectedTagsWrapper.className = "selected-tags-wrapper";
                selectedTagsWrapper.id = "selected-tags-wrapper";
                tagsContainer.appendChild(selectedTagsWrapper);

                const selectedTagsHeading = document.createElement("h3");
                selectedTagsEmpty = document.createElement("p");
                selectedTagsEmpty.className = "tags-empty-state";
                selectedTagsHeading.textContent =
                    "Selected Tags for This Image";
                selectedTagsEmpty.textContent =
                    "No tags selected yet.\n\nClick + button to add a tag or add your own.";
                selectedTagsWrapper.appendChild(selectedTagsHeading);
                selectedTagsWrapper.appendChild(selectedTagsEmpty);

                selectedTagsContainer = document.createElement("div");
                selectedTagsContainer.className = "selected-tags";
                selectedTagsContainer.id = "selected-tags";
                selectedTagsWrapper.appendChild(selectedTagsContainer);

                // Update image styling
                imageContainer.style.backgroundColor = "";
                imageContainer.style.width = "";
                imageContainer.style.height = "auto";
                previewIcon.style.width = "100%";

                // Add custom tag input
                const addTagContainer = document.createElement("div");
                addTagContainer.className = "add-tag-container";

                customTagInput = document.createElement("input");
                customTagInput.type = "text";
                customTagInput.id = "custom-tag-input";
                customTagInput.placeholder = "Add your own tag...";

                addTagBtn = document.createElement("button");
                addTagBtn.id = "add-tag-btn";
                addTagBtn.textContent = "Add Tag";

                addTagContainer.appendChild(customTagInput);
                addTagContainer.appendChild(addTagBtn);
                tagsContainer.appendChild(addTagContainer);

                // Set up event listeners for custom tags
                setupCustomTagInput();

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
                        plusSign.innerHTML = "+";
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

function setupCustomTagInput() {
    // Add tag on button click
    addTagBtn.addEventListener("click", addCustomTag);

    // Add tag on Enter key
    customTagInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            addCustomTag();
        }
    });
}

function addCustomTag() {
    const tagText = customTagInput.value.trim();
    if (tagText) {
        // Add to selected tags
        addToSelectedTags(tagText);

        // Add to saved tags
        if (!savedTags.has(tagText)) {
            savedTags.add(tagText);
            renderSavedTags();
        }

        // Clear the input
        customTagInput.value = "";
    }
}

function renderSavedTags() {
    const container = document.getElementById("saved-tags");
    container.innerHTML = "";

    if (savedTags.size === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.className = "tags-empty-state";
        emptyMsg.textContent = "No saved tags yet";
        container.appendChild(emptyMsg);
        return;
    }

    savedTags.forEach((tag) => {
        const tagElement = document.createElement("span");
        tagElement.className = "saved-tag";
        tagElement.textContent = tag;

        // Add plus sign to add to selected tags
        const plusSign = document.createElement("span");
        plusSign.className = "plus-sign";
        plusSign.innerHTML = "+";
        plusSign.addEventListener("click", (e) => {
            e.stopPropagation();
            addToSelectedTags(tag);
        });

        // Add remove button to delete from saved tags
        const removeBtn = document.createElement("span");
        removeBtn.className = "remove-tag";
        removeBtn.innerHTML = " ×";
        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            savedTags.delete(tag);
            renderSavedTags();
        });

        tagElement.appendChild(plusSign);
        tagElement.appendChild(removeBtn);
        container.appendChild(tagElement);
    });
}

// Function to add tag to selected tags container
function addToSelectedTags(tagText) {
    selectedTagsEmpty.remove();
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

        // Add to saved tags if not already present
        if (!savedTags.has(tagText)) {
            savedTags.add(tagText);
            renderSavedTags();
        }
    }
    // After adding the tag:
    setTimeout(() => {
        selectedTagsContainer.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
        });
    }, 100); // Small delay to allow DOM update
}

// Initialize the app
async function initializeApp() {
    imagePreview = document.getElementById("image-preview");
    savedTagsContainer = document.getElementById("saved-tags-container");

    const toggleBtn = document.querySelector(".saved-tags-toggle");

    toggleBtn.addEventListener("click", function () {
        savedTagsContainer.classList.toggle("collapsed");
        const isCollapsed = savedTagsContainer.classList.contains("collapsed");
        toggleBtn.textContent = isCollapsed ? "☰" : "×";
    });

    // Initialize saved tags display
    renderSavedTags();

    // Attach event listener to file input for automatic upload
    uploadImage();

    // Initialize the classifier
    await initializeClassifier();
}

// Start the app when the page loads
window.onload = initializeApp;

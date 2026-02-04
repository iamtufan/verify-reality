// ==========================================
// ⚙️ CONFIGURATION (ENTER YOUR API DETAILS HERE)
// ==========================================
const API_CONFIG = {
  url: "https://your-api-provider.com/v1/detect", // Replace with actual API URL
  key: "YOUR_API_KEY_HERE",
  threshold: 0.5,
};

// ==========================================
// 🚀 MAIN LOGIC
// ==========================================

const imgInput = document.getElementById("imageInput");
const vidInput = document.getElementById("videoInput");
const imgBox = document.querySelector("#imageSection .upload-box");
const vidBox = document.querySelector("#videoSection .upload-box");

// Save original content to restore later if needed
const originalImgContent = imgBox.innerHTML;
const originalVidContent = vidBox.innerHTML;

// 1. FILE PREVIEW LOGIC
// ==========================================

// Handle Image Selection
imgInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imgBox.innerHTML = `
                        <div class="position-relative w-100 h-100 d-flex justify-content-center align-items-center">
                            <img src="${e.target.result}" class="img-fluid rounded shadow" style="max-height: 300px; object-fit: contain;">
                            <button onclick="resetUpload('image')" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle" style="width:30px; height:30px; padding:0;">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    `;
      // Remove click listener temporarily so clicking preview doesn't open file dialog again
      imgBox.onclick = null;
    };
    reader.readAsDataURL(file);
  }
});

// Handle Video Selection
vidInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    vidBox.innerHTML = `
                    <div class="position-relative w-100 h-100 d-flex justify-content-center align-items-center">
                        <video controls class="img-fluid rounded shadow" style="max-height: 300px;">
                            <source src="${url}" type="${file.type}">
                            Your browser does not support the video tag.
                        </video>
                        <button onclick="resetUpload('video')" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle" style="width:30px; height:30px; padding:0; z-index:10;">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                `;
    vidBox.onclick = null;
  }
});

// Reset Upload Function
window.resetUpload = function (type) {
  event.stopPropagation(); // Stop bubble up
  if (type === "image") {
    imgInput.value = ""; // Clear input
    imgBox.innerHTML = originalImgContent; // Restore original text
    imgBox.onclick = () => imgInput.click(); // Restore click handler
  } else {
    vidInput.value = "";
    vidBox.innerHTML = originalVidContent;
    vidBox.onclick = () => vidInput.click();
  }
};

// 2. CHECK BUTTON LOGIC
// ==========================================
document.getElementById("checkBtn").addEventListener("click", async () => {
  const isImageMode = document
    .getElementById("imageSection")
    .classList.contains("active");
  const fileInput = isImageMode ? imgInput : vidInput;
  const file = fileInput.files[0];

  if (!file) {
    alert(`Please upload a ${isImageMode ? "Image" : "Video"} first!`);
    return;
  }

  const loader = document.getElementById("analysisLoader");
  const progressBar = loader.querySelector(".progress-bar");
  const resultArea = document.getElementById("resultArea");

  resultArea.innerHTML = "";
  loader.style.display = "block";
  progressBar.style.width = "30%";

  // Create FormData
  const formData = new FormData();
  formData.append("file", file);

  try {
    // Fake Progress for Demo (Replace this block with real fetch)
    let progress = 30;
    const interval = setInterval(() => {
      progress += 10;
      progressBar.style.width = progress + "%";
      if (progress >= 100) clearInterval(interval);
    }, 200);

    // --- START API CALL (Uncomment below to use real API) ---
    /*
                const response = await fetch(API_CONFIG.url, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${API_CONFIG.key}` },
                    body: formData
                });
                const data = await response.json();
                const aiScore = data.ai_score; // Adjust based on your API response
                */
    // --- END API CALL ---

    // SIMULATED RESPONSE (Remove this when API is connected)
    await new Promise((r) => setTimeout(r, 2000)); // Wait 2 seconds
    const aiScore = Math.random(); // Random score for demo
    // -----------------------------------------------------

    loader.style.display = "none";
    displayResult(aiScore > API_CONFIG.threshold, isImageMode, aiScore);
  } catch (error) {
    console.error(error);
    loader.style.display = "none";
    alert("An error occurred during analysis.");
  }
});

function displayResult(isAI, isImageMode, score) {
  const resultArea = document.getElementById("resultArea");
  const mediaType = isImageMode ? "Image" : "Video";
  const percentage = (score * 100).toFixed(1) + "%";
  const humanPercentage = (100 - score * 100).toFixed(1) + "%";

  if (isAI) {
    resultArea.innerHTML = `
                    <div class="result-badge bg-ai animate__animated animate__shakeX">
                        <i class="fa-solid fa-robot me-3"></i> 
                        <span>It's AI Made ${mediaType}</span>
                    </div>
                    <div class="mt-3 text-start bg-dark p-3 rounded border border-secondary">
                        <label class="small text-muted mb-1">AI Confidence</label>
                        <div class="progress mb-2" style="height: 10px; background: #333;">
                            <div class="progress-bar bg-danger" style="width: ${percentage}"></div>
                        </div>
                        <p class="text-white fw-bold mb-0">${percentage} Detected</p>
                    </div>
                `;
  } else {
    resultArea.innerHTML = `
                    <div class="result-badge bg-real animate__animated animate__bounceIn">
                        <i class="fa-solid fa-circle-check me-3"></i> 
                        <span>It's Real ${mediaType}</span>
                    </div>
                    <div class="mt-3 text-start bg-dark p-3 rounded border border-secondary">
                        <label class="small text-muted mb-1">Authenticity Score</label>
                        <div class="progress mb-2" style="height: 10px; background: #333;">
                            <div class="progress-bar bg-success" style="width: ${humanPercentage}"></div>
                        </div>
                        <p class="text-white fw-bold mb-0">${humanPercentage} Authentic</p>
                    </div>
                `;
  }
}

// Tab Switching Logic
window.switchTab = function (type) {
  const imgSec = document.getElementById("imageSection");
  const vidSec = document.getElementById("videoSection");
  const navImg = document.getElementById("nav-img");
  const navVid = document.getElementById("nav-vid");
  const title = document.getElementById("mainTitle");
  const resultArea = document.getElementById("resultArea");

  resultArea.innerHTML = ""; // Clear results

  if (type === "image") {
    imgSec.classList.add("active");
    vidSec.classList.remove("active");
    navImg.classList.add("active");
    navVid.classList.remove("active");
    title.innerText = "Analyze Image Reality";
  } else {
    imgSec.classList.remove("active");
    vidSec.classList.add("active");
    navImg.classList.remove("active");
    navVid.classList.add("active");
    title.innerText = "Analyze Video Reality";
  }
};

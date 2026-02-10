// Current active detection type
let currentType = 'image';
let uploadedFile = null;
let isLoggedIn = false; // Change to true for testing premium features

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeScrollAnimations();
    updateNavbarOnScroll();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Image upload
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            handleFileUpload(e, 'image');
        });
    }

    // Video upload
    const videoInput = document.getElementById('videoInput');
    if (videoInput) {
        videoInput.addEventListener('change', function(e) {
            handleFileUpload(e, 'video');
        });
    }

    // Drag and drop for upload boxes
    const uploadBoxes = document.querySelectorAll('.upload-box:not(.locked)');
    uploadBoxes.forEach(box => {
        box.addEventListener('dragover', handleDragOver);
        box.addEventListener('dragleave', handleDragLeave);
        box.addEventListener('drop', handleDrop);
    });
}

// Switch between detection types
function switchDetectionType(type) {
    // Check if premium feature and user not logged in
    const premiumTypes = ['audio', 'link', 'news'];
    if (premiumTypes.includes(type) && !isLoggedIn) {
        // The modal will be triggered by the button in the locked section
        return;
    }

    currentType = type;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.detection-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${type}Section`).classList.add('active');

    // Reset uploaded file
    uploadedFile = null;
    
    // Clear result area
    const resultArea = document.getElementById('resultArea');
    if (resultArea) {
        resultArea.classList.remove('active');
        resultArea.innerHTML = '';
    }

    // Update page title based on type
    updatePageTitle(type);
}

// Update page title
function updatePageTitle(type) {
    const titles = {
        'image': 'Analyze Image Reality',
        'video': 'Analyze Video Reality',
        'audio': 'Analyze Audio Reality',
        'link': 'Analyze Link Content',
        'news': 'Verify News Authenticity'
    };
    
    const mainTitle = document.getElementById('mainTitle');
    if (mainTitle) {
        mainTitle.textContent = titles[type] || 'Verify Digital Reality';
    }
}

// Handle file upload
function handleFileUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    uploadedFile = file;

    // Show preview
    const previewId = `${type}Preview`;
    const preview = document.getElementById(previewId);
    
    if (preview) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            if (type === 'image') {
                preview.innerHTML = `
                    <div class="animate__animated animate__fadeIn">
                        <img src="${e.target.result}" alt="Preview" />
                        <p class="text-success mt-2 small">
                            <i class="fa-solid fa-check-circle me-1"></i>
                            ${file.name} uploaded successfully
                        </p>
                    </div>
                `;
            } else if (type === 'video') {
                preview.innerHTML = `
                    <div class="animate__animated animate__fadeIn">
                        <video src="${e.target.result}" controls></video>
                        <p class="text-success mt-2 small">
                            <i class="fa-solid fa-check-circle me-1"></i>
                            ${file.name} uploaded successfully
                        </p>
                    </div>
                `;
            }
        };
        
        reader.readAsDataURL(file);
    }
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this.style.borderColor = '#ff9800';
    this.style.background = 'rgba(255, 152, 0, 0.05)';
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.style.borderColor = '';
    this.style.background = '';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.style.borderColor = '';
    this.style.background = '';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const fileInput = document.getElementById(`${currentType}Input`);
        if (fileInput) {
            fileInput.files = files;
            handleFileUpload({ target: { files: files } }, currentType);
        }
    }
}

// Analyze media function
async function analyzeMedia() {
    if (!uploadedFile) {
        showNotification('Please upload a file first!', 'warning');
        return;
    }

    // Hide result area
    const resultArea = document.getElementById('resultArea');
    resultArea.classList.remove('active');
    resultArea.innerHTML = '';

    // Show loader
    const loader = document.getElementById('analysisLoader');
    loader.classList.add('active');

    // Start progress animation
    animateProgress();

    try {
        // Call the actual API
        const result = await callDetectionAPI(uploadedFile, currentType);
        
        if (result) {
            // Hide loader
            loader.classList.remove('active');
            
            // Show results from API
            displayResults(result);
        } else {
            throw new Error('API returned no data');
        }
    } catch (error) {
        console.error('Analysis Error:', error);
        loader.classList.remove('active');
        showNotification('Analysis failed. Please try again or check your API configuration.', 'danger');
    }
}

// Animate progress during API call
function animateProgress() {
    const progressBar = document.getElementById('progressBar');
    const loaderText = document.getElementById('loaderText');
    
    const steps = [
        { progress: 20, text: 'Uploading file to server...' },
        { progress: 40, text: 'Analyzing pixel patterns...' },
        { progress: 60, text: 'Detecting AI signatures...' },
        { progress: 80, text: 'Running neural network analysis...' },
        { progress: 95, text: 'Processing results...' }
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            progressBar.style.width = steps[currentStep].progress + '%';
            loaderText.textContent = steps[currentStep].text;
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 800);

    // Store interval ID to clear it if API returns early
    return interval;
}

// Display analysis results from API
function displayResults(apiResult) {
    const resultArea = document.getElementById('resultArea');
    
    // Extract data from API result
    const isAI = apiResult.isAI || apiResult.is_ai_generated || apiResult.ai_detected || false;
    const confidence = apiResult.confidence || apiResult.confidence_score || 0;
    const details = apiResult.details || apiResult.analysis_details || {};

    if (isAI) {
        resultArea.innerHTML = `
            <div class="text-center">
                <div class="result-badge ai-detected">
                    <i class="fa-solid fa-robot"></i>
                    <span>AI Generated Content Detected</span>
                </div>
                
                <p class="text-muted mb-4">
                    Our analysis indicates this ${currentType} was likely created using artificial intelligence.
                </p>

                <div class="confidence-meter">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-white fw-bold">Confidence Level</span>
                        <span class="text-warning fw-bold">${confidence}%</span>
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: 0%">
                            <span class="confidence-text"></span>
                        </div>
                    </div>
                </div>

                <div class="mt-5 p-4 bg-dark rounded-4 border border-secondary">
                    <h6 class="text-warning mb-3">
                        <i class="fa-solid fa-lightbulb me-2"></i>Detection Factors
                    </h6>
                    <div class="row g-3 text-start">
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-danger me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">Noise Pattern Analysis</small>
                                    <p class="small text-muted mb-0">${details.noise_pattern || 'Unnatural pixel distribution detected'}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-danger me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">Metadata Signature</small>
                                    <p class="small text-muted mb-0">${details.metadata || 'Missing EXIF camera data'}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-danger me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">Artifact Detection</small>
                                    <p class="small text-muted mb-0">${details.artifacts || 'AI generation artifacts found'}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-danger me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">Neural Network Score</small>
                                    <p class="small text-muted mb-0">${details.neural_score || 'High AI probability score'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button class="btn btn-outline-warning mt-4 px-4" onclick="resetAnalysis()">
                    <i class="fa-solid fa-rotate-right me-2"></i>Analyze Another
                </button>
            </div>
        `;
    } else {
        resultArea.innerHTML = `
            <div class="text-center">
                <div class="result-badge real-detected">
                    <i class="fa-solid fa-circle-check"></i>
                    <span>Authentic Content Detected</span>
                </div>
                
                <p class="text-muted mb-4">
                    Our analysis suggests this ${currentType} is authentic and not AI-generated.
                </p>

                <div class="confidence-meter">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-white fw-bold">Confidence Level</span>
                        <span class="text-success fw-bold">${confidence}%</span>
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: 0%; background: linear-gradient(90deg, #28a745, #4dd4ac)">
                            <span class="confidence-text"></span>
                        </div>
                    </div>
                </div>

                <div class="mt-5 p-4 bg-dark rounded-4 border border-secondary">
                    <h6 class="text-success mb-3">
                        <i class="fa-solid fa-shield-halved me-2"></i>Authenticity Indicators
                    </h6>
                    <div class="row g-3 text-start">
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-success me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">Natural Noise Pattern</small>
                                    <p class="small text-muted mb-0">${details.noise_pattern || 'Consistent with camera sensors'}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-success me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">Valid Metadata</small>
                                    <p class="small text-muted mb-0">${details.metadata || 'Authentic EXIF data present'}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-success me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">No AI Artifacts</small>
                                    <p class="small text-muted mb-0">${details.artifacts || 'Clean from generation markers'}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-success me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">Neural Network Score</small>
                                    <p class="small text-muted mb-0">${details.neural_score || 'Low AI probability score'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button class="btn btn-outline-success mt-4 px-4" onclick="resetAnalysis()">
                    <i class="fa-solid fa-rotate-right me-2"></i>Analyze Another
                </button>
            </div>
        `;
    }

    resultArea.classList.add('active');

    // Animate confidence bar
    setTimeout(() => {
        const fill = resultArea.querySelector('.confidence-fill');
        if (fill) {
            fill.style.width = confidence + '%';
        }
    }, 300);

    // Scroll to results
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Reset analysis
function resetAnalysis() {
    uploadedFile = null;
    
    // Clear file inputs
    const imageInput = document.getElementById('imageInput');
    const videoInput = document.getElementById('videoInput');
    if (imageInput) imageInput.value = '';
    if (videoInput) videoInput.value = '';
    
    // Clear previews
    const imagePrev = document.getElementById('imagePreview');
    const videoPrev = document.getElementById('videoPreview');
    if (imagePrev) imagePrev.innerHTML = '';
    if (videoPrev) videoPrev.innerHTML = '';
    
    // Hide results
    const resultArea = document.getElementById('resultArea');
    resultArea.classList.remove('active');
    
    // Reset progress
    const progressBar = document.getElementById('progressBar');
    if (progressBar) progressBar.style.width = '0%';
    
    // Scroll to top of upload area
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-5 animate__animated animate__fadeInDown`;
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        <i class="fa-solid fa-exclamation-circle me-2"></i>${message}
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('animate__fadeInDown');
        notification.classList.add('animate__fadeOutUp');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.classList.add('animate-on-scroll');
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe about section elements
    const aboutElements = document.querySelectorAll('.animate__animated');
    aboutElements.forEach(el => {
        observer.observe(el);
    });
}

// Update navbar on scroll
function updateNavbarOnScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ============================================
// API CONFIGURATION - UPDATE WITH YOUR API DETAILS
// ============================================
const API_CONFIG = {
    endpoint: 'https://iamtufan.github.io/verify-reality', // e.g., 'https://api.example.com/detect'
    apiKey: 'AIzaSyD9GRtG19-Go-qSP5sYWK-okYYFb_1hKW0',        // Your API key (if required)
    method: 'POST',
    headers: {
        // Add your required headers here
        // 'Authorization': 'Bearer YOUR_API_KEY',
        // 'Content-Type': 'multipart/form-data' // Usually not needed for FormData
    }
};

// API Integration - Call AI Detection API
async function callDetectionAPI(file, type) {
    try {
        // Create FormData object to send file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        
        // Add any additional parameters your API needs
        // formData.append('model', 'v2');
        // formData.append('language', 'en');

        console.log('Sending request to API...');
        console.log('File:', file.name, 'Type:', type);

        // Make API request
        const response = await fetch(API_CONFIG.endpoint, {
            method: API_CONFIG.method,
            headers: {
                'Authorization': `Bearer ${API_CONFIG.apiKey}`,
                // Don't set Content-Type for FormData - browser sets it automatically with boundary
                ...API_CONFIG.headers
            },
            body: formData
        });

        // Check if request was successful
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        // Parse JSON response
        const data = await response.json();
        console.log('API Response:', data);

        // Map API response to expected format
        // ADJUST THIS BASED ON YOUR API'S RESPONSE STRUCTURE
        return {
            isAI: data.is_ai_generated || data.ai_detected || data.fake || false,
            confidence: Math.round(data.confidence * 100) || Math.round(data.score * 100) || 0,
            details: {
                noise_pattern: data.noise_analysis || data.details?.noise,
                metadata: data.metadata_analysis || data.details?.metadata,
                artifacts: data.artifacts_detected || data.details?.artifacts,
                neural_score: data.neural_network_score || data.details?.neural_score
            }
        };

    } catch (error) {
        console.error('API Call Error:', error);
        
        // Show user-friendly error message
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Unable to connect to detection service. Please check your internet connection.');
        } else if (error.message.includes('API Error: 401')) {
            throw new Error('Authentication failed. Please check your API key.');
        } else if (error.message.includes('API Error: 429')) {
            throw new Error('Too many requests. Please try again later.');
        } else {
            throw new Error(`Detection failed: ${error.message}`);
        }
    }
}

// Alternative API format examples:
// If your API uses different format, uncomment and modify:

/*
// Example 1: Base64 encoding
async function callDetectionAPI(file, type) {
    const base64 = await fileToBase64(file);
    
    const response = await fetch(API_CONFIG.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
            image: base64,
            type: type
        })
    });
    
    const data = await response.json();
    return {
        isAI: data.prediction === 'ai',
        confidence: data.confidence_percentage
    };
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}
*/

/*
// Example 2: URL-based API
async function callDetectionAPI(file, type) {
    // First upload file to get URL
    const uploadResponse = await uploadFile(file);
    const fileUrl = uploadResponse.url;
    
    // Then analyze the URL
    const response = await fetch(API_CONFIG.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_CONFIG.apiKey
        },
        body: JSON.stringify({
            url: fileUrl,
            analysis_type: type
        })
    });
    
    const data = await response.json();
    return {
        isAI: data.result.is_synthetic,
        confidence: data.result.confidence_score
    };
}
*/

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

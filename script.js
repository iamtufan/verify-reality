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
function analyzeMedia() {
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

    // Simulate analysis process
    simulateAnalysis();
}

// Simulate analysis with progress
function simulateAnalysis() {
    const progressBar = document.getElementById('progressBar');
    const loaderText = document.getElementById('loaderText');
    
    const steps = [
        { progress: 20, text: 'Extracting metadata...' },
        { progress: 40, text: 'Analyzing pixel patterns...' },
        { progress: 60, text: 'Detecting noise artifacts...' },
        { progress: 80, text: 'Running neural network analysis...' },
        { progress: 100, text: 'Finalizing results...' }
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            progressBar.style.width = steps[currentStep].progress + '%';
            loaderText.textContent = steps[currentStep].text;
            currentStep++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                showResults();
            }, 500);
        }
    }, 800);
}

// Show analysis results
function showResults() {
    // Hide loader
    const loader = document.getElementById('analysisLoader');
    loader.classList.remove('active');

    // Generate random result (replace with actual API call)
    const isAI = Math.random() > 0.5;
    const confidence = Math.floor(Math.random() * 20) + 80; // 80-100%

    const resultArea = document.getElementById('resultArea');
    
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
                                    <p class="small text-muted mb-0">Unnatural pixel distribution detected</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-danger me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">Metadata Signature</small>
                                    <p class="small text-muted mb-0">Missing EXIF camera data</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-danger me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">Artifact Detection</small>
                                    <p class="small text-muted mb-0">AI generation artifacts found</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-danger me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">Neural Network Score</small>
                                    <p class="small text-muted mb-0">High AI probability score</p>
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
                                    <p class="small text-muted mb-0">Consistent with camera sensors</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-success me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">Valid Metadata</small>
                                    <p class="small text-muted mb-0">Authentic EXIF data present</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-success me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">No AI Artifacts</small>
                                    <p class="small text-muted mb-0">Clean from generation markers</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-start">
                                <i class="fa-solid fa-circle-check text-success me-2 mt-1"></i>
                                <div>
                                    <small class="text-white fw-bold">Neural Network Score</small>
                                    <p class="small text-muted mb-0">Low AI probability score</p>
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

// API Integration placeholder (to be implemented with actual API)
async function callDetectionAPI(file, type) {
    // This is where you'll integrate your actual AI detection API
    // Example structure:
    
    /*
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    try {
        const response = await fetch('YOUR_API_ENDPOINT', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer YOUR_API_KEY'
            }
        });
        
        const data = await response.json();
        return {
            isAI: data.is_ai_generated,
            confidence: data.confidence,
            details: data.analysis_details
        };
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
    */
    
    // For now, returning mock data
    return {
        isAI: Math.random() > 0.5,
        confidence: Math.floor(Math.random() * 20) + 80
    };
}

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


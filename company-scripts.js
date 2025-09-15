// Company Page JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the upload form
    initializeUploadForm();
    
    // Initialize Lojas count for this company
    initializeCompanyLojasCount();
    
    // Initialize admin login
    initializeAdminLogin();
    
    // Add loading animation
    addLoadingAnimation();
});

// Initialize upload form functionality
function initializeUploadForm() {
    const form = document.getElementById('uploadForm');
    if (form) {
        form.addEventListener('submit', handleFileUpload);
    }
}

// Handle file upload
async function handleFileUpload(e) {
    e.preventDefault();
    
    // Check if admin is logged in
    if (!isAdminLoggedIn()) {
        showNotification('Você precisa fazer login como administrador para fazer upload de arquivos.', 'error');
        showLoginModal();
        return;
    }
    
    const formData = new FormData(e.target);
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Please select a file to upload.', 'error');
        return;
    }
    
    // Get form values
    const auditDate = formData.get('auditDate');
    const branchNumber = formData.get('branchNumber');
    const description = formData.get('description');
    const priority = formData.get('priority');
    
    // Get company ID
    const companyName = getCurrentCompany();
    const companyId = await getCompanyId(companyName);
    
    if (!companyId) {
        showNotification('Company not found.', 'error');
        return;
    }
    
    // Prepare form data for API
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('company_id', companyId);
    uploadFormData.append('audit_date', auditDate);
    uploadFormData.append('branch_number', branchNumber);
    uploadFormData.append('description', description);
    uploadFormData.append('status', priority);
    
    // Show progress
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Uploading...';
    submitBtn.disabled = true;
    
    showNotification('Uploading file...', 'info');
    
    try {
        // Upload via API
        const response = await window.auditAPI.uploadAudit(uploadFormData);
        
        // Add to recent uploads
        addToRecentUploads(file.name, auditDate, branchNumber, priority);
        
        // Store audit data for backlog
        storeAuditData(file.name, auditDate, branchNumber, description, priority);
        
        // Update Last Audit date
        updateLastAuditDate(auditDate);
        
        // Update Lojas count for this company
        await updateLojasCount();
        
        // Show success notification
        showNotification(`File "${file.name}" uploaded successfully!`, 'success');
        
        // Reset form
        e.target.reset();
        
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Upload failed. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Get company ID by name
async function getCompanyId(companyName) {
    try {
        const response = await window.auditAPI.getCompany(companyName);
        return response.company.id;
    } catch (error) {
        console.error('Failed to get company ID:', error);
        return null;
    }
}

// Add file to recent uploads list
function addToRecentUploads(filename, auditDate, branchNumber, priority) {
    const uploadsList = document.querySelector('.uploads-list');
    if (!uploadsList) return;
    
    // Remove empty state if it exists
    const emptyUploads = uploadsList.querySelector('.empty-uploads');
    if (emptyUploads) {
        emptyUploads.remove();
    }
    
    const uploadItem = document.createElement('div');
    uploadItem.className = 'upload-item';
    
    uploadItem.innerHTML = `
        <div class="upload-info">
            <span class="upload-filename">${filename}</span>
            <span class="upload-date">${auditDate}</span>
            <span class="upload-branch">Filial: ${branchNumber}</span>
        </div>
        <div class="upload-meta">
            <span class="upload-priority ${priority}">${getStatusLabel(priority)}</span>
        </div>
    `;
    
    // Insert at the top
    uploadsList.insertBefore(uploadItem, uploadsList.firstChild);
    
    // Add animation
    uploadItem.style.opacity = '0';
    uploadItem.style.transform = 'translateY(-20px)';
    uploadItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
        uploadItem.style.opacity = '1';
        uploadItem.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove oldest item if more than 3 items
    const items = uploadsList.querySelectorAll('.upload-item');
    if (items.length > 3) {
        uploadsList.removeChild(items[items.length - 1]);
    }
}


// Store audit data for backlog
function storeAuditData(filename, auditDate, branchNumber, description, priority) {
    const companyName = getCurrentCompany();
    const auditsKey = `${companyName}_audits`;
    
    // Get existing audits
    const existingAudits = JSON.parse(localStorage.getItem(auditsKey) || '[]');
    
    // Create new audit object
    const newAudit = {
        id: `${companyName}_${Date.now()}`,
        filename: filename,
        auditDate: auditDate,
        branchNumber: branchNumber,
        description: description,
        status: priority,
        uploadDate: new Date().toISOString().split('T')[0]
    };
    
    // Add to beginning of array (newest first)
    existingAudits.unshift(newAudit);
    
    // Store back in localStorage
    localStorage.setItem(auditsKey, JSON.stringify(existingAudits));
}

// Update Last Audit date
function updateLastAuditDate(auditDate) {
    const lastAuditElement = document.querySelector('.last-audit-date');
    if (lastAuditElement) {
        lastAuditElement.textContent = auditDate;
    }
    
    // Store in localStorage for persistence
    const companyName = getCurrentCompany();
    localStorage.setItem(`${companyName}_last_audit`, auditDate);
}

// Get status label
function getStatusLabel(status) {
    const labels = {
        'aprovada': 'Aprovada',
        'aprovada-com-aviso': 'Aprovada com aviso',
        'reprovada': 'Reprovada'
    };
    return labels[status] || status;
}

// Update Lojas count for this company
function updateLojasCount() {
    // Get current company from URL or page title
    const companyName = getCurrentCompany();
    const lojasKey = `${companyName}_lojas`;
    
    // Get current count from localStorage
    const currentCount = parseInt(localStorage.getItem(lojasKey) || '0');
    const newCount = currentCount + 1;
    
    // Store new count
    localStorage.setItem(lojasKey, newCount.toString());
    
    // Update the display on current page
    const lojasElement = document.querySelector('.status-value.lojas');
    if (lojasElement) {
        animateValueChange(lojasElement, currentCount, newCount, '');
    }
    
    // Update the main dashboard if possible
    if (window.parent && window.parent.updateCompanyLojas) {
        window.parent.updateCompanyLojas(companyName, newCount);
    }
}

// Get current company name
function getCurrentCompany() {
    const path = window.location.pathname;
    if (path.includes('carol')) return 'carol';
    if (path.includes('grand-vision')) return 'grand-vision';
    if (path.includes('sunglass-hut')) return 'sunglass-hut';
    return 'unknown';
}

// Initialize Lojas count for this company page
function initializeCompanyLojasCount() {
    const companyName = getCurrentCompany();
    const lojasKey = `${companyName}_lojas`;
    // Reset count to zero
    localStorage.setItem(lojasKey, '0');
    
    const lojasElement = document.querySelector('.status-value.lojas');
    if (lojasElement) {
        lojasElement.textContent = '0';
    }
    
    // Load last audit date from localStorage
    const lastAuditKey = `${companyName}_last_audit`;
    const lastAuditDate = localStorage.getItem(lastAuditKey);
    const lastAuditElement = document.querySelector('.last-audit-date');
    if (lastAuditElement) {
        lastAuditElement.textContent = lastAuditDate || 'N/A';
    }
}

// Animate value changes (reused from main scripts)
function animateValueChange(element, start, end, suffix) {
    const duration = 1000;
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.round(start + (end - start) * progress);
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    const colors = {
        'success': '#28a745',
        'error': '#dc3545',
        'info': '#17a2b8',
        'warning': '#ffc107'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Go back to dashboard
function goBack() {
    window.location.href = 'Untitled-1.html';
}

// Add loading animation
function addLoadingAnimation() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
}

// Admin Login Functions (shared with main dashboard)
function initializeAdminLogin() {
    // Admin login functionality is handled by the main dashboard
    // This function exists for consistency
}

function isAdminLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

function showLoginModal() {
    // Redirect to main dashboard for login
    if (window.parent && window.parent !== window) {
        // If we're in an iframe, communicate with parent
        window.parent.showLoginModal();
    } else {
        // If we're not in an iframe, redirect to main page
        window.location.href = 'Untitled-1.html';
    }
}

// Notification system (shared with main dashboard)
function showNotification(message, type = 'info') {
    // Try to use parent notification system first
    if (window.parent && window.parent !== window && window.parent.showNotification) {
        window.parent.showNotification(message, type);
        return;
    }
    
    // Fallback to local notification
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            notification.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ff9800';
            break;
        default:
            notification.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

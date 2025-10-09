// Backlog Page JavaScript

// Global variables
let allAudits = [];
let filteredAudits = [];

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the backlog page
    initializeBacklogPage();
    
    // Initialize audit details modal
    initializeAuditDetailsModal();
    
    // Initialize delete password modal
    initializeDeletePasswordModal();
    
    // Add loading animation
    addLoadingAnimation();
});

// Initialize backlog page
async function initializeBacklogPage() {
    try {
        // Load all audits
        await loadAllAudits();
        
        // Display audits
        displayAudits();
        
        // Update statistics
        updateStatistics();
        
    } catch (error) {
        console.error('Failed to initialize backlog page:', error);
        showNotification('Erro ao carregar auditorias. Tente novamente.', 'error');
    }
}

// Load all audits from localStorage and API
async function loadAllAudits() {
    allAudits = [];
    
    // Load from localStorage (simulated data for now)
    const companies = ['carol', 'grand-vision', 'sunglass-hut'];
    
    companies.forEach(company => {
        const companyAudits = JSON.parse(localStorage.getItem(`${company}_audits`) || '[]');
        companyAudits.forEach(audit => {
            allAudits.push({
                ...audit,
                company: company,
                companyName: getCompanyDisplayName(company)
            });
        });
    });
    
    // Sort by date (newest first)
    allAudits.sort((a, b) => new Date(b.auditDate) - new Date(a.auditDate));
    
    // Set filtered audits to all audits initially
    filteredAudits = [...allAudits];
}

// Get company display name
function getCompanyDisplayName(company) {
    const names = {
        'carol': 'Carol',
        'grand-vision': 'Grand Vision',
        'sunglass-hut': 'SunglassHut'
    };
    return names[company] || company;
}

// Display audits in the list
function displayAudits() {
    const auditsList = document.getElementById('auditsList');
    if (!auditsList) return;
    
    // Clear existing content
    auditsList.innerHTML = '';
    
    if (filteredAudits.length === 0) {
        auditsList.innerHTML = `
            <div class="empty-audits">
                <p>Nenhuma auditoria encontrada.</p>
                <p>Faça upload de auditorias para vê-las aqui.</p>
            </div>
        `;
        return;
    }
    
    // Create audit items
    filteredAudits.forEach(audit => {
        const auditItem = createAuditItem(audit);
        auditsList.appendChild(auditItem);
    });
}

// Create individual audit item
function createAuditItem(audit) {
    const auditItem = document.createElement('div');
    auditItem.className = 'audit-item';
    auditItem.setAttribute('data-company', audit.company);
    auditItem.setAttribute('data-status', audit.status);
    auditItem.setAttribute('data-date', audit.auditDate);
    
    auditItem.innerHTML = `
        <div class="audit-header">
            <div class="audit-company">
                <span class="company-badge ${audit.company}">${audit.companyName}</span>
            </div>
            <div class="audit-date">${formatDate(audit.auditDate)}</div>
        </div>
        <div class="audit-content">
            <div class="audit-info">
                <div class="audit-filename">
                    <strong>${audit.filename}</strong>
                </div>
                <div class="audit-branch">
                    Filial: ${audit.branchNumber}${audit.ticketNumber ? ' | Chamado: ' + audit.ticketNumber : ''}
                </div>
                <div class="audit-description">
                    ${audit.description || 'Sem descrição'}
                </div>
            </div>
            <div class="audit-meta">
                <span class="audit-status ${audit.status}">${getStatusLabel(audit.status)}</span>
                <div class="audit-actions">
                    ${audit.fileContent ? `<button class="btn btn-sm btn-primary" onclick="viewFileDirectly('${audit.id}')" title="Visualizar arquivo">📄 Ver Arquivo</button>` : ''}
                    <button class="btn btn-sm btn-secondary" onclick="viewAuditDetails('${audit.id}')">Ver Detalhes</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAudit('${audit.id}')" title="Excluir auditoria">🗑️ Excluir</button>
                </div>
            </div>
        </div>
    `;
    
    return auditItem;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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

// Filter audits based on current filters
function filterAudits() {
    const brandFilter = document.getElementById('brandFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    filteredAudits = allAudits.filter(audit => {
        // Brand filter
        if (brandFilter !== 'all' && audit.company !== brandFilter) {
            return false;
        }
        
        // Status filter
        if (statusFilter !== 'all' && audit.status !== statusFilter) {
            return false;
        }
        
        // Date range filter
        if (dateFrom && new Date(audit.auditDate) < new Date(dateFrom)) {
            return false;
        }
        
        if (dateTo && new Date(audit.auditDate) > new Date(dateTo)) {
            return false;
        }
        
        return true;
    });
    
    // Display filtered audits
    displayAudits();
    
    // Update statistics
    updateStatistics();
}

// Clear all filters
function clearFilters() {
    document.getElementById('brandFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    
    // Reset to show all audits
    filteredAudits = [...allAudits];
    displayAudits();
    updateStatistics();
}

// Refresh audits
async function refreshAudits() {
    showNotification('Atualizando auditorias...', 'info');
    await loadAllAudits();
    filteredAudits = [...allAudits];
    displayAudits();
    updateStatistics();
    showNotification('Auditorias atualizadas!', 'success');
}

// Update statistics
function updateStatistics() {
    const totalAudits = filteredAudits.length;
    const aprovadas = filteredAudits.filter(a => a.status === 'aprovada').length;
    const aprovadasComAviso = filteredAudits.filter(a => a.status === 'aprovada-com-aviso').length;
    const reprovadas = filteredAudits.filter(a => a.status === 'reprovada').length;
    
    // Update display
    document.getElementById('totalAudits').textContent = totalAudits;
    document.getElementById('aprovadasCount').textContent = aprovadas;
    document.getElementById('aprovadasComAvisoCount').textContent = aprovadasComAviso;
    document.getElementById('reprovadasCount').textContent = reprovadas;
}

// Global variable to store current audit ID for modal actions
let currentAuditId = null;

// Global variable to store delete callback for password validation
let deletePasswordCallback = null;

// View audit details
function viewAuditDetails(auditId) {
    const audit = allAudits.find(a => a.id === auditId);
    if (!audit) return;
    
    // Store current audit ID for modal actions
    currentAuditId = auditId;
    
    // Populate modal with audit data
    document.getElementById('detailCompany').textContent = audit.companyName;
    document.getElementById('detailBranch').textContent = audit.branchNumber;
    document.getElementById('detailTicketNumber').textContent = audit.ticketNumber || 'N/A';
    document.getElementById('detailFilename').textContent = audit.filename;
    document.getElementById('detailUploadDate').textContent = formatDate(audit.uploadDate || new Date().toISOString().split('T')[0]);
    document.getElementById('detailAuditDate').textContent = formatDate(audit.auditDate);
    document.getElementById('detailStatus').textContent = getStatusLabel(audit.status);
    document.getElementById('detailDescription').textContent = audit.description || 'Sem descrição';
    
    // Add status class to status element for styling
    const statusElement = document.getElementById('detailStatus');
    statusElement.className = 'detail-value ' + audit.status;
    
    // Show modal
    const modal = document.getElementById('auditDetailsModal');
    modal.style.display = 'flex';
    
    // Focus on modal for accessibility
    setTimeout(() => {
        modal.focus();
    }, 100);
}

// Close audit details modal
function closeAuditDetailsModal() {
    const modal = document.getElementById('auditDetailsModal');
    modal.style.display = 'none';
    currentAuditId = null;
}

// View uploaded file from modal
function viewUploadedFile() {
    if (!currentAuditId) return;
    viewFileDirectly(currentAuditId);
}

// View file directly (can be called from anywhere)
function viewFileDirectly(auditId) {
    const audit = allAudits.find(a => a.id === auditId);
    if (!audit) {
        showNotification('Auditoria não encontrada.', 'error');
        return;
    }
    
    if (!audit.fileContent) {
        showNotification('Arquivo não disponível. Este pode ser um upload antigo.', 'warning');
        return;
    }
    
    // Open file in new window/tab
    const newWindow = window.open();
    if (!newWindow) {
        showNotification('Pop-up bloqueado. Por favor, permita pop-ups para visualizar o arquivo.', 'error');
        return;
    }
    
    // Handle different file types
    if (audit.fileType && audit.fileType.includes('pdf')) {
        // For PDFs, embed in an iframe
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${audit.filename}</title>
                <style>
                    body { margin: 0; padding: 0; }
                    iframe { width: 100%; height: 100vh; border: none; }
                </style>
            </head>
            <body>
                <iframe src="${audit.fileContent}" type="application/pdf"></iframe>
            </body>
            </html>
        `);
    } else {
        // For other file types, create a download link
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${audit.filename}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 20px; 
                        text-align: center; 
                        background-color: #f5f5f5;
                    }
                    .container {
                        max-width: 600px;
                        margin: 50px auto;
                        background: white;
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    h2 { color: #333; }
                    .btn {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .btn:hover {
                        background-color: #0056b3;
                    }
                    .file-info {
                        margin: 20px 0;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>📄 ${audit.filename}</h2>
                    <div class="file-info">
                        <p>Tipo: ${audit.fileType || 'Desconhecido'}</p>
                        <p>Data de Upload: ${formatDate(audit.uploadDate)}</p>
                    </div>
                    <a href="${audit.fileContent}" download="${audit.filename}" class="btn">⬇️ Download File</a>
                </div>
            </body>
            </html>
        `);
    }
}

// Delete audit from modal
function deleteAuditFromModal() {
    if (!currentAuditId) return;
    
    // Close audit details modal first
    closeAuditDetailsModal();
    
    // Require password for deletion
    showDeletePasswordModal(() => {
        proceedWithDeleteAudit(currentAuditId);
    });
}

// Initialize audit details modal
function initializeAuditDetailsModal() {
    const modal = document.getElementById('auditDetailsModal');
    const form = document.getElementById('auditDetailsForm');
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAuditDetailsModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeAuditDetailsModal();
        }
    });
}

// Delete Password Functions
function showDeletePasswordModal(callback) {
    deletePasswordCallback = callback;
    const modal = document.getElementById('deletePasswordModal');
    const form = document.getElementById('deletePasswordForm');
    
    // Clear form
    form.reset();
    
    // Show modal
    modal.style.display = 'flex';
    
    // Focus on password input
    setTimeout(() => {
        document.getElementById('deletePassword').focus();
    }, 100);
}

function closeDeletePasswordModal() {
    const modal = document.getElementById('deletePasswordModal');
    modal.style.display = 'none';
    deletePasswordCallback = null;
}

function toggleDeletePassword() {
    const passwordInput = document.getElementById('deletePassword');
    const toggleIcon = document.getElementById('deletePasswordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈';
        toggleIcon.setAttribute('aria-label', 'Ocultar senha');
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️';
        toggleIcon.setAttribute('aria-label', 'Mostrar senha');
    }
}

// Initialize delete password modal
function initializeDeletePasswordModal() {
    const form = document.getElementById('deletePasswordForm');
    const modal = document.getElementById('deletePasswordModal');
    
    if (form) {
        form.addEventListener('submit', handleDeletePasswordSubmit);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeDeletePasswordModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeDeletePasswordModal();
        }
    });
}

function handleDeletePasswordSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const password = formData.get('deletePassword');
    
    // Simple password validation - same password as uploads
    const correctPassword = 'audit2025';
    
    if (password === correctPassword) {
        // Correct password
        closeDeletePasswordModal();
        showNotification('Password accepted. Proceeding with deletion.', 'success');
        
        // Execute the callback function that was waiting for password validation
        if (deletePasswordCallback) {
            deletePasswordCallback();
        }
    } else {
        // Wrong password
        showNotification('Incorrect password. Please try again.', 'error');
        document.getElementById('deletePassword').value = '';
        document.getElementById('deletePassword').focus();
    }
}

// Delete audit (requires password)
function deleteAudit(auditId) {
    // Find the audit to get company info
    const audit = allAudits.find(a => a.id === auditId);
    if (!audit) {
        showNotification('Auditoria não encontrada.', 'error');
        return;
    }
    
    // Require password for deletion
    showDeletePasswordModal(() => {
        proceedWithDeleteAudit(auditId);
    });
}

// Separate function to handle the actual delete after password validation
function proceedWithDeleteAudit(auditId) {
    // Find the audit to get company info
    const audit = allAudits.find(a => a.id === auditId);
    if (!audit) {
        showNotification('Auditoria não encontrada.', 'error');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir esta auditoria?\n\nArquivo: ${audit.filename}\nEmpresa: ${audit.companyName}\nData: ${formatDate(audit.auditDate)}`)) {
        return;
    }
    
    // Remove from allAudits
    allAudits = allAudits.filter(a => a.id !== auditId);
    
    // Update localStorage
    const companies = ['carol', 'grand-vision', 'sunglass-hut'];
    companies.forEach(company => {
        const companyAudits = JSON.parse(localStorage.getItem(`${company}_audits`) || '[]');
        const updatedAudits = companyAudits.filter(a => a.id !== auditId);
        localStorage.setItem(`${company}_audits`, JSON.stringify(updatedAudits));
    });
    
    // Update lojas count for the specific company
    updateCompanyLojasCount(audit.company);
    
    // Refresh main page counts if possible
    if (window.parent && window.parent.refreshAllLojasCounts) {
        window.parent.refreshAllLojasCounts();
    }
    
    // Refresh display
    filteredAudits = [...allAudits];
    displayAudits();
    updateStatistics();
    
    showNotification(`Auditoria "${audit.filename}" excluída com sucesso!`, 'success');
}

// Update lojas count for a specific company
function updateCompanyLojasCount(companyName) {
    const lojasKey = `${companyName}_lojas`;
    const currentCount = parseInt(localStorage.getItem(lojasKey) || '0');
    const newCount = Math.max(0, currentCount - 1); // Don't go below 0
    
    localStorage.setItem(lojasKey, newCount.toString());
    
    console.log(`Updated ${companyName} lojas count: ${currentCount} -> ${newCount}`);
    
    // Update the main dashboard if possible
    if (window.parent && window.parent.updateCompanyLojas) {
        window.parent.updateCompanyLojas(companyName, newCount);
    }
}

// Delete all audits (requires password)
function deleteAllAudits() {
    if (allAudits.length === 0) {
        showNotification('Nenhuma auditoria para excluir.', 'info');
        return;
    }
    
    // Require password for deletion
    showDeletePasswordModal(() => {
        proceedWithDeleteAllAudits();
    });
}

// Separate function to handle the actual delete all after password validation
function proceedWithDeleteAllAudits() {
    const totalCount = allAudits.length;
    const companyBreakdown = {};
    
    // Count audits per company
    allAudits.forEach(audit => {
        companyBreakdown[audit.company] = (companyBreakdown[audit.company] || 0) + 1;
    });
    
    const breakdownText = Object.entries(companyBreakdown)
        .map(([company, count]) => `${getCompanyDisplayName(company)}: ${count}`)
        .join('\n');
    
    if (!confirm(`Tem certeza que deseja excluir TODAS as ${totalCount} auditorias?\n\n${breakdownText}\n\nEsta ação não pode ser desfeita!`)) {
        return;
    }
    
    // Clear all audits from localStorage
    const companies = ['carol', 'grand-vision', 'sunglass-hut'];
    companies.forEach(company => {
        localStorage.setItem(`${company}_audits`, '[]');
        localStorage.setItem(`${company}_lojas`, '0');
    });
    
    // Clear all audits from memory
    allAudits = [];
    filteredAudits = [];
    
    // Refresh main page counts if possible
    if (window.parent && window.parent.refreshAllLojasCounts) {
        window.parent.refreshAllLojasCounts();
    }
    
    // Refresh display
    displayAudits();
    updateStatistics();
    
    showNotification(`Todas as ${totalCount} auditorias foram excluídas!`, 'success');
}

// Go back to dashboard
function goBack() {
    window.location.href = 'index.html';
}

// Add loading animation
function addLoadingAnimation() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
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
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
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

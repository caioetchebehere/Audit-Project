// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize the pie chart
    initializePieChart();
    
    // Initialize API and load data
    await initializeData();
    
    // Add interactive features
    addCompanyCardInteractions();
    
    // Add news item interactions
    addNewsInteractions();
    
    // Initialize news modal
    initializeNewsModal();
    
    // Initialize admin login
    initializeAdminLogin();
    
    // Check admin status
    await checkAdminStatus();
    
    // Simulate real-time updates
    simulateRealTimeUpdates();
});

// Initialize the pie chart using Chart.js
function initializePieChart() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    const pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Reprovadas', 'Aprovadas com aviso', 'Aprovadas'],
            datasets: [{
                data: [0, 0, 0], // Start with empty data
                backgroundColor: [
                    '#FF6384', // Red for Reprovadas
                    '#FFCE56', // Yellow for Aprovadas com aviso
                    '#4BC0C0'  // Teal for Aprovadas
                ],
                borderColor: [
                    '#FF6384',
                    '#FFCE56',
                    '#4BC0C0'
                ],
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // We're using custom legend
                },
                tooltip: {
                    enabled: false // Disable tooltips when data is empty
                }
            },
            animation: {
                animateRotate: true,
                duration: 2000
            }
        }
    });
    
    // Store chart reference for updates
    window.pieChart = pieChart;
}

// Add interactive features to company cards
function addCompanyCardInteractions() {
    const companyCards = document.querySelectorAll('.company-card');
    
    companyCards.forEach(card => {
        // Add click event to show detailed view
        card.addEventListener('click', function() {
            const company = this.dataset.company;
            showCompanyDetails(company);
        });
        
        // Add hover effects for stats
        const stats = card.querySelectorAll('.stat');
        stats.forEach(stat => {
            stat.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.transition = 'transform 0.2s ease';
            });
            
            stat.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    });
}

// Navigate to company page
function showCompanyDetails(company) {
    const companyPages = {
        'carol': 'carol.html',
        'grand-vision': 'grand-vision.html',
        'sunglass-hut': 'sunglass-hut.html'
    };
    
    const page = companyPages[company];
    if (page) {
        window.location.href = page;
    }
}

// Navigate to backlog page
function goToBacklog() {
    window.location.href = 'backlog.html';
}


// Add interactions to news items
function addNewsInteractions() {
    const newsItems = document.querySelectorAll('.news-item');
    
    newsItems.forEach(item => {
        item.addEventListener('click', function() {
            const title = this.querySelector('.news-title').textContent;
            const summary = this.querySelector('.news-summary').textContent;
            const date = this.querySelector('.news-date').textContent;
            
            // Create a more detailed view
            showNewsDetails(title, summary, date);
        });
        
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
    });
}

// Show detailed news view
function showNewsDetails(title, summary, date) {
    const fullContent = getFullNewsContent(title);
    
    alert(`${title}\n\n` +
          `Date: ${date}\n\n` +
          `Summary: ${summary}\n\n` +
          `Full Content: ${fullContent}`);
}

// Get full news content based on title
function getFullNewsContent(title) {
    const newsContent = {
        'New Compliance Regulations Announced': 'The regulatory body has announced new compliance requirements that will take effect starting Q2 2024. All companies must review their current processes and implement necessary changes by March 31st, 2024. Training sessions will be provided for audit teams.',
        'Carol Audit Completed': 'The annual compliance audit for Carol has been successfully completed with an overall compliance score of 85%. While there are 12 issues identified, none are critical. The company has 30 days to address minor issues and 60 days for warnings.',
        'SunglassHut Action Items': 'During the recent audit of SunglassHut, 18 action items were identified requiring immediate attention. Five critical issues need to be resolved within 15 days, while 13 minor issues have a 45-day resolution timeline.',
        'Grand Vision Excellence Award': 'Grand Vision has been recognized with the Compliance Excellence Award for Q4 2023. The company achieved a 92% compliance score with only 7 minor issues identified. This marks the third consecutive quarter of outstanding performance.'
    };
    
    return newsContent[title] || 'Full content not available.';
}

// Simulate real-time updates
function simulateRealTimeUpdates() {
    // Update pie chart data every 30 seconds
    setInterval(updatePieChart, 30000);
    
    // Update company stats every 45 seconds
    setInterval(updateCompanyStats, 45000);
    
    // Note: Automatic news generation removed - only manual news will be shown
}

// Update pie chart with new data (now only updates from actual audit data)
function updatePieChart() {
    // This function now only updates from actual audit data, not random data
    updatePieChartFromAuditData();
}

// Update company stats
function updateCompanyStats() {
    const companyCards = document.querySelectorAll('.company-card');
    
    companyCards.forEach(card => {
        const company = card.dataset.company;
        const lojasValue = card.querySelector('.stat-value');
        
        if (lojasValue && company) {
            // Get stored count from localStorage
            const storedCount = parseInt(localStorage.getItem(`${company}_lojas`) || '0');
            const currentLojas = parseInt(lojasValue.textContent);
            
            // Update if stored count is different
            if (storedCount !== currentLojas) {
                animateValueChange(lojasValue, currentLojas, storedCount, '');
            }
        }
    });
}

// Update specific company Lojas count (called from company pages)
function updateCompanyLojas(company, newCount) {
    const companyCard = document.querySelector(`[data-company="${company}"]`);
    if (companyCard) {
        const lojasValue = companyCard.querySelector('.stat-value');
        if (lojasValue) {
            const currentLojas = parseInt(lojasValue.textContent);
            animateValueChange(lojasValue, currentLojas, newCount, '');
        }
    }
}

// Initialize data from API
async function initializeData() {
    try {
        // Load companies data
        await loadCompaniesData();
        
        // Load audit statistics
        await loadAuditStats();
        
        // Load news
        await loadNews();
        
        console.log('Data loaded successfully from API');
    } catch (error) {
        console.error('Failed to load data from API:', error);
        // Fallback to localStorage
        initializeLojasCounts();
    }
}

// Load companies data from API
async function loadCompaniesData() {
    try {
        const response = await window.auditAPI.getCompanies();
        const companies = response.companies;
        
        companies.forEach(company => {
            const companyCard = document.querySelector(`[data-company="${company.name}"]`);
            if (companyCard) {
                const lojasValue = companyCard.querySelector('.stat-value');
                if (lojasValue) {
                    lojasValue.textContent = company.total_audits || 0;
                }
            }
        });
    } catch (error) {
        console.error('Failed to load companies data:', error);
        throw error;
    }
}

// Load audit statistics from API
async function loadAuditStats() {
    try {
        const response = await window.auditAPI.getAuditStats();
        const stats = response.status_breakdown;
        
        // Update pie chart with real data
        if (window.pieChart && stats) {
            const reprovadas = stats.find(s => s.status === 'reprovada')?.count || 0;
            const aprovadasComAviso = stats.find(s => s.status === 'aprovada-com-aviso')?.count || 0;
            const aprovadas = stats.find(s => s.status === 'aprovada')?.count || 0;
            
            window.pieChart.data.datasets[0].data = [reprovadas, aprovadasComAviso, aprovadas];
            
            const totalAudits = reprovadas + aprovadasComAviso + aprovadas;
            window.pieChart.options.plugins.tooltip.enabled = totalAudits > 0;
            
            // Show/hide empty chart message
            const emptyMessage = document.getElementById('emptyChartMessage');
            if (emptyMessage) {
                emptyMessage.style.display = totalAudits > 0 ? 'none' : 'block';
            }
            
            window.pieChart.update('active');
        }
    } catch (error) {
        console.error('Failed to load audit stats:', error);
        throw error;
    }
}

// Load news from API
async function loadNews() {
    try {
        const response = await window.auditAPI.getNews({ limit: 10 });
        const news = response.news;
        
        const newsContent = document.querySelector('.news-content');
        if (!newsContent) return;
        
        // Clear existing news
        newsContent.innerHTML = '';
        
        if (news.length === 0) {
            showEmptyNewsState();
            return;
        }
        
        // Add news items
        news.forEach(newsItem => {
            addNewsItemToDOM(newsItem);
        });
    } catch (error) {
        console.error('Failed to load news:', error);
        throw error;
    }
}

// Add news item to DOM
function addNewsItemToDOM(newsItem) {
    const newsContent = document.querySelector('.news-content');
    const emptyNews = document.querySelector('.empty-news');
    
    // Remove empty state if it exists
    if (emptyNews) {
        emptyNews.remove();
    }
    
    const newsItemElement = document.createElement('div');
    newsItemElement.className = 'news-item';
    newsItemElement.setAttribute('data-news-id', newsItem.id);
    newsItemElement.innerHTML = `
        <div class="news-content-wrapper">
            <div class="news-date">${newsItem.news_date}</div>
            <div class="news-title">${newsItem.title}</div>
            <div class="news-summary">${newsItem.summary}</div>
        </div>
        <div class="news-actions">
            <button class="remove-news-btn" onclick="removeNewsItem(${newsItem.id})" title="Remover notícia">&times;</button>
        </div>
    `;
    
    // Add click event to content wrapper
    const contentWrapper = newsItemElement.querySelector('.news-content-wrapper');
    contentWrapper.addEventListener('click', function() {
        showNewsDetails(newsItem.title, newsItem.summary, newsItem.news_date);
    });
    
    // Insert at the top
    newsContent.insertBefore(newsItemElement, newsContent.firstChild);
    
    // Add fade-in animation
    newsItemElement.style.opacity = '0';
    newsItemElement.style.transform = 'translateY(-20px)';
    newsItemElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
        newsItemElement.style.opacity = '1';
        newsItemElement.style.transform = 'translateY(0)';
    }, 100);
}

// Initialize Lojas counts from localStorage (fallback)
function initializeLojasCounts() {
    const companies = ['carol', 'grand-vision', 'sunglass-hut'];
    
    companies.forEach(company => {
        // Reset all counts to zero
        localStorage.setItem(`${company}_lojas`, '0');
        const companyCard = document.querySelector(`[data-company="${company}"]`);
        
        if (companyCard) {
            const lojasValue = companyCard.querySelector('.stat-value');
            if (lojasValue) {
                lojasValue.textContent = '0';
            }
        }
    });
}

// Animate value changes
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

// Note: Automatic news generation function removed - only manual news will be shown

// Add new news manually (called by button)
function addNewNews() {
    // Admin access always granted - no login required
    
    const modal = document.getElementById('newsModal');
    const newsForm = document.getElementById('newsForm');
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('newsDate').value = today;
    
    // Clear form
    newsForm.reset();
    document.getElementById('newsDate').value = today;
    
    // Show modal
    modal.style.display = 'flex';
    
    // Focus on title input
    setTimeout(() => {
        document.getElementById('newsTitle').focus();
    }, 100);
}

// Close news modal
function closeNewsModal() {
    const modal = document.getElementById('newsModal');
    modal.style.display = 'none';
}

// Handle news form submission
async function handleNewsFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const title = formData.get('newsTitle');
    const summary = formData.get('newsSummary');
    const date = formData.get('newsDate');
    
    if (!title || !summary || !date) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    try {
        // Create news via API
        await window.auditAPI.createNews({
            title,
            summary,
            news_date: date
        });
        
        // Close modal
        closeNewsModal();
        
        // Reload news
        await loadNews();
        
        showNotification('Notícia adicionada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Failed to create news:', error);
        showNotification('Erro ao adicionar notícia. Tente novamente.', 'error');
    }
}

// Add news item to the list
function addNewsItem(title, summary, date) {
    const newsContent = document.querySelector('.news-content');
    const emptyNews = document.querySelector('.empty-news');
    
    // Remove empty state if it exists
    if (emptyNews) {
        emptyNews.remove();
    }
    
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    newsItem.innerHTML = `
        <div class="news-content-wrapper">
            <div class="news-date">${date}</div>
            <div class="news-title">${title}</div>
            <div class="news-summary">${summary}</div>
        </div>
        <div class="news-actions">
            <button class="remove-news-btn" onclick="removeNewsItem(this)" title="Remover notícia">&times;</button>
        </div>
    `;
    
    // Add click event to content wrapper (not the remove button)
    const contentWrapper = newsItem.querySelector('.news-content-wrapper');
    contentWrapper.addEventListener('click', function() {
        const title = this.querySelector('.news-title').textContent;
        const summary = this.querySelector('.news-summary').textContent;
        const date = this.querySelector('.news-date').textContent;
        showNewsDetails(title, summary, date);
    });
    
    // Insert at the top
    newsContent.insertBefore(newsItem, newsContent.firstChild);
    
    // Add fade-in animation
    newsItem.style.opacity = '0';
    newsItem.style.transform = 'translateY(-20px)';
    newsItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
        newsItem.style.opacity = '1';
        newsItem.style.transform = 'translateY(0)';
    }, 100);
}

// Remove news item
async function removeNewsItem(newsId) {
    // Admin access always granted - no login required
    
    try {
        // Delete via API
        await window.auditAPI.deleteNews(newsId);
        
        // Find and remove the news item from DOM
        const newsItem = document.querySelector(`[data-news-id="${newsId}"]`);
        if (newsItem) {
            const newsContent = document.querySelector('.news-content');
            
            // Add fade-out animation
            newsItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            newsItem.style.opacity = '0';
            newsItem.style.transform = 'translateX(100%)';
            
            // Remove item after animation
            setTimeout(() => {
                newsItem.remove();
                
                // Show empty state if no news items remain
                const remainingItems = newsContent.querySelectorAll('.news-item');
                if (remainingItems.length === 0) {
                    showEmptyNewsState();
                }
            }, 300);
        }
        
        showNotification('Notícia removida com sucesso!', 'success');
        
    } catch (error) {
        console.error('Failed to delete news:', error);
        showNotification('Erro ao remover notícia. Tente novamente.', 'error');
    }
}

// Show empty news state
function showEmptyNewsState() {
    const newsContent = document.querySelector('.news-content');
    const emptyNews = document.createElement('div');
    emptyNews.className = 'empty-news';
    
    emptyNews.innerHTML = `
        <p>Nenhuma notícia disponível no momento.</p>
        <button id="addNewsBtn" class="btn btn-primary" onclick="addNewNews()" style="display: block;">Adicionar Nova Notícia</button>
    `;
    
    newsContent.appendChild(emptyNews);
    
    // Add fade-in animation
    emptyNews.style.opacity = '0';
    emptyNews.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        emptyNews.style.opacity = '1';
    }, 100);
}

// Initialize news modal
function initializeNewsModal() {
    const newsForm = document.getElementById('newsForm');
    const modal = document.getElementById('newsModal');
    
    if (newsForm) {
        // Add form submit event listener
        newsForm.addEventListener('submit', handleNewsFormSubmit);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeNewsModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeNewsModal();
        }
    });
}

// Admin Login Functions
function initializeAdminLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginModal = document.getElementById('loginModal');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    
    // Clear form
    loginForm.reset();
    
    // Show modal
    modal.style.display = 'flex';
    
    // Focus on email input
    setTimeout(() => {
        document.getElementById('loginEmail').focus();
    }, 100);
    
    // Add keyboard support for password toggle
    const passwordToggle = document.querySelector('.password-toggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePassword();
            }
        });
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('loginEmail');
    const password = formData.get('loginPassword');
    
    try {
        // Attempt API login
        const response = await window.auditAPI.login(email, password);
        
        // Successful login
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        // Update UI
        updateAdminUI(true);
        
        // Close modal
        closeLoginModal();
        
        // Show success message
        showNotification('Login realizado com sucesso!', 'success');
        
        // Reload data
        await loadNews();
        await loadAuditStats();
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Credenciais inválidas. Tente novamente.', 'error');
    }
}

async function logout() {
    try {
        // API logout
        await window.auditAPI.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear admin session
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        
        // Update UI
        updateAdminUI(false);
        
        // Show logout message
        showNotification('Logout realizado com sucesso!', 'info');
    }
}

async function checkAdminStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginTime = localStorage.getItem('adminLoginTime');
    
    // Check if session is still valid (24 hours)
    if (isLoggedIn && loginTime) {
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const currentTime = Date.now();
        
        if (currentTime - parseInt(loginTime) > sessionDuration) {
            // Session expired
            await logout();
            return;
        }
        
        // Verify token with API
        try {
            const verification = await window.auditAPI.verifyToken();
            if (!verification.valid) {
                await logout();
                return;
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            await logout();
            return;
        }
    }
    
    updateAdminUI(isLoggedIn);
}

function updateAdminUI(isAdmin) {
    const loginBtn = document.getElementById('adminLoginBtn');
    const logoutBtn = document.getElementById('adminLogoutBtn');
    const addNewsBtn = document.getElementById('addNewsBtn');
    const loginToAddBtn = document.getElementById('loginToAddBtn');
    
    if (isAdmin) {
        // Show admin controls
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (addNewsBtn) addNewsBtn.style.display = 'block';
        if (loginToAddBtn) loginToAddBtn.style.display = 'none';
    } else {
        // Hide admin controls
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (addNewsBtn) addNewsBtn.style.display = 'none';
        if (loginToAddBtn) loginToAddBtn.style.display = 'block';
    }
}

function isAdminLoggedIn() {
    return true; // Always return true to bypass login requirement
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('loginPassword');
    const toggleIcon = document.getElementById('passwordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈'; // Hide icon
        toggleIcon.setAttribute('aria-label', 'Ocultar senha');
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️'; // Show icon
        toggleIcon.setAttribute('aria-label', 'Mostrar senha');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
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
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
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

// Function to update pie chart based on actual audit status data
function updatePieChartFromAuditData() {
    if (window.pieChart) {
        // Count audit statuses from localStorage or calculate from current data
        const auditData = getAuditStatusCounts();
        
        window.pieChart.data.datasets[0].data = [
            auditData.reprovadas,
            auditData.aprovadasComAviso,
            auditData.aprovadas
        ];
        
        // Enable/disable tooltips based on whether there's data
        const totalAudits = auditData.reprovadas + auditData.aprovadasComAviso + auditData.aprovadas;
        window.pieChart.options.plugins.tooltip.enabled = totalAudits > 0;
        
        // Show/hide empty chart message
        const emptyMessage = document.getElementById('emptyChartMessage');
        if (emptyMessage) {
            emptyMessage.style.display = totalAudits > 0 ? 'none' : 'block';
        }
        
        // Update tooltip callbacks if there's data
        if (totalAudits > 0) {
            window.pieChart.options.plugins.tooltip.callbacks = {
                label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} (${percentage}%)`;
                }
            };
        }
        
        window.pieChart.update('active');
    }
}

// Function to get audit status counts (can be extended to read from actual data)
function getAuditStatusCounts() {
    // Always start with empty counts - data will be added as audits are uploaded
    localStorage.setItem('auditStatusData', JSON.stringify({
        reprovadas: 0,
        aprovadasComAviso: 0,
        aprovadas: 0
    }));
    
    return {
        reprovadas: 0,
        aprovadasComAviso: 0,
        aprovadas: 0
    };
}

// Function to add audit status to tracking (called when new uploads are made)
function addAuditStatus(status) {
    // Store in localStorage for persistence, start with empty data if none exists
    const currentData = JSON.parse(localStorage.getItem('auditStatusData') || '{"reprovadas": 0, "aprovadasComAviso": 0, "aprovadas": 0}');
    
    switch(status) {
        case 'reprovada':
            currentData.reprovadas++;
            break;
        case 'aprovada-com-aviso':
            currentData.aprovadasComAviso++;
            break;
        case 'aprovada':
            currentData.aprovadas++;
            break;
    }
    
    localStorage.setItem('auditStatusData', JSON.stringify(currentData));
    updatePieChartFromAuditData();
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Press 'R' to refresh data
    if (e.key === 'r' || e.key === 'R') {
        updatePieChartFromAuditData();
        updateCompanyStats();
    }
    
    // Note: 'N' key shortcut for automatic news removed - use admin login to add news manually
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

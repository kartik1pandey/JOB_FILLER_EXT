// Simple Storage Manager for Popup
class StorageManager {
    constructor() {
        this.userData = null;
        this.init();
    }

    async init() {
        await this.loadUserData();
    }

    async loadUserData() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['userData'], (result) => {
                this.userData = result.userData || this.getDefaultUserData();
                resolve(this.userData);
            });
        });
    }

    getDefaultUserData() {
        return {
            personalInfo: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                location: '',
                portfolio: '',
                linkedin: '',
                summary: ''
            },
            workExperience: [],
            education: [],
            skills: [],
            projects: [],
            resumeText: '',
            applicationHistory: [],
            settings: {
                autoExtract: true,
                showSuggestions: true,
                saveJobDescriptions: true
            }
        };
    }

    async saveUserData() {
        return new Promise((resolve) => {
            chrome.storage.local.set({ userData: this.userData }, () => {
                resolve();
            });
        });
    }

    async updatePersonalInfo(info) {
        this.userData.personalInfo = { ...this.userData.personalInfo, ...info };
        await this.saveUserData();
    }

    async addToApplicationHistory(application) {
        this.userData.applicationHistory.unshift({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...application
        });
        await this.saveUserData();
    }

    async updateSettings(settings) {
        this.userData.settings = { ...this.userData.settings, ...settings };
        await this.saveUserData();
    }

    async clearApplicationHistory() {
        this.userData.applicationHistory = [];
        await this.saveUserData();
    }

    async exportData() {
        return JSON.stringify(this.userData, null, 2);
    }

    async importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.userData = data;
            await this.saveUserData();
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}

// Popup Manager
class PopupManager {
    constructor() {
        this.storage = new StorageManager();
        this.currentTab = null;
        this.init();
    }

    async init() {
        try {
            await this.storage.init();
            await this.getCurrentTab();
            this.setupEventListeners();
            this.loadUserData();
            this.updateUI();
            console.log('PopupManager initialized successfully');
        } catch (error) {
            console.error('Error initializing PopupManager:', error);
        }
    }

    async getCurrentTab() {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                this.currentTab = tabs[0];
                resolve(tabs[0]);
            });
        });
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Quick Actions
        document.getElementById('extractJD').addEventListener('click', () => {
            this.extractJobDescription();
        });

        document.getElementById('autoFill').addEventListener('click', () => {
            this.autoFillForm();
        });

        document.getElementById('viewResume').addEventListener('click', () => {
            this.openResumeEditor();
        });

        // Personal Info
        document.getElementById('editPersonalInfo').addEventListener('click', () => {
            this.openPersonalInfoModal();
        });

        // Data Management
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportUserData();
        });

        document.getElementById('importData').addEventListener('click', () => {
            this.importUserData();
        });

        // Settings
        document.getElementById('autoExtract').addEventListener('change', (e) => {
            this.updateSettings({ autoExtract: e.target.checked });
        });

        document.getElementById('showSuggestions').addEventListener('change', (e) => {
            this.updateSettings({ showSuggestions: e.target.checked });
        });

        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearApplicationHistory();
        });

        // Modal Events
        this.setupModalEvents();
        
        console.log('Event listeners setup complete');
    }

    setupModalEvents() {
        const modal = document.getElementById('personalInfoModal');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('cancelPersonalInfo');
        const saveBtn = document.getElementById('savePersonalInfo');

        // Close modal functions
        const closeModal = () => {
            modal.style.display = 'none';
        };

        closeBtn.onclick = closeModal;
        cancelBtn.onclick = closeModal;

        // Save personal info
        saveBtn.onclick = () => {
            this.savePersonalInfo();
        };

        // Close when clicking outside
        window.onclick = (event) => {
            if (event.target === modal) {
                closeModal();
            }
        };
    }

    loadUserData() {
        const userData = this.storage.userData;
        console.log('Loading user data:', userData);
        
        // Update personal info display
        const name = `${userData.personalInfo.firstName} ${userData.personalInfo.lastName}`.trim();
        document.getElementById('displayName').textContent = name || 'Not set';
        document.getElementById('displayEmail').textContent = userData.personalInfo.email || 'Not set';
        
        // Update modal fields
        document.getElementById('modalFirstName').value = userData.personalInfo.firstName || '';
        document.getElementById('modalLastName').value = userData.personalInfo.lastName || '';
        document.getElementById('modalEmail').value = userData.personalInfo.email || '';
        document.getElementById('modalPhone').value = userData.personalInfo.phone || '';
        document.getElementById('modalLocation').value = userData.personalInfo.location || '';
        document.getElementById('modalPortfolio').value = userData.personalInfo.portfolio || '';
        document.getElementById('modalLinkedin').value = userData.personalInfo.linkedin || '';
        
        // Update settings
        document.getElementById('autoExtract').checked = userData.settings.autoExtract;
        document.getElementById('showSuggestions').checked = userData.settings.showSuggestions;
        
        // Enable/disable auto-fill button based on data completeness
        const autoFillBtn = document.getElementById('autoFill');
        if (userData.personalInfo.firstName && userData.personalInfo.email) {
            autoFillBtn.disabled = false;
            autoFillBtn.style.opacity = '1';
            autoFillBtn.style.cursor = 'pointer';
        } else {
            autoFillBtn.disabled = true;
            autoFillBtn.style.opacity = '0.5';
            autoFillBtn.style.cursor = 'not-allowed';
        }
        
        // Update stats
        document.getElementById('workExpCount').textContent = userData.workExperience.length;
        document.getElementById('educationCount').textContent = userData.education.length;
        document.getElementById('applicationsCount').textContent = userData.applicationHistory.length;
        
        // Calculate completeness
        this.updateCompleteness();
        
        // Load recent applications
        this.loadRecentApplications();
    }

    updateCompleteness() {
        const userData = this.storage.userData;
        let completed = 0;
        let total = 0;
        
        // Personal info
        const requiredFields = ['firstName', 'lastName', 'email'];
        total += requiredFields.length;
        completed += requiredFields.filter(field => userData.personalInfo[field]).length;
        
        const percentage = Math.round((completed / total) * 100);
        document.getElementById('dataCompleteness').textContent = `${percentage}% complete`;
    }

    loadRecentApplications() {
        const applications = this.storage.userData.applicationHistory.slice(0, 3);
        const container = document.getElementById('recentApplicationsList');
        const section = document.getElementById('recentAppsSection');
        
        if (applications.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        container.innerHTML = '';
        
        applications.forEach(app => {
            const appElement = document.createElement('div');
            appElement.className = 'application-item';
            
            const badgeClass = app.source === 'auto_filled' ? 'filled' : 'extracted';
            const badgeText = app.source === 'auto_filled' ? 'Filled' : 'Saved';
            
            appElement.innerHTML = `
                <div class="application-header">
                    <div class="application-title">${app.jobTitle || 'Unknown Position'}</div>
                    <span class="application-badge">${badgeText}</span>
                </div>
                <div class="application-url">${this.truncateUrl(app.url)}</div>
                <div class="application-meta">
                    <span class="application-date">
                        <span>🕐</span>
                        ${this.formatDate(app.timestamp)}
                    </span>
                </div>
            `;
            appElement.addEventListener('click', () => {
                chrome.tabs.create({ url: app.url });
            });
            container.appendChild(appElement);
        });
    }

    truncateUrl(url) {
        if (!url) return 'No URL';
        try {
            const urlObj = new URL(url);
            return urlObj.hostname + (urlObj.pathname.length > 20 ? urlObj.pathname.substring(0, 20) + '...' : urlObj.pathname);
        } catch {
            return url.substring(0, 30) + '...';
        }
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Unknown date';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 86400000) {
            return 'Today';
        } else if (diff < 172800000) {
            return 'Yesterday';
        } else {
            return `${Math.floor(diff / 86400000)} days ago`;
        }
    }

    async extractJobDescription() {
        this.showStatus('Extracting job description...', 'loading');
        
        if (!this.currentTab) {
            this.showStatus('No active tab found', 'error');
            return;
        }
        
        try {
            // Ensure content script is loaded
            await this.ensureContentScript();
            
            // Send message to content script
            const response = await chrome.tabs.sendMessage(this.currentTab.id, { 
                action: 'extractJobDescription' 
            });
            
            if (response && response.success && response.jobDescription) {
                const jobDescription = response.jobDescription;
                
                // Save to application history
                await this.storage.addToApplicationHistory({
                    jobDescription: jobDescription,
                    url: this.currentTab.url,
                    jobTitle: this.extractJobTitle(),
                    source: 'manual_extraction'
                });
                
                this.showStatus('Job description extracted and saved!', 'success');
                this.loadRecentApplications();
                this.loadUserData();
            } else {
                this.showStatus('No job description found on this page', 'error');
            }
        } catch (error) {
            console.error('Error extracting job description:', error);
            this.showStatus('Error: Make sure you are on a job posting page', 'error');
        }
    }

    extractJobTitle() {
        if (!this.currentTab) return 'Unknown Position';
        const title = this.currentTab.title;
        const patterns = [
            /(.*?) - (?:LinkedIn|Indeed|Glassdoor)/,
            /(.*?) \|/,
            /(.*?) at .*? \|/
        ];
        
        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match) return match[1].trim();
        }
        
        return title;
    }

    async autoFillForm() {
        this.showStatus('Auto-filling form...', 'loading');
        
        if (!this.currentTab) {
            this.showStatus('No active tab found', 'error');
            return;
        }

        // Check if user data is complete enough
        const userData = this.storage.userData;
        if (!userData.personalInfo.firstName || !userData.personalInfo.email) {
            this.showStatus('Please complete your personal info first', 'error');
            setTimeout(() => {
                this.openPersonalInfoModal();
            }, 1500);
            return;
        }
        
        try {
            // Ensure content script is loaded
            await this.ensureContentScript();
            
            // Send message to content script to auto-fill
            const response = await chrome.tabs.sendMessage(this.currentTab.id, { 
                action: 'autoFillForm' 
            });
            
            if (response && response.success) {
                this.showStatus('Form auto-filled successfully! ✓', 'success');
                
                // Save this application to history
                await this.storage.addToApplicationHistory({
                    url: this.currentTab.url,
                    jobTitle: this.extractJobTitle(),
                    source: 'auto_filled',
                    status: 'filled'
                });
                
                this.loadRecentApplications();
                this.loadUserData();
            } else {
                this.showStatus('No fillable fields found on this page', 'error');
            }
        } catch (error) {
            console.error('Error auto-filling form:', error);
            // Try to inject content script if it failed
            try {
                await this.injectContentScript();
                this.showStatus('Please try again - content script loaded', 'info');
            } catch (injectError) {
                this.showStatus('Error: Cannot access this page. Try a different site.', 'error');
            }
        }
    }

    async ensureContentScript() {
        // Try to ping the content script
        try {
            const response = await chrome.tabs.sendMessage(this.currentTab.id, { action: 'ping' });
            if (response) return true;
        } catch (error) {
            // Content script not loaded, inject it
            await this.injectContentScript();
        }
    }

    async injectContentScript() {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                files: ['content/content-autofill.js']
            });
            console.log('Content script injected successfully');
            // Wait a bit for it to initialize
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Failed to inject content script:', error);
            throw error;
        }
    }

    openResumeEditor() {
        chrome.tabs.create({ url: chrome.runtime.getURL('resume-editor/resume-editor.html') });
    }

    openPersonalInfoModal() {
        document.getElementById('personalInfoModal').style.display = 'block';
    }

    async savePersonalInfo() {
        const personalInfo = {
            firstName: document.getElementById('modalFirstName').value.trim(),
            lastName: document.getElementById('modalLastName').value.trim(),
            email: document.getElementById('modalEmail').value.trim(),
            phone: document.getElementById('modalPhone').value.trim(),
            location: document.getElementById('modalLocation').value.trim(),
            portfolio: document.getElementById('modalPortfolio').value.trim(),
            linkedin: document.getElementById('modalLinkedin').value.trim()
        };
        
        // Basic validation
        if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email) {
            this.showStatus('Please fill in required fields (name and email)', 'error');
            return;
        }
        
        if (personalInfo.email && !this.isValidEmail(personalInfo.email)) {
            this.showStatus('Please enter a valid email address', 'error');
            return;
        }
        
        try {
            await this.storage.updatePersonalInfo(personalInfo);
            this.loadUserData();
            document.getElementById('personalInfoModal').style.display = 'none';
            this.showStatus('Personal information saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving personal info:', error);
            this.showStatus('Error saving personal information', 'error');
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async exportUserData() {
        try {
            const data = await this.storage.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `job-application-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showStatus('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showStatus('Error exporting data', 'error');
        }
    }

    async importUserData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const text = await this.readFileAsText(file);
                    const success = await this.storage.importData(text);
                    
                    if (success) {
                        await this.storage.loadUserData();
                        this.loadUserData();
                        this.showStatus('Data imported successfully!', 'success');
                    } else {
                        this.showStatus('Error importing data - invalid file format', 'error');
                    }
                } catch (error) {
                    console.error('Error reading file:', error);
                    this.showStatus('Error reading file', 'error');
                }
            }
        };
        
        input.click();
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        });
    }

    async updateSettings(settings) {
        try {
            await this.storage.updateSettings(settings);
            this.showStatus('Settings updated', 'success');
        } catch (error) {
            console.error('Error updating settings:', error);
            this.showStatus('Error updating settings', 'error');
        }
    }

    async clearApplicationHistory() {
        if (confirm('Are you sure you want to clear all application history? This cannot be undone.')) {
            try {
                await this.storage.clearApplicationHistory();
                this.loadUserData();
                this.showStatus('Application history cleared', 'success');
            } catch (error) {
                console.error('Error clearing history:', error);
                this.showStatus('Error clearing history', 'error');
            }
        }
    }

    updateUI() {
        console.log('UI updated');
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('status');
        if (!statusElement) {
            console.log('Status:', message);
            return;
        }
        
        statusElement.textContent = message;
        
        // Reset classes and set new type
        statusElement.className = 'status';
        if (type === 'success') statusElement.style.color = '#48bb78';
        else if (type === 'error') statusElement.style.color = '#f56565';
        else if (type === 'loading') statusElement.style.color = '#ed8936';
        else statusElement.style.color = 'rgba(255, 255, 255, 0.9)';
        
        // Clear status after 3 seconds
        setTimeout(() => {
            if (statusElement) {
                statusElement.textContent = 'Ready';
                statusElement.style.color = 'rgba(255, 255, 255, 0.9)';
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing PopupManager...');
    new PopupManager();
});
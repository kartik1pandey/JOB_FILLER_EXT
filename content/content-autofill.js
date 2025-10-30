// Enhanced Content Script with Auto-Fill Capabilities
console.log('Job Application Assistant with Auto-Fill loaded');

class FormAutoFiller {
  constructor() {
    this.userData = null;
    this.init();
  }

  async init() {
    await this.loadUserData();
    this.setupMessageListener();
    this.highlightFillableFields();
  }

  async loadUserData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userData'], (result) => {
        this.userData = result.userData;
        resolve();
      });
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Content script received message:', request);
      
      switch (request.action) {
        case 'ping':
          sendResponse({ success: true, status: 'ready' });
          break;
          
        case 'extractJobDescription':
          const jobDescription = this.extractJobDescription();
          sendResponse({ success: true, jobDescription });
          break;
          
        case 'autoFillForm':
          const fieldsCount = this.autoFillForm();
          sendResponse({ success: true, fieldsCount });
          break;
          
        case 'highlightFields':
          this.highlightFillableFields();
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
      
      return true;
    });
  }

  extractJobDescription() {
    console.log('Extracting job description from page...');
    
    // Platform-specific selectors
    const selectors = {
      linkedin: [
        '.description__text',
        '.show-more-less-html__markup',
        '.jobs-description__content',
        '.jobs-box__html-content'
      ],
      indeed: [
        '.jobDescriptionText',
        '#jobDescriptionText',
        '.jobsearch-jobDescriptionText'
      ],
      greenhouse: [
        '#content',
        '.body-text',
        '.job-post-content'
      ],
      lever: [
        '.section-wrapper',
        '.section.page-centered'
      ],
      workday: [
        '[data-automation-id="jobPostingDescription"]'
      ],
      generic: [
        '.job-description',
        '#job-description',
        '[class*="description"]',
        '[class*="jobDescription"]',
        '[class*="job-details"]'
      ]
    };

    // Try platform-specific selectors first
    for (const platform in selectors) {
      for (const selector of selectors[platform]) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.innerText || element.textContent;
          if (text && text.length > 200) {
            console.log(`Found job description with ${platform} selector:`, selector);
            return this.cleanText(text);
          }
        }
      }
    }

    console.log('No specific job description found, trying fallback...');
    
    // Fallback: look for large text blocks
    const allElements = document.querySelectorAll('div, section, article');
    let largestText = '';
    
    for (const element of allElements) {
      const text = (element.innerText || element.textContent).trim();
      if (text.length > largestText.length && text.length > 200) {
        // Make sure it's not navigation or footer
        const className = element.className.toLowerCase();
        if (!className.includes('nav') && !className.includes('footer') && !className.includes('header')) {
          largestText = text;
        }
      }
    }

    return this.cleanText(largestText);
  }

  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  }

  async autoFillForm() {
    console.log('Auto-filling form...');
    
    if (!this.userData) {
      await this.loadUserData();
    }

    if (!this.userData) {
      console.error('No user data available');
      return;
    }

    const fields = this.findFormFields();
    let filledCount = 0;

    // Fill personal info fields
    filledCount += this.fillField(fields.firstName, this.userData.personalInfo.firstName);
    filledCount += this.fillField(fields.lastName, this.userData.personalInfo.lastName);
    filledCount += this.fillField(fields.fullName, `${this.userData.personalInfo.firstName} ${this.userData.personalInfo.lastName}`);
    filledCount += this.fillField(fields.email, this.userData.personalInfo.email);
    filledCount += this.fillField(fields.phone, this.userData.personalInfo.phone);
    filledCount += this.fillField(fields.location, this.userData.personalInfo.location);
    filledCount += this.fillField(fields.portfolio, this.userData.personalInfo.portfolio);
    filledCount += this.fillField(fields.linkedin, this.userData.personalInfo.linkedin);

    // Fill resume/cover letter if found
    if (this.userData.personalInfo.summary) {
      filledCount += this.fillField(fields.coverLetter, this.userData.personalInfo.summary);
      filledCount += this.fillField(fields.summary, this.userData.personalInfo.summary);
    }

    console.log(`Auto-filled ${filledCount} fields`);
    
    // Show visual feedback
    this.showFillNotification(`Successfully filled ${filledCount} fields!`);
    
    return filledCount;
  }

  findFormFields() {
    const fields = {
      firstName: null,
      lastName: null,
      fullName: null,
      email: null,
      phone: null,
      location: null,
      portfolio: null,
      linkedin: null,
      coverLetter: null,
      summary: null
    };

    // Get all input, textarea, and select elements
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      const name = (input.name || '').toLowerCase();
      const id = (input.id || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      const label = this.getFieldLabel(input);
      const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
      
      const combinedText = `${name} ${id} ${placeholder} ${label} ${ariaLabel}`;

      // First Name
      if (!fields.firstName && this.matchesPattern(combinedText, ['first', 'fname', 'firstname', 'given'])) {
        if (input.type !== 'hidden') fields.firstName = input;
      }

      // Last Name
      if (!fields.lastName && this.matchesPattern(combinedText, ['last', 'lname', 'lastname', 'surname', 'family'])) {
        if (input.type !== 'hidden') fields.lastName = input;
      }

      // Full Name
      if (!fields.fullName && this.matchesPattern(combinedText, ['fullname', 'full name', 'name']) && 
          !combinedText.includes('first') && !combinedText.includes('last')) {
        if (input.type !== 'hidden') fields.fullName = input;
      }

      // Email
      if (!fields.email && (input.type === 'email' || this.matchesPattern(combinedText, ['email', 'e-mail']))) {
        fields.email = input;
      }

      // Phone
      if (!fields.phone && (input.type === 'tel' || this.matchesPattern(combinedText, ['phone', 'mobile', 'telephone', 'contact']))) {
        fields.phone = input;
      }

      // Location
      if (!fields.location && this.matchesPattern(combinedText, ['location', 'city', 'address', 'where'])) {
        if (input.type !== 'hidden') fields.location = input;
      }

      // Portfolio
      if (!fields.portfolio && this.matchesPattern(combinedText, ['portfolio', 'website', 'personal site'])) {
        fields.portfolio = input;
      }

      // LinkedIn
      if (!fields.linkedin && this.matchesPattern(combinedText, ['linkedin', 'profile url'])) {
        fields.linkedin = input;
      }

      // Cover Letter
      if (!fields.coverLetter && input.tagName === 'TEXTAREA' && 
          this.matchesPattern(combinedText, ['cover', 'letter', 'why', 'interest', 'message'])) {
        fields.coverLetter = input;
      }

      // Summary
      if (!fields.summary && input.tagName === 'TEXTAREA' && 
          this.matchesPattern(combinedText, ['summary', 'about', 'bio', 'yourself'])) {
        fields.summary = input;
      }
    });

    return fields;
  }

  matchesPattern(text, patterns) {
    return patterns.some(pattern => text.includes(pattern));
  }

  getFieldLabel(input) {
    // Try to find label by 'for' attribute
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent.toLowerCase();
    }

    // Try to find parent label
    let parent = input.parentElement;
    while (parent) {
      if (parent.tagName === 'LABEL') {
        return parent.textContent.toLowerCase();
      }
      parent = parent.parentElement;
    }

    return '';
  }

  fillField(field, value) {
    if (!field || !value) return 0;

    try {
      // Set value
      field.value = value;
      
      // Trigger events to ensure the form recognizes the change
      const events = ['input', 'change', 'blur'];
      events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        field.dispatchEvent(event);
      });

      // Add visual feedback
      this.addFieldHighlight(field, 'success');
      
      return 1;
    } catch (error) {
      console.error('Error filling field:', error);
      return 0;
    }
  }

  highlightFillableFields() {
    const fields = this.findFormFields();
    let count = 0;

    Object.values(fields).forEach(field => {
      if (field) {
        this.addFieldHighlight(field, 'available');
        count++;
      }
    });

    if (count > 0) {
      console.log(`Highlighted ${count} fillable fields`);
    }
  }

  addFieldHighlight(field, type) {
    // Remove existing highlights
    field.style.transition = 'all 0.3s ease';
    
    if (type === 'success') {
      field.style.backgroundColor = '#c6f6d5';
      field.style.borderColor = '#48bb78';
      setTimeout(() => {
        field.style.backgroundColor = '';
        field.style.borderColor = '';
      }, 2000);
    } else if (type === 'available') {
      field.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.3)';
      setTimeout(() => {
        field.style.boxShadow = '';
      }, 3000);
    }
  }

  showFillNotification(message) {
    // Remove existing notification if any
    const existing = document.getElementById('autofill-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'autofill-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize the auto-filler
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FormAutoFiller();
  });
} else {
  new FormAutoFiller();
}
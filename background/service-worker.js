// Background service worker for Job Application Assistant
console.log('Job Application Assistant service worker loaded');

// Initialize storage on install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Job Application Assistant installed:', details.reason);
  
  if (details.reason === 'install') {
    initializeStorage();
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html') // You can create this later
    });
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

// Initialize default storage structure
function initializeStorage() {
  chrome.storage.local.get(['userData'], (result) => {
    if (!result.userData) {
      const defaultData = {
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
      
      chrome.storage.local.set({ userData: defaultData }, () => {
        console.log('Default user data initialized');
      });
    } else {
      console.log('User data already exists');
    }
  });
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'openResumeEditor':
      openResumeEditor();
      sendResponse({ success: true });
      break;
      
    case 'getTabInfo':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        sendResponse({ tab: tabs[0] });
      });
      return true; // Keep message channel open
      
    case 'saveData':
      chrome.storage.local.set({ userData: request.data }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'getData':
      chrome.storage.local.get(['userData'], (result) => {
        sendResponse({ success: true, data: result.userData });
      });
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true;
});

// Open resume editor in new tab
function openResumeEditor() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('resume-editor/resume-editor.html')
  });
}

// Handle extension icon click (optional - already handled by popup)
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked on tab:', tab.id);
});

// Listen for tab updates to potentially auto-extract job descriptions
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Check if auto-extract is enabled
    chrome.storage.local.get(['userData'], (result) => {
      if (result.userData && result.userData.settings.autoExtract) {
        // Check if URL looks like a job posting
        if (isJobPostingUrl(tab.url)) {
          console.log('Potential job posting detected:', tab.url);
          // You could trigger extraction here
        }
      }
    });
  }
});

// Helper function to detect job posting URLs
function isJobPostingUrl(url) {
  if (!url) return false;
  
  const jobSitePatterns = [
    /linkedin\.com\/jobs/,
    /indeed\.com\/viewjob/,
    /glassdoor\.com\/job/,
    /greenhouse\.io/,
    /lever\.co/,
    /myworkdayjobs\.com/,
    /jobs\./,
    /careers\./,
    /apply\./
  ];
  
  return jobSitePatterns.some(pattern => pattern.test(url));
}

// Handle storage changes (optional - for sync across windows)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.userData) {
    console.log('User data updated');
  }
});

// Keep service worker alive (optional)
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, service worker active');
});

console.log('Service worker setup complete');
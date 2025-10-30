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
        linkedin: ''
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

  // Personal Info Methods
  async updatePersonalInfo(info) {
    this.userData.personalInfo = { ...this.userData.personalInfo, ...info };
    await this.saveUserData();
  }

  // Work Experience Methods
  async addWorkExperience(experience) {
    experience.id = Date.now().toString();
    this.userData.workExperience.push(experience);
    await this.saveUserData();
    return experience.id;
  }

  async updateWorkExperience(id, updates) {
    const index = this.userData.workExperience.findIndex(exp => exp.id === id);
    if (index !== -1) {
      this.userData.workExperience[index] = { ...this.userData.workExperience[index], ...updates };
      await this.saveUserData();
    }
  }

  async deleteWorkExperience(id) {
    this.userData.workExperience = this.userData.workExperience.filter(exp => exp.id !== id);
    await this.saveUserData();
  }

  // Education Methods
  async addEducation(education) {
    education.id = Date.now().toString();
    this.userData.education.push(education);
    await this.saveUserData();
    return education.id;
  }

  async updateEducation(id, updates) {
    const index = this.userData.education.findIndex(edu => edu.id === id);
    if (index !== -1) {
      this.userData.education[index] = { ...this.userData.education[index], ...updates };
      await this.saveUserData();
    }
  }

  async deleteEducation(id) {
    this.userData.education = this.userData.education.filter(edu => edu.id !== id);
    await this.saveUserData();
  }

  // Skills Methods
  async updateSkills(skills) {
    this.userData.skills = skills;
    await this.saveUserData();
  }

  // Projects Methods
  async addProject(project) {
    project.id = Date.now().toString();
    this.userData.projects.push(project);
    await this.saveUserData();
    return project.id;
  }

  async updateProject(id, updates) {
    const index = this.userData.projects.findIndex(proj => proj.id === id);
    if (index !== -1) {
      this.userData.projects[index] = { ...this.userData.projects[index], ...updates };
      await this.saveUserData();
    }
  }

  async deleteProject(id) {
    this.userData.projects = this.userData.projects.filter(proj => proj.id !== id);
    await this.saveUserData();
  }

  // Resume Text
  async saveResumeText(text) {
    this.userData.resumeText = text;
    await this.saveUserData();
  }

  // Application History
  async addToApplicationHistory(application) {
    this.userData.applicationHistory.unshift({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...application
    });
    // Keep only last 50 applications
    if (this.userData.applicationHistory.length > 50) {
      this.userData.applicationHistory = this.userData.applicationHistory.slice(0, 50);
    }
    await this.saveUserData();
  }

  async clearApplicationHistory() {
    this.userData.applicationHistory = [];
    await this.saveUserData();
  }

  // Settings
  async updateSettings(settings) {
    this.userData.settings = { ...this.userData.settings, ...settings };
    await this.saveUserData();
  }

  // Data Management
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

  async clearAllData() {
    this.userData = this.getDefaultUserData();
    await this.saveUserData();
  }

  // Getters for specific data
  getWorkExperience() {
    return this.userData.workExperience;
  }

  getEducation() {
    return this.userData.education;
  }

  getSkills() {
    return this.userData.skills;
  }

  getProjects() {
    return this.userData.projects;
  }

  getApplicationHistory() {
    return this.userData.applicationHistory;
  }

  getSettings() {
    return this.userData.settings;
  }
}
// Resume Editor Manager
class ResumeEditorManager {
  constructor() {
    this.storage = new StorageManager();
    this.currentSection = 'personal';
    this.editingItemId = null;
    this.init();
  }

  async init() {
    try {
      await this.storage.init();
      this.setupEventListeners();
      this.loadAllData();
      this.calculateResumeScore();
      console.log('ResumeEditorManager initialized');
    } catch (error) {
      console.error('Error initializing ResumeEditorManager:', error);
    }
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchSection(e.target.dataset.section);
      });
    });

    // Back button
    document.getElementById('backToPopup').addEventListener('click', () => {
      window.close();
    });

    // Personal Info
    document.getElementById('savePersonal').addEventListener('click', () => {
      this.savePersonalInfo();
    });

    // Work Experience
    document.getElementById('addExperience').addEventListener('click', () => {
      this.openExperienceModal();
    });

    // Education
    document.getElementById('addEducation').addEventListener('click', () => {
      this.openEducationModal();
    });

    // Skills
    document.getElementById('addSkill').addEventListener('click', () => {
      this.addSkill();
    });
    
    document.getElementById('skillInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addSkill();
      }
    });

    // Projects
    document.getElementById('addProject').addEventListener('click', () => {
      this.openProjectModal();
    });

    // Preview
    document.getElementById('generatePreview').addEventListener('click', () => {
      this.generatePreview();
    });

    document.getElementById('exportPDF').addEventListener('click', () => {
      this.exportPDF();
    });

    document.getElementById('exportResume').addEventListener('click', () => {
      this.exportResume();
    });

    // Modal Events
    this.setupModalEvents();
  }

  setupModalEvents() {
    // Experience Modal
    const expModal = document.getElementById('experienceModal');
    const expClose = expModal.querySelector('.close');
    const expCancel = document.getElementById('cancelExperience');
    const expSave = document.getElementById('saveExperience');
    const currentJobCheckbox = document.getElementById('modalCurrentJob');

    expClose.onclick = () => this.closeExperienceModal();
    expCancel.onclick = () => this.closeExperienceModal();
    expSave.onclick = () => this.saveExperience();

    currentJobCheckbox.addEventListener('change', (e) => {
      document.getElementById('modalEndDate').disabled = e.target.checked;
      if (e.target.checked) {
        document.getElementById('modalEndDate').value = '';
      }
    });

    // Education Modal
    const eduModal = document.getElementById('educationModal');
    if (eduModal) {
      const eduClose = eduModal.querySelector('.close');
      const eduCancel = document.getElementById('cancelEducation');
      const eduSave = document.getElementById('saveEducation');

      eduClose.onclick = () => this.closeEducationModal();
      eduCancel.onclick = () => this.closeEducationModal();
      eduSave.onclick = () => this.saveEducation();
    }

    // Project Modal
    const projModal = document.getElementById('projectModal');
    if (projModal) {
      const projClose = projModal.querySelector('.close');
      const projCancel = document.getElementById('cancelProject');
      const projSave = document.getElementById('saveProject');

      projClose.onclick = () => this.closeProjectModal();
      projCancel.onclick = () => this.closeProjectModal();
      projSave.onclick = () => this.saveProject();
    }

    // Close modals when clicking outside
    window.onclick = (event) => {
      if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
      }
    };
  }

  switchSection(section) {
    this.currentSection = section;

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.section === section) {
        btn.classList.add('active');
      }
    });

    // Update content sections
    document.querySelectorAll('.content-section').forEach(sec => {
      sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
  }

  loadAllData() {
    this.loadPersonalInfo();
    this.loadWorkExperience();
    this.loadEducation();
    this.loadSkills();
    this.loadProjects();
  }

  loadPersonalInfo() {
    const info = this.storage.userData.personalInfo;
    document.getElementById('resumeFirstName').value = info.firstName || '';
    document.getElementById('resumeLastName').value = info.lastName || '';
    document.getElementById('resumeEmail').value = info.email || '';
    document.getElementById('resumePhone').value = info.phone || '';
    document.getElementById('resumeLocation').value = info.location || '';
    document.getElementById('resumePortfolio').value = info.portfolio || '';
    document.getElementById('resumeLinkedin').value = info.linkedin || '';
    document.getElementById('resumeSummary').value = info.summary || '';
  }

  async savePersonalInfo() {
    const personalInfo = {
      firstName: document.getElementById('resumeFirstName').value.trim(),
      lastName: document.getElementById('resumeLastName').value.trim(),
      email: document.getElementById('resumeEmail').value.trim(),
      phone: document.getElementById('resumePhone').value.trim(),
      location: document.getElementById('resumeLocation').value.trim(),
      portfolio: document.getElementById('resumePortfolio').value.trim(),
      linkedin: document.getElementById('resumeLinkedin').value.trim(),
      summary: document.getElementById('resumeSummary').value.trim()
    };

    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email) {
      alert('Please fill in required fields (First Name, Last Name, and Email)');
      return;
    }

    await this.storage.updatePersonalInfo(personalInfo);
    this.calculateResumeScore();
    this.showNotification('Personal information saved successfully!', 'success');
  }

  loadWorkExperience() {
    const experiences = this.storage.getWorkExperience();
    const container = document.getElementById('experienceList');
    container.innerHTML = '';

    if (experiences.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No work experience added yet. Click "Add Work Experience" to get started.</p></div>';
      return;
    }

    experiences.forEach(exp => {
      const card = this.createExperienceCard(exp);
      container.appendChild(card);
    });
  }

  createExperienceCard(exp) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    const endDate = exp.currentJob ? 'Present' : this.formatDate(exp.endDate);
    
    card.innerHTML = `
      <h4>${exp.jobTitle}</h4>
      <div class="subtitle">${exp.company}${exp.location ? ' • ' + exp.location : ''}</div>
      <div class="date-range">${this.formatDate(exp.startDate)} - ${endDate}</div>
      <div class="description">${exp.description}</div>
      <div class="item-actions">
        <button class="btn-secondary edit-btn" data-id="${exp.id}">Edit</button>
        <button class="btn-danger delete-btn" data-id="${exp.id}">Delete</button>
      </div>
    `;

    card.querySelector('.edit-btn').addEventListener('click', () => {
      this.editExperience(exp.id);
    });

    card.querySelector('.delete-btn').addEventListener('click', () => {
      this.deleteExperience(exp.id);
    });

    return card;
  }

  openExperienceModal(experienceId = null) {
    this.editingItemId = experienceId;
    const modal = document.getElementById('experienceModal');
    const title = document.getElementById('experienceModalTitle');

    if (experienceId) {
      title.textContent = 'Edit Work Experience';
      const exp = this.storage.getWorkExperience().find(e => e.id === experienceId);
      if (exp) {
        document.getElementById('modalJobTitle').value = exp.jobTitle;
        document.getElementById('modalCompany').value = exp.company;
        document.getElementById('modalLocation').value = exp.location || '';
        document.getElementById('modalStartDate').value = exp.startDate;
        document.getElementById('modalEndDate').value = exp.endDate || '';
        document.getElementById('modalCurrentJob').checked = exp.currentJob || false;
        document.getElementById('modalDescription').value = exp.description;
        document.getElementById('modalEndDate').disabled = exp.currentJob || false;
      }
    } else {
      title.textContent = 'Add Work Experience';
      document.getElementById('modalJobTitle').value = '';
      document.getElementById('modalCompany').value = '';
      document.getElementById('modalLocation').value = '';
      document.getElementById('modalStartDate').value = '';
      document.getElementById('modalEndDate').value = '';
      document.getElementById('modalCurrentJob').checked = false;
      document.getElementById('modalDescription').value = '';
      document.getElementById('modalEndDate').disabled = false;
    }

    modal.style.display = 'block';
  }

  closeExperienceModal() {
    document.getElementById('experienceModal').style.display = 'none';
    this.editingItemId = null;
  }

  async saveExperience() {
    const experience = {
      jobTitle: document.getElementById('modalJobTitle').value.trim(),
      company: document.getElementById('modalCompany').value.trim(),
      location: document.getElementById('modalLocation').value.trim(),
      startDate: document.getElementById('modalStartDate').value,
      endDate: document.getElementById('modalEndDate').value,
      currentJob: document.getElementById('modalCurrentJob').checked,
      description: document.getElementById('modalDescription').value.trim()
    };

    if (!experience.jobTitle || !experience.company || !experience.startDate || !experience.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.editingItemId) {
      await this.storage.updateWorkExperience(this.editingItemId, experience);
    } else {
      await this.storage.addWorkExperience(experience);
    }

    this.closeExperienceModal();
    this.loadWorkExperience();
    this.calculateResumeScore();
    this.showNotification('Work experience saved successfully!', 'success');
  }

  editExperience(id) {
    this.openExperienceModal(id);
  }

  async deleteExperience(id) {
    if (confirm('Are you sure you want to delete this work experience?')) {
      await this.storage.deleteWorkExperience(id);
      this.loadWorkExperience();
      this.calculateResumeScore();
      this.showNotification('Work experience deleted', 'success');
    }
  }

  loadEducation() {
    const education = this.storage.getEducation();
    const container = document.getElementById('educationList');
    container.innerHTML = '';

    if (education.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No education added yet. Click "Add Education" to get started.</p></div>';
      return;
    }

    education.forEach(edu => {
      const card = this.createEducationCard(edu);
      container.appendChild(card);
    });
  }

  createEducationCard(edu) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    card.innerHTML = `
      <h4>${edu.degree}${edu.field ? ' in ' + edu.field : ''}</h4>
      <div class="subtitle">${edu.institution}${edu.location ? ' • ' + edu.location : ''}</div>
      <div class="date-range">${this.formatDate(edu.startDate)} - ${this.formatDate(edu.endDate)}</div>
      ${edu.gpa ? `<div class="description">GPA: ${edu.gpa}</div>` : ''}
      ${edu.description ? `<div class="description">${edu.description}</div>` : ''}
      <div class="item-actions">
        <button class="btn-secondary edit-btn" data-id="${edu.id}">Edit</button>
        <button class="btn-danger delete-btn" data-id="${edu.id}">Delete</button>
      </div>
    `;

    card.querySelector('.edit-btn').addEventListener('click', () => {
      this.editEducation(edu.id);
    });

    card.querySelector('.delete-btn').addEventListener('click', () => {
      this.deleteEducation(edu.id);
    });

    return card;
  }

  openEducationModal(educationId = null) {
    this.editingItemId = educationId;
    this.createEducationModal();
    const modal = document.getElementById('educationModal');
    const title = modal.querySelector('h3');

    if (educationId) {
      title.textContent = 'Edit Education';
      const edu = this.storage.getEducation().find(e => e.id === educationId);
      if (edu) {
        document.getElementById('modalDegree').value = edu.degree;
        document.getElementById('modalField').value = edu.field || '';
        document.getElementById('modalInstitution').value = edu.institution;
        document.getElementById('modalEduLocation').value = edu.location || '';
        document.getElementById('modalEduStartDate').value = edu.startDate;
        document.getElementById('modalEduEndDate').value = edu.endDate;
        document.getElementById('modalGpa').value = edu.gpa || '';
        document.getElementById('modalEduDescription').value = edu.description || '';
      }
    } else {
      title.textContent = 'Add Education';
      document.getElementById('modalDegree').value = '';
      document.getElementById('modalField').value = '';
      document.getElementById('modalInstitution').value = '';
      document.getElementById('modalEduLocation').value = '';
      document.getElementById('modalEduStartDate').value = '';
      document.getElementById('modalEduEndDate').value = '';
      document.getElementById('modalGpa').value = '';
      document.getElementById('modalEduDescription').value = '';
    }

    modal.style.display = 'block';
  }

  createEducationModal() {
    if (document.getElementById('educationModal')) return;

    const modal = document.createElement('div');
    modal.id = 'educationModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Education</h3>
          <span class="close">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label for="modalDegree">Degree *</label>
              <input type="text" id="modalDegree" required placeholder="e.g., Bachelor of Science">
            </div>
            <div class="form-group">
              <label for="modalField">Field of Study</label>
              <input type="text" id="modalField" placeholder="e.g., Computer Science">
            </div>
            <div class="form-group full-width">
              <label for="modalInstitution">Institution *</label>
              <input type="text" id="modalInstitution" required>
            </div>
            <div class="form-group">
              <label for="modalEduLocation">Location</label>
              <input type="text" id="modalEduLocation">
            </div>
            <div class="form-group">
              <label for="modalGpa">GPA</label>
              <input type="text" id="modalGpa" placeholder="e.g., 3.8/4.0">
            </div>
            <div class="form-group">
              <label for="modalEduStartDate">Start Date *</label>
              <input type="month" id="modalEduStartDate" required>
            </div>
            <div class="form-group">
              <label for="modalEduEndDate">End Date *</label>
              <input type="month" id="modalEduEndDate" required>
            </div>
            <div class="form-group full-width">
              <label for="modalEduDescription">Description</label>
              <textarea id="modalEduDescription" rows="3" placeholder="Achievements, honors, relevant coursework..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button id="saveEducation" class="btn-primary">Save Education</button>
          <button id="cancelEducation" class="btn-outline">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  closeEducationModal() {
    const modal = document.getElementById('educationModal');
    if (modal) modal.style.display = 'none';
    this.editingItemId = null;
  }

  async saveEducation() {
    const education = {
      degree: document.getElementById('modalDegree').value.trim(),
      field: document.getElementById('modalField').value.trim(),
      institution: document.getElementById('modalInstitution').value.trim(),
      location: document.getElementById('modalEduLocation').value.trim(),
      startDate: document.getElementById('modalEduStartDate').value,
      endDate: document.getElementById('modalEduEndDate').value,
      gpa: document.getElementById('modalGpa').value.trim(),
      description: document.getElementById('modalEduDescription').value.trim()
    };

    if (!education.degree || !education.institution || !education.startDate || !education.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.editingItemId) {
      await this.storage.updateEducation(this.editingItemId, education);
    } else {
      await this.storage.addEducation(education);
    }

    this.closeEducationModal();
    this.loadEducation();
    this.calculateResumeScore();
    this.showNotification('Education saved successfully!', 'success');
  }

  editEducation(id) {
    this.openEducationModal(id);
  }

  async deleteEducation(id) {
    if (confirm('Are you sure you want to delete this education entry?')) {
      await this.storage.deleteEducation(id);
      this.loadEducation();
      this.calculateResumeScore();
      this.showNotification('Education deleted', 'success');
    }
  }

  loadSkills() {
    const skills = this.storage.getSkills();
    const container = document.getElementById('skillsList');
    container.innerHTML = '';

    if (skills.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No skills added yet. Add your first skill above.</p></div>';
      return;
    }

    skills.forEach(skill => {
      const tag = this.createSkillTag(skill);
      container.appendChild(tag);
    });
  }

  createSkillTag(skill) {
    const tag = document.createElement('div');
    tag.className = 'skill-tag';
    tag.innerHTML = `
      ${skill}
      <button class="remove-skill" data-skill="${skill}">×</button>
    `;

    tag.querySelector('.remove-skill').addEventListener('click', () => {
      this.removeSkill(skill);
    });

    return tag;
  }

  async addSkill() {
    const input = document.getElementById('skillInput');
    const skill = input.value.trim();

    if (!skill) return;

    const skills = this.storage.getSkills();
    if (skills.includes(skill)) {
      alert('This skill already exists');
      return;
    }

    skills.push(skill);
    await this.storage.updateSkills(skills);
    this.loadSkills();
    this.calculateResumeScore();
    input.value = '';
    this.showNotification('Skill added successfully!', 'success');
  }

  async removeSkill(skill) {
    const skills = this.storage.getSkills().filter(s => s !== skill);
    await this.storage.updateSkills(skills);
    this.loadSkills();
    this.calculateResumeScore();
    this.showNotification('Skill removed', 'success');
  }

  loadProjects() {
    const projects = this.storage.getProjects();
    const container = document.getElementById('projectsList');
    container.innerHTML = '';

    if (projects.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No projects added yet. Click "Add Project" to showcase your work.</p></div>';
      return;
    }

    projects.forEach(proj => {
      const card = this.createProjectCard(proj);
      container.appendChild(card);
    });
  }

  createProjectCard(proj) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    card.innerHTML = `
      <h4>${proj.title}</h4>
      ${proj.url ? `<div class="subtitle"><a href="${proj.url}" target="_blank">${proj.url}</a></div>` : ''}
      ${proj.technologies ? `<div class="date-range">Technologies: ${proj.technologies}</div>` : ''}
      <div class="description">${proj.description}</div>
      <div class="item-actions">
        <button class="btn-secondary edit-btn" data-id="${proj.id}">Edit</button>
        <button class="btn-danger delete-btn" data-id="${proj.id}">Delete</button>
      </div>
    `;

    card.querySelector('.edit-btn').addEventListener('click', () => {
      this.editProject(proj.id);
    });

    card.querySelector('.delete-btn').addEventListener('click', () => {
      this.deleteProject(proj.id);
    });

    return card;
  }

  openProjectModal(projectId = null) {
    this.editingItemId = projectId;
    this.createProjectModal();
    const modal = document.getElementById('projectModal');
    const title = modal.querySelector('h3');

    if (projectId) {
      title.textContent = 'Edit Project';
      const proj = this.storage.getProjects().find(p => p.id === projectId);
      if (proj) {
        document.getElementById('modalProjectTitle').value = proj.title;
        document.getElementById('modalProjectUrl').value = proj.url || '';
        document.getElementById('modalTechnologies').value = proj.technologies || '';
        document.getElementById('modalProjectDescription').value = proj.description;
      }
    } else {
      title.textContent = 'Add Project';
      document.getElementById('modalProjectTitle').value = '';
      document.getElementById('modalProjectUrl').value = '';
      document.getElementById('modalTechnologies').value = '';
      document.getElementById('modalProjectDescription').value = '';
    }

    modal.style.display = 'block';
  }

  createProjectModal() {
    if (document.getElementById('projectModal')) return;

    const modal = document.createElement('div');
    modal.id = 'projectModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Project</h3>
          <span class="close">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="modalProjectTitle">Project Title *</label>
              <input type="text" id="modalProjectTitle" required>
            </div>
            <div class="form-group full-width">
              <label for="modalProjectUrl">Project URL</label>
              <input type="url" id="modalProjectUrl" placeholder="https://">
            </div>
            <div class="form-group full-width">
              <label for="modalTechnologies">Technologies Used</label>
              <input type="text" id="modalTechnologies" placeholder="e.g., React, Node.js, MongoDB">
            </div>
            <div class="form-group full-width">
              <label for="modalProjectDescription">Description *</label>
              <textarea id="modalProjectDescription" rows="4" required placeholder="Describe the project and your contributions..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button id="saveProject" class="btn-primary">Save Project</button>
          <button id="cancelProject" class="btn-outline">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) modal.style.display = 'none';
    this.editingItemId = null;
  }

  async saveProject() {
    const project = {
      title: document.getElementById('modalProjectTitle').value.trim(),
      url: document.getElementById('modalProjectUrl').value.trim(),
      technologies: document.getElementById('modalTechnologies').value.trim(),
      description: document.getElementById('modalProjectDescription').value.trim()
    };

    if (!project.title || !project.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.editingItemId) {
      await this.storage.updateProject(this.editingItemId, project);
    } else {
      await this.storage.addProject(project);
    }

    this.closeProjectModal();
    this.loadProjects();
    this.calculateResumeScore();
    this.showNotification('Project saved successfully!', 'success');
  }

  editProject(id) {
    this.openProjectModal(id);
  }

  async deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
      await this.storage.deleteProject(id);
      this.loadProjects();
      this.calculateResumeScore();
      this.showNotification('Project deleted', 'success');
    }
  }

  generatePreview() {
    const preview = document.getElementById('resumePreview');
    const userData = this.storage.userData;
    const info = userData.personalInfo;

    let html = `
      <div class="preview-header">
        <h1>${info.firstName} ${info.lastName}</h1>
        <div class="preview-contact">
          ${info.email ? `<span>${info.email}</span>` : ''}
          ${info.phone ? `<span>${info.phone}</span>` : ''}
          ${info.location ? `<span>${info.location}</span>` : ''}
          ${info.portfolio ? `<span><a href="${info.portfolio}" target="_blank">Portfolio</a></span>` : ''}
          ${info.linkedin ? `<span><a href="${info.linkedin}" target="_blank">LinkedIn</a></span>` : ''}
        </div>
      </div>
    `;

    // Professional Summary
    if (info.summary) {
      html += `
        <div class="preview-section">
          <h2>Professional Summary</h2>
          <p>${info.summary}</p>
        </div>
      `;
    }

    // Work Experience
    if (userData.workExperience.length > 0) {
      html += '<div class="preview-section"><h2>Work Experience</h2>';
      userData.workExperience.forEach(exp => {
        const endDate = exp.currentJob ? 'Present' : this.formatDate(exp.endDate);
        html += `
          <div class="preview-item">
            <h3>${exp.jobTitle}</h3>
            <div class="subtitle">${exp.company}${exp.location ? ' • ' + exp.location : ''}</div>
            <div class="date-range">${this.formatDate(exp.startDate)} - ${endDate}</div>
            <p>${exp.description}</p>
          </div>
        `;
      });
      html += '</div>';
    }

    // Education
    if (userData.education.length > 0) {
      html += '<div class="preview-section"><h2>Education</h2>';
      userData.education.forEach(edu => {
        html += `
          <div class="preview-item">
            <h3>${edu.degree}${edu.field ? ' in ' + edu.field : ''}</h3>
            <div class="subtitle">${edu.institution}${edu.location ? ' • ' + edu.location : ''}</div>
            <div class="date-range">${this.formatDate(edu.startDate)} - ${this.formatDate(edu.endDate)}</div>
            ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ''}
            ${edu.description ? `<p>${edu.description}</p>` : ''}
          </div>
        `;
      });
      html += '</div>';
    }

    // Skills
    if (userData.skills.length > 0) {
      html += '<div class="preview-section"><h2>Skills</h2><div class="preview-skills">';
      userData.skills.forEach(skill => {
        html += `<span class="preview-skill">${skill}</span>`;
      });
      html += '</div></div>';
    }

    // Projects
    if (userData.projects.length > 0) {
      html += '<div class="preview-section"><h2>Projects</h2>';
      userData.projects.forEach(proj => {
        html += `
          <div class="preview-item">
            <h3>${proj.title}</h3>
            ${proj.url ? `<div class="subtitle"><a href="${proj.url}" target="_blank">${proj.url}</a></div>` : ''}
            ${proj.technologies ? `<div class="date-range">${proj.technologies}</div>` : ''}
            <p>${proj.description}</p>
          </div>
        `;
      });
      html += '</div>';
    }

    preview.innerHTML = html;
    this.showNotification('Preview generated!', 'success');
  }

  exportPDF() {
    this.generatePreview();
    window.print();
  }

  async exportResume() {
    const data = await this.storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('Resume data exported successfully!', 'success');
  }

  calculateResumeScore() {
    const userData = this.storage.userData;
    let score = 0;
    let maxScore = 100;

    // Personal Info (30 points)
    const requiredFields = ['firstName', 'lastName', 'email'];
    const optionalFields = ['phone', 'location', 'portfolio', 'linkedin', 'summary'];
    
    requiredFields.forEach(field => {
      if (userData.personalInfo[field]) score += 10;
    });

    optionalFields.forEach(field => {
      if (userData.personalInfo[field]) score += 2;
    });

    // Work Experience (25 points)
    const expScore = Math.min(userData.workExperience.length * 8, 25);
    score += expScore;

    // Education (20 points)
    const eduScore = Math.min(userData.education.length * 10, 20);
    score += eduScore;

    // Skills (15 points)
    const skillsScore = Math.min(userData.skills.length * 1.5, 15);
    score += skillsScore;

    // Projects (10 points)
    const projScore = Math.min(userData.projects.length * 5, 10);
    score += projScore;

    const percentage = Math.round((score / maxScore) * 100);

    document.getElementById('resumeScore').textContent = `${percentage}%`;
    document.getElementById('expScore').textContent = userData.workExperience.length;
    document.getElementById('skillsScore').textContent = userData.skills.length;
    document.getElementById('eduScore').textContent = userData.education.length;
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${year}`;
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#48bb78' : '#f56565'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing ResumeEditorManager...');
  new ResumeEditorManager();
});

// Add print styles
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
  @media print {
    body * { visibility: hidden; }
    .resume-preview, .resume-preview * { visibility: visible; }
    .resume-preview { position: absolute; left: 0; top: 0; width: 100%; }
    .preview-actions { display: none !important; }
  }
`;
document.head.appendChild(style);
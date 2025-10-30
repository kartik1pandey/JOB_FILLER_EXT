// AI Suggestions System for Job Applications
class AISuggestionEngine {
  constructor(userData) {
    this.userData = userData;
    this.activeSuggestionBox = null;
    this.currentField = null;
  }

  // Generate contextual suggestions based on field and job description
  generateSuggestions(fieldType, jobDescription = '') {
    const suggestions = {
      coverLetter: this.generateCoverLetterSuggestions(jobDescription),
      whyInterested: this.generateWhyInterestedSuggestions(jobDescription),
      strengths: this.generateStrengthsSuggestions(),
      experience: this.generateExperienceSummary(),
      skills: this.generateSkillsList(),
      summary: this.generateProfessionalSummary(jobDescription)
    };

    return suggestions[fieldType] || [];
  }

  generateCoverLetterSuggestions(jobDescription) {
    const name = `${this.userData.personalInfo.firstName} ${this.userData.personalInfo.lastName}`;
    const skills = this.userData.skills.slice(0, 5).join(', ');
    const latestJob = this.userData.workExperience[0];
    
    const suggestions = [];

    // Opening paragraph
    if (latestJob) {
      suggestions.push({
        text: `I am writing to express my strong interest in this position. With ${this.calculateYearsOfExperience()} years of experience in ${latestJob.jobTitle} and expertise in ${skills}, I am confident in my ability to contribute meaningfully to your team.`,
        type: 'opening',
        label: 'Professional Opening'
      });
    }

    // Experience highlight
    if (this.userData.workExperience.length > 0) {
      const exp = this.userData.workExperience[0];
      suggestions.push({
        text: `In my current role as ${exp.jobTitle} at ${exp.company}, I have successfully ${this.extractAchievement(exp.description)}. This experience has equipped me with the skills necessary to excel in this position.`,
        type: 'experience',
        label: 'Experience Highlight'
      });
    }

    // Skills alignment
    if (this.userData.skills.length > 0) {
      suggestions.push({
        text: `My technical expertise includes ${skills}, which aligns well with the requirements of this role. I am passionate about leveraging these skills to drive innovation and deliver exceptional results.`,
        type: 'skills',
        label: 'Skills Match'
      });
    }

    // Closing
    suggestions.push({
      text: `I would welcome the opportunity to discuss how my background and skills would benefit your organization. Thank you for considering my application. I look forward to speaking with you soon.`,
      type: 'closing',
      label: 'Professional Closing'
    });

    return suggestions;
  }

  generateWhyInterestedSuggestions(jobDescription) {
    const suggestions = [];
    const latestJob = this.userData.workExperience[0];

    suggestions.push({
      text: `This role perfectly aligns with my career goals and professional experience. I'm particularly excited about the opportunity to apply my skills in a challenging and innovative environment.`,
      label: 'Career Alignment'
    });

    if (latestJob) {
      suggestions.push({
        text: `Having worked as a ${latestJob.jobTitle}, I have developed a deep passion for this field. This position offers the perfect next step in my career journey, allowing me to leverage my experience while continuing to grow professionally.`,
        label: 'Career Progression'
      });
    }

    suggestions.push({
      text: `I'm impressed by your company's commitment to innovation and excellence. The opportunity to contribute to your team's success while working on impactful projects is exactly what I'm looking for in my next role.`,
      label: 'Company Interest'
    });

    if (this.userData.skills.length > 2) {
      const skills = this.userData.skills.slice(0, 3).join(', ');
      suggestions.push({
        text: `This position is a perfect match for my skill set, particularly in ${skills}. I'm eager to bring my expertise to your team and contribute to achieving your organizational goals.`,
        label: 'Skills Match'
      });
    }

    return suggestions;
  }

  generateStrengthsSuggestions() {
    const suggestions = [];
    const skills = this.userData.skills;
    const experience = this.userData.workExperience;

    if (skills.length > 0) {
      suggestions.push({
        text: `Strong technical proficiency in ${skills.slice(0, 3).join(', ')}`,
        label: 'Technical Skills'
      });
    }

    if (experience.length > 0) {
      suggestions.push({
        text: `${this.calculateYearsOfExperience()}+ years of proven experience in ${experience[0].jobTitle}`,
        label: 'Experience'
      });
    }

    suggestions.push(
      { text: 'Excellent problem-solving and analytical abilities', label: 'Problem Solving' },
      { text: 'Strong communication and collaboration skills', label: 'Communication' },
      { text: 'Proven track record of delivering high-quality results', label: 'Results-Driven' },
      { text: 'Quick learner with adaptability to new technologies', label: 'Adaptability' },
      { text: 'Detail-oriented with strong organizational skills', label: 'Organization' }
    );

    return suggestions;
  }

  generateExperienceSummary() {
    const suggestions = [];
    const experience = this.userData.workExperience;

    experience.forEach((exp, index) => {
      if (index < 3) { // Top 3 experiences
        const duration = this.calculateDuration(exp.startDate, exp.endDate, exp.currentJob);
        suggestions.push({
          text: `${exp.jobTitle} at ${exp.company} (${duration}) - ${this.extractAchievement(exp.description)}`,
          label: `Experience ${index + 1}`
        });
      }
    });

    if (experience.length > 0) {
      const summary = `${this.calculateYearsOfExperience()} years of professional experience across ${experience.length} role${experience.length > 1 ? 's' : ''}, specializing in ${experience[0].jobTitle}.`;
      suggestions.push({
        text: summary,
        label: 'Experience Summary'
      });
    }

    return suggestions;
  }

  generateSkillsList() {
    const skills = this.userData.skills;
    const suggestions = [];

    if (skills.length > 0) {
      // Comma-separated list
      suggestions.push({
        text: skills.join(', '),
        label: 'All Skills (Comma-separated)'
      });

      // Bullet points
      suggestions.push({
        text: skills.map(s => `• ${s}`).join('\n'),
        label: 'All Skills (Bullet points)'
      });

      // Top 5 skills
      if (skills.length > 5) {
        suggestions.push({
          text: skills.slice(0, 5).join(', '),
          label: 'Top 5 Skills'
        });
      }

      // Categorized (if we can detect categories)
      const technical = skills.filter(s => this.isTechnicalSkill(s));
      const soft = skills.filter(s => !this.isTechnicalSkill(s));

      if (technical.length > 0 && soft.length > 0) {
        suggestions.push({
          text: `Technical: ${technical.join(', ')}\nSoft Skills: ${soft.join(', ')}`,
          label: 'Categorized Skills'
        });
      }
    }

    return suggestions;
  }

  generateProfessionalSummary(jobDescription) {
    const suggestions = [];
    const name = `${this.userData.personalInfo.firstName} ${this.userData.personalInfo.lastName}`;
    const latestJob = this.userData.workExperience[0];
    const skills = this.userData.skills.slice(0, 5).join(', ');
    const yearsExp = this.calculateYearsOfExperience();

    if (latestJob && yearsExp > 0) {
      suggestions.push({
        text: `${name} is an experienced ${latestJob.jobTitle} with ${yearsExp}+ years of expertise in ${skills}. Proven track record of delivering innovative solutions and driving results in fast-paced environments.`,
        label: 'Professional Summary'
      });

      suggestions.push({
        text: `Accomplished professional with ${yearsExp} years of experience in ${latestJob.jobTitle}. Expertise in ${skills}. Known for strong problem-solving abilities and commitment to excellence.`,
        label: 'Concise Summary'
      });
    }

    if (this.userData.workExperience.length >= 2) {
      const companies = this.userData.workExperience.slice(0, 3).map(e => e.company).join(', ');
      suggestions.push({
        text: `Results-driven professional with extensive experience at leading organizations including ${companies}. Specialized in ${skills} with a strong focus on innovation and continuous improvement.`,
        label: 'Career Highlight'
      });
    }

    return suggestions;
  }

  // Helper functions
  calculateYearsOfExperience() {
    if (this.userData.workExperience.length === 0) return 0;
    
    let totalMonths = 0;
    this.userData.workExperience.forEach(exp => {
      const start = new Date(exp.startDate + '-01');
      const end = exp.currentJob ? new Date() : new Date(exp.endDate + '-01');
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += months;
    });
    
    return Math.floor(totalMonths / 12);
  }

  calculateDuration(startDate, endDate, isCurrent) {
    const start = new Date(startDate + '-01');
    const end = isCurrent ? new Date() : new Date(endDate + '-01');
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0 && remainingMonths > 0) {
      return `${years}y ${remainingMonths}m`;
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
  }

  extractAchievement(description) {
    // Extract first sentence or first meaningful phrase
    const sentences = description.split(/[.!?]/).filter(s => s.trim().length > 20);
    return sentences[0] ? sentences[0].trim() : description.substring(0, 100);
  }

  isTechnicalSkill(skill) {
    const technicalKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 
                               'git', 'api', 'css', 'html', 'typescript', 'angular', 'vue', 'mongodb',
                               'programming', 'coding', 'development', 'software', 'database'];
    return technicalKeywords.some(keyword => skill.toLowerCase().includes(keyword));
  }

  // Show suggestion box near the field
  showSuggestions(field, fieldType, jobDescription = '') {
    // Remove any existing suggestion box
    this.hideSuggestions();

    const suggestions = this.generateSuggestions(fieldType, jobDescription);
    if (suggestions.length === 0) return;

    this.currentField = field;

    // Create suggestion box
    const suggestionBox = document.createElement('div');
    suggestionBox.className = 'ai-suggestion-box';
    suggestionBox.innerHTML = `
      <div class="ai-suggestion-header">
        <span class="ai-icon">✨</span>
        <span class="ai-title">AI Suggestions</span>
        <button class="ai-close">×</button>
      </div>
      <div class="ai-suggestion-list">
        ${suggestions.map((s, i) => `
          <div class="ai-suggestion-item" data-index="${i}">
            <div class="ai-suggestion-label">${s.label}</div>
            <div class="ai-suggestion-text">${s.text}</div>
            <button class="ai-suggestion-use">Use this</button>
          </div>
        `).join('')}
      </div>
    `;

    // Position near the field
    document.body.appendChild(suggestionBox);
    this.positionSuggestionBox(suggestionBox, field);

    // Add event listeners
    suggestionBox.querySelector('.ai-close').addEventListener('click', () => {
      this.hideSuggestions();
    });

    suggestionBox.querySelectorAll('.ai-suggestion-use').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        this.useSuggestion(suggestions[index].text);
      });
    });

    // Click suggestion text to use it
    suggestionBox.querySelectorAll('.ai-suggestion-item').forEach((item, index) => {
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('ai-suggestion-use')) {
          this.useSuggestion(suggestions[index].text);
        }
      });
    });

    this.activeSuggestionBox = suggestionBox;

    // Add styles if not already added
    if (!document.getElementById('ai-suggestion-styles')) {
      this.injectStyles();
    }
  }

  positionSuggestionBox(box, field) {
    const fieldRect = field.getBoundingClientRect();
    const boxHeight = 400; // max height

    // Try to position below the field
    let top = fieldRect.bottom + window.scrollY + 8;
    let left = fieldRect.left + window.scrollX;

    // If it goes off the bottom, position above
    if (top + boxHeight > window.innerHeight + window.scrollY) {
      top = fieldRect.top + window.scrollY - boxHeight - 8;
    }

    // Keep within viewport horizontally
    if (left + 400 > window.innerWidth) {
      left = window.innerWidth - 410;
    }

    box.style.top = `${top}px`;
    box.style.left = `${left}px`;
  }

  useSuggestion(text) {
    if (!this.currentField) return;

    // Set the value
    this.currentField.value = text;

    // Trigger events
    const events = ['input', 'change'];
    events.forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      this.currentField.dispatchEvent(event);
    });

    // Visual feedback
    this.currentField.style.transition = 'all 0.3s ease';
    this.currentField.style.backgroundColor = '#d1fae5';
    this.currentField.style.borderColor = '#10b981';

    setTimeout(() => {
      this.currentField.style.backgroundColor = '';
      this.currentField.style.borderColor = '';
    }, 2000);

    // Hide suggestions
    this.hideSuggestions();
  }

  hideSuggestions() {
    if (this.activeSuggestionBox) {
      this.activeSuggestionBox.remove();
      this.activeSuggestionBox = null;
    }
  }

  injectStyles() {
    const styles = document.createElement('style');
    styles.id = 'ai-suggestion-styles';
    styles.textContent = `
      .ai-suggestion-box {
        position: absolute;
        width: 400px;
        max-height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        overflow: hidden;
        animation: slideUp 0.2s ease;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .ai-suggestion-header {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .ai-icon {
        font-size: 18px;
      }

      .ai-title {
        flex: 1;
        font-weight: 600;
        font-size: 14px;
      }

      .ai-close {
        background: transparent;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: background 0.15s ease;
      }

      .ai-close:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .ai-suggestion-list {
        max-height: 450px;
        overflow-y: auto;
        padding: 8px;
      }

      .ai-suggestion-item {
        padding: 12px;
        margin-bottom: 8px;
        border-radius: 8px;
        border: 1.5px solid #e2e8f0;
        cursor: pointer;
        transition: all 0.15s ease;
        background: #fafbfc;
      }

      .ai-suggestion-item:hover {
        border-color: #6366f1;
        background: #eef2ff;
        transform: translateX(2px);
      }

      .ai-suggestion-label {
        font-size: 11px;
        font-weight: 600;
        color: #6366f1;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 6px;
      }

      .ai-suggestion-text {
        font-size: 13px;
        line-height: 1.5;
        color: #334155;
        margin-bottom: 10px;
        white-space: pre-wrap;
      }

      .ai-suggestion-use {
        background: #6366f1;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .ai-suggestion-use:hover {
        background: #5558e3;
        transform: translateY(-1px);
      }

      .ai-suggestion-list::-webkit-scrollbar {
        width: 6px;
      }

      .ai-suggestion-list::-webkit-scrollbar-track {
        background: transparent;
      }

      .ai-suggestion-list::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
    `;
    document.head.appendChild(styles);
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AISuggestionEngine;
}
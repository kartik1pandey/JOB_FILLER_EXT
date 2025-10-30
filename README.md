<!-- PROJECT LOGO -->

<p align="center">
  <a href="https://github.com/kartik1pandey/JOB_FILLER_EXT">
    <img src="https://github.com/kartik1pandey/JOB_FILLER_EXT/blob/main/icons/Icon128.png" alt="Logo" width="128" height="128">
  </a>
</p>

<h1 align="center">💼 Job Application Assistant - Chrome Extension</h1>

<p align="center">
  <b>Automate your job applications with smart auto-fill, resume management, and instant form detection.</b>
  <br/>
  <a href="#-features"><strong>Explore Features »</strong></a>
  <br/>
  <br/>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg"/>
  <img src="https://img.shields.io/github/stars/kartik1pandey/JOB_FILLER_EXT?style=flat-square"/>
  <img src="https://img.shields.io/github/forks/kartik1pandey/JOB_FILLER_EXT?style=flat-square"/>
  <img src="https://img.shields.io/badge/Chrome%20Extension-Automation-blue?style=flat-square&logo=google-chrome"/>
</p>

---

## ✨ Overview

**Job Application Assistant** is a powerful Chrome extension that automates job applications by:

* Auto-filling application forms with your saved information
* Managing and exporting your resume data
* Extracting job descriptions directly from listings

---

## ⚙️ Features

### 🚀 Quick Actions

* **Extract Job Description** — Automatically fetch job descriptions from listings
* **Auto-Fill Forms** — Instantly fill application forms with saved personal data
* **Resume Editor** — Real-time resume builder and PDF generator

### 📝 Resume Management

* Personal details
* Work experience
* Education history
* Skills inventory
* Projects showcase
* Resume scoring
* Export/Import (JSON)
* PDF export

### 🎯 Smart Form Detection

Detects and auto-fills across platforms:

> LinkedIn • Indeed • Greenhouse • Lever • Workday • Glassdoor • Generic forms

### 💾 Data Management

* Local storage (no cloud dependencies)
* Export/import data as JSON
* Track application history securely

---

## 🦯 Installation Guide

### Step 1: Clone or Download

```bash
git clone https://github.com/kartik1pandey/JOB_FILLER_EXT.git
cd JOB_FILLER_EXT
```

> You can generate icons using [favicon.io](https://favicon.io/) or any online icon tool.

### Step 2: Load in Chrome

1. Go to `chrome://extensions/`
2. Toggle **Developer mode**
3. Click **Load unpacked**
4. Select your project folder

---

## 🗂️ File Structure

```bash
JOB_FILLER_EXT/
├── manifest.json
├── README.md
├── background/
│   └── service-worker.js
├── content/
│   └── content-autofill.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── resume-editor/
│   ├── resume-editor.html
│   ├── resume-editor.css
│   └── resume-editor.js
├── storage/
│   └── storage-manager.js
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

---

## 🧑‍💼 Usage

### 🧟‍♂️ Setting Up Your Profile

1. Click the extension icon
2. Choose **Edit Personal Info**
3. Fill out your details (Name, Email, etc.)
4. Hit **Save Information**

### 🧱 Resume Editor

* Add/edit experience, education, skills, and projects
* View your **Resume Score**
* Export as PDF

### ⚡ Auto-Fill Job Applications

1. Visit a job page
2. Click the extension
3. Select **Auto-Fill Form**
4. Fields auto-populate automatically

### 🟞 Extract Job Descriptions

1. Go to a job listing
2. Click **Extract Job Description**
3. Save it to your job history

### 📄 Export / 🗕 Import Data

* Export all your data as JSON
* Re-import anytime to restore

---

## 🌐 Supported Platforms

| Platform      | Supported |
| ------------- | --------- |
| LinkedIn      | ✅         |
| Indeed        | ✅         |
| Glassdoor     | ✅         |
| Greenhouse    | ✅         |
| Lever         | ✅         |
| Workday       | ✅         |
| Generic Forms | ✅         |

---

## 🔒 Privacy & Security

* 100% Local Storage
* No external data transmission
* Secure JSON export/import
* You control your data

---

## 💡 Tips for Best Results

1. Complete all profile sections for accurate auto-fill
2. Keep your skills list fresh
3. Use a strong professional summary
4. Review auto-filled data before submission
5. Regularly back up your data

---

## 🤏 Troubleshooting

| Issue                     | Solution                               |
| ------------------------- | -------------------------------------- |
| Auto-Fill not working     | Ensure name/email filled, refresh page |
| Resume Editor not opening | Disable popup blockers                 |
| Data not saving           | Check Chrome storage permissions       |

---

## 📜 License

This project is licensed under the **MIT License** — free for personal and commercial use.
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 💬 Support

Found a bug or want to suggest a feature?
👉 [Open an Issue](https://github.com/kartik1pandey/JOB_FILLER_EXT/issues)

---

<p align="center">
  Made with ❤️ for job seekers everywhere.<br/>
  <a href="https://github.com/kartik1pandey/JOB_FILLER_EXT">⭐ Star this repo</a> if you find it helpful!
</p>

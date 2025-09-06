# 🚀 Skill-Port CI/CD Setup Guide

This guide will help you set up the complete GitHub Actions CI/CD pipeline for your Skill-Port project.

## 📋 Prerequisites

1. **GitHub Repository**: Your Skill-Port project must be in a GitHub repository
2. **Firebase Project**: You need a Firebase project with Hosting enabled
3. **Firebase CLI**: Install locally for testing (optional but recommended)

## 🔧 Setup Steps

### Step 1: Configure GitHub Secrets

You need to add the following secrets to your GitHub repository:

#### 1.1 Go to Repository Settings
1. Navigate to your GitHub repository
2. Click on **Settings** tab
3. Click on **Secrets and variables** → **Actions**

#### 1.2 Add Required Secrets

Add these secrets by clicking **New repository secret**:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON key | See [Firebase Service Account Setup](#firebase-service-account-setup) |
| `FIREBASE_TOKEN` | Firebase CLI token | See [Firebase Token Setup](#firebase-token-setup) |

### Step 2: Firebase Service Account Setup

#### 2.1 Create Service Account
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate new private key**
5. Download the JSON file

#### 2.2 Add to GitHub Secrets
1. Copy the entire contents of the downloaded JSON file
2. In GitHub, create a new secret named `FIREBASE_SERVICE_ACCOUNT`
3. Paste the JSON content as the secret value

### Step 3: Firebase Token Setup

#### 3.1 Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

#### 3.2 Login to Firebase
```bash
firebase login
```

#### 3.3 Generate Token
```bash
firebase login:ci
```

#### 3.4 Add to GitHub Secrets
1. Copy the generated token
2. In GitHub, create a new secret named `FIREBASE_TOKEN`
3. Paste the token as the secret value

### Step 4: Update Firebase Project ID

In the `.github/workflows/ci-cd.yml` file, update this line:
```yaml
FIREBASE_PROJECT_ID: 'skillport-community'  # Update this with your actual Firebase project ID
```

Replace `'skillport-community'` with your actual Firebase project ID.

## 🎯 Pipeline Overview

The CI/CD pipeline includes these jobs:

### 1. 🔍 Lint & Build
- Installs dependencies with `npm ci`
- Runs linting (if configured)
- Builds the project
- Uploads build artifacts

### 2. 🧪 Run Tests
- Runs tests (if configured)
- Only runs if lint and build succeed

### 3. 🚀 Deploy to Firebase
- Deploys to Firebase Hosting
- Only runs on push to `main` branch
- Only runs if all previous jobs succeed

### 4. 🔒 Security Scan
- Runs `npm audit` for security vulnerabilities
- Reports but doesn't fail the build

### 5. 📢 Notify Status
- Displays pipeline status
- Can be extended for Slack/Discord notifications

## 🔄 Workflow Triggers

The pipeline runs on:
- **Push** to `main` or `dev` branches
- **Pull Request** to `main` or `dev` branches

## 📁 File Structure

After setup, your repository should have:
```
.github/
└── workflows/
    └── ci-cd.yml
client/
├── package.json (updated with scripts)
└── ... (your project files)
firebase.json
firestore.rules
firestore.indexes.json
```

## 🧪 Testing the Pipeline

### 1. Test on Dev Branch
1. Create a new branch from `main`
2. Make a small change (like updating a comment)
3. Push to the branch
4. Create a pull request to `main`
5. Check the **Actions** tab to see the pipeline running

### 2. Test Deployment
1. Merge the pull request to `main`
2. The pipeline should automatically deploy to Firebase Hosting
3. Check your Firebase Hosting URL to see the changes

## 🛠️ Customization

### Adding Linting
To add ESLint to your project:

1. Install ESLint:
```bash
cd client
npm install --save-dev eslint
```

2. Update the `lint` script in `package.json`:
```json
"lint": "eslint . --ext .js,.html"
```

### Adding Tests
To add Jest tests:

1. Install Jest:
```bash
cd client
npm install --save-dev jest
```

2. Update the `test` script in `package.json`:
```json
"test": "jest"
```

### Adding Build Process
If you want to add a build process (like minification, bundling):

1. Install build tools:
```bash
cd client
npm install --save-dev webpack terser-webpack-plugin
```

2. Update the `build` script in `package.json`:
```json
"build": "webpack --mode production"
```

## 🚨 Troubleshooting

### Common Issues

1. **Firebase Authentication Failed**
   - Check that `FIREBASE_SERVICE_ACCOUNT` secret is properly formatted JSON
   - Verify `FIREBASE_TOKEN` is valid and not expired

2. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Ensure `package-lock.json` is committed to the repository

3. **Deployment Fails**
   - Verify Firebase project ID is correct
   - Check that Firebase Hosting is enabled in your project

4. **Tests Fail**
   - Add proper test scripts to `package.json`
   - Ensure test files are in the correct location

### Getting Help

1. Check the **Actions** tab in GitHub for detailed logs
2. Look at the specific step that failed
3. Check Firebase Console for deployment logs
4. Review this guide for common solutions

## 📊 Monitoring

### GitHub Actions
- Go to your repository → **Actions** tab
- View pipeline runs and their status
- Click on individual runs to see detailed logs

### Firebase Console
- Go to [Firebase Console](https://console.firebase.google.com/)
- Select your project → **Hosting**
- View deployment history and logs

## 🎉 Success!

Once everything is set up, your Skill-Port project will have:
- ✅ Automated testing on every push/PR
- ✅ Automatic deployment to Firebase Hosting on main branch
- ✅ Security scanning
- ✅ Build artifact caching for faster runs
- ✅ Comprehensive logging and monitoring

Your project is now ready for professional CI/CD! 🚀

# SkillPort Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Configuration
- [ ] Create `.env` file with all required variables
- [ ] Set up Firebase project aliases in `.firebaserc`
- [ ] Configure Firebase Functions environment variables
- [ ] Set up service account credentials

### 2. Firebase Configuration
- [ ] Move Firebase config to environment variables
- [ ] Update client config to use environment-based values
- [ ] Verify Firestore security rules are properly configured
- [ ] Check Firebase Storage rules

### 3. Security Setup
- [ ] Store sensitive keys in Firebase Functions config
- [ ] Set up proper CORS configuration
- [ ] Configure rate limiting
- [ ] Set up input validation and sanitization

## Deployment Commands

### 1. Deploy Firebase Functions
```bash
# Set environment variables for Functions
firebase functions:config:set smtp.user="your-email@gmail.com" smtp.pass="your-app-password"

# Deploy functions
firebase deploy --only functions
```

### 2. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### 4. Deploy Hosting
```bash
firebase deploy --only hosting
```

### 5. Deploy Everything
```bash
firebase deploy
```

## Post-Deployment Verification

### 1. Test Authentication
- [ ] Test user registration with OTP
- [ ] Test user login
- [ ] Test social authentication (Google/Facebook)
- [ ] Verify email verification flow

### 2. Test API Endpoints
- [ ] Test user management endpoints
- [ ] Test community creation and management
- [ ] Test contest creation and participation
- [ ] Test submission tracking

### 3. Test File Uploads
- [ ] Test profile image uploads
- [ ] Test community image uploads
- [ ] Test contest attachments
- [ ] Verify file access permissions

### 4. Test Browser Extension
- [ ] Test submission tracking on LeetCode
- [ ] Test submission tracking on GeeksforGeeks
- [ ] Test submission tracking on HackerRank
- [ ] Test submission tracking on InterviewBit

## Environment-Specific Deployment

### Development
```bash
firebase use development
firebase deploy
```

### Staging
```bash
firebase use staging
firebase deploy
```

### Production
```bash
firebase use production
firebase deploy
```

## Monitoring and Maintenance

### 1. Set up Monitoring
- [ ] Configure Firebase Analytics
- [ ] Set up error tracking
- [ ] Monitor function performance
- [ ] Set up alerts for critical issues

### 2. Regular Maintenance
- [ ] Monitor Firestore usage and costs
- [ ] Review and update security rules
- [ ] Clean up old files and data
- [ ] Update dependencies regularly

## Rollback Procedures

### 1. Rollback Functions
```bash
firebase functions:rollback
```

### 2. Rollback Hosting
```bash
firebase hosting:rollback
```

### 3. Rollback Firestore Rules
```bash
# Revert to previous version
firebase firestore:rules:rollback
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use Firebase Functions config for sensitive data
- Rotate API keys regularly
- Use different keys for different environments

### 2. Access Control
- Implement proper role-based access control
- Use Firebase Auth for user authentication
- Validate all inputs on both client and server
- Implement rate limiting

### 3. Data Protection
- Encrypt sensitive data
- Use HTTPS for all communications
- Implement proper backup strategies
- Follow GDPR compliance guidelines

## Troubleshooting

### Common Issues
1. **Functions deployment fails**: Check environment variables and dependencies
2. **Hosting deployment fails**: Verify build process and file permissions
3. **Firestore rules deployment fails**: Validate rule syntax
4. **Authentication issues**: Check Firebase Auth configuration

### Support Resources
- Firebase Documentation: https://firebase.google.com/docs
- Firebase Support: https://firebase.google.com/support
- Community Forums: https://firebase.google.com/community

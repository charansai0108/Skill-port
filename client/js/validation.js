/**
 * Input Validation and Sanitization Service
 * Provides comprehensive input validation and sanitization
 */

class ValidationService {
    constructor() {
        this.patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^\+?[\d\s\-\(\)]{10,}$/,
            username: /^[a-zA-Z0-9_]{3,20}$/,
            communityCode: /^[A-Z0-9]{3,10}$/,
            url: /^https?:\/\/.+/,
            alphanumeric: /^[a-zA-Z0-9]+$/,
            safeString: /^[a-zA-Z0-9\s\-_.,!?()]+$/
        };

        this.limits = {
            firstName: { min: 2, max: 50 },
            lastName: { min: 2, max: 50 },
            email: { max: 100 },
            bio: { max: 500 },
            title: { min: 3, max: 200 },
            description: { max: 1000 },
            code: { max: 10000 },
            communityName: { min: 3, max: 100 },
            communityCode: { min: 3, max: 10 }
        };
    }

    // Sanitize HTML content
    sanitizeHtml(input) {
        if (typeof input !== 'string') return input;
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Escape HTML entities
    escapeHtml(input) {
        if (typeof input !== 'string') return input;
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };
        
        return input.replace(/[&<>"'/]/g, (s) => map[s]);
    }

    // Sanitize user input
    sanitizeInput(input, type = 'text') {
        if (input === null || input === undefined) return '';
        
        if (typeof input !== 'string') {
            input = String(input);
        }

        // Trim whitespace
        input = input.trim();

        switch (type) {
            case 'html':
                return this.sanitizeHtml(input);
            case 'email':
                return input.toLowerCase();
            case 'code':
                return input; // Don't sanitize code content
            case 'url':
                return this.escapeHtml(input);
            default:
                return this.escapeHtml(input);
        }
    }

    // Validate email
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, error: 'Email is required' };
        }

        const sanitized = this.sanitizeInput(email, 'email');
        
        if (sanitized.length > this.limits.email.max) {
            return { valid: false, error: `Email must be less than ${this.limits.email.max} characters` };
        }

        if (!this.patterns.email.test(sanitized)) {
            return { valid: false, error: 'Please enter a valid email address' };
        }

        return { valid: true, value: sanitized };
    }

    // Validate password
    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, error: 'Password is required' };
        }

        if (password.length < 6) {
            return { valid: false, error: 'Password must be at least 6 characters long' };
        }

        if (password.length > 128) {
            return { valid: false, error: 'Password must be less than 128 characters' };
        }

        // Check for common weak passwords
        const weakPasswords = ['password', '123456', 'qwerty', 'abc123'];
        if (weakPasswords.includes(password.toLowerCase())) {
            return { valid: false, error: 'Password is too common, please choose a stronger password' };
        }

        return { valid: true, value: password };
    }

    // Validate name fields
    validateName(name, fieldName = 'Name') {
        if (!name || typeof name !== 'string') {
            return { valid: false, error: `${fieldName} is required` };
        }

        const sanitized = this.sanitizeInput(name);
        
        if (sanitized.length < 2) {
            return { valid: false, error: `${fieldName} must be at least 2 characters long` };
        }

        if (sanitized.length > 50) {
            return { valid: false, error: `${fieldName} must be less than 50 characters` };
        }

        if (!this.patterns.safeString.test(sanitized)) {
            return { valid: false, error: `${fieldName} contains invalid characters` };
        }

        return { valid: true, value: sanitized };
    }

    // Validate community data
    validateCommunity(communityData) {
        const errors = [];
        const sanitized = {};

        // Validate name
        const nameResult = this.validateName(communityData.name, 'Community name');
        if (!nameResult.valid) {
            errors.push(nameResult.error);
        } else {
            sanitized.name = nameResult.value;
        }

        // Validate code
        if (!communityData.code || typeof communityData.code !== 'string') {
            errors.push('Community code is required');
        } else {
            const code = communityData.code.toUpperCase().trim();
            if (code.length < this.limits.communityCode.min || code.length > this.limits.communityCode.max) {
                errors.push(`Community code must be between ${this.limits.communityCode.min} and ${this.limits.communityCode.max} characters`);
            } else if (!this.patterns.communityCode.test(code)) {
                errors.push('Community code must contain only uppercase letters and numbers');
            } else {
                sanitized.code = code;
            }
        }

        // Validate description
        if (communityData.description) {
            const desc = this.sanitizeInput(communityData.description);
            if (desc.length > this.limits.description.max) {
                errors.push(`Description must be less than ${this.limits.description.max} characters`);
            } else {
                sanitized.description = desc;
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            data: sanitized
        };
    }

    // Validate contest data
    validateContest(contestData) {
        const errors = [];
        const sanitized = {};

        // Validate title
        if (!contestData.title || typeof contestData.title !== 'string') {
            errors.push('Contest title is required');
        } else {
            const title = this.sanitizeInput(contestData.title);
            if (title.length < this.limits.title.min || title.length > this.limits.title.max) {
                errors.push(`Title must be between ${this.limits.title.min} and ${this.limits.title.max} characters`);
            } else {
                sanitized.title = title;
            }
        }

        // Validate dates
        if (contestData.startDate) {
            const startDate = new Date(contestData.startDate);
            if (isNaN(startDate.getTime())) {
                errors.push('Invalid start date');
            } else {
                sanitized.startDate = startDate;
            }
        }

        if (contestData.endDate) {
            const endDate = new Date(contestData.endDate);
            if (isNaN(endDate.getTime())) {
                errors.push('Invalid end date');
            } else {
                sanitized.endDate = endDate;
            }
        }

        // Validate description
        if (contestData.description) {
            const desc = this.sanitizeInput(contestData.description);
            if (desc.length > this.limits.description.max) {
                errors.push(`Description must be less than ${this.limits.description.max} characters`);
            } else {
                sanitized.description = desc;
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            data: sanitized
        };
    }

    // Validate submission data
    validateSubmission(submissionData) {
        const errors = [];
        const sanitized = {};

        // Validate title
        if (!submissionData.title || typeof submissionData.title !== 'string') {
            errors.push('Submission title is required');
        } else {
            const title = this.sanitizeInput(submissionData.title);
            if (title.length < 3 || title.length > this.limits.title.max) {
                errors.push(`Title must be between 3 and ${this.limits.title.max} characters`);
            } else {
                sanitized.title = title;
            }
        }

        // Validate code
        if (submissionData.code) {
            if (typeof submissionData.code !== 'string') {
                errors.push('Code must be a string');
            } else if (submissionData.code.length > this.limits.code.max) {
                errors.push(`Code must be less than ${this.limits.code.max} characters`);
            } else {
                sanitized.code = submissionData.code; // Don't sanitize code
            }
        }

        // Validate description
        if (submissionData.description) {
            const desc = this.sanitizeInput(submissionData.description);
            if (desc.length > this.limits.description.max) {
                errors.push(`Description must be less than ${this.limits.description.max} characters`);
            } else {
                sanitized.description = desc;
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            data: sanitized
        };
    }

    // Validate user profile data
    validateUserProfile(profileData) {
        const errors = [];
        const sanitized = {};

        // Validate first name
        const firstNameResult = this.validateName(profileData.firstName, 'First name');
        if (!firstNameResult.valid) {
            errors.push(firstNameResult.error);
        } else {
            sanitized.firstName = firstNameResult.value;
        }

        // Validate last name
        const lastNameResult = this.validateName(profileData.lastName, 'Last name');
        if (!lastNameResult.valid) {
            errors.push(lastNameResult.error);
        } else {
            sanitized.lastName = lastNameResult.value;
        }

        // Validate email
        const emailResult = this.validateEmail(profileData.email);
        if (!emailResult.valid) {
            errors.push(emailResult.error);
        } else {
            sanitized.email = emailResult.value;
        }

        // Validate bio
        if (profileData.bio) {
            const bio = this.sanitizeInput(profileData.bio);
            if (bio.length > this.limits.bio.max) {
                errors.push(`Bio must be less than ${this.limits.bio.max} characters`);
            } else {
                sanitized.bio = bio;
            }
        }

        // Validate CGPA
        if (profileData.cgpa !== undefined && profileData.cgpa !== null) {
            const cgpa = parseFloat(profileData.cgpa);
            if (isNaN(cgpa) || cgpa < 0 || cgpa > 4) {
                errors.push('CGPA must be between 0 and 4');
            } else {
                sanitized.cgpa = cgpa;
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            data: sanitized
        };
    }

    // Validate flag data
    validateFlag(flagData) {
        const errors = [];
        const sanitized = {};

        // Validate required fields
        const requiredFields = ['userId', 'platform', 'title', 'difficulty'];
        requiredFields.forEach(field => {
            if (!flagData[field]) {
                errors.push(`${field} is required`);
            }
        });

        if (errors.length > 0) {
            return { valid: false, errors, data: {} };
        }

        // Validate platform
        const validPlatforms = ['leetcode', 'geeksforgeeks', 'hackerrank', 'interviewbit'];
        if (!validPlatforms.includes(flagData.platform)) {
            errors.push('Invalid platform');
        } else {
            sanitized.platform = flagData.platform;
        }

        // Validate difficulty
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(flagData.difficulty)) {
            errors.push('Invalid difficulty level');
        } else {
            sanitized.difficulty = flagData.difficulty;
        }

        // Validate title
        const title = this.sanitizeInput(flagData.title);
        if (title.length < 1 || title.length > 200) {
            errors.push('Title must be between 1 and 200 characters');
        } else {
            sanitized.title = title;
        }

        // Validate code content
        if (flagData.codePrev && flagData.codePrev.length > this.limits.code.max) {
            errors.push(`Previous code must be less than ${this.limits.code.max} characters`);
        } else {
            sanitized.codePrev = flagData.codePrev || '';
        }

        if (flagData.codeCurr && flagData.codeCurr.length > this.limits.code.max) {
            errors.push(`Current code must be less than ${this.limits.code.max} characters`);
        } else {
            sanitized.codeCurr = flagData.codeCurr || '';
        }

        return {
            valid: errors.length === 0,
            errors,
            data: sanitized
        };
    }

    // Generic form validation
    validateForm(formData, rules) {
        const errors = {};
        const sanitized = {};

        Object.keys(rules).forEach(field => {
            const rule = rules[field];
            const value = formData[field];

            // Check required
            if (rule.required && (!value || value.toString().trim() === '')) {
                errors[field] = `${rule.label || field} is required`;
                return;
            }

            if (value !== undefined && value !== null && value.toString().trim() !== '') {
                // Sanitize input
                const sanitizedValue = this.sanitizeInput(value, rule.type || 'text');
                sanitized[field] = sanitizedValue;

                // Check length
                if (rule.minLength && sanitizedValue.length < rule.minLength) {
                    errors[field] = `${rule.label || field} must be at least ${rule.minLength} characters`;
                } else if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
                    errors[field] = `${rule.label || field} must be less than ${rule.maxLength} characters`;
                }

                // Check pattern
                if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
                    errors[field] = rule.patternError || `${rule.label || field} format is invalid`;
                }
            }
        });

        return {
            valid: Object.keys(errors).length === 0,
            errors,
            data: sanitized
        };
    }
}

// Create and export singleton instance
const validationService = new ValidationService();
export default validationService;

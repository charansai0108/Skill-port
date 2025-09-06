describe('Personal User Signup Flow', () => {
  beforeEach(() => {
    // Visit the registration page
    cy.visit('/pages/auth/register.html');
  });

  it('should complete personal user registration flow', () => {
    // Fill out personal registration form
    cy.get('#firstName').type('John');
    cy.get('#lastName').type('Doe');
    cy.get('#email').type('john.doe@example.com');
    cy.get('#role').select('personal');
    cy.get('#experience').select('intermediate');
    cy.get('#bio').type('I am a software developer interested in learning new technologies.');
    cy.get('#agreeTerms').check();

    // Submit the form
    cy.get('#personalForm').submit();

    // Should show OTP form
    cy.get('#otpForm').should('be.visible');
    cy.get('#otp').should('be.visible');

    // Enter OTP (in real scenario, this would come from email)
    cy.get('#otp').type('123456');
    cy.get('#otpForm').submit();

    // Should redirect to personal dashboard
    cy.url().should('include', '/pages/personal/dashboard.html');
    cy.get('h1').should('contain', 'Personal Dashboard');
  });

  it('should show validation errors for invalid input', () => {
    // Try to submit with invalid data
    cy.get('#firstName').type('J'); // Too short
    cy.get('#email').type('invalid-email'); // Invalid email
    cy.get('#personalForm').submit();

    // Should show validation errors
    cy.get('.error-message').should('be.visible');
  });

  it('should not allow registration with existing email', () => {
    // First, register a user
    cy.get('#firstName').type('John');
    cy.get('#lastName').type('Doe');
    cy.get('#email').type('existing@example.com');
    cy.get('#role').select('personal');
    cy.get('#experience').select('intermediate');
    cy.get('#agreeTerms').check();
    cy.get('#personalForm').submit();

    // Go back to registration
    cy.visit('/pages/auth/register.html');

    // Try to register with same email
    cy.get('#firstName').type('Jane');
    cy.get('#lastName').type('Smith');
    cy.get('#email').type('existing@example.com');
    cy.get('#role').select('personal');
    cy.get('#experience').select('beginner');
    cy.get('#agreeTerms').check();
    cy.get('#personalForm').submit();

    // Should show error message
    cy.get('.error-message').should('contain', 'Email is already registered');
  });
});

describe('Community Admin Registration Flow', () => {
  beforeEach(() => {
    cy.visit('/pages/auth/register.html');
  });

  it('should complete community admin registration flow', () => {
    // Select community admin role
    cy.get('#role').select('community-admin');

    // Fill out community admin form
    cy.get('#firstName').type('Admin');
    cy.get('#lastName').type('User');
    cy.get('#email').type('admin@example.com');
    cy.get('#communityName').type('Test Community');
    cy.get('#communityCode').type('TEST123');
    cy.get('#communityDescription').type('A test community for development');
    cy.get('#agreeTerms').check();

    // Submit the form
    cy.get('#communityForm').submit();

    // Should show OTP form
    cy.get('#otpForm').should('be.visible');
    cy.get('#otp').type('123456');
    cy.get('#otpForm').submit();

    // Should redirect to admin dashboard
    cy.url().should('include', '/pages/admin/dashboard.html');
    cy.get('h1').should('contain', 'Admin Dashboard');
  });

  it('should validate community code format', () => {
    cy.get('#role').select('community-admin');
    cy.get('#communityCode').type('invalid code'); // Invalid format
    cy.get('#communityForm').submit();

    cy.get('.error-message').should('contain', 'Community code must be 2-10 uppercase letters/numbers');
  });
});

describe('Login Flow', () => {
  beforeEach(() => {
    // First register a user
    cy.visit('/pages/auth/register.html');
    cy.get('#firstName').type('John');
    cy.get('#lastName').type('Doe');
    cy.get('#email').type('john.doe@example.com');
    cy.get('#role').select('personal');
    cy.get('#experience').select('intermediate');
    cy.get('#agreeTerms').check();
    cy.get('#personalForm').submit();
    cy.get('#otp').type('123456');
    cy.get('#otpForm').submit();
  });

  it('should login successfully and redirect to dashboard', () => {
    // Visit login page
    cy.visit('/pages/auth/login.html');

    // Fill login form
    cy.get('#email').type('john.doe@example.com');
    cy.get('#password').type('password123');
    cy.get('#loginForm').submit();

    // Should redirect to personal dashboard
    cy.url().should('include', '/pages/personal/dashboard.html');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/pages/auth/login.html');
    cy.get('#email').type('john.doe@example.com');
    cy.get('#password').type('wrongpassword');
    cy.get('#loginForm').submit();

    cy.get('.error-message').should('contain', 'Invalid credentials');
  });
});

describe('Join Community Flow', () => {
  beforeEach(() => {
    // Login as personal user
    cy.visit('/pages/auth/login.html');
    cy.get('#email').type('john.doe@example.com');
    cy.get('#password').type('password123');
    cy.get('#loginForm').submit();
  });

  it('should complete join community flow', () => {
    // Visit communities page
    cy.visit('/pages/personal/communities.html');

    // Click join community button
    cy.get('.join-community-btn').first().click();

    // Fill join form
    cy.get('#joinEmail').type('student@example.com');
    cy.get('#joinSubmitButton').click();

    // Should proceed to password setup
    cy.get('#passwordFields').should('be.visible');
    cy.get('#joinPassword').type('newpassword123');
    cy.get('#joinConfirmPassword').type('newpassword123');
    cy.get('#joinSubmitButton').click();

    // Should proceed to OTP verification
    cy.get('#otpField').should('be.visible');
    cy.get('#joinOtp').type('123456');
    cy.get('#joinSubmitButton').click();

    // Should redirect to community dashboard
    cy.url().should('include', '/pages/student/dashboard.html');
  });
});

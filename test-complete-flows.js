/**
 * Complete Flow Test Script
 * Tests all authentication and authorization flows
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api/v1';
const FRONTEND_URL = 'http://localhost:8000';

class FlowTester {
    constructor() {
        this.results = [];
        this.testData = {
            personalUser: {
                firstName: 'Test',
                lastName: 'Personal',
                email: 'test.personal@example.com',
                password: 'TestPass123!',
                role: 'personal',
                experience: 'intermediate',
                skills: ['JavaScript', 'Python'],
                bio: 'Test personal user'
            },
            communityAdmin: {
                firstName: 'Test',
                lastName: 'Admin',
                email: 'test.admin@example.com',
                password: 'TestPass123!',
                role: 'community-admin',
                communityName: 'Test Community',
                communityCode: 'TEST123',
                communityDescription: 'A test community for testing'
            },
            mentor: {
                firstName: 'Test',
                lastName: 'Mentor',
                email: 'test.mentor@example.com',
                password: 'TestPass123!',
                expertise: ['Algorithms', 'Data Structures'],
                yearsOfExperience: 5
            },
            student: {
                firstName: 'Test',
                lastName: 'Student',
                email: 'test.student@example.com',
                password: 'TestPass123!',
                batch: 'Batch A'
            }
        };
    }

    async runTest(testName, testFunction) {
        console.log(`\n🧪 Running test: ${testName}`);
        try {
            const result = await testFunction();
            this.results.push({ test: testName, status: 'PASS', result });
            console.log(`✅ ${testName}: PASSED`);
            return result;
        } catch (error) {
            this.results.push({ test: testName, status: 'FAIL', error: error.message });
            console.log(`❌ ${testName}: FAILED - ${error.message}`);
            return null;
        }
    }

    async testPersonalSignup() {
        const response = await axios.post(`${BASE_URL}/auth/register`, this.testData.personalUser);
        if (response.data.success) {
            console.log('   📧 Registration initiated, OTP sent');
            return response.data;
        }
        throw new Error('Personal signup failed');
    }

    async testCommunityAdminSignup() {
        const response = await axios.post(`${BASE_URL}/auth/register`, this.testData.communityAdmin);
        if (response.data.success) {
            console.log('   📧 Admin registration initiated, OTP sent');
            return response.data;
        }
        throw new Error('Community admin signup failed');
    }

    async testOTPVerification(email, otp = '123456') {
        const response = await axios.post(`${BASE_URL}/auth/verify-otp`, {
            email,
            otp,
            password: this.testData.personalUser.password
        });
        if (response.data.success) {
            console.log('   ✅ OTP verified successfully');
            return response.data;
        }
        throw new Error('OTP verification failed');
    }

    async testLogin(email, password) {
        const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
        if (response.data.success) {
            console.log('   🔐 Login successful');
            return response.data;
        }
        throw new Error('Login failed');
    }

    async testGetUserProfile() {
        const response = await axios.get(`${BASE_URL}/users/profile`, {
            withCredentials: true
        });
        if (response.data.success) {
            console.log('   👤 User profile retrieved');
            return response.data;
        }
        throw new Error('Get user profile failed');
    }

    async testGetCommunities() {
        const response = await axios.get(`${BASE_URL}/communities`);
        if (response.data.success) {
            console.log(`   🏘️  Found ${response.data.count} communities`);
            return response.data;
        }
        throw new Error('Get communities failed');
    }

    async testJoinCommunity() {
        const response = await axios.post(`${BASE_URL}/auth/join-community`, {
            email: this.testData.student.email,
            password: this.testData.student.password,
            confirmPassword: this.testData.student.password,
            communityCode: 'TEST123'
        });
        if (response.data.success) {
            console.log('   🎯 Community join initiated');
            return response.data;
        }
        throw new Error('Join community failed');
    }

    async testAddMentor(communityId) {
        const response = await axios.post(`${BASE_URL}/community/${communityId}/mentors`, this.testData.mentor, {
            withCredentials: true
        });
        if (response.data.success) {
            console.log('   👨‍🏫 Mentor added successfully');
            return response.data;
        }
        throw new Error('Add mentor failed');
    }

    async testAddStudent(communityId) {
        const response = await axios.post(`${BASE_URL}/community/${communityId}/students`, {
            email: this.testData.student.email,
            firstName: this.testData.student.firstName,
            lastName: this.testData.student.lastName,
            batch: this.testData.student.batch
        }, {
            withCredentials: true
        });
        if (response.data.success) {
            console.log('   👨‍🎓 Student pre-registered successfully');
            return response.data;
        }
        throw new Error('Add student failed');
    }

    async testCreateContest(communityId) {
        const contestData = {
            title: 'Test Contest',
            description: 'A test contest for testing',
            assignedMentor: 'mentor_id_here', // Would need actual mentor ID
            assignedBatch: 'Batch A',
            startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
            duration: 120,
            problems: [{
                title: 'Test Problem',
                description: 'Solve this test problem',
                difficulty: 'easy',
                points: 100,
                testCases: [{
                    input: '1 2',
                    expectedOutput: '3',
                    isHidden: false
                }],
                constraints: '1 <= n <= 100',
                sampleInput: '1 2',
                sampleOutput: '3'
            }]
        };

        const response = await axios.post(`${BASE_URL}/contests`, contestData, {
            withCredentials: true
        });
        if (response.data.success) {
            console.log('   🏆 Contest created successfully');
            return response.data;
        }
        throw new Error('Create contest failed');
    }

    async runAllTests() {
        console.log('🚀 Starting Complete Flow Tests\n');
        
        // Test 1: Personal User Signup
        await this.runTest('Personal User Signup', () => this.testPersonalSignup());
        
        // Test 2: Community Admin Signup
        const adminResult = await this.runTest('Community Admin Signup', () => this.testCommunityAdminSignup());
        
        // Test 3: OTP Verification (Personal)
        await this.runTest('OTP Verification (Personal)', () => 
            this.testOTPVerification(this.testData.personalUser.email));
        
        // Test 4: OTP Verification (Admin)
        await this.runTest('OTP Verification (Admin)', () => 
            this.testOTPVerification(this.testData.communityAdmin.email));
        
        // Test 5: Personal User Login
        await this.runTest('Personal User Login', () => 
            this.testLogin(this.testData.personalUser.email, this.testData.personalUser.password));
        
        // Test 6: Admin Login
        await this.runTest('Admin Login', () => 
            this.testLogin(this.testData.communityAdmin.email, this.testData.communityAdmin.password));
        
        // Test 7: Get User Profile
        await this.runTest('Get User Profile', () => this.testGetUserProfile());
        
        // Test 8: Get Communities
        await this.runTest('Get Communities', () => this.testGetCommunities());
        
        // Test 9: Join Community (if community exists)
        if (adminResult && adminResult.data.communityId) {
            await this.runTest('Join Community', () => this.testJoinCommunity());
        }
        
        // Test 10: Add Mentor (if admin is logged in)
        if (adminResult && adminResult.data.communityId) {
            await this.runTest('Add Mentor', () => 
                this.testAddMentor(adminResult.data.communityId));
        }
        
        // Test 11: Add Student (if admin is logged in)
        if (adminResult && adminResult.data.communityId) {
            await this.runTest('Add Student', () => 
                this.testAddStudent(adminResult.data.communityId));
        }
        
        // Test 12: Create Contest (if admin is logged in)
        if (adminResult && adminResult.data.communityId) {
            await this.runTest('Create Contest', () => 
                this.testCreateContest(adminResult.data.communityId));
        }
        
        this.printResults();
    }

    printResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
        
        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.filter(r => r.status === 'FAIL').forEach(test => {
                console.log(`   - ${test.test}: ${test.error}`);
            });
        }
        
        console.log('\n🎯 Overall Status:', failed === 0 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new FlowTester();
    tester.runAllTests().catch(console.error);
}

module.exports = FlowTester;

#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { exec } = require('child_process');

class AppTester {
    constructor() {
        this.results = {
            otpServer: false,
            firebaseEmulators: false,
            frontendHosting: false,
            databaseConnection: false,
            apiEndpoints: false
        };
    }

    async runTests() {
        console.log('🧪 Starting SkillPort Community App Testing...\n');
        
        try {
            await this.testOTPServer();
            await this.testFirebaseEmulators();
            await this.testFrontendHosting();
            await this.testDatabaseConnection();
            await this.testAPIEndpoints();
            
            this.printResults();
            
        } catch (error) {
            console.error('❌ Error during testing:', error);
        }
    }

    async testOTPServer() {
        console.log('🔍 Testing OTP Server...');
        
        try {
            const response = await this.makeRequest('http://localhost:3001/health');
            if (response.statusCode === 200) {
                console.log('   ✅ OTP Server is running');
                this.results.otpServer = true;
            } else {
                console.log('   ❌ OTP Server returned status:', response.statusCode);
            }
        } catch (error) {
            console.log('   ❌ OTP Server not accessible:', error.message);
        }
    }

    async testFirebaseEmulators() {
        console.log('🔍 Testing Firebase Emulators...');
        
        try {
            const response = await this.makeRequest('http://localhost:4000');
            if (response.statusCode === 200) {
                console.log('   ✅ Firebase Emulator UI is accessible');
                this.results.firebaseEmulators = true;
            } else {
                console.log('   ❌ Firebase Emulator UI returned status:', response.statusCode);
            }
        } catch (error) {
            console.log('   ❌ Firebase Emulator UI not accessible:', error.message);
        }
    }

    async testFrontendHosting() {
        console.log('🔍 Testing Frontend Hosting...');
        
        try {
            const response = await this.makeRequest('http://localhost:8000');
            if (response.statusCode === 200) {
                console.log('   ✅ Frontend Hosting is accessible');
                this.results.frontendHosting = true;
            } else {
                console.log('   ❌ Frontend Hosting returned status:', response.statusCode);
            }
        } catch (error) {
            console.log('   ❌ Frontend Hosting not accessible:', error.message);
        }
    }

    async testDatabaseConnection() {
        console.log('🔍 Testing Database Connection...');
        
        try {
            const response = await this.makeRequest('http://localhost:8080');
            if (response.statusCode === 200) {
                console.log('   ✅ Firestore Emulator is accessible');
                this.results.databaseConnection = true;
            } else {
                console.log('   ❌ Firestore Emulator returned status:', response.statusCode);
            }
        } catch (error) {
            console.log('   ❌ Firestore Emulator not accessible:', error.message);
        }
    }

    async testAPIEndpoints() {
        console.log('🔍 Testing API Endpoints...');
        
        try {
            const response = await this.makeRequest('http://localhost:5001');
            if (response.statusCode === 200) {
                console.log('   ✅ Functions Emulator is accessible');
                this.results.apiEndpoints = true;
            } else {
                console.log('   ❌ Functions Emulator returned status:', response.statusCode);
            }
        } catch (error) {
            console.log('   ❌ Functions Emulator not accessible:', error.message);
        }
    }

    makeRequest(url) {
        return new Promise((resolve, reject) => {
            const client = url.startsWith('https') ? https : http;
            const req = client.get(url, (res) => {
                resolve(res);
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    printResults() {
        console.log('\n📊 TESTING RESULTS');
        console.log('==================');
        
        const totalTests = Object.keys(this.results).length;
        const passedTests = Object.values(this.results).filter(Boolean).length;
        const passRate = Math.round((passedTests / totalTests) * 100);
        
        console.log(`\n📈 Overall Results: ${passedTests}/${totalTests} tests passed (${passRate}%)`);
        
        console.log('\n🔍 Detailed Results:');
        Object.entries(this.results).forEach(([test, passed]) => {
            const status = passed ? '✅' : '❌';
            const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
            console.log(`   ${status} ${testName}`);
        });
        
        if (passRate === 100) {
            console.log('\n🎉 All tests passed! Your app is ready for use.');
        } else if (passRate >= 80) {
            console.log('\n🟡 Most tests passed. Some issues need attention.');
        } else if (passRate >= 50) {
            console.log('\n🟠 Some tests passed. Several issues need fixing.');
        } else {
            console.log('\n🔴 Many tests failed. Significant issues need to be addressed.');
        }
        
        this.printRecommendations();
    }

    printRecommendations() {
        console.log('\n💡 RECOMMENDATIONS');
        console.log('==================');
        
        if (!this.results.otpServer) {
            console.log('🔧 OTP Server Issues:');
            console.log('   - Check if OTP server is running: npm start');
            console.log('   - Verify port 3001 is not in use');
            console.log('   - Check OTP server logs for errors');
        }
        
        if (!this.results.firebaseEmulators) {
            console.log('🔧 Firebase Emulator Issues:');
            console.log('   - Start emulators: npm run emulator');
            console.log('   - Check Firebase CLI version: firebase --version');
            console.log('   - Verify firebase.json configuration');
        }
        
        if (!this.results.frontendHosting) {
            console.log('🔧 Frontend Hosting Issues:');
            console.log('   - Start Firebase hosting: firebase emulators:start --only hosting');
            console.log('   - Check client/ directory exists');
            console.log('   - Verify hosting configuration in firebase.json');
        }
        
        if (!this.results.databaseConnection) {
            console.log('🔧 Database Connection Issues:');
            console.log('   - Start Firestore emulator: firebase emulators:start --only firestore');
            console.log('   - Check firestore.rules file');
            console.log('   - Verify database configuration');
        }
        
        if (!this.results.apiEndpoints) {
            console.log('🔧 API Endpoints Issues:');
            console.log('   - Start Functions emulator: firebase emulators:start --only functions');
            console.log('   - Check functions/ directory');
            console.log('   - Verify function configuration');
        }
        
        console.log('\n🚀 QUICK START COMMANDS');
        console.log('========================');
        console.log('1. Start OTP Server:');
        console.log('   npm start');
        console.log('');
        console.log('2. Start Firebase Emulators:');
        console.log('   npm run emulator');
        console.log('');
        console.log('3. Test the app:');
        console.log('   node scripts/test-app.js');
        console.log('');
        console.log('4. Access the app:');
        console.log('   Frontend: http://localhost:8000');
        console.log('   OTP Server: http://localhost:3001');
        console.log('   Emulator UI: http://localhost:4000');
    }
}

// Main execution
async function main() {
    const tester = new AppTester();
    await tester.runTests();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AppTester;

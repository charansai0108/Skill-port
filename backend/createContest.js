const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Contest = require('./models/Contest');
const Community = require('./models/Community');
const User = require('./models/User');

// Connect to database
const connectDB = require('./config/database');

const createContest = async () => {
    try {
        await connectDB();
        console.log('🔄 Creating contests...');

        // Get community and admin
        const community = await Community.findOne({ code: 'SKILLPORT' });
        const admin = await User.findOne({ email: 'admin@skillport.com' });
        const students = await User.find({ role: 'student', community: community._id }).limit(5);

        if (!community || !admin) {
            console.error('❌ Community or admin not found');
            process.exit(1);
        }

        // Create a simple contest
        const contest = await Contest.create({
            title: 'Programming Fundamentals Contest',
            description: 'Basic programming concepts and problem-solving',
            community: community._id,
            createdBy: admin._id,
            type: 'individual',
            difficulty: 'beginner',
            category: 'algorithms',
            
            // Timing
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            endTime: new Date(Date.now() + 27 * 60 * 60 * 1000),   // 3 days from now
            duration: 180, // 3 hours
            
            // Registration
            registrationStart: new Date(),
            registrationEnd: new Date(Date.now() + 23 * 60 * 60 * 1000), // 23 hours from now
            maxParticipants: 50,
            
            // Rules
            rules: {
                allowedLanguages: ['javascript', 'python', 'java', 'cpp'],
                scoringSystem: 'icpc',
                penaltyPerWrongSubmission: 20,
                allowPartialScoring: false,
                allowClarifications: true
            },
            
            // Problems
            problems: [
                {
                    title: 'Problem 1: Array Sum',
                    description: 'Calculate the sum of all elements in an array',
                    difficulty: 'easy',
                    points: 100,
                    testCases: [
                        { input: '[1,2,3,4,5]', expectedOutput: '15' },
                        { input: '[2,4,6,8]', expectedOutput: '20' }
                    ]
                },
                {
                    title: 'Problem 2: String Reverse',
                    description: 'Reverse a given string',
                    difficulty: 'easy',
                    points: 150,
                    testCases: [
                        { input: 'hello', expectedOutput: 'olleh' },
                        { input: 'skillport', expectedOutput: 'troplliks' }
                    ]
                }
            ],
            
            // Status
            status: 'published'
        });

        console.log('✅ Contest created successfully!');
        console.log(`🏆 Title: ${contest.title}`);
        console.log(`📅 Start: ${contest.startTime}`);
        console.log(`⏱️  Duration: ${contest.duration} minutes`);
        console.log(`🔢 Problems: ${contest.problems.length}`);
        console.log(`👥 Max Participants: ${contest.maxParticipants}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating contest:', error.message);
        process.exit(1);
    }
};

createContest();

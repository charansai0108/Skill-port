/**
 * Test Data Seeder
 * Creates sample data for development and testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const User = require('./models/User');
const Community = require('./models/Community');
const Contest = require('./models/Contest');
const Progress = require('./models/Progress');

// Connect to database
const connectDB = require('./config/database');
connectDB();

const seedTestData = async () => {
    try {
        console.log('🌱 Starting test data seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Community.deleteMany({});
        await Contest.deleteMany({});
        await Progress.deleteMany({});
        console.log('🧹 Cleared existing data');

        // Create test community
        const testCommunity = await Community.create({
            name: 'SkillPort Academy',
            code: 'SKILLPORT',
            description: 'Official SkillPort Academy Community for learning and development',
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            status: 'active',
            isPublic: true,
            allowSelfRegistration: true,
            maxStudents: 1000,
            maxMentors: 50,
            maxBatches: 20,
            features: {
                contests: true,
                leaderboard: true,
                certificates: true,
                mentorship: true,
                projects: true,
                discussions: true,
                analytics: true
            }
        });
        console.log('🏢 Created test community:', testCommunity.name);

        // Create community admin
        const admin = await User.create({
            firstName: 'Test',
            lastName: 'Admin',
            email: 'admin@test.com',
            password: 'Test123!', // Let the pre-save hook hash it
            role: 'community-admin',
            community: testCommunity._id,
            status: 'active',
            isEmailVerified: true,
            studentId: 'ADMIN001'
        });

        // Update community with admin reference
        testCommunity.admin = admin._id;
        await testCommunity.save();
        console.log('👑 Created community admin:', admin.email);

        // Create test mentors
        const mentors = [];
        const mentorData = [
            { firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@test.com', expertise: ['Algorithms', 'Data Structures'] },
            { firstName: 'Alex', lastName: 'Chen', email: 'alex@test.com', expertise: ['Dynamic Programming', 'Graph Theory'] },
            { firstName: 'Emily', lastName: 'Davis', email: 'emily@test.com', expertise: ['String Manipulation', 'Array Processing'] },
            { firstName: 'Michael', lastName: 'Brown', email: 'michael@test.com', expertise: ['Backend Development', 'Database Design'] },
            { firstName: 'Lisa', lastName: 'Garcia', email: 'lisa@test.com', expertise: ['Frontend Development', 'UI/UX Design'] }
        ];

        for (let i = 0; i < mentorData.length; i++) {
            const mentor = await User.create({
                firstName: mentorData[i].firstName,
                lastName: mentorData[i].lastName,
                email: mentorData[i].email,
                password: 'Test123!', // Let the pre-save hook hash it
                role: 'mentor',
                community: testCommunity._id,
                status: 'active',
                isEmailVerified: true,
                expertise: mentorData[i].expertise,
                contestPerformance: {
                    problemsSolved: Math.floor(Math.random() * 50) + 20,
                    studentsHelped: Math.floor(Math.random() * 30) + 10
                },
                studentId: `MENTOR${String(i + 1).padStart(3, '0')}`
            });
            mentors.push(mentor);
        }
        console.log('🎓 Created', mentors.length, 'mentors');

        // Create test students
        const students = [];
        const studentData = [
            { firstName: 'John', lastName: 'Doe', email: 'john@test.com', batch: '2024-1' },
            { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', batch: '2024-1' },
            { firstName: 'Mike', lastName: 'Johnson', email: 'mike@test.com', batch: '2024-1' },
            { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.student@test.com', batch: '2024-1' },
            { firstName: 'David', lastName: 'Brown', email: 'david@test.com', batch: '2024-2' },
            { firstName: 'Emma', lastName: 'Davis', email: 'emma@test.com', batch: '2024-2' },
            { firstName: 'Chris', lastName: 'Miller', email: 'chris@test.com', batch: '2024-2' },
            { firstName: 'Anna', lastName: 'Wilson', email: 'anna@test.com', batch: '2024-2' },
            { firstName: 'Tom', lastName: 'Moore', email: 'tom@test.com', batch: '2024-3' },
            { firstName: 'Lisa', lastName: 'Taylor', email: 'lisa.student@test.com', batch: '2024-3' }
        ];

        for (let i = 0; i < studentData.length; i++) {
            const student = await User.create({
                firstName: studentData[i].firstName,
                lastName: studentData[i].lastName,
                email: studentData[i].email,
                password: 'Test123!', // Let the pre-save hook hash it
                role: 'student',
                community: testCommunity._id,
                batch: studentData[i].batch,
                status: 'active',
                isEmailVerified: true,
                totalPoints: Math.floor(Math.random() * 1000) + 100,
                studentId: `STU${String(i + 1).padStart(3, '0')}`
            });
            students.push(student);
        }
        console.log('🎓 Created', students.length, 'students');

        // Create test contests
        const contests = [];
        const contestData = [
            { title: 'Array Problems Challenge', description: 'Solve various array manipulation problems', difficulty: 'beginner' },
            { title: 'String Manipulation Contest', description: 'Master string processing techniques', difficulty: 'intermediate' },
            { title: 'Dynamic Programming Mastery', description: 'Advanced DP problems and solutions', difficulty: 'advanced' },
            { title: 'Graph Theory Fundamentals', description: 'Learn graph algorithms and traversal', difficulty: 'intermediate' },
            { title: 'Algorithm Optimization', description: 'Optimize time and space complexity', difficulty: 'advanced' }
        ];

        for (let i = 0; i < contestData.length; i++) {
            const startTime = new Date(Date.now() + (i * 24 * 60 * 60 * 1000));
            const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration
            const registrationStart = new Date(startTime.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days before
            const registrationEnd = new Date(startTime.getTime() - (1 * 60 * 60 * 1000)); // 1 hour before

            const contest = await Contest.create({
                title: contestData[i].title,
                description: contestData[i].description,
                difficulty: contestData[i].difficulty,
                community: testCommunity._id,
                createdBy: admin._id,
                status: i < 3 ? 'published' : 'registration_open',
                startTime: startTime,
                endTime: endTime,
                duration: 120, // 2 hours in minutes
                registrationStart: registrationStart,
                registrationEnd: registrationEnd,
                maxParticipants: 100,
                problems: [
                    {
                        title: `Problem ${i + 1}.1`,
                        description: `Sample problem ${i + 1}.1 description`,
                        difficulty: 'easy',
                        points: 100
                    },
                    {
                        title: `Problem ${i + 1}.2`,
                        description: `Sample problem ${i + 1}.2 description`,
                        difficulty: 'medium',
                        points: 200
                    }
                ]
            });
            contests.push(contest);
        }
        console.log('🏆 Created', contests.length, 'contests');

        // Create test progress records
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const contest = contests[Math.floor(Math.random() * contests.length)];
            
            await Progress.create({
                user: student._id,
                contest: contest._id,
                community: testCommunity._id,
                type: 'contest',
                problemsSolved: Math.floor(Math.random() * 5) + 1,
                totalPoints: Math.floor(Math.random() * 500) + 100,
                timeSpent: Math.floor(Math.random() * 120) + 30, // minutes
                status: 'completed',
                submissions: [
                    {
                        problemId: contest.problems[0]._id,
                        status: 'accepted',
                        points: contest.problems[0].points,
                        submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
                    }
                ]
            });
        }
        console.log('📊 Created progress records for students');

        console.log('✅ Test data seeding completed successfully!');
        console.log('\n📋 Test Accounts Created:');
        console.log('👑 Admin: admin@test.com / Test123!');
        console.log('🎓 Mentors: sarah@test.com, alex@test.com, emily@test.com, michael@test.com, lisa@test.com / Test123!');
        console.log('🎓 Students: john@test.com, jane@test.com, mike@test.com, sarah.student@test.com, david@test.com / Test123!');
        console.log('\n🏢 Community: SkillPort Academy (TEST)');
        console.log('🏆 Contests: 5 contests created');
        console.log('📊 Progress: Student progress records created');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding test data:', error);
        process.exit(1);
    }
};

// Run the seeder
seedTestData();

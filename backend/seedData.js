const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Community = require('./models/Community');
const Contest = require('./models/Contest');
const Project = require('./models/Project');
const Progress = require('./models/Progress');

// Connect to database
const connectDB = require('./config/database');

const seedData = async () => {
    try {
        await connectDB();
        console.log('🔄 Starting database seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Community.deleteMany({});
        await Contest.deleteMany({});
        await Project.deleteMany({});
        await Progress.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // 1. Create Community first (without admin)
        const community = await Community.create({
            name: 'SkillPort Academy',
            code: 'SKILLPORT',
            description: 'Official SkillPort Academy Community',
            status: 'active',
            isPublic: true,
            batches: [
                {
                    name: 'Batch 2024-A',
                    code: 'B24A',
                    description: 'First batch of 2024',
                    status: 'active',
                    maxStudents: 50
                },
                {
                    name: 'Batch 2024-B',
                    code: 'B24B',
                    description: 'Second batch of 2024',
                    status: 'active',
                    maxStudents: 45
                }
            ],
            stats: {
                totalStudents: 0,
                totalMentors: 0,
                totalContests: 0,
                totalProjects: 0
            }
        });

        // 2. Create Community Admin with community reference
        const adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@skillport.com',
            password: 'admin123',
            role: 'community-admin',
            community: community._id,
            status: 'active',
            isEmailVerified: true
        });

        // Update community admin reference
        community.admin = adminUser._id;
        await community.save();

        // 3. Create Personal Users
        const personalUsers = [];
        for (let i = 1; i <= 5; i++) {
            const user = await User.create({
                firstName: `Student${i}`,
                lastName: 'User',
                email: `student${i}@example.com`,
                password: 'student123',
                role: 'personal',
                status: 'active',
                isEmailVerified: true
            });
            personalUsers.push(user);
        }

        // 4. Create Mentors in Community
        const mentors = [];
        for (let i = 1; i <= 3; i++) {
            const mentor = await User.create({
                firstName: `Mentor${i}`,
                lastName: 'Expert',
                email: `mentor${i}@skillport.com`,
                password: 'mentor123',
                role: 'mentor',
                community: community._id,
                batch: i <= 2 ? 'Batch 2024-A' : 'Batch 2024-B',
                status: 'active',
                isEmailVerified: true
            });
            mentors.push(mentor);
        }

        // 5. Create Students in Community
        const students = [];
        for (let i = 1; i <= 10; i++) {
            const student = await User.create({
                firstName: `Student${i}`,
                lastName: 'Learner',
                email: `student${i}@skillport.com`,
                password: 'student123',
                role: 'student',
                community: community._id,
                batch: i <= 5 ? 'Batch 2024-A' : 'Batch 2024-B',
                status: 'active',
                isEmailVerified: true
            });
            students.push(student);
        }

        // 6. Create Contests
        const contests = [];
        for (let i = 1; i <= 5; i++) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + (i * 7)); // Each contest starts 1 week apart
            
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 3); // Each contest lasts 3 days

            const contest = await Contest.create({
                title: `Programming Contest ${i}`,
                description: `Comprehensive programming contest ${i} covering multiple algorithms and data structures`,
                community: community._id,
                createdBy: adminUser._id,
                startDate: startDate,
                endDate: endDate,
                status: i === 1 ? 'active' : 'upcoming',
                problems: [
                    {
                        title: `Problem ${i}A: Array Manipulation`,
                        description: `Solve array manipulation challenges`,
                        difficulty: 'medium',
                        points: 100,
                        testCases: [
                            { input: '[1,2,3,4,5]', expectedOutput: '15' },
                            { input: '[2,4,6,8]', expectedOutput: '20' }
                        ]
                    },
                    {
                        title: `Problem ${i}B: String Processing`,
                        description: `Process strings efficiently`,
                        difficulty: 'hard',
                        points: 200,
                        testCases: [
                            { input: 'hello world', expectedOutput: 'dlrow olleh' },
                            { input: 'skillport', expectedOutput: 'troplliks' }
                        ]
                    }
                ],
                participants: students.slice(0, 8).map(s => s._id),
                leaderboard: students.slice(0, 5).map((s, idx) => ({
                    user: s._id,
                    score: 300 - (idx * 50),
                    rank: idx + 1,
                    submissionTime: new Date()
                }))
            });
            contests.push(contest);
        }

        // 7. Create Projects
        const projects = [];
        for (let i = 1; i <= 8; i++) {
            const project = await Project.create({
                title: `Project ${i}: ${['Web App', 'Mobile App', 'API Service', 'Data Analysis', 'Machine Learning', 'Game Dev', 'Desktop App', 'IoT Solution'][i-1]}`,
                description: `Comprehensive project ${i} demonstrating real-world application development`,
                owner: students[i % students.length]._id,
                community: community._id,
                category: ['web', 'mobile', 'backend', 'data-science', 'ai-ml', 'game-dev', 'desktop', 'iot'][i-1],
                status: ['active', 'completed', 'active', 'completed', 'active', 'active', 'completed', 'active'][i-1],
                visibility: 'public',
                technologies: [
                    ['React', 'Node.js', 'MongoDB'],
                    ['React Native', 'Firebase'],
                    ['Express', 'PostgreSQL', 'Redis'],
                    ['Python', 'Pandas', 'Matplotlib'],
                    ['TensorFlow', 'Python', 'Jupyter'],
                    ['Unity', 'C#'],
                    ['Electron', 'JavaScript'],
                    ['Arduino', 'C++', 'Sensors']
                ][i-1],
                features: [
                    { title: 'Authentication System', completed: true },
                    { title: 'Core Functionality', completed: i <= 3 },
                    { title: 'Advanced Features', completed: false },
                    { title: 'Testing & Documentation', completed: i <= 2 }
                ],
                milestones: [
                    { title: 'Project Setup', completed: true, dueDate: new Date() },
                    { title: 'MVP Development', completed: i <= 4, dueDate: new Date(Date.now() + 7*24*60*60*1000) },
                    { title: 'Feature Complete', completed: i <= 2, dueDate: new Date(Date.now() + 14*24*60*60*1000) }
                ],
                collaborators: i % 2 === 0 ? [students[(i+1) % students.length]._id] : [],
                metrics: {
                    commits: Math.floor(Math.random() * 100) + 20,
                    linesOfCode: Math.floor(Math.random() * 5000) + 1000,
                    issues: Math.floor(Math.random() * 20),
                    completionPercentage: Math.floor(Math.random() * 100)
                }
            });
            projects.push(project);
        }

        // 8. Create Progress Records
        for (const student of students) {
            await Progress.create({
                user: student._id,
                community: community._id,
                contestsParticipated: Math.floor(Math.random() * 3) + 1,
                projectsCompleted: Math.floor(Math.random() * 2) + 1,
                totalScore: Math.floor(Math.random() * 1000) + 500,
                skillPoints: Math.floor(Math.random() * 500) + 250,
                level: Math.floor(Math.random() * 5) + 1,
                achievements: [
                    { 
                        title: 'First Contest', 
                        description: 'Participated in first contest',
                        earnedAt: new Date()
                    },
                    {
                        title: 'Project Creator',
                        description: 'Created first project',
                        earnedAt: new Date()
                    }
                ],
                weeklyProgress: Array.from({length: 12}, (_, i) => ({
                    week: i + 1,
                    contestScore: Math.floor(Math.random() * 100),
                    projectProgress: Math.floor(Math.random() * 50),
                    skillPoints: Math.floor(Math.random() * 25)
                }))
            });
        }

        // 9. Update Community Stats
        community.stats = {
            totalStudents: students.length,
            totalMentors: mentors.length,
            totalContests: contests.length,
            totalProjects: projects.length,
            averageProgress: 75
        };
        await community.save();

        console.log('✅ Database seeding completed successfully!');
        console.log(`👥 Created ${students.length} students`);
        console.log(`👨‍🏫 Created ${mentors.length} mentors`);
        console.log(`🏆 Created ${contests.length} contests`);
        console.log(`📚 Created ${projects.length} projects`);
        console.log(`🏢 Created 1 community: ${community.name}`);
        console.log(`👤 Created 1 admin: ${adminUser.email}`);
        console.log(`🚀 Created ${personalUsers.length} personal users`);

        console.log('\n🔑 Test Credentials:');
        console.log('Admin: admin@skillport.com / admin123');
        console.log('Student: student1@skillport.com / student123');
        console.log('Mentor: mentor1@skillport.com / mentor123');
        console.log('Personal: student1@example.com / student123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();

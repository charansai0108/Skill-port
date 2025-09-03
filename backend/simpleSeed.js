const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Community = require('./models/Community');

// Connect to database
const connectDB = require('./config/database');

const simpleSeed = async () => {
    try {
        await connectDB();
        console.log('🔄 Starting simple database seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Community.deleteMany({});
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
                firstName: `PersonalUser${i}`,
                lastName: 'Individual',
                email: `personal${i}@example.com`,
                password: 'user123',
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
                status: 'active',
                isEmailVerified: true,
                expertise: ['JavaScript', 'Python', 'React'],
                yearsOfExperience: Math.floor(Math.random() * 10) + 3
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
                isEmailVerified: true,
                studentId: `STU${String(i).padStart(4, '0')}`
            });
            students.push(student);
        }

        // 6. Update Community Stats
        community.stats = {
            totalStudents: students.length,
            totalMentors: mentors.length,
            totalContests: 0,
            totalProjects: 0,
            averageProgress: 75
        };
        await community.save();

        console.log('✅ Simple database seeding completed successfully!');
        console.log(`👥 Created ${students.length} students`);
        console.log(`👨‍🏫 Created ${mentors.length} mentors`);
        console.log(`🏢 Created 1 community: ${community.name}`);
        console.log(`👤 Created 1 admin: ${adminUser.email}`);
        console.log(`🚀 Created ${personalUsers.length} personal users`);

        console.log('\n🔑 Test Credentials:');
        console.log('Admin: admin@skillport.com / admin123');
        console.log('Student: student1@skillport.com / student123');
        console.log('Mentor: mentor1@skillport.com / mentor123');
        console.log('Personal: personal1@example.com / user123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

simpleSeed();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Load models
const User = require('../models/User');
const Community = require('../models/Community');
const Progress = require('../models/Progress');
const Contest = require('../models/Contest');
const Project = require('../models/Project');

// Connect to database
const connectDB = require('../config/database');

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('🌱 Starting database seeding...'.yellow.bold);

        // Clear existing data
        console.log('🧹 Clearing existing data...'.cyan);
        await User.deleteMany();
        await Community.deleteMany();
        await Progress.deleteMany();
        await Contest.deleteMany();
        await Project.deleteMany();

        // Create sample communities
        console.log('🏢 Creating sample communities...'.cyan);
        const communities = await Community.create([
            {
                name: 'PW IOI Academy',
                code: 'PWIOI',
                description: 'Elite competitive programming training institute preparing students for International Olympiad in Informatics',
                primaryColor: '#3B82F6',
                secondaryColor: '#1E40AF',
                isPublic: true,
                allowSelfRegistration: false,
                maxStudents: 200,
                maxMentors: 15,
                features: {
                    contests: true,
                    leaderboard: true,
                    certificates: true,
                    mentorship: true,
                    projects: true,
                    discussions: true,
                    analytics: true
                },
                contactInfo: {
                    email: 'info@pwioi.com',
                    phone: '+1-555-0123',
                    website: 'https://pwioi.com'
                },
                batches: [
                    {
                        name: 'Advanced Batch 2024',
                        code: 'PWIOI-ADV24',
                        description: 'Advanced competitive programming batch',
                        startDate: new Date('2024-01-15'),
                        endDate: new Date('2024-12-15'),
                        maxStudents: 30,
                        status: 'active'
                    },
                    {
                        name: 'Intermediate Batch 2024',
                        code: 'PWIOI-INT24',
                        description: 'Intermediate level programming batch',
                        startDate: new Date('2024-02-01'),
                        endDate: new Date('2024-11-30'),
                        maxStudents: 50,
                        status: 'active'
                    }
                ]
            },
            {
                name: 'CodeCraft Academy',
                code: 'CODECRAFT',
                description: 'Full-stack web development bootcamp with industry mentorship',
                primaryColor: '#F59E0B',
                secondaryColor: '#D97706',
                isPublic: true,
                allowSelfRegistration: true,
                maxStudents: 150,
                maxMentors: 12,
                features: {
                    contests: true,
                    leaderboard: true,
                    certificates: true,
                    mentorship: true,
                    projects: true,
                    discussions: true,
                    analytics: true
                },
                contactInfo: {
                    email: 'hello@codecraft.dev',
                    website: 'https://codecraft.dev'
                },
                batches: [
                    {
                        name: 'Full Stack Cohort 1',
                        code: 'CODECRAFT-FS1',
                        description: 'Full stack web development cohort',
                        startDate: new Date('2024-03-01'),
                        endDate: new Date('2024-08-31'),
                        maxStudents: 40,
                        status: 'active'
                    }
                ]
            }
        ]);

        // Create admin users for communities
        console.log('👤 Creating community admins...'.cyan);
        const admins = await User.create([
            {
                firstName: 'Dr. Rajesh',
                lastName: 'Kumar',
                email: 'admin@pwioi.com',
                password: 'Admin123!',
                role: 'community-admin',
                community: communities[0]._id,
                status: 'active',
                isEmailVerified: true,
                bio: 'Director of PW IOI Academy with 15+ years of competitive programming experience'
            },
            {
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'admin@codecraft.dev',
                password: 'Admin123!',
                role: 'community-admin',
                community: communities[1]._id,
                status: 'active',
                isEmailVerified: true,
                bio: 'Full-stack developer and educator passionate about teaching modern web technologies'
            }
        ]);

        // Update community admin references
        communities[0].admin = admins[0]._id;
        communities[1].admin = admins[1]._id;
        await Promise.all(communities.map(c => c.save()));

        // Create mentors
        console.log('🧑‍🏫 Creating mentors...'.cyan);
        const mentors = await User.create([
            // PW IOI Mentors
            {
                firstName: 'Arjun',
                lastName: 'Sharma',
                email: 'arjun.mentor@pwioi.com',
                password: 'Mentor123!',
                role: 'mentor',
                community: communities[0]._id,
                status: 'active',
                isEmailVerified: true,
                expertise: ['Algorithms', 'Data Structures', 'Dynamic Programming'],
                yearsOfExperience: 8,
                bio: 'IOI Silver Medalist, specializes in advanced algorithms and competitive programming strategies'
            },
            {
                firstName: 'Priya',
                lastName: 'Patel',
                email: 'priya.mentor@pwioi.com',
                password: 'Mentor123!',
                role: 'mentor',
                community: communities[0]._id,
                status: 'active',
                isEmailVerified: true,
                expertise: ['Graph Theory', 'Number Theory', 'Combinatorics'],
                yearsOfExperience: 6,
                bio: 'Mathematics PhD with expertise in competitive programming and problem solving'
            },
            // CodeCraft Mentors
            {
                firstName: 'Mike',
                lastName: 'Chen',
                email: 'mike.mentor@codecraft.dev',
                password: 'Mentor123!',
                role: 'mentor',
                community: communities[1]._id,
                status: 'active',
                isEmailVerified: true,
                expertise: ['React', 'Node.js', 'MongoDB'],
                yearsOfExperience: 7,
                bio: 'Senior Full Stack Developer at tech unicorn, React core contributor'
            },
            {
                firstName: 'Lisa',
                lastName: 'Wang',
                email: 'lisa.mentor@codecraft.dev',
                password: 'Mentor123!',
                role: 'mentor',
                community: communities[1]._id,
                status: 'active',
                isEmailVerified: true,
                expertise: ['UI/UX Design', 'Frontend Development', 'TypeScript'],
                yearsOfExperience: 5,
                bio: 'Lead Frontend Engineer with passion for creating beautiful user experiences'
            }
        ]);

        // Assign mentors to batches
        communities[0].batches[0].mentors = [mentors[0]._id, mentors[1]._id];
        communities[0].batches[1].mentors = [mentors[0]._id];
        communities[1].batches[0].mentors = [mentors[2]._id, mentors[3]._id];
        await Promise.all(communities.map(c => c.save()));

        // Create students one by one to avoid studentId conflicts
        console.log('🎓 Creating students...'.cyan);
        const students = [];
        
        // PW IOI Students - Advanced Batch
        students.push(await User.create({
            firstName: 'Aarav',
            lastName: 'Singh',
            email: 'aarav.student@pwioi.com',
            password: 'Student123!',
            role: 'student',
            community: communities[0]._id,
            batch: 'PWIOI-ADV24',
            status: 'active',
            isEmailVerified: true,
            totalPoints: 2850,
            level: 8,
            streak: 15
        }));
        
        students.push(await User.create({
            firstName: 'Ananya',
            lastName: 'Gupta',
            email: 'ananya.student@pwioi.com',
            password: 'Student123!',
            role: 'student',
            community: communities[0]._id,
            batch: 'PWIOI-ADV24',
            status: 'active',
            isEmailVerified: true,
            totalPoints: 3120,
            level: 9,
            streak: 22
        }));
        
        students.push(await User.create({
            firstName: 'Rohan',
            lastName: 'Mehta',
            email: 'rohan.student@pwioi.com',
            password: 'Student123!',
            role: 'student',
            community: communities[0]._id,
            batch: 'PWIOI-ADV24',
            status: 'active',
            isEmailVerified: true,
            totalPoints: 2650,
            level: 7,
            streak: 8
        }));
        
        // PW IOI Students - Intermediate Batch
        students.push(await User.create({
            firstName: 'Kavya',
            lastName: 'Reddy',
            email: 'kavya.student@pwioi.com',
            password: 'Student123!',
            role: 'student',
            community: communities[0]._id,
            batch: 'PWIOI-INT24',
            status: 'active',
            isEmailVerified: true,
            totalPoints: 1850,
            level: 5,
            streak: 12
        }));
        
        students.push(await User.create({
            firstName: 'Aryan',
            lastName: 'Joshi',
            email: 'aryan.student@pwioi.com',
            password: 'Student123!',
            role: 'student',
            community: communities[0]._id,
            batch: 'PWIOI-INT24',
            status: 'active',
            isEmailVerified: true,
            totalPoints: 2100,
            level: 6,
            streak: 18
        }));
        
        // CodeCraft Students
        students.push(await User.create({
            firstName: 'Emily',
            lastName: 'Davis',
            email: 'emily.student@codecraft.dev',
            password: 'Student123!',
            role: 'student',
            community: communities[1]._id,
            batch: 'CODECRAFT-FS1',
            status: 'active',
            isEmailVerified: true,
            totalPoints: 1850,
            level: 5,
            streak: 10
        }));
        
        students.push(await User.create({
            firstName: 'David',
            lastName: 'Wilson',
            email: 'david.student@codecraft.dev',
            password: 'Student123!',
            role: 'student',
            community: communities[1]._id,
            batch: 'CODECRAFT-FS1',
            status: 'active',
            isEmailVerified: true,
            totalPoints: 2200,
            level: 6,
            streak: 14
        }));
        
        students.push(await User.create({
            firstName: 'Sophia',
            lastName: 'Brown',
            email: 'sophia.student@codecraft.dev',
            password: 'Student123!',
            role: 'student',
            community: communities[1]._id,
            batch: 'CODECRAFT-FS1',
            status: 'active',
            isEmailVerified: true,
            totalPoints: 1950,
            level: 5,
            streak: 8
        }));

        // Create personal users
        console.log('👨‍💻 Creating personal users...'.cyan);
        const personalUsers = await User.create([
            {
                firstName: 'Alex',
                lastName: 'Thompson',
                email: 'alex@example.com',
                password: 'Personal123!',
                role: 'personal',
                status: 'active',
                isEmailVerified: true,
                extensionInstalled: true,
                totalPoints: 1850,
                level: 5,
                streak: 9,
                lastExtensionSync: new Date()
            },
            {
                firstName: 'Maria',
                lastName: 'Garcia',
                email: 'maria@example.com',
                password: 'Personal123!',
                role: 'personal',
                status: 'active',
                isEmailVerified: true,
                extensionInstalled: true,
                totalPoints: 2680,
                level: 7,
                streak: 21,
                lastExtensionSync: new Date()
            }
        ]);

        // Create progress data
        console.log('📊 Creating progress data...'.cyan);
        const progressData = [];

        // Progress for community students
        for (const student of students) {
            if (student.community.toString() === communities[0]._id.toString()) {
                // PW IOI - Algorithm focused progress
                progressData.push(
                    {
                        user: student._id,
                        community: student.community,
                        type: 'skill',
                        skillName: 'Algorithms',
                        category: 'algorithms',
                        difficulty: 'advanced',
                        totalProblems: 150,
                        solvedProblems: Math.floor(Math.random() * 80) + 70,
                        totalPoints: student.totalPoints * 0.4,
                        currentStreak: student.streak,
                        longestStreak: student.streak + Math.floor(Math.random() * 10)
                    },
                    {
                        user: student._id,
                        community: student.community,
                        type: 'skill',
                        skillName: 'Data Structures',
                        category: 'data-structures',
                        difficulty: 'intermediate',
                        totalProblems: 100,
                        solvedProblems: Math.floor(Math.random() * 60) + 40,
                        totalPoints: student.totalPoints * 0.3,
                        currentStreak: Math.floor(student.streak * 0.8),
                        longestStreak: student.streak + Math.floor(Math.random() * 5)
                    }
                );
            } else {
                // CodeCraft - Web development focused progress
                progressData.push(
                    {
                        user: student._id,
                        community: student.community,
                        type: 'skill',
                        skillName: 'Web Development',
                        category: 'web-development',
                        difficulty: 'intermediate',
                        totalProblems: 80,
                        solvedProblems: Math.floor(Math.random() * 50) + 30,
                        totalPoints: student.totalPoints * 0.5,
                        currentStreak: student.streak,
                        longestStreak: student.streak + Math.floor(Math.random() * 8)
                    },
                    {
                        user: student._id,
                        community: student.community,
                        type: 'skill',
                        skillName: 'JavaScript',
                        category: 'web-development',
                        difficulty: 'intermediate',
                        totalProblems: 120,
                        solvedProblems: Math.floor(Math.random() * 70) + 50,
                        totalPoints: student.totalPoints * 0.3,
                        currentStreak: Math.floor(student.streak * 0.9),
                        longestStreak: student.streak + Math.floor(Math.random() * 6)
                    }
                );
            }
        }

        // Progress for personal users (extension data)
        for (const user of personalUsers) {
            progressData.push({
                user: user._id,
                type: 'extension',
                skillName: 'LeetCode Progress',
                category: 'algorithms',
                difficulty: 'intermediate',
                totalProblems: 200,
                solvedProblems: Math.floor(Math.random() * 120) + 80,
                totalPoints: user.totalPoints,
                currentStreak: user.streak,
                longestStreak: user.streak + Math.floor(Math.random() * 15),
                platformData: {
                    leetcode: {
                        username: user.firstName.toLowerCase() + user.lastName.toLowerCase(),
                        totalSolved: Math.floor(Math.random() * 120) + 80,
                        easySolved: Math.floor(Math.random() * 50) + 30,
                        mediumSolved: Math.floor(Math.random() * 40) + 25,
                        hardSolved: Math.floor(Math.random() * 15) + 5,
                        ranking: Math.floor(Math.random() * 50000) + 10000,
                        lastSync: new Date()
                    }
                }
            });
        }

        await Progress.create(progressData);

        // Create sample projects
        console.log('🚀 Creating sample projects...'.cyan);
        const projects = await Project.create([
            {
                title: 'E-Commerce Platform',
                description: 'Full-stack e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, product catalog, shopping cart, payment integration, and admin dashboard.',
                shortDescription: 'Modern e-commerce platform with complete shopping experience',
                category: 'web-development',
                difficulty: 'advanced',
                status: 'completed',
                owner: students[5]._id, // Emily from CodeCraft
                community: communities[1]._id,
                technologies: [
                    { name: 'React', category: 'frontend' },
                    { name: 'Node.js', category: 'backend' },
                    { name: 'MongoDB', category: 'database' },
                    { name: 'Express.js', category: 'framework' },
                    { name: 'Stripe', category: 'library' }
                ],
                skillsRequired: ['javascript', 'react', 'nodejs', 'mongodb'],
                estimatedHours: 120,
                actualHours: 135,
                githubUrl: 'https://github.com/emily/ecommerce-platform',
                liveUrl: 'https://ecommerce-demo.netlify.app',
                keyFeatures: [
                    { title: 'User Authentication', description: 'Secure login and registration system', isCompleted: true, completedAt: new Date('2024-02-15') },
                    { title: 'Product Catalog', description: 'Browse and search products', isCompleted: true, completedAt: new Date('2024-02-20') },
                    { title: 'Shopping Cart', description: 'Add/remove items and manage quantities', isCompleted: true, completedAt: new Date('2024-02-25') },
                    { title: 'Payment Integration', description: 'Secure payment processing with Stripe', isCompleted: true, completedAt: new Date('2024-03-01') }
                ],
                tags: ['react', 'ecommerce', 'fullstack', 'mongodb'],
                progressPercentage: 100
            },
            {
                title: 'Algorithm Visualizer',
                description: 'Interactive web application for visualizing sorting and graph algorithms. Built with vanilla JavaScript and Canvas API for smooth animations.',
                shortDescription: 'Visual learning tool for algorithms and data structures',
                category: 'web-development',
                difficulty: 'intermediate',
                status: 'in-progress',
                owner: students[1]._id, // Ananya from PW IOI
                community: communities[0]._id,
                technologies: [
                    { name: 'JavaScript', category: 'language' },
                    { name: 'HTML5 Canvas', category: 'frontend' },
                    { name: 'CSS3', category: 'frontend' }
                ],
                skillsRequired: ['javascript', 'html', 'css'],
                estimatedHours: 60,
                actualHours: 45,
                githubUrl: 'https://github.com/ananya/algorithm-visualizer',
                liveUrl: 'https://algo-viz-demo.github.io',
                keyFeatures: [
                    { title: 'Sorting Algorithms', description: 'Visualize bubble sort, merge sort, quick sort', isCompleted: true, completedAt: new Date('2024-02-10') },
                    { title: 'Graph Algorithms', description: 'BFS, DFS, Dijkstra visualization', isCompleted: false },
                    { title: 'Speed Controls', description: 'Adjustable animation speed', isCompleted: true, completedAt: new Date('2024-02-12') },
                    { title: 'Algorithm Comparison', description: 'Side-by-side algorithm comparison', isCompleted: false }
                ],
                tags: ['algorithms', 'visualization', 'education', 'javascript'],
                progressPercentage: 70
            },
            {
                title: 'Personal Portfolio Website',
                description: 'Responsive portfolio website showcasing projects and skills. Built with modern web technologies and deployed on Netlify.',
                shortDescription: 'Professional portfolio with modern design',
                category: 'web-development',
                difficulty: 'beginner',
                status: 'completed',
                owner: personalUsers[0]._id, // Alex
                technologies: [
                    { name: 'HTML5', category: 'frontend' },
                    { name: 'CSS3', category: 'frontend' },
                    { name: 'JavaScript', category: 'frontend' },
                    { name: 'Netlify', category: 'tool' }
                ],
                skillsRequired: ['html', 'css', 'javascript'],
                estimatedHours: 25,
                actualHours: 30,
                githubUrl: 'https://github.com/alex/portfolio',
                liveUrl: 'https://alex-thompson.netlify.app',
                keyFeatures: [
                    { title: 'Responsive Design', description: 'Mobile-first responsive layout', isCompleted: true, completedAt: new Date('2024-01-15') },
                    { title: 'Project Showcase', description: 'Interactive project gallery', isCompleted: true, completedAt: new Date('2024-01-18') },
                    { title: 'Contact Form', description: 'Working contact form with validation', isCompleted: true, completedAt: new Date('2024-01-20') }
                ],
                tags: ['portfolio', 'responsive', 'html', 'css'],
                progressPercentage: 100,
                settings: { isPublic: true, allowReviews: true }
            }
        ]);

        // Create sample contests
        console.log('🏆 Creating sample contests...'.cyan);
        const contests = await Contest.create([
            {
                title: 'Weekly Algorithm Challenge #15',
                description: 'Weekly competitive programming contest featuring problems on dynamic programming, graph theory, and number theory.',
                community: communities[0]._id,
                createdBy: mentors[0]._id,
                type: 'individual',
                difficulty: 'advanced',
                category: 'algorithms',
                startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
                duration: 180,
                registrationStart: new Date(),
                registrationEnd: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
                maxParticipants: 50,
                status: 'published',
                rules: {
                    allowedLanguages: ['cpp', 'java', 'python'],
                    scoringSystem: 'icpc',
                    penaltyPerWrongSubmission: 20
                },
                problems: [
                    {
                        title: 'Maximum Subarray Sum',
                        description: 'Find the maximum sum of a contiguous subarray within a given array.',
                        difficulty: 'medium',
                        points: 100,
                        timeLimit: 1,
                        memoryLimit: 256,
                        order: 1
                    },
                    {
                        title: 'Shortest Path in Grid',
                        description: 'Find the shortest path from top-left to bottom-right in a grid with obstacles.',
                        difficulty: 'hard',
                        points: 200,
                        timeLimit: 2,
                        memoryLimit: 512,
                        order: 2
                    }
                ]
            },
            {
                title: 'Frontend Development Sprint',
                description: 'Build a responsive landing page within 2 hours. Focus on modern CSS techniques and user experience.',
                community: communities[1]._id,
                createdBy: mentors[3]._id,
                type: 'individual',
                difficulty: 'intermediate',
                category: 'web-development',
                startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
                duration: 120,
                registrationStart: new Date(),
                registrationEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                maxParticipants: 30,
                status: 'registration_open',
                rules: {
                    allowedLanguages: ['javascript', 'python', 'java'],
                    scoringSystem: 'custom'
                },
                problems: [
                    {
                        title: 'Responsive Landing Page',
                        description: 'Create a responsive landing page for a fictional startup using HTML, CSS, and JavaScript.',
                        difficulty: 'medium',
                        points: 100,
                        order: 1
                    }
                ]
            }
        ]);

        // Update community stats
        console.log('📈 Updating community statistics...'.cyan);
        for (const community of communities) {
            await community.updateStats();
        }

        console.log('✅ Database seeding completed successfully!'.green.bold);
        console.log('\n📊 Seeded Data Summary:'.blue.bold);
        console.log(`Communities: ${communities.length}`.green);
        console.log(`Users: ${admins.length + mentors.length + students.length + personalUsers.length}`.green);
        console.log(`  - Admins: ${admins.length}`.cyan);
        console.log(`  - Mentors: ${mentors.length}`.cyan);
        console.log(`  - Students: ${students.length}`.cyan);
        console.log(`  - Personal Users: ${personalUsers.length}`.cyan);
        console.log(`Progress Records: ${progressData.length}`.green);
        console.log(`Projects: ${projects.length}`.green);
        console.log(`Contests: ${contests.length}`.green);

        console.log('\n🔑 Sample Login Credentials:'.yellow.bold);
        console.log('Admin (PW IOI): admin@pwioi.com / Admin123!'.yellow);
        console.log('Admin (CodeCraft): admin@codecraft.dev / Admin123!'.yellow);
        console.log('Mentor: arjun.mentor@pwioi.com / Mentor123!'.yellow);
        console.log('Student: aarav.student@pwioi.com / Student123!'.yellow);
        console.log('Personal: alex@example.com / Personal123!'.yellow);

        process.exit(0);

    } catch (error) {
        console.error('❌ Database seeding failed:'.red.bold, error);
        process.exit(1);
    }
};

// Run seeder
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;

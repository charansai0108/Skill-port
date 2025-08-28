// 🚀 SkillPort Student Dashboard Core Logic
// This file provides core functionality without backend dependencies

class SkillPortStudent {
  constructor() {
    this.currentUser = this.loadUserData();
    this.submissions = this.loadSubmissions();
    this.projects = this.loadProjects();
    this.posts = this.loadPosts();
    this.communities = this.loadCommunities();
    this.init();
  }

  // 🚩 Initialize the application
  init() {
    this.setupEventListeners();
    this.updateDashboard();
    this.loadUserProfile();
    this.updateCommunitiesDisplay(); // Update communities display on init
    this.updateProjectsDisplay(); // Update projects display on init
    this.updatePostsDisplay(); // Update posts display on init
    console.log('🚀 SkillPort Student Dashboard initialized!');
  }

  // 👤 User Management
  loadUserData() {
    const saved = localStorage.getItem('skillport_user');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Default user data
    return {
      id: 'user_001',
      username: 'alex_johnson',
      fullName: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      bio: 'Passionate full-stack developer with expertise in modern web technologies. Love solving complex problems and building scalable applications.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Java'],
      education: [
        {
          degree: 'Bachelor of Computer Science',
          school: 'Stanford University',
          period: '2020 - 2024'
        }
      ],
      experience: [
        {
          title: 'Software Engineer Intern',
          company: 'Google',
          period: 'Summer 2023'
        }
      ],
      certifications: [
        { name: 'AWS Certified Developer', issued: 'Jan 2024' },
        { name: 'Google Cloud Professional', issued: 'Dec 2023' },
        { name: 'Microsoft Azure Developer', issued: 'Nov 2023' }
      ]
    };
  }

  saveUserData() {
    localStorage.setItem('skillport_user', JSON.stringify(this.currentUser));
  }

  // 📊 Submissions & Progress
  loadSubmissions() {
    const saved = localStorage.getItem('skillport_submissions');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Default submission data
    return {
      leetcode: { solved: 89, total: 100, streak: 23 },
      gfg: { solved: 156, total: 200, streak: 23 },
      hackerrank: { solved: 67, total: 80, streak: 23 },
      interviewbit: { solved: 34, total: 50, streak: 23 }
    };
  }

  saveSubmissions() {
    localStorage.setItem('skillport_submissions', JSON.stringify(this.submissions));
  }

  // 📁 Projects Management
  loadProjects() {
    const saved = localStorage.getItem('skillport_projects');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Default projects
    return [
      {
        id: 'proj_001',
        title: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution with React frontend and Node.js backend.',
        status: 'completed',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        stars: 24,
        forks: 8,
        difficulty: 'Hard',
        completionDate: '2024-01-10'
      },
      {
        id: 'proj_002',
        title: 'Task Management App',
        description: 'Collaborative task management application with real-time updates.',
        status: 'in-progress',
        technologies: ['Vue.js', 'Firebase', 'Tailwind'],
        stars: 15,
        forks: 4,
        difficulty: 'Medium',
        completionDate: null
      }
    ];
  }

  saveProjects() {
    localStorage.setItem('skillport_projects', JSON.stringify(this.projects));
  }

  // 📝 Posts Management
  loadPosts() {
    const saved = localStorage.getItem('skillport_posts');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return [
      {
        id: 'post_001',
        title: 'My Experience with System Design Interviews',
        content: 'Recently went through several system design interviews and wanted to share my learnings...',
        tags: ['system-design', 'interviews', 'learning'],
        likes: 45,
        comments: 12,
        timestamp: '2024-01-15T10:30:00Z'
      }
    ];
  }

  savePosts() {
    localStorage.setItem('skillport_posts', JSON.stringify(this.posts));
  }

  // 👥 Communities Management
  loadCommunities() {
    const saved = localStorage.getItem('skillport_communities');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return [
      {
        id: 'comm_001',
        name: 'React Developers',
        description: 'A community for React developers to share knowledge and help each other grow.',
        members: 2400,
        posts: 156,
        joined: true,
        category: 'Web Development'
      },
      {
        id: 'comm_002',
        name: 'Algorithm Masters',
        description: 'Advanced algorithms and data structures discussion.',
        members: 1800,
        posts: 89,
        joined: false,
        category: 'Algorithms'
      },
      {
        id: 'comm_003',
        name: 'Mobile Dev Hub',
        description: 'Everything mobile development - React Native, Flutter, iOS, Android. Share apps, discuss challenges, and stay updated with mobile trends.',
        members: 3200,
        posts: 234,
        joined: true,
        category: 'Mobile Development'
      },
      {
        id: 'comm_004',
        name: 'Data Science Enthusiasts',
        description: 'Machine learning, data analysis, and AI discussions. Share projects, discuss algorithms, and learn from data science experts.',
        members: 1500,
        posts: 67,
        joined: false,
        category: 'Data Science'
      },
      {
        id: 'comm_005',
        name: 'System Design Pros',
        description: 'Master the art of system design. Discuss architecture patterns, scalability, and real-world system design challenges.',
        members: 2100,
        posts: 123,
        joined: true,
        category: 'System Design'
      },
      {
        id: 'comm_006',
        name: 'Interview Prep Squad',
        description: 'Prepare for technical interviews together. Share experiences, practice problems, and get tips from successful candidates.',
        members: 4500,
        posts: 456,
        joined: false,
        category: 'Interview Prep'
      }
    ];
  }

  saveCommunities() {
    localStorage.setItem('skillport_communities', JSON.stringify(this.communities));
  }

  // 🎯 Dashboard Updates
  updateDashboard() {
    this.updateStats();
    this.updateProgress();
    this.updateRecentActivity();
  }

  updateStats() {
    const totalSolved = Object.values(this.submissions).reduce((sum, platform) => sum + platform.solved, 0);
    const totalProblems = Object.values(this.submissions).reduce((sum, platform) => sum + platform.total, 0);
    const successRate = Math.round((totalSolved / totalProblems) * 100);
    
    // Update stats cards
    const statsElements = {
      'active-tasks': this.projects.filter(p => p.status === 'in-progress').length,
      'problems-solved': totalSolved,
      'certificates': this.currentUser.certifications.length,
      'success-rate': successRate + '%'
    };

    Object.entries(statsElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  updateProgress() {
    // Update learning progress bars
    const progressData = {
      'data-structures': 85,
      'algorithms': 72,
      'system-design': 45,
      'database': 68
    };

    Object.entries(progressData).forEach(([id, percentage]) => {
      const progressBar = document.querySelector(`[data-progress="${id}"]`);
      if (progressBar) {
        progressBar.style.width = percentage + '%';
        progressBar.nextElementSibling.textContent = percentage + '%';
      }
    });
  }

  updateRecentActivity() {
    // This would be populated with real activity data
    console.log('📊 Dashboard stats updated');
  }

  // 👤 Profile Management
  loadUserProfile() {
    this.updateProfileDisplay();
    this.setupProfileForms();
  }

  updateProfileDisplay() {
    // Update profile information display
    const profileElements = {
      'profile-name': this.currentUser.fullName,
      'profile-email': this.currentUser.email,
      'profile-phone': this.currentUser.phone,
      'profile-location': this.currentUser.location,
      'profile-bio': this.currentUser.bio
    };

    Object.entries(profileElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });

    // Update skills display
    this.updateSkillsDisplay();
  }

  updateSkillsDisplay() {
    const skillsContainer = document.querySelector('.skills-container');
    if (skillsContainer) {
      skillsContainer.innerHTML = this.currentUser.skills.map(skill => 
        `<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">${skill}</span>`
      ).join('');
    }
  }

  setupProfileForms() {
    // Make profile forms interactive
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }
  }

  handleProfileUpdate(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const updates = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      bio: formData.get('bio')
    };

    // Update user data
    Object.assign(this.currentUser, updates);
    this.saveUserData();
    this.updateProfileDisplay();

    // Show success message
    this.showNotification('Profile updated successfully!', 'success');
  }

  // 📁 Project Management
  createProject(projectData) {
    const newProject = {
      id: 'proj_' + Date.now(),
      ...projectData,
      status: 'in-progress',
      stars: 0,
      forks: 0,
      completionDate: null
    };

    this.projects.push(newProject);
    this.saveProjects();
    this.updateDashboard();
    
    return newProject;
  }

  updateProject(projectId, updates) {
    const projectIndex = this.projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      this.projects[projectIndex] = { ...this.projects[projectIndex], ...updates };
      this.saveProjects();
      this.updateDashboard();
      return true;
    }
    return false;
  }

  // 📝 Post Management
  createPost(postData) {
    const newPost = {
      id: 'post_' + Date.now(),
      ...postData,
      likes: 0,
      comments: 0,
      timestamp: new Date().toISOString()
    };

    this.posts.push(newPost);
    this.savePosts();
    
    return newPost;
  }

  // 👥 Community Management
  joinCommunity(communityId) {
    const community = this.communities.find(c => c.id === communityId);
    if (community) {
      community.joined = true;
      community.members += 1;
      this.saveCommunities();
      this.showNotification(`Joined ${community.name}!`, 'success');
      this.updateCommunitiesDisplay(); // Update the display after joining
      return true;
    }
    return false;
  }

  leaveCommunity(communityId) {
    const community = this.communities.find(c => c.id === communityId);
    if (community && community.joined) {
      community.joined = false;
      community.members -= 1;
      this.saveCommunities();
      this.showNotification(`Left ${community.name}.`, 'info');
      this.updateCommunitiesDisplay(); // Update the display after leaving
      return true;
    }
    return false;
  }

  // Update communities display
  updateCommunitiesDisplay() {
    const communitiesGrid = document.getElementById('communities-grid');
    if (communitiesGrid) {
      communitiesGrid.innerHTML = this.communities.map(community => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-${this.getCommunityColor(community.category)}-100 rounded-lg flex items-center justify-center">
                  <i data-lucide="${this.getCommunityIcon(community.category)}" class="w-6 h-6 text-${this.getCommunityColor(community.category)}-600"></i>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">${community.name}</h3>
                  <p class="text-sm text-slate-500">${community.category}</p>
                </div>
              </div>
              <span class="px-2 py-1 text-xs font-medium ${community.joined ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'} rounded-full">
                ${community.joined ? 'Joined' : 'Not Joined'}
              </span>
            </div>
            <p class="text-slate-600 text-sm mb-4">${community.description}</p>
            <div class="flex items-center justify-between text-sm text-slate-500 mb-4">
              <span>${community.members.toLocaleString()} members</span>
              <span>${community.posts} posts</span>
            </div>
            <div class="flex gap-2">
              ${community.joined ? 
                `<button data-action="leave-community" data-community-id="${community.id}" class="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">Leave</button>` :
                `<button data-action="join-community" data-community-id="${community.id}" class="flex-1 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">Join</button>`
              }
              <button class="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">View</button>
            </div>
          </div>
        </div>
      `).join('');
      
      // Re-initialize Lucide icons for the new content
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  // Helper functions for community display
  getCommunityColor(category) {
    const colors = {
      'Web Development': 'blue',
      'Algorithms': 'green',
      'Mobile Development': 'purple',
      'Data Science': 'amber',
      'System Design': 'red',
      'Interview Prep': 'indigo'
    };
    return colors[category] || 'blue';
  }

  getCommunityIcon(category) {
    const icons = {
      'Web Development': 'globe',
      'Algorithms': 'brain',
      'Mobile Development': 'smartphone',
      'Data Science': 'bar-chart-3',
      'System Design': 'server',
      'Interview Prep': 'briefcase'
    };
    return icons[category] || 'users';
  }

  // Handle "View All Tasks" functionality
  showAllTasks() {
    const modal = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
          <h3 class="text-lg font-bold mb-4">All Tasks</h3>
          <div class="space-y-3">
            ${this.getTasksList()}
          </div>
          <div class="mt-6 text-center">
            <button onclick="this.closest('.fixed').remove()" class="bg-blue-600 text-white px-4 py-2 rounded">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
  }

  // Handle "View All Submissions" functionality
  showAllSubmissions() {
    const modal = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
          <h3 class="text-lg font-bold mb-4">All Submissions</h3>
          <div class="mb-4">
            <div class="grid grid-cols-4 gap-4 text-center">
              <div class="bg-blue-50 p-3 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">${this.submissions.leetcode.solved}</div>
                <div class="text-sm text-blue-600">LeetCode</div>
              </div>
              <div class="bg-green-50 p-3 rounded-lg">
                <div class="text-2xl font-bold text-green-600">${this.submissions.gfg.solved}</div>
                <div class="text-sm text-green-600">GFG</div>
              </div>
              <div class="bg-purple-50 p-3 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">${this.submissions.hackerrank.solved}</div>
                <div class="text-sm text-purple-600">HackerRank</div>
              </div>
              <div class="bg-amber-50 p-3 rounded-lg">
                <div class="text-2xl font-bold text-amber-600">${this.submissions.interviewbit.solved}</div>
                <div class="text-sm text-amber-600">InterviewBit</div>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            ${this.getSubmissionsList()}
          </div>
          <div class="mt-6 text-center">
            <button onclick="this.closest('.fixed').remove()" class="bg-blue-600 text-white px-4 py-2 rounded">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
  }

  getSubmissionsList() {
    const submissions = [
      { platform: 'LeetCode', problem: 'Two Sum', difficulty: 'Easy', status: 'Solved', date: '2 hours ago', time: '15 min' },
      { platform: 'LeetCode', problem: 'Add Two Numbers', difficulty: 'Medium', status: 'Solved', date: '1 day ago', time: '25 min' },
      { platform: 'GFG', problem: 'Reverse a String', difficulty: 'Easy', status: 'Solved', date: '2 days ago', time: '8 min' },
      { platform: 'GFG', problem: 'Find Missing Number', difficulty: 'Medium', status: 'Solved', date: '3 days ago', time: '18 min' },
      { platform: 'HackerRank', problem: 'Array Manipulation', difficulty: 'Hard', status: 'Solved', date: '1 week ago', time: '45 min' },
      { platform: 'InterviewBit', problem: 'Max Sum Contiguous Subarray', difficulty: 'Medium', status: 'Solved', date: '1 week ago', time: '22 min' },
      { platform: 'LeetCode', problem: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', status: 'Solved', date: '1 week ago', time: '30 min' },
      { platform: 'GFG', problem: 'Detect Loop in Linked List', difficulty: 'Easy', status: 'Solved', date: '2 weeks ago', time: '12 min' }
    ];

    return submissions.map(sub => `
      <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full ${sub.status === 'Solved' ? 'bg-green-600' : 'bg-red-600'}"></div>
          <div>
            <div class="font-medium text-slate-900">${sub.problem}</div>
            <div class="text-sm text-slate-500">${sub.platform}</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-2 py-1 text-xs font-medium rounded-full ${
            sub.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
            sub.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }">${sub.difficulty}</span>
          <span class="text-xs text-slate-500">${sub.time}</span>
          <span class="text-xs text-slate-500">${sub.date}</span>
        </div>
      </div>
    `).join('');
  }

  getTasksList() {
    const tasks = [
      { name: 'Dynamic Programming Practice', completed: 3, total: 5, status: 'in-progress' },
      { name: 'Graph Algorithms', completed: 7, total: 10, status: 'in-progress' },
      { name: 'System Design', completed: 1, total: 8, status: 'in-progress' },
      { name: 'Database Design', completed: 4, total: 6, status: 'in-progress' },
      { name: 'React Hooks', completed: 8, total: 8, status: 'completed' },
      { name: 'Node.js Backend', completed: 6, total: 10, status: 'in-progress' },
      { name: 'Docker & Kubernetes', completed: 2, total: 5, status: 'not-started' },
      { name: 'AWS Services', completed: 3, total: 7, status: 'in-progress' }
    ];

    return tasks.map(task => `
      <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-green-600' : task.status === 'in-progress' ? 'bg-blue-600' : 'bg-gray-400'}"></div>
          <span class="text-sm font-medium text-slate-900">${task.name}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-500">${task.completed}/${task.total} completed</span>
          <span class="px-2 py-1 text-xs font-medium rounded-full ${
            task.status === 'completed' ? 'bg-green-100 text-green-700' :
            task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }">${task.status.replace('-', ' ')}</span>
        </div>
      </div>
    `).join('');
  }

  // 🔔 Notifications
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // 🎯 Event Listeners Setup
  setupEventListeners() {
    // Profile edit button
    const editProfileBtn = document.querySelector('[data-action="edit-profile"]');
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => this.toggleProfileEdit());
    }

    // New project button
    const newProjectBtn = document.querySelector('[data-action="new-project"]');
    if (newProjectBtn) {
      newProjectBtn.addEventListener('click', () => this.showNewProjectModal());
    }

    // New post button
    const newPostBtn = document.querySelector('[data-action="new-post"]');
    if (newPostBtn) {
      newPostBtn.addEventListener('click', () => this.showNewPostModal());
    }

    // View All Tasks button
    const viewAllTasksBtn = document.querySelector('[data-action="view-all-tasks"]');
    if (viewAllTasksBtn) {
      viewAllTasksBtn.addEventListener('click', () => this.showAllTasks());
    }

    // View All Submissions button
    const viewAllSubmissionsBtn = document.querySelector('[data-action="view-all-submissions"]');
    if (viewAllSubmissionsBtn) {
      viewAllSubmissionsBtn.addEventListener('click', () => this.showAllSubmissions());
    }

    // Community view buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="view-community"]')) {
        const communityId = e.target.dataset.communityId;
        this.showCommunityDetails(communityId);
      }
    });

    // Community join/leave buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="join-community"]')) {
        const communityId = e.target.dataset.communityId;
        this.joinCommunity(communityId);
      }
      if (e.target.matches('[data-action="leave-community"]')) {
        const communityId = e.target.dataset.communityId;
        this.leaveCommunity(communityId);
      }
    });

    // Form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.matches('#project-form')) {
        e.preventDefault();
        this.handleProjectSubmit(e);
      }
      if (e.target.matches('#post-form')) {
        e.preventDefault();
        this.handlePostSubmit(e);
      }
    });
  }

  // 🔧 Utility Functions
  toggleProfileEdit() {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      const isEditing = profileForm.classList.contains('editing');
      if (isEditing) {
        profileForm.classList.remove('editing');
        profileForm.querySelectorAll('input, textarea').forEach(input => input.disabled = true);
      } else {
        profileForm.classList.add('editing');
        profileForm.querySelectorAll('input, textarea').forEach(input => input.disabled = false);
      }
    }
  }

  showNewProjectModal() {
    // Simple modal for new project
    const modal = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
          <h3 class="text-lg font-bold mb-4">Create New Project</h3>
          <form id="project-form">
            <input type="text" name="title" placeholder="Project Title" class="w-full p-2 border rounded mb-3" required>
            <textarea name="description" placeholder="Project Description" class="w-full p-2 border rounded mb-3" rows="3" required></textarea>
            <input type="text" name="technologies" placeholder="Technologies (comma separated)" class="w-full p-2 border rounded mb-3" required>
            <select name="difficulty" class="w-full p-2 border rounded mb-3" required>
              <option value="">Select Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <div class="flex gap-2">
              <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
              <button type="button" onclick="this.closest('.fixed').remove()" class="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
  }

  showNewPostModal() {
    // Simple modal for new post
    const modal = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
          <h3 class="text-lg font-bold mb-4">Create New Post</h3>
          <form id="post-form">
            <input type="text" name="title" placeholder="Post Title" class="w-full p-2 border rounded mb-3" required>
            <textarea name="content" placeholder="Post Content" class="w-full p-2 border rounded mb-3" rows="4" required></textarea>
            <input type="text" name="tags" placeholder="Tags (comma separated)" class="w-full p-2 border rounded mb-3" required>
            <div class="flex gap-2">
              <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Post</button>
              <button type="button" onclick="this.closest('.fixed').remove()" class="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
  }

  handleProjectSubmit(event) {
    const formData = new FormData(event.target);
    const projectData = {
      title: formData.get('title'),
      description: formData.get('description'),
      technologies: formData.get('technologies').split(',').map(t => t.trim()),
      difficulty: formData.get('difficulty')
    };

    const newProject = this.createProject(projectData);
    this.showNotification(`Project "${newProject.title}" created successfully!`, 'success');
    
    // Remove modal
    event.target.closest('.fixed').remove();
    
    // Refresh projects display
    this.updateProjectsDisplay();
  }

  handlePostSubmit(event) {
    const formData = new FormData(event.target);
    const postData = {
      title: formData.get('title'),
      content: formData.get('content'),
      tags: formData.get('tags').split(',').map(t => t.trim())
    };

    const newPost = this.createPost(postData);
    this.showNotification(`Post "${newPost.title}" created successfully!`, 'success');
    
    // Remove modal
    event.target.closest('.fixed').remove();
    
    // Refresh posts display
    this.updatePostsDisplay();
  }

  updateProjectsDisplay() {
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid) {
      projectsGrid.innerHTML = this.projects.map(project => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-xl font-bold text-slate-900 mb-2">${project.title}</h3>
                <p class="text-slate-600 mb-3">${project.description}</p>
              </div>
              <span class="px-3 py-1 text-sm font-medium rounded-full ${
                project.status === 'completed' ? 'bg-green-100 text-green-700' :
                project.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }">${project.status.replace('-', ' ')}</span>
            </div>
            <div class="flex flex-wrap gap-2 mb-4">
              ${project.technologies.map(tech => 
                `<span class="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">${tech}</span>`
              ).join('')}
            </div>
            <div class="flex items-center justify-between text-sm text-slate-500 mb-4">
              <span>Difficulty: ${project.difficulty}</span>
              ${project.completionDate ? `<span>Completed: ${new Date(project.completionDate).toLocaleDateString()}</span>` : ''}
            </div>
            <div class="flex items-center gap-4 text-sm text-slate-500">
              <span class="flex items-center gap-1">
                <i data-lucide="star" class="w-4 h-4 text-yellow-500"></i>
                ${project.stars}
              </span>
              <span class="flex items-center gap-1">
                <i data-lucide="git-fork" class="w-4 h-4 text-blue-500"></i>
                ${project.forks}
              </span>
            </div>
          </div>
        </div>
      `).join('');
      
      // Re-initialize Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  updatePostsDisplay() {
    const postsGrid = document.getElementById('posts-grid');
    if (postsGrid) {
      postsGrid.innerHTML = this.posts.map(post => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div class="p-6">
            <h3 class="text-xl font-bold text-slate-900 mb-3">${post.title}</h3>
            <p class="text-slate-600 mb-4 line-clamp-3">${post.content}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              ${post.tags.map(tag => 
                `<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">${tag}</span>`
              ).join('')}
            </div>
            <div class="flex items-center justify-between text-sm text-slate-500">
              <div class="flex items-center gap-4">
                <span class="flex items-center gap-1">
                  <i data-lucide="heart" class="w-4 h-4 text-red-500"></i>
                  ${post.likes}
                </span>
                <span class="flex items-center gap-1">
                  <i data-lucide="message-circle" class="w-4 h-4 text-blue-500"></i>
                  ${post.comments}
                </span>
              </div>
              <span>${new Date(post.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      `).join('');
      
      // Re-initialize Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  // Handle community view functionality
  showCommunityDetails(communityId) {
    const community = this.communities.find(c => c.id === communityId);
    if (!community) return;

    const modal = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-${this.getCommunityColor(community.category)}-100 rounded-lg flex items-center justify-center">
              <i data-lucide="${this.getCommunityIcon(community.category)}" class="w-6 h-6 text-${this.getCommunityColor(community.category)}-600"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-900">${community.name}</h3>
              <p class="text-sm text-slate-500">${community.category}</p>
            </div>
          </div>
          <p class="text-slate-600 mb-4">${community.description}</p>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-slate-50 p-3 rounded-lg text-center">
              <div class="text-2xl font-bold text-slate-900">${community.members.toLocaleString()}</div>
              <div class="text-sm text-slate-600">Members</div>
            </div>
            <div class="bg-slate-50 p-3 rounded-lg text-center">
              <div class="text-2xl font-bold text-slate-900">${community.posts}</div>
              <div class="text-sm text-slate-600">Posts</div>
            </div>
          </div>
          <div class="flex gap-2">
            ${community.joined ? 
              `<button data-action="leave-community" data-community-id="${community.id}" class="flex-1 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">Leave Community</button>` :
              `<button data-action="join-community" data-community-id="${community.id}" class="flex-1 px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">Join Community</button>`
            }
            <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // Re-initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

// 🚀 Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.skillPortStudent = new SkillPortStudent();
});

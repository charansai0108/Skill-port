/**
 * Admin Users Controller
 * Manages user administration functionality
 */

class AdminUsersController extends PageController {
    constructor() {
        super();
    }

    async initializePage() {
        console.log('👥 Admin Users Controller: Initializing...');
        
        try {
            // Load users data
            await this.loadUsersData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
        } catch (error) {
            console.error('👥 Admin Users Controller: Error initializing:', error);
            throw error;
        }
    }

    async loadUsersData() {
        console.log('👥 Admin Users Controller: Loading users data...');
        
        try {
            this.setLoadingState(true);
            
            // Load all users in the community
            const usersData = await window.dataLoader.loadAllUsers({
                limit: 50,
                sort: '-createdAt'
            });
            
            this.setData({ users: usersData });
            
            // Render users
            this.renderUsers(usersData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            throw error;
        }
    }

    renderUsers(usersData) {
        console.log('👥 Admin Users Controller: Rendering users...');
        
        const users = usersData?.data?.users || [];
        
        if (users.length === 0) {
            window.uiHelpers.showEmpty('users-list', 'No users found');
            return;
        }

        // Render users table
        const columns = [
            {
                header: 'User',
                key: 'user',
                render: (user) => `
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            ${user.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">${user.firstName || ''} ${user.lastName || ''}</p>
                            <p class="text-xs text-gray-500">${user.email || ''}</p>
                        </div>
                    </div>
                `
            },
            {
                header: 'Role',
                key: 'role',
                render: (user) => `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'community-admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'mentor' ? 'bg-amber-100 text-amber-800' :
                        user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${user.role || 'Unknown'}
                    </span>
                `
            },
            {
                header: 'Status',
                key: 'status',
                render: (user) => `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                    }">
                        ${user.status || 'Unknown'}
                    </span>
                `
            },
            {
                header: 'Batch',
                key: 'batch',
                render: (user) => user.batch || '-'
            },
            {
                header: 'Joined',
                key: 'createdAt',
                render: (user) => window.uiHelpers.formatTimeAgo(user.createdAt)
            },
            {
                header: 'Actions',
                key: 'actions',
                render: (user) => `
                    <div class="flex space-x-2">
                        <button onclick="adminUsersController.editUser('${user._id}')" class="text-blue-600 hover:text-blue-900 text-sm">
                            Edit
                        </button>
                        <button onclick="adminUsersController.deleteUser('${user._id}')" class="text-red-600 hover:text-red-900 text-sm">
                            Delete
                        </button>
                    </div>
                `
            }
        ];

        window.uiHelpers.renderTable('users-list', users, columns);
    }

    async editUser(userId) {
        console.log('👥 Admin Users Controller: Editing user:', userId);
        
        try {
            // Get user details
            const userData = await window.APIService.getUserById(userId);
            
            if (userData.success) {
                // Show edit modal or redirect to edit page
                this.showEditModal(userData.data.user);
            } else {
                window.uiHelpers.showError('Error', 'Failed to load user details');
            }
            
        } catch (error) {
            console.error('👥 Admin Users Controller: Error editing user:', error);
            window.uiHelpers.showError('Error', 'Failed to load user details');
        }
    }

    async deleteUser(userId) {
        console.log('👥 Admin Users Controller: Deleting user:', userId);
        
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }
        
        try {
            const response = await window.APIService.deleteUser(userId);
            
            if (response.success) {
                window.uiHelpers.showSuccess('Success', 'User deleted successfully');
                // Refresh users list
                await this.loadUsersData();
            } else {
                window.uiHelpers.showError('Error', response.error || 'Failed to delete user');
            }
            
        } catch (error) {
            console.error('👥 Admin Users Controller: Error deleting user:', error);
            window.uiHelpers.showError('Error', 'Failed to delete user');
        }
    }

    showEditModal(user) {
        // Create and show edit modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
        modal.innerHTML = `
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
                    <form id="editUserForm">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" id="editFirstName" value="${user.firstName || ''}" 
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" id="editLastName" value="${user.lastName || ''}" 
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="editEmail" value="${user.email || ''}" 
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Role</label>
                            <select id="editRole" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="student" ${user.role === 'student' ? 'selected' : ''}>Student</option>
                                <option value="mentor" ${user.role === 'mentor' ? 'selected' : ''}>Mentor</option>
                                <option value="community-admin" ${user.role === 'community-admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Status</label>
                            <select id="editStatus" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                <option value="pending" ${user.status === 'pending' ? 'selected' : ''}>Pending</option>
                            </select>
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="this.closest('.fixed').remove()" 
                                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                                Cancel
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('editUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                firstName: document.getElementById('editFirstName').value,
                lastName: document.getElementById('editLastName').value,
                email: document.getElementById('editEmail').value,
                role: document.getElementById('editRole').value,
                status: document.getElementById('editStatus').value
            };
            
            try {
                const response = await window.APIService.updateUser(user._id, formData);
                
                if (response.success) {
                    window.uiHelpers.showSuccess('Success', 'User updated successfully');
                    modal.remove();
                    await this.loadUsersData();
                } else {
                    window.uiHelpers.showError('Error', response.error || 'Failed to update user');
                }
                
            } catch (error) {
                console.error('👥 Admin Users Controller: Error updating user:', error);
                window.uiHelpers.showError('Error', 'Failed to update user');
            }
        });
    }

    setupEventListeners() {
        console.log('👥 Admin Users Controller: Setting up event listeners...');
        
        // Add user button
        const addUserButton = document.getElementById('add-user-button');
        if (addUserButton) {
            addUserButton.addEventListener('click', () => {
                this.showAddUserModal();
            });
        }
        
        // Refresh button
        const refreshButton = document.getElementById('refresh-users');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadUsersData();
            });
        }
    }

    showAddUserModal() {
        // Create and show add user modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
        modal.innerHTML = `
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
                    <form id="addUserForm">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" id="addFirstName" required
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" id="addLastName" required
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="addEmail" required
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Role</label>
                            <select id="addRole" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Select Role</option>
                                <option value="student">Student</option>
                                <option value="mentor">Mentor</option>
                                <option value="community-admin">Admin</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Batch (for students)</label>
                            <input type="text" id="addBatch" placeholder="e.g., 2024-1"
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="this.closest('.fixed').remove()" 
                                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                                Cancel
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Add User
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('addUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                firstName: document.getElementById('addFirstName').value,
                lastName: document.getElementById('addLastName').value,
                email: document.getElementById('addEmail').value,
                role: document.getElementById('addRole').value,
                batch: document.getElementById('addBatch').value,
                communityId: this.getCommunityId()
            };
            
            try {
                const response = await window.APIService.register(formData);
                
                if (response.success) {
                    window.uiHelpers.showSuccess('Success', 'User created successfully');
                    modal.remove();
                    await this.loadUsersData();
                } else {
                    window.uiHelpers.showError('Error', response.error || 'Failed to create user');
                }
                
            } catch (error) {
                console.error('👥 Admin Users Controller: Error creating user:', error);
                window.uiHelpers.showError('Error', 'Failed to create user');
            }
        });
    }

    setupRealTimeUpdates() {
        console.log('👥 Admin Users Controller: Setting up real-time updates...');
        
        // Refresh users data every 60 seconds
        setInterval(() => {
            console.log('👥 Admin Users Controller: Refreshing users data...');
            this.loadUsersData();
        }, 60000);
    }
}

// Initialize admin users controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('👥 Initializing Admin Users Controller...');
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            window.adminUsersController = new AdminUsersController();
        } catch (error) {
            console.error('👥 Failed to initialize Admin Users Controller:', error);
        }
    }, 1000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminUsersController;
}


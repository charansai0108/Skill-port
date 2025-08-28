// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Load user portfolio
async function loadPortfolio() {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            window.location.href = '../auth/login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/portfolios/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load portfolio');
        }

        const data = await response.json();
        if (data.success) {
            displayPortfolio(data.data.portfolio);
        }
    } catch (error) {
        console.error('Load portfolio error:', error);
        showNotification('Failed to load portfolio', 'error');
    }
}

// Display portfolio data
function displayPortfolio(portfolio) {
    // Update personal info
    if (portfolio.headline) document.getElementById('headline').value = portfolio.headline;
    if (portfolio.summary) document.getElementById('summary').value = portfolio.summary;
    
    // Update coding stats
    document.getElementById('totalProblems').textContent = portfolio.codingStats?.totalProblems || 0;
    document.getElementById('solvedProblems').textContent = portfolio.codingStats?.solvedProblems || 0;
    document.getElementById('totalContests').textContent = portfolio.codingStats?.totalContests || 0;
    
    const completionRate = portfolio.codingStats?.totalProblems > 0 ? 
        Math.round((portfolio.codingStats.solvedProblems / portfolio.codingStats.totalProblems) * 100) : 0;
    document.getElementById('completionRate').textContent = `${completionRate}%`;
    
    // Update social links
    if (portfolio.socialLinks) {
        if (portfolio.socialLinks.github) document.getElementById('github').value = portfolio.socialLinks.github;
        if (portfolio.socialLinks.linkedin) document.getElementById('linkedin').value = portfolio.socialLinks.linkedin;
        if (portfolio.socialLinks.website) document.getElementById('website').value = portfolio.socialLinks.website;
    }
    
    // Update interview mode
    if (portfolio.interviewMode) {
        document.getElementById('interviewModeEnabled').checked = portfolio.interviewMode.enabled;
        if (portfolio.interviewMode.hourlyRate) document.getElementById('hourlyRate').value = portfolio.interviewMode.hourlyRate;
        if (portfolio.interviewMode.skills) document.getElementById('interviewSkills').value = portfolio.interviewMode.skills.join(', ');
        if (portfolio.interviewMode.description) document.getElementById('interviewDescription').value = portfolio.interviewMode.description;
        
        toggleInterviewModeSettings();
    }
    
    // Display skills
    displaySkills(portfolio.skills || []);
    
    // Display platform profiles
    displayPlatformProfiles(portfolio.platformProfiles || []);
    
    // Display projects
    displayProjects(portfolio.projects || []);
    
    // Display education
    displayEducation(portfolio.education || []);
    
    // Display experience
    displayExperience(portfolio.experience || []);
}

// Display skills
function displaySkills(skills) {
    const container = document.getElementById('skillsContainer');
    
    if (skills.length === 0) {
        container.innerHTML = '<p style="color: #718096; text-align: center;">No skills added yet.</p>';
        return;
    }
    
    // Group skills by category
    const skillCategories = {};
    skills.forEach(skill => {
        if (!skillCategories[skill.category]) {
            skillCategories[skill.category] = [];
        }
        skillCategories[skill.category].push(skill);
    });
    
    let html = '';
    Object.keys(skillCategories).forEach(category => {
        html += `<div class="skill-category">
            <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>`;
        
        skillCategories[category].forEach(skill => {
            html += `<div class="skill-item">
                <div class="skill-name">${skill.name}</div>
                <div class="skill-details">
                    <span>${skill.yearsOfExperience || 0} years</span>
                    <span class="skill-level">${skill.level}</span>
                </div>
                <button class="btn btn-danger" style="margin-top: 10px; padding: 5px 10px; font-size: 0.8rem;" onclick="removeSkill('${skill._id}')">Remove</button>
            </div>`;
        });
        
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// Display platform profiles
function displayPlatformProfiles(platforms) {
    const container = document.getElementById('platformsContainer');
    
    if (platforms.length === 0) {
        container.innerHTML = '<p style="color: #718096; text-align: center;">No platform profiles added yet.</p>';
        return;
    }
    
    let html = '';
    platforms.forEach(platform => {
        html += `<div class="platform-profile">
            <div class="platform-header">
                <div>
                    <div class="platform-name">${platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}</div>
                    <div class="platform-username">@${platform.username}</div>
                </div>
                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="removePlatform('${platform._id}')">Remove</button>
            </div>
            <div class="platform-stats">
                <div class="platform-stat">
                    <div class="platform-stat-value">${platform.rating || 'N/A'}</div>
                    <div class="platform-stat-label">Rating</div>
                </div>
                <div class="platform-stat">
                    <div class="platform-stat-value">${platform.solvedCount || 'N/A'}</div>
                    <div class="platform-stat-label">Solved</div>
                </div>
                <div class="platform-stat">
                    <div class="platform-stat-value">${platform.totalProblems || 'N/A'}</div>
                    <div class="platform-stat-label">Total</div>
                </div>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

// Display projects
function displayProjects(projects) {
    const container = document.getElementById('projectsContainer');
    
    if (projects.length === 0) {
        container.innerHTML = '<p style="color: #718096; text-align: center;">No projects added yet.</p>';
        return;
    }
    
    let html = '';
    projects.forEach(project => {
        const statusColors = {
            'completed': '#48bb78',
            'in_progress': '#ed8936',
            'on_hold': '#e53e3e'
        };
        
        html += `<div class="project-card">
            <div class="project-header">
                <div>
                    <div class="project-title">${project.title}</div>
                </div>
                <span class="project-status" style="background: ${statusColors[project.status] || '#48bb78'}">${project.status.replace('_', ' ')}</span>
            </div>
            <div class="project-description">${project.description || 'No description provided.'}</div>
            <div class="project-tech">`;
        
        if (project.technologies && project.technologies.length > 0) {
            project.technologies.forEach(tech => {
                html += `<span class="tech-tag">${tech.trim()}</span>`;
            });
        }
        
        html += `</div>
            <div class="project-links">`;
        
        if (project.githubUrl) {
            html += `<a href="${project.githubUrl}" target="_blank" class="project-link">GitHub</a>`;
        }
        
        if (project.liveUrl) {
            html += `<a href="${project.liveUrl}" target="_blank" class="project-link">Live Demo</a>`;
        }
        
        html += `<button class="btn btn-danger" onclick="removeProject('${project._id}')">Remove</button>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

// Display education
function displayEducation(education) {
    const container = document.getElementById('educationContainer');
    
    if (education.length === 0) {
        container.innerHTML = '<p style="color: #718096; text-align: center;">No education added yet.</p>';
        return;
    }
    
    let html = '';
    education.forEach(edu => {
        html += `<div class="project-card">
            <div class="project-header">
                <div>
                    <div class="project-title">${edu.institution}</div>
                    <div style="color: #667eea; font-weight: 500;">${edu.degree} ${edu.field ? `- ${edu.field}` : ''}</div>
                </div>
                <button class="btn btn-danger" onclick="removeEducation('${edu._id}')">Remove</button>
            </div>
            <div class="project-description">
                ${edu.startDate ? `From: ${new Date(edu.startDate).getFullYear()}` : ''}
                ${edu.endDate ? `To: ${new Date(edu.endDate).getFullYear()}` : ''}
                ${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
            </div>
            ${edu.description ? `<div class="project-description">${edu.description}</div>` : ''}
        </div>`;
    });
    
    container.innerHTML = html;
}

// Display experience
function displayExperience(experience) {
    const container = document.getElementById('experienceContainer');
    
    if (experience.length === 0) {
        container.innerHTML = '<p style="color: #718096; text-align: center;">No experience added yet.</p>';
        return;
    }
    
    let html = '';
    experience.forEach(exp => {
        html += `<div class="project-card">
            <div class="project-header">
                <div>
                    <div class="project-title">${exp.position}</div>
                    <div style="color: #667eea; font-weight: 500;">${exp.company}</div>
                </div>
                <button class="btn btn-danger" onclick="removeExperience('${exp._id}')">Remove</button>
            </div>
            <div class="project-description">
                ${exp.startDate ? `From: ${new Date(exp.startDate).getFullYear()}` : ''}
                ${exp.current ? ' - Present' : (exp.endDate ? ` - ${new Date(exp.endDate).getFullYear()}` : '')}
            </div>
            ${exp.description ? `<div class="project-description">${exp.description}</div>` : ''}
            ${exp.technologies && exp.technologies.length > 0 ? `
                <div class="project-tech">
                    ${exp.technologies.map(tech => `<span class="tech-tag">${tech.trim()}</span>`).join('')}
                </div>
            ` : ''}
        </div>`;
    });
    
    container.innerHTML = html;
}

// Update personal information
async function updatePersonalInfo() {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        const headline = document.getElementById('headline').value;
        const summary = document.getElementById('summary').value;

        const response = await fetch(`${API_BASE_URL}/portfolios/user/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ headline, summary })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Personal information updated successfully!', 'success');
        } else {
            showNotification(data.message || 'Failed to update personal information', 'error');
        }
    } catch (error) {
        console.error('Update personal info error:', error);
        showNotification('Failed to update personal information', 'error');
    }
}

// Update social links
async function updateSocialLinks() {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        const github = document.getElementById('github').value;
        const linkedin = document.getElementById('linkedin').value;
        const website = document.getElementById('website').value;

        const response = await fetch(`${API_BASE_URL}/portfolios/user/social-links`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ github, linkedin, website })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Social links updated successfully!', 'success');
        } else {
            showNotification(data.message || 'Failed to update social links', 'error');
        }
    } catch (error) {
        console.error('Update social links error:', error);
        showNotification('Failed to update social links', 'error');
    }
}

// Update interview mode
async function updateInterviewMode() {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        const enabled = document.getElementById('interviewModeEnabled').checked;
        const hourlyRate = document.getElementById('hourlyRate').value;
        const skills = document.getElementById('interviewSkills').value;
        const description = document.getElementById('interviewDescription').value;

        const interviewMode = {
            enabled,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
            skills: skills ? skills.split(',').map(s => s.trim()) : [],
            description
        };

        const response = await fetch(`${API_BASE_URL}/portfolios/user/interview-mode`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(interviewMode)
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Interview mode settings updated successfully!', 'success');
        } else {
            showNotification(data.message || 'Failed to update interview mode settings', 'error');
        }
    } catch (error) {
        console.error('Update interview mode error:', error);
        showNotification('Failed to update interview mode settings', 'error');
    }
}

// Toggle interview mode settings visibility
function toggleInterviewModeSettings() {
    const enabled = document.getElementById('interviewModeEnabled').checked;
    const settings = document.getElementById('interviewModeSettings');
    settings.style.display = enabled ? 'block' : 'none';
}

// Add skill
async function addSkill() {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        const name = document.getElementById('skillName').value;
        const level = document.getElementById('skillLevel').value;
        const category = document.getElementById('skillCategory').value;
        const yearsOfExperience = document.getElementById('skillExperience').value;

        if (!name || !level || !category) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/portfolios/user/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                level,
                category,
                yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Skill added successfully!', 'success');
            closeModal('addSkillModal');
            document.getElementById('addSkillModal').querySelector('form')?.reset();
            loadPortfolio(); // Reload to show new skill
        } else {
            showNotification(data.message || 'Failed to add skill', 'error');
        }
    } catch (error) {
        console.error('Add skill error:', error);
        showNotification('Failed to add skill', 'error');
    }
}

// Add platform profile
async function addPlatform() {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        const platform = document.getElementById('platformName').value;
        const username = document.getElementById('platformUsername').value;
        const profileUrl = document.getElementById('platformUrl').value;
        const rating = document.getElementById('platformRating').value;

        if (!platform || !username) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/portfolios/user/platforms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                platform,
                username,
                profileUrl: profileUrl || undefined,
                rating: rating ? parseInt(rating) : undefined
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Platform profile added successfully!', 'success');
            closeModal('addPlatformModal');
            document.getElementById('addPlatformModal').querySelector('form')?.reset();
            loadPortfolio(); // Reload to show new platform
        } else {
            showNotification(data.message || 'Failed to add platform profile', 'error');
        }
    } catch (error) {
        console.error('Add platform error:', error);
        showNotification('Failed to add platform profile', 'error');
    }
}

// Add project
async function addProject() {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        const title = document.getElementById('projectTitle').value;
        const description = document.getElementById('projectDescription').value;
        const technologies = document.getElementById('projectTechnologies').value;
        const githubUrl = document.getElementById('projectGithub').value;
        const liveUrl = document.getElementById('projectLive').value;
        const status = document.getElementById('projectStatus').value;

        if (!title || !description) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/portfolios/user/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                technologies: technologies ? technologies.split(',').map(t => t.trim()) : [],
                githubUrl: githubUrl || undefined,
                liveUrl: liveUrl || undefined,
                status
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Project added successfully!', 'success');
            closeModal('addProjectModal');
            document.getElementById('addProjectModal').querySelector('form')?.reset();
            loadPortfolio(); // Reload to show new project
        } else {
            showNotification(data.message || 'Failed to add project', 'error');
        }
    } catch (error) {
        console.error('Add project error:', error);
        showNotification('Failed to add project', 'error');
    }
}

// Remove skill
async function removeSkill(skillId) {
    if (!confirm('Are you sure you want to remove this skill?')) return;
    
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        const response = await fetch(`${API_BASE_URL}/portfolios/user/skills/${skillId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Skill removed successfully!', 'success');
            loadPortfolio(); // Reload to update display
        } else {
            showNotification(data.message || 'Failed to remove skill', 'error');
        }
    } catch (error) {
        console.error('Remove skill error:', error);
        showNotification('Failed to remove skill', 'error');
    }
}

// Remove platform profile
async function removePlatform(platformId) {
    if (!confirm('Are you sure you want to remove this platform profile?')) return;
    
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        // Note: This would need a DELETE endpoint for platforms
        showNotification('Platform removal not implemented yet', 'info');
    } catch (error) {
        console.error('Remove platform error:', error);
        showNotification('Failed to remove platform profile', 'error');
    }
}

// Remove project
async function removeProject(projectId) {
    if (!confirm('Are you sure you want to remove this project?')) return;
    
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        const response = await fetch(`${API_BASE_URL}/portfolios/user/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Project removed successfully!', 'success');
            loadPortfolio(); // Reload to update display
        } else {
            showNotification(data.message || 'Failed to remove project', 'error');
        }
    } catch (error) {
        console.error('Remove project error:', error);
        showNotification('Failed to remove project', 'error');
    }
}

// Remove education
async function removeEducation(educationId) {
    if (!confirm('Are you sure you want to remove this education entry?')) return;
    
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        // Note: This would need a DELETE endpoint for education
        showNotification('Education removal not implemented yet', 'info');
    } catch (error) {
        console.error('Remove education error:', error);
        showNotification('Failed to remove education entry', 'error');
    }
}

// Remove experience
async function removeExperience(experienceId) {
    if (!confirm('Are you sure you want to remove this experience entry?')) return;
    
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        // Note: This would need a DELETE endpoint for experience
        showNotification('Experience removal not implemented yet', 'info');
    } catch (error) {
        console.error('Remove experience error:', error);
        showNotification('Failed to remove experience entry', 'error');
    }
}

// Show modal
function showAddSkillForm() {
    document.getElementById('addSkillModal').style.display = 'flex';
}

function showAddPlatformForm() {
    document.getElementById('addPlatformModal').style.display = 'flex';
}

function showAddProjectForm() {
    document.getElementById('addProjectModal').style.display = 'flex';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('form-overlay')) {
        event.target.style.display = 'none';
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio page loaded');
    
    // Load portfolio data
    loadPortfolio();
    
    // Add event listeners
    document.getElementById('interviewModeEnabled').addEventListener('change', toggleInterviewModeSettings);
});

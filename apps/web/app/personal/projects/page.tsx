'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Folder,
  BarChart3,
  FolderOpen,
  CheckCircle,
  Clock,
  Star,
  Layers,
  Globe,
  Smartphone,
  Zap,
  Download,
  Upload,
  Share2,
  Plus,
  X,
  Info,
  Settings,
  Code,
  FileText,
  Calendar,
  Eye,
  AlertTriangle,
  Lightbulb,
  Check,
  Github,
  ExternalLink,
  Edit
} from 'lucide-react'

interface Project {
  id: string
  title: string
  status: 'Completed' | 'In Progress' | 'On Hold' | 'Planning'
  description: string
  technologies: string[]
  category: string
  completionDate?: string
  views?: string
  rating?: number
  github?: string
  liveDemo?: string
  features: string[]
  challenges?: string
  solutions?: string
  progress?: number
  startDate?: string
  dueDate?: string
  pauseDate?: string
  accuracy?: string
}

interface ProjectFormData {
  name: string
  description: string
  category: string
  status: string
  technologies: string
  github: string
  demo: string
  startDate: string
  endDate: string
  features: string
}

export default function PersonalProjectsPage() {
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    category: 'web-dev',
    status: 'planning',
    technologies: '',
    github: '',
    demo: '',
    startDate: '',
    endDate: '',
    features: ''
  })

  // Fetch projects data
  useEffect(() => {
    const fetchProjectsData = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch('/api/personal/projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch projects data')
        }

        const result = await response.json()
        if (result.success) {
          const { projects: apiProjects } = result.data
          
          // Transform API data to match component interface
          const transformedProjects = apiProjects.map((project: any) => ({
            id: project.id,
            title: project.title,
            status: project.status === 'IN_PROGRESS' ? 'In Progress' : 
                   project.status === 'COMPLETED' ? 'Completed' :
                   project.status === 'ON_HOLD' ? 'On Hold' : 'Planning',
            description: project.description,
            technologies: project.tags || [],
            category: project.category || 'Web Development',
            completionDate: project.endDate ? new Date(project.endDate).toLocaleDateString() : undefined,
            views: '0',
            rating: 0,
            github: '',
            liveDemo: '',
            features: [],
            challenges: '',
            solutions: '',
            progress: project.progress || 0
          }))
          
          setProjects(transformedProjects)
        }
      } catch (error) {
        console.error('Error fetching projects data:', error)
        setError('Failed to load projects data')
      } finally {
        setLoading(false)
      }
    }

    fetchProjectsData()
  }, [])

  // Mock projects for fallback
  const mockProjects: Project[] = [
    {
      id: 'ecommerce',
      title: 'E-Commerce Platform',
      status: 'Completed',
      description: 'A full-stack e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, product management, shopping cart, and payment integration.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe'],
      category: 'Web Development',
      completionDate: '2 weeks ago',
      views: '1.2k',
      rating: 4.9,
      github: 'https://github.com/username/ecommerce-platform',
      liveDemo: 'https://ecommerce-demo.com',
      features: ['User Authentication', 'Product Management', 'Shopping Cart', 'Payment Integration', 'Admin Dashboard'],
      challenges: 'Implementing real-time inventory management and payment processing',
      solutions: 'Used WebSocket for real-time updates and integrated Stripe for secure payments'
    },
    {
      id: 'dashboard',
      title: 'Data Analytics Dashboard',
      status: 'Completed',
      description: 'An interactive dashboard for visualizing business metrics using D3.js and React. Includes charts, graphs, and real-time data updates.',
      technologies: ['React', 'D3.js', 'Node.js', 'PostgreSQL', 'Chart.js'],
      category: 'Data Science',
      completionDate: '1 month ago',
      views: '856',
      rating: 4.7,
      github: 'https://github.com/username/analytics-dashboard',
      liveDemo: 'https://dashboard-demo.com',
      features: ['Real-time Charts', 'Data Visualization', 'Export Reports', 'User Management', 'Custom Dashboards'],
      challenges: 'Handling large datasets and creating responsive visualizations',
      solutions: 'Implemented data pagination and used Web Workers for heavy computations'
    },
    {
      id: 'task-app',
      title: 'Task Management App',
      status: 'In Progress',
      description: 'A mobile task management application built with React Native. Features include task creation, priority levels, due dates, and team collaboration.',
      technologies: ['React Native', 'Firebase', 'Redux', 'Expo', 'AsyncStorage'],
      category: 'Mobile Apps',
      progress: 65,
      startDate: '1 month ago',
      dueDate: '2 weeks',
      github: 'https://github.com/username/task-app',
      features: ['Task Creation', 'Priority Levels', 'Due Dates', 'Team Collaboration', 'Push Notifications'],
      challenges: 'Implementing offline functionality and real-time sync',
      solutions: 'Used AsyncStorage for offline data and Firebase for real-time synchronization'
    },
    {
      id: 'ml-classifier',
      title: 'ML Image Classifier',
      status: 'On Hold',
      description: 'A machine learning model for image classification using TensorFlow and Python. The model can classify images into 10 different categories with 92% accuracy.',
      technologies: ['Python', 'TensorFlow', 'OpenCV', 'NumPy', 'Pandas'],
      category: 'Machine Learning',
      accuracy: '92%',
      pauseDate: '2 weeks ago',
      github: 'https://github.com/username/ml-classifier',
      features: ['Image Classification', 'Model Training', 'API Endpoint', 'Batch Processing', 'Accuracy Metrics'],
      challenges: 'Achieving high accuracy with limited training data',
      solutions: 'Used data augmentation and transfer learning with pre-trained models'
    }
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'green'
      case 'In Progress': return 'amber'
      case 'On Hold': return 'blue'
      default: return 'gray'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Completed': return 'check-circle'
      case 'In Progress': return 'clock'
      case 'On Hold': return 'pause'
      default: return 'circle'
    }
  }

  const showProjectDetails = (project: Project) => {
    setSelectedProject(project)
    setShowProjectModal(true)
  }

  const closeProjectModal = () => {
    setShowProjectModal(false)
    setSelectedProject(null)
  }

  const showCreateProjectModal = () => {
    setShowCreateModal(true)
  }

  const closeCreateProjectModal = () => {
    setShowCreateModal(false)
    setFormData({
      name: '',
      description: '',
      category: 'web-dev',
      status: 'planning',
      technologies: '',
      github: '',
      demo: '',
      startDate: '',
      endDate: '',
      features: ''
    })
  }

  const createNewProject = () => {
    const { name, description } = formData
    
    if (!name || !description) {
      alert('Please fill in all required fields (Project Name and Description)')
      return
    }

    // Here you would typically save the project to your backend
    const projectData = {
      ...formData,
      technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
      features: formData.features.split(',').map(feature => feature.trim()).filter(feature => feature)
    }
    
    console.log('Creating new project:', projectData)
    
    closeCreateProjectModal()
    alert('Project created successfully!')
  }

  const editProject = (projectId: string) => {
    console.log('Editing project:', projectId)
    // Implementation for editing project
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg page-header-icon">
          <Folder className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 mb-1">Projects</h1>
          <p className="text-sm text-slate-600">Showcase your coding projects and track progress</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Project Overview</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">12</span>
            </div>
            <div className="text-sm text-slate-600">Total Projects</div>
            <div className="text-xs text-blue-600 mt-1">+2 this month</div>
          </div>
          
          <div className="stat-card rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">8</span>
            </div>
            <div className="text-sm text-slate-600">Completed</div>
            <div className="text-xs text-green-600 mt-1">67% success rate</div>
          </div>
          
          <div className="stat-card rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-2xl font-bold text-amber-600">3</span>
            </div>
            <div className="text-sm text-slate-600">In Progress</div>
            <div className="text-xs text-amber-600 mt-1">Active development</div>
          </div>
          
          <div className="stat-card rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">4.8</span>
            </div>
            <div className="text-sm text-slate-600">Avg. Rating</div>
            <div className="text-xs text-purple-600 mt-1">From 24 reviews</div>
          </div>
        </div>
      </div>

      {/* Project Categories Section */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Project Categories</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="category-card p-4 bg-blue-50 rounded-xl text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-slate-800 mb-1">Completed</div>
            <div className="text-sm text-slate-600">8 projects</div>
            <div className="text-xs text-blue-600 mt-1">View all →</div>
          </div>
          
          <div className="category-card p-4 bg-amber-50 rounded-xl text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-slate-800 mb-1">In Progress</div>
            <div className="text-sm text-slate-600">3 projects</div>
            <div className="text-xs text-amber-600 mt-1">View all →</div>
          </div>
          
          <div className="category-card p-4 bg-purple-50 rounded-xl text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-slate-800 mb-1">Web Development</div>
            <div className="text-sm text-slate-600">5 projects</div>
            <div className="text-xs text-purple-600 mt-1">View all →</div>
          </div>
          
          <div className="category-card p-4 bg-green-50 rounded-xl text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-lg font-bold text-slate-800 mb-1">Mobile Apps</div>
            <div className="text-sm text-slate-600">3 projects</div>
            <div className="text-xs text-green-600 mt-1">View all →</div>
          </div>
        </div>
      </div>

      {/* Projects List Section */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Recent Projects</h2>
          </div>
          <button 
            onClick={showCreateProjectModal}
            className="action-button px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
        
        <div className="space-y-4">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="project-card p-4 bg-green-50 rounded-xl cursor-pointer"
              onClick={() => showProjectDetails(project)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${getStatusColor(project.status) === 'green' ? 'bg-green-100' : getStatusColor(project.status) === 'amber' ? 'bg-amber-100' : 'bg-blue-100'} rounded-xl flex items-center justify-center`}>
                  {project.category === 'Web Development' ? <Globe className="w-6 h-6 text-green-600" /> :
                   project.category === 'Data Science' ? <BarChart3 className="w-6 h-6 text-green-600" /> :
                   project.category === 'Mobile Apps' ? <Smartphone className="w-6 h-6 text-amber-600" /> :
                   <Code className="w-6 h-6 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-800">{project.title}</h3>
                    <span className={`px-2 py-1 ${getStatusColor(project.status)}-100 text-${getStatusColor(project.status)}-700 text-xs font-medium rounded`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{project.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">
                    {project.completionDate || project.startDate || project.pauseDate}
                  </div>
                  <div className={`text-xs ${getStatusColor(project.status)}-600`}>
                    {project.views || `${project.progress}% complete` || project.accuracy}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="action-button w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left flex items-center gap-3 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">Import Project</div>
              <div className="text-xs text-slate-600">Import from GitHub/GitLab</div>
            </div>
          </button>
          
          <button className="action-button w-full p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-left flex items-center gap-3 transition-colors">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">Export Portfolio</div>
              <div className="text-xs text-slate-600">Generate PDF portfolio</div>
            </div>
          </button>
          
          <button className="action-button w-full p-4 bg-amber-50 hover:bg-amber-100 rounded-xl text-left flex items-center gap-3 transition-colors">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">Share Portfolio</div>
              <div className="text-xs text-slate-600">Share with potential employers</div>
            </div>
          </button>
        </div>
      </div>

      {/* Project Details Modal */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 modal-overlay flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">{selectedProject.title}</h3>
              <button 
                onClick={closeProjectModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-8">
              {/* Project Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Folder className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h4 className="text-2xl font-bold text-slate-800">{selectedProject.title}</h4>
                      <span className={`px-4 py-2 bg-${getStatusColor(selectedProject.status)}-100 text-${getStatusColor(selectedProject.status)}-700 text-sm font-semibold rounded-full shadow-sm`}>
                        {selectedProject.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-lg leading-relaxed">{selectedProject.description}</p>
                  </div>
                </div>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm text-slate-600">Category</div>
                  <div className="font-semibold text-slate-800">{selectedProject.category}</div>
                </div>
                
                {selectedProject.completionDate && (
                  <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-sm text-slate-600">Completed</div>
                    <div className="font-semibold text-slate-800">{selectedProject.completionDate}</div>
                  </div>
                )}
                
                {selectedProject.views && (
                  <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Eye className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-sm text-slate-600">Views</div>
                    <div className="font-semibold text-slate-800">{selectedProject.views}</div>
                  </div>
                )}
                
                {selectedProject.rating && (
                  <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Star className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-sm text-slate-600">Rating</div>
                    <div className="font-semibold text-slate-800">{selectedProject.rating}/5</div>
                  </div>
                )}
              </div>

              {/* Technologies */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-600" />
                  Technologies Used
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech, index) => (
                    <span key={index} className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200">
                      <Zap className="w-3 h-3 inline mr-1" />
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Key Features
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedProject.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedProject.challenges && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Challenges Faced
                    </h5>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-slate-700 leading-relaxed">{selectedProject.challenges}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                      Solutions Implemented
                    </h5>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-slate-700 leading-relaxed">{selectedProject.solutions}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  {selectedProject.github && (
                    <a 
                      href={selectedProject.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 text-center font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Github className="w-5 h-5" />
                      View Code
                    </a>
                  )}
                  {selectedProject.liveDemo && (
                    <a 
                      href={selectedProject.liveDemo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-center font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Live Demo
                    </a>
                  )}
                  <button 
                    onClick={() => editProject(selectedProject.id)}
                    className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 modal-overlay flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Create New Project</h3>
                    <p className="text-slate-600">Add a new project to your portfolio</p>
                  </div>
                </div>
                <button 
                  onClick={closeCreateProjectModal}
                  className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Form Content */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Project Name *</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter project name..." 
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4} 
                      placeholder="Describe your project, its purpose, and key features..." 
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Project Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="web-dev">🌐 Web Development</option>
                      <option value="mobile">📱 Mobile Apps</option>
                      <option value="ml">🤖 Machine Learning</option>
                      <option value="data-science">📊 Data Science</option>
                      <option value="other">🔧 Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="planning">📋 Planning</option>
                      <option value="in-progress">⏳ In Progress</option>
                      <option value="completed">✅ Completed</option>
                      <option value="on-hold">⏸️ On Hold</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Technologies */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-green-600" />
                  Technologies Used
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Technologies</label>
                    <input 
                      type="text" 
                      value={formData.technologies}
                      onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                      placeholder="React, Node.js, MongoDB, Express..." 
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-slate-500 mt-1">Separate technologies with commas</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">GitHub Repository (Optional)</label>
                    <input 
                      type="url" 
                      value={formData.github}
                      onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="https://github.com/username/project" 
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Live Demo URL (Optional)</label>
                    <input 
                      type="url" 
                      value={formData.demo}
                      onChange={(e) => setFormData(prev => ({ ...prev, demo: e.target.value }))}
                      placeholder="https://your-project.com" 
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Additional Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                    <input 
                      type="date" 
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Expected Completion</label>
                    <input 
                      type="date" 
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Key Features</label>
                  <textarea 
                    value={formData.features}
                    onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                    rows={3} 
                    placeholder="List the main features of your project..." 
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 mt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={closeCreateProjectModal}
                  className="flex-1 px-6 py-3 text-slate-600 border border-slate-300 rounded-xl hover:bg-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button 
                  onClick={createNewProject}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
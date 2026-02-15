import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCalendar, FiMapPin, FiClock, FiBriefcase, FiCode, FiDatabase, FiSmartphone, FiPenTool, FiDollarSign, FiUsers } from 'react-icons/fi'

// Helper function to get icon based on job title
const getJobIcon = (title) => {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('frontend') || titleLower.includes('web') || titleLower.includes('react')) return FiCode
  if (titleLower.includes('data') || titleLower.includes('analyst')) return FiDatabase
  if (titleLower.includes('mobile') || titleLower.includes('app')) return FiSmartphone
  if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux')) return FiPenTool
  return FiBriefcase
}

// Helper function to get color based on job type
const getJobColor = (index) => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-indigo-500 to-indigo-600', 
    'from-cyan-500 to-cyan-600',
    'from-blue-400 to-blue-500'
  ]
  return colors[index % colors.length]
}

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Helper function to calculate days ago
const getDaysAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

const FeaturedInternships = () => {
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/jobs')
        if (response.ok) {
          const data = await response.json()
          console.log('API Response:', data) // Debug log
          
          // Handle different response structures
          let jobsArray = []
          if (Array.isArray(data)) {
            jobsArray = data
          } else if (data.jobs && Array.isArray(data.jobs)) {
            jobsArray = data.jobs
          } else if (data.data && Array.isArray(data.data)) {
            jobsArray = data.data
          }
          
          // Transform the data to match our component structure
          const transformedJobs = jobsArray.slice(0, 3).map((job, index) => ({
            id: job._id || job.id,
            title: job.title || job.jobTitle || 'Internship Position',
            company: job.companyName || job.company || 'Company',
            initials: (job.companyName || job.company || 'CO').split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2),
            location: job.location || 'Pakistan',
            type: job.type || job.jobType || job.workType || 'Full-time',
            duration: job.duration || '3-6 months',
            posted: getDaysAgo(job.createdAt || job.datePosted || new Date()),
            deadline: formatDate(job.deadline || job.applicationDeadline || new Date(Date.now() + 30*24*60*60*1000)),
            skills: job.requirements || job.skills || job.technologyStack || job.requiredSkills || ['React', 'JavaScript'],
            description: job.description || job.jobDescription || 'Join our team for an exciting internship opportunity.',
            salary: job.salary || job.isPaid || 'Unpaid',
            applicationsCount: job.applicationsCount || job.applications || 0,
            applicationLimit: job.applicationLimit || 50,
            icon: getJobIcon(job.title || job.jobTitle || 'internship'),
            color: getJobColor(index)
          }))
          setInternships(transformedJobs)
        } else {
          console.error('Failed to fetch jobs')
          setInternships([])
        }
      } catch (error) {
        console.error('Error fetching internships:', error)
        setInternships([])
      } finally {
        setLoading(false)
      }
    }

    fetchInternships()
  }, [])

  return (
    <section className="py-12 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003366] mb-4">
            Featured <span className="text-[#0059b3]">Internships</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#003366]/80">
            Discover exciting internship opportunities from top companies seeking fresh talent.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-[#0059b3] animate-spin"></div>
          </div>
        ) : internships.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {internships.map(internship => {
                const IconComponent = internship.icon
                return (
                  <div 
                    key={internship.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-blue-100 overflow-hidden"
                  >
                    <div className={`h-2 bg-gradient-to-r ${internship.color}`}></div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${internship.color} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {internship.initials}
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">Posted</span>
                          <p className="text-sm font-medium text-[#0059b3]">{internship.posted}</p>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-[#003366] mb-2 group-hover:text-[#0059b3] transition-colors line-clamp-2">
                        {internship.title}
                      </h3>
                      
                      <p className="text-[#0059b3] font-semibold mb-3">
                        {internship.company}
                      </p>
                      
                      {/* Job Description */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                        <p className="text-gray-800 text-sm line-clamp-2">
                          {internship.description}
                        </p>
                      </div>
                      
                      {/* Location & Salary */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center p-2 bg-gray-50 rounded text-xs">
                          <FiMapPin className="w-3 h-3 text-[#003366] mr-1" />
                          <span className="text-gray-700 font-medium truncate">{internship.location}</span>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded text-xs">
                          {(internship.salary && internship.salary !== 'Unpaid' && internship.salary !== '0') ? (
                            <>
                              <FiDollarSign className="w-3 h-3 text-green-600 mr-1" />
                              <span className="text-green-700 font-medium">{internship.salary}</span>
                            </>
                          ) : (
                            <>
                              <FiDollarSign className="w-3 h-3 text-gray-500 mr-1" />
                              <span className="text-gray-600">Unpaid</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Duration & Type */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center p-2 bg-gray-50 rounded text-xs">
                          <FiClock className="w-3 h-3 text-[#0059b3] mr-1" />
                          <span className="text-gray-700 font-medium truncate">{internship.duration}</span>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded text-xs">
                          <FiBriefcase className="w-3 h-3 text-[#003366] mr-1" />
                          <span className="text-gray-700 font-medium">{internship.type}</span>
                        </div>
                      </div>
                      
                      {/* Skills */}
                      <div className="bg-gray-50 rounded-lg p-2 mb-3">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(internship.skills) ? internship.skills : [internship.skills]).slice(0, 3).map((skill, index) => (
                            <span 
                              key={index}
                              className="bg-[#003366] text-white text-xs px-2 py-1 rounded font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {(Array.isArray(internship.skills) ? internship.skills : [internship.skills]).length > 3 && (
                            <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded font-medium">
                              +{(Array.isArray(internship.skills) ? internship.skills : [internship.skills]).length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Application Info */}
                      <div className="bg-gray-50 p-2 rounded mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 font-medium">
                            <FiUsers className="w-3 h-3 inline mr-1" />
                            Applications
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="font-semibold text-[#003366]">
                              {internship.applicationsCount}
                            </span>
                            <span className="text-gray-500">/</span>
                            <span className="text-gray-700">{internship.applicationLimit}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-red-600 text-xs mt-1">
                          <FiCalendar className="w-3 h-3 mr-1" />
                          <span>Deadline: {internship.deadline}</span>
                        </div>
                      </div>
                      
                      <Link 
                        to="/register"
                        className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#0059b3] text-white font-semibold rounded-xl hover:bg-[#003366] transition-colors group-hover:shadow-lg transform group-hover:-translate-y-1 duration-300"
                      >
                        View Details
                        <FiArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="text-center">
              <Link 
                to="/internships" 
                className="inline-flex items-center px-8 py-4 bg-[#0059b3] text-white font-semibold rounded-xl hover:bg-[#003366] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
              >
                View All Internships
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-[#003366]/60">No internships available at the moment.</p>
            <p className="text-[#0059b3] mt-2">Check back soon for new opportunities!</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedInternships
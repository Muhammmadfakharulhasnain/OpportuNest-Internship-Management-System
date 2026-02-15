import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiMapPin, FiBriefcase, FiCode, FiDatabase, FiSettings, FiLayers, FiCloud } from 'react-icons/fi'

// Mock data for partner companies
const mockCompanies = [
  {
    id: 1,
    name: 'TechSolutions Inc.',
    industry: 'Information Technology',
    location: 'Islamabad, Pakistan',
    internships: 12,
    icon: FiCode,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    name: 'DataMetrics',
    industry: 'Data Analytics',
    location: 'Lahore, Pakistan',
    internships: 8,
    icon: FiDatabase,
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 3,
    name: 'AppNexus Solutions',
    industry: 'Software Development',
    location: 'Karachi, Pakistan',
    internships: 5,
    icon: FiLayers,
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 4,
    name: 'Creative Designs',
    industry: 'Design',
    location: 'Islamabad, Pakistan',
    internships: 3,
    icon: FiSettings,
    color: 'from-blue-400 to-blue-500'
  },
  {
    id: 5,
    name: 'Cloud Innovations',
    industry: 'Cloud Computing',
    location: 'Rawalpindi, Pakistan',
    internships: 7,
    icon: FiCloud,
    color: 'from-sky-500 to-sky-600'
  },
  {
    id: 6,
    name: 'ERP Solutions',
    industry: 'Enterprise Software',
    location: 'Faisalabad, Pakistan',
    internships: 4,
    icon: FiDatabase,
    color: 'from-blue-600 to-blue-700'
  }
]

const PartnerCompanies = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchCompanies = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 600))
        setCompanies(mockCompanies)
      } catch (error) {
        console.error('Error fetching companies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003366] mb-4">
            Our <span className="text-[#0059b3]">Partner Companies</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#003366]/80">
            Join forces with industry leaders and innovative startups offering exceptional internship opportunities
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-[#0059b3] animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {companies.map(company => {
                const IconComponent = company.icon
                return (
                  <div 
                    key={company.id}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-100 overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${company.color}`}></div>
                    
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${company.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-[#0059b3] font-semibold">
                            <FiBriefcase className="w-4 h-4 mr-1" />
                            <span>{company.internships}</span>
                          </div>
                          <p className="text-xs text-gray-500">Open Positions</p>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-[#003366] mb-2 group-hover:text-[#0059b3] transition-colors">
                        {company.name}
                      </h3>
                      
                      <p className="text-[#0059b3] font-medium mb-3">
                        {company.industry}
                      </p>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <FiMapPin className="w-4 h-4 mr-2" />
                        <span>{company.location}</span>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <Link 
                          to="/register"
                          className="inline-flex items-center text-[#0059b3] font-semibold hover:text-[#003366] transition-colors group-hover:translate-x-1 transform duration-300"
                        >
                          View Opportunities
                          <FiArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="text-center">
              <Link 
                to="/register" 
                className="inline-flex items-center px-8 py-4 bg-[#0059b3] text-white font-semibold rounded-xl hover:bg-[#003366] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
              >
                Explore All Companies
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default PartnerCompanies
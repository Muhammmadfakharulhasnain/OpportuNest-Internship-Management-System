import { Link } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import { Briefcase, Building } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useState, useEffect } from 'react'
import Landing1 from '../../assets/Landing1.jpg'
import Landing2 from '../../assets/Landing2.jpeg'
import Landing3 from '../../assets/Landing3.JPG'
import Landing4 from '../../assets/Landing4.jpg'

const HeroSection = () => {
  const { isAuthenticated, userRole } = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = [Landing1, Landing2, Landing3, Landing4]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const getCtaLink = () => {
    if (!isAuthenticated) return '/register'
    if (userRole === 'student') return '/internships'
    if (userRole === 'company') return '/dashboard/company'
    return '/dashboard/admin'
  }

  const getCtaText = () => {
    if (!isAuthenticated) return 'Get Started'
    if (userRole === 'student') return 'Find Internships'
    if (userRole === 'company') return 'Post Internship'
    return 'Go to Dashboard'
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-100 to-blue-300 pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="absolute inset-0 bg-black bg-opacity-10 z-0"></div>
      <div className="absolute inset-0 bg-[size:50px_50px] bg-grid-white/[0.05] z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#003366] tracking-tight">
              <span className="block">Launch Your Career with</span>
              <span className="block text-[#0059b3]">COMSATS Internships</span>
            </h1>

            <p className="mt-6 text-xl text-[#003366] max-w-2xl mx-auto lg:mx-0">
              Connect with top companies, gain real-world experience, and kick-start your professional journey through our university's internship portal.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to={getCtaLink()}>
                <button className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-[#0059b3] hover:bg-[#003366] rounded-xl shadow">
                  {getCtaText()}
                  <FiSearch className="ml-2 w-5 h-5" />
                </button>
              </Link>
              <Link to="/register">
                <button className="inline-flex items-center px-6 py-3 text-lg font-medium text-[#003366] border border-[#003366] hover:bg-[#003366] hover:text-white rounded-xl shadow">
                  Join Today
                </button>
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="bg-white/30 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <p className="text-3xl font-bold text-[#003366]">200+</p>
                <p className="text-[#0059b3] text-sm mt-1">Active Internships</p>
              </div>
              <div className="bg-white/30 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <p className="text-3xl font-bold text-[#003366]">50+</p>
                <p className="text-[#0059b3] text-sm mt-1">Partner Companies</p>
              </div>
              <div className="bg-white/30 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <p className="text-3xl font-bold text-[#003366]">1000+</p>
                <p className="text-[#0059b3] text-sm mt-1">Students Placed</p>
              </div>
            </div>
          </div>

          <div className="relative lg:ml-10">
            <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-2xl">
              <img 
                src={images[currentImageIndex]} 
                alt={`Landing ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-1000"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="absolute -top-6 -left-6 bg-white rounded-lg shadow-xl p-4 transform -rotate-6 z-10">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-10 h-10 text-[#0059b3]" />
                <div>
                  <p className="font-semibold text-gray-900">Tech Internships</p>
                  <p className="text-sm text-gray-500">42 positions open</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 bg-white rounded-lg shadow-xl p-4 transform rotate-3 z-10">
              <div className="flex items-center space-x-3">
                <Building className="w-10 h-10 text-[#0059b3]" />
                <div>
                  <p className="font-semibold text-gray-900">Top Companies</p>
                  <p className="text-sm text-gray-500">Microsoft, Google, IBM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

import { Link } from 'react-router-dom'
import { FiUsers, FiBriefcase, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'

const CallToAction = () => {
  const { isAuthenticated, userRole } = useAuth()

  return (
    <section className="py-12 bg-[#003366] text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500 opacity-10 rounded-full translate-y-1/3 -translate-x-1/4"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Take the Next Step?</h2>
          <p className="text-lg text-gray-200 mb-6">
            Whether you're a student looking for an internship or a company seeking talented interns,
            join our platform today.
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register"
                className="btn btn-secondary text-base px-8 py-3"
              >
                Create an Account <FiArrowRight className="ml-2" />
              </Link>
              <Link 
                to="/login"
                className="btn bg-white bg-opacity-10 hover:bg-opacity-20 text-white border-0 text-base px-8 py-3"
              >
                Log In
              </Link>
            </div>
          ) : (
            <Link 
              to={userRole === 'student' ? '/internships' : '/dashboard/' + userRole}
              className="btn btn-secondary text-base px-8 py-3"
            >
              {userRole === 'student' ? 'Browse Internships' : 'Go to Dashboard'} <FiArrowRight className="ml-2" />
            </Link>
          )}
        </div>
        
        {!isAuthenticated && (
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-15 transition-all duration-300">
              <div className="bg-secondary-500 bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FiUsers className="w-6 h-6 text-secondary-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Students</h3>
              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-start">
                  <span className="text-secondary-300 mr-2">✓</span>
                  Access hundreds of internship opportunities
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-300 mr-2">✓</span>
                  Build your professional profile
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-300 mr-2">✓</span>
                  Track your applications in one place
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-300 mr-2">✓</span>
                  Connect with industry-leading companies
                </li>
              </ul>
              <Link 
                to="/register"
                className="inline-flex items-center text-secondary-300 hover:text-secondary-200 font-medium text-sm"
              >
                Register as a Student <FiArrowRight className="ml-2" />
              </Link>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-15 transition-all duration-300">
              <div className="bg-primary-500 bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FiBriefcase className="w-6 h-6 text-primary-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Companies</h3>
              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-start">
                  <span className="text-primary-300 mr-2">✓</span>
                  Post internship opportunities
                </li>
                <li className="flex items-start">
                  <span className="text-primary-300 mr-2">✓</span>
                  Review student applications efficiently
                </li>
                <li className="flex items-start">
                  <span className="text-primary-300 mr-2">✓</span>
                  Showcase your company to potential interns
                </li>
                <li className="flex items-start">
                  <span className="text-primary-300 mr-2">✓</span>
                  Build relationships with top university talent
                </li>
              </ul>
              <Link 
                to="/register"
                className="inline-flex items-center text-primary-300 hover:text-primary-200 font-medium text-sm"
              >
                Register as a Company <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CallToAction
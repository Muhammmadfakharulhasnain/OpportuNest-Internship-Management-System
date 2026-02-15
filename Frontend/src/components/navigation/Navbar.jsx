import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiUser, FiLogIn, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'
import comsatsLogo from '../../assets/download.png'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { currentUser, logout, userRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  const getDashboardLink = () => {
    if (!userRole) return '/login'
    if (userRole === 'student') return '/dashboard/student'
    if (userRole === 'company') return '/dashboard/company'
    if (userRole === 'admin') return '/dashboard/admin'
    if (userRole === 'supervisor') return '/dashboard/supervisor'
    return '/login'
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Internships', path: '/internships' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ]

  return (
    <nav className="fixed w-full z-40 bg-[#003366] shadow-md py-2">
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
         {/* Modified Logo section */}
<Link to="/" className="flex items-center">
  <div className="bg-white rounded-full p-2 shadow-lg border-2 border-blue-200 flex items-center justify-center">
    <img 
      src={comsatsLogo} 
      alt="COMSATS University Logo" 
      className="h-10 w-10 object-contain"
    />
  </div>
  <div className="font-display font-semibold text-white ml-3">
    <span className="hidden md:inline">COMSATS University</span>
    <span className="inline md:hidden">COMSATS</span>
    <span className="block text-xs font-normal text-gray-200 mt-1">
      Internship Portal
    </span>
  </div>
</Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => 
                    `font-medium text-sm text-white hover:text-primary-200 transition-colors duration-300 ${
                      isActive && 'text-primary-300'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
            
            <div className="ml-8 flex items-center space-x-4">
              {currentUser ? (
                <>
                  <Link 
                    to={getDashboardLink()}
                    className="btn bg-white text-[#003366] hover:bg-gray-100"
                  >
                    <FiUser className="mr-2" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="btn bg-transparent border border-white text-white hover:bg-white hover:text-[#003366]"
                  >
                    <FiLogOut className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="btn bg-white text-[#003366] hover:bg-gray-100"
                  >
                    <FiLogIn className="mr-2" />
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    className="btn bg-transparent border border-white text-white hover:bg-white hover:text-[#003366]"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-300"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FiX className="h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-lg animate-slide-up">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            {currentUser ? (
              <div className="space-y-2">
                <Link
                  to={getDashboardLink()}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                >
                  <FiUser className="inline-block mr-2" />
                  Dashboard ({userRole})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <FiLogOut className="inline-block mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                >
                  <FiLogIn className="inline-block mr-2" />
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-primary-50"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
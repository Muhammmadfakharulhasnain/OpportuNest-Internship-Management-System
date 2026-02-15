import { Link } from 'react-router-dom'
import { FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import comsatsLogo from '../../assets/download.png'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center mb-4">
              <img src={comsatsLogo} alt="COMSATS University Logo" className="h-12 w-12 object-contain mr-3" />
              <div className="font-display font-semibold">
                COMSATS University
                <span className="block text-xs font-normal text-gray-400">
                  Wah Campus - Internship Portal
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Connecting talented students with industry-leading companies for 
              meaningful internship experiences that shape future careers.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiFacebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiTwitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiLinkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiInstagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/internships" className="text-gray-400 hover:text-white transition-colors">Browse Internships</Link>
              </li>
              <li>
                <Link to="/companies" className="text-gray-400 hover:text-white transition-colors">Partner Companies</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
          
          {/* For Students & Companies */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Student Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white transition-colors">Create Account</Link>
              </li>
              <li>
                <Link to="/dashboard/company" className="text-gray-400 hover:text-white transition-colors">For Companies</Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMapPin className="mt-1 mr-2 text-gray-400" />
                <span className="text-gray-400">
                  COMSATS University Islamabad, Wah Campus, GT Road, Wah Cantt, Pakistan
                </span>
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-2 text-gray-400" />
                <a href="tel:+923001234567" className="text-gray-400 hover:text-white transition-colors">
                  +92 300 123 4567
                </a>
              </li>
              <li className="flex items-center">
                <FiMail className="mr-2 text-gray-400" />
                <a href="mailto:internships@cuiwah.edu.pk" className="text-gray-400 hover:text-white transition-colors">
                  internships@cuiwah.edu.pk
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} COMSATS University Islamabad, Wah Campus. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
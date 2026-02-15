import { useEffect, useRef } from 'react'
import { FiX } from 'react-icons/fi'
import PropTypes from 'prop-types'

const Modal = ({ title, children, onClose, size = 'medium' }) => {
  const modalRef = useRef(null)
  
  // Handle clicking outside the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }
    
    // Handle escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    // Prevent scrolling on body
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      
      // Re-enable scrolling
      document.body.style.overflow = 'visible'
    }
  }, [onClose])
  
  // Get width based on size prop
  const getWidth = () => {
    switch (size) {
      case 'small': return 'max-w-md'
      case 'large': return 'max-w-4xl'
      case 'xl': return 'max-w-6xl'
      case 'medium':
      default: return 'max-w-2xl'
    }
  }

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div 
          ref={modalRef}
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${getWidth()} w-full`}
        >
          <div className="bg-white">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xl'])
}
export default Modal;
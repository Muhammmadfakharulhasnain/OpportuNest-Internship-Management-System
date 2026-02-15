import React from 'react'
import PropTypes from 'prop-types'

const LoadingSpinner = ({ fullScreen, size = 'medium', color = 'primary' }) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 'w-5 h-5'
      case 'large': return 'w-10 h-10'
      default: return 'w-8 h-8'
    }
  }
  
  const getColor = () => {
    switch (color) {
      case 'secondary': return 'border-secondary-500'
      case 'white': return 'border-white'
      default: return 'border-primary-600'
    }
  }

  const spinner = (
    <div className={`${getSize()} rounded-full border-2 ${getColor()} border-b-transparent animate-spin`} 
      role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="flex flex-col items-center">
          {spinner}
          <p className="mt-2 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }
  return spinner
}

LoadingSpinner.propTypes = {
  fullScreen: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white'])
}

export default LoadingSpinner;
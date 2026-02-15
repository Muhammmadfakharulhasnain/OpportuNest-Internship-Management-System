import { Link } from 'react-router-dom'
import { FiMapPin, FiClock, FiCalendar } from 'react-icons/fi'
import PropTypes from 'prop-types'

const InternshipCard = ({ internship }) => {
  const {
    id,
    title,
    company,
    logo,
    location,
    type,
    duration,
    posted,
    deadline,
    skills,
    featured
  } = internship

  // Format deadline to readable date
  const formatDeadline = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <Link 
      to={`/internships/${id}`}
      className={`card card-hover block h-full transition-all duration-300 ${featured ? 'border-l-4 border-primary-500' : ''}`}
    >
      <div className="p-6">
        {/* Company Logo & Name */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 mr-3 flex-shrink-0 text-primary-700 font-semibold">
            {company.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{title}</h3>
            <p className="text-sm text-gray-600">{company}</p>
          </div>
        </div>
        
        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <FiMapPin className="mr-2 text-gray-400" />
            {location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FiClock className="mr-2 text-gray-400" />
            {type} • {duration}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FiCalendar className="mr-2 text-gray-400" />
            Deadline: {formatDeadline(deadline)}
          </div>
        </div>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {skills.slice(0, 3).map((skill, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              +{skills.length - 3}
            </span>
          )}
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-500">Posted {posted}</span>
        <span className="text-sm font-medium text-primary-600 hover:text-primary-700">View Details</span>
      </div>
    </Link>
  )
}

InternshipCard.propTypes = {
  internship: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    logo: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    posted: PropTypes.string.isRequired,
    deadline: PropTypes.string.isRequired,
    skills: PropTypes.arrayOf(PropTypes.string).isRequired,
    featured: PropTypes.bool
  }).isRequired
}

export default InternshipCard

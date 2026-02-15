import { useState, useEffect, useRef } from 'react'
import { FiChevronLeft, FiChevronRight, FiStar, FiMessageCircle } from 'react-icons/fi'

// Mock data for testimonials
const testimonials = [
  {
    id: 1,
    content: "My internship through COMSATS portal was a game-changer. I gained real-world experience that directly led to a full-time job offer after graduation.",
    author: "Aisha Khan",
    role: "Computer Science Graduate",
    company: "Now at TechSolutions Inc.",
    initials: "AK",
    gradient: "from-blue-500 to-blue-600",
    rating: 5
  },
  {
    id: 2,
    content: "As a hiring manager, I've been impressed with the quality of interns from COMSATS. The platform makes it easy to find talented students who fit our company culture.",
    author: "Malik Ahmed",
    role: "HR Director",
    company: "DataMetrics",
    initials: "MA",
    gradient: "from-indigo-500 to-indigo-600",
    rating: 5
  },
  {
    id: 3,
    content: "The multi-step application process helped me prepare for the real world. I found an amazing internship that aligned perfectly with my career goals.",
    author: "Sara Mahmood",
    role: "Software Engineering Student",
    company: "Intern at AppNexus",
    initials: "SM",
    gradient: "from-cyan-500 to-cyan-600",
    rating: 4
  },
  {
    id: 4,
    content: "COMSATS Internship Portal bridges the gap between academia and industry. We've hired multiple full-time employees who started as interns through this platform.",
    author: "Hassan Ali",
    role: "CEO",
    company: "Cloud Innovations",
    initials: "HA",
    gradient: "from-blue-400 to-blue-500",
    rating: 5
  }
]

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState('right')
  const intervalRef = useRef(null)
  
  const nextTestimonial = () => {
    setSlideDirection('right')
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }
  
  const prevTestimonial = () => {
    setSlideDirection('left')
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }
  
  useEffect(() => {
    // Auto-slide
    intervalRef.current = setInterval(() => {
      nextTestimonial()
    }, 5000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [activeIndex])
  
  // Reset interval when manually navigating
  const handleManualNav = (direction) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    if (direction === 'next') {
      nextTestimonial()
    } else {
      prevTestimonial()
    }
    
    // Restart auto-slide
    intervalRef.current = setInterval(() => {
      nextTestimonial()
    }, 5000)
  }

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003366] mb-4">
            Success <span className="text-[#0059b3]">Stories</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#003366]/80">
            Hear from students and companies who've benefited from our internship program.
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation buttons */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <button 
              onClick={() => handleManualNav('prev')}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-[#0059b3] hover:text-white transition-colors duration-300 border border-blue-100"
              aria-label="Previous testimonial"
            >
              <FiChevronLeft className="h-6 w-6" />
            </button>
          </div>
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            <button 
              onClick={() => handleManualNav('next')}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-[#0059b3] hover:text-white transition-colors duration-300 border border-blue-100"
              aria-label="Next testimonial"
            >
              <FiChevronRight className="h-6 w-6" />
            </button>
          </div>
          
          {/* Testimonial carousel */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl border border-blue-100">
            <div className="h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-500"></div>
            
            <div className="p-6 md:p-8">
              <div 
                className="transition-all duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(${-activeIndex * 100}%)`,
                  display: 'flex'
                }}
              >
                {testimonials.map((testimonial) => (
                  <div 
                    key={testimonial.id}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Quote Icon */}
                      <div className="mb-4">
                        <FiMessageCircle className="h-8 w-8 text-[#0059b3] mb-3" />
                        
                        {/* Rating stars */}
                        <div className="flex space-x-1 mb-4 justify-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar 
                              key={i}
                              className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        
                        <blockquote className="text-lg md:text-xl text-[#003366] font-medium leading-relaxed max-w-2xl">
                          "{testimonial.content}"
                        </blockquote>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r ${testimonial.gradient} text-white font-bold text-lg shadow-lg mb-3`}>
                          {testimonial.initials}
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-[#003366] text-base">{testimonial.author}</p>
                          <p className="text-[#0059b3] font-medium text-sm">{testimonial.role}</p>
                          <p className="text-gray-600 text-sm">{testimonial.company}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setSlideDirection(index > activeIndex ? 'right' : 'left')
                  setActiveIndex(index)
                  handleManualNav(index > activeIndex ? 'next' : 'prev')
                }}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? 'bg-[#0059b3] w-8' 
                    : 'bg-gray-300 hover:bg-[#0059b3]/50 w-3'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
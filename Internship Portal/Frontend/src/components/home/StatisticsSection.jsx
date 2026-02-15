import { useState, useEffect, useRef } from 'react'
import { FiBriefcase, FiUsers, FiAward, FiTrendingUp } from 'react-icons/fi'

const StatisticsSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  // Animation for counting up
  const [counts, setCounts] = useState({
    internships: 0,
    companies: 0,
    students: 0,
    success: 0
  })

  const targetCounts = {
    internships: 250,
    companies: 75,
    students: 1200,
    success: 87
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000 // ms
    const frameDuration = 1000 / 60 // 60fps
    const totalFrames = Math.round(duration / frameDuration)
    
    let frame = 0
    const counter = setInterval(() => {
      frame++
      
      const progress = frame / totalFrames
      const easedProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2 // easeInOutCubic

      setCounts({
        internships: Math.floor(easedProgress * targetCounts.internships),
        companies: Math.floor(easedProgress * targetCounts.companies),
        students: Math.floor(easedProgress * targetCounts.students),
        success: Math.floor(easedProgress * targetCounts.success)
      })

      if (frame === totalFrames) {
        clearInterval(counter)
        setCounts(targetCounts)
      }
    }, frameDuration)

    return () => clearInterval(counter)
  }, [isVisible])

  const stats = [
    {
      id: 'internships',
      label: 'Active Internships',
      value: counts.internships,
      icon: <FiBriefcase className="h-8 w-8 text-white" />,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'companies',
      label: 'Partner Companies',
      value: counts.companies,
      icon: <FiUsers className="h-8 w-8 text-white" />,
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'students',
      label: 'Enrolled Students',
      value: counts.students,
      icon: <FiAward className="h-8 w-8 text-white" />,
      gradient: 'from-cyan-500 to-cyan-600'
    },
    {
      id: 'success',
      label: 'Success Rate',
      value: counts.success,
      suffix: '%',
      icon: <FiTrendingUp className="h-8 w-8 text-white" />,
      gradient: 'from-blue-400 to-blue-500'
    }
  ]

  return (
    <section ref={sectionRef} className="py-12 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#003366] mb-4">
            Our Impact in <span className="text-[#0059b3]">Numbers</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#003366]/80">
            COMSATS University's Internship Portal has successfully connected students with
            industry-leading companies, creating valuable opportunities.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={stat.id} 
              className={`${isVisible ? 'animate-slide-up' : 'opacity-0'} group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-blue-100 overflow-hidden`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-2 bg-gradient-to-r ${stat.gradient}`}></div>
              
              <div className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                
                <h3 className="text-base font-bold text-[#003366] mb-3 group-hover:text-[#0059b3] transition-colors">
                  {stat.label}
                </h3>
                
                <p className="text-3xl font-bold text-[#0059b3] mb-2">
                  {stat.value.toLocaleString()}{stat.suffix || ''}
                </p>
                
                <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatisticsSection
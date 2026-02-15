import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Target, Award, Globe } from 'react-feather';

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-100 to-blue-300 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 bg-black bg-opacity-10 z-0"></div>
        <div className="absolute inset-0 bg-[size:50px_50px] bg-grid-white/[0.05] z-0"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#003366] leading-tight">
            About <span className="text-[#0059b3]">COMSATS Internship Portal</span>
          </h1>
          <p className="mt-6 text-xl text-[#003366] max-w-3xl mx-auto font-light">
            Bridging the gap between academia and industry through meaningful internship experiences that empower students to gain practical knowledge and career direction.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 mb-12">
          <div className="prose-lg text-gray-700">
            <p className="mb-6">
              Welcome to the COMSATS Internship Portal, your premier gateway connecting talented students
              with leading national and international companies for transformative internship opportunities.
            </p>
            <p className="mb-6">
              Our innovative platform serves as a dynamic bridge between academia and industry, empowering
              students to gain invaluable real-world experience while enabling organizations to discover
              and nurture emerging talent.
            </p>
          </div>
        </div>

        {/* Mission/Vision Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-blue-600">
            <div className="flex items-center mb-4">
              <Target className="text-blue-600 mr-3" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700">
              To revolutionize internship experiences by creating seamless connections between students
              and industry leaders, fostering professional growth through hands-on learning and
              meaningful career development opportunities.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-blue-600">
            <div className="flex items-center mb-4">
              <Globe className="text-blue-600 mr-3" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-700">
              To become the nation's leading internship platform that transforms students into
              industry-ready professionals while providing companies with access to top-tier emerging talent.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Our Platform</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Briefcase className="text-blue-600" size={32} />,
                title: "Industry Connections",
                desc: "Access to 500+ partner companies across diverse sectors"
              },
              {
                icon: <Users className="text-blue-600" size={32} />,
                title: "Student Community",
                desc: "10,000+ talented students from top academic programs"
              },
              {
                icon: <Award className="text-blue-600" size={32} />,
                title: "Quality Assurance",
                desc: "Verified internship opportunities with learning outcomes"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;

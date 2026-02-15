import { useState, useEffect } from 'react';
import { 
  Save, Download, ArrowLeft, User, 
  GraduationCap, Briefcase, Award, Code,
  FileText, Star, Plus, X, Eye
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../../context/AuthContext';
import { studentAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

const CVBuilder = ({ onBack, profileData }) => {
  const { currentUser } = useAuth();
  const [cvData, setCvData] = useState({
    personalInfo: {
      fullName: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: '',
      address: '',
      linkedin: '',
      portfolio: '',
      objective: ''
    },
    education: [{
      degree: '',
      institution: '',
      year: '',
      cgpa: '',
      description: ''
    }],
    experience: [{
      position: '',
      company: '',
      duration: '',
      description: ''
    }],
    skills: {
      technical: [],
      soft: [],
      languages: []
    },
    projects: [{
      title: '',
      technologies: '',
      duration: '',
      description: ''
    }],
    certifications: [{
      name: '',
      issuer: '',
      date: '',
      url: ''
    }],
    achievements: ['']
  });

  const [activeSection, setActiveSection] = useState('personal');
  const handlePreview = () => {
    const doc = new jsPDF();
    generatePDFContent(doc);
    
    // Generate blob URL for preview
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    // Open in new tab
    window.open(blobUrl, '_blank');
    
    // Clean up the blob URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);
  };
  const [newSkill, setNewSkill] = useState({ technical: '', soft: '', languages: '' });

  // Load saved CV data if exists
  useEffect(() => {
    const loadSavedCV = async () => {
      try {
        const response = await studentAPI.getCVData();
        if (response.success && response.data) {
          setCvData(response.data);
        }
      } catch (err) {
        console.log('No saved CV data found');
      }
    };
    loadSavedCV();
  }, []);

  // Auto-populate from profile data
  useEffect(() => {
    if (profileData) {
      setCvData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          phone: profileData.phoneNumber || prev.personalInfo.phone,
        },
        education: [{
          ...prev.education[0],
          cgpa: profileData.cgpa || prev.education[0].cgpa
        }]
      }));
    }
  }, [profileData]);

  const updatePersonalInfo = (field, value) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const updateArrayField = (section, index, field, value) => {
    setCvData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section, template) => {
    setCvData(prev => ({
      ...prev,
      [section]: [...prev[section], template]
    }));
  };

  const removeArrayItem = (section, index) => {
    setCvData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const saveCVData = async () => {
    try {
      const response = await studentAPI.saveCVData(cvData);
      if (response.success) {
        toast.success('CV data saved successfully!');
        // Generate PDF and save to profile
        await saveCVToProfile();
      }
    } catch (err) {
      console.error('Failed to save CV:', err);
      toast.error('Failed to save CV data');
    }
  };

  const saveCVToProfile = async () => {
    try {
      // Generate PDF blob instead of downloading
      const doc = new jsPDF();
      
      // Generate PDF content (same as generatePDF but return blob)
      generatePDFContent(doc);
      
      // Convert PDF to blob
      const pdfBlob = doc.output('blob');
      
      // Create FormData to upload the PDF
      const formData = new FormData();
      const fileName = `${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf`;
      formData.append('cv', pdfBlob, fileName);
      
      // Upload to student profile
      const response = await studentAPI.updateProfile(formData);
      if (response.success) {
        toast.success('CV saved to your profile successfully!');
      }
    } catch (error) {
      console.error('Failed to save CV to profile:', error);
      toast.error('Failed to save CV to profile');
    }
  };

  const generatePDFContent = (doc) => {
    // Header with COMSATS styling (matching evaluation PDF)
    doc.setFillColor(30, 58, 138); // Dark blue
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(cvData.personalInfo.fullName.toUpperCase(), 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('CURRICULUM VITAE', 105, 25, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    let yPos = 45;
    
    // Personal Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PERSONAL INFORMATION', 20, yPos);
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const personalInfo = [
      ['Email:', cvData.personalInfo.email],
      ['Phone:', cvData.personalInfo.phone],
      ['Address:', cvData.personalInfo.address],
      ['LinkedIn:', cvData.personalInfo.linkedin],
      ['Portfolio:', cvData.personalInfo.portfolio]
    ].filter(([, value]) => value);
    
    personalInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 45, yPos);
      yPos += 6;
    });
    
    // Objective
    if (cvData.personalInfo.objective) {
      yPos += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('OBJECTIVE', 20, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      
      yPos += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const objectiveLines = doc.splitTextToSize(cvData.personalInfo.objective, 170);
      doc.text(objectiveLines, 20, yPos);
      yPos += objectiveLines.length * 5 + 5;
    }
    
    // Education
    if (cvData.education.some(edu => edu.degree)) {
      yPos += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUCATION', 20, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      
      yPos += 10;
      cvData.education.filter(edu => edu.degree).forEach(edu => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${edu.degree} - ${edu.institution}`, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${edu.year} | CGPA: ${edu.cgpa}`, 160, yPos, { align: 'right' });
        
        if (edu.description) {
          yPos += 6;
          doc.setFontSize(9);
          const descLines = doc.splitTextToSize(edu.description, 170);
          doc.text(descLines, 20, yPos);
          yPos += descLines.length * 4;
        }
        yPos += 8;
      });
    }
    
    // Experience
    if (cvData.experience.some(exp => exp.position)) {
      yPos += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EXPERIENCE', 20, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      
      yPos += 10;
      cvData.experience.filter(exp => exp.position).forEach(exp => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${exp.position} - ${exp.company}`, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(exp.duration, 160, yPos, { align: 'right' });
        
        if (exp.description) {
          yPos += 6;
          doc.setFontSize(9);
          const descLines = doc.splitTextToSize(exp.description, 170);
          doc.text(descLines, 20, yPos);
          yPos += descLines.length * 4;
        }
        yPos += 8;
      });
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Skills
    const hasSkills = cvData.skills.technical.length || cvData.skills.soft.length || cvData.skills.languages.length;
    if (hasSkills) {
      yPos += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SKILLS', 20, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      
      yPos += 10;
      doc.setFontSize(9);
      
      if (cvData.skills.technical.length) {
        doc.setFont('helvetica', 'bold');
        doc.text('Technical Skills:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(cvData.skills.technical.join(', '), 55, yPos);
        yPos += 6;
      }
      
      if (cvData.skills.soft.length) {
        doc.setFont('helvetica', 'bold');
        doc.text('Soft Skills:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(cvData.skills.soft.join(', '), 50, yPos);
        yPos += 6;
      }
      
      if (cvData.skills.languages.length) {
        doc.setFont('helvetica', 'bold');
        doc.text('Languages:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(cvData.skills.languages.join(', '), 50, yPos);
        yPos += 6;
      }
    }
    
    // Projects
    if (cvData.projects.some(proj => proj.title)) {
      yPos += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PROJECTS', 20, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      
      yPos += 10;
      cvData.projects.filter(proj => proj.title).forEach(proj => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(proj.title, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(proj.duration, 160, yPos, { align: 'right' });
        
        if (proj.technologies) {
          yPos += 5;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text(`Technologies: ${proj.technologies}`, 20, yPos);
        }
        
        if (proj.description) {
          yPos += 5;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(proj.description, 170);
          doc.text(descLines, 20, yPos);
          yPos += descLines.length * 4;
        }
        yPos += 8;
      });
    }
    
    // Certifications
    if (cvData.certifications.some(cert => cert.name)) {
      // Check if we need a new page
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      
      yPos += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICATIONS', 20, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      
      yPos += 10;
      cvData.certifications.filter(cert => cert.name).forEach(cert => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(cert.name, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(cert.date, 160, yPos, { align: 'right' });
        
        if (cert.issuer) {
          yPos += 5;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text(`Issued by: ${cert.issuer}`, 20, yPos);
        }
        
        if (cert.url) {
          yPos += 4;
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(`Certificate URL: ${cert.url}`, 20, yPos);
        }
        yPos += 8;
      });
    }
    
    // Achievements
    const filteredAchievements = cvData.achievements.filter(achievement => achievement.trim());
    if (filteredAchievements.length > 0) {
      // Check if we need a new page
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      yPos += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ACHIEVEMENTS & AWARDS', 20, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      
      yPos += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      filteredAchievements.forEach(achievement => {
        doc.text(`• ${achievement}`, 25, yPos);
        yPos += 6;
      });
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    generatePDFContent(doc);
    
    // Save PDF as download
    const fileName = `${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf`;
    doc.save(fileName);
    toast.success('CV PDF generated successfully!');
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'achievements', label: 'Achievements', icon: Star }
  ];

  const renderPersonalInfoSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={cvData.personalInfo.fullName}
            onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={cvData.personalInfo.email}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={cvData.personalInfo.phone}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            value={cvData.personalInfo.address}
            onChange={(e) => updatePersonalInfo('address', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
          <input
            type="url"
            value={cvData.personalInfo.linkedin}
            onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Website</label>
          <input
            type="url"
            value={cvData.personalInfo.portfolio}
            onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
            placeholder="https://yourportfolio.com"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Career Objective</label>
        <textarea
          value={cvData.personalInfo.objective}
          onChange={(e) => updatePersonalInfo('objective', e.target.value)}
          rows={4}
          placeholder="Write a brief career objective..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderEducationSection = () => (
    <div className="space-y-6">
      {cvData.education.map((edu, index) => (
        <div key={index} className="p-6 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Education {index + 1}</h4>
            {cvData.education.length > 1 && (
              <button
                onClick={() => removeArrayItem('education', index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateArrayField('education', index, 'degree', e.target.value)}
                placeholder="Bachelor of Computer Science"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => updateArrayField('education', index, 'institution', e.target.value)}
                placeholder="COMSATS University Islamabad"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="text"
                value={edu.year}
                onChange={(e) => updateArrayField('education', index, 'year', e.target.value)}
                placeholder="2020-2024"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CGPA</label>
              <input
                type="text"
                value={edu.cgpa}
                onChange={(e) => updateArrayField('education', index, 'cgpa', e.target.value)}
                placeholder="3.8/4.0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={edu.description}
              onChange={(e) => updateArrayField('education', index, 'description', e.target.value)}
              rows={3}
              placeholder="Relevant coursework, achievements, etc."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      ))}
      
      <button
        onClick={() => addArrayItem('education', { degree: '', institution: '', year: '', cgpa: '', description: '' })}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Education
      </button>
    </div>
  );

  const renderExperienceSection = () => (
    <div className="space-y-6">
      {cvData.experience.map((exp, index) => (
        <div key={index} className="p-6 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Experience {index + 1}</h4>
            {cvData.experience.length > 1 && (
              <button
                onClick={() => removeArrayItem('experience', index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) => updateArrayField('experience', index, 'position', e.target.value)}
                placeholder="Software Engineer Intern"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => updateArrayField('experience', index, 'company', e.target.value)}
                placeholder="ABC Company"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <input
                type="text"
                value={exp.duration}
                onChange={(e) => updateArrayField('experience', index, 'duration', e.target.value)}
                placeholder="June 2023 - August 2023"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={exp.description}
              onChange={(e) => updateArrayField('experience', index, 'description', e.target.value)}
              rows={4}
              placeholder="Describe your responsibilities and achievements..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      ))}
      
      <button
        onClick={() => addArrayItem('experience', { position: '', company: '', duration: '', description: '' })}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Experience
      </button>
    </div>
  );

  const renderSkillsSection = () => {
    const addSkill = (type) => {
      if (newSkill[type].trim()) {
        setCvData(prev => ({
          ...prev,
          skills: {
            ...prev.skills,
            [type]: [...prev.skills[type], newSkill[type].trim()]
          }
        }));
        setNewSkill(prev => ({ ...prev, [type]: '' }));
      }
    };

    const removeSkill = (type, index) => {
      setCvData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [type]: prev.skills[type].filter((_, i) => i !== index)
        }
      }));
    };

    return (
      <div className="space-y-8">
        {/* Technical Skills */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Technical Skills</h4>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill.technical}
              onChange={(e) => setNewSkill(prev => ({ ...prev, technical: e.target.value }))}
              placeholder="JavaScript, React, Node.js..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addSkill('technical')}
            />
            <button
              onClick={() => addSkill('technical')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.technical.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {skill}
                <button
                  onClick={() => removeSkill('technical', index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Soft Skills</h4>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill.soft}
              onChange={(e) => setNewSkill(prev => ({ ...prev, soft: e.target.value }))}
              placeholder="Leadership, Communication, Problem Solving..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addSkill('soft')}
            />
            <button
              onClick={() => addSkill('soft')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.soft.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {skill}
                <button
                  onClick={() => removeSkill('soft', index)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Languages</h4>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill.languages}
              onChange={(e) => setNewSkill(prev => ({ ...prev, languages: e.target.value }))}
              placeholder="English, Urdu, Arabic..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addSkill('languages')}
            />
            <button
              onClick={() => addSkill('languages')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.languages.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
              >
                {skill}
                <button
                  onClick={() => removeSkill('languages', index)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderProjectsSection = () => (
    <div className="space-y-6">
      {cvData.projects.map((project, index) => (
        <div key={index} className="p-6 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Project {index + 1}</h4>
            {cvData.projects.length > 1 && (
              <button
                onClick={() => removeArrayItem('projects', index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => updateArrayField('projects', index, 'title', e.target.value)}
                placeholder="E-commerce Website"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <input
                type="text"
                value={project.duration}
                onChange={(e) => updateArrayField('projects', index, 'duration', e.target.value)}
                placeholder="3 months"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
              <input
                type="text"
                value={project.technologies}
                onChange={(e) => updateArrayField('projects', index, 'technologies', e.target.value)}
                placeholder="React, Node.js, MongoDB, Express.js"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={project.description}
              onChange={(e) => updateArrayField('projects', index, 'description', e.target.value)}
              rows={4}
              placeholder="Describe the project, your role, and achievements..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      ))}
      
      <button
        onClick={() => addArrayItem('projects', { title: '', technologies: '', duration: '', description: '' })}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Project
      </button>
    </div>
  );

  const renderCertificationsSection = () => (
    <div className="space-y-6">
      {cvData.certifications.map((cert, index) => (
        <div key={index} className="p-6 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Certification {index + 1}</h4>
            {cvData.certifications.length > 1 && (
              <button
                onClick={() => removeArrayItem('certifications', index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name</label>
              <input
                type="text"
                value={cert.name}
                onChange={(e) => updateArrayField('certifications', index, 'name', e.target.value)}
                placeholder="AWS Solutions Architect"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
              <input
                type="text"
                value={cert.issuer}
                onChange={(e) => updateArrayField('certifications', index, 'issuer', e.target.value)}
                placeholder="Amazon Web Services"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="text"
                value={cert.date}
                onChange={(e) => updateArrayField('certifications', index, 'date', e.target.value)}
                placeholder="December 2023"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certificate URL (Optional)</label>
              <input
                type="url"
                value={cert.url}
                onChange={(e) => updateArrayField('certifications', index, 'url', e.target.value)}
                placeholder="https://certificates.aws.com/..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      ))}
      
      <button
        onClick={() => addArrayItem('certifications', { name: '', issuer: '', date: '', url: '' })}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Certification
      </button>
    </div>
  );

  const renderAchievementsSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Achievements & Awards</h4>
        {cvData.achievements.map((achievement, index) => (
          <div key={index} className="flex items-center gap-3 mb-3">
            <input
              type="text"
              value={achievement}
              onChange={(e) => {
                const newAchievements = [...cvData.achievements];
                newAchievements[index] = e.target.value;
                setCvData(prev => ({ ...prev, achievements: newAchievements }));
              }}
              placeholder="Dean's List, Hackathon Winner, etc."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {cvData.achievements.length > 1 && (
              <button
                onClick={() => {
                  const newAchievements = cvData.achievements.filter((_, i) => i !== index);
                  setCvData(prev => ({ ...prev, achievements: newAchievements }));
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        
        <button
          onClick={() => setCvData(prev => ({ ...prev, achievements: [...prev.achievements, ''] }))}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Achievement
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Profile
            </button>
            <h1 className="text-2xl font-bold text-gray-900">CV Builder</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePreview}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-5 h-5 mr-2" />
              Preview
            </button>
            <button
              onClick={saveCVData}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Draft
            </button>
            <button
              onClick={generatePDF}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">CV Sections</h2>
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              {activeSection === 'personal' && renderPersonalInfoSection()}
              {activeSection === 'education' && renderEducationSection()}
              {activeSection === 'experience' && renderExperienceSection()}
              {activeSection === 'skills' && renderSkillsSection()}
              {activeSection === 'projects' && renderProjectsSection()}
              {activeSection === 'certifications' && renderCertificationsSection()}
              {activeSection === 'achievements' && renderAchievementsSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;
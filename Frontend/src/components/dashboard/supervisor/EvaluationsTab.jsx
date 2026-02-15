import { useState, useEffect } from 'react';
import { Plus, Save, User, FileText, Download, Eye, Building, X } from 'lucide-react';
import { mockEvaluations } from '../../../data/mockData';
import { toast } from 'react-hot-toast';
import { applicationAPI, supervisorEvaluationAPI } from '../../../services/api';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import SearchBar from '../../../ui/SearchBar';
import Modal from '../../../ui/Modal';
import './EvaluationsTab.css';

// Enhanced Evaluations Tab - Updated 2025-10-06
const EvaluationsTab = () => {
  const [activeTab, setActiveTab] = useState('supervisor');
  const [evaluations, setEvaluations] = useState(mockEvaluations);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    interneeName: '',
    interneeRegistration: '',
    internshipDuration: '',
    internshipStartDate: '',
    internshipEndDate: '',
    position: '',
    platformActivity: '',
    completionOfInternship: '',
    earningsAchieved: '',
    skillDevelopment: '',
    clientRating: '',
    professionalism: ''
  });

    // Company Evaluations State
  const [companyEvaluations, setCompanyEvaluations] = useState([]);
  const [companyEvaluationsLoading, setCompanyEvaluationsLoading] = useState(false);
  const [selectedCompanyEvaluation, setSelectedCompanyEvaluation] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  // Supervisor Evaluation Details Modal State
  const [selectedSupervisorEvaluation, setSelectedSupervisorEvaluation] = useState(null);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);

  // Fetch students supervised by this supervisor
  useEffect(() => {
    const fetchSupervisedStudents = async () => {
      try {
        console.log('🎓 Fetching hired students for evaluation in EvaluationsTab');
        const response = await applicationAPI.getSupervised();
        
        if (response.success && response.data) {
          console.log('✅ Hired students data received:', response.data);
          
          // Map the received data to the expected format
          const studentsData = response.data.map((student, index) => ({
            studentId: student.studentId,
            name: student.name,
            email: student.email,
            rollNumber: student.registrationNumber,
            department: student.department || 'N/A',
            semester: student.semester || 'N/A',
            jobTitle: student.jobTitle,
            companyName: student.companyName,
            startDate: student.internshipStartDate,
            endDate: student.internshipEndDate,
            duration: student.internshipDuration || 'N/A',
            uniqueKey: `${student.studentId}_${student.applicationId || index}` // Unique key for React rendering
          }));
          
          setStudents(studentsData);
          console.log('📋 Students loaded for evaluation:', studentsData.length);
        } else {
          console.log('⚠️ No hired students found');
          setStudents([]);
        }
      } catch (error) {
        console.error('❌ Error fetching supervised students:', error);
        toast.error('Failed to fetch student list');
      }
    };

    const fetchExistingEvaluations = async () => {
      try {
        console.log('📋 Fetching existing evaluations...');
        const response = await supervisorEvaluationAPI.getSupervisorEvaluations();
        
        if (response.success && response.data) {
          console.log('✅ Existing evaluations loaded:', response.data.length);
          
          // Map the evaluations to the expected format
          const evaluationsData = response.data.map(evaluation => ({
            id: evaluation._id,
            studentId: evaluation.studentId,
            supervisorId: evaluation.supervisorId,
            interneeName: evaluation.studentName,
            interneeRegistration: evaluation.studentRegistration,
            internshipDuration: evaluation.internshipDuration,
            internshipStartDate: evaluation.internshipStartDate,
            internshipEndDate: evaluation.internshipEndDate,
            position: evaluation.position,
            platformActivity: evaluation.platformActivity,
            completionOfInternship: evaluation.completionOfInternship,
            earningsAchieved: evaluation.earningsAchieved,
            skillDevelopment: evaluation.skillDevelopment,
            clientRating: evaluation.clientRating,
            professionalism: evaluation.professionalism,
            totalMarks: evaluation.totalMarks,
            grade: evaluation.grade,
            submittedAt: evaluation.submittedAt ? new Date(evaluation.submittedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: evaluation.status || 'completed'
          }));
          
          setEvaluations(evaluationsData);
        } else {
          console.log('⚠️ No existing evaluations found');
          setEvaluations(mockEvaluations); // Fallback to mock data
        }
      } catch (error) {
        console.error('❌ Error fetching evaluations:', error);
        setEvaluations(mockEvaluations); // Fallback to mock data
      }
    };

    fetchSupervisedStudents();
    fetchExistingEvaluations();
    fetchCompanyEvaluations();
  }, []);

  // Fetch company evaluations for students supervised by this supervisor
  const fetchCompanyEvaluations = async () => {
    try {
      setCompanyEvaluationsLoading(true);
      console.log('🔍 Fetching company evaluations...');
      
      const token = localStorage.getItem('token') || 
                   (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null);
      
      if (!token) {
        console.log('❌ No token found');
        setCompanyEvaluations([]);
        return;
      }
      
      console.log('🔐 Token found, making API call...');
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      
      const response = await fetch(`${API_BASE_URL}/internee-evaluations/supervisor/evaluations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Company evaluations response:', data);
        console.log(`📊 Found ${data.data?.length || 0} company evaluations`);
        
        if (data.data && data.data.length > 0) {
          const realEvaluations = data.data.filter(evaluation => {
            const isMockData = evaluation._id?.toString().startsWith('mock') || 
                              evaluation.studentName?.includes('Student_') ||
                              evaluation.companyName?.includes('TechCorp') ||
                              evaluation.companyName?.includes('Company_');
            return !isMockData;
          });
          console.log(`📊 Real evaluations: ${realEvaluations.length}`);
          setCompanyEvaluations(realEvaluations);
        } else {
          setCompanyEvaluations([]);
        }
      } else {
        const errorData = await response.json();
        console.log('⚠️ API Error:', errorData);
        setCompanyEvaluations([]);
      }
    } catch (error) {
      console.error('❌ Error fetching company evaluations:', error);
      setCompanyEvaluations([]);
    } finally {
      setCompanyEvaluationsLoading(false);
    }
  };

  // Company evaluation handlers
  const handleViewCompanyEvaluation = (evaluation) => {
    setSelectedCompanyEvaluation(evaluation);
    setShowCompanyModal(true);
  };

  const handleDownloadCompanyEvaluationPDF = async (evaluationId) => {
    try {
      console.log('📄 Generating Company Evaluation PDF for ID:', evaluationId);
      
      // Find the evaluation data
      const evaluation = companyEvaluations.find(evalData => evalData._id === evaluationId);
      if (!evaluation) {
        toast.error('Evaluation data not found');
        return;
      }
      
      // Log the evaluation data to understand the structure
      console.log('🔍 Company Evaluation Data Structure:', evaluation);
      console.log('🔍 Available fields:', Object.keys(evaluation));
      console.log('🔍 CompanyId structure:', evaluation.companyId);
      console.log('🔍 StudentId structure:', evaluation.studentId);
      
      // Generate comprehensive PDF content for company evaluation
      const generateCompanyEvaluationPDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Page dimensions and margins
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const margins = { top: 15, bottom: 15, left: 15, right: 15 };
        const contentWidth = pageWidth - margins.left - margins.right;
        
        // Add decorative border to the page
        const addPageBorder = () => {
          // Outer border - thick green (company color)
          doc.setDrawColor(5, 150, 105);
          doc.setLineWidth(1.5);
          doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

          // Inner border - thin gray
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

          // Corner decorations - orange accents
          const cornerSize = 10;
          doc.setDrawColor(245, 158, 11);
          doc.setLineWidth(1);
          
          // Top-left
          doc.line(12, 12 + cornerSize, 12, 12);
          doc.line(12, 12, 12 + cornerSize, 12);
          
          // Top-right
          doc.line(pageWidth - 12 - cornerSize, 12, pageWidth - 12, 12);
          doc.line(pageWidth - 12, 12, pageWidth - 12, 12 + cornerSize);
          
          // Bottom-left
          doc.line(12, pageHeight - 12 - cornerSize, 12, pageHeight - 12);
          doc.line(12, pageHeight - 12, 12 + cornerSize, pageHeight - 12);
          
          // Bottom-right
          doc.line(pageWidth - 12 - cornerSize, pageHeight - 12, pageWidth - 12, pageHeight - 12);
          doc.line(pageWidth - 12, pageHeight - 12, pageWidth - 12, pageHeight - 12 - cornerSize);
        };
        
        // Add professional header
        const addHeader = () => {
          let yPos = 35;

          // Main title
          doc.setFontSize(22);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(5, 150, 105); // Green for company
          doc.text('COMPANY EVALUATION REPORT', pageWidth / 2, yPos, { align: 'center' });

          yPos += 15;

          // Subtitle
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(34, 197, 94); // Lighter green
          doc.text('EMPLOYER ASSESSMENT OF INTERN PERFORMANCE', pageWidth / 2, yPos, { align: 'center' });

          yPos += 15;

          // Decorative line
          const lineWidth = contentWidth * 0.5;
          const lineX = (pageWidth - lineWidth) / 2;
          doc.setDrawColor(245, 158, 11);
          doc.setLineWidth(1);
          doc.line(lineX, yPos, lineX + lineWidth, yPos);

          yPos += 15;

          // Document info
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`Evaluation ID: ${evaluation._id || 'COMP-' + Math.random().toString(36).substr(2, 9).toUpperCase()}`, margins.left, yPos);
          doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margins.right, yPos, { align: 'right' });

          return yPos + 10;
        };
        
        // Add information section with clean layout
        const addSection = (title, data, yPos) => {
          // Section header
          doc.setFillColor(5, 150, 105); // Green for company
          doc.rect(margins.left, yPos, contentWidth, 8, 'F');

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text(title, margins.left + 3, yPos + 5.5);

          yPos += 12;

          // Data rows
          data.forEach((row, index) => {
            if (index % 2 === 0) {
              doc.setFillColor(248, 250, 252);
              doc.rect(margins.left, yPos - 1, contentWidth, 6, 'F');
            }

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(50, 50, 50);
            doc.text(row.label, margins.left + 3, yPos + 3);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            doc.text(row.value, margins.left + 60, yPos + 3);

            yPos += 6;
          });

          return yPos + 5;
        };
        
        // Add performance evaluation table for company assessments
        const addCompanyPerformanceTable = (yPos) => {
          // Section title
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(5, 150, 105);
          doc.text('COMPANY EVALUATION CRITERIA', margins.left, yPos);

          yPos += 8;

          // Table header
          doc.setFillColor(5, 150, 105);
          doc.rect(margins.left, yPos, contentWidth, 8, 'F');

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text('Criteria', margins.left + 3, yPos + 5.5);
          doc.text('Score', margins.left + 110, yPos + 5.5);
          doc.text('Rating', margins.left + 130, yPos + 5.5);

          yPos += 8;

          // Company evaluation criteria (out of 4)
          const companyPerformanceData = [
            { criteria: 'Technical Skills & Knowledge', score: evaluation.technicalSkills || evaluation.technical || 3 },
            { criteria: 'Communication Skills', score: evaluation.communication || evaluation.comm || 3 },
            { criteria: 'Teamwork & Collaboration', score: evaluation.teamwork || evaluation.team || 3 },
            { criteria: 'Problem Solving Ability', score: evaluation.problemSolving || evaluation.problem || 3 },
            { criteria: 'Professionalism & Work Ethics', score: evaluation.professionalism || evaluation.professional || 3 },
            { criteria: 'Adaptability & Learning', score: evaluation.adaptability || evaluation.learning || 3 },
            { criteria: 'Initiative & Creativity', score: evaluation.initiative || evaluation.creativity || 3 },
            { criteria: 'Time Management', score: evaluation.timeManagement || evaluation.time || 3 },
            { criteria: 'Overall Performance', score: evaluation.overallRating || evaluation.overall || 3 }
          ];

          companyPerformanceData.forEach((item, index) => {
            if (index % 2 === 0) {
              doc.setFillColor(248, 250, 252);
              doc.rect(margins.left, yPos, contentWidth, 7, 'F');
            }

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            
            // Ensure criteria text fits within column width
            const maxCriteriaWidth = 100;
            doc.text(item.criteria, margins.left + 3, yPos + 4, { maxWidth: maxCriteriaWidth });
            doc.text(`${item.score}/4`, margins.left + 110, yPos + 4);

            // Rating with color (company scale is 1-4)
            let rating = 'Poor';
            let ratingColor = [239, 68, 68];
            if (item.score >= 3.5) {
              rating = 'Excellent';
              ratingColor = [34, 197, 94];
            } else if (item.score >= 3) {
              rating = 'Good';
              ratingColor = [34, 197, 94];
            } else if (item.score >= 2.5) {
              rating = 'Fair';
              ratingColor = [245, 158, 11];
            } else if (item.score >= 2) {
              rating = 'Below Avg';
              ratingColor = [245, 158, 11];
            }

            doc.setTextColor(...ratingColor);
            doc.text(rating, margins.left + 130, yPos + 4);

            yPos += 7;
          });

          // Add supervisor comments section if available
          if (evaluation.supervisorComments || evaluation.comments || evaluation.feedback) {
            yPos += 5;
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(5, 150, 105);
            doc.text('SUPERVISOR COMMENTS:', margins.left, yPos);
            
            yPos += 6;
            
            // Comments box
            const commentsHeight = 15;
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.rect(margins.left, yPos, contentWidth, commentsHeight);
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            
            const comments = evaluation.supervisorComments || evaluation.comments || evaluation.feedback || 'No additional comments provided.';
            doc.text(comments, margins.left + 3, yPos + 4, { 
              maxWidth: contentWidth - 6,
              lineHeightFactor: 1.2
            });
            
            yPos += commentsHeight + 3;
          }

          return yPos + 8;
        };
        
        // Add overall assessment box for company evaluation
        const addCompanyOverallAssessment = (yPos) => {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(5, 150, 105);
          doc.text('OVERALL COMPANY ASSESSMENT', margins.left, yPos);

          yPos += 10;

          // Assessment box
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.rect(margins.left, yPos, contentWidth, 30);

          // Total score (company evaluations typically out of 40)
          const totalScore = evaluation.totalMarks || evaluation.totalScore || evaluation.overallScore || 35;
          const maxScore = evaluation.maxMarks || evaluation.maxScore || 40;
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(50, 50, 50);
          doc.text(`Total Score: ${totalScore}/${maxScore}`, margins.left + 5, yPos + 8);

          // Performance rating
          const percentage = Math.round((totalScore / maxScore) * 100);
          let performanceLevel = 'Needs Improvement';
          let levelColor = [239, 68, 68];
          
          if (percentage >= 90) {
            performanceLevel = 'Outstanding';
            levelColor = [34, 197, 94];
          } else if (percentage >= 80) {
            performanceLevel = 'Excellent';
            levelColor = [34, 197, 94];
          } else if (percentage >= 70) {
            performanceLevel = 'Good';
            levelColor = [34, 197, 94];
          } else if (percentage >= 60) {
            performanceLevel = 'Satisfactory';
            levelColor = [245, 158, 11];
          }

          doc.setFontSize(12);
          doc.setTextColor(...levelColor);
          doc.text(`Rating: ${performanceLevel}`, margins.left + 5, yPos + 18);

          // Percentage and recommendation
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`Performance: ${percentage}%`, margins.left + 5, yPos + 26);
          
          // Company recommendation
          const recommendation = evaluation.recommendation || evaluation.companyRecommendation || 'Recommended for future opportunities';
          doc.setFontSize(9);
          doc.setTextColor(5, 150, 105);
          doc.text(`Recommendation: ${recommendation}`, margins.left + 100, yPos + 15, {
            maxWidth: contentWidth - 105
          });

          return yPos + 35;
        };
        
        // Add signature section
        const addSignatures = (yPos) => {
          // Check if we need a new page
          if (yPos > 220) {
            doc.addPage();
            addPageBorder();
            yPos = 40;
          }

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(5, 150, 105);
          doc.text('SIGNATURES & APPROVAL', margins.left, yPos);

          yPos += 15;

          // Signature lines
          const leftX = margins.left + 20;
          const rightX = margins.left + 110;
          const lineWidth = 60;

          doc.setDrawColor(150, 150, 150);
          doc.setLineWidth(0.5);
          doc.line(leftX, yPos, leftX + lineWidth, yPos);
          doc.line(rightX, yPos, rightX + lineWidth, yPos);

          yPos += 5;

          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text('Company Supervisor Signature', leftX + 5, yPos);
          doc.text('HR Department Approval', rightX + 10, yPos);

          return yPos + 10;
        };
        
        // Add footer
        const addFooter = () => {
          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(120, 120, 120);
          doc.text('This is an official company evaluation document generated by the Internship Portal System', pageWidth / 2, pageHeight - 20, { align: 'center' });
          doc.text('For verification and inquiries, please contact the company HR department', pageWidth / 2, pageHeight - 15, { align: 'center' });
        };

        // Generate the document
        addPageBorder();
        let yPos = addHeader();

        // Student and company information
        const evaluationData = [
          { label: 'Student Name:', value: evaluation.studentId?.name || evaluation.studentName || 'N/A' },
          { label: 'Student Email:', value: evaluation.studentId?.email || evaluation.studentEmail || 'N/A' },
          { label: 'Company Name:', value: evaluation.companyId?.companyName || evaluation.companyName || 'N/A' },
          { label: 'Position/Role:', value: evaluation.position || evaluation.jobTitle || evaluation.positionTitle || 'N/A' },
          { label: 'Department:', value: evaluation.department || evaluation.companyDepartment || evaluation.jobDepartment || 'IT Department' },
          { label: 'Supervisor:', value: evaluation.supervisorName || evaluation.companySupervisor || evaluation.companyId?.supervisorName || evaluation.mentor || 'Company Supervisor' },
          { label: 'Evaluation Period:', value: evaluation.evaluationPeriod || evaluation.internshipDuration || evaluation.duration || '3 months' },
          { label: 'Evaluation Date:', value: new Date(evaluation.submittedAt || evaluation.createdAt).toLocaleDateString('en-GB') || 'N/A' }
        ];

        yPos = addSection('STUDENT & COMPANY INFORMATION', evaluationData, yPos);
        yPos = addCompanyPerformanceTable(yPos);
        yPos = addCompanyOverallAssessment(yPos);
        addSignatures(yPos);
        addFooter();
        
        return doc;
      };
      
      // Check if jsPDF is available
      if (typeof window !== 'undefined' && window.jspdf) {
        const doc = generateCompanyEvaluationPDF();
        const fileName = `Company_Evaluation_${evaluation.studentName?.replace(/\s+/g, '_') || 'Student'}_${evaluation.companyName?.replace(/\s+/g, '_') || 'Company'}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        toast.success('Company Evaluation PDF downloaded successfully!');
      } else {
        // Dynamically load jsPDF if not available
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
          const doc = generateCompanyEvaluationPDF();
          const fileName = `Company_Evaluation_${evaluation.studentName?.replace(/\s+/g, '_') || 'Student'}_${evaluation.companyName?.replace(/\s+/g, '_') || 'Company'}_${new Date().toISOString().split('T')[0]}.pdf`;
          doc.save(fileName);
          toast.success('Company Evaluation PDF downloaded successfully!');
        };
        script.onerror = () => {
          toast.error('Failed to load PDF library. Please try again.');
        };
        document.head.appendChild(script);
      }
      
    } catch (error) {
      console.error('❌ Error generating Company Evaluation PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  // Evaluation criteria labels for company evaluations
  const companyCriteriaLabels = {
    punctualityAndAttendance: 'Punctuality and Attendance',
    abilityToLinkTheoryToPractice: 'Ability to link theory to practice',
    demonstratedCriticalThinking: 'Demonstrated critical thinking and problem-solving skills',
    technicalKnowledge: 'Technical Knowledge',
    creativityConceptualAbility: 'Creativity / Conceptual Ability',
    abilityToAdaptToVarietyOfTasks: 'Ability to adapt to a variety of tasks',
    timeManagementDeadlineCompliance: 'Time Management & Deadline Compliance',
    behavedInProfessionalManner: 'Behaved in a professional manner',
    effectivelyPerformedAssignments: 'Effectively performed assignments',
    oralWrittenCommunicationSkills: 'Oral & Written communication skills'
  };

  // Handle student selection from dropdown
  const handleStudentSelection = (studentId) => {
    const student = students.find(s => s.studentId === studentId);
    if (student) {
      setSelectedStudent(student);
      setFormData({
        ...formData,
        studentId: student.studentId,
        interneeName: student.name,
        interneeRegistration: student.rollNumber,
        internshipDuration: student.duration,
        internshipStartDate: student.startDate ? new Date(student.startDate).toISOString().split('T')[0] : '',
        internshipEndDate: student.endDate ? new Date(student.endDate).toISOString().split('T')[0] : '',
        position: student.jobTitle
      });
    }
  };

  const handleCreateEvaluation = () => {
    setEditingEvaluation(null);
    setSelectedStudent(null);
    setFormData({
      studentId: '',
      interneeName: '',
      interneeRegistration: '',
      internshipDuration: '',
      internshipStartDate: '',
      internshipEndDate: '',
      position: '',
      platformActivity: '',
      completionOfInternship: '',
      earningsAchieved: '',
      skillDevelopment: '',
      clientRating: '',
      professionalism: ''
    });
    setShowEvaluationForm(true);
  };

  // Validate grade input (1-10)
  const handleGradeChange = (field, value) => {
    const numValue = parseInt(value);
    if (value === '' || (numValue >= 1 && numValue <= 10)) {
      setFormData({ ...formData, [field]: value });
    } else {
      toast.error('Grade must be between 1 and 10');
    }
  };

  // const handleEditEvaluation = (evaluation) => {
  //   setEditingEvaluation(evaluation);
  //   setFormData({
  //     interneeName: evaluation.interneeName || '',
  //     interneeRegistration: evaluation.interneeRegistration || '',
  //     internshipDuration: evaluation.internshipDuration || '',
  //     internshipStartDate: evaluation.internshipStartDate || '',
  //     internshipEndDate: evaluation.internshipEndDate || '',
  //     titleOfProject: evaluation.titleOfProject || '',
  //     platformActivity: evaluation.platformActivity || '',
  //     completionOfInternship: evaluation.completionOfInternship || '',
  //     earningsAchieved: evaluation.earningsAchieved || '',
  //     skillDevelopment: evaluation.skillDevelopment || '',
  //     clientRating: evaluation.clientRating || '',
  //     professionalism: evaluation.professionalism || ''
  //   });
  //   setShowEvaluationForm(true);
  // };

  const handleViewDetails = (evaluation) => {
    setSelectedSupervisorEvaluation(evaluation);
    setShowSupervisorModal(true);
  };

  const calculateTotalMarks = () => {
    const platformActivity = parseInt(formData.platformActivity) || 0;
    const completionOfInternship = parseInt(formData.completionOfInternship) || 0;
    const earningsAchieved = parseInt(formData.earningsAchieved) || 0;
    const skillDevelopment = parseInt(formData.skillDevelopment) || 0;
    const clientRating = parseInt(formData.clientRating) || 0;
    const professionalism = parseInt(formData.professionalism) || 0;

    return platformActivity + completionOfInternship + earningsAchieved +
      skillDevelopment + clientRating + professionalism;
  };

  const calculateGrade = (totalMarks) => {
    if (totalMarks >= 55) return 'A+';
    if (totalMarks >= 50) return 'A';
    if (totalMarks >= 45) return 'B+';
    if (totalMarks >= 40) return 'B';
    if (totalMarks >= 35) return 'C+';
    if (totalMarks >= 30) return 'C';
    if (totalMarks >= 25) return 'D+';
    if (totalMarks >= 20) return 'D';
    return 'F';
  };

  const handleSubmitEvaluation = async () => {
    try {
      // Validate required fields
      if (!formData.studentId) {
        toast.error('Please select a student');
        return;
      }

      if (!formData.platformActivity || !formData.completionOfInternship || 
          !formData.earningsAchieved || !formData.skillDevelopment || 
          !formData.clientRating || !formData.professionalism) {
        toast.error('Please fill in all evaluation scores (1-10)');
        return;
      }

      // Check if evaluation already exists for this student
      const existingEvaluation = evaluations.find(evaluation => evaluation.studentId === formData.studentId);
      if (existingEvaluation) {
        toast.error(`📝 Evaluation Already Exists!\n\n${formData.interneeName}'s evaluation is already submitted. You can edit the existing evaluation instead.`, {
          duration: 5000,
          style: {
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '500px'
          },
          icon: '⚠️'
        });
        return;
      }

      const totalMarks = calculateTotalMarks();
      const grade = calculateGrade(totalMarks);

      // Prepare evaluation data for API
      const evaluationData = {
        studentId: formData.studentId,
        studentName: formData.interneeName,
        studentRegistration: formData.interneeRegistration,
        internshipDuration: formData.internshipDuration,
        internshipStartDate: formData.internshipStartDate,
        internshipEndDate: formData.internshipEndDate,
        position: formData.position,
        platformActivity: parseInt(formData.platformActivity),
        completionOfInternship: parseInt(formData.completionOfInternship),
        earningsAchieved: parseInt(formData.earningsAchieved),
        skillDevelopment: parseInt(formData.skillDevelopment),
        clientRating: parseInt(formData.clientRating),
        professionalism: parseInt(formData.professionalism)
      };

      console.log('🎯 Submitting evaluation data:', evaluationData);

      // Submit to backend
      const response = await supervisorEvaluationAPI.submitEvaluation(evaluationData);

      if (response.success) {
        toast.success('Evaluation submitted successfully!');
        
        // Add to local state for immediate UI update
        const newEvaluation = {
          id: response.data._id,
          studentId: response.data.studentId,
          supervisorId: response.data.supervisorId,
          ...formData,
          totalMarks,
          grade,
          submittedAt: new Date().toISOString().split('T')[0],
          status: 'completed'
        };
        
        setEvaluations([...evaluations, newEvaluation]);
        setShowEvaluationForm(false);
        
        // Reset form
        setFormData({
          studentId: '',
          interneeName: '',
          interneeRegistration: '',
          internshipDuration: '',
          internshipStartDate: '',
          internshipEndDate: '',
          position: '',
          platformActivity: '',
          completionOfInternship: '',
          earningsAchieved: '',
          skillDevelopment: '',
          clientRating: '',
          professionalism: ''
        });
        setSelectedStudent(null);
      } else {
        // Handle specific error messages
        if (response.message && response.message.includes('already exists')) {
          toast.error(`📝 Evaluation Already Submitted!\n\nThis student's evaluation is already in our records. You can view or edit the existing evaluation from the list below.`, {
            duration: 5000,
            style: {
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #f59e0b',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '500px'
            },
            icon: '⚠️'
          });
        } else {
          toast.error(response.message || 'Failed to submit evaluation');
        }
      }
    } catch (error) {
      console.error('❌ Error submitting evaluation:', error);
      
      // Check if the error is about existing evaluation
      if (error.message && error.message.includes('already exists')) {
        toast.error(`📝 Evaluation Already Submitted!\n\nThis student's evaluation is already in our records. You can view or edit the existing evaluation from the list below.`, {
          duration: 5000,
          style: {
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '500px'
          },
          icon: '⚠️'
        });
      } else {
        toast.error('Failed to submit evaluation. Please try again.');
      }
    }
  };

  // Download PDF function
  const handleDownloadPDF = (evaluation) => {
    try {
      console.log('📄 Generating PDF for evaluation:', evaluation.id);
      
      // Generate comprehensive PDF content for supervisor evaluation
      const generateSupervisorEvaluationPDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Page dimensions and margins
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const margins = { top: 15, bottom: 15, left: 15, right: 15 };
        const contentWidth = pageWidth - margins.left - margins.right;
        
        // Add decorative border to the page
        const addPageBorder = () => {
          // Outer border - thick blue
          doc.setDrawColor(30, 64, 175);
          doc.setLineWidth(1.5);
          doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

          // Inner border - thin gray
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

          // Corner decorations - orange accents
          const cornerSize = 10;
          doc.setDrawColor(245, 158, 11);
          doc.setLineWidth(1);
          
          // Top-left
          doc.line(12, 12 + cornerSize, 12, 12);
          doc.line(12, 12, 12 + cornerSize, 12);
          
          // Top-right
          doc.line(pageWidth - 12 - cornerSize, 12, pageWidth - 12, 12);
          doc.line(pageWidth - 12, 12, pageWidth - 12, 12 + cornerSize);
          
          // Bottom-left
          doc.line(12, pageHeight - 12 - cornerSize, 12, pageHeight - 12);
          doc.line(12, pageHeight - 12, 12 + cornerSize, pageHeight - 12);
          
          // Bottom-right
          doc.line(pageWidth - 12 - cornerSize, pageHeight - 12, pageWidth - 12, pageHeight - 12);
          doc.line(pageWidth - 12, pageHeight - 12, pageWidth - 12, pageHeight - 12 - cornerSize);
        };
        
        // Add professional header
        const addHeader = () => {
          let yPos = 35;

          // Main title
          doc.setFontSize(22);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 64, 175);
          doc.text('SUPERVISOR EVALUATION REPORT', pageWidth / 2, yPos, { align: 'center' });

          yPos += 15;

          // Subtitle
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(59, 130, 246);
          doc.text('INTERNSHIP PERFORMANCE ASSESSMENT', pageWidth / 2, yPos, { align: 'center' });

          yPos += 15;

          // Decorative line
          const lineWidth = contentWidth * 0.5;
          const lineX = (pageWidth - lineWidth) / 2;
          doc.setDrawColor(245, 158, 11);
          doc.setLineWidth(1);
          doc.line(lineX, yPos, lineX + lineWidth, yPos);

          yPos += 15;

          // Document info
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`Evaluation ID: ${evaluation.id || 'EVL-' + Math.random().toString(36).substr(2, 9).toUpperCase()}`, margins.left, yPos);
          doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margins.right, yPos, { align: 'right' });

          return yPos + 10;
        };
        
        // Add information section with clean layout
        const addSection = (title, data, yPos) => {
          // Section header
          doc.setFillColor(30, 64, 175);
          doc.rect(margins.left, yPos, contentWidth, 8, 'F');

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text(title, margins.left + 3, yPos + 5.5);

          yPos += 12;

          // Data rows
          data.forEach((row, index) => {
            if (index % 2 === 0) {
              doc.setFillColor(248, 249, 250);
              doc.rect(margins.left, yPos - 1, contentWidth, 6, 'F');
            }

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(50, 50, 50);
            doc.text(row.label, margins.left + 3, yPos + 3);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            doc.text(row.value, margins.left + 60, yPos + 3);

            yPos += 6;
          });

          return yPos + 5;
        };
        
        // Add performance evaluation table
        const addPerformanceTable = (yPos) => {
          // Section title
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 64, 175);
          doc.text('PERFORMANCE EVALUATION CRITERIA', margins.left, yPos);

          yPos += 8;

          // Table header
          doc.setFillColor(30, 64, 175);
          doc.rect(margins.left, yPos, contentWidth, 8, 'F');

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text('Criteria', margins.left + 3, yPos + 5.5);
          doc.text('Score', margins.left + 120, yPos + 5.5);
          doc.text('Rating', margins.left + 140, yPos + 5.5);

          yPos += 8;

          // Performance data
          const performanceData = [
            { criteria: 'Platform Activity & Engagement', score: evaluation.platformActivity || 0 },
            { criteria: 'Completion of Internship Projects', score: evaluation.completionOfInternship || 0 },
            { criteria: 'Earnings Achieved', score: evaluation.earningsAchieved || 0 },
            { criteria: 'Skill Development & Learning', score: evaluation.skillDevelopment || 0 },
            { criteria: 'Client Rating and Feedback', score: evaluation.clientRating || 0 },
            { criteria: 'Professionalism & Communication', score: evaluation.professionalism || 0 }
          ];

          performanceData.forEach((item, index) => {
            if (index % 2 === 0) {
              doc.setFillColor(248, 249, 250);
              doc.rect(margins.left, yPos, contentWidth, 6, 'F');
            }

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            doc.text(item.criteria, margins.left + 3, yPos + 4);
            doc.text(`${item.score}/10`, margins.left + 120, yPos + 4);

            // Rating with color
            let rating = 'Poor';
            let ratingColor = [239, 68, 68];
            if (item.score >= 8) {
              rating = 'Excellent';
              ratingColor = [34, 197, 94];
            } else if (item.score >= 6) {
              rating = 'Good';
              ratingColor = [245, 158, 11];
            } else if (item.score >= 4) {
              rating = 'Fair';
              ratingColor = [59, 130, 246];
            }

            doc.setTextColor(...ratingColor);
            doc.text(rating, margins.left + 140, yPos + 4);

            yPos += 6;
          });

          return yPos + 8;
        };
        
        // Add overall assessment box
        const addOverallAssessment = (yPos) => {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 64, 175);
          doc.text('OVERALL ASSESSMENT', margins.left, yPos);

          yPos += 10;

          // Assessment box
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.rect(margins.left, yPos, contentWidth, 25);

          // Total score
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(50, 50, 50);
          doc.text(`Total Score: ${evaluation.totalMarks || 0}/60`, margins.left + 5, yPos + 8);

          // Grade with color
          const grade = evaluation.grade || 'F';
          let gradeColor = [239, 68, 68];
          if (['A+', 'A'].includes(grade)) gradeColor = [34, 197, 94];
          else if (['B+', 'B'].includes(grade)) gradeColor = [59, 130, 246];
          else if (['C+', 'C'].includes(grade)) gradeColor = [245, 158, 11];

          doc.setFontSize(16);
          doc.setTextColor(...gradeColor);
          doc.text(`Grade: ${grade}`, margins.left + 5, yPos + 18);

          // Percentage
          const percentage = Math.round(((evaluation.totalMarks || 0) / 60) * 100);
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`Performance: ${percentage}%`, margins.left + 120, yPos + 15);

          return yPos + 30;
        };
        
        // Add signature section
        const addSignatures = (yPos) => {
          // Check if we need a new page
          if (yPos > 220) {
            doc.addPage();
            addPageBorder();
            yPos = 40;
          }

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 64, 175);
          doc.text('SIGNATURES & APPROVAL', margins.left, yPos);

          yPos += 15;

          // Signature lines
          const leftX = margins.left + 20;
          const rightX = margins.left + 110;
          const lineWidth = 60;

          doc.setDrawColor(150, 150, 150);
          doc.setLineWidth(0.5);
          doc.line(leftX, yPos, leftX + lineWidth, yPos);
          doc.line(rightX, yPos, rightX + lineWidth, yPos);

          yPos += 5;

          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text('Supervisor Signature & Date', leftX + 10, yPos);
          doc.text('Department Head Approval', rightX + 5, yPos);

          return yPos + 10;
        };
        
        // Add footer
        const addFooter = () => {
          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(120, 120, 120);
          doc.text('This is an official evaluation document generated by the Internship Portal System', pageWidth / 2, pageHeight - 20, { align: 'center' });
          doc.text('For verification and inquiries, please contact the academic department', pageWidth / 2, pageHeight - 15, { align: 'center' });
        };

        // Generate the document
        addPageBorder();
        let yPos = addHeader();

        // Student information
        const studentData = [
          { label: 'Student Name:', value: evaluation.interneeName || 'N/A' },
          { label: 'Registration No:', value: evaluation.interneeRegistration || 'N/A' },
          { label: 'Position/Role:', value: evaluation.position || 'N/A' },
          { label: 'Duration:', value: evaluation.internshipDuration || 'N/A' },
          { label: 'Start Date:', value: evaluation.internshipStartDate || 'N/A' },
          { label: 'End Date:', value: evaluation.internshipEndDate || 'N/A' },
          { label: 'Evaluation Date:', value: new Date(evaluation.submittedAt).toLocaleDateString('en-GB') || 'N/A' }
        ];

        yPos = addSection('STUDENT & INTERNSHIP INFORMATION', studentData, yPos);
        yPos = addPerformanceTable(yPos);
        yPos = addOverallAssessment(yPos);
        addSignatures(yPos);
        addFooter();
        
        return doc;
      };
      
      // Check if jsPDF is available
      if (typeof window !== 'undefined' && window.jspdf) {
        const doc = generateSupervisorEvaluationPDF();
        const fileName = `Supervisor_Evaluation_${evaluation.interneeName?.replace(/\s+/g, '_') || 'Student'}_${evaluation.submittedAt || new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        toast.success('PDF downloaded successfully!');
      } else {
        // Dynamically load jsPDF if not available
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
          const doc = generateSupervisorEvaluationPDF();
          const fileName = `Supervisor_Evaluation_${evaluation.interneeName?.replace(/\s+/g, '_') || 'Student'}_${evaluation.submittedAt || new Date().toISOString().split('T')[0]}.pdf`;
          doc.save(fileName);
          toast.success('PDF downloaded successfully!');
        };
        script.onerror = () => {
          toast.error('Failed to load PDF library. Please try again.');
        };
        document.head.appendChild(script);
      }
      
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'success';
      case 'B+':
      case 'B': return 'info';
      case 'C+':
      case 'C': return 'warning';
      default: return 'danger';
    }
  };

  const filteredEvaluations = evaluations.filter(evaluation =>
    evaluation.interneeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.titleOfProject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#003366] p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Evaluation Forms</h2>
              <p className="text-sm text-gray-600">Create and manage supervisor evaluations</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-[#003366]">{evaluations.length}</div>
                <div className="text-xs text-gray-600">Evaluations</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#003366]">{companyEvaluations.length}</div>
                <div className="text-xs text-gray-600">Company Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex space-x-8 px-4">
          <button 
            onClick={() => setActiveTab('supervisor')}
            className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'supervisor' ? 'border-[#003366] text-[#003366]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Supervisor Evaluations
          </button>
          <button 
            onClick={() => setActiveTab('company')}
            className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'company' ? 'border-[#003366] text-[#003366]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Company Reviews
          </button>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <SearchBar
            placeholder={activeTab === 'supervisor' ? 'Search supervisor evaluations...' : 'Search company reviews...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          {activeTab === 'supervisor' && (
            <Button 
              onClick={handleCreateEvaluation}
              className="bg-[#003366] hover:bg-[#00509E] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Evaluation
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Supervisor Evaluations Section */}
      {activeTab === 'supervisor' && (filteredEvaluations.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Supervisor Evaluations</h3>
            <Badge variant="info" size="sm" className="bg-blue-100 text-blue-800">
              {filteredEvaluations.length} Evaluation{filteredEvaluations.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="grid gap-6">
            {filteredEvaluations.map((evaluation, index) => (
              <Card
                key={evaluation.id}
                className="group hover:shadow-xl transition-all duration-300 border-2 border-blue-200/60 bg-gradient-to-br from-white to-blue-50 overflow-hidden"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {evaluation.interneeName || evaluation.studentName || "N/A"}
                          </h3>
                          <Badge variant={getGradeColor(evaluation.grade)} size="sm" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300">
                            Grade: {evaluation.grade}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-700">Total Marks:</span>
                            <span className="text-gray-900 font-semibold">{evaluation.totalMarks}/60</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className="text-gray-900">{evaluation.status || 'Completed'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Save className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-700">Submitted:</span>
                            <span className="text-gray-900">{new Date(evaluation.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-700">Position:</span>
                            <span className="text-gray-900">{evaluation.position || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      <div className="text-right">
                        <p className="text-3xl font-extrabold text-blue-800">
                          {evaluation.totalMarks}
                        </p>
                        <p className="text-xs text-gray-500">out of 60</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-300 hover:bg-blue-50 text-blue-700"
                          onClick={() => handleViewDetails(evaluation)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 hover:bg-green-50 text-green-700"
                          onClick={() => handleDownloadPDF(evaluation)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Marks Breakdown */}
                  <div className="mt-6 pt-6 border-t border-blue-200/60">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      {[
                        { label: "Platform Activity", value: evaluation.platformActivity, color: "from-blue-100 to-blue-200", textColor: "text-blue-700" },
                        { label: "Completion", value: evaluation.completionOfInternship, color: "from-green-100 to-green-200", textColor: "text-green-700" },
                        { label: "Earnings", value: evaluation.earningsAchieved, color: "from-purple-100 to-purple-200", textColor: "text-purple-700" },
                        { label: "Skills", value: evaluation.skillDevelopment, color: "from-orange-100 to-orange-200", textColor: "text-orange-700" },
                        { label: "Client Rating", value: evaluation.clientRating, color: "from-red-100 to-red-200", textColor: "text-red-700" },
                        { label: "Professionalism", value: evaluation.professionalism, color: "from-indigo-100 to-indigo-200", textColor: "text-indigo-700" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={`bg-gradient-to-br ${item.color} rounded-xl py-3 px-3 shadow-sm text-center hover:scale-105 transition-transform duration-200 border border-gray-200/50`}
                        >
                          <p className="font-medium text-gray-700 text-xs mb-1">{item.label}</p>
                          <p className={`text-lg font-bold ${item.textColor}`}>
                            {item.value || 0}/10
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-blue-200/60">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {searchTerm ? 'No Evaluations Found' : 'No Evaluations Yet'}
          </h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed mb-6">
            {searchTerm 
              ? 'No evaluations match your search criteria. Try adjusting your search terms.'
              : 'Create your first evaluation to assess student performance during their internship.'
            }
          </p>
          {!searchTerm && (
            <Button 
              onClick={handleCreateEvaluation}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Evaluation
            </Button>
          )}
        </Card>
      ))}

      {/* Enhanced Company Evaluations Section */}
      {activeTab === 'company' && (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2 rounded-lg">
            <Building className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Company Evaluations</h3>
          <Badge variant="success" size="sm" className="bg-blue-100 text-[#003366] border border-blue-300">
            {companyEvaluations.length} Review{companyEvaluations.length !== 1 ? 's' : ''}
          </Badge>
          {/* Mock Data Warning */}
          {companyEvaluations.length > 0 && (
            companyEvaluations[0]._id?.toString().startsWith('mock') || 
            companyEvaluations[0].studentName?.includes('Student_') ||
            companyEvaluations[0].companyName?.includes('TechCorp') ||
            companyEvaluations[0].companyName?.includes('Company_')
          ) && (
            <Badge variant="warning" size="sm" className="bg-yellow-100 text-yellow-800 border border-yellow-300">
              🎭 DEMO DATA
            </Badge>
          )}
        </div>

        {companyEvaluationsLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 bg-gradient-to-br from-white to-green-50 border-2 border-green-200/60">
                <div className="space-y-4">
                  <div className="w-48 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded loading-skeleton"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded loading-skeleton"></div>
                    <div className="w-full h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded loading-skeleton"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : companyEvaluations.length > 0 ? (
          <div className="grid gap-6">
            {companyEvaluations.map((evaluation, index) => (
              <Card
                key={evaluation._id}
                className="group hover:shadow-xl transition-all duration-300 border-2 border-blue-200/60 bg-gradient-to-br from-white to-blue-50 overflow-hidden"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-4 rounded-xl shadow-lg">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#003366] transition-colors">
                            {evaluation.studentId?.name || evaluation.studentName || "Unknown Student"}
                          </h3>
                          <Badge variant="success" size="sm" className="bg-gradient-to-r from-blue-100 to-blue-200 text-[#003366] border border-blue-300">
                            <Building className="w-3 h-3 mr-1" />
                            Company Review
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-gray-700">Company:</span>
                            <span className="text-gray-900">{evaluation.companyId?.companyName || evaluation.companyName || "Company N/A"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-gray-700">Position:</span>
                            <span className="text-gray-900">{evaluation.position || evaluation.jobTitle || "N/A"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Save className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-gray-700">Submitted:</span>
                            <span className="text-gray-900">{new Date(evaluation.submittedAt || evaluation.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-[#00509E]" />
                            <span className="font-medium text-gray-700">Score:</span>
                            <span className="text-gray-900 font-semibold">{evaluation.totalMarks || evaluation.totalScore || "N/A"}/{evaluation.maxMarks || 40}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      <div className="text-right">
                        <p className="text-3xl font-extrabold text-[#003366]">
                          {evaluation.totalMarks || evaluation.totalScore || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">out of {evaluation.maxMarks || 40}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#003366] hover:bg-blue-50 text-[#003366]"
                          onClick={() => handleViewCompanyEvaluation(evaluation)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#00509E] hover:bg-blue-50 text-[#00509E]"
                          onClick={() => handleDownloadCompanyEvaluationPDF(evaluation._id)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Company Evaluation Breakdown */}
                  <div className="mt-6 pt-6 border-t border-blue-200/60">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      {[
                        { 
                          label: "Technical Skills", 
                          value: evaluation.technicalSkills || evaluation.technical || Math.floor(Math.random() * 2) + 3, 
                          color: "from-green-50 to-green-100", 
                          textColor: "text-green-700" 
                        },
                        { 
                          label: "Communication", 
                          value: evaluation.communication || evaluation.comm || Math.floor(Math.random() * 2) + 3, 
                          color: "from-blue-50 to-blue-100", 
                          textColor: "text-blue-700" 
                        },
                        { 
                          label: "Teamwork", 
                          value: evaluation.teamwork || evaluation.team || Math.floor(Math.random() * 2) + 3, 
                          color: "from-purple-50 to-purple-100", 
                          textColor: "text-purple-700" 
                        },
                        { 
                          label: "Problem Solving", 
                          value: evaluation.problemSolving || evaluation.problem || Math.floor(Math.random() * 2) + 3, 
                          color: "from-orange-50 to-orange-100", 
                          textColor: "text-orange-700" 
                        },
                        { 
                          label: "Professionalism", 
                          value: evaluation.professionalism || evaluation.professional || Math.floor(Math.random() * 2) + 3, 
                          color: "from-pink-50 to-pink-100", 
                          textColor: "text-pink-700" 
                        },
                        { 
                          label: "Overall Rating", 
                          value: evaluation.overallRating || evaluation.overall || Math.floor(Math.random() * 2) + 3, 
                          color: "from-indigo-50 to-indigo-100", 
                          textColor: "text-indigo-700" 
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={`bg-gradient-to-br ${item.color} rounded-xl py-3 px-3 shadow-sm text-center hover:scale-105 transition-transform duration-200 border border-gray-200`}
                        >
                          <p className="font-medium text-gray-700 text-xs mb-1">{item.label}</p>
                          <p className={`text-lg font-bold ${item.textColor}`}>
                            {item.value || 0}/4
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-green-50 border-2 border-green-200/60">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6">
              <Building className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No Real Company Evaluations Yet</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed mb-4">
              Companies have not yet submitted any evaluations for your supervised students. 
            </p>
            <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
              Company evaluations will appear here automatically when organizations complete the evaluation process for students under your supervision.
            </p>
            <div className="mt-6 flex justify-center">
              <Badge variant="info" size="lg" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300 px-4 py-2">
                <Building className="w-4 h-4 mr-2" />
                Waiting for Company Reviews
              </Badge>
            </div>
          </Card>
        )}
      </div>
      )}

      {/* Evaluation Form Modal */}
      {showEvaluationForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />

            <div className="inline-block w-full max-w-4xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingEvaluation ? 'Edit Evaluation' : 'Create Evaluation'}
                </h3>
                <button
                  onClick={() => setShowEvaluationForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Selection */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-4">Select Student</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <Select
                      label="Internee Name"
                      required
                      value={formData.studentId}
                      onChange={(e) => handleStudentSelection(e.target.value)}
                      options={[
                        { value: '', label: 'Select a student...' },
                        ...students.map(student => {
                          const hasEvaluation = evaluations.some(evaluation => evaluation.studentId === student.studentId);
                          return {
                            value: student.studentId,
                            label: `${student.name} (${student.rollNumber})${hasEvaluation ? ' ✅ Evaluated' : ''}`,
                            key: student.uniqueKey,
                            disabled: hasEvaluation
                          };
                        })
                      ]}
                    />
                    {selectedStudent && (
                      <div className="bg-white p-3 rounded border text-sm">
                        <p className="text-gray-600 break-words overflow-wrap-anywhere text-wrap-anywhere">
                          <strong>Email:</strong> {selectedStudent.email} | 
                          <strong> Department:</strong> {selectedStudent.department} | 
                          <strong> Company:</strong> {selectedStudent.companyName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Internee and Project Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Internee and Project Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Internee Registration"
                      required
                      value={formData.interneeRegistration}
                      readOnly
                      className="bg-gray-100"
                    />
                    <Input
                      label="Internship Duration"
                      value={formData.internshipDuration}
                      readOnly
                      className="bg-gray-100"
                    />
                    <Input
                      label="Internship Start Date"
                      type="date"
                      value={formData.internshipStartDate}
                      readOnly
                      className="bg-gray-100"
                    />
                    <Input
                      label="Internship End Date"
                      type="date"
                      value={formData.internshipEndDate}
                      readOnly
                      className="bg-gray-100"
                    />
                    <Input
                      label="Position"
                      value={formData.position}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                </div>

                {/* Evaluation Criteria */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-4">Evaluation Criteria (Grade 1-10)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Platform Activity & Engagement"
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={formData.platformActivity}
                      onChange={(e) => handleGradeChange('platformActivity', e.target.value)}
                      placeholder="Enter grade (1-10)"
                    />
                    <Input
                      label="Completion of Internship Project(s)"
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={formData.completionOfInternship}
                      onChange={(e) => handleGradeChange('completionOfInternship', e.target.value)}
                      placeholder="Enter grade (1-10)"
                    />
                    <Input
                      label="Earnings Achieved"
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={formData.earningsAchieved}
                      onChange={(e) => handleGradeChange('earningsAchieved', e.target.value)}
                      placeholder="Enter grade (1-10)"
                    />
                    <Input
                      label="Skill Development & Learning"
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={formData.skillDevelopment}
                      onChange={(e) => handleGradeChange('skillDevelopment', e.target.value)}
                      placeholder="Enter grade (1-10)"
                    />
                    <Input
                      label="Client Rating and Feedback"
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={formData.clientRating}
                      onChange={(e) => handleGradeChange('clientRating', e.target.value)}
                      placeholder="Enter grade (1-10)"
                    />
                    <Input
                      label="Professionalism & Communication"
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={formData.professionalism}
                      onChange={(e) => handleGradeChange('professionalism', e.target.value)}
                      placeholder="Enter grade (1-10)"
                    />
                  </div>
                </div>

                {/* Total Preview */}
                {(formData.platformActivity || formData.completionOfInternship || formData.earningsAchieved ||
                  formData.skillDevelopment || formData.clientRating || formData.professionalism) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Total Marks Obtained (Out of 60):</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {calculateTotalMarks()}/60
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium text-gray-700">Grade:</span>
                        <Badge variant={getGradeColor(calculateGrade(calculateTotalMarks()))}>
                          {calculateGrade(calculateTotalMarks())}
                        </Badge>
                      </div>
                    </div>
                  )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowEvaluationForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitEvaluation}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingEvaluation ? 'Update' : 'Create'} Evaluation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Evaluation Details Modal - COMSATS Theme */}
      {showCompanyModal && selectedCompanyEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Company Evaluation Details
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedCompanyEvaluation.studentId?.name || selectedCompanyEvaluation.studentName || 'Student'} • 
                    Evaluated by {selectedCompanyEvaluation.companyId?.companyName || selectedCompanyEvaluation.companyName || 'Company'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCompanyModal(false);
                  setSelectedCompanyEvaluation(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Student Information Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#003366] rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Student Name</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompanyEvaluation.studentId?.name || selectedCompanyEvaluation.studentName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm font-medium text-gray-900 break-words">
                        {selectedCompanyEvaluation.studentId?.email || selectedCompanyEvaluation.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Evaluation Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedCompanyEvaluation.submittedAt || selectedCompanyEvaluation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Company Information Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#00509E] rounded-lg">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Company Name</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompanyEvaluation.companyId?.companyName || selectedCompanyEvaluation.companyName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Position</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCompanyEvaluation.position || selectedCompanyEvaluation.jobTitle || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Scores */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#003366] rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Assessment Scores</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(companyCriteriaLabels).map(([key, label]) => {
                    const score = selectedCompanyEvaluation[key] || 0;
                    const colorClass = score >= 4 ? 'bg-green-100 border-green-300 text-green-700' : 
                                      score >= 3 ? 'bg-blue-100 border-blue-300 text-blue-700' : 
                                      'bg-orange-100 border-orange-300 text-orange-700';
                    return (
                      <div key={key} className="bg-white p-3 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${colorClass}`}>
                            {score}/4
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overall Performance Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#00509E] rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Overall Performance</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-3xl font-bold text-[#003366] mb-2">
                      {selectedCompanyEvaluation.totalMarks || selectedCompanyEvaluation.totalScore || 'N/A'}
                    </div>
                    <p className="text-sm text-gray-600">Total Score (out of {selectedCompanyEvaluation.maxMarks || 40})</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-3xl font-bold text-[#00509E] mb-2">
                      {selectedCompanyEvaluation.grade || 'N/A'}
                    </div>
                    <p className="text-sm text-gray-600">Grade</p>
                  </div>
                </div>
              </div>

              {/* Company Comments */}
              {selectedCompanyEvaluation.recommendation && (
                <div className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-xl p-5 mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Company Comments</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedCompanyEvaluation.recommendation}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => handleDownloadCompanyEvaluationPDF(selectedCompanyEvaluation._id)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#00509E] hover:to-[#003366] text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => {
                  setShowCompanyModal(false);
                  setSelectedCompanyEvaluation(null);
                }}
                className="px-6 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-lg font-medium transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supervisor Evaluation Details Modal - COMSATS Theme */}
      {showSupervisorModal && selectedSupervisorEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#003366] to-[#00509E] p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Supervisor Evaluation Details
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedSupervisorEvaluation.interneeName || selectedSupervisorEvaluation.studentName || 'Student'} • 
                    Submitted on {new Date(selectedSupervisorEvaluation.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSupervisorModal(false);
                  setSelectedSupervisorEvaluation(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Student Information Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#003366] rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Student Name</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedSupervisorEvaluation.interneeName || selectedSupervisorEvaluation.studentName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Registration</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedSupervisorEvaluation.interneeRegistration || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Position</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedSupervisorEvaluation.position || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Internship Period Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#00509E] rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Internship Period</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedSupervisorEvaluation.internshipDuration || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-sm text-gray-600">Start Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedSupervisorEvaluation.internshipStartDate || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">End Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedSupervisorEvaluation.internshipEndDate || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Scores */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#003366] rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Assessment Scores</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: 'Platform Activity', key: 'platformActivity' },
                    { label: 'Completion of Internship', key: 'completionOfInternship' },
                    { label: 'Earnings Achieved', key: 'earningsAchieved' },
                    { label: 'Skill Development', key: 'skillDevelopment' },
                    { label: 'Client Rating', key: 'clientRating' },
                    { label: 'Professionalism', key: 'professionalism' }
                  ].map(({ label, key }) => {
                    const score = selectedSupervisorEvaluation[key] || 0;
                    const colorClass = score >= 8 ? 'bg-green-100 border-green-300 text-green-700' : 
                                      score >= 6 ? 'bg-blue-100 border-blue-300 text-blue-700' : 
                                      'bg-orange-100 border-orange-300 text-orange-700';
                    return (
                      <div key={key} className="bg-white p-3 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${colorClass}`}>
                            {score}/10
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overall Performance Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#00509E] rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Overall Performance</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-3xl font-bold text-[#003366] mb-2">
                      {selectedSupervisorEvaluation.totalMarks || 'N/A'}
                    </div>
                    <p className="text-sm text-gray-600">Total Score (out of 60)</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-3xl font-bold text-[#00509E] mb-2">
                      {selectedSupervisorEvaluation.grade || 'N/A'}
                    </div>
                    <p className="text-sm text-gray-600">Grade</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => handleDownloadPDF(selectedSupervisorEvaluation)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#00509E] hover:to-[#003366] text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => {
                  setShowSupervisorModal(false);
                  setSelectedSupervisorEvaluation(null);
                }}
                className="px-6 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-lg font-medium transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationsTab;
import { useState, useEffect } from 'react';
import { Search, User, Calendar, Building, Save, FileText, Download, Eye, Plus, List, Award, Hash, Mail, Clock, Star, Filter, ChevronDown, SlidersHorizontal, X, TrendingUp, CheckCircle } from 'lucide-react';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import { toast } from 'react-hot-toast';
import './InterneeEvaluationTab.css';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

// Helper function to get auth token
const getAuthToken = () => {
  try {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.token) return user.token;
    }
  } catch (error) {
    // If parsing fails fall back to token in localStorage
    console.error('Error parsing user from localStorage:', error);
  }

  return localStorage.getItem('token');
};

const InterneeEvaluationTab = () => {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'submitted'
  const [interns, setInterns] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submittedEvaluations, setSubmittedEvaluations] = useState([]);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  
  // Filter states for submitted evaluations
  const [showFilters, setShowFilters] = useState(false);
  const [evalSearchTerm, setEvalSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Evaluation criteria with marks
  const [evaluation, setEvaluation] = useState({
    punctualityAndAttendance: '',
    abilityToLinkTheoryToPractice: '',
    demonstratedCriticalThinking: '',
    technicalKnowledge: '',
    creativityConceptualAbility: '',
    abilityToAdaptToVarietyOfTasks: '',
    timeManagementDeadlineCompliance: '',
    behavedInProfessionalManner: '',
    effectivelyPerformedAssignments: '',
    oralWrittenCommunicationSkills: '',
    supervisorComments: ''
  });

  // Evaluation criteria labels
  const criteriaLabels = {
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

  // Mark values and labels
  const markOptions = [
    { value: '4', label: 'Excellent (4)' },
    { value: '3', label: 'Very Good (3)' },
    { value: '2', label: 'Satisfactory (2)' },
    { value: '1', label: 'Unsatisfactory (1)' }
  ];

  // Fetch interns assigned to this company
  const fetchInterns = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/applications/company/accepted`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInterns(data.data || []);
      } else {
        toast.error('Failed to fetch interns');
      }
    } catch (error) {
      console.error('Error fetching interns:', error);
      toast.error('Failed to fetch interns');
    } finally {
      setLoading(false);
    }
  };

  // Fetch submitted evaluations
  const fetchSubmittedEvaluations = async () => {
    try {
      setLoadingEvaluations(true);
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/internee-evaluations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Fetched submitted evaluations:', data.data);
        setSubmittedEvaluations(data.data || []);
      } else {
        toast.error('Failed to fetch submitted evaluations');
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      toast.error('Failed to fetch submitted evaluations');
    } finally {
      setLoadingEvaluations(false);
    }
  };

  useEffect(() => {
    fetchInterns();
    fetchSubmittedEvaluations();
  }, []);

  // Re-filter interns when submitted evaluations change
  useEffect(() => {
    // This effect will trigger re-filtering when submittedEvaluations changes
    // The filteredInterns will automatically update due to the dependency on submittedEvaluations
  }, [submittedEvaluations]);

  // Filter submitted evaluations
  const getFilteredEvaluations = () => {
    let filtered = [...submittedEvaluations];
    
    // Search filter
    if (evalSearchTerm.trim()) {
      const searchLower = evalSearchTerm.toLowerCase();
      filtered = filtered.filter(evaluation => 
        evaluation.internName?.toLowerCase().includes(searchLower) ||
        evaluation.internEmail?.toLowerCase().includes(searchLower)
      );
    }
    
    // Grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(evaluation => {
        const grade = evaluation.grade || calculateGrade(evaluation.evaluation?.totalMarks || 0);
        return grade === gradeFilter;
      });
    }
    
    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    } else if (sortBy === 'highest-score') {
      filtered.sort((a, b) => (b.evaluation?.totalMarks || 0) - (a.evaluation?.totalMarks || 0));
    } else if (sortBy === 'lowest-score') {
      filtered.sort((a, b) => (a.evaluation?.totalMarks || 0) - (b.evaluation?.totalMarks || 0));
    } else if (sortBy === 'name-az') {
      filtered.sort((a, b) => (a.internName || '').localeCompare(b.internName || ''));
    }
    
    return filtered;
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (evalSearchTerm.trim()) count++;
    if (gradeFilter !== 'all') count++;
    if (sortBy !== 'newest') count++;
    return count;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setEvalSearchTerm('');
    setGradeFilter('all');
    setSortBy('newest');
  };

  // Get grade accent color for cards
  const getGradeAccent = (grade) => {
    switch (grade) {
      case 'A+': return 'border-l-[6px] border-l-green-600 border-2 border-green-200';
      case 'A': return 'border-l-[6px] border-l-green-500 border-2 border-green-100';
      case 'B': return 'border-l-[6px] border-l-[#00509E] border-2 border-blue-100';
      case 'C': return 'border-l-[6px] border-l-yellow-500 border-2 border-yellow-100';
      case 'D': return 'border-l-[6px] border-l-orange-500 border-2 border-orange-100';
      case 'F': return 'border-l-[6px] border-l-red-500 border-2 border-red-100';
      default: return 'border-l-[6px] border-l-gray-400 border-2 border-gray-200';
    }
  };

  // Filter interns based on search term and exclude those who already have evaluations
  const filteredInterns = interns.filter(intern => {
    // Check if search term matches
    const matchesSearch = intern.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if this intern already has an evaluation submitted
    const hasEvaluation = submittedEvaluations.some(evaluation => {
      // Check multiple possible ID matches since the data structure might vary
      const matchesInternId = evaluation.internId === intern.studentId || 
                             evaluation.internId?._id === intern.studentId;
      const matchesApplicationId = evaluation.applicationId === intern._id || 
                                  evaluation.applicationId?._id === intern._id;
      const matchesInternName = evaluation.internName === intern.studentName;
      const matchesInternEmail = evaluation.internEmail === intern.studentEmail;
      
      return matchesInternId || matchesApplicationId || matchesInternName || matchesInternEmail;
    });
    
    // Only include interns that match search and don't have evaluations
    return matchesSearch && !hasEvaluation;
  });

  // Debug logging for filtering
  console.log('📊 Filtering Debug:', {
    totalInterns: interns.length,
    totalEvaluations: submittedEvaluations.length,
    filteredInterns: filteredInterns.length,
    searchTerm,
    sampleIntern: interns[0],
    sampleEvaluation: submittedEvaluations[0]
  });

  // Handle intern selection
  const handleInternSelection = (intern) => {
    setSelectedIntern(intern);
    // Reset evaluation form
    setEvaluation({
      punctualityAndAttendance: '',
      abilityToLinkTheoryToPractice: '',
      demonstratedCriticalThinking: '',
      technicalKnowledge: '',
      creativityConceptualAbility: '',
      abilityToAdaptToVarietyOfTasks: '',
      timeManagementDeadlineCompliance: '',
      behavedInProfessionalManner: '',
      effectivelyPerformedAssignments: '',
      oralWrittenCommunicationSkills: '',
      supervisorComments: ''
    });
  };

  // Handle evaluation change
  const handleEvaluationChange = (criteria, value) => {
    setEvaluation(prev => ({
      ...prev,
      [criteria]: value
    }));
  };

  // Calculate total marks
  const calculateTotalMarks = () => {
    const criteriaKeys = Object.keys(criteriaLabels);
    const totalMarks = criteriaKeys.reduce((sum, key) => {
      const mark = parseInt(evaluation[key]) || 0;
      return sum + mark;
    }, 0);
    return totalMarks;
  };

  // Handle form submission
  const handleSubmitEvaluation = async () => {
    if (!selectedIntern) {
      toast.error('Please select an intern first');
      return;
    }

    // Validate that all criteria are filled
    const criteriaKeys = Object.keys(criteriaLabels);
    const missingCriteria = criteriaKeys.filter(key => !evaluation[key]);
    
    if (missingCriteria.length > 0) {
      toast.error('Please fill all evaluation criteria');
      return;
    }

    try {
      setSaving(true);
      const token = getAuthToken();
      
      const evaluationData = {
        internId: selectedIntern.studentId,
        applicationId: selectedIntern._id,
        evaluation: {
          ...evaluation,
          totalMarks: calculateTotalMarks(),
          maxMarks: 40
        }
      };

      const response = await fetch(`${API_BASE_URL}/internee-evaluations/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(evaluationData)
      });

      if (response.ok) {
        toast.success('Evaluation submitted successfully!');
        // Refresh both the submitted evaluations list and interns list
        fetchSubmittedEvaluations();
        fetchInterns(); // This will refresh the available interns list
        // Reset form
        setSelectedIntern(null);
        setEvaluation({
          punctualityAndAttendance: '',
          abilityToLinkTheoryToPractice: '',
          demonstratedCriticalThinking: '',
          technicalKnowledge: '',
          creativityConceptualAbility: '',
          abilityToAdaptToVarietyOfTasks: '',
          timeManagementDeadlineCompliance: '',
          behavedInProfessionalManner: '',
          effectivelyPerformedAssignments: '',
          oralWrittenCommunicationSkills: '',
          supervisorComments: ''
        });
        // Switch to submitted evaluations tab
        setActiveTab('submitted');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit evaluation');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast.error('Failed to submit evaluation');
    } finally {
      setSaving(false);
    }
  };

  // Handle viewing evaluation details
  const handleViewEvaluation = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowEvaluationModal(true);
  };

  // Enhanced PDF generation function for company evaluations (SAME AS SUPERVISOR DASHBOARD)
  const generateEnhancedPDF = (evaluation) => {
    try {
      console.log('📄 Generating enhanced PDF for evaluation:', evaluation._id);
      console.log('📊 Evaluation data:', evaluation);
      
      // Check if jsPDF is available, if not load it dynamically
      if (typeof window !== 'undefined' && window.jspdf) {
        generateCompanyEvaluationPDF(evaluation);
      } else {
        // Dynamically load jsPDF if not available - force fresh load
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js?v=' + Date.now();
        script.onload = () => {
          console.log('✅ jsPDF loaded successfully');
          setTimeout(() => {
            generateCompanyEvaluationPDF(evaluation);
          }, 100);
        };
        script.onerror = () => {
          console.error('❌ Failed to load jsPDF');
          toast.error('Failed to load PDF generator');
        };
        document.head.appendChild(script);
      }
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Generate comprehensive PDF content for company evaluation (EXACT COPY FROM SUPERVISOR DASHBOARD)
  const generateCompanyEvaluationPDF = (evaluation) => {
    console.log('🔄 Starting PDF generation with data:', evaluation);
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    console.log('📄 PDF document created successfully');
    
    // Page dimensions and margins
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margins = { top: 15, bottom: 15, left: 15, right: 15 };
    const contentWidth = pageWidth - margins.left - margins.right;
    
    // Add decorative border to the page
    const addPageBorder = () => {
      // Outer border - COMSATS blue
      doc.setDrawColor(0, 51, 102); // COMSATS Blue
      doc.setLineWidth(1.5);
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

      // Inner border - thin gray
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Corner decorations - COMSATS blue accents
      const cornerSize = 10;
      doc.setDrawColor(0, 80, 158); // COMSATS Light Blue
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
      doc.setTextColor(0, 51, 102); // COMSATS Blue
      doc.text('COMPANY EVALUATION REPORT', pageWidth / 2, yPos, { align: 'center' });

      yPos += 15;

      // Subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 80, 158); // COMSATS Light Blue
      doc.text('EMPLOYER ASSESSMENT OF INTERN PERFORMANCE', pageWidth / 2, yPos, { align: 'center' });

      yPos += 15;

      // Decorative line
      const lineWidth = contentWidth * 0.5;
      const lineX = (pageWidth - lineWidth) / 2;
      doc.setDrawColor(0, 80, 158); // COMSATS Light Blue
      doc.setLineWidth(1);
      doc.line(lineX, yPos, lineX + lineWidth, yPos);

      yPos += 15;

      // Document info
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Evaluation ID: ${evaluation._id?.slice(-8).toUpperCase() || 'COMP-' + Math.random().toString(36).substr(2, 9).toUpperCase()}`, margins.left, yPos);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margins.right, yPos, { align: 'right' });

      return yPos + 10;
    };
    
    // Add information section with clean layout
    const addSection = (title, data, yPos) => {
      // Section header
      doc.setFillColor(0, 51, 102); // COMSATS Blue
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
      doc.setTextColor(0, 51, 102); // COMSATS Blue
      doc.text('COMPANY EVALUATION CRITERIA', margins.left, yPos);

      yPos += 8;

      // Table header
      doc.setFillColor(0, 51, 102); // COMSATS Blue
      doc.rect(margins.left, yPos, contentWidth, 8, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Criteria', margins.left + 3, yPos + 5.5);
      doc.text('Score', margins.left + 110, yPos + 5.5);
      doc.text('Rating', margins.left + 130, yPos + 5.5);

      yPos += 8;

      // Company evaluation criteria mapping
      const criteriaLabels = {
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

      Object.entries(criteriaLabels).forEach((criteriaEntry, index) => {
        const [key, label] = criteriaEntry;
        const score = evaluation.evaluation?.[key] ? parseInt(evaluation.evaluation[key]) : 3;
        
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margins.left, yPos, contentWidth, 7, 'F');
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        
        // Ensure criteria text fits within column width
        const maxCriteriaWidth = 100;
        doc.text(label, margins.left + 3, yPos + 4, { maxWidth: maxCriteriaWidth });
        doc.text(`${score}/4`, margins.left + 110, yPos + 4);

        // Rating with color (company scale is 1-4)
        let rating = 'Poor';
        let ratingColor = [239, 68, 68];
        if (score >= 3.5) {
          rating = 'Excellent';
          ratingColor = [0, 51, 102]; // COMSATS Blue
        } else if (score >= 3) {
          rating = 'Good';
          ratingColor = [0, 80, 158]; // COMSATS Light Blue
        } else if (score >= 2.5) {
          rating = 'Fair';
          ratingColor = [0, 80, 158]; // COMSATS Light Blue
        } else if (score >= 2) {
          rating = 'Below Avg';
          ratingColor = [100, 116, 139]; // Gray Blue
        }

        doc.setTextColor(...ratingColor);
        doc.text(rating, margins.left + 130, yPos + 4);

        yPos += 7;
      });

      // Add supervisor comments section if available
      if (evaluation.evaluation?.supervisorComments) {
        yPos += 8;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 51, 102); // COMSATS Blue
        doc.text('SUPERVISOR COMMENTS:', margins.left, yPos);
        
        yPos += 8;
        
        // Calculate proper comments box height based on content
        const comments = evaluation.evaluation.supervisorComments || 'No additional comments provided.';
        const commentLines = doc.splitTextToSize(comments, contentWidth - 8);
        const commentsHeight = Math.max(15, (commentLines.length * 4) + 6);
        
        // Comments box with dynamic height
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(margins.left, yPos, contentWidth, commentsHeight);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        
        // Render comment lines with proper spacing
        doc.text(commentLines, margins.left + 4, yPos + 5);
        
        yPos += commentsHeight + 5;
      }

      return yPos + 8;
    };
    
    // Add overall assessment box for company evaluation
    const addCompanyOverallAssessment = (yPos) => {
      console.log('📊 Adding Overall Assessment section at yPos:', yPos);
      console.log('📈 Evaluation data for assessment:', evaluation.evaluation);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 51, 102); // COMSATS Blue
      doc.text('OVERALL COMPANY ASSESSMENT', margins.left, yPos);

      yPos += 12;

      // Assessment box with proper height
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margins.left, yPos, contentWidth, 40);

      // Total score (company evaluations typically out of 40)
      const totalScore = evaluation.evaluation?.totalMarks || 35;
      const maxScore = 40;
      
      console.log('📊 Total Score:', totalScore, 'Max Score:', maxScore);
      
      // Left column - Scores
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text(`Total Score: ${totalScore}/${maxScore}`, margins.left + 5, yPos + 10);

      // Performance rating with better visibility
      const percentage = Math.round((totalScore / maxScore) * 100);
      let performanceLevel = 'Needs Improvement';
      let levelColor = [239, 68, 68]; // Red
      
      if (percentage >= 90) {
        performanceLevel = 'Outstanding';
        levelColor = [0, 51, 102]; // COMSATS Blue
      } else if (percentage >= 80) {
        performanceLevel = 'Excellent';
        levelColor = [0, 80, 158]; // COMSATS Light Blue
      } else if (percentage >= 70) {
        performanceLevel = 'Good';
        levelColor = [0, 80, 158]; // COMSATS Light Blue
      } else if (percentage >= 60) {
        performanceLevel = 'Satisfactory';
        levelColor = [0, 80, 158]; // COMSATS Light Blue
      }

      // Make rating text more prominent
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...levelColor);
      doc.text(`Rating: ${performanceLevel}`, margins.left + 5, yPos + 22);

      // Percentage with darker color for better visibility
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60); // Darker gray
      doc.text(`Performance: ${percentage}%`, margins.left + 5, yPos + 32);
      
      // Right column - Recommendation with proper spacing
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 51, 102); // COMSATS Blue
      doc.text('Recommendation:', margins.left + 90, yPos + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60); // Darker text for better visibility
      const recommendation = 'Amazing Student Performance Overall';
      // Split text to prevent overlap
      const recLines = doc.splitTextToSize(recommendation, contentWidth - 95);
      doc.text(recLines, margins.left + 90, yPos + 20);

      return yPos + 45;
    };
    
    // Add signature section
    const addSignatures = (yPos) => {
      // Check if we need a new page with more conservative margin
      if (yPos > 200) {
        doc.addPage();
        addPageBorder();
        yPos = 40;
      }

      yPos += 10; // Add some space before signatures

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 51, 102); // COMSATS Blue
      doc.text('SIGNATURES & APPROVAL', margins.left, yPos);

      yPos += 20;

      // Signature lines with better spacing
      const leftX = margins.left + 15;
      const rightX = margins.left + 105;
      const lineWidth = 70;

      // Ensure lines don't go beyond margins
      const maxLineEnd = pageWidth - margins.right - 5;
      const adjustedLineWidth = Math.min(lineWidth, maxLineEnd - rightX);

      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.line(leftX, yPos, leftX + lineWidth, yPos);
      doc.line(rightX, yPos, rightX + adjustedLineWidth, yPos);

      yPos += 8;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Company Supervisor Signature', leftX, yPos);
      doc.text('HR Department Approval', rightX, yPos);

      return yPos + 15;
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

    console.log('📋 Building PDF sections...');

    // Student and company information
    const evaluationData = [
      { label: 'Student Name:', value: evaluation.internName || 'Abdullah Student' },
      { label: 'Student Email:', value: evaluation.internEmail || 'abdullahjav634@gmail.com' },
      { label: 'Company Name:', value: 'Tech Pro' },
      { label: 'Position/Role:', value: 'Java' },
      { label: 'Department:', value: 'IT Department' },
      { label: 'Supervisor:', value: 'Company Supervisor' },
      { label: 'Evaluation Period:', value: '3 months' },
      { label: 'Evaluation Date:', value: new Date(evaluation.submittedAt).toLocaleDateString('en-GB') }
    ];

    console.log('📝 Student info section...');
    yPos = addSection('STUDENT & COMPANY INFORMATION', evaluationData, yPos);
    
    console.log('📊 Performance table section...');
    yPos = addCompanyPerformanceTable(yPos);
    
    console.log('🎯 Overall assessment section...');
    yPos = addCompanyOverallAssessment(yPos);
    
    console.log('✍️ Signatures section...');
    addSignatures(yPos);
    addFooter();
    
    // Save the PDF
    const fileName = `Company_Evaluation_${evaluation.internName?.replace(/\s+/g, '_') || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    console.log('💾 Saving PDF with filename:', fileName);
    doc.save(fileName);
    
    toast.success('📄 Company Evaluation PDF downloaded successfully!');
    console.log('✅ PDF generated and downloaded:', fileName);
  };

  // Enhanced PDF download handler
  const handleDownloadPDF = async (evaluationId) => {
    try {
      console.log('🔍 Searching for evaluation with ID:', evaluationId);
      console.log('📋 Available evaluations:', submittedEvaluations);
      
      // Find the evaluation in our submitted evaluations
      const evaluation = submittedEvaluations.find(evalItem => evalItem._id === evaluationId);
      
      if (!evaluation) {
        console.error('❌ Evaluation not found for ID:', evaluationId);
        toast.error('Evaluation not found');
        return;
      }

      console.log('✅ Found evaluation:', evaluation);

      // Clear any existing jsPDF to force fresh load
      if (window.jspdf) {
        delete window.jspdf;
        console.log('🔄 Cleared existing jsPDF instance');
      }

      // Generate enhanced PDF directly
      generateEnhancedPDF(evaluation);
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  // Calculate grade from total marks
  const calculateGrade = (totalMarks, maxMarks = 40) => {
    const percentage = (totalMarks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* COMSATS Header Section */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-4 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1 text-white">
                  Internee Evaluation
                </h1>
                <p className="text-blue-100 text-sm">
                  Evaluate intern performance and manage assessments
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <User className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Available</span>
              </div>
              <p className="text-white font-bold text-sm">
                {interns.length} Interns
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <FileText className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Submitted</span>
              </div>
              <p className="text-white font-bold text-sm">
                {submittedEvaluations.length} Evaluations
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Clock className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Pending</span>
              </div>
              <p className="text-white font-bold text-sm">
                {Math.max(0, interns.length - submittedEvaluations.length)} Reviews
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Star className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Avg Score</span>
              </div>
              <p className="text-white font-bold text-sm">
                {submittedEvaluations.length > 0 
                  ? Math.round(submittedEvaluations.reduce((sum, evaluation) => sum + (evaluation.evaluation?.totalMarks || 0), 0) / submittedEvaluations.length)
                  : 0}/40
              </p>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full transform -translate-x-8 translate-y-8"></div>
        </div>
      </div>

      {/* COMSATS Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('new')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'new'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Evaluation</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('submitted')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'submitted'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <List className="w-4 h-4" />
                <span>Submitted Evaluations ({submittedEvaluations.length})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'new' && (
        <>
          {/* Enhanced Intern Selection Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-[#003366] to-[#00509E] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Select Intern to Evaluate</h3>
                    <p className="text-blue-100 text-xs mt-0.5">Choose an intern from the list below to begin evaluation</p>
                  </div>
                </div>
                <div className="bg-white/20 px-3 py-1.5 rounded-lg">
                  <span className="text-white text-sm font-medium">{filteredInterns.length} Available</span>
                </div>
              </div>
            </div>
            
            <div className="p-5">
              {/* Search Bar */}
              <div className="relative mb-5">
                <input
                  type="text"
                  placeholder="Search by intern name, email, or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition-all duration-200 text-sm bg-gray-50 focus:bg-white"
                />
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-3 border-[#003366] border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600 text-sm font-medium">Loading available interns...</p>
                </div>
              ) : filteredInterns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                  {filteredInterns.map((intern) => (
                    <div
                      key={intern._id}
                      onClick={() => handleInternSelection(intern)}
                      className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 group ${
                        selectedIntern?._id === intern._id
                          ? 'bg-gradient-to-br from-[#003366] to-[#00509E] text-white shadow-lg scale-[1.02]'
                          : 'bg-white border-2 border-gray-200 hover:border-[#003366] hover:shadow-md'
                      }`}
                    >
                      {/* Selection Indicator */}
                      {selectedIntern?._id === intern._id && (
                        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-sm">
                          <CheckCircle className="w-4 h-4 text-[#003366]" />
                        </div>
                      )}
                      
                      {/* Avatar & Name */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                          selectedIntern?._id === intern._id
                            ? 'bg-white text-[#003366]'
                            : 'bg-gradient-to-br from-[#003366] to-[#00509E] text-white'
                        }`}>
                          {intern.studentName?.charAt(0).toUpperCase() || 'N'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-sm truncate ${
                            selectedIntern?._id === intern._id ? 'text-white' : 'text-gray-900'
                          }`}>
                            {intern.studentName}
                          </h4>
                          <p className={`text-xs truncate ${
                            selectedIntern?._id === intern._id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {intern.jobTitle || 'Intern'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Info Grid */}
                      <div className="space-y-2">
                        <div className={`flex items-center text-xs ${
                          selectedIntern?._id === intern._id ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          <Hash className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                          <span className="truncate">{intern.rollNumber || 'N/A'}</span>
                        </div>
                        <div className={`flex items-center text-xs ${
                          selectedIntern?._id === intern._id ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          <Mail className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                          <span className="truncate">{intern.studentEmail}</span>
                        </div>
                        <div className={`flex items-center text-xs ${
                          selectedIntern?._id === intern._id ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          <Building className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                          <span className="truncate">{intern.studentDepartment || 'Department'}</span>
                        </div>
                      </div>
                      
                      {/* Select Button */}
                      <div className={`mt-4 text-center py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedIntern?._id === intern._id
                          ? 'bg-white/20 text-white'
                          : 'bg-[#003366]/5 text-[#003366] group-hover:bg-[#003366] group-hover:text-white'
                      }`}>
                        {selectedIntern?._id === intern._id ? '✓ Selected' : 'Click to Select'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-700 mb-2">No Interns Available</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    {searchTerm 
                      ? `No interns found matching "${searchTerm}". Try a different search term.` 
                      : 'All interns have been evaluated or no hired interns are available.'
                    }
                  </p>
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="mt-4 px-4 py-2 bg-[#003366] text-white rounded-lg text-sm font-medium hover:bg-[#002244] transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
              
              {/* Selected Intern Summary */}
              {selectedIntern && (
                <div className="mt-5 pt-5 border-t border-gray-200">
                  <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 rounded-full p-2">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-800">Ready to Evaluate</p>
                        <p className="text-xs text-green-600">
                          {selectedIntern.studentName} • {selectedIntern.studentEmail}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedIntern(null)}
                      className="text-green-600 hover:text-green-800 text-xs font-medium underline"
                    >
                      Change Selection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COMSATS Evaluation Form */}
          {selectedIntern && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-lg text-white">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Evaluation Form</h3>
                </div>

                {/* COMSATS Intern Details Header */}
                <div className="bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5 border border-[#003366]/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2 rounded-lg text-white font-bold text-sm">
                      {selectedIntern.studentName?.charAt(0).toUpperCase()}
                    </div>
                    <h4 className="text-base font-bold text-gray-900">Intern Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Full Name</p>
                      <p className="text-gray-900 font-medium text-sm">{selectedIntern.studentName}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Email Address</p>
                      <p className="text-gray-900 font-medium text-sm break-words">{selectedIntern.studentEmail}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Roll Number</p>
                      <p className="text-gray-900 font-medium text-sm">{selectedIntern.studentRollNumber || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Position</p>
                      <p className="text-gray-900 font-medium text-sm">{selectedIntern.jobTitle}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Department</p>
                      <p className="text-gray-900 font-medium text-sm">{selectedIntern.studentDepartment}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Semester</p>
                      <p className="text-gray-900 font-medium text-sm">{selectedIntern.studentSemester || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* COMSATS Instructions */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-1 rounded-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-800 text-sm">Evaluation Instructions</h4>
                      <p className="text-amber-700 text-xs mt-1">
                        Mark only one option per criterion. Each criterion carries a maximum of 4 marks.
                      </p>
                    </div>
                  </div>
                </div>

                {/* COMSATS Evaluation Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#003366] to-[#00509E] text-white">
                          <th className="px-3 py-3 text-left font-medium text-sm border-b">Assessment Criteria</th>
                          <th className="px-3 py-3 text-center font-medium text-sm border-b border-l border-white/20">
                            <div>Excellent</div>
                            <div className="text-xs opacity-80">(4 marks)</div>
                          </th>
                          <th className="px-3 py-3 text-center font-medium text-sm border-b border-l border-white/20">
                            <div>Very Good</div>
                            <div className="text-xs opacity-80">(3 marks)</div>
                          </th>
                          <th className="px-3 py-3 text-center font-medium text-sm border-b border-l border-white/20">
                            <div>Satisfactory</div>
                            <div className="text-xs opacity-80">(2 marks)</div>
                          </th>
                          <th className="px-3 py-3 text-center font-medium text-sm border-b border-l border-white/20">
                            <div>Unsatisfactory</div>
                            <div className="text-xs opacity-80">(1 mark)</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(criteriaLabels).map(([key, label], index) => (
                          <tr key={key} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                            <td className="px-3 py-3 font-medium text-gray-900 border-b text-sm">{label}</td>
                            {markOptions.map((option) => (
                              <td key={option.value} className="px-3 py-3 text-center border-b border-l">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={key}
                                    value={option.value}
                                    checked={evaluation[key] === option.value}
                                    onChange={(e) => handleEvaluationChange(key, e.target.value)}
                                    className="w-4 h-4 text-[#003366] focus:ring-[#003366] cursor-pointer"
                                  />
                                </label>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* COMSATS Total Marks */}
                <div className="mt-4 bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5 border border-[#003366]/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2 rounded-lg">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">Total Score</h4>
                        <p className="text-xs text-gray-600">Overall performance evaluation</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#003366]">{calculateTotalMarks()}</div>
                      <div className="text-xs text-gray-600">out of 40 marks</div>
                      <div className="text-sm font-bold text-[#00509E] mt-1">
                        Grade: {calculateGrade(calculateTotalMarks())}
                      </div>
                    </div>
                  </div>
                </div>

                {/* COMSATS Supervisor Comments */}
                <div className="mt-4 bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5 border border-[#003366]/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2 rounded-lg">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-base font-bold text-gray-900">Supervisor Comments</h4>
                  </div>
                  <textarea
                    value={evaluation.supervisorComments}
                    onChange={(e) => handleEvaluationChange('supervisorComments', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition-all duration-200 bg-white text-sm"
                    placeholder="Enter detailed comments about the intern's performance, achievements, areas for improvement, and overall feedback..."
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Provide constructive feedback to help the intern improve their skills and performance.
                  </p>
                </div>

                {/* COMSATS Submit Button */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedIntern(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitEvaluation}
                    disabled={saving || calculateTotalMarks() === 0}
                    className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white px-6 py-2 font-medium rounded-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Submit Evaluation
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* COMSATS Instructions Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5 border border-[#003366]/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#003366] text-base mb-2">How to Use This Evaluation Form</h4>
                  <div className="space-y-2 text-[#003366]">
                    <div className="flex items-start space-x-2">
                      <div className="bg-[#003366]/20 rounded-full p-1 mt-0.5">
                        <span className="block w-1.5 h-1.5 bg-[#003366] rounded-full"></span>
                      </div>
                      <p className="text-xs"><strong>Step 1:</strong> Select an intern from the available list above</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="bg-[#003366]/20 rounded-full p-1 mt-0.5">
                        <span className="block w-1.5 h-1.5 bg-[#003366] rounded-full"></span>
                      </div>
                      <p className="text-xs"><strong>Step 2:</strong> Evaluate each criterion by selecting the appropriate rating (1-4 marks)</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="bg-[#003366]/20 rounded-full p-1 mt-0.5">
                        <span className="block w-1.5 h-1.5 bg-[#003366] rounded-full"></span>
                      </div>
                      <p className="text-xs"><strong>Step 3:</strong> Add detailed comments about the intern's performance</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="bg-[#003366]/20 rounded-full p-1 mt-0.5">
                        <span className="block w-1.5 h-1.5 bg-[#003366] rounded-full"></span>
                      </div>
                      <p className="text-xs"><strong>Step 4:</strong> Submit the evaluation to finalize the assessment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* COMSATS Submitted Evaluations Tab */}
      {activeTab === 'submitted' && (
        <div className="space-y-4">
          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4">
              {/* Search Row */}
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by student name or email..."
                    value={evalSearchTerm}
                    onChange={(e) => setEvalSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition-all duration-200 text-sm"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    showFilters || getActiveFiltersCount() > 0
                      ? 'bg-[#003366] text-white border-[#003366]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#003366] hover:text-[#003366]'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filter</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-white text-[#003366] px-1.5 py-0.5 rounded-full text-xs font-bold">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Expandable Filter Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Grade Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Grade</label>
                      <select
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                      >
                        <option value="all">All Grades</option>
                        <option value="A+">A+ (90%+)</option>
                        <option value="A">A (80-89%)</option>
                        <option value="B">B (70-79%)</option>
                        <option value="C">C (60-69%)</option>
                        <option value="D">D (50-59%)</option>
                        <option value="F">F (Below 50%)</option>
                      </select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest-score">Highest Score</option>
                        <option value="lowest-score">Lowest Score</option>
                        <option value="name-az">Name (A-Z)</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <button
                        onClick={clearAllFilters}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Filters Summary */}
              {getActiveFiltersCount() > 0 && !showFilters && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">Active filters:</span>
                  {evalSearchTerm.trim() && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#003366]/10 text-[#003366] rounded-full text-xs font-medium">
                      <Search className="w-3 h-3" />
                      "{evalSearchTerm}"
                      <button onClick={() => setEvalSearchTerm('')} className="hover:bg-[#003366]/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {gradeFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#003366]/10 text-[#003366] rounded-full text-xs font-medium">
                      <Award className="w-3 h-3" />
                      Grade: {gradeFilter}
                      <button onClick={() => setGradeFilter('all')} className="hover:bg-[#003366]/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {sortBy !== 'newest' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#003366]/10 text-[#003366] rounded-full text-xs font-medium">
                      <TrendingUp className="w-3 h-3" />
                      Sort: {sortBy}
                      <button onClick={() => setSortBy('newest')} className="hover:bg-[#003366]/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Evaluations List */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-[#003366] to-[#00509E] rounded-lg text-white">
                    <List className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Submitted Evaluations</h3>
                    <p className="text-gray-600 text-xs">Review and manage completed intern assessments</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-[#003366]/10 to-[#00509E]/10 text-[#003366] rounded-lg text-sm font-medium border border-[#003366]/20">
                  {getFilteredEvaluations().length} of {submittedEvaluations.length} Evaluation{submittedEvaluations.length !== 1 ? 's' : ''}
                </div>
              </div>

              {loadingEvaluations ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#003366] border-t-transparent mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Loading submitted evaluations...</p>
                </div>
              ) : submittedEvaluations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-br from-[#003366]/10 to-[#00509E]/10 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-[#003366]" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">No Evaluations Submitted</h3>
                  <p className="text-gray-500 mb-4 text-sm">You haven't submitted any intern evaluations yet.</p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Evaluation
                  </button>
                </div>
              ) : getFilteredEvaluations().length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-500 mb-4 text-sm">Try adjusting your search or filter criteria.</p>
                  <button
                    onClick={clearAllFilters}
                    className="border border-[#003366] text-[#003366] hover:bg-[#003366]/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredEvaluations().map((evaluation, index) => {
                    const grade = evaluation.grade || calculateGrade(evaluation.evaluation?.totalMarks || 0);
                    
                    return (
                      <div 
                        key={evaluation._id} 
                        className={`bg-white rounded-lg p-4 hover:shadow-md transition-all duration-200 ${getGradeAccent(grade)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#003366] to-[#00509E] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {(evaluation.internName || 'S')?.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {/* Header Row */}
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    {evaluation.internName || 'Student Name'}
                                  </h4>
                                  <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {evaluation.internEmail || 'student@example.com'}
                                  </p>
                                </div>
                                
                                {/* Score & Grade */}
                                <div className="flex items-center space-x-3">
                                  <div className="text-center">
                                    <p className="text-lg font-bold text-[#003366]">
                                      {evaluation.evaluation?.totalMarks || 0}<span className="text-xs text-gray-500 font-normal">/40</span>
                                    </p>
                                    <p className="text-[10px] text-gray-500">Score</p>
                                  </div>
                                  <div className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                                    grade === 'A+' || grade === 'A' ? 'bg-green-500 text-white' :
                                    grade === 'B' ? 'bg-[#00509E] text-white' :
                                    grade === 'C' ? 'bg-yellow-500 text-white' :
                                    grade === 'D' ? 'bg-orange-500 text-white' :
                                    'bg-red-500 text-white'
                                  }`}>
                                    {grade}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Info Row */}
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className="flex items-center text-xs text-gray-600">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(evaluation.submittedAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center text-xs text-gray-600">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(evaluation.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="flex items-center text-xs text-gray-600">
                                  <Star className="w-3 h-3 mr-1" />
                                  {(() => {
                                    const percentage = ((evaluation.evaluation?.totalMarks || 0) / 40) * 100;
                                    if (percentage >= 90) return 'Excellent';
                                    if (percentage >= 80) return 'Very Good';
                                    if (percentage >= 70) return 'Good';
                                    if (percentage >= 60) return 'Satisfactory';
                                    return 'Needs Improvement';
                                  })()}
                                </span>
                              </div>

                              {/* Comments Preview */}
                              {evaluation.evaluation?.supervisorComments && (
                                <div className="bg-gray-50 rounded-lg p-2 mb-3 border border-gray-100">
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    <span className="font-medium text-gray-700">Comments: </span>
                                    {evaluation.evaluation.supervisorComments}
                                  </p>
                                </div>
                              )}

                              {/* Footer Row */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-medium">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Completed
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                                    ID: {evaluation._id?.slice(-6)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleViewEvaluation(evaluation)}
                                    className="bg-[#003366] hover:bg-[#002244] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center"
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleDownloadPDF(evaluation._id)}
                                    className="bg-[#00509E] hover:bg-[#003366] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center"
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    PDF
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMSATS Evaluation Details Modal */}
      {showEvaluationModal && selectedEvaluation && (
        <Modal 
          isOpen={showEvaluationModal} 
          onClose={() => setShowEvaluationModal(false)}
          title="Evaluation Details"
          className="max-w-4xl"
          headerClassName="bg-gradient-to-r from-[#003366] to-[#00509E] text-white"
        >
          <div className="space-y-4">
            {/* COMSATS Student Info */}
            <div className="bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5 border border-[#003366]/20 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2 rounded-lg text-white font-bold text-sm">
                  {selectedEvaluation.internName?.charAt(0).toUpperCase()}
                </div>
                <h4 className="text-base font-bold text-gray-900">Student Information</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-2 rounded-lg">
                  <span className="text-xs font-medium text-gray-600">Name</span>
                  <p className="font-medium text-gray-900 text-sm">{selectedEvaluation.internName}</p>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <span className="text-xs font-medium text-gray-600">Email</span>
                  <p className="font-medium text-gray-900 text-sm break-words">{selectedEvaluation.internEmail}</p>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <span className="text-xs font-medium text-gray-600">Total Score</span>
                  <p className="font-bold text-[#003366] text-base">{selectedEvaluation.evaluation?.totalMarks}/40</p>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <span className="text-xs font-medium text-gray-600">Grade</span>
                  <div className={`px-2 py-1 rounded-lg text-sm font-bold inline-block ${
                    (() => {
                      const grade = selectedEvaluation.grade || calculateGrade(selectedEvaluation.evaluation?.totalMarks || 0);
                      if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-800';
                      if (grade === 'B' || grade === 'C') return 'bg-yellow-100 text-yellow-800';
                      return 'bg-red-100 text-red-800';
                    })()
                  }`}>
                    {selectedEvaluation.grade || calculateGrade(selectedEvaluation.evaluation?.totalMarks || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* COMSATS Evaluation Scores */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#003366] to-[#00509E] px-4 py-3 border-b">
                <h4 className="text-base font-bold text-white">Assessment Breakdown</h4>
              </div>
              <div className="p-4 space-y-2">
                {Object.entries(criteriaLabels).map(([key, label]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700 font-medium text-sm">{label}</span>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <span className="font-bold text-[#003366] text-sm">
                          {selectedEvaluation.evaluation?.[key] || 0}
                        </span>
                        <span className="text-gray-500 text-xs">/4</span>
                      </div>
                      <div className="w-12 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-[#003366] to-[#00509E] h-1.5 rounded-full"
                          style={{ width: `${((selectedEvaluation.evaluation?.[key] || 0) / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COMSATS Comments */}
            {selectedEvaluation.evaluation?.supervisorComments && (
              <div className="bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5 border border-[#003366]/20 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2 rounded-lg">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900">Supervisor Comments</h4>
                </div>
                <div className="bg-white rounded-lg p-3 border border-[#003366]/20">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedEvaluation.evaluation.supervisorComments}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowEvaluationModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadPDF(selectedEvaluation._id)}
                className="bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#003366]/90 hover:to-[#00509E]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InterneeEvaluationTab;
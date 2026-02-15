import { useState, useEffect } from 'react';
import { Eye, Download, Send, Trophy, User, Building, FileText, Award, Hash, Mail, Clock, X, Filter, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { makeAuthenticatedRequest } from '../../../services/api';
import Badge from '../../../ui/Badge';
import Button from '../../../ui/Button';
import Card from '../../../ui/Card';

// Enhanced Final Evaluation Tab - Fixed imports 2025-10-06
const FinalEvaluationTab = () => {
  const [students, setStudents] = useState([]);
  const [readyToSend, setReadyToSend] = useState([]);
  const [resultsSent, setResultsSent] = useState([]);
  const [activeTab, setActiveTab] = useState('ready'); // 'ready' or 'sent'
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('marks-desc'); // marks-desc, marks-asc, name-asc, name-desc, grade

  // Fetch final evaluations from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await makeAuthenticatedRequest('/api/final-evaluation/supervisor/final-evaluations', {
          method: 'GET'
        });

        if (data.success) {
          console.log('📊 Received evaluation data:', data.data);
          
          // Handle new API structure with separate sections
          const readyToSendData = data.data.readyToSend || [];
          const resultsSentData = data.data.resultsSent || [];
          
          // Transform readyToSend data
          const transformedReadyToSend = readyToSendData.map(item => ({
            id: item.id,
            name: item.studentInfo.name,
            rollNumber: item.studentInfo.rollNumber || 'N/A',
            department: item.studentInfo.department,
            email: item.studentInfo.email,
            companyName: item.internshipInfo.companyName,
            supervisorName: item.internshipInfo.supervisorName,
            supervisorMarks: item.evaluation.supervisorMarks,
            companyMarks: item.evaluation.companyMarks,
            totalMarks: item.evaluation.totalMarks,
            grade: item.evaluation.grade,
            finalSubmitted: item.evaluation.finalSubmitted || false,
            position: item.internshipInfo.position,
            supervisorEmail: 'supervisor@comsats.edu.pk',
            internshipDuration: item.internshipInfo.duration,
            startDate: item.internshipInfo.startDate,
            endDate: item.internshipInfo.endDate,
            status: 'ready', // Mark as ready to send
            hasSupervisionEval: item.hasSupervisionEval,
            hasCompanyEval: item.hasCompanyEval
          }));

          // Transform resultsSent data
          const transformedResultsSent = resultsSentData.map(item => ({
            id: item.id,
            name: item.studentInfo.name,
            rollNumber: item.studentInfo.rollNumber || 'N/A',
            department: item.studentInfo.department,
            email: item.studentInfo.email,
            companyName: item.internshipInfo.companyName,
            supervisorName: item.internshipInfo.supervisorName,
            supervisorMarks: item.evaluation.supervisorMarks,
            companyMarks: item.evaluation.companyMarks,
            totalMarks: item.evaluation.totalMarks,
            grade: item.evaluation.grade,
            finalSubmitted: item.evaluation.finalSubmitted || true,
            position: item.internshipInfo.position,
            supervisorEmail: 'supervisor@comsats.edu.pk',
            internshipDuration: item.internshipInfo.duration,
            startDate: item.internshipInfo.startDate,
            endDate: item.internshipInfo.endDate,
            status: 'sent', // Mark as already sent
            sentAt: item.evaluation.submittedDate,
            hasSupervisionEval: item.hasSupervisionEval,
            hasCompanyEval: item.hasCompanyEval
          }));

          // Set the state for both sections
          setReadyToSend(transformedReadyToSend);
          setResultsSent(transformedResultsSent);
          
          // For backward compatibility, combine both arrays for the main students state
          const allStudents = [...transformedReadyToSend, ...transformedResultsSent];
          setStudents(allStudents);
          
          console.log(`✅ Loaded ${transformedReadyToSend.length} ready to send, ${transformedResultsSent.length} results sent`);
        } else {
          console.error('API returned unsuccessful response:', data.message);
          // No fallback to mock data - just empty array
          setStudents([]);
          setReadyToSend([]);
          setResultsSent([]);
        }
      } catch (error) {
        console.error('Error fetching students data:', error);
        // No fallback to mock data - just empty array
        setStudents([]);
        setReadyToSend([]);
        setResultsSent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'bg-green-100 text-green-800 border-green-200',
      'A': 'bg-green-100 text-green-800 border-green-200',
      'A-': 'bg-green-100 text-green-700 border-green-200',
      'B+': 'bg-blue-100 text-blue-800 border-blue-200',
      'B': 'bg-blue-100 text-blue-800 border-blue-200',
      'B-': 'bg-blue-100 text-blue-700 border-blue-200',
      'C+': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'C-': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'D': 'bg-orange-100 text-orange-800 border-orange-200',
      'F': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleSendFinalResult = async (student) => {
    try {
      const data = await makeAuthenticatedRequest(`/api/final-evaluation/supervisor/send-result/${student.id}`, {
        method: 'POST'
      });

      if (data.success) {
        // Update local state to mark as submitted and move from readyToSend to resultsSent
        const updatedStudent = { ...student, finalSubmitted: true, status: 'sent', sentAt: new Date() };
        
        // Remove from readyToSend and add to resultsSent
        setReadyToSend(prev => prev.filter(s => s.id !== student.id));
        setResultsSent(prev => [...prev, updatedStudent]);
        
        // Update main students array
        setStudents(prev => prev.map(s => 
          s.id === student.id ? updatedStudent : s
        ));

        // Update selected student if it's the current one
        if (selectedStudent && selectedStudent.id === student.id) {
          setSelectedStudent(updatedStudent);
        }

        alert('Final result sent to student successfully!');
      } else {
        alert(data.message || 'Failed to send final result');
      }
    } catch (error) {
      console.error('Error sending final result:', error);
      alert('Failed to send final result. Please try again.');
    }
  };

  // Filter and Sort Function
  const getFilteredStudents = (studentList) => {
    let filtered = [...studentList];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.name?.toLowerCase().includes(searchLower) ||
        student.rollNumber?.toLowerCase().includes(searchLower) ||
        student.department?.toLowerCase().includes(searchLower) ||
        student.companyName?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'marks-desc':
          return (b.totalMarks || 0) - (a.totalMarks || 0);
        case 'marks-asc':
          return (a.totalMarks || 0) - (b.totalMarks || 0);
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'grade': {
          const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'F': 5 };
          return (gradeOrder[a.grade] || 999) - (gradeOrder[b.grade] || 999);
        }
        default:
          return 0;
      }
    });

    return filtered;
  };

  const generatePDF = (student) => {
    const doc = new jsPDF();
    
    // PDF Configuration
    const margins = {
      left: 15,
      right: 15,
      top: 15,
      bottom: 15
    };
    const contentWidth = 180;
    
    // Add decorative page border
    const addPageBorder = () => {
      doc.setDrawColor(91, 33, 182); // Purple color
      doc.setLineWidth(2);
      doc.rect(5, 5, 200, 287);
      
      doc.setDrawColor(147, 51, 234); // Lighter purple
      doc.setLineWidth(0.5);
      doc.rect(7, 7, 196, 283);
    };
    
    // Add header with professional styling
    const addHeader = () => {
      // Main header background - COMSATS Blue
      doc.setFillColor(0, 51, 102); // #003366
      doc.rect(0, 0, 210, 35, 'F');
      
      // Decorative accent - COMSATS Light Blue
      doc.setFillColor(0, 80, 158); // #00509E
      doc.rect(0, 30, 210, 5, 'F');
      
      // University name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('COMSATS UNIVERSITY ISLAMABAD', 105, 15, { align: 'center' });
      
      // Department and document title
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Department of Computer Science', 105, 22, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text('FINAL INTERNSHIP EVALUATION REPORT', 105, 28, { align: 'center' });
    };
    
    // Add student information section
    const addStudentInfo = (yPos) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 51, 102); // COMSATS Blue
      doc.text('STUDENT & INTERNSHIP INFORMATION', margins.left, yPos);
      
      yPos += 8;
      
      // Information box with border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margins.left, yPos, contentWidth, 45);
      
      // Fill with light background
      doc.setFillColor(248, 250, 252);
      doc.rect(margins.left, yPos, contentWidth, 45, 'F');
      
      yPos += 6;
      
      // Student information in two columns
      const leftCol = margins.left + 5;
      const rightCol = margins.left + 95;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      
      // Left column
      doc.text('Student Name:', leftCol, yPos);
      doc.text('Roll Number:', leftCol, yPos + 7);
      doc.text('Department:', leftCol, yPos + 14);
      doc.text('Email:', leftCol, yPos + 21);
      doc.text('Duration:', leftCol, yPos + 28);
      
      // Right column
      doc.text('Company:', rightCol, yPos);
      doc.text('Position:', rightCol, yPos + 7);
      doc.text('Supervisor:', rightCol, yPos + 14);
      doc.text('Start Date:', rightCol, yPos + 21);
      doc.text('End Date:', rightCol, yPos + 28);
      
      // Values
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70, 70, 70);
      
      // Left column values
      doc.text(student.name || 'N/A', leftCol + 30, yPos);
      doc.text(student.rollNumber || 'N/A', leftCol + 30, yPos + 7);
      doc.text(student.department || 'N/A', leftCol + 30, yPos + 14);
      doc.text(student.email || 'N/A', leftCol + 30, yPos + 21, { maxWidth: 55 });
      doc.text(student.internshipDuration || 'N/A', leftCol + 30, yPos + 28);
      
      // Right column values
      doc.text(student.companyName || 'N/A', rightCol + 25, yPos, { maxWidth: 55 });
      doc.text(student.position || 'N/A', rightCol + 25, yPos + 7, { maxWidth: 55 });
      doc.text(student.supervisorName || 'N/A', rightCol + 25, yPos + 14, { maxWidth: 55 });
      doc.text(student.startDate ? new Date(student.startDate).toLocaleDateString() : 'N/A', rightCol + 25, yPos + 21);
      doc.text(student.endDate ? new Date(student.endDate).toLocaleDateString() : 'N/A', rightCol + 25, yPos + 28);
      
      return yPos + 45;
    };
    
    // Add evaluation breakdown section
    const addEvaluationBreakdown = (yPos) => {
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 51, 102); // COMSATS Blue
      doc.text('EVALUATION BREAKDOWN', margins.left, yPos);
      
      yPos += 10;
      
      // Table header - COMSATS Blue
      doc.setFillColor(0, 51, 102);
      doc.rect(margins.left, yPos, contentWidth, 10, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Assessment Component', margins.left + 5, yPos + 6.5);
      doc.text('Marks Obtained', margins.left + 80, yPos + 6.5);
      doc.text('Total Marks', margins.left + 120, yPos + 6.5);
      doc.text('Percentage', margins.left + 155, yPos + 6.5);
      
      yPos += 10;
      
      // Supervisor evaluation row
      doc.setFillColor(248, 250, 252);
      doc.rect(margins.left, yPos, contentWidth, 12, 'F');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text('Supervisor Evaluation (60%)', margins.left + 5, yPos + 8);
      doc.text(`${student.supervisorMarks}`, margins.left + 90, yPos + 8);
      doc.text('60', margins.left + 130, yPos + 8);
      doc.text(`${((student.supervisorMarks / 60) * 100).toFixed(1)}%`, margins.left + 160, yPos + 8);
      
      yPos += 12;
      
      // Company evaluation row
      doc.setFillColor(255, 255, 255);
      doc.rect(margins.left, yPos, contentWidth, 12, 'F');
      
      doc.text('Company Evaluation (40%)', margins.left + 5, yPos + 8);
      doc.text(`${student.companyMarks}`, margins.left + 90, yPos + 8);
      doc.text('40', margins.left + 130, yPos + 8);
      doc.text(`${((student.companyMarks / 40) * 100).toFixed(1)}%`, margins.left + 160, yPos + 8);
      
      yPos += 12;
      
      // Border around table
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margins.left, yPos - 34, contentWidth, 34);
      
      return yPos;
    };
    
    // Add final results section
    const addFinalResults = (yPos) => {
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(91, 33, 182);
      doc.text('FINAL ASSESSMENT RESULTS', margins.left, yPos);
      
      yPos += 10;
      
      // Results box
      doc.setFillColor(16, 185, 129); // Green background
      doc.rect(margins.left, yPos, contentWidth, 25, 'F');
      
      // Decorative border
      doc.setDrawColor(6, 95, 70);
      doc.setLineWidth(1);
      doc.rect(margins.left, yPos, contentWidth, 25);
      
      // Total marks
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`TOTAL SCORE: ${student.totalMarks}/100`, margins.left + 10, yPos + 10);
      
      // Grade with special styling
      doc.setFontSize(16);
      doc.text(`GRADE: ${student.grade}`, margins.left + 10, yPos + 20);
      
      // Performance percentage
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Performance: ${student.totalMarks}%`, margins.left + 120, yPos + 15);
      
      return yPos + 30;
    };
    
    // Add performance assessment
    const addPerformanceAssessment = (yPos) => {
      yPos += 10; // Increased spacing
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(91, 33, 182);
      doc.text('PERFORMANCE ANALYSIS', margins.left, yPos);
      
      yPos += 12; // Increased spacing
      
      // Performance categories
      const totalScore = student.totalMarks;
      let performanceLevel = 'Needs Improvement';
      let levelColor = [239, 68, 68];
      let recommendation = 'Additional support and improvement required';
      
      if (totalScore >= 90) {
        performanceLevel = 'Outstanding Performance';
        levelColor = [34, 197, 94];
        recommendation = 'Exceptional performance. Highly recommended for advanced opportunities.';
      } else if (totalScore >= 80) {
        performanceLevel = 'Excellent Performance';
        levelColor = [34, 197, 94];
        recommendation = 'Excellent work quality. Ready for challenging assignments.';
      } else if (totalScore >= 70) {
        performanceLevel = 'Good Performance';
        levelColor = [34, 197, 94];
        recommendation = 'Good overall performance. Shows strong potential.';
      } else if (totalScore >= 60) {
        performanceLevel = 'Satisfactory Performance';
        levelColor = [245, 158, 11];
        recommendation = 'Meets expectations. Areas for improvement identified.';
      }
      
      // Performance box
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margins.left, yPos, contentWidth, 25); // Increased height
      
      doc.setFillColor(248, 250, 252);
      doc.rect(margins.left, yPos, contentWidth, 25, 'F'); // Increased height
      
      // Performance level
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...levelColor);
      doc.text(`Assessment: ${performanceLevel}`, margins.left + 5, yPos + 10);
      
      // Recommendation
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70, 70, 70);
      doc.text('Recommendation:', margins.left + 5, yPos + 18);
      doc.text(recommendation, margins.left + 35, yPos + 18, { maxWidth: 140 });
      
      return yPos + 30; // Increased spacing
    };
    
    // Add signature section
    const addSignatures = (yPos) => {
      // Check if we need a new page
      if (yPos > 220) {
        doc.addPage();
        addPageBorder();
        yPos = 40;
      }
      
      yPos += 20; // Increased spacing
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 51, 102); // COMSATS Blue
      doc.text('VERIFICATION & APPROVAL', margins.left, yPos);
      
      yPos += 15;
      
      // Signature lines
      const leftX = margins.left + 10;
      const rightX = margins.left + 100;
      const lineWidth = 60;
      
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.line(leftX, yPos, leftX + lineWidth, yPos);
      doc.line(rightX, yPos, rightX + lineWidth, yPos);
      
      yPos += 8; // Increased spacing
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Academic Supervisor', leftX + 15, yPos);
      doc.text('Department Coordinator', rightX + 10, yPos);
      
      yPos += 12; // Increased spacing
      doc.text('Date: _______________', leftX + 15, yPos);
      doc.text('Date: _______________', rightX + 10, yPos);
      
      return yPos + 10; // Added extra spacing
    };
    
    // Add footer
    const addFooter = (lastContentY) => {
      // Ensure footer is placed after content with proper spacing
      const footerY = Math.max(lastContentY + 15, 270); // Minimum position but respect content
      
      // Decorative footer line - COMSATS Blue
      doc.setDrawColor(0, 51, 102);
      doc.setLineWidth(0.5);
      doc.line(margins.left, footerY, 195, footerY);
      
      // Footer text with proper spacing
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      
      // Left side - Generation timestamp
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margins.left, footerY + 8);
      
      // Right side - University name (fixed positioning)
      doc.text('COMSATS University Islamabad - Internship Management Portal', 195, footerY + 8, { align: 'right' });
    };
    
    // Generate the PDF
    addPageBorder();
    addHeader();
    
    let yPos = 50;
    yPos = addStudentInfo(yPos);
    yPos = addEvaluationBreakdown(yPos);
    yPos = addFinalResults(yPos);
    yPos = addPerformanceAssessment(yPos);
    yPos = addSignatures(yPos);
    
    addFooter(yPos);
    
    // Save the PDF with enhanced filename
    doc.save(`Final-Evaluation-Report-${student.rollNumber}-${student.name.replace(/\s+/g, '-')}.pdf`);
  };

  // Handle sending result (wrapper for existing function)
  const handleSendResult = (student) => {
    handleSendFinalResult(student);
  };

  // Handle downloading result for already sent evaluations
  const handleDownloadResult = (student) => {
    generatePDF(student);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* COMSATS Header Section */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-6 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-lg shadow-sm">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 text-white">
                  Final Evaluation Results
                </h1>
                <p className="text-blue-100 text-sm">
                  Review and send final internship evaluation results to students
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{students.length}</div>
              <div className="text-xs text-blue-100">Total Students</div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{readyToSend.length}</div>
              <div className="text-xs text-blue-100">Ready to Send</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{resultsSent.length}</div>
              <div className="text-xs text-blue-100">Results Sent</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">
                {students.length > 0 ? 
                  (students.reduce((sum, s) => sum + s.totalMarks, 0) / students.length).toFixed(1) 
                  : '0'}%
              </div>
              <div className="text-xs text-blue-100">Average Score</div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-2 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('ready')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'ready'
                  ? 'bg-white text-[#003366] shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Ready to Send ({readyToSend.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'sent'
                  ? 'bg-white text-[#003366] shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Results Sent ({resultsSent.length})
            </button>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-12 translate-y-12"></div>
        </div>
      </div>

      {/* Tab Content */}
      {((activeTab === 'ready' && readyToSend.length === 0) || (activeTab === 'sent' && resultsSent.length === 0)) ? (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'ready' ? 'No Evaluations Ready to Send' : 'No Results Sent Yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'ready' 
                ? "You don't have any students with completed evaluations ready to send yet."
                : "You haven't sent any final results to students yet."
              }
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>
                  {activeTab === 'ready' ? 'Students will appear here when:' : 'Results will appear here when:'}
                </strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Students are assigned to your supervision</li>
                <li>• Both supervisor and company evaluations are completed</li>
                <li>• {activeTab === 'ready' ? 'Final results are ready to be sent' : 'You send final results to students'}</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#003366] rounded-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#003366] mb-1">
                    {activeTab === 'ready' ? 'Ready to Send Final Results' : 'Sent Final Results'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {activeTab === 'ready' 
                      ? `${readyToSend.length} evaluation${readyToSend.length !== 1 ? 's' : ''} ready to send to students`
                      : `${resultsSent.length} result${resultsSent.length !== 1 ? 's' : ''} already sent to students`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    showFilters
                      ? 'bg-[#003366] text-white shadow-md'
                      : 'bg-[#003366] text-white border-2 border-[#003366] hover:bg-[#00509E] shadow-sm'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    showFilters ? 'rotate-180' : ''
                  }`} />
                </button>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#003366]">
                    {getFilteredStudents(activeTab === 'ready' ? readyToSend : resultsSent).length}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(searchTerm || sortBy !== 'marks-desc') ? (
                      <span>Filtered / <span className="text-gray-400">{activeTab === 'ready' ? readyToSend.length : resultsSent.length} Total</span></span>
                    ) : (
                      'Students'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search Box */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Search className="w-4 h-4 inline mr-1" />
                      Search Students
                    </label>
                    <input
                      type="text"
                      placeholder="Search by name, roll number, department, or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <SlidersHorizontal className="w-4 h-4 inline mr-1" />
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white"
                    >
                      <option value="marks-desc">Marks: Highest First</option>
                      <option value="marks-asc">Marks: Lowest First</option>
                      <option value="grade">Grade: A to F</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(searchTerm || sortBy !== 'marks-desc') && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSortBy('marks-desc');
                      }}
                      className="text-sm text-[#003366] hover:text-[#00509E] font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Student Cards */}
          <div className="grid gap-6">
            {getFilteredStudents(activeTab === 'ready' ? readyToSend : resultsSent).map((student, index) => (
              <Card 
                key={student.id} 
                className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white rounded-xl overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-1 bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366]"></div>
                <div className="p-6">
                  {/* Header Section */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-3 rounded-xl shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h3>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              <Hash className="w-3 h-3 mr-1" />
                              {student.rollNumber}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Building className="w-3 h-3 mr-1" />
                              {student.department}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      {student.status === 'sent' ? (
                        <div className="text-right">
                          <Badge variant="success" className="bg-green-100 text-green-800 border border-green-300">
                            <Send className="w-3 h-3 mr-1" />
                            Result Sent
                          </Badge>
                          {student.sentAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(student.sentAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Badge variant="warning" className="bg-yellow-100 text-yellow-800 border border-yellow-300">
                          <Clock className="w-3 h-3 mr-1" />
                          Ready to Send
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Company Info Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-[#003366] mb-2 flex items-center">
                      <Building className="w-4 h-4 mr-2" />
                      Company Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium text-gray-900">{student.companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="font-medium text-gray-900">{student.position}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => handleViewDetails(student)}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2 border-[#00509E] text-[#00509E] hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </Button>
                    
                    {student.status === 'ready' && (
                      <Button
                        onClick={() => handleSendResult(student)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2 bg-green-600 border-green-600 text-white hover:bg-green-700"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send Result</span>
                      </Button>
                    )}
                    
                    {student.status === 'sent' && (
                      <Button
                        onClick={() => handleDownloadResult(student)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2 border-gray-400 text-gray-700 hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => generatePDF(student)}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2 bg-[#003366] border-[#003366] text-white hover:bg-[#002244]"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Generate PDF</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-lg shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#003366] to-[#00509E] text-white px-6 py-5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Final Evaluation Details</h3>
                    <p className="text-blue-100 text-sm mt-0.5">Complete assessment overview</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Student & Internship Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Information */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-[#003366] p-2 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-[#003366]">Student Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name</span>
                      <p className="text-gray-900 font-medium">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Roll Number</span>
                      <p className="text-gray-900 font-medium">{selectedStudent.rollNumber}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Department</span>
                      <p className="text-gray-900">{selectedStudent.department}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Email</span>
                      <p className="text-gray-900 text-sm break-all">{selectedStudent.email}</p>
                    </div>
                  </div>
                </div>

                {/* Internship Information */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-[#00509E] p-2 rounded-lg">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-[#003366]">Internship Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Company</span>
                      <p className="text-gray-900 font-medium">{selectedStudent.companyName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Position</span>
                      <p className="text-gray-900">{selectedStudent.position}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Supervisor</span>
                      <p className="text-gray-900">{selectedStudent.supervisorName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Duration</span>
                      <p className="text-gray-900">{selectedStudent.internshipDuration}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluation Breakdown */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-br from-[#003366] to-[#00509E] p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#003366]">Evaluation Breakdown</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supervisor Marks */}
                  <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-[#003366]">Supervisor Evaluation</span>
                      <span className="text-xs font-medium text-white bg-[#00509E] px-2 py-1 rounded-full">60% weight</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-bold text-[#003366]">{selectedStudent.supervisorMarks}<span className="text-xl text-gray-500">/60</span></span>
                      <span className="text-sm font-medium text-[#00509E] bg-blue-100 px-2 py-1 rounded">
                        {((selectedStudent.supervisorMarks / 60) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Company Marks */}
                  <div className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-cyan-900">Company Evaluation</span>
                      <span className="text-xs font-medium text-white bg-cyan-600 px-2 py-1 rounded-full">40% weight</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-bold text-cyan-900">{selectedStudent.companyMarks}<span className="text-xl text-gray-500">/40</span></span>
                      <span className="text-sm font-medium text-cyan-700 bg-cyan-100 px-2 py-1 rounded">
                        {((selectedStudent.companyMarks / 40) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final Total */}
                <div className="mt-4 bg-gradient-to-br from-[#003366] to-[#00509E] text-white rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Final Total Score</p>
                      <div className="flex items-end space-x-2">
                        <span className="text-4xl font-bold">{selectedStudent.totalMarks}</span>
                        <span className="text-2xl text-blue-200 pb-1">/100</span>
                      </div>
                      <p className="text-blue-100 text-sm mt-1">({selectedStudent.totalMarks}%)</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm text-blue-100 mb-1">Grade Achieved</p>
                        <span className={`inline-block px-4 py-2 rounded-lg text-lg font-bold border-2 ${getGradeColor(selectedStudent.grade)}`}>
                          {selectedStudent.grade}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-[#003366]">
                  <strong>Note:</strong> Final evaluation is calculated based on Supervisor Evaluation (60% weightage) and Company Evaluation (40% weightage).
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 px-6 py-4 rounded-b-lg">
              <div className="flex flex-col sm:flex-row gap-3">
                {!selectedStudent.finalSubmitted && (
                  <button
                    onClick={() => handleSendFinalResult(selectedStudent)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-md"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Final Result to Student
                  </button>
                )}
                
                <button
                  onClick={() => generatePDF(selectedStudent)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-[#003366] hover:bg-[#002244] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalEvaluationTab;

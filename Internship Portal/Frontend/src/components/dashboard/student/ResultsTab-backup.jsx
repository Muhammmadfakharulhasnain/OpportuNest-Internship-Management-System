import { useState, useEffect } from 'react';
import { Trophy, Download, User, Building, FileText, Star } from 'lucide-react';
import { jsPDF } from 'jspdf';
import Card from '../../../ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { makeAuthenticatedRequest } from '../../../services/api';

const ResultsTab = () => {
  const { currentUser } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch student result from API
  useEffect(() => {
    const fetchStudentResult = async () => {
      try {
        setLoading(true);
        const data = await makeAuthenticatedRequest('/api/final-evaluation/student/result', {
          method: 'GET'
        });

        if (data.success && data.data) {
          setResult(data.data);
        } else {
          // No result available for this student
          setResult(null);
        }
      } catch (error) {
        console.error('Error fetching student result:', error);
        // Don't show mock data, just set result to null
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentResult();
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

  const generatePDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    
    // COMSATS Colors
    const colors = {
      primary: [0, 51, 102],      // COMSATS Navy #003366
      secondary: [0, 80, 158],    // COMSATS Blue #00509E
      accent: [220, 220, 220],    // Light Gray
      success: [34, 197, 94],     // Green
      warning: [251, 146, 60],    // Orange
      danger: [239, 68, 68],      // Red
      text: [55, 65, 81],         // Dark Gray
      lightBg: [248, 250, 252]    // Very Light Gray
    };

    // Enhanced Header with Logo Space and Professional Design
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, 210, 50, 'F');
    
    // University Logo Space (placeholder)
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 25, 15);
    doc.setTextColor(...colors.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CUI', 25, 28, { align: 'center' });
    
    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('COMSATS University Islamabad', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Department of Computer Science', 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FINAL INTERNSHIP EVALUATION REPORT', 105, 40, { align: 'center' });

    // Document Info Bar
    doc.setFillColor(...colors.lightBg);
    doc.rect(0, 50, 210, 12, 'F');
    
    doc.setTextColor(...colors.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Document ID: FIR-${result.studentInfo?.rollNumber || 'XXX'}-${new Date().getFullYear()}`, 15, 58);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 105, 58, { align: 'center' });
    doc.text(`Page 1 of 1`, 195, 58, { align: 'right' });

    // Decorative Border
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.rect(10, 70, 190, 200);

    // Student Information Section with Enhanced Design
    let yPos = 85;
    doc.setFillColor(...colors.secondary);
    doc.rect(15, yPos - 8, 180, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT INFORMATION', 20, yPos);

    yPos += 18;
    doc.setTextColor(...colors.text);
    doc.setFontSize(11);

    const studentInfo = [
      ['Student Name:', result.studentInfo?.name || 'N/A'],
      ['Registration No:', result.studentInfo?.rollNumber || 'N/A'],
      ['Department:', result.studentInfo?.department || 'Computer Science'],
      ['Email Address:', result.studentInfo?.email || 'N/A']
    ];

    studentInfo.forEach(([label, value]) => {
      // Create info boxes
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPos - 3, 170, 10, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(20, yPos - 3, 170, 10);
      
      doc.setFont('times', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text(label, 25, yPos + 3);
      
      doc.setFont('times', 'normal');
      doc.setTextColor(...colors.text);
      doc.text(String(value), 85, yPos + 3);
      
      yPos += 12;
    });

    // Internship Information Section
    yPos += 10;
    doc.setFillColor(...colors.secondary);
    doc.rect(15, yPos - 8, 180, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INTERNSHIP DETAILS', 20, yPos);

    yPos += 18;

    const internshipInfo = [
      ['Company Name:', result.internshipInfo?.companyName || 'N/A'],
      ['Position Title:', result.internshipInfo?.position || 'N/A'],
      ['Supervisor:', result.internshipInfo?.supervisorName || 'N/A'],
      ['Duration:', result.internshipInfo?.duration || '12 Weeks'],
      ['Start Date:', result.internshipInfo?.startDate ? new Date(result.internshipInfo.startDate).toLocaleDateString() : 'N/A'],
      ['End Date:', result.internshipInfo?.endDate ? new Date(result.internshipInfo.endDate).toLocaleDateString() : 'N/A']
    ];

    internshipInfo.forEach(([label, value]) => {
      // Create info boxes
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPos - 3, 170, 10, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(20, yPos - 3, 170, 10);
      
      doc.setFont('times', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text(label, 25, yPos + 3);
      
      doc.setFont('times', 'normal');
      doc.setTextColor(...colors.text);
      doc.text(String(value), 85, yPos + 3);
      
      yPos += 12;
    });

    // Evaluation Results Section with Professional Table
    yPos += 15;
    doc.setFillColor(...colors.secondary);
    doc.rect(15, yPos - 8, 180, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EVALUATION RESULTS', 20, yPos);

    yPos += 20;

    // Enhanced Results Table
    const tableHeaders = ['Assessment Component', 'Obtained', 'Total', 'Weightage', 'Score %'];
    const colWidths = [60, 25, 25, 25, 35];
    let xPos = 20;

    // Table Header
    doc.setFillColor(...colors.primary);
    doc.rect(20, yPos, 170, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPos + 2, yPos + 8);
      xPos += colWidths[i];
    });

    yPos += 12;

    // Supervisor Evaluation Row
    xPos = 20;
    doc.setFillColor(248, 250, 252);
    doc.rect(20, yPos, 170, 10, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(20, yPos, 170, 10);
    
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'normal');
    
    const supervisorData = [
      'Supervisor Evaluation',
      `${result.evaluation?.supervisorMarks || 0}`,
      '60',
      '60%',
      `${result.breakdown?.supervisorScore?.toFixed(1) || '0.0'}%`
    ];

    supervisorData.forEach((data, i) => {
      doc.text(data, xPos + 2, yPos + 7);
      // Draw vertical lines
      if (i < supervisorData.length - 1) {
        doc.line(xPos + colWidths[i], yPos, xPos + colWidths[i], yPos + 10);
      }
      xPos += colWidths[i];
    });

    yPos += 10;

    // Company Evaluation Row
    xPos = 20;
    doc.setFillColor(255, 255, 255);
    doc.rect(20, yPos, 170, 10, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(20, yPos, 170, 10);
    
    const companyData = [
      'Company Evaluation',
      `${result.evaluation?.companyMarks || 0}`,
      '40',
      '40%',
      `${result.breakdown?.companyScore?.toFixed(1) || '0.0'}%`
    ];

    companyData.forEach((data, i) => {
      doc.text(data, xPos + 2, yPos + 7);
      // Draw vertical lines
      if (i < companyData.length - 1) {
        doc.line(xPos + colWidths[i], yPos, xPos + colWidths[i], yPos + 10);
      }
      xPos += colWidths[i];
    });

    yPos += 15;

    // Final Result Box with Grade-based Colors
    const totalMarks = result.evaluation?.totalMarks || 0;
    const grade = result.evaluation?.grade || 'F';
    
    let gradeColor;
    if (['A+', 'A', 'A-'].includes(grade)) gradeColor = colors.success;
    else if (['B+', 'B', 'B-'].includes(grade)) gradeColor = colors.secondary;
    else if (['C+', 'C', 'C-'].includes(grade)) gradeColor = colors.warning;
    else gradeColor = colors.danger;

    doc.setFillColor(...gradeColor);
    doc.rect(20, yPos, 170, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FINAL RESULT', 25, yPos + 10);
    
    doc.setFontSize(14);
    doc.text(`Total Marks: ${totalMarks}/100`, 25, yPos + 20);
    doc.text(`Grade: ${grade}`, 140, yPos + 15);

    // Grade Description
    yPos += 35;
    doc.setTextColor(...colors.text);
    doc.setFontSize(10);
    doc.setFont('times', 'italic');
    doc.text('Assessment Methodology: Final evaluation comprises Supervisor Assessment (60%) and Company Assessment (40%)', 20, yPos);
    doc.text('based on performance metrics, technical skills, and professional competencies.', 20, yPos + 8);

    // Signature Section
    yPos += 25;
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.3);
    
    // Supervisor Signature
    doc.line(25, yPos + 15, 85, yPos + 15);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text('Supervisor Signature', 25, yPos + 20);
    doc.text('Date: ___________', 25, yPos + 28);

    // Department Seal
    doc.line(125, yPos + 15, 185, yPos + 15);
    doc.text('Department Seal', 125, yPos + 20);
    doc.text('Academic Office', 125, yPos + 28);

    // Professional Footer
    doc.setFillColor(...colors.primary);
    doc.rect(0, 275, 210, 22, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.text('COMSATS University Islamabad - Department of Computer Science', 105, 284, { align: 'center' });
    doc.text('Internship Program Office | Email: internships@comsats.edu.pk | Tel: +92-51-9049-6161', 105, 292, { align: 'center' });

    // Save the PDF
    doc.save(`Final-Internship-Results-${result.studentInfo?.rollNumber || 'Student'}-${new Date().getFullYear()}.pdf`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#003366] mx-auto mb-4"></div>
            <p className="text-[#00509E] font-medium">Loading your results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="p-4 bg-[#003366]/10 rounded-full w-20 h-20 mx-auto mb-6">
            <Trophy className="h-12 w-12 text-[#003366] mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-[#003366] mb-2">No Results Available</h3>
          <p className="text-[#00509E] font-medium mb-6">
            Your internship results haven&apos;t been published yet. Results will appear here once your supervisor submits your final evaluation.
          </p>
          <Card className="bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5 border border-[#003366]/20 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-sm font-bold text-[#003366] mb-3">
              What you need to complete:
            </p>
            <ul className="text-sm text-[#00509E] space-y-2 text-left">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#003366] rounded-full"></div>
                <span>Complete your internship period</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#003366] rounded-full"></div>
                <span>Submit all weekly reports</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#003366] rounded-full"></div>
                <span>Wait for supervisor and company evaluations</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Header Section - COMSATS Design */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-5 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Final Internship Results</h1>
                <p className="text-white/80 font-medium">Your comprehensive evaluation and performance summary</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{result ? '1' : '0'}</div>
              <div className="text-white/70 text-sm">Result Available</div>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#003366]/10 to-[#00509E]/10 opacity-50"></div>
        <div className="absolute -top-5 -right-5 w-20 h-20 bg-[#003366]/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-[#00509E]/20 rounded-full blur-lg"></div>
      </div>

      {/* Evaluation Cards - COMSATS Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Supervisor Evaluation */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5 px-6 py-4 border-b border-[#003366]/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#003366]/10 rounded-lg">
                <User className="h-5 w-5 text-[#003366]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#003366]">Supervisor Evaluation</h3>
                <p className="text-sm text-[#00509E] font-medium">60% weightage</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#003366] mb-2">
                {result.evaluation.supervisorMarks}/60
              </div>
              <div className="text-sm text-gray-600 font-medium">
                ({result.breakdown.supervisorScore.toFixed(1)}%)
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-[#003366] to-[#00509E] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${result.breakdown.supervisorScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Company Evaluation */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#00509E]/5 to-purple-600/5 px-6 py-4 border-b border-[#00509E]/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#00509E]/10 rounded-lg">
                <Building className="h-5 w-5 text-[#00509E]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#003366]">Company Evaluation</h3>
                <p className="text-sm text-[#00509E] font-medium">40% weightage</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00509E] mb-2">
                {result.evaluation.companyMarks}/40
              </div>
              <div className="text-sm text-gray-600 font-medium">
                ({result.breakdown.companyScore.toFixed(1)}%)
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-[#00509E] to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${result.breakdown.companyScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Final Result */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400/10 to-green-500/10 px-6 py-4 border-b border-yellow-400/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-400/20 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#003366]">Final Result</h3>
                <p className="text-sm text-green-600 font-medium">Combined score</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-3">
                {result.evaluation.totalMarks}/100
              </div>
              <div className="mb-4">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold border-2 ${getGradeColor(result.evaluation.grade)}`}>
                  Grade: {result.evaluation.grade}
                </span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${result.evaluation.totalMarks}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Information - COMSATS Style */}
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5 px-6 py-4 border-b border-[#003366]/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#003366]/10 rounded-lg">
              <FileText className="h-5 w-5 text-[#003366]" />
            </div>
            <h3 className="text-lg font-bold text-[#003366]">Detailed Information</h3>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Student Information */}
          <div>
            <h4 className="text-md font-bold text-[#003366] mb-4 flex items-center">
              <div className="p-2 bg-[#003366]/10 rounded-lg mr-3">
                <User className="h-4 w-4 text-[#003366]" />
              </div>
              Student Information
            </h4>
            <div className="grid grid-cols-2 gap-4 bg-gradient-to-r from-[#003366]/5 to-[#00509E]/5 p-4 rounded-lg border border-[#003366]/10">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <span className="text-xs font-medium text-[#003366] uppercase tracking-wide">Name</span>
                <p className="text-[#00509E] font-bold mt-1">{result.studentInfo.name}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <span className="text-xs font-medium text-[#003366] uppercase tracking-wide">Roll Number</span>
                <p className="text-[#00509E] font-bold mt-1">{result.studentInfo.rollNumber}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <span className="text-xs font-medium text-[#003366] uppercase tracking-wide">Department</span>
                <p className="text-[#00509E] font-bold mt-1">{result.studentInfo.department}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <span className="text-xs font-medium text-[#003366] uppercase tracking-wide">Email</span>
                <p className="text-[#00509E] font-bold mt-1">{result.studentInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Internship Information */}
          <div>
            <h4 className="text-md font-bold text-[#003366] mb-4 flex items-center">
              <div className="p-2 bg-[#00509E]/10 rounded-lg mr-3">
                <Building className="h-4 w-4 text-[#00509E]" />
              </div>
              Internship Information
            </h4>
            <div className="grid grid-cols-2 gap-4 bg-gradient-to-r from-[#00509E]/5 to-purple-600/5 p-4 rounded-lg border border-[#00509E]/10">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <span className="text-xs font-medium text-[#003366] uppercase tracking-wide">Company</span>
                <p className="text-[#00509E] font-bold mt-1">{result.internshipInfo.companyName}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <span className="text-xs font-medium text-[#003366] uppercase tracking-wide">Position</span>
                <p className="text-[#00509E] font-bold mt-1">{result.internshipInfo.position}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <span className="text-xs font-medium text-[#003366] uppercase tracking-wide">Supervisor</span>
                <p className="text-[#00509E] font-bold mt-1">{result.internshipInfo.supervisorName}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <span className="text-xs font-medium text-[#003366] uppercase tracking-wide">Duration</span>
                <p className="text-[#00509E] font-bold mt-1">{result.internshipInfo.duration}</p>
              </div>
            </div>
          </div>

          {/* Evaluation Details */}
          <div>
            <h4 className="text-md font-bold text-[#003366] mb-4 flex items-center">
              <div className="p-2 bg-yellow-400/20 rounded-lg mr-3">
                <FileText className="h-4 w-4 text-yellow-600" />
              </div>
              Evaluation Breakdown
            </h4>
            <div className="bg-gradient-to-r from-yellow-400/10 to-green-500/10 border border-yellow-400/20 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-[#003366]/20 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#003366]">Supervisor (60%)</span>
                    <span className="text-2xl font-bold text-[#00509E]">{result.evaluation.supervisorMarks}/60</span>
                  </div>
                  <div className="text-sm text-[#00509E] font-medium">
                    Score: {result.breakdown.supervisorScore.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-[#00509E]/20 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#003366]">Company (40%)</span>
                    <span className="text-2xl font-bold text-purple-600">{result.evaluation.companyMarks}/40</span>
                  </div>
                  <div className="text-sm text-purple-600 font-medium">
                    Score: {result.breakdown.companyScore.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-yellow-400/30">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#003366]">Final Total:</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-green-600">{result.evaluation.totalMarks}/100</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getGradeColor(result.evaluation.grade)}`}>
                      {result.evaluation.grade}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note - COMSATS Style */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-400/20 rounded-lg">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#003366]">
                  Important Note:
                </p>
                <p className="text-sm text-[#00509E] mt-1 font-medium">
                  Evaluation is based on Supervisor (60%) + Company (40%) assessments. 
                  Results submitted on {new Date(result.evaluation.submittedDate).toLocaleDateString()}.
                </p>
              </div>
            </div>
          </div>

          {/* Download Button - COMSATS Style */}
          <div className="flex justify-center pt-2">
            <button
              onClick={generatePDF}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-gradient-to-r from-[#003366] to-[#00509E] hover:from-[#00509E] hover:to-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Official Results Certificate
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResultsTab;

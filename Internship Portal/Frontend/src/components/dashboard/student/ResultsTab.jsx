import { useState, useEffect } from 'react';
import { Trophy, Download, User, Building, FileText, Star } from 'lucide-react';
import { jsPDF } from 'jspdf';
import Card from '../../../ui/Card';
import { makeAuthenticatedRequest } from '../../../services/api';

const ResultsTab = () => {
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
          // No result available for this studen
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
    console.log('🔥 GENERATE PDF FUNCTION CALLED - NEW VERSION!');
    
    if (!result) {
      alert('No result data available for PDF generation');
      console.error('❌ No result data available');
      return;
    }

    console.log('📊 Result data structure:', result);
    console.log('👤 Student info:', result.studentInfo);
    console.log('🏢 Internship info:', result.internshipInfo);
    console.log('📈 Evaluation info:', result.evaluation);

    try {
      console.log('🎯 Generating BRAND NEW PROFESSIONAL Results PDF - Version 3.0 - LATEST!');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      
      let yPos = 80;
      
      // Add a very distinctive title to confirm this is the NEW PDF
      console.log('🚀 Creating NEW enhanced professional PDF with COMSATS styling...');
      
      // ===== PROFESSIONAL COMSATS HEADER =====
      doc.setFillColor(0, 51, 102); // COMSATS Navy Blue
      doc.rect(0, 0, 595, 80, 'F');
      
      // University Logo Area
      doc.setFillColor(255, 255, 255);
      doc.circle(80, 40, 25, 'F');
      doc.setTextColor(0, 51, 102);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('CUI', 73, 45);
      
      // University Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('times', 'bold');
      doc.text('COMSATS UNIVERSITY ISLAMABAD', 297, 30, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('times', 'normal');
      doc.text('INTERNSHIP MANAGEMENT PORTAL', 297, 50, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text('Faculty of Computer Science', 297, 65, { align: 'center' });
      
      // ===== DOCUMENT TITLE =====
      yPos = 120;
      doc.setTextColor(0, 51, 102);
      doc.setFontSize(18);
      doc.setFont('times', 'bold');
      doc.text('FINAL INTERNSHIP EVALUATION RESULTS', 297, yPos, { align: 'center' });
      
      // Add NEW VERSION indicator
      doc.setFontSize(10);
      doc.setTextColor(220, 20, 60); // Crimson color
      doc.text('(Enhanced Professional Version)', 297, yPos + 20, { align: 'center' });
      
      // Decorative line
      doc.setDrawColor(0, 80, 158);
      doc.setLineWidth(2);
      doc.line(150, yPos + 10, 445, yPos + 10);
      
      // ===== STUDENT INFORMATION SECTION =====
      yPos = 170;
      doc.setFillColor(0, 51, 102);
      doc.rect(40, yPos, 515, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text('STUDENT INFORMATION', 50, yPos + 17);
      
      yPos += 35;
      const studentData = [
        ['Student Name:', result.studentInfo?.name || 'N/A'],
        ['Roll Number:', result.studentInfo?.rollNumber || 'N/A'],
        ['Department:', result.studentInfo?.department || 'Computer Science'],
        ['Email Address:', result.studentInfo?.email || 'N/A']
      ];
      
      studentData.forEach((item, index) => {
        const [label, value] = item;
        const rowY = yPos + (index * 25);
        
        // Alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(40, rowY - 5, 515, 20, 'F');
        }
        
        // Label
        doc.setTextColor(0, 51, 102);
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text(label, 50, rowY + 8);
        
        // Value
        doc.setTextColor(33, 37, 41);
        doc.setFont('times', 'normal');
        doc.text(String(value), 200, rowY + 8);
      });
      
      // ===== INTERNSHIP INFORMATION SECTION =====
      yPos += 130;
      doc.setFillColor(0, 80, 158);
      doc.rect(40, yPos, 515, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text('INTERNSHIP INFORMATION', 50, yPos + 17);
      
      yPos += 35;
      const internshipData = [
        ['Company/Organization:', result.internshipInfo?.companyName || 'N/A'],
        ['Position/Role:', result.internshipInfo?.position || 'N/A'],
        ['Supervisor:', result.internshipInfo?.supervisorName || 'N/A'],
        ['Duration:', result.internshipInfo?.duration || '3 months']
      ];
      
      internshipData.forEach((item, index) => {
        const [label, value] = item;
        const rowY = yPos + (index * 25);
        
        // Alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(40, rowY - 5, 515, 20, 'F');
        }
        
        // Label
        doc.setTextColor(0, 51, 102);
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text(label, 50, rowY + 8);
        
        // Value
        doc.setTextColor(33, 37, 41);
        doc.setFont('times', 'normal');
        doc.text(String(value), 200, rowY + 8);
      });
      
      // ===== EVALUATION BREAKDOWN =====
      yPos += 130;
      doc.setFillColor(255, 193, 7);
      doc.rect(40, yPos, 515, 25, 'F');
      doc.setTextColor(0, 51, 102);
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text('EVALUATION BREAKDOWN', 50, yPos + 17);
      
      yPos += 40;
      const cardWidth = 240;
      const cardHeight = 80;
      
      // Supervisor Card
      doc.setFillColor(248, 250, 252);
      doc.rect(50, yPos, cardWidth, cardHeight, 'F');
      doc.setDrawColor(0, 51, 102);
      doc.setLineWidth(1);
      doc.rect(50, yPos, cardWidth, cardHeight);
      
      // Supervisor header
      doc.setFillColor(0, 51, 102);
      doc.rect(50, yPos, cardWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.text('Supervisor Evaluation (60%)', 170, yPos + 17, { align: 'center' });
      
      // Supervisor score
      doc.setTextColor(0, 80, 158);
      doc.setFontSize(18);
      doc.setFont('times', 'bold');
      doc.text(`${result.evaluation?.supervisorMarks || 0}/60`, 170, yPos + 45, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      doc.text(`${result.breakdown?.supervisorScore?.toFixed(1) || '0.0'}%`, 170, yPos + 65, { align: 'center' });
      
      // Company Card
      doc.setFillColor(248, 250, 252);
      doc.rect(305, yPos, cardWidth, cardHeight, 'F');
      doc.setDrawColor(147, 51, 234);
      doc.setLineWidth(1);
      doc.rect(305, yPos, cardWidth, cardHeight);
      
      // Company header
      doc.setFillColor(147, 51, 234);
      doc.rect(305, yPos, cardWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.text('Company Evaluation (40%)', 425, yPos + 17, { align: 'center' });
      
      // Company score
      doc.setTextColor(147, 51, 234);
      doc.setFontSize(18);
      doc.setFont('times', 'bold');
      doc.text(`${result.evaluation?.companyMarks || 0}/40`, 425, yPos + 45, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      doc.text(`${result.breakdown?.companyScore?.toFixed(1) || '0.0'}%`, 425, yPos + 65, { align: 'center' });
      
      // ===== FINAL RESULT =====
      yPos += 110;
      const totalMarks = result.evaluation?.totalMarks || 0;
      const grade = result.evaluation?.grade || 'F';
      
      // Grade colors
      let gradeColor = [34, 197, 94]; // Green
      if (['D', 'F'].includes(grade)) gradeColor = [239, 68, 68]; // Red
      else if (['C+', 'C', 'C-'].includes(grade)) gradeColor = [251, 146, 60]; // Orange
      else if (['B+', 'B', 'B-'].includes(grade)) gradeColor = [59, 130, 246]; // Blue
      
      // Final result box
      doc.setFillColor(255, 251, 235);
      doc.rect(40, yPos, 515, 50, 'F');
      doc.setDrawColor(252, 211, 77);
      doc.setLineWidth(2);
      doc.rect(40, yPos, 515, 50);
      
      // Final Total label
      doc.setTextColor(0, 51, 102);
      doc.setFontSize(16);
      doc.setFont('times', 'bold');
      doc.text('FINAL TOTAL:', 60, yPos + 25);
      
      // Score
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(20);
      doc.setFont('times', 'bold');
      doc.text(`${totalMarks}/100`, 200, yPos + 25);
      
      // Grade badge
      doc.setFillColor(...gradeColor);
      doc.roundedRect(350, yPos + 10, 60, 30, 5, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('times', 'bold');
      doc.text(grade, 380, yPos + 28, { align: 'center' });
      
      // ===== IMPORTANT NOTE =====
      yPos += 70;
      doc.setFillColor(254, 252, 232);
      doc.rect(40, yPos, 515, 40, 'F');
      doc.setDrawColor(252, 211, 77);
      doc.setLineWidth(1);
      doc.rect(40, yPos, 515, 40);
      
      doc.setTextColor(180, 83, 9);
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.text('IMPORTANT NOTE:', 50, yPos + 18);
      
      doc.setFont('times', 'normal');
      doc.text('Final evaluation is based on Supervisor (60%) + Company (40%) assessments.', 50, yPos + 32);
      
      // ===== PROFESSIONAL FOOTER =====
      const footerY = 780;
      doc.setFillColor(248, 250, 252);
      doc.rect(0, footerY, 595, 60, 'F');
      
      // Footer border
      doc.setDrawColor(0, 51, 102);
      doc.setLineWidth(2);
      doc.line(0, footerY, 595, footerY);
      
      // University information
      doc.setTextColor(0, 51, 102);
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.text('COMSATS University Islamabad - Student Results Portal', 40, footerY + 20);
      
      doc.setTextColor(108, 117, 125);
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.text('Email: internships@comsats.edu.pk | Web: www.comsats.edu.pk', 40, footerY + 35);
      
      // Generation info
      doc.text(`Generated: ${new Date().toLocaleString()}`, 400, footerY + 20);
      doc.text('Official Document', 400, footerY + 35);
      
      // Save with NEW professional filename
      const studentRoll = result.studentInfo?.rollNumber || 'Student';
      const timestamp = new Date().toISOString().slice(0,19).replace(/[-:]/g, '').replace('T', '_');
      const filename = `COMSATS_Professional_Results_${studentRoll.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
      
      console.log('💾 Saving NEW Professional PDF as:', filename);
      doc.save(filename);
      
      console.log('✅ NEW PROFESSIONAL PDF Generated Successfully!');
      
    } catch (error) {
      console.error('❌ PDF Generation Error:', error);
      console.error('Please check the console for details. Contact support if the issue persists.');
    }
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
          <div className="p-4 bg-yellow-100 rounded-full w-20 h-20 mx-auto mb-6">
            <Trophy className="h-12 w-12 text-yellow-600 mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-[#003366] mb-2">Final Results Pending</h3>
          <p className="text-[#00509E] font-medium mb-6">
            Your final evaluation results have not been released yet by your supervisor.
          </p>
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="mb-4 p-3 bg-white rounded-lg border border-yellow-300">
              <p className="text-sm font-bold text-[#003366] mb-2">
                ⏳ Waiting for Supervisor Approval
              </p>
              <p className="text-sm text-gray-700">
                Your supervisor needs to review and send your final evaluation results. Once they click &quot;Send Final Result&quot;, your results will appear here.
              </p>
            </div>
            <p className="text-sm font-bold text-[#003366] mb-3">
              Evaluation Status:
            </p>
            <ul className="text-sm text-[#00509E] space-y-2 text-left">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>✓ Internship period completed</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>✓ Company evaluation submitted</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>✓ Supervisor evaluation completed</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">⏳ Waiting for supervisor to send final results</span>
              </li>
            </ul>
          </Card>
          <p className="text-xs text-gray-500 mt-6">
            You will receive an email notification when your results are released.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Header Section - COMSATS Design */}
      <div className="relative bg-[#003366] rounded-lg p-5 text-white shadow-md overflow-hidden">
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
        <div className="absolute inset-0 bg-[#003366]/10 opacity-50"></div>
        <div className="absolute -top-5 -right-5 w-20 h-20 bg-[#003366]/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-[#00509E]/20 rounded-full blur-lg"></div>
      </div>

      {/* Evaluation Cards - COMSATS Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Supervisor Evaluation */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="bg-[#003366]/5 px-6 py-4 border-b border-[#003366]/20">
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
                    className="bg-[#003366] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${result.breakdown.supervisorScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Company Evaluation */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="bg-[#00509E]/5 px-6 py-4 border-b border-[#00509E]/20">
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
                    className="bg-[#00509E] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${result.breakdown.companyScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Final Result */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="bg-yellow-400/10 px-6 py-4 border-b border-yellow-400/20">
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
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
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
        <div className="bg-[#003366]/5 px-6 py-4 border-b border-[#003366]/20">
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
            <div className="grid grid-cols-2 gap-4 bg-[#003366]/5 p-4 rounded-lg border border-[#003366]/10">
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
            <div className="grid grid-cols-2 gap-4 bg-[#00509E]/5 p-4 rounded-lg border border-[#00509E]/10">
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
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
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
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
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
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-[#003366] hover:bg-[#00509E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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

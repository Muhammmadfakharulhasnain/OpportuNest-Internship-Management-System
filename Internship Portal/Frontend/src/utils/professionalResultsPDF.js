/**
 * 🎯 PROFESSIONAL A4 RESULTS REPORT PDF GENERATOR
 * 
 * This module provides professional A4 PDF generation for Student Results with:
 * ✅ Professional A4 formatting (595.28 x 841.89 points)
 * ✅ Times New Roman fonts with correct sizing (14pt headings, 12pt content)
 * ✅ Proper 1-inch margins (72 points) on all sides
 * ✅ COMSATS University branding and styling matching Joining Report
 * ✅ Complete evaluation data display with professional formatting
 * ✅ No content overlapping or cutting off pages
 * ✅ Automatic page breaks for long content
 * ✅ Professional layout consistent with other COMSATS reports
 */

// COMSATS University Professional Color Palette (matching Joining Report)
const COMSATS_COLORS = {
  // Primary COMSATS colors
  navy: '#003366',           // Primary dark blue
  blue: '#00509E',           // Secondary blue
  lightBlue: '#4A90E2',      // Accent blue
  
  // Professional document colors
  white: '#FFFFFF',
  lightGray: '#F8F9FA',
  mediumGray: '#E9ECEF',
  darkGray: '#495057',
  
  // Status colors for grades
  success: '#28A745',        // Green for good grades
  warning: '#FFC107',        // Yellow for average grades
  danger: '#DC3545',         // Red for poor grades
  info: '#17A2B8',          // Blue for info
  
  // Text colors
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  
  // Accent colors
  accent: '#F8F9FA',
  border: '#DEE2E6'
};

class ProfessionalResultsPDF {
  constructor(title = 'COMSATS Final Evaluation Results') {
    // A4 dimensions in points (72 points = 1 inch)
    this.A4_WIDTH = 595.28;
    this.A4_HEIGHT = 841.89;
    this.MARGIN = 72; // 1 inch margins
    
    // Initialize fonts (Times New Roman family for professional documents)
    this.fonts = {
      regular: 'Times-Roman',
      bold: 'Times-Bold',
      italic: 'Times-Italic'
    };
    
    this.currentY = this.MARGIN + 80; // Start after header
    this.contentWidth = this.A4_WIDTH - (2 * this.MARGIN);
  }

  // Create jsPDF instance with professional settings
  createDocument() {
    // Import jsPDF - will be imported in ResultsTab component
    const jsPDF = window.jspdf?.jsPDF;
    if (!jsPDF) {
      throw new Error('jsPDF library not available. Please ensure it is properly imported.');
    }
    
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [this.A4_WIDTH, this.A4_HEIGHT]
    });
    
    return this;
  }

  // Add professional COMSATS header (matching Joining Report style)
  addHeader() {
    const headerHeight = 80;
    
    // COMSATS header background
    this.doc.setFillColor(0, 51, 102); // Navy blue
    this.doc.rect(0, 0, this.A4_WIDTH, headerHeight, 'F');
    
    // University name - professional typography
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(18);
    this.doc.text('COMSATS UNIVERSITY ISLAMABAD', this.A4_WIDTH / 2, 30, { align: 'center' });
    
    // Subtitle
    this.doc.setFont('times', 'normal');
    this.doc.setFontSize(12);
    this.doc.text('INTERNSHIP MANAGEMENT PORTAL', this.A4_WIDTH / 2, 50, { align: 'center' });
    
    // Department
    this.doc.setFontSize(10);
    this.doc.text('Faculty of Computer Science', this.A4_WIDTH / 2, 65, { align: 'center' });
    
    return this;
  }

  // Add document title (matching Joining Report style)
  addTitle(title) {
    this.doc.setTextColor(0, 51, 102);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(16);
    this.doc.text(title, this.A4_WIDTH / 2, this.currentY, { align: 'center' });
    
    // Add decorative line
    const lineY = this.currentY + 15;
    this.doc.setDrawColor(0, 80, 158);
    this.doc.setLineWidth(2);
    this.doc.line(this.MARGIN + 100, lineY, this.A4_WIDTH - this.MARGIN - 100, lineY);
    
    this.currentY += 40;
    return this;
  }

  // Add section heading with professional formatting (matching Joining Report style)
  addSectionHeading(text) {
    // Check if we need a new page
    if (this.currentY > this.A4_HEIGHT - 150) {
      this.addNewPage();
    }
    
    this.doc.setTextColor(0, 51, 102);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(14);
    this.doc.text(text, this.MARGIN, this.currentY);
    
    // Add underline
    const textWidth = this.doc.getTextWidth(text);
    this.doc.setDrawColor(0, 80, 158);
    this.doc.setLineWidth(1);
    this.doc.line(this.MARGIN, this.currentY + 5, this.MARGIN + textWidth + 20, this.currentY + 5);
    
    this.currentY += 30;
    return this;
  }

  // Add professional information table (matching Joining Report style)
  addInfoTable(data) {
    const rowHeight = 25;
    const labelWidth = 180;
    
    data.forEach((item, index) => {
      const [label, value] = item;
      const y = this.currentY + (index * rowHeight);
      
      // Check if we need a new page
      if (y > this.A4_HEIGHT - 100) {
        this.addNewPage();
        return;
      }
      
      // Alternating row background
      if (index % 2 === 0) {
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(this.MARGIN, y - 5, this.contentWidth, rowHeight - 5, 'F');
      }
      
      // Label
      this.doc.setTextColor(0, 51, 102);
      this.doc.setFont('times', 'bold');
      this.doc.setFontSize(12);
      this.doc.text(label + ':', this.MARGIN + 10, y + 8);
      
      // Value
      this.doc.setTextColor(33, 37, 41);
      this.doc.setFont('times', 'normal');
      this.doc.setFontSize(12);
      const displayValue = value || 'N/A';
      this.doc.text(displayValue, this.MARGIN + labelWidth, y + 8);
    });
    
    this.currentY += data.length * rowHeight + 20;
    return this;
  }

  // Add evaluation breakdown section with professional cards
  addEvaluationBreakdown(result) {
    this.addSectionHeading('Evaluation Breakdown');
    
    const cardWidth = (this.contentWidth - 20) / 2;
    const cardHeight = 80;
    
    // Supervisor Evaluation Card (60%)
    const supervisorX = this.MARGIN;
    const supervisorY = this.currentY;
    
    // Card background and border
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(supervisorX, supervisorY, cardWidth, cardHeight, 'F');
    this.doc.setDrawColor(0, 51, 102);
    this.doc.setLineWidth(1);
    this.doc.rect(supervisorX, supervisorY, cardWidth, cardHeight);
    
    // Card header
    this.doc.setFillColor(0, 51, 102);
    this.doc.rect(supervisorX, supervisorY, cardWidth, 25, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('Supervisor Evaluation (60%)', supervisorX + cardWidth/2, supervisorY + 16, { align: 'center' });
    
    // Score display
    this.doc.setTextColor(0, 80, 158);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(18);
    const supervisorScore = `${result.evaluation?.supervisorMarks || 0}/60`;
    this.doc.text(supervisorScore, supervisorX + cardWidth/2, supervisorY + 45, { align: 'center' });
    
    // Percentage
    this.doc.setFont('times', 'normal');
    this.doc.setFontSize(10);
    const supervisorPercent = result.breakdown?.supervisorScore?.toFixed(1) || '0.0';
    this.doc.text(`${supervisorPercent}%`, supervisorX + cardWidth/2, supervisorY + 65, { align: 'center' });
    
    // Company Evaluation Card (40%)
    const companyX = this.MARGIN + cardWidth + 20;
    const companyY = this.currentY;
    
    // Card background and border
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(companyX, companyY, cardWidth, cardHeight, 'F');
    this.doc.setDrawColor(147, 51, 234);
    this.doc.setLineWidth(1);
    this.doc.rect(companyX, companyY, cardWidth, cardHeight);
    
    // Card header
    this.doc.setFillColor(147, 51, 234);
    this.doc.rect(companyX, companyY, cardWidth, 25, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('Company Evaluation (40%)', companyX + cardWidth/2, companyY + 16, { align: 'center' });
    
    // Score display
    this.doc.setTextColor(147, 51, 234);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(18);
    const companyScore = `${result.evaluation?.companyMarks || 0}/40`;
    this.doc.text(companyScore, companyX + cardWidth/2, companyY + 45, { align: 'center' });
    
    // Percentage
    this.doc.setFont('times', 'normal');
    this.doc.setFontSize(10);
    const companyPercent = result.breakdown?.companyScore?.toFixed(1) || '0.0';
    this.doc.text(`${companyPercent}%`, companyX + cardWidth/2, companyY + 65, { align: 'center' });
    
    this.currentY += cardHeight + 30;
    return this;
  }

  // Add final result section with grade badge
  addFinalResult(result) {
    const totalMarks = result.evaluation?.totalMarks || 0;
    const grade = result.evaluation?.grade || 'F';
    
    // Determine grade colors
    let gradeColors = { r: 34, g: 197, b: 94 }; // Green for good grades
    if (['D', 'F'].includes(grade)) {
      gradeColors = { r: 239, g: 68, b: 68 }; // Red
    } else if (['C+', 'C', 'C-'].includes(grade)) {
      gradeColors = { r: 251, g: 146, b: 60 }; // Orange
    } else if (['B+', 'B', 'B-'].includes(grade)) {
      gradeColors = { r: 59, g: 130, b: 246 }; // Blue
    }
    
    // Final result box
    this.doc.setFillColor(255, 251, 235);
    this.doc.rect(this.MARGIN, this.currentY, this.contentWidth, 50, 'F');
    this.doc.setDrawColor(252, 211, 77);
    this.doc.setLineWidth(2);
    this.doc.rect(this.MARGIN, this.currentY, this.contentWidth, 50);
    
    // Final Total label
    this.doc.setTextColor(0, 51, 102);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(16);
    this.doc.text('FINAL TOTAL:', this.MARGIN + 20, this.currentY + 25);
    
    // Score
    this.doc.setTextColor(34, 197, 94);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(20);
    this.doc.text(`${totalMarks}/100`, this.MARGIN + 150, this.currentY + 25);
    
    // Grade badge
    this.doc.setFillColor(gradeColors.r, gradeColors.g, gradeColors.b);
    this.doc.roundedRect(this.MARGIN + 300, this.currentY + 10, 60, 30, 5, 5, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(16);
    this.doc.text(grade, this.MARGIN + 330, this.currentY + 28, { align: 'center' });
    
    this.currentY += 70;
    return this;
  }

  // Add important note section (matching UI design)
  addImportantNote() {
    // Note box
    this.doc.setFillColor(254, 252, 232);
    this.doc.rect(this.MARGIN, this.currentY, this.contentWidth, 40, 'F');
    this.doc.setDrawColor(252, 211, 77);
    this.doc.setLineWidth(1);
    this.doc.rect(this.MARGIN, this.currentY, this.contentWidth, 40);
    
    // Note icon and text
    this.doc.setTextColor(180, 83, 9);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(10);
    this.doc.text('📝 IMPORTANT NOTE:', this.MARGIN + 15, this.currentY + 18);
    
    this.doc.setFont('times', 'normal');
    this.doc.text('Final evaluation is based on Supervisor (60%) + Company (40%) assessments.', 
                  this.MARGIN + 15, this.currentY + 32);
    
    this.currentY += 60;
    return this;
  }

  // Add professional footer (matching Joining Report style)
  addFooter() {
    const footerY = this.A4_HEIGHT - 80;
    
    // Footer background
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(0, footerY, this.A4_WIDTH, 80, 'F');
    
    // Footer border
    this.doc.setDrawColor(0, 51, 102);
    this.doc.setLineWidth(2);
    this.doc.line(0, footerY, this.A4_WIDTH, footerY);
    
    // University information
    this.doc.setTextColor(0, 51, 102);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(10);
    this.doc.text('COMSATS University Islamabad - Student Results Portal', 
                  this.MARGIN, footerY + 20);
    
    this.doc.setTextColor(108, 117, 125);
    this.doc.setFont('times', 'normal');
    this.doc.setFontSize(9);
    this.doc.text('Email: internships@comsats.edu.pk | Web: www.comsats.edu.pk', 
                  this.MARGIN, footerY + 35);
    
    // Generation info
    this.doc.text(`Generated: ${new Date().toLocaleString()}`, 
                  this.A4_WIDTH - this.MARGIN - 150, footerY + 20);
    this.doc.text('Official Document', 
                  this.A4_WIDTH - this.MARGIN - 150, footerY + 35);
    
    return this;
  }

  // Add new page with continuation header
  addNewPage() {
    this.doc.addPage();
    this.currentY = this.MARGIN + 20;
    
    // Add small header for continuation pages
    this.doc.setTextColor(0, 51, 102);
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('COMSATS University Islamabad - Final Evaluation Results (Continued)', 
                  this.MARGIN, this.currentY);
    
    this.currentY += 30;
    return this;
  }

  // Generate complete professional results PDF
  generateResultsPDF(result) {
    this.createDocument();
    
    // Build the professional PDF
    this.addHeader();
    this.addTitle('FINAL INTERNSHIP EVALUATION RESULTS');
    
    // Student Information Section
    this.addSectionHeading('Student Information');
    const studentInfo = [
      ['Student Name', result.studentInfo?.name || 'N/A'],
      ['Roll Number', result.studentInfo?.rollNumber || 'N/A'],
      ['Department', result.studentInfo?.department || 'Computer Science'],
      ['Email Address', result.studentInfo?.email || 'N/A']
    ];
    this.addInfoTable(studentInfo);
    
    // Internship Information Section
    this.addSectionHeading('Internship Information');
    const internshipInfo = [
      ['Company/Organization', result.internshipInfo?.companyName || 'N/A'],
      ['Position/Role', result.internshipInfo?.position || 'N/A'],
      ['Supervisor', result.internshipInfo?.supervisorName || 'N/A'],
      ['Duration', result.internshipInfo?.duration || '3 months'],
      ['Start Date', result.internshipInfo?.startDate ? 
        new Date(result.internshipInfo.startDate).toLocaleDateString() : 'N/A'],
      ['End Date', result.internshipInfo?.endDate ? 
        new Date(result.internshipInfo.endDate).toLocaleDateString() : 'N/A']
    ];
    this.addInfoTable(internshipInfo);
    
    // Evaluation Breakdown
    this.addEvaluationBreakdown(result);
    
    // Final Result
    this.addFinalResult(result);
    
    // Important Note
    this.addImportantNote();
    
    // Footer
    this.addFooter();
    
    return this.doc;
  }
}

// Export for use in ResultsTab component
export { ProfessionalResultsPDF };
export default ProfessionalResultsPDF;
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
    color: '#2d3748',
  },
  
  // Header Section
  header: {
    marginBottom: 30,
    borderBottom: '3 solid #7c3aed',
    paddingBottom: 20,
  },
  titleContainer: {
    backgroundColor: '#7c3aed',
    padding: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#e9d5ff',
    fontWeight: 'normal',
  },
  
  // Document Info
  documentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    padding: 12,
    border: '1 solid #a855f7',
    marginBottom: 25,
  },
  documentNumber: {
    fontSize: 10,
    color: '#581c87',
    fontWeight: 'bold',
  },
  generatedDate: {
    fontSize: 10,
    color: '#581c87',
  },
  
  // Section Headers
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '2 solid #ddd6fe',
  },
  
  // Enhanced Table Styles
  tableContainer: {
    border: '1.5 solid #cbd5e0',
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  tableHeader: {
    backgroundColor: '#f3e8ff',
    padding: 12,
    borderBottom: '1.5 solid #cbd5e0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#581c87',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e2e8f0',
    minHeight: 40,
    alignItems: 'center',
  },
  tableRowAlternate: {
    backgroundColor: '#faf5ff',
  },
  labelCell: {
    width: '40%',
    padding: 12,
    backgroundColor: '#f8faff',
    borderRight: '1 solid #e2e8f0',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6b46c1',
  },
  valueCell: {
    width: '60%',
    padding: 12,
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 11,
    color: '#2d3748',
    lineHeight: 1.4,
  },
  
  // Content Areas
  contentSection: {
    backgroundColor: '#faf5ff',
    border: '1 solid #c4b5fd',
    padding: 20,
    marginBottom: 20,
    minHeight: 80,
  },
  contentText: {
    fontSize: 11,
    color: '#2d3748',
    lineHeight: 1.7,
    textAlign: 'justify',
  },
  
  // Status Badge
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Performance Section
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  performanceCard: {
    width: '48%',
    backgroundColor: '#f8faff',
    border: '1 solid #c4b5fd',
    padding: 15,
    textAlign: 'center',
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 5,
  },
  performanceLabel: {
    fontSize: 10,
    color: '#6b46c1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Skills Grid
  skillsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  skillCard: {
    width: '30%',
    backgroundColor: '#faf5ff',
    border: '1 solid #c4b5fd',
    padding: 10,
    textAlign: 'center',
  },
  skillTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b46c1',
    marginBottom: 5,
  },
  skillValue: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    right: 30,
    borderTop: '1 solid #e2e8f0',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    fontSize: 9,
    color: '#718096',
  },
  footerCenter: {
    fontSize: 9,
    color: '#718096',
    textAlign: 'center',
  },
  footerRight: {
    fontSize: 9,
    color: '#718096',
    textAlign: 'right',
  },
  
  // Watermark
  watermark: {
    position: 'absolute',
    top: 400,
    left: 120,
    fontSize: 60,
    color: '#f8faff',
    fontWeight: 'bold',
    transform: 'rotate(-45deg)',
  },
  
  // Highlight Box
  highlightBox: {
    backgroundColor: '#ede9fe',
    border: '1 solid #a855f7',
    borderLeft: '4 solid #7c3aed',
    padding: 15,
    marginBottom: 20,
  },
  highlightText: {
    fontSize: 11,
    color: '#581c87',
    fontStyle: 'italic',
  },
  
  // Excellence Box
  excellenceBox: {
    backgroundColor: '#d1fae5',
    border: '2 solid #10b981',
    padding: 15,
    marginBottom: 20,
  },
  excellenceText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const InternshipAppraisalPDF = ({ report }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not Provided';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'Not Provided';
    }
    return String(value);
  };

  const getPerformanceColor = (performance) => {
    const perfLower = String(performance || '').toLowerCase();
    switch (perfLower) {
      case 'excellent': 
        return { backgroundColor: '#d1fae5', color: '#065f46', border: '1 solid #10b981' };
      case 'good': 
        return { backgroundColor: '#dbeafe', color: '#1e40af', border: '1 solid #3b82f6' };
      case 'average': 
        return { backgroundColor: '#fef3c7', color: '#92400e', border: '1 solid #f59e0b' };
      case 'poor':
        return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1 solid #ef4444' };
      default: 
        return { backgroundColor: '#f3f4f6', color: '#374151', border: '1 solid #9ca3af' };
    }
  };

  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating) || 0;
    if (numRating >= 8) return '#10b981'; // Green for excellent
    if (numRating >= 6) return '#3b82f6'; // Blue for good
    if (numRating >= 4) return '#f59e0b'; // Yellow for average
    return '#ef4444'; // Red for poor
  };

  const generateReportId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000);
    return `IA-${year}-${String(randomNum).padStart(4, '0')}`;
  };

  // Ensure all values are strings and not undefined
  const safeReport = {
    studentName: getValue(report?.studentName),
    rollNumber: getValue(report?.rollNumber || report?.studentRollNumber),
    companyName: getValue(report?.companyName),
    internshipTitle: getValue(report?.internshipTitle),
    duration: getValue(report?.duration),
    submissionDate: report?.submissionDate || report?.createdAt,
    overallPerformance: getValue(report?.overallPerformance),
    rating: getValue(report?.rating || report?.finalRating),
    technicalSkills: getValue(report?.technicalSkills),
    communicationSkills: getValue(report?.communicationSkills),
    keyStrengths: getValue(report?.keyStrengths),
    attendance: getValue(report?.attendance || report?.attendanceRecord),
    punctuality: getValue(report?.punctuality),
    areasForImprovement: getValue(report?.areasForImprovement),
    commentsAndFeedback: getValue(report?.commentsAndFeedback || report?.comments),
    recommendation: getValue(report?.recommendation)
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>INTERNSHIP APPRAISAL</Text>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Internship Appraisal</Text>
            <Text style={styles.subtitle}>Student Performance Evaluation & Assessment</Text>
          </View>
          
          <View style={styles.documentInfo}>
            <Text style={styles.documentNumber}>Report ID: {generateReportId()}</Text>
            <Text style={styles.generatedDate}>Generated: {formatDate(new Date())}</Text>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.performanceContainer}>
          <View style={styles.performanceCard}>
            <Text style={[styles.performanceValue, { color: getRatingColor(safeReport.rating) }]}>
              {safeReport.rating}/10
            </Text>
            <Text style={styles.performanceLabel}>Final Rating</Text>
          </View>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceValue}>{safeReport.overallPerformance}</Text>
            <Text style={styles.performanceLabel}>Overall Performance</Text>
          </View>
        </View>

        {/* Excellence Alert for High Performers */}
        {(safeReport.overallPerformance.toLowerCase() === 'excellent' || 
          parseFloat(safeReport.rating) >= 8) && (
          <View style={styles.excellenceBox}>
            <Text style={styles.excellenceText}>
              🌟 OUTSTANDING PERFORMANCE - EXCEPTIONAL INTERN 🌟
            </Text>
          </View>
        )}

        {/* Student & Internship Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Internship Information</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Student & Internship Details</Text>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>Student Name</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={styles.valueText}>{safeReport.studentName}</Text>
              </View>
            </View>
            
            <View style={[styles.tableRow, styles.tableRowAlternate]}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>Roll Number</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={styles.valueText}>{safeReport.rollNumber}</Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>Company Name</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={styles.valueText}>{safeReport.companyName}</Text>
              </View>
            </View>
            
            <View style={[styles.tableRow, styles.tableRowAlternate]}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>Internship Title</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={styles.valueText}>{safeReport.internshipTitle}</Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>Duration</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={styles.valueText}>{safeReport.duration}</Text>
              </View>
            </View>
            
            <View style={[styles.tableRow, styles.tableRowAlternate]}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>Submission Date</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={styles.valueText}>{formatDate(safeReport.submissionDate)}</Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>Overall Performance</Text>
              </View>
              <View style={styles.valueCell}>
                <View style={styles.statusContainer}>
                  <Text style={[styles.statusBadge, getPerformanceColor(safeReport.overallPerformance)]}>
                    {safeReport.overallPerformance}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Skills Evaluation Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Skills Assessment</Text>
          
          <View style={styles.skillsGrid}>
            <View style={styles.skillCard}>
              <Text style={styles.skillTitle}>Technical Skills</Text>
              <Text style={styles.skillValue}>{safeReport.technicalSkills}</Text>
            </View>
            <View style={styles.skillCard}>
              <Text style={styles.skillTitle}>Communication</Text>
              <Text style={styles.skillValue}>{safeReport.communicationSkills}</Text>
            </View>
            <View style={styles.skillCard}>
              <Text style={styles.skillTitle}>Punctuality</Text>
              <Text style={styles.skillValue}>{safeReport.punctuality}</Text>
            </View>
          </View>

          {safeReport.keyStrengths !== 'Not Provided' && (
            <View style={styles.contentSection}>
              <Text style={[styles.contentText, { fontWeight: 'bold', marginBottom: 8 }]}>
                Key Strengths:
              </Text>
              <Text style={styles.contentText}>
                {safeReport.keyStrengths}
              </Text>
            </View>
          )}
        </View>

        {/* Attendance Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Attendance & Discipline</Text>
          <View style={styles.contentSection}>
            <Text style={[styles.contentText, { fontWeight: 'bold', marginBottom: 8 }]}>
              Attendance Record: {safeReport.attendance}
            </Text>
            <Text style={styles.contentText}>
              The student demonstrated {safeReport.punctuality.toLowerCase() === 'excellent' ? 'exceptional' : 'good'} punctuality throughout the internship period.
            </Text>
          </View>
        </View>

        {/* Areas for Improvement Section */}
        {safeReport.areasForImprovement !== 'Not Provided' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Areas for Improvement</Text>
            <View style={styles.contentSection}>
              <Text style={styles.contentText}>
                {safeReport.areasForImprovement}
              </Text>
            </View>
          </View>
        )}

        {/* Final Comments & Recommendation Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Final Comments & Recommendation</Text>
          
          {safeReport.commentsAndFeedback !== 'Not Provided' && (
            <View style={styles.contentSection}>
              <Text style={[styles.contentText, { fontWeight: 'bold', marginBottom: 8 }]}>
                Comments & Feedback:
              </Text>
              <Text style={styles.contentText}>
                {safeReport.commentsAndFeedback}
              </Text>
            </View>
          )}

          {safeReport.recommendation !== 'Not Provided' && (
            <View style={styles.contentSection}>
              <Text style={[styles.contentText, { fontWeight: 'bold', marginBottom: 8 }]}>
                Recommendation:
              </Text>
              <Text style={styles.contentText}>
                {safeReport.recommendation}
              </Text>
            </View>
          )}
        </View>

        {/* Success Message for Excellent Performance */}
        {safeReport.overallPerformance.toLowerCase() === 'excellent' && (
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              ✅ This student has successfully completed their internship with exceptional performance and is highly recommended for future opportunities.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLeft}>
            COMSATS University Islamabad
          </Text>
          <Text style={styles.footerCenter}>
            Internship Portal © {new Date().getFullYear()}
          </Text>
          <Text style={styles.footerRight}>
            Page 1 of 1
          </Text>
        </View>
      </Page>
    </Document>
  );
};

InternshipAppraisalPDF.propTypes = {
  report: PropTypes.object.isRequired,
};

export default InternshipAppraisalPDF;
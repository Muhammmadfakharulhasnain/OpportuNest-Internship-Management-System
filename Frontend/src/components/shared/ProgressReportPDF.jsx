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
    borderBottom: '3 solid #2b6cb0',
    paddingBottom: 20,
  },
  titleContainer: {
    backgroundColor: '#2b6cb0',
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
    color: '#e2e8f0',
    fontWeight: 'normal',
  },
  
  // Document Info
  documentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    padding: 12,
    border: '1 solid #e2e8f0',
    marginBottom: 25,
  },
  documentNumber: {
    fontSize: 10,
    color: '#4a5568',
    fontWeight: 'bold',
  },
  generatedDate: {
    fontSize: 10,
    color: '#4a5568',
  },
  
  // Section Headers
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b6cb0',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '2 solid #bee3f8',
  },
  
  // Enhanced Table Styles
  tableContainer: {
    border: '1.5 solid #cbd5e0',
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  tableHeader: {
    backgroundColor: '#edf2f7',
    padding: 12,
    borderBottom: '1.5 solid #cbd5e0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
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
    backgroundColor: '#f8fafc',
  },
  labelCell: {
    width: '40%',
    padding: 12,
    backgroundColor: '#f7fafc',
    borderRight: '1 solid #e2e8f0',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4a5568',
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
    backgroundColor: '#f8fafc',
    border: '1 solid #e2e8f0',
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
  
  // Metrics Section
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    border: '1 solid #e2e8f0',
    padding: 15,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2b6cb0',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 10,
    color: '#4a5568',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    left: 200,
    fontSize: 60,
    color: '#f7fafc',
    fontWeight: 'bold',
    transform: 'rotate(-45deg)',
  },
  
  // Separator
  separator: {
    height: 2,
    backgroundColor: '#e2e8f0',
    marginVertical: 15,
  },
  
  // Highlight Box
  highlightBox: {
    backgroundColor: '#ebf8ff',
    border: '1 solid #90cdf4',
    borderLeft: '4 solid #3182ce',
    padding: 15,
    marginBottom: 20,
  },
  highlightText: {
    fontSize: 11,
    color: '#2c5282',
    fontStyle: 'italic',
  },
});

const ProgressReportPDF = ({ report }) => {
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

  const getStatusColor = (status) => {
    const statusLower = String(status || '').toLowerCase();
    switch (statusLower) {
      case 'submitted': 
        return { backgroundColor: '#fef3c7', color: '#92400e', border: '1 solid #f59e0b' };
      case 'reviewed': 
        return { backgroundColor: '#d1fae5', color: '#065f46', border: '1 solid #10b981' };
      case 'in progress': 
        return { backgroundColor: '#dbeafe', color: '#1e40af', border: '1 solid #3b82f6' };
      case 'pending':
        return { backgroundColor: '#fce7f3', color: '#be185d', border: '1 solid #ec4899' };
      default: 
        return { backgroundColor: '#f3f4f6', color: '#374151', border: '1 solid #9ca3af' };
    }
  };

  const getQualityColor = (quality) => {
    const qualityLower = String(quality || '').toLowerCase();
    switch (qualityLower) {
      case 'excellent':
        return '#10b981';
      case 'good':
        return '#3b82f6';
      case 'average':
        return '#f59e0b';
      case 'poor':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const generateReportId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000);
    return `PR-${year}-${String(randomNum).padStart(4, '0')}`;
  };

  // Ensure all values are strings and not undefined
  const safeReport = {
    studentName: getValue(report?.studentName),
    rollNumber: getValue(report?.rollNumber || report?.studentRollNumber),
    companyName: getValue(report?.companyName),
    supervisorName: getValue(report?.supervisorName),
    reportingPeriod: getValue(report?.reportingPeriod),
    createdAt: report?.createdAt,
    qualityOfWork: getValue(report?.qualityOfWork),
    hoursWorked: getValue(report?.hoursWorked),
    status: getValue(report?.status),
    tasksAssigned: getValue(report?.tasksAssigned),
    progressMade: getValue(report?.progressMade),
    supervisorFeedback: getValue(report?.supervisorFeedback)
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>PROGRESS REPORT</Text>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Progress Report</Text>
            <Text style={styles.subtitle}>Student Internship Performance Documentation</Text>
          </View>
          
          <View style={styles.documentInfo}>
            <Text style={styles.documentNumber}>Report ID: {generateReportId()}</Text>
            <Text style={styles.generatedDate}>Generated: {formatDate(new Date())}</Text>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: getQualityColor(safeReport.qualityOfWork) }]}>
              {safeReport.qualityOfWork}
            </Text>
            <Text style={styles.metricLabel}>Quality Rating</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{safeReport.hoursWorked}</Text>
            <Text style={styles.metricLabel}>Hours Worked</Text>
          </View>
        </View>

        {/* Student & Company Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Basic Information</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Student & Company Details</Text>
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
                <Text style={styles.labelText}>Supervisor Name</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={styles.valueText}>{safeReport.supervisorName}</Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>Reporting Period</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={styles.valueText}>{safeReport.reportingPeriod}</Text>
              </View>
            </View>
            
            <View style={[styles.tableRow, styles.tableRowAlternate]}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>Report Date</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={styles.valueText}>{formatDate(safeReport.createdAt)}</Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>Current Status</Text>
              </View>
              <View style={styles.valueCell}>
                <View style={styles.statusContainer}>
                  <Text style={[styles.statusBadge, getStatusColor(safeReport.status)]}>
                    {safeReport.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Tasks Assigned Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Tasks Assigned</Text>
          {safeReport.tasksAssigned !== 'Not Provided' ? (
            <View style={styles.contentSection}>
              <Text style={styles.contentText}>
                {safeReport.tasksAssigned}
              </Text>
            </View>
          ) : (
            <View style={styles.highlightBox}>
              <Text style={styles.highlightText}>
                No specific tasks have been documented in this report.
              </Text>
            </View>
          )}
        </View>

        {/* Progress Made Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Progress Made</Text>
          {safeReport.progressMade !== 'Not Provided' ? (
            <View style={styles.contentSection}>
              <Text style={styles.contentText}>
                {safeReport.progressMade}
              </Text>
            </View>
          ) : (
            <View style={styles.highlightBox}>
              <Text style={styles.highlightText}>
                No progress details have been provided in this report.
              </Text>
            </View>
          )}
        </View>

        {/* Supervisor Feedback Section */}
        {safeReport.supervisorFeedback !== 'Not Provided' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Supervisor Feedback</Text>
            <View style={styles.contentSection}>
              <Text style={styles.contentText}>
                {safeReport.supervisorFeedback}
              </Text>
            </View>
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

ProgressReportPDF.propTypes = {
  report: PropTypes.object.isRequired,
};

export default ProgressReportPDF;
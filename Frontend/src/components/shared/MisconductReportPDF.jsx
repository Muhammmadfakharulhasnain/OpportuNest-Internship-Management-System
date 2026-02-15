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
    borderBottom: '3 solid #dc2626',
    paddingBottom: 20,
  },
  titleContainer: {
    backgroundColor: '#dc2626',
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
    color: '#fed7d7',
    fontWeight: 'normal',
  },
  
  // Document Info
  documentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef5e7',
    padding: 12,
    border: '1 solid #fbbf24',
    marginBottom: 25,
  },
  documentNumber: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: 'bold',
  },
  generatedDate: {
    fontSize: 10,
    color: '#92400e',
  },
  
  // Section Headers
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '2 solid #fecaca',
  },
  
  // Enhanced Table Styles
  tableContainer: {
    border: '1.5 solid #cbd5e0',
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  tableHeader: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderBottom: '1.5 solid #cbd5e0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#991b1b',
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
    backgroundColor: '#fef9f9',
  },
  labelCell: {
    width: '40%',
    padding: 12,
    backgroundColor: '#fef5f5',
    borderRight: '1 solid #e2e8f0',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#7c2d12',
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
    backgroundColor: '#fef9f9',
    border: '1 solid #fca5a5',
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
  
  // Severity Section
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  severityCard: {
    width: '48%',
    backgroundColor: '#fef5f5',
    border: '1 solid #fca5a5',
    padding: 15,
    textAlign: 'center',
  },
  severityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 5,
  },
  severityLabel: {
    fontSize: 10,
    color: '#7c2d12',
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
    left: 150,
    fontSize: 60,
    color: '#fef2f2',
    fontWeight: 'bold',
    transform: 'rotate(-45deg)',
  },
  
  // Highlight Box
  highlightBox: {
    backgroundColor: '#fef3c7',
    border: '1 solid #f59e0b',
    borderLeft: '4 solid #d97706',
    padding: 15,
    marginBottom: 20,
  },
  highlightText: {
    fontSize: 11,
    color: '#92400e',
    fontStyle: 'italic',
  },
  
  // Critical Alert Box
  criticalBox: {
    backgroundColor: '#fee2e2',
    border: '2 solid #ef4444',
    padding: 15,
    marginBottom: 20,
  },
  criticalText: {
    fontSize: 12,
    color: '#991b1b',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const MisconductReportPDF = ({ report }) => {
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
      case 'pending': 
        return { backgroundColor: '#fef3c7', color: '#92400e', border: '1 solid #f59e0b' };
      case 'resolved': 
        return { backgroundColor: '#d1fae5', color: '#065f46', border: '1 solid #10b981' };
      case 'warning issued': 
        return { backgroundColor: '#dbeafe', color: '#1e40af', border: '1 solid #3b82f6' };
      case 'internship cancelled':
        return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1 solid #ef4444' };
      default: 
        return { backgroundColor: '#f3f4f6', color: '#374151', border: '1 solid #9ca3af' };
    }
  };

  const getSeverityColor = (issueType) => {
    const typeLower = String(issueType || '').toLowerCase();
    if (typeLower.includes('harassment') || typeLower.includes('discrimination')) {
      return '#dc2626'; // Red for serious issues
    } else if (typeLower.includes('unprofessional') || typeLower.includes('violation')) {
      return '#ea580c'; // Orange for moderate issues
    } else if (typeLower.includes('attendance') || typeLower.includes('tardiness')) {
      return '#f59e0b'; // Yellow for minor issues
    }
    return '#6b7280'; // Gray for other issues
  };

  const generateReportId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000);
    return `MR-${year}-${String(randomNum).padStart(4, '0')}`;
  };

  // Ensure all values are strings and not undefined
  const safeReport = {
    studentName: getValue(report?.studentName),
    rollNumber: getValue(report?.rollNumber || report?.studentRollNumber),
    companyName: getValue(report?.companyName),
    issueType: getValue(report?.issueType),
    incidentDate: report?.incidentDate,
    createdAt: report?.createdAt,
    status: getValue(report?.status),
    resolvedAt: report?.resolvedAt,
    description: getValue(report?.description),
    supervisorComments: getValue(report?.supervisorComments),
    supervisorName: getValue(report?.supervisorName)
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>MISCONDUCT REPORT</Text>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Misconduct Report</Text>
            <Text style={styles.subtitle}>Student Behavior Incident Documentation</Text>
          </View>
          
          <View style={styles.documentInfo}>
            <Text style={styles.documentNumber}>Report ID: {generateReportId()}</Text>
            <Text style={styles.generatedDate}>Generated: {formatDate(new Date())}</Text>
          </View>
        </View>

        {/* Severity Metrics */}
        <View style={styles.severityContainer}>
          <View style={styles.severityCard}>
            <Text style={[styles.severityValue, { color: getSeverityColor(safeReport.issueType) }]}>
              {safeReport.issueType}
            </Text>
            <Text style={styles.severityLabel}>Issue Type</Text>
          </View>
          <View style={styles.severityCard}>
            <Text style={styles.severityValue}>{safeReport.status}</Text>
            <Text style={styles.severityLabel}>Current Status</Text>
          </View>
        </View>

        {/* Critical Alert for Serious Issues */}
        {(safeReport.issueType.toLowerCase().includes('harassment') || 
          safeReport.issueType.toLowerCase().includes('discrimination') ||
          safeReport.status.toLowerCase().includes('cancelled')) && (
          <View style={styles.criticalBox}>
            <Text style={styles.criticalText}>
              ⚠️ CRITICAL INCIDENT - REQUIRES IMMEDIATE ATTENTION ⚠️
            </Text>
          </View>
        )}

        {/* Student & Incident Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Incident Information</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Student & Incident Details</Text>
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
                <Text style={styles.labelText}>Issue Type</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={[styles.valueText, { color: getSeverityColor(safeReport.issueType), fontWeight: 'bold' }]}>
                  {safeReport.issueType}
                </Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>Incident Date</Text>
              </View>
              <View style={styles.valueCell}>
                <Text style={styles.valueText}>{formatDate(safeReport.incidentDate)}</Text>
              </View>
            </View>
            
            <View style={[styles.tableRow, styles.tableRowAlternate]}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>Reported On</Text>
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

            {safeReport.resolvedAt !== 'Not Provided' && (
              <View style={[styles.tableRow, styles.tableRowAlternate]}>
                <View style={styles.labelCell}>
                  <Text style={styles.labelText}>Resolved At</Text>
                </View>
                <View style={styles.valueCell}>
                  <Text style={styles.valueText}>{formatDate(safeReport.resolvedAt)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Detailed Description Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Detailed Description</Text>
          {safeReport.description !== 'Not Provided' ? (
            <View style={styles.contentSection}>
              <Text style={styles.contentText}>
                {safeReport.description}
              </Text>
            </View>
          ) : (
            <View style={styles.highlightBox}>
              <Text style={styles.highlightText}>
                No detailed description has been provided for this incident.
              </Text>
            </View>
          )}
        </View>

        {/* Supervisor Decision Section */}
        {safeReport.supervisorComments !== 'Not Provided' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Supervisor Decision & Comments</Text>
            <View style={styles.contentSection}>
              <Text style={[styles.contentText, { fontWeight: 'bold', marginBottom: 10 }]}>
                Supervisor: {safeReport.supervisorName}
              </Text>
              <Text style={styles.contentText}>
                {safeReport.supervisorComments}
              </Text>
            </View>
          </View>
        )}

        {/* Resolution Status */}
        {safeReport.status.toLowerCase() === 'resolved' && (
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              ✅ This misconduct report has been successfully resolved and closed.
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

MisconductReportPDF.propTypes = {
  report: PropTypes.shape({
    studentName: PropTypes.string,
    rollNumber: PropTypes.string,
    studentRollNumber: PropTypes.string,
    companyName: PropTypes.string,
    issueType: PropTypes.string,
    incidentDate: PropTypes.string,
    createdAt: PropTypes.string,
    status: PropTypes.string,
    resolvedAt: PropTypes.string,
    description: PropTypes.string,
    supervisorComments: PropTypes.string,
    supervisorName: PropTypes.string,
  }).isRequired,
};

export default MisconductReportPDF;
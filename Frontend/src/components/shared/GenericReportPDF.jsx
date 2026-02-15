import React from 'react';
import PropTypes from 'prop-types';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 72, // 1 inch margins
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.4,
  },
  headerBar: {
    backgroundColor: '#2563eb',
    padding: 15,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  divider: {
    borderBottom: '1 solid #d1d5db',
    marginBottom: 25,
  },
  table: {
    marginBottom: 25,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
  },
  tableHeaderCell: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    width: '35%',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    padding: 10,
    width: '65%',
    fontSize: 11,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
    textDecoration: 'underline',
  },
  description: {
    backgroundColor: '#f9fafb',
    padding: 15,
    border: '1 solid #e5e7eb',
    marginTop: 10,
  },
  descriptionText: {
    textAlign: 'justify',
    color: '#374151',
    lineHeight: 1.4,
  },
  footerBar: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#6b7280',
  },
  statusBadge: {
    padding: '5 10',
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 100,
  }
});

const GenericReportPDF = ({ report }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { backgroundColor: '#fbbf24', color: '#92400e' };
      case 'submitted': return { backgroundColor: '#10b981', color: '#065f46' };
      case 'reviewed': return { backgroundColor: '#3b82f6', color: '#1e3a8a' };
      case 'resolved': return { backgroundColor: '#10b981', color: '#065f46' };
      default: return { backgroundColor: '#6b7280', color: '#ffffff' };
    }
  };

  const getReportTitle = () => {
    if (report.type === 'weekly') return 'WEEKLY REPORT';
    if (report.type === 'joining') return 'JOINING REPORT';
    if (report.type === 'appraisal') return 'INTERNSHIP APPRAISAL';
    return report.title?.toUpperCase() || 'REPORT';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Text style={styles.headerText}>COMSATS INTERNSHIP PORTAL</Text>
        </View>

        {/* Document Title */}
        <Text style={styles.title}>{getReportTitle()}</Text>
        <View style={styles.divider} />

        {/* Report Information Table */}
        <View style={styles.table}>
          {report.studentName && (
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderCell}>Student Name</Text>
              <Text style={styles.tableCell}>{report.studentName} {report.rollNumber ? `(${report.rollNumber})` : ''}</Text>
            </View>
          )}
          {report.companyName && (
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderCell}>Company Name</Text>
              <Text style={styles.tableCell}>{report.companyName}</Text>
            </View>
          )}
          {report.submittedAt && (
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderCell}>Submitted On</Text>
              <Text style={styles.tableCell}>{formatDate(report.submittedAt)}</Text>
            </View>
          )}
          {report.status && (
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderCell}>Status</Text>
              <View style={styles.tableCell}>
                <View style={[styles.statusBadge, getStatusColor(report.status)]}>
                  <Text>{report.status}</Text>
                </View>
              </View>
            </View>
          )}
          {report.type === 'weekly' && report.weekNumber && (
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderCell}>Week Number</Text>
              <Text style={styles.tableCell}>{report.weekNumber}</Text>
            </View>
          )}
          {report.type === 'appraisal' && report.rating && (
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderCell}>Rating</Text>
              <Text style={styles.tableCell}>{report.rating}/10</Text>
            </View>
          )}
          {report.type === 'appraisal' && report.performance && (
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderCell}>Performance</Text>
              <Text style={styles.tableCell}>{report.performance}</Text>
            </View>
          )}
        </View>

        {/* Content Sections */}
        {report.type === 'weekly' && (
          <>
            {report.tasksCompleted && (
              <>
                <Text style={styles.sectionTitle}>Tasks Completed</Text>
                <View style={styles.description}>
                  <Text style={styles.descriptionText}>{report.tasksCompleted}</Text>
                </View>
              </>
            )}
            {report.challenges && (
              <>
                <Text style={styles.sectionTitle}>Challenges Faced</Text>
                <View style={styles.description}>
                  <Text style={styles.descriptionText}>{report.challenges}</Text>
                </View>
              </>
            )}
          </>
        )}

        {report.type === 'joining' && (
          <>
            {report.organization && (
              <>
                <Text style={styles.sectionTitle}>Organization Details</Text>
                <View style={styles.description}>
                  <Text style={styles.descriptionText}>Organization: {report.organization}</Text>
                  {report.startDate && <Text style={styles.descriptionText}>Start Date: {formatDate(report.startDate)}</Text>}
                  {report.supervisor && <Text style={styles.descriptionText}>Supervisor: {report.supervisor}</Text>}
                </View>
              </>
            )}
          </>
        )}

        {report.type === 'appraisal' && (
          <>
            {report.comments && (
              <>
                <Text style={styles.sectionTitle}>Performance Comments</Text>
                <View style={styles.description}>
                  <Text style={styles.descriptionText}>{report.comments}</Text>
                </View>
              </>
            )}
          </>
        )}

        {/* Generic description/content */}
        {(report.description || report.content) && (
          <>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.description}>
              <Text style={styles.descriptionText}>{report.description || report.content}</Text>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footerBar}>
          <Text style={styles.footerText}>Generated by COMSATS Internship Portal</Text>
          <Text style={styles.footerText}>
            {formatDate(new Date())} | Page 1 | ID: {report._id?.slice(-8) || report.id}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

GenericReportPDF.propTypes = {
  report: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    type: PropTypes.string,
    title: PropTypes.string,
    studentName: PropTypes.string,
    rollNumber: PropTypes.string,
    companyName: PropTypes.string,
    submittedAt: PropTypes.string,
    status: PropTypes.string,
    weekNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    performance: PropTypes.string,
    tasksCompleted: PropTypes.string,
    challenges: PropTypes.string,
    organization: PropTypes.string,
    startDate: PropTypes.string,
    supervisor: PropTypes.string,
    comments: PropTypes.string,
    description: PropTypes.string,
    content: PropTypes.string
  }).isRequired
};

export default GenericReportPDF;

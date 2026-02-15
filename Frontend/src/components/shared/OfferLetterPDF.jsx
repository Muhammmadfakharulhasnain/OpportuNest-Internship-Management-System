import React from 'react';
import PropTypes from 'prop-types';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Times-Roman',
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    borderBottom: '2 solid #1e40af',
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  companyInfo: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  address: {
    fontSize: 12,
    color: '#6b7280',
  },
  date: {
    textAlign: 'right',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  recipient: {
    marginBottom: 20,
  },
  recipientLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recipientName: {
    fontWeight: 'bold',
    color: '#374151',
  },
  subject: {
    marginBottom: 20,
  },
  subjectLabel: {
    fontWeight: 'bold',
  },
  subjectText: {
    color: '#1d4ed8',
    fontWeight: 'bold',
  },
  body: {
    marginBottom: 30,
  },
  paragraph: {
    marginBottom: 15,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
  },
  highlight: {
    color: '#1d4ed8',
    fontWeight: 'bold',
  },
  dateHighlight: {
    color: '#059669',
    fontWeight: 'bold',
  },
  signature: {
    marginTop: 40,
  },
  signatureLabel: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  signatureName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  signatureTitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  signatureCompany: {
    fontWeight: 'bold',
    color: '#1d4ed8',
  },
});

const OfferLetterPDF = ({ offerLetter }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>INTERNSHIP OFFER LETTER</Text>
        </View>

        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{offerLetter.organizationName}</Text>
          <Text style={styles.address}>{offerLetter.organizationAddress}</Text>
        </View>

        <View style={styles.date}>
          <Text>Date: {formatDate(offerLetter.sentAt)}</Text>
        </View>

        <View style={styles.recipient}>
          <Text style={styles.recipientLabel}>To,</Text>
          <Text>Mr./Ms. <Text style={styles.recipientName}>{offerLetter.studentName}</Text></Text>
          <Text>Email: <Text style={styles.bold}>{offerLetter.studentEmail}</Text></Text>
        </View>

        <View style={styles.subject}>
          <Text>
            <Text style={styles.subjectLabel}>Subject: </Text>
            <Text style={styles.subjectText}>{`Internship Offer for the role of "${offerLetter.jobTitle}"`}</Text>
          </Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.paragraph}>
            Dear <Text style={styles.bold}>{offerLetter.studentName}</Text>,
          </Text>
          
          <Text style={styles.paragraph}>
            We are pleased to offer you the position of <Text style={styles.highlight}>{offerLetter.jobTitle} Intern</Text> at <Text style={styles.bold}>{offerLetter.organizationName}</Text>.
          </Text>
          
          <Text style={styles.paragraph}>
            Your internship will commence on <Text style={styles.dateHighlight}>{formatDate(offerLetter.startDate)}</Text> and conclude on <Text style={styles.dateHighlight}>{formatDate(offerLetter.endDate)}</Text>.
          </Text>
          
          <Text style={styles.paragraph}>
            This internship will be conducted <Text style={styles.bold}>under the supervision of {offerLetter.supervisorName || 'Your Assigned Supervisor'}</Text>, who will guide you throughout your learning journey.
          </Text>
          
          {offerLetter.customMessage && (
            <>
              <Text style={[styles.paragraph, styles.bold]}>Additional Notes:</Text>
              <Text style={[styles.paragraph, { fontStyle: 'italic', color: '#6b7280' }]}>
                {offerLetter.customMessage}
              </Text>
            </>
          )}
          
          <Text style={styles.paragraph}>
            We look forward to your contribution and are excited to have you on board.
          </Text>
        </View>

        <View style={styles.signature}>
          <Text style={styles.signatureLabel}>Sincerely,</Text>
          <Text style={styles.signatureName}>{offerLetter.representativeName}</Text>
          <Text style={styles.signatureTitle}>{offerLetter.representativePosition}</Text>
          <Text style={styles.signatureCompany}>{offerLetter.organizationName}</Text>
        </View>
      </Page>
    </Document>
  );
};

OfferLetterPDF.propTypes = {
  offerLetter: PropTypes.shape({
    organizationName: PropTypes.string.isRequired,
    organizationAddress: PropTypes.string.isRequired,
    sentAt: PropTypes.string.isRequired,
    studentName: PropTypes.string.isRequired,
    studentEmail: PropTypes.string.isRequired,
    jobTitle: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    supervisorName: PropTypes.string,
    customMessage: PropTypes.string,
    representativeName: PropTypes.string.isRequired,
    representativePosition: PropTypes.string.isRequired,
  }).isRequired,
};

export default OfferLetterPDF;

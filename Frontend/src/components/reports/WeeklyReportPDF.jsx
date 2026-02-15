import PropTypes from 'prop-types';

const WeeklyReportPDF = ({ report }) => {
  if (!report) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      backgroundColor: 'white',
      color: 'black'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center',
        borderBottom: '3px solid #2563eb',
        paddingBottom: '20px',
        marginBottom: '30px'
      }}>
        <h1 style={{ 
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          color: '#1f2937'
        }}>
          WEEKLY REPORT
        </h1>
        <div style={{ 
          fontSize: '16px',
          color: '#6b7280',
          margin: '10px 0'
        }}>
          COMSATS University Islamabad - Internship Portal
        </div>
      </div>

      {/* Report Information */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        <div>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#374151' }}>Student:</strong>{' '}
            <span>{report.studentName} ({report.studentRollNo})</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#374151' }}>Company:</strong>{' '}
            <span>{report.companyName || 'Not specified'}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#374151' }}>Supervisor:</strong>{' '}
            <span>{report.supervisorName}</span>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#374151' }}>Week Number:</strong>{' '}
            <span>{report.weekNumber}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#374151' }}>Report Date:</strong>{' '}
            <span>{formatDate(report.submittedAt)}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#374151' }}>Due Date:</strong>{' '}
            <span>{formatDate(report.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div style={{ 
        marginBottom: '30px',
        padding: '15px',
        backgroundColor: report.status === 'reviewed' ? '#dcfce7' : '#fef3c7',
        borderRadius: '8px',
        border: `1px solid ${report.status === 'reviewed' ? '#16a34a' : '#d97706'}`
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong style={{ color: '#374151' }}>Status:</strong>{' '}
            <span style={{ 
              color: report.status === 'reviewed' ? '#16a34a' : '#d97706',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}>
              {report.status === 'reviewed' ? 'Reviewed' : 'Submitted'}
            </span>
          </div>
          {report.supervisorFeedback?.rating && (
            <div>
              <strong style={{ color: '#374151' }}>Rating:</strong>{' '}
              <span style={{ 
                color: '#d97706',
                fontWeight: 'bold'
              }}>
                {report.supervisorFeedback.rating}/5
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Report Content */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '15px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '5px'
        }}>
          Report Content
        </h2>

        {/* Tasks Completed */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Tasks Completed:
          </h3>
          <div style={{ 
            padding: '15px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap'
          }}>
            {report.tasksCompleted}
          </div>
        </div>

        {/* Challenges Faced */}
        {report.challengesFaced && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Challenges Faced:
            </h3>
            <div style={{ 
              padding: '15px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {report.challengesFaced}
            </div>
          </div>
        )}

        {/* Reflections / Learnings */}
        {report.reflections && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Reflections / Learnings:
            </h3>
            <div style={{ 
              padding: '15px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {report.reflections}
            </div>
          </div>
        )}

        {/* Supporting Materials */}
        {report.supportingMaterials && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Supporting Materials:
            </h3>
            <div style={{ 
              padding: '15px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {report.supportingMaterials}
            </div>
          </div>
        )}
      </div>

      {/* Supervisor Feedback */}
      {report.supervisorFeedback?.feedback && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '15px',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '5px'
          }}>
            Supervisor Feedback
          </h2>
          
          <div style={{ 
            padding: '20px',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #3b82f6'
          }}>
            <div style={{ 
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              marginBottom: '10px'
            }}>
              &quot;{report.supervisorFeedback.feedback}&quot;
            </div>
            
            {report.supervisorFeedback.reviewedAt && (
              <div style={{ 
                fontSize: '14px',
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                - Reviewed by {report.supervisorFeedback.reviewedBy} on{' '}
                {formatDate(report.supervisorFeedback.reviewedAt)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '50px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div style={{ marginBottom: '5px' }}>
          Generated by COMSATS Internship Portal
        </div>
        <div>
          Report generated on {getCurrentDate()}
        </div>
      </div>
    </div>
  );
};

WeeklyReportPDF.propTypes = {
  report: PropTypes.shape({
    studentName: PropTypes.string,
    studentRollNo: PropTypes.string,
    companyName: PropTypes.string,
    supervisorName: PropTypes.string,
    weekNumber: PropTypes.number,
    submittedAt: PropTypes.string,
    dueDate: PropTypes.string,
    status: PropTypes.string,
    tasksCompleted: PropTypes.string,
    challengesFaced: PropTypes.string,
    reflections: PropTypes.string,
    supportingMaterials: PropTypes.string,
    supervisorFeedback: PropTypes.shape({
      feedback: PropTypes.string,
      rating: PropTypes.number,
      reviewedAt: PropTypes.string,
      reviewedBy: PropTypes.string
    })
  })
};

export default WeeklyReportPDF;

import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Eye, Download, Calendar, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import SearchBar from '../../../ui/SearchBar';
import Modal from '../../../ui/Modal';

const DocumentsTab = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      studentId: 1,
      studentName: 'Ahmad Ali',
      type: 'result-card',
      title: 'Result Card - Semester 7',
      submittedAt: '2024-06-05',
      status: 'pending',
      fileName: 'result_card_ahmad_ali.pdf'
    },
    {
      id: 2,
      studentId: 1,
      studentName: 'Ahmad Ali',
      type: 'completion-certificate',
      title: 'Internship Completion Certificate',
      submittedAt: '2024-08-30',
      status: 'approved',
      fileName: 'completion_certificate_ahmad_ali.pdf'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const handleDocumentAction = (documentId, action) => {
    setDocuments(documents.map(doc => 
      doc.id === documentId 
        ? { ...doc, status: action }
        : doc
    ));
    
    toast.success(`Document ${action} successfully!`);
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'result-card': return 'info';
      case 'completion-certificate': return 'success';
      case 'appraisal-form': return 'primary';
      default: return 'default';
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Document Verification</h2>
        <div className="w-full md:w-64">
          <SearchBar
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {document.title}
                    </h3>
                    <Badge variant={getTypeColor(document.type)}>
                      {document.type.replace('-', ' ').charAt(0).toUpperCase() + document.type.replace('-', ' ').slice(1)}
                    </Badge>
                    <Badge variant={getStatusColor(document.status)}>
                      {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {document.studentName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(document.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-gray-500">{document.fileName}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDocument(document)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                
                {document.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleDocumentAction(document.id, 'approved')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDocumentAction(document.id, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Shield className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Documents Found
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'No documents match your search criteria.' : 'No documents have been submitted for verification.'}
          </p>
        </Card>
      )}

      {/* Document Details Modal */}
      <Modal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        title="Document Details"
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedDocument.title}
                </h2>
                <p className="text-gray-600">Submitted by: {selectedDocument.studentName}</p>
              </div>
              <div className="flex space-x-2">
                <Badge variant={getTypeColor(selectedDocument.type)} size="md">
                  {selectedDocument.type.replace('-', ' ').charAt(0).toUpperCase() + selectedDocument.type.replace('-', ' ').slice(1)}
                </Badge>
                <Badge variant={getStatusColor(selectedDocument.status)} size="md">
                  {selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Student Name</p>
                <p className="text-gray-900">{selectedDocument.studentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Submission Date</p>
                <p className="text-gray-900">
                  {new Date(selectedDocument.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">File Name</p>
                <p className="text-gray-900">{selectedDocument.fileName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Document ID</p>
                <p className="text-gray-900">#{selectedDocument.id}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Document Preview</h3>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Document preview would appear here</p>
                <p className="text-sm text-gray-500 mt-2">{selectedDocument.fileName}</p>
              </div>
            </div>

            {selectedDocument.status === 'pending' && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="danger"
                  onClick={() => {
                    handleDocumentAction(selectedDocument.id, 'rejected');
                    setShowDocumentModal(false);
                  }}
                >
                  Reject Document
                </Button>
                <Button
                  variant="success"
                  onClick={() => {
                    handleDocumentAction(selectedDocument.id, 'approved');
                    setShowDocumentModal(false);
                  }}
                >
                  Approve Document
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentsTab;
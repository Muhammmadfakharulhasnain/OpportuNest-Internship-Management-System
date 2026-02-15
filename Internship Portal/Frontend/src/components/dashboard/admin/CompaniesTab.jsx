import React, { useState } from 'react';
import { Eye, CheckCircle, XCircle, Trash2, Building2 } from 'lucide-react';
import { mockUsers } from '../../../data/mockData';
import { toast } from 'react-hot-toast';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Modal from '../../ui/Modal';

const CompaniesTab = () => {
  const [companies, setCompanies] = useState(
    mockUsers.filter(user => user.role === 'company')
  );
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  const handleStatusUpdate = (companyId, newStatus) => {
    setCompanies(companies.map(company => 
      company.id === companyId 
        ? { ...company, status: newStatus }
        : company
    ));
    toast.success(`Company ${newStatus} successfully!`);
  };

  const handleDeleteCompany = (companyId) => {
    setCompanies(companies.filter(company => company.id !== companyId));
    toast.success('Company deleted successfully!');
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setShowCompanyModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Company Management</h2>
        <div className="flex space-x-2">
          <Badge variant="success">Active: {companies.filter(c => c.status === 'active' || !c.status).length}</Badge>
          <Badge variant="danger">Suspended: {companies.filter(c => c.status === 'suspended').length}</Badge>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="p-6" hover>
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={company.avatar}
                alt={company.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {company.profile?.companyName || company.name}
                </h3>
                <p className="text-gray-600">{company.profile?.industry}</p>
                <Badge variant={getStatusColor(company.status || 'active')}>
                  {(company.status || 'active').charAt(0).toUpperCase() + (company.status || 'active').slice(1)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <p>Location: {company.profile?.location}</p>
              <p>Email: {company.email}</p>
              <p>Phone: {company.profile?.phone}</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm">
                <span className="font-medium text-blue-600">5 Jobs Posted</span>
                <p className="text-gray-500">23 Applications</p>
              </div>
              
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(company)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                {(!company.status || company.status === 'active') ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleStatusUpdate(company.id, 'suspended')}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleStatusUpdate(company.id, 'active')}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
                
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteCompany(company.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Company Details Modal */}
      <Modal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        title="Company Details"
        size="lg"
      >
        {selectedCompany && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={selectedCompany.avatar}
                alt={selectedCompany.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCompany.profile?.companyName || selectedCompany.name}
                </h2>
                <p className="text-gray-600">{selectedCompany.profile?.industry}</p>
                <Badge variant={getStatusColor(selectedCompany.status || 'active')} size="md">
                  {(selectedCompany.status || 'active').charAt(0).toUpperCase() + (selectedCompany.status || 'active').slice(1)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-gray-900">{selectedCompany.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-gray-900">{selectedCompany.profile?.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-gray-900">{selectedCompany.profile?.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Website</p>
                <p className="text-gray-900">{selectedCompany.profile?.website}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Company Description</h3>
              <p className="text-gray-600">{selectedCompany.profile?.description}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Activity Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">5</p>
                  <p className="text-sm text-gray-600">Jobs Posted</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">23</p>
                  <p className="text-sm text-gray-600">Applications</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">8</p>
                  <p className="text-sm text-gray-600">Active Interns</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              {(!selectedCompany.status || selectedCompany.status === 'active') ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    handleStatusUpdate(selectedCompany.id, 'suspended');
                    setShowCompanyModal(false);
                  }}
                >
                  Suspend Company
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={() => {
                    handleStatusUpdate(selectedCompany.id, 'active');
                    setShowCompanyModal(false);
                  }}
                >
                  Activate Company
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CompaniesTab;
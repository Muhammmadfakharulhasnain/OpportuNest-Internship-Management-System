import React from 'react';
import PropTypes from 'prop-types';
import { UserPlus } from 'lucide-react';
import Button from '../common/Button';

const RegisterFormStep3 = ({
  role,
  formData,
  onChange,
  onBack,
  onSubmit,
  isLoading,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {role === 'company' ? (
        <>
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              value={formData.companyName}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <select
              id="industry"
              name="industry"
              required
              value={formData.industry}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select industry</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
              About Company
            </label>
            <textarea
              id="about"
              name="about"
              required
              value={formData.about}
              onChange={onChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of your company"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              name="department"
              required
              value={formData.department}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select department</option>
              <option value="computer-science">Computer Science</option>
              <option value="electrical-engineering">Electrical Engineering</option>
              <option value="mechanical-engineering">Mechanical Engineering</option>
              <option value="business">Business Administration</option>
              <option value="other">Other</option>
            </select>
          </div>

          {role === 'student' && (
            <>
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Semester
                </label>
                <select
                  id="semester"
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={onChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select semester</option>
                  {[5, 6, 7, 8].map((semester) => (
                    <option key={semester} value={semester}>
                      Semester {semester}
                    </option>
                  ))}
                </select>
              </div>

              {/* Registration Number Components */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Session and Year Dropdown */}
                  <div>
                    <label htmlFor="sessionYear" className="block text-xs font-medium text-gray-600 mb-1">
                      Session & Year
                    </label>
                    <select
                      id="sessionYear"
                      name="sessionYear"
                      required
                      value={formData.sessionYear || ''}
                      onChange={onChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select Session</option>
                      <option value="SP20">SP20</option>
                      <option value="FA20">FA20</option>
                      <option value="SP21">SP21</option>
                      <option value="FA21">FA21</option>
                      <option value="SP22">SP22</option>
                      <option value="FA22">FA22</option>
                      <option value="SP23">SP23</option>
                      <option value="FA23">FA23</option>
                      <option value="SP24">SP24</option>
                      <option value="FA24">FA24</option>
                      <option value="SP25">SP25</option>
                      <option value="FA25">FA25</option>
                    </select>
                  </div>

                  {/* Department Dropdown */}
                  <div>
                    <label htmlFor="regDepartment" className="block text-xs font-medium text-gray-600 mb-1">
                      Department Code
                    </label>
                    <select
                      id="regDepartment"
                      name="regDepartment"
                      required
                      value={formData.regDepartment || ''}
                      onChange={onChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select Dept</option>
                      <option value="BCS">BCS</option>
                      <option value="BBA">BBA</option>
                      <option value="BSE">BSE</option>
                      <option value="BAI">BAI</option>
                      <option value="BEE">BEE</option>
                      <option value="BCE">BCE</option>
                      <option value="BME">BME</option>
                      <option value="BTE">BTE</option>
                    </select>
                  </div>

                  {/* Roll Number Dropdown */}
                  <div>
                    <label htmlFor="rollNumber" className="block text-xs font-medium text-gray-600 mb-1">
                      Roll Number
                    </label>
                    <select
                      id="rollNumber"
                      name="rollNumber"
                      required
                      value={formData.rollNumber || ''}
                      onChange={onChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select Roll</option>
                      {Array.from({length: 100}, (_, i) => i + 1).map(num => (
                        <option key={num} value={num.toString().padStart(3, '0')}>
                          {num.toString().padStart(3, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Registration Number Preview */}
                {formData.sessionYear && formData.regDepartment && formData.rollNumber && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium text-blue-800">
                      Registration Number: {formData.sessionYear}-{formData.regDepartment}-{formData.rollNumber}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {role === 'supervisor' && (
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <input
                id="designation"
                name="designation"
                type="text"
                required
                value={formData.designation}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Assistant Professor"
              />
            </div>
          )}
        </>
      )}

      <div className="flex space-x-3">
        <Button variant="outline" fullWidth onClick={onBack}>
          Back
        </Button>
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          leftIcon={<UserPlus size={18} />}
        >
          Create Account
        </Button>
      </div>
    </form>
  );
};
RegisterFormStep3.propTypes = {
  role: PropTypes.string.isRequired,
  formData: PropTypes.shape({
    companyName: PropTypes.string,
    industry: PropTypes.string,
    website: PropTypes.string,
    about: PropTypes.string,
    department: PropTypes.string,
    semester: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sessionYear: PropTypes.string,
    regDepartment: PropTypes.string,
    rollNumber: PropTypes.string,
    designation: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default RegisterFormStep3;

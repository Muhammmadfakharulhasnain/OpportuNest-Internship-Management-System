import PropTypes from 'prop-types';
import { Building2, GraduationCap, User2 } from 'lucide-react';
import Button from '../common/Button';

const RegisterFormStep2 = ({
  selectedRole,
  onRoleSelect,
  onBack,
  onNext,
}) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Student */}
        <button
          type="button"
          onClick={() => onRoleSelect('student')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedRole === 'student'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`p-2 rounded-full ${
                selectedRole === 'student' ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <GraduationCap
                className={`w-6 h-6 ${
                  selectedRole === 'student' ? 'text-blue-600' : 'text-gray-600'
                }`}
              />
            </div>
            <h3 className="mt-3 text-base font-medium text-gray-900">Student</h3>
            <p className="mt-1 text-sm text-gray-500 text-wrap text-balance">
              Looking for internships to kickstart your career
            </p>
          </div>
        </button>

        {/* Company */}
        <button
          type="button"
          onClick={() => onRoleSelect('company')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedRole === 'company'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`p-2 rounded-full ${
                selectedRole === 'company' ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <Building2
                className={`w-6 h-6 ${
                  selectedRole === 'company' ? 'text-blue-600' : 'text-gray-600'
                }`}
              />
            </div>
            <h3 className="mt-3 text-base font-medium text-gray-900">Company</h3>
            <p className="mt-1 text-sm text-gray-500 text-wrap text-balance">
              Looking to hire talented interns
            </p>
          </div>
        </button>

        {/* Supervisor */}
        <button
          type="button"
          onClick={() => onRoleSelect('supervisor')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedRole === 'supervisor'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`p-2 rounded-full ${
                selectedRole === 'supervisor' ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <User2
                className={`w-6 h-6 ${
                  selectedRole === 'supervisor' ? 'text-blue-600' : 'text-gray-600'
                }`}
              />
            </div>
            <h3 className="mt-3 text-base font-medium text-gray-900">Supervisor</h3>
            <p className="mt-1 text-sm text-gray-500 text-wrap text-balance">
              Guide and monitor students during internships
            </p>
          </div>
        </button>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" fullWidth onClick={onBack}>
          Back
        </Button>
        <Button fullWidth onClick={onNext} disabled={!selectedRole}>
          Next
        </Button>
      </div>
    </div>
  );
};
RegisterFormStep2.propTypes = {
  selectedRole: PropTypes.string,
  onRoleSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

export default RegisterFormStep2;

import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import { weeklyReportAPI } from '../../../services/api';

const WeeklyReport = ({ onSubmitSuccess, onClose }) => {
	const [formData, setFormData] = useState({
		weekNumber: '',
		tasksCompleted: '',
		reflections: '',
		additionalComments: '',
		supportingFiles: []
	});
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log('Submitting weekly report');

		// Validation
		if (!formData.weekNumber || !formData.weekNumber.trim()) {
			toast.error('Please select a week number');
			return;
		}

		if (!formData.tasksCompleted.trim()) {
			toast.error('Weekly Work Summary is required');
			return;
		}

		if (!formData.reflections.trim()) {
			toast.error('Reflections field is required');
			return;
		}

		try {
			setLoading(true);
			
			// Create the submission data
			const submitData = {
				weekNumber: parseInt(formData.weekNumber),
				tasksCompleted: formData.tasksCompleted,
				reflections: formData.reflections,
				additionalComments: formData.additionalComments,
				supportingFiles: formData.supportingFiles
			};
			
			const response = await weeklyReportAPI.submitReport(submitData);
			
			if (response.success) {
				toast.success('Weekly report submitted successfully!');
				
				// Reset form
				setFormData({
					weekNumber: '',
					tasksCompleted: '',
					reflections: '',
					additionalComments: '',
					supportingFiles: []
				});
				
				// Call success callback if provided
				if (onSubmitSuccess) {
					onSubmitSuccess();
				}
				
				// Close modal if callback provided
				if (onClose) {
					onClose();
				}
			}
		} catch (error) {
			console.error('Error submitting weekly report:', error);
			toast.error(error.message || 'Failed to submit weekly report');
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);
		setFormData(prev => ({
			...prev,
			supportingFiles: files
		}));
	};
	return (
		<Card className="max-w-xl mx-auto">
			<form onSubmit={handleSubmit}>
				<h2 className="text-xl font-semibold text-gray-900">Weekly Report Form</h2>
				
				<div className="mt-4">
					<label htmlFor="weekNumber" className="block text-sm font-medium text-gray-700 mb-1">
						Select Week <span className="text-red-500">*</span>
					</label>
					<select
						id="weekNumber"
						name="weekNumber"
						value={formData.weekNumber}
						onChange={handleInputChange}
						className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					>
						<option value="">Choose Week</option>
						{Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
							<option key={week} value={week}>
								Week {week}
							</option>
						))}
					</select>
				</div>

				<div className="mt-4">
					<label htmlFor="tasksCompleted" className="block text-sm font-medium text-gray-700 mb-1">
						Weekly Work Summary <span className="text-red-500">*</span>
					</label>
					<textarea
						id="tasksCompleted"
						name="tasksCompleted"
						value={formData.tasksCompleted}
						onChange={handleInputChange}
						placeholder="Write what you accomplished this week"
						rows={5}
						className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
						required
					/>
				</div>

				<div className="mt-4">
					<label htmlFor="reflections" className="block text-sm font-medium text-gray-700 mb-1">
						Reflections <span className="text-red-500">*</span>
					</label>
					<textarea
						id="reflections"
						name="reflections"
						value={formData.reflections}
						onChange={handleInputChange}
						placeholder="What did you learn this week?"
						rows={4}
						className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
						required
					/>
				</div>

				<div className="mt-4">
					<label htmlFor="additionalComments" className="block text-sm font-medium text-gray-700 mb-1">
						Additional Comments (optional)
					</label>
					<textarea
						id="additionalComments"
						name="additionalComments"
						value={formData.additionalComments}
						onChange={handleInputChange}
						placeholder="Any additional comments or notes"
						rows={3}
						className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
					/>
				</div>

				<div className="mt-4">
					<label htmlFor="supportingFiles" className="block text-sm font-medium text-gray-700 mb-1">
						Supporting Files (optional)
					</label>
					<input
						type="file"
						id="supportingFiles"
						name="supportingFiles"
						multiple
						onChange={handleFileChange}
						accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
						className="w-full border border-gray-300 rounded-md p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<p className="mt-1 text-xs text-gray-500">
						Accepted: PDF, DOC/DOCX, images. Max 5 files.
					</p>
					{formData.supportingFiles.length > 0 && (
						<div className="mt-2">
							<p className="text-sm text-gray-600">Selected files:</p>
							<ul className="text-xs text-gray-500">
								{formData.supportingFiles.map((file, index) => (
									<li key={index}>• {file.name}</li>
								))}
							</ul>
						</div>
					)}
				</div>

				<div className="mt-6 flex gap-3">
					{onClose && (
						<Button 
							type="button"
							variant="outline" 
							onClick={onClose}
							className="flex-1"
						>
							Cancel
						</Button>
					)}
					<Button 
						type="submit"
						disabled={loading}
						className="flex-1"
					>
						{loading ? 'Submitting...' : 'Submit Report'}
					</Button>
				</div>
			</form>
		</Card>
	);
};

WeeklyReport.propTypes = {
	onSubmitSuccess: PropTypes.func,
	onClose: PropTypes.func
};

export default WeeklyReport;



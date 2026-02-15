import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Users, AlertCircle, FileText, User, Paperclip, Download, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import Modal from '../../../ui/Modal';
import { supervisorChatAPI } from '../../../services/api';

const MessagesTab = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatHistory, setChatHistory] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState({
    title: '',
    description: '',
    priority: 'Normal'
  });
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSupervisedStudents();
    fetchUnreadCounts();
    
    // Poll for unread counts every 30 seconds
    const interval = setInterval(fetchUnreadCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchChatHistory(selectedStudent._id);
    }
  }, [selectedStudent]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSupervisedStudents = async () => {
    try {
      setLoading(true);
      const response = await supervisorChatAPI.getSupervisedStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load supervised students');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (studentId) => {
    try {
      const response = await supervisorChatAPI.getChatHistory(studentId);
      setChatHistory(response.data);
      
      // Mark messages as read
      await supervisorChatAPI.markMessagesAsRead(studentId);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !selectedStudent) return;

    try {
      let response;
      
      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append('message', newMessage.trim() || 'File attachment');
        attachments.forEach(file => {
          formData.append('attachments', file);
        });
        
        response = await supervisorChatAPI.sendMessageWithFiles(selectedStudent._id, formData);
      } else {
        response = await supervisorChatAPI.sendMessage(selectedStudent._id, {
          message: newMessage
        });
      }
      
      setChatHistory(response.data);
      setNewMessage('');
      setAttachments([]);
      fetchUnreadCounts();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleSendProgressUpdate = async () => {
    if (!progressUpdate.title.trim() || !progressUpdate.description.trim() || !selectedStudent) {
      toast.error('Title and description are required');
      return;
    }

    try {
      const response = await supervisorChatAPI.sendProgressUpdate(selectedStudent._id, progressUpdate);
      
      setChatHistory(response.data);
      setProgressUpdate({ title: '', description: '', priority: 'Normal' });
      setShowProgressModal(false);
    } catch (error) {
      console.error('Error sending progress update:', error);
      toast.error('Failed to send progress update');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const response = await supervisorChatAPI.getUnreadCounts();
      setUnreadCounts(response.data);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const getUnreadCount = (student) => {
    return unreadCounts[student._id] || 0;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportChat = async () => {
    if (!selectedStudent) return;
    
    try {
      await supervisorChatAPI.exportChatPDF(selectedStudent._id);
      toast.success('Chat exported successfully');
    } catch (error) {
      console.error('Error exporting chat:', error);
      toast.error('Failed to export chat');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Students List */}
        <div className="w-full lg:w-80 flex-shrink-0 border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#003366] to-[#00509E]">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Supervised Students</h2>
              <p className="text-xs text-blue-100">
                Select to chat
              </p>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-4 text-center">
              <div className="bg-blue-50 p-3 rounded-full animate-pulse mx-auto w-12 h-12 flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-[#003366]" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse mx-auto"></div>
                <div className="h-2 bg-gray-200 rounded w-16 animate-pulse mx-auto"></div>
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="p-6 text-center">
              <div className="bg-gray-50 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No Students</h3>
              <p className="text-xs text-gray-600">No supervised students yet</p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {students.map((student) => (
                <div
                  key={student._id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedStudent?._id === student._id
                      ? 'bg-blue-50 border-[#003366] shadow-sm'
                      : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-[#003366]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {student.fullName || 'Unknown Student'}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {student.rollNumber || student.email}
                        </p>
                      </div>
                    </div>
                    {getUnreadCount(student) > 0 && (
                      <Badge variant="danger" size="sm" className="flex-shrink-0 ml-2">
                        {getUnreadCount(student)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden flex flex-col min-w-0">
        {selectedStudent ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#003366] to-[#00509E]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white truncate">
                      {selectedStudent.fullName || 'Unknown Student'}
                    </h3>
                    <p className="text-xs text-blue-100 truncate">
                      {selectedStudent.rollNumber || selectedStudent.email}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => setShowProgressModal(true)}
                    title="Send Progress Update"
                  >
                    <FileText className="w-4 h-4 lg:mr-2" />
                    <span className="hidden lg:inline">Progress</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={handleExportChat}
                    title="Export Chat as PDF"
                  >
                    <Download className="w-4 h-4 lg:mr-2" />
                    <span className="hidden lg:inline">Export</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 bg-gray-50">
              {chatHistory?.messages?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-blue-50 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-[#003366]" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Start the Conversation</h3>
                  <p className="text-sm text-gray-600">Send your first message to begin chatting</p>
                </div>
              ) : (
                chatHistory?.messages?.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.senderType === 'supervisor' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-lg break-words overflow-wrap-anywhere ${
                        message.senderType === 'supervisor'
                          ? 'bg-[#003366] text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{message.message}</div>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, attIndex) => (
                            <button
                              key={attIndex}
                              onClick={() => window.open(`/api/supervisor-chat/download/${attachment.filename}`, '_blank')}
                              className={`flex items-center space-x-2 p-2 rounded hover:opacity-80 transition-opacity w-full text-left min-w-0 ${
                                message.senderType === 'supervisor'
                                  ? 'bg-[#00509E]'
                                  : 'bg-gray-100'
                              }`}
                            >
                              <Paperclip className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs truncate flex-1">
                                {attachment.originalName}
                              </span>
                              {attachment.isReport && (
                                <Badge variant="success" size="xs" className="flex-shrink-0">
                                  Report
                                </Badge>
                              )}
                              <Download className="w-3 h-3 flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <div
                        className={`text-xs mt-1 ${
                          message.senderType === 'supervisor'
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 min-w-0">
                      <Paperclip className="w-3 h-3 text-[#003366] flex-shrink-0" />
                      <span className="text-xs text-gray-700 truncate max-w-[150px]">{file.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition-all min-w-0"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 flex-shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && attachments.length === 0}
                  className="bg-[#003366] hover:bg-[#00509E] flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="bg-blue-50 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center mb-4">
                <MessageCircle className="w-12 h-12 text-[#003366]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Select a Student
              </h3>
              <p className="text-gray-600 text-sm max-w-md">
                Choose a student from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        title="Delete All Messages"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm">
                This action cannot be undone. All messages with {selectedStudent?.fullName} will be permanently deleted.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await supervisorChatAPI.deleteAllMessages(selectedStudent._id);
                  setChatHistory({ messages: [] });
                  setShowBulkDeleteModal(false);
                  toast.success('All messages deleted successfully');
                } catch (error) {
                  console.error('Error deleting messages:', error);
                  toast.error('Failed to delete messages');
                }
              }}
            >
              Delete All
            </Button>
          </div>
        </div>
      </Modal>

      {/* Progress Update Modal */}
      <Modal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        title="Send Progress Update"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <p className="text-blue-800 text-sm">
                Send a structured progress update to {selectedStudent?.userId?.name}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Title *
            </label>
            <input
              type="text"
              value={progressUpdate.title}
              onChange={(e) => setProgressUpdate({ ...progressUpdate, title: e.target.value })}
              placeholder="e.g., Weekly Progress Review, Task Assignment"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={progressUpdate.description}
              onChange={(e) => setProgressUpdate({ ...progressUpdate, description: e.target.value })}
              placeholder="Provide detailed information about the progress update..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={progressUpdate.priority}
              onChange={(e) => setProgressUpdate({ ...progressUpdate, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowProgressModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendProgressUpdate}
              disabled={!progressUpdate.title.trim() || !progressUpdate.description.trim()}
            >
              Send Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MessagesTab;
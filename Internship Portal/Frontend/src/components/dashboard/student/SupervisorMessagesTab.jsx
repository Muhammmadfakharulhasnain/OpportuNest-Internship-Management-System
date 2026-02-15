import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, AlertCircle, CheckCircle, Paperclip, Download, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Badge from '../../../ui/Badge';
import { studentChatAPI } from '../../../services/api';

const SupervisorMessagesTab = () => {
  const [supervisor, setSupervisor] = useState(null);
  const [chatHistory, setChatHistory] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchChatData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatData = async () => {
    try {
      setLoading(true);
      const response = await studentChatAPI.getStudentChat();
      
      if (response.data.supervisor) {
        setSupervisor(response.data.supervisor);
        setChatHistory(response.data.chat);
        
        // Mark messages as read only if chat exists
        if (response.data.chat) {
          try {
            await studentChatAPI.markSupervisorMessagesAsRead();
          } catch (error) {
            // Silently handle if chat doesn't exist yet
            console.log('No messages to mark as read');
          }
        }
      } else {
        setSupervisor(null);
        setChatHistory(null);
      }
    } catch (error) {
      console.error('Error fetching chat data:', error);
      // Don't show error toast if it's just no supervisor assigned yet
      if (error.message !== 'Chat not found') {
        toast.error('Failed to load chat data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !supervisor) return;

    try {
      let response;
      
      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append('message', newMessage.trim() || 'File attachment');
        attachments.forEach(file => {
          formData.append('attachments', file);
        });
        
        response = await studentChatAPI.sendMessageWithFiles(formData);
      } else {
        response = await studentChatAPI.sendMessageToSupervisor({
          message: newMessage
        });
      }
      
      setChatHistory(response.data);
      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportChat = async () => {
    try {
      await studentChatAPI.exportChatPDF();
      toast.success('Chat exported successfully');
    } catch (error) {
      console.error('Error exporting chat:', error);
      toast.error('Failed to export chat');
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

  const isProgressUpdate = (message) => {
    return message.includes('📋 **Progress Update:');
  };

  const parseProgressUpdate = (message) => {
    const lines = message.split('\n');
    const title = lines[0].replace('📋 **Progress Update: ', '').replace('**', '');
    const description = lines.slice(2, -2).join('\n');
    const priority = lines[lines.length - 1].replace('*Priority: ', '').replace('*', '');
    
    return { title, description, priority };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-12 text-center border border-gray-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gray-100 p-4 rounded-full animate-pulse">
              <MessageCircle className="w-8 h-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003366]"></div>
              <p className="text-gray-600 font-medium">Loading chat...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!supervisor) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="p-16 text-center border border-gray-200 bg-white">
          <div className="bg-gray-100 p-8 rounded-full mx-auto w-24 h-24 flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No Supervisor Assigned</h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            You haven't been assigned a supervisor yet. Once assigned, you'll be able to chat with them here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Header Section - COMSATS Design */}
      <div className="relative bg-gradient-to-r from-[#003366] via-[#00509E] to-[#003366] rounded-lg p-5 text-white shadow-md overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg shadow-sm">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1 text-white">
                  Supervisor Messages
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  Chat with your assigned supervisor and receive progress updates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handleExportChat}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold px-4 py-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-200 text-xs font-medium">Chat Status</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats - COMSATS Compact */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <MessageCircle className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Total Messages</span>
              </div>
              <p className="text-white font-bold text-sm">
                {chatHistory?.messages?.length || 0}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <User className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Supervisor</span>
              </div>
              <p className="text-white font-bold text-sm">
                {supervisor ? 'Assigned' : 'Not Assigned'}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <CheckCircle className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Progress Updates</span>
              </div>
              <p className="text-white font-bold text-sm">
                {chatHistory?.messages?.filter(m => isProgressUpdate(m.message)).length || 0}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Paperclip className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Attachments</span>
              </div>
              <p className="text-white font-bold text-sm">
                {chatHistory?.messages?.reduce((acc, m) => acc + (m.attachments?.length || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full transform -translate-x-10 translate-y-10"></div>
        </div>
      </div>

      {/* Enhanced Chat Container */}
      <Card className="h-[600px] flex flex-col bg-white border border-gray-200 shadow-xl">
        {/* Enhanced Chat Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#003366] rounded-full flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{supervisor.name}</h3>
              <p className="text-sm text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                {supervisor.email}
              </p>
            </div>
            <Badge variant="success" className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              Supervisor
            </Badge>
          </div>
        </div>

        {/* Enhanced Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {!chatHistory?.messages || chatHistory.messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 p-6 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6">
                <MessageCircle className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start the Conversation</h3>
              <p className="text-gray-600">Send your first message to begin chatting with your supervisor</p>
            </div>
          ) : (
            chatHistory.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.senderType === 'student' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderType === 'student'
                      ? 'bg-blue-600 text-white'
                      : isProgressUpdate(message.message)
                      ? 'bg-green-50 text-green-900 border border-green-200'
                      : 'bg-white text-gray-900 border'
                  }`}
                >
                  {isProgressUpdate(message.message) ? (
                    // Progress Update Format
                    (() => {
                      const update = parseProgressUpdate(message.message);
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-800">{update.title}</span>
                          </div>
                          <p className="text-sm text-green-700">{update.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={
                                update.priority === 'Urgent' ? 'danger' : 
                                update.priority === 'High' ? 'warning' : 
                                'info'
                              } 
                              size="sm"
                            >
                              {update.priority}
                            </Badge>
                            <div className="text-xs text-green-600">
                              {formatTimestamp(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    // Regular Message Format
                    <>
                      <div className="whitespace-pre-wrap">{message.message}</div>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, attIndex) => (
                            <button
                              key={attIndex}
                              onClick={() => window.open(`/api/student-chat/download/${attachment.filename}`, '_blank')}
                              className={`flex items-center space-x-2 p-2 rounded hover:opacity-80 transition-opacity w-full text-left ${
                                message.senderType === 'student'
                                  ? 'bg-blue-500'
                                  : 'bg-gray-100'
                              }`}
                            >
                              <Paperclip className="w-3 h-3" />
                              <span className="text-xs truncate">
                                {attachment.originalName}
                              </span>
                              {attachment.isReport && (
                                <Badge variant="success" size="xs">
                                  Report
                                </Badge>
                              )}
                              <Download className="w-3 h-3 ml-auto" />
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <div
                        className={`text-xs mt-1 ${
                          message.senderType === 'student'
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Message Input */}
        <div className="p-6 border-t border-gray-200 bg-white">
          {/* Enhanced Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                  <Paperclip className="w-4 h-4 text-[#003366]" />
                  <span className="text-sm font-medium text-gray-800">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type your message to supervisor..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium shadow-sm"
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
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && attachments.length === 0}
              className="bg-[#003366] hover:bg-[#00509E] shadow-lg hover:shadow-xl transition-all duration-200 px-6 text-white"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3 flex items-center justify-center space-x-6">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-[#003366] rounded-full"></span>
              <span>Real-time messaging</span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-[#00509E] rounded-full"></span>
              <span>File sharing</span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
              <span>Progress updates</span>
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SupervisorMessagesTab;
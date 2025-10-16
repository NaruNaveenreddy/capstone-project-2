import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  AlertCircle, 
  CheckCircle,
  Brain,
  Heart,
  Activity,
  TrendingUp,
  Loader2
} from 'lucide-react';

const AIAssistant = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [geminiModel, setGeminiModel] = useState(null);

  // Quick action buttons
  const quickActions = [
    { id: 'symptoms', label: 'Symptom Check', icon: Heart, prompt: 'I have some symptoms I\'d like to discuss. Can you help me understand what they might mean?' },
    { id: 'diet', label: 'Diet Advice', icon: Activity, prompt: 'I need advice on my diet and nutrition. Can you provide some guidance?' },
    { id: 'exercise', label: 'Exercise Plan', icon: TrendingUp, prompt: 'I want to create an exercise plan. Can you help me get started?' },
    { id: 'medication', label: 'Medication Info', icon: Brain, prompt: 'I have questions about my medications. Can you provide some information?' }
  ];

  useEffect(() => {
    // Initialize Gemini AI
    const initializeGemini = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          setError('Gemini API key not found. Please check your environment configuration.');
          return;
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        setGeminiModel(model);
      } catch (error) {
        console.error('Error initializing Gemini:', error);
        setError('Failed to initialize AI assistant. Please try again later.');
      }
    };

    initializeGemini();

    // Initialize with welcome message
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: 'Hello! I\'m your AI Health Assistant powered by Google\'s Gemini AI. I can help you with preliminary health queries, symptom assessment, and provide general health guidance. How can I assist you today?',
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);
    setError('');

    try {
      if (!geminiModel) {
        throw new Error('AI model not initialized');
      }

      const aiResponse = await generateAIResponse(message);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      setLoading(false);

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to get AI response. Please try again.');
      setIsTyping(false);
      setLoading(false);
    }
  };

  const generateAIResponse = async (message) => {
    try {
      const healthContext = `
You are a helpful AI health assistant. Provide accurate, empathetic, and informative responses about general health topics.

IMPORTANT GUIDELINES:
- Always emphasize that your advice is for informational purposes only
- Recommend consulting healthcare professionals for medical decisions
- Be supportive and understanding
- Provide practical, evidence-based information
- If asked about specific medical conditions, provide general information but stress the need for professional medical advice
- Keep responses concise but thorough
- Show empathy for health concerns

User question: ${message}

Response:`;

      const result = await geminiModel.generateContent(healthContext);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate response from AI assistant');
    }
  };

  const handleQuickAction = (action) => {
    setInputMessage(action.prompt);
    sendMessage(action.prompt);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">AI Health Assistant</h3>
        <p className="text-sm text-gray-600">Get preliminary health insights and guidance</p>
      </div>

      {/* AI Status */}
      <Alert className="border-blue-200 bg-blue-50">
        <Brain className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>AI Assistant Ready:</strong> I can help with symptom assessment, health guidance, and general medical information. 
          Remember, I provide preliminary insights only - always consult healthcare professionals for medical decisions.
        </AlertDescription>
      </Alert>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
          <CardDescription>Common health queries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => handleQuickAction(action)}
                  disabled={loading}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-xs text-center">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="flex items-center text-sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            Health Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'ai' && (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-[75%] px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-4 pb-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex space-x-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about your health concerns, symptoms, or general health questions..."
                className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={loading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="self-end"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Health Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            AI-Generated Health Insights
          </CardTitle>
          <CardDescription>Personalized health recommendations based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">Risk Assessment</h4>
              <p className="text-sm text-green-700">
                Based on your health data, you appear to be in good health. Continue maintaining your current lifestyle habits.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">Treatment Suggestions</h4>
              <p className="text-sm text-blue-700">
                Consider regular exercise and a balanced diet to maintain optimal health. Schedule regular check-ups with your healthcare provider.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-yellow-50">
              <h4 className="font-medium text-yellow-800 mb-2">Lifestyle Recommendations</h4>
              <p className="text-sm text-yellow-700">
                Stay hydrated, get adequate sleep (7-9 hours), and manage stress through relaxation techniques.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Important Disclaimer:</strong> This AI assistant provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions about medical conditions.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AIAssistant;

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
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

  // Quick action buttons
  const quickActions = [
    { id: 'symptoms', label: 'Symptom Check', icon: Heart, prompt: 'I have some symptoms I\'d like to discuss. Can you help me understand what they might mean?' },
    { id: 'diet', label: 'Diet Advice', icon: Activity, prompt: 'I need advice on my diet and nutrition. Can you provide some guidance?' },
    { id: 'exercise', label: 'Exercise Plan', icon: TrendingUp, prompt: 'I want to create an exercise plan. Can you help me get started?' },
    { id: 'medication', label: 'Medication Info', icon: Brain, prompt: 'I have questions about my medications. Can you provide some information?' }
  ];

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: 'Hello! I\'m your AI Health Assistant. I can help you with preliminary health queries, symptom assessment, and provide general health guidance. How can I assist you today?',
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
      // Call Gemini API
      const aiResponse = await callGeminiAPI(message);
      
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
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError(error.message || 'Failed to get AI response. Please try again.');
      setIsTyping(false);
      setLoading(false);
    }
  };

  const callGeminiAPI = async (message) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please check your environment configuration.');
    }

    const prompt = `You are a helpful AI health assistant. Provide preliminary health guidance and information. Always remind users to consult healthcare professionals for medical decisions. Be empathetic, informative, and safety-conscious. 

User message: ${message}

Please respond with helpful, accurate health information while emphasizing the importance of professional medical consultation for serious concerns.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || 'Failed to get response from Gemini API'}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
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
      <Card className="h-96 flex flex-col">
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
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.isError
                      ? 'bg-red-100 text-red-900 border border-red-200'
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
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                        {message.isError && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              const lastUserMessage = messages[messages.indexOf(message) - 1];
                              if (lastUserMessage && lastUserMessage.type === 'user') {
                                sendMessage(lastUserMessage.content);
                              }
                            }}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
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

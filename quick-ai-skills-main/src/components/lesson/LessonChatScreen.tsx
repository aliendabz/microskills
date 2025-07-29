import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Volume2, Lightbulb, Zap, ArrowLeft } from "lucide-react";
import { QuickActionToolbar } from "./QuickActionToolbar";
import { TypingAnimation } from '@/components/ui/typing-animation';
import { ChatBubbleSkeleton } from '@/components/ui/loading-skeleton';
import { useAnalytics, ANALYTICS_EVENTS } from '@/hooks/useAnalytics';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ChatMessage {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  isCode?: boolean;
  quickReplies?: string[];
}

interface LessonChatScreenProps {
  lessonId: string;
  lessonTitle: string;
  stepNumber: number;
  totalSteps: number;
  onComplete?: () => void;
  onBack?: () => void;
}

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    type: "ai",
    content: "Welcome to your AI lesson! Today we'll explore prompt engineering fundamentals. Ready to dive in?",
    timestamp: new Date(),
    quickReplies: ["Let's start!", "Tell me more", "I'm ready"]
  }
];

export const LessonChatScreen = ({ 
  lessonId, 
  lessonTitle, 
  stepNumber, 
  totalSteps,
  onComplete,
  onBack 
}: LessonChatScreenProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lessonProgress, setLessonProgress] = useLocalStorage('lesson_progress', {});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { track } = useAnalytics();

  // Track lesson started
  useEffect(() => {
    track(ANALYTICS_EVENTS.LESSON_STARTED, { lessonId });
  }, [track, lessonId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Save progress
    setLessonProgress((prev: any) => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        lastMessage: content,
        timestamp: new Date().toISOString(),
        stepNumber,
      }
    }));

    // Simulate AI response with typing
    setTimeout(() => {
      const responses = [
        "Great question! Let me break that down for you. Prompt engineering is about crafting effective instructions for AI models...",
        "That's an excellent observation! Here's how we can build on that idea...",
        "Perfect! You're really getting the hang of this. Let's try something more advanced...",
      ];
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        quickReplies: stepNumber < totalSteps ? ["Continue", "Example please", "Got it!"] : undefined
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      if (stepNumber >= totalSteps) {
        setTimeout(() => onComplete?.(), 1000);
      }
    }, 1500);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleToneSwitch = (newTone: string) => {
    track(ANALYTICS_EVENTS.TONE_SWITCHED, { 
      newTone,
      lessonId 
    });
    
    // Show immediate feedback
    const toneMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "ai",
      content: `Great! I've switched to a ${newTone} tone. Let's continue with this style.`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, toneMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className="font-semibold text-lg text-foreground">{lessonTitle}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Step {stepNumber} of {totalSteps}
                  </Badge>
                  <div className="flex gap-1">
                    {Array.from({ length: totalSteps }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < stepNumber ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Lightbulb className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-bubble-pop`}
              >
                <div className={`flex items-start gap-3 max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "ai" ? "bg-gradient-primary" : "bg-user-bubble"
                  }`}>
                    {message.type === "ai" ? (
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <User className="w-4 h-4 text-foreground" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Card className={`${
                      message.type === "ai" 
                        ? "bg-lesson-bubble text-primary-foreground shadow-glow" 
                        : "bg-user-bubble"
                    }`}>
                      <CardContent className="p-3">
                        {message.type === "ai" ? (
                          <TypingAnimation 
                            text={message.content} 
                            speed={30}
                            className="text-sm leading-relaxed"
                          />
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                      </CardContent>
                    </Card>
                    
                    {message.quickReplies && message.type === "ai" && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.quickReplies.map((reply, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs transition-smooth hover:bg-primary hover:text-primary-foreground"
                            onClick={() => handleQuickReply(reply)}
                          >
                            {reply}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && <ChatBubbleSkeleton />}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <QuickActionToolbar onToneSwitch={handleToneSwitch} />

      {/* Input Area */}
      <div className="border-t bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your response..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
              className="bg-gradient-primary border-0 text-primary-foreground hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
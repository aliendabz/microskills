import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Editor from "@monaco-editor/react";
import { Play, Save, RotateCcw, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectSubmission {
  id: string;
  code: string;
  language: string;
  timestamp: Date;
  score?: number;
  feedback?: string;
  status: "pending" | "graded" | "error";
}

interface MiniProjectSandboxProps {
  projectId: string;
  title: string;
  description: string;
  initialCode?: string;
  language?: string;
  expectedOutput?: string;
  onSubmit?: (submission: ProjectSubmission) => void;
}

const defaultCode = {
  javascript: `// Write a function that uses AI prompt engineering
function createPrompt(context, task, tone = 'professional') {
  // Your code here
  return \`As a \${tone} assistant, \${context}. Please \${task}.\`;
}

// Test your function
console.log(createPrompt(
  "you are helping a developer", 
  "explain async/await in simple terms"
));`,
  python: `# Write a function that uses AI prompt engineering
def create_prompt(context, task, tone='professional'):
    """Create an effective AI prompt"""
    # Your code here
    return f"As a {tone} assistant, {context}. Please {task}."

# Test your function
print(create_prompt(
    "you are helping a developer", 
    "explain async/await in simple terms"
))`,
  html: `<!DOCTYPE html>
<html>
<head>
    <title>AI Chat Interface</title>
    <style>
        /* Style your chat interface */
        .chat-container { 
            max-width: 600px; 
            margin: 20px auto; 
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <h1>AI Assistant</h1>
        <!-- Build your chat interface here -->
    </div>
</body>
</html>`
};

export const MiniProjectSandbox = ({
  projectId,
  title,
  description,
  initialCode,
  language = "javascript",
  expectedOutput,
  onSubmit
}: MiniProjectSandboxProps) => {
  const [code, setCode] = useState(initialCode || defaultCode[language as keyof typeof defaultCode] || "");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [activeTab, setActiveTab] = useState("code");
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true
    });
  };

  const runCode = async () => {
    setIsRunning(true);
    setActiveTab("output");
    
    try {
      // Simulate code execution
      setTimeout(() => {
        if (language === "javascript") {
          // Mock JavaScript execution
          setOutput("As a professional assistant, you are helping a developer. Please explain async/await in simple terms.");
        } else if (language === "python") {
          setOutput("As a professional assistant, you are helping a developer. Please explain async/await in simple terms.");
        } else {
          setOutput("HTML preview would be rendered here in a real environment.");
        }
        setIsRunning(false);
      }, 1000);
    } catch (error) {
      setOutput(`Error: ${error}`);
      setIsRunning(false);
    }
  };

  const submitProject = async () => {
    const newSubmission: ProjectSubmission = {
      id: Date.now().toString(),
      code,
      language,
      timestamp: new Date(),
      status: "pending"
    };

    setSubmission(newSubmission);
    
    // Simulate auto-grading with LLM
    setTimeout(() => {
      const gradedSubmission: ProjectSubmission = {
        ...newSubmission,
        status: "graded",
        score: Math.floor(Math.random() * 30) + 70, // 70-100
        feedback: "Good work! Your prompt structure is clear and follows best practices. Consider adding more specific context for even better results."
      };
      
      setSubmission(gradedSubmission);
      onSubmit?.(gradedSubmission);
      
      toast({
        title: "Project Submitted!",
        description: `Score: ${gradedSubmission.score}/100`,
      });
    }, 3000);
  };

  const resetCode = () => {
    setCode(defaultCode[language as keyof typeof defaultCode] || "");
    setOutput("");
    setSubmission(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case "graded":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "error":
        return <XCircle className="w-4 h-4 text-error" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{language}</Badge>
              {submission && (
                <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
                  {getStatusIcon(submission.status)}
                  <span className="ml-1">
                    {submission.status === "graded" && submission.score ? `${submission.score}/100` : submission.status}
                  </span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-muted/30">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Code Editor</span>
                <Badge variant="outline" className="text-xs">{language}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={resetCode}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <Button variant="ghost" size="sm">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                lineNumbers: "on",
                glyphMargin: false,
                folding: false,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3
              }}
            />
          </div>

          <div className="border-t bg-card/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button onClick={runCode} disabled={isRunning} className="bg-gradient-primary border-0 text-primary-foreground">
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? "Running..." : "Run Code"}
                </Button>
                <Button 
                  onClick={submitProject} 
                  disabled={!code.trim() || submission?.status === "pending"}
                  variant="outline"
                  className="transition-smooth hover:border-primary"
                >
                  {submission?.status === "pending" ? "Submitting..." : "Submit Project"}
                </Button>
              </div>
              {expectedOutput && (
                <div className="text-sm text-muted-foreground">
                  Expected output available in instructions
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Output & Instructions */}
        <div className="w-1/3 border-l bg-card/20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-2">
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="instructions" className="h-full m-0 p-4 overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Project Goal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Create a function that demonstrates prompt engineering best practices.
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Requirements:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Include context parameter</li>
                        <li>Accept task specification</li>
                        <li>Support tone customization</li>
                        <li>Return well-structured prompt</li>
                      </ul>
                    </div>
                    {expectedOutput && (
                      <Alert>
                        <AlertDescription className="text-xs">
                          <strong>Expected:</strong> {expectedOutput}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="output" className="h-full m-0 p-4 overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isRunning ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        Running code...
                      </div>
                    ) : (
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
                        {output || "Click 'Run Code' to see output"}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="feedback" className="h-full m-0 p-4 overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">AI Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {submission ? (
                      <div className="space-y-3">
                        {submission.status === "pending" && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 animate-spin" />
                            Grading in progress...
                          </div>
                        )}
                        {submission.status === "graded" && (
                          <>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-gradient-primary">
                                Score: {submission.score}/100
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {submission.feedback}
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Submit your project to receive AI-powered feedback and scoring.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
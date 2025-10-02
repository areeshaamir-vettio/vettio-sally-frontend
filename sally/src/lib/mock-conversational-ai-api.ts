import {
  ChatMessage,
  ConversationSession,
  SendMessageRequest,
  SendMessageResponse,
  JobDescriptionRoadmap,
  RoadmapStep,
  UpdateRoadmapStepRequest,
  PauseSessionRequest
} from '@/types/conversational-ai';

// Mock data
const mockRoadmapSteps: RoadmapStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    title: 'Basic Information',
    status: 'completed',
    description: 'Job title, department, and basic details',
    completedAt: '2024-10-01T10:00:00Z'
  },
  {
    id: 'step-2',
    stepNumber: 2,
    title: 'Role Purpose & Objectives',
    status: 'completed',
    description: 'Define the main purpose and objectives of the role',
    completedAt: '2024-10-01T11:00:00Z'
  },
  {
    id: 'step-3',
    stepNumber: 3,
    title: 'Key Responsibilities',
    status: 'in-progress',
    description: 'List the main responsibilities and duties'
  },
  {
    id: 'step-4',
    stepNumber: 4,
    title: 'Skills & Qualifications',
    status: 'pending',
    description: 'Required and preferred qualifications'
  },
  {
    id: 'step-5',
    stepNumber: 5,
    title: 'Role Context',
    status: 'pending',
    description: 'Team structure and reporting relationships'
  },
  {
    id: 'step-6',
    stepNumber: 6,
    title: 'Performance & KPIs',
    status: 'pending',
    description: 'Key performance indicators and success metrics'
  },
  {
    id: 'step-7',
    stepNumber: 7,
    title: 'Compensation & Benefits',
    status: 'pending',
    description: 'Salary range and benefits package'
  },
  {
    id: 'step-8',
    stepNumber: 8,
    title: 'Culture and Value Fit',
    status: 'pending',
    description: 'Company culture and values alignment'
  },
  {
    id: 'step-9',
    stepNumber: 9,
    title: 'Hiring Practicalities',
    status: 'pending',
    description: 'Timeline, process, and logistics'
  },
  {
    id: 'step-10',
    stepNumber: 10,
    title: 'Approval & Notes',
    status: 'pending',
    description: 'Final review and approval process'
  }
];

const mockRoadmap: JobDescriptionRoadmap = {
  id: 'roadmap-1',
  title: 'JD Building Roadmap',
  steps: mockRoadmapSteps,
  overallProgress: 20, // 2 out of 10 completed
  currentStep: 3,
  createdAt: '2024-10-01T09:00:00Z',
  updatedAt: '2024-10-02T14:00:00Z'
};

const mockSession: ConversationSession = {
  id: 'session-1',
  title: 'Job Description Building',
  messages: [
    {
      id: 'msg-1',
      content: 'Hello! I\'m here to help you build a comprehensive job description. I see we\'ve already covered the basic information and role objectives. Let\'s continue with the key responsibilities. What are the main tasks this person will be responsible for?',
      role: 'assistant',
      timestamp: '2024-10-02T14:00:00Z'
    }
  ],
  createdAt: '2024-10-01T09:00:00Z',
  updatedAt: '2024-10-02T14:00:00Z',
  status: 'active'
};

// AI response templates
const aiResponses = [
  "That's a great point! Let me help you refine that responsibility. Can you provide more details about the specific tasks involved?",
  "Excellent! I've noted that responsibility. What about the technical requirements for this role?",
  "Perfect! That gives me a clear picture. Let's move on to the next aspect. How would you describe the ideal candidate's experience level?",
  "Great insight! I'll add that to our job description. Are there any specific tools or technologies they should be familiar with?",
  "That's very helpful! Let me summarize what we have so far and suggest some additional responsibilities that might be relevant.",
  "Wonderful! I can see this role taking shape. What about the soft skills that would be important for success in this position?"
];

export const mockConversationalAiApi = {
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: data.content,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    // Generate AI response
    const aiResponse: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      role: 'assistant',
      timestamp: new Date().toISOString()
    };

    // Update session
    const updatedSession: ConversationSession = {
      ...mockSession,
      messages: [...mockSession.messages, userMessage, aiResponse],
      updatedAt: new Date().toISOString()
    };

    return {
      message: aiResponse,
      session: updatedSession
    };
  },

  async getSession(sessionId: string): Promise<ConversationSession> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSession;
  },

  async getRoadmap(roadmapId: string): Promise<JobDescriptionRoadmap> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRoadmap;
  },

  async updateRoadmapStep(data: UpdateRoadmapStepRequest): Promise<JobDescriptionRoadmap> {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update the step status
    const updatedSteps = mockRoadmap.steps.map(step =>
      step.id === data.stepId
        ? {
            ...step,
            status: data.status,
            completedAt: data.status === 'completed' ? new Date().toISOString() : undefined
          }
        : step
    );

    // Calculate new progress
    const completedSteps = updatedSteps.filter(step => step.status === 'completed').length;
    const overallProgress = Math.round((completedSteps / updatedSteps.length) * 100);

    return {
      ...mockRoadmap,
      steps: updatedSteps,
      overallProgress,
      updatedAt: new Date().toISOString()
    };
  },

  async pauseSession(data: PauseSessionRequest): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'Session paused successfully. You can resume anytime from where you left off.'
    };
  }
};

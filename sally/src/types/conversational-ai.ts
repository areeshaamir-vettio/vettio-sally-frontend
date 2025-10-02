export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  isTyping?: boolean;
}

export interface ConversationSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'paused' | 'completed';
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  session: ConversationSession;
}

export interface RoadmapStep {
  id: string;
  stepNumber: number;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  description?: string;
  completedAt?: string;
}

export interface JobDescriptionRoadmap {
  id: string;
  title: string;
  steps: RoadmapStep[];
  overallProgress: number;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRoadmapStepRequest {
  roadmapId: string;
  stepId: string;
  status: 'completed' | 'in-progress' | 'pending';
}

export interface PauseSessionRequest {
  sessionId: string;
  roadmapId: string;
}

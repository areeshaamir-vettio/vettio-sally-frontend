export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  isTyping?: boolean;
  metadata?: Record<string, unknown>; // Added for API compatibility
}

export interface ConversationSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'paused' | 'completed';
  roleId?: string; // Added for role enhancement integration
  conversationType?: string; // Added for conversation type tracking
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

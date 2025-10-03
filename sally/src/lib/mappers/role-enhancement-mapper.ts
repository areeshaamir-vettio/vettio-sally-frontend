// Mappers to transform Role Enhancement API responses to component-friendly formats

import {
  RoleData,
  ConversationData,
  ConversationMessage,
  SECTION_METADATA,
  SectionKey,
  RoleEnhancementResponse,
} from '@/types/role-enhancement';
import {
  RoadmapStep,
  JobDescriptionRoadmap,
  ConversationSession,
  ChatMessage,
} from '@/types/conversational-ai';

// ============================================================================
// ROLE TO ROADMAP MAPPING
// ============================================================================

/**
 * Maps a role section status to roadmap step status
 */
function mapSectionStatusToStepStatus(
  isComplete: boolean,
  currentSection: string,
  sectionKey: string
): RoadmapStep['status'] {
  if (isComplete) {
    return 'completed';
  }
  if (currentSection === sectionKey) {
    return 'in-progress';
  }
  return 'pending';
}

/**
 * Converts role data sections to roadmap steps
 */
export function mapRoleToRoadmap(
  roleData: RoleData,
  roadmapId: string = 'roadmap-1'
): JobDescriptionRoadmap {
  const sectionKeys = Object.keys(SECTION_METADATA) as SectionKey[];
  
  const steps: RoadmapStep[] = sectionKeys.map((sectionKey) => {
    const section = roleData[sectionKey];
    const metadata = SECTION_METADATA[sectionKey];
    
    return {
      id: `step-${metadata.stepNumber}`,
      stepNumber: metadata.stepNumber,
      title: metadata.title,
      status: mapSectionStatusToStepStatus(
        section.is_complete,
        roleData.current_section,
        sectionKey
      ),
      description: metadata.description,
      completedAt: section.is_complete ? new Date().toISOString() : undefined,
    };
  });

  // Calculate current step number
  const currentStep = steps.find((step) => step.status === 'in-progress')?.stepNumber || 1;

  return {
    id: roadmapId,
    title: 'JD Building Roadmap',
    steps,
    overallProgress: roleData.overall_completion,
    currentStep,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// CONVERSATION TO SESSION MAPPING
// ============================================================================

/**
 * Maps a conversation message to a chat message
 */
export function mapMessageToChat(message: ConversationMessage): ChatMessage {
  return {
    id: message.id,
    content: message.content,
    role: message.role,
    timestamp: message.timestamp,
    isTyping: false,
  };
}

/**
 * Converts conversation data to conversation session
 */
export function mapConversationToSession(
  conversationData: ConversationData
): ConversationSession {
  return {
    id: conversationData.id || conversationData.session_id,
    title: 'Job Description Building',
    messages: conversationData.messages.map(mapMessageToChat),
    createdAt: conversationData.created_at,
    updatedAt: conversationData.last_activity,
    status: conversationData.status,
  };
}

// ============================================================================
// COMPLETE RESPONSE MAPPING
// ============================================================================

/**
 * Maps the complete API response to component-friendly formats
 */
export function mapRoleEnhancementResponse(response: RoleEnhancementResponse) {
  return {
    roadmap: mapRoleToRoadmap(response.role),
    session: mapConversationToSession(response.conversation),
    nextQuestion: response.next_question,
    completenessScore: response.completeness_score,
    isComplete: response.is_complete,
    roleData: response.role,
    conversationData: response.conversation,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets the current section metadata
 */
export function getCurrentSectionMetadata(currentSection: string) {
  return SECTION_METADATA[currentSection as SectionKey] || SECTION_METADATA.basic_information;
}

/**
 * Calculates overall progress percentage
 */
export function calculateProgress(roleData: RoleData): number {
  const sectionKeys = Object.keys(SECTION_METADATA) as SectionKey[];
  const completedSections = sectionKeys.filter(
    (key) => roleData[key].is_complete
  ).length;
  
  return Math.round((completedSections / sectionKeys.length) * 100);
}

/**
 * Gets section completion summary
 */
export function getSectionsSummary(roleData: RoleData): Record<string, boolean> {
  const sectionKeys = Object.keys(SECTION_METADATA) as SectionKey[];
  const summary: Record<string, boolean> = {};
  
  sectionKeys.forEach((key) => {
    summary[key] = roleData[key].is_complete;
  });
  
  return summary;
}


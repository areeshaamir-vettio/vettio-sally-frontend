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
 * Updated to handle new API structure with completed_sections array
 */
function mapSectionStatusToStepStatus(
  completedSections: string[],
  currentSection: string,
  sectionKey: string
): RoadmapStep['status'] {
  // Check if section is in completed_sections array
  if (completedSections.includes(sectionKey)) {
    return 'completed';
  }
  // Check if this is the current section
  if (currentSection === sectionKey) {
    return 'in-progress';
  }
  // Otherwise it's pending
  return 'pending';
}

/**
 * Converts role data sections to roadmap steps
 * Updated to handle new API structure with completed_sections array
 */
export function mapRoleToRoadmap(
  roleData: RoleData,
  roadmapId: string = 'roadmap-1'
): JobDescriptionRoadmap {
  const sectionKeys = Object.keys(SECTION_METADATA) as SectionKey[];

  // Get completed sections array from new API structure
  const completedSections = roleData.completed_sections || [];
  const currentSection = roleData.current_section || 'basic_information';

  const steps: RoadmapStep[] = sectionKeys.map((sectionKey) => {
    const metadata = SECTION_METADATA[sectionKey];
    const isComplete = completedSections.includes(sectionKey);

    return {
      id: `step-${metadata.stepNumber}`,
      stepNumber: metadata.stepNumber,
      title: metadata.title,
      status: mapSectionStatusToStepStatus(
        completedSections,
        currentSection,
        sectionKey
      ),
      description: metadata.description,
      completedAt: isComplete ? new Date().toISOString() : undefined,
    };
  });

  // Calculate current step number
  const currentStep = steps.find((step) => step.status === 'in-progress')?.stepNumber || 1;

  // Calculate overall progress based on completed sections count
  const overallProgress = Math.round((completedSections.length / sectionKeys.length) * 100);

  return {
    id: roadmapId,
    title: 'JD Building Roadmap',
    steps,
    overallProgress,
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
 * Updated to use new API structure with completed_sections array
 */
export function calculateProgress(roleData: RoleData): number {
  const sectionKeys = Object.keys(SECTION_METADATA) as SectionKey[];
  const completedSections = roleData.completed_sections || [];

  return Math.round((completedSections.length / sectionKeys.length) * 100);
}

/**
 * Gets section completion summary
 * Updated to use new API structure with completed_sections array
 */
export function getSectionsSummary(roleData: RoleData): Record<string, boolean> {
  const sectionKeys = Object.keys(SECTION_METADATA) as SectionKey[];
  const completedSections = roleData.completed_sections || [];
  const summary: Record<string, boolean> = {};

  sectionKeys.forEach((key) => {
    summary[key] = completedSections.includes(key);
  });

  return summary;
}


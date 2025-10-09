// Test file for Role Candidates API Integration
// This file can be used to manually test the API integration

import { apiClient } from '@/lib/api-client';
import { RoleCandidatesResponse } from '@/types/candidates';

/**
 * Test function to verify the role candidates API integration
 * This function can be called from the browser console for testing
 */
export async function testRoleCandidatesAPI() {
  console.log('🧪 Testing Role Candidates API Integration...');

  // Test scenarios
  const testScenarios = [
    {
      name: 'Valid Role ID with default options',
      roleId: 'test-role-123',
      options: {}
    },
    {
      name: 'Valid Role ID with limit',
      roleId: 'test-role-123',
      options: { limit: 10 }
    },
    {
      name: 'Invalid Role ID',
      roleId: 'invalid-role-id',
      options: {}
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log(`   Role ID: ${scenario.roleId}`);
    console.log(`   Options:`, scenario.options);

    try {
      const startTime = Date.now();
      const response: RoleCandidatesResponse = await apiClient.getRoleCandidates(
        scenario.roleId, 
        scenario.options
      );
      const endTime = Date.now();

      console.log(`✅ Success (${endTime - startTime}ms):`, {
        roleId: response.role_id,
        candidateCount: response.candidates.length,
        totalCount: response.total_count,
        hasMore: response.metadata.has_more,
        limitApplied: response.metadata.limit_applied
      });

      // Log first candidate for verification
      if (response.candidates.length > 0) {
        const firstCandidate = response.candidates[0];
        console.log(`   First candidate:`, {
          id: firstCandidate.id,
          name: firstCandidate.name,
          email: firstCandidate.contact_info?.email,
          headline: firstCandidate.professional_summary?.headline
        });
      }

    } catch (error) {
      console.error(`❌ Error:`, error);
      
      if (error instanceof Error) {
        console.error(`   Message: ${error.message}`);
      }
    }
  }

  console.log('\n🏁 Role Candidates API testing completed!');
}

/**
 * Test function for the useRoleCandidates hook
 * This simulates how the hook would be used in a React component
 */
export function testHookUsage() {
  console.log('🪝 Testing useRoleCandidates hook usage pattern...');
  
  // This would be used in a React component like:
  /*
  const { 
    candidates, 
    loading, 
    error, 
    totalCount, 
    hasMore, 
    refetch 
  } = useRoleCandidates('role-123', { limit: 50 });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Candidates ({totalCount} total)</h2>
      {candidates.map(candidate => (
        <div key={candidate.id}>
          <h3>{candidate.name}</h3>
          <p>{candidate.professional_summary?.headline}</p>
        </div>
      ))}
      {hasMore && <button onClick={refetch}>Load More</button>}
    </div>
  );
  */
  
  console.log('✅ Hook usage pattern documented above');
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testRoleCandidatesAPI = testRoleCandidatesAPI;
  (window as any).testHookUsage = testHookUsage;
}

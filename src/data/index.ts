
export { 
  type Business,
  getBusinessBySlug,
  getBusinessesByCity,
  getRecentBusinesses,
  getUpgradedBusinesses
} from './businesses';
export { auditors, getAuditorBySlug, getAuditorById } from './auditors';

// Helper function to get businesses by auditor
export const getBusinessesByAuditor = (auditorId: string) => {
  // This is a mock function that would need to be implemented with actual data
  return [];
};


export { businesses, getBusinessBySlug, getBusinessesByCity, getRecentBusinesses, getUpgradedBusinesses } from './businesses';
export { auditors, getAuditorBySlug, getAuditorById } from './auditors';

// Helper function to get businesses by auditor
export const getBusinessesByAuditor = (auditorId: string) => {
  const { businesses } = require('./businesses');
  return businesses.filter(business => business.auditorId === auditorId);
};

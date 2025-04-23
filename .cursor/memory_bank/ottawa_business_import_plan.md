
# Ottawa Business Import Implementation Plan

## Overview
This plan outlines the process for importing approximately 8,000 Ottawa businesses from a spreadsheet into the Local Web Insights Canada platform and assigning performance grades to make the data immediately useful in the dashboard.

## Implementation Phases

### Phase 1: Data Preparation & Mapping
- [ ] Review spreadsheet structure and determine field mappings
  - [ ] Map spreadsheet columns to database schema
  - [ ] Identify required vs. optional fields
  - [ ] Document any data transformations needed
- [ ] Data cleansing
  - [ ] Normalize address formats
  - [ ] Format phone numbers consistently
  - [ ] Validate website URLs
  - [ ] Handle duplicate entries
- [ ] Create mapping document with field transformations

### Phase 2: Import Script Development
- [ ] Develop import utility script
  - [ ] CSV/Excel parsing functionality
  - [ ] Data transformation pipeline
  - [ ] Batch processing (500-1000 records per batch)
  - [ ] Error handling and logging
- [ ] Testing
  - [ ] Test with sample data subset
  - [ ] Verify integrity of transformed data
  - [ ] Optimize for performance

### Phase 3: Database Import Process
- [ ] Create scraper_run record to track the bulk import
- [ ] Insert business records in batches
  - [ ] Generate UUIDs for each business
  - [ ] Set default values for required fields
  - [ ] Track import progress
- [ ] Create raw_business_data entries linking to source
- [ ] Update geo_grids for Ottawa region

### Phase 4: Initial Scoring System
- [ ] Develop initial scoring algorithm based on available data
  - [ ] Website availability check
  - [ ] Domain age assessment
  - [ ] Mobile-friendliness heuristics
  - [ ] Implement simplified performance grade (A-F)
- [ ] Apply initial scoring to imported businesses
  - [ ] Update scores field in businesses table
  - [ ] Set placeholder values for missing metrics

### Phase 5: Post-Import Analysis
- [ ] Generate category insights
  - [ ] Business distribution by category
  - [ ] Identify top categories in Ottawa
- [ ] Create geographic insights
  - [ ] Business density by neighborhood
  - [ ] Coverage statistics for Ottawa region
- [ ] Prepare comparison benchmarks
  - [ ] Average scores by category
  - [ ] Industry standards for Ottawa businesses

### Phase 6: Integration with Dashboard
- [ ] Verify data visibility in dashboard
- [ ] Implement filtering and search capabilities
- [ ] Create initial reports and visualizations
- [ ] Set up dashboard views for Ottawa businesses

## Performance Grading System

### Grading Methodology
1. **Initial Grade Assignment**:
   - Website Availability: +30 points if active website
   - Domain Quality: +0-20 points based on domain age, TLD
   - Mobile Optimization: +0-20 points based on mobile compatibility
   - Business Completeness: +0-30 points based on data completeness

2. **Grading Scale**:
   - A: 90-100 points
   - B: 80-89 points
   - C: 70-79 points
   - D: 60-69 points
   - F: <60 points

3. **Future Refinement**:
   After initial import, the grading system will be enhanced with:
   - Lighthouse audits for detailed performance metrics
   - SEO analysis
   - Accessibility scoring
   - Best practices assessment

## Implementation Timeline

| Phase | Description | Estimated Duration |
|-------|-------------|-------------------|
| 1 | Data Preparation & Mapping | 2-3 days |
| 2 | Import Script Development | 3-5 days |
| 3 | Database Import Process | 1-2 days |
| 4 | Initial Scoring System | 2-3 days |
| 5 | Post-Import Analysis | 2-3 days |
| 6 | Dashboard Integration | 1-2 days |

## Technical Requirements

1. **Tools & Libraries**:
   - CSV/Excel parsing library
   - Batch processing capability
   - Data validation utilities
   - Website availability checker

2. **Database Considerations**:
   - Index optimization for large data import
   - Performance monitoring during bulk operations
   - Storage requirements for 8k+ business records

## Next Steps

1. Request sample of spreadsheet data (first 10-20 rows)
2. Review database schema to confirm field mappings
3. Create detailed data transformation specifications
4. Develop and test initial import script with sample data


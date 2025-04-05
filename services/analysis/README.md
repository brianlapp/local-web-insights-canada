# Local Web Insights Analysis Service

This service provides data analysis, aggregation, and reporting capabilities for the Local Web Insights Canada platform. It processes raw business and website audit data collected by the scraper service to produce actionable insights and reports.

## Features

- **Geographic Analysis**: Analyze business distribution, density, and performance metrics across cities and regions
- **Category Analysis**: Compare performance metrics across business categories to identify patterns and benchmarks
- **Business Comparison**: Generate competitive insights by comparing businesses against category averages
- **Trends Analysis**: Track performance changes over time for businesses and categories
- **Automated Reports**: Schedule regular report generation for cities, categories, and top performers
- **API Access**: RESTful API for requesting and accessing analysis results

## Directory Structure

```
services/analysis/
├── src/
│   ├── aggregators/         # Data aggregation modules
│   │   ├── geographicInsights.ts   # Location-based analysis
│   │   ├── categoryAnalysis.ts     # Category performance analysis
│   │   └── businessComparison.ts   # Business vs. competitors analysis
│   ├── models/              # Type definitions
│   │   └── types.ts         # Data type interfaces
│   ├── processors/          # Job processors
│   │   └── reportProcessor.ts  # Report generation processor
│   ├── reports/             # Report generation
│   │   └── reportGenerator.ts  # Report builder utilities
│   ├── utils/               # Shared utilities
│   │   └── database.ts      # Database connection and queries
│   └── index.ts             # Application entry point
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # Documentation
```

## Key Components

### Data Aggregators

- **Geographic Insights**: Calculates business density, performance heatmaps, and regional analysis
- **Category Analysis**: Identifies top/struggling categories, performance benchmarks, and common issues
- **Business Comparison**: Ranks businesses against peers, identifies strengths/weaknesses

### Report Generator

Transforms analysis data into structured reports with:
- Comprehensive data sections
- Chart configurations for visualizations
- Metadata for filtering and organization

### Report Processor

Manages the execution of report generation through:
- Job queue for asynchronous processing
- Scheduled report generation (daily, weekly, monthly)
- Progress tracking and error handling

## API Endpoints

- `GET /api/reports`: Retrieve saved reports with optional filtering
- `POST /api/reports/generate`: Request a new report generation
- `GET /api/reports/status/:jobId`: Check status of a report generation job

## Report Types

1. **City Reports**: Performance overview for all businesses in a city
2. **Category Reports**: Detailed analysis of businesses within a specific category
3. **Business Reports**: Individual business analysis with competitor comparison
4. **Comparison Reports**: Side-by-side comparison of multiple businesses

## Getting Started

### Prerequisites

- Node.js 14+
- Redis (for job queue)
- Supabase account (database)

### Installation

1. Clone the repository
2. Navigate to the analysis service directory:
   ```
   cd services/analysis
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file with the required environment variables:
   ```
   PORT=3001
   REDIS_URL=redis://localhost:6379
   SUPABASE_URL=your_supabase_url
   SUPABASE_API_KEY=your_supabase_key
   ```
5. Start the service:
   ```
   npm run dev
   ```

### Using the Service

1. **View Available Reports**:
   ```
   GET /api/reports?type=city&limit=5
   ```

2. **Generate a New Report**:
   ```
   POST /api/reports/generate
   {
     "report_type": "city",
     "parameters": {
       "city": "Ottawa",
       "options": {
         "includeCategories": true,
         "includeGeographic": true
       }
     }
   }
   ```

3. **Check Report Generation Status**:
   ```
   GET /api/reports/status/123
   ```

## Integration with Frontend

The analysis service provides the data needed for the frontend dashboard, including:

- Map visualizations of business density and performance
- Comparative charts for business categories
- Individual business performance cards
- City and regional statistics

## Scheduled Reports

- **Daily City Reports**: Generated at 1:00 AM for all cities
- **Weekly Category Reports**: Generated every Monday at 2:00 AM
- **Monthly Top Performers**: Generated on the 1st of each month at 3:00 AM 
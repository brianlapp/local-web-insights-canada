import express from 'express';
import Queue from 'bull';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { 
  processReportJob, 
  generateDailySummaryReports,
  generateWeeklyCategoryReports,
  generateTopPerformersReport
} from './processors/reportProcessor';
import { ReportJobData } from './processors/reportProcessor';
import { fetchReports } from './utils/database';

// Initialize environment variables
dotenv.config();

// Set up Express server
const app = express();
app.use(express.json());

// Configure Redis connection for Bull
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Bull queue
const reportQueue = new Queue<ReportJobData>('report-generation', REDIS_URL);

// Set up queue processor
reportQueue.process(async (job) => {
  return await processReportJob(job);
});

// API Routes

// Get reports
app.get('/api/reports', async (req, res) => {
  try {
    const reportType = req.query.type as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const reports = await fetchReports({
      report_type: reportType,
      limit
    });
    
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
});

// Request a new report generation
app.post('/api/reports/generate', async (req, res) => {
  try {
    const jobData: ReportJobData = req.body;
    
    // Validate required parameters based on report type
    if (!jobData.report_type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Report type is required' 
      });
    }
    
    // Create job in queue
    const job = await reportQueue.add(jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Report generation scheduled', 
      jobId: job.id 
    });
  } catch (error) {
    console.error('Error scheduling report:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to schedule report generation' 
    });
  }
});

// Check status of a report generation job
app.get('/api/reports/status/:jobId', async (req, res) => {
  try {
    const job = await reportQueue.getJob(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        error: 'Job not found' 
      });
    }
    
    const state = await job.getState();
    const progress = job._progress;
    
    res.json({
      success: true,
      job: {
        id: job.id,
        state,
        progress,
        data: job.data,
        createdAt: job.timestamp
      }
    });
  } catch (error) {
    console.error('Error fetching job status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch job status' 
    });
  }
});

// Schedule periodic report generation

// Daily city reports (at 1:00 AM)
cron.schedule('0 1 * * *', async () => {
  console.log('Generating daily city reports...');
  try {
    const reports = await generateDailySummaryReports();
    console.log(`Generated ${reports.length} daily city reports.`);
  } catch (error) {
    console.error('Error generating daily reports:', error);
  }
});

// Weekly category reports (every Monday at 2:00 AM)
cron.schedule('0 2 * * 1', async () => {
  console.log('Generating weekly category reports...');
  try {
    const reports = await generateWeeklyCategoryReports();
    console.log(`Generated ${reports.length} weekly category reports.`);
  } catch (error) {
    console.error('Error generating weekly category reports:', error);
  }
});

// Monthly top performers report (1st of each month at 3:00 AM)
cron.schedule('0 3 1 * *', async () => {
  console.log('Generating monthly top performers report...');
  try {
    const report = await generateTopPerformersReport(10);
    if (report) {
      console.log('Generated monthly top performers report.');
    }
  } catch (error) {
    console.error('Error generating top performers report:', error);
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Analysis service running on port ${PORT}`);
  console.log('Scheduled reports initialized');
}); 
import express from 'express';
import Queue from 'bull';

export const setupRoutes = (
  scraperQueue: Queue.Queue,
  auditQueue: Queue.Queue,
  dataProcessingQueue: Queue.Queue
) => {
  const router = express.Router();

  router.get('/start', async (req, res) => {
    try {
      // Simplified response for GET requests
      res.status(200).json({ status: 'ok', message: 'Use POST to start scraping' });
    } catch (error) {
      console.error('Error with start endpoint:', error);
      res.status(500).json({ status: 'error', message: 'Server error' });
    }
  });

  router.post('/start', async (req, res) => {
    try {
      const { location, jobId } = req.body;
      
      // Add job to queue
      await scraperQueue.add('search-grid', {
        location: location || 'Ottawa',
        jobId
      });
      
      res.status(200).json({ status: 'ok', message: 'Scraping job added to queue', jobId });
    } catch (error) {
      console.error('Error starting scraper job:', error);
      res.status(500).json({ status: 'error', message: 'Failed to add scraper job to queue' });
    }
  });

  router.post('/audit', async (req, res) => {
    try {
      const { businessId, url } = req.body;
      
      if (!businessId || !url) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Business ID and URL are required' 
        });
      }
      
      // Add audit job to queue
      await auditQueue.add('audit-website', {
        businessId,
        url
      });
      
      res.status(200).json({ 
        status: 'ok', 
        message: 'Website audit job added to queue',
        businessId,
        url 
      });
    } catch (error) {
      console.error('Error starting website audit job:', error);
      res.status(500).json({ status: 'error', message: 'Failed to add audit job to queue' });
    }
  });

  // Add a health check endpoint for Railway deployment
  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Scraper service is running' });
  });

  return router;
};

export default setupRoutes;

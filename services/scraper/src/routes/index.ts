import express from 'express';
import { scrapeOttawaBusinesses } from '../scraper';

const router = express.Router();

router.get('/start', async (req, res) => {
  try {
    await scrapeOttawaBusinesses();
    res.status(200).send('Scraping started');
  } catch (error) {
    console.error('Error starting scraper:', error);
    res.status(500).send('Scraping failed to start');
  }
});

// Add a health check endpoint for Railway deployment
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Scraper service is running' });
});

export default router;

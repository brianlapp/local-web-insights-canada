const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3002;

app.use(express.json());

app.post('/audit', async (req, res) => {
  const { website } = req.body;
  if(!website){
    return res.status(400).json({ error: 'No website url provided' });
  }
  try {
    const browser = await puppeteer.launch({
      args: [
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    const page = await browser.newPage();
    await page.goto(website, { waitUntil: 'networkidle0' });
    const lcpEntries = await page.evaluate(() => {
      return performance.getEntriesByType('largest-contentful-paint');
    });
    await browser.close();
    if(lcpEntries.length > 0){
        return res.json({ lcp: lcpEntries[lcpEntries.length -1]});
    } else {
        return res.json({ lcp: null});
    }
  } catch (error) {
    console.error('Error during audit:', error);
    return res.status(500).json({ error: 'Failed to perform audit' });
  }
});

app.listen(port, () => {
  console.log(`Browser Service listening on port ${port}`);
});

import { launch } from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';
import lighthouse from 'https://esm.sh/lighthouse@10.0.0';

export async function runLighthouse(url: string) {
  const browser = await launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const port = new URL(browser.wsEndpoint()).port;
    const { lhr } = await lighthouse(url, {
      port: parseInt(port),
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      skipAudits: ['screenshot', 'final-screenshot'],
    });

    return lhr;
  } catch (error) {
    console.error('Lighthouse error:', error);
    return null;
  } finally {
    await browser.close();
  }
}

import Brand from '../models/brandmodel/brand.js';
import Snapshot from '../models/snapmodel/snapshot.js';
import scrapeProductPage from '../utils/scraper.js'
import cron from 'node-cron';

function scraperScheduler() {
  cron.schedule("0 */6 * * *", async () => {
    console.log("Running scheduled scraper...");
    const brands = await Brand.find();

    for (const brand of brands) {
      for (const url of brand.productUrls) {
        try {
          const data = await scrapeProductPage(url);
          await Snapshot.create({
            brandId: brand._id,
            productName: data.productName,
            productUrl: url,
            price: data.price,
            discountPercent: data.discountPercent,
            inStock: data.inStock,
          });
          console.log(`Scraped and saved data for ${data.productName}`);
        } catch (err) {
          console.error("Error scraping:", url, err);
        }
      }
    }
  });
}

module.exports = scraperScheduler;
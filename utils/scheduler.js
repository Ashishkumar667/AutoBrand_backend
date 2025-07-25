// import Brand from '../models/brandmodel/brand.js';
// import Snapshot from '../models/snapmodel/snapshot.js';
// import scrapeProductPage from '../utils/scraper.js'
// import cron from 'node-cron';

// function scraperScheduler() {
//   cron.schedule("0 */6 * * *", async () => {  //0 */6
//     console.log("Running scheduled scraper...");
//     const brands = await Brand.find();

//     for (const brand of brands) {
//       for (const url of brand.productUrls) {
//         try {
//           const data = await scrapeProductPage(url);
//           await Snapshot.create({
//             brandId: brand._id,
//             productName: data.productName,
//             productUrl: url,
//             price: data.price,
//             discountPercent: data.discountPercent,
//             inStock: data.inStock,
//           });
//           console.log(`Scraped and saved data for ${data.productName}`);
//         } catch (err) {
//           console.error("Error scraping:", url, err);
//         }
//       }
//     }
//   });
// }

// export default scraperScheduler;

import cron from "node-cron";
import puppeteer from "puppeteer";
import Brand from "../models/brandmodel/brand.js";
import Snapshot from "../models/snapmodel/snapshot.js";
import scrapeWithRetries from "../utils/scraper.js";
import User from "../models/userModel/user.js";
import { sendPriceDropEmail } from "../utils/sendEmail/AlertEmail/emailAlert.js";

async function scraperScheduler() {
  cron.schedule("* * * * *", async () => { //0 */6
    console.log("⏳ Running scheduled scraper...");

    const brands = await Brand.find();
    if (!brands.length) return console.log("No brands found!");

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    for (const brand of brands) {
      const user = await User.findById(brand.userId).lean();
      const userEmail = user?.email;
      if (!userEmail) {
        console.log(`⚠️ No user email found for brand ${brand.brandName}`);
        continue;
      }
      for (const url of brand.productUrls) {
        try {
          const data = await scrapeWithRetries(page, url);

         
          const lastSnapshot = await Snapshot.findOne({
            brandId: brand._id,
            productUrl: url,
          }).sort({ createdAt: -1 });

          const hasChanged =
            !lastSnapshot ||
            lastSnapshot.price !== data.price ||
            lastSnapshot.inStock !== data.inStock;

          if (hasChanged) {
            await Snapshot.create({
              brandId: brand._id,
              productName: data.productName,
              productUrl: url,
              price: data.price,
              discountPercent: data.discountPercent,
              inStock: data.inStock,
            });

            console.log(`✅ Change detected! Saved snapshot for ${data.productName}`);

            
            if (lastSnapshot && data.price < lastSnapshot.price) {
              console.log(
                `💰 PRICE DROP: ${data.productName} from ₹${lastSnapshot.price} → ₹${data.price}`
              );

              await sendPriceDropEmail(userEmail, {
                productName: data.productName,
                productUrl: url,
                oldPrice: lastSnapshot.price,
                newPrice: data.price,
                inStock: data.inStock,
              });
            }
          } else {
            console.log(`ℹ️ No change for ${data.productName}, skipping save.`);
          }
        } catch (err) {
          console.error("❌ Error scraping:", url, err);
        }
      }
    }

    await browser.close();
    console.log("✅ Scraping finished!");
  });
}

export default scraperScheduler;

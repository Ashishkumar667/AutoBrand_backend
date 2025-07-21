// import puppeteer from "puppeteer";

// async function scrapeFlipkart(page, url) {
//   await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
//   return await page.evaluate(() => {
//     const name = document.querySelector(".B_NuCI")?.innerText || "";
//     const priceText = document.querySelector("._30jeq3")?.innerText || "0";
//     const stockText = document.body.innerText.includes("Out of Stock") ? false : true;
//     return {
//       productName: name,
//       price: parseFloat(priceText.replace(/[^\d.]/g, "")),
//       discountPercent: 0,
//       inStock: stockText,
//     };
//   });
// }

// async function scrapeAmazon(page, url) {
//   await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
//   return await page.evaluate(() => {
//     const name = document.getElementById("productTitle")?.innerText.trim() || "";
//     const priceText = document.querySelector(".a-price .a-offscreen")?.innerText || "0";
//     const stockText = document.body.innerText.includes("In stock") || document.body.innerText.includes("Available") ? true : false;
//     return {
//       productName: name,
//       price: parseFloat(priceText.replace(/[^\d.]/g, "")),
//       discountPercent: 0,
//       inStock: stockText,
//     };
//   });
// }

// async function scrapeShopify(page, url) {
//   await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
//   return await page.evaluate(() => {
//     const name = document.querySelector("h1")?.innerText || "";
//     const priceText = document.querySelector(".price-item--regular, .price-item")?.innerText || "0";
//     const stockText = document.body.innerText.includes("Out of stock") ? false : true;
//     return {
//       productName: name,
//       price: parseFloat(priceText.replace(/[^\d.]/g, "")),
//       discountPercent: 0,
//       inStock: stockText,
//     };
//   });
// }

// async function scrapeCustom(page, url) {
//   await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
//   return await page.evaluate(() => {
//     const name = document.querySelector("h1")?.innerText || document.title;
//     const priceText = document.querySelector(".price, .product-price")?.innerText || "0";
//     const discountText = document.querySelector(".discount")?.innerText || "0";
//     const stockText = document.body.innerText.toLowerCase().includes("out of stock") ? false : true;
//     return {
//       productName: name,
//       price: parseFloat(priceText.replace(/[^\d.]/g, "")),
//       discountPercent: parseFloat(discountText.replace(/[^\d.]/g, "")) || 0,
//       inStock: stockText,
//     };
//   });
// }

// async function scrapeProduct(url) {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();

//   let result;
//   try {
//     if (url.includes("flipkart")) {
//       result = await scrapeFlipkart(page, url);
//     } else if (url.includes("amazon")) {
//       result = await scrapeAmazon(page, url);
//     } else if (url.includes(".myshopify.com") || url.includes("shopify")) {
//       result = await scrapeShopify(page, url);
//     } else {
//       result = await scrapeCustom(page, url);
//     }
//   } catch (err) {
//     console.error("Scraper failed:", err.message);
//     result = {
//       productName: "",
//       price: 0,
//       discountPercent: 0,
//       inStock: false,
//     };
//   } finally {
//     await browser.close();
//   }
//   return result;
// }

// export default scrapeProduct;


import puppeteer from "puppeteer";

// ✅ Helper to detect stock status more reliably
function isInStock(text) {
  const lower = text.toLowerCase();
  return !(
    lower.includes("out of stock") ||
    lower.includes("currently unavailable") ||
    lower.includes("sold out")
  );
}


async function scrapeFlipkart(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  return await page.evaluate(() => {
    const name = document.querySelector(".B_NuCI")?.innerText || "";
    const priceText = document.querySelector("._30jeq3")?.innerText || "0";
    const stockText = document.body.innerText.includes("Out of Stock") ? false : true;
    return {
      productName: name,
      price: parseFloat(priceText.replace(/[^\d.]/g, "")),
      discountPercent: 0,
      inStock: stockText,
    };
  });
}


async function scrapeAmazon(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  return await page.evaluate(() => {
    const name = document.getElementById("productTitle")?.innerText.trim() || "";
    const priceText = document.querySelector(".a-price .a-offscreen")?.innerText || "0";
    const stockText =
      document.body.innerText.includes("In stock") ||
      document.body.innerText.includes("Available")
        ? true
        : false;
    return {
      productName: name,
      price: parseFloat(priceText.replace(/[^\d.]/g, "")),
      discountPercent: 0,
      inStock: stockText,
    };
  });
}


async function scrapeShopify(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  return await page.evaluate(() => {
    const name = document.querySelector("h1")?.innerText || "";
    const priceText =
      document.querySelector(".price-item--regular, .price-item")?.innerText || "0";
    const stockText = document.body.innerText.includes("Out of stock") ? false : true;
    return {
      productName: name,
      price: parseFloat(priceText.replace(/[^\d.]/g, "")),
      discountPercent: 0,
      inStock: stockText,
    };
  });
}

async function scrapeCustom(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  return await page.evaluate(() => {
    const name = document.querySelector("h1")?.innerText || document.title;
    const priceText = document.querySelector(".price, .product-price")?.innerText || "0";
    const discountText = document.querySelector(".discount")?.innerText || "0";
    const stockText = !document.body.innerText.toLowerCase().includes("out of stock");
    return {
      productName: name,
      price: parseFloat(priceText.replace(/[^\d.]/g, "")),
      discountPercent: parseFloat(discountText.replace(/[^\d.]/g, "")) || 0,
      inStock: stockText,
    };
  });
}

async function scrapeProduct(page, url) {
  try {
    if (url.includes("flipkart")) return await scrapeFlipkart(page, url);
    if (url.includes("amazon")) return await scrapeAmazon(page, url);
    if (url.includes(".myshopify.com") || url.includes("shopify"))
      return await scrapeShopify(page, url);
    return await scrapeCustom(page, url);
  } catch (err) {
    console.error("Scraper failed:", err.message);
    return {
      productName: "",
      price: 0,
      discountPercent: 0,
      inStock: false,
    };
  }
}


export async function scrapeWithRetries(page, url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const result = await scrapeProduct(page, url);
    if (result.productName && result.price > 0) return result;
    console.warn(`Retry ${i + 1} failed for ${url}`);
  }
  return { productName: "", price: 0, discountPercent: 0, inStock: false };
}

export default scrapeWithRetries;

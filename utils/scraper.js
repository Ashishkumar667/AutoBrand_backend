import puppeteer from "puppeteer";

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
    const stockText = document.body.innerText.includes("In stock") || document.body.innerText.includes("Available") ? true : false;
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
    const priceText = document.querySelector(".price-item--regular, .price-item")?.innerText || "0";
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
    const stockText = document.body.innerText.toLowerCase().includes("out of stock") ? false : true;
    return {
      productName: name,
      price: parseFloat(priceText.replace(/[^\d.]/g, "")),
      discountPercent: parseFloat(discountText.replace(/[^\d.]/g, "")) || 0,
      inStock: stockText,
    };
  });
}

async function scrapeProduct(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let result;
  try {
    if (url.includes("flipkart")) {
      result = await scrapeFlipkart(page, url);
    } else if (url.includes("amazon")) {
      result = await scrapeAmazon(page, url);
    } else if (url.includes(".myshopify.com") || url.includes("shopify")) {
      result = await scrapeShopify(page, url);
    } else {
      result = await scrapeCustom(page, url);
    }
  } catch (err) {
    console.error("Scraper failed:", err.message);
    result = {
      productName: "",
      price: 0,
      discountPercent: 0,
      inStock: false,
    };
  } finally {
    await browser.close();
  }
  return result;
}

module.exports = scrapeProduct;

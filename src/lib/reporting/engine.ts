import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

/**
 * Agapay Document Engine (ADES)
 * Generates high-fidelity PDFs from internal report routes.
 */
export async function generatePDF(
  url: string,
  options: {
    format?: any;
    margin?: any;
    landscape?: boolean;
  } = {},
) {
  const isDev = process.env.NODE_ENV === "development";

  // Local Chrome path for dev, Chromium binary for PROD (Vercel)
  const executablePath = isDev
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // Windows default
    : await chromium.executablePath(
        "https://github.com/sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar",
      );

  const browser = await puppeteer.launch({
    args: isDev ? [] : chromium.args,
    defaultViewport: { width: 1280, height: 720 },
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Add internal secret header to bypass auth for the generator
    await page.setExtraHTTPHeaders({
      "X-Agapay-Report-Secret":
        process.env.REPORT_SECRET || "agapay-internal-secret",
    });

    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    const pdf = await page.pdf({
      format: options.format || "A4",
      landscape: options.landscape || false,
      margin: options.margin || {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
      printBackground: true,
    });

    return pdf;
  } finally {
    await browser.close();
  }
}

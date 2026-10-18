import { chromium } from "playwright-core";

const URL = process.argv[2] ?? "http://localhost:3100/imoveis/casa-em-condominio-fechado";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

const errors = [];
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));

await page.goto(URL, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);

const mainSrc = () => page.locator("button[aria-label='Ampliar foto']").evaluate(
  (b) => b.parentElement.querySelector("img[data-nimg='fill']")?.src,
);

const metrics = await page.evaluate(() => ({
  vw: document.documentElement.clientWidth,
  bodyScroll: document.body.scrollWidth,
  galleryW: Math.round(document.querySelector("button[aria-label='Ampliar foto']").parentElement.getBoundingClientRect().width),
}));
console.log("viewport:", metrics.vw, "| body:", metrics.bodyScroll, "| galeria:", metrics.galleryW);

const before = await mainSrc();
const thumbs = page.locator("button[aria-label^='Ver foto']");
console.log("thumbs:", await thumbs.count());
await thumbs.nth(2).tap();
await page.waitForTimeout(800);
const after = await mainSrc();
console.log("main antes:", before?.match(/%2F([\w-]+\.\w+)&/)?.[1]);
console.log("main depois:", after?.match(/%2F([\w-]+\.\w+)&/)?.[1]);
console.log(before === after ? "❌ NÃO MUDOU" : "✅ imagem grande mudou após tap na miniatura");

for (const e of errors.slice(0, 10)) console.log(e);
await browser.close();

const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = '/home/mcocdaa/.gemini/antigravity-cli/brain/65c15d10-a1b9-421a-8d05-1807327fe26d';

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/mcocdaa/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 950 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:5177/ ...');
  await page.goto('http://localhost:5177/', { waitUntil: 'networkidle' });

  // 1. Wait for categories and items to load
  await page.waitForSelector('text=全部知识', { timeout: 15000 });
  await page.waitForTimeout(1500);

  // Click on Markdown file row to preview Markdown
  console.log('Selecting Markdown item ...');
  const mdRow = page.locator('text=KnowFlow 统一架构设计说明书.md').first();
  if (await mdRow.count() > 0) {
    await mdRow.click();
    await page.waitForTimeout(2000);
  }

  // Screenshot 1: 3-column workspace with Table view and rich Markdown live preview
  console.log('Capturing workspace_3column_markdown.png ...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'workspace_3column_markdown.png'),
    fullPage: false,
  });

  // 2. Click on Card view toggle
  console.log('Switching to Card view ...');
  const cardViewBtn = page.locator('.ant-segmented-item:has-text("卡片")');
  if (await cardViewBtn.count() > 0) {
    await cardViewBtn.first().click();
    await page.waitForTimeout(1000);
  }

  // Screenshot 2: Card Grid view
  console.log('Capturing workspace_card_grid.png ...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'workspace_card_grid.png'),
    fullPage: false,
  });

  // 3. Select Python code item to show Monaco editor preview
  console.log('Selecting Python item ...');
  const codeCard = page.locator('text=fastembed 离线语义推理实现.py').first();
  if (await codeCard.count() > 0) {
    await codeCard.click();
    // Give Monaco editor sufficient time to render
    await page.waitForTimeout(4000);
  }

  console.log('Capturing workspace_code_monaco.png ...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'workspace_code_monaco.png'),
    fullPage: false,
  });

  // 4. Test category tree click filter
  console.log('Filtering by category 后端核心 ...');
  const techArchNode = page.locator('.ant-tree-title:has-text("后端核心")').first();
  if (await techArchNode.count() > 0) {
    await techArchNode.click();
    await page.waitForTimeout(1500);
  }

  console.log('Capturing workspace_category_filtered.png ...');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'workspace_category_filtered.png'),
    fullPage: false,
  });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});

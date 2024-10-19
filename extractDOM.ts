import { chromium, Browser, Page } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

interface NavItem {
  text: string;
  href: string;
  children?: NavItem[];
}

export async function extractSiteStructure(url: string): Promise<string> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    const structure = await page.evaluate(() => {
      function extractNav(element: Element): NavItem[] {
        const items: NavItem[] = [];
        const links = element.querySelectorAll('a');
        links.forEach(link => {
          const item: NavItem = {
            text: link.textContent?.trim() || '',
            href: link.getAttribute('href') || '',
          };
          const subNav = link.parentElement?.querySelector('ul, ol');
          if (subNav) {
            item.children = extractNav(subNav);
          }
          items.push(item);
        });
        return items;
      }

      const navElements = document.querySelectorAll('nav, header, [id*="menu"], [class*="menu"], [class*="navigation"]');
      let navStructure: NavItem[] = [];
      navElements.forEach(nav => {
        navStructure = navStructure.concat(extractNav(nav));
      });

      return JSON.stringify(navStructure, null, 2);
    });

    // Save the structure to a file
    const fileName = `site_structure_${new URL(url).hostname}.json`;
    const folderPath = path.join(process.cwd(), 'src', 'site_structures');

    // Ensure the directory exists
    await fs.mkdir(folderPath, { recursive: true });
    const filePath = path.join(folderPath, fileName);

    // Use filePath in the writeFile operation
    await fs.writeFile(filePath, structure);

    console.log(`Site structure for ${url} has been saved to ${filePath}`);
    return structure;
    
  } catch (error) {
    console.error('Error extracting site structure:', error);
    return `Error extracting site structure: ${error}`;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}
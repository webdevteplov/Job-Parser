const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Открываем сайт
  await page.goto('https://www.indeed.com');

  // Вводим запрос "java developer" в строку поиска
  await page.waitForSelector('#text-input-what');
  await page.type('#text-input-what', 'java developer');

  // Нажимаем кнопку поиска
  await page.click('.yosegi-InlineWhatWhere-primaryButton');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // Применяем фильтр для вакансий за последние 24 часа
  await page.click('#filter-dateposted');
  await page.waitForSelector('ul.yosegi-FilterPill-dropdownList');
  await page.click('ul.yosegi-FilterPill-dropdownList > li.yosegi-FilterPill-dropdownListItem:first-child');
  
  let hasNextPage = true;
    while(hasNextPage) {
      // Получаем HTML содержимое страницы
        const html = await page.content();
        const $ = cheerio.load(html);
        
        // Парсим ссылки
        $('div#mosaic-jobResults > div#mosaic-provider-jobcards > ul.css-zu9cdh > li.css-5lfss').each((_, element) => {
            const url = $(element).attr('href');
            console.log('url:', `https://www.indeed.com${url}`);
      });
      
      // Переключаем страницы
      try {
        await Promise.all([
            page.waitForNavigation({ timeout: 5000 }),
            page.click('nav[role="navigation"]:last-child')
        ]);
      } catch (error) {
        hasNextPage = false;
      }
    }

  await browser.close();
})();


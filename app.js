const express = require("express");
const helmet = require("helmet");
const puppeteer = require("puppeteer");

const app = express();

app.use(express.static('public'));
app.use(helmet());

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

app.get('/search', async (req, res) => {
  if (req.query.q && req.query.q.length && req.query.q.length > 0) {
    try {
      const items = await search(req.query.q);
      res.status(200).json(items);
    } catch (e) {
      res.status(500).send(e);
    }
  } else {
    res.status(500).send('Wrong query string parameter');
  }
});

app.listen(3000);

const search = async query => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request.resourceType() === 'document' || request.url().startsWith('https://www.gstatic.com')) {
      request.continue();
    } else {
      request.abort();
    }
  });

  await page.goto(`https://www.google.com/search?q=${query}&tbm=isch`);

  await page.waitForSelector('span > div > a');
  const items = await page.$$eval('span > div > a', elements => {
    const items = [];
    for (const element of elements) {
      const url = element.href;
      const text = element.querySelector('span').innerHTML;
      const icon = element.querySelector('img');
      items.push({ url, text, icon: icon ? icon.src : '' });
    }
    return items;
  });

  await browser.close();
  return items;
};

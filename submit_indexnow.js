// Submit updated URLs to IndexNow (instantly pings Brave Search, Bing, Yandex, etc.)
const https = require('https');

const payload = JSON.stringify({
  host: 'pdftopractice.in',
  key: 'e46799771d974b82bd255848164680e7',
  keyLocation: 'https://pdftopractice.in/e46799771d974b82bd255848164680e7.txt',
  urlList: [
    'https://pdftopractice.in/mathongo',
    'https://pdftopractice.in/sitemap.xml',
    'https://pdftopractice.in/'
  ]
});

const options = {
  hostname: 'api.indexnow.org',
  port: 443,
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  console.log(`IndexNow status code: ${res.statusCode} (${res.statusMessage})`);
  if (res.statusCode === 200 || res.statusCode === 202) {
    console.log('Successfully submitted to IndexNow! Brave Search and Bing have been pinged to re-crawl.');
  } else {
    console.log('Response code:', res.statusCode);
  }
});

req.on('error', (e) => {
  console.error(`Error submitting to IndexNow: ${e.message}`);
});

req.write(payload);
req.end();

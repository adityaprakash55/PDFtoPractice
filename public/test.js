const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('app.js', 'utf8');

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  virtualConsole: new jsdom.VirtualConsole().sendTo(console)
});

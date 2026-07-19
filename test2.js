const jsdom = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('app.js', 'utf8');

const dom = new jsdom.JSDOM(html, {
  runScripts: 'dangerously'
});

const window = dom.window;
const document = window.document;

// Mock some globals that might be missing in JSDOM
window.pdfjsLib = {
  GlobalWorkerOptions: {}
};
window.tailwind = {
  config: {}
};
window.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

// Catch errors
window.addEventListener("error", (event) => {
  console.error("Browser Error:", event.error);
});

// Run script
const scriptEl = document.createElement('script');
scriptEl.textContent = script;
document.body.appendChild(scriptEl);

console.log("Script loaded. If no errors above, it initialized correctly.");

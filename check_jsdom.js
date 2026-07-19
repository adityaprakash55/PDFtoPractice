const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('app.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;

// Polyfills
window.URL.createObjectURL = () => {};
window.pdfjsLib = { getDocument: () => ({ promise: Promise.resolve({ numPages: 1 }) }), GlobalWorkerOptions: {} };
window.localforage = { config: () => {}, getItem: async () => null, setItem: async () => {} };
window.Chart = class { constructor() {} destroy() {} };
window.confetti = () => {};

window.console.error = (msg, ...args) => {
    fs.appendFileSync('jsdom_error.log', 'ERROR: ' + msg + ' ' + args.join(' ') + '\n');
};
window.console.log = (msg, ...args) => {
    // ignore
};

try {
    window.eval(appJs);
    fs.writeFileSync('jsdom_error.log', 'SUCCESS: app.js loaded without top-level errors\n');
} catch (e) {
    fs.writeFileSync('jsdom_error.log', 'CRASH: ' + e.stack + '\n');
}

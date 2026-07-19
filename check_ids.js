const fs = require('fs'); 
const appJs = fs.readFileSync('app.js', 'utf8'); 
const domElements = [...appJs.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]); 
const indexHtml = fs.readFileSync('index.html', 'utf8'); 
const missing = [...new Set(domElements)].filter(id => !indexHtml.includes('id="' + id + '"') && !indexHtml.includes("id='" + id + "'")); 
console.log('Missing IDs:', missing);

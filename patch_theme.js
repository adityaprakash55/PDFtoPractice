const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// Global replaces for card backgrounds and borders
content = content.replace(/bg-\[#1C212E\]/g, 'bg-white dark:bg-[#1C212E]');
content = content.replace(/border-gray-800/g, 'border-gray-200 dark:border-gray-800');

// Fix text colors in empty states
content = content.replace(/text-gray-400 mb-1/g, 'text-gray-900 dark:text-gray-400 mb-1');
content = content.replace(/text-gray-500 max-w-sm/g, 'text-gray-600 dark:text-gray-500 max-w-sm');

// Fix inner icon circle in empty states
content = content.replace(/bg-white\/5 p-4 rounded-full text-gray-500/g, 'bg-gray-100 dark:bg-white/5 p-4 rounded-full text-gray-500');

fs.writeFileSync('app.js', content, 'utf8');
console.log('Successfully patched theme colors in app.js');

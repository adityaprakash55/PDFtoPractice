const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const themeLogic = `// =============================================================
// Theme Toggle Logic
// =============================================================
const themeToggleBtn = document.getElementById('themeToggleBtn');
const ntaThemeToggleBtn = document.getElementById('ntaThemeToggleBtn');

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    try {
        if (isDark) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    } catch(e) {}
}

if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
if (ntaThemeToggleBtn) ntaThemeToggleBtn.addEventListener('click', toggleTheme);

`;

if (!content.includes('function toggleTheme()')) {
    content = themeLogic + content;
    fs.writeFileSync('app.js', content, 'utf8');
    console.log('Prepended theme logic successfully!');
} else {
    console.log('Theme logic already exists.');
}

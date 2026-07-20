const fs = require('fs');

let content = fs.readFileSync('views/index.ejs', 'utf8');

// Fix startPage label
content = content.replace(
    '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Page</label>',
    '<label for="startPage" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Page</label>'
);
// Fix endPage label
content = content.replace(
    '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Page</label>',
    '<label for="endPage" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Page</label>'
);
// Fix totalTimeInput label
content = content.replace(
    '<label id="timeInputLabel" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Time (Minutes)</label>',
    '<label for="totalTimeInput" id="timeInputLabel" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Time (Minutes)</label>'
);
// Fix scorePerQInput label
content = content.replace(
    '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score per Question</label>',
    '<label for="scorePerQInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score per Question</label>'
);
// Fix themeToggleBtn aria-label
content = content.replace(
    'id="themeToggleBtn"',
    'id="themeToggleBtn" aria-label="Toggle Theme"'
);
// Fix ntaThemeToggleBtn aria-label
content = content.replace(
    'id="ntaThemeToggleBtn"',
    'id="ntaThemeToggleBtn" aria-label="Toggle Theme"'
);
// Fix full screen btn aria-label
content = content.replace(
    'id="ntaFullScreenBtn"',
    'id="ntaFullScreenBtn" aria-label="Toggle Full Screen"'
);
// Fix close button aria-label
content = content.replace(
    'id="ntaCloseScratchpadBtn"',
    'id="ntaCloseScratchpadBtn" aria-label="Close Scratchpad"'
);
// Fix mobile palette toggle
content = content.replace(
    'id="ntaMobilePaletteBtn"',
    'id="ntaMobilePaletteBtn" aria-label="Toggle Question Palette"'
);
// Fix sidebar toggle
content = content.replace(
    'id="ntaToggleSidebarBtn"',
    'id="ntaToggleSidebarBtn" aria-label="Toggle Sidebar"'
);
// Fix ntaBookmarkBtn aria-label
content = content.replace(
    'id="ntaBookmarkBtn"',
    'id="ntaBookmarkBtn" aria-label="Bookmark Question"'
);
// Fix dropZone input missing aria-label
content = content.replace(
    'id="fileInput" accept="application/pdf"',
    'id="fileInput" accept="application/pdf" aria-label="Upload PDF"'
);

fs.writeFileSync('views/index.ejs', content);
console.log("Fixed a11y labels in views/index.ejs");

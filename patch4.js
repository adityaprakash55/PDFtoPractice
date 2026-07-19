const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const targetLine = "        await renderPreview(config.startPage, firstPageCanvas, firstCtx);";
const replacement = `        const config = getActiveConfig();
        startPageInput.value = config.startPage;    startPageInput.max = total;
        endPageInput.value   = config.endPage;      endPageInput.max  = total;
        totalPagesText.textContent = \`Total pages in document: \${total}\`;

        uploadContainer.classList.add('hidden');
        document.getElementById('historyContainer')?.classList.add('hidden');
        document.getElementById('bookmarksContainer')?.classList.add('hidden');
        document.getElementById('notedQsContainer')?.classList.add('hidden');
        
        configContainer.classList.remove('hidden');
        practiceSetupContainer.classList.add('hidden');
        practiceInterfaceContainer.classList.add('hidden');
        summaryContainer.classList.add('hidden');

        await renderPreview(config.startPage, firstPageCanvas, firstCtx);`;

if (content.includes(targetLine)) {
    content = content.replace(targetLine, replacement);
    fs.writeFileSync('app.js', content, 'utf8');
    console.log('Successfully patched app.js (restored missing block)');
} else {
    console.error('TARGET NOT FOUND');
    process.exit(1);
}

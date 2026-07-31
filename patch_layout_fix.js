const fs = require('fs');
let html = fs.readFileSync('views/index.ejs', 'utf8');

// 1. Wrap the existing main content
const mainOpen = '<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">';
const sidebarHtml = `
<!-- Dashboard Layout -->
<div id="landingDashboardLayout" class="flex h-screen w-full overflow-hidden bg-[#0a0c10]">
    <!-- Sidebar -->
    <aside id="landingSidebar" class="w-64 bg-[#0d1117] border-r border-gray-800 flex flex-col shrink-0 hidden md:flex">
        <div class="p-4 border-b border-gray-800">
            <div class="text-white font-bold text-lg">PDF to Practice</div>
            <div class="text-xs text-blue-400 mt-0.5 font-medium">Study Dashboard</div>
        </div>
        <nav class="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            <button class="dash-nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-white/10 transition-all text-left" data-target="homeView">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                New Practice
            </button>
            <button class="dash-nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left" data-target="historyView">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Test History
            </button>
            <button class="dash-nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left" data-target="bookmarksView">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                Bookmarked Qs
            </button>
            <button class="dash-nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left" data-target="notesView">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Noted Qs
            </button>
            <button class="dash-nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left" data-target="analysisView">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                Score Analysis
            </button>
        </nav>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div class="max-w-4xl mx-auto pb-20">
`;

if (!html.includes(mainOpen)) {
    console.error('ERROR: Could not find mainOpen string in index.ejs');
    process.exit(1);
}

html = html.replace(mainOpen, sidebarHtml);

const analysisContainerHtml = `
<!-- Score Analysis Container (NEW) -->
<div id="analysisContainer" class="dash-view hidden pt-8">
    <h2 class="text-3xl font-bold text-white mb-8">Aggregate Score Analysis</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gray-800/40 border border-blue-500/20 rounded-xl p-6 text-center">
            <div class="text-sm text-blue-400 font-bold uppercase tracking-widest mb-2">Total Tests Taken</div>
            <div id="saTotalTests" class="text-5xl font-bold text-white">0</div>
        </div>
        <div class="bg-gray-800/40 border border-green-500/20 rounded-xl p-6 text-center">
            <div class="text-sm text-green-400 font-bold uppercase tracking-widest mb-2">Avg Accuracy</div>
            <div id="saAvgAccuracy" class="text-5xl font-bold text-white">0%</div>
        </div>
        <div class="bg-gray-800/40 border border-purple-500/20 rounded-xl p-6 text-center">
            <div class="text-sm text-purple-400 font-bold uppercase tracking-widest mb-2">Questions Attempted</div>
            <div id="saTotalQs" class="text-5xl font-bold text-white">0</div>
        </div>
    </div>
    
    <div class="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 mb-4">
        <div class="font-semibold text-white mb-4 text-lg">Accuracy History</div>
        <div class="h-64 flex items-end justify-between gap-2 px-2" id="saAccuracyChart">
            <!-- Bars will go here -->
            <p class="text-gray-500 text-sm text-center w-full">Complete more tests to see your trend</p>
        </div>
    </div>
</div>
`;

// Insert the analysis container before <div id="liveJoinContainer"
// BUT wait, liveJoinContainer has different spacing? Let's use Regex.
html = html.replace(/<div id="liveJoinContainer"/, analysisContainerHtml + '\n<div id="liveJoinContainer"');

// Fix the closing main tag. 
// Wait, index.ejs has TWO <main> tags now?
// The dashboard layout one: `<main class="flex-1 overflow-y-auto bg-[#0d1117]">` (Wait, this is in the Test Report!).
// The first one is the landing page.
// The first `</main>` should be replaced.
html = html.replace('</main>', '        </div>\n    </main>\n</div> <!-- End Dashboard Layout -->');

// Also, add dash-view class to the other containers
html = html.replace(/id="uploadContainer" class="/, 'id="uploadContainer" class="dash-view homeView ');
html = html.replace(/id="practiceSetupContainer" class="hidden /, 'id="practiceSetupContainer" class="dash-view homeView hidden ');
html = html.replace(/id="historyContainer" class="/, 'id="historyContainer" class="dash-view historyView hidden ');
html = html.replace(/id="bookmarksContainer" class="/, 'id="bookmarksContainer" class="dash-view bookmarksView hidden ');
html = html.replace(/id="notedQsContainer" class="/, 'id="notedQsContainer" class="dash-view notesView hidden ');

fs.writeFileSync('views/index.ejs', html);
console.log('Patched index.ejs layout successfully!');

import sys

# 1. Update views/index.ejs
ejs_path = 'views/index.ejs'
with open(ejs_path, 'r', encoding='utf-8') as f:
    ejs_content = f.read()

# Replace body background
ejs_content = ejs_content.replace(
    '<body class="bg-slate-50 dark:bg-[#06080c] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200 relative min-h-screen overflow-x-hidden">',
    '<body class="bg-[#f4f4f0] dark:bg-[#0a0b0e] text-black dark:text-white font-sans transition-colors duration-200 relative min-h-screen overflow-x-hidden">'
)

# Replace header bar bg and borders
ejs_content = ejs_content.replace(
    '<header class="glass-panel sticky top-0 z-50 shadow-sm transition-colors border-b-0">',
    '<header class="border-b-[3.5px] border-black bg-white dark:bg-[#0f111a] sticky top-0 z-50 transition-colors">'
)

# Redesign header buttons
ejs_content = ejs_content.replace(
    'class="p-2 rounded-full bg-gray-100 dark:bg-navy-800 shadow-sm border border-gray-200 dark:border-navy-700 text-yellow-500 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-navy-700 transition-colors cursor-pointer"',
    'class="p-2 bg-white dark:bg-[#11131c] border-[2.5px] border-black shadow-[3px_3px_0px_0px_#000] text-yellow-500 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000]"'
)
ejs_content = ejs_content.replace(
    'class="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-1"',
    'class="px-4 py-2 bg-pink-400 hover:bg-pink-300 border-[2.5px] border-black shadow-[3px_3px_0px_0px_#000] text-black font-black uppercase text-xs hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-1"'
)
ejs_content = ejs_content.replace(
    'class="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-400 transition-colors flex items-center gap-1"',
    'class="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 border-[2.5px] border-black shadow-[3px_3px_0px_0px_#000] text-black font-black uppercase text-xs hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-1"'
)

# Redesign aside (sidebar) tags
ejs_content = ejs_content.replace(
    '<aside id="landingSidebar" class="transition-all duration-300" style="background:#0d1117; border-right:1px solid #1f2937;">',
    '<aside id="landingSidebar" class="transition-all duration-300 border-r-[3.5px] border-black">'
)
ejs_content = ejs_content.replace(
    '<div class="p-4 flex items-center justify-between" style="border-bottom:1px solid #1f2937;">',
    '<div class="p-4 flex items-center justify-between border-b-[3.5px] border-black bg-white dark:bg-[#11131c]">'
)

# Redesign aside brand
ejs_content = ejs_content.replace(
    """            <div class="dash-sidebar-brand overflow-hidden whitespace-nowrap">
                <div class="text-white font-bold text-base">PDF to Practice</div>
                <div class="text-xs text-cyan-400 mt-0.5 font-medium">Study Dashboard</div>
            </div>""",
    """            <div class="dash-sidebar-brand overflow-hidden whitespace-nowrap text-left">
                <div class="text-black dark:text-white font-black uppercase text-base tracking-tight leading-none">PDF to Practice</div>
                <div class="text-[10px] text-cyan-500 mt-1 font-bold uppercase tracking-wider">Study Dashboard</div>
            </div>"""
)

# Redesign upload container badges and headers
ejs_content = ejs_content.replace(
    '<div class="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 dark:border-cyan-500/30">',
    '<div class="inline-block px-4 py-1.5 bg-[#22d3ee] text-black border-[2px] border-black font-black uppercase text-xs shadow-[2.5px_2.5px_0px_0px_#000]">'
)
ejs_content = ejs_content.replace(
    '<div class="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30">',
    '<div class="inline-block px-4 py-1.5 bg-[#10b981] text-black border-[2px] border-black font-black uppercase text-xs shadow-[2.5px_2.5px_0px_0px_#000]">'
)
ejs_content = ejs_content.replace(
    'class="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight"',
    'class="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight uppercase"'
)
ejs_content = ejs_content.replace(
    '<span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">CBT Mocks Instantly</span>',
    '<span class="text-cyan-500 underline decoration-[6px] decoration-black dark:decoration-white">CBT Mocks Instantly</span>'
)

# Redesign dropZone
ejs_content = ejs_content.replace(
    'class="relative group flex flex-col items-center justify-center w-full max-w-lg h-72 p-6 border-2 border-dashed border-cyan-300/50 dark:border-cyan-700/50 rounded-3xl glass-panel hover:border-cyan-400 dark:hover:border-cyan-400 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer overflow-hidden"',
    'class="relative group flex flex-col items-center justify-center w-full max-w-lg h-72 p-6 border-[3.5px] border-dashed border-black bg-white dark:bg-[#11131c] shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#22d3ee] transition-all hover:scale-[1.01] hover:shadow-[10px_10px_0px_0px_#000] dark:hover:shadow-[10px_10px_0px_0px_#22d3ee] cursor-pointer overflow-hidden"'
)
ejs_content = ejs_content.replace(
    'class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300"',
    'class="text-xl font-black uppercase text-black dark:text-white tracking-tight"'
)

# Redesign wizard/action buttons on home
ejs_content = ejs_content.replace(
    'class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1"',
    'class="inline-flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-black font-black uppercase border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] transition-all active:translate-x-0 active:translate-y-0"'
)
ejs_content = ejs_content.replace(
    'class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1"',
    'class="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] transition-all active:translate-x-0 active:translate-y-0"'
)

# Redesign configContainer panels
ejs_content = ejs_content.replace(
    'class="flex-1 bg-white dark:bg-navy-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-800 flex flex-col items-center"',
    'class="flex-1 bg-white dark:bg-[#11131c] p-6 border-[3px] border-black shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#22d3ee] flex flex-col items-center"'
)
ejs_content = ejs_content.replace(
    'class="bg-white dark:bg-navy-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-800"',
    'class="bg-white dark:bg-[#11131c] p-6 border-[3px] border-black shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#22d3ee]"'
)

# Redesign config buttons
ejs_content = ejs_content.replace(
    'class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2"',
    'class="w-full bg-blue-400 hover:bg-blue-300 text-black font-black uppercase py-3.5 px-4 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center space-x-2"'
)
ejs_content = ejs_content.replace(
    'class="hidden w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2"',
    'class="hidden w-full bg-emerald-400 hover:bg-emerald-300 text-black font-black uppercase py-3.5 px-4 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center space-x-2"'
)
ejs_content = ejs_content.replace(
    'class="hidden w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2"',
    'class="hidden w-full bg-emerald-400 hover:bg-emerald-300 text-black font-black uppercase py-3.5 px-4 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center space-x-2"'
)

# Start Over button
ejs_content = ejs_content.replace(
    'class="w-full bg-gray-100 dark:bg-navy-800 hover:bg-gray-200 dark:hover:bg-navy-700 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-xl transition-colors"',
    'class="w-full bg-gray-200 hover:bg-gray-300 text-black font-bold uppercase py-2.5 border-[2.5px] border-black shadow-[2.5px_2.5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all"'
)

# Redesign practiceSetupContainer
ejs_content = ejs_content.replace(
    'class="hidden max-w-lg mx-auto mt-16 bg-white dark:bg-navy-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-navy-800 text-center"',
    'class="hidden max-w-lg mx-auto mt-16 bg-white dark:bg-[#11131c] p-8 border-[3.5px] border-black shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#22d3ee] text-center"'
)

# Timing Mode and buttons inside setup
ejs_content = ejs_content.replace(
    'class="w-1/2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2"',
    'class="w-1/2 bg-purple-400 hover:bg-purple-300 text-black font-black uppercase py-3.5 px-6 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"'
)
ejs_content = ejs_content.replace(
    'class="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-transform transform hover:-translate-y-1"',
    'class="w-1/2 bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase py-3.5 px-6 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"'
)

# Redesign Modals (Instructions, Are You Sure, Summary, etc.)
ejs_content = ejs_content.replace(
    'class="bg-[#0e121b] border border-gray-800 rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl relative overflow-hidden flex flex-col gap-5"',
    'class="bg-white dark:bg-[#11131c] border-[3.5px] border-black max-w-lg w-full p-8 text-left shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#22d3ee] relative overflow-hidden flex flex-col gap-5"'
)
ejs_content = ejs_content.replace(
    'class="bg-[#0e121b] border border-gray-800 rounded-3xl max-w-xl w-full p-6 text-left shadow-2xl relative overflow-hidden flex flex-col gap-5 max-h-[90vh]"',
    'class="bg-white dark:bg-[#11131c] border-[3.5px] border-black max-w-xl w-full p-8 text-left shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#22d3ee] relative overflow-hidden flex flex-col gap-5 max-h-[90vh]"'
)

# Save changes to index.ejs
with open(ejs_path, 'w', encoding='utf-8') as f:
    f.write(ejs_content)
print("index.ejs updated to Neo-Brutalist design tokens")


# 2. Update public/app.js
app_path = 'public/app.js'
with open(app_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

# Replace history list card className
app_content = app_content.replace(
    "card.className = 'bg-[#090b10] hover:bg-[#0d1017] transition-all p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-800/80 hover:border-gray-700 shadow-xl relative group mb-3.5 gap-4';",
    "card.className = 'bg-white dark:bg-[#11131c] border-[3px] border-black p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#22d3ee] relative group mb-3.5 gap-4 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#22d3ee]';"
)

# Take Test Button in history list card
app_content = app_content.replace(
    'class="take-test-modal-btn bg-black hover:bg-neutral-900 text-white text-xs font-bold py-2 px-4 rounded-full flex items-center gap-2 border border-neutral-700 shadow-md transition-all active:scale-95 shrink-0 ml-1"',
    'class="take-test-modal-btn bg-[#facc15] hover:bg-yellow-300 text-black text-xs font-black uppercase py-2.5 px-4 flex items-center gap-2 border-[2px] border-black shadow-[3px_3px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] shrink-0 ml-1"'
)

# Bookmarks card className
app_content = app_content.replace(
    "card.className = 'bg-[#090b10] p-5 rounded-2xl flex flex-col justify-between border border-gray-800 shadow-xl relative z-10 hover:z-20 transition-all hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] cursor-pointer group';",
    "card.className = 'bg-white dark:bg-[#11131c] p-5 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#22d3ee] flex flex-col justify-between relative cursor-pointer transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#22d3ee] group';"
)

# Notes card className
app_content = app_content.replace(
    "card.className = 'bg-[#090b10] p-5 rounded-2xl flex flex-col justify-between border border-gray-800 shadow-xl relative z-10 hover:z-20 transition-all hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] cursor-pointer group';",
    "card.className = 'bg-white dark:bg-[#11131c] p-5 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#22d3ee] flex flex-col justify-between relative cursor-pointer transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#22d3ee] group';"
)

# Rename/Delete/View Analysis/Host buttons in history list card
app_content = app_content.replace(
    'class="rename-session-btn text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800/60 transition-colors"',
    'class="rename-session-btn p-2 bg-white dark:bg-[#11131c] border-[2px] border-black text-black dark:text-white shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black"'
)
app_content = app_content.replace(
    'class="delete-session-btn text-gray-400 hover:text-rose-400 p-2 rounded-xl hover:bg-gray-800/60 transition-colors"',
    'class="delete-session-btn p-2 bg-white dark:bg-[#11131c] border-[2px] border-black text-black dark:text-white shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all hover:bg-rose-400 dark:hover:bg-rose-400 hover:text-black"'
)
app_content = app_content.replace(
    'class="view-session-btn text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800/60 transition-colors"',
    'class="view-session-btn p-2 bg-white dark:bg-[#11131c] border-[2px] border-black text-black dark:text-white shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black"'
)
app_content = app_content.replace(
    'class="share-session-btn bg-[#1e293b] hover:bg-[#283750] text-blue-400 p-2.5 rounded-xl border border-blue-800/40 transition-all shadow-sm active:scale-95 flex items-center justify-center"',
    'class="share-session-btn p-2.5 bg-blue-400 hover:bg-blue-300 text-black font-extrabold border-[2px] border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center justify-center"'
)
app_content = app_content.replace(
    'class="share-session-btn text-gray-400 hover:text-blue-400 p-2 rounded-xl hover:bg-gray-800/60 transition-colors"',
    'class="share-session-btn p-2 bg-purple-400 hover:bg-purple-300 text-black border-[2px] border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all"'
)

# Save changes to app.js
with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_content)
print("app.js updated successfully")

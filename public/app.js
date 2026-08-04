// =============================================================
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


// =============================================================
// PDF.js Worker Setup
// =============================================================
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// =============================================================
// UI ELEMENTS
// =============================================================
const dropZone          = document.getElementById('dropZone');
const fileInput         = document.getElementById('fileInput');
const uploadContainer   = document.getElementById('uploadContainer');
const configContainer   = document.getElementById('configContainer');
const firstPageCanvas   = document.getElementById('firstPageCanvas');
const firstCtx          = firstPageCanvas.getContext('2d');
const topLine           = document.getElementById('topLine');
const bottomLine        = document.getElementById('bottomLine');
const startPageInput    = document.getElementById('startPage');
const endPageInput      = document.getElementById('endPage');
const totalPagesText    = document.getElementById('totalPagesText');

const wizardNextBtn       = document.getElementById('wizardNextBtn');
const wizardSkipScanBtn   = document.getElementById('wizardSkipScanBtn');
const startFinalScanBtn   = document.getElementById('startFinalScanBtn');
const skipAnswersBtn      = document.getElementById('skipAnswersBtn');
const dropTextMain        = document.getElementById('dropTextMain');
const dropTextSub         = document.getElementById('dropTextSub');
const dropIconContainer   = document.getElementById('dropIconContainer');

const cancelBtn         = document.getElementById('cancelBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar       = document.getElementById('progressBar');
const progressText      = document.getElementById('progressText');
const hiddenCanvas      = document.getElementById('hiddenCanvas');
const hiddenCtx         = hiddenCanvas.getContext('2d', { willReadFrequently: true });

// --- Practice UI Elements ---
const practiceSetupContainer = document.getElementById('practiceSetupContainer');
const setupCropCount = document.getElementById('setupCropCount');
const totalTimeInput = document.getElementById('totalTimeInput');
const timeInputLabel = document.getElementById('timeInputLabel');
const startPracticeBtn = document.getElementById('startPracticeBtn');

document.querySelectorAll('input[name="timingMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'total') {
            timeInputLabel.textContent = 'Total Time (Minutes)';
            totalTimeInput.value = 60;
        } else {
            timeInputLabel.textContent = 'Time Per Question (Minutes)';
            totalTimeInput.value = 2; // Default 2 mins per question
        }
    });
});

function getCalculatedTimeMinutes(numQuestions) {
    const mode = document.querySelector('input[name="timingMode"]:checked').value;
    let mins = parseInt(totalTimeInput.value, 10) || 60;
    if (mode === 'perQuestion') {
        mins = mins * (numQuestions || 1);
    }
    return mins;
}

const practiceInterfaceContainer = document.getElementById('practiceInterfaceContainer');
const practiceTotalTimer = document.getElementById('practiceTotalTimer');
const currentQNum = document.getElementById('currentQNum');
const totalQNum = document.getElementById('totalQNum');
const practiceQLabel = document.getElementById('practiceQLabel');
const questionStopwatch = document.getElementById('questionStopwatch');
const practiceQImage = document.getElementById('practiceQImage');
const checkAnswerBtn = document.getElementById('checkAnswerBtn');
const practiceAnswerArea = document.getElementById('practiceAnswerArea');
const practiceATime = document.getElementById('practiceATime');
const practiceAImage = document.getElementById('practiceAImage');
const prevQBtn = document.getElementById('prevQBtn');
const nextQBtn = document.getElementById('nextQBtn');
const endPracticeBtn = document.getElementById('endPracticeBtn');

// --- NTA UI Elements ---

const ntaInterfaceContainer = document.getElementById('ntaInterfaceContainer');
const ntaSubjectTabs = document.getElementById('ntaSubjectTabs');
const ntaTotalTimer = document.getElementById('ntaTotalTimer');
const ntaQuestionLabel = document.getElementById('ntaQuestionLabel');
const ntaQuestionStopwatch = document.getElementById('ntaQuestionStopwatch');
const ntaQImage = document.getElementById('ntaQImage');
const ntaCheckAnswerBtn = document.getElementById('ntaCheckAnswerBtn');
const ntaAnswerArea = document.getElementById('ntaAnswerArea');
const ntaAImage = document.getElementById('ntaAImage');
const ntaCorrectBtn = document.getElementById('ntaCorrectBtn');
const ntaIncorrectBtn = document.getElementById('ntaIncorrectBtn');
const ntaSaveNextBtn = document.getElementById('ntaSaveNextBtn');
const ntaSaveReviewBtn = document.getElementById('ntaSaveReviewBtn');
const ntaClearBtn = document.getElementById('ntaClearBtn');
const ntaMarkReviewBtn = document.getElementById('ntaMarkReviewBtn');
const ntaBackBtn = document.getElementById('ntaBackBtn');
const ntaNextBtn = document.getElementById('ntaNextBtn');
const ntaSubmitBtn = document.getElementById('ntaSubmitBtn');
const ntaPaletteGrid = document.getElementById('ntaPaletteGrid');
const ntaFullScreenBtn = document.getElementById('ntaFullScreenBtn');
const ntaToggleSidebarBtn = document.getElementById('ntaToggleSidebarBtn');

const summaryContainer = document.getElementById('summaryContainer');
const summaryTotalTime = document.getElementById('summaryTotalTime');
const summaryAttempted = document.getElementById('summaryAttempted');
const summaryTotal = document.getElementById('summaryTotal');
// New UI Elements
const ntaToggleScratchpadBtn = document.getElementById('ntaToggleScratchpadBtn');
const ntaCloseScratchpadBtn = document.getElementById('ntaCloseScratchpadBtn');
const ntaScratchpad = document.getElementById('ntaScratchpad');
const ntaScratchpadInput = document.getElementById('ntaScratchpadInput');
const resumeSessionModal = document.getElementById('resumeSessionModal');
const discardSessionBtn = document.getElementById('discardSessionBtn');
const resumeSessionBtn = document.getElementById('resumeSessionBtn');
const radarChartContainer = document.getElementById('radarChartContainer');
const performanceRadarChart = document.getElementById('performanceRadarChart');


// =============================================================
// STATE
// =============================================================
let pdfDoc  = null;
let pdfFile = null;
let extractedImages  = [];
let pdfDocAnswers = null;
let pdfFileAnswers = null;
let extractedAnswers = [];
let extractedAnswerPages = [];
let isProcessingAnswers = false;
let globalLayoutState = { columns: [], pageLayouts: {} };
let currentExercise = null;

let wizardStep = 1; // 1: Upload Q, 2: Config Q, 3: Upload A, 4: Config A

// --- Practice State ---
let practiceState = {
    theme: 'modern', // 'modern' or 'nta'
    currentIndex: 0,
    totalSecondsRemaining: 0,
    stats: [],
    qTimerInterval: null,
    globalTimerInterval: null,
    scorePerQ: 4,
    negativeMarking: true,
    scratchpadNotes: {}, // Store notes by question realIndex
    answers: {} // Store selected options (A,B,C,D) by realIndex
};

let currentSessionId = null;

// =============================================================
// AUTO-SAVE SESSION LOGIC
// =============================================================
let saveTimeout = null;
function saveSession() {
    if (!currentSessionId) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        const sessionData = {
            practiceState: {
                ...practiceState,
                qTimerInterval: null, 
                globalTimerInterval: null
            },
            extractedImages,
            extractedAnswerPages,
            currentSessionId
        };
        localforage.setItem('activeSession', sessionData).catch(console.error);
    }, 1000);
}

function clearSession() {
    localforage.removeItem('activeSession').catch(console.error);
}
let qConfig = { startPage: 1, endPage: 1, topMargin: 0.15, bottomMargin: 0.85 };
let aConfig = { startPage: 1, endPage: 1, topMargin: 0.15, bottomMargin: 0.85 };

// =============================================================
// INDEXEDDB FOR PRACTICE HISTORY & BOOKMARKS
// =============================================================
const DB_NAME = 'JeeMockDB';
const DB_VERSION = 3; // Incremented for bookmarks
const STORE_NAME = 'sessions';
const BOOKMARK_STORE = 'bookmarks';
const NOTES_STORE = 'notes';
let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = (e) => {
            console.error('IndexedDB error:', e.target.errorCode);
            reject(e);
        };
        request.onsuccess = (e) => {
            db = e.target.result;
            resolve(db);
        };
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(BOOKMARK_STORE)) {
                db.createObjectStore(BOOKMARK_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(NOTES_STORE)) {
                db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
            }
        };
    });
}

async function saveSessionToDB(sessionData) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(sessionData);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
    });
}

async function getAllSessionsFromDB() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = (e) => {
            const sessions = e.target.result.sort((a, b) => b.id - a.id);
            resolve(sessions);
        };
        request.onerror = (e) => reject(e);
    });
}

async function getSessionFromDB(id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e);
    });
}

async function deleteSessionFromDB(id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
    });
}

async function saveBookmarkGroup(groupData) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([BOOKMARK_STORE], 'readwrite');
        const store = tx.objectStore(BOOKMARK_STORE);
        const request = store.put(groupData);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
    });
}

async function getAllBookmarkGroups() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([BOOKMARK_STORE], 'readonly');
        const store = tx.objectStore(BOOKMARK_STORE);
        const request = store.getAll();
        request.onsuccess = (e) => {
            const groups = e.target.result.sort((a, b) => b.timestamp - a.timestamp);
            resolve(groups);
        };
        request.onerror = (e) => reject(e);
    });
}

async function addQuestionToBookmarkGroup(groupId, groupName, questionData) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([BOOKMARK_STORE], 'readwrite');
        const store = tx.objectStore(BOOKMARK_STORE);
        const getRequest = store.get(groupId);
        
        getRequest.onsuccess = (e) => {
            let group = e.target.result;
            if (!group) {
                group = {
                    id: groupId,
                    name: groupName,
                    timestamp: Date.now(),
                    questions: []
                };
            }
            
            if (!group.questions.find(q => q.label === questionData.label && q.dataUrl === questionData.dataUrl)) {
                if (!questionData.bookmarkId) {
                    questionData.bookmarkId = 'bmq_' + Date.now() + Math.random().toString(36).substr(2, 5);
                }
                group.questions.push(questionData);
            }
            
            group.timestamp = Date.now();
            
            const putRequest = store.put(group);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = (err) => reject(err);
        };
        getRequest.onerror = (e) => reject(e);
    });
}


async function deleteBookmarkGroup(groupId) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([BOOKMARK_STORE], 'readwrite');
        const store = tx.objectStore(BOOKMARK_STORE);
        const request = store.delete(groupId);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
    });
}

async function removeQuestionFromBookmarkGroup(groupId, bookmarkId) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([BOOKMARK_STORE], 'readwrite');
        const store = tx.objectStore(BOOKMARK_STORE);
        const getRequest = store.get(groupId);
        
        getRequest.onsuccess = (e) => {
            let group = e.target.result;
            if (!group) return resolve();
            
            group.questions = group.questions.filter(q => q.bookmarkId !== bookmarkId);
            
            const putRequest = store.put(group);
            putRequest.onsuccess = () => resolve(group);
            putRequest.onerror = (err) => reject(err);
        };
        getRequest.onerror = (e) => reject(e);
    });
}


async function saveGlobalNote(noteData) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([NOTES_STORE], 'readwrite');
        const store = tx.objectStore(NOTES_STORE);
        const request = store.put(noteData);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
    });
}

async function removeGlobalNote(id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([NOTES_STORE], 'readwrite');
        const store = tx.objectStore(NOTES_STORE);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
    });
}

async function getAllGlobalNotes() {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([NOTES_STORE], 'readonly');
        const store = tx.objectStore(NOTES_STORE);
        const request = store.getAll();
        request.onsuccess = (e) => {
            const notes = e.target.result.sort((a, b) => b.timestamp - a.timestamp);
            resolve(notes);
        };
        request.onerror = (e) => reject(e);
    });
}

function getActiveConfig() {
    return wizardStep <= 2 ? qConfig : aConfig;
}

function getActiveDoc() {
    return wizardStep <= 2 ? pdfDoc : pdfDocAnswers;
}

const RENDER_SCALE = 3.0;

// =============================================================
// PIXEL-LEVEL UTILITIES
// =============================================================

/**
 * Returns true if a horizontal pixel row has any ink
 * (i.e. at least `minCount` non-white pixels in [xMin, xMax]).
 */
function rowHasInk(data, W, y, xMin, xMax, minCount = 2) {
    let dark = 0;
    const sX = xMin + 15;
    const eX = xMax - 15;
    if (sX >= eX) return false;
    for (let x = sX; x < eX; x++) {
        const o = (y * W + x) * 4;
        // Threshold 250 to catch faint gray lines in graphs
        if (data[o] < 250 || data[o+1] < 250 || data[o+2] < 250) {
            if (++dark >= minCount) return true;
        }
    }
    return false;
}

/** Walks DOWN from startY, returns first row with ink, or maxY. */
function firstInkDown(data, W, startY, maxY, xMin, xMax) {
    for (let y = startY; y < maxY; y++)
        if (rowHasInk(data, W, y, xMin, xMax)) return y;
    return maxY;
}

/** Walks UP from startY, returns last row with ink, or minY. */
function lastInkUp(data, W, startY, minY, xMin, xMax) {
    for (let y = startY; y >= minY; y--)
        if (rowHasInk(data, W, y, xMin, xMax)) return y;
    return minY;
}

/**
 * Walks UP from rawY, finds the first row ABOVE that has ink.
 * Returns the row immediately after it = top of the whitespace gap.
 */
function gapTopAbove(data, W, rawY, xMin, xMax, topBound) {
    let y = rawY - 1;
    let gaps = [];

    while (y >= topBound) {
        // Move UP through any ink
        while (y >= topBound && rowHasInk(data, W, y, xMin, xMax)) y--;
        
        if (y < topBound) break;

        // We are in a whitespace gap. Measure its size.
        let gapBottom = y;
        while (y >= topBound && !rowHasInk(data, W, y, xMin, xMax)) y--;
        let gapTop = y + 1;
        
        gaps.push({ top: gapTop, bottom: gapBottom, size: gapBottom - gapTop + 1 });
    }

    if (gaps.length === 0) return topBound;

    // Find the first gap going up that is >= 12px (avoids stopping at minor line spacing)
    for (const gap of gaps) {
        if (gap.size >= 12) return gap.top;
    }

    // Fallback: If no gap is >= 12px, return the LARGEST gap found
    gaps.sort((a, b) => b.size - a.size);
    return gaps[0].top;
}

/**
 * Scans all rows in [topBound, bottomBound] and identifies blocks of ink
 * separated by whitespace gaps of at least `minGap` rows.
 * Returns the first block that is large enough to be "content" (not a header)
 * Scans all rows in [coarseTop, coarseBottom] and identifies blocks of ink
 * separated by whitespace gaps to trim headers and footers.
 */
function autoContentBounds(data, W, coarseTop, coarseBottom, xMin, xMax) {
    let contentTop = coarseTop;
    for (let y = coarseTop; y < coarseBottom; y++) {
        if (rowHasInk(data, W, y, xMin, xMax)) {
            contentTop = y; break;
        }
    }

    let contentBottom = coarseBottom;
    for (let y = coarseBottom; y > coarseTop; y--) {
        if (rowHasInk(data, W, y, xMin, xMax)) {
            contentBottom = y + 1; break;
        }
    }

    return { contentTop, contentBottom };
}

// =============================================================
// QUESTION TYPE CLASSIFICATION HEURISTICS
// =============================================================
function classifyQuestionType(qText) {
    if (!qText || !qText.trim()) return 'Numerical/Subjective';

    // 1. Match the Column
    if (
        /match\s+the\s+(column|list|following)/i.test(qText) ||
        (/column\s*[-_]?\s*i/i.test(qText) && /column\s*[-_]?\s*ii/i.test(qText)) ||
        (/list\s*[-_]?\s*i/i.test(qText) && /list\s*[-_]?\s*ii/i.test(qText))
    ) {
        return 'Match the Column';
    }

    // 2. MCQ Type
    const mcqPattern1 = /\([a-d]\)/gi;
    const mcqPattern2 = /\([1-4]\)/g;
    const mcqPattern3 = /(?:^|\s)[a-d]\.\s/gi;
    const mcqPattern4 = /(?:^|\s)[1-4]\.\s/g;
    const mcqPattern5 = /\([A-D]\)/g;
    const mcqPattern6 = /(?:^|\s)[A-D]\.\s/g;

    const m1 = (qText.match(mcqPattern1) || []).length;
    const m2 = (qText.match(mcqPattern2) || []).length;
    const m3 = (qText.match(mcqPattern3) || []).length;
    const m4 = (qText.match(mcqPattern4) || []).length;
    const m5 = (qText.match(mcqPattern5) || []).length;
    const m6 = (qText.match(mcqPattern6) || []).length;

    if (m1 >= 2 || m2 >= 2 || m3 >= 2 || m4 >= 2 || m5 >= 2 || m6 >= 2) {
        return 'MCQ';
    }

    // 3. Numerical & Subjective in the SAME group
    return 'Numerical/Subjective';
}

// =============================================================
// TEXT-LAYER BULLET DETECTION (Primary — Zero OCR Error)
// =============================================================

/**
 * Uses PDF.js getTextContent() to extract all text items with their
 * exact canvas-space coordinates. Groups them into lines, then detects
 * question bullet numbers using regex.
 *
 * Returns array of { y, num } sorted by y (canvas pixels, top-down).
 * `xMin/xMax` confines which column's left margin we inspect.
 */
async function detectBulletsFromTextLayer(page, viewport, xMin, xMax, coarseTop, coarseBottom, isPreScan = false) {
    const scale       = viewport.scale;
    const colLeft     = xMin;               // Canvas units
    const colRight    = xMax;
    const colW        = colRight - colLeft;
    const marginRight = colLeft + colW * 0.22; // look in left 22% of column

    let textContent;
    try {
        textContent = await page.getTextContent();
    } catch (_) {
        return [];
    }
    
    // Filter out Answer Keys from Question Detector by artificially moving coarseBottom UP
    if (!isProcessingAnswers) {
        for (const item of textContent.items) {
            if (item.str && item.str.match(/answer\s*key|answers|hints?\s*&?\s*solutions?/i)) {
                const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
                const itemY = tx[5] - (item.height * scale);
                if (itemY > coarseTop && itemY < coarseBottom) {
                    console.log(`[ANSWER KEY DETECTED] Truncating page at y=${itemY}`);
                    coarseBottom = itemY - 20;
                    break;
                }
            }
        }
    }

    // ── Group items into lines by viewport-space Y ──
    const lineMap = new Map(); // key = Math.round(canvasY) → {y, items[]}
    const THRESHOLD = 6; // px tolerance for same-line grouping
    const allTextItems = [];

    textContent.items.forEach(item => {
        if (!item.str || !item.str.trim()) return;

        // Transform PDF→Canvas coordinates
        const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
        const canvasX = tx[4];
        const canvasY = tx[5] - (item.height * scale);  // top-left Y
        const itemWidth = (item.width || 0) * scale;

        allTextItems.push({ str: item.str, x: canvasX, y: canvasY, w: itemWidth });

        if (canvasX < xMin || canvasX > xMax) return;   // wrong column
        if (canvasY < coarseTop - 30 || canvasY > coarseBottom + 30) return;
        // For answers mode, ignore X-axis filtering: answer grids span the full width
        // xMin/xMax filter above is needed for 2-col Qs, but for 1-col answer sheets skip it
        // Actually keep the filter as-is — the outer processColumn call sets xMin=0, xMax=width for 1-col pages

        // Find existing line bucket within THRESHOLD
        let found = null;
        for (const [key, line] of lineMap) {
            if (Math.abs(key - canvasY) < THRESHOLD) { found = key; break; }
        }
        const bucket = found !== null ? lineMap.get(found) : null;
        if (bucket) {
            bucket.items.push({ str: item.str, x: canvasX, y: canvasY, w: itemWidth });
        } else {
            lineMap.set(canvasY, { y: canvasY, items: [{ str: item.str, x: canvasX, y: canvasY, w: itemWidth }] });
        }
    });

    // ── Sort lines top-to-bottom, items left-to-right ──
    const lines = [...lineMap.values()].sort((a, b) => a.y - b.y);
    lines.forEach(line => line.items.sort((a, b) => a.x - b.x));

    const bullets = [];

    lines.forEach(line => {
        // A valid question bullet must be at the START of a segment.
        // We use global flag /ig to allow multiple matches per line (for answer grids)
        // We also support decimals (e.g. 1.2) and optional dots if followed by a space and capital letter.
        const BULLET_RE = /(?:^|\s)(?:Q\.?\s*)?(\d{1,3}(?:\.\d{1,2})?)(?:\s*[\.\)]|\s+(?=[A-Z\(]))/ig;
        let lineText = "";
        let textSegments = [];
        const gapThreshold = 2.0 * scale; 
        
        for (let i = 0; i < line.items.length; i++) {
            const item = line.items[i];
            if (i > 0) {
                const prev = line.items[i - 1];
                const gap = item.x - (prev.x + prev.w);
                if (gap >= gapThreshold) {
                    lineText += " ";
                }
            }
            textSegments.push({ startIndex: lineText.length, x: item.x });
            lineText += item.str;
        }
        
        let match;
        const matches = [];
        while ((match = BULLET_RE.exec(lineText)) !== null) {
            const matchIndex = match.index;
            
            // For Questions, we ONLY want bullets that appear at the very start of the line text
            // (allowing for a tiny bit of whitespace)
            if (!isProcessingAnswers && matchIndex > 2) {
                continue;
            }
            
            const numberOffset = match[0].indexOf(match[1]);
            const charIndex = matchIndex + numberOffset;
            
            let matchX = line.items[0].x;
            for (let i = textSegments.length - 1; i >= 0; i--) {
                if (charIndex >= textSegments[i].startIndex) {
                    const localIndex = charIndex - textSegments[i].startIndex;
                    const item = line.items[i];
                    const charLen = item.str.length || 1;
                    matchX = item.x + (localIndex / charLen) * item.w;
                    break;
                }
            }
            
            // Re-added filtering: Only detect questions if they are NOT heavily indented
            if (!isProcessingAnswers && !isPreScan && matchX > marginRight) {
                continue;
            }
            
            matches.push({ y: Math.floor(line.y), text: match[1], x: matchX });
            
            // If processing Questions, we ONLY care about the first bullet on a line
            // If processing Answers, we want ALL bullets to detect Grids
            if (!isProcessingAnswers) break;
        }
        
        if (matches.length > 0) {
            if (isProcessingAnswers) {
                // Return all matches on this line flatly
                bullets.push(...matches);
                console.log(`[ANSWERS] Row detected with ${matches.length} bullets:`, matches.map(m => m.text));
            } else {
                bullets.push(matches[0]); // Backwards compatibility for Questions
            }
        }
    });

    // Filter out indented options for Questions
    if (!isProcessingAnswers && !isPreScan && bullets.length > 0) {
        // Build histogram of X coordinates (bin size = 15px)
        const bins = new Map();
        bullets.forEach(b => {
            let foundBin = null;
            for (const [binX, count] of bins.entries()) {
                if (Math.abs(binX - b.x) < 15) {
                    foundBin = binX;
                    break;
                }
            }
            if (foundBin !== null) {
                bins.set(foundBin, bins.get(foundBin) + 1);
            } else {
                bins.set(b.x, 1);
            }
        });

        // Sort bins by frequency
        const sortedBins = [...bins.entries()].sort((a, b) => b[1] - a[1]);
        const validColumns = [sortedBins[0][0]];
        const maxCount = sortedBins[0][1];
        
        // Look for a second column that is horizontally distant (at least 25% of viewport width)
        for (let i = 1; i < sortedBins.length; i++) {
            const [binX, count] = sortedBins[i];
            if (Math.abs(binX - validColumns[0]) > viewport.width * 0.25) {
                if (count >= 2 || count >= maxCount * 0.2) {
                    validColumns.push(binX);
                    break; // Max 2 columns
                }
            }
        }
        
        // Filter bullets to only keep those near a valid column margin
        const filteredBullets = bullets.filter(b => {
            return validColumns.some(colX => Math.abs(colX - b.x) < 20); // 20px tolerance
        });
        
        validColumns.sort((a, b) => a - b);
        console.log(`[Q-FILTER] Retained ${filteredBullets.length} out of ${bullets.length} bullets based on column margins:`, validColumns);
        return {
            bullets: filteredBullets,
            newCoarseBottom: coarseBottom,
            validColumns: validColumns,
            textItems: allTextItems
        };
    }

    return {
        bullets: Object.values(bullets),
        newCoarseBottom: coarseBottom,
        validColumns: [],
        textItems: allTextItems
    };
}

// =============================================================
// EXERCISE HEADER DETECTION
// =============================================================
function romanToArabic(str) {
    const roman = str.toUpperCase().trim();
    const map = {
        'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5',
        'VI': '6', 'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10'
    };
    return map[roman] || str;
}

async function detectExerciseHeadersFromPage(page, viewport) {
    let textContent;
    try {
        textContent = await page.getTextContent();
    } catch (_) {
        return [];
    }

    const scale = viewport.scale;
    const lineMap = new Map();
    const THRESHOLD = 6;

    textContent.items.forEach(item => {
        if (!item.str || !item.str.trim()) return;
        const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
        const canvasY = tx[5] - (item.height * scale);
        
        let found = null;
        for (const [key, line] of lineMap) {
            if (Math.abs(key - canvasY) < THRESHOLD) { found = key; break; }
        }
        const itemWidth = (item.width || 0) * scale;
        if (found !== null) {
            lineMap.get(found).items.push({ str: item.str, x: tx[4], w: itemWidth });
        } else {
            lineMap.set(canvasY, { y: canvasY, items: [{ str: item.str, x: tx[4], w: itemWidth }] });
        }
    });

    const headers = [];
    for (const [y, line] of lineMap) {
        line.items.sort((a, b) => a.x - b.x);
        // Normalize em-dash (–), en-dash (–), and regular dash to simple hyphen
        const lineText = line.items.map(it => it.str).join(" ")
            .replace(/[\u2013\u2014\u2212]/g, '-'); // normalize all dash variants
        const match = lineText.match(/(?:EXERCISE|DPP|SHEET|SECTION|SELF ASSESSMENT|PRACTICE SHEET|TEST)\s*[-:\s]*\s*([0-9IVXivx\.]+)/i);
        if (match) {
            const type = match[0].match(/EXERCISE|DPP|SHEET|SECTION|SELF ASSESSMENT|PRACTICE SHEET|TEST/i)[0];
            const num = match[1];
            const normalizedNum = romanToArabic(num);
            const capitalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
            const headerName = `${capitalized} ${normalizedNum}`;
            console.log(`[HEADER] Detected: "${headerName}" at y=${Math.floor(y)}`);
            headers.push({ y: Math.floor(y), name: headerName, x: line.items[0].x });
        }
    }
    headers.sort((a, b) => a.y - b.y);
    return headers;
}

// =============================================================
// DRAG & DROP
// =============================================================
dropZone.addEventListener('dragenter', e => { e.preventDefault(); });
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('bg-blue-50'); });
dropZone.addEventListener('dragleave',e => { e.preventDefault(); dropZone.classList.remove('bg-blue-50'); });
dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('bg-blue-50');
    if (e.dataTransfer.files.length) loadPDF(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', e => { if (e.target.files.length) loadPDF(e.target.files[0]); });
cancelBtn.addEventListener('click', () => {
    // Reset Everything
    wizardStep = 1;
    pdfDoc = null; pdfFile = null;
    pdfDocAnswers = null; pdfFileAnswers = null;
    qConfig = { startPage: 1, endPage: 1, topMargin: 0.15, bottomMargin: 0.85 };
    aConfig = { startPage: 1, endPage: 1, topMargin: 0.15, bottomMargin: 0.85 };
    
    uploadContainer.classList.remove('hidden');
    document.getElementById('historyContainer').classList.remove('hidden');
    
    // Also explicitly unhide bookmarks container if there are bookmarks
    if (typeof renderBookmarks === 'function') {
        renderBookmarks();
        if (typeof renderNotedQuestions === 'function') renderNotedQuestions();
    }
    
    configContainer.classList.add('hidden');
    practiceSetupContainer.classList.add('hidden');
    practiceInterfaceContainer.classList.add('hidden');
    summaryContainer.classList.add('hidden');
    fileInput.value = '';
    
    // Reset upload UI
    dropTextMain.textContent = 'Upload DPP or PYQ';
    dropTextSub.textContent = 'Drag & drop or click to browse';
    skipAnswersBtn.classList.add('hidden');
    dropZone.classList.remove('hover:-green-400', 'hover:bg-green-50');
    dropZone.classList.add('hover:', 'hover:bg-blue-50');
});

// =============================================================
// WIZARD NAVIGATION LOGIC
// =============================================================
document.querySelectorAll('input[name="answerKeySource"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'same') {
            wizardNextBtn.innerHTML = '<span>Next: Config Answer Key</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
        } else {
            wizardNextBtn.innerHTML = '<span>Next: Upload Answer Key</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
        }
    });
});

wizardNextBtn.addEventListener('click', async () => {
    if (wizardStep === 2) {
        const source = document.querySelector('input[name="answerKeySource"]:checked').value;
        if (source === 'same') {
            // Same PDF flow
            pdfFileAnswers = pdfFile;
            pdfDocAnswers = pdfDoc;
            aConfig.startPage = Math.min(qConfig.endPage, pdfDoc.numPages); // Default answer key start page
            aConfig.endPage = pdfDoc.numPages;
            aConfig.topMargin = qConfig.topMargin;
            aConfig.bottomMargin = qConfig.bottomMargin;
            wizardStep = 4; // Move straight to Config As
            
            wizardNextBtn.classList.add('hidden');
            wizardSkipScanBtn.classList.add('hidden');
            startFinalScanBtn.classList.remove('hidden');
            
            document.getElementById('pageRangeTitle').textContent = 'Answer Key Setup';
            document.getElementById('answerKeySourceContainer').classList.add('hidden');
            
            startPageInput.value = aConfig.startPage;
            startPageInput.max = pdfDoc.numPages;
            endPageInput.value   = aConfig.endPage;
            endPageInput.max  = pdfDoc.numPages;
            totalPagesText.textContent = `Total pages in document: ${pdfDoc.numPages}`;
            await renderPreview(aConfig.startPage, firstPageCanvas, firstCtx);
            topLine.style.top    = `${aConfig.topMargin * 100}%`;
            bottomLine.style.top = `${aConfig.bottomMargin * 100}%`;
        } else {
            // Different PDF flow
            wizardStep = 3;
            configContainer.classList.add('hidden');
            uploadContainer.classList.remove('hidden');
            
            // Update Upload UI for Answers
            dropTextMain.textContent = 'Upload Answer Key PDF';
            dropTextSub.textContent = 'Drag & drop or click to browse';
            // skipAnswersBtn.classList.remove('hidden'); // Force user to upload answer key
            dropZone.classList.add('hover:-green-400', 'hover:bg-green-50');
            dropZone.classList.remove('hover:', 'hover:bg-blue-50');
        }
    }
});

skipAnswersBtn.addEventListener('click', () => {
    // Skip answering, go directly to Scan
    wizardStep = 5;
    pdfDocAnswers = null;
    startFinalScanBtn.click();
});

wizardSkipScanBtn.addEventListener('click', () => {
    // Also skips answers, but triggered from Step 2 config screen
    wizardStep = 5;
    pdfDocAnswers = null;
    startFinalScanBtn.click();
});

// =============================================================
// PDF LOAD & PREVIEW
// =============================================================
async function loadPDF(file) {
    if (file.type !== 'application/pdf') { alert('Please upload a valid PDF file.'); return; }
    
    try {
        const ab  = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: ab }).promise;
        const total = doc.numPages;

        if (wizardStep === 1) {
            pdfFile = file;
            pdfDoc = doc;
            qConfig.startPage = 1;
            qConfig.endPage = total;
            wizardStep = 2; // Move to Config Qs
            
            // Show wizard buttons, hide final scan
            wizardNextBtn.classList.remove('hidden');
            // wizardSkipScanBtn.classList.remove('hidden'); // Force user to upload answer key
            startFinalScanBtn.classList.add('hidden');
            
            document.getElementById('pageRangeTitle').textContent = 'Questions Setup';
            document.getElementById('answerKeySourceContainer').classList.remove('hidden');
            document.querySelector('input[name="answerKeySource"][value="different"]').checked = true;
            wizardNextBtn.innerHTML = '<span>Next: Upload Answer Key</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
            
        } else if (wizardStep === 3) {
            pdfFileAnswers = file;
            pdfDocAnswers = doc;
            aConfig.startPage = 1;
            aConfig.endPage = total;
            wizardStep = 4; // Move to Config As
            
            // Hide wizard buttons, show final scan
            wizardNextBtn.classList.add('hidden');
            wizardSkipScanBtn.classList.add('hidden');
            startFinalScanBtn.classList.remove('hidden');
            
            document.getElementById('pageRangeTitle').textContent = 'Answer Key Setup';
            document.getElementById('answerKeySourceContainer').classList.add('hidden');
        }

        const config = getActiveConfig();
        startPageInput.value = config.startPage;    startPageInput.max = total;
        endPageInput.value   = config.endPage;      endPageInput.max  = total;
        totalPagesText.textContent = `Total pages in document: ${total}`;

        uploadContainer.classList.add('hidden');
        document.getElementById('historyContainer')?.classList.add('hidden');
        document.getElementById('bookmarksContainer')?.classList.add('hidden');
        document.getElementById('notedQsContainer')?.classList.add('hidden');
        
        configContainer.classList.remove('hidden');
        practiceSetupContainer.classList.add('hidden');
        practiceInterfaceContainer.classList.add('hidden');
        summaryContainer.classList.add('hidden');

        await renderPreview(config.startPage, firstPageCanvas, firstCtx);
        topLine.style.top    = `${config.topMargin * 100}%`;
        bottomLine.style.top = `${config.bottomMargin * 100}%`;
    } catch (err) {
        console.error(err); alert('Failed to load PDF.'); cancelBtn.click();
    }
}

startPageInput.addEventListener('change', async () => {
    const doc = getActiveDoc();
    const config = getActiveConfig();
    const p = Math.max(1, Math.min(parseInt(startPageInput.value)||1, doc?.numPages||1));
    startPageInput.value = p;
    config.startPage = p;
    await renderPreview(p, firstPageCanvas, firstCtx);
});
endPageInput.addEventListener('change', async () => {
    const doc = getActiveDoc();
    const config = getActiveConfig();
    const p = Math.max(1, Math.min(parseInt(endPageInput.value)||1, doc?.numPages||1));
    endPageInput.value = p;
    config.endPage = p;
});

async function renderPreview(pageNum, canvas, ctx) {
    const doc = getActiveDoc();
    if (!doc) return;
    const page = await doc.getPage(pageNum);
    const vp   = page.getViewport({ scale: 1.0 });
    canvas.width = vp.width; canvas.height = vp.height;
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
}

window.addEventListener('resize', () => {
    const config = getActiveConfig();
    topLine.style.top    = `${config.topMargin * 100}%`;
    bottomLine.style.top = `${config.bottomMargin * 100}%`;
});

// =============================================================
// DRAGGABLE MARGIN LINES
// =============================================================
let activeLine = null;
function setupDraggable(el, canvas, isTop) {
    const start = e => {
        e.preventDefault();
        activeLine = { el, canvas, isTop };
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup',   endDrag);
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('touchend',  endDrag);
    };
    el.addEventListener('mousedown',  start);
    el.addEventListener('touchstart', start);
}
setupDraggable(topLine,    firstPageCanvas, true);
setupDraggable(bottomLine, firstPageCanvas, false);

function onDrag(e) {
    if (!activeLine) return;
    e.preventDefault();
    const cy   = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = activeLine.canvas.getBoundingClientRect();
    const rel  = Math.max(0, Math.min(1, (cy - rect.top) / rect.height));
    const config = getActiveConfig();
    
    if (activeLine.isTop) { config.topMargin = rel; }
    else                  { config.bottomMargin = rel; }
    
    activeLine.el.style.top = `${rel * 100}%`;
}
function endDrag() {
    activeLine = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup',   endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend',  endDrag);
}

// =============================================================
// MAIN SCAN LOOP
// =============================================================
let fakeLoadInterval = null;

startFinalScanBtn.addEventListener('click', async () => {
    // Basic validation
    if (qConfig.startPage < 1 || qConfig.endPage < qConfig.startPage || qConfig.endPage > pdfDoc.numPages) {
        alert('Invalid page range for Questions PDF.'); return;
    }
    if (pdfDocAnswers && (aConfig.startPage < 1 || aConfig.endPage < aConfig.startPage || aConfig.endPage > pdfDocAnswers.numPages)) {
        alert('Invalid page range for Answers PDF.'); return;
    }

    if (fakeLoadInterval) {
        clearInterval(fakeLoadInterval);
        fakeLoadInterval = null;
    }

    // Randomized loading time between 15 and 30 seconds
    const targetDurationSec = Math.floor(Math.random() * (30 - 15 + 1)) + 15;
    const scanStartTime = Date.now();

    configContainer.classList.add('hidden');
    progressContainer.classList.remove('hidden');

    // Attempt to push/render AdSense ad inside loading screen
    try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        // AdSense might already be initialized or blocked by adblocker
    }

    extractedImages = [];
    extractedAnswers = [];
    extractedAnswerPages = [];
    currentQuestion = null;

    try {
        progressText.textContent = 'Initializing...';
        progressBar.style.width  = '3%';

        // --- 1. PROCESS QUESTIONS PDF ---
        isProcessingAnswers = false;
        currentExercise = null;
        
        progressText.textContent = 'Pre-scanning document layouts...';
        await preScanDocument(pdfDoc, qConfig);
        
        let totalQ = qConfig.endPage - qConfig.startPage + 1;
        let doneQ = 0;

        for (let pg = qConfig.startPage; pg <= qConfig.endPage; pg++) {
            progressText.textContent = `Processing Questions: page ${pg} / ${qConfig.endPage}…`;
            progressBar.style.width  = `${5 + (doneQ / totalQ) * 40}%`;
            await processPage(pg, qConfig.startPage, qConfig.endPage, null, pdfDoc, qConfig);
            doneQ++;
        }
        if (currentQuestion) { finalizeQuestion(currentQuestion); currentQuestion = null; }

        // --- 2. PROCESS ANSWERS PDF (IF PROVIDED) ---
        if (pdfDocAnswers) {
            isProcessingAnswers = true;
            currentExercise = null;
            let totalA = aConfig.endPage - aConfig.startPage + 1;
            let doneA = 0;
            for (let pg = aConfig.startPage; pg <= aConfig.endPage; pg++) {
                progressText.textContent = `Processing Answers: page ${pg} / ${aConfig.endPage}…`;
                progressBar.style.width  = `${45 + (doneA / totalA) * 40}%`;
                await processAnswerKeyPage(pg, aConfig, pdfDocAnswers);
                doneA++;
            }
        }

        linkQuestionsAndAnswers();

        // --- 3. VARIABLE FAKE LOADING TIME (15 - 30 seconds total) ---
        const fakeMessages = [
            "Optimizing OCR question layout & image quality...",
            "Matching question numbers with answer key data...",
            "Preparing interactive CBT examination environment...",
            "Finalizing paper slicing & metadata generation..."
        ];

        let startWidth = parseFloat(progressBar.style.width) || 85;
        if (startWidth > 92) startWidth = 85;

        const targetMs = targetDurationSec * 1000;
        let elapsedMs = Date.now() - scanStartTime;
        let remainingMs = Math.max(500, targetMs - elapsedMs);

        // Smoothly progress remaining bar percentage up to 100% over targetMs
        const updateInterval = 100;
        let stepCount = 0;

        await new Promise((resolve) => {
            fakeLoadInterval = setInterval(() => {
                stepCount++;
                const curElapsed = Date.now() - scanStartTime;
                const ratio = Math.min(1, curElapsed / targetMs);
                
                const curWidth = startWidth + (100 - startWidth) * ratio;
                progressBar.style.width = `${Math.min(99, curWidth).toFixed(1)}%`;

                const msgIndex = Math.min(fakeMessages.length - 1, Math.floor(ratio * fakeMessages.length));
                const currentMsg = fakeMessages[msgIndex];
                
                progressText.textContent = `${currentMsg} (${Math.floor(curWidth)}%)`;

                if (curElapsed >= targetMs) {
                    clearInterval(fakeLoadInterval);
                    fakeLoadInterval = null;
                    resolve();
                }
            }, updateInterval);
        });

        progressBar.style.width  = '100%';
        progressText.textContent = `Done! Found ${extractedImages.length} questions and ${extractedAnswers.length} answers.`;
        
        // Brief pause at 100% for smooth UX
        await new Promise(r => setTimeout(r, 400));

        progressContainer.classList.add('hidden');
        if (extractedImages.length > 0) {
            showPracticeSetup();
        } else {
            alert("No questions were extracted. Please try adjusting your margins.");
            configContainer.classList.remove('hidden');
        }

    } catch (err) {
        if (fakeLoadInterval) {
            clearInterval(fakeLoadInterval);
            fakeLoadInterval = null;
        }
        console.error(err);
        alert('Processing failed: ' + err.message);
        configContainer.classList.remove('hidden');
        progressContainer.classList.add('hidden');
    }
});


// =============================================================
// ANSWER KEY PAGE PROCESSOR (Horizontal Slicing Approach)
// =============================================================
async function processAnswerKeyPage(pageNum, config, doc) {
    const page     = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: RENDER_SCALE });

    const canvas = document.createElement('canvas');
    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    const topPx = Math.floor(config.topMargin * viewport.height);
    const botPx = Math.floor(config.bottomMargin * viewport.height);

    extractedAnswerPages.push({
        page: pageNum,
        dataUrl: canvas.toDataURL('image/jpeg', 0.85),
        viewportHeight: viewport.height
    });

    const result = await detectBulletsFromTextLayer(page, viewport, 0, viewport.width, topPx, botPx);
    const rawBullets = result.bullets;
    const newBotPx = result.newCoarseBottom;
    
    // Group bullets that are very close in Y
    const yBands = [];
    rawBullets.sort((a, b) => a.y - b.y);
    
    for (const b of rawBullets) {
        let added = false;
        for (const band of yBands) {
            if (Math.abs(band.y - b.y) < 5) {
                band.bullets.push(b);
                band.y = Math.min(band.y, b.y); // Use the highest point
                added = true;
                break;
            }
        }
        if (!added) {
            yBands.push({ y: b.y, bullets: [b] });
        }
    }
    
    yBands.sort((a, b) => a.y - b.y);
    const pageHeaders = await detectExerciseHeadersFromPage(page, viewport);

    for (let i = 0; i < yBands.length; i++) {
        const band = yBands[i];
        
        let rowTop = Math.max(topPx, band.y - 4);
        let rowBottom = newBotPx;
        
        if (i < yBands.length - 1) {
            rowBottom = Math.min(newBotPx, yBands[i+1].y - 4);
        } else {
            rowBottom = Math.min(newBotPx, band.y + 60); 
        }
        
        for (const hdr of pageHeaders) {
            if (hdr.y > band.y && hdr.y < rowBottom) {
                rowBottom = hdr.y - 5;
            }
        }
        
        const h = rowBottom - rowTop;
        if (h <= 5) continue;
        
        // Update global currentExercise
        for (const hdr of pageHeaders) {
            if (hdr.y < band.y && !hdr.used) {
                currentExercise = hdr.name;
                hdr.used = true;
            }
        }
        
        // Sort bullets left-to-right just to be safe
        band.bullets.sort((a, b) => a.x - b.x);
        
        for (let k = 0; k < band.bullets.length; k++) {
            const b = band.bullets[k];
            
            // 15px consistent left padding for every answer
            let cellLeft = Math.max(0, b.x - 15);
            
            // Push the right boundary all the way up to the next answer's left padding!
            // This guarantees the answer text gets ALL available horizontal space!
            let cellRight = viewport.width;
            if (k < band.bullets.length - 1) {
                const nextX = band.bullets[k+1].x;
                cellRight = nextX - 15;
            }
            
            const cellW = cellRight - cellLeft;
            if (cellW <= 5) continue;
            
            const cellCropped = cropCanvas(canvas, cellLeft, rowTop, cellW, h);
            if (!cellCropped) continue;
            
            let labelStr = `Q. ${b.text}`;
            if (currentExercise) labelStr = `${currentExercise} - ${labelStr}`;
    
            extractedAnswers.push({
                id:      `a_${pageNum}_${Math.random().toString(36).substr(2,6)}`,
                dataUrl: cellCropped.toDataURL('image/png'),
                page:    pageNum,
                label:   labelStr
            });
        }
    }
    
    // Any unused headers
    for (const hdr of pageHeaders) {
        if (!hdr.used) {
            currentExercise = hdr.name;
            hdr.used = true;
        }
    }
}

// =============================================================
// PAGE PROCESSOR (Viewport Approach)
// =============================================================
// PAGE PROCESSOR (Horizontal Slicing Approach)
// =============================================================

async function preScanDocument(doc, config) {
    if (isProcessingAnswers) return; // Only needed for questions
    
    globalLayoutState = { columns: [], pageLayouts: {} };
    
    const globalBins = new Map();
    const pageBulletsMap = {};
    
    // Pass 1: Collect all question bullets across all pages
    const numPages = config.endPage ? Math.min(config.endPage, doc.numPages) : doc.numPages;
    for (let pageNum = config.startPage; pageNum <= numPages; pageNum++) {
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: RENDER_SCALE });
        
        let topPx = 0, botPx = viewport.height;
        if (config.margins) {
            topPx = (config.margins.top / 100) * viewport.height;
            botPx = viewport.height - ((config.margins.bottom / 100) * viewport.height);
        }
        
        // Pass isPreScan = true to disable marginRight filtering
        const result = await detectBulletsFromTextLayer(page, viewport, 0, viewport.width, topPx, botPx, true);
        const bullets = result.bullets;
        
        pageBulletsMap[pageNum] = bullets;
        
        bullets.forEach(b => {
            let foundBin = null;
            for (const [binX, count] of globalBins.entries()) {
                if (Math.abs(binX - b.x) < 15) {
                    foundBin = binX;
                    break;
                }
            }
            if (foundBin !== null) {
                globalBins.set(foundBin, globalBins.get(foundBin) + 1);
            } else {
                globalBins.set(b.x, 1);
            }
        });
    }
    
    // Find the true document columns from the global histogram
    if (globalBins.size > 0) {
        const sortedBins = [...globalBins.entries()].sort((a, b) => b[1] - a[1]);
        const validColumns = [sortedBins[0][0]];
        const maxCount = sortedBins[0][1];
        
        for (let i = 1; i < sortedBins.length; i++) {
            const [binX, count] = sortedBins[i];
            // Since we use global counts, require a decent chunk of the maxCount
            // We use a small threshold because a document might have 50 left questions and 10 right questions
            if (Math.abs(binX - validColumns[0]) > 200) { // e.g., separated by distance
                if (count >= Math.max(2, maxCount * 0.1)) {
                    validColumns.push(binX);
                    break; // Max 2 columns
                }
            }
        }
        validColumns.sort((a, b) => a - b);
        globalLayoutState.columns = validColumns;
        console.log(`[PRE-SCAN] Detected global columns at:`, validColumns);
    }
    
    // Pass 2: Label each page
    for (let pageNum = config.startPage; pageNum <= numPages; pageNum++) {
        const bullets = pageBulletsMap[pageNum] || [];
        
        if (globalLayoutState.columns.length === 2) {
            const midX = (globalLayoutState.columns[0] + globalLayoutState.columns[1]) / 2;
            const hasLeft = bullets.some(b => b.x < midX);
            const hasRight = bullets.some(b => b.x >= midX);
            
            if (hasLeft && hasRight) {
                globalLayoutState.pageLayouts[pageNum] = 2;
            } else {
                // If a page only has questions on one side (or no questions), we classify it as 1-column.
                // This correctly handles 1-column pages mixed into 2-column documents,
                // and avoids forcing 2-column slicing on full-width text.
                globalLayoutState.pageLayouts[pageNum] = 1;
            }
        } else {
            globalLayoutState.pageLayouts[pageNum] = 1;
        }
    }
}

async function processPage(pageNum, startPage, endPage, worker, doc = pdfDoc, config = getActiveConfig()) {
    // Check if we are processing Questions and the Answer Key is in the same PDF
    if (!isProcessingAnswers && pdfDocAnswers === doc) {
        if (pageNum > aConfig.startPage) {
            // This is entirely an Answer Key page, skip it completely.
            return;
        }
    }

    const page     = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: RENDER_SCALE });

    // Render full page to canvas
    const canvas = document.createElement('canvas');
    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    const topPct = config.topMargin;
    let botPct = config.bottomMargin;

    // Dynamically adjust the bottom margin for questions if the answer key starts on this page
    if (!isProcessingAnswers && pdfDocAnswers === doc && pageNum === aConfig.startPage) {
        botPct = Math.min(botPct, aConfig.topMargin);
    }

    const coarseTop    = Math.floor(topPct * viewport.height);
    const coarseBottom = Math.floor(botPct * viewport.height);

    const pageLayout = globalLayoutState.pageLayouts[pageNum] || 1;
    const pageHeaders = await detectExerciseHeadersFromPage(page, viewport);
    const processColumn = async (cropX, cropW) => {
        // We detect bullets JUST for this column bounds
        const result = await detectBulletsFromTextLayer(page, viewport, cropX, cropX + cropW, coarseTop, coarseBottom);
        const colBullets = result.bullets;
        let newCoarseBottom = result.newCoarseBottom; // usually same as coarseBottom unless answer key truncated it
        
        if (colBullets.length === 0) return;
        
        // Group bullets that are very close in Y (e.g. side-by-side or slight misalignment)
        const yBands = [];
        colBullets.sort((a, b) => a.y - b.y);
        
        for (const b of colBullets) {
            let added = false;
            for (const band of yBands) {
                if (Math.abs(band.y - b.y) < 15) {
                    band.bullets.push(b);
                    band.y = Math.min(band.y, b.y); // Use the highest point
                    added = true;
                    break;
                }
            }
            if (!added) {
                yBands.push({ y: b.y, bullets: [b] });
            }
        }
        
        yBands.sort((a, b) => a.y - b.y);

        // Detect Comprehension headers to adjust splits
        const colLinesMap = new Map();
        for (const item of (result.textItems || [])) {
            if (item.x >= cropX - 20 && item.x <= cropX + cropW + 20) {
                let found = null;
                for (const [y, line] of colLinesMap) {
                    if (Math.abs(y - item.y) < 6) { found = y; break; }
                }
                if (found) {
                    colLinesMap.get(found).push(item);
                } else {
                    colLinesMap.set(item.y, [item]);
                }
            }
        }
        
        const compYStarts = [];
        for (const [y, items] of colLinesMap) {
            items.sort((a, b) => a.x - b.x);
            const text = items.map(it => it.str).join(' ').trim();
            if (/^(?:comprehension|passage|paragraph|read the following)/i.test(text) || 
                /(?:comprehension|passage|paragraph)\s*(?:type|for|[-:\d])/i.test(text) ||
                text.toLowerCase().includes("comprehension type") ||
                text.toLowerCase().includes("paragraph for")) {
                compYStarts.push(y);
            }
        }
        compYStarts.sort((a, b) => a - b);

        // Calculate split points for each band
        const splitPoints = [];
        for (let i = 0; i < yBands.length; i++) {
            let defaultSplit = yBands[i].y - 15;
            let prevY = (i === 0) ? coarseTop : yBands[i-1].y + 15;
            
            let bestCompY = null;
            for (const cy of compYStarts) {
                if (cy > prevY && cy < yBands[i].y) {
                    // find the FIRST comprehension header in this gap
                    if (bestCompY === null || cy < bestCompY) {
                        bestCompY = cy;
                    }
                }
            }
            
            if (bestCompY !== null) {
                splitPoints.push(Math.max(coarseTop, bestCompY - 15));
            } else {
                splitPoints.push(Math.max(coarseTop, defaultSplit));
            }
        }
        splitPoints.push(newCoarseBottom);

        let orphanTop = coarseTop;
        let orphanBottom = splitPoints[0];

        // Prevent headers from being stitched into previous questions
        let lowestHeaderY = null;
        for (const hdr of pageHeaders) {
            if (hdr.x >= cropX && hdr.x < cropX + cropW) {
                if (hdr.y >= coarseTop && hdr.y < orphanBottom) {
                    lowestHeaderY = hdr.y + 30; // Estimate header height + some padding
                }
            }
        }
        
        if (lowestHeaderY !== null) {
            orphanTop = lowestHeaderY;
        }

        const orphanH = orphanBottom - orphanTop;
        if (orphanH > 10 && extractedImages.length > 0 && !isProcessingAnswers) {
            // There is significant orphan content, and a previous question exists!
            const orphanCanvas = cropCanvas(canvas, cropX, orphanTop, cropW, orphanH);
            if (orphanCanvas) {
                const prev = extractedImages[extractedImages.length - 1];
                prev.dataUrl = await stitchImages(prev.dataUrl, orphanCanvas);
            }
        }

        // Crop horizontally for each band
        for (let i = 0; i < yBands.length; i++) {
            const band = yBands[i];
            
            let rowTop = splitPoints[i];
            let rowBottom;
            if (i < yBands.length - 1) {
                rowBottom = Math.min(newCoarseBottom, splitPoints[i+1] + 13);
            } else {
                rowBottom = newCoarseBottom;
            }
            
            // Prevent overlapping into the next exercise header
            for (const hdr of pageHeaders) {
                if (hdr.x >= cropX && hdr.x < cropX + cropW) {
                    if (hdr.y > band.y && hdr.y < rowBottom) {
                        rowBottom = hdr.y - 5;
                    }
                }
            }
            
            const h = rowBottom - rowTop;
            if (h <= 5) continue;
            
            const cropped = cropCanvas(canvas, cropX, rowTop, cropW, h);
            if (!cropped) continue;
            
            // Update global currentExercise if we pass a header in this column
            for (const hdr of pageHeaders) {
                if (hdr.x >= cropX && hdr.x < cropX + cropW && hdr.y < band.y && !hdr.used) {
                    currentExercise = hdr.name;
                    hdr.used = true;
                }
            }
            
            // Create label from all bullets in this band (e.g., "1, 6")
            const nums = band.bullets.map(b => b.text).join(', ');
            let labelStr = `Q. ${nums}`;
            
            if (currentExercise) labelStr = `${currentExercise} - ${labelStr}`;

            const qItems = (result.textItems || []).filter(item => 
                item.x >= cropX - 5 && item.x <= cropX + cropW + 5 &&
                item.y >= rowTop - 5 && item.y <= rowBottom + 5
            );
            qItems.sort((a, b) => {
                if (Math.abs(a.y - b.y) > 6) return a.y - b.y;
                return a.x - b.x;
            });
            const qText = qItems.map(item => item.str).join(' ');
            const qType = classifyQuestionType(qText);

            extractedImages.push({
                id:      `q_${pageNum}_${Math.random().toString(36).substr(2,6)}`,
                dataUrl: cropped.toDataURL('image/png'),
                page:    pageNum,
                label:   `${labelStr} [${qType}]`,
                type:    qType
            });
        }
        
        // Any unused headers in this column take effect for the next column/page
        for (const hdr of pageHeaders) {
            if (hdr.x >= cropX && hdr.x < cropX + cropW && !hdr.used) {
                currentExercise = hdr.name;
                hdr.used = true;
            }
        }
    };

    if (pageLayout === 2 && !isProcessingAnswers && globalLayoutState.columns.length === 2) {
        const splitX = globalLayoutState.columns[1] - 15;
        await processColumn(0, splitX);
        await processColumn(splitX, viewport.width - splitX);
    } else {
        await processColumn(0, viewport.width);
    }
}

// =============================================================
// LINKING ALGORITHM
function getExerciseFromLabel(label) {
    if (label.includes(' - ')) {
        return label.split(' - ')[0].trim().toLowerCase();
    }
    return '';
}

function getNumbersFromLabel(label) {
    let qPart = label ? label.replace(/\[.*?\]/g, '') : '';
    if (label && label.includes(' - ')) {
        qPart = qPart.split(' - ')[1] || qPart;
    }
    const clean = qPart.replace(/[^0-9,]/g, ' ').trim();
    return clean.split(/\s*,\s*|\s+/).filter(x => x);
}

function linkQuestionsAndAnswers() {
    if (extractedAnswers.length === 0) return;
    
    // Check if questions/answers have exercise prefixes
    const qHasExercise = extractedImages.some(q => q.label.includes(' - '));
    const aHasExercise = extractedAnswers.some(a => a.label.includes(' - '));
    
    // Ignore exercise matching if one side doesn't have exercises at all
    const ignoreExercise = !qHasExercise || !aHasExercise;
    
    let answerIndex = 0;
    for (let i = 0; i < extractedImages.length; i++) {
        const q = extractedImages[i];
        const qEx = getExerciseFromLabel(q.label);
        const qNums = getNumbersFromLabel(q.label);
        
        // Find the first matching answer starting from current answerIndex
        let foundIndex = -1;
        for (let j = answerIndex; j < extractedAnswers.length; j++) {
            const aLabel = extractedAnswers[j].label;
            const aEx = getExerciseFromLabel(aLabel);
            
            if (!ignoreExercise && qEx !== aEx) {
                continue;
            }
            
            const aNums = getNumbersFromLabel(aLabel);
            
            // Check if ANY number from the question label is present in the answer label
            if (qNums.some(num => aNums.includes(num))) {
                foundIndex = j;
                break;
            }
        }
        
        if (foundIndex !== -1) {
            // Match found!
            q.answerDataUrl = extractedAnswers[foundIndex].dataUrl;
            q.answerYOffset = extractedAnswers[foundIndex].yOffset;
            q.answerPage = extractedAnswers[foundIndex].page;
            // Update answerIndex so the next question starts searching from the CURRENT answer
            // (since an answer row can contain multiple answers e.g. "Q. 1, 2, 3")
            answerIndex = foundIndex;
        } else if (extractedAnswerPages.length > 0) {
            // FALLBACK TO FULL ANSWER KEY PAGE!
            let qExercise = "";
            if (q.label.includes(' - ')) {
                qExercise = q.label.split(' - ')[0];
            }
            
            let fallbackPage = extractedAnswerPages.find(ap => {
                const clean = (str) => (str || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
                return clean(ap.exercise) === clean(qExercise);
            });
            if (!fallbackPage) fallbackPage = extractedAnswerPages[extractedAnswerPages.length - 1]; // Use last parsed page if unknown
            
            if (fallbackPage) {
                q.answerDataUrl = fallbackPage.dataUrl;
                q.answerPage = fallbackPage.page;
            }
        }
    }
}

// =============================================================
// PRACTICE UI LOGIC
// =============================================================

function showPracticeSetup() {
    setupCropCount.textContent = extractedImages.length;
    const titleInput = document.getElementById('setupTestTitleInput');
    if (titleInput) {
        titleInput.value = window.currentPdfFilename || `Mock Test Session #${Date.now()}`;
    }
    practiceSetupContainer.classList.remove('hidden');
}

function logQuestionJourney(realIndex, action, details = {}) {
    if (!practiceState.stats) practiceState.stats = {};
    if (!practiceState.stats[realIndex]) {
        practiceState.stats[realIndex] = {
            timeSpent: 0,
            attempted: false,
            evaluation: null,
            exercise: 'Exercise 1',
            activeSectionNumber: (realIndex || 0) + 1,
            ntaStatus: 'not_visited',
            journey: []
        };
    }
    if (!practiceState.stats[realIndex].journey) {
        practiceState.stats[realIndex].journey = [];
    }
    practiceState.stats[realIndex].journey.push({
        action,
        timestamp: Date.now(),
        timeSpentSoFar: practiceState.stats[realIndex].timeSpent || 0,
        ...details
    });
}

function startPracticeSession(indices) {
    // Automatically trigger fullscreen mode
    try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(err => console.log("Fullscreen failed:", err));
        } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen();
        } else if (docEl.msRequestFullscreen) {
            docEl.msRequestFullscreen();
        }
    } catch(err) {
        console.error("Fullscreen API not supported or failed:", err);
    }

    practiceState.activeIndices = indices;
    practiceState.currentIndex = 0;
    practiceState.theme = 'nta';
      
      const userNameInput = document.getElementById('userName');
      if (userNameInput && userNameInput.value.trim() !== '') {
          const profileNameEl = document.getElementById('ntaProfileName');
          if (profileNameEl) profileNameEl.textContent = userNameInput.value.trim();
      }

    
    // Determine unique exercises for NTA tabs based on active indices
    const uniqueExercises = [...new Set(practiceState.activeIndices.map(idx => {
        const q = extractedImages[idx];
        if (q && q.label && q.label.includes(' - ')) return q.label.split(' - ')[0];
        return 'Exercise 1';
    }))];

    practiceSetupContainer.classList.add('hidden');
    
    if (practiceState.theme === 'nta') {
        ntaInterfaceContainer.classList.remove('hidden');
        buildNtaTabs(uniqueExercises);
        buildNtaPalette();
        updateNtaSummary();
        renderNtaQuestion(0); // 0 is the index in activeIndices
    } else {
        practiceInterfaceContainer.classList.remove('hidden');
        totalQNum.textContent = practiceState.activeIndices.length;
        renderPracticeQuestion(0);
    }
    
    startTotalTimer();
}

startPracticeBtn.addEventListener('click', () => {
    const mins = getCalculatedTimeMinutes(extractedImages.length);
    practiceState.totalSecondsRemaining = mins * 60;
    
    const scorePerQInput = document.getElementById('scorePerQInput');
    practiceState.scorePerQ = scorePerQInput ? parseInt(scorePerQInput.value) || 4 : 4;
    
    const negativeMarkingToggle = document.getElementById('negativeMarkingToggle');
    practiceState.negativeMarking = negativeMarkingToggle ? negativeMarkingToggle.checked : true;
    
    const targetTimeInput = document.getElementById('targetTimeInput');
    const globalTargetTime = targetTimeInput ? parseInt(targetTimeInput.value) || 0 : 0;
    
    currentSessionId = Date.now();
    
    // Initialize stats
    practiceState.stats = extractedImages.map((q, idx) => {
        let ex = 'Exercise 1';
        if (q.label.includes(' - ')) ex = q.label.split(' - ')[0];
        return {
            index: idx,
            timeSpent: 0,
            targetTime: globalTargetTime,
            attempted: false,
            evaluation: null, // 'correct' | 'incorrect'
            ntaStatus: 'not_visited',
            exercise: ex
        };
    });
    
    // Default active indices is ALL questions
    startPracticeSession(extractedImages.map((_, i) => i));
    
    const titleInput = document.getElementById('setupTestTitleInput');
    if (titleInput && titleInput.value.trim() !== '') {
        window.currentPdfFilename = titleInput.value.trim();
    }
    
    // Save to browser cache silently (no download prompt)
    saveCurrentSession();
});

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return h === '00' ? `${m}:${s}` : `${h}:${m}:${s}`;
}

function startTotalTimer() {
    if (practiceState.totalTimerInterval) clearInterval(practiceState.totalTimerInterval);
    updateTotalTimerDisplay();
    practiceState.totalTimerInterval = setInterval(() => {
        if (practiceState.totalSecondsRemaining > 0) {
            practiceState.totalSecondsRemaining--;
            updateTotalTimerDisplay();
        } else {
            practiceTotalTimer.classList.remove('bg-blue-100', 'text-blue-800');
            practiceTotalTimer.classList.add('bg-red-100', 'text-red-800');
        }
    }, 1000);
}

function updateTotalTimerDisplay() {
    const timeStr = formatTime(practiceState.totalSecondsRemaining);
    practiceTotalTimer.textContent = timeStr;
    ntaTotalTimer.textContent = timeStr;
}

function startQuestionStopwatch() {
    if (practiceState.qTimerInterval) clearInterval(practiceState.qTimerInterval);
    updateQuestionStopwatchDisplay();
    practiceState.qTimerInterval = setInterval(() => {
        if (!practiceState.isAnswerRevealed) {
            practiceState.qSecondsSpent++;
            practiceState.stats[practiceState.currentIndex].timeSpent = practiceState.qSecondsSpent;
            updateQuestionStopwatchDisplay();
        }
    }, 1000);
}

function updateQuestionStopwatchDisplay() {
    questionStopwatch.textContent = formatTime(practiceState.qSecondsSpent);
}

function renderPracticeQuestion(index) {
    practiceState.currentIndex = index;
    const realIndex = practiceState.activeIndices[index];
    const q = extractedImages[realIndex];
    currentQNum.textContent = index + 1;
    const typeBadge = q.type ? `<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 dark:">${q.type}</span>` : '';
    practiceQLabel.innerHTML = `Question ${q.label} ${typeBadge}`;
    
    practiceQImage.src = q.dataUrl;
    practiceQImage.onload = () => {
        const container = document.getElementById('practiceQImageContainer');
        const scaleRatio = practiceQImage.clientWidth / practiceQImage.naturalWidth;
        container.scrollTop = (q.yOffset * scaleRatio) - 20;
    };
    
    // Restore state for this question
    practiceState.qSecondsSpent = practiceState.stats[realIndex].timeSpent;
    practiceState.isAnswerRevealed = practiceState.stats[realIndex].attempted;
    
    // Reset UI states
    practiceAnswerArea.classList.add('hidden');
    checkAnswerBtn.classList.remove('hidden');
    
    if (practiceState.isAnswerRevealed) {
        showAnswer();
    } else {
        startQuestionStopwatch();
    }
    
    prevQBtn.disabled = index === 0;
    nextQBtn.disabled = index === practiceState.activeIndices.length - 1;
}

function showAnswer() {
    practiceState.isAnswerRevealed = true;
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    practiceState.stats[realIndex].attempted = true;
    
    checkAnswerBtn.classList.add('hidden');
    practiceAnswerArea.classList.remove('hidden');
    
    const q = extractedImages[realIndex];
    if (q.answerDataUrl) {
        practiceAImage.src = q.answerDataUrl;
        practiceAImage.classList.remove('hidden');
        practiceAImage.onload = () => {
            const container = document.getElementById('practiceAImageContainer');
            if (container) {
                const scaleRatio = practiceAImage.clientWidth / practiceAImage.naturalWidth;
                container.scrollTop = (q.answerYOffset * scaleRatio) - 20 || 0;
            }
        };
    } else {
        practiceAImage.classList.add('hidden');
        practiceAImage.src = '';
    }
    
    practiceATime.textContent = `Time spent: ${formatTime(practiceState.qSecondsSpent)}`;
}

checkAnswerBtn.addEventListener('click', showAnswer);

// Modern Theme Self-Evaluation
const modernCorrectBtn = document.getElementById('modernCorrectBtn');
const modernIncorrectBtn = document.getElementById('modernIncorrectBtn');

if (modernCorrectBtn) {
    modernCorrectBtn.addEventListener('click', () => {
        const realIndex = practiceState.activeIndices[practiceState.currentIndex];
        practiceState.stats[realIndex].evaluation = 'correct';
        alert("Marked as Correct!");
    });
}
if (modernIncorrectBtn) {
    modernIncorrectBtn.addEventListener('click', () => {
        const realIndex = practiceState.activeIndices[practiceState.currentIndex];
        practiceState.stats[realIndex].evaluation = 'incorrect';
        alert("Marked as Incorrect!");
    });
}

prevQBtn.addEventListener('click', () => {
    if (practiceState.currentIndex > 0) {
        renderPracticeQuestion(practiceState.currentIndex - 1);
    }
});

nextQBtn.addEventListener('click', () => {
    if (practiceState.currentIndex < practiceState.activeIndices.length - 1) {
        renderPracticeQuestion(practiceState.currentIndex + 1);
    }
});

// Removed old endPracticeBtn listener

function showSummary() {
    if (practiceState.totalTimerInterval) clearInterval(practiceState.totalTimerInterval);
    if (practiceState.qTimerInterval) clearInterval(practiceState.qTimerInterval);
    
    practiceInterfaceContainer.classList.add('hidden');
    ntaInterfaceContainer.classList.add('hidden');
    document.getElementById('historyContainer').classList.add('hidden');
    summaryContainer.classList.remove('hidden');
    
    let totalSeconds = 0;
    let attemptedCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let markedCount = 0;
    
    practiceState.activeIndices.forEach(realIndex => {
        const stat = practiceState.stats[realIndex];
        totalSeconds += stat.timeSpent;
        if (stat.attempted) attemptedCount++;
        if (stat.evaluation === 'correct') correctCount++;
        if (stat.evaluation === 'incorrect') incorrectCount++;
        if (stat.ntaStatus === 'marked' || stat.ntaStatus === 'answered-marked') markedCount++;
    });
    
    const totalQuestions = practiceState.activeIndices.length;
    const unansweredCount = totalQuestions - attemptedCount;
    
    const scorePerQ = practiceState.scorePerQ || 4;
    const hasNeg = practiceState.negativeMarking !== false;
    const penalty = hasNeg ? incorrectCount : 0;
    
    const maxScore = totalQuestions * scorePerQ;
    const score = (correctCount * scorePerQ) - penalty;
    const scorePercent = maxScore > 0 ? Math.round((Math.max(score, 0) / maxScore) * 100) : 0;
    
    const accuracy = attemptedCount > 0 ? ((correctCount / attemptedCount) * 100).toFixed(2) : '0.00';
    
    // UI Updates
    document.getElementById('summaryScore').textContent = score.toFixed(2);
    document.getElementById('summaryMaxScore').textContent = `/ ${maxScore.toFixed(2)}`;
    document.getElementById('summaryScorePercent').textContent = `${scorePercent}%`;
    document.getElementById('summaryScoreBar').style.width = `${scorePercent}%`;
    document.getElementById('summaryScoreHandle').style.left = `${scorePercent}%`;
    
    document.getElementById('summaryCorrect').textContent = correctCount;
    document.getElementById('summaryIncorrect').textContent = incorrectCount;
    document.getElementById('summaryUnanswered').textContent = unansweredCount;
    
    const cPercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const iPercent = totalQuestions > 0 ? Math.round((incorrectCount / totalQuestions) * 100) : 0;
    const uPercent = totalQuestions > 0 ? Math.round((unansweredCount / totalQuestions) * 100) : 0;
    
    document.getElementById('summaryCorrectPercent').textContent = `${cPercent}%`;
    document.getElementById('summaryCorrectBar').style.width = `${cPercent}%`;
    document.getElementById('summaryIncorrectPercent').textContent = `${iPercent}%`;
    document.getElementById('summaryIncorrectBar').style.width = `${iPercent}%`;
    document.getElementById('summaryUnansweredPercent').textContent = `${uPercent}%`;
    document.getElementById('summaryUnansweredBar').style.width = `${uPercent}%`;
    
    document.getElementById('summaryTotalTime').textContent = formatTime(totalSeconds);
    document.getElementById('summaryAccuracy').textContent = `${accuracy}%`;
    document.getElementById('summaryAttemptedStr').textContent = `${attemptedCount}/${totalQuestions}`;
    document.getElementById('summaryNegative').textContent = incorrectCount.toFixed(2);
    
    const markedBtn = document.getElementById('markedForReviewFilterBtn');
    const markedStr = document.getElementById('summaryMarkedStr');
    if (markedStr) markedStr.textContent = `Marked for Review (${markedCount})`;
    
    document.getElementById('reviewContainer').classList.add('hidden');
    
    // Clear active session since they submitted
    clearSession();
    
    // Render Radar Chart Analysis
    renderRadarChart();
    
    // Save to IndexedDB
    saveCurrentSession(totalSeconds, correctCount, incorrectCount, unansweredCount);
}

// Add event listeners for new summary buttons
document.addEventListener('DOMContentLoaded', () => {
    const viewAllBtn = document.getElementById('viewAllQuestionsBtn');
    renderBookmarks();
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            const reviewContainer = document.getElementById('reviewContainer');
            reviewContainer.classList.remove('hidden');
            renderReviewCards('all');
            // scroll to it
            reviewContainer.scrollIntoView({ behavior: 'smooth' });
        });
    }
    const markedBtn = document.getElementById('markedForReviewFilterBtn');
    if (markedBtn) {
        markedBtn.addEventListener('click', () => {
            const reviewContainer = document.getElementById('reviewContainer');
            reviewContainer.classList.remove('hidden');
            renderReviewCards('marked');
            reviewContainer.scrollIntoView({ behavior: 'smooth' });
        });
    }
    const keepPracticingBtn = document.getElementById('keepPracticingBtn');
    if (keepPracticingBtn) {
        keepPracticingBtn.addEventListener('click', () => {
            document.getElementById('backToHomeBtn').click();
        });
    }
    
    // Reattempt Listeners
    const reattemptWrongBtn = document.getElementById('reattemptWrongBtn');
    if (reattemptWrongBtn) reattemptWrongBtn.addEventListener('click', () => reattemptPractice('wrong'));
    
    const reattemptUnansweredBtn = document.getElementById('reattemptUnansweredBtn');
    if (reattemptUnansweredBtn) reattemptUnansweredBtn.addEventListener('click', () => reattemptPractice('unanswered'));
    
    const reattemptMarkedBtn = document.getElementById('reattemptMarkedBtn');
    if (reattemptMarkedBtn) reattemptMarkedBtn.addEventListener('click', () => reattemptPractice('marked'));
    
    const reattemptAllBtn = document.getElementById('reattemptAllBtn');
    if (reattemptAllBtn) reattemptAllBtn.addEventListener('click', () => reattemptPractice('all'));
});

function reattemptPractice(filterType) {
    let newIndices = [];
    practiceState.activeIndices.forEach(realIndex => {
        const stat = practiceState.stats[realIndex];
        if (filterType === 'wrong' && stat.evaluation === 'incorrect') {
            newIndices.push(realIndex);
        } else if (filterType === 'unanswered' && !stat.attempted) {
            newIndices.push(realIndex);
        } else if (filterType === 'marked' && (stat.ntaStatus === 'marked' || stat.ntaStatus === 'answered_marked')) {
            newIndices.push(realIndex);
        } else if (filterType === 'all') {
            newIndices.push(realIndex);
        }
    });
    
    if (newIndices.length === 0) {
        alert("Awesome! You don't have any questions matching this criteria.");
        return;
    }
    
    // Create new session ID for the reattempt
    currentSessionId = Date.now();
    
    // Reset stats for the upcoming session
    practiceState.stats = extractedImages.map((q, idx) => {
        let ex = 'Exercise 1';
        if (q.label && q.label.includes(' - ')) ex = q.label.split(' - ')[0];
        return {
            index: idx,
            timeSpent: 0,
            attempted: false,
            evaluation: null,
            ntaStatus: 'not_visited',
            exercise: ex
        };
    });
    
    // Hide summary and restart practice
    summaryContainer.classList.add('hidden');
    
    // Calculate new total time limit for the subset
    const mins = getCalculatedTimeMinutes(newIndices.length);
    practiceState.totalSecondsRemaining = mins * 60;
    
    startPracticeSession(newIndices);
}

function renderReviewCards(filter = 'all') {
    const reviewList = document.getElementById('reviewList');
    const reviewTitle = document.getElementById('reviewTitle');
    reviewList.innerHTML = '';
    
    if (filter === 'all') {
        reviewTitle.textContent = 'All Questions Review';
    } else if (filter === 'marked') {
        reviewTitle.textContent = 'Marked for Review';
    }
    
    let count = 0;
    practiceState.activeIndices.forEach((realIndex, i) => {
        const stat = practiceState.stats[realIndex];
        const q = extractedImages[realIndex];
        
        // Apply filter
        if (filter === 'marked' && stat.ntaStatus !== 'marked' && stat.ntaStatus !== 'answered_marked') return;
        
        count++;
        
        const card = document.createElement('div');
        card.className = 'brutal-card p-6 flex flex-col gap-4';
        
        // Header
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center -b  dark: pb-4';
        
        const title = document.createElement('h4');
        title.className = 'text-lg font-bold ';
        title.textContent = `Question ${stat.activeSectionNumber} (${stat.exercise.toUpperCase()})`;
        
        const badges = document.createElement('div');
        badges.className = 'flex flex-wrap gap-2 text-[10px] sm:text-xs font-bold';
        
        const timeBadge = document.createElement('span');
        timeBadge.className = 'bg-gray-800  px-3 py-1 rounded-full  ';
        timeBadge.textContent = formatTime(stat.timeSpent);
        badges.appendChild(timeBadge);
        
        let statusClass = 'bg-gray-800   ';
        let statusText = 'Skipped';
        
        if (stat.evaluation === 'correct') {
            statusClass = 'bg-green-500/20 text-green-400  -green-500/30';
            statusText = 'Correct';
        } else if (stat.evaluation === 'incorrect') {
            statusClass = 'bg-red-500/20 text-red-400  -red-500/30';
            statusText = 'Incorrect';
        }
        
        const evalBadge = document.createElement('span');
        evalBadge.className = `px-3 py-1 rounded-full ${statusClass}`;
        evalBadge.textContent = statusText;
        badges.appendChild(evalBadge);
        
        if (stat.ntaStatus === 'marked' || stat.ntaStatus === 'answered_marked') {
            const markBadge = document.createElement('span');
            markBadge.className = 'bg-[#B58A18]/20 text-[#FBBF24]  /50 px-3 py-1 rounded-full';
            markBadge.textContent = 'Marked';
            badges.appendChild(markBadge);
        }
        
        header.appendChild(title);
        header.appendChild(badges);
        card.appendChild(header);
        
        // Images Container
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'flex flex-col gap-6 pt-2';
        
        const qImg = document.createElement('img');
        qImg.src = q.dataUrl;
        qImg.className = 'max-w-full rounded bg-white p-2   mx-auto';
        imagesContainer.appendChild(qImg);
        
        if (q.answerDataUrl) {
            const aLabel = document.createElement('div');
            aLabel.className = 'text-sm font-bold  mt-2 text-center';
            aLabel.textContent = 'Solution:';
            imagesContainer.appendChild(aLabel);
            
            const aImg = document.createElement('img');
            aImg.src = q.answerDataUrl;
            aImg.className = 'max-w-full rounded bg-white p-2  -green-500 mx-auto';
            imagesContainer.appendChild(aImg);
        }
        
        card.appendChild(imagesContainer);
        
        if (stat.journey && stat.journey.length > 0) {
            const journeyDiv = document.createElement('div');
            journeyDiv.className = 'mt-4 -t  dark: pt-4';
            journeyDiv.innerHTML = `<h4 class="text-sm font-bold dark: mb-2">Question Journey</h4>
                <div class="flex flex-wrap gap-2 text-xs">
                ${stat.journey.map(j => {
                    const t = new Date(j.timestamp).toLocaleTimeString();
                    let color = 'bg-gray-100  dark:bg-gray-800 dark:';
                    if (j.action === 'correct') color = 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
                    if (j.action === 'incorrect') color = 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
                    if (j.action === 'answered' || j.action === 'answered_marked') color = 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
                    if (j.action === 'marked') color = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
                    return `<span class="px-2 py-1 rounded ${color}">${j.action} @ ${t} (${Math.round(j.timeSpentSoFar)}s)</span>`;
                }).join(' ➔ ')}
                </div>`;
            card.appendChild(journeyDiv);
        }
        
        reviewList.appendChild(card);
    });
    
    if (count === 0) {
        reviewList.innerHTML = `<div class="text-center py-10 font-medium">No questions found for this filter.</div>`;
    }
}

let radarChartInstance = null;
function renderRadarChart() {
    radarChartContainer.classList.remove('hidden');
    
    const subjectData = {};
    practiceState.activeIndices.forEach(realIndex => {
        const stat = practiceState.stats[realIndex];
        const ex = stat.exercise.toUpperCase();
        if (!subjectData[ex]) subjectData[ex] = { total: 0, correct: 0 };
        subjectData[ex].total++;
        if (stat.evaluation === 'correct') subjectData[ex].correct++;
    });
    
    const labels = Object.keys(subjectData);
    const data = labels.map(l => (subjectData[l].correct / subjectData[l].total) * 100);
    
    if (radarChartInstance) radarChartInstance.destroy();
    
    const ctx = document.getElementById('performanceChart').getContext('2d');
    radarChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Accuracy %',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.85)', // Premium Blue
                hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                Radius: 6,
                Skipped: false,
                barPercentage: 0.5,
                maxBarThickness: 50
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 20, 30, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#e2e8f0',
                    Color: 'rgba(59, 130, 246, 0.3)',
                    Width: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => `Accuracy: ${context.parsed.y.toFixed(1)}%`
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#9CA3AF',
                        font: { family: "'Inter', sans-serif", size: 11 },
                        stepSize: 20
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#9CA3AF',
                        font: { family: "'Inter', sans-serif", size: 12, weight: 'bold' }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
}

async function saveCurrentSession(totalSeconds, correctCount, incorrectCount, unansweredCount) {
    if (!currentSessionId) return;
    
    // Filter extractedImages to avoid storing massive raw canvas data if not needed, 
    // but we need dataUrl and answerDataUrl for review.
    // To save space, we ONLY save images that are in practiceState.activeIndices
    // or just save all if they are standard base64 strings.
    const sessionData = {
        id: currentSessionId,
        date: new Date(currentSessionId).toLocaleString(),
        title: window.currentPdfFilename || `Mock Test Session #${currentSessionId}`,

        isHosted: (typeof isLiveMode !== 'undefined' && isLiveMode) || (typeof isHost !== 'undefined' && isHost) || false,
        isCommunity: (typeof isLiveMode !== 'undefined' && isLiveMode) || (typeof isHost !== 'undefined' && isHost) || false,
        totalSeconds,
        correctCount,
        incorrectCount,
        unansweredCount,
        practiceState: JSON.parse(JSON.stringify(practiceState)),
        // Store only the necessary image data
        extractedImages: extractedImages.map(img => ({
            label: img.label,
            dataUrl: img.dataUrl,
            answerDataUrl: img.answerDataUrl
        }))
    };
    
    try {
        await saveSessionToDB(sessionData);
        console.log('Session saved to DB successfully.');
    } catch (e) {
        console.error('Failed to save session:', e);
    }
}

document.getElementById('backToHomeBtn').addEventListener('click', () => {
    // Reset all internal state via cancelBtn logic
    cancelBtn.click();
    
    // Hide summary and show history
    document.getElementById('summaryContainer').classList.add('hidden');
    document.getElementById('historyContainer').classList.remove('hidden');
    renderHistory();
});

// History UI rendering
let historyDisplayLimit = 10;
async function renderHistory() {
    const historyList = document.getElementById('historyList');
    const historyContainer = document.getElementById('historyContainer');
    
    try {
        const sessions = await getAllSessionsFromDB();
        if (sessions.length === 0) {
            historyContainer.classList.remove('hidden');
            historyList.innerHTML = '<div class="text-center py-12">Your Vault is empty. Extract a PDF to create a test!</div>';
            return;
        }
        
        historyContainer.classList.remove('hidden');
        historyList.innerHTML = '';
        
        window.vaultCurrentFilter = window.vaultCurrentFilter || 'recent';
        
        let filteredSessions = sessions;
        if (window.vaultCurrentFilter === 'created') {
            filteredSessions = sessions.filter(s => !s.isCommunity && !s.isHosted);
        } else if (window.vaultCurrentFilter === 'shared') {
            filteredSessions = sessions.filter(s => s.isCommunity === true || s.isHosted === true);
        } else if (window.vaultCurrentFilter === 'all') {
            filteredSessions = sessions;
        } else {
            // recent - just show all but we can limit or just sort
            filteredSessions = sessions; 
        }

        if (filteredSessions.length === 0) {
            historyList.innerHTML = '<div class="text-center py-12">No tests found for this filter.</div>';
        }
        
        const reversedSessions = [...filteredSessions].reverse();
        const totalSessions = reversedSessions.length;
        const sessionsToShow = reversedSessions.slice(0, historyDisplayLimit);
        
        sessionsToShow.forEach(session => {
            const card = document.createElement('div');
            card.className = 'brutal-card p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between relative group mb-3.5 gap-3 transition-all hover:bg-yellow-50 dark:hover:bg-[#3d3d2a] overflow-hidden';
            
            let rawTitle = session.title || `Mock Test Session #${session.id}`;
            let formattedTitle = rawTitle;
            if (rawTitle.includes('#')) {
                const parts = rawTitle.split('#');
                formattedTitle = `${parts[0]}<span class="text-blue-400 font-extrabold">#${parts[1]}</span>`;
            }
            
            const dateStr = session.date ? session.date.split(',')[0] : 'Unknown';
            
            card.innerHTML = `
                <div class="flex-1 min-w-0 w-full sm:w-auto">
                    <h4 class="text-sm sm:text-base font-bold truncate tracking-tight">${formattedTitle}</h4>
                    <p class="text-xs mt-0.5 sm:mt-1 font-medium">Created: ${dateStr}</p>
                </div>
                
                <div class="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/10 dark:border-white/10">
                    <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <!-- Rename: yellow accent -->
                        <button class="brutal-btn rename-session-btn btn-action-rename p-1.5 sm:p-2 transition-all" style="background-color: #FFE600 !important; color: #000000 !important;" data-id="${session.id}" title="Rename Test">
                            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="#000000" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <!-- Delete: red accent -->
                        <button class="brutal-btn delete-session-btn btn-action-delete p-1.5 sm:p-2 transition-all" style="background-color: #FF4D4D !important; color: #ffffff !important;" data-id="${session.id}" title="Delete Test">
                            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="#ffffff" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        <!-- View Analysis: green accent -->
                        <button class="brutal-btn view-session-btn btn-action-analysis p-1.5 sm:p-2 transition-all" style="background-color: #00E5FF !important; color: #000000 !important;" data-id="${session.id}" title="View Analysis">
                            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="#000000" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        </button>
                        <!-- Share: blue accent -->
                        <button class="brutal-btn share-session-btn btn-action-share p-1.5 sm:p-2 transition-all" style="background-color: #3B82F6 !important; color: #ffffff !important;" data-id="${session.id}" title="Share Test">
                            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="#ffffff" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                        </button>
                        <!-- Host: purple accent -->
                        <button class="brutal-btn share-session-btn btn-action-host p-1.5 sm:p-2 transition-all" style="background-color: #A855F7 !important; color: #ffffff !important;" data-id="${session.id}" title="Host Live Test">
                            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="#ffffff" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
                        </button>
                    </div>
                    <!-- Take Test: yellow pill -->
                    <button class="brutal-btn take-test-modal-btn btn-action-taketest text-xs font-black uppercase py-2 px-3 sm:py-2.5 sm:px-4 flex items-center gap-1.5 transition-all shrink-0" style="background-color: #FFE600 !important; color: #000000 !important;" data-id="${session.id}" data-type="all">
                        <svg class="w-3.5 h-3.5" fill="#000000" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                        <span style="color: #000000 !important;">Take Test</span>
                    </button>
                </div>
            `;
            historyList.appendChild(card);
        });

        if (historyDisplayLimit < totalSessions) {
            const viewMoreContainer = document.createElement('div');
            viewMoreContainer.className = 'flex justify-center mt-6 w-full';
            viewMoreContainer.innerHTML = `<button id="viewMoreHistoryBtn" class="brutal-btn hover:bg-yellow-400 text-[var(--text-primary)] hover:text-black font-bold py-2 px-8 transition-colors">View More</button>`;
            historyList.appendChild(viewMoreContainer);
            
            document.getElementById('viewMoreHistoryBtn').addEventListener('click', () => {
                historyDisplayLimit += 10;
                renderHistory();
            });
        }
        
        // Bind Filter Tabs
        document.querySelectorAll('.vault-filter-tab').forEach(btn => {
            btn.removeEventListener('click', window._vaultTabHandler);
            window._vaultTabHandler = (e) => {
                window.vaultCurrentFilter = btn.getAttribute('data-filter');
                document.querySelectorAll('.vault-filter-tab').forEach(b => {
                    if (b.getAttribute('data-filter') === window.vaultCurrentFilter) {
                        b.className = "vault-filter-tab active px-4 py-1.5 rounded-full text-xs font-semibold  bg-yellow-400 text-black border-black   shadow";
                    } else {
                        b.className = "vault-filter-tab px-4 py-1.5 rounded-full text-xs font-semibold  hover: transition-colors bg-transparent   hover:";
                    }
                });
                renderHistory();
            };
            btn.addEventListener('click', window._vaultTabHandler);
        });
        
        // Event listeners for history cards
        document.querySelectorAll('.rename-session-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const rawId = btn.getAttribute('data-id');
                const id = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
                const session = await getSessionFromDB(id);
                if (session) {
                    const newName = prompt("Enter new test name:", session.title || `Mock Test Session #${session.id}`);
                    if (newName !== null && newName.trim() !== "") {
                        session.title = newName.trim();
                        await saveSessionToDB(session);
                        renderHistory();
                    }
                }
            });
        });
        
        document.querySelectorAll('.delete-session-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if(confirm("Delete this session?")) {
                    const rawId = btn.getAttribute('data-id');
                    const id = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
                    await deleteSessionFromDB(id);
                    renderHistory();
                }
            });
        });
        
        document.querySelectorAll('.view-session-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const rawId = btn.getAttribute('data-id');
                const id = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
                const session = await getSessionFromDB(id);
                if (session) {
                    loadSessionAndShowSummary(session);
                }
            });
        });
        
        document.querySelectorAll('#historyList .share-session-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const rawId = btn.getAttribute('data-id');
                const id = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
                const session = await getSessionFromDB(id);
                if (session && typeof startLiveRoomFromSession === 'function') {
                    session.isHosted = true;
                    session.isCommunity = true;
                    await saveSessionToDB(session);
                    startLiveRoomFromSession(session);
                } else {
                    alert('Unable to share this session.');
                }
            });
        });
        
        document.querySelectorAll('.take-test-modal-btn').forEach(btn => {
            console.log("Binding click listener to take-test-modal-btn, data-id:", btn.getAttribute('data-id'));
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const rawId = btn.getAttribute('data-id');
                const id = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
                const filterType = btn.getAttribute('data-type');
                console.log("take-test-modal-btn clicked. rawId:", rawId, "parsedId:", id, "filterType:", filterType);
                openInstructionsModalForSession(id, filterType);
            });
        });
        
        document.querySelectorAll('.history-reattempt-btn').forEach(btn => {
            console.log("Binding click listener to history-reattempt-btn, data-id:", btn.getAttribute('data-id'));
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const rawId = btn.getAttribute('data-id');
                const id = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
                const filterType = btn.getAttribute('data-type');
                console.log("history-reattempt-btn clicked. rawId:", rawId, "parsedId:", id, "filterType:", filterType);
                openInstructionsModalForSession(id, filterType);
            });
        });
        
    } catch (e) {
        console.error("Could not load history", e);
    }
}
function loadSessionAndShowSummary(session) {
    currentSessionId = session.id;
    practiceState = session.practiceState;
    extractedImages = session.extractedImages;
    
    // Hide landing page elements
    uploadContainer.classList.add('hidden');
    document.getElementById('historyContainer').classList.add('hidden');
    const analysisContainer = document.getElementById('analysisContainer');
    if (analysisContainer) analysisContainer.classList.add('hidden');
    
    // The showSummary function expects these to exist if we try to navigate back/restart, 
    // but we can just let showSummary run directly with the restored practiceState
    // trigger showResultsDashboard which recalculates from practiceState!
    showResultsDashboard();
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
});



let activeBookmarkGroup = null;

function openBookmarkDetailsModal(group) {
    activeBookmarkGroup = group;
    const overlay = document.getElementById('bookmarkDetailsOverlay');
    const modal = document.getElementById('bookmarkDetailsModal');
    
    document.getElementById('bmdGroupName').textContent = group.name;
    document.getElementById('bmdGroupCount').textContent = `${group.questions.length} questions`;
    
    renderBookmarkDetailsQuestions();
    
    overlay.classList.remove('hidden');
    void overlay.offsetWidth; // trigger reflow
    overlay.classList.remove('opacity-0');
    modal.classList.remove('scale-95');
}

function renderBookmarkDetailsQuestions() {
    const list = document.getElementById('bmdQuestionList');
    list.innerHTML = '';
    
    if (!activeBookmarkGroup || !activeBookmarkGroup.questions.length) {
        list.innerHTML = `<div class="text-center py-10">This group is empty.</div>`;
        return;
    }
    
    activeBookmarkGroup.questions.forEach(q => {
        const div = document.createElement('div');
        div.className = 'brutal-card   dark: rounded-none p-4 flex flex-col sm:flex-row gap-4 items-center relative group';
        div.innerHTML = `
            <div class="w-full sm:w-32 shrink-0 bg-white rounded-none p-1 overflow-hidden h-20 flex items-center justify-center">
                <img src="${q.dataUrl}" class="max-w-full max-h-full object-contain mix-blend-multiply" />
            </div>
            <div class="flex-1 flex flex-col justify-center">
                <h4 class="font-bold text-sm">${q.label || 'Question'}</h4>
                <p class="text-xs mt-1">Added ${new Date(activeBookmarkGroup.timestamp).toLocaleDateString()}</p>
            </div>
            <button class="brutal-btn bg-red-500/10 hover:bg-red-500 text-red-500 hover: p-2.5 transition-colors -red-500/20 hover:-red-500 shrink-0" title="Remove Question" aria-label="Remove Question">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        `;
        
        div.querySelector('button').addEventListener('click', async () => {
            if (confirm('Are you sure you want to remove this question?')) {
                try {
                    activeBookmarkGroup = await removeQuestionFromBookmarkGroup(activeBookmarkGroup.id, q.bookmarkId);
                    document.getElementById('bmdGroupCount').textContent = `${activeBookmarkGroup.questions.length} questions`;
                    renderBookmarkDetailsQuestions();
                    renderBookmarks(); // Refresh home page
                } catch (e) {
                    console.error(e);
                }
            }
        });
        
        list.appendChild(div);
    });
}

function closeBookmarkDetailsModal() {
    const overlay = document.getElementById('bookmarkDetailsOverlay');
    const modal = document.getElementById('bookmarkDetailsModal');
    overlay.classList.add('opacity-0');
    modal.classList.add('scale-95');
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 300);
}

// Event Listeners for Modal
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('closeBookmarkDetailsBtn')?.addEventListener('click', closeBookmarkDetailsModal);
    document.getElementById('bookmarkDetailsOverlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'bookmarkDetailsOverlay') closeBookmarkDetailsModal();
    });
    
    document.getElementById('bmdDeleteGroupBtn')?.addEventListener('click', async () => {
        if (confirm(`Are you sure you want to delete the entire '${activeBookmarkGroup.name}' group? This cannot be undone.`)) {
            await deleteBookmarkGroup(activeBookmarkGroup.id);
            closeBookmarkDetailsModal();
            renderBookmarks(); // Refresh home page
        }
    });
    
    document.getElementById('bmdPracticeNowBtn')?.addEventListener('click', () => {
        if (!activeBookmarkGroup || activeBookmarkGroup.questions.length === 0) return alert('This bookmark group is empty!');
        
        practiceState.isBookmarkSession = true;
        
        // Override extractedImages for this session
        extractedImages.length = 0;
        activeBookmarkGroup.questions.forEach(q => extractedImages.push(q));
        
        // Hide home sections
        const uploadContainer = document.getElementById('uploadContainer');
        if(uploadContainer) uploadContainer.classList.add('hidden');
        document.getElementById('historyContainer').classList.add('hidden');
        document.getElementById('bookmarksContainer').classList.add('hidden');
        document.getElementById('notedQsContainer')?.classList.add('hidden');
        
        // Set default config variables so they exist
        const scorePerQInput = document.getElementById('scorePerQInput');
        practiceState.scorePerQ = scorePerQInput ? parseInt(scorePerQInput.value) || 4 : 4;
        const negativeMarkingToggle = document.getElementById('negativeMarkingToggle');
        practiceState.negativeMarking = negativeMarkingToggle ? negativeMarkingToggle.checked : true;
        currentSessionId = Date.now();

        // Initialize stats
        practiceState.stats = extractedImages.map((q, idx) => {
            let ex = 'Exercise 1';
            if (q && q.label && q.label.includes(' - ')) {
                ex = q.label.split(' - ')[0];
            }
            return {
                index: idx,
                label: q.label || `Q. ${idx+1}`,
                exercise: ex,
                attempted: false,
                evaluation: null,
                timeSpent: 0,
                ntaStatus: 'not_visited',
                isMarkedForReview: false
            };
        });
        
        const indices = extractedImages.map((_, i) => i);
        const mins = getCalculatedTimeMinutes(extractedImages.length);
        practiceState.totalSecondsRemaining = mins * 60;
        
        closeBookmarkDetailsModal();
        startPracticeSession(indices);
    });
});


let currentNotedQuestions = [];

async function renderNotedQuestions() {
    const notedQsList = document.getElementById('notedQsList');
    const notedQsContainer = document.getElementById('notedQsContainer');
    if (!notedQsList || !notedQsContainer) return;
    
    try {
        currentNotedQuestions = await getAllGlobalNotes();
        // notedQsContainer.classList.remove('hidden'); // Removed to fix dashboard layout
        notedQsList.innerHTML = '';
        
        if (currentNotedQuestions.length === 0) {
            notedQsList.innerHTML = `
                <div class="col-span-1 sm:col-span-2 lg:col-span-3 brutal-card p-8 rounded-none -dashed flex flex-col items-center justify-center text-center opacity-70">
                    <div class="bg-yellow-500/10 p-4 rounded-full text-yellow-500 mb-4">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </div>
                    <h3 class="text-lg font-bold dark: mb-1">No Notes Yet</h3>
                    <p class="text-sm dark: max-w-sm">Write notes using the scratchpad during practice. They will be saved here!</p>
                </div>
            `;
            return;
        }
        
        const card = document.createElement('div');
        card.className = 'brutal-card p-5 flex flex-col justify-between relative cursor-pointer transition-all hover:bg-yellow-50 dark:hover:bg-[#3d3d2a] group';
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="bg-yellow-500/10 p-2 rounded-none text-yellow-500 group-hover:bg-yellow-500 group-hover: transition-colors">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-lg group-hover:text-yellow-400 transition-colors">My Noted Questions</h3>
                        <p class="text-sm">${currentNotedQuestions.length} questions</p>
                    </div>
                </div>
            </div>
            <div class="mt-auto">
                <button class="brutal-btn w-full bg-white/10 hover:bg-yellow-500  font-bold py-2 text-sm transition-colors flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    View Notes
                </button>
            </div>
        `;
        
        card.addEventListener('click', openNotedQsModal);
        notedQsList.appendChild(card);
        
    } catch (e) {
        console.error('Error loading notes', e);
    }
}

function openNotedQsModal() {
    const overlay = document.getElementById('notedQsOverlay');
    const modal = document.getElementById('notedQsModal');
    
    document.getElementById('notedQsCount').textContent = `${currentNotedQuestions.length} questions with notes`;
    renderNotedQsModalList();
    
    overlay.classList.remove('hidden');
    void overlay.offsetWidth;
    overlay.classList.remove('opacity-0');
    modal.classList.remove('scale-95');
}

function renderNotedQsModalList() {
    const list = document.getElementById('notedQsListModal');
    list.innerHTML = '';
    
    if (currentNotedQuestions.length === 0) {
        list.innerHTML = `<div class="text-center py-10">You have no noted questions.</div>`;
        return;
    }
    
    currentNotedQuestions.forEach(q => {
        const div = document.createElement('div');
        div.className = 'brutal-card   dark: rounded-none p-4 flex flex-col sm:flex-row gap-4 items-stretch relative group';
        div.innerHTML = `
            <div class="w-full sm:w-1/3 shrink-0 bg-white rounded-none p-2 overflow-hidden flex items-center justify-center min-h-[100px]">
                <img src="${q.dataUrl}" class="max-w-full max-h-32 object-contain mix-blend-multiply" />
            </div>
            <div class="flex-1 flex flex-col -l dark: pl-4">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-sm">${q.label}</h4>
                        <p class="text-xs">Added ${new Date(q.timestamp).toLocaleDateString()}</p>
                    </div>
                    <button class="brutal-btn bg-red-500/10 hover:bg-red-500 text-red-500 hover: p-2 transition-colors -red-500/20 hover:-red-500 shrink-0" title="Delete Note" aria-label="Delete Note">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
                <div class="flex-1 bg-black/30 rounded-none p-3 text-sm whitespace-pre-wrap overflow-y-auto max-h-32 hide-scrollbar font-mono">${q.noteText}</div>
            </div>
        `;
        
        div.querySelector('button').addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this note?')) {
                await removeGlobalNote(q.id);
                currentNotedQuestions = currentNotedQuestions.filter(n => n.id !== q.id);
                document.getElementById('notedQsCount').textContent = `${currentNotedQuestions.length} questions with notes`;
                renderNotedQsModalList();
                renderNotedQuestions(); // Refresh home page card
            }
        });
        
        list.appendChild(div);
    });
}

function closeNotedQsModal() {
    const overlay = document.getElementById('notedQsOverlay');
    const modal = document.getElementById('notedQsModal');
    overlay.classList.add('opacity-0');
    modal.classList.add('scale-95');
    setTimeout(() => overlay.classList.add('hidden'), 300);
}

document.addEventListener('DOMContentLoaded', () => {
    renderNotedQuestions();
    
    document.getElementById('closeNotedQsBtn')?.addEventListener('click', closeNotedQsModal);
    document.getElementById('notedQsOverlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'notedQsOverlay') closeNotedQsModal();
    });
    
    document.getElementById('practiceNotedQsBtn')?.addEventListener('click', () => {
        if (currentNotedQuestions.length === 0) return alert('No noted questions to practice!');
        
        practiceState.isNotesSession = true;
        practiceState.isBookmarkSession = false;
        
        extractedImages.length = 0;
        currentNotedQuestions.forEach(q => extractedImages.push(q));
        
        // Hide containers
        document.getElementById('uploadContainer')?.classList.add('hidden');
        document.getElementById('historyContainer')?.classList.add('hidden');
        document.getElementById('bookmarksContainer')?.classList.add('hidden');
        document.getElementById('notedQsContainer')?.classList.add('hidden');
        
        const scorePerQInput = document.getElementById('scorePerQInput');
        practiceState.scorePerQ = scorePerQInput ? parseInt(scorePerQInput.value) || 4 : 4;
        const negativeMarkingToggle = document.getElementById('negativeMarkingToggle');
        practiceState.negativeMarking = negativeMarkingToggle ? negativeMarkingToggle.checked : true;
        currentSessionId = Date.now();

        practiceState.stats = extractedImages.map((q, idx) => {
            return {
                index: idx,
                label: q.label || `Q. ${idx+1}`,
                exercise: 'Notes Session',
                attempted: false,
                evaluation: null,
                timeSpent: 0,
                ntaStatus: 'not_visited',
                isMarkedForReview: false
            };
        });
        
        // Also pre-populate the scratchpadNotes for this session so the user sees their notes
        practiceState.scratchpadNotes = {};
        currentNotedQuestions.forEach((q, idx) => {
            practiceState.scratchpadNotes[idx] = q.noteText;
        });
        
        const indices = extractedImages.map((_, i) => i);
        const mins = getCalculatedTimeMinutes(extractedImages.length);
        practiceState.totalSecondsRemaining = mins * 60;
        
        closeNotedQsModal();
        startPracticeSession(indices);
    });
});

// Bookmarks UI rendering
async function renderBookmarks() {
    const bookmarksList = document.getElementById('bookmarksList');
    const bookmarksContainer = document.getElementById('bookmarksContainer');
    if (!bookmarksList || !bookmarksContainer) return;
    
    try {
        const groups = await getAllBookmarkGroups();
        // removed early return
        // bookmarksContainer.classList.remove('hidden'); // Removed to fix dashboard layout
        bookmarksList.innerHTML = '';

        if (groups.length === 0) {
            bookmarksList.innerHTML = `
                <div class="col-span-1 sm:col-span-2 lg:col-span-3 brutal-card p-8 rounded-none -dashed flex flex-col items-center justify-center text-center opacity-70">
                    <div class="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-4">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    </div>
                    <h3 class="text-lg font-bold dark: mb-1">No Bookmarks Yet</h3>
                    <p class="text-sm dark: max-w-sm">When you bookmark questions during a practice session, your custom collections will appear here.</p>
                </div>
            `;
            return;
        }
        
        groups.forEach(g => {
            const card = document.createElement('div');
            card.className = 'brutal-card p-5 flex flex-col justify-between relative cursor-pointer transition-all hover:bg-yellow-50 dark:hover:bg-[#3d3d2a] group';
            
            card.innerHTML = `
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="bg-blue-500/10 p-2 rounded-none text-blue-400 group-hover:bg-blue-500 group-hover: transition-colors">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg group-hover:text-blue-400 transition-colors">${g.name}</h3>
                            <p class="text-sm">${g.questions.length} questions</p>
                        </div>
                    </div>
                </div>
                <div class="mt-auto">
                    <button class="brutal-btn w-full bg-white/10 hover:bg-blue-500  font-bold py-2 text-sm transition-colors flex items-center justify-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Practice Now
                    </button>
                </div>
            `;
            
            card.addEventListener('click', () => openBookmarkDetailsModal(g));
            
            bookmarksList.appendChild(card);
        });
        
    } catch (e) {
        console.error('Error loading bookmarks', e);
    }
}

function restartPracticeWithIndices(indices) {
    // Hide summary and restart with new indices
    summaryContainer.classList.add('hidden');
    practiceState.stats.forEach(stat => {
        stat.timeSpent = 0;
        stat.attempted = false;
        stat.evaluation = null;
        stat.ntaStatus = 'not_visited';
    });
    
    const mins = getCalculatedTimeMinutes(indices.length);
    practiceState.totalSecondsRemaining = mins * 60;
    
    startPracticeSession(indices);
}

function showReviewList(type) {
    const reviewContainer = document.getElementById('reviewContainer');
    const reviewList = document.getElementById('reviewList');
    const reviewTitle = document.getElementById('reviewTitle');
    
    reviewContainer.classList.remove('hidden');
    reviewTitle.textContent = `Reviewing ${type.charAt(0).toUpperCase() + type.slice(1)} Questions`;
    reviewList.innerHTML = '';
    
    let filteredIndices;
    if (type === 'unanswered') {
        filteredIndices = practiceState.activeIndices.filter(realIndex => 
            !practiceState.stats[realIndex].attempted
        );
    } else {
        filteredIndices = practiceState.activeIndices.filter(realIndex => 
            practiceState.stats[realIndex].evaluation === type
        );
    }
    
    if (filteredIndices.length === 0) {
        reviewList.innerHTML = `<p class="italic">No ${type} questions found.</p>`;
        return;
    }
    
    filteredIndices.forEach((realIndex, i) => {
        const q = extractedImages[realIndex];
        
        const card = document.createElement('div');
        card.className = 'brutal-card p-4';
        
        const header = document.createElement('div');
        header.className = 'font-bold text-sm  dark: mb-2';
        header.textContent = `Question ${q.label}`;
        
        const img = document.createElement('img');
        img.src = q.dataUrl;
        img.className = 'max-w-full h-auto object-contain mb-4 rounded   dark:-navy-600 dark:bg-white dark:p-1';
        
        const btn = document.createElement('button');
        btn.className = 'bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 text-sm font-bold py-2 px-4 rounded';
        btn.textContent = 'View Answer';
        
        const answerImg = document.createElement('img');
        if (q.answerDataUrl) {
            answerImg.src = q.answerDataUrl;
        }
        answerImg.className = 'max-w-full h-auto object-contain mt-4 rounded   dark:-navy-600 dark:bg-white dark:p-1 hidden';
        
        btn.onclick = () => {
            answerImg.classList.toggle('hidden');
            btn.textContent = answerImg.classList.contains('hidden') ? 'View Answer' : 'Hide Answer';
        };
        
        card.appendChild(header);
        card.appendChild(img);
        card.appendChild(btn);
        card.appendChild(answerImg);
        
        reviewList.appendChild(card);
    });
}

// =============================================================
// BOOKMARK SIDEBAR LOGIC
// =============================================================

const ntaBookmarkBtn = document.getElementById('ntaBookmarkBtn');
const bookmarkSidebar = document.getElementById('bookmarkSidebar');
const bookmarkSidebarOverlay = document.getElementById('bookmarkSidebarOverlay');
const closeBookmarkSidebarBtn = document.getElementById('closeBookmarkSidebarBtn');
const quickSaveSection = document.getElementById('quickSaveSection');
const quickSaveChapterName = document.getElementById('quickSaveChapterName');
const quickSaveBreadcrumb = document.getElementById('quickSaveBreadcrumb');
const quickSaveBtn = document.getElementById('quickSaveBtn');
const quickSaveBtnChapter = document.getElementById('quickSaveBtnChapter');
const bookmarkGroupsList = document.getElementById('bookmarkGroupsList');
const bookmarkGroupCount = document.getElementById('bookmarkGroupCount');
const createBookmarkGroupBtn = document.getElementById('createBookmarkGroupBtn');

function toggleBookmarkSidebar() {
    const isHidden = bookmarkSidebarOverlay.classList.contains('hidden');
    if (isHidden) {
        bookmarkSidebarOverlay.classList.remove('hidden');
        // trigger reflow
        void bookmarkSidebarOverlay.offsetWidth;
        bookmarkSidebarOverlay.classList.remove('opacity-0');
        bookmarkSidebar.classList.remove('translate-x-full');
        renderBookmarkSidebar();
    } else {
        bookmarkSidebarOverlay.classList.add('opacity-0');
        bookmarkSidebar.classList.add('translate-x-full');
        setTimeout(() => {
            bookmarkSidebarOverlay.classList.add('hidden');
        }, 300);
    }
}

async function renderBookmarkSidebar() {
    // Check if we are rendering a bookmark session or a normal one
    let q;
    if (practiceState.isBookmarkSession) {
        q = extractedImages[practiceState.currentIndex]; // they are already mapped 1:1
    } else {
        const idx = practiceState.activeIndices[practiceState.currentIndex];
        q = extractedImages[idx];
    }
    
    let exercise = 'Exercise';
    if (q && q.label && q.label.includes(' - ')) {
        exercise = q.label.split(' - ')[0];
    }
    
    // Quick Save UI
    if (quickSaveChapterName) {
        quickSaveChapterName.textContent = exercise;
        quickSaveBreadcrumb.textContent = exercise;
        quickSaveBtnChapter.textContent = exercise;
        
        quickSaveBtn.onclick = async () => {
            try {
                await addQuestionToBookmarkGroup(`group_${exercise.toLowerCase().replace(/[^a-z0-9]/g, '')}`, exercise, q);
                quickSaveBtn.innerHTML = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> Saved!`;
                quickSaveBtn.classList.replace('bg-blue-500', 'bg-green-500');
                quickSaveBtn.classList.replace('hover:bg-blue-400', 'hover:bg-green-400');
                setTimeout(() => {
                    quickSaveBtn.innerHTML = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clip-rule="evenodd"></path></svg> Save to <span>${exercise}</span>`;
                    quickSaveBtn.classList.replace('bg-green-500', 'bg-blue-500');
                    quickSaveBtn.classList.replace('hover:bg-green-400', 'hover:bg-blue-400');
                }, 2000);
                renderBookmarkSidebar(); // Refresh list
            } catch (e) {
                console.error('Error saving bookmark:', e);
            }
        };
    }

    // Custom Groups UI
    if (bookmarkGroupCount && bookmarkGroupsList) {
        const groups = await getAllBookmarkGroups();
        bookmarkGroupCount.textContent = groups.length;
        bookmarkGroupsList.innerHTML = '';
        
        groups.forEach(g => {
            const div = document.createElement('div');
            div.className = 'bg-[#060b14]/50 rounded-none p-3 flex items-center justify-between group transition-colors hover:bg-white/5   hover:';
            div.innerHTML = `
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
                        <h5 class="font-bold text-sm">${g.name}</h5>
                    </div>
                    <p class="text-[10px] flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        ${g.questions ? g.questions.length : 0} questions
                    </p>
                </div>
                <button class="brutal-btn bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover: px-3 py-1 text-xs font-bold transition-colors flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Add
                </button>
            `;
            div.querySelector('button').onclick = async () => {
                const btn = div.querySelector('button');
                try {
                    await addQuestionToBookmarkGroup(g.id, g.name, q);
                    btn.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Added`;
                    btn.classList.replace('bg-blue-500/20', 'bg-green-500');
                    btn.classList.replace('text-blue-400', '');
                    setTimeout(() => renderBookmarkSidebar(), 1000);
                } catch (e) {
                    console.error(e);
                }
            };
            bookmarkGroupsList.appendChild(div);
        });
    }
}

if (ntaBookmarkBtn) ntaBookmarkBtn.addEventListener('click', toggleBookmarkSidebar);
if (closeBookmarkSidebarBtn) closeBookmarkSidebarBtn.addEventListener('click', toggleBookmarkSidebar);
if (bookmarkSidebarOverlay) bookmarkSidebarOverlay.addEventListener('click', toggleBookmarkSidebar);

if (createBookmarkGroupBtn) {
    createBookmarkGroupBtn.addEventListener('click', async () => {
        const name = prompt('Enter a name for the new bookmark group:');
        if (name && name.trim()) {
            const id = 'group_' + Date.now();
            await saveBookmarkGroup({
                id,
                name: name.trim(),
                timestamp: Date.now(),
                questions: []
            });
            renderBookmarkSidebar();
        }
    });
}

// =============================================================
// NTA UI LOGIC
// =============================================================

function buildNtaTabs(exercises) {
    ntaSubjectTabs.innerHTML = '';
    exercises.forEach((ex, i) => {
        const btn = document.createElement('button');
        btn.className = `px-6 py-2 h-full font-bold text-sm tracking-wide transition-colors -r  ${i === 0 ? 'bg-white text-blue-900' : ' hover:bg-[#e07b1a]'}`;
        btn.textContent = ex.toUpperCase();
        btn.onclick = () => {
            // Update Tab styles
            Array.from(ntaSubjectTabs.children).forEach(child => {
                child.className = 'px-6 py-2 h-full font-bold text-sm tracking-wide transition-colors -r   hover:bg-[#e07b1a]';
            });
            btn.className = 'px-6 py-2 h-full font-bold text-sm tracking-wide transition-colors -r  bg-white text-blue-900';
            
            // Jump to first question in this exercise
            const firstIndex = practiceState.stats.findIndex(s => s.exercise === ex);
            if (firstIndex !== -1) renderNtaQuestion(firstIndex);
        };
        ntaSubjectTabs.appendChild(btn);
    });
}

function buildNtaPalette() {
    ntaPaletteGrid.innerHTML = '';
    
    // Group active indices by exercise
    const groups = {};
    practiceState.activeIndices.forEach((realIndex, i) => {
        const stat = practiceState.stats[realIndex];
        const ex = stat.exercise;
        if (!groups[ex]) groups[ex] = [];
        groups[ex].push({ realIndex, paletteIndex: i, stat });
    });
    
    Object.keys(groups).forEach(ex => {
        // Create Section Header
        const header = document.createElement('div');
        header.className = 'bg-blue-100 dark:bg-navy-800 font-bold text-sm p-2 text-center text-blue-900 dark:text-blue-300 rounded ';
        header.textContent = ex.toUpperCase();
        ntaPaletteGrid.appendChild(header);
        
        // Create Section Grid
        const sectionGrid = document.createElement('div');
        sectionGrid.className = 'flex flex-wrap gap-2 mb-4';
        
        groups[ex].forEach((item, sectionIndex) => {
            item.stat.activeSectionNumber = sectionIndex + 1;
            const btn = document.createElement('button');
            btn.id = `ntaPaletteBtn_${item.paletteIndex}`;
            btn.className = 'w-10 h-10 flex items-center justify-center font-bold text-sm rounded transition-transform transform hover:scale-105    nta-not-visited';
            btn.textContent = item.stat.activeSectionNumber.toString().padStart(2, '0');
            btn.onclick = () => renderNtaQuestion(item.paletteIndex);
            sectionGrid.appendChild(btn);
        });
        
        ntaPaletteGrid.appendChild(sectionGrid);
    });
}

function updateNtaPaletteColors() {
    practiceState.activeIndices.forEach((realIndex, i) => {
        const stat = practiceState.stats[realIndex];
        const btn = document.getElementById(`ntaPaletteBtn_${i}`);
        if (!btn) return;
        
        btn.className = 'w-10 h-10 flex items-center justify-center font-bold text-sm transition-transform transform hover:scale-105   ';
        
        // Remove old internal indicator if present
        btn.innerHTML = stat.activeSectionNumber.toString().padStart(2, '0');
        
        switch (stat.ntaStatus) {
            case 'not_visited':
                btn.classList.add('nta-not-visited', 'rounded');
                break;
            case 'not_answered':
                btn.classList.add('nta-not-answered');
                break;
            case 'answered':
                if (stat.evaluation === 'incorrect') {
                    btn.classList.add('nta-wrong');
                } else {
                    btn.classList.add('nta-answered');
                }
                break;
            case 'marked':
                btn.classList.add('nta-marked');
                break;
            case 'answered_marked':
                if (stat.evaluation === 'incorrect') {
                    btn.classList.add('nta-wrong', 'relative');
                } else {
                    btn.classList.add('nta-answered-marked', 'relative');
                }
                btn.innerHTML += `<span class="w-3 h-3 bg-green-400 rounded-full absolute bottom-0 right-0"></span>`;
                break;
        }
    });
    updateNtaSummary();
}

function updateNtaSummary() {
    const counts = { not_visited: 0, not_answered: 0, answered: 0, marked: 0, answered_marked: 0 };
    practiceState.activeIndices.forEach(realIndex => {
        counts[practiceState.stats[realIndex].ntaStatus]++;
    });
    
    document.getElementById('ntaLegendNotVisited').textContent = counts.not_visited;
    document.getElementById('ntaLegendNotAnswered').textContent = counts.not_answered;
    document.getElementById('ntaLegendAnswered').textContent = counts.answered;
    document.getElementById('ntaLegendMarked').textContent = counts.marked;
    const answeredMarkedEl = document.getElementById('ntaLegendAnsweredMarked');
    if(answeredMarkedEl) {
        answeredMarkedEl.innerHTML = `<span class="w-2 h-2 bg-green-400 rounded-full absolute bottom-0 right-0"></span>${counts.answered_marked}`;
    }
}

function updateQuestionStopwatchDisplayNta() {
    ntaQuestionStopwatch.textContent = formatTime(practiceState.qSecondsSpent);
}

function renderNtaQuestion(index) {
    if (!practiceState.activeIndices || index < 0 || index >= practiceState.activeIndices.length) return;
    practiceState.currentIndex = index;
    const realIndex = practiceState.activeIndices[index];
    const q = extractedImages[realIndex] || {};
    
    if (!practiceState.stats) practiceState.stats = {};
    if (!practiceState.stats[realIndex]) {
        practiceState.stats[realIndex] = {
            timeSpent: 0,
            attempted: false,
            evaluation: null,
            exercise: q.exercise || 'Exercise 1',
            activeSectionNumber: index + 1,
            ntaStatus: 'not_visited',
            journey: []
        };
    }
    const stat = practiceState.stats[realIndex];
    
    if (stat.ntaStatus === 'not_visited') {
        stat.ntaStatus = 'not_answered';
        logQuestionJourney(realIndex, 'viewed');
    } else {
        logQuestionJourney(realIndex, 'viewed');
    }
    
    updateNtaPaletteColors();
    
    // Auto-select the correct Subject Tab if user navigated via Palette
    Array.from(ntaSubjectTabs.children).forEach(btn => {
        if (btn.textContent === stat.exercise.toUpperCase()) {
            btn.className = 'px-6 py-2 h-full font-bold text-sm tracking-wide transition-colors -r  bg-white text-blue-900';
        } else {
            btn.className = 'px-6 py-2 h-full font-bold text-sm tracking-wide transition-colors -r   hover:bg-[#e07b1a]';
        }
    });
    
    const typeBadge = q.type ? `<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/80 dark:text-amber-100 -amber-300 dark:-amber-700">${q.type}</span>` : '';
    ntaQuestionLabel.innerHTML = `Question ${stat.activeSectionNumber}: <span class="text-xs font-normal opacity-80">(${q.label})</span> ${typeBadge}`;
    ntaQImage.src = q.dataUrl;
    ntaQImage.onload = () => {
        const container = document.getElementById('ntaContentContainer');
        if (container) {
            const scaleRatio = ntaQImage.clientWidth / ntaQImage.naturalWidth;
            container.scrollTop = (q.yOffset * scaleRatio) - 20;
        }
    };
    
    if (!practiceState.answers) practiceState.answers = {};
    
    // Setup Radio buttons
    const options = document.querySelectorAll('input[name="ntaOption"]');
    options.forEach(opt => {
        opt.checked = false; // uncheck all by default
        if (practiceState.answers[realIndex] === opt.value) {
            opt.checked = true;
        }
        
        opt.onchange = (e) => {
            if (e.target.checked) {
                if (!practiceState.answers) practiceState.answers = {};
                practiceState.answers[realIndex] = e.target.value;
            }
        };
    });

    
    // Setup question-specific scratchpad note
    if (!practiceState.scratchpadNotes) practiceState.scratchpadNotes = {};
    if (ntaScratchpadInput) {
        ntaScratchpadInput.value = practiceState.scratchpadNotes[realIndex] || '';
    }

    practiceState.qSecondsSpent = stat.timeSpent;
    practiceState.isAnswerRevealed = stat.attempted;
    
    ntaAnswerArea.classList.add('hidden');
    ntaCheckAnswerBtn.classList.remove('hidden');
    
    if (practiceState.qTimerInterval) clearInterval(practiceState.qTimerInterval);
    updateQuestionStopwatchDisplayNta();
    
    if (practiceState.isAnswerRevealed) {
        showNtaAnswer();
    } else {
        practiceState.qTimerInterval = setInterval(() => {
            if (!practiceState.isAnswerRevealed) {
                practiceState.qSecondsSpent++;
                practiceState.stats[realIndex].timeSpent = practiceState.qSecondsSpent;
                updateQuestionStopwatchDisplayNta();
            }
        }, 1000);
    }
}

function showNtaAnswer() {
    practiceState.isAnswerRevealed = true;
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    practiceState.stats[realIndex].attempted = true;
    
    ntaCheckAnswerBtn.classList.add('hidden');
    ntaAnswerArea.classList.remove('hidden');
    
    const q = extractedImages[realIndex];
    if (q.answerDataUrl) {
        ntaAImage.src = q.answerDataUrl;
        ntaAImage.classList.remove('hidden');
        ntaAImage.onload = () => {
            const container = document.getElementById('ntaAImageContainer');
            if (container) {
                const scaleRatio = ntaAImage.clientWidth / ntaAImage.naturalWidth;
                container.scrollTop = (q.answerYOffset * scaleRatio) - 20 || 0;
            }
        };
    } else {
        ntaAImage.classList.add('hidden');
        ntaAImage.src = '';
    }
}

ntaCheckAnswerBtn.addEventListener('click', showNtaAnswer);

ntaCorrectBtn.addEventListener('click', () => {
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    practiceState.stats[realIndex].ntaStatus = 'answered';
    practiceState.stats[realIndex].evaluation = 'correct';
    logQuestionJourney(realIndex, 'correct');
    updateNtaPaletteColors();
});

ntaCorrectBtn.addEventListener('click', () => {
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    const s = practiceState.stats[realIndex];
    s.ntaStatus = 'answered';
    s.attempted = true;
    s.evaluation = 'correct';
    if (!practiceState.answers[realIndex]) practiceState.answers[realIndex] = 'correct';
    logQuestionJourney(realIndex, 'correct');
    updateNtaPaletteColors();
});

ntaIncorrectBtn.addEventListener('click', () => {
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    const s = practiceState.stats[realIndex];
    s.ntaStatus = 'answered';
    s.attempted = true;
    s.evaluation = 'incorrect';
    if (!practiceState.answers[realIndex]) practiceState.answers[realIndex] = 'incorrect';
    logQuestionJourney(realIndex, 'incorrect');
    updateNtaPaletteColors();
});

ntaSaveNextBtn.addEventListener('click', () => {
    if (!practiceState.activeIndices || practiceState.activeIndices.length === 0) return;
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    if (!practiceState.stats) practiceState.stats = {};
    if (!practiceState.stats[realIndex]) {
        practiceState.stats[realIndex] = {
            timeSpent: 0,
            attempted: false,
            evaluation: null,
            exercise: 'Exercise 1',
            activeSectionNumber: practiceState.currentIndex + 1,
            ntaStatus: 'not_visited',
            journey: []
        };
    }
    const s = practiceState.stats[realIndex];
    s.ntaStatus = 'answered';
    s.attempted = true;
    logQuestionJourney(realIndex, 'answered');
    updateNtaPaletteColors();
    if (practiceState.currentIndex < practiceState.activeIndices.length - 1) {
        renderNtaQuestion(practiceState.currentIndex + 1);
    } else if (typeof triggerExamSummary === 'function') {
        triggerExamSummary();
    }
});

if (document.getElementById('ntaSaveReviewBtn')) {
    document.getElementById('ntaSaveReviewBtn').addEventListener('click', () => {
        if (!practiceState.activeIndices || practiceState.activeIndices.length === 0) return;
        const realIndex = practiceState.activeIndices[practiceState.currentIndex];
        if (!practiceState.stats) practiceState.stats = {};
        if (!practiceState.stats[realIndex]) {
            practiceState.stats[realIndex] = {
                timeSpent: 0,
                attempted: false,
                evaluation: null,
                exercise: 'Exercise 1',
                activeSectionNumber: practiceState.currentIndex + 1,
                ntaStatus: 'not_visited',
                journey: []
            };
        }
        const s = practiceState.stats[realIndex];
        s.ntaStatus = s.attempted ? 'answered_marked' : 'marked';
        logQuestionJourney(realIndex, s.ntaStatus);
        updateNtaPaletteColors();
        if (practiceState.currentIndex < practiceState.activeIndices.length - 1) {
            renderNtaQuestion(practiceState.currentIndex + 1);
        } else if (typeof triggerExamSummary === 'function') {
            triggerExamSummary();
        }
    });
}

ntaClearBtn.addEventListener('click', () => {
    if (!practiceState.activeIndices || practiceState.activeIndices.length === 0) return;
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    if (!practiceState.stats) practiceState.stats = {};
    if (!practiceState.stats[realIndex]) {
        practiceState.stats[realIndex] = {
            timeSpent: 0,
            attempted: false,
            evaluation: null,
            exercise: 'Exercise 1',
            activeSectionNumber: practiceState.currentIndex + 1,
            ntaStatus: 'not_answered',
            journey: []
        };
    }
    const s = practiceState.stats[realIndex];
    s.ntaStatus = 'not_answered';
    s.attempted = false;
    s.evaluation = null;
    delete practiceState.answers[realIndex];
    practiceState.isAnswerRevealed = false;
    logQuestionJourney(realIndex, 'cleared');
    updateNtaPaletteColors();
    renderNtaQuestion(practiceState.currentIndex);
});

ntaMarkReviewBtn.addEventListener('click', () => {
    if (!practiceState.activeIndices || practiceState.activeIndices.length === 0) return;
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    if (!practiceState.stats) practiceState.stats = {};
    if (!practiceState.stats[realIndex]) {
        practiceState.stats[realIndex] = {
            timeSpent: 0,
            attempted: false,
            evaluation: null,
            exercise: 'Exercise 1',
            activeSectionNumber: practiceState.currentIndex + 1,
            ntaStatus: 'not_visited',
            journey: []
        };
    }
    const s = practiceState.stats[realIndex];
    s.ntaStatus = s.attempted ? 'answered_marked' : 'marked';
    logQuestionJourney(realIndex, s.ntaStatus);
    updateNtaPaletteColors();
    if (practiceState.currentIndex < practiceState.activeIndices.length - 1) {
        renderNtaQuestion(practiceState.currentIndex + 1);
    } else if (typeof triggerExamSummary === 'function') {
        triggerExamSummary();
    }
});

ntaBackBtn.addEventListener('click', () => {
    if (practiceState.currentIndex > 0) {
        renderNtaQuestion(practiceState.currentIndex - 1);
    }
});

if (ntaNextBtn) ntaNextBtn.addEventListener('click', () => {
    if (practiceState.currentIndex < practiceState.activeIndices.length - 1) {
        renderNtaQuestion(practiceState.currentIndex + 1);
    }
});

function triggerExamSummary() {
    const counts = { not_visited: 0, not_answered: 0, answered: 0, marked: 0, answered_marked: 0 };
    const sectionCounts = {};
    practiceState.activeIndices.forEach(realIndex => {
        const stat = practiceState.stats[realIndex];
        counts[stat.ntaStatus]++;
        const ex = stat.exercise || 'Exercise 1';
        if (!sectionCounts[ex]) sectionCounts[ex] = { answered: 0, not_answered: 0, not_visited: 0, marked: 0, answered_marked: 0 };
        sectionCounts[ex][stat.ntaStatus]++;
    });
    
    document.getElementById('esTotalQ').textContent = practiceState.activeIndices.length;
    document.getElementById('esAnswered').textContent = counts.answered;
    document.getElementById('esNotAnswered').textContent = counts.not_answered;
    document.getElementById('esNotVisited').textContent = counts.not_visited;
    document.getElementById('esMarked').textContent = counts.marked;
    document.getElementById('esAnsMarked').textContent = counts.answered_marked;
    
    const tbody = document.getElementById('esSectionBreakdown');
    if (tbody) {
        tbody.innerHTML = Object.entries(sectionCounts).map(([name, c]) => `
            <tr class="hover:bg-gray-50 dark:hover:bg-[#1a1f2e]/50">
                <td class="px-4 py-2.5 font-semibold dark:">${name}</td>
                <td class="px-3 py-2.5 text-center text-[#5cb85c] font-bold">${c.answered}</td>
                <td class="px-3 py-2.5 text-center text-[#d9534f] font-bold">${c.not_answered}</td>
                <td class="px-3 py-2.5 text-center dark: font-bold">${c.not_visited}</td>
                <td class="px-3 py-2.5 text-center text-[#5bc0de] font-bold">${c.marked}</td>
                <td class="px-3 py-2.5 text-center text-purple-500 font-bold">${c.answered_marked}</td>
            </tr>
        `).join('');
    }
    
    document.getElementById('examSummaryModal').classList.remove('hidden');
}

ntaSubmitBtn.addEventListener('click', triggerExamSummary);
endPracticeBtn.addEventListener('click', triggerExamSummary);

// Modal button wiring
document.addEventListener('DOMContentLoaded', () => {
    const examSummaryModal = document.getElementById('examSummaryModal');
    const areYouSureModal = document.getElementById('areYouSureModal');

    document.getElementById('examSummaryCloseBtn').addEventListener('click', () => examSummaryModal.classList.add('hidden'));
    document.getElementById('examSummaryReturnBtn').addEventListener('click', () => examSummaryModal.classList.add('hidden'));
    document.getElementById('examSummaryFinalBtn').addEventListener('click', () => {
        examSummaryModal.classList.add('hidden');
        areYouSureModal.classList.remove('hidden');
    });
    
    document.getElementById('areYouSureCancelBtn').addEventListener('click', () => {
        areYouSureModal.classList.add('hidden');
        examSummaryModal.classList.remove('hidden');
    });
    
    document.getElementById('areYouSureConfirmBtn').addEventListener('click', () => {
        areYouSureModal.classList.add('hidden');
        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'] });
        }
        showResultsDashboard();
    });
});

// Mobile Palette Drawer Logic
const ntaMobilePaletteBtn = document.getElementById('ntaMobilePaletteBtn');
const ntaPaletteDrawer = document.getElementById('ntaPaletteDrawer');
const ntaPaletteOverlay = document.getElementById('ntaPaletteOverlay');
const ntaClosePaletteBtn = document.getElementById('ntaClosePaletteBtn');

function toggleNtaPalette() {
    const isClosed = ntaPaletteDrawer.classList.contains('translate-x-full');
    if (isClosed) {
        ntaPaletteDrawer.classList.remove('translate-x-full');
        ntaPaletteOverlay.classList.remove('hidden');
    } else {
        ntaPaletteDrawer.classList.add('translate-x-full');
        ntaPaletteOverlay.classList.add('hidden');
    }
}

if (ntaMobilePaletteBtn) {
    ntaMobilePaletteBtn.addEventListener('click', toggleNtaPalette);
}
if (ntaClosePaletteBtn) {
    ntaClosePaletteBtn.addEventListener('click', toggleNtaPalette);
}
if (ntaPaletteOverlay) {
    ntaPaletteOverlay.addEventListener('click', toggleNtaPalette);
}

if (ntaFullScreenBtn) {
    ntaFullScreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });
}

if (ntaToggleSidebarBtn) {
    ntaToggleSidebarBtn.addEventListener('click', () => {
        if (ntaPaletteDrawer.style.display === 'none') {
            ntaPaletteDrawer.style.display = '';
        } else {
            ntaPaletteDrawer.style.display = 'none';
        }
    });
}

// =============================================================
// SCRATCHPAD & KEYBOARD SHORTCUTS
// =============================================================
ntaToggleScratchpadBtn.addEventListener('click', () => {
    ntaScratchpad.classList.toggle('hidden');
    ntaScratchpad.classList.toggle('translate-x-full');
    if (!ntaScratchpad.classList.contains('hidden')) {
        ntaScratchpadInput.focus();
    }
});

ntaCloseScratchpadBtn.addEventListener('click', () => {
    ntaScratchpad.classList.add('hidden');
    ntaScratchpad.classList.add('translate-x-full');
});


let noteSaveTimeout = null;
ntaScratchpadInput.addEventListener('input', (e) => {
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    const text = e.target.value;
    practiceState.scratchpadNotes[realIndex] = text;
    saveSession();
    
    // Save to global notes DB
    clearTimeout(noteSaveTimeout);
    noteSaveTimeout = setTimeout(async () => {
        let q;
        if (practiceState.isBookmarkSession || practiceState.isNotesSession) {
            q = extractedImages[practiceState.currentIndex];
        } else {
            q = extractedImages[realIndex];
        }
        
        if (!q) return;
        
        // Create unique ID based on label and dataUrl length to identify this specific question
        const uniqueId = 'note_' + (q.label || 'q').replace(/\s+/g, '_') + '_' + (q.dataUrl ? q.dataUrl.length : '0');
        
        if (text.trim() === '') {
            await removeGlobalNote(uniqueId);
        } else {
            await saveGlobalNote({
                id: uniqueId,
                label: q.label || `Question ${realIndex + 1}`,
                dataUrl: q.dataUrl,
                noteText: text,
                timestamp: Date.now()
            });
        }
        
        // if renderNotedQuestions exists, refresh it in background
        if (typeof renderNotedQuestions === 'function') {
            renderNotedQuestions();
        }
    }, 1000);
});


document.addEventListener('keydown', (e) => {
    // Only apply if NTA interface is active and no inputs are focused
    if (ntaInterfaceContainer.classList.contains('hidden')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch(e.key) {
        case 'ArrowRight':
            ntaNextBtn.click();
            break;
        case 'ArrowLeft':
            ntaBackBtn.click();
            break;
        case 's':
        case 'S':
            ntaSaveNextBtn.click();
            break;
        case 'm':
        case 'M':
            ntaMarkReviewBtn.click();
            break;
        case 'c':
        case 'C':
            ntaClearBtn.click();
            break;
        case 'Escape':
            ntaToggleSidebarBtn.click();
            break;
    }
});

// =============================================================
// INITIALIZATION & SESSION RESTORE
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof localforage !== 'undefined') {
        localforage.getItem('activeSession').then(sessionData => {
            if (sessionData && sessionData.practiceState) {
                resumeSessionModal.classList.remove('hidden');
                
                resumeSessionBtn.onclick = () => {
                    restoreSession(sessionData);
                    resumeSessionModal.classList.add('hidden');
                };
                
                discardSessionBtn.onclick = () => {
                    clearSession();
                    resumeSessionModal.classList.add('hidden');
                };
            }
        }).catch(console.error);
    }
});

function restoreSession(sessionData) {
    practiceState = sessionData.practiceState;
    extractedImages = sessionData.extractedImages;
    extractedAnswerPages = sessionData.extractedAnswerPages;
    currentSessionId = sessionData.currentSessionId;
    
    document.getElementById('uploadContainer').classList.add('hidden');
    
    if (practiceState.theme === 'nta') {
        ntaInterfaceContainer.classList.remove('hidden');
        
        const uniqueExercises = [...new Set(practiceState.activeIndices.map(idx => {
            const q = extractedImages[idx];
            if (q.label.includes(' - ')) return q.label.split(' - ')[0];
            return 'Exercise 1';
        }))];
        
        buildNtaTabs(uniqueExercises);
        buildNtaPalette();
        renderNtaQuestion(practiceState.currentIndex);
    } else {
        practiceInterfaceContainer.classList.remove('hidden');
        totalQNum.textContent = practiceState.activeIndices.length;
        renderPracticeQuestion(practiceState.currentIndex);
    }
    
    startTotalTimer();
}

function cropCanvas(sourceCanvas, x, y, w, h) {
    if (w <= 0 || h <= 0) return null;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(sourceCanvas, x, y, w, h, 0, 0, w, h);
    return c;
}

async function stitchImages(topDataUrl, bottomCanvas) {
    return new Promise((resolve) => {
        const topImg = new Image();
        topImg.onload = () => {
            const w = Math.max(topImg.width, bottomCanvas.width);
            const h = topImg.height + bottomCanvas.height;
            
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
            
            // Draw top image
            ctx.drawImage(topImg, 0, 0);
            // Draw bottom canvas
            ctx.drawImage(bottomCanvas, 0, topImg.height);
            
            resolve(c.toDataURL('image/png'));
        };
        topImg.src = topDataUrl;
    });
}

// =============================================================
// FULL ANSWER KEY MODAL
// =============================================================
function openFullAnswerKeyModal() {
    const modal = document.getElementById('fullAnswerKeyModal');
    const container = document.getElementById('fullAnswerKeyContent');
    if (!modal || !container) return;
    
    container.innerHTML = '';
    
    if (extractedAnswerPages.length === 0) {
        container.innerHTML = '<p class="text-center p-8">No full answer key pages available.</p>';
    } else {
        extractedAnswerPages.forEach(p => {
            const img = document.createElement('img');
            img.src = p.dataUrl;
            img.className = 'w-full h-auto block   dark:-navy-600  rounded';
            container.appendChild(img);
        });
    }
    modal.classList.remove('hidden');
}

document.getElementById('practiceViewFullAnswerKeyBtn')?.addEventListener('click', openFullAnswerKeyModal);
document.getElementById('ntaViewFullAnswerKeyBtn')?.addEventListener('click', openFullAnswerKeyModal);
document.getElementById('closeFullAnswerKeyBtn')?.addEventListener('click', () => {
    document.getElementById('fullAnswerKeyModal').classList.add('hidden');
});


// RESULTS DASHBOARD - Full post-test analysis view
// ================================================================
let _lrdNavWired = false;
let _lrdChartTime = null, _lrdChartScoreQ = null, _lrdChartScoreT = null;

function showResultsDashboard() {
    // Exit fullscreen mode on test complete
    try {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log("Exit fullscreen failed:", err));
        }
    } catch(err) {
        console.error("Fullscreen exit error:", err);
    }

    // Stop all timers
    if (practiceState.totalTimerInterval) clearInterval(practiceState.totalTimerInterval);
    if (practiceState.qTimerInterval) clearInterval(practiceState.qTimerInterval);
    if (practiceState.countdownInterval) clearInterval(practiceState.countdownInterval);

    // Hide all other views
    const ntaEl = document.getElementById('ntaInterfaceContainer');
    if (ntaEl) ntaEl.classList.add('hidden');
    if (summaryContainer) summaryContainer.classList.add('hidden');

    const dash = document.getElementById('liveResultsDashboard');
    if (!dash) { showSummary(); return; }
    dash.classList.remove('hidden');

    // Gather stats from practiceState
    const scorePerQ = practiceState.scorePerQ || 4;
    const hasNeg = practiceState.negativeMarking !== false;
    const indices = practiceState.activeIndices || [];
    const totalQ = indices.length;
    let totalSeconds = 0, correctCount = 0, incorrectCount = 0, attemptedCount = 0;

    indices.forEach(ri => {
        const s = practiceState.stats[ri];
        if (!s) return;
        
        const ans = practiceState.answers ? practiceState.answers[ri] : undefined;
        const q = (typeof extractedImages !== 'undefined' && extractedImages) ? extractedImages[ri] : undefined;
        
        if (ans !== undefined && ans !== null && ans !== '') {
            s.attempted = true;
            if (s.ntaStatus === 'not_visited' || s.ntaStatus === 'not_answered') {
                s.ntaStatus = 'answered';
            }
        } else if (s.ntaStatus === 'answered' || s.ntaStatus === 'answered_marked') {
            s.attempted = true;
        }

        if (s.evaluation === null) {
            if (s.attempted) {
                if (q && (q.correctAnswer || q.answer)) {
                    const normAns = String(ans).trim().toUpperCase();
                    const normCorrect = String(q.correctAnswer || q.answer).trim().toUpperCase();
                    s.evaluation = (normAns === normCorrect) ? 'correct' : 'incorrect';
                } else {
                    // Default attempted question to 'correct' for practice/live mode if no official key embedded
                    s.evaluation = 'correct';
                }
            }
        }

        totalSeconds += (s.timeSpent || 0);
        if (s.attempted) attemptedCount++;
        if (s.evaluation === 'correct') correctCount++;
        if (s.evaluation === 'incorrect') incorrectCount++;
    });

    const skippedCount = totalQ - attemptedCount;
    const markedCount = indices.filter(ri => practiceState.stats[ri]?.ntaStatus === 'marked' || practiceState.stats[ri]?.ntaStatus === 'answered_marked').length;
    const lrdMarkedText = document.getElementById('lrdMarkedText');
    if (lrdMarkedText) lrdMarkedText.textContent = `Marked for Review (${markedCount})`;
    const maxScore = totalQ * scorePerQ;
    const score = (correctCount * scorePerQ) - (hasNeg ? incorrectCount : 0);
    const scorePercent = maxScore > 0 ? Math.max(score, 0) / maxScore * 100 : 0;
    const accuracy = attemptedCount > 0 ? correctCount / attemptedCount * 100 : 0;
    const avgTimePerQ = totalQ > 0 ? Math.round(totalSeconds / totalQ) : 0;

    const stats = { scorePerQ, hasNeg, totalQ, totalSeconds, correctCount, incorrectCount, attemptedCount, skippedCount, maxScore, score, scorePercent, accuracy, avgTimePerQ };

    // Role badge & Live tags
    const inLive = typeof isLiveMode !== 'undefined' && isLiveMode;
    const roleBadge = document.getElementById('lrdRoleBadge');
    if (roleBadge) {
        if (inLive) {
            const amHost = typeof isHost !== 'undefined' && isHost;
            roleBadge.textContent = amHost ? 'Host' : 'Participant';
        } else {
            roleBadge.textContent = 'Solo Practice';
        }
    }

    document.querySelectorAll('.lrd-live-tag').forEach(tag => {
        if (!inLive) {
            tag.classList.remove('hidden');
        } else {
            tag.classList.add('hidden');
        }
    });

    // Wire nav once
    if (!_lrdNavWired) {
        _lrdNavWired = true;
        document.querySelectorAll('.lrd-nav').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.lrd-nav').forEach(b => {
                    b.style.backgroundColor = '';
                    b.style.color = '';
                });
                btn.style.backgroundColor = '#FFE600';
                btn.style.color = '#000000';
                document.querySelectorAll('.lrd-panel').forEach(p => p.classList.add('hidden'));
                const panel = document.getElementById('lrd' + btn.dataset.panel);
                if (panel) panel.classList.remove('hidden');
            });
        });

        const exitBtn = document.getElementById('lrdExitBtn');
        if (exitBtn) {
            exitBtn.onclick = () => {
                window.location.href = '/';
            };
        }
    }

    // Preserve active panel if user is currently inspecting a tab, or set default
    const currentlyActivePanel = Array.from(document.querySelectorAll('.lrd-panel')).find(p => !p.classList.contains('hidden'));
    const amSpectatorHost = inLive && (typeof isHost !== 'undefined' && isHost) && (typeof hostParticipating !== 'undefined' && !hostParticipating);

    if (!currentlyActivePanel || amSpectatorHost) {
        document.querySelectorAll('.lrd-nav').forEach(b => {
            b.style.backgroundColor = '';
            b.style.color = '';
        });
        document.querySelectorAll('.lrd-panel').forEach(p => p.classList.add('hidden'));
        
        const targetPanelId = amSpectatorHost ? 'lrdLeaderboard' : 'lrdOverview';
        const targetNavPanel = amSpectatorHost ? 'Leaderboard' : 'Overview';

        const targetPanel = document.getElementById(targetPanelId);
        if (targetPanel) targetPanel.classList.remove('hidden');
        const targetBtn = document.querySelector(`.lrd-nav[data-panel="${targetNavPanel}"]`);
        if (targetBtn) {
            targetBtn.style.backgroundColor = '#FFE600';
            targetBtn.style.color = '#000000';
        }
    }

    // Populate all panels
    _lrdFillOverview(stats);
    _lrdFillTimeAnalysis(stats);
    _lrdFillInsights(stats);
    _lrdFillPeerCompare(stats);
    _lrdFillScoreProgress(stats);
    _lrdFillLeaderboard();

    // Submit live score if applicable
    if (typeof window.liveRoomSubmit === 'function') {
        window.liveRoomSubmit(score, accuracy);
    }

    // Save session (solo mode)
    if (typeof saveCurrentSession === 'function') {
        try { saveCurrentSession(totalSeconds, correctCount, incorrectCount, skippedCount); } catch(e) {}
    }
    if (typeof clearSession === 'function') {
        try { clearSession(); } catch(e) {}
    }
}

// Make available globally for liveRoom.js to call
window.showResultsDashboard = showResultsDashboard;

const JEE_MAIN_PERCENTILE_DATA = [
    { minPct: 93.67, maxPct: 100.00, minPctl: 99.99989145, maxPctl: 100.00000000 },
    { minPct: 90.33, maxPct: 93.33,  minPctl: 99.994681,   maxPctl: 99.997394 },
    { minPct: 87.67, maxPct: 90.00,  minPctl: 99.990990,   maxPctl: 99.994029 },
    { minPct: 83.33, maxPct: 87.33,  minPctl: 99.977205,   maxPctl: 99.988819 },
    { minPct: 80.33, maxPct: 83.33,  minPctl: 99.960163,   maxPctl: 99.975034 },
    { minPct: 77.00, maxPct: 80.00,  minPctl: 99.934980,   maxPctl: 99.956364 },
    { minPct: 73.67, maxPct: 76.67,  minPctl: 99.901113,   maxPctl: 99.928901 },
    { minPct: 70.33, maxPct: 73.33,  minPctl: 99.851616,   maxPctl: 99.893732 },
    { minPct: 67.00, maxPct: 70.00,  minPctl: 99.795063,   maxPctl: 99.845212 },
    { minPct: 63.67, maxPct: 66.67,  minPctl: 99.710831,   maxPctl: 99.782472 },
    { minPct: 60.33, maxPct: 63.33,  minPctl: 99.573990,   maxPctl: 99.688579 },
    { minPct: 57.00, maxPct: 60.00,  minPctl: 99.456939,   maxPctl: 99.573193 },
    { minPct: 53.67, maxPct: 56.67,  minPctl: 99.272084,   maxPctl: 99.431214 },
    { minPct: 50.33, maxPct: 53.33,  minPctl: 99.028614,   maxPctl: 99.239737 },
    { minPct: 47.00, maxPct: 50.00,  minPctl: 98.732389,   maxPctl: 98.990296 },
    { minPct: 43.67, maxPct: 46.67,  minPctl: 98.317414,   maxPctl: 98.666935 },
    { minPct: 40.33, maxPct: 43.33,  minPctl: 97.811260,   maxPctl: 98.254132 },
    { minPct: 37.00, maxPct: 40.00,  minPctl: 97.142937,   maxPctl: 97.685672 },
    { minPct: 33.67, maxPct: 36.67,  minPctl: 96.204550,   maxPctl: 96.978272 },
    { minPct: 30.33, maxPct: 33.33,  minPctl: 94.998594,   maxPctl: 96.064850 },
    { minPct: 27.00, maxPct: 30.00,  minPctl: 93.471231,   maxPctl: 94.749479 },
    { minPct: 23.67, maxPct: 26.67,  minPctl: 91.072128,   maxPctl: 93.152971 },
    { minPct: 20.33, maxPct: 23.33,  minPctl: 87.512225,   maxPctl: 90.702200 },
    { minPct: 17.00, maxPct: 20.00,  minPctl: 82.016062,   maxPctl: 86.907944 },
    { minPct: 13.67, maxPct: 16.67,  minPctl: 73.287808,   maxPctl: 80.982153 },
    { minPct: 10.33, maxPct: 13.33,  minPctl: 58.151490,   maxPctl: 71.302052 },
    { minPct: 7.00,  maxPct: 10.00,  minPctl: 37.394529,   maxPctl: 56.569310 },
    { minPct: 3.67,  maxPct: 6.67,   minPctl: 13.495849,   maxPctl: 33.229128 },
    { minPct: 0.00,  maxPct: 3.33,   minPctl: 0.8435177,   maxPctl: 9.6954066 }
];

function predictJeeMainPercentile(scorePercent) {
    const rawPct = Math.max(0, Math.min(100, scorePercent));
    let predictedPctl = 0;
    let rangeStr = "";
    let bracketInfo = "";
    let activeIndex = -1;

    for (let i = 0; i < JEE_MAIN_PERCENTILE_DATA.length; i++) {
        const row = JEE_MAIN_PERCENTILE_DATA[i];
        if (rawPct >= row.minPct && rawPct <= row.maxPct) {
            activeIndex = i;
            const fraction = row.maxPct === row.minPct ? 1 : (rawPct - row.minPct) / (row.maxPct - row.minPct);
            predictedPctl = row.minPctl + fraction * (row.maxPctl - row.minPctl);
            rangeStr = row.minPctl.toFixed(4) + "% - " + row.maxPctl.toFixed(4) + "%ile";
            bracketInfo = `JEE Main score range: ${row.minPct.toFixed(2)}% - ${row.maxPct.toFixed(2)}%`;
            break;
        }
    }

    if (activeIndex === -1) {
        if (rawPct >= 100) {
            activeIndex = 0;
            predictedPctl = 100.0000;
            rangeStr = "99.9999% - 100.0000%ile";
            bracketInfo = "Perfect 100% Score";
        } else if (rawPct <= 0) {
            activeIndex = JEE_MAIN_PERCENTILE_DATA.length - 1;
            predictedPctl = 0.8435;
            rangeStr = "0.8435% - 9.6954%ile";
            bracketInfo = "0% Score";
        } else {
            for (let i = 0; i < JEE_MAIN_PERCENTILE_DATA.length - 1; i++) {
                const upperRow = JEE_MAIN_PERCENTILE_DATA[i];
                const lowerRow = JEE_MAIN_PERCENTILE_DATA[i + 1];
                if (rawPct < upperRow.minPct && rawPct > lowerRow.maxPct) {
                    activeIndex = i;
                    const fraction = (rawPct - lowerRow.maxPct) / (upperRow.minPct - lowerRow.maxPct);
                    predictedPctl = lowerRow.maxPctl + fraction * (upperRow.minPctl - lowerRow.maxPctl);
                    rangeStr = lowerRow.maxPctl.toFixed(4) + "% - " + upperRow.minPctl.toFixed(4) + "%ile";
                    bracketInfo = `Between ${lowerRow.maxPct.toFixed(2)}% and ${upperRow.minPct.toFixed(2)}% bracket`;
                    break;
                }
            }
        }
    }

    let tier = "Standard";
    if (predictedPctl >= 99.9) tier = "🔥 Outstanding (Top 0.1%)";
    else if (predictedPctl >= 99.0) tier = "🌟 Excellent (Top 1%)";
    else if (predictedPctl >= 95.0) tier = "🎯 Very Good (Top 5%)";
    else if (predictedPctl >= 90.0) tier = "👍 Good (Top 10%)";
    else if (predictedPctl >= 80.0) tier = "📈 Above Average (Top 20%)";
    else if (predictedPctl >= 50.0) tier = "⚡ Average";
    else tier = "💪 Needs Improvement";

    return {
        scorePercent: rawPct,
        predictedPercentile: predictedPctl,
        rangeStr: rangeStr,
        bracketInfo: bracketInfo,
        tier: tier,
        activeIndex: activeIndex
    };
}

function _updateJeePredictorUI(scorePercent) {
    const res = predictJeeMainPercentile(scorePercent);
    const el = id => document.getElementById(id);

    if (el('jeePredPercentile')) {
        el('jeePredPercentile').textContent = res.predictedPercentile.toFixed(2) + '%ile';
    }
    if (el('jeePredScorePct')) {
        el('jeePredScorePct').textContent = res.scorePercent.toFixed(1) + '%';
    }
    if (el('jeePredRange')) {
        el('jeePredRange').textContent = res.rangeStr;
    }
    if (el('jeePredBracketInfo')) {
        el('jeePredBracketInfo').textContent = res.bracketInfo;
    }
    if (el('jeePredTier')) {
        el('jeePredTier').textContent = res.tier;
    }
    if (el('jeePredBar')) {
        const barPct = Math.max(0, Math.min(100, res.predictedPercentile));
        el('jeePredBar').style.width = barPct + '%';
    }
    if (el('jeePredBarPct')) {
        el('jeePredBarPct').textContent = res.predictedPercentile.toFixed(1) + '%ile';
    }

    const tableBody = el('jeeBenchmarkTableBody');
    if (tableBody) {
        tableBody.innerHTML = JEE_MAIN_PERCENTILE_DATA.map((row, idx) => {
            const isMatch = (idx === res.activeIndex);
            const rowBg = isMatch ? 'bg-amber-500/20 text-amber-200 font-bold' : 'hover:bg-gray-800/30 text-gray-300';
            const badge = isMatch ? ' <span class="ml-2 px-1.5 py-0.5 text-[9px] uppercase bg-amber-500 text-black font-black rounded">Your Bracket</span>' : '';
            return `<tr class="${rowBg} transition-colors">
                <td class="py-2 px-2">${row.minPct.toFixed(2)}% - ${row.maxPct.toFixed(2)}%${badge}</td>
                <td class="py-2 px-2">${row.minPctl.toFixed(6)} - ${row.maxPctl.toFixed(8)} %ile</td>
            </tr>`;
        }).join('');
    }
}

function _updateSaPagePredictorUI(scorePercent) {
    const res = predictJeeMainPercentile(scorePercent);
    const el = id => document.getElementById(id);

    if (el('saPagePredPercentile')) {
        el('saPagePredPercentile').textContent = res.predictedPercentile.toFixed(2) + '%ile';
    }
    if (el('saPagePredScorePct')) {
        el('saPagePredScorePct').textContent = res.scorePercent.toFixed(1) + '%';
    }
    if (el('saPagePredRange')) {
        el('saPagePredRange').textContent = res.rangeStr;
    }
    if (el('saPagePredBracketInfo')) {
        el('saPagePredBracketInfo').textContent = res.bracketInfo;
    }
    if (el('saPagePredTier')) {
        el('saPagePredTier').textContent = res.tier;
    }
    if (el('saPagePredBar')) {
        const barPct = Math.max(0, Math.min(100, res.predictedPercentile));
        el('saPagePredBar').style.width = barPct + '%';
    }
    if (el('saPagePredBarPct')) {
        el('saPagePredBarPct').textContent = res.predictedPercentile.toFixed(1) + '%ile';
    }

    const tableBody = el('saPageBenchmarkTableBody');
    if (tableBody) {
        tableBody.innerHTML = JEE_MAIN_PERCENTILE_DATA.map((row, idx) => {
            const isMatch = (idx === res.activeIndex);
            const rowBg = isMatch ? 'bg-amber-500/20 text-amber-200 font-bold' : 'hover:bg-gray-800/30 text-gray-300';
            const badge = isMatch ? ' <span class="ml-2 px-1.5 py-0.5 text-[9px] uppercase bg-amber-500 text-black font-black rounded">Your Bracket</span>' : '';
            return `<tr class="${rowBg} transition-colors">
                <td class="py-2 px-2">${row.minPct.toFixed(2)}% - ${row.maxPct.toFixed(2)}%${badge}</td>
                <td class="py-2 px-2">${row.minPctl.toFixed(6)} - ${row.maxPctl.toFixed(8)} %ile</td>
            </tr>`;
        }).join('');
    }
}

function _lrdFillOverview(s) {
    const { correctCount, incorrectCount, skippedCount, totalQ, score, maxScore, scorePercent, accuracy, totalSeconds, avgTimePerQ, scorePerQ, hasNeg } = s;
    const el = id => document.getElementById(id);
    const mins = Math.floor(totalSeconds / 60), secs = totalSeconds % 60;

    _updateJeePredictorUI(scorePercent);

    if (el('lrdOverviewMeta')) el('lrdOverviewMeta').textContent = totalQ + ' QS · ' + mins + 'M ' + secs + 'S TIME';

    // Score ring
    const ring = el('lrdScoreRing');
    if (ring) {
        const circ = 2 * Math.PI * 15.9;
        const pct = Math.min(scorePercent, 100);
        setTimeout(() => {
            ring.setAttribute('stroke-dasharray', (pct / 100 * circ) + ' ' + circ);
            ring.setAttribute('stroke', score < 0 ? '#ef4444' : score === 0 ? '#6b7280' : '#22c55e');
        }, 150);
        if (el('lrdScorePct')) el('lrdScorePct').textContent = Math.round(pct) + '%';
    }
    if (el('lrdScoreVal')) el('lrdScoreVal').textContent = score % 1 === 0 ? score : score.toFixed(2);
    if (el('lrdScoreMax')) el('lrdScoreMax').textContent = '/' + maxScore;
    if (el('lrdAccuracy')) el('lrdAccuracy').textContent = accuracy.toFixed(1) + '%';

    if (el('lrdCorrect')) el('lrdCorrect').textContent = correctCount;
    if (el('lrdCorrectMark')) el('lrdCorrectMark').textContent = '+' + (correctCount * scorePerQ) + ' marks';
    if (el('lrdIncorrect')) el('lrdIncorrect').textContent = incorrectCount;
    if (el('lrdIncorrectMark')) el('lrdIncorrectMark').textContent = '-' + (hasNeg ? incorrectCount : 0) + ' marks';
    if (el('lrdSkipped')) el('lrdSkipped').textContent = skippedCount;
    if (el('lrdSkippedPct')) el('lrdSkippedPct').textContent = (totalQ > 0 ? Math.round(skippedCount / totalQ * 100) : 0) + '% of paper';
    if (el('lrdTimePerQ')) el('lrdTimePerQ').textContent = avgTimePerQ + 's';
    if (el('lrdTotalTime')) el('lrdTotalTime').textContent = mins + 'm ' + secs + 's total';

    // Distribution bar
    const cP = totalQ > 0 ? correctCount / totalQ * 100 : 0;
    const iP = totalQ > 0 ? incorrectCount / totalQ * 100 : 0;
    const sP = totalQ > 0 ? skippedCount / totalQ * 100 : 100;
    setTimeout(() => {
        if (el('lrdDistC')) el('lrdDistC').style.width = cP + '%';
        if (el('lrdDistI')) el('lrdDistI').style.width = iP + '%';
        if (el('lrdDistS')) el('lrdDistS').style.width = sP + '%';
    }, 150);
    if (el('lrdDistCP')) el('lrdDistCP').textContent = Math.round(cP) + '%';
    if (el('lrdDistIP')) el('lrdDistIP').textContent = Math.round(iP) + '%';
    if (el('lrdDistSP')) el('lrdDistSP').textContent = Math.round(sP) + '%';

    // Percentile (only in live mode with rankings)
    const pCard = el('lrdPercentileCard');
    if (pCard && window.liveRoomParticipants && window.liveRoomParticipants.length > 0) {
        const myId = (typeof isHost !== 'undefined' && isHost) ? 'host' : (window.myLivePeerId || '');
        const me = window.liveRoomParticipants.find(p => p.id === myId);
        if (me && me.rank) {
            const total = window.liveRoomParticipants.length;
            const pct = total > 1 ? Math.round((total - me.rank) / (total - 1) * 100) : 100;
            if (el('lrdPercentile')) el('lrdPercentile').textContent = pct + '%ile';
            if (el('lrdRankText')) el('lrdRankText').textContent = 'Rank #' + me.rank;
            pCard.classList.remove('hidden');
        }
    }

    // Question map
    const qMap = el('lrdQMap');
    if (qMap) {
        qMap.innerHTML = '';
        (practiceState.activeIndices || []).forEach((ri, i) => {
            const stat = practiceState.stats[ri];
            if (!stat) return;
            let bg = 'bg-gray-800  ';
            if (stat.evaluation === 'correct') bg = 'bg-green-600';
            else if (stat.evaluation === 'incorrect') bg = 'bg-red-600';
            else if (stat.attempted || stat.ntaStatus === 'answered' || stat.ntaStatus === 'answered_marked') bg = 'bg-gray-500';
            const d = document.createElement('div');
            d.className = 'w-6 h-6 rounded text-[9px] flex items-center justify-center font-bold  ' + bg;
            d.textContent = i + 1;
            d.title = 'Q' + (i+1) + ': ' + (stat.evaluation || stat.ntaStatus);
            qMap.appendChild(d);
        });
    }
}

function _lrdFillTimeAnalysis(s) {
    const { totalSeconds, totalQ, avgTimePerQ } = s;
    const el = id => document.getElementById(id);
    const mins = Math.floor(totalSeconds / 60), secs = totalSeconds % 60;

    if (el('lrdTimeMeta')) el('lrdTimeMeta').textContent = 'AVG PACE: ' + avgTimePerQ + 'S/Q · TOTAL: ' + mins + 'M ' + secs + 'S';
    if (el('lrdAvgLabel')) el('lrdAvgLabel').textContent = '- - - - Avg: ' + avgTimePerQ + 's/Q';

    let fastCorrect = 0, fastIncorrect = 0;
    let atParCorrect = 0, atParIncorrect = 0;
    let slowCorrect = 0, slowIncorrect = 0;
    const timeData = [], colorData = [];

    (practiceState.activeIndices || []).forEach(ri => {
        const stat = practiceState.stats[ri];
        if (!stat) return;
        const t = stat.timeSpent || 0;
        timeData.push(t);
        
        const referenceTime = (stat.targetTime && stat.targetTime > 0) ? stat.targetTime : avgTimePerQ;
        const fastThreshold = referenceTime * 0.8;
        const slowThreshold = referenceTime * 1.2;
        
        let pace = 'at_par';
        if (t < fastThreshold) pace = 'fast';
        else if (t > slowThreshold) pace = 'slow';

        if (stat.evaluation === 'correct') {
            if (pace === 'fast') fastCorrect++;
            else if (pace === 'slow') slowCorrect++;
            else atParCorrect++;
            colorData.push('rgba(34,197,94,0.8)');
        } else if (stat.evaluation === 'incorrect') {
            if (pace === 'fast') fastIncorrect++;
            else if (pace === 'slow') slowIncorrect++;
            else atParIncorrect++;
            colorData.push('rgba(239,68,68,0.8)');
        } else {
            colorData.push('rgba(107,114,128,0.4)');
        }
    });

    if (el('lrdFastCorrect')) el('lrdFastCorrect').textContent = fastCorrect;
    if (el('lrdAtParCorrect')) el('lrdAtParCorrect').textContent = atParCorrect;
    if (el('lrdSlowCorrect')) el('lrdSlowCorrect').textContent = slowCorrect;
    if (el('lrdFastIncorrect')) el('lrdFastIncorrect').textContent = fastIncorrect;
    if (el('lrdAtParIncorrect')) el('lrdAtParIncorrect').textContent = atParIncorrect;
    if (el('lrdSlowIncorrect')) el('lrdSlowIncorrect').textContent = slowIncorrect;

    const ctx = el('lrdTimeChart');
    if (ctx && typeof Chart !== 'undefined') {
        if (_lrdChartTime) { _lrdChartTime.destroy(); _lrdChartTime = null; }
        _lrdChartTime = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: (practiceState.activeIndices || []).map((_, i) => i + 1),
                datasets: [{ data: timeData, backgroundColor: colorData, Width: 0, Radius: 2 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.raw + 's' } } },
                scales: {
                    x: { ticks: { color: '#6b7280', maxTicksLimit: 15, font: { size: 9 } }, grid: { color: '#1f2937' } },
                    y: { ticks: { color: '#6b7280', callback: v => v + 's', font: { size: 9 } }, grid: { color: '#1f2937' } }
                }
            }
        });
    }
}

function _lrdFillPeerCompare(s) {
    const { correctCount, totalQ, maxScore, hasNeg, scorePerQ, totalSeconds, attemptedCount } = s;
    const el = id => document.getElementById(id);
    if (!el('lrdPeerCompare')) return;

    const inLive = typeof isLiveMode !== 'undefined' && isLiveMode;
    const peerGrid = el('lrdPeerCompareGrid');
    const peerSolo = el('lrdPeerCompareSolo');

    if (!inLive) {
        if (peerGrid) peerGrid.classList.add('hidden');
        if (peerSolo) peerSolo.classList.remove('hidden');
        return;
    } else {
        if (peerGrid) peerGrid.classList.remove('hidden');
        if (peerSolo) peerSolo.classList.add('hidden');
    }

    // You
    const youAcc = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const penalty = hasNeg ? s.incorrectCount : 0;
    const youScore = (correctCount * scorePerQ) - penalty;
    const youScorePct = maxScore > 0 ? Math.round((youScore / maxScore) * 100) : 0;
    const youPace = attemptedCount > 0 ? Math.round(totalSeconds / attemptedCount) : 0;

    // Simulate Top 10%ile and Top 25%ile based on current test's complexity 
    // (In reality, this would be fetched from a backend, but we're simulating here)
    const top10Acc = Math.min(95, Math.max(youAcc + 15, 80));
    const top25Acc = Math.min(85, Math.max(youAcc + 5, 65));

    const top10Score = Math.min(90, Math.max(youScorePct + 20, 75));
    const top25Score = Math.min(75, Math.max(youScorePct + 10, 60));

    const top10Pace = Math.max(15, youPace > 0 ? Math.round(youPace * 0.7) : 45);
    const top25Pace = Math.max(20, youPace > 0 ? Math.round(youPace * 0.85) : 55);

    // Update Accuracy
    if (el('peerYouAcc')) el('peerYouAcc').textContent = youAcc + '%';
    if (el('peerYouAccBar')) el('peerYouAccBar').style.width = youAcc + '%';
    if (el('peerTop10Acc')) el('peerTop10Acc').textContent = top10Acc + '%';
    if (el('peerTop10AccBar')) el('peerTop10AccBar').style.width = top10Acc + '%';
    if (el('peerTop25Acc')) el('peerTop25Acc').textContent = top25Acc + '%';
    if (el('peerTop25AccBar')) el('peerTop25AccBar').style.width = top25Acc + '%';

    // Update Score
    if (el('peerYouScore')) el('peerYouScore').textContent = youScorePct + '%';
    if (el('peerYouScoreBar')) el('peerYouScoreBar').style.width = Math.max(0, youScorePct) + '%';
    if (el('peerTop10Score')) el('peerTop10Score').textContent = top10Score + '%';
    if (el('peerTop10ScoreBar')) el('peerTop10ScoreBar').style.width = top10Score + '%';
    if (el('peerTop25Score')) el('peerTop25Score').textContent = top25Score + '%';
    if (el('peerTop25ScoreBar')) el('peerTop25ScoreBar').style.width = top25Score + '%';

    // Update Pace (inverse logic, shorter bar is better but let's just make max 120s)
    const paceToPct = p => Math.min(100, Math.round((p / 120) * 100));
    if (el('peerYouPace')) el('peerYouPace').textContent = youPace + 's';
    if (el('peerYouPaceBar')) el('peerYouPaceBar').style.width = paceToPct(youPace) + '%';
    if (el('peerTop10Pace')) el('peerTop10Pace').textContent = top10Pace + 's';
    if (el('peerTop10PaceBar')) el('peerTop10PaceBar').style.width = paceToPct(top10Pace) + '%';
    if (el('peerTop25Pace')) el('peerTop25Pace').textContent = top25Pace + 's';
    if (el('peerTop25PaceBar')) el('peerTop25PaceBar').style.width = paceToPct(top25Pace) + '%';
}

function _lrdFillInsights(s) {
    const { correctCount, incorrectCount, totalQ, maxScore, hasNeg, scorePerQ } = s;
    const el = id => document.getElementById(id);
    const neg = hasNeg ? incorrectCount : 0;

    if (el('lrdNegMarks')) el('lrdNegMarks').textContent = neg > 0 ? '-' + neg : '0';
    const earned = correctCount * scorePerQ;
    const negPct = earned > 0 ? Math.min(Math.round(neg / earned * 100), 100) : 0;
    setTimeout(() => { if (el('lrdNegBar')) el('lrdNegBar').style.width = negPct + '%'; }, 150);
    if (el('lrdNegPct')) el('lrdNegPct').textContent = negPct + '% earned marks negated';

    // Streaks and blind guesses
    let bestStreak = 0, curStreak = 0, worstRun = 0, curWrong = 0, blindGuesses = 0;
    (practiceState.activeIndices || []).forEach(ri => {
        const stat = practiceState.stats[ri];
        if (!stat) return;
        if (stat.evaluation === 'correct') {
            curStreak++; curWrong = 0;
            if (curStreak > bestStreak) bestStreak = curStreak;
        } else if (stat.evaluation === 'incorrect') {
            curWrong++; curStreak = 0;
            if (curWrong > worstRun) worstRun = curWrong;
            if ((stat.timeSpent || 0) < 15) blindGuesses++;
        } else { curStreak = 0; curWrong = 0; }
    });

    if (el('lrdBestStreak')) el('lrdBestStreak').innerHTML = bestStreak + ' <span class="text-base">Q</span>';
    if (el('lrdWrongRun')) el('lrdWrongRun').innerHTML = worstRun + ' <span class="text-base">Q</span>';
    if (el('lrdBlindGuesses')) el('lrdBlindGuesses').textContent = blindGuesses;
    if (el('lrdBlindNote')) {
        el('lrdBlindNote').textContent = blindGuesses === 0 ? 'None. Well considered.' : blindGuesses + ' answered in under 15 seconds';
        el('lrdBlindNote').className = 'text-xs mt-2 ' + (blindGuesses === 0 ? 'text-green-400' : 'text-yellow-400');
    }

    // Accuracy per part (4 quarters)
    const accParts = el('lrdAccParts');
    if (accParts) {
        accParts.innerHTML = '';
        const partSize = Math.ceil(totalQ / 4);
        for (let p = 0; p < 4; p++) {
            let pC = 0, pA = 0;
            for (let i = p * partSize; i < Math.min((p+1)*partSize, totalQ); i++) {
                const ri = (practiceState.activeIndices || [])[i];
                if (ri === undefined) continue;
                const stat = practiceState.stats[ri];
                if (!stat) continue;
                if (stat.evaluation === 'correct') { pC++; pA++; }
                else if (stat.evaluation === 'incorrect') pA++;
            }
            const pAcc = pA > 0 ? Math.round(pC / pA * 100) : 0;
            const bar = document.createElement('div');
            bar.className = 'flex-1 flex flex-col items-center gap-1';
            const barH = Math.max(pAcc * 0.7, 4);
            const barColor = pAcc > 60 ? '#8b5cf6' : pAcc > 30 ? '#6366f1' : '#4f46e5';
            bar.innerHTML = '<span class="text-[10px]">' + pAcc + '%</span><div style="width:100%; height:' + barH + 'px; background:' + barColor + '; -radius:3px 3px 0 0;"></div>';
            accParts.appendChild(bar);
        }
    }

    // Marks per minute per subject
    const mpmEl = el('lrdMarksPerMin');
    if (mpmEl) {
        const subjectData = {};
        (practiceState.activeIndices || []).forEach(ri => {
            const stat = practiceState.stats[ri];
            if (!stat) return;
            const ex = stat.exercise || 'Overall';
            if (!subjectData[ex]) subjectData[ex] = { marks: 0, seconds: 0 };
            subjectData[ex].seconds += stat.timeSpent || 0;
            if (stat.evaluation === 'correct') subjectData[ex].marks += scorePerQ;
            else if (stat.evaluation === 'incorrect' && hasNeg) subjectData[ex].marks -= 1;
        });
        mpmEl.innerHTML = '';
        let rank = 1;
        const entries = Object.entries(subjectData);
        if (entries.length === 0) {
            mpmEl.innerHTML = '<div class="text-xs">No data available</div>';
        } else {
            entries.forEach(([name, d]) => {
                const mpm = d.seconds > 0 ? (d.marks / (d.seconds / 60)).toFixed(2) : '0.00';
                const isPos = parseFloat(mpm) >= 0;
                const row = document.createElement('div');
                row.className = 'flex items-center gap-3';
                row.innerHTML = '<span class="text-xs w-4">' + (rank++) + '</span>' +
                    '<span class="text-xs font-semibold flex-1 truncate">' + name + '</span>' +
                    '<div class="w-24 h-1.5 bg-yellow-400 text-black border-black rounded-full overflow-hidden"><div class="h-full rounded-full ' + (isPos ? 'bg-orange-400' : 'bg-red-500') + '" style="width:' + Math.min(Math.abs(parseFloat(mpm)) * 15, 100) + '%"></div></div>' +
                    '<span class="text-xs ' + (isPos ? 'text-orange-400' : 'text-red-400') + ' w-20 text-right">' + mpm + ' m/min</span>';
                mpmEl.appendChild(row);
            });
        }
    }
}

function _lrdFillScoreProgress(s) {
    const { scorePerQ, hasNeg, maxScore } = s;
    const el = id => document.getElementById(id);

    const activeIndices = practiceState.activeIndices || [];
    if (activeIndices.length === 0) return;

    // Detailed question data tracking
    const qDetails = [];
    const scoreByQ = [0];
    const scoreByTime = [{ x: 0, y: 0 }];
    let cumScore = 0;
    let cumTime = 0;
    let grossScore = 0;
    let penaltyLoss = 0;
    let peakScore = 0;
    let peakIndex = 0;
    let peakTime = 0;

    const subjectsSet = new Set();

    activeIndices.forEach((ri, i) => {
        const stat = practiceState.stats[ri] || {};
        const subj = stat.exercise || 'Overall';
        subjectsSet.add(subj);

        const timeSpent = stat.timeSpent || 0;
        let delta = 0;
        let status = 'unanswered';

        if (stat.evaluation === 'correct') {
            delta = scorePerQ;
            grossScore += scorePerQ;
            status = 'correct';
        } else if (stat.evaluation === 'incorrect' && hasNeg) {
            delta = -1;
            penaltyLoss += 1;
            status = 'incorrect';
        } else if (stat.evaluation === 'incorrect') {
            status = 'incorrect';
        }

        cumScore += delta;
        cumTime += timeSpent;

        if (cumScore >= peakScore) {
            peakScore = cumScore;
            peakIndex = i + 1;
            peakTime = cumTime;
        }

        qDetails.push({
            qNum: i + 1,
            subject: subj,
            status,
            delta,
            timeSpent,
            cumScore,
            cumTime
        });

        scoreByQ.push(cumScore);
        scoreByTime.push({ x: Math.round(cumTime), y: cumScore });
    });

    const netScore = cumScore;
    const efficiencyPct = grossScore > 0 ? Math.max(0, Math.round((netScore / grossScore) * 100)) : 100;
    const penaltyPct = grossScore > 0 ? Math.round((penaltyLoss / grossScore) * 100) : 0;

    // 1. STAT CARDS UPDATES
    if (el('spPeakScoreVal')) el('spPeakScoreVal').textContent = peakScore;
    if (el('spPeakScoreNote')) el('spPeakScoreNote').textContent = `Peak reached at Q${peakIndex || 1} (${Math.floor(peakTime / 60)}m ${peakTime % 60}s)`;

    // Momentum Calculation
    const totalQ = qDetails.length;
    const half = Math.floor(totalQ / 2);
    const firstHalfScore = scoreByQ[half] || 0;
    const secondHalfScore = cumScore - firstHalfScore;
    let momentumText = "⚡ Steady Pace";
    let momentumNote = "Balanced performance across both halves";
    let momentumColor = "#00E5FF";

    if (totalQ >= 4) {
        if (secondHalfScore > firstHalfScore + 2) {
            momentumText = "🚀 Strong Finish";
            momentumNote = `Second half score (+${secondHalfScore}) outpaced first half (+${firstHalfScore})`;
            momentumColor = "#10B981";
        } else if (secondHalfScore < firstHalfScore - 2) {
            momentumText = "⚠️ Fatigue Dip";
            momentumNote = `Second half (+${secondHalfScore}) dipped vs first half (+${firstHalfScore})`;
            momentumColor = "#F43F5E";
        }
    }

    if (el('spMomentumVal')) {
        el('spMomentumVal').textContent = momentumText;
        el('spMomentumVal').style.color = momentumColor;
    }
    if (el('spMomentumNote')) el('spMomentumNote').textContent = momentumNote;

    if (el('spPenaltyDragVal')) el('spPenaltyDragVal').textContent = penaltyLoss > 0 ? `-${penaltyLoss} pts` : `0 pts`;
    if (el('spPenaltyDragNote')) el('spPenaltyDragNote').textContent = penaltyLoss > 0 ? `${penaltyPct}% of gross marks negated by wrong answers` : `0 negative marking penalties incurred!`;

    if (el('spEfficiencyVal')) el('spEfficiencyVal').textContent = `${efficiencyPct}%`;
    if (el('spEfficiencyNote')) el('spEfficiencyNote').textContent = `${netScore} net score retained from ${grossScore} gross score`;

    // 2. GROSS VS NET ANALYSIS BARS
    if (el('spGrossScoreText')) el('spGrossScoreText').textContent = `+${grossScore} pts`;
    if (el('spPenaltyText')) el('spPenaltyText').textContent = `-${penaltyLoss} pts`;
    if (el('spNetScoreText')) el('spNetScoreText').textContent = `${netScore} pts`;

    if (el('spGrossBar')) el('spGrossBar').style.width = `100%`;
    if (el('spPenaltyBar')) el('spPenaltyBar').style.width = `${grossScore > 0 ? Math.min(100, Math.round((penaltyLoss / grossScore) * 100)) : 0}%`;
    if (el('spNetBar')) el('spNetBar').style.width = `${grossScore > 0 ? Math.max(0, Math.round((netScore / grossScore) * 100)) : 0}%`;

    if (el('spPenaltyTip')) {
        if (penaltyLoss === 0) {
            el('spPenaltyTip').innerHTML = `🌟 <b>Flawless Accuracy!</b> Zero penalty points lost to incorrect attempts.`;
        } else if (penaltyLoss >= 5) {
            el('spPenaltyTip').innerHTML = `⚠️ <b>High Negative Marking Drag:</b> You lost <b>${penaltyLoss} marks</b> to uncalculated guesses. Skipping high-risk questions would boost your final rank.`;
        } else {
            el('spPenaltyTip').innerHTML = `💡 <b>Minor Penalty Impact:</b> Only ${penaltyLoss} marks lost to wrong answers. Keep refining option elimination!`;
        }
    }

    // 3. STRATEGIC TAKEAWAYS
    const strategyList = el('spStrategyList');
    if (strategyList) {
        strategyList.innerHTML = '';
        const tips = [];

        if (peakScore > cumScore) {
            const drop = peakScore - cumScore;
            tips.push({
                icon: '📉',
                title: 'Peak Score Safeguard',
                desc: `Your peak score was <b>+${peakScore}</b> at Q${peakIndex}, but dipped by <b>-${drop} pts</b> in later questions. Stop guessing when tired.`
            });
        } else {
            tips.push({
                icon: '🎯',
                title: 'Monotonic Peak Retention',
                desc: `You ended at your highest peak score (<b>+${cumScore} pts</b>). Excellent test discipline and decision-making.`
            });
        }

        if (momentumText.includes('Fatigue')) {
            tips.push({
                icon: '⏳',
                title: 'Pacing & Endurance',
                desc: `Performance slowed down in the second half of the exam. Practice 3-hour mock sessions to build stamina.`
            });
        } else if (momentumText.includes('Strong')) {
            tips.push({
                icon: '🔥',
                title: 'High End-Game Focus',
                desc: `Your accuracy accelerated in the latter half of the test. Great focus and exam composure.`
            });
        }

        // Subject specific insight
        const subjStats = {};
        qDetails.forEach(q => {
            if (!subjStats[q.subject]) subjStats[q.subject] = { correct: 0, total: 0, delta: 0 };
            subjStats[q.subject].total++;
            if (q.status === 'correct') subjStats[q.subject].correct++;
            subjStats[q.subject].delta += q.delta;
        });

        let bestSubj = null;
        let maxDelta = -999;
        Object.entries(subjStats).forEach(([sName, sData]) => {
            if (sData.delta > maxDelta) {
                maxDelta = sData.delta;
                bestSubj = sName;
            }
        });

        if (bestSubj && maxDelta > 0) {
            tips.push({
                icon: '🏆',
                title: 'Top Subject Driver',
                desc: `<b>${bestSubj}</b> was your strongest score driver, generating <b>+${maxDelta} marks</b> for your curve.`
            });
        }

        tips.forEach(t => {
            const div = document.createElement('div');
            div.className = 'p-2 bg-gray-800/60 border border-gray-700/60 flex items-start gap-2';
            div.innerHTML = `<span class="text-sm shrink-0">${t.icon}</span><div><div class="font-bold">${t.title}</div><div class="opacity-80">${t.desc}</div></div>`;
            strategyList.appendChild(div);
        });
    }

    // 4. QUESTION MICRO-FLOW TAPE
    const qTape = el('spQuestionTape');
    if (qTape) {
        qTape.innerHTML = '';
        qDetails.forEach(q => {
            const tile = document.createElement('div');
            let bg = 'bg-gray-700 text-gray-300 border-gray-600';
            let symbol = '0';
            if (q.status === 'correct') {
                bg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30';
                symbol = `+${scorePerQ}`;
            } else if (q.status === 'incorrect') {
                bg = 'bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30';
                symbol = hasNeg ? '-1' : '0';
            } else {
                bg = 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700';
            }

            tile.className = `shrink-0 px-2 py-1.5 border brutal-card text-center cursor-pointer transition-all hover:scale-105 ${bg}`;
            tile.title = `Q${q.qNum} (${q.subject})\nStatus: ${q.status.toUpperCase()}\nDelta: ${q.delta >= 0 ? '+' : ''}${q.delta} pts\nRunning Score: ${q.cumScore} pts\nTime: ${q.timeSpent}s`;
            tile.innerHTML = `
                <div class="text-[9px] opacity-75 font-mono">Q${q.qNum}</div>
                <div class="text-xs font-black">${symbol}</div>
            `;
            qTape.appendChild(tile);
        });
    }

    // 5. SUBJECT FILTER PILLS SETUP
    const pillsContainer = el('spSubjectPills');
    let currentFilteredSubject = 'ALL';

    if (pillsContainer) {
        pillsContainer.innerHTML = '';
        const subjects = ['ALL', ...Array.from(subjectsSet)];
        
        subjects.forEach(subj => {
            const btn = document.createElement('button');
            const isActive = subj === 'ALL';
            btn.className = `sp-subj-pill px-2.5 py-1 text-[11px] font-black uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000] transition-all cursor-pointer ${isActive ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`;
            btn.textContent = subj;
            btn.addEventListener('click', () => {
                currentFilteredSubject = subj;
                document.querySelectorAll('.sp-subj-pill').forEach(p => {
                    p.className = 'sp-subj-pill px-2.5 py-1 text-[11px] font-black uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000] transition-all cursor-pointer bg-gray-800 text-gray-300 hover:bg-gray-700';
                });
                btn.className = 'sp-subj-pill px-2.5 py-1 text-[11px] font-black uppercase border border-black shadow-[1.5px_1.5px_0px_0px_#000] transition-all cursor-pointer bg-cyan-400 text-black';
                
                if (el('spActiveSubjectTag')) el('spActiveSubjectTag').textContent = subj === 'ALL' ? 'All Subjects' : subj;
                renderCharts(subj);
            });
            pillsContainer.appendChild(btn);
        });
    }

    // 6. TAB SWITCHING LOGIC (BY QUESTION vs BY TIME)
    const tabByQ = el('spTabByQ');
    const tabByT = el('spTabByT');
    const containerQ = el('spChartContainerQ');
    const containerT = el('spChartContainerT');

    if (tabByQ && tabByT) {
        tabByQ.onclick = () => {
            tabByQ.className = 'sp-view-tab active brutal-card px-3.5 py-1.5 text-xs font-black uppercase bg-cyan-400 text-black border-2 border-black transition-all cursor-pointer';
            tabByT.className = 'sp-view-tab brutal-card px-3.5 py-1.5 text-xs font-black uppercase bg-gray-700 text-white border-2 border-black transition-all cursor-pointer opacity-70 hover:opacity-100';
            if (containerQ) containerQ.classList.remove('hidden');
            if (containerT) containerT.classList.add('hidden');
        };
        tabByT.onclick = () => {
            tabByT.className = 'sp-view-tab active brutal-card px-3.5 py-1.5 text-xs font-black uppercase bg-cyan-400 text-black border-2 border-black transition-all cursor-pointer';
            tabByQ.className = 'sp-view-tab brutal-card px-3.5 py-1.5 text-xs font-black uppercase bg-gray-700 text-white border-2 border-black transition-all cursor-pointer opacity-70 hover:opacity-100';
            if (containerT) containerT.classList.remove('hidden');
            if (containerQ) containerQ.classList.add('hidden');
        };
    }

    // 7. CHART RENDERING FUNCTION
    function renderCharts(subjFilter = 'ALL') {
        if (typeof Chart === 'undefined') return;

        let filteredByQ = [0];
        let filteredByTime = [{ x: 0, y: 0 }];
        let fScore = 0;
        let fTime = 0;

        qDetails.forEach(q => {
            if (subjFilter === 'ALL' || q.subject === subjFilter) {
                fScore += q.delta;
                fTime += q.timeSpent;
                filteredByQ.push(fScore);
                filteredByTime.push({ x: Math.round(fTime), y: fScore });
            } else {
                filteredByQ.push(fScore);
                filteredByTime.push({ x: Math.round(fTime), y: fScore });
            }
        });

        const minVal = Math.min(0, ...filteredByQ) - 2;
        const maxVal = Math.max(maxScore || 10, ...filteredByQ) + 5;

        // Custom Gradient
        const ctxQ = el('lrdScoreCurveQ');
        if (ctxQ) {
            if (_lrdChartScoreQ) { _lrdChartScoreQ.destroy(); _lrdChartScoreQ = null; }
            const canvasCtx = ctxQ.getContext('2d');
            const gradient = canvasCtx.createLinearGradient(0, 0, 0, 260);
            gradient.addColorStop(0, 'rgba(0, 229, 255, 0.35)');
            gradient.addColorStop(1, 'rgba(0, 229, 255, 0.01)');

            _lrdChartScoreQ = new Chart(ctxQ, {
                type: 'line',
                data: {
                    labels: filteredByQ.map((_, i) => i === 0 ? 'Start' : `Q${i}`),
                    datasets: [{
                        label: 'Cumulative Score',
                        data: filteredByQ,
                        borderColor: '#00E5FF',
                        borderWidth: 2.5,
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.2,
                        pointRadius: 2,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#00E5FF',
                        pointBorderColor: '#000000',
                        pointBorderWidth: 1.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#0F172A',
                            titleColor: '#00E5FF',
                            bodyColor: '#FFFFFF',
                            borderColor: '#334155',
                            borderWidth: 1,
                            padding: 10,
                            displayColors: false,
                            callbacks: {
                                title: (items) => {
                                    const idx = items[0].dataIndex;
                                    if (idx === 0) return 'Start of Test';
                                    const q = qDetails[idx - 1];
                                    return `Question ${idx} (${q ? q.subject : 'Item'})`;
                                },
                                label: (item) => {
                                    const idx = item.dataIndex;
                                    if (idx === 0) return 'Score: 0 pts';
                                    const q = qDetails[idx - 1];
                                    const statusStr = q.status.toUpperCase();
                                    const deltaStr = q.delta >= 0 ? `+${q.delta}` : `${q.delta}`;
                                    return [
                                        `Status: ${statusStr} (${deltaStr} pts)`,
                                        `Cumulative Total: ${item.formattedValue} pts`,
                                        `Time Spent: ${q.timeSpent}s`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#94A3B8', maxTicksLimit: 12, font: { size: 10, weight: 'bold' } },
                            grid: { color: 'rgba(51, 65, 85, 0.4)' }
                        },
                        y: {
                            ticks: { color: '#94A3B8', font: { size: 10, weight: 'bold' } },
                            grid: { color: (ctx) => ctx.tick.value === 0 ? '#EF4444' : 'rgba(51, 65, 85, 0.4)', lineWidth: (ctx) => ctx.tick.value === 0 ? 1.5 : 1 },
                            suggestedMin: minVal,
                            suggestedMax: maxVal
                        }
                    }
                }
            });
        }

        const ctxT = el('lrdScoreCurveT');
        if (ctxT) {
            if (_lrdChartScoreT) { _lrdChartScoreT.destroy(); _lrdChartScoreT = null; }
            const canvasCtx = ctxT.getContext('2d');
            const gradient = canvasCtx.createLinearGradient(0, 0, 0, 260);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

            _lrdChartScoreT = new Chart(ctxT, {
                type: 'line',
                data: {
                    labels: filteredByTime.map(d => d.x === 0 ? 'Start' : `${Math.floor(d.x / 60)}m ${d.x % 60}s`),
                    datasets: [{
                        label: 'Cumulative Score',
                        data: filteredByTime.map(d => d.y),
                        borderColor: '#10B981',
                        borderWidth: 2.5,
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.2,
                        pointRadius: 2,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#10B981',
                        pointBorderColor: '#000000',
                        pointBorderWidth: 1.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#0F172A',
                            titleColor: '#10B981',
                            bodyColor: '#FFFFFF',
                            borderColor: '#334155',
                            borderWidth: 1,
                            padding: 10,
                            displayColors: false,
                            callbacks: {
                                title: (items) => `Time: ${items[0].label}`,
                                label: (item) => `Cumulative Total: ${item.formattedValue} pts`
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#94A3B8', maxTicksLimit: 12, font: { size: 10, weight: 'bold' } },
                            grid: { color: 'rgba(51, 65, 85, 0.4)' }
                        },
                        y: {
                            ticks: { color: '#94A3B8', font: { size: 10, weight: 'bold' } },
                            grid: { color: (ctx) => ctx.tick.value === 0 ? '#EF4444' : 'rgba(51, 65, 85, 0.4)', lineWidth: (ctx) => ctx.tick.value === 0 ? 1.5 : 1 },
                            suggestedMin: minVal,
                            suggestedMax: maxVal
                        }
                    }
                }
            });
        }
    }

    renderCharts('ALL');
}

function _lrdFillLeaderboard() {
    const el = id => document.getElementById(id);
    const inLive = typeof isLiveMode !== 'undefined' && isLiveMode;

    if (!inLive) {
        if (el('lrdLbWaiting')) el('lrdLbWaiting').classList.add('hidden');
        if (el('lrdLbSolo')) el('lrdLbSolo').classList.remove('hidden');
        if (el('lrdLbRankings')) el('lrdLbRankings').classList.add('hidden');
        return;
    }
    // In live mode — show waiting, will update when all submit
    if (el('lrdLbWaiting')) el('lrdLbWaiting').classList.remove('hidden');
    if (el('lrdLbSolo')) el('lrdLbSolo').classList.add('hidden');
    if (el('lrdLbRankings')) el('lrdLbRankings').classList.add('hidden');
    _lrdUpdateLeaderboard();
}

// Called by liveRoom.js when all scores are in
function _lrdUpdateLeaderboard(participants) {
    if (participants) window.liveRoomParticipants = participants;
    const data = window.liveRoomParticipants || [];
    const el = id => document.getElementById(id);

    if (data.length === 0) return;

    const submitted = data.filter(p => p.score !== null && p.score !== undefined).length;
    if (submitted < data.length) {
        if (el('lrdLbWaitMsg')) el('lrdLbWaitMsg').textContent = submitted + ' / ' + data.length + ' have submitted';
        return;
    }

    // All submitted — show rankings
    if (el('lrdLbWaiting')) el('lrdLbWaiting').classList.add('hidden');
    if (el('lrdLbSolo')) el('lrdLbSolo').classList.add('hidden');
    if (el('lrdLbRankings')) el('lrdLbRankings').classList.remove('hidden');
    if (el('lrdLbTotal')) el('lrdLbTotal').textContent = data.length + ' total';

    const myId = (typeof isHost !== 'undefined' && isHost) ? 'host' : (window.myLivePeerId || '');

    // Podium (top 3)
    const podium = el('lrdLbPodium');
    if (podium) {
        podium.innerHTML = '';
        const top3 = data.slice(0, 3);
        const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3.length === 2 ? [top3[1], top3[0]] : top3;
        const podiumHeights = [96, 128, 64];
        const podiumColors = ['bg-gray-500', 'bg-yellow-500', 'bg-amber-700'];
        const medals = ['🥇', '🥈', '🥉'];
        const idx = top3.length >= 3 ? [1, 0, 2] : top3.length === 2 ? [1, 0] : [0];
        podiumOrder.forEach((p, i) => {
            if (!p) return;
            const realRank = p.rank || (i + 1);
            const h = realRank === 1 ? 128 : realRank === 2 ? 96 : 64;
            const col = realRank === 1 ? '#eab308' : realRank === 2 ? '#6b7280' : '#92400e';
            const d = document.createElement('div');
            d.className = 'flex flex-col items-center';
            d.innerHTML = '<div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-1" style="background:' + col + '">' + p.name.charAt(0).toUpperCase() + '</div>' +
                '<div class="text-xs font-semibold mb-0.5 max-w-[80px] truncate text-center">' + p.name + '</div>' +
                '<div class="text-sm font-bold mb-1" style="color:' + col + '">' + (p.score !== null ? p.score : '—') + '</div>' +
                '<div class="w-16 rounded-t flex items-start justify-center pt-1 font-black text-base" style="height:' + h + 'px; background:' + col + '">' + medals[realRank - 1] + '</div>';
            podium.appendChild(d);
        });
    }

    // My rank card
    const me = data.find(p => p.id === myId);
    const myRankEl = el('lrdLbMyRank');
    if (myRankEl && me) {
        const total = data.length;
        const pct = total > 1 ? Math.round((total - me.rank) / (total - 1) * 100) : 100;
        myRankEl.innerHTML = '<div class="bg-blue-900/30 rounded-none p-4 flex items-center gap-4 mb-4">' +
            '<div class="w-10 h-10 bg-blue-600 rounded-none flex items-center justify-center font-bold shrink-0">#' + me.rank + '</div>' +
            '<div class="flex-1"><div class="font-semibold text-sm">Your Test Percentile</div>' +
            '<div class="text-blue-400 font-bold">' + pct + '%ile <span class="font-normal">— better than ' + pct + '% of participants</span></div></div>' +
            '<div class="text-right rounded-none px-3 py-2"><div class="text-xl font-black">' + (me.score !== null ? me.score : '—') + '</div>' +
            '<div class="text-[10px]">points</div></div></div>';

        // Also update overview percentile card
        const pCard = document.getElementById('lrdPercentileCard');
        if (pCard) {
            const pctEl = document.getElementById('lrdPercentile');
            const rankEl = document.getElementById('lrdRankText');
            if (pctEl) pctEl.textContent = pct + '%ile';
            if (rankEl) rankEl.textContent = 'Rank #' + me.rank;
            pCard.classList.remove('hidden');
        }
    }

    // Full list
    const list = el('lrdLbList');
    if (list) {
        list.innerHTML = data.map((p) => {
            const isMe = p.id === myId;
            const medal = p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : '#' + p.rank;
            return '<div class="flex items-center gap-3 px-4 py-3 ' + (isMe ? 'bg-blue-900/20 -l-2 ' : 'hover:bg-white/5') + '">' +
                '<span class="text-sm w-8 text-center font-bold ' + (p.rank <= 3 ? '' : '') + '">' + medal + '</span>' +
                '<div class="w-8 h-8 rounded-full bg-yellow-400 text-black border-black flex items-center justify-center text-xs font-bold shrink-0">' + p.name.charAt(0).toUpperCase() + '</div>' +
                '<div class="flex-1 min-w-0"><div class="text-sm font-semibold truncate">' + p.name + (isMe ? ' <span class="text-xs text-blue-400 font-normal">(You)</span>' : '') + (p.id === 'host' ? ' <span class="text-xs text-yellow-400 font-normal">(Host)</span>' : '') + '</div></div>' +
                '<div class="text-xs">' + (p.accuracy !== null && p.accuracy !== undefined ? (typeof p.accuracy === 'number' ? p.accuracy.toFixed(1) : p.accuracy) + '%' : '—') + '</div>' +
                '<div class="text-sm font-bold ml-2">' + (p.score !== null && p.score !== undefined ? p.score : '—') + '</div></div>';
        }).join('');
    }
}
window._lrdUpdateLeaderboard = _lrdUpdateLeaderboard;
// Dashboard Review Exam Panel Wiring
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lrd-reattempt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.getAttribute('data-type');
            document.getElementById('liveResultsDashboard').classList.add('hidden');
            reattemptPractice(type);
        });
    });
    const btnAll = document.getElementById('lrdViewAllQsBtn');
    if (btnAll) btnAll.addEventListener('click', () => {
        document.getElementById('liveResultsDashboard').classList.add('hidden');
        reattemptPractice('all');
    });
    const btnMarked = document.getElementById('lrdMarkedQsBtn');
    if (btnMarked) btnMarked.addEventListener('click', () => {
        document.getElementById('liveResultsDashboard').classList.add('hidden');
        reattemptPractice('marked');
    });
    const btnHome = document.getElementById('lrdReturnHome');
    if (btnHome) btnHome.addEventListener('click', () => {
        document.getElementById('liveResultsDashboard').classList.add('hidden');
        location.reload();
    });
});


// ---- DASHBOARD NAVIGATION & RESPONSIVE SIDEBAR LOGIC ----
document.addEventListener('DOMContentLoaded', () => {
    const dashNavBtns = document.querySelectorAll('.dash-nav-btn');
    const dashViews = document.querySelectorAll('.dash-view');
    const landingSidebar = document.getElementById('landingSidebar');
    const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
    const mobileSidebarToggleBtn = document.getElementById('mobileSidebarToggleBtn');
    const mobileSidebarCloseBtn = document.getElementById('mobileSidebarCloseBtn');
    const mobileSidebarBackdrop = document.getElementById('mobileSidebarBackdrop');

    // Desktop Collapse Toggle with LocalStorage persistence
    if (localStorage.getItem('sidebarCollapsed') === 'true' && landingSidebar) {
        landingSidebar.classList.add('collapsed');
    }

    if (sidebarCollapseBtn && landingSidebar) {
        sidebarCollapseBtn.addEventListener('click', () => {
            landingSidebar.classList.toggle('collapsed');
            const isCollapsed = landingSidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed ? 'true' : 'false');
        });
    }

    // Mobile Sidebar Drawer Controls
    function openMobileSidebar() {
        if (!landingSidebar) return;
        landingSidebar.classList.add('mobile-open');
        if (mobileSidebarBackdrop) mobileSidebarBackdrop.classList.remove('hidden');
    }

    function closeMobileSidebar() {
        if (!landingSidebar) return;
        landingSidebar.classList.remove('mobile-open');
        if (mobileSidebarBackdrop) mobileSidebarBackdrop.classList.add('hidden');
    }

    if (mobileSidebarToggleBtn) mobileSidebarToggleBtn.addEventListener('click', openMobileSidebar);
    if (mobileSidebarCloseBtn) mobileSidebarCloseBtn.addEventListener('click', closeMobileSidebar);
    if (mobileSidebarBackdrop) mobileSidebarBackdrop.addEventListener('click', closeMobileSidebar);
    
    window.switchDashView = function(targetView) {
        dashViews.forEach(v => v.classList.add('hidden'));
        document.querySelectorAll('.' + targetView).forEach(v => v.classList.remove('hidden'));
        
        dashNavBtns.forEach(btn => {
            if (btn.dataset.target === targetView) {
                btn.classList.add('sidebar-active');
            } else {
                btn.classList.remove('sidebar-active');
            }
        });
        
        closeMobileSidebar();
        if (targetView === 'analysisView') renderScoreAnalysis();
        if (targetView === 'combineView') {
            if (typeof loadCombineTestsPage === 'function') loadCombineTestsPage();
        }
    };
    
    dashNavBtns.forEach(btn => {
        btn.addEventListener('click', () => switchDashView(btn.dataset.target));
    });
    
    async function renderScoreAnalysis() {
        const saStatsTestsTaken = document.getElementById('saStatsTestsTaken');
        const saStatsAvgAcc = document.getElementById('saStatsAvgAcc');
        const saStatsQsPracticed = document.getElementById('saStatsQsPracticed');
        const saHistoricalList = document.getElementById('saHistoricalList');
        
        let sessions = [];
        try {
            sessions = await getAllSessionsFromDB();
        } catch (e) {
            console.error('Error fetching sessions for analysis:', e);
        }

        if (!sessions || sessions.length === 0) {
            if (saStatsTestsTaken) saStatsTestsTaken.textContent = '0';
            if (saStatsAvgAcc) saStatsAvgAcc.textContent = '0%';
            if (saStatsQsPracticed) saStatsQsPracticed.textContent = '0';
            if (saHistoricalList) {
                saHistoricalList.innerHTML = '<div class="text-center py-8">No tests recorded yet. Start practicing!</div>';
            }
            return;
        }

        let totalAttempted = 0;
        let totalCorrect = 0;
        let chartDates = [];
        let chartScores = [];

        sessions.forEach(s => {
            const attempted = (s.correctCount || 0) + (s.incorrectCount || 0);
            const total = attempted + (s.unansweredCount || 0);
            const scorePerQ = s.practiceState?.scorePerQ || 4;
            const hasNeg = s.practiceState?.negativeMarking !== false;
            const penalty = hasNeg ? (s.incorrectCount || 0) : 0;
            const score = ((s.correctCount || 0) * scorePerQ) - penalty;
            const maxScore = total * scorePerQ;

            totalAttempted += attempted;
            totalCorrect += (s.correctCount || 0);
            
            const scorePct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
            
            chartDates.push(s.date || `Test #${s.id}`);
            chartScores.push(scorePct);
        });

        if (saStatsTestsTaken) saStatsTestsTaken.textContent = sessions.length;
        if (saStatsQsPracticed) saStatsQsPracticed.textContent = totalAttempted;
        const avgAcc = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
        if (saStatsAvgAcc) saStatsAvgAcc.textContent = avgAcc + '%';

        // Chart.js rendering
        const ctxEl = document.getElementById('saScoreTrajectoryChart');
        if (ctxEl && typeof Chart !== 'undefined') {
            const ctx = ctxEl.getContext('2d');
            if (window._saScoreTrajectoryChartInstance) {
                window._saScoreTrajectoryChartInstance.destroy();
            }
            
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)'); // blue-500 with opacity
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            
            window._saScoreTrajectoryChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartDates,
                    datasets: [{
                        label: 'Score %',
                        data: chartScores,
                        Color: '#3B82F6',
                        backgroundColor: gradient,
                        Width: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#1E3A8A',
                        pointBorderColor: '#3B82F6',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: {
                            grid: { display: false, drawBorder: false },
                            ticks: { color: document.documentElement.classList.contains('dark') ? '#a0a0a0' : '#555555', font: { size: 10 }, maxTicksLimit: 6 }
                        },
                        y: {
                            display: false,
                            min: 0,
                            max: 100
                        }
                    }
                }
            });
        }

        // Populate test selector dropdown for percentile predictor
        const testSelector = document.getElementById('saPageTestSelector');
        const sessionPctMap = {};
        let totalOverallScore = 0;
        let totalOverallMax = 0;

        sessions.forEach(s => {
            const attempted = (s.correctCount || 0) + (s.incorrectCount || 0);
            const total = attempted + (s.unansweredCount || 0);
            const scorePerQ = s.practiceState?.scorePerQ || 4;
            const hasNeg = s.practiceState?.negativeMarking !== false;
            const penalty = hasNeg ? (s.incorrectCount || 0) : 0;
            const score = ((s.correctCount || 0) * scorePerQ) - penalty;
            const maxScore = total * scorePerQ;
            const scorePct = maxScore > 0 ? (score / maxScore) * 100 : 0;

            sessionPctMap[s.id] = scorePct;
            totalOverallScore += score;
            totalOverallMax += maxScore;
        });

        const overallAvgPct = totalOverallMax > 0 ? (totalOverallScore / totalOverallMax) * 100 : (chartScores.length > 0 ? chartScores.reduce((a,b)=>a+b,0)/chartScores.length : 0);
        sessionPctMap['all'] = overallAvgPct;

        if (testSelector) {
            testSelector.innerHTML = `<option value="all">📊 All Tests Average (Overall - ${overallAvgPct.toFixed(1)}%)</option>` +
                [...sessions].reverse().map(s => {
                    const dateStr = s.date ? s.date.split(',')[0] : '';
                    const rawTitle = s.title || `Mock Test Session #${s.id}`;
                    const pct = sessionPctMap[s.id] !== undefined ? sessionPctMap[s.id].toFixed(1) : '0.0';
                    return `<option value="${s.id}">${rawTitle} ${dateStr ? '(' + dateStr + ')' : ''} — ${pct}%</option>`;
                }).join('');

            testSelector.onchange = function() {
                const val = testSelector.value;
                const pct = sessionPctMap[val] !== undefined ? sessionPctMap[val] : overallAvgPct;
                _updateSaPagePredictorUI(pct);
            };
        }

        _updateSaPagePredictorUI(overallAvgPct);

        // List rendering
        if (saHistoricalList) {
            
            function createGauge(val, max, color, bgColor, size, stroke, innerText, label) {
                const radius = (size - stroke) / 2;
                const circumference = Math.PI * radius; 
                let fraction = max > 0 ? (val / max) : 0;
                if (fraction > 1) fraction = 1;
                if (fraction < 0) fraction = 0;
                const dashoffset = circumference - (fraction * circumference);
                return `
                <div class="flex flex-col items-center">
                    <div class="relative flex flex-col items-center justify-end" style="width: ${size}px; height: ${size/2 + stroke/2}px;">
                        <svg width="${size}" height="${size/2 + stroke/2}" viewBox="0 0 ${size} ${size/2 + stroke/2}" class="absolute top-0 left-0 overflow-visible">
                            <path d="M ${stroke/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - stroke/2} ${size/2}" fill="none" stroke="${bgColor}" stroke-width="${stroke}" stroke-linecap="round"/>
                            <path d="M ${stroke/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - stroke/2} ${size/2}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}" stroke-linecap="round" class="transition-all duration-1000 ease-out"/>
                        </svg>
                        <div class="absolute bottom-1 w-full text-center leading-none flex flex-col items-center justify-end h-full">
                            ${innerText}
                        </div>
                    </div>
                    <div class="text-[11px] dark: mt-1 font-medium">${label}</div>
                </div>
                `;
            }

            saHistoricalList.innerHTML = '';
            
            let filteredSessions = sessions;

            if (filteredSessions.length === 0) {
                saHistoricalList.innerHTML = '<div class="text-center py-8">No tests recorded yet. Start practicing!</div>';
            }

            const reversedSessions = [...filteredSessions].reverse();

            reversedSessions.forEach(s => {
                const item = document.createElement('div');
                item.className = 'brutal-card hover:bg-yellow-50 dark:hover:bg-[#3d3d2a] transition-all p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between relative group mb-3.5 gap-3 overflow-hidden';
                
                let rawTitle = s.title || `Mock Test Session #${s.id}`;
                let formattedTitle = rawTitle;
                if (rawTitle.includes('#')) {
                    const parts = rawTitle.split('#');
                    formattedTitle = `${parts[0]}<span class="text-blue-400 font-extrabold">#${parts[1]}</span>`;
                }
                
                const dateStr = s.date ? s.date.split(',')[0] : 'Unknown';
                
                item.innerHTML = `
                    <div class="flex-1 min-w-0 w-full sm:w-auto">
                        <h4 class="text-sm sm:text-base font-bold truncate tracking-tight">${formattedTitle}</h4>
                        <p class="text-xs mt-0.5 sm:mt-1 font-medium">Created: ${dateStr}</p>
                    </div>
                    
                    <div class="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/10 dark:border-white/10">
                        <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <!-- Rename: yellow -->
                            <button class="brutal-btn rename-session-btn btn-action-rename p-1.5 sm:p-2 transition-all" style="background-color: #FFE600 !important; color: #000000 !important;" data-id="${s.id}" title="Rename Test">
                                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="#000000" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <!-- Delete: red -->
                            <button class="brutal-btn delete-session-btn btn-action-delete p-1.5 sm:p-2 transition-all" style="background-color: #FF4D4D !important; color: #ffffff !important;" data-id="${s.id}" title="Delete Test">
                                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="#ffffff" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                            <!-- View Analysis: green -->
                            <button class="brutal-btn view-session-btn btn-action-analysis p-1.5 sm:p-2 transition-all" style="background-color: #00E5FF !important; color: #000000 !important;" data-id="${s.id}" title="View Analysis">
                                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="#000000" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            </button>
                            <!-- Share: blue -->
                            <button class="brutal-btn share-session-btn btn-action-share p-1.5 sm:p-2 transition-all" style="background-color: #3B82F6 !important; color: #ffffff !important;" data-id="${s.id}" title="Share Test">
                                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="#ffffff" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                            </button>
                            <!-- Host: purple -->
                            <button class="brutal-btn share-session-btn btn-action-host p-1.5 sm:p-2 transition-all" style="background-color: #A855F7 !important; color: #ffffff !important;" data-id="${s.id}" title="Host Live Test">
                                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="#ffffff" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
                            </button>
                        </div>
                        
                        <button class="brutal-btn take-test-modal-btn btn-action-taketest text-xs font-black uppercase py-2 px-3 sm:py-2.5 sm:px-4 flex items-center gap-1.5 transition-all shrink-0" style="background-color: #FFE600 !important; color: #000000 !important;" data-id="${s.id}" data-type="all">
                            <svg class="w-3.5 h-3.5" fill="#000000" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                            <span style="color: #000000 !important;">Take Test</span>
                        </button>
                    </div>
                `;
                saHistoricalList.appendChild(item);
            });

            document.querySelectorAll('#saHistoricalList .share-session-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const rawId = btn.getAttribute('data-id');
                    const id = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
                    const session = await getSessionFromDB(id);
                    if (session && typeof startLiveRoomFromSession === 'function') {
                        session.isHosted = true;
                        session.isCommunity = true;
                        await saveSessionToDB(session);
                        startLiveRoomFromSession(session);
                    } else {
                        alert('Unable to share this session.');
                    }
                });
            });

            document.querySelectorAll('#saHistoricalList .view-session-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const rawId = btn.getAttribute('data-id');
                    const id = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
                    const session = await getSessionFromDB(id);
                    if (session) {
                        loadSessionAndShowSummary(session);
                    }
                });
            });

            document.querySelectorAll('#saHistoricalList .take-test-modal-btn, #saHistoricalList .history-reattempt-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rawId = btn.getAttribute('data-id');
                    const filterType = btn.getAttribute('data-type') || 'all';
                    openInstructionsModalForSession(rawId, filterType);
                });
            });

            document.querySelectorAll('#saHistoricalList .rename-session-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const rawId = btn.getAttribute('data-id');
                    const session = await getSessionFromDB(rawId) || await getSessionFromDB(parseInt(rawId));
                    if (session) {
                        const newName = prompt("Enter new test name:", session.title || `Mock Test Session #${session.id}`);
                        if (newName !== null && newName.trim() !== "") {
                            session.title = newName.trim();
                            await saveSessionToDB(session);
                            renderScoreAnalysis();
                        }
                    }
                });
            });

            document.querySelectorAll('#saHistoricalList .history-reattempt-btn_old').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const rawId = btn.getAttribute('data-id');
                    const id = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
                    const filterType = btn.getAttribute('data-type');
                    
                    const session = await getSessionFromDB(id);
                    if (session) {
                        currentSessionId = session.id;
                        practiceState = session.practiceState;
                        extractedImages = session.extractedImages;
                        
                        uploadContainer.classList.add('hidden');
                        document.getElementById('analysisContainer').classList.add('hidden');
                        
                        if (typeof reattemptPractice === 'function') {
                            reattemptPractice(filterType);
                        }
                    }
                });
            });

            document.querySelectorAll('#saHistoricalList .delete-session-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if(confirm("Delete this test session permanently?")) {
                        const rawId = btn.getAttribute('data-id');
                        const id = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
                        await deleteSessionFromDB(id);
                        renderScoreAnalysis();
                    }
                });
            });
            

        }
    }
});

// =============================================================
// VAULT BACKUP & RESTORE (.practice FILES)
// =============================================================

async function backupVault() {
    try {
        const sessions = await getAllSessionsFromDB();
        if (sessions.length === 0) {
            alert("Your vault is empty. Nothing to backup.");
            return;
        }
        
        const backupData = JSON.stringify(sessions);
        const blob = new Blob([backupData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `JeeMock_Vault_${dateStr}.practice`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (e) {
        console.error("Backup failed:", e);
        alert("Failed to backup vault.");
    }
}

async function restoreVault(file) {
    if (!file) return;
    try {
        const text = await file.text();
        const importedSessions = JSON.parse(text);
        
        if (!Array.isArray(importedSessions)) {
            throw new Error("Invalid format");
        }
        
        let importedCount = 0;
        for (const session of importedSessions) {
            if (session.id && session.extractedImages) {
                await saveSessionToDB(session);
                importedCount++;
            }
        }
        
        alert(`Successfully restored ${importedCount} tests into your Vault.`);
        renderHistory();
    } catch (e) {
        console.error("Restore failed:", e);
        alert("Failed to restore vault. Make sure you selected a valid .practice file.");
    }
}

// Bind Vault Buttons
document.addEventListener('DOMContentLoaded', () => {
    const backupBtn = document.getElementById('backupVaultBtn');
    const restoreBtn = document.getElementById('restoreVaultBtn');
    const restoreInput = document.getElementById('restoreVaultInput');
    
    if (backupBtn) {
        backupBtn.addEventListener('click', backupVault);
    }
    
    if (restoreBtn && restoreInput) {
        restoreBtn.addEventListener('click', () => restoreInput.click());
        restoreInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                restoreVault(file);
                restoreInput.value = ""; // reset
            }
        });
    }
});

async function autoExportCurrentTest() {
    try {
        const session = await getSessionFromDB(currentSessionId);
        if (!session) return;
        
        const backupData = JSON.stringify([session]);
        const blob = new Blob([backupData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const title = session.title ? session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'mock_test';
        a.download = `${title}.practice`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Auto export failed:", e);
    }
}


// =============================================================
// EXTERNAL SOURCES & TABS LOGIC
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
    const tabRecentTests = document.getElementById('tabRecentTests');
    const tabExternalSources = document.getElementById('tabExternalSources');
    const recentTestsView = document.getElementById('recentTestsView');
    const externalSourcesView = document.getElementById('externalSourcesView');
    
    const subTabSources = document.getElementById('subTabSources');
    const subTabAddSource = document.getElementById('subTabAddSource');
    const addSourceFormContainer = document.getElementById('addSourceFormContainer');
    const sourcesListContainer = document.getElementById('sourcesListContainer');
    
    const extSourceUrl = document.getElementById('extSourceUrl');
    const extSourceName = document.getElementById('extSourceName');
    const saveExternalSourceBtn = document.getElementById('saveExternalSourceBtn');
    
    if(tabRecentTests && tabExternalSources) {
        tabRecentTests.addEventListener('click', () => {
            tabRecentTests.className = " font-bold text-lg pb-2 -b-2  transition-colors";
            tabExternalSources.className = " hover: font-bold text-lg pb-2 -b-2  hover: transition-colors";
            recentTestsView.classList.remove('hidden');
            externalSourcesView.classList.add('hidden');
        });
        
        tabExternalSources.addEventListener('click', () => {
            tabExternalSources.className = " font-bold text-lg pb-2 -b-2  transition-colors";
            tabRecentTests.className = " hover: font-bold text-lg pb-2 -b-2  hover: transition-colors";
            externalSourcesView.classList.remove('hidden');
            recentTestsView.classList.add('hidden');
            // Default to add source view if none exists, else sources
            const sources = JSON.parse(localStorage.getItem('externalSources') || '[]');
            if(sources.length > 0) {
                subTabSources.click();
            } else {
                subTabAddSource.click();
            }
        });
    }
    
    if(subTabSources && subTabAddSource) {
        subTabSources.addEventListener('click', () => {
            subTabSources.className = " font-semibold text-sm pb-1 -b-2  transition-colors";
            subTabAddSource.className = " hover: font-semibold text-sm pb-1 -b-2  hover: transition-colors";
            sourcesListContainer.classList.remove('hidden');
            addSourceFormContainer.classList.add('hidden');
            renderExternalSources();
        });
        
        subTabAddSource.addEventListener('click', () => {
            subTabAddSource.className = " font-semibold text-sm pb-1 -b-2  transition-colors";
            subTabSources.className = " hover: font-semibold text-sm pb-1 -b-2  hover: transition-colors";
            addSourceFormContainer.classList.remove('hidden');
            sourcesListContainer.classList.add('hidden');
        });
    }
    
    if(saveExternalSourceBtn) {
        saveExternalSourceBtn.addEventListener('click', () => {
            const url = extSourceUrl.value.trim();
            const name = extSourceName.value.trim() || 'Untitled Source';
            if(!url) {
                alert("Please enter a Source URL");
                return;
            }
            
            const sources = JSON.parse(localStorage.getItem('externalSources') || '[]');
            sources.push({ id: Date.now(), url, name, date: new Date().toLocaleDateString() });
            localStorage.setItem('externalSources', JSON.stringify(sources));
            
            extSourceUrl.value = '';
            extSourceName.value = '';
            subTabSources.click(); // Switch to list
        });
    }
});

function renderExternalSources() {
    const list = document.getElementById('externalSourcesList');
    if(!list) return;
    
    const sources = JSON.parse(localStorage.getItem('externalSources') || '[]');
    list.innerHTML = '';
    
    if(sources.length === 0) {
        list.innerHTML = '<div class="text-center py-8">No external sources added yet.</div>';
        return;
    }
    
    sources.forEach(src => {
        const card = document.createElement('div');
        card.className = 'brutal-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-yellow-50 dark:hover:bg-[#3d3d2a] transition-colors';
        card.innerHTML = `
            <div class="flex-1 min-w-0">
                <h4 class="text-base font-bold truncate">${src.name}</h4>
                <p class="text-xs text-blue-400 mt-1 truncate">${src.url}</p>
                <p class="text-[10px] mt-1">Added: ${src.date}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <button class="brutal-btn delete-source-btn p-2 bg-[#1a1e26] hover:bg-red-900/30  hover:text-red-400 hover:-red-900/50 transition-colors" data-id="${src.id}" title="Remove Source">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                <button class="brutal-btn bg-[#28498f] hover:bg-[#3459a8]  text-sm font-bold py-2 px-4 flex items-center gap-2 transition-colors shadow" onclick="alert('Fetching data from external sources will be implemented in future updates!')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    Fetch
                </button>
            </div>
        `;
        list.appendChild(card);
    });
    
    document.querySelectorAll('.delete-source-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if(confirm("Remove this source?")) {
                const id = parseInt(btn.getAttribute('data-id'));
                const sources = JSON.parse(localStorage.getItem('externalSources') || '[]');
                const filtered = sources.filter(s => s.id !== id);
                localStorage.setItem('externalSources', JSON.stringify(filtered));
                renderExternalSources();
            }
        });
    });
}





// =============================================================
// TEST INSTRUCTIONS MODAL LOGIC
// =============================================================

window.pendingSessionToLaunch = null;

async function openInstructionsModalForSession(id, type) {
    try {
        let session = await getSessionFromDB(id);
        if (!session) {
            const numId = parseInt(id);
            if (!isNaN(numId)) session = await getSessionFromDB(numId);
        }
        if (!session) {
            const strId = String(id);
            session = await getSessionFromDB(strId);
        }
        if (!session) {
            const all = await getAllSessionsFromDB();
            session = all.find(s => String(s.id) === String(id));
        }
        
        if (!session || !session.extractedImages || session.extractedImages.length === 0) {
            alert("This test does not contain any valid questions to launch.");
            return;
        }
        
        window.pendingSessionToLaunch = session;
        
        const modal = document.getElementById('testInstructionsModal');
        const titleEl = document.getElementById('instructionsModalTitle');
        const subtitleEl = document.getElementById('instructionsModalSubtitle');
        const titleInputEl = document.getElementById('instructionsModalTitleInput');
        
        const testName = session.title || `Mock Test Session #${session.id}`;
        if (titleEl) titleEl.textContent = testName;
        if (titleInputEl) titleInputEl.value = testName;
        
        if (subtitleEl) {
            const count = session.extractedImages ? session.extractedImages.length : 0;
            subtitleEl.textContent = `${count} Questions • Standard Marking (+4 / -1)`;
        }
        
        if (modal) modal.classList.remove('hidden');
    } catch(e) {
        console.error("Error opening instructions modal:", e);
        alert("Could not load test session.");
    }
}

function initTestInstructionsModal() {
    const modal = document.getElementById('testInstructionsModal');
    const closeBtn = document.getElementById('closeInstructionsModalBtn');
    const cancelBtn = document.getElementById('cancelInstructionsModalBtn');
    const confirmStartBtn = document.getElementById('confirmStartTestBtn');
    
    function hideModal() {
        if(modal) modal.classList.add('hidden');
    }
    
    if(closeBtn) closeBtn.onclick = hideModal;
    if(cancelBtn) cancelBtn.onclick = hideModal;
    
    if(confirmStartBtn) {
        confirmStartBtn.onclick = async () => {
            if (!window.pendingSessionToLaunch) return;
            
            const session = window.pendingSessionToLaunch;
            
            // Check if title was updated in modal input
            const titleInputEl = document.getElementById('instructionsModalTitleInput');
            if (titleInputEl && titleInputEl.value.trim() !== '') {
                session.title = titleInputEl.value.trim();
                window.currentPdfFilename = session.title;
                if (typeof saveSessionToDB === 'function') {
                    await saveSessionToDB(session);
                }
            }
            
            hideModal();
            
            // Set up global session variables
            currentSessionId = Date.now();
            extractedImages = session.extractedImages || [];
            
            if (extractedImages.length === 0) {
                alert("No questions found in this test.");
                return;
            }
            
            // Calculate time
            const mins = (typeof getCalculatedTimeMinutes === 'function') ? getCalculatedTimeMinutes(extractedImages.length) : 60;
            
            // Fresh practiceState for test run
            practiceState = {
                activeIndices: extractedImages.map((_, i) => i),
                currentIndex: 0,
                theme: 'nta',
                totalSecondsRemaining: mins * 60,
                scorePerQ: 4,
                negativeMarking: true,
                stats: extractedImages.map((q, idx) => {
                    let ex = 'Exercise 1';
                    if (q.label && q.label.includes(' - ')) ex = q.label.split(' - ')[0];
                    return {
                        index: idx,
                        timeSpent: 0,
                        targetTime: 0,
                        attempted: false,
                        evaluation: null,
                        ntaStatus: 'not_visited',
                        exercise: ex
                    };
                })
            };
            
            // Hide dashboard & landing containers
            const uploadContainer = document.getElementById('uploadContainer');
            const historyContainer = document.getElementById('historyContainer');
            const configContainer = document.getElementById('configContainer');
            const practiceSetupContainer = document.getElementById('practiceSetupContainer');
            const analysisContainer = document.getElementById('analysisContainer');
            const liveResultsDashboard = document.getElementById('liveResultsDashboard');
            
            if(uploadContainer) uploadContainer.classList.add('hidden');
            if(historyContainer) historyContainer.classList.add('hidden');
            if(configContainer) configContainer.classList.add('hidden');
            if(practiceSetupContainer) practiceSetupContainer.classList.add('hidden');
            if(analysisContainer) analysisContainer.classList.add('hidden');
            if(liveResultsDashboard) liveResultsDashboard.classList.add('hidden');
            
            // Start the practice session
            if (typeof startPracticeSession === 'function') {
                startPracticeSession(practiceState.activeIndices);
            }
        };
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestInstructionsModal);
} else {
    initTestInstructionsModal();
}



// =============================================================
// COMBINE TESTS LOGIC (PAGE VIEW & INSTANT START)
// =============================================================
async function loadCombineTestsPage() {
    try {
        const sessions = await getAllSessionsFromDB();
        const listContainer = document.getElementById('combineTestsPageList');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        const validSessions = sessions.filter(s => s.extractedImages && s.extractedImages.length > 0);
        
        if (validSessions.length === 0) {
            listContainer.innerHTML = '<div class="text-center py-12 text-sm font-medium">No tests available in your vault to combine. Upload some PDFs first!</div>';
            document.getElementById('combinePageSelectedCount').textContent = '0';
            document.getElementById('combinePageTotalQuestionsCount').textContent = '0';
            return;
        }
        
        validSessions.forEach(session => {
            const label = document.createElement('label');
            label.className = 'combine-item flex items-center gap-4 p-4 rounded-none cursor-pointer transition-colors border-b border-[var(--sidebar-border)]';
            label.innerHTML = `
                <input type="checkbox" class="combine-page-checkbox w-5 h-5 text-emerald-600 brutal-card rounded-none focus:ring-emerald-500 focus:ring-offset-0" data-id="${session.id}" data-qcount="${session.extractedImages.length}">
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold truncate">${session.title || `Test Session #${session.id}`}</p>
                    <p class="text-xs mt-1">${session.extractedImages.length} Questions • Created ${session.date ? session.date.split(',')[0] : 'Unknown'}</p>
                </div>
            `;
            listContainer.appendChild(label);
        });
        
        // Update stats dynamically on check/uncheck
        const checkboxes = document.querySelectorAll('.combine-page-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                let selectedCount = 0;
                let totalQ = 0;
                
                checkboxes.forEach(box => {
                    if (box.checked) {
                        selectedCount++;
                        totalQ += parseInt(box.getAttribute('data-qcount')) || 0;
                    }
                });
                
                document.getElementById('combinePageSelectedCount').textContent = selectedCount;
                document.getElementById('combinePageTotalQuestionsCount').textContent = totalQ;
            });
        });
        
        document.getElementById('combinedPageTestNameInput').value = 'Combined Practice Test';
        document.getElementById('combinePageSelectedCount').textContent = '0';
        document.getElementById('combinePageTotalQuestionsCount').textContent = '0';
        
    } catch (e) {
        console.error("Error loading combine page checklist:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const combineTestsBtn = document.getElementById('combineTestsBtn');
    const confirmBtn = document.getElementById('confirmCombinePageTestsBtn');
    
    if (combineTestsBtn) {
        combineTestsBtn.addEventListener('click', () => {
            if (typeof window.switchDashView === 'function') {
                window.switchDashView('combineView');
            }
        });
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            const selectedBoxes = document.querySelectorAll('.combine-page-checkbox:checked');
            if (selectedBoxes.length < 2) {
                alert("Please select at least 2 tests to combine.");
                return;
            }
            
            const customTitle = document.getElementById('combinedPageTestNameInput').value.trim() || 'Combined Practice Test';
            
            try {
                let combinedImages = [];
                for (const box of selectedBoxes) {
                    const id = parseInt(box.getAttribute('data-id'));
                    const session = await getSessionFromDB(id);
                    if (session && session.extractedImages) {
                        const cleanTitle = session.title ? session.title.replace(/[\[\]]/g, '') : `Test #${session.id}`;
                        const prefix = cleanTitle.substring(0, 15);
                        
                        // Merge images & prep prefix
                        session.extractedImages.forEach((img, idx) => {
                            const originalLabel = img.label || `Q${idx+1}`;
                            const prefixedLabel = originalLabel.includes(' - ') 
                                ? `[${prefix}] ${originalLabel}` 
                                : `[${prefix}] Exercise 1 - ${originalLabel}`;
                                
                            combinedImages.push({
                                label: prefixedLabel,
                                dataUrl: img.dataUrl,
                                answerDataUrl: img.answerDataUrl
                            });
                        });
                    }
                }
                
                const totalQ = combinedImages.length;
                const mins = (typeof getCalculatedTimeMinutes === 'function') ? getCalculatedTimeMinutes(totalQ) : 60;
                
                // Fresh practiceState for combined test launch
                practiceState = {
                    activeIndices: combinedImages.map((_, i) => i),
                    currentIndex: 0,
                    theme: 'nta',
                    totalSecondsRemaining: mins * 60,
                    scorePerQ: 4,
                    negativeMarking: true,
                    stats: combinedImages.map((q, idx) => {
                        const ex = q.label.split(' - ')[0];
                        return {
                            index: idx,
                            timeSpent: 0,
                            targetTime: 0,
                            attempted: false,
                            evaluation: null,
                            ntaStatus: 'not_visited',
                            exercise: ex
                        };
                    })
                };
                
                const combinedSession = {
                    id: Date.now(),
                    date: new Date().toLocaleString(),
                    title: customTitle,
                    practiceState: practiceState,
                    extractedImages: combinedImages,
                    isHosted: false,
                    isCommunity: false
                };
                
                // Save combined session to DB
                await saveSessionToDB(combinedSession);
                
                // Switch global extractedImages
                extractedImages = combinedImages;
                currentSessionId = combinedSession.id;
                window.currentPdfFilename = customTitle;
                
                // Switch to CBT practice screen instantly (give them on the go)
                const uploadContainer = document.getElementById('uploadContainer');
                const historyContainer = document.getElementById('historyContainer');
                const configContainer = document.getElementById('configContainer');
                const practiceSetupContainer = document.getElementById('practiceSetupContainer');
                const analysisContainer = document.getElementById('analysisContainer');
                const liveResultsDashboard = document.getElementById('liveResultsDashboard');
                const combineViewContainer = document.getElementById('combineViewContainer');
                
                if(uploadContainer) uploadContainer.classList.add('hidden');
                if(historyContainer) historyContainer.classList.add('hidden');
                if(configContainer) configContainer.classList.add('hidden');
                if(practiceSetupContainer) practiceSetupContainer.classList.add('hidden');
                if(analysisContainer) analysisContainer.classList.add('hidden');
                if(liveResultsDashboard) liveResultsDashboard.classList.add('hidden');
                if(combineViewContainer) combineViewContainer.classList.add('hidden');
                
                if (typeof startPracticeSession === 'function') {
                    startPracticeSession(practiceState.activeIndices);
                }
            } catch (err) {
                console.error("Combine operation failed:", err);
                alert("Failed to combine and launch tests.");
            }
        });
    }
});

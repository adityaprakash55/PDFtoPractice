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
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('border-blue-500','bg-blue-50'); });
dropZone.addEventListener('dragleave',e => { e.preventDefault(); dropZone.classList.remove('border-blue-500','bg-blue-50'); });
dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('border-blue-500','bg-blue-50');
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
    dropZone.classList.remove('hover:border-green-400', 'hover:bg-green-50');
    dropZone.classList.add('hover:border-blue-400', 'hover:bg-blue-50');
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
            dropZone.classList.add('hover:border-green-400', 'hover:bg-green-50');
            dropZone.classList.remove('hover:border-blue-400', 'hover:bg-blue-50');
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
startFinalScanBtn.addEventListener('click', async () => {
    // Basic validation
    if (qConfig.startPage < 1 || qConfig.endPage < qConfig.startPage || qConfig.endPage > pdfDoc.numPages) {
        alert('Invalid page range for Questions PDF.'); return;
    }
    if (pdfDocAnswers && (aConfig.startPage < 1 || aConfig.endPage < aConfig.startPage || aConfig.endPage > pdfDocAnswers.numPages)) {
        alert('Invalid page range for Answers PDF.'); return;
    }

    configContainer.classList.add('hidden');
    progressContainer.classList.remove('hidden');
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
            progressBar.style.width  = `${5 + (doneQ / totalQ) * 45}%`;
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
                progressBar.style.width  = `${50 + (doneA / totalA) * 45}%`;
                await processAnswerKeyPage(pg, aConfig, pdfDocAnswers);
                doneA++;
            }
        }

        progressBar.style.width  = '100%';
        progressText.textContent = `Done! Found ${extractedImages.length} questions and ${extractedAnswers.length} answers.`;
        
        linkQuestionsAndAnswers();
        
        progressContainer.classList.add('hidden');
        if (extractedImages.length > 0) {
            showPracticeSetup();
        } else {
            alert("No questions were extracted. Please try adjusting your margins.");
            configContainer.classList.remove('hidden');
        }

    } catch (err) {
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
    practiceSetupContainer.classList.remove('hidden');
}

function startPracticeSession(indices) {
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
        if (q.label.includes(' - ')) return q.label.split(' - ')[0];
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
    
    currentSessionId = Date.now();
    
    // Initialize stats
    practiceState.stats = extractedImages.map((q, idx) => {
        let ex = 'Exercise 1';
        if (q.label.includes(' - ')) ex = q.label.split(' - ')[0];
        return {
            index: idx,
            timeSpent: 0,
            attempted: false,
            evaluation: null, // 'correct' | 'incorrect'
            ntaStatus: 'not_visited',
            exercise: ex
        };
    });
    
    // Default active indices is ALL questions
    startPracticeSession(extractedImages.map((_, i) => i));
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
    const typeBadge = q.type ? `<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 border border-blue-200 dark:border-blue-700 shadow-sm">${q.type}</span>` : '';
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
        card.className = 'bg-white dark:bg-[#1C212E] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col gap-4 shadow-lg';
        
        // Header
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4';
        
        const title = document.createElement('h4');
        title.className = 'text-lg font-bold text-white';
        title.textContent = `Question ${stat.activeSectionNumber} (${stat.exercise.toUpperCase()})`;
        
        const badges = document.createElement('div');
        badges.className = 'flex flex-wrap gap-2 text-[10px] sm:text-xs font-bold';
        
        const timeBadge = document.createElement('span');
        timeBadge.className = 'bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700';
        timeBadge.textContent = formatTime(stat.timeSpent);
        badges.appendChild(timeBadge);
        
        let statusClass = 'bg-gray-800 text-gray-400 border border-gray-700';
        let statusText = 'Skipped';
        
        if (stat.evaluation === 'correct') {
            statusClass = 'bg-green-500/20 text-green-400 border border-green-500/30';
            statusText = 'Correct';
        } else if (stat.evaluation === 'incorrect') {
            statusClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
            statusText = 'Incorrect';
        }
        
        const evalBadge = document.createElement('span');
        evalBadge.className = `px-3 py-1 rounded-full ${statusClass}`;
        evalBadge.textContent = statusText;
        badges.appendChild(evalBadge);
        
        if (stat.ntaStatus === 'marked' || stat.ntaStatus === 'answered_marked') {
            const markBadge = document.createElement('span');
            markBadge.className = 'bg-[#B58A18]/20 text-[#FBBF24] border border-[#B58A18]/50 px-3 py-1 rounded-full';
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
        qImg.className = 'max-w-full rounded bg-white p-2 border border-gray-300 mx-auto';
        imagesContainer.appendChild(qImg);
        
        if (q.answerDataUrl) {
            const aLabel = document.createElement('div');
            aLabel.className = 'text-sm font-bold text-gray-400 mt-2 text-center';
            aLabel.textContent = 'Solution:';
            imagesContainer.appendChild(aLabel);
            
            const aImg = document.createElement('img');
            aImg.src = q.answerDataUrl;
            aImg.className = 'max-w-full rounded bg-white p-2 border border-green-500 mx-auto';
            imagesContainer.appendChild(aImg);
        }
        
        card.appendChild(imagesContainer);
        reviewList.appendChild(card);
    });
    
    if (count === 0) {
        reviewList.innerHTML = `<div class="text-gray-500 text-center py-10 font-medium">No questions found for this filter.</div>`;
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
                borderRadius: 6,
                borderSkipped: false,
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
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
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
            historyContainer.classList.add('hidden');
            return;
        }
        
        historyContainer.classList.remove('hidden');
        historyList.innerHTML = '';
        
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
                <div class="text-[11px] text-gray-400 mt-1">${label}</div>
            </div>
            `;
        }
        
        const reversedSessions = [...sessions].reverse();
        const totalSessions = reversedSessions.length;
        const sessionsToShow = reversedSessions.slice(0, historyDisplayLimit);
        
        sessionsToShow.forEach(session => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-[#1C212E] p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between border border-gray-200 dark:border-gray-800 shadow-xl relative z-10 hover:z-20';
            
            // Format time spent beautifully (01:07:59 format)
            const hrs = Math.floor(session.totalSeconds / 3600);
            const mins = Math.floor((session.totalSeconds % 3600) / 60);
            const secs = session.totalSeconds % 60;
            const timeStr = [hrs, mins, secs].map(v => v < 10 ? "0" + v : v).join(":");

            // Calculate metrics
            const total = session.correctCount + session.incorrectCount + session.unansweredCount;
            const attempted = session.correctCount + session.incorrectCount;
            const scorePerQ = session.practiceState?.scorePerQ || 4;
            const hasNeg = session.practiceState?.negativeMarking !== false;
            const penalty = hasNeg ? session.incorrectCount : 0;
            
            const maxScore = total * scorePerQ;
            const score = (session.correctCount * scorePerQ) - penalty;
            const accuracy = attempted > 0 ? Math.round((session.correctCount / attempted) * 100) : 0;

            card.innerHTML = `
                <!-- Left: Score -->
                <div class="flex items-center justify-center mr-0 md:mr-8 mb-6 md:mb-0">
                    ${createGauge(score, maxScore, '#F59E0B', '#334155', 120, 10, `<div class="mb-1"><span class="text-2xl font-bold text-[#F59E0B] leading-none">${score}</span><span class="text-xs text-gray-500">/${maxScore}</span></div>`, 'Score')}
                </div>
                
                <!-- Middle: Info & Stats -->
                <div class="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <div class="flex items-center gap-3 mb-1">
                        <h4 class="text-lg font-bold text-white">Session #${session.id}</h4>
                        <span class="px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-400 text-[10px] font-bold flex items-center gap-1 border border-blue-800/50">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg> 
                            Subject Test
                        </span>
                    </div>
                    <p class="text-[11px] text-gray-400 mb-6">${session.date}</p>
                    
                    <div class="flex flex-wrap justify-center md:justify-start gap-5">
                        ${createGauge(session.correctCount, total, '#10B981', '#334155', 70, 6, `<span class="text-sm font-bold text-[#10B981]">${session.correctCount}</span>`, 'Correct')}
                        ${createGauge(session.incorrectCount, total, '#EF4444', '#334155', 70, 6, `<span class="text-sm font-bold text-[#EF4444]">${session.incorrectCount}</span>`, 'Wrong')}
                        ${createGauge(attempted, total, '#3B82F6', '#334155', 70, 6, `<span class="text-sm font-bold text-[#3B82F6]">${attempted}/${total}</span>`, 'Attempted')}
                        ${createGauge(accuracy, 100, '#10B981', '#334155', 70, 6, `<span class="text-sm font-bold text-[#10B981]">${accuracy}%</span>`, 'Accuracy')}
                        ${createGauge(session.totalSeconds, 10800, '#F59E0B', '#334155', 70, 6, `<span class="text-[11px] font-bold text-[#F59E0B]">${timeStr}</span>`, 'Time')}
                    </div>
                </div>
                
                <!-- Right: Actions -->
                <div class="flex items-center gap-2 mt-6 md:mt-0">
                    <button class="share-session-btn bg-[#286090] hover:bg-[#1e4b72] text-white text-sm font-bold py-2 px-3 rounded-lg flex items-center justify-center transition-colors" data-id="${session.id}" title="Share this test">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                    </button>
                    <button class="view-session-btn bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors" data-id="${session.id}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg> 
                        View Analysis
                    </button>
                    
                    <div class="relative group cursor-pointer" tabindex="0">
                        <div class="text-gray-400 hover:text-white p-2 rounded-full transition-colors flex items-center justify-center">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                        </div>
                        <div class="absolute right-0 top-full pt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50">
                            <div class="bg-white dark:bg-[#1C212E] rounded-xl shadow-2xl border border-gray-700 flex flex-col text-sm font-semibold overflow-hidden">
                                <button class="history-reattempt-btn text-left px-4 py-3 text-red-400 hover:bg-gray-800 transition-colors" data-id="${session.id}" data-type="wrong">Reattempt Wrong</button>
                                <button class="history-reattempt-btn text-left px-4 py-3 text-gray-300 hover:bg-gray-800 transition-colors" data-id="${session.id}" data-type="unanswered">Reattempt Unanswered</button>
                                <button class="history-reattempt-btn text-left px-4 py-3 text-[#FBBF24] hover:bg-gray-800 transition-colors" data-id="${session.id}" data-type="marked">Reattempt Marked</button>
                                <button class="history-reattempt-btn text-left px-4 py-3 text-blue-400 hover:bg-gray-800 transition-colors" data-id="${session.id}" data-type="all">Reattempt All Qs</button>
                                <div class="border-t border-gray-700"></div>
                                <button class="delete-session-btn text-left px-4 py-3 text-red-600 hover:bg-red-500/10 transition-colors" data-id="${session.id}">Delete Session</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            historyList.appendChild(card);
        });

        if (historyDisplayLimit < totalSessions) {
            const viewMoreContainer = document.createElement('div');
            viewMoreContainer.className = 'flex justify-center mt-6 w-full';
            viewMoreContainer.innerHTML = `<button id="viewMoreHistoryBtn" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-8 rounded-lg shadow-lg transition-colors border border-blue-500">View More</button>`;
            historyList.appendChild(viewMoreContainer);
            
            document.getElementById('viewMoreHistoryBtn').addEventListener('click', () => {
                historyDisplayLimit += 10;
                renderHistory();
            });
        }
        
        // Event listeners for history cards
        document.querySelectorAll('.delete-session-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if(confirm("Delete this session?")) {
                    const id = parseInt(btn.getAttribute('data-id'));
                    await deleteSessionFromDB(id);
                    renderHistory();
                }
            });
        });
        
        document.querySelectorAll('.view-session-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const session = await getSessionFromDB(id);
                if (session) {
                    loadSessionAndShowSummary(session);
                }
            });
        });
        
        document.querySelectorAll('.share-session-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const session = await getSessionFromDB(id);
                if (session && typeof startLiveRoomFromSession === 'function') {
                    startLiveRoomFromSession(session);
                } else {
                    alert('Unable to share this session.');
                }
            });
        });
        
        document.querySelectorAll('.history-reattempt-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const filterType = btn.getAttribute('data-type');
                
                const session = await getSessionFromDB(id);
                if (session) {
                    currentSessionId = session.id;
                    practiceState = session.practiceState;
                    extractedImages = session.extractedImages;
                    
                    uploadContainer.classList.add('hidden');
                    document.getElementById('historyContainer').classList.add('hidden');
                    
                    reattemptPractice(filterType);
                }
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
        list.innerHTML = `<div class="text-center text-gray-500 py-10">This group is empty.</div>`;
        return;
    }
    
    activeBookmarkGroup.questions.forEach(q => {
        const div = document.createElement('div');
        div.className = 'bg-white dark:bg-[#1C212E] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center relative group';
        div.innerHTML = `
            <div class="w-full sm:w-32 shrink-0 bg-white rounded-lg p-1 overflow-hidden h-20 flex items-center justify-center">
                <img src="${q.dataUrl}" class="max-w-full max-h-full object-contain mix-blend-multiply" />
            </div>
            <div class="flex-1 flex flex-col justify-center">
                <h4 class="font-bold text-white text-sm">${q.label || 'Question'}</h4>
                <p class="text-xs text-gray-400 mt-1">Added ${new Date(activeBookmarkGroup.timestamp).toLocaleDateString()}</p>
            </div>
            <button class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-lg transition-colors border border-red-500/20 hover:border-red-500 shrink-0" title="Remove Question" aria-label="Remove Question">
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
                <div class="col-span-1 sm:col-span-2 lg:col-span-3 bg-white dark:bg-[#1C212E] p-8 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed flex flex-col items-center justify-center text-center opacity-70">
                    <div class="bg-yellow-500/10 p-4 rounded-full text-yellow-500 mb-4">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-gray-400 mb-1">No Notes Yet</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-500 max-w-sm">Write notes using the scratchpad during practice. They will be saved here!</p>
                </div>
            `;
            return;
        }
        
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-[#1C212E] p-5 rounded-2xl flex flex-col justify-between border border-gray-200 dark:border-gray-800 shadow-xl relative z-10 hover:z-20 transition-all hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] cursor-pointer group';
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="bg-yellow-500/10 p-2 rounded-lg text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-white group-hover:text-yellow-400 transition-colors">My Noted Questions</h3>
                        <p class="text-sm text-gray-400">${currentNotedQuestions.length} questions</p>
                    </div>
                </div>
            </div>
            <div class="mt-auto">
                <button class="w-full bg-white/10 hover:bg-yellow-500 text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
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
        list.innerHTML = `<div class="text-center text-gray-500 py-10">You have no noted questions.</div>`;
        return;
    }
    
    currentNotedQuestions.forEach(q => {
        const div = document.createElement('div');
        div.className = 'bg-white dark:bg-[#1C212E] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-stretch relative group';
        div.innerHTML = `
            <div class="w-full sm:w-1/3 shrink-0 bg-white rounded-lg p-2 overflow-hidden flex items-center justify-center min-h-[100px]">
                <img src="${q.dataUrl}" class="max-w-full max-h-32 object-contain mix-blend-multiply" />
            </div>
            <div class="flex-1 flex flex-col border-l border-gray-200 dark:border-gray-800 pl-4">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-white text-sm">${q.label}</h4>
                        <p class="text-xs text-gray-400">Added ${new Date(q.timestamp).toLocaleDateString()}</p>
                    </div>
                    <button class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg transition-colors border border-red-500/20 hover:border-red-500 shrink-0" title="Delete Note" aria-label="Delete Note">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
                <div class="flex-1 bg-black/30 rounded-lg p-3 text-gray-300 text-sm whitespace-pre-wrap overflow-y-auto max-h-32 hide-scrollbar font-mono">${q.noteText}</div>
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
                <div class="col-span-1 sm:col-span-2 lg:col-span-3 bg-white dark:bg-[#1C212E] p-8 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed flex flex-col items-center justify-center text-center opacity-70">
                    <div class="bg-gray-100 dark:bg-white/5 p-4 rounded-full text-gray-500 mb-4">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-gray-400 mb-1">No Bookmarks Yet</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-500 max-w-sm">When you bookmark questions during a practice session, your custom collections will appear here.</p>
                </div>
            `;
            return;
        }
        
        groups.forEach(g => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-[#1C212E] p-5 rounded-2xl flex flex-col justify-between border border-gray-200 dark:border-gray-800 shadow-xl relative z-10 hover:z-20 transition-all hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] cursor-pointer group';
            
            card.innerHTML = `
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="bg-blue-500/10 p-2 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">${g.name}</h3>
                            <p class="text-sm text-gray-400">${g.questions.length} questions</p>
                        </div>
                    </div>
                </div>
                <div class="mt-auto">
                    <button class="w-full bg-white/10 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
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
        reviewList.innerHTML = `<p class="text-gray-500 italic">No ${type} questions found.</p>`;
        return;
    }
    
    filteredIndices.forEach((realIndex, i) => {
        const q = extractedImages[realIndex];
        
        const card = document.createElement('div');
        card.className = 'bg-gray-50 dark:bg-navy-800 p-4 rounded-xl border border-gray-200 dark:border-navy-700';
        
        const header = document.createElement('div');
        header.className = 'font-bold text-sm text-gray-700 dark:text-gray-200 mb-2';
        header.textContent = `Question ${q.label}`;
        
        const img = document.createElement('img');
        img.src = q.dataUrl;
        img.className = 'max-w-full h-auto object-contain mb-4 rounded border border-gray-100 dark:border-navy-600 dark:bg-white dark:p-1';
        
        const btn = document.createElement('button');
        btn.className = 'bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 text-sm font-bold py-2 px-4 rounded';
        btn.textContent = 'View Answer';
        
        const answerImg = document.createElement('img');
        if (q.answerDataUrl) {
            answerImg.src = q.answerDataUrl;
        }
        answerImg.className = 'max-w-full h-auto object-contain mt-4 rounded border border-gray-100 dark:border-navy-600 dark:bg-white dark:p-1 hidden';
        
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
            div.className = 'bg-[#060b14]/50 rounded-lg p-3 flex items-center justify-between group transition-colors hover:bg-white/5 border border-transparent hover:border-white/10';
            div.innerHTML = `
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <svg class="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
                        <h5 class="font-bold text-sm text-gray-200">${g.name}</h5>
                    </div>
                    <p class="text-[10px] text-gray-500 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        ${g.questions ? g.questions.length : 0} questions
                    </p>
                </div>
                <button class="bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Add
                </button>
            `;
            div.querySelector('button').onclick = async () => {
                const btn = div.querySelector('button');
                try {
                    await addQuestionToBookmarkGroup(g.id, g.name, q);
                    btn.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Added`;
                    btn.classList.replace('bg-blue-500/20', 'bg-green-500');
                    btn.classList.replace('text-blue-400', 'text-white');
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
        btn.className = `px-6 py-2 h-full font-bold text-sm tracking-wide transition-colors border-r border-[#d4781d] ${i === 0 ? 'bg-white text-blue-900' : 'text-white hover:bg-[#e07b1a]'}`;
        btn.textContent = ex.toUpperCase();
        btn.onclick = () => {
            // Update Tab styles
            Array.from(ntaSubjectTabs.children).forEach(child => {
                child.className = 'px-6 py-2 h-full font-bold text-sm tracking-wide transition-colors border-r border-[#d4781d] text-white hover:bg-[#e07b1a]';
            });
            btn.className = 'px-6 py-2 h-full font-bold text-sm tracking-wide transition-colors border-r border-[#d4781d] bg-white text-blue-900';
            
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
        header.className = 'bg-blue-100 dark:bg-navy-800 font-bold text-sm p-2 text-center text-blue-900 dark:text-blue-300 rounded shadow-sm';
        header.textContent = ex.toUpperCase();
        ntaPaletteGrid.appendChild(header);
        
        // Create Section Grid
        const sectionGrid = document.createElement('div');
        sectionGrid.className = 'flex flex-wrap gap-2 mb-4';
        
        groups[ex].forEach((item, sectionIndex) => {
            item.stat.activeSectionNumber = sectionIndex + 1;
            const btn = document.createElement('button');
            btn.id = `ntaPaletteBtn_${item.paletteIndex}`;
            btn.className = 'w-10 h-10 flex items-center justify-center font-bold text-sm rounded transition-transform transform hover:scale-105 shadow-sm border border-gray-300 nta-not-visited';
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
        
        btn.className = 'w-10 h-10 flex items-center justify-center font-bold text-sm transition-transform transform hover:scale-105 shadow-sm border border-gray-300';
        
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
                btn.innerHTML += `<span class="w-3 h-3 bg-green-400 rounded-full absolute bottom-0 right-0 border border-white"></span>`;
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
        answeredMarkedEl.innerHTML = `<span class="w-2 h-2 bg-green-400 rounded-full absolute bottom-0 right-0 border border-white"></span>${counts.answered_marked}`;
    }
}

function updateQuestionStopwatchDisplayNta() {
    ntaQuestionStopwatch.textContent = formatTime(practiceState.qSecondsSpent);
}

function renderNtaQuestion(index) {
    practiceState.currentIndex = index;
    const realIndex = practiceState.activeIndices[index];
    const q = extractedImages[realIndex];
    const stat = practiceState.stats[realIndex];
    
    if (stat.ntaStatus === 'not_visited') {
        stat.ntaStatus = 'not_answered';
    }
    
    updateNtaPaletteColors();
    
    // Auto-select the correct Subject Tab if user navigated via Palette
    Array.from(ntaSubjectTabs.children).forEach(btn => {
        if (btn.textContent === stat.exercise.toUpperCase()) {
            btn.className = 'px-6 py-2 h-full font-bold text-sm tracking-wide transition-colors border-r border-[#d4781d] bg-white text-blue-900';
        } else {
            btn.className = 'px-6 py-2 h-full font-bold text-sm tracking-wide transition-colors border-r border-[#d4781d] text-white hover:bg-[#e07b1a]';
        }
    });
    
    const typeBadge = q.type ? `<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/80 dark:text-amber-100 border border-amber-300 dark:border-amber-700">${q.type}</span>` : '';
    ntaQuestionLabel.innerHTML = `Question ${stat.activeSectionNumber}: <span class="text-xs font-normal opacity-80">(${q.label})</span> ${typeBadge}`;
    ntaQImage.src = q.dataUrl;
    ntaQImage.onload = () => {
        const container = document.getElementById('ntaContentContainer');
        if (container) {
            const scaleRatio = ntaQImage.clientWidth / ntaQImage.naturalWidth;
            container.scrollTop = (q.yOffset * scaleRatio) - 20;
        }
    };
    
    // Setup Radio buttons
    const options = document.querySelectorAll('input[name="ntaOption"]');
    options.forEach(opt => {
        opt.checked = false; // uncheck all by default
        if (practiceState.answers[realIndex] === opt.value) {
            opt.checked = true;
        }
        
        opt.onchange = (e) => {
            if (e.target.checked) {
                practiceState.answers[realIndex] = e.target.value;
            }
        };
    });

    
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
    updateNtaPaletteColors();
});

ntaIncorrectBtn.addEventListener('click', () => {
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    practiceState.stats[realIndex].ntaStatus = 'answered';
    practiceState.stats[realIndex].evaluation = 'incorrect';
    updateNtaPaletteColors();
});

ntaSaveNextBtn.addEventListener('click', () => {
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    const s = practiceState.stats[realIndex];
    if (practiceState.answers[realIndex]) {
        s.ntaStatus = 'answered';
        s.attempted = true;
    } else {
        s.ntaStatus = 'not_answered';
    }
    updateNtaPaletteColors();
    if (practiceState.currentIndex < practiceState.activeIndices.length - 1) {
        renderNtaQuestion(practiceState.currentIndex + 1);
    }
});

if (document.getElementById('ntaSaveReviewBtn')) {
    document.getElementById('ntaSaveReviewBtn').addEventListener('click', () => {
        const realIndex = practiceState.activeIndices[practiceState.currentIndex];
        const s = practiceState.stats[realIndex];
        s.ntaStatus = s.attempted ? 'answered_marked' : 'marked';
        updateNtaPaletteColors();
        if (practiceState.currentIndex < practiceState.activeIndices.length - 1) {
            renderNtaQuestion(practiceState.currentIndex + 1);
        }
    });
}

ntaClearBtn.addEventListener('click', () => {
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    const s = practiceState.stats[realIndex];
    s.ntaStatus = 'not_answered';
    s.attempted = false;
    s.evaluation = null;
    delete practiceState.answers[realIndex];
    practiceState.isAnswerRevealed = false;
    updateNtaPaletteColors();
    renderNtaQuestion(practiceState.currentIndex); // Re-render to clear radio buttons
});

ntaMarkReviewBtn.addEventListener('click', () => {
    const realIndex = practiceState.activeIndices[practiceState.currentIndex];
    const s = practiceState.stats[realIndex];
    if (practiceState.answers[realIndex]) {
        s.ntaStatus = 'answered_marked';
        s.attempted = true;
    } else {
        s.ntaStatus = 'marked';
    }
    updateNtaPaletteColors();
    if (practiceState.currentIndex < practiceState.activeIndices.length - 1) {
        renderNtaQuestion(practiceState.currentIndex + 1);
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
                <td class="px-4 py-2.5 font-semibold text-gray-800 dark:text-gray-200">${name}</td>
                <td class="px-3 py-2.5 text-center text-[#5cb85c] font-bold">${c.answered}</td>
                <td class="px-3 py-2.5 text-center text-[#d9534f] font-bold">${c.not_answered}</td>
                <td class="px-3 py-2.5 text-center text-gray-600 dark:text-gray-300 font-bold">${c.not_visited}</td>
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
        container.innerHTML = '<p class="text-gray-500 text-center p-8">No full answer key pages available.</p>';
    } else {
        extractedAnswerPages.forEach(p => {
            const img = document.createElement('img');
            img.src = p.dataUrl;
            img.className = 'w-full h-auto block border border-gray-300 dark:border-navy-600 shadow-md rounded';
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

    // Role badge
    const roleBadge = document.getElementById('lrdRoleBadge');
    if (roleBadge) {
        const inLive = typeof isLiveMode !== 'undefined' && isLiveMode;
        if (inLive) {
            const amHost = typeof isHost !== 'undefined' && isHost;
            roleBadge.textContent = amHost ? '👑 Host' : '👤 Participant';
        } else {
            roleBadge.textContent = '📝 Solo Practice';
        }
    }

    // Wire nav once
    if (!_lrdNavWired) {
        _lrdNavWired = true;
        document.querySelectorAll('.lrd-nav').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.lrd-nav').forEach(b => {
                    b.classList.remove('bg-white/10', 'text-white');
                    b.classList.add('text-gray-400');
                });
                btn.classList.add('bg-white/10', 'text-white');
                btn.classList.remove('text-gray-400');
                document.querySelectorAll('.lrd-panel').forEach(p => p.classList.add('hidden'));
                const panel = document.getElementById('lrd' + btn.dataset.panel);
                if (panel) panel.classList.remove('hidden');
            });
        });
        const overviewBtn = document.querySelector('.lrd-nav[data-panel="Overview"]');
        if (overviewBtn) { overviewBtn.classList.add('bg-white/10', 'text-white'); overviewBtn.classList.remove('text-gray-400'); }

        const exitBtn = document.getElementById('lrdExitBtn');
        if (exitBtn) exitBtn.addEventListener('click', () => { window.location.reload(); });
    }

    // Populate all panels
    _lrdFillOverview(stats);
    _lrdFillTimeAnalysis(stats);
    _lrdFillInsights(stats);
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

function _lrdFillOverview(s) {
    const { correctCount, incorrectCount, skippedCount, totalQ, score, maxScore, scorePercent, accuracy, totalSeconds, avgTimePerQ, scorePerQ, hasNeg } = s;
    const el = id => document.getElementById(id);
    const mins = Math.floor(totalSeconds / 60), secs = totalSeconds % 60;

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
            let bg = 'bg-gray-800 border border-gray-700';
            if (stat.evaluation === 'correct') bg = 'bg-green-600';
            else if (stat.evaluation === 'incorrect') bg = 'bg-red-600';
            else if (stat.attempted || stat.ntaStatus === 'answered' || stat.ntaStatus === 'answered_marked') bg = 'bg-gray-500';
            const d = document.createElement('div');
            d.className = 'w-6 h-6 rounded text-[9px] flex items-center justify-center font-bold text-white ' + bg;
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

    let fastCorrect = 0, fastIncorrect = 0, slowCorrect = 0, slowIncorrect = 0;
    const timeData = [], colorData = [];

    (practiceState.activeIndices || []).forEach(ri => {
        const stat = practiceState.stats[ri];
        if (!stat) return;
        const t = stat.timeSpent || 0;
        timeData.push(t);
        const isFast = t <= avgTimePerQ;
        if (stat.evaluation === 'correct') {
            if (isFast) fastCorrect++; else slowCorrect++;
            colorData.push('rgba(34,197,94,0.8)');
        } else if (stat.evaluation === 'incorrect') {
            if (isFast) fastIncorrect++; else slowIncorrect++;
            colorData.push('rgba(239,68,68,0.8)');
        } else {
            colorData.push('rgba(107,114,128,0.4)');
        }
    });

    if (el('lrdFastCorrect')) el('lrdFastCorrect').textContent = fastCorrect;
    if (el('lrdFastIncorrect')) el('lrdFastIncorrect').textContent = fastIncorrect;
    if (el('lrdSlowCorrect')) el('lrdSlowCorrect').textContent = slowCorrect;
    if (el('lrdSlowIncorrect')) el('lrdSlowIncorrect').textContent = slowIncorrect;

    const ctx = el('lrdTimeChart');
    if (ctx && typeof Chart !== 'undefined') {
        if (_lrdChartTime) { _lrdChartTime.destroy(); _lrdChartTime = null; }
        _lrdChartTime = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: (practiceState.activeIndices || []).map((_, i) => i + 1),
                datasets: [{ data: timeData, backgroundColor: colorData, borderWidth: 0, borderRadius: 2 }]
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

    if (el('lrdBestStreak')) el('lrdBestStreak').innerHTML = bestStreak + ' <span class="text-base text-gray-400">Q</span>';
    if (el('lrdWrongRun')) el('lrdWrongRun').innerHTML = worstRun + ' <span class="text-base text-gray-400">Q</span>';
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
            bar.innerHTML = '<span class="text-[10px] text-gray-400">' + pAcc + '%</span><div style="width:100%; height:' + barH + 'px; background:' + barColor + '; border-radius:3px 3px 0 0;"></div>';
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
            mpmEl.innerHTML = '<div class="text-gray-500 text-xs">No data available</div>';
        } else {
            entries.forEach(([name, d]) => {
                const mpm = d.seconds > 0 ? (d.marks / (d.seconds / 60)).toFixed(2) : '0.00';
                const isPos = parseFloat(mpm) >= 0;
                const row = document.createElement('div');
                row.className = 'flex items-center gap-3';
                row.innerHTML = '<span class="text-gray-500 text-xs w-4">' + (rank++) + '</span>' +
                    '<span class="text-white text-xs font-semibold flex-1 truncate">' + name + '</span>' +
                    '<div class="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden"><div class="h-full rounded-full ' + (isPos ? 'bg-orange-400' : 'bg-red-500') + '" style="width:' + Math.min(Math.abs(parseFloat(mpm)) * 15, 100) + '%"></div></div>' +
                    '<span class="text-xs ' + (isPos ? 'text-orange-400' : 'text-red-400') + ' w-20 text-right">' + mpm + ' m/min</span>';
                mpmEl.appendChild(row);
            });
        }
    }
}

function _lrdFillScoreProgress(s) {
    const { scorePerQ, hasNeg, maxScore } = s;
    const el = id => document.getElementById(id);

    // Build cumulative score arrays
    const scoreByQ = [0];
    const scoreByTime = [{ x: 0, y: 0 }];
    let cumScore = 0, cumTime = 0;

    (practiceState.activeIndices || []).forEach(ri => {
        const stat = practiceState.stats[ri];
        if (!stat) { scoreByQ.push(cumScore); return; }
        const t = stat.timeSpent || 0;
        if (stat.evaluation === 'correct') cumScore += scorePerQ;
        else if (stat.evaluation === 'incorrect' && hasNeg) cumScore -= 1;
        cumTime += t;
        scoreByQ.push(cumScore);
        scoreByTime.push({ x: Math.round(cumTime), y: cumScore });
    });

    if (typeof Chart === 'undefined') return;

    const chartDefaults = {
        type: 'line',
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#6b7280', maxTicksLimit: 10, font: { size: 9 } }, grid: { color: '#1f2937' } },
                y: { ticks: { color: '#6b7280', font: { size: 9 } }, grid: { color: '#1f2937' }, suggestedMin: Math.min(...scoreByQ) - 5, suggestedMax: maxScore + 10 }
            }
        }
    };

    const ctxQ = el('lrdScoreCurveQ');
    if (ctxQ) {
        if (_lrdChartScoreQ) { _lrdChartScoreQ.destroy(); _lrdChartScoreQ = null; }
        _lrdChartScoreQ = new Chart(ctxQ, {
            ...chartDefaults,
            data: {
                labels: scoreByQ.map((_, i) => i === 0 ? 'Start' : i),
                datasets: [{ data: scoreByQ, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.05)', borderWidth: 2, pointRadius: 0, fill: true, tension: 0.3 }]
            }
        });
    }

    const ctxT = el('lrdScoreCurveT');
    if (ctxT) {
        if (_lrdChartScoreT) { _lrdChartScoreT.destroy(); _lrdChartScoreT = null; }
        _lrdChartScoreT = new Chart(ctxT, {
            ...chartDefaults,
            data: {
                labels: scoreByTime.map(d => d.x === 0 ? 'Start' : Math.floor(d.x/60) + 'm'),
                datasets: [{ data: scoreByTime.map(d => d.y), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.05)', borderWidth: 2, pointRadius: 0, fill: true, tension: 0.3 }]
            }
        });
    }
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
            d.innerHTML = '<div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-1" style="background:' + col + '">' + p.name.charAt(0).toUpperCase() + '</div>' +
                '<div class="text-xs text-white font-semibold mb-0.5 max-w-[80px] truncate text-center">' + p.name + '</div>' +
                '<div class="text-sm font-bold mb-1" style="color:' + col + '">' + (p.score !== null ? p.score : '—') + '</div>' +
                '<div class="w-16 rounded-t flex items-start justify-center pt-1 text-white font-black text-base" style="height:' + h + 'px; background:' + col + '">' + medals[realRank - 1] + '</div>';
            podium.appendChild(d);
        });
    }

    // My rank card
    const me = data.find(p => p.id === myId);
    const myRankEl = el('lrdLbMyRank');
    if (myRankEl && me) {
        const total = data.length;
        const pct = total > 1 ? Math.round((total - me.rank) / (total - 1) * 100) : 100;
        myRankEl.innerHTML = '<div class="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4 flex items-center gap-4 mb-4">' +
            '<div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0">#' + me.rank + '</div>' +
            '<div class="flex-1"><div class="text-white font-semibold text-sm">Your Test Percentile</div>' +
            '<div class="text-blue-400 font-bold">' + pct + '%ile <span class="text-gray-400 font-normal">— better than ' + pct + '% of participants</span></div></div>' +
            '<div class="text-right border border-gray-700 rounded-lg px-3 py-2"><div class="text-xl font-black text-white">' + (me.score !== null ? me.score : '—') + '</div>' +
            '<div class="text-[10px] text-gray-400">points</div></div></div>';

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
            return '<div class="flex items-center gap-3 px-4 py-3 ' + (isMe ? 'bg-blue-900/20 border-l-2 border-blue-500' : 'hover:bg-white/5') + '">' +
                '<span class="text-sm w-8 text-center font-bold ' + (p.rank <= 3 ? '' : 'text-gray-400') + '">' + medal + '</span>' +
                '<div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold shrink-0">' + p.name.charAt(0).toUpperCase() + '</div>' +
                '<div class="flex-1 min-w-0"><div class="text-sm font-semibold text-white truncate">' + p.name + (isMe ? ' <span class="text-xs text-blue-400 font-normal">(You)</span>' : '') + (p.id === 'host' ? ' <span class="text-xs text-yellow-400 font-normal">(Host)</span>' : '') + '</div></div>' +
                '<div class="text-xs text-gray-500">' + (p.accuracy !== null && p.accuracy !== undefined ? (typeof p.accuracy === 'number' ? p.accuracy.toFixed(1) : p.accuracy) + '%' : '—') + '</div>' +
                '<div class="text-sm font-bold text-white ml-2">' + (p.score !== null && p.score !== undefined ? p.score : '—') + '</div></div>';
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
                btn.classList.remove('text-gray-400');
                btn.classList.add('text-white', 'bg-white/10');
                btn.classList.remove('hover:bg-white/5');
            } else {
                btn.classList.add('text-gray-400', 'hover:bg-white/5');
                btn.classList.remove('text-white', 'bg-white/10');
            }
        });
        
        closeMobileSidebar();
        if (targetView === 'analysisView') renderScoreAnalysis();
    };
    
    dashNavBtns.forEach(btn => {
        btn.addEventListener('click', () => switchDashView(btn.dataset.target));
    });
    
    async function renderScoreAnalysis() {
        const saTotalTests = document.getElementById('saTotalTests');
        const saAvgAccuracy = document.getElementById('saAvgAccuracy');
        const saAvgScorePct = document.getElementById('saAvgScorePct');
        const saTotalQs = document.getElementById('saTotalQs');
        const saAccuracyChart = document.getElementById('saAccuracyChart');
        const saTestReportTbody = document.getElementById('saTestReportTbody');
        
        let sessions = [];
        try {
            sessions = await getAllSessionsFromDB();
        } catch (e) {
            console.error('Error fetching sessions for analysis:', e);
        }

        if (!sessions || sessions.length === 0) {
            if (saTotalTests) saTotalTests.textContent = '0';
            if (saAvgAccuracy) saAvgAccuracy.textContent = '0%';
            if (saAvgScorePct) saAvgScorePct.textContent = '0%';
            if (saTotalQs) saTotalQs.textContent = '0';
            if (saAccuracyChart) {
                saAccuracyChart.innerHTML = '<p class="text-gray-500 text-sm text-center w-full my-auto">No practice tests completed yet. Start a test to see your performance graph!</p>';
            }
            if (saTestReportTbody) {
                saTestReportTbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-gray-500">No test data recorded yet. Take your first practice test!</td></tr>';
            }
            return;
        }

        // Metrics calculations
        if (saTotalTests) saTotalTests.textContent = sessions.length;

        let totalAttempted = 0;
        let totalCorrect = 0;
        let totalScoreSum = 0;
        let totalMaxScoreSum = 0;

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
            totalScoreSum += score;
            totalMaxScoreSum += maxScore;
        });

        if (saTotalQs) saTotalQs.textContent = totalAttempted;
        const avgAcc = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
        if (saAvgAccuracy) saAvgAccuracy.textContent = avgAcc + '%';

        const avgScorePct = totalMaxScoreSum > 0 ? Math.round((totalScoreSum / totalMaxScoreSum) * 100) : 0;
        if (saAvgScorePct) saAvgScorePct.textContent = avgScorePct + '%';

        // 1. Percentage-wise Performance Trend Graph (Accuracy & Score %)
        if (saAccuracyChart) {
            const recentSessions = sessions.slice(-12);
            saAccuracyChart.innerHTML = '';

            recentSessions.forEach((s) => {
                const attempted = (s.correctCount || 0) + (s.incorrectCount || 0);
                const total = attempted + (s.unansweredCount || 0);
                const scorePerQ = s.practiceState?.scorePerQ || 4;
                const hasNeg = s.practiceState?.negativeMarking !== false;
                const penalty = hasNeg ? (s.incorrectCount || 0) : 0;
                const score = ((s.correctCount || 0) * scorePerQ) - penalty;
                const maxScore = total * scorePerQ;

                const acc = attempted > 0 ? Math.round(((s.correctCount || 0) / attempted) * 100) : 0;
                const scorePct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

                const group = document.createElement('div');
                group.className = 'flex-1 flex items-end justify-center gap-1.5 h-full relative group cursor-pointer';

                // Bar 1: Accuracy % (emerald)
                const accBar = document.createElement('div');
                accBar.className = 'w-1/2 bg-emerald-500/30 hover:bg-emerald-500/70 border-t-2 border-emerald-400 rounded-t-md transition-all';
                accBar.style.height = Math.max(acc, 6) + '%';

                // Bar 2: Score % (blue)
                const scoreBar = document.createElement('div');
                scoreBar.className = 'w-1/2 bg-blue-500/30 hover:bg-blue-500/70 border-t-2 border-blue-400 rounded-t-md transition-all';
                scoreBar.style.height = Math.max(scorePct, 6) + '%';

                // Tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-950 text-white text-[11px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 border border-gray-700 shadow-2xl pointer-events-none text-left';
                tooltip.innerHTML = `
                    <div class="font-bold text-gray-200 mb-0.5">Test #${s.id}</div>
                    <div class="text-emerald-400">Accuracy: ${acc}%</div>
                    <div class="text-blue-400">Score: ${scorePct}% (${score}/${maxScore})</div>
                `;

                group.appendChild(accBar);
                group.appendChild(scoreBar);
                group.appendChild(tooltip);
                saAccuracyChart.appendChild(group);
            });
        }

        // 2. Detailed Test-by-Test Report Table
        if (saTestReportTbody) {
            saTestReportTbody.innerHTML = '';
            const reversed = [...sessions].reverse();

            reversed.forEach(s => {
                const attempted = (s.correctCount || 0) + (s.incorrectCount || 0);
                const total = attempted + (s.unansweredCount || 0);
                const scorePerQ = s.practiceState?.scorePerQ || 4;
                const hasNeg = s.practiceState?.negativeMarking !== false;
                const penalty = hasNeg ? (s.incorrectCount || 0) : 0;
                const score = ((s.correctCount || 0) * scorePerQ) - penalty;
                const maxScore = total * scorePerQ;

                const acc = attempted > 0 ? Math.round(((s.correctCount || 0) / attempted) * 100) : 0;
                const scorePct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

                const tr = document.createElement('tr');
                tr.className = 'hover:bg-white/5 transition-colors';
                tr.innerHTML = `
                    <td class="py-3.5 px-2">
                        <div class="font-bold text-white">Test #${s.id}</div>
                        <div class="text-xs text-gray-500">${s.date || 'Saved Session'}</div>
                    </td>
                    <td class="text-center font-semibold">${total} Qs</td>
                    <td class="text-center">
                        <span class="text-emerald-400 font-bold">${s.correctCount || 0}</span> / 
                        <span class="text-red-400 font-bold">${s.incorrectCount || 0}</span>
                    </td>
                    <td class="text-center font-bold text-white">${score} <span class="text-xs text-gray-500">/${maxScore}</span></td>
                    <td class="text-center">
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold ${scorePct >= 60 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-400'}">
                            ${scorePct}%
                        </span>
                    </td>
                    <td class="text-center">
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold ${acc >= 70 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}">
                            ${acc}%
                        </span>
                    </td>
                `;
                saTestReportTbody.appendChild(tr);
            });
        }
    }
});

// =============================================================
// Live Room P2P Logic (PeerJS)
// =============================================================

let isLiveMode = false;
let isHost = false;
let hostParticipating = false;
let livePeer = null;
let liveConn = null;
let liveConnections = []; // For Host
let participants = []; // Array of { id, name, score, accuracy, ready }

// UI Elements
const createLiveRoomBtn = document.getElementById('createLiveRoomBtn');
const liveLobbyContainer = document.getElementById('liveLobbyContainer');
const liveRoomLinkText = document.getElementById('liveRoomLinkText');
const copyLiveLinkBtn = document.getElementById('copyLiveLinkBtn');
const startLiveTestBtn = document.getElementById('startLiveTestBtn');
const participantsList = document.getElementById('participantsList');
const participantCount = document.getElementById('participantCount');
const noParticipantsText = document.getElementById('noParticipantsText');

const liveJoinContainer = document.getElementById('liveJoinContainer');
const participantNameInput = document.getElementById('participantNameInput');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const joinStatusText = document.getElementById('joinStatusText');
const waitingForHostContainer = document.getElementById('waitingForHostContainer');

const leaderboardModal = document.getElementById('leaderboardModal');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
const leaderboardTbody = document.getElementById('leaderboardTbody');
const exitLiveTestBtn = document.getElementById('exitLiveTestBtn');

function initPeerJS() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    
    if (roomParam) {
        isLiveMode = true;
        isHost = false;
        
        // Hide standard containers
        document.getElementById('uploadContainer').classList.add('hidden');
        document.getElementById('configContainer').classList.add('hidden');
        document.getElementById('practiceSetupContainer').classList.add('hidden');
        document.getElementById('historyContainer').classList.add('hidden');
        
        liveJoinContainer.classList.remove('hidden');
        
        joinRoomBtn.addEventListener('click', () => {
            const name = participantNameInput.value.trim();
            if (!name) return alert("Please enter your name");
            
            joinStatusText.classList.remove('hidden');
            joinRoomBtn.disabled = true;
            
            livePeer = new Peer(); 
            livePeer.on('open', (id) => {
                liveConn = livePeer.connect(roomParam);
                
                liveConn.on('open', () => {
                    joinStatusText.textContent = "Connected! Receiving test data (this might take a few seconds)...";
                    liveJoinContainer.classList.add('hidden');
                    waitingForHostContainer.classList.remove('hidden');
                    waitingForHostContainer.querySelector('p').textContent = "Downloading test data from host...";
                    
                    liveConn.send({ type: 'JOIN', name });
                });
                
                liveConn.on('data', handleParticipantData);
                
                liveConn.on('error', (err) => {
                    alert("Connection error: " + err);
                });
            });
            
            livePeer.on('error', (err) => {
                alert("PeerJS error: " + err.type);
                joinRoomBtn.disabled = false;
                joinStatusText.classList.add('hidden');
            });
        });
    }
}

const homeCreateLiveRoomBtn = document.getElementById('homeCreateLiveRoomBtn');

if (homeCreateLiveRoomBtn) {
    homeCreateLiveRoomBtn.addEventListener('click', () => {
        isLiveMode = true;
        isHost = true;
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.click();
    });
}

if (createLiveRoomBtn) {
    createLiveRoomBtn.addEventListener('click', () => {
        isLiveMode = true;
        isHost = true;
        
        document.getElementById('practiceSetupContainer').classList.add('hidden');
        liveLobbyContainer.classList.remove('hidden');
        
        const randomId = 'pdftopractice-' + Math.random().toString(36).substr(2, 9);
        livePeer = new Peer(randomId);
        
        livePeer.on('open', (id) => {
            const link = `${window.location.origin}/?room=${id}`;
            liveRoomLinkText.textContent = link;
            
            copyLiveLinkBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(link);
                copyLiveLinkBtn.innerHTML = '<span class="text-sm font-bold">Copied!</span>';
                setTimeout(() => {
                    copyLiveLinkBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>';
                }, 2000);
            });
        });
        
        livePeer.on('connection', (conn) => {
            conn.on('data', (data) => handleHostData(conn, data));
            
            conn.on('close', () => {
                participants = participants.filter(p => p.id !== conn.peer);
                liveConnections = liveConnections.filter(c => c.peer !== conn.peer);
                updateLobbyUI();
            });
        });
    });
}

function handleHostData(conn, data) {
    if (data.type === 'JOIN') {
        participants.push({ id: conn.peer, name: data.name, score: null, accuracy: null, ready: false });
        liveConnections.push(conn);
        updateLobbyUI();
        
        // Send data immediately to this new participant
        conn.send({
            type: 'TEST_DATA',
            extractedImages: extractedImages,
            extractedAnswerPages: extractedAnswerPages
        });
    } else if (data.type === 'READY') {
        const p = participants.find(x => x.id === conn.peer);
        if (p) {
            p.ready = true;
            updateLobbyUI();
        }
    } else if (data.type === 'SUBMIT_SCORE') {
        const p = participants.find(x => x.id === conn.peer);
        if (p) {
            p.score = data.score;
            p.accuracy = data.accuracy;
            checkAllScoresSubmitted();
        }
    }
}

function updateLobbyUI() {
    participantCount.textContent = participants.length;
    if (participants.length > 0) {
        noParticipantsText.classList.add('hidden');
    } else {
        noParticipantsText.classList.remove('hidden');
    }
    
    participantsList.innerHTML = participants.map(p => `
        <div class="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-full text-sm font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-2">
            ${p.name}
            ${p.ready ? '<span class="text-green-600 dark:text-green-400">✓</span>' : '<span class="text-yellow-600 dark:text-yellow-400">⟳</span>'}
        </div>
    `).join('');
    
    const allReady = participants.length > 0 && participants.every(p => p.ready);
    startLiveTestBtn.disabled = !allReady;
    if (participants.length > 0 && !allReady) {
        startLiveTestBtn.textContent = "Waiting for participants to receive data...";
    } else if (allReady) {
        startLiveTestBtn.textContent = "Start Test for Everyone";
    } else {
        startLiveTestBtn.textContent = "Start Test for Everyone";
    }
}

if (startLiveTestBtn) {
    startLiveTestBtn.addEventListener('click', () => {
        if (participants.length === 0 || !participants.every(p => p.ready)) return;
        
        const hostName = prompt("Do you want to participate in the test too?\nEnter your name to join, or click Cancel/leave blank to only spectate as Host.");
        
        const totalMins = parseInt(document.getElementById('totalTimeInput').value) || 60;
        
        const payload = {
            type: 'START_TEST',
            timeLimit: totalMins * 60
        };
        
        liveConnections.forEach(conn => conn.send(payload));
        
        if (hostName && hostName.trim() !== '') {
            hostParticipating = true;
            participants.push({ id: 'host', name: hostName.trim(), score: null, accuracy: null, ready: true });
            
            // Start the test for Host locally
            startLocalLiveTest(totalMins * 60);
        } else {
            // Spectator mode
            liveLobbyContainer.innerHTML = `
                <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Test in Progress...</h2>
                <div class="animate-pulse flex flex-col items-center mt-10">
                    <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p class="text-gray-500">Waiting for participants to submit their scores.</p>
                </div>
            `;
        }
    });
}

function handleParticipantData(data) {
    if (data.type === 'TEST_DATA') {
        extractedImages = data.extractedImages;
        extractedAnswerPages = data.extractedAnswerPages;
        
        waitingForHostContainer.querySelector('p').textContent = "Data received! Waiting for host to start the test...";
        liveConn.send({ type: 'READY' });
    } else if (data.type === 'START_TEST') {
        waitingForHostContainer.classList.add('hidden');
        startLocalLiveTest(data.timeLimit);
    } else if (data.type === 'LEADERBOARD') {
        renderLeaderboard(data.leaderboard);
    }
}

function startLocalLiveTest(timeLimitSeconds) {
    if (document.getElementById('liveLobbyContainer')) document.getElementById('liveLobbyContainer').classList.add('hidden');
    
    practiceState = {
        activeIndices: Array.from({length: extractedImages.length}, (_, i) => i),
        currentIndex: 0,
        answers: {},
        bookmarks: {},
        theme: 'nta', // Force NTA Mode
        totalSecondsRemaining: timeLimitSeconds,
        scorePerQ: 4,
        negativeMarking: true
    };
    
    // Initialize stats
    practiceState.stats = extractedImages.map((q, idx) => {
        let ex = 'Exercise 1';
        if (q.label && q.label.includes(' - ')) ex = q.label.split(' - ')[0];
        return {
            index: idx,
            timeSpent: 0,
            attempted: false,
            evaluation: null, // 'correct' | 'incorrect'
            ntaStatus: 'not_visited',
            exercise: ex
        };
    });
    
    document.getElementById('ntaInterfaceContainer').classList.remove('hidden');
    
    const uniqueExercises = [...new Set(practiceState.activeIndices.map(idx => {
        const q = extractedImages[idx];
        if (q.label && q.label.includes(' - ')) return q.label.split(' - ')[0];
        return 'Exercise 1';
    }))];
    
    buildNtaTabs(uniqueExercises);
    buildNtaPalette();
    renderNtaQuestion(practiceState.currentIndex);
    
    document.getElementById('totalTimeInput').value = Math.ceil(timeLimitSeconds / 60);
    const totalRadio = document.querySelector('input[name="timingMode"][value="total"]');
    if(totalRadio) totalRadio.checked = true;
    
    if (typeof currentSessionId !== 'undefined') currentSessionId = Date.now();
    
    startTotalTimer();
}

// Intercept NTA Submit
const originalShowSummary = window.showSummary;
window.showSummary = function() {
    originalShowSummary();
    
    if (isLiveMode) {
        const scoreStr = document.getElementById('summaryScore').textContent;
        const accuracyStr = document.getElementById('summaryAccuracy').textContent;
        
        if (!isHost) {
            liveConn.send({
                type: 'SUBMIT_SCORE',
                score: parseFloat(scoreStr) || 0,
                accuracy: parseFloat(accuracyStr) || 0
            });
        } else if (hostParticipating) {
            const hostP = participants.find(x => x.id === 'host');
            if (hostP) {
                hostP.score = parseFloat(scoreStr) || 0;
                hostP.accuracy = parseFloat(accuracyStr) || 0;
                checkAllScoresSubmitted();
            }
        }
        
        document.getElementById('summaryContainer').innerHTML = `
            <div class="text-center p-12">
                <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-4">Score Submitted!</h2>
                <div class="animate-pulse flex flex-col items-center mt-6">
                    <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p class="text-gray-500">Waiting for other participants to finish...</p>
                </div>
            </div>
        `;
    }
};

function checkAllScoresSubmitted() {
    const allSubmitted = participants.every(p => p.score !== null);
    if (allSubmitted && participants.length > 0) {
        participants.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.accuracy - a.accuracy;
        });
        
        let rank = 1;
        participants.forEach((p, index) => {
            if (index > 0 && p.score === participants[index-1].score && p.accuracy === participants[index-1].accuracy) {
                p.rank = participants[index-1].rank;
            } else {
                p.rank = rank;
            }
            rank++;
        });
        
        const payload = {
            type: 'LEADERBOARD',
            leaderboard: participants
        };
        liveConnections.forEach(conn => conn.send(payload));
        
        renderLeaderboard(participants);
    }
}

function renderLeaderboard(leaderboardData) {
    document.getElementById('ntaInterfaceContainer').classList.add('hidden');
    document.getElementById('summaryContainer').classList.add('hidden');
    if (document.getElementById('liveLobbyContainer')) {
        document.getElementById('liveLobbyContainer').classList.add('hidden');
    }
    
    leaderboardModal.classList.remove('hidden');
    leaderboardTbody.innerHTML = leaderboardData.map((p, i) => `
        <tr class="hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
            <td class="py-4 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                ${p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : '#' + p.rank}
            </td>
            <td class="py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">
                ${p.name} ${p.id === 'host' ? '(Host)' : ''}
            </td>
            <td class="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-right">
                ${p.score}
            </td>
            <td class="py-4 px-4 text-gray-500 dark:text-gray-400 text-right">
                ${p.accuracy}%
            </td>
        </tr>
    `).join('');
}

[closeLeaderboardBtn, exitLiveTestBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', () => {
        window.location.href = '/'; 
    });
});

window.addEventListener('DOMContentLoaded', initPeerJS);

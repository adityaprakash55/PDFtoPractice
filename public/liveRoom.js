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
    
    const hostHtml = `
          <div class="bg-[#18181b] border border-blue-900/40 rounded-xl p-4 flex flex-col items-center justify-center gap-3 shadow-md">
              <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-900 to-black border-2 border-blue-800/50 flex items-center justify-center relative shadow-inner">
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#18181b]"></div>
              </div>
              <div class="text-center w-full">
                  <h4 class="text-white font-bold text-sm truncate w-full" title="Host">Host</h4>
                  <div class="mt-1.5 px-2 py-0.5 bg-blue-900/60 border border-blue-700/60 rounded text-[9px] font-black tracking-widest text-blue-300 uppercase inline-block">
                      HOST
                  </div>
              </div>
          </div>
      `;
      
      participantsList.innerHTML = hostHtml + participants.map(p => `
          <div class="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex flex-col items-center justify-center gap-3 shadow-md">
              <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-900 to-black border-2 border-blue-800/50 flex items-center justify-center relative shadow-inner">
                  ${p.ready ? '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#18181b]"></div>' : '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-[#18181b] animate-pulse"></div>'}
              </div>
              <div class="text-center w-full">
                  <h4 class="text-white font-bold text-sm truncate w-full" title="${p.name}">${p.name}</h4>
                  <div class="mt-1.5 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-[9px] font-black tracking-widest text-gray-400 uppercase inline-block">
                      MEMBER
                  </div>
              </div>
          </div>
      `).join('');
    
    const allReady = participants.length > 0 && participants.every(p => p.ready);
    startLiveTestBtn.disabled = !allReady;
    if (participants.length > 0 && !allReady) {
        startLiveTestBtn.textContent = "Waiting for participants to receive data...";
    } else if (allReady) {
        startLiveTestBtn.textContent = "Start Practice for Everyone";
    } else {
        startLiveTestBtn.textContent = "Start Practice for Everyone";
    }
}

if (startLiveTestBtn) {
    startLiveTestBtn.addEventListener('click', () => {
        if (participants.length === 0 || !participants.every(p => p.ready)) return;
        
        const hostName = prompt("Do you want to participate in the practice too?\nEnter your name to join, or click Cancel/leave blank to only spectate as Host.");
        
        const totalMins = parseInt(document.getElementById('totalTimeInput').value) || 60;
        
        const payload = {
            type: 'START_TEST',
            timeLimit: totalMins * 60
        };
        
        liveConnections.forEach(conn => conn.send(payload));
        
        if (hostName && hostName.trim() !== '') {
            hostParticipating = true;
            participants.push({ id: 'host', name: hostName.trim(), score: null, accuracy: null, ready: true });
            
            // Start the practice for Host locally (show instructions first)
            showLiveInstructions(totalMins * 60);
        } else {
            // Spectator mode
            liveLobbyContainer.innerHTML = `
                <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Practice in Progress...</h2>
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
        
        waitingForHostContainer.querySelector('p').textContent = "Data received! Waiting for host to start the practice...";
        liveConn.send({ type: 'READY' });
    } else if (data.type === 'START_TEST') {
        waitingForHostContainer.classList.add('hidden');
        showLiveInstructions(data.timeLimit);
    } else if (data.type === 'LEADERBOARD') {
        renderLeaderboard(data.leaderboard);
    }
}

function showLiveInstructions(timeLimitSeconds) {
    if (document.getElementById('liveLobbyContainer')) document.getElementById('liveLobbyContainer').classList.add('hidden');
    if (document.getElementById('waitingForHostContainer')) document.getElementById('waitingForHostContainer').classList.add('hidden');
    
    const instructionsContainer = document.getElementById('liveInstructionsContainer');
    if (instructionsContainer) {
        instructionsContainer.classList.remove('hidden');
        
        document.getElementById('instructionsTime').textContent = Math.ceil(timeLimitSeconds / 60);
        document.getElementById('instructionsQuestions').textContent = extractedImages.length;
        
        const checkbox = document.getElementById('instructionsCheckbox');
        const beginBtn = document.getElementById('instructionsBeginBtn');
        
        checkbox.addEventListener('change', (e) => {
            beginBtn.disabled = !e.target.checked;
        });
        
        beginBtn.addEventListener('click', () => {
            instructionsContainer.classList.add('hidden');
            startLocalLiveTest(timeLimitSeconds);
        });
    } else {
        // Fallback just in case
        startLocalLiveTest(timeLimitSeconds);
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
      
      const profileNameEl = document.getElementById('ntaProfileName');
      if (profileNameEl && typeof participantName !== 'undefined') {
          profileNameEl.textContent = participantName;
      }

    
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


// ==========================================
// CHAT LOGIC
// ==========================================
const liveChatForm = document.getElementById('liveChatForm');
const liveChatInput = document.getElementById('liveChatInput');
const liveChatMessages = document.getElementById('liveChatMessages');
const emptyChatPlaceholder = document.getElementById('emptyChatPlaceholder');

function addChatMessage(sender, message, isSelf = false) {
    if (emptyChatPlaceholder) emptyChatPlaceholder.style.display = 'none';
    if (!liveChatMessages) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex flex-col max-w-[85%] ${isSelf ? 'self-end' : 'self-start'}`;
    
    const bubbleColor = isSelf ? 'bg-blue-600 text-white' : 'bg-[#27272a] text-gray-200';
    const borderRadius = isSelf ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm';
    
    msgDiv.innerHTML = `
        <span class="text-xs text-gray-500 mb-1 px-1 ${isSelf ? 'text-right' : 'text-left'}">${sender}</span>
        <div class="px-3 py-2 text-sm shadow-sm ${bubbleColor} ${borderRadius}">
            ${message}
        </div>
    `;
    
    liveChatMessages.appendChild(msgDiv);
    liveChatMessages.scrollTop = liveChatMessages.scrollHeight;
}

if (liveChatForm) {
    liveChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = liveChatInput.value.trim();
        if (!msg) return;
        
        // Add locally
        addChatMessage('You', msg, true);
        liveChatInput.value = '';
        
        // Broadcast to peers
        const chatData = { type: 'chat', sender: isHost ? 'Host' : participantName, message: msg };
        if (isHost) {
            broadcastToPeers(chatData);
        } else if (hostConnection) {
            hostConnection.send(chatData);
        }
    });
}

// Modify existing data handlers to process chat messages
const originalHandleData = window.handlePeerData;
window.handlePeerData = function(conn, data) {
    if (data && data.type === 'chat') {
        addChatMessage(data.sender, data.message, false);
        // If host, forward to other peers
        if (isHost) {
            participants.forEach(p => {
                if (p.conn !== conn) p.conn.send(data);
            });
        }
        return; // Don't process further if it's just chat
    }
    
    // Process original logic
    if (originalHandleData) originalHandleData(conn, data);
};

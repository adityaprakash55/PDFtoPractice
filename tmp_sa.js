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
                saHistoricalList.innerHTML = '<div class="text-center text-gray-500 py-8">No tests recorded yet. Start practicing!</div>';
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
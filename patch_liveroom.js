const fs = require('fs');
let js = fs.readFileSync('public/liveRoom.js', 'utf8');

js = js.replace(/liveJoinContainer\.classList\.remove\('hidden'\);/g, `liveJoinContainer.classList.remove('hidden');
            const sb1 = document.getElementById('landingSidebar');
            if(sb1) { sb1.classList.remove('md:flex'); sb1.classList.add('hidden', '!hidden'); }
            document.querySelectorAll('.dash-view').forEach(v => v.classList.add('hidden'));`);

js = js.replace(/liveLobbyContainer\.classList\.remove\('hidden'\);/g, `liveLobbyContainer.classList.remove('hidden');
            const sb2 = document.getElementById('landingSidebar');
            if(sb2) { sb2.classList.remove('md:flex'); sb2.classList.add('hidden', '!hidden'); }
            document.querySelectorAll('.dash-view').forEach(v => v.classList.add('hidden'));`);

fs.writeFileSync('public/liveRoom.js', js);
console.log('Patched liveRoom.js to hide sidebar');

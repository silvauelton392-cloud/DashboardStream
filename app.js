// Stream ThomKhali — simulação local de dashboard de stream
const $ = (s) => document.querySelector(s);

const state = {
  live: true,
  viewers: 4218,
  peak: 5102,
  followers: 8432,
  subs: 612,
  giftSubs: 24,
  revenue: 486.20,
  messages: 3914,
  chatPerMin: 12,
  uptimeSec: 2 * 3600 + 14 * 60 + 36,
  playing: true,
  muted: false,
  eventsPaused: false,
  history: [],
  chatHistory: [],
};

// seed history
for (let i = 0; i < 60; i++) {
  state.history.push(3200 + Math.sin(i / 6) * 500 + Math.random() * 600);
}

const fmt = (n) => n.toLocaleString('pt-BR');
const money = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function toast(msg) {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

// ---------- Tabs ----------
document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    $('#tab-' + btn.dataset.tab).classList.add('active');
    closeSidebar();
  });
});

// ---------- Sidebar mobile ----------
const sidebar = $('#sidebar'), scrim = $('#scrim');
function closeSidebar() { sidebar.classList.remove('open'); scrim.classList.remove('show'); }
$('#menuBtn').onclick = () => { sidebar.classList.add('open'); scrim.classList.add('show'); };
$('#sidebarClose').onclick = closeSidebar;
scrim.onclick = closeSidebar;

// ---------- Player canvas (fake gameplay) ----------
const canvas = $('#streamCanvas');
const ctx = canvas.getContext('2d');
let t = 0;
function drawStream() {
  const w = canvas.width, h = canvas.height;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#1a0f33'); g.addColorStop(0.5, '#0d1b3d'); g.addColorStop(1, '#08131f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // grid
  ctx.strokeStyle = 'rgba(145,70,255,.18)'; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  // moving orbs
  for (let i = 0; i < 6; i++) {
    const x = (Math.sin(t / 40 + i * 1.7) * 0.5 + 0.5) * w;
    const y = (Math.cos(t / 55 + i * 1.1) * 0.5 + 0.5) * h;
    const r = 26 + (i * 12) % 40;
    const hue = [265, 200, 320, 180, 20, 140][i];
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    rg.addColorStop(0, `hsla(${hue},90%,60%,.55)`); rg.addColorStop(1, 'transparent');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, 7); ctx.fill();
    ctx.fillStyle = `hsl(${hue},90%,65%)`; ctx.beginPath(); ctx.arc(x, y, r * 0.35, 0, 7); ctx.fill();
  }
  // HUD fake
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(16, 16, 300, 54);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px system-ui';
  ctx.fillText(state.live ? '● RANKED — 12 x 9' : 'OFFLINE', 30, 40);
  ctx.fillStyle = '#aaa'; ctx.font = '14px system-ui';
  ctx.fillText(state.playing ? 'Simulação de gameplay ao vivo' : 'Pausado', 30, 60);
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(w - 210, 16, 194, 44);
  ctx.fillStyle = '#3ddc84'; ctx.font = 'bold 16px system-ui';
  ctx.fillText('60 FPS  •  8000k', w - 196, 43);
  if (state.live) t++;
  requestAnimationFrame(drawStream);
}
drawStream();

function setPlaying(p) {
  state.playing = p;
  $('#playBtn').textContent = p ? '⏸' : '▶';
  $('#playBig').textContent = p ? '⏸' : '▶';
}
$('#playBtn').onclick = () => setPlaying(!state.playing);
$('#playBig').onclick = () => setPlaying(!state.playing);
$('#muteBtn').onclick = (e) => {
  state.muted = !state.muted;
  e.target.textContent = state.muted ? '🔇' : '🔊';
  toast(state.muted ? 'Áudio da prévia silenciado.' : 'Áudio da prévia ativado.');
};
$('#volumeRange').oninput = (e) => { if (e.target.value == 0) { state.muted = true; $('#muteBtn').textContent = '🔇'; } };
$('#qualityBtn').onclick = (e) => {
  const opts = ['1080p', '720p', '480p', '360p', 'Auto'];
  const cur = opts.indexOf(e.target.textContent.replace(' ▾', ''));
  e.target.textContent = opts[(cur + 1) % opts.length] + ' ▾';
};
$('#theaterBtn').onclick = () => document.querySelector('.player-card').classList.toggle('span2');
$('#clipBtn').onclick = createClip;
$('#clipTopBtn').onclick = createClip;
function createClip() {
  toast('✂ Clipe criado! “jogada_insana_' + Math.floor(Math.random() * 900 + 100) + '.mp4” salvo em Conteúdo.');
  addEvent('clip', 'Clipe criado', '30s salvos · 1080p60');
}

// ---------- Live toggle ----------
function setLive(on) {
  state.live = on;
  $('#liveToggleTop').textContent = on ? '⏹ Encerrar' : '● Iniciar live';
  $('#liveToggleTop').className = on ? 'btn danger' : 'btn primary';
  $('#offlineCover').classList.toggle('hidden', on);
  $('#sidebarLiveBadge').textContent = on ? 'AO VIVO' : 'OFFLINE';
  $('#sidebarLiveBadge').classList.toggle('off', !on);
  $('#healthLabel').textContent = on ? 'Excelente' : 'Offline';
  $('#healthSub').textContent = on ? '1080p60 · 8.000 kbps · 0.4% drop' : 'sem sinal de ingestão';
  $('#healthDot').className = 'health-dot ' + (on ? 'ok' : '');
  toast(on ? '● Você está AO VIVO! Boa stream!' : 'Live encerrada. Resumo salvo em Analytics.');
}
$('#liveToggleTop').onclick = () => setLive(!state.live);
$('#goLiveBtn').onclick = () => setLive(true);
document.addEventListener('keydown', (e) => {
  if ((e.key === 'g' || e.key === 'G') && document.activeElement.tagName !== 'INPUT') setLive(!state.live);
});

// ---------- Quick actions ----------
document.querySelectorAll('.quick').forEach((b) => b.onclick = () => { toast('✅ ' + b.dataset.cmd + ' executado.'); addEvent('mod', b.dataset.cmd, 'agora mesmo'); });
$('#quickActionBtn').onclick = () => $('#quickBackdrop').classList.remove('hidden');
$('#quickClose').onclick = () => $('#quickBackdrop').classList.add('hidden');
$('#quickBackdrop').onclick = (e) => { if (e.target.id === 'quickBackdrop') e.target.classList.add('hidden'); };

// ---------- Edit modal ----------
const modal = $('#modalBackdrop');
$('#editStreamBtn').onclick = () => { $('#mTitle').value = $('#streamTitle').textContent; $('#mCategory').value = $('#categoryPill').textContent; modal.classList.remove('hidden'); };
$('#modalCancel').onclick = () => modal.classList.add('hidden');
modal.onclick = (e) => { if (e.target.id === 'modalBackdrop') modal.classList.add('hidden'); };
$('#modalSave').onclick = () => {
  $('#streamTitle').textContent = $('#mTitle').value || $('#streamTitle').textContent;
  $('#categoryPill').textContent = $('#mCategory').value;
  modal.classList.add('hidden');
  toast('✅ Informações da transmissão atualizadas!');
};
$('#saveInfoBtn').onclick = () => {
  $('#streamTitle').textContent = $('#fTitle').value;
  $('#categoryPill').textContent = $('#fCategory').value;
  toast('✅ Informações salvas e publicadas no canal.');
};
$('#resetInfoBtn').onclick = () => toast('Alterações descartadas.');

// ---------- Chat ----------
const users = ['pedrin_gg', 'mari.exe', 'SrLobo', 'juuhfps', 'capivaraTV', 'rafaFPS', 'biazinha', 'darkzin_07', 'tioWard', 'lendaDoChat', 'xX_sniper_Xx', 'NerdBot'];
const colors = ['#ff6b9d', '#00d2ff', '#ffb300', '#3ddc84', '#bf94ff', '#ff7b54', '#5affd4', '#ff4d4d'];
const msgs = ['GG!', 'que mira é essa??', 'clipaaa', 'alguém mais travando ou é só eu?', 'essa ranked tá insana', 'THOM MITOU DEMAIS', 'salve pra Fortaleza!', '!sorteio', 'primeira vez no chat, amo a live 💜', 'que sensibilidade você usa?', 'BORA que o diamante vem hoje', 'esse clutch foi cinema', 'mod, esse cara tá floodando', 'quando sai o próximo sorteio?', 'Kkkkkkk o inimigo nem viu', 'voltei, perdi alguma coisa?'];
const userColor = (u) => colors[u.length % colors.length];

function addChat(user, text, badge) {
  const list = $('#chatList');
  const div = document.createElement('div');
  div.className = 'chat-msg';
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  div.innerHTML = `<span class="user" style="color:${userColor(user)}">${user}</span>${badge ? `<span class="badge ${badge.toLowerCase()}">${badge}</span>` : ''}<span></span><span class="t">${time}</span>`;
  div.querySelector('span:nth-child(3)').textContent = text;
  list.appendChild(div);
  while (list.children.length > 60) list.firstChild.remove();
  list.scrollTop = list.scrollHeight;
  state.messages++;
  state.chatHistory.push(1);
}
[['mari.exe', 'CHEGUEI! como tá o placar?', 'SUB'], ['SrLobo', 'esse clutch vai pro clipe, certeza', null], ['NerdBot', '🎁 Sorteio ativo! Digite !sorteio para participar (12 gift subs em jogo)', 'BOT']].forEach(([u, m, b]) => addChat(u, m, b));

function botChat() {
  if (!state.live) return;
  if (Math.random() < 0.75) {
    const u = users[Math.floor(Math.random() * users.length)];
    const m = msgs[Math.floor(Math.random() * msgs.length)];
    const badge = u === 'NerdBot' ? 'BOT' : Math.random() < 0.18 ? 'SUB' : Math.random() < 0.08 ? 'MOD' : Math.random() < 0.05 ? 'VIP' : null;
    addChat(u, m, badge);
  }
}
$('#chatSend').onclick = sendChat;
$('#chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChat(); });
function sendChat() {
  const inp = $('#chatInput');
  const v = inp.value.trim();
  if (!v) return;
  if (v.startsWith('/')) { toast('Comando de moderação executado: ' + v); logMod('Você', v); }
  else addChat('ThomKhali', v, 'MOD');
  inp.value = '';
}
$('#clearBtn').onclick = () => { $('#chatList').innerHTML = ''; toast('🧹 Chat limpo.'); };
$('#slowBtn').onclick = () => toast('🐢 Modo lento ativado: 5s entre mensagens.');
$('#emoteBtn').onclick = () => { $('#chatInput').value += ' 💜🔥GG '; $('#chatInput').focus(); };

// ---------- Events ----------
const eventPool = [
  ['follow', 'e-follow', '➕', 'Novo seguidor', ''],
  ['sub', 'e-sub', '★', 'Novo SUB', ''],
  ['bits', 'e-bits', '💎', 'Bits + donate', ''],
  ['raid', 'e-raid', '🚀', 'Raid recebida', ''],
];
const names = ['kaiquefps', 'dudinha_lol', 'felipeZera', 'thayfps', 'ogroTV', 'lucas.exe', 'sophia_gg', 'vitorUchiha', 'camila_plays', 'rafa_val'];
function randomEvent() {
  if (!state.live || state.eventsPaused) return;
  const [type, cls, ico, title] = eventPool[Math.floor(Math.random() * eventPool.length)];
  const n = names[Math.floor(Math.random() * names.length)];
  let desc = '';
  if (type === 'follow') { desc = n + ' começou a seguir'; state.followers++; }
  if (type === 'sub') { desc = n + ' se inscreveu (Tier 1 · 3 meses)'; state.subs++; state.revenue += 12.9; }
  if (type === 'bits') { const b = [100, 200, 500, 1000][Math.floor(Math.random() * 4)]; desc = n + ' mandou ' + b + ' bits'; state.revenue += b * 0.03; }
  if (type === 'raid') { const v = Math.floor(Math.random() * 300 + 40); desc = 'Raid de ' + n + ' com ' + v + ' viewers'; state.viewers += v; }
  addEvent(type, title, desc);
  updateStats();
}
function addEvent(type, title, desc) {
  const icons = { follow: ['e-follow', '➕'], sub: ['e-sub', '★'], bits: ['e-bits', '💎'], raid: ['e-raid', '🚀'], clip: ['e-sub', '✂'], mod: ['e-mod', '🛡'] };
  const [cls, ico] = icons[type] || icons.follow;
  const li = document.createElement('li');
  li.innerHTML = `<div class="e-ico ${cls}">${ico}</div><div><strong></strong><small></small></div>`;
  li.querySelector('strong').textContent = title;
  li.querySelector('small').textContent = desc + ' · agora';
  const list = $('#eventsList');
  list.prepend(li);
  while (list.children.length > 25) list.lastChild.remove();
}
function logMod(user, action) {
  const li = document.createElement('li');
  li.innerHTML = `<div class="e-ico e-mod">🛡</div><div><strong></strong><small>agora</small></div>`;
  li.querySelector('strong').textContent = user + ' → ' + action;
  $('#modLog').prepend(li);
}
$('#pauseEventsBtn').onclick = (e) => {
  state.eventsPaused = !state.eventsPaused;
  e.target.textContent = state.eventsPaused ? '▶ Retomar' : '⏸ Pausar';
};
$('#modApply').onclick = () => {
  const u = $('#modUser').value.trim() || 'usuario_troll123';
  logMod(u, $('#modAction').value);
  toast('🛡 Moderação: ' + u + ' → ' + $('#modAction').value);
};
// seed events
addEvent('follow', 'Novo seguidor', 'kaiquefps começou a seguir · agora');
addEvent('sub', 'Novo SUB', 'dudinha_lol se inscreveu (Tier 1) · agora');
addEvent('bits', 'Bits + donate', 'ogroTV mandou 500 bits · agora');
addEvent('raid', 'Raid recebida', 'Raid de tioWard com 132 viewers · agora');

// ---------- Stats loop ----------
function updateStats() {
  $('#statViewers').textContent = fmt(state.viewers);
  $('#bannerViewers').textContent = fmt(state.viewers);
  $('#statFollowers').textContent = fmt(state.followers);
  $('#statSubs').textContent = fmt(state.subs);
  $('#statGiftSubs').textContent = state.giftSubs;
  $('#statRevenue').textContent = money(state.revenue);
  $('#statMessages').textContent = fmt(state.messages);
  $('#goalFollowersLabel').textContent = fmt(state.followers) + ' / 10.000';
  $('#goalFollowersBar').style.width = Math.min(100, state.followers / 100) + '%';
  $('#goalSubsLabel').textContent = state.subs + ' / 800';
  $('#goalSubsBar').style.width = Math.min(100, state.subs / 8) + '%';
  $('#chatCount').textContent = (state.messages / 1000).toFixed(1).replace('.', ',') + ' mil';
  $('#navChatCount').textContent = state.chatPerMin;
}
setInterval(() => {
  if (state.live) {
    state.viewers = Math.max(800, state.viewers + Math.floor((Math.random() - 0.45) * 120));
    state.peak = Math.max(state.peak, state.viewers);
    $('#statPeak').textContent = fmt(state.peak);
    state.history.push(state.viewers);
    if (state.history.length > 60) state.history.shift();
    state.uptimeSec++;
    state.chatPerMin = 8 + Math.floor(Math.random() * 10);
    $('#chatRate').textContent = state.chatPerMin + '/min';
drawMainChart();
  }
  const h = String(Math.floor(state.uptimeSec / 3600)).padStart(2, '0');
  const m = String(Math.floor(state.uptimeSec % 3600 / 60)).padStart(2, '0');
  const s = String(state.uptimeSec % 60).padStart(2, '0');
  $('#uptimeLabel').textContent = `${h}:${m}:${s}`;
  $('#timeNow').textContent = `${h}:${m}:${s}`;
  updateStats();
}, 2000);
setInterval(botChat, 2600);
setInterval(randomEvent, 7000);

// ---------- Charts (canvas, sem dependências) ----------
function setupCanvas(id) {
  const c = $(id);
  const dpr = window.devicePixelRatio || 1;
  const r = c.getBoundingClientRect();
  c.width = Math.max(300, r.width) * dpr;
  c.height = (parseInt(c.getAttribute('height')) || 220) * dpr;
  const x = c.getContext('2d');
  x.scale(dpr, dpr);
  return [c, x, r.width || 600, parseInt(c.getAttribute('height')) || 220];
}
function drawMainChart() {
  const c = $('#viewersChart');
  const dpr = window.devicePixelRatio || 1;
  const W = c.clientWidth || 600, H = 220;
  if (c.width !== W * dpr) { c.width = W * dpr; c.height = H * dpr; }
  const x = c.getContext('2d');
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.clearRect(0, 0, W, H);
  const d = state.history;
  const max = Math.max(...d) * 1.15, min = Math.min(...d) * 0.85;
  const px = (i) => (i / (d.length - 1)) * (W - 8) + 4;
  const py = (v) => H - 14 - ((v - min) / (max - min)) * (H - 40);
  // grid
  x.strokeStyle = '#262633'; x.fillStyle = '#777'; x.font = '11px system-ui';
  for (let gline = 0; gline < 4; gline++) {
    const y = 10 + gline * ((H - 30) / 3);
    x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke();
  }
  // area
  const grad = x.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(145,70,255,.45)'); grad.addColorStop(1, 'rgba(145,70,255,0)');
  x.beginPath();
  d.forEach((v, i) => i ? x.lineTo(px(i), py(v)) : x.moveTo(px(i), py(v)));
  x.strokeStyle = '#9146ff'; x.lineWidth = 2.5; x.stroke();
  x.lineTo(px(d.length - 1), H); x.lineTo(px(0), H); x.closePath();
  x.fillStyle = grad; x.fill();
  const avg = Math.round(d.reduce((a, b) => a + b, 0) / d.length);
  $('#avgViewers').textContent = fmt(avg);
}
function barChart(id, values, color) {
  const c = $(id);
  const dpr = window.devicePixelRatio || 1;
  const W = c.clientWidth || 300, H = 200;
  c.width = W * dpr; c.height = H * dpr;
  const x = c.getContext('2d');
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.clearRect(0, 0, W, H);
  const max = Math.max(...values);
  const bw = (W - 20) / values.length;
  values.forEach((v, i) => {
    const h = (v / max) * (H - 40);
    x.fillStyle = color;
    x.beginPath();
    x.roundRect(10 + i * bw + 3, H - 20 - h, bw - 6, h, 6);
    x.fill();
  });
}
document.querySelectorAll('.range').forEach((b) => b.onclick = () => {
  document.querySelectorAll('.range').forEach((x) => x.classList.remove('active'));
  b.classList.add('active');
  for (let i = 0; i < state.history.length; i++) state.history[i] = 2500 + Math.random() * 2500;
drawMainChart();
  toast('📊 Período alterado para: ' + b.textContent);
});

// ---------- Search commands ----------
$('#searchInput').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const v = e.target.value.trim();
  if (!v) return;
  if (v.startsWith('/')) { toast('Comando executado: ' + v); logMod('Você', v); }
  else toast('🔍 Buscando por "' + v + '"…');
  e.target.value = '';
});

// ---------- Content tab ----------
const clips = [
  ['🤯', 'Clutch 1v4 absurdo na Ascent', '12,4 mil views'],
  ['😂', 'Reação ao jumpscare + rage', '8,1 mil views'],
  ['🏆', 'Subindo pro Diamante AO VIVO', '6,7 mil views'],
  ['🎁', 'Sorteio de 10 subs — momento', '4,2 mil views'],
  ['🔥', 'Ace de Operator insano', '3,9 mil views'],
  ['💜', 'Raid gigante + hype train nv.5', '3,1 mil views'],
];
$('#clipsGrid').innerHTML = clips.map(([e, t, v]) => `<div class="card"><div class="clip-thumb">${e}</div><h3 style="margin:10px 0 4px">${t}</h3><small style="color:var(--muted)">${v} · 1080p60</small><div style="display:flex;gap:8px;margin-top:10px"><button class="mini" onclick="void 0">⬇ Baixar</button><button class="mini">📤 Compartilhar</button></div></div>`).join('');
$('#clipsTable').innerHTML = clips.slice(0, 4).map(([e, t, v], i) => `<tr><td>${e} ${t}</td><td>${v}</td><td>${[412, 288, 201, 154][i]}</td><td>+${[86, 54, 41, 22][i]}</td></tr>`).join('');

window.addEventListener('resize', () => { drawMainChart(); barChart('#trafficChart', [45, 25, 15, 10, 5], '#9146ff'); barChart('#followsChart', [12, 19, 9, 24, 18, 27, 31], '#00d2ff'); barChart('#revenueChart', [180, 240, 200, 320, 290, 410, 360], '#3ddc84'); });

// ---------- Downloads Android ----------
let dlCount = 12847;
let dlBusy = false;
function simulateDownload(ver) {
  const box = $('#dlProgress'), bar = $('#dlProgressBar'), label = $('#dlProgressLabel');
  box.classList.remove('hidden');
  if (dlBusy) return;
  dlBusy = true;
  let p = 0;
  bar.style.width = '0%'; label.textContent = '0% — ' + ver;
  const timer = setInterval(() => {
    p += 4 + Math.random() * 9;
    if (p >= 100) {
      p = 100; clearInterval(timer); dlBusy = false;
      dlCount++;
      $('#dlCount').textContent = dlCount.toLocaleString('pt-BR');
      toast('✅ Download ' + ver + ' concluído! Verifique sua pasta de downloads.');
    }
    bar.style.width = p + '%';
    label.textContent = Math.floor(p) + '% — ' + ver;
  }, 150);
}
const dlApkBtn = $('#dlApkBtn');
if (dlApkBtn) dlApkBtn.addEventListener('click', () => simulateDownload('v2.4.0'));
document.querySelectorAll('.dl-link').forEach((a) => a.addEventListener('click', () => simulateDownload(a.dataset.ver)));
const dlPlayBtn = $('#dlPlayBtn');
if (dlPlayBtn) dlPlayBtn.onclick = () => toast('▶ Abrindo Google Play: “Stream ThomKhali”… (demo)');
const dlVersionsBtn = $('#dlVersionsBtn');
if (dlVersionsBtn) dlVersionsBtn.onclick = () => $('#dlIndex').scrollIntoView({ behavior: 'smooth', block: 'center' });

drawMainChart();
barChart('#trafficChart', [45, 25, 15, 10, 5], '#9146ff');
barChart('#followsChart', [12, 19, 9, 24, 18, 27, 31], '#00d2ff');
barChart('#revenueChart', [180, 240, 200, 320, 290, 410, 360], '#3ddc84');
updateStats();
setTimeout(() => toast('💜 Bem-vindo ao Stream ThomKhali! Dados simulados em tempo real.'), 800);

// ---------- Standalone / PWA (Android) ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstall = e;
  toast('📲 Você pode instalar o app Stream ThomKhali! Toque em “Instalar app”.');
});
window.addEventListener('appinstalled', () => {
  deferredInstall = null;
  toast('✅ App instalado! Ele agora abre em modo standalone (tela cheia).');
});
const installAppBtn = $('#installAppBtn');
if (installAppBtn) installAppBtn.onclick = async () => {
  if (deferredInstall) {
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
  } else if (window.matchMedia('(display-mode: standalone)').matches) {
    toast('✅ Você já está usando o app em modo standalone!');
  } else {
    toast('📲 No Android (Chrome): menu ⋮ → “Adicionar à tela inicial” → “Instalar”. No iPhone: Compartilhar → “Adicionar à Tela de Início”.');
  }
};

// ---------- Transmitir na Twitch (OAuth + Helix) ----------
const TW_SCOPES = 'user:read:broadcast channel:read:stream_key channel:manage:broadcast';
const twGet = (k) => localStorage.getItem(k) || '';
const twSet = (k, v) => (v ? localStorage.setItem(k, v) : localStorage.removeItem(k));
const twRedirectUri = () => location.origin + location.pathname;
const twState = { user: null, pollTimer: null };

async function twApi(path, opts = {}) {
  const res = await fetch('https://api.twitch.tv/helix' + path, {
    ...opts,
    headers: {
      'Client-Id': twGet('tw_client_id'),
      Authorization: 'Bearer ' + twGet('tw_token'),
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401) {
    twDisconnect(true);
    throw new Error('Sessão expirada — conecte novamente.');
  }
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    if (/two[\s_-]?factor/i.test(t)) {
      throw new Error('Sua conta Twitch precisa ter verificação em 2 etapas (2FA) ativada. Ative em Configurações → Segurança na Twitch e tente de novo.');
    }
    throw new Error('Erro Twitch (' + res.status + '): ' + t.slice(0, 120));
  }
  return res.status === 204 ? null : res.json();
}

function twSetConn(on) {
  $('#twDisconnected').classList.toggle('hidden', on);
  $('#twConnected').classList.toggle('hidden', !on);
  $('#twConnPill').textContent = on ? 'conectado' : 'desconectado';
  $('#twHeroPill').textContent = on ? 'conectado' : 'desconectado';
}

async function twLoadProfile() {
  const data = await twApi('/users');
  twState.user = data.data[0];
  $('#twAvatar').src = twState.user.profile_image_url;
  $('#twName').textContent = twState.user.display_name;
  $('#twLogin').textContent = '@' + twState.user.login + (twState.user.broadcaster_type ? ' · ' + twState.user.broadcaster_type : '');
  $('#twHeroSub').textContent = 'Logado como ' + twState.user.display_name + '. Configure título, jogo e chave abaixo.';
  twSetConn(true);
}

function twDisconnect(silent) {
  localStorage.removeItem('tw_token');
  twState.user = null;
  if (twState.pollTimer) { clearInterval(twState.pollTimer); twState.pollTimer = null; }
  const auto = $('#twAutoPoll'); if (auto) auto.checked = false;
  twSetConn(false);
  $('#twHeroSub').textContent = 'Conecte sua conta para configurar título, jogo, chave de stream e monitorar a live.';
  $('#twHeroDot').classList.remove('on');
  $('#twLiveStatus').innerHTML = '<p class="tw-sub">Conecte a conta para ver se você está ao vivo.</p>';
  if (!silent) toast('🔌 Desconectado da Twitch.');
}

async function twRefreshStatus() {
  if (!twState.user) { toast('Conecte sua conta Twitch primeiro.'); return; }
  const box = $('#twLiveStatus');
  box.innerHTML = '<p class="tw-sub">Consultando…</p>';
  try {
    const data = await twApi('/streams?user_login=' + encodeURIComponent(twState.user.login));
    const s = data.data[0];
    if (s) {
      const started = new Date(s.started_at);
      box.innerHTML = '<div class="tw-live-box"><span class="big">🔴</span><div><strong></strong><br><small class="tw-sub"></small><br><small class="tw-sub"></small></div></div>';
      const parts = box.querySelectorAll('strong, small');
      parts[0].textContent = 'AO VIVO — ' + (s.game_name || '—');
      parts[1].textContent = s.title || '';
      parts[2].textContent = '👁 ' + fmt(s.viewer_count) + ' · desde ' + started.toLocaleTimeString('pt-BR');
      $('#twHeroDot').classList.add('on');
      $('#twHeroPill').textContent = '● AO VIVO';
    } else {
      box.innerHTML = '<div class="tw-live-box"><span class="big">⚫</span><div><strong>Offline</strong><br><small class="tw-sub">Inicie a transmissão no OBS para ficar ao vivo.</small></div></div>';
      $('#twHeroDot').classList.remove('on');
      $('#twHeroPill').textContent = 'offline';
    }
  } catch (e) { box.innerHTML = '<p class="tw-sub"></p>'; box.querySelector('p').textContent = String(e.message || e); }
}

function twInit() {
  const hint = $('#twRedirectHint');
  if (hint) hint.textContent = twRedirectUri();
  const savedId = twGet('tw_client_id');
  if (savedId) $('#twClientId').value = savedId;
  // retorno do OAuth (implicit grant: token vem no hash)
  if (location.hash.includes('access_token=')) {
    const h = new URLSearchParams(location.hash.slice(1));
    const token = h.get('access_token');
    const err = h.get('error_description') || h.get('error');
    history.replaceState(null, '', location.pathname + location.search);
    if (err) { toast('❌ Twitch: ' + err); }
    else if (token) {
      localStorage.setItem('tw_token', token);
      toast('✅ Conectado à Twitch!');
    }
  }
  if (twGet('tw_token') && twGet('tw_client_id')) {
    twLoadProfile().then(() => twRefreshStatus()).catch(() => {});
  } else twSetConn(false);

  $('#twConnectBtn').onclick = () => {
    const id = $('#twClientId').value.trim();
    if (!id) { toast('Cole o Client ID do seu app Twitch primeiro.'); return; }
    twSet('tw_client_id', id);
    const url = 'https://id.twitch.tv/oauth2/authorize?response_type=token'
      + '&client_id=' + encodeURIComponent(id)
      + '&redirect_uri=' + encodeURIComponent(twRedirectUri())
      + '&scope=' + encodeURIComponent(TW_SCOPES)
      + '&force_verify=true';
    location.href = url;
  };
  $('#twDisconnectBtn').onclick = () => twDisconnect(false);
  $('#twRefreshProfileBtn').onclick = () => twLoadProfile().then(() => toast('✅ Perfil atualizado.')).catch((e) => toast('❌ ' + e.message));
  $('#twRefreshStatusBtn').onclick = twRefreshStatus;
  $('#twAutoPoll').onchange = (e) => {
    if (twState.pollTimer) { clearInterval(twState.pollTimer); twState.pollTimer = null; }
    if (e.target.checked) {
      if (!twState.user) { e.target.checked = false; toast('Conecte sua conta Twitch primeiro.'); return; }
      twRefreshStatus();
      twState.pollTimer = setInterval(twRefreshStatus, 60000);
      toast('⏱ Monitoramento ativado (60s).');
    }
  };
  $('#twIngest').onchange = (e) => { $('#twRtmpUrl').value = e.target.value; };
  $('#twCopyRtmpBtn').onclick = async () => {
    await navigator.clipboard.writeText($('#twRtmpUrl').value).catch(() => {});
    toast('📋 URL do servidor copiada!');
  };
  $('#twToggleKeyBtn').onclick = () => {
    const k = $('#twStreamKey');
    k.type = k.type === 'password' ? 'text' : 'password';
  };
  $('#twCopyKeyBtn').onclick = async () => {
    const k = $('#twStreamKey').value;
    if (!k) { toast('Revele a chave primeiro.'); return; }
    await navigator.clipboard.writeText(k).catch(() => {});
    toast('📋 Chave de transmissão copiada! Cole no OBS.');
  };
  $('#twRevealKeyBtn').onclick = async () => {
    if (!twState.user) { toast('Conecte sua conta Twitch primeiro.'); return; }
    try {
      const data = await twApi('/streams/key?broadcaster_id=' + twState.user.id);
      $('#twStreamKey').value = data.data[0].stream_key;
      toast('🔑 Chave revelada. Não compartilhe com ninguém!');
    } catch (e) { toast('❌ ' + e.message); }
  };
  $('#twResetKeyBtn').onclick = async () => {
    if (!twState.user) { toast('Conecte sua conta Twitch primeiro.'); return; }
    if (!confirm('Resetar a chave? O OBS com a chave antiga para de funcionar.')) return;
    try {
      await twApi('/streams/key?broadcaster_id=' + twState.user.id, { method: 'DELETE' });
      $('#twStreamKey').value = '';
      toast('✅ Chave resetada! Revele a nova e atualize o OBS.');
    } catch (e) { toast('❌ ' + e.message); }
  };
  $('#twSaveBtn').onclick = async () => {
    if (!twState.user) { toast('Conecte sua conta Twitch primeiro.'); return; }
    const title = $('#twTitle').value.trim();
    const game = $('#twGame').value.trim();
    const body = {};
    if (title) body.title = title;
    try {
      if (game) {
        const g = await twApi('/games?name=' + encodeURIComponent(game));
        if (!g.data[0]) { toast('❌ Jogo/categoria não encontrado: ' + game); return; }
        body.game_id = g.data[0].id;
      }
      if (!Object.keys(body).length) { toast('Preencha título ou categoria.'); return; }
      await twApi('/channels?broadcaster_id=' + twState.user.id, { method: 'PATCH', body: JSON.stringify(body) });
      toast('✅ Canal atualizado na Twitch!');
      twRefreshStatus();
    } catch (e) { toast('❌ ' + e.message); }
  };
}
twInit();

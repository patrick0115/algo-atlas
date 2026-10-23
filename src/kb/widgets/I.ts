// @ts-nocheck —— 原講義 public/semi/I-os.html 的互動程式照搬,不改邏輯。
// 唯一的差別:document、計時器換成 scope() 給的替身,只在目前這一頁的範圍裡找元素,離開頁面時清掉計時器。
import { scope } from './scope'

export function mount(root: HTMLElement) {
  const { document, setInterval, setTimeout, requestAnimationFrame, cleanup } = scope(root);
  (() => {
    const $ = id => document.getElementById(id);
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, attrs, txt) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (txt !== undefined) e.textContent = txt;
      return e;
    };

    // ---- 靜態圖：pipeline 格子 ----
    (() => {
      const g = $('pipe');
      const rows = [
        ['IF', 'ID', 'EX', 'MEM', 'WB'].map((s, i) => [i, s]),
        [[1, 'IF'], [2, 'ID'], [3, 'stall'], [4, 'EX'], [5, 'MEM'], [6, 'WB']],
        [[2, 'IF'], [3, 'stall'], [4, 'ID'], [5, 'EX'], [6, 'MEM'], [7, 'WB']],
      ];
      rows.forEach((r, k) => r.forEach(([c, s]) => {
        const x = 222 + c * 78, y = 60 + k * 32;
        g.appendChild(el('rect', { x, y, width: 72, height: 26, rx: 3, class: s === 'stall' ? 'bx-soft' : (k === 1 && s === 'EX' ? 'bx-accent' : 'bx') }));
        g.appendChild(el('text', { x: x + 10, y: y + 18, class: s === 'stall' ? 't-small' : '' }, s === 'stall' ? 'bubble' : s));
      }));
    })();

    // ---- 主圖 ----
    // 每一步：t 哪個 thread、s 指令文字、之後的狀態（reg、mem、own 鎖→持有者、wait thread→鎖）
    const R = (o) => o;
    const MODES = {
      race: {
        locks: [], hasMem: true,
        init: { reg: { A: '－', B: '－' }, mem: 0 },
        steps: [
          R({ title: '起點：兩個 thread 各要做一次 counter++', desc: 'counter = 0，兩個 thread 各加 1，正確答案是 2。counter++ 在機器碼裡其實是三步：load（讀進自己的暫存器）→ add（加 1）→ store（寫回記憶體）。' }),
          R({ t: 'A', s: 'load counter → r = 0', reg: { A: 0 }, title: 'A 讀出 counter', desc: 'A 把 counter 讀進自己的暫存器：r = 0。' }),
          R({ t: 'B', s: 'load counter → r = 0', reg: { B: 0 }, title: 'B 也讀出 counter：問題的種子', desc: '作業系統在這時切到 B（或 B 在另一顆核心同時跑）。A 還沒寫回，所以 B 讀到的也是 0。兩個人手上拿的是同一份舊值。' }),
          R({ t: 'A', s: 'add r, 1 → r = 1', reg: { A: 1 }, title: 'A 在暫存器裡加 1', desc: '加法只發生在 A 自己的暫存器，記憶體裡的 counter 還是 0。' }),
          R({ t: 'B', s: 'add r, 1 → r = 1', reg: { B: 1 }, title: 'B 也加 1', desc: 'B 拿舊值 0 加 1，得到 1。它不知道 A 也在做同一件事。' }),
          R({ t: 'A', s: 'store r → counter = 1', mem: 1, title: 'A 寫回：counter = 1', desc: '到這裡看起來都對。' }),
          R({ t: 'B', s: 'store r → counter = 1', mem: 1, over: true, title: 'B 寫回：A 的更新被蓋掉了', desc: '結果是 1，少了一次（lost update）。交錯的時間點每次不同，所以 race condition 時好時壞、很難重現，Debug 單步執行時往往不會發生。修法：加 lock 把三步變成不可分割的一段（切到「加 lock」），或改用一條指令完成的 atomic 操作（C# Interlocked.Increment、C++ std::atomic）。' }),
        ],
      },
      lock: {
        locks: ['L'], hasMem: true,
        init: { reg: { A: '－', B: '－' }, mem: 0 },
        steps: [
          R({ title: '起點：同一段 counter++，這次先拿鎖', desc: '兩個 thread 都要先 lock(L) 才能進入「load → add → store」這段臨界區段，做完再 unlock。' }),
          R({ t: 'A', s: 'lock(L) → 取得', own: { L: 'A' }, title: 'A 拿到鎖 L', desc: 'L 現在屬於 A（實線箭頭：L → A）。' }),
          R({ t: 'B', s: 'lock(L) → 等待…', wait: { B: 'L' }, title: 'B 被擋在門外', desc: 'B 也想進來，但 L 在 A 手上，B 被擋住（睡著，或短暫自旋），根本碰不到 counter（虛線箭頭：B 在等 L）。' }),
          R({ t: 'A', s: 'load counter → r = 0', reg: { A: 0 }, title: 'A 讀出 counter', desc: '因為 B 進不來，A 的三步不會被插隊。' }),
          R({ t: 'A', s: 'add r, 1 → r = 1', reg: { A: 1 }, title: 'A 加 1', desc: 'r = 1，還在 A 自己的暫存器裡。' }),
          R({ t: 'A', s: 'store r → counter = 1', mem: 1, title: 'A 寫回', desc: 'counter = 1。' }),
          R({ t: 'A', s: 'unlock(L)', own: { L: null }, title: 'A 放開鎖', desc: 'A 放開 L，作業系統喚醒等待中的 B。' }),
          R({ t: 'B', s: 'lock(L) → 取得', own: { L: 'B' }, wait: { B: null }, title: 'B 拿到鎖', desc: 'B 被喚醒、拿到 L，現在輪到它進臨界區段。' }),
          R({ t: 'B', s: 'load counter → r = 1', reg: { B: 1 }, title: 'B 讀到的是新值 1', desc: '這次 B 讀到 A 已經寫回的 1，而不是舊值 0。' }),
          R({ t: 'B', s: 'add r, 1 → r = 2', reg: { B: 2 }, title: 'B 加 1', desc: 'r = 2。' }),
          R({ t: 'B', s: 'store r → counter = 2', mem: 2, title: 'B 寫回', desc: 'counter = 2。' }),
          R({ t: 'B', s: 'unlock(L)', own: { L: null }, title: '結果 2，正確', desc: '代價是 B 等了 A 一段時間（lock contention）：臨界區段越長、搶的人越多就越慢。如果只是加一個數字，Interlocked.Increment 一條指令就做完，比 lock 便宜。' }),
        ],
      },
      dead: {
        locks: ['L1', 'L2'], hasMem: false,
        init: {},
        steps: [
          R({ title: '起點：兩段程式各要同時拿兩把鎖', desc: 'A 的程式寫「先 lock(L1) 再 lock(L2)」；B 是另一個人寫的，順序剛好反過來：先 L2 再 L1。各自單獨跑都沒問題，測試也常常過。' }),
          R({ t: 'A', s: 'lock(L1) → 取得', own: { L1: 'A' }, title: 'A 拿到 L1', desc: 'A 先拿 L1，接下來要拿 L2。' }),
          R({ t: 'B', s: 'lock(L2) → 取得', own: { L2: 'B' }, title: 'B 拿到 L2', desc: '時機剛好：A 拿完 L1、還沒拿 L2 的空檔，B 拿走了 L2。' }),
          R({ t: 'A', s: 'lock(L2) → 等待…', wait: { A: 'L2' }, title: 'A 要 L2，但在 B 手上', desc: 'A 抱著 L1 開始等 L2（持有並等待）。' }),
          R({ t: 'B', s: 'lock(L1) → 等待…', wait: { B: 'L1' }, dead: true, title: 'Deadlock：等待圖繞成一個圈', desc: 'A 等 L2 → L2 在 B 手上 → B 等 L1 → L1 在 A 手上。互斥、持有並等待、不可搶奪、循環等待四個條件全部成立，兩個 thread 永遠卡住，CPU 卻是 0%。切到「固定鎖順序」看怎麼破解。' }),
        ],
      },
      order: {
        locks: ['L1', 'L2'], hasMem: false,
        init: {},
        steps: [
          R({ title: '起點：規定所有程式都「先 L1 再 L2」', desc: '不管誰寫的程式，要同時拿兩把鎖時一律照同一個順序拿。' }),
          R({ t: 'A', s: 'lock(L1) → 取得', own: { L1: 'A' }, title: 'A 拿到 L1', desc: 'A 照規定先拿 L1。' }),
          R({ t: 'B', s: 'lock(L1) → 等待…', wait: { B: 'L1' }, title: 'B 第一把就拿不到，手上什麼都沒抱著', desc: 'B 也要先拿 L1，所以在第一步就被擋住，而且它沒有持有任何鎖：不會形成循環。' }),
          R({ t: 'A', s: 'lock(L2) → 取得', own: { L2: 'A' }, title: 'A 順利拿到 L2', desc: '拿得到 L1 的人，一定拿得到 L2。' }),
          R({ t: 'A', s: '做事（例如轉帳）', title: 'A 在兩把鎖保護下做事', desc: '兩把鎖都在 A 手上，B 乖乖在 L1 外面等。' }),
          R({ t: 'A', s: 'unlock(L2)、unlock(L1)', own: { L1: null, L2: null }, title: 'A 依相反順序放開', desc: '放鎖的順序不影響 deadlock，習慣上與取鎖相反。' }),
          R({ t: 'B', s: 'lock(L1) → 取得', own: { L1: 'B' }, wait: { B: null }, title: 'B 拿到 L1', desc: 'B 被喚醒，拿到 L1。' }),
          R({ t: 'B', s: 'lock(L2) → 取得', own: { L2: 'B' }, title: 'B 拿到 L2', desc: 'L2 沒人用，B 直接拿到。' }),
          R({ t: 'B', s: '做事、解鎖', own: { L1: null, L2: null }, title: '兩個都做完，沒有 deadlock', desc: '統一順序破掉「循環等待」這個條件。實務上可依物件 ID 或位址排序決定順序；再加 Monitor.TryEnter 逾時當保險，拿不到就放掉手上的鎖重來。' }),
        ],
      },
    };

    const POS = {
      lock: { A: [360, 230], L: [450, 230], B: [540, 230] },
      dead: { A: [380, 150], L2: [520, 150], B: [520, 290], L1: [380, 290] },
    };
    POS.order = POS.dead;

    const state = { m: 'race', i: 0 };

    function snapshot(md, upto) {
      const s = { reg: { A: '－', B: '－' }, mem: 0, own: {}, wait: {} };
      Object.assign(s.reg, md.init.reg || {});
      if (md.init.mem !== undefined) s.mem = md.init.mem;
      md.locks.forEach(l => { s.own[l] = null; });
      for (let k = 1; k <= upto; k++) {
        const st = md.steps[k];
        if (st.reg) Object.assign(s.reg, st.reg);
        if (st.mem !== undefined) s.mem = st.mem;
        if (st.own) Object.assign(s.own, st.own);
        if (st.wait) Object.assign(s.wait, st.wait);
      }
      return s;
    }

    function edge(svg, p, q, dashed, label, r1, r2) {
      const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
      const ux = dx / L, uy = dy / L;
      const x1 = p[0] + ux * r1, y1 = p[1] + uy * r1, x2 = q[0] - ux * r2, y2 = q[1] - uy * r2;
      svg.appendChild(el('line', { x1, y1, x2, y2, class: 'ln-accent' + (dashed ? ' dash' : ''), 'marker-end': 'url(#ahM)' }));
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      if (Math.abs(dy) < 1) svg.appendChild(el('text', { x: mx - 13, y: my - 8, class: 't-small' }, label));
      else svg.appendChild(el('text', { x: mx + (p[0] > 450 ? 8 : -36), y: my + 4, class: 't-small' }, label));
    }

    function draw() {
      const md = MODES[state.m], svg = $('rc');
      const n = md.steps.length - 1;
      const y0 = 70, rowH = 28;
      const H = Math.max(370, y0 + n * rowH + 10);
      svg.setAttribute('viewBox', `0 0 900 ${H}`);
      svg.innerHTML = '';
      const defs = el('defs', {});
      const mk = el('marker', { id: 'ahM', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' });
      mk.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', class: 'arrow-head' }));
      defs.appendChild(mk); svg.appendChild(defs);

      const s = snapshot(md, state.i);
      const col = { A: 20, B: 600 };
      svg.appendChild(el('line', { x1: 310, y1: 10, x2: 310, y2: H - 10, class: 'ln-soft' }));
      svg.appendChild(el('line', { x1: 590, y1: 10, x2: 590, y2: H - 10, class: 'ln-soft' }));
      ['A', 'B'].forEach(t => {
        svg.appendChild(el('text', { x: col[t], y: 30, class: 't-strong' }, 'Thread ' + t));
        let st = '';
        if (s.wait[t]) st = '卡住：等 ' + s.wait[t];
        else if (md.hasMem) st = '暫存器 r = ' + s.reg[t];
        svg.appendChild(el('text', { x: col[t] + 100, y: 30, class: s.wait[t] ? 't-accent' : 't-small' }, st));
        svg.appendChild(el('line', { x1: col[t], y1: 42, x2: col[t] + 280, y2: 42, class: 'ln' }));
      });
      for (let k = 1; k <= state.i; k++) {
        const st = md.steps[k], x = col[st.t], y = y0 + (k - 1) * rowH;
        if (k === state.i) svg.appendChild(el('rect', { x: x - 6, y: y - 18, width: 284, height: 25, rx: 4, class: 'bx-accent' }));
        svg.appendChild(el('text', { x: x, y: y, class: 't-small' }, String(k)));
        svg.appendChild(el('text', { x: x + 24, y: y, class: k === state.i ? 't-accent' : '' }, st.s + (st.over ? '（覆蓋！）' : '')));
      }

      if (md.hasMem) {
        svg.appendChild(el('rect', { x: 340, y: 44, width: 220, height: 66, rx: 6, class: 'bx' }));
        svg.appendChild(el('text', { x: 354, y: 66, class: 't-small' }, '共享變數（記憶體）'));
        svg.appendChild(el('text', { x: 354, y: 98, class: 't-strong', 'font-size': 20 }, 'counter = ' + s.mem));
        svg.appendChild(el('text', { x: 486, y: 98, class: 't-small' }, '預期 2'));
      } else {
        svg.appendChild(el('text', { x: 340, y: 66, class: 't-strong' }, '等待圖（wait-for graph）'));
        svg.appendChild(el('text', { x: 340, y: 88, class: 't-small' }, '圈繞起來＝deadlock'));
      }

      if (md.locks.length) {
        const P = POS[state.m];
        md.locks.forEach(l => { if (s.own[l]) edge(svg, P[l], P[s.own[l]], false, '持有', 22, 22); });
        ['A', 'B'].forEach(t => { if (s.wait[t]) edge(svg, P[t], P[s.wait[t]], true, '等待', 22, 22); });
        ['A', 'B'].forEach(t => {
          svg.appendChild(el('circle', { cx: P[t][0], cy: P[t][1], r: 20, class: s.wait[t] ? 'bx-accent' : 'bx' }));
          svg.appendChild(el('text', { x: P[t][0] - 5, y: P[t][1] + 5, class: 't-accent' }, t));
        });
        md.locks.forEach(l => {
          svg.appendChild(el('rect', { x: P[l][0] - 22, y: P[l][1] - 15, width: 44, height: 30, rx: 4, class: 'bx-soft' }));
          svg.appendChild(el('text', { x: P[l][0] - (l.length > 1 ? 9 : 4), y: P[l][1] + 5 }, l));
        });
        if (md.steps[state.i].dead) svg.appendChild(el('text', { x: 360, y: 340, class: 't-accent' }, '循環等待 → 永遠卡住'));
      } else {
        const notes = ['暫存器是每個 thread 自己的，', '記憶體裡的 counter 是共用的。', '', 'load 與 store 之間，', '別人隨時可能插隊。'];
        notes.forEach((t, k) => svg.appendChild(el('text', { x: 340, y: 150 + k * 22, class: 't-small' }, t)));
      }

      const st = md.steps[state.i];
      $('stTitle').textContent = st.title;
      $('stWhat').textContent = st.desc;
      $('phase').textContent = `第 ${state.i} / ${n} 步`;
      $('prev').disabled = state.i === 0;
      $('next').disabled = state.i === n;
    }

    document.querySelectorAll('#mode button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#mode button').forEach(x => x.classList.toggle('on', x === b));
      state.m = b.dataset.m; state.i = 0; draw();
    }));
    $('prev').addEventListener('click', () => { if (state.i > 0) { state.i--; draw(); } });
    $('next').addEventListener('click', () => { if (state.i < MODES[state.m].steps.length - 1) { state.i++; draw(); } });
    const q = (location.hash.match(/^#m=(\w+)&i=(\d+)$/) || []);
    if (q[1] && MODES[q[1]]) { state.m = q[1]; state.i = Math.min(+q[2], MODES[q[1]].steps.length - 1); document.querySelectorAll('#mode button').forEach(x => x.classList.toggle('on', x.dataset.m === state.m)); }
    draw();
  })();
  return cleanup
}

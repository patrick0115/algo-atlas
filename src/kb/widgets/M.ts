// @ts-nocheck —— 原講義 public/semi/M-digital.html 的互動程式照搬,不改邏輯。
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

    /* ===== 主圖：CDC 波形 =====
       row 種類：clk {period, off}；wave {tr:[[t,v]]}，v = 0 / 1 / 'm'（亞穩態）；bus {tr:[[t,label,bad]]} */
    const T = 6.2, WIN = [2.84, 3.1];
    const clkA = { name: 'clk_a', kind: 'clk', period: 1.3, off: 0.35 };
    const clkB = { name: 'clk_b', kind: 'clk', period: 1, off: 1 };
    const sigA = { name: 'sig_a', kind: 'wave', tr: [[0, 0], [2.95, 1]] };

    const MODES = {
      none: {
        rows: [clkA, sigA, clkB, { name: 'q', kind: 'wave', tr: [[0, 0], [3.03, 'm'], [3.85, 1]] }],
        phases: [
          [0, 2.8, '兩個不相干的時脈', 'clk_a 與 clk_b 頻率不同、沒有固定相位關係。sig_a 由 clk_a 產生，什麼時候變化，clk_b 完全無法預期。'],
          [2.8, 3.15, 'sig_a 剛好在視窗內變化', 'sig_a 在 clk_b 上升緣前一點點才從 0 變 1，落進 setup／hold 視窗（虛線框）。只要兩個時脈不同源，這件事遲早一定會發生，差別只在多久一次。'],
          [3.0, 3.85, 'q 進入亞穩態', '取樣到變化中的電壓，flip-flop 輸出停在 0 與 1 中間（斜線區）。它最後會落到 0 或 1，但要多久、落到哪一邊都不確定。'],
          [3.0, 4.2, '下游直接用 q：出事', '如果 q 直接接到後面的組合邏輯與多個 flip-flop，在它落定前，有的路徑把它當 1、有的當 0；若落定時間超過剩下的週期，下一個邊緣就取到錯值。FSM 可能跳到兩個狀態「各一半」的非法編碼。模擬看不到這種錯，上板偶發。'],
        ],
      },
      sync2: {
        rows: [clkA, sigA, clkB,
          { name: 'ff1', kind: 'wave', tr: [[0, 0], [3.03, 'm'], [3.6, 1]] },
          { name: 'ff2', kind: 'wave', tr: [[0, 0], [4.05, 1]] }],
        phases: [
          [2.8, 3.15, '一樣落在視窗內', '亞穩態沒有被消除：第一級 ff1 一樣會取樣到變化中的 sig_a。同步器做的事是「讓沒人去看它」。'],
          [3.0, 3.6, 'ff1 亞穩態，但沒人用它', 'ff1 的輸出只接到 ff2，中間不接任何邏輯，而且兩顆放得很近。它有將近一整個 clk_b 週期可以慢慢落定。'],
          [3.95, 4.2, 'ff2 取到穩定值', '下一個 clk_b 邊緣時 ff1 已經落定，ff2 取到乾淨的 1，交給後面的邏輯使用。失敗的條件變成「亞穩態撐過一整個週期」，機率隨時間指數下降。'],
          [3.0, 5.1, '代價：延遲 1～2 拍，而且不確定', '如果 ff1 落到 0，下一拍才取到 1，ff2 就晚一拍變化。結果一定正確，只是延遲 1～2 個 clk_b 週期，事先不知道是哪個。單 bit 這樣沒關係；多 bit 就出事了，看下一個模式。'],
        ],
      },
      bus: {
        rows: [clkB,
          { name: 'data_a', kind: 'bus', tr: [[0, '01'], [2.95, '10']] },
          { name: 'b1', kind: 'wave', tr: [[0, 0], [4.05, 1]] },
          { name: 'b0', kind: 'wave', tr: [[0, 1], [5.05, 0]] },
          { name: 'data_b', kind: 'bus', tr: [[0, '01'], [4.05, '11', true], [5.05, '10']] }],
        phases: [
          [2.8, 3.15, '兩個 bit 同時變', 'data_a 從 01 變 10（十進位 1 變 2），bit1 與 bit0 同時翻轉，又剛好落在 clk_b 的視窗內。每個 bit 各接一個雙級同步器。'],
          [3.0, 4.2, '各自決定看到新值還是舊值', 'bit1 的第一級落到新值（1），bit0 的第一級落到舊值（1）。兩個同步器各自擲骰子，結果互不相干。b1、b0 是各自第二級的輸出。'],
          [4.0, 5.1, 'data_b 出現從沒存在過的 11', '這一拍 data_b 看到 11（十進位 3）：一半新一半舊。來源端從來沒送過 3，下游卻拿到了。如果這是 FIFO 指標，空／滿判斷就錯；如果是設定值，就是一個非法設定。'],
          [5.0, 6.2, '結論：多 bit 不能逐 bit 同步', '再下一拍才變成正確的 10。錯值只出現一拍，模擬看不到、上板偶發。解法：一次只變 1 bit（Gray code）、或讓資料保持不動只同步控制訊號（handshake／MCP）、或用非同步 FIFO。'],
        ],
      },
      gray: {
        rows: [clkB,
          { name: 'data_a', kind: 'bus', tr: [[0, '01'], [2.95, '11']] },
          { name: 'b1', kind: 'wave', tr: [[0, 0], [5.05, 1]] },
          { name: 'b0', kind: 'wave', tr: [[0, 1]] },
          { name: 'data_b', kind: 'bus', tr: [[0, '01'], [5.05, '11']] }],
        phases: [
          [2.8, 3.15, '改成 Gray：一次只變 1 bit', '同樣是 1 變 2，Gray code 是 01 → 11（binary 轉 Gray：g = b ^ (b >> 1)），只有 bit1 變化，bit0 保持不動。'],
          [3.0, 5.1, '最壞情況：晚一拍看到新值', '假設 bit1 的第一級運氣差落回舊值，要再下一拍才取到 1。data_b 這段時間看到的是 01，也就是「舊的正確值」。'],
          [5.0, 6.2, '不會出現錯值', 'data_b 不是 01 就是 11，只有可能晚，不可能錯。這就是非同步 FIFO 讀寫指標都用 Gray code 跨域的原因：空／滿判斷最多保守一拍，不會誤判。'],
          [0, 6.2, 'Gray 不適用時：handshake 或 FIFO', 'Gray 只對「一次加 1」的計數器有效。任意資料（例如 I²C 寫進來的一組暫存器）用 handshake：資料先放好不動，只把 req 經同步器送過去，對方收到後回 ack；或在 frame 邊界一次載入影子暫存器。連續資料流（像影像資料）就用非同步 FIFO。'],
        ],
      },
    };

    const st = { m: 'none', i: 0 };

    function draw() {
      const d = MODES[st.m], svg = $('wv');
      svg.innerHTML = '';
      const X0 = 90, W = 790, rowH = 50, top = 36;
      const H = top + d.rows.length * rowH + 12;
      svg.setAttribute('viewBox', `0 0 900 ${H}`);
      const x = t => X0 + t / T * W;

      const defs = el('defs', {});
      const pat = el('pattern', { id: 'hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
      pat.appendChild(el('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'ln-accent', 'stroke-width': 1 }));
      defs.appendChild(pat);
      svg.appendChild(defs);

      const ph = d.phases[st.i];
      svg.appendChild(el('rect', { x: x(ph[0]), y: 4, width: x(ph[1]) - x(ph[0]), height: H - 8, class: 'bx-soft', rx: 4 }));
      for (let k = 1; k <= 6; k++) svg.appendChild(el('line', { x1: x(k), y1: top - 4, x2: x(k), y2: H - 6, class: 'ln-soft' }));
      svg.appendChild(el('rect', { x: x(WIN[0]), y: top - 8, width: x(WIN[1]) - x(WIN[0]), height: H - top, class: 'ln-accent dash', fill: 'none' }));
      svg.appendChild(el('text', { x: x(WIN[0]) - 52, y: top - 14, class: 't-small' }, 'setup／hold 視窗'));

      d.rows.forEach((r, k) => {
        const yH = top + k * rowH + 4, yL = yH + 24, yM = (yH + yL) / 2;
        svg.appendChild(el('text', { x: 4, y: yL - 4, class: 't-strong' }, r.name));
        if (r.kind === 'clk') {
          let pts = `${x(0)},${yL} `;
          for (let t = r.off; t < T; t += r.period) {
            const tf = Math.min(t + r.period / 2, T);
            pts += `${x(t)},${yL} ${x(t)},${yH} ${x(tf)},${yH} ${x(tf)},${yL} `;
          }
          pts += `${x(T)},${yL}`;
          svg.appendChild(el('polyline', { points: pts, class: 'ln-fg', 'stroke-width': 1.4 }));
        } else if (r.kind === 'wave') {
          const yOf = v => v === 1 ? yH : v === 0 ? yL : yM;
          let pts = '';
          r.tr.forEach(([t, v], j) => {
            const t2 = j + 1 < r.tr.length ? r.tr[j + 1][0] : T;
            if (v === 'm') {
              svg.appendChild(el('rect', { x: x(t), y: yH, width: x(t2) - x(t), height: yL - yH, style: 'fill:url(#hatch)', class: 'ln-accent' }));
            }
            pts += `${x(t)},${yOf(v)} ${x(t2)},${yOf(v)} `;
          });
          svg.appendChild(el('polyline', { points: pts, class: 'ln-fg', 'stroke-width': 1.8 }));
        } else {
          const c = 5;
          r.tr.forEach(([t, lab, bad], j) => {
            const t2 = j + 1 < r.tr.length ? r.tr[j + 1][0] : T;
            const a = x(t) + (j ? c : 0), b = x(t2) - (j + 1 < r.tr.length ? c : 0);
            const pts = `${j ? x(t) : a},${yM} ${a},${yH} ${b},${yH} ${j + 1 < r.tr.length ? x(t2) : b},${yM} ${b},${yL} ${a},${yL} ${j ? x(t) : a},${yM}`;
            svg.appendChild(el('polygon', { points: pts, class: bad ? 'bx-accent' : 'bx' }));
            svg.appendChild(el('text', { x: (a + b) / 2 - 8, y: yM + 5, class: bad ? 't-accent' : '' }, lab));
            if (bad) svg.appendChild(el('text', { x: (a + b) / 2 + 14, y: yM + 5, class: 't-accent' }, '錯值'));
          });
        }
      });

      $('stTitle').textContent = ph[2];
      $('stWhat').textContent = ph[3];
      $('phase').textContent = `第 ${st.i + 1} / ${d.phases.length} 段`;
      $('prev').disabled = st.i === 0;
      $('next').disabled = st.i === d.phases.length - 1;
    }

    document.querySelectorAll('#mode button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#mode button').forEach(o => o.classList.toggle('on', o === b));
      st.m = b.dataset.m; st.i = 0; draw();
    }));
    $('prev').addEventListener('click', () => { if (st.i > 0) { st.i--; draw(); } });
    $('next').addEventListener('click', () => { if (st.i < MODES[st.m].phases.length - 1) { st.i++; draw(); } });
    draw();

    /* ===== M01：FSM 逐步 ===== */
    const SEQ = [0, 1, 1, 1, 0, 1, 1, 0];
    const FSM = {
      moore: {
        states: [{ n: 'S0', x: 110, out: '輸出 0' }, { n: 'S1', x: 300, out: '輸出 0' }, { n: 'S2', x: 490, out: '輸出 1' }],
        next: (s, i) => i ? Math.min(s + 1, 2) : 0,
        out: (s) => s === 2 ? 1 : 0,
        edges: [
          ['M140,78 Q205,40 270,78', 205, 52, '1'], ['M330,78 Q395,40 460,78', 395, 52, '1'],
          ['M270,112 Q205,150 140,112', 214, 126, '0'], ['M470,122 Q300,200 130,122', 300, 178, '0'],
          ['M80,82 C30,55 30,135 80,108', 22, 100, '0'], ['M520,82 C570,55 570,135 520,108', 566, 100, '1'],
        ],
        cap: 'Moore：輸出寫在狀態裡（S2 才輸出 1）。看到第二個 1 的那一拍，狀態還沒更新，要等下一拍進到 S2 輸出才變 1：晚一拍，但輸出只由暫存器決定，很乾淨。',
      },
      mealy: {
        states: [{ n: 'S0', x: 110, out: '' }, { n: 'S1', x: 300, out: '' }],
        next: (s, i) => i ? 1 : 0,
        out: (s, i) => (s === 1 && i === 1) ? 1 : 0,
        edges: [
          ['M140,78 Q205,40 270,78', 192, 52, '1/0'], ['M270,112 Q205,150 140,112', 196, 150, '0/0'],
          ['M80,82 C30,55 30,135 80,108', 10, 100, '0/0'], ['M330,82 C380,55 380,135 330,108', 378, 100, '1/1'],
        ],
        cap: 'Mealy：輸出寫在轉移線上（輸入／輸出）。在 S1 又看到 1，這一拍輸出就是 1：比 Moore 早一拍，少一個狀態；代價是輸入一抖輸出就跟著抖。',
      },
    };
    const fs = { t: 'moore', k: 0 };

    function runFsm(def) {
      let s = 0; const rows = [];
      SEQ.forEach(i => { rows.push({ s, i, o: def.out(s, i) }); s = def.next(s, i); });
      return rows;
    }

    function drawFsm() {
      const def = FSM[fs.t], svg = $('fsm'), rows = runFsm(def), cur = rows[fs.k];
      svg.innerHTML = '';
      const defs = el('defs', {});
      const mk = el('marker', { id: 'ahS', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' });
      mk.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', class: 'fill-muted' }));
      defs.appendChild(mk); svg.appendChild(defs);

      def.edges.forEach(([d, lx, ly, lab]) => {
        svg.appendChild(el('path', { d, class: 'ln', 'marker-end': 'url(#ahS)' }));
        svg.appendChild(el('text', { x: lx, y: ly, class: 't-small' }, lab));
      });
      def.states.forEach((s, j) => {
        const on = j === cur.s;
        svg.appendChild(el('circle', { cx: s.x, cy: 95, r: 34, class: on ? 'bx-accent' : 'bx', 'stroke-width': on ? 2.5 : 1 }));
        svg.appendChild(el('text', { x: s.x - 10, y: s.out ? 92 : 100, class: 't-strong' }, s.n));
        if (s.out) svg.appendChild(el('text', { x: s.x - 20, y: 112, class: 't-small' }, s.out));
      });

      svg.appendChild(el('rect', { x: 630, y: 30, width: 250, height: 130, rx: 6, class: 'bx' }));
      svg.appendChild(el('text', { x: 646, y: 56, class: 't-strong' }, `第 ${fs.k + 1} 個週期`));
      svg.appendChild(el('text', { x: 646, y: 84 }, `目前狀態　${def.states[cur.s].n}`));
      svg.appendChild(el('text', { x: 646, y: 108 }, `這拍輸入　${cur.i}`));
      svg.appendChild(el('text', { x: 646, y: 132, class: 't-accent' }, `這拍輸出　${cur.o}`));
      svg.appendChild(el('text', { x: 646, y: 152, class: 't-small' }, fs.t === 'moore' ? '輸出＝f（狀態）' : '輸出＝g（狀態, 輸入）'));

      const gx = 120, cw = 95, gy = 206;
      svg.appendChild(el('rect', { x: gx + fs.k * cw, y: gy - 18, width: cw, height: 100, class: 'bx-soft' }));
      ['週期', '輸入', '狀態', '輸出'].forEach((h, r) => svg.appendChild(el('text', { x: 20, y: gy + r * 24, class: r ? 't-strong' : 't-small' }, h)));
      rows.forEach((rw, c) => {
        const cx = gx + c * cw + cw / 2 - 6;
        svg.appendChild(el('text', { x: cx, y: gy, class: 't-small' }, String(c + 1)));
        if (c <= fs.k) {
          svg.appendChild(el('text', { x: cx, y: gy + 24 }, String(rw.i)));
          svg.appendChild(el('text', { x: cx - 4, y: gy + 48 }, def.states[rw.s].n));
          svg.appendChild(el('text', { x: cx, y: gy + 72, class: rw.o ? 't-accent' : '' }, String(rw.o)));
        }
      });
      svg.appendChild(el('line', { x1: 10, y1: gy + 8, x2: 890, y2: gy + 8, class: 'ln-soft' }));

      $('fCap').textContent = def.cap;
      $('fInfo').textContent = `輸入序列 ${SEQ.join('')}　第 ${fs.k + 1} / ${SEQ.length} 週期`;
      $('fPrev').disabled = fs.k === 0;
      $('fNext').disabled = fs.k === SEQ.length - 1;
    }

    document.querySelectorAll('#fsmType button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#fsmType button').forEach(o => o.classList.toggle('on', o === b));
      fs.t = b.dataset.f; drawFsm();
    }));
    $('fPrev').addEventListener('click', () => { if (fs.k > 0) { fs.k--; drawFsm(); } });
    $('fNext').addEventListener('click', () => { if (fs.k < SEQ.length - 1) { fs.k++; drawFsm(); } });
    drawFsm();
  })();
  return cleanup
}

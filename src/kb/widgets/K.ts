// @ts-nocheck —— 原講義 public/semi/K-firmware.html 的互動程式照搬,不改邏輯。
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

    /* ---- K02 靜態 bit field ---- */
    (() => {
      const g = $('bits'), X0 = 60, W = 25, Y = 50;
      const field = b => b >= 4 && b <= 5 ? 'MODE' : b === 0 ? 'EN' : b === 1 ? 'IE' : b === 8 ? 'DONE' : '';
      for (let i = 0; i < 32; i++) {
        const b = 31 - i, f = field(b);
        g.appendChild(el('rect', { x: X0 + i * W, y: Y, width: W, height: 28, class: f === 'MODE' ? 'bx-accent' : f ? 'bx' : 'bx-soft' }));
        if (b % 4 === 0 || b === 31) g.appendChild(el('text', { x: X0 + i * W + 4, y: Y - 6, class: 't-small' }, String(b)));
      }
      g.appendChild(el('text', { x: 10, y: Y + 19, class: 't-small' }, 'bit'));
      const lab = (b0, b1, s, y) => {
        const x = X0 + (31 - b1) * W, w = (b1 - b0 + 1) * W;
        g.appendChild(el('text', { x: x + w / 2 - s.length * 3.6, y: y, class: 't-small' }, s));
      };
      lab(8, 8, 'DONE', Y + 46); lab(4, 5, 'MODE[5:4]', Y + 46); lab(1, 1, 'IE', Y + 62); lab(0, 0, 'EN', Y + 46);
      g.appendChild(el('text', { x: X0, y: Y + 46, class: 't-small' }, '灰底＝reserved'));
      g.appendChild(el('text', { x: X0 + 19 * W, y: Y + 62, class: 't-small' }, 'DONE 是 W1C 旗標'));
    })();

    /* ---- 主圖：開機與更新 ---- */
    const LAY = {
      dual: [['boot', 'Bootloader', 90, 170, '0x0800_0000'], ['a', 'Slot A', 260, 310, '0x0801_0000'], ['b', 'Slot B', 570, 310, '0x0804_0000']],
      single: [['boot', 'Bootloader', 90, 170, '0x0800_0000'], ['app', 'App 區', 260, 620, '0x0801_0000']],
    };
    const PIPE = [['上電', 'POR／BOR 放開'], ['Reset vector', '讀 MSP、PC'], ['Bootloader', '要不要更新？'], ['驗證 image', 'magic／CRC／簽章'], ['跳到 App', '清場、VTOR、MSP'], ['App 確認', '餵狗、標記 OK']];

    const S = {
      normal: { lay: 'dual', init: { boot: ['ok', '平常不更新'], a: ['ok', 'v1 有效'], b: ['empty', '空（0xFF）'] }, steps: [
        { hi: 0, pc: null, t: '① 上電', w: '電源升過門檻，POR／BOR（上電／欠壓重置）放開 reset。內部 RC 振盪器先起來讓 CPU 動，外部晶振和 PLL 之後才由程式設定。' },
        { hi: 1, pc: 'boot', t: '② 讀 reset vector', w: 'Cortex-M 從位址 0x0000_0000（通常映射到 Flash 起點；BOOT 腳位可改成映射系統 ROM）讀第一個 word 當堆疊指標 MSP、第二個 word 當 Reset_Handler 位址。啟動碼複製 .data、清 .bss，再呼叫 main()。這個位置放的是 bootloader。' },
        { hi: 2, pc: 'boot', t: '③ Bootloader 決定要不要更新', w: '讀 reset 原因（上電、watchdog、軟體）、更新旗標、按鍵或 UART／I²C 命令。沒有要更新，就往下驗證 App。' },
        { hi: 3, pc: 'boot', s: { a: ['busy', 'v1 驗證中', 1] }, t: '④ 驗證 image', w: '讀 Slot A 的 header：magic、版本、長度。重算 CRC32 或 SHA-256 跟記錄的值比；有 secure boot 就再用 OTP 裡的公鑰 hash 驗簽章，並確認版本不低於 anti-rollback 計數。任一項不過就不跳。' },
        { hi: 4, pc: 'a', s: { a: ['run', 'v1 執行中'] }, t: '⑤ 跳到 App', w: '先清場：關中斷、停 SysTick、清 NVIC pending、把 bootloader 開過的週邊還原。再把 VTOR 指到 Slot A、MSP 設成 A 的第一個 word，最後跳到 A 的第二個 word（Reset_Handler）。' },
        { hi: 5, pc: 'a', t: '⑥ App 確認', w: 'App 初始化完成、自我檢查通過，才開始定期餵 watchdog，並在剛更新完時寫「已確認」旗標。之後每次上電都重複 ①～⑤。' },
      ] },
      single: { lay: 'single', init: { boot: ['ok', '平常不更新'], app: ['run', 'v1 執行中'] }, steps: [
        { hi: 5, pc: 'app', t: '① v1 收到新版', w: '只有一塊 App 區。新版 v2 沒有別的地方放，只能覆蓋 v1。' },
        { hi: 2, pc: 'boot', s: { app: ['empty', 'v1 已擦除'] }, t: '② 回 bootloader 擦掉 v1', w: 'App 不能擦掉正在執行的自己，所以要回 bootloader 來擦寫。單 bank 時 bootloader 跟 App 在同一塊 Flash，擦寫期間 CPU 從這塊讀指令會被卡住（stall），擦寫中還得反應的程式要放到 RAM 跑。擦完的那一刻起，裝置上就沒有完整可跑的 App。' },
        { hi: 2, pc: 'boot', s: { app: ['busy', 'v2 寫入中 60%', 0.6] }, t: '③ 寫入 v2', w: '一個 sector 一個 sector 寫，寫完要讀回比對。這段可能要幾秒到幾十秒，全程都是危險期。' },
        { hi: 0, pc: null, s: { app: ['bad', 'v2 只寫一半'] }, t: '④ 斷電', w: '電池沒電、使用者關機或 USB 線鬆脫。App 區現在是半新半舊、殘缺的內容。' },
        { hi: 3, bad: 3, pc: 'boot', t: '⑤ 重新上電，驗證失敗', w: 'bootloader 沒被動到，還能跑。它重算 CRC 對不上 header，拒絕跳過去。這就是「驗證 image」一定要有的原因：不驗證直接跳，CPU 會跑進殘缺的程式。' },
        { hi: 2, pc: 'boot', t: '⑥ 結果：卡在 bootloader', w: '有更新通道（UART、I²C、USB）就停在 bootloader 等重燒，還救得回來。如果這次連 bootloader 也一起更新，或產品沒有任何現場燒錄通道，就是變磚，只能拆機用 SWD 或 ROM ISP 救（見 ISP 燒錄）。' },
      ] },
      dual: { lay: 'dual', init: { boot: ['ok', '平常不更新'], a: ['run', 'v1 執行中'], b: ['empty', '空（0xFF）'] }, steps: [
        { hi: 5, pc: 'a', s: { b: ['busy', 'v2 寫入中 60%', 0.6] }, t: '① 新版寫到另一半', w: 'v1 照常在 Slot A 跑，新版 v2 寫進 Slot B，A 完全不動。雙 bank 的 MCU 可以一邊從 A 執行、一邊擦寫 B。' },
        { hi: 0, pc: null, s: { a: ['ok', 'v1 有效'], b: ['bad', 'v2 只寫一半'] }, t: '② 斷電', w: '跟單 bank 一樣在半途斷電，但壞掉的只有 B。' },
        { hi: 2, pc: 'boot', t: '③ 上電，bootloader 檢查旗標', w: '「B 待測試」旗標只會在 v2 完整寫完、驗證過之後才設。這次沒設，bootloader 就不理 B。' },
        { hi: 3, pc: 'boot', s: { a: ['busy', 'v1 驗證中', 1] }, t: '④ 驗證 A', w: 'A 的 CRC 和簽章都對。' },
        { hi: 4, pc: 'a', s: { a: ['run', 'v1 執行中'] }, t: '⑤ 照常跑 v1', w: '使用者幾乎感覺不到，只是更新沒成功，App 之後重新下載 v2 即可。代價是 Flash 要多留一份空間。' },
      ] },
      revert: { lay: 'dual', init: { boot: ['ok', '平常不更新'], a: ['ok', 'v1 有效'], b: ['ok', 'v2 待測試'] }, steps: [
        { hi: 2, pc: 'boot', t: '① v2 寫完、驗證過', w: 'v2 完整寫進 B、CRC 和簽章都對。App 設好「B 待測試（只試一次）」旗標後 reset，bootloader 接手。' },
        { hi: 4, pc: 'b', s: { b: ['run', 'v2 試跑中'] }, t: '② 切到 v2', w: 'bootloader 看到旗標就跳到 B，同時把旗標改成「已試過」。MCUboot 的做法是把 A、B 內容對調後一樣從 A 跑；STM32 雙 bank 則是切換 bank 映射。圖上簡化成直接跳 B。' },
        { hi: 5, bad: 5, pc: 'b', s: { b: ['bad', 'v2 卡死、未確認'] }, t: '③ v2 跑不起來', w: 'CRC 對不代表程式對：v2 初始化時卡死，沒有餵 watchdog，也沒寫「已確認」。watchdog 逾時，硬體 reset。' },
        { hi: 2, pc: 'boot', t: '④ Bootloader 判定 v2 失敗', w: 'reset 原因是 watchdog，而且 v2 處在「已試過、未確認」。這個狀態代表新版不可信。' },
        { hi: 4, pc: 'a', s: { a: ['run', 'v1 執行中'], b: ['bad', 'v2 標記無效'] }, t: '⑤ 回退 v1', w: '跳回 A 的 v1，並回報更新失敗。這就是 A/B 更新的回退（rollback）。注意它跟 anti-rollback（禁止刷回舊版）是兩件事。' },
      ] },
    };

    const state = { s: 'normal', i: 0 };

    function segsAt(sc, i) {
      const cur = Object.assign({}, sc.init);
      for (let k = 0; k <= i; k++) Object.assign(cur, sc.steps[k].s || {});
      return cur;
    }

    function draw() {
      const sc = S[state.s], st = sc.steps[state.i], svg = $('bf');
      svg.innerHTML = '';
      const defs = el('defs', {});
      const mk = el('marker', { id: 'ahB', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' });
      mk.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', class: 'fill-muted' }));
      defs.appendChild(mk); svg.appendChild(defs);

      PIPE.forEach((p, k) => {
        const x = 15 + k * 148, on = k === st.hi, bad = k === st.bad;
        svg.appendChild(el('rect', { x, y: 20, width: 130, height: 52, rx: 6, class: bad ? 'bx dash' : on ? 'bx-accent' : 'bx' }));
        svg.appendChild(el('text', { x: x + 10, y: 42, class: on ? 't-strong' : '' }, p[0]));
        svg.appendChild(el('text', { x: x + 10, y: 62, class: bad ? 't-accent' : 't-small' }, bad ? '失敗' : p[1]));
        if (k < PIPE.length - 1) svg.appendChild(el('line', { x1: x + 131, y1: 46, x2: x + 146, y2: 46, class: 'ln', 'marker-end': 'url(#ahB)' }));
      });

      svg.appendChild(el('text', { x: 15, y: 160, class: 't-strong' }, 'Flash'));
      const segs = segsAt(sc, state.i);
      LAY[sc.lay].forEach(([id, name, x, w, addr]) => {
        const [kind, txt, f] = segs[id];
        const cls = kind === 'run' ? 'bx-accent' : kind === 'bad' ? 'bx dash' : kind === 'empty' ? 'bx-soft' : 'bx';
        svg.appendChild(el('rect', { x, y: 126, width: w, height: 62, class: cls }));
        if (kind === 'busy') svg.appendChild(el('rect', { x: x + 1, y: 127, width: (w - 2) * f, height: 60, class: 'bx-soft' }));
        svg.appendChild(el('text', { x: x + 12, y: 150, class: 't-strong' }, name));
        svg.appendChild(el('text', { x: x + 12, y: 174, class: kind === 'bad' ? 't-accent' : kind === 'empty' ? 't-muted' : '' }, txt));
        svg.appendChild(el('text', { x: x + 4, y: 204, class: 't-small' }, addr));
        if (st.pc === id) {
          const cx = x + w / 2;
          svg.appendChild(el('path', { d: `M${cx - 7},108 L${cx + 7},108 L${cx},120 z`, class: 'fill-fg' }));
          svg.appendChild(el('text', { x: cx + 12, y: 116, class: 't-small' }, 'CPU 在這裡執行'));
        }
      });
      if (!st.pc) svg.appendChild(el('text', { x: 90, y: 116, class: 't-small' }, 'CPU 沒在跑'));
      svg.appendChild(el('text', { x: 15, y: 236, class: 't-small' }, '粗框灰底＝正在執行　虛線框＝損毀或無效　部分灰底＝寫入或驗證進度　灰底無框＝已擦除　位址僅示意'));

      $('stTitle').textContent = st.t;
      $('stWhat').textContent = st.w;
      $('phase').textContent = `第 ${state.i + 1} / ${sc.steps.length} 步`;
      $('prev').disabled = state.i === 0;
      $('next').disabled = state.i === sc.steps.length - 1;
    }

    document.querySelectorAll('#scn button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#scn button').forEach(x => x.classList.toggle('on', x === b));
      state.s = b.dataset.s; state.i = 0; draw();
    }));
    $('prev').addEventListener('click', () => { if (state.i > 0) { state.i--; draw(); } });
    $('next').addEventListener('click', () => { if (state.i < S[state.s].steps.length - 1) { state.i++; draw(); } });
    draw();
  })();

  // ---- next script ----

  (() => {
    // K03 的 DMA 動手看只在 K03 詞條頁上;其他頁沒有這張圖就整段跳過
    if (!root.querySelector('#pathCpu')) return;
    // 時間單位（相對值，僅供示意）
    const U = { GAP: 40, START: 60, MOVE: 8, ISR_IN: 6, ISR_OUT: 6, SETUP: 70, TC: 20, TAIL: 60 };
    const ISR_COST = U.ISR_IN + U.MOVE + U.ISR_OUT;
    const arrival = i => U.START + U.GAP * i;

    const $ = id => document.getElementById(id);
    const state = { mode: 'poll', n: 8, t: 0, playing: false, last: 0, plan: null };

    // 依模式產生 CPU／DMA 的時間區段與每個 byte 的搬移時間
    function buildPlan(mode, n) {
      const cpu = [], dma = [], bytes = [], irqs = [];
      const horizon = arrival(n - 1) + ISR_COST + U.TC + U.TAIL;
      let t = 0;
      if (mode === 'poll') {
        for (let i = 0; i < n; i++) {
          const a = arrival(i);
          cpu.push({ s: t, e: a, k: 'poll' });
          cpu.push({ s: a, e: a + U.MOVE, k: 'move', b: i });
          bytes.push({ a, ms: a, me: a + U.MOVE, via: 'cpu' });
          t = a + U.MOVE;
        }
      } else if (mode === 'irq') {
        for (let i = 0; i < n; i++) {
          const a = arrival(i);
          if (a > t) cpu.push({ s: t, e: a, k: 'main' });
          cpu.push({ s: a, e: a + U.ISR_IN, k: 'isr' });
          cpu.push({ s: a + U.ISR_IN, e: a + U.ISR_IN + U.MOVE, k: 'move', b: i });
          cpu.push({ s: a + U.ISR_IN + U.MOVE, e: a + ISR_COST, k: 'isr', out: true });
          bytes.push({ a, ms: a + U.ISR_IN, me: a + U.ISR_IN + U.MOVE, via: 'cpu' });
          irqs.push(a);
          t = a + ISR_COST;
        }
      } else {
        cpu.push({ s: 0, e: U.SETUP, k: 'setup' });
        for (let i = 0; i < n; i++) {
          const a = arrival(i);
          dma.push({ s: a, e: a + U.MOVE, k: 'dma', b: i });
          bytes.push({ a, ms: a, me: a + U.MOVE, via: 'dma' });
        }
        const done = arrival(n - 1) + U.MOVE;
        cpu.push({ s: U.SETUP, e: done, k: 'main' });
        cpu.push({ s: done, e: done + U.TC, k: 'tc' });
        irqs.push(done);
        t = done + U.TC;
      }
      cpu.push({ s: t, e: horizon, k: 'main', after: true });
      return { cpu, dma, bytes, irqs, horizon };
    }

    function cost(mode, n) {
      if (mode === 'poll') return arrival(n - 1) + U.MOVE;
      if (mode === 'irq') return ISR_COST * n;
      return U.SETUP + U.TC;
    }

    // 時間軸 DOM
    function buildGantt() {
      const p = state.plan;
      const pct = v => (v / p.horizon * 100) + '%';
      const fill = (track, segs) => {
        track.innerHTML = '';
        segs.forEach(sg => {
          const d = document.createElement('div');
          d.className = 'sg k-' + sg.k;
          d.style.left = pct(sg.s);
          d.style.width = '0';
          track.appendChild(d);
          sg.el = d;
        });
        const h = document.createElement('div');
        h.className = 'head';
        track.appendChild(h);
        return h;
      };
      state.heads = [fill($('trCpu'), p.cpu), fill($('trDma'), p.dma)];
      const tu = $('trUart');
      tu.innerHTML = '';
      p.bytes.forEach(b => {
        const d = document.createElement('div');
        d.className = 'tick';
        d.style.left = pct(b.a);
        tu.appendChild(d);
        b.tick = d;
      });
      const h = document.createElement('div');
      h.className = 'head';
      tu.appendChild(h);
      state.heads.push(h);
    }

    function buildCells() {
      const g = $('cells');
      g.innerHTML = '';
      state.cells = [];
      for (let i = 0; i < state.n; i++) {
        const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r.setAttribute('class', 'cell');
        r.setAttribute('x', 506 + (i % 8) * 14);
        r.setAttribute('y', 92 + Math.floor(i / 8) * 22);
        r.setAttribute('width', 12);
        r.setAttribute('height', 18);
        r.setAttribute('rx', 2);
        g.appendChild(r);
        state.cells.push(r);
      }
    }

    function pointsOf(id) {
      return $(id).getAttribute('points').trim().split(/\s+/).map(p => p.split(',').map(Number));
    }
    const paths = { cpu: pointsOf('pathCpu'), dma: pointsOf('pathDma') };

    function along(pts, f) {
      const lens = [];
      let total = 0;
      for (let i = 1; i < pts.length; i++) {
        const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        lens.push(l);
        total += l;
      }
      let d = f * total;
      for (let i = 0; i < lens.length; i++) {
        if (d <= lens[i]) {
          const r = d / lens[i];
          return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r];
        }
        d -= lens[i];
      }
      return pts[pts.length - 1];
    }

    const cpuColor = { main: '--c-main', poll: '--c-poll', move: '--c-move', isr: '--c-isr', setup: '--c-setup', tc: '--c-isr' };
    const cpuShort = { main: '主程式', poll: '輪詢中：來了沒？', move: '親手搬資料', isr: '中斷進出', setup: '設定 DMA', tc: '完成中斷' };

    function describe(seg, dmaSeg, t) {
      const n = state.n, p = state.plan;
      if (t >= p.horizon) {
        return { poll: `結束。${n} 個 byte 的等待期間，CPU 幾乎都在問「來了沒」，自己的工作完全沒有進度。`,
                 irq: `結束。CPU 被打斷了 ${n} 次，每次都要存現場、搬 1 個 byte、再回復現場。資料量越大，這筆成本越高。`,
                 dma: `結束。整段傳輸中，CPU 只花了「設定」和「完成中斷」兩筆固定時間，其他時間都在做自己的工作。` }[state.mode];
      }
      if (t === 0) return '按「播放」開始。';
      switch (seg.k) {
        case 'poll': return 'CPU 一直讀 UART 的狀態暫存器：「有資料了嗎？」還沒有就再問一次……這段時間什麼事都做不了。';
        case 'move': return state.mode === 'irq'
          ? `CPU 在 ISR 裡，親手把第 ${seg.b + 1} 個 byte 從 UART 搬到 RAM。`
          : `問到了！CPU 親手把第 ${seg.b + 1} 個 byte 從 UART 搬到 RAM，搬完又回去繼續問。`;
        case 'isr': return seg.out
          ? '搬完了，回復現場（把暫存器還原），回主程式繼續做。'
          : '叮！UART 發出中斷。CPU 暫停主程式，先把目前的暫存器存起來（存現場），再跳進 ISR。';
        case 'setup': return `CPU 設定 DMA：來源是 UART 資料暫存器，目的是 RAM buffer，長度 ${n} byte。設定完就不用再管。`;
        case 'tc': return `DMA 搬完 ${n} 個 byte，發出唯一一次「傳輸完成」中斷。CPU 這時才來處理整包資料。`;
        default:
          if (seg.after) return '傳輸已經結束，CPU 回到自己的工作。';
          if (dmaSeg) return `CPU 在做自己的工作。同一時間，DMA 正在搬第 ${dmaSeg.b + 1} 個 byte，CPU 完全不用經手。`;
          return state.mode === 'dma'
            ? 'CPU 在做自己的工作。DMA 在旁邊待命，下一個 byte 一進來就會自動搬。'
            : 'CPU 在做自己的工作，等 UART 有資料了再來叫它。';
      }
    }

    function render() {
      const p = state.plan, t = state.t;
      const pct = v => (v / p.horizon * 100) + '%';
      const clipW = sg => Math.max(0, Math.min(sg.e, t) - sg.s);
      p.cpu.forEach(sg => { sg.el.style.width = pct(clipW(sg)); });
      p.dma.forEach(sg => { sg.el.style.width = pct(clipW(sg)); });
      p.bytes.forEach((b, i) => {
        b.tick.classList.toggle('on', t >= b.a);
        state.cells[i].classList.toggle('full', t >= b.me);
      });
      state.heads.forEach(h => { h.style.left = pct(Math.min(t, p.horizon)); });

      const seg = p.cpu.find(sg => t >= sg.s && t < sg.e) || p.cpu[p.cpu.length - 1];
      const dmaSeg = p.dma.find(sg => t >= sg.s && t < sg.e);

      $('boxCpu').style.fill = t > 0 ? `var(${cpuColor[seg.k]})` : '';
      $('stCpu').textContent = t > 0 ? cpuShort[seg.k] : '主程式';
      $('boxDma').style.fill = dmaSeg ? 'var(--c-dma)' : '';
      $('stDma').textContent = state.mode !== 'dma' ? '沒有使用' : dmaSeg ? `搬第 ${dmaSeg.b + 1} 個` : '待命';
      $('gDma').classList.toggle('dim', state.mode !== 'dma');

      const waiting = p.bytes.some(b => t >= b.a && t < b.ms);
      const moving = p.bytes.find(b => t >= b.ms && t < b.me);
      $('boxUart').style.fill = (waiting || moving) ? 'var(--c-poll)' : '';
      $('stUart').textContent = (waiting || moving) ? '有 1 byte' : '等資料';

      const tok = $('token');
      $('pathCpu').classList.toggle('live', !!moving && moving.via === 'cpu');
      $('pathDma').classList.toggle('live', !!moving && moving.via === 'dma');
      if (moving) {
        const [x, y] = along(paths[moving.via], (t - moving.ms) / (moving.me - moving.ms));
        tok.setAttribute('cx', x);
        tok.setAttribute('cy', y);
        tok.classList.toggle('via-dma', moving.via === 'dma');
      } else {
        tok.setAttribute('cx', -20);
        tok.setAttribute('cy', -20);
      }

      const io = p.cpu.filter(sg => sg.k !== 'main').reduce((s, sg) => s + clipW(sg), 0);
      $('mRecv').textContent = `${p.bytes.filter(b => t >= b.me).length}/${state.n}`;
      $('mIrq').textContent = p.irqs.filter(x => t >= x).length;
      $('mIo').textContent = t > 0 ? Math.round(io / t * 100) + '%' : '0%';
      $('mMain').textContent = Math.round(t - io);
      $('status').textContent = describe(seg, dmaSeg, t);
    }

    function renderBars() {
      const n = state.n;
      const rows = [['poll', 'Polling', '--c-poll'], ['irq', 'Interrupt', '--c-isr'], ['dma', 'DMA', '--c-dma']];
      const max = Math.max(...rows.map(r => cost(r[0], n)));
      $('bars').innerHTML = rows.map(([m, name, c]) => {
        const v = cost(m, n);
        return `<div class="bar-row"><span class="bl">${name}</span>` +
               `<div class="bt"><div class="bf" style="width:${v / max * 100}%;background:var(${c})"></div></div>` +
               `<span class="bv">${v}</span></div>`;
      }).join('');
      const irq = cost('irq', n), dma = cost('dma', n);
      $('verdict').innerHTML = irq < dma
        ? `<b>${n} byte 時，Interrupt 比 DMA 省。</b>資料這麼少，光是 DMA 的設定（70）加完成中斷（20），就比直接用中斷搬完還貴。`
        : irq === dma
          ? `<b>${n} byte 時剛好打平。</b>資料再多一點，DMA 就開始划算。`
          : `<b>${n} byte 時，DMA 最省。</b>DMA 的成本固定是 90，不會隨資料量增加；Interrupt 每多一個 byte 就多付 20。`;
    }

    function reset() {
      state.playing = false;
      state.t = 0;
      $('playBtn').textContent = '▶ 播放';
      state.plan = buildPlan(state.mode, state.n);
      buildGantt();
      buildCells();
      render();
      renderBars();
    }

    function loop(ts) {
      if (!state.playing) return;
      const dt = Math.min((ts - state.last) / 1000, 0.1);
      state.last = ts;
      state.t = Math.min(state.t + dt * Number($('speed').value), state.plan.horizon);
      render();
      if (state.t >= state.plan.horizon) {
        state.playing = false;
        $('playBtn').textContent = '▶ 再播一次';
        return;
      }
      requestAnimationFrame(loop);
    }

    $('playBtn').addEventListener('click', () => {
      if (state.playing) {
        state.playing = false;
        $('playBtn').textContent = '▶ 繼續';
        return;
      }
      if (state.t >= state.plan.horizon) { state.t = 0; render(); }
      state.playing = true;
      state.last = performance.now();
      $('playBtn').textContent = '⏸ 暫停';
      requestAnimationFrame(loop);
    });

    $('resetBtn').addEventListener('click', reset);

    $('modeSeg').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      state.mode = b.dataset.mode;
      [...$('modeSeg').children].forEach(x => x.classList.toggle('on', x === b));
      reset();
    });

    $('nRange').addEventListener('input', e => {
      state.n = Number(e.target.value);
      $('nVal').textContent = state.n;
      reset();
    });

    reset();

    // double buffer 動畫：每一輪 DMA 寫一塊、CPU 處理另一塊，輪完對調
    const DB_CYCLE = 3;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const db = { t: 0, playing: !reduced, last: 0 };

    function renderDb() {
      const phase = Math.floor(db.t / DB_CYCLE) % 2;
      const frac = (db.t % DB_CYCLE) / DB_CYCLE;
      const w = 180;
      const dmaOnA = phase === 0;
      $('dbFillA').setAttribute('width', dmaOnA ? w * frac : w);
      $('dbFillB').setAttribute('width', dmaOnA ? w : w * frac);
      const pctTxt = Math.round(frac * 100) + '%';
      $('dbTxtA').textContent = dmaOnA ? `A：DMA 寫入中 ${pctTxt}` : 'A：CPU 處理中';
      $('dbTxtB').textContent = dmaOnA ? 'B：CPU 處理中' : `B：DMA 寫入中 ${pctTxt}`;
      $('dbDA').setAttribute('class', dmaOnA ? 'ln-accent' : 'ln-soft');
      $('dbDB').setAttribute('class', dmaOnA ? 'ln-soft' : 'ln-accent');
      $('dbAC').setAttribute('class', dmaOnA ? 'ln-soft' : 'ln');
      $('dbBC').setAttribute('class', dmaOnA ? 'ln' : 'ln-soft');
      $('dbStatus').textContent = frac >= 0.5
        ? '過半 → 發 half-transfer 中斷；寫滿後兩塊對調'
        : 'DMA 寫一塊，CPU 同時處理另一塊，兩邊不會撞在一起';
    }

    function loopDb(ts) {
      if (!db.playing) return;
      db.t += Math.min((ts - db.last) / 1000, 0.1);
      db.last = ts;
      renderDb();
      requestAnimationFrame(loopDb);
    }

    $('dbBtn').addEventListener('click', () => {
      db.playing = !db.playing;
      $('dbBtn').textContent = db.playing ? '⏸ 暫停' : '▶ 播放';
      if (db.playing) { db.last = performance.now(); requestAnimationFrame(loopDb); }
    });

    $('dbBtn').textContent = db.playing ? '⏸ 暫停' : '▶ 播放';
    renderDb();
    if (db.playing) { db.last = performance.now(); requestAnimationFrame(loopDb); }
  })();
  return cleanup
}

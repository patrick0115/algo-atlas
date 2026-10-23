// @ts-nocheck —— 原講義 public/semi/O-ai-dev.html 的互動程式照搬,不改邏輯。
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

    // ctx：[規則, 對話, 檔案, 工具輸出]，單位是 context 上限的百分比（示意）
    const steps = [
      { name: '需求', sub: '目標＋驗收條件', code: 'O01', gate: true,
        what: '用自然語言告訴 agent 要什麼。這一步決定了它「什麼時候會停」。',
        risk: '只說「修好登入」「弄好一點」，沒有驗收條件，AI 只能用「看起來對」來判斷完成。',
        human: '寫出可檢查的驗收條件（輸入→預期輸出、要跑的測試）、範圍（哪些檔）、範圍外（不重構、不升級套件）。',
        good: { ctx: [5, 3, 0, 0] },
        bad: { ctx: [18, 3, 0, 0], trap: '一句「幫我把 PA 解析弄好一點」。規則檔也寫了 600 行，一開場就佔掉一大塊 context。',
               cost: 'AI 自己決定範圍與完成條件：改了 12 個檔、加了沒要的功能，你也無從判斷它到底做對沒有。' } },
      { name: '拆任務', sub: '先計畫再動手', code: 'O01', gate: true,
        what: '把需求拆成幾個小步，每步都能單獨測、單獨 commit。多檔修改先讓 agent 只讀不寫、提出計畫。',
        risk: '一次丟整個功能、跳過計畫，方向錯了要寫完才發現。',
        human: '審計畫：要改哪些檔、順序、它做了哪些假設；不對就在這裡改，成本最低。',
        good: { ctx: [5, 6, 0, 0] },
        bad: { ctx: [18, 4, 0, 0], trap: '「直接把整個匯出功能做完」，沒有計畫、沒有分步。',
               cost: '錯誤的假設一路延續到最後；diff 一大包，壞了也不知道該退哪一段。' } },
      { name: '讀既有程式', sub: '搜尋、讀規則檔', code: 'O02／O04', gate: false,
        what: '用 grep／glob／讀檔找到相關程式、既有 helper 與寫法慣例。需要時才讀，不是全部讀。',
        risk: '沒讀到既有實作就自己重寫一份；或讀太多無關檔案，關鍵資訊被淹沒在 context 中段。',
        human: '點名參考檔與既有 pattern；精確識別字用關鍵字搜尋；大範圍探索交給 subagent，只拿摘要。',
        good: { ctx: [5, 7, 12, 3] },
        bad: { ctx: [18, 6, 45, 5], trap: '「先把整個 repo 讀一遍」，幾十個檔案全塞進 context。',
               cost: '檔案就佔掉近一半 context；lost in the middle，真正相關的那幾行反而被忽略。' } },
      { name: '呼叫工具', sub: '讀檔、跑指令、MCP', code: 'O03', gate: false,
        what: '模型輸出工具呼叫，client 查權限後執行：跑 build、跑測試、查 MCP 接的資料庫或 issue。結果回到 context。',
        risk: '權限全開；工具結果（網頁、文件）裡藏著惡意指示（prompt injection）；整份 log 倒進 context。',
        human: '最小權限：唯讀與測試指令 allow、危險指令 deny、對外連線白名單；只裝信任的 MCP server。',
        good: { ctx: [5, 8, 14, 10] },
        bad: { ctx: [18, 8, 45, 20], trap: '所有工具一律放行，還裝了來路不明的 MCP server；測試 log 整份貼回來。',
               cost: 'context 逼近上限；外部內容裡的一段文字就可能讓 agent 讀 .env 再往外送。' } },
      { name: '產生 diff', sub: '只動該動的', code: 'O05／O06', gate: false,
        what: 'agent 修改檔案，產生 diff。',
        risk: '過度修改（順手重構、改格式、改 import）；呼叫不存在的 API、引入不存在的套件（幻覺）。',
        human: '要求 diff 小而聚焦；新增依賴一律要人決定。',
        good: { ctx: [5, 10, 15, 11] },
        bad: { ctx: [18, 12, 45, 22], trap: 'context 已經 97%，觸發自動壓縮，早期講的「不要改格式」被摘要掉了。',
               cost: 'diff 800 行跨 20 檔，一半是格式與 import 變動，還多了一個沒聽過的套件。' } },
      { name: '人工 review', sub: '對照驗收條件', code: 'O05', gate: true,
        what: '逐段看 diff：改了哪些檔、每一段為什麼要改、是否符合驗收條件。',
        risk: '「看起來對」就接受；確認框按到麻木（rubber-stamp）。',
        human: '先看改動檔案清單、超出範圍的直接退；查新套件是否真的存在、有無寫死密碼、有無刪掉檢查。看不懂的不合併。',
        good: { ctx: [5, 12, 15, 11] },
        bad: { ctx: [18, 13, 45, 22], trap: 'diff 太大看不完，直接「全部接受」。',
               cost: '幻覺套件、寫死的 API Key、被刪掉的錯誤處理一起進來了。' } },
      { name: '測試', sub: 'build＋回歸', code: 'O05', gate: false,
        what: '跑 build、單元測試、回歸樣本比對。這是讓 agent 自己知道「做對了沒」的訊號。',
        risk: '測試失敗時，AI 改 assert、加 skip、刪案例讓它變綠；只測新案例沒跑回歸。',
        human: '測試檔的變動要單獨審；回歸集一定要跑，輸出差異逐一確認是改善還是退步。',
        good: { ctx: [5, 12, 15, 16] },
        bad: { ctx: [18, 13, 45, 22], trap: '測試失敗，AI 把預期值改成目前的輸出，全部綠燈。',
               cost: '測試失去意義；舊樣本的結果默默變了，要等使用者回報才知道。' } },
      { name: 'commit／rollback', sub: '小步存檔、可退回', code: 'O05', gate: true,
        what: '每個可運作的狀態就 commit；壞了用 git 退回。下一個不相關的任務先清掉 context。',
        risk: '一整天沒 commit；以為 agent 的回復功能能救一切（它不追蹤 shell 改的檔）。',
        human: '小步 commit、訊息寫清楚；已推出去的用 revert；實驗開 branch／worktree。',
        good: { ctx: [5, 2, 0, 0] },
        bad: { ctx: [18, 13, 45, 22], trap: '修改全堆在工作目錄沒 commit，context 也不清，直接接下一個任務。',
               cost: '壞了只能整包丟掉或手動挑；下一個任務帶著滿滿的舊 context 開始，從第 1 步就處在劣勢。' } },
    ];

    const BOX = [[20, 40], [245, 40], [470, 40], [695, 40], [695, 160], [470, 160], [245, 160], [20, 160]];
    const BW = 185, BH = 60;
    let cur = 0, mode = 'good';

    function draw() {
      const g = $('lpg');
      g.innerHTML = '';
      const bad = mode === 'bad';
      // 箭頭
      const ar = (x1, y1, x2, y2) => g.appendChild(el('line', { x1, y1, x2, y2, class: 'ln', 'marker-end': 'url(#ah)' }));
      for (let i = 0; i < 3; i++) ar(BOX[i][0] + BW + 2, 70, BOX[i + 1][0] - 4, 70);
      ar(787, 102, 787, 156);
      for (let i = 4; i < 7; i++) ar(BOX[i][0] - 2, 190, BOX[i + 1][0] + BW + 4, 190);
      ar(60, 158, 60, 104);
      g.appendChild(el('text', { x: 70, y: 136, class: 't-small' }, '下一個任務，或回頭修正需求'));
      // 方塊
      steps.forEach((s, i) => {
        const [x, y] = BOX[i];
        const on = i === cur;
        const r = el('rect', { x, y, width: BW, height: BH, rx: 6, class: on ? 'bx-accent' : 'bx' });
        if (on && bad) r.setAttribute('style', 'stroke-dasharray:6 4;stroke-width:2');
        r.style.cursor = 'pointer';
        r.addEventListener('click', () => { cur = i; draw(); });
        g.appendChild(r);
        g.appendChild(el('text', { x: x + 12, y: y + 25, class: 't-strong' }, `${i + 1} ${s.name}`));
        g.appendChild(el('text', { x: x + 12, y: y + 47, class: 't-small' }, s.sub));
        if (s.gate) {
          const gy = y < 100 ? y - 22 : y + BH + 6;
          g.appendChild(el('rect', { x: x + BW - 92, y: gy, width: 92, height: 16, rx: 3, class: 'gate', style: bad ? 'stroke-dasharray:3 3' : '' }));
          g.appendChild(el('text', { x: x + BW - 86, y: gy + 12, class: 't-small', 'font-size': 11 }, bad ? '人把關（略過）' : '人把關'));
        }
      });
      // context 長條
      const ctx = steps[cur][mode].ctx;
      const total = ctx.reduce((a, b) => a + b, 0);
      const X0 = 20, W = 860, Y = 276, H = 20;
      g.appendChild(el('text', { x: X0, y: Y - 8, class: 't-small' }, 'context 使用量（示意）'));
      g.appendChild(el('text', { x: X0 + W, y: Y - 8, class: total >= 80 ? 't-accent' : 't-small', 'text-anchor': 'end' },
        `${Math.min(total, 100)}%${total >= 80 ? '　接近上限：自動壓縮、早期指示可能被摘掉' : ''}`));
      g.appendChild(el('rect', { x: X0, y: Y, width: W, height: H, rx: 3, class: 'bx' }));
      const cls = ['c-rules', 'c-conv', 'c-file', 'c-tool'];
      let x = X0, left = 100;
      ctx.forEach((v, k) => {
        const vv = Math.min(v, left); left -= vv;
        if (vv <= 0) return;
        g.appendChild(el('rect', { x, y: Y + 1, width: vv / 100 * W, height: H - 2, class: cls[k] }));
        x += vv / 100 * W;
      });
      const x80 = X0 + 0.8 * W;
      g.appendChild(el('line', { x1: x80, y1: Y - 2, x2: x80, y2: Y + H + 4, class: 'ln-accent dash' }));
      g.appendChild(el('text', { x: x80, y: Y + H + 18, class: 't-small', 'text-anchor': 'middle' }, '警戒線（示意）'));

      // 說明
      const s = steps[cur];
      $('stTitle').textContent = `${cur + 1}. ${s.name}（${s.code}）${bad ? '　常見地雷' : '　好的做法'}`;
      $('stWhat').textContent = s.what;
      const rows = bad
        ? [['地雷情境', s.bad.trap], ['後果', s.bad.cost], ['該怎麼做', s.human]]
        : [['常見出錯點', s.risk], ['人該把關', s.human]];
      $('stDl').innerHTML = rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
      $('phase').textContent = `第 ${cur + 1} / ${steps.length} 步`;
      document.querySelectorAll('#steps button').forEach((b, k) => b.classList.toggle('on', k === cur));
      $('prev').disabled = cur === 0;
      $('next').disabled = cur === steps.length - 1;
    }

    const ul = $('steps');
    steps.forEach((s, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.innerHTML = `<span class="no">${i + 1}</span>${s.name}`;
      b.addEventListener('click', () => { cur = i; draw(); });
      li.appendChild(b);
      ul.appendChild(li);
    });
    document.querySelectorAll('#mode button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#mode button').forEach(x => x.classList.toggle('on', x === b));
      mode = b.dataset.m; draw();
    }));
    $('prev').addEventListener('click', () => { if (cur > 0) { cur--; draw(); } });
    $('next').addEventListener('click', () => { if (cur < steps.length - 1) { cur++; draw(); } });
    draw();
  })();
  return cleanup
}

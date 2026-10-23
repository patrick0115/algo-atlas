// @ts-nocheck —— 原講義 public/semi/C-design.html 的互動程式照搬,不改邏輯。
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

    /* ===== 主圖一：流程 stepper ===== */
    const steps = [
      { s: 'RTL', name: 'RTL 設計', ph: '前端',
        in: ['規格書（功能、腳位、時序）', '架構文件'], out: ['Verilog／SV 原始碼', '時脈與 reset 架構'], cat: ['（還沒有工具檢查）', '規格理解錯在這裡埋下'],
        what: '把規格寫成暫存器之間的搬運規則。顯示驅動 IC 的 TCON 時序產生、介面接收、暫存器表都在這一層。',
        why: '最便宜的修改點：這裡改一行，後面全部重跑就好；越往後修越貴。' },
      { s: '功能驗證', name: '功能驗證', ph: '前端',
        in: ['RTL', 'testbench／UVM、測試向量'], out: ['模擬波形、coverage 報告', 'lint／CDC 報告'], cat: ['功能 bug、狀態機漏狀態', '跨時脈域沒同步（CDC）', '不可合成的寫法（lint）'],
        what: '用模擬、lint、CDC 檢查 RTL 行為與寫法。功能 coverage 收斂前不該往下走。',
        why: 'AI 輔助產生 RTL 或 testbench 時，這一關就是把關點：生成的 code 看起來對，不代表 coverage 夠。' },
      { s: '邏輯合成', name: '邏輯合成', ph: '前端',
        in: ['RTL', '標準元件庫 .lib', 'SDC 時序限制'], out: ['Gate-level netlist', '初步時序／面積／功耗'], cat: ['SDC 寫錯、時脈沒定義', '初估時序太緊', 'LEC 確認翻譯沒走樣'],
        what: '工具把 RTL 翻成標準元件組成的 netlist，依 SDC 做最佳化。',
        why: '此時沒有真實的線，時序是估的；SDC 是之後每一步的「考題」，錯了全部白做。' },
      { s: 'DFT', name: 'DFT 插入', ph: '前端',
        in: ['Gate netlist', 'DFT 規格（chain 數、壓縮）'], out: ['含 scan 的 netlist', 'MBIST 控制器', 'ATPG 向量'], cat: ['DFT rule 違規（不可控時脈）', 'coverage 不足', 'LEC：scan 外功能不變'],
        what: 'FF 換成 scan FF 並串鏈、插 MBIST、跑 ATPG 估 coverage（詳見 C04）。',
        why: '插完 scan 後要用 LEC 確認功能模式下電路沒被改壞。' },
      { s: 'Floorplan', name: 'Floorplan／電源規劃', ph: '後端',
        in: ['Netlist', '巨集與 IP 的 LEF', 'I/O pad 規劃'], out: ['晶片外框與巨集位置', '電源網（power grid）'], cat: ['面積放不下', '電源網太弱（IR／EM 埋雷）', '繞線通道被擋'],
        what: '決定晶片長寬、memory 與類比 IP 擺哪、pad 怎麼排、電源網多密。',
        why: '顯示驅動 IC 晶片細長，pad 沿長邊排，floorplan 直接決定電源從哪進、繞線會不會塞。' },
      { s: '擺放+CTS', name: '擺放＋時脈樹', ph: '後端',
        in: ['Floorplan', 'Netlist', 'SDC'], out: ['擺好元件的設計', '平衡過的時脈樹'], cat: ['擁擠熱點（congestion）', 'skew 太大', 'CTS 後 hold 冒出來'],
        what: '工具把成千上萬個 cell 擺進 row，再用 buffer 樹把時脈送到每個 FF。',
        why: 'CTS 之前時脈當作理想（0 延遲），之後才有真實 skew，hold 違規通常在這裡開始修。' },
      { s: '繞線', name: '繞線（Routing）', ph: '後端',
        in: ['擺好元件的設計', '金屬層規則'], out: ['完成繞線的佈局', 'DEF／資料庫'], cat: ['繞不完（open）', '初步 DRC 違規', '串擾（crosstalk）'],
        what: '用多層金屬把所有接腳接起來，同時顧時序、串擾與 antenna 規則。',
        why: '相鄰長線會互相耦合，一條切換時把另一條拖慢或推快，這就是 SI（signal integrity）對時序的影響。' },
      { s: '萃取+STA', name: '寄生萃取＋STA 簽核', ph: '簽核',
        in: ['佈局', '萃取規則（PDK）', '各 corner .lib'], out: ['SPEF（RC 寄生）', 'STA 報告（各 corner）', 'IR／EM 報告'], cat: ['setup／hold 違規', 'IR drop、EM 超標', '轉換時間、負載超限'],
        what: '從佈局算出每條線的 RC，在所有 PVT corner 下跑 STA，並做 IR drop、EM 分析。',
        why: '這是時序的最終答案。違規就 ECO：調元件大小、插 buffer、改繞線，再萃取再跑，直到全部 corner 收斂。' },
      { s: 'DRC/LVS', name: 'DRC／LVS 實體驗證', ph: '簽核',
        in: ['GDS 佈局', 'Netlist', 'DRC／LVS rule deck'], out: ['DRC、LVS、ERC 報告'], cat: ['線寬、間距、密度違規', '短路、斷路、元件不符', 'antenna 違規'],
        what: 'DRC 查幾何規則，LVS 從佈局反推電路跟 netlist 比對，ERC 查電氣錯誤。',
        why: '必須「乾淨」（clean）才能交給晶圓廠；類比區塊的 LVS 常比數字區塊難收。' },
      { s: 'GDS', name: 'GDS 下線（Tape-out）', ph: '下線',
        in: ['全部簽核通過的佈局'], out: ['GDSII／OASIS', '交給晶圓廠做光罩'], cat: ['晶圓廠再跑一次規則檢查', '之後的修改只能 ECO'],
        what: '輸出 GDS，晶圓廠做光罩、開始投片。',
        why: '下線後再發現 bug：小的用 spare cell 做 metal-only ECO，大的全光罩改版。' },
    ];

    let cur = 0;
    const BW = 80, GAP = 10;
    const bx = i => i * (BW + GAP);

    function drawFlow() {
      const svg = $('flowSvg');
      svg.innerHTML = '';
      // 階段括號
      [['前端（邏輯）', 0, 3], ['後端（實體）', 4, 6], ['簽核', 7, 8], ['下線', 9, 9]].forEach(([t, a, b]) => {
        svg.appendChild(el('line', { x1: bx(a), y1: 22, x2: bx(b) + BW, y2: 22, class: 'ln' }));
        svg.appendChild(el('text', { x: bx(a), y: 16, class: 't-small' }, t));
      });
      svg.appendChild(el('line', { x1: 0, y1: 60, x2: bx(9) + BW, y2: 60, class: 'ln' }));
      steps.forEach((st, i) => {
        const on = i === cur;
        svg.appendChild(el('rect', { x: bx(i), y: 30, width: BW, height: 60, rx: 6, class: on ? 'bx-accent' : 'bx', 'stroke-width': on ? 2.5 : 1 }));
        svg.appendChild(el('text', { x: bx(i) + 8, y: 50, class: 't-small' }, String(i + 1)));
        svg.appendChild(el('text', { x: bx(i) + 8, y: 74, class: on ? 't-accent' : '' }, st.s));
      });
      // 指向下方面板
      const cx = bx(cur) + BW / 2;
      svg.appendChild(el('line', { x1: cx, y1: 90, x2: cx, y2: 106, class: 'ln-accent' }));
      const st = steps[cur];
      const panels = [['吃進什麼（輸入）', st.in], ['吐出什麼（輸出）', st.out], ['這一步會抓到／埋下', st.cat]];
      panels.forEach(([h, lines], k) => {
        const x = k * 305;
        svg.appendChild(el('rect', { x, y: 106, width: 280, height: 114, rx: 6, class: k === 2 ? 'bx-accent' : 'bx' }));
        svg.appendChild(el('text', { x: x + 12, y: 130, class: 't-accent' }, h));
        lines.forEach((ln, j) => svg.appendChild(el('text', { x: x + 12, y: 158 + j * 24, class: 't-small' }, '・' + ln)));
      });
      $('stTitle').textContent = `${cur + 1}. ${st.name}`;
      $('stWhat').textContent = st.what;
      $('stWhy').textContent = st.why;
      $('phase').textContent = `${st.ph}　第 ${cur + 1} / ${steps.length} 步`;
      document.querySelectorAll('#steps button').forEach((b, k) => b.classList.toggle('on', k === cur));
      $('prev').disabled = cur === 0;
      $('next').disabled = cur === steps.length - 1;
    }

    const ul = $('steps');
    steps.forEach((st, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.innerHTML = `<span class="no">${i + 1}</span>${st.s}`;
      b.addEventListener('click', () => { cur = i; drawFlow(); });
      li.appendChild(b);
      ul.appendChild(li);
    });
    $('prev').addEventListener('click', () => { if (cur > 0) { cur--; drawFlow(); } });
    $('next').addEventListener('click', () => { if (cur < steps.length - 1) { cur++; drawFlow(); } });
    drawFlow();

    /* ===== 主圖二：setup／hold ===== */
    const TCQ = 0.4, TSU = 0.3, TH = 0.2;
    const presets = {
      ok: { T: 5, max: 3.5, min: 0.8, s: 0.2 },
      setup: { T: 4, max: 4.2, min: 0.8, s: 0 },
      hold: { T: 5, max: 3, min: 0.2, s: 1.2 },
    };
    const tm = { T: 5, max: 3.5, min: 0.8, s: 0.2 };
    const tMin = -1, tMax = 13, X0 = 120, XW = 760;
    const X = t => X0 + (Math.min(Math.max(t, tMin), tMax) - tMin) / (tMax - tMin) * XW;
    const f1 = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1);

    function clockPts(off, T, yH, yL) {
      // 上升緣在 off + kT，高電位維持 T/2
      const y = l => (l ? yH : yL);
      const ph = ((tMin - off) % T + T) % T;
      let lv = ph < T / 2 ? 1 : 0;
      const tr = [];
      for (let k = Math.floor((tMin - off) / T) - 1; off + k * T < tMax; k++) {
        [[off + k * T, 1], [off + k * T + T / 2, 0]].forEach(([t, l]) => { if (t > tMin && t < tMax) tr.push([t, l]); });
      }
      let pts = `${X(tMin)},${y(lv)} `;
      tr.forEach(([t, l]) => { pts += `${X(t)},${y(lv)} ${X(t)},${y(l)} `; lv = l; });
      return pts + `${X(tMax)},${y(lv)}`;
    }

    function drawTiming() {
      const svg = $('tSvg');
      svg.innerHTML = '';
      const { T, max, min, s } = tm;
      // 標籤
      svg.appendChild(el('text', { x: 4, y: 58, class: 't-strong' }, 'Launch CLK'));
      svg.appendChild(el('text', { x: 4, y: 118, class: 't-strong' }, 'Capture CLK'));
      svg.appendChild(el('text', { x: 4, y: 178, class: 't-strong' }, 'Capture D'));
      // 時脈
      svg.appendChild(el('polyline', { points: clockPts(0, T, 40, 64), class: 'ln-fg', 'stroke-width': 1.8 }));
      svg.appendChild(el('polyline', { points: clockPts(s, T, 100, 124), class: 'ln-fg', 'stroke-width': 1.8 }));
      // 邊緣標線
      svg.appendChild(el('line', { x1: X(0), y1: 30, x2: X(0), y2: 196, class: 'ln dash' }));
      svg.appendChild(el('line', { x1: X(s), y1: 92, x2: X(s), y2: 196, class: 'ln dash' }));
      svg.appendChild(el('line', { x1: X(T + s), y1: 92, x2: X(T + s), y2: 196, class: 'ln dash' }));
      svg.appendChild(el('text', { x: X(0) + 4, y: 34, class: 't-small' }, '發射邊緣'));
      svg.appendChild(el('text', { x: X(T + s) + 4, y: 96, class: 't-small' }, '下一個取樣邊緣'));
      // 資料：舊值 → 變化區 → 新值
      const a = TCQ + min, b = TCQ + max;
      const yT = 160, yB = 184;
      svg.appendChild(el('rect', { x: X(a), y: yT, width: Math.max(X(b) - X(a), 1), height: yB - yT, class: 'bx-soft' }));
      svg.appendChild(el('polyline', { points: `${X(tMin)},${yT} ${X(a)},${yT} ${X(a)},${yB} ${X(tMin)},${yB}`, class: 'ln-fg' }));
      svg.appendChild(el('polyline', { points: `${X(tMax)},${yT} ${X(b)},${yT} ${X(b)},${yB} ${X(tMax)},${yB}`, class: 'ln-fg' }));
      svg.appendChild(el('line', { x1: X(a), y1: yT, x2: X(b), y2: yB, class: 'ln' }));
      svg.appendChild(el('line', { x1: X(a), y1: yB, x2: X(b), y2: yT, class: 'ln' }));
      svg.appendChild(el('text', { x: X(a) + 4, y: 154, class: 't-small' }, '資料可能在變'));
      // setup／hold 視窗
      const hs = s, he = s + TH, ss = T + s - TSU, se = T + s;
      svg.appendChild(el('rect', { x: X(hs), y: 156, width: X(he) - X(hs), height: 32, class: 'ln-accent dash' }));
      svg.appendChild(el('rect', { x: X(ss), y: 156, width: X(se) - X(ss), height: 32, class: 'ln-accent dash' }));
      svg.appendChild(el('text', { x: X(hs) - 4, y: 208, class: 't-accent', 'font-size': 12 }, 'hold'));
      svg.appendChild(el('text', { x: X(ss) - 8, y: 208, class: 't-accent', 'font-size': 12 }, 'setup'));
      // 時間軸
      svg.appendChild(el('line', { x1: X0, y1: 222, x2: X0 + XW, y2: 222, class: 'ln' }));
      for (let t = tMin; t <= tMax; t++) {
        svg.appendChild(el('line', { x1: X(t), y1: 219, x2: X(t), y2: 225, class: 'ln' }));
        svg.appendChild(el('text', { x: X(t) - 4, y: 241, class: 't-small' }, String(t)));
      }
      svg.appendChild(el('text', { x: 4, y: 241, class: 't-small' }, '時間（ns）'));

      const sSetup = T + s - (TCQ + max) - TSU;
      const sHold = (TCQ + min) - (s + TH);
      $('sSetup').innerHTML = `<b>Setup slack</b>＝T + skew − (Tcq + Dmax) − Tsetup ＝ ${T.toFixed(1)} ${f1(s)} − ${(TCQ + max).toFixed(1)} − ${TSU} ＝ <b>${f1(sSetup)} ns ${sSetup >= 0 ? '通過' : '違規'}</b>`;
      $('sHold').innerHTML = `<b>Hold slack</b>＝(Tcq + Dmin) − (skew + Thold) ＝ ${(TCQ + min).toFixed(1)} − (${s.toFixed(1)} + ${TH}) ＝ <b>${f1(sHold)} ns ${sHold >= 0 ? '通過' : '違規'}</b>`;
      let note;
      if (sHold < 0) note = '資料在「同一個」取樣邊緣的 hold 視窗內就變了，接收端可能抓到新資料或亞穩態。拉長週期 T 試試：hold slack 一點都不變。對策是在短路徑插 delay，或把 skew 調小。';
      else if (sSetup < 0) note = '最慢的資料趕不上下一個取樣邊緣的 setup 視窗。可以拉長 T（降頻）、縮短 Dmax（優化路徑），或增加正 skew 借時間，但正 skew 會吃掉 hold 餘裕。';
      else note = '兩個都通過。試著把 skew 往右拉：setup 變寬鬆，hold 卻越來越緊。';
      $('sNote').textContent = note;
      $('oT').textContent = T.toFixed(1) + ' ns';
      $('oMax').textContent = max.toFixed(1) + ' ns';
      $('oMin').textContent = min.toFixed(1) + ' ns';
      $('oS').textContent = f1(s) + ' ns';
    }

    const bind = (id, key) => $(id).addEventListener('input', e => {
      tm[key] = +e.target.value;
      if (key === 'min' && tm.min > tm.max) { tm.max = tm.min; $('rMax').value = tm.max; }
      if (key === 'max' && tm.max < tm.min) { tm.min = tm.max; $('rMin').value = tm.min; }
      document.querySelectorAll('#preset button').forEach(x => x.classList.remove('on'));
      drawTiming();
    });
    bind('rT', 'T'); bind('rMax', 'max'); bind('rMin', 'min'); bind('rS', 's');
    function applyPreset(k) {
      Object.assign(tm, presets[k]);
      $('rT').value = tm.T; $('rMax').value = tm.max; $('rMin').value = tm.min; $('rS').value = tm.s;
      document.querySelectorAll('#preset button').forEach(x => x.classList.toggle('on', x.dataset.k === k));
      drawTiming();
    }
    document.querySelectorAll('#preset button').forEach(b => b.addEventListener('click', () => applyPreset(b.dataset.k)));
    applyPreset('ok');

    /* ===== C04 scan chain 靜態圖 ===== */
    const g = $('scanG');
    [80, 340, 600].forEach((x, i) => {
      g.appendChild(el('polygon', { points: `${x},40 ${x + 36},55 ${x + 36},105 ${x},120`, class: 'bx' }));
      g.appendChild(el('text', { x: x + 5, y: 64, class: 't-small', 'font-size': 10 }, '0'));
      g.appendChild(el('text', { x: x + 5, y: 104, class: 't-small', 'font-size': 10 }, '1'));
      g.appendChild(el('line', { x1: x + 36, y1: 80, x2: x + 60, y2: 80, class: 'ln-fg' }));
      g.appendChild(el('rect', { x: x + 60, y: 55, width: 80, height: 50, rx: 4, class: 'bx' }));
      g.appendChild(el('text', { x: x + 82, y: 85 }, 'FF ' + (i + 1)));
      // D 輸入（來自組合邏輯）
      g.appendChild(el('line', { x1: x - 34, y1: 60, x2: x, y2: 60, class: 'ln' }));
      // SE
      g.appendChild(el('line', { x1: x + 18, y1: 113, x2: x + 18, y2: 140, class: 'ln' }));
      // Q 往下一顆的 SI
      const qEnd = i < 2 ? x + 260 : 860;
      if (i < 2) g.appendChild(el('polyline', { points: `${x + 140},80 ${x + 215},80 ${x + 215},100 ${qEnd},100`, class: 'ln-accent' }));
      else g.appendChild(el('line', { x1: x + 140, y1: 80, x2: 860, y2: 80, class: 'ln-accent' }));
    });
    g.appendChild(el('line', { x1: 40, y1: 100, x2: 80, y2: 100, class: 'ln-accent' }));
    g.appendChild(el('text', { x: 4, y: 104, class: 't-accent' }, 'SI'));
    g.appendChild(el('text', { x: 866, y: 84, class: 't-accent' }, 'SO'));
    g.appendChild(el('text', { x: 4, y: 64, class: 't-small' }, 'D'));
    g.appendChild(el('line', { x1: 40, y1: 140, x2: 820, y2: 140, class: 'ln' }));
    g.appendChild(el('text', { x: 4, y: 144, class: 't-small' }, 'SE'));
    g.appendChild(el('text', { x: 250, y: 52, class: 't-small' }, '組合邏輯 →'));
  })();
  return cleanup
}

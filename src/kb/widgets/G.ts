// @ts-nocheck —— 原講義 public/semi/G-quality.html 的互動程式照搬,不改邏輯。
// 唯一的差別:document、計時器換成 scope() 給的替身,只在目前這一頁的範圍裡找元素,離開頁面時清掉計時器。
// 另外主圖(Cp/Cpk、管制圖)只在書頁上,詞條頁沒有它們就不畫(here())。
import { scope } from './scope'

export function mount(root: HTMLElement) {
  const { document, setInterval, setTimeout, requestAnimationFrame, cleanup } = scope(root);
  (() => {
    const $ = id => document.getElementById(id);
    const here = (id) => !!root.querySelector('#' + id);
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, attrs, txt) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (txt !== undefined) e.textContent = txt;
      return e;
    };

    // ---------- 分頁 ----------
    document.querySelectorAll('#tab button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#tab button').forEach(x => x.classList.toggle('on', x === b));
      $('paneCpk').hidden = b.dataset.t !== 'cpk';
      $('paneCc').hidden = b.dataset.t !== 'cc';
    }));

    // ---------- Cp／Cpk ----------
    const LSL = -20, USL = 20;
    // 互補誤差函數（Numerical Recipes erfcc，相對誤差 < 1.2e-7）
    function erfc(x) {
      const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
      const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 +
        t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
      return x >= 0 ? r : 2 - r;
    }
    const tail = z => 0.5 * erfc(z / Math.SQRT2); // P(Z > z)
    const fmtPpm = p => {
      const v = p * 1e6;
      if (v >= 100) return Math.round(v).toLocaleString() + ' ppm';
      if (v >= 1) return v.toFixed(1) + ' ppm';
      if (v >= 0.001) return v.toPrecision(2) + ' ppm';
      return '< 0.001 ppm';
    };

    function drawDist() {
      const mu = +$('mu').value, sg = +$('sg').value;
      $('muOut').textContent = (mu > 0 ? '+' : '') + mu.toFixed(1) + ' mV';
      $('sgOut').textContent = sg.toFixed(2) + ' mV';
      const svg = $('dist');
      svg.innerHTML = '';
      const base = 250, X = v => 460 + v * 10;
      const H = 190 * Math.min(1, 4 / sg);
      const Y = v => base - H * Math.exp(-0.5 * ((v - mu) / sg) ** 2);

      // 本體與尾巴
      const area = (a, b, cls) => {
        if (b <= a) return;
        let d = `M${X(a)},${base}`;
        for (let v = a; v <= b + 1e-9; v += 0.25) d += ` L${X(v)},${Y(v)}`;
        d += ` L${X(b)},${base} Z`;
        svg.appendChild(el('path', { d, class: cls }));
      };
      area(LSL, USL, 'bx-soft');
      area(-40, LSL, 'fill-fg');
      area(USL, 40, 'fill-fg');
      let d = '';
      for (let v = -40; v <= 40 + 1e-9; v += 0.25) d += (d ? ' L' : 'M') + `${X(v)},${Y(v)}`;
      svg.appendChild(el('path', { d, class: 'ln-accent' }));

      // 軸
      svg.appendChild(el('line', { x1: 60, y1: base, x2: 860, y2: base, class: 'ln-fg' }));
      for (let v = -40; v <= 40; v += 10) {
        svg.appendChild(el('line', { x1: X(v), y1: base, x2: X(v), y2: base + 5, class: 'ln-fg' }));
        svg.appendChild(el('text', { x: X(v), y: base + 20, class: 't-small', 'text-anchor': 'middle' }, (v > 0 ? '+' : '') + v));
      }
      svg.appendChild(el('text', { x: 890, y: 20, class: 't-small', 'text-anchor': 'end' }, 'ΔV（mV）'));

      // 規格線與目標
      svg.appendChild(el('line', { x1: X(LSL), y1: 32, x2: X(LSL), y2: base, class: 'ln-accent' }));
      svg.appendChild(el('line', { x1: X(USL), y1: 32, x2: X(USL), y2: base, class: 'ln-accent' }));
      svg.appendChild(el('text', { x: X(LSL), y: 24, class: 't-accent', 'text-anchor': 'middle' }, 'LSL −20'));
      svg.appendChild(el('text', { x: X(USL), y: 24, class: 't-accent', 'text-anchor': 'middle' }, 'USL +20'));
      svg.appendChild(el('line', { x1: X(0), y1: 32, x2: X(0), y2: base, class: 'ln dash' }));
      svg.appendChild(el('text', { x: X(0), y: 24, class: 't-small', 'text-anchor': 'middle' }, '目標 0'));

      // 平均值與 ±3σ
      svg.appendChild(el('line', { x1: X(mu), y1: 58, x2: X(mu), y2: base, class: 'ln-fg' }));
      const muLx = Math.min(X(mu) + 6, 850);
      svg.appendChild(el('text', { x: muLx, y: 80, class: 't-accent', 'font-size': 13 }, 'μ'));
      [-3, 3].forEach(k => {
        const v = mu + k * sg;
        if (v < -40 || v > 40) return;
        svg.appendChild(el('line', { x1: X(v), y1: base - 30, x2: X(v), y2: base + 26, class: 'ln-fg dash' }));
        svg.appendChild(el('text', { x: X(v), y: base + 42, class: 't-small', 'text-anchor': 'middle' }, k < 0 ? '−3σ' : '+3σ'));
      });

      // 數值
      const cp = (USL - LSL) / (6 * sg), cpu = (USL - mu) / (3 * sg), cpl = (mu - LSL) / (3 * sg), cpk = Math.min(cpu, cpl);
      const pHi = tail((USL - mu) / sg), pLo = tail((mu - LSL) / sg);
      $('rCp').textContent = cp.toFixed(2);
      $('rCpk').textContent = cpk.toFixed(2);
      $('rCpu').textContent = cpu.toFixed(2);
      $('rCpl').textContent = cpl.toFixed(2);
      $('rHi').textContent = fmtPpm(pHi);
      $('rLo').textContent = fmtPpm(pLo);
      $('rTot').textContent = fmtPpm(pHi + pLo);

      let title, what;
      if (cpk >= 1.67) title = 'Cpk ≥ 1.67：很穩，新製程或關鍵特性也夠';
      else if (cpk >= 1.33) title = 'Cpk 1.33～1.67：一般量產門檻內';
      else if (cpk >= 1.0) title = 'Cpk 1.0～1.33：勉強，長期一漂就會出不良';
      else title = 'Cpk < 1：規格內裝不下，現在就在出不良';
      if (cp - cpk > 0.3) what = `Cp ${cp.toFixed(2)} 比 Cpk ${cpk.toFixed(2)} 高很多：變異其實夠小，問題是<b>偏心</b>。對策是把中心拉回目標（trim、調 recipe target），比降變異便宜得多。`;
      else if (cp < 1.33) what = `Cp 只有 ${cp.toFixed(2)}：就算完全置中也不夠，問題是<b>變異太大</b>。要拆變異來源（片內、片間、批間、量測）從最大項下手，或在設計端加 trim／加大 margin。`;
      else what = `中心大致在目標附近，Cp 與 Cpk 接近。距離最近的規格邊界約 ${(3 * cpk).toFixed(1)} 個 σ。注意：這是用短期 σ 算的，跨批的長期漂移會讓實際不良率更高（Ppk）。`;
      $('cpkTitle').textContent = title;
      $('cpkWhat').innerHTML = what;
    }
    $('mu').addEventListener('input', drawDist);
    $('sg').addEventListener('input', drawDist);
    document.querySelectorAll('[data-pre]').forEach(b => b.addEventListener('click', () => {
      const [m, s] = b.dataset.pre.split(',').map(Number);
      $('mu').value = m; $('sg').value = s; drawDist();
    }));
    if (here('dist')) drawDist();

    // ---------- 管制圖 ----------
    const Z = [0.3, -0.8, 1.1, -0.2, 0.6, -1.4, 0.1, 0.9, -0.5, -1.0, 0.4, 1.3, -0.6, 0.2, -1.2,
      0.7, -0.3, 1.6, -0.9, 0.5, -0.1, -0.7, 1.0, 0.3, -1.5, 0.8, -0.4, 0.2, 1.2, -0.6];
    const N = Z.length, START = 12;
    const SCN = {
      normal: { f: (z) => z, t: '正常：只有隨機變動', w: '點在中心線上下隨機跳，偶爾靠近 2σ 也沒關係。這就是 common cause 變異，這時候去調機台反而會把變異放大（over-adjustment）。注意：就算製程完全正常，四條規則一起用平均約每 92 點會誤報一次。' },
      shift: { f: (z, i) => i >= START ? z + 1.8 : z, t: '均值偏移：整體往上跳 1.8σ', w: '第 13 點起平均值突然上移。單點都沒超出 3σ，R1 抓不到；但 R3（4／5 點超 1σ）和 R4（連 8 點同側）會抓到。常見原因：換新批材料或靶材、機台保養（PM）後沒校回、換了量測機台。' },
      drift: { f: (z, i) => i >= START ? z * 0.5 + 0.2 * (i - START + 1) : z, t: '慢慢漂移：每點往上一點點', w: '平均值一點一點往上爬，到後面才會超出 3σ。R3、R4 會比 R1 早很多叫。常見原因：耗材慢慢磨耗（CMP 研磨墊、電極）、腔體累積沉積物、量測機台漂移。對策是找到漂移源，必要時排定期保養或加入補償。' },
      spike: { f: (z, i) => i === 19 ? 3.8 : z, t: '單點突波：一點突然超出 3σ', w: '只有第 20 點跳出去，前後都正常。R1 立刻抓到。可能是那一片的偶發事件（搬運、微粒、量測失誤），先重量確認，再查那一片的機台履歷，不要立刻調整整個製程。' },
      vari: { f: (z, i) => i >= START ? z * 2.4 : z, t: '變異變大：中心沒動，上下跳更大', w: '平均值沒變，但點越跳越遠，出現超出 2σ、3σ 的點。這種在 X 圖上看起來「時好時壞」，在 R 圖或 MR 圖上更明顯。常見原因：控制迴路不穩、腔體條件不一致、兩台機台混跑（mixture）。' },
    };
    const ccState = { s: 'normal', n: START };

    function rulesAt(x, i) {
      const r = [];
      const v = x[i];
      if (Math.abs(v) > 3) r.push(1);
      for (const s of [1, -1]) {
        if (s * v > 2 && i >= 2) { let c = 0; for (let k = i - 2; k <= i; k++) if (s * x[k] > 2) c++; if (c >= 2) r.push(2); }
        if (s * v > 1 && i >= 4) { let c = 0; for (let k = i - 4; k <= i; k++) if (s * x[k] > 1) c++; if (c >= 4) r.push(3); }
        if (i >= 7) { let ok = true; for (let k = i - 7; k <= i; k++) if (!(s * x[k] > 0)) ok = false; if (ok) r.push(4); }
      }
      if (i >= 5) {
        let up = true, dn = true;
        for (let k = i - 5; k < i; k++) { if (!(x[k + 1] > x[k])) up = false; if (!(x[k + 1] < x[k])) dn = false; }
        if (up || dn) r.push(5);
      }
      return r;
    }

    function drawCc() {
      const sc = SCN[ccState.s];
      const x = Z.map((z, i) => sc.f(z, i));
      const svg = $('cc');
      svg.innerHTML = '';
      const CL = 160, S = 31, X0 = 90, X1 = 850;
      const px = i => X0 + i * (X1 - X0) / (N - 1);
      const py = v => CL - Math.max(-4.1, Math.min(4.1, v)) * S;
      // 區域
      svg.appendChild(el('rect', { x: X0 - 10, y: py(1), width: X1 - X0 + 20, height: 2 * S, class: 'bx-soft' }));
      const lines = [[3, 'UCL +3σ', 'ln-accent dash'], [2, '+2σ', 'ln-soft'], [1, '+1σ', 'ln-soft'], [0, 'CL', 'ln-fg'],
        [-1, '−1σ', 'ln-soft'], [-2, '−2σ', 'ln-soft'], [-3, 'LCL −3σ', 'ln-accent dash']];
      lines.forEach(([k, lbl, cls]) => {
        svg.appendChild(el('line', { x1: X0 - 10, y1: py(k), x2: X1 + 10, y2: py(k), class: cls }));
        svg.appendChild(el('text', { x: X0 - 16, y: py(k) + 4, class: 't-small', 'text-anchor': 'end' }, lbl));
      });
      [['A', 2.5], ['B', 1.5], ['C', 0.5], ['C', -0.5], ['B', -1.5], ['A', -2.5]].forEach(([z, k]) =>
        svg.appendChild(el('text', { x: X1 + 24, y: py(k) + 4, class: 't-small', 'text-anchor': 'middle' }, z)));
      svg.appendChild(el('line', { x1: px(START) - 13, y1: 34, x2: px(START) - 13, y2: 290, class: 'ln dash' }));
      svg.appendChild(el('text', { x: px(START) - 7, y: 296, class: 't-small' }, '← 正常｜注入情境 →'));

      // 點與規則
      let pts = '';
      const hits = [];
      let prevR = [];
      for (let i = 0; i < ccState.n; i++) pts += `${px(i)},${py(x[i])} `;
      svg.appendChild(el('polyline', { points: pts, class: 'ln' }));
      let row = 0;
      for (let i = 0; i < ccState.n; i++) {
        const r = rulesAt(x, i);
        const onset = r.filter(k => !prevR.includes(k));
        prevR = r;
        if (r.length) {
          svg.appendChild(el('rect', { x: px(i) - 5, y: py(x[i]) - 5, width: 10, height: 10, class: 'fill-fg' }));
          r.forEach(k => hits.push([i + 1, k]));
        } else {
          svg.appendChild(el('circle', { cx: px(i), cy: py(x[i]), r: 4, class: 'bx' }));
        }
        if (onset.length) {
          const yy = row % 2 ? 28 : 14;
          row++;
          svg.appendChild(el('text', { x: px(i), y: yy, class: 't-accent', 'text-anchor': 'middle', 'font-size': 11 }, onset.map(k => 'R' + k).join('·')));
          svg.appendChild(el('line', { x1: px(i), y1: yy + 3, x2: px(i), y2: py(x[i]) - 7, class: 'ln-soft' }));
        }
      }
      $('ccTitle').textContent = sc.t;
      $('ccWhat').textContent = sc.w;
      if (!hits.length) $('ccHits').textContent = '目前沒有違反任何規則。';
      else {
        const first = {};
        hits.forEach(([p, k]) => { if (!(k in first)) first[k] = p; });
        $('ccHits').textContent = '各規則第一次觸發：' + Object.keys(first).sort().map(k => `R${k} 在第 ${first[k]} 點`).join('、') + '。';
      }
      $('ccPhase').textContent = `第 ${ccState.n} / ${N} 點`;
      $('ccPrev').disabled = ccState.n <= 1;
      $('ccNext').disabled = $('ccAll').disabled = ccState.n >= N;
    }
    document.querySelectorAll('#scn button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#scn button').forEach(x => x.classList.toggle('on', x === b));
      ccState.s = b.dataset.s; ccState.n = START; drawCc();
    }));
    $('ccPrev').addEventListener('click', () => { if (ccState.n > 1) { ccState.n--; drawCc(); } });
    $('ccNext').addEventListener('click', () => { if (ccState.n < N) { ccState.n++; drawCc(); } });
    $('ccAll').addEventListener('click', () => { ccState.n = N; drawCc(); });
    if (here('cc')) drawCc();

    // ---------- Wafer map ----------
    (function wafer() {
      let seed = 7;
      const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
      const pats = [
        ['Center', '中心：旋塗、CMP、', 'RF 或液流不均', (r) => r < 0.38 ? 0.85 : 0.03],
        ['Donut', '環狀：殘留、清洗、', '沉積或蝕刻均勻性', (r) => r > 0.42 && r < 0.66 ? 0.8 : 0.03],
        ['Edge-Ring', '整圈邊緣：溫度、', '電漿邊緣效應', (r) => r > 0.82 ? 0.85 : 0.03],
        ['Edge-Loc', '邊緣一角：夾具、', '局部溫度或接觸', (r, a) => r > 0.7 && a > 0.6 && a < 1.7 ? 0.8 : 0.03],
        ['Scratch', '一條線：搬運、', 'CMP 刮傷', (r, a, u, v) => Math.abs(v - (0.55 * u - 0.15)) < 0.07 && u > -0.7 && u < 0.75 ? 0.95 : 0.03],
        ['Random', '均勻散布：微粒、', 'D0 偏高（Poisson）', () => 0.1],
      ];
      const svg = $('wm');
      const R = 62, cell = 9;
      pats.forEach((p, k) => {
        const cx = 75 + k * 150, cy = 84;
        svg.appendChild(el('circle', { cx, cy, r: R + 3, class: 'bx' }));
        for (let gx = -R; gx < R; gx += cell) for (let gy = -R; gy < R; gy += cell) {
          const mx = gx + cell / 2, my = gy + cell / 2;
          if (Math.hypot(Math.abs(mx) + cell / 2, Math.abs(my) + cell / 2) > R) continue;
          const u = mx / R, v = -my / R, r = Math.hypot(u, v), a = Math.atan2(v, u);
          const fail = rnd() < p[3](r, a, u, v);
          svg.appendChild(el('rect', { x: cx + gx + 0.5, y: cy + gy + 0.5, width: cell - 1, height: cell - 1, class: fail ? 'fill-fg' : 'fill-soft' }));
        }
        svg.appendChild(el('text', { x: cx, y: 172, class: 't-accent', 'text-anchor': 'middle' }, p[0]));
        svg.appendChild(el('text', { x: cx, y: 192, class: 't-small', 'text-anchor': 'middle' }, p[1]));
        svg.appendChild(el('text', { x: cx, y: 210, class: 't-small', 'text-anchor': 'middle' }, p[2]));
      });
    })();

    // ---------- 8D ----------
    (function eightD() {
      const g = $('eightD');
      const D = [['D0', '緊急應變', '先止血'], ['D1', '組隊', '跨部門'], ['D2', '描述問題', '5W2H'], ['D3', '臨時圍堵', '隔離篩選'],
        ['D4', '根因', '發生＋流出'], ['D5', '選永久對策', '驗證可行'], ['D6', '執行驗證', '拆除圍堵'], ['D7', '防再發', '回寫 FMEA'], ['D8', '結案', '表揚團隊']];
      D.forEach((d, i) => {
        const x = i * 100;
        g.appendChild(el('rect', { x, y: 32, width: 92, height: 70, rx: 6, class: (i === 3 || i === 4) ? 'bx-accent' : 'bx' }));
        g.appendChild(el('text', { x: x + 10, y: 52, class: 't-strong' }, d[0]));
        g.appendChild(el('text', { x: x + 10, y: 72, class: 't-small' }, d[1]));
        g.appendChild(el('text', { x: x + 10, y: 92, class: 't-small' }, d[2]));
      });
    })();
  })();
  return cleanup
}

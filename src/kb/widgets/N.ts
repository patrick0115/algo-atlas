// @ts-nocheck —— 原講義 public/semi/N-ai.html 的互動程式照搬,不改邏輯。
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
    const rng = s => () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const gauss = r => (r() + r() + r() + r() - 2) / Math.sqrt(4 / 12);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const pct = v => isFinite(v) ? (v * 100).toFixed(1) + '%' : '—';

    // ---------- 假資料：模型輸出的「是 NG」分數 ----------
    const r1 = rng(7);
    const NG = [], OK = [];
    for (let i = 0; i < 40; i++) NG.push({ s: clamp(0.68 + 0.15 * gauss(r1), 0.02, 0.98), j: r1() });
    for (let i = 0; i < 196; i++) OK.push({ s: clamp(0.32 + 0.15 * gauss(r1), 0.02, 0.98), j: r1() });

    // ---------- 過擬合：多項式擬合 ----------
    const r2 = rng(11);
    const f = x => 0.8 * Math.sin(Math.PI * x);
    const TR = [], VA = [];
    for (let i = 0; i < 10; i++) { const x = -0.95 + 1.9 * i / 9 + (r2() - 0.5) * 0.08; TR.push([x, f(x) + 0.22 * gauss(r2)]); }
    for (let i = 0; i < 15; i++) { const x = -0.97 + 1.94 * i / 14 + 0.06; VA.push([clamp(x, -0.98, 0.98), f(x) + 0.22 * gauss(r2)]); }

    function polyfit(pts, d, lam) {
      const n = d + 1, A = [], b = [];
      for (let i = 0; i < n; i++) { A.push(new Array(n).fill(0)); b.push(0); }
      pts.forEach(([x, y]) => {
        const p = []; for (let k = 0; k < n; k++) p.push(Math.pow(x, k));
        for (let i = 0; i < n; i++) { b[i] += p[i] * y; for (let j = 0; j < n; j++) A[i][j] += p[i] * p[j]; }
      });
      for (let i = 1; i < n; i++) A[i][i] += lam;
      for (let c = 0; c < n; c++) {
        let m = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r;
        [A[c], A[m]] = [A[m], A[c]]; [b[c], b[m]] = [b[m], b[c]];
        for (let r = c + 1; r < n; r++) { const k = A[r][c] / A[c][c]; for (let j = c; j < n; j++) A[r][j] -= k * A[c][j]; b[r] -= k * b[c]; }
      }
      const w = new Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let j = i + 1; j < n; j++) s -= A[i][j] * w[j]; w[i] = s / A[i][i]; }
      return x => w.reduce((s, c, k) => s + c * Math.pow(x, k), 0);
    }
    const mse = (g, pts) => pts.reduce((s, [x, y]) => s + (g(x) - y) ** 2, 0) / pts.length;

    const state = { m: 'cm', th: 0.5, rare: false, d: 3, reg: false };

    function controls() {
      const sw = $('sliderWrap'), ow = $('optWrap');
      if (state.m === 'cm') {
        sw.innerHTML = '<label class="slider">分類門檻 <input type="range" id="sl" min="0" max="1" step="0.02"> <output id="slv"></output></label>';
        ow.innerHTML = '<div class="seg" id="rate"><button data-r="0">瑕疵率 20%</button><button data-r="1">瑕疵率 2%</button></div>';
        $('sl').value = state.th;
        $('sl').addEventListener('input', e => { state.th = +e.target.value; draw(); });
        ow.querySelectorAll('button').forEach(b => {
          b.classList.toggle('on', (b.dataset.r === '1') === state.rare);
          b.addEventListener('click', () => { state.rare = b.dataset.r === '1'; controls(); draw(); });
        });
      } else {
        sw.innerHTML = '<label class="slider">多項式階數（模型複雜度） <input type="range" id="sl" min="1" max="9" step="1"> <output id="slv"></output></label>';
        ow.innerHTML = `<label class="inline"><input type="checkbox" id="reg" ${state.reg ? 'checked' : ''}> 加 L2 正則化（λ＝0.01）</label>`;
        $('sl').value = state.d;
        $('sl').addEventListener('input', e => { state.d = +e.target.value; draw(); });
        $('reg').addEventListener('change', e => { state.reg = e.target.checked; draw(); });
      }
    }

    function drawCM(svg) {
      svg.setAttribute('viewBox', '0 0 900 300');
      const ng = state.rare ? NG.slice(0, 4) : NG.slice(0, 40);
      const ok = state.rare ? OK.slice(0, 196) : OK.slice(0, 160);
      const X0 = 90, W = 460, x = s => X0 + s * W, th = state.th;
      svg.appendChild(el('text', { x: 10, y: 16, class: 't-strong' }, '模型輸出的「是 NG」分數（0～1）'));
      svg.appendChild(el('rect', { x: x(th), y: 40, width: x(1) - x(th), height: 186, class: 'bx-soft' }));
      svg.appendChild(el('line', { x1: X0, y1: 228, x2: x(1), y2: 228, class: 'ln' }));
      [0, 0.25, 0.5, 0.75, 1].forEach(t => {
        svg.appendChild(el('line', { x1: x(t), y1: 228, x2: x(t), y2: 233, class: 'ln' }));
        svg.appendChild(el('text', { x: x(t) - 10, y: 248, class: 't-small' }, t.toFixed(2)));
      });
      svg.appendChild(el('text', { x: 10, y: 92, class: 't-strong' }, '實際 NG'));
      svg.appendChild(el('text', { x: 10, y: 184, class: 't-strong' }, '實際 OK'));
      svg.appendChild(el('line', { x1: X0, y1: 134, x2: x(1), y2: 134, class: 'ln-soft' }));
      ng.forEach(p => svg.appendChild(el('circle', { cx: x(p.s), cy: 56 + p.j * 64, r: 4, class: 'fill-fg' })));
      ok.forEach(p => svg.appendChild(el('circle', { cx: x(p.s), cy: 146 + p.j * 70, r: 3.5, class: 'bx' })));
      svg.appendChild(el('line', { x1: x(th), y1: 30, x2: x(th), y2: 232, class: 'ln-accent', 'stroke-width': 2 }));
      const lx = th > 0.8 ? x(th) - 92 : x(th) + 6;
      svg.appendChild(el('text', { x: lx, y: 34, class: 't-accent' }, '門檻 ' + th.toFixed(2)));
      if (th > 0.12) svg.appendChild(el('text', { x: x(th) - 60, y: 272, class: 't-small' }, '← 判 OK'));
      if (th < 0.9) svg.appendChild(el('text', { x: x(th) + 8, y: 272, class: 't-small' }, '判 NG →'));
      svg.appendChild(el('text', { x: X0, y: 294, class: 't-small' }, '● 實際 NG　○ 實際 OK　灰底＝分數 ≥ 門檻、被判 NG'));

      const TP = ng.filter(p => p.s >= th).length, FN = ng.length - TP;
      const FP = ok.filter(p => p.s >= th).length, TN = ok.length - FP;
      // 混淆矩陣
      const cx = 690, cy = 70, cw = 92, ch = 70;
      svg.appendChild(el('text', { x: 600, y: 16, class: 't-strong' }, '混淆矩陣'));
      svg.appendChild(el('text', { x: cx + 26, y: cy - 12, class: 't-small' }, '判 NG'));
      svg.appendChild(el('text', { x: cx + cw + 26, y: cy - 12, class: 't-small' }, '判 OK'));
      svg.appendChild(el('text', { x: 612, y: cy + 40, class: 't-small' }, '實際 NG'));
      svg.appendChild(el('text', { x: 612, y: cy + ch + 40, class: 't-small' }, '實際 OK'));
      const cells = [[0, 0, TP, 'TP', 1], [1, 0, FN, 'FN 漏檢', 0], [0, 1, FP, 'FP 誤殺', 0], [1, 1, TN, 'TN', 0]];
      cells.forEach(([i, j, v, lb, acc]) => {
        const rx = cx + i * cw, ry = cy + j * ch;
        svg.appendChild(el('rect', { x: rx, y: ry, width: cw, height: ch, class: acc ? 'bx-accent' : 'bx' }));
        svg.appendChild(el('text', { x: rx + 10, y: ry + 22, class: 't-small' }, lb));
        svg.appendChild(el('text', { x: rx + 10, y: ry + 52, class: 't-strong', 'font-size': 22 }, String(v)));
      });
      svg.appendChild(el('text', { x: 612, y: 236, class: 't-small' }, `共 ${ng.length + ok.length} 片，其中 NG ${ng.length} 片`));

      const P = TP / (TP + FP), R = TP / (TP + FN), A = (TP + TN) / (TP + TN + FP + FN);
      const F1 = (P + R) > 0 ? 2 * P * R / (P + R) : NaN, FPR = FP / (FP + TN);
      $('mt').innerHTML =
        '<tr><th>指標</th><th>公式</th><th class="num">目前值</th></tr>' +
        `<tr><td>Accuracy</td><td>(TP＋TN) ÷ 全部</td><td class="num">${pct(A)}</td></tr>` +
        `<tr><td>Precision</td><td>TP ÷ (TP＋FP)</td><td class="num">${TP + FP ? pct(P) : '—（沒有判 NG）'}</td></tr>` +
        `<tr><td>Recall</td><td>TP ÷ (TP＋FN)</td><td class="num">${pct(R)}</td></tr>` +
        `<tr><td>F1</td><td>2PR ÷ (P＋R)</td><td class="num">${isFinite(F1) ? F1.toFixed(3) : '—'}</td></tr>` +
        `<tr><td>良品誤殺比例（FPR）</td><td>FP ÷ (FP＋TN)</td><td class="num">${pct(FPR)}</td></tr>`;
      $('mtWrap').style.display = '';
      let title, what;
      if (TP + FP === 0) {
        title = '全部判 OK：accuracy 陷阱';
        what = `門檻高到沒有任何一片被判 NG。accuracy 還有 ${pct(A)}，但 recall 是 0，一個瑕疵都沒抓到。${state.rare ? '瑕疵率越低，這個假象越逼真。' : '切到「瑕疵率 2%」看看 accuracy 會變多高。'}`;
      } else if (R >= 0.95) {
        title = '門檻低：幾乎不漏檢，代價是誤殺';
        what = `真 NG 抓到 ${pct(R)}，但判 NG 的裡面只有 ${pct(P)} 是真的；有 ${FP} 片良品被拖下水，要靠人工或第二階段複判。篩檢型 AOI 常停在這一端。`;
      } else if (P >= 0.95) {
        title = '門檻高：判 NG 幾乎都對，但漏檢';
        what = `判 NG 的有 ${pct(P)} 是真的，可是還有 ${FN} 片瑕疵品被放過（recall ${pct(R)}）。漏放到客戶端的代價通常比誤殺貴。`;
      } else {
        title = '中間的工作點：兩種錯誤都有';
        what = `往左拉，recall 升、precision 降；往右拉則相反。模型（兩群點的位置）沒有變，變的只是門檻。要兩個一起變好，只能讓模型把兩群分得更開。${state.rare ? '注意：瑕疵率只有 2% 時，同樣的誤殺比例，precision 會掉得比 20% 時多很多。' : ''}`;
      }
      $('stTitle').textContent = title;
      $('stWhat').textContent = what;
      $('slv').textContent = th.toFixed(2);
    }

    function drawFit(svg) {
      svg.setAttribute('viewBox', '0 0 900 300');
      const lam = state.reg ? 0.01 : 0;
      // 左：資料與曲線
      const L = { x0: 40, x1: 420, y0: 40, y1: 250 };
      const px = x => L.x0 + (x + 1) / 2 * (L.x1 - L.x0);
      const py = y => L.y0 + (1.6 - y) / 3.2 * (L.y1 - L.y0);
      svg.appendChild(el('text', { x: 10, y: 16, class: 't-strong' }, `資料與擬合曲線（${state.d} 階）`));
      svg.appendChild(el('rect', { x: L.x0, y: L.y0, width: L.x1 - L.x0, height: L.y1 - L.y0, class: 'ln-soft' }));
      const defs = el('defs', {});
      const cp = el('clipPath', { id: 'clipFit' });
      cp.appendChild(el('rect', { x: L.x0, y: L.y0, width: L.x1 - L.x0, height: L.y1 - L.y0 }));
      defs.appendChild(cp); svg.appendChild(defs);
      let pts = '';
      for (let i = 0; i <= 120; i++) { const x = -1 + 2 * i / 120; pts += `${px(x)},${py(f(x))} `; }
      svg.appendChild(el('polyline', { points: pts, class: 'ln dash' }));
      const g = polyfit(TR, state.d, lam);
      pts = '';
      for (let i = 0; i <= 200; i++) { const x = -1 + 2 * i / 200; pts += `${px(x)},${py(clamp(g(x), -5, 5))} `; }
      svg.appendChild(el('polyline', { points: pts, class: 'ln-accent', 'stroke-width': 2, 'clip-path': 'url(#clipFit)' }));
      VA.forEach(([x, y]) => svg.appendChild(el('circle', { cx: px(x), cy: py(y), r: 4, class: 'bx' })));
      TR.forEach(([x, y]) => svg.appendChild(el('circle', { cx: px(x), cy: py(y), r: 4.5, class: 'fill-fg' })));
      svg.appendChild(el('text', { x: L.x0, y: 270, class: 't-small' }, '● 訓練點　○ 驗證點　虛線＝真正的規律'));
      svg.appendChild(el('text', { x: L.x0, y: 288, class: 't-small' }, '實線＝模型學到的曲線'));

      // 右：誤差 vs 階數
      const R = { x0: 520, x1: 870, y0: 40, y1: 230 }, cap = 0.3;
      const ex = d => R.x0 + (d - 1) / 8 * (R.x1 - R.x0);
      const ey = e => R.y1 - Math.min(e, cap) / cap * (R.y1 - R.y0);
      svg.appendChild(el('text', { x: 480, y: 16, class: 't-strong' }, '誤差（MSE）對複雜度'));
      svg.appendChild(el('line', { x1: R.x0, y1: R.y1, x2: R.x1, y2: R.y1, class: 'ln' }));
      svg.appendChild(el('line', { x1: R.x0, y1: R.y0, x2: R.x0, y2: R.y1, class: 'ln' }));
      [0, 0.1, 0.2, 0.3].forEach(v => svg.appendChild(el('text', { x: 482, y: ey(v) + 4, class: 't-small' }, v.toFixed(1))));
      for (let d = 1; d <= 9; d++) svg.appendChild(el('text', { x: ex(d) - 4, y: R.y1 + 18, class: 't-small' }, String(d)));
      svg.appendChild(el('text', { x: 620, y: 270, class: 't-small' }, '多項式階數（越右越複雜）'));
      const tr = [], va = [];
      for (let d = 1; d <= 9; d++) { const h = polyfit(TR, d, lam); tr.push(mse(h, TR)); va.push(mse(h, VA)); }
      const line = (arr, cls) => {
        let s = ''; arr.forEach((e, i) => { s += `${ex(i + 1)},${ey(e)} `; });
        svg.appendChild(el('polyline', { points: s, class: cls, 'stroke-width': 1.8 }));
      };
      line(tr, 'ln-fg'); line(va, 'ln-accent dash');
      va.forEach((e, i) => { if (e > cap) { const cx = ex(i + 1); svg.appendChild(el('path', { d: `M${cx - 5},${R.y0 - 6} L${cx + 5},${R.y0 - 6} L${cx},${R.y0 - 15} z`, class: 'fill-fg' })); } });
      svg.appendChild(el('circle', { cx: ex(state.d), cy: ey(tr[state.d - 1]), r: 5, class: 'fill-fg' }));
      svg.appendChild(el('circle', { cx: ex(state.d), cy: ey(va[state.d - 1]), r: 5, class: 'bx' }));
      svg.appendChild(el('line', { x1: ex(state.d), y1: R.y0, x2: ex(state.d), y2: R.y1, class: 'ln-soft' }));
      svg.appendChild(el('text', { x: 520, y: 288, class: 't-small' }, '實線＝訓練誤差　虛線＝驗證誤差　頂端三角＝超出圖框'));

      const t = tr[state.d - 1], v = va[state.d - 1];
      const best = va.indexOf(Math.min(...va)) + 1;
      $('mtWrap').style.display = 'none';
      let title, what;
      if (state.d <= 2) {
        title = '欠擬合：模型太簡單';
        what = `${state.d} 階曲線彎不出真正的形狀，訓練誤差 ${t.toFixed(3)}、驗證誤差 ${v.toFixed(3)}，兩個都高而且接近。這時加資料沒用，要換更複雜的模型。`;
      } else if (state.d >= 7 && state.reg) {
        title = '高複雜度＋正則化：曲線被拉平';
        what = `同樣是 ${state.d} 階，L2 正則化懲罰大係數，曲線不再硬穿每個點：訓練誤差 ${t.toFixed(3)}、驗證誤差 ${v.toFixed(3)}，比不加正則化時低很多。這就是「模型可以大，但要限制它」。`;
      } else if (state.d >= 7) {
        title = '過擬合：把雜訊也背下來';
        what = `${state.d} 階曲線硬穿過每個訓練點，訓練誤差只剩 ${t.toFixed(3)}，驗證誤差卻是 ${v.toFixed(3)}。勾選 L2 正則化看看曲線怎麼被拉平。10 個訓練點配 9 階（10 個係數）等於完全背答案。`;
      } else {
        title = '剛好：驗證誤差最低的區間';
        what = `訓練誤差 ${t.toFixed(3)}、驗證誤差 ${v.toFixed(3)}。這組資料驗證誤差最低在 ${best} 階。用 val 挑出這個點，就是「用驗證集選超參數」；最後仍要拿沒碰過的 test 再確認一次。`;
      }
      $('stTitle').textContent = title;
      $('stWhat').textContent = what;
      $('slv').textContent = state.d + ' 階';
    }

    function draw() {
      const svg = $('fig');
      svg.innerHTML = '';
      if (state.m === 'cm') drawCM(svg); else drawFit(svg);
    }

    document.querySelectorAll('#mode button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#mode button').forEach(x => x.classList.toggle('on', x === b));
      state.m = b.dataset.m; controls(); draw();
    }));
    controls(); draw();
  })();
  return cleanup
}

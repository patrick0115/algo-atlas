// @ts-nocheck —— 原講義 public/semi/H-programming.html 的互動程式照搬,不改邏輯。
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
    const svg = $('mf');
    const state = { m: 'big', k: 30, log: true, target: 47, i: 0, steps: [] };

    // ===== Big-O 模式 =====
    const nOf = k => Math.max(1, Math.round(Math.pow(10, k / 10)));
    const lg = n => (n <= 1 ? 1 : Math.log2(n));
    const classes = [
      { name: 'O(1)', f: n => 1 },
      { name: 'O(log n)', f: n => Math.max(1, Math.ceil(Math.log2(n))) },
      { name: 'O(n)', f: n => n },
      { name: 'O(n log n)', f: n => n * lg(n) },
      { name: 'O(n²)', f: n => n * n },
    ];
    const sup = s => String(s).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join('');
    function fmt(v) {
      v = Math.round(v);
      if (v < 1e7) return v.toLocaleString('en-US');
      const e = Math.floor(Math.log10(v));
      return (v / Math.pow(10, e)).toFixed(1) + '×10' + sup(e);
    }
    function fmtTime(ops) {
      const s = ops / 1e8;
      if (s < 1e-6) return '< 1 µs';
      if (s < 1e-3) return (s * 1e6).toFixed(0) + ' µs';
      if (s < 1) return (s * 1e3).toFixed(0) + ' ms';
      if (s < 60) return s.toFixed(1) + ' 秒';
      if (s < 3600) return (s / 60).toFixed(1) + ' 分鐘';
      if (s < 86400) return (s / 3600).toFixed(1) + ' 小時';
      if (s < 86400 * 365) return (s / 86400).toFixed(1) + ' 天';
      return (s / 86400 / 365).toFixed(1) + ' 年';
    }
    function ratio(c, n) {
      const r = c.f(2 * n) / c.f(n);
      return '×' + (r < 10 ? r.toFixed(2).replace(/\.?0+$/, '') : r.toFixed(0));
    }
    function drawBig() {
      const n = nOf(state.k);
      $('nVal').textContent = 'n = ' + n.toLocaleString('en-US');
      svg.innerHTML = '';
      svg.setAttribute('viewBox', '0 0 900 300');
      const X0 = 120, W = 470, top = 46, rowH = 46;
      svg.appendChild(el('text', { x: 10, y: 24, class: 't-small' }, '複雜度'));
      svg.appendChild(el('text', { x: X0, y: 24, class: 't-small' }, state.log ? '操作次數（對數刻度）' : '操作次數（線性刻度：以 O(n²) 為滿格）'));
      svg.appendChild(el('text', { x: 610, y: 24, class: 't-small' }, '次數'));
      svg.appendChild(el('text', { x: 720, y: 24, class: 't-small' }, '粗估時間'));
      svg.appendChild(el('text', { x: 822, y: 24, class: 't-small' }, 'n 翻倍'));
      const vals = classes.map(c => c.f(n));
      const max = Math.max(...vals);
      const lmax = Math.log10(Math.max(10, max));
      classes.forEach((c, k) => {
        const y = top + k * rowH;
        const v = vals[k];
        let w = state.log ? (Math.log10(v) + 0.15) / (lmax + 0.15) * W : v / max * W;
        w = Math.max(2, w);
        svg.appendChild(el('rect', { x: X0, y: y, width: W, height: 26, class: 'bx-soft', rx: 3 }));
        svg.appendChild(el('rect', { x: X0, y: y, width: w, height: 26, class: k === 1 ? 'fill-fg' : 'bx-accent', rx: 3 }));
        svg.appendChild(el('text', { x: 10, y: y + 18, class: k === 1 ? 't-accent' : '' }, c.name));
        svg.appendChild(el('text', { x: 610, y: y + 18, 'font-family': 'JetBrains Mono, Consolas, monospace', 'font-size': 12 }, fmt(v)));
        svg.appendChild(el('text', { x: 720, y: y + 18, class: 't-small' }, fmtTime(v)));
        svg.appendChild(el('text', { x: 822, y: y + 18, class: 't-small' }, ratio(c, n)));
      });
      svg.appendChild(el('text', { x: 10, y: 290, class: 't-small' }, '粗估時間假設每秒約 1 億次簡單操作，只看數量級。黑色實心那條是二分搜尋的 O(log n)。'));
      const steps = Math.max(1, Math.ceil(Math.log2(n)));
      $('stTitle').textContent = `n = ${n.toLocaleString('en-US')}：二分搜尋最多 ${steps} 步，線性搜尋最多 ${n.toLocaleString('en-US')} 步`;
      let msg = '把拉桿往右拉，看「n 翻倍」那一欄：O(n) 永遠 ×2、O(n²) 永遠 ×4，O(log n) 幾乎是 ×1——因為它只多一步。';
      if (n >= 100000) msg += ` 現在 O(n²) 要 ${fmtTime(vals[4])}，O(n log n) 只要 ${fmtTime(vals[3])}：這就是「藏起來的雙層迴圈」讓工具卡死、換成排序或 hash 就秒完的原因。`;
      else if (n <= 20) msg += ' n 很小時大家都差不多，這時常數比 Big-O 重要（所以 .NET 排序在 16 筆以下改用插入排序）。';
      if (!state.log && n >= 1000) msg += ' 線性刻度下 O(log n) 與 O(n) 都被壓成一條線；勾「對數刻度」才看得出差距。';
      $('stWhat').textContent = msg;
    }

    // ===== 二分搜尋模式 =====
    const arr = [3, 7, 12, 18, 21, 25, 31, 36, 42, 47, 53, 58, 64, 70, 77, 85];
    function buildSteps(t) {
      const s = [{ lo: 0, hi: arr.length - 1, mid: null, title: '開始：範圍是全部 16 格', what: `陣列已排序（二分搜尋的前提）。要找 ${t}。lo＝0、hi＝15，可能的範圍有 16 格。` }];
      let lo = 0, hi = arr.length - 1, n = 0;
      while (lo <= hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        n++;
        const v = arr[mid];
        if (v === t) {
          s.push({ lo, hi, mid, found: mid, title: `第 ${n} 次比較：a[${mid}] = ${v}，找到了`, what: `中間值剛好等於 ${t}，回傳索引 ${mid}。共比較 ${n} 次；線性搜尋從頭找要比 ${mid + 1} 次。16 筆最多只要 4 次（log₂16 = 4）。` });
          return s;
        }
        const rem = v < t ? hi - mid : mid - lo;
        const desc = v < t ? `${v} < ${t}，答案只可能在右邊：丟掉左半（含 mid），lo ← ${mid + 1}` : `${v} > ${t}，答案只可能在左邊：丟掉右半（含 mid），hi ← ${mid - 1}`;
        s.push({ lo, hi, mid, title: `第 ${n} 次比較：看中間 a[${mid}] = ${v}`, what: `${desc}。剩下 ${rem} 格。` });
        if (v < t) lo = mid + 1; else hi = mid - 1;
      }
      s.push({ lo, hi, mid: null, none: true, title: `範圍空了：${t} 不在陣列裡`, what: `lo（${lo}）跑到 hi（${hi}）右邊，範圍是空的，回傳 -1。共比較 ${n} 次就能確定「沒有」；線性搜尋要把 16 格全看完才能確定。` });
      return s;
    }
    function drawBin() {
      const st = state.steps[state.i];
      svg.innerHTML = '';
      svg.setAttribute('viewBox', '0 0 900 230');
      const X0 = 34, cw = 52, y = 70, ch = 44;
      svg.appendChild(el('text', { x: 10, y: 24, class: 't-strong' }, `在 16 個已排序的數裡找 ${state.target}`));
      svg.appendChild(el('text', { x: 10, y: 46, class: 't-small' }, '灰底＝已經被排除；黑框＝還可能在這裡；粗框＝這一步比較的中間元素'));
      arr.forEach((v, k) => {
        const x = X0 + k * cw;
        const inRange = !st.none && k >= st.lo && k <= st.hi;
        const isMid = st.mid === k;
        svg.appendChild(el('rect', { x: x, y: y, width: cw - 4, height: ch, rx: 4, class: isMid ? 'bx-accent' : inRange ? 'bx' : 'bx-soft', style: isMid ? 'stroke-width:3' : '' }));
        const tx = el('text', { x: x + (cw - 4) / 2, y: y + 28, 'text-anchor': 'middle', class: isMid ? 't-accent' : inRange ? '' : 't-muted' }, String(v));
        svg.appendChild(tx);
        svg.appendChild(el('text', { x: x + (cw - 4) / 2, y: y + ch + 16, 'text-anchor': 'middle', class: 't-small' }, String(k)));
      });
      const lab = (k, s, row) => {
        if (k < 0 || k > 15) return;
        const x = X0 + k * cw + (cw - 4) / 2;
        svg.appendChild(el('text', { x: x, y: y + ch + 34 + row * 16, 'text-anchor': 'middle', class: 't-accent', 'font-size': 12 }, s));
      };
      if (!st.none) {
        if (st.lo === st.hi && st.mid === st.lo) { lab(st.lo, 'lo=hi=mid', 0); }
        else {
          lab(st.lo, 'lo', 0); lab(st.hi, 'hi', 0);
          if (st.mid !== null && st.mid !== st.lo && st.mid !== st.hi) lab(st.mid, 'mid', 0);
          else if (st.mid !== null) lab(st.mid, 'mid', 1);
        }
      }
      // 剩下範圍長條
      const remain = st.none ? 0 : st.hi - st.lo + 1;
      const by = 200;
      svg.appendChild(el('text', { x: 10, y: by + 14, class: 't-small' }, '可能範圍'));
      svg.appendChild(el('rect', { x: 90, y: by, width: 640, height: 18, class: 'bx-soft', rx: 3 }));
      if (remain > 0) svg.appendChild(el('rect', { x: 90, y: by, width: remain / 16 * 640, height: 18, class: 'bx-accent', rx: 3 }));
      svg.appendChild(el('text', { x: 744, y: by + 14, class: 't-small' }, `${remain} / 16 格`));
      $('stTitle').textContent = st.title;
      $('stWhat').textContent = st.what;
      $('phase').textContent = `第 ${state.i + 1} / ${state.steps.length} 步`;
      $('prev').disabled = state.i === 0;
      $('next').disabled = state.i === state.steps.length - 1;
    }

    function draw() { state.m === 'big' ? drawBig() : drawBin(); }
    function setMode(m) {
      state.m = m;
      document.querySelectorAll('#mode button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
      $('optBig').style.display = m === 'big' ? '' : 'none';
      $('optBin').style.display = m === 'bin' ? '' : 'none';
      if (m === 'bin') { state.steps = buildSteps(state.target); state.i = 0; }
      draw();
    }
    document.querySelectorAll('#mode button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.m)));
    $('nRange').addEventListener('input', e => { state.k = +e.target.value; drawBig(); });
    $('logScale').addEventListener('change', e => { state.log = e.target.checked; drawBig(); });
    $('target').addEventListener('change', e => { state.target = +e.target.value; state.steps = buildSteps(state.target); state.i = 0; drawBin(); });
    $('prev').addEventListener('click', () => { if (state.i > 0) { state.i--; drawBin(); } });
    $('next').addEventListener('click', () => { if (state.i < state.steps.length - 1) { state.i++; drawBin(); } });
    setMode('big');
  })();
  return cleanup
}

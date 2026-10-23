// @ts-nocheck —— 原講義 public/semi/P-leetcode.html 的互動程式照搬,不改邏輯。
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
    const state = { m: 'win', i: 0, steps: [] };
    const X0 = 40, CW = 80, CH = 44;

    // ===== 滑動視窗：最長無重複字元子字串 =====
    const S = 'abcabcbb';
    function winSteps() {
      const s = [{ l: 0, r: -1, best: 0, seen: [], title: '開始：視窗是空的', what: `字串 "${S}"，找最長、沒有重複字元的連續子字串。右邊界 r 每步加一個字元；遇到重複就讓左邊界 l 往右縮，直到沒有重複。` }];
      const seen = new Set();
      let l = 0, best = 0, ops = 0;
      for (let r = 0; r < S.length; r++) {
        const ch = S[r];
        while (seen.has(ch)) {
          seen.delete(S[l]);
          ops++;
          s.push({ l: l + 1, r: r - 1, best, seen: [...seen], hit: r, title: `r = ${r} 遇到 '${ch}' 重複：左邊界縮一格`, what: `視窗裡已經有 '${ch}'，把最左邊的 '${S[l]}' 移出去，l 從 ${l} 變 ${l + 1}。左邊界只往右走，不會回頭。` });
          l++;
        }
        seen.add(ch);
        ops++;
        const len = r - l + 1;
        const nb = Math.max(best, len);
        s.push({ l, r, best: nb, seen: [...seen], title: `r = ${r}：加入 '${ch}'，視窗長度 ${len}`, what: `視窗 "${S.slice(l, r + 1)}" 沒有重複${nb > best ? `，刷新最長紀錄為 ${nb}` : `，最長紀錄維持 ${nb}`}。` });
        best = nb;
      }
      s.push({ l, r: S.length - 1, best, seen: [...seen], done: true, title: `結束：答案 ${best}`, what: `總共做了 ${ops} 次「加入／移出」，字串長度 ${S.length}。每個字元最多進出視窗各一次，所以是 O(n)；暴力法要檢查每一個子字串，是 O(n²) 以上。` });
      return s;
    }
    function drawWin() {
      const st = state.steps[state.i];
      svg.innerHTML = '';
      svg.setAttribute('viewBox', '0 0 900 260');
      svg.appendChild(el('text', { x: 10, y: 24, class: 't-strong' }, `最長無重複字元子字串："${S}"`));
      svg.appendChild(el('text', { x: 10, y: 46, class: 't-small' }, '黑框＝目前視窗；粗框＝這一步撞到的重複字元；灰底＝不在視窗內'));
      const y = 80;
      [...S].forEach((ch, k) => {
        const x = X0 + k * CW;
        const inWin = k >= st.l && k <= st.r;
        const isHit = st.hit === k;
        svg.appendChild(el('rect', { x, y, width: CW - 8, height: CH, rx: 4, class: isHit ? 'bx-accent' : inWin ? 'bx' : 'bx-soft', style: isHit ? 'stroke-width:3' : '' }));
        svg.appendChild(el('text', { x: x + (CW - 8) / 2, y: y + 28, 'text-anchor': 'middle', class: isHit ? 't-accent' : inWin ? '' : 't-muted' }, ch));
        svg.appendChild(el('text', { x: x + (CW - 8) / 2, y: y + CH + 18, 'text-anchor': 'middle', class: 't-small' }, String(k)));
      });
      const mark = (k, label, dy) => {
        if (k < 0 || k >= S.length) return;
        const cx = X0 + k * CW + (CW - 8) / 2;
        svg.appendChild(el('text', { x: cx, y: y - 10 - dy, 'text-anchor': 'middle', class: 't-accent' }, label));
      };
      if (st.r >= st.l) { mark(st.l, 'l', st.l === st.r ? 14 : 0); mark(st.r, 'r', 0); }
      svg.appendChild(el('text', { x: 10, y: 200, class: 't-small' }, `視窗內的字元（set）：{ ${st.seen.join(', ')} }`));
      svg.appendChild(el('text', { x: 10, y: 226, class: 't-strong' }, `目前最長：${st.best}`));
    }

    // ===== 單調堆疊：每日溫度 =====
    const T = [73, 74, 75, 71, 69, 72, 76, 73];
    function stkSteps() {
      const ans = T.map(() => 0);
      const st = [];
      const s = [{ i: null, st: [], ans: [...ans], title: '開始：堆疊是空的', what: `每天的溫度 [${T.join(', ')}]。對每一天，要知道「再等幾天會更暖」。堆疊裡存索引，對應的溫度由底到頂遞減。` }];
      let ops = 0;
      T.forEach((x, i) => {
        while (st.length && T[st[st.length - 1]] < x) {
          const j = st.pop();
          ans[j] = i - j;
          ops++;
          s.push({ i, st: [...st], ans: [...ans], popped: j, title: `第 ${i} 天 ${x}° 比第 ${j} 天 ${T[j]}° 暖：pop ${j}`, what: `第 ${j} 天等到了更暖的一天，答案是 ${i} − ${j} = ${i - j}。誰把你踢出堆疊，誰就是你的答案。` });
        }
        st.push(i);
        ops++;
        s.push({ i, st: [...st], ans: [...ans], title: `第 ${i} 天 ${x}°：push 進堆疊`, what: st.length > 1 ? `堆疊頂端（第 ${st[st.length - 2]} 天 ${T[st[st.length - 2]]}°）不比 ${x}° 冷，停止 pop，把第 ${i} 天放上去，堆疊仍然遞減。` : `堆疊空了（或原本就空），直接放上去。` });
      });
      s.push({ i: null, st: [...st], ans: [...ans], done: true, title: '結束：留在堆疊裡的都等不到更暖的一天', what: `堆疊剩 [${st.join(', ')}]，答案維持 0。總共 ${ops} 次 push／pop，${T.length} 天：每天最多進出各一次，O(n)；暴力法每天往後找是 O(n²)。` });
      return s;
    }
    function drawStk() {
      const st = state.steps[state.i];
      svg.innerHTML = '';
      svg.setAttribute('viewBox', '0 0 900 300');
      svg.appendChild(el('text', { x: 10, y: 24, class: 't-strong' }, '每日溫度：再等幾天會更暖'));
      svg.appendChild(el('text', { x: 10, y: 46, class: 't-small' }, '粗框＝今天；黑框＝還在堆疊裡等答案；最下排是答案'));
      const y = 70;
      svg.appendChild(el('text', { x: 10, y: y + 28, class: 't-small' }, '溫度'));
      svg.appendChild(el('text', { x: 10, y: y + 160, class: 't-small' }, '答案'));
      T.forEach((t, k) => {
        const x = X0 + 30 + k * CW;
        const isNow = st.i === k;
        const inStk = st.st.includes(k);
        const isPop = st.popped === k;
        svg.appendChild(el('rect', { x, y, width: CW - 8, height: CH, rx: 4, class: isNow ? 'bx-accent' : inStk || isPop ? 'bx' : 'bx-soft', style: isNow ? 'stroke-width:3' : '' }));
        svg.appendChild(el('text', { x: x + (CW - 8) / 2, y: y + 28, 'text-anchor': 'middle', class: isNow ? 't-accent' : '' }, t + '°'));
        svg.appendChild(el('text', { x: x + (CW - 8) / 2, y: y + CH + 16, 'text-anchor': 'middle', class: 't-small' }, String(k)));
        svg.appendChild(el('rect', { x, y: y + 132, width: CW - 8, height: 40, rx: 4, class: isPop ? 'bx-accent' : 'bx-soft' }));
        svg.appendChild(el('text', { x: x + (CW - 8) / 2, y: y + 158, 'text-anchor': 'middle', class: isPop ? 't-accent' : st.ans[k] ? '' : 't-muted' }, String(st.ans[k])));
      });
      const sy = y + 84;
      svg.appendChild(el('text', { x: 10, y: sy + 24, class: 't-small' }, '堆疊'));
      svg.appendChild(el('text', { x: X0 + 30, y: sy + 24, class: 't-small' }, '底 →'));
      st.st.forEach((k, p) => {
        const x = X0 + 80 + p * 96;
        svg.appendChild(el('rect', { x, y: sy + 4, width: 88, height: 30, rx: 4, class: 'bx' }));
        svg.appendChild(el('text', { x: x + 44, y: sy + 24, 'text-anchor': 'middle' }, `${k}（${T[k]}°）`));
      });
      if (st.st.length) svg.appendChild(el('text', { x: X0 + 80 + st.st.length * 96, y: sy + 24, class: 't-small' }, '← 頂'));
    }

    function draw() {
      (state.m === 'win' ? drawWin : drawStk)();
      const st = state.steps[state.i];
      $('stTitle').textContent = st.title;
      $('stWhat').textContent = st.what;
      $('phase').textContent = `${state.i + 1} / ${state.steps.length}`;
      $('prev').disabled = state.i === 0;
      $('next').disabled = state.i === state.steps.length - 1;
    }
    function setMode(m) {
      state.m = m;
      state.steps = m === 'win' ? winSteps() : stkSteps();
      state.i = 0;
      document.querySelectorAll('#mode button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
      draw();
    }
    document.querySelectorAll('#mode button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.m)));
    $('prev').addEventListener('click', () => { if (state.i > 0) { state.i--; draw(); } });
    $('next').addEventListener('click', () => { if (state.i < state.steps.length - 1) { state.i++; draw(); } });
    setMode('win');
  })();
  return cleanup
}

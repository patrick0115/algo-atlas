import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 84. Largest Rectangle in Histogram

const H = [2, 1, 5, 6, 2, 3]

function stackFig(): FigStep[] {
  const st: number[] = []
  let best = 0
  const out: FigStep[] = [{ note: '對每根柱子想:「以它為高度」的矩形,往左右能延伸到哪?答案是左右兩邊**第一根比它矮的柱子**之間。單調遞增堆疊可以一次找出所有人的左右邊界', views: [arr(H, { label: 'heights', mode: 'bars' }), arr([], { label: '堆疊(索引,高度遞增)' })] }]
  const hs = [...H, 0]
  for (let i = 0; i < hs.length; i++) {
    while (st.length && hs[st[st.length - 1]] >= hs[i]) {
      const top = st.pop()!
      const left = st.length ? st[st.length - 1] : -1
      const w = i - left - 1
      const area = H[top] * w
      const better = area > best
      best = Math.max(best, area)
      out.push({
        note: `${i < H.length ? `第 ${i} 根(高 ${hs[i]})` : '最後補的高度 0'}比堆疊頂端矮 → 彈出 ${top}(高 ${H[top]}):右邊界是 ${i}、左邊界是新的頂端 ${left},寬 ${w},面積 ${H[top]} × ${w} = ${area}${better ? ' → 目前最大' : ''}`,
        views: [arr(H, { label: 'heights', mode: 'bars', highlight: range(left + 1, i - 1), compare: [top] }), arr([...st], { label: '堆疊' })],
      })
    }
    st.push(i)
    if (i < H.length && (i === 0 || i === 2 || i === 3)) out.push({ note: `第 ${i} 根(高 ${H[i]})比頂端高 → 推入,還不知道它的右邊界`, views: [arr(H, { label: 'heights', mode: 'bars', highlight: [i] }), arr([...st], { label: '堆疊' })] })
  }
  out.push({ note: `最大面積 ${best}(高 5、6 的兩根,以高度 5 延伸寬 2)`, views: [arr(H, { label: 'heights', mode: 'bars', done: [2, 3] }), arr([best], { label: '答案', done: [0] })] })
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:每根柱子 i 當作矩形的高度,往左、往右走到第一根比它矮的為止', views: [arr(H, { label: 'heights', mode: 'bars', highlight: [2, 3], compare: [2] })] },
    { note: '高度 5:左邊 1 比較矮、右邊 2 比較矮 → 寬 2,面積 10。每根都這樣走 → O(n²)', views: [arr(H, { label: 'heights', mode: 'bars', done: [2, 3], dim: [1, 4] })] },
  ]
}

export const q0084: Solution = {
  id: 84,
  plain: '一排寬度都是 1 的長條(直方圖),在裡面畫一個最大的長方形(要完全落在長條內)。面積最大是多少?',
  statement: '給 n 個非負整數 `heights` 表示直方圖每根柱子的高度(寬度皆為 1),回傳直方圖中能勾勒出的最大矩形面積。',
  examples: [
    { input: 'heights = [2,1,5,6,2,3]', output: '10', note: '高 5、寬 2' },
    { input: 'heights = [2,4]', output: '4' },
  ],
  constraints: ['`n ≤ 10⁵` → 要 O(n)'],
  insight: [
    '最大矩形的高度,一定等於某一根柱子的高度(否則可以再長高一點)',
    '所以對每根柱子 i:以 `heights[i]` 為高,往左右延伸到第一根**比它矮**的柱子 → 寬度 = 右邊界 − 左邊界 − 1',
    '「左右第一個比它小的」正是**單調堆疊**的專長:維護高度遞增的堆疊,一根柱子被彈出時,彈它的人就是右邊界,堆疊裡它下面那個就是左邊界',
    '最後補一個高度 0,把堆疊裡剩下的全部彈出結算',
  ],
  approaches: [
    {
      name: '每根柱子往左右延伸',
      idea: '對每個 i,`l` 往左走到 `heights[l] < heights[i]`、`r` 往右走到 `heights[r] < heights[i]`,面積 `heights[i] × (r − l − 1)`。',
      steps: ['`for i`:`l = i − 1` 往左、`r = i + 1` 往右,遇到比較矮的就停', '`best = max(best, heights[i] × (r − l − 1))`'],
      figure: { title: `heights = [${H}]`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '每根柱子最多往左右各走 n 步。' },
      verdict: '直覺正確,n = 10⁵ 會超時。',
      code: {
        python: `def largestRectangleArea(heights):
    n, best = len(heights), 0
    for i, h in enumerate(heights):
        l, r = i - 1, i + 1
        while l >= 0 and heights[l] >= h:
            l -= 1
        while r < n and heights[r] >= h:
            r += 1
        best = max(best, h * (r - l - 1))     # 以 h 為高,左右第一個比它矮的之間
    return best`,
        c: `int largestRectangleArea(int *heights, int heightsSize) {
    int n = heightsSize, best = 0;
    for (int i = 0; i < n; i++) {
        int l = i - 1, r = i + 1, h = heights[i];
        while (l >= 0 && heights[l] >= h) l--;
        while (r < n && heights[r] >= h) r++;
        if (h * (r - l - 1) > best) best = h * (r - l - 1);
    }
    return best;
}`,
        cpp: `int largestRectangleArea(vector<int>& heights) {
    int n = heights.size(), best = 0;
    for (int i = 0; i < n; i++) {
        int l = i - 1, r = i + 1, h = heights[i];
        while (l >= 0 && heights[l] >= h) l--;
        while (r < n && heights[r] >= h) r++;
        best = max(best, h * (r - l - 1));
    }
    return best;
}`,
        java: `int largestRectangleArea(int[] heights) {
    int n = heights.length, best = 0;
    for (int i = 0; i < n; i++) {
        int l = i - 1, r = i + 1, h = heights[i];
        while (l >= 0 && heights[l] >= h) l--;
        while (r < n && heights[r] >= h) r++;
        best = Math.max(best, h * (r - l - 1));
    }
    return best;
}`,
        javascript: `function largestRectangleArea(heights) {
  const n = heights.length;
  let best = 0;
  for (let i = 0; i < n; i++) {
    let l = i - 1, r = i + 1;
    const h = heights[i];
    while (l >= 0 && heights[l] >= h) l--;
    while (r < n && heights[r] >= h) r++;
    best = Math.max(best, h * (r - l - 1));
  }
  return best;
}`,
      },
    },
    {
      name: '單調遞增堆疊',
      idea: '堆疊存索引,對應高度遞增。`heights[i]` ≤ 頂端高度時一直彈出:被彈出的 top 以 `heights[top]` 為高,寬 = `i − 新頂端 − 1`(堆疊空了就是 i)。最後補一個 0 清空堆疊。',
      steps: ['`for i in 0..n`(i == n 時高度當 0)', '`while stack and h[stack[-1]] >= h[i]`:`top = pop()`', '`left = stack[-1] if stack else −1`;`best = max(best, h[top] × (i − left − 1))`', '`push(i)`'],
      figure: { title: `heights = [${H}]`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每根柱子進出堆疊各一次。' },
      verdict: '標準解,[[p:monotonic-stack]]最經典的題目之一。85. Maximal Rectangle 就是把每一列當成直方圖,重複這一題。',
      code: {
        python: `def largestRectangleArea(heights):
    stack, best = [], 0
    for i, h in enumerate(heights + [0]):     # 補一個 0:最後把堆疊清空
        while stack and heights[stack[-1]] >= h:
            top = stack.pop()                 # i 是它右邊第一個比較矮的
            left = stack[-1] if stack else -1 # 新的頂端是它左邊第一個比較矮的
            best = max(best, heights[top] * (i - left - 1))
        stack.append(i)
    return best`,
        c: `int largestRectangleArea(int *heights, int heightsSize) {
    int n = heightsSize, *st = malloc((n + 1) * sizeof(int)), top = 0, best = 0;
    for (int i = 0; i <= n; i++) {
        int h = i == n ? 0 : heights[i];
        while (top && heights[st[top - 1]] >= h) {
            int t = st[--top];
            int left = top ? st[top - 1] : -1;
            int area = heights[t] * (i - left - 1);
            if (area > best) best = area;
        }
        st[top++] = i;
    }
    free(st);
    return best;
}`,
        cpp: `int largestRectangleArea(vector<int>& heights) {
    int n = heights.size(), best = 0;
    vector<int> st;
    for (int i = 0; i <= n; i++) {
        int h = i == n ? 0 : heights[i];
        while (!st.empty() && heights[st.back()] >= h) {
            int t = st.back(); st.pop_back();
            int left = st.empty() ? -1 : st.back();
            best = max(best, heights[t] * (i - left - 1));
        }
        st.push_back(i);
    }
    return best;
}`,
        java: `int largestRectangleArea(int[] heights) {
    int n = heights.length, best = 0;
    int[] st = new int[n + 1];
    int top = 0;
    for (int i = 0; i <= n; i++) {
        int h = i == n ? 0 : heights[i];
        while (top > 0 && heights[st[top - 1]] >= h) {
            int t = st[--top];
            int left = top > 0 ? st[top - 1] : -1;
            best = Math.max(best, heights[t] * (i - left - 1));
        }
        st[top++] = i;
    }
    return best;
}`,
        javascript: `function largestRectangleArea(heights) {
  const n = heights.length, st = [];
  let best = 0;
  for (let i = 0; i <= n; i++) {
    const h = i === n ? 0 : heights[i];
    while (st.length && heights[st[st.length - 1]] >= h) {
      const t = st.pop();
      const left = st.length ? st[st.length - 1] : -1;
      best = Math.max(best, heights[t] * (i - left - 1));
    }
    st.push(i);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    '寬度算成 `i − top`:應該用彈出後**新的頂端**當左邊界,中間被彈掉的柱子都比 top 高,也算在寬度裡',
    '忘了最後補 0:遞增到底的柱子(例如 [1,2,3])永遠不會被彈出結算',
    '堆疊空了時左邊界要用 −1(代表一路延伸到最左邊)',
  ],
  followUp: [{ q: '二維的 0/1 矩陣裡最大的全 1 矩形?', a: '85. Maximal Rectangle:逐列累計每一行連續 1 的高度,每一列都當成直方圖跑一次這題 → O(m·n)。' }],
  check: {
    kind: 'fn',
    fn: 'largestRectangleArea',
    cases: [
      { args: [H], out: 10 },
      { args: [[2, 4]], out: 4 },
      { args: [[1, 2, 3, 4, 5]], out: 9 },
      { args: [[0]], out: 0 },
      { args: [[2, 2, 2]], out: 6 },
      { args: [[6, 2, 5, 4, 5, 1, 6]], out: 12 },
    ],
  },
}

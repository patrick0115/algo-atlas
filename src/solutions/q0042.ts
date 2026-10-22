import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 42. Trapping Rain Water

const H = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]

function prefixFig(): FigStep[] {
  const n = H.length
  const L = [...H]
  const R = [...H]
  for (let i = 1; i < n; i++) L[i] = Math.max(L[i - 1], H[i])
  for (let i = n - 2; i >= 0; i--) R[i] = Math.max(R[i + 1], H[i])
  const W = H.map((h, i) => Math.min(L[i], R[i]) - h)
  return [
    { note: '每一格能裝多少水,只看它**左邊最高**和**右邊最高**:水位 = 兩者中比較矮的那個,水量 = 水位 − 自己的高度', views: [arr(H, { label: 'height', mode: 'bars' })] },
    { note: 'leftMax[i] = height[0..i] 的最大值(從左往右掃);rightMax[i] = height[i..n−1] 的最大值(從右往左掃)', views: [arr(L, { label: 'leftMax' }), arr(R, { label: 'rightMax' })] },
    { note: `water[i] = min(leftMax, rightMax) − height。例如第 5 格:min(2, 3) − 0 = 2`, views: [arr(H, { label: 'height', mode: 'bars', highlight: [5] }), arr(W, { label: 'water', highlight: [5] })] },
    { note: `加總 = ${W.reduce((a, b) => a + b, 0)}`, views: [arr(W, { label: 'water', done: W.flatMap((w, i) => (w > 0 ? [i] : [])) })] },
  ]
}

function twoFig(): FigStep[] {
  let l = 0
  let r = H.length - 1
  let lm = 0
  let rm = 0
  let total = 0
  const out: FigStep[] = [{ note: '雙指針:左右各一個,各自記住「自己這邊目前最高」。**比較矮的那邊**可以直接結算:因為另一邊一定有更高的牆擋著,水位只取決於矮的那邊的最高值', views: [arr(H, { label: 'height', mode: 'bars', highlight: [l, r] })] }]
  while (l < r) {
    let msg: string
    let at: number
    if (H[l] < H[r]) {
      lm = Math.max(lm, H[l])
      total += lm - H[l]
      msg = `左邊比較矮:leftMax = ${lm},這格裝 ${lm - H[l]},l 右移`
      at = l
      l++
    } else {
      rm = Math.max(rm, H[r])
      total += rm - H[r]
      msg = `右邊不比左邊矮:rightMax = ${rm},這格裝 ${rm - H[r]},r 左移`
      at = r
      r--
    }
    out.push({ note: `${msg}(累計 ${total})`, views: [arr(H, { label: 'height', mode: 'bars', highlight: [at], compare: [l, r].filter((x) => x !== at), dim: range(0, H.length - 1).filter((i) => i < l && i !== at || i > r && i !== at) })] })
  }
  out.push({ note: `兩個指針相遇,總共 ${total}`, views: [arr([total], { label: '答案', done: [0] })] })
  return out
}

function stackFig(): FigStep[] {
  return [
    { note: '單調堆疊:由左往右,堆疊裡放「高度遞減」的索引。遇到比堆疊頂端高的牆,就代表頂端那格形成了一個「凹槽」', views: [arr(H, { label: 'height', mode: 'bars', highlight: [3], compare: [1, 2] })] },
    { note: '彈出凹槽底部 2(高 0),左牆是新的頂端 1(高 1)、右牆是 3(高 2):水高 min(1, 2) − 0 = 1,寬 3 − 1 − 1 = 1 → 裝 1', views: [arr(H, { label: 'height', mode: 'bars', highlight: [2], compare: [1, 3] })] },
    { note: '水是**一層一層橫著**算的(和前兩種方法一格一格直著算不同),總和一樣是 6', views: [arr(H, { label: 'height', mode: 'bars', done: [2, 4, 5, 6, 9] })] },
  ]
}

export const q0042: Solution = {
  id: 42,
  plain: '一排高低不同的柱子,下雨之後柱子之間的凹處會積水。總共能積多少格水?',
  statement: '給 n 個非負整數表示每根柱子的高度(寬度都是 1),計算下雨後能接住多少單位的雨水。',
  examples: [
    { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
    { input: 'height = [4,2,0,3,2,5]', output: '9' },
  ],
  constraints: ['`n ≤ 2·10⁴` → O(n²) 勉強,目標 O(n)'],
  insight: [
    '只看一格:它上面的水位 = min(左邊最高, 右邊最高)。水量 = 水位 − 自己的高度(負的就是 0)',
    '暴力:每格往左右各掃一次找最高 → O(n²)',
    '預先算好 leftMax、rightMax 兩個陣列 → O(n) 時間、O(n) 空間',
    '**雙指針**:哪邊比較矮,那邊的水位就確定了(另一邊一定有更高的牆)→ O(1) 空間',
  ],
  approaches: [
    {
      name: '前綴最大 + 後綴最大',
      idea: '`leftMax[i]`、`rightMax[i]` 各掃一次,答案是 `Σ min(leftMax[i], rightMax[i]) − height[i]`。',
      steps: ['左往右:`leftMax[i] = max(leftMax[i−1], h[i])`', '右往左:`rightMax[i] = max(rightMax[i+1], h[i])`', '加總 `min(leftMax[i], rightMax[i]) − h[i]`'],
      figure: { title: `height = [${H}]`, steps: prefixFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '三次線性掃描,兩個輔助陣列。' },
      verdict: '最好理解,是雙指針解法的基礎。',
      code: {
        python: `def trap(height):
    n = len(height)
    left, right = [0] * n, [0] * n
    for i in range(n):
        left[i] = max(left[i - 1] if i else 0, height[i])
    for i in range(n - 1, -1, -1):
        right[i] = max(right[i + 1] if i < n - 1 else 0, height[i])
    return sum(min(left[i], right[i]) - height[i] for i in range(n))`,
        c: `int trap(int *height, int heightSize) {
    int n = heightSize, total = 0;
    int *L = malloc(n * sizeof(int)), *R = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) L[i] = i && L[i - 1] > height[i] ? L[i - 1] : height[i];
    for (int i = n - 1; i >= 0; i--) R[i] = i < n - 1 && R[i + 1] > height[i] ? R[i + 1] : height[i];
    for (int i = 0; i < n; i++) total += (L[i] < R[i] ? L[i] : R[i]) - height[i];
    free(L); free(R);
    return total;
}`,
        cpp: `int trap(vector<int>& height) {
    int n = height.size(), total = 0;
    vector<int> L(n), R(n);
    for (int i = 0; i < n; i++) L[i] = max(i ? L[i - 1] : 0, height[i]);
    for (int i = n - 1; i >= 0; i--) R[i] = max(i < n - 1 ? R[i + 1] : 0, height[i]);
    for (int i = 0; i < n; i++) total += min(L[i], R[i]) - height[i];
    return total;
}`,
        java: `int trap(int[] height) {
    int n = height.length, total = 0;
    int[] L = new int[n], R = new int[n];
    for (int i = 0; i < n; i++) L[i] = Math.max(i > 0 ? L[i - 1] : 0, height[i]);
    for (int i = n - 1; i >= 0; i--) R[i] = Math.max(i < n - 1 ? R[i + 1] : 0, height[i]);
    for (int i = 0; i < n; i++) total += Math.min(L[i], R[i]) - height[i];
    return total;
}`,
        javascript: `function trap(height) {
  const n = height.length, L = new Array(n), R = new Array(n);
  for (let i = 0; i < n; i++) L[i] = Math.max(i ? L[i - 1] : 0, height[i]);
  for (let i = n - 1; i >= 0; i--) R[i] = Math.max(i < n - 1 ? R[i + 1] : 0, height[i]);
  let total = 0;
  for (let i = 0; i < n; i++) total += Math.min(L[i], R[i]) - height[i];
  return total;
}`,
      },
    },
    {
      name: '雙指針',
      idea: '`l, r` 從兩端往內。`h[l] < h[r]`:左邊的水位只看 leftMax(右邊有更高的牆),結算 l 並右移;否則結算 r 並左移。',
      steps: ['`l = 0, r = n − 1, lm = rm = 0`', '`h[l] < h[r]`:`lm = max(lm, h[l])`,`total += lm − h[l]`,`l++`', '否則:`rm = max(rm, h[r])`,`total += rm − h[r]`,`r−−`'],
      figure: { title: `height = [${H}]`, steps: twoFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每格被一個指針經過一次。' },
      verdict: '最推薦,[[p:two-pointers]]的代表題。關鍵是想通「為什麼可以只看矮的那邊」。',
      code: {
        python: `def trap(height):
    l, r = 0, len(height) - 1
    lm = rm = total = 0
    while l < r:
        if height[l] < height[r]:             # 右邊有更高的牆:左邊的水位只看 lm
            lm = max(lm, height[l])
            total += lm - height[l]
            l += 1
        else:                                 # 左邊有不比右邊矮的牆:右邊的水位只看 rm
            rm = max(rm, height[r])
            total += rm - height[r]
            r -= 1
    return total`,
        c: `int trap(int *height, int heightSize) {
    int l = 0, r = heightSize - 1, lm = 0, rm = 0, total = 0;
    while (l < r) {
        if (height[l] < height[r]) {
            if (height[l] > lm) lm = height[l];
            total += lm - height[l++];
        } else {
            if (height[r] > rm) rm = height[r];
            total += rm - height[r--];
        }
    }
    return total;
}`,
        cpp: `int trap(vector<int>& height) {
    int l = 0, r = height.size() - 1, lm = 0, rm = 0, total = 0;
    while (l < r) {
        if (height[l] < height[r]) { lm = max(lm, height[l]); total += lm - height[l++]; }
        else { rm = max(rm, height[r]); total += rm - height[r--]; }
    }
    return total;
}`,
        java: `int trap(int[] height) {
    int l = 0, r = height.length - 1, lm = 0, rm = 0, total = 0;
    while (l < r) {
        if (height[l] < height[r]) { lm = Math.max(lm, height[l]); total += lm - height[l++]; }
        else { rm = Math.max(rm, height[r]); total += rm - height[r--]; }
    }
    return total;
}`,
        javascript: `function trap(height) {
  let l = 0, r = height.length - 1, lm = 0, rm = 0, total = 0;
  while (l < r) {
    if (height[l] < height[r]) { lm = Math.max(lm, height[l]); total += lm - height[l++]; }
    else { rm = Math.max(rm, height[r]); total += rm - height[r--]; }
  }
  return total;
}`,
      },
    },
    {
      name: '單調堆疊',
      idea: '堆疊存高度遞減的索引。遇到 `h[i] > h[top]`:彈出 top 當凹槽底,新的頂端是左牆、i 是右牆,裝 `(min(左牆, 右牆) − 底) × 寬度`。',
      steps: ['`for i`:`while stack and h[i] > h[stack[-1]]`', '`bottom = pop()`;堆疊空了就 break', '`left = stack[-1]`;`w = i − left − 1`;`total += (min(h[left], h[i]) − h[bottom]) × w`', '`push(i)`'],
      figure: { title: `height = [${H}]`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個索引進出堆疊各一次。' },
      verdict: '一層一層橫著算水,[[p:monotonic-stack]]的經典應用;和 84. Largest Rectangle in Histogram 是同一類想法。',
      code: {
        python: `def trap(height):
    stack, total = [], 0
    for i, h in enumerate(height):
        while stack and h > height[stack[-1]]:
            bottom = stack.pop()              # 凹槽的底
            if not stack:
                break                         # 沒有左牆,裝不了水
            left = stack[-1]
            w = i - left - 1
            total += (min(height[left], h) - height[bottom]) * w
        stack.append(i)
    return total`,
        c: `int trap(int *height, int heightSize) {
    int *st = malloc(heightSize * sizeof(int)), top = 0, total = 0;
    for (int i = 0; i < heightSize; i++) {
        while (top && height[i] > height[st[top - 1]]) {
            int bottom = st[--top];
            if (!top) break;
            int left = st[top - 1], w = i - left - 1;
            int lh = height[left] < height[i] ? height[left] : height[i];
            total += (lh - height[bottom]) * w;
        }
        st[top++] = i;
    }
    free(st);
    return total;
}`,
        cpp: `int trap(vector<int>& height) {
    stack<int> st;
    int total = 0;
    for (int i = 0; i < (int)height.size(); i++) {
        while (!st.empty() && height[i] > height[st.top()]) {
            int bottom = st.top(); st.pop();
            if (st.empty()) break;
            int left = st.top(), w = i - left - 1;
            total += (min(height[left], height[i]) - height[bottom]) * w;
        }
        st.push(i);
    }
    return total;
}`,
        java: `int trap(int[] height) {
    Deque<Integer> st = new ArrayDeque<>();
    int total = 0;
    for (int i = 0; i < height.length; i++) {
        while (!st.isEmpty() && height[i] > height[st.peek()]) {
            int bottom = st.pop();
            if (st.isEmpty()) break;
            int left = st.peek(), w = i - left - 1;
            total += (Math.min(height[left], height[i]) - height[bottom]) * w;
        }
        st.push(i);
    }
    return total;
}`,
        javascript: `function trap(height) {
  const st = [];
  let total = 0;
  for (let i = 0; i < height.length; i++) {
    while (st.length && height[i] > height[st[st.length - 1]]) {
      const bottom = st.pop();
      if (!st.length) break;
      const left = st[st.length - 1], w = i - left - 1;
      total += (Math.min(height[left], height[i]) - height[bottom]) * w;
    }
    st.push(i);
  }
  return total;
}`,
      },
    },
  ],
  pitfalls: [
    '水位取 max(左最高, 右最高):應該是 min,水會從矮的那邊流掉',
    '雙指針時比較 leftMax 和 rightMax 還是比較 height[l] 和 height[r]:兩種都對,但要和結算的那邊一致',
    '堆疊版本彈出後沒檢查堆疊是否為空:沒有左牆的凹槽不能裝水',
  ],
  followUp: [{ q: '二維的版本?', a: '407. Trapping Rain Water II:從外圈開始用最小堆往內「灌水」,每次處理目前最矮的邊界。' }],
  check: {
    kind: 'fn',
    fn: 'trap',
    cases: [
      { args: [H], out: 6 },
      { args: [[4, 2, 0, 3, 2, 5]], out: 9 },
      { args: [[1]], out: 0 },
      { args: [[3, 2, 1]], out: 0 },
      { args: [[5, 0, 5]], out: 5 },
      { args: [[2, 0, 1, 0, 3]], out: 5 },
    ],
  },
}

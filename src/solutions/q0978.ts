import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 978. Longest Turbulent Subarray

const A = [9, 4, 2, 10, 7, 8, 8, 1, 9]

function sign(a: number, b: number): number {
  return a < b ? 1 : a > b ? -1 : 0
}

function winFig(): FigStep[] {
  let l = 0
  let best = 1
  const out: FigStep[] = [{ note: '「亂流」= 大小關係一直交替:<, >, <, > … 或 >, <, >, < …。看相鄰兩個的比較符號,符號必須一正一負交替', views: [arr(A, { label: 'arr', mode: 'bars' })] }]
  for (let r = 1; r < A.length; r++) {
    const c = sign(A[r - 1], A[r])
    let note: string
    if (c === 0) {
      l = r
      note = `arr[${r - 1}] = arr[${r}] = ${A[r]}:相等,亂流斷掉,從 ${r} 重新開始`
    } else if (r === 1 || c * sign(A[r - 2], A[r - 1]) !== -1) {
      l = r - 1
      note = `${A[r - 1]} ${c > 0 ? '<' : '>'} ${A[r]}:和前一個比較符號沒有交替,從 ${r - 1} 重新開始`
    } else note = `${A[r - 1]} ${c > 0 ? '<' : '>'} ${A[r]}:符號交替,延長`
    best = Math.max(best, r - l + 1)
    out.push({ note: `${note}。視窗 [${l}, ${r}] 長度 ${r - l + 1},最長 ${best}`, views: [arr(A, { label: 'arr', mode: 'bars', range: [l, r], highlight: [r] })] })
  }
  return out
}

function dpFig(): FigStep[] {
  return [
    { note: 'DP 版:up = 以目前位置結尾、最後一步是「上升」的最長長度;down = 最後一步是「下降」的最長長度', views: [arr(['up', 'down'], { label: '兩個狀態' })] },
    { note: 'arr[i−1] < arr[i] → up = down + 1、down = 1;arr[i−1] > arr[i] → down = up + 1、up = 1;相等 → 兩個都重設成 1', views: [arr([1, 2, 2, 3, 4, 5, 1, 2, 3], { label: 'max(up, down)', done: [5] })] },
  ]
}

export const q0978: Solution = {
  id: 978,
  plain: '找最長的一段連續數字,它們的大小「一上一下」交替,像鋸齒一樣:小、大、小、大……或大、小、大、小……',
  statement: '若子陣列 `arr[i..j]` 中相鄰元素的比較符號在 `>` 和 `<` 之間交替,稱為**湍流子陣列**。給整數陣列 `arr`,回傳最長湍流子陣列的長度。',
  examples: [
    { input: 'arr = [9,4,2,10,7,8,8,1,9]', output: '5', note: '[4,2,10,7,8]' },
    { input: 'arr = [4,8,12,16]', output: '2' },
    { input: 'arr = [100]', output: '1' },
  ],
  constraints: ['n ≤ 4·10⁴'],
  insight: ['只看相鄰兩個的比較符號:+1(上升)、−1(下降)、0(相等)', '亂流 = 符號連續交替,相乘等於 −1', '符號沒交替或相等時,亂流斷掉,視窗從斷點重新開始'],
  approaches: [
    {
      name: '滑動視窗(看比較符號是否交替)',
      idea: '`c = cmp(arr[r−1], arr[r])`;相等 → `l = r`;和前一個符號相乘不是 −1 → `l = r − 1`;否則延長。',
      steps: ['`l = 0`、`best = 1`', '`for r in 1..n−1`:`c = sign(arr[r] − arr[r − 1])`', '`c == 0` → `l = r`;`r == 1` 或 `c * 前一個符號 != −1` → `l = r − 1`', '`best = max(best, r − l + 1)`'],
      figure: { title: `arr = [${A}]`, steps: winFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描。' },
      verdict: '最推薦,可變視窗的「斷了就重來」型。',
      code: {
        python: `def maxTurbulenceSize(arr):
    def cmp(a, b):
        return (a < b) - (a > b)              # 上升 1、下降 −1、相等 0
    l, best = 0, 1
    for r in range(1, len(arr)):
        c = cmp(arr[r - 1], arr[r])
        if c == 0:
            l = r                             # 相等:從這裡重新開始
        elif r == 1 or c * cmp(arr[r - 2], arr[r - 1]) != -1:
            l = r - 1                         # 沒交替:從前一個重新開始
        best = max(best, r - l + 1)
    return best`,
        c: `static int cmpi(int a, int b) { return (a < b) - (a > b); }

int maxTurbulenceSize(int *arr, int arrSize) {
    int l = 0, best = 1;
    for (int r = 1; r < arrSize; r++) {
        int c = cmpi(arr[r - 1], arr[r]);
        if (c == 0) l = r;
        else if (r == 1 || c * cmpi(arr[r - 2], arr[r - 1]) != -1) l = r - 1;
        if (r - l + 1 > best) best = r - l + 1;
    }
    return best;
}`,
        cpp: `int maxTurbulenceSize(vector<int>& arr) {
    auto cmp = [](int a, int b) { return (a < b) - (a > b); };
    int l = 0, best = 1;
    for (int r = 1; r < (int)arr.size(); r++) {
        int c = cmp(arr[r - 1], arr[r]);
        if (c == 0) l = r;
        else if (r == 1 || c * cmp(arr[r - 2], arr[r - 1]) != -1) l = r - 1;
        best = max(best, r - l + 1);
    }
    return best;
}`,
        java: `int maxTurbulenceSize(int[] arr) {
    int l = 0, best = 1;
    for (int r = 1; r < arr.length; r++) {
        int c = Integer.compare(arr[r], arr[r - 1]);
        if (c == 0) l = r;
        else if (r == 1 || c * Integer.compare(arr[r - 1], arr[r - 2]) != -1) l = r - 1;
        best = Math.max(best, r - l + 1);
    }
    return best;
}`,
        javascript: `function maxTurbulenceSize(arr) {
  const cmp = (a, b) => Math.sign(b - a);
  let l = 0, best = 1;
  for (let r = 1; r < arr.length; r++) {
    const c = cmp(arr[r - 1], arr[r]);
    if (c === 0) l = r;
    else if (r === 1 || c * cmp(arr[r - 2], arr[r - 1]) !== -1) l = r - 1;
    best = Math.max(best, r - l + 1);
  }
  return best;
}`,
      },
    },
    {
      name: '上升 / 下降兩個狀態的 DP',
      idea: '`up`、`down` = 以目前結尾、最後一步上升 / 下降的最長長度;依比較結果互相轉移。',
      steps: ['`up = down = 1`', '`arr[i−1] < arr[i]`:`up, down = down + 1, 1`', '`arr[i−1] > arr[i]`:`down, up = up + 1, 1`;相等:`up = down = 1`', '`best = max(best, up, down)`'],
      figure: { title: `arr = [${A}]`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩個變數滾動。' },
      verdict: '和 376. Wiggle Subsequence 同一個狀態設計,只是這題要求連續。',
      code: {
        python: `def maxTurbulenceSize(arr):
    up = down = best = 1
    for i in range(1, len(arr)):
        if arr[i - 1] < arr[i]:
            up, down = down + 1, 1            # 這步上升:接在「最後下降」的後面
        elif arr[i - 1] > arr[i]:
            up, down = 1, up + 1
        else:
            up = down = 1
        best = max(best, up, down)
    return best`,
        c: `int maxTurbulenceSize(int *arr, int arrSize) {
    int up = 1, down = 1, best = 1;
    for (int i = 1; i < arrSize; i++) {
        if (arr[i - 1] < arr[i]) { up = down + 1; down = 1; }
        else if (arr[i - 1] > arr[i]) { down = up + 1; up = 1; }
        else up = down = 1;
        if (up > best) best = up;
        if (down > best) best = down;
    }
    return best;
}`,
        cpp: `int maxTurbulenceSize(vector<int>& arr) {
    int up = 1, down = 1, best = 1;
    for (size_t i = 1; i < arr.size(); i++) {
        if (arr[i - 1] < arr[i]) { up = down + 1; down = 1; }
        else if (arr[i - 1] > arr[i]) { down = up + 1; up = 1; }
        else up = down = 1;
        best = max({best, up, down});
    }
    return best;
}`,
        java: `int maxTurbulenceSize(int[] arr) {
    int up = 1, down = 1, best = 1;
    for (int i = 1; i < arr.length; i++) {
        if (arr[i - 1] < arr[i]) { up = down + 1; down = 1; }
        else if (arr[i - 1] > arr[i]) { down = up + 1; up = 1; }
        else up = down = 1;
        best = Math.max(best, Math.max(up, down));
    }
    return best;
}`,
        javascript: `function maxTurbulenceSize(arr) {
  let up = 1, down = 1, best = 1;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] < arr[i]) [up, down] = [down + 1, 1];
    else if (arr[i - 1] > arr[i]) [up, down] = [1, up + 1];
    else up = down = 1;
    best = Math.max(best, up, down);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: ['相等的情況:長度要重設成 1(相等不屬於上升也不屬於下降)', 'C 語言 `(a < b) − (a > b)` 不會溢位;直接 `b − a` 再取正負號可能溢位'],
  check: {
    kind: 'fn',
    fn: 'maxTurbulenceSize',
    cases: [
      { args: [A], out: 5 },
      { args: [[4, 8, 12, 16]], out: 2 },
      { args: [[100]], out: 1 },
      { args: [[9, 9]], out: 1 },
      { args: [[0, 1, 1, 0, 1, 0, 1, 1, 0, 0]], out: 5 },
    ],
  },
}

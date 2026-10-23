import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1343. Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold

const A = [2, 2, 2, 2, 5, 5, 5, 8]
const K = 3
const TH = 4

function winFig(): FigStep[] {
  const need = K * TH
  let s = A.slice(0, K).reduce((a, b) => a + b, 0)
  let cnt = s >= need ? 1 : 0
  const out: FigStep[] = [{ note: `平均 ≥ ${TH} ⇔ 總和 ≥ ${K} × ${TH} = ${need}(不用做除法)。先算第一個視窗的和 = ${s}${s >= need ? ' ✓' : ''}`, views: [arr(A, { label: 'arr', range: [0, K - 1] })] }]
  for (let i = K; i < A.length; i++) {
    s += A[i] - A[i - K]
    if (s >= need) cnt++
    out.push({ note: `往右滑:加上 ${A[i]}、減掉 ${A[i - K]} → 和 = ${s} ${s >= need ? `≥ ${need} ✓,共 ${cnt} 個` : `< ${need}`}`, views: [arr(A, { label: 'arr', range: [i - K + 1, i], highlight: [i], dim: [i - K] })] })
  }
  return out
}

function preFig(): FigStep[] {
  const pre = [0]
  for (const x of A) pre.push(pre[pre.length - 1] + x)
  return [
    { note: '前綴和版:pre[i] = 前 i 個的和,任一長度 k 的視窗和 = pre[i + k] − pre[i]', views: [arr(A, { label: 'arr' }), arr(pre, { label: 'pre' })] },
    { note: `例如 [3, 5] 的和 = pre[6] − pre[3] = ${pre[6]} − ${pre[3]} = ${pre[6] - pre[3]}。多用 O(n) 空間,但每個視窗都是 O(1)`, views: [arr(pre, { label: 'pre', highlight: [3, 6] })] },
  ]
}

export const q1343: Solution = {
  id: 1343,
  plain: '一排數字裡,有幾段「長度剛好 k 的連續子陣列」,平均值至少是 threshold?',
  statement: '給整數陣列 `arr`、整數 `k`、`threshold`,回傳長度為 k 且**平均值 ≥ threshold** 的子陣列個數。',
  examples: [
    { input: 'arr = [2,2,2,2,5,5,5,8], k = 3, threshold = 4', output: '3', note: '[2,5,5]、[5,5,5]、[5,5,8]' },
    { input: 'arr = [11,13,17,23,29,31,7,5,2,3], k = 3, threshold = 5', output: '6' },
  ],
  constraints: ['n ≤ 10⁵,值 ≤ 10⁴'],
  insight: ['平均 ≥ t ⇔ 總和 ≥ k·t,避免浮點除法', '長度固定的視窗,往右滑一格:加上新進來的、減掉離開的 → O(1)', '[[p:sliding-window]]最基本的固定長度版本'],
  approaches: [
    {
      name: '固定長度滑動視窗',
      idea: '先算前 k 個的和;之後每次 `s += arr[i] − arr[i − k]`,`s ≥ k·threshold` 就計數。',
      steps: ['`need = k * threshold`', '`s = sum(arr[:k])`;`cnt = (s >= need)`', '`for i in k..n−1`:`s += arr[i] − arr[i − k]`;`s >= need` → `cnt += 1`'],
      figure: { title: `arr = [${A}],k = ${K},threshold = ${TH}`, steps: winFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個元素進出視窗各一次。' },
      verdict: '最推薦,固定長度視窗的模板題。',
      code: {
        python: `def numOfSubarrays(arr, k, threshold):
    need = k * threshold                      # 平均 ≥ t ⇔ 總和 ≥ k·t
    s = sum(arr[:k])
    cnt = int(s >= need)
    for i in range(k, len(arr)):
        s += arr[i] - arr[i - k]              # 右邊進一個、左邊出一個
        if s >= need:
            cnt += 1
    return cnt`,
        c: `int numOfSubarrays(int *arr, int arrSize, int k, int threshold) {
    int need = k * threshold, s = 0, cnt = 0;
    for (int i = 0; i < arrSize; i++) {
        s += arr[i];
        if (i >= k) s -= arr[i - k];
        if (i >= k - 1 && s >= need) cnt++;
    }
    return cnt;
}`,
        cpp: `int numOfSubarrays(vector<int>& arr, int k, int threshold) {
    int need = k * threshold, s = 0, cnt = 0;
    for (int i = 0; i < (int)arr.size(); i++) {
        s += arr[i];
        if (i >= k) s -= arr[i - k];
        if (i >= k - 1 && s >= need) cnt++;
    }
    return cnt;
}`,
        java: `int numOfSubarrays(int[] arr, int k, int threshold) {
    int need = k * threshold, s = 0, cnt = 0;
    for (int i = 0; i < arr.length; i++) {
        s += arr[i];
        if (i >= k) s -= arr[i - k];
        if (i >= k - 1 && s >= need) cnt++;
    }
    return cnt;
}`,
        javascript: `function numOfSubarrays(arr, k, threshold) {
  const need = k * threshold;
  let s = 0, cnt = 0;
  for (let i = 0; i < arr.length; i++) {
    s += arr[i];
    if (i >= k) s -= arr[i - k];
    if (i >= k - 1 && s >= need) cnt++;
  }
  return cnt;
}`,
      },
    },
    {
      name: '前綴和',
      idea: '`pre[i]` = 前 i 個的和;每個起點 i,`pre[i + k] − pre[i] ≥ k·t` 就計數。',
      steps: ['算 pre(長度 n+1)', '`for i in 0..n−k`:`pre[i + k] − pre[i] >= k * t` → 計數'],
      figure: { title: `arr = [${A}],k = ${K},threshold = ${TH}`, steps: preFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '多一個前綴和陣列。' },
      verdict: '和視窗一樣快,適合同一個陣列要查很多種 k 的時候。',
      code: {
        python: `def numOfSubarrays(arr, k, threshold):
    pre = [0]
    for x in arr:
        pre.append(pre[-1] + x)
    need = k * threshold
    return sum(1 for i in range(len(arr) - k + 1) if pre[i + k] - pre[i] >= need)`,
        c: `int numOfSubarrays(int *arr, int arrSize, int k, int threshold) {
    int *pre = calloc(arrSize + 1, sizeof(int)), cnt = 0;
    for (int i = 0; i < arrSize; i++) pre[i + 1] = pre[i] + arr[i];
    for (int i = 0; i + k <= arrSize; i++) if (pre[i + k] - pre[i] >= k * threshold) cnt++;
    free(pre);
    return cnt;
}`,
        cpp: `int numOfSubarrays(vector<int>& arr, int k, int threshold) {
    int n = arr.size(), cnt = 0;
    vector<int> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + arr[i];
    for (int i = 0; i + k <= n; i++) if (pre[i + k] - pre[i] >= k * threshold) cnt++;
    return cnt;
}`,
        java: `int numOfSubarrays(int[] arr, int k, int threshold) {
    int n = arr.length, cnt = 0;
    int[] pre = new int[n + 1];
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + arr[i];
    for (int i = 0; i + k <= n; i++) if (pre[i + k] - pre[i] >= k * threshold) cnt++;
    return cnt;
}`,
        javascript: `function numOfSubarrays(arr, k, threshold) {
  const pre = [0];
  for (const x of arr) pre.push(pre[pre.length - 1] + x);
  let cnt = 0;
  for (let i = 0; i + k <= arr.length; i++) if (pre[i + k] - pre[i] >= k * threshold) cnt++;
  return cnt;
}`,
      },
    },
  ],
  pitfalls: ['用平均值的浮點數比較:可能有精度誤差,改比總和', '每個視窗都重新加 k 個:O(n·k)'],
  check: {
    kind: 'fn',
    fn: 'numOfSubarrays',
    cases: [
      { args: [A, K, TH], out: 3 },
      { args: [[11, 13, 17, 23, 29, 31, 7, 5, 2, 3], 3, 5], out: 6 },
      { args: [[1, 1, 1], 1, 1], out: 3 },
      { args: [[1, 2], 2, 3], out: 0 },
    ],
  },
}

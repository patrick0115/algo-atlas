import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 338. Counting Bits

const N = 8

function shiftFig(): FigStep[] {
  const ans: (number | string)[] = Array(N + 1).fill('')
  ans[0] = 0
  const out: FigStep[] = [{ note: 'i 的二進位,去掉最後一位就是 i >> 1(i / 2)。所以 i 的 1 的個數 = (i >> 1) 的個數 + 最後一位(i & 1)。i >> 1 比 i 小,早就算好了', views: [arr(range(0, N).map((i) => i.toString(2)), { label: '二進位' }), arr([...ans], { label: 'ans' })] }]
  for (let i = 1; i <= N; i++) {
    ans[i] = (ans[i >> 1] as number) + (i & 1)
    out.push({ note: `${i} = ${i.toString(2)}:ans[${i >> 1}](${(i >> 1).toString(2) || '0'})= ${ans[i >> 1]},最後一位 ${i & 1} → ${ans[i]}`, views: [arr(range(0, N).map((k) => k.toString(2)), { label: '二進位', highlight: [i], compare: [i >> 1] }), arr([...ans], { label: 'ans', highlight: [i], compare: [i >> 1] })] })
  }
  return out
}

function lowbitFig(): FigStep[] {
  return [
    { note: '`i & (i − 1)` 會把 i 最右邊的 1 變成 0。例如 12 = 1100,11 = 1011,相 & → 1000 = 8', views: [arr(['1100', '1011', '1000'], { label: '[i, i−1, i & (i−1)]', highlight: [2] })] },
    { note: '所以 ans[i] = ans[i & (i − 1)] + 1:比 i 少一個 1 的數,早就算好了。ans[12] = ans[8] + 1 = 2', views: [arr([0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2], { label: 'ans[0..12]', highlight: [12], compare: [8] })] },
  ]
}

export const q0338: Solution = {
  id: 338,
  plain: '對 0 到 n 的每個數,數它的二進位裡有幾個 1,全部放進一個陣列回傳。挑戰是:不要每個數都重新數,要利用「前面算過的答案」。',
  statement: '給整數 `n`,回傳長度 n + 1 的陣列 `ans`,`ans[i]` 是 i 的二進位表示中 1 的個數(0 ≤ i ≤ n)。',
  examples: [
    { input: 'n = 2', output: '[0,1,1]' },
    { input: 'n = 5', output: '[0,1,1,2,1,2]' },
  ],
  constraints: ['`n ≤ 10⁵`', 'Follow-up:O(n),而且不用內建的 popcount'],
  insight: [
    '每個數各自數 1:O(n log n),可以但不是最佳',
    '**DP**:i 的二進位 = (i >> 1) 的二進位後面再接一位 `i & 1` → `ans[i] = ans[i >> 1] + (i & 1)`',
    '另一個關係:`i & (i − 1)` 把最右邊的 1 拿掉 → `ans[i] = ans[i & (i − 1)] + 1`',
    '兩種都只依賴比 i 小的數,由小到大算就好',
  ],
  approaches: [
    {
      name: '每個數各自數(Brian Kernighan)',
      idea: '對每個 i,反覆做 `i &= i − 1`(每次拿掉一個 1),數做了幾次。',
      steps: ['`for i in 0..n`', '`c = 0; x = i; while x: x &= x − 1; c += 1`', '`ans[i] = c`'],
      figure: { title: '`i & (i − 1)` 的作用', steps: lowbitFig() },
      complexity: { time: 'O(n log n)', space: 'O(1)', why: '每個數最多 log n 個 1(不算答案陣列)。' },
      verdict: '直覺,也是 [191. Number of 1 Bits](#/q/191) 的解法;這題的 follow-up 要求更好。',
      code: {
        python: `def countBits(n):
    ans = []
    for i in range(n + 1):
        x, c = i, 0
        while x:
            x &= x - 1                        # 拿掉最右邊的 1
            c += 1
        ans.append(c)
    return ans`,
        c: `int *countBits(int n, int *returnSize) {
    int *ans = malloc((n + 1) * sizeof(int));
    for (int i = 0; i <= n; i++) {
        int x = i, c = 0;
        while (x) { x &= x - 1; c++; }
        ans[i] = c;
    }
    *returnSize = n + 1;
    return ans;
}`,
        cpp: `vector<int> countBits(int n) {
    vector<int> ans(n + 1);
    for (int i = 0; i <= n; i++) {
        int x = i, c = 0;
        while (x) { x &= x - 1; c++; }
        ans[i] = c;
    }
    return ans;
}`,
        java: `int[] countBits(int n) {
    int[] ans = new int[n + 1];
    for (int i = 0; i <= n; i++) {
        int x = i, c = 0;
        while (x != 0) { x &= x - 1; c++; }
        ans[i] = c;
    }
    return ans;
}`,
        javascript: `function countBits(n) {
  const ans = new Array(n + 1);
  for (let i = 0; i <= n; i++) {
    let x = i, c = 0;
    while (x) { x &= x - 1; c++; }
    ans[i] = c;
  }
  return ans;
}`,
      },
    },
    {
      name: 'DP:ans[i] = ans[i >> 1] + (i & 1)',
      idea: 'i 右移一位就是去掉最後一個位元,所以 1 的個數 = 右移後的個數 + 被去掉的那一位。',
      steps: ['`ans[0] = 0`', '`for i in 1..n`:`ans[i] = ans[i >> 1] + (i & 1)`'],
      figure: { title: `n = ${N}`, steps: shiftFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個 i 一次 O(1)(不算答案陣列)。' },
      verdict: '最推薦,Follow-up 的答案。用 `ans[i & (i − 1)] + 1` 也一樣是 O(n)。',
      code: {
        python: `def countBits(n):
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)        # 去掉最後一位的答案 + 最後一位
    return ans`,
        c: `int *countBits(int n, int *returnSize) {
    int *ans = malloc((n + 1) * sizeof(int));
    ans[0] = 0;
    for (int i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
    *returnSize = n + 1;
    return ans;
}`,
        cpp: `vector<int> countBits(int n) {
    vector<int> ans(n + 1, 0);
    for (int i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
    return ans;
}`,
        java: `int[] countBits(int n) {
    int[] ans = new int[n + 1];
    for (int i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
    return ans;
}`,
        javascript: `function countBits(n) {
  const ans = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
  return ans;
}`,
      },
    },
  ],
  pitfalls: [
    '`ans[i >> 1] + i & 1`:`+` 的優先順序比 `&` 高,要加括號',
    '陣列長度開成 n:題目要 0..n 共 n + 1 個',
  ],
  followUp: [{ q: '還有哪些 `i & (i − 1)` 的用法?', a: '判斷 2 的冪次(`n > 0 and n & (n − 1) == 0`)、[191](#/q/191) 數 1 的個數、樹狀陣列(BIT)用的 lowbit `i & −i`。' }],
  check: {
    kind: 'fn',
    fn: 'countBits',
    cases: [
      { args: [2], out: [0, 1, 1] },
      { args: [5], out: [0, 1, 1, 2, 1, 2] },
      { args: [0], out: [0] },
      { args: [N], out: [0, 1, 1, 2, 1, 2, 2, 3, 1] },
      { args: [16], out: [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1] },
    ],
  },
}

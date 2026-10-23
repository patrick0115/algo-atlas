import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1888. Minimum Number of Flips to Make the Binary String Alternating

const S = '111000'

function winFig(): FigStep[] {
  const n = S.length
  const d = S + S
  const t0 = Array.from({ length: 2 * n }, (_, i) => String(i % 2))
  const out: FigStep[] = [{ note: '操作一(把開頭移到結尾)可以做任意次 → 等於從 s + s 裡挑一段長度 n 的視窗。目標是交錯字串 "0101…" 或 "1010…"', views: [arr(d.split(''), { label: 's + s' }), arr(t0, { label: '"0101…"' })] }]
  let best = Infinity
  for (let i = 0; i + n <= 2 * n; i++) {
    let diff = 0
    for (let j = i; j < i + n; j++) if (d[j] !== String(j % 2)) diff++
    const flips = Math.min(diff, n - diff)
    best = Math.min(best, flips)
    if (i <= 2) out.push({ note: `視窗 [${i}, ${i + n - 1}]:和 "0101…" 不同 ${diff} 個、和 "1010…" 不同 ${n - diff} 個 → 最少翻 ${flips} 次,目前最好 ${best}`, views: [arr(d.split(''), { label: 's + s', range: [i, i + n - 1], highlight: Array.from({ length: n }, (_, k) => i + k).filter((j) => d[j] !== String(j % 2)) })] })
  }
  out.push({ note: `滑完所有視窗,答案 ${best}。實作時維護「視窗內和 0101 不同的數量」,每滑一格 O(1) 更新`, views: [arr([best], { label: '答案', done: [0] })] })
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:把 n 種旋轉都真的做出來,每一種都和兩種交錯字串比對', views: [arr(['111000', '110001', '100011', '000111', '001110', '011100'], { label: '所有旋轉' })] },
    { note: '"100011" 和 "101010" 只差 2 個位置… 每種旋轉 O(n),總共 O(n²)', views: [arr(['100011'], { label: '旋轉 2 次', highlight: [0] })] },
  ]
}

export const q1888: Solution = {
  id: 1888,
  plain: '一串 0 和 1,可以做兩種操作:①把最前面的字搬到最後面(不算次數)②把某個字 0、1 互換(算一次)。最少要換幾次,才能讓整串變成 0、1 交錯(像 0101 或 1010)?',
  statement: '給二進位字串 `s`。操作一:刪除第一個字元並接到結尾(不限次數、不計成本);操作二:翻轉任一字元。回傳讓 s 變成**交錯**字串所需的最少操作二次數。',
  examples: [
    { input: 's = "111000"', output: '2', note: '旋轉兩次成 "100011",再翻兩個 → "101010"' },
    { input: 's = "010"', output: '0' },
    { input: 's = "1110"', output: '1' },
  ],
  constraints: ['n ≤ 10⁵'],
  insight: ['旋轉所有可能 = s + s 裡所有長度 n 的視窗', '每個視窗要和 "0101…"、"1010…" 比;和其中一個不同 d 個,和另一個就不同 n − d 個', '視窗往右滑,只有進出的兩個字元改變 d → O(1) 更新'],
  approaches: [
    {
      name: 's + s 上的滑動視窗',
      idea: '在 `t = s + s` 上維護 `diff` = 視窗內 `t[j] != j % 2` 的數量;每個視窗答案 `min(diff, n − diff)`。',
      steps: ['`t = s + s`', '`for j in 0..2n−1`:`t[j] != str(j % 2)` → `diff += 1`', '`j >= n`:離開的 `t[j − n]` 若不符就 `diff -= 1`', '`j >= n − 1`:`best = min(best, diff, n − diff)`'],
      figure: { title: `s = "${S}"`, steps: winFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: 's + s 長度 2n,每格 O(1)。(可以用 `s[j % n]` 省掉複製)' },
      verdict: '最推薦。「可以旋轉」→ 想到 s + s;「固定長度、只關心不符的個數」→ 滑動視窗。',
      code: {
        python: `def minFlips(s):
    n = len(s)
    t = s + s                                 # 所有旋轉都是 t 裡長度 n 的一段
    diff, best = 0, n
    for j in range(2 * n):
        if t[j] != '01'[j % 2]:
            diff += 1                         # 和 "0101…" 不同
        if j >= n and t[j - n] != '01'[(j - n) % 2]:
            diff -= 1                         # 離開視窗的那格
        if j >= n - 1:
            best = min(best, diff, n - diff)  # n − diff:和 "1010…" 不同的數量
    return best`,
        c: `int minFlips(char *s) {
    int n = strlen(s), diff = 0, best = n;
    for (int j = 0; j < 2 * n; j++) {
        if (s[j % n] - '0' != j % 2) diff++;
        if (j >= n && s[(j - n) % n] - '0' != (j - n) % 2) diff--;
        if (j >= n - 1) {
            if (diff < best) best = diff;
            if (n - diff < best) best = n - diff;
        }
    }
    return best;
}`,
        cpp: `int minFlips(string s) {
    int n = s.size(), diff = 0, best = n;
    for (int j = 0; j < 2 * n; j++) {
        if (s[j % n] - '0' != j % 2) diff++;
        if (j >= n && s[(j - n) % n] - '0' != (j - n) % 2) diff--;
        if (j >= n - 1) best = min({best, diff, n - diff});
    }
    return best;
}`,
        java: `int minFlips(String s) {
    int n = s.length(), diff = 0, best = n;
    for (int j = 0; j < 2 * n; j++) {
        if (s.charAt(j % n) - '0' != j % 2) diff++;
        if (j >= n && s.charAt((j - n) % n) - '0' != (j - n) % 2) diff--;
        if (j >= n - 1) best = Math.min(best, Math.min(diff, n - diff));
    }
    return best;
}`,
        javascript: `function minFlips(s) {
  const n = s.length;
  let diff = 0, best = n;
  for (let j = 0; j < 2 * n; j++) {
    if (Number(s[j % n]) !== j % 2) diff++;
    if (j >= n && Number(s[(j - n) % n]) !== (j - n) % 2) diff--;
    if (j >= n - 1) best = Math.min(best, diff, n - diff);
  }
  return best;
}`,
      },
    },
    {
      name: '暴力枚舉每種旋轉',
      idea: '對每個旋轉量 r,直接比較 `s[r:] + s[:r]` 和兩種交錯字串。',
      steps: ['`for r in 0..n−1`:`u = s[r:] + s[:r]`', '`d = u 和 "0101…" 不同的位置數`', '`best = min(best, d, n − d)`'],
      figure: { title: `s = "${S}"`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: 'n 種旋轉,每種比較 O(n)。' },
      verdict: '直接照題意試,用來驗證視窗版。n = 10⁵ 時太慢。',
      code: {
        python: `def minFlips(s):
    n, best = len(s), len(s)
    for r in range(n):
        u = s[r:] + s[:r]
        d = sum(1 for i, c in enumerate(u) if c != '01'[i % 2])
        best = min(best, d, n - d)
    return best`,
        c: `int minFlips(char *s) {
    int n = strlen(s), best = n;
    for (int r = 0; r < n; r++) {
        int d = 0;
        for (int i = 0; i < n; i++) if (s[(r + i) % n] - '0' != i % 2) d++;
        if (d < best) best = d;
        if (n - d < best) best = n - d;
    }
    return best;
}`,
        cpp: `int minFlips(string s) {
    int n = s.size(), best = n;
    for (int r = 0; r < n; r++) {
        int d = 0;
        for (int i = 0; i < n; i++) if (s[(r + i) % n] - '0' != i % 2) d++;
        best = min({best, d, n - d});
    }
    return best;
}`,
        java: `int minFlips(String s) {
    int n = s.length(), best = n;
    for (int r = 0; r < n; r++) {
        int d = 0;
        for (int i = 0; i < n; i++) if (s.charAt((r + i) % n) - '0' != i % 2) d++;
        best = Math.min(best, Math.min(d, n - d));
    }
    return best;
}`,
        javascript: `function minFlips(s) {
  const n = s.length;
  let best = n;
  for (let r = 0; r < n; r++) {
    let d = 0;
    for (let i = 0; i < n; i++) if (Number(s[(r + i) % n]) !== i % 2) d++;
    best = Math.min(best, d, n - d);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: ['只和 "0101…" 比:"1010…" 的不同數就是 n − diff,兩個都要考慮', 'n 是奇數時旋轉會讓兩種目標對調,用 s + s 的視窗直接處理就不用特別想'],
  check: {
    kind: 'fn',
    fn: 'minFlips',
    cases: [
      { args: [S], out: 2 },
      { args: ['010'], out: 0 },
      { args: ['1110'], out: 1 },
      { args: ['01001001101'], out: 2 },
      { args: ['1'], out: 0 },
    ],
  },
}

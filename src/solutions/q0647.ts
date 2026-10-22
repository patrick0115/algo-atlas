import { arr, range } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 647. Palindromic Substrings

const S = 'aaba'

function centerFig(): FigStep[] {
  const s = S.split('')
  const n = s.length
  let total = 0
  const out: FigStep[] = [{ note: '每個回文都有一個「中心」:長度奇數時是一個字,偶數時是兩個字中間。中心一共 2n − 1 個。從每個中心往兩邊擴張,兩邊相同就多一個回文', views: [arr(s, { label: 's' })] }]
  for (let c = 0; c < 2 * n - 1; c++) {
    let l = Math.floor(c / 2)
    let r = l + (c % 2)
    const found: string[] = []
    let lastL = l
    let lastR = r
    while (l >= 0 && r < n && s[l] === s[r]) {
      found.push(S.slice(l, r + 1))
      lastL = l
      lastR = r
      l--
      r++
    }
    total += found.length
    const center = c % 2 === 0 ? `第 ${c / 2} 個字 "${s[c / 2]}"` : `第 ${(c - 1) / 2}、${(c + 1) / 2} 個字中間`
    out.push({
      note: `中心在${center}:${found.length ? `找到 ${found.map((x) => `"${x}"`).join('、')}` : '兩邊不一樣,一個都沒有'}。累計 ${total}`,
      views: [arr(s, { label: 's', highlight: found.length ? range(lastL, lastR) : [], compare: found.length ? [] : [Math.floor(c / 2), Math.floor(c / 2) + (c % 2)] })],
    })
  }
  out.push({ note: `總共 ${total} 個回文子字串`, views: [arr(s, { label: 's', done: range(0, n - 1) })] })
  return out
}

function table(dp: string[][], hl: Cell[] = [], cmp: Cell[] = []): GridViewData {
  return {
    kind: 'grid',
    label: 'dp[i][j]:s[i..j] 是不是回文(只看 i ≤ j 的右上半)',
    cells: dp.map((r) => [...r]),
    rowLabels: S.split('').map((c, i) => `${i} ${c}`),
    colLabels: S.split('').map((c, j) => `${j} ${c}`),
    marks: { hl, cmp, done: dp.flatMap((r, i) => r.flatMap((v, j) => (v === '✓' ? [[i, j] as Cell] : []))) },
  }
}

function dpFig(): FigStep[] {
  const n = S.length
  const dp: string[][] = Array.from({ length: n }, () => Array(n).fill(''))
  const out: FigStep[] = [{ note: 's[i..j] 是回文 ⇔ 兩端相同,而且裡面 s[i+1..j−1] 也是回文。所以要先算短的,再算長的(按長度由短到長填)', views: [table(dp)] }]
  for (let len = 1; len <= n; len++) {
    const hl: Cell[] = []
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      dp[i][j] = S[i] === S[j] && (len <= 2 || dp[i + 1][j - 1] === '✓') ? '✓' : '·'
      hl.push([i, j])
    }
    out.push({ note: `長度 ${len}:${len === 1 ? '單一個字一定是回文' : len === 2 ? '兩個字相同就是回文' : '兩端相同,而且左下角那格(去掉兩端)也是 ✓'}`, views: [table(dp, hl)] })
  }
  const cnt = dp.flat().filter((v) => v === '✓').length
  out.push({ note: `表中 ✓ 的數量 = ${cnt}`, views: [table(dp)] })
  return out
}

export const q0647: Solution = {
  id: 647,
  plain: '數一數一個字串裡有幾個「回文」的連續片段(正著讀和反著讀一樣)。位置不同就算不同個,例如 "aaa" 有 a、a、a、aa、aa、aaa 共 6 個。',
  statement: '給字串 `s`,回傳其中**回文子字串**的數量。起點或終點不同的子字串視為不同,即使內容一樣。',
  examples: [
    { input: 's = "abc"', output: '3', note: '"a"、"b"、"c"' },
    { input: 's = "aaa"', output: '6' },
  ],
  constraints: ['`n ≤ 1000` → O(n²) 是 100 萬'],
  insight: [
    '暴力:列出 n² 個子字串,每個再花 O(n) 檢查 → O(n³),太慢',
    '回文是**對稱**的:從中心往外擴,兩邊一樣就繼續,不一樣就停。每次擴張成功就是一個新的回文',
    '中心有 2n − 1 個:n 個字(奇數長度)+ n − 1 個字縫(偶數長度)',
    '也可以 DP:`s[i..j]` 是回文 ⇔ `s[i] == s[j]` 且 `s[i+1..j−1]` 是回文',
  ],
  approaches: [
    {
      name: '中心擴展',
      idea: '對每個中心 `(l, r)`(`l == r` 或 `r == l + 1`),當 `s[l] == s[r]` 就計數一次,再 `l−−`、`r++`。',
      steps: ['`for c in 0..2n−2`:`l = c // 2`、`r = l + c % 2`', '`while l >= 0 and r < n and s[l] == s[r]`:`count += 1`,往外擴', '回傳 count'],
      figure: { title: `s = "${S}"`, steps: centerFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '2n − 1 個中心,每個最多擴 n/2 次。' },
      verdict: '最推薦:好寫、不用額外空間,回文題的基本功。',
      code: {
        python: `def countSubstrings(s):
    n, count = len(s), 0
    for c in range(2 * n - 1):
        l = c // 2
        r = l + c % 2                 # c 是偶數:中心是一個字;奇數:兩個字中間
        while l >= 0 and r < n and s[l] == s[r]:
            count += 1                # s[l..r] 是回文
            l -= 1
            r += 1
    return count`,
        c: `int countSubstrings(char *s) {
    int n = strlen(s), count = 0;
    for (int c = 0; c < 2 * n - 1; c++) {
        int l = c / 2, r = l + c % 2;
        while (l >= 0 && r < n && s[l] == s[r]) { count++; l--; r++; }
    }
    return count;
}`,
        cpp: `int countSubstrings(string s) {
    int n = s.size(), count = 0;
    for (int c = 0; c < 2 * n - 1; c++) {
        int l = c / 2, r = l + c % 2;
        while (l >= 0 && r < n && s[l] == s[r]) { count++; l--; r++; }
    }
    return count;
}`,
        java: `int countSubstrings(String s) {
    int n = s.length(), count = 0;
    for (int c = 0; c < 2 * n - 1; c++) {
        int l = c / 2, r = l + c % 2;
        while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) { count++; l--; r++; }
    }
    return count;
}`,
        javascript: `function countSubstrings(s) {
  const n = s.length;
  let count = 0;
  for (let c = 0; c < 2 * n - 1; c++) {
    let l = c >> 1, r = l + (c % 2);
    while (l >= 0 && r < n && s[l] === s[r]) { count++; l--; r++; }
  }
  return count;
}`,
      },
    },
    {
      name: '區間 DP 表',
      idea: '`dp[i][j] = s[i] == s[j] and (j − i < 2 or dp[i+1][j−1])`。i 由大到小(或按長度)填,確保 `dp[i+1][j−1]` 先算好。',
      steps: ['`for i in n−1..0`、`for j in i..n−1`', '`dp[i][j] = s[i] == s[j] and (j − i < 2 or dp[i+1][j−1])`', '每個 True 計數一次'],
      figure: { title: `s = "${S}"`, steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '表格 n² 格,每格 O(1)。' },
      verdict: '[[p:interval-dp]]的入門題。比中心擴展多用空間,但這張表在其他題很有用(例如 131 分割回文、132 最少切幾刀)。',
      code: {
        python: `def countSubstrings(s):
    n, count = len(s), 0
    dp = [[False] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):        # i 由大到小:dp[i+1][...] 已經算好
        for j in range(i, n):
            if s[i] == s[j] and (j - i < 2 or dp[i + 1][j - 1]):
                dp[i][j] = True
                count += 1
    return count`,
        c: `int countSubstrings(char *s) {
    int n = strlen(s), count = 0;
    static bool dp[1000][1000];
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++) {
            dp[i][j] = s[i] == s[j] && (j - i < 2 || dp[i + 1][j - 1]);
            if (dp[i][j]) count++;
        }
    return count;
}`,
        cpp: `int countSubstrings(string s) {
    int n = s.size(), count = 0;
    vector<vector<bool>> dp(n, vector<bool>(n, false));
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++) {
            dp[i][j] = s[i] == s[j] && (j - i < 2 || dp[i + 1][j - 1]);
            if (dp[i][j]) count++;
        }
    return count;
}`,
        java: `int countSubstrings(String s) {
    int n = s.length(), count = 0;
    boolean[][] dp = new boolean[n][n];
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++) {
            dp[i][j] = s.charAt(i) == s.charAt(j) && (j - i < 2 || dp[i + 1][j - 1]);
            if (dp[i][j]) count++;
        }
    return count;
}`,
        javascript: `function countSubstrings(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(false));
  let count = 0;
  for (let i = n - 1; i >= 0; i--)
    for (let j = i; j < n; j++) {
      dp[i][j] = s[i] === s[j] && (j - i < 2 || dp[i + 1][j - 1]);
      if (dp[i][j]) count++;
    }
  return count;
}`,
      },
    },
  ],
  pitfalls: [
    '只從單一字元的中心擴展:會漏掉所有偶數長度的回文(例如 "aa")',
    'DP 時 i 由小到大填:`dp[i+1][j−1]` 還沒算,結果錯',
    '把內容相同的子字串只算一次:題目說位置不同就算不同',
  ],
  followUp: [
    { q: '要找最長的那個回文?', a: '[5. Longest Palindromic Substring](#/q/5):同樣中心擴展,記錄最長的一次。' },
    { q: '能做到 O(n)?', a: 'Manacher 演算法:利用已知的回文半徑,避免重複擴展。面試很少要求。' },
  ],
  check: {
    kind: 'fn',
    fn: 'countSubstrings',
    cases: [
      { args: ['abc'], out: 3 },
      { args: ['aaa'], out: 6 },
      { args: [S], out: 6 },
      { args: ['a'], out: 1 },
      { args: ['abba'], out: 6 },
      { args: ['racecar'], out: 10 },
    ],
  },
}

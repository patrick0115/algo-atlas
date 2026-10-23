import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 392. Is Subsequence

const S = 'abc'
const T = 'ahbgdc'

function ptrFig(): FigStep[] {
  const out: FigStep[] = [{ note: 's 是不是 t 的子序列 = 能不能在 t 裡**依序**找到 s 的每個字(中間可以跳過)。i 指 s 下一個要找的字,j 掃 t', views: [arr(S.split(''), { label: 's', pointers: [{ name: 'i', index: 0 }] }), arr(T.split(''), { label: 't', pointers: [{ name: 'j', index: 0, color: 'b' }] })] }]
  let i = 0
  for (let j = 0; j < T.length && i < S.length; j++) {
    const hit = T[j] === S[i]
    out.push({ note: hit ? `t[${j}] = "${T[j]}" 正是要找的 s[${i}] → 找到,i 前進` : `t[${j}] = "${T[j]}" 不是 "${S[i]}" → 跳過`, views: [arr(S.split(''), { label: 's', done: Array.from({ length: i + (hit ? 1 : 0) }, (_, k) => k), pointers: [{ name: 'i', index: Math.min(i, S.length - 1) }] }), arr(T.split(''), { label: 't', highlight: hit ? [j] : [], dim: hit ? [] : [j], pointers: [{ name: 'j', index: j, color: 'b' }] })] })
    if (hit) i++
  }
  out.push({ note: `i 走到 s 的結尾(${i} = len(s))→ 全部都找到了 → true`, views: [arr(S.split(''), { label: 's', done: [0, 1, 2] })] })
  return out
}

function nextFig(): FigStep[] {
  const n = T.length
  const letters = [...new Set(S + T)].sort()
  const nxt: (number | string)[][] = letters.map(() => Array(n + 1).fill('−'))
  for (let j = n - 1; j >= 0; j--) letters.forEach((c, r) => (nxt[r][j] = T[j] === c ? j : nxt[r][j + 1]))
  const view = (hl: [number, number][] = []): GridViewData => ({ kind: 'grid', label: 'next[c][j] = 從 t[j] 開始往右,字母 c 第一次出現的位置(− = 沒有)', cells: nxt.map((r) => [...r]), rowLabels: letters, colLabels: [...T.split('').map((c, j) => `${j}:${c}`), 'end'], marks: { hl } })
  return [
    { note: 'Follow-up:如果有很多個 s 要問同一個 t,先替 t 建一張「下一個某字母在哪」的表,從右往左填:next[c][j] = t[j] == c ? j : next[c][j+1]', views: [view()] },
    { note: '查 "abc":從 j = 0 查 a → 0,跳到 1;查 b → 2,跳到 3;查 c → 5。每個字母一步跳到位,不用一格一格掃', views: [view([[letters.indexOf('a'), 0], [letters.indexOf('b'), 1], [letters.indexOf('c'), 3]])] },
  ]
}

export const q0392: Solution = {
  id: 392,
  plain: '從一串字裡「挑掉一些字」(剩下的順序不變),能不能剛好變成另一串字?例如 "ahbgdc" 挑掉 h、g、d 就變成 "abc"。',
  statement: '給字串 `s`、`t`,判斷 s 是否為 t 的**子序列**(刪除 t 的某些字元、不改變其餘順序後可得到 s)。Follow-up:有大量的 s(10⁹ 個)要對同一個 t 檢查時怎麼做?',
  examples: [
    { input: 's = "abc", t = "ahbgdc"', output: 'true' },
    { input: 's = "axc", t = "ahbgdc"', output: 'false' },
  ],
  constraints: ['s 長度 ≤ 100,t 長度 ≤ 10⁴', '只有小寫字母'],
  insight: ['貪心:s 的每個字,在 t 裡找**最早**能配的位置就好,越早配後面的選擇越多', '兩個指標:配到就 i 前進,j 每次都前進', 'Follow-up:很多個 s 時,替 t 預先建「每個位置往右下一個 c 在哪」的表'],
  approaches: [
    {
      name: '雙指標貪心',
      idea: '`i` 指 s、`j` 掃 t;`s[i] == t[j]` 時 `i += 1`。最後 `i == len(s)` 就是子序列。',
      steps: ['`i = 0`', '`for c in t`:`i < len(s) and s[i] == c` → `i += 1`', '回傳 `i == len(s)`'],
      figure: { title: `s = "${S}",t = "${T}"`, steps: ptrFig() },
      complexity: { time: 'O(|t|)', space: 'O(1)', why: 't 掃一次。' },
      verdict: '最推薦,單次查詢的最佳解。[[p:two-pointers]]的「兩個序列各一個指標」。',
      code: {
        python: `def isSubsequence(s, t):
    i = 0
    for c in t:
        if i < len(s) and s[i] == c:
            i += 1                            # 配到了,找 s 的下一個字
    return i == len(s)`,
        c: `bool isSubsequence(char *s, char *t) {
    for (; *t && *s; t++)
        if (*s == *t) s++;
    return *s == '\\0';
}`,
        cpp: `bool isSubsequence(string s, string t) {
    size_t i = 0;
    for (char c : t) if (i < s.size() && s[i] == c) i++;
    return i == s.size();
}`,
        java: `boolean isSubsequence(String s, String t) {
    int i = 0;
    for (int j = 0; j < t.length() && i < s.length(); j++)
        if (s.charAt(i) == t.charAt(j)) i++;
    return i == s.length();
}`,
        javascript: `function isSubsequence(s, t) {
  let i = 0;
  for (const c of t) if (i < s.length && s[i] === c) i++;
  return i === s.length;
}`,
      },
    },
    {
      name: '預建「下一個字母」表(Follow-up)',
      idea: '`nxt[j][c]` = t 從位置 j 起 c 第一次出現的索引(沒有就是 n)。查詢時從 j = 0 開始,每個字一步跳到 `nxt[j][c] + 1`。',
      steps: ['`nxt[n][*] = n`', '`for j in n−1..0`:`nxt[j] = nxt[j+1]` 的複製,再設 `nxt[j][t[j]] = j`', '查詢:`j = 0`;每個 c:`p = nxt[j][c]`,`p == n` → false;否則 `j = p + 1`'],
      figure: { title: `t = "${T}"`, steps: nextFig() },
      complexity: { time: '建表 O(26·|t|),每次查詢 O(|s|)', space: 'O(26·|t|)', why: '表有 (n+1)·26 格;查詢每個字只查一次表。' },
      verdict: '單次查詢比雙指標慢,但要對同一個 t 問很多次時,每次查詢只跟 |s| 有關。也可以改成「每個字母的位置清單 + 二分搜尋」省空間。',
      code: {
        python: `def isSubsequence(s, t):
    n = len(t)
    nxt = [[n] * 26 for _ in range(n + 1)]   # nxt[j][c]:從 j 起 c 第一次出現在哪
    for j in range(n - 1, -1, -1):
        nxt[j] = nxt[j + 1][:]
        nxt[j][ord(t[j]) - 97] = j
    j = 0
    for c in s:
        p = nxt[j][ord(c) - 97]
        if p == n:
            return False
        j = p + 1                             # 跳到配對位置的下一格
    return True`,
        c: `bool isSubsequence(char *s, char *t) {
    int n = strlen(t);
    int (*nxt)[26] = malloc((n + 1) * sizeof *nxt);
    for (int c = 0; c < 26; c++) nxt[n][c] = n;
    for (int j = n - 1; j >= 0; j--) {
        memcpy(nxt[j], nxt[j + 1], sizeof nxt[j]);
        nxt[j][t[j] - 'a'] = j;
    }
    bool ok = true;
    for (int j = 0; *s; s++) {
        int p = nxt[j][*s - 'a'];
        if (p == n) { ok = false; break; }
        j = p + 1;
    }
    free(nxt);
    return ok;
}`,
        cpp: `bool isSubsequence(string s, string t) {
    int n = t.size();
    vector<array<int, 26>> nxt(n + 1);
    nxt[n].fill(n);
    for (int j = n - 1; j >= 0; j--) {
        nxt[j] = nxt[j + 1];
        nxt[j][t[j] - 'a'] = j;
    }
    int j = 0;
    for (char c : s) {
        int p = nxt[j][c - 'a'];
        if (p == n) return false;
        j = p + 1;
    }
    return true;
}`,
        java: `boolean isSubsequence(String s, String t) {
    int n = t.length();
    int[][] nxt = new int[n + 1][26];
    Arrays.fill(nxt[n], n);
    for (int j = n - 1; j >= 0; j--) {
        nxt[j] = nxt[j + 1].clone();
        nxt[j][t.charAt(j) - 'a'] = j;
    }
    int j = 0;
    for (char c : s.toCharArray()) {
        int p = nxt[j][c - 'a'];
        if (p == n) return false;
        j = p + 1;
    }
    return true;
}`,
        javascript: `function isSubsequence(s, t) {
  const n = t.length;
  const nxt = Array.from({ length: n + 1 }, () => new Array(26).fill(n));
  for (let j = n - 1; j >= 0; j--) {
    nxt[j] = [...nxt[j + 1]];
    nxt[j][t.charCodeAt(j) - 97] = j;
  }
  let j = 0;
  for (const c of s) {
    const p = nxt[j][c.charCodeAt(0) - 97];
    if (p === n) return false;
    j = p + 1;
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: ['s 是空字串時永遠是 true', '配到之後 j 也要前進:同一個 t 字不能配給 s 的兩個字'],
  check: {
    kind: 'fn',
    fn: 'isSubsequence',
    cases: [
      { args: [S, T], out: true },
      { args: ['axc', T], out: false },
      { args: ['', 'abc'], out: true },
      { args: ['aa', 'a'], out: false },
      { args: ['b', ''], out: false },
      { args: ['ace', 'abcde'], out: true },
    ],
  },
}

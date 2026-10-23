import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 28. Find the Index of the First Occurrence in a String
const H = 'aabaabaaf', P = 'aabaaf'
const scanFig: FigStep[] = [
  { note: '從文字的每個可能起點開始,逐字和 needle 比較。第一次全部相同的位置就是答案。', views: [arr([...H], { label: 'haystack' }), arr([...P], { label: 'needle' })] },
  { note: '起點 0 比到第 6 個字元時失敗;再試後續起點,起點 3 可以完整匹配。', views: [arr([...H], { label: 'haystack', done: [3, 4, 5, 6, 7, 8] }), arr([3], { label: '答案', done: [0] })] },
]
const kmpFig: FigStep[] = [
  { note: 'KMP 先算每個前綴的「最長相同前後綴」長度。needle = aabaaf 的 lps 為 [0,1,0,1,2,0]。', views: [arr([...P], { label: 'needle' }), arr([0, 1, 0, 1, 2, 0], { label: 'lps' })] },
  { note: '匹配失敗時不用讓文字指標退回;只依 lps 把模式字串移到可重用的前綴。最後在位置 3 找到。', views: [arr([...H], { label: 'haystack', done: [3, 4, 5, 6, 7, 8] }), arr([3], { label: '答案', done: [0] })] },
]

export const q0028: Solution = {
  id: 28,
  plain: '在一大段文字中找一小段文字第一次出現的位置。例如在 aabaabaaf 中找 aabaaf,答案是從索引 3 開始。',
  statement: '給字串 haystack 與 needle,回傳 needle 第一次在 haystack 中出現的起始索引;找不到回傳 -1。',
  examples: [{ input: 'haystack = "sadbutsad", needle = "sad"', output: '0' }, { input: 'haystack = "leetcode", needle = "leeto"', output: '-1' }],
  constraints: ['兩個字串長度最多 10⁴', 'needle 不會是空字串'],
  insight: ['最直接是每個可能起點都試一次,最壞需要 O(nm)。', '若字串重複很多,可用 KMP 的 lps 記住模式前後綴,失敗時重用已匹配部分。', 'lps[j] = needle[0..j] 的最長真前綴、也是真後綴的長度。'],
  approaches: [
    {
      name: '逐起點比較',
      idea: '每個可能的起始位置都逐字比對,第一次完整匹配就回傳。',
      steps: ['從 i = 0 到 haystack.length−needle.length', '從 j = 0 開始比較 haystack[i+j] 與 needle[j]', '若 j 走到 needle 長度,回傳 i', '所有起點都失敗則回傳 -1'],
      figure: { title: '逐一嘗試起點', steps: scanFig },
      complexity: { time: 'O(nm)', space: 'O(1)', why: 'n 個起點,每個最多比較 m 個字元。' },
      verdict: '很容易寫,字串長度不大時足夠。',
      code: {
        python: `def strStr(haystack, needle):
    for i in range(len(haystack) - len(needle) + 1):
        j = 0
        while j < len(needle) and haystack[i + j] == needle[j]:
            j += 1
        if j == len(needle):
            return i
    return -1`,
        c: `int strStr(char *haystack, char *needle) {
    int n = strlen(haystack), m = strlen(needle);
    for (int i = 0; i + m <= n; i++) {
        int j = 0;
        while (j < m && haystack[i + j] == needle[j]) j++;
        if (j == m) return i;
    }
    return -1;
}`,
        cpp: `int strStr(string haystack, string needle) {
    int n = haystack.size(), m = needle.size();
    for (int i = 0; i + m <= n; i++) {
        int j = 0;
        while (j < m && haystack[i + j] == needle[j]) j++;
        if (j == m) return i;
    }
    return -1;
}`,
        java: `int strStr(String haystack, String needle) {
    int n = haystack.length(), m = needle.length();
    for (int i = 0; i + m <= n; i++) {
        int j = 0;
        while (j < m && haystack.charAt(i + j) == needle.charAt(j)) j++;
        if (j == m) return i;
    }
    return -1;
}`,
        javascript: `function strStr(haystack, needle) {
  for (let i = 0; i + needle.length <= haystack.length; i++) {
    let j = 0;
    while (j < needle.length && haystack[i + j] === needle[j]) j++;
    if (j === needle.length) return i;
  }
  return -1;
}`,
      },
    },
    {
      name: 'KMP 前綴函數',
      idea: '先建立模式的 lps 表;掃文字失敗時將匹配長度退到 lps[j−1],文字位置不倒退。',
      steps: ['建立 needle 每個位置的 lps', 'i 掃 haystack,j 指向 needle 已匹配長度', '失敗且 j > 0:令 j = lps[j−1];成功時 i、j 都往前', 'j = needle 長度時回傳 i−j'],
      figure: { title: '重用已匹配的前後綴', steps: kmpFig },
      complexity: { time: 'O(n+m)', space: 'O(m)', why: 'lps 與搜尋指標的總前進、回退次數都線性。' },
      verdict: '對大量重複前綴的文字仍保持線性時間。',
      code: {
        python: `def strStr(haystack, needle):
    m = len(needle)
    lps = [0] * m
    j = 0
    for i in range(1, m):
        while j and needle[i] != needle[j]:
            j = lps[j - 1]
        if needle[i] == needle[j]:
            j += 1
        lps[i] = j
    j = 0
    for i, ch in enumerate(haystack):
        while j and ch != needle[j]:
            j = lps[j - 1]
        if ch == needle[j]:
            j += 1
        if j == m:
            return i - m + 1
    return -1`,
        c: `int strStr(char *haystack, char *needle) {
    int m = strlen(needle), *lps = calloc(m, sizeof(int));
    for (int i = 1, j = 0; i < m; i++) {
        while (j && needle[i] != needle[j]) j = lps[j - 1];
        if (needle[i] == needle[j]) j++;
        lps[i] = j;
    }
    for (int i = 0, j = 0; haystack[i]; i++) {
        while (j && haystack[i] != needle[j]) j = lps[j - 1];
        if (haystack[i] == needle[j]) j++;
        if (j == m) { free(lps); return i - m + 1; }
    }
    free(lps);
    return -1;
}`,
        cpp: `int strStr(string haystack, string needle) {
    int m = needle.size();
    vector<int> lps(m);
    for (int i = 1, j = 0; i < m; i++) {
        while (j && needle[i] != needle[j]) j = lps[j - 1];
        if (needle[i] == needle[j]) j++;
        lps[i] = j;
    }
    for (int i = 0, j = 0; i < (int)haystack.size(); i++) {
        while (j && haystack[i] != needle[j]) j = lps[j - 1];
        if (haystack[i] == needle[j]) j++;
        if (j == m) return i - m + 1;
    }
    return -1;
}`,
        java: `int strStr(String haystack, String needle) {
    int m = needle.length();
    int[] lps = new int[m];
    for (int i = 1, j = 0; i < m; i++) {
        while (j > 0 && needle.charAt(i) != needle.charAt(j)) j = lps[j - 1];
        if (needle.charAt(i) == needle.charAt(j)) j++;
        lps[i] = j;
    }
    for (int i = 0, j = 0; i < haystack.length(); i++) {
        while (j > 0 && haystack.charAt(i) != needle.charAt(j)) j = lps[j - 1];
        if (haystack.charAt(i) == needle.charAt(j)) j++;
        if (j == m) return i - m + 1;
    }
    return -1;
}`,
        javascript: `function strStr(haystack, needle) {
  const m = needle.length, lps = Array(m).fill(0);
  for (let i = 1, j = 0; i < m; i++) {
    while (j && needle[i] !== needle[j]) j = lps[j - 1];
    if (needle[i] === needle[j]) j++;
    lps[i] = j;
  }
  for (let i = 0, j = 0; i < haystack.length; i++) {
    while (j && haystack[i] !== needle[j]) j = lps[j - 1];
    if (haystack[i] === needle[j]) j++;
    if (j === m) return i - m + 1;
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: ['KMP 失敗時退的是 needle 的匹配長度,haystack 指標不倒退。', 'lps 記錄真前綴,不能把整個字串本身算進去。', '若 needle 比 haystack 長,答案一定是 -1。'],
  check: { kind: 'fn', fn: 'strStr', cases: [
    { args: ['sadbutsad', 'sad'], out: 0 },
    { args: ['leetcode', 'leeto'], out: -1 },
    { args: [H, P], out: 3 },
    { args: ['aaaaa', 'bba'], out: -1 },
    { args: ['abc', 'c'], out: 2 },
  ] },
}

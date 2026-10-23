import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1768. Merge Strings Alternately

const W1 = 'ab'
const W2 = 'pqrs'

function ptrFig(): FigStep[] {
  const out: FigStep[] = []
  let res = ''
  let i = 0
  let j = 0
  while (i < W1.length || j < W2.length) {
    const took: string[] = []
    if (i < W1.length) took.push(W1[i++])
    if (j < W2.length) took.push(W2[j++])
    res += took.join('')
    out.push({ note: `第 ${Math.max(i, j)} 輪:${took.length === 2 ? `word1 給 "${took[0]}"、word2 給 "${took[1]}"` : `word1 用完了,只剩 word2 給 "${took[0]}"`} → "${res}"`, views: [arr(W1.split(''), { label: 'word1', done: Array.from({ length: i }, (_, k) => k) }), arr(W2.split(''), { label: 'word2', done: Array.from({ length: j }, (_, k) => k) }), arr(res.split(''), { label: '結果', highlight: Array.from({ length: took.length }, (_, k) => res.length - took.length + k) })] })
  }
  return out
}

function zipFig(): FigStep[] {
  const m = Math.min(W1.length, W2.length)
  const head = Array.from({ length: m }, (_, k) => W1[k] + W2[k]).join('')
  return [
    { note: `先處理兩個字串都有字的前 ${m} 個位置,一對一對拼起來 → "${head}"`, views: [arr(W1.split(''), { label: 'word1', done: [0, 1] }), arr(W2.split(''), { label: 'word2', done: [0, 1] }), arr(head.split(''), { label: '交錯部分' })] },
    { note: `比較長的那個剩下 "${W2.slice(m)}",整段接到後面 → "${head + W2.slice(m)}"`, views: [arr((head + W2.slice(m)).split(''), { label: '結果', highlight: [4, 5] })] },
  ]
}

export const q1768: Solution = {
  id: 1768,
  plain: '兩個人輪流說一個字:甲說一個、乙說一個、甲再說一個……誰的字先說完,剩下的就由另一個人一口氣說完。把整段話拼起來。',
  statement: '給字串 `word1`、`word2`,從 word1 開始**交替**取字元合併;較長的字串多出來的部分接在結尾。回傳合併後的字串。',
  examples: [
    { input: 'word1 = "abc", word2 = "pqr"', output: '"apbqcr"' },
    { input: 'word1 = "ab", word2 = "pqrs"', output: '"apbqrs"' },
    { input: 'word1 = "abcd", word2 = "pq"', output: '"apbqcd"' },
  ],
  constraints: ['長度 ≤ 100'],
  insight: ['兩個指標各指一個字串,輪流取', '其中一個用完後,另一個剩下的直接接上', '也可以想成:前 min(m, n) 個成對交錯,剩下的尾巴照抄'],
  approaches: [
    {
      name: '雙指標輪流取',
      idea: '`i`、`j` 各自往前;每輪 word1 有字就取一個、word2 有字就取一個。',
      steps: ['`i = j = 0`、`res = []`', '`while i < m or j < n`:', '`i < m` → 取 `word1[i]`,`i += 1`;`j < n` → 取 `word2[j]`,`j += 1`', '回傳 `"".join(res)`'],
      figure: { title: `word1 = "${W1}",word2 = "${W2}"`, steps: ptrFig() },
      complexity: { time: 'O(m + n)', space: 'O(m + n)', why: '每個字元取一次;輸出本身要 m + n 的空間。' },
      verdict: '最推薦,[[p:two-pointers]]最簡單的形式:兩個指標各走各的字串。',
      code: {
        python: `def mergeAlternately(word1, word2):
    res, i, j = [], 0, 0
    while i < len(word1) or j < len(word2):
        if i < len(word1):
            res.append(word1[i]); i += 1
        if j < len(word2):
            res.append(word2[j]); j += 1
    return ''.join(res)                       # 用 list 收集再 join,避免字串一直重建`,
        c: `char *mergeAlternately(char *word1, char *word2) {
    int m = strlen(word1), n = strlen(word2), k = 0;
    char *res = malloc(m + n + 1);
    for (int i = 0, j = 0; i < m || j < n;) {
        if (i < m) res[k++] = word1[i++];
        if (j < n) res[k++] = word2[j++];
    }
    res[k] = '\\0';
    return res;
}`,
        cpp: `string mergeAlternately(string word1, string word2) {
    string res;
    for (size_t i = 0, j = 0; i < word1.size() || j < word2.size();) {
        if (i < word1.size()) res += word1[i++];
        if (j < word2.size()) res += word2[j++];
    }
    return res;
}`,
        java: `String mergeAlternately(String word1, String word2) {
    StringBuilder sb = new StringBuilder();
    for (int i = 0, j = 0; i < word1.length() || j < word2.length();) {
        if (i < word1.length()) sb.append(word1.charAt(i++));
        if (j < word2.length()) sb.append(word2.charAt(j++));
    }
    return sb.toString();
}`,
        javascript: `function mergeAlternately(word1, word2) {
  let res = '';
  for (let i = 0, j = 0; i < word1.length || j < word2.length; ) {
    if (i < word1.length) res += word1[i++];
    if (j < word2.length) res += word2[j++];
  }
  return res;
}`,
      },
    },
    {
      name: '先交錯共同長度,再接尾巴',
      idea: '前 `k = min(m, n)` 個位置成對拼接,再把 `word1[k:]` 和 `word2[k:]` 接上(其中一個是空的)。',
      steps: ['`k = min(m, n)`', '`for t in 0..k−1`:接上 `word1[t] + word2[t]`', '接上 `word1[k:] + word2[k:]`'],
      figure: { title: `word1 = "${W1}",word2 = "${W2}"`, steps: zipFig() },
      complexity: { time: 'O(m + n)', space: 'O(m + n)', why: '同上。' },
      verdict: '把「交錯」和「收尾」分成兩段,迴圈裡不用判斷有沒有越界。',
      code: {
        python: `def mergeAlternately(word1, word2):
    k = min(len(word1), len(word2))
    head = ''.join(a + b for a, b in zip(word1, word2))   # zip 自動停在較短的那個
    return head + word1[k:] + word2[k:]                   # 兩段尾巴最多只有一段非空`,
        c: `char *mergeAlternately(char *word1, char *word2) {
    int m = strlen(word1), n = strlen(word2), k = m < n ? m : n, p = 0;
    char *res = malloc(m + n + 1);
    for (int t = 0; t < k; t++) { res[p++] = word1[t]; res[p++] = word2[t]; }
    strcpy(res + p, word1 + k);
    strcat(res + p, word2 + k);
    return res;
}`,
        cpp: `string mergeAlternately(string word1, string word2) {
    size_t k = min(word1.size(), word2.size());
    string res;
    for (size_t t = 0; t < k; t++) { res += word1[t]; res += word2[t]; }
    return res + word1.substr(k) + word2.substr(k);
}`,
        java: `String mergeAlternately(String word1, String word2) {
    int k = Math.min(word1.length(), word2.length());
    StringBuilder sb = new StringBuilder();
    for (int t = 0; t < k; t++) sb.append(word1.charAt(t)).append(word2.charAt(t));
    return sb.append(word1.substring(k)).append(word2.substring(k)).toString();
}`,
        javascript: `function mergeAlternately(word1, word2) {
  const k = Math.min(word1.length, word2.length);
  let res = '';
  for (let t = 0; t < k; t++) res += word1[t] + word2[t];
  return res + word1.slice(k) + word2.slice(k);
}`,
      },
    },
  ],
  pitfalls: ['while 條件用 and:較短的用完就停,長的那段尾巴會漏掉', 'C 記得多配一格放結尾的 \\0'],
  check: {
    kind: 'fn',
    fn: 'mergeAlternately',
    cases: [
      { args: ['abc', 'pqr'], out: 'apbqcr' },
      { args: [W1, W2], out: 'apbqrs' },
      { args: ['abcd', 'pq'], out: 'apbqcd' },
      { args: ['a', 'z'], out: 'az' },
    ],
  },
}

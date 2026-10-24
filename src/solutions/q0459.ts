import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 459. Repeated Substring Pattern
const S = 'ababab'
const figure = [
  { note: '字串長 6；候選片段長度必須能整除 6。先試長度 1。', views: [arr(S.split(''), { label: 's', highlight: [0] })] },
  { note: '片段 a 重複會得到 aaaaaa，和原字串不同。', views: [arr('aaaaaa'.split(''), { label: '長度 1 的重複', dim: [1, 3, 5] })] },
  { note: '改試長度 2：第一段是 ab。', views: [arr(S.split(''), { label: 's', highlight: [0, 1] })] },
  { note: 'ab 重複三次正好是 ababab，所以答案為 true。', views: [arr(S.split(''), { label: 'ab | ab | ab', done: [0, 1, 2, 3, 4, 5] })] },
]
const kmpFigure = [
  { note: '算每個前綴的最長相同前後綴長度；a 沒有非空的相同前後綴。', views: [arr([0], { label: 'pi' })] },
  { note: '讀到 aba 時，頭尾的 a 相同，pi[2] = 1。', views: [arr([0, 0, 1], { label: 'pi', highlight: [2] })] },
  { note: '讀到 abab 時，頭尾的 ab 相同，pi[3] = 2。', views: [arr([0, 0, 1, 2], { label: 'pi', highlight: [3] })] },
  { note: '最後 pi[5] = 4，最短週期是 6−4=2；6 可被 2 整除。', views: [arr([0, 0, 1, 2, 3, 4], { label: 'pi', done: [5] })] },
]

export const q0459: Solution = {
  id: 459,
  plain: '判斷一個字串能不能由某個更短的小片段重複拼起來。',
  statement: '給非空字串 `s`，若可選一個長度小於 `s` 的子字串，重複至少兩次恰好得到 `s`，回傳 true。',
  examples: [{ input: 's = "abab"', output: 'true' }, { input: 's = "aba"', output: 'false' }, { input: 's = "abcabcabcabc"', output: 'true' }],
  constraints: ['1 ≤ 字串長度 ≤ 10⁴。'],
  insight: ['片段長度一定是總長的因數。', '[[p:kmp]] 的前綴函數能算出最短可能週期。'],
  approaches: [
    {
      name: '列舉片段長度',
      idea: '只試能整除字串長度的片段，檢查重複後是否相同。',
      steps: ['從長度 1 試到 n/2。', '跳過不能整除 n 的長度。', '比較 `s` 與片段重複 n/長度 次的結果。'],
      figure: { title: 's = "ababab"', steps: figure },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '最多試 n/2 種長度，每次比較 n 個字元。' },
      verdict: '容易理解，字串不長時足夠。',
      code: {
        python: `def repeatedSubstringPattern(s):
    n = len(s)
    for size in range(1, n // 2 + 1):
        if n % size != 0:
            continue                    # 片段必須剛好填滿字串
        if s[:size] * (n // size) == s:
            return True
    return False`,
        c: `bool repeatedSubstringPattern(char *s) {
    int n = strlen(s);
    for (int size = 1; size <= n / 2; size++) {
        if (n % size != 0) continue;
        bool same = true;
        for (int i = size; i < n; i++) {
            if (s[i] != s[i % size]) {
                same = false;
                break;
            }
        }
        if (same) return true;
    }
    return false;
}`,
        cpp: `bool repeatedSubstringPattern(string s) {
    int n = s.size();
    for (int size = 1; size <= n / 2; size++) {
        if (n % size != 0) continue;
        bool same = true;
        for (int i = size; i < n; i++) {
            if (s[i] != s[i % size]) {
                same = false;
                break;
            }
        }
        if (same) return true;
    }
    return false;
}`,
        java: `boolean repeatedSubstringPattern(String s) {
    int n = s.length();
    for (int size = 1; size <= n / 2; size++) {
        if (n % size != 0) continue;
        boolean same = true;
        for (int i = size; i < n; i++) {
            if (s.charAt(i) != s.charAt(i % size)) {
                same = false;
                break;
            }
        }
        if (same) return true;
    }
    return false;
}`,
        javascript: `function repeatedSubstringPattern(s) {
  const n = s.length;
  for (let size = 1; size <= n / 2; size++) {
    if (n % size !== 0) continue;
    if (s.slice(0, size).repeat(n / size) === s) return true;
  }
  return false;
}`,
      },
    },
    {
      name: 'KMP 前綴函數',
      idea: '若最長相同前後綴長為 L，候選最短週期是 n−L。',
      steps: ['依序計算每個位置的 `pi`。', '遇到不相同就沿較短前綴退回。', '令 `period = n - pi[n-1]`；若 pi 非零且 period 整除 n，回傳 true。'],
      figure: { title: 's = "ababab"', steps: kmpFigure },
      complexity: { time: 'O(n)', space: 'O(n)', why: '前綴指標只前進與退回，總操作線性。' },
      verdict: '適合長字串，也能順便練習 [[p:kmp]]。',
      code: {
        python: `def repeatedSubstringPattern(s):
    n = len(s)
    pi = [0] * n
    for i in range(1, n):
        j = pi[i - 1]
        while j and s[i] != s[j]:
            j = pi[j - 1]              # 退到更短的相同前後綴
        if s[i] == s[j]:
            j += 1
        pi[i] = j
    period = n - pi[-1]               # 最短候選週期
    return pi[-1] > 0 and n % period == 0`,
        c: `bool repeatedSubstringPattern(char *s) {
    int n = strlen(s);
    int *pi = calloc(n, sizeof(int));
    for (int i = 1; i < n; i++) {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j]) j = pi[j - 1];
        if (s[i] == s[j]) j++;
        pi[i] = j;
    }
    int period = n - pi[n - 1];
    bool answer = pi[n - 1] > 0 && n % period == 0;
    free(pi);
    return answer;
}`,
        cpp: `bool repeatedSubstringPattern(string s) {
    int n = s.size();
    vector<int> pi(n);
    for (int i = 1; i < n; i++) {
        int j = pi[i - 1];
        while (j && s[i] != s[j]) j = pi[j - 1];
        if (s[i] == s[j]) j++;
        pi[i] = j;
    }
    int period = n - pi[n - 1];
    return pi[n - 1] > 0 && n % period == 0;
}`,
        java: `boolean repeatedSubstringPattern(String s) {
    int n = s.length();
    int[] pi = new int[n];
    for (int i = 1; i < n; i++) {
        int j = pi[i - 1];
        while (j > 0 && s.charAt(i) != s.charAt(j)) j = pi[j - 1];
        if (s.charAt(i) == s.charAt(j)) j++;
        pi[i] = j;
    }
    int period = n - pi[n - 1];
    return pi[n - 1] > 0 && n % period == 0;
}`,
        javascript: `function repeatedSubstringPattern(s) {
  const n = s.length;
  const pi = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    let j = pi[i - 1];
    while (j > 0 && s[i] !== s[j]) j = pi[j - 1];
    if (s[i] === s[j]) j++;
    pi[i] = j;
  }
  const period = n - pi[n - 1];
  return pi[n - 1] > 0 && n % period === 0;
}`,
      },
    },
  ],
  pitfalls: ['整段字串本身不能當片段；至少重複兩次。', '有相同前後綴不代表能完整重複，還要檢查長度可整除。'],
  check: { kind: 'fn', fn: 'repeatedSubstringPattern', cases: [
    { args: [S], out: true }, { args: ['abab'], out: true }, { args: ['aba'], out: false },
    { args: ['a'], out: false }, { args: ['abcabcabcabc'], out: true }, { args: ['abac'], out: false },
  ] },
}

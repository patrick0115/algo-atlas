import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const countFig: FigStep[] = [
  { note: 's = abcd，t = abcde；先統計 s 中每個字母的數量。', views: [arr(['a', 'b', 'c', 'd'], { label: 's' }), arr([1, 1, 1, 1, 0], { label: 'a..e 計數' })] },
  { note: '掃 t 的 a、b，將對應庫存各減 1；目前沒有負數。', views: [arr(['a', 'b', 'c', 'd', 'e'], { label: 't', done: [0, 1] }), arr([0, 0, 1, 1, 0], { label: 'a..e 剩餘' })] },
  { note: '再掃 c、d，四個原有字母都抵消為 0。', views: [arr(['a', 'b', 'c', 'd', 'e'], { label: 't', done: [0, 1, 2, 3] }), arr([0, 0, 0, 0, 0], { label: 'a..e 剩餘' })] },
  { note: '最後讀到 e，庫存變成 −1，這就是額外加入的字母。', views: [arr(['a', 'b', 'c', 'd', 'e'], { label: 't', highlight: [4] }), arr(['e'], { label: '答案', done: [0] })] },
]
const xorFig: FigStep[] = [
  { note: '把所有字元視為字元碼並做 XOR；同一字元出現兩次會互相抵消。', views: [arr(['a', 'b', 'c', 'd'], { label: 's' }), arr(['a', 'b', 'c', 'd', 'e'], { label: 't' })] },
  { note: 's 的 a 與 t 的 a 配對抵消；b 也抵消。XOR 的先後順序不影響結果。', views: [arr(['a', 'b', 'c', 'd', 'e'], { label: 't', dim: [0, 1] })] },
  { note: 'c、d 也各出現兩次而抵消；只剩下 t 裡額外的 e。', views: [arr(['a', 'b', 'c', 'd', 'e'], { label: 't', dim: [0, 1, 2, 3], highlight: [4] })] },
  { note: '把最後留下的字元碼轉回字元，答案為 e。', views: [arr(['e'], { label: '答案', done: [0] })] },
]
const WRAP = {
  python: `

def differenceCheck(s, t):
    return findTheDifference(s, t)`,
  c: `

char *differenceCheck(char *s, char *t) {
    static char answer[2];
    answer[0] = findTheDifference(s, t);
    answer[1] = '\\0';
    return answer;
}`,
  cpp: `

string differenceCheck(string s, string t) {
    return string(1, findTheDifference(s, t));
}`,
  java: `

String differenceCheck(String s, String t) {
    return String.valueOf(findTheDifference(s, t));
}`,
  javascript: `

function differenceCheck(s, t) {
  return findTheDifference(s, t);
}`,
}

export const q0389: Solution = {
  id: 389,
  plain: '字串 t 是把 s 打亂後又加進一個字母；找出多出來的是誰。',
  statement: '給定小寫字串 s、t；t 由 s 的所有字元重新排列，再插入一個額外字元得到。回傳額外的字元。',
  examples: [
    { input: 's = "abcd", t = "abcde"', output: '"e"' },
    { input: 's = "", t = "y"', output: '"y"' },
  ],
  constraints: ['0 ≤ s.length ≤ 1000', 't.length = s.length + 1', '只含小寫英文字母'],
  insight: ['字母可能重複，所以不能只比「有沒有出現」。', '用計數陣列相減，唯一多出的字母會出現負數。', 'XOR 具有 x XOR x = 0，同一字母在兩字串中成對抵消。'],
  approaches: [
    {
      name: '字母計數相減',
      idea: '先增加 s 的字母計數，再逐個扣除 t 的字母；首次扣成負數的字母就是答案。',
      steps: ['準備 26 格計數', '掃 s 增加每個字母', '掃 t 扣除每個字母', '哪格變負就回傳對應字母'],
      figure: { title: 's = "abcd", t = "abcde"', steps: countFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '字母表固定為 26 格。' },
      verdict: '直觀且能處理重複字母，是 [[p:counting-sort]] 的基本應用。',
      code: {
        python: `def findTheDifference(s, t):
    count = [0] * 26
    for ch in s:
        count[ord(ch) - 97] += 1
    for ch in t:
        idx = ord(ch) - 97
        count[idx] -= 1                  # 與 s 的字母抵消
        if count[idx] < 0:
            return ch                   # 額外字母
${WRAP.python}`,
        c: `char findTheDifference(char *s, char *t) {
    int count[26] = {0};
    for (int i = 0; s[i] != '\\0'; i++) {
        count[s[i] - 'a']++;
    }
    for (int i = 0; t[i] != '\\0'; i++) {
        int idx = t[i] - 'a';
        count[idx]--;
        if (count[idx] < 0) {
            return t[i];
        }
    }
    return '\\0';
}${WRAP.c}`,
        cpp: `char findTheDifference(string s, string t) {
    int count[26] = {0};
    for (char ch : s) {
        count[ch - 'a']++;
    }
    for (char ch : t) {
        int idx = ch - 'a';
        count[idx]--;
        if (count[idx] < 0) {
            return ch;
        }
    }
    return 0;
}${WRAP.cpp}`,
        java: `char findTheDifference(String s, String t) {
    int[] count = new int[26];
    for (char ch : s.toCharArray()) {
        count[ch - 'a']++;
    }
    for (char ch : t.toCharArray()) {
        int idx = ch - 'a';
        count[idx]--;
        if (count[idx] < 0) {
            return ch;
        }
    }
    return 0;
}${WRAP.java}`,
        javascript: `function findTheDifference(s, t) {
  const count = Array(26).fill(0);
  for (const ch of s) {
    count[ch.charCodeAt(0) - 97]++;
  }
  for (const ch of t) {
    const idx = ch.charCodeAt(0) - 97;
    count[idx]--;
    if (count[idx] < 0) {
      return ch;
    }
  }
  return '';
}${WRAP.javascript}`,
      },
    },
    {
      name: '字元碼 XOR 抵消',
      idea: '把 s、t 的所有字元碼做 XOR；成對字母都消掉，留下的就是新增字母。',
      steps: ['令 value=0', '掃 s，把每個字元碼 XOR 進 value', '掃 t，繼續 XOR 每個字元碼', '將剩餘字元碼轉回字母'],
      figure: { title: 's = "abcd", t = "abcde"', steps: xorFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩字串各掃一次，只保留一個整數。' },
      verdict: '最省空間，展現 [[p:bit-manipulation]] 的成對抵消。',
      code: {
        python: `def findTheDifference(s, t):
    value = 0
    for ch in s:
        value ^= ord(ch)                 # 成對字元碼會抵消
    for ch in t:
        value ^= ord(ch)
    return chr(value)${WRAP.python}`,
        c: `char findTheDifference(char *s, char *t) {
    char value = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        value ^= s[i];
    }
    for (int i = 0; t[i] != '\\0'; i++) {
        value ^= t[i];
    }
    return value;
}${WRAP.c}`,
        cpp: `char findTheDifference(string s, string t) {
    char value = 0;
    for (char ch : s) {
        value ^= ch;
    }
    for (char ch : t) {
        value ^= ch;
    }
    return value;
}${WRAP.cpp}`,
        java: `char findTheDifference(String s, String t) {
    char value = 0;
    for (char ch : s.toCharArray()) {
        value ^= ch;
    }
    for (char ch : t.toCharArray()) {
        value ^= ch;
    }
    return value;
}${WRAP.java}`,
        javascript: `function findTheDifference(s, t) {
  let value = 0;
  for (const ch of s) {
    value ^= ch.charCodeAt(0);
  }
  for (const ch of t) {
    value ^= ch.charCodeAt(0);
  }
  return String.fromCharCode(value);
}${WRAP.javascript}`,
      },
    },
  ],
  pitfalls: ['s 可以是空字串，此時答案就是 t 的唯一字母。', 's 可能有重複字母，集合查找不足以辨別多出的數量。', 'C 模板字串內的零字元寫法必須保留反斜線。'],
  check: { kind: 'fn', fn: 'differenceCheck', cases: [
    { args: ['abcd', 'abcde'], out: 'e' },
    { args: ['', 'y'], out: 'y' },
    { args: ['a', 'aa'], out: 'a' },
    { args: ['aabb', 'abbab'], out: 'b' },
  ] },
}

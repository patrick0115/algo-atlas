import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const leftFig: FigStep[] = [
  { note: '"ZY" 的 Z 代表 26，答案先從 0×26+26 得到 26。', views: [arr(['Z', 'Y'], { label: '欄名', highlight: [0] }), arr([26], { label: '目前數值' })] },
  { note: '下一個字母 Y 代表 25；原本 26 要先左移一個 26 進位，變成 26×26。', views: [arr(['Z', 'Y'], { label: '欄名', highlight: [1] }), arr([676], { label: '進位後' })] },
  { note: '加上 Y 的 25，得到 701。', views: [arr([676, 25, 701], { label: '舊值×26 / 新位 / 結果', done: [2] })] },
  { note: '走完字串，答案 701；這和十進位逐位讀數字的做法相同，只是底數換成 26。', views: [arr([701], { label: '答案', done: [0] })] },
]
const rightFig: FigStep[] = [
  { note: '從右邊 Y 開始，位權 1；Y=25，先得到 25。', views: [arr(['Z', 'Y'], { label: '欄名', highlight: [1] }), arr([25], { label: '累計' })] },
  { note: '位權乘 26，變成 26；左邊 Z 代表 26。', views: [arr([26, 26], { label: '位權 / Z 的值' })] },
  { note: '加上 26×26=676，累計 25+676=701。', views: [arr([25, 676, 701], { label: '兩位貢獻 / 總數', done: [2] })] },
  { note: '所有位置處理完，回傳 701。', views: [arr([701], { label: '答案', done: [0] })] },
]

export const q0171: Solution = {
  id: 171,
  plain: '把 Excel 欄名轉成數字：A 是 1、Z 是 26、AA 是 27。這是沒有 0 的 26 進位。',
  statement: '給大寫英文字母組成的 Excel 欄名 columnTitle，回傳對應的正整數欄號。',
  examples: [{ input: 'columnTitle = "A"', output: '1' }, { input: 'columnTitle = "AB"', output: '28' }, { input: 'columnTitle = "ZY"', output: '701' }],
  constraints: ['欄名至少一個字母；答案在 32 位元有號整數範圍內。'],
  insight: ['每個字母的值是 A→1、B→2、…、Z→26。', '從左讀可用「先乘 26 再加新位」；從右讀則維持 1、26、26² 等位權。'],
  approaches: [
    {
      name: '從左到右累乘', idea: '每讀一位，舊值乘 26，再加新字母值。',
      steps: ['答案從 0 開始。', '逐字計算字母值 1..26。', '更新 answer=answer×26+value。'],
      figure: { title: 'columnTitle = ZY', steps: leftFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '逐字處理，不需額外陣列。' },
      verdict: '推薦解法，與一般進位制轉換一致。',
      code: {
        python: `def titleToNumber(columnTitle):
    answer = 0
    for ch in columnTitle:
        value = ord(ch) - ord('A') + 1
        answer = answer * 26 + value  # 舊位左移一個 26 進位
    return answer`,
        c: `int titleToNumber(char *columnTitle) {
    int answer = 0;
    for (int i = 0; columnTitle[i] != '\\0'; i++) {
        int value = columnTitle[i] - 'A' + 1;
        answer = answer * 26 + value;
    }
    return answer;
}`,
        cpp: `int titleToNumber(string columnTitle) {
    int answer = 0;
    for (char ch : columnTitle) {
        answer = answer * 26 + ch - 'A' + 1;
    }
    return answer;
}`,
        java: `int titleToNumber(String columnTitle) {
    int answer = 0;
    for (int i = 0; i < columnTitle.length(); i++) {
        int value = columnTitle.charAt(i) - 'A' + 1;
        answer = answer * 26 + value;
    }
    return answer;
}`,
        javascript: `function titleToNumber(columnTitle) {
  let answer = 0;
  for (const ch of columnTitle) {
    const value = ch.charCodeAt(0) - 64;
    answer = answer * 26 + value;
  }
  return answer;
}`,
      },
    },
    {
      name: '從右到左累加位權', idea: '個位權重 1、左一位權重 26，再左邊依序乘 26。',
      steps: ['權重從 1 開始。', '從右邊往左逐字加上 value×weight。', '每輪把 weight 乘 26。'],
      figure: { title: 'columnTitle = ZY', steps: rightFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '掃一次字串，只存答案與位權。' },
      verdict: '有助於理解每個字母為何貢獻不同權重。',
      code: {
        python: `def titleToNumber(columnTitle):
    answer = 0
    weight = 1
    for ch in reversed(columnTitle):
        answer += (ord(ch) - ord('A') + 1) * weight  # 這一位的貢獻
        weight *= 26
    return answer`,
        c: `int titleToNumber(char *columnTitle) {
    int length = strlen(columnTitle);
    int answer = 0;
    int weight = 1;
    for (int i = length - 1; i >= 0; i--) {
        answer += (columnTitle[i] - 'A' + 1) * weight;
        if (i > 0) {
            weight *= 26;
        }
    }
    return answer;
}`,
        cpp: `int titleToNumber(string columnTitle) {
    int answer = 0;
    int weight = 1;
    for (int i = (int) columnTitle.size() - 1; i >= 0; i--) {
        answer += (columnTitle[i] - 'A' + 1) * weight;
        if (i > 0) {
            weight *= 26;
        }
    }
    return answer;
}`,
        java: `int titleToNumber(String columnTitle) {
    int answer = 0;
    int weight = 1;
    for (int i = columnTitle.length() - 1; i >= 0; i--) {
        answer += (columnTitle.charAt(i) - 'A' + 1) * weight;
        if (i > 0) {
            weight *= 26;
        }
    }
    return answer;
}`,
        javascript: `function titleToNumber(columnTitle) {
  let answer = 0;
  let weight = 1;
  for (let i = columnTitle.length - 1; i >= 0; i--) {
    answer += (columnTitle.charCodeAt(i) - 64) * weight;
    if (i > 0) {
      weight *= 26;
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['A 的值是 1，不是 0。', '右到左做法最後一輪後不必再乘 26，以免無謂地放大位權。'],
  check: { kind: 'fn', fn: 'titleToNumber', cases: [
    { args: ['A'], out: 1 },
    { args: ['AB'], out: 28 },
    { args: ['ZY'], out: 701 },
    { args: ['FXSHRXW'], out: 2147483647 },
  ] },
}

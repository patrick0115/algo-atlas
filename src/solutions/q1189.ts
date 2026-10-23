import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 1189. Maximum Number of Balloons

const T = 'loonbalxballpoon'

function cntFig(): FigStep[] {
  const cnt = (c: string) => [...T].filter((x) => x === c).length
  const need: [string, number][] = [['b', 1], ['a', 1], ['l', 2], ['o', 2], ['n', 1]]
  const ratio = need.map(([c, k]) => Math.floor(cnt(c) / k))
  const ans = Math.min(...ratio)
  return [
    { note: '"balloon" 需要 b×1、a×1、l×2、o×2、n×1。先數 text 裡每個字母有幾個', views: [arr(T.split(''), { label: 'text' }), kv(need.map(([c]) => [c, cnt(c)]), 'text 裡的數量')] },
    { note: `每個字母能撐幾個 balloon = 數量 ÷ 需要的數量(無條件捨去):${need.map(([c, k], i) => `${c}: ${cnt(c)}÷${k} = ${ratio[i]}`).join('、')}`, views: [kv(need.map(([c], i) => [c, ratio[i]]), '每個字母能撐幾個', need.filter((_, i) => ratio[i] === ans).map(([c]) => c))] },
    { note: `最缺的字母決定答案(木桶原理)→ ${ans}`, views: [arr([ans], { label: '答案', done: [0] })] },
  ]
}

function generalFig(): FigStep[] {
  return [
    { note: '寫成通用版:把目標單字也數一次,need[c];答案 = min(have[c] // need[c]),c 跑過目標裡的每個字母', views: [kv([['b', 1], ['a', 1], ['l', 2], ['o', 2], ['n', 1]], 'need(數 "balloon")')] },
    { note: '換成別的單字也能直接用,不用手動寫 l、o 要除以 2', views: [kv([['b', 2], ['a', 2], ['l', 2], ['o', 2], ['n', 2]], 'have ÷ need', ['b'])] },
  ]
}

export const q1189: Solution = {
  id: 1189,
  plain: '用一堆字母卡片拼單字 "balloon",每張卡片只能用一次。最多能拼出幾個?注意 balloon 要兩個 l、兩個 o。',
  statement: '給字串 `text`,每個字元最多使用一次,回傳最多能組成幾個單字 `"balloon"`。',
  examples: [
    { input: 'text = "nlaebolko"', output: '1' },
    { input: 'text = "loonbalxballpoon"', output: '2' },
    { input: 'text = "leetcode"', output: '0' },
  ],
  constraints: ['長度 ≤ 10⁴,只有小寫字母'],
  insight: ['只關心 b、a、l、o、n 五種字母的數量', '每種字母能撐幾個 = 數量 ÷ 需要的數量;最少的那個就是答案', 'l、o 要除以 2'],
  approaches: [
    {
      name: '計數取最小',
      idea: '`min(b, a, l // 2, o // 2, n)`。',
      steps: ['數 text 裡每個字母', '回傳 `min(cnt[b], cnt[a], cnt[l] // 2, cnt[o] // 2, cnt[n])`'],
      figure: { title: `text = "${T}"`, steps: cntFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次計數,26 格的表。' },
      verdict: '最推薦,一行就寫完。',
      code: {
        python: `def maxNumberOfBalloons(text):
    c = {ch: text.count(ch) for ch in 'balon'}
    return min(c['b'], c['a'], c['l'] // 2, c['o'] // 2, c['n'])   # 最缺的決定答案`,
        c: `int maxNumberOfBalloons(char *text) {
    int c[26] = {0};
    for (; *text; text++) c[*text - 'a']++;
    int ans = c['b' - 'a'];
    if (c['a' - 'a'] < ans) ans = c['a' - 'a'];
    if (c['l' - 'a'] / 2 < ans) ans = c['l' - 'a'] / 2;
    if (c['o' - 'a'] / 2 < ans) ans = c['o' - 'a'] / 2;
    if (c['n' - 'a'] < ans) ans = c['n' - 'a'];
    return ans;
}`,
        cpp: `int maxNumberOfBalloons(string text) {
    int c[26] = {0};
    for (char ch : text) c[ch - 'a']++;
    return min({c['b' - 'a'], c['a' - 'a'], c['l' - 'a'] / 2, c['o' - 'a'] / 2, c['n' - 'a']});
}`,
        java: `int maxNumberOfBalloons(String text) {
    int[] c = new int[26];
    for (char ch : text.toCharArray()) c[ch - 'a']++;
    return Math.min(Math.min(c['b' - 'a'], c['a' - 'a']), Math.min(Math.min(c['l' - 'a'] / 2, c['o' - 'a'] / 2), c['n' - 'a']));
}`,
        javascript: `function maxNumberOfBalloons(text) {
  const c = {};
  for (const ch of text) c[ch] = (c[ch] ?? 0) + 1;
  const g = (ch) => c[ch] ?? 0;
  return Math.min(g('b'), g('a'), Math.floor(g('l') / 2), Math.floor(g('o') / 2), g('n'));
}`,
      },
    },
    {
      name: '通用:目標單字也計數',
      idea: '`need` = 目標單字的字母計數;答案 = `min(have[c] // need[c])`。',
      steps: ['`have` = text 的計數,`need` = "balloon" 的計數', '對 need 裡每個字母 c:`ans = min(ans, have[c] // need[c])`'],
      figure: { title: `text = "${T}"`, steps: generalFig() },
      complexity: { time: 'O(n + m)', space: 'O(1)', why: 'm = 目標單字長度。' },
      verdict: '目標換成任何單字都能用,不容易漏寫「要除以 2」的字母。',
      code: {
        python: `from collections import Counter

def maxNumberOfBalloons(text):
    have, need = Counter(text), Counter('balloon')
    return min(have[c] // need[c] for c in need)`,
        c: `int maxNumberOfBalloons(char *text) {
    int have[26] = {0}, need[26] = {0};
    for (char *p = text; *p; p++) have[*p - 'a']++;
    for (const char *p = "balloon"; *p; p++) need[*p - 'a']++;
    int ans = INT_MAX;
    for (int c = 0; c < 26; c++)
        if (need[c] && have[c] / need[c] < ans) ans = have[c] / need[c];
    return ans;
}`,
        cpp: `int maxNumberOfBalloons(string text) {
    int have[26] = {0}, need[26] = {0};
    for (char c : text) have[c - 'a']++;
    for (char c : string("balloon")) need[c - 'a']++;
    int ans = INT_MAX;
    for (int c = 0; c < 26; c++) if (need[c]) ans = min(ans, have[c] / need[c]);
    return ans;
}`,
        java: `int maxNumberOfBalloons(String text) {
    int[] have = new int[26], need = new int[26];
    for (char c : text.toCharArray()) have[c - 'a']++;
    for (char c : "balloon".toCharArray()) need[c - 'a']++;
    int ans = Integer.MAX_VALUE;
    for (int c = 0; c < 26; c++) if (need[c] > 0) ans = Math.min(ans, have[c] / need[c]);
    return ans;
}`,
        javascript: `function maxNumberOfBalloons(text) {
  const have = new Array(26).fill(0), need = new Array(26).fill(0);
  for (const c of text) have[c.charCodeAt(0) - 97]++;
  for (const c of 'balloon') need[c.charCodeAt(0) - 97]++;
  let ans = Infinity;
  for (let c = 0; c < 26; c++) if (need[c]) ans = Math.min(ans, Math.floor(have[c] / need[c]));
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['l、o 忘了除以 2', '取最大而不是最小:能拼幾個由最缺的字母決定'],
  check: {
    kind: 'fn',
    fn: 'maxNumberOfBalloons',
    cases: [
      { args: ['nlaebolko'], out: 1 },
      { args: [T], out: 2 },
      { args: ['leetcode'], out: 0 },
      { args: ['balon'], out: 0 },
      { args: ['bbaalllloooonn'], out: 2 },
    ],
  },
}

import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2405. Optimal Partition of String

const S = 'abacaba'

function greedyFig(): FigStep[] {
  const out: FigStep[] = [{ note: '每一段內不能有重複字母,段數要最少 → 每段都盡量拉長:一直往右收,遇到這段已經有的字母才切', views: [arr(S.split(''), { label: 's' })] }]
  let seen = new Set<string>()
  let start = 0
  let cnt = 1
  for (let i = 0; i < S.length; i++) {
    if (seen.has(S[i])) {
      out.push({ note: `"${S[i]}" 已經在這段 "${S.slice(start, i)}" 裡 → 在它前面切一刀,開新的一段(第 ${cnt + 1} 段)`, views: [arr(S.split(''), { label: 's', range: [start, i - 1], highlight: [i] })] })
      cnt++
      seen = new Set()
      start = i
    }
    seen.add(S[i])
  }
  out.push({ note: `切成 "ab" "ac" "ab" "a",共 ${cnt} 段。拉長某一段永遠不會讓後面需要更多段,所以貪心最佳`, views: [arr(['ab', 'ac', 'ab', 'a'], { label: '分段', done: [0, 1, 2, 3] })] })
  return out
}

function lastFig(): FigStep[] {
  return [
    { note: '改用「每個字母最後出現的位置」:last[c] ≥ 目前這段的起點 → 代表 c 已經在這段裡了', views: [arr(S.split(''), { label: 's', range: [0, 1], highlight: [2] })] },
    { note: 'i = 2 的 a:last[a] = 0 ≥ 起點 0 → 切,起點改成 2。不用每次清空集合', views: [arr(S.split(''), { label: 's', range: [2, 3] })] },
  ]
}

export const q2405: Solution = {
  id: 2405,
  plain: '把一個字串切成好幾段,每一段裡的字母都不能重複。最少要切成幾段?',
  statement: '給字串 `s`,將其分割成若干子字串,使每個子字串中的字元**互不相同**。回傳最少的子字串數量。',
  examples: [
    { input: 's = "abacaba"', output: '4', note: '"ab" "ac" "ab" "a"' },
    { input: 's = "ssssss"', output: '6' },
  ],
  constraints: ['長度 ≤ 10⁵,只含小寫字母'],
  insight: ['[[p:greedy]]:每段盡量長,遇到重複才切', '用集合(或 26 位元遮罩)記錄這段有哪些字母', '「最後出現位置 ≥ 段的起點」等價於「在這段裡」'],
  approaches: [
    {
      name: '貪心 + 集合',
      idea: '`seen` 記這段的字母;`c in seen` → 段數 +1、清空;把 c 加入。',
      steps: ['`cnt = 1`、`seen = set()`', '`for c in s`:`c in seen` → `cnt += 1`、`seen.clear()`', '`seen.add(c)`', '回傳 cnt'],
      figure: { title: `s = "${S}"`, steps: greedyFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '集合最多 26 個字母。' },
      verdict: '最推薦,一次掃描,集合可以換成 26 位元整數更快。',
      code: {
        python: `def partitionString(s):
    cnt, seen = 1, set()
    for c in s:
        if c in seen:
            cnt += 1                          # 這段已經有 c 了,切
            seen.clear()
        seen.add(c)
    return cnt`,
        c: `int partitionString(char *s) {
    int cnt = 1, mask = 0;
    for (char *p = s; *p; p++) {
        int b = 1 << (*p - 'a');
        if (mask & b) { cnt++; mask = 0; }    // 26 位元當集合
        mask |= b;
    }
    return cnt;
}`,
        cpp: `int partitionString(string s) {
    int cnt = 1, mask = 0;
    for (char ch : s) {
        int b = 1 << (ch - 'a');
        if (mask & b) { cnt++; mask = 0; }
        mask |= b;
    }
    return cnt;
}`,
        java: `int partitionString(String s) {
    int cnt = 1, mask = 0;
    for (char ch : s.toCharArray()) {
        int b = 1 << (ch - 'a');
        if ((mask & b) != 0) { cnt++; mask = 0; }
        mask |= b;
    }
    return cnt;
}`,
        javascript: `function partitionString(s) {
  let cnt = 1, mask = 0;
  for (const ch of s) {
    const b = 1 << (ch.charCodeAt(0) - 97);
    if (mask & b) {
      cnt++;
      mask = 0;
    }
    mask |= b;
  }
  return cnt;
}`,
      },
    },
    {
      name: '最後出現位置',
      idea: '`last[c]` 記 c 最後出現的索引;`last[c] >= start` → 切,`start = i`。',
      steps: ['`last = [-1] * 26`、`start = 0`、`cnt = 1`', '`for i, c`:`last[c] >= start` → `cnt += 1`、`start = i`', '`last[c] = i`', '回傳 cnt'],
      figure: { title: `s = "${S}"`, steps: lastFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '26 格陣列。' },
      verdict: '不用清空資料結構;「最後出現位置 + 視窗起點」這招在 [3](#/q/3) 也用過。',
      code: {
        python: `def partitionString(s):
    last = [-1] * 26
    start, cnt = 0, 1
    for i, c in enumerate(s):
        k = ord(c) - 97
        if last[k] >= start:
            cnt += 1                          # c 在目前這段裡
            start = i
        last[k] = i
    return cnt`,
        c: `int partitionString(char *s) {
    int last[26], start = 0, cnt = 1;
    for (int k = 0; k < 26; k++) last[k] = -1;
    for (int i = 0; s[i]; i++) {
        int k = s[i] - 'a';
        if (last[k] >= start) { cnt++; start = i; }
        last[k] = i;
    }
    return cnt;
}`,
        cpp: `int partitionString(string s) {
    vector<int> last(26, -1);
    int start = 0, cnt = 1;
    for (int i = 0; i < (int)s.size(); i++) {
        int k = s[i] - 'a';
        if (last[k] >= start) { cnt++; start = i; }
        last[k] = i;
    }
    return cnt;
}`,
        java: `int partitionString(String s) {
    int[] last = new int[26];
    Arrays.fill(last, -1);
    int start = 0, cnt = 1;
    for (int i = 0; i < s.length(); i++) {
        int k = s.charAt(i) - 'a';
        if (last[k] >= start) { cnt++; start = i; }
        last[k] = i;
    }
    return cnt;
}`,
        javascript: `function partitionString(s) {
  const last = new Array(26).fill(-1);
  let start = 0, cnt = 1;
  for (let i = 0; i < s.length; i++) {
    const k = s.charCodeAt(i) - 97;
    if (last[k] >= start) {
      cnt++;
      start = i;
    }
    last[k] = i;
  }
  return cnt;
}`,
      },
    },
  ],
  pitfalls: ['切完忘了把目前字母加進新的一段', '段數從 0 開始算:非空字串至少有 1 段'],
  check: {
    kind: 'fn',
    fn: 'partitionString',
    cases: [
      { args: [S], out: 4 },
      { args: ['ssssss'], out: 6 },
      { args: ['a'], out: 1 },
      { args: ['abcdefghijklmnopqrstuvwxyz'], out: 1 },
      { args: ['hdklqkcssgxlvehva'], out: 4 },
    ],
  },
}

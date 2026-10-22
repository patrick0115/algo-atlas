import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 3. Longest Substring Without Repeating Characters

const S = 'abcabcbb'

function bruteFig(): FigStep[] {
  const chars = [...S]
  const out: FigStep[] = [{ note: '暴力:固定起點 i,往右一個一個加,直到遇到重複的字元就停', views: [arr(chars, { label: 's' })] }]
  let best = 0
  for (let i = 0; i < S.length; i++) {
    const seen = new Set<string>()
    let j = i
    while (j < S.length && !seen.has(S[j])) seen.add(S[j++])
    if (j - i > best) best = j - i
    out.push({ note: `從 ${i} 開始:"${S.slice(i, j)}" 長度 ${j - i}${j < S.length ? `,下一個 ${S[j]} 重複了` : ',走到底'}。最長 ${best}`, views: [arr(chars, { label: 's', range: [i, j - 1], compare: j < S.length ? [j] : [] })] })
  }
  return out
}

function setFig(): FigStep[] {
  const chars = [...S]
  const win = new Set<string>()
  let l = 0
  let best = 0
  const out: FigStep[] = [{ note: '滑動視窗:視窗 [l, r] 裡沒有重複。右邊每次加一個字元;如果重複了,就從左邊一個一個丟掉,直到不重複', views: [arr(chars, { label: 's' }), kv([], '視窗裡有的字元')] }]
  for (let r = 0; r < S.length; r++) {
    while (win.has(S[r])) {
      out.push({ note: `${S[r]} 已經在視窗裡了 → 丟掉左邊的 ${S[l]},l++`, views: [arr(chars, { label: 's', range: [l, r - 1], compare: [r], dim: [l] }), kv([...win].map((c) => [c, '✓']), '視窗裡有的字元', [S[l]])] })
      win.delete(S[l++])
    }
    win.add(S[r])
    best = Math.max(best, r - l + 1)
    out.push({ note: `加入 ${S[r]}:視窗 "${S.slice(l, r + 1)}",長度 ${r - l + 1},最長 ${best}`, views: [arr(chars, { label: 's', range: [l, r], highlight: [r], pointers: [{ name: 'l', index: l }, { name: 'r', index: r, color: 'b' }] }), kv([...win].map((c) => [c, '✓']), '視窗裡有的字元', [S[r]])] })
  }
  return out
}

function jumpFig(): FigStep[] {
  const chars = [...S]
  const last = new Map<string, number>()
  let l = 0
  let best = 0
  const out: FigStep[] = [{ note: '改良:記住每個字元「上一次出現的位置」。遇到重複時,左端直接**跳**到上一次位置的下一格,不用一格一格丟', views: [arr(chars, { label: 's' }), kv([], 'last(字元 → 上次出現的位置)')] }]
  for (let r = 0; r < S.length; r++) {
    const c = S[r]
    const p = last.get(c)
    let note = ''
    if (p !== undefined && p >= l) {
      note = `${c} 上次在 ${p},在視窗裡 → l 跳到 ${p + 1}。`
      l = p + 1
    } else if (p !== undefined) {
      note = `${c} 上次在 ${p},但已經在視窗左邊外面了,不用管。`
    }
    last.set(c, r)
    best = Math.max(best, r - l + 1)
    out.push({ note: `${note}視窗 "${S.slice(l, r + 1)}",長度 ${r - l + 1},最長 ${best}`, views: [arr(chars, { label: 's', range: [l, r], highlight: [r], pointers: [{ name: 'l', index: l }, { name: 'r', index: r, color: 'b' }] }), kv([...last], 'last', [c])] })
  }
  return out
}

export const q0003: Solution = {
  id: 3,
  plain: '在一串字裡,找出**一段連續、而且沒有任何字重複**的最長片段,回傳它有多長。就像排隊時每個人都要穿不同顏色的衣服,最長能排出幾個人。',
  statement: '給一個字串 `s`,找出**不含重複字元**的最長**連續**子字串,回傳它的長度。',
  examples: [
    { input: 's = "abcabcbb"', output: '3', note: '"abc"' },
    { input: 's = "bbbbb"', output: '1', note: '"b"' },
    { input: 's = "pwwkew"', output: '3', note: '"wke";"pwke" 不是連續的子字串' },
  ],
  constraints: ['`0 ≤ s.length ≤ 5·10⁴` → O(n²) 是 25 億,太慢;可能是空字串', '字元可以是字母、數字、符號、空白 → 用 Hash Map / Set,或開 128 格的陣列'],
  insight: [
    '暴力:每個起點往右延伸到重複為止 → O(n²)',
    '浪費在哪?從起點 i 延伸到 j 遇到重複後,下一個起點 i+1 又從頭開始數一遍。其實 `[i+1, j−1]` 一定沒有重複,不用重數',
    '→ **滑動視窗**:視窗 `[l, r]` 保持沒有重複。右端每次往右一格;加進來的字元重複了,就把左端往右推到不重複為止。左右端都只往右走,總共 O(n)',
    '再快一點:記住每個字元上一次出現在哪,左端可以直接**跳過去**',
  ],
  approaches: [
    {
      name: '暴力:每個起點往右延伸',
      idea: '對每個起點,用一個 set 記住看過的字元,一直往右直到遇到重複。',
      steps: ['對每個 `i`:`seen = 空 set`', '`j` 從 `i` 往右,`s[j]` 不在 `seen` 就加入', '遇到重複就停,長度是 `j − i`'],
      figure: { title: `s = "${S}"`, steps: bruteFig() },
      complexity: { time: 'O(n · k)', space: 'O(k)', why: 'k 是字元種類數(最多 128)。每個起點最多延伸 k 格就一定會重複。' },
      verdict: '其實不算太慢(k ≤ 128),但沒有用到「相鄰起點的結果可以重用」。',
      code: {
        python: `def lengthOfLongestSubstring(s):
    best = 0
    for i in range(len(s)):
        seen = set()
        j = i
        while j < len(s) and s[j] not in seen:
            seen.add(s[j])
            j += 1
        best = max(best, j - i)
    return best`,
        c: `int lengthOfLongestSubstring(char *s) {
    int n = strlen(s), best = 0;
    for (int i = 0; i < n; i++) {
        bool seen[128] = {false};
        int j = i;
        while (j < n && !seen[(unsigned char)s[j]]) seen[(unsigned char)s[j++]] = true;
        if (j - i > best) best = j - i;
    }
    return best;
}`,
        cpp: `int lengthOfLongestSubstring(string s) {
    int n = s.size(), best = 0;
    for (int i = 0; i < n; i++) {
        bool seen[128] = {false};
        int j = i;
        while (j < n && !seen[(unsigned char)s[j]]) seen[(unsigned char)s[j++]] = true;
        best = max(best, j - i);
    }
    return best;
}`,
        java: `int lengthOfLongestSubstring(String s) {
    int n = s.length(), best = 0;
    for (int i = 0; i < n; i++) {
        boolean[] seen = new boolean[128];
        int j = i;
        while (j < n && !seen[s.charAt(j)]) seen[s.charAt(j++)] = true;
        best = Math.max(best, j - i);
    }
    return best;
}`,
        javascript: `function lengthOfLongestSubstring(s) {
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const seen = new Set();
    let j = i;
    while (j < s.length && !seen.has(s[j])) seen.add(s[j++]);
    best = Math.max(best, j - i);
  }
  return best;
}`,
      },
    },
    {
      name: '滑動視窗 + Set(一格一格縮)',
      idea: '視窗 `[l, r]` 裡的字元放在 set。加入 `s[r]` 前,如果它已經在 set 裡,就一直把 `s[l]` 移出、`l++`,直到不重複。',
      steps: ['`win = 空 set`、`l = 0`', '對每個 `r`:`while s[r] in win`:移除 `s[l]`、`l++`', '加入 `s[r]`', '`best = max(best, r − l + 1)`'],
      figure: { title: `s = "${S}"`, steps: setFig() },
      complexity: { time: 'O(n)', space: 'O(k)', why: '每個字元最多被加入一次、移除一次,所以 l 和 r 合計走 2n 步。' },
      verdict: '最標準的[[p:sliding-window]]寫法:擴右端 → 不合法就縮左端 → 更新答案。這個骨架可以直接套到很多「最長 / 最短的連續子陣列」題。',
      code: {
        python: `def lengthOfLongestSubstring(s):
    win = set()
    l = best = 0
    for r, c in enumerate(s):
        while c in win:                   # 重複了:從左邊丟到不重複為止
            win.remove(s[l])
            l += 1
        win.add(c)
        best = max(best, r - l + 1)
    return best`,
        c: `int lengthOfLongestSubstring(char *s) {
    bool win[128] = {false};
    int l = 0, best = 0;
    for (int r = 0; s[r]; r++) {
        unsigned char c = s[r];
        while (win[c]) win[(unsigned char)s[l++]] = false;
        win[c] = true;
        if (r - l + 1 > best) best = r - l + 1;
    }
    return best;
}`,
        cpp: `int lengthOfLongestSubstring(string s) {
    unordered_set<char> win;
    int l = 0, best = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        while (win.count(s[r])) win.erase(s[l++]);
        win.insert(s[r]);
        best = max(best, r - l + 1);
    }
    return best;
}`,
        java: `int lengthOfLongestSubstring(String s) {
    Set<Character> win = new HashSet<>();
    int l = 0, best = 0;
    for (int r = 0; r < s.length(); r++) {
        while (win.contains(s.charAt(r))) win.remove(s.charAt(l++));
        win.add(s.charAt(r));
        best = Math.max(best, r - l + 1);
    }
    return best;
}`,
        javascript: `function lengthOfLongestSubstring(s) {
  const win = new Set();
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    while (win.has(s[r])) win.delete(s[l++]);
    win.add(s[r]);
    best = Math.max(best, r - l + 1);
  }
  return best;
}`,
      },
    },
    {
      name: '滑動視窗 + 記住上次位置(直接跳)',
      idea: '`last[c]` = 字元 c 上一次出現的位置。加入 `s[r]` 時,如果 `last[s[r]] ≥ l`(在視窗裡),左端直接跳到 `last[s[r]] + 1`。',
      steps: ['`last = {}`、`l = 0`', '對每個 `r`:`c = s[r]`', '`c` 在 `last` 且 `last[c] ≥ l` → `l = last[c] + 1`', '`last[c] = r`,`best = max(best, r − l + 1)`'],
      figure: { title: `s = "${S}"`, steps: jumpFig() },
      complexity: { time: 'O(n)', space: 'O(k)', why: '每個字元只處理一次,左端用跳的,不用一格一格走。' },
      verdict: '最快的寫法,只掃一次。要特別注意 `last[c] ≥ l` 這個判斷:上次的位置如果已經在視窗外面,就不能讓 l 往回跳。',
      code: {
        python: `def lengthOfLongestSubstring(s):
    last = {}                             # 字元 -> 上次出現的位置
    l = best = 0
    for r, c in enumerate(s):
        if c in last and last[c] >= l:    # 上次的位置在視窗裡才要跳
            l = last[c] + 1
        last[c] = r
        best = max(best, r - l + 1)
    return best`,
        c: `int lengthOfLongestSubstring(char *s) {
    int last[128];
    for (int i = 0; i < 128; i++) last[i] = -1;
    int l = 0, best = 0;
    for (int r = 0; s[r]; r++) {
        unsigned char c = s[r];
        if (last[c] >= l) l = last[c] + 1;
        last[c] = r;
        if (r - l + 1 > best) best = r - l + 1;
    }
    return best;
}`,
        cpp: `int lengthOfLongestSubstring(string s) {
    vector<int> last(128, -1);
    int l = 0, best = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        unsigned char c = s[r];
        if (last[c] >= l) l = last[c] + 1;
        last[c] = r;
        best = max(best, r - l + 1);
    }
    return best;
}`,
        java: `int lengthOfLongestSubstring(String s) {
    int[] last = new int[128];
    Arrays.fill(last, -1);
    int l = 0, best = 0;
    for (int r = 0; r < s.length(); r++) {
        char c = s.charAt(r);
        if (last[c] >= l) l = last[c] + 1;
        last[c] = r;
        best = Math.max(best, r - l + 1);
    }
    return best;
}`,
        javascript: `function lengthOfLongestSubstring(s) {
  const last = new Map();               // 字元 -> 上次出現的位置
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    if (last.has(c) && last.get(c) >= l) l = last.get(c) + 1;
    last.set(c, r);
    best = Math.max(best, r - l + 1);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    '跳躍版忘了檢查 `last[c] ≥ l`:`"abba"` 走到最後的 a 時,上次的 a 在 0,但 l 已經是 2,不能讓 l 跳回 1',
    '子字串(連續)和子序列(可以跳著選)搞混:`"pwwkew"` 的答案是 3 不是 4',
    '空字串要回傳 0',
    'C 的字元可能是負的,當陣列索引前要轉成 `unsigned char`',
  ],
  followUp: [
    { q: '最多允許 k 種不同字元?', a: '340. Longest Substring with At Most K Distinct Characters:一樣的視窗,改用 Hash Map 計數,種類數 > k 就縮左端。' },
  ],
  check: {
    kind: 'fn',
    fn: 'lengthOfLongestSubstring',
    cases: [
      { args: ['abcabcbb'], out: 3 },
      { args: ['bbbbb'], out: 1 },
      { args: ['pwwkew'], out: 3 },
      { args: [''], out: 0 },
      { args: ['abba'], out: 2 },
      { args: [' '], out: 1 },
      { args: ['dvdf'], out: 3 },
    ],
  },
}

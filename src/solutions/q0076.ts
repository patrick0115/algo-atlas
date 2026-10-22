import { arr, range } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 76. Minimum Window Substring

const S = 'ADOBECODEBANC'
const T = 'ABC'

function windowFig(): FigStep[] {
  const s = S.split('')
  const need = new Map<string, number>()
  for (const c of T) need.set(c, (need.get(c) ?? 0) + 1)
  let missing = T.length
  let l = 0
  let best: [number, number] = [0, -1]
  const out: FigStep[] = [{ note: `need = t 裡每個字還欠幾個;missing = 總共還欠幾個字(${missing})。右指針一直往右擴,直到 missing = 0(視窗已經包含 t 的所有字)`, views: [arr(s, { label: 's' }), kv([...need.entries()], 'need')] }]
  for (let r = 0; r < s.length; r++) {
    const c = s[r]
    if (need.has(c)) {
      if (need.get(c)! > 0) missing--
      need.set(c, need.get(c)! - 1)
    }
    if (missing > 0) continue
    out.push({ note: `r = ${r}("${c}"):視窗 "${S.slice(l, r + 1)}" 已經包含 A、B、C → 開始從左邊縮`, views: [arr(s, { label: 's', highlight: range(l, r) }), kv([...need.entries()], 'need(負數 = 多出來的)')] })
    while (true) {
      const lc = s[l]
      if (need.has(lc)) {
        if (need.get(lc)! === 0) break
        need.set(lc, need.get(lc)! + 1)
      }
      l++
    }
    const better = best[1] < 0 || r - l < best[1] - best[0]
    if (better) best = [l, r]
    out.push({ note: `左邊縮到不能再縮(再縮就少了 "${s[l]}"):"${S.slice(l, r + 1)}",長度 ${r - l + 1}${better ? ' → 目前最短' : ''}`, views: [arr(s, { label: 's', highlight: range(l, r), done: better ? [] : range(best[0], best[1]) }), kv([...need.entries()], 'need')] })
    need.set(s[l], need.get(s[l])! + 1)
    missing++
    l++
  }
  out.push({ note: `最短的視窗是 "${S.slice(best[0], best[1] + 1)}"`, views: [arr(s, { label: 's', done: range(best[0], best[1]) })] })
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:列出所有子字串(n² 個),每個都檢查有沒有包含 t 的所有字', views: [arr(S.split(''), { label: 's', highlight: [0, 1, 2, 3, 4, 5] })] },
    { note: '固定左端,往右延伸到第一次「包含」就可以停(再長只會更長)。仍然是 O(n²)', views: [arr(S.split(''), { label: 's', highlight: range(9, 12) })] },
  ]
}

export const q0076: Solution = {
  id: 76,
  plain: '在長字串 s 裡找一段**最短的連續片段**,這段要包含 t 的所有字母(重複的字母也要夠數)。例如 s = "ADOBECODEBANC"、t = "ABC",答案是 "BANC"。',
  statement: '給字串 `s` 和 `t`,回傳 s 中涵蓋 t 所有字元(含重複次數)的**最小子字串**;不存在就回傳空字串 ""。答案保證唯一。',
  examples: [
    { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
    { input: 's = "a", t = "a"', output: '"a"' },
    { input: 's = "a", t = "aa"', output: '""', note: 't 要兩個 a' },
  ],
  constraints: ['`m, n ≤ 10⁵` → 要 O(m + n)'],
  insight: [
    '「最短的連續片段,滿足某條件」→ **可變長度滑動視窗**',
    '右指針往右擴,直到視窗滿足條件;然後左指針往右縮,縮到剛好不滿足之前,就是以 r 結尾的最短答案',
    '怎麼快速知道「滿足條件」?用 `need[c]` 記每個字還欠幾個、`missing` 記總共還欠幾個;missing == 0 就是滿足',
    '每個字元最多被右指針加一次、左指針減一次 → O(m + n)',
  ],
  approaches: [
    {
      name: '暴力:固定左端往右延伸',
      idea: '每個左端 l,r 從 l 往右走、邊走邊計數,第一次涵蓋 t 就記錄長度並換下一個 l。',
      steps: ['`for l in range(m)`', '`cnt` 清空;`for r in l..m−1`:加入 s[r],涵蓋了就比較長度、break', '回傳最短的'],
      figure: { title: `s = "${S}",t = "${T}"`, steps: bruteFig() },
      complexity: { time: 'O(m² · |Σ|)', space: 'O(|Σ|)', why: 'm 個起點,每個往右最多 m 步;檢查涵蓋要比對字母表。' },
      verdict: '想法正確但太慢,只用來理解「固定一端、延伸到滿足就停」的觀念。',
      code: {
        python: `from collections import Counter

def minWindow(s, t):
    need = Counter(t)
    best = ''
    for l in range(len(s)):
        cnt = Counter()
        for r in range(l, len(s)):
            cnt[s[r]] += 1
            if all(cnt[c] >= k for c, k in need.items()):
                if not best or r - l + 1 < len(best):
                    best = s[l:r + 1]
                break
    return best`,
        c: `char *minWindow(char *s, char *t) {
    int m = strlen(s), need[128] = {0}, bl = 0, blen = -1;
    for (char *p = t; *p; p++) need[(int)*p]++;
    for (int l = 0; l < m; l++) {
        int cnt[128] = {0};
        for (int r = l; r < m; r++) {
            cnt[(int)s[r]]++;
            bool ok = true;
            for (int c = 0; c < 128 && ok; c++) if (cnt[c] < need[c]) ok = false;
            if (ok) {
                if (blen < 0 || r - l + 1 < blen) { bl = l; blen = r - l + 1; }
                break;
            }
        }
    }
    if (blen < 0) blen = 0;
    char *res = malloc(blen + 1);
    memcpy(res, s + bl, blen);
    res[blen] = '\\0';
    return res;
}`,
        cpp: `string minWindow(string s, string t) {
    int need[128] = {0}, bl = 0, blen = -1, m = s.size();
    for (char c : t) need[(int)c]++;
    for (int l = 0; l < m; l++) {
        int cnt[128] = {0};
        for (int r = l; r < m; r++) {
            cnt[(int)s[r]]++;
            bool ok = true;
            for (int c = 0; c < 128 && ok; c++) if (cnt[c] < need[c]) ok = false;
            if (ok) {
                if (blen < 0 || r - l + 1 < blen) { bl = l; blen = r - l + 1; }
                break;
            }
        }
    }
    return blen < 0 ? "" : s.substr(bl, blen);
}`,
        java: `String minWindow(String s, String t) {
    int[] need = new int[128];
    for (char c : t.toCharArray()) need[c]++;
    int bl = 0, blen = -1, m = s.length();
    for (int l = 0; l < m; l++) {
        int[] cnt = new int[128];
        for (int r = l; r < m; r++) {
            cnt[s.charAt(r)]++;
            boolean ok = true;
            for (int c = 0; c < 128 && ok; c++) if (cnt[c] < need[c]) ok = false;
            if (ok) {
                if (blen < 0 || r - l + 1 < blen) { bl = l; blen = r - l + 1; }
                break;
            }
        }
    }
    return blen < 0 ? "" : s.substring(bl, bl + blen);
}`,
        javascript: `function minWindow(s, t) {
  const need = {};
  for (const c of t) need[c] = (need[c] ?? 0) + 1;
  let best = '';
  for (let l = 0; l < s.length; l++) {
    const cnt = {};
    for (let r = l; r < s.length; r++) {
      cnt[s[r]] = (cnt[s[r]] ?? 0) + 1;
      if (Object.keys(need).every((c) => (cnt[c] ?? 0) >= need[c])) {
        if (!best || r - l + 1 < best.length) best = s.slice(l, r + 1);
        break;
      }
    }
  }
  return best;
}`,
      },
    },
    {
      name: '滑動視窗 + 欠款計數',
      idea: '`need[c]` = 還欠幾個 c(t 的字初始為正,其他字為 0)。r 右移:`need[s[r]] > 0` 時 missing−−,然後 need−−。missing == 0 時:左邊多餘的(`need[s[l]] < 0`)一路丟掉,記錄答案;再丟掉一個必要的字,missing++。',
      steps: ['`need = Counter(t)`,`missing = len(t)`', 'r 右移:`if need[c] > 0: missing −= 1`;`need[c] −= 1`', '`missing == 0`:`while need[s[l]] < 0`:`need[s[l]] += 1; l += 1`', '更新答案;`need[s[l]] += 1; missing += 1; l += 1`'],
      figure: { title: `s = "${S}",t = "${T}"`, steps: windowFig() },
      complexity: { time: 'O(m + n)', space: 'O(|Σ|)', why: '兩個指針都只往右走;need 最多字母表大小。' },
      verdict: '標準解,[[p:sliding-window]]最難的經典題。和 [3](#/q/3)、[424](#/q/424)、[567](#/q/567) 是同一個模板。',
      code: {
        python: `from collections import Counter

def minWindow(s, t):
    need = Counter(t)                         # 正數 = 還欠幾個;負數 = 多出來的
    missing = len(t)
    l, best = 0, (0, -1)
    for r, c in enumerate(s):
        if need[c] > 0:
            missing -= 1
        need[c] -= 1
        if missing == 0:                      # 視窗已涵蓋 t
            while need[s[l]] < 0:             # 左邊多出來的字都可以丟掉
                need[s[l]] += 1
                l += 1
            if best[1] < 0 or r - l < best[1] - best[0]:
                best = (l, r)
            need[s[l]] += 1                   # 再丟一個必要的字,繼續找下一個視窗
            missing += 1
            l += 1
    return s[best[0]:best[1] + 1]`,
        c: `char *minWindow(char *s, char *t) {
    int need[128] = {0}, missing = 0, m = strlen(s), l = 0, bl = 0, blen = -1;
    for (char *p = t; *p; p++) { need[(int)*p]++; missing++; }
    for (int r = 0; r < m; r++) {
        if (need[(int)s[r]]-- > 0) missing--;
        if (missing == 0) {
            while (need[(int)s[l]] < 0) need[(int)s[l++]]++;
            if (blen < 0 || r - l + 1 < blen) { bl = l; blen = r - l + 1; }
            need[(int)s[l++]]++;
            missing++;
        }
    }
    if (blen < 0) blen = 0;
    char *res = malloc(blen + 1);
    memcpy(res, s + bl, blen);
    res[blen] = '\\0';
    return res;
}`,
        cpp: `string minWindow(string s, string t) {
    int need[128] = {0}, missing = t.size(), l = 0, bl = 0, blen = -1;
    for (char c : t) need[(int)c]++;
    for (int r = 0; r < (int)s.size(); r++) {
        if (need[(int)s[r]]-- > 0) missing--;
        if (missing == 0) {
            while (need[(int)s[l]] < 0) need[(int)s[l++]]++;
            if (blen < 0 || r - l + 1 < blen) { bl = l; blen = r - l + 1; }
            need[(int)s[l++]]++;
            missing++;
        }
    }
    return blen < 0 ? "" : s.substr(bl, blen);
}`,
        java: `String minWindow(String s, String t) {
    int[] need = new int[128];
    for (char c : t.toCharArray()) need[c]++;
    int missing = t.length(), l = 0, bl = 0, blen = -1;
    for (int r = 0; r < s.length(); r++) {
        if (need[s.charAt(r)]-- > 0) missing--;
        if (missing == 0) {
            while (need[s.charAt(l)] < 0) need[s.charAt(l++)]++;
            if (blen < 0 || r - l + 1 < blen) { bl = l; blen = r - l + 1; }
            need[s.charAt(l++)]++;
            missing++;
        }
    }
    return blen < 0 ? "" : s.substring(bl, bl + blen);
}`,
        javascript: `function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
  let missing = t.length, l = 0, bl = 0, blen = -1;
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    if ((need.get(c) ?? 0) > 0) missing--;
    need.set(c, (need.get(c) ?? 0) - 1);
    if (missing === 0) {
      while (need.get(s[l]) < 0) { need.set(s[l], need.get(s[l]) + 1); l++; }
      if (blen < 0 || r - l + 1 < blen) { bl = l; blen = r - l + 1; }
      need.set(s[l], need.get(s[l]) + 1);
      missing++;
      l++;
    }
  }
  return blen < 0 ? '' : s.slice(bl, bl + blen);
}`,
      },
    },
  ],
  pitfalls: [
    '只看「有沒有出現」不看次數:t = "AA" 時一個 A 不夠',
    '每次都重新比較整個計數表:多一個 O(|Σ|) 的因子;用 missing 一個數就能 O(1) 判斷',
    '沒有答案時回傳 `s[0:0]` 以外的東西(例如整個 s)',
  ],
  check: {
    kind: 'fn',
    fn: 'minWindow',
    cases: [
      { args: [S, T], out: 'BANC' },
      { args: ['a', 'a'], out: 'a' },
      { args: ['a', 'aa'], out: '' },
      { args: ['aa', 'aa'], out: 'aa' },
      { args: ['cabwefgewcwaefgcf', 'cae'], out: 'cwae' },
      { args: ['xyz', 'q'], out: '' },
    ],
  },
}

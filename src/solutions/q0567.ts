import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { count26, idx } from './fig'

// 567. Permutation in String

const S1 = 'abc'
const S2 = 'cbdcab'

function sortFig(): FigStep[] {
  const m = S1.length
  const key = [...S1].sort().join('')
  const out: FigStep[] = [{ note: `s1 的某個排列出現在 s2 ⇔ s2 有一段長度 ${m} 的子字串和 s1 是異位詞。先把 s1 排序 → "${key}"`, views: [arr([...S2], { label: 's2' })] }]
  for (let i = 0; i + m <= S2.length; i++) {
    const w = [...S2.slice(i, i + m)].sort().join('')
    const hit = w === key
    out.push({ note: `視窗 "${S2.slice(i, i + m)}" 排序後是 "${w}"${hit ? ` = "${key}" → true` : ',不一樣'}`, views: [arr([...S2], { label: 's2', range: [i, i + m - 1], highlight: hit ? range(i, i + m - 1) : [] })] })
    if (hit) break
  }
  return out
}

function countFig(useMatches: boolean): FigStep[] {
  const m = S1.length
  const need = Array(26).fill(0)
  const win = Array(26).fill(0)
  for (const c of S1) need[idx(c)]++
  const letters = [...new Set([...S1, ...S2])].map(idx)
  const matchesOf = () => need.reduce((acc, v, i) => acc + (v === win[i] ? 1 : 0), 0)
  const views = (l: number, r: number, hl: number[] = []) => [
    arr([...S2], { label: 's2', range: [l, r] }),
    count26(need, 's1 的計數', hl),
    count26(win, '視窗的計數', hl),
  ]
  const out: FigStep[] = [{ note: useMatches ? '和上個方法一樣滑動,但另外記 matches = 「26 格裡兩邊計數相等的格數」。每次只有進出的兩個字母會變,matches 只要 O(1) 更新' : `先數好 s1 的計數。視窗固定長度 ${m},每往右滑一格:右邊進來的 +1、左邊出去的 −1`, views: views(0, -1) }]
  for (let r = 0; r < S2.length; r++) {
    win[idx(S2[r])]++
    const l = r - m + 1
    const changed = [idx(S2[r])]
    if (l - 1 >= 0) {
      win[idx(S2[l - 1])]--
      changed.push(idx(S2[l - 1]))
    }
    if (l < 0) {
      out.push({ note: `先把前 ${m} 個字元放進視窗:加入 ${S2[r]}`, views: views(0, r, changed) })
      continue
    }
    const eq = need.every((v, i) => v === win[i])
    out.push({
      note: `視窗 [${l}, ${r}] = "${S2.slice(l, r + 1)}"${l > 0 ? `(${S2[l - 1]} 出去、${S2[r]} 進來)` : ''}${useMatches ? `,matches = ${matchesOf()}/26` : ''} → ${eq ? '兩個計數完全相同 → true' : '不相同,繼續滑'}`,
      views: views(l, r, changed.filter((c) => letters.includes(c))),
    })
    if (eq) break
  }
  return out
}

export const q0567: Solution = {
  id: 567,
  plain: '檢查第二個字串裡,有沒有一段**連續的字**剛好是第一個字串打亂順序後的樣子。像在一長串字母裡找「abc 的任何排列」。',
  statement: '給兩個字串 `s1` 和 `s2`,判斷 `s2` 裡有沒有一段**連續**子字串是 `s1` 的某個排列(字母一樣、次數一樣,只是順序可能不同)。',
  examples: [
    { input: 's1 = "ab", s2 = "eidbaooo"', output: 'true', note: 's2 裡有 "ba"' },
    { input: 's1 = "ab", s2 = "eidboaoo"', output: 'false', note: 'b 和 a 之間隔了 o,不連續' },
  ],
  constraints: ['`1 ≤ s1.length, s2.length ≤ 10⁴`', '只有小寫字母 → 26 格計數'],
  insight: [
    '「是 s1 的某個排列」= 「和 s1 是異位詞」—— 見 [242. Valid Anagram](#/q/242)',
    '要找的子字串長度一定是 `len(s1)` → **固定長度的滑動視窗**',
    '視窗往右滑一格只有兩個字元變動(一個進、一個出),計數陣列只要改兩格,不用重算',
    '再進一步:不要每次比 26 格,記住「目前有幾格相等」,每次只看變動的那兩格',
  ],
  approaches: [
    {
      name: '每個視窗排序後比較',
      idea: '把 `s1` 排序;`s2` 每一段長度 `m` 的子字串也排序,相等就是 true。',
      steps: ['`key = sorted(s1)`', '對每個起點 `i`:`sorted(s2[i : i+m]) == key` → `true`', '都不是 → `false`'],
      figure: { title: `s1 = "${S1}", s2 = "${S2}"`, steps: sortFig() },
      complexity: { time: 'O((n − m) · m log m)', space: 'O(m)', why: 'n − m + 1 個視窗,每個排序 O(m log m)。' },
      verdict: '最好寫,但每個視窗都重頭排序,浪費了「相鄰視窗只差兩個字元」這件事。',
      code: {
        python: `def checkInclusion(s1, s2):
    m, key = len(s1), sorted(s1)
    for i in range(len(s2) - m + 1):
        if sorted(s2[i:i + m]) == key:
            return True
    return False`,
        c: `int cmpChar(const void *a, const void *b) {
    return *(const char *)a - *(const char *)b;
}

bool checkInclusion(char *s1, char *s2) {
    int m = strlen(s1), n = strlen(s2);
    if (m > n) return false;
    char *key = strdup(s1), *w = malloc(m + 1);
    qsort(key, m, 1, cmpChar);
    bool ok = false;
    for (int i = 0; i + m <= n && !ok; i++) {
        memcpy(w, s2 + i, m);
        w[m] = '\\0';
        qsort(w, m, 1, cmpChar);
        ok = strcmp(w, key) == 0;
    }
    free(key); free(w);
    return ok;
}`,
        cpp: `bool checkInclusion(string s1, string s2) {
    int m = s1.size(), n = s2.size();
    sort(s1.begin(), s1.end());
    for (int i = 0; i + m <= n; i++) {
        string w = s2.substr(i, m);
        sort(w.begin(), w.end());
        if (w == s1) return true;
    }
    return false;
}`,
        java: `boolean checkInclusion(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    char[] key = s1.toCharArray();
    Arrays.sort(key);
    for (int i = 0; i + m <= n; i++) {
        char[] w = s2.substring(i, i + m).toCharArray();
        Arrays.sort(w);
        if (Arrays.equals(w, key)) return true;
    }
    return false;
}`,
        javascript: `function checkInclusion(s1, s2) {
  const m = s1.length, key = [...s1].sort().join('');
  for (let i = 0; i + m <= s2.length; i++)
    if ([...s2.slice(i, i + m)].sort().join('') === key) return true;
  return false;
}`,
      },
    },
    {
      name: '固定長度滑動視窗 + 兩個計數陣列',
      idea: '`need` 是 `s1` 的計數,`win` 是目前視窗的計數。往右滑時進一個、出一個,每次比較兩個陣列是否相同。',
      steps: ['`m > n` → `false`', '`need[s1 的每個字母]++`', '`r` 從 0 往右:`win[s2[r]]++`;`r ≥ m` 時 `win[s2[r − m]]--`', '`r ≥ m − 1` 且 `win == need` → `true`'],
      figure: { title: `s1 = "${S1}", s2 = "${S2}"(灰色 = 0)`, steps: countFig(false) },
      complexity: { time: 'O(26 · n)', space: 'O(1)', why: '每滑一格 O(1) 更新,加上 O(26) 比較。26 是常數,所以是 O(n)。' },
      verdict: '標準解,好寫又夠快。438. Find All Anagrams 是同一份程式碼,只是把「回傳 true」改成「記下起點」。',
      code: {
        python: `def checkInclusion(s1, s2):
    m, n = len(s1), len(s2)
    if m > n:
        return False
    need, win = [0] * 26, [0] * 26
    for c in s1:
        need[ord(c) - 97] += 1
    for r in range(n):
        win[ord(s2[r]) - 97] += 1         # 右邊進來
        if r >= m:
            win[ord(s2[r - m]) - 97] -= 1 # 左邊出去
        if r >= m - 1 and win == need:
            return True
    return False`,
        c: `bool checkInclusion(char *s1, char *s2) {
    int m = strlen(s1), n = strlen(s2);
    if (m > n) return false;
    int need[26] = {0}, win[26] = {0};
    for (int i = 0; i < m; i++) need[s1[i] - 'a']++;
    for (int r = 0; r < n; r++) {
        win[s2[r] - 'a']++;
        if (r >= m) win[s2[r - m] - 'a']--;
        if (r >= m - 1 && memcmp(win, need, sizeof(need)) == 0) return true;
    }
    return false;
}`,
        cpp: `bool checkInclusion(string s1, string s2) {
    int m = s1.size(), n = s2.size();
    if (m > n) return false;
    array<int, 26> need{}, win{};
    for (char c : s1) need[c - 'a']++;
    for (int r = 0; r < n; r++) {
        win[s2[r] - 'a']++;
        if (r >= m) win[s2[r - m] - 'a']--;
        if (r >= m - 1 && win == need) return true;
    }
    return false;
}`,
        java: `boolean checkInclusion(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    if (m > n) return false;
    int[] need = new int[26], win = new int[26];
    for (char c : s1.toCharArray()) need[c - 'a']++;
    for (int r = 0; r < n; r++) {
        win[s2.charAt(r) - 'a']++;
        if (r >= m) win[s2.charAt(r - m) - 'a']--;
        if (r >= m - 1 && Arrays.equals(win, need)) return true;
    }
    return false;
}`,
        javascript: `function checkInclusion(s1, s2) {
  const m = s1.length, n = s2.length;
  if (m > n) return false;
  const need = new Array(26).fill(0), win = new Array(26).fill(0);
  for (const c of s1) need[c.charCodeAt(0) - 97]++;
  for (let r = 0; r < n; r++) {
    win[s2.charCodeAt(r) - 97]++;
    if (r >= m) win[s2.charCodeAt(r - m) - 97]--;
    if (r >= m - 1 && win.every((v, i) => v === need[i])) return true;
  }
  return false;
}`,
      },
    },
    {
      name: '滑動視窗 + matches 計數器',
      idea: '多記一個 `matches` = 26 格裡 `win[c] == need[c]` 的格數。每次只更新進出的兩個字母:改之前相等就 −1、改之後相等就 +1。`matches == 26` 就是答案。',
      steps: ['先算好第一個視窗的 `win`,和 `matches`', '`add(c)` / `remove(c)`:改 `win[c]` 前,`win[c] == need[c]` → `matches--`;改完後相等 → `matches++`', '每滑一格:`add(s2[r])`、`remove(s2[r − m])`', '`matches == 26` → `true`'],
      figure: { title: `s1 = "${S1}", s2 = "${S2}"`, steps: countFig(true) },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每滑一格只動兩格、O(1) 更新 matches,完全不用掃 26 格。' },
      verdict: '真正的 O(n),字母表很大(例如 Unicode 改用 Hash Map)時差別才明顯。[76. Minimum Window Substring](#/q/76) 用的是同樣的「需要幾種還沒湊齊」計數器。',
      code: {
        python: `def checkInclusion(s1, s2):
    m, n = len(s1), len(s2)
    if m > n:
        return False
    need, win = [0] * 26, [0] * 26
    for c in s1:
        need[ord(c) - 97] += 1
    matches = 26                          # 一開始 win 全 0,need 是 0 的那幾格已經相等
    matches -= sum(1 for v in need if v)

    def change(c, d):
        nonlocal matches
        if win[c] == need[c]:
            matches -= 1
        win[c] += d
        if win[c] == need[c]:
            matches += 1

    for r in range(n):
        change(ord(s2[r]) - 97, 1)
        if r >= m:
            change(ord(s2[r - m]) - 97, -1)
        if matches == 26:
            return True
    return False`,
        c: `bool checkInclusion(char *s1, char *s2) {
    int m = strlen(s1), n = strlen(s2);
    if (m > n) return false;
    int need[26] = {0}, win[26] = {0}, matches = 26;
    for (int i = 0; i < m; i++) need[s1[i] - 'a']++;
    for (int c = 0; c < 26; c++) if (need[c]) matches--;
    for (int r = 0; r < n; r++) {
        int c = s2[r] - 'a';
        if (win[c] == need[c]) matches--;
        if (++win[c] == need[c]) matches++;
        if (r >= m) {
            c = s2[r - m] - 'a';
            if (win[c] == need[c]) matches--;
            if (--win[c] == need[c]) matches++;
        }
        if (matches == 26) return true;
    }
    return false;
}`,
        cpp: `bool checkInclusion(string s1, string s2) {
    int m = s1.size(), n = s2.size();
    if (m > n) return false;
    int need[26] = {0}, win[26] = {0}, matches = 26;
    for (char c : s1) need[c - 'a']++;
    for (int c = 0; c < 26; c++) if (need[c]) matches--;
    auto change = [&](int c, int d) {
        if (win[c] == need[c]) matches--;
        win[c] += d;
        if (win[c] == need[c]) matches++;
    };
    for (int r = 0; r < n; r++) {
        change(s2[r] - 'a', 1);
        if (r >= m) change(s2[r - m] - 'a', -1);
        if (matches == 26) return true;
    }
    return false;
}`,
        java: `boolean checkInclusion(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    if (m > n) return false;
    int[] need = new int[26], win = new int[26];
    for (char c : s1.toCharArray()) need[c - 'a']++;
    int matches = 26;
    for (int v : need) if (v > 0) matches--;
    for (int r = 0; r < n; r++) {
        int c = s2.charAt(r) - 'a';
        if (win[c] == need[c]) matches--;
        if (++win[c] == need[c]) matches++;
        if (r >= m) {
            c = s2.charAt(r - m) - 'a';
            if (win[c] == need[c]) matches--;
            if (--win[c] == need[c]) matches++;
        }
        if (matches == 26) return true;
    }
    return false;
}`,
        javascript: `function checkInclusion(s1, s2) {
  const m = s1.length, n = s2.length;
  if (m > n) return false;
  const need = new Array(26).fill(0), win = new Array(26).fill(0);
  for (const c of s1) need[c.charCodeAt(0) - 97]++;
  let matches = 26 - need.filter((v) => v > 0).length;
  const change = (c, d) => {
    if (win[c] === need[c]) matches--;
    win[c] += d;
    if (win[c] === need[c]) matches++;
  };
  for (let r = 0; r < n; r++) {
    change(s2.charCodeAt(r) - 97, 1);
    if (r >= m) change(s2.charCodeAt(r - m) - 97, -1);
    if (matches === 26) return true;
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: [
    '`s1` 比 `s2` 長時要直接回傳 false,不然視窗大小比字串還大',
    '視窗還沒滿 `m` 個字元時就開始比較,會把較短的子字串誤判',
    'matches 的更新順序:要在改 `win[c]` **之前**先檢查「原本是否相等」,改完再檢查一次;兩個檢查都要做',
  ],
  followUp: [
    { q: '要回傳所有起點?', a: '438. Find All Anagrams in a String:同一份程式,找到時把 `r − m + 1` 記下來而不是回傳。' },
    { q: '視窗長度不固定、只要「包含」所有字元?', a: '[76. Minimum Window Substring](#/q/76):可變長度的視窗,右端擴張到湊齊、再縮左端求最短。' },
  ],
  check: {
    kind: 'fn',
    fn: 'checkInclusion',
    cases: [
      { args: ['ab', 'eidbaooo'], out: true },
      { args: ['ab', 'eidboaoo'], out: false },
      { args: [S1, S2], out: true },
      { args: ['abc', 'ab'], out: false },
      { args: ['a', 'a'], out: true },
      { args: ['adc', 'dcda'], out: true },
      { args: ['hello', 'ooolleoooleh'], out: false },
    ],
  },
}

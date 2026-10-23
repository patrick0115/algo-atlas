import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 1647. Minimum Deletions to Make Character Frequencies Unique

const S = 'aaabbbcc'

function setFig(): FigStep[] {
  return [
    { note: `字串「好」的條件:每個出現的字母,出現次數都不一樣。先數次數:a 3、b 3、c 2`, views: [kv([['a', 3], ['b', 3], ['c', 2]], '字母 → 次數')] },
    { note: '逐一處理每個次數 f,用集合記錄「已經被佔走的次數」。f 被佔了就一直減 1(刪一個字母),直到沒被佔或變成 0', views: [arr([3], { label: 'a:3 沒被佔 → 佔 3', done: [0] })] },
    { note: 'b 也是 3 → 被佔,刪一個變 2 → 2 沒被佔,佔 2(刪了 1 個)', views: [arr([3, 2], { label: '已佔的次數', done: [0, 1] })] },
    { note: 'c 是 2 → 被佔,刪一個變 1 → 佔 1(又刪 1 個)。總共刪 2 個:"aaabbc" 之類', views: [arr([3, 2, 1], { label: '已佔的次數', done: [0, 1, 2] }), arr([2], { label: '答案', done: [0] })] },
  ]
}

function sortFig(): FigStep[] {
  return [
    { note: '排序版:次數由大到小排,維護「下一個允許的最大次數」allow。第一個可以保留原樣', views: [arr([3, 3, 2], { label: '次數(由大到小)' })] },
    { note: '每個 f:如果 f > allow 就要刪到 allow(刪 f − allow 個);然後 allow = max(0, 新 f − 1)。3 → allow 2;3 → 刪 1 變 2,allow 1;2 → 刪 1 變 1', views: [arr([3, 2, 1], { label: '調整後', done: [0, 1, 2] })] },
  ]
}

export const q1647: Solution = {
  id: 1647,
  plain: '一個字串裡,如果每種字母出現的次數都互不相同,就叫「好字串」。最少要刪掉幾個字母,才能讓它變成好字串?',
  statement: '若字串中**沒有兩個不同字元的出現次數相同**,則稱為「好」字串。給字串 `s`,回傳使其成為好字串所需刪除的最少字元數。(出現 0 次的字母不算。)',
  examples: [
    { input: 's = "aab"', output: '0' },
    { input: 's = "aaabbbcc"', output: '2', note: '刪兩個 b 變成 "aaabcc",或刪 b、c 各一個' },
    { input: 's = "ceabaacb"', output: '2' },
  ],
  constraints: ['長度 ≤ 10⁵,只含小寫字母'],
  insight: ['只在乎每個字母的次數,和位置無關', '次數撞到了就往下降,降到沒人用的次數(或 0)為止 → [[p:greedy]]', '降到 0 等於整個字母刪光,0 可以重複'],
  approaches: [
    {
      name: '集合記錄已佔的次數',
      idea: '對每個次數 f:`while f > 0 and f in used`:`f -= 1`、`ans += 1`;`used.add(f)`。',
      steps: ['數 26 個字母的次數', '`for f in 次數`(跳過 0)', '`f` 被佔就往下減,每減一次 `ans += 1`', '`f > 0` 時加入 used'],
      figure: { title: `s = "${S}"`, steps: setFig() },
      complexity: { time: 'O(n + 26²)', space: 'O(26)', why: '數次數 O(n);每個次數最多往下減 26 次左右就能找到空位(最多 26 個字母)。' },
      verdict: '最推薦,好寫又直覺。',
      code: {
        python: `from collections import Counter

def minDeletions(s):
    used, ans = set(), 0
    for f in Counter(s).values():
        while f > 0 and f in used:
            f -= 1                            # 這個次數被佔了,刪一個
            ans += 1
        if f:
            used.add(f)
    return ans`,
        c: `int minDeletions(char *s) {
    int cnt[26] = {0}, ans = 0;
    for (char *p = s; *p; p++) cnt[*p - 'a']++;
    bool used[100001] = {false};
    for (int k = 0; k < 26; k++) {
        int f = cnt[k];
        while (f > 0 && used[f]) { f--; ans++; }
        if (f) used[f] = true;
    }
    return ans;
}`,
        cpp: `int minDeletions(string s) {
    int cnt[26] = {0}, ans = 0;
    for (char ch : s) cnt[ch - 'a']++;
    unordered_set<int> used;
    for (int f : cnt) {
        while (f > 0 && used.count(f)) { f--; ans++; }
        if (f) used.insert(f);
    }
    return ans;
}`,
        java: `int minDeletions(String s) {
    int[] cnt = new int[26];
    for (char ch : s.toCharArray()) cnt[ch - 'a']++;
    Set<Integer> used = new HashSet<>();
    int ans = 0;
    for (int f : cnt) {
        while (f > 0 && used.contains(f)) { f--; ans++; }
        if (f > 0) used.add(f);
    }
    return ans;
}`,
        javascript: `function minDeletions(s) {
  const cnt = new Array(26).fill(0);
  for (const ch of s) cnt[ch.charCodeAt(0) - 97]++;
  const used = new Set();
  let ans = 0;
  for (let f of cnt) {
    while (f > 0 && used.has(f)) {
      f--;
      ans++;
    }
    if (f) used.add(f);
  }
  return ans;
}`,
      },
    },
    {
      name: '排序 + 允許的上限',
      idea: '次數由大到小排序;`allow` = 下一個能用的最大次數。`f > allow` → 刪 `f − allow`;`allow = max(0, min(f, allow) − 1)`。',
      steps: ['次數由大到小排序', '`allow = 最大次數`', '每個 f:`f > allow` → `ans += f − allow`、`f = allow`', '`allow = max(0, f − 1)`'],
      figure: { title: `s = "${S}"`, steps: sortFig() },
      complexity: { time: 'O(n)', space: 'O(26)', why: '數次數 O(n),排序 26 個 O(1)。' },
      verdict: '不需要集合,每個次數 O(1) 處理。',
      code: {
        python: `from collections import Counter

def minDeletions(s):
    freq = sorted(Counter(s).values(), reverse=True)
    ans, allow = 0, freq[0]
    for f in freq:
        if f > allow:
            ans += f - allow                  # 刪到允許的上限
            f = allow
        allow = max(0, f - 1)                 # 下一個只能更少
    return ans`,
        c: `static int cmpDesc(const void *a, const void *b) { return *(int *)b - *(int *)a; }

int minDeletions(char *s) {
    int cnt[26] = {0}, ans = 0;
    for (char *p = s; *p; p++) cnt[*p - 'a']++;
    qsort(cnt, 26, sizeof(int), cmpDesc);
    int allow = cnt[0];
    for (int k = 0; k < 26 && cnt[k]; k++) {
        int f = cnt[k];
        if (f > allow) { ans += f - allow; f = allow; }
        allow = f > 0 ? f - 1 : 0;
    }
    return ans;
}`,
        cpp: `int minDeletions(string s) {
    vector<int> cnt(26, 0);
    for (char ch : s) cnt[ch - 'a']++;
    sort(cnt.rbegin(), cnt.rend());
    int ans = 0, allow = cnt[0];
    for (int f : cnt) {
        if (!f) break;
        if (f > allow) { ans += f - allow; f = allow; }
        allow = max(0, f - 1);
    }
    return ans;
}`,
        java: `int minDeletions(String s) {
    int[] cnt = new int[26];
    for (char ch : s.toCharArray()) cnt[ch - 'a']++;
    Arrays.sort(cnt);
    int ans = 0, allow = cnt[25];
    for (int k = 25; k >= 0 && cnt[k] > 0; k--) {
        int f = cnt[k];
        if (f > allow) { ans += f - allow; f = allow; }
        allow = Math.max(0, f - 1);
    }
    return ans;
}`,
        javascript: `function minDeletions(s) {
  const cnt = new Array(26).fill(0);
  for (const ch of s) cnt[ch.charCodeAt(0) - 97]++;
  cnt.sort((a, b) => b - a);
  let ans = 0, allow = cnt[0];
  for (let f of cnt) {
    if (!f) break;
    if (f > allow) {
      ans += f - allow;
      f = allow;
    }
    allow = Math.max(0, f - 1);
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['把 0 也放進集合:多個字母都刪光(次數 0)是允許的', '撞到時往上加:題目只能刪除,不能新增'],
  check: {
    kind: 'fn',
    fn: 'minDeletions',
    cases: [
      { args: ['aab'], out: 0 },
      { args: [S], out: 2 },
      { args: ['ceabaacb'], out: 2 },
      { args: ['abcabc'], out: 3 },
      { args: ['bbcebab'], out: 2 },
    ],
  },
}

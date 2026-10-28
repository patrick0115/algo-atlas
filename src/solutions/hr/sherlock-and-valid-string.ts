import { arr } from '../../engine/helpers'
import { count26 } from '../fig'
import type { FigStep, HrSolution } from '../types'

function firstFig(): FigStep[] {
  const s = 'aabbccc', out: FigStep[] = []
  for (let removed = -1; removed < s.length; removed++) {
    const count = new Array(26).fill(0)
    for (let i = 0; i < s.length; i++) if (i !== removed) count[s.charCodeAt(i) - 97]++
    const used = count.filter(x => x > 0)
    const valid = new Set(used).size <= 1
    out.push({ note: `${removed < 0 ? '先不刪' : `試刪索引 ${removed} 的 ${s[removed]}`}：非零次數為 ${used.join('、')}，${valid ? '全部相同，回傳 YES' : '仍不同，繼續試'}。`, views: [arr(s.split(''), { label: '原字串', highlight: removed < 0 ? [] : [removed] }), count26(count, '刪後各字母次數')] })
    if (valid) break
  }
  return out
}

function secondFig(): FigStep[] {
  const s = 'aabbccc', count = new Array(26).fill(0), out: FigStep[] = []
  for (let i = 0; i < s.length; i++) {
    const k = s.charCodeAt(i) - 97
    count[k]++
    const hist = new Map<number, number>()
    for (const x of count) if (x) hist.set(x, (hist.get(x) || 0) + 1)
    out.push({ note: `讀到 ${s[i]}，它出現 ${count[k]} 次；頻率分組為 ${[...hist].map(([f, n]) => `${f} 次有 ${n} 種`).join('、')}。`, views: [arr(s.split(''), { label: '原字串', highlight: [i] }), count26(count, '字母次數', [k]), arr([...hist.values()], { label: '各頻率的字母種類數' })] })
  }
  out.push({ note: '最後有 2 次的字母兩種、3 次的字母一種；只需刪一個 c 就能統一為 2 次。', views: [count26(count, '最後次數'), arr([2, 1], { label: '頻率 2、3 的字母種類數' })] })
  return out
}

export const hrSherlockAndValidString: HrSolution = {
  slug: "sherlock-and-valid-string",
  plain: "像讓每組字母排成一樣長的隊伍；你最多只能請走一位，看看能否排齊。",
  statement: "若字串各種已出現字母的出現次數相同，或恰好刪除一個字元後能相同，回傳 YES；否則回傳 NO。",
  examples: [
    { input: "s = \"aabbccddeefghi\"", output: "NO", note: "f、g、h、i 都只出現一次，無法只刪一個。" },
    { input: "s = \"abcdefghhgfedecba\"", output: "YES", note: "刪去多出的一個 e。" },
    { input: "s = \"aabbccc\"", output: "YES", note: "只要刪掉一個 c，三種字母便各有兩個。" },
  ],
  constraints: [
    "字串只含小寫字母，最多 10^5 字元 → 用 26 格頻率表線性掃描。",
    "最多刪一個字元，原本有效也可回傳 YES → 要先檢查零次刪除。",
  ],
  insight: [
    "先把問題轉成 26 個字母頻率，而非關心字元順序。",
    "最直覺的方法是試刪每個位置，再檢查頻率；但會反覆掃描。",
    "頻率若只有一種已有效；若有兩種，唯一可修復的形狀是「一個頻率 1 的字母整個消失」或「一個最高頻字母減 1」。這是 [[p:hash-map]] 的分組判斷。",
  ],
  approaches: [
    {
      name: "試刪每個字元",
      idea: "先檢查原字串，再逐一假設刪掉一個位置，看剩餘頻率是否一致。",
      steps: ["寫一個檢查函式，計算非零字母頻率並確認全相同。","原字串若已有效，直接回傳 YES。","否則每次刪除一個位置，檢查新字串。","任一刪法有效就回傳 YES；全失敗回傳 NO。"],
      figure: { title: "s = \"aabbccc\"", steps: firstFig() },
      complexity: {
        time: "O(n²)",
        space: "O(n)",
        why: "最多試 n 個刪除位置，每次重建字串並重新掃描 n 字元。",
      },
      verdict: "直接符合「最多刪一次」的題意，但大輸入會超時。",
      code: {
        python: `def isValid(s):
    def uniform(text):
        count = [0] * 26
        for ch in text:
            count[ord(ch) - ord('a')] += 1
        used = [x for x in count if x > 0]
        return len(set(used)) <= 1

    if uniform(s):
        return 'YES'
    for i in range(len(s)):
        if uniform(s[:i] + s[i + 1:]):  # 假設刪掉第 i 個字
            return 'YES'
    return 'NO'`,
        c: `char* isValid(char* s) {
    int n = strlen(s);
    for (int removed = -1; removed < n; removed++) {
        int count[26] = {0};
        for (int i = 0; i < n; i++) {
            if (i != removed) count[s[i] - 'a']++;
        }
        int target = 0, valid = 1;
        for (int i = 0; i < 26; i++) {
            if (!count[i]) continue;
            if (!target) target = count[i];
            else if (count[i] != target) valid = 0;
        }
        if (valid) return "YES";
    }
    return "NO";
}`,
        cpp: `string isValid(string s) {
    for (int removed = -1; removed < (int)s.size(); removed++) {
        vector<int> count(26);
        for (int i = 0; i < (int)s.size(); i++) {
            if (i != removed) count[s[i] - 'a']++;
        }
        int target = 0;
        bool valid = true;
        for (int x : count) {
            if (x && !target) target = x;
            else if (x && x != target) valid = false;
        }
        if (valid) return "YES";
    }
    return "NO";
}`,
        java: `public static String isValid(String s) {
    for (int removed = -1; removed < s.length(); removed++) {
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            if (i != removed) count[s.charAt(i) - 'a']++;
        }
        int target = 0;
        boolean valid = true;
        for (int x : count) {
            if (x == 0) continue;
            if (target == 0) target = x;
            else if (x != target) valid = false;
        }
        if (valid) return "YES";
    }
    return "NO";
}`,
        javascript: `function isValid(s) {
  for (let removed = -1; removed < s.length; removed++) {
    const count = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) {
      if (i !== removed) count[s.charCodeAt(i) - 97]++;
    }
    let target = 0;
    let valid = true;
    for (const x of count) {
      if (!x) continue;
      if (!target) target = x;
      else if (x !== target) valid = false;
    }
    if (valid) return 'YES';
  }
  return 'NO';
}`,
      },
    },
    {
      name: "統計頻率的頻率",
      idea: "只檢查頻率分布能否用一次刪除變成單一頻率。",
      steps: ["計算 26 個字母的出現次數，忽略 0。","再統計每一種頻率有多少個字母。","只有一種頻率就回傳 YES。","若恰有兩種，檢查較小頻率是否為 1 且只屬於一個字母，或較大頻率是否只多 1 且只屬於一個字母。","其餘情況回傳 NO。"],
      figure: { title: "s = \"aabbccc\"", steps: secondFig() },
      complexity: {
        time: "O(n+26)",
        space: "O(1)",
        why: "字串掃一次，其餘工作只處理最多 26 種字母與頻率。",
      },
      verdict: "能應付大輸入；關鍵是同時檢查頻率差和該頻率的字母數。",
      code: {
        python: `def isValid(s):
    count = [0] * 26
    for ch in s:
        count[ord(ch) - ord('a')] += 1
    groups = {}
    for x in count:
        if x:
            groups[x] = groups.get(x, 0) + 1
    if len(groups) == 1:
        return 'YES'
    if len(groups) != 2:
        return 'NO'
    (low, low_count), (high, high_count) = sorted(groups.items())
    # 只能刪掉唯一的單次字母，或削掉唯一多一次的字母
    return 'YES' if (low == 1 and low_count == 1) or (high == low + 1 and high_count == 1) else 'NO'`,
        c: `char* isValid(char* s) {
    int count[26] = {0};
    int n = strlen(s);
    int groups[100001] = {0};
    for (int i = 0; i < n; i++) count[s[i] - 'a']++;
    int low = n + 1, high = 0, kinds = 0;
    for (int i = 0; i < 26; i++) {
        if (count[i] == 0) continue;
        if (count[i] < low) low = count[i];
        if (count[i] > high) high = count[i];
        groups[count[i]]++;
    }
    for (int i = 1; i <= n; i++) {
        if (groups[i]) kinds++;
    }
    if (kinds == 1) return "YES";
    if (kinds != 2) return "NO";
    if (low == 1 && groups[low] == 1) return "YES";
    if (high == low + 1 && groups[high] == 1) return "YES";
    return "NO";
}`,
        cpp: `string isValid(string s) {
    vector<int> count(26);
    for (char ch : s) count[ch - 'a']++;
    map<int, int> groups;
    for (int x : count) {
        if (x) groups[x]++;
    }
    if (groups.size() == 1) return "YES";
    if (groups.size() != 2) return "NO";
    auto it = groups.begin();
    int low = it->first, lowCount = it->second;
    ++it;
    int high = it->first, highCount = it->second;
    if (low == 1 && lowCount == 1) return "YES";
    if (high == low + 1 && highCount == 1) return "YES";
    return "NO";
}`,
        java: `public static String isValid(String s) {
    int[] count = new int[26];
    for (char ch : s.toCharArray()) count[ch - 'a']++;
    Map<Integer, Integer> groups = new TreeMap<>();
    for (int x : count) {
        if (x > 0) groups.put(x, groups.getOrDefault(x, 0) + 1);
    }
    if (groups.size() == 1) return "YES";
    if (groups.size() != 2) return "NO";
    List<Integer> keys = new ArrayList<>(groups.keySet());
    int low = keys.get(0), high = keys.get(1);
    if (low == 1 && groups.get(low) == 1) return "YES";
    if (high == low + 1 && groups.get(high) == 1) return "YES";
    return "NO";
}`,
        javascript: `function isValid(s) {
  const count = new Array(26).fill(0);
  for (const ch of s) count[ch.charCodeAt(0) - 97]++;
  const groups = new Map();
  for (const x of count) {
    if (x) groups.set(x, (groups.get(x) || 0) + 1);
  }
  if (groups.size === 1) return 'YES';
  if (groups.size !== 2) return 'NO';
  const [[low, lowCount], [high, highCount]] = [...groups].sort((a, b) => a[0] - b[0]);
  return (low === 1 && lowCount === 1) || (high === low + 1 && highCount === 1)
    ? 'YES' : 'NO';
}`,
      },
    },
  ],
  pitfalls: [
    "頻率為 0 的字母沒有出現，不該納入比較。",
    "有兩種頻率不代表一定可修復；要確定只需刪一個字元。",
    "想靠「刪光某個字母」修復時，那個字母必須只出現 1 次、而且只有它一個是 1 次；例如 `abcc` 有兩個 1 次的字母，靠的是把 c 減 1 才有效。",
    "頻率分布只有兩種還不一定可行；異常頻率必須只屬於一個字母。",
  ],
  check: {
    kind: 'fn',
    fn: "isValid",
    cases: [
      { args: ["aabbccddeefghi"], out: "NO" },
      { args: ["abcdefghhgfedecba"], out: "YES" },
      { args: ["aabbccc"], out: "YES" },
      { args: ["a"], out: "YES" },
      { args: ["aabb"], out: "YES" },
      { args: ["aabbcd"], out: "NO" },
      { args: ["abcc"], out: "YES" },
    ],
  },
}

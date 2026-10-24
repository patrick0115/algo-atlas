import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 691. Stickers to Spell Word

const ST = ['with', 'example', 'science']
const T = 'thehat'

function memoFig(): FigStep[] {
  return [
    { note: `每張貼紙可以無限次使用,剪下字母拼出 "${T}"。狀態 = 「還缺哪些字母」;用字母計數表示,同一個缺口只算一次(記憶化)`, views: [kv([['t', 2], ['h', 2], ['e', 1], ['a', 1]], '還缺')] },
    { note: '剪枝:只考慮**含有缺口第一個字母**的貼紙。反正那個字母遲早要由某張貼紙提供,先決定它不會漏解,又能大幅減少分支。缺口排序後是 "aehhtt",第一個字母是 a', views: [arr(ST, { label: '含 a 的:—、example、—', highlight: [1], dim: [0, 2] })] },
    { note: '先用 "example" → 缺 {t:2, h:2};再用 "with" → 缺 {t:1, h:1};再用 "with" → 全補齊。共 3 張', views: [arr(['example', 'with', 'with'], { label: '選用', done: [0, 1, 2] })] },
    { note: '記憶化遞迴回傳「補齊這個缺口最少要幾張」,遞迴式:`1 + min(dfs(用了貼紙 s 後的缺口))`', views: [arr([3], { label: '答案', done: [0] })] },
  ]
}

function maskFig(): FigStep[] {
  return [
    { note: `target 最多 15 個字 → 用遮罩表示 target 的哪些**位置**已經拼好了。dp[mask] = 拼好這些位置最少用幾張`, views: [arr(T.split(''), { label: 'target' })] },
    { note: '從 dp[mask] 套一張貼紙:對貼紙的每個字母,從左往右找 target 中還沒拼好、字母相同的位置填上 → 得到新遮罩', views: [arr(T.split(''), { label: '套 "with":填上 t、h', done: [0, 1] })] },
    { note: '由小到大掃 mask(套貼紙只會讓 mask 變大),答案是 dp[全部位置]。BFS 的味道:每套一張就是走一步', views: [arr(T.split(''), { label: '全部拼好', done: [0, 1, 2, 3, 4, 5] })] },
  ]
}

export const q0691: Solution = {
  id: 691,
  plain: '有幾種貼紙,每種上面印著一個英文單字,每種都可以用無限張。把貼紙上的字母剪下來重新排,拼出目標單字,最少要用幾張貼紙?拼不出來回傳 −1。',
  statement: '給 n 種貼紙 `stickers`(每種無限張)和字串 `target`。可以從貼紙上剪下個別字母並重新排列,回傳拼出 target 所需的**最少貼紙數**;若不可能回傳 −1。',
  examples: [
    { input: 'stickers = ["with","example","science"], target = "thehat"', output: '3', note: '2 張 with + 1 張 example' },
    { input: 'stickers = ["notice","possible"], target = "basicbasic"', output: '-1', note: '沒有任何貼紙有 a' },
  ],
  constraints: ['n ≤ 50,target.length ≤ 15,全是小寫字母'],
  insight: ['target 很短 → 狀態可以是「還缺的字母」或「已拼好的位置遮罩」', '記憶化:同一個缺口只算一次', '剪枝:只試含有缺口第一個字母的貼紙'],
  approaches: [
    {
      name: '記憶化遞迴(缺口字串)',
      idea: '`dfs(rest)`:rest 是排序過的缺口字串;只試含 `rest[0]` 的貼紙,扣掉它的字母得到新缺口,取 `1 + dfs(新缺口)` 的最小。',
      steps: ['每張貼紙先轉成 26 格計數', '`dfs("")` = 0;記憶化', '`for s in stickers`:`s` 沒有 `rest[0]` 就跳過', '扣掉 s 的字母 → 新缺口(排序後)→ `1 + dfs(新缺口)`', '最後是 ∞ → 回傳 −1'],
      figure: { title: `target = "${T}"`, steps: memoFig() },
      complexity: { time: 'O(2ᵗ · n · t)', space: 'O(2ᵗ)', why: '缺口最多是 target 的 2ᵗ 種子多重集合;每個試 n 張貼紙。' },
      verdict: '最推薦,好想好寫;「只試含第一個字母的」這個剪枝是能過的關鍵。',
      code: {
        python: `from functools import lru_cache

def minStickers(stickers, target):
    cnts = []
    for s in stickers:
        c = [0] * 26
        for ch in s:
            c[ord(ch) - 97] += 1
        cnts.append(c)

    @lru_cache(None)
    def dfs(rest):                            # rest:排序過的缺口
        if not rest:
            return 0
        need = [0] * 26
        for ch in rest:
            need[ord(ch) - 97] += 1
        best = float('inf')
        first = ord(rest[0]) - 97
        for c in cnts:
            if c[first] == 0:
                continue                      # 只試能補第一個字母的貼紙
            nxt = ''.join(chr(97 + k) * max(0, need[k] - c[k]) for k in range(26))
            best = min(best, 1 + dfs(nxt))
        return best

    ans = dfs(''.join(sorted(target)))
    return -1 if ans == float('inf') else ans`,
        c: `// C 沒有內建的字串雜湊表,缺口改用「位置遮罩」表示(和解法二相同)
int minStickers(char **stickers, int stickersSize, char *target) {
    int t = strlen(target), full = 1 << t;
    int *dp = malloc(full * sizeof(int));
    for (int i = 0; i < full; i++) dp[i] = -1;
    dp[0] = 0;
    for (int mask = 0; mask < full; mask++) {
        if (dp[mask] < 0) continue;
        int first = 0;
        while (first < t && (mask >> first & 1)) first++;
        if (first == t) continue;
        for (int k = 0; k < stickersSize; k++) {
            if (!strchr(stickers[k], target[first])) continue;   // 剪枝:要能補第一個缺口
            int nxt = mask;
            for (char *p = stickers[k]; *p; p++)
                for (int i = 0; i < t; i++)
                    if (!(nxt >> i & 1) && target[i] == *p) { nxt |= 1 << i; break; }
            if (dp[nxt] < 0 || dp[nxt] > dp[mask] + 1) dp[nxt] = dp[mask] + 1;
        }
    }
    int ans = dp[full - 1];
    free(dp);
    return ans;
}`,
        cpp: `int minStickers(vector<string>& stickers, string target) {
    vector<array<int, 26>> cnts;
    for (auto &s : stickers) {
        array<int, 26> c{};
        for (char ch : s) c[ch - 'a']++;
        cnts.push_back(c);
    }
    unordered_map<string, int> memo;
    function<int(const string &)> dfs = [&](const string &rest) {
        if (rest.empty()) return 0;
        auto it = memo.find(rest);
        if (it != memo.end()) return it->second;
        array<int, 26> need{};
        for (char ch : rest) need[ch - 'a']++;
        int best = INT_MAX;
        for (auto &c : cnts) {
            if (!c[rest[0] - 'a']) continue;
            string nxt;
            for (int k = 0; k < 26; k++) nxt += string(max(0, need[k] - c[k]), 'a' + k);
            int r = dfs(nxt);
            if (r != INT_MAX) best = min(best, 1 + r);
        }
        return memo[rest] = best;
    };
    sort(target.begin(), target.end());
    int ans = dfs(target);
    return ans == INT_MAX ? -1 : ans;
}`,
        java: `Map<String, Integer> memo = new HashMap<>();
int[][] cnts;

int minStickers(String[] stickers, String target) {
    cnts = new int[stickers.length][26];
    for (int i = 0; i < stickers.length; i++) for (char ch : stickers[i].toCharArray()) cnts[i][ch - 'a']++;
    memo.clear();
    char[] t = target.toCharArray();
    Arrays.sort(t);
    int ans = dfs(new String(t));
    return ans == Integer.MAX_VALUE ? -1 : ans;
}

int dfs(String rest) {
    if (rest.isEmpty()) return 0;
    if (memo.containsKey(rest)) return memo.get(rest);
    int[] need = new int[26];
    for (char ch : rest.toCharArray()) need[ch - 'a']++;
    int best = Integer.MAX_VALUE;
    for (int[] c : cnts) {
        if (c[rest.charAt(0) - 'a'] == 0) continue;
        StringBuilder nxt = new StringBuilder();
        for (int k = 0; k < 26; k++) for (int r = 0; r < need[k] - c[k]; r++) nxt.append((char) ('a' + k));
        int r = dfs(nxt.toString());
        if (r != Integer.MAX_VALUE) best = Math.min(best, 1 + r);
    }
    memo.put(rest, best);
    return best;
}`,
        javascript: `function minStickers(stickers, target) {
  const cnts = stickers.map((s) => {
    const c = new Array(26).fill(0);
    for (const ch of s) c[ch.charCodeAt(0) - 97]++;
    return c;
  });
  const memo = new Map();
  const dfs = (rest) => {
    if (!rest) return 0;
    if (memo.has(rest)) return memo.get(rest);
    const need = new Array(26).fill(0);
    for (const ch of rest) need[ch.charCodeAt(0) - 97]++;
    let best = Infinity;
    for (const c of cnts) {
      if (!c[rest.charCodeAt(0) - 97]) continue;
      let nxt = '';
      for (let k = 0; k < 26; k++) nxt += String.fromCharCode(97 + k).repeat(Math.max(0, need[k] - c[k]));
      best = Math.min(best, 1 + dfs(nxt));
    }
    memo.set(rest, best);
    return best;
  };
  const ans = dfs([...target].sort().join(''));
  return ans === Infinity ? -1 : ans;
}`,
      },
    },
    {
      name: '位置遮罩 DP',
      idea: '`dp[mask]` = 拼好 target 中 mask 這些位置的最少張數;對每個可達的 mask,套每張貼紙(貪心填最左邊相同字母的空位),更新新遮罩。',
      steps: ['`dp = [-1] * 2ᵗ`、`dp[0] = 0`', '`for mask` 由小到大:不可達跳過', '找第一個沒拼好的位置 first,只試含 `target[first]` 的貼紙', '每個貼紙字母填進最左邊相同字母的空位 → nxt;`dp[nxt] = min(dp[nxt], dp[mask] + 1)`', '回傳 `dp[full]`'],
      figure: { title: `target = "${T}"`, steps: maskFig() },
      complexity: { time: 'O(2ᵗ · n · L · t)', space: 'O(2ᵗ)', why: 'L 是貼紙長度;每個狀態試 n 張,每張填字 O(L · t)。' },
      verdict: '狀態大小固定 2¹⁵,適合 C 這種不方便用字串當 key 的語言。',
      code: {
        python: `def minStickers(stickers, target):
    t = len(target)
    full = (1 << t) - 1
    dp = [-1] * (1 << t)
    dp[0] = 0
    for mask in range(1 << t):
        if dp[mask] < 0 or mask == full:
            continue
        first = next(i for i in range(t) if not mask >> i & 1)
        for s in stickers:
            if target[first] not in s:
                continue                      # 補不到第一個空位,先不考慮
            nxt = mask
            for ch in s:
                for i in range(t):
                    if not nxt >> i & 1 and target[i] == ch:
                        nxt |= 1 << i         # 填進最左邊相同字母的空位
                        break
            if dp[nxt] < 0 or dp[nxt] > dp[mask] + 1:
                dp[nxt] = dp[mask] + 1
    return dp[full]`,
        c: `int minStickers(char **stickers, int stickersSize, char *target) {
    int t = strlen(target), full = 1 << t;
    int *dp = malloc(full * sizeof(int));
    for (int i = 0; i < full; i++) dp[i] = -1;
    dp[0] = 0;
    for (int mask = 0; mask < full; mask++) {
        if (dp[mask] < 0) continue;
        int first = 0;
        while (first < t && (mask >> first & 1)) first++;
        if (first == t) continue;
        for (int k = 0; k < stickersSize; k++) {
            if (!strchr(stickers[k], target[first])) continue;
            int nxt = mask;
            for (char *p = stickers[k]; *p; p++)
                for (int i = 0; i < t; i++)
                    if (!(nxt >> i & 1) && target[i] == *p) { nxt |= 1 << i; break; }
            if (dp[nxt] < 0 || dp[nxt] > dp[mask] + 1) dp[nxt] = dp[mask] + 1;
        }
    }
    int ans = dp[full - 1];
    free(dp);
    return ans;
}`,
        cpp: `int minStickers(vector<string>& stickers, string target) {
    int t = target.size(), full = (1 << t) - 1;
    vector<int> dp(1 << t, -1);
    dp[0] = 0;
    for (int mask = 0; mask <= full; mask++) {
        if (dp[mask] < 0 || mask == full) continue;
        int first = 0;
        while (mask >> first & 1) first++;
        for (auto &s : stickers) {
            if (s.find(target[first]) == string::npos) continue;
            int nxt = mask;
            for (char ch : s)
                for (int i = 0; i < t; i++)
                    if (!(nxt >> i & 1) && target[i] == ch) { nxt |= 1 << i; break; }
            if (dp[nxt] < 0 || dp[nxt] > dp[mask] + 1) dp[nxt] = dp[mask] + 1;
        }
    }
    return dp[full];
}`,
        java: `int minStickers(String[] stickers, String target) {
    int t = target.length(), full = (1 << t) - 1;
    int[] dp = new int[1 << t];
    Arrays.fill(dp, -1);
    dp[0] = 0;
    for (int mask = 0; mask <= full; mask++) {
        if (dp[mask] < 0 || mask == full) continue;
        int first = 0;
        while ((mask >> first & 1) == 1) first++;
        for (String s : stickers) {
            if (s.indexOf(target.charAt(first)) < 0) continue;
            int nxt = mask;
            for (char ch : s.toCharArray())
                for (int i = 0; i < t; i++)
                    if ((nxt >> i & 1) == 0 && target.charAt(i) == ch) { nxt |= 1 << i; break; }
            if (dp[nxt] < 0 || dp[nxt] > dp[mask] + 1) dp[nxt] = dp[mask] + 1;
        }
    }
    return dp[full];
}`,
        javascript: `function minStickers(stickers, target) {
  const t = target.length, full = (1 << t) - 1, dp = new Array(1 << t).fill(-1);
  dp[0] = 0;
  for (let mask = 0; mask <= full; mask++) {
    if (dp[mask] < 0 || mask === full) continue;
    let first = 0;
    while ((mask >> first) & 1) first++;
    for (const s of stickers) {
      if (!s.includes(target[first])) continue;
      let nxt = mask;
      for (const ch of s)
        for (let i = 0; i < t; i++)
          if (!((nxt >> i) & 1) && target[i] === ch) {
            nxt |= 1 << i;
            break;
          }
      if (dp[nxt] < 0 || dp[nxt] > dp[mask] + 1) dp[nxt] = dp[mask] + 1;
    }
  }
  return dp[full];
}`,
      },
    },
  ],
  pitfalls: ['每一層試所有貼紙(不剪枝):狀態雖然一樣,但分支多到超時', '缺口字串沒排序就當記憶化的 key:同一個缺口會被當成不同狀態', '有字母任何貼紙都沒有時要回傳 −1,別回傳 ∞'],
  check: {
    kind: 'fn',
    fn: 'minStickers',
    cases: [
      { args: [ST, T], out: 3 },
      { args: [['notice', 'possible'], 'basicbasic'], out: -1 },
      { args: [['these', 'guess', 'about', 'garden', 'him'], 'atomher'], out: 3 },
      { args: [['a', 'b'], 'aabb'], out: 4 },
    ],
  },
}

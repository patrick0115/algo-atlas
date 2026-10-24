import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1639. Number of Ways to Form a Target String Given a Dictionary

const WORDS = ['acca', 'bbbb', 'caca']
const TARGET = 'aba'

function dpFig(): FigStep[] {
  const L = WORDS[0].length
  const cnt = Array.from({ length: L }, (_, k) => {
    const m: Record<string, number> = {}
    for (const w of WORDS) m[w[k]] = (m[w[k]] ?? 0) + 1
    return m
  })
  const t = TARGET.length
  const dp = Array.from({ length: t + 1 }, () => Array(L + 1).fill(0))
  for (let k = 0; k <= L; k++) dp[0][k] = 1
  for (let i = 1; i <= t; i++) for (let k = 1; k <= L; k++) dp[i][k] = dp[i][k - 1] + dp[i - 1][k - 1] * (cnt[k - 1][TARGET[i - 1]] ?? 0)
  const grid: GridViewData = { kind: 'grid', label: 'dp[i][k](列 = 拼了 target 前 i 個、欄 = 用到前 k 欄)', cells: dp, marks: { hl: [[t, L]] } }
  return [
    { note: '所有字串等長,看成一張表:每一「欄」k 是所有字串的第 k 個字元。拼 target 時,每個字元都要從**更右邊的欄**拿,而且拿了第 k 欄後,左邊(含 k)的欄全部作廢', views: [arr(WORDS, { label: 'words' })] },
    { note: '只在乎每一欄裡各字母出現幾次:cnt[k][c]。例如第 0 欄有 a、b、c 各 1 個', views: cnt.map((m, k) => arr(Object.entries(m).map(([c, v]) => `${c}×${v}`), { label: `第 ${k} 欄` })) },
    { note: '`dp[i][k]` = 用前 k 欄拼出 target 前 i 個字的方法數。第 k 欄不用 → dp[i][k−1];用來拼 target[i−1] → dp[i−1][k−1] × cnt[k−1][target[i−1]]', views: [grid] },
    { note: `答案 dp[${t}][${L}] = ${dp[t][L]}`, views: [arr([dp[t][L]], { label: '答案', done: [0] })] },
  ]
}

function rollFig(): FigStep[] {
  return [
    { note: '換個迴圈順序:外層跑欄 k,內層跑 target 的位置 i(**由大到小**),一維 `dp[i]` 就夠了(像 0/1 背包)', views: [arr(['dp[i] += dp[i−1] × cnt[k][target[i−1]]'], { label: 'i 由 t 往 1' })] },
    { note: '每一欄最多用一次,倒著更新時,dp[i−1] 還是上一欄的值,保證同一欄不會同時拿來拼 target 的兩個位置', views: [arr([6], { label: '答案', done: [0] })] },
  ]
}

export const q1639: Solution = {
  id: 1639,
  plain: '有幾個一樣長的字串和一個目標字串。要從左到右一個字一個字拼出目標:每次可以從任一個字串的第 k 個位置拿字,但拿過之後,所有字串第 k 個位置(含)以左都不能再用。有幾種拼法?答案取餘 10⁹ + 7。',
  statement: '給等長字串陣列 `words` 和字串 `target`。從左到右組成 target:第 i 個字元可取自任一 `words[j][k]`(需等於 target[i]),之後所有字串中索引 ≤ k 的字元都不能再使用。回傳組成 target 的方法數,對 10⁹ + 7 取餘。',
  examples: [
    { input: 'words = ["acca","bbbb","caca"], target = "aba"', output: '6' },
    { input: 'words = ["abba","baab"], target = "bab"', output: '4' },
  ],
  constraints: ['words.length、字串長度、target 長度 ≤ 1000'],
  insight: ['同一欄裡選哪個字串不影響之後 → 先壓成「每欄每字母的次數」', '狀態:拼到 target 第 i 個、用到第 k 欄', '[[p:dp-general]]:`dp[i][k] = dp[i][k−1] + dp[i−1][k−1] × cnt[k−1][target[i−1]]`'],
  approaches: [
    {
      name: '欄計數 + 二維 DP',
      idea: '`cnt[k][c]`;`dp[0][*] = 1`;`dp[i][k] = dp[i][k−1] + dp[i−1][k−1] × cnt[k−1][t[i−1]]`。',
      steps: ['統計 `cnt[k][c]`', '`dp[0][k] = 1`(空 target 一種)', '`for i in 1..t`、`for k in 1..L`:套轉移式取餘', '回傳 `dp[t][L]`'],
      figure: { title: `words = [${WORDS.map((w) => `"${w}"`).join(', ')}],target = "${TARGET}"`, steps: dpFig() },
      complexity: { time: 'O(m · L + t · L)', space: 'O(t · L)', why: 'm 個字串統計 + t × L 個狀態。' },
      verdict: '最推薦;先壓縮資料再 DP,狀態數從「選了哪個字串」降到「次數」。',
      code: {
        python: `def numWays(words, target):
    MOD = 10 ** 9 + 7
    L, t = len(words[0]), len(target)
    cnt = [[0] * 26 for _ in range(L)]
    for w in words:
        for k, ch in enumerate(w):
            cnt[k][ord(ch) - 97] += 1         # 第 k 欄有幾個這個字母
    dp = [[0] * (L + 1) for _ in range(t + 1)]
    for k in range(L + 1):
        dp[0][k] = 1
    for i in range(1, t + 1):
        c = ord(target[i - 1]) - 97
        for k in range(1, L + 1):
            dp[i][k] = (dp[i][k - 1]                       # 第 k 欄不用
                        + dp[i - 1][k - 1] * cnt[k - 1][c]) % MOD   # 用第 k 欄拼 target[i-1]
    return dp[t][L]`,
        c: `int numWays(char **words, int wordsSize, char *target) {
    const long long MOD = 1000000007;
    int L = strlen(words[0]), t = strlen(target);
    int (*cnt)[26] = calloc(L, sizeof *cnt);
    for (int j = 0; j < wordsSize; j++) for (int k = 0; k < L; k++) cnt[k][words[j][k] - 'a']++;
    long long *prev = malloc((L + 1) * sizeof(long long)), *cur = malloc((L + 1) * sizeof(long long));
    for (int k = 0; k <= L; k++) prev[k] = 1;
    for (int i = 1; i <= t; i++) {
        int c = target[i - 1] - 'a';
        cur[0] = 0;
        for (int k = 1; k <= L; k++) cur[k] = (cur[k - 1] + prev[k - 1] * cnt[k - 1][c]) % MOD;
        long long *tmp = prev; prev = cur; cur = tmp;
    }
    int ans = (int)prev[L];
    free(cnt); free(prev); free(cur);
    return ans;
}`,
        cpp: `int numWays(vector<string>& words, string target) {
    const long long MOD = 1e9 + 7;
    int L = words[0].size(), t = target.size();
    vector<array<long long, 26>> cnt(L);
    for (auto &c : cnt) c.fill(0);
    for (auto &w : words) for (int k = 0; k < L; k++) cnt[k][w[k] - 'a']++;
    vector<vector<long long>> dp(t + 1, vector<long long>(L + 1, 0));
    for (int k = 0; k <= L; k++) dp[0][k] = 1;
    for (int i = 1; i <= t; i++) {
        int c = target[i - 1] - 'a';
        for (int k = 1; k <= L; k++) dp[i][k] = (dp[i][k - 1] + dp[i - 1][k - 1] * cnt[k - 1][c]) % MOD;
    }
    return dp[t][L];
}`,
        java: `int numWays(String[] words, String target) {
    final long MOD = 1_000_000_007;
    int L = words[0].length(), t = target.length();
    long[][] cnt = new long[L][26];
    for (String w : words) for (int k = 0; k < L; k++) cnt[k][w.charAt(k) - 'a']++;
    long[][] dp = new long[t + 1][L + 1];
    for (int k = 0; k <= L; k++) dp[0][k] = 1;
    for (int i = 1; i <= t; i++) {
        int c = target.charAt(i - 1) - 'a';
        for (int k = 1; k <= L; k++) dp[i][k] = (dp[i][k - 1] + dp[i - 1][k - 1] * cnt[k - 1][c]) % MOD;
    }
    return (int) dp[t][L];
}`,
        javascript: `function numWays(words, target) {
  const MOD = 1000000007n, L = words[0].length, t = target.length;
  const cnt = Array.from({ length: L }, () => new Array(26).fill(0n));
  for (const w of words) for (let k = 0; k < L; k++) cnt[k][w.charCodeAt(k) - 97]++;
  let prev = new Array(L + 1).fill(1n);
  for (let i = 1; i <= t; i++) {
    const c = target.charCodeAt(i - 1) - 97, cur = new Array(L + 1).fill(0n);
    for (let k = 1; k <= L; k++) cur[k] = (cur[k - 1] + prev[k - 1] * cnt[k - 1][c]) % MOD;
    prev = cur;
  }
  return Number(prev[L]);
}`,
      },
    },
    {
      name: '一維 DP(欄在外層,倒著更新)',
      idea: '`dp[i]` = 拼出前 i 個字的方法數;依序處理每一欄 k,`for i in t..1`:`dp[i] += dp[i−1] × cnt[k][t[i−1]]`。',
      steps: ['`dp = [1] + [0] * t`', '`for k in 0..L−1`', '`for i in t..1`(倒著):`dp[i] = (dp[i] + dp[i−1] × cnt[k][target[i−1]]) % MOD`', '回傳 `dp[t]`'],
      figure: { title: `words = [${WORDS.map((w) => `"${w}"`).join(', ')}],target = "${TARGET}"`, steps: rollFig() },
      complexity: { time: 'O(m · L + t · L)', space: 'O(t + 26L)', why: '一維 dp。' },
      verdict: '本質上是 0/1 背包:每一欄是一個「物品」,最多用一次。',
      code: {
        python: `def numWays(words, target):
    MOD = 10 ** 9 + 7
    L, t = len(words[0]), len(target)
    dp = [1] + [0] * t                        # dp[i]:拼出 target[:i] 的方法數
    for k in range(L):
        cnt = [0] * 26
        for w in words:
            cnt[ord(w[k]) - 97] += 1
        for i in range(t, 0, -1):             # 倒著更新:這一欄只用一次
            dp[i] = (dp[i] + dp[i - 1] * cnt[ord(target[i - 1]) - 97]) % MOD
    return dp[t]`,
        c: `int numWays(char **words, int wordsSize, char *target) {
    const long long MOD = 1000000007;
    int L = strlen(words[0]), t = strlen(target);
    long long *dp = calloc(t + 1, sizeof(long long));
    dp[0] = 1;
    for (int k = 0; k < L; k++) {
        long long cnt[26] = {0};
        for (int j = 0; j < wordsSize; j++) cnt[words[j][k] - 'a']++;
        for (int i = t; i >= 1; i--) dp[i] = (dp[i] + dp[i - 1] * cnt[target[i - 1] - 'a']) % MOD;
    }
    int ans = (int)dp[t];
    free(dp);
    return ans;
}`,
        cpp: `int numWays(vector<string>& words, string target) {
    const long long MOD = 1e9 + 7;
    int L = words[0].size(), t = target.size();
    vector<long long> dp(t + 1, 0);
    dp[0] = 1;
    for (int k = 0; k < L; k++) {
        long long cnt[26] = {0};
        for (auto &w : words) cnt[w[k] - 'a']++;
        for (int i = t; i >= 1; i--) dp[i] = (dp[i] + dp[i - 1] * cnt[target[i - 1] - 'a']) % MOD;
    }
    return dp[t];
}`,
        java: `int numWays(String[] words, String target) {
    final long MOD = 1_000_000_007;
    int L = words[0].length(), t = target.length();
    long[] dp = new long[t + 1];
    dp[0] = 1;
    for (int k = 0; k < L; k++) {
        long[] cnt = new long[26];
        for (String w : words) cnt[w.charAt(k) - 'a']++;
        for (int i = t; i >= 1; i--) dp[i] = (dp[i] + dp[i - 1] * cnt[target.charAt(i - 1) - 'a']) % MOD;
    }
    return (int) dp[t];
}`,
        javascript: `function numWays(words, target) {
  const MOD = 1000000007n, L = words[0].length, t = target.length;
  const dp = new Array(t + 1).fill(0n);
  dp[0] = 1n;
  for (let k = 0; k < L; k++) {
    const cnt = new Array(26).fill(0n);
    for (const w of words) cnt[w.charCodeAt(k) - 97]++;
    for (let i = t; i >= 1; i--) dp[i] = (dp[i] + dp[i - 1] * cnt[target.charCodeAt(i - 1) - 97]) % MOD;
  }
  return Number(dp[t]);
}`,
      },
    },
  ],
  pitfalls: ['直接對「選哪個字串」做搜尋:分支數爆炸;先壓成每欄的字母次數', '一維 DP 順著更新:同一欄會被用兩次', 'target 比字串長時答案是 0(DP 自然會得到 0)'],
  check: {
    kind: 'fn',
    fn: 'numWays',
    cases: [
      { args: [WORDS, TARGET], out: 6 },
      { args: [['abba', 'baab'], 'bab'], out: 4 },
      { args: [['abcd'], 'abcd'], out: 1 },
      { args: [['abab', 'baba', 'abba', 'baab'], 'abba'], out: 16 },
    ],
  },
}

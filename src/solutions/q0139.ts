import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 139. Word Break

const S = 'catsandog'
const S2 = 'applepenapple'
const DICT2 = ['apple', 'pen']

function dpFig(s: string, dict: string[]): FigStep[] {
  const n = s.length
  const set = new Set(dict)
  const dp: (string | boolean)[] = Array(n + 1).fill('?')
  dp[0] = true
  const chars = [...s]
  const show = () => dp.map((v) => (v === true ? '✓' : v === false ? '✗' : '?'))
  const out: FigStep[] = [{ note: 'dp[i] = 前 i 個字(s[0..i−1])能不能切成字典裡的字。dp[0] = ✓(空字串)。dp[i] = ✓ 當且僅當:存在 j,dp[j] 是 ✓,而且 s[j..i−1] 在字典裡', views: [arr(chars, { label: 's' }), kv(dict.map((w) => [w, '✓']), '字典'), arr(show(), { label: 'dp[0..n]' })] }]
  for (let i = 1; i <= n; i++) {
    let found = -1
    for (let j = 0; j < i; j++)
      if (dp[j] === true && set.has(s.slice(j, i))) {
        found = j
        break
      }
    dp[i] = found >= 0
    out.push({
      note: found >= 0 ? `dp[${i}]:dp[${found}] 是 ✓,而且 "${s.slice(found, i)}" 在字典 → ✓` : `dp[${i}]:找不到任何 j 讓「dp[j] ✓ 且 s[j..${i - 1}] 在字典」→ ✗`,
      views: [arr(chars, { label: 's', range: found >= 0 ? [found, i - 1] : [0, i - 1], highlight: found >= 0 ? range(found, i - 1) : [] }), arr(show(), { label: 'dp', highlight: [i], compare: found >= 0 ? [found] : [] })],
    })
  }
  out.push({ note: `dp[${n}] = ${dp[n] ? '✓ → true' : '✗ → false'}`, views: [arr(show(), { label: 'dp', done: dp[n] === true ? [n] : [] })] })
  return out
}

function bfsFig(): FigStep[] {
  const set = new Set(DICT2)
  const seen = new Set<number>([0])
  let q = [0]
  const out: FigStep[] = [{ note: '把「切到第幾個字」當成節點:從位置 0 出發,如果 s[i..j−1] 在字典裡,就能從 i 走到 j。問題變成「能不能從 0 走到 n」→ BFS', views: [arr([...S2], { label: 's', highlight: [0] })] }]
  while (q.length) {
    const next: number[] = []
    for (const i of q)
      for (let j = i + 1; j <= S2.length; j++)
        if (!seen.has(j) && set.has(S2.slice(i, j))) {
          seen.add(j)
          next.push(j)
        }
    if (!next.length) break
    out.push({ note: `從 ${q.join('、')} 出發,能用一個字典字走到 ${next.join('、')}${next.includes(S2.length) ? `,其中 ${S2.length} 就是結尾 → true` : ''}`, views: [arr([...S2], { label: 's', highlight: next.filter((x) => x < S2.length) })] })
    if (next.includes(S2.length)) break
    q = next
  }
  return out
}

export const q0139: Solution = {
  id: 139,
  plain: '給一個沒有空格的長字串和一本字典,問能不能把字串切成好幾段,**每一段都是字典裡的字**(字可以重複用)。像把 "applepenapple" 切成 apple|pen|apple。',
  statement: '給字串 `s` 和字串陣列 `wordDict`,判斷 s 能不能被切成一個或多個字典中的單字(單字可以重複使用)。',
  examples: [
    { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true' },
    { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true' },
    { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: 'false' },
  ],
  constraints: ['`s.length ≤ 300`,字典最多 1000 個字、每個長度 ≤ 20'],
  insight: [
    '直接回溯(每個位置試所有字典字)最壞是指數時間:`"aaaa…ab"`、字典 `["a","aa","aaa"]` 會試非常多種切法',
    '但很多切法最後都走到同一個位置 —— 「從位置 i 開始的後半段能不能切」只和 i 有關 → 重複子問題 → **DP**',
    '`dp[i]` = 前 i 個字能不能切好。`dp[i] = 存在 j < i,使 dp[j] 且 s[j:i] 在字典`',
    '也可以想成圖:位置是節點,字典字是邊,問 0 能不能走到 n → BFS',
  ],
  approaches: [
    {
      name: '一維 DP',
      idea: '`dp[0] = True`。對每個 i,試所有切點 j:`dp[j]` 是 True 而且 `s[j:i]` 在字典 → `dp[i] = True`。',
      steps: ['`words = set(wordDict)`', '`dp = [True] + [False] * n`', '`for i in 1..n`:`for j in 0..i−1`:`dp[j] and s[j:i] in words` → `dp[i] = True`,break', '回傳 `dp[n]`'],
      figure: { title: `s = "${S}", wordDict = ["cats","dog","sand","and","cat"]`, steps: dpFig(S, ['cats', 'dog', 'sand', 'and', 'cat']) },
      complexity: { time: 'O(n² · L)', space: 'O(n)', why: 'n² 個 (j, i),每個切出子字串並查詢 O(L)(L 是子字串長度)。可以只試長度 ≤ 最長字典字的 j 來加速。' },
      verdict: '標準解,[[p:dp-1d]]的經典「切割型」:dp[i] 看「最後一段」從哪裡切。',
      code: {
        python: `def wordBreak(s, wordDict):
    words = set(wordDict)
    n = len(s)
    dp = [True] + [False] * n             # dp[i]:前 i 個字能不能切好
    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words: # 前 j 個切好了,最後一段 s[j:i] 是字典字
                dp[i] = True
                break
    return dp[n]`,
        c: `bool wordBreak(char *s, char **wordDict, int wordDictSize) {
    int n = strlen(s);
    bool *dp = calloc(n + 1, sizeof(bool));
    dp[0] = true;
    for (int i = 1; i <= n; i++)
        for (int k = 0; k < wordDictSize && !dp[i]; k++) {
            int len = strlen(wordDict[k]);      // 改成「試每個字典字當最後一段」
            if (len <= i && dp[i - len] && strncmp(s + i - len, wordDict[k], len) == 0) dp[i] = true;
        }
    bool ok = dp[n];
    free(dp);
    return ok;
}`,
        cpp: `bool wordBreak(string s, vector<string>& wordDict) {
    unordered_set<string> words(wordDict.begin(), wordDict.end());
    int n = s.size();
    vector<bool> dp(n + 1, false);
    dp[0] = true;
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < i; j++)
            if (dp[j] && words.count(s.substr(j, i - j))) { dp[i] = true; break; }
    return dp[n];
}`,
        java: `boolean wordBreak(String s, List<String> wordDict) {
    Set<String> words = new HashSet<>(wordDict);
    int n = s.length();
    boolean[] dp = new boolean[n + 1];
    dp[0] = true;
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < i; j++)
            if (dp[j] && words.contains(s.substring(j, i))) { dp[i] = true; break; }
    return dp[n];
}`,
        javascript: `function wordBreak(s, wordDict) {
  const words = new Set(wordDict), n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= n; i++)
    for (let j = 0; j < i; j++)
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
  return dp[n];
}`,
      },
    },
    {
      name: 'BFS:位置當節點',
      idea: '從位置 0 開始,能用一個字典字從 i 跳到 j 就是一條邊。BFS 走到 n 就是 true。走過的位置不再處理(這就是記憶化)。',
      steps: ['`q = [0]`、`seen = {0}`', '拿出 i:對每個 `j in i+1..n`:`s[i:j]` 在字典且 j 沒看過 → 放進佇列', '走到 n → true;佇列空了 → false'],
      figure: { title: `s = "${S2}", wordDict = [${DICT2.map((w) => `"${w}"`).join(',')}]`, steps: bfsFig() },
      complexity: { time: 'O(n² · L)', space: 'O(n)', why: '每個位置最多處理一次,每次試 n 個終點。' },
      verdict: '和 DP 等價(BFS 的 seen = DP 的已知狀態),換成圖的角度思考。',
      code: {
        python: `from collections import deque

def wordBreak(s, wordDict):
    words = set(wordDict)
    n = len(s)
    seen = {0}
    q = deque([0])
    while q:
        i = q.popleft()
        if i == n:
            return True
        for j in range(i + 1, n + 1):
            if j not in seen and s[i:j] in words:
                seen.add(j)
                q.append(j)
    return False`,
        c: `bool wordBreak(char *s, char **wordDict, int wordDictSize) {
    int n = strlen(s), *q = malloc((n + 1) * sizeof(int)), head = 0, tail = 0;
    bool *seen = calloc(n + 1, sizeof(bool)), ok = false;
    q[tail++] = 0; seen[0] = true;
    while (head < tail && !ok) {
        int i = q[head++];
        if (i == n) { ok = true; break; }
        for (int k = 0; k < wordDictSize; k++) {
            int len = strlen(wordDict[k]), j = i + len;
            if (j <= n && !seen[j] && strncmp(s + i, wordDict[k], len) == 0) { seen[j] = true; q[tail++] = j; }
        }
    }
    free(q); free(seen);
    return ok;
}`,
        cpp: `bool wordBreak(string s, vector<string>& wordDict) {
    unordered_set<string> words(wordDict.begin(), wordDict.end());
    int n = s.size();
    vector<bool> seen(n + 1, false);
    queue<int> q;
    q.push(0);
    seen[0] = true;
    while (!q.empty()) {
        int i = q.front(); q.pop();
        if (i == n) return true;
        for (int j = i + 1; j <= n; j++)
            if (!seen[j] && words.count(s.substr(i, j - i))) { seen[j] = true; q.push(j); }
    }
    return false;
}`,
        java: `boolean wordBreak(String s, List<String> wordDict) {
    Set<String> words = new HashSet<>(wordDict);
    int n = s.length();
    boolean[] seen = new boolean[n + 1];
    Deque<Integer> q = new ArrayDeque<>();
    q.offer(0);
    seen[0] = true;
    while (!q.isEmpty()) {
        int i = q.poll();
        if (i == n) return true;
        for (int j = i + 1; j <= n; j++)
            if (!seen[j] && words.contains(s.substring(i, j))) { seen[j] = true; q.offer(j); }
    }
    return false;
}`,
        javascript: `function wordBreak(s, wordDict) {
  const words = new Set(wordDict), n = s.length;
  const seen = new Array(n + 1).fill(false);
  const q = [0];
  seen[0] = true;
  for (let h = 0; h < q.length; h++) {
    const i = q[h];
    if (i === n) return true;
    for (let j = i + 1; j <= n; j++)
      if (!seen[j] && words.has(s.slice(i, j))) {
        seen[j] = true;
        q.push(j);
      }
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: [
    '貪心地一直切最長(或最短)的字:`"cars"`、字典 `["car","ca","rs"]`,先切 car 會剩 s 切不下去,但 ca|rs 可以',
    '不加記憶化的回溯:`"aaaaaaaaaaaaaaaaaaaab"` 會超時',
    'dp[0] 要是 True(空字串可以被切好),不然什麼都推不出來',
  ],
  followUp: [{ q: '要列出所有切法?', a: '140. Word Break II:回溯 + 記憶化(每個位置存「後半段的所有切法」),答案本身可能是指數個。' }],
  check: {
    kind: 'fn',
    fn: 'wordBreak',
    cases: [
      { args: ['leetcode', ['leet', 'code']], out: true },
      { args: [S2, DICT2], out: true },
      { args: [S, ['cats', 'dog', 'sand', 'and', 'cat']], out: false },
      { args: ['cars', ['car', 'ca', 'rs']], out: true },
      { args: ['aaaaaaaaaaaaaaaaaaab', ['a', 'aa', 'aaa', 'aaaa']], out: false },
    ],
  },
}

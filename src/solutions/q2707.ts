import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2707. Extra Characters in a String

const S = 'leetscode'
const DICT = ['leet', 'code', 'leetcode']

function dpFig(): FigStep[] {
  const n = S.length
  const set = new Set(DICT)
  const dp = Array(n + 1).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    dp[i] = dp[i + 1] + 1
    for (let j = i + 1; j <= n; j++) if (set.has(S.slice(i, j))) dp[i] = Math.min(dp[i], dp[j])
  }
  return [
    { note: '把字串切成若干段,屬於字典的段「免費」,不在字典裡的字元各算 1 個多餘字元。求最少的多餘字元數', views: [arr(S.split(''), { label: 's' }), arr(DICT, { label: 'dictionary' })] },
    { note: '`dp[i]` = 處理 s[i..] 最少剩幾個多餘字元。選擇 ①:s[i] 當多餘 → dp[i+1] + 1;② 若 s[i..j) 在字典裡 → dp[j]', views: [arr(dp, { label: 'dp[0..n]' })] },
    { note: `"leet" + "s"(多餘)+ "code" → 答案 ${dp[0]}`, views: [arr(S.split(''), { label: '切法', done: [0, 1, 2, 3, 5, 6, 7, 8], dim: [4] }), arr([dp[0]], { label: '答案', done: [0] })] },
  ]
}

function trieFig(): FigStep[] {
  return [
    { note: '用切片查集合每次要 O(L);改成字典樹:從 i 開始沿著 Trie 往下走,每走到一個「詞的結尾」j,就能用 dp[j + 1] 更新', views: [arr(['l-e-e-t*', 'c-o-d-e*', 'l-e-e-t-c-o-d-e*'], { label: 'Trie(* = 詞尾)' })] },
    { note: '走不下去(Trie 沒有這個字元)就提早停,不用試所有 j', views: [arr([1], { label: '答案', done: [0] })] },
  ]
}

export const q2707: Solution = {
  id: 2707,
  plain: '給一個字串和一本字典。把字串切成好幾段,在字典裡的段就沒事,剩下沒被任何字典單字用到的字元叫「多餘字元」。最少會有幾個多餘字元?',
  statement: '給字串 `s` 和字串陣列 `dictionary`。把 s 切成若干個不重疊的子字串,每個子字串都要在 dictionary 中;s 中不屬於任何子字串的字元為**多餘字元**。回傳最少的多餘字元數。',
  examples: [
    { input: 's = "leetscode", dictionary = ["leet","code","leetcode"]', output: '1', note: '"leet" + "s" + "code"' },
    { input: 's = "sayhelloworld", dictionary = ["hello","world"]', output: '3', note: '"say" 是多餘的' },
  ],
  constraints: ['s.length ≤ 50,字典 ≤ 50 個詞'],
  insight: ['每個位置只有兩種選擇:這個字元丟掉,或從這裡開始配一個字典詞', '[[p:dp-1d]]:`dp[i] = min(dp[i+1] + 1, dp[j] for s[i:j] in dict)`', '和 [139](#/q/139) Word Break 同一結構,只是改成「最小化丟掉的字元」'],
  approaches: [
    {
      name: '由後往前 DP + 集合',
      idea: '`dp[n] = 0`;`dp[i] = dp[i+1] + 1`,再對每個 j:`s[i:j] in dict` → `dp[i] = min(dp[i], dp[j])`。',
      steps: ['`words = set(dictionary)`、`dp = [0] * (n + 1)`', '`for i in n−1..0`:`dp[i] = dp[i + 1] + 1`', '`for j in i+1..n`:`s[i:j] in words` → `dp[i] = min(dp[i], dp[j])`', '回傳 dp[0]'],
      figure: { title: `s = "${S}"`, steps: dpFig() },
      complexity: { time: 'O(n³)', space: 'O(n + 字典大小)', why: 'n² 個 (i, j),每次切片 + 雜湊 O(n)。n ≤ 50 很小。' },
      verdict: '最推薦,題目規模很小,直接寫最清楚。',
      code: {
        python: `def minExtraChar(s, dictionary):
    words = set(dictionary)
    n = len(s)
    dp = [0] * (n + 1)                        # dp[i]:s[i:] 最少的多餘字元
    for i in range(n - 1, -1, -1):
        dp[i] = dp[i + 1] + 1                 # s[i] 當多餘字元
        for j in range(i + 1, n + 1):
            if s[i:j] in words:
                dp[i] = min(dp[i], dp[j])     # s[i:j] 是字典詞,免費
    return dp[0]`,
        c: `// C 沒有內建集合：改成對每個 i 逐一比對字典詞，時間 O(n · 字典總長)
int minExtraChar(char *s, char **dictionary, int dictionarySize) {
    int n = strlen(s), dp[51];
    dp[n] = 0;
    for (int i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1;
        for (int k = 0; k < dictionarySize; k++) {
            int L = strlen(dictionary[k]);
            if (i + L <= n && !strncmp(s + i, dictionary[k], L) && dp[i + L] < dp[i]) dp[i] = dp[i + L];
        }
    }
    return dp[0];
}`,
        cpp: `int minExtraChar(string s, vector<string>& dictionary) {
    unordered_set<string> words(dictionary.begin(), dictionary.end());
    int n = s.size();
    vector<int> dp(n + 1, 0);
    for (int i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1;
        for (int j = i + 1; j <= n; j++)
            if (words.count(s.substr(i, j - i))) dp[i] = min(dp[i], dp[j]);
    }
    return dp[0];
}`,
        java: `int minExtraChar(String s, String[] dictionary) {
    Set<String> words = new HashSet<>(Arrays.asList(dictionary));
    int n = s.length();
    int[] dp = new int[n + 1];
    for (int i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1;
        for (int j = i + 1; j <= n; j++)
            if (words.contains(s.substring(i, j))) dp[i] = Math.min(dp[i], dp[j]);
    }
    return dp[0];
}`,
        javascript: `function minExtraChar(s, dictionary) {
  const words = new Set(dictionary), n = s.length, dp = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    dp[i] = dp[i + 1] + 1;
    for (let j = i + 1; j <= n; j++) if (words.has(s.slice(i, j))) dp[i] = Math.min(dp[i], dp[j]);
  }
  return dp[0];
}`,
      },
    },
    {
      name: 'DP + 字典樹',
      idea: '字典建成 Trie;`dp[i]` 時從 i 沿 Trie 走,遇到詞尾 j 就 `dp[i] = min(dp[i], dp[j + 1])`,走不下去就停。',
      steps: ['建 Trie', '`for i in n−1..0`:`dp[i] = dp[i + 1] + 1`', '`node = root`;`for j in i..n−1`:沿 `s[j]` 往下,沒有就 break', '`node` 是詞尾 → `dp[i] = min(dp[i], dp[j + 1])`'],
      figure: { title: `s = "${S}"`, steps: trieFig() },
      complexity: { time: 'O(n² + 字典總長)', space: 'O(字典總長)', why: '每個 i 最多沿 Trie 走 n 步,每步 O(1)。' },
      verdict: '[[p:trie]] 讓「從 i 開始的所有字典詞」一次走完,字串很長時差別明顯。',
      code: {
        python: `def minExtraChar(s, dictionary):
    root = {}
    for w in dictionary:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node['$'] = True
    n = len(s)
    dp = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        dp[i] = dp[i + 1] + 1
        node = root
        for j in range(i, n):
            node = node.get(s[j])
            if node is None:
                break                         # Trie 走不下去,後面不可能是字典詞
            if '$' in node:
                dp[i] = min(dp[i], dp[j + 1])
    return dp[0]`,
        c: `typedef struct TNode { struct TNode *ch[26]; bool end; } TNode;

static void freeT(TNode *t) {
    if (!t) return;
    for (int i = 0; i < 26; i++) freeT(t->ch[i]);
    free(t);
}

int minExtraChar(char *s, char **dictionary, int dictionarySize) {
    TNode *root = calloc(1, sizeof(TNode));
    for (int k = 0; k < dictionarySize; k++) {
        TNode *t = root;
        for (char *p = dictionary[k]; *p; p++) {
            if (!t->ch[*p - 'a']) t->ch[*p - 'a'] = calloc(1, sizeof(TNode));
            t = t->ch[*p - 'a'];
        }
        t->end = true;
    }
    int n = strlen(s), dp[51];
    dp[n] = 0;
    for (int i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1;
        TNode *t = root;
        for (int j = i; j < n; j++) {
            t = t->ch[s[j] - 'a'];
            if (!t) break;
            if (t->end && dp[j + 1] < dp[i]) dp[i] = dp[j + 1];
        }
    }
    freeT(root);
    return dp[0];
}`,
        cpp: `struct TNode { TNode *ch[26] = {}; bool end = false; };

int minExtraChar(string s, vector<string>& dictionary) {
    TNode *root = new TNode();
    for (auto &w : dictionary) {
        TNode *t = root;
        for (char c : w) {
            if (!t->ch[c - 'a']) t->ch[c - 'a'] = new TNode();
            t = t->ch[c - 'a'];
        }
        t->end = true;
    }
    int n = s.size();
    vector<int> dp(n + 1, 0);
    for (int i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1;
        TNode *t = root;
        for (int j = i; j < n; j++) {
            t = t->ch[s[j] - 'a'];
            if (!t) break;
            if (t->end) dp[i] = min(dp[i], dp[j + 1]);
        }
    }
    return dp[0];
}`,
        java: `static class TNode { TNode[] ch = new TNode[26]; boolean end; }

int minExtraChar(String s, String[] dictionary) {
    TNode root = new TNode();
    for (String w : dictionary) {
        TNode t = root;
        for (char c : w.toCharArray()) {
            if (t.ch[c - 'a'] == null) t.ch[c - 'a'] = new TNode();
            t = t.ch[c - 'a'];
        }
        t.end = true;
    }
    int n = s.length();
    int[] dp = new int[n + 1];
    for (int i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1;
        TNode t = root;
        for (int j = i; j < n; j++) {
            t = t.ch[s.charAt(j) - 'a'];
            if (t == null) break;
            if (t.end) dp[i] = Math.min(dp[i], dp[j + 1]);
        }
    }
    return dp[0];
}`,
        javascript: `function minExtraChar(s, dictionary) {
  const root = {};
  for (const w of dictionary) {
    let node = root;
    for (const ch of w) node = node[ch] ??= {};
    node.$ = true;
  }
  const n = s.length, dp = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    dp[i] = dp[i + 1] + 1;
    let node = root;
    for (let j = i; j < n; j++) {
      node = node[s[j]];
      if (!node) break;
      if (node.$) dp[i] = Math.min(dp[i], dp[j + 1]);
    }
  }
  return dp[0];
}`,
      },
    },
  ],
  pitfalls: ['貪心地從左邊配最長的字典詞:可能讓後面配不到', '只考慮「配到字典詞」而忘了「把這個字元丟掉」的選項'],
  check: {
    kind: 'fn',
    fn: 'minExtraChar',
    cases: [
      { args: [S, DICT], out: 1 },
      { args: ['sayhelloworld', ['hello', 'world']], out: 3 },
      { args: ['abc', ['d']], out: 3 },
      { args: ['dwmodizxvvbosxxw', ['ox', 'lb', 'diz', 'gu', 'v', 'ksv', 'o', 'nuq', 'r', 'txhe', 'e', 'wmo', 'cehy', 'tskz', 'ds', 'kzbu']], out: 7 },
    ],
  },
}

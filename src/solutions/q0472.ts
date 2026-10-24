import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 472. Concatenated Words

const W = ['cat', 'cats', 'catsdogcats', 'dog', 'dogcatsdog', 'hippopotamuses', 'rat', 'ratcatdogcat']

function dpFig(): FigStep[] {
  const w = 'catsdogcats'
  return [
    { note: '「連接詞」= 能由清單裡**至少兩個**較短的詞拼出來的詞。對每個詞做一次 [139](#/q/139) Word Break 的 DP,字典 = 其他詞', views: [arr(W, { label: 'words' })] },
    { note: `以 "${w}" 為例:dp[i] = 前 i 個字元能不能被拆完。dp[0] = true;dp[3]("cat")、dp[4]("cats")都是 true`, views: [arr(w.split(''), { label: w, range: [0, 3] })] },
    { note: 'dp[7]:dp[4] 為 true 且 "dog" 在字典 → true;dp[11]:dp[7] 為 true 且 "cats" 在字典 → true。整個詞可拆,而且至少用了兩個詞', views: [arr(['cats', 'dog', 'cats'], { label: '拆法', done: [0, 1, 2] })] },
    { note: '技巧:按長度排序,只用「比自己短的詞」當字典,處理完再把自己加進去 → 自動排除「用自己拼自己」', views: [arr(['catsdogcats', 'dogcatsdog', 'ratcatdogcat'], { label: '答案', done: [0, 1, 2] })] },
  ]
}

function trieFig(): FigStep[] {
  return [
    { note: '字典樹版:所有詞放進 Trie。對每個詞從頭沿著 Trie 走,每遇到一個「詞的結尾」就嘗試從下一個位置重新開始', views: [arr(['c-a-t*', 'c-a-t-s*', 'd-o-g*', 'r-a-t*'], { label: 'Trie 裡的詞(* = 結尾)' })] },
    { note: '用 `dfs(i)` = 從 i 開始最多能拆成幾個詞(−1 表示拆不完);最後 `dfs(0) ≥ 2` 就是連接詞。加上記憶化避免重複', views: [arr(['catsdogcats', 'dogcatsdog', 'ratcatdogcat'], { label: '答案', done: [0, 1, 2] })] },
  ]
}

export const q0472: Solution = {
  id: 472,
  plain: '給一串互不相同的單字,找出所有「可以用清單裡其他單字(至少兩個,可以重複用)接起來組成」的單字。',
  statement: '給**不重複**的字串陣列 `words`,回傳其中所有的**連接詞**:由 words 中至少兩個較短的詞(可重複使用)完整串接而成的詞。順序不限。',
  examples: [
    { input: 'words = ["cat","cats","catsdogcats","dog","dogcatsdog","hippopotamuses","rat","ratcatdogcat"]', output: '["catsdogcats","dogcatsdog","ratcatdogcat"]' },
    { input: 'words = ["cat","dog","catdog"]', output: '["catdog"]' },
  ],
  constraints: ['words ≤ 10⁴,每個詞 ≤ 30 字元,總長 ≤ 10⁵'],
  insight: ['每個詞各自是一題 Word Break,字典是「其他詞」', '只有比它短的詞可能是組成零件 → 按長度排序,邊做邊加入字典', '[[p:dp-1d]]:`dp[i] = any(dp[j] and s[j:i] in 字典)`'],
  approaches: [
    {
      name: '按長度排序 + Word Break DP',
      idea: '依長度排序;對每個詞,字典是已處理的(較短)詞,做 Word Break;可拆就加入答案;再把它加入字典。',
      steps: ['`words.sort(key=len)`、`dict = set()`', '每個 w(非空):`dp[0] = True`', '`dp[i] = any(dp[j] and w[j:i] in dict)`', '`dp[len]` → 加入答案;`dict.add(w)`'],
      figure: { title: 'words(8 個)', steps: dpFig() },
      complexity: { time: 'O(Σ L²)', space: 'O(Σ L)', why: '每個詞 O(L²) 的 DP(切片雜湊另計 O(L))。' },
      verdict: '最推薦,把大問題拆成很多個 [139](#/q/139);排序讓「至少兩個詞」自動成立。',
      code: {
        python: `def findAllConcatenatedWordsInADict(words):
    words.sort(key=len)                       # 短的先處理
    seen, res = set(), []
    for w in words:
        if not w:
            continue
        n = len(w)
        dp = [True] + [False] * n
        for i in range(1, n + 1):
            for j in range(i):
                if dp[j] and w[j:i] in seen:  # 只用比自己短的詞
                    dp[i] = True
                    break
        if dp[n]:
            res.append(w)
        seen.add(w)
    return res`,
        c: `// 用排序後的字串陣列 + 二分搜尋當作字典
static char **dictArr;
static int dictN;

static int cmpStr(const void *a, const void *b) { return strcmp(*(char **)a, *(char **)b); }
static int cmpLen(const void *a, const void *b) { return (int)strlen(*(char **)a) - (int)strlen(*(char **)b); }

static bool inDict(const char *s, int len) {
    char buf[31];
    memcpy(buf, s, len); buf[len] = '\\0';
    char *key = buf;
    return bsearch(&key, dictArr, dictN, sizeof(char *), cmpStr) != NULL;
}

char **findAllConcatenatedWordsInADict(char **words, int wordsSize, int *returnSize) {
    char **w = malloc(wordsSize * sizeof(char *));
    memcpy(w, words, wordsSize * sizeof(char *));
    qsort(w, wordsSize, sizeof(char *), cmpLen);
    dictArr = malloc(wordsSize * sizeof(char *)); dictN = 0;
    char **res = malloc(wordsSize * sizeof(char *));
    int cnt = 0;
    for (int k = 0; k < wordsSize; k++) {
        int n = strlen(w[k]);
        if (!n) continue;
        bool dp[31] = {true};
        for (int i = 1; i <= n; i++)
            for (int j = 0; j < i && !dp[i]; j++)
                if (dp[j] && inDict(w[k] + j, i - j)) dp[i] = true;
        if (dp[n]) res[cnt++] = w[k];
        // 插入字典並維持排序(插入排序的一步)
        int p = dictN++;
        while (p > 0 && strcmp(dictArr[p - 1], w[k]) > 0) { dictArr[p] = dictArr[p - 1]; p--; }
        dictArr[p] = w[k];
    }
    free(w); free(dictArr);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<string> findAllConcatenatedWordsInADict(vector<string>& words) {
    sort(words.begin(), words.end(), [](auto &a, auto &b) { return a.size() < b.size(); });
    unordered_set<string> seen;
    vector<string> res;
    for (auto &w : words) {
        int n = w.size();
        if (!n) continue;
        vector<bool> dp(n + 1, false);
        dp[0] = true;
        for (int i = 1; i <= n; i++)
            for (int j = 0; j < i && !dp[i]; j++)
                if (dp[j] && seen.count(w.substr(j, i - j))) dp[i] = true;
        if (dp[n]) res.push_back(w);
        seen.insert(w);
    }
    return res;
}`,
        java: `List<String> findAllConcatenatedWordsInADict(String[] words) {
    Arrays.sort(words, (a, b) -> a.length() - b.length());
    Set<String> seen = new HashSet<>();
    List<String> res = new ArrayList<>();
    for (String w : words) {
        int n = w.length();
        if (n == 0) continue;
        boolean[] dp = new boolean[n + 1];
        dp[0] = true;
        for (int i = 1; i <= n; i++)
            for (int j = 0; j < i && !dp[i]; j++)
                if (dp[j] && seen.contains(w.substring(j, i))) dp[i] = true;
        if (dp[n]) res.add(w);
        seen.add(w);
    }
    return res;
}`,
        javascript: `function findAllConcatenatedWordsInADict(words) {
  words.sort((a, b) => a.length - b.length);
  const seen = new Set(), res = [];
  for (const w of words) {
    const n = w.length;
    if (!n) continue;
    const dp = new Array(n + 1).fill(false);
    dp[0] = true;
    for (let i = 1; i <= n; i++)
      for (let j = 0; j < i && !dp[i]; j++) if (dp[j] && seen.has(w.slice(j, i))) dp[i] = true;
    if (dp[n]) res.push(w);
    seen.add(w);
  }
  return res;
}`,
      },
    },
    {
      name: 'Trie + 記憶化 DFS',
      idea: '全部詞放進 Trie;`dfs(i)` = 從 i 開始最多能拆成幾個詞(−1 表示拆不完):沿 Trie 走,每到一個詞尾 j 就遞迴 `dfs(j + 1)`;最後 `dfs(0) ≥ 2` 就是連接詞。',
      steps: ['建 Trie', '`dfs(i)`:回傳從位置 i 開始最多 / 能否拆成的詞數(記憶化)', '沿 Trie 往下:遇到詞尾 → 嘗試 `dfs(j + 1)`', '整個詞拆得出 ≥ 2 個詞 → 答案'],
      figure: { title: 'words(8 個)', steps: trieFig() },
      complexity: { time: 'O(Σ L²)', space: 'O(Σ L)', why: '每個起點沿 Trie 最多走 L 步;記憶化後每個起點只算一次。' },
      verdict: '不需要切子字串做雜湊;[[p:trie]] 讓「從 i 開始有哪些詞」一次走完。',
      code: {
        python: `def findAllConcatenatedWordsInADict(words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node['$'] = True                      # 詞尾標記

    def count(w):
        n = len(w)
        memo = {}

        def dfs(i):                           # 從 i 開始最多能拆成幾個詞(-1 表示拆不完)
            if i == n:
                return 0
            if i in memo:
                return memo[i]
            best, node = -1, root
            for j in range(i, n):
                node = node.get(w[j])
                if node is None:
                    break
                if '$' in node:
                    r = dfs(j + 1)
                    if r >= 0:
                        best = max(best, r + 1)
            memo[i] = best
            return best

        return dfs(0)

    return [w for w in words if w and count(w) >= 2]`,
        c: `typedef struct Node { struct Node *ch[26]; bool end; } Node;

static Node *newNode(void) { return calloc(1, sizeof(Node)); }

static void freeTrie(Node *t) {
    if (!t) return;
    for (int i = 0; i < 26; i++) freeTrie(t->ch[i]);
    free(t);
}

static Node *root;
static char *W;
static int WN, memo[31];

static int dfs(int i) {
    if (i == WN) return 0;
    if (memo[i] != -2) return memo[i];
    int best = -1;
    Node *t = root;
    for (int j = i; j < WN; j++) {
        t = t->ch[W[j] - 'a'];
        if (!t) break;
        if (t->end) {
            int r = dfs(j + 1);
            if (r >= 0 && r + 1 > best) best = r + 1;
        }
    }
    return memo[i] = best;
}

char **findAllConcatenatedWordsInADict(char **words, int wordsSize, int *returnSize) {
    root = newNode();
    for (int k = 0; k < wordsSize; k++) {
        Node *t = root;
        for (char *p = words[k]; *p; p++) {
            if (!t->ch[*p - 'a']) t->ch[*p - 'a'] = newNode();
            t = t->ch[*p - 'a'];
        }
        t->end = true;
    }
    char **res = malloc(wordsSize * sizeof(char *));
    int cnt = 0;
    for (int k = 0; k < wordsSize; k++) {
        W = words[k]; WN = strlen(W);
        if (!WN) continue;
        for (int i = 0; i <= WN; i++) memo[i] = -2;
        if (dfs(0) >= 2) res[cnt++] = words[k];
    }
    freeTrie(root);
    *returnSize = cnt;
    return res;
}`,
        cpp: `struct TNode { TNode *ch[26] = {}; bool end = false; };

vector<string> findAllConcatenatedWordsInADict(vector<string>& words) {
    TNode *root = new TNode();
    for (auto &w : words) {
        TNode *t = root;
        for (char c : w) {
            if (!t->ch[c - 'a']) t->ch[c - 'a'] = new TNode();
            t = t->ch[c - 'a'];
        }
        t->end = true;
    }
    vector<string> res;
    for (auto &w : words) {
        int n = w.size();
        if (!n) continue;
        vector<int> memo(n + 1, -2);
        function<int(int)> dfs = [&](int i) {
            if (i == n) return 0;
            if (memo[i] != -2) return memo[i];
            int best = -1;
            TNode *t = root;
            for (int j = i; j < n; j++) {
                t = t->ch[w[j] - 'a'];
                if (!t) break;
                if (t->end) {
                    int r = dfs(j + 1);
                    if (r >= 0) best = max(best, r + 1);
                }
            }
            return memo[i] = best;
        };
        if (dfs(0) >= 2) res.push_back(w);
    }
    return res;
}`,
        java: `static class TNode { TNode[] ch = new TNode[26]; boolean end; }

TNode root;
int[] memo;

int dfs(String w, int i) {
    if (i == w.length()) return 0;
    if (memo[i] != -2) return memo[i];
    int best = -1;
    TNode t = root;
    for (int j = i; j < w.length(); j++) {
        t = t.ch[w.charAt(j) - 'a'];
        if (t == null) break;
        if (t.end) {
            int r = dfs(w, j + 1);
            if (r >= 0) best = Math.max(best, r + 1);
        }
    }
    return memo[i] = best;
}

List<String> findAllConcatenatedWordsInADict(String[] words) {
    root = new TNode();
    for (String w : words) {
        TNode t = root;
        for (char c : w.toCharArray()) {
            if (t.ch[c - 'a'] == null) t.ch[c - 'a'] = new TNode();
            t = t.ch[c - 'a'];
        }
        t.end = true;
    }
    List<String> res = new ArrayList<>();
    for (String w : words) {
        if (w.isEmpty()) continue;
        memo = new int[w.length() + 1];
        Arrays.fill(memo, -2);
        if (dfs(w, 0) >= 2) res.add(w);
    }
    return res;
}`,
        javascript: `function findAllConcatenatedWordsInADict(words) {
  const root = {};
  for (const w of words) {
    let node = root;
    for (const ch of w) node = node[ch] ??= {};
    node.$ = true;
  }
  const res = [];
  for (const w of words) {
    const n = w.length;
    if (!n) continue;
    const memo = new Array(n + 1).fill(-2);
    const dfs = (i) => {
      if (i === n) return 0;
      if (memo[i] !== -2) return memo[i];
      let best = -1, node = root;
      for (let j = i; j < n; j++) {
        node = node[w[j]];
        if (!node) break;
        if (node.$) {
          const r = dfs(j + 1);
          if (r >= 0) best = Math.max(best, r + 1);
        }
      }
      return (memo[i] = best);
    };
    if (dfs(0) >= 2) res.push(w);
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['字典包含自己:每個詞都會被當成「自己拼自己」的連接詞', '空字串:dp[0] = True 會讓空字串被誤判', '用遞迴 Word Break 沒記憶化:像 "aaaa…ab" 這種會指數爆炸'],
  check: {
    kind: 'fn',
    fn: 'findAllConcatenatedWordsInADict',
    compare: 'sorted',
    cases: [
      { args: [W], out: ['catsdogcats', 'dogcatsdog', 'ratcatdogcat'] },
      { args: [['cat', 'dog', 'catdog']], out: ['catdog'] },
      { args: [['a', 'aa', 'aaa', 'aaaa']], out: ['aa', 'aaa', 'aaaa'] },
      { args: [['abc']], out: [] },
    ],
  },
}

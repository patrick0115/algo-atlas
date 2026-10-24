import { arr } from '../engine/helpers'
import type { GraphEdge, GraphNode, GraphViewData } from '../types'
import type { FigStep, Solution } from './types'

// 211. Design Add and Search Words Data Structure

const WORDS = ['bad', 'dad', 'mad', 'ban']

interface TN {
  id: string
  ch: string
  end: boolean
  kids: Map<string, TN>
}

function view(root: TN, cls: Record<string, string> = {}): GraphViewData {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  let leaf = 0
  const place = (n: TN, d: number): number => {
    const kids = [...n.kids.values()]
    let x: number
    if (!kids.length) x = leaf++
    else {
      const xs = kids.map((k) => place(k, d + 1))
      x = (xs[0] + xs[xs.length - 1]) / 2
      kids.forEach((k) => edges.push({ from: n.id, to: k.id, directed: true, cls: cls[k.id] === 'hl' ? 'hl' : undefined }))
    }
    nodes.push({ id: n.id, label: n.ch, x: x * 1.1, y: d * 1.1, cls: cls[n.id] ?? (n.end ? 'done' : undefined) })
    return x
  }
  place(root, 0)
  return { kind: 'graph', label: 'Trie(淺色實心 = 單字結尾)', nodes, edges }
}

function build(): TN {
  const root: TN = { id: 'r', ch: '·', end: false, kids: new Map() }
  for (const w of WORDS) {
    let n = root
    for (const c of w) {
      if (!n.kids.has(c)) n.kids.set(c, { id: `${n.id}/${c}`, ch: c, end: false, kids: new Map() })
      n = n.kids.get(c)!
    }
    n.end = true
  }
  return root
}

function dfsFig(pattern: string): FigStep[] {
  const root = build()
  const cls: Record<string, string> = {}
  const out: FigStep[] = [{ note: `search("${pattern}"):一般字母就沿著那個字母往下走;遇到 "." 時,它可以是任何字母 → **每個孩子都試一次**(DFS)`, views: [view(root)] }]
  const go = (n: TN, i: number): boolean => {
    if (i === pattern.length) {
      out.push({ note: `走完 "${pattern}" 了,這個節點${n.end ? '是單字結尾 → 找到!' : '不是單字結尾 → 這條路不行'}`, views: [view(root, { ...cls, [n.id]: n.end ? 'hl' : 'visited' })] })
      return n.end
    }
    const c = pattern[i]
    const tries = c === '.' ? [...n.kids.values()] : n.kids.has(c) ? [n.kids.get(c)!] : []
    if (!tries.length) {
      out.push({ note: `第 ${i} 個字元 "${c}":${c === '.' ? '沒有任何孩子' : `沒有 "${c}" 這個孩子`} → 這條路不行,退回去`, views: [view(root, { ...cls, [n.id]: 'visited' })] })
      return false
    }
    for (const k of tries) {
      cls[k.id] = 'hl'
      out.push({ note: `第 ${i} 個字元 "${c}"${c === '.' ? `:試試 "${k.ch}"` : ':往下走'}`, views: [view(root, { ...cls })] })
      if (go(k, i + 1)) return true
      cls[k.id] = 'dim'
    }
    return false
  }
  go(root, 0)
  return out
}

function listFig(): FigStep[] {
  const p = '.ad'
  return [
    { note: '最簡單:把所有單字存在清單裡。search 時一個一個比:長度要一樣,每一格要嘛相同、要嘛是 "."', views: [arr(WORDS, { label: 'words' })] },
    ...WORDS.map((w, i) => {
      const ok = w.length === p.length && [...p].every((c, j) => c === '.' || c === w[j])
      return { note: `search("${p}") 和 "${w}" 比:${ok ? '每一格都對得上 → true' : '對不上'}`, views: [arr(WORDS, { label: 'words', compare: [i], highlight: ok ? [i] : [] })] }
    }),
  ]
}

export const q0211: Solution = {
  id: 211,
  plain: '做一本可以「模糊查詢」的字典:查詢時 `.` 可以代表任何一個字母,例如查 `.ad` 時 bad、dad、mad 都算找到。',
  statement: '設計 `WordDictionary`:`addWord(word)` 加入單字;`search(word)` 回傳是否有加入過的單字能和 word 配對。word 裡的 `.` 可以配對任何一個字母。',
  examples: [
    {
      input: 'addWord("bad")、addWord("dad")、addWord("mad")、search("pad")、search("bad")、search(".ad")、search("b..")',
      output: 'false、true、true、true',
    },
  ],
  constraints: ['單字長度 ≤ 25,只有小寫字母', 'search 的字串裡最多 2 個 `.`', '最多 10⁴ 次呼叫'],
  insight: [
    '沒有 `.` 的話,就是 [208. Trie](#/q/208) 的 search',
    '`.` 代表「任何一個字母」→ 走到這一格時不知道該走哪個孩子,那就**每個孩子都試**',
    '「每條路都試,走不通就退回來」就是 DFS / 回溯。最多 2 個 `.`,每個最多分 26 路,最壞 26² × 25 步,很快',
  ],
  approaches: [
    {
      name: '清單存單字,逐一比對',
      idea: '把所有單字存起來;search 時和每個單字比:長度相同,而且每一格是 `.` 或字母相同。',
      steps: ['`addWord`:加進清單', '`search(p)`:對每個單字 `w`:`len(w) == len(p)` 且每一格 `p[i] == "." or p[i] == w[i]` → true'],
      figure: { title: `addWord ${WORDS.map((w) => `"${w}"`).join('、')},search(".ad")`, steps: listFig() },
      complexity: { time: 'search O(N·L)', space: 'O(N·L)', why: 'N 個單字,每個比 L 格。單字很多時每次 search 都很慢。' },
      verdict: '好懂但慢。可以改成「依長度分組」稍微加速,但本質還是線性掃描。',
      code: {
        python: `class WordDictionary:
    def __init__(self):
        self.words = []

    def addWord(self, word):
        self.words.append(word)

    def search(self, word):
        for w in self.words:
            if len(w) == len(word) and all(p == '.' or p == c for p, c in zip(word, w)):
                return True
        return False`,
        c: `typedef struct { char **w; int n, cap; } WordDictionary;

WordDictionary *wordDictionaryCreate() {
    WordDictionary *d = malloc(sizeof(WordDictionary));
    d->cap = 16; d->n = 0;
    d->w = malloc(d->cap * sizeof(char *));
    return d;
}

void wordDictionaryAddWord(WordDictionary *d, char *word) {
    if (d->n == d->cap) d->w = realloc(d->w, (d->cap *= 2) * sizeof(char *));
    d->w[d->n++] = strdup(word);
}

bool wordDictionarySearch(WordDictionary *d, char *word) {
    size_t len = strlen(word);
    for (int i = 0; i < d->n; i++) {
        if (strlen(d->w[i]) != len) continue;
        size_t j = 0;
        while (j < len && (word[j] == '.' || word[j] == d->w[i][j])) j++;
        if (j == len) return true;
    }
    return false;
}

void wordDictionaryFree(WordDictionary *d) {
    for (int i = 0; i < d->n; i++) free(d->w[i]);
    free(d->w); free(d);
}`,
        cpp: `class WordDictionary {
    vector<string> words;
public:
    WordDictionary() {}
    void addWord(string word) { words.push_back(word); }
    bool search(string word) {
        for (const string& w : words) {
            if (w.size() != word.size()) continue;
            size_t j = 0;
            while (j < w.size() && (word[j] == '.' || word[j] == w[j])) j++;
            if (j == w.size()) return true;
        }
        return false;
    }
};`,
        java: `class WordDictionary {
    private final List<String> words = new ArrayList<>();

    public WordDictionary() {}
    public void addWord(String word) { words.add(word); }
    public boolean search(String word) {
        outer:
        for (String w : words) {
            if (w.length() != word.length()) continue;
            for (int j = 0; j < w.length(); j++)
                if (word.charAt(j) != '.' && word.charAt(j) != w.charAt(j)) continue outer;
            return true;
        }
        return false;
    }
}`,
        javascript: `class WordDictionary {
  constructor() {
    this.words = [];
  }
  addWord(word) {
    this.words.push(word);
  }
  search(word) {
    return this.words.some((w) => w.length === word.length && [...word].every((c, j) => c === '.' || c === w[j]));
  }
}`,
      },
    },
    {
      name: 'Trie + 遇到 "." 就 DFS 所有孩子',
      idea: '單字存進 Trie。`dfs(node, i)`:走完了就看是不是單字結尾;`word[i]` 是字母就只走那個孩子;是 `.` 就每個孩子都試,有一個成功就成功。',
      steps: ['`addWord`:同 208 的 insert', '`dfs(node, i)`:`i == len` → 回傳 `node.isEnd`', '`word[i] == "."` → 對每個不是空的孩子 `dfs(child, i + 1)`,任一 true 就 true', '否則 → 走 `children[word[i]]`,沒有就 false'],
      figure: { title: `addWord ${WORDS.map((w) => `"${w}"`).join('、')},search("b.d")`, steps: dfsFig('b.d') },
      complexity: { time: 'addWord O(L),search O(26^d · L)', space: 'O(總字母數 × 26)', why: 'd 是 "." 的個數(最多 2)。沒有 "." 時就是 O(L)。' },
      verdict: '標準解,[[p:trie]] + [[p:backtracking]]。「遇到不確定的就每條路都試」這個想法,在 [212. Word Search II](#/q/212) 會再用到。',
      code: {
        python: `class WordDictionary:
    def __init__(self):
        self.root = {}                    # 字母 -> 子節點;'$' 表示單字結尾

    def addWord(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node['$'] = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return '$' in node
            ch = word[i]
            if ch == '.':                 # 任何字母都可以:每個孩子都試
                return any(dfs(child, i + 1) for k, child in node.items() if k != '$')
            return ch in node and dfs(node[ch], i + 1)

        return dfs(self.root, 0)`,
        c: `typedef struct WordDictionary {
    struct WordDictionary *kids[26];
    bool isEnd;
} WordDictionary;

WordDictionary *wordDictionaryCreate() {
    return calloc(1, sizeof(WordDictionary));
}

void wordDictionaryAddWord(WordDictionary *d, char *word) {
    for (; *word; word++) {
        int i = *word - 'a';
        if (!d->kids[i]) d->kids[i] = calloc(1, sizeof(WordDictionary));
        d = d->kids[i];
    }
    d->isEnd = true;
}

static bool dfs(WordDictionary *n, char *w) {
    if (!*w) return n->isEnd;
    if (*w == '.') {
        for (int i = 0; i < 26; i++)
            if (n->kids[i] && dfs(n->kids[i], w + 1)) return true;
        return false;
    }
    WordDictionary *k = n->kids[*w - 'a'];
    return k && dfs(k, w + 1);
}

bool wordDictionarySearch(WordDictionary *d, char *word) {
    return dfs(d, word);
}

void wordDictionaryFree(WordDictionary *d) {
    if (!d) return;
    for (int i = 0; i < 26; i++) wordDictionaryFree(d->kids[i]);
    free(d);
}`,
        cpp: `class WordDictionary {
    struct Node {
        Node* kids[26] = {};
        bool isEnd = false;
    };
    Node* root = new Node();

    bool dfs(Node* n, const string& w, int i) {
        if (i == (int)w.size()) return n->isEnd;
        if (w[i] == '.') {
            for (Node* k : n->kids)
                if (k && dfs(k, w, i + 1)) return true;
            return false;
        }
        Node* k = n->kids[w[i] - 'a'];
        return k && dfs(k, w, i + 1);
    }
public:
    WordDictionary() {}

    void addWord(string word) {
        Node* n = root;
        for (char c : word) {
            if (!n->kids[c - 'a']) n->kids[c - 'a'] = new Node();
            n = n->kids[c - 'a'];
        }
        n->isEnd = true;
    }

    bool search(string word) { return dfs(root, word, 0); }
};`,
        java: `class WordDictionary {
    private static class Node {
        Node[] kids = new Node[26];
        boolean isEnd;
    }

    private final Node root = new Node();

    public WordDictionary() {}

    public void addWord(String word) {
        Node n = root;
        for (char c : word.toCharArray()) {
            if (n.kids[c - 'a'] == null) n.kids[c - 'a'] = new Node();
            n = n.kids[c - 'a'];
        }
        n.isEnd = true;
    }

    public boolean search(String word) { return dfs(root, word, 0); }

    private boolean dfs(Node n, String w, int i) {
        if (i == w.length()) return n.isEnd;
        char c = w.charAt(i);
        if (c == '.') {
            for (Node k : n.kids)
                if (k != null && dfs(k, w, i + 1)) return true;
            return false;
        }
        Node k = n.kids[c - 'a'];
        return k != null && dfs(k, w, i + 1);
    }
}`,
        javascript: `class WordDictionary {
  constructor() {
    this.root = { kids: {}, isEnd: false };
  }

  addWord(word) {
    let n = this.root;
    for (const c of word) {
      if (!n.kids[c]) n.kids[c] = { kids: {}, isEnd: false };
      n = n.kids[c];
    }
    n.isEnd = true;
  }

  search(word) {
    const dfs = (n, i) => {
      if (i === word.length) return n.isEnd;
      const c = word[i];
      if (c === '.') return Object.values(n.kids).some((k) => dfs(k, i + 1));
      return !!n.kids[c] && dfs(n.kids[c], i + 1);
    };
    return dfs(this.root, 0);
  }
}`,
      },
    },
  ],
  pitfalls: [
    '走完 pattern 時忘了檢查 isEnd:加入 "bad" 之後 search("ba") 應該是 false',
    '遇到 `.` 只試第一個孩子:要全部試,有任何一條成功才算成功',
    'Python 巢狀 dict 版遇到 `.` 時,要跳過結尾標記 `"$"` 那個 key,不然會把 True 當成節點',
  ],
  followUp: [{ q: '如果 `*` 可以代表任意長度?', a: '那就變成字串配對的 DP:44. Wildcard Matching、[10. Regular Expression Matching](#/q/10)。' }],
  check: {
    kind: 'class',
    cls: 'WordDictionary',
    cases: [
      {
        ops: ['WordDictionary', 'addWord', 'addWord', 'addWord', 'search', 'search', 'search', 'search'],
        args: [[], ['bad'], ['dad'], ['mad'], ['pad'], ['bad'], ['.ad'], ['b..']],
        out: [null, null, null, null, false, true, true, true],
      },
      {
        ops: ['WordDictionary', ...WORDS.map(() => 'addWord'), 'search', 'search', 'search', 'search', 'search'],
        args: [[], ...WORDS.map((w) => [w]), ['b.d'], ['ba'], ['...'], ['....'], ['.an']],
        out: [null, ...WORDS.map(() => null), true, false, true, false, true],
      },
      {
        ops: ['WordDictionary', 'addWord', 'search', 'search'],
        args: [[], ['a'], ['.'], ['a.']],
        out: [null, null, true, false],
      },
    ],
  },
}

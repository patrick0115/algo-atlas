import { arr } from '../engine/helpers'
import type { GraphEdge, GraphNode, GraphViewData } from '../types'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 208. Implement Trie (Prefix Tree)

const WORDS = ['app', 'apple', 'ape', 'bat']

interface TN {
  id: string
  ch: string
  end: boolean
  kids: Map<string, TN>
}

/** 字典樹畫成圖:每個節點是一個字母,從根往下讀就是前綴;粗框(done)代表「有單字在這裡結束」 */
function trieView(root: TN, hl: Set<string> = new Set(), label = 'Trie(從根往下讀就是前綴;綠色 = 有單字在這裡結束)'): GraphViewData {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  let leaf = 0
  const place = (n: TN, depth: number): number => {
    const kids = [...n.kids.values()]
    let x: number
    if (!kids.length) x = leaf++
    else {
      const xs = kids.map((k) => place(k, depth + 1))
      x = (xs[0] + xs[xs.length - 1]) / 2
      kids.forEach((k) => edges.push({ from: n.id, to: k.id, directed: true, cls: hl.has(k.id) ? 'hl' : undefined }))
    }
    nodes.push({ id: n.id, label: n.ch, x: x * 1.1, y: depth * 1.1, cls: hl.has(n.id) ? 'hl' : n.end ? 'done' : undefined })
    return x
  }
  place(root, 0)
  return { kind: 'graph', label, nodes, edges }
}

function trieFig(): FigStep[] {
  const root: TN = { id: 'root', ch: '·', end: false, kids: new Map() }
  const out: FigStep[] = [{ note: 'Trie(字典樹):每個節點代表一個字母,從根往下走一條路就拼出一個前綴。共用前綴的單字共用同一段路', views: [trieView(root)] }]
  for (const w of WORDS) {
    let n = root
    const path = new Set<string>()
    const created: string[] = []
    for (const c of w) {
      if (!n.kids.has(c)) {
        n.kids.set(c, { id: `${n.id}/${c}`, ch: c, end: false, kids: new Map() })
        created.push(c)
      }
      n = n.kids.get(c)!
      path.add(n.id)
    }
    n.end = true
    out.push({ note: `insert("${w}"):沿著字母往下走,沒有的節點就建一個${created.length ? `(新建 ${created.join('、')})` : '(全部都已經存在)'},最後一個節點標記「單字結尾」`, views: [trieView(root, path)] })
  }
  const query = (w: string, prefix: boolean): FigStep => {
    let n: TN | undefined = root
    const path = new Set<string>()
    for (const c of w) {
      n = n.kids.get(c)
      if (!n) break
      path.add(n.id)
    }
    const ok = !!n && (prefix || n.end)
    const why = !n ? `走到一半就沒有路了` : prefix ? '路都走得通' : n.end ? '走得通,而且最後一個節點是單字結尾' : '走得通,但最後一個節點**不是**單字結尾'
    return { note: `${prefix ? 'startsWith' : 'search'}("${w}"):${why} → ${ok}`, views: [trieView(root, path)] }
  }
  out.push(query('app', false), query('ap', false), query('ap', true), query('bad', true))
  return out
}

function setFig(): FigStep[] {
  const set: string[] = []
  const out: FigStep[] = [{ note: '最簡單:用一個 set 存所有單字。search 是 O(1);但 startsWith 要把每個單字都檢查一次「是不是以 prefix 開頭」', views: [kv([], 'words')] }]
  for (const w of WORDS) {
    set.push(w)
    out.push({ note: `insert("${w}")`, views: [kv(set.map((x) => [x, '✓']), 'words', [w])] })
  }
  out.push({ note: 'startsWith("ap"):逐一檢查 → app ✓ → true(最壞要看完所有單字)', views: [arr(set, { label: 'words', compare: [0] })] })
  return out
}

export const q0208: Solution = {
  id: 208,
  plain: '做一本「依字母分層」的字典:每一層是一個字母,同樣開頭的單字共用同一段路(像 app、apple 共用 a → p → p)。這樣就能很快回答「有沒有這個單字?」以及「有沒有單字是這樣開頭的?」',
  statement:
    '實作 Trie(字典樹 / 前綴樹):`insert(word)` 加入單字;`search(word)` 回傳 word 是否被加入過;`startsWith(prefix)` 回傳是否有任何加入過的單字以 prefix 開頭。只有小寫字母。',
  examples: [
    {
      input: 'insert("apple")、search("apple")、search("app")、startsWith("app")、insert("app")、search("app")',
      output: 'true、false、true、true',
      note: '"app" 是 "apple" 的前綴,但在 insert("app") 之前它不算一個單字',
    },
  ],
  constraints: ['單字長度 ≤ 2000,總呼叫次數 ≤ 3·10⁴', '只有小寫字母 → 每個節點最多 26 個孩子'],
  insight: [
    '用 set 存單字:search 很快,但 startsWith 要檢查每一個單字,太慢',
    '觀察:很多單字有共同的開頭。把單字拆成字母,一層一層往下存,共同前綴就只存一次 → **樹**',
    '每個節點:最多 26 個孩子(下一個字母),再加一個標記「有單字在這裡結束」',
    'search 和 startsWith 都是沿著字母往下走;差別只在最後:search 要求結尾標記,startsWith 不用',
  ],
  approaches: [
    {
      name: 'Set 存單字,前綴逐一比對',
      idea: '用 Hash Set 存所有單字。`search` 直接查;`startsWith` 把每個單字都檢查一次開頭。',
      steps: ['`insert`:加進 set', '`search`:查 set', '`startsWith`:任何一個單字以 prefix 開頭 → true'],
      figure: { title: `insert ${WORDS.map((w) => `"${w}"`).join('、')}`, steps: setFig() },
      complexity: { time: 'insert / search O(L),startsWith O(N·L)', space: 'O(N·L)', why: 'L 是單字長度、N 是單字數。startsWith 要看每個單字。' },
      verdict: '只當對照組:讓你看出「前綴查詢」為什麼需要特殊的資料結構。',
      code: {
        python: `class Trie:
    def __init__(self):
        self.words = set()

    def insert(self, word):
        self.words.add(word)

    def search(self, word):
        return word in self.words

    def startsWith(self, prefix):
        return any(w.startswith(prefix) for w in self.words)`,
        c: `typedef struct { char *key; UT_hash_handle hh; } Word;
typedef struct { Word *set; } Trie;

Trie *trieCreate() {
    Trie *t = malloc(sizeof(Trie));
    t->set = NULL;
    return t;
}

void trieInsert(Trie *t, char *word) {
    Word *w;
    HASH_FIND_STR(t->set, word, w);
    if (w) return;
    w = malloc(sizeof(Word));
    w->key = strdup(word);
    HASH_ADD_KEYPTR(hh, t->set, w->key, strlen(w->key), w);
}

bool trieSearch(Trie *t, char *word) {
    Word *w;
    HASH_FIND_STR(t->set, word, w);
    return w != NULL;
}

bool trieStartsWith(Trie *t, char *prefix) {
    size_t n = strlen(prefix);
    for (Word *w = t->set; w; w = w->hh.next)
        if (strncmp(w->key, prefix, n) == 0) return true;
    return false;
}

void trieFree(Trie *t) {
    Word *w, *tmp;
    HASH_ITER(hh, t->set, w, tmp) { HASH_DEL(t->set, w); free(w->key); free(w); }
    free(t);
}`,
        cpp: `class Trie {
    unordered_set<string> words;
public:
    Trie() {}
    void insert(string word) { words.insert(word); }
    bool search(string word) { return words.count(word); }
    bool startsWith(string prefix) {
        for (const string& w : words)
            if (w.compare(0, prefix.size(), prefix) == 0) return true;
        return false;
    }
};`,
        java: `class Trie {
    private final Set<String> words = new HashSet<>();

    public Trie() {}
    public void insert(String word) { words.add(word); }
    public boolean search(String word) { return words.contains(word); }
    public boolean startsWith(String prefix) {
        for (String w : words) if (w.startsWith(prefix)) return true;
        return false;
    }
}`,
        javascript: `class Trie {
  constructor() {
    this.words = new Set();
  }
  insert(word) {
    this.words.add(word);
  }
  search(word) {
    return this.words.has(word);
  }
  startsWith(prefix) {
    for (const w of this.words) if (w.startsWith(prefix)) return true;
    return false;
  }
}`,
      },
    },
    {
      name: 'Trie:每個節點 26 個孩子的陣列',
      idea: '節點 = `children[26]` + `isEnd`。insert 沿著字母往下走,沒有的節點就建;search / startsWith 沿著走,走不下去就 false。',
      steps: ['`insert`:`node = root`;每個字母 `c`:`children[c]` 沒有就建,`node = children[c]`;最後 `node.isEnd = true`', '`find(s)`:沿著走,走不下去回傳 null', '`search(w)`:`find(w)` 不是 null 且 `isEnd`', '`startsWith(p)`:`find(p)` 不是 null'],
      figure: { title: `insert ${WORDS.map((w) => `"${w}"`).join('、')},再查詢`, steps: trieFig() },
      complexity: { time: '每個操作 O(L)', space: 'O(總字母數 × 26)', why: '只和查詢的字串長度有關,和存了幾個單字無關。每個節點開 26 格,比較耗記憶體。' },
      verdict: '標準解,[[p:trie]]的模板。字母種類固定又少(小寫 26 個)時用陣列最快。211、212、648 都在這個結構上加一點東西。',
      code: {
        python: `class TrieNode:
    def __init__(self):
        self.children = [None] * 26
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            i = ord(ch) - ord('a')
            if not node.children[i]:
                node.children[i] = TrieNode()
            node = node.children[i]
        node.is_end = True                # 有單字在這裡結束

    def _find(self, s):
        node = self.root
        for ch in s:
            node = node.children[ord(ch) - ord('a')]
            if not node:
                return None
        return node

    def search(self, word):
        node = self._find(word)
        return node is not None and node.is_end

    def startsWith(self, prefix):
        return self._find(prefix) is not None`,
        c: `typedef struct Trie {
    struct Trie *children[26];
    bool isEnd;
} Trie;

Trie *trieCreate() {
    return calloc(1, sizeof(Trie));
}

void trieInsert(Trie *t, char *word) {
    for (; *word; word++) {
        int i = *word - 'a';
        if (!t->children[i]) t->children[i] = calloc(1, sizeof(Trie));
        t = t->children[i];
    }
    t->isEnd = true;
}

static Trie *find(Trie *t, char *s) {
    for (; *s && t; s++) t = t->children[*s - 'a'];
    return t;
}

bool trieSearch(Trie *t, char *word) {
    Trie *n = find(t, word);
    return n && n->isEnd;
}

bool trieStartsWith(Trie *t, char *prefix) {
    return find(t, prefix) != NULL;
}

void trieFree(Trie *t) {
    if (!t) return;
    for (int i = 0; i < 26; i++) trieFree(t->children[i]);
    free(t);
}`,
        cpp: `class Trie {
    struct Node {
        Node* children[26] = {};
        bool isEnd = false;
    };
    Node* root = new Node();

    Node* find(const string& s) {
        Node* n = root;
        for (char c : s) {
            n = n->children[c - 'a'];
            if (!n) return nullptr;
        }
        return n;
    }
public:
    Trie() {}

    void insert(string word) {
        Node* n = root;
        for (char c : word) {
            if (!n->children[c - 'a']) n->children[c - 'a'] = new Node();
            n = n->children[c - 'a'];
        }
        n->isEnd = true;
    }

    bool search(string word) {
        Node* n = find(word);
        return n && n->isEnd;
    }

    bool startsWith(string prefix) { return find(prefix) != nullptr; }
};`,
        java: `class Trie {
    private static class Node {
        Node[] children = new Node[26];
        boolean isEnd;
    }

    private final Node root = new Node();

    public Trie() {}

    public void insert(String word) {
        Node n = root;
        for (char c : word.toCharArray()) {
            if (n.children[c - 'a'] == null) n.children[c - 'a'] = new Node();
            n = n.children[c - 'a'];
        }
        n.isEnd = true;
    }

    private Node find(String s) {
        Node n = root;
        for (char c : s.toCharArray()) {
            n = n.children[c - 'a'];
            if (n == null) return null;
        }
        return n;
    }

    public boolean search(String word) {
        Node n = find(word);
        return n != null && n.isEnd;
    }

    public boolean startsWith(String prefix) { return find(prefix) != null; }
}`,
        javascript: `class Trie {
  constructor() {
    this.root = { children: new Array(26).fill(null), isEnd: false };
  }

  insert(word) {
    let n = this.root;
    for (const c of word) {
      const i = c.charCodeAt(0) - 97;
      if (!n.children[i]) n.children[i] = { children: new Array(26).fill(null), isEnd: false };
      n = n.children[i];
    }
    n.isEnd = true;
  }

  find(s) {
    let n = this.root;
    for (const c of s) {
      n = n.children[c.charCodeAt(0) - 97];
      if (!n) return null;
    }
    return n;
  }

  search(word) {
    const n = this.find(word);
    return !!n && n.isEnd;
  }

  startsWith(prefix) {
    return this.find(prefix) !== null;
  }
}`,
      },
    },
    {
      name: 'Trie:孩子用 Hash Map',
      idea: '同樣的結構,只是每個節點的孩子用 map(字母 → 節點)存,只存實際用到的字母。',
      steps: ['節點 = `children: map` + `isEnd`', '其他操作和陣列版相同,`children[c]` 改成查 map'],
      figure: { title: `insert ${WORDS.map((w) => `"${w}"`).join('、')},再查詢`, steps: trieFig() },
      complexity: { time: '每個操作 O(L)', space: 'O(總字母數)', why: '只為實際出現的字母開空間;但 map 的常數比陣列大。' },
      verdict: '字母種類很多(大小寫、Unicode)或很稀疏時比較省記憶體。Python 常用巢狀 dict 寫得很短。',
      code: {
        python: `class Trie:
    def __init__(self):
        self.root = {}                    # 字母 -> 子節點(也是 dict);'$' 表示單字結尾

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node['$'] = True

    def _find(self, s):
        node = self.root
        for ch in s:
            if ch not in node:
                return None
            node = node[ch]
        return node

    def search(self, word):
        node = self._find(word)
        return node is not None and '$' in node

    def startsWith(self, prefix):
        return self._find(prefix) is not None`,
        c: `// C 用 uthash 當每個節點的孩子 map
typedef struct Trie Trie;
typedef struct { char ch; Trie *node; UT_hash_handle hh; } Child;
struct Trie { Child *kids; bool isEnd; };

Trie *trieCreate() {
    return calloc(1, sizeof(Trie));
}

static Trie *step(Trie *t, char c, bool create) {
    Child *k;
    HASH_FIND(hh, t->kids, &c, 1, k);
    if (!k && create) {
        k = malloc(sizeof(Child));
        k->ch = c;
        k->node = trieCreate();
        HASH_ADD(hh, t->kids, ch, 1, k);
    }
    return k ? k->node : NULL;
}

void trieInsert(Trie *t, char *word) {
    for (; *word; word++) t = step(t, *word, true);
    t->isEnd = true;
}

static Trie *find(Trie *t, char *s) {
    for (; *s && t; s++) t = step(t, *s, false);
    return t;
}

bool trieSearch(Trie *t, char *word) {
    Trie *n = find(t, word);
    return n && n->isEnd;
}

bool trieStartsWith(Trie *t, char *prefix) {
    return find(t, prefix) != NULL;
}

void trieFree(Trie *t) {
    Child *k, *tmp;
    HASH_ITER(hh, t->kids, k, tmp) { HASH_DEL(t->kids, k); trieFree(k->node); free(k); }
    free(t);
}`,
        cpp: `class Trie {
    struct Node {
        unordered_map<char, Node*> children;
        bool isEnd = false;
    };
    Node* root = new Node();

    Node* find(const string& s) {
        Node* n = root;
        for (char c : s) {
            auto it = n->children.find(c);
            if (it == n->children.end()) return nullptr;
            n = it->second;
        }
        return n;
    }
public:
    Trie() {}

    void insert(string word) {
        Node* n = root;
        for (char c : word) {
            if (!n->children.count(c)) n->children[c] = new Node();
            n = n->children[c];
        }
        n->isEnd = true;
    }

    bool search(string word) {
        Node* n = find(word);
        return n && n->isEnd;
    }

    bool startsWith(string prefix) { return find(prefix) != nullptr; }
};`,
        java: `class Trie {
    private static class Node {
        Map<Character, Node> children = new HashMap<>();
        boolean isEnd;
    }

    private final Node root = new Node();

    public Trie() {}

    public void insert(String word) {
        Node n = root;
        for (char c : word.toCharArray()) n = n.children.computeIfAbsent(c, k -> new Node());
        n.isEnd = true;
    }

    private Node find(String s) {
        Node n = root;
        for (char c : s.toCharArray()) {
            n = n.children.get(c);
            if (n == null) return null;
        }
        return n;
    }

    public boolean search(String word) {
        Node n = find(word);
        return n != null && n.isEnd;
    }

    public boolean startsWith(String prefix) { return find(prefix) != null; }
}`,
        javascript: `class Trie {
  constructor() {
    this.root = { children: new Map(), isEnd: false };
  }

  insert(word) {
    let n = this.root;
    for (const c of word) {
      if (!n.children.has(c)) n.children.set(c, { children: new Map(), isEnd: false });
      n = n.children.get(c);
    }
    n.isEnd = true;
  }

  find(s) {
    let n = this.root;
    for (const c of s) {
      n = n.children.get(c);
      if (!n) return null;
    }
    return n;
  }

  search(word) {
    const n = this.find(word);
    return !!n && n.isEnd;
  }

  startsWith(prefix) {
    return this.find(prefix) !== null;
  }
}`,
      },
    },
  ],
  pitfalls: [
    'search 忘了檢查結尾標記:插入 "apple" 之後,search("app") 走得通但應該是 false',
    '把結尾標記放在「下一個節點」而不是最後一個字母的節點,會讓 search 和 startsWith 的判斷錯一格',
    'Python 巢狀 dict 版用 `"$"` 當結尾標記時,要確定 `$` 不會是單字裡的字母(這題只有小寫,安全)',
  ],
  followUp: [
    { q: '支援萬用字元 `.`?', a: '211. Design Add and Search Words:search 遇到 `.` 就對所有孩子 DFS。' },
    { q: '在網格裡找很多個單字?', a: '[212. Word Search II](#/q/212):把單字建成 Trie,在網格 DFS 時沿著 Trie 走,走不下去就剪枝。' },
  ],
  check: {
    kind: 'class',
    cls: 'Trie',
    cases: [
      {
        ops: ['Trie', 'insert', 'search', 'search', 'startsWith', 'insert', 'search'],
        args: [[], ['apple'], ['apple'], ['app'], ['app'], ['app'], ['app']],
        out: [null, null, true, false, true, null, true],
      },
      {
        ops: ['Trie', ...WORDS.map(() => 'insert'), 'search', 'search', 'startsWith', 'startsWith', 'search', 'startsWith'],
        args: [[], ...WORDS.map((w) => [w]), ['app'], ['ap'], ['ap'], ['bad'], ['bat'], ['b']],
        out: [null, ...WORDS.map(() => null), true, false, true, false, true, true],
      },
    ],
  },
}

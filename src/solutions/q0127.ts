import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { GraphViewData } from '../types'
import type { FigStep, Solution } from './types'

// 127. Word Ladder

const BEGIN = 'hit'
const END = 'cog'
const LIST = ['hot', 'dot', 'dog', 'lot', 'log', 'cog']

const POS: Record<string, [number, number]> = { hit: [0, 1], hot: [1.3, 1], dot: [2.6, 0], lot: [2.6, 2], dog: [3.9, 0], log: [3.9, 2], cog: [5.2, 1] }
const EDGES: [string, string][] = [
  ['hit', 'hot'],
  ['hot', 'dot'],
  ['hot', 'lot'],
  ['dot', 'lot'],
  ['dot', 'dog'],
  ['lot', 'log'],
  ['dog', 'log'],
  ['dog', 'cog'],
  ['log', 'cog'],
]

function g(cls: Record<string, string>, subs: Record<string, number> = {}): GraphViewData {
  return {
    kind: 'graph',
    label: '每個單字是一個點,只差一個字母就連一條邊',
    nodes: Object.entries(POS).map(([w, [x, y]]) => ({ id: w, label: w, x, y, cls: cls[w], sub: subs[w] })),
    edges: EDGES.map(([a, b]) => ({ from: a, to: b })),
  }
}

function bfsFig(): FigStep[] {
  const levels = [['hit'], ['hot'], ['dot', 'lot'], ['dog', 'log'], ['cog']]
  const out: FigStep[] = [{ note: '把單字當成圖上的點,差一個字母的連邊。問題變成「最少走幾步從 hit 到 cog」→ 無權圖的最短路徑 = **BFS**', views: [g({ hit: 'hl', cog: 'cur' })] }]
  const cls: Record<string, string> = {}
  const subs: Record<string, number> = {}
  levels.forEach((lv, d) => {
    for (const w of lv) {
      cls[w] = 'visited'
      subs[w] = d + 1
    }
    const c = { ...cls }
    for (const w of lv) c[w] = 'hl'
    out.push({ note: d === levels.length - 1 ? `第 ${d + 1} 層碰到 cog → 答案 ${d + 1}(數的是單字個數,包含 hit 和 cog)` : `第 ${d + 1} 層:${lv.join('、')}`, views: [g(c, { ...subs })] })
  })
  return out
}

function patternFig(): FigStep[] {
  return [
    { note: '怎麼快速找鄰居?把每個位置換成 *:hot → *ot、h*t、ho*。同一個「萬用字元樣式」底下的單字互為鄰居', views: [kv([['*ot', 'hot, dot, lot'], ['h*t', 'hot'], ['ho*', 'hot'], ['do*', 'dot, dog'], ['*og', 'dog, log, cog']], '樣式 → 單字')] },
    { note: '或是直接對每個位置試 a..z 的 26 個字母,查是否在單字集合裡:每個單字 26 × L 次查詢', views: [arr(['ait', 'bit', '…', 'hot ✓', '…', 'hiz'], { label: 'hit 的候選', highlight: [3] })] },
  ]
}

export const q0127: Solution = {
  id: 127,
  plain: '從一個單字開始,每次只能改一個字母,而且改完的單字要在字典裡。最少要經過幾個單字才能變成目標單字?例如 hit → hot → dot → dog → cog,共 5 個單字。',
  statement: '給 `beginWord`、`endWord` 與字典 `wordList`。每次轉換只能改變一個字母,且中間的每個單字都必須在 wordList 中。回傳最短轉換序列的**單字數**(含頭尾);不存在則回傳 0。',
  examples: [
    { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5' },
    { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0', note: 'cog 不在字典' },
  ],
  constraints: ['單字長度 L ≤ 10,字典 N ≤ 5000 → 兩兩比較 O(N²·L) 太慢'],
  insight: [
    '單字 = 點,差一個字母 = 邊 → 求最短路徑。每條邊長度都是 1 → **BFS**',
    '找鄰居:兩兩比較是 O(N²·L)。改成對每個位置試 26 個字母,在集合裡查 → 每個單字 O(26·L)',
    '或建「萬用字元樣式」表:`h*t`、`*ot`… 同一個樣式下的單字互為鄰居',
    '訪問過的單字立刻從集合移除,避免重複走',
  ],
  approaches: [
    {
      name: 'BFS + 試 26 個字母',
      idea: '佇列從 beginWord 開始,層數 1。每個單字的每個位置換成 a..z,在字典集合裡的就是鄰居;遇到 endWord 回傳層數。',
      steps: ['`words = set(wordList)`;endWord 不在 → 0', '`queue = [beginWord]`,`steps = 1`', '一層一層:每個單字的每個位置試 26 個字母', '在 words 裡:是 endWord → `steps + 1`;否則移出集合、加入下一層'],
      figure: { title: `"${BEGIN}" → "${END}"`, steps: bfsFig() },
      complexity: { time: 'O(N · L² · 26)', space: 'O(N · L)', why: '每個單字出佇列一次,試 26·L 個變化,每個變化建字串 O(L)。' },
      verdict: '最推薦,[[p:graph-traversal]]「隱式圖上的 BFS」的經典題:圖不用真的建出來。',
      code: {
        python: `from collections import deque

def ladderLength(beginWord, endWord, wordList):
    words = set(wordList)
    if endWord not in words:
        return 0
    q, steps = deque([beginWord]), 1
    while q:
        for _ in range(len(q)):               # 一次處理一整層
            w = q.popleft()
            for i in range(len(w)):
                for ch in 'abcdefghijklmnopqrstuvwxyz':
                    nxt = w[:i] + ch + w[i + 1:]
                    if nxt in words:
                        if nxt == endWord:
                            return steps + 1
                        words.remove(nxt)     # 訪問過就移除
                        q.append(nxt)
        steps += 1
    return 0`,
        c: `typedef struct { char *key; UT_hash_handle hh; } Word;

int ladderLength(char *beginWord, char *endWord, char **wordList, int wordListSize) {
    Word *set = NULL, *e;
    for (int i = 0; i < wordListSize; i++) {
        HASH_FIND_STR(set, wordList[i], e);
        if (!e) { e = malloc(sizeof(Word)); e->key = wordList[i]; HASH_ADD_KEYPTR(hh, set, e->key, strlen(e->key), e); }
    }
    HASH_FIND_STR(set, endWord, e);
    if (!e) return 0;
    int L = strlen(beginWord), head = 0, tail = 0, steps = 1;
    char **q = malloc((wordListSize + 1) * sizeof(char *));
    q[tail++] = strdup(beginWord);
    while (head < tail) {
        int size = tail - head;
        while (size--) {
            char *w = q[head++];
            for (int i = 0; i < L; i++) {
                char orig = w[i];
                for (char ch = 'a'; ch <= 'z'; ch++) {
                    if (ch == orig) continue;
                    w[i] = ch;
                    HASH_FIND_STR(set, w, e);
                    if (e) {
                        if (strcmp(w, endWord) == 0) return steps + 1;
                        HASH_DEL(set, e);
                        free(e);
                        q[tail++] = strdup(w);
                    }
                }
                w[i] = orig;
            }
        }
        steps++;
    }
    return 0;
}`,
        cpp: `int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
    unordered_set<string> words(wordList.begin(), wordList.end());
    if (!words.count(endWord)) return 0;
    queue<string> q;
    q.push(beginWord);
    int steps = 1;
    while (!q.empty()) {
        for (int size = q.size(); size > 0; size--) {
            string w = q.front(); q.pop();
            for (int i = 0; i < (int)w.size(); i++) {
                char orig = w[i];
                for (char ch = 'a'; ch <= 'z'; ch++) {
                    w[i] = ch;
                    if (words.count(w)) {
                        if (w == endWord) return steps + 1;
                        words.erase(w);
                        q.push(w);
                    }
                }
                w[i] = orig;
            }
        }
        steps++;
    }
    return 0;
}`,
        java: `int ladderLength(String beginWord, String endWord, List<String> wordList) {
    Set<String> words = new HashSet<>(wordList);
    if (!words.contains(endWord)) return 0;
    Deque<String> q = new ArrayDeque<>();
    q.add(beginWord);
    int steps = 1;
    while (!q.isEmpty()) {
        for (int size = q.size(); size > 0; size--) {
            char[] w = q.poll().toCharArray();
            for (int i = 0; i < w.length; i++) {
                char orig = w[i];
                for (char ch = 'a'; ch <= 'z'; ch++) {
                    w[i] = ch;
                    String nxt = new String(w);
                    if (words.contains(nxt)) {
                        if (nxt.equals(endWord)) return steps + 1;
                        words.remove(nxt);
                        q.add(nxt);
                    }
                }
                w[i] = orig;
            }
        }
        steps++;
    }
    return 0;
}`,
        javascript: `function ladderLength(beginWord, endWord, wordList) {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0;
  let q = [beginWord], steps = 1;
  while (q.length) {
    const next = [];
    for (const w of q)
      for (let i = 0; i < w.length; i++)
        for (let c = 97; c <= 122; c++) {
          const nxt = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);
          if (!words.has(nxt)) continue;
          if (nxt === endWord) return steps + 1;
          words.delete(nxt);
          next.push(nxt);
        }
    q = next;
    steps++;
  }
  return 0;
}`,
      },
    },
    {
      name: 'BFS + 萬用字元樣式表',
      idea: '先把每個單字的 L 個樣式(某一位換成 `*`)建成 `樣式 → 單字們` 的表。BFS 時鄰居就是「同樣式的單字」。',
      steps: ['`for w in wordList`:`for i`:`table[w[:i] + "*" + w[i+1:]].append(w)`', 'BFS:對 w 的每個樣式,走訪 `table[樣式]` 裡沒看過的單字', '用完的樣式可以清空,避免重複掃描'],
      figure: { title: '找鄰居的兩種方法', steps: patternFig() },
      complexity: { time: 'O(N · L²)', space: 'O(N · L²)', why: '每個單字 L 個樣式,建每個樣式 O(L);不受字母表大小影響。' },
      verdict: '字母表很大(不只 a..z)時比較好。用完就清空樣式的那個小技巧很重要,否則熱門樣式會被反覆掃。',
      code: {
        python: `from collections import defaultdict, deque

def ladderLength(beginWord, endWord, wordList):
    if endWord not in wordList:
        return 0
    L = len(beginWord)
    table = defaultdict(list)
    for w in wordList:
        for i in range(L):
            table[w[:i] + '*' + w[i + 1:]].append(w)
    seen, q = {beginWord}, deque([(beginWord, 1)])
    while q:
        w, d = q.popleft()
        for i in range(L):
            pat = w[:i] + '*' + w[i + 1:]
            for nxt in table[pat]:
                if nxt == endWord:
                    return d + 1
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, d + 1))
            table[pat] = []                   # 這個樣式的鄰居都處理過了
    return 0`,
        c: `typedef struct { char *key; int *ids, n, cap; UT_hash_handle hh; } Pat;

int ladderLength(char *beginWord, char *endWord, char **wordList, int wordListSize) {
    int L = strlen(beginWord), target = -1;
    for (int i = 0; i < wordListSize; i++) if (strcmp(wordList[i], endWord) == 0) target = i;
    if (target < 0) return 0;
    Pat *table = NULL, *p;
    char buf[16];
    for (int w = 0; w < wordListSize; w++)
        for (int i = 0; i < L; i++) {
            strcpy(buf, wordList[w]); buf[i] = '*';
            HASH_FIND_STR(table, buf, p);
            if (!p) { p = calloc(1, sizeof(Pat)); p->key = strdup(buf); p->cap = 4; p->ids = malloc(4 * sizeof(int)); HASH_ADD_KEYPTR(hh, table, p->key, L, p); }
            if (p->n == p->cap) { p->cap *= 2; p->ids = realloc(p->ids, p->cap * sizeof(int)); }
            p->ids[p->n++] = w;
        }
    bool *seen = calloc(wordListSize, sizeof(bool));
    int *q = malloc((wordListSize + 1) * sizeof(int)), *dist = malloc((wordListSize + 1) * sizeof(int)), head = 0, tail = 0;
    q[tail] = -1; dist[tail++] = 1;                 // -1 代表 beginWord
    while (head < tail) {
        int cur = q[head], d = dist[head++];
        const char *w = cur < 0 ? beginWord : wordList[cur];
        for (int i = 0; i < L; i++) {
            strcpy(buf, w); buf[i] = '*';
            HASH_FIND_STR(table, buf, p);
            if (!p) continue;
            for (int k = 0; k < p->n; k++) {
                int nx = p->ids[k];
                if (nx == target) return d + 1;
                if (!seen[nx]) { seen[nx] = true; q[tail] = nx; dist[tail++] = d + 1; }
            }
            p->n = 0;
        }
    }
    return 0;
}`,
        cpp: `int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
    if (find(wordList.begin(), wordList.end(), endWord) == wordList.end()) return 0;
    int L = beginWord.size();
    unordered_map<string, vector<string>> table;
    for (auto& w : wordList)
        for (int i = 0; i < L; i++) { string p = w; p[i] = '*'; table[p].push_back(w); }
    unordered_set<string> seen{beginWord};
    queue<pair<string, int>> q;
    q.push({beginWord, 1});
    while (!q.empty()) {
        auto [w, d] = q.front(); q.pop();
        for (int i = 0; i < L; i++) {
            string p = w; p[i] = '*';
            for (auto& nxt : table[p]) {
                if (nxt == endWord) return d + 1;
                if (seen.insert(nxt).second) q.push({nxt, d + 1});
            }
            table[p].clear();
        }
    }
    return 0;
}`,
        java: `int ladderLength(String beginWord, String endWord, List<String> wordList) {
    if (!wordList.contains(endWord)) return 0;
    int L = beginWord.length();
    Map<String, List<String>> table = new HashMap<>();
    for (String w : wordList)
        for (int i = 0; i < L; i++)
            table.computeIfAbsent(w.substring(0, i) + "*" + w.substring(i + 1), k -> new ArrayList<>()).add(w);
    Set<String> seen = new HashSet<>(List.of(beginWord));
    Deque<String> q = new ArrayDeque<>();
    q.add(beginWord);
    for (int d = 1; !q.isEmpty(); d++) {
        for (int size = q.size(); size > 0; size--) {
            String w = q.poll();
            for (int i = 0; i < L; i++) {
                String p = w.substring(0, i) + "*" + w.substring(i + 1);
                for (String nxt : table.getOrDefault(p, List.of())) {
                    if (nxt.equals(endWord)) return d + 1;
                    if (seen.add(nxt)) q.add(nxt);
                }
                table.remove(p);
            }
        }
    }
    return 0;
}`,
        javascript: `function ladderLength(beginWord, endWord, wordList) {
  if (!wordList.includes(endWord)) return 0;
  const L = beginWord.length, table = new Map();
  for (const w of wordList)
    for (let i = 0; i < L; i++) {
      const p = w.slice(0, i) + '*' + w.slice(i + 1);
      if (!table.has(p)) table.set(p, []);
      table.get(p).push(w);
    }
  const seen = new Set([beginWord]);
  let q = [beginWord];
  for (let d = 1; q.length; d++) {
    const next = [];
    for (const w of q)
      for (let i = 0; i < L; i++) {
        const p = w.slice(0, i) + '*' + w.slice(i + 1);
        for (const nxt of table.get(p) ?? []) {
          if (nxt === endWord) return d + 1;
          if (!seen.has(nxt)) { seen.add(nxt); next.push(nxt); }
        }
        table.delete(p);
      }
    q = next;
  }
  return 0;
}`,
      },
    },
  ],
  pitfalls: [
    '回傳「改了幾次」而不是「單字數」:答案要多 1',
    '用 DFS:找得到路,但不保證最短',
    '訪問過的單字沒有移除 / 標記:同一層會重複加入,佇列爆炸',
  ],
  followUp: [
    { q: '要列出所有最短轉換序列?', a: '126. Word Ladder II:BFS 時記錄每個單字的前驅(可能有多個),再從 endWord DFS 回溯出所有路徑。' },
    { q: '更快?', a: '雙向 BFS:從頭尾同時擴展,每次擴展比較小的那一邊,搜尋範圍大幅縮小。' },
  ],
  check: {
    kind: 'fn',
    fn: 'ladderLength',
    cases: [
      { args: [BEGIN, END, LIST], out: 5 },
      { args: [BEGIN, END, ['hot', 'dot', 'dog', 'lot', 'log']], out: 0 },
      { args: ['a', 'c', ['a', 'b', 'c']], out: 2 },
      { args: ['hot', 'dog', ['hot', 'dog']], out: 0 },
      { args: ['lost', 'cost', ['most', 'fist', 'lost', 'cost', 'fish']], out: 2 },
    ],
  },
}

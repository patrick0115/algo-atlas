import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1268. Search Suggestions System

const P = ['mobile', 'mouse', 'moneypot', 'monitor', 'mousepad']
const W = 'mouse'

function bsFig(): FigStep[] {
  const s = [...P].sort()
  return [
    { note: '先把產品排序。有同一個前綴的字,排序後一定挨在一起,而且從「第一個 ≥ 前綴」的位置開始', views: [arr(s, { label: '排序後' })] },
    { note: '打到 "mo":二分找第一個 ≥ "mo" 的位置 → 0,往後取最多 3 個、而且還要以 "mo" 開頭 → mobile、moneypot、monitor', views: [arr(s, { label: '"mo"', done: [0, 1, 2] })] },
    { note: '打到 "mou":第一個 ≥ "mou" 的是 mouse(索引 3)→ mouse、mousepad。每打一個字都這樣二分一次', views: [arr(s, { label: '"mou"', dim: [0, 1, 2], done: [3, 4] })] },
  ]
}

function trieFig(): FigStep[] {
  return [
    { note: '字典樹:每個節點存「經過這裡的字(排序後的前 3 個)」。插入時沿路把字加進去,超過 3 個就不加', views: [arr(['m → [mobile, moneypot, monitor]', 'mo → 同上', 'mou → [mouse, mousepad]'], { label: '節點上存的建議' })] },
    { note: '查詢時沿著 searchWord 往下走,每走一步就把那個節點的清單當作答案;走到不存在的分支之後全部是空清單', views: [arr(['m', 'mo', 'mou', 'mous', 'mouse'], { label: '每一步', done: [0, 1, 2, 3, 4] })] },
  ]
}

export const q1268: Solution = {
  id: 1268,
  plain: '做一個搜尋框的「自動建議」:使用者每打一個字,就從產品清單裡列出最多 3 個「以目前打的內容開頭」的產品,依字典序排。',
  statement: '給字串陣列 `products` 和 `searchWord`。對 searchWord 的每個前綴(打完第 1、2、… 個字時),回傳最多 3 個以該前綴開頭的產品(字典序最小的 3 個)。',
  examples: [
    { input: 'products = ["mobile","mouse","moneypot","monitor","mousepad"], searchWord = "mouse"', output: '[["mobile","moneypot","monitor"],["mobile","moneypot","monitor"],["mouse","mousepad"],["mouse","mousepad"],["mouse","mousepad"]]' },
    { input: 'products = ["havana"], searchWord = "tatiana"', output: '[[],[],[],[],[],[],[]]' },
  ],
  constraints: ['產品數 ≤ 1000,總字元數 ≤ 2·10⁴', 'searchWord 長度 ≤ 1000'],
  insight: ['「字典序最小的 3 個」→ 先排序', '同一個前綴的產品在排序後連成一段,從 lowerBound(前綴) 開始', '或用字典樹([[p:trie]]),每個節點預先存好最多 3 個建議'],
  approaches: [
    {
      name: '排序 + 二分搜尋',
      idea: '排序 products;每個前綴 p:`i = lowerBound(p)`,取 i 開始最多 3 個、以 p 開頭的字。',
      steps: ['`products.sort()`', '`for k in 1..len(word)`:`p = word[:k]`', '`i = bisect_left(products, p)`', '取 `products[i : i+3]` 中以 p 開頭的'],
      figure: { title: `searchWord = "${W}"`, steps: bsFig() },
      complexity: { time: 'O(n log n · L + m · (log n + 3) · L)', space: 'O(1)(不算輸出)', why: '排序;每個前綴一次二分,比較字串 O(L)。' },
      verdict: '最推薦,好寫好懂。前綴越來越長,下界也只會往右移,也可以改成雙指標。',
      code: {
        python: `from bisect import bisect_left

def suggestedProducts(products, searchWord):
    products = sorted(products)
    res = []
    for k in range(1, len(searchWord) + 1):
        p = searchWord[:k]
        i = bisect_left(products, p)          # 第一個 ≥ 前綴的位置
        res.append([w for w in products[i:i + 3] if w.startswith(p)])
    return res`,
        c: `static int cmp(const void *a, const void *b) { return strcmp(*(char **)a, *(char **)b); }

char ***suggestedProducts(char **products, int productsSize, char *searchWord, int *returnSize, int **returnColumnSizes) {
    char **ps = malloc(productsSize * sizeof(char *));
    memcpy(ps, products, productsSize * sizeof(char *));
    qsort(ps, productsSize, sizeof(char *), cmp);
    int m = strlen(searchWord);
    char ***res = malloc(m * sizeof(char **));
    *returnColumnSizes = malloc(m * sizeof(int));
    for (int k = 1; k <= m; k++) {
        int lo = 0, hi = productsSize;
        while (lo < hi) {                     // 第一個前 k 個字 ≥ 前綴的位置
            int mid = (lo + hi) / 2;
            if (strncmp(ps[mid], searchWord, k) < 0) lo = mid + 1; else hi = mid;
        }
        res[k - 1] = malloc(3 * sizeof(char *));
        int c = 0;
        for (int i = lo; i < productsSize && c < 3 && !strncmp(ps[i], searchWord, k); i++) res[k - 1][c++] = ps[i];
        (*returnColumnSizes)[k - 1] = c;
    }
    *returnSize = m;
    return res;
}`,
        cpp: `vector<vector<string>> suggestedProducts(vector<string>& products, string searchWord) {
    sort(products.begin(), products.end());
    vector<vector<string>> res;
    string p;
    for (char ch : searchWord) {
        p += ch;
        auto it = lower_bound(products.begin(), products.end(), p);
        vector<string> row;
        for (; it != products.end() && row.size() < 3 && it->compare(0, p.size(), p) == 0; ++it) row.push_back(*it);
        res.push_back(row);
    }
    return res;
}`,
        java: `List<List<String>> suggestedProducts(String[] products, String searchWord) {
    String[] ps = products.clone();
    Arrays.sort(ps);
    List<List<String>> res = new ArrayList<>();
    for (int k = 1; k <= searchWord.length(); k++) {
        String p = searchWord.substring(0, k);
        int lo = 0, hi = ps.length;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (ps[mid].compareTo(p) < 0) lo = mid + 1; else hi = mid;
        }
        List<String> row = new ArrayList<>();
        for (int i = lo; i < ps.length && row.size() < 3 && ps[i].startsWith(p); i++) row.add(ps[i]);
        res.add(row);
    }
    return res;
}`,
        javascript: `function suggestedProducts(products, searchWord) {
  const ps = [...products].sort();
  const res = [];
  for (let k = 1; k <= searchWord.length; k++) {
    const p = searchWord.slice(0, k);
    let lo = 0, hi = ps.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (ps[mid] < p) lo = mid + 1;
      else hi = mid;
    }
    const row = [];
    for (let i = lo; i < ps.length && row.length < 3 && ps[i].startsWith(p); i++) row.push(ps[i]);
    res.push(row);
  }
  return res;
}`,
      },
    },
    {
      name: '字典樹,每個節點存前 3 個建議',
      idea: '把排序後的產品依序插入字典樹;沿路每個節點的清單不滿 3 個就加入。查詢時沿 searchWord 往下走。',
      steps: ['排序 products(這樣插入順序就是字典序)', '插入 w:沿路每個節點 `if len(sug) < 3: sug.append(w)`', '查詢:沿著 searchWord 走,每一步輸出節點的 sug;走到不存在的子節點後都輸出 []'],
      figure: { title: `searchWord = "${W}"`, steps: trieFig() },
      complexity: { time: 'O(n log n · L + 總字元數 + m)', space: 'O(總字元數)', why: '每個字元建一個節點;查詢每一步 O(1)。' },
      verdict: '查詢最快,適合同一組產品要回答很多次搜尋的情境(真正的自動完成就是這樣做的)。',
      code: {
        python: `def suggestedProducts(products, searchWord):
    root = {}
    for w in sorted(products):
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
            sug = node.setdefault('#', [])
            if len(sug) < 3:
                sug.append(w)                 # 排序後插入,先進來的就是字典序小的
    res, node = [], root
    for ch in searchWord:
        node = node.get(ch) if node else None # 分支斷了之後一直是 None
        res.append(list(node['#']) if node else [])
    return res`,
        c: `typedef struct TN { struct TN *ch[26]; char *sug[3]; int n; } TN;

static int cmp(const void *a, const void *b) { return strcmp(*(char **)a, *(char **)b); }

char ***suggestedProducts(char **products, int productsSize, char *searchWord, int *returnSize, int **returnColumnSizes) {
    char **ps = malloc(productsSize * sizeof(char *));
    memcpy(ps, products, productsSize * sizeof(char *));
    qsort(ps, productsSize, sizeof(char *), cmp);
    TN *root = calloc(1, sizeof(TN));
    for (int i = 0; i < productsSize; i++) {
        TN *t = root;
        for (char *p = ps[i]; *p; p++) {
            if (!t->ch[*p - 'a']) t->ch[*p - 'a'] = calloc(1, sizeof(TN));
            t = t->ch[*p - 'a'];
            if (t->n < 3) t->sug[t->n++] = ps[i];
        }
    }
    int m = strlen(searchWord);
    char ***res = malloc(m * sizeof(char **));
    *returnColumnSizes = malloc(m * sizeof(int));
    TN *t = root;
    for (int k = 0; k < m; k++) {
        t = t ? t->ch[searchWord[k] - 'a'] : NULL;
        res[k] = malloc(3 * sizeof(char *));
        int c = t ? t->n : 0;
        for (int j = 0; j < c; j++) res[k][j] = t->sug[j];
        (*returnColumnSizes)[k] = c;
    }
    *returnSize = m;
    return res;
}`,
        cpp: `struct TN { TN *ch[26] = {}; vector<string> sug; };

vector<vector<string>> suggestedProducts(vector<string>& products, string searchWord) {
    sort(products.begin(), products.end());
    TN *root = new TN();
    for (auto &w : products) {
        TN *t = root;
        for (char c : w) {
            if (!t->ch[c - 'a']) t->ch[c - 'a'] = new TN();
            t = t->ch[c - 'a'];
            if (t->sug.size() < 3) t->sug.push_back(w);
        }
    }
    vector<vector<string>> res;
    TN *t = root;
    for (char c : searchWord) {
        t = t ? t->ch[c - 'a'] : nullptr;
        res.push_back(t ? t->sug : vector<string>{});
    }
    return res;
}`,
        java: `private static class TN { TN[] ch = new TN[26]; List<String> sug = new ArrayList<>(); }

List<List<String>> suggestedProducts(String[] products, String searchWord) {
    String[] ps = products.clone();
    Arrays.sort(ps);
    TN root = new TN();
    for (String w : ps) {
        TN t = root;
        for (char c : w.toCharArray()) {
            if (t.ch[c - 'a'] == null) t.ch[c - 'a'] = new TN();
            t = t.ch[c - 'a'];
            if (t.sug.size() < 3) t.sug.add(w);
        }
    }
    List<List<String>> res = new ArrayList<>();
    TN t = root;
    for (char c : searchWord.toCharArray()) {
        t = t == null ? null : t.ch[c - 'a'];
        res.add(t == null ? new ArrayList<>() : t.sug);
    }
    return res;
}`,
        javascript: `function suggestedProducts(products, searchWord) {
  const root = {};
  for (const w of [...products].sort()) {
    let t = root;
    for (const c of w) {
      t = t[c] ??= { sug: [] };
      if (t.sug.length < 3) t.sug.push(w);
    }
  }
  const res = [];
  let t = root;
  for (const c of searchWord) {
    t = t ? t[c] : undefined;
    res.push(t ? [...t.sug] : []);
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['沒排序就取前 3 個:題目要的是字典序最小的 3 個', '前綴已經找不到之後還繼續查:之後全部都是空清單', '字典樹用 "#" 當特殊鍵時,要確定不會和字母衝突'],
  check: {
    kind: 'fn',
    fn: 'suggestedProducts',
    cases: [
      { args: [P, W], out: [['mobile', 'moneypot', 'monitor'], ['mobile', 'moneypot', 'monitor'], ['mouse', 'mousepad'], ['mouse', 'mousepad'], ['mouse', 'mousepad']] },
      { args: [['havana'], 'havana'], out: [['havana'], ['havana'], ['havana'], ['havana'], ['havana'], ['havana']] },
      { args: [['havana'], 'tatiana'], out: [[], [], [], [], [], [], []] },
      { args: [['bags', 'baggage', 'banner', 'box', 'cloths'], 'bags'], out: [['baggage', 'bags', 'banner'], ['baggage', 'bags', 'banner'], ['baggage', 'bags'], ['bags']] },
    ],
  },
}

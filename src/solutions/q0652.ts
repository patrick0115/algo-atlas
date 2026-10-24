import { kv, tree } from './fig'
import type { FigStep, Solution } from './types'

// 652. Find Duplicate Subtrees

const T = [1, 2, 3, 4, null, 2, 4, null, null, 4]

function serFig(): FigStep[] {
  return [
    { note: '兩棵子樹「一樣」= 結構和值都一樣。把每棵子樹用後序轉成一個字串(空的寫 #),一樣的子樹字串就一樣', views: [tree(T)] },
    { note: '節點 4(葉子)→ "#,#,4";左邊的 2(左孩子 4)→ "#,#,4,#,2"。用 Hash 表數每種字串出現幾次', views: [tree(T, { cls: { 3: 'hl', 6: 'hl', 9: 'hl', 1: 'cur', 5: 'cur' } }), kv([['#,#,4', 3], ['#,#,4,#,2', 2]], '子樹字串 → 次數')] },
    { note: '次數剛好變成 2 的那一刻,把這個根放進答案(之後第 3 次就不再加)→ 答案是 [4] 和 [2,4] 這兩種', views: [tree(T, { cls: { 3: 'done', 1: 'done' } })] },
  ]
}

function idFig(): FigStep[] {
  return [
    { note: '字串可能很長(每棵子樹的字串長度 = 子樹大小)。改成給每種子樹一個編號:子樹 = (左子樹編號, 值, 右子樹編號) 這個三元組', views: [kv([['(0, 4, 0)', 1], ['(1, 2, 0)', 2], ['(2, 3, 1)…', 3]], '三元組 → 編號(0 = 空)')] },
    { note: '三元組只有三個數,查表是 O(1);一樣的子樹會拿到一樣的編號。整體 O(n)', views: [tree(T, { cls: { 3: 'done', 1: 'done' } })] },
  ]
}

const WRAP = {
  python: `

def dupSerial(root):                          # 測試用:把答案的每棵樹轉成前序字串
    def ser(n):
        return '#' if not n else f'{n.val},{ser(n.left)},{ser(n.right)}'
    return [ser(t) for t in findDuplicateSubtrees(root)]`,
  c: `

static int serTo(struct TreeNode *n, char *out) {
    if (!n) { out[0] = '#'; return 1; }
    int k = sprintf(out, "%d,", n->val);
    k += serTo(n->left, out + k);
    out[k++] = ',';
    k += serTo(n->right, out + k);
    return k;
}

char **dupSerial(struct TreeNode *root, int *returnSize) {
    int cnt;
    struct TreeNode **ts = findDuplicateSubtrees(root, &cnt);
    char **res = malloc((cnt + 1) * sizeof(char *));
    for (int i = 0; i < cnt; i++) {
        res[i] = malloc(100000);
        res[i][serTo(ts[i], res[i])] = '\\0';
    }
    *returnSize = cnt;
    return res;
}`,
  cpp: `

string ser(TreeNode *n) { return n ? to_string(n->val) + "," + ser(n->left) + "," + ser(n->right) : "#"; }

vector<string> dupSerial(TreeNode* root) {
    vector<string> res;
    for (TreeNode *t : findDuplicateSubtrees(root)) res.push_back(ser(t));
    return res;
}`,
  java: `

private String ser(TreeNode n) { return n == null ? "#" : n.val + "," + ser(n.left) + "," + ser(n.right); }

List<String> dupSerial(TreeNode root) {
    List<String> res = new ArrayList<>();
    for (TreeNode t : findDuplicateSubtrees(root)) res.add(ser(t));
    return res;
}`,
  javascript: `

function dupSerial(root) {
  const ser = (n) => (n ? n.val + ',' + ser(n.left) + ',' + ser(n.right) : '#');
  return findDuplicateSubtrees(root).map(ser);
}`,
}

export const q0652: Solution = {
  id: 652,
  plain: '一棵樹裡,找出所有「長得一模一樣」(結構和數字都相同)而且出現不只一次的子樹,每一種回傳一個就好。',
  statement: '給二元樹的根 `root`,回傳所有**重複的子樹**:對每一種重複的子樹,只需回傳其中任一棵的根。兩棵樹結構相同且對應節點值相同,即為重複。(這裡用 `dupSerial(root)` 把答案轉成前序字串來比對。)',
  examples: [
    { input: 'root = [1,2,3,4,null,2,4,null,null,4]', output: '[[2,4],[4]]' },
    { input: 'root = [2,1,1]', output: '[[1]]' },
    { input: 'root = [2,2,2,3,null,3,null]', output: '[[2,3],[3]]' },
  ],
  constraints: ['節點數 ≤ 5000'],
  insight: ['「一樣的子樹」→ 需要一種能比較子樹的「指紋」', '後序把子樹轉成字串:孩子的字串先算好,再組出自己的', 'Hash 表數每種指紋出現幾次,剛好第 2 次時加入答案(避免重複加入)'],
  approaches: [
    {
      name: '序列化字串 + Hash 計數',
      idea: '後序:`key = left_key + "," + right_key + "," + val`;`cnt[key] += 1`,等於 2 時把這個節點加進答案。',
      steps: ['`dfs(node)`:空 → "#"', '`key = dfs(left) + "," + dfs(right) + "," + str(val)`', '`cnt[key] += 1`;`cnt[key] == 2` → 加入答案', '回傳 key'],
      figure: { title: `root = [${T}]`, steps: serFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '每個節點建一個長度 = 子樹大小的字串,最壞(一條鏈)總長 O(n²)。' },
      verdict: '最好寫、最常見。注意序列化一定要包含空節點,否則 [1, 2] 和 [1, null, 2] 會撞在一起。',
      code: {
        python: `def findDuplicateSubtrees(root):
    cnt, res = {}, []

    def dfs(n):
        if not n:
            return '#'
        key = dfs(n.left) + ',' + dfs(n.right) + ',' + str(n.val)   # 後序指紋
        cnt[key] = cnt.get(key, 0) + 1
        if cnt[key] == 2:                     # 剛好第二次:加一次就好
            res.append(n)
        return key

    dfs(root)
    return res${WRAP.python}`,
        c: `// 字串指紋存進 uthash
typedef struct { char *key; int cnt; UT_hash_handle hh; } Entry;
static Entry *tab_;
static struct TreeNode **res_;
static int rn_;

static char *dfs(struct TreeNode *n) {
    if (!n) return strdup("#");
    char *l = dfs(n->left), *r = dfs(n->right);
    char *key = malloc(strlen(l) + strlen(r) + 16);
    sprintf(key, "%s,%s,%d", l, r, n->val);
    free(l); free(r);
    Entry *e;
    HASH_FIND_STR(tab_, key, e);
    if (!e) { e = malloc(sizeof(Entry)); e->key = strdup(key); e->cnt = 0; HASH_ADD_KEYPTR(hh, tab_, e->key, strlen(e->key), e); }
    if (++e->cnt == 2) res_[rn_++] = n;
    return key;
}

struct TreeNode **findDuplicateSubtrees(struct TreeNode *root, int *returnSize) {
    tab_ = NULL; rn_ = 0;
    res_ = malloc(5005 * sizeof(struct TreeNode *));
    free(dfs(root));
    Entry *e, *t;
    HASH_ITER(hh, tab_, e, t) { HASH_DEL(tab_, e); free(e->key); free(e); }
    *returnSize = rn_;
    return res_;
}${WRAP.c}`,
        cpp: `unordered_map<string, int> cnt;
vector<TreeNode*> res;

string dfs(TreeNode *n) {
    if (!n) return "#";
    string key = dfs(n->left) + "," + dfs(n->right) + "," + to_string(n->val);
    if (++cnt[key] == 2) res.push_back(n);
    return key;
}

vector<TreeNode*> findDuplicateSubtrees(TreeNode* root) {
    cnt.clear(); res.clear();
    dfs(root);
    return res;
}${WRAP.cpp}`,
        java: `private Map<String, Integer> cnt;
private List<TreeNode> res;

List<TreeNode> findDuplicateSubtrees(TreeNode root) {
    cnt = new HashMap<>();
    res = new ArrayList<>();
    dfs(root);
    return res;
}

private String dfs(TreeNode n) {
    if (n == null) return "#";
    String key = dfs(n.left) + "," + dfs(n.right) + "," + n.val;
    if (cnt.merge(key, 1, Integer::sum) == 2) res.add(n);
    return key;
}${WRAP.java}`,
        javascript: `function findDuplicateSubtrees(root) {
  const cnt = new Map(), res = [];
  const dfs = (n) => {
    if (!n) return '#';
    const key = dfs(n.left) + ',' + dfs(n.right) + ',' + n.val;
    const c = (cnt.get(key) ?? 0) + 1;
    cnt.set(key, c);
    if (c === 2) res.push(n);
    return key;
  };
  dfs(root);
  return res;
}${WRAP.javascript}`,
      },
    },
    {
      name: '三元組編號(O(n))',
      idea: '每種子樹給一個整數 id:`id = ids[(id(left), val, id(right))]`(沒見過就配新號碼);同一個 id 出現第 2 次就加入答案。',
      steps: ['`ids = {}`、`cnt = {}`', '`dfs(node)`:空 → 0', '`t = (dfs(left), val, dfs(right))`;`t` 沒見過 → `ids[t] = len(ids) + 1`', '`cnt[ids[t]] += 1`;等於 2 → 加入答案;回傳 `ids[t]`'],
      figure: { title: `root = [${T}]`, steps: idFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點的指紋是固定大小的三元組。' },
      verdict: '指紋從「整棵子樹的字串」縮成「三個整數」,是處理大樹時的標準優化。',
      code: {
        python: `def findDuplicateSubtrees(root):
    ids, cnt, res = {}, {}, []

    def dfs(n):
        if not n:
            return 0
        t = (dfs(n.left), n.val, dfs(n.right))
        if t not in ids:
            ids[t] = len(ids) + 1             # 新的一種子樹
        i = ids[t]
        cnt[i] = cnt.get(i, 0) + 1
        if cnt[i] == 2:
            res.append(n)
        return i

    dfs(root)
    return res${WRAP.python}`,
        c: `// 三元組 (左 id, 值, 右 id) 編成一個 64 位元鍵(id < 2¹⁴、值 < 2¹⁴)
typedef struct { long long key; int id, cnt; UT_hash_handle hh; } Entry;
static Entry *tab_;
static int nid_, rn_;
static struct TreeNode **res_;

static int dfs(struct TreeNode *n) {
    if (!n) return 0;
    long long key = ((long long)dfs(n->left) << 30) | ((long long)(n->val + 300) << 15) | dfs(n->right);
    Entry *e;
    HASH_FIND(hh, tab_, &key, sizeof key, e);
    if (!e) { e = malloc(sizeof(Entry)); e->key = key; e->id = ++nid_; e->cnt = 0; HASH_ADD(hh, tab_, key, sizeof key, e); }
    if (++e->cnt == 2) res_[rn_++] = n;
    return e->id;
}

struct TreeNode **findDuplicateSubtrees(struct TreeNode *root, int *returnSize) {
    tab_ = NULL; nid_ = 0; rn_ = 0;
    res_ = malloc(5005 * sizeof(struct TreeNode *));
    dfs(root);
    Entry *e, *t;
    HASH_ITER(hh, tab_, e, t) { HASH_DEL(tab_, e); free(e); }
    *returnSize = rn_;
    return res_;
}${WRAP.c}`,
        cpp: `map<tuple<int, int, int>, int> ids;
unordered_map<int, int> cnt;
vector<TreeNode*> res;

int dfs(TreeNode *n) {
    if (!n) return 0;
    auto t = make_tuple(dfs(n->left), n->val, dfs(n->right));
    auto it = ids.find(t);
    int i = it == ids.end() ? (ids[t] = ids.size() + 1) : it->second;
    if (++cnt[i] == 2) res.push_back(n);
    return i;
}

vector<TreeNode*> findDuplicateSubtrees(TreeNode* root) {
    ids.clear(); cnt.clear(); res.clear();
    dfs(root);
    return res;
}${WRAP.cpp}`,
        java: `private Map<String, Integer> ids;
private Map<Integer, Integer> cnt;
private List<TreeNode> res;

List<TreeNode> findDuplicateSubtrees(TreeNode root) {
    ids = new HashMap<>(); cnt = new HashMap<>(); res = new ArrayList<>();
    dfs(root);
    return res;
}

private int dfs(TreeNode n) {
    if (n == null) return 0;
    String t = dfs(n.left) + "," + n.val + "," + dfs(n.right);   // 三個整數組成的短鍵
    int i = ids.computeIfAbsent(t, k -> ids.size() + 1);
    if (cnt.merge(i, 1, Integer::sum) == 2) res.add(n);
    return i;
}${WRAP.java}`,
        javascript: `function findDuplicateSubtrees(root) {
  const ids = new Map(), cnt = new Map(), res = [];
  const dfs = (n) => {
    if (!n) return 0;
    const t = dfs(n.left) + ',' + n.val + ',' + dfs(n.right);
    if (!ids.has(t)) ids.set(t, ids.size + 1);
    const i = ids.get(t), c = (cnt.get(i) ?? 0) + 1;
    cnt.set(i, c);
    if (c === 2) res.push(n);
    return i;
  };
  dfs(root);
  return res;
}${WRAP.javascript}`,
      },
    },
  ],
  pitfalls: ['序列化沒有標記空節點:不同形狀的樹會得到一樣的字串', '用 `cnt >= 2` 加入答案:同一種會被加好幾次', '用中序序列化:即使標了空節點,中序也可能有歧義,用前序或後序'],
  check: {
    kind: 'fn',
    fn: 'dupSerial',
    compare: 'sorted',
    argKinds: ['tree'],
    cases: [
      { args: [T], out: ['2,4,#,#,#', '4,#,#'] },
      { args: [[2, 1, 1]], out: ['1,#,#'] },
      { args: [[2, 2, 2, 3, null, 3, null]], out: ['2,3,#,#,#', '3,#,#'] },
      { args: [[1]], out: [] },
    ],
  },
}

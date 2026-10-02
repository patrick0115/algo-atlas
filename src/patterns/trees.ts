import type { Frame, GraphViewData, Pattern } from '../types'
import { arr, parseInt_, parseInts, randInt, randInts, treeLayout } from '../engine/helpers'
import { forestView, parseTree, randomTree, serialize, treeView, type GNode, type TNode } from '../engine/tree'

const C_TREE = 'struct TreeNode { int val; struct TreeNode *left, *right; };'

// ===== 樹的 DFS(前序 / 中序 / 後序) =====

function* dfsRun(v: Record<string, string>): Generator<Frame> {
  const root = parseTree(v.tree)
  if (!root) throw new Error('樹不能是空的')
  const pre: number[] = []
  const ino: number[] = []
  const post: number[] = []
  const cls = new Map<number, string>()
  const f = (line: string, note: string, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [
      treeView(root, { cls, label: '黑色:目前所在節點 · 灰色:遞迴還沒結束的祖先 · 淡色:整棵子樹處理完了' }),
      arr(pre, { label: '前序(第一次到達時記錄):根 → 左 → 右' }),
      arr(ino, { label: '中序(左子樹做完時記錄):左 → 根 → 右' }),
      arr(post, { label: '後序(要離開時記錄):左 → 右 → 根' }),
    ],
  })
  function* dfs(n: TNode, from: string): Generator<Frame> {
    cls.set(n.id, 'hl')
    pre.push(n.val)
    yield f('pre', `${from}到達 ${n.val}。第一次到這裡 → 記進「前序」`)
    if (n.left) {
      cls.set(n.id, 'cmp')
      yield f('left', `${n.val} 有左孩子,先往左走(${n.val} 還沒做完,先暫停在這裡)`)
      yield* dfs(n.left, `從 ${n.val} 往左,`)
      cls.set(n.id, 'hl')
    }
    ino.push(n.val)
    yield f('in', `回到 ${n.val},左子樹做完了 → 記進「中序」`)
    if (n.right) {
      cls.set(n.id, 'cmp')
      yield f('right', `${n.val} 有右孩子,往右走`)
      yield* dfs(n.right, `從 ${n.val} 往右,`)
      cls.set(n.id, 'hl')
    }
    post.push(n.val)
    cls.set(n.id, 'done')
    yield f('post', `${n.val} 的左右都做完了,要離開前 → 記進「後序」,回到上一層`)
  }
  yield* dfs(root, '從樹根開始,')
  yield f('done', '整棵樹走完了。同一次 DFS,只是「在哪個時間點記錄」不同,就得到三種順序', `${pre}|${ino}|${post}`)
}

function refTraversals(s: string) {
  const root = parseTree(s)
  const pre: number[] = []
  const ino: number[] = []
  const post: number[] = []
  const go = (n: TNode | null) => {
    if (!n) return
    pre.push(n.val)
    go(n.left)
    ino.push(n.val)
    go(n.right)
    post.push(n.val)
  }
  go(root)
  return `${pre}|${ino}|${post}`
}

export const treeDfs: Pattern = {
  id: 'tree-dfs',
  summary: 'DFS(深度優先)就是「一條路走到底,走不下去再退回來」。在樹上用遞迴寫最自然:處理自己、遞迴左子樹、遞迴右子樹。「處理自己」放在哪個位置,就決定了前序、中序、後序。',
  analogy: '走迷宮時用「右手扶牆」:一路往裡走,遇到死路就退回上一個岔路口換另一條。每個岔路口你會經過三次:進去時、從左邊回來時、從右邊回來時。',
  steps: [
    '空節點直接返回(遞迴的終點)',
    '前序位置:剛到達節點時做事',
    '遞迴左子樹',
    '中序位置:左子樹做完、右子樹還沒開始時做事',
    '遞迴右子樹',
    '後序位置:左右子樹都做完、要離開時做事(這時已經拿到左右子樹的結果了)',
  ],
  watch: ['黑色是目前所在節點,灰色是「還在等孩子回來」的祖先(就是遞迴呼叫堆疊)', '下面三排分別在不同時間點長出來', '後序時左右子樹都已經做完 —— 所以「需要子樹資訊」的題目用後序'],
  whenToUse: [
    '前序:由上往下傳資訊(路徑和、目前深度、上下界)',
    '中序:BST 的中序就是由小到大排好的',
    '後序:需要左右子樹的結果才能算自己(高度、直徑、最大路徑和、平衡)',
    '幾乎所有二元樹題目都是這個框架的變形',
  ],
  pitfalls: ['一定要先處理空節點,否則會存取 null', '想清楚函式「回傳什麼」:很多題目回傳值和要求的答案不同(例如直徑題回傳高度,用全域變數記答案)', '樹很深時遞迴可能堆疊溢位 → 改用迴圈 + 堆疊'],
  complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點拜訪一次;遞迴深度等於樹高 h(最壞 n)。' },
  demo: {
    title: '一次 DFS 同時得到前序、中序、後序',
    inputs: [{ key: 'tree', label: '樹(LeetCode 層序格式)', default: '1,2,3,4,5,null,6' }],
    run: dfsRun,
    reference: (v) => refTraversals(v.tree),
    random: () => ({ tree: randomTree(randInt(1, 10)) }),
    code: {
      python: `def dfs(node):
    if node is None:
        return
    pre.append(node.val)          # 前序位置    #@pre
    dfs(node.left)                              #@left
    ino.append(node.val)          # 中序位置    #@in
    dfs(node.right)                             #@right
    post.append(node.val)         # 後序位置    #@post
# 呼叫 dfs(root) 後 pre / ino / post 就是答案  #@done`,
      c: `${C_TREE}
int pre[100], ino[100], post[100], np, ni, nq;
void dfs(struct TreeNode *node) {
    if (!node) return;
    pre[np++] = node->val;        // 前序位置   //@pre
    dfs(node->left);                            //@left
    ino[ni++] = node->val;        // 中序位置   //@in
    dfs(node->right);                           //@right
    post[nq++] = node->val;       // 後序位置   //@post
}
// 呼叫 dfs(root);                              //@done`,
      cpp: `vector<int> pre, ino, post;
void dfs(TreeNode* node) {
    if (!node) return;
    pre.push_back(node->val);     // 前序位置   //@pre
    dfs(node->left);                            //@left
    ino.push_back(node->val);     // 中序位置   //@in
    dfs(node->right);                           //@right
    post.push_back(node->val);    // 後序位置   //@post
}
// 呼叫 dfs(root);                              //@done`,
      java: `List<Integer> pre = new ArrayList<>(), ino = new ArrayList<>(), post = new ArrayList<>();
void dfs(TreeNode node) {
    if (node == null) return;
    pre.add(node.val);            // 前序位置   //@pre
    dfs(node.left);                             //@left
    ino.add(node.val);            // 中序位置   //@in
    dfs(node.right);                            //@right
    post.add(node.val);           // 後序位置   //@post
}
// 呼叫 dfs(root);                              //@done`,
      javascript: `const pre = [], ino = [], post = [];
function dfs(node) {
  if (!node) return;
  pre.push(node.val);             // 前序位置   //@pre
  dfs(node.left);                               //@left
  ino.push(node.val);             // 中序位置   //@in
  dfs(node.right);                              //@right
  post.push(node.val);            // 後序位置   //@post
}
// 呼叫 dfs(root);                              //@done`,
    },
  },
}

// ===== 樹的 BFS(102. 層序遍歷) =====

function* bfsRun(v: Record<string, string>): Generator<Frame> {
  const root = parseTree(v.tree)
  if (!root) throw new Error('樹不能是空的')
  const cls = new Map<number, string>()
  let q: TNode[] = []
  const levels: number[][] = []
  const f = (line: string, note: string, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : { 層數: levels.length },
    views: [
      treeView(root, { cls, label: '黑色:正在處理 · 虛線框:在佇列中排隊 · 淡色:已處理' }),
      arr(q.map((n) => n.val), { label: '佇列 queue(左邊先出、右邊排隊)' }),
      arr(levels.map((l) => l.join(' ')), { label: '結果:每一層' }),
    ],
  })
  q = [root]
  cls.set(root.id, 'queued')
  yield f('init', '把樹根放進佇列')
  while (q.length) {
    const size = q.length
    const level: number[] = []
    yield f('level', `新的一層開始:佇列裡現在有 ${size} 個節點,剛好就是這一層的全部`)
    for (let i = 0; i < size; i++) {
      const n = q.shift()!
      cls.set(n.id, 'hl')
      level.push(n.val)
      yield f('pop', `從佇列前面拿出 ${n.val},加入這一層`)
      for (const c of [n.left, n.right]) {
        if (!c) continue
        q.push(c)
        cls.set(c.id, 'queued')
        yield f('push', `${n.val} 的孩子 ${c.val} 排到佇列後面(下一層再處理)`)
      }
      cls.set(n.id, 'done')
    }
    levels.push(level)
    yield f('record', `這一層處理完:[${level.join(', ')}]`)
  }
  yield f('done', '佇列空了,整棵樹一層一層走完', levels.map((l) => l.join(',')).join('|'))
}

export const treeBfs: Pattern = {
  id: 'tree-bfs',
  summary: 'BFS(廣度優先)是「一層一層往外擴」:先處理離起點最近的,再處理第二近的。用佇列(先進先出)實作,每處理一個節點,就把它的孩子排到隊尾。',
  analogy: '石頭丟進水裡的漣漪:一圈一圈往外擴散,先碰到近的、再碰到遠的。',
  steps: ['把樹根放進佇列', '每一層開始時,記下佇列目前的長度 size —— 這就是這一層有幾個節點', '拿出 size 個節點處理,同時把它們的孩子放到佇列尾端', '佇列空了就結束'],
  watch: ['虛線框的節點正在佇列裡排隊', '注意「記下 size」這個技巧:它讓我們知道一層在哪裡結束'],
  whenToUse: ['按層處理:層序遍歷、每層平均、右視圖、鋸齒狀遍歷', '最小深度:BFS 第一次碰到葉子就是答案', '「最少幾步」類型的題目(圖的 BFS 也是同樣原理)'],
  pitfalls: ['要在迴圈開始前就存好 size,不能在迴圈中一直讀 queue.length', 'Python 用 collections.deque,list.pop(0) 是 O(n)'],
  complexity: { time: 'O(n)', space: 'O(w)', why: '每個節點進出佇列各一次;佇列最多裝下最寬的一層 w 個節點。' },
  demo: {
    title: '二元樹的層序遍歷(LeetCode 102)',
    inputs: [{ key: 'tree', label: '樹(LeetCode 層序格式)', default: '3,9,20,null,null,15,7,8' }],
    run: bfsRun,
    reference: (v) => {
      const root = parseTree(v.tree)
      const out: number[][] = []
      const go = (n: TNode | null, d: number) => {
        if (!n) return
        ;(out[d] ??= []).push(n.val)
        go(n.left, d + 1)
        go(n.right, d + 1)
      }
      go(root, 0)
      return out.map((l) => l.join(',')).join('|')
    },
    random: () => ({ tree: randomTree(randInt(1, 12)) }),
    code: {
      python: `from collections import deque
def level_order(root):
    res, q = [], deque([root])                  #@init
    while q:
        size, level = len(q), []                #@level
        for _ in range(size):
            node = q.popleft()                  #@pop
            level.append(node.val)              #@pop
            for c in (node.left, node.right):
                if c: q.append(c)               #@push
        res.append(level)                       #@record
    return res                                  #@done`,
      c: `${C_TREE}
// 回傳每層節點值(簡化:直接印出)
void levelOrder(struct TreeNode *root) {
    struct TreeNode *q[1000]; int head = 0, tail = 0;
    q[tail++] = root;                           //@init
    while (head < tail) {
        int size = tail - head;                 //@level
        for (int i = 0; i < size; i++) {
            struct TreeNode *n = q[head++];     //@pop
            printf("%d ", n->val);              //@pop
            if (n->left)  q[tail++] = n->left;  //@push
            if (n->right) q[tail++] = n->right; //@push
        }
        printf("\\n");                          //@record
    }
}                                               //@done`,
      cpp: `vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res;
    queue<TreeNode*> q; q.push(root);           //@init
    while (!q.empty()) {
        int size = q.size(); vector<int> level; //@level
        for (int i = 0; i < size; i++) {
            TreeNode* n = q.front(); q.pop();   //@pop
            level.push_back(n->val);            //@pop
            if (n->left)  q.push(n->left);      //@push
            if (n->right) q.push(n->right);     //@push
        }
        res.push_back(level);                   //@record
    }
    return res;                                 //@done
}`,
      java: `List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    Queue<TreeNode> q = new LinkedList<>(); q.add(root);    //@init
    while (!q.isEmpty()) {
        int size = q.size(); List<Integer> level = new ArrayList<>();  //@level
        for (int i = 0; i < size; i++) {
            TreeNode n = q.poll();              //@pop
            level.add(n.val);                   //@pop
            if (n.left != null)  q.add(n.left); //@push
            if (n.right != null) q.add(n.right);//@push
        }
        res.add(level);                         //@record
    }
    return res;                                 //@done
}`,
      javascript: `function levelOrder(root) {
  const res = [], q = [root];                   //@init
  while (q.length) {
    const size = q.length, level = [];          //@level
    for (let i = 0; i < size; i++) {
      const n = q.shift();                      //@pop
      level.push(n.val);                        //@pop
      if (n.left)  q.push(n.left);              //@push
      if (n.right) q.push(n.right);             //@push
    }
    res.push(level);                            //@record
  }
  return res;                                   //@done
}`,
    },
  },
}

// ===== 二元搜尋樹 =====

function* bstRun(v: Record<string, string>): Generator<Frame> {
  const vals = parseInts(v.values, '插入的數', { maxLen: 12, min: 0, max: 99 })
  const target = parseInt_(v.target, 'target', 0, 99)
  let root: TNode | null = null
  let id = 0
  const cls = new Map<number, string>()
  const f = (line: string, note: string, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { target, answer } : { target },
    views: [treeView(root, { cls, label: 'BST:每個節點的左子樹都比它小,右子樹都比它大' })],
  })
  for (const x of vals) {
    cls.clear()
    if (!root) {
      root = { id: id++, val: x, left: null, right: null }
      cls.set(root.id, 'hl')
      yield f('place', `插入 ${x}:樹是空的,${x} 當樹根`)
      continue
    }
    let cur = root
    while (true) {
      cls.set(cur.id, 'cmp')
      const side = x < cur.val ? 'left' : 'right'
      yield f('insert', `插入 ${x}:和 ${cur.val} 比,${x < cur.val ? '比較小 → 往左' : '大於等於 → 往右'}`)
      if (!cur[side]) {
        cur[side] = { id: id++, val: x, left: null, right: null }
        cls.set(cur[side]!.id, 'hl')
        yield f('place', `${side === 'left' ? '左' : '右'}邊是空的,${x} 放在這裡`)
        break
      }
      cur = cur[side]!
    }
  }
  cls.clear()
  yield f('search', `樹建好了。現在搜尋 ${target}:從樹根開始,每次只需要往一邊走`)
  let cur = root
  while (cur) {
    cls.set(cur.id, 'hl')
    if (cur.val === target) {
      yield f('found', `${cur.val} == ${target},找到了!只比較了 ${[...cls.keys()].length} 次`, 'found')
      return
    }
    const goLeft = target < cur.val
    yield f('search', `${target} ${goLeft ? '<' : '>'} ${cur.val} → ${goLeft ? '往左' : '往右'}(另一邊整棵子樹都不用看)`)
    cls.set(cur.id, 'cmp')
    cur = goLeft ? cur.left : cur.right
  }
  yield f('none', `走到空的位置,${target} 不在樹裡`, 'none')
}

export const bst: Pattern = {
  id: 'bst',
  summary: '二元搜尋樹(BST)的規則:左子樹的所有值 < 節點 < 右子樹的所有值。所以找東西時,每到一個節點只要比一次大小,就能丟掉一整邊 —— 就像在樹上做二分搜尋。',
  analogy: '像字典的分頁:要找「蘋果」,翻開一頁是「貓」,蘋果在貓前面,後半本就不用看了。',
  steps: ['搜尋:從樹根開始,目標小往左、大往右,相等就找到', '插入:像搜尋一樣往下走,走到空位就放下', '中序遍歷 BST 會得到由小到大的序列', '驗證 BST:往下遞迴時傳「允許的上下界」'],
  watch: ['先看插入:每個數都從樹根一路比下去,找到自己的位置', '再看搜尋:每一步都只走一邊,灰色是走過的路'],
  whenToUse: ['題目說「二元搜尋樹」—— 幾乎一定會用到「左小右大」或「中序有序」', '第 k 小的元素(中序第 k 個)', 'BST 的最近公共祖先(兩個都小往左、都大往右)'],
  pitfalls: ['驗證 BST 不能只比較父子,要比較整個子樹 → 傳上下界', '樹不平衡時(例如依序插入 1,2,3,4)會退化成鏈結串列,變 O(n)'],
  complexity: { time: 'O(h),平衡時 O(log n)', space: 'O(1) 迴圈 / O(h) 遞迴', why: '每一層只走一個節點,最多走樹高 h 層。' },
  demo: {
    title: '依序插入建一棵 BST,然後搜尋 target',
    inputs: [
      { key: 'values', label: '依序插入', default: '8,3,10,1,6,14,4,7,13' },
      { key: 'target', label: '搜尋 target', default: '7' },
    ],
    run: bstRun,
    reference: (v) => (parseInts(v.values, 'x', { maxLen: 12, min: 0, max: 99 }).includes(Number(v.target)) ? 'found' : 'none'),
    random: () => ({ values: [...new Set(randInts(randInt(1, 6), 0, 20))].join(','), target: String(randInt(0, 20)) }),
    code: {
      python: `def insert(root, x):
    if root is None: return TreeNode(x)         #@place
    if x < root.val: root.left = insert(root.left, x)     #@insert
    else:            root.right = insert(root.right, x)   #@insert
    return root

def search(root, target):
    while root:
        if root.val == target: return root      #@found
        root = root.left if target < root.val else root.right  #@search
    return None                                 #@none`,
      c: `${C_TREE}
struct TreeNode* insert(struct TreeNode *root, int x) {
    if (!root) {                                //@place
        root = calloc(1, sizeof *root);         //@place
        root->val = x; return root;             //@place
    }
    if (x < root->val) root->left = insert(root->left, x);    //@insert
    else               root->right = insert(root->right, x);  //@insert
    return root;
}
struct TreeNode* search(struct TreeNode *root, int target) {
    while (root) {
        if (root->val == target) return root;   //@found
        root = target < root->val ? root->left : root->right;  //@search
    }
    return NULL;                                //@none
}`,
      cpp: `TreeNode* insert(TreeNode* root, int x) {
    if (!root) return new TreeNode(x);          //@place
    if (x < root->val) root->left = insert(root->left, x);    //@insert
    else               root->right = insert(root->right, x);  //@insert
    return root;
}
TreeNode* search(TreeNode* root, int target) {
    while (root) {
        if (root->val == target) return root;   //@found
        root = target < root->val ? root->left : root->right;  //@search
    }
    return nullptr;                             //@none
}`,
      java: `TreeNode insert(TreeNode root, int x) {
    if (root == null) return new TreeNode(x);   //@place
    if (x < root.val) root.left = insert(root.left, x);       //@insert
    else              root.right = insert(root.right, x);     //@insert
    return root;
}
TreeNode search(TreeNode root, int target) {
    while (root != null) {
        if (root.val == target) return root;    //@found
        root = target < root.val ? root.left : root.right;    //@search
    }
    return null;                                //@none
}`,
      javascript: `function insert(root, x) {
  if (!root) return { val: x, left: null, right: null };  //@place
  if (x < root.val) root.left = insert(root.left, x);     //@insert
  else              root.right = insert(root.right, x);   //@insert
  return root;
}
function search(root, target) {
  while (root) {
    if (root.val === target) return root;       //@found
    root = target < root.val ? root.left : root.right;    //@search
  }
  return null;                                  //@none
}`,
    },
  },
}

// ===== 最近公共祖先(236) =====

function uniqueTree(s: string): TNode {
  const root = parseTree(s)
  if (!root) throw new Error('樹不能是空的')
  const seen = new Set<number>()
  const walk = (n: TNode | null) => {
    if (!n) return
    if (seen.has(n.val)) throw new Error('示範用,樹的節點值不能重複')
    seen.add(n.val)
    walk(n.left)
    walk(n.right)
  }
  walk(root)
  return root
}

function* lcaRun(v: Record<string, string>): Generator<Frame> {
  const root = uniqueTree(v.tree)
  const p = parseInt_(v.p, 'p')
  const q = parseInt_(v.q, 'q')
  const all: number[] = []
  const collect = (n: TNode | null): void => {
    if (!n) return
    all.push(n.val)
    collect(n.left)
    collect(n.right)
  }
  collect(root)
  if (!all.includes(p) || !all.includes(q)) throw new Error('p 和 q 都要是樹裡的節點值')
  const cls = new Map<number, string>()
  const sub = new Map<number, string>()
  const f = (line: string, note: string, answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { p, q, answer } : { p, q },
    views: [treeView(root, { cls, sub, label: '節點下方:這棵子樹回報給上一層的結果' })],
  })
  function* go(n: TNode | null): Generator<Frame, TNode | null> {
    if (!n) return null
    cls.set(n.id, 'hl')
    if (n.val === p || n.val === q) {
      sub.set(n.id, `回報 ${n.val}`)
      cls.set(n.id, 'cmp')
      yield f('base', `${n.val} 就是要找的節點之一,直接回報自己(下面就算有另一個,答案也是自己)`)
      return n
    }
    yield f('left', `在 ${n.val},先問左子樹:你那邊有沒有 p 或 q?`)
    cls.set(n.id, 'queued')
    const L = yield* go(n.left)
    cls.set(n.id, 'hl')
    yield f('right', `${n.val} 的左子樹回報 ${L ? L.val : '沒有'}。再問右子樹`)
    cls.set(n.id, 'queued')
    const R = yield* go(n.right)
    cls.set(n.id, 'hl')
    if (L && R) {
      sub.set(n.id, `回報 ${n.val}`)
      cls.set(n.id, 'cmp')
      yield f('both', `左邊找到 ${L.val}、右邊找到 ${R.val} → p 和 q 分在兩邊,${n.val} 就是最近公共祖先!`)
      return n
    }
    const res = L ?? R
    sub.set(n.id, res ? `回報 ${res.val}` : '沒有')
    cls.set(n.id, res ? 'visited' : 'done')
    yield f('one', res ? `只有一邊找到,把 ${res.val} 往上傳` : `${n.val} 底下兩邊都沒有,回報「沒有」`)
    return res
  }
  const ans = (yield* go(root))!
  cls.clear()
  cls.set(ans.id, 'hl')
  yield f('done', `最近公共祖先是 ${ans.val}`, ans.val)
}

export const lca: Pattern = {
  id: 'lca',
  summary: '找兩個節點 p、q「最近的共同祖先」。用後序 DFS:每棵子樹回報「我這裡面有沒有 p 或 q」。第一個發現「左邊有一個、右邊也有一個」的節點,就是答案。',
  analogy: '族譜上找兩個人最近的共同祖先:從每個人往上追,第一個兩條路線會合的地方。',
  steps: ['空節點回報「沒有」', '如果自己就是 p 或 q,回報自己', '分別問左子樹、右子樹', '兩邊都有 → 自己就是答案', '只有一邊有 → 把那一邊的結果往上傳'],
  watch: ['節點下方的小字是「回報給上一層的結果」', '答案是從下往上「浮」出來的 —— 這是後序 DFS 的典型'],
  whenToUse: ['兩個節點的最近公共祖先、樹上兩點距離', 'BST 的版本更簡單:兩個都比根小就往左、都大就往右,否則就是根'],
  pitfalls: ['自己是 p 時可以直接回傳,不用往下找 q(q 在下面的話答案也是 p)', '題目沒保證 p、q 存在時,要另外確認兩個都找到了'],
  complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點最多拜訪一次,遞迴深度為樹高。' },
  demo: {
    title: '二元樹的最近公共祖先(LeetCode 236)',
    inputs: [
      { key: 'tree', label: '樹(值不重複)', default: '3,5,1,6,2,0,8,null,null,7,4' },
      { key: 'p', label: 'p', default: '7' },
      { key: 'q', label: 'q', default: '6' },
    ],
    run: lcaRun,
    reference: (v) => {
      const root = uniqueTree(v.tree)
      const path = (n: TNode | null, x: number, acc: number[]): number[] | null => {
        if (!n) return null
        acc = [...acc, n.val]
        if (n.val === x) return acc
        return path(n.left, x, acc) ?? path(n.right, x, acc)
      }
      const a = path(root, Number(v.p), [])!
      const b = path(root, Number(v.q), [])!
      let i = 0
      while (i < a.length && i < b.length && a[i] === b[i]) i++
      return a[i - 1]
    },
    random: () => {
      const root = parseTree(randomTree(randInt(1, 12)))!
      const vals: number[] = []
      let k = 1
      const relabel = (n: TNode | null): void => {
        if (!n) return
        n.val = k++
        vals.push(n.val)
        relabel(n.left)
        relabel(n.right)
      }
      relabel(root)
      return { tree: serialize(root), p: String(vals[randInt(0, vals.length - 1)]), q: String(vals[randInt(0, vals.length - 1)]) }
    },
    code: {
      python: `def lca(root, p, q):
    if root is None: return None
    if root.val in (p, q): return root          #@base
    left = lca(root.left, p, q)                 #@left
    right = lca(root.right, p, q)               #@right
    if left and right: return root              #@both
    return left or right                        #@one
# 答案 = lca(root, p, q)                        #@done`,
      c: `${C_TREE}
struct TreeNode* lca(struct TreeNode *root, int p, int q) {
    if (!root) return NULL;
    if (root->val == p || root->val == q) return root;    //@base
    struct TreeNode *l = lca(root->left, p, q);           //@left
    struct TreeNode *r = lca(root->right, p, q);          //@right
    if (l && r) return root;                    //@both
    return l ? l : r;                           //@one
}                                               //@done`,
      cpp: `TreeNode* lca(TreeNode* root, int p, int q) {
    if (!root) return nullptr;
    if (root->val == p || root->val == q) return root;    //@base
    TreeNode* l = lca(root->left, p, q);        //@left
    TreeNode* r = lca(root->right, p, q);       //@right
    if (l && r) return root;                    //@both
    return l ? l : r;                           //@one
}                                               //@done`,
      java: `TreeNode lca(TreeNode root, int p, int q) {
    if (root == null) return null;
    if (root.val == p || root.val == q) return root;      //@base
    TreeNode l = lca(root.left, p, q);          //@left
    TreeNode r = lca(root.right, p, q);         //@right
    if (l != null && r != null) return root;    //@both
    return l != null ? l : r;                   //@one
}                                               //@done`,
      javascript: `function lca(root, p, q) {
  if (!root) return null;
  if (root.val === p || root.val === q) return root;      //@base
  const l = lca(root.left, p, q);               //@left
  const r = lca(root.right, p, q);              //@right
  if (l && r) return root;                      //@both
  return l || r;                                //@one
}                                               //@done`,
    },
  },
}

// ===== Heap / Top-K(215) =====

function heapGraph(h: number[], label: string, hl: number[] = [], cmp: number[] = []): GraphViewData {
  const t = treeLayout(h)
  t.nodes.forEach((n) => {
    const i = Number(n.id)
    n.cls = hl.includes(i) ? 'hl' : cmp.includes(i) ? 'cmp' : undefined
  })
  return { kind: 'graph', label, ...t }
}

function* heapRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.nums, 'nums', { maxLen: 12 })
  const k = parseInt_(v.k, 'k', 1, a.length)
  const h: number[] = []
  const f = (line: string, note: string, hl: number[] = [], cmp: number[] = [], i = -1, answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { k, answer } : { k, 堆大小: h.length },
    views: [arr(a, { label: 'nums', highlight: i >= 0 ? [i] : [], dim: i >= 0 ? Array.from({ length: i }, (_, j) => j) : [] }), heapGraph(h, '最小堆:每個節點都比孩子小,所以樹根是堆裡最小的', hl, cmp)],
  })
  yield f('init', `用一個「最小堆」,只保留目前看到的前 ${k} 大的數。堆頂(最小的那個)就是第 ${k} 大`)
  for (let i = 0; i < a.length; i++) {
    h.push(a[i])
    let c = h.length - 1
    yield f('push', `放入 ${a[i]}:先放在最後面`, [c], [], i)
    while (c > 0) {
      const p = (c - 1) >> 1
      if (h[p] <= h[c]) break
      ;[h[p], h[c]] = [h[c], h[p]]
      yield f('push', `${h[p]} 比父節點 ${h[c]} 小,往上浮`, [p], [c], i)
      c = p
    }
    if (h.length > k) {
      const top = h[0]
      h[0] = h.pop()!
      yield f('pop', `堆裡超過 ${k} 個了,把最小的 ${top} 丟掉(它不可能是前 ${k} 大)。最後一個補到樹根`, [0], [], i)
      let j = 0
      while (2 * j + 1 < h.length) {
        let c2 = 2 * j + 1
        if (c2 + 1 < h.length && h[c2 + 1] < h[c2]) c2++
        if (h[j] <= h[c2]) break
        ;[h[j], h[c2]] = [h[c2], h[j]]
        yield f('pop', `${h[c2]} 比孩子 ${h[j]} 大,往下沉`, [c2], [j], i)
        j = c2
      }
    }
  }
  yield f('done', `全部看完,堆裡是前 ${k} 大的數,堆頂 ${h[0]} 就是第 ${k} 大`, [0], [], -1, h[0])
}

export const heap: Pattern = {
  id: 'heap',
  summary: 'Heap(堆積 / 優先佇列)能在 O(log n) 內放入一個數,並隨時 O(1) 拿到「最小(或最大)」的那個。它用陣列存一棵完全二元樹,規則是父節點永遠比孩子小(最小堆)。',
  analogy: '醫院急診室的掛號:不是先來先看,而是最緊急的先看。新病人來了會依緊急程度「插隊」到適當位置,但醫生永遠只需要看隊伍最前面那一位。',
  steps: ['放入:放到陣列最後,然後和父節點比,比父節點小就交換(往上浮)', '取出最小:拿走樹根,把最後一個搬到樹根,再和較小的孩子比,往下沉', 'Top-K 技巧:找前 k 大,就用大小為 k 的「最小堆」,超過 k 個就丟掉最小的'],
  watch: ['上面的陣列是輸入,下面的樹就是堆', '每次放入、取出只會沿著一條路徑上浮或下沉,所以是 log n'],
  whenToUse: ['第 K 大 / 前 K 個(Top-K)', '合併 K 個有序串列(堆裡放每條串列的開頭)', '一直需要「目前最小 / 最大」:Dijkstra、任務排程、會議室', '資料流的中位數(兩個堆)'],
  pitfalls: ['Python 的 heapq 只有最小堆,要最大堆就存負數', '找前 k 大用最小堆、找前 k 小用最大堆,很容易搞反', 'Java 的 PriorityQueue 預設是最小堆'],
  complexity: { time: 'O(n log k)', space: 'O(k)', why: 'n 個數各放入一次,堆最多 k 個,每次上浮/下沉 log k。' },
  demo: {
    title: '陣列中第 k 大的數(LeetCode 215)',
    inputs: [
      { key: 'nums', label: 'nums', default: '3,2,1,5,6,4,8,7' },
      { key: 'k', label: 'k', default: '3' },
    ],
    run: heapRun,
    reference: (v) => {
      const a = parseInts(v.nums, 'nums', { maxLen: 12 }).sort((x, y) => y - x)
      return a[Number(v.k) - 1]
    },
    random: () => {
      const n = randInt(1, 10)
      return { nums: randInts(n, -9, 9).join(','), k: String(randInt(1, n)) }
    },
    code: {
      python: `import heapq
def find_kth_largest(nums, k):
    h = []                                      #@init
    for x in nums:
        heapq.heappush(h, x)                    #@push
        if len(h) > k:
            heapq.heappop(h)                    #@pop
    return h[0]                                 #@done`,
      c: `// 手寫最小堆
int h[10000], sz;
void push(int x) {
    int c = sz++; h[c] = x;                     //@push
    while (c > 0 && h[(c - 1) / 2] > h[c]) {    //@push
        int p = (c - 1) / 2, t = h[p]; h[p] = h[c]; h[c] = t; c = p;  //@push
    }
}
void pop(void) {
    h[0] = h[--sz]; int i = 0;                  //@pop
    while (2 * i + 1 < sz) {
        int c = 2 * i + 1;
        if (c + 1 < sz && h[c + 1] < h[c]) c++;
        if (h[i] <= h[c]) break;
        int t = h[i]; h[i] = h[c]; h[c] = t; i = c;   //@pop
    }
}
int findKthLargest(int* nums, int n, int k) {
    sz = 0;                                     //@init
    for (int i = 0; i < n; i++) {
        push(nums[i]);
        if (sz > k) pop();
    }
    return h[0];                                //@done
}`,
      cpp: `int findKthLargest(vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> h;   //@init
    for (int x : nums) {
        h.push(x);                              //@push
        if ((int)h.size() > k) h.pop();         //@pop
    }
    return h.top();                             //@done
}`,
      java: `int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> h = new PriorityQueue<>();   //@init
    for (int x : nums) {
        h.offer(x);                             //@push
        if (h.size() > k) h.poll();             //@pop
    }
    return h.peek();                            //@done
}`,
      javascript: `// JS 沒有內建堆;LeetCode 提供 MinPriorityQueue
function findKthLargest(nums, k) {
  const h = new MinPriorityQueue();             //@init
  for (const x of nums) {
    h.enqueue(x);                               //@push
    if (h.size() > k) h.dequeue();              //@pop
  }
  return h.front();                             //@done
}`,
    },
  },
}

// ===== 雙堆(295. 資料流中位數) =====

function* twoHeapsRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.nums, 'nums', { maxLen: 10 })
  const lo: number[] = [] // 最大堆(只為了顯示,用排序陣列模擬)
  const hi: number[] = [] // 最小堆
  const med: (number | string)[] = []
  const show = (line: string, note: string, i: number, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : { 左半大小: lo.length, 右半大小: hi.length },
    views: [
      arr(a, { label: '資料流', highlight: i >= 0 ? [i] : [], dim: i >= 0 ? Array.from({ length: i }, (_, j) => j) : [] }),
      arr([...lo].sort((x, y) => x - y), { label: '左半:最大堆(最右邊黑色 = 堆頂 = 左半最大)', highlight: lo.length ? [lo.length - 1] : [] }),
      arr([...hi].sort((x, y) => x - y), { label: '右半:最小堆(最左邊黑色 = 堆頂 = 右半最小)', highlight: hi.length ? [0] : [] }),
      arr(med, { label: '每加一個數後的中位數' }),
    ],
  })
  const maxOf = (x: number[]) => Math.max(...x)
  const minOf = (x: number[]) => Math.min(...x)
  const take = (x: number[], val: number) => x.splice(x.indexOf(val), 1)[0]
  yield show('init', '把數字分成兩半:左半(較小的一半)用最大堆,右半(較大的一半)用最小堆。中位數就在兩個堆頂', -1)
  for (let i = 0; i < a.length; i++) {
    lo.push(a[i])
    yield show('push-lo', `${a[i]} 先放進左半`, i)
    const m = take(lo, maxOf(lo))
    hi.push(m)
    yield show('move', `把左半最大的 ${m} 移到右半 —— 確保左半的每個數 <= 右半的每個數`, i)
    if (hi.length > lo.length) {
      const m2 = take(hi, minOf(hi))
      lo.push(m2)
      yield show('balance', `右半比左半多了,把右半最小的 ${m2} 移回左半(讓左半 >= 右半,最多多 1 個)`, i)
    }
    const md = lo.length > hi.length ? maxOf(lo) : (maxOf(lo) + minOf(hi)) / 2
    med.push(md)
    yield show('median', lo.length > hi.length ? `共 ${i + 1} 個(奇數),中位數 = 左半堆頂 ${md}` : `共 ${i + 1} 個(偶數),中位數 = (左半堆頂 + 右半堆頂) / 2 = ${md}`, i)
  }
  yield show('done', '每次加入只花 O(log n),查中位數 O(1)', -1, med.join(','))
}

export const twoHeaps: Pattern = {
  id: 'two-heaps',
  summary: '用兩個堆把資料切成「較小的一半」和「較大的一半」:左半用最大堆、右半用最小堆。兩個堆頂剛好就在正中間,所以隨時 O(1) 拿到中位數。',
  analogy: '把全班依身高分成矮組和高組,兩組人數一樣多。矮組最高的人和高組最矮的人,就站在全班的正中間。',
  steps: ['新數字先放進左半(最大堆)', '把左半最大的移到右半(保證左半全部 <= 右半)', '如果右半比較多,把右半最小的移回左半', '奇數個:中位數 = 左半堆頂;偶數個:兩個堆頂的平均'],
  watch: ['兩排分別是左半、右半,黑色是堆頂', '注意兩半的大小永遠只差 0 或 1'],
  whenToUse: ['資料流的中位數', '滑動視窗中位數(再加上延遲刪除)', '「可以做的事情」和「選最好的」分成兩堆(IPO)'],
  pitfalls: ['Python 最大堆用存負數模擬,取出時要記得變回正數', '平衡規則要固定(例如左半永遠 >= 右半),否則中位數的判斷會亂'],
  complexity: { time: '加入 O(log n),查詢 O(1)', space: 'O(n)', why: '每次加入最多做 3 次堆操作。' },
  demo: {
    title: '資料流的中位數(LeetCode 295)',
    inputs: [{ key: 'nums', label: '依序加入的數', default: '5,15,1,3,8,7,9' }],
    run: twoHeapsRun,
    reference: (v) => {
      const a = parseInts(v.nums, 'nums', { maxLen: 10 })
      return a
        .map((_, i) => {
          const s = a.slice(0, i + 1).sort((x, y) => x - y)
          const n = s.length
          return n % 2 ? s[n >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2
        })
        .join(',')
    },
    random: () => ({ nums: randInts(randInt(1, 9), -9, 9).join(',') }),
    code: {
      python: `import heapq
class MedianFinder:
    def __init__(self):
        self.lo, self.hi = [], []   # lo 存負數 = 最大堆   #@init
    def addNum(self, x):
        heapq.heappush(self.lo, -x)                         #@push-lo
        heapq.heappush(self.hi, -heapq.heappop(self.lo))    #@move
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))  #@balance
    def findMedian(self):
        if len(self.lo) > len(self.hi): return -self.lo[0]  #@median
        return (-self.lo[0] + self.hi[0]) / 2               #@median
# 每加一個數就呼叫 findMedian                               #@done`,
      c: `// C 需手寫兩個堆;這裡假設已有 maxheap / minheap 的 push、pop、top
void addNum(int x) {
    maxheap_push(x);                            //@push-lo
    minheap_push(maxheap_pop());                //@move
    if (minheap_size() > maxheap_size())
        maxheap_push(minheap_pop());            //@balance
}
double findMedian(void) {
    if (maxheap_size() > minheap_size()) return maxheap_top();  //@median
    return (maxheap_top() + minheap_top()) / 2.0;               //@median
}
// 初始化兩個空堆                               //@init
// 每加一個數就呼叫 findMedian                   //@done`,
      cpp: `class MedianFinder {
    priority_queue<int> lo;                                     //@init
    priority_queue<int, vector<int>, greater<int>> hi;          //@init
public:
    void addNum(int x) {
        lo.push(x);                                             //@push-lo
        hi.push(lo.top()); lo.pop();                            //@move
        if (hi.size() > lo.size()) { lo.push(hi.top()); hi.pop(); }  //@balance
    }
    double findMedian() {
        if (lo.size() > hi.size()) return lo.top();             //@median
        return (lo.top() + hi.top()) / 2.0;                     //@median
    }
};
// 每加一個數就呼叫 findMedian                                  //@done`,
      java: `class MedianFinder {
    PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder());  //@init
    PriorityQueue<Integer> hi = new PriorityQueue<>();          //@init
    public void addNum(int x) {
        lo.offer(x);                                            //@push-lo
        hi.offer(lo.poll());                                    //@move
        if (hi.size() > lo.size()) lo.offer(hi.poll());         //@balance
    }
    public double findMedian() {
        if (lo.size() > hi.size()) return lo.peek();            //@median
        return (lo.peek() + hi.peek()) / 2.0;                   //@median
    }
}
// 每加一個數就呼叫 findMedian                                  //@done`,
      javascript: `// LeetCode 提供 MaxPriorityQueue / MinPriorityQueue
class MedianFinder {
  constructor() {
    this.lo = new MaxPriorityQueue();                           //@init
    this.hi = new MinPriorityQueue();                           //@init
  }
  addNum(x) {
    this.lo.enqueue(x);                                         //@push-lo
    this.hi.enqueue(this.lo.dequeue());                         //@move
    if (this.hi.size() > this.lo.size()) this.lo.enqueue(this.hi.dequeue());  //@balance
  }
  findMedian() {
    if (this.lo.size() > this.hi.size()) return this.lo.front();  //@median
    return (this.lo.front() + this.hi.front()) / 2;             //@median
  }
}
// 每加一個數就呼叫 findMedian                                  //@done`,
    },
  },
}

// ===== Trie(208) =====

function* trieRun(v: Record<string, string>): Generator<Frame> {
  const words = v.words.split(/[,\s]+/).filter(Boolean)
  const queries = v.queries.split(/[,\s]+/).filter(Boolean)
  if (!words.length || words.length > 6 || words.some((w) => !/^[a-z]{1,6}$/.test(w))) throw new Error('words:1~6 個小寫單字,每個最多 6 個字母')
  if (!queries.length || queries.length > 4 || queries.some((w) => !/^[a-z]{1,6}$/.test(w))) throw new Error('queries:1~4 個小寫單字')
  let id = 0
  type TN = GNode & { next: Map<string, TN>; end: boolean }
  const root: TN = { id: id++, label: '·', children: [], next: new Map(), end: false }
  const cls = new Map<number, string>()
  const results: string[] = []
  const subOf = () => {
    const m = new Map<number, string>()
    const walk = (n: TN) => {
      if (n.end) m.set(n.id, '結尾')
      n.children.forEach((c) => walk(c as TN))
    }
    walk(root)
    return m
  }
  const f = (line: string, note: string, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [forestView(root, { cls, sub: subOf(), label: 'Trie:從根往下,每條路徑拼出一個前綴;「結尾」表示這裡是一個完整單字' }), arr(results, { label: '查詢結果' })],
  })
  yield f('init', '一開始只有一個空的根節點')
  for (const w of words) {
    cls.clear()
    let cur = root
    for (const ch of w) {
      let nx = cur.next.get(ch)
      if (!nx) {
        nx = { id: id++, label: ch, children: [], next: new Map(), end: false }
        cur.next.set(ch, nx)
        cur.children.push(nx)
        cur.children.sort((a, b) => a.label.localeCompare(b.label))
        cls.set(nx.id, 'hl')
        yield f('insert', `插入「${w}」:沒有「${ch}」這條路,新增一個節點`)
      } else {
        cls.set(nx.id, 'cmp')
        yield f('insert', `插入「${w}」:「${ch}」這條路已經有了(和別的單字共用前綴),直接往下走`)
      }
      cur = nx
    }
    cur.end = true
    yield f('mark', `「${w}」的最後一個字母,標記為「結尾」`)
  }
  for (const q of queries) {
    cls.clear()
    let cur: TN | undefined = root
    for (const ch of q) {
      cur = cur.next.get(ch)
      if (!cur) {
        results.push(`${q}:✗`)
        yield f('miss', `搜尋「${q}」:找不到「${ch}」這條路 → 不存在`)
        break
      }
      cls.set(cur.id, 'hl')
      yield f('search', `搜尋「${q}」:沿著「${ch}」往下走`)
    }
    if (cur) {
      results.push(`${q}:${cur.end ? '✓' : '前綴'}`)
      yield f('check', cur.end ? `走完了,而且這裡標記「結尾」→「${q}」是一個單字` : `走完了,但這裡不是「結尾」→「${q}」只是某個單字的前綴`)
    }
  }
  yield f('done', '查詢完成', results.join(','))
}

export const trie: Pattern = {
  id: 'trie',
  summary: 'Trie(字典樹 / 前綴樹)把一堆單字存成一棵樹:每條從根往下的路徑代表一個前綴,共用前綴的單字共用同一段路徑。查一個單字或前綴,只要沿著字母往下走,時間只和單字長度有關。',
  analogy: '手機輸入法的自動完成:打了「ap」,它就沿著 a → p 的路往下看,底下有 apple、apply、app,全部列給你。',
  steps: ['每個節點有最多 26 個孩子(a~z)和一個「是不是單字結尾」的標記', '插入:沿著字母往下走,沒有路就新開一個節點,最後標記結尾', '搜尋單字:沿路走完且是結尾 → 存在', '搜尋前綴:沿路走得完就算存在'],
  watch: ['看「app」和「apple」怎麼共用前三個節點', '「結尾」標記決定了它是完整單字還是只是前綴'],
  whenToUse: ['前綴搜尋、自動完成(Search Suggestions System)', '一堆單字同時在網格中搜尋(Word Search II)', '最大 XOR:把數字的二進位存進 Trie,每一位盡量走相反的 bit', '萬用字元搜尋(遇到 . 就搜尋所有孩子)'],
  pitfalls: ['別忘了「結尾」標記,否則分不出 app 和 apple', '用陣列 [26] 或 Hash Map 存孩子都可以;陣列較快但較耗空間'],
  complexity: { time: '插入 / 查詢 O(L)', space: 'O(總字母數)', why: 'L 是單字長度,每個字母往下走一步。' },
  demo: {
    title: '建一棵 Trie,然後查詢單字(LeetCode 208)',
    inputs: [
      { key: 'words', label: '要插入的單字', default: 'app,apple,apt,bat,bath' },
      { key: 'queries', label: '要查詢的單字', default: 'apple,ap,bad' },
    ],
    run: trieRun,
    reference: (v) => {
      const words = new Set(v.words.split(/[,\s]+/).filter(Boolean))
      return v.queries
        .split(/[,\s]+/)
        .filter(Boolean)
        .map((q) => `${q}:${words.has(q) ? '✓' : [...words].some((w) => w.startsWith(q)) ? '前綴' : '✗'}`)
        .join(',')
    },
    random: () => {
      const w = () => Array.from({ length: randInt(1, 4) }, () => 'abc'[randInt(0, 2)]).join('')
      return { words: Array.from({ length: randInt(1, 5) }, w).join(','), queries: Array.from({ length: randInt(1, 3) }, w).join(',') }
    },
    code: {
      python: `class Trie:
    def __init__(self):
        self.root = {}                          #@init
    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})      #@insert
        node['$'] = True          # 結尾標記    #@mark
    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node: return False     #@miss
            node = node[ch]                     #@search
        return '$' in node                      #@check
# 依序 insert 所有單字,再 search             #@done`,
      c: `typedef struct Trie { struct Trie *next[26]; bool end; } Trie;
Trie* trieCreate(void) { return calloc(1, sizeof(Trie)); }  //@init
void trieInsert(Trie *t, char *w) {
    for (; *w; w++) {
        int c = *w - 'a';
        if (!t->next[c]) t->next[c] = trieCreate();          //@insert
        t = t->next[c];                         //@insert
    }
    t->end = true;                              //@mark
}
bool trieSearch(Trie *t, char *w) {
    for (; *w; w++) {
        t = t->next[*w - 'a'];                  //@search
        if (!t) return false;                   //@miss
    }
    return t->end;                              //@check
}
// 依序 insert 所有單字,再 search              //@done`,
      cpp: `struct Trie {
    Trie* next[26] = {}; bool end = false;      //@init
    void insert(const string& w) {
        Trie* t = this;
        for (char ch : w) {
            int c = ch - 'a';
            if (!t->next[c]) t->next[c] = new Trie();   //@insert
            t = t->next[c];                     //@insert
        }
        t->end = true;                          //@mark
    }
    bool search(const string& w) {
        Trie* t = this;
        for (char ch : w) {
            t = t->next[ch - 'a'];              //@search
            if (!t) return false;               //@miss
        }
        return t->end;                          //@check
    }
};
// 依序 insert 所有單字,再 search              //@done`,
      java: `class Trie {
    Trie[] next = new Trie[26]; boolean end;    //@init
    void insert(String w) {
        Trie t = this;
        for (char ch : w.toCharArray()) {
            int c = ch - 'a';
            if (t.next[c] == null) t.next[c] = new Trie();  //@insert
            t = t.next[c];                      //@insert
        }
        t.end = true;                           //@mark
    }
    boolean search(String w) {
        Trie t = this;
        for (char ch : w.toCharArray()) {
            t = t.next[ch - 'a'];               //@search
            if (t == null) return false;        //@miss
        }
        return t.end;                           //@check
    }
}
// 依序 insert 所有單字,再 search              //@done`,
      javascript: `class Trie {
  constructor() { this.root = {}; }             //@init
  insert(w) {
    let node = this.root;
    for (const ch of w)
      node = node[ch] ??= {};                   //@insert
    node.$ = true;                              //@mark
  }
  search(w) {
    let node = this.root;
    for (const ch of w) {
      if (!node[ch]) return false;              //@miss
      node = node[ch];                          //@search
    }
    return !!node.$;                            //@check
  }
}
// 依序 insert 所有單字,再 search              //@done`,
    },
  },
}

export const TREES = [treeDfs, treeBfs, bst, lca, heap, twoHeaps, trie]

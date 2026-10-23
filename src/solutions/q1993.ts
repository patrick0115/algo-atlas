import { graphView } from './fig'
import type { FigStep, Solution } from './types'

// 1993. Operations on Tree

const PARENT = [-1, 0, 0, 1, 1, 2, 2]
const EDGES = PARENT.map((p, i) => [p, i]).filter(([p]) => p >= 0)
const POS = { 0: { x: 3, y: 0 }, 1: { x: 1.5, y: 1 }, 2: { x: 4.5, y: 1 }, 3: { x: 0.8, y: 2 }, 4: { x: 2.2, y: 2 }, 5: { x: 3.8, y: 2 }, 6: { x: 5.2, y: 2 } }

function simFig(): FigStep[] {
  return [
    { note: '每個節點記「被誰鎖住」(0 = 沒鎖)。lock(num, user):沒鎖才能鎖;unlock(num, user):要是同一個人鎖的才能解', views: [graphView(7, EDGES, { pos: POS, directed: true })] },
    { note: 'lock(2, 2) ✓、unlock(2, 3) ✗(不是 3 鎖的)、unlock(2, 2) ✓、lock(4, 5) ✓', views: [graphView(7, EDGES, { pos: POS, directed: true, cls: { 4: 'hl' }, subs: { 4: '鎖:5' } })] },
    { note: 'upgrade(0, 1) 要同時滿足三個條件:① 0 自己沒鎖 ② 往上的祖先都沒鎖(沿 parent 往上走)③ 子孫裡至少一個被鎖(往下 DFS)', views: [graphView(7, EDGES, { pos: POS, directed: true, cls: { 0: 'cur', 4: 'hl' }, subs: { 4: '鎖:5' } })] },
    { note: '都成立 → 把所有子孫解鎖,再把 0 鎖給 user 1。之後 lock(0, 1) 就會失敗(已經鎖了)', views: [graphView(7, EDGES, { pos: POS, directed: true, cls: { 0: 'done' }, subs: { 0: '鎖:1' } })] },
  ]
}

function cntFig(): FigStep[] {
  return [
    { note: '多記一個 below[u] = u 的子孫裡有幾個被鎖。lock / unlock 時沿著 parent 往上把祖先的計數 ±1', views: [graphView(7, EDGES, { pos: POS, directed: true, cls: { 4: 'hl' }, subs: { 0: 'below=1', 1: 'below=1' } })] },
    { note: 'upgrade 的條件 ③ 變成 `below[num] > 0`,O(1) 判斷;只有真的升級時才需要往下解鎖子孫', views: [graphView(7, EDGES, { pos: POS, directed: true, cls: { 0: 'done' } })] },
  ]
}

export const q1993: Solution = {
  id: 1993,
  plain: '一棵樹上的每個節點都可以被某個使用者「上鎖」。要支援三種操作:上鎖(沒被鎖才行)、解鎖(要是同一個人鎖的)、升級(在某些條件下,把整棵子樹的鎖收回,改由自己鎖住這個節點)。',
  statement: '給 `parent` 陣列(根的 parent 為 −1),設計 `LockingTree`:`lock(num, user)` 節點未上鎖時鎖給 user;`unlock(num, user)` 節點被同一 user 鎖住時解鎖;`upgrade(num, user)`:若 num 未上鎖、至少一個子孫上鎖、且沒有任何祖先上鎖,則解鎖所有子孫並把 num 鎖給 user。三者皆回傳是否成功。',
  examples: [
    { input: '["LockingTree","lock","unlock","unlock","lock","upgrade","lock"]\n[[[-1,0,0,1,1,2,2]],[2,2],[2,3],[2,2],[4,5],[0,1],[0,1]]', output: '[null,true,false,true,true,true,false]' },
  ],
  constraints: ['n ≤ 2000,最多 2000 次呼叫'],
  insight: ['lock / unlock 只看自己 → O(1)', 'upgrade 要看三個方向:自己、所有祖先(往上走)、所有子孫(往下走)', '先把 parent 轉成 children 清單,往下走才方便'],
  approaches: [
    {
      name: '直接模擬(往上檢查祖先、往下檢查子孫)',
      idea: '`locked[u]` 記鎖的人;upgrade 時往上走 parent 檢查祖先,往下 DFS 找有沒有被鎖的子孫並解鎖。',
      steps: ['建 `children`;`locked = [0] * n`', 'lock / unlock:照條件改 `locked[num]`', 'upgrade:`locked[num]` 或任一祖先被鎖 → false', 'DFS 子孫:有被鎖的就解鎖並記下「有」;沒有任何被鎖 → false;否則鎖 num 給 user'],
      figure: { title: `parent = [${PARENT}]`, steps: simFig() },
      complexity: { time: 'lock / unlock O(1),upgrade O(n)', space: 'O(n)', why: 'upgrade 最壞要看整棵子樹和整條祖先路徑。' },
      verdict: '最推薦(n 只有 2000)。注意「先檢查、再解鎖」:子孫沒有被鎖時不能改任何東西。',
      code: {
        python: `class LockingTree:
    def __init__(self, parent):
        self.parent = parent
        self.children = [[] for _ in parent]
        for i, p in enumerate(parent):
            if p >= 0:
                self.children[p].append(i)
        self.locked = [0] * len(parent)       # 0 = 沒鎖,否則是鎖住它的 user

    def lock(self, num, user):
        if self.locked[num]:
            return False
        self.locked[num] = user
        return True

    def unlock(self, num, user):
        if self.locked[num] != user:
            return False
        self.locked[num] = 0
        return True

    def upgrade(self, num, user):
        u = num
        while u != -1:                        # 自己和祖先都不能被鎖
            if self.locked[u]:
                return False
            u = self.parent[u]
        found, st = False, list(self.children[num])
        while st:                             # 解鎖所有子孫
            v = st.pop()
            if self.locked[v]:
                self.locked[v] = 0
                found = True
            st.extend(self.children[v])
        if not found:
            return False                      # 沒有被鎖的子孫(上面什麼也沒改)
        self.locked[num] = user
        return True`,
        c: `typedef struct { int n, *parent, *locked, *start, *kids; } LockingTree;

LockingTree *lockingTreeCreate(int *parent, int parentSize) {
    LockingTree *o = malloc(sizeof(LockingTree));
    int n = parentSize;
    o->n = n;
    o->parent = malloc(n * sizeof(int)); memcpy(o->parent, parent, n * sizeof(int));
    o->locked = calloc(n, sizeof(int));
    o->start = calloc(n + 1, sizeof(int)); o->kids = malloc(n * sizeof(int));
    int *fill = calloc(n, sizeof(int));
    for (int i = 1; i < n; i++) o->start[parent[i] + 1]++;
    for (int i = 0; i < n; i++) o->start[i + 1] += o->start[i];
    for (int i = 1; i < n; i++) o->kids[o->start[parent[i]] + fill[parent[i]]++] = i;
    free(fill);
    return o;
}

bool lockingTreeLock(LockingTree *o, int num, int user) {
    if (o->locked[num]) return false;
    o->locked[num] = user;
    return true;
}

bool lockingTreeUnlock(LockingTree *o, int num, int user) {
    if (o->locked[num] != user) return false;
    o->locked[num] = 0;
    return true;
}

bool lockingTreeUpgrade(LockingTree *o, int num, int user) {
    for (int u = num; u != -1; u = o->parent[u]) if (o->locked[u]) return false;
    int *st = malloc(o->n * sizeof(int)), top = 0;
    bool found = false;
    for (int e = o->start[num]; e < o->start[num + 1]; e++) st[top++] = o->kids[e];
    while (top) {
        int v = st[--top];
        if (o->locked[v]) { o->locked[v] = 0; found = true; }
        for (int e = o->start[v]; e < o->start[v + 1]; e++) st[top++] = o->kids[e];
    }
    free(st);
    if (!found) return false;
    o->locked[num] = user;
    return true;
}

void lockingTreeFree(LockingTree *o) { free(o->parent); free(o->locked); free(o->start); free(o->kids); free(o); }`,
        cpp: `class LockingTree {
    vector<int> parent, locked;
    vector<vector<int>> children;
public:
    LockingTree(vector<int>& p) : parent(p), locked(p.size(), 0), children(p.size()) {
        for (int i = 1; i < (int)p.size(); i++) children[p[i]].push_back(i);
    }

    bool lock(int num, int user) {
        if (locked[num]) return false;
        locked[num] = user;
        return true;
    }

    bool unlock(int num, int user) {
        if (locked[num] != user) return false;
        locked[num] = 0;
        return true;
    }

    bool upgrade(int num, int user) {
        for (int u = num; u != -1; u = parent[u]) if (locked[u]) return false;
        bool found = false;
        vector<int> st(children[num].begin(), children[num].end());
        while (!st.empty()) {
            int v = st.back(); st.pop_back();
            if (locked[v]) { locked[v] = 0; found = true; }
            for (int c : children[v]) st.push_back(c);
        }
        if (!found) return false;
        locked[num] = user;
        return true;
    }
};`,
        java: `class LockingTree {
    private final int[] parent, locked;
    private final List<List<Integer>> children = new ArrayList<>();

    public LockingTree(int[] parent) {
        this.parent = parent;
        locked = new int[parent.length];
        for (int i = 0; i < parent.length; i++) children.add(new ArrayList<>());
        for (int i = 1; i < parent.length; i++) children.get(parent[i]).add(i);
    }

    public boolean lock(int num, int user) {
        if (locked[num] != 0) return false;
        locked[num] = user;
        return true;
    }

    public boolean unlock(int num, int user) {
        if (locked[num] != user) return false;
        locked[num] = 0;
        return true;
    }

    public boolean upgrade(int num, int user) {
        for (int u = num; u != -1; u = parent[u]) if (locked[u] != 0) return false;
        boolean found = false;
        Deque<Integer> st = new ArrayDeque<>(children.get(num));
        while (!st.isEmpty()) {
            int v = st.pop();
            if (locked[v] != 0) { locked[v] = 0; found = true; }
            for (int c : children.get(v)) st.push(c);
        }
        if (!found) return false;
        locked[num] = user;
        return true;
    }
}`,
        javascript: `class LockingTree {
  constructor(parent) {
    this.parent = parent;
    this.locked = new Array(parent.length).fill(0);
    this.children = parent.map(() => []);
    parent.forEach((p, i) => p >= 0 && this.children[p].push(i));
  }

  lock(num, user) {
    if (this.locked[num]) return false;
    this.locked[num] = user;
    return true;
  }

  unlock(num, user) {
    if (this.locked[num] !== user) return false;
    this.locked[num] = 0;
    return true;
  }

  upgrade(num, user) {
    for (let u = num; u !== -1; u = this.parent[u]) if (this.locked[u]) return false;
    let found = false;
    const st = [...this.children[num]];
    while (st.length) {
      const v = st.pop();
      if (this.locked[v]) {
        this.locked[v] = 0;
        found = true;
      }
      st.push(...this.children[v]);
    }
    if (!found) return false;
    this.locked[num] = user;
    return true;
  }
}`,
      },
    },
    {
      name: '多記「子孫被鎖的數量」',
      idea: '`below[u]` = u 的子孫中被鎖的個數;lock / unlock 成功時沿 parent 往上 ±1。upgrade 的子孫條件變成 `below[num] > 0`。',
      steps: ['lock 成功:對每個祖先 a,`below[a] += 1`', 'unlock 成功:對每個祖先 a,`below[a] -= 1`', 'upgrade:自己、祖先沒鎖,且 `below[num] > 0`', '成立 → 對每個被鎖的子孫做 unlock(會自動更新計數),再 lock(num)'],
      figure: { title: `parent = [${PARENT}]`, steps: cntFig() },
      complexity: { time: 'lock / unlock O(深度),upgrade O(子樹 × 深度)', space: 'O(n)', why: '更新計數要走祖先路徑。' },
      verdict: '把「有沒有子孫被鎖」的判斷變成 O(1),失敗的 upgrade 不用掃子樹;代價是 lock / unlock 變慢。',
      code: {
        python: `class LockingTree:
    def __init__(self, parent):
        n = len(parent)
        self.parent, self.locked, self.below = parent, [0] * n, [0] * n
        self.children = [[] for _ in range(n)]
        for i, p in enumerate(parent):
            if p >= 0:
                self.children[p].append(i)

    def _bump(self, num, d):                  # 祖先的「子孫被鎖數」± 1
        u = self.parent[num]
        while u != -1:
            self.below[u] += d
            u = self.parent[u]

    def lock(self, num, user):
        if self.locked[num]:
            return False
        self.locked[num] = user
        self._bump(num, 1)
        return True

    def unlock(self, num, user):
        if self.locked[num] != user:
            return False
        self.locked[num] = 0
        self._bump(num, -1)
        return True

    def upgrade(self, num, user):
        if self.below[num] == 0:
            return False                      # 沒有被鎖的子孫
        u = num
        while u != -1:
            if self.locked[u]:
                return False
            u = self.parent[u]
        st = list(self.children[num])
        while st:
            v = st.pop()
            if self.locked[v]:
                self.unlock(v, self.locked[v])
            st.extend(self.children[v])
        return self.lock(num, user)`,
        c: `typedef struct { int n, *parent, *locked, *below, *start, *kids; } LockingTree;

LockingTree *lockingTreeCreate(int *parent, int parentSize) {
    LockingTree *o = malloc(sizeof(LockingTree));
    int n = parentSize;
    o->n = n;
    o->parent = malloc(n * sizeof(int)); memcpy(o->parent, parent, n * sizeof(int));
    o->locked = calloc(n, sizeof(int)); o->below = calloc(n, sizeof(int));
    o->start = calloc(n + 1, sizeof(int)); o->kids = malloc(n * sizeof(int));
    int *fill = calloc(n, sizeof(int));
    for (int i = 1; i < n; i++) o->start[parent[i] + 1]++;
    for (int i = 0; i < n; i++) o->start[i + 1] += o->start[i];
    for (int i = 1; i < n; i++) o->kids[o->start[parent[i]] + fill[parent[i]]++] = i;
    free(fill);
    return o;
}

static void bump(LockingTree *o, int num, int d) {
    for (int u = o->parent[num]; u != -1; u = o->parent[u]) o->below[u] += d;
}

bool lockingTreeLock(LockingTree *o, int num, int user) {
    if (o->locked[num]) return false;
    o->locked[num] = user;
    bump(o, num, 1);
    return true;
}

bool lockingTreeUnlock(LockingTree *o, int num, int user) {
    if (o->locked[num] != user) return false;
    o->locked[num] = 0;
    bump(o, num, -1);
    return true;
}

bool lockingTreeUpgrade(LockingTree *o, int num, int user) {
    if (o->below[num] == 0) return false;
    for (int u = num; u != -1; u = o->parent[u]) if (o->locked[u]) return false;
    int *st = malloc(o->n * sizeof(int)), top = 0;
    for (int e = o->start[num]; e < o->start[num + 1]; e++) st[top++] = o->kids[e];
    while (top) {
        int v = st[--top];
        if (o->locked[v]) lockingTreeUnlock(o, v, o->locked[v]);
        for (int e = o->start[v]; e < o->start[v + 1]; e++) st[top++] = o->kids[e];
    }
    free(st);
    return lockingTreeLock(o, num, user);
}

void lockingTreeFree(LockingTree *o) { free(o->parent); free(o->locked); free(o->below); free(o->start); free(o->kids); free(o); }`,
        cpp: `class LockingTree {
    vector<int> parent, locked, below;
    vector<vector<int>> children;
    void bump(int num, int d) { for (int u = parent[num]; u != -1; u = parent[u]) below[u] += d; }
public:
    LockingTree(vector<int>& p) : parent(p), locked(p.size()), below(p.size()), children(p.size()) {
        for (int i = 1; i < (int)p.size(); i++) children[p[i]].push_back(i);
    }

    bool lock(int num, int user) {
        if (locked[num]) return false;
        locked[num] = user;
        bump(num, 1);
        return true;
    }

    bool unlock(int num, int user) {
        if (locked[num] != user) return false;
        locked[num] = 0;
        bump(num, -1);
        return true;
    }

    bool upgrade(int num, int user) {
        if (below[num] == 0) return false;
        for (int u = num; u != -1; u = parent[u]) if (locked[u]) return false;
        vector<int> st(children[num].begin(), children[num].end());
        while (!st.empty()) {
            int v = st.back(); st.pop_back();
            if (locked[v]) unlock(v, locked[v]);
            for (int c : children[v]) st.push_back(c);
        }
        return lock(num, user);
    }
};`,
        java: `class LockingTree {
    private final int[] parent, locked, below;
    private final List<List<Integer>> children = new ArrayList<>();

    public LockingTree(int[] parent) {
        this.parent = parent;
        locked = new int[parent.length];
        below = new int[parent.length];
        for (int i = 0; i < parent.length; i++) children.add(new ArrayList<>());
        for (int i = 1; i < parent.length; i++) children.get(parent[i]).add(i);
    }

    private void bump(int num, int d) { for (int u = parent[num]; u != -1; u = parent[u]) below[u] += d; }

    public boolean lock(int num, int user) {
        if (locked[num] != 0) return false;
        locked[num] = user;
        bump(num, 1);
        return true;
    }

    public boolean unlock(int num, int user) {
        if (locked[num] != user) return false;
        locked[num] = 0;
        bump(num, -1);
        return true;
    }

    public boolean upgrade(int num, int user) {
        if (below[num] == 0) return false;
        for (int u = num; u != -1; u = parent[u]) if (locked[u] != 0) return false;
        Deque<Integer> st = new ArrayDeque<>(children.get(num));
        while (!st.isEmpty()) {
            int v = st.pop();
            if (locked[v] != 0) unlock(v, locked[v]);
            for (int c : children.get(v)) st.push(c);
        }
        return lock(num, user);
    }
}`,
        javascript: `class LockingTree {
  constructor(parent) {
    this.parent = parent;
    this.locked = new Array(parent.length).fill(0);
    this.below = new Array(parent.length).fill(0);
    this.children = parent.map(() => []);
    parent.forEach((p, i) => p >= 0 && this.children[p].push(i));
  }

  bump(num, d) {
    for (let u = this.parent[num]; u !== -1; u = this.parent[u]) this.below[u] += d;
  }

  lock(num, user) {
    if (this.locked[num]) return false;
    this.locked[num] = user;
    this.bump(num, 1);
    return true;
  }

  unlock(num, user) {
    if (this.locked[num] !== user) return false;
    this.locked[num] = 0;
    this.bump(num, -1);
    return true;
  }

  upgrade(num, user) {
    if (this.below[num] === 0) return false;
    for (let u = num; u !== -1; u = this.parent[u]) if (this.locked[u]) return false;
    const st = [...this.children[num]];
    while (st.length) {
      const v = st.pop();
      if (this.locked[v]) this.unlock(v, this.locked[v]);
      st.push(...this.children[v]);
    }
    return this.lock(num, user);
  }
}`,
      },
    },
  ],
  pitfalls: ['upgrade 先解鎖子孫、後來才發現祖先被鎖:要先把三個條件都檢查完,再動手修改', 'unlock 時沒檢查是不是同一個 user'],
  check: {
    kind: 'class',
    cls: 'LockingTree',
    cases: [
      { ops: ['LockingTree', 'lock', 'unlock', 'unlock', 'lock', 'upgrade', 'lock'], args: [[PARENT], [2, 2], [2, 3], [2, 2], [4, 5], [0, 1], [0, 1]], out: [null, true, false, true, true, true, false] },
      { ops: ['LockingTree', 'upgrade', 'lock', 'upgrade', 'lock', 'upgrade', 'unlock', 'upgrade'], args: [[PARENT], [0, 1], [0, 3], [1, 2], [3, 4], [1, 2], [0, 3], [1, 9]], out: [null, false, true, false, true, false, true, true] },
    ],
  },
}

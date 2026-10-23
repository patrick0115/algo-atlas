import { arr } from '../engine/helpers'
import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 725. Split Linked List in Parts

const L = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const K = 3

function cutFig(): FigStep[] {
  const n = L.length
  const q = Math.floor(n / K)
  const r = n % K
  const sizes = Array.from({ length: K }, (_, i) => q + (i < r ? 1 : 0))
  const parts: number[][] = []
  let p = 0
  for (const s of sizes) {
    parts.push(L.slice(p, p + s))
    p += s
  }
  return [
    { note: `先數長度 n = ${n}。分成 ${K} 段,每段長度要盡量平均、前面的可以多一個:${n} ÷ ${K} = ${q} 餘 ${r} → 前 ${r} 段 ${q + 1} 個,其他 ${q} 個`, views: [chain(L), arr(sizes, { label: '每段長度' })] },
    { note: '從頭走:每段走到它的最後一個節點,把 next 切斷(設成 null),下一段從被切下來的地方開始', views: [chain(L, { edges: L.slice(1).map((_, i) => [i, i + 1, i + 1 === sizes[0] || i + 1 === sizes[0] + sizes[1] ? 'dim' : undefined] as [number, number, string?]), cls: { [sizes[0] - 1]: 'hl', [sizes[0] + sizes[1] - 1]: 'hl' } })] },
    { note: `結果 ${parts.map((x) => `[${x}]`).join('、')}。k 比 n 大時,後面的段是 null(空串列)`, views: parts.map((x, i) => chain(x, { label: `第 ${i + 1} 段`, tail: true })) },
  ]
}

function arrFig(): FigStep[] {
  return [
    { note: '另一種:先把所有節點放進陣列,就能直接用索引算出每段的頭在哪', views: [arr(L, { label: '節點陣列' })] },
    { note: '第 i 段的頭 = nodes[start],結尾 = nodes[start + size − 1],把結尾的 next 設成 null', views: [arr(L, { label: '節點陣列', highlight: [0, 4, 7], done: [3, 6, 9] })] },
  ]
}

const TO_ARR = {
  python: `

def splitToArrays(head, k):                   # 測試用:把每段轉成陣列
    res = []
    for h in splitListToParts(head, k):
        a = []
        while h:
            a.append(h.val)
            h = h.next
        res.append(a)
    return res`,
  c: `

int **splitToArrays(struct ListNode *head, int k, int *returnSize, int **returnColumnSizes) {
    int sz;
    struct ListNode **parts = splitListToParts(head, k, &sz);
    int **res = malloc(sz * sizeof(int *));
    *returnColumnSizes = malloc(sz * sizeof(int));
    for (int i = 0; i < sz; i++) {
        int c = 0;
        for (struct ListNode *p = parts[i]; p; p = p->next) c++;
        res[i] = malloc((c + 1) * sizeof(int));
        c = 0;
        for (struct ListNode *p = parts[i]; p; p = p->next) res[i][c++] = p->val;
        (*returnColumnSizes)[i] = c;
    }
    *returnSize = sz;
    return res;
}`,
  cpp: `

vector<vector<int>> splitToArrays(ListNode* head, int k) {
    vector<vector<int>> res;
    for (ListNode *h : splitListToParts(head, k)) {
        res.emplace_back();
        for (; h; h = h->next) res.back().push_back(h->val);
    }
    return res;
}`,
  java: `

List<List<Integer>> splitToArrays(ListNode head, int k) {
    List<List<Integer>> res = new ArrayList<>();
    for (ListNode h : splitListToParts(head, k)) {
        List<Integer> a = new ArrayList<>();
        for (; h != null; h = h.next) a.add(h.val);
        res.add(a);
    }
    return res;
}`,
  javascript: `

function splitToArrays(head, k) {
  return splitListToParts(head, k).map((h) => {
    const a = [];
    for (; h; h = h.next) a.push(h.val);
    return a;
  });
}`,
}

export const q0725: Solution = {
  id: 725,
  plain: '把一條串列切成 k 段,每段長度要盡量平均(任兩段最多差 1 個),而且前面的段不能比後面短。如果節點不夠分,後面的段就是空的。',
  statement: '給串列的頭 `head` 和整數 `k`,把串列切成 k 個連續的部分,任兩部分長度差不超過 1,且前面的部分長度 ≥ 後面的部分。回傳 k 個部分組成的陣列(可能有空串列)。(這裡用 `splitToArrays(head, k)` 把每段轉成陣列來比對。)',
  examples: [
    { input: 'head = [1,2,3], k = 5', output: '[[1],[2],[3],[],[]]' },
    { input: 'head = [1,2,3,4,5,6,7,8,9,10], k = 3', output: '[[1,2,3,4],[5,6,7],[8,9,10]]' },
  ],
  constraints: ['節點數 ≤ 1000,k ≤ 50'],
  insight: ['先知道總長 n,才能算每段多長', '每段 `n // k` 個,前 `n % k` 段多 1 個', '每段走完就把最後一個節點的 next 切斷'],
  approaches: [
    {
      name: '先數長度,再依序切',
      idea: '`q, r = divmod(n, k)`;第 i 段長度 `q + (i < r)`,走到該段最後一個節點後切斷。',
      steps: ['數出 n', '`q, r = divmod(n, k)`', '`for i in 0..k−1`:`parts[i] = cur`;走 `size − 1` 步到該段結尾', '`nxt = cur.next`、`cur.next = None`、`cur = nxt`'],
      figure: { title: `head = [${L}],k = ${K}`, steps: cutFig() },
      complexity: { time: 'O(n + k)', space: 'O(k)(輸出)', why: '數長度一次、切一次。' },
      verdict: '最推薦。「平均分配、餘數給前面」的公式和 [68](#/q/68) 分配空白一樣。',
      code: {
        python: `def splitListToParts(head, k):
    n, p = 0, head
    while p:
        n += 1
        p = p.next
    q, r = divmod(n, k)                       # 每段 q 個,前 r 段多 1 個
    parts, cur = [], head
    for i in range(k):
        parts.append(cur)
        size = q + (1 if i < r else 0)
        for _ in range(size - 1):
            cur = cur.next
        if cur:
            cur.next, cur = None, cur.next    # 切斷,並移到下一段的開頭
    return parts${TO_ARR.python}`,
        c: `struct ListNode **splitListToParts(struct ListNode *head, int k, int *returnSize) {
    int n = 0;
    for (struct ListNode *p = head; p; p = p->next) n++;
    int q = n / k, r = n % k;
    struct ListNode **parts = calloc(k, sizeof(struct ListNode *)), *cur = head;
    for (int i = 0; i < k && cur; i++) {
        parts[i] = cur;
        int size = q + (i < r);
        for (int t = 1; t < size; t++) cur = cur->next;
        struct ListNode *nxt = cur->next;
        cur->next = NULL;
        cur = nxt;
    }
    *returnSize = k;
    return parts;
}${TO_ARR.c}`,
        cpp: `vector<ListNode*> splitListToParts(ListNode* head, int k) {
    int n = 0;
    for (ListNode *p = head; p; p = p->next) n++;
    int q = n / k, r = n % k;
    vector<ListNode*> parts(k, nullptr);
    ListNode *cur = head;
    for (int i = 0; i < k && cur; i++) {
        parts[i] = cur;
        for (int t = 1; t < q + (i < r); t++) cur = cur->next;
        ListNode *nxt = cur->next;
        cur->next = nullptr;
        cur = nxt;
    }
    return parts;
}${TO_ARR.cpp}`,
        java: `ListNode[] splitListToParts(ListNode head, int k) {
    int n = 0;
    for (ListNode p = head; p != null; p = p.next) n++;
    int q = n / k, r = n % k;
    ListNode[] parts = new ListNode[k];
    ListNode cur = head;
    for (int i = 0; i < k && cur != null; i++) {
        parts[i] = cur;
        for (int t = 1; t < q + (i < r ? 1 : 0); t++) cur = cur.next;
        ListNode nxt = cur.next;
        cur.next = null;
        cur = nxt;
    }
    return parts;
}${TO_ARR.java}`,
        javascript: `function splitListToParts(head, k) {
  let n = 0;
  for (let p = head; p; p = p.next) n++;
  const q = Math.floor(n / k), r = n % k, parts = new Array(k).fill(null);
  let cur = head;
  for (let i = 0; i < k && cur; i++) {
    parts[i] = cur;
    for (let t = 1; t < q + (i < r ? 1 : 0); t++) cur = cur.next;
    const nxt = cur.next;
    cur.next = null;
    cur = nxt;
  }
  return parts;
}${TO_ARR.javascript}`,
      },
    },
    {
      name: '節點放進陣列再切',
      idea: '`nodes` 陣列存所有節點;第 i 段從 `start` 開始,長度 size,把 `nodes[start + size − 1].next` 設成 null。',
      steps: ['走一遍收集 nodes', '`start = 0`;`for i`:`size = q + (i < r)`', '`size > 0` → `parts[i] = nodes[start]`、`nodes[start + size − 1].next = None`', '`start += size`'],
      figure: { title: `head = [${L}],k = ${K}`, steps: arrFig() },
      complexity: { time: 'O(n + k)', space: 'O(n)', why: '多一個節點陣列。' },
      verdict: '用索引算位置,不容易差一;代價是 O(n) 額外空間。',
      code: {
        python: `def splitListToParts(head, k):
    nodes = []
    while head:
        nodes.append(head)
        head = head.next
    q, r = divmod(len(nodes), k)
    parts, start = [], 0
    for i in range(k):
        size = q + (1 if i < r else 0)
        if size == 0:
            parts.append(None)
            continue
        parts.append(nodes[start])
        nodes[start + size - 1].next = None   # 切斷這段的結尾
        start += size
    return parts${TO_ARR.python}`,
        c: `struct ListNode **splitListToParts(struct ListNode *head, int k, int *returnSize) {
    struct ListNode *nodes[1000];
    int n = 0;
    for (; head; head = head->next) nodes[n++] = head;
    int q = n / k, r = n % k, start = 0;
    struct ListNode **parts = calloc(k, sizeof(struct ListNode *));
    for (int i = 0; i < k; i++) {
        int size = q + (i < r);
        if (size == 0) continue;
        parts[i] = nodes[start];
        nodes[start + size - 1]->next = NULL;
        start += size;
    }
    *returnSize = k;
    return parts;
}${TO_ARR.c}`,
        cpp: `vector<ListNode*> splitListToParts(ListNode* head, int k) {
    vector<ListNode*> nodes;
    for (; head; head = head->next) nodes.push_back(head);
    int n = nodes.size(), q = n / k, r = n % k, start = 0;
    vector<ListNode*> parts(k, nullptr);
    for (int i = 0; i < k; i++) {
        int size = q + (i < r);
        if (size == 0) continue;
        parts[i] = nodes[start];
        nodes[start + size - 1]->next = nullptr;
        start += size;
    }
    return parts;
}${TO_ARR.cpp}`,
        java: `ListNode[] splitListToParts(ListNode head, int k) {
    List<ListNode> nodes = new ArrayList<>();
    for (; head != null; head = head.next) nodes.add(head);
    int n = nodes.size(), q = n / k, r = n % k, start = 0;
    ListNode[] parts = new ListNode[k];
    for (int i = 0; i < k; i++) {
        int size = q + (i < r ? 1 : 0);
        if (size == 0) continue;
        parts[i] = nodes.get(start);
        nodes.get(start + size - 1).next = null;
        start += size;
    }
    return parts;
}${TO_ARR.java}`,
        javascript: `function splitListToParts(head, k) {
  const nodes = [];
  for (; head; head = head.next) nodes.push(head);
  const n = nodes.length, q = Math.floor(n / k), r = n % k, parts = new Array(k).fill(null);
  let start = 0;
  for (let i = 0; i < k; i++) {
    const size = q + (i < r ? 1 : 0);
    if (size === 0) continue;
    parts[i] = nodes[start];
    nodes[start + size - 1].next = null;
    start += size;
  }
  return parts;
}${TO_ARR.javascript}`,
      },
    },
  ],
  pitfalls: ['餘數分給最後幾段:題目要求前面的段比較長', '沒有切斷 next:每段會一路連到串列結尾', 'k > n 時後面的段要是 null,不能存取 cur.next'],
  check: {
    kind: 'fn',
    fn: 'splitToArrays',
    argKinds: ['list', null],
    cases: [
      { args: [[1, 2, 3], 5], out: [[1], [2], [3], [], []] },
      { args: [L, K], out: [[1, 2, 3, 4], [5, 6, 7], [8, 9, 10]] },
      { args: [[], 3], out: [[], [], []] },
      { args: [[1, 2], 1], out: [[1, 2]] },
    ],
  },
}

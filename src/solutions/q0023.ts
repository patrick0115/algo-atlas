import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 23. Merge k Sorted Lists

const L = [
  [1, 4, 5],
  [1, 3, 4],
  [2, 6],
]

function heapFig(): FigStep[] {
  const ptr = L.map(() => 0)
  const res: number[] = []
  const heapOf = () => L.flatMap((l, i) => (ptr[i] < l.length ? [`${l[ptr[i]]}(第${i}條)`] : [])).sort((a, b) => parseInt(a) - parseInt(b))
  const views = (hl: number) => [...L.map((l, i) => arr(l, { label: `lists[${i}]`, dim: range(0, ptr[i] - 1), highlight: i === hl ? [ptr[i] - 1] : [] })), arr(heapOf(), { label: '最小堆(每條串列目前的開頭)' }), arr([...res], { label: '答案' })]
  const out: FigStep[] = [{ note: '把每條串列的**開頭**放進最小堆。答案的下一個,一定是這 k 個開頭裡最小的那個', views: views(-1) }]
  while (res.length < L.flat().length) {
    let best = -1
    for (let i = 0; i < L.length; i++) if (ptr[i] < L[i].length && (best < 0 || L[i][ptr[i]] < L[best][ptr[best]])) best = i
    res.push(L[best][ptr[best]])
    ptr[best]++
    if (res.length <= 4 || res.length === L.flat().length) out.push({ note: `彈出最小的 ${res[res.length - 1]}(第 ${best} 條)接到答案後面;${ptr[best] < L[best].length ? `把第 ${best} 條的下一個 ${L[best][ptr[best]]} 放進堆` : `第 ${best} 條用完了`}`, views: views(best) })
  }
  return out
}

function divideFig(): FigStep[] {
  return [
    { note: '分治:兩兩合併([21. Merge Two Sorted Lists](#/q/21))。第一輪 k 條變 k/2 條', views: [arr(['[1,4,5] + [1,3,4]', '[2,6]'], { label: '第一輪' }), arr(['[1,1,3,4,4,5]', '[2,6]'], { label: '結果' })] },
    { note: '第二輪再兩兩合併……共 log k 輪,每輪每個節點都被處理一次 → O(N log k)', views: [arr(['[1,1,2,3,4,4,5,6]'], { label: '第二輪', done: [0] })] },
  ]
}

export const q0023: Solution = {
  id: 23,
  plain: '有 k 條已經排好序的鏈結串列,把它們全部合併成一條排好序的串列。就像把好幾疊已經排好的撲克牌合成一疊:每次從各疊的最上面挑最小的那張。',
  statement: '給一個鏈結串列陣列 `lists`,每條串列都已經遞增排序。把所有串列合併成一條遞增的串列並回傳。',
  examples: [
    { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
    { input: 'lists = []', output: '[]' },
    { input: 'lists = [[]]', output: '[]' },
  ],
  constraints: ['`k ≤ 10⁴`,節點總數 N ≤ 10⁴'],
  insight: [
    '一條一條依序合併:第 i 次合併的長度越來越長 → O(N · k),k 大時很慢',
    '答案的下一個節點 = 所有串列「目前開頭」中最小的那個 → 用**最小堆**維護 k 個開頭,每次 O(log k)',
    '或用分治:兩兩合併,共 log k 輪,每輪 O(N)',
  ],
  approaches: [
    {
      name: '分治,兩兩合併',
      idea: '每輪把 lists 裡第 i 和 i + step 條合併(用 21 題的合併兩條),step 每輪加倍,直到只剩一條。',
      steps: ['`step = 1`', '`while step < k`:`for i in range(0, k − step, step * 2)`:`lists[i] = merge(lists[i], lists[i + step])`', '`step *= 2`', '回傳 `lists[0]`(k = 0 時回傳 None)'],
      figure: { title: 'lists = [[1,4,5],[1,3,4],[2,6]]', steps: divideFig() },
      complexity: { time: 'O(N log k)', space: 'O(1)', why: 'log k 輪,每輪所有節點各被合併一次。迭代版不需要遞迴的堆疊。' },
      verdict: '不用堆,只需要會 21 題。和合併排序是同一個想法。',
      code: {
        python: `def mergeKLists(lists):
    def merge(a, b):                          # 21. 合併兩條排序串列
        dummy = tail = ListNode()
        while a and b:
            if a.val <= b.val:
                tail.next, a = a, a.next
            else:
                tail.next, b = b, b.next
            tail = tail.next
        tail.next = a or b
        return dummy.next

    if not lists:
        return None
    step = 1
    while step < len(lists):
        for i in range(0, len(lists) - step, step * 2):
            lists[i] = merge(lists[i], lists[i + step])
        step *= 2
    return lists[0]`,
        c: `static struct ListNode *merge(struct ListNode *a, struct ListNode *b) {
    struct ListNode dummy = {0, NULL}, *tail = &dummy;
    while (a && b) {
        if (a->val <= b->val) { tail->next = a; a = a->next; }
        else { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    return dummy.next;
}

struct ListNode *mergeKLists(struct ListNode **lists, int listsSize) {
    if (listsSize == 0) return NULL;
    for (int step = 1; step < listsSize; step *= 2)
        for (int i = 0; i + step < listsSize; i += step * 2)
            lists[i] = merge(lists[i], lists[i + step]);
    return lists[0];
}`,
        cpp: `ListNode* mergeTwo(ListNode* a, ListNode* b) {
    ListNode dummy, *tail = &dummy;
    while (a && b) {
        if (a->val <= b->val) { tail->next = a; a = a->next; }
        else { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    return dummy.next;
}

ListNode* mergeKLists(vector<ListNode*>& lists) {
    int k = lists.size();
    if (k == 0) return nullptr;
    for (int step = 1; step < k; step *= 2)
        for (int i = 0; i + step < k; i += step * 2) lists[i] = mergeTwo(lists[i], lists[i + step]);
    return lists[0];
}`,
        java: `ListNode mergeKLists(ListNode[] lists) {
    int k = lists.length;
    if (k == 0) return null;
    for (int step = 1; step < k; step *= 2)
        for (int i = 0; i + step < k; i += step * 2) lists[i] = merge(lists[i], lists[i + step]);
    return lists[0];
}

private ListNode merge(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = a != null ? a : b;
    return dummy.next;
}`,
        javascript: `function mergeKLists(lists) {
  const merge = (a, b) => {
    const dummy = new ListNode();
    let tail = dummy;
    while (a && b) {
      if (a.val <= b.val) { tail.next = a; a = a.next; }
      else { tail.next = b; b = b.next; }
      tail = tail.next;
    }
    tail.next = a || b;
    return dummy.next;
  };
  if (!lists.length) return null;
  for (let step = 1; step < lists.length; step *= 2)
    for (let i = 0; i + step < lists.length; i += step * 2) lists[i] = merge(lists[i], lists[i + step]);
  return lists[0];
}`,
      },
    },
    {
      name: '最小堆',
      idea: '把每條非空串列的開頭放進最小堆。每次彈出最小的接到答案後面,再把它的 next(如果有)放回堆。',
      steps: ['堆裡放 `(值, 第幾條, 節點)`', '`while heap`:彈出最小的,接到 tail 後面', '它的 next 不是 None → 放回堆', '回傳 dummy.next'],
      figure: { title: 'lists = [[1,4,5],[1,3,4],[2,6]]', steps: heapFig() },
      complexity: { time: 'O(N log k)', space: 'O(k)', why: 'N 個節點各進出堆一次,堆最多 k 個。' },
      verdict: '最推薦,[[p:heap]]「k 路合併」的模板。Python 的 heapq 不能比較節點,要放一個序號當第二個比較值。',
      code: {
        python: `import heapq

def mergeKLists(lists):
    heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
    heapq.heapify(heap)                       # i 用來打破平手(節點不能比較)
    dummy = tail = ListNode()
    while heap:
        _, i, node = heapq.heappop(heap)      # 目前所有開頭裡最小的
        tail.next = tail = node
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next`,
        c: `// 自己寫一個小的二元最小堆
static struct ListNode **H;
static int hn;

static void up(int i) {
    while (i && H[(i - 1) / 2]->val > H[i]->val) {
        struct ListNode *t = H[i]; H[i] = H[(i - 1) / 2]; H[(i - 1) / 2] = t;
        i = (i - 1) / 2;
    }
}

static void down(int i) {
    while (1) {
        int s = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < hn && H[l]->val < H[s]->val) s = l;
        if (r < hn && H[r]->val < H[s]->val) s = r;
        if (s == i) return;
        struct ListNode *t = H[i]; H[i] = H[s]; H[s] = t;
        i = s;
    }
}

struct ListNode *mergeKLists(struct ListNode **lists, int listsSize) {
    H = malloc((listsSize + 1) * sizeof(struct ListNode *));
    hn = 0;
    for (int i = 0; i < listsSize; i++)
        if (lists[i]) { H[hn++] = lists[i]; up(hn - 1); }
    struct ListNode dummy = {0, NULL}, *tail = &dummy;
    while (hn) {
        struct ListNode *node = H[0];
        tail->next = node;
        tail = node;
        if (node->next) H[0] = node->next;
        else H[0] = H[--hn];
        down(0);
    }
    free(H);
    return dummy.next;
}`,
        cpp: `ListNode* mergeKLists(vector<ListNode*>& lists) {
    auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
    priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
    for (ListNode* l : lists) if (l) pq.push(l);
    ListNode dummy, *tail = &dummy;
    while (!pq.empty()) {
        ListNode* node = pq.top(); pq.pop();
        tail->next = node;
        tail = node;
        if (node->next) pq.push(node->next);
    }
    return dummy.next;
}`,
        java: `ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
    for (ListNode l : lists) if (l != null) pq.add(l);
    ListNode dummy = new ListNode(), tail = dummy;
    while (!pq.isEmpty()) {
        ListNode node = pq.poll();
        tail.next = node;
        tail = node;
        if (node.next != null) pq.add(node.next);
    }
    return dummy.next;
}`,
        javascript: `function mergeKLists(lists) {
  // JS 沒有內建堆:用陣列寫一個最小堆
  const h = [];
  const swap = (i, j) => ([h[i], h[j]] = [h[j], h[i]]);
  const push = (n) => {
    h.push(n);
    for (let i = h.length - 1; i && h[(i - 1) >> 1].val > h[i].val; i = (i - 1) >> 1) swap(i, (i - 1) >> 1);
  };
  const pop = () => {
    const top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      for (let i = 0; ; ) {
        let s = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < h.length && h[l].val < h[s].val) s = l;
        if (r < h.length && h[r].val < h[s].val) s = r;
        if (s === i) break;
        swap(i, s);
        i = s;
      }
    }
    return top;
  };
  for (const l of lists) if (l) push(l);
  const dummy = new ListNode();
  let tail = dummy;
  while (h.length) {
    const node = pop();
    tail = tail.next = node;
    if (node.next) push(node.next);
  }
  return dummy.next;
}`,
      },
    },
  ],
  pitfalls: [
    '依序一條一條合併:總共 O(N · k),k = 10⁴ 時會很慢',
    'Python heapq 放 `(val, node)`:值相同時會去比較 node,丟出 TypeError → 中間加一個序號',
    '沒處理 `lists = []` 或裡面有空串列',
  ],
  followUp: [{ q: '和排序全部值再重建串列比?', a: 'O(N log N) 而且要 O(N) 空間;堆和分治都利用了「每條已經排好序」,所以是 O(N log k)。' }],
  check: {
    kind: 'fn',
    fn: 'mergeKLists',
    argKinds: ['listArr'],
    ret: 'list',
    cases: [
      { args: [L], out: [1, 1, 2, 3, 4, 4, 5, 6] },
      { args: [[]], out: [] },
      { args: [[[]]], out: [] },
      { args: [[[2], [], [1]]], out: [1, 2] },
      { args: [[[5, 6], [1, 2], [3, 4], [0, 7]]], out: [0, 1, 2, 3, 4, 5, 6, 7] },
    ],
  },
}

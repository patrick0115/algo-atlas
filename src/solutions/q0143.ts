import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { chain } from './fig'

// 143. Reorder List

const V = [1, 2, 3, 4, 5, 6]

function arrayFig(): FigStep[] {
  const out: FigStep[] = [{ note: '目標:頭、尾、第二個、倒數第二個……交錯排。先把所有節點放進陣列,就能用索引直接拿到「尾巴」', views: [chain(V, { tail: true }), arr(V, { label: 'nodes(陣列)' })] }]
  let l = 0
  let r = V.length - 1
  const res: number[] = []
  while (l <= r) {
    res.push(V[l])
    if (l !== r) res.push(V[r])
    out.push({ note: `左右夾擠:接上 nodes[${l}] = ${V[l]}${l !== r ? `,再接 nodes[${r}] = ${V[r]}` : '(只剩它一個)'}`, views: [arr(V, { label: 'nodes', compare: l === r ? [l] : [l, r], pointers: [{ name: 'l', index: l }, { name: 'r', index: r, color: 'b' }] }), chain(res, { label: '重新接好的部分' })] })
    l++
    r--
  }
  out.push({ note: '最後一個節點的 next 要設成 null,不然會留下舊的箭頭變成環', views: [chain(res, { tail: true })] })
  return out
}

function o1Fig(): FigStep[] {
  const mid = Math.floor((V.length - 1) / 2)
  const first = V.slice(0, mid + 1)
  const second = V.slice(mid + 1)
  const rev = [...second].reverse()
  const merged: number[] = []
  for (let i = 0; i < first.length; i++) {
    merged.push(first[i])
    if (i < rev.length) merged.push(rev[i])
  }
  return [
    { note: '不用陣列的做法分三步。① 用快慢指針找中點:slow 一次一步、fast 一次兩步,fast 走到底時 slow 在中間', views: [chain(V, { tail: true, subs: { [mid]: 'slow(中點)', [2 * mid]: 'fast' }, cls: { [mid]: 'hl' } })] },
    { note: `從中點切開:前半 [${first.join(',')}]、後半 [${second.join(',')}]`, views: [chain(first, { label: '前半', tail: true }), chain(second, { label: '後半', tail: true })] },
    { note: '② 把後半反轉([206. Reverse Linked List](#/q/206) 的三指標)', views: [chain(first, { label: '前半', tail: true }), chain(rev, { label: '後半(反轉後)', tail: true, cls: Object.fromEntries(rev.map((_, i) => [i, 'visited'])) })] },
    { note: '③ 兩條交錯合併:前半拿一個、後半拿一個……', views: [chain(merged, { label: '結果', tail: true, cls: Object.fromEntries(merged.map((v, i) => [i, rev.includes(v) ? 'visited' : ''])) })] },
  ]
}

export const q0143: Solution = {
  id: 143,
  plain: '把一條鏈子重新排成「第一個、最後一個、第二個、倒數第二個……」的順序。像兩隊人從頭和尾輪流各派一個人出來排成新隊伍。只能改指標,不能改節點裡的數字。',
  statement: '給鏈結串列 `L0 → L1 → … → Ln`,把它原地重排成 `L0 → Ln → L1 → Ln−1 → L2 → …`。不能修改節點的值,只能改節點之間的連接。函式不回傳東西。',
  examples: [
    { input: 'head = [1,2,3,4]', output: '[1,4,2,3]' },
    { input: 'head = [1,2,3,4,5]', output: '[1,5,2,4,3]' },
  ],
  constraints: ['`1 ≤ 節點數 ≤ 5·10⁴`', '鏈結串列不能往回走 → 要拿到「尾巴」很麻煩,這是這題的難點'],
  insight: [
    '如果是陣列,左右兩個指標往中間夾就好。但鏈結串列只能往前走,拿不到尾巴',
    '最簡單:先把節點放進陣列(O(n) 空間),就能用索引從兩頭拿',
    '不用額外空間:觀察結果 = 前半段 和「反轉的後半段」交錯合併。所以拆成三個學過的小問題:**找中點**(快慢指針)→ **反轉後半**([206](#/q/206))→ **交錯合併**',
  ],
  approaches: [
    {
      name: '節點放進陣列 + 左右夾擠',
      idea: '把節點依序存進陣列,左右兩個索引往中間走,依序把 `nodes[l]`、`nodes[r]` 接起來。',
      steps: ['`nodes = 所有節點`', '`l = 0`、`r = n − 1`', '`while l < r`:`nodes[l].next = nodes[r]`、`l++`;`l == r` 就停;`nodes[r].next = nodes[l]`、`r--`', '最後 `nodes[l].next = null`'],
      figure: { title: 'head = [1,2,3,4,5,6]', steps: arrayFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '走一遍存進陣列,再走一遍重接。陣列存 n 個節點。' },
      verdict: '最好懂、最不容易錯。不符合 O(1) 空間的要求,但面試時先講這個很好。',
      code: {
        python: `def reorderList(head):
    nodes = []
    while head:
        nodes.append(head)
        head = head.next
    l, r = 0, len(nodes) - 1
    while l < r:
        nodes[l].next = nodes[r]
        l += 1
        if l == r:
            break
        nodes[r].next = nodes[l]
        r -= 1
    nodes[l].next = None                  # 新的尾巴`,
        c: `void reorderList(struct ListNode *head) {
    int n = 0;
    for (struct ListNode *p = head; p; p = p->next) n++;
    struct ListNode **nodes = malloc(n * sizeof(*nodes));
    int k = 0;
    for (struct ListNode *p = head; p; p = p->next) nodes[k++] = p;
    int l = 0, r = n - 1;
    while (l < r) {
        nodes[l]->next = nodes[r];
        if (++l == r) break;
        nodes[r]->next = nodes[l];
        r--;
    }
    nodes[l]->next = NULL;
    free(nodes);
}`,
        cpp: `void reorderList(ListNode* head) {
    vector<ListNode*> nodes;
    for (ListNode* p = head; p; p = p->next) nodes.push_back(p);
    int l = 0, r = (int)nodes.size() - 1;
    while (l < r) {
        nodes[l]->next = nodes[r];
        if (++l == r) break;
        nodes[r]->next = nodes[l];
        r--;
    }
    nodes[l]->next = nullptr;
}`,
        java: `void reorderList(ListNode head) {
    List<ListNode> nodes = new ArrayList<>();
    for (ListNode p = head; p != null; p = p.next) nodes.add(p);
    int l = 0, r = nodes.size() - 1;
    while (l < r) {
        nodes.get(l).next = nodes.get(r);
        if (++l == r) break;
        nodes.get(r).next = nodes.get(l);
        r--;
    }
    nodes.get(l).next = null;
}`,
        javascript: `function reorderList(head) {
  const nodes = [];
  for (let p = head; p; p = p.next) nodes.push(p);
  let l = 0, r = nodes.length - 1;
  while (l < r) {
    nodes[l].next = nodes[r];
    if (++l === r) break;
    nodes[r].next = nodes[l];
    r--;
  }
  nodes[l].next = null;
}`,
      },
    },
    {
      name: '找中點 → 反轉後半 → 交錯合併',
      idea: '用快慢指針找到中點並切開;把後半段反轉;再把兩段交錯接起來。三個步驟都是 O(1) 空間。',
      steps: ['`slow = fast = head`;`while fast.next and fast.next.next`:slow 一步、fast 兩步', '`second = slow.next`、`slow.next = null`(切開)', '反轉 `second`', '交錯合併:`first.next = second`、`second.next = 原本的 first.next`,兩邊各往前一步'],
      figure: { title: 'head = [1,2,3,4,5,6]', steps: o1Fig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '三個步驟各走一遍串列,只用幾個指標。' },
      verdict: '標準解。這題是「把大問題拆成三個學過的小問題」的好例子:找中點、反轉、合併各自都是一題 Easy。',
      code: {
        python: `def reorderList(head):
    # ① 找中點:fast 走到底時 slow 在前半的最後一個
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    second = slow.next
    slow.next = None                      # 切成兩段

    # ② 反轉後半
    prev = None
    while second:
        second.next, prev, second = prev, second, second.next

    # ③ 交錯合併
    first, second = head, prev
    while second:
        n1, n2 = first.next, second.next
        first.next = second
        second.next = n1
        first, second = n1, n2`,
        c: `void reorderList(struct ListNode *head) {
    struct ListNode *slow = head, *fast = head;
    while (fast->next && fast->next->next) { slow = slow->next; fast = fast->next->next; }
    struct ListNode *second = slow->next, *prev = NULL;
    slow->next = NULL;
    while (second) {                          // 反轉後半
        struct ListNode *nx = second->next;
        second->next = prev;
        prev = second;
        second = nx;
    }
    struct ListNode *first = head;
    second = prev;
    while (second) {                          // 交錯合併
        struct ListNode *n1 = first->next, *n2 = second->next;
        first->next = second;
        second->next = n1;
        first = n1; second = n2;
    }
}`,
        cpp: `void reorderList(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast->next && fast->next->next) { slow = slow->next; fast = fast->next->next; }
    ListNode *second = slow->next, *prev = nullptr;
    slow->next = nullptr;
    while (second) {
        ListNode* nx = second->next;
        second->next = prev;
        prev = second;
        second = nx;
    }
    ListNode* first = head;
    second = prev;
    while (second) {
        ListNode *n1 = first->next, *n2 = second->next;
        first->next = second;
        second->next = n1;
        first = n1; second = n2;
    }
}`,
        java: `void reorderList(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast.next != null && fast.next.next != null) { slow = slow.next; fast = fast.next.next; }
    ListNode second = slow.next, prev = null;
    slow.next = null;
    while (second != null) {
        ListNode nx = second.next;
        second.next = prev;
        prev = second;
        second = nx;
    }
    ListNode first = head;
    second = prev;
    while (second != null) {
        ListNode n1 = first.next, n2 = second.next;
        first.next = second;
        second.next = n1;
        first = n1; second = n2;
    }
}`,
        javascript: `function reorderList(head) {
  let slow = head, fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let second = slow.next, prev = null;
  slow.next = null;
  while (second) {
    const nx = second.next;
    second.next = prev;
    prev = second;
    second = nx;
  }
  let first = head;
  second = prev;
  while (second) {
    const n1 = first.next, n2 = second.next;
    first.next = second;
    second.next = n1;
    first = n1;
    second = n2;
  }
}`,
      },
    },
  ],
  pitfalls: [
    '找到中點後忘了 `slow.next = null` 切開:前半的尾巴還連著後半,合併後會形成環',
    '中點的位置:用 `fast.next and fast.next.next` 當條件,slow 會停在**前半的最後一個**,前半長度 ≥ 後半,合併時以後半走完為準',
    '陣列版最後忘了把新尾巴的 `next` 設成 null',
    '交錯合併前沒先存好 `first.next`、`second.next`,改完指標就找不到下一個了',
  ],
  followUp: [
    { q: '同樣拆解的題目?', a: '234. Palindrome Linked List:找中點 → 反轉後半 → 兩邊逐一比較。' },
  ],
  check: {
    kind: 'fn',
    fn: 'reorderList',
    argKinds: ['list'],
    inplace: 0,
    cases: [
      { args: [[1, 2, 3, 4]], out: [1, 4, 2, 3] },
      { args: [[1, 2, 3, 4, 5]], out: [1, 5, 2, 4, 3] },
      { args: [[1]], out: [1] },
      { args: [[1, 2]], out: [1, 2] },
      { args: [V], out: [1, 6, 2, 5, 3, 4] },
    ],
  },
}

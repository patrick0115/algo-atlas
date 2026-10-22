import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 25. Reverse Nodes in k-Group

const V = [1, 2, 3, 4, 5, 6, 7, 8]
const K = 3

function groupFig(): FigStep[] {
  const out: FigStep[] = []
  const cur = [...V]
  const cls = (from: number, to: number, done: number): Record<number, string> => {
    const c: Record<number, string> = {}
    for (let i = 0; i < done; i++) c[i] = 'done'
    for (let i = from; i < to; i++) c[i] = 'hl'
    return c
  }
  out.push({ note: `每 ${K} 個一組反轉;最後不足 ${K} 個的(7、8)保持原樣。做法:先往前數 ${K} 個確認這組夠長,再用 [206](#/q/206) 的方法反轉這一段,最後把它接回前後`, views: [chain(cur, { label: '原本', tail: true })] })
  for (let s = 0; s + K <= cur.length; s += K) {
    out.push({ note: `第 ${s / K + 1} 組:從 ${cur[s]} 往後數 ${K} 個都在 → 這組要反轉`, views: [chain(cur, { label: '找到一組', tail: true, cls: cls(s, s + K, s), subs: { [s]: 'groupPrev.next', [s + K - 1]: 'kth' } })] })
    const seg = cur.slice(s, s + K).reverse()
    cur.splice(s, K, ...seg)
    out.push({ note: `反轉後:前一組的尾巴接到 ${cur[s]}(原本的 kth),這組新的尾巴 ${cur[s + K - 1]} 接到下一組的開頭 ${cur[s + K] ?? 'null'}`, views: [chain(cur, { label: '反轉並接回', tail: true, cls: cls(s, s + K, s), subs: { [s + K - 1]: '新的 groupPrev' } })] })
  }
  out.push({ note: `剩下 ${cur.length % K} 個不足一組,不動`, views: [chain(cur, { label: '答案', tail: true, cls: Object.fromEntries(cur.map((_, i) => [i, i < cur.length - (cur.length % K) ? 'done' : 'dim'])) })] })
  return out
}

function recFig(): FigStep[] {
  return [
    { note: '遞迴想法:先檢查前 k 個是否存在;反轉前 k 個;第 k 個之後的部分,交給遞迴處理,回傳的新開頭接在這組的尾巴後面', views: [chain([3, 2, 1, '…'], { label: 'reverseKGroup(1→…)' })] },
    { note: '遞迴回來:1 的 next = reverseKGroup(4→…) 的結果 = 6→5→4→7→8', views: [chain([3, 2, 1, 6, 5, 4, 7, 8], { label: '組合', tail: true, cls: { 2: 'hl', 3: 'cur' } })] },
  ]
}

export const q0025: Solution = {
  id: 25,
  plain: '把一條鏈結串列每 k 個節點分成一組,每一組內部**前後顛倒**;最後剩下不滿 k 個的就維持原樣。例如 k = 3:1→2→3→4→5→6→7→8 變成 3→2→1→6→5→4→7→8。',
  statement: '給鏈結串列的 `head` 與正整數 `k`,每 k 個節點一組進行翻轉,回傳修改後的串列。節點數不是 k 的倍數時,最後剩餘的節點保持原有順序。只能改變節點的指向,不能只改節點的值。',
  examples: [
    { input: 'head = [1,2,3,4,5], k = 2', output: '[2,1,4,3,5]' },
    { input: 'head = [1,2,3,4,5], k = 3', output: '[3,2,1,4,5]' },
  ],
  constraints: ['`n ≤ 5000`,`1 ≤ k ≤ n`', 'Follow-up:O(1) 額外空間'],
  insight: [
    '拆成兩個已經會的小問題:**找出一組**(往前走 k 步,不夠就停)+ **反轉一段**([206. Reverse Linked List](#/q/206))',
    '難的是「接回去」:要記住前一組的尾巴(`groupPrev`)和下一組的開頭(`groupNext`)',
    '用 dummy 節點當作第 0 組的尾巴,第一組就不用特別處理',
  ],
  approaches: [
    {
      name: '遞迴',
      idea: '先確認有 k 個節點;反轉前 k 個;原本的開頭(現在是這組的尾巴)接上 `reverseKGroup(第 k+1 個, k)`。',
      steps: ['往前數 k 個,不夠 → 回傳 head', '反轉這 k 個(prev 初始為下一組的開頭)', '回傳這組新的開頭;原本的 head 接到遞迴的結果'],
      figure: { title: `k = ${K}`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(n / k)', why: '每個節點處理常數次;遞迴深度是組數。' },
      verdict: '程式短、好理解,但不符合 O(1) 空間的 follow-up。',
      code: {
        python: `def reverseKGroup(head, k):
    node = head
    for _ in range(k):                        # 確認有 k 個
        if not node:
            return head
        node = node.next
    # 反轉 head..(k 個),prev 從「下一組處理完的結果」開始
    prev, cur = reverseKGroup(node, k), head
    for _ in range(k):
        cur.next, prev, cur = prev, cur, cur.next
    return prev`,
        c: `struct ListNode *reverseKGroup(struct ListNode *head, int k) {
    struct ListNode *node = head;
    for (int i = 0; i < k; i++) {
        if (!node) return head;
        node = node->next;
    }
    struct ListNode *prev = reverseKGroup(node, k), *cur = head;
    for (int i = 0; i < k; i++) {
        struct ListNode *nxt = cur->next;
        cur->next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}`,
        cpp: `ListNode* reverseKGroup(ListNode* head, int k) {
    ListNode* node = head;
    for (int i = 0; i < k; i++) {
        if (!node) return head;
        node = node->next;
    }
    ListNode *prev = reverseKGroup(node, k), *cur = head;
    for (int i = 0; i < k; i++) {
        ListNode* nxt = cur->next;
        cur->next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}`,
        java: `ListNode reverseKGroup(ListNode head, int k) {
    ListNode node = head;
    for (int i = 0; i < k; i++) {
        if (node == null) return head;
        node = node.next;
    }
    ListNode prev = reverseKGroup(node, k), cur = head;
    for (int i = 0; i < k; i++) {
        ListNode nxt = cur.next;
        cur.next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}`,
        javascript: `function reverseKGroup(head, k) {
  let node = head;
  for (let i = 0; i < k; i++) {
    if (!node) return head;
    node = node.next;
  }
  let prev = reverseKGroup(node, k), cur = head;
  for (let i = 0; i < k; i++) {
    const nxt = cur.next;
    cur.next = prev;
    prev = cur;
    cur = nxt;
  }
  return prev;
}`,
      },
    },
    {
      name: '迭代 + dummy',
      idea: '`groupPrev` 從 dummy 開始。每輪找第 k 個節點 `kth`;沒有就結束。反轉 `groupPrev.next .. kth`(prev 初始為 `kth.next`),再把 groupPrev 接到 kth、groupPrev 移到這組的新尾巴。',
      steps: ['`dummy.next = head`;`groupPrev = dummy`', '`kth` = 從 groupPrev 往前走 k 步;None → 結束', '`groupNext = kth.next`;反轉這組(prev 從 groupNext 開始)', '`tmp = groupPrev.next`(這組原本的頭 = 新的尾);`groupPrev.next = kth`;`groupPrev = tmp`'],
      figure: { title: `head = [${V}],k = ${K}`, steps: groupFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個節點被「數」一次、「反轉」一次。' },
      verdict: '最推薦,Follow-up 的答案。畫圖把四個指標(groupPrev、kth、groupNext、tmp)標清楚就不會錯。',
      code: {
        python: `def reverseKGroup(head, k):
    dummy = ListNode(0, head)
    group_prev = dummy
    while True:
        kth = group_prev
        for _ in range(k):                    # 找這組的第 k 個
            kth = kth.next
            if not kth:
                return dummy.next             # 不足 k 個:結束
        group_next = kth.next
        prev, cur = group_next, group_prev.next
        while cur is not group_next:          # 反轉這一組
            cur.next, prev, cur = prev, cur, cur.next
        tail = group_prev.next                # 原本的頭,現在是這組的尾
        group_prev.next = kth
        group_prev = tail`,
        c: `struct ListNode *reverseKGroup(struct ListNode *head, int k) {
    struct ListNode dummy = {0, head}, *groupPrev = &dummy;
    while (1) {
        struct ListNode *kth = groupPrev;
        for (int i = 0; i < k && kth; i++) kth = kth->next;
        if (!kth) return dummy.next;
        struct ListNode *groupNext = kth->next, *prev = groupNext, *cur = groupPrev->next;
        while (cur != groupNext) {
            struct ListNode *nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }
        struct ListNode *tail = groupPrev->next;
        groupPrev->next = kth;
        groupPrev = tail;
    }
}`,
        cpp: `ListNode* reverseKGroup(ListNode* head, int k) {
    ListNode dummy(0, head), *groupPrev = &dummy;
    while (true) {
        ListNode* kth = groupPrev;
        for (int i = 0; i < k && kth; i++) kth = kth->next;
        if (!kth) return dummy.next;
        ListNode *groupNext = kth->next, *prev = groupNext, *cur = groupPrev->next;
        while (cur != groupNext) {
            ListNode* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }
        ListNode* tail = groupPrev->next;
        groupPrev->next = kth;
        groupPrev = tail;
    }
}`,
        java: `ListNode reverseKGroup(ListNode head, int k) {
    ListNode dummy = new ListNode(0, head), groupPrev = dummy;
    while (true) {
        ListNode kth = groupPrev;
        for (int i = 0; i < k && kth != null; i++) kth = kth.next;
        if (kth == null) return dummy.next;
        ListNode groupNext = kth.next, prev = groupNext, cur = groupPrev.next;
        while (cur != groupNext) {
            ListNode nxt = cur.next;
            cur.next = prev;
            prev = cur;
            cur = nxt;
        }
        ListNode tail = groupPrev.next;
        groupPrev.next = kth;
        groupPrev = tail;
    }
}`,
        javascript: `function reverseKGroup(head, k) {
  const dummy = new ListNode(0, head);
  let groupPrev = dummy;
  while (true) {
    let kth = groupPrev;
    for (let i = 0; i < k && kth; i++) kth = kth.next;
    if (!kth) return dummy.next;
    const groupNext = kth.next;
    let prev = groupNext, cur = groupPrev.next;
    while (cur !== groupNext) {
      const nxt = cur.next;
      cur.next = prev;
      prev = cur;
      cur = nxt;
    }
    const tail = groupPrev.next;
    groupPrev.next = kth;
    groupPrev = tail;
  }
}`,
      },
    },
  ],
  pitfalls: [
    '先反轉再檢查長度:最後不足 k 個的那組也被反轉了,還要再轉回來',
    '反轉時 prev 從 None 開始:這組的尾巴會斷開,要從 groupNext 開始',
    '反轉完 groupPrev 移到 kth:kth 現在是這組的**頭**,應該移到原本的頭(現在的尾)',
  ],
  check: {
    kind: 'fn',
    fn: 'reverseKGroup',
    argKinds: ['list', null],
    ret: 'list',
    cases: [
      { args: [[1, 2, 3, 4, 5], 2], out: [2, 1, 4, 3, 5] },
      { args: [[1, 2, 3, 4, 5], 3], out: [3, 2, 1, 4, 5] },
      { args: [V, K], out: [3, 2, 1, 6, 5, 4, 7, 8] },
      { args: [[1], 1], out: [1] },
      { args: [[1, 2, 3, 4], 4], out: [4, 3, 2, 1] },
      { args: [[1, 2, 3], 1], out: [1, 2, 3] },
    ],
  },
}

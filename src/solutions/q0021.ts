import type { FigStep, Solution } from './types'
import { chain } from './fig'

// 21. Merge Two Sorted Lists

const A = [1, 3, 4, 8]
const B = [1, 2, 5]

function mergeFig(recursive: boolean): FigStep[] {
  let i = 0
  let j = 0
  const res: number[] = []
  const draw = (note: string): FigStep => ({
    note,
    views: [
      chain(A, { label: 'list1', tail: true, cls: { ...Object.fromEntries(A.slice(0, i).map((_, k) => [k, 'dim'])), ...(i < A.length ? { [i]: 'hl' } : {}) } }),
      chain(B, { label: 'list2', tail: true, cls: { ...Object.fromEntries(B.slice(0, j).map((_, k) => [k, 'dim'])), ...(j < B.length ? { [j]: 'hl' } : {}) } }),
      chain(recursive ? res : ['D', ...res], { label: recursive ? '結果(遞迴每一層決定一個)' : '結果(D 是假的頭)', cls: recursive ? {} : { 0: 'dim' } }),
    ],
  })
  const out: FigStep[] = [draw(recursive ? '遞迴:比較兩條的頭,小的那個當結果的頭,它的 next = 「剩下的部分合併的結果」' : '準備一個假的頭 D 和一個 tail 指標。每次比較兩條的頭,把小的接到 tail 後面')]
  while (i < A.length && j < B.length) {
    const takeA = A[i] <= B[j]
    const v = takeA ? A[i] : B[j]
    res.push(v)
    if (takeA) i++
    else j++
    out.push(draw(`${takeA ? `list1 的 ${v} ≤ list2 的 ${B[j]}` : `list2 的 ${v} < list1 的 ${A[i]}`} → 接上 ${v}${takeA && v === B[j] ? '(一樣大時拿 list1 的,保持穩定)' : ''}`))
  }
  const rest = i < A.length ? A.slice(i) : B.slice(j)
  res.push(...rest)
  i = A.length
  j = B.length
  out.push(draw(`有一條走完了,另一條剩下的 [${rest.join(',')}] 本來就排好了 → 整段直接接上`))
  return out
}

export const q0021: Solution = {
  id: 21,
  plain: '把兩條「已經從小排到大」的鏈子合成一條,而且還是從小排到大。像兩疊已經按號碼排好的考卷合成一疊:每次看兩疊最上面那張,號碼小的先拿。',
  statement: '給兩個已經**由小到大排好**的鏈結串列 `list1`、`list2`,把它們合併成一個排好的串列(用原本的節點接起來),回傳新串列的頭。',
  examples: [
    { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
    { input: 'list1 = [], list2 = []', output: '[]' },
    { input: 'list1 = [], list2 = [0]', output: '[0]' },
  ],
  constraints: ['兩條各 `0 ~ 50` 個節點 → 可能有空串列', '兩條都已經排好 → 每次只要比較兩個頭'],
  insight: [
    '兩條都排好了,所以「目前最小的」一定是兩個頭的其中一個',
    '每次拿走較小的頭,接到結果後面,再比較新的兩個頭……直到一條走完,另一條剩下的直接整段接上',
    '這就是[[p:merge-sort]]的「合併」步驟,只是換成鏈結串列',
    '用 dummy(假的頭)可以避免「結果還是空的時候要特別處理」',
  ],
  approaches: [
    {
      name: '迭代 + dummy 頭',
      idea: '`tail` 指向結果的最後一個節點。每次把 `list1`、`list2` 中較小的頭接到 `tail` 後面。',
      steps: ['`dummy = Node()`、`tail = dummy`', '`while list1 and list2`:較小的那個接到 `tail.next`,它所在的串列往前一步', '`tail = tail.next`', '迴圈結束:`tail.next = list1 or list2`(剩下的直接接上)', '回傳 `dummy.next`'],
      figure: { title: `list1 = [${A.join(',')}], list2 = [${B.join(',')}]`, steps: mergeFig(false) },
      complexity: { time: 'O(m + n)', space: 'O(1)', why: '每個節點被接一次;只是改指標,沒有建新節點。' },
      verdict: '標準解,一定要熟。[23. Merge k Sorted Lists](#/q/23)、148. Sort List(鏈結串列的合併排序)都會用到它。',
      code: {
        python: `def mergeTwoLists(list1, list2):
    dummy = tail = ListNode()
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next, list1 = list1, list1.next
        else:
            tail.next, list2 = list2, list2.next
        tail = tail.next
    tail.next = list1 or list2            # 剩下的一整段直接接上
    return dummy.next`,
        c: `struct ListNode *mergeTwoLists(struct ListNode *list1, struct ListNode *list2) {
    struct ListNode dummy = {0, NULL}, *tail = &dummy;
    while (list1 && list2) {
        if (list1->val <= list2->val) { tail->next = list1; list1 = list1->next; }
        else { tail->next = list2; list2 = list2->next; }
        tail = tail->next;
    }
    tail->next = list1 ? list1 : list2;
    return dummy.next;
}`,
        cpp: `ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
    ListNode dummy, *tail = &dummy;
    while (list1 && list2) {
        if (list1->val <= list2->val) { tail->next = list1; list1 = list1->next; }
        else { tail->next = list2; list2 = list2->next; }
        tail = tail->next;
    }
    tail->next = list1 ? list1 : list2;
    return dummy.next;
}`,
        java: `ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    ListNode dummy = new ListNode(), tail = dummy;
    while (list1 != null && list2 != null) {
        if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
        else { tail.next = list2; list2 = list2.next; }
        tail = tail.next;
    }
    tail.next = list1 != null ? list1 : list2;
    return dummy.next;
}`,
        javascript: `function mergeTwoLists(list1, list2) {
  const dummy = new ListNode();
  let tail = dummy;
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }
  tail.next = list1 || list2;
  return dummy.next;
}`,
      },
    },
    {
      name: '遞迴',
      idea: '兩個頭比較,小的那個當答案的頭,它的 `next` = 「它後面那段」和「另一條」合併的結果。有一條是空的就直接回傳另一條。',
      steps: ['`list1` 空 → 回傳 `list2`;`list2` 空 → 回傳 `list1`', '`list1.val <= list2.val` → `list1.next = merge(list1.next, list2)`,回傳 `list1`', '否則 → `list2.next = merge(list1, list2.next)`,回傳 `list2`'],
      figure: { title: `list1 = [${A.join(',')}], list2 = [${B.join(',')}]`, steps: mergeFig(true) },
      complexity: { time: 'O(m + n)', space: 'O(m + n)', why: '每一層決定一個節點;遞迴深度是 m + n。' },
      verdict: '只有幾行,很適合練習遞迴的想法。但會用 O(m + n) 的堆疊空間,串列很長時迭代版比較安全。',
      code: {
        python: `def mergeTwoLists(list1, list2):
    if not list1:
        return list2
    if not list2:
        return list1
    if list1.val <= list2.val:
        list1.next = mergeTwoLists(list1.next, list2)
        return list1
    list2.next = mergeTwoLists(list1, list2.next)
    return list2`,
        c: `struct ListNode *mergeTwoLists(struct ListNode *list1, struct ListNode *list2) {
    if (!list1) return list2;
    if (!list2) return list1;
    if (list1->val <= list2->val) {
        list1->next = mergeTwoLists(list1->next, list2);
        return list1;
    }
    list2->next = mergeTwoLists(list1, list2->next);
    return list2;
}`,
        cpp: `ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
    if (!list1) return list2;
    if (!list2) return list1;
    if (list1->val <= list2->val) {
        list1->next = mergeTwoLists(list1->next, list2);
        return list1;
    }
    list2->next = mergeTwoLists(list1, list2->next);
    return list2;
}`,
        java: `ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    if (list1 == null) return list2;
    if (list2 == null) return list1;
    if (list1.val <= list2.val) {
        list1.next = mergeTwoLists(list1.next, list2);
        return list1;
    }
    list2.next = mergeTwoLists(list1, list2.next);
    return list2;
}`,
        javascript: `function mergeTwoLists(list1, list2) {
  if (!list1) return list2;
  if (!list2) return list1;
  if (list1.val <= list2.val) {
    list1.next = mergeTwoLists(list1.next, list2);
    return list1;
  }
  list2.next = mergeTwoLists(list1, list2.next);
  return list2;
}`,
      },
    },
  ],
  pitfalls: [
    '迴圈結束後忘了接上剩下的那一段:結果會少掉後面的節點',
    '沒有 dummy 時,要先判斷「結果的第一個是誰」,程式會多一大段 if',
    '忘了 `tail = tail.next`:每次都覆蓋同一個位置',
    '其中一條是空串列:迭代版直接接上另一條;遞迴版第一行就回傳',
  ],
  followUp: [
    { q: '合併 k 條排好的串列?', a: '[23. Merge k Sorted Lists](#/q/23):用最小堆每次取 k 個頭裡最小的,O(N log k);或兩兩合併(分治),也是 O(N log k)。' },
  ],
  check: {
    kind: 'fn',
    fn: 'mergeTwoLists',
    argKinds: ['list', 'list'],
    ret: 'list',
    cases: [
      { args: [[1, 2, 4], [1, 3, 4]], out: [1, 1, 2, 3, 4, 4] },
      { args: [[], []], out: [] },
      { args: [[], [0]], out: [0] },
      { args: [A, B], out: [1, 1, 2, 3, 4, 5, 8] },
      { args: [[5], [1, 2, 3]], out: [1, 2, 3, 5] },
    ],
  },
}

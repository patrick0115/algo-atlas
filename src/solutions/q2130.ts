import { arr } from '../engine/helpers'
import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 2130. Maximum Twin Sum of a Linked List

const L = [5, 4, 2, 1]

function arrFig(): FigStep[] {
  const n = L.length
  const sums = Array.from({ length: n / 2 }, (_, i) => L[i] + L[n - 1 - i])
  return [
    { note: '串列不能從後面往前走,先把值抄進陣列,就能用索引直接拿到「雙胞胎」:第 i 個和第 n−1−i 個', views: [chain(L), arr(L, { label: '抄進陣列' })] },
    ...sums.map((s, i) => ({ note: `第 ${i} 對:${L[i]} + ${L[n - 1 - i]} = ${s}`, views: [arr(L, { label: '陣列', highlight: [i, n - 1 - i] })] })),
    { note: `最大是 ${Math.max(...sums)}`, views: [arr(sums, { label: '每一對的和', done: [sums.indexOf(Math.max(...sums))] })] },
  ]
}

function revFig(): FigStep[] {
  const n = L.length
  const half = L.slice(n / 2).reverse()
  return [
    { note: '不想多開陣列:快慢指標找到中點(快的一次走兩步,慢的走一步,快的到底時慢的在後半段開頭)', views: [chain(L, { cls: { [n / 2]: 'hl' }, subs: { [n / 2]: 'slow' }, label: 'slow 停在後半段開頭' })] },
    { note: '把後半段原地反轉。這樣前半段的第 i 個,和反轉後後半段的第 i 個,剛好是一對雙胞胎', views: [chain(L.slice(0, n / 2), { label: '前半段' }), chain(half, { label: '後半段(反轉後)' })] },
    { note: `兩條同時往前走、一路相加:${L.slice(0, n / 2).map((v, i) => `${v} + ${half[i]} = ${v + half[i]}`).join(';')} → 最大 ${Math.max(...L.slice(0, n / 2).map((v, i) => v + half[i]))}`, views: [chain(L.slice(0, n / 2), { cls: { 0: 'hl' }, label: '前半段' }), chain(half, { cls: { 0: 'hl' }, label: '後半段(反轉後)' })] },
  ]
}

export const q2130: Solution = {
  id: 2130,
  plain: '一排偶數個人手牽手(只能從頭往後走),頭尾兩個人是一對「雙胞胎」,第二個和倒數第二個也是一對……每對把手上的數字加起來,最大的和是多少?',
  statement: '長度為偶數 n 的串列中,第 i 個節點(0 起算)與第 n−1−i 個節點互為**雙胞胎**。雙胞胎和 = 兩者的值相加。回傳最大的雙胞胎和。',
  examples: [
    { input: 'head = [5,4,2,1]', output: '6', note: '5+1 = 6,4+2 = 6' },
    { input: 'head = [4,2,2,3]', output: '7' },
    { input: 'head = [1,100000]', output: '100001' },
  ],
  constraints: ['n 是偶數,2 ≤ n ≤ 10⁵', '節點值 1 ~ 10⁵'],
  insight: ['串列只能往後走,拿不到「倒數第 i 個」', '簡單作法:抄進陣列,用索引配對', '省空間:找中點 → 反轉後半段 → 兩條一起走([143. Reorder List](#/q/143) 的前兩步)'],
  approaches: [
    {
      name: '抄進陣列',
      idea: '把值依序放進陣列,`max(a[i] + a[n−1−i])`。',
      steps: ['走過串列,把值放進 `a`', '`for i in 0..n/2−1`:`best = max(best, a[i] + a[n−1−i])`'],
      figure: { title: `head = [${L}]`, steps: arrFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '陣列存 n 個值。' },
      verdict: '最好寫,面試先講這個。',
      code: {
        python: `def pairSum(head):
    a = []
    while head:
        a.append(head.val)
        head = head.next
    n = len(a)
    return max(a[i] + a[n - 1 - i] for i in range(n // 2))`,
        c: `int pairSum(struct ListNode *head) {
    int n = 0;
    for (struct ListNode *p = head; p; p = p->next) n++;
    int *a = malloc(n * sizeof(int)), k = 0, best = 0;
    for (struct ListNode *p = head; p; p = p->next) a[k++] = p->val;
    for (int i = 0; i < n / 2; i++)
        if (a[i] + a[n - 1 - i] > best) best = a[i] + a[n - 1 - i];
    free(a);
    return best;
}`,
        cpp: `int pairSum(ListNode* head) {
    vector<int> a;
    for (; head; head = head->next) a.push_back(head->val);
    int n = a.size(), best = 0;
    for (int i = 0; i < n / 2; i++) best = max(best, a[i] + a[n - 1 - i]);
    return best;
}`,
        java: `int pairSum(ListNode head) {
    List<Integer> a = new ArrayList<>();
    for (; head != null; head = head.next) a.add(head.val);
    int n = a.size(), best = 0;
    for (int i = 0; i < n / 2; i++) best = Math.max(best, a.get(i) + a.get(n - 1 - i));
    return best;
}`,
        javascript: `function pairSum(head) {
  const a = [];
  for (; head; head = head.next) a.push(head.val);
  let best = 0;
  for (let i = 0, n = a.length; i < n / 2; i++) best = Math.max(best, a[i] + a[n - 1 - i]);
  return best;
}`,
      },
    },
    {
      name: '快慢指標 + 反轉後半段',
      idea: '快慢指標找到後半段開頭,原地反轉後半段,再和前半段一起往前走、相加。',
      steps: ['`slow = fast = head`;`while fast`:`slow = slow.next`、`fast = fast.next.next`', '反轉以 slow 開頭的後半段 → `prev`', '`a = head`、`b = prev` 一起走,`best = max(best, a.val + b.val)`'],
      figure: { title: `head = [${L}]`, steps: revFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '找中點、反轉、配對各走一次;只用幾個指標。' },
      verdict: '最推薦(O(1) 空間)。[[p:fast-slow]]找中點 + [206](#/q/206) 反轉串列的組合技,[234](#/q/234) 回文串列也是這一套。',
      code: {
        python: `def pairSum(head):
    slow = fast = head
    while fast:                               # n 是偶數,fast 會剛好走到 None
        slow = slow.next
        fast = fast.next.next
    prev = None
    while slow:                               # 反轉後半段
        slow.next, prev, slow = prev, slow, slow.next
    best = 0
    while prev:                               # 前半段和反轉後的後半段一起走
        best = max(best, head.val + prev.val)
        head, prev = head.next, prev.next
    return best`,
        c: `int pairSum(struct ListNode *head) {
    struct ListNode *slow = head, *fast = head, *prev = NULL;
    while (fast) { slow = slow->next; fast = fast->next->next; }
    while (slow) {
        struct ListNode *nx = slow->next;
        slow->next = prev; prev = slow; slow = nx;
    }
    int best = 0;
    for (; prev; prev = prev->next, head = head->next)
        if (head->val + prev->val > best) best = head->val + prev->val;
    return best;
}`,
        cpp: `int pairSum(ListNode* head) {
    ListNode *slow = head, *fast = head, *prev = nullptr;
    while (fast) { slow = slow->next; fast = fast->next->next; }
    while (slow) {
        ListNode *nx = slow->next;
        slow->next = prev; prev = slow; slow = nx;
    }
    int best = 0;
    for (; prev; prev = prev->next, head = head->next) best = max(best, head->val + prev->val);
    return best;
}`,
        java: `int pairSum(ListNode head) {
    ListNode slow = head, fast = head, prev = null;
    while (fast != null) { slow = slow.next; fast = fast.next.next; }
    while (slow != null) {
        ListNode nx = slow.next;
        slow.next = prev; prev = slow; slow = nx;
    }
    int best = 0;
    for (; prev != null; prev = prev.next, head = head.next) best = Math.max(best, head.val + prev.val);
    return best;
}`,
        javascript: `function pairSum(head) {
  let slow = head, fast = head, prev = null;
  while (fast) {
    slow = slow.next;
    fast = fast.next.next;
  }
  while (slow) [slow.next, prev, slow] = [prev, slow, slow.next];
  let best = 0;
  for (; prev; prev = prev.next, head = head.next) best = Math.max(best, head.val + prev.val);
  return best;
}`,
      },
    },
  ],
  pitfalls: ['快慢指標的終止條件:n 是偶數時用 `while fast` 讓 slow 停在後半段開頭;寫成 `while fast.next` 會停在前半段結尾', '反轉時忘了先存 next,串列就斷了'],
  check: {
    kind: 'fn',
    fn: 'pairSum',
    argKinds: ['list'],
    cases: [
      { args: [L], out: 6 },
      { args: [[4, 2, 2, 3]], out: 7 },
      { args: [[1, 100000]], out: 100001 },
      { args: [[1, 9, 3, 8, 2, 7]], out: 11 },
    ],
  },
}

import { arr } from '../engine/helpers'
import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 234. Palindrome Linked List

const L = [1, 2, 3, 2, 1]

function revFig(): FigStep[] {
  return [
    { note: '回文 = 前半和「反過來的後半」一樣。串列不能從後面走,所以:① 快慢指標找中點', views: [chain(L, { cls: { 2: 'cur' }, subs: { 2: 'slow(中點)' } })] },
    { note: '② 把從中點開始的後半段原地反轉:3 → 2 → 1 變成 1 → 2 → 3', views: [chain([1, 2], { label: '前半' }), chain([1, 2, 3], { label: '後半(反轉後)' })] },
    { note: '③ 兩條同時往前比:1 = 1、2 = 2,最後中點 3 和自己比,一定相同 → 是回文', views: [chain([1, 2], { label: '前半', cls: { 0: 'done', 1: 'done' } }), chain([1, 2, 3], { label: '後半', cls: { 0: 'done', 1: 'done' } })] },
    { note: '(好習慣:比完再把後半反轉回來,恢復原本的串列)', views: [chain(L, { tail: true })] },
  ]
}

function arrFig(): FigStep[] {
  return [
    { note: '簡單版:把值抄進陣列,再用左右雙指標檢查是不是回文', views: [arr(L, { label: '值', pointers: [{ name: 'l', index: 0 }, { name: 'r', index: 4, color: 'b' }] })] },
    { note: '1 = 1、2 = 2、到中間 → true。O(n) 空間', views: [arr(L, { label: '值', done: [0, 1, 3, 4] })] },
  ]
}

export const q0234: Solution = {
  id: 234,
  plain: '一條串列從頭讀到尾、和從尾讀到頭是不是一樣?例如 1 → 2 → 2 → 1 是,1 → 2 不是。',
  statement: '給單向串列的頭 `head`,判斷它是否為**回文**。Follow-up:O(n) 時間、O(1) 空間。',
  examples: [
    { input: 'head = [1,2,2,1]', output: 'true' },
    { input: 'head = [1,2]', output: 'false' },
  ],
  constraints: ['節點數 ≤ 10⁵', '值 0 ~ 9'],
  insight: ['回文檢查需要「從兩端往中間比」,但串列只能往後走', '簡單:抄進陣列', 'O(1) 空間:找中點([876](#/q/876))→ 反轉後半([206](#/q/206))→ 兩條一起比'],
  approaches: [
    {
      name: '找中點 + 反轉後半段',
      idea: '快慢指標找到中點,反轉後半段,從兩個頭同時往後比。',
      steps: ['`slow = fast = head`;`while fast and fast.next`:各走一步 / 兩步', '反轉 slow 開始的後半段 → `second`', '`p1 = head`、`p2 = second`;`while p2`:值不同 → false', '回傳 true(可再把後半反轉回來)'],
      figure: { title: `head = [${L}]`, steps: revFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '找中點、反轉、比較各一遍。' },
      verdict: '最推薦(Follow-up 的答案)。串列題的三個零件組合在一起:快慢指標、反轉、雙指標比較。',
      code: {
        python: `def isPalindrome(head):
    slow = fast = head
    while fast and fast.next:                 # 找中點
        slow, fast = slow.next, fast.next.next
    prev = None
    while slow:                               # 反轉後半段
        slow.next, prev, slow = prev, slow, slow.next
    p1, p2 = head, prev
    while p2:                                 # 後半比較短(或一樣長),以它為準
        if p1.val != p2.val:
            return False
        p1, p2 = p1.next, p2.next
    return True`,
        c: `bool isPalindrome(struct ListNode *head) {
    struct ListNode *slow = head, *fast = head, *prev = NULL;
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
    while (slow) {
        struct ListNode *nx = slow->next;
        slow->next = prev; prev = slow; slow = nx;
    }
    for (struct ListNode *p1 = head, *p2 = prev; p2; p1 = p1->next, p2 = p2->next)
        if (p1->val != p2->val) return false;
    return true;
}`,
        cpp: `bool isPalindrome(ListNode* head) {
    ListNode *slow = head, *fast = head, *prev = nullptr;
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
    while (slow) {
        ListNode *nx = slow->next;
        slow->next = prev; prev = slow; slow = nx;
    }
    for (ListNode *p1 = head, *p2 = prev; p2; p1 = p1->next, p2 = p2->next)
        if (p1->val != p2->val) return false;
    return true;
}`,
        java: `boolean isPalindrome(ListNode head) {
    ListNode slow = head, fast = head, prev = null;
    while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
    while (slow != null) {
        ListNode nx = slow.next;
        slow.next = prev; prev = slow; slow = nx;
    }
    for (ListNode p1 = head, p2 = prev; p2 != null; p1 = p1.next, p2 = p2.next)
        if (p1.val != p2.val) return false;
    return true;
}`,
        javascript: `function isPalindrome(head) {
  let slow = head, fast = head, prev = null;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  while (slow) [slow.next, prev, slow] = [prev, slow, slow.next];
  for (let p1 = head, p2 = prev; p2; p1 = p1.next, p2 = p2.next) if (p1.val !== p2.val) return false;
  return true;
}`,
      },
    },
    {
      name: '抄進陣列 + 雙指標',
      idea: '值放進陣列,`l`、`r` 從兩端往中間比。',
      steps: ['走一遍收集值', '`l, r = 0, n − 1`;`while l < r`:不同 → false', '回傳 true'],
      figure: { title: `head = [${L}]`, steps: arrFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '多一個陣列。' },
      verdict: '最好寫,但不符合 O(1) 空間。',
      code: {
        python: `def isPalindrome(head):
    vals = []
    while head:
        vals.append(head.val)
        head = head.next
    return vals == vals[::-1]`,
        c: `bool isPalindrome(struct ListNode *head) {
    int n = 0;
    for (struct ListNode *p = head; p; p = p->next) n++;
    int *v = malloc(n * sizeof(int)), k = 0;
    for (struct ListNode *p = head; p; p = p->next) v[k++] = p->val;
    bool ok = true;
    for (int l = 0, r = n - 1; l < r && ok; l++, r--) if (v[l] != v[r]) ok = false;
    free(v);
    return ok;
}`,
        cpp: `bool isPalindrome(ListNode* head) {
    vector<int> v;
    for (; head; head = head->next) v.push_back(head->val);
    for (int l = 0, r = v.size() - 1; l < r; l++, r--) if (v[l] != v[r]) return false;
    return true;
}`,
        java: `boolean isPalindrome(ListNode head) {
    List<Integer> v = new ArrayList<>();
    for (; head != null; head = head.next) v.add(head.val);
    for (int l = 0, r = v.size() - 1; l < r; l++, r--) if (!v.get(l).equals(v.get(r))) return false;
    return true;
}`,
        javascript: `function isPalindrome(head) {
  const v = [];
  for (; head; head = head.next) v.push(head.val);
  for (let l = 0, r = v.length - 1; l < r; l++, r--) if (v[l] !== v[r]) return false;
  return true;
}`,
      },
    },
  ],
  pitfalls: ['比較時以前半段的長度為準:偶數長度時前半仍連著中點,比後半多一個節點,會走到 p2 = null 而出錯;要以後半為準', 'Java 用 `==` 比較兩個 Integer:超過 127 會出錯'],
  check: {
    kind: 'fn',
    fn: 'isPalindrome',
    argKinds: ['list'],
    cases: [
      { args: [[1, 2, 2, 1]], out: true },
      { args: [[1, 2]], out: false },
      { args: [L], out: true },
      { args: [[1]], out: true },
      { args: [[1, 2, 3, 1]], out: false },
    ],
  },
}

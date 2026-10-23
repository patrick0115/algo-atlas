import type { Solution } from './types'
import { loopChain } from './fig'

// 142. Linked List Cycle II
const V = [3, 2, 0, -4]
const WRAP = {
  python: `\ndef cycleEntryIndex(head):
    entry = detectCycle(head)
    if entry is None:  # 一旦指針相遇，就能進入尋找入口的階段。
        return -1
    i = 0
    while head is not entry:  # 沿 next 前進，觀察是否重遇同一個節點。
        head, i = (head.next, i + 1)
    return i`,
  c: `\nint cycleEntryIndex(struct ListNode *head) {
    struct ListNode *entry = detectCycle(head);
    if (!entry)
        return - 1;
    int i = 0;
    while (head != entry) {
        head = head->next;
        i++;
    }
    return i;
}`,
  cpp: `\nint cycleEntryIndex(ListNode *head) {
    ListNode *entry = detectCycle(head);
    if (!entry)
        return - 1;
    int i = 0;
    while (head != entry) {
        head = head->next;
        i++;
    }
    return i;
}`,
  java: `\nint cycleEntryIndex(ListNode head) {
    ListNode entry = detectCycle(head);
    if (entry == null)
        return - 1;
    int i = 0;
    while (head != entry) {
        head = head.next;
        i++;
    }
    return i;
}`,
  javascript: `\nfunction cycleEntryIndex(head) {
    const entry = detectCycle(head);
    if (!entry)
        return - 1;
    let i = 0;
    while (head !== entry) {
        head = head.next;
        i++;
    }
    return i;
}`,
}
const fig = [
  { note: '從 head=3 出發，依序經過 2、0、−4；尾端的 next 指回 2，所以走訪不會到 null。', views: [loopChain(V, 1, { subs: { 0: 'head' }, cls: { 0: 'hl', 1: 'visited' } })] },
  { note: '尾巴接回第 1 個節點。沿 next 走會再次到 2；入口是節點本身，不是數值相同就算。', views: [loopChain(V, 1, { cls: { 1: 'hl' } })] },
  { note: '快指針每次兩步、慢指針每次一步，兩者在環內相遇。', views: [loopChain(V, 1, { subs: { 0: 'head', 3: '相遇' }, cls: { 3: 'hl' } })] },
  { note: '相遇後把慢指針放回 3，快指針留在 −4；兩者改成每次各走一步。', views: [loopChain(V, 1, { subs: { 0: '慢', 3: '快' }, cls: { 0: 'hl', 3: 'visited' } })] },
  { note: '把一個指針放回 head；兩個都每次一步，再相遇處就是入口 2。', views: [loopChain(V, 1, { subs: { 1: '入口' }, cls: { 1: 'hl' } })] },
]

export const q0142: Solution = {
  id: 142,
  plain: '鏈結串列如果繞成圈，找出第一次進入圈的那個節點；沒有圈就回傳空。',
  statement: '給 head，回傳環的入口節點；無環回傳 null。測資裡的 pos 只描述尾端接到哪裡，不是函式參數。',
  examples: [{ input: 'head = [3,2,0,-4], pos = 1', output: '值為 2 的入口節點' }, { input: 'head = [1,2], pos = 0', output: '值為 1 的入口節點' }, { input: 'head = [1], pos = -1', output: 'null' }],
  constraints: ['0 ≤ 節點數 ≤ 10⁴。', '進階：O(1) 額外空間。'],
  insight: ['走過的節點若再次出現，它就是環入口。', '要省空間可用 [141](#/q/141) 的快慢指針先找到環內相遇點。', '設入口前長 a、入口到相遇點長 b、環長 c；相遇時快慢路程差是 c 的倍數，所以從 head 與相遇點同步出發，會在入口碰面。'],
  approaches: [
    { name: 'Set 記錄節點', idea: '沿 next 走；第一個重複造訪的節點就是入口。', steps: ['建立空 set。記錄目前指針狀態，才能判斷是否走進環中。', '逐節點檢查是否看過；若是，直接回傳該節點。若再次遇到同一節點，或快慢指針相遇，就已證明有環。', '走到 null 則無環。最後確認返回的是入口節點本身；沒有環時才返回空值。'], figure: { title: 'head = [3,2,0,-4], pos = 1', steps: [fig[0], { note: '把 3、2、0、−4 依序加入 set；每個節點第一次到訪時都還不重複。', views: [loopChain(V, 1, { cls: { 0: 'visited', 1: 'visited', 2: 'visited', 3: 'visited' } })] }, { note: '下一步又走到節點 2，它已在 set 中，因此回傳這個節點。', views: [loopChain(V, 1, { cls: { 1: 'hl' } })] }] }, complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點最多放入 set 一次。' }, verdict: '直觀；set 裡要存節點身分，而非節點值。', code: {
      python: `def detectCycle(head):
    seen = set()
    while head:  # 沿 next 前進，觀察是否重遇同一個節點。
        if head in seen:  # 一旦指針相遇，就能進入尋找入口的階段。
            return head
        seen.add(head)
        head = head.next
    return None${WRAP.python}`,
      c: `struct ListNode *detectCycle(struct ListNode *head) {
    const int cap = 32768;
    struct ListNode **seen = calloc(cap, sizeof(*seen));
    while (head) {
        unsigned long long bits = (unsigned long long)(size_t)head;
        int i = (int)((bits >> 3) * 11400714819323198485ull & (cap - 1));
        while (seen[i] && seen[i] != head)
            i = (i + 1) & (cap - 1);
        if (seen[i]) {
            free(seen);
            return head;
        }
        seen[i] = head;
        head = head->next;
    }
    free(seen);
    return NULL;
}${WRAP.c}`,
      cpp: `ListNode *detectCycle(ListNode *head) {
    unordered_set<ListNode*> seen;
    while (head) {
        if (!seen.insert(head).second)
            return head;
        head = head->next;
    }
    return nullptr;
}${WRAP.cpp}`,
      java: `ListNode detectCycle(ListNode head) {
    Set<ListNode> seen = new HashSet<>();
    while (head != null) {
        if (!seen.add(head))
            return head;
        head = head.next;
    }
    return null;
}${WRAP.java}`,
      javascript: `function detectCycle(head) {
    const seen = new Set();
    while (head) {
        if (seen.has(head))
            return head;
        seen.add(head);
        head = head.next;
    }
    return null;
}${WRAP.javascript}`,
    } },
    { name: 'Floyd 快慢指針', idea: '相遇後，一個指針從頭、一個從相遇點同步走，重逢處就是入口。', steps: ['slow、fast 從 head 出發，分別走一步與兩步。記錄目前指針狀態，才能判斷是否走進環中。', 'fast 走到 null 則無環；相遇則進入第二階段。若再次遇到同一節點，或快慢指針相遇，就已證明有環。', 'slow 放回 head；兩者各走一步直到相同，回傳該節點。最後確認返回的是入口節點本身；沒有環時才返回空值。'], figure: { title: 'head = [3,2,0,-4], pos = 1', steps: fig }, complexity: { time: 'O(n)', space: 'O(1)', why: '兩階段都只走線性步數；僅用兩個指針。' }, verdict: '符合空間進階要求。', code: {
      python: `def detectCycle(head):
    slow = fast = head
    while fast and fast.next:  # 沿 next 前進，觀察是否重遇同一個節點。
        slow, fast = (slow.next, fast.next.next)
        if slow is fast:  # 一旦指針相遇，就能進入尋找入口的階段。
            slow = head
            while slow is not fast:
                slow, fast = (slow.next, fast.next)
            return slow
    return None${WRAP.python}`,
      c: `struct ListNode *detectCycle(struct ListNode *head) {
    struct ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            slow = head;
            while (slow != fast) {
                slow = slow->next;
                fast = fast->next;
            }
            return slow;
        }
    }
    return NULL;
}${WRAP.c}`,
      cpp: `ListNode *detectCycle(ListNode *head) {
    auto slow = head, fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            slow = head;
            while (slow != fast) {
                slow = slow->next;
                fast = fast->next;
            }
            return slow;
        }
    }
    return nullptr;
}${WRAP.cpp}`,
      java: `ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            slow = head;
            while (slow != fast) {
                slow = slow.next;
                fast = fast.next;
            }
            return slow;
        }
    }
    return null;
}${WRAP.java}`,
      javascript: `function detectCycle(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) {
            slow = head;
            while (slow !== fast) {
                slow = slow.next;
                fast = fast.next;
            }
            return slow;
        }
    }
    return null;
}${WRAP.javascript}`,
    } },
  ],
  pitfalls: ['回傳節點本身，不能回傳值或索引。', '空串列與單節點無環要回傳 null。', 'fast.next 存在才可走 fast.next.next。'],
  check: { kind: 'fn', fn: 'cycleEntryIndex', argKinds: ['cycleList'], cases: [{ args: [[V, 1]], out: 1 }, { args: [[[1,2], 0]], out: 0 }, { args: [[[1], -1]], out: -1 }, { args: [[[1,1,1], 2]], out: 2 }] },
}

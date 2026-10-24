import { chain } from './fig'
import type { FigStep, Solution } from './types'

const L = [1, 2, 3, 3, 4, 4, 5]

function scanFig(): FigStep[] {
  return [
    { note: '加一個 dummy 指向原串列，prev 指向已確認保留區的尾端。排序讓相同值連在一起。', views: [chain(L, { label: '原串列', subs: { 0: 'prev.next' } })] },
    { note: '1、2 都只出現一次，prev 依序移到 1、2。', views: [chain(L, { cls: { 0: 'done', 1: 'done' }, subs: { 1: 'prev' } })] },
    { note: '從第一個 3 走到最後一個 3；整段重複，讓 prev.next 指向 4，兩個 3 都被跳過。', views: [chain(L, { cls: { 2: 'dim', 3: 'dim' }, edges: [[0, 1], [1, 4], [4, 5], [5, 6]] })] },
    { note: '4 也重複，整段跳過。5 只出現一次，結果是 1 → 2 → 5。', views: [chain([1, 2, 5], { cls: { 0: 'done', 1: 'done', 2: 'done' }, tail: true })] },
  ]
}

function recursiveFig(): FigStep[] {
  return [
    { note: '先看開頭 1，下一個是 2，沒有重複；保留 1，遞迴處理後面。', views: [chain(L, { cls: { 0: 'hl' } })] },
    { note: '2 也沒有重複，保留 2。到了 3，連續兩個都是 3，必須兩個都丟掉。', views: [chain(L, { cls: { 0: 'done', 1: 'done', 2: 'dim', 3: 'dim' } })] },
    { note: '從第一個不同值 4 重新遞迴；兩個 4 同樣整段丟掉。', views: [chain(L, { cls: { 2: 'dim', 3: 'dim', 4: 'dim', 5: 'dim' } })] },
    { note: '只剩 5，回傳它；上一層依序接回 2、1，得到 1 → 2 → 5。', views: [chain([1, 2, 5], { cls: { 0: 'done', 1: 'done', 2: 'done' }, tail: true })] },
  ]
}

export const q0082: Solution = {
  id: 82,
  plain: '排序串列裡，凡是出現不只一次的值，整組都刪掉；只留下原本就獨一無二的節點。',
  statement: '給已排序鏈結串列 head，刪除所有重複值的節點，回傳只含原本不重複值的排序串列。',
  examples: [
    { input: 'head = [1,2,3,3,4,4,5]', output: '[1,2,5]' },
    { input: 'head = [1,1,1,2,3]', output: '[2,3]' },
  ],
  constraints: ['`0 ≤ 節點數 ≤ 300`', '`−100 ≤ Node.val ≤ 100`', '串列已排序。'],
  insight: ['[83](#/q/83) 只留每種值的一個節點；本題要把出現多次的值**全部刪掉**。', '排序使同值形成連續一段；先找到這段的尾端，再決定整段跳過或留下。'],
  approaches: [
    {
      name: 'Dummy 節點與雙指標',
      idea: 'prev 指向結果尾端；cur 掃描同值的一段。若 cur 曾往後移，prev.next 直接跨過整段。',
      steps: ['建立 dummy，令 prev=dummy、cur=head。', '若 cur.next 值相同，就一直移動 cur 到重複段末尾。', '有重複則 prev.next=cur.next；否則 prev 往前一格。', 'cur 往前，最後回傳 dummy.next。'],
      figure: { title: 'head = [1,2,3,3,4,4,5]', steps: scanFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個節點最多走過一次，只使用固定數量的指標。' },
      verdict: '不怕開頭整段被刪掉，dummy 統一處理頭節點。',
      code: {
        python: `def deleteDuplicates(head):
    dummy = ListNode(0, head)
    prev = dummy
    while head:
        if head.next and head.val == head.next.val:
            value = head.val
            while head and head.val == value:
                head = head.next  # 整段同值都跳過
            prev.next = head
        else:
            prev = head  # 這個值只出現一次
            head = head.next
    return dummy.next`,
        c: `struct ListNode *deleteDuplicates(struct ListNode *head) {
    struct ListNode dummy = {0, head};
    struct ListNode *prev = &dummy;
    while (head) {
        if (head->next && head->val == head->next->val) {
            int value = head->val;
            while (head && head->val == value) {
                head = head->next;
            }
            prev->next = head;
        } else {
            prev = head;
            head = head->next;
        }
    }
    return dummy.next;
}`,
        cpp: `ListNode* deleteDuplicates(ListNode* head) {
    ListNode dummy(0, head);
    ListNode* prev = &dummy;
    while (head) {
        if (head->next && head->val == head->next->val) {
            int value = head->val;
            while (head && head->val == value) {
                head = head->next;
            }
            prev->next = head;
        } else {
            prev = head;
            head = head->next;
        }
    }
    return dummy.next;
}`,
        java: `ListNode deleteDuplicates(ListNode head) {
    ListNode dummy = new ListNode(0, head);
    ListNode prev = dummy;
    while (head != null) {
        if (head.next != null && head.val == head.next.val) {
            int value = head.val;
            while (head != null && head.val == value) {
                head = head.next;
            }
            prev.next = head;
        } else {
            prev = head;
            head = head.next;
        }
    }
    return dummy.next;
}`,
        javascript: `function deleteDuplicates(head) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (head) {
    if (head.next && head.val === head.next.val) {
      const value = head.val;
      while (head && head.val === value) {
        head = head.next;
      }
      prev.next = head;
    } else {
      prev = head;
      head = head.next;
    }
  }
  return dummy.next;
}`,
      },
    },
    {
      name: '遞迴處理剩下的串列',
      idea: '若開頭值重複，跳到下一個不同值再遞迴；否則保留 head，讓 head.next 接遞迴結果。',
      steps: ['空串列直接回傳。', '開頭兩個相同時，找到這段後面的第一個不同值。', '遞迴處理剩下部分，直接回傳它。', '開頭唯一時，接上遞迴結果並回傳 head。'],
      figure: { title: 'head = [1,2,3,3,4,4,5]', steps: recursiveFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每段只看一次；遞迴深度最壞等於節點數。' },
      verdict: '邏輯貼近「保留或丟掉整段」，但長串列會增加呼叫堆疊。',
      code: {
        python: `def deleteDuplicates(head):
    if not head:
        return None
    if head.next and head.val == head.next.val:
        value = head.val
        while head and head.val == value:
            head = head.next  # 刪掉整段，不保留其中一個
        return deleteDuplicates(head)
    head.next = deleteDuplicates(head.next)
    return head`,
        c: `struct ListNode *deleteDuplicates(struct ListNode *head) {
    if (!head) {
        return NULL;
    }
    if (head->next && head->val == head->next->val) {
        int value = head->val;
        while (head && head->val == value) {
            head = head->next;
        }
        return deleteDuplicates(head);
    }
    head->next = deleteDuplicates(head->next);
    return head;
}`,
        cpp: `ListNode* deleteDuplicates(ListNode* head) {
    if (!head) {
        return nullptr;
    }
    if (head->next && head->val == head->next->val) {
        int value = head->val;
        while (head && head->val == value) {
            head = head->next;
        }
        return deleteDuplicates(head);
    }
    head->next = deleteDuplicates(head->next);
    return head;
}`,
        java: `ListNode deleteDuplicates(ListNode head) {
    if (head == null) {
        return null;
    }
    if (head.next != null && head.val == head.next.val) {
        int value = head.val;
        while (head != null && head.val == value) {
            head = head.next;
        }
        return deleteDuplicates(head);
    }
    head.next = deleteDuplicates(head.next);
    return head;
}`,
        javascript: `function deleteDuplicates(head) {
  if (!head) {
    return null;
  }
  if (head.next && head.val === head.next.val) {
    const value = head.val;
    while (head && head.val === value) {
      head = head.next;
    }
    return deleteDuplicates(head);
  }
  head.next = deleteDuplicates(head.next);
  return head;
}`,
      },
    },
  ],
  pitfalls: ['刪除的是所有重複值節點，不是每種值只留一個。', '整段刪除後 prev 不要移動，下一段可能也要刪。'],
  check: { kind: 'fn', fn: 'deleteDuplicates', argKinds: ['list'], ret: 'list', cases: [{ args: [L], out: [1, 2, 5] }, { args: [[1, 1, 1, 2, 3]], out: [2, 3] }, { args: [[1, 1]], out: [] }, { args: [[]], out: [] }] },
}

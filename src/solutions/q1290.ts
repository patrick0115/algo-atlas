import { arr } from '../engine/helpers'
import { chain } from './fig'
import type { FigStep, Solution } from './types'

function shiftFig(): FigStep[] {
  return [
    { note: '串列 [1,0,1] 表示二進位 101。從最左位開始，答案先設成 0。', views: [chain([1, 0, 1], { cls: { 0: 'hl' } }), arr([0], { label: '目前值' })] },
    { note: '讀到 1：0 × 2 + 1 = 1。', views: [chain([1, 0, 1], { cls: { 0: 'done', 1: 'hl' } }), arr([1], { label: '目前值' })] },
    { note: '讀到 0：1 × 2 + 0 = 2，相當於把二進位的 1 變成 10。', views: [chain([1, 0, 1], { cls: { 0: 'done', 1: 'done', 2: 'hl' } }), arr([2], { label: '目前值' })] },
    { note: '讀到最後的 1：2 × 2 + 1 = 5，所以回傳 5。', views: [chain([1, 0, 1], { cls: { 0: 'done', 1: 'done', 2: 'done' } }), arr([5], { label: '答案', done: [0] })] },
  ]
}

function weightFig(): FigStep[] {
  return [
    { note: '先走一次串列，知道 [1,0,1] 有三個位元。', views: [chain([1, 0, 1]), arr([3], { label: '長度' })] },
    { note: '最左邊的 1 權重是 2² = 4，先加進答案。', views: [chain([1, 0, 1], { cls: { 0: 'hl' } }), arr([4], { label: '目前值' })] },
    { note: '中間的 0 權重是 2¹ = 2，但位元為 0，不增加答案。', views: [chain([1, 0, 1], { cls: { 1: 'hl' } }), arr([4], { label: '目前值' })] },
    { note: '最後的 1 權重是 2⁰ = 1，4 + 1 = 5。', views: [chain([1, 0, 1], { cls: { 2: 'hl' } }), arr([5], { label: '答案', done: [0] })] },
  ]
}

export const q1290: Solution = {
  id: 1290,
  plain: '鏈結串列依序存了二進位的每一位；把它換算成平常使用的十進位整數。',
  statement: '給一條只含 0 與 1 的非空鏈結串列，頭節點是最高位。回傳它代表的十進位數。',
  examples: [
    { input: 'head = [1,0,1]', output: '5', note: '二進位 101 = 十進位 5。' },
    { input: 'head = [0]', output: '0' },
  ],
  constraints: ['節點數 1 到 30，節點值只能是 0 或 1。'],
  insight: ['十進位讀下一位時會將原數乘 10；二進位則乘 2 再加新位元。', '也可以先算長度，依照每個位元的位置加上 2 的冪次。'],
  approaches: [
    {
      name: '邊讀邊左移',
      idea: '每讀一位，把已有數值乘 2，再加上這位的 0 或 1。',
      steps: ['答案從 0 開始。', '從頭到尾走訪，每次更新 answer = answer × 2 + node.val。', '走完就回傳答案。'],
      figure: { title: 'head = [1,0,1]', steps: shiftFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '走訪串列一次，只保留一個整數。' },
      verdict: '簡潔且不用先知道串列長度。',
      code: {
        python: `def getDecimalValue(head):
    value = 0
    while head:
        value = value * 2 + head.val  # 舊位元左移，再接新位元
        head = head.next
    return value`,
        c: `int getDecimalValue(struct ListNode *head) {
    int value = 0;
    while (head != NULL) {
        value = value * 2 + head->val;
        head = head->next;
    }
    return value;
}`,
        cpp: `int getDecimalValue(ListNode *head) {
    int value = 0;
    while (head != nullptr) {
        value = value * 2 + head->val;
        head = head->next;
    }
    return value;
}`,
        java: `int getDecimalValue(ListNode head) {
    int value = 0;
    while (head != null) {
        value = value * 2 + head.val;
        head = head.next;
    }
    return value;
}`,
        javascript: `function getDecimalValue(head) {
  let value = 0;
  while (head !== null) {
    value = value * 2 + head.val;
    head = head.next;
  }
  return value;
}`,
      },
    },
    {
      name: '依位元權重相加',
      idea: '先知道總位數 n，再把每個 1 的權重 2^(剩餘位數) 加進答案。',
      steps: ['走一次串列取得長度。', '再走一次：從最高位的 2^(n−1) 開始。', '遇到 1 就加上目前權重，每往下一位就將權重除以 2。'],
      figure: { title: '101 = 4 + 0 + 1', steps: weightFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '走兩次串列，但不另存節點。' },
      verdict: '可以直接看出各位元的數學權重。',
      code: {
        python: `def getDecimalValue(head):
    length = 0
    node = head
    while node:
        length += 1
        node = node.next
    weight = 1 << (length - 1)  # 最高位的權重
    value = 0
    while head:
        if head.val == 1:
            value += weight
        weight //= 2
        head = head.next
    return value`,
        c: `int getDecimalValue(struct ListNode *head) {
    int length = 0;
    for (struct ListNode *node = head; node != NULL; node = node->next) {
        length++;
    }
    int weight = 1 << (length - 1);
    int value = 0;
    while (head != NULL) {
        if (head->val == 1) {
            value += weight;
        }
        weight /= 2;
        head = head->next;
    }
    return value;
}`,
        cpp: `int getDecimalValue(ListNode *head) {
    int length = 0;
    for (ListNode *node = head; node != nullptr; node = node->next) {
        length++;
    }
    int weight = 1 << (length - 1);
    int value = 0;
    while (head != nullptr) {
        if (head->val == 1) {
            value += weight;
        }
        weight /= 2;
        head = head->next;
    }
    return value;
}`,
        java: `int getDecimalValue(ListNode head) {
    int length = 0;
    for (ListNode node = head; node != null; node = node.next) {
        length++;
    }
    int weight = 1 << (length - 1);
    int value = 0;
    while (head != null) {
        if (head.val == 1) {
            value += weight;
        }
        weight /= 2;
        head = head.next;
    }
    return value;
}`,
        javascript: `function getDecimalValue(head) {
  let length = 0;
  for (let node = head; node !== null; node = node.next) {
    length++;
  }
  let weight = 2 ** (length - 1);
  let value = 0;
  while (head !== null) {
    if (head.val === 1) {
      value += weight;
    }
    weight /= 2;
    head = head.next;
  }
  return value;
}`,
      },
    },
  ],
  pitfalls: ['頭節點是最高位，不可由尾端往前解讀。', '前導 0 合法，不影響結果。'],
  check: {
    kind: 'fn',
    fn: 'getDecimalValue',
    argKinds: ['list'],
    cases: [
      { args: [[1, 0, 1]], out: 5 },
      { args: [[0]], out: 0 },
      { args: [[1, 1, 1, 1]], out: 15 },
    ],
  },
}

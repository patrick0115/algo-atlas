import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { chain } from './fig'

// 2. Add Two Numbers

const A = [2, 4, 9]
const B = [5, 6, 4, 9]

function iterFig(recursive: boolean): FigStep[] {
  const res: number[] = []
  let carry = 0
  const out: FigStep[] = [
    {
      note: `串列是**倒著存**的數字:[${A.join(',')}] 代表 ${[...A].reverse().join('')},[${B.join(',')}] 代表 ${[...B].reverse().join('')}。倒著存剛好方便:頭就是個位數,可以像直式加法一樣從個位開始加`,
      views: [chain(A, { label: 'l1', tail: true }), chain(B, { label: 'l2', tail: true })],
    },
  ]
  const n = Math.max(A.length, B.length)
  for (let i = 0; i < n || carry; i++) {
    const a = A[i] ?? 0
    const b = B[i] ?? 0
    const s = a + b + carry
    const note = `${recursive ? `第 ${i + 1} 層遞迴:` : ''}第 ${i} 位:${A[i] ?? '(沒了,當 0)'} + ${B[i] ?? '(沒了,當 0)'} + 進位 ${carry} = ${s} → 寫下 ${s % 10},進位 ${Math.floor(s / 10)}`
    carry = Math.floor(s / 10)
    res.push(s % 10)
    out.push({
      note,
      views: [
        chain(A, { label: 'l1', tail: true, cls: i < A.length ? { [i]: 'hl' } : {} }),
        chain(B, { label: 'l2', tail: true, cls: i < B.length ? { [i]: 'hl' } : {} }),
        chain(res, { label: '答案(一位一位接上去)', cls: { [res.length - 1]: 'hl' } }),
      ],
    })
  }
  out.push({ note: `兩條都走完、也沒有進位了。答案 [${res.join(',')}] 代表 ${[...res].reverse().join('')} = ${[...A].reverse().join('')} + ${[...B].reverse().join('')}`, views: [chain(res, { label: '答案', tail: true })] })
  return out
}

export const q0002: Solution = {
  id: 2,
  plain: '兩個很長的數字,各自用鏈子一格一格倒著存(個位數在最前面)。請把它們加起來,答案也用同樣的方式存。其實就是小學的**直式加法**:從個位開始,每位相加,滿十進一。',
  statement:
    '兩個非空鏈結串列各代表一個非負整數,**數字是倒著存的**(頭節點是個位數),每個節點存一位數。把兩個數相加,用同樣的格式回傳結果。除了 0 本身,數字不會有前導 0。',
  examples: [
    { input: 'l1 = [2,4,3], l2 = [5,6,4]', output: '[7,0,8]', note: '342 + 465 = 807' },
    { input: 'l1 = [0], l2 = [0]', output: '[0]' },
    { input: 'l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]', output: '[8,9,9,9,0,0,0,1]', note: '最後還有一個進位,要多一個節點' },
  ],
  constraints: [
    '每條最多 100 個節點 → 數字最多 100 位,**遠超過 64 位元整數**,不能轉成整數再相加',
    '兩條長度可能不同 → 短的那條走完後當作 0',
  ],
  insight: [
    '把數字轉成整數相加再拆回來?100 位數連 `long long` 都放不下(Python 可以,但不是這題想考的)',
    '倒著存其實是在幫忙:頭是個位數,而加法本來就要從個位開始算 —— 一邊走兩條串列,一邊做直式加法',
    '每一位:`總和 = a + b + 進位`,這一位寫 `總和 % 10`,新的進位是 `總和 / 10`',
    '三種情況都要繼續:l1 還有、l2 還有、**或還有進位**。最後那個進位常被忘掉',
  ],
  approaches: [
    {
      name: '迭代:直式加法 + dummy 頭',
      idea: '同時走 l1、l2,每一位相加加上進位,做一個新節點接到答案尾巴。用一個 dummy(假的頭節點)讓「接第一個節點」和「接其他節點」寫法一樣。',
      steps: ['`dummy = Node(0)`、`tail = dummy`、`carry = 0`', '`while l1 or l2 or carry`', '`s = (l1 的值或 0) + (l2 的值或 0) + carry`', '`tail.next = Node(s % 10)`、`carry = s // 10`', 'l1、l2、tail 往前走;回傳 `dummy.next`'],
      figure: { title: `l1 = [${A.join(',')}], l2 = [${B.join(',')}]`, steps: iterFig(false) },
      complexity: { time: 'O(max(m, n))', space: 'O(1)', why: '每一位做一次;除了答案本身,只用幾個變數。' },
      verdict: '標準解。dummy 頭是鏈結串列題的萬用技巧:不用特別處理「答案目前是空的」這種情況([21. Merge Two Sorted Lists](#/q/21) 也用它)。',
      code: {
        python: `def addTwoNumbers(l1, l2):
    dummy = tail = ListNode(0)
    carry = 0
    while l1 or l2 or carry:              # 還有位數,或還有進位
        s = carry
        if l1:
            s += l1.val
            l1 = l1.next
        if l2:
            s += l2.val
            l2 = l2.next
        tail.next = ListNode(s % 10)      # 這一位
        tail = tail.next
        carry = s // 10                   # 進位
    return dummy.next`,
        c: `struct ListNode *addTwoNumbers(struct ListNode *l1, struct ListNode *l2) {
    struct ListNode dummy = {0, NULL}, *tail = &dummy;
    int carry = 0;
    while (l1 || l2 || carry) {
        int s = carry;
        if (l1) { s += l1->val; l1 = l1->next; }
        if (l2) { s += l2->val; l2 = l2->next; }
        tail->next = malloc(sizeof(struct ListNode));
        tail = tail->next;
        tail->val = s % 10;
        tail->next = NULL;
        carry = s / 10;
    }
    return dummy.next;
}`,
        cpp: `ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    ListNode dummy(0), *tail = &dummy;
    int carry = 0;
    while (l1 || l2 || carry) {
        int s = carry;
        if (l1) { s += l1->val; l1 = l1->next; }
        if (l2) { s += l2->val; l2 = l2->next; }
        tail->next = new ListNode(s % 10);
        tail = tail->next;
        carry = s / 10;
    }
    return dummy.next;
}`,
        java: `ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0), tail = dummy;
    int carry = 0;
    while (l1 != null || l2 != null || carry != 0) {
        int s = carry;
        if (l1 != null) { s += l1.val; l1 = l1.next; }
        if (l2 != null) { s += l2.val; l2 = l2.next; }
        tail.next = new ListNode(s % 10);
        tail = tail.next;
        carry = s / 10;
    }
    return dummy.next;
}`,
        javascript: `function addTwoNumbers(l1, l2) {
  const dummy = new ListNode(0);
  let tail = dummy, carry = 0;
  while (l1 || l2 || carry) {
    let s = carry;
    if (l1) { s += l1.val; l1 = l1.next; }
    if (l2) { s += l2.val; l2 = l2.next; }
    tail.next = new ListNode(s % 10);
    tail = tail.next;
    carry = Math.floor(s / 10);
  }
  return dummy.next;
}`,
      },
    },
    {
      name: '遞迴:每一層處理一位',
      idea: '`add(l1, l2, carry)` 算出這一位的節點,它的 `next` 交給 `add(l1.next, l2.next, 新進位)`。三個都沒了就回傳 null。',
      steps: ['`l1`、`l2` 都是 null 且 `carry == 0` → 回傳 null', '`s = (l1 值) + (l2 值) + carry`', '`node = Node(s % 10)`', '`node.next = add(l1.next, l2.next, s // 10)`', '回傳 `node`'],
      figure: { title: `l1 = [${A.join(',')}], l2 = [${B.join(',')}]`, steps: iterFig(true) },
      complexity: { time: 'O(max(m, n))', space: 'O(max(m, n))', why: '每一位一層遞迴,呼叫堆疊深度是位數。' },
      verdict: '寫法很對稱、很漂亮,但多用了遞迴堆疊的空間。長度只有 100,這題用遞迴完全沒問題。',
      code: {
        python: `def addTwoNumbers(l1, l2, carry=0):
    if not l1 and not l2 and not carry:
        return None
    s = carry + (l1.val if l1 else 0) + (l2.val if l2 else 0)
    node = ListNode(s % 10)
    node.next = addTwoNumbers(l1.next if l1 else None, l2.next if l2 else None, s // 10)
    return node`,
        c: `static struct ListNode *add(struct ListNode *a, struct ListNode *b, int carry) {
    if (!a && !b && !carry) return NULL;
    int s = carry + (a ? a->val : 0) + (b ? b->val : 0);
    struct ListNode *node = malloc(sizeof(struct ListNode));
    node->val = s % 10;
    node->next = add(a ? a->next : NULL, b ? b->next : NULL, s / 10);
    return node;
}

struct ListNode *addTwoNumbers(struct ListNode *l1, struct ListNode *l2) {
    return add(l1, l2, 0);
}`,
        cpp: `ListNode* addTwoNumbers(ListNode* l1, ListNode* l2, int carry = 0) {
    if (!l1 && !l2 && !carry) return nullptr;
    int s = carry + (l1 ? l1->val : 0) + (l2 ? l2->val : 0);
    ListNode* node = new ListNode(s % 10);
    node->next = addTwoNumbers(l1 ? l1->next : nullptr, l2 ? l2->next : nullptr, s / 10);
    return node;
}`,
        java: `ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    return add(l1, l2, 0);
}

private ListNode add(ListNode a, ListNode b, int carry) {
    if (a == null && b == null && carry == 0) return null;
    int s = carry + (a != null ? a.val : 0) + (b != null ? b.val : 0);
    ListNode node = new ListNode(s % 10);
    node.next = add(a != null ? a.next : null, b != null ? b.next : null, s / 10);
    return node;
}`,
        javascript: `function addTwoNumbers(l1, l2, carry = 0) {
  if (!l1 && !l2 && !carry) return null;
  const s = carry + (l1 ? l1.val : 0) + (l2 ? l2.val : 0);
  const node = new ListNode(s % 10);
  node.next = addTwoNumbers(l1 ? l1.next : null, l2 ? l2.next : null, Math.floor(s / 10));
  return node;
}`,
      },
    },
    {
      name: '轉成大整數再拆回來(只有 Python / Java 方便)',
      idea: '把兩條串列讀成整數(倒著讀)、相加,再把結果一位一位拆成串列。只有內建大整數的語言能這樣做。',
      steps: ['走 l1:`x += 值 × 10^位置`;l2 同理得到 `y`', '`s = x + y`', '`s` 一直取 `% 10` 做成節點、`//= 10`,直到 `s == 0`(至少做一個節點)'],
      figure: {
        title: `l1 = [${A.join(',')}], l2 = [${B.join(',')}]`,
        steps: [
          { note: `l1 讀成 ${[...A].reverse().join('')},l2 讀成 ${[...B].reverse().join('')}`, views: [chain(A, { label: 'l1', tail: true }), chain(B, { label: 'l2', tail: true })] },
          { note: `相加 = ${Number([...A].reverse().join('')) + Number([...B].reverse().join(''))}`, views: [arr([Number([...A].reverse().join('')) + Number([...B].reverse().join(''))], { label: '總和' })] },
          { note: '從個位開始一位一位拆出來,接成串列', views: [chain([...String(Number([...A].reverse().join('')) + Number([...B].reverse().join('')))].reverse().map(Number), { label: '答案', tail: true })] },
        ],
      },
      complexity: { time: 'O(max(m, n)²)', space: 'O(max(m, n))', why: '大整數的乘法和除法不是 O(1);100 位數時感覺不到,但理論上比直式加法慢。' },
      verdict: '能過,但完全跳過了這題要考的東西(進位處理)。C / C++ / JavaScript 沒有內建大整數(JS 有 BigInt),面試不要這樣寫。下面 C / C++ 的版本只是示範「必須自己做大數加法」。',
      code: {
        python: `def addTwoNumbers(l1, l2):
    def to_int(node):
        x, p = 0, 1
        while node:
            x += node.val * p
            p *= 10
            node = node.next
        return x

    s = to_int(l1) + to_int(l2)           # Python 的 int 沒有大小上限
    dummy = tail = ListNode(0)
    while True:
        tail.next = ListNode(s % 10)
        tail = tail.next
        s //= 10
        if s == 0:
            return dummy.next`,
        c: `// C 沒有大整數:把位數讀進陣列,其實就是方法一的直式加法
struct ListNode *addTwoNumbers(struct ListNode *l1, struct ListNode *l2) {
    int a[105] = {0}, b[105] = {0}, d[106] = {0}, n = 0, m = 0;
    for (; l1; l1 = l1->next) a[n++] = l1->val;
    for (; l2; l2 = l2->next) b[m++] = l2->val;
    int len = n > m ? n : m;
    for (int i = 0; i < len; i++) {
        d[i] += a[i] + b[i];
        d[i + 1] += d[i] / 10;
        d[i] %= 10;
    }
    if (d[len]) len++;
    struct ListNode dummy = {0, NULL}, *tail = &dummy;
    for (int i = 0; i < len; i++) {
        tail->next = malloc(sizeof(struct ListNode));
        tail = tail->next;
        tail->val = d[i];
        tail->next = NULL;
    }
    return dummy.next;
}`,
        cpp: `// C++ 沒有內建大整數:用 vector 存每一位,本質上還是直式加法
ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    vector<int> a, b;
    for (; l1; l1 = l1->next) a.push_back(l1->val);
    for (; l2; l2 = l2->next) b.push_back(l2->val);
    size_t len = max(a.size(), b.size());
    a.resize(len); b.resize(len);
    vector<int> d(len + 1, 0);
    for (size_t i = 0; i < len; i++) {
        d[i] += a[i] + b[i];
        d[i + 1] += d[i] / 10;
        d[i] %= 10;
    }
    if (d[len] == 0) d.pop_back();
    ListNode dummy(0), *tail = &dummy;
    for (int x : d) { tail->next = new ListNode(x); tail = tail->next; }
    return dummy.next;
}`,
        java: `ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    java.math.BigInteger x = read(l1).add(read(l2));
    String s = x.toString();
    ListNode dummy = new ListNode(0), tail = dummy;
    for (int i = s.length() - 1; i >= 0; i--) {   // 從個位開始
        tail.next = new ListNode(s.charAt(i) - '0');
        tail = tail.next;
    }
    return dummy.next;
}

private java.math.BigInteger read(ListNode node) {
    StringBuilder sb = new StringBuilder();
    for (; node != null; node = node.next) sb.append(node.val);
    return new java.math.BigInteger(sb.reverse().toString());
}`,
        javascript: `function addTwoNumbers(l1, l2) {
  const read = (node) => {
    let s = '';
    for (; node; node = node.next) s = node.val + s;   // 倒著串起來
    return BigInt(s);
  };
  const digits = String(read(l1) + read(l2));
  const dummy = new ListNode(0);
  let tail = dummy;
  for (let i = digits.length - 1; i >= 0; i--) {
    tail.next = new ListNode(Number(digits[i]));
    tail = tail.next;
  }
  return dummy.next;
}`,
      },
    },
  ],
  pitfalls: [
    '迴圈條件只寫 `l1 or l2`:最後一位相加有進位時(例如 5 + 5),答案少一個節點',
    '兩條長度不同:走完的那條要當作 0,不能直接停',
    '轉成 `int` / `long long` 相加:100 位數會溢位',
    '忘了 `tail = tail.next`:每個新節點都接在同一個位置,答案只剩最後一位',
  ],
  followUp: [
    { q: '如果數字是**正著**存的(頭是最高位)?', a: '445. Add Two Numbers II:先把兩條反轉([206](#/q/206)),或用兩個堆疊從尾巴開始加,最後的答案再反轉或從頭插入。' },
  ],
  check: {
    kind: 'fn',
    fn: 'addTwoNumbers',
    argKinds: ['list', 'list'],
    ret: 'list',
    cases: [
      { args: [[2, 4, 3], [5, 6, 4]], out: [7, 0, 8] },
      { args: [[0], [0]], out: [0] },
      { args: [[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], out: [8, 9, 9, 9, 0, 0, 0, 1] },
      { args: [A, B], out: [7, 0, 4, 0, 1] },
      { args: [[5], [5]], out: [0, 1] },
    ],
  },
}

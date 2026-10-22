import type { FigStep, Solution } from './types'
import { kv, loopChain } from './fig'

// 141. Linked List Cycle

const V = [3, 2, 0, -4, 5]
const POS = 1

function setFig(): FigStep[] {
  const seen: number[] = []
  const out: FigStep[] = [{ note: `最後一個節點(${V[V.length - 1]})的 next 接回第 ${POS} 個節點(${V[POS]}),形成一個環(亮的箭頭)。沿著 next 走永遠走不完`, views: [loopChain(V, POS)] }]
  let i = 0
  for (;;) {
    if (seen.includes(i)) {
      out.push({ note: `又走到節點 ${V[i]}(第 ${i} 個),它已經在 set 裡了 → 有環`, views: [loopChain(V, POS, { cls: { [i]: 'hl' } }), kv(seen.map((k) => [`節點 ${V[k]}`, '✓']), '看過的節點(存的是節點本身,不是值)', [`節點 ${V[i]}`])] })
      return out
    }
    seen.push(i)
    out.push({ note: `走到節點 ${V[i]},沒看過 → 放進 set`, views: [loopChain(V, POS, { cls: { [i]: 'hl' } }), kv(seen.map((k) => [`節點 ${V[k]}`, '✓']), '看過的節點(存的是節點本身,不是值)', [`節點 ${V[i]}`])] })
    i = i + 1 < V.length ? i + 1 : POS
  }
}

function floydFig(): FigStep[] {
  const step = (i: number) => (i + 1 < V.length ? i + 1 : POS)
  let slow = 0
  let fast = 0
  const draw = (note: string): FigStep => {
    const subs: Record<number, string> = {}
    subs[slow] = 'slow'
    subs[fast] = subs[fast] ? 'slow,fast' : 'fast'
    return { note, views: [loopChain(V, POS, { subs, cls: { [slow]: 'visited', [fast]: 'hl' } })] }
  }
  const out: FigStep[] = [draw('龜兔賽跑:slow 一次走一步、fast 一次走兩步。沒有環的話 fast 會先走到 null;有環的話 fast 會在環裡繞圈,最後從後面追上 slow')]
  for (let k = 0; k < 10; k++) {
    slow = step(slow)
    fast = step(step(fast))
    if (slow === fast) {
      out.push(draw(`slow 走到 ${V[slow]}、fast 走到 ${V[fast]} → 相遇了!有環`))
      return out
    }
    out.push(draw(`slow 走一步到 ${V[slow]},fast 走兩步到 ${V[fast]}`))
  }
  return out
}

export const q0141: Solution = {
  id: 141,
  plain: '判斷一條鏈子有沒有「繞回自己」形成圈圈。像操場跑道:如果是一圈的,跑得快的人一定會從後面追上跑得慢的人;如果是直線,快的人就先跑到終點了。',
  statement: '給鏈結串列的頭 `head`,判斷串列裡有沒有**環**:也就是沿著 `next` 一直走,會不會回到走過的節點。(測資用 `pos` 表示尾巴接回第幾個節點,`pos = -1` 表示沒有環;`pos` 不是參數。)',
  examples: [
    { input: 'head = [3,2,0,-4], pos = 1', output: 'true', note: '-4 的 next 接回 2' },
    { input: 'head = [1,2], pos = 0', output: 'true' },
    { input: 'head = [1], pos = -1', output: 'false' },
  ],
  constraints: ['`0 ≤ 節點數 ≤ 10⁴`', 'Follow-up:能不能只用 **O(1)** 額外空間?'],
  insight: [
    '有環的話,沿著 next 走會永遠走不完 —— 不能用「走到 null 就沒環」等待,需要能**認出走回頭了**',
    '最直接:記下每個走過的節點(記節點本身,不是值,因為不同節點的值可能一樣),走到看過的就是有環',
    '不想用額外空間:**快慢指針**。fast 一次兩步、slow 一次一步。有環時兩者都會進到環裡,每走一輪 fast 和 slow 的距離縮短 1,所以一定會相遇,不會跳過',
  ],
  approaches: [
    {
      name: 'Hash Set 記錄走過的節點',
      idea: '沿著 next 走,每個節點放進 set。走到 null → 沒有環;走到已經在 set 裡的節點 → 有環。',
      steps: ['`seen = set()`', '`while head`:`head in seen` → `true`;否則 `seen.add(head)`、往下走', '走到 null → `false`'],
      figure: { title: `head = [${V.join(',')}], pos = ${POS}`, steps: setFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點最多看一次;set 最多存 n 個節點。' },
      verdict: '最好懂。要注意 set 存的是**節點(位址)**,不是值。',
      code: {
        python: `def hasCycle(head):
    seen = set()
    while head:
        if head in seen:                  # 存的是節點物件,不是 head.val
            return True
        seen.add(head)
        head = head.next
    return False`,
        c: `// C 用 uthash 存節點的位址
typedef struct { struct ListNode *p; UT_hash_handle hh; } Seen;

bool hasCycle(struct ListNode *head) {
    Seen *s = NULL, *it, *tmp;
    bool found = false;
    for (; head && !found; head = head->next) {
        HASH_FIND_PTR(s, &head, it);
        if (it) { found = true; break; }
        it = malloc(sizeof(Seen));
        it->p = head;
        HASH_ADD_PTR(s, p, it);
    }
    HASH_ITER(hh, s, it, tmp) { HASH_DEL(s, it); free(it); }
    return found;
}`,
        cpp: `bool hasCycle(ListNode *head) {
    unordered_set<ListNode*> seen;
    for (; head; head = head->next) {
        if (seen.count(head)) return true;
        seen.insert(head);
    }
    return false;
}`,
        java: `boolean hasCycle(ListNode head) {
    Set<ListNode> seen = new HashSet<>();
    for (; head != null; head = head.next)
        if (!seen.add(head)) return true;
    return false;
}`,
        javascript: `function hasCycle(head) {
  const seen = new Set();
  for (; head; head = head.next) {
    if (seen.has(head)) return true;
    seen.add(head);
  }
  return false;
}`,
      },
    },
    {
      name: '快慢指針(Floyd 判環)',
      idea: '`slow` 每次走一步,`fast` 每次走兩步。`fast` 走到 null → 沒有環;`slow == fast` → 有環。',
      steps: ['`slow = fast = head`', '`while fast and fast.next`:`slow = slow.next`、`fast = fast.next.next`', '`slow == fast` → `true`', '迴圈結束(fast 走到底)→ `false`'],
      figure: { title: `head = [${V.join(',')}], pos = ${POS}`, steps: floydFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: 'slow 進入環之後,fast 每一步都把距離縮短 1,最多再走環的長度步就相遇。只用兩個指標。' },
      verdict: '標準解,也是[[p:fast-slow]]的代表題。延伸:142 找環的入口、876 找中點、[287](#/q/287) 找重複的數,都是同一對快慢指針。',
      code: {
        python: `def hasCycle(head):
    slow = fast = head
    while fast and fast.next:             # fast 走得到兩步才繼續
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
        c: `bool hasCycle(struct ListNode *head) {
    struct ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
        cpp: `bool hasCycle(ListNode *head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
        java: `boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`,
        javascript: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: [
    'set 存節點的值而不是節點:`[1, 1]` 沒有環,但兩個節點的值一樣,會誤判成有環',
    '快慢指針的迴圈條件要檢查 `fast && fast.next`:只檢查 `fast` 的話,`fast.next.next` 可能對 null 取 next',
    '相遇的判斷要放在「走完之後」:一開始 `slow == fast == head`,如果先判斷就會立刻回傳 true',
  ],
  followUp: [
    { q: '要回傳環的入口節點?', a: '142. Linked List Cycle II:相遇之後,把其中一個指針放回 head,兩個都改成一次一步,再次相遇的地方就是入口。' },
  ],
  check: {
    kind: 'fn',
    fn: 'hasCycle',
    argKinds: ['cycleList'],
    cases: [
      { args: [[[3, 2, 0, -4], 1]], out: true },
      { args: [[[1, 2], 0]], out: true },
      { args: [[[1], -1]], out: false },
      { args: [[[], -1]], out: false },
      { args: [[V, POS]], out: true },
      { args: [[[1, 1, 1], -1]], out: false },
      { args: [[[7], 0]], out: true },
    ],
  },
}

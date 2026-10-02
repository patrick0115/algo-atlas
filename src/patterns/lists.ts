import type { Frame, GraphEdge, GraphNode, Pattern } from '../types'
import { parseInt_, parseInts, randInt, randInts } from '../engine/helpers'

const C_NODE = 'struct ListNode { int val; struct ListNode *next; };'

// ===== 反轉鏈結串列(206) =====

function* reverseRun(v: Record<string, string>): Generator<Frame> {
  const vals = parseInts(v.list, '串列', { maxLen: 8 })
  const n = vals.length
  const next: (number | null)[] = vals.map((_, i) => (i + 1 < n ? i + 1 : null))
  let prev: number | null = null
  let cur: number | null = 0
  let nxt: number | null = null
  const f = (line: string, note: string, answer?: string): Frame => {
    const nodes: GraphNode[] = vals.map((x, i) => {
      const tags = [prev === i && 'prev', cur === i && 'cur', nxt === i && 'next'].filter(Boolean).join(' / ')
      return { id: i, label: x, x: i * 1.3, y: 0, sub: tags, cls: cur === i ? 'hl' : prev === i ? 'cmp' : undefined }
    })
    nodes.push({ id: 'null', label: '∅', x: n * 1.3, y: 0, cls: 'dim' })
    nodes.push({ id: 'nullL', label: '∅', x: -1.3, y: 0, cls: 'dim' })
    const edges: GraphEdge[] = next.map((t, i) => ({ from: i, to: t ?? (i < (cur ?? n) ? 'nullL' : 'null'), directed: true, cls: i === prev ? 'done' : undefined }))
    return {
      line,
      note,
      vars: { prev: prev === null ? '∅' : vals[prev], cur: cur === null ? '∅' : vals[cur], ...(answer !== undefined ? { answer } : {}) },
      views: [{ kind: 'graph', label: '箭頭是 next 指標;節點下方標示 prev / cur / next 指著誰', nodes, edges }],
    }
  }
  yield f('init', 'prev = ∅、cur = 頭。目標:把每一個箭頭都轉向')
  while (cur !== null) {
    nxt = next[cur]
    yield f('save', `先用 next 記住 ${vals[cur]} 的下一個(${nxt === null ? '∅' : vals[nxt]}),不然等一下箭頭一轉就找不到了`)
    next[cur] = prev
    yield f('flip', `把 ${vals[cur]} 的箭頭轉向 prev(${prev === null ? '∅' : vals[prev]})`)
    prev = cur
    cur = nxt
    nxt = null
    yield f('move', `prev、cur 都往前走一步`)
  }
  const out: number[] = []
  for (let p: number | null = prev; p !== null; p = next[p]) out.push(vals[p])
  yield f('done', `cur 走到 ∅ 了,prev 就是新的頭:${out.join(' → ')}`, out.join(','))
}

export const linkedList: Pattern = {
  id: 'linked-list',
  summary: '鏈結串列的每個節點只知道「下一個是誰」(next 指標)。大部分題目都是在小心地改 next 指標,關鍵是:改之前先把會失去的東西記下來。',
  analogy: '一群人排成一列,每個人只把手搭在「前面那個人」的肩上。要讓隊伍反過來,就要一個一個請大家把手改搭到後面那個人身上 —— 改之前要先記住原本前面是誰,不然隊伍就斷了。',
  steps: ['prev = ∅、cur = 頭', 'next = cur.next(先存起來)', 'cur.next = prev(轉向)', 'prev = cur、cur = next(往前走)', '重複直到 cur 是 ∅;prev 就是新的頭'],
  watch: ['每一步只改一個箭頭', '看 next 這個暫存變數為什麼必要:箭頭轉過去之後,原本的下一個就只能靠它找到'],
  whenToUse: ['反轉整條 / 一段 / 每 k 個一組', '合併兩條有序串列', '刪除節點(常配合 dummy 虛擬頭節點)', '和快慢指標組合:找中點後反轉後半(回文串列、重排串列)'],
  pitfalls: ['改 next 之前先存好原本的 next', '頭節點可能被刪除或改變 → 用 dummy 節點最省事', '迴圈條件寫 cur 還是 cur.next 要想清楚'],
  complexity: { time: 'O(n)', space: 'O(1)', why: '每個節點只處理一次,只用了三個指標。' },
  demo: {
    title: '反轉鏈結串列(LeetCode 206)',
    inputs: [{ key: 'list', label: '串列', default: '1,2,3,4,5' }],
    run: reverseRun,
    reference: (v) => parseInts(v.list, '串列', { maxLen: 8 }).reverse().join(','),
    random: () => ({ list: randInts(randInt(1, 7), 0, 9).join(',') }),
    code: {
      python: `def reverse_list(head):
    prev, cur = None, head                      #@init
    while cur:
        nxt = cur.next                          #@save
        cur.next = prev                         #@flip
        prev, cur = cur, nxt                    #@move
    return prev                                 #@done`,
      c: `${C_NODE}
struct ListNode* reverseList(struct ListNode *head) {
    struct ListNode *prev = NULL, *cur = head;  //@init
    while (cur) {
        struct ListNode *nxt = cur->next;       //@save
        cur->next = prev;                       //@flip
        prev = cur; cur = nxt;                  //@move
    }
    return prev;                                //@done
}`,
      cpp: `ListNode* reverseList(ListNode* head) {
    ListNode *prev = nullptr, *cur = head;      //@init
    while (cur) {
        ListNode* nxt = cur->next;              //@save
        cur->next = prev;                       //@flip
        prev = cur; cur = nxt;                  //@move
    }
    return prev;                                //@done
}`,
      java: `ListNode reverseList(ListNode head) {
    ListNode prev = null, cur = head;           //@init
    while (cur != null) {
        ListNode nxt = cur.next;                //@save
        cur.next = prev;                        //@flip
        prev = cur; cur = nxt;                  //@move
    }
    return prev;                                //@done
}`,
      javascript: `function reverseList(head) {
  let prev = null, cur = head;                  //@init
  while (cur) {
    const nxt = cur.next;                       //@save
    cur.next = prev;                            //@flip
    prev = cur; cur = nxt;                      //@move
  }
  return prev;                                  //@done
}`,
    },
  },
}

// ===== 快慢指標(142. 環的入口) =====

function* floydRun(v: Record<string, string>): Generator<Frame> {
  const vals = parseInts(v.list, '串列', { maxLen: 10 })
  const n = vals.length
  const pos = parseInt_(v.pos, 'pos', -1, n - 1)
  const nextOf = (i: number) => (i + 1 < n ? i + 1 : pos >= 0 ? pos : null)

  // 版面:環以前排成一列,環上的節點排成圓
  const coords: { x: number; y: number }[] = []
  if (pos < 0) for (let i = 0; i < n; i++) coords.push({ x: i * 1.2, y: 0.8 })
  else {
    const len = n - pos
    const r = Math.max(0.9, (len * 1.15) / (2 * Math.PI))
    const cx = pos * 1.2 + r
    for (let i = 0; i < pos; i++) coords.push({ x: i * 1.2, y: r })
    for (let k = 0; k < len; k++) {
      const a = Math.PI + (2 * Math.PI * k) / len
      coords.push({ x: cx + r * Math.cos(a), y: r - r * Math.sin(a) })
    }
  }

  let slow: number | null = 0
  let fast: number | null = 0
  const f = (line: string, note: string, answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [
      {
        kind: 'graph',
        label: '節點下方的小字是索引與指標;黑色 = slow,灰色 = fast',
        nodes: vals.map((x, i) => ({
          id: i,
          label: x,
          ...coords[i],
          cls: slow === i ? 'hl' : fast === i ? 'cmp' : undefined,
          sub: [`#${i}`, slow === i && 'slow', fast === i && 'fast'].filter(Boolean).join(' '),
        })),
        edges: vals.flatMap((_, i) => {
          const t = nextOf(i)
          return t === null ? [] : [{ from: i, to: t, directed: true }]
        }),
      },
    ],
  })
  yield f('init', 'slow 和 fast 都從頭出發。slow 每次走 1 步,fast 每次走 2 步')
  while (true) {
    if (fast === null || nextOf(fast) === null) {
      fast = null
      yield f('none', 'fast 走到盡頭了 → 沒有環', -1)
      return
    }
    slow = nextOf(slow!)
    fast = nextOf(nextOf(fast)!)
    if (fast === null) {
      yield f('none', 'fast 走到盡頭了 → 沒有環', -1)
      return
    }
    yield f('step', `slow 走 1 步到 #${slow},fast 走 2 步到 #${fast}`)
    if (slow === fast) {
      yield f('meet', `兩個指標在 #${slow} 相遇了 → 一定有環!(fast 在環裡繞圈追上了 slow)`)
      break
    }
  }
  slow = 0
  yield f('reset', 'slow 回到頭,fast 留在相遇點。接下來兩個都改成每次走 1 步')
  while (slow !== fast) {
    slow = nextOf(slow!)
    fast = nextOf(fast!)
    yield f('walk', `兩個各走 1 步:slow 在 #${slow},fast 在 #${fast}`)
  }
  yield f('entry', `再次相遇的 #${slow} 就是環的入口(數學上可以證明:頭到入口的距離 = 相遇點繞到入口的距離)`, slow!)
}

export const fastSlow: Pattern = {
  id: 'fast-slow',
  summary: '兩個指標從同一個地方出發,一個走得快(每次 2 步)、一個走得慢(每次 1 步)。如果有環,快的一定會在環裡追上慢的;如果沒有環,快的會先走到盡頭。',
  analogy: '操場跑步:跑得快的人一定會「套圈」追上跑得慢的人。如果是直線跑道(沒有環),快的人只會先到終點。',
  steps: ['slow = fast = 頭', 'slow 走 1 步,fast 走 2 步', 'fast 走到底 → 沒有環', '相遇 → 有環', '找入口:slow 回到頭,兩個都改走 1 步,再次相遇處就是入口'],
  watch: ['黑色是 slow、灰色是 fast', '進到環裡之後,fast 每一步都和 slow 拉近 1 格,所以一定追得上'],
  whenToUse: ['判斷有沒有環、找環的入口', '找中點:fast 到尾時,slow 剛好在中間', '倒數第 n 個:fast 先走 n 步,再一起走', '把「值」當成「下一步」的題目(Find the Duplicate Number、Happy Number)'],
  pitfalls: ['fast 每次走兩步,要先確認 fast 和 fast.next 都不是空的', '找中點時,偶數長度要停在前中點還是後中點,看題目'],
  complexity: { time: 'O(n)', space: 'O(1)', why: '進入環後最多繞一圈就會相遇;不需要額外記錄走過的節點。' },
  demo: {
    title: '找鏈結串列的環的入口(LeetCode 142)',
    inputs: [
      { key: 'list', label: '串列', default: '3,2,0,-4,7,5' },
      { key: 'pos', label: '尾巴接回第幾個(−1 = 沒有環)', default: '2' },
    ],
    run: floydRun,
    reference: (v) => Number(v.pos),
    random: () => {
      const n = randInt(1, 9)
      return { list: randInts(n, 0, 9).join(','), pos: String(randInt(-1, n - 1)) }
    },
    code: {
      python: `def detect_cycle(head):
    slow = fast = head                          #@init
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next  #@step
        if slow is fast: break                  #@meet
    else:
        return None                             #@none
    slow = head                                 #@reset
    while slow is not fast:
        slow, fast = slow.next, fast.next       #@walk
    return slow                                 #@entry`,
      c: `${C_NODE}
struct ListNode* detectCycle(struct ListNode *head) {
    struct ListNode *slow = head, *fast = head; //@init
    while (fast && fast->next) {
        slow = slow->next; fast = fast->next->next;  //@step
        if (slow == fast) {                     //@meet
            slow = head;                        //@reset
            while (slow != fast) {
                slow = slow->next; fast = fast->next;  //@walk
            }
            return slow;                        //@entry
        }
    }
    return NULL;                                //@none
}`,
      cpp: `ListNode* detectCycle(ListNode* head) {
    ListNode *slow = head, *fast = head;        //@init
    while (fast && fast->next) {
        slow = slow->next; fast = fast->next->next;  //@step
        if (slow == fast) {                     //@meet
            slow = head;                        //@reset
            while (slow != fast) {
                slow = slow->next; fast = fast->next;  //@walk
            }
            return slow;                        //@entry
        }
    }
    return nullptr;                             //@none
}`,
      java: `ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;          //@init
    while (fast != null && fast.next != null) {
        slow = slow.next; fast = fast.next.next;    //@step
        if (slow == fast) {                     //@meet
            slow = head;                        //@reset
            while (slow != fast) {
                slow = slow.next; fast = fast.next; //@walk
            }
            return slow;                        //@entry
        }
    }
    return null;                                //@none
}`,
      javascript: `function detectCycle(head) {
  let slow = head, fast = head;                 //@init
  while (fast && fast.next) {
    slow = slow.next; fast = fast.next.next;    //@step
    if (slow === fast) {                        //@meet
      slow = head;                              //@reset
      while (slow !== fast) {
        slow = slow.next; fast = fast.next;     //@walk
      }
      return slow;                              //@entry
    }
  }
  return null;                                  //@none
}`,
    },
  },
}

export const LISTS = [linkedList, fastSlow]

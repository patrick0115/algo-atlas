import { arr, treeLayout } from '../engine/helpers'
import type { GraphViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1046. Last Stone Weight

const S = [2, 7, 4, 1, 8, 1]

function sortFig(): FigStep[] {
  let a = [...S]
  const out: FigStep[] = [{ note: '每一回合拿最重的兩顆互撞:一樣重就都碎掉;不一樣重,剩下「重的 − 輕的」放回去。最簡單的做法:每回合都重新排序', views: [arr(a, { label: 'stones', mode: 'bars' })] }]
  while (a.length > 1) {
    a.sort((x, y) => x - y)
    const y = a.pop()!
    const x = a.pop()!
    out.push({ note: `排序後最重的兩顆是 ${y} 和 ${x} → ${y === x ? '一樣重,都碎掉' : `剩下 ${y} − ${x} = ${y - x} 放回去`}`, views: [arr([...a, x, y], { label: 'stones(排序後)', mode: 'bars', compare: [a.length, a.length + 1] })] })
    if (y !== x) a.push(y - x)
  }
  out.push({ note: `剩 ${a.length ? `一顆 ${a[0]}` : '0 顆'} → 答案 ${a[0] ?? 0}`, views: [arr(a.length ? a : [0], { label: '剩下的', mode: 'bars', done: [0] })] })
  return out
}

function heapView(h: number[]): GraphViewData {
  const { nodes, edges } = treeLayout(h)
  return { kind: 'graph', label: 'max-heap(堆頂是最重的)', nodes: nodes.map((n, i) => ({ ...n, cls: i === 0 ? 'hl' : undefined })), edges }
}

function heapFig(): FigStep[] {
  const h: number[] = []
  const push = (v: number) => {
    h.push(v)
    for (let i = h.length - 1; i > 0 && h[(i - 1) >> 1] < h[i]; i = (i - 1) >> 1) [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]]
  }
  const pop = () => {
    const top = h[0]
    h[0] = h[h.length - 1]
    h.pop()
    for (let i = 0; ; ) {
      const l = 2 * i + 1
      const r = l + 1
      let m = i
      if (l < h.length && h[l] > h[m]) m = l
      if (r < h.length && h[r] > h[m]) m = r
      if (m === i) break
      ;[h[i], h[m]] = [h[m], h[i]]
      i = m
    }
    return top
  }
  S.forEach(push)
  const out: FigStep[] = [{ note: '「每次都要拿最大的」→ 最大堆(Heap)。拿出最大 O(log n)、放回去 O(log n),不用每回合重新排序', views: [heapView([...h])] }]
  while (h.length > 1) {
    const y = pop()
    const x = pop()
    if (y !== x) push(y - x)
    out.push({ note: `拿出最重的 ${y} 和次重的 ${x} → ${y === x ? '都碎掉' : `放回 ${y - x}`}`, views: [heapView([...h])] })
  }
  out.push({ note: `答案 ${h[0] ?? 0}`, views: [heapView([...h])] })
  return out
}

function countFig(): FigStep[] {
  const cnt = Array(9).fill(0)
  for (const s of S) cnt[s]++
  return [
    { note: '重量最多只有 1000 → 可以用「計數陣列」:cnt[w] = 重量 w 的石頭有幾顆。從最重的往下找', views: [arr(cnt, { label: 'cnt[重量](這裡只畫到 8)', highlight: S })] },
    { note: '最重的是 8(1 顆)、下一個是 7 → 撞完剩 1,cnt[1]++。之後一樣從目前最重的往下找;同一個重量有兩顆就直接互相抵銷', views: [arr([0, 3, 1, 0, 1, 0, 0, 0, 0], { label: 'cnt(撞完 8 和 7 之後)', highlight: [1] })] },
    { note: '一路做下去,最後剩下的重量就是答案 1。每次碰撞往下找次重的最多掃 W 格,總共 O(n · W)', views: [arr([0, 1, 0, 0, 0, 0, 0, 0, 0], { label: 'cnt(最後)', done: [1] })] },
  ]
}

export const q1046: Solution = {
  id: 1046,
  plain: '一堆石頭,每回合拿**最重的兩顆**互撞:一樣重就一起碎掉;不一樣重,剩下兩者的差。一直撞到剩一顆(或沒有)為止,問最後那顆多重。',
  statement: '`stones[i]` 是第 i 顆石頭的重量。每回合挑最重的兩顆 x ≤ y 互撞:x == y 兩顆都消失;否則 x 消失,y 變成 y − x。最後最多剩一顆,回傳它的重量;沒有剩就回傳 0。',
  examples: [
    { input: 'stones = [2,7,4,1,8,1]', output: '1', note: '8,7→1;4,2→2;2,1→1;1,1→0;剩 1' },
    { input: 'stones = [1]', output: '1' },
  ],
  constraints: ['`1 ≤ n ≤ 30`、`1 ≤ stones[i] ≤ 1000` → 很小,任何做法都能過;這題是練習 Heap'],
  insight: [
    '每回合都要找「最大的兩個」,而且會放回新的值 —— 這是 **Heap(優先佇列)** 的標準使用情境',
    '每回合重新排序也行(n 很小),但每回合 O(n log n)',
    '用最大堆:取出最大 O(log n)、插入 O(log n),總共 O(n log n)',
  ],
  approaches: [
    {
      name: '每回合重新排序',
      idea: '排序,拿最後兩個(最重的)撞,結果放回去,再排序……',
      steps: ['`while len(stones) > 1`:排序', '取出最大兩個 `y ≥ x`', '`y != x` → 放回 `y − x`', '回傳剩下的那個或 0'],
      figure: { title: `stones = [${S.join(',')}]`, steps: sortFig() },
      complexity: { time: 'O(n² log n)', space: 'O(1)', why: '最多 n 回合,每回合排序 O(n log n)。' },
      verdict: 'n ≤ 30 完全沒問題,但每回合都重排很浪費。',
      code: {
        python: `def lastStoneWeight(stones):
    stones = list(stones)
    while len(stones) > 1:
        stones.sort()
        y, x = stones.pop(), stones.pop()
        if y != x:
            stones.append(y - x)
    return stones[0] if stones else 0`,
        c: `static int cmpInt(const void *a, const void *b) {
    return *(const int *)a - *(const int *)b;
}

int lastStoneWeight(int *stones, int stonesSize) {
    int n = stonesSize;
    while (n > 1) {
        qsort(stones, n, sizeof(int), cmpInt);
        int y = stones[--n], x = stones[--n];
        if (y != x) stones[n++] = y - x;
    }
    return n ? stones[0] : 0;
}`,
        cpp: `int lastStoneWeight(vector<int>& stones) {
    while (stones.size() > 1) {
        sort(stones.begin(), stones.end());
        int y = stones.back(); stones.pop_back();
        int x = stones.back(); stones.pop_back();
        if (y != x) stones.push_back(y - x);
    }
    return stones.empty() ? 0 : stones[0];
}`,
        java: `int lastStoneWeight(int[] stones) {
    List<Integer> s = new ArrayList<>();
    for (int x : stones) s.add(x);
    while (s.size() > 1) {
        Collections.sort(s);
        int y = s.remove(s.size() - 1), x = s.remove(s.size() - 1);
        if (y != x) s.add(y - x);
    }
    return s.isEmpty() ? 0 : s.get(0);
}`,
        javascript: `function lastStoneWeight(stones) {
  const s = [...stones];
  while (s.length > 1) {
    s.sort((a, b) => a - b);
    const y = s.pop(), x = s.pop();
    if (y !== x) s.push(y - x);
  }
  return s.length ? s[0] : 0;
}`,
      },
    },
    {
      name: '最大堆',
      idea: '全部放進最大堆。每回合 pop 兩次拿到最重的兩顆,差不是 0 就 push 回去。',
      steps: ['建最大堆', '`while 堆的大小 > 1`:`y = pop()`、`x = pop()`', '`y != x` → `push(y − x)`', '回傳堆頂或 0'],
      figure: { title: `stones = [${S.join(',')}]`, steps: heapFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '建堆 O(n),之後最多 n 回合,每回合 O(log n)。' },
      verdict: '標準解,[[p:heap]]的入門題。Python 的 heapq 只有最小堆,要存負數模擬最大堆。',
      code: {
        python: `import heapq

def lastStoneWeight(stones):
    h = [-s for s in stones]              # heapq 是最小堆,存負數 = 最大堆
    heapq.heapify(h)
    while len(h) > 1:
        y = -heapq.heappop(h)
        x = -heapq.heappop(h)
        if y != x:
            heapq.heappush(h, -(y - x))
    return -h[0] if h else 0`,
        c: `// C 沒有內建堆,自己寫一個最大堆
static int h[32], sz;

static void up(int i) {
    while (i > 0 && h[(i - 1) / 2] < h[i]) { int p = (i - 1) / 2, t = h[p]; h[p] = h[i]; h[i] = t; i = p; }
}
static void down(int i) {
    for (;;) {
        int l = 2 * i + 1, r = l + 1, m = i;
        if (l < sz && h[l] > h[m]) m = l;
        if (r < sz && h[r] > h[m]) m = r;
        if (m == i) return;
        int t = h[m]; h[m] = h[i]; h[i] = t; i = m;
    }
}
static int pop(void) { int top = h[0]; h[0] = h[--sz]; down(0); return top; }
static void push(int v) { h[sz] = v; up(sz++); }

int lastStoneWeight(int *stones, int stonesSize) {
    sz = 0;
    for (int i = 0; i < stonesSize; i++) push(stones[i]);
    while (sz > 1) {
        int y = pop(), x = pop();
        if (y != x) push(y - x);
    }
    return sz ? h[0] : 0;
}`,
        cpp: `int lastStoneWeight(vector<int>& stones) {
    priority_queue<int> pq(stones.begin(), stones.end());   // 預設是最大堆
    while (pq.size() > 1) {
        int y = pq.top(); pq.pop();
        int x = pq.top(); pq.pop();
        if (y != x) pq.push(y - x);
    }
    return pq.empty() ? 0 : pq.top();
}`,
        java: `int lastStoneWeight(int[] stones) {
    PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());   // 最大堆
    for (int s : stones) pq.offer(s);
    while (pq.size() > 1) {
        int y = pq.poll(), x = pq.poll();
        if (y != x) pq.offer(y - x);
    }
    return pq.isEmpty() ? 0 : pq.peek();
}`,
        javascript: `function lastStoneWeight(stones) {
  // JavaScript 沒有內建堆,手寫一個最大堆
  const h = [];
  const push = (v) => {
    h.push(v);
    for (let i = h.length - 1; i > 0 && h[(i - 1) >> 1] < h[i]; i = (i - 1) >> 1)
      [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]];
  };
  const pop = () => {
    const top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < h.length && h[l] > h[m]) m = l;
        if (r < h.length && h[r] > h[m]) m = r;
        if (m === i) break;
        [h[i], h[m]] = [h[m], h[i]];
        i = m;
      }
    }
    return top;
  };
  stones.forEach(push);
  while (h.length > 1) {
    const y = pop(), x = pop();
    if (y !== x) push(y - x);
  }
  return h.length ? h[0] : 0;
}`,
      },
    },
    {
      name: '計數陣列(重量範圍很小)',
      idea: '重量 ≤ 1000,用 `cnt[w]` 記每個重量有幾顆。從最大的重量往下找「最重」和「次重」,撞完把差放回對應的格子。同一個重量有偶數顆會互相抵銷。',
      steps: ['`cnt[w]++`', '`w` 從最大往下:`cnt[w]` 是偶數 → 全部兩兩抵銷;奇數 → 剩一顆,往下找下一顆石頭 `x`', '撞完 `cnt[w − x]++`(差一定比 w 小,之後還會掃到)', '找不到第二顆 → 答案是 w'],
      figure: { title: `stones = [${S.join(',')}]`, steps: countFig() },
      complexity: { time: 'O(n · W)', space: 'O(W)', why: 'W 是最大重量(1000)。最多 n 次碰撞,每次往下找次重的最多掃 W 格。' },
      verdict: '利用「值的範圍小」換掉 Heap,和 [347](#/q/347) 的桶排序是同一個想法。面試時當補充。',
      code: {
        python: `def lastStoneWeight(stones):
    W = max(stones)
    cnt = [0] * (W + 1)
    for s in stones:
        cnt[s] += 1
    w = W
    while w > 0:
        if cnt[w] == 0:
            w -= 1
            continue
        cnt[w] %= 2                       # 同樣重的兩兩互撞,全部消失
        if cnt[w] == 0:
            continue
        x = w - 1                         # 找次重的
        while x > 0 and cnt[x] == 0:
            x -= 1
        if x == 0:
            return w                      # 只剩這一顆
        cnt[w] -= 1
        cnt[x] -= 1
        cnt[w - x] += 1
        w = max(x, w - x)                 # 目前最重的不會超過這兩者
    return 0`,
        c: `int lastStoneWeight(int *stones, int stonesSize) {
    int cnt[1001] = {0}, w = 0;
    for (int i = 0; i < stonesSize; i++) { cnt[stones[i]]++; if (stones[i] > w) w = stones[i]; }
    while (w > 0) {
        if (cnt[w] == 0) { w--; continue; }
        cnt[w] %= 2;
        if (cnt[w] == 0) continue;
        int x = w - 1;
        while (x > 0 && cnt[x] == 0) x--;
        if (x == 0) return w;
        cnt[w]--; cnt[x]--; cnt[w - x]++;
        w = x > w - x ? x : w - x;
    }
    return 0;
}`,
        cpp: `int lastStoneWeight(vector<int>& stones) {
    int w = *max_element(stones.begin(), stones.end());
    vector<int> cnt(w + 1, 0);
    for (int s : stones) cnt[s]++;
    while (w > 0) {
        if (cnt[w] == 0) { w--; continue; }
        cnt[w] %= 2;
        if (cnt[w] == 0) continue;
        int x = w - 1;
        while (x > 0 && cnt[x] == 0) x--;
        if (x == 0) return w;
        cnt[w]--; cnt[x]--; cnt[w - x]++;
        w = max(x, w - x);
    }
    return 0;
}`,
        java: `int lastStoneWeight(int[] stones) {
    int w = 0;
    for (int s : stones) w = Math.max(w, s);
    int[] cnt = new int[w + 1];
    for (int s : stones) cnt[s]++;
    while (w > 0) {
        if (cnt[w] == 0) { w--; continue; }
        cnt[w] %= 2;
        if (cnt[w] == 0) continue;
        int x = w - 1;
        while (x > 0 && cnt[x] == 0) x--;
        if (x == 0) return w;
        cnt[w]--; cnt[x]--; cnt[w - x]++;
        w = Math.max(x, w - x);
    }
    return 0;
}`,
        javascript: `function lastStoneWeight(stones) {
  let w = Math.max(...stones);
  const cnt = new Array(w + 1).fill(0);
  for (const s of stones) cnt[s]++;
  while (w > 0) {
    if (cnt[w] === 0) { w--; continue; }
    cnt[w] %= 2;
    if (cnt[w] === 0) continue;
    let x = w - 1;
    while (x > 0 && cnt[x] === 0) x--;
    if (x === 0) return w;
    cnt[w]--; cnt[x]--; cnt[w - x]++;
    w = Math.max(x, w - x);
  }
  return 0;
}`,
      },
    },
  ],
  pitfalls: [
    'Python 的 `heapq` 是**最小堆**:直接 push 正數會拿到最輕的石頭,要存負數',
    '兩顆一樣重時不要把 0 放回去:放回 0 也能過,但多一顆「重量 0 的石頭」會讓最後的判斷變複雜',
    '最後堆是空的時要回傳 0',
  ],
  followUp: [{ q: '想讓最後剩下的盡量輕(可以任選兩顆撞)?', a: '1049. Last Stone Weight II:變成「把石頭分成兩堆,差最小」的 0/1 背包問題。' }],
  check: {
    kind: 'fn',
    fn: 'lastStoneWeight',
    cases: [
      { args: [[2, 7, 4, 1, 8, 1]], out: 1 },
      { args: [[1]], out: 1 },
      { args: [[2, 2]], out: 0 },
      { args: [[3, 7, 2]], out: 2 },
      { args: [[10, 4, 2, 10]], out: 2 },
    ],
  },
}

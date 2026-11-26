import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 3477. Fruits Into Baskets II

const FRUITS = [4, 2, 5]
const BASKETS = [3, 5, 4]

function bruteFig(): FigStep[] {
  const used = new Array(BASKETS.length).fill(false)
  const out: FigStep[] = []
  let unplaced = 0
  for (const f of FRUITS) {
    let pick = -1
    for (let j = 0; j < BASKETS.length; j++) {
      if (!used[j] && BASKETS[j] >= f) {
        pick = j
        break
      }
    }
    const dim = used.map((u, j) => (u ? j : -1)).filter((j) => j >= 0)
    if (pick >= 0) {
      out.push({
        note: `水果 ${f}:由左找第一個沒用過且容量 ≥ ${f} 的籃子 → 第 ${pick} 個(容量 ${BASKETS[pick]}),放進去、標記用掉。`,
        line: 8,
        views: [arr(BASKETS, { label: 'baskets 容量', highlight: [pick], done: [pick], dim })],
      })
      used[pick] = true
    } else {
      unplaced++
      out.push({
        note: `水果 ${f}:剩下的籃子都裝不下(沒有容量 ≥ ${f} 的空籃)→ 未放,\`unplaced = ${unplaced}\`。`,
        line: 14,
        views: [arr(BASKETS, { label: 'baskets 容量', dim })],
      })
    }
  }
  return out
}

function segFig(): FigStep[] {
  return [
    {
      note: '線段樹每個節點存「這段區間內的最大容量」。根 = max(3,5,4) = 5。',
      line: 15,
      views: [arr(BASKETS, { label: 'baskets', highlight: [1] })],
    },
    {
      note: '水果 4:從根往下,優先走左子樹。左半 [3,5] 最大是 5 ≥ 4,進左半;左半再往下找到第一個 ≥ 4 的葉子 = 第 1 個(5),用掉後把它設為 0。',
      line: 24,
      views: [arr([3, 0, 4], { label: 'baskets(5 已用)', done: [1] })],
    },
    {
      note: '水果 2:左半剩 [3,0],最大 3 ≥ 2,第 0 個(3)可用,用掉設 0。水果 5:整棵樹最大剩 4 < 5,走不下去 → 未放。答案 1。',
      line: 27,
      views: [arr([0, 0, 4], { label: 'baskets(只剩 4)', done: [0, 1], dim: [2] })],
    },
  ]
}

export const q3477: Solution = {
  id: 3477,
  plain: '一排水果由左到右,每顆要塞進「從左邊數第一個裝得下、還沒被佔用」的籃子。塞不下的就算失敗,問有幾顆沒放成。',
  statement: '給 `fruits` 與 `baskets`(等長)。由左到右處理每個 `fruits[i]`,把它放進最左邊「容量 ≥ fruits[i] 且尚未使用」的籃子;放不下則該水果未放。回傳未放的水果數。',
  examples: [
    { input: 'fruits = [4,2,5], baskets = [3,5,4]', output: '1', note: '4→籃1(5),2→籃0(3),5→剩籃2(4)裝不下,未放 1 顆。' },
    { input: 'fruits = [3,6,1], baskets = [6,4,7]', output: '0', note: '3→籃0(6),6→籃2(7),1→籃1(4),全放進去。' },
  ],
  constraints: ['`fruits.length == baskets.length == n`', '每顆水果只配一個籃子,每個籃子最多用一次'],
  insight: ['每顆水果獨立找「最左、夠大、沒用過」的籃子,是直接照題意跑的 [[p:simulation]]', '暴力是 O(n²);瓶頸在「快速找最左且容量夠的空籃」', '用 [[p:segment-tree]] 存區間最大容量,從根往下優先走左子樹,就能 O(log n) 找到最左可用籃'],
  approaches: [
    {
      name: '暴力標記',
      idea: '每顆水果從左掃一遍籃子,找第一個沒用過且容量夠的,標記用掉;掃完沒找到就計一次未放。',
      steps: ['`used = [false] * n`、`unplaced = 0`', '`for f in fruits`', '`for j in 0..n−1`:第一個 `!used[j] 且 baskets[j] ≥ f` → 標記、`break`', '沒找到 → `unplaced += 1`', '回傳 `unplaced`'],
      figure: { title: `fruits = [${FRUITS.join(', ')}], baskets = [${BASKETS.join(', ')}]`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每顆水果最壞掃整排籃子。' },
      verdict: '最推薦,n 不大時直接照題意寫,好懂不易錯。',
      code: {
        javascript: `function numOfUnplacedFruits(fruits, baskets) {
  const n = baskets.length;
  const used = new Array(n).fill(false);
  let unplaced = 0;
  for (const f of fruits) {
    let placed = false;
    for (let j = 0; j < n; j++) {
      if (!used[j] && baskets[j] >= f) {
        used[j] = true;
        placed = true;
        break;
      }
    }
    if (!placed) unplaced++;
  }
  return unplaced;
}`,
        python: `def numOfUnplacedFruits(fruits, baskets):
    n = len(baskets)
    used = [False] * n
    unplaced = 0
    for f in fruits:
        placed = False
        for j in range(n):
            if not used[j] and baskets[j] >= f:
                used[j] = True
                placed = True
                break
        if not placed:
            unplaced += 1
    return unplaced`,
        c: `int numOfUnplacedFruits(int *fruits, int fruitsSize, int *baskets, int basketsSize) {
    int n = basketsSize, unplaced = 0;
    char *used = calloc(n, sizeof(char));
    for (int i = 0; i < fruitsSize; i++) {
        int placed = 0;
        for (int j = 0; j < n; j++) {
            if (!used[j] && baskets[j] >= fruits[i]) {
                used[j] = 1;
                placed = 1;
                break;
            }
        }
        if (!placed) unplaced++;
    }
    free(used);
    return unplaced;
}`,
        cpp: `int numOfUnplacedFruits(vector<int>& fruits, vector<int>& baskets) {
    int n = baskets.size(), unplaced = 0;
    vector<bool> used(n, false);
    for (int f : fruits) {
        bool placed = false;
        for (int j = 0; j < n; j++) {
            if (!used[j] && baskets[j] >= f) {
                used[j] = true;
                placed = true;
                break;
            }
        }
        if (!placed) unplaced++;
    }
    return unplaced;
}`,
        java: `int numOfUnplacedFruits(int[] fruits, int[] baskets) {
    int n = baskets.length, unplaced = 0;
    boolean[] used = new boolean[n];
    for (int f : fruits) {
        boolean placed = false;
        for (int j = 0; j < n; j++) {
            if (!used[j] && baskets[j] >= f) {
                used[j] = true;
                placed = true;
                break;
            }
        }
        if (!placed) unplaced++;
    }
    return unplaced;
}`,
      },
    },
    {
      name: '線段樹',
      idea: '線段樹每個節點存該區間的最大容量。找籃子時從根往下,只要左子樹最大 ≥ 水果就優先走左,找到最左可用葉子後把它設為 0。',
      steps: ['`build`:葉子放各籃容量,內部節點取左右最大', '`query(f)`:根的最大 < f → 回 −1(未放)', '否則左子樹最大 ≥ f 就往左,否則往右,遞迴到葉子', '找到的葉子容量設 0 並沿路更新最大', '每顆水果呼叫一次,回 −1 就累加未放'],
      figure: { title: `fruits = [${FRUITS.join(', ')}], baskets = [${BASKETS.join(', ')}]`, steps: segFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '每顆水果一次 O(log n) 的往下查找。' },
      verdict: 'n 很大時才需要;把「最左且容量夠」做成 [[p:segment-tree]] 的左優先下探,是這題的進階重點。',
      code: {
        javascript: `function numOfUnplacedFruits(fruits, baskets) {
  const n = baskets.length;
  if (n === 0) return fruits.length;
  const tree = new Array(4 * n).fill(0);
  const build = (node, lo, hi) => {
    if (lo === hi) { tree[node] = baskets[lo]; return; }
    const mid = (lo + hi) >> 1;
    build(node * 2, lo, mid);
    build(node * 2 + 1, mid + 1, hi);
    tree[node] = Math.max(tree[node * 2], tree[node * 2 + 1]);
  };
  const place = (node, lo, hi, f) => {
    if (tree[node] < f) return -1;
    if (lo === hi) { tree[node] = 0; return lo; }
    const mid = (lo + hi) >> 1;
    const idx = tree[node * 2] >= f
      ? place(node * 2, lo, mid, f)
      : place(node * 2 + 1, mid + 1, hi, f);
    tree[node] = Math.max(tree[node * 2], tree[node * 2 + 1]);
    return idx;
  };
  build(1, 0, n - 1);
  let unplaced = 0;
  for (const f of fruits) {
    if (place(1, 0, n - 1, f) === -1) unplaced++;
  }
  return unplaced;
}`,
        python: `def numOfUnplacedFruits(fruits, baskets):
    n = len(baskets)
    if n == 0:
        return len(fruits)
    tree = [0] * (4 * n)

    def build(node, lo, hi):
        if lo == hi:
            tree[node] = baskets[lo]
            return
        mid = (lo + hi) // 2
        build(node * 2, lo, mid)
        build(node * 2 + 1, mid + 1, hi)
        tree[node] = max(tree[node * 2], tree[node * 2 + 1])

    def place(node, lo, hi, f):
        if tree[node] < f:
            return -1
        if lo == hi:
            tree[node] = 0
            return lo
        mid = (lo + hi) // 2
        if tree[node * 2] >= f:
            idx = place(node * 2, lo, mid, f)
        else:
            idx = place(node * 2 + 1, mid + 1, hi, f)
        tree[node] = max(tree[node * 2], tree[node * 2 + 1])
        return idx

    build(1, 0, n - 1)
    unplaced = 0
    for f in fruits:
        if place(1, 0, n - 1, f) == -1:
            unplaced += 1
    return unplaced`,
        c: `static int *tr, *bk;
static void build(int node, int lo, int hi) {
    if (lo == hi) { tr[node] = bk[lo]; return; }
    int mid = (lo + hi) / 2;
    build(node * 2, lo, mid);
    build(node * 2 + 1, mid + 1, hi);
    tr[node] = tr[node * 2] > tr[node * 2 + 1] ? tr[node * 2] : tr[node * 2 + 1];
}
static int place(int node, int lo, int hi, int f) {
    if (tr[node] < f) return -1;
    if (lo == hi) { tr[node] = 0; return lo; }
    int mid = (lo + hi) / 2, idx;
    if (tr[node * 2] >= f) idx = place(node * 2, lo, mid, f);
    else idx = place(node * 2 + 1, mid + 1, hi, f);
    tr[node] = tr[node * 2] > tr[node * 2 + 1] ? tr[node * 2] : tr[node * 2 + 1];
    return idx;
}
int numOfUnplacedFruits(int *fruits, int fruitsSize, int *baskets, int basketsSize) {
    int n = basketsSize;
    if (n == 0) return fruitsSize;
    tr = calloc(4 * n, sizeof(int));
    bk = baskets;
    build(1, 0, n - 1);
    int unplaced = 0;
    for (int i = 0; i < fruitsSize; i++)
        if (place(1, 0, n - 1, fruits[i]) == -1) unplaced++;
    free(tr);
    return unplaced;
}`,
        cpp: `class Solution {
    vector<int> tree;
    vector<int>* bk;
    void build(int node, int lo, int hi) {
        if (lo == hi) { tree[node] = (*bk)[lo]; return; }
        int mid = (lo + hi) / 2;
        build(node * 2, lo, mid);
        build(node * 2 + 1, mid + 1, hi);
        tree[node] = max(tree[node * 2], tree[node * 2 + 1]);
    }
    int place(int node, int lo, int hi, int f) {
        if (tree[node] < f) return -1;
        if (lo == hi) { tree[node] = 0; return lo; }
        int mid = (lo + hi) / 2, idx;
        if (tree[node * 2] >= f) idx = place(node * 2, lo, mid, f);
        else idx = place(node * 2 + 1, mid + 1, hi, f);
        tree[node] = max(tree[node * 2], tree[node * 2 + 1]);
        return idx;
    }
public:
    int numOfUnplacedFruits(vector<int>& fruits, vector<int>& baskets) {
        int n = baskets.size();
        if (n == 0) return fruits.size();
        tree.assign(4 * n, 0);
        bk = &baskets;
        build(1, 0, n - 1);
        int unplaced = 0;
        for (int f : fruits)
            if (place(1, 0, n - 1, f) == -1) unplaced++;
        return unplaced;
    }
};`,
        java: `class Solution {
    int[] tree, bk;

    void build(int node, int lo, int hi) {
        if (lo == hi) { tree[node] = bk[lo]; return; }
        int mid = (lo + hi) / 2;
        build(node * 2, lo, mid);
        build(node * 2 + 1, mid + 1, hi);
        tree[node] = Math.max(tree[node * 2], tree[node * 2 + 1]);
    }

    int place(int node, int lo, int hi, int f) {
        if (tree[node] < f) return -1;
        if (lo == hi) { tree[node] = 0; return lo; }
        int mid = (lo + hi) / 2, idx;
        if (tree[node * 2] >= f) idx = place(node * 2, lo, mid, f);
        else idx = place(node * 2 + 1, mid + 1, hi, f);
        tree[node] = Math.max(tree[node * 2], tree[node * 2 + 1]);
        return idx;
    }

    int numOfUnplacedFruits(int[] fruits, int[] baskets) {
        int n = baskets.length;
        if (n == 0) return fruits.length;
        tree = new int[4 * n];
        bk = baskets;
        build(1, 0, n - 1);
        int unplaced = 0;
        for (int f : fruits)
            if (place(1, 0, n - 1, f) == -1) unplaced++;
        return unplaced;
    }
}`,
      },
    },
  ],
  pitfalls: ['要找「最左」可用籃,線段樹下探時左子樹夠就一定先走左,不能貪最大容量', '籃子用過要設成不可能再選(0 或 −1)並沿路更新區間最大', '水果與籃子一對一,一個籃子不能塞兩顆'],
  check: {
    kind: 'fn',
    fn: 'numOfUnplacedFruits',
    cases: [
      { args: [[4, 2, 5], [3, 5, 4]], out: 1 },
      { args: [[3, 6, 1], [6, 4, 7]], out: 0 },
      { args: [[1], [1]], out: 0 },
      { args: [[5], [3]], out: 1 },
      { args: [[2, 2, 2], [1, 1, 1]], out: 3 },
    ],
  },
}

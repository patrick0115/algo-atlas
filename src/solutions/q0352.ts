import { arr } from '../engine/helpers'
import { intervalsView } from './fig'
import type { FigStep, Solution } from './types'

// 352. Data Stream as Disjoint Intervals

const ADD = [1, 3, 7, 2, 6]

function setFig(): FigStep[] {
  const seen = new Set<number>()
  const out: FigStep[] = []
  for (const x of ADD) {
    seen.add(x)
    const s = [...seen].sort((a, b) => a - b)
    const iv: number[][] = []
    for (const v of s) {
      if (iv.length && iv[iv.length - 1][1] === v - 1) iv[iv.length - 1][1] = v
      else iv.push([v, v])
    }
    out.push({ note: `addNum(${x}) → 集合 {${s.join(', ')}}。getIntervals 時從小到大掃,連續的數接成一段 → ${iv.map((p) => `[${p}]`).join(' ')}`, views: [arr(s, { label: '排序後的數' }), intervalsView(iv, { label: '區間' })] })
  }
  return out
}

function mergeFig(): FigStep[] {
  return [
    { note: '直接維護排好序、互不重疊的區間清單。加入 x 時用二分找到它該在的位置,看能不能和左邊或右邊的區間接上', views: [intervalsView([[1, 1], [3, 3], [7, 7]], { label: '加入 2 之前' })] },
    { note: '加入 2:左邊 [1,1] 的結尾是 1 = 2 − 1、右邊 [3,3] 的開頭是 3 = 2 + 1 → 兩邊一起合併成 [1,3]', views: [intervalsView([[1, 3], [7, 7]], { label: '加入 2 之後', cls: { 0: 'hl' } })] },
    { note: '加入 6:只能接到右邊 [7,7] → [6,7]。查詢時直接回傳清單,O(區間數)', views: [intervalsView([[1, 3], [6, 7]], { label: '加入 6 之後', cls: { 1: 'hl' } })] },
  ]
}

export const q0352: Solution = {
  id: 352,
  plain: '數字一個一個進來,隨時被問「目前收到的數字可以整理成哪些連續的區段?」例如收到 1、3、7、2,就是 [1,3] 和 [7,7]。',
  statement: '設計類別 `SummaryRanges`:`addNum(value)` 加入一個非負整數;`getIntervals()` 回傳目前所有數字組成的**不相交區間**,依起點排序。',
  examples: [
    { input: 'addNum(1), get, addNum(3), get, addNum(7), get, addNum(2), get, addNum(6), get', output: '[[1,1]] → [[1,1],[3,3]] → [[1,1],[3,3],[7,7]] → [[1,3],[7,7]] → [[1,3],[6,7]]' },
  ],
  constraints: ['0 ≤ value ≤ 10⁴', '最多 3·10⁴ 次呼叫', 'Follow-up:合併很多次、區間數相對資料量很少時怎麼辦?'],
  insight: ['簡單作法:用集合記收到哪些數,查詢時排序再把連續的接起來', '值的範圍只到 10⁴ → 也可以用布林陣列,查詢時從 0 掃到 10⁴', '查詢很多時:改成隨時維護排好序的區間,加入時二分找位置、和左右鄰居合併'],
  approaches: [
    {
      name: '有序集合,查詢時再組區間',
      idea: 'addNum 放進集合;getIntervals 把集合排序,連續的數接成一段。',
      steps: ['addNum:`seen.add(value)`', 'getIntervals:`for v in sorted(seen)`', '`v == 上一段結尾 + 1` → 延長;否則開新的一段'],
      figure: { title: `依序加入 ${ADD.join(', ')}`, steps: setFig() },
      complexity: { time: 'addNum O(1),getIntervals O(n log n)', space: 'O(n)', why: '每次查詢都要排序(值域小時可以用布林陣列換成 O(值域))。C++/Java 用平衡樹:addNum O(log n)、getIntervals O(n);C 用布林陣列:getIntervals O(10⁴)。' },
      verdict: '最好寫。查詢不多時很夠用。',
      code: {
        python: `class SummaryRanges:
    def __init__(self):
        self.seen = set()

    def addNum(self, value):
        self.seen.add(value)

    def getIntervals(self):
        res = []
        for v in sorted(self.seen):
            if res and res[-1][1] == v - 1:
                res[-1][1] = v                # 連續的,延長上一段
            else:
                res.append([v, v])
        return res`,
        c: `// 值域只有 0..10⁴:用布林陣列當集合,查詢時從小到大掃
typedef struct { bool has[10002]; } SummaryRanges;

SummaryRanges *summaryRangesCreate() { return calloc(1, sizeof(SummaryRanges)); }

void summaryRangesAddNum(SummaryRanges *o, int value) { o->has[value] = true; }

int **summaryRangesGetIntervals(SummaryRanges *o, int *retSize, int **retColSize) {
    int **res = malloc(5001 * sizeof(int *));
    *retSize = 0;
    for (int v = 0; v <= 10000; v++) {
        if (!o->has[v]) continue;
        int s = v;
        while (v + 1 <= 10000 && o->has[v + 1]) v++;
        res[*retSize] = malloc(2 * sizeof(int));
        res[*retSize][0] = s; res[*retSize][1] = v;
        (*retSize)++;
    }
    *retColSize = malloc((*retSize + 1) * sizeof(int));
    for (int i = 0; i < *retSize; i++) (*retColSize)[i] = 2;
    return res;
}

void summaryRangesFree(SummaryRanges *o) { free(o); }`,
        cpp: `class SummaryRanges {
    set<int> seen;
public:
    SummaryRanges() {}

    void addNum(int value) { seen.insert(value); }

    vector<vector<int>> getIntervals() {
        vector<vector<int>> res;
        for (int v : seen) {
            if (!res.empty() && res.back()[1] == v - 1) res.back()[1] = v;
            else res.push_back({v, v});
        }
        return res;
    }
};`,
        java: `class SummaryRanges {
    private final TreeSet<Integer> seen = new TreeSet<>();

    public SummaryRanges() {}

    public void addNum(int value) { seen.add(value); }

    public int[][] getIntervals() {
        List<int[]> res = new ArrayList<>();
        for (int v : seen) {
            if (!res.isEmpty() && res.get(res.size() - 1)[1] == v - 1) res.get(res.size() - 1)[1] = v;
            else res.add(new int[]{v, v});
        }
        return res.toArray(new int[0][]);
    }
}`,
        javascript: `class SummaryRanges {
  constructor() {
    this.seen = new Set();
  }

  addNum(value) {
    this.seen.add(value);
  }

  getIntervals() {
    const res = [];
    for (const v of [...this.seen].sort((a, b) => a - b)) {
      if (res.length && res[res.length - 1][1] === v - 1) res[res.length - 1][1] = v;
      else res.push([v, v]);
    }
    return res;
  }
}`,
      },
    },
    {
      name: '維護有序區間 + 二分合併',
      idea: '區間清單一直保持有序;addNum(x) 二分找到第一個起點 > x 的區間 i,看 x 是否已被 i−1 覆蓋、能否接上 i−1 或 i。',
      steps: ['`i` = 第一個 `start > x` 的區間', '`i − 1` 的區間已包含 x → 不動', '接得上左邊(`end == x − 1`)和右邊(`start == x + 1`)→ 合併三者', '只接得上一邊 → 延長那一邊;都不行 → 在 i 插入 [x, x]'],
      figure: { title: `依序加入 ${ADD.join(', ')}`, steps: mergeFig() },
      complexity: { time: 'addNum O(log k + k)(插入 / 刪除陣列元素),getIntervals O(k)', space: 'O(k)', why: 'k = 區間數;用平衡樹(TreeMap)可把 addNum 降到 O(log k)。' },
      verdict: 'Follow-up 的方向:合併很多、區間少時,直接維護區間比每次重組快。',
      code: {
        python: `from bisect import bisect_right

class SummaryRanges:
    def __init__(self):
        self.iv = []                          # 有序、不相交的 [start, end]

    def addNum(self, value):
        iv, x = self.iv, value
        i = bisect_right(iv, [x, float('inf')])   # 第一個 start > x 的區間
        if i > 0 and iv[i - 1][1] >= x:
            return                            # 已經被包含了
        left = i > 0 and iv[i - 1][1] == x - 1
        right = i < len(iv) and iv[i][0] == x + 1
        if left and right:
            iv[i - 1][1] = iv[i][1]           # 左右一起合併
            iv.pop(i)
        elif left:
            iv[i - 1][1] = x
        elif right:
            iv[i][0] = x
        else:
            iv.insert(i, [x, x])

    def getIntervals(self):
        return [p[:] for p in self.iv]`,
        c: `typedef struct { int (*iv)[2]; int n, cap; } SummaryRanges;

SummaryRanges *summaryRangesCreate() { return calloc(1, sizeof(SummaryRanges)); }

void summaryRangesAddNum(SummaryRanges *o, int x) {
    int lo = 0, hi = o->n;                    // 第一個 start > x
    while (lo < hi) { int m = (lo + hi) / 2; if (o->iv[m][0] > x) hi = m; else lo = m + 1; }
    int i = lo;
    if (i > 0 && o->iv[i - 1][1] >= x) return;
    bool left = i > 0 && o->iv[i - 1][1] == x - 1, right = i < o->n && o->iv[i][0] == x + 1;
    if (left && right) {
        o->iv[i - 1][1] = o->iv[i][1];
        memmove(o->iv + i, o->iv + i + 1, (o->n - i - 1) * sizeof(o->iv[0]));
        o->n--;
    } else if (left) o->iv[i - 1][1] = x;
    else if (right) o->iv[i][0] = x;
    else {
        if (o->n == o->cap) o->iv = realloc(o->iv, (o->cap = o->cap * 2 + 4) * sizeof(o->iv[0]));
        memmove(o->iv + i + 1, o->iv + i, (o->n - i) * sizeof(o->iv[0]));
        o->iv[i][0] = o->iv[i][1] = x;
        o->n++;
    }
}

int **summaryRangesGetIntervals(SummaryRanges *o, int *retSize, int **retColSize) {
    int **res = malloc((o->n + 1) * sizeof(int *));
    *retColSize = malloc((o->n + 1) * sizeof(int));
    for (int i = 0; i < o->n; i++) {
        res[i] = malloc(2 * sizeof(int));
        res[i][0] = o->iv[i][0]; res[i][1] = o->iv[i][1];
        (*retColSize)[i] = 2;
    }
    *retSize = o->n;
    return res;
}

void summaryRangesFree(SummaryRanges *o) { free(o->iv); free(o); }`,
        cpp: `class SummaryRanges {
    map<int, int> iv;                         // start → end
public:
    SummaryRanges() {}

    void addNum(int x) {
        auto r = iv.upper_bound(x);           // 第一個 start > x
        auto l = r == iv.begin() ? iv.end() : prev(r);
        if (l != iv.end() && l->second >= x) return;
        bool left = l != iv.end() && l->second == x - 1, right = r != iv.end() && r->first == x + 1;
        if (left && right) { l->second = r->second; iv.erase(r); }
        else if (left) l->second = x;
        else if (right) { int e = r->second; iv.erase(r); iv[x] = e; }
        else iv[x] = x;
    }

    vector<vector<int>> getIntervals() {
        vector<vector<int>> res;
        for (auto &[s, e] : iv) res.push_back({s, e});
        return res;
    }
};`,
        java: `class SummaryRanges {
    private final TreeMap<Integer, Integer> iv = new TreeMap<>();   // start → end

    public SummaryRanges() {}

    public void addNum(int x) {
        Map.Entry<Integer, Integer> l = iv.floorEntry(x), r = iv.higherEntry(x);
        if (l != null && l.getValue() >= x) return;
        boolean left = l != null && l.getValue() == x - 1, right = r != null && r.getKey() == x + 1;
        if (left && right) { iv.put(l.getKey(), r.getValue()); iv.remove(r.getKey()); }
        else if (left) iv.put(l.getKey(), x);
        else if (right) { iv.remove(r.getKey()); iv.put(x, r.getValue()); }
        else iv.put(x, x);
    }

    public int[][] getIntervals() {
        int[][] res = new int[iv.size()][];
        int i = 0;
        for (Map.Entry<Integer, Integer> e : iv.entrySet()) res[i++] = new int[]{e.getKey(), e.getValue()};
        return res;
    }
}`,
        javascript: `class SummaryRanges {
  constructor() {
    this.iv = [];
  }

  addNum(x) {
    const iv = this.iv;
    let lo = 0, hi = iv.length;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (iv[m][0] > x) hi = m;
      else lo = m + 1;
    }
    const i = lo;
    if (i > 0 && iv[i - 1][1] >= x) return;
    const left = i > 0 && iv[i - 1][1] === x - 1, right = i < iv.length && iv[i][0] === x + 1;
    if (left && right) {
      iv[i - 1][1] = iv[i][1];
      iv.splice(i, 1);
    } else if (left) iv[i - 1][1] = x;
    else if (right) iv[i][0] = x;
    else iv.splice(i, 0, [x, x]);
  }

  getIntervals() {
    return this.iv.map((p) => [...p]);
  }
}`,
      },
    },
  ],
  pitfalls: ['重複加入同一個數:要先檢查是否已經被某個區間包含', '左右都能接時只接一邊,會留下兩段相鄰的區間', 'getIntervals 直接回傳內部的陣列:外面改了會弄壞狀態'],
  check: {
    kind: 'class',
    cls: 'SummaryRanges',
    cases: [
      {
        ops: ['SummaryRanges', 'addNum', 'getIntervals', 'addNum', 'getIntervals', 'addNum', 'getIntervals', 'addNum', 'getIntervals', 'addNum', 'getIntervals'],
        args: [[], [1], [], [3], [], [7], [], [2], [], [6], []],
        out: [null, null, [[1, 1]], null, [[1, 1], [3, 3]], null, [[1, 1], [3, 3], [7, 7]], null, [[1, 3], [7, 7]], null, [[1, 3], [6, 7]]],
      },
      {
        ops: ['SummaryRanges', 'addNum', 'addNum', 'addNum', 'getIntervals', 'addNum', 'getIntervals'],
        args: [[], [5], [5], [0], [], [10000], []],
        out: [null, null, null, null, [[0, 0], [5, 5]], null, [[0, 0], [5, 5], [10000, 10000]]],
      },
    ],
  },
}

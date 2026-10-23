import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 554. Brick Wall

const WALL = [[1, 2, 2, 1], [3, 1, 2], [1, 3, 2], [2, 4], [3, 1, 2], [1, 3, 1, 1]]
const WIDTH = 6

/** 每一列畫成 WIDTH 格,同一塊磚用同一個編號;cut 標出垂直線右邊那一格 */
function wallView(cut?: number, label = '牆(同一個數字 = 同一塊磚)'): GridViewData {
  const cells = WALL.map((row) => {
    const r: number[] = []
    row.forEach((w, k) => {
      for (let t = 0; t < w; t++) r.push(k + 1)
    })
    return r
  })
  const hl: [number, number][] = []
  const cmp: [number, number][] = []
  if (cut !== undefined) {
    WALL.forEach((row, i) => {
      let s = 0
      const edges = new Set(row.slice(0, -1).map((w) => (s += w)))
      ;(edges.has(cut) ? cmp : hl).push([i, cut - 1], [i, cut])
    })
  }
  return { kind: 'grid', label, cells, colLabels: Array.from({ length: WIDTH }, (_, i) => String(i + 1)), marks: { hl, cmp } }
}

function edgeCounts(): Map<number, number> {
  const cnt = new Map<number, number>()
  for (const row of WALL) {
    let s = 0
    for (const w of row.slice(0, -1)) {
      s += w
      cnt.set(s, (cnt.get(s) ?? 0) + 1)
    }
  }
  return cnt
}

function hashFig(): FigStep[] {
  const cnt = new Map<number, number>()
  const out: FigStep[] = [{ note: '畫一條垂直線,線剛好落在磚與磚的「縫」上就不用切到那塊磚。所以要找:哪個位置的縫最多', views: [wallView()] }]
  WALL.forEach((row, i) => {
    let s = 0
    const here: number[] = []
    for (const w of row.slice(0, -1)) {
      s += w
      here.push(s)
      cnt.set(s, (cnt.get(s) ?? 0) + 1)
    }
    if (i < 2 || i === WALL.length - 1) out.push({ note: `第 ${i + 1} 列:寬度一路加起來(前綴和)就是縫的位置 ${here.join('、')}(最後一塊的右邊是牆的邊,不算)`, views: [arr(row, { label: `第 ${i + 1} 列的磚寬` }), kv([...cnt.entries()].sort((a, b) => a[0] - b[0]), '位置 → 縫的數量', here)] })
  })
  const best = [...cnt.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))
  out.push({ note: `縫最多的位置是 ${best[0]}(${best[1]} 條縫)→ 只切到 ${WALL.length} − ${best[1]} = ${WALL.length - best[1]} 塊磚`, views: [kv([...cnt.entries()].sort((a, b) => a[0] - b[0]), '位置 → 縫的數量', [best[0]]), wallView(best[0], `在位置 ${best[0]} 畫線:外框 = 線走在縫上(沒切到),實心 = 切到磚`)] })
  return out
}

function sortFig(): FigStep[] {
  const all: number[] = []
  for (const row of WALL) {
    let s = 0
    for (const w of row.slice(0, -1)) all.push((s += w))
  }
  const sorted = [...all].sort((a, b) => a - b)
  const cnt = edgeCounts()
  const best = [...cnt.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))
  const run = sorted.map((v, i) => (v === best[0] ? i : -1)).filter((i) => i >= 0)
  return [
    { note: '不用 Hash 表的話:把所有縫的位置收集起來', views: [arr(all, { label: '所有縫的位置' })] },
    { note: `排序後一樣的位置會排在一起,數最長的一段:${best[0]} 連續出現 ${best[1]} 次 → 答案 ${WALL.length - best[1]}`, views: [arr(sorted, { label: '排序後', highlight: run })] },
  ]
}

export const q0554: Solution = {
  id: 554,
  plain: '一面磚牆有好幾列,每列的磚寬度不同、但總寬一樣。你要從上到下畫一條直線,線經過磚的「縫」不算切到,經過磚的中間就算切到一塊。線要畫在哪,切到的磚最少?',
  statement: '`wall[i]` 是第 i 列每塊磚的寬度(每列總寬相同)。畫一條從上到下的垂直線(不能畫在牆的兩側邊緣),回傳它最少會穿過幾塊磚。',
  examples: [
    { input: 'wall = [[1,2,2,1],[3,1,2],[1,3,2],[2,4],[3,1,2],[1,3,1,1]]', output: '2', note: '線畫在位置 4,6 列裡有 4 列剛好是縫' },
    { input: 'wall = [[1],[1],[1]]', output: '3' },
  ],
  constraints: ['列數 ≤ 10⁴,磚的總數 ≤ 2·10⁴', '每列總寬可達 2³¹ − 1 → **不能**逐個位置去試,只能看縫'],
  insight: ['切到的磚 = 列數 − 經過的縫', '所以要找「縫最多的位置」', '每一列的縫位置 = 磚寬的**前綴和**(不含最後一塊)', '用 Hash 表數每個位置有幾條縫,取最大'],
  approaches: [
    {
      name: '前綴和 + Hash 表數縫',
      idea: '每列算前綴和(不含最後一塊),`cnt[位置] += 1`;答案 = 列數 − max(cnt)。',
      steps: ['`cnt = {}`', '每一列:`s = 0`,除了最後一塊,`s += w`、`cnt[s] += 1`', '回傳 `len(wall) − max(cnt.values(), 預設 0)`'],
      figure: { title: `wall = ${JSON.stringify(WALL)}`, steps: hashFig() },
      complexity: { time: 'O(磚數)', space: 'O(磚數)', why: '每塊磚處理一次;表裡最多有磚數那麼多個位置。' },
      verdict: '最推薦。把「切到幾塊」反過來想成「經過幾條縫」,就變成[[p:prefix-sum]] + [[p:hash-map]]的計數題。',
      code: {
        python: `def leastBricks(wall):
    cnt = {}
    for row in wall:
        s = 0
        for w in row[:-1]:                    # 最後一塊的右邊是牆的邊,不算縫
            s += w
            cnt[s] = cnt.get(s, 0) + 1
    return len(wall) - max(cnt.values(), default=0)`,
        c: `// C 沒有 Hash 表:收集所有縫的位置再排序數連續段
static int cmp(const void *a, const void *b) { long long x = *(long long *)a, y = *(long long *)b; return (x > y) - (x < y); }

int leastBricks(int **wall, int wallSize, int *wallColSize) {
    int total = 0;
    for (int i = 0; i < wallSize; i++) total += wallColSize[i];
    long long *pos = malloc((total + 1) * sizeof(long long));
    int m = 0;
    for (int i = 0; i < wallSize; i++) {
        long long s = 0;
        for (int j = 0; j + 1 < wallColSize[i]; j++) pos[m++] = s += wall[i][j];
    }
    qsort(pos, m, sizeof(long long), cmp);
    int best = 0;
    for (int i = 0, j; i < m; i = j) {
        for (j = i; j < m && pos[j] == pos[i]; j++) {}
        if (j - i > best) best = j - i;
    }
    free(pos);
    return wallSize - best;
}`,
        cpp: `int leastBricks(vector<vector<int>>& wall) {
    unordered_map<long long, int> cnt;
    int best = 0;
    for (auto &row : wall) {
        long long s = 0;
        for (size_t j = 0; j + 1 < row.size(); j++) best = max(best, ++cnt[s += row[j]]);
    }
    return wall.size() - best;
}`,
        java: `int leastBricks(List<List<Integer>> wall) {
    Map<Long, Integer> cnt = new HashMap<>();
    int best = 0;
    for (List<Integer> row : wall) {
        long s = 0;
        for (int j = 0; j + 1 < row.size(); j++) {
            s += row.get(j);
            best = Math.max(best, cnt.merge(s, 1, Integer::sum));
        }
    }
    return wall.size() - best;
}`,
        javascript: `function leastBricks(wall) {
  const cnt = new Map();
  let best = 0;
  for (const row of wall) {
    let s = 0;
    for (let j = 0; j + 1 < row.length; j++) {
      s += row[j];
      cnt.set(s, (cnt.get(s) ?? 0) + 1);
      best = Math.max(best, cnt.get(s));
    }
  }
  return wall.length - best;
}`,
      },
    },
    {
      name: '收集縫的位置 + 排序',
      idea: '把所有縫的位置放進一個陣列,排序後最長的連續相同段就是縫最多的位置。',
      steps: ['收集每列的前綴和(不含最後一塊)', '排序', '數最長的相同值連續段 best', '回傳 `len(wall) − best`'],
      figure: { title: '同一面牆', steps: sortFig() },
      complexity: { time: 'O(B log B)', space: 'O(B)', why: 'B = 磚數,排序的成本。' },
      verdict: '不需要 Hash 表,適合 C 這種沒有內建 Hash 表的語言;多了 log 的排序成本。',
      code: {
        python: `def leastBricks(wall):
    pos = []
    for row in wall:
        s = 0
        for w in row[:-1]:
            s += w
            pos.append(s)
    pos.sort()
    best = run = 0
    for i, p in enumerate(pos):
        run = run + 1 if i and pos[i - 1] == p else 1   # 和前一個一樣就延長這一段
        best = max(best, run)
    return len(wall) - best`,
        c: `static int cmp(const void *a, const void *b) { long long x = *(long long *)a, y = *(long long *)b; return (x > y) - (x < y); }

int leastBricks(int **wall, int wallSize, int *wallColSize) {
    int total = 0;
    for (int i = 0; i < wallSize; i++) total += wallColSize[i];
    long long *pos = malloc((total + 1) * sizeof(long long));
    int m = 0;
    for (int i = 0; i < wallSize; i++) {
        long long s = 0;
        for (int j = 0; j + 1 < wallColSize[i]; j++) pos[m++] = s += wall[i][j];
    }
    qsort(pos, m, sizeof(long long), cmp);
    int best = 0, run = 0;
    for (int i = 0; i < m; i++) {
        run = i && pos[i - 1] == pos[i] ? run + 1 : 1;
        if (run > best) best = run;
    }
    free(pos);
    return wallSize - best;
}`,
        cpp: `int leastBricks(vector<vector<int>>& wall) {
    vector<long long> pos;
    for (auto &row : wall) {
        long long s = 0;
        for (size_t j = 0; j + 1 < row.size(); j++) pos.push_back(s += row[j]);
    }
    sort(pos.begin(), pos.end());
    int best = 0, run = 0;
    for (size_t i = 0; i < pos.size(); i++) {
        run = i && pos[i - 1] == pos[i] ? run + 1 : 1;
        best = max(best, run);
    }
    return wall.size() - best;
}`,
        java: `int leastBricks(List<List<Integer>> wall) {
    List<Long> pos = new ArrayList<>();
    for (List<Integer> row : wall) {
        long s = 0;
        for (int j = 0; j + 1 < row.size(); j++) pos.add(s += row.get(j));
    }
    Collections.sort(pos);
    int best = 0, run = 0;
    for (int i = 0; i < pos.size(); i++) {
        run = i > 0 && pos.get(i - 1).equals(pos.get(i)) ? run + 1 : 1;
        best = Math.max(best, run);
    }
    return wall.size() - best;
}`,
        javascript: `function leastBricks(wall) {
  const pos = [];
  for (const row of wall) {
    let s = 0;
    for (let j = 0; j + 1 < row.length; j++) pos.push((s += row[j]));
  }
  pos.sort((a, b) => a - b);
  let best = 0, run = 0;
  pos.forEach((p, i) => {
    run = i && pos[i - 1] === p ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return wall.length - best;
}`,
      },
    },
  ],
  pitfalls: ['把最後一塊的右邊也算成縫:那是牆的邊緣,不能畫線', '每列只有一塊磚時沒有任何縫 → max 要有預設 0', '總寬可達 2³¹ − 1,前綴和用 64 位元比較保險'],
  check: {
    kind: 'fn',
    fn: 'leastBricks',
    cases: [
      { args: [WALL], out: 2 },
      { args: [[[1], [1], [1]]], out: 3 },
      { args: [[[1, 1], [2], [1, 1]]], out: 1 },
      { args: [[[100000000, 100000000], [100000000, 100000000]]], out: 0 },
    ],
  },
}

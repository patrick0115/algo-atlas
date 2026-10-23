import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 149. Max Points on a Line

const P = [[1, 1], [3, 2], [5, 3], [4, 1], [2, 3], [1, 4]]
const SIZE = 6

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))

/** 座標平面:y 往上,格子上標點的編號 */
function plane(hl: number[] = [], cmp: number[] = [], label = '平面上的點(數字 = 點的編號)'): GridViewData {
  const cells: (number | string)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(''))
  P.forEach(([x, y], i) => (cells[SIZE - 1 - y][x] = i))
  const at = (i: number): [number, number] => [SIZE - 1 - P[i][1], P[i][0]]
  return { kind: 'grid', label, cells, rowLabels: Array.from({ length: SIZE }, (_, r) => String(SIZE - 1 - r)), colLabels: Array.from({ length: SIZE }, (_, c) => String(c)), marks: { hl: hl.map(at), cmp: cmp.map(at) } }
}

function slopeKey(dx: number, dy: number): string {
  const g = gcd(dx, dy)
  dx /= g
  dy /= g
  if (dx < 0 || (dx === 0 && dy < 0)) {
    dx = -dx
    dy = -dy
  }
  return `${dy}/${dx}`
}

function hashFig(): FigStep[] {
  const out: FigStep[] = [{ note: '固定一個點當「軸心」,看其他點和它連線的**斜率**。斜率一樣 = 在同一條穿過軸心的直線上', views: [plane()] }]
  let best = 0
  P.forEach(([x0, y0], i) => {
    const cnt = new Map<string, number>()
    for (let j = i + 1; j < P.length; j++) {
      const k = slopeKey(P[j][0] - x0, P[j][1] - y0)
      cnt.set(k, (cnt.get(k) ?? 0) + 1)
    }
    if (!cnt.size) return
    const [bk, bv] = [...cnt.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))
    best = Math.max(best, bv + 1)
    if (i <= 1) {
      const same = P.map((_, j) => j).filter((j) => j > i && slopeKey(P[j][0] - x0, P[j][1] - y0) === bk)
      out.push({ note: `軸心 = 點 ${i}(${x0}, ${y0}):和後面每個點算斜率 Δy/Δx(約分成最簡分數)。斜率 ${bk} 出現 ${bv} 次 → 這條線上有 ${bv} + 1 = ${bv + 1} 個點`, views: [plane([i], same), kv([...cnt.entries()], '斜率 → 個數', [bk])] })
    }
  })
  out.push({ note: `每個點都當過軸心後取最大:點 1、3、4、5 在斜率 −1 的線上,共 ${best} 個點(點 0、1、2 那條斜率 1/2 的只有 3 個)`, views: [plane([1, 3, 4, 5], [], `答案 ${best}`)] })
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:任選兩點 A、B 決定一條線,再檢查其他每個點 C 在不在這條線上', views: [plane([0, 1])] },
    { note: '判斷 C 在不在 AB 線上用**叉積**:`(B−A) × (C−A) = 0` ⇔ 共線。全是整數乘法,沒有除法也沒有誤差。點 2 共線、其他不共線 → 3 個', views: [plane([0, 1], [2])] },
  ]
}

export const q0149: Solution = {
  id: 149,
  plain: '紙上點了一堆點,拿一把尺畫一條直線,最多能同時穿過幾個點?',
  statement: '給平面上 n 個**相異**的點 `points[i] = [x, y]`,回傳同一條直線上最多有幾個點。',
  examples: [
    { input: 'points = [[1,1],[2,2],[3,3]]', output: '3' },
    { input: 'points = [[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]]', output: '4', note: '(3,2)、(4,1)、(2,3)、(1,4) 在同一條斜率 −1 的線上' },
  ],
  constraints: ['n ≤ 300 → O(n²) 約 9 萬,O(n³) 約 2700 萬也勉強可以', '座標在 −10⁴ ~ 10⁴', '點都不重複'],
  insight: ['兩點決定一條線;同一條線上的點,和某個固定點連線的**斜率都一樣**', '固定一個點,其他點依斜率分組,最大組 + 1 就是穿過這點的最佳直線', '斜率不要用浮點數:存成約分後的 (Δy, Δx),並統一正負號(Δx 為正;垂直線 Δx = 0 時 Δy 為正)'],
  approaches: [
    {
      name: '固定一點 + 斜率 Hash 計數',
      idea: '對每個點 i,其他點 j > i 依 `(dy/g, dx/g)` 分組計數;`best = max(best, 最大組 + 1)`。',
      steps: ['`for i`:`cnt = {}`', '`for j > i`:`dx, dy = xj−xi, yj−yi`;除以 `gcd(|dx|, |dy|)`;統一正負號', '`cnt[(dy, dx)] += 1`', '`best = max(best, max(cnt) + 1)`'],
      figure: { title: `points = ${JSON.stringify(P)}`, steps: hashFig() },
      complexity: { time: 'O(n² log V)', space: 'O(n)', why: '每對點算一次 gcd;每輪的表最多 n 項。' },
      verdict: '最推薦。注意兩個細節:約分要用絕對值的 gcd,正負號要統一,否則 (1, 2) 和 (−1, −2) 會被當成不同斜率。',
      code: {
        python: `from math import gcd

def maxPoints(points):
    n, best = len(points), 1
    for i in range(n):
        cnt = {}
        x0, y0 = points[i]
        for j in range(i + 1, n):
            dx, dy = points[j][0] - x0, points[j][1] - y0
            g = gcd(dx, dy)                   # Python 的 gcd 回傳非負數
            dx, dy = dx // g, dy // g
            if dx < 0 or (dx == 0 and dy < 0):
                dx, dy = -dx, -dy             # 統一方向:(−1,−2) 和 (1,2) 是同一個斜率
            cnt[(dy, dx)] = cnt.get((dy, dx), 0) + 1
            best = max(best, cnt[(dy, dx)] + 1)
    return best`,
        c: `// 每個軸心把約分後的斜率編成一個數,排序後數最長的連續段
static int gcdi(int a, int b) { a = abs(a); b = abs(b); while (b) { int t = a % b; a = b; b = t; } return a; }
static int cmp(const void *a, const void *b) { long long x = *(long long *)a, y = *(long long *)b; return (x > y) - (x < y); }

int maxPoints(int **points, int pointsSize, int *pointsColSize) {
    int n = pointsSize, best = 1;
    long long *key = malloc(n * sizeof(long long));
    for (int i = 0; i < n; i++) {
        int m = 0;
        for (int j = i + 1; j < n; j++) {
            int dx = points[j][0] - points[i][0], dy = points[j][1] - points[i][1], g = gcdi(dx, dy);
            dx /= g; dy /= g;
            if (dx < 0 || (dx == 0 && dy < 0)) { dx = -dx; dy = -dy; }
            key[m++] = (long long)(dy + 20001) * 40003 + dx;   // 兩個分量都 < 40003,編碼不會撞
        }
        qsort(key, m, sizeof(long long), cmp);
        for (int a = 0, b; a < m; a = b) {
            for (b = a; b < m && key[b] == key[a]; b++) {}
            if (b - a + 1 > best) best = b - a + 1;
        }
    }
    free(key);
    return best;
}`,
        cpp: `int maxPoints(vector<vector<int>>& points) {
    int n = points.size(), best = 1;
    for (int i = 0; i < n; i++) {
        map<pair<int, int>, int> cnt;
        for (int j = i + 1; j < n; j++) {
            int dx = points[j][0] - points[i][0], dy = points[j][1] - points[i][1];
            int g = gcd(abs(dx), abs(dy));
            dx /= g; dy /= g;
            if (dx < 0 || (dx == 0 && dy < 0)) { dx = -dx; dy = -dy; }
            best = max(best, ++cnt[{dy, dx}] + 1);
        }
    }
    return best;
}`,
        java: `int maxPoints(int[][] points) {
    int n = points.length, best = 1;
    for (int i = 0; i < n; i++) {
        Map<Long, Integer> cnt = new HashMap<>();
        for (int j = i + 1; j < n; j++) {
            int dx = points[j][0] - points[i][0], dy = points[j][1] - points[i][1];
            int g = gcd(Math.abs(dx), Math.abs(dy));
            dx /= g; dy /= g;
            if (dx < 0 || (dx == 0 && dy < 0)) { dx = -dx; dy = -dy; }
            long key = (long) (dy + 20001) * 40003 + dx;
            best = Math.max(best, cnt.merge(key, 1, Integer::sum) + 1);
        }
    }
    return best;
}

private int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }`,
        javascript: `function maxPoints(points) {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const n = points.length;
  let best = 1;
  for (let i = 0; i < n; i++) {
    const cnt = new Map();
    for (let j = i + 1; j < n; j++) {
      let dx = points[j][0] - points[i][0], dy = points[j][1] - points[i][1];
      const g = gcd(Math.abs(dx), Math.abs(dy));
      dx /= g;
      dy /= g;
      if (dx < 0 || (dx === 0 && dy < 0)) [dx, dy] = [-dx, -dy];
      const key = dy + '/' + dx;
      cnt.set(key, (cnt.get(key) ?? 0) + 1);
      best = Math.max(best, cnt.get(key) + 1);
    }
  }
  return best;
}`,
      },
    },
    {
      name: '任兩點定線 + 叉積檢查',
      idea: '每對 (i, j) 決定一條線,再數有幾個點 k 滿足叉積 `(pj−pi) × (pk−pi) = 0`。',
      steps: ['`for i < j`:`cnt = 0`', '`for k`:`(xj−xi)(yk−yi) − (yj−yi)(xk−xi) == 0` → `cnt += 1`', '`best = max(best, cnt)`'],
      figure: { title: `points = ${JSON.stringify(P)}`, steps: bruteFig() },
      complexity: { time: 'O(n³)', space: 'O(1)', why: 'n² 條線,每條檢查 n 個點;n = 300 時約 2700 萬次,還能過。' },
      verdict: '完全不用 Hash 也不用約分,最不容易寫錯。n 再大就不行了。',
      code: {
        python: `def maxPoints(points):
    n = len(points)
    if n <= 2:
        return n
    best = 2
    for i in range(n):
        x1, y1 = points[i]
        for j in range(i + 1, n):
            dx, dy = points[j][0] - x1, points[j][1] - y1
            # 叉積為 0 ⇔ 第 k 點在 i、j 決定的直線上(i、j 自己也算)
            cnt = sum(1 for x, y in points if dx * (y - y1) == dy * (x - x1))
            best = max(best, cnt)
    return best`,
        c: `int maxPoints(int **points, int pointsSize, int *pointsColSize) {
    int n = pointsSize, best = n < 2 ? n : 2;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            long long dx = points[j][0] - points[i][0], dy = points[j][1] - points[i][1];
            int cnt = 0;
            for (int k = 0; k < n; k++)
                if (dx * (points[k][1] - points[i][1]) == dy * (points[k][0] - points[i][0])) cnt++;
            if (cnt > best) best = cnt;
        }
    return best;
}`,
        cpp: `int maxPoints(vector<vector<int>>& points) {
    int n = points.size(), best = min(n, 2);
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            long long dx = points[j][0] - points[i][0], dy = points[j][1] - points[i][1];
            int cnt = 0;
            for (auto &p : points)
                if (dx * (p[1] - points[i][1]) == dy * (p[0] - points[i][0])) cnt++;
            best = max(best, cnt);
        }
    return best;
}`,
        java: `int maxPoints(int[][] points) {
    int n = points.length, best = Math.min(n, 2);
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            long dx = points[j][0] - points[i][0], dy = points[j][1] - points[i][1];
            int cnt = 0;
            for (int[] p : points)
                if (dx * (p[1] - points[i][1]) == dy * (p[0] - points[i][0])) cnt++;
            best = Math.max(best, cnt);
        }
    return best;
}`,
        javascript: `function maxPoints(points) {
  const n = points.length;
  let best = Math.min(n, 2);
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const dx = points[j][0] - points[i][0], dy = points[j][1] - points[i][1];
      let cnt = 0;
      for (const [x, y] of points) if (dx * (y - points[i][1]) === dy * (x - points[i][0])) cnt++;
      best = Math.max(best, cnt);
    }
  return best;
}`,
      },
    },
  ],
  pitfalls: ['斜率用浮點數:精度問題,而且垂直線會除以 0', '約分後沒有統一正負號:(1, 2) 和 (−1, −2) 被算成兩種', '只有一個點時答案是 1,不是 0'],
  check: {
    kind: 'fn',
    fn: 'maxPoints',
    cases: [
      { args: [[[1, 1], [2, 2], [3, 3]]], out: 3 },
      { args: [P], out: 4 },
      { args: [[[0, 0]]], out: 1 },
      { args: [[[0, 0], [0, 5], [0, -3], [1, 1]]], out: 3 },
      { args: [[[0, 0], [2, 4], [-1, -2], [3, 5]]], out: 3 },
    ],
  },
}

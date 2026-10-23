import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 2001. Number of Pairs of Interchangeable Rectangles

const R = [[4, 8], [3, 6], [10, 20], [15, 30], [2, 3]]

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

function hashFig(): FigStep[] {
  const cnt = new Map<string, number>()
  let ans = 0
  const out: FigStep[] = [{ note: '「可互換」= 寬高比一樣。比例用小數存會有誤差,改成**約分後的分數**:寬、高都除以最大公因數', views: [arr(R.map(([w, h]) => `${w}×${h}`), { label: '矩形' })] }]
  R.forEach(([w, h], i) => {
    const g = gcd(w, h)
    const key = `${w / g}:${h / g}`
    const before = cnt.get(key) ?? 0
    ans += before
    cnt.set(key, before + 1)
    out.push({ note: `${w}×${h} → 除以 gcd ${g} → ${key}。前面已經有 ${before} 個同比例的,每個都能和它配成一對 → 答案 + ${before} = ${ans}`, views: [arr(R.map(([a, b]) => `${a}×${b}`), { label: '矩形', highlight: [i], done: Array.from({ length: i }, (_, k) => k) }), kv([...cnt.entries()], '比例 → 已出現幾個', [key])] })
  })
  out.push({ note: `答案 ${ans}。同一組有 c 個時,總共 c·(c−1)/2 對;邊掃邊加「前面有幾個」是同一件事`, views: [kv([...cnt.entries()], '比例 → 個數')] })
  return out
}

function sortFig(): FigStep[] {
  const s = [...R].sort((a, b) => a[0] * b[1] - b[0] * a[1])
  return [
    { note: '不用 Hash 表:依比例排序。比較 w1/h1 和 w2/h2 時用交叉相乘 `w1·h2` vs `w2·h1`,完全沒有小數誤差', views: [arr(R.map(([w, h]) => `${w}×${h}`), { label: '原本' })] },
    { note: '排序後同比例的會連在一起:2×3 自己一段;另外四個比例都是 1:2,一段 4 個 → 4·3/2 = 6 對', views: [arr(s.map(([w, h]) => `${w}×${h}`), { label: '依比例排序', highlight: [0, 1, 2, 3] })] },
  ]
}

export const q2001: Solution = {
  id: 2001,
  plain: '一堆長方形相框,如果兩個相框的「長寬比例」一樣(例如 4×8 和 3×6 都是 1:2),一張照片放大縮小就能在兩個框都剛好放進去,就說它們可以互換。問總共有幾對可以互換。',
  statement: '`rectangles[i] = [寬, 高]`。若兩個矩形 `w1/h1 == w2/h2`(實數除法)就稱為可互換,回傳可互換的**索引對** `(i, j)`(i < j)數量。',
  examples: [
    { input: 'rectangles = [[4,8],[3,6],[10,20],[15,30]]', output: '6', note: '四個都是 1:2,任選兩個 = 4·3/2 = 6' },
    { input: 'rectangles = [[4,5],[7,8]]', output: '0' },
  ],
  constraints: ['n ≤ 10⁵ → 兩兩比較 O(n²) 太慢', '寬、高 ≤ 10⁵', '答案可能超過 int(10⁵ 個全同比例時約 5·10⁹)→ 用 64 位元'],
  insight: ['同比例的分成一組,每組 c 個貢獻 `c·(c−1)/2` 對', '比例當 Hash 鍵:浮點數可能有誤差,用**約分後的 (w/g, h/g)** 最安全', '邊掃邊數更簡單:新來一個,和前面同比例的每個都能配對 → 答案加上「前面幾個」'],
  approaches: [
    {
      name: '約分當鍵 + Hash 表計數',
      idea: '`key = (w/g, h/g)`,g = gcd(w, h);`ans += cnt[key]`,再 `cnt[key] += 1`。',
      steps: ['`cnt = {}`、`ans = 0`', '每個矩形:`g = gcd(w, h)`、`key = (w // g, h // g)`', '`ans += cnt[key]`;`cnt[key] += 1`', '回傳 ans'],
      figure: { title: `rectangles = ${JSON.stringify(R)}`, steps: hashFig() },
      complexity: { time: 'O(n log V)', space: 'O(n)', why: '每個矩形算一次 gcd(log V)、查一次表。' },
      verdict: '最推薦。「比例相等」的題目都用約分後的分數當鍵,不要用浮點數。',
      code: {
        python: `from math import gcd

def interchangeableRectangles(rectangles):
    cnt, ans = {}, 0
    for w, h in rectangles:
        g = gcd(w, h)
        key = (w // g, h // g)                # 約分後的比例,沒有浮點誤差
        ans += cnt.get(key, 0)                # 和前面每個同比例的配一對
        cnt[key] = cnt.get(key, 0) + 1
    return ans`,
        c: `// C 沒有 Hash 表:把約分後的比例編成一個 64 位元數,排序後數連續段
static long long gcdll(long long a, long long b) { return b ? gcdll(b, a % b) : a; }
static int cmp(const void *a, const void *b) { long long x = *(long long *)a, y = *(long long *)b; return (x > y) - (x < y); }

long long interchangeableRectangles(int **rectangles, int n, int *colSize) {
    long long *key = malloc(n * sizeof(long long));
    for (int i = 0; i < n; i++) {
        long long w = rectangles[i][0], h = rectangles[i][1], g = gcdll(w, h);
        key[i] = (w / g) * 200000 + h / g;          // 高 < 200000,不會撞
    }
    qsort(key, n, sizeof(long long), cmp);
    long long ans = 0;
    for (int i = 0, j; i < n; i = j) {
        for (j = i; j < n && key[j] == key[i]; j++) {}
        ans += (long long)(j - i) * (j - i - 1) / 2;
    }
    free(key);
    return ans;
}`,
        cpp: `long long interchangeableRectangles(vector<vector<int>>& rectangles) {
    map<pair<int, int>, long long> cnt;
    long long ans = 0;
    for (auto &r : rectangles) {
        int g = gcd(r[0], r[1]);
        ans += cnt[{r[0] / g, r[1] / g}]++;
    }
    return ans;
}`,
        java: `long interchangeableRectangles(int[][] rectangles) {
    Map<Long, Integer> cnt = new HashMap<>();
    long ans = 0;
    for (int[] r : rectangles) {
        int g = gcd(r[0], r[1]);
        long key = (long) (r[0] / g) * 200000 + r[1] / g;
        int c = cnt.getOrDefault(key, 0);
        ans += c;
        cnt.put(key, c + 1);
    }
    return ans;
}

private int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }`,
        javascript: `function interchangeableRectangles(rectangles) {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const cnt = new Map();
  let ans = 0;
  for (const [w, h] of rectangles) {
    const g = gcd(w, h), key = w / g + ':' + h / g;
    const c = cnt.get(key) ?? 0;
    ans += c;
    cnt.set(key, c + 1);
  }
  return ans;
}`,
      },
    },
    {
      name: '交叉相乘排序 + 數連續段',
      idea: '依比例排序(比較 `w1·h2` 與 `w2·h1`),同比例的會連在一起,每段 c 個貢獻 `c·(c−1)/2`。',
      steps: ['用交叉相乘當比較函式排序', '掃過去找出比例相同的連續段', '每段長度 c → `ans += c·(c−1)/2`'],
      figure: { title: `rectangles = ${JSON.stringify(R)}`, steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(1) ~ O(n)', why: '排序的成本;比較時不用 gcd。' },
      verdict: '不用 gcd、也不用 Hash 表,只靠整數乘法就完全精確。乘積可達 10¹⁰,要用 64 位元。',
      code: {
        python: `from functools import cmp_to_key

def interchangeableRectangles(rectangles):
    rs = sorted(rectangles, key=cmp_to_key(lambda a, b: a[0] * b[1] - b[0] * a[1]))
    ans, i, n = 0, 0, len(rs)
    while i < n:
        j = i
        while j < n and rs[j][0] * rs[i][1] == rs[i][0] * rs[j][1]:   # 同比例
            j += 1
        c = j - i
        ans += c * (c - 1) // 2
        i = j
    return ans`,
        c: `static int cmpR(const void *a, const void *b) {
    const int *x = *(const int **)a, *y = *(const int **)b;
    long long l = (long long)x[0] * y[1], r = (long long)y[0] * x[1];
    return (l > r) - (l < r);
}

long long interchangeableRectangles(int **rectangles, int n, int *colSize) {
    qsort(rectangles, n, sizeof(int *), cmpR);
    long long ans = 0;
    for (int i = 0, j; i < n; i = j) {
        for (j = i; j < n && (long long)rectangles[j][0] * rectangles[i][1] == (long long)rectangles[i][0] * rectangles[j][1]; j++) {}
        ans += (long long)(j - i) * (j - i - 1) / 2;
    }
    return ans;
}`,
        cpp: `long long interchangeableRectangles(vector<vector<int>>& rectangles) {
    auto same = [](const vector<int> &a, const vector<int> &b) { return (long long)a[0] * b[1] == (long long)b[0] * a[1]; };
    sort(rectangles.begin(), rectangles.end(), [](const vector<int> &a, const vector<int> &b) {
        return (long long)a[0] * b[1] < (long long)b[0] * a[1];
    });
    long long ans = 0;
    int n = rectangles.size();
    for (int i = 0, j; i < n; i = j) {
        for (j = i; j < n && same(rectangles[i], rectangles[j]); j++) {}
        ans += (long long)(j - i) * (j - i - 1) / 2;
    }
    return ans;
}`,
        java: `long interchangeableRectangles(int[][] rectangles) {
    Arrays.sort(rectangles, (a, b) -> Long.compare((long) a[0] * b[1], (long) b[0] * a[1]));
    long ans = 0;
    int n = rectangles.length;
    for (int i = 0, j; i < n; i = j) {
        for (j = i; j < n && (long) rectangles[j][0] * rectangles[i][1] == (long) rectangles[i][0] * rectangles[j][1]; j++) {}
        ans += (long) (j - i) * (j - i - 1) / 2;
    }
    return ans;
}`,
        javascript: `function interchangeableRectangles(rectangles) {
  const rs = [...rectangles].sort((a, b) => a[0] * b[1] - b[0] * a[1]);
  let ans = 0;
  for (let i = 0, j; i < rs.length; i = j) {
    for (j = i; j < rs.length && rs[j][0] * rs[i][1] === rs[i][0] * rs[j][1]; j++) {}
    ans += ((j - i) * (j - i - 1)) / 2;
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['用 `w / h` 的浮點數當鍵:不同的比例可能算出一樣的近似值(或反過來)', '答案用 int 會溢位', '交叉相乘時兩個 10⁵ 相乘超過 int,要先轉 64 位元'],
  check: {
    kind: 'fn',
    fn: 'interchangeableRectangles',
    cases: [
      { args: [[[4, 8], [3, 6], [10, 20], [15, 30]]], out: 6 },
      { args: [[[4, 5], [7, 8]]], out: 0 },
      { args: [R], out: 6 },
      { args: [[[1, 1]]], out: 0 },
      { args: [[[2, 4], [1, 2], [3, 1], [6, 2], [9, 3]]], out: 4 },
    ],
  },
}

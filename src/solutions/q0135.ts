import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 135. Candy

const R = [1, 3, 4, 5, 2]

function twoPassFig(): FigStep[] {
  return [
    { note: '規則:每人至少 1 顆;分數比鄰居高的,糖果要比那個鄰居多。兩個方向的限制分開處理', views: [arr(R, { label: 'ratings', mode: 'bars' })] },
    { note: '① 由左往右:比左邊高 → 左邊 + 1,否則 1。這樣滿足所有「比左鄰高」的限制', views: [arr([1, 2, 3, 4, 1], { label: 'left', mode: 'bars' })] },
    { note: '② 由右往左:比右邊高 → 右邊 + 1,否則 1。滿足所有「比右鄰高」的限制', views: [arr([1, 1, 1, 2, 1], { label: 'right', mode: 'bars' })] },
    { note: '每個人取 max(left, right) 就同時滿足兩邊,而且是最少的。總和 1 + 2 + 3 + 4 + 1 = 11', views: [arr([1, 2, 3, 4, 1], { label: 'candy', mode: 'bars', done: [0, 1, 2, 3, 4] }), arr([11], { label: '答案', done: [0] })] },
  ]
}

function slopeFig(): FigStep[] {
  return [
    { note: 'O(1) 空間:把分數看成山坡。上坡長度 up、下坡長度 down;上坡時每人比前一人多 1,下坡時「整段下坡的人都要再多 1」', views: [arr(R, { label: 'ratings', mode: 'bars', highlight: [3] })] },
    { note: '上坡 1→3→4→5 給 1、2、3、4;下坡 5→2:down = 1,加 1 顆。若下坡長度超過山頂的上坡長度,山頂也要再加 1', views: [arr([1, 2, 3, 4, 1], { label: 'candy', mode: 'bars', done: [0, 1, 2, 3, 4] })] },
  ]
}

export const q0135: Solution = {
  id: 135,
  plain: '一排小朋友各有一個分數,要發糖果:每人至少一顆,而且分數比旁邊的人高的,糖果一定要比那個人多。最少要準備幾顆?',
  statement: 'n 個孩子站成一排,`ratings[i]` 是評分。分糖果要求:每個孩子至少 1 顆;評分比相鄰孩子高的孩子,糖果要比該鄰居多。回傳最少需要的糖果數。',
  examples: [
    { input: 'ratings = [1,0,2]', output: '5', note: '2, 1, 2' },
    { input: 'ratings = [1,2,2]', output: '4', note: '1, 2, 1(分數相同沒有限制)' },
  ],
  constraints: ['n ≤ 2·10⁴'],
  insight: ['左右兩種限制互不干擾 → 各掃一次', '每人取兩邊要求的最大值就同時滿足', '分數相同的鄰居沒有限制,可以給 1'],
  approaches: [
    {
      name: '左右各掃一次',
      idea: '`left[i]` 只看左鄰、`right[i]` 只看右鄰;答案 `Σ max(left[i], right[i])`。',
      steps: ['`left = [1] * n`;`for i in 1..n−1`:`r[i] > r[i−1]` → `left[i] = left[i−1] + 1`', '`right = [1] * n`;反向同理', '`sum(max(left[i], right[i]))`'],
      figure: { title: `ratings = [${R}]`, steps: twoPassFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '兩次掃描、兩個陣列(可以合併成一個)。' },
      verdict: '最推薦,[[p:greedy]]的經典「兩個方向分開滿足」。',
      code: {
        python: `def candy(ratings):
    n = len(ratings)
    c = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            c[i] = c[i - 1] + 1               # 比左邊高:比左邊多一顆
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            c[i] = max(c[i], c[i + 1] + 1)    # 比右邊高:也要比右邊多
    return sum(c)`,
        c: `int candy(int *ratings, int ratingsSize) {
    int n = ratingsSize, *c = malloc(n * sizeof(int)), sum = 0;
    for (int i = 0; i < n; i++) c[i] = 1;
    for (int i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
    for (int i = n - 2; i >= 0; i--)
        if (ratings[i] > ratings[i + 1] && c[i] < c[i + 1] + 1) c[i] = c[i + 1] + 1;
    for (int i = 0; i < n; i++) sum += c[i];
    free(c);
    return sum;
}`,
        cpp: `int candy(vector<int>& ratings) {
    int n = ratings.size();
    vector<int> c(n, 1);
    for (int i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
    for (int i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = max(c[i], c[i + 1] + 1);
    return accumulate(c.begin(), c.end(), 0);
}`,
        java: `int candy(int[] ratings) {
    int n = ratings.length, sum = 0;
    int[] c = new int[n];
    Arrays.fill(c, 1);
    for (int i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
    for (int i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);
    for (int x : c) sum += x;
    return sum;
}`,
        javascript: `function candy(ratings) {
  const n = ratings.length, c = new Array(n).fill(1);
  for (let i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
  for (let i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);
  return c.reduce((a, b) => a + b, 0);
}`,
      },
    },
    {
      name: '上下坡計數(O(1) 空間)',
      idea: '維護目前上坡長度 up、下坡長度 down、山頂高度 peak;上坡加 `up + 1`,下坡加 `down`(整段下坡各多 1),`down >= peak` 時山頂也再加 1。',
      steps: ['`total = 1`、`up = down = peak = 0`', '上升:`up += 1`、`peak = up`、`down = 0`、`total += up + 1`', '相等:`up = down = peak = 0`、`total += 1`', '下降:`down += 1`、`up = 0`、`total += down + (down > peak ? 1 : 0)`'],
      figure: { title: `ratings = [${R}]`, steps: slopeFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描、常數變數。' },
      verdict: '空間最省,但邊界很容易寫錯;理解兩次掃描版之後再看。',
      code: {
        python: `def candy(ratings):
    total, up, down, peak = 1, 0, 0, 0
    for i in range(1, len(ratings)):
        if ratings[i] > ratings[i - 1]:
            up += 1
            peak = up
            down = 0
            total += up + 1
        elif ratings[i] == ratings[i - 1]:
            up = down = peak = 0
            total += 1
        else:
            up = 0
            down += 1
            total += down + (1 if down > peak else 0)   # 下坡太長,山頂也要長高
    return total`,
        c: `int candy(int *ratings, int ratingsSize) {
    int total = 1, up = 0, down = 0, peak = 0;
    for (int i = 1; i < ratingsSize; i++) {
        if (ratings[i] > ratings[i - 1]) { up++; peak = up; down = 0; total += up + 1; }
        else if (ratings[i] == ratings[i - 1]) { up = down = peak = 0; total += 1; }
        else { up = 0; down++; total += down + (down > peak ? 1 : 0); }
    }
    return total;
}`,
        cpp: `int candy(vector<int>& ratings) {
    int total = 1, up = 0, down = 0, peak = 0;
    for (size_t i = 1; i < ratings.size(); i++) {
        if (ratings[i] > ratings[i - 1]) { up++; peak = up; down = 0; total += up + 1; }
        else if (ratings[i] == ratings[i - 1]) { up = down = peak = 0; total += 1; }
        else { up = 0; down++; total += down + (down > peak ? 1 : 0); }
    }
    return total;
}`,
        java: `int candy(int[] ratings) {
    int total = 1, up = 0, down = 0, peak = 0;
    for (int i = 1; i < ratings.length; i++) {
        if (ratings[i] > ratings[i - 1]) { up++; peak = up; down = 0; total += up + 1; }
        else if (ratings[i] == ratings[i - 1]) { up = down = peak = 0; total += 1; }
        else { up = 0; down++; total += down + (down > peak ? 1 : 0); }
    }
    return total;
}`,
        javascript: `function candy(ratings) {
  let total = 1, up = 0, down = 0, peak = 0;
  for (let i = 1; i < ratings.length; i++) {
    if (ratings[i] > ratings[i - 1]) {
      up++;
      peak = up;
      down = 0;
      total += up + 1;
    } else if (ratings[i] === ratings[i - 1]) {
      up = down = peak = 0;
      total += 1;
    } else {
      up = 0;
      down++;
      total += down + (down > peak ? 1 : 0);
    }
  }
  return total;
}`,
      },
    },
  ],
  pitfalls: ['只掃一個方向:"比右邊高" 的限制沒被滿足', '第二次掃描直接覆寫 `c[i] = c[i+1] + 1`:會破壞第一次掃描的結果,要取 max', '分數相同時也強制多給:題目沒有這個限制'],
  check: {
    kind: 'fn',
    fn: 'candy',
    cases: [
      { args: [[1, 0, 2]], out: 5 },
      { args: [[1, 2, 2]], out: 4 },
      { args: [R], out: 11 },
      { args: [[1, 3, 2, 2, 1]], out: 7 },
      { args: [[5, 4, 3, 2, 1]], out: 15 },
      { args: [[1, 2, 87, 87, 87, 2, 1]], out: 13 },
      { args: [[0]], out: 1 },
    ],
  },
}

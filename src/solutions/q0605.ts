import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 605. Can Place Flowers

const F = [1, 0, 0, 0, 0, 0, 1]

function greedyFig(): FigStep[] {
  const bed = [...F]
  const out: FigStep[] = [{ note: '花不能種在相鄰的格子。由左往右掃,只要「自己、左邊、右邊」都是空的就馬上種下去(邊界外當作空地)', views: [arr(bed, { label: 'flowerbed' })] }]
  let planted = 0
  for (let i = 0; i < bed.length; i++) {
    const ok = bed[i] === 0 && (i === 0 || bed[i - 1] === 0) && (i === bed.length - 1 || bed[i + 1] === 0)
    if (ok) {
      bed[i] = 1
      planted++
      out.push({ note: `位置 ${i}:左右都空 → 種!目前種了 ${planted} 朵`, views: [arr([...bed], { label: 'flowerbed', highlight: [i] })] })
    }
  }
  out.push({ note: `最多能再種 ${planted} 朵。為什麼能貪心?能種就種,最多只會擋到右邊一格,而晚點種不會讓後面多出位置`, views: [arr(bed, { label: '結果', done: bed.map((v, i) => (v && !F[i] ? i : -1)).filter((i) => i >= 0) })] })
  return out
}

function gapFig(): FigStep[] {
  return [
    { note: '另一種:數連續的 0。夾在兩朵花中間、長度 z 的空地可以種 (z − 1) / 2 朵;靠邊界的空地等於多了一格虛擬的 0', views: [arr(F, { label: 'flowerbed', range: [1, 5] })] },
    { note: '中間 5 個 0 → (5 − 1) / 2 = 2 朵。把頭尾各補一個 0,公式就能統一處理邊界', views: [arr([2], { label: '可種', done: [0] })] },
  ]
}

export const q0605: Solution = {
  id: 605,
  plain: '一排花圃,1 代表已經有花、0 代表空地。花不能種在相鄰的格子。能不能再種下 n 朵花?',
  statement: '給 0/1 陣列 `flowerbed`(1 = 已種花)和整數 n。任兩朵花不能相鄰。判斷能否再種下 n 朵花而不違反規則。',
  examples: [
    { input: 'flowerbed = [1,0,0,0,1], n = 1', output: 'true' },
    { input: 'flowerbed = [1,0,0,0,1], n = 2', output: 'false' },
  ],
  constraints: ['長度 ≤ 2·10⁴'],
  insight: ['能種就種:越早種越不會浪費位置([[p:greedy]])', '檢查左右鄰居,邊界外視為空地', '種夠 n 朵就可以提早結束'],
  approaches: [
    {
      name: '貪心:能種就種',
      idea: '由左往右,`bed[i] == 0` 且左右都是 0(或邊界)就種,`n −= 1`;最後看 n 是否 ≤ 0。',
      steps: ['`for i`:自己、左、右都空', '種下 `bed[i] = 1`、`n -= 1`', '`n <= 0` 可以提早回傳 True', '掃完回傳 `n <= 0`'],
      figure: { title: `flowerbed = [${F}]`, steps: greedyFig() },
      complexity: { time: 'O(m)', space: 'O(1)', why: '一次掃描。' },
      verdict: '最推薦,題目雖然簡單,但是理解「為什麼貪心是對的」的好例子。',
      code: {
        python: `def canPlaceFlowers(flowerbed, n):
    bed = flowerbed
    for i in range(len(bed)):
        left = i == 0 or bed[i - 1] == 0
        right = i == len(bed) - 1 or bed[i + 1] == 0
        if bed[i] == 0 and left and right:
            bed[i] = 1                        # 能種就種
            n -= 1
            if n <= 0:
                return True
    return n <= 0`,
        c: `bool canPlaceFlowers(int *flowerbed, int flowerbedSize, int n) {
    for (int i = 0; i < flowerbedSize && n > 0; i++) {
        bool left = i == 0 || flowerbed[i - 1] == 0;
        bool right = i == flowerbedSize - 1 || flowerbed[i + 1] == 0;
        if (flowerbed[i] == 0 && left && right) { flowerbed[i] = 1; n--; }
    }
    return n <= 0;
}`,
        cpp: `bool canPlaceFlowers(vector<int>& flowerbed, int n) {
    int m = flowerbed.size();
    for (int i = 0; i < m && n > 0; i++) {
        bool left = i == 0 || flowerbed[i - 1] == 0;
        bool right = i == m - 1 || flowerbed[i + 1] == 0;
        if (flowerbed[i] == 0 && left && right) { flowerbed[i] = 1; n--; }
    }
    return n <= 0;
}`,
        java: `boolean canPlaceFlowers(int[] flowerbed, int n) {
    int m = flowerbed.length;
    for (int i = 0; i < m && n > 0; i++) {
        boolean left = i == 0 || flowerbed[i - 1] == 0;
        boolean right = i == m - 1 || flowerbed[i + 1] == 0;
        if (flowerbed[i] == 0 && left && right) { flowerbed[i] = 1; n--; }
    }
    return n <= 0;
}`,
        javascript: `function canPlaceFlowers(flowerbed, n) {
  const m = flowerbed.length;
  for (let i = 0; i < m && n > 0; i++) {
    const left = i === 0 || flowerbed[i - 1] === 0;
    const right = i === m - 1 || flowerbed[i + 1] === 0;
    if (flowerbed[i] === 0 && left && right) {
      flowerbed[i] = 1;
      n--;
    }
  }
  return n <= 0;
}`,
      },
    },
    {
      name: '數連續空地',
      idea: '頭尾各補一個 0,數每段連續 0 的長度 z,這段可種 `(z − 1) // 2` 朵;加總和 n 比較。',
      steps: ['`bed = [0] + flowerbed + [0]`', '掃描計算連續 0 的長度 z', '遇到 1(或結尾)時 `total += (z − 1) // 2`、z 歸零', '回傳 `total >= n`'],
      figure: { title: `flowerbed = [${F}]`, steps: gapFig() },
      complexity: { time: 'O(m)', space: 'O(1)', why: '一次掃描(補 0 可以用變數模擬)。' },
      verdict: '不修改輸入;把「貪心」變成一個公式。',
      code: {
        python: `def canPlaceFlowers(flowerbed, n):
    total, z = 0, 1                           # 開頭當作已有一格空地
    for x in flowerbed:
        if x == 0:
            z += 1
        else:
            total += (z - 1) // 2
            z = 0
    total += z // 2                           # 結尾也補一格空地:(z + 1 − 1) // 2
    return total >= n`,
        c: `bool canPlaceFlowers(int *flowerbed, int flowerbedSize, int n) {
    int total = 0, z = 1;
    for (int i = 0; i < flowerbedSize; i++) {
        if (flowerbed[i] == 0) z++;
        else { total += (z - 1) / 2; z = 0; }
    }
    total += z / 2;
    return total >= n;
}`,
        cpp: `bool canPlaceFlowers(vector<int>& flowerbed, int n) {
    int total = 0, z = 1;
    for (int x : flowerbed) {
        if (x == 0) z++;
        else { total += (z - 1) / 2; z = 0; }
    }
    total += z / 2;
    return total >= n;
}`,
        java: `boolean canPlaceFlowers(int[] flowerbed, int n) {
    int total = 0, z = 1;
    for (int x : flowerbed) {
        if (x == 0) z++;
        else { total += (z - 1) / 2; z = 0; }
    }
    total += z / 2;
    return total >= n;
}`,
        javascript: `function canPlaceFlowers(flowerbed, n) {
  let total = 0, z = 1;
  for (const x of flowerbed) {
    if (x === 0) z++;
    else {
      total += Math.floor((z - 1) / 2);
      z = 0;
    }
  }
  total += Math.floor(z / 2);
  return total >= n;
}`,
      },
    },
  ],
  pitfalls: ['邊界(第一格、最後一格)沒處理,或陣列越界', '只檢查左邊、沒檢查右邊', 'n = 0 時應該直接回傳 true'],
  check: {
    kind: 'fn',
    fn: 'canPlaceFlowers',
    cases: [
      { args: [[1, 0, 0, 0, 1], 1], out: true },
      { args: [[1, 0, 0, 0, 1], 2], out: false },
      { args: [F, 2], out: true },
      { args: [F, 3], out: false },
      { args: [[0], 1], out: true },
      { args: [[0, 0, 1, 0, 0], 2], out: true },
      { args: [[1], 0], out: true },
    ],
  },
}

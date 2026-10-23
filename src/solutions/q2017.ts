import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 2017. Grid Game

const G = [[2, 5, 4], [1, 5, 1]]

function gridView(turn: number, label: string): GridViewData {
  const n = G[0].length
  const path: [number, number][] = []
  for (let c = 0; c <= turn; c++) path.push([0, c])
  for (let c = turn; c < n; c++) path.push([1, c])
  const hl: [number, number][] = []
  for (let c = turn + 1; c < n; c++) hl.push([0, c])
  const cmp: [number, number][] = []
  for (let c = 0; c < turn; c++) cmp.push([1, c])
  return { kind: 'grid', label, cells: G.map((r) => [...r]), rowLabels: ['上', '下'], marks: { dim: path, hl, cmp } }
}

function prefixFig(): FigStep[] {
  const n = G[0].length
  const out: FigStep[] = [{ note: '第一個機器人只能往右、往下,而且只能往下一次:選一個欄 i 往下。它走過的格子會被清成 0。第二個機器人接著走,能拿到的只剩兩塊:**上排 i 右邊**,或**下排 i 左邊**(它只能選其中一塊)', views: [gridView(0, '第一個在第 0 欄往下(變淡 = 被拿走)')] }]
  let best = Infinity
  let bestI = 0
  let top = G[0].reduce((a, b) => a + b, 0)
  let bottom = 0
  for (let i = 0; i < n; i++) {
    top -= G[0][i]
    const second = Math.max(top, bottom)
    if (second < best) {
      best = second
      bestI = i
    }
    out.push({ note: `第一個在第 ${i} 欄往下:上排右邊剩 ${top},下排左邊剩 ${bottom} → 第二個拿 max = ${second}`, views: [gridView(i, `在第 ${i} 欄往下(實心 = 上排右邊,外框 = 下排左邊)`)] })
    bottom += G[1][i]
  }
  out.push({ note: `第一個機器人要讓第二個拿得最少 → 選第 ${bestI} 欄,答案 ${best}`, views: [gridView(bestI, `答案:第 ${bestI} 欄往下`)] })
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:每個轉彎欄 i 都重新把「上排右邊」和「下排左邊」加一遍', views: [arr(G[0], { label: '上排', range: [1, 2] }), arr(G[1], { label: '下排' })] },
    { note: '每個 i 要 O(n) 加總,總共 O(n²);n = 5·10⁴ 時約 25 億次,太慢 → 用前綴和', views: [arr(G[0], { label: '上排', range: [2, 2] }), arr(G[1], { label: '下排', range: [0, 0] })] },
  ]
}

export const q2017: Solution = {
  id: 2017,
  plain: '一個 2 列的格子地圖,每格有分數。兩個機器人從左上走到右下,只能往右或往下(所以只會往下一次)。第一個走過的格子分數會被清空,第二個再走。第一個想讓第二個拿最少,第二個想拿最多。第二個最後拿到幾分?',
  statement: '`grid` 是 2 × n 的矩陣。兩個機器人都從 (0,0) 走到 (1,n−1),只能向右或向下。第一個先走並把經過的格子歸零,第二個再走並收集經過的分數。第一個要**最小化**第二個的分數,第二個要**最大化**。回傳第二個機器人的分數。',
  examples: [
    { input: 'grid = [[2,5,4],[1,5,1]]', output: '4' },
    { input: 'grid = [[3,3,1],[8,5,2]]', output: '4' },
    { input: 'grid = [[1,3,1,15],[1,3,3,1]]', output: '7' },
  ],
  constraints: ['n ≤ 5·10⁴', '值 ≤ 10⁵ → 總和可達 5·10⁹,超過 int'],
  insight: [
    '第一個機器人的路線由「在哪一欄往下」決定',
    '它走完後,剩下的分數只在兩塊:上排轉彎點右邊、下排轉彎點左邊,而且第二個只能拿其中一塊(也只會往下一次)',
    '所以第二個拿 `max(上排右邊, 下排左邊)`,第一個選讓它最小的欄 → 前綴和讓每欄 O(1)',
  ],
  approaches: [
    {
      name: '前綴和 + 枚舉轉彎欄',
      idea: '`top` = 上排轉彎點右邊的和,`bottom` = 下排轉彎點左邊的和;答案 = `min over i of max(top, bottom)`。',
      steps: ['`top = sum(grid[0])`、`bottom = 0`', '`for i`:`top -= grid[0][i]`', '`ans = min(ans, max(top, bottom))`', '`bottom += grid[1][i]`'],
      figure: { title: `grid = ${JSON.stringify(G)}`, steps: prefixFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩個累加變數就取代了前綴陣列。' },
      verdict: '最推薦。看出「第二個只能拿兩塊之一」後,就是[[p:prefix-sum]] + min-max。注意不是讓第一個拿最多(貪心拿最多不等於讓對手最少)。',
      code: {
        python: `def gridGame(grid):
    top, bottom = sum(grid[0]), 0
    ans = float('inf')
    for i in range(len(grid[0])):
        top -= grid[0][i]                     # 上排第 i 欄右邊
        ans = min(ans, max(top, bottom))      # 第二個機器人挑比較大的那塊
        bottom += grid[1][i]                  # 下排第 i 欄(含)左邊
    return ans`,
        c: `long long gridGame(int **grid, int gridSize, int *gridColSize) {
    int n = gridColSize[0];
    long long top = 0, bottom = 0, ans = LLONG_MAX;
    for (int i = 0; i < n; i++) top += grid[0][i];
    for (int i = 0; i < n; i++) {
        top -= grid[0][i];
        long long second = top > bottom ? top : bottom;
        if (second < ans) ans = second;
        bottom += grid[1][i];
    }
    return ans;
}`,
        cpp: `long long gridGame(vector<vector<int>>& grid) {
    long long top = accumulate(grid[0].begin(), grid[0].end(), 0LL), bottom = 0, ans = LLONG_MAX;
    for (size_t i = 0; i < grid[0].size(); i++) {
        top -= grid[0][i];
        ans = min(ans, max(top, bottom));
        bottom += grid[1][i];
    }
    return ans;
}`,
        java: `long gridGame(int[][] grid) {
    long top = 0, bottom = 0, ans = Long.MAX_VALUE;
    for (int x : grid[0]) top += x;
    for (int i = 0; i < grid[0].length; i++) {
        top -= grid[0][i];
        ans = Math.min(ans, Math.max(top, bottom));
        bottom += grid[1][i];
    }
    return ans;
}`,
        javascript: `function gridGame(grid) {
  let top = grid[0].reduce((a, b) => a + b, 0), bottom = 0, ans = Infinity;
  for (let i = 0; i < grid[0].length; i++) {
    top -= grid[0][i];
    ans = Math.min(ans, Math.max(top, bottom));
    bottom += grid[1][i];
  }
  return ans;
}`,
      },
    },
    {
      name: '暴力枚舉轉彎欄',
      idea: '每個 i 直接加總 `grid[0][i+1:]` 和 `grid[1][:i]`。',
      steps: ['`for i`:`a = sum(grid[0][i + 1:])`、`b = sum(grid[1][:i])`', '`ans = min(ans, max(a, b))`'],
      figure: { title: `grid = ${JSON.stringify(G)}`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '每個轉彎點重新加 O(n)。' },
      verdict: '邏輯一樣但太慢,拿來確認「max(兩塊) 再取 min」的想法正確。',
      code: {
        python: `def gridGame(grid):
    n = len(grid[0])
    ans = float('inf')
    for i in range(n):
        a = sum(grid[0][i + 1:])
        b = sum(grid[1][:i])
        ans = min(ans, max(a, b))
    return ans`,
        c: `long long gridGame(int **grid, int gridSize, int *gridColSize) {
    int n = gridColSize[0];
    long long ans = LLONG_MAX;
    for (int i = 0; i < n; i++) {
        long long a = 0, b = 0;
        for (int c = i + 1; c < n; c++) a += grid[0][c];
        for (int c = 0; c < i; c++) b += grid[1][c];
        long long s = a > b ? a : b;
        if (s < ans) ans = s;
    }
    return ans;
}`,
        cpp: `long long gridGame(vector<vector<int>>& grid) {
    int n = grid[0].size();
    long long ans = LLONG_MAX;
    for (int i = 0; i < n; i++) {
        long long a = accumulate(grid[0].begin() + i + 1, grid[0].end(), 0LL);
        long long b = accumulate(grid[1].begin(), grid[1].begin() + i, 0LL);
        ans = min(ans, max(a, b));
    }
    return ans;
}`,
        java: `long gridGame(int[][] grid) {
    int n = grid[0].length;
    long ans = Long.MAX_VALUE;
    for (int i = 0; i < n; i++) {
        long a = 0, b = 0;
        for (int c = i + 1; c < n; c++) a += grid[0][c];
        for (int c = 0; c < i; c++) b += grid[1][c];
        ans = Math.min(ans, Math.max(a, b));
    }
    return ans;
}`,
        javascript: `function gridGame(grid) {
  const n = grid[0].length;
  let ans = Infinity;
  for (let i = 0; i < n; i++) {
    let a = 0, b = 0;
    for (let c = i + 1; c < n; c++) a += grid[0][c];
    for (let c = 0; c < i; c++) b += grid[1][c];
    ans = Math.min(ans, Math.max(a, b));
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['讓第一個機器人拿最多分:那不一定讓第二個拿最少(例 2 就是反例)', '總和超過 int:要用 64 位元', '以為第二個能同時拿上排右邊和下排左邊:它也只能往下一次'],
  check: {
    kind: 'fn',
    fn: 'gridGame',
    cases: [
      { args: [G], out: 4 },
      { args: [[[3, 3, 1], [8, 5, 2]]], out: 4 },
      { args: [[[1, 3, 1, 15], [1, 3, 3, 1]]], out: 7 },
      { args: [[[5], [7]]], out: 0 },
      { args: [[[100000, 100000, 100000], [100000, 100000, 100000]]], out: 100000 },
    ],
  },
}

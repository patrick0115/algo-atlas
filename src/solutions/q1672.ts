import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const ACCOUNTS = [[1, 2, 3], [3, 2, 1], [5, 1, 1]]

function grid(cells: number[][], opt: { label: string; highlight: [number, number][] }) {
  return { kind: 'grid' as const, cells, label: opt.label, marks: { hl: opt.highlight } }
}

function rowFig(): FigStep[] {
  return [
    { note: '第一位客戶有 1、2、3 元，合計 6 元；先把 6 記為目前最高財富。', views: [grid(ACCOUNTS, { label: '帳戶', highlight: [[0, 0], [0, 1], [0, 2]] }), arr([6], { label: '最高財富' })] },
    { note: '第二位客戶有 3 + 2 + 1 = 6 元，最高值仍是 6。', views: [grid(ACCOUNTS, { label: '帳戶', highlight: [[1, 0], [1, 1], [1, 2]] }), arr([6], { label: '最高財富' })] },
    { note: '第三位客戶有 5 + 1 + 1 = 7 元，更新最高值為 7。', views: [grid(ACCOUNTS, { label: '帳戶', highlight: [[2, 0], [2, 1], [2, 2]] }), arr([7], { label: '最高財富', done: [0] })] },
  ]
}

function columnFig(): FigStep[] {
  return [
    { note: '先為每位客戶準備一個小計，全部從 0 開始。', views: [arr([0, 0, 0], { label: '各客戶小計' })] },
    { note: '把第一個銀行的金額加進各自小計，得到 1、3、5。', views: [arr([1, 3, 5], { label: '各客戶小計', highlight: [0, 1, 2] })] },
    { note: '再加第二個銀行，得到 3、5、6。', views: [arr([3, 5, 6], { label: '各客戶小計', highlight: [0, 1, 2] })] },
    { note: '加完第三個銀行後，小計是 6、6、7；其中最大值 7 就是答案。', views: [arr([6, 6, 7], { label: '各客戶小計', done: [2] })] },
  ]
}

export const q1672: Solution = {
  id: 1672,
  plain: '每一列是一位客戶在不同銀行的存款；先算出每人的總存款，再找最有錢的人。',
  statement: '給一個矩陣 accounts，accounts[i][j] 是第 i 位客戶在第 j 家銀行的金額。回傳所有客戶財富總額的最大值。',
  examples: [
    { input: 'accounts = [[1,2,3],[3,2,1]]', output: '6' },
    { input: 'accounts = [[1,5],[7,3],[3,5]]', output: '10' },
  ],
  constraints: ['客戶數與銀行數均為 1 到 50；金額為正整數。'],
  insight: ['一位客戶的財富就是同一列的總和。', '無論按列或按欄累加，都必須讀過所有帳戶，因此至少要 O(mn) 時間。'],
  approaches: [
    {
      name: '逐列累加',
      idea: '處理完一列，就立刻拿它的總和更新最大值。',
      steps: ['令最高財富為 0。', '對每位客戶，將其銀行金額加總。', '以該總額更新最高財富，最後回傳它。'],
      figure: { title: 'accounts = [[1,2,3],[3,2,1],[5,1,1]]', steps: rowFig() },
      complexity: { time: 'O(mn)', space: 'O(1)', why: '每個帳戶讀一次，只保留當前列總額與最大值。' },
      verdict: '最直接，也只需要固定額外空間。',
      code: {
        python: `def maximumWealth(accounts):
    best = 0
    for customer in accounts:
        wealth = 0
        for money in customer:
            wealth += money       # 先算這位客戶的總額
        best = max(best, wealth)  # 只保留目前最高者
    return best`,
        c: `int maximumWealth(int **accounts, int accountsSize, int *accountsColSize) {
    int best = 0;
    for (int i = 0; i < accountsSize; i++) {
        int wealth = 0;
        for (int j = 0; j < accountsColSize[i]; j++) {
            wealth += accounts[i][j];
        }
        if (wealth > best) {
            best = wealth;
        }
    }
    return best;
}`,
        cpp: `int maximumWealth(vector<vector<int>>& accounts) {
    int best = 0;
    for (const vector<int>& customer : accounts) {
        int wealth = 0;
        for (int money : customer) {
            wealth += money;
        }
        best = max(best, wealth);
    }
    return best;
}`,
        java: `int maximumWealth(int[][] accounts) {
    int best = 0;
    for (int[] customer : accounts) {
        int wealth = 0;
        for (int money : customer) {
            wealth += money;
        }
        best = Math.max(best, wealth);
    }
    return best;
}`,
        javascript: `function maximumWealth(accounts) {
  let best = 0;
  for (const customer of accounts) {
    let wealth = 0;
    for (const money of customer) {
      wealth += money;
    }
    best = Math.max(best, wealth);
  }
  return best;
}`,
      },
    },
    {
      name: '逐欄累加',
      idea: '每讀一家銀行，就把金額加入各客戶的小計，最後再找最大值。',
      steps: ['建立長度為客戶數的小計陣列。', '先遍歷銀行，再遍歷客戶，把金額加到對應小計。', '回傳小計中的最大值。'],
      figure: { title: '按銀行累加同一組帳戶', steps: columnFig() },
      complexity: { time: 'O(mn)', space: 'O(m)', why: '每個帳戶仍讀一次，另存 m 位客戶的小計。' },
      verdict: '當資料按銀行逐批到達時，這種累加順序較自然。',
      code: {
        python: `def maximumWealth(accounts):
    customers = len(accounts)
    banks = len(accounts[0])
    totals = [0] * customers
    for bank in range(banks):
        for customer in range(customers):
            totals[customer] += accounts[customer][bank]  # 更新該客戶小計
    return max(totals)`,
        c: `int maximumWealth(int **accounts, int accountsSize, int *accountsColSize) {
    int *totals = calloc(accountsSize, sizeof(int));
    for (int bank = 0; bank < accountsColSize[0]; bank++) {
        for (int customer = 0; customer < accountsSize; customer++) {
            totals[customer] += accounts[customer][bank];
        }
    }
    int best = 0;
    for (int customer = 0; customer < accountsSize; customer++) {
        if (totals[customer] > best) {
            best = totals[customer];
        }
    }
    free(totals);
    return best;
}`,
        cpp: `int maximumWealth(vector<vector<int>>& accounts) {
    vector<int> totals(accounts.size(), 0);
    for (int bank = 0; bank < (int)accounts[0].size(); bank++) {
        for (int customer = 0; customer < (int)accounts.size(); customer++) {
            totals[customer] += accounts[customer][bank];
        }
    }
    return *max_element(totals.begin(), totals.end());
}`,
        java: `int maximumWealth(int[][] accounts) {
    int[] totals = new int[accounts.length];
    for (int bank = 0; bank < accounts[0].length; bank++) {
        for (int customer = 0; customer < accounts.length; customer++) {
            totals[customer] += accounts[customer][bank];
        }
    }
    int best = 0;
    for (int total : totals) {
        best = Math.max(best, total);
    }
    return best;
}`,
        javascript: `function maximumWealth(accounts) {
  const totals = new Array(accounts.length).fill(0);
  for (let bank = 0; bank < accounts[0].length; bank++) {
    for (let customer = 0; customer < accounts.length; customer++) {
      totals[customer] += accounts[customer][bank];
    }
  }
  return Math.max(...totals);
}`,
      },
    },
  ],
  pitfalls: ['要比較每位客戶的列總額，而非矩陣裡最大的單一帳戶。', '逐欄解法利用題目保證的矩形矩陣。'],
  check: {
    kind: 'fn',
    fn: 'maximumWealth',
    cases: [
      { args: [[[1, 2, 3], [3, 2, 1]]], out: 6 },
      { args: [[[1, 5], [7, 3], [3, 5]]], out: 10 },
      { args: [[[2]]], out: 2 },
    ],
  },
}

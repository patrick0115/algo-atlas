import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const target = 4, coins = [1, 2, 3]

function searchFig(): FigStep[] {
  const out: FigStep[] = []
  let count = 0
  function visit(i: number, left: number, picked: number[]): void {
    if (i === coins.length) {
      if (left === 0) count++
      out.push({ note: `枚舉 ${picked.join('+') || '空集合'}，剩餘 ${left}；${left === 0 ? `是一種組合，累計 ${count}` : '未湊足，不計入'}。`, views: [arr(coins, { label: '幣值', highlight: [i - 1] }), arr(picked, { label: '已選硬幣' }), arr([left, count], { label: '剩餘、組數' })] })
      return
    }
    for (let k = 0; k * coins[i] <= left; k++) visit(i + 1, left - k * coins[i], [...picked, ...Array(k).fill(coins[i])])
  }
  visit(0, target, [])
  return out
}

function dpFig(): FigStep[] {
  const out: FigStep[] = []
  const ways = Array(target + 1).fill(0) as number[]
  ways[0] = 1
  for (const coin of coins) {
    for (let amount = coin; amount <= target; amount++) {
      const before = ways[amount]
      ways[amount] += ways[amount - coin]
      out.push({ note: `幣值 ${coin}，金額 ${amount}：原有 ${before} 種，再加上湊 ${amount - coin} 的 ${ways[amount - coin]} 種，得 ${ways[amount]}。`, views: [arr(coins, { label: '目前幣值', highlight: [coins.indexOf(coin)] }), arr([...ways], { label: '金額 0 到 4 的組數', highlight: [amount, amount - coin] })] })
    }
  }
  return out
}

export const hrCoinChange: HrSolution = {
  slug: 'coin-change',
  plain: '像用無限量的各種硬幣找零；一元加三元和三元加一元是同一種組合。',
  statement: '輸入目標金額 n 和可用面額陣列 c，每種面額可使用任意次。求剛好湊出 n 的不同組合數；硬幣使用順序不影響組合身分。無法湊出則回傳 0。',
  examples: [
    { input: 'n=4, c=[1,2,3]', output: '4', note: '組合是 1+1+1+1、1+1+2、2+2、1+3。' },
    { input: 'n=3, c=[8,3,1,2]', output: '3', note: '可用 1+1+1、1+2、3。' },
  ],
  constraints: [
    '面額為正整數 → 選某一幣值的枚舉次數有上界，不會無限迴圈。',
    '幣值可重複使用 → 金額狀態須由小到大更新。',
    '組合數可能大 → C、C++、Java 使用 64 位元儲存答案。',
  ],
  insight: [
    '最直覺是依面額決定各拿幾枚，再遞迴處理下一種面額；如此天然避免把排列重複算。',
    '不同分支常會詢問同一個「已處理哪些面額、還差多少金額」，可改存成 [[p:knapsack]] 狀態。',
    '令 ways[x] 是已處理面額能湊出 x 的組數。加入面額 d 時，原本組數加上 ways[x−d]；外層必須是面額，才不會把順序當成新解。',
  ],
  approaches: [
    {
      name: '逐面額枚舉枚數',
      idea: '每種面額各試 0 枚到可負擔的最大枚數，最後檢查剩餘金額是否為零。',
      steps: ['從第一種面額與剩餘金額 n 開始。', '對目前面額試 0、1、2… 枚，直到超過剩餘金額。', '遞迴處理下一面額。', '處理完全部面額時，剩餘為 0 就計入一種。'],
      figure: { title: 'n=4, c=[1,2,3]', steps: searchFig() },
      complexity: { time: 'O(∏(⌊n/c[i]⌋+1))', space: 'O(m)', why: '每種面額各有多種選取數量；遞迴深度為面額種類數 m。' },
      verdict: '組合定義清楚，但分支數在大金額與多種面額時急速增加。',
      code: {
        python: `def getWays(n, c):
    def visit(i, left):
        if i == len(c):
            return 1 if left == 0 else 0
        total = 0
        for count in range(left // c[i] + 1):
            total += visit(i + 1, left - count * c[i])  # 固定此面額的枚數
        return total
    return visit(0, n)`,
        c: `long long searchWays(int index, int left, int count, long* c) {
    if (index == count) return left == 0 ? 1 : 0;
    long long total = 0;
    for (int used = 0; (long long)used * c[index] <= left; used++) {
        total += searchWays(index + 1, left - used * c[index], count, c);
    }
    return total;
}
long long getWays(int n, int c_count, long* c) {
    return searchWays(0, n, c_count, c);
}`,
        cpp: `long long searchWays(int i, int left, const vector<long>& c) {
    if (i == (int)c.size()) return left == 0 ? 1 : 0;
    long long total = 0;
    for (int used = 0; 1LL * used * c[i] <= left; used++) {
        total += searchWays(i + 1, left - used * c[i], c);
    }
    return total;
}
long long getWays(int n, vector<long> c) {
    return searchWays(0, n, c);
}`,
        java: `public static long searchWays(int i, int left, List<Long> c) {
    if (i == c.size()) return left == 0 ? 1 : 0;
    long total = 0;
    for (int used = 0; (long)used * c.get(i) <= left; used++) {
        total += searchWays(i + 1, (int)(left - used * c.get(i)), c);
    }
    return total;
}
public static long getWays(int n, List<Long> c) {
    return searchWays(0, n, c);
}`,
        javascript: `function getWays(n, c) {
  function visit(i, left) {
    if (i === c.length) return left === 0 ? 1 : 0;
    let total = 0;
    for (let used = 0; used * c[i] <= left; used++) {
      total += visit(i + 1, left - used * c[i]);
    }
    return total;
  }
  return visit(0, n);
}`,
      },
    },
    {
      name: '依幣值更新一維組合數',
      idea: '逐種加入面額，累計每個金額的組合數。',
      steps: ['建立 ways[0..n]，只有 ways[0]=1，表示什麼都不拿。', '外層逐一處理每種面額 d。', '內層讓金額 x 從 d 增加到 n，執行 ways[x] += ways[x−d]。', '回傳 ways[n]。'],
      figure: { title: 'n=4, c=[1,2,3]', steps: dpFig() },
      complexity: { time: 'O(mn)', space: 'O(n)', why: 'm 種面額各走最多 n 個金額；只保存 n+1 個組數。' },
      verdict: '可重用硬幣且不重複計排列；另可參考 [518](#/q/518)。',
      code: {
        python: `def getWays(n, c):
    ways = [0] * (n + 1)
    ways[0] = 1
    for coin in c:
        for amount in range(coin, n + 1):
            ways[amount] += ways[amount - coin]  # 此幣可重複取用
    return ways[n]`,
        c: `long long getWays(int n, int c_count, long* c) {
    long long* ways = calloc(n + 1, sizeof(long long));
    ways[0] = 1;
    for (int i = 0; i < c_count; i++) {
        for (int amount = (int)c[i]; amount <= n; amount++) {
            ways[amount] += ways[amount - (int)c[i]];
        }
    }
    long long answer = ways[n];
    free(ways);
    return answer;
}`,
        cpp: `long long getWays(int n, vector<long> c) {
    vector<long long> ways(n + 1);
    ways[0] = 1;
    for (long coin : c) {
        for (int amount = coin; amount <= n; amount++) {
            ways[amount] += ways[amount - coin];
        }
    }
    return ways[n];
}`,
        java: `public static long getWays(int n, List<Long> c) {
    long[] ways = new long[n + 1];
    ways[0] = 1;
    for (long coin : c) {
        for (int amount = (int)coin; amount <= n; amount++) {
            ways[amount] += ways[(int)(amount - coin)];
        }
    }
    return ways[n];
}`,
        javascript: `function getWays(n, c) {
  const ways = Array(n + 1).fill(0);
  ways[0] = 1;
  for (const coin of c) {
    for (let amount = coin; amount <= n; amount++) {
      ways[amount] += ways[amount - coin];
    }
  }
  return ways[n];
}`,
      },
    },
  ],
  pitfalls: [
    '外層若改走金額，會把不同硬幣順序當成不同答案。',
    '金額從小到大更新，才能在同一幣值階段重複使用該幣。',
    'ways[0] 必須是 1，代表湊出零元的一種空選法。',
  ],
  check: {
    kind: 'fn', fn: 'getWays', cases: [
      { args: [4, [1, 2, 3]], out: 4 },
      { args: [3, [8, 3, 1, 2]], out: 3 },
      { args: [1, [1]], out: 1 },
      { args: [1, [2]], out: 0 },
      { args: [5, [5]], out: 1 },
      { args: [5, [2, 3]], out: 1 },
    ],
  },
}

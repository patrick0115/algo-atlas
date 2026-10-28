import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const FLOWERS = [2, 5, 6]

function enumerateFig(): FigStep[] {
  const steps: FigStep[] = []
  let best = Infinity
  const visit = (left: number[], counts: number[], cost: number, plan: string[]) => {
    if (left.length === 0) {
      best = Math.min(best, cost)
      steps.push({ note: `買法 ${plan.join(' → ')} 共花 ${cost}；目前最低 ${best}。`, views: [kv([['本次總價', cost], ['最低總價', best]], '完整買法')] })
      return
    }
    for (let i = 0; i < left.length; i++) {
      for (let friend = 0; friend < 2; friend++) {
        const price = left[i]
        const next = [...counts]
        const pay = price * (next[friend] + 1)
        next[friend]++
        if (steps.length < 12) steps.push({ note: `把價格 ${price} 交給第 ${friend + 1} 人買；他已買 ${counts[friend]} 朵，這朵付 ${pay}，暫計 ${cost + pay}。`, views: [arr(left, { label: '剩餘花價', highlight: [i] }), kv([['買家 1 已買', next[0]], ['買家 2 已買', next[1]], ['暫計', cost + pay]], '買花狀態')] })
        visit(left.filter((_, j) => j !== i), next, cost + pay, [...plan, `${price} 給 ${friend + 1} 號`])
      }
    }
  }
  visit(FLOWERS, [0, 0], 0, [])
  return steps
}

function greedyFig(): FigStep[] {
  const sorted = [...FLOWERS].sort((a, b) => b - a)
  const steps: FigStep[] = [{ note: `先按價格由高到低排成 ${sorted.join('、')}；高價花應趁倍率低時買。`, views: [arr(sorted, { label: '降冪花價' })] }]
  let total = 0
  for (let i = 0; i < sorted.length; i++) {
    const factor = Math.floor(i / 2) + 1
    const paid = sorted[i] * factor
    total += paid
    steps.push({ note: `第 ${i + 1} 朵價格 ${sorted[i]}，目前屬第 ${factor} 輪，每人購買倍率為 ${factor}；付 ${paid}，累計 ${total}。`, views: [arr(sorted, { label: '購買順序', highlight: [i] }), kv([['倍率', factor], ['本次付款', paid], ['累計', total]], '付款狀態')] })
  }
  return steps
}

export const hrGreedyFlorist: HrSolution = {
  slug: 'greedy-florist',
  plain: '花店對每個人買的第 2 朵、第 3 朵逐漸加價；先把貴花交給還有低倍率的人買。',
  statement: '有 k 位朋友要買下價格陣列 c 中的所有花。某人已買 t 朵時，下一朵原價 p 需付 (t+1)p。每朵只能由一人買，回傳可達到的最低總花費。',
  examples: [
    { input: 'k = 2, c = [2,5,6]', output: '15', note: '先以倍率 1 買 6 與 5，剩下 2 以倍率 2 買，共 15。' },
    { input: 'k = 3, c = [2,5,6]', output: '13', note: '每人各買一朵，全部都只付原價。' },
  ],
  constraints: [
    '花的數量可能大於朋友數 → 一輪後倍率一定增加，必須安排購買順序。',
    '花價皆為正數 → 把較高價格乘較低倍率永遠不會更差。',
  ],
  insight: [
    '直覺上可列舉買花順序與買家，算每種分配的總花費，但排列數和分配數快速爆炸。',
    '若 p > q、低倍率 a < b，把 p 配 a、q 配 b 的費用比反過來少 (p-q)(b-a)。',
    '所以用 [[p:greedy]]：花價降冪，前 k 朵乘 1、下 k 朵乘 2，依此類推。',
  ],
  approaches: [
    {
      name: '列舉所有購買安排',
      idea: '每一步試所有剩餘的花與每位買家，取完整安排的最低費用。',
      steps: ['記錄每位朋友已買的朵數。', '從剩餘花選一朵，嘗試交給每位朋友並加上當次花費。', '沒有花時更新最低總價，回溯試下一種安排。'],
      figure: { title: '兩位朋友買 [2,5,6] 的部分搜尋', steps: enumerateFig() },
      complexity: { time: 'O(n! k^n)', space: 'O(n+k)', why: '有 n! 種花序，每朵又可分給 k 人；遞迴保存剩餘花及每人次數。' },
      verdict: '只適合非常小的輸入，用來理解價格倍率如何形成。',
      code: {
        python: `def getMinimumCost(k, c):
    best = float('inf')
    counts = [0] * k
    def search(left, total):
        nonlocal best
        if not left:
            best = min(best, total)
            return
        for i, price in enumerate(left):
            for buyer in range(k):
                paid = price * (counts[buyer] + 1)
                counts[buyer] += 1
                search(left[:i] + left[i + 1:], total + paid)
                counts[buyer] -= 1  # 回溯購買次數
    search(c, 0)
    return best`,
        c: `void searchFlowers(int depth, int n, int k, int* c, int* used, int* bought, int total, int* best) {
    if (depth == n) {
        if (total < *best) *best = total;
        return;
    }
    for (int i = 0; i < n; i++) {
        if (used[i]) continue;
        used[i] = 1;
        for (int buyer = 0; buyer < k; buyer++) {
            int paid = c[i] * (bought[buyer] + 1);
            bought[buyer]++;
            searchFlowers(depth + 1, n, k, c, used, bought, total + paid, best);
            bought[buyer]--;
        }
        used[i] = 0;
    }
}

int getMinimumCost(int k, int c_count, int* c) {
    int* used = calloc(c_count, sizeof(int));
    int* bought = calloc(k, sizeof(int));
    int best = INT_MAX;
    searchFlowers(0, c_count, k, c, used, bought, 0, &best);
    free(used);
    free(bought);
    return best;
}`,
        cpp: `int getMinimumCost(int k, vector<int> c) {
    vector<int> used(c.size(), 0), bought(k, 0);
    int best = INT_MAX;
    function<void(int, int)> search = [&](int depth, int total) {
        if (depth == (int)c.size()) {
            best = min(best, total);
            return;
        }
        for (int i = 0; i < (int)c.size(); i++) {
            if (used[i]) continue;
            used[i] = 1;
            for (int buyer = 0; buyer < k; buyer++) {
                int paid = c[i] * (bought[buyer] + 1);
                bought[buyer]++;
                search(depth + 1, total + paid);
                bought[buyer]--;
            }
            used[i] = 0;
        }
    };
    search(0, 0);
    return best;
}`,
        java: `public static int getMinimumCost(int k, List<Integer> c) {
    int[] values = c.stream().mapToInt(Integer::intValue).toArray();
    return getMinimumCost(k, values);
}

public static int getMinimumCost(int k, int[] c) {
    boolean[] used = new boolean[c.length];
    int[] bought = new int[k];
    int[] best = {Integer.MAX_VALUE};
    class Search {
        void run(int depth, int total) {
            if (depth == c.length) {
                best[0] = Math.min(best[0], total);
                return;
            }
            for (int i = 0; i < c.length; i++) {
                if (used[i]) continue;
                used[i] = true;
                for (int buyer = 0; buyer < k; buyer++) {
                    int paid = c[i] * (bought[buyer] + 1);
                    bought[buyer]++;
                    run(depth + 1, total + paid);
                    bought[buyer]--;
                }
                used[i] = false;
            }
        }
    }
    new Search().run(0, 0);
    return best[0];
}`,
        javascript: `function getMinimumCost(k, c) {
  const counts = new Array(k).fill(0);
  let best = Infinity;
  function search(left, total) {
    if (left.length === 0) {
      best = Math.min(best, total);
      return;
    }
    for (let i = 0; i < left.length; i++) {
      for (let buyer = 0; buyer < k; buyer++) {
        const paid = left[i] * (counts[buyer] + 1);
        counts[buyer]++;
        search(left.filter((_, j) => j !== i), total + paid);
        counts[buyer]--;
      }
    }
  }
  search(c, 0);
  return best;
}`,
      },
    },
    {
      name: '高價先買',
      idea: '把花價降冪，依序乘上目前可用的最低倍率。',
      steps: ['將 c 由大到小排序。', '第 i 朵的倍率是 floor(i/k)+1，因為每 k 朵形成一輪。', '把 c[i] 乘倍率累加，回傳總額。'],
      figure: { title: '兩人購買三朵花', steps: greedyFig() },
      complexity: { time: 'O(n log n)', space: 'O(n) 或依排序器而定', why: '排序是主要成本，後續只掃花價一次。' },
      verdict: '交換論證保證高價搭低倍率最省錢。',
      code: {
        python: `def getMinimumCost(k, c):
    c.sort(reverse=True)
    total = 0
    for i, price in enumerate(c):
        # 每 k 朵才進入下一個倍率
        total += price * (i // k + 1)
    return total`,
        c: `int compareDesc(const void* a, const void* b) {
    int x = *(const int*)a;
    int y = *(const int*)b;
    return (x < y) - (x > y);
}

int getMinimumCost(int k, int c_count, int* c) {
    qsort(c, c_count, sizeof(int), compareDesc);
    int total = 0;
    for (int i = 0; i < c_count; i++) {
        total += c[i] * (i / k + 1);
    }
    return total;
}`,
        cpp: `int getMinimumCost(int k, vector<int> c) {
    sort(c.begin(), c.end(), greater<int>());
    int total = 0;
    for (int i = 0; i < (int)c.size(); i++) {
        total += c[i] * (i / k + 1);
    }
    return total;
}`,
        java: `public static int getMinimumCost(int k, List<Integer> c) {
    int[] values = c.stream().mapToInt(Integer::intValue).toArray();
    return getMinimumCost(k, values);
}

public static int getMinimumCost(int k, int[] c) {
    Arrays.sort(c);
    int total = 0;
    for (int i = 0; i < c.length; i++) {
        total += c[c.length - 1 - i] * (i / k + 1);
    }
    return total;
}`,
        javascript: `function getMinimumCost(k, c) {
  c.sort((a, b) => b - a);
  let total = 0;
  for (let i = 0; i < c.length; i++) {
    total += c[i] * (Math.floor(i / k) + 1);
  }
  return total;
}`,
      },
    },
  ],
  pitfalls: [
    '倍率屬於買家已買的朵數，不是花本身的固定屬性。',
    '排序必須由大到小；先買便宜花會讓貴花承受高倍率。',
    '第 k 朵仍是倍率 1，第 k+1 朵才是倍率 2；零基索引用 floor(i/k)+1。',
  ],
  check: {
    kind: 'fn',
    fn: 'getMinimumCost',
    cases: [
      { args: [2, [2, 5, 6]], out: 15 },
      { args: [3, [2, 5, 6]], out: 13 },
      { args: [1, [1, 2, 3]], out: 10 },
      { args: [1, [7]], out: 7 },
      { args: [2, [1, 1, 1, 1]], out: 6 },
      { args: [3, [1, 2]], out: 3 },
    ],
  },
}

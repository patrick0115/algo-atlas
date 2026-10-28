import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const PACKETS = [10, 100, 300, 200, 1000, 20, 30]

function chooseFig(): FigStep[] {
  const steps: FigStep[] = []
  let best = Infinity
  for (let i = 0; i < PACKETS.length; i++) {
    for (let j = i + 1; j < PACKETS.length; j++) {
      for (let h = j + 1; h < PACKETS.length; h++) {
        const group = [PACKETS[i], PACKETS[j], PACKETS[h]]
        const gap = Math.max(...group) - Math.min(...group)
        best = Math.min(best, gap)
        steps.push({ note: `選 ${group.join('、')}：最大 ${Math.max(...group)} 減最小 ${Math.min(...group)} 是 ${gap}；目前最小 ${best}。`, views: [arr(PACKETS, { label: '原始包數', highlight: [i, j, h] }), kv([['這組不公平值', gap], ['目前最佳', best]], '列舉狀態')] })
      }
    }
  }
  return steps
}

function windowFig(): FigStep[] {
  const sorted = [...PACKETS].sort((a, b) => a - b)
  const steps: FigStep[] = [{ note: `先排序成 ${sorted.join('、')}；最佳的三包可以選成排序後連續的一段。`, views: [arr(sorted, { label: '排序結果' })] }]
  let best = Infinity
  for (let right = 2; right < sorted.length; right++) {
    const left = right - 2
    const gap = sorted[right] - sorted[left]
    best = Math.min(best, gap)
    steps.push({ note: `視窗 ${sorted.slice(left, right + 1).join('、')}，兩端差 ${gap}；目前最佳 ${best}。中間值不影響最大減最小。`, views: [arr(sorted, { label: '三包視窗', highlight: [left, left + 1, right], dim: sorted.map((_, j) => j < left || j > right ? j : -1).filter(j => j >= 0) }), kv([['左界', left], ['右界', right], ['目前最佳', best]], '視窗狀態')] })
  }
  return steps
}

export const hrAngryChildren: HrSolution = {
  slug: 'angry-children',
  plain: '有不同顆數的糖果包，要挑 k 包送小孩；讓最多與最少的顆數差距盡量小。',
  statement: '輸入要挑的包數 k，以及每包糖果數 arr。從 arr 挑恰好 k 包，這組的不公平值是最大包數減最小包數；回傳所有選法中最小的不公平值。',
  examples: [
    { input: 'k = 3, arr = [10,100,300,200,1000,20,30]', output: '20', note: '挑 10、20、30，最大減最小為 20。' },
    { input: 'k = 2, arr = [1,4,7,2]', output: '1', note: '挑 1 和 2，差距最小。' },
  ],
  constraints: [
    '2 ≤ k ≤ n ≤ 10^5 → 視窗寬度恰好 k,至少有兩個數;n 到 10^5 要 O(n log n)。',
    'n 可達 10^5 → 枚舉所有 k 元子集合不可行，排序後線性掃描可行。',
  ],
  insight: [
    '照題意直接從 n 包選 k 包，對每一組算最大減最小；這能確認答案只取決於兩端。',
    '排序後，若一組所選元素在兩端之間留下空洞，換成空洞中的包不會使兩端更遠。',
    '因此最佳解一定可用排序後連續 k 包表示；用 [[p:sliding-window]] 掃每個視窗的右端減左端。',
  ],
  approaches: [
    {
      name: '列舉 k 包組合',
      idea: '逐一嘗試所有可選的 k 包，取各組最大減最小的最小值。',
      steps: ['用遞迴或組合迴圈挑恰好 k 個位置。', '每完成一組，找該組最大值與最小值。', '更新目前最小的不公平值。'],
      figure: { title: '從七包選三包的全部組合', steps: chooseFig() },
      complexity: { time: 'O(C(n,k) · k)', space: 'O(k)', why: '組合數為 C(n,k)，每組最多要檢查 k 個元素。' },
      verdict: '能驗證小例子，但組合數成長太快。',
      code: {
        python: `def maxMin(k, arr):
    best = float('inf')
    chosen = []
    def search(start):
        nonlocal best
        if len(chosen) == k:
            best = min(best, max(chosen) - min(chosen))
            return
        for i in range(start, len(arr)):
            chosen.append(arr[i])
            search(i + 1)
            chosen.pop()  # 回復選擇，試下一包
    search(0)
    return best`,
        c: `int choose(int start, int used, int k, int n, int* arr, int low, int high) {
    if (used == k) return high - low;
    int best = INT_MAX;
    for (int i = start; i <= n - (k - used); i++) {
        int nextLow = used == 0 || arr[i] < low ? arr[i] : low;
        int nextHigh = used == 0 || arr[i] > high ? arr[i] : high;
        int value = choose(i + 1, used + 1, k, n, arr, nextLow, nextHigh);
        if (value < best) best = value;
    }
    return best;
}

int maxMin(int k, int arr_count, int* arr) {
    return choose(0, 0, k, arr_count, arr, 0, 0);
}`,
        cpp: `int maxMin(int k, vector<int> arr) {
    int best = INT_MAX;
    function<void(int, int, int, int)> search = [&](int start, int used, int low, int high) {
        if (used == k) {
            best = min(best, high - low);
            return;
        }
        for (int i = start; i <= (int)arr.size() - (k - used); i++) {
            int nextLow = used == 0 ? arr[i] : min(low, arr[i]);
            int nextHigh = used == 0 ? arr[i] : max(high, arr[i]);
            search(i + 1, used + 1, nextLow, nextHigh);
        }
    };
    search(0, 0, 0, 0);
    return best;
}`,
        java: `public static int maxMin(int k, List<Integer> arr) {
    int[] best = {Integer.MAX_VALUE};
    class Search {
        void run(int start, int used, int low, int high) {
            if (used == k) {
                best[0] = Math.min(best[0], high - low);
                return;
            }
            for (int i = start; i <= arr.size() - (k - used); i++) {
                int x = arr.get(i);
                run(i + 1, used + 1, used == 0 ? x : Math.min(low, x), used == 0 ? x : Math.max(high, x));
            }
        }
    }
    new Search().run(0, 0, 0, 0);
    return best[0];
}`,
        javascript: `function maxMin(k, arr) {
  let best = Infinity;
  function search(start, used, low, high) {
    if (used === k) {
      best = Math.min(best, high - low);
      return;
    }
    for (let i = start; i <= arr.length - (k - used); i++) {
      const x = arr[i];
      search(i + 1, used + 1, used === 0 ? x : Math.min(low, x), used === 0 ? x : Math.max(high, x));
    }
  }
  search(0, 0, 0, 0);
  return best;
}`,
      },
    },
    {
      name: '排序後掃固定寬度視窗',
      idea: '最佳 k 包能排成連續的一段，只需比較每段兩端。',
      steps: ['將 arr 升冪排序。', '對每個右端 right ≥ k-1，令 left = right-k+1。', '計算 arr[right]-arr[left] 並更新最小值。'],
      figure: { title: '排序後的三包視窗', steps: windowFig() },
      complexity: { time: 'O(n log n)', space: 'O(n) 或依排序器而定', why: '先排序，之後每個視窗只需 O(1) 取兩端差。' },
      verdict: '視窗內不必求最大最小；排序已讓兩端給出答案。',
      code: {
        python: `def maxMin(k, arr):
    arr.sort()
    best = float('inf')
    for right in range(k - 1, len(arr)):
        left = right - k + 1
        # 排序後視窗兩端就是最大、最小
        best = min(best, arr[right] - arr[left])
    return best`,
        c: `int compareInt(const void* a, const void* b) {
    int x = *(const int*)a;
    int y = *(const int*)b;
    return (x > y) - (x < y);
}

int maxMin(int k, int arr_count, int* arr) {
    qsort(arr, arr_count, sizeof(int), compareInt);
    int best = INT_MAX;
    for (int right = k - 1; right < arr_count; right++) {
        int gap = arr[right] - arr[right - k + 1];
        if (gap < best) best = gap;
    }
    return best;
}`,
        cpp: `int maxMin(int k, vector<int> arr) {
    sort(arr.begin(), arr.end());
    int best = INT_MAX;
    for (int right = k - 1; right < (int)arr.size(); right++) {
        best = min(best, arr[right] - arr[right - k + 1]);
    }
    return best;
}`,
        java: `public static int maxMin(int k, List<Integer> arr) {
    Collections.sort(arr);
    int best = Integer.MAX_VALUE;
    for (int right = k - 1; right < arr.size(); right++) {
        best = Math.min(best, arr.get(right) - arr.get(right - k + 1));
    }
    return best;
}`,
        javascript: `function maxMin(k, arr) {
  arr.sort((a, b) => a - b);
  let best = Infinity;
  for (let right = k - 1; right < arr.length; right++) {
    best = Math.min(best, arr[right] - arr[right - k + 1]);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    '題目要求恰好 k 包，不能只挑最接近的兩包。',
    '視窗左端是 right-k+1；少加 1 會選到 k+1 包。',
    'JavaScript 的預設排序是字典序，必須提供數值比較函式。',
  ],
  check: {
    kind: 'fn',
    fn: 'maxMin',
    cases: [
      { args: [3, [10, 100, 300, 200, 1000, 20, 30]], out: 20 },
      { args: [2, [1, 4, 7, 2]], out: 1 },
      { args: [3, [5, 5, 5]], out: 0 },
      { args: [2, [1, 10]], out: 9 },
      { args: [4, [1, 2, 3, 4]], out: 3 },
      { args: [2, [7, 7, 7]], out: 0 },
    ],
  },
}

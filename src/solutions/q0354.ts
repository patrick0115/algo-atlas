import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 354. Russian Doll Envelopes
const E = [[5, 4], [6, 4], [6, 7], [2, 3]]
const dpFig = [
  { note: '按寬由小到大排列；同寬的信封不能互裝，必須另外比較高。', views: [arr(['2×3', '5×4', '6×4', '6×7'], { label: '排序後' })] },
  { note: '2×3 自己形成長度 1 的鏈。', views: [arr([1, 0, 0, 0], { label: 'dp', highlight: [0] })] },
  { note: '5×4 可裝下 2×3，長度變 2；6×4 高度沒有嚴格增加，只能接 2×3。', views: [arr([1, 2, 2, 0], { label: 'dp', highlight: [1, 2] })] },
  { note: '6×7 可接 5×4，得到 2×3 → 5×4 → 6×7，答案 3。', views: [arr([1, 2, 2, 3], { label: 'dp', done: [3] })] },
]
const lisFig = [
  { note: '寬度升序；同寬時高度降序：2×3、5×4、6×7、6×4。這樣同寬的兩個不會被 LIS 一起選。', views: [arr([3, 4, 7, 4], { label: '高度序列' })] },
  { note: '處理高度 3：長度 1 的最佳尾端是 3。', views: [arr([3], { label: 'tails', highlight: [0] })] },
  { note: '處理 4、7：兩者都比尾端大，tails 變成 [3,4,7]。', views: [arr([3, 4, 7], { label: 'tails', highlight: [1, 2] })] },
  { note: '最後的 4 取代第二格，不會增加長度；最長鏈仍是 3。', views: [arr([3, 4, 7], { label: 'tails', done: [0, 1, 2] })] },
]

export const q0354: Solution = {
  id: 354,
  plain: '把小信封一個個放進更大的信封，問最多能套幾層；寬和高都要嚴格變大。',
  statement: '每個 `envelopes[i] = [寬,高]`。只有兩個尺寸都比較小才能放進另一個信封；信封不能旋轉。求最長套疊鏈。',
  examples: [{ input: 'envelopes = [[5,4],[6,4],[6,7],[2,3]]', output: '3' }, { input: 'envelopes = [[1,1],[1,1],[1,1]]', output: '1' }],
  constraints: ['1 ≤ 信封數 ≤ 10⁵；大量資料需要 O(n log n)。'],
  insight: ['先依寬排序，問題就變成高度的 [[p:lis]]。', '同寬時高度要**降序**，否則同寬且高度遞增的信封會被錯誤地接在一起。'],
  approaches: [
    {
      name: '排序後的二維動態規劃',
      idea: '`dp[i]` 是以第 i 個信封結尾時最多的層數。',
      steps: ['依寬度排序。', '每個信封先設 `dp[i]=1`。', '查看前面所有信封，兩個尺寸都較小才可接上。', '取 dp 最大值。'],
      figure: { title: 'envelopes = [[5,4],[6,4],[6,7],[2,3]]', steps: dpFig },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個信封都檢查先前所有信封。' },
      verdict: '狀態直觀，但 10⁵ 個信封時太慢。',
      code: {
        python: `def maxEnvelopes(envelopes):
    envelopes.sort()
    n = len(envelopes)
    dp = [1] * n
    for i in range(n):
        for j in range(i):
            if envelopes[j][0] < envelopes[i][0] and envelopes[j][1] < envelopes[i][1]:
                dp[i] = max(dp[i], dp[j] + 1)  # 兩個尺寸都嚴格變大
    return max(dp)`,
        c: `static int cmpEnvelope(const void *a, const void *b) {
    int *x = *(int **)a;
    int *y = *(int **)b;
    if (x[0] != y[0]) return x[0] < y[0] ? -1 : 1;
    return x[1] < y[1] ? -1 : x[1] > y[1];
}

int maxEnvelopes(int **envelopes, int envelopesSize, int *envelopesColSize) {
    qsort(envelopes, envelopesSize, sizeof(int *), cmpEnvelope);
    int *dp = malloc(envelopesSize * sizeof(int));
    int best = 0;
    for (int i = 0; i < envelopesSize; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++) {
            if (envelopes[j][0] < envelopes[i][0] && envelopes[j][1] < envelopes[i][1] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
            }
        }
        if (dp[i] > best) best = dp[i];
    }
    free(dp);
    return best;
}`,
        cpp: `int maxEnvelopes(vector<vector<int>>& envelopes) {
    sort(envelopes.begin(), envelopes.end());
    int n = envelopes.size();
    vector<int> dp(n, 1);
    int best = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (envelopes[j][0] < envelopes[i][0] && envelopes[j][1] < envelopes[i][1]) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
        best = max(best, dp[i]);
    }
    return best;
}`,
        java: `int maxEnvelopes(int[][] envelopes) {
    Arrays.sort(envelopes, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
    int n = envelopes.length;
    int[] dp = new int[n];
    int best = 0;
    for (int i = 0; i < n; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++) {
            if (envelopes[j][0] < envelopes[i][0] && envelopes[j][1] < envelopes[i][1]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        best = Math.max(best, dp[i]);
    }
    return best;
}`,
        javascript: `function maxEnvelopes(envelopes) {
  envelopes.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const dp = new Array(envelopes.length).fill(1);
  let best = 0;
  for (let i = 0; i < envelopes.length; i++) {
    for (let j = 0; j < i; j++) {
      if (envelopes[j][0] < envelopes[i][0] && envelopes[j][1] < envelopes[i][1]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}`,
      },
    },
    {
      name: '高度 LIS 加二分搜尋',
      idea: '寬度升序、同寬高度降序後，只對高度找嚴格遞增子序列。',
      steps: ['依寬升序、同寬高降序排序。', '`tails[k]` 存長度 k+1 的鏈能有的最小尾端高度。', '對每個高度找第一個 ≥ 它的位置並替換；若沒有就新增。', '回傳 tails 長度。'],
      figure: { title: 'envelopes = [[5,4],[6,4],[6,7],[2,3]]', steps: lisFig },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序與每個高度二分搜尋。' },
      verdict: '可處理最大資料量；同寬降序是這題關鍵。',
      code: {
        python: `from bisect import bisect_left

def maxEnvelopes(envelopes):
    envelopes.sort(key=lambda e: (e[0], -e[1]))  # 同寬高度降序
    tails = []
    for _, height in envelopes:
        pos = bisect_left(tails, height)          # 第一個 >= height
        if pos == len(tails):
            tails.append(height)
        else:
            tails[pos] = height
    return len(tails)`,
        c: `static int cmpEnvelope(const void *a, const void *b) {
    int *x = *(int **)a;
    int *y = *(int **)b;
    if (x[0] != y[0]) return x[0] < y[0] ? -1 : 1;
    return x[1] > y[1] ? -1 : x[1] < y[1];
}

int maxEnvelopes(int **envelopes, int envelopesSize, int *envelopesColSize) {
    qsort(envelopes, envelopesSize, sizeof(int *), cmpEnvelope);
    int *tails = malloc(envelopesSize * sizeof(int));
    int size = 0;
    for (int i = 0; i < envelopesSize; i++) {
        int h = envelopes[i][1];
        int lo = 0, hi = size;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (tails[mid] < h) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = h;
        if (lo == size) size++;
    }
    free(tails);
    return size;
}`,
        cpp: `int maxEnvelopes(vector<vector<int>>& envelopes) {
    sort(envelopes.begin(), envelopes.end(), [](const auto& a, const auto& b) {
        if (a[0] != b[0]) return a[0] < b[0];
        return a[1] > b[1];
    });
    vector<int> tails;
    for (const auto& e : envelopes) {
        auto it = lower_bound(tails.begin(), tails.end(), e[1]);
        if (it == tails.end()) tails.push_back(e[1]);
        else *it = e[1];
    }
    return tails.size();
}`,
        java: `int maxEnvelopes(int[][] envelopes) {
    Arrays.sort(envelopes, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(b[1], a[1]));
    int[] tails = new int[envelopes.length];
    int size = 0;
    for (int[] e : envelopes) {
        int lo = 0, hi = size;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (tails[mid] < e[1]) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = e[1];
        if (lo == size) size++;
    }
    return size;
}`,
        javascript: `function maxEnvelopes(envelopes) {
  envelopes.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const tails = [];
  for (const [, height] of envelopes) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < height) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = height;
  }
  return tails.length;
}`,
      },
    },
  ],
  pitfalls: ['寬與高都必須嚴格增加。', 'LIS 版本同寬必須按高度降序排序，否則會錯把同寬信封套在一起。'],
  check: { kind: 'fn', fn: 'maxEnvelopes', cases: [
    { args: [E], out: 3 }, { args: [[[1, 1], [1, 1], [1, 1]]], out: 1 },
    { args: [[[1, 3], [1, 4], [2, 5]]], out: 2 }, { args: [[[2, 1]]], out: 1 },
  ] },
}

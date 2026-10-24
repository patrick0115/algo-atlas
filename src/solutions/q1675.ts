import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1675. Minimize Deviation in Array

const A = [4, 1, 5, 20, 3]

function heapFig(): FigStep[] {
  return [
    { note: '偶數可以一直除以 2,奇數只能乘 2 一次(乘完變偶數)。先把所有奇數乘 2 → 每個數都在「最大可能值」,之後只能往下調(除以 2)', views: [arr(A, { label: 'nums' }), arr([4, 2, 10, 20, 6], { label: '奇數先乘 2' })] },
    { note: '偏差 = 最大 − 最小。要縮小偏差,只能把**最大的**變小(最小的已經沒辦法再變大)。用最大堆積,每次把最大的除以 2', views: [arr([20, 10, 6, 4, 2], { label: '最大堆積', highlight: [0] }), arr(['最小 = 2,偏差 18'], { label: '目前' })] },
    { note: '20 → 10 → 5(奇數,不能再除)… 每一步更新「最小值」和偏差。最大值變成奇數時就停:它再也不能變小了', views: [arr([5, 5, 4, 3, 2], { label: '最後的值(約略)', done: [0] }), arr(['偏差最小 = 3'], { label: '答案' })] },
  ]
}

function winFig(): FigStep[] {
  return [
    { note: '另一種:列出每個數所有可能的值(4 → {1,2,4}、1 → {1,2}、5 → {5,10}…),標上它屬於第幾個數', views: [arr(['4:{1,2,4}', '1:{1,2}', '5:{5,10}', '20:{5,10,20}', '3:{3,6}'], { label: '每個數的候選值' })] },
    { note: '把所有 (值, 編號) 排序,找最短的區間 [lo, hi],讓每個編號都至少有一個值落在裡面 —— 就是「涵蓋所有顏色的最小視窗」(76 題的套路)', views: [arr([1, 1, 2, 2, 3, 4, 5, 5, 6, 10, 10, 20], { label: '排序後的候選值', range: [3, 7] })] },
  ]
}

export const q1675: Solution = {
  id: 1675,
  plain: '一排正整數,每次可以把某個偶數除以 2,或把某個奇數乘以 2,次數不限。目標是讓「最大的數 − 最小的數」越小越好。最小能到多少?',
  statement: '給正整數陣列 `nums`。可對任意元素任意次執行:偶數除以 2;奇數乘以 2。陣列的**偏差**為最大值與最小值的差,回傳執行任意次操作後的最小偏差。',
  examples: [
    { input: 'nums = [1,2,3,4]', output: '1' },
    { input: 'nums = [4,1,5,20,3]', output: '3' },
    { input: 'nums = [2,10,8]', output: '3' },
  ],
  constraints: ['n ≤ 5·10⁴,值 ≤ 10⁹'],
  insight: ['奇數只能乘 2 一次,乘完就變偶數 → 先把奇數都乘 2,讓每個數都在它的最大值', '之後每個數只能往下(除以 2)', '偏差只能靠「把最大值變小」改善 → 最大堆積反覆取最大的除以 2,直到最大的是奇數'],
  approaches: [
    {
      name: '先拉到最大,再用最大堆積往下壓',
      idea: '奇數乘 2;最大堆積 + 記錄最小值;反覆取出最大 x 更新偏差,x 是偶數就把 x/2 放回去(並更新最小值),是奇數就停。',
      steps: ['`v = x * 2 if x 奇數 else x`;全部放進最大堆積,`mn = min(v)`', '`while True`:`x = 堆積最大`;`ans = min(ans, x − mn)`', '`x` 是奇數 → 停', '否則彈出、放回 `x // 2`,`mn = min(mn, x // 2)`'],
      figure: { title: `nums = [${A}]`, steps: heapFig() },
      complexity: { time: 'O(n log n · log V)', space: 'O(n)', why: '每個數最多被除 log V 次,每次堆積操作 log n。' },
      verdict: '最推薦。把「可以上也可以下」統一成「只能往下」,貪心就變得很簡單。',
      code: {
        python: `import heapq

def minimumDeviation(nums):
    h = [-(x * 2 if x % 2 else x) for x in nums]   # 最大堆積(存負數),奇數先乘 2
    heapq.heapify(h)
    mn = -max(h)
    ans = float('inf')
    while True:
        x = -h[0]
        ans = min(ans, x - mn)
        if x % 2:
            return ans                        # 最大的已經不能再變小
        heapq.heapreplace(h, -(x // 2))
        mn = min(mn, x // 2)`,
        c: `static void down(int *h, int n, int i) {
    for (;;) {
        int m = i, l = 2 * i + 1, r = l + 1;
        if (l < n && h[l] > h[m]) m = l;
        if (r < n && h[r] > h[m]) m = r;
        if (m == i) return;
        int t = h[i]; h[i] = h[m]; h[m] = t;
        i = m;
    }
}

int minimumDeviation(int *nums, int numsSize) {
    int n = numsSize, *h = malloc(n * sizeof(int)), mn = INT_MAX, ans = INT_MAX;
    for (int i = 0; i < n; i++) { h[i] = nums[i] % 2 ? nums[i] * 2 : nums[i]; if (h[i] < mn) mn = h[i]; }
    for (int i = n / 2 - 1; i >= 0; i--) down(h, n, i);      // 建最大堆積
    for (;;) {
        int x = h[0];
        if (x - mn < ans) ans = x - mn;
        if (x % 2) break;
        h[0] = x / 2;
        if (h[0] < mn) mn = h[0];
        down(h, n, 0);
    }
    free(h);
    return ans;
}`,
        cpp: `int minimumDeviation(vector<int>& nums) {
    priority_queue<int> pq;
    int mn = INT_MAX, ans = INT_MAX;
    for (int x : nums) { int v = x % 2 ? x * 2 : x; pq.push(v); mn = min(mn, v); }
    for (;;) {
        int x = pq.top();
        ans = min(ans, x - mn);
        if (x % 2) return ans;
        pq.pop();
        pq.push(x / 2);
        mn = min(mn, x / 2);
    }
}`,
        java: `int minimumDeviation(int[] nums) {
    PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());
    int mn = Integer.MAX_VALUE, ans = Integer.MAX_VALUE;
    for (int x : nums) { int v = x % 2 == 1 ? x * 2 : x; pq.offer(v); mn = Math.min(mn, v); }
    while (true) {
        int x = pq.peek();
        ans = Math.min(ans, x - mn);
        if (x % 2 == 1) return ans;
        pq.poll();
        pq.offer(x / 2);
        mn = Math.min(mn, x / 2);
    }
}`,
        javascript: `function minimumDeviation(nums) {
  const h = nums.map((x) => (x % 2 ? x * 2 : x));
  let mn = Math.min(...h), ans = Infinity;
  const down = (i) => {
    for (;;) {
      let m = i;
      const l = 2 * i + 1, r = l + 1;
      if (l < h.length && h[l] > h[m]) m = l;
      if (r < h.length && h[r] > h[m]) m = r;
      if (m === i) return;
      [h[i], h[m]] = [h[m], h[i]];
      i = m;
    }
  };
  for (let i = (h.length >> 1) - 1; i >= 0; i--) down(i);
  for (;;) {
    const x = h[0];
    ans = Math.min(ans, x - mn);
    if (x % 2) return ans;
    h[0] = x / 2;
    mn = Math.min(mn, h[0]);
    down(0);
  }
}`,
      },
    },
    {
      name: '所有候選值 + 涵蓋全部的最小視窗',
      idea: '每個數列出所有可能值(帶上編號);全部排序後,用滑動視窗找「每個編號都至少出現一次」的最短區間,長度(hi − lo)就是答案。',
      steps: ['對每個 x:奇數 → {x, 2x};偶數 → 一路除到奇數的所有值', '`cand = sorted((v, idx))`', '滑動視窗:右端擴張,計數每個 idx;覆蓋全部 n 個時縮左端並更新 `hi − lo`', '回傳最小值'],
      figure: { title: `nums = [${A}]`, steps: winFig() },
      complexity: { time: 'O(n log V · log(n log V))', space: 'O(n log V)', why: '候選值總數 n log V,排序後線性滑動。' },
      verdict: '換個角度變成[[p:sliding-window]]的「涵蓋所有類別的最小視窗」,不需要想清楚貪心的正確性。',
      code: {
        python: `def minimumDeviation(nums):
    cand = []
    for i, x in enumerate(nums):
        if x % 2:
            cand += [(x, i), (2 * x, i)]
        else:
            while True:
                cand.append((x, i))
                if x % 2:
                    break
                x //= 2
    cand.sort()
    n, cnt, have = len(nums), [0] * len(nums), 0
    ans, l = float('inf'), 0
    for v, i in cand:
        cnt[i] += 1
        if cnt[i] == 1:
            have += 1
        while have == n:                      # 每個數都有代表在視窗裡
            ans = min(ans, v - cand[l][0])
            j = cand[l][1]
            cnt[j] -= 1
            if cnt[j] == 0:
                have -= 1
            l += 1
    return ans`,
        c: `typedef struct { int v, i; } P;
static int cmpP(const void *a, const void *b) { const P *x = a, *y = b; return x->v != y->v ? (x->v > y->v) - (x->v < y->v) : x->i - y->i; }

int minimumDeviation(int *nums, int numsSize) {
    int n = numsSize, m = 0;
    P *c = malloc(n * 32 * sizeof(P));
    for (int i = 0; i < n; i++) {
        int x = nums[i];
        if (x % 2) { c[m++] = (P){x, i}; c[m++] = (P){x * 2, i}; }
        else for (;;) { c[m++] = (P){x, i}; if (x % 2) break; x /= 2; }
    }
    qsort(c, m, sizeof(P), cmpP);
    int *cnt = calloc(n, sizeof(int)), have = 0, l = 0, ans = INT_MAX;
    for (int r = 0; r < m; r++) {
        if (cnt[c[r].i]++ == 0) have++;
        while (have == n) {
            if (c[r].v - c[l].v < ans) ans = c[r].v - c[l].v;
            if (--cnt[c[l].i] == 0) have--;
            l++;
        }
    }
    free(c); free(cnt);
    return ans;
}`,
        cpp: `int minimumDeviation(vector<int>& nums) {
    int n = nums.size();
    vector<pair<int, int>> c;
    for (int i = 0; i < n; i++) {
        int x = nums[i];
        if (x % 2) { c.push_back({x, i}); c.push_back({x * 2, i}); }
        else for (;;) { c.push_back({x, i}); if (x % 2) break; x /= 2; }
    }
    sort(c.begin(), c.end());
    vector<int> cnt(n, 0);
    int have = 0, l = 0, ans = INT_MAX;
    for (auto &[v, i] : c) {
        if (cnt[i]++ == 0) have++;
        while (have == n) {
            ans = min(ans, v - c[l].first);
            if (--cnt[c[l].second] == 0) have--;
            l++;
        }
    }
    return ans;
}`,
        java: `int minimumDeviation(int[] nums) {
    int n = nums.length;
    List<int[]> c = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        int x = nums[i];
        if (x % 2 == 1) { c.add(new int[]{x, i}); c.add(new int[]{x * 2, i}); }
        else while (true) { c.add(new int[]{x, i}); if (x % 2 == 1) break; x /= 2; }
    }
    c.sort((a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : a[1] - b[1]);
    int[] cnt = new int[n];
    int have = 0, l = 0, ans = Integer.MAX_VALUE;
    for (int[] p : c) {
        if (cnt[p[1]]++ == 0) have++;
        while (have == n) {
            ans = Math.min(ans, p[0] - c.get(l)[0]);
            if (--cnt[c.get(l)[1]] == 0) have--;
            l++;
        }
    }
    return ans;
}`,
        javascript: `function minimumDeviation(nums) {
  const n = nums.length, c = [];
  nums.forEach((x, i) => {
    if (x % 2) c.push([x, i], [x * 2, i]);
    else
      for (;;) {
        c.push([x, i]);
        if (x % 2) break;
        x /= 2;
      }
  });
  c.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cnt = new Array(n).fill(0);
  let have = 0, l = 0, ans = Infinity;
  for (const [v, i] of c) {
    if (cnt[i]++ === 0) have++;
    while (have === n) {
      ans = Math.min(ans, v - c[l][0]);
      if (--cnt[c[l][1]] === 0) have--;
      l++;
    }
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['同時要考慮「乘」和「除」兩個方向,很容易亂掉 —— 先把奇數乘 2,統一成只能往下', '最大值變成奇數之後還繼續:它不能再變小,偏差不會再改善', '奇數乘 2 可能超過 int?值 ≤ 10⁹,乘 2 是 2·10⁹ < 2³¹,剛好放得下'],
  check: {
    kind: 'fn',
    fn: 'minimumDeviation',
    cases: [
      { args: [[1, 2, 3, 4]], out: 1 },
      { args: [A], out: 3 },
      { args: [[2, 10, 8]], out: 3 },
      { args: [[3, 5]], out: 1 },
      { args: [[8]], out: 0 },
    ],
  },
}

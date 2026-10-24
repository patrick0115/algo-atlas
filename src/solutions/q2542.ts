import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2542. Maximum Subsequence Score

const N1 = [1, 3, 3, 2]
const N2 = [2, 1, 3, 4]
const K = 3

function heapFig(): FigStep[] {
  return [
    { note: `選 ${K} 個索引,分數 = (nums1 的和) × (nums2 的最小值)。把配對依 nums2 **由大到小**排:走到第 i 個時,它的 nums2 就是「前 i 個裡最小的」`, views: [arr(['(2,4)', '(3,3)', '(1,2)', '(3,1)'], { label: '(nums1, nums2) 依 nums2 遞減' })] },
    { note: `固定目前這個當「最小的 nums2」,剩下的 ${K - 1} 個從前面挑 nums1 最大的 → 用大小為 ${K} 的最小堆積維護「前面最大的 ${K} 個 nums1」`, views: [arr([2, 3, 1], { label: '前 3 個的 nums1(堆積)' })] },
    { note: '第 3 個(nums2 = 2):堆積 {2, 3, 1},和 6 × 2 = 12。第 4 個(nums2 = 1):加入 3、踢掉最小的 1 → {2, 3, 3},和 8 × 1 = 8。答案 12', views: [arr([12, 8], { label: '各個「最小值」對應的最佳分數', done: [0] })] },
  ]
}

function bruteFig(): FigStep[] {
  return [
    { note: '直接一點:枚舉誰當「nums2 最小的那個」i;能選的其他索引必須 nums2 ≥ nums2[i]', views: [arr(N2, { label: 'nums2', highlight: [0] })] },
    { note: '在這些候選裡挑 nums1 最大的 k − 1 個(排序),加上 nums1[i]。每個 i 都排序一次 → O(n² log n)', views: [arr(N1, { label: 'nums1', done: [0, 2, 3] })] },
  ]
}

export const q2542: Solution = {
  id: 2542,
  plain: '從兩排等長的數字裡,選同樣位置的 k 組。分數 = 選到的第一排數字加總 × 選到的第二排數字裡最小的那個。分數最高是多少?',
  statement: '給長度 n 的 `nums1`、`nums2` 和正整數 `k`。選 k 個不同索引,分數 = (這些索引的 nums1 總和) × (這些索引的 nums2 最小值)。回傳最大分數。',
  examples: [
    { input: 'nums1 = [1,3,3,2], nums2 = [2,1,3,4], k = 3', output: '12', note: '選索引 0、2、3:(1+3+2) × min(2,3,4) = 12' },
    { input: 'nums1 = [4,2,3,1,1], nums2 = [7,5,10,9,6], k = 1', output: '30' },
  ],
  constraints: ['n ≤ 10⁵', '值 ≤ 10⁵ → 分數可達約 10¹⁵,要用 64 位元'],
  insight: ['兩個量互相影響:和要大、最小值也要大', '固定「誰是 nums2 最小的」,問題就變成「在 nums2 比它大的裡面,挑 nums1 最大的 k − 1 個」', '依 nums2 由大到小掃描,候選集合只會變大 → 最小堆積維護前 k 大的 nums1 和'],
  approaches: [
    {
      name: '依 nums2 遞減排序 + 最小堆積',
      idea: '配對依 nums2 遞減;掃描時把 nums1 推進大小 k 的最小堆積(維護和),堆積滿 k 個時 `ans = max(ans, sum × 目前的 nums2)`。',
      steps: ['`pairs = sorted(zip(nums2, nums1), reverse=True)`', '`for b, a in pairs`:push a、`s += a`;超過 k 個就 pop 最小的、`s −= 它`', '剛好 k 個時 `ans = max(ans, s * b)`', '回傳 ans'],
      figure: { title: `nums1 = [${N1}],nums2 = [${N2}],k = ${K}`, steps: heapFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 + 每個元素一次堆積操作。' },
      verdict: '最推薦。「固定一個維度、另一個維度用堆積維護前 k 大」是這類「和 × 最小值」問題的標準解。',
      code: {
        python: `import heapq

def maxScore(nums1, nums2, k):
    pairs = sorted(zip(nums2, nums1), reverse=True)   # nums2 由大到小
    h, s, ans = [], 0, 0
    for b, a in pairs:
        heapq.heappush(h, a)
        s += a
        if len(h) > k:
            s -= heapq.heappop(h)             # 踢掉最小的 nums1
        if len(h) == k:
            ans = max(ans, s * b)             # b 是目前選到的 nums2 最小值
    return ans`,
        c: `static int *A_, *B_;
static int cmpIdx(const void *x, const void *y) { return B_[*(int *)y] - B_[*(int *)x]; }

long long maxScore(int *nums1, int nums1Size, int *nums2, int nums2Size, int k) {
    int n = nums1Size, *idx = malloc(n * sizeof(int)), *h = malloc((k + 2) * sizeof(int)), hn = 0;
    for (int i = 0; i < n; i++) idx[i] = i;
    A_ = nums1; B_ = nums2;
    qsort(idx, n, sizeof(int), cmpIdx);
    long long s = 0, ans = 0;
    for (int t = 0; t < n; t++) {
        int a = nums1[idx[t]];
        h[hn] = a; s += a;                    // 推進最小堆積
        for (int i = hn++; i && h[(i - 1) / 2] > h[i]; i = (i - 1) / 2) { int x = h[i]; h[i] = h[(i - 1) / 2]; h[(i - 1) / 2] = x; }
        if (hn > k) {                         // 彈出最小的
            s -= h[0];
            h[0] = h[--hn];
            for (int i = 0;;) {
                int m = i, l = 2 * i + 1, r = l + 1;
                if (l < hn && h[l] < h[m]) m = l;
                if (r < hn && h[r] < h[m]) m = r;
                if (m == i) break;
                int x = h[i]; h[i] = h[m]; h[m] = x;
                i = m;
            }
        }
        if (hn == k && s * nums2[idx[t]] > ans) ans = s * nums2[idx[t]];
    }
    free(idx); free(h);
    return ans;
}`,
        cpp: `long long maxScore(vector<int>& nums1, vector<int>& nums2, int k) {
    int n = nums1.size();
    vector<pair<int, int>> p(n);
    for (int i = 0; i < n; i++) p[i] = {nums2[i], nums1[i]};
    sort(p.rbegin(), p.rend());
    priority_queue<int, vector<int>, greater<int>> h;
    long long s = 0, ans = 0;
    for (auto [b, a] : p) {
        h.push(a); s += a;
        if ((int)h.size() > k) { s -= h.top(); h.pop(); }
        if ((int)h.size() == k) ans = max(ans, s * b);
    }
    return ans;
}`,
        java: `long maxScore(int[] nums1, int[] nums2, int k) {
    int n = nums1.length;
    Integer[] idx = new Integer[n];
    for (int i = 0; i < n; i++) idx[i] = i;
    Arrays.sort(idx, (x, y) -> nums2[y] - nums2[x]);
    PriorityQueue<Integer> h = new PriorityQueue<>();
    long s = 0, ans = 0;
    for (int i : idx) {
        h.offer(nums1[i]); s += nums1[i];
        if (h.size() > k) s -= h.poll();
        if (h.size() == k) ans = Math.max(ans, s * nums2[i]);
    }
    return ans;
}`,
        javascript: `function maxScore(nums1, nums2, k) {
  const idx = nums1.map((_, i) => i).sort((x, y) => nums2[y] - nums2[x]);
  const h = [];
  const push = (v) => {
    h.push(v);
    for (let i = h.length - 1; i && h[(i - 1) >> 1] > h[i]; i = (i - 1) >> 1) [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]];
  };
  const pop = () => {
    const top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      for (let i = 0; ; ) {
        let m = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < h.length && h[l] < h[m]) m = l;
        if (r < h.length && h[r] < h[m]) m = r;
        if (m === i) break;
        [h[i], h[m]] = [h[m], h[i]];
        i = m;
      }
    }
    return top;
  };
  let s = 0, ans = 0;
  for (const i of idx) {
    push(nums1[i]);
    s += nums1[i];
    if (h.length > k) s -= pop();
    if (h.length === k) ans = Math.max(ans, s * nums2[i]);
  }
  return ans;
}`,
      },
    },
    {
      name: '枚舉最小值 + 每次排序',
      idea: '對每個 i 當作 nums2 的最小值:候選 = 其他 nums2[j] ≥ nums2[i] 的 j(相等時用索引決定,避免重複),挑 nums1 最大的 k − 1 個。',
      steps: ['`for i`:候選 = `[nums1[j] for j != i if (nums2[j], j) > (nums2[i], i)]`', '候選不足 k − 1 個 → 跳過', '取最大的 k − 1 個加上 nums1[i],乘上 nums2[i]', '取最大值'],
      figure: { title: `nums1 = [${N1}],nums2 = [${N2}],k = ${K}`, steps: bruteFig() },
      complexity: { time: 'O(n² log n)', space: 'O(n)', why: '每個 i 都排序一次候選。' },
      verdict: '直接照「固定最小值」的想法做;排序 + 堆積就是把每次重新排序省掉。',
      code: {
        python: `def maxScore(nums1, nums2, k):
    n, ans = len(nums1), 0
    for i in range(n):
        cand = sorted((nums1[j] for j in range(n) if (nums2[j], j) > (nums2[i], i)), reverse=True)
        if len(cand) >= k - 1:
            ans = max(ans, (nums1[i] + sum(cand[:k - 1])) * nums2[i])
    return ans`,
        c: `static int cmpDesc(const void *x, const void *y) { return *(int *)y - *(int *)x; }

long long maxScore(int *nums1, int nums1Size, int *nums2, int nums2Size, int k) {
    int n = nums1Size, *cand = malloc(n * sizeof(int));
    long long ans = 0;
    for (int i = 0; i < n; i++) {
        int m = 0;
        for (int j = 0; j < n; j++)
            if (nums2[j] > nums2[i] || (nums2[j] == nums2[i] && j > i)) cand[m++] = nums1[j];
        if (m < k - 1) continue;
        qsort(cand, m, sizeof(int), cmpDesc);
        long long s = nums1[i];
        for (int t = 0; t < k - 1; t++) s += cand[t];
        if (s * nums2[i] > ans) ans = s * nums2[i];
    }
    free(cand);
    return ans;
}`,
        cpp: `long long maxScore(vector<int>& nums1, vector<int>& nums2, int k) {
    int n = nums1.size();
    long long ans = 0;
    for (int i = 0; i < n; i++) {
        vector<int> cand;
        for (int j = 0; j < n; j++)
            if (nums2[j] > nums2[i] || (nums2[j] == nums2[i] && j > i)) cand.push_back(nums1[j]);
        if ((int)cand.size() < k - 1) continue;
        sort(cand.rbegin(), cand.rend());
        long long s = nums1[i];
        for (int t = 0; t < k - 1; t++) s += cand[t];
        ans = max(ans, s * nums2[i]);
    }
    return ans;
}`,
        java: `long maxScore(int[] nums1, int[] nums2, int k) {
    int n = nums1.length;
    long ans = 0;
    for (int i = 0; i < n; i++) {
        List<Integer> cand = new ArrayList<>();
        for (int j = 0; j < n; j++)
            if (nums2[j] > nums2[i] || (nums2[j] == nums2[i] && j > i)) cand.add(nums1[j]);
        if (cand.size() < k - 1) continue;
        cand.sort(Collections.reverseOrder());
        long s = nums1[i];
        for (int t = 0; t < k - 1; t++) s += cand.get(t);
        ans = Math.max(ans, s * nums2[i]);
    }
    return ans;
}`,
        javascript: `function maxScore(nums1, nums2, k) {
  const n = nums1.length;
  let ans = 0;
  for (let i = 0; i < n; i++) {
    const cand = [];
    for (let j = 0; j < n; j++) if (nums2[j] > nums2[i] || (nums2[j] === nums2[i] && j > i)) cand.push(nums1[j]);
    if (cand.length < k - 1) continue;
    cand.sort((a, b) => b - a);
    let s = nums1[i];
    for (let t = 0; t < k - 1; t++) s += cand[t];
    ans = Math.max(ans, s * nums2[i]);
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['依 nums1 排序:沒辦法同時控制最小值', '和用 int:10⁵ × 10⁵ 的和再乘 10⁵ 會溢位', '堆積還沒滿 k 個就計算分數'],
  check: {
    kind: 'fn',
    fn: 'maxScore',
    cases: [
      { args: [N1, N2, K], out: 12 },
      { args: [[4, 2, 3, 1, 1], [7, 5, 10, 9, 6], 1], out: 30 },
      { args: [[2, 1, 14, 12], [11, 7, 13, 6], 3], out: 168 },
      { args: [[1, 1], [1, 1], 2], out: 2 },
    ],
  },
}

import { arr } from '../engine/helpers'
import type { Solution } from './types'

const CHECK = {
  python: `
def pairsCheck(nums1, nums2, k):
    out = kSmallestPairs(nums1, nums2, k)
    all_pairs = [(a, b) for a in nums1 for b in nums2]
    if len(out) != min(k, len(all_pairs)):
        return -1
    from collections import Counter
    if any(count > Counter(all_pairs)[tuple(pair)] for pair, count in Counter(map(tuple, out)).items()):
        return -1
    expected = sum(sorted(a + b for a, b in all_pairs)[:k])
    return len(out) if sum(a + b for a, b in out) == expected else -1`,
  c: `
int pairsCheck(int *a, int aSize, int *b, int bSize, int k) {
    int size = 0, *cols = NULL;
    int **out = kSmallestPairs(a, aSize, b, bSize, k, &size, &cols);
    int total = aSize * bSize;
    int want = k < total ? k : total;
    if (size != want) return -1;
    int *sums = malloc(total * sizeof(int));
    int at = 0;
    for (int i = 0; i < aSize; i++) {
        for (int j = 0; j < bSize; j++) {
            sums[at++] = a[i] + b[j];
        }
    }
    for (int i = 0; i < total; i++) {
        for (int j = i + 1; j < total; j++) {
            if (sums[j] < sums[i]) {
                int t = sums[i];
                sums[i] = sums[j];
                sums[j] = t;
            }
        }
    }
    long long expected = 0, actual = 0;
    for (int i = 0; i < want; i++) {
        expected += sums[i];
    }
    for (int i = 0; i < size; i++) {
        int possible = 0, used = 0;
        for (int x = 0; x < aSize; x++) {
            for (int y = 0; y < bSize; y++) {
                if (a[x] == out[i][0] && b[y] == out[i][1]) possible++;
            }
        }
        for (int j = 0; j <= i; j++) {
            if (out[j][0] == out[i][0] && out[j][1] == out[i][1]) used++;
        }
        if (used > possible) return -1;
        actual += out[i][0] + out[i][1];
    }
    return actual == expected ? size : -1;
}`,
  cpp: `
int pairsCheck(vector<int> a, vector<int> b, int k) {
    auto out = kSmallestPairs(a, b, k);
    vector<int> sums;
    map<pair<int, int>, int> available, used;
    for (int x : a) for (int y : b) {
        sums.push_back(x + y);
        available[{x, y}]++;
    }
    if (out.size() != min((size_t)k, sums.size())) return -1;
    sort(sums.begin(), sums.end());
    long long expected = accumulate(sums.begin(), sums.begin() + out.size(), 0LL);
    long long actual = 0;
    for (auto &p : out) {
        if (++used[{p[0], p[1]}] > available[{p[0], p[1]}]) return -1;
        actual += p[0] + p[1];
    }
    return actual == expected ? out.size() : -1;
}`,
  java: `
int pairsCheck(int[] a, int[] b, int k) {
    List<List<Integer>> out = kSmallestPairs(a, b, k);
    List<Integer> sums = new ArrayList<>();
    Map<String, Integer> available = new HashMap<>(), used = new HashMap<>();
    for (int x : a) for (int y : b) {
        sums.add(x + y);
        String key = x + "," + y;
        available.put(key, available.getOrDefault(key, 0) + 1);
    }
    if (out.size() != Math.min(k, sums.size())) return -1;
    Collections.sort(sums);
    long expected = 0, actual = 0;
    for (int i = 0; i < out.size(); i++) expected += sums.get(i);
    for (List<Integer> p : out) {
        String key = p.get(0) + "," + p.get(1);
        used.put(key, used.getOrDefault(key, 0) + 1);
        if (used.get(key) > available.getOrDefault(key, 0)) return -1;
        actual += p.get(0) + p.get(1);
    }
    return actual == expected ? out.size() : -1;
}`,
  javascript: `
function pairsCheck(nums1, nums2, k) {
  const out = kSmallestPairs(nums1, nums2, k);
  const sums = [], available = new Map(), used = new Map();
  for (const a of nums1) for (const b of nums2) {
    sums.push(a + b);
    const key = a + ',' + b;
    available.set(key, (available.get(key) || 0) + 1);
  }
  if (out.length !== Math.min(k, sums.length)) return -1;
  sums.sort((a, b) => a - b);
  const expected = sums.slice(0, out.length).reduce((a, b) => a + b, 0);
  let actual = 0;
  for (const [a, b] of out) {
    const key = a + ',' + b;
    used.set(key, (used.get(key) || 0) + 1);
    if (used.get(key) > (available.get(key) || 0)) return -1;
    actual += a + b;
  }
  return actual === expected ? out.length : -1;
}`,
}

export const q0373: Solution = {
  id: 373,
  plain: '兩個已排序陣列各選一個數配成一對，找總和最小的前 k 對。',
  statement: '給非遞減陣列 nums1、nums2 與 k，回傳總和最小的 k 個索引配對所形成的數值對；配對數不足 k 時回傳全部。',
  examples: [{ input: 'nums1 = [1,7,11], nums2 = [2,4,6], k = 3', output: '[[1,2],[1,4],[1,6]]' }, { input: 'nums1 = [1,1,2], nums2 = [1,2,3], k = 2', output: '[[1,1],[1,1]]' }],
  constraints: ['兩陣列各最多 10⁵ 個元素；只需前 k 對，不能總是展開所有乘積。'],
  insight: ['直接列出所有配對並排序可以確認答案，但乘積可能非常大。', '固定 nums1[i] 後，與 nums2[0], nums2[1]… 配成的和非遞減。', '每列只放當前最小的配對進 [[p:heap-sort]] 所用的最小堆，取出後再放該列下一對。'],
  approaches: [
    {
      name: '展開所有配對後排序',
      idea: '把每個 `(a,b)` 及其總和列出，排序後取前 k 個。',
      steps: ['雙層迴圈列出所有配對', '按總和由小到大排序', '取前 min(k,配對總數) 個'],
      figure: { title: 'nums1=[1,7,11], nums2=[2,4,6], k=3', steps: [
        { note: '第一列 1 配上 2、4、6，總和依序 3、5、7。', views: [arr(['1+2=3', '1+4=5', '1+6=7'], { label: '第一列' })] },
        { note: '第二列 7 配上 2、4、6，總和 9、11、13。', views: [arr(['7+2=9', '7+4=11', '7+6=13'], { label: '第二列' })] },
        { note: '第三列 11 配上 2、4、6，總和 13、15、17。', views: [arr(['11+2=13', '11+4=15', '11+6=17'], { label: '第三列' })] },
        { note: '全部排序後取最小三個：3、5、7，對應 [1,2]、[1,4]、[1,6]。', views: [arr([3, 5, 7, 9, 11, 13, 13, 15, 17], { label: '排序後總和', done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(mn log(mn))', space: 'O(mn)', why: '列出 mn 個配對並排序。' },
      verdict: '適合小輸入驗算，陣列很大時會耗費大量記憶體。',
      code: {
        python: `def kSmallestPairs(nums1, nums2, k):
    pairs = [(a + b, a, b) for a in nums1 for b in nums2]
    pairs.sort()
    return [[a, b] for _, a, b in pairs[:k]]  # 只取最小的 k 對${CHECK.python}`,
        c: `struct Pair373 { int sum, a, b; };

static int cmp373(const void *x, const void *y) {
    const struct Pair373 *a = x, *b = y;
    return (a->sum > b->sum) - (a->sum < b->sum);
}

int **kSmallestPairs(int *nums1, int nums1Size, int *nums2, int nums2Size, int k, int *returnSize, int **returnColumnSizes) {
    int total = nums1Size * nums2Size, at = 0;
    struct Pair373 *pairs = malloc(total * sizeof(struct Pair373));
    for (int i = 0; i < nums1Size; i++) {
        for (int j = 0; j < nums2Size; j++) {
            pairs[at++] = (struct Pair373){nums1[i] + nums2[j], nums1[i], nums2[j]};
        }
    }
    qsort(pairs, total, sizeof(struct Pair373), cmp373);
    *returnSize = k < total ? k : total;
    int **out = malloc(*returnSize * sizeof(int *));
    *returnColumnSizes = malloc(*returnSize * sizeof(int));
    for (int i = 0; i < *returnSize; i++) {
        out[i] = malloc(2 * sizeof(int));
        out[i][0] = pairs[i].a;
        out[i][1] = pairs[i].b;
        (*returnColumnSizes)[i] = 2;
    }
    free(pairs);
    return out;
}${CHECK.c}`,
        cpp: `vector<vector<int>> kSmallestPairs(vector<int>& nums1, vector<int>& nums2, int k) {
    vector<array<int, 3>> pairs;
    for (int a : nums1) {
        for (int b : nums2) {
            pairs.push_back({a + b, a, b});
        }
    }
    sort(pairs.begin(), pairs.end());
    vector<vector<int>> out;
    for (int i = 0; i < k && i < (int)pairs.size(); i++) out.push_back({pairs[i][1], pairs[i][2]});
    return out;
}${CHECK.cpp}`,
        java: `List<List<Integer>> kSmallestPairs(int[] nums1, int[] nums2, int k) {
    List<int[]> pairs = new ArrayList<>();
    for (int a : nums1) {
        for (int b : nums2) {
            pairs.add(new int[]{a + b, a, b});
        }
    }
    pairs.sort((x, y) -> Integer.compare(x[0], y[0]));
    List<List<Integer>> out = new ArrayList<>();
    for (int i = 0; i < k && i < pairs.size(); i++) out.add(Arrays.asList(pairs.get(i)[1], pairs.get(i)[2]));
    return out;
}${CHECK.java}`,
        javascript: `function kSmallestPairs(nums1, nums2, k) {
  const pairs = [];
  for (const a of nums1) {
    for (const b of nums2) {
      pairs.push([a + b, a, b]);
    }
  }
  pairs.sort((x, y) => x[0] - y[0]);
  return pairs.slice(0, k).map(([, a, b]) => [a, b]);
}${CHECK.javascript}`,
      },
    },
    {
      name: '最小堆合併多條有序列',
      idea: '每個 nums1[i] 對應一條由小到大的配對列；堆內只留各列下一個候選。',
      steps: ['每列先將 `(i,0)` 入堆，最多放 k 列', '取出最小和的 `(i,j)` 加入答案', '若 j+1 尚存在，把 `(i,j+1)` 入堆', '重複直到取得 k 對或堆為空'],
      figure: { title: 'nums1=[1,7,11], nums2=[2,4,6], k=3', steps: [
        { note: '各列先放第一對：[1,2] 和 3、[7,2] 和 9、[11,2] 和 13。', views: [arr([3, 9, 13], { label: '候選總和', highlight: [0] })] },
        { note: '取出最小的 [1,2]，接著把同一列的 [1,4]（和 5）入堆。', views: [arr([5, 9, 13], { label: '候選總和', highlight: [0] }), arr(['1,2'], { label: '答案' })] },
        { note: '再取 [1,4]，推進同列到 [1,6]（和 7）。', views: [arr([7, 9, 13], { label: '候選總和', highlight: [0] }), arr(['1,2', '1,4'], { label: '答案' })] },
        { note: '第三次取 [1,6]，已拿到 k=3 對，可以停止。', views: [arr(['1,2', '1,4', '1,6'], { label: '答案', done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(k log min(m,k))', space: 'O(min(m,k))，不含答案', why: '堆最多保留 min(m,k) 條列的頭，每次取出及放入為對數時間。' },
      verdict: '推薦；只產生真正需要的前 k 對。',
      code: {
        python: `import heapq

def kSmallestPairs(nums1, nums2, k):
    if not nums1 or not nums2:
        return []
    heap = [(nums1[i] + nums2[0], i, 0) for i in range(min(k, len(nums1)))]
    heapq.heapify(heap)
    out = []
    while heap and len(out) < k:
        _, i, j = heapq.heappop(heap)
        out.append([nums1[i], nums2[j]])  # 目前全域最小的一對
        if j + 1 < len(nums2):
            heapq.heappush(heap, (nums1[i] + nums2[j + 1], i, j + 1))
    return out${CHECK.python}`,
        c: `struct Item373 { long long sum; int i, j; };

static void push373(struct Item373 *heap, int *size, struct Item373 x) {
    int p = (*size)++;
    while (p > 0 && heap[(p - 1) / 2].sum > x.sum) {
        heap[p] = heap[(p - 1) / 2];
        p = (p - 1) / 2;
    }
    heap[p] = x;
}

static struct Item373 pop373(struct Item373 *heap, int *size) {
    struct Item373 out = heap[0], last = heap[--(*size)];
    int p = 0;
    while (2 * p + 1 < *size) {
        int c = 2 * p + 1;
        if (c + 1 < *size && heap[c + 1].sum < heap[c].sum) c++;
        if (heap[c].sum >= last.sum) break;
        heap[p] = heap[c];
        p = c;
    }
    if (*size) heap[p] = last;
    return out;
}

int **kSmallestPairs(int *nums1, int nums1Size, int *nums2, int nums2Size, int k, int *returnSize, int **returnColumnSizes) {
    *returnSize = 0;
    int **out = malloc(k * sizeof(int *));
    *returnColumnSizes = malloc(k * sizeof(int));
    if (!nums1Size || !nums2Size) return out;
    int rows = nums1Size < k ? nums1Size : k, size = 0;
    struct Item373 *heap = malloc((rows + 1) * sizeof(struct Item373));
    for (int i = 0; i < rows; i++) push373(heap, &size, (struct Item373){(long long)nums1[i] + nums2[0], i, 0});
    while (size && *returnSize < k) {
        struct Item373 x = pop373(heap, &size);
        out[*returnSize] = malloc(2 * sizeof(int));
        out[*returnSize][0] = nums1[x.i];
        out[*returnSize][1] = nums2[x.j];
        (*returnColumnSizes)[(*returnSize)++] = 2;
        if (x.j + 1 < nums2Size) push373(heap, &size, (struct Item373){(long long)nums1[x.i] + nums2[x.j + 1], x.i, x.j + 1});
    }
    free(heap);
    return out;
}${CHECK.c}`,
        cpp: `vector<vector<int>> kSmallestPairs(vector<int>& nums1, vector<int>& nums2, int k) {
    vector<vector<int>> out;
    if (nums1.empty() || nums2.empty()) return out;
    using Item = tuple<long long, int, int>;
    priority_queue<Item, vector<Item>, greater<Item>> heap;
    for (int i = 0; i < (int)nums1.size() && i < k; i++) heap.push({(long long)nums1[i] + nums2[0], i, 0});
    while (!heap.empty() && (int)out.size() < k) {
        auto [sum, i, j] = heap.top();
        heap.pop();
        out.push_back({nums1[i], nums2[j]});
        if (j + 1 < (int)nums2.size()) heap.push({(long long)nums1[i] + nums2[j + 1], i, j + 1});
    }
    return out;
}${CHECK.cpp}`,
        java: `List<List<Integer>> kSmallestPairs(int[] nums1, int[] nums2, int k) {
    List<List<Integer>> out = new ArrayList<>();
    if (nums1.length == 0 || nums2.length == 0) return out;
    PriorityQueue<int[]> heap = new PriorityQueue<>((x, y) -> Long.compare((long) nums1[x[0]] + nums2[x[1]], (long) nums1[y[0]] + nums2[y[1]]));
    for (int i = 0; i < nums1.length && i < k; i++) heap.offer(new int[]{i, 0});
    while (!heap.isEmpty() && out.size() < k) {
        int[] p = heap.poll();
        int i = p[0], j = p[1];
        out.add(Arrays.asList(nums1[i], nums2[j]));
        if (j + 1 < nums2.length) heap.offer(new int[]{i, j + 1});
    }
    return out;
}${CHECK.java}`,
        javascript: `function kSmallestPairs(nums1, nums2, k) {
  if (!nums1.length || !nums2.length) return [];
  const heap = [];
  function less(a, b) {
    return nums1[a[0]] + nums2[a[1]] < nums1[b[0]] + nums2[b[1]];
  }
  function push(item) {
    let p = heap.length;
    heap.push(item);
    while (p > 0) {
      const q = Math.floor((p - 1) / 2);
      if (!less(item, heap[q])) break;
      heap[p] = heap[q];
      p = q;
    }
    heap[p] = item;
  }
  function pop() {
    const out = heap[0], last = heap.pop();
    if (heap.length) {
      let p = 0;
      while (2 * p + 1 < heap.length) {
        let c = 2 * p + 1;
        if (c + 1 < heap.length && less(heap[c + 1], heap[c])) c++;
        if (!less(heap[c], last)) break;
        heap[p] = heap[c];
        p = c;
      }
      heap[p] = last;
    }
    return out;
  }
  for (let i = 0; i < nums1.length && i < k; i++) push([i, 0]);
  const out = [];
  while (heap.length && out.length < k) {
    const [i, j] = pop();
    out.push([nums1[i], nums2[j]]);
    if (j + 1 < nums2.length) push([i, j + 1]);
  }
  return out;
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['配對以索引區分，即使值相同也可能有多個合法配對。', '只把每列第一對入堆；取出 `(i,j)` 後才放 `(i,j+1)`，避免重複。'],
  check: { kind: 'fn', fn: 'pairsCheck', cases: [
    { args: [[1, 7, 11], [2, 4, 6], 3], out: 3 },
    { args: [[1, 1, 2], [1, 2, 3], 2], out: 2 },
    { args: [[1], [3, 4], 5], out: 2 },
  ] },
}

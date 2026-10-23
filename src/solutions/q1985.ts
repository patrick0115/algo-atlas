import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1985. Find the Kth Largest Integer in the Array

const A = ['3', '6', '7', '10']
const K = 4

function sortFig(): FigStep[] {
  return [
    { note: '數字是字串,而且可能長到 100 位(超過任何整數型別)。比大小:**位數多的比較大**;位數一樣就直接比字串(字典序 = 數值順序)', views: [arr(A, { label: 'nums' })] },
    { note: '依這個規則由大到小排:10、7、6、3。第 4 大是 "3"', views: [arr(['10', '7', '6', '3'], { label: '由大到小', highlight: [3] })] },
  ]
}

function heapFig(): FigStep[] {
  return [
    { note: `維護一個大小 ${K} 的**最小堆積**(比較規則同上):放進一個數,超過 k 個就把最小的踢掉`, views: [arr(['3', '6', '7', '10'], { label: '堆積(最多 k 個)' })] },
    { note: '全部放完後,堆積裡是最大的 k 個,堆頂(其中最小的)就是第 k 大。O(n log k),k 小的時候比全部排序快', views: [arr(['3'], { label: '堆頂 = 答案', done: [0] })] },
  ]
}

export const q1985: Solution = {
  id: 1985,
  plain: '一堆用字串表示的大整數(可能很長),找出第 k 大的那個(重複的數字分開算)。',
  statement: '給字串陣列 `nums`(每個代表一個沒有前導零的整數)和 k,回傳第 k 大的整數字串。重複的數字各自計入。',
  examples: [
    { input: 'nums = ["3","6","7","10"], k = 4', output: '"3"' },
    { input: 'nums = ["2","21","12","1"], k = 3', output: '"2"' },
    { input: 'nums = ["0","0"], k = 2', output: '"0"' },
  ],
  constraints: ['n ≤ 10⁴,每個字串長度 ≤ 100 → 不能轉成整數'],
  insight: ['不能轉成數字(會溢位),要直接比較字串', '沒有前導零 → 長度長的比較大;長度一樣時字典序就是大小', '第 k 大:排序取位置 k−1,或用大小 k 的最小堆積'],
  approaches: [
    {
      name: '自訂比較排序',
      idea: '依 (長度, 字串) 由大到小排序,回傳第 k − 1 個。',
      steps: ['排序鍵 `(len(s), s)`,由大到小', '回傳 `nums[k − 1]`'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: sortFig() },
      complexity: { time: 'O(n log n · L)', space: 'O(n)', why: '排序;每次比較最壞 O(L)。' },
      verdict: '最推薦,一行搞定;關鍵是比較規則。',
      code: {
        python: `def kthLargestNumber(nums, k):
    nums = sorted(nums, key=lambda s: (len(s), s), reverse=True)   # 位數多的大,同位數比字典序
    return nums[k - 1]`,
        c: `static int cmpNum(const void *a, const void *b) {
    const char *x = *(const char **)a, *y = *(const char **)b;
    int lx = strlen(x), ly = strlen(y);
    if (lx != ly) return ly - lx;             // 由大到小
    return strcmp(y, x);
}

char *kthLargestNumber(char **nums, int numsSize, int k) {
    char **s = malloc(numsSize * sizeof(char *));
    memcpy(s, nums, numsSize * sizeof(char *));
    qsort(s, numsSize, sizeof(char *), cmpNum);
    char *ans = s[k - 1];
    free(s);
    return ans;
}`,
        cpp: `string kthLargestNumber(vector<string>& nums, int k) {
    sort(nums.begin(), nums.end(), [](const string &a, const string &b) {
        return a.size() != b.size() ? a.size() > b.size() : a > b;
    });
    return nums[k - 1];
}`,
        java: `String kthLargestNumber(String[] nums, int k) {
    String[] s = nums.clone();
    Arrays.sort(s, (a, b) -> a.length() != b.length() ? b.length() - a.length() : b.compareTo(a));
    return s[k - 1];
}`,
        javascript: `function kthLargestNumber(nums, k) {
  const s = [...nums].sort((a, b) => (a.length !== b.length ? b.length - a.length : a < b ? 1 : a > b ? -1 : 0));
  return s[k - 1];
}`,
      },
    },
    {
      name: '大小 k 的最小堆積',
      idea: '依同樣的比較規則維護最小堆積;超過 k 個就彈出最小的;最後堆頂就是答案。',
      steps: ['`h = []`', '`for s in nums`:push s;`len(h) > k` → pop', '回傳堆頂'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: heapFig() },
      complexity: { time: 'O(n log k · L)', space: 'O(k)', why: '每個數一次堆積操作。' },
      verdict: '[[p:heap]]的「第 k 大」標準作法;k 遠小於 n 時比排序省。',
      code: {
        python: `import heapq

def kthLargestNumber(nums, k):
    h = []
    for s in nums:
        heapq.heappush(h, (len(s), s))        # (位數, 字串) 的順序 = 數值順序
        if len(h) > k:
            heapq.heappop(h)                  # 踢掉最小的
    return h[0][1]`,
        c: `static bool lessNum(const char *x, const char *y) {
    int lx = strlen(x), ly = strlen(y);
    return lx != ly ? lx < ly : strcmp(x, y) < 0;
}

char *kthLargestNumber(char **nums, int numsSize, int k) {
    char **h = malloc((k + 1) * sizeof(char *));
    int n = 0;
    for (int t = 0; t < numsSize; t++) {
        h[n] = nums[t];
        for (int i = n++; i && lessNum(h[i], h[(i - 1) / 2]); i = (i - 1) / 2) { char *x = h[i]; h[i] = h[(i - 1) / 2]; h[(i - 1) / 2] = x; }
        if (n > k) {
            h[0] = h[--n];
            for (int i = 0;;) {
                int m = i, l = 2 * i + 1, r = l + 1;
                if (l < n && lessNum(h[l], h[m])) m = l;
                if (r < n && lessNum(h[r], h[m])) m = r;
                if (m == i) break;
                char *x = h[i]; h[i] = h[m]; h[m] = x;
                i = m;
            }
        }
    }
    char *ans = h[0];
    free(h);
    return ans;
}`,
        cpp: `string kthLargestNumber(vector<string>& nums, int k) {
    auto greater = [](const string &a, const string &b) { return a.size() != b.size() ? a.size() > b.size() : a > b; };
    priority_queue<string, vector<string>, decltype(greater)> pq(greater);   // 堆頂是最小的
    for (auto &s : nums) {
        pq.push(s);
        if ((int)pq.size() > k) pq.pop();
    }
    return pq.top();
}`,
        java: `String kthLargestNumber(String[] nums, int k) {
    PriorityQueue<String> pq = new PriorityQueue<>((a, b) -> a.length() != b.length() ? a.length() - b.length() : a.compareTo(b));
    for (String s : nums) {
        pq.offer(s);
        if (pq.size() > k) pq.poll();
    }
    return pq.peek();
}`,
        javascript: `function kthLargestNumber(nums, k) {
  const less = (a, b) => (a.length !== b.length ? a.length < b.length : a < b);
  const h = [];
  for (const s of nums) {
    h.push(s);
    for (let i = h.length - 1; i && less(h[i], h[(i - 1) >> 1]); i = (i - 1) >> 1) [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]];
    if (h.length > k) {
      h[0] = h.pop();
      for (let i = 0; ; ) {
        let m = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < h.length && less(h[l], h[m])) m = l;
        if (r < h.length && less(h[r], h[m])) m = r;
        if (m === i) break;
        [h[i], h[m]] = [h[m], h[i]];
        i = m;
      }
    }
  }
  return h[0];
}`,
      },
    },
  ],
  pitfalls: ['直接比字串:"10" < "6"(字典序),但數值是 10 > 6', '轉成 int / long:100 位的數會溢位', '重複的數要分開算,不能先去重'],
  check: {
    kind: 'fn',
    fn: 'kthLargestNumber',
    cases: [
      { args: [A, K], out: '3' },
      { args: [['2', '21', '12', '1'], 3], out: '2' },
      { args: [['0', '0'], 2], out: '0' },
      { args: [['623986800', '3', '887298', '695', '794', '6888794705', '269409', '59930972', '723091307', '726368', '8028385786', '378585'], 11], out: '695' },
    ],
  },
}

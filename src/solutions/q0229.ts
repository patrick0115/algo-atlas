import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 229. Majority Element II
const A = [3,2,3]
const fig = [
  { note: '開始沒有候選人。讀到第一個 3，讓它成為候選一，票數是 1。', views: [arr(A, { label: '掃到索引 0', highlight: [0] }), arr(['3:1'], { label: '候選與票數' })] },
  { note: '門檻是出現次數 > ⌊n/3⌋。不可能有三個不同數都超過門檻，所以最多只有兩位候選者。', views: [arr([3,2,3], { label: 'nums', highlight: [0,2] })] },
  { note: '讀到 2 時，把它放到第二個空位；再讀到 3，第一個候選人的票數增為 2。', views: [arr(A, { label: '掃到索引 2', highlight: [2] }), arr(['3:2','2:1'], { label: '候選與票數' })] },
  { note: '投票法遇到三個不同值時各消掉一次；最後只留下可能的兩個候選值，還要再掃一遍核對次數。', views: [arr([3,2,3], { label: '候選 3 出現兩次', done: [0,2], dim: [1] })] },
]
const WRAP = {
  python: `\ndef majorityCheck(nums):
    return sorted(majorityElement(nums))  # 只有實際次數超過門檻才加入答案。`,
  c: `\nstatic int cmpInt(const void *a, const void *b) {
    int x = *(int*)a, y = *(int*)b;
    return (x > y) - (x < y);
}
int *majorityCheck(int *nums, int n, int *returnSize) {
    int *a = majorityElement(nums, n, returnSize);
    qsort(a, *returnSize, sizeof(int), cmpInt);
    return a;
}`,
  cpp: `\nvector<int> majorityCheck(vector<int> nums) {
    auto a = majorityElement(nums);
    sort(a.begin(), a.end());
    return a;
}`,
  java: `\nList<Integer> majorityCheck(int[] nums) {
    List<Integer> a = majorityElement(nums);
    Collections.sort(a);
    return a;
}`,
  javascript: `\nfunction majorityCheck(nums) {
    return majorityElement(nums).sort((a, b) => a - b);
}`,
}

export const q0229: Solution = {
  id: 229,
  plain: '找出陣列裡「超過三分之一」的數字。答案最多兩個，可能一個也沒有。',
  statement: '給整數陣列 nums，回傳出現次數嚴格大於 floor(n/3) 的所有值，順序不限。',
  examples: [{ input: 'nums = [3,2,3]', output: '[3]' }, { input: 'nums = [1]', output: '[1]' }, { input: 'nums = [1,2]', output: '[1,2]' }],
  constraints: ['1 ≤ nums.length ≤ 5×10⁴。', '進階要求線性時間與常數額外空間。'],
  insight: ['用 hash 表計次最直接。', '超過 n/3 的不同值最多兩個；因此可以維持兩個候選人。', '每遇到與兩候選人都不同的新值，三者各消掉一次，不會把真正超過 n/3 的元素完全消光；最後仍須驗證。'],
  approaches: [
    { name: 'Hash 表計次', idea: '記下每個數字出現多少次，再篩選超過門檻者。', steps: ['掃一次陣列建立 count。先建立計數或候選狀態，不能在還沒看完陣列時直接判定答案。', '走訪 count 的每個值。掃描時更新目前數字的次數，或抵消三種不同數字的票數。', '次數 > floor(n/3) 才加入答案。最後用原陣列核對實際次數，因為候選人不一定超過門檻。'], figure: { title: 'nums = [3,2,3]', steps: [{ note: '讀到第一個 3 時，計數表是 {3:1}；還不能確定它最後是否超過門檻。', views: [arr(A, { label: '掃到索引 0', highlight: [0] })] }, { note: '掃完後計數表是 {3:2,2:1}，因為最後一個 3 讓其次數增為 2。', views: [arr(A, { label: '掃描完成', done: [0,1,2] })] }, { note: 'n=3 的門檻是 1，只有 3 的次數嚴格大於 1，因此回傳 [3]。', views: [arr([3], { label: '答案', done: [0] })] }] }, complexity: { time: 'O(n)', space: 'O(n)', why: '最多記 n 種不同值。' }, verdict: '最易實作；需要額外記憶體。', code: {
      python: `def majorityElement(nums):
    count = {}
    for x in nums:  # 掃描數字並更新出現次數或候選票數。
        count[x] = count.get(x, 0) + 1
    return [x for x, c in count.items() if c > len(nums) // 3]${WRAP.python}`,
      c: `int *majorityElement(int *a, int n, int *returnSize) {
    int cap = 1;
    while (cap < 2 * n)
        cap *= 2;
    int *key = malloc(cap * sizeof(int)), *cnt = calloc(cap, sizeof(int)), *out = malloc(2 * sizeof(int));
    bool *used = calloc(cap, sizeof(bool));
    for (int i = 0; i < n; i++) {
        int j = (unsigned)a[i] * 2654435761u & (cap - 1);
        while (used[j] && key[j] != a[i])
            j = (j + 1) & (cap - 1);
        if (!used[j]) {
            used[j] = true;
            key[j] = a[i];
        }
        cnt[j]++;
    }
    *returnSize = 0;
    for (int j = 0; j < cap; j++)
        if (used[j] && cnt[j] > n / 3)
            out[(*returnSize)++] = key[j];
    free(key);
    free(cnt);
    free(used);
    return out;
}${WRAP.c}`,
      cpp: `vector<int> majorityElement(vector<int>& a) {
    unordered_map<int, int> cnt;
    for (int x : a)
        cnt[x]++;
    vector<int> out;
    for (auto [x, c] : cnt)
        if (c > (int)a.size() / 3)
            out.push_back(x);
    return out;
}${WRAP.cpp}`,
      java: `List<Integer> majorityElement(int[] a) {
    Map<Integer, Integer> cnt = new HashMap<>();
    for (int x : a)
        cnt.put(x, cnt.getOrDefault(x, 0) + 1);
    List<Integer> out = new ArrayList<>();
    for (int x : cnt.keySet())
        if (cnt.get(x) > a.length / 3)
            out.add(x);
    return out;
}${WRAP.java}`,
      javascript: `function majorityElement(a) {
    const cnt = new Map();
    for (const x of a)
        cnt.set(x, (cnt.get(x) || 0) + 1);
    return [...cnt].filter(([x, c]) => c > a.length / 3).map(([x]) => x);
}${WRAP.javascript}`,
    } },
    { name: 'Boyer–Moore 雙候選投票', idea: '用兩個候選值與票數抵消其他值，再重新計算候選人實際次數。', steps: ['先比對目前兩個候選值。先建立計數或候選狀態，不能在還沒看完陣列時直接判定答案。', '有空名額就設新候選；否則兩個票數都減一。掃描時更新目前數字的次數，或抵消三種不同數字的票數。', '第二次掃描候選人的真實次數，篩出超過門檻者。最後用原陣列核對實際次數，因為候選人不一定超過門檻。'], figure: { title: 'nums = [3,2,3]', steps: fig }, complexity: { time: 'O(n)', space: 'O(1)', why: '兩次線性掃描，只有兩候選與計數。' }, verdict: '符合進階要求；第二次驗證不可省。', code: {
      python: `def majorityElement(nums):
    a = b = None
    ca = cb = 0
    for x in nums:  # 掃描數字並更新出現次數或候選票數。
        if ca and x == a:  # 只有實際次數超過門檻才加入答案。
            ca += 1
        elif cb and x == b:
            cb += 1
        elif not ca:
            a = x
            ca = 1
        elif not cb:
            b = x
            cb = 1
        else:
            ca -= 1
            cb -= 1
    return [x for x in (a, b) if x is not None and nums.count(x) > len(nums) // 3]${WRAP.python}`,
      c: `int *majorityElement(int *nums, int n, int *returnSize) {
    int a = 0, b = 0, ca = 0, cb = 0;
    for (int i = 0; i < n; i++) {
        int x = nums[i];
        if (ca && x == a)
            ca++;
        else if (cb && x == b)cb++;
        else if (!ca) {
            a = x;
            ca = 1;
        }
        else if (!cb) {
            b = x;
            cb = 1;
        }
        else {
            ca--;
            cb--;
        }
    }
    ca = cb = 0;
    for (int i = 0; i < n; i++) {
        if (nums[i] == a)
            ca++;
        else if (nums[i] == b)cb++;
    }
    int *out = malloc(2 * sizeof(int));
    *returnSize = 0;
    if (ca > n / 3)
        out[(*returnSize)++] = a;
    if (cb > n / 3)
        out[(*returnSize)++] = b;
    return out;
}${WRAP.c}`,
      cpp: `vector<int> majorityElement(vector<int>& nums) {
    int a = 0, b = 0, ca = 0, cb = 0;
    for (int x : nums) {
        if (ca && x == a)
            ca++;
        else if (cb && x == b)cb++;
        else if (!ca) {
            a = x;
            ca = 1;
        }
        else if (!cb) {
            b = x;
            cb = 1;
        }
        else {
            ca--;
            cb--;
        }
    }
    ca = cb = 0;
    for (int x : nums) {
        if (x == a)
            ca++;
        else if (x == b)cb++;
    }
    vector<int> out;
    if (ca > (int)nums.size() / 3)
        out.push_back(a);
    if (cb > (int)nums.size() / 3)
        out.push_back(b);
    return out;
}${WRAP.cpp}`,
      java: `List<Integer> majorityElement(int[] nums) {
    int a = 0, b = 0, ca = 0, cb = 0;
    for (int x : nums) {
        if (ca > 0 && x == a)
            ca++;
        else if (cb > 0 && x == b)cb++;
        else if (ca == 0) {
            a = x;
            ca = 1;
        }
        else if (cb == 0) {
            b = x;
            cb = 1;
        }
        else {
            ca--;
            cb--;
        }
    }
    ca = cb = 0;
    for (int x : nums) {
        if (x == a)
            ca++;
        else if (x == b)cb++;
    }
    List<Integer> out = new ArrayList<>();
    if (ca > nums.length / 3)
        out.add(a);
    if (cb > nums.length / 3)
        out.add(b);
    return out;
}${WRAP.java}`,
      javascript: `function majorityElement(nums) {
    let a = 0, b = 0, ca = 0, cb = 0;
    for (const x of nums) {
        if (ca && x === a)
            ca++;
        else if (cb && x === b)cb++;
        else if (!ca) {
            a = x;
            ca = 1;
        }
        else if (!cb) {
            b = x;
            cb = 1;
        }
        else {
            ca--;
            cb--;
        }
    }
    ca = cb = 0;
    for (const x of nums) {
        if (x === a)
            ca++;
        else if (x === b)cb++;
    }
    const out = [];
    if (ca > nums.length / 3)
        out.push(a);
    if (cb > nums.length / 3)
        out.push(b);
    return out;
}${WRAP.javascript}`,
    } },
  ],
  pitfalls: ['比較要嚴格大於 floor(n/3)。', '投票留下候選人不代表一定達標，需第二次掃描。', '當候選票數為零時，先分配空位再抵消。'],
  check: { kind: 'fn', fn: 'majorityCheck', cases: [{ args: [A], out: [3] }, { args: [[1]], out: [1] }, { args: [[1,2]], out: [1,2] }, { args: [[1,2,3,4]], out: [] }] },
}

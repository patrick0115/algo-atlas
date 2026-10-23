import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 442. Find All Duplicates in an Array
const A = [4,3,2,7,8,2,3,1]
const fig = [
  { note: '原陣列是 [4,3,2,7,8,2,3,1]；每個值 x 使用索引 x−1 作為是否見過的標記。', views: [arr(A, { label: '原陣列', highlight: [0] })] },
  { note: '值 x 對應索引 x−1。走到第一個 2 時，把 nums[1] 變負，表示 2 已出現。', views: [arr([4,-3,-2,-7,8,2,3,1], { label: '符號記錄', highlight: [1] })] },
  { note: '掃到索引 5 的第二個 2，查看 nums[1] 已是負數，所以把 2 加入答案。', views: [arr([2], { label: '目前答案', done: [0] }), arr(A, { label: '掃到第二個 2', highlight: [5] })] },
  { note: '再次走到 2，索引 1 已是負數，因此 2 重複；3 也重複。', views: [arr(A, { label: '原陣列', highlight: [5,6] }), arr([2,3], { label: '答案', done: [0,1] })] },
]
const WRAP = {
  python: `\ndef duplicatesCheck(nums):
    return sorted(findDuplicates(nums))  # 標記已存在時，這個值就是重複值。`,
  c: `\nstatic int cmpInt(const void *a, const void *b) {
    int x = *(int*)a, y = *(int*)b;
    return (x > y) - (x < y);
}
int *duplicatesCheck(int *nums, int n, int *returnSize) {
    int *out = findDuplicates(nums, n, returnSize);
    qsort(out, *returnSize, sizeof(int), cmpInt);
    return out;
}`,
  cpp: `\nvector<int> duplicatesCheck(vector<int> nums) {
    auto out = findDuplicates(nums);
    sort(out.begin(), out.end());
    return out;
}`,
  java: `\nList<Integer> duplicatesCheck(int[] nums) {
    List<Integer> out = findDuplicates(nums);
    Collections.sort(out);
    return out;
}`,
  javascript: `\nfunction duplicatesCheck(nums) {
    return findDuplicates(nums).sort((a, b) => a - b);
}`,
}

export const q0442: Solution = {
  id: 442,
  plain: '陣列裡每個數最多出現兩次；找出出現兩次的數字。',
  statement: '給長度 n 的 nums，元素範圍為 1..n，且每個元素出現一次或兩次。回傳所有出現兩次的值，順序不限。',
  examples: [{ input: 'nums = [4,3,2,7,8,2,3,1]', output: '[2,3]' }, { input: 'nums = [1,1,2]', output: '[1]' }, { input: 'nums = [1]', output: '[]' }],
  constraints: ['1 ≤ n ≤ 10⁵。', '進階要求 O(n) 時間、O(1) 額外空間（不計答案）。'],
  insight: ['一般做法用 set 記已出現的值。', '因為值在 1..n，能把索引 x−1 當作值 x 的專屬標記格。', '把該格改為負數表示見過；第二次看見就加入答案。'],
  approaches: [
    { name: 'Set 記已見過的值', idea: '掃過每個值，已在 set 就加入答案。', steps: ['準備 seen 和答案。每次都先讀出原本的數值，因為陣列格子可能已被改成負數。', '值已出現則收進答案；否則加入 seen。利用已見過的記錄，判斷目前的值是不是第二次出現。', '掃完回傳。只把確實重複的值加入答案，掃完後返回答案陣列。'], figure: { title: 'nums = [4,3,2,7,8,2,3,1]', steps: [{ note: '先讀到 4，把 4 放入空的 seen；此時答案仍是空陣列。', views: [arr(A, { label: '掃到 4', highlight: [0] })] }, { note: '前五個值互不相同，掃完索引 4 後 seen={4,3,2,7,8}。', views: [arr(A, { label: '已掃描', done: [0,1,2,3,4] })] }, { note: '下一個 2、3 都已在 seen，因此依次加入答案，得到 [2,3]。', views: [arr(A, { label: '重複', highlight: [5,6] }), arr([2,3], { label: '答案', done: [0,1] })] }] }, complexity: { time: 'O(n)', space: 'O(n)', why: 'set 最多放 n 個值。' }, verdict: '通用於任意值域；額外空間較多。', code: {
      python: `def findDuplicates(nums):
    seen = set()
    out = []
    for x in nums:  # 逐個讀取原陣列的值，查是否曾經出現。
        if x in seen:  # 標記已存在時，這個值就是重複值。
            out.append(x)
        else:
            seen.add(x)
    return out${WRAP.python}`,
      c: `int *findDuplicates(int *a, int n, int *returnSize) {
    bool *seen = calloc(n + 1, sizeof(bool));
    int *out = malloc(n * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < n; i++) {
        int x = a[i];
        if (seen[x])
            out[(*returnSize)++] = x;
        else
            seen[x] = true;
    }
    free(seen);
    return out;
}${WRAP.c}`,
      cpp: `vector<int> findDuplicates(vector<int>& a) {
    unordered_set<int> seen;
    vector<int> out;
    for (int x : a)
        if (!seen.insert(x).second)
            out.push_back(x);
    return out;
}${WRAP.cpp}`,
      java: `List<Integer> findDuplicates(int[] a) {
    Set<Integer> seen = new HashSet<>();
    List<Integer> out = new ArrayList<>();
    for (int x : a)
        if (!seen.add(x))
            out.add(x);
    return out;
}${WRAP.java}`,
      javascript: `function findDuplicates(a) {
    const seen = new Set(), out = [];
    for (const x of a) {
        if (seen.has(x))
            out.push(x);
        else
            seen.add(x);
    }
    return out;
}${WRAP.javascript}`,
    } },
    { name: '索引符號標記', idea: '把 nums[abs(x)−1] 變負；若早已是負數，x 已出現過。', steps: ['對每個值先取 abs，因為它可能已被當標記改成負數。每次都先讀出原本的數值，因為陣列格子可能已被改成負數。', 'idx=abs(x)−1。利用已見過的記錄，判斷目前的值是不是第二次出現。', 'nums[idx]<0 則加入答案；否則把 nums[idx] 取負。只把確實重複的值加入答案，掃完後返回答案陣列。'], figure: { title: 'nums = [4,3,2,7,8,2,3,1]', steps: fig }, complexity: { time: 'O(n)', space: 'O(1)', why: '用原陣列記錄，答案不計額外空間。' }, verdict: '符合進階要求；會暫時修改輸入。', code: {
      python: `def findDuplicates(nums):
    out = []
    for v in nums:  # 逐個讀取原陣列的值，查是否曾經出現。
        x = abs(v)
        i = x - 1
        if nums[i] < 0:  # 標記已存在時，這個值就是重複值。
            out.append(x)
        else:
            nums[i] = -nums[i]
    return out${WRAP.python}`,
      c: `int *findDuplicates(int *a, int n, int *returnSize) {
    int *out = malloc(n * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < n; i++) {
        int x = abs(a[i]), j = x - 1;
        if (a[j] < 0)
            out[(*returnSize)++] = x;
        else
            a[j] = -a[j];
    }
    return out;
}${WRAP.c}`,
      cpp: `vector<int> findDuplicates(vector<int>& a) {
    vector<int> out;
    for (int v : a) {
        int x = abs(v), i = x - 1;
        if (a[i] < 0)
            out.push_back(x);
        else
            a[i] = -a[i];
    }
    return out;
}${WRAP.cpp}`,
      java: `List<Integer> findDuplicates(int[] a) {
    List<Integer> out = new ArrayList<>();
    for (int v : a) {
        int x = Math.abs(v), i = x - 1;
        if (a[i] < 0)
            out.add(x);
        else
            a[i] = -a[i];
    }
    return out;
}${WRAP.java}`,
      javascript: `function findDuplicates(a) {
    const out = [];
    for (const v of a) {
        const x = Math.abs(v), i = x - 1;
        if (a[i] < 0)
            out.push(x);
        else
            a[i] = -a[i];
    }
    return out;
}${WRAP.javascript}`,
    } },
  ],
  pitfalls: ['讀值時必須取絕對值，因為陣列已被改動。', '值 x 對應索引 x−1。', '題目保證每值最多兩次；否則每次後續出現都會重複加入答案。'],
  check: { kind: 'fn', fn: 'duplicatesCheck', cases: [{ args: [A], out: [2,3] }, { args: [[1,1,2]], out: [1] }, { args: [[1]], out: [] }] },
}

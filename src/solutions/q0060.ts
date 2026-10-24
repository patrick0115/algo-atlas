import { arr } from '../engine/helpers'
import type { Solution } from './types'

export const q0060: Solution = {
  id: 60,
  plain: '把 1 到 n 排列成字串，依字典順序取第 k 個。',
  statement: '給 `1 ≤ n ≤ 9` 與 `1 ≤ k ≤ n!`，回傳 1..n 所有排列中字典順序第 k 個。',
  examples: [{ input: 'n = 3, k = 3', output: '"213"' }, { input: 'n = 4, k = 9', output: '"2314"' }],
  constraints: ['n 最多 9，所有數字都是單一字元。'],
  insight: ['直接從 123… 反覆求下一個排列，走到第 k 個也能得到答案。', '更快的想法：固定第一位後，每個開頭各有 `(n−1)!` 個排列。', '把 k 改成從 0 開始，就能用整除決定每一位；與 [[p:backtracking]] 列舉全部排列相比省去許多工作。'],
  approaches: [
    {
      name: '逐個求下一排列',
      idea: '從最小排列開始，做 k−1 次下一排列。',
      steps: ['初始為 123…n', '由右找第一個仍能增加的位置', '交換右邊剛好較大的數，反轉後綴', '重複 k−1 次'],
      figure: { title: 'n=3, k=3', steps: [
        { note: '字典序第一個是 123。', views: [arr([1, 2, 3], { done: [0, 1, 2] })] },
        { note: '下一個排列是 132：交換尾端 2、3。', views: [arr([1, 3, 2], { highlight: [1, 2] })] },
        { note: '再找下一個：從右找到可增加的 1。', views: [arr([1, 3, 2], { highlight: [0] })] },
        { note: '用 2 換掉 1，後綴排成最小的 13，得到第 3 個 213。', views: [arr([2, 1, 3], { done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(kn)', space: 'O(n)', why: '每次下一排列掃描與反轉最多 n 個元素。' },
      verdict: '可用來理解字典序，但 k 大時做了許多不必要的排列。',
      code: {
        python: `def getPermutation(n, k):
    a = list(range(1, n + 1))
    for _ in range(k - 1):
        i = n - 2
        while a[i] >= a[i + 1]:
            i -= 1
        j = n - 1
        while a[j] <= a[i]:
            j -= 1
        a[i], a[j] = a[j], a[i]
        a[i + 1:] = reversed(a[i + 1:])  # 後綴回到最小順序
    return ''.join(map(str, a))`,
        c: `char *getPermutation(int n, int k) {
    int a[9];
    for (int i = 0; i < n; i++) a[i] = i + 1;
    for (int step = 1; step < k; step++) {
        int i = n - 2;
        while (a[i] >= a[i + 1]) i--;
        int j = n - 1;
        while (a[j] <= a[i]) j--;
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
        for (int l = i + 1, r = n - 1; l < r; l++, r--) {
            t = a[l];
            a[l] = a[r];
            a[r] = t;
        }
    }
    char *out = malloc(n + 1);
    for (int i = 0; i < n; i++) out[i] = '0' + a[i];
    out[n] = '\\0';
    return out;
}`,
        cpp: `string getPermutation(int n, int k) {
    string s;
    for (int x = 1; x <= n; x++) s += char('0' + x);
    for (int step = 1; step < k; step++) next_permutation(s.begin(), s.end());
    return s;
}`,
        java: `String getPermutation(int n, int k) {
    char[] a = new char[n];
    for (int i = 0; i < n; i++) a[i] = (char) ('1' + i);
    for (int step = 1; step < k; step++) {
        int i = n - 2;
        while (a[i] >= a[i + 1]) i--;
        int j = n - 1;
        while (a[j] <= a[i]) j--;
        char t = a[i];
        a[i] = a[j];
        a[j] = t;
        for (int l = i + 1, r = n - 1; l < r; l++, r--) {
            t = a[l];
            a[l] = a[r];
            a[r] = t;
        }
    }
    return new String(a);
}`,
        javascript: `function getPermutation(n, k) {
  const a = Array.from({ length: n }, (_, i) => i + 1);
  for (let step = 1; step < k; step++) {
    let i = n - 2;
    while (a[i] >= a[i + 1]) i--;
    let j = n - 1;
    while (a[j] <= a[i]) j--;
    [a[i], a[j]] = [a[j], a[i]];
    for (let l = i + 1, r = n - 1; l < r; l++, r--) [a[l], a[r]] = [a[r], a[l]];
  }
  return a.join('');
}`,
      },
    },
    {
      name: '階乘分組直接定位',
      idea: '每一位用目前剩餘數字的排列數量決定要取哪個數字。',
      steps: ['把 k 改為 `k−1`', '若還剩 m 位，每個開頭佔 `(m−1)!` 個排列', '用整除得到選第幾個可用數字，再用餘數處理後面'],
      figure: { title: 'n=4, k=9', steps: [
        { note: '改成零起點 k=8。每個首位佔 3!=6 個；8÷6=1，選可用數字中的第 1 號 2。', views: [arr([1, 2, 3, 4], { label: '可用', highlight: [1] }), arr([8], { label: 'k' })] },
        { note: '餘數 2。剩餘 [1,3,4]，每個次位佔 2!=2 個；2÷2=1，選 3。', views: [arr([1, 3, 4], { label: '可用', highlight: [1] }), arr([2, 3], { label: '已選' })] },
        { note: '餘數 0。剩餘 [1,4]，每組佔 1 個；選第 0 號 1。', views: [arr([1, 4], { label: '可用', highlight: [0] }), arr([2, 3, 1], { label: '已選' })] },
        { note: '最後只剩 4，結果為 2314。', views: [arr([2, 3, 1, 4], { label: '答案', done: [0, 1, 2, 3] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每次從剩餘陣列移除一個數，最多搬移 n 個元素。' },
      verdict: '推薦；無需列出前 k−1 個排列。',
      code: {
        python: `def getPermutation(n, k):
    digits = list(range(1, n + 1))
    fact = [1] * (n + 1)
    for i in range(1, n + 1):
        fact[i] = fact[i - 1] * i
    k -= 1  # 改為從 0 開始的索引
    out = []
    for size in range(n, 0, -1):
        pos, k = divmod(k, fact[size - 1])
        out.append(str(digits.pop(pos)))
    return ''.join(out)`,
        c: `char *getPermutation(int n, int k) {
    int digits[9], fact[10];
    fact[0] = 1;
    for (int i = 0; i < n; i++) {
        digits[i] = i + 1;
        fact[i + 1] = fact[i] * (i + 1);
    }
    char *out = malloc(n + 1);
    k--;
    for (int size = n, at = 0; size > 0; size--, at++) {
        int pos = k / fact[size - 1];
        k %= fact[size - 1];
        out[at] = '0' + digits[pos];
        for (int j = pos; j + 1 < size; j++) digits[j] = digits[j + 1];
    }
    out[n] = '\\0';
    return out;
}`,
        cpp: `string getPermutation(int n, int k) {
    vector<int> digits, fact(n + 1, 1);
    for (int i = 1; i <= n; i++) {
        digits.push_back(i);
        fact[i] = fact[i - 1] * i;
    }
    k--;
    string out;
    for (int size = n; size > 0; size--) {
        int pos = k / fact[size - 1];
        k %= fact[size - 1];
        out += char('0' + digits[pos]);
        digits.erase(digits.begin() + pos);
    }
    return out;
}`,
        java: `String getPermutation(int n, int k) {
    List<Integer> digits = new ArrayList<>();
    int[] fact = new int[n + 1];
    fact[0] = 1;
    for (int i = 1; i <= n; i++) {
        digits.add(i);
        fact[i] = fact[i - 1] * i;
    }
    k--;
    StringBuilder out = new StringBuilder();
    for (int size = n; size > 0; size--) {
        int pos = k / fact[size - 1];
        k %= fact[size - 1];
        out.append(digits.remove(pos));
    }
    return out.toString();
}`,
        javascript: `function getPermutation(n, k) {
  const digits = Array.from({ length: n }, (_, i) => i + 1);
  const fact = new Array(n + 1).fill(1);
  for (let i = 1; i <= n; i++) fact[i] = fact[i - 1] * i;
  k--;
  let out = '';
  for (let size = n; size > 0; size--) {
    const pos = Math.floor(k / fact[size - 1]);
    k %= fact[size - 1];
    out += digits.splice(pos, 1)[0];
  }
  return out;
}`,
      },
    },
  ],
  pitfalls: ['k 是從 1 開始；直接整除會在階乘倍數處選錯一組，須先減 1。', '取走數字後要從剩餘列表刪除，不能重複使用。'],
  check: { kind: 'fn', fn: 'getPermutation', cases: [
    { args: [3, 3], out: '213' },
    { args: [4, 9], out: '2314' },
    { args: [1, 1], out: '1' },
  ] },
}

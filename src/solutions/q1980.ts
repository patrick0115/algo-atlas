import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1980. Find Unique Binary String

const N = ['111', '011', '001']

function diagFig(): FigStep[] {
  return [
    { note: `有 ${N.length} 個長度 ${N.length} 的二進位字串,要找一個不在裡面的。對角線法:答案的第 i 位,故意和第 i 個字串的第 i 位**相反**`, views: N.map((s, i) => arr(s.split(''), { label: `nums[${i}]`, highlight: [i] })) },
    { note: '第 0 位看 nums[0][0] = 1 → 取 0;第 1 位看 nums[1][1] = 1 → 取 0;第 2 位看 nums[2][2] = 1 → 取 0', views: [arr(['0', '0', '0'], { label: '答案', done: [0, 1, 2] })] },
    { note: '"000" 和 nums[i] 至少在第 i 位不同 → 不會等於任何一個。這就是康托爾證明「實數比整數多」的對角線論證', views: [arr(['0', '0', '0'], { label: '答案', done: [0, 1, 2] })] },
  ]
}

function setFig(): FigStep[] {
  return [
    { note: '另一種:n 個字串最多佔掉 n 個數字,所以 0, 1, …, n 這 n + 1 個數裡一定有一個沒被用到(鴿籠原理)', views: [arr(N.map((s) => parseInt(s, 2)), { label: 'nums 轉成整數' })] },
    { note: '把 nums 轉成整數放進集合 {7, 3, 1};從 0 開始試:0 不在 → 補齊到長度 3 → "000"', views: [arr([0, 1, 2, 3], { label: '依序試', done: [0] })] },
  ]
}

const CHECK = {
  python: `

def uniqueCheck(nums):                        # 測試用:輸出合法回傳 1
    t = findDifferentBinaryString(nums)
    ok = len(t) == len(nums) and set(t) <= {'0', '1'} and t not in nums
    return 1 if ok else 0`,
  c: `

int uniqueCheck(char **nums, int numsSize) {
    char *t = findDifferentBinaryString(nums, numsSize);
    if ((int)strlen(t) != numsSize) return 0;
    for (int i = 0; i < numsSize; i++) if (t[i] != '0' && t[i] != '1') return 0;
    for (int i = 0; i < numsSize; i++) if (strcmp(t, nums[i]) == 0) return 0;
    return 1;
}`,
  cpp: `

int uniqueCheck(vector<string> nums) {
    string t = findDifferentBinaryString(nums);
    if (t.size() != nums.size()) return 0;
    for (char ch : t) if (ch != '0' && ch != '1') return 0;
    for (auto &s : nums) if (s == t) return 0;
    return 1;
}`,
  java: `

int uniqueCheck(String[] nums) {
    String t = findDifferentBinaryString(nums);
    if (t.length() != nums.length) return 0;
    for (char ch : t.toCharArray()) if (ch != '0' && ch != '1') return 0;
    for (String s : nums) if (s.equals(t)) return 0;
    return 1;
}`,
  javascript: `

function uniqueCheck(nums) {
  const t = findDifferentBinaryString(nums);
  if (t.length !== nums.length || /[^01]/.test(t) || nums.includes(t)) return 0;
  return 1;
}`,
}

export const q1980: Solution = {
  id: 1980,
  plain: '給你 n 個不同的「長度 n 的 0/1 字串」,請找出一個同樣長度、但不在清單裡的 0/1 字串(答案不唯一,給一個就好)。',
  statement: '給 n 個互不相同、長度皆為 n 的二進位字串 `nums`,回傳一個長度為 n 且**不在** nums 中的二進位字串。答案不唯一。(這裡用 `uniqueCheck(nums)` 檢查:輸出合法回傳 1。)',
  examples: [
    { input: 'nums = ["01","10"]', output: '"11"', note: '"00" 也可以' },
    { input: 'nums = ["00","01"]', output: '"11"' },
    { input: 'nums = ["111","011","001"]', output: '"101"', note: '"000"、"010" 等也可以' },
  ],
  constraints: ['1 ≤ n ≤ 16'],
  insight: ['長度 n 的字串有 2ⁿ 個,只被佔掉 n 個 → 空位很多', '對角線:第 i 位跟 nums[i] 的第 i 位相反,保證和每一個都不同', '或:0..n 這 n + 1 個數一定有一個沒出現'],
  approaches: [
    {
      name: '康托爾對角線',
      idea: '`ans[i] = 1 − nums[i][i]`。',
      steps: ['`for i in range(n)`', '`nums[i][i] == "0"` → 這位放 "1",否則放 "0"', '回傳拼起來的字串'],
      figure: { title: `nums = [${N.map((s) => `"${s}"`).join(', ')}]`, steps: diagFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個字串只看一個字元。' },
      verdict: '最推薦,一行就寫完,而且背後是很漂亮的數學證明。',
      code: {
        python: `def findDifferentBinaryString(nums):
    # 第 i 位和 nums[i] 的第 i 位相反 → 和每個字串都至少差一位
    return ''.join('1' if nums[i][i] == '0' else '0' for i in range(len(nums)))${CHECK.python}`,
        c: `char *findDifferentBinaryString(char **nums, int numsSize) {
    char *res = malloc(numsSize + 1);
    for (int i = 0; i < numsSize; i++) res[i] = nums[i][i] == '0' ? '1' : '0';
    res[numsSize] = '\\0';
    return res;
}${CHECK.c}`,
        cpp: `string findDifferentBinaryString(vector<string>& nums) {
    string res;
    for (int i = 0; i < (int)nums.size(); i++) res += nums[i][i] == '0' ? '1' : '0';
    return res;
}${CHECK.cpp}`,
        java: `String findDifferentBinaryString(String[] nums) {
    StringBuilder res = new StringBuilder();
    for (int i = 0; i < nums.length; i++) res.append(nums[i].charAt(i) == '0' ? '1' : '0');
    return res.toString();
}${CHECK.java}`,
        javascript: `function findDifferentBinaryString(nums) {
  return nums.map((s, i) => (s[i] === '0' ? '1' : '0')).join('');
}${CHECK.javascript}`,
      },
    },
    {
      name: '集合 + 從 0 往上試',
      idea: '把 nums 轉成整數放進集合;從 0 試到 n,第一個不在集合裡的,補零成長度 n 回傳。',
      steps: ['`seen = {int(s, 2) for s in nums}`', '`for x in range(n + 1)`:不在 seen → 轉成長度 n 的二進位回傳'],
      figure: { title: `nums = [${N.map((s) => `"${s}"`).join(', ')}]`, steps: setFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '轉換 n 個長度 n 的字串;最多試 n + 1 個數。' },
      verdict: '比較直覺的鴿籠原理;n ≤ 16 時連暴力列舉 2ⁿ 個都過得了。',
      code: {
        python: `def findDifferentBinaryString(nums):
    n = len(nums)
    seen = {int(s, 2) for s in nums}
    for x in range(n + 1):                    # n + 1 個數放 n 個 → 一定有空位
        if x not in seen:
            return format(x, '0%db' % n)${CHECK.python}`,
        c: `char *findDifferentBinaryString(char **nums, int numsSize) {
    int n = numsSize, seen[17] = {0}, cnt = 0, vals[16];
    for (int i = 0; i < n; i++) vals[cnt++] = (int)strtol(nums[i], NULL, 2);
    for (int i = 0; i < cnt; i++) if (vals[i] <= n) seen[vals[i]] = 1;
    char *res = malloc(n + 1);
    for (int x = 0; x <= n; x++) {
        if (seen[x]) continue;
        for (int b = 0; b < n; b++) res[b] = (x >> (n - 1 - b)) & 1 ? '1' : '0';
        res[n] = '\\0';
        break;
    }
    return res;
}${CHECK.c}`,
        cpp: `string findDifferentBinaryString(vector<string>& nums) {
    int n = nums.size();
    unordered_set<int> seen;
    for (auto &s : nums) seen.insert(stoi(s, nullptr, 2));
    for (int x = 0; x <= n; x++)
        if (!seen.count(x)) {
            string res(n, '0');
            for (int b = 0; b < n; b++) if ((x >> (n - 1 - b)) & 1) res[b] = '1';
            return res;
        }
    return "";
}${CHECK.cpp}`,
        java: `String findDifferentBinaryString(String[] nums) {
    int n = nums.length;
    Set<Integer> seen = new HashSet<>();
    for (String s : nums) seen.add(Integer.parseInt(s, 2));
    for (int x = 0; x <= n; x++)
        if (!seen.contains(x)) {
            StringBuilder res = new StringBuilder(Integer.toBinaryString(x));
            while (res.length() < n) res.insert(0, '0');
            return res.toString();
        }
    return "";
}${CHECK.java}`,
        javascript: `function findDifferentBinaryString(nums) {
  const n = nums.length, seen = new Set(nums.map((s) => parseInt(s, 2)));
  for (let x = 0; x <= n; x++) if (!seen.has(x)) return x.toString(2).padStart(n, '0');
  return '';
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['轉成二進位後忘了補前導零:長度會不足 n', '暴力列舉 2ⁿ 個雖然能過,但不必要'],
  check: {
    kind: 'fn',
    fn: 'uniqueCheck',
    cases: [
      { args: [['01', '10']], out: 1 },
      { args: [['00', '01']], out: 1 },
      { args: [N], out: 1 },
      { args: [['0']], out: 1 },
      { args: [['1']], out: 1 },
    ],
  },
}

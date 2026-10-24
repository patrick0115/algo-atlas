import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { Solution } from './types'

// 974. Subarray Sums Divisible by K
const A = [4, 5, 0, -2, -3, 1]

export const q0974: Solution = {
  id: 974,
  plain: '數出有多少段連續數字，加起來剛好是 k 的倍數。',
  statement: '給整數陣列 nums 與正整數 k，計算總和能被 k 整除的非空連續子陣列數量。',
  examples: [{ input: 'nums = [4,5,0,-2,-3,1], k = 5', output: '7' }, { input: 'nums = [5], k = 9', output: '0' }],
  constraints: ['1 ≤ nums.length ≤ 3×10⁴；2 ≤ k ≤ 10⁴；−10⁴ ≤ nums[i] ≤ 10⁴（元素可為負）。'],
  insight: ['一段的和 = 右端前綴和 − 左端前綴和。', '兩個前綴和除以 k 的餘數相同，差就是 k 的倍數，屬於 [[p:prefix-sum]] 與 [[p:hash-map]]。', '負數餘數在 C、Java、JavaScript 可能為負，必須正規化。'],
  approaches: [
    {
      name: '前綴餘數計數',
      idea: '記錄每種餘數已出現幾次；新餘數與舊餘數相同就找到相應數量的子陣列。',
      steps: ['cnt[0] = 1，代表空前綴。', '逐個累加並把餘數轉成 0..k−1。', '先把 cnt[餘數] 加到答案，再把該餘數計數加一。'],
      figure: { title: 'nums = [4,5,0,-2,-3,1], k = 5', steps: [
        { note: '空前綴的餘數是 0，先放一次，才能數到從索引 0 開始的區間。', views: [kv([[0, 1]], '餘數 → 次數')] },
        { note: '讀到 4，前綴餘數 4；先前沒有 4，答案仍是 0。', views: [arr(A, { label: 'nums', highlight: [0] }), kv([[0, 1], [4, 1]], '餘數 → 次數')] },
        { note: '再讀 5，前綴餘數仍是 4；與前一個餘數 4 相減得到區間 [5]，答案加 1。', views: [arr(A, { label: 'nums', highlight: [1] }), kv([[0, 1], [4, 2]], '餘數 → 次數')] },
        { note: '讀 0，餘數仍是 4；已有兩個 4，因此新找到兩段，答案成 3。', views: [arr(A, { label: 'nums', highlight: [2] }), kv([[0, 1], [4, 3]], '餘數 → 次數')] },
        { note: '讀完 −2、−3、1 後，餘數依序 2、4、0；新增 0、3、1 段，總共 7 段。', views: [arr(A, { label: 'nums', done: [0, 1, 2, 3, 4, 5] }), arr([7], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n + k)', space: 'O(k)', why: '掃描一次；餘數計數陣列大小為 k。' },
      verdict: '推薦；餘數計數直接對應到答案增量。',
      code: {
        python: `def subarraysDivByK(nums, k):
    count = [0] * k
    count[0] = 1                         # 空前綴
    remainder = 0
    answer = 0
    for value in nums:
        remainder = (remainder + value) % k
        answer += count[remainder]       # 相同餘數的舊前綴
        count[remainder] += 1
    return answer`,
        c: `int subarraysDivByK(int *nums, int numsSize, int k) {
    int *count = calloc(k, sizeof(int));
    count[0] = 1;
    int remainder = 0;
    int answer = 0;
    for (int i = 0; i < numsSize; i++) {
        remainder = ((remainder + nums[i]) % k + k) % k;
        answer += count[remainder];
        count[remainder]++;
    }
    free(count);
    return answer;
}`,
        cpp: `int subarraysDivByK(vector<int>& nums, int k) {
    vector<int> count(k);
    count[0] = 1;
    int remainder = 0;
    int answer = 0;
    for (int value : nums) {
        remainder = ((remainder + value) % k + k) % k;
        answer += count[remainder];
        count[remainder]++;
    }
    return answer;
}`,
        java: `int subarraysDivByK(int[] nums, int k) {
    int[] count = new int[k];
    count[0] = 1;
    int remainder = 0;
    int answer = 0;
    for (int value : nums) {
        remainder = ((remainder + value) % k + k) % k;
        answer += count[remainder];
        count[remainder]++;
    }
    return answer;
}`,
        javascript: `function subarraysDivByK(nums, k) {
  const count = new Array(k).fill(0);
  count[0] = 1;
  let remainder = 0;
  let answer = 0;
  for (const value of nums) {
    remainder = ((remainder + value) % k + k) % k;
    answer += count[remainder];
    count[remainder]++;
  }
  return answer;
}`,
      },
    },
    {
      name: '列舉左端點',
      idea: '固定每個起點，逐步往右加總，遇到 k 的倍數就計數。',
      steps: ['左端點從 0 到 n−1。', '從左端點開始累加到每個右端點。', '每次總和能被 k 整除就加一。'],
      figure: { title: 'nums = [4,5,0,-2,-3,1], k = 5', steps: [
        { note: '固定左端 0，逐步加 4、5、0…；和為 0 或 5 的倍數時才記一段。', views: [arr(A, { label: '左端 0', highlight: [0] })] },
        { note: '固定左端 1，先拿到 [5]，和為 5，計一段。', views: [arr(A, { label: '區間 [5]', highlight: [1] })] },
        { note: '右端延長到 0，區間 [5,0] 仍是 5，再計一段。', views: [arr(A, { label: '區間 [5,0]', highlight: [1, 2] })] },
        { note: '繼續把每個左端點都試完；總計 7 段。', views: [arr([7], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '每個左端點都可能走到最右端。' },
      verdict: '易於驗證小測資，但資料量大時會超時。',
      code: {
        python: `def subarraysDivByK(nums, k):
    answer = 0
    for left in range(len(nums)):
        total = 0
        for right in range(left, len(nums)):
            total += nums[right]
            if total % k == 0:
                answer += 1              # 找到一段可整除的區間
    return answer`,
        c: `int subarraysDivByK(int *nums, int numsSize, int k) {
    int answer = 0;
    for (int left = 0; left < numsSize; left++) {
        int total = 0;
        for (int right = left; right < numsSize; right++) {
            total += nums[right];
            if (total % k == 0) {
                answer++;
            }
        }
    }
    return answer;
}`,
        cpp: `int subarraysDivByK(vector<int>& nums, int k) {
    int answer = 0;
    for (int left = 0; left < (int)nums.size(); left++) {
        int total = 0;
        for (int right = left; right < (int)nums.size(); right++) {
            total += nums[right];
            if (total % k == 0) {
                answer++;
            }
        }
    }
    return answer;
}`,
        java: `int subarraysDivByK(int[] nums, int k) {
    int answer = 0;
    for (int left = 0; left < nums.length; left++) {
        int total = 0;
        for (int right = left; right < nums.length; right++) {
            total += nums[right];
            if (total % k == 0) {
                answer++;
            }
        }
    }
    return answer;
}`,
        javascript: `function subarraysDivByK(nums, k) {
  let answer = 0;
  for (let left = 0; left < nums.length; left++) {
    let total = 0;
    for (let right = left; right < nums.length; right++) {
      total += nums[right];
      if (total % k === 0) {
        answer++;
      }
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['cnt[0] 必須先放 1。', '先讀取舊餘數次數，再更新；順序反了會把空區間也算進去。', '負餘數須正規化。'],
  check: { kind: 'fn', fn: 'subarraysDivByK', cases: [
    { args: [A, 5], out: 7 }, { args: [[5], 9], out: 0 }, { args: [[-5], 5], out: 1 }, { args: [[0, 0], 3], out: 3 },
  ] },
}

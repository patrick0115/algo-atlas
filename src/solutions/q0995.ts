import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 995. Minimum Number of K Consecutive Bit Flips

const NUMS = [0, 0, 0, 1, 0, 1, 1, 0]

// 差分陣列:example nums = [0,0,0,1,0,1,1,0], k = 3
function diffFig(): FigStep[] {
  return [
    { note: 'i = 0,目前累積翻 0 次,`nums[0] = 0` 還是 0 → 必須在這裡翻一次,蓋住 [0, 2]。用 `diff[3]--` 記「翻轉到第 3 格失效」', line: 7, views: [arr(NUMS, { label: 'nums', highlight: [0], compare: [0, 1, 2] })] },
    { note: 'i = 1、2:累積翻 1 次(奇數),`0 XOR 1 = 1`,已經是 1 → 不用翻。i = 3 的 1 也維持 1', line: 6, views: [arr(NUMS, { label: 'nums', done: [0, 1, 2], highlight: [3] })] },
    { note: 'i = 4:到這裡 diff 讓累積回到 0 次,`nums[4] = 0` 仍是 0 → 第 2 次翻,蓋住 [4, 6]', line: 7, views: [arr(NUMS, { label: 'nums', highlight: [4], compare: [4, 5, 6] })] },
    { note: 'i = 5:累積翻 1 次,`1 XOR 1 = 0` 變成 0 了 → 第 3 次翻,蓋住 [5, 7]。走到底沒越界 → 答案 3', line: 11, views: [arr(NUMS, { label: 'nums', done: [4], highlight: [5], compare: [5, 6, 7] })] },
  ]
}

// 佇列:example 同上
function queueFig(): FigStep[] {
  return [
    { note: 'i = 0 要翻 → 把起點 0 推進佇列。佇列長度 1(奇數)代表此刻被翻奇數次', line: 10, views: [arr(NUMS, { label: 'nums', highlight: [0] }), arr([0], { label: '翻轉起點佇列' })] },
    { note: 'i = 4:佇列頭 `0 + k = 3 ≤ 4` 已失效 → 彈出。長度變 0,`nums[4] = 0` 仍 0 → 推入起點 4', line: 6, views: [arr(NUMS, { label: 'nums', highlight: [4] }), arr([4], { label: '翻轉起點佇列' })] },
    { note: 'i = 5:佇列長度 1(奇數),`nums[5] = 1` 被翻成 0 → 推入起點 5。共翻 3 次', line: 10, views: [arr(NUMS, { label: 'nums', highlight: [5] }), arr([4, 5], { label: '翻轉起點佇列' })] },
  ]
}

export const q0995: Solution = {
  id: 995,
  plain: '一排 0 和 1,每次只能挑連續 k 個一起翻面(0↔1),目標全部變成 1,問最少翻幾次。像擦黑板只能一次擦 k 格,要把整排擦乾淨。',
  statement: '給二元陣列 `nums` 與整數 `k`。每次操作選一段長度剛好 k 的連續子陣列,把裡面每個位元反轉。求把 nums 全變成 1 的最少操作數;做不到回傳 `-1`。',
  examples: [
    { input: 'nums = [0,1,0], k = 1', output: '2', note: '翻第 0 格、再翻第 2 格' },
    { input: 'nums = [1,1,0], k = 2', output: '-1', note: '最後一格要翻就會超出右界' },
    { input: 'nums = [0,0,0,1,0,1,1,0], k = 3', output: '3' },
  ],
  constraints: [
    '`1 ≤ k ≤ nums.length`',
    '`nums[i]` 只有 0 或 1 → 翻轉只看「被翻幾次」的奇偶',
    '由左往右掃:第 i 格是不是 0,只受「起點 ≤ i 且還沒失效」的翻轉影響 → 可用 [[p:sliding-window]]',
  ],
  insight: [
    '貪心:由左往右,看到一個還是 0 的位置就「非翻不可」—— 因為只有「起點正好在這裡」的操作能救它,再往右就蓋不到它了,用 [[p:greedy]]',
    '不用真的去翻整段,只要記「當前位置被翻了幾次」的奇偶。翻轉的影響是一段區間 → [[p:difference-array]] 或佇列最適合',
    '若某個 0 需要翻、但 `i + k > n`(右邊不夠 k 格)→ 永遠救不了,回傳 -1',
  ],
  approaches: [
    {
      name: '差分陣列',
      idea: '由左往右滾動一個 `flips` 累積「當前被翻幾次」。`nums[i]` 與 flips 同奇偶(即 `(nums[i] + flips)` 為偶)就是 0,必須在 i 翻一次,用 `diff[i + k]--` 記這次翻轉的結束。',
      steps: [
        '`diff` 長度 n + 1,`flips = 0`、`ans = 0`',
        '對每個 i:`flips += diff[i]`(吃掉在此失效的翻轉)',
        '`(nums[i] + flips)` 是偶數 → 這格是 0,要翻',
        '`i + k > n` → 回傳 -1;否則 `ans++`、`flips++`、`diff[i + k]--`',
        '掃完回傳 ans',
      ],
      figure: { title: 'nums = [0,0,0,1,0,1,1,0], k = 3', steps: diffFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每格只看一次;diff 陣列長 n + 1。' },
      verdict: '最推薦。用 [[p:difference-array]] 把「翻一段」變成改一格,O(n) 完成,常數也小。',
      code: {
        python: `def minKBitFlips(nums, k):
    n = len(nums)
    diff = [0] * (n + 1)
    flips = ans = 0
    for i in range(n):
        flips += diff[i]
        if (nums[i] + flips) % 2 == 0:      # 這格現在是 0
            if i + k > n:
                return -1
            ans += 1
            flips += 1
            diff[i + k] -= 1                 # 翻轉到 i+k 失效
    return ans`,
        c: `#include <stdlib.h>

int minKBitFlips(int* nums, int numsSize, int k) {
    int n = numsSize;
    int *diff = calloc(n + 1, sizeof(int));
    int flips = 0, ans = 0;
    for (int i = 0; i < n; i++) {
        flips += diff[i];
        if (((nums[i] + flips) & 1) == 0) {
            if (i + k > n) { free(diff); return -1; }
            ans++;
            flips++;
            diff[i + k]--;
        }
    }
    free(diff);
    return ans;
}`,
        cpp: `int minKBitFlips(vector<int>& nums, int k) {
    int n = nums.size();
    vector<int> diff(n + 1, 0);
    int flips = 0, ans = 0;
    for (int i = 0; i < n; i++) {
        flips += diff[i];
        if (((nums[i] + flips) & 1) == 0) {
            if (i + k > n) return -1;
            ans++;
            flips++;
            diff[i + k]--;
        }
    }
    return ans;
}`,
        java: `public int minKBitFlips(int[] nums, int k) {
    int n = nums.length;
    int[] diff = new int[n + 1];
    int flips = 0, ans = 0;
    for (int i = 0; i < n; i++) {
        flips += diff[i];
        if (((nums[i] + flips) & 1) == 0) {
            if (i + k > n) return -1;
            ans++;
            flips++;
            diff[i + k]--;
        }
    }
    return ans;
}`,
        javascript: `function minKBitFlips(nums, k) {
  const n = nums.length;
  const diff = new Array(n + 1).fill(0);
  let flips = 0, ans = 0;
  for (let i = 0; i < n; i++) {
    flips += diff[i];
    if ((nums[i] + flips) % 2 === 0) {
      if (i + k > n) return -1;
      ans++;
      flips++;
      diff[i + k]--;
    }
  }
  return ans;
}`,
      },
    },
    {
      name: '佇列',
      idea: '用佇列存還有效的翻轉起點。到 i 時先把「起點 + k ≤ i」的舊翻轉彈出,剩下的佇列長度奇偶就是當前被翻幾次;`nums[i]` 加它是偶數就在 i 翻一次,把 i 推進佇列。',
      steps: [
        '`queue = []`、`ans = 0`',
        '對每個 i:彈出所有 `queue 頭 + k ≤ i` 的起點',
        '`(nums[i] + queue 長度)` 是偶數 → 這格是 0,要翻',
        '`i + k > n` → -1;否則把 i 推進 queue、`ans++`',
        '回傳 ans',
      ],
      figure: { title: 'nums = [0,0,0,1,0,1,1,0], k = 3', steps: queueFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個起點進出佇列各一次。' },
      verdict: '和差分同樣 O(n)、同樣貪心,只是用 [[p:sliding-window]] 的佇列長度直接代表「翻轉次數」,不用額外的 diff 陣列,語意更直覺。',
      code: {
        python: `from collections import deque

def minKBitFlips(nums, k):
    n = len(nums)
    q = deque()
    ans = 0
    for i in range(n):
        while q and q[0] + k <= i:
            q.popleft()
        if (nums[i] + len(q)) % 2 == 0:
            if i + k > n:
                return -1
            q.append(i)
            ans += 1
    return ans`,
        c: `#include <stdlib.h>

int minKBitFlips(int* nums, int numsSize, int k) {
    int n = numsSize;
    int *q = malloc(n * sizeof(int));
    int head = 0, tail = 0, ans = 0;
    for (int i = 0; i < n; i++) {
        while (head < tail && q[head] + k <= i) head++;
        if (((nums[i] + (tail - head)) & 1) == 0) {
            if (i + k > n) { free(q); return -1; }
            q[tail++] = i;
            ans++;
        }
    }
    free(q);
    return ans;
}`,
        cpp: `int minKBitFlips(vector<int>& nums, int k) {
    int n = nums.size();
    deque<int> q;
    int ans = 0;
    for (int i = 0; i < n; i++) {
        while (!q.empty() && q.front() + k <= i) q.pop_front();
        if (((nums[i] + (int)q.size()) & 1) == 0) {
            if (i + k > n) return -1;
            q.push_back(i);
            ans++;
        }
    }
    return ans;
}`,
        java: `public int minKBitFlips(int[] nums, int k) {
    int n = nums.length;
    Deque<Integer> q = new ArrayDeque<>();
    int ans = 0;
    for (int i = 0; i < n; i++) {
        while (!q.isEmpty() && q.peekFirst() + k <= i) q.pollFirst();
        if (((nums[i] + q.size()) & 1) == 0) {
            if (i + k > n) return -1;
            q.addLast(i);
            ans++;
        }
    }
    return ans;
}`,
        javascript: `function minKBitFlips(nums, k) {
  const n = nums.length;
  const queue = [];
  let ans = 0, head = 0;
  for (let i = 0; i < n; i++) {
    while (head < queue.length && queue[head] + k <= i) head++;
    const cur = queue.length - head;
    if ((nums[i] + cur) % 2 === 0) {
      if (i + k > n) return -1;
      queue.push(i);
      ans++;
    }
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: [
    '不要真的去翻陣列(每次 O(k),總共 O(nk) 會超時);只滾動「被翻幾次」的奇偶',
    '判斷是否為 0:用 `(nums[i] + flips) 為偶` 或 `nums[i] XOR (flips & 1)`,別把 flips 的奇偶搞反',
    '越界回 -1 的時機:確定「要翻」之後才檢查 `i + k > n`,不是一開始就擋',
    '差分的結束點是 `diff[i + k]--`(翻轉蓋住 [i, i+k−1],到第 i+k 格失效),別寫成 i + k − 1',
  ],
  check: {
    kind: 'fn',
    fn: 'minKBitFlips',
    cases: [
      { args: [[0, 1, 0], 1], out: 2 },
      { args: [[1, 1, 0], 2], out: -1 },
      { args: [[0, 0, 0, 1, 0, 1, 1, 0], 3], out: 3 },
      { args: [[1], 1], out: 0 },
      { args: [[0], 1], out: 1 },
    ],
  },
}

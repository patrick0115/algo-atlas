import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1004. Max Consecutive Ones III
const A = [1,1,1,0,0,0,1,1,1,1,0]
const fig = [
  { note: '右端從索引 0 開始往右加入，前三個值都是 1，因此視窗 [0..2] 的 0 數量仍是 0。', views: [arr(A, { label: '視窗 [0..2]', highlight: [0,1,2] })] },
  { note: '右端來到索引 3、4，視窗 [0..4] 恰有兩個 0，符合 k=2，暫時最佳長度為 5。', views: [arr(A, { label: '視窗 [0..4]', highlight: [0,1,2,3,4] })] },
  { note: '最佳視窗 [4..9] 長 6，裡面兩個 0 可翻成 1。', views: [arr(A, { label: '長度 6', highlight: [4,5,6,7,8,9], dim: [0,1,2,3,10] })] },
  { note: '右端到索引 10 後，視窗 [4..10] 含三個 0，超過 k=2，所以左端必須右移。', views: [arr(A, { label: '新加入索引 10', highlight: [4,5,6,7,8,9,10] })] },
  { note: '左端移到索引 6 後，視窗 [6..10] 只剩一個 0；最佳長度仍保留先前的 6。', views: [arr(A, { label: '收縮後視窗', highlight: [6,7,8,9,10], done: [4,5] })] },
]

export const q1004: Solution = {
  id: 1004,
  plain: '最多可以把 k 個 0 改成 1，問能做出多長的一段連續 1。',
  statement: '給二元陣列 nums 與 k，回傳最多翻轉 k 個 0 後，最長連續 1 的長度。',
  examples: [{ input: 'nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2', output: '6' }, { input: 'nums = [0,0,1,1,1,0,0], k = 0', output: '3' }],
  constraints: ['1 ≤ nums.length ≤ 10⁵；0 ≤ k ≤ n。', '翻轉後的一段必須連續。'],
  insight: ['一段區間只要 0 的個數 ≤ k，就能全部變成 1。', '可枚舉每個起點向右延伸；更快用 [[p:sliding-window]] 維持合法區間。', '右端增加時，若 0 過多，就收縮左端直到合法。'],
  approaches: [
    { name: '枚舉起點', idea: '每個起點向右掃，遇到第 k+1 個 0 就停止。', steps: ['對每個左端 l，設 zeros=0。先決定視窗或起點，0 的數量才有明確的統計範圍。', '逐格增加右端並計數 0。右端每加入一格就更新 0 的數量，以便判斷是否仍可翻轉。', '若 zeros≤k 更新長度；超過 k 就停止此起點。視窗合法時才更新長度，超出 k 個 0 就先縮小或停止。'], figure: { title: 'k = 2', steps: [fig[0], fig[1], { note: '起點改為索引 4 時，向右延伸到索引 9 仍只有兩個 0，因此長度 6 成為新最佳。', views: [arr(A, { label: '起點 4', highlight: [4,5,6,7,8,9] })] }] }, complexity: { time: 'O(n²)', space: 'O(1)', why: '每個起點最壞向右掃到結尾。' }, verdict: '概念直接，長陣列會超時。', code: {
      python: `def longestOnes(nums, k):
    best = 0
    for l in range(len(nums)):  # 右端往前走，記錄視窗中的 0 有幾個。
        zeros = 0
        for r in range(l, len(nums)):
            zeros += nums[r] == 0
            if zeros > k:  # 超過可翻轉的數量時，移動左端恢復合法。
                break
            best = max(best, r - l + 1)
    return best`,
      c: `int longestOnes(int *a, int n, int k) {
    int best = 0;
    for (int l = 0; l < n; l++) {
        int z = 0;
        for (int r = l; r < n; r++) {
            z += a[r] == 0;
            if (z > k)
                break;
            if (r - l + 1 > best)
                best = r - l + 1;
        }
    }
    return best;
}`,
      cpp: `int longestOnes(vector<int>& a, int k) {
    int best = 0;
    for (int l = 0; l < (int)a.size(); l++) {
        int z = 0;
        for (int r = l; r < (int)a.size(); r++) {
            z += a[r] == 0;
            if (z > k)
                break;
            best = max(best, r - l + 1);
        }
    }
    return best;
}`,
      java: `int longestOnes(int[] a, int k) {
    int best = 0;
    for (int l = 0; l < a.length; l++) {
        int z = 0;
        for (int r = l; r < a.length; r++) {
            if (a[r] == 0)
                z++;
            if (z > k)
                break;
            best = Math.max(best, r - l + 1);
        }
    }
    return best;
}`,
      javascript: `function longestOnes(a, k) {
    let best = 0;
    for (let l = 0; l < a.length; l++) {
        let z = 0;
        for (let r = l; r < a.length; r++) {
            if (a[r] === 0)
                z++;
            if (z > k)
                break;
            best = Math.max(best, r - l + 1);
        }
    }
    return best;
}`,
    } },
    { name: '滑動視窗', idea: '視窗內 0 超過 k 時移動左端，保證視窗合法。', steps: ['l=0，zeros=0。先決定視窗或起點，0 的數量才有明確的統計範圍。', '右端逐格加入；若遇 0，zeros++。右端每加入一格就更新 0 的數量，以便判斷是否仍可翻轉。', '當 zeros>k，持續移動左端並扣除離開的 0。視窗合法時才更新長度，超出 k 個 0 就先縮小或停止。', '更新最長視窗長度。視窗合法時才更新長度，超出 k 個 0 就先縮小或停止。'], figure: { title: 'k = 2', steps: fig }, complexity: { time: 'O(n)', space: 'O(1)', why: '左右端各最多移動 n 次。' }, verdict: '最佳解；只需要記視窗裡 0 的個數。', code: {
      python: `def longestOnes(nums, k):
    l = zeros = best = 0
    for r, x in enumerate(nums):  # 右端往前走，記錄視窗中的 0 有幾個。
        if x == 0:  # 超過可翻轉的數量時，移動左端恢復合法。
            zeros += 1
        while zeros > k:
            if nums[l] == 0:
                zeros -= 1
            l += 1
        best = max(best, r - l + 1)
    return best`,
      c: `int longestOnes(int *a, int n, int k) {
    int l = 0, z = 0, best = 0;
    for (int r = 0; r < n; r++) {
        z += a[r] == 0;
        while (z > k)
            z -= a[l++] == 0;
        if (r - l + 1 > best)
            best = r - l + 1;
    }
    return best;
}`,
      cpp: `int longestOnes(vector<int>& a, int k) {
    int l = 0, z = 0, best = 0;
    for (int r = 0; r < (int)a.size(); r++) {
        z += a[r] == 0;
        while (z > k)
            z -= a[l++] == 0;
        best = max(best, r - l + 1);
    }
    return best;
}`,
      java: `int longestOnes(int[] a, int k) {
    int l = 0, z = 0, best = 0;
    for (int r = 0; r < a.length; r++) {
        if (a[r] == 0)
            z++;
        while (z > k)
            if (a[l++] == 0)
                z--;
        best = Math.max(best, r - l + 1);
    }
    return best;
}`,
      javascript: `function longestOnes(a, k) {
    let l = 0, z = 0, best = 0;
    for (let r = 0; r < a.length; r++) {
        if (a[r] === 0)
            z++;
        while (z > k)
            if (a[l++] === 0)
                z--;
        best = Math.max(best, r - l + 1);
    }
    return best;
}`,
    } },
  ],
  pitfalls: ['最多翻 k 個，不一定剛好翻 k 個。', '左端滑過 0 時記得 zeros 減一。', 'k=0 時仍可找原本連續的 1。'],
  check: { kind: 'fn', fn: 'longestOnes', cases: [{ args: [A,2], out: 6 }, { args: [[0,0,1,1,1,0,0],0], out: 3 }, { args: [[0,0,0],2], out: 2 }] },
}

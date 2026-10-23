import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 16. 3Sum Closest
const A = [-1,2,1,-4]
const fig = [
  { note: '先把原陣列 [-1,2,1,-4] 排成 [-4,-1,1,2]，固定一個數後才容易用左右指針調整總和。', views: [arr([-4,-1,1,2], { label: '排序結果', highlight: [0] })] },
  { note: '先排序成 [-4,-1,1,2]。固定 -4，左右指針從 -1 和 2 出發，和 -3 比目標 1 小，所以左指針右移。', views: [arr([-4,-1,1,2], { label: '排序後', highlight: [0,1,3] })] },
  { note: '固定 -1，選 1、2，和是 2，與目標 1 只差 1。', views: [arr([-4,-1,1,2], { label: '最佳三數', highlight: [1,2,3], dim: [0] })] },
  { note: '固定 −1 時，若和大於目標就把右指針左移；此例指針已相遇，最佳和仍是 2。', views: [arr([-4,-1,1,2], { label: '結束這輪', highlight: [1,2,3] })] },
]

export const q0016: Solution = {
  id: 16,
  plain: '從陣列挑三個數，讓總和盡量靠近目標；像挑三件商品把總價湊近預算。',
  statement: '給 nums 與 target，回傳三個不同位置數字的和中，與 target 距離最小的一個。題目保證答案唯一。',
  examples: [{ input: 'nums = [-1,2,1,-4], target = 1', output: '2' }, { input: 'nums = [0,0,0], target = 1', output: '0' }],
  constraints: ['3 ≤ nums.length ≤ 500；數字與目標可為負。', '距離比較要用絕對值，且剛好等於目標時可立即回傳。'],
  insight: ['直接列出三個索引有 O(n³) 種組合。', '排序後固定第一個數，另外兩個用左右指針：和太小就增加左值，太大就降低右值。', '此法與 [15](#/q/15) 的 [[p:two-pointers]] 相近，但本題記錄最接近的和。'],
  approaches: [
    { name: '枚舉三數', idea: '試遍所有 i<j<k 的組合，追蹤距離最小的和。', steps: ['令 best 為前三數之和。先建立一個實際三數總和，後面才能比較誰更接近目標。', '三層迴圈枚舉 i<j<k。每次只選三個不同位置，並計算它們與目標的絕對距離。', '若目前和更接近 target，更新 best。更新指標或最佳值時保留更接近目標的總和，最後回傳這個總和。'], figure: { title: 'nums = [-1,2,1,-4], target = 1', steps: [{ note: '開始時用前三數 −1、2、1 的和 2 當最佳答案，與目標只差 1。', views: [arr(A, { label: '初始三數', highlight: [0,1,2] })] }, { note: '接著試 −1、2、−4，總和是 −3，差距 4 較大，因此保留最佳和 2。', views: [arr(A, { label: '比較另一組', highlight: [0,1,3] })] }, { note: '其餘組合都沒有更接近目標 1 的總和，最後回傳原本的最佳和 2。', views: [arr(A, { label: '最佳三數', done: [0,1,2], dim: [3] })] }] }, complexity: { time: 'O(n³)', space: 'O(1)', why: '三層索引迴圈。' }, verdict: '容易驗證正確性，n=500 時太慢。', code: {
      python: `def threeSumClosest(nums, target):
    best = sum(nums[:3])
    n = len(nums)
    for i in range(n):  # 固定第一個數，再嘗試另外兩個位置。
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                s = nums[i] + nums[j] + nums[k]
                if abs(s - target) < abs(best - target):  # 只有更接近目標時才更新最佳總和。
                    best = s
    return best`,
      c: `int threeSumClosest(int *a, int n, int target) {
    int best = a[0] + a[1] + a[2];
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            for (int k = j + 1; k < n; k++) {
                int s = a[i] + a[j] + a[k];
                if (abs(s - target) < abs(best - target))
                    best = s;
            }
    return best;
}`,
      cpp: `int threeSumClosest(vector<int>& a, int target) {
    int best = a[0] + a[1] + a[2], n = a.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            for (int k = j + 1; k < n; k++) {
                int s = a[i] + a[j] + a[k];
                if (abs(s - target) < abs(best - target))
                    best = s;
            }
    return best;
}`,
      java: `int threeSumClosest(int[] a, int target) {
    int best = a[0] + a[1] + a[2], n = a.length;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            for (int k = j + 1; k < n; k++) {
                int s = a[i] + a[j] + a[k];
                if (Math.abs(s - target) < Math.abs(best - target))
                    best = s;
            }
    return best;
}`,
      javascript: `function threeSumClosest(a, target) {
    let best = a[0] + a[1] + a[2];
    for (let i = 0; i < a.length; i++)
        for (let j = i + 1; j < a.length; j++)
            for (let k = j + 1; k < a.length; k++) {
                const s = a[i] + a[j] + a[k];
                if (Math.abs(s - target) < Math.abs(best - target))
                    best = s;
            }
    return best;
}`,
    } },
    { name: '排序加雙指針', idea: '固定一數，其餘兩數由兩端往中間收，依目前和決定方向。', steps: ['先排序並設 best 為前三數和。先建立一個實際三數總和，後面才能比較誰更接近目標。', '對每個 i，l=i+1、r=n−1。每次只選三個不同位置，並計算它們與目標的絕對距離。', '計算三數和、更新 best；若和小於目標則 l++，否則 r--。更新指標或最佳值時保留更接近目標的總和，最後回傳這個總和。'], figure: { title: 'nums = [-1,2,1,-4], target = 1', steps: fig }, complexity: { time: 'O(n²)', space: 'O(log n)', why: '排序後，每個固定位置只需線性掃描；排序堆疊依語言實作而定。' }, verdict: '本題實用解。', code: {
      python: `def threeSumClosest(nums, target):
    nums.sort()
    best = sum(nums[:3])
    for i in range(len(nums) - 2):  # 固定第一個數，再嘗試另外兩個位置。
        l, r = (i + 1, len(nums) - 1)
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if abs(s - target) < abs(best - target):  # 只有更接近目標時才更新最佳總和。
                best = s
            if s == target:
                return s
            if s < target:
                l += 1
            else:
                r -= 1
    return best`,
      c: `static int cmpInt(const void *a, const void *b) {
    int x = *(int*)a, y = *(int*)b;
    return (x > y) - (x < y);
}
int threeSumClosest(int *a, int n, int target) {
    qsort(a, n, sizeof(int), cmpInt);
    int best = a[0] + a[1] + a[2];
    for (int i = 0; i < n - 2; i++) {
        int l = i + 1, r = n - 1;
        while (l < r) {
            int s = a[i] + a[l] + a[r];
            if (abs(s - target) < abs(best - target))
                best = s;
            if (s == target)
                return s;
            if (s < target)
                l++;
            else
                r--;
        }
    }
    return best;
}`,
      cpp: `int threeSumClosest(vector<int>& a, int target) {
    sort(a.begin(), a.end());
    int best = a[0] + a[1] + a[2];
    for (int i = 0; i < (int)a.size() - 2; i++) {
        int l = i + 1, r = a.size() - 1;
        while (l < r) {
            int s = a[i] + a[l] + a[r];
            if (abs(s - target) < abs(best - target))
                best = s;
            if (s == target)
                return s;
            if (s < target)
                l++;
            else
                r--;
        }
    }
    return best;
}`,
      java: `int threeSumClosest(int[] a, int target) {
    Arrays.sort(a);
    int best = a[0] + a[1] + a[2];
    for (int i = 0; i < a.length - 2; i++) {
        int l = i + 1, r = a.length - 1;
        while (l < r) {
            int s = a[i] + a[l] + a[r];
            if (Math.abs(s - target) < Math.abs(best - target))
                best = s;
            if (s == target)
                return s;
            if (s < target)
                l++;
            else
                r--;
        }
    }
    return best;
}`,
      javascript: `function threeSumClosest(a, target) {
    a.sort((x, y) => x - y);
    let best = a[0] + a[1] + a[2];
    for (let i = 0; i < a.length - 2; i++) {
        let l = i + 1, r = a.length - 1;
        while (l < r) {
            const s = a[i] + a[l] + a[r];
            if (Math.abs(s - target) < Math.abs(best - target))
                best = s;
            if (s === target)
                return s;
            if (s < target)
                l++;
            else
                r--;
        }
    }
    return best;
}`,
    } },
  ],
  pitfalls: ['JavaScript 必須提供數值排序比較函式。', '移動指針之前先更新最佳答案。', '三個索引必須不同。'],
  check: { kind: 'fn', fn: 'threeSumClosest', cases: [{ args: [A,1], out: 2 }, { args: [[0,0,0],1], out: 0 }, { args: [[1,1,1,0],-100], out: 2 }] },
}

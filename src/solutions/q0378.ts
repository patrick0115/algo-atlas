import type { Solution } from './types'
import type { GridViewData } from '../types'

// 378. Kth Smallest Element in a Sorted Matrix
const M = [[1,5,9],[10,11,13],[12,13,15]]
const grid = (hl: [number,number][] = [], label = 'matrix'): GridViewData => ({ kind: 'grid', label, cells: M, marks: { hl } })
const fig = [
  { note: '每列各自遞增，將每列第一個值放進最小堆積：1、10、12。', views: [grid([[0,0],[1,0],[2,0]], '每列起點')] },
  { note: '第一次取出最小值 1，接著把同一列的下一格 5 放進堆積；堆積目前有 5、10、12。', views: [grid([[0,1],[1,0],[2,0]], '取出 1 後')] },
  { note: '第二次取出 5，再補入同列的 9；每次取出的值依序是全矩陣下一個最小值。', views: [grid([[0,2],[1,0],[2,0]], '取出 5 後')] },
  { note: '取出 1 後放入同列下一個 5；再取 5 放入 9。持續取出，第 8 個是 13。', views: [grid([[1,0],[1,1]], '第 8 小是 13')] },
]

export const q0378: Solution = {
  id: 378,
  plain: '每列、每行都排好序的表格，找所有格子裡第 k 小的值；重複值要各算一次。',
  statement: '給 n×n 矩陣，列與行皆非遞減排序，回傳第 k 小的元素。',
  examples: [{ input: 'matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8', output: '13' }, { input: 'matrix = [[-5]], k = 1', output: '-5' }],
  constraints: ['1 ≤ n ≤ 300；1 ≤ k ≤ n²。', '值可能重複，也可能是負數。'],
  insight: ['每列已排序，可像合併 n 條有序串列，用最小堆積依序取出。', '也可在「值」的範圍做 [[p:binary-search-answer]]：計算矩陣中 ≤ mid 有多少個，若不少於 k，就縮小上界。', '從左下角開始計數 ≤ mid，每次可以排除一列或一行。'],
  approaches: [
    { name: '最小堆積合併各列', idea: '堆積保存每列尚未取出的最小元素，每取一個就補進該列下一個。', steps: ['把每列第 0 欄放入最小堆積。先準備每列的下一個候選，或設定可能答案的值域。', '重複取出堆頂 k 次。每次取出或計數後，就能排除一部分不可能的元素或值。', '取出 (r,c) 後若 c+1<n，加入 (r,c+1)；第 k 次取出的值就是答案。第 k 次取出的元素，或最小且有至少 k 格不大於它的值，就是答案。'], figure: { title: 'k = 8', steps: fig }, complexity: { time: 'O(k log n)', space: 'O(n)', why: '堆積最多 n 個元素，執行 k 次彈出與插入。' }, verdict: 'k 比 n² 小時很實用。', code: {
      python: `import heapq

def kthSmallest(matrix, k):
    n = len(matrix)
    h = [(matrix[r][0], r, 0) for r in range(n)]
    heapq.heapify(h)
    for _ in range(k):  # 從堆積取下一個值，或在值域中二分。
        x, r, c = heapq.heappop(h)
        if c + 1 < n:  # 計數達到 k 時，答案可能在較小的值域。
            heapq.heappush(h, (matrix[r][c + 1], r, c + 1))
    return x`,
      c: `typedef struct {
    int x, r, c;
}
Item;
static void push(Item * h, int *n, Item v) {
    int i = (*n)++;
    while (i > 0 && h[(i - 1) / 2].x > v.x) {
        h[i] = h[(i - 1) / 2];
        i = (i - 1) / 2;
    }
    h[i] = v;
}
static Item pop(Item * h, int *n) {
    Item out = h[0], v = h[--*n];
    if (*n) {
        int i = 0;
        while (i * 2 + 1 < *n) {
            int j = i * 2 + 1;
            if (j + 1 < *n && h[j + 1].x < h[j].x)
                j++;
            if (h[j].x >= v.x)
                break;
            h[i] = h[j];
            i = j;
        }
        h[i] = v;
    }
    return out;
}
int kthSmallest(int **matrix, int n, int *cols, int k) {
    Item *h = malloc(n * sizeof(Item));
    int len = 0;
    for (int r = 0; r < n; r++)
        push(h, & len, (Item) {matrix[r][0], r, 0});
    Item v = {0, 0, 0};
    for (int i = 0; i < k; i++) {
        v = pop(h, & len);
        if (v.c + 1 < n)
            push(h, & len, (Item) {matrix[v.r][v.c + 1], v.r, v.c + 1});
    }
    free(h);
    return v.x;
}`,
      cpp: `int kthSmallest(vector < vector<int>>& matrix, int k) {
    using T = tuple<int, int, int> ;
    priority_queue < T, vector<T>, greater<T>> h;
    int n = matrix.size();
    for (int r = 0; r < n; r++)
        h.push( {matrix[r][0], r, 0});
    int x = 0;
    for (int i = 0; i < k; i++) {
        auto [v, r, c] = h.top();
        h.pop();
        x = v;
        if (c + 1 < n)
            h.push( {matrix[r][c + 1], r, c + 1});
    }
    return x;
}`,
      java: `int kthSmallest(int[][] matrix, int k) {
    int n = matrix.length;
    PriorityQueue < int[] > h = new PriorityQueue<>((a, b)->Integer.compare(a[0], b[0]));
    for (int r = 0; r < n; r++)
        h.offer(new int[] {matrix[r][0], r, 0});
    int x = 0;
    for (int i = 0; i < k; i++) {
        int[] v = h.poll();
        x = v[0];
        if (v[2] + 1 < n)
            h.offer(new int[] {matrix[v[1]][v[2] + 1], v[1], v[2] + 1});
    }
    return x;
}`,
      javascript: `function kthSmallest(matrix, k) {
    const n = matrix.length, h = [];
    function push(v) {
        let i = h.length;
        h.push(v);
        while (i > 0) {
            let p = (i - 1) >> 1;
            if (h[p][0] <= v[0])
                break;
            h[i] = h[p];
            i = p;
        }
        h[i] = v;
    }
    function pop() {
        const out = h[0], v = h.pop();
        if (h.length) {
            let i = 0;
            while (i * 2 + 1 < h.length) {
                let j = i * 2 + 1;
                if (j + 1 < h.length && h[j + 1][0] < h[j][0])
                    j++;
                if (h[j][0] >= v[0])
                    break;
                h[i] = h[j];
                i = j;
            }
            h[i] = v;
        }
        return out;
    }
    for (let r = 0; r < n; r++)
        push([matrix[r][0], r, 0]);
    let x = 0;
    for (let i = 0; i < k; i++) {
        const [v, r, c] = pop();
        x = v;
        if (c + 1 < n)
            push([matrix[r][c + 1], r, c + 1]);
    }
    return x;
}`,
    } },
    { name: '對值域二分', idea: '尋找最小的 x，使矩陣中 ≤ x 的元素數量至少 k。', steps: ['lo=左上角，hi=右下角。先準備每列的下一個候選，或設定可能答案的值域。', '令 mid=floor((lo+hi)/2)，從左下角數 ≤ mid 的元素。每次取出或計數後，就能排除一部分不可能的元素或值。', '若數量 ≥ k，hi=mid；否則 lo=mid+1。第 k 次取出的元素，或最小且有至少 k 格不大於它的值，就是答案。', 'lo==hi 時回傳。第 k 次取出的元素，或最小且有至少 k 格不大於它的值，就是答案。'], figure: { title: 'k = 8', steps: [{ note: '值域先是 [1,15]。猜 mid=8 時只有 1、5 兩格 ≤8，不足 8 格，所以下界改為 9。', views: [grid([[0,0],[0,1]], '≤ 8')] }, { note: '在 [9,15] 猜 mid=12，有六格 ≤12，仍未達到第 8 小，因此下界再移到 13。', views: [grid([[0,0],[0,1],[0,2],[1,0],[1,1],[2,0]], '≤ 12')] }, { note: '檢查 13 時已有八格 ≤13，而 12 只有六格；最小的可行值就是 13。', views: [grid([[1,2],[2,1]], '邊界 13')] }] }, complexity: { time: 'O(n log V)', space: 'O(1)', why: '每次沿矩陣階梯走 O(n)，值域 V 二分。' }, verdict: '矩陣很大、k 很大時有利；重複值也適用。', code: {
      python: `def kthSmallest(matrix, k):
    n = len(matrix)
    lo, hi = (matrix[0][0], matrix[-1][-1])
    while lo < hi:  # 從堆積取下一個值，或在值域中二分。
        mid = (lo + hi) // 2
        r = n - 1
        c = 0
        count = 0
        while r >= 0 and c < n:
            if matrix[r][c] <= mid:  # 計數達到 k 時，答案可能在較小的值域。
                count += r + 1
                c += 1
            else:
                r -= 1
        if count >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      c: `int kthSmallest(int **matrix, int n, int *cols, int k) {
    long long lo = matrix[0][0], hi = matrix[n - 1][n - 1];
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        int r = n - 1, c = 0, count = 0;
        while (r >= 0 && c < n) {
            if (matrix[r][c] <= mid) {
                count += r + 1;
                c++;
            }
            else
                r--;
        }
        if (count >= k)
            hi = mid;
        else
            lo = mid + 1;
    }
    return (int)lo;
}`,
      cpp: `int kthSmallest(vector < vector<int>>& a, int k) {
    int n = a.size();
    long long lo = a[0][0], hi = a[n - 1][n - 1];
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        int r = n - 1, c = 0, count = 0;
        while (r >= 0 && c < n) {
            if (a[r][c] <= mid) {
                count += r + 1;
                c++;
            }
            else
                r--;
        }
        if (count >= k)
            hi = mid;
        else
            lo = mid + 1;
    }
    return lo;
}`,
      java: `int kthSmallest(int[][] a, int k) {
    int n = a.length;
    long lo = a[0][0], hi = a[n - 1][n - 1];
    while (lo < hi) {
        long mid = lo + (hi - lo) / 2;
        int r = n - 1, c = 0, count = 0;
        while (r >= 0 && c < n) {
            if (a[r][c] <= mid) {
                count += r + 1;
                c++;
            }
            else
                r--;
        }
        if (count >= k)
            hi = mid;
        else
            lo = mid + 1;
    }
    return (int)lo;
}`,
      javascript: `function kthSmallest(a, k) {
    const n = a.length;
    let lo = a[0][0], hi = a[n - 1][n - 1];
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        let r = n - 1, c = 0, count = 0;
        while (r >= 0 && c < n) {
            if (a[r][c] <= mid) {
                count += r + 1;
                c++;
            }
            else
                r--;
        }
        if (count >= k)
            hi = mid;
        else
            lo = mid + 1;
    }
    return lo;
}`,
    } },
  ],
  pitfalls: ['重複的 13 要算兩個位置。', '二分找的是值，不是矩陣索引。', 'C/C++/Java 計算值域中點用較寬整數避免溢位。'],
  check: { kind: 'fn', fn: 'kthSmallest', cases: [{ args: [M,8], out: 13 }, { args: [[[-5]],1], out: -5 }, { args: [[[1,2],[1,3]],2], out: 1 }] },
}

import type { Solution } from './types'
import type { GridViewData } from '../types'

// 85. Maximal Rectangle
const M = ['10100','10111','11111','10010'].map(s=>s.split(''))
const grid = (cells: (string|number)[][], hl: [number,number][] = [], label = 'matrix'): GridViewData => ({ kind: 'grid', label, cells, marks: { hl } })
const fig = [
  { note: '掃第 0 列後高度是 [1,0,1,0,0]；遇到 0 的欄位會歸零，因為矩形不能跨過 0。', views: [grid([[1,0,1,0,0]], [], '第 0 列高度')] },
  { note: '掃第 1 列後高度變為 [2,0,2,1,1]；每欄都記錄以此列為底的連續 1 數量。', views: [grid([[2,0,2,1,1]], [], '第 1 列高度')] },
  { note: '把每一列當作矩形底邊；到第 2 列時，各欄連續的 1 高度是 [3,0,3,2,2]。', views: [grid(M, [[2,2],[2,3],[2,4]]), grid([[3,0,3,2,2]], [], '高度')] },
  { note: '第 2、3、4 欄高度至少 2，寬 3、高 2，面積 6。', views: [grid(M, [[1,2],[1,3],[1,4],[2,2],[2,3],[2,4]])] },
  { note: '右邊界停在第 4 欄，因為再往右已沒有柱子；用高 2 乘寬 3，更新最大面積為 6。', views: [grid([[3,0,3,2,2]], [[0,2],[0,3],[0,4]], '結算面積 6')] },
]

export const q0085: Solution = {
  id: 85,
  plain: '在 0/1 表格裡，找一塊完全由 1 組成的最大長方形，回傳格子數。',
  statement: '給字元矩陣 matrix，找只含字元 1 的最大軸對齊矩形面積。',
  examples: [{ input: 'matrix = [[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]]', output: '6' }, { input: 'matrix = [[0]]', output: '0' }, { input: 'matrix = [[1]]', output: '1' }],
  constraints: ['1 ≤ 列數、行數 ≤ 200。', '每格是字元 "0" 或 "1"，不是數值。'],
  insight: ['固定一列作底邊，記每欄往上連續 1 的高度，便把網格轉成 [84](#/q/84) 的直方圖。', '對直方圖可向左向右擴展每個柱子，或用 [[p:monotonic-stack]] 一次求最大矩形。'],
  approaches: [
    { name: '逐柱向左右擴展', idea: '每列更新高度；以每欄高度為矩形高，左右找仍不低於它的範圍。', steps: ['遇 1，高度加一；遇 0，高度歸零。高度只計算到目前這列為止的連續 1，因此遇到 0 必須歸零。', '對每欄 j，以 h[j] 為高向左右掃到比它矮的柱。以某個高度向兩側找邊界，才能知道可形成矩形的寬度。', '計算高度×寬度並更新最佳面積。每算出一個面積都與目前最佳值比較，以免漏掉最大矩形。'], figure: { title: '第 2 列作底邊', steps: fig }, complexity: { time: 'O(mn²)', space: 'O(n)', why: 'm 列，每列 n 個柱各可掃 n 格。' }, verdict: '直接看得出長方形如何形成，效率較低。', code: {
      python: `def maximalRectangle(matrix):
    if not matrix:  # 遇到較矮的柱子時，結算已形成的矩形。
        return 0
    h = [0] * len(matrix[0])
    best = 0
    for row in matrix:  # 逐列更新每欄連續的 1 的高度。
        for j, v in enumerate(row):
            h[j] = h[j] + 1 if v == '1' else 0
        for j, x in enumerate(h):
            l = j
            r = j
            while l > 0 and h[l - 1] >= x:
                l -= 1
            while r + 1 < len(h) and h[r + 1] >= x:
                r += 1
            best = max(best, x * (r - l + 1))
    return best`,
      c: `int maximalRectangle(char **matrix, int m, int *cols) {
    if (!m)
        return 0;
    int n = cols[0], *h = calloc(n, sizeof(int)), best = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++)
            h[j] = matrix[i][j] == '1' ? h[j] + 1 : 0;
        for (int j = 0; j < n; j++) {
            int l = j, r = j;
            while (l > 0 && h[l - 1] >= h[j])
                l--;
            while (r + 1 < n && h[r + 1] >= h[j])
                r++;
            int a = h[j] * (r - l + 1);
            if (a > best)
                best = a;
        }
    }
    free(h);
    return best;
}`,
      cpp: `int maximalRectangle(vector < vector<char>>& matrix) {
    if (matrix.empty())
        return 0;
    int n = matrix[0].size(), best = 0;
    vector<int> h(n);
    for (auto & row : matrix) {
        for (int j = 0; j < n; j++)
            h[j] = row[j] == '1' ? h[j] + 1 : 0;
        for (int j = 0; j < n; j++) {
            int l = j, r = j;
            while (l > 0 && h[l - 1] >= h[j])
                l--;
            while (r + 1 < n && h[r + 1] >= h[j])
                r++;
            best = max(best, h[j] * (r - l + 1));
        }
    }
    return best;
}`,
      java: `int maximalRectangle(char[][] matrix) {
    if (matrix.length == 0)
        return 0;
    int n = matrix[0].length, best = 0;
    int[] h = new int[n];
    for (char[] row : matrix) {
        for (int j = 0; j < n; j++)
            h[j] = row[j] == '1' ? h[j] + 1 : 0;
        for (int j = 0; j < n; j++) {
            int l = j, r = j;
            while (l > 0 && h[l - 1] >= h[j])
                l--;
            while (r + 1 < n && h[r + 1] >= h[j])
                r++;
            best = Math.max(best, h[j] * (r - l + 1));
        }
    }
    return best;
}`,
      javascript: `function maximalRectangle(matrix) {
    if (!matrix.length)
        return 0;
    const n = matrix[0].length, h = Array(n).fill(0);
    let best = 0;
    for (const row of matrix) {
        for (let j = 0; j < n; j++)
            h[j] = row[j] === '1' ? h[j] + 1 : 0;
        for (let j = 0; j < n; j++) {
            let l = j, r = j;
            while (l > 0 && h[l - 1] >= h[j])
                l--;
            while (r + 1 < n && h[r + 1] >= h[j])
                r++;
            best = Math.max(best, h[j] * (r - l + 1));
        }
    }
    return best;
}`,
    } },
    { name: '單調堆疊求直方圖面積', idea: '堆疊保存高度不下降的索引；遇更矮柱時結算被彈出的高度。', steps: ['每列更新高度。高度只計算到目前這列為止的連續 1，因此遇到 0 必須歸零。', '掃描高度並多加一根高度 0 的哨兵。以某個高度向兩側找邊界，才能知道可形成矩形的寬度。', '新高度小於堆疊頂時彈出；寬度由新頂與目前索引界定。每算出一個面積都與目前最佳值比較，以免漏掉最大矩形。'], figure: { title: '第 2 列作底邊', steps: [...fig, { note: '掃到尾端 0 時，把高度 2 的三欄一起結算，得到 2×3=6。', views: [grid([[3,0,3,2,2,0]], [[0,3],[0,4]], '高度與結尾哨兵')] }] }, complexity: { time: 'O(mn)', space: 'O(n)', why: '每列每個柱子最多進、出堆疊一次。' }, verdict: '最佳複雜度；哨兵能避免漏算尾端矩形。', code: {
      python: `def maximalRectangle(matrix):
    if not matrix:  # 遇到較矮的柱子時，結算已形成的矩形。
        return 0
    h = [0] * len(matrix[0])
    best = 0
    for row in matrix:  # 逐列更新每欄連續的 1 的高度。
        for j, v in enumerate(row):
            h[j] = h[j] + 1 if v == '1' else 0
        st = []
        for i in range(len(h) + 1):
            x = h[i] if i < len(h) else 0
            while st and h[st[-1]] > x:
                height = h[st.pop()]
                left = st[-1] if st else -1
                best = max(best, height * (i - left - 1))
            st.append(i)
    return best`,
      c: `int maximalRectangle(char **matrix, int m, int *cols) {
    if (!m)
        return 0;
    int n = cols[0], *h = calloc(n + 1, sizeof(int)), *st = malloc((n + 1) * sizeof(int)), best = 0;
    for (int r = 0; r < m; r++) {
        for (int j = 0; j < n; j++)
            h[j] = matrix[r][j] == '1' ? h[j] + 1 : 0;
        int top = -1;
        for (int i = 0; i <= n; i++) {
            int x = i == n ? 0 : h[i];
            while (top >= 0 && h[st[top]] > x) {
                int height = h[st[top--]], left = top >= 0 ? st[top] : -1, a = height * (i - left - 1);
                if (a > best)
                    best = a;
            }
            st[++top] = i;
        }
    }
    free(h);
    free(st);
    return best;
}`,
      cpp: `int maximalRectangle(vector < vector<char>>& matrix) {
    if (matrix.empty())
        return 0;
    int n = matrix[0].size(), best = 0;
    vector<int> h(n);
    for (auto & row : matrix) {
        for (int j = 0; j < n; j++)
            h[j] = row[j] == '1' ? h[j] + 1 : 0;
        vector<int> st;
        for (int i = 0; i <= n; i++) {
            int x = i == n ? 0 : h[i];
            while (!st.empty() && h[st.back()] > x) {
                int height = h[st.back()];
                st.pop_back();
                int left = st.empty() ? -1 : st.back();
                best = max(best, height * (i - left - 1));
            }
            st.push_back(i);
        }
    }
    return best;
}`,
      java: `int maximalRectangle(char[][] matrix) {
    if (matrix.length == 0)
        return 0;
    int n = matrix[0].length, best = 0;
    int[] h = new int[n], st = new int[n + 1];
    for (char[] row : matrix) {
        for (int j = 0; j < n; j++)
            h[j] = row[j] == '1' ? h[j] + 1 : 0;
        int top = -1;
        for (int i = 0; i <= n; i++) {
            int x = i == n ? 0 : h[i];
            while (top >= 0 && h[st[top]] > x) {
                int height = h[st[top--]], left = top >= 0 ? st[top] : -1;
                best = Math.max(best, height * (i - left - 1));
            }
            st[++top] = i;
        }
    }
    return best;
}`,
      javascript: `function maximalRectangle(matrix) {
    if (!matrix.length)
        return 0;
    const n = matrix[0].length, h = Array(n).fill(0);
    let best = 0;
    for (const row of matrix) {
        for (let j = 0; j < n; j++)
            h[j] = row[j] === '1' ? h[j] + 1 : 0;
        const st = [];
        for (let i = 0; i <= n; i++) {
            const x = i === n ? 0 : h[i];
            while (st.length && h[st.at(-1)] > x) {
                const height = h[st.pop()], left = st.length ? st.at(-1) : -1;
                best = Math.max(best, height * (i - left - 1));
            }
            st.push(i);
        }
    }
    return best;
}`,
    } },
  ],
  pitfalls: ['高度遇到 0 必須歸零。', '堆疊掃完一列前要用高度 0 結算剩下柱子。', 'C/Java 接收的是字元矩陣。'],
  check: { kind: 'fn', fn: 'maximalRectangle', cases: [{ args: [M], out: 6 }, { args: [[['0']]], out: 0 }, { args: [[['1']]], out: 1 }] },
}

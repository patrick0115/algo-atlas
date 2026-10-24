import type { Solution } from './types'
import type { GridViewData } from '../types'

// 547. Number of Provinces
const M = [[1,1,0],[1,1,0],[0,0,1]]
const view = (hl: [number,number][] = []): GridViewData => ({ kind: 'grid', label: 'isConnected：1 代表直接相連', cells: M, marks: { hl } })
const fig = [
  { note: '三個城市起初都未訪問，省份數是 0；先從城市 0 開始第一次 DFS。', views: [view([[0,0]])] },
  { note: '城市 0 與 1 直接相連，屬於同一省；城市 2 與它們都不相連。', views: [view([[0,1],[1,0]])] },
  { note: 'DFS 從 0 走到 1，兩城都標記完成；城市 2 仍未訪問，所以還需要再啟動一次 DFS。', views: [view([[0,0],[1,1]])] },
  { note: '城市 2 尚未訪問，從 2 再啟動一次 DFS，省份數加一，總共兩省。', views: [view([[2,2]])] },
]

export const q0547: Solution = {
  id: 547,
  plain: '城市彼此可以直接或轉車相連。數一數所有城市被分成幾個互不相通的群。',
  statement: '給對稱的 n×n 連接矩陣，isConnected[i][j]=1 代表城市 i、j 直接相連。回傳連通群（省份）數。',
  examples: [{ input: 'isConnected = [[1,1,0],[1,1,0],[0,0,1]]', output: '2' }, { input: 'isConnected = [[1,0,0],[0,1,0],[0,0,1]]', output: '3' }],
  constraints: ['1 ≤ n ≤ 200。', 'isConnected 對稱且對角線為 1。'],
  insight: ['直接與間接相連都屬同一省，這是圖的連通分量。', '從每個未訪問城市出發 DFS，出發次數就是省份數。', '也可用 [[p:union-find]]，每遇到相連的兩城便合併。'],
  approaches: [
    { name: 'DFS 標記連通群', idea: '每次從未訪問城市出發，走完一整個省份。', steps: ['建立 visited。每個尚未訪問的城市都代表一個新省份的起點。', '遍歷城市 i；未訪問則省份數加一，DFS 找出它能到達的所有城市。沿連接關係走完可到達的城市，它們都屬於同一省。', '全部城市處理完回傳省份數。處理完所有城市後，啟動搜尋或成功合併的次數就能決定答案。'], figure: { title: '3 個城市', steps: fig }, complexity: { time: 'O(n²)', space: 'O(n)', why: '每個城市掃描整列；visited 和遞迴最多 n。' }, verdict: '與 [200](#/q/200) 數島嶼的走訪想法相同。', code: {
      python: `def findCircleNum(isConnected):
    n = len(isConnected)
    seen = set()

    def dfs(i):
        seen.add(i)
        for j in range(n):  # 掃 i 的所有鄰居
            if isConnected[i][j] and j not in seen:  # 相連且沒走過就走過去
                dfs(j)
    ans = 0
    for i in range(n):
        if i not in seen:
            ans += 1
            dfs(i)
    return ans`,
      c: `static void dfs(int **g, int n, int i, bool *seen) {
    seen[i] = true;
    for (int j = 0; j < n; j++)
        if (g[i][j] && !seen[j])
            dfs(g, n, j, seen);
}
int findCircleNum(int **isConnected, int n, int *cols) {
    bool *seen = calloc(n, sizeof(bool));
    int ans = 0;
    for (int i = 0; i < n; i++)
        if (!seen[i]) {
            ans++;
            dfs(isConnected, n, i, seen);
        }
    free(seen);
    return ans;
}`,
      cpp: `int findCircleNum(vector<vector<int>>& g) {
    int n = g.size(), ans = 0;
    vector<int> seen(n);
    function<void(int)> dfs = [&](int i) {
        seen[i] = 1;
        for (int j = 0; j < n; j++)
            if (g[i][j] && !seen[j])
                dfs(j);
    };
    for (int i = 0; i < n; i++)
        if (!seen[i]) {
            ans++;
            dfs(i);
        }
    return ans;
}`,
      java: `void dfs(int[][] g, int i, boolean[] seen) {
    seen[i] = true;
    for (int j = 0; j < g.length; j++)
        if (g[i][j] == 1 && !seen[j])
            dfs(g, j, seen);
}
int findCircleNum(int[][] g) {
    boolean[] seen = new boolean[g.length];
    int ans = 0;
    for (int i = 0; i < g.length; i++)
        if (!seen[i]) {
            ans++;
            dfs(g, i, seen);
        }
    return ans;
}`,
      javascript: `function findCircleNum(g) {
    const n = g.length, seen = Array(n).fill(false);
    function dfs(i) {
        seen[i] = true;
        for (let j = 0; j < n; j++)
            if (g[i][j] && !seen[j])
                dfs(j);
    }
    let ans = 0;
    for (let i = 0; i < n; i++)
        if (!seen[i]) {
            ans++;
            dfs(i);
        }
    return ans;
}`,
    } },
    { name: '並查集合併城市', idea: '相連兩城歸到同一代表；每次成功合併，省份數減一。', steps: ['每城先是一個省，parent[i]=i，答案 n。每城先自成一組。', '只掃矩陣上三角的 i<j；相連且根不同則合併。', '每合併一次答案減一。處理完所有城市後，啟動搜尋或成功合併的次數就能決定答案。'], figure: { title: '3 個城市', steps: [{ note: '一開始 parent=[0,1,2]，三座城市各算一個省，因此計數是 3。', views: [view([[0,0],[1,1],[2,2]])] }, { note: '檢查 (0,1) 發現兩城相連，就把 1 併入 0 的集合，省份數降為 2。', views: [view([[0,1]])] }, { note: '其餘不同城市的連接都是 0，城市 2 保持獨立，最後回傳 2。', views: [view([[0,2],[1,2]])] }] }, complexity: { time: 'O(n² α(n))', space: 'O(n)', why: '檢查 n² 個連接，每次 find/union 幾乎常數時間。' }, verdict: '適合延伸到「陸續增加道路」的版本。', code: {
      python: `def findCircleNum(isConnected):
    n = len(isConnected)
    p = list(range(n))
    ans = n

    def find(x):
        while p[x] != x:  # 往上找根，順便路徑減半
            p[x] = p[p[x]]
            x = p[x]
        return x
    for i in range(n):
        for j in range(i + 1, n):
            if isConnected[i][j]:  # 兩城直接相連
                a, b = (find(i), find(j))
                if a != b:
                    p[a] = b
                    ans -= 1
    return ans`,
      c: `static int find(int *p, int x) {
    while (p[x] != x) {
        p[x] = p[p[x]];
        x = p[x];
    }
    return x;
}
int findCircleNum(int **g, int n, int *cols) {
    int *p = malloc(n * sizeof(int)), ans = n;
    for (int i = 0; i < n; i++)
        p[i] = i;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (g[i][j]) {
                int a = find(p, i), b = find(p, j);
                if (a != b) {
                    p[a] = b;
                    ans--;
                }
            }
    free(p);
    return ans;
}`,
      cpp: `int findCircleNum(vector<vector<int>>& g) {
    int n = g.size(), ans = n;
    vector<int> p(n);
    iota(p.begin(), p.end(), 0);
    function<int(int)> find = [&](int x) {
        return p[x] == x ? x : p[x] = find(p[x]);
    };
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (g[i][j]) {
                int a = find(i), b = find(j);
                if (a != b) {
                    p[a] = b;
                    ans--;
                }
            }
    return ans;
}`,
      java: `int find(int[] p, int x) {
    while (p[x] != x) {
        p[x] = p[p[x]];
        x = p[x];
    }
    return x;
}
int findCircleNum(int[][] g) {
    int n = g.length, ans = n;
    int[] p = new int[n];
    for (int i = 0; i < n; i++)
        p[i] = i;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (g[i][j] == 1) {
                int a = find(p, i), b = find(p, j);
                if (a != b) {
                    p[a] = b;
                    ans--;
                }
            }
    return ans;
}`,
      javascript: `function findCircleNum(g) {
    const n = g.length, p = Array.from({ length: n }, (_, i) => i);
    let ans = n;
    function find(x) {
        while (p[x] !== x) {
            p[x] = p[p[x]];
            x = p[x];
        }
        return x;
    }
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
            if (g[i][j]) {
                const a = find(i), b = find(j);
                if (a !== b) {
                    p[a] = b;
                    ans--;
                }
            }
    return ans;
}`,
    } },
  ],
  pitfalls: ['不要把矩陣裡的 1 個數當成省份數。', '間接連通也屬同一省。', '並查集只掃 i<j 即可，避免重複處理。'],
  check: { kind: 'fn', fn: 'findCircleNum', cases: [{ args: [M], out: 2 }, { args: [[[1,0,0],[0,1,0],[0,0,1]]], out: 3 }, { args: [[[1]]], out: 1 }] },
}

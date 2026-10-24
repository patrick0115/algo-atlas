import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

const G = [[1, 1, 1], [1, 1, 0], [1, 0, 1]]

function grid(cells: number[][], highlight: Cell[] = [], done: Cell[] = []): GridViewData {
  return { kind: 'grid', label: '從 (1,1) 出發，把相連的 1 改成 2', cells, marks: { hl: highlight, done } }
}

function dfsFig(): FigStep[] {
  return [
    { note: '起點 (1,1) 原本是 1。先改成 2，堆疊放入起點；新顏色也當作已走過的標記。', views: [grid([[1, 1, 1], [1, 2, 0], [1, 0, 1]], [[1, 1]])] },
    { note: '從起點向上、下、左、右查看，值為 1 且相鄰的 (0,1)、(1,0) 可以加入；0 不能穿過。', views: [grid([[1, 2, 1], [2, 2, 0], [1, 0, 1]], [[0, 1], [1, 0]], [[1, 1]])] },
    { note: '沿著相連的 1 繼續走，(0,0)、(0,2)、(2,0) 都改成 2。', views: [grid([[2, 2, 2], [2, 2, 0], [2, 0, 1]], [[2, 0]], [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1]])] },
    { note: '右下角的 1 被 0 隔開，無法從起點走到，保持 1。', views: [grid([[2, 2, 2], [2, 2, 0], [2, 0, 1]], [], [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 0]])] },
  ]
}

function bfsFig(): FigStep[] {
  return [
    { note: '佇列一開始只有起點 (1,1)，把它從 1 改成 2。', views: [grid([[1, 1, 1], [1, 2, 0], [1, 0, 1]], [[1, 1]])] },
    { note: '取出 (1,1)，把相鄰且原本是 1 的 (0,1)、(1,0) 改色並排進佇列。', views: [grid([[1, 2, 1], [2, 2, 0], [1, 0, 1]], [[0, 1], [1, 0]], [[1, 1]])] },
    { note: '接著依先入先出順序展開 (0,1)、(1,0)，新找到 (0,0)、(0,2)、(2,0)。', views: [grid([[2, 2, 2], [2, 2, 0], [2, 0, 1]], [[0, 0], [0, 2], [2, 0]])] },
    { note: '佇列清空後完成；右下角的 1 沒被連通區碰到。', views: [grid([[2, 2, 2], [2, 2, 0], [2, 0, 1]], [], [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 0]])] },
  ]
}

export const q0733: Solution = {
  id: 733,
  plain: '像油漆桶一樣，從指定格子開始，只把四方向相連且原本顏色相同的區域換色。',
  statement: '給 image、起點 (sr,sc) 和新顏色 color，將起點及所有經四方向相連、原本與起點同色的格子改成 color，回傳修改後的 image。',
  examples: [{ input: 'image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2', output: '[[2,2,2],[2,2,0],[2,0,1]]' }, { input: 'image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0', output: '[[0,0,0],[0,0,0]]' }],
  constraints: ['`1 ≤ image.length, image[0].length ≤ 50`', '`0 ≤ image[r][c], color < 2¹⁶`', '只能經上下左右移動。'],
  insight: ['這是網格上的 [[p:graph-traversal]]。', '如果起點原色已等於新色，要直接回傳；否則換色後仍符合原色會反覆走回同一格。'],
  approaches: [
    {
      name: '堆疊深度優先填色',
      idea: '把找到的格子立刻改色並放入堆疊，之後只找仍為原色的鄰居。',
      steps: ['記原色；若與新色相同直接回傳。', '起點改色並入堆疊。', '每次取出一格，查看四鄰；原色鄰居立刻改色並入堆疊。', '堆疊清空時回傳 image。'],
      figure: { title: 'image = [[1,1,1],[1,1,0],[1,0,1]]', steps: dfsFig() },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '每個格子最多改色一次，堆疊最多容納整個連通區。' },
      verdict: '迭代版本避免深網格造成遞迴深度問題。',
      code: {
        python: `def floodFill(image, sr, sc, color):
    original = image[sr][sc]
    if original == color:
        return image
    rows, cols = len(image), len(image[0])
    stack = [(sr, sc)]
    image[sr][sc] = color  # 入堆疊時立刻標記
    while stack:
        r, c = stack.pop()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and image[nr][nc] == original:
                image[nr][nc] = color
                stack.append((nr, nc))
    return image`,
        c: `int **floodFill(int **image, int imageSize, int *imageColSize, int sr, int sc, int color, int *returnSize, int **returnColumnSizes) {
    *returnSize = imageSize;
    *returnColumnSizes = malloc(imageSize * sizeof(int));
    for (int r = 0; r < imageSize; r++) {
        (*returnColumnSizes)[r] = imageColSize[r];
    }
    int original = image[sr][sc];
    if (original == color) {
        return image;
    }
    int cols = imageColSize[0];
    int capacity = imageSize * cols;
    int *stack = malloc(capacity * sizeof(int));
    int top = 0;
    stack[top++] = sr * cols + sc;
    image[sr][sc] = color;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    while (top) {
        int pos = stack[--top];
        int r = pos / cols;
        int c = pos % cols;
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d];
            int nc = c + dc[d];
            if (nr >= 0 && nr < imageSize && nc >= 0 && nc < cols && image[nr][nc] == original) {
                image[nr][nc] = color;
                stack[top++] = nr * cols + nc;
            }
        }
    }
    free(stack);
    return image;
}`,
        cpp: `vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
    int original = image[sr][sc];
    if (original == color) {
        return image;
    }
    int rows = image.size();
    int cols = image[0].size();
    vector<pair<int, int>> stack{{sr, sc}};
    image[sr][sc] = color;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    while (!stack.empty()) {
        auto [r, c] = stack.back();
        stack.pop_back();
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d];
            int nc = c + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && image[nr][nc] == original) {
                image[nr][nc] = color;
                stack.push_back({nr, nc});
            }
        }
    }
    return image;
}`,
        java: `int[][] floodFill(int[][] image, int sr, int sc, int color) {
    int original = image[sr][sc];
    if (original == color) {
        return image;
    }
    int rows = image.length;
    int cols = image[0].length;
    ArrayDeque<int[]> stack = new ArrayDeque<>();
    stack.push(new int[]{sr, sc});
    image[sr][sc] = color;
    int[] dr = {1, -1, 0, 0};
    int[] dc = {0, 0, 1, -1};
    while (!stack.isEmpty()) {
        int[] cell = stack.pop();
        for (int d = 0; d < 4; d++) {
            int nr = cell[0] + dr[d];
            int nc = cell[1] + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && image[nr][nc] == original) {
                image[nr][nc] = color;
                stack.push(new int[]{nr, nc});
            }
        }
    }
    return image;
}`,
        javascript: `function floodFill(image, sr, sc, color) {
  const original = image[sr][sc];
  if (original === color) {
    return image;
  }
  const rows = image.length;
  const cols = image[0].length;
  const stack = [[sr, sc]];
  image[sr][sc] = color;
  for (; stack.length;) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && image[nr][nc] === original) {
        image[nr][nc] = color;
        stack.push([nr, nc]);
      }
    }
  }
  return image;
}`,
      },
    },
    {
      name: '佇列廣度優先填色',
      idea: '與深度優先相同的相鄰判斷，改用佇列讓格子按距離一層一層展開。',
      steps: ['記原色，相同色直接回傳。', '起點改色並入佇列。', '由隊首取一格，把仍為原色的四鄰改色並入隊。', '隊列清空時完成。'],
      figure: { title: 'image = [[1,1,1],[1,1,0],[1,0,1]]', steps: bfsFig() },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '每格最多入隊一次，最壞佇列容納整個連通區。' },
      verdict: '按層擴散，適合觀察填色波紋。',
      code: {
        python: `from collections import deque

def floodFill(image, sr, sc, color):
    original = image[sr][sc]
    if original == color:
        return image
    rows, cols = len(image), len(image[0])
    queue = deque([(sr, sc)])
    image[sr][sc] = color  # 入隊時標記，避免重複入隊
    while queue:
        r, c = queue.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and image[nr][nc] == original:
                image[nr][nc] = color
                queue.append((nr, nc))
    return image`,
        c: `int **floodFill(int **image, int imageSize, int *imageColSize, int sr, int sc, int color, int *returnSize, int **returnColumnSizes) {
    *returnSize = imageSize;
    *returnColumnSizes = malloc(imageSize * sizeof(int));
    for (int r = 0; r < imageSize; r++) {
        (*returnColumnSizes)[r] = imageColSize[r];
    }
    int original = image[sr][sc];
    if (original == color) {
        return image;
    }
    int cols = imageColSize[0];
    int *queue = malloc(imageSize * cols * sizeof(int));
    int head = 0;
    int tail = 0;
    queue[tail++] = sr * cols + sc;
    image[sr][sc] = color;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    while (head < tail) {
        int pos = queue[head++];
        int r = pos / cols;
        int c = pos % cols;
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d];
            int nc = c + dc[d];
            if (nr >= 0 && nr < imageSize && nc >= 0 && nc < cols && image[nr][nc] == original) {
                image[nr][nc] = color;
                queue[tail++] = nr * cols + nc;
            }
        }
    }
    free(queue);
    return image;
}`,
        cpp: `vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
    int original = image[sr][sc];
    if (original == color) {
        return image;
    }
    int rows = image.size();
    int cols = image[0].size();
    queue<pair<int, int>> todo;
    todo.push({sr, sc});
    image[sr][sc] = color;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    while (!todo.empty()) {
        auto [r, c] = todo.front();
        todo.pop();
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d];
            int nc = c + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && image[nr][nc] == original) {
                image[nr][nc] = color;
                todo.push({nr, nc});
            }
        }
    }
    return image;
}`,
        java: `int[][] floodFill(int[][] image, int sr, int sc, int color) {
    int original = image[sr][sc];
    if (original == color) {
        return image;
    }
    int rows = image.length;
    int cols = image[0].length;
    ArrayDeque<int[]> queue = new ArrayDeque<>();
    queue.add(new int[]{sr, sc});
    image[sr][sc] = color;
    int[] dr = {1, -1, 0, 0};
    int[] dc = {0, 0, 1, -1};
    while (!queue.isEmpty()) {
        int[] cell = queue.remove();
        for (int d = 0; d < 4; d++) {
            int nr = cell[0] + dr[d];
            int nc = cell[1] + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && image[nr][nc] == original) {
                image[nr][nc] = color;
                queue.add(new int[]{nr, nc});
            }
        }
    }
    return image;
}`,
        javascript: `function floodFill(image, sr, sc, color) {
  const original = image[sr][sc];
  if (original === color) {
    return image;
  }
  const rows = image.length;
  const cols = image[0].length;
  const queue = [[sr, sc]];
  let head = 0;
  image[sr][sc] = color;
  for (; head < queue.length; head++) {
    const [r, c] = queue[head];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && image[nr][nc] === original) {
        image[nr][nc] = color;
        queue.push([nr, nc]);
      }
    }
  }
  return image;
}`,
      },
    },
  ],
  pitfalls: ['原色等於新色要直接返回，否則無法靠改色標記已訪問。', '只連接上下左右；斜對角同色不屬於連通區。'],
  check: { kind: 'fn', fn: 'floodFill', cases: [{ args: [G, 1, 1, 2], out: [[2, 2, 2], [2, 2, 0], [2, 0, 1]] }, { args: [[[0, 0, 0], [0, 0, 0]], 0, 0, 0], out: [[0, 0, 0], [0, 0, 0]] }, { args: [[[1, 0], [0, 1]], 0, 0, 3], out: [[3, 0], [0, 1]] }] },
}

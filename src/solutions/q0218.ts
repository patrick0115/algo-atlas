import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 218. The Skyline Problem
const B = [[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]]
const OUT = [[2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0]]
const F = [
  { note: '所有建築左右邊界是可能改變高度的位置；先把 x 座標排序去重。', views: [arr([2, 3, 5, 7, 9, 12, 15, 19, 20, 24], { label: '候選 x' })] },
  { note: 'x=2 只有第一棟覆蓋，高度 10；記錄轉折 [2,10]。', views: [arr(['2:10'], { label: '天際線轉折' })] },
  { note: 'x=3 第二棟開始，高度升到 15；x=5 雖有新建築，但最高仍是 15，不新增轉折。', views: [arr(['2:10', '3:15'], { label: '轉折' })] },
  { note: 'x=7 高樓結束，最高降到 12；x=12 所有左側建築結束，降到 0。', views: [arr(['2:10', '3:15', '7:12', '12:0'], { label: '轉折' })] },
  { note: '右側兩棟再產生 15→10、20→8、24→0，得到完整輪廓。', views: [arr(OUT.map((p) => `${p[0]}:${p[1]}`), { label: '全部轉折', done: [0, 1, 2, 3, 4, 5, 6] })] },
]
const G = [
  { note: '依 x 排序建築起點；堆記住目前仍覆蓋 x 的建築高度及右邊界。', views: [arr([2, 3, 5, 15, 19], { label: '起點 x' })] },
  { note: 'x=2 加入高度 10、結束點 9；最高高度由 0 變 10。', views: [arr([10], { label: '有效高度', highlight: [0] })] },
  { note: 'x=3 加入高度 15、結束點 7；堆頂變 15。', views: [arr([15, 10], { label: '堆中高度', highlight: [0] })] },
  { note: 'x=7 高度 15 的建築到期；移除後最高成 12。', views: [arr([12, 10], { label: '有效高度', highlight: [0] })] },
  { note: '每個事件 x 只輸出一次最高高度的變化；最末端 24 下降到 0。', views: [arr(OUT.map((p) => `${p[0]}:${p[1]}`), { label: '結果', done: [0, 1, 2, 3, 4, 5, 6] })] },
]

export const q0218: Solution = {
  id: 218,
  plain: '從遠處看一排重疊的建築，只記錄最高輪廓每次升降的轉折點。',
  statement: '每棟建築是 `[left,right,height]`，覆蓋半開區間 `[left,right)`。回傳天際線的關鍵點 `[x,當時最高高度]`，連續同高不重複；最後必須降到 0。',
  examples: [{ input: 'buildings = [[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]', output: '[[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]' }, { input: 'buildings = [[0,2,3],[2,5,3]]', output: '[[0,3],[5,0]]' }],
  constraints: ['建築數最多 10⁴；每棟 left < right。'],
  insight: ['高度只可能在建築起點或終點改變。', '掃描所有 x 時，當前最高的有效建築決定輪廓；可用 [[p:heap]] 追蹤。'],
  approaches: [
    {
      name: '每個邊界重掃所有建築',
      idea: '列出所有左右邊界，在每個 x 檢查哪些建築仍覆蓋這裡。',
      steps: ['排序並去重全部邊界 x。', '對每個 x 掃所有建築，找 `left ≤ x < right` 的最高高度。', '高度與前一個 x 不同才新增關鍵點。'],
      figure: { title: '建築 [[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]', steps: F },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '最多 2n 個邊界，每個邊界掃 n 棟建築。' },
      verdict: '輪廓定義最直接；大資料要用事件掃描。',
      code: {
        python: `def getSkyline(buildings):
    edges = sorted({x for left, right, _ in buildings for x in (left, right)})
    answer = []
    previous = 0
    for x in edges:
        height = max((h for left, right, h in buildings if left <= x < right), default=0)
        if height != previous:
            answer.append([x, height])  # 只記高度真正改變處
            previous = height
    return answer`,
        c: `static int cmpInt218(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return x < y ? -1 : x > y;
}

int **getSkyline(int **buildings, int buildingsSize, int *buildingsColSize, int *returnSize, int **returnColumnSizes) {
    int *edges = malloc(2 * buildingsSize * sizeof(int));
    for (int i = 0; i < buildingsSize; i++) {
        edges[2 * i] = buildings[i][0];
        edges[2 * i + 1] = buildings[i][1];
    }
    qsort(edges, 2 * buildingsSize, sizeof(int), cmpInt218);
    int **answer = malloc(2 * buildingsSize * sizeof(int *));
    *returnColumnSizes = malloc(2 * buildingsSize * sizeof(int));
    *returnSize = 0;
    int previous = 0;
    for (int i = 0; i < 2 * buildingsSize; i++) {
        int x = edges[i];
        if (i && x == edges[i - 1]) continue;
        int height = 0;
        for (int j = 0; j < buildingsSize; j++) {
            if (buildings[j][0] <= x && x < buildings[j][1] && buildings[j][2] > height) height = buildings[j][2];
        }
        if (height == previous) continue;
        int *point = malloc(2 * sizeof(int));
        point[0] = x;
        point[1] = height;
        answer[*returnSize] = point;
        (*returnColumnSizes)[*returnSize] = 2;
        (*returnSize)++;
        previous = height;
    }
    free(edges);
    return answer;
}`,
        cpp: `vector<vector<int>> getSkyline(vector<vector<int>>& buildings) {
    vector<int> edges;
    for (const auto& b : buildings) {
        edges.push_back(b[0]);
        edges.push_back(b[1]);
    }
    sort(edges.begin(), edges.end());
    edges.erase(unique(edges.begin(), edges.end()), edges.end());
    vector<vector<int>> answer;
    int previous = 0;
    for (int x : edges) {
        int height = 0;
        for (const auto& b : buildings) {
            if (b[0] <= x && x < b[1]) height = max(height, b[2]);
        }
        if (height != previous) {
            answer.push_back({x, height});
            previous = height;
        }
    }
    return answer;
}`,
        java: `List<List<Integer>> getSkyline(int[][] buildings) {
    TreeSet<Integer> edges = new TreeSet<>();
    for (int[] b : buildings) {
        edges.add(b[0]);
        edges.add(b[1]);
    }
    List<List<Integer>> answer = new ArrayList<>();
    int previous = 0;
    for (int x : edges) {
        int height = 0;
        for (int[] b : buildings) {
            if (b[0] <= x && x < b[1]) height = Math.max(height, b[2]);
        }
        if (height != previous) {
            answer.add(Arrays.asList(x, height));
            previous = height;
        }
    }
    return answer;
}`,
        javascript: `function getSkyline(buildings) {
  const edges = [...new Set(buildings.flatMap(([left, right]) => [left, right]))].sort((a, b) => a - b);
  const answer = [];
  let previous = 0;
  for (const x of edges) {
    let height = 0;
    for (const [left, right, h] of buildings) {
      if (left <= x && x < right) height = Math.max(height, h);
    }
    if (height !== previous) {
      answer.push([x, height]);
      previous = height;
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '事件掃描與最大堆',
      idea: '在每個邊界加入起點建築、移除已到終點的建築，堆頂就是目前高度。',
      steps: ['依起點排序建築，也排序全部邊界。', '每到 x，把起點 ≤ x 的建築放進最大堆。', '丟掉堆頂右邊界 ≤ x 的過期建築。', '堆頂高度改變時輸出 `[x,height]`。'],
      figure: { title: '依 x 掃描建築輪廓', steps: G },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '每棟建築進出堆各一次，邊界排序。' },
      verdict: '適合最大資料量；同一個 x 的事件要合併後才輸出。',
      code: {
        python: `import heapq

def getSkyline(buildings):
    edges = sorted({x for left, right, _ in buildings for x in (left, right)})
    heap = []
    answer = []
    i = 0
    for x in edges:
        while i < len(buildings) and buildings[i][0] <= x:
            left, right, height = buildings[i]
            heapq.heappush(heap, (-height, right))  # 最大高度放堆頂
            i += 1
        while heap and heap[0][1] <= x:
            heapq.heappop(heap)       # 到達右邊界就不再覆蓋 x
        height = -heap[0][0] if heap else 0
        if not answer or answer[-1][1] != height:
            answer.append([x, height])
    return answer`,
        c: `typedef struct { int height, right; } Building218;

static int cmpBuilding218(const void *a, const void *b) {
    int *x = *(int **)a, *y = *(int **)b;
    return x[0] < y[0] ? -1 : x[0] > y[0];
}

static int cmpEdge218(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return x < y ? -1 : x > y;
}

static void push218(Building218 *heap, int *size, Building218 item) {
    int i = (*size)++;
    while (i > 0 && heap[(i - 1) / 2].height < item.height) {
        heap[i] = heap[(i - 1) / 2];
        i = (i - 1) / 2;
    }
    heap[i] = item;
}

static void pop218(Building218 *heap, int *size) {
    Building218 item = heap[--(*size)];
    int i = 0;
    while (i * 2 + 1 < *size) {
        int child = i * 2 + 1;
        if (child + 1 < *size && heap[child + 1].height > heap[child].height) child++;
        if (heap[child].height <= item.height) break;
        heap[i] = heap[child];
        i = child;
    }
    if (*size) heap[i] = item;
}

int **getSkyline(int **buildings, int buildingsSize, int *buildingsColSize, int *returnSize, int **returnColumnSizes) {
    int *edges = malloc(2 * buildingsSize * sizeof(int));
    for (int j = 0; j < buildingsSize; j++) {
        edges[2 * j] = buildings[j][0];
        edges[2 * j + 1] = buildings[j][1];
    }
    qsort(edges, 2 * buildingsSize, sizeof(int), cmpEdge218);
    qsort(buildings, buildingsSize, sizeof(int *), cmpBuilding218);
    Building218 *heap = malloc(buildingsSize * sizeof(Building218));
    int size = 0, i = 0, previous = 0;
    int **answer = malloc(2 * buildingsSize * sizeof(int *));
    *returnColumnSizes = malloc(2 * buildingsSize * sizeof(int));
    *returnSize = 0;
    for (int j = 0; j < 2 * buildingsSize; j++) {
        int x = edges[j];
        if (j && x == edges[j - 1]) continue;
        while (i < buildingsSize && buildings[i][0] <= x) {
            push218(heap, &size, (Building218){buildings[i][2], buildings[i][1]});
            i++;
        }
        while (size && heap[0].right <= x) pop218(heap, &size);
        int height = size ? heap[0].height : 0;
        if (height == previous) continue;
        answer[*returnSize] = malloc(2 * sizeof(int));
        answer[*returnSize][0] = x;
        answer[*returnSize][1] = height;
        (*returnColumnSizes)[*returnSize] = 2;
        (*returnSize)++;
        previous = height;
    }
    free(edges);
    free(heap);
    return answer;
}`,
        cpp: `vector<vector<int>> getSkyline(vector<vector<int>>& buildings) {
    vector<int> edges;
    for (const auto& b : buildings) {
        edges.push_back(b[0]);
        edges.push_back(b[1]);
    }
    sort(edges.begin(), edges.end());
    edges.erase(unique(edges.begin(), edges.end()), edges.end());
    priority_queue<pair<int, int>> heap;
    vector<vector<int>> answer;
    int i = 0;
    for (int x : edges) {
        while (i < (int)buildings.size() && buildings[i][0] <= x) {
            heap.push({buildings[i][2], buildings[i][1]});
            i++;
        }
        while (!heap.empty() && heap.top().second <= x) heap.pop();
        int height = heap.empty() ? 0 : heap.top().first;
        if (answer.empty() || answer.back()[1] != height) answer.push_back({x, height});
    }
    return answer;
}`,
        java: `List<List<Integer>> getSkyline(int[][] buildings) {
    TreeSet<Integer> edges = new TreeSet<>();
    for (int[] b : buildings) {
        edges.add(b[0]);
        edges.add(b[1]);
    }
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(b[0], a[0]));
    List<List<Integer>> answer = new ArrayList<>();
    int i = 0;
    for (int x : edges) {
        while (i < buildings.length && buildings[i][0] <= x) {
            heap.offer(new int[]{buildings[i][2], buildings[i][1]});
            i++;
        }
        while (!heap.isEmpty() && heap.peek()[1] <= x) heap.poll();
        int height = heap.isEmpty() ? 0 : heap.peek()[0];
        if (answer.isEmpty() || answer.get(answer.size() - 1).get(1) != height) answer.add(Arrays.asList(x, height));
    }
    return answer;
}`,
        javascript: `function getSkyline(buildings) {
  const edges = [...new Set(buildings.flatMap(([left, right]) => [left, right]))].sort((a, b) => a - b);
  const heap = [];
  function push(item) {
    let i = heap.length;
    heap.push(item);
    while (i > 0 && heap[(i - 1) >> 1][0] < item[0]) {
      heap[i] = heap[(i - 1) >> 1];
      i = (i - 1) >> 1;
    }
    heap[i] = item;
  }
  function pop() {
    const item = heap.pop();
    if (!heap.length) return;
    let i = 0;
    while (i * 2 + 1 < heap.length) {
      let child = i * 2 + 1;
      if (child + 1 < heap.length && heap[child + 1][0] > heap[child][0]) child++;
      if (heap[child][0] <= item[0]) break;
      heap[i] = heap[child];
      i = child;
    }
    heap[i] = item;
  }
  const answer = [];
  let i = 0;
  for (const x of edges) {
    while (i < buildings.length && buildings[i][0] <= x) {
      push([buildings[i][2], buildings[i][1]]);
      i++;
    }
    while (heap.length && heap[0][1] <= x) pop();
    const height = heap.length ? heap[0][0] : 0;
    if (!answer.length || answer[answer.length - 1][1] !== height) answer.push([x, height]);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['建築覆蓋 `[left,right)`；到 right 就已不覆蓋。', '同一 x 的事件都處理完再輸出，才不會出現同座標多個轉折。', '只在高度變化時加點。'],
  check: { kind: 'fn', fn: 'getSkyline', cases: [
    { args: [B], out: OUT }, { args: [[[0, 2, 3], [2, 5, 3]]], out: [[0, 3], [5, 0]] },
    { args: [[[1, 2, 1]]], out: [[1, 1], [2, 0]] },
  ] },
}

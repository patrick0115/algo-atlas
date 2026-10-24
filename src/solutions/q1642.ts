import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1642. Furthest Building You Can Reach
const H = [4, 2, 7, 6, 9, 14, 12]
const F = [
  { note: '4→2 是下降，不花資源；2→7 上升 5。先把 5 放進需要攀爬的集合。', views: [arr([5], { label: '上升量' })] },
  { note: '7→6 不花資源；6→9 又上升 3。把較大的 5 留給唯一的梯子，較小的 3 用磚頭。', views: [arr([3, 5], { label: '上升量', highlight: [0] })] },
  { note: '已花 3 塊磚；9→14 上升 5，把兩次 5 留給磚或梯子之一，至少需要再付 5 塊磚。', views: [arr([3, 5, 5], { label: '上升量', highlight: [1, 2] })] },
  { note: '總磚量只有 5，付不起第二次 5；最遠停在索引 4 的高度 9。', views: [arr(H, { label: 'heights', done: [0, 1, 2, 3, 4], dim: [5, 6] })] },
]
const G = [
  { note: '先把每次上升都暫時交給梯子；下降不花資源。', views: [arr(H, { label: 'heights' })] },
  { note: '2→7 上升 5，最小堆是 [5]；一把梯子足夠。', views: [arr([5], { label: '梯子候選', highlight: [0] })] },
  { note: '6→9 上升 3，堆變 [3,5]；梯子只夠一段，就拿出最小的 3 改用磚頭。', views: [arr([3, 5], { label: '候選上升', highlight: [0] })] },
  { note: '9→14 上升 5，再拿出最小的 5 要用磚頭；已用 3+5>5，所以到不了索引 5。', views: [arr(H, { label: '最遠到索引 4', done: [4], dim: [5, 6] })] },
]

export const q1642: Solution = {
  id: 1642,
  plain: '沿著一排建築往前走；上坡要花磚或一把梯子。把梯子留給最陡的上坡，才能走最遠。',
  statement: '從建築 0 開始往右。若下一棟較高，能花高度差那麼多磚，或用一把梯子；下降免費。給定磚與梯子數，求最遠可到達的建築索引。',
  examples: [{ input: 'heights = [4,2,7,6,9,14,12], bricks = 5, ladders = 1', output: '4' }, { input: 'heights = [4,12,2,7,3,18,20,3,19], bricks = 10, ladders = 2', output: '7' }],
  constraints: ['1 ≤ 建築數 ≤ 10⁵；磚頭數可很大，累計時小心整數範圍。'],
  insight: ['走過的上坡中，梯子應該分配給最高的幾段；較矮的段用磚。', '可用 [[p:heap]] 隨時找出目前最小的梯子候選上坡。'],
  approaches: [
    {
      name: '逐棟重排已走過的上坡',
      idea: '每到下一棟，重算先前所有上坡的最佳資源配置。',
      steps: ['收集走過的所有正高度差。', '把高度差由小到大排；最大的 ladders 段給梯子。', '其餘加總若超過 bricks，就停在前一棟。'],
      figure: { title: 'heights = [4,2,7,6,9,14,12], bricks = 5, ladders = 1', steps: F },
      complexity: { time: 'O(n² log n)', space: 'O(n)', why: '每棟都重新排序最多 n 個上坡。' },
      verdict: '容易看懂資源配置，但大量建築時應換成最小堆。',
      code: {
        python: `def furthestBuilding(heights, bricks, ladders):
    climbs = []
    for i in range(len(heights) - 1):
        rise = heights[i + 1] - heights[i]
        if rise > 0:
            climbs.append(rise)
        ordered = sorted(climbs)
        cost = sum(ordered[:max(0, len(ordered) - ladders)])  # 梯子給最大上坡
        if cost > bricks:
            return i
    return len(heights) - 1`,
        c: `static int cmpRise(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return x < y ? -1 : x > y;
}

int furthestBuilding(int *heights, int heightsSize, int bricks, int ladders) {
    int *climbs = malloc(heightsSize * sizeof(int));
    int count = 0;
    for (int i = 0; i + 1 < heightsSize; i++) {
        int rise = heights[i + 1] - heights[i];
        if (rise > 0) climbs[count++] = rise;
        qsort(climbs, count, sizeof(int), cmpRise);
        long long cost = 0;
        for (int j = 0; j < count - ladders; j++) cost += climbs[j];
        if (cost > bricks) {
            free(climbs);
            return i;
        }
    }
    free(climbs);
    return heightsSize - 1;
}`,
        cpp: `int furthestBuilding(vector<int>& heights, int bricks, int ladders) {
    vector<int> climbs;
    for (int i = 0; i + 1 < (int)heights.size(); i++) {
        int rise = heights[i + 1] - heights[i];
        if (rise > 0) climbs.push_back(rise);
        sort(climbs.begin(), climbs.end());
        long long cost = 0;
        for (int j = 0; j < (int)climbs.size() - ladders; j++) cost += climbs[j];
        if (cost > bricks) return i;
    }
    return heights.size() - 1;
}`,
        java: `int furthestBuilding(int[] heights, int bricks, int ladders) {
    ArrayList<Integer> climbs = new ArrayList<>();
    for (int i = 0; i + 1 < heights.length; i++) {
        int rise = heights[i + 1] - heights[i];
        if (rise > 0) climbs.add(rise);
        Collections.sort(climbs);
        long cost = 0;
        for (int j = 0; j < climbs.size() - ladders; j++) cost += climbs.get(j);
        if (cost > bricks) return i;
    }
    return heights.length - 1;
}`,
        javascript: `function furthestBuilding(heights, bricks, ladders) {
  const climbs = [];
  for (let i = 0; i + 1 < heights.length; i++) {
    const rise = heights[i + 1] - heights[i];
    if (rise > 0) climbs.push(rise);
    climbs.sort((a, b) => a - b);
    let cost = 0;
    for (let j = 0; j < climbs.length - ladders; j++) cost += climbs[j];
    if (cost > bricks) return i;
  }
  return heights.length - 1;
}`,
      },
    },
    {
      name: '最小堆保留梯子候選',
      idea: '每個上坡先放進最小堆；候選多於梯子數，就把最矮的一段改用磚。',
      steps: ['掃相鄰高度差，忽略不大於 0 的差。', '正高度差放入最小堆。', '堆大小超過 ladders 時彈出最小值並扣磚。', '磚不足時回傳目前建築索引。'],
      figure: { title: 'heights = [4,2,7,6,9,14,12], bricks = 5, ladders = 1', steps: G },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '每個上坡最多進出堆各一次。' },
      verdict: '能通過大資料；只有正高度差要放入堆。',
      code: {
        python: `import heapq

def furthestBuilding(heights, bricks, ladders):
    heap = []
    for i in range(len(heights) - 1):
        rise = heights[i + 1] - heights[i]
        if rise <= 0:
            continue
        heapq.heappush(heap, rise)      # 先假設這段用梯子
        if len(heap) > ladders:
            bricks -= heapq.heappop(heap)  # 最小上坡改用磚
        if bricks < 0:
            return i
    return len(heights) - 1`,
        c: `static void pushRise(int *heap, int *size, int x) {
    int i = (*size)++;
    while (i > 0 && heap[(i - 1) / 2] > x) {
        heap[i] = heap[(i - 1) / 2];
        i = (i - 1) / 2;
    }
    heap[i] = x;
}

static int popRise(int *heap, int *size) {
    int result = heap[0];
    int x = heap[--(*size)], i = 0;
    while (i * 2 + 1 < *size) {
        int child = i * 2 + 1;
        if (child + 1 < *size && heap[child + 1] < heap[child]) child++;
        if (heap[child] >= x) break;
        heap[i] = heap[child];
        i = child;
    }
    if (*size) heap[i] = x;
    return result;
}

int furthestBuilding(int *heights, int heightsSize, int bricks, int ladders) {
    int *heap = malloc(heightsSize * sizeof(int));
    int size = 0;
    for (int i = 0; i + 1 < heightsSize; i++) {
        int rise = heights[i + 1] - heights[i];
        if (rise <= 0) continue;
        pushRise(heap, &size, rise);
        if (size > ladders) bricks -= popRise(heap, &size);
        if (bricks < 0) {
            free(heap);
            return i;
        }
    }
    free(heap);
    return heightsSize - 1;
}`,
        cpp: `int furthestBuilding(vector<int>& heights, int bricks, int ladders) {
    priority_queue<int, vector<int>, greater<int>> heap;
    for (int i = 0; i + 1 < (int)heights.size(); i++) {
        int rise = heights[i + 1] - heights[i];
        if (rise <= 0) continue;
        heap.push(rise);
        if ((int)heap.size() > ladders) {
            bricks -= heap.top();
            heap.pop();
        }
        if (bricks < 0) return i;
    }
    return heights.size() - 1;
}`,
        java: `int furthestBuilding(int[] heights, int bricks, int ladders) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int i = 0; i + 1 < heights.length; i++) {
        int rise = heights[i + 1] - heights[i];
        if (rise <= 0) continue;
        heap.offer(rise);
        if (heap.size() > ladders) bricks -= heap.poll();
        if (bricks < 0) return i;
    }
    return heights.length - 1;
}`,
        javascript: `function furthestBuilding(heights, bricks, ladders) {
  const heap = [];
  function push(x) {
    let i = heap.length;
    heap.push(x);
    while (i > 0 && heap[(i - 1) >> 1] > x) {
      heap[i] = heap[(i - 1) >> 1];
      i = (i - 1) >> 1;
    }
    heap[i] = x;
  }
  function pop() {
    const result = heap[0];
    const x = heap.pop();
    if (heap.length) {
      let i = 0;
      while (i * 2 + 1 < heap.length) {
        let child = i * 2 + 1;
        if (child + 1 < heap.length && heap[child + 1] < heap[child]) child++;
        if (heap[child] >= x) break;
        heap[i] = heap[child];
        i = child;
      }
      heap[i] = x;
    }
    return result;
  }
  for (let i = 0; i + 1 < heights.length; i++) {
    const rise = heights[i + 1] - heights[i];
    if (rise <= 0) continue;
    push(rise);
    if (heap.length > ladders) bricks -= pop();
    if (bricks < 0) return i;
  }
  return heights.length - 1;
}`,
      },
    },
  ],
  pitfalls: ['磚不夠時，回傳尚未跨過該上坡的索引 i。', '梯子應留給較大的上坡，不能固定在第一次上坡使用。'],
  check: { kind: 'fn', fn: 'furthestBuilding', cases: [
    { args: [H, 5, 1], out: 4 }, { args: [[4, 12, 2, 7, 3, 18, 20, 3, 19], 10, 2], out: 7 },
    { args: [[14, 3, 19, 3], 17, 0], out: 3 }, { args: [[1], 0, 0], out: 0 },
  ] },
}

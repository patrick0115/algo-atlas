import { arr } from '../engine/helpers'
import type { Solution } from './types'

const A = [100, -23, -23, 404, 100, 23, 23, 23, 3, 404]

export const q1345: Solution = {
  id: 1345,
  plain: '在陣列中跳格子：可往左右一格，也可跳到相同數值的位置；求從頭到尾的最少跳數。',
  statement: '從索引 0 出發，每步可移到 i−1、i+1，或任一滿足 arr[j] = arr[i] 的其他索引。求抵達最後索引的最少步數。',
  examples: [{ input: 'arr = [100,-23,-23,404,100,23,23,23,3,404]', output: '3' }, { input: 'arr = [7]', output: '0' }],
  constraints: ['1 ≤ arr.length ≤ 5×10⁴；數值可能為負，且可能大量重複。'],
  insight: ['每種跳法成本都相同，可用 [[p:graph-traversal]] 的 BFS 找最短路。', '相同數值的索引若每次都重新列舉，會退化成平方時間；展開一次後要清除整組。'],
  approaches: [
    {
      name: 'BFS 與數值分組',
      idea: '先建立「數值 → 所有索引」；BFS 第一次遇到某值時展開整組，之後刪除該組。',
      steps: ['把相同數值的索引分組', '從索引 0 開始 BFS，記錄已造訪索引', '每次加入左右鄰居與同值組所有索引', '同值組展開後立刻清除；第一次抵達末尾就是答案'],
      figure: { title: 'arr = [100,-23,-23,404,100,23,23,23,3,404]', steps: [
        { note: '從索引 0 的 100 出發；一步可到相鄰的 1，或同值索引 4。', views: [arr(A, { label: 'arr', highlight: [0], compare: [1, 4] })] },
        { note: '先展開同值 100 的整組，之後清除，避免下次再掃索引 0、4。', views: [arr([1, 4], { label: '距離 1 的索引' })] },
        { note: '由索引 4 往左走到索引 3 的 404，共兩步。', views: [arr(A, { label: 'arr', highlight: [3, 4] })] },
        { note: '404 在末尾索引 9 再出現；同值跳過去，共三步。', views: [arr([0, 4, 3, 9], { label: '最短路徑索引', done: [0, 1, 2, 3] })] },
      ] },
      complexity: { time: 'O(n)，C 版 O(n log n)', space: 'O(n)', why: '每個同值組只展開一次；C 版先排序數值與索引。' },
      verdict: '最常用解法；刪除已展開的同值組是效率關鍵。',
      code: {
        python: `from collections import defaultdict, deque

def minJumps(arr):
    groups = defaultdict(list)
    for i, value in enumerate(arr):
        groups[value].append(i)
    queue = deque([(0, 0)])
    seen = {0}
    while queue:
        index, steps = queue.popleft()
        if index == len(arr) - 1:
            return steps
        neighbors = [index - 1, index + 1]
        neighbors.extend(groups.pop(arr[index], []))  # 同值組只展開一次
        for next_index in neighbors:
            if 0 <= next_index < len(arr) and next_index not in seen:
                seen.add(next_index)
                queue.append((next_index, steps + 1))
    return -1`,
        c: `typedef struct {
    int value;
    int index;
} JumpPair;

static int compareJump(const void *a, const void *b) {
    int x = ((const JumpPair *)a)->value;
    int y = ((const JumpPair *)b)->value;
    return (x > y) - (x < y);
}

static int firstJump(JumpPair *pairs, int n, int value) {
    int left = 0;
    int right = n;
    while (left < right) {
        int middle = left + (right - left) / 2;
        if (pairs[middle].value < value) {
            left = middle + 1;
        } else {
            right = middle;
        }
    }
    return left;
}

int minJumps(int *arr, int arrSize) {
    int n = arrSize;
    JumpPair *pairs = malloc(n * sizeof(JumpPair));
    for (int i = 0; i < n; i++) {
        pairs[i].value = arr[i];
        pairs[i].index = i;
    }
    qsort(pairs, n, sizeof(JumpPair), compareJump);
    bool *usedGroup = calloc(n, sizeof(bool));
    int *distance = malloc(n * sizeof(int));
    int *queue = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        distance[i] = -1;
    }
    int front = 0;
    int back = 0;
    queue[back++] = 0;
    distance[0] = 0;
    while (front < back) {
        int index = queue[front++];
        if (index == n - 1) {
            int answer = distance[index];
            free(pairs);
            free(usedGroup);
            free(distance);
            free(queue);
            return answer;
        }
        int neighbors[2] = {index - 1, index + 1};
        for (int t = 0; t < 2; t++) {
            int nextIndex = neighbors[t];
            if (nextIndex >= 0 && nextIndex < n && distance[nextIndex] < 0) {
                distance[nextIndex] = distance[index] + 1;
                queue[back++] = nextIndex;
            }
        }
        int start = firstJump(pairs, n, arr[index]);
        if (!usedGroup[start]) {
            usedGroup[start] = true;
            for (int t = start; t < n && pairs[t].value == arr[index]; t++) {
                int nextIndex = pairs[t].index;
                if (distance[nextIndex] < 0) {
                    distance[nextIndex] = distance[index] + 1;
                    queue[back++] = nextIndex;
                }
            }
        }
    }
    free(pairs);
    free(usedGroup);
    free(distance);
    free(queue);
    return -1;
}`,
        cpp: `int minJumps(vector<int>& arr) {
    unordered_map<int, vector<int>> groups;
    for (int i = 0; i < (int)arr.size(); i++) {
        groups[arr[i]].push_back(i);
    }
    vector<int> distance(arr.size(), -1);
    queue<int> pending;
    pending.push(0);
    distance[0] = 0;
    while (!pending.empty()) {
        int index = pending.front();
        pending.pop();
        if (index == (int)arr.size() - 1) {
            return distance[index];
        }
        vector<int> neighbors{index - 1, index + 1};
        auto found = groups.find(arr[index]);
        if (found != groups.end()) {
            neighbors.insert(neighbors.end(), found->second.begin(), found->second.end());
            groups.erase(found);
        }
        for (int nextIndex : neighbors) {
            if (nextIndex >= 0 && nextIndex < (int)arr.size() && distance[nextIndex] < 0) {
                distance[nextIndex] = distance[index] + 1;
                pending.push(nextIndex);
            }
        }
    }
    return -1;
}`,
        java: `int minJumps(int[] arr) {
    Map<Integer, List<Integer>> groups = new HashMap<>();
    for (int i = 0; i < arr.length; i++) {
        groups.computeIfAbsent(arr[i], key -> new ArrayList<>()).add(i);
    }
    int[] distance = new int[arr.length];
    Arrays.fill(distance, -1);
    Queue<Integer> pending = new ArrayDeque<>();
    pending.add(0);
    distance[0] = 0;
    while (!pending.isEmpty()) {
        int index = pending.remove();
        if (index == arr.length - 1) {
            return distance[index];
        }
        List<Integer> neighbors = new ArrayList<>();
        neighbors.add(index - 1);
        neighbors.add(index + 1);
        List<Integer> same = groups.remove(arr[index]);
        if (same != null) {
            neighbors.addAll(same);
        }
        for (int nextIndex : neighbors) {
            if (nextIndex >= 0 && nextIndex < arr.length && distance[nextIndex] < 0) {
                distance[nextIndex] = distance[index] + 1;
                pending.add(nextIndex);
            }
        }
    }
    return -1;
}`,
        javascript: `function minJumps(arr) {
  const groups = new Map();
  for (let i = 0; i < arr.length; i++) {
    if (!groups.has(arr[i])) {
      groups.set(arr[i], []);
    }
    groups.get(arr[i]).push(i);
  }
  const distance = new Array(arr.length).fill(-1);
  const queue = [0];
  distance[0] = 0;
  for (let front = 0; front < queue.length; front++) {
    const index = queue[front];
    if (index === arr.length - 1) {
      return distance[index];
    }
    const neighbors = [index - 1, index + 1];
    const same = groups.get(arr[index]);
    if (same) {
      for (const sameIndex of same) {
        neighbors.push(sameIndex);
      }
      groups.delete(arr[index]);
    }
    for (const nextIndex of neighbors) {
      if (nextIndex >= 0 && nextIndex < arr.length && distance[nextIndex] < 0) {
        distance[nextIndex] = distance[index] + 1;
        queue.push(nextIndex);
      }
    }
  }
  return -1;
}`,
      },
    },
    {
      name: '雙向 BFS',
      idea: '同時從首尾往中間找，每次擴展較小的一側；兩邊相遇時得到最短距離。',
      steps: ['建立同值索引分組', '首尾各建一個前緣與距離表', '每輪擴展較小的前緣，加入左右與同值鄰居', '若新鄰居已被另一側造訪，兩側距離相加'],
      figure: { title: '從索引 0 與 9 同時搜尋', steps: [
        { note: '左側從 0 出發，右側從 9 出發。', views: [arr(A, { label: '兩端起點', highlight: [0, 9] })] },
        { note: '左側一步可達 1、4；右側一步可達 8、3。', views: [arr([1, 4], { label: '左前緣' }), arr([8, 3], { label: '右前緣' })] },
        { note: '擴展左側的 4，它相鄰的 3 已被右側走到。', views: [arr(A, { label: '兩側相遇', highlight: [3, 4] })] },
        { note: '左側 0→4→3 走 2 步，右側 9→3 走 1 步，總共 3 步。', views: [arr([0, 4, 3, 9], { label: '最短路徑', done: [0, 1, 2, 3] })] },
      ] },
      complexity: { time: 'O(n)，C 版 O(n log n)', space: 'O(n)', why: '同值組只展開一次；C 版先排序數值與索引。' },
      verdict: '大圖的最短路搜尋常可縮小前緣；程式較複雜。',
      code: {
        python: `from collections import defaultdict

def minJumps(arr):
    if len(arr) == 1:
        return 0
    groups = defaultdict(list)
    for i, value in enumerate(arr):
        groups[value].append(i)
    front = {0}
    back = {len(arr) - 1}
    left_dist = {0: 0}
    right_dist = {len(arr) - 1: 0}
    while front and back:
        if len(front) > len(back):
            front, back = back, front
            left_dist, right_dist = right_dist, left_dist
        next_front = set()
        for index in front:
            neighbors = [index - 1, index + 1]
            neighbors.extend(groups.pop(arr[index], []))  # 同值組僅展開一次
            for next_index in neighbors:
                if not 0 <= next_index < len(arr):
                    continue
                if next_index in right_dist:
                    return left_dist[index] + 1 + right_dist[next_index]
                if next_index not in left_dist:
                    left_dist[next_index] = left_dist[index] + 1
                    next_front.add(next_index)
        front = next_front
    return -1`,
        c: `typedef struct {
    int value;
    int index;
} JumpPair;

static int compareJump(const void *a, const void *b) {
    int x = ((const JumpPair *)a)->value;
    int y = ((const JumpPair *)b)->value;
    return (x > y) - (x < y);
}

static int firstJump(JumpPair *pairs, int n, int value) {
    int left = 0;
    int right = n;
    while (left < right) {
        int middle = left + (right - left) / 2;
        if (pairs[middle].value < value) {
            left = middle + 1;
        } else {
            right = middle;
        }
    }
    return left;
}

int minJumps(int *arr, int arrSize) {
    int n = arrSize;
    if (n == 1) {
        return 0;
    }
    JumpPair *pairs = malloc(n * sizeof(JumpPair));
    for (int i = 0; i < n; i++) {
        pairs[i].value = arr[i];
        pairs[i].index = i;
    }
    qsort(pairs, n, sizeof(JumpPair), compareJump);
    bool *usedGroup = calloc(n, sizeof(bool));
    int *queue[2] = {malloc(n * sizeof(int)), malloc(n * sizeof(int))};
    int *distance[2] = {malloc(n * sizeof(int)), malloc(n * sizeof(int))};
    for (int i = 0; i < n; i++) {
        distance[0][i] = -1;
        distance[1][i] = -1;
    }
    int front[2] = {0, 0};
    int back[2] = {1, 1};
    queue[0][0] = 0;
    queue[1][0] = n - 1;
    distance[0][0] = 0;
    distance[1][n - 1] = 0;
    int answer = -1;
    while (front[0] < back[0] && front[1] < back[1] && answer < 0) {
        int side = back[0] - front[0] <= back[1] - front[1] ? 0 : 1;
        int other = 1 - side;
        int end = back[side];
        while (front[side] < end && answer < 0) {
            int index = queue[side][front[side]++];
            int neighbors[2] = {index - 1, index + 1};
            for (int t = 0; t < 2 && answer < 0; t++) {
                int nextIndex = neighbors[t];
                if (nextIndex < 0 || nextIndex >= n) {
                    continue;
                }
                if (distance[other][nextIndex] >= 0) {
                    answer = distance[side][index] + distance[other][nextIndex] + 1;
                } else if (distance[side][nextIndex] < 0) {
                    distance[side][nextIndex] = distance[side][index] + 1;
                    queue[side][back[side]++] = nextIndex;
                }
            }
            int start = firstJump(pairs, n, arr[index]);
            if (!usedGroup[start]) {
                usedGroup[start] = true;
                for (int t = start; t < n && pairs[t].value == arr[index] && answer < 0; t++) {
                    int nextIndex = pairs[t].index;
                    if (distance[other][nextIndex] >= 0) {
                        answer = distance[side][index] + distance[other][nextIndex] + 1;
                    } else if (distance[side][nextIndex] < 0) {
                        distance[side][nextIndex] = distance[side][index] + 1;
                        queue[side][back[side]++] = nextIndex;
                    }
                }
            }
        }
    }
    free(pairs);
    free(usedGroup);
    free(queue[0]);
    free(queue[1]);
    free(distance[0]);
    free(distance[1]);
    return answer;
}`,
        cpp: `int minJumps(vector<int>& arr) {
    int n = arr.size();
    if (n == 1) {
        return 0;
    }
    unordered_map<int, vector<int>> groups;
    for (int i = 0; i < n; i++) {
        groups[arr[i]].push_back(i);
    }
    vector<int> distance[2] = {vector<int>(n, -1), vector<int>(n, -1)};
    vector<int> frontier[2] = {{0}, {n - 1}};
    distance[0][0] = 0;
    distance[1][n - 1] = 0;
    while (!frontier[0].empty() && !frontier[1].empty()) {
        int side = frontier[0].size() <= frontier[1].size() ? 0 : 1;
        int other = 1 - side;
        vector<int> nextFrontier;
        for (int index : frontier[side]) {
            vector<int> neighbors{index - 1, index + 1};
            auto found = groups.find(arr[index]);
            if (found != groups.end()) {
                neighbors.insert(neighbors.end(), found->second.begin(), found->second.end());
                groups.erase(found);
            }
            for (int nextIndex : neighbors) {
                if (nextIndex < 0 || nextIndex >= n) {
                    continue;
                }
                if (distance[other][nextIndex] >= 0) {
                    return distance[side][index] + distance[other][nextIndex] + 1;
                }
                if (distance[side][nextIndex] < 0) {
                    distance[side][nextIndex] = distance[side][index] + 1;
                    nextFrontier.push_back(nextIndex);
                }
            }
        }
        frontier[side] = move(nextFrontier);
    }
    return -1;
}`,
        java: `int minJumps(int[] arr) {
    int n = arr.length;
    if (n == 1) {
        return 0;
    }
    Map<Integer, List<Integer>> groups = new HashMap<>();
    for (int i = 0; i < n; i++) {
        groups.computeIfAbsent(arr[i], key -> new ArrayList<>()).add(i);
    }
    int[][] distance = new int[2][n];
    Arrays.fill(distance[0], -1);
    Arrays.fill(distance[1], -1);
    List<Integer>[] frontier = new List[]{new ArrayList<>(), new ArrayList<>()};
    frontier[0].add(0);
    frontier[1].add(n - 1);
    distance[0][0] = 0;
    distance[1][n - 1] = 0;
    while (!frontier[0].isEmpty() && !frontier[1].isEmpty()) {
        int side = frontier[0].size() <= frontier[1].size() ? 0 : 1;
        int other = 1 - side;
        List<Integer> nextFrontier = new ArrayList<>();
        for (int index : frontier[side]) {
            List<Integer> neighbors = new ArrayList<>();
            neighbors.add(index - 1);
            neighbors.add(index + 1);
            List<Integer> same = groups.remove(arr[index]);
            if (same != null) {
                neighbors.addAll(same);
            }
            for (int nextIndex : neighbors) {
                if (nextIndex < 0 || nextIndex >= n) {
                    continue;
                }
                if (distance[other][nextIndex] >= 0) {
                    return distance[side][index] + distance[other][nextIndex] + 1;
                }
                if (distance[side][nextIndex] < 0) {
                    distance[side][nextIndex] = distance[side][index] + 1;
                    nextFrontier.add(nextIndex);
                }
            }
        }
        frontier[side] = nextFrontier;
    }
    return -1;
}`,
        javascript: `function minJumps(arr) {
  const n = arr.length;
  if (n === 1) {
    return 0;
  }
  const groups = new Map();
  for (let i = 0; i < n; i++) {
    if (!groups.has(arr[i])) {
      groups.set(arr[i], []);
    }
    groups.get(arr[i]).push(i);
  }
  const distance = [new Array(n).fill(-1), new Array(n).fill(-1)];
  const frontier = [[0], [n - 1]];
  distance[0][0] = 0;
  distance[1][n - 1] = 0;
  while (frontier[0].length && frontier[1].length) {
    const side = frontier[0].length <= frontier[1].length ? 0 : 1;
    const other = 1 - side;
    const nextFrontier = [];
    for (const index of frontier[side]) {
      const neighbors = [index - 1, index + 1];
      const same = groups.get(arr[index]);
      if (same) {
        for (const sameIndex of same) {
          neighbors.push(sameIndex);
        }
        groups.delete(arr[index]);
      }
      for (const nextIndex of neighbors) {
        if (nextIndex < 0 || nextIndex >= n) {
          continue;
        }
        if (distance[other][nextIndex] >= 0) {
          return distance[side][index] + distance[other][nextIndex] + 1;
        }
        if (distance[side][nextIndex] < 0) {
          distance[side][nextIndex] = distance[side][index] + 1;
          nextFrontier.push(nextIndex);
        }
      }
    }
    frontier[side] = nextFrontier;
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: ['同值組要展開後立即移除，不然大量重複值會反覆掃描。', '長度為 1 時，起點已經是終點，答案為 0。'],
  check: { kind: 'fn', fn: 'minJumps', cases: [
    { args: [A], out: 3 },
    { args: [[7]], out: 0 },
    { args: [[7, 6, 9, 6, 9, 6, 9, 7]], out: 1 },
    { args: [[1, 2, 3]], out: 2 },
  ] },
}

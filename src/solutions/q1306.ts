import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [4, 2, 3, 0, 3, 1, 2]

function dfsFig(): FigStep[] {
  return [
    { note: '從索引 5 出發，值是 1，所以可往左到 4 或往右到 6。先試索引 4。', views: [arr(A, { label: '索引 5 起步', highlight: [5], compare: [4, 6] })] },
    { note: '索引 4 的值是 3，往左跳到索引 1；索引 5 和 4 已標記為走過。', views: [arr(A, { label: '走到索引 1', done: [5, 4], highlight: [1] })] },
    { note: '索引 1 的值是 2，可往右到索引 3。', views: [arr(A, { label: '下一站索引 3', done: [5, 4, 1], highlight: [3] })] },
    { note: '索引 3 的值為 0，找到目標；一路回傳 true。', views: [arr(A, { label: '找到 0', done: [5, 4, 1, 3] })] },
  ]
}

function bfsFig(): FigStep[] {
  return [
    { note: '廣度優先搜尋先把起點索引 5 放入佇列。', views: [arr(A, { label: '起點', highlight: [5] }), arr([5], { label: '佇列' })] },
    { note: '取出 5，它的值是 1，將索引 4、6 放入佇列。', views: [arr(A, { label: '可抵達的位置', highlight: [4, 6], done: [5] }), arr([4, 6], { label: '佇列' })] },
    { note: '取出 4 可加入索引 1；取出 6 可加入索引 2。兩個方向都會被探索。', views: [arr(A, { label: '下一層', highlight: [1, 2], done: [4, 5, 6] }), arr([1, 2], { label: '佇列' })] },
    { note: '之後從索引 1 跳到索引 3，其值為 0，回傳 true。', views: [arr(A, { label: '找到 0', done: [3] })] },
  ]
}

export const q1306: Solution = {
  id: 1306,
  plain: '站在陣列的一格，格子上的數字決定你能向左或向右跳多遠；問能否跳到數字 0。',
  statement: '給非負整數陣列 arr 與起點 start。站在索引 i 時，可跳到 i + arr[i] 或 i − arr[i]，但不能越界。判斷能否抵達值為 0 的位置。',
  examples: [
    { input: 'arr = [4,2,3,0,3,1,2], start = 5', output: 'true' },
    { input: 'arr = [3,0,2,1,2], start = 2', output: 'false' },
  ],
  constraints: ['1 ≤ arr.length ≤ 5 × 10⁴；0 ≤ arr[i] < arr.length。'],
  insight: ['把每個索引看成圖上的節點，從 i 指向合法的 i ± arr[i]。', '可能跳回同一位置，因此一定要標記已走過的位置，避免無限循環。'],
  approaches: [
    {
      name: '深度優先搜尋',
      idea: '沿著一條可跳路線走到底；走不通再返回嘗試另一邊。',
      steps: ['建立 visited 陣列。', '從 start 出發：越界或已走過就回傳 false。', '遇到 0 回傳 true，否則標記已走過並嘗試左右兩站。'],
      figure: { title: 'arr = [4,2,3,0,3,1,2]，start = 5', steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個索引最多處理一次；標記與遞迴堆疊最多各有 n 個元素。' },
      verdict: '概念直接；很長的單一路徑可能使遞迴堆疊較深。',
      code: {
        python: `def canReach(arr, start):
    seen = [False] * len(arr)

    def search(index):
        if index < 0 or index >= len(arr) or seen[index]:
            return False
        if arr[index] == 0:
            return True                  # 抵達目標
        seen[index] = True               # 先標記，避免繞圈
        jump = arr[index]
        return search(index - jump) or search(index + jump)

    return search(start)`,
        c: `static bool searchReach(int *arr, int n, int index, bool *seen) {
    if (index < 0 || index >= n || seen[index]) {
        return false;
    }
    if (arr[index] == 0) {
        return true;
    }
    seen[index] = true;
    int jump = arr[index];
    return searchReach(arr, n, index - jump, seen) ||
           searchReach(arr, n, index + jump, seen);
}

bool canReach(int *arr, int arrSize, int start) {
    bool *seen = calloc(arrSize, sizeof(bool));
    bool result = searchReach(arr, arrSize, start, seen);
    free(seen);
    return result;
}`,
        cpp: `bool canReach(vector<int>& arr, int start) {
    vector<bool> seen(arr.size(), false);
    function<bool(int)> search = [&](int index) {
        if (index < 0 || index >= (int)arr.size() || seen[index]) {
            return false;
        }
        if (arr[index] == 0) {
            return true;
        }
        seen[index] = true;
        int jump = arr[index];
        return search(index - jump) || search(index + jump);
    };
    return search(start);
}`,
        java: `boolean search(int[] arr, int index, boolean[] seen) {
    if (index < 0 || index >= arr.length || seen[index]) {
        return false;
    }
    if (arr[index] == 0) {
        return true;
    }
    seen[index] = true;
    int jump = arr[index];
    return search(arr, index - jump, seen) || search(arr, index + jump, seen);
}

boolean canReach(int[] arr, int start) {
    boolean[] seen = new boolean[arr.length];
    return search(arr, start, seen);
}`,
        javascript: `function canReach(arr, start) {
  const seen = new Array(arr.length).fill(false);
  function search(index) {
    if (index < 0 || index >= arr.length || seen[index]) {
      return false;
    }
    if (arr[index] === 0) {
      return true;
    }
    seen[index] = true;
    const jump = arr[index];
    return search(index - jump) || search(index + jump);
  }
  return search(start);
}`,
      },
    },
    {
      name: '廣度優先搜尋',
      idea: '把目前能到的位置排進佇列，一層一層探索，直到遇到 0。',
      steps: ['起點入列並標記。', '每次取出一個索引；若值為 0 就回傳 true。', '將兩個合法且尚未走過的下一站入列；佇列清空則回傳 false。'],
      figure: { title: '從索引 5 逐層探索', steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個索引最多入列一次。' },
      verdict: '沒有深遞迴風險，也能看出先近後遠的探索順序。',
      code: {
        python: `from collections import deque

def canReach(arr, start):
    queue = deque([start])
    seen = {start}
    while queue:
        index = queue.popleft()
        if arr[index] == 0:
            return True                 # 找到 0 就結束
        for next_index in (index - arr[index], index + arr[index]):
            if 0 <= next_index < len(arr) and next_index not in seen:
                seen.add(next_index)   # 入列時標記，避免重複
                queue.append(next_index)
    return False`,
        c: `bool canReach(int *arr, int arrSize, int start) {
    int *queue = malloc(arrSize * sizeof(int));
    bool *seen = calloc(arrSize, sizeof(bool));
    int front = 0, back = 0;
    queue[back++] = start;
    seen[start] = true;
    while (front < back) {
        int index = queue[front++];
        if (arr[index] == 0) {
            free(queue);
            free(seen);
            return true;
        }
        int next[2] = {index - arr[index], index + arr[index]};
        for (int k = 0; k < 2; k++) {
            int position = next[k];
            if (position >= 0 && position < arrSize && !seen[position]) {
                seen[position] = true;
                queue[back++] = position;
            }
        }
    }
    free(queue);
    free(seen);
    return false;
}`,
        cpp: `bool canReach(vector<int>& arr, int start) {
    queue<int> pending;
    vector<bool> seen(arr.size(), false);
    pending.push(start);
    seen[start] = true;
    while (!pending.empty()) {
        int index = pending.front();
        pending.pop();
        if (arr[index] == 0) {
            return true;
        }
        for (int position : {index - arr[index], index + arr[index]}) {
            if (position >= 0 && position < (int)arr.size() && !seen[position]) {
                seen[position] = true;
                pending.push(position);
            }
        }
    }
    return false;
}`,
        java: `boolean canReach(int[] arr, int start) {
    Queue<Integer> pending = new ArrayDeque<>();
    boolean[] seen = new boolean[arr.length];
    pending.offer(start);
    seen[start] = true;
    while (!pending.isEmpty()) {
        int index = pending.poll();
        if (arr[index] == 0) {
            return true;
        }
        int[] next = {index - arr[index], index + arr[index]};
        for (int position : next) {
            if (position >= 0 && position < arr.length && !seen[position]) {
                seen[position] = true;
                pending.offer(position);
            }
        }
    }
    return false;
}`,
        javascript: `function canReach(arr, start) {
  const queue = [start];
  const seen = new Set([start]);
  for (let front = 0; front < queue.length; front++) {
    const index = queue[front];
    if (arr[index] === 0) {
      return true;
    }
    for (const position of [index - arr[index], index + arr[index]]) {
      if (position >= 0 && position < arr.length && !seen.has(position)) {
        seen.add(position);
        queue.push(position);
      }
    }
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: ['索引不能越界。', '入列或進入遞迴後要立即標記，否則兩個位置可能互相跳來跳去。'],
  check: {
    kind: 'fn',
    fn: 'canReach',
    cases: [
      { args: [A, 5], out: true },
      { args: [[4, 2, 3, 0, 3, 1, 2], 0], out: true },
      { args: [[3, 0, 2, 1, 2], 2], out: false },
      { args: [[0], 0], out: true },
    ],
  },
}

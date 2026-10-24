import { arr } from '../engine/helpers'
import { graphView } from './fig'
import type { Solution } from './types'

const EDGES = [[0, 1], [1, 2], [2, 3]]

export const q0841: Solution = {
  id: 841,
  plain: '一開始只能進 0 號房；每個房間裡的鑰匙能開其他房。判斷能否走進所有房間。',
  statement: 'rooms[i] 列出第 i 號房內的鑰匙編號。從 0 號房出發，回傳是否能到達所有房間。',
  examples: [{ input: 'rooms = [[1],[2],[3],[]]', output: 'true' }, { input: 'rooms = [[1,3],[3,0,1],[2],[0]]', output: 'false' }],
  constraints: ['房間數最多 1000；重複拿到鑰匙不代表要重訪房間。'],
  insight: ['房間是節點，鑰匙是可走的有向邊。', '從 0 號房做 [[p:graph-traversal]]，數走到的房間是否等於總數。', '已拜訪標記避免循環鑰匙讓搜尋沒完沒了。'],
  approaches: [
    {
      name: '堆疊深度優先',
      idea: '拿到鑰匙就把尚未走過的房間推入堆疊。',
      steps: ['標記 0 並推入堆疊', '取出房間，查看其中的每把鑰匙', '未拜訪過就標記並推入', '最後比較拜訪數與房間數'],
      figure: { title: 'rooms = [[1],[2],[3],[]]', steps: [
        { note: '從 0 號房開始，拿到 1 號鑰匙。', views: [graphView(4, EDGES, { directed: true, cls: { 0: 'done', 1: 'hl' } }), arr([0, 1], { label: '已發現' })] },
        { note: '進 1 號房，拿到 2 號鑰匙。', views: [graphView(4, EDGES, { directed: true, cls: { 0: 'done', 1: 'done', 2: 'hl' } }), arr([0, 1, 2], { label: '已發現' })] },
        { note: '進 2 號房，拿到 3 號鑰匙。', views: [graphView(4, EDGES, { directed: true, cls: { 2: 'done', 3: 'hl' } }), arr([0, 1, 2, 3], { label: '已發現' })] },
        { note: '3 號房沒有新鑰匙，但四間都已到達，回傳 true。', views: [graphView(4, EDGES, { directed: true, cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' } }), arr([4], { label: '拜訪數', done: [0] })] },
      ] },
      complexity: { time: 'O(V+E)', space: 'O(V)', why: '每間房最多入棧一次，每把鑰匙檢查一次。' },
      verdict: '簡單有效，適合只問可達性的題目。',
      code: {
        python: `def canVisitAllRooms(rooms):
    seen = {0}
    stack = [0]
    while stack:
        room = stack.pop()
        for key in rooms[room]:
            if key not in seen:
                seen.add(key)  # 入棧前就標記，避免重複
                stack.append(key)
    return len(seen) == len(rooms)`,
        c: `bool canVisitAllRooms(int **rooms, int roomsSize, int *roomsColSize) {
    bool *seen = calloc(roomsSize, sizeof(bool));
    int *stack = malloc(roomsSize * sizeof(int));
    int top = 0, count = 1;
    seen[0] = true;
    stack[top++] = 0;
    while (top) {
        int room = stack[--top];
        for (int i = 0; i < roomsColSize[room]; i++) {
            int key = rooms[room][i];
            if (!seen[key]) {
                seen[key] = true;
                count++;
                stack[top++] = key;
            }
        }
    }
    free(seen);
    free(stack);
    return count == roomsSize;
}`,
        cpp: `bool canVisitAllRooms(vector<vector<int>>& rooms) {
    vector<bool> seen(rooms.size());
    vector<int> stack{0};
    seen[0] = true;
    int count = 1;
    while (!stack.empty()) {
        int room = stack.back();
        stack.pop_back();
        for (int key : rooms[room]) {
            if (!seen[key]) {
                seen[key] = true;
                count++;
                stack.push_back(key);
            }
        }
    }
    return count == (int)rooms.size();
}`,
        java: `boolean canVisitAllRooms(int[][] rooms) {
    boolean[] seen = new boolean[rooms.length];
    Deque<Integer> stack = new ArrayDeque<>();
    seen[0] = true;
    stack.push(0);
    int count = 1;
    while (!stack.isEmpty()) {
        int room = stack.pop();
        for (int key : rooms[room]) {
            if (!seen[key]) {
                seen[key] = true;
                count++;
                stack.push(key);
            }
        }
    }
    return count == rooms.length;
}`,
        javascript: `function canVisitAllRooms(rooms) {
  const seen = new Set([0]);
  const stack = [0];
  while (stack.length) {
    const room = stack.pop();
    for (const key of rooms[room]) {
      if (!seen.has(key)) {
        seen.add(key);
        stack.push(key);
      }
    }
  }
  return seen.size === rooms.length;
}`,
      },
    },
    {
      name: '佇列廣度優先',
      idea: '把新找到的房間放到佇列尾端，逐層擴展可進入的房間。',
      steps: ['佇列從 0 號房開始', '依序取出房間', '尚未發現的鑰匙指向房間就標記並入列', '計數是否等於總房間數'],
      figure: { title: 'rooms = [[1],[2],[3],[]]', steps: [
        { note: '佇列先放 0 號房。', views: [graphView(4, EDGES, { directed: true, cls: { 0: 'hl' } }), arr([0], { label: '佇列' })] },
        { note: '取出 0，發現 1，佇列換成 [1]。', views: [graphView(4, EDGES, { directed: true, cls: { 0: 'done', 1: 'hl' } }), arr([1], { label: '佇列' })] },
        { note: '取出 1，發現 2；取出 2，又發現 3。', views: [graphView(4, EDGES, { directed: true, cls: { 2: 'done', 3: 'hl' } }), arr([3], { label: '佇列' })] },
        { note: '取出 3 後沒有更多房間；四間都到達，結果為 true。', views: [graphView(4, EDGES, { directed: true, cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' } }), arr([4], { label: '拜訪數', done: [0] })] },
      ] },
      complexity: { time: 'O(V+E)', space: 'O(V)', why: '每間房入列一次，每把鑰匙查看一次。' },
      verdict: '同樣正確，與 DFS 差別只在探索順序。',
      code: {
        python: `from collections import deque

def canVisitAllRooms(rooms):
    seen = {0}
    q = deque([0])
    while q:
        room = q.popleft()
        for key in rooms[room]:
            if key not in seen:
                seen.add(key)  # 入列時標記
                q.append(key)
    return len(seen) == len(rooms)`,
        c: `bool canVisitAllRooms(int **rooms, int roomsSize, int *roomsColSize) {
    bool *seen = calloc(roomsSize, sizeof(bool));
    int *q = malloc(roomsSize * sizeof(int));
    int head = 0, tail = 0;
    seen[0] = true;
    q[tail++] = 0;
    while (head < tail) {
        int room = q[head++];
        for (int i = 0; i < roomsColSize[room]; i++) {
            int key = rooms[room][i];
            if (!seen[key]) {
                seen[key] = true;
                q[tail++] = key;
            }
        }
    }
    free(seen);
    free(q);
    return tail == roomsSize;
}`,
        cpp: `bool canVisitAllRooms(vector<vector<int>>& rooms) {
    vector<bool> seen(rooms.size());
    queue<int> q;
    seen[0] = true;
    q.push(0);
    int count = 1;
    while (!q.empty()) {
        int room = q.front();
        q.pop();
        for (int key : rooms[room]) {
            if (!seen[key]) {
                seen[key] = true;
                count++;
                q.push(key);
            }
        }
    }
    return count == (int)rooms.size();
}`,
        java: `boolean canVisitAllRooms(int[][] rooms) {
    boolean[] seen = new boolean[rooms.length];
    Queue<Integer> q = new ArrayDeque<>();
    seen[0] = true;
    q.offer(0);
    int count = 1;
    while (!q.isEmpty()) {
        int room = q.poll();
        for (int key : rooms[room]) {
            if (!seen[key]) {
                seen[key] = true;
                count++;
                q.offer(key);
            }
        }
    }
    return count == rooms.length;
}`,
        javascript: `function canVisitAllRooms(rooms) {
  const seen = new Set([0]);
  const q = [0];
  for (let head = 0; head < q.length; head++) {
    for (const key of rooms[q[head]]) {
      if (!seen.has(key)) {
        seen.add(key);
        q.push(key);
      }
    }
  }
  return seen.size === rooms.length;
}`,
      },
    },
  ],
  pitfalls: ['鑰匙可以形成環，若不記錄已拜訪房間會重複探索。', '房間 0 一開始就可以進，應先標記。'],
  check: { kind: 'fn', fn: 'canVisitAllRooms', cases: [
    { args: [[[1], [2], [3], []]], out: true },
    { args: [[[1, 3], [3, 0, 1], [2], [0]]], out: false },
    { args: [[[]]], out: true },
  ] },
}

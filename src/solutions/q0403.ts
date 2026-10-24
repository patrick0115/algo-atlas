import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 403. Frog Jump
const P = [0, 1, 3, 5, 6, 8, 12, 17]

export const q0403: Solution = {
  id: 403,
  plain: '青蛙站在第一塊石頭上。若上一跳跨了 k 個單位，下一跳只能跨 k−1、k、k+1；問能否跳到最後一塊。',
  statement: '石頭位置 stones 遞增且第一塊在 0。青蛙第一跳必須為 1，之後每跳距離只能比上一跳少一、相同或多一，且必須為正。判斷能否抵達最後一塊。',
  examples: [
    { input: 'stones = [0,1,3,5,6,8,12,17]', output: 'true' },
    { input: 'stones = [0,1,2,3,4,8,9,11]', output: 'false' },
  ],
  constraints: ['2 ≤ stones.length ≤ 2000；石頭位置嚴格遞增。'],
  insight: ['只記石頭位置不夠；抵達同一石頭的上一跳長度不同，後續選擇也不同。', '狀態應是「目前石頭索引、上一跳長度」，可從起點遞迴記憶，也可從左到右傳播可達跳長。'],
  approaches: [
    {
      name: '記憶化搜尋',
      idea: 'dfs(i,k) 問站在第 i 塊石頭、上一步跳 k 時能否抵達終點；已問過的狀態直接取快取。',
      steps: ['從 dfs(0,0) 開始。', '試 k−1、k、k+1 中大於 0 的距離。', '用位置查找是否有對應石頭，再遞迴。', '任一路徑到終點就回傳 true，並記錄各狀態結果。'],
      figure: { title: 'stones = [0,1,3,5,6,8,12,17]', steps: [
        { note: '從 0 出發，上一跳視為 0；唯一正距離是 1，抵達石頭 1。', views: [arr(P, { highlight: [0, 1], dim: [2, 3, 4, 5, 6, 7] })] },
        { note: '上一跳是 1，試 1 或 2；距離 2 讓青蛙從 1 抵達 3。', views: [arr(P, { done: [0, 1], highlight: [2] })] },
        { note: '從 3 跳 2 到 5，再跳 3 到 8；每步都不超過上一跳差 1。', views: [arr(P, { done: [0, 1, 2, 3], highlight: [5] })] },
        { note: '接著跳 4 到 12，跳 5 到 17，成功抵達終點。', views: [arr(P, { done: [0, 1, 2, 3, 5, 6], highlight: [7], dim: [4] })] },
      ] },
      complexity: { time: 'O(n² log n)', space: 'O(n²)', why: '最多 n² 種位置與上一跳組合；每次以二分搜尋找石頭。' },
      verdict: '與青蛙的選擇順序一致；快取可避免反覆搜尋同一狀態。',
      code: {
        python: `from functools import lru_cache
import sys

def canCross(stones):
    sys.setrecursionlimit(10000)
    position = {x: i for i, x in enumerate(stones)}

    @lru_cache(None)
    def dfs(i, jump):
        if i == len(stones) - 1:
            return True
        for step in (jump - 1, jump, jump + 1):
            if step > 0 and stones[i] + step in position:
                if dfs(position[stones[i] + step], step):  # 狀態含上一跳距離
                    return True
        return False

    return dfs(0, 0)`,
        c: `static int locate(int *stones, int n, long long target) {
    int lo = 0;
    int hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (stones[mid] == target) {
            return mid;
        }
        if (stones[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return -1;
}

static bool dfs(int i, int jump, int *stones, int n, signed char *memo) {
    if (i == n - 1) {
        return true;
    }
    int at = i * (n + 1) + jump;
    if (memo[at] != -1) {
        return memo[at] == 1;
    }
    for (int step = jump - 1; step <= jump + 1; step++) {
        if (step <= 0 || step >= n) {
            continue;
        }
        int next = locate(stones, n, (long long)stones[i] + step);
        if (next >= 0 && dfs(next, step, stones, n, memo)) {
            memo[at] = 1;
            return true;
        }
    }
    memo[at] = 0;
    return false;
}

bool canCross(int *stones, int stonesSize) {
    int n = stonesSize;
    signed char *memo = malloc(n * (n + 1) * sizeof(signed char));
    memset(memo, -1, n * (n + 1) * sizeof(signed char));
    bool answer = dfs(0, 0, stones, n, memo);
    free(memo);
    return answer;
}`,
        cpp: `bool canCross(vector<int>& stones) {
    int n = stones.size();
    unordered_map<int, int> position;
    for (int i = 0; i < n; i++) {
        position[stones[i]] = i;
    }
    vector<vector<int>> memo(n, vector<int>(n + 1, -1));
    auto dfs = [&](auto&& self, int i, int jump) -> bool {
        if (i == n - 1) {
            return true;
        }
        if (memo[i][jump] != -1) {
            return memo[i][jump] == 1;
        }
        for (int step = max(1, jump - 1); step <= jump + 1; step++) {
            if (step >= n) {
                continue;
            }
            long long target = (long long)stones[i] + step;
            auto found = target <= INT_MAX ? position.find((int)target) : position.end();
            if (found != position.end() && self(self, found->second, step)) {
                memo[i][jump] = 1;
                return true;
            }
        }
        memo[i][jump] = 0;
        return false;
    };
    return dfs(dfs, 0, 0);
}`,
        java: `boolean canCross(int[] stones) {
    Map<Integer, Integer> position = new HashMap<>();
    for (int i = 0; i < stones.length; i++) {
        position.put(stones[i], i);
    }
    int[][] memo = new int[stones.length][stones.length + 1];
    return dfs(0, 0, stones, position, memo);
}

private boolean dfs(int i, int jump, int[] stones, Map<Integer, Integer> position, int[][] memo) {
    if (i == stones.length - 1) {
        return true;
    }
    if (memo[i][jump] != 0) {
        return memo[i][jump] == 1;
    }
    for (int step = Math.max(1, jump - 1); step <= jump + 1; step++) {
        if (step >= stones.length) {
            continue;
        }
        long target = (long) stones[i] + step;
        Integer next = target <= Integer.MAX_VALUE ? position.get((int) target) : null;
        if (next != null && dfs(next, step, stones, position, memo)) {
            memo[i][jump] = 1;
            return true;
        }
    }
    memo[i][jump] = -1;
    return false;
}`,
        javascript: `function canCross(stones) {
  const position = new Map(stones.map((x, i) => [x, i]));
  const memo = new Map();
  function dfs(i, jump) {
    if (i === stones.length - 1) {
      return true;
    }
    const key = i + ',' + jump;
    if (memo.has(key)) {
      return memo.get(key);
    }
    for (let step = Math.max(1, jump - 1); step <= jump + 1; step++) {
      const next = position.get(stones[i] + step);
      if (next !== undefined && dfs(next, step)) {
        memo.set(key, true);
        return true;
      }
    }
    memo.set(key, false);
    return false;
  }
  return dfs(0, 0);
}`,
      },
    },
    {
      name: '逐石頭傳播可達跳長',
      idea: '每塊石頭保存「以哪些跳長能抵達」；由左到右，把下一跳傳到對應石頭。',
      steps: ['在位置 0 記錄上一跳 0。', '由左到右處理石頭與它所有可達的上一跳長度。', '試 k−1、k、k+1；若距離正且落在石頭上，將新跳長加入那塊石頭。', '終點有任何可達跳長就是 true。'],
      figure: { title: 'stones = [0,1,3,5,6,8,12,17]', steps: [
        { note: '位置 0 的可達上一跳集合為 {0}，傳出距離 1 到位置 1。', views: [arr(P, { highlight: [0, 1] })] },
        { note: '位置 1 收到 {1}，下一跳可用 1 或 2；距離 2 落在位置 3。', views: [arr(P, { done: [0, 1], highlight: [2] })] },
        { note: '位置 3 收到 {2}，可傳到位置 5、6；同一石頭也可能收到不同跳長，需全部保存。', views: [arr(P, { done: [0, 1, 2], highlight: [3, 4] })] },
        { note: '經 5 → 8 → 12，傳播跳長 3、4；位置 12 再跳 5 到 17。', views: [arr(P, { done: [0, 1, 2, 3, 5, 6], highlight: [7] })] },
      ] },
      complexity: { time: 'O(n² log n)', space: 'O(n²)', why: '最多 O(n²) 個石頭與跳長狀態；二分查找目標石頭。' },
      verdict: '迭代 DP 避免遞迴深度問題。',
      code: {
        python: `def canCross(stones):
    reachable = {x: set() for x in stones}
    reachable[0].add(0)
    for stone in stones:
        for jump in reachable[stone]:
            for step in (jump - 1, jump, jump + 1):
                if step > 0 and stone + step in reachable:
                    reachable[stone + step].add(step)  # 記住抵達時的跳長
    return bool(reachable[stones[-1]])`,
        c: `static int locate(int *stones, int n, long long target) {
    int lo = 0;
    int hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (stones[mid] == target) {
            return mid;
        }
        if (stones[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return -1;
}

bool canCross(int *stones, int stonesSize) {
    int n = stonesSize;
    bool *reachable = calloc(n * (n + 1), sizeof(bool));
    reachable[0] = true;
    for (int i = 0; i < n; i++) {
        for (int jump = 0; jump < n; jump++) {
            if (!reachable[i * (n + 1) + jump]) {
                continue;
            }
            for (int step = jump - 1; step <= jump + 1; step++) {
                if (step <= 0 || step >= n) {
                    continue;
                }
                int next = locate(stones, n, (long long)stones[i] + step);
                if (next >= 0) {
                    reachable[next * (n + 1) + step] = true;
                }
            }
        }
    }
    bool answer = false;
    for (int jump = 0; jump < n; jump++) {
        answer |= reachable[(n - 1) * (n + 1) + jump];
    }
    free(reachable);
    return answer;
}`,
        cpp: `bool canCross(vector<int>& stones) {
    int n = stones.size();
    unordered_map<int, int> position;
    for (int i = 0; i < n; i++) {
        position[stones[i]] = i;
    }
    vector<unordered_set<int>> reachable(n);
    reachable[0].insert(0);
    for (int i = 0; i < n; i++) {
        for (int jump : reachable[i]) {
            for (int step = max(1, jump - 1); step <= jump + 1; step++) {
                long long target = (long long)stones[i] + step;
                auto found = target <= INT_MAX ? position.find((int)target) : position.end();
                if (found != position.end()) {
                    reachable[found->second].insert(step);
                }
            }
        }
    }
    return !reachable[n - 1].empty();
}`,
        java: `boolean canCross(int[] stones) {
    Map<Integer, Integer> position = new HashMap<>();
    for (int i = 0; i < stones.length; i++) {
        position.put(stones[i], i);
    }
    List<Set<Integer>> reachable = new ArrayList<>();
    for (int i = 0; i < stones.length; i++) {
        reachable.add(new HashSet<>());
    }
    reachable.get(0).add(0);
    for (int i = 0; i < stones.length; i++) {
        for (int jump : reachable.get(i)) {
            for (int step = Math.max(1, jump - 1); step <= jump + 1; step++) {
                long target = (long) stones[i] + step;
                Integer next = target <= Integer.MAX_VALUE ? position.get((int) target) : null;
                if (next != null) {
                    reachable.get(next).add(step);
                }
            }
        }
    }
    return !reachable.get(stones.length - 1).isEmpty();
}`,
        javascript: `function canCross(stones) {
  const position = new Map(stones.map((x, i) => [x, i]));
  const reachable = Array.from({ length: stones.length }, () => new Set());
  reachable[0].add(0);
  for (let i = 0; i < stones.length; i++) {
    for (const jump of reachable[i]) {
      for (let step = Math.max(1, jump - 1); step <= jump + 1; step++) {
        const next = position.get(stones[i] + step);
        if (next !== undefined) {
          reachable[next].add(step);
        }
      }
    }
  }
  return reachable[stones.length - 1].size > 0;
}`,
      },
    },
  ],
  pitfalls: ['同一塊石頭可能以不同跳長抵達，不能只用一個 visited 布林值。', '第一跳必須為 1；從狀態 (0,0) 套用 k−1、k、k+1 可自然得到。', '跳長 0 或負數不能使用。'],
  check: { kind: 'fn', fn: 'canCross', cases: [
    { args: [P], out: true },
    { args: [[0, 1, 2, 3, 4, 8, 9, 11]], out: false },
    { args: [[0, 2]], out: false },
    { args: [[0, 1]], out: true },
  ] },
}

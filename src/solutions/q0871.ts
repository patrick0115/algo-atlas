import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const stations = [[10, 60], [20, 30], [30, 30], [60, 40]]
const dpFig: FigStep[] = [
  { note: '起始油量 10，dp[0]=10，表示不加油最遠只能到位置 10。', views: [arr([10], { label: '加油 0 次的最遠距離' })] },
  { note: '到第一站位置 10，有 60 油；加一次可到 70，所以 dp[1]=70。', views: [arr([10, 70], { label: 'dp', highlight: [1] })] },
  { note: '位置 20 與 30 的兩站各 30 油；用兩次加油最遠可到 100。更新要從較大的加油次數往回做，避免同一站被選兩次。', views: [arr([10, 70, 100], { label: 'dp', highlight: [2] })] },
  { note: 'dp[2]=100 已經到目標，最少需要 2 次。', views: [arr([10, 70, 100], { label: 'dp', done: [2] })] },
]
const heapFig: FigStep[] = [
  { note: '起點有 10 油，剛好開到位置 10；第一站的 60 油先放進可選清單。', views: [arr([60], { label: '已經過、可回頭決定的油量' })] },
  { note: '下一站在位置 20，目前可達距離只有 10；從經過的站中選最多的 60 油，可達距離變 70，停一次。', views: [arr([70], { label: '可達距離', highlight: [0] })] },
  { note: '經過位置 20、30、60，把油量 30、30、40 都放進清單。目標在 100，70 還不夠。', views: [arr([30, 30, 40], { label: '候選油量', highlight: [2] })] },
  { note: '補最多的 40 油，可達 110；共停兩次，已到目標。', views: [arr([110, 2], { label: '可達距離 / 次數', done: [0, 1] })] },
]

export const q0871: Solution = {
  id: 871,
  plain: '開車往目標前進，途中加油站有不同油量；要算最少停幾站才能到。',
  statement: '車起始有 startFuel 公升，每走 1 單位距離用 1 公升。stations[i]=[位置,油量]，各站油可全加。回傳到 target 的最少加油次數，無法到達回傳 -1。',
  examples: [{ input: 'target = 100, startFuel = 10, stations = [[10,60],[20,30],[30,30],[60,40]]', output: '2' }, { input: 'target = 1, startFuel = 1, stations = []', output: '0' }, { input: 'target = 100, startFuel = 1, stations = [[10,100]]', output: '-1' }],
  constraints: ['stations 按位置遞增；最多 500 站。', '距離與累加油量可能超過 32 位元；C、Java 使用 long long / long。'],
  insight: ['以「加了幾次油」作狀態，記錄最遠能開到哪裡，是直接的 [[p:dp-1d]]。', '也能把已經過的站視為候選；當距離不足時，選油量最多的一站，這是 [[p:heap]] 加 [[p:greedy]]。'],
  approaches: [
    {
      name: '依加油次數做 DP', idea: 'dp[k] 是加油 k 次能到的最遠距離。到得了站才可選它的油。',
      steps: ['dp[0]=startFuel，其餘設為無法到達。', '逐站處理，從大到小更新加油次數。', '若 dp[k] 可到站位置，更新 dp[k+1]。', '找第一個可達 target 的 k。'],
      figure: { title: 'target = 100，startFuel = 10', steps: dpFig },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每站檢查至多 n 種停靠次數。' },
      verdict: '狀態清楚，適合先理解最少次數問題。',
      code: {
        python: `def minRefuelStops(target, startFuel, stations):
    dp = [startFuel] + [-1] * len(stations)
    for i, (position, fuel) in enumerate(stations):
        for stops in range(i, -1, -1):
            if dp[stops] >= position:
                dp[stops + 1] = max(dp[stops + 1], dp[stops] + fuel)  # 選這一站
    for stops, reach in enumerate(dp):
        if reach >= target:
            return stops
    return -1`,
        c: `int minRefuelStops(int target, int startFuel, int **stations, int stationsSize, int *stationsColSize) {
    long long *dp = malloc((stationsSize + 1) * sizeof(long long));
    dp[0] = startFuel;
    for (int i = 1; i <= stationsSize; i++) {
        dp[i] = -1;
    }
    for (int i = 0; i < stationsSize; i++) {
        for (int stops = i; stops >= 0; stops--) {
            if (dp[stops] >= stations[i][0]) {
                long long reach = dp[stops] + stations[i][1];
                if (reach > dp[stops + 1]) {
                    dp[stops + 1] = reach;
                }
            }
        }
    }
    int answer = -1;
    for (int i = 0; i <= stationsSize; i++) {
        if (dp[i] >= target) {
            answer = i;
            break;
        }
    }
    free(dp);
    return answer;
}`,
        cpp: `int minRefuelStops(int target, int startFuel, vector<vector<int>>& stations) {
    vector<long long> dp(stations.size() + 1, -1);
    dp[0] = startFuel;
    for (int i = 0; i < (int) stations.size(); i++) {
        for (int stops = i; stops >= 0; stops--) {
            if (dp[stops] >= stations[i][0]) {
                dp[stops + 1] = max(dp[stops + 1], dp[stops] + stations[i][1]);
            }
        }
    }
    for (int i = 0; i < (int) dp.size(); i++) {
        if (dp[i] >= target) {
            return i;
        }
    }
    return -1;
}`,
        java: `int minRefuelStops(int target, int startFuel, int[][] stations) {
    long[] dp = new long[stations.length + 1];
    Arrays.fill(dp, -1);
    dp[0] = startFuel;
    for (int i = 0; i < stations.length; i++) {
        for (int stops = i; stops >= 0; stops--) {
            if (dp[stops] >= stations[i][0]) {
                dp[stops + 1] = Math.max(dp[stops + 1], dp[stops] + stations[i][1]);
            }
        }
    }
    for (int i = 0; i < dp.length; i++) {
        if (dp[i] >= target) {
            return i;
        }
    }
    return -1;
}`,
        javascript: `function minRefuelStops(target, startFuel, stations) {
  const dp = new Array(stations.length + 1).fill(-1);
  dp[0] = startFuel;
  for (let i = 0; i < stations.length; i++) {
    for (let stops = i; stops >= 0; stops--) {
      if (dp[stops] >= stations[i][0]) {
        dp[stops + 1] = Math.max(dp[stops + 1], dp[stops] + stations[i][1]);
      }
    }
  }
  for (let i = 0; i < dp.length; i++) {
    if (dp[i] >= target) {
      return i;
    }
  }
  return -1;
}`,
      },
    },
    {
      name: '可達車站放入最大堆', idea: '需要補油才能繼續時，從已經可到達的站選油量最多者。',
      steps: ['把所有可達距離內的站加入最大堆。', '若尚未到 target，從堆取出最大油量並增加可達距離。', '堆空卻仍不足則回傳 -1；否則重複直到到達。'],
      figure: { title: 'target = 100，startFuel = 10', steps: heapFig },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '每站最多入堆與出堆各一次。' },
      verdict: '推薦解法。延後決定在哪一站加油，但取出的站一定已經能到達。',
      code: {
        python: `import heapq

def minRefuelStops(target, startFuel, stations):
    available = []
    reach = startFuel
    index = 0
    stops = 0
    while reach < target:
        while index < len(stations) and stations[index][0] <= reach:
            heapq.heappush(available, -stations[index][1])  # 最大油量優先
            index += 1
        if not available:
            return -1  # 沒有能到的站可補油
        reach -= heapq.heappop(available)
        stops += 1
    return stops`,
        c: `static void pushFuel(int *heap, int *size, int value) {
    int i = (*size)++;
    while (i > 0 && heap[(i - 1) / 2] < value) {
        heap[i] = heap[(i - 1) / 2];
        i = (i - 1) / 2;
    }
    heap[i] = value;
}

static int popFuel(int *heap, int *size) {
    int top = heap[0];
    int value = heap[--(*size)];
    int i = 0;
    while (i * 2 + 1 < *size) {
        int child = i * 2 + 1;
        if (child + 1 < *size && heap[child + 1] > heap[child]) {
            child++;
        }
        if (heap[child] <= value) {
            break;
        }
        heap[i] = heap[child];
        i = child;
    }
    if (*size > 0) {
        heap[i] = value;
    }
    return top;
}

int minRefuelStops(int target, int startFuel, int **stations, int stationsSize, int *stationsColSize) {
    int *heap = malloc((stationsSize + 1) * sizeof(int));
    int size = 0;
    int index = 0;
    int stops = 0;
    long long reach = startFuel;
    while (reach < target) {
        while (index < stationsSize && stations[index][0] <= reach) {
            pushFuel(heap, &size, stations[index][1]);
            index++;
        }
        if (size == 0) {
            free(heap);
            return -1;
        }
        reach += popFuel(heap, &size);
        stops++;
    }
    free(heap);
    return stops;
}`,
        cpp: `int minRefuelStops(int target, int startFuel, vector<vector<int>>& stations) {
    priority_queue<int> available;
    long long reach = startFuel;
    int index = 0;
    int stops = 0;
    while (reach < target) {
        while (index < (int) stations.size() && stations[index][0] <= reach) {
            available.push(stations[index][1]);
            index++;
        }
        if (available.empty()) {
            return -1;
        }
        reach += available.top();
        available.pop();
        stops++;
    }
    return stops;
}`,
        java: `int minRefuelStops(int target, int startFuel, int[][] stations) {
    PriorityQueue<Integer> available = new PriorityQueue<>(Collections.reverseOrder());
    long reach = startFuel;
    int index = 0;
    int stops = 0;
    while (reach < target) {
        while (index < stations.length && stations[index][0] <= reach) {
            available.offer(stations[index][1]);
            index++;
        }
        if (available.isEmpty()) {
            return -1;
        }
        reach += available.poll();
        stops++;
    }
    return stops;
}`,
        javascript: `function minRefuelStops(target, startFuel, stations) {
  const available = [];
  function push(value) {
    let index = available.length;
    available.push(value);
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (available[parent] >= value) {
        break;
      }
      available[index] = available[parent];
      index = parent;
    }
    available[index] = value;
  }
  function pop() {
    const top = available[0];
    const value = available.pop();
    if (available.length > 0) {
      let index = 0;
      while (index * 2 + 1 < available.length) {
        let child = index * 2 + 1;
        if (child + 1 < available.length && available[child + 1] > available[child]) {
          child++;
        }
        if (available[child] <= value) {
          break;
        }
        available[index] = available[child];
        index = child;
      }
      available[index] = value;
    }
    return top;
  }
  let reach = startFuel;
  let index = 0;
  let stops = 0;
  while (reach < target) {
    while (index < stations.length && stations[index][0] <= reach) {
      push(stations[index][1]);
      index++;
    }
    if (available.length === 0) {
      return -1;
    }
    reach += pop();
    stops++;
  }
  return stops;
}`,
      },
    },
  ],
  pitfalls: ['不能先使用尚未可到達的車站。', 'DP 要倒序更新，才不會在同一輪把同一站加兩次。'],
  check: { kind: 'fn', fn: 'minRefuelStops', cases: [
    { args: [100, 10, stations], out: 2 },
    { args: [1, 1, []], out: 0 },
    { args: [100, 1, [[10, 100]]], out: -1 },
    { args: [100, 50, [[25, 50], [50, 50]]], out: 1 },
  ] },
}

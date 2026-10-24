import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

function routeFig(): FigStep[] {
  return [
    { note: '站 1 在路線 0（停 1、2、7）上，所以先搭路線 0，已搭車數為 1。', views: [arr([1, 2, 7], { label: '路線 0', highlight: [0] })] },
    { note: '路線 0 會到站 7；站 7 同時屬於路線 1，可在這裡轉乘。', views: [arr([1, 2, 7], { label: '路線 0', done: [2] }), arr([3, 6, 7], { label: '路線 1', compare: [2] })] },
    { note: '搭上路線 1 後，已搭車數變成 2；它會經過目的站 6。', views: [arr([3, 6, 7], { label: '路線 1', done: [1] })] },
    { note: '首次抵達目的站時的搭車數就是最小值，回傳 2。', views: [arr([0, 1], { label: '依序搭乘的路線', done: [0, 1] }), arr([2], { label: '答案' })] },
  ]
}

function stopFig(): FigStep[] {
  return [
    { note: '從站 1 出發，尚未搭車，佇列先放入站 1。', views: [arr([1], { label: '目前可達站' }), arr([0], { label: '搭車數' })] },
    { note: '搭路線 0 一次可到 2 與 7，這兩站的搭車數都是 1。', views: [arr([1, 2, 7], { label: '搭一班車可達', done: [1, 2] })] },
    { note: '從站 7 轉到路線 1，再搭一次可到 3 與 6。', views: [arr([3, 6, 7], { label: '搭第二班車可達', highlight: [1] })] },
    { note: '站 6 是目的地，因此答案為 2。', views: [arr([1, 7, 6], { label: '轉乘路徑', done: [0, 1, 2] }), arr([2], { label: '答案' })] },
  ]
}

export const q0815: Solution = {
  id: 815,
  plain: '每條公車路線可停好幾站；從起點搭車、必要時轉乘，求最少要搭幾班車才到目的地。',
  statement: '給 routes、source、target。第 i 條路線會循環經過 routes[i] 的各站；可在共同車站轉乘。回傳從 source 到 target 最少搭乘的公車數，無法抵達回傳 -1。',
  examples: [
    { input: 'routes = [[1,2,7],[3,6,7]], source = 1, target = 6', output: '2' },
    { input: 'routes = [[7,12],[4,5,15],[6],[15,19],[9,12,13]], source = 15, target = 12', output: '-1' },
  ],
  constraints: ['路線數最多 500；所有路線的站點總數最多 10⁵；站號可達 10⁶。'],
  insight: ['一次搭上一條路線，便可到達它的任意車站。', '用「站號 → 經過的路線」索引，可快速找出可轉乘路線；BFS 依搭車數逐層探索。'],
  approaches: [
    {
      name: '以公車路線為 BFS 節點',
      idea: '相同車站可連接兩條路線；每加入一條新路線代表再搭一班車。',
      steps: ['source 等於 target 時直接回傳 0。', '建立站號到路線的對照，將經過 source 的路線入列，距離設為 1。', '每次取出路線：若經過 target 就回傳距離；否則透過沿途站點加入尚未搭過的路線。'],
      figure: { title: 'routes = [[1,2,7],[3,6,7]]', steps: routeFig() },
      complexity: { time: 'O(M)', space: 'O(M + R)', why: '每條路線和每個站點清單只處理一次；M 是站點總數，R 是路線數。' },
      verdict: '「搭幾班車」直接對應 BFS 層數。',
      code: {
        python: `from collections import defaultdict, deque

def numBusesToDestination(routes, source, target):
    if source == target:
        return 0
    through = defaultdict(list)
    for route, stops in enumerate(routes):
        for stop in stops:
            through[stop].append(route)
    queue = deque()
    seen_routes = set()
    for route in through[source]:
        queue.append((route, 1))       # 第一班車
        seen_routes.add(route)
    seen_stops = set()
    while queue:
        route, buses = queue.popleft()
        for stop in routes[route]:
            if stop == target:
                return buses
            if stop in seen_stops:
                continue
            seen_stops.add(stop)
            for next_route in through[stop]:
                if next_route not in seen_routes:
                    seen_routes.add(next_route)
                    queue.append((next_route, buses + 1))  # 轉乘
    return -1`,
        c: `int numBusesToDestination(int **routes, int routesSize, int *routesColSize, int source, int target) {
    if (source == target) {
        return 0;
    }
    int total = 0;
    for (int i = 0; i < routesSize; i++) {
        total += routesColSize[i];
    }
    int *head = malloc(1000001 * sizeof(int));
    int *next = malloc(total * sizeof(int));
    int *owner = malloc(total * sizeof(int));
    bool *seenStop = calloc(1000001, sizeof(bool));
    bool *seenRoute = calloc(routesSize, sizeof(bool));
    for (int stop = 0; stop <= 1000000; stop++) {
        head[stop] = -1;
    }
    int edge = 0;
    for (int route = 0; route < routesSize; route++) {
        for (int j = 0; j < routesColSize[route]; j++) {
            int stop = routes[route][j];
            owner[edge] = route;
            next[edge] = head[stop];
            head[stop] = edge++;
        }
    }
    int *queue = malloc(routesSize * sizeof(int));
    int front = 0, back = 0, buses = 1;
    for (int e = head[source]; e != -1; e = next[e]) {
        int route = owner[e];
        if (!seenRoute[route]) {
            seenRoute[route] = true;
            queue[back++] = route;
        }
    }
    int answer = -1;
    while (front < back) {
        int layerEnd = back;
        while (front < layerEnd) {
            int route = queue[front++];
            for (int j = 0; j < routesColSize[route]; j++) {
                int stop = routes[route][j];
                if (stop == target) {
                    answer = buses;
                    goto finish;
                }
                if (seenStop[stop]) {
                    continue;
                }
                seenStop[stop] = true;
                for (int e = head[stop]; e != -1; e = next[e]) {
                    int other = owner[e];
                    if (!seenRoute[other]) {
                        seenRoute[other] = true;
                        queue[back++] = other;
                    }
                }
            }
        }
        buses++;
    }
finish:
    free(head);
    free(next);
    free(owner);
    free(seenStop);
    free(seenRoute);
    free(queue);
    return answer;
}`,
        cpp: `int numBusesToDestination(vector<vector<int>>& routes, int source, int target) {
    if (source == target) {
        return 0;
    }
    unordered_map<int, vector<int>> through;
    for (int route = 0; route < (int)routes.size(); route++) {
        for (int stop : routes[route]) {
            through[stop].push_back(route);
        }
    }
    queue<pair<int, int>> pending;
    vector<bool> seenRoute(routes.size(), false);
    unordered_set<int> seenStop;
    for (int route : through[source]) {
        seenRoute[route] = true;
        pending.push({route, 1});
    }
    while (!pending.empty()) {
        auto [route, buses] = pending.front();
        pending.pop();
        for (int stop : routes[route]) {
            if (stop == target) {
                return buses;
            }
            if (!seenStop.insert(stop).second) {
                continue;
            }
            for (int nextRoute : through[stop]) {
                if (!seenRoute[nextRoute]) {
                    seenRoute[nextRoute] = true;
                    pending.push({nextRoute, buses + 1});
                }
            }
        }
    }
    return -1;
}`,
        java: `int numBusesToDestination(int[][] routes, int source, int target) {
    if (source == target) {
        return 0;
    }
    Map<Integer, List<Integer>> through = new HashMap<>();
    for (int route = 0; route < routes.length; route++) {
        for (int stop : routes[route]) {
            through.computeIfAbsent(stop, key -> new ArrayList<>()).add(route);
        }
    }
    Queue<int[]> queue = new ArrayDeque<>();
    boolean[] seenRoute = new boolean[routes.length];
    Set<Integer> seenStop = new HashSet<>();
    for (int route : through.getOrDefault(source, List.of())) {
        seenRoute[route] = true;
        queue.offer(new int[]{route, 1});
    }
    while (!queue.isEmpty()) {
        int[] state = queue.poll();
        int route = state[0], buses = state[1];
        for (int stop : routes[route]) {
            if (stop == target) {
                return buses;
            }
            if (!seenStop.add(stop)) {
                continue;
            }
            for (int nextRoute : through.get(stop)) {
                if (!seenRoute[nextRoute]) {
                    seenRoute[nextRoute] = true;
                    queue.offer(new int[]{nextRoute, buses + 1});
                }
            }
        }
    }
    return -1;
}`,
        javascript: `function numBusesToDestination(routes, source, target) {
  if (source === target) {
    return 0;
  }
  const through = new Map();
  for (let route = 0; route < routes.length; route++) {
    for (const stop of routes[route]) {
      if (!through.has(stop)) {
        through.set(stop, []);
      }
      through.get(stop).push(route);
    }
  }
  const queue = [];
  const seenRoute = new Set();
  const seenStop = new Set();
  for (const route of through.get(source) ?? []) {
    seenRoute.add(route);
    queue.push([route, 1]);
  }
  for (let front = 0; front < queue.length; front++) {
    const [route, buses] = queue[front];
    for (const stop of routes[route]) {
      if (stop === target) {
        return buses;
      }
      if (seenStop.has(stop)) {
        continue;
      }
      seenStop.add(stop);
      for (const nextRoute of through.get(stop)) {
        if (!seenRoute.has(nextRoute)) {
          seenRoute.add(nextRoute);
          queue.push([nextRoute, buses + 1]);
        }
      }
    }
  }
  return -1;
}`,
      },
    },
    {
      name: '以車站為 BFS 節點',
      idea: '從目前車站搭一條尚未用過的路線，一次把該路線所有車站加入下一層。',
      steps: ['source 入列，已搭車數為 0。', '取出一個站，對每條尚未搭過的經過路線，將沿線所有新車站以距離加一入列。', '第一次到 target 時回傳搭車數，佇列清空則回傳 -1。'],
      figure: { title: '從站 1 逐層擴張', steps: stopFig() },
      complexity: { time: 'O(M)', space: 'O(M)', why: '每條路線只展開一次，每站最多入列一次。' },
      verdict: '把每次搭車視為一次跨越多個車站的 BFS 邊。',
      code: {
        python: `from collections import defaultdict, deque

def numBusesToDestination(routes, source, target):
    if source == target:
        return 0
    through = defaultdict(list)
    for route, stops in enumerate(routes):
        for stop in stops:
            through[stop].append(route)
    queue = deque([(source, 0)])
    seen_stops = {source}
    seen_routes = set()
    while queue:
        stop, buses = queue.popleft()
        for route in through[stop]:
            if route in seen_routes:
                continue
            seen_routes.add(route)       # 整條路線只展開一次
            for next_stop in routes[route]:
                if next_stop == target:
                    return buses + 1
                if next_stop not in seen_stops:
                    seen_stops.add(next_stop)
                    queue.append((next_stop, buses + 1))
    return -1`,
        c: `int numBusesToDestination(int **routes, int routesSize, int *routesColSize, int source, int target) {
    if (source == target) {
        return 0;
    }
    int total = 0;
    for (int i = 0; i < routesSize; i++) {
        total += routesColSize[i];
    }
    int *head = malloc(1000001 * sizeof(int));
    int *next = malloc(total * sizeof(int));
    int *owner = malloc(total * sizeof(int));
    bool *seenStop = calloc(1000001, sizeof(bool));
    bool *seenRoute = calloc(routesSize, sizeof(bool));
    for (int stop = 0; stop <= 1000000; stop++) {
        head[stop] = -1;
    }
    int edge = 0;
    for (int route = 0; route < routesSize; route++) {
        for (int j = 0; j < routesColSize[route]; j++) {
            int stop = routes[route][j];
            owner[edge] = route;
            next[edge] = head[stop];
            head[stop] = edge++;
        }
    }
    int *queue = malloc((total + 1) * sizeof(int));
    int front = 0, back = 0, buses = 0;
    queue[back++] = source;
    seenStop[source] = true;
    int answer = -1;
    while (front < back) {
        int layerEnd = back;
        while (front < layerEnd) {
            int stop = queue[front++];
            for (int e = head[stop]; e != -1; e = next[e]) {
                int route = owner[e];
                if (seenRoute[route]) {
                    continue;
                }
                seenRoute[route] = true;
                for (int j = 0; j < routesColSize[route]; j++) {
                    int nextStop = routes[route][j];
                    if (nextStop == target) {
                        answer = buses + 1;
                        goto finish;
                    }
                    if (!seenStop[nextStop]) {
                        seenStop[nextStop] = true;
                        queue[back++] = nextStop;
                    }
                }
            }
        }
        buses++;
    }
finish:
    free(head);
    free(next);
    free(owner);
    free(seenStop);
    free(seenRoute);
    free(queue);
    return answer;
}`,
        cpp: `int numBusesToDestination(vector<vector<int>>& routes, int source, int target) {
    if (source == target) {
        return 0;
    }
    unordered_map<int, vector<int>> through;
    for (int route = 0; route < (int)routes.size(); route++) {
        for (int stop : routes[route]) {
            through[stop].push_back(route);
        }
    }
    queue<pair<int, int>> pending;
    unordered_set<int> seenStop{source};
    vector<bool> seenRoute(routes.size(), false);
    pending.push({source, 0});
    while (!pending.empty()) {
        auto [stop, buses] = pending.front();
        pending.pop();
        for (int route : through[stop]) {
            if (seenRoute[route]) {
                continue;
            }
            seenRoute[route] = true;
            for (int nextStop : routes[route]) {
                if (nextStop == target) {
                    return buses + 1;
                }
                if (seenStop.insert(nextStop).second) {
                    pending.push({nextStop, buses + 1});
                }
            }
        }
    }
    return -1;
}`,
        java: `int numBusesToDestination(int[][] routes, int source, int target) {
    if (source == target) {
        return 0;
    }
    Map<Integer, List<Integer>> through = new HashMap<>();
    for (int route = 0; route < routes.length; route++) {
        for (int stop : routes[route]) {
            through.computeIfAbsent(stop, key -> new ArrayList<>()).add(route);
        }
    }
    Queue<int[]> queue = new ArrayDeque<>();
    Set<Integer> seenStop = new HashSet<>();
    boolean[] seenRoute = new boolean[routes.length];
    queue.offer(new int[]{source, 0});
    seenStop.add(source);
    while (!queue.isEmpty()) {
        int[] state = queue.poll();
        int stop = state[0], buses = state[1];
        for (int route : through.getOrDefault(stop, List.of())) {
            if (seenRoute[route]) {
                continue;
            }
            seenRoute[route] = true;
            for (int nextStop : routes[route]) {
                if (nextStop == target) {
                    return buses + 1;
                }
                if (seenStop.add(nextStop)) {
                    queue.offer(new int[]{nextStop, buses + 1});
                }
            }
        }
    }
    return -1;
}`,
        javascript: `function numBusesToDestination(routes, source, target) {
  if (source === target) {
    return 0;
  }
  const through = new Map();
  for (let route = 0; route < routes.length; route++) {
    for (const stop of routes[route]) {
      if (!through.has(stop)) {
        through.set(stop, []);
      }
      through.get(stop).push(route);
    }
  }
  const queue = [[source, 0]];
  const seenStop = new Set([source]);
  const seenRoute = new Set();
  for (let front = 0; front < queue.length; front++) {
    const [stop, buses] = queue[front];
    for (const route of through.get(stop) ?? []) {
      if (seenRoute.has(route)) {
        continue;
      }
      seenRoute.add(route);
      for (const nextStop of routes[route]) {
        if (nextStop === target) {
          return buses + 1;
        }
        if (!seenStop.has(nextStop)) {
          seenStop.add(nextStop);
          queue.push([nextStop, buses + 1]);
        }
      }
    }
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: ['搭一條路線可以到它的任意一站，不需按站點順序逐站收費。', '路線只展開一次，否則共同站很多時會重複處理大量資料。'],
  check: {
    kind: 'fn',
    fn: 'numBusesToDestination',
    cases: [
      { args: [[[1, 2, 7], [3, 6, 7]], 1, 6], out: 2 },
      { args: [[[7, 12], [4, 5, 15], [6], [15, 19], [9, 12, 13]], 15, 12], out: -1 },
      { args: [[[1, 2, 7]], 1, 1], out: 0 },
      { args: [[[1, 2, 7]], 1, 7], out: 1 },
    ],
  },
}

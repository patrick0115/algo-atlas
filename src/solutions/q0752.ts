import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 752. Open the Lock

const DEAD = ['0201', '0101', '0102', '1212', '2002']
const TARGET = '0202'

function bfsFig(): FigStep[] {
  return [
    { note: '4 個轉盤,每次轉一格(往上或往下,9 和 0 相鄰)。把每個組合 "0000"~"9999" 看成一個點,轉一次就是走一條邊 → 求最短步數 = BFS', views: [arr(['0000'], { label: '起點', highlight: [0] })] },
    { note: '每個組合有 8 個鄰居(4 個轉盤 × 上下)。第 1 層:1000、9000、0100、0900、0010、0090、0001、0009', views: [arr(['1000', '9000', '0100', '0900', '0010', '0090', '0001', '0009'], { label: '第 1 層' })] },
    { note: `死亡組合(${DEAD.join('、')})當作牆,不能走進去;走過的也不再走`, views: [arr(DEAD, { label: 'deadends', dim: [0, 1, 2, 3, 4] })] },
    { note: '一層一層擴散,第一次碰到 "0202" 時的層數就是最少步數:6(例如 0000 → 1000 → 1100 → 1200 → 1201 → 1202 → 0202)', views: [arr([6], { label: '答案', done: [0] })] },
  ]
}

function biFig(): FigStep[] {
  return [
    { note: '雙向 BFS:同時從起點和終點往中間擴散,每次擴展「比較小的那一邊」。兩邊相遇時,步數 = 兩邊層數相加', views: [arr(['0000'], { label: '起點那邊' }), arr([TARGET], { label: '終點那邊' })] },
    { note: '單向 BFS 要擴到半徑 d,雙向只要兩邊各擴到 d/2,搜尋的點數大幅減少', views: [arr([6], { label: '答案', done: [0] })] },
  ]
}

export const q0752: Solution = {
  id: 752,
  plain: '一個 4 位數的密碼鎖,每次可以把一個轉盤往上或往下轉一格(9 和 0 相鄰)。從 0000 開始,有一些「死亡組合」碰到就卡住。最少轉幾次能轉到目標密碼?到不了回傳 −1。',
  statement: '鎖有 4 個圓形轉盤,每個 0–9,可循環。初始為 `"0000"`。`deadends` 中的組合一旦出現,鎖就會卡死。給 `target`,回傳轉到 target 的最少旋轉次數;不可能則回傳 −1。',
  examples: [
    { input: 'deadends = ["0201","0101","0102","1212","2002"], target = "0202"', output: '6' },
    { input: 'deadends = ["8888"], target = "0009"', output: '1' },
    { input: 'deadends = ["8887","8889","8878","8898","8788","8988","7888","9888"], target = "8888"', output: '-1', note: '目標的 8 個鄰居都是死路' },
  ],
  constraints: ['deadends ≤ 500'],
  insight: ['狀態只有 10⁴ 種,每種 8 個鄰居 → 無權圖最短路徑 = [[p:graph-traversal]] 的 BFS', '死亡組合等於牆', '起點本身是死亡組合 → −1'],
  approaches: [
    {
      name: 'BFS',
      idea: '從 "0000" BFS,鄰居是每位 ±1;遇到 target 回傳層數。',
      steps: ['`dead = set(deadends)`;"0000" 在 dead → −1', '`q = [("0000", 0)]`,`seen = {"0000"}`', '彈出 (s, d):`s == target` → d', '8 個鄰居:不在 dead、沒看過 → 入佇列'],
      figure: { title: `target = "${TARGET}"`, steps: bfsFig() },
      complexity: { time: 'O(10⁴ · 8 · 4)', space: 'O(10⁴)', why: '每個狀態處理一次,產生 8 個鄰居、每個長 4。' },
      verdict: '最推薦,「把狀態當成點」的 BFS 入門題。',
      code: {
        python: `from collections import deque

def openLock(deadends, target):
    dead = set(deadends)
    if '0000' in dead:
        return -1
    q, seen = deque([('0000', 0)]), {'0000'}
    while q:
        s, d = q.popleft()
        if s == target:
            return d
        for i in range(4):
            x = int(s[i])
            for y in ((x + 1) % 10, (x - 1) % 10):    # 往上 / 往下轉一格
                t = s[:i] + str(y) + s[i + 1:]
                if t not in dead and t not in seen:
                    seen.add(t)
                    q.append((t, d + 1))
    return -1`,
        c: `int openLock(char **deadends, int deadendsSize, char *target) {
    bool *bad = calloc(10000, sizeof(bool));
    int *dist = malloc(10000 * sizeof(int)), *q = malloc(10000 * sizeof(int)), h = 0, t = 0;
    for (int i = 0; i < deadendsSize; i++) bad[atoi(deadends[i])] = true;
    int goal = atoi(target), ans = -1, pw[4] = {1000, 100, 10, 1};
    for (int i = 0; i < 10000; i++) dist[i] = -1;
    if (!bad[0]) { dist[0] = 0; q[t++] = 0; }
    while (h < t) {
        int s = q[h++];
        if (s == goal) { ans = dist[s]; break; }
        for (int i = 0; i < 4; i++) {
            int x = s / pw[i] % 10;
            for (int d = -1; d <= 1; d += 2) {
                int y = (x + d + 10) % 10, nx = s + (y - x) * pw[i];
                if (!bad[nx] && dist[nx] < 0) { dist[nx] = dist[s] + 1; q[t++] = nx; }
            }
        }
    }
    free(bad); free(dist); free(q);
    return ans;
}`,
        cpp: `int openLock(vector<string>& deadends, string target) {
    unordered_set<string> dead(deadends.begin(), deadends.end());
    if (dead.count("0000")) return -1;
    queue<pair<string, int>> q;
    unordered_set<string> seen{"0000"};
    q.push({"0000", 0});
    while (!q.empty()) {
        auto [s, d] = q.front();
        q.pop();
        if (s == target) return d;
        for (int i = 0; i < 4; i++)
            for (int k : {1, 9}) {
                string t = s;
                t[i] = (t[i] - '0' + k) % 10 + '0';
                if (!dead.count(t) && !seen.count(t)) { seen.insert(t); q.push({t, d + 1}); }
            }
    }
    return -1;
}`,
        java: `int openLock(String[] deadends, String target) {
    Set<String> dead = new HashSet<>(Arrays.asList(deadends));
    if (dead.contains("0000")) return -1;
    Deque<String> q = new ArrayDeque<>();
    Set<String> seen = new HashSet<>();
    q.offer("0000");
    seen.add("0000");
    for (int d = 0; !q.isEmpty(); d++) {
        for (int sz = q.size(); sz > 0; sz--) {
            String s = q.poll();
            if (s.equals(target)) return d;
            char[] c = s.toCharArray();
            for (int i = 0; i < 4; i++) {
                char orig = c[i];
                for (int k : new int[]{1, 9}) {
                    c[i] = (char) ((orig - '0' + k) % 10 + '0');
                    String t = new String(c);
                    if (!dead.contains(t) && seen.add(t)) q.offer(t);
                }
                c[i] = orig;
            }
        }
    }
    return -1;
}`,
        javascript: `function openLock(deadends, target) {
  const dead = new Set(deadends);
  if (dead.has('0000')) return -1;
  const seen = new Set(['0000']);
  let q = ['0000'];
  for (let d = 0; q.length; d++) {
    const nxt = [];
    for (const s of q) {
      if (s === target) return d;
      for (let i = 0; i < 4; i++)
        for (const k of [1, 9]) {
          const t = s.slice(0, i) + ((+s[i] + k) % 10) + s.slice(i + 1);
          if (!dead.has(t) && !seen.has(t)) {
            seen.add(t);
            nxt.push(t);
          }
        }
    }
    q = nxt;
  }
  return -1;
}`,
      },
    },
    {
      name: '雙向 BFS',
      idea: '兩個集合 `front`、`back` 分別從起點、終點擴散;每次擴展較小的那個,一旦新產生的狀態出現在另一邊就相遇。',
      steps: ['`front = {"0000"}`、`back = {target}`、`seen`', '`while front and back`:若 `len(front) > len(back)` 交換', '產生 front 的所有鄰居:在 back 裡 → 回傳步數', '不在 dead、沒看過 → 放進下一層;步數 +1'],
      figure: { title: `target = "${TARGET}"`, steps: biFig() },
      complexity: { time: 'O(10⁴ · 32)(實際搜尋量少很多)', space: 'O(10⁴)', why: '兩邊各只擴到大約一半的深度。' },
      verdict: '起點終點都已知的最短路徑,雙向 BFS 是常見的加速技巧([127](#/q/127) 也能用)。',
      code: {
        python: `def openLock(deadends, target):
    dead = set(deadends)
    if '0000' in dead:
        return -1
    if target == '0000':
        return 0
    front, back, seen, step = {'0000'}, {target}, {'0000', target}, 0
    while front and back:
        if len(front) > len(back):
            front, back = back, front         # 永遠擴展小的那邊
        step += 1
        nxt = set()
        for s in front:
            for i in range(4):
                for k in (1, 9):
                    t = s[:i] + str((int(s[i]) + k) % 10) + s[i + 1:]
                    if t in back:
                        return step           # 兩邊相遇
                    if t not in dead and t not in seen:
                        seen.add(t)
                        nxt.add(t)
        front = nxt
    return -1`,
        c: `int openLock(char **deadends, int deadendsSize, char *target) {
    // side[s]:0 = 沒看過,1 = 起點那邊,2 = 終點那邊
    char *side = calloc(10000, 1);
    bool *bad = calloc(10000, sizeof(bool));
    for (int i = 0; i < deadendsSize; i++) bad[atoi(deadends[i])] = true;
    int goal = atoi(target), pw[4] = {1000, 100, 10, 1}, ans = -1;
    int *fa = malloc(10000 * sizeof(int)), *fb = malloc(10000 * sizeof(int)), *nx = malloc(10000 * sizeof(int));
    int na = 0, nb = 0, step = 0;
    if (bad[0]) goto done;
    if (goal == 0) { ans = 0; goto done; }
    fa[na++] = 0; side[0] = 1; fb[nb++] = goal; side[goal] = 2;
    while (na && nb) {
        int *cur = fa, ncur = na, me = 1;
        if (na > nb) { cur = fb; ncur = nb; me = 2; }
        step++;
        int nn = 0;
        for (int j = 0; j < ncur; j++) {
            int s = cur[j];
            for (int i = 0; i < 4; i++) {
                int x = s / pw[i] % 10;
                for (int d = 1; d <= 9; d += 8) {
                    int t = s + ((x + d) % 10 - x) * pw[i];
                    if (side[t] && side[t] != me) { ans = step; goto done; }
                    if (!bad[t] && !side[t]) { side[t] = me; nx[nn++] = t; }
                }
            }
        }
        memcpy(cur, nx, nn * sizeof(int));
        if (me == 1) na = nn; else nb = nn;
    }
done:
    free(side); free(bad); free(fa); free(fb); free(nx);
    return ans;
}`,
        cpp: `int openLock(vector<string>& deadends, string target) {
    unordered_set<string> dead(deadends.begin(), deadends.end());
    if (dead.count("0000")) return -1;
    if (target == "0000") return 0;
    unordered_set<string> front{"0000"}, back{target}, seen{"0000", target};
    for (int step = 1; !front.empty() && !back.empty(); step++) {
        if (front.size() > back.size()) swap(front, back);
        unordered_set<string> nxt;
        for (auto &s : front)
            for (int i = 0; i < 4; i++)
                for (int k : {1, 9}) {
                    string t = s;
                    t[i] = (t[i] - '0' + k) % 10 + '0';
                    if (back.count(t)) return step;
                    if (!dead.count(t) && !seen.count(t)) { seen.insert(t); nxt.insert(t); }
                }
        front = nxt;
    }
    return -1;
}`,
        java: `int openLock(String[] deadends, String target) {
    Set<String> dead = new HashSet<>(Arrays.asList(deadends));
    if (dead.contains("0000")) return -1;
    if (target.equals("0000")) return 0;
    Set<String> front = new HashSet<>(List.of("0000")), back = new HashSet<>(List.of(target));
    Set<String> seen = new HashSet<>(List.of("0000", target));
    for (int step = 1; !front.isEmpty() && !back.isEmpty(); step++) {
        if (front.size() > back.size()) { Set<String> tmp = front; front = back; back = tmp; }
        Set<String> nxt = new HashSet<>();
        for (String s : front) {
            char[] c = s.toCharArray();
            for (int i = 0; i < 4; i++) {
                char orig = c[i];
                for (int k : new int[]{1, 9}) {
                    c[i] = (char) ((orig - '0' + k) % 10 + '0');
                    String t = new String(c);
                    if (back.contains(t)) return step;
                    if (!dead.contains(t) && seen.add(t)) nxt.add(t);
                }
                c[i] = orig;
            }
        }
        front = nxt;
    }
    return -1;
}`,
        javascript: `function openLock(deadends, target) {
  const dead = new Set(deadends);
  if (dead.has('0000')) return -1;
  if (target === '0000') return 0;
  let front = new Set(['0000']), back = new Set([target]);
  const seen = new Set(['0000', target]);
  for (let step = 1; front.size && back.size; step++) {
    if (front.size > back.size) [front, back] = [back, front];
    const nxt = new Set();
    for (const s of front)
      for (let i = 0; i < 4; i++)
        for (const k of [1, 9]) {
          const t = s.slice(0, i) + ((+s[i] + k) % 10) + s.slice(i + 1);
          if (back.has(t)) return step;
          if (!dead.has(t) && !seen.has(t)) {
            seen.add(t);
            nxt.add(t);
          }
        }
    front = nxt;
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: ['忘了檢查起點 "0000" 本身就是死亡組合', '9 往上轉應該變 0、0 往下轉應該變 9:用 `(x ± 1) % 10` 時負數要先加 10', '用 DFS 找最短路徑:DFS 不保證最短'],
  check: {
    kind: 'fn',
    fn: 'openLock',
    cases: [
      { args: [DEAD, TARGET], out: 6 },
      { args: [['8888'], '0009'], out: 1 },
      { args: [['8887', '8889', '8878', '8898', '8788', '8988', '7888', '9888'], '8888'], out: -1 },
      { args: [['0000'], '8888'], out: -1 },
      { args: [[], '0000'], out: 0 },
    ],
  },
}

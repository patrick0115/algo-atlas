import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 355. Design Twitter

// [使用者, 推文 id],依時間先後
const POSTS: [number, number][] = [
  [1, 5],
  [2, 6],
  [1, 3],
  [3, 9],
  [2, 8],
  [3, 2],
]
const FOLLOWS: Record<number, number[]> = { 1: [2, 3] }

function scanFig(): FigStep[] {
  const ids = POSTS.map(([u, t]) => `u${u}:${t}`)
  const want = new Set([1, ...FOLLOWS[1]])
  const out: FigStep[] = [
    { note: '最簡單的存法:所有推文依時間放在同一條清單(右邊最新)。getNewsFeed(1) 時從最新往回看,只挑「使用者 1 自己或他追蹤的人」發的,湊滿 10 則就停', views: [arr(ids, { label: '全部推文(右邊最新)' }), kv([[1, `追蹤 ${FOLLOWS[1].join('、')}`]], 'follows')] },
  ]
  const got: number[] = []
  for (let i = POSTS.length - 1; i >= 0; i--) {
    const ok = want.has(POSTS[i][0])
    if (ok) got.push(POSTS[i][1])
    out.push({ note: `看推文 ${POSTS[i][1]}(使用者 ${POSTS[i][0]}):${ok ? '要 → 收進動態' : '不要'}`, views: [arr(ids, { label: '全部推文', highlight: ok ? [i] : [], compare: ok ? [] : [i] }), arr(got, { label: '動態(新 → 舊)' })] })
  }
  return out
}

function mergeFig(): FigStep[] {
  const per: Record<number, [number, number][]> = {}
  POSTS.forEach(([u, t], time) => (per[u] ??= []).push([time, t]))
  const users = [1, ...FOLLOWS[1]]
  const ptr: Record<number, number> = Object.fromEntries(users.map((u) => [u, per[u].length - 1]))
  const views = (hl?: number) =>
    users.map((u) => arr(per[u].map(([tm, t]) => `t${tm}:${t}`), { label: `使用者 ${u} 的推文(右邊最新)`, highlight: hl === u ? [ptr[u]] : [], dim: per[u].map((_, i) => i).filter((i) => i > ptr[u]) }))
  const out: FigStep[] = [{ note: '每個人的推文各自存一條清單(本身就依時間排好)。動態 = 把「自己 + 追蹤的人」這幾條清單**從尾巴往前合併**,用最大堆每次拿最新的一則', views: views() }]
  const got: number[] = []
  for (;;) {
    const cands = users.filter((u) => ptr[u] >= 0)
    if (!cands.length || got.length === 10) break
    const best = cands.reduce((a, b) => (per[a][ptr[a]][0] > per[b][ptr[b]][0] ? a : b))
    got.push(per[best][ptr[best]][1])
    out.push({ note: `堆裡有每條清單「目前最新的一則」:${cands.map((u) => `t${per[u][ptr[u]][0]}`).join('、')}。最新的是使用者 ${best} 的推文 ${per[best][ptr[best]][1]} → 拿出來,換成他的下一則`, views: [...views(best), arr(got, { label: '動態(新 → 舊)' })] })
    ptr[best]--
  }
  return out
}

export const q0355: Solution = {
  id: 355,
  plain: '做一個迷你版推特:可以發文、追蹤 / 取消追蹤別人,還要能看「動態牆」—— 自己和追蹤對象最新的 10 則推文,越新的排越前面。',
  statement:
    '設計 `Twitter`:`postTweet(userId, tweetId)` 發文;`getNewsFeed(userId)` 回傳最近 10 則推文 id(來自自己和追蹤的人,由新到舊);`follow(a, b)` a 追蹤 b;`unfollow(a, b)` 取消追蹤。',
  examples: [
    {
      input: 'postTweet(1,5)、getNewsFeed(1)、follow(1,2)、postTweet(2,6)、getNewsFeed(1)、unfollow(1,2)、getNewsFeed(1)',
      output: '[5]、[6,5]、[5]',
    },
  ],
  constraints: ['使用者、推文 id 最多 500 / 10⁴,總呼叫 3·10⁴ 次', '同一個 tweetId 只會發一次', '不能追蹤自己(取消追蹤自己也不會發生)'],
  insight: [
    '需要記三樣東西:每個人的推文(帶時間)、每個人追蹤了誰、一個全域時鐘(判斷誰比較新)',
    '動態牆 = 好幾條「已經依時間排好」的推文清單,合併後取最新 10 則 —— 這是**合併 k 條有序清單**(23 題)的縮小版',
    '最直接:全部推文放一條清單,從最新的往回掃。推文很多時要掃很久',
    '更好:每人一條清單,用最大堆把這幾條從尾巴合併,只拿 10 則就停',
  ],
  approaches: [
    {
      name: '全域推文清單,從最新往回掃',
      idea: '所有推文依時間存在同一條清單。getNewsFeed 從尾巴往前,挑出自己或追蹤對象的推文,湊滿 10 則就停。',
      steps: ['`postTweet`:`tweets.append((user, id))`', '`follow` / `unfollow`:更新 `following[a]` 這個 set', '`getNewsFeed(u)`:從 tweets 尾巴往前,作者是 u 或在 `following[u]` 裡的就收,收到 10 則停'],
      figure: { title: '使用者 1 追蹤 2、3 之後 getNewsFeed(1)', steps: scanFig() },
      complexity: { time: 'getNewsFeed O(T)', space: 'O(T + F)', why: 'T 是全部推文數。最壞要掃完所有推文才湊滿 10 則(例如追蹤的人都很少發文)。' },
      verdict: '最好寫,而且這題的資料量其實能過。但概念上不夠好:看動態的時間和「全站推文數」成正比。',
      code: {
        python: `class Twitter:
    def __init__(self):
        self.tweets = []                  # [(使用者, 推文 id)],越後面越新
        self.following = {}               # 使用者 -> set(追蹤的人)

    def postTweet(self, userId, tweetId):
        self.tweets.append((userId, tweetId))

    def getNewsFeed(self, userId):
        want = self.following.get(userId, set()) | {userId}
        res = []
        for u, t in reversed(self.tweets):
            if u in want:
                res.append(t)
                if len(res) == 10:
                    break
        return res

    def follow(self, followerId, followeeId):
        self.following.setdefault(followerId, set()).add(followeeId)

    def unfollow(self, followerId, followeeId):
        self.following.get(followerId, set()).discard(followeeId)`,
        c: `#define MAXU 501
typedef struct {
    int user[30001], tweet[30001], n;     // 全部推文,越後面越新
    bool follows[MAXU][MAXU];
} Twitter;

Twitter *twitterCreate() {
    return calloc(1, sizeof(Twitter));
}

void twitterPostTweet(Twitter *o, int userId, int tweetId) {
    o->user[o->n] = userId;
    o->tweet[o->n++] = tweetId;
}

int *twitterGetNewsFeed(Twitter *o, int userId, int *retSize) {
    int *res = malloc(10 * sizeof(int));
    *retSize = 0;
    for (int i = o->n - 1; i >= 0 && *retSize < 10; i--) {
        int u = o->user[i];
        if (u == userId || o->follows[userId][u]) res[(*retSize)++] = o->tweet[i];
    }
    return res;
}

void twitterFollow(Twitter *o, int followerId, int followeeId) { o->follows[followerId][followeeId] = true; }
void twitterUnfollow(Twitter *o, int followerId, int followeeId) { o->follows[followerId][followeeId] = false; }
void twitterFree(Twitter *o) { free(o); }`,
        cpp: `class Twitter {
    vector<pair<int, int>> tweets;          // (使用者, 推文 id),越後面越新
    unordered_map<int, unordered_set<int>> following;
public:
    Twitter() {}

    void postTweet(int userId, int tweetId) { tweets.push_back({userId, tweetId}); }

    vector<int> getNewsFeed(int userId) {
        vector<int> res;
        auto& f = following[userId];
        for (int i = (int)tweets.size() - 1; i >= 0 && res.size() < 10; i--) {
            int u = tweets[i].first;
            if (u == userId || f.count(u)) res.push_back(tweets[i].second);
        }
        return res;
    }

    void follow(int a, int b) { following[a].insert(b); }
    void unfollow(int a, int b) { following[a].erase(b); }
};`,
        java: `class Twitter {
    private final List<int[]> tweets = new ArrayList<>();     // {使用者, 推文 id},越後面越新
    private final Map<Integer, Set<Integer>> following = new HashMap<>();

    public Twitter() {}

    public void postTweet(int userId, int tweetId) { tweets.add(new int[]{userId, tweetId}); }

    public List<Integer> getNewsFeed(int userId) {
        Set<Integer> f = following.getOrDefault(userId, Set.of());
        List<Integer> res = new ArrayList<>();
        for (int i = tweets.size() - 1; i >= 0 && res.size() < 10; i--) {
            int u = tweets.get(i)[0];
            if (u == userId || f.contains(u)) res.add(tweets.get(i)[1]);
        }
        return res;
    }

    public void follow(int a, int b) { following.computeIfAbsent(a, k -> new HashSet<>()).add(b); }
    public void unfollow(int a, int b) { following.getOrDefault(a, new HashSet<>()).remove(b); }
}`,
        javascript: `class Twitter {
  constructor() {
    this.tweets = [];                     // [使用者, 推文 id],越後面越新
    this.following = new Map();
  }

  postTweet(userId, tweetId) {
    this.tweets.push([userId, tweetId]);
  }

  getNewsFeed(userId) {
    const f = this.following.get(userId) ?? new Set();
    const res = [];
    for (let i = this.tweets.length - 1; i >= 0 && res.length < 10; i--) {
      const [u, t] = this.tweets[i];
      if (u === userId || f.has(u)) res.push(t);
    }
    return res;
  }

  follow(a, b) {
    if (!this.following.has(a)) this.following.set(a, new Set());
    this.following.get(a).add(b);
  }

  unfollow(a, b) {
    this.following.get(a)?.delete(b);
  }
}`,
      },
    },
    {
      name: '每人一條推文清單 + 最大堆合併',
      idea: '每個人的推文各自存成 `(時間, id)` 的清單。getNewsFeed:把自己和每個追蹤對象「最新的一則」放進最大堆,每次拿出最新的,再把那個人的下一則(較舊的)放進堆,拿滿 10 則就停。',
      steps: ['`time` 全域遞增;`posts[u].append((time, id))`', '`getNewsFeed(u)`:對 `{u} ∪ following[u]` 每個有推文的人,把最後一則 `(time, id, 人, 位置)` 放進最大堆', '`while 堆不空 and len(res) < 10`:拿出最新的,收進 res;那個人還有更舊的就放進堆'],
      figure: { title: '使用者 1 追蹤 2、3 之後 getNewsFeed(1)', steps: mergeFig() },
      complexity: { time: 'getNewsFeed O(F + 10 log F)', space: 'O(T + F)', why: 'F 是追蹤的人數。建堆 O(F),之後最多拿 10 次,每次 O(log F)。和全站推文數無關。JS / C 版每次線性掃所有人取代堆,為 O(10·F)。' },
      verdict: '標準解,本質是 [23. Merge k Sorted Lists](#/q/23)。「只要前 10 個」讓堆的操作次數很少。',
      code: {
        python: `import heapq

class Twitter:
    def __init__(self):
        self.time = 0
        self.posts = {}                   # 使用者 -> [(時間, 推文 id)]
        self.following = {}

    def postTweet(self, userId, tweetId):
        self.posts.setdefault(userId, []).append((self.time, tweetId))
        self.time += 1

    def getNewsFeed(self, userId):
        h = []
        for u in self.following.get(userId, set()) | {userId}:
            p = self.posts.get(u)
            if p:
                i = len(p) - 1            # 每個人最新的一則
                heapq.heappush(h, (-p[i][0], p[i][1], u, i))
        res = []
        while h and len(res) < 10:
            _, tid, u, i = heapq.heappop(h)
            res.append(tid)
            if i > 0:                     # 換成這個人的下一則(更舊)
                t, nid = self.posts[u][i - 1]
                heapq.heappush(h, (-t, nid, u, i - 1))
        return res

    def follow(self, followerId, followeeId):
        self.following.setdefault(followerId, set()).add(followeeId)

    def unfollow(self, followerId, followeeId):
        self.following.get(followerId, set()).discard(followeeId)`,
        c: `#define MAXU 501
typedef struct {
    int time;
    int *pt[MAXU], *pid[MAXU], cnt[MAXU], cap[MAXU];   // 每個人的推文:時間、id
    bool follows[MAXU][MAXU];
} Twitter;

Twitter *twitterCreate() {
    return calloc(1, sizeof(Twitter));
}

void twitterPostTweet(Twitter *o, int u, int tweetId) {
    if (o->cnt[u] == o->cap[u]) {
        o->cap[u] = o->cap[u] ? o->cap[u] * 2 : 4;
        o->pt[u] = realloc(o->pt[u], o->cap[u] * sizeof(int));
        o->pid[u] = realloc(o->pid[u], o->cap[u] * sizeof(int));
    }
    o->pt[u][o->cnt[u]] = o->time++;
    o->pid[u][o->cnt[u]++] = tweetId;
}

int *twitterGetNewsFeed(Twitter *o, int userId, int *retSize) {
    // 每個相關的人一個指標,指向他還沒拿的最新一則;人數最多 500,每次挑最大的(簡化版的「堆」)
    int pos[MAXU];
    for (int u = 0; u < MAXU; u++) pos[u] = (u == userId || o->follows[userId][u]) ? o->cnt[u] - 1 : -1;
    int *res = malloc(10 * sizeof(int));
    *retSize = 0;
    while (*retSize < 10) {
        int best = -1;
        for (int u = 0; u < MAXU; u++)
            if (pos[u] >= 0 && (best < 0 || o->pt[u][pos[u]] > o->pt[best][pos[best]])) best = u;
        if (best < 0) break;
        res[(*retSize)++] = o->pid[best][pos[best]--];
    }
    return res;
}

void twitterFollow(Twitter *o, int a, int b) { o->follows[a][b] = true; }
void twitterUnfollow(Twitter *o, int a, int b) { o->follows[a][b] = false; }
void twitterFree(Twitter *o) {
    for (int u = 0; u < MAXU; u++) { free(o->pt[u]); free(o->pid[u]); }
    free(o);
}`,
        cpp: `class Twitter {
    int time = 0;
    unordered_map<int, vector<pair<int, int>>> posts;   // 使用者 -> (時間, 推文 id)
    unordered_map<int, unordered_set<int>> following;
public:
    Twitter() {}

    void postTweet(int userId, int tweetId) { posts[userId].push_back({time++, tweetId}); }

    vector<int> getNewsFeed(int userId) {
        // (時間, 使用者, 位置) 的最大堆
        priority_queue<tuple<int, int, int>> pq;
        auto add = [&](int u) {
            auto it = posts.find(u);
            if (it != posts.end() && !it->second.empty()) {
                int i = it->second.size() - 1;
                pq.push({it->second[i].first, u, i});
            }
        };
        add(userId);
        for (int u : following[userId]) add(u);
        vector<int> res;
        while (!pq.empty() && res.size() < 10) {
            auto [t, u, i] = pq.top(); pq.pop();
            res.push_back(posts[u][i].second);
            if (i > 0) pq.push({posts[u][i - 1].first, u, i - 1});
        }
        return res;
    }

    void follow(int a, int b) { following[a].insert(b); }
    void unfollow(int a, int b) { following[a].erase(b); }
};`,
        java: `class Twitter {
    private int time = 0;
    private final Map<Integer, List<int[]>> posts = new HashMap<>();   // 使用者 -> {時間, 推文 id}
    private final Map<Integer, Set<Integer>> following = new HashMap<>();

    public Twitter() {}

    public void postTweet(int userId, int tweetId) {
        posts.computeIfAbsent(userId, k -> new ArrayList<>()).add(new int[]{time++, tweetId});
    }

    public List<Integer> getNewsFeed(int userId) {
        // {時間, 使用者, 位置},時間大的先出來
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> b[0] - a[0]);
        Set<Integer> users = new HashSet<>(following.getOrDefault(userId, Set.of()));
        users.add(userId);
        for (int u : users) {
            List<int[]> p = posts.get(u);
            if (p != null && !p.isEmpty()) pq.offer(new int[]{p.get(p.size() - 1)[0], u, p.size() - 1});
        }
        List<Integer> res = new ArrayList<>();
        while (!pq.isEmpty() && res.size() < 10) {
            int[] top = pq.poll();
            List<int[]> p = posts.get(top[1]);
            res.add(p.get(top[2])[1]);
            if (top[2] > 0) pq.offer(new int[]{p.get(top[2] - 1)[0], top[1], top[2] - 1});
        }
        return res;
    }

    public void follow(int a, int b) { following.computeIfAbsent(a, k -> new HashSet<>()).add(b); }
    public void unfollow(int a, int b) { following.getOrDefault(a, new HashSet<>()).remove(b); }
}`,
        javascript: `class Twitter {
  constructor() {
    this.time = 0;
    this.posts = new Map();               // 使用者 -> [[時間, 推文 id]]
    this.following = new Map();
  }

  postTweet(userId, tweetId) {
    if (!this.posts.has(userId)) this.posts.set(userId, []);
    this.posts.get(userId).push([this.time++, tweetId]);
  }

  getNewsFeed(userId) {
    const users = new Set(this.following.get(userId) ?? []);
    users.add(userId);
    // 每個人一個指標指向他最新的一則;追蹤的人不多,每次掃一遍挑最新的(等同堆的作用)
    const ptr = new Map();
    for (const u of users) {
      const p = this.posts.get(u);
      if (p && p.length) ptr.set(u, p.length - 1);
    }
    const res = [];
    while (res.length < 10 && ptr.size) {
      let best = null;
      for (const [u, i] of ptr)
        if (best === null || this.posts.get(u)[i][0] > this.posts.get(best)[ptr.get(best)][0]) best = u;
      const i = ptr.get(best);
      res.push(this.posts.get(best)[i][1]);
      if (i > 0) ptr.set(best, i - 1);
      else ptr.delete(best);
    }
    return res;
  }

  follow(a, b) {
    if (!this.following.has(a)) this.following.set(a, new Set());
    this.following.get(a).add(b);
  }

  unfollow(a, b) {
    this.following.get(a)?.delete(b);
  }
}`,
      },
    },
  ],
  pitfalls: [
    '動態牆忘了包含**自己**的推文',
    '用推文 id 判斷新舊:id 不是依時間遞增的,要自己維護一個時間戳記',
    '同一個人被追蹤兩次時重複加入:用 set 存追蹤名單',
    'unfollow 一個還沒追蹤的人,或使用者從來沒出現過:要能正常處理不噴錯',
  ],
  followUp: [{ q: '真實的系統怎麼做?', a: '「拉」(看動態時才合併,這題的做法)vs「推」(發文時就寫進每個粉絲的動態);名人粉絲太多時用拉、一般人用推,混合使用。' }],
  check: {
    kind: 'class',
    cls: 'Twitter',
    cases: [
      {
        ops: ['Twitter', 'postTweet', 'getNewsFeed', 'follow', 'postTweet', 'getNewsFeed', 'unfollow', 'getNewsFeed'],
        args: [[], [1, 5], [1], [1, 2], [2, 6], [1], [1, 2], [1]],
        out: [null, null, [5], null, null, [6, 5], null, [5]],
      },
      {
        ops: ['Twitter', ...POSTS.map(() => 'postTweet'), 'follow', 'follow', 'getNewsFeed', 'getNewsFeed', 'unfollow', 'getNewsFeed'],
        args: [[], ...POSTS.map((p) => [...p]), [1, 2], [1, 3], [1], [2], [1, 3], [1]],
        out: [null, ...POSTS.map(() => null), null, null, [2, 8, 9, 3, 6, 5], [8, 6], null, [8, 3, 6, 5]],
      },
      {
        ops: ['Twitter', ...Array.from({ length: 11 }, () => 'postTweet'), 'getNewsFeed'],
        args: [[], ...Array.from({ length: 11 }, (_, i) => [1, i + 100]), [1]],
        out: [null, ...Array.from({ length: 11 }, () => null), [110, 109, 108, 107, 106, 105, 104, 103, 102, 101]],
      },
      {
        ops: ['Twitter', 'follow', 'getNewsFeed', 'unfollow', 'getNewsFeed'],
        args: [[], [1, 2], [1], [3, 4], [3]],
        out: [null, null, [], null, []],
      },
    ],
  },
}

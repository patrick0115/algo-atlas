import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1472. Design Browser History

function arrFig(): FigStep[] {
  return [
    { note: '用一個陣列存瀏覽紀錄,cur 指著目前頁面,last 指著「最後一個有效的頁面」', views: [arr(['leetcode', 'google', 'facebook', 'youtube'], { label: '紀錄', pointers: [{ name: 'cur', index: 3 }, { name: 'last', index: 3, color: 'b' }] })] },
    { note: 'back(1) → cur 往左 1 格(google…facebook);back(1) 再往左 → google。只移動指標,紀錄不刪', views: [arr(['leetcode', 'google', 'facebook', 'youtube'], { label: '紀錄', highlight: [1], pointers: [{ name: 'cur', index: 1 }, { name: 'last', index: 3, color: 'b' }] })] },
    { note: 'visit("linkedin"):寫到 cur + 1,而且 last = cur(後面的 facebook、youtube 不能再 forward 了)。直接覆寫,不用真的刪除', views: [arr(['leetcode', 'google', 'linkedin', 'youtube'], { label: '紀錄', highlight: [2], dim: [3], pointers: [{ name: 'cur', index: 2 }, { name: 'last', index: 2, color: 'b' }] })] },
    { note: 'forward(2):最多只能走到 last → 停在 linkedin。back(7):最多退到 0 → leetcode。每個操作都是 O(1)', views: [arr(['leetcode', 'google', 'linkedin'], { label: '有效紀錄', highlight: [0], pointers: [{ name: 'cur', index: 0 }] })] },
  ]
}

function stackFig(): FigStep[] {
  return [
    { note: '兩個堆疊的版本:back 堆疊放「目前頁面和它之前的」,forward 堆疊放「可以往前走的」', views: [arr(['leetcode', 'google', 'facebook'], { label: 'back 堆疊(頂 = 目前頁面)' }), arr(['youtube'], { label: 'forward 堆疊' })] },
    { note: 'back(steps):從 back 堆疊 pop 到 forward 堆疊(至少留一個);forward 反過來;visit 時清空 forward 堆疊。每步 O(1),back / forward 是 O(steps)', views: [arr(['leetcode', 'google'], { label: 'back 堆疊' }), arr(['youtube', 'facebook'], { label: 'forward 堆疊' })] },
  ]
}

export const q1472: Solution = {
  id: 1472,
  plain: '做一個瀏覽器的「上一頁 / 下一頁」功能。從首頁開始;去新網頁時,原本「下一頁」能去的紀錄全部作廢;上一頁、下一頁可以一次走好幾步,但不能超過紀錄的頭尾。',
  statement: '設計類別 `BrowserHistory`:建構子 `BrowserHistory(homepage)`;`visit(url)` 從目前頁面前往 url,並清除所有可前進的紀錄;`back(steps)` 最多後退 steps 步並回傳目前網址;`forward(steps)` 最多前進 steps 步並回傳目前網址。',
  examples: [
    { input: '["BrowserHistory","visit","visit","visit","back","back","forward","visit","forward","back","back"]\n[["leetcode.com"],["google.com"],["facebook.com"],["youtube.com"],[1],[1],[1],["linkedin.com"],[2],[2],[7]]', output: '[null,null,null,null,"facebook.com","google.com","facebook.com",null,"linkedin.com","google.com","leetcode.com"]' },
  ],
  constraints: ['最多 5000 次呼叫,steps ≤ 100'],
  insight: ['紀錄是一條線,目前位置在線上某處', 'visit 會砍掉目前位置之後的紀錄 → 用陣列 + 指標:不用真的刪,只要記「有效的最後一格」', '也可以用兩個堆疊表示「後面的」和「前面的」'],
  approaches: [
    {
      name: '陣列 + 兩個指標',
      idea: '`hist` 陣列、`cur` 目前位置、`last` 最後有效位置;visit 寫到 `cur + 1` 並讓 `last = cur`。',
      steps: ['建構:`hist = [homepage]`、`cur = last = 0`', 'visit:`cur += 1`;寫入 `hist[cur]`(超出長度就 append);`last = cur`', 'back:`cur = max(0, cur − steps)`', 'forward:`cur = min(last, cur + steps)`'],
      figure: { title: '範例操作', steps: arrFig() },
      complexity: { time: '每個操作 O(1)', space: 'O(visit 次數)', why: '只移動指標,舊紀錄直接覆寫。' },
      verdict: '最推薦。「刪除後面的全部」用一個 last 指標就做到了,不用真的刪。',
      code: {
        python: `class BrowserHistory:
    def __init__(self, homepage):
        self.hist = [homepage]
        self.cur = self.last = 0

    def visit(self, url):
        self.cur += 1
        if self.cur == len(self.hist):
            self.hist.append(url)
        else:
            self.hist[self.cur] = url         # 覆寫,不用刪
        self.last = self.cur                  # 之後的紀錄都作廢

    def back(self, steps):
        self.cur = max(0, self.cur - steps)
        return self.hist[self.cur]

    def forward(self, steps):
        self.cur = min(self.last, self.cur + steps)
        return self.hist[self.cur]`,
        c: `typedef struct {
    char **h;
    int cur, last, cap;
} BrowserHistory;

BrowserHistory *browserHistoryCreate(char *homepage) {
    BrowserHistory *o = malloc(sizeof(BrowserHistory));
    o->cap = 16;
    o->h = malloc(o->cap * sizeof(char *));
    o->h[0] = strdup(homepage);
    o->cur = o->last = 0;
    return o;
}

void browserHistoryVisit(BrowserHistory *o, char *url) {
    if (++o->cur == o->cap) o->h = realloc(o->h, (o->cap *= 2) * sizeof(char *));
    if (o->cur <= o->last) free(o->h[o->cur]);   // 這格原本有舊紀錄
    o->h[o->cur] = strdup(url);
    for (int i = o->cur + 1; i <= o->last; i++) free(o->h[i]);   // 作廢的紀錄
    o->last = o->cur;
}

char *browserHistoryBack(BrowserHistory *o, int steps) {
    o->cur = o->cur - steps < 0 ? 0 : o->cur - steps;
    return o->h[o->cur];
}

char *browserHistoryForward(BrowserHistory *o, int steps) {
    o->cur = o->cur + steps > o->last ? o->last : o->cur + steps;
    return o->h[o->cur];
}

void browserHistoryFree(BrowserHistory *o) {
    for (int i = 0; i <= o->last; i++) free(o->h[i]);
    free(o->h); free(o);
}`,
        cpp: `class BrowserHistory {
    vector<string> h;
    int cur = 0, last = 0;
public:
    BrowserHistory(string homepage) : h{homepage} {}

    void visit(string url) {
        if (++cur == (int)h.size()) h.push_back(url);
        else h[cur] = url;
        last = cur;
    }

    string back(int steps) { cur = max(0, cur - steps); return h[cur]; }
    string forward(int steps) { cur = min(last, cur + steps); return h[cur]; }
};`,
        java: `class BrowserHistory {
    private final List<String> h = new ArrayList<>();
    private int cur = 0, last = 0;

    public BrowserHistory(String homepage) { h.add(homepage); }

    public void visit(String url) {
        if (++cur == h.size()) h.add(url);
        else h.set(cur, url);
        last = cur;
    }

    public String back(int steps) { cur = Math.max(0, cur - steps); return h.get(cur); }
    public String forward(int steps) { cur = Math.min(last, cur + steps); return h.get(cur); }
}`,
        javascript: `class BrowserHistory {
  constructor(homepage) {
    this.h = [homepage];
    this.cur = this.last = 0;
  }

  visit(url) {
    this.h[++this.cur] = url;
    this.last = this.cur;
  }

  back(steps) {
    this.cur = Math.max(0, this.cur - steps);
    return this.h[this.cur];
  }

  forward(steps) {
    this.cur = Math.min(this.last, this.cur + steps);
    return this.h[this.cur];
  }
}`,
      },
    },
    {
      name: '兩個堆疊',
      idea: '`back` 堆疊的頂是目前頁面;後退就搬到 `fwd` 堆疊,前進搬回來;visit 清空 fwd。',
      steps: ['建構:`back = [homepage]`、`fwd = []`', 'visit:`back.append(url)`、`fwd.clear()`', 'back:`while steps and len(back) > 1`:`fwd.append(back.pop())`', 'forward:`while steps and fwd`:`back.append(fwd.pop())`;回傳 `back[-1]`'],
      figure: { title: '範例操作', steps: stackFig() },
      complexity: { time: 'visit O(1)(清空不算),back / forward O(steps)', space: 'O(visit 次數)', why: '每走一步搬一個元素。' },
      verdict: '很貼近直覺(上一頁、下一頁各一疊),但 back / forward 要一步一步搬。',
      code: {
        python: `class BrowserHistory:
    def __init__(self, homepage):
        self.back_st, self.fwd = [homepage], []

    def visit(self, url):
        self.back_st.append(url)
        self.fwd.clear()                      # 下一頁的紀錄全部作廢

    def back(self, steps):
        while steps and len(self.back_st) > 1:   # 至少留著目前頁面
            self.fwd.append(self.back_st.pop())
            steps -= 1
        return self.back_st[-1]

    def forward(self, steps):
        while steps and self.fwd:
            self.back_st.append(self.fwd.pop())
            steps -= 1
        return self.back_st[-1]`,
        c: `typedef struct {
    char *b[5005], *f[5005];
    int nb, nf;
} BrowserHistory;

BrowserHistory *browserHistoryCreate(char *homepage) {
    BrowserHistory *o = calloc(1, sizeof(BrowserHistory));
    o->b[o->nb++] = strdup(homepage);
    return o;
}

void browserHistoryVisit(BrowserHistory *o, char *url) {
    o->b[o->nb++] = strdup(url);
    while (o->nf) free(o->f[--o->nf]);
}

char *browserHistoryBack(BrowserHistory *o, int steps) {
    while (steps-- && o->nb > 1) o->f[o->nf++] = o->b[--o->nb];
    return o->b[o->nb - 1];
}

char *browserHistoryForward(BrowserHistory *o, int steps) {
    while (steps-- && o->nf) o->b[o->nb++] = o->f[--o->nf];
    return o->b[o->nb - 1];
}

void browserHistoryFree(BrowserHistory *o) {
    while (o->nb) free(o->b[--o->nb]);
    while (o->nf) free(o->f[--o->nf]);
    free(o);
}`,
        cpp: `class BrowserHistory {
    vector<string> b, f;
public:
    BrowserHistory(string homepage) : b{homepage} {}

    void visit(string url) { b.push_back(url); f.clear(); }

    string back(int steps) {
        while (steps-- && b.size() > 1) { f.push_back(b.back()); b.pop_back(); }
        return b.back();
    }

    string forward(int steps) {
        while (steps-- && !f.empty()) { b.push_back(f.back()); f.pop_back(); }
        return b.back();
    }
};`,
        java: `class BrowserHistory {
    private final Deque<String> b = new ArrayDeque<>(), f = new ArrayDeque<>();

    public BrowserHistory(String homepage) { b.push(homepage); }

    public void visit(String url) { b.push(url); f.clear(); }

    public String back(int steps) {
        while (steps-- > 0 && b.size() > 1) f.push(b.pop());
        return b.peek();
    }

    public String forward(int steps) {
        while (steps-- > 0 && !f.isEmpty()) b.push(f.pop());
        return b.peek();
    }
}`,
        javascript: `class BrowserHistory {
  constructor(homepage) {
    this.b = [homepage];
    this.f = [];
  }

  visit(url) {
    this.b.push(url);
    this.f = [];
  }

  back(steps) {
    while (steps-- > 0 && this.b.length > 1) this.f.push(this.b.pop());
    return this.b[this.b.length - 1];
  }

  forward(steps) {
    while (steps-- > 0 && this.f.length) this.b.push(this.f.pop());
    return this.b[this.b.length - 1];
  }
}`,
      },
    },
  ],
  pitfalls: ['visit 後忘了作廢「下一頁」:之後 forward 會走到舊的紀錄', 'back 退到 0 以下、forward 超過最後一頁', '兩個堆疊版 back 時把最後一頁(目前頁面)也搬走了'],
  check: {
    kind: 'class',
    cls: 'BrowserHistory',
    cases: [
      {
        ops: ['BrowserHistory', 'visit', 'visit', 'visit', 'back', 'back', 'forward', 'visit', 'forward', 'back', 'back'],
        args: [['leetcode.com'], ['google.com'], ['facebook.com'], ['youtube.com'], [1], [1], [1], ['linkedin.com'], [2], [2], [7]],
        out: [null, null, null, null, 'facebook.com', 'google.com', 'facebook.com', null, 'linkedin.com', 'google.com', 'leetcode.com'],
      },
      { ops: ['BrowserHistory', 'back', 'forward', 'visit', 'back', 'forward'], args: [['a.com'], [3], [3], ['b.com'], [1], [5]], out: [null, 'a.com', 'a.com', null, 'a.com', 'b.com'] },
    ],
  },
}

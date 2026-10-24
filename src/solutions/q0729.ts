import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const scanFig: FigStep[] = [
  { note: '日曆一開始沒有行程。預約 [10,20) 沒有衝突，存入日曆並回傳 true。', views: [arr(['10–20'], { label: '已預約', done: [0] })] },
  { note: '嘗試 [15,25)：它的起點 15 < 舊行程終點 20，且舊起點 10 < 新終點 25，兩段重疊。', views: [arr(['10–20', '15–25'], { label: '既有 / 新行程', compare: [0, 1] })] },
  { note: '拒絕 [15,25)，日曆仍只有 [10,20)。', views: [arr(['10–20'], { label: '已預約', done: [0] })] },
  { note: '再試 [20,30)：新起點剛好等於舊終點，不重疊，可加入並回傳 true。', views: [arr(['10–20', '20–30'], { label: '已預約', done: [0, 1] })] },
]
const sortedFig: FigStep[] = [
  { note: '已排好的日曆先有 [10,20)。', views: [arr(['10–20'], { label: '依起點排序' })] },
  { note: '要插入 [15,25)，二分找到應放在 [10,20) 後面；只要檢查左鄰居就知道兩者重疊。', views: [arr(['10–20', '15–25'], { label: '左鄰 / 待插', compare: [0, 1] })] },
  { note: '拒絕後改插 [20,30)，仍放在 [10,20) 後面；左鄰終點 20 不大於新起點 20。', views: [arr(['10–20', '20–30'], { label: '左鄰 / 待插', highlight: [1] })] },
  { note: '右邊沒有鄰居，插入成功。排序不變，下次也只需檢查插入位置附近。', views: [arr(['10–20', '20–30'], { label: '已預約', done: [0, 1] })] },
]

export const q0729: Solution = {
  id: 729,
  plain: '做一個預約日曆；新時段若撞到已預約時段，就拒絕，否則收下。',
  statement: '實作 MyCalendar。book(start,end) 嘗試預約半開區間 [start,end)，與既有預約有交集就回傳 false，否則存入並回傳 true。',
  examples: [{ input: 'book(10,20), book(15,25), book(20,30)', output: 'true, false, true', note: '20 是第一段的結尾，不屬於 [10,20)。' }],
  constraints: ['最多 1000 次預約；0 ≤ start < end。', '半開區間的端點相接不算衝突。'],
  insight: ['兩個半開區間 [a,b) 與 [c,d) 重疊，當且僅當 a<d 且 c<b。', '直接掃每個既有行程即可；若依起點排序，可用 [[p:binary-search]] 找插入位置，只檢查左右鄰居。'],
  approaches: [
    {
      name: '逐筆檢查既有預約', idea: '每次預約前掃所有已存區間；有交集就拒絕，否則加入。',
      steps: ['日曆先設空。', '對每個既有 [a,b)，檢查 start<b 且 a<end。', '有重疊回傳 false；全部通過才存入並回傳 true。'],
      figure: { title: '依序 book(10,20)、book(15,25)、book(20,30)', steps: scanFig },
      complexity: { time: '每次 O(n)', space: 'O(n)', why: '第 n 次預約最多比較 n 筆；日曆儲存成功預約。' },
      verdict: '在最多 1000 次呼叫的限制下很實用，也最不容易寫錯。',
      code: {
        python: `class MyCalendar:
    def __init__(self):
        self.events = []

    def book(self, start, end):
        for left, right in self.events:
            if start < right and left < end:
                return False  # 半開區間真的重疊
        self.events.append((start, end))
        return True`,
        c: `typedef struct {
    int *starts;
    int *ends;
    int size;
    int capacity;
} MyCalendar;

MyCalendar *myCalendarCreate() {
    MyCalendar *calendar = malloc(sizeof(MyCalendar));
    calendar->size = 0;
    calendar->capacity = 8;
    calendar->starts = malloc(calendar->capacity * sizeof(int));
    calendar->ends = malloc(calendar->capacity * sizeof(int));
    return calendar;
}

bool myCalendarBook(MyCalendar *calendar, int start, int end) {
    for (int i = 0; i < calendar->size; i++) {
        if (start < calendar->ends[i] && calendar->starts[i] < end) {
            return false;
        }
    }
    if (calendar->size == calendar->capacity) {
        calendar->capacity *= 2;
        calendar->starts = realloc(calendar->starts, calendar->capacity * sizeof(int));
        calendar->ends = realloc(calendar->ends, calendar->capacity * sizeof(int));
    }
    calendar->starts[calendar->size] = start;
    calendar->ends[calendar->size] = end;
    calendar->size++;
    return true;
}

void myCalendarFree(MyCalendar *calendar) {
    free(calendar->starts);
    free(calendar->ends);
    free(calendar);
}`,
        cpp: `class MyCalendar {
    vector<pair<int, int>> events;

public:
    bool book(int start, int end) {
        for (const auto& event : events) {
            if (start < event.second && event.first < end) {
                return false;
            }
        }
        events.push_back({start, end});
        return true;
    }
};`,
        java: `class MyCalendar {
    private final List<int[]> events = new ArrayList<>();

    public boolean book(int start, int end) {
        for (int[] event : events) {
            if (start < event[1] && event[0] < end) {
                return false;
            }
        }
        events.add(new int[] {start, end});
        return true;
    }
}`,
        javascript: `class MyCalendar {
  constructor() {
    this.events = [];
  }

  book(start, end) {
    for (const [left, right] of this.events) {
      if (start < right && left < end) {
        return false;
      }
    }
    this.events.push([start, end]);
    return true;
  }
}`,
      },
    },
    {
      name: '排序後檢查相鄰預約', idea: '依起點排序，找新行程的插入點；只有左右鄰居可能與它重疊。',
      steps: ['用二分搜尋找第一個起點不小於 start 的位置。', '若左鄰終點 > start 或右鄰起點 < end，拒絕。', '否則在該位置插入。'],
      figure: { title: '依序 book(10,20)、book(15,25)、book(20,30)', steps: sortedFig },
      complexity: { time: '陣列版每次 O(n)；平衡樹版 O(log n)', space: 'O(n)', why: '陣列二分查詢 O(log n) 但插入搬移 O(n)；Java TreeMap 與 C++ map 插入為 O(log n)。' },
      verdict: '預約次數較多時，可改用有序映射避免線性掃描。',
      code: {
        python: `from bisect import bisect_left

class MyCalendar:
    def __init__(self):
        self.events = []

    def book(self, start, end):
        index = bisect_left(self.events, (start, end))
        if index > 0 and self.events[index - 1][1] > start:
            return False  # 左鄰居延伸進新區間
        if index < len(self.events) and self.events[index][0] < end:
            return False  # 新區間延伸進右鄰居
        self.events.insert(index, (start, end))
        return True`,
        c: `typedef struct {
    int *starts;
    int *ends;
    int size;
    int capacity;
} MyCalendar;

MyCalendar *myCalendarCreate() {
    MyCalendar *calendar = malloc(sizeof(MyCalendar));
    calendar->size = 0;
    calendar->capacity = 8;
    calendar->starts = malloc(calendar->capacity * sizeof(int));
    calendar->ends = malloc(calendar->capacity * sizeof(int));
    return calendar;
}

bool myCalendarBook(MyCalendar *calendar, int start, int end) {
    int low = 0;
    int high = calendar->size;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (calendar->starts[mid] < start) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    int index = low;
    if (index > 0 && calendar->ends[index - 1] > start) {
        return false;
    }
    if (index < calendar->size && calendar->starts[index] < end) {
        return false;
    }
    if (calendar->size == calendar->capacity) {
        calendar->capacity *= 2;
        calendar->starts = realloc(calendar->starts, calendar->capacity * sizeof(int));
        calendar->ends = realloc(calendar->ends, calendar->capacity * sizeof(int));
    }
    for (int i = calendar->size; i > index; i--) {
        calendar->starts[i] = calendar->starts[i - 1];
        calendar->ends[i] = calendar->ends[i - 1];
    }
    calendar->starts[index] = start;
    calendar->ends[index] = end;
    calendar->size++;
    return true;
}

void myCalendarFree(MyCalendar *calendar) {
    free(calendar->starts);
    free(calendar->ends);
    free(calendar);
}`,
        cpp: `class MyCalendar {
    map<int, int> events;

public:
    bool book(int start, int end) {
        auto next = events.lower_bound(start);
        if (next != events.end() && next->first < end) {
            return false;
        }
        if (next != events.begin()) {
            auto previous = prev(next);
            if (previous->second > start) {
                return false;
            }
        }
        events[start] = end;
        return true;
    }
};`,
        java: `class MyCalendar {
    private final TreeMap<Integer, Integer> events = new TreeMap<>();

    public boolean book(int start, int end) {
        Map.Entry<Integer, Integer> next = events.ceilingEntry(start);
        if (next != null && next.getKey() < end) {
            return false;
        }
        Map.Entry<Integer, Integer> previous = events.lowerEntry(start);
        if (previous != null && previous.getValue() > start) {
            return false;
        }
        events.put(start, end);
        return true;
    }
}`,
        javascript: `class MyCalendar {
  constructor() {
    this.events = [];
  }

  book(start, end) {
    let low = 0;
    let high = this.events.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.events[mid][0] < start) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    if (low > 0 && this.events[low - 1][1] > start) {
      return false;
    }
    if (low < this.events.length && this.events[low][0] < end) {
      return false;
    }
    this.events.splice(low, 0, [start, end]);
    return true;
  }
}`,
      },
    },
  ],
  pitfalls: ['[10,20) 與 [20,30) 不重疊；比較時要用嚴格小於或大於。', '預約失敗時不能把新區間寫進日曆。'],
  check: { kind: 'class', cls: 'MyCalendar', cases: [
    { ops: ['MyCalendar', 'book', 'book', 'book'], args: [[], [10, 20], [15, 25], [20, 30]], out: [null, true, false, true] },
    { ops: ['MyCalendar', 'book', 'book', 'book'], args: [[], [5, 10], [1, 5], [10, 15]], out: [null, true, true, true] },
  ] },
}

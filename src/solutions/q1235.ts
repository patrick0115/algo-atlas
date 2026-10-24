import { arr } from '../engine/helpers'
import { intervalsView } from './fig'
import type { Solution } from './types'

// 1235. Maximum Profit in Job Scheduling
const S = [1, 2, 3, 3]
const E = [3, 4, 5, 6]
const P = [50, 10, 40, 70]

export const q1235: Solution = {
  id: 1235,
  plain: '有許多工作各有開始、結束時間和報酬；時間不能重疊，求最多能賺多少。',
  statement: '第 i 份工作從 startTime[i] 到 endTime[i]，收入 profit[i]。同一時間只能做一份；某份結束的時刻可以接著開始下一份。求最大總收入。',
  examples: [{ input: 'startTime = [1,2,3,3], endTime = [3,4,5,6], profit = [50,10,40,70]', output: '120' }, { input: 'startTime = [1,2,3,4,6], endTime = [3,5,10,6,9], profit = [20,20,100,70,60]', output: '150' }],
  constraints: ['1 ≤ 工作數 ≤ 5×10⁴；時間與收入為正整數。'],
  insight: ['按結束時間排序後，對每份工作只有「選」或「不選」兩個決定。', '若選它，只能接上結束時間 ≤ 本工作開始時間的最後一份工作。', '用 [[p:binary-search]] 找相容前驅，再做 [[p:dp-1d]]。'],
  approaches: [
    {
      name: '結束時間排序加二分 DP',
      idea: 'dp[i] 表示前 i 份（按結束時間排序）工作能得到的最大收入。',
      steps: ['按結束時間排序工作。', '對第 i 份，二分找最後一個結束時間 ≤ 它開始時間的前驅。', 'dp[i] = max(不選的 dp[i−1], 選的 profit+dp[前驅])。'],
      figure: { title: '四份工作，時間與報酬見範例', steps: [
        { note: '按結束時間排好：[1,3] 收 50、[2,4] 收 10、[3,5] 收 40、[3,6] 收 70。', views: [intervalsView([[1, 3], [2, 4], [3, 5], [3, 6]], { rowLabels: ['50', '10', '40', '70'] })] },
        { note: '第一份 [1,3] 最好，dp[1]=50；第二份和它重疊，dp[2] 仍是 50。', views: [arr([0, 50, 50], { label: 'dp', highlight: [2] })] },
        { note: '[3,5] 可接在 [1,3] 後，收入 50+40=90，dp[3]=90。', views: [arr([0, 50, 50, 90], { label: 'dp', highlight: [3] })] },
        { note: '[3,6] 也能接 [1,3]，收入 50+70=120，勝過 90。', views: [arr([0, 50, 50, 90, 120], { label: 'dp', done: [4] })] },
      ] },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序及每份工作一次二分，儲存 DP。' },
      verdict: '大資料量的標準解。',
      code: {
        python: `from bisect import bisect_right

def jobScheduling(startTime, endTime, profit):
    jobs = sorted(zip(endTime, startTime, profit))
    ends = [end for end, _, _ in jobs]
    dp = [0] * (len(jobs) + 1)
    for i, (_, start, gain) in enumerate(jobs, 1):
        previous = bisect_right(ends, start, 0, i - 1)
        dp[i] = max(dp[i - 1], dp[previous] + gain)  # 接相容前驅
    return dp[-1]`,
        c: `typedef struct { int start; int end; int gain; } Job1235;

static int cmp1235(const void *a, const void *b) {
    const Job1235 *x = a;
    const Job1235 *y = b;
    return (x->end > y->end) - (x->end < y->end);
}

int jobScheduling(int *startTime, int startTimeSize, int *endTime, int endTimeSize, int *profit, int profitSize) {
    int n = startTimeSize;
    Job1235 *jobs = malloc(n * sizeof(Job1235));
    int *dp = calloc(n + 1, sizeof(int));
    for (int i = 0; i < n; i++) {
        jobs[i] = (Job1235){startTime[i], endTime[i], profit[i]};
    }
    qsort(jobs, n, sizeof(Job1235), cmp1235);
    for (int i = 1; i <= n; i++) {
        int left = 0;
        int right = i - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (jobs[mid].end <= jobs[i - 1].start) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        int take = dp[left] + jobs[i - 1].gain;
        dp[i] = dp[i - 1] > take ? dp[i - 1] : take;
    }
    int answer = dp[n];
    free(jobs);
    free(dp);
    return answer;
}`,
        cpp: `int jobScheduling(vector<int>& startTime, vector<int>& endTime, vector<int>& profit) {
    int n = startTime.size();
    vector<array<int, 3>> jobs;
    for (int i = 0; i < n; i++) {
        jobs.push_back({endTime[i], startTime[i], profit[i]});
    }
    sort(jobs.begin(), jobs.end());
    vector<int> ends;
    for (auto& job : jobs) {
        ends.push_back(job[0]);
    }
    vector<int> dp(n + 1);
    for (int i = 1; i <= n; i++) {
        int previous = upper_bound(ends.begin(), ends.begin() + i - 1, jobs[i - 1][1]) - ends.begin();
        dp[i] = max(dp[i - 1], dp[previous] + jobs[i - 1][2]);
    }
    return dp[n];
}`,
        java: `int jobScheduling(int[] startTime, int[] endTime, int[] profit) {
    int n = startTime.length;
    int[][] jobs = new int[n][3];
    for (int i = 0; i < n; i++) {
        jobs[i] = new int[] {endTime[i], startTime[i], profit[i]};
    }
    Arrays.sort(jobs, Comparator.comparingInt(a -> a[0]));
    int[] ends = new int[n];
    int[] dp = new int[n + 1];
    for (int i = 0; i < n; i++) {
        ends[i] = jobs[i][0];
    }
    for (int i = 1; i <= n; i++) {
        int left = 0;
        int right = i - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (ends[mid] <= jobs[i - 1][1]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        int previous = left;
        dp[i] = Math.max(dp[i - 1], dp[previous] + jobs[i - 1][2]);
    }
    return dp[n];
}`,
        javascript: `function jobScheduling(startTime, endTime, profit) {
  const jobs = startTime.map((start, i) => [endTime[i], start, profit[i]]);
  jobs.sort((a, b) => a[0] - b[0]);
  const ends = jobs.map(job => job[0]);
  const dp = new Array(jobs.length + 1).fill(0);
  for (let i = 1; i <= jobs.length; i++) {
    let left = 0;
    let right = i - 1;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (ends[mid] <= jobs[i - 1][1]) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    dp[i] = Math.max(dp[i - 1], dp[left] + jobs[i - 1][2]);
  }
  return dp[jobs.length];
}`,
      },
    },
    {
      name: '往前掃相容工作的 DP',
      idea: '同樣按結束時間排序，但直接向前掃找可接的最佳收入。',
      steps: ['將工作按結束時間排序。', '對每份工作，掃描前面所有結束時間 ≤ 它開始時間的工作。', '選與不選取較大值。'],
      figure: { title: '四份工作，時間與報酬見範例', steps: [
        { note: '先看 [1,3]，單做它能收 50。', views: [intervalsView([[1, 3], [2, 4], [3, 5], [3, 6]], { cls: { 0: 'hl' } })] },
        { note: '[2,4] 與 [1,3] 重疊，只做它收 10，不如前者。', views: [arr([50, 50], { label: '前兩份最優值' })] },
        { note: '[3,5] 向前找到 [1,3]，合計 90。', views: [arr([50, 50, 90], { label: '前三份最優值', highlight: [2] })] },
        { note: '[3,6] 同樣接 [1,3]，合計 120，得到答案。', views: [arr([50, 50, 90, 120], { label: '最優值', done: [3] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每份工作都可能掃描所有先前工作。' },
      verdict: '不用二分，更容易看懂轉移；最大測資會超時。',
      code: {
        python: `def jobScheduling(startTime, endTime, profit):
    jobs = sorted(zip(endTime, startTime, profit))
    dp = [0] * (len(jobs) + 1)
    for i, (_, start, gain) in enumerate(jobs, 1):
        take = gain
        for j in range(i - 1):
            if jobs[j][0] <= start:
                take = max(take, dp[j + 1] + gain)  # 接在工作 j 後
        dp[i] = max(dp[i - 1], take)
    return dp[-1]`,
        c: `typedef struct { int start; int end; int gain; } Job1235;

static int cmp1235(const void *a, const void *b) {
    const Job1235 *x = a;
    const Job1235 *y = b;
    return (x->end > y->end) - (x->end < y->end);
}

int jobScheduling(int *startTime, int startTimeSize, int *endTime, int endTimeSize, int *profit, int profitSize) {
    int n = startTimeSize;
    Job1235 *jobs = malloc(n * sizeof(Job1235));
    int *dp = calloc(n + 1, sizeof(int));
    for (int i = 0; i < n; i++) {
        jobs[i] = (Job1235){startTime[i], endTime[i], profit[i]};
    }
    qsort(jobs, n, sizeof(Job1235), cmp1235);
    for (int i = 1; i <= n; i++) {
        int take = jobs[i - 1].gain;
        for (int j = 0; j < i - 1; j++) {
            if (jobs[j].end <= jobs[i - 1].start) {
                int option = dp[j + 1] + jobs[i - 1].gain;
                if (option > take) {
                    take = option;
                }
            }
        }
        dp[i] = dp[i - 1] > take ? dp[i - 1] : take;
    }
    int answer = dp[n];
    free(jobs);
    free(dp);
    return answer;
}`,
        cpp: `int jobScheduling(vector<int>& startTime, vector<int>& endTime, vector<int>& profit) {
    vector<array<int, 3>> jobs;
    for (int i = 0; i < (int)startTime.size(); i++) {
        jobs.push_back({endTime[i], startTime[i], profit[i]});
    }
    sort(jobs.begin(), jobs.end());
    vector<int> dp(jobs.size() + 1);
    for (int i = 1; i <= (int)jobs.size(); i++) {
        int take = jobs[i - 1][2];
        for (int j = 0; j < i - 1; j++) {
            if (jobs[j][0] <= jobs[i - 1][1]) {
                take = max(take, dp[j + 1] + jobs[i - 1][2]);
            }
        }
        dp[i] = max(dp[i - 1], take);
    }
    return dp.back();
}`,
        java: `int jobScheduling(int[] startTime, int[] endTime, int[] profit) {
    int n = startTime.length;
    int[][] jobs = new int[n][3];
    for (int i = 0; i < n; i++) {
        jobs[i] = new int[] {endTime[i], startTime[i], profit[i]};
    }
    Arrays.sort(jobs, Comparator.comparingInt(a -> a[0]));
    int[] dp = new int[n + 1];
    for (int i = 1; i <= n; i++) {
        int take = jobs[i - 1][2];
        for (int j = 0; j < i - 1; j++) {
            if (jobs[j][0] <= jobs[i - 1][1]) {
                take = Math.max(take, dp[j + 1] + jobs[i - 1][2]);
            }
        }
        dp[i] = Math.max(dp[i - 1], take);
    }
    return dp[n];
}`,
        javascript: `function jobScheduling(startTime, endTime, profit) {
  const jobs = startTime.map((start, i) => [endTime[i], start, profit[i]]);
  jobs.sort((a, b) => a[0] - b[0]);
  const dp = new Array(jobs.length + 1).fill(0);
  for (let i = 1; i <= jobs.length; i++) {
    let take = jobs[i - 1][2];
    for (let j = 0; j < i - 1; j++) {
      if (jobs[j][0] <= jobs[i - 1][1]) {
        take = Math.max(take, dp[j + 1] + jobs[i - 1][2]);
      }
    }
    dp[i] = Math.max(dp[i - 1], take);
  }
  return dp[jobs.length];
}`,
      },
    },
  ],
  pitfalls: ['前一份工作 end == 下一份 start 是相容的。', '二分回傳的是符合 end ≤ start 的工作數，可直接當 dp 索引。', '工作需先按結束時間排序，不可沿輸入順序做 DP。'],
  check: { kind: 'fn', fn: 'jobScheduling', cases: [
    { args: [S, E, P], out: 120 }, { args: [[1, 2, 3, 4, 6], [3, 5, 10, 6, 9], [20, 20, 100, 70, 60]], out: 150 }, { args: [[1], [2], [5]], out: 5 },
  ] },
}

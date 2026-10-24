import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1482. Minimum Number of Days to Make m Bouquets
const B = [1, 10, 3, 10, 2]

export const q1482: Solution = {
  id: 1482,
  plain: '每朵花有自己的開花日；花束必須由相鄰的 k 朵已開花組成。求最早能做出 m 束的日期。',
  statement: '給 bloomDay、花束數 m 與每束花數 k。每朵花最多用一次，每束須取連續 k 朵。回傳完成 m 束的最早日；永遠無法完成就回傳 -1。',
  examples: [
    { input: 'bloomDay = [1,10,3,10,2], m = 3, k = 1', output: '3' },
    { input: 'bloomDay = [1,10,3,10,2], m = 3, k = 2', output: '-1' },
    { input: 'bloomDay = [7,7,7,7,12,7,7], m = 2, k = 3', output: '12' },
  ],
  constraints: ['1 ≤ bloomDay.length ≤ 10⁵；1 ≤ bloomDay[i] ≤ 10⁹。', '先檢查 m × k 是否大於花朵總數，避免不可能的情況。'],
  insight: ['固定一天 d，從左到右數連續已開花的花；滿 k 朵就做一束並歸零。', '若 d 當天可行，所有更晚的日期也可行，因此可對日期做 [[p:binary-search-answer]]。'],
  approaches: [
    {
      name: '逐日嘗試',
      idea: '從最早開花日開始，一天一天增加，直到足以做出 m 束。',
      steps: ['若 m×k > n，回傳 -1。', '從最早開花日到最晚開花日，逐天掃過花圃。', '遇到未開花的花就把連續數歸零；湊滿 k 朵就增加花束數。', '第一次達到 m 束的日期就是答案。'],
      figure: { title: 'bloomDay = [1,10,3,10,2], m = 3, k = 1', steps: [
        { note: '第 1 天只有第一朵開花，可做 1 束。', views: [arr(B, { label: '開花日', done: [0], dim: [1, 2, 3, 4] })] },
        { note: '第 2 天末尾的花也開了，可做 2 束，還不夠。', views: [arr(B, { done: [0, 4], dim: [1, 2, 3] })] },
        { note: '第 3 天中間那朵開花，可做 3 束，第一次達標。', views: [arr(B, { done: [0, 2, 4], dim: [1, 3] })] },
      ] },
      complexity: { time: 'O(nD)', space: 'O(1)', why: 'D 是最大與最小開花日的差；每一天都重新掃 n 朵花。' },
      verdict: '容易理解，但日期可能到 10⁹，逐日檢查會超時。',
      code: {
        python: `def minDays(bloomDay, m, k):
    if m * k > len(bloomDay):
        return -1
    for day in range(min(bloomDay), max(bloomDay) + 1):
        flowers = bouquets = 0
        for bloom in bloomDay:
            flowers = flowers + 1 if bloom <= day else 0
            if flowers == k:
                bouquets += 1  # 這 k 朵已使用，下一束重新計數
                flowers = 0
        if bouquets >= m:
            return day
    return -1`,
        c: `int minDays(int *bloomDay, int bloomDaySize, int m, int k) {
    if ((long long)m * k > bloomDaySize) {
        return -1;
    }
    int low = INT_MAX;
    int high = 0;
    for (int i = 0; i < bloomDaySize; i++) {
        if (bloomDay[i] < low) {
            low = bloomDay[i];
        }
        if (bloomDay[i] > high) {
            high = bloomDay[i];
        }
    }
    for (int day = low; day <= high; day++) {
        int flowers = 0;
        int bouquets = 0;
        for (int i = 0; i < bloomDaySize; i++) {
            flowers = bloomDay[i] <= day ? flowers + 1 : 0;
            if (flowers == k) {
                bouquets++;
                flowers = 0;
            }
        }
        if (bouquets >= m) {
            return day;
        }
    }
    return -1;
}`,
        cpp: `int minDays(vector<int>& bloomDay, int m, int k) {
    if (1LL * m * k > bloomDay.size()) {
        return -1;
    }
    int low = *min_element(bloomDay.begin(), bloomDay.end());
    int high = *max_element(bloomDay.begin(), bloomDay.end());
    for (int day = low; day <= high; day++) {
        int flowers = 0;
        int bouquets = 0;
        for (int bloom : bloomDay) {
            flowers = bloom <= day ? flowers + 1 : 0;
            if (flowers == k) {
                bouquets++;
                flowers = 0;
            }
        }
        if (bouquets >= m) {
            return day;
        }
    }
    return -1;
}`,
        java: `int minDays(int[] bloomDay, int m, int k) {
    if ((long) m * k > bloomDay.length) {
        return -1;
    }
    int low = Arrays.stream(bloomDay).min().getAsInt();
    int high = Arrays.stream(bloomDay).max().getAsInt();
    for (int day = low; day <= high; day++) {
        int flowers = 0;
        int bouquets = 0;
        for (int bloom : bloomDay) {
            flowers = bloom <= day ? flowers + 1 : 0;
            if (flowers == k) {
                bouquets++;
                flowers = 0;
            }
        }
        if (bouquets >= m) {
            return day;
        }
    }
    return -1;
}`,
        javascript: `function minDays(bloomDay, m, k) {
  if (m * k > bloomDay.length) {
    return -1;
  }
  const low = Math.min(...bloomDay);
  const high = Math.max(...bloomDay);
  for (let day = low; day <= high; day++) {
    let flowers = 0;
    let bouquets = 0;
    for (const bloom of bloomDay) {
      flowers = bloom <= day ? flowers + 1 : 0;
      if (flowers === k) {
        bouquets++;
        flowers = 0;
      }
    }
    if (bouquets >= m) {
      return day;
    }
  }
  return -1;
}`,
      },
    },
    {
      name: '對答案日期二分搜尋',
      idea: '用同一個可行性檢查；可行的日期形成右半段，二分找第一個可行日。',
      steps: ['若 m×k > n，先回傳 -1。', '設定 lo 為最早開花日、hi 為最晚開花日。', '檢查中間日 mid；足夠做 m 束則 hi = mid，否則 lo = mid + 1。', 'lo 與 hi 相遇時回傳 lo。'],
      figure: { title: 'bloomDay = [1,10,3,10,2], m = 3, k = 1', steps: [
        { note: '答案位於 1 到 10 日；檢查第 5 天，已有 3 朵開花，可行，縮到 1–5。', views: [arr([1, 5, 10], { label: 'lo / mid / hi', highlight: [1] })] },
        { note: '檢查第 3 天，仍有 3 朵開花，可行，縮到 1–3。', views: [arr([1, 3, 5], { label: 'lo / mid / hi', highlight: [1] })] },
        { note: '檢查第 2 天，只有 2 朵開花，不可行，改查 3–3。', views: [arr([1, 2, 3], { label: 'lo / mid / hi', dim: [0], highlight: [1] })] },
        { note: '邊界在第 3 天相遇，這是最早能做 3 束的日子。', views: [arr(B, { done: [0, 2, 4], dim: [1, 3] })] },
      ] },
      complexity: { time: 'O(n log D)', space: 'O(1)', why: '最多做 log D 次可行性掃描。' },
      verdict: '日期範圍很大時使用；與 [1011](#/q/1011) 都是單調答案的二分搜尋。',
      code: {
        python: `def minDays(bloomDay, m, k):
    if m * k > len(bloomDay):
        return -1

    def enough(day):
        flowers = bouquets = 0
        for bloom in bloomDay:
            flowers = flowers + 1 if bloom <= day else 0
            if flowers == k:
                bouquets += 1  # 用掉連續 k 朵，避免重複使用
                flowers = 0
        return bouquets >= m

    lo, hi = min(bloomDay), max(bloomDay)
    while lo < hi:
        mid = (lo + hi) // 2
        if enough(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
        c: `static bool enough(int *bloom, int n, int m, int k, int day) {
    int flowers = 0;
    int bouquets = 0;
    for (int i = 0; i < n; i++) {
        flowers = bloom[i] <= day ? flowers + 1 : 0;
        if (flowers == k) {
            bouquets++;
            flowers = 0;
        }
    }
    return bouquets >= m;
}

int minDays(int *bloomDay, int bloomDaySize, int m, int k) {
    if ((long long)m * k > bloomDaySize) {
        return -1;
    }
    int lo = INT_MAX;
    int hi = 0;
    for (int i = 0; i < bloomDaySize; i++) {
        if (bloomDay[i] < lo) {
            lo = bloomDay[i];
        }
        if (bloomDay[i] > hi) {
            hi = bloomDay[i];
        }
    }
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (enough(bloomDay, bloomDaySize, m, k, mid)) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }
    return lo;
}`,
        cpp: `int minDays(vector<int>& bloomDay, int m, int k) {
    if (1LL * m * k > bloomDay.size()) {
        return -1;
    }
    auto enough = [&](int day) {
        int flowers = 0;
        int bouquets = 0;
        for (int bloom : bloomDay) {
            flowers = bloom <= day ? flowers + 1 : 0;
            if (flowers == k) {
                bouquets++;
                flowers = 0;
            }
        }
        return bouquets >= m;
    };
    int lo = *min_element(bloomDay.begin(), bloomDay.end());
    int hi = *max_element(bloomDay.begin(), bloomDay.end());
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (enough(mid)) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }
    return lo;
}`,
        java: `int minDays(int[] bloomDay, int m, int k) {
    if ((long) m * k > bloomDay.length) {
        return -1;
    }
    int lo = Arrays.stream(bloomDay).min().getAsInt();
    int hi = Arrays.stream(bloomDay).max().getAsInt();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        int flowers = 0;
        int bouquets = 0;
        for (int bloom : bloomDay) {
            flowers = bloom <= mid ? flowers + 1 : 0;
            if (flowers == k) {
                bouquets++;
                flowers = 0;
            }
        }
        if (bouquets >= m) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }
    return lo;
}`,
        javascript: `function minDays(bloomDay, m, k) {
  if (m * k > bloomDay.length) {
    return -1;
  }
  function enough(day) {
    let flowers = 0;
    let bouquets = 0;
    for (const bloom of bloomDay) {
      flowers = bloom <= day ? flowers + 1 : 0;
      if (flowers === k) {
        bouquets++;
        flowers = 0;
      }
    }
    return bouquets >= m;
  }
  let lo = Math.min(...bloomDay);
  let hi = Math.max(...bloomDay);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (enough(mid)) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}`,
      },
    },
  ],
  pitfalls: ['花束必須由連續 k 朵組成；遇到未開花的花要把連續數歸零。', '做完一束要把連續數歸零，避免重複使用花朵。', 'm×k 可能超過 32 位元整數；C++、Java、C 計算時先轉成較大整數型別。'],
  check: { kind: 'fn', fn: 'minDays', cases: [
    { args: [B, 3, 1], out: 3 },
    { args: [B, 3, 2], out: -1 },
    { args: [[7, 7, 7, 7, 12, 7, 7], 2, 3], out: 12 },
    { args: [[1000000000, 1], 1, 1], out: 1 },
  ] },
}

import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const MACHINES = [2, 3, 2]
const GOAL = 10

function dayFig(): FigStep[] {
  const steps: FigStep[] = []
  let made = 0
  for (let day = 1; made < GOAL; day++) {
    const produced: number[] = MACHINES.map(period => day % period === 0 ? 1 : 0)
    made += produced.reduce((a, b) => a + b, 0)
    steps.push({ note: `第 ${day} 天，三台機器分別新增 ${produced.join('、')} 件；累計 ${made}，${made >= GOAL ? '已達 10 件' : '繼續等待'}。`, views: [arr(MACHINES, { label: '每台生產週期', highlight: produced.flatMap((v, i) => v ? [i] : []) }), kv([['天數', day], ['當天新增', produced.reduce((a, b) => a + b, 0)], ['累計', made]], '逐日模擬')] })
  }
  return steps
}

function binaryFig(): FigStep[] {
  const steps: FigStep[] = []
  let low = 1
  let high = Math.min(...MACHINES) * GOAL
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const perMachine = MACHINES.map(period => Math.floor(mid / period))
    const made = perMachine.reduce((a, b) => a + b, 0)
    const enough = made >= GOAL
    steps.push({ note: `測試 ${mid} 天：各機器做 ${perMachine.join('、')} 件，共 ${made} 件；${enough ? '夠，右界改為 ' + mid : '不夠，左界改為 ' + (mid + 1)}。`, views: [arr(MACHINES, { label: '每台週期' }), kv([['左界', low], ['試驗天數', mid], ['右界', high], ['總產量', made]], '二分範圍')] })
    if (enough) high = mid
    else low = mid + 1
  }
  steps.push({ note: `左右界會合於 ${low} 天；更少天數皆不足，這就是最早完成日。`, views: [kv([['最少天數', low]], '答案')] })
  return steps
}

export const hrMinimumTimeRequired: HrSolution = {
  slug: 'minimum-time-required',
  plain: '幾台機器同時工作，各有固定出貨週期；找最早能湊齊訂單的那一天。',
  statement: '輸入每台機器做一件產品需要的天數 machines，以及目標件數 goal。所有機器從第 0 天同時開始，每台按自己的週期重複產出；回傳累計至少 goal 件所需的最少整數天數。',
  examples: [
    { input: 'machines = [2,3,2], goal = 10', output: '8', note: '第 8 天的產量是 4+2+4=10；第 7 天只有 3+2+3=8。' },
    { input: 'machines = [1,3,4], goal = 10', output: '7', note: '第 7 天有 7+2+1=10 件，剛好達標。' },
  ],
  constraints: [
    'goal 和週期可能很大 → 逐日模擬會花過多時間，並需使用 64 位整數存天數。',
    '所有機器週期為正 → 產量隨天數不下降，因此可對答案做 [[p:binary-search-answer]]。',
  ],
  insight: [
    '最直觀是每天檢查哪台機器交貨，累加到 goal 為止。',
    '不必真的逐日檢查：給定 d 天，週期 m 的機器已做 floor(d/m) 件，總和可一次算出。',
    '若 d 天已達標，所有比 d 更晚的天數也達標；真假分界點正是答案，於是用二分搜尋。',
  ],
  approaches: [
    {
      name: '逐日模擬生產',
      idea: '從第 1 天起逐日加上當天完成的件數，直到累計達標。',
      steps: ['累計件數設為 0。', '對每一天，若 day 能被某台機器的週期整除，就加一件。', '第一次達到 goal 時回傳當天。'],
      figure: { title: '三台機器做到十件', steps: dayFig() },
      complexity: { time: 'O(D·n)', space: 'O(1)', why: 'D 是答案天數；每天檢查全部 n 台機器。' },
      verdict: '容易模擬小例子，但目標或機器週期很大時太慢。',
      code: {
        python: `def minTime(machines, goal):
    day = 0
    made = 0
    while made < goal:
        day += 1
        for period in machines:
            # 今天恰好是這台機器的交貨日
            if day % period == 0:
                made += 1
    return day`,
        c: `long minTime(int machines_count, long* machines, long goal) {
    long long day = 0;
    long long made = 0;
    while (made < goal) {
        day++;
        for (int i = 0; i < machines_count; i++) {
            if (day % machines[i] == 0) made++;
        }
    }
    return day;
}`,
        cpp: `long minTime(vector<long> machines, long goal) {
    long long day = 0;
    long long made = 0;
    while (made < goal) {
        day++;
        for (long long period : machines) {
            if (day % period == 0) made++;
        }
    }
    return day;
}`,
        java: `static long minTime(List<Long> machines, long goal) {
    long[] values = machines.stream().mapToLong(Long::longValue).toArray();
    return minTime(values, goal);
}

static long minTime(long[] machines, long goal) {
    long day = 0;
    long made = 0;
    while (made < goal) {
        day++;
        for (long period : machines) {
            if (day % period == 0) made++;
        }
    }
    return day;
}`,
        javascript: `function minTime(machines, goal) {
  let day = 0;
  let made = 0;
  while (made < goal) {
    day++;
    for (const period of machines) {
      if (day % period === 0) made++;
    }
  }
  return day;
}`,
      },
    },
    {
      name: '二分搜尋最早達標日',
      idea: '用 d 天的總產量是否達標作為單調判斷，縮小可能的天數。',
      steps: ['左界設 1，右界設為最快機器獨自完成 goal 件的天數。', '取中間天數 mid，累加每台的 floor(mid/period)，達 goal 可提前停止。', '若達標，右界設 mid；否則左界設 mid+1，直到兩界重合。'],
      figure: { title: '二分查十件的完成日', steps: binaryFig() },
      complexity: { time: 'O(n log D)', space: 'O(1)', why: '每次判斷掃 n 台，搜尋範圍每次約減半。' },
      verdict: '能處理非常大的目標；產量累加到 goal 就停也能避免溢位。',
      code: {
        python: `def minTime(machines, goal):
    low = 1
    high = min(machines) * goal
    while low < high:
        mid = (low + high) // 2
        made = 0
        for period in machines:
            made += mid // period  # d 天內這台的產量
            if made >= goal:
                break
        if made >= goal:
            high = mid
        else:
            low = mid + 1
    return low`,
        c: `long minTime(int machines_count, long* machines, long goal) {
    long long fastest = machines[0];
    for (int i = 1; i < machines_count; i++) {
        if (machines[i] < fastest) fastest = machines[i];
    }
    long long low = 1, high = fastest * (long long)goal;
    while (low < high) {
        long long mid = low + (high - low) / 2;
        long long made = 0;
        for (int i = 0; i < machines_count; i++) {
            made += mid / machines[i];
            if (made >= goal) break;
        }
        if (made >= goal) high = mid;
        else low = mid + 1;
    }
    return low;
}`,
        cpp: `long minTime(vector<long> machines, long goal) {
    long long fastest = *min_element(machines.begin(), machines.end());
    long long low = 1, high = fastest * (long long)goal;
    while (low < high) {
        long long mid = low + (high - low) / 2;
        long long made = 0;
        for (long long period : machines) {
            made += mid / period;
            if (made >= goal) break;
        }
        if (made >= goal) high = mid;
        else low = mid + 1;
    }
    return low;
}`,
        java: `static long minTime(List<Long> machines, long goal) {
    long[] values = machines.stream().mapToLong(Long::longValue).toArray();
    return minTime(values, goal);
}

static long minTime(long[] machines, long goal) {
    long fastest = machines[0];
    for (long period : machines) fastest = Math.min(fastest, period);
    long low = 1, high = fastest * goal;
    while (low < high) {
        long mid = low + (high - low) / 2;
        long made = 0;
        for (long period : machines) {
            made += mid / period;
            if (made >= goal) break;
        }
        if (made >= goal) high = mid;
        else low = mid + 1;
    }
    return low;
}`,
        javascript: `function minTime(machines, goal) {
  // 答案最大約 10^18;超過 2^53 時 Number 會失準,要嚴格正確請改用 BigInt
  let fastest = Infinity;
  for (const period of machines) fastest = Math.min(fastest, period);  // n 可到 10^5,不用 Math.min(...machines)
  let low = 1;
  let high = fastest * goal;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    let made = 0;
    for (const period of machines) {
      made += Math.floor(mid / period);
      if (made >= goal) break;
    }
    if (made >= goal) high = mid;
    else low = mid + 1;
  }
  return low;
}`,
      },
    },
  ],
  pitfalls: [
    '機器平行生產，給定 d 天時產量是各自 floor(d/period) 的總和，不能把週期相加。',
    'C、C++ 的乘積與天數需用 64 位整數；32 位會在大目標時溢位。',
    '達標時仍要保留 mid 作候選，所以設 high=mid，不能設 mid-1。',
  ],
  check: {
    kind: 'fn',
    fn: 'minTime',
    cases: [
      { args: [[2, 3, 2], 10], out: 8 },
      { args: [[1, 3, 4], 10], out: 7 },
      { args: [[5], 1], out: 5 },
      { args: [[1, 1], 3], out: 2 },
      { args: [[2, 4], 1], out: 2 },
      { args: [[2, 4], 3], out: 4 },
    ],
  },
}

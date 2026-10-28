import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const SPEND = [2, 3, 4, 2, 3, 6, 8, 4, 5]

function sortedFig(): FigStep[] {
  const d = 5, out: FigStep[] = [{ note: '先收集前 5 天資料，從第 6 天才開始判斷；目前通知 0 次。', views: [arr(SPEND, { label: '每日花費', highlight: [0, 1, 2, 3, 4] }), arr([0], { label: '通知次數' })] }]
  let notices = 0
  for (let i = d; i < SPEND.length; i++) {
    const window = SPEND.slice(i - d, i).sort((a, b) => a - b)
    const twice = window[Math.floor((d - 1) / 2)] + window[Math.floor(d / 2)]
    const hit = SPEND[i] >= twice
    if (hit) notices++
    out.push({ note: `第 ${i + 1} 天看前 5 天排序 ${window.join(',')}：中位數兩倍為 ${twice}；今日 ${SPEND[i]} ${hit ? '達標，通知一次' : '未達標'}，累計 ${notices}。`, views: [arr(SPEND, { label: '花費', highlight: [i], done: Array.from({ length: d }, (_, k) => i - d + k) }), arr(window, { label: '重新排序的前 5 天' }), arr([twice, notices], { label: '門檻 / 通知數' })] })
  }
  return out
}

function countingFig(): FigStep[] {
  const d = 5, count = Array(201).fill(0), out: FigStep[] = []
  for (let i = 0; i < d; i++) {
    count[SPEND[i]]++
    out.push({ note: `先把第 ${i + 1} 天的 ${SPEND[i]} 放進計數表；已收集 ${i + 1}/5 天。`, views: [arr(SPEND, { label: '花費', highlight: [i] }), kv(count.flatMap((x, v) => x ? [[v, x] as [number, number]] : []), '前 5 天各金額次數')] })
  }
  let notices = 0
  for (let i = d; i < SPEND.length; i++) {
    let seen = 0, first = -1, second = -1
    for (let value = 0; value <= 200; value++) {
      seen += count[value]
      if (first < 0 && seen >= Math.floor((d + 1) / 2)) first = value
      if (seen >= Math.floor(d / 2) + 1) { second = value; break }
    }
    const twice = first + second, hit = SPEND[i] >= twice
    if (hit) notices++
    out.push({ note: `第 ${i + 1} 天：計數表第 ${Math.floor((d + 1) / 2)}、${Math.floor(d / 2) + 1} 個值是 ${first}、${second}，門檻 ${twice}；今日 ${SPEND[i]} ${hit ? '達標' : '未達標'}。`, views: [arr(SPEND, { label: '花費', highlight: [i] }), kv(count.flatMap((x, v) => x ? [[v, x] as [number, number]] : []), '目前視窗金額次數'), arr([twice, notices], { label: '門檻 / 累計通知' })] })
    count[SPEND[i - d]]--
    count[SPEND[i]]++
    out.push({ note: `視窗右移：移除第 ${i - d + 1} 天的 ${SPEND[i - d]}，加入今日 ${SPEND[i]}；下一天使用更新後的次數。`, views: [arr(SPEND, { label: '移出 / 移入', highlight: [i - d, i] }), kv(count.flatMap((x, v) => x ? [[v, x] as [number, number]] : []), '更新後次數'), arr([notices], { label: '通知數' })] })
  }
  return out
}

export const hrFraudulentActivityNotifications: HrSolution = {
  slug: 'fraudulent-activity-notifications',
  plain: '像銀行每天看前 d 天的消費習慣：若今天花費至少是中間水準的兩倍，就寄出提醒；資料不足 d 天時先不判斷。',
  statement: '輸入每日支出 expenditure 與回看天數 d。從第 d+1 天起，取其前 d 天支出的中位數；若當日支出大於或等於中位數兩倍，通知一次。回傳總通知數。偶數 d 的中位數是排序後中間兩數的平均。',
  examples: [
    { input: 'expenditure = [10,20,30,40,50], d = 3', output: '1', note: '第 4 天門檻 40，剛好通知；第 5 天門檻 60，不通知。' },
    { input: 'expenditure = [2,3,4,2,3,6,8,4,5], d = 5', output: '2', note: '第 6、7 天各達當時門檻，後兩天沒有。' },
  ],
  constraints: [
    '1 ≤ d ≤ n ≤ 2×10^5 → 每天重排 d 個數最壞太慢;d = n 時沒有可判斷的日子,答案是 0。',
    '每日支出介於 0 到 200 → 可用 201 格計數表，掃固定範圍找中位數。',
    '通知條件是大於或等於門檻 → 比較式需用 ≥；零支出也可能觸發零門檻。',
  ],
  insight: [
    '直覺解法每天取前 d 筆並排序，直接讀中間值，先掌握中位數定義。',
    '連續兩天的歷史視窗只差「最舊一天移出、昨天移入」，重排所有資料很浪費。',
    '支出只在 0..200，採 [[p:counting-sort]] 次數表保存 [[p:sliding-window]]；每次掃 201 格找到兩個中間排名即可。',
  ],
  approaches: [
    {
      name: '每天重排前 d 天',
      idea: '每天複製前 d 筆並排序，直接求中位數與通知門檻。',
      steps: ['從索引 d 開始，每天取索引 i−d 到 i−1。', '排序這 d 筆；取兩個中間位置的值相加，這正好是中位數兩倍。', '若今日花費 ≥ 這個和，通知數加一。'],
      figure: { title: 'expenditure = [2,3,4,2,3,6,8,4,5]，d = 5', steps: sortedFig() },
      complexity: { time: 'O((n−d)d log d)', space: 'O(d)', why: '每天複製並重排 d 筆；暫存一個視窗。' },
      verdict: '易實作，也能正確處理偶數 d，但大視窗時重排成本過高。',
      code: {
        python: `def activityNotifications(expenditure, d):
    notices = 0
    for i in range(d, len(expenditure)):
        window = sorted(expenditure[i - d:i])
        twice = window[(d - 1) // 2] + window[d // 2]  # 中位數的兩倍
        if expenditure[i] >= twice:
            notices += 1
    return notices`,
        c: `int compareExpense(const void* a, const void* b) {
    int x = *(const int*)a, y = *(const int*)b;
    return (x > y) - (x < y);
}

int activityNotifications(int expenditure_count, int* expenditure, int d) {
    int notices = 0;
    int* window = malloc(sizeof(int) * d);
    for (int i = d; i < expenditure_count; i++) {
        memcpy(window, expenditure + i - d, sizeof(int) * d);
        qsort(window, d, sizeof(int), compareExpense);
        int twice = window[(d - 1) / 2] + window[d / 2];
        if (expenditure[i] >= twice) notices++;
    }
    free(window);
    return notices;
}`,
        cpp: `int activityNotifications(vector<int> expenditure, int d) {
    int notices = 0;
    for (int i = d; i < (int)expenditure.size(); i++) {
        vector<int> window(expenditure.begin() + i - d, expenditure.begin() + i);
        sort(window.begin(), window.end());
        int twice = window[(d - 1) / 2] + window[d / 2];
        if (expenditure[i] >= twice) notices++;
    }
    return notices;
}`,
        java: `public static int activityNotifications(List<Integer> expenditure, int d) {
    int notices = 0;
    for (int i = d; i < expenditure.size(); i++) {
        List<Integer> window = new ArrayList<>(expenditure.subList(i - d, i));
        Collections.sort(window);
        int twice = window.get((d - 1) / 2) + window.get(d / 2);
        if (expenditure.get(i) >= twice) notices++;
    }
    return notices;
}`,
        javascript: `function activityNotifications(expenditure, d) {
  let notices = 0;
  for (let i = d; i < expenditure.length; i++) {
    const window = expenditure.slice(i - d, i).sort((a, b) => a - b);
    const twice = window[Math.floor((d - 1) / 2)] + window[Math.floor(d / 2)];
    if (expenditure[i] >= twice) notices++;
  }
  return notices;
}`,
      },
    },
    {
      name: '201 格計數視窗',
      idea: '維持前 d 天每個金額的出現次數，掃次數找中間排名。',
      steps: ['把前 d 天加入 201 格次數表。', '每天從金額 0 到 200 累積次數，找第 floor((d+1)/2) 與第 floor(d/2)+1 個值(從 1 數起;d 是奇數時兩個是同一個)。', '兩值相加作為門檻；今日達標就計數。', '移除最舊一天、加入今日，再處理下一天。'],
      figure: { title: 'expenditure = [2,3,4,2,3,6,8,4,5]，d = 5', steps: countingFig() },
      complexity: { time: 'O(n × 201)', space: 'O(201)', why: '每天最多掃固定 201 個金額；次數表固定大小。' },
      verdict: '固定值域讓中位數查詢與視窗更新都高效，也避免浮點數。',
      code: {
        python: `def activityNotifications(expenditure, d):
    count = [0] * 201
    for value in expenditure[:d]:
        count[value] += 1
    notices = 0
    for i in range(d, len(expenditure)):
        first_rank = (d + 1) // 2
        second_rank = d // 2 + 1
        seen = 0
        first = None
        second = None
        for value, amount in enumerate(count):
            seen += amount
            if first is None and seen >= first_rank:
                first = value  # 左邊的中間值
            if seen >= second_rank:
                second = value
                break
        if expenditure[i] >= first + second:
            notices += 1
        count[expenditure[i - d]] -= 1
        count[expenditure[i]] += 1
    return notices`,
        c: `int activityNotifications(int expenditure_count, int* expenditure, int d) {
    int count[201] = {0}, notices = 0;
    for (int i = 0; i < d; i++) count[expenditure[i]]++;
    for (int i = d; i < expenditure_count; i++) {
        int firstRank = (d + 1) / 2, secondRank = d / 2 + 1;
        int seen = 0, first = -1, second = -1;
        for (int value = 0; value <= 200; value++) {
            seen += count[value];
            if (first < 0 && seen >= firstRank) first = value;
            if (seen >= secondRank) { second = value; break; }
        }
        if (expenditure[i] >= first + second) notices++;
        count[expenditure[i - d]]--;
        count[expenditure[i]]++;
    }
    return notices;
}`,
        cpp: `int activityNotifications(vector<int> expenditure, int d) {
    vector<int> count(201, 0);
    for (int i = 0; i < d; i++) count[expenditure[i]]++;
    int notices = 0;
    for (int i = d; i < (int)expenditure.size(); i++) {
        int seen = 0, first = -1, second = -1;
        for (int value = 0; value <= 200; value++) {
            seen += count[value];
            if (first < 0 && seen >= (d + 1) / 2) first = value;
            if (seen >= d / 2 + 1) { second = value; break; }
        }
        if (expenditure[i] >= first + second) notices++;
        count[expenditure[i - d]]--;
        count[expenditure[i]]++;
    }
    return notices;
}`,
        java: `public static int activityNotifications(List<Integer> expenditure, int d) {
    int[] count = new int[201];
    for (int i = 0; i < d; i++) count[expenditure.get(i)]++;
    int notices = 0;
    for (int i = d; i < expenditure.size(); i++) {
        int seen = 0, first = -1, second = -1;
        for (int value = 0; value <= 200; value++) {
            seen += count[value];
            if (first < 0 && seen >= (d + 1) / 2) first = value;
            if (seen >= d / 2 + 1) { second = value; break; }
        }
        if (expenditure.get(i) >= first + second) notices++;
        count[expenditure.get(i - d)]--;
        count[expenditure.get(i)]++;
    }
    return notices;
}`,
        javascript: `function activityNotifications(expenditure, d) {
  const count = Array(201).fill(0);
  for (let i = 0; i < d; i++) count[expenditure[i]]++;
  let notices = 0;
  for (let i = d; i < expenditure.length; i++) {
    let seen = 0;
    let first = -1;
    let second = -1;
    for (let value = 0; value <= 200; value++) {
      seen += count[value];
      if (first < 0 && seen >= Math.floor((d + 1) / 2)) first = value;
      if (seen >= Math.floor(d / 2) + 1) { second = value; break; }
    }
    if (expenditure[i] >= first + second) notices++;
    count[expenditure[i - d]]--;
    count[expenditure[i]]++;
  }
  return notices;
}`,
      },
    },
  ],
  pitfalls: [
    '當天資料不可以放入用來判斷當天的視窗，必須比較後才移入。',
    '偶數 d 要取兩個中間值的和，不可只取一個；這個和正好是中位數兩倍。',
    '條件包含等於門檻，且花費 0、門檻 0 時也會通知。',
  ],
  check: {
    kind: 'fn', fn: 'activityNotifications',
    cases: [
      { args: [[10, 20, 30, 40, 50], 3], out: 1 },
      { args: [SPEND, 5], out: 2 },
      { args: [[1, 2], 1], out: 1 },
      { args: [[1, 2, 3], 2], out: 1 },
      { args: [[0, 0, 0], 1], out: 2 },
      { args: [[5, 5, 5, 5], 2], out: 0 },
    ],
  },
}

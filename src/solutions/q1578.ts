import { arr } from '../engine/helpers'
import type { Solution } from './types'

const COLORS = ['a', 'a', 'b', 'b', 'b', 'a', 'a']
const TIMES = [1, 2, 3, 4, 5, 1, 2]

export const q1578: Solution = {
  id: 1578,
  plain: '一串氣球不能有相鄰同色；拆一顆有代價，求最小拆除時間。',
  statement: '給字串 colors 與同長度陣列 neededTime。移除第 i 顆需 neededTime[i] 秒，使剩下相鄰氣球顏色都不同，求最少總時間。',
  examples: [{ input: 'colors = "abaac", neededTime = [1,2,3,4,5]', output: '3' }, { input: 'colors = "abc", neededTime = [1,2,3]', output: '0' }],
  constraints: ['1 ≤ colors.length ≤ 10⁵，neededTime[i] 為正整數。'],
  insight: ['每段連續同色的氣球只能留一顆。', '留下拆除代價最大的那顆，就讓該段的拆除成本最低；這是 [[p:greedy]]。'],
  approaches: [
    {
      name: '逐段統計',
      idea: '每個同色區段的成本等於時間總和減掉其中最大值。',
      steps: ['從段首開始', '往右走到顏色改變，累計總時間與最大時間', '把總時間減最大時間加入答案', '從下一段重複'],
      figure: { title: 'colors = aabbbaa，時間 = [1,2,3,4,5,1,2]', steps: [
        { note: '第一段 aa 的費用為 1+2−2=1，保留較貴的第二顆。', views: [arr(COLORS, { label: '顏色', highlight: [0, 1] }), arr(TIMES, { label: '時間', done: [1] })] },
        { note: '第二段 bbb 的總時間是 12，最大時間是 5，因此拆除成本 7。', views: [arr(COLORS, { label: '顏色', highlight: [2, 3, 4] }), arr(TIMES, { label: '時間', done: [4] })] },
        { note: '最後一段 aa 成本 1。三段彼此顏色不同，可獨立計算。', views: [arr(COLORS, { label: '顏色', highlight: [5, 6] }), arr(TIMES, { label: '時間', done: [6] })] },
        { note: '加總 1+7+1=9。', views: [arr([1, 7, 1, 9], { label: '各段成本 / 總成本', done: [3] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個氣球只走訪一次。' },
      verdict: '把「每段留最貴」直接寫出來，最容易理解。',
      code: {
        python: `def minCost(colors, neededTime):
    answer = 0
    i = 0
    while i < len(colors):
        total = 0
        largest = 0
        j = i
        while j < len(colors) and colors[j] == colors[i]:
            total += neededTime[j]
            largest = max(largest, neededTime[j])
            j += 1
        answer += total - largest  # 每段只留最貴的一顆
        i = j
    return answer`,
        c: `int minCost(char *colors, int *neededTime, int neededTimeSize) {
    int answer = 0;
    int i = 0;
    while (i < neededTimeSize) {
        int total = 0;
        int largest = 0;
        int j = i;
        while (j < neededTimeSize && colors[j] == colors[i]) {
            total += neededTime[j];
            if (neededTime[j] > largest) {
                largest = neededTime[j];
            }
            j++;
        }
        answer += total - largest;
        i = j;
    }
    return answer;
}`,
        cpp: `int minCost(string colors, vector<int>& neededTime) {
    int answer = 0;
    int i = 0;
    while (i < (int)colors.size()) {
        int total = 0;
        int largest = 0;
        int j = i;
        while (j < (int)colors.size() && colors[j] == colors[i]) {
            total += neededTime[j];
            largest = max(largest, neededTime[j]);
            j++;
        }
        answer += total - largest;
        i = j;
    }
    return answer;
}`,
        java: `int minCost(String colors, int[] neededTime) {
    int answer = 0;
    int i = 0;
    while (i < colors.length()) {
        int total = 0;
        int largest = 0;
        int j = i;
        while (j < colors.length() && colors.charAt(j) == colors.charAt(i)) {
            total += neededTime[j];
            largest = Math.max(largest, neededTime[j]);
            j++;
        }
        answer += total - largest;
        i = j;
    }
    return answer;
}`,
        javascript: `function minCost(colors, neededTime) {
  let answer = 0;
  let i = 0;
  while (i < colors.length) {
    let total = 0;
    let largest = 0;
    let j = i;
    while (j < colors.length && colors[j] === colors[i]) {
      total += neededTime[j];
      largest = Math.max(largest, neededTime[j]);
      j++;
    }
    answer += total - largest;
    i = j;
  }
  return answer;
}`,
      },
    },
    {
      name: '邊掃邊保留',
      idea: '用 keep 記目前同色段留下的最大拆除時間；每遇到另一顆同色球，就拆較便宜者。',
      steps: ['第一顆當成目前保留者', '顏色不同時，開始新段', '顏色相同時，加入 min(keep, neededTime[i])', 'keep 更新成較大的拆除時間'],
      figure: { title: 'colors = aabbbaa，時間 = [1,2,3,4,5,1,2]', steps: [
        { note: '先保留時間 1 的 a；遇到時間 2 的 a，拆較便宜的 1。', views: [arr(TIMES, { label: '時間', highlight: [0, 1], done: [1] })] },
        { note: '換成 b，重新保留 3；接著遇到 4，拆 3。', views: [arr(TIMES, { label: '時間', highlight: [2, 3], done: [3] })] },
        { note: '再遇到 b 的 5，拆原本保留的 4；這段共付 3+4=7。', views: [arr(TIMES, { label: '時間', highlight: [3, 4], done: [4] })] },
        { note: '末段 a 的 1、2 再拆 1；累計 1+3+4+1=9。', views: [arr([1, 3, 4, 1, 9], { label: '拆除費用 / 總和', done: [4] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '單趟掃描，僅保留目前段的最大時間。' },
      verdict: '寫法短，適合已掌握分段貪心後使用。',
      code: {
        python: `def minCost(colors, neededTime):
    answer = 0
    keep = neededTime[0]
    for i in range(1, len(colors)):
        if colors[i] != colors[i - 1]:
            keep = neededTime[i]
        else:
            answer += min(keep, neededTime[i])  # 拆較便宜的
            keep = max(keep, neededTime[i])
    return answer`,
        c: `int minCost(char *colors, int *neededTime, int neededTimeSize) {
    int answer = 0;
    int keep = neededTime[0];
    for (int i = 1; i < neededTimeSize; i++) {
        if (colors[i] != colors[i - 1]) {
            keep = neededTime[i];
        } else {
            answer += keep < neededTime[i] ? keep : neededTime[i];
            if (neededTime[i] > keep) {
                keep = neededTime[i];
            }
        }
    }
    return answer;
}`,
        cpp: `int minCost(string colors, vector<int>& neededTime) {
    int answer = 0;
    int keep = neededTime[0];
    for (int i = 1; i < (int)colors.size(); i++) {
        if (colors[i] != colors[i - 1]) {
            keep = neededTime[i];
        } else {
            answer += min(keep, neededTime[i]);
            keep = max(keep, neededTime[i]);
        }
    }
    return answer;
}`,
        java: `int minCost(String colors, int[] neededTime) {
    int answer = 0;
    int keep = neededTime[0];
    for (int i = 1; i < colors.length(); i++) {
        if (colors.charAt(i) != colors.charAt(i - 1)) {
            keep = neededTime[i];
        } else {
            answer += Math.min(keep, neededTime[i]);
            keep = Math.max(keep, neededTime[i]);
        }
    }
    return answer;
}`,
        javascript: `function minCost(colors, neededTime) {
  let answer = 0;
  let keep = neededTime[0];
  for (let i = 1; i < colors.length; i++) {
    if (colors[i] !== colors[i - 1]) {
      keep = neededTime[i];
    } else {
      answer += Math.min(keep, neededTime[i]);
      keep = Math.max(keep, neededTime[i]);
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['顏色改變時要重設 keep；不同段互不影響。', '連續三顆以上同色時，須保留整段最大時間，不能只和上一顆比。'],
  check: { kind: 'fn', fn: 'minCost', cases: [
    { args: ['abaac', [1, 2, 3, 4, 5]], out: 3 },
    { args: ['abc', [1, 2, 3]], out: 0 },
    { args: [COLORS.join(''), TIMES], out: 9 },
    { args: ['a', [5]], out: 0 },
  ] },
}

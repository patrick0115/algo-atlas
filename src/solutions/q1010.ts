import { arr } from '../engine/helpers'
import type { Solution } from './types'

const T = [30, 20, 150, 100, 40]

export const q1010: Solution = {
  id: 1010,
  plain: '找兩首歌接在一起剛好是整分鐘的搭配數量。',
  statement: '給歌曲秒數陣列 time，計算 i < j 且 time[i]+time[j] 是 60 的倍數的索引配對數。',
  examples: [{ input: 'time = [30,20,150,100,40]', output: '3' }, { input: 'time = [60,60,60]', output: '3' }],
  constraints: ['2 ≤ time.length ≤ 6×10⁴；每首歌長度為正整數。'],
  insight: ['只需看除以 60 的餘數。', '餘數 r 要配 (60−r)%60；可用 [[p:hash-map]] 記錄前面出現的數量。'],
  approaches: [
    {
      name: '邊掃邊查互補餘數',
      idea: '每首新歌只與之前的歌配對，避免重複計數。',
      steps: ['建 60 格計數表', '讀新歌的餘數 r', '答案加上之前餘數 (60−r)%60 的數量', '再將 r 的計數加 1'],
      figure: { title: 'time = [30,20,150,100,40]', steps: [
        { note: '30 的餘數是 30，表中還沒有可搭配的 30。', views: [arr(T, { label: '歌曲', highlight: [0] }), arr([30], { label: '已見餘數' })] },
        { note: '20 需要餘數 40；目前沒有，先記下 20。', views: [arr(T, { label: '歌曲', highlight: [1] }), arr([30, 20], { label: '已見餘數' })] },
        { note: '150 的餘數也是 30，可與前面的 30 配成一組。', views: [arr(T, { label: '歌曲', highlight: [0, 2] }), arr([1], { label: '累計' })] },
        { note: '100 餘 40，可配先前的 20；40 餘 40，也配先前的 20。總共三組。', views: [arr(T, { label: '歌曲', highlight: [1, 3, 4] }), arr([3], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只用固定 60 格餘數表。' },
      verdict: '推薦；每首歌只查一次並更新一次。',
      code: {
        python: `def numPairsDivisibleBy60(time):
    count = [0] * 60
    answer = 0
    for seconds in time:
        remainder = seconds % 60
        needed = (60 - remainder) % 60
        answer += count[needed]  # 只配先前歌曲
        count[remainder] += 1
    return answer`,
        c: `int numPairsDivisibleBy60(int *time, int timeSize) {
    int count[60] = {0};
    int answer = 0;
    for (int i = 0; i < timeSize; i++) {
        int remainder = time[i] % 60;
        int needed = (60 - remainder) % 60;
        answer += count[needed];
        count[remainder]++;
    }
    return answer;
}`,
        cpp: `int numPairsDivisibleBy60(vector<int>& time) {
    array<int, 60> count{};
    int answer = 0;
    for (int seconds : time) {
        int remainder = seconds % 60;
        int needed = (60 - remainder) % 60;
        answer += count[needed];
        count[remainder]++;
    }
    return answer;
}`,
        java: `int numPairsDivisibleBy60(int[] time) {
    int[] count = new int[60];
    int answer = 0;
    for (int seconds : time) {
        int remainder = seconds % 60;
        int needed = (60 - remainder) % 60;
        answer += count[needed];
        count[remainder]++;
    }
    return answer;
}`,
        javascript: `function numPairsDivisibleBy60(time) {
  const count = new Array(60).fill(0);
  let answer = 0;
  for (const seconds of time) {
    const remainder = seconds % 60;
    const needed = (60 - remainder) % 60;
    answer += count[needed];
    count[remainder]++;
  }
  return answer;
}`,
      },
    },
    {
      name: '先統計全部餘數',
      idea: '先數每種餘數的歌曲數，再將互補餘數的配對數相乘。',
      steps: ['統計 0 到 59 的餘數次數', '0 和 30 各自在同組內配對，用 c(c−1)/2', '對 r=1..29，加 count[r]×count[60−r]', '回傳總數'],
      figure: { title: 'time = [30,20,150,100,40]', steps: [
        { note: '五首歌的餘數依序是 30、20、30、40、40。', views: [arr([30, 20, 30, 40, 40], { label: '餘數' })] },
        { note: '30 有兩首，任選兩首形成一組。', views: [arr([30, 30], { label: '30 組', highlight: [0, 1] })] },
        { note: '20 有一首，40 有兩首，交叉配出 1×2=2 組。', views: [arr([1, 2], { label: '20 / 40 次數' })] },
        { note: '總數 1+2=3。', views: [arr([1, 2, 3], { label: '兩類配對 / 總數', done: [2] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '先掃 n 首，再看固定 60 個餘數。' },
      verdict: '適合理解互補餘數與組合數。',
      code: {
        python: `def numPairsDivisibleBy60(time):
    count = [0] * 60
    for seconds in time:
        count[seconds % 60] += 1
    answer = count[0] * (count[0] - 1) // 2
    answer += count[30] * (count[30] - 1) // 2  # 互相配自己的兩類
    for r in range(1, 30):
        answer += count[r] * count[60 - r]
    return answer`,
        c: `int numPairsDivisibleBy60(int *time, int timeSize) {
    int count[60] = {0};
    for (int i = 0; i < timeSize; i++) {
        count[time[i] % 60]++;
    }
    int answer = (int)((long long)count[0] * (count[0] - 1) / 2);
    answer += (int)((long long)count[30] * (count[30] - 1) / 2);
    for (int r = 1; r < 30; r++) {
        answer += count[r] * count[60 - r];
    }
    return answer;
}`,
        cpp: `int numPairsDivisibleBy60(vector<int>& time) {
    array<int, 60> count{};
    for (int seconds : time) {
        count[seconds % 60]++;
    }
    int answer = (int)(1LL * count[0] * (count[0] - 1) / 2);
    answer += (int)(1LL * count[30] * (count[30] - 1) / 2);
    for (int r = 1; r < 30; r++) {
        answer += count[r] * count[60 - r];
    }
    return answer;
}`,
        java: `int numPairsDivisibleBy60(int[] time) {
    int[] count = new int[60];
    for (int seconds : time) {
        count[seconds % 60]++;
    }
    int answer = (int)((long)count[0] * (count[0] - 1) / 2);
    answer += (int)((long)count[30] * (count[30] - 1) / 2);
    for (int r = 1; r < 30; r++) {
        answer += count[r] * count[60 - r];
    }
    return answer;
}`,
        javascript: `function numPairsDivisibleBy60(time) {
  const count = new Array(60).fill(0);
  for (const seconds of time) {
    count[seconds % 60]++;
  }
  let answer = count[0] * (count[0] - 1) / 2;
  answer += count[30] * (count[30] - 1) / 2;
  for (let r = 1; r < 30; r++) {
    answer += count[r] * count[60 - r];
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['餘數 0 的互補仍是 0，不是陣列索引 60。', '餘數 30 與自身配對時用組合數，不能直接平方。'],
  check: { kind: 'fn', fn: 'numPairsDivisibleBy60', cases: [
    { args: [T], out: 3 },
    { args: [[60, 60, 60]], out: 3 },
    { args: [[10, 50, 20, 40]], out: 2 },
  ] },
}

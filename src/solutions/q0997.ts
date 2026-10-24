import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 997. Find the Town Judge
const E = [[1, 3], [2, 3]]
const fig = [
  { note: '三個人起初都沒信任別人，也還沒被信任；分數都是 0。', views: [arr([0, 0, 0], { label: '1、2、3 的分數' })] },
  { note: '1 信任 3：1 的分數減 1，3 的分數加 1。', views: [arr([-1, 0, 1], { label: '分數', highlight: [0, 2] })] },
  { note: '2 也信任 3：2 減 1，3 加 1。', views: [arr([-1, -1, 2], { label: '分數', highlight: [1, 2] })] },
  { note: '3 的分數是 n − 1 = 2：所有其他人信任他，而他沒信任任何人。', views: [arr([-1, -1, 2], { label: '分數', done: [2] })] },
]

export const q0997: Solution = {
  id: 997,
  plain: '找鎮上的法官：每個其他人都信任他，但他不信任任何人。',
  statement: '共有 `n` 人，`trust[i] = [a,b]` 表示 a 信任 b。若恰有一個人符合「其餘 n−1 人都信任他、他不信任任何人」，回傳其編號；否則回傳 -1。',
  examples: [{ input: 'n = 3, trust = [[1,3],[2,3]]', output: '3' }, { input: 'n = 2, trust = [[1,2],[2,1]]', output: '-1' }],
  constraints: ['1 ≤ n ≤ 1000；信任關係不重複。'],
  insight: ['把「被信任一次」記為 +1，「信任別人一次」記為 -1。只有法官能達到 n−1。', '也可以分開記入度與出度，概念更直觀。'],
  approaches: [
    {
      name: '分開計算入度與出度',
      idea: '法官的入度必須是 n−1，出度必須是 0。',
      steps: ['建立 `incoming` 與 `outgoing`。', '每條 a→b 讓 a 的出度、b 的入度各加一。', '逐人檢查兩個條件。'],
      figure: { title: 'n = 3, trust = [[1,3],[2,3]]', steps: [
        { note: '先把每個人的被信任次數設成 0。', views: [arr([0, 0, 0], { label: '入度' })] },
        { note: '1→3：3 的入度變 1，1 的出度變 1。', views: [arr([0, 0, 1], { label: '入度', highlight: [2] }), arr([1, 0, 0], { label: '出度', highlight: [0] })] },
        { note: '2→3：3 的入度變 2，2 的出度變 1。', views: [arr([0, 0, 2], { label: '入度', highlight: [2] }), arr([1, 1, 0], { label: '出度', highlight: [1] })] },
        { note: '只有 3 的入度為 2 且出度為 0，答案是 3。', views: [arr([0, 0, 2], { label: '入度', done: [2] })] },
      ] },
      complexity: { time: 'O(n + m)', space: 'O(n)', why: '掃過 m 條信任關係，再檢查 n 個人。' },
      verdict: '條件直接寫出來，初學時最容易核對。',
      code: {
        python: `def findJudge(n, trust):
    incoming = [0] * (n + 1)
    outgoing = [0] * (n + 1)
    for a, b in trust:
        outgoing[a] += 1               # a 信任別人
        incoming[b] += 1               # b 被信任
    for person in range(1, n + 1):
        if incoming[person] == n - 1 and outgoing[person] == 0:
            return person
    return -1`,
        c: `int findJudge(int n, int **trust, int trustSize, int *trustColSize) {
    int *in = calloc(n + 1, sizeof(int));
    int *out = calloc(n + 1, sizeof(int));
    for (int i = 0; i < trustSize; i++) {
        out[trust[i][0]]++;
        in[trust[i][1]]++;
    }
    int answer = -1;
    for (int i = 1; i <= n; i++) {
        if (in[i] == n - 1 && out[i] == 0) answer = i;
    }
    free(in);
    free(out);
    return answer;
}`,
        cpp: `int findJudge(int n, vector<vector<int>>& trust) {
    vector<int> in(n + 1), out(n + 1);
    for (const auto& edge : trust) {
        out[edge[0]]++;
        in[edge[1]]++;
    }
    for (int i = 1; i <= n; i++) {
        if (in[i] == n - 1 && out[i] == 0) return i;
    }
    return -1;
}`,
        java: `int findJudge(int n, int[][] trust) {
    int[] in = new int[n + 1];
    int[] out = new int[n + 1];
    for (int[] edge : trust) {
        out[edge[0]]++;
        in[edge[1]]++;
    }
    for (int i = 1; i <= n; i++) {
        if (in[i] == n - 1 && out[i] == 0) return i;
    }
    return -1;
}`,
        javascript: `function findJudge(n, trust) {
  const incoming = new Array(n + 1).fill(0);
  const outgoing = new Array(n + 1).fill(0);
  for (const [a, b] of trust) {
    outgoing[a]++;
    incoming[b]++;
  }
  for (let i = 1; i <= n; i++) {
    if (incoming[i] === n - 1 && outgoing[i] === 0) return i;
  }
  return -1;
}`,
      },
    },
    {
      name: '一個分數陣列',
      idea: '入度加一、出度減一；分數等於 n−1 的人就是法官。',
      steps: ['建立全零分數。', '每條 a→b 執行 `score[a]--` 與 `score[b]++`。', '找分數為 n−1 的人。'],
      figure: { title: 'n = 3, trust = [[1,3],[2,3]]', steps: fig },
      complexity: { time: 'O(n + m)', space: 'O(n)', why: '每條邊及每個人各看一次。' },
      verdict: '節省一個陣列；必須知道分數達到 n−1 就同時滿足兩個條件。',
      code: {
        python: `def findJudge(n, trust):
    score = [0] * (n + 1)
    for a, b in trust:
        score[a] -= 1                  # 信任別人，不能是法官
        score[b] += 1                  # 被別人信任
    for person in range(1, n + 1):
        if score[person] == n - 1:
            return person
    return -1`,
        c: `int findJudge(int n, int **trust, int trustSize, int *trustColSize) {
    int *score = calloc(n + 1, sizeof(int));
    for (int i = 0; i < trustSize; i++) {
        score[trust[i][0]]--;
        score[trust[i][1]]++;
    }
    int answer = -1;
    for (int i = 1; i <= n; i++) {
        if (score[i] == n - 1) answer = i;
    }
    free(score);
    return answer;
}`,
        cpp: `int findJudge(int n, vector<vector<int>>& trust) {
    vector<int> score(n + 1);
    for (const auto& edge : trust) {
        score[edge[0]]--;
        score[edge[1]]++;
    }
    for (int i = 1; i <= n; i++) {
        if (score[i] == n - 1) return i;
    }
    return -1;
}`,
        java: `int findJudge(int n, int[][] trust) {
    int[] score = new int[n + 1];
    for (int[] edge : trust) {
        score[edge[0]]--;
        score[edge[1]]++;
    }
    for (int i = 1; i <= n; i++) {
        if (score[i] == n - 1) return i;
    }
    return -1;
}`,
        javascript: `function findJudge(n, trust) {
  const score = new Array(n + 1).fill(0);
  for (const [a, b] of trust) {
    score[a]--;
    score[b]++;
  }
  for (let i = 1; i <= n; i++) {
    if (score[i] === n - 1) return i;
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: ['n=1 且沒有信任關係時，唯一的人就是法官。', '只檢查被信任次數會漏掉法官也信任別人的情況。'],
  check: { kind: 'fn', fn: 'findJudge', cases: [
    { args: [3, E], out: 3 },
    { args: [2, [[1, 2], [2, 1]]], out: -1 },
    { args: [1, []], out: 1 },
    { args: [3, [[1, 3], [2, 3], [3, 1]]], out: -1 },
  ] },
}

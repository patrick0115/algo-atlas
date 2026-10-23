import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 649. Dota2 Senate

const S = 'RDD'

function queueFig(): FigStep[] {
  return [
    { note: '參議員依序發言,每次可以「禁掉」對方陣營一個人(被禁的人之後都不能發言)。輪到誰時,最好的策略是禁掉**下一個要發言的敵人**', views: [arr(S.split(''), { label: 'senate' })] },
    { note: '兩個佇列存兩派人的發言順序(索引)。每次比較兩個隊首:索引小的先發言,禁掉對方的隊首', views: [arr([0], { label: 'R 佇列' }), arr([1, 2], { label: 'D 佇列' })] },
    { note: 'R(0) 比 D(1) 早 → 禁掉 D(1);R 發言完排到下一輪:索引 + n = 3', views: [arr([3], { label: 'R 佇列' }), arr([2], { label: 'D 佇列' })] },
    { note: 'D(2) 比 R(3) 早 → 禁掉 R;R 佇列空了 → Dire 獲勝', views: [arr([], { label: 'R 佇列' }), arr([5], { label: 'D 佇列', done: [0] })] },
  ]
}

function countFig(): FigStep[] {
  return [
    { note: '另一種:不用佇列,用「欠的禁令」計數。掃描字串,遇到 R:如果 D 有欠 R 的禁令,這個 R 被禁(跳過);否則 R 存活,並且欠 D 一張禁令', views: [arr(S.split(''), { label: 'senate' })] },
    { note: '反覆掃描存活的人,直到只剩一派。"RDD" → 第一輪 R 存活、D 被禁、D 存活並禁掉下一輪的 R → "D"', views: [arr(['D'], { label: '存活', done: [0] })] },
  ]
}

export const q0649: Solution = {
  id: 649,
  plain: '兩個陣營(R 和 D)的參議員排成一排,輪流發言。每次發言可以禁掉對方一個人。一直輪下去,哪一派最後會贏?',
  statement: '字串 `senate` 中 R 代表 Radiant、D 代表 Dire。依序發言,每位參議員可以**禁止**另一位參議員之後所有發言權,或在只剩自己陣營時宣布勝利。所有人都採最佳策略,回傳 `"Radiant"` 或 `"Dire"`。',
  examples: [
    { input: 'senate = "RD"', output: '"Radiant"' },
    { input: 'senate = "RDD"', output: '"Dire"' },
  ],
  constraints: ['n ≤ 10⁴'],
  insight: ['[[p:greedy]]:禁掉「下一個會發言的敵人」最好,因為他是最快能傷害我方的人', '兩個佇列存索引,隊首比較誰先發言', '發言完的人排到下一輪:索引 + n'],
  approaches: [
    {
      name: '兩個佇列模擬',
      idea: '`r`、`d` 存各派的索引;每次比較隊首,小的那個贏、加上 n 重新排隊,另一個被淘汰。',
      steps: ['把各派索引放進 r、d', '`while r and d`:彈出兩個隊首 a、b', '`a < b` → `r.append(a + n)`;否則 `d.append(b + n)`', '哪個佇列非空,哪派獲勝'],
      figure: { title: `senate = "${S}"`, steps: queueFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每次比較淘汰一個人,共最多 n 次。' },
      verdict: '最推薦,佇列把「輪流發言」模擬得很乾淨。',
      code: {
        python: `from collections import deque

def predictPartyVictory(senate):
    n = len(senate)
    r = deque(i for i, c in enumerate(senate) if c == 'R')
    d = deque(i for i, c in enumerate(senate) if c == 'D')
    while r and d:
        a, b = r.popleft(), d.popleft()
        if a < b:
            r.append(a + n)                   # a 先發言,禁掉 b,下一輪再來
        else:
            d.append(b + n)
    return 'Radiant' if r else 'Dire'`,
        c: `char *predictPartyVictory(char *senate) {
    int n = strlen(senate), cap = 2 * n + 2;
    int *r = malloc(cap * sizeof(int)), *d = malloc(cap * sizeof(int));
    int rh = 0, rt = 0, dh = 0, dt = 0;
    for (int i = 0; i < n; i++) { if (senate[i] == 'R') r[rt++] = i; else d[dt++] = i; }
    while (rh < rt && dh < dt) {
        int a = r[rh++ % cap], b = d[dh++ % cap];
        if (a < b) r[rt++ % cap] = a + n;
        else d[dt++ % cap] = b + n;
    }
    bool rw = rh < rt;
    free(r); free(d);
    return rw ? "Radiant" : "Dire";
}`,
        cpp: `string predictPartyVictory(string senate) {
    int n = senate.size();
    queue<int> r, d;
    for (int i = 0; i < n; i++) (senate[i] == 'R' ? r : d).push(i);
    while (!r.empty() && !d.empty()) {
        int a = r.front(), b = d.front();
        r.pop(); d.pop();
        if (a < b) r.push(a + n);
        else d.push(b + n);
    }
    return r.empty() ? "Dire" : "Radiant";
}`,
        java: `String predictPartyVictory(String senate) {
    int n = senate.length();
    Deque<Integer> r = new ArrayDeque<>(), d = new ArrayDeque<>();
    for (int i = 0; i < n; i++) (senate.charAt(i) == 'R' ? r : d).offer(i);
    while (!r.isEmpty() && !d.isEmpty()) {
        int a = r.poll(), b = d.poll();
        if (a < b) r.offer(a + n);
        else d.offer(b + n);
    }
    return r.isEmpty() ? "Dire" : "Radiant";
}`,
        javascript: `function predictPartyVictory(senate) {
  const n = senate.length, r = [], d = [];
  for (let i = 0; i < n; i++) (senate[i] === 'R' ? r : d).push(i);
  let rh = 0, dh = 0;
  while (rh < r.length && dh < d.length) {
    const a = r[rh++], b = d[dh++];
    if (a < b) r.push(a + n);
    else d.push(b + n);
  }
  return rh < r.length ? 'Radiant' : 'Dire';
}`,
      },
    },
    {
      name: '禁令計數 + 反覆掃描',
      idea: '`banR`、`banD` 是待執行的禁令數;掃描存活名單,被禁的跳過、存活的對敵方加一張禁令。直到只剩一派。',
      steps: ['`alive = list(senate)`', '`while` 兩派都還有人:新名單 `nxt = []`', '遇到 R:`banR > 0` → `banR -= 1`(被禁);否則存活、`banD += 1`', 'D 對稱;`alive = nxt`'],
      figure: { title: `senate = "${S}"`, steps: countFig() },
      complexity: { time: 'O(n · 輪數)', space: 'O(n)', why: '每輪掃一次 O(n);每輪至少淘汰一人,實際上幾輪就分出勝負。' },
      verdict: '想法一樣是「禁掉下一個敵人」,只是用計數取代佇列。',
      code: {
        python: `def predictPartyVictory(senate):
    alive = list(senate)
    banR = banD = 0                           # 還沒執行的禁令
    while 'R' in alive and 'D' in alive:
        nxt = []
        for c in alive:
            if c == 'R':
                if banR:
                    banR -= 1                 # 這個 R 被禁了
                else:
                    banD += 1                 # R 存活,禁掉之後第一個 D
                    nxt.append(c)
            else:
                if banD:
                    banD -= 1
                else:
                    banR += 1
                    nxt.append(c)
        alive = nxt
    return 'Radiant' if 'R' in alive else 'Dire'`,
        c: `char *predictPartyVictory(char *senate) {
    int n = strlen(senate), banR = 0, banD = 0;
    char *alive = malloc(n + 1);
    strcpy(alive, senate);
    for (;;) {
        bool hasR = strchr(alive, 'R') != NULL, hasD = strchr(alive, 'D') != NULL;
        if (!hasR || !hasD) { char *ans = hasR ? "Radiant" : "Dire"; free(alive); return ans; }
        int m = 0;
        for (int i = 0; alive[i]; i++) {
            if (alive[i] == 'R') { if (banR) banR--; else { banD++; alive[m++] = 'R'; } }
            else { if (banD) banD--; else { banR++; alive[m++] = 'D'; } }
        }
        alive[m] = '\\0';
    }
}`,
        cpp: `string predictPartyVictory(string senate) {
    string alive = senate;
    int banR = 0, banD = 0;
    while (alive.find('R') != string::npos && alive.find('D') != string::npos) {
        string nxt;
        for (char c : alive) {
            if (c == 'R') { if (banR) banR--; else { banD++; nxt += c; } }
            else { if (banD) banD--; else { banR++; nxt += c; } }
        }
        alive = nxt;
    }
    return alive.find('R') != string::npos ? "Radiant" : "Dire";
}`,
        java: `String predictPartyVictory(String senate) {
    String alive = senate;
    int banR = 0, banD = 0;
    while (alive.indexOf('R') >= 0 && alive.indexOf('D') >= 0) {
        StringBuilder nxt = new StringBuilder();
        for (char c : alive.toCharArray()) {
            if (c == 'R') { if (banR > 0) banR--; else { banD++; nxt.append(c); } }
            else { if (banD > 0) banD--; else { banR++; nxt.append(c); } }
        }
        alive = nxt.toString();
    }
    return alive.indexOf('R') >= 0 ? "Radiant" : "Dire";
}`,
        javascript: `function predictPartyVictory(senate) {
  let alive = senate, banR = 0, banD = 0;
  while (alive.includes('R') && alive.includes('D')) {
    let nxt = '';
    for (const c of alive) {
      if (c === 'R') {
        if (banR) banR--;
        else {
          banD++;
          nxt += c;
        }
      } else if (banD) banD--;
      else {
        banR++;
        nxt += c;
      }
    }
    alive = nxt;
  }
  return alive.includes('R') ? 'Radiant' : 'Dire';
}`,
      },
    },
  ],
  pitfalls: ['禁掉「最前面」的敵人而不是「下一個要發言的」:已經發言過的敵人這一輪沒威脅', '發言完的人直接丟掉:他下一輪還要發言,要排回隊尾(+n)', '單純比人數:"DDRRR" 是 Dire 贏'],
  check: {
    kind: 'fn',
    fn: 'predictPartyVictory',
    cases: [
      { args: ['RD'], out: 'Radiant' },
      { args: [S], out: 'Dire' },
      { args: ['DDRRR'], out: 'Dire' },
      { args: ['RRDDD'], out: 'Radiant' },
      { args: ['DRRDRDRDRDDRDRDR'], out: 'Radiant' },
    ],
  },
}

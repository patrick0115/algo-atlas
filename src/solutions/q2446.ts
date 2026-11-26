import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2446. Determine if Two Events Have Conflict

const E1 = ['01:15', '02:00']
const E2 = ['02:00', '03:00']

function strFig(): FigStep[] {
  return [
    {
      note: `兩個事件:event1 = [${E1.map((s) => `"${s}"`).join(', ')}]、event2 = [${E2.map((s) => `"${s}"`).join(', ')}]。要看時段有沒有碰到。`,
      line: 1,
      views: [arr(E1, { label: 'event1 [start, end]' }), arr(E2, { label: 'event2 [start, end]' })],
    },
    {
      note: '"HH:MM" 等長,字典序就是時間序。比 `start1 ≤ end2`:"01:15" ≤ "03:00" 成立。',
      line: 2,
      views: [arr(E1, { label: 'event1', highlight: [0] }), arr(E2, { label: 'event2', compare: [1] })],
    },
    {
      note: '再比 `start2 ≤ end1`:"02:00" ≤ "02:00" 成立(含端點)。兩條都成立 → 有重疊,回傳 true。',
      line: 2,
      views: [arr(E1, { label: 'event1', compare: [1], done: [0, 1] }), arr(E2, { label: 'event2', highlight: [0], done: [0, 1] })],
    },
  ]
}

function minFig(): FigStep[] {
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3))
  return [
    {
      note: '把每個 "HH:MM" 換成當天第幾分鐘:`HH × 60 + MM`。',
      line: 2,
      views: [arr(E1.map(toMin), { label: 'event1 轉分鐘' }), arr(E2.map(toMin), { label: 'event2 轉分鐘' })],
    },
    {
      note: `比 \`start1 ≤ end2\`(${toMin(E1[0])} ≤ ${toMin(E2[1])})且 \`start2 ≤ end1\`(${toMin(E2[0])} ≤ ${toMin(E1[1])}),都成立 → true。`,
      line: 5,
      views: [arr(E1.map(toMin), { label: 'event1', highlight: [0], compare: [1], done: [0, 1] }), arr(E2.map(toMin), { label: 'event2', highlight: [0], compare: [1], done: [0, 1] })],
    },
  ]
}

export const q2446: Solution = {
  id: 2446,
  plain: '兩場活動各有開始與結束時間,問它們有沒有撞在一起(只要碰到一點,連剛好交棒的那一刻也算)。',
  statement: '給兩個事件 `event1`、`event2`,各是 `[startTime, endTime]`,時間都是 `"HH:MM"`。若兩段時間有重疊(含端點相接)回傳 `true`,否則 `false`。',
  examples: [
    { input: 'event1 = ["01:15","02:00"], event2 = ["02:00","03:00"]', output: 'true', note: '剛好在 "02:00" 交接,端點相接也算重疊。' },
    { input: 'event1 = ["10:00","11:00"], event2 = ["14:00","15:00"]', output: 'false', note: '一個上午一個下午,完全沒碰到。' },
  ],
  constraints: ['兩事件都是合法的 `"HH:MM"`,且 start ≤ end', '只要判斷有無重疊,不必算重疊多長'],
  insight: ['兩段 `[s1,e1]`、`[s2,e2]` 重疊的充要條件:`s1 ≤ e2` 且 `s2 ≤ e1`', '反過來想更快:不重疊只有「一個完全在另一個之前」兩種,取反即得上式', '`"HH:MM"` 都兩位、等長,字典序剛好等於時間先後,可省下轉換'],
  approaches: [
    {
      name: '字串直接比較',
      idea: '`"HH:MM"` 等長,字典序就是時間序,直接拿字串比:`start1 ≤ end2` 且 `start2 ≤ end1`。',
      steps: ['取 `s1, e1 = event1`、`s2, e2 = event2`', '回傳 `s1 ≤ e2 且 s2 ≤ e1`(字串比較)'],
      figure: { title: '端點相接也算重疊', steps: strFig() },
      complexity: { time: 'O(1)', space: 'O(1)', why: '固定長度字串比兩次。' },
      verdict: '最推薦,一行搞定,利用 `"HH:MM"` 等長這個 [[p:string-ops]] 性質,免轉換。',
      code: {
        javascript: `function haveConflict(event1, event2) {
  return event1[0] <= event2[1] && event2[0] <= event1[1];
}`,
        python: `def haveConflict(event1, event2):
    return event1[0] <= event2[1] and event2[0] <= event1[1]`,
        c: `bool haveConflict(char **event1, int e1Size, char **event2, int e2Size) {
    return strcmp(event1[0], event2[1]) <= 0 && strcmp(event2[0], event1[1]) <= 0;
}`,
        cpp: `bool haveConflict(vector<string>& event1, vector<string>& event2) {
    return event1[0] <= event2[1] && event2[0] <= event1[1];
}`,
        java: `boolean haveConflict(String[] event1, String[] event2) {
    return event1[0].compareTo(event2[1]) <= 0 && event2[0].compareTo(event1[1]) <= 0;
}`,
      },
    },
    {
      name: '轉成分鐘',
      idea: '把 `"HH:MM"` 換成整數分鐘 `HH × 60 + MM`,再用同樣的重疊條件比。',
      steps: ['寫 `toMin("HH:MM") = HH × 60 + MM`', '`s1,e1,s2,e2` 全轉成分鐘', '回傳 `s1 ≤ e2 且 s2 ≤ e1`'],
      figure: { title: '轉分鐘再比', steps: minFig() },
      complexity: { time: 'O(1)', space: 'O(1)', why: '四次常數轉換與比較。' },
      verdict: '字串格式若不保證等長(例如 `"9:00"`),轉成數字最穩,是通用的 [[p:interval-scheduling]] 寫法。',
      code: {
        javascript: `function haveConflict(event1, event2) {
  const toMin = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  const s1 = toMin(event1[0]), e1 = toMin(event1[1]);
  const s2 = toMin(event2[0]), e2 = toMin(event2[1]);
  return s1 <= e2 && s2 <= e1;
}`,
        python: `def haveConflict(event1, event2):
    def to_min(s):
        h, m = s.split(":")
        return int(h) * 60 + int(m)
    s1, e1 = to_min(event1[0]), to_min(event1[1])
    s2, e2 = to_min(event2[0]), to_min(event2[1])
    return s1 <= e2 and s2 <= e1`,
        c: `static int toMin(const char *s) {
    return (s[0] - '0') * 600 + (s[1] - '0') * 60 + (s[3] - '0') * 10 + (s[4] - '0');
}
bool haveConflict(char **event1, int e1Size, char **event2, int e2Size) {
    int s1 = toMin(event1[0]), e1 = toMin(event1[1]);
    int s2 = toMin(event2[0]), e2 = toMin(event2[1]);
    return s1 <= e2 && s2 <= e1;
}`,
        cpp: `bool haveConflict(vector<string>& event1, vector<string>& event2) {
    auto toMin = [](const string& s) {
        return stoi(s.substr(0, 2)) * 60 + stoi(s.substr(3));
    };
    int s1 = toMin(event1[0]), e1 = toMin(event1[1]);
    int s2 = toMin(event2[0]), e2 = toMin(event2[1]);
    return s1 <= e2 && s2 <= e1;
}`,
        java: `boolean haveConflict(String[] event1, String[] event2) {
    int s1 = toMin(event1[0]), e1 = toMin(event1[1]);
    int s2 = toMin(event2[0]), e2 = toMin(event2[1]);
    return s1 <= e2 && s2 <= e1;
}
private int toMin(String s) {
    return Integer.parseInt(s.substring(0, 2)) * 60 + Integer.parseInt(s.substring(3));
}`,
      },
    },
  ],
  pitfalls: ['重疊含端點,要用 `≤` 不是 `<`:"02:00" 接 "02:00" 算衝突', '別去算「誰包含誰」的複雜情況,只有「不重疊」才兩種,取反最省', '用字串比較時務必確認格式等長補零,否則 "9:00" 會比 "10:00" 大'],
  check: {
    kind: 'fn',
    fn: 'haveConflict',
    cases: [
      { args: [['01:15', '02:00'], ['02:00', '03:00']], out: true },
      { args: [['01:00', '02:00'], ['01:20', '03:00']], out: true },
      { args: [['10:00', '11:00'], ['14:00', '15:00']], out: false },
      { args: [['00:00', '23:59'], ['00:00', '00:01']], out: true },
      { args: [['14:13', '22:08'], ['02:40', '08:08']], out: false },
    ],
  },
}

import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 881. Boats to Save People

const P = [3, 5, 3, 4, 1, 2]
const LIMIT = 5

function greedyFig(): FigStep[] {
  const s = [...P].sort((a, b) => a - b)
  const out: FigStep[] = [{ note: `一艘船最多載 2 人、限重 ${LIMIT}。先排序,讓最重的和最輕的試著擠同一艘`, views: [arr(s, { label: '體重(排序後)', pointers: [{ name: 'L', index: 0 }, { name: 'R', index: s.length - 1, color: 'b' }] })] }]
  let l = 0
  let r = s.length - 1
  let boats = 0
  const gone: number[] = []
  while (l <= r) {
    boats++
    let note: string
    if (l < r && s[l] + s[r] <= LIMIT) {
      note = `最重 ${s[r]} + 最輕 ${s[l]} = ${s[l] + s[r]} ≤ ${LIMIT} → 一起上船(第 ${boats} 艘)`
      gone.push(l, r)
      out.push({ note, views: [arr(s, { label: '體重', highlight: [l, r], dim: gone.slice(0, -2), pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })] })
      l++
    } else {
      note = l === r ? `只剩 ${s[r]} 一個人,自己一艘(第 ${boats} 艘)` : `最重 ${s[r]} + 最輕 ${s[l]} = ${s[l] + s[r]} > ${LIMIT} → 最重的連最輕的都載不了,只能自己一艘(第 ${boats} 艘)`
      gone.push(r)
      out.push({ note, views: [arr(s, { label: '體重', highlight: [r], dim: gone.slice(0, -1), pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })] })
    }
    r--
  }
  out.push({ note: `總共 ${boats} 艘`, views: [arr(s, { label: '體重', done: s.map((_, i) => i) })] })
  return out
}

function bucketFig(): FigStep[] {
  const cnt = Array(LIMIT + 1).fill(0)
  P.forEach((w) => cnt[w]++)
  return [
    { note: `體重不超過 limit,可以用計數排序取代比較排序:cnt[w] = 體重 w 的人數(這裡 limit = ${LIMIT})`, views: [arr(cnt, { label: 'cnt[0..5]' })] },
    { note: '把計數展開就是排好序的陣列,接下來和雙指標完全一樣。limit ≤ 3·10⁴ 時這樣是 O(n + limit)', views: [arr([...P].sort((a, b) => a - b), { label: '展開後' })] },
  ]
}

export const q0881: Solution = {
  id: 881,
  plain: '一群人要坐船過河,每艘船最多坐兩個人,而且總重不能超過限制。每個人都保證自己一個人坐得下。最少要幾艘船?',
  statement: '`people[i]` 是第 i 個人的體重,每艘船最多載 **2** 人且總重 ≤ `limit`(保證每個人體重 ≤ limit)。回傳載完所有人的最少船數。',
  examples: [
    { input: 'people = [1,2], limit = 3', output: '1' },
    { input: 'people = [3,2,2,1], limit = 3', output: '3' },
    { input: 'people = [3,5,3,4], limit = 5', output: '4' },
  ],
  constraints: ['n ≤ 5·10⁴', '1 ≤ people[i] ≤ limit ≤ 3·10⁴'],
  insight: ['最重的人一定要上某艘船,能和他同船的最好人選是**最輕的**(最輕的都不行,其他人更不行)', '最輕的配不了 → 最重的自己一艘', '排序後左右雙指標,每輪送走最重的(可能順便帶走最輕的)'],
  approaches: [
    {
      name: '排序 + 左右雙指標(貪心)',
      idea: '排序;`r` 每輪必走,`people[l] + people[r] ≤ limit` 時 l 也一起走。',
      steps: ['排序', '`l, r = 0, n − 1`、`boats = 0`', '`while l <= r`:`boats += 1`;`people[l] + people[r] <= limit` → `l += 1`;`r -= 1`', '回傳 boats'],
      figure: { title: `people = [${P}],limit = ${LIMIT}`, steps: greedyFig() },
      complexity: { time: 'O(n log n)', space: 'O(1) ~ O(n)', why: '排序的成本;配對 O(n)。' },
      verdict: '最推薦。[[p:greedy]] + [[p:two-pointers]]:最重的人優先處理,配最輕的最不浪費。',
      code: {
        python: `def numRescueBoats(people, limit):
    people.sort()
    l, r, boats = 0, len(people) - 1, 0
    while l <= r:
        if people[l] + people[r] <= limit:
            l += 1                            # 最輕的跟著最重的上船
        r -= 1                                # 最重的一定上這艘
        boats += 1
    return boats`,
        c: `static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }

int numRescueBoats(int *people, int peopleSize, int limit) {
    qsort(people, peopleSize, sizeof(int), cmp);
    int l = 0, r = peopleSize - 1, boats = 0;
    while (l <= r) {
        if (people[l] + people[r] <= limit) l++;
        r--;
        boats++;
    }
    return boats;
}`,
        cpp: `int numRescueBoats(vector<int>& people, int limit) {
    sort(people.begin(), people.end());
    int l = 0, r = people.size() - 1, boats = 0;
    while (l <= r) {
        if (people[l] + people[r] <= limit) l++;
        r--;
        boats++;
    }
    return boats;
}`,
        java: `int numRescueBoats(int[] people, int limit) {
    Arrays.sort(people);
    int l = 0, r = people.length - 1, boats = 0;
    while (l <= r) {
        if (people[l] + people[r] <= limit) l++;
        r--;
        boats++;
    }
    return boats;
}`,
        javascript: `function numRescueBoats(people, limit) {
  people.sort((a, b) => a - b);
  let l = 0, r = people.length - 1, boats = 0;
  while (l <= r) {
    if (people[l] + people[r] <= limit) l++;
    r--;
    boats++;
  }
  return boats;
}`,
      },
    },
    {
      name: '計數排序 + 雙指標',
      idea: '體重 ≤ limit,用 `cnt[w]` 計數排序,其餘同上。',
      steps: ['`cnt[w] += 1`', '依 w 由小到大展開回 people', '同一套雙指標'],
      figure: { title: `people = [${P}],limit = ${LIMIT}`, steps: bucketFig() },
      complexity: { time: 'O(n + limit)', space: 'O(limit)', why: '計數陣列大小是 limit。' },
      verdict: '值域小時可以把排序降到線性。面試提一下就好,寫法和第一種一樣。',
      code: {
        python: `def numRescueBoats(people, limit):
    cnt = [0] * (limit + 1)
    for w in people:
        cnt[w] += 1
    people = [w for w in range(limit + 1) for _ in range(cnt[w])]   # 計數排序
    l, r, boats = 0, len(people) - 1, 0
    while l <= r:
        if people[l] + people[r] <= limit:
            l += 1
        r -= 1
        boats += 1
    return boats`,
        c: `int numRescueBoats(int *people, int peopleSize, int limit) {
    int *cnt = calloc(limit + 1, sizeof(int)), k = 0;
    for (int i = 0; i < peopleSize; i++) cnt[people[i]]++;
    for (int w = 0; w <= limit; w++) while (cnt[w]--) people[k++] = w;
    free(cnt);
    int l = 0, r = peopleSize - 1, boats = 0;
    while (l <= r) {
        if (people[l] + people[r] <= limit) l++;
        r--;
        boats++;
    }
    return boats;
}`,
        cpp: `int numRescueBoats(vector<int>& people, int limit) {
    vector<int> cnt(limit + 1);
    for (int w : people) cnt[w]++;
    int k = 0;
    for (int w = 0; w <= limit; w++) while (cnt[w]--) people[k++] = w;
    int l = 0, r = people.size() - 1, boats = 0;
    while (l <= r) {
        if (people[l] + people[r] <= limit) l++;
        r--;
        boats++;
    }
    return boats;
}`,
        java: `int numRescueBoats(int[] people, int limit) {
    int[] cnt = new int[limit + 1];
    for (int w : people) cnt[w]++;
    int k = 0;
    for (int w = 0; w <= limit; w++) while (cnt[w]-- > 0) people[k++] = w;
    int l = 0, r = people.length - 1, boats = 0;
    while (l <= r) {
        if (people[l] + people[r] <= limit) l++;
        r--;
        boats++;
    }
    return boats;
}`,
        javascript: `function numRescueBoats(people, limit) {
  const cnt = new Array(limit + 1).fill(0);
  for (const w of people) cnt[w]++;
  let k = 0;
  for (let w = 0; w <= limit; w++) while (cnt[w]-- > 0) people[k++] = w;
  let l = 0, r = people.length - 1, boats = 0;
  while (l <= r) {
    if (people[l] + people[r] <= limit) l++;
    r--;
    boats++;
  }
  return boats;
}`,
      },
    },
  ],
  pitfalls: ['迴圈條件寫成 `l < r`:最後剩一個人時會少算一艘', '以為一艘可以坐很多人(題目限定最多 2 人)'],
  check: {
    kind: 'fn',
    fn: 'numRescueBoats',
    cases: [
      { args: [[1, 2], 3], out: 1 },
      { args: [[3, 2, 2, 1], 3], out: 3 },
      { args: [[3, 5, 3, 4], 5], out: 4 },
      { args: [P, LIMIT], out: 4 },
      { args: [[5], 5], out: 1 },
    ],
  },
}

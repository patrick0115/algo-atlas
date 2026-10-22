import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 846. Hand of Straights

const HAND = [1, 2, 3, 6, 2, 3, 4, 7, 8]
const G = 3

function greedyFig(): FigStep[] {
  const cnt = new Map<number, number>()
  for (const x of HAND) cnt.set(x, (cnt.get(x) ?? 0) + 1)
  const keys = [...cnt.keys()].sort((a, b) => a - b)
  const view = (hl: number[] = []) => kv(keys.filter((k) => cnt.get(k)! > 0).map((k) => [k, cnt.get(k)!]), '牌 → 剩幾張', hl)
  const groups: string[] = []
  const out: FigStep[] = [{ note: `每組要 ${G} 張連續的牌。目前**最小**的那張牌一定是某一組的開頭(沒有比它更小的牌可以接在它前面),所以從最小的開始湊`, views: [view(), arr(groups, { label: '湊好的組' })] }]
  for (const k of keys) {
    while (cnt.get(k)! > 0) {
      const need = Array.from({ length: G }, (_, i) => k + i)
      const missing = need.find((x) => (cnt.get(x) ?? 0) === 0)
      if (missing !== undefined) {
        out.push({ note: `最小的是 ${k},需要 ${need.join('、')},但 ${missing} 沒有了 → 湊不成 → false`, views: [view(need)] })
        return out
      }
      need.forEach((x) => cnt.set(x, cnt.get(x)! - 1))
      groups.push(need.join(''))
      out.push({ note: `目前最小的是 ${k} → 拿走 ${need.join('、')} 各一張,湊成一組`, views: [view(need), arr(groups, { label: '湊好的組' })] })
    }
  }
  out.push({ note: '全部的牌都分完了 → true', views: [arr(groups, { label: '湊好的組', done: groups.map((_, i) => i) })] })
  return out
}

export const q0846: Solution = {
  id: 846,
  plain: '一手牌要分成好幾組,每組剛好 groupSize 張、而且號碼**連續**(像 1-2-3)。問能不能剛好全部分完。訣竅:手上最小的那張牌,一定是某一組的第一張。',
  statement: '`hand[i]` 是第 i 張牌的數字。判斷能不能把所有牌分成若干組,每組剛好 `groupSize` 張,而且每組的數字是**連續的**。',
  examples: [
    { input: 'hand = [1,2,3,6,2,3,4,7,8], groupSize = 3', output: 'true', note: '[1,2,3]、[2,3,4]、[6,7,8]' },
    { input: 'hand = [1,2,3,4,5], groupSize = 4', output: 'false', note: '5 張牌分不成每組 4 張' },
  ],
  constraints: ['`1 ≤ hand.length ≤ 10⁴`', '牌的數字可以到 10⁹ → 不能開陣列計數,要用 Hash Map'],
  insight: [
    '總張數不是 groupSize 的倍數 → 一定不行',
    '關鍵觀察:目前手上**最小**的牌 x,不可能接在任何牌後面(沒有更小的),所以它一定是某組的開頭,這組一定是 x, x+1, …, x+groupSize−1',
    '所以貪心:一直拿最小的牌開一組,把需要的牌各扣一張;缺任何一張就失敗',
    '實作上:排序 + 計數,或用有序的 map(TreeMap)',
  ],
  approaches: [
    {
      name: '排序 + 計數 + 從最小的開始湊',
      idea: '數每張牌有幾張,依數字由小到大走:某張牌 x 還有 c 張,就要開 c 組從 x 開始的順子,把 x..x+g−1 各扣 c 張;有任何一張不夠就 false。',
      steps: ['`len(hand) % g != 0` → false', '`cnt = Counter(hand)`', '對每個 `x`(由小到大):`c = cnt[x]`,`c == 0` 跳過', '`for y in x..x+g−1`:`cnt[y] < c` → false;否則 `cnt[y] -= c`', '全部走完 → true'],
      figure: { title: `hand = [${HAND.join(',')}], groupSize = ${G}`, steps: greedyFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 O(n log n);之後每個不同的數處理一次,每次扣 g 格。' },
      verdict: '標準解,[[p:greedy]]:「最小的一定是開頭」讓我們不用嘗試任何分法。1296 題一模一樣。',
      code: {
        python: `from collections import Counter

def isNStraightHand(hand, groupSize):
    if len(hand) % groupSize:
        return False
    cnt = Counter(hand)
    for x in sorted(cnt):
        c = cnt[x]
        if c == 0:
            continue
        for y in range(x, x + groupSize):  # 開 c 組 x, x+1, …
            if cnt[y] < c:
                return False
            cnt[y] -= c
    return True`,
        c: `static int cmpInt(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

bool isNStraightHand(int *hand, int handSize, int groupSize) {
    if (handSize % groupSize) return false;
    qsort(hand, handSize, sizeof(int), cmpInt);
    // 排序後把相同的數壓成 (值, 次數)
    int *val = malloc(handSize * sizeof(int)), *cnt = malloc(handSize * sizeof(int)), m = 0;
    for (int i = 0; i < handSize; i++) {
        if (m && val[m - 1] == hand[i]) cnt[m - 1]++;
        else { val[m] = hand[i]; cnt[m++] = 1; }
    }
    bool ok = true;
    for (int i = 0; i < m && ok; i++) {
        int c = cnt[i];
        if (c == 0) continue;
        for (int k = 0; k < groupSize && ok; k++) {
            int j = i + k;
            if (j >= m || val[j] != val[i] + k || cnt[j] < c) ok = false;
            else cnt[j] -= c;
        }
    }
    free(val); free(cnt);
    return ok;
}`,
        cpp: `bool isNStraightHand(vector<int>& hand, int groupSize) {
    if (hand.size() % groupSize) return false;
    map<int, int> cnt;                    // 有序的 map,由小到大走
    for (int x : hand) cnt[x]++;
    for (auto& [x, c] : cnt) {
        if (c == 0) continue;
        int need = c;
        for (int y = x; y < x + groupSize; y++) {
            auto it = cnt.find(y);
            if (it == cnt.end() || it->second < need) return false;
            it->second -= need;
        }
    }
    return true;
}`,
        java: `boolean isNStraightHand(int[] hand, int groupSize) {
    if (hand.length % groupSize != 0) return false;
    TreeMap<Integer, Integer> cnt = new TreeMap<>();
    for (int x : hand) cnt.merge(x, 1, Integer::sum);
    for (int x : cnt.keySet()) {
        int c = cnt.get(x);
        if (c == 0) continue;
        for (int y = x; y < x + groupSize; y++) {
            int have = cnt.getOrDefault(y, 0);
            if (have < c) return false;
            cnt.put(y, have - c);
        }
    }
    return true;
}`,
        javascript: `function isNStraightHand(hand, groupSize) {
  if (hand.length % groupSize) return false;
  const cnt = new Map();
  for (const x of hand) cnt.set(x, (cnt.get(x) ?? 0) + 1);
  const keys = [...cnt.keys()].sort((a, b) => a - b);
  for (const x of keys) {
    const c = cnt.get(x);
    if (c === 0) continue;
    for (let y = x; y < x + groupSize; y++) {
      if ((cnt.get(y) ?? 0) < c) return false;
      cnt.set(y, cnt.get(y) - c);
    }
  }
  return true;
}`,
      },
    },
    {
      name: '不排序:從每段連續數字的起點往上湊',
      idea: '用 Hash Map 計數。對任何一張牌 x,先往下找到「這一串連續數字的起點」(x−1 沒有了的那個),從起點開始往上湊;起點一定是最小的,和方法一同樣的道理,但不需要排序。',
      steps: ['計數', '對每張牌 `x`:往下走到 `start`(`cnt[start − 1] == 0`)', '從 `start` 往上:只要 `cnt[start] > 0` 就開一組 `start..start+g−1`,不夠就 false', '`start` 處理完,`start += 1` 繼續,直到超過 x'],
      figure: { title: `hand = [${HAND.join(',')}], groupSize = ${G}`, steps: greedyFig() },
      complexity: { time: 'O(n · g)', space: 'O(n)', why: '每張牌最多被扣一次,每次扣 g 格;往下找起點的步數也被扣掉的牌數攤平。' },
      verdict: '和 [128](#/q/128)「只從起點開始數」是同一個技巧,可以避開排序。',
      code: {
        python: `from collections import Counter

def isNStraightHand(hand, groupSize):
    if len(hand) % groupSize:
        return False
    cnt = Counter(hand)
    for x in hand:
        start = x
        while cnt[start - 1] > 0:         # 往下找到這一串的起點
            start -= 1
        while start <= x:
            while cnt[start] > 0:         # 起點一定是某一組的開頭
                for y in range(start, start + groupSize):
                    if cnt[y] == 0:
                        return False
                    cnt[y] -= 1
            start += 1
    return True`,
        c: `typedef struct { int key, cnt; UT_hash_handle hh; } Item;

static Item *get(Item *m, int k) { Item *it; HASH_FIND_INT(m, &k, it); return it; }
static int cntOf(Item *m, int k) { Item *it = get(m, k); return it ? it->cnt : 0; }

bool isNStraightHand(int *hand, int handSize, int groupSize) {
    if (handSize % groupSize) return false;
    Item *m = NULL, *it, *tmp;
    for (int i = 0; i < handSize; i++) {
        it = get(m, hand[i]);
        if (!it) { it = malloc(sizeof(Item)); it->key = hand[i]; it->cnt = 0; HASH_ADD_INT(m, key, it); }
        it->cnt++;
    }
    bool ok = true;
    for (int i = 0; i < handSize && ok; i++) {
        long long start = hand[i];
        while (start - 1 >= INT_MIN && cntOf(m, (int)(start - 1)) > 0) start--;
        for (; start <= hand[i] && ok; start++)
            while (ok && cntOf(m, (int)start) > 0)
                for (int k = 0; k < groupSize && ok; k++) {
                    Item *y = get(m, (int)(start + k));
                    if (!y || y->cnt == 0) ok = false;
                    else y->cnt--;
                }
    }
    HASH_ITER(hh, m, it, tmp) { HASH_DEL(m, it); free(it); }
    return ok;
}`,
        cpp: `bool isNStraightHand(vector<int>& hand, int groupSize) {
    if (hand.size() % groupSize) return false;
    unordered_map<int, int> cnt;
    for (int x : hand) cnt[x]++;
    for (int x : hand) {
        int start = x;
        while (cnt.count(start - 1) && cnt[start - 1] > 0) start--;
        for (; start <= x; start++)
            while (cnt[start] > 0)
                for (int y = start; y < start + groupSize; y++) {
                    if (!cnt.count(y) || cnt[y] == 0) return false;
                    cnt[y]--;
                }
    }
    return true;
}`,
        java: `boolean isNStraightHand(int[] hand, int groupSize) {
    if (hand.length % groupSize != 0) return false;
    Map<Integer, Integer> cnt = new HashMap<>();
    for (int x : hand) cnt.merge(x, 1, Integer::sum);
    for (int x : hand) {
        int start = x;
        while (cnt.getOrDefault(start - 1, 0) > 0) start--;
        for (; start <= x; start++)
            while (cnt.getOrDefault(start, 0) > 0)
                for (int y = start; y < start + groupSize; y++) {
                    int have = cnt.getOrDefault(y, 0);
                    if (have == 0) return false;
                    cnt.put(y, have - 1);
                }
    }
    return true;
}`,
        javascript: `function isNStraightHand(hand, groupSize) {
  if (hand.length % groupSize) return false;
  const cnt = new Map();
  for (const x of hand) cnt.set(x, (cnt.get(x) ?? 0) + 1);
  const c = (k) => cnt.get(k) ?? 0;
  for (const x of hand) {
    let start = x;
    while (c(start - 1) > 0) start--;
    for (; start <= x; start++)
      while (c(start) > 0)
        for (let y = start; y < start + groupSize; y++) {
          if (c(y) === 0) return false;
          cnt.set(y, c(y) - 1);
        }
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: [
    '忘了先檢查總張數能不能整除 groupSize',
    '從**任意**一張牌開始湊:如果它不是最小的,可能把本來應該當開頭的小牌「孤立」掉',
    '一組湊不成時就直接 return true / 忽略:任何一組缺牌,整副牌就分不完',
  ],
  followUp: [{ q: '不要求每組大小一樣,只要求連續且長度 ≥ 3?', a: '659. Split Array into Consecutive Subsequences:貪心「能接在現有順子後面就接,不能才開新的」。' }],
  check: {
    kind: 'fn',
    fn: 'isNStraightHand',
    cases: [
      { args: [HAND, G], out: true },
      { args: [[1, 2, 3, 4, 5], 4], out: false },
      { args: [[1, 2, 3], 1], out: true },
      { args: [[1, 1, 2, 2, 3, 3], 3], out: true },
      { args: [[1, 2, 4, 5, 6, 7], 3], out: false },
      { args: [[8, 10, 12], 3], out: false },
    ],
  },
}

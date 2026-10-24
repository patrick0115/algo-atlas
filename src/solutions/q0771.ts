import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const jewels = 'aA'
const stones = 'aAAbbbb'

const scanFig: FigStep[] = [
  { note: '先拿第一顆 a，逐一看寶石清單：a 有出現，所以答案變成 1。', views: [arr(stones.split(''), { label: '石頭', highlight: [0] }), arr(jewels.split(''), { label: '寶石', compare: [0] })] },
  { note: '第二顆 A 也在清單中，答案變成 2。每顆石頭都得從清單開頭重新找。', views: [arr(stones.split(''), { label: '石頭', highlight: [1], done: [0] }), arr(jewels.split(''), { label: '寶石', compare: [1] })] },
  { note: '第三顆 A 命中，答案變成 3；後面的 b 都找不到。', views: [arr(stones.split(''), { label: '石頭', highlight: [2], dim: [3, 4, 5, 6] })] },
  { note: '走完所有石頭，得到 3。大小寫是不同字元。', views: [arr([3], { label: '寶石數', done: [0] })] },
]

const setFig: FigStep[] = [
  { note: '先把 a 和 A 放進集合；查詢時就不必逐字掃描寶石清單。', views: [arr(jewels.split(''), { label: '集合', done: [0, 1] })] },
  { note: '讀到 a，集合含有 a，計數為 1。', views: [arr(stones.split(''), { label: '石頭', highlight: [0] }), arr([1], { label: '計數' })] },
  { note: '接著兩個 A 都命中，計數來到 3。', views: [arr(stones.split(''), { label: '石頭', done: [0, 1, 2] }), arr([3], { label: '計數' })] },
  { note: '四個 b 都不在集合，答案仍是 3。', views: [arr(stones.split(''), { label: '石頭', dim: [3, 4, 5, 6] }), arr([3], { label: '答案', done: [0] })] },
]

export const q0771: Solution = {
  id: 771,
  plain: '手上有一份「寶石種類」清單，數數一袋石頭裡有幾顆屬於寶石。',
  statement: '給字串 jewels 表示寶石種類，stones 表示手上的石頭。回傳 stones 中字元也出現在 jewels 的個數；大小寫不同。',
  examples: [
    { input: 'jewels = "aA", stones = "aAAbbbb"', output: '3' },
    { input: 'jewels = "z", stones = "ZZ"', output: '0' },
  ],
  constraints: ['兩字串長度至多 50；只有英文字母，大小寫須分開。'],
  insight: ['最直接的方法是每顆石頭都去寶石清單找一次。', '若先用 [[p:hash-map]] 記住寶石種類，每顆石頭便能快速查詢。'],
  approaches: [
    {
      name: '逐顆比對',
      idea: '每顆石頭從頭掃過 jewels，只要找到相同字元就加一。',
      steps: ['計數從 0 開始。', '對每顆石頭掃過 jewels。', '遇到相同字元便加一，停止掃這顆。'],
      figure: { title: 'jewels = aA，stones = aAAbbbb', steps: scanFig },
      complexity: { time: 'O(J × S)', space: 'O(1)', why: 'J、S 分別是兩字串長度；每顆石頭最多看完 J 種寶石。' },
      verdict: '資料很短時足夠直觀；寶石種類多時會反覆掃描。',
      code: {
        python: `def numJewelsInStones(jewels, stones):
    answer = 0
    for stone in stones:
        for jewel in jewels:
            if stone == jewel:
                answer += 1  # 找到這顆石頭的種類就計一次
                break
    return answer`,
        c: `int numJewelsInStones(char *jewels, char *stones) {
    int answer = 0;
    for (int i = 0; stones[i] != '\\0'; i++) {
        for (int j = 0; jewels[j] != '\\0'; j++) {
            if (stones[i] == jewels[j]) {
                answer++;
                break;
            }
        }
    }
    return answer;
}`,
        cpp: `int numJewelsInStones(string jewels, string stones) {
    int answer = 0;
    for (char stone : stones) {
        for (char jewel : jewels) {
            if (stone == jewel) {
                answer++;
                break;
            }
        }
    }
    return answer;
}`,
        java: `int numJewelsInStones(String jewels, String stones) {
    int answer = 0;
    for (int i = 0; i < stones.length(); i++) {
        for (int j = 0; j < jewels.length(); j++) {
            if (stones.charAt(i) == jewels.charAt(j)) {
                answer++;
                break;
            }
        }
    }
    return answer;
}`,
        javascript: `function numJewelsInStones(jewels, stones) {
  let answer = 0;
  for (const stone of stones) {
    for (const jewel of jewels) {
      if (stone === jewel) {
        answer++;
        break;
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '先記住寶石種類',
      idea: '用集合記下 jewels；再逐顆查 stones 是否在集合中。',
      steps: ['把 jewels 每個字元放進集合。', '掃 stones，集合中有這個字元就加一。', '回傳計數。'],
      figure: { title: 'jewels = aA，stones = aAAbbbb', steps: setFig },
      complexity: { time: 'O(J + S)', space: 'O(J)', why: '先建集合，再掃一遍石頭。' },
      verdict: '推薦解法；也可用固定長度的字元表取代集合。',
      code: {
        python: `def numJewelsInStones(jewels, stones):
    kinds = set(jewels)  # 先記住寶石種類
    answer = 0
    for stone in stones:
        if stone in kinds:
            answer += 1  # 每顆寶石各計一次
    return answer`,
        c: `int numJewelsInStones(char *jewels, char *stones) {
    bool kinds[128] = {false};
    for (int i = 0; jewels[i] != '\\0'; i++) {
        kinds[(unsigned char) jewels[i]] = true;
    }
    int answer = 0;
    for (int i = 0; stones[i] != '\\0'; i++) {
        if (kinds[(unsigned char) stones[i]]) {
            answer++;
        }
    }
    return answer;
}`,
        cpp: `int numJewelsInStones(string jewels, string stones) {
    unordered_set<char> kinds(jewels.begin(), jewels.end());
    int answer = 0;
    for (char stone : stones) {
        if (kinds.count(stone)) {
            answer++;
        }
    }
    return answer;
}`,
        java: `int numJewelsInStones(String jewels, String stones) {
    HashSet<Character> kinds = new HashSet<>();
    for (char jewel : jewels.toCharArray()) {
        kinds.add(jewel);
    }
    int answer = 0;
    for (char stone : stones.toCharArray()) {
        if (kinds.contains(stone)) {
            answer++;
        }
    }
    return answer;
}`,
        javascript: `function numJewelsInStones(jewels, stones) {
  const kinds = new Set(jewels);
  let answer = 0;
  for (const stone of stones) {
    if (kinds.has(stone)) {
      answer++;
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['不要把大小寫折成同一種字元。', '同種類寶石可以出現多顆，每顆都要計。'],
  check: { kind: 'fn', fn: 'numJewelsInStones', cases: [
    { args: ['aA', 'aAAbbbb'], out: 3 },
    { args: ['z', 'ZZ'], out: 0 },
    { args: ['b', 'bbbb'], out: 4 },
  ] },
}

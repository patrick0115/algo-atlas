import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

// HackerRank: Counting Valleys

const PATH = 'UDDDUDUU'

/** 每一步走完後的海拔 */
const levels = (() => {
  const out: number[] = []
  let h = 0
  for (const c of PATH) out.push((h += c === 'U' ? 1 : -1))
  return out
})()

function prefixFig(): FigStep[] {
  const out: FigStep[] = [
    { note: '先把每一步走完後的海拔全部算出來:U 加 1、D 減 1', views: [arr(PATH.split(''), { label: 'path' })] },
    { note: '海拔陣列。山谷 = 一段連續的負數,從海平面往下走、再回到 0', views: [arr(PATH.split(''), { label: 'path' }), arr(levels, { label: '走完後的海拔' })] },
  ]
  const ends = levels.flatMap((h, i) => (h === 0 && i > 0 && levels[i - 1] < 0 ? [i] : []))
  out.push({
    note: `找「前一步是負的、這一步回到 0」的位置:第 ${ends.join('、')} 步 → 共 ${ends.length} 個山谷`,
    views: [arr(PATH.split(''), { label: 'path', highlight: ends }), arr(levels, { label: '走完後的海拔', highlight: ends, dim: levels.flatMap((h, i) => (h >= 0 && !ends.includes(i) ? [i] : [])) })],
  })
  return out
}

function onePassFig(): FigStep[] {
  const out: FigStep[] = [{ note: '只用一個變數 level 記目前海拔,valleys 記山谷數', views: [arr(PATH.split(''), { label: 'path' })] }]
  let level = 0
  let valleys = 0
  for (let i = 0; i < PATH.length; i++) {
    level += PATH[i] === 'U' ? 1 : -1
    const end = PATH[i] === 'U' && level === 0
    if (end) valleys++
    out.push({
      note: `第 ${i} 步 ${PATH[i]} → level = ${level}${end ? `,是 U 而且剛好回到 0 → 走出一個山谷,valleys = ${valleys}` : level < 0 ? '(在海平面下)' : ''}`,
      views: [arr(PATH.split(''), { label: 'path', highlight: [i], done: end ? [i] : [], dim: Array.from({ length: i }, (_, k) => k) })],
    })
  }
  return out
}

export const hrCountingValleys: HrSolution = {
  slug: 'counting-valleys',
  plain: '登山客記下每一步是上坡 U 還是下坡 D,從海平面出發、最後回到海平面。數他**走進並走出幾個山谷**(低於海平面的一段路)。',
  statement:
    '給步數 `steps` 和一個只含 `U`、`D` 的字串 `path`。起點與終點都在海拔 0,`U` 讓海拔加 1、`D` 減 1。**山谷**是從海平面往下走開始、到回到海平面為止的一段連續路程。回傳走過幾個山谷。',
  examples: [
    { input: 'steps = 8, path = "UDDDUDUU"', output: '1', note: '先爬上 1 又回 0,接著一路下到 -3 再爬回 0,只有後面那段是山谷' },
    { input: 'steps = 12, path = "DDUUDDUDUUUD"', output: '2' },
  ],
  constraints: [
    '`2 ≤ steps ≤ 10⁶` → 一定要 O(n),一次掃過去',
    '起點和終點都是海平面 → 每個山谷都一定會結束,不用處理「走到最後還在山谷裡」',
  ],
  insight: [
    '山谷一定是「從 0 走下去、再走回 0」。所以只要數**回到 0 的那一步**',
    '回到 0 有兩種:從 -1 走 `U` 上來(山谷結束),或從 1 走 `D` 下來(山結束)。只數前者',
    '不需要記住整條路,一個變數記目前海拔就夠了',
  ],
  approaches: [
    {
      name: '先算海拔陣列',
      idea: '把每一步後的海拔存成陣列,再找「前一格是負的、這一格是 0」的位置。',
      steps: ['`level[i]` = 走完第 i 步後的海拔', '掃一遍,`level[i] == 0` 且 `level[i-1] < 0` 就加 1'],
      figure: { title: 'path = "UDDDUDUU"', steps: prefixFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '算海拔、找回到 0 的位置各掃一次;海拔陣列長度 n。' },
      verdict: '好理解、方便除錯(可以印出海拔看),但多用了 O(n) 空間。',
      code: {
        python: `def countingValleys(steps, path):
    level = []
    h = 0
    for c in path:
        h += 1 if c == 'U' else -1
        level.append(h)  # 走完這一步的海拔
    valleys = 0
    for i in range(1, steps):
        # 從負的回到 0 → 剛走出一個山谷
        if level[i] == 0 and level[i - 1] < 0:
            valleys += 1
    return valleys`,
        c: `int countingValleys(int steps, char* path) {
    int *level = malloc(sizeof(int) * steps);
    int h = 0;
    for (int i = 0; i < steps; i++) {
        h += path[i] == 'U' ? 1 : -1;
        level[i] = h;
    }
    int valleys = 0;
    for (int i = 1; i < steps; i++) {
        if (level[i] == 0 && level[i - 1] < 0) valleys++;
    }
    free(level);
    return valleys;
}`,
        cpp: `int countingValleys(int steps, string path) {
    vector<int> level(steps);
    int h = 0;
    for (int i = 0; i < steps; i++) {
        h += path[i] == 'U' ? 1 : -1;
        level[i] = h;
    }
    int valleys = 0;
    for (int i = 1; i < steps; i++) {
        if (level[i] == 0 && level[i - 1] < 0) valleys++;
    }
    return valleys;
}`,
        java: `public static int countingValleys(int steps, String path) {
    int[] level = new int[steps];
    int h = 0;
    for (int i = 0; i < steps; i++) {
        h += path.charAt(i) == 'U' ? 1 : -1;
        level[i] = h;
    }
    int valleys = 0;
    for (int i = 1; i < steps; i++) {
        if (level[i] == 0 && level[i - 1] < 0) valleys++;
    }
    return valleys;
}`,
        javascript: `function countingValleys(steps, path) {
  const level = [];
  let h = 0;
  for (const c of path) {
    h += c === 'U' ? 1 : -1;
    level.push(h);
  }
  let valleys = 0;
  for (let i = 1; i < steps; i++) {
    if (level[i] === 0 && level[i - 1] < 0) valleys++;
  }
  return valleys;
}`,
      },
    },
    {
      name: '一次掃過:數「U 回到 0」',
      idea: '邊走邊更新海拔;這一步是 `U` 而且走完剛好是 0,就是走出一個山谷。',
      steps: ['`level = 0`、`valleys = 0`', '每一步:`U` 加 1、`D` 減 1', '若這步是 `U` 且 `level == 0` → `valleys += 1`'],
      figure: { title: 'path = "UDDDUDUU"', steps: onePassFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個字元看一次,只用兩個整數。' },
      verdict: '最佳解,也是考場上最快寫完的寫法。',
      code: {
        python: `def countingValleys(steps, path):
    level = 0
    valleys = 0
    for c in path:
        level += 1 if c == 'U' else -1
        # 往上走回到海平面 → 剛走出一個山谷
        if c == 'U' and level == 0:
            valleys += 1
    return valleys`,
        c: `int countingValleys(int steps, char* path) {
    int level = 0, valleys = 0;
    for (int i = 0; i < steps; i++) {
        level += path[i] == 'U' ? 1 : -1;
        if (path[i] == 'U' && level == 0) valleys++;
    }
    return valleys;
}`,
        cpp: `int countingValleys(int steps, string path) {
    int level = 0, valleys = 0;
    for (char c : path) {
        level += c == 'U' ? 1 : -1;
        if (c == 'U' && level == 0) valleys++;
    }
    return valleys;
}`,
        java: `public static int countingValleys(int steps, String path) {
    int level = 0, valleys = 0;
    for (char c : path.toCharArray()) {
        level += c == 'U' ? 1 : -1;
        if (c == 'U' && level == 0) valleys++;
    }
    return valleys;
}`,
        javascript: `function countingValleys(steps, path) {
  let level = 0;
  let valleys = 0;
  for (const c of path) {
    level += c === 'U' ? 1 : -1;
    if (c === 'U' && level === 0) valleys++;
  }
  return valleys;
}`,
      },
    },
  ],
  pitfalls: [
    '數成「海拔變成負的」的次數也對,但要寫成「從 0 走 `D` 到 -1」;只寫 `level < 0` 會把山谷裡的每一步都算進去',
    '回到 0 不一定是山谷結束,也可能是從山上下來;要判斷這一步是 `U`',
  ],
  followUp: [{ q: '如果要數「山」(高於海平面的段落)?', a: '對稱:這一步是 `D` 而且走完回到 0。' }],
  check: {
    kind: 'fn',
    fn: 'countingValleys',
    cases: [
      { args: [8, 'UDDDUDUU'], out: 1 },
      { args: [12, 'DDUUDDUDUUUD'], out: 2 },
      { args: [2, 'UD'], out: 0 },
      { args: [2, 'DU'], out: 1 },
      { args: [10, 'DUDUUDDUDU'], out: 4 },
    ],
  },
}

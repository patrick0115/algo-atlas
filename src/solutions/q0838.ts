import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 838. Push Dominoes

const D = '.L.R...LR..L..'

function segFig(): FigStep[] {
  const s = 'L' + D + 'R'
  const a = s.split('')
  const out: FigStep[] = [{ note: '頭尾各補一張虛擬骨牌:左邊補 L、右邊補 R(不影響結果)。然後只看「兩張推過的骨牌」中間那段 "."', views: [arr(a, { label: '補上頭尾', dim: [0, a.length - 1] })] }]
  let prev = 0
  const res = [...a]
  for (let j = 1; j < a.length; j++) {
    if (a[j] === '.') continue
    const i = prev
    const L = a[i]
    const R = a[j]
    let note: string
    if (L === R) {
      for (let k = i + 1; k < j; k++) res[k] = L
      note = `${L} … ${R}:兩端同方向 → 中間全部倒向 ${L}`
    } else if (L === 'R' && R === 'L') {
      for (let k = i + 1, m = j - 1; k < m; k++, m--) {
        res[k] = 'R'
        res[m] = 'L'
      }
      note = `R … L:兩邊往中間倒,左半倒 R、右半倒 L;中間剩一張的話兩邊力量抵消,保持直立`
    } else {
      note = `L … R:兩端背對背,中間沒有力量 → 維持 "."`
    }
    if (j - i > 1) out.push({ note: `區段 [${i}, ${j}]:${note}`, views: [arr([...res], { label: '目前結果', range: [i, j], highlight: Array.from({ length: j - i - 1 }, (_, k) => i + 1 + k) })] })
    prev = j
  }
  out.push({ note: `拿掉頭尾的虛擬骨牌 → "${res.slice(1, -1).join('')}"`, views: [arr(res.slice(1, -1), { label: '答案' })] })
  return out
}

function forceFig(): FigStep[] {
  const n = D.length
  const f = Array(n).fill(0)
  let force = 0
  for (let i = 0; i < n; i++) {
    if (D[i] === 'R') force = n
    else if (D[i] === 'L') force = 0
    else force = Math.max(force - 1, 0)
    f[i] += force
  }
  const right = [...f]
  force = 0
  for (let i = n - 1; i >= 0; i--) {
    if (D[i] === 'L') force = n
    else if (D[i] === 'R') force = 0
    else force = Math.max(force - 1, 0)
    f[i] -= force
  }
  const res = f.map((x) => (x > 0 ? 'R' : x < 0 ? 'L' : '.'))
  return [
    { note: `從左往右算「往右推的力量」:遇到 R 力量設成 n = ${n},每往右一格減 1,遇到 L 歸零`, views: [arr(D.split(''), { label: 'dominoes' }), arr(right, { label: '往右的力量' })] },
    { note: '從右往左算「往左推的力量」,用減的。最後每格看淨力:正 → R,負 → L,0 → 不動', views: [arr(f, { label: '淨力(右 − 左)' }), arr(res, { label: '答案' })] },
  ]
}

export const q0838: Solution = {
  id: 838,
  plain: '一排直立的骨牌,有些一開始被往左推(L)、有些往右推(R)、其他沒動(.)。倒下的骨牌每秒推倒旁邊一張;一張骨牌同時被左右兩邊推,就會保持直立。最後每張骨牌是什麼狀態?',
  statement: '給字串 `dominoes`(`L` 表示往左推、`R` 表示往右推、`.` 表示直立)。每秒倒下的骨牌會推倒同方向相鄰的直立骨牌;同時受到兩側推力的骨牌保持直立。已倒下的骨牌不會再對已倒下的骨牌施力。回傳最終狀態。',
  examples: [
    { input: 'dominoes = "RR.L"', output: '"RR.L"', note: '第三張同時被左右推,保持直立' },
    { input: 'dominoes = ".L.R...LR..L.."', output: '"LL.RR.LLRRLL.."' },
  ],
  constraints: ['n ≤ 10⁵ → 不要一秒一秒模擬(最壞 O(n²))'],
  insight: [
    '只有「兩張推過的骨牌」之間的那段 "." 會被影響,而且只跟兩端是什麼有關',
    '四種情況:L…L → 全 L;R…R → 全 R;L…R → 不動;R…L → 往中間倒,奇數長度時正中間那張不動',
    '頭尾補上虛擬的 L 和 R,就不用另外處理兩端',
  ],
  approaches: [
    {
      name: '找區段,看兩端',
      idea: '`s = "L" + d + "R"`;對相鄰兩個非 "." 的位置 i < j,依 `(s[i], s[j])` 填中間。',
      steps: ['`s = "L" + dominoes + "R"`,`prev = 0`', '`for j in 1..`:`s[j] != "."` 時處理 (prev, j)', '同方向 → 中間全填那個方向;R…L → 兩邊往中間填;L…R → 不動', '`prev = j`;最後去掉頭尾'],
      figure: { title: `dominoes = "${D}"`, steps: segFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個位置只被填一次;輸出要 n 格。' },
      verdict: '最推薦。把「模擬」轉成「分段 + 四種情況」,是[[p:two-pointers]]的區段處理。',
      code: {
        python: `def pushDominoes(dominoes):
    s = 'L' + dominoes + 'R'                  # 虛擬的頭尾,不影響結果
    res = list(s)
    i = 0
    for j in range(1, len(s)):
        if s[j] == '.':
            continue
        if s[i] == s[j]:                      # L…L 或 R…R
            for k in range(i + 1, j):
                res[k] = s[i]
        elif s[i] == 'R' and s[j] == 'L':     # 往中間倒
            l, r = i + 1, j - 1
            while l < r:
                res[l], res[r] = 'R', 'L'
                l += 1
                r -= 1
        i = j                                 # L…R:不動
    return ''.join(res[1:-1])`,
        c: `char *pushDominoes(char *dominoes) {
    int n = strlen(dominoes);
    char *s = malloc(n + 3);
    s[0] = 'L'; memcpy(s + 1, dominoes, n); s[n + 1] = 'R'; s[n + 2] = '\\0';
    for (int i = 0, j = 1; j < n + 2; j++) {
        if (s[j] == '.') continue;
        if (s[i] == s[j]) for (int k = i + 1; k < j; k++) s[k] = s[i];
        else if (s[i] == 'R') for (int l = i + 1, r = j - 1; l < r; l++, r--) { s[l] = 'R'; s[r] = 'L'; }
        i = j;
    }
    s[n + 1] = '\\0';
    memmove(s, s + 1, n + 1);                 // 去掉頭尾
    return s;
}`,
        cpp: `string pushDominoes(string dominoes) {
    string s = "L" + dominoes + "R";
    for (int i = 0, j = 1; j < (int)s.size(); j++) {
        if (s[j] == '.') continue;
        if (s[i] == s[j]) for (int k = i + 1; k < j; k++) s[k] = s[i];
        else if (s[i] == 'R') for (int l = i + 1, r = j - 1; l < r; l++, r--) { s[l] = 'R'; s[r] = 'L'; }
        i = j;
    }
    return s.substr(1, s.size() - 2);
}`,
        java: `String pushDominoes(String dominoes) {
    char[] s = ("L" + dominoes + "R").toCharArray();
    for (int i = 0, j = 1; j < s.length; j++) {
        if (s[j] == '.') continue;
        if (s[i] == s[j]) for (int k = i + 1; k < j; k++) s[k] = s[i];
        else if (s[i] == 'R') for (int l = i + 1, r = j - 1; l < r; l++, r--) { s[l] = 'R'; s[r] = 'L'; }
        i = j;
    }
    return new String(s, 1, s.length - 2);
}`,
        javascript: `function pushDominoes(dominoes) {
  const s = ('L' + dominoes + 'R').split('');
  for (let i = 0, j = 1; j < s.length; j++) {
    if (s[j] === '.') continue;
    if (s[i] === s[j]) for (let k = i + 1; k < j; k++) s[k] = s[i];
    else if (s[i] === 'R') for (let l = i + 1, r = j - 1; l < r; l++, r--) { s[l] = 'R'; s[r] = 'L'; }
    i = j;
  }
  return s.slice(1, -1).join('');
}`,
      },
    },
    {
      name: '左右兩次掃描算淨力',
      idea: '從左算往右的力量(遇 R 設成 n、每格減 1、遇 L 歸零),從右算往左的力量;淨力的正負決定方向。',
      steps: ['`f = [0] * n`', '左到右:R → `force = n`;L → 0;"." → `max(force − 1, 0)`;`f[i] += force`', '右到左:L → `force = n`;R → 0;"." → 遞減;`f[i] −= force`', '`f[i] > 0` → R,`< 0` → L,`0` → "."'],
      figure: { title: `dominoes = "${D}"`, steps: forceFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '兩次掃描,一個力量陣列。' },
      verdict: '不用分情況討論,只要算力量。力量越近越大,剛好表達「誰先推到」。',
      code: {
        python: `def pushDominoes(dominoes):
    n = len(dominoes)
    f = [0] * n
    force = 0
    for i, c in enumerate(dominoes):          # 往右的力量
        force = n if c == 'R' else 0 if c == 'L' else max(force - 1, 0)
        f[i] += force
    force = 0
    for i in range(n - 1, -1, -1):            # 往左的力量
        c = dominoes[i]
        force = n if c == 'L' else 0 if c == 'R' else max(force - 1, 0)
        f[i] -= force
    return ''.join('R' if x > 0 else 'L' if x < 0 else '.' for x in f)`,
        c: `char *pushDominoes(char *dominoes) {
    int n = strlen(dominoes), force = 0;
    int *f = calloc(n, sizeof(int));
    for (int i = 0; i < n; i++) {
        force = dominoes[i] == 'R' ? n : dominoes[i] == 'L' ? 0 : (force > 0 ? force - 1 : 0);
        f[i] += force;
    }
    force = 0;
    for (int i = n - 1; i >= 0; i--) {
        force = dominoes[i] == 'L' ? n : dominoes[i] == 'R' ? 0 : (force > 0 ? force - 1 : 0);
        f[i] -= force;
    }
    char *res = malloc(n + 1);
    for (int i = 0; i < n; i++) res[i] = f[i] > 0 ? 'R' : f[i] < 0 ? 'L' : '.';
    res[n] = '\\0';
    free(f);
    return res;
}`,
        cpp: `string pushDominoes(string dominoes) {
    int n = dominoes.size(), force = 0;
    vector<int> f(n);
    for (int i = 0; i < n; i++) {
        force = dominoes[i] == 'R' ? n : dominoes[i] == 'L' ? 0 : max(force - 1, 0);
        f[i] += force;
    }
    force = 0;
    for (int i = n - 1; i >= 0; i--) {
        force = dominoes[i] == 'L' ? n : dominoes[i] == 'R' ? 0 : max(force - 1, 0);
        f[i] -= force;
    }
    string res(n, '.');
    for (int i = 0; i < n; i++) if (f[i]) res[i] = f[i] > 0 ? 'R' : 'L';
    return res;
}`,
        java: `String pushDominoes(String dominoes) {
    int n = dominoes.length(), force = 0;
    int[] f = new int[n];
    for (int i = 0; i < n; i++) {
        char c = dominoes.charAt(i);
        force = c == 'R' ? n : c == 'L' ? 0 : Math.max(force - 1, 0);
        f[i] += force;
    }
    force = 0;
    for (int i = n - 1; i >= 0; i--) {
        char c = dominoes.charAt(i);
        force = c == 'L' ? n : c == 'R' ? 0 : Math.max(force - 1, 0);
        f[i] -= force;
    }
    StringBuilder sb = new StringBuilder();
    for (int x : f) sb.append(x > 0 ? 'R' : x < 0 ? 'L' : '.');
    return sb.toString();
}`,
        javascript: `function pushDominoes(dominoes) {
  const n = dominoes.length, f = new Array(n).fill(0);
  let force = 0;
  for (let i = 0; i < n; i++) {
    const c = dominoes[i];
    force = c === 'R' ? n : c === 'L' ? 0 : Math.max(force - 1, 0);
    f[i] += force;
  }
  force = 0;
  for (let i = n - 1; i >= 0; i--) {
    const c = dominoes[i];
    force = c === 'L' ? n : c === 'R' ? 0 : Math.max(force - 1, 0);
    f[i] -= force;
  }
  return f.map((x) => (x > 0 ? 'R' : x < 0 ? 'L' : '.')).join('');
}`,
      },
    },
  ],
  pitfalls: ['R…L 中間是奇數張時,正中間那張要保持 "."', 'L…R 中間不會動:L 往左倒、R 往右倒,背對背', '一秒一秒模擬:最壞要 n 秒、每秒 O(n)'],
  check: {
    kind: 'fn',
    fn: 'pushDominoes',
    cases: [
      { args: ['RR.L'], out: 'RR.L' },
      { args: [D], out: 'LL.RR.LLRRLL..' },
      { args: ['.'], out: '.' },
      { args: ['R...'], out: 'RRRR' },
      { args: ['...L'], out: 'LLLL' },
      { args: ['R....L'], out: 'RRRLLL' },
      { args: ['R.....L'], out: 'RRR.LLL' },
    ],
  },
}

import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1041. Robot Bounded In Circle

const CMD = 'GL'
const DIRS = [[0, 1], [-1, 0], [0, -1], [1, 0]] // 北、西、南、東(左轉 = 索引 +1)
const NAMES = ['北', '西', '南', '東']

function plane(path: [number, number][], label: string): GridViewData {
  const R = 2
  const cells: (number | string)[][] = Array.from({ length: 2 * R + 1 }, () => Array(2 * R + 1).fill(''))
  path.forEach(([x, y], i) => (cells[R - y][x + R] = i === 0 ? '起' : i))
  const last = path[path.length - 1]
  return { kind: 'grid', label, cells, rowLabels: Array.from({ length: 2 * R + 1 }, (_, r) => String(R - r)), colLabels: Array.from({ length: 2 * R + 1 }, (_, c) => String(c - R)), marks: { hl: [[R - last[1], last[0] + R]], path: path.slice(0, -1).map(([x, y]) => [R - y, x + R] as [number, number]) } }
}

function simFig(): FigStep[] {
  let x = 0
  let y = 0
  let d = 0
  const path: [number, number][] = [[0, 0]]
  const out: FigStep[] = [{ note: `機器人從原點面向北,指令 "${CMD}" 會一直重複。關鍵觀察:跑完**一輪**指令後,只要「回到原點」或「方向不是北」,就一定會繞圈`, views: [plane(path, '起點,面向北')] }]
  for (let round = 1; round <= 4; round++) {
    for (const c of CMD) {
      if (c === 'G') {
        x += DIRS[d][0]
        y += DIRS[d][1]
        path.push([x, y])
      } else if (c === 'L') d = (d + 1) % 4
      else d = (d + 3) % 4
    }
    out.push({ note: round === 1 ? `第 1 輪結束:在 (${x}, ${y}),面向${NAMES[d]}。不在原點,但方向變了 → 之後每輪都轉 90°,最多 4 輪就會轉回來` : `第 ${round} 輪結束:在 (${x}, ${y}),面向${NAMES[d]}${round === 4 ? ' → 回到原點了,確實在繞圈 → true' : ''}`, views: [plane(path, `第 ${round} 輪後`)] })
  }
  return out
}

function fourFig(): FigStep[] {
  return [
    { note: '不想證明那個觀察的話:直接把指令跑 4 次。方向每輪轉的角度一樣,4 輪後一定轉回北(0°、90°×4、180°×4、270°×4 都是 360° 的倍數)', views: [arr(['GL', 'GL', 'GL', 'GL'], { label: '跑 4 輪' })] },
    { note: '4 輪後回到原點 → 會繞圈;不在原點 → 每 4 輪都往同一個方向漂移,會跑到無限遠', views: [arr(['(0,0)'], { label: '4 輪後的位置', done: [0] })] },
  ]
}

export const q1041: Solution = {
  id: 1041,
  plain: '一台機器人在無限大的平面上,從原點面向北出發。它照著一串指令走(G 前進一步、L 左轉、R 右轉),走完就從頭再來,永遠不停。會不會一直在某個範圍內繞圈,不會跑到無限遠?',
  statement: '機器人從 (0, 0) 面向北出發,重複執行指令字串 `instructions`(`G` 直走一格、`L` 左轉 90°、`R` 右轉 90°)。若存在一個圓使機器人永遠不會離開,回傳 true。',
  examples: [
    { input: 'instructions = "GGLLGG"', output: 'true', note: '走兩步、迴轉、走回原點' },
    { input: 'instructions = "GG"', output: 'false', note: '一直往北走' },
    { input: 'instructions = "GL"', output: 'true', note: '每 4 輪走一個正方形' },
  ],
  constraints: ['指令長度 ≤ 100'],
  insight: ['只要模擬**一輪**:回到原點 → 顯然會繞圈', '沒回到原點但方向變了 → 每輪的位移會跟著旋轉,2 輪或 4 輪後抵銷,回到原點', '沒回到原點而且方向還是北 → 每輪都往同一個方向漂移,一去不回'],
  approaches: [
    {
      name: '模擬一輪,看位置和方向',
      idea: '跑一輪指令,回傳 `(x, y) == (0, 0) or d != 北`。',
      steps: ['`x = y = 0`、`d = 0`(北)', 'G → 往 d 的方向走一格;L → `d = (d + 1) % 4`;R → `d = (d + 3) % 4`', '回傳 `(x == 0 and y == 0) or d != 0`'],
      figure: { title: `instructions = "${CMD}"`, steps: simFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只跑一輪。' },
      verdict: '最推薦。方向用 0..3 的索引配一張位移表,左右轉就是加減 1。',
      code: {
        python: `def isRobotBounded(instructions):
    dirs = [(0, 1), (-1, 0), (0, -1), (1, 0)]  # 北、西、南、東:左轉 = 索引 +1
    x = y = d = 0
    for c in instructions:
        if c == 'G':
            x += dirs[d][0]; y += dirs[d][1]
        elif c == 'L':
            d = (d + 1) % 4
        else:
            d = (d + 3) % 4                   # 右轉 = 左轉三次
    return (x == 0 and y == 0) or d != 0      # 回到原點,或方向變了`,
        c: `bool isRobotBounded(char *instructions) {
    int dx[] = {0, -1, 0, 1}, dy[] = {1, 0, -1, 0}, x = 0, y = 0, d = 0;
    for (char *p = instructions; *p; p++) {
        if (*p == 'G') { x += dx[d]; y += dy[d]; }
        else if (*p == 'L') d = (d + 1) % 4;
        else d = (d + 3) % 4;
    }
    return (x == 0 && y == 0) || d != 0;
}`,
        cpp: `bool isRobotBounded(string instructions) {
    int dx[] = {0, -1, 0, 1}, dy[] = {1, 0, -1, 0}, x = 0, y = 0, d = 0;
    for (char c : instructions) {
        if (c == 'G') { x += dx[d]; y += dy[d]; }
        else if (c == 'L') d = (d + 1) % 4;
        else d = (d + 3) % 4;
    }
    return (x == 0 && y == 0) || d != 0;
}`,
        java: `boolean isRobotBounded(String instructions) {
    int[] dx = {0, -1, 0, 1}, dy = {1, 0, -1, 0};
    int x = 0, y = 0, d = 0;
    for (char c : instructions.toCharArray()) {
        if (c == 'G') { x += dx[d]; y += dy[d]; }
        else if (c == 'L') d = (d + 1) % 4;
        else d = (d + 3) % 4;
    }
    return (x == 0 && y == 0) || d != 0;
}`,
        javascript: `function isRobotBounded(instructions) {
  const dx = [0, -1, 0, 1], dy = [1, 0, -1, 0];
  let x = 0, y = 0, d = 0;
  for (const c of instructions) {
    if (c === 'G') {
      x += dx[d];
      y += dy[d];
    } else if (c === 'L') d = (d + 1) % 4;
    else d = (d + 3) % 4;
  }
  return (x === 0 && y === 0) || d !== 0;
}`,
      },
    },
    {
      name: '直接模擬四輪',
      idea: '把指令跑 4 次,回到原點就是 true。',
      steps: ['重複 4 次執行指令', '回傳 `x == 0 and y == 0`'],
      figure: { title: `instructions = "${CMD}"`, steps: fourFig() },
      complexity: { time: 'O(4n)', space: 'O(1)', why: '跑四輪。' },
      verdict: '不用推理「方向變了就會繞圈」,只要知道 4 輪後方向一定轉回來。',
      code: {
        python: `def isRobotBounded(instructions):
    dirs = [(0, 1), (-1, 0), (0, -1), (1, 0)]
    x = y = d = 0
    for c in instructions * 4:                # 4 輪後方向一定轉回北
        if c == 'G':
            x += dirs[d][0]; y += dirs[d][1]
        elif c == 'L':
            d = (d + 1) % 4
        else:
            d = (d + 3) % 4
    return x == 0 and y == 0`,
        c: `bool isRobotBounded(char *instructions) {
    int dx[] = {0, -1, 0, 1}, dy[] = {1, 0, -1, 0}, x = 0, y = 0, d = 0;
    for (int r = 0; r < 4; r++)
        for (char *p = instructions; *p; p++) {
            if (*p == 'G') { x += dx[d]; y += dy[d]; }
            else if (*p == 'L') d = (d + 1) % 4;
            else d = (d + 3) % 4;
        }
    return x == 0 && y == 0;
}`,
        cpp: `bool isRobotBounded(string instructions) {
    int dx[] = {0, -1, 0, 1}, dy[] = {1, 0, -1, 0}, x = 0, y = 0, d = 0;
    for (int r = 0; r < 4; r++)
        for (char c : instructions) {
            if (c == 'G') { x += dx[d]; y += dy[d]; }
            else if (c == 'L') d = (d + 1) % 4;
            else d = (d + 3) % 4;
        }
    return x == 0 && y == 0;
}`,
        java: `boolean isRobotBounded(String instructions) {
    int[] dx = {0, -1, 0, 1}, dy = {1, 0, -1, 0};
    int x = 0, y = 0, d = 0;
    for (int r = 0; r < 4; r++)
        for (char c : instructions.toCharArray()) {
            if (c == 'G') { x += dx[d]; y += dy[d]; }
            else if (c == 'L') d = (d + 1) % 4;
            else d = (d + 3) % 4;
        }
    return x == 0 && y == 0;
}`,
        javascript: `function isRobotBounded(instructions) {
  const dx = [0, -1, 0, 1], dy = [1, 0, -1, 0];
  let x = 0, y = 0, d = 0;
  for (const c of instructions.repeat(4)) {
    if (c === 'G') {
      x += dx[d];
      y += dy[d];
    } else if (c === 'L') d = (d + 1) % 4;
    else d = (d + 3) % 4;
  }
  return x === 0 && y === 0;
}`,
      },
    },
  ],
  pitfalls: ['只檢查「有沒有回到原點」:"GL" 一輪後不在原點,但會繞圈', '左右轉的方向表弄反:L 和 R 對調後結果剛好也會錯'],
  check: {
    kind: 'fn',
    fn: 'isRobotBounded',
    cases: [
      { args: ['GGLLGG'], out: true },
      { args: ['GG'], out: false },
      { args: [CMD], out: true },
      { args: ['GLRLLGLL'], out: true },
      { args: ['GRGLGRG'], out: true },
      { args: ['GLGRG'], out: false },
    ],
  },
}

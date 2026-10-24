import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const P = [[10, 16], [2, 8], [1, 6], [7, 12]]

function mergeFig(): FigStep[] {
  return [
    { note: '先按左端排序：[1,6]、[2,8]、[7,12]、[10,16]。同一支箭必須落在該組每個區間的交集。', views: [arr(['[1,6]', '[2,8]', '[7,12]', '[10,16]'], { label: '按起點排序' })] },
    { note: '[1,6] 與 [2,8] 的交集是 [2,6]，可用同一支箭；右端縮成 6。', views: [arr(['[2,6]', '[7,12]', '[10,16]'], { label: '目前交集', highlight: [0] })] },
    { note: '[7,12] 起點 7>交集右端 6，沒有重疊，要開第二組。', views: [arr(['[2,6]', '[7,12]', '[10,16]'], { label: '兩組', done: [0], highlight: [1] })] },
    { note: '[7,12] 與 [10,16] 交成 [10,12]；總共兩組，所以需要 2 支箭。', views: [arr(['[2,6]', '[10,12]'], { label: '各組交集', done: [0, 1] })] },
  ]
}

function endFig(): FigStep[] {
  return [
    { note: '按右端排序後，最早結束的是 [1,6]。在 x=6 射第一箭，盡量照顧後面的區間。', views: [arr(['[1,6]', '[2,8]', '[7,12]', '[10,16]'], { label: '按終點排序', highlight: [0] })] },
    { note: '[2,8] 的左端 2≤6，也被第一箭射中；不增加箭數。', views: [arr(['[1,6]', '[2,8]'], { label: '第一箭 x=6', done: [0, 1] })] },
    { note: '[7,12] 的左端 7>6，第一箭射不到，在它的右端 12 射第二箭。', views: [arr(['[7,12]', '[10,16]'], { label: '第二箭 x=12', highlight: [0] })] },
    { note: '[10,16] 的左端 10≤12，也被第二箭射中；答案 2。', views: [arr([6, 12], { label: '兩支箭的位置', done: [0, 1] })] },
  ]
}

export const q0452: Solution = {
  id: 452,
  plain: '每個氣球占據數線上一段閉區間。一支垂直射出的箭能刺破所有包含它位置的氣球；求最少箭數。',
  statement: '給每個氣球的水平範圍 points[i]=[start,end]，箭可以在任意 x 垂直射出。求刺破所有氣球的最少箭數；區間端點也算射中。',
  examples: [{ input: 'points = [[10,16],[2,8],[1,6],[7,12]]', output: '2' }, { input: 'points = [[1,2],[3,4],[5,6],[7,8]]', output: '4' }, { input: 'points = [[1,2],[2,3],[3,4],[4,5]]', output: '2' }],
  constraints: ['`1 ≤ points.length ≤ 10⁵`', '端點在 32 位有號整數範圍內。'],
  insight: ['一組氣球若有共同交集，就能共用一支箭；一旦交集消失，必須開新組。', '依右端排序的 [[p:greedy]] 更直接：射在目前最早結束區間的右端，為後面留下最大機會。'],
  approaches: [
    {
      name: '按起點排序，維持共同交集',
      idea: '依起點由小到大掃描，維持目前可用箭位置的最右界；新區間若不相交就開新箭。',
      steps: ['依左端排序。', '初始化一支箭，交集右端為第一區間的右端。', '若新區間左端大於交集右端，新增箭並重設右端。', '否則交集右端縮為兩者右端的較小值。'],
      figure: { title: 'points = [[10,16],[2,8],[1,6],[7,12]]', steps: mergeFig() },
      complexity: { time: 'O(n log n)', space: 'O(1) 額外', why: '排序為主要成本；掃描只用交集右端與計數。' },
      verdict: '用區間交集理解分組很直觀。',
      code: {
        python: `def findMinArrowShots(points):
    points.sort(key=lambda interval: interval[0])
    arrows = 1
    right = points[0][1]
    for start, end in points[1:]:
        if start > right:
            arrows += 1  # 與目前整組已無共同位置
            right = end
        else:
            right = min(right, end)
    return arrows`,
        c: `int compareStart452(const void *a, const void *b) {
    int *x = *(int **)a;
    int *y = *(int **)b;
    return (x[0] > y[0]) - (x[0] < y[0]);
}

int findMinArrowShots(int **points, int pointsSize, int *pointsColSize) {
    qsort(points, pointsSize, sizeof(int *), compareStart452);
    int arrows = 1;
    int right = points[0][1];
    for (int i = 1; i < pointsSize; i++) {
        if (points[i][0] > right) {
            arrows++;
            right = points[i][1];
        } else if (points[i][1] < right) {
            right = points[i][1];
        }
    }
    return arrows;
}`,
        cpp: `int findMinArrowShots(vector<vector<int>>& points) {
    sort(points.begin(), points.end(), [](const auto& a, const auto& b) {
        return a[0] < b[0];
    });
    int arrows = 1;
    int right = points[0][1];
    for (int i = 1; i < (int)points.size(); i++) {
        if (points[i][0] > right) {
            arrows++;
            right = points[i][1];
        } else {
            right = min(right, points[i][1]);
        }
    }
    return arrows;
}`,
        java: `int findMinArrowShots(int[][] points) {
    Arrays.sort(points, (a, b) -> Integer.compare(a[0], b[0]));
    int arrows = 1;
    int right = points[0][1];
    for (int i = 1; i < points.length; i++) {
        if (points[i][0] > right) {
            arrows++;
            right = points[i][1];
        } else {
            right = Math.min(right, points[i][1]);
        }
    }
    return arrows;
}`,
        javascript: `function findMinArrowShots(points) {
  points.sort((a, b) => a[0] - b[0]);
  let arrows = 1;
  let right = points[0][1];
  for (let i = 1; i < points.length; i++) {
    if (points[i][0] > right) {
      arrows++;
      right = points[i][1];
    } else {
      right = Math.min(right, points[i][1]);
    }
  }
  return arrows;
}`,
      },
    },
    {
      name: '按終點排序的貪心射箭',
      idea: '每次在尚未射中的氣球裡，挑最早結束者的右端射箭；後續包含這個 x 的氣球自動被射中。',
      steps: ['依右端排序。', '第一箭射在第一個右端。', '若下一個左端大於目前箭位置，新增箭並射在它的右端。', '掃完回傳箭數。'],
      figure: { title: 'points = [[10,16],[2,8],[1,6],[7,12]]', steps: endFig() },
      complexity: { time: 'O(n log n)', space: 'O(1) 額外', why: '排序後只需掃描一遍。' },
      verdict: '標準區間排程貪心；端點相等時同一箭仍能射中。',
      code: {
        python: `def findMinArrowShots(points):
    points.sort(key=lambda interval: interval[1])
    arrows = 1
    shot = points[0][1]
    for start, end in points[1:]:
        if start > shot:
            arrows += 1
            shot = end  # 在最早結束處射新箭
    return arrows`,
        c: `int compareEnd452(const void *a, const void *b) {
    int *x = *(int **)a;
    int *y = *(int **)b;
    return (x[1] > y[1]) - (x[1] < y[1]);
}

int findMinArrowShots(int **points, int pointsSize, int *pointsColSize) {
    qsort(points, pointsSize, sizeof(int *), compareEnd452);
    int arrows = 1;
    int shot = points[0][1];
    for (int i = 1; i < pointsSize; i++) {
        if (points[i][0] > shot) {
            arrows++;
            shot = points[i][1];
        }
    }
    return arrows;
}`,
        cpp: `int findMinArrowShots(vector<vector<int>>& points) {
    sort(points.begin(), points.end(), [](const auto& a, const auto& b) {
        return a[1] < b[1];
    });
    int arrows = 1;
    int shot = points[0][1];
    for (int i = 1; i < (int)points.size(); i++) {
        if (points[i][0] > shot) {
            arrows++;
            shot = points[i][1];
        }
    }
    return arrows;
}`,
        java: `int findMinArrowShots(int[][] points) {
    Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));
    int arrows = 1;
    int shot = points[0][1];
    for (int i = 1; i < points.length; i++) {
        if (points[i][0] > shot) {
            arrows++;
            shot = points[i][1];
        }
    }
    return arrows;
}`,
        javascript: `function findMinArrowShots(points) {
  points.sort((a, b) => a[1] - b[1]);
  let arrows = 1;
  let shot = points[0][1];
  for (let i = 1; i < points.length; i++) {
    if (points[i][0] > shot) {
      arrows++;
      shot = points[i][1];
    }
  }
  return arrows;
}`,
      },
    },
  ],
  pitfalls: ['區間是閉區間，`start == shot` 仍被射中；要用 `>` 才開新箭。', '排序比較不能用 C/Java 的直接相減：端點可能溢位。'],
  check: { kind: 'fn', fn: 'findMinArrowShots', cases: [{ args: [P], out: 2 }, { args: [[[1, 2], [3, 4], [5, 6], [7, 8]]], out: 4 }, { args: [[[1, 2], [2, 3], [3, 4], [4, 5]]], out: 2 }, { args: [[[1, 2]]], out: 1 }] },
}

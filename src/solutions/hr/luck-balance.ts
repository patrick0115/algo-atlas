import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const CONTESTS = [[5, 1], [2, 1], [1, 1], [8, 1], [10, 0], [5, 0]]

function choiceFig(): FigStep[] {
  const important = CONTESTS.filter(row => row[1] === 1)
  const fixed = CONTESTS.filter(row => row[1] === 0).reduce((s, row) => s + row[0], 0)
  const steps: FigStep[] = []
  let best = -Infinity
  for (let mask = 0; mask < 1 << important.length; mask++) {
    let lost = 0
    let luck = fixed
    for (let i = 0; i < important.length; i++) {
      const lose = (mask & (1 << i)) !== 0
      if (lose) lost++
      luck += lose ? important[i][0] : -important[i][0]
    }
    if (lost <= 2) best = Math.max(best, luck)
    steps.push({ note: `重要比賽選擇 ${important.map((row, i) => (mask & (1 << i)) ? `輸 ${row[0]}` : `贏 ${row[0]}`).join('、')}；輸 ${lost} 場，幸運值 ${luck}${lost > 2 ? '，超過上限' : `，目前最佳 ${best}` }。`, views: [arr(important.map(row => row[0]), { label: '重要比賽幸運值', highlight: important.flatMap((_, i) => mask & (1 << i) ? [i] : []) }), kv([['重要場次輸掉', lost], ['這種選法', luck], ['目前最佳', best]], '列舉狀態')] })
  }
  return steps
}

function greedyFig(): FigStep[] {
  const important = CONTESTS.filter(row => row[1] === 1).map(row => row[0]).sort((a, b) => b - a)
  const unimportant = CONTESTS.filter(row => row[1] === 0).map(row => row[0])
  const steps: FigStep[] = []
  let luck = 0
  for (const x of unimportant) {
    luck += x
    steps.push({ note: `不重要的比賽幸運值 ${x}，輸掉不佔額度，直接加上；目前 ${luck}。`, views: [arr(unimportant, { label: '不重要比賽', highlight: [unimportant.indexOf(x)] }), kv([['累計幸運值', luck]], '處理狀態')] })
  }
  for (let i = 0; i < important.length; i++) {
    const x = important[i]
    luck += i < 2 ? x : -x
    steps.push({ note: `重要比賽幸運值 ${x}；${i < 2 ? '仍有可輸額度，輸掉加' : '額度用完，贏下扣'} ${x}，目前 ${luck}。`, views: [arr(important, { label: '重要比賽降冪', highlight: [i] }), kv([['已使用輸掉額度', Math.min(i + 1, 2)], ['幸運值', luck]], '決策狀態')] })
  }
  return steps
}

export const hrLuckBalance: HrSolution = {
  slug: 'luck-balance',
  plain: '像手上有幾張「可以故意輸」的通行證；把通行證用在輸了最賺的關鍵比賽。',
  statement: '每場比賽有幸運值 L 和重要標記 I。輸掉加 L，贏下扣 L；不重要比賽可以任意輸，重要比賽最多只能輸 k 場。請安排勝敗，使最終幸運值最大。',
  examples: [
    { input: 'k = 2, contests = [[5,1],[2,1],[1,1],[8,1],[10,0],[5,0]]', output: '25', note: '不重要兩場都輸得 15；重要場輸 8、5，贏 2、1，淨得 10，總共 25。' },
    { input: 'k = 1, contests = [[5,1],[2,1],[1,0]]', output: '4', note: '輸重要的 5、贏重要的 2，另輸不重要的 1，得到 4。' },
  ],
  constraints: [
    '重要比賽可達數十或上百場 → 枚舉所有勝敗組合會指數爆炸。',
    '幸運值非負 → 不重要比賽一律輸不會更差；重要比賽優先輸高值。',
  ],
  insight: [
    '暴力先對每個重要比賽試「輸」與「贏」，排除輸超過 k 場的選法。',
    '不重要比賽輸了會增加幸運值，又不佔額度，所以可直接全輸。',
    '重要比賽若一場高值被迫贏、另一場低值卻輸，交換兩者會多得兩倍差額；因此用 [[p:greedy]] 選最高的 k 場輸。',
  ],
  approaches: [
    {
      name: '列舉重要比賽勝敗',
      idea: '不重要場次全部輸，重要場次嘗試所有輸贏組合。',
      steps: ['先把不重要場次的幸運值加進固定基礎。', '對每場重要比賽遞迴試輸（加 L）與贏（減 L）。', '重要場輸掉不超過 k 時更新最大值。'],
      figure: { title: '四場重要比賽的勝敗選擇', steps: choiceFig() },
      complexity: { time: 'O(2^m)', space: 'O(m)', why: 'm 場重要比賽各有兩種選擇；遞迴深度為 m。' },
      verdict: '能清楚看見限制條件；重要場次多時不可行。',
      code: {
        python: `def luckBalance(k, contests):
    fixed = sum(luck for luck, important in contests if important == 0)
    important = [luck for luck, flag in contests if flag == 1]
    best = float('-inf')
    def search(i, lost, score):
        nonlocal best
        if i == len(important):
            best = max(best, score)
            return
        search(i + 1, lost, score - important[i])
        if lost < k:
            search(i + 1, lost + 1, score + important[i])  # 使用一個可輸額度
    search(0, 0, fixed)
    return best`,
        c: `int searchLuck(int i, int lost, int k, int n, int* values, int score) {
    if (i == n) return score;
    int win = searchLuck(i + 1, lost, k, n, values, score - values[i]);
    if (lost == k) return win;
    int lose = searchLuck(i + 1, lost + 1, k, n, values, score + values[i]);
    return win > lose ? win : lose;
}

int luckBalance(int k, int contests_rows, int contests_columns, int** contests) {
    int* values = malloc(sizeof(int) * contests_rows);
    int count = 0, fixed = 0;
    for (int i = 0; i < contests_rows; i++) {
        if (contests[i][1]) values[count++] = contests[i][0];
        else fixed += contests[i][0];
    }
    int result = searchLuck(0, 0, k, count, values, fixed);
    free(values);
    return result;
}`,
        cpp: `int luckBalance(int k, vector<vector<int>> contests) {
    vector<int> values;
    int fixed = 0;
    for (auto row : contests) {
        if (row[1]) values.push_back(row[0]);
        else fixed += row[0];
    }
    function<int(int, int, int)> search = [&](int i, int lost, int score) {
        if (i == (int)values.size()) return score;
        int best = search(i + 1, lost, score - values[i]);
        if (lost < k) best = max(best, search(i + 1, lost + 1, score + values[i]));
        return best;
    };
    return search(0, 0, fixed);
}`,
        java: `public static int luckBalance(int k, List<List<Integer>> contests) {
    List<Integer> values = new ArrayList<>();
    int fixed = 0;
    for (List<Integer> row : contests) {
        if (row.get(1) == 1) values.add(row.get(0));
        else fixed += row.get(0);
    }
    class Search {
        int run(int i, int lost, int score) {
            if (i == values.size()) return score;
            int best = run(i + 1, lost, score - values.get(i));
            if (lost < k) best = Math.max(best, run(i + 1, lost + 1, score + values.get(i)));
            return best;
        }
    }
    return new Search().run(0, 0, fixed);
}`,
        javascript: `function luckBalance(k, contests) {
  const important = [];
  let fixed = 0;
  for (const [luck, flag] of contests) {
    if (flag === 1) important.push(luck);
    else fixed += luck;
  }
  function search(i, lost, score) {
    if (i === important.length) return score;
    let best = search(i + 1, lost, score - important[i]);
    if (lost < k) best = Math.max(best, search(i + 1, lost + 1, score + important[i]));
    return best;
  }
  return search(0, 0, fixed);
}`,
      },
    },
    {
      name: '高幸運值優先輸',
      idea: '不重要場全輸；重要場按幸運值降冪，只輸前 k 場。',
      steps: ['將不重要比賽的幸運值直接加入答案。', '收集重要比賽的幸運值並降冪排序。', '前 k 場加上幸運值，後面的場次扣掉幸運值。'],
      figure: { title: '保留兩次重要場的可輸額度', steps: greedyFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序重要場幸運值；其他部分只需掃一次。' },
      verdict: '交換高低值的勝敗可證明這樣安排一定最佳。',
      code: {
        python: `def luckBalance(k, contests):
    total = 0
    important = []
    for luck, flag in contests:
        if flag == 0:
            total += luck
        else:
            important.append(luck)
    important.sort(reverse=True)
    for i, luck in enumerate(important):
        # 最大的 k 場輸，剩下的必須贏
        total += luck if i < k else -luck
    return total`,
        c: `int compareDesc(const void* a, const void* b) {
    int x = *(const int*)a;
    int y = *(const int*)b;
    return (x < y) - (x > y);
}

int luckBalance(int k, int contests_rows, int contests_columns, int** contests) {
    int* values = malloc(sizeof(int) * contests_rows);
    int count = 0, total = 0;
    for (int i = 0; i < contests_rows; i++) {
        if (contests[i][1]) values[count++] = contests[i][0];
        else total += contests[i][0];
    }
    qsort(values, count, sizeof(int), compareDesc);
    for (int i = 0; i < count; i++) {
        total += i < k ? values[i] : -values[i];
    }
    free(values);
    return total;
}`,
        cpp: `int luckBalance(int k, vector<vector<int>> contests) {
    vector<int> important;
    int total = 0;
    for (auto row : contests) {
        if (row[1]) important.push_back(row[0]);
        else total += row[0];
    }
    sort(important.begin(), important.end(), greater<int>());
    for (int i = 0; i < (int)important.size(); i++) {
        total += i < k ? important[i] : -important[i];
    }
    return total;
}`,
        java: `public static int luckBalance(int k, List<List<Integer>> contests) {
    List<Integer> important = new ArrayList<>();
    int total = 0;
    for (List<Integer> row : contests) {
        if (row.get(1) == 1) important.add(row.get(0));
        else total += row.get(0);
    }
    important.sort(Collections.reverseOrder());
    for (int i = 0; i < important.size(); i++) {
        total += i < k ? important.get(i) : -important.get(i);
    }
    return total;
}`,
        javascript: `function luckBalance(k, contests) {
  const important = [];
  let total = 0;
  for (const [luck, flag] of contests) {
    if (flag === 1) important.push(luck);
    else total += luck;
  }
  important.sort((a, b) => b - a);
  for (let i = 0; i < important.length; i++) {
    total += i < k ? important[i] : -important[i];
  }
  return total;
}`,
      },
    },
  ],
  pitfalls: [
    '最多輸 k 場重要比賽，不代表一定有 k 場；用 i<k 自然處理 k 超過重要場次。',
    '贏會扣幸運值，不是單純不增加；後段重要場要減掉。',
    '不重要的比賽不佔可輸額度，可以全部輸掉。',
  ],
  check: {
    kind: 'fn',
    fn: 'luckBalance',
    cases: [
      { args: [2, [[5, 1], [2, 1], [1, 1], [8, 1], [10, 0], [5, 0]]], out: 25 },
      { args: [1, [[5, 1], [2, 1], [1, 0]]], out: 4 },
      { args: [0, [[5, 1]]], out: -5 },
      { args: [1, [[5, 1]]], out: 5 },
      { args: [0, [[2, 0], [3, 0]]], out: 5 },
      { args: [2, [[1, 1], [1, 1], [1, 1]]], out: 1 },
    ],
  },
}

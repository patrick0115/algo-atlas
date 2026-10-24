import { arr } from '../engine/helpers'
import type { Solution } from './types'

const P = [[7, 0], [4, 4], [7, 1], [5, 0], [6, 1], [5, 2]]
const CHECK = {
  python: `
def queueCheck(people):
    from collections import Counter
    original = Counter(map(tuple, people))
    out = reconstructQueue(people)
    if Counter(map(tuple, out)) != original:
        return -1
    for i, (height, k) in enumerate(out):
        if sum(p[0] >= height for p in out[:i]) != k:
            return -1
    return len(out)`,
  c: `
int queueCheck(int **people, int peopleSize, int *peopleColSize) {
    int *h = malloc(peopleSize * sizeof(int));
    int *k = malloc(peopleSize * sizeof(int));
    int *used = calloc(peopleSize, sizeof(int));
    for (int i = 0; i < peopleSize; i++) {
        h[i] = people[i][0];
        k[i] = people[i][1];
    }
    int size = 0, *cols = NULL;
    int **out = reconstructQueue(people, peopleSize, peopleColSize, &size, &cols);
    if (size != peopleSize) return -1;
    for (int i = 0; i < size; i++) {
        int found = 0, ahead = 0;
        for (int j = 0; j < size; j++) {
            if (!used[j] && h[j] == out[i][0] && k[j] == out[i][1]) {
                used[j] = 1;
                found = 1;
                break;
            }
        }
        if (!found) return -1;
        for (int j = 0; j < i; j++) if (out[j][0] >= out[i][0]) ahead++;
        if (ahead != out[i][1]) return -1;
    }
    free(h);
    free(k);
    free(used);
    return size;
}`,
  cpp: `
int queueCheck(vector<vector<int>> people) {
    auto original = people;
    auto out = reconstructQueue(people);
    sort(original.begin(), original.end());
    auto sorted = out;
    sort(sorted.begin(), sorted.end());
    if (sorted != original) return -1;
    for (int i = 0; i < (int)out.size(); i++) {
        int ahead = 0;
        for (int j = 0; j < i; j++) if (out[j][0] >= out[i][0]) ahead++;
        if (ahead != out[i][1]) return -1;
    }
    return out.size();
}`,
  java: `
int queueCheck(int[][] people) {
    int[][] original = people.clone();
    int[][] out = reconstructQueue(people);
    if (out.length != original.length) return -1;
    boolean[] used = new boolean[original.length];
    for (int i = 0; i < out.length; i++) {
        boolean found = false;
        for (int j = 0; j < original.length; j++) {
            if (!used[j] && Arrays.equals(out[i], original[j])) {
                used[j] = true;
                found = true;
                break;
            }
        }
        if (!found) return -1;
        int ahead = 0;
        for (int j = 0; j < i; j++) if (out[j][0] >= out[i][0]) ahead++;
        if (ahead != out[i][1]) return -1;
    }
    return out.length;
}`,
  javascript: `
function queueCheck(people) {
  const original = people.map((p) => [...p]);
  const out = reconstructQueue(people);
  if (out.length !== original.length) return -1;
  const used = new Array(original.length).fill(false);
  for (let i = 0; i < out.length; i++) {
    const j = original.findIndex((p, j) => !used[j] && p[0] === out[i][0] && p[1] === out[i][1]);
    if (j < 0) return -1;
    used[j] = true;
    let ahead = 0;
    for (let j = 0; j < i; j++) if (out[j][0] >= out[i][0]) ahead++;
    if (ahead !== out[i][1]) return -1;
  }
  return out.length;
}`,
}

export const q0406: Solution = {
  id: 406,
  plain: '每個人給身高 h 和前方至少一樣高的人數 k；把所有人排回符合條件的隊伍。',
  statement: 'people[i]=[h,k]，其中 k 是排在此人前面且身高 ≥ h 的人數。回傳符合所有人的隊伍。',
  examples: [{ input: 'people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]', output: '[[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]' }, { input: 'people = [[6,0],[5,0],[4,0],[3,2],[2,2],[1,4]]', output: '[[4,0],[5,0],[2,2],[3,2],[1,4],[6,0]]' }],
  constraints: ['最多 2000 人；輸入保證存在合法隊伍。'],
  insight: ['先放高的人時，之後插入較矮的人不影響高的人所看到的「至少一樣高」人數。', '因此按身高遞減，再把每人插入索引 k。', '也可以反過來由矮到高，把人放到第 k+1 個空位；這是 [[p:greedy]]。'],
  approaches: [
    {
      name: '高個子先插入',
      idea: '身高高到低、同身高 k 小到大排序，依 k 插入現有隊伍。',
      steps: ['依 h 遞減、k 遞增排序', '逐一把此人插入結果索引 k', '後續較矮者不改變已放者的計數'],
      figure: { title: 'people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]', steps: [
        { note: '先排兩個 7：k=0 的在前，k=1 的在後。', views: [arr(['7,0', '7,1'], { label: '目前隊伍' })] },
        { note: '6,1 插入索引 1，前面剛好一個身高至少 6 的人。', views: [arr(['7,0', '6,1', '7,1'], { label: '目前隊伍', highlight: [1] })] },
        { note: '5,0 插最前；5,2 插索引 2，兩者都滿足要求。', views: [arr(['5,0', '7,0', '5,2', '6,1', '7,1'], { label: '目前隊伍', highlight: [0, 2] })] },
        { note: '最後 4,4 插索引 4；前面四人全比它高，完成隊伍。', views: [arr(['5,0', '7,0', '5,2', '6,1', '4,4', '7,1'], { label: '答案', done: [0, 1, 2, 3, 4, 5] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '排序 O(n log n)，陣列插入每次可搬動 O(n) 人。' },
      verdict: '推薦；先固定高個子後，k 就等於應插入的位置。',
      code: {
        python: `def reconstructQueue(people):
    people.sort(key=lambda p: (-p[0], p[1]))
    out = []
    for person in people:
        out.insert(person[1], person)  # 目前前方的人都至少一樣高
    return out${CHECK.python}`,
        c: `static int cmpQueueDesc(const void *x, const void *y) {
    const int *a = *(int *const *)x, *b = *(int *const *)y;
    if (a[0] != b[0]) return (b[0] > a[0]) - (b[0] < a[0]);
    return (a[1] > b[1]) - (a[1] < b[1]);
}

int **reconstructQueue(int **people, int peopleSize, int *peopleColSize, int *returnSize, int **returnColumnSizes) {
    qsort(people, peopleSize, sizeof(int *), cmpQueueDesc);
    int **out = malloc(peopleSize * sizeof(int *));
    *returnColumnSizes = malloc(peopleSize * sizeof(int));
    *returnSize = peopleSize;
    for (int i = 0; i < peopleSize; i++) {
        int at = people[i][1];
        for (int j = i; j > at; j--) out[j] = out[j - 1];
        out[at] = people[i];
    }
    for (int i = 0; i < peopleSize; i++) (*returnColumnSizes)[i] = 2;
    return out;
}${CHECK.c}`,
        cpp: `vector<vector<int>> reconstructQueue(vector<vector<int>>& people) {
    sort(people.begin(), people.end(), [](const auto& a, const auto& b) {
        if (a[0] != b[0]) return a[0] > b[0];
        return a[1] < b[1];
    });
    vector<vector<int>> out;
    for (auto person : people) out.insert(out.begin() + person[1], person);
    return out;
}${CHECK.cpp}`,
        java: `int[][] reconstructQueue(int[][] people) {
    Arrays.sort(people, (a, b) -> a[0] != b[0] ? Integer.compare(b[0], a[0]) : Integer.compare(a[1], b[1]));
    List<int[]> out = new ArrayList<>();
    for (int[] person : people) out.add(person[1], person);
    return out.toArray(new int[people.length][]);
}${CHECK.java}`,
        javascript: `function reconstructQueue(people) {
  people.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const out = [];
  for (const person of people) out.splice(person[1], 0, person);
  return out;
}${CHECK.javascript}`,
      },
    },
    {
      name: '矮個子先填空位',
      idea: '短的人看不到已放的更短者，所以把他放到第 k+1 個尚空的位置。',
      steps: ['依 h 遞增、同身高 k 遞減排序', '掃描隊伍空位，跳過 k 個，將此人放入下一個', '所有人放完即為答案'],
      figure: { title: 'people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]', steps: [
        { note: '最矮的 4,4 需要前方四個更高或同高的人，放在第 5 個空位。', views: [arr(['□', '□', '□', '□', '4,4', '□'], { label: '隊伍', highlight: [4] })] },
        { note: '5,2 先放（同身高 k 大者優先），放到第 3 個空位。', views: [arr(['□', '□', '5,2', '□', '4,4', '□'], { label: '隊伍', highlight: [2] })] },
        { note: '5,0 放第一個空位；6,1 放第二個尚空位，即索引 3。', views: [arr(['5,0', '□', '5,2', '6,1', '4,4', '□'], { label: '隊伍', highlight: [0, 3] })] },
        { note: '7,1 放第二個空位到尾端；7,0 填最後的前方空位，完成。', views: [arr(['5,0', '7,0', '5,2', '6,1', '4,4', '7,1'], { label: '答案', done: [0, 1, 2, 3, 4, 5] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每放一人最多掃 n 個位置。' },
      verdict: '反向思考也能解；同身高必須按 k 遞減放置。',
      code: {
        python: `def reconstructQueue(people):
    people.sort(key=lambda p: (p[0], -p[1]))
    out = [None] * len(people)
    for person in people:
        skip = person[1]
        for i in range(len(out)):
            if out[i] is None:
                if skip == 0:
                    out[i] = person  # 第 k+1 個空位
                    break
                skip -= 1
    return out${CHECK.python}`,
        c: `static int cmpQueueAsc(const void *x, const void *y) {
    const int *a = *(int *const *)x, *b = *(int *const *)y;
    if (a[0] != b[0]) return (a[0] > b[0]) - (a[0] < b[0]);
    return (b[1] > a[1]) - (b[1] < a[1]);
}

int **reconstructQueue(int **people, int peopleSize, int *peopleColSize, int *returnSize, int **returnColumnSizes) {
    qsort(people, peopleSize, sizeof(int *), cmpQueueAsc);
    int **out = calloc(peopleSize, sizeof(int *));
    *returnColumnSizes = malloc(peopleSize * sizeof(int));
    *returnSize = peopleSize;
    for (int p = 0; p < peopleSize; p++) {
        int skip = people[p][1];
        for (int i = 0; i < peopleSize; i++) {
            if (!out[i]) {
                if (skip == 0) {
                    out[i] = people[p];
                    break;
                }
                skip--;
            }
        }
    }
    for (int i = 0; i < peopleSize; i++) (*returnColumnSizes)[i] = 2;
    return out;
}${CHECK.c}`,
        cpp: `vector<vector<int>> reconstructQueue(vector<vector<int>>& people) {
    sort(people.begin(), people.end(), [](const auto& a, const auto& b) {
        if (a[0] != b[0]) return a[0] < b[0];
        return a[1] > b[1];
    });
    vector<vector<int>> out(people.size());
    for (auto person : people) {
        int skip = person[1];
        for (auto &slot : out) {
            if (slot.empty()) {
                if (skip == 0) {
                    slot = person;
                    break;
                }
                skip--;
            }
        }
    }
    return out;
}${CHECK.cpp}`,
        java: `int[][] reconstructQueue(int[][] people) {
    Arrays.sort(people, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(b[1], a[1]));
    int[][] out = new int[people.length][];
    for (int[] person : people) {
        int skip = person[1];
        for (int i = 0; i < out.length; i++) {
            if (out[i] == null) {
                if (skip == 0) {
                    out[i] = person;
                    break;
                }
                skip--;
            }
        }
    }
    return out;
}${CHECK.java}`,
        javascript: `function reconstructQueue(people) {
  people.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const out = new Array(people.length).fill(null);
  for (const person of people) {
    let skip = person[1];
    for (let i = 0; i < out.length; i++) {
      if (out[i] === null) {
        if (skip === 0) {
          out[i] = person;
          break;
        }
        skip--;
      }
    }
  }
  return out;
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['高到低法同身高要按 k 遞增，否則插入位置可能尚不存在。', '矮到高法同身高要按 k 遞減，否則已放的同高者會破壞空位計數。'],
  check: { kind: 'fn', fn: 'queueCheck', cases: [
    { args: [P], out: 6 },
    { args: [[[6, 0], [5, 0], [4, 0], [3, 2], [2, 2], [1, 4]]], out: 6 },
    { args: [[[5, 0]]], out: 1 },
  ] },
}

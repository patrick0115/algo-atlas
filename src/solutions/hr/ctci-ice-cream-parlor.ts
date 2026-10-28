import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const COST = [2, 1, 3, 5, 6]

function pairFig(): FigStep[] {
  const steps: FigStep[] = []
  for (let i = 0; i < COST.length; i++) {
    for (let j = i + 1; j < COST.length; j++) {
      const sum = COST[i] + COST[j]
      steps.push({ note: `試口味編號 ${i + 1} 與 ${j + 1}：${COST[i]} + ${COST[j]} = ${sum}，${sum === 5 ? '剛好花完 5，找到答案' : '尚未符合'}。`, views: [arr(COST, { label: '口味價格', highlight: [i, j] }), kv([['預算', 5], ['本組總價', sum]], '兩兩檢查')] })
      if (sum === 5) return steps
    }
  }
  return steps
}

function mapFig(): FigStep[] {
  const steps: FigStep[] = []
  const seen = new Map<number, number>()
  for (let i = 0; i < COST.length; i++) {
    const price = COST[i]
    const need = 5 - price
    const old = seen.get(need)
    steps.push({ note: `讀到編號 ${i + 1}、價格 ${price}，還需要 ${need}；${old === undefined ? '之前沒見過，先記下此價格與編號' : `之前編號 ${old} 的價格符合，答案是 ${old} ${i + 1}`}。`, views: [arr(COST, { label: '目前口味', highlight: [i] }), kv([...seen], '價格 → 已見編號', old === undefined ? [] : [need]), kv([['需要補價', need]], '查找狀態')] })
    if (old !== undefined) break
    if (!seen.has(price)) seen.set(price, i + 1)
  }
  return steps
}

export const hrCtciIceCreamParlor: HrSolution = {
  slug: 'ctci-ice-cream-parlor',
  plain: '兩個人帶著剛好的零錢買兩種冰淇淋；看一種價格時，立刻找之前有沒有另一種剛好補齊。',
  statement: '給每種口味的價格 cost 和總預算 money。找兩個不同口味，使價格和恰好等於 money；印出它們在原陣列中從 1 開始的編號，小編號在前。題目保證唯一一組答案。',
  examples: [
    { input: 'cost = [2,1,3,5,6], money = 5', output: '1 3', note: '編號 1 的 2 元與編號 3 的 3 元合起來是 5。' },
    { input: 'cost = [4,3,2,4], money = 8', output: '1 4', note: '兩種口味雖然同價，編號不同，仍能組成答案。' },
  ],
  constraints: [
    '價格可能重複 → 必須區分口味編號，不能只回傳價格。',
    '題目保證唯一解 → 找到一組後可立即停止。',
    '口味數可能很大 → O(n²) 逐對比較不如 [[p:hash-map]] 一次掃描。',
  ],
  insight: [
    '先直接試所有 i<j 的價格和，這同時保證兩個編號不同。',
    '固定目前價格 p 時，配對價格被預算唯一決定為 money-p；不用再試所有前面口味。',
    '把已見價格對應到編號，先查補價再記目前價格，避免同一口味配到自己；想法也與 [1](#/q/1) 相同。',
  ],
  approaches: [
    {
      name: '逐對嘗試',
      idea: '用雙層迴圈檢查所有不同口味組合。',
      steps: ['讓第一個編號 i 從頭走到尾。', '第二個編號 j 從 i+1 走起，避免同一口味與重複配對。', '價格和等於 money 時回傳 [i+1,j+1]，印出兩個編號。'],
      figure: { title: '預算 5，逐對檢查口味', steps: pairFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '最壞要檢查約 n²/2 對，只用固定數量變數。' },
      verdict: '最容易理解，適合小資料；口味多時可能超時。',
      code: {
        python: `def findFlavors(cost, money):
    for i in range(len(cost)):
        for j in range(i + 1, len(cost)):
            # 編號從 1 起算
            if cost[i] + cost[j] == money:
                return [i + 1, j + 1]

def whatFlavors(cost, money):
    a, b = findFlavors(cost, money)
    print(a, b)`,
        c: `int* findFlavors(int cost_count, int* cost, int money, int* result_count) {
    int* result = malloc(2 * sizeof(int));
    *result_count = 2;
    for (int i = 0; i < cost_count; i++) {
        for (int j = i + 1; j < cost_count; j++) {
            if (cost[i] + cost[j] == money) {
                result[0] = i + 1;
                result[1] = j + 1;
                return result;
            }
        }
    }
    return result;
}

void whatFlavors(int cost_count, int* cost, int money) {
    int count;
    int* ids = findFlavors(cost_count, cost, money, &count);
    printf("%d %d\\n", ids[0], ids[1]);
    free(ids);
}`,
        cpp: `vector<int> findFlavors(vector<int> cost, int money) {
    for (int i = 0; i < (int)cost.size(); i++) {
        for (int j = i + 1; j < (int)cost.size(); j++) {
            if (cost[i] + cost[j] == money) {
                return {i + 1, j + 1};
            }
        }
    }
    return {};
}

void whatFlavors(vector<int> cost, int money) {
    vector<int> ids = findFlavors(cost, money);
    cout << ids[0] << " " << ids[1] << endl;
}`,
        java: `public static List<Integer> findFlavors(List<Integer> cost, int money) {
    for (int i = 0; i < cost.size(); i++) {
        for (int j = i + 1; j < cost.size(); j++) {
            if (cost.get(i) + cost.get(j) == money) {
                return Arrays.asList(i + 1, j + 1);
            }
        }
    }
    return new ArrayList<>();
}

public static void whatFlavors(List<Integer> cost, int money) {
    List<Integer> ids = findFlavors(cost, money);
    System.out.println(ids.get(0) + " " + ids.get(1));
}`,
        javascript: `function findFlavors(cost, money) {
  for (let i = 0; i < cost.length; i++) {
    for (let j = i + 1; j < cost.length; j++) {
      if (cost[i] + cost[j] === money) {
        return [i + 1, j + 1];
      }
    }
  }
  return [];
}

function whatFlavors(cost, money) {
  console.log(findFlavors(cost, money).join(' '));
}`,
      },
    },
    {
      name: '價格對編號的查找表',
      idea: '掃到價格 p 時，立刻查之前是否出現 money-p。',
      steps: ['建立空的價格 → 編號表。', '對每個價格 p，先查 money-p；若存在就回傳之前編號和目前編號。', '未找到才把 p 與目前的 1 起算編號寫入表。'],
      figure: { title: '預算 5，查找補價', steps: mapFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每種口味做一次平均 O(1) 的查找，表最多存 n 種價格。' },
      verdict: '先查後存是關鍵，讓兩種相同價格也能用不同編號配對。',
      code: {
        python: `def findFlavors(cost, money):
    seen = {}
    for i, price in enumerate(cost, 1):
        need = money - price
        if need in seen:
            return [seen[need], i]  # 先前編號一定較小
        if price not in seen:
            seen[price] = i
    return []

def whatFlavors(cost, money):
    print(*findFlavors(cost, money))`,
        c: `typedef struct { int key, id, used; } Slot;

/* 開放定址雜湊表:價格 → 第一次出現的編號;cost 可到 10^9,不能直接當陣列索引 */
int findSlot(Slot* table, int capacity, int key) {
    unsigned int h = (unsigned int)key * 2654435761u;
    int pos = (int)(h & (capacity - 1));
    while (table[pos].used && table[pos].key != key) pos = (pos + 1) & (capacity - 1);
    return pos;
}

int* findFlavors(int cost_count, int* cost, int money, int* result_count) {
    int* result = malloc(2 * sizeof(int));
    *result_count = 2;
    int capacity = 1;
    while (capacity < cost_count * 2) capacity <<= 1;
    Slot* seen = calloc(capacity, sizeof(Slot));
    for (int i = 0; i < cost_count; i++) {
        int need = money - cost[i];
        int pos = findSlot(seen, capacity, need);
        if (need > 0 && seen[pos].used) {
            result[0] = seen[pos].id;
            result[1] = i + 1;
            break;
        }
        pos = findSlot(seen, capacity, cost[i]);
        if (!seen[pos].used) {
            seen[pos].used = 1;
            seen[pos].key = cost[i];
            seen[pos].id = i + 1;
        }
    }
    free(seen);
    return result;
}

void whatFlavors(int cost_count, int* cost, int money) {
    int count;
    int* ids = findFlavors(cost_count, cost, money, &count);
    printf("%d %d\\n", ids[0], ids[1]);
    free(ids);
}`,
        cpp: `vector<int> findFlavors(vector<int> cost, int money) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)cost.size(); i++) {
        int need = money - cost[i];
        if (seen.count(need)) return {seen[need], i + 1};
        if (!seen.count(cost[i])) seen[cost[i]] = i + 1;
    }
    return {};
}

void whatFlavors(vector<int> cost, int money) {
    vector<int> ids = findFlavors(cost, money);
    cout << ids[0] << " " << ids[1] << endl;
}`,
        java: `public static List<Integer> findFlavors(List<Integer> cost, int money) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < cost.size(); i++) {
        int price = cost.get(i);
        int need = money - price;
        if (seen.containsKey(need)) return Arrays.asList(seen.get(need), i + 1);
        seen.putIfAbsent(price, i + 1);
    }
    return new ArrayList<>();
}

public static void whatFlavors(List<Integer> cost, int money) {
    List<Integer> ids = findFlavors(cost, money);
    System.out.println(ids.get(0) + " " + ids.get(1));
}`,
        javascript: `function findFlavors(cost, money) {
  const seen = new Map();
  for (let i = 0; i < cost.length; i++) {
    const need = money - cost[i];
    if (seen.has(need)) return [seen.get(need), i + 1];
    if (!seen.has(cost[i])) seen.set(cost[i], i + 1);
  }
  return [];
}

function whatFlavors(cost, money) {
  console.log(findFlavors(cost, money).join(' '));
}`,
      },
    },
  ],
  pitfalls: [
    '輸出使用 1 起算編號，不是 0 起算索引，也不是價格。',
    '相同價格的兩種口味可配對；查詢補價要在記錄目前口味之前。',
    '題目要求印出而非回傳，因此 whatFlavors 必須呼叫輔助函式後印出。',
  ],
  check: {
    kind: 'fn',
    fn: 'findFlavors',
    cases: [
      { args: [[2, 1, 3, 5, 6], 5], out: [1, 3] },
      { args: [[4, 3, 2, 4], 8], out: [1, 4] },
      { args: [[1, 2], 3], out: [1, 2] },
      { args: [[5, 5], 10], out: [1, 2] },
      { args: [[1, 3, 4, 6], 10], out: [3, 4] },
      { args: [[7, 1, 2], 9], out: [1, 3] },
    ],
  },
}

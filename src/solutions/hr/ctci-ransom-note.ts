import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const MAG = ['give', 'me', 'one', 'grand', 'today', 'night']
const NOTE = ['give', 'one', 'grand', 'today']

function searchFig(): FigStep[] {
  const used = Array(MAG.length).fill(0), out: FigStep[] = []
  for (let i = 0; i < NOTE.length; i++) {
    let found = false
    for (let j = 0; j < MAG.length; j++) {
      const match = !used[j] && MAG[j] === NOTE[i]
      if (match) { used[j] = 1; found = true }
      out.push({ note: `便條第 ${i + 1} 個字 ${NOTE[i]}：檢查雜誌第 ${j + 1} 個字 ${MAG[j]}，${match ? '找到並剪下，不能再用' : used[j] && MAG[j] === NOTE[i] ? '已被剪走' : '不相同'}。`, views: [arr(MAG, { label: '雜誌字詞', highlight: [j], done: used.flatMap((x, k) => x ? [k] : []) }), arr(NOTE, { label: '便條', highlight: [i] }), arr(used, { label: '已使用 1 / 未使用 0' })] })
      if (match) break
    }
    if (!found) break
  }
  return out
}

function countFig(): FigStep[] {
  const count = new Map<string, number>(), out: FigStep[] = []
  for (let i = 0; i < MAG.length; i++) {
    count.set(MAG[i], (count.get(MAG[i]) ?? 0) + 1)
    out.push({ note: `雜誌第 ${i + 1} 個字 ${MAG[i]}：庫存增至 ${count.get(MAG[i])}。`, views: [arr(MAG, { label: '雜誌', highlight: [i] }), kv([...count.entries()], '可用字詞數量')] })
  }
  for (let i = 0; i < NOTE.length; i++) {
    const have = count.get(NOTE[i]) ?? 0
    if (have) count.set(NOTE[i], have - 1)
    out.push({ note: `便條需要 ${NOTE[i]}：原有 ${have} 個，${have ? `取走一個剩 ${have - 1}` : '沒有存貨，回答 No'}。`, views: [arr(NOTE, { label: '便條', highlight: [i] }), kv([...count.entries()], '剩餘字詞數量')] })
    if (!have) break
  }
  return out
}

export const hrCtciRansomNote: HrSolution = {
  slug: 'ctci-ransom-note',
  plain: '像從雜誌剪整個單字拼便條：剪過的字不能再剪一次；大小寫不同的字也不能互換。',
  statement: '輸入雜誌字詞陣列 magazine 與便條字詞陣列 note。只能使用完整字詞，且每次使用會消耗一份。若可依需求組成便條，印出 Yes，否則印出 No。',
  examples: [
    { input: 'magazine = [give,me,one,grand,today,night], note = [give,one,grand,today]', output: 'Yes', note: '四個需求字各可從雜誌取出一次。' },
    { input: 'magazine = [attack,at,dawn], note = [Attack,at,dawn]', output: 'No', note: 'Attack 與 attack 大小寫不同。' },
  ],
  constraints: [
    '雜誌與便條各可有 3×10^4 個字詞 → 每個需求都重掃雜誌可能達 O(mn)。',
    '字詞區分大小寫 → 雜湊鍵須保留原字，不得轉小寫。',
    '同一字詞可重複出現 → 只記有沒有不夠，要記可使用次數。',
  ],
  insight: [
    '最直接是逐個需求字找一份尚未使用的雜誌字，並把找到的位置標記。',
    '重複掃描雜誌很浪費；真正需要的是每個字尚餘幾份。',
    '先用 [[p:hash-map]] 建庫存，掃便條時扣庫存；若某字扣之前為 0 就失敗。也可連到 [383](#/q/383) 看相同的供需觀念。',
  ],
  approaches: [
    {
      name: '每個需求字逐一搜尋',
      idea: '每次在雜誌中找一個相同且尚未使用的字。',
      steps: ['建立與雜誌同長的已使用布林表。', '對便條每個字，從頭尋找第一個相同且未使用的雜誌字。', '找到就標成已使用；找不到立刻回傳 false。', '全部需求都找到就回傳 true，輸出函式轉成 Yes/No。'],
      figure: { title: 'give me one grand today night → give one grand today', steps: searchFig() },
      complexity: { time: 'O(mn)', space: 'O(m)', why: 'n 個需求字各可掃 m 個雜誌字；使用表有 m 格。' },
      verdict: '直覺且容易核對重複字，但資料大時重掃過多。',
      code: {
        python: `def canBuild(magazine, note):
    used = [False] * len(magazine)
    for word in note:
        found = False
        for i, candidate in enumerate(magazine):
            if not used[i] and candidate == word:
                used[i] = True  # 一張字卡只能用一次
                found = True
                break
        if not found:
            return False
    return True

def checkMagazine(magazine, note):
    print('Yes' if canBuild(magazine, note) else 'No')`,
        c: `bool canBuild(int magazine_count, char** magazine, int note_count, char** note) {
    bool* used = calloc(magazine_count, sizeof(bool));
    for (int i = 0; i < note_count; i++) {
        bool found = false;
        for (int j = 0; j < magazine_count; j++) {
            if (!used[j] && strcmp(note[i], magazine[j]) == 0) {
                used[j] = true;
                found = true;
                break;
            }
        }
        if (!found) { free(used); return false; }
    }
    free(used);
    return true;
}

void checkMagazine(int magazine_count, char** magazine, int note_count, char** note) {
    puts(canBuild(magazine_count, magazine, note_count, note) ? "Yes" : "No");
}`,
        cpp: `bool canBuild(vector<string> magazine, vector<string> note) {
    vector<bool> used(magazine.size(), false);
    for (const string& word : note) {
        bool found = false;
        for (int i = 0; i < (int)magazine.size(); i++) {
            if (!used[i] && magazine[i] == word) {
                used[i] = true;
                found = true;
                break;
            }
        }
        if (!found) return false;
    }
    return true;
}

void checkMagazine(vector<string> magazine, vector<string> note) {
    cout << (canBuild(magazine, note) ? "Yes" : "No") << '\\n';
}`,
        java: `public static boolean canBuild(List<String> magazine, List<String> note) {
    boolean[] used = new boolean[magazine.size()];
    for (String word : note) {
        boolean found = false;
        for (int i = 0; i < magazine.size(); i++) {
            if (!used[i] && magazine.get(i).equals(word)) {
                used[i] = true;
                found = true;
                break;
            }
        }
        if (!found) return false;
    }
    return true;
}

public static void checkMagazine(List<String> magazine, List<String> note) {
    System.out.println(canBuild(magazine, note) ? "Yes" : "No");
}`,
        javascript: `function canBuild(magazine, note) {
  const used = Array(magazine.length).fill(false);
  for (const word of note) {
    let found = false;
    for (let i = 0; i < magazine.length; i++) {
      if (!used[i] && magazine[i] === word) {
        used[i] = true;
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

function checkMagazine(magazine, note) {
  console.log(canBuild(magazine, note) ? 'Yes' : 'No');
}`,
      },
    },
    {
      name: '字詞庫存計數',
      idea: '先統計雜誌每個字有幾份，再按便條需求逐份扣除。',
      steps: ['建立字詞到數量的計數表。', '逐個雜誌字把對應數量加一。', '逐個便條字查剩餘量；若為零回傳 false，否則減一。', '全部扣完回傳 true，輸出函式印 Yes/No。'],
      figure: { title: 'give me one grand today night → give one grand today', steps: countFig() },
      complexity: { time: '平均 O(m+n)', space: 'O(u)', why: '雜誌與便條各掃一次；u 是不同字詞數。C 版用排序，時間 O(m log m+n log n)。' },
      verdict: '主流語言用雜湊計數；C 版以排序與雙指標達到同樣的庫存檢查。',
      code: {
        python: `def canBuild(magazine, note):
    stock = {}
    for word in magazine:
        stock[word] = stock.get(word, 0) + 1
    for word in note:
        if stock.get(word, 0) == 0:  # 字卡用盡
            return False
        stock[word] -= 1
    return True

def checkMagazine(magazine, note):
    print('Yes' if canBuild(magazine, note) else 'No')`,
        c: `int compareWords(const void* a, const void* b) {
    return strcmp(*(char* const*)a, *(char* const*)b);
}

bool canBuild(int magazine_count, char** magazine, int note_count, char** note) {
    qsort(magazine, magazine_count, sizeof(char*), compareWords);
    qsort(note, note_count, sizeof(char*), compareWords);
    int i = 0, j = 0;
    while (i < magazine_count && j < note_count) {
        int relation = strcmp(magazine[i], note[j]);
        if (relation < 0) i++;
        else if (relation == 0) { i++; j++; }
        else return false;
    }
    return j == note_count;
}

void checkMagazine(int magazine_count, char** magazine, int note_count, char** note) {
    puts(canBuild(magazine_count, magazine, note_count, note) ? "Yes" : "No");
}`,
        cpp: `bool canBuild(vector<string> magazine, vector<string> note) {
    unordered_map<string, int> stock;
    for (const string& word : magazine) stock[word]++;
    for (const string& word : note) {
        if (stock[word] == 0) return false;
        stock[word]--;
    }
    return true;
}

void checkMagazine(vector<string> magazine, vector<string> note) {
    cout << (canBuild(magazine, note) ? "Yes" : "No") << '\\n';
}`,
        java: `public static boolean canBuild(List<String> magazine, List<String> note) {
    Map<String, Integer> stock = new HashMap<>();
    for (String word : magazine) stock.put(word, stock.getOrDefault(word, 0) + 1);
    for (String word : note) {
        int have = stock.getOrDefault(word, 0);
        if (have == 0) return false;
        stock.put(word, have - 1);
    }
    return true;
}

public static void checkMagazine(List<String> magazine, List<String> note) {
    System.out.println(canBuild(magazine, note) ? "Yes" : "No");
}`,
        javascript: `function canBuild(magazine, note) {
  const stock = new Map();
  for (const word of magazine) stock.set(word, (stock.get(word) || 0) + 1);
  for (const word of note) {
    const have = stock.get(word) || 0;
    if (have === 0) return false;
    stock.set(word, have - 1);
  }
  return true;
}

function checkMagazine(magazine, note) {
  console.log(canBuild(magazine, note) ? 'Yes' : 'No');
}`,
      },
    },
  ],
  pitfalls: [
    '同一字重複需求兩次就要有兩份，不能只用 Set。',
    '字詞大小寫敏感，Attack 與 attack 是兩個不同鍵。',
    '印出函式用 Yes/No，輔助函式給 check 回傳布林值。',
  ],
  check: {
    kind: 'fn', fn: 'canBuild',
    cases: [
      { args: [MAG, NOTE], out: true },
      { args: [['attack', 'at', 'dawn'], ['Attack', 'at', 'dawn']], out: false },
      { args: [['a'], ['a']], out: true },
      { args: [['a'], ['a', 'a']], out: false },
      { args: [['a', 'a'], ['a', 'a']], out: true },
      { args: [['a', 'b'], ['c']], out: false },
    ],
  },
}

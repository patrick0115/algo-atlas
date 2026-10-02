import type { Cell, Frame, GraphViewData, Pattern } from '../types'
import { arr, parseInt_, parseInts, parseStr, randInt, randInts, randStr, range } from '../engine/helpers'
import { forestView, type GNode } from '../engine/tree'

// ===== 貪心(55. Jump Game) =====

function* jumpRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.nums, 'nums', { min: 0, max: 9, maxLen: 12 })
  let reach = 0
  const f = (line: string, note: string, i: number, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { 最遠: reach, answer } : { 最遠: reach },
    views: [arr(a, { label: 'nums[i] = 從第 i 格最多能往前跳幾格', range: [0, Math.min(reach, a.length - 1)], highlight: i >= 0 ? [i] : [], pointers: [{ name: '最遠', index: Math.min(reach, a.length - 1) }, ...(i >= 0 ? [{ name: 'i', index: i, color: 'b' as const }] : [])] })],
  })
  yield f('init', '淡色底框是「目前能到達的範圍」。一開始只有第 0 格', -1)
  for (let i = 0; i < a.length; i++) {
    if (i > reach) {
      yield f('stuck', `第 ${i} 格超出最遠能到的 ${reach} → 到不了,失敗`, i, 'false')
      return
    }
    const nr = Math.max(reach, i + a[i])
    yield f('extend', `站在第 ${i} 格,最遠可以跳到 ${i} + ${a[i]} = ${i + a[i]}${nr > reach ? `,範圍擴大到 ${nr}` : ',沒有比較遠'}`, i)
    reach = nr
    if (reach >= a.length - 1) {
      yield f('ok', `最遠能到 ${reach} >= 最後一格 ${a.length - 1} → 成功!`, i, 'true')
      return
    }
  }
  yield f('ok', '可以到最後一格', -1, 'true')
}

export const greedy: Pattern = {
  id: 'greedy',
  summary: '貪心 = 每一步都做「眼前看起來最好」的選擇,而且不回頭。它不一定對,但如果能證明「局部最好會導致整體最好」,就能把複雜的問題變得非常簡單。',
  analogy: '過河踩石頭:不需要規劃完整的路線,只要每一步都記得「到目前為止,最遠能踩到哪裡」。只要最遠的位置還在你前面,就一定走得過去。',
  steps: ['找出「每一步該怎麼選」的規則(最遠、最早結束、最便宜…)', '照規則一路走下去,不回頭修改', '用反證法或交換論證確認規則正確(面試時說得出理由)'],
  watch: ['淡色底框是目前能到達的範圍,會隨著每一格往右擴張', '只要 i 還在框內,就一定走得到 i'],
  whenToUse: ['跳躍遊戲、加油站', '區間問題(依結束時間排序)', '分配問題:分餅乾、兩地調度(依差值排序)', '常和排序、Heap 搭配'],
  pitfalls: ['貪心最大的風險是「看起來對但其實錯」,不確定時先想 DP', '排序的依據是關鍵:依起點、依終點、依差值,結果完全不同'],
  complexity: { time: 'O(n)(本題)', space: 'O(1)', why: '只掃一遍,維護一個最遠距離。' },
  demo: {
    title: '跳躍遊戲:能不能跳到最後一格(LeetCode 55)',
    inputs: [{ key: 'nums', label: 'nums', default: '2,3,1,1,0,4' }],
    run: jumpRun,
    reference: (v) => {
      const a = parseInts(v.nums, 'nums', { min: 0, max: 9, maxLen: 12 })
      const ok = new Array(a.length).fill(false)
      ok[a.length - 1] = true
      for (let i = a.length - 2; i >= 0; i--) for (let k = 1; k <= a[i] && i + k < a.length; k++) if (ok[i + k]) ok[i] = true
      return String(ok[0])
    },
    random: () => ({ nums: randInts(randInt(1, 10), 0, 3).join(',') }),
    code: {
      python: `def can_jump(nums):
    reach = 0                                   #@init
    for i, x in enumerate(nums):
        if i > reach: return False              #@stuck
        reach = max(reach, i + x)               #@extend
        if reach >= len(nums) - 1: return True  #@ok
    return True`,
      c: `bool canJump(int* nums, int n) {
    int reach = 0;                              //@init
    for (int i = 0; i < n; i++) {
        if (i > reach) return false;            //@stuck
        if (i + nums[i] > reach) reach = i + nums[i];   //@extend
        if (reach >= n - 1) return true;        //@ok
    }
    return true;
}`,
      cpp: `bool canJump(vector<int>& nums) {
    int reach = 0, n = nums.size();             //@init
    for (int i = 0; i < n; i++) {
        if (i > reach) return false;            //@stuck
        reach = max(reach, i + nums[i]);        //@extend
        if (reach >= n - 1) return true;        //@ok
    }
    return true;
}`,
      java: `boolean canJump(int[] nums) {
    int reach = 0, n = nums.length;             //@init
    for (int i = 0; i < n; i++) {
        if (i > reach) return false;            //@stuck
        reach = Math.max(reach, i + nums[i]);   //@extend
        if (reach >= n - 1) return true;        //@ok
    }
    return true;
}`,
      javascript: `function canJump(nums) {
  let reach = 0;                                //@init
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false;                //@stuck
    reach = Math.max(reach, i + nums[i]);       //@extend
    if (reach >= nums.length - 1) return true;  //@ok
  }
  return true;
}`,
    },
  },
}

// ===== 區間問題(56. Merge Intervals) =====

function parseIntervals(s: string): [number, number][] {
  const out: [number, number][] = []
  for (const part of s.split(/[,;\s]+/).filter(Boolean)) {
    const m = part.match(/^(\d+)-(\d+)$/)
    if (!m) throw new Error(`看不懂「${part}」,區間寫成 1-3`)
    const [a, b] = [Number(m[1]), Number(m[2])]
    if (a > b || b > 20) throw new Error(`「${part}」:起點要 <= 終點,且終點 <= 20`)
    out.push([a, b])
  }
  if (!out.length || out.length > 8) throw new Error('需要 1~8 個區間')
  return out
}

function* mergeRun(v: Record<string, string>): Generator<Frame> {
  const iv = parseIntervals(v.intervals)
  const maxT = Math.max(...iv.map((x) => x[1]))
  const sorted = [...iv].sort((x, y) => x[0] - y[0] || x[1] - y[1])
  const merged: [number, number][] = []
  const bar = ([a, b]: [number, number]) => range(0, maxT).map((t) => (t >= a && t <= b ? '' : null))
  const f = (line: string, note: string, cur: number, answer?: string): Frame => {
    const rows = [...sorted.map(bar), ...merged.map(bar)]
    const land: Cell[] = []
    const hl: Cell[] = []
    rows.forEach((r, i) => r.forEach((x, t) => x === '' && (i === cur || i === sorted.length + merged.length - 1 && line !== 'sort' ? hl : land).push([i, t])))
    return {
      line,
      note,
      vars: answer !== undefined ? { answer } : {},
      views: [
        {
          kind: 'grid',
          label: '時間軸:上面是排序後的區間,下面是合併的結果',
          cells: rows.map((r) => r.map((x) => (x === null ? null : ''))),
          rowLabels: [...sorted.map(([a, b]) => `[${a},${b}]`), ...merged.map(([a, b]) => `→ [${a},${b}]`)],
          colLabels: range(0, maxT).map(String),
          marks: { land, hl },
        },
      ],
    }
  }
  yield f('sort', '先依「起點」排序,這樣能合併的區間一定相鄰', -1)
  for (let i = 0; i < sorted.length; i++) {
    const [a, b] = sorted[i]
    const last = merged.at(-1)
    if (!last || a > last[1]) {
      merged.push([a, b])
      yield f('new', last ? `[${a},${b}] 的起點 ${a} > 上一段的終點 ${last[1]},沒重疊 → 開一段新的` : `第一個區間 [${a},${b}] 直接放進結果`, i)
    } else {
      const old = last[1]
      last[1] = Math.max(last[1], b)
      yield f('extend', `[${a},${b}] 的起點 ${a} <= 上一段的終點 ${old},重疊 → 合併,終點變成 max(${old}, ${b}) = ${last[1]}`, i)
    }
  }
  yield f('done', `合併完成,共 ${merged.length} 段`, -1, merged.map(([a, b]) => `${a}-${b}`).join(','))
}

export const intervalScheduling: Pattern = {
  id: 'interval-scheduling',
  summary: '區間題幾乎都從「排序」開始:依起點排序後,有重疊的區間一定相鄰,只要和「上一段」比較就好。要選最多不重疊的區間時,改成依終點排序。',
  analogy: '整理行事曆:把會議依開始時間排好,一個一個看,如果這個會議在上一個結束前就開始,兩個就重疊了,合成一個大時段。',
  steps: ['依起點排序', '結果清單為空,或目前區間的起點 > 上一段終點 → 新開一段', '否則重疊 → 上一段終點 = max(上一段終點, 目前終點)', '(選最多不重疊區間:依終點排序,能放就放)'],
  watch: ['每一列是一個區間,黑色是正在處理的', '下面的列是合併結果,會一段一段長出來'],
  whenToUse: ['合併區間、插入區間、區間交集', '最少要移除幾個區間才不重疊、最少幾支箭射爆氣球(依終點排序)', '會議室需要幾間(Heap 或差分 +1/−1)'],
  pitfalls: ['[1,4] 和 [4,5] 算不算重疊?看題目(本題算)', '終點要取 max,因為後面的區間可能被前面的完全包住'],
  complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 O(n log n),之後只掃一遍。' },
  demo: {
    title: '合併重疊的區間(LeetCode 56)',
    inputs: [{ key: 'intervals', label: '區間', default: '1-3,2-6,8-10,15-18,9-12,17-17' }],
    run: mergeRun,
    reference: (v) => {
      const iv = parseIntervals(v.intervals)
      const cov = new Array(41).fill(false)
      for (const [a, b] of iv) for (let t = 2 * a; t <= 2 * b; t++) cov[t] = true
      const out: string[] = []
      for (let t = 0; t <= 40; t++) {
        if (!cov[t] || (t > 0 && cov[t - 1])) continue
        let e = t
        while (e + 1 <= 40 && cov[e + 1]) e++
        out.push(`${t / 2}-${e / 2}`)
      }
      return out.join(',')
    },
    random: () =>
      ({
        intervals: Array.from({ length: randInt(1, 6) }, () => {
          const a = randInt(0, 15)
          return `${a}-${randInt(a, Math.min(20, a + 5))}`
        }).join(','),
      }),
    code: {
      python: `def merge(intervals):
    intervals.sort()                            #@sort
    res = []
    for a, b in intervals:
        if not res or a > res[-1][1]:
            res.append([a, b])                  #@new
        else:
            res[-1][1] = max(res[-1][1], b)     #@extend
    return res                                  #@done`,
      c: `int cmp(const void *x, const void *y) { return (*(int**)x)[0] - (*(int**)y)[0]; }
int** merge(int** iv, int n, int* cols, int* retSize, int** retCols) {
    qsort(iv, n, sizeof(int*), cmp);            //@sort
    int **res = malloc(n * sizeof(int*)), k = 0;
    for (int i = 0; i < n; i++) {
        if (k == 0 || iv[i][0] > res[k-1][1]) {
            res[k] = malloc(2 * sizeof(int));   //@new
            res[k][0] = iv[i][0]; res[k++][1] = iv[i][1];   //@new
        } else if (iv[i][1] > res[k-1][1]) {
            res[k-1][1] = iv[i][1];             //@extend
        }
    }
    *retSize = k;
    *retCols = malloc(k * sizeof(int));
    for (int i = 0; i < k; i++) (*retCols)[i] = 2;
    return res;                                 //@done
}`,
      cpp: `vector<vector<int>> merge(vector<vector<int>>& iv) {
    sort(iv.begin(), iv.end());                 //@sort
    vector<vector<int>> res;
    for (auto& x : iv) {
        if (res.empty() || x[0] > res.back()[1])
            res.push_back(x);                   //@new
        else
            res.back()[1] = max(res.back()[1], x[1]);   //@extend
    }
    return res;                                 //@done
}`,
      java: `int[][] merge(int[][] iv) {
    Arrays.sort(iv, (x, y) -> x[0] - y[0]);     //@sort
    List<int[]> res = new ArrayList<>();
    for (int[] x : iv) {
        if (res.isEmpty() || x[0] > res.get(res.size() - 1)[1])
            res.add(x);                         //@new
        else
            res.get(res.size() - 1)[1] = Math.max(res.get(res.size() - 1)[1], x[1]);  //@extend
    }
    return res.toArray(new int[0][]);           //@done
}`,
      javascript: `function merge(iv) {
  iv.sort((x, y) => x[0] - y[0]);               //@sort
  const res = [];
  for (const [a, b] of iv) {
    if (!res.length || a > res[res.length - 1][1])
      res.push([a, b]);                         //@new
    else
      res[res.length - 1][1] = Math.max(res[res.length - 1][1], b);  //@extend
  }
  return res;                                   //@done
}`,
    },
  },
}

// ===== KMP =====

function* kmpRun(v: Record<string, string>): Generator<Frame> {
  const text = parseStr(v.text, 'text', { maxLen: 16 })
  const pat = parseStr(v.pattern, 'pattern', { maxLen: 8 })
  const lps: (number | string)[] = pat.split('').map(() => '')
  const f = (line: string, note: string, opt: { ti?: number; pi?: number; shift?: number; lpsHl?: number[]; lpsCmp?: number[] } = {}, answer?: number): Frame => {
    const views: Frame['views'] = []
    if (opt.ti !== undefined) {
      views.push(arr(text.split(''), { label: 'text', highlight: [opt.ti], range: opt.shift !== undefined ? [opt.shift, opt.shift + pat.length - 1] : undefined }))
      views.push(arr([...Array(opt.shift ?? 0).fill(''), ...pat.split('')], { label: 'pattern(對齊到目前比對的位置)', highlight: opt.pi !== undefined ? [(opt.shift ?? 0) + opt.pi] : [] }))
    } else {
      views.push(arr(pat.split(''), { label: 'pattern', highlight: opt.lpsHl, compare: opt.lpsCmp }))
    }
    views.push(arr(lps, { label: 'lps[i]:pattern[0..i] 中「既是前綴又是後綴」的最長長度', highlight: opt.lpsHl }))
    return { line, note, vars: answer !== undefined ? { answer } : {}, views }
  }
  // 建 LPS
  lps[0] = 0
  yield f('lps', '第一步:建 lps 表。lps[0] = 0(一個字沒有真正的前後綴)', { lpsHl: [0] })
  let len = 0
  for (let i = 1; i < pat.length; ) {
    if (pat[i] === pat[len]) {
      len++
      lps[i] = len
      yield f('lps', `pattern[${i}] = ${pat[i]} 和 pattern[${len - 1}] 相同,共同前後綴變長:lps[${i}] = ${len}`, { lpsHl: [i], lpsCmp: [len - 1] })
      i++
    } else if (len > 0) {
      const old = len
      len = lps[len - 1] as number
      yield f('lps', `pattern[${i}] ≠ pattern[${old}],退回較短的前後綴:len = lps[${old - 1}] = ${len}`, { lpsHl: [i], lpsCmp: [old] })
    } else {
      lps[i] = 0
      yield f('lps', `pattern[${i}] 沒有可以延續的前後綴,lps[${i}] = 0`, { lpsHl: [i] })
      i++
    }
  }
  // 比對
  let j = 0
  for (let i = 0; i < text.length; ) {
    const shift = i - j
    if (text[i] === pat[j]) {
      yield f('match', `text[${i}] = pattern[${j}] = ${text[i]},繼續`, { ti: i, pi: j, shift })
      i++
      j++
      if (j === pat.length) {
        yield f('found', `整個 pattern 都對上了,在 text 的第 ${i - j} 個位置`, { ti: i - 1, pi: j - 1, shift: i - j }, i - j)
        return
      }
    } else if (j > 0) {
      const nj = lps[j - 1] as number
      yield f('jump', `text[${i}] = ${text[i]} ≠ pattern[${j}] = ${pat[j]}。不用從頭比:已經對上的 ${j} 個字裡,有 ${nj} 個是共同前後綴,直接讓 pattern 跳到第 ${nj} 個`, { ti: i, pi: j, shift, lpsHl: [j - 1] })
      j = nj
    } else {
      yield f('miss', `text[${i}] ≠ pattern[0],text 往右一格`, { ti: i, pi: 0, shift })
      i++
    }
  }
  yield f('none', '找不到', { lpsHl: [] }, -1)
}

export const kmp: Pattern = {
  id: 'kmp',
  summary: 'KMP 在一段文字中找一個字串,而且文字的指標永遠不往回走。秘訣是預先算出 lps 表:失配時,已經比對成功的那段如果「開頭和結尾相同」,就可以直接跳過去,不用從頭比。',
  analogy: '背一首歌時唱錯了:不必從第一句重新開始,而是想「剛剛唱對的最後幾句,剛好也是這首歌的開頭」,就從那裡接著唱。',
  steps: ['建 lps:lps[i] = pattern[0..i] 最長的「相同前綴與後綴」長度', '比對:text[i] == pattern[j] → 兩個都前進', '失配且 j > 0 → j = lps[j−1](text 的 i 不動)', '失配且 j == 0 → i 前進', 'j == pattern 長度 → 找到'],
  watch: ['先看 lps 表怎麼建出來', '比對時注意「跳躍」那一步:pattern 往右滑好幾格,但 text 的指標沒有後退'],
  whenToUse: ['字串搜尋(找第一次出現的位置)', '重複的子字串模式(用 lps 最後一個值)', '最短回文(s + # + 反轉 s 的 lps)', '最長快樂前綴'],
  pitfalls: ['lps 建表時失配要用 while 一路退回,不是只退一次', '面試寫不出 KMP 時,說明可以改用 Rolling Hash 或內建函式'],
  complexity: { time: 'O(n + m)', space: 'O(m)', why: 'text 的指標只前進不後退;每次「跳躍」都讓 j 變小,總共不會超過前進的次數。' },
  demo: {
    title: '在 text 中找 pattern 第一次出現的位置(LeetCode 28)',
    inputs: [
      { key: 'text', label: 'text', default: 'abababcabababd' },
      { key: 'pattern', label: 'pattern', default: 'ababd' },
    ],
    run: kmpRun,
    reference: (v) => v.text.trim().indexOf(v.pattern.trim()),
    random: () => ({ text: randStr(randInt(1, 14), 'ab'), pattern: randStr(randInt(1, 4), 'ab') }),
    code: {
      python: `def kmp(text, pat):
    lps, length = [0] * len(pat), 0             #@lps
    for i in range(1, len(pat)):
        while length and pat[i] != pat[length]:
            length = lps[length - 1]            #@lps
        if pat[i] == pat[length]: length += 1   #@lps
        lps[i] = length                         #@lps
    j = 0
    for i, ch in enumerate(text):
        while j and ch != pat[j]:
            j = lps[j - 1]                      #@jump
        if ch == pat[j]: j += 1                 #@match
        # else: j == 0,i 往右                  #@miss
        if j == len(pat): return i - j + 1      #@found
    return -1                                   #@none`,
      c: `int strStr(char* text, char* pat) {
    int n = strlen(text), m = strlen(pat), lps[10000] = {0};
    for (int i = 1, len = 0; i < m; i++) {      //@lps
        while (len && pat[i] != pat[len]) len = lps[len - 1];  //@lps
        if (pat[i] == pat[len]) len++;          //@lps
        lps[i] = len;                           //@lps
    }
    for (int i = 0, j = 0; i < n; i++) {
        while (j && text[i] != pat[j]) j = lps[j - 1];  //@jump
        if (text[i] == pat[j]) j++;             //@match
        // else: j == 0,i 往右                 //@miss
        if (j == m) return i - m + 1;           //@found
    }
    return -1;                                  //@none
}`,
      cpp: `int strStr(string text, string pat) {
    int n = text.size(), m = pat.size();
    vector<int> lps(m, 0);
    for (int i = 1, len = 0; i < m; i++) {      //@lps
        while (len && pat[i] != pat[len]) len = lps[len - 1];  //@lps
        if (pat[i] == pat[len]) len++;          //@lps
        lps[i] = len;                           //@lps
    }
    for (int i = 0, j = 0; i < n; i++) {
        while (j && text[i] != pat[j]) j = lps[j - 1];  //@jump
        if (text[i] == pat[j]) j++;             //@match
        // else: j == 0,i 往右                 //@miss
        if (j == m) return i - m + 1;           //@found
    }
    return -1;                                  //@none
}`,
      java: `int strStr(String text, String pat) {
    int n = text.length(), m = pat.length();
    int[] lps = new int[m];
    for (int i = 1, len = 0; i < m; i++) {      //@lps
        while (len > 0 && pat.charAt(i) != pat.charAt(len)) len = lps[len - 1];  //@lps
        if (pat.charAt(i) == pat.charAt(len)) len++;    //@lps
        lps[i] = len;                           //@lps
    }
    for (int i = 0, j = 0; i < n; i++) {
        while (j > 0 && text.charAt(i) != pat.charAt(j)) j = lps[j - 1];  //@jump
        if (text.charAt(i) == pat.charAt(j)) j++;   //@match
        // else: j == 0,i 往右                 //@miss
        if (j == m) return i - m + 1;           //@found
    }
    return -1;                                  //@none
}`,
      javascript: `function strStr(text, pat) {
  const lps = new Array(pat.length).fill(0);
  for (let i = 1, len = 0; i < pat.length; i++) {   //@lps
    while (len && pat[i] !== pat[len]) len = lps[len - 1];  //@lps
    if (pat[i] === pat[len]) len++;             //@lps
    lps[i] = len;                               //@lps
  }
  for (let i = 0, j = 0; i < text.length; i++) {
    while (j && text[i] !== pat[j]) j = lps[j - 1];     //@jump
    if (text[i] === pat[j]) j++;                //@match
    // else: j == 0,i 往右                     //@miss
    if (j === pat.length) return i - j + 1;     //@found
  }
  return -1;                                    //@none
}`,
    },
  },
}

// ===== 線段樹 =====

function* segRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.nums, 'nums', { maxLen: 8 })
  const n = a.length
  const ql = parseInt_(v.l, '查詢 l', 0, n - 1)
  const qr = parseInt_(v.r, '查詢 r', ql, n - 1)
  type SN = GNode & { lo: number; hi: number; sum: number | null; kids: SN[] }
  let id = 0
  const mk = (lo: number, hi: number): SN => {
    const nd: SN = { id: id++, label: '', children: [], lo, hi, sum: null, kids: [] }
    if (lo < hi) {
      const mid = (lo + hi) >> 1
      nd.kids = [mk(lo, mid), mk(mid + 1, hi)]
      nd.children = nd.kids
    }
    return nd
  }
  const root = mk(0, n - 1)
  const cls = new Map<number, string>()
  let total = 0
  const view = (): GraphViewData => {
    const relabel = (nd: SN) => {
      nd.label = nd.sum === null ? '?' : String(nd.sum)
      nd.kids.forEach(relabel)
    }
    relabel(root)
    const sub = new Map<number, string>()
    const walk = (nd: SN) => (sub.set(nd.id, `[${nd.lo}..${nd.hi}]`), nd.kids.forEach(walk))
    walk(root)
    return forestView(root, { cls, sub, label: '每個節點存一段區間的總和(下方是它負責的區間)' })
  }
  const f = (line: string, note: string, hl: number[] = [], answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : { 目前累加: total },
    views: [view(), arr(a, { label: 'nums', range: line.startsWith('q') || line === 'done' ? [ql, qr] : undefined, highlight: hl })],
  })
  function* build(nd: SN): Generator<Frame> {
    if (nd.lo === nd.hi) {
      nd.sum = a[nd.lo]
      cls.set(nd.id, 'hl')
      yield f('leaf', `葉子 [${nd.lo}] 就是 nums[${nd.lo}] = ${nd.sum}`, [nd.lo])
      cls.delete(nd.id)
      return
    }
    yield* build(nd.kids[0])
    yield* build(nd.kids[1])
    nd.sum = nd.kids[0].sum! + nd.kids[1].sum!
    cls.set(nd.id, 'hl')
    yield f('pull', `[${nd.lo}..${nd.hi}] = 左孩子 ${nd.kids[0].sum} + 右孩子 ${nd.kids[1].sum} = ${nd.sum}`, range(nd.lo, nd.hi))
    cls.delete(nd.id)
  }
  function* query(nd: SN): Generator<Frame> {
    if (nd.hi < ql || nd.lo > qr) {
      cls.set(nd.id, 'dim')
      yield f('q-out', `[${nd.lo}..${nd.hi}] 完全在查詢範圍外,不用看`)
      return
    }
    if (ql <= nd.lo && nd.hi <= qr) {
      total += nd.sum!
      cls.set(nd.id, 'hl')
      yield f('q-in', `[${nd.lo}..${nd.hi}] 完全在查詢範圍內,直接拿整段的和 ${nd.sum},不用往下走`, range(nd.lo, nd.hi))
      return
    }
    cls.set(nd.id, 'cmp')
    yield f('q-split', `[${nd.lo}..${nd.hi}] 只有一部分在範圍內,往左右孩子分別查`)
    yield* query(nd.kids[0])
    yield* query(nd.kids[1])
  }
  yield f('init', `先建樹:把陣列一直對半切,每個節點記住它那一段的和`)
  yield* build(root)
  cls.clear()
  yield f('query', `建好了。查詢 [${ql}..${qr}] 的總和:從樹根往下,只拆需要拆的節點`)
  yield* query(root)
  yield f('done', `把黑色節點加起來 = ${total}。只用到 O(log n) 個節點`, [], total)
}

export const segmentTree: Pattern = {
  id: 'segment-tree',
  summary: '線段樹把陣列一直對半切成一棵樹,每個節點存一段區間的資訊(總和、最大值…)。查詢任意區間時,只要拼出 O(log n) 個節點;修改一個值時,也只要更新從葉子到樹根的一條路。',
  analogy: '公司的業績報表:每個部門經理記住整個部門的業績,每個組長記住整組的業績。總經理想知道「第 3 組到第 7 組」的業績,只要問幾個經理和組長,不用一個個問員工。',
  steps: ['建樹:葉子是陣列元素,父節點 = 左孩子 + 右孩子', '查詢 [l, r]:節點區間完全在外 → 0;完全在內 → 直接回傳;部分重疊 → 問左右孩子', '單點修改:改葉子,沿路往上重新加總', '(樹狀陣列 BIT 是更短的寫法,只支援前綴和類的操作)'],
  watch: ['先看建樹:由下往上把和算出來', '查詢時黑色節點是「整段直接拿」的,淡色是不用看的'],
  whenToUse: ['陣列會被修改,又要一直問區間和 / 區間最大值', '逆序對、右邊比我小的數有幾個(BIT 計數)', '區間修改 + 區間查詢(加上懶標記)'],
  pitfalls: ['陣列版線段樹大小要開 4n', '只有查詢沒有修改時,前綴和就夠了', '區間修改要用懶標記,否則會退化成 O(n)'],
  complexity: { time: '建樹 O(n),查詢 / 修改 O(log n)', space: 'O(n)', why: '樹高 log n;一次查詢每層最多碰到 4 個節點。' },
  demo: {
    title: '線段樹:建樹,然後查詢一段區間的和(LeetCode 307)',
    inputs: [
      { key: 'nums', label: 'nums', default: '5,8,6,3,2,7,2,6' },
      { key: 'l', label: '查詢 l', default: '2' },
      { key: 'r', label: '查詢 r', default: '6' },
    ],
    run: segRun,
    reference: (v) => parseInts(v.nums, 'nums', { maxLen: 8 }).slice(Number(v.l), Number(v.r) + 1).reduce((x, y) => x + y, 0),
    random: () => {
      const n = randInt(1, 8)
      const l = randInt(0, n - 1)
      return { nums: randInts(n, -9, 9).join(','), l: String(l), r: String(randInt(l, n - 1)) }
    },
    code: {
      python: `class SegTree:
    def __init__(self, a):
        self.n, self.t = len(a), [0] * (4 * len(a))
        self.build(a, 1, 0, self.n - 1)         #@init
    def build(self, a, x, lo, hi):
        if lo == hi: self.t[x] = a[lo]; return  #@leaf
        mid = (lo + hi) // 2
        self.build(a, 2*x, lo, mid); self.build(a, 2*x+1, mid+1, hi)
        self.t[x] = self.t[2*x] + self.t[2*x+1] #@pull
    def query(self, x, lo, hi, l, r):           #@query
        if r < lo or hi < l: return 0           #@q-out
        if l <= lo and hi <= r: return self.t[x]    #@q-in
        mid = (lo + hi) // 2                    #@q-split
        return self.query(2*x, lo, mid, l, r) + self.query(2*x+1, mid+1, hi, l, r)
# 答案 = query(1, 0, n-1, l, r)                #@done`,
      c: `int t[4 * 30000];
void build(int a[], int x, int lo, int hi) {
    if (lo == hi) { t[x] = a[lo]; return; }     //@leaf
    int mid = (lo + hi) / 2;
    build(a, 2*x, lo, mid); build(a, 2*x+1, mid+1, hi);
    t[x] = t[2*x] + t[2*x+1];                   //@pull
}
int query(int x, int lo, int hi, int l, int r) {    //@query
    if (r < lo || hi < l) return 0;             //@q-out
    if (l <= lo && hi <= r) return t[x];        //@q-in
    int mid = (lo + hi) / 2;                    //@q-split
    return query(2*x, lo, mid, l, r) + query(2*x+1, mid+1, hi, l, r);
}
// build(a, 1, 0, n-1);                         //@init
// 答案 = query(1, 0, n-1, l, r)                //@done`,
      cpp: `vector<int> t;
void build(vector<int>& a, int x, int lo, int hi) {
    if (lo == hi) { t[x] = a[lo]; return; }     //@leaf
    int mid = (lo + hi) / 2;
    build(a, 2*x, lo, mid); build(a, 2*x+1, mid+1, hi);
    t[x] = t[2*x] + t[2*x+1];                   //@pull
}
int query(int x, int lo, int hi, int l, int r) {    //@query
    if (r < lo || hi < l) return 0;             //@q-out
    if (l <= lo && hi <= r) return t[x];        //@q-in
    int mid = (lo + hi) / 2;                    //@q-split
    return query(2*x, lo, mid, l, r) + query(2*x+1, mid+1, hi, l, r);
}
// t.assign(4 * n, 0); build(a, 1, 0, n-1);     //@init
// 答案 = query(1, 0, n-1, l, r)                //@done`,
      java: `int[] t;
void build(int[] a, int x, int lo, int hi) {
    if (lo == hi) { t[x] = a[lo]; return; }     //@leaf
    int mid = (lo + hi) / 2;
    build(a, 2*x, lo, mid); build(a, 2*x+1, mid+1, hi);
    t[x] = t[2*x] + t[2*x+1];                   //@pull
}
int query(int x, int lo, int hi, int l, int r) {    //@query
    if (r < lo || hi < l) return 0;             //@q-out
    if (l <= lo && hi <= r) return t[x];        //@q-in
    int mid = (lo + hi) / 2;                    //@q-split
    return query(2*x, lo, mid, l, r) + query(2*x+1, mid+1, hi, l, r);
}
// t = new int[4 * n]; build(a, 1, 0, n-1);     //@init
// 答案 = query(1, 0, n-1, l, r)                //@done`,
      javascript: `const t = [];
function build(a, x, lo, hi) {
  if (lo === hi) { t[x] = a[lo]; return; }      //@leaf
  const mid = (lo + hi) >> 1;
  build(a, 2*x, lo, mid); build(a, 2*x+1, mid+1, hi);
  t[x] = t[2*x] + t[2*x+1];                     //@pull
}
function query(x, lo, hi, l, r) {               //@query
  if (r < lo || hi < l) return 0;               //@q-out
  if (l <= lo && hi <= r) return t[x];          //@q-in
  const mid = (lo + hi) >> 1;                   //@q-split
  return query(2*x, lo, mid, l, r) + query(2*x+1, mid+1, hi, l, r);
}
// build(a, 1, 0, n-1);                         //@init
// 答案 = query(1, 0, n-1, l, r)                //@done`,
    },
  },
}

// ===== 位元運算(136. Single Number) =====

function* xorRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.nums, 'nums', { min: 0, max: 31, maxLen: 9 })
  const B = 5
  const bits = (x: number) => x.toString(2).padStart(B, '0').split('')
  let acc = 0
  const rows: string[][] = []
  const labels: string[] = []
  const f = (line: string, note: string, answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : { 目前XOR: acc },
    views: [
      {
        kind: 'grid',
        label: '每一列是一個數的二進位;最下面一列是到目前為止的 XOR',
        cells: [...rows, bits(acc)],
        rowLabels: [...labels, `XOR = ${acc}`],
        colLabels: range(0, B - 1).map((k) => `2^${B - 1 - k}`),
        marks: { hl: bits(acc).map((b, j) => (b === '1' ? [rows.length, j] : null)).filter(Boolean) as Cell[], land: rows.flatMap((r, i) => r.map((b, j) => (b === '1' ? ([i, j] as Cell) : null)).filter(Boolean) as Cell[]) },
      },
    ],
  })
  yield f('init', 'XOR 的規則:同一位相同得 0、不同得 1。所以 x ^ x = 0、x ^ 0 = x')
  for (const x of a) {
    rows.push(bits(x))
    labels.push(String(x))
    acc ^= x
    yield f('xor', `XOR 上 ${x}:每一位 1 的個數是奇數就是 1、偶數就是 0`)
  }
  yield f('done', `成對出現的數兩兩抵消成 0,只剩下出現一次的 ${acc}`, acc)
}

export const bitManipulation: Pattern = {
  id: 'bit-manipulation',
  summary: '直接操作數字的二進位。最常用的幾招:XOR 讓相同的數互相抵消、n & (n − 1) 消掉最低位的 1、用一個整數的每一位表示「選或不選」。',
  analogy: '一排電燈開關:XOR 就像「按一下切換」,同一個開關按兩次就回到原狀。所以每個數按兩次的會全部回到關,只剩按一次的那個還亮著。',
  steps: ['a ^ a = 0,a ^ 0 = a,而且 XOR 可以任意交換順序', 'n & (n − 1):去掉最低位的 1(數 1 的個數、判斷 2 的次方)', 'n & (−n):只留下最低位的 1', '(mask >> i) & 1:看第 i 位是不是 1;mask | (1 << i):把第 i 位設成 1'],
  watch: ['看每一「行」(同一個位數)的 1:出現偶數次的會變 0', '最下面那一列就是累積的 XOR'],
  whenToUse: ['找只出現一次的數(Single Number 系列)、缺失的數字', '數 1 的個數、反轉位元、兩數相加不用 +', '列舉子集(0 到 2ⁿ − 1 的每個整數就是一個子集)', '位元 DP 的狀態壓縮'],
  pitfalls: ['運算子優先順序很低,記得加括號:(x & 1) == 0', '負數右移在不同語言行為不同(Java 有 >>>)', 'Python 整數沒有位數上限,處理負數要自己 & 0xFFFFFFFF'],
  complexity: { time: 'O(n)', space: 'O(1)', why: '每個數 XOR 一次,只用一個變數。' },
  demo: {
    title: '其他數都出現兩次,找出只出現一次的數(LeetCode 136)',
    inputs: [{ key: 'nums', label: 'nums(0~31)', default: '4,1,2,1,2,7,4' }],
    run: xorRun,
    reference: (v) => {
      const cnt = new Map<number, number>()
      for (const x of parseInts(v.nums, 'nums', { min: 0, max: 31, maxLen: 9 })) cnt.set(x, (cnt.get(x) ?? 0) + 1)
      let r = 0
      for (const [x, c] of cnt) if (c % 2) r ^= x
      return r
    },
    random: () => {
      const pairs = randInts(randInt(0, 4), 0, 31)
      const all = [...pairs, ...pairs, randInt(0, 31)].sort(() => Math.random() - 0.5)
      return { nums: all.join(',') }
    },
    code: {
      python: `def single_number(nums):
    x = 0                                       #@init
    for n in nums:
        x ^= n                                  #@xor
    return x                                    #@done`,
      c: `int singleNumber(int* nums, int n) {
    int x = 0;                                  //@init
    for (int i = 0; i < n; i++)
        x ^= nums[i];                           //@xor
    return x;                                   //@done
}`,
      cpp: `int singleNumber(vector<int>& nums) {
    int x = 0;                                  //@init
    for (int n : nums)
        x ^= n;                                 //@xor
    return x;                                   //@done
}`,
      java: `int singleNumber(int[] nums) {
    int x = 0;                                  //@init
    for (int n : nums)
        x ^= n;                                 //@xor
    return x;                                   //@done
}`,
      javascript: `function singleNumber(nums) {
  let x = 0;                                    //@init
  for (const n of nums)
    x ^= n;                                     //@xor
  return x;                                     //@done
}`,
    },
  },
}

// ===== 數學:埃氏篩 =====

function* sieveRun(v: Record<string, string>): Generator<Frame> {
  const n = parseInt_(v.n, 'n', 2, 80)
  const W = 10
  const isP = new Array(n).fill(true)
  isP[0] = false
  if (n > 1) isP[1] = false
  const rows = Math.ceil(n / W)
  const f = (line: string, note: string, cur = -1, crossing: number[] = [], answer?: number): Frame => {
    const cells = Array.from({ length: rows }, (_, r) => Array.from({ length: W }, (_, c) => (r * W + c < n ? r * W + c : null)))
    const at = (k: number): Cell => [Math.floor(k / W), k % W]
    return {
      line,
      note,
      vars: answer !== undefined ? { answer } : {},
      views: [
        {
          kind: 'grid',
          label: `0 ~ ${n - 1}:黑色 = 目前的質數 p · 灰框 = 正在劃掉的倍數 · 淡色 = 已劃掉(不是質數)`,
          cells,
          marks: {
            done: range(0, n - 1).filter((k) => !isP[k]).map(at),
            hl: cur >= 0 ? [at(cur)] : [],
            cmp: crossing.map(at),
            land: answer !== undefined ? range(0, n - 1).filter((k) => isP[k]).map(at) : [],
          },
        },
      ],
    }
  }
  yield f('init', '先假設每個數都是質數;0 和 1 不是')
  for (let p = 2; p * p < n; p++) {
    if (!isP[p]) {
      yield f('skip', `${p} 已經被劃掉了,它的倍數也早就被它的因數劃掉了,跳過`, p)
      continue
    }
    const mult: number[] = []
    for (let k = p * p; k < n; k += p) mult.push(k)
    yield f('prime', `${p} 沒被劃掉 → 是質數。把它的倍數從 ${p}² = ${p * p} 開始全部劃掉(更小的倍數已經被更小的質數劃過)`, p, mult)
    mult.forEach((k) => (isP[k] = false))
    yield f('cross', `劃掉了 ${mult.length} 個`, p)
  }
  const cnt = isP.filter(Boolean).length
  yield f('done', `p² 已經 >= ${n},剩下沒被劃掉的都是質數,共 ${cnt} 個`, -1, [], cnt)
}

export const math: Pattern = {
  id: 'math',
  summary: '數學類題目靠的是一些固定的工具:質數篩法、最大公因數(輾轉相除)、快速冪、模運算、組合數。這裡示範最常見的埃氏篩法 —— 一次找出 n 以內所有質數。',
  analogy: '篩麵粉:先用最細的篩網(2)把 2 的倍數篩掉,再用 3 的篩網篩掉 3 的倍數…… 最後留在篩子上的都是質數。',
  steps: ['isPrime 全部設成 true,0 和 1 設成 false', 'p 從 2 開始,p × p < n 為止', '如果 p 還是質數,把 p², p² + p, p² + 2p … 都設成 false', '剩下 true 的就是質數'],
  watch: ['每輪劃掉的倍數從 p² 開始,而不是 2p', '到 p² >= n 就可以停了,後面不用再看'],
  whenToUse: ['數質數、質因數分解', '最大公因數 gcd(a, b) = gcd(b, a % b)', '快速冪:pow(x, n) 用 n 的二進位每次平方', '答案很大要 mod 10⁹+7(每一步都取模)', '矩陣旋轉、螺旋矩陣等幾何操作'],
  pitfalls: ['內層從 p × p 開始,外層到 p × p < n', '乘法可能溢位,要用 long 或先取模'],
  complexity: { time: 'O(n log log n)', space: 'O(n)', why: '每個合數只會被它的質因數劃掉,總次數約 n × (1/2 + 1/3 + 1/5 + …)。' },
  demo: {
    title: '數出小於 n 的質數有幾個(LeetCode 204)',
    inputs: [{ key: 'n', label: 'n(2~80)', default: '50' }],
    run: sieveRun,
    reference: (v) => {
      const n = Number(v.n)
      let c = 0
      for (let k = 2; k < n; k++) {
        let p = true
        for (let d = 2; d * d <= k; d++) if (k % d === 0) p = false
        if (p) c++
      }
      return c
    },
    random: () => ({ n: String(randInt(2, 80)) }),
    code: {
      python: `def count_primes(n):
    if n < 2: return 0
    is_p = [True] * n
    is_p[0] = is_p[1] = False                   #@init
    p = 2
    while p * p < n:
        if not is_p[p]: p += 1; continue        #@skip
        for k in range(p * p, n, p):            #@prime
            is_p[k] = False                     #@cross
        p += 1
    return sum(is_p)                            #@done`,
      c: `int countPrimes(int n) {
    if (n < 2) return 0;
    bool *isP = malloc(n);
    memset(isP, 1, n); isP[0] = isP[1] = 0;     //@init
    for (long p = 2; p * p < n; p++) {
        if (!isP[p]) continue;                  //@skip
        for (long k = p * p; k < n; k += p)     //@prime
            isP[k] = 0;                         //@cross
    }
    int c = 0;
    for (int i = 0; i < n; i++) c += isP[i];
    free(isP);
    return c;                                   //@done
}`,
      cpp: `int countPrimes(int n) {
    if (n < 2) return 0;
    vector<bool> isP(n, true);
    isP[0] = isP[1] = false;                    //@init
    for (long p = 2; p * p < n; p++) {
        if (!isP[p]) continue;                  //@skip
        for (long k = p * p; k < n; k += p)     //@prime
            isP[k] = false;                     //@cross
    }
    return count(isP.begin(), isP.end(), true); //@done
}`,
      java: `int countPrimes(int n) {
    if (n < 2) return 0;
    boolean[] isP = new boolean[n];
    Arrays.fill(isP, true); isP[0] = isP[1] = false;    //@init
    for (long p = 2; p * p < n; p++) {
        if (!isP[(int) p]) continue;            //@skip
        for (long k = p * p; k < n; k += p)     //@prime
            isP[(int) k] = false;               //@cross
    }
    int c = 0;
    for (boolean b : isP) if (b) c++;
    return c;                                   //@done
}`,
      javascript: `function countPrimes(n) {
  if (n < 2) return 0;
  const isP = new Array(n).fill(true);
  isP[0] = isP[1] = false;                      //@init
  for (let p = 2; p * p < n; p++) {
    if (!isP[p]) continue;                      //@skip
    for (let k = p * p; k < n; k += p)          //@prime
      isP[k] = false;                           //@cross
  }
  return isP.filter(Boolean).length;            //@done
}`,
    },
  },
}

// ===== 字串處理(271. Encode and Decode Strings) =====

function* codecRun(v: Record<string, string>): Generator<Frame> {
  const words = v.words.split(',').map((w) => w.trim())
  if (words.length > 5 || words.some((w) => !/^[a-z#0-9]{0,5}$/.test(w))) throw new Error('最多 5 個字串,每個最多 5 個字元(a-z、0-9、#)')
  const enc = words.map((w) => `${w.length}#${w}`).join('')
  const chars = enc.split('')
  const out: string[] = []
  const f = (line: string, note: string, opt: { range?: [number, number]; hl?: number[] } = {}, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [arr(words.map((w) => w || '(空)'), { label: '原本的字串清單' }), arr(chars, { label: '編碼後的一整個字串', range: opt.range, highlight: opt.hl }), arr(out.map((w) => w || '(空)'), { label: '解碼結果' })],
  })
  yield f('encode', `編碼:每個字串前面加上「長度#」,接在一起 → ${enc}。就算內容裡有 # 也不怕,因為我們是靠長度切的`)
  let i = 0
  while (i < chars.length) {
    let j = i
    while (chars[j] !== '#') j++
    const len = Number(enc.slice(i, j))
    yield f('len', `從位置 ${i} 往右讀到第一個 #:長度是 ${len}`, { range: [i, j], hl: [j] })
    const w = enc.slice(j + 1, j + 1 + len)
    out.push(w)
    yield f('take', `往後拿 ${len} 個字元:「${w}」`, { range: [j + 1, j + len], hl: range(j + 1, j + len) })
    i = j + 1 + len
  }
  yield f('done', '解碼完成,和原本一模一樣', {}, out.join(','))
}

export const stringOps: Pattern = {
  id: 'string-ops',
  summary: '字串題的基本功:逐字掃描、用指標切出片段、計數、自訂格式。關鍵通常不是演算法,而是把邊界想清楚。這裡示範一個經典技巧:用「長度 + 分隔符」把多個字串安全地合成一個。',
  analogy: '寄包裹時在每個箱子外面寫上「裡面有幾樣東西」,收件人就不會把兩箱的東西搞混 —— 就算箱子裡剛好也放了一張寫著「#」的紙條。',
  steps: ['編碼:每個字串寫成「長度 + # + 內容」,全部接起來', '解碼:指標 i 從 0 開始,往右找到 #,中間的數字就是長度', '從 # 後面拿「長度」個字元,就是一個字串', 'i 跳到這段的結尾,重複'],
  watch: ['淡色底框是目前正在讀的片段', '注意解碼完全不看內容,只靠長度切'],
  whenToUse: ['序列化 / 反序列化(字串、樹)', '字串壓縮、解析路徑、解析運算式', '大部分「Easy 字串題」:計數、雙指標、反轉'],
  pitfalls: ['只用分隔符(例如逗號)會在內容也有逗號時出錯', '注意空字串與長度兩位數以上的情況', '在迴圈裡用 + 串接字串可能是 O(n²),改用陣列 join'],
  complexity: { time: 'O(總長度)', space: 'O(總長度)', why: '每個字元只讀一次。' },
  demo: {
    title: '把字串清單編碼成一個字串,再解碼回來(LeetCode 271)',
    inputs: [{ key: 'words', label: '字串清單(逗號分隔)', default: 'leet,co#de,,12' }],
    run: codecRun,
    reference: (v) => v.words.split(',').map((w) => w.trim()).join(','),
    random: () => ({ words: Array.from({ length: randInt(1, 4) }, () => randStr(randInt(0, 4), 'ab#1')).join(',') }),
    code: {
      python: `def encode(strs):
    return ''.join(f'{len(s)}#{s}' for s in strs)  #@encode

def decode(s):
    res, i = [], 0
    while i < len(s):
        j = s.index('#', i)                     #@len
        n = int(s[i:j])                         #@len
        res.append(s[j + 1 : j + 1 + n])        #@take
        i = j + 1 + n                           #@take
    return res                                  #@done`,
      c: `// encode:sprintf 每段 "%d#%s";decode 如下
char** decode(char* s, int* retSize) {
    char **res = malloc(1000 * sizeof(char*)); *retSize = 0;
    // (encode 已完成)                          //@encode
    for (int i = 0; s[i]; ) {
        int n = 0, j = i;
        while (s[j] != '#') n = n * 10 + (s[j++] - '0');    //@len
        res[*retSize] = strndup(s + j + 1, n);  //@take
        (*retSize)++; i = j + 1 + n;            //@take
    }
    return res;                                 //@done
}`,
      cpp: `string encode(vector<string>& strs) {
    string out;
    for (auto& s : strs) out += to_string(s.size()) + "#" + s;  //@encode
    return out;
}
vector<string> decode(string s) {
    vector<string> res;
    for (size_t i = 0; i < s.size(); ) {
        size_t j = s.find('#', i);              //@len
        int n = stoi(s.substr(i, j - i));       //@len
        res.push_back(s.substr(j + 1, n));      //@take
        i = j + 1 + n;                          //@take
    }
    return res;                                 //@done
}`,
      java: `String encode(List<String> strs) {
    StringBuilder sb = new StringBuilder();
    for (String s : strs) sb.append(s.length()).append('#').append(s);  //@encode
    return sb.toString();
}
List<String> decode(String s) {
    List<String> res = new ArrayList<>();
    for (int i = 0; i < s.length(); ) {
        int j = s.indexOf('#', i);              //@len
        int n = Integer.parseInt(s.substring(i, j));    //@len
        res.add(s.substring(j + 1, j + 1 + n)); //@take
        i = j + 1 + n;                          //@take
    }
    return res;                                 //@done
}`,
      javascript: `const encode = (strs) => strs.map((s) => s.length + '#' + s).join('');  //@encode
function decode(s) {
  const res = [];
  for (let i = 0; i < s.length; ) {
    const j = s.indexOf('#', i);                //@len
    const n = Number(s.slice(i, j));            //@len
    res.push(s.slice(j + 1, j + 1 + n));        //@take
    i = j + 1 + n;                              //@take
  }
  return res;                                   //@done
}`,
    },
  },
}

// ===== 模擬(54. Spiral Matrix) =====

function* spiralRun(v: Record<string, string>): Generator<Frame> {
  const R = parseInt_(v.rows, '列數', 1, 6)
  const C = parseInt_(v.cols, '行數', 1, 7)
  const g = Array.from({ length: R }, (_, i) => Array.from({ length: C }, (_, j) => i * C + j + 1))
  const out: number[] = []
  const seen: Cell[] = []
  let top = 0
  let bottom = R - 1
  let left = 0
  let right = C - 1
  const f = (line: string, note: string, cur: Cell[] = [], answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : { top, bottom, left, right },
    views: [
      { kind: 'grid', label: '黑色 = 這一步走的 · 淡灰 = 已經走過', cells: g, marks: { done: seen, hl: cur, dim: g.flatMap((r, i) => r.map((_, j) => [i, j] as Cell)).filter(([i, j]) => (i < top || i > bottom || j < left || j > right) && !seen.some(([a, b]) => a === i && b === j)) } },
      arr(out, { label: '輸出順序' }),
    ],
  })
  yield f('init', `四個邊界:top = 0、bottom = ${R - 1}、left = 0、right = ${C - 1}。照「右 → 下 → 左 → 上」繞圈,每走完一條邊就把那條邊界往內縮`)
  while (top <= bottom && left <= right) {
    const step = (cells: Cell[]) => {
      cells.forEach(([i, j]) => out.push(g[i][j]))
      seen.push(...cells)
      return cells
    }
    let c = step(range(left, right).map((j) => [top, j] as Cell))
    yield f('right', `沿著上邊往右走,走完 top 往下縮:top = ${top + 1}`, c)
    top++
    c = step(range(top, bottom).map((i) => [i, right] as Cell))
    yield f('down', `沿著右邊往下走,走完 right 往左縮:right = ${right - 1}`, c)
    right--
    if (top <= bottom) {
      c = step(range(left, right).reverse().map((j) => [bottom, j] as Cell))
      yield f('left', `沿著下邊往左走,走完 bottom 往上縮:bottom = ${bottom - 1}`, c)
      bottom--
    }
    if (left <= right) {
      c = step(range(top, bottom).reverse().map((i) => [i, left] as Cell))
      yield f('up', `沿著左邊往上走,走完 left 往右縮:left = ${left + 1}`, c)
      left++
    }
  }
  yield f('done', '邊界交錯了,全部走完', [], out.join(','))
}

export const simulation: Pattern = {
  id: 'simulation',
  summary: '模擬題沒有特別的演算法,就是「照題目說的一步一步做」。難點在於把狀態(位置、方向、邊界)設計清楚,並處理好邊界情況。',
  analogy: '照著食譜做菜:不需要發明新方法,但每一步的份量、順序、火候都要照做,漏一步結果就不對。',
  steps: ['把需要追蹤的狀態列出來(這裡是上下左右四個邊界)', '寫出每一步的規則(往哪走、走完怎麼更新狀態)', '確認結束條件', '用最小的例子(1 × 1、1 × n、n × 1)手動驗證'],
  watch: ['每走完一條邊,那一側的邊界就往內縮一格', '單列或單行的矩陣是最容易出錯的情況'],
  whenToUse: ['螺旋矩陣、旋轉矩陣、遊戲規則模擬(生命遊戲)', '題目描述很長、但每一步都很明確', '標籤是 Array / Simulation、看不出特別演算法的題目'],
  pitfalls: ['往左、往上走之前要再檢查一次邊界(否則單列 / 單行會重複走)', '需要「同時更新」的題目(生命遊戲)要先複製或用額外的編碼'],
  complexity: { time: 'O(R × C)', space: 'O(1)(不算輸出)', why: '每一格只走一次。' },
  demo: {
    title: '螺旋順序走訪矩陣(LeetCode 54)',
    inputs: [
      { key: 'rows', label: '列數', default: '4' },
      { key: 'cols', label: '行數', default: '5' },
    ],
    run: spiralRun,
    reference: (v) => {
      const R = Number(v.rows)
      const C = Number(v.cols)
      const seen = Array.from({ length: R }, () => new Array(C).fill(false))
      const out: number[] = []
      const D = [[0, 1], [1, 0], [0, -1], [-1, 0]]
      let i = 0
      let j = 0
      let d = 0
      for (let k = 0; k < R * C; k++) {
        out.push(i * C + j + 1)
        seen[i][j] = true
        const [ni, nj] = [i + D[d][0], j + D[d][1]]
        if (ni < 0 || nj < 0 || ni >= R || nj >= C || seen[ni][nj]) d = (d + 1) % 4
        i += D[d][0]
        j += D[d][1]
      }
      return out.join(',')
    },
    random: () => ({ rows: String(randInt(1, 6)), cols: String(randInt(1, 7)) }),
    code: {
      python: `def spiral_order(m):
    res = []
    top, bottom = 0, len(m) - 1                 #@init
    left, right = 0, len(m[0]) - 1              #@init
    while top <= bottom and left <= right:
        for j in range(left, right + 1):        #@right
            res.append(m[top][j])               #@right
        top += 1                                #@right
        for i in range(top, bottom + 1):        #@down
            res.append(m[i][right])             #@down
        right -= 1                              #@down
        if top <= bottom:
            for j in range(right, left - 1, -1):    #@left
                res.append(m[bottom][j])        #@left
            bottom -= 1                         #@left
        if left <= right:
            for i in range(bottom, top - 1, -1):    #@up
                res.append(m[i][left])          #@up
            left += 1                           #@up
    return res                                  #@done`,
      c: `int* spiralOrder(int** m, int R, int* colSize, int* retSize) {
    int C = colSize[0], *res = malloc(R * C * sizeof(int)), k = 0;
    int top = 0, bottom = R - 1, left = 0, right = C - 1;   //@init
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) res[k++] = m[top][j];   top++;     //@right
        for (int i = top; i <= bottom; i++) res[k++] = m[i][right]; right--;   //@down
        if (top <= bottom) {
            for (int j = right; j >= left; j--) res[k++] = m[bottom][j]; bottom--;  //@left
        }
        if (left <= right) {
            for (int i = bottom; i >= top; i--) res[k++] = m[i][left]; left++;      //@up
        }
    }
    *retSize = k;
    return res;                                 //@done
}`,
      cpp: `vector<int> spiralOrder(vector<vector<int>>& m) {
    vector<int> res;
    int top = 0, bottom = m.size() - 1, left = 0, right = m[0].size() - 1;  //@init
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) res.push_back(m[top][j]);   top++;     //@right
        for (int i = top; i <= bottom; i++) res.push_back(m[i][right]); right--;   //@down
        if (top <= bottom) {
            for (int j = right; j >= left; j--) res.push_back(m[bottom][j]); bottom--;  //@left
        }
        if (left <= right) {
            for (int i = bottom; i >= top; i--) res.push_back(m[i][left]); left++;      //@up
        }
    }
    return res;                                 //@done
}`,
      java: `List<Integer> spiralOrder(int[][] m) {
    List<Integer> res = new ArrayList<>();
    int top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;  //@init
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) res.add(m[top][j]);   top++;     //@right
        for (int i = top; i <= bottom; i++) res.add(m[i][right]); right--;   //@down
        if (top <= bottom) {
            for (int j = right; j >= left; j--) res.add(m[bottom][j]); bottom--;  //@left
        }
        if (left <= right) {
            for (int i = bottom; i >= top; i--) res.add(m[i][left]); left++;      //@up
        }
    }
    return res;                                 //@done
}`,
      javascript: `function spiralOrder(m) {
  const res = [];
  let top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;  //@init
  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) res.push(m[top][j]);   top++;     //@right
    for (let i = top; i <= bottom; i++) res.push(m[i][right]); right--;   //@down
    if (top <= bottom) {
      for (let j = right; j >= left; j--) res.push(m[bottom][j]); bottom--;  //@left
    }
    if (left <= right) {
      for (let i = bottom; i >= top; i--) res.push(m[i][left]); left++;      //@up
    }
  }
  return res;                                   //@done
}`,
    },
  },
}

export const MISC = [greedy, intervalScheduling, kmp, segmentTree, bitManipulation, math, stringOps, simulation]

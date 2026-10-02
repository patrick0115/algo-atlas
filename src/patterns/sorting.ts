import type { ArrayViewData, Frame, Pattern } from '../types'
import { arr, parseInts, randInt, randInts, range, treeLayout } from '../engine/helpers'

// ===== 共用 =====

const sortInputs = [{ key: 'nums', label: '要排序的數字', default: '5,1,4,2,8,3' }]
const parseSortInput = (v: Record<string, string>) => parseInts(v.nums, '數字', { min: 0, max: 99, maxLen: 10 })
const sortRandom = () => ({ nums: randInts(randInt(1, 8), 0, 20).join(',') })
const sortReference = (v: Record<string, string>) => [...parseSortInput(v)].sort((a, b) => a - b).join(',')

/** 帶著穩定 id 的陣列,交換時長條會滑動 */
class Tracked {
  a: number[]
  ids: number[]
  constructor(a: number[]) {
    this.a = [...a]
    this.ids = a.map((_, i) => i)
  }
  swap(i: number, j: number) {
    ;[this.a[i], this.a[j]] = [this.a[j], this.a[i]]
    ;[this.ids[i], this.ids[j]] = [this.ids[j], this.ids[i]]
  }
  view(opt: Omit<ArrayViewData, 'kind' | 'values'> = {}): ArrayViewData {
    return arr(this.a, { mode: 'bars', ids: this.ids, ...opt })
  }
}

// ===== 氣泡排序 =====

function* bubbleRun(v: Record<string, string>): Generator<Frame> {
  const t = new Tracked(parseSortInput(v))
  const n = t.a.length
  const done: number[] = []
  const f = (line: string, note: string, opt: Omit<ArrayViewData, 'kind' | 'values'> = {}, vars: Frame['vars'] = {}): Frame => ({
    line,
    note,
    vars,
    views: [t.view({ done: [...done], ...opt })],
  })

  for (let i = 0; i < n - 1; i++) {
    yield f('outer', `第 ${i + 1} 輪:從左往右兩兩比較,這輪結束時最大的數會「浮」到第 ${n - 1 - i} 格`, {}, { 輪: i + 1 })
    let swapped = false
    for (let j = 0; j < n - 1 - i; j++) {
      const big = t.a[j] > t.a[j + 1]
      yield f('compare', `比較 ${t.a[j]} 和 ${t.a[j + 1]}:${big ? '左邊比較大,要交換' : '順序正確,不用動'}`, { compare: [j, j + 1] }, { 輪: i + 1, j })
      if (big) {
        t.swap(j, j + 1)
        swapped = true
        yield f('swap', `交換!${t.a[j + 1]} 往右移一格`, { highlight: [j + 1] }, { 輪: i + 1, j })
      }
    }
    done.push(n - 1 - i)
    if (!swapped) {
      done.push(...range(0, n - 2 - i))
      yield f('early', '這一輪完全沒有交換 → 已經排好了,提早結束')
      break
    }
  }
  if (!done.includes(0)) done.push(0)
  yield f('done', '排序完成', {}, { answer: t.a.join(',') })
}

export const bubbleSort: Pattern = {
  id: 'bubble-sort',
  summary: '一直比較「相鄰的兩個數」,左邊比較大就交換。每跑完一輪,最大的數就會像泡泡一樣浮到最右邊。',
  analogy: '像體育課排身高:從隊伍左邊開始,相鄰兩個人比身高,高的往後站。走完一趟,最高的人一定站到最後面。',
  steps: [
    '從第 0 格開始,比較第 j 格和第 j+1 格',
    '如果左邊比較大,兩個交換',
    'j 往右一格,重複到這輪的尾巴',
    '一輪結束,最右邊那格就定案(變成淡灰色)',
    '下一輪只需要處理還沒定案的部分;某一輪完全沒交換就代表排好了',
  ],
  watch: ['灰框的兩根長條是「正在比較」', '黑色那根是剛被交換的', '淺色底的長條已經定案,不會再動'],
  whenToUse: [
    '面試很少直接考,但「只能交換相鄰元素」的題目本質就是氣泡排序',
    '「最少相鄰交換次數」= 逆序對數量,常和合併排序一起出現',
  ],
  pitfalls: ['內層迴圈的上界是 n−1−i,不是 n−1(後面已經排好)', '沒有「提早結束」的版本,在已排序輸入上也要 O(n²)'],
  complexity: { time: 'O(n²)', space: 'O(1)', why: '最多 n 輪,每輪最多比較 n 次。已排好時只要一輪,所以最好是 O(n)。' },
  demo: {
    title: '把一串數字由小到大排好',
    inputs: sortInputs,
    run: bubbleRun,
    reference: sortReference,
    random: sortRandom,
    code: {
      python: `def bubble_sort(a):
    n = len(a)
    for i in range(n - 1):                      #@outer
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:                 #@compare
                a[j], a[j + 1] = a[j + 1], a[j] #@swap
                swapped = True                  #@swap
        if not swapped:                         #@early
            break                               #@early
    return a                                    #@done`,
      c: `void bubble_sort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {           //@outer
        int swapped = 0;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {              //@compare
                int t = a[j];                   //@swap
                a[j] = a[j + 1];                //@swap
                a[j + 1] = t;                   //@swap
                swapped = 1;                    //@swap
            }
        }
        if (!swapped) break;                    //@early
    }
}                                               //@done`,
      cpp: `void bubbleSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {           //@outer
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {              //@compare
                swap(a[j], a[j + 1]);           //@swap
                swapped = true;                 //@swap
            }
        }
        if (!swapped) break;                    //@early
    }
}                                               //@done`,
      java: `void bubbleSort(int[] a) {
    int n = a.length;
    for (int i = 0; i < n - 1; i++) {           //@outer
        boolean swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {              //@compare
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;  //@swap
                swapped = true;                 //@swap
            }
        }
        if (!swapped) break;                    //@early
    }
}                                               //@done`,
      javascript: `function bubbleSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {             //@outer
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {                    //@compare
        [a[j], a[j + 1]] = [a[j + 1], a[j]];    //@swap
        swapped = true;                         //@swap
      }
    }
    if (!swapped) break;                        //@early
  }
  return a;                                     //@done
}`,
    },
  },
}

// ===== 選擇排序 =====

function* selectionRun(v: Record<string, string>): Generator<Frame> {
  const t = new Tracked(parseSortInput(v))
  const n = t.a.length
  const f = (line: string, note: string, opt: Omit<ArrayViewData, 'kind' | 'values'> = {}, vars: Frame['vars'] = {}): Frame => ({
    line,
    note,
    vars,
    views: [t.view(opt)],
  })
  for (let i = 0; i < n - 1; i++) {
    let m = i
    const done = range(0, i - 1)
    yield f('outer', `第 ${i} 格要放「剩下的數裡最小的」。先假設最小的是 ${t.a[i]}`, { done, pointers: [{ name: 'min', index: m }] }, { i })
    for (let j = i + 1; j < n; j++) {
      const smaller = t.a[j] < t.a[m]
      yield f('scan', `${t.a[j]} ${smaller ? '<' : '>='} 目前最小 ${t.a[m]}`, { done, compare: [j], pointers: [{ name: 'min', index: m }, { name: 'j', index: j, color: 'b' }] }, { i, j })
      if (smaller) {
        m = j
        yield f('newmin', `找到更小的:最小值改成 ${t.a[m]}`, { done, highlight: [m], pointers: [{ name: 'min', index: m }] }, { i, j })
      }
    }
    t.swap(i, m)
    yield f('swap', m === i ? `${t.a[i]} 本來就在第 ${i} 格,不用換` : `把最小值 ${t.a[i]} 換到第 ${i} 格`, { done: range(0, i), highlight: [i] }, { i })
  }
  yield f('done', '排序完成', { done: range(0, n - 1) }, { answer: t.a.join(',') })
}

export const selectionSort: Pattern = {
  id: 'selection-sort',
  summary: '每一輪從「還沒排的部分」挑出最小的,放到最前面。',
  analogy: '打牌整理手牌:每次從桌上剩下的牌裡挑最小的那張,放到手上已排好那排的最右邊。',
  steps: ['i 從 0 開始,代表「下一個要填的位置」', '從 i 往右掃,記住最小值的位置 min', '掃完把 min 那格和第 i 格交換', 'i 往右一格,直到最後'],
  watch: ['min 指標會跳到目前看到最小的數', '每輪結束只交換一次'],
  whenToUse: ['「每次選出最大/最小放到定位」的題目,例如 Pancake Sorting、Maximum Swap', '交換次數最少(最多 n−1 次)'],
  pitfalls: ['不是穩定排序:相同的數相對順序可能改變', '不管輸入如何都是 O(n²)'],
  complexity: { time: 'O(n²)', space: 'O(1)', why: '第 i 輪要掃 n−i 個數,加起來約 n²/2。' },
  demo: {
    title: '把一串數字由小到大排好',
    inputs: sortInputs,
    run: selectionRun,
    reference: sortReference,
    random: sortRandom,
    code: {
      python: `def selection_sort(a):
    n = len(a)
    for i in range(n - 1):
        m = i                                   #@outer
        for j in range(i + 1, n):
            if a[j] < a[m]:                     #@scan
                m = j                           #@newmin
        a[i], a[m] = a[m], a[i]                 #@swap
    return a                                    #@done`,
      c: `void selection_sort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int m = i;                              //@outer
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[m])                    //@scan
                m = j;                          //@newmin
        int t = a[i]; a[i] = a[m]; a[m] = t;    //@swap
    }
}                                               //@done`,
      cpp: `void selectionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        int m = i;                              //@outer
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[m])                    //@scan
                m = j;                          //@newmin
        swap(a[i], a[m]);                       //@swap
    }
}                                               //@done`,
      java: `void selectionSort(int[] a) {
    int n = a.length;
    for (int i = 0; i < n - 1; i++) {
        int m = i;                              //@outer
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[m])                    //@scan
                m = j;                          //@newmin
        int t = a[i]; a[i] = a[m]; a[m] = t;    //@swap
    }
}                                               //@done`,
      javascript: `function selectionSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let m = i;                                  //@outer
    for (let j = i + 1; j < n; j++)
      if (a[j] < a[m])                          //@scan
        m = j;                                  //@newmin
    [a[i], a[m]] = [a[m], a[i]];                //@swap
  }
  return a;                                     //@done
}`,
    },
  },
}

// ===== 插入排序 =====

function* insertionRun(v: Record<string, string>): Generator<Frame> {
  const t = new Tracked(parseSortInput(v))
  const n = t.a.length
  const f = (line: string, note: string, opt: Omit<ArrayViewData, 'kind' | 'values'> = {}, vars: Frame['vars'] = {}): Frame => ({
    line,
    note,
    vars,
    views: [t.view(opt)],
  })
  yield f('pick', `一開始,第 0 格自己就算「排好的一段」`, { range: [0, 0] })
  for (let i = 1; i < n; i++) {
    const key = t.a[i]
    let j = i - 1
    yield f('pick', `拿出第 ${i} 格的 ${key},要把它插進左邊已排好的那段`, { range: [0, i - 1], highlight: [i] }, { key, i })
    while (true) {
      const go = j >= 0 && t.a[j] > key
      yield f('compare', j < 0 ? '已經到最左邊了' : `${t.a[j]} ${go ? '>' : '<='} ${key}${go ? ',它要往右讓位' : ',找到位置了'}`, { range: [0, i], highlight: [j + 1], compare: j >= 0 ? [j] : [] }, { key, i, j })
      if (!go) break
      t.swap(j, j + 1) // 效果等同於 a[j+1] = a[j] 再把 key 往左放
      yield f('shift', `${t.a[j + 1]} 往右挪一格`, { range: [0, i], highlight: [j] }, { key, i, j })
      j--
    }
    yield f('insert', `${key} 放在第 ${j + 1} 格,左邊 0~${i} 這段又排好了`, { range: [0, i], highlight: [j + 1] }, { key, i })
  }
  yield f('done', '排序完成', { done: range(0, n - 1) }, { answer: t.a.join(',') })
}

export const insertionSort: Pattern = {
  id: 'insertion-sort',
  summary: '左邊維持一段「已排好」的區域,每次拿右邊下一個數,往左找到正確位置插進去。',
  analogy: '摸牌時整理手牌:每摸一張新牌,就從右往左找,插到比它小的那張後面。',
  steps: ['第 0 格自己算排好', '拿出第 i 格當 key', '從 i−1 往左看,比 key 大的都往右挪一格', '遇到 <= key 的數(或到最左)就停,把 key 放進空出來的位置'],
  watch: ['淡色底框是「已排好」的區域,會一格一格長大', '黑色那根就是 key,看它一路往左滑'],
  whenToUse: ['資料幾乎已經排好時非常快(接近 O(n))', '鏈結串列排序(147)、資料一筆一筆進來要維持有序'],
  pitfalls: ['往左找時要先檢查 j >= 0 再讀 a[j]', '比較用 > 而不是 >=,才能保持穩定'],
  complexity: { time: 'O(n²),幾乎排好時 O(n)', space: 'O(1)', why: '最壞每個數都要往左走到底;已排好時每個數比一次就停。' },
  demo: {
    title: '把一串數字由小到大排好',
    inputs: sortInputs,
    run: insertionRun,
    reference: sortReference,
    random: sortRandom,
    code: {
      python: `def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]                              #@pick
        j = i - 1
        while j >= 0 and a[j] > key:            #@compare
            a[j + 1] = a[j]                     #@shift
            j -= 1                              #@shift
        a[j + 1] = key                          #@insert
    return a                                    #@done`,
      c: `void insertion_sort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i];                         //@pick
        int j = i - 1;
        while (j >= 0 && a[j] > key) {          //@compare
            a[j + 1] = a[j];                    //@shift
            j--;                                //@shift
        }
        a[j + 1] = key;                         //@insert
    }
}                                               //@done`,
      cpp: `void insertionSort(vector<int>& a) {
    for (int i = 1; i < (int)a.size(); i++) {
        int key = a[i];                         //@pick
        int j = i - 1;
        while (j >= 0 && a[j] > key) {          //@compare
            a[j + 1] = a[j];                    //@shift
            j--;                                //@shift
        }
        a[j + 1] = key;                         //@insert
    }
}                                               //@done`,
      java: `void insertionSort(int[] a) {
    for (int i = 1; i < a.length; i++) {
        int key = a[i];                         //@pick
        int j = i - 1;
        while (j >= 0 && a[j] > key) {          //@compare
            a[j + 1] = a[j];                    //@shift
            j--;                                //@shift
        }
        a[j + 1] = key;                         //@insert
    }
}                                               //@done`,
      javascript: `function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];                           //@pick
    let j = i - 1;
    while (j >= 0 && a[j] > key) {              //@compare
      a[j + 1] = a[j];                          //@shift
      j--;                                      //@shift
    }
    a[j + 1] = key;                             //@insert
  }
  return a;                                     //@done
}`,
    },
  },
}

// ===== 合併排序 =====

function* mergeRun(v: Record<string, string>): Generator<Frame> {
  const a = parseSortInput(v)
  const n = a.length
  let tmpView: number[] = []
  const f = (line: string, note: string, opt: Omit<ArrayViewData, 'kind' | 'values'> = {}, vars: Frame['vars'] = {}): Frame => ({
    line,
    note,
    vars,
    views: [arr(a, { mode: 'bars', ...opt }), arr(tmpView, { label: 'tmp(合併用的暫存區)' })],
  })

  function* sort(lo: number, hi: number, depth: number): Generator<Frame> {
    if (lo >= hi) {
      yield f('base', `只剩 1 個數(第 ${lo} 格),本來就是排好的`, { range: [lo, hi] }, { lo, hi, 深度: depth })
      return
    }
    const mid = (lo + hi) >> 1
    yield f('split', `把 [${lo}..${hi}] 切成左半 [${lo}..${mid}] 和右半 [${mid + 1}..${hi}]`, { range: [lo, hi], pointers: [{ name: 'mid', index: mid }] }, { lo, mid, hi, 深度: depth })
    yield* sort(lo, mid, depth + 1)
    yield* sort(mid + 1, hi, depth + 1)

    tmpView = []
    let i = lo
    let j = mid + 1
    yield f('merge', `左右兩半各自排好了,開始合併 [${lo}..${hi}]`, { range: [lo, hi], pointers: [{ name: 'i', index: i }, { name: 'j', index: j, color: 'b' }] }, { lo, mid, hi })
    while (i <= mid && j <= hi) {
      const left = a[i] <= a[j]
      yield f('compare', `比較左半的 ${a[i]} 和右半的 ${a[j]},${left ? '左邊' : '右邊'}比較小(或相等取左)`, { range: [lo, hi], compare: [i, j], pointers: [{ name: 'i', index: i }, { name: 'j', index: j, color: 'b' }] }, { lo, mid, hi })
      if (left) tmpView.push(a[i++])
      else tmpView.push(a[j++])
      yield f('take', `把 ${tmpView.at(-1)} 放進 tmp`, { range: [lo, hi], pointers: [{ name: 'i', index: Math.min(i, n - 1) }, { name: 'j', index: Math.min(j, n - 1), color: 'b' }] }, { lo, mid, hi })
    }
    tmpView.push(...a.slice(i, mid + 1), ...a.slice(j, hi + 1))
    yield f('rest', '其中一半用完了,另一半剩下的直接接到 tmp 後面', { range: [lo, hi] }, { lo, mid, hi })
    for (let k = 0; k < tmpView.length; k++) a[lo + k] = tmpView[k]
    yield f('copy', `tmp 抄回原陣列,[${lo}..${hi}] 排好了`, { range: [lo, hi], highlight: range(lo, hi) }, { lo, hi })
    tmpView = []
  }

  yield* sort(0, n - 1, 0)
  yield f('done', '排序完成', { done: range(0, n - 1) }, { answer: a.join(',') })
}

export const mergeSort: Pattern = {
  id: 'merge-sort',
  summary: '先把陣列一直對半切到每段只剩 1 個數,再兩兩「合併」成有序的一段。合併兩段已排好的數很容易:每次比較兩邊的開頭,拿小的。',
  analogy: '兩疊已經按分數排好的考卷要合成一疊:只要一直比較兩疊最上面那張,拿分數低的放到新的一疊。',
  steps: ['切:把 [lo..hi] 從中間 mid 切兩半', '遞迴:左半、右半各自排好', '合:i 指左半開頭、j 指右半開頭,每次把較小的放進 tmp', '一半用完後,另一半剩下的直接接上', 'tmp 抄回原陣列'],
  watch: ['淡色底框是目前在處理的區間,會先一路變小(切),再一路變大(合)', '下方 tmp 一格一格長出來,就是合併的結果'],
  whenToUse: [
    '鏈結串列排序(不需要隨機存取)',
    '「數逆序對」「右邊比我小的有幾個」:合併時順便數',
    '需要穩定排序、或要保證最壞 O(n log n)',
  ],
  pitfalls: ['比較用 <=(相等時先拿左邊)才是穩定排序', '別忘了處理其中一邊剩下的元素', '陣列版需要 O(n) 額外空間'],
  complexity: { time: 'O(n log n)', space: 'O(n)', why: '每一層合併總共處理 n 個數,切一半切到底有 log n 層。' },
  demo: {
    title: '把一串數字由小到大排好',
    inputs: sortInputs,
    run: mergeRun,
    reference: sortReference,
    random: sortRandom,
    code: {
      python: `def merge_sort(a, lo, hi):
    if lo >= hi: return                         #@base
    mid = (lo + hi) // 2                        #@split
    merge_sort(a, lo, mid)
    merge_sort(a, mid + 1, hi)
    tmp, i, j = [], lo, mid + 1                 #@merge
    while i <= mid and j <= hi:                 #@compare
        if a[i] <= a[j]: tmp.append(a[i]); i += 1   #@take
        else:            tmp.append(a[j]); j += 1   #@take
    tmp += a[i:mid + 1] + a[j:hi + 1]           #@rest
    a[lo:hi + 1] = tmp                          #@copy
# 呼叫:merge_sort(a, 0, len(a) - 1)            #@done`,
      c: `void merge_sort(int a[], int tmp[], int lo, int hi) {
    if (lo >= hi) return;                       //@base
    int mid = (lo + hi) / 2;                    //@split
    merge_sort(a, tmp, lo, mid);
    merge_sort(a, tmp, mid + 1, hi);
    int i = lo, j = mid + 1, k = 0;             //@merge
    while (i <= mid && j <= hi) {               //@compare
        if (a[i] <= a[j]) tmp[k++] = a[i++];    //@take
        else              tmp[k++] = a[j++];    //@take
    }
    while (i <= mid) tmp[k++] = a[i++];         //@rest
    while (j <= hi)  tmp[k++] = a[j++];         //@rest
    for (k = 0; lo + k <= hi; k++) a[lo + k] = tmp[k];  //@copy
}
// 呼叫:merge_sort(a, tmp, 0, n - 1);          //@done`,
      cpp: `void mergeSort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;                       //@base
    int mid = (lo + hi) / 2;                    //@split
    mergeSort(a, lo, mid);
    mergeSort(a, mid + 1, hi);
    vector<int> tmp; int i = lo, j = mid + 1;   //@merge
    while (i <= mid && j <= hi) {               //@compare
        if (a[i] <= a[j]) tmp.push_back(a[i++]);    //@take
        else              tmp.push_back(a[j++]);    //@take
    }
    while (i <= mid) tmp.push_back(a[i++]);     //@rest
    while (j <= hi)  tmp.push_back(a[j++]);     //@rest
    copy(tmp.begin(), tmp.end(), a.begin() + lo);   //@copy
}
// 呼叫:mergeSort(a, 0, a.size() - 1);         //@done`,
      java: `void mergeSort(int[] a, int lo, int hi) {
    if (lo >= hi) return;                       //@base
    int mid = (lo + hi) / 2;                    //@split
    mergeSort(a, lo, mid);
    mergeSort(a, mid + 1, hi);
    int[] tmp = new int[hi - lo + 1];           //@merge
    int i = lo, j = mid + 1, k = 0;             //@merge
    while (i <= mid && j <= hi) {               //@compare
        if (a[i] <= a[j]) tmp[k++] = a[i++];    //@take
        else              tmp[k++] = a[j++];    //@take
    }
    while (i <= mid) tmp[k++] = a[i++];         //@rest
    while (j <= hi)  tmp[k++] = a[j++];         //@rest
    System.arraycopy(tmp, 0, a, lo, tmp.length);    //@copy
}
// 呼叫:mergeSort(a, 0, a.length - 1);         //@done`,
      javascript: `function mergeSort(a, lo = 0, hi = a.length - 1) {
  if (lo >= hi) return;                         //@base
  const mid = (lo + hi) >> 1;                   //@split
  mergeSort(a, lo, mid);
  mergeSort(a, mid + 1, hi);
  const tmp = []; let i = lo, j = mid + 1;      //@merge
  while (i <= mid && j <= hi) {                 //@compare
    if (a[i] <= a[j]) tmp.push(a[i++]);         //@take
    else              tmp.push(a[j++]);         //@take
  }
  while (i <= mid) tmp.push(a[i++]);            //@rest
  while (j <= hi)  tmp.push(a[j++]);            //@rest
  for (let k = 0; k < tmp.length; k++) a[lo + k] = tmp[k];  //@copy
}
// 呼叫:mergeSort(a);                           //@done`,
    },
  },
}

// ===== 快速排序 =====

function* quickRun(v: Record<string, string>): Generator<Frame> {
  const t = new Tracked(parseSortInput(v))
  const n = t.a.length
  const fixed = new Set<number>()
  const f = (line: string, note: string, opt: Omit<ArrayViewData, 'kind' | 'values'> = {}, vars: Frame['vars'] = {}): Frame => ({
    line,
    note,
    vars,
    views: [t.view({ done: [...fixed], ...opt })],
  })

  function* qs(lo: number, hi: number): Generator<Frame> {
    if (lo >= hi) {
      if (lo === hi) fixed.add(lo)
      yield f('base', lo === hi ? `區間只有第 ${lo} 格,已經定位` : '空區間,直接返回', {}, { lo, hi })
      return
    }
    const pivot = t.a[hi]
    let i = lo
    yield f('pivot', `處理 [${lo}..${hi}]:選最右邊的 ${pivot} 當基準(pivot)。目標:比它小的都搬到左邊`, { range: [lo, hi], highlight: [hi], pointers: [{ name: 'i', index: i }] }, { lo, hi, pivot })
    for (let j = lo; j < hi; j++) {
      const small = t.a[j] < pivot
      yield f('scan', `${t.a[j]} ${small ? '<' : '>='} pivot ${pivot}${small ? ',要搬到左邊 i 的位置' : ',留在右邊'}`, { range: [lo, hi], compare: [j], highlight: [hi], pointers: [{ name: 'i', index: i }, { name: 'j', index: j, color: 'b' }] }, { lo, hi, pivot })
      if (small) {
        t.swap(i, j)
        i++
        yield f('swap', `交換到左邊,i 往右一格(i 左邊都是比 pivot 小的)`, { range: [lo, hi], highlight: [hi], dim: [], pointers: [{ name: 'i', index: i }, { name: 'j', index: j, color: 'b' }] }, { lo, hi, pivot })
      }
    }
    t.swap(i, hi)
    fixed.add(i)
    yield f('place', `把 pivot ${pivot} 放到第 ${i} 格:左邊都比它小、右邊都 >= 它,它的位置定案了`, { range: [lo, hi], highlight: [i] }, { lo, hi, pivot })
    yield f('recurse', `接著分別處理左邊 [${lo}..${i - 1}] 和右邊 [${i + 1}..${hi}]`, { range: [lo, hi] }, { lo, hi })
    yield* qs(lo, i - 1)
    yield* qs(i + 1, hi)
  }

  yield* qs(0, n - 1)
  yield f('done', '排序完成', { done: range(0, n - 1) }, { answer: t.a.join(',') })
}

export const quickSort: Pattern = {
  id: 'quick-sort',
  summary: '挑一個基準數 pivot,把比它小的全搬到左邊、大的留在右邊,pivot 就落在最終位置。再對左右兩邊重複一樣的事。',
  analogy: '老師說「比 160 公分矮的站左邊,其他站右邊」,160 公分那位同學就站在中間 —— 他的位置確定了。再分別對左右兩群重複。',
  steps: ['選 pivot(這裡選最右邊那個)', 'i 代表「下一個小數要放的位置」,從 lo 開始', 'j 從左掃到右:遇到比 pivot 小的就和 i 交換,i 往右', '掃完把 pivot 和第 i 格交換,pivot 定位', '對 pivot 左邊、右邊遞迴'],
  watch: ['黑色那根是 pivot', 'i 左邊永遠都是「比 pivot 小」的數', '淺色底的長條是已經定位、不會再動的 pivot'],
  whenToUse: [
    '第 K 大 / 前 K 小:只遞迴其中一邊,就是「快速選擇」,平均 O(n)',
    '依條件把陣列分兩堆(奇偶、顏色、正負)就是一次 partition',
  ],
  pitfalls: ['已排序的輸入 + 固定選最右邊 → 退化成 O(n²);實戰要隨機選 pivot', '大量重複元素時要用三路 partition(Sort Colors)'],
  complexity: { time: '平均 O(n log n),最壞 O(n²)', space: 'O(log n) 遞迴', why: 'pivot 每次大約切一半時有 log n 層,每層總共掃 n 個。' },
  demo: {
    title: '把一串數字由小到大排好(Lomuto partition)',
    inputs: sortInputs,
    run: quickRun,
    reference: sortReference,
    random: sortRandom,
    code: {
      python: `def quick_sort(a, lo, hi):
    if lo >= hi: return                         #@base
    pivot, i = a[hi], lo                        #@pivot
    for j in range(lo, hi):
        if a[j] < pivot:                        #@scan
            a[i], a[j] = a[j], a[i]             #@swap
            i += 1                              #@swap
    a[i], a[hi] = a[hi], a[i]                   #@place
    quick_sort(a, lo, i - 1)                    #@recurse
    quick_sort(a, i + 1, hi)                    #@recurse
# 呼叫:quick_sort(a, 0, len(a) - 1)            #@done`,
      c: `void quick_sort(int a[], int lo, int hi) {
    if (lo >= hi) return;                       //@base
    int pivot = a[hi], i = lo, t;               //@pivot
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) {                     //@scan
            t = a[i]; a[i] = a[j]; a[j] = t;    //@swap
            i++;                                //@swap
        }
    }
    t = a[i]; a[i] = a[hi]; a[hi] = t;          //@place
    quick_sort(a, lo, i - 1);                   //@recurse
    quick_sort(a, i + 1, hi);                   //@recurse
}
// 呼叫:quick_sort(a, 0, n - 1);               //@done`,
      cpp: `void quickSort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;                       //@base
    int pivot = a[hi], i = lo;                  //@pivot
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) {                     //@scan
            swap(a[i], a[j]);                   //@swap
            i++;                                //@swap
        }
    }
    swap(a[i], a[hi]);                          //@place
    quickSort(a, lo, i - 1);                    //@recurse
    quickSort(a, i + 1, hi);                    //@recurse
}
// 呼叫:quickSort(a, 0, a.size() - 1);         //@done`,
      java: `void quickSort(int[] a, int lo, int hi) {
    if (lo >= hi) return;                       //@base
    int pivot = a[hi], i = lo, t;               //@pivot
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) {                     //@scan
            t = a[i]; a[i] = a[j]; a[j] = t;    //@swap
            i++;                                //@swap
        }
    }
    t = a[i]; a[i] = a[hi]; a[hi] = t;          //@place
    quickSort(a, lo, i - 1);                    //@recurse
    quickSort(a, i + 1, hi);                    //@recurse
}
// 呼叫:quickSort(a, 0, a.length - 1);         //@done`,
      javascript: `function quickSort(a, lo = 0, hi = a.length - 1) {
  if (lo >= hi) return;                         //@base
  const pivot = a[hi]; let i = lo;              //@pivot
  for (let j = lo; j < hi; j++) {
    if (a[j] < pivot) {                         //@scan
      [a[i], a[j]] = [a[j], a[i]];              //@swap
      i++;                                      //@swap
    }
  }
  [a[i], a[hi]] = [a[hi], a[i]];                //@place
  quickSort(a, lo, i - 1);                      //@recurse
  quickSort(a, i + 1, hi);                      //@recurse
}
// 呼叫:quickSort(a);                           //@done`,
    },
  },
}

// ===== 堆積排序 =====

function* heapRun(v: Record<string, string>): Generator<Frame> {
  const t = new Tracked(parseSortInput(v))
  const n = t.a.length
  let size = n
  const f = (line: string, note: string, hl: number[] = [], cmp: number[] = [], vars: Frame['vars'] = {}): Frame => {
    const tree = treeLayout(t.a.slice(0, size))
    tree.nodes.forEach((nd) => {
      const i = Number(nd.id)
      nd.cls = hl.includes(i) ? 'hl' : cmp.includes(i) ? 'cmp' : undefined
      nd.sub = `[${i}]`
    })
    return {
      line,
      note,
      vars: { 堆大小: size, ...vars },
      views: [
        { kind: 'graph', label: `heap(陣列前 ${size} 格畫成樹:i 的孩子是 2i+1、2i+2)`, ...tree },
        t.view({ done: range(size, n - 1), highlight: hl, compare: cmp }),
      ],
    }
  }

  function* sift(i: number): Generator<Frame> {
    while (2 * i + 1 < size) {
      let c = 2 * i + 1
      if (c + 1 < size && t.a[c + 1] > t.a[c]) c++
      yield f('child', `${t.a[i]} 的孩子中較大的是 ${t.a[c]}`, [i], [c])
      if (t.a[i] >= t.a[c]) {
        yield f('child', `${t.a[i]} >= ${t.a[c]},已經比孩子大,停止下沉`, [i])
        return
      }
      t.swap(i, c)
      yield f('swapdown', `${t.a[c]} 比孩子小,和 ${t.a[i]} 交換(往下沉)`, [c])
      i = c
    }
  }

  yield f('build', '第一步:把陣列整理成「最大堆」—— 每個節點都比它的孩子大')
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    yield f('build', `從最後一個有孩子的節點往回處理:讓第 ${i} 格下沉`, [i])
    yield* sift(i)
  }
  yield f('build', `最大堆建好了,最大值 ${t.a[0]} 就在樹根(第 0 格)`, [0])
  for (let end = n - 1; end > 0; end--) {
    t.swap(0, end)
    size = end
    yield f('extract', `把樹根(最大值)${t.a[end]} 換到尾端第 ${end} 格,它定案了;堆縮小 1`, [0])
    yield* sift(0)
  }
  size = 0
  yield f('done', '排序完成', [], [], { answer: t.a.join(',') })
}

export const heapSort: Pattern = {
  id: 'heap-sort',
  summary: '先把陣列整理成「最大堆」(樹根最大),然後不斷把樹根換到尾巴,再把新的樹根往下沉,恢復最大堆。',
  analogy: '像淘汰賽:每次冠軍(樹根)出列站到最後面,剩下的人重新比一次,新的冠軍又浮上來。',
  steps: [
    '陣列可以看成一棵完全二元樹:第 i 格的孩子在 2i+1、2i+2',
    '建堆:從最後一個有孩子的節點往回,每個都「下沉」',
    '下沉:和較大的孩子比,比孩子小就交換,一路往下',
    '排序:把樹根和最後一格交換,堆縮小 1,再讓新樹根下沉',
  ],
  watch: ['上面的樹和下面的長條是同一個陣列', '黑色節點正在下沉;灰框是它正在比較的孩子', '淺色底的長條已經被移出堆、定案'],
  whenToUse: ['理解 Heap(優先佇列)怎麼運作:Top-K、合併 K 個串列、Dijkstra 都靠它', '要 O(1) 額外空間又要保證 O(n log n)'],
  pitfalls: ['孩子索引是 2i+1 和 2i+2(0-based)', '建堆要從 n/2−1 往回做,不是從 0 往後'],
  complexity: { time: 'O(n log n)', space: 'O(1)', why: '建堆 O(n);之後 n 次取出,每次下沉最多走樹高 log n。' },
  demo: {
    title: '把一串數字由小到大排好',
    inputs: sortInputs,
    run: heapRun,
    reference: sortReference,
    random: sortRandom,
    code: {
      python: `def sift_down(a, i, size):
    while 2 * i + 1 < size:
        c = 2 * i + 1
        if c + 1 < size and a[c + 1] > a[c]: c += 1  #@child
        if a[i] >= a[c]: break                      #@child
        a[i], a[c] = a[c], a[i]                     #@swapdown
        i = c                                       #@swapdown

def heap_sort(a):
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):             #@build
        sift_down(a, i, n)                          #@build
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]                 #@extract
        sift_down(a, 0, end)                        #@extract
    return a                                        #@done`,
      c: `void sift_down(int a[], int i, int size) {
    while (2 * i + 1 < size) {
        int c = 2 * i + 1;
        if (c + 1 < size && a[c + 1] > a[c]) c++;   //@child
        if (a[i] >= a[c]) break;                    //@child
        int t = a[i]; a[i] = a[c]; a[c] = t;        //@swapdown
        i = c;                                      //@swapdown
    }
}
void heap_sort(int a[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--)            //@build
        sift_down(a, i, n);                         //@build
    for (int end = n - 1; end > 0; end--) {
        int t = a[0]; a[0] = a[end]; a[end] = t;    //@extract
        sift_down(a, 0, end);                       //@extract
    }
}                                                   //@done`,
      cpp: `void siftDown(vector<int>& a, int i, int size) {
    while (2 * i + 1 < size) {
        int c = 2 * i + 1;
        if (c + 1 < size && a[c + 1] > a[c]) c++;   //@child
        if (a[i] >= a[c]) break;                    //@child
        swap(a[i], a[c]);                           //@swapdown
        i = c;                                      //@swapdown
    }
}
void heapSort(vector<int>& a) {
    int n = a.size();
    for (int i = n / 2 - 1; i >= 0; i--)            //@build
        siftDown(a, i, n);                          //@build
    for (int end = n - 1; end > 0; end--) {
        swap(a[0], a[end]);                         //@extract
        siftDown(a, 0, end);                        //@extract
    }
}                                                   //@done`,
      java: `void siftDown(int[] a, int i, int size) {
    while (2 * i + 1 < size) {
        int c = 2 * i + 1;
        if (c + 1 < size && a[c + 1] > a[c]) c++;   //@child
        if (a[i] >= a[c]) break;                    //@child
        int t = a[i]; a[i] = a[c]; a[c] = t;        //@swapdown
        i = c;                                      //@swapdown
    }
}
void heapSort(int[] a) {
    int n = a.length;
    for (int i = n / 2 - 1; i >= 0; i--)            //@build
        siftDown(a, i, n);                          //@build
    for (int end = n - 1; end > 0; end--) {
        int t = a[0]; a[0] = a[end]; a[end] = t;    //@extract
        siftDown(a, 0, end);                        //@extract
    }
}                                                   //@done`,
      javascript: `function siftDown(a, i, size) {
  while (2 * i + 1 < size) {
    let c = 2 * i + 1;
    if (c + 1 < size && a[c + 1] > a[c]) c++;       //@child
    if (a[i] >= a[c]) break;                        //@child
    [a[i], a[c]] = [a[c], a[i]];                    //@swapdown
    i = c;                                          //@swapdown
  }
}
function heapSort(a) {
  const n = a.length;
  for (let i = (n >> 1) - 1; i >= 0; i--)           //@build
    siftDown(a, i, n);                              //@build
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];                //@extract
    siftDown(a, 0, end);                            //@extract
  }
  return a;                                         //@done
}`,
    },
  },
}

// ===== 計數排序 =====

function* countingRun(v: Record<string, string>): Generator<Frame> {
  const a = parseSortInput(v)
  const lo = Math.min(...a)
  const hi = Math.max(...a)
  if (hi - lo > 14) throw new Error('示範用,最大值 − 最小值 請 <= 14')
  const cnt = new Array(hi - lo + 1).fill(0)
  const out: number[] = []
  const f = (line: string, note: string, aHl: number[] = [], cHl: number[] = [], vars: Frame['vars'] = {}): Frame => ({
    line,
    note,
    vars,
    views: [
      arr(a, { label: '輸入', highlight: aHl }),
      {
        kind: 'grid',
        label: 'cnt:每個值出現幾次',
        colLabels: cnt.map((_, i) => `值 ${i + lo}`),
        cells: [cnt],
        marks: { hl: cHl.map((c) => [0, c] as [number, number]) },
      },
      arr(out, { label: '輸出' }),
    ],
  })
  yield f('range', `最小值 ${lo}、最大值 ${hi},準備 ${hi - lo + 1} 個計數格`)
  for (let i = 0; i < a.length; i++) {
    cnt[a[i] - lo]++
    yield f('count', `看到 ${a[i]},cnt[${a[i]}] 加 1`, [i], [a[i] - lo])
  }
  for (let x = lo; x <= hi; x++) {
    if (cnt[x - lo] === 0) continue
    for (let k = 0; k < cnt[x - lo]; k++) out.push(x)
    yield f('emit', `值 ${x} 出現 ${cnt[x - lo]} 次,依序寫進輸出`, [], [x - lo])
  }
  yield f('done', '排序完成:完全沒有「比較」兩個數的大小', [], [], { answer: out.join(',') })
}

export const countingSort: Pattern = {
  id: 'counting-sort',
  summary: '不比較大小,而是「數每個值出現幾次」,再從小到大照次數寫出來。值的範圍小的時候,比任何比較排序都快。',
  analogy: '老師收考卷時準備 0~100 分的 101 個籃子,每張考卷丟進對應分數的籃子,最後從 0 分的籃子開始依序拿出來。',
  steps: ['找出最小值 lo 和最大值 hi', '開一個長度 hi−lo+1 的計數陣列 cnt', '掃一遍輸入,cnt[x − lo] += 1', '從小到大走過 cnt,值 x 寫 cnt[x] 次'],
  watch: ['中間那排格子就是「籃子」,看數字一個個被丟進去', '輸出時是按照籃子順序,不是按照原本順序'],
  whenToUse: ['值域很小(例如 0~100、26 個字母)', '「依頻率分組」的題目(Top K Frequent、Sort Characters By Frequency)就是把頻率當桶', 'H-Index 這類「數到 >= h」的題目'],
  pitfalls: ['值域很大(例如 10⁹)時陣列開不下 → 改用 Hash 或比較排序', '有負數要先減掉最小值當位移'],
  complexity: { time: 'O(n + k)', space: 'O(k)', why: 'k 是值域大小:掃輸入 n 次,掃計數陣列 k 次。' },
  demo: {
    title: '把一串數字由小到大排好',
    inputs: [{ key: 'nums', label: '要排序的數字', default: '4,2,7,2,5,4,2' }],
    run: countingRun,
    reference: sortReference,
    random: () => ({ nums: randInts(randInt(1, 9), 0, 12).join(',') }),
    code: {
      python: `def counting_sort(a):
    lo, hi = min(a), max(a)                     #@range
    cnt = [0] * (hi - lo + 1)                   #@range
    for x in a:
        cnt[x - lo] += 1                        #@count
    out = []
    for x in range(lo, hi + 1):
        out += [x] * cnt[x - lo]                #@emit
    return out                                  #@done`,
      c: `// 結果寫回 a
void counting_sort(int a[], int n) {
    int lo = a[0], hi = a[0];                   //@range
    for (int i = 1; i < n; i++) {               //@range
        if (a[i] < lo) lo = a[i];               //@range
        if (a[i] > hi) hi = a[i];               //@range
    }
    int *cnt = calloc(hi - lo + 1, sizeof(int));    //@range
    for (int i = 0; i < n; i++)
        cnt[a[i] - lo]++;                       //@count
    int k = 0;
    for (int x = lo; x <= hi; x++)
        for (int c = cnt[x - lo]; c > 0; c--)   //@emit
            a[k++] = x;                         //@emit
    free(cnt);
}                                               //@done`,
      cpp: `vector<int> countingSort(const vector<int>& a) {
    auto [lo, hi] = minmax_element(a.begin(), a.end());  //@range
    int L = *lo;
    vector<int> cnt(*hi - L + 1, 0);            //@range
    for (int x : a) cnt[x - L]++;               //@count
    vector<int> out;
    for (int i = 0; i < (int)cnt.size(); i++)
        out.insert(out.end(), cnt[i], i + L);   //@emit
    return out;                                 //@done
}`,
      java: `int[] countingSort(int[] a) {
    int lo = Arrays.stream(a).min().getAsInt();     //@range
    int hi = Arrays.stream(a).max().getAsInt();     //@range
    int[] cnt = new int[hi - lo + 1];               //@range
    for (int x : a) cnt[x - lo]++;                  //@count
    int[] out = new int[a.length];
    int k = 0;
    for (int x = lo; x <= hi; x++)
        for (int c = cnt[x - lo]; c > 0; c--)       //@emit
            out[k++] = x;                           //@emit
    return out;                                     //@done
}`,
      javascript: `function countingSort(a) {
  const lo = Math.min(...a), hi = Math.max(...a);   //@range
  const cnt = new Array(hi - lo + 1).fill(0);       //@range
  for (const x of a) cnt[x - lo]++;                 //@count
  const out = [];
  for (let x = lo; x <= hi; x++)
    for (let c = cnt[x - lo]; c > 0; c--)           //@emit
      out.push(x);                                  //@emit
  return out;                                       //@done
}`,
    },
  },
}

export const SORTING = [bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort, countingSort]

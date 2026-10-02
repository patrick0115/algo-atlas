import type { Frame, Lang, Pattern } from '../types'
import type { ArrayViewData } from '../types'
import { arr, parseInt_, parseInts, randInt, randInts, range } from '../engine/helpers'

const code: Record<Lang, string> = {
  python: `def minSubArrayLen(target: int, nums: list[int]) -> int:
    l, s, best = 0, 0, float('inf')          #@init
    for r in range(len(nums)):               #@loop
        s += nums[r]                         #@expand
        while s >= target:                   #@check
            best = min(best, r - l + 1)      #@record
            s -= nums[l]                     #@shrink
            l += 1                           #@shrink
    return 0 if best == float('inf') else best  #@done`,

  c: `int minSubArrayLen(int target, int* nums, int numsSize) {
    int l = 0, sum = 0, best = INT_MAX;          //@init
    for (int r = 0; r < numsSize; r++) {         //@loop
        sum += nums[r];                          //@expand
        while (sum >= target) {                  //@check
            if (r - l + 1 < best) best = r - l + 1;  //@record
            sum -= nums[l++];                    //@shrink
        }
    }
    return best == INT_MAX ? 0 : best;           //@done
}`,

  cpp: `int minSubArrayLen(int target, vector<int>& nums) {
    int l = 0, sum = 0, best = INT_MAX;          //@init
    for (int r = 0; r < (int)nums.size(); r++) { //@loop
        sum += nums[r];                          //@expand
        while (sum >= target) {                  //@check
            best = min(best, r - l + 1);         //@record
            sum -= nums[l++];                    //@shrink
        }
    }
    return best == INT_MAX ? 0 : best;           //@done
}`,

  java: `public int minSubArrayLen(int target, int[] nums) {
    int l = 0, sum = 0, best = Integer.MAX_VALUE;    //@init
    for (int r = 0; r < nums.length; r++) {          //@loop
        sum += nums[r];                              //@expand
        while (sum >= target) {                      //@check
            best = Math.min(best, r - l + 1);        //@record
            sum -= nums[l++];                        //@shrink
        }
    }
    return best == Integer.MAX_VALUE ? 0 : best;     //@done
}`,

  javascript: `function minSubArrayLen(target, nums) {
  let l = 0, sum = 0, best = Infinity;         //@init
  for (let r = 0; r < nums.length; r++) {      //@loop
    sum += nums[r];                            //@expand
    while (sum >= target) {                    //@check
      best = Math.min(best, r - l + 1);        //@record
      sum -= nums[l++];                        //@shrink
    }
  }
  return best === Infinity ? 0 : best;         //@done
}`,
}


// 示範題:209. Minimum Size Subarray Sum(可變視窗求最短)

function* run(values: Record<string, string>): Generator<Frame> {
  const nums = parseInts(values.nums, 'nums', { min: 1, max: 99, maxLen: 14 })
  const target = parseInt_(values.target, 'target', 1, 999)

  let l = 0
  let sum = 0
  let best = Infinity

  const snap = (line: string, note: string, opt: Omit<ArrayViewData, 'kind' | 'values'> = {}, answer?: number): Frame => ({
    line,
    note,
    vars: { l, sum, target, best: best === Infinity ? '∞' : best, ...(answer !== undefined ? { answer } : {}) },
    views: [arr(nums, { label: 'nums', dim: range(0, l - 1), ...opt })],
  })

  yield snap('init', `目標:找「總和 >= ${target}」的最短連續區段。一開始視窗是空的,best = ∞`)

  for (let r = 0; r < nums.length; r++) {
    const ptrs = () => [
      { name: 'l', index: l, color: 'a' as const },
      { name: 'r', index: r, color: 'b' as const },
    ]
    yield snap('loop', `右邊界 r 移到第 ${r} 格`, { pointers: ptrs(), range: [l, r - 1] })

    sum += nums[r]
    yield snap('expand', `把 ${nums[r]} 放進視窗,視窗總和 sum = ${sum}`, { pointers: ptrs(), range: [l, r], highlight: [r] })

    while (true) {
      const ok = sum >= target
      yield snap('check', `sum = ${sum} ${ok ? '>=' : '<'} ${target}${ok ? ':夠了!記錄長度,然後試著從左邊縮小' : ':還不夠,右邊繼續擴張'}`, { pointers: ptrs(), range: [l, r] })
      if (!ok) break

      const len = r - l + 1
      const improved = len < best
      best = Math.min(best, len)
      yield snap('record', improved ? `視窗長度 ${len} 是目前最短,best = ${best}` : `視窗長度 ${len} 沒有比 best = ${best} 短`, { pointers: ptrs(), range: [l, r], highlight: improved ? range(l, r) : [] })

      sum -= nums[l]
      const removed = l
      l++
      yield snap('shrink', `左邊界右移:把 ${nums[removed]} 移出視窗,sum = ${sum}`, { pointers: ptrs(), range: [l, r], highlight: [removed] })
    }
  }

  const answer = best === Infinity ? 0 : best
  yield snap('done', `掃完了,最短長度 = ${answer}${answer === 0 ? '(找不到)' : ''}`, {}, answer)
}

function reference(v: Record<string, string>) {
  const nums = parseInts(v.nums, 'nums', { min: 1, max: 99, maxLen: 14 })
  const target = Number(v.target)
  let best = Infinity
  for (let i = 0; i < nums.length; i++) {
    let s = 0
    for (let j = i; j < nums.length; j++) {
      s += nums[j]
      if (s >= target) {
        best = Math.min(best, j - i + 1)
        break
      }
    }
  }
  return best === Infinity ? 0 : best
}

export const slidingWindow: Pattern = {
  id: 'sliding-window',
  summary: '用左右兩個指標 l、r 框出一段「連續的區間」(視窗)。r 往右把新元素放進來,條件滿足或被破壞時,l 往右把舊元素移出去。兩個指標都只往右走,所以只要 O(n)。',
  analogy: '像拿一個可以伸縮的放大鏡在一排數字上滑:右手把放大鏡往右拉長,看到的數夠了,左手就把放大鏡左邊收進來,看看能不能更短。',
  steps: [
    'l = 0,視窗一開始是空的',
    'r 從左到右:每一步把 nums[r] 加進視窗(更新 sum 這類「視窗狀態」)',
    '用 while 檢查條件:符合就記錄答案,然後把 nums[l] 移出、l 往右',
    '重複直到 r 走完',
  ],
  watch: ['淡色底框就是「視窗」,看它怎麼一下變長、一下變短', 'l、r 兩個箭頭都只往右走,從不回頭', '變淡的格子已經被丟出視窗,之後不會再用到'],
  whenToUse: [
    '題目問「連續子陣列 / 子字串」的最長、最短、個數',
    '加一個元素、移掉一個元素時,視窗狀態可以 O(1) 更新(總和、字元計數)',
    '條件有單調性:視窗變大只會更「超過」,變小只會更「不足」(例如全是正數的總和)',
  ],
  pitfalls: [
    '有負數時總和不再單調,滑動視窗會失效 → 改用前綴和 + Hash',
    '求最長:在 while 縮完之後更新答案;求最短:在 while 裡面更新答案',
    '視窗長度是 r − l + 1',
    '固定長度 k 的視窗更簡單:加 nums[r]、減 nums[r−k]',
  ],
  complexity: { time: 'O(n)', space: 'O(1)', why: '每個元素最多被 r 放進來一次、被 l 移出去一次,總共 2n 步。' },
  demo: {
    title: '找總和 >= target 的最短連續區段(LeetCode 209)',
    inputs: [
      { key: 'nums', label: 'nums(正整數)', default: '2,3,1,2,4,3' },
      { key: 'target', label: 'target', default: '7' },
    ],
    run,
    reference,
    random: () => ({ nums: randInts(randInt(1, 10), 1, 9).join(','), target: String(randInt(1, 30)) }),
    code,
  },
}

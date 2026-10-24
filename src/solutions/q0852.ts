import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 852. Peak Index in a Mountain Array
const A = [0, 2, 5, 7, 6, 3, 1]

export const q0852: Solution = {
  id: 852,
  plain: '一列數先爬坡再下坡，找最高點的位置。',
  statement: 'arr 是山形陣列：先嚴格遞增，到唯一峰頂後嚴格遞減。回傳峰頂索引。',
  examples: [{ input: 'arr = [0,1,0]', output: '1' }, { input: 'arr = [0,2,5,7,6,3,1]', output: '3' }],
  constraints: ['3 ≤ arr.length ≤ 10⁵；保證只有一個峰頂。'],
  insight: ['比較 arr[mid] 與 arr[mid+1]，就知道中點位於上坡還是下坡。', '上坡時峰頂一定在右邊；下坡時峰頂可能就是 mid。這是 [[p:binary-search]]。'],
  approaches: [
    {
      name: '二分坡向',
      idea: '用相鄰元素判斷坡向，逐步縮小峰頂所在範圍。',
      steps: ['令 left=0、right=n−1。', '若 arr[mid] < arr[mid+1]，丟掉左半；否則保留 mid 與左半。', '兩端相遇的位置就是峰頂。'],
      figure: { title: 'arr = [0,2,5,7,6,3,1]', steps: [
        { note: '初始範圍是整座山，峰頂必在其中。', views: [arr(A, { label: '搜尋範圍' })] },
        { note: 'mid=3，7 大於右鄰 6，已到下坡，峰頂在索引 0..3。', views: [arr(A, { label: '比較 7 與 6', highlight: [3, 4], dim: [4, 5, 6] })] },
        { note: 'mid=1，2 小於右鄰 5，還在上坡，峰頂在索引 2..3。', views: [arr(A, { label: '比較 2 與 5', highlight: [1, 2], dim: [0, 1, 4, 5, 6] })] },
        { note: 'mid=2，5 小於 7，左界移到 3；兩端相遇，回傳索引 3。', views: [arr(A, { label: '峰頂', done: [3], dim: [0, 1, 2, 4, 5, 6] })] },
      ] },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每次排除一半位置。' },
      verdict: '推薦，也適合巨大陣列。',
      code: {
        python: `def peakIndexInMountainArray(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        mid = (left + right) // 2
        if arr[mid] < arr[mid + 1]:
            left = mid + 1                 # 上坡，峰頂更靠右
        else:
            right = mid                   # 下坡，mid 仍可能是峰頂
    return left`,
        c: `int peakIndexInMountainArray(int *arr, int arrSize) {
    int left = 0;
    int right = arrSize - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] < arr[mid + 1]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}`,
        cpp: `int peakIndexInMountainArray(vector<int>& arr) {
    int left = 0;
    int right = arr.size() - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] < arr[mid + 1]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}`,
        java: `int peakIndexInMountainArray(int[] arr) {
    int left = 0;
    int right = arr.length - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] < arr[mid + 1]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}`,
        javascript: `function peakIndexInMountainArray(arr) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] < arr[mid + 1]) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}`,
      },
    },
    {
      name: '線性找轉折',
      idea: '從左往右走到第一個不再上升的位置。',
      steps: ['從索引 0 出發。', '只要下一個數更大就往右。', '停下的位置就是峰頂。'],
      figure: { title: 'arr = [0,2,5,7,6,3,1]', steps: [
        { note: '0 到 2 是上坡，繼續往右。', views: [arr(A, { label: '上坡', highlight: [0, 1] })] },
        { note: '2 到 5 仍上升，繼續。', views: [arr(A, { label: '上坡', highlight: [1, 2] })] },
        { note: '5 到 7 仍上升，走到索引 3。', views: [arr(A, { label: '上坡', highlight: [2, 3] })] },
        { note: '7 後面是 6，開始下降，索引 3 就是峰頂。', views: [arr(A, { label: '峰頂', done: [3] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最壞情況走到接近末端。' },
      verdict: '寫法最直觀，適合先建立山形的直覺。',
      code: {
        python: `def peakIndexInMountainArray(arr):
    index = 0
    while arr[index] < arr[index + 1]:
        index += 1                      # 持續爬坡
    return index`,
        c: `int peakIndexInMountainArray(int *arr, int arrSize) {
    int index = 0;
    while (index + 1 < arrSize && arr[index] < arr[index + 1]) {
        index++;
    }
    return index;
}`,
        cpp: `int peakIndexInMountainArray(vector<int>& arr) {
    int index = 0;
    while (index + 1 < (int)arr.size() && arr[index] < arr[index + 1]) {
        index++;
    }
    return index;
}`,
        java: `int peakIndexInMountainArray(int[] arr) {
    int index = 0;
    while (index + 1 < arr.length && arr[index] < arr[index + 1]) {
        index++;
    }
    return index;
}`,
        javascript: `function peakIndexInMountainArray(arr) {
  let index = 0;
  while (index + 1 < arr.length && arr[index] < arr[index + 1]) {
    index++;
  }
  return index;
}`,
      },
    },
  ],
  pitfalls: ['二分時 mid+1 必須有效；因 left<right，所以 mid<right。', '下坡時不能把 mid 丟掉，因為 mid 自己可能是峰頂。'],
  check: { kind: 'fn', fn: 'peakIndexInMountainArray', cases: [
    { args: [[0, 1, 0]], out: 1 }, { args: [A], out: 3 }, { args: [[0, 10, 5, 2]], out: 1 },
  ] },
}

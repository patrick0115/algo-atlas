import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2667. Create Hello World Function
export const q2667: Solution = {
  id: 2667,
  languages: ['javascript'],
  plain: "做一台固定答話機：不管拿什麼參數問它，永遠回答 Hello World。",
  statement: "createHelloWorld 應回傳一個函式；對回傳函式傳入任意參數，都只回傳字串 \"Hello World\"。",
  examples: [{"input":"createHelloWorld()()","output":"\"Hello World\""},{"input":"createHelloWorld()({},null,42)","output":"\"Hello World\""}],
  constraints: ["傳入回傳函式的參數數量為 0 到 10。","題目要求回傳函式，而非直接回傳字串。"],
  insight: ["外層負責建立函式，內層才回傳固定字串。","參數不影響結果，因此內層不必宣告參數。"],
  approaches: [
    {
      name: "回傳一般函式",
      idea: "外層 return 一個具名或匿名函式。",
      steps: ["定義 createHelloWorld","回傳內層函式","內層固定回傳字串"],
      figure: { title: "兩層呼叫", steps: [
        { note: "第一層取得函式。", views: [arr(["建立","呼叫"], { label: "流程", highlight: [0] })] },
        { note: "第二層呼叫才得到字串。", views: [arr(["建立","呼叫"], { label: "流程", done: [1] })] },
      ] },
      complexity: { time: "每次 O(1)", space: "O(1)", why: "只建立一個短函式並回傳固定字串。" },
      verdict: "明確展示函式可以作為回傳值。",
      code: { javascript: "var createHelloWorld = function() {\n  return function() {\n    return \"Hello World\";\n  };\n};" },
    },
    {
      name: "箭頭函式",
      idea: "用箭頭函式的簡寫直接表達固定回傳值。",
      steps: ["定義外層函式","回傳零參數箭頭函式","箭頭函式回傳固定字串"],
      figure: { title: "忽略所有輸入", steps: [
        { note: "即使輸入空參數也得到相同答案。", views: [arr(["空參數","其他參數"], { label: "輸入", highlight: [0] })] },
        { note: "帶多個參數仍回傳同一句。", views: [arr(["空參數","其他參數"], { label: "輸入", done: [1] })] },
      ] },
      complexity: { time: "每次 O(1)", space: "O(1)", why: "固定回傳字串，沒有隨參數增長的工作。" },
      verdict: "最短的寫法。",
      code: { javascript: "var createHelloWorld = function() {\n  return () => \"Hello World\";\n};" },
    },
  ],
  pitfalls: ["外層必須回傳函式，不能直接回傳字串。","大小寫與空格要完全是 Hello World。","傳入的參數全部忽略。"],
  check: { kind: 'script', cases: [
    { run: "return createHelloWorld()()", out: "Hello World" },
    { run: "return createHelloWorld()({},null,42)", out: "Hello World" },
  ] },
}


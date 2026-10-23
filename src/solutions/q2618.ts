import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2618. Check if Object Instance of Class
export const q2618: Solution = {
  id: 2618,
  languages: ['javascript'],
  plain: '沿著物件的「繼承家譜」往上找，看有沒有指定類別的原型。數字 5 也要當作 Number 物件來查。',
  statement: '給一個值 obj 和建構函式 classFunction，判斷 obj 能否使用該類別或父類別的方法。原始值也算；null、undefined 與無效的類別回傳 false。',
  examples: [{ input: 'new Date(), Date', output: 'true' }, { input: '5, Number', output: 'true', note: '數字原始值會暫時包成 Number 物件。' }, { input: 'Date, Date', output: 'false' }],
  constraints: ['obj 和 classFunction 可能是任何型別，先處理 null、undefined 與非函式。', '要檢查整條原型鏈，子類別的物件也屬於父類別。'],
  insight: ['方法通常放在建構函式的 prototype 上；物件透過原型鏈取得它們。', '`instanceof` 對原始數字 5 回傳 false，因此先用 Object(obj) 包裝。', '只看第一層原型會漏掉父類別。'],
  approaches: [
    {
      name: '逐層走原型鏈',
      idea: '從包裝後的 obj 開始，逐層往上比對 classFunction.prototype。',
      steps: ['先排除 null、undefined 與非函式', '用 Object(obj) 包裝原始值', '反覆呼叫 Object.getPrototypeOf 往上走', '遇到目標原型回傳 true；走到 null 回傳 false'],
      figure: { title: '5 → Number.prototype → Object.prototype', steps: [
        { note: '原始值 5 先包裝；N 代表 Number.prototype，O 代表 Object.prototype。', views: [arr(['5', 'N', 'O'], { label: '原型鏈', highlight: [0] })] },
        { note: '往上走一步便找到 Number.prototype，答案是 true。', views: [arr(['5', 'N', 'O'], { label: '原型鏈', done: [1] })] },
      ] },
      complexity: { time: 'O(h)', space: 'O(1)', why: 'h 是原型鏈高度，每層只檢查一次。' },
      verdict: '最容易看清楚為什麼子類別與原始值都能處理。',
      code: { javascript: `function checkIfInstanceOf(obj, classFunction) {
  if (obj == null || typeof classFunction !== 'function') return false;
  const target = classFunction.prototype;
  if (target === null || (typeof target !== 'object' && typeof target !== 'function')) return false;
  let cur = Object.getPrototypeOf(Object(obj));
  while (cur !== null) {
    if (cur === target) return true;
    cur = Object.getPrototypeOf(cur);
  }
  return false;
}` },
    },
    {
      name: '用 isPrototypeOf 查詢',
      idea: '內建方法會檢查某個原型是否出現在物件的原型鏈中。',
      steps: ['處理空值和無效類別', '取得 classFunction.prototype 並確認它是物件', '包裝 obj 後呼叫目標原型的 isPrototypeOf'],
      figure: { title: '父類別也在原型鏈上', steps: [
        { note: 'Dog 的物件會先連到 Dog.prototype（D）。', views: [arr(['dog', 'D', 'A'], { label: '原型鏈', highlight: [1] })] },
        { note: 'Animal.prototype（A）也在鏈上，所以 Animal 的檢查成立。', views: [arr(['dog', 'D', 'A'], { label: '原型鏈', done: [2] })] },
      ] },
      complexity: { time: 'O(h)', space: 'O(1)', why: '內建方法仍須沿原型鏈搜尋。' },
      verdict: '程式較短；理解原型鏈後適合使用。',
      code: { javascript: `function checkIfInstanceOf(obj, classFunction) {
  if (obj == null || typeof classFunction !== 'function') return false;
  const target = classFunction.prototype;
  if (target === null || (typeof target !== 'object' && typeof target !== 'function')) return false;
  return Object.prototype.isPrototypeOf.call(target, Object(obj));
}` },
    },
  ],
  pitfalls: ['`instanceof` 對 5 這種原始值回傳 false。', '不要只比較 obj 的第一層原型，父類別可能在更上層。', 'Object(null) 會建立空物件，必須先排除 null 與 undefined。'],
  check: { kind: 'script', cases: [
    { run: 'return checkIfInstanceOf(new Date(), Date)', out: true },
    { run: 'class Animal {}; class Dog extends Animal {}; return checkIfInstanceOf(new Dog(), Animal)', out: true },
    { run: 'return checkIfInstanceOf(5, Number)', out: true },
    { run: 'return checkIfInstanceOf(Date, Date)', out: false },
    { run: 'return checkIfInstanceOf(null, Object)', out: false },
    { run: 'return checkIfInstanceOf({}, undefined)', out: false },
  ] },
}

# LeetCode 演算法圖鑑

把 LeetCode 用到的演算法整理成可視化講義:每個演算法一頁,有白話說明、生活比喻、步驟拆解、可自訂輸入的逐步動畫(Python / C / C++ / Java / JavaScript 程式碼同步高亮),最後列出所有用到它的題目,並附複習排程與模式辨識測驗。

## 使用

```bash
npm install
npm run dev        # 開發模式,http://localhost:5173
npm test           # 型別檢查 + 全部測試
npm run build      # 產生靜態網站到 dist/
```

複習進度存在瀏覽器的 localStorage,只在本機。

## 結構

| 路徑 | 內容 |
|---|---|
| `src/patterns/*.ts` | 每個演算法的講義與動畫(generator 吐出 Frame 快照) |
| `src/renderers/` | 通用渲染器:陣列 / 長條、網格表格、節點圖(樹、圖、串列)、Hash 表 |
| `src/engine/` | 播放器、快照收集、輸入解析、樹的排版、複習排程 |
| `src/data/categories.ts` | 演算法地圖 + 官方標籤 → 演算法的自動歸類規則 |
| `src/data/curated.ts` | 人工精標:題號 → 演算法 + 一句話解題關鍵 |
| `src/data/catalog.json` | LeetCode 全題目中繼資料(由腳本抓取,不含題目內文) |

## 新增一個演算法

1. 在 `src/data/categories.ts` 的地圖加上 `{ id, name }`
2. 在 `src/patterns/` 寫一個 `Pattern`:講義文字 + `demo.run`(generator)+ 五種語言的程式碼
   - 程式碼行尾加 `#@tag` 或 `//@tag`,Frame 的 `line` 用同一個 tag 就會高亮那一行
   - 最後一個 Frame 的 `vars.answer` 放答案;提供 `reference`(獨立的暴力解)與 `random`(隨機輸入)
3. 加進 `src/patterns/index.ts` 的 `ALL`
4. `npm test` 會自動檢查:五種語言的 tag 齊全、答案在 100 組隨機輸入下和參考解一致、快照沒有被後續步驟改掉

## 更新題庫

```bash
node scripts/fetch-catalog.mjs   # 從 LeetCode 官方 API 與 NeetCode 清單重新抓取
npm test                         # 精標題的標題會和官方資料比對
```

精標題優先於自動歸類;沒精標的題目依官方標籤歸到對應的演算法頁。

## 檢查畫面

`npm run build && npx vite preview --port 4173` 之後:

```bash
node scripts/sweep.mjs                              # 每個演算法頁跑完所有步驟,回報主控台錯誤
node scripts/shot.mjs p/bubble-sort out.png 5 player  # 截圖第 5 步的播放器
```

## 資料來源

- 題目中繼資料:LeetCode 公開 GraphQL API(只存題號、標題、難度、標籤與連結)
- 高頻清單:[neetcode-gh/leetcode](https://github.com/neetcode-gh/leetcode) 的 `.problemSiteData.json`(NeetCode 150 / Blind 75 / NeetCode 450)

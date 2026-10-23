# LeetCode 演算法圖鑑

把 LeetCode 用到的演算法整理成可視化講義。每個演算法一頁,由淺到深分五層:

1. **白話**:一句話說明 + 生活比喻
2. **動畫**:可自訂 / 隨機輸入的逐步動畫,Python / C / C++ / Java / JavaScript 程式碼同步高亮;有自動圖例、變數變化標示、旁白紀錄,以及「猜下一步」自我測驗模式
3. **判斷**:什麼時候想到它、常見錯誤、複雜度
4. **專業**:不變量(為什麼正確)、通用模板、常見變形、和相近演算法比較、面試怎麼講
5. **題目**:所有用到它的題目,附複習排程與模式辨識測驗

每頁標有難度(入門 / 中階 / 進階)與先修演算法。

演算法章之前有「基礎篇」(`#/c/<id>`):20 章觀念,分六個單元 —— 開始刷題、複雜度(Big O、從資料範圍反推解法)、
程式語言基礎(記憶體與參考、指標、陣列字串、整數溢位、遞迴、類別與比較函式)、資料結構總覽、
各語言工具箱(C、C++ STL、五語言對照)、解題思維。每章有五語言程式碼、記憶體逐步圖或互動元件、常見錯誤與自我測驗;演算法頁會反過來列出它需要的基礎觀念。

另有「刷題藍圖」頁(`#/plan`):把 NeetCode 150 排成每週 N 題的路線,每天一鍵挑題、連到 LeetCode 寫,寫完標記就進複習排程。

「題解」頁(`#/q/<題號>`):每題用自己的話重述題意、從限制條件反推複雜度、講怎麼想到解法,再給多種解法 —— 每種都有逐步圖示、
時間 / 空間複雜度與原因、五種語言程式碼、評價,最後是方法比較表、常見錯誤與延伸問題。依刷題藍圖的順序逐週補上。

「刷題節奏」頁(`#/rhythm`,首頁頂端有摘要):每次標記「會 / 模糊 / 不會」都記一筆作答紀錄,整理成每日熱力圖、每週題數對目標、
連續天數、各分類完成度、狀態分布、複習準時率與最近紀錄。紀錄存在瀏覽器 localStorage,換裝置會分開記。

整個網站是一部七卷的百科,側欄依卷收合:卷一程式基礎、卷二演算法、卷三題解,以及原 SemiDrill 講義搬進來的
卷四半導體(A–G)、卷五系統與嵌入式(I K L M)、卷六軟體工程與 AI(J N O),外加附錄(容易混淆、英文術語)。
講義每本一個書頁(`#/k/L`:主圖、比較表、詞條目錄、容易混淆、英文術語、出處),每個考點一個詞條頁(`#/k/L01`:
L1 是什麼 / L2 為什麼 / L3 出問題怎麼辦);卷頁是 `#/v/<卷>`。和圖鑑重複的段落(P01–P14、H05、H06、Q03、
P 的「看到什麼想到什麼」)併進對應的演算法頁或基礎觀念頁,舊網址會自動轉過去;`public/semi/` 只剩轉址頁。

## 使用

```bash
npm install
npm run dev        # 開發模式,http://localhost:5173
npm test           # 型別檢查 + 全部測試
npm run build      # 產生靜態網站到 dist/
npm run build:offline  # 產生單一檔案 LeetCode演算法圖鑑.html,雙擊即可離線開啟
```

離線檔把所有程式與題庫內嵌在一個 HTML 裡,不需要網路或伺服器(題目連結點下去才會連到 LeetCode)。
複習進度存在瀏覽器的 localStorage,只在本機;同一個檔案換位置或換瀏覽器開,進度會分開。

## 結構

| 路徑 | 內容 |
|---|---|
| `src/concepts/*.ts` | 基礎篇的觀念章:`index.ts` 定義單元順序,每個單元一個檔案;內容由 Block(段落、表格、多語言程式碼、記憶體逐步圖、互動元件)組成 |
| `src/patterns/*.ts` | 每個演算法的講義與動畫(generator 吐出 Frame 快照) |
| `src/renderers/` | 通用渲染器:陣列 / 長條、網格表格、節點圖(樹、圖、串列)、Hash 表 |
| `src/engine/` | 播放器、快照收集、輸入解析、樹的排版、複習排程 |
| `src/engine/plan.ts` | 刷題藍圖:NeetCode 150 的路線排序(階段 → 先修 → 難度 / 通過率,Hard 最後)與每週排程 |
| `src/data/pro.ts` | 講義的專業層:難度、先修、不變量、模板、變形、比較、面試重點 |
| `src/data/categories.ts` | 演算法地圖 + 官方標籤 → 演算法的自動歸類規則 |
| `src/data/curated.ts` | 人工精標:題號 → 演算法 + 一句話解題關鍵 |
| `src/data/catalog.json` | LeetCode 全題目中繼資料(由腳本抓取,不含題目內文) |
| `src/kb/books/<書>.ts` | 百科講義的資料:每本書的主圖、詞條、書末段落,內容是 HTML 片段 |
| `src/kb/widgets/<書>.ts` | 講義互動圖的程式(原講義照搬);`scope.ts` 把 document 與計時器限定在目前頁面 |
| `src/kb/volumes.ts` / `merge.ts` | 七卷的分法與每本書的說明;併進圖鑑頁的講義段落對照表 |
| `src/kb/kb.css` | 講義的樣式(圖示、剖面材料、控制元件),限定在 `.kb` 底下 |
| `src/engine/rhythm.ts` | 刷題節奏的統計:從作答紀錄算熱力圖、連續天數、每週題數、準時率 |

## 新增一個演算法

1. 在 `src/data/categories.ts` 的地圖加上 `{ id, name }`
2. 在 `src/patterns/` 寫一個 `Pattern`:講義文字 + `demo.run`(generator)+ 五種語言的程式碼
   - 程式碼行尾加 `#@tag` 或 `//@tag`,Frame 的 `line` 用同一個 tag 就會高亮那一行
   - 最後一個 Frame 的 `vars.answer` 放答案;提供 `reference`(獨立的暴力解)與 `random`(隨機輸入)
3. 加進 `src/patterns/index.ts` 的 `ALL`
4. 在 `src/data/pro.ts` 加一筆專業層講義
5. `npm test` 會自動檢查:五種語言的 tag 齊全、答案在 100 組隨機輸入下和參考解一致、快照沒有被後續步驟改掉、專業層欄位齊全且先修關係沒有循環

## 新增一題題解

1. 寫 `src/solutions/q<四位題號>.ts`,匯出一個 `Solution`(型別見 `src/solutions/types.ts`),加進 `src/solutions/index.ts` 的 `ALL`
2. 圖示的每一步是一組 View(陣列、網格、Hash 表、節點圖),用題目範例在檔案裡算出來,不要手抄
3. `check` 放測資:`npm test` 會拿每個解法的 JavaScript 版去跑,也會檢查至少兩種解法、五種語言齊全、連結存在

## 新增一個觀念章

1. 在 `src/concepts/` 對應單元的檔案寫一個 `Concept`,加進該檔匯出的陣列
2. 文字可用行內標記:`` `程式碼` ``、`**粗體**`、`[[c:觀念章 id]]`、`[[p:演算法 id]]`、`[文字](#/路徑)`
3. `next` 列出學完可以接著讀的演算法 —— 那些演算法頁會自動顯示「需要的基礎觀念」
4. `npm test` 會檢查:先修只指向前面的章、連結都存在、測驗答案合法、記憶體圖的行號與指標正確

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

## 手機版(GitHub Pages + PWA)

push 到 `main` 後,`.github/workflows/deploy.yml` 會自動測試、建置並發佈到 GitHub Pages
(repo 的 Settings → Pages → Source 要選「GitHub Actions」)。

iPhone 用 Safari 打開網址 →「分享」→「加入主畫面」,就會變成全螢幕的 App,開過一次之後沒網路也能用(`public/sw.js`)。
主畫面圖示由 `node scripts/make-icons.mjs` 產生。

## 資料來源

- 題目中繼資料:LeetCode 公開 GraphQL API(只存題號、標題、難度、標籤與連結)
- 高頻清單:[neetcode-gh/leetcode](https://github.com/neetcode-gh/leetcode) 的 `.problemSiteData.json`(NeetCode 150 / Blind 75 / NeetCode 450)

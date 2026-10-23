// 原 SemiDrill 講義(git 歷史裡的 public/semi/ 原檔)搬進百科的資料;內容是原講義的 HTML 片段,改這裡就是改講義。
import type { Book } from '../types'

export const book: Book = {
  "id": "O",
  "file": "O-ai-dev.html",
  "title": "AI 輔助開發：模型負責寫，人負責定義「什麼叫做完」",
  "lead": "coding agent 是一個<b>反覆「讀 → 想 → 呼叫工具 → 改 → 驗證」的迴圈</b>。它只看得到 context 裡的東西、只做得到權限允許的事、只會在「看起來完成」時停下來。所以人能控制的三件事決定了品質：<b>給它什麼資訊（context）、允許它做什麼（權限）、用什麼證明它做對了（驗收條件、測試、review）</b>。",
  "note": "<p class=\"muted small\">對應 taxonomy O01～O06。難度標籤：<span class=\"lv\">L1</span>是什麼　<span class=\"lv l2\">L2</span>為什麼　<span class=\"lv l3\">L3</span>出問題怎麼辦。</p>",
  "front": [
    {
      "id": "loop",
      "title": "主圖：一步一步看 coding agent 的工作迴圈",
      "blocks": [
        {
          "t": "html",
          "html": "<p class=\"muted small\">點步驟或用「上一步／下一步」。右邊切換「好的做法」與「常見地雷」：同一個任務、同一個模型，差別只在人有沒有把關。下方長條是 context 使用量的示意（比例為說明用，不是實測值）。</p>"
        },
        {
          "t": "widget",
          "id": "O.loop",
          "html": "<div class=\"controls\">\n      <div class=\"seg\" id=\"mode\">\n        <button data-m=\"good\" class=\"on\">好的做法</button>\n        <button data-m=\"bad\">常見地雷</button>\n      </div>\n    </div>\n<ul class=\"steps\" id=\"steps\"></ul>\n<div class=\"stage\">\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" id=\"lp\" viewBox=\"0 0 900 326\" role=\"img\" aria-label=\"coding agent 工作迴圈\" style=\"min-width:640px\">\n          <defs>\n            <marker id=\"ah\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker>\n          </defs>\n          <g id=\"lpg\"></g>\n        </svg>\n      </div>\n      <div class=\"legend\">\n        <span><i style=\"background:var(--fg)\"></i>系統提示＋規則檔</span>\n        <span><i style=\"background:var(--muted)\"></i>對話</span>\n        <span><i style=\"background:var(--faint)\"></i>讀進來的檔案</span>\n        <span><i style=\"background:var(--line)\"></i>工具輸出（指令、測試 log）</span>\n      </div>\n      <div class=\"controls\" style=\"margin:16px 0 0\">\n        <button class=\"btn\" id=\"prev\">← 上一步</button>\n        <button class=\"btn primary\" id=\"next\">下一步 →</button>\n        <span class=\"muted small\" id=\"phase\"></span>\n      </div>\n      <div class=\"stage-info\">\n        <h3 id=\"stTitle\"></h3>\n        <p id=\"stWhat\"></p>\n        <dl id=\"stDl\"></dl>\n      </div>\n    </div>"
        }
      ]
    },
    {
      "id": "compare",
      "title": "六個考點一張表",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>考點</th><th>核心問題</th><th>人該做的事</th><th>最常見的地雷</th></tr>\n      <tr><td>O01 需求與拆分</td><td>AI 怎麼知道「做完了」？</td><td>寫驗收條件、範圍外清單；大任務先計畫再拆小步</td><td>一句話丟需求，AI 自己定義完成</td></tr>\n      <tr><td>O02 上下文</td><td>AI 看得到什麼？</td><td>精準給檔案、規則檔寫短、換任務就清 context</td><td>整個 repo 塞進去、規則檔寫成百科</td></tr>\n      <tr><td>O03 工具與 MCP</td><td>AI 能做什麼？</td><td>最小權限、deny 規則、只裝信任的 MCP server</td><td>全部放行、來路不明的工具描述藏惡意指示</td></tr>\n      <tr><td>O04 檢索與搜尋</td><td>AI 怎麼找到該看的程式？</td><td>識別字用關鍵字、概念用語意；兩者合併</td><td>只靠向量搜尋找變數名、索引過期</td></tr>\n      <tr><td>O05 Review 與回復</td><td>怎麼確定改對、改錯怎麼退？</td><td>小 diff、逐段看、測試把關、小步 commit</td><td>沒看就接受、AI 改測試讓它過、一整天沒 commit</td></tr>\n      <tr><td>O06 風險</td><td>改出來的東西安全、可維護嗎？</td><td>查依賴是否存在、不貼機密、看得懂才合併</td><td>幻覺套件、順手重構、密碼寫死、沒人看得懂的 code</td></tr>\n    </tbody></table></div>"
        }
      ]
    }
  ],
  "entries": [
    {
      "id": "O01",
      "anchor": "o01",
      "tag": "O01",
      "name": "需求描述與任務拆分",
      "sub": "規格、驗收條件",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>agent 會在「看起來做完」時停下來，所以需求裡最重要的不是「做什麼」，而是<b>「怎樣算做完」</b>——寫成可以跑、可以判斷對錯的驗收條件，再把大任務拆成每一步都能單獨驗證的小步。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 900 200\" role=\"img\" aria-label=\"模糊需求與好規格的對照\">\n        <text x=\"10\" y=\"20\" class=\"t-strong\">同一個需求的兩種寫法</text>\n        <rect class=\"bx\" x=\"10\" y=\"34\" width=\"420\" height=\"150\" rx=\"6\"></rect>\n        <text x=\"26\" y=\"60\" class=\"t-accent\">模糊</text>\n        <text x=\"26\" y=\"88\">「幫我把 PA 解析弄好一點。」</text>\n        <text x=\"26\" y=\"118\" class=\"t-small\">沒說哪個檔、哪種輸入、什麼叫「好」</text>\n        <text x=\"26\" y=\"140\" class=\"t-small\">AI 只能自己猜範圍與完成條件</text>\n        <text x=\"26\" y=\"162\" class=\"t-small\">→ 改很多檔、加了沒要的功能、無從驗證</text>\n        <rect class=\"bx-accent\" x=\"470\" y=\"34\" width=\"420\" height=\"150\" rx=\"6\"></rect>\n        <text x=\"486\" y=\"60\" class=\"t-accent\">可驗證</text>\n        <text x=\"486\" y=\"84\" class=\"t-small\">目標：腳位名含換行時也能正確配對</text>\n        <text x=\"486\" y=\"104\" class=\"t-small\">範圍：只改 PinNameParser.cs，不動 UI</text>\n        <text x=\"486\" y=\"124\" class=\"t-small\">驗收：新增 2 個測試案例通過；</text>\n        <text x=\"486\" y=\"144\" class=\"t-small\">　　　既有回歸樣本輸出完全不變</text>\n        <text x=\"486\" y=\"164\" class=\"t-small\">不做：不重構、不升級套件、不改格式</text>\n      </svg>\n      <figcaption>右邊每一行都能回答「AI 做完了沒」。檔名為示意。</figcaption>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>自然語言規格（spec）</td><td>用人話寫的需求說明。好的 spec 至少有：目標、背景（相關檔案與介面）、限制、驗收條件、<b>範圍外（out of scope）</b></td></tr>\n        <tr><td>驗收條件（acceptance criteria）</td><td>判斷「完成」的具體條件，必須能被檢查：輸入→預期輸出、測試名稱、build 通過、截圖比對、效能門檻</td></tr>\n        <tr><td>Given-When-Then</td><td>BDD（行為驅動開發）的情境寫法：Given 前提狀態、When 動作、Then 預期結果。一條就是一個可寫成測試的案例</td></tr>\n        <tr><td>EARS</td><td>Rolls-Royce 在 2009 年發表的需求句型：一般（The system shall…）、事件（When…）、狀態（While…）、異常（If…then…）、選配（Where…）。強迫把觸發條件寫出來</td></tr>\n        <tr><td>任務拆分</td><td>把大需求切成多個小步，每步產生一個能單獨 review、單獨測試、單獨 commit 的 diff</td></tr>\n        <tr><td>計畫模式（plan first）</td><td>先讓 agent 只讀不寫，產出「要改哪些檔、順序、風險」的計畫，人審過再動手</td></tr>\n        <tr><td>Definition of Done</td><td>團隊層級的完成定義（例：有測試、有文件、review 過），每個任務都要滿足</td></tr>\n        <tr><td>反問／訪談（interview）</td><td>需求還沒想清楚時，先讓 AI 反過來問你邊角情況與取捨，問完寫成 spec，再開新 session 實作</td></tr>\n      </tbody></table></div>",
          "anchor": "o01-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼驗收條件比實作步驟更重要？</b>agent 沒有可以跑的檢查時，「看起來完成」就是它唯一的停止訊號，人就變成每個錯誤的偵測器。給它測試、build、比對腳本這類會回傳通過／失敗的東西，它可以自己「改 → 跑 → 讀結果 → 再改」直到通過，迴圈自己閉合。</li>\n        <li><b>為什麼要寫「不做什麼」？</b>模型傾向「多做一點看起來比較完整」：順手重構、加防呆、改格式。範圍外清單直接排除這些，也讓 review 時一眼看出超出範圍的修改。</li>\n        <li><b>為什麼要拆小步？</b>每一步的 diff 小，人才看得完；某一步錯了只要退那一步；方向錯了在第一步就發現，而不是整個功能寫完才發現解錯問題。</li>\n        <li><b>什麼時候不用先計畫？</b>如果能用一句話描述 diff（改錯字、加一行 log、改變數名），直接做就好；計畫適合「不確定做法、會改多個檔、不熟那段 code」的情況，否則只是多一層成本。</li>\n        <li><b>為什麼 spec 寫完要開新 session 實作？</b>訪談過程的來回討論會佔 context，而且混著被否決的想法；新 session 只讀定稿的 spec，焦點乾淨。</li>\n        <li><b>好 spec 的實務格式？</b>點名相關檔案與介面、說明範圍外、最後一條是端到端驗證（例：跑完整回歸集，輸出與基準相同）。對工具開發來說，「既有樣本的輸出不能變」通常是最有用的一條。</li>\n      </ul>",
          "anchor": "o01-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>AI 說「完成了」，實際一跑就錯</td><td>沒有可執行的驗收條件，它只能用「看起來對」判斷</td><td>需求裡寫明要跑的測試或比對指令，並要求它貼出執行結果當證據</td></tr>\n        <tr><td>只要求修一個 bug，diff 卻改了十幾個檔</td><td>沒寫範圍與「不做什麼」，AI 自行擴大修改</td><td>指定檔案範圍與範圍外清單；超出的部分退回重做，不要整包接受</td></tr>\n        <tr><td>寫了一大段功能才發現解錯問題</td><td>跳過計畫直接實作；需求的關鍵假設沒確認</td><td>多檔修改先要計畫、人審過再動；計畫裡列出它的假設讓你逐條確認</td></tr>\n        <tr><td>同一件事來回糾正好幾次還是錯</td><td>context 已經塞滿失敗的嘗試，越改越亂</td><td>糾正兩次不成就清掉 context，把學到的限制寫進新的、更具體的需求重來</td></tr>\n        <tr><td>測試都過了，但使用者說不是他要的</td><td>驗收條件只測了實作細節，沒對應到使用者情境</td><td>用 Given-When-Then 從使用者動作寫情境；把真實的使用者回報檔當測試樣本</td></tr>\n      </tbody></table></div>",
          "anchor": "o01-l3"
        }
      ]
    },
    {
      "id": "O02",
      "anchor": "o02",
      "tag": "O02",
      "name": "上下文管理與程式庫理解",
      "sub": "context、規則檔",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>context window 是模型這一輪的<b>全部視野</b>，系統提示、規則檔、對話、讀過的檔案、工具輸出全部擠在裡面；塞得越滿，注意力越分散，所以要<b>精準給、隨時清、需要時才讀</b>。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 900 190\" role=\"img\" aria-label=\"context window 組成與注意力分布\">\n        <text x=\"10\" y=\"20\" class=\"t-strong\">context 裡有什麼（示意）</text>\n        <rect class=\"bx\" x=\"10\" y=\"34\" width=\"880\" height=\"34\" rx=\"4\"></rect>\n        <rect class=\"fill-fg\" x=\"10\" y=\"34\" width=\"70\" height=\"34\"></rect>\n        <rect class=\"fill-muted\" x=\"80\" y=\"34\" width=\"200\" height=\"34\"></rect>\n        <rect x=\"280\" y=\"34\" width=\"330\" height=\"34\" style=\"fill:var(--faint)\"></rect>\n        <rect x=\"610\" y=\"34\" width=\"160\" height=\"34\" style=\"fill:var(--line)\"></rect>\n        <text x=\"14\" y=\"88\" class=\"t-small\">系統提示＋規則檔</text>\n        <text x=\"130\" y=\"88\" class=\"t-small\">對話</text>\n        <text x=\"400\" y=\"88\" class=\"t-small\">讀進來的檔案</text>\n        <text x=\"640\" y=\"88\" class=\"t-small\">工具輸出</text>\n        <text x=\"790\" y=\"88\" class=\"t-small\">剩餘空間</text>\n        <text x=\"10\" y=\"122\" class=\"t-strong\">lost in the middle：重要資訊放哪裡最容易被用到</text>\n        <path class=\"ln-accent\" d=\"M40,140 C200,182 700,182 860,140\"></path>\n        <text x=\"40\" y=\"134\" class=\"t-small\">開頭：表現好</text>\n        <text x=\"380\" y=\"184\" class=\"t-small\">中間：最容易被忽略</text>\n        <text x=\"776\" y=\"134\" class=\"t-small\">結尾：表現好</text>\n      </svg>\n      <figcaption>Liu 等人 2023 的實驗：相關資訊在長輸入的中段時，正確率明顯低於放在開頭或結尾（U 形曲線）。</figcaption>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>Context window</td><td>模型單次能讀取與處理的 token 上限。模型沒有長期記憶，每次回應都把整個 context 重讀一遍；不在 context 裡的，它看不到</td></tr>\n        <tr><td>Token</td><td>模型處理文字的單位，約等於一個英文單字的一部分或一兩個中文字。程式碼、log 都很吃 token</td></tr>\n        <tr><td>Context rot</td><td>輸入越長、表現越差的現象。Chroma 2025 年測 18 個模型，連簡單任務都隨長度下降，干擾資訊越多掉越快</td></tr>\n        <tr><td>Lost in the middle</td><td>資訊在長 context 中段時最容易被忽略，開頭與結尾最好（U 形）</td></tr>\n        <tr><td>Compaction（壓縮）</td><td>context 快滿時把前面的對話摘要成短文，再接著做。細節會遺失，早期的口頭指示可能被摘掉</td></tr>\n        <tr><td>專案規則檔</td><td>放在 repo 裡、每個 session 開始就自動載入的 Markdown 指示檔（如 CLAUDE.md、AGENTS.md、copilot-instructions.md）。放 build 指令、命名慣例、專案特有的陷阱</td></tr>\n        <tr><td>分層規則</td><td>使用者層（所有專案）→ 專案層（進版控、團隊共用）→ 本機層（不進版控）；有些工具還能讓規則只在碰到特定路徑時才載入</td></tr>\n        <tr><td>Just-in-time 讀取</td><td>不預先把檔案全部讀進來，只記路徑，需要時再用 grep／glob／讀檔工具抓</td></tr>\n        <tr><td>清除 context</td><td>換到不相關的任務時把對話整個清掉，從乾淨的視野開始</td></tr>\n      </tbody></table></div>",
          "anchor": "o02-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>context 很大，為什麼還要省？</b>上限是「放得下」，不是「看得清」。transformer 每個 token 都要和其他 token 建立關係，長度增加時注意力被攤薄，加上 lost in the middle，塞一堆無關檔案反而讓關鍵那幾行被淹沒。精準給 3 個相關檔通常勝過丟整個資料夾。</li>\n        <li><b>規則檔為什麼要短？</b>它每個 session 都佔 context；寫太長，重要的規則反而被雜訊淹沒而被忽略。官方文件建議單檔 200 行內，每行自問「拿掉它 AI 會犯錯嗎？」不會就刪。能從 code 讀出來的（目錄結構、套件清單）不必寫。</li>\n        <li><b>規則檔寫了，為什麼 AI 還是偶爾不照做？</b>規則檔是「放進 context 的建議」，不是強制設定；寫得模糊或兩條互相矛盾時，模型可能挑一條。一定要每次發生的事（例：每次編輯後跑格式檢查、禁止寫某目錄）要改用 hook 或權限設定這類由工具強制執行的機制。</li>\n        <li><b>規則要寫成什麼樣才有效？</b>具體到可以檢查：「縮排用 4 個空白」勝過「格式要整齊」；「API handler 放在 src/api/」勝過「檔案要有條理」。只對某類檔案有用的規則，改成只在碰到那類檔案時才載入。</li>\n        <li><b>agent 怎麼理解一個陌生的 code base？</b>和人一樣：先讀規則檔與 README，再用搜尋找入口點和關鍵字，順著呼叫關係讀，最後才改。常見的混合策略是「規則檔一開始就載入、其他檔案用搜尋工具需要時才讀」。大範圍的探索交給 subagent，只帶回摘要，主對話的 context 不被一堆檔案內容佔掉。</li>\n        <li><b>壓縮後為什麼會「忘記」？</b>摘要只保留它判斷重要的東西。只在對話中口頭講過的要求，壓縮後可能消失；寫進規則檔的會被重新載入。所以重複講第二次的要求，就該寫進規則檔。</li>\n      </ul>",
          "anchor": "o02-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>對話很長之後，AI 開始違反一開始講好的規則</td><td>context 壓縮把早期口頭指示摘掉了，或注意力被大量工具輸出稀釋</td><td>重要規則寫進規則檔（壓縮後會重新載入）；換任務就清 context；冗長的探索交給 subagent</td></tr>\n        <tr><td>AI 自己重寫了一份 repo 裡早就有的 helper</td><td>它沒讀到既有實作，context 裡沒有那段</td><td>需求裡點名「參考 XxxHelper.cs 的寫法」；規則檔寫「新增工具函式前先搜尋既有實作」</td></tr>\n        <tr><td>規則檔明明寫了，AI 還是照自己的習慣做</td><td>規則檔太長或互相矛盾，那一條被淹沒；或寫得太模糊</td><td>刪減到只剩「拿掉會出錯」的規則、改成可檢查的具體句；必須強制的改用 hook／權限設定</td></tr>\n        <tr><td>叫它「先看懂整個專案」之後，回答越來越不準</td><td>一次讀進太多檔案，context 被塞滿、關鍵資訊在中段被忽略</td><td>縮小調查範圍、指定入口檔；或讓 subagent 在獨立 context 探索，只回報摘要</td></tr>\n        <tr><td>AI 引用的函式簽章跟實際檔案不一樣</td><td>它讀到的是舊版內容（檔案在對話中被改過），或根本沒讀、憑印象寫</td><td>要求修改前重新讀檔；回答時引用檔名與行號，方便你核對</td></tr>\n        <tr><td>規則檔裡的某條規則 AI 完全沒照做，像是根本沒看到</td><td>規則檔沒被載入：放錯位置或層級（例：放在子資料夾，只有讀到那個資料夾的檔案時才載入）；或 context 裡大量既有程式碼的寫法和規則相反，模型跟著範例走</td><td>先用工具的記憶／規則檢視功能確認這份檔案有沒有被載入；放到會在開場載入的位置；需求裡點名要依規則改，必要時用 hook 或檢查腳本強制</td></tr>\n        <tr><td>多個專案的規則互相打架</td><td>使用者層與專案層規則矛盾，模型隨機挑一條</td><td>專案特有的寫在專案層、通用的寫在使用者層，並定期檢查有無衝突</td></tr>\n      </tbody></table></div>",
          "anchor": "o02-l3"
        }
      ]
    },
    {
      "id": "O03",
      "anchor": "o03",
      "tag": "O03",
      "name": "Agent、Tool Calling、MCP",
      "sub": "工具、權限、subagent",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>模型本身<b>不執行任何東西</b>，它只輸出「我要呼叫哪個工具、參數是什麼」；真正執行的是外面的程式（client），而 client 先過<b>權限</b>這一關。MCP 是把「工具怎麼接上來」標準化的協定。</p>\n<figure>\n      <div class=\"table-wrap\">\n      <svg class=\"fig\" viewBox=\"0 0 900 230\" role=\"img\" aria-label=\"tool calling 與 MCP 的資料流\" style=\"min-width:640px\">\n        <defs><marker id=\"ah3\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n        <rect class=\"bx\" x=\"10\" y=\"40\" width=\"190\" height=\"120\" rx=\"6\"></rect>\n        <text x=\"26\" y=\"66\" class=\"t-strong\">模型（LLM）</text>\n        <text x=\"26\" y=\"92\" class=\"t-small\">只產生文字：</text>\n        <text x=\"26\" y=\"112\" class=\"t-small\">tool＝run_tests</text>\n        <text x=\"26\" y=\"132\" class=\"t-small\">args＝{\"filter\":\"Pin\"}</text>\n        <rect class=\"bx-accent\" x=\"300\" y=\"40\" width=\"250\" height=\"120\" rx=\"6\"></rect>\n        <text x=\"316\" y=\"66\" class=\"t-strong\">Client／Agent 主程式</text>\n        <text x=\"316\" y=\"92\" class=\"t-small\">1. 查權限：deny → ask → allow</text>\n        <text x=\"316\" y=\"112\" class=\"t-small\">2. 通過才執行，或轉給 MCP</text>\n        <text x=\"316\" y=\"132\" class=\"t-small\">3. 把結果塞回 context</text>\n        <rect class=\"bx\" x=\"650\" y=\"20\" width=\"240\" height=\"60\" rx=\"6\"></rect>\n        <text x=\"666\" y=\"44\" class=\"t-strong\">內建工具</text>\n        <text x=\"666\" y=\"66\" class=\"t-small\">讀檔、編輯、shell、搜尋</text>\n        <rect class=\"bx\" x=\"650\" y=\"110\" width=\"240\" height=\"70\" rx=\"6\"></rect>\n        <text x=\"666\" y=\"134\" class=\"t-strong\">MCP server</text>\n        <text x=\"666\" y=\"156\" class=\"t-small\">JSON-RPC，stdio 或 HTTP</text>\n        <text x=\"666\" y=\"174\" class=\"t-small\">例：資料庫、issue、內部 API</text>\n        <line class=\"ln\" x1=\"200\" y1=\"80\" x2=\"298\" y2=\"80\" marker-end=\"url(#ah3)\"></line>\n        <text x=\"212\" y=\"72\" class=\"t-small\">工具呼叫</text>\n        <line class=\"ln\" x1=\"298\" y1=\"125\" x2=\"202\" y2=\"125\" marker-end=\"url(#ah3)\"></line>\n        <text x=\"212\" y=\"145\" class=\"t-small\">工具結果</text>\n        <line class=\"ln\" x1=\"550\" y1=\"70\" x2=\"648\" y2=\"50\" marker-end=\"url(#ah3)\"></line>\n        <line class=\"ln\" x1=\"550\" y1=\"120\" x2=\"648\" y2=\"140\" marker-end=\"url(#ah3)\"></line>\n        <text x=\"10\" y=\"206\" class=\"t-small\">工具結果會回到 context；結果裡若藏著惡意指示，模型可能照做（prompt injection），所以權限要在 client 端擋。</text>\n      </svg>\n      </div>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>Agent</td><td>會自己決定下一步、反覆呼叫工具直到任務完成的 LLM 系統；相對於「問一句答一句」的聊天</td></tr>\n        <tr><td>Tool calling／function calling</td><td>開發者用 JSON Schema 描述工具（名稱、說明、參數），模型回傳結構化的呼叫要求，client 執行後把結果送回</td></tr>\n        <tr><td>MCP（Model Context Protocol）</td><td>Anthropic 在 2024-11-25 發表的開放協定，讓 AI 應用（client）用同一種方式接各種外部系統（server）。2025-12-09 捐給 Linux Foundation 旗下的 Agentic AI Foundation</td></tr>\n        <tr><td>MCP 的三種能力</td><td>server 可提供 <b>tools</b>（可執行的動作）、<b>resources</b>（可讀的資料）、<b>prompts</b>（範本）</td></tr>\n        <tr><td>MCP 傳輸方式</td><td>訊息用 JSON-RPC。<b>stdio</b>：client 把 server 當子行程啟動，走標準輸入輸出，適合本機；<b>Streamable HTTP</b>：server 是獨立服務，取代 2024-11-05 版的 HTTP+SSE</td></tr>\n        <tr><td>權限規則</td><td>allow（直接放行）、ask（每次問）、deny（禁止）。常見的判定順序是 deny 先、再 ask、最後 allow，allow 不能在 deny 上開例外</td></tr>\n        <tr><td>Sandbox</td><td>作業系統層級限制 agent 能碰的檔案與網路，即使指令寫法繞過了規則也出不去</td></tr>\n        <tr><td>Subagent</td><td>由主 agent 派出、在<b>獨立 context</b> 工作的子 agent，可限制工具，做完只回傳摘要</td></tr>\n        <tr><td>Hook</td><td>在固定時間點（例：工具執行前、編輯後）由工具強制執行的腳本，可用來擋危險指令或自動跑檢查</td></tr>\n      </tbody></table></div>",
          "anchor": "o03-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼需要 MCP？</b>沒有標準時，每個 AI 應用接每個系統都要各寫一次（M×N）。MCP 讓系統只要包成一個 server，所有支援 MCP 的 client 都能用（M＋N）。對公司內部工具特別有用：把內部資料庫或量測系統包成 server，就能被 agent 查詢。</li>\n        <li><b>為什麼權限要在 client 端擋，不能寫在提示裡請模型不要做？</b>模型分不清「你的指示」和「工具結果裡夾帶的指示」。讀到的網頁、文件、issue 內容都可能藏著惡意文字（prompt injection）。規則檔只是建議，權限規則和 sandbox 才是不管模型怎麼想都會生效的硬邊界。</li>\n        <li><b>什麼是 lethal trifecta？</b>同一個 agent 同時有「讀得到機密」「會讀不可信內容」「能對外傳送」三種能力時，攻擊者只要讓它讀到一段惡意文字就能偷資料。拆掉其中一項（例：處理外部文件的 agent 不給網路）就能大幅降低風險。</li>\n        <li><b>MCP server 本身為什麼也是風險？</b>工具描述是給模型看的，使用者通常看不到全文。惡意 server 可以在描述裡藏指示（tool poisoning）、通過審核後再偷改描述（rug pull）、或影響其他可信工具的行為（shadowing）。只裝信任來源、固定版本、看過完整描述再用。</li>\n        <li><b>什麼時候該開 subagent？</b>工作會產生大量輸出（跑測試、掃整個 repo、查文件）、可以獨立完成、只需要回傳結論時。它的價值是讓主對話的 context 保持乾淨。不適合：要頻繁來回確認的、多個階段共用大量脈絡的、只是一個小改動的（啟動時要重新蒐集脈絡，反而慢）。</li>\n        <li><b>多開幾個 agent 平行做，為什麼不一定划算？</b>Anthropic 自己的研究系統中，agent 約用聊天的 4 倍 token、多 agent 系統約 15 倍。適合廣度優先、能切成獨立方向的研究；多數寫 code 的任務彼此相依，能真正平行的部分比研究少，平行還可能互相改到同一個檔。</li>\n      </ul>",
          "anchor": "o03-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>AI 讀了一份外部文件後，突然想把設定檔內容送到某個網址</td><td>文件裡藏了 prompt injection，模型把它當成指示</td><td>對外連線預設 deny 或只允許白名單網域；處理不可信內容的工作不給機密讀取權；啟用 sandbox</td></tr>\n        <tr><td>設了禁止 <code>rm</code> 的規則，檔案還是被刪了</td><td>規則比對的是指令文字，換個寫法（腳本、其他程式）就繞過去</td><td>指令規則不是安全邊界；重要的限制用 sandbox 檔案系統隔離，並保持 git 可回復</td></tr>\n        <tr><td>接了一個 MCP server 後，agent 行為怪怪的、會做沒要求的事</td><td>工具描述藏有指示（tool poisoning）或版本更新後描述被改（rug pull）</td><td>移除該 server、只用信任來源、固定版本、檢視完整工具描述</td></tr>\n        <tr><td>每個動作都跳權限確認，最後都直接按同意</td><td>權限設定太保守，人開始 rubber-stamp，確認失去意義</td><td>把確定安全的唯讀與測試指令加 allow，危險的加 deny，只讓真正需要判斷的進 ask</td></tr>\n        <tr><td>開了三個 subagent 同時改同一個 repo，出現衝突或 git lock 錯誤</td><td>平行寫入同一個工作目錄</td><td>寫入工作不要平行在同一個目錄；需要平行就各開獨立的 worktree，或只讓 subagent 做唯讀調查</td></tr>\n        <tr><td>MCP 工具接太多，一開始 context 就被吃掉一大塊</td><td>每個工具的 schema 都佔 context</td><td>只啟用這個專案需要的 server；用支援「需要時才載入工具定義」的設定</td></tr>\n      </tbody></table></div>",
          "anchor": "o03-l3"
        }
      ]
    },
    {
      "id": "O04",
      "anchor": "o04",
      "tag": "O04",
      "name": "RAG 與程式碼搜尋",
      "sub": "embedding vs 關鍵字",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>context 放不下全部資料時，就先<b>檢索</b>出相關的幾段再交給模型（RAG）。找程式碼有兩種尺：<b>關鍵字</b>找「長得一樣的字」，<b>embedding</b> 找「意思相近的段落」，各有盲點，實務上常合併使用。</p>\n<figure>\n      <div class=\"table-wrap\">\n      <svg class=\"fig\" viewBox=\"0 0 900 220\" role=\"img\" aria-label=\"關鍵字搜尋與語意搜尋對照\" style=\"min-width:640px\">\n        <defs><marker id=\"ah4\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n        <rect class=\"bx\" x=\"10\" y=\"20\" width=\"420\" height=\"88\" rx=\"6\"></rect>\n        <text x=\"26\" y=\"44\" class=\"t-strong\">關鍵字（grep／BM25）</text>\n        <text x=\"26\" y=\"68\" class=\"t-small\">查 \"VCOM_TRIM\" → 精確找到每一處</text>\n        <text x=\"26\" y=\"90\" class=\"t-small\">查「重試邏輯在哪」→ 找不到（沒有這個字）</text>\n        <rect class=\"bx\" x=\"470\" y=\"20\" width=\"420\" height=\"88\" rx=\"6\"></rect>\n        <text x=\"486\" y=\"44\" class=\"t-strong\">語意（embedding 向量）</text>\n        <text x=\"486\" y=\"68\" class=\"t-small\">查「重試邏輯在哪」→ 找到 RetryPolicy 等段落</text>\n        <text x=\"486\" y=\"90\" class=\"t-small\">查 \"VCOM_TRIM\" → 可能混進 VCOM_TRIM2 等近似</text>\n        <line class=\"ln\" x1=\"220\" y1=\"110\" x2=\"400\" y2=\"146\" marker-end=\"url(#ah4)\"></line>\n        <line class=\"ln\" x1=\"680\" y1=\"110\" x2=\"500\" y2=\"146\" marker-end=\"url(#ah4)\"></line>\n        <rect class=\"bx-accent\" x=\"250\" y=\"148\" width=\"400\" height=\"56\" rx=\"6\"></rect>\n        <text x=\"266\" y=\"172\" class=\"t-strong\">混合檢索：兩邊各取前幾名再合併</text>\n        <text x=\"266\" y=\"194\" class=\"t-small\">常用 RRF：分數＝Σ 1／(60＋名次)，可再加 reranker</text>\n      </svg>\n      </div>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>RAG（Retrieval-Augmented Generation）</td><td>Lewis 等人 2020 年提出：先從外部資料檢索相關段落，再和問題一起交給模型生成答案。模型參數裡的知識叫參數記憶，外部索引叫非參數記憶</td></tr>\n        <tr><td>Chunking（切塊）</td><td>把文件或程式切成小段再建索引。程式碼常依函式、類別這種語法邊界切，避免一個函式被切成兩半</td></tr>\n        <tr><td>Embedding</td><td>把一段文字轉成一組數字向量，意思相近的文字向量距離也近（常用 cosine similarity 比較）</td></tr>\n        <tr><td>向量索引（vector index）</td><td>存放所有 chunk 向量的資料庫，用近似最近鄰（ANN）快速找出最像的前 k 個</td></tr>\n        <tr><td>BM25</td><td>經典的關鍵字排序公式：詞出現越多、越稀有、文件越短，分數越高。常用參數 k₁ 1.2～2.0、b 0.75</td></tr>\n        <tr><td>混合檢索（hybrid）</td><td>關鍵字與語意兩種結果合併。RRF（Reciprocal Rank Fusion）只看名次不看分數，常用常數 k＝60，不需要調參</td></tr>\n        <tr><td>Reranker</td><td>對初步撈出的候選再用較準的模型重新排序，只保留最相關的幾段</td></tr>\n        <tr><td>Agentic search</td><td>不預建索引，讓 agent 自己反覆下 grep／glob、讀檔、再決定下一個關鍵字，像人一樣邊找邊縮小範圍</td></tr>\n        <tr><td>Top-k</td><td>檢索取回的段落數。太少漏掉、太多又把 context 塞滿</td></tr>\n      </tbody></table></div>",
          "anchor": "o04-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼找程式碼時關鍵字搜尋特別強？</b>程式碼充滿精確識別字：函式名、暫存器名、錯誤訊息、設定 key。這些「一字不差」的查詢，grep 一定找得到而且完整；embedding 把意思相近的都拉進來，反而可能漏掉或混進近似名稱。</li>\n        <li><b>那 embedding 什麼時候贏？</b>你不知道確切名稱、只知道概念時（「哪裡處理逾時重送？」「跟 gamma 校正有關的程式在哪？」），或用中文問、程式用英文寫時。</li>\n        <li><b>為什麼不乾脆把整個 repo 塞進 context？</b>大部分 repo 放不下；放得下也會遇到 context rot 與成本問題。反過來，資料量真的小（Anthropic 的建議門檻是 20 萬 token、約 500 頁內）就直接整份放進 prompt，比建 RAG 簡單。</li>\n        <li><b>agentic search 與預建索引各有什麼取捨？</b>agentic search 每次都讀最新的檔案、不必維護索引、不必把程式碼上傳到索引服務，代價是多花幾輪工具呼叫；預建向量索引查詢快、適合超大 repo 或概念查詢，但會<b>過期</b>（程式改了索引沒更新）、切塊可能切壞語意，而且索引要存在某處，需要評估機密性。</li>\n        <li><b>為什麼切塊方式影響很大？</b>檢索的最小單位就是 chunk。函式被切成兩半，撈回來的只有一半；chunk 缺少「屬於哪個類別、哪個檔」的上下文時也容易誤判。Anthropic 實驗在每個 chunk 前補一句脈絡說明，檢索失敗率降 35%，再加 BM25 降 49%，再加 rerank 降 67%。</li>\n      </ul>",
          "anchor": "o04-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>問某個暫存器名或錯誤碼，AI 找到的都是不相干的段落</td><td>只用語意搜尋，精確識別字不是它的強項</td><td>精確字串改用 grep／關鍵字；系統面做混合檢索</td></tr>\n        <tr><td>AI 引用的程式碼和目前檔案不一樣</td><td>向量索引過期，撈到的是舊版 chunk</td><td>改檔後重建或增量更新索引；最終修改前一律重新讀實際檔案</td></tr>\n        <tr><td>內部規格書 RAG 問答常引用舊版規格的內容</td><td>新舊版文件同時留在索引裡，chunk 沒有版本、日期等 metadata 可過濾；或新版上架後索引沒更新</td><td>舊版移出索引或標記作廢；每個 chunk 帶文件名、版本、日期 metadata，查詢時只取最新有效版；回答附出處與版本讓人核對</td></tr>\n        <tr><td>撈回來的段落只有半個函式，AI 推論出錯</td><td>依固定字數切塊，切斷了語法結構</td><td>依函式／類別邊界切；chunk 附檔名與所屬類別等脈絡</td></tr>\n        <tr><td>撈很多段進來，答案反而變差</td><td>top-k 太大，雜訊稀釋了關鍵資訊</td><td>降低 k、加 reranker 只留最相關的幾段</td></tr>\n        <tr><td>用中文描述功能，搜不到英文寫的程式</td><td>關鍵字搜尋不跨語言</td><td>用語意搜尋，或請 AI 先把概念翻成可能的英文識別字再 grep</td></tr>\n        <tr><td>公司擔心原始碼被上傳到外部索引服務</td><td>預建雲端索引需要把程式碼片段或向量送出去</td><td>評估工具的索引存放位置與保留政策；敏感 repo 改用本機搜尋（agentic search）或停用索引</td></tr>\n      </tbody></table></div>",
          "anchor": "o04-l3"
        }
      ]
    },
    {
      "id": "O05",
      "anchor": "o05",
      "tag": "O05",
      "name": "Diff Review 與回復機制",
      "sub": "diff、測試、rollback",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>AI 寫得快，所以瓶頸移到<b>人看不看得完、驗不驗得了、退不退得回去</b>：diff 要小、review 要對照驗收條件、測試要當閘門、每個可運作的狀態都要 commit。</p>\n<figure>\n      <div class=\"table-wrap\">\n      <svg class=\"fig\" viewBox=\"0 0 900 200\" role=\"img\" aria-label=\"git revert 與 git reset 對照\" style=\"min-width:640px\">\n        <text x=\"10\" y=\"20\" class=\"t-strong\">壞掉的是 C，兩種退法</text>\n        <text x=\"10\" y=\"62\">revert</text>\n        <circle class=\"bx\" cx=\"120\" cy=\"58\" r=\"16\"></circle><text x=\"114\" y=\"63\">A</text>\n        <circle class=\"bx\" cx=\"220\" cy=\"58\" r=\"16\"></circle><text x=\"214\" y=\"63\">B</text>\n        <circle class=\"bx-accent\" cx=\"320\" cy=\"58\" r=\"16\"></circle><text x=\"314\" y=\"63\">C</text>\n        <circle class=\"bx\" cx=\"420\" cy=\"58\" r=\"16\"></circle><text x=\"410\" y=\"63\">C'</text>\n        <line class=\"ln\" x1=\"136\" y1=\"58\" x2=\"204\" y2=\"58\"></line><line class=\"ln\" x1=\"236\" y1=\"58\" x2=\"304\" y2=\"58\"></line><line class=\"ln\" x1=\"336\" y1=\"58\" x2=\"404\" y2=\"58\"></line>\n        <text x=\"460\" y=\"54\" class=\"t-small\">新增一個「抵銷 C」的 commit C'</text>\n        <text x=\"460\" y=\"74\" class=\"t-small\">歷史不改寫 → 已推上去、多人共用也安全</text>\n        <text x=\"10\" y=\"142\">reset</text>\n        <circle class=\"bx\" cx=\"120\" cy=\"138\" r=\"16\"></circle><text x=\"114\" y=\"143\">A</text>\n        <circle class=\"bx\" cx=\"220\" cy=\"138\" r=\"16\"></circle><text x=\"214\" y=\"143\">B</text>\n        <circle class=\"bx\" cx=\"320\" cy=\"138\" r=\"16\" style=\"stroke-dasharray:4 3\"></circle><text x=\"314\" y=\"143\" class=\"t-muted\">C</text>\n        <line class=\"ln\" x1=\"136\" y1=\"138\" x2=\"204\" y2=\"138\"></line><line class=\"ln dash\" x1=\"236\" y1=\"138\" x2=\"304\" y2=\"138\"></line>\n        <text x=\"460\" y=\"134\" class=\"t-small\">分支指標退回 B，C 從歷史消失</text>\n        <text x=\"460\" y=\"154\" class=\"t-small\">改寫歷史 → 只適合還沒推出去的本機 commit</text>\n        <text x=\"10\" y=\"190\" class=\"t-small\">agent 工具內建的回復點通常只追蹤它自己編輯工具改的檔，shell 指令改的、其他程序改的不算，不能取代 git。</text>\n      </svg>\n      </div>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>Diff</td><td>修改前後的差異，逐行標出新增（+）與刪除（−）。review AI 修改的主要依據</td></tr>\n        <tr><td>Code review</td><td>由人（或另一個獨立的 AI）檢查 diff 是否正確、符合需求、沒有超出範圍</td></tr>\n        <tr><td>測試閘門（test gate）</td><td>build、單元測試、回歸測試沒通過就不准合併；可在 CI 或本機 hook 強制</td></tr>\n        <tr><td>回歸測試</td><td>用一組既有樣本確認「原本對的還是對的」。改 parser、演算法時最重要</td></tr>\n        <tr><td><code>git revert</code></td><td>新增一個 commit 抵銷指定 commit 的效果，不改寫歷史</td></tr>\n        <tr><td><code>git reset</code></td><td>把分支指標移回較早的 commit，之後的 commit 從歷史中拿掉；<code>--hard</code> 連工作目錄的修改也丟掉</td></tr>\n        <tr><td><code>git stash</code></td><td>把工作目錄裡還沒 commit 的修改暫時收起來，讓工作目錄回到乾淨狀態；之後用 <code>git stash pop</code> 拿回來。適合「先讓 AI 試別的做法，原本的改到一半先放旁邊」</td></tr>\n        <tr><td>Checkpoint／rewind</td><td>agent 工具在每輪對話前自動存的檔案快照，可退回；只涵蓋自己編輯工具改的檔，是 session 層級的救急，不是版本控制</td></tr>\n        <tr><td>Branch／worktree</td><td>branch 讓實驗和主線分開；worktree 讓同一個 repo 同時有多個工作目錄，平行的 session 各改各的不衝突</td></tr>\n        <tr><td>Writer／Reviewer</td><td>一個 session 寫，另一個乾淨 context 的 session（或 subagent）只看 diff 與驗收條件來 review</td></tr>\n      </tbody></table></div>",
          "anchor": "o05-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 diff 要小？</b>人一次能認真看的行數有限，800 行跨 20 檔的 diff 最後一定變成「大概看一下」。小 diff 也讓錯誤容易定位、容易單獨退回。</li>\n        <li><b>review AI 的 code 要特別看什麼？</b>對照驗收條件逐條確認；看有沒有超出範圍的修改（格式、import、無關重構）；新增的套件與 API 是否真的存在；有沒有刪掉檢查或錯誤處理；有沒有寫死路徑、帳密；測試檔有沒有被改。</li>\n        <li><b>為什麼要讓另一個 context 來 review？</b>寫 code 的那個 session 帶著自己的推理，容易替自己的修改找理由；乾淨 context 只看 diff 與標準，比較能發現盲點。但 reviewer 被要求「找問題」就一定會找出一些，要叫它只報影響正確性或需求的問題，否則會被帶去過度設計。</li>\n        <li><b>測試為什麼要防 AI 自己改？</b>測試失敗時，最省事的「修法」是改 assert、跳過測試或刪掉案例。所以 diff 裡有測試檔變動時要特別看：是修正測試本身的錯，還是把標準降低了。</li>\n        <li><b>為什麼要小步 commit？</b>每個可運作的狀態都是一個安全點。壞了只要退一步；不 commit 的話，一整天的修改只能整包丟掉或手動挑。agent 的回復點不追蹤 shell 改的檔，git 才是最後防線。</li>\n        <li><b>revert 和 reset 怎麼選？</b>已經推到共用 remote 的用 revert（不改寫別人已經拿到的歷史）；還在本機、沒推出去的才用 reset。</li>\n      </ul>",
          "anchor": "o05-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>合併後才發現 AI 改了好幾個不相關的檔</td><td>沒看 diff 就全部接受（rubber-stamp），或 diff 太大看不完</td><td>要求每次只改指定範圍；review 先看「改了哪些檔」清單，超出範圍的直接退</td></tr>\n        <tr><td>測試忽然全部變綠，但功能其實沒修好</td><td>AI 改了測試的預期值、加了 skip 或刪掉 assert</td><td>測試檔變動要單獨審；規則檔寫「不得修改既有測試的預期值，除非我同意」</td></tr>\n        <tr><td>bug 已經推上共用分支，要退回</td><td>錯誤的 commit 已被別人拉走</td><td>用 <code>git revert</code> 產生反向 commit，不要 reset＋強制推送</td></tr>\n        <tr><td>用 agent 的回復功能退了，檔案還是被改過</td><td>那些檔是用 shell 指令改的（或是 subagent、其他程序改的），回復點沒追蹤</td><td>開工前確認工作目錄乾淨、先 commit；最後用 git 比對與還原</td></tr>\n        <tr><td>想試兩種做法，結果互相覆蓋</td><td>在同一個工作目錄來回試</td><td>每種做法開一個 branch 或 worktree，比較完留下一個</td></tr>\n        <tr><td>改了 parser 之後，舊樣本的結果默默變了</td><td>只測了新案例，沒跑回歸集</td><td>建立固定回歸樣本與基準輸出，每次修改都比對，差異逐一確認是改善還是退步</td></tr>\n      </tbody></table></div>",
          "anchor": "o05-l3"
        }
      ]
    },
    {
      "id": "O06",
      "anchor": "o06",
      "tag": "O06",
      "name": "AI 開發風險",
      "sub": "幻覺、套件、機密",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>AI 產出的 code「看起來對」的比例遠高於「真的對」；五大風險是<b>幻覺、過度修改、相依套件、機密外洩、可維護性</b>，每一項的對策都是同一句：<b>人要看得懂、驗得了，才合併</b>。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>幻覺（hallucination）</td><td>模型自信地產生不存在或錯誤的東西：不存在的 API、參數、套件、設定值、規格數字</td></tr>\n        <tr><td>套件幻覺／slopsquatting</td><td>AI 建議安裝不存在的套件名；攻擊者搶先註冊這些名字放惡意程式。2024 年研究分析 16 個模型、57.6 萬份程式樣本，商用模型至少 5.2%、開源模型 21.7% 的建議套件不存在，共出現 205,474 個不同的假套件名</td></tr>\n        <tr><td>過度修改（over-editing）</td><td>超出需求的修改：順手重構、改格式、改 import 排序、加沒要求的功能或防呆</td></tr>\n        <tr><td>供應鏈風險</td><td>依賴的套件、模型、MCP server 本身被植入惡意程式或有漏洞（OWASP LLM Top 10 2025 的 LLM03）</td></tr>\n        <tr><td>敏感資料外洩</td><td>把原始碼、客戶資料、帳密貼給外部 AI 服務，或 agent 讀到 .env 後外送（OWASP LLM02）。2023 年 4 月三星員工把內部原始碼與會議內容貼進 ChatGPT，5 月公司暫時禁用生成式 AI</td></tr>\n        <tr><td>Excessive agency</td><td>給 agent 的權限、功能、自主程度超過任務需要（OWASP LLM06）</td></tr>\n        <tr><td>可維護性</td><td>未來的人（包括三個月後的自己）能不能看懂、修改、除錯這段 code</td></tr>\n      </tbody></table></div>",
          "anchor": "o06-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼會幻覺？</b>模型是依機率接續最像的文字，不是查資料庫。常見的命名模式（例：<code>xxx.Utils</code>、<code>ToAsync()</code>）會被「合理地」生成出來，即使實際不存在；訓練資料的截止日也讓它不知道新版 API 的變動。</li>\n        <li><b>為什麼套件幻覺是安全問題，不只是編譯錯？</b>同一個假名字會被不同人重複問到時反覆出現，攻擊者可以預先註冊它。照著 AI 的建議直接 install，就把惡意程式裝進來了。對策：安裝前查官方套件庫的發布者、下載量、建立日期；公司環境走內部鏡像與核准清單。</li>\n        <li><b>為什麼 AI 傾向過度修改？</b>它想讓結果「看起來更完整」，又看不到團隊的隱性慣例（例：WinForms 的 Designer 檔不能亂排、某些格式是工具要讀的）。過度修改的成本在 review：真正的變更被淹沒在格式差異裡。</li>\n        <li><b>為什麼 AI 產的 code 安全性要特別審？</b>Veracode 2025 年的報告中，45% 的程式樣本引入 OWASP Top 10 漏洞，Java 72%、C# 45%；而且模型越新越大，安全表現並沒有跟著變好。功能正確不等於安全。</li>\n        <li><b>為什麼「感覺變快」不一定是真的變快？</b>METR 2025 年的實驗中，16 位資深開源開發者在自己熟悉的大型專案上用 AI 工具，完成任務反而慢了 19%，但事後仍覺得快了 20%。省下的打字時間，可能被等待、修正、review 吃回去；越熟的 code base 越明顯。</li>\n        <li><b>可維護性為什麼是長期風險？</b>看不懂就合併的 code，出問題時沒人能修，只能再叫 AI 改，越改越難懂。規則：自己解釋不出這段在做什麼，就不要合併。</li>\n      </ul>",
          "anchor": "o06-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>AI 寫的程式呼叫一個編譯不過的方法</td><td>API 幻覺，或該方法在你用的版本不存在</td><td>要它先查實際的套件版本與文件；以編譯與測試結果為準，不信它的說明</td></tr>\n        <tr><td>AI 建議裝一個從沒聽過的套件</td><td>可能是幻覺套件名，甚至已被搶註成惡意套件</td><td>先到官方套件庫查發布者、下載量、建立日期；能用既有套件或標準函式庫就不新增；新增依賴要人決定</td></tr>\n        <tr><td>修一個小 bug，diff 裡一半是格式與 import 變動</td><td>過度修改；AI 套用了自己的格式偏好</td><td>規則檔寫「只動需求範圍、不改無關格式與 import」；用格式工具統一後再比對；超出部分退回</td></tr>\n        <tr><td>API Key 被寫死在原始碼裡，差點 commit</td><td>AI 為了「能跑」把密鑰直接填進去</td><td>密鑰放加密的本機儲存或環境設定，不進版控；commit 前跑 secret scanning；已推出去的金鑰立即作廢重發</td></tr>\n        <tr><td>同事把含 API Key 或密碼的 log 整段貼給雲端 AI 除錯</td><td>貼之前沒遮罩敏感字串；內容一送出就離開公司控制，刪掉對話紀錄不能保證服務端沒留存</td><td>視同已外洩：立即作廢並換發該金鑰；確認該服務的資料保留與訓練使用政策；之後先把密鑰、客戶資料遮罩再貼</td></tr>\n        <tr><td>同事把客戶規格書整份貼進公開 AI 服務</td><td>沒有資料分級與核准的 AI 使用管道</td><td>公司提供經核准的 AI 入口（內部 gateway）；明訂哪些資料不能送出；agent 設 deny 讀取機密目錄</td></tr>\n        <tr><td>半年後沒人看得懂某個模組，只能整段叫 AI 重寫</td><td>當初看不懂就合併；缺乏設計說明</td><td>合併前要求自己能解釋每段；重要決策寫進文件或 commit 訊息；拆成小而清楚的單元</td></tr>\n      </tbody></table></div>",
          "anchor": "o06-l3"
        }
      ]
    }
  ],
  "back": [
    {
      "id": "confuse",
      "title": "容易混淆",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>這兩個</th><th>差在哪</th></tr>\n      <tr><td>Context window vs 訓練資料</td><td>這一輪看得到什麼（暫時、有上限）vs 模型學過什麼（固化在參數裡、有截止日）（O02）</td></tr>\n      <tr><td>規則檔 vs hook／權限設定</td><td>放進 context 的建議，模型可能不照做 vs 工具強制執行，不管模型怎麼想都生效（O02、O03）</td></tr>\n      <tr><td>Tool calling vs MCP</td><td>模型呼叫工具的機制 vs 工具怎麼接到 client 的標準協定；MCP 的工具最後也是透過 tool calling 被呼叫（O03）</td></tr>\n      <tr><td>Subagent vs 平行 session</td><td>主 agent 派出、獨立 context、只回摘要 vs 人自己開的多個獨立對話，要自己協調；兩者寫同一個目錄都會衝突（O03）</td></tr>\n      <tr><td>RAG vs fine-tuning</td><td>執行時把外部資料檢索進 context，資料改了馬上生效 vs 用資料重新訓練模型參數，改資料要重訓（O04）</td></tr>\n      <tr><td>關鍵字搜尋 vs embedding 搜尋</td><td>找字面一樣的，識別字精準 vs 找意思相近的，概念查詢強但可能混進近似名（O04）</td></tr>\n      <tr><td>Agentic search vs 向量索引</td><td>即時 grep、永遠是最新檔案、多花幾輪呼叫 vs 預建索引查詢快、會過期、要存放程式碼向量（O04）</td></tr>\n      <tr><td><code>git revert</code> vs <code>git reset</code></td><td>新增反向 commit、不改寫歷史 vs 移動分支指標、改寫歷史（O05）</td></tr>\n      <tr><td>Checkpoint vs git commit</td><td>agent 的 session 層級快照，只追蹤自己編輯工具改的檔 vs 永久、完整的版本歷史（O05）</td></tr>\n      <tr><td>驗收條件 vs 實作步驟</td><td>怎樣算完成（可檢查）vs 怎麼做；前者決定 agent 何時停，後者可以交給 agent 想（O01）</td></tr>\n      <tr><td>幻覺 vs 知識過時</td><td>產生根本不存在的東西 vs 東西存在但已經改版；對策都是查實際版本的文件與編譯結果（O06）</td></tr>\n      <tr><td>Prompt injection vs 越獄（jailbreak）</td><td>第三方把指示藏在 agent 會讀的內容裡 vs 使用者自己誘導模型違反限制（O03、O06）</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "terms",
      "title": "英文術語",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>英文</th><th>中文</th><th>常見用法</th></tr>\n      <tr><td>Acceptance criteria</td><td>驗收條件</td><td>The task is done when all acceptance criteria pass.</td></tr>\n      <tr><td>Out of scope</td><td>範圍外</td><td>Refactoring is out of scope for this change.</td></tr>\n      <tr><td>Context window</td><td>上下文視窗</td><td>The log dump filled most of the context window.</td></tr>\n      <tr><td>Compaction</td><td>上下文壓縮</td><td>Early instructions were lost after compaction.</td></tr>\n      <tr><td>Tool call</td><td>工具呼叫</td><td>The model issued a tool call to run the tests.</td></tr>\n      <tr><td>Least privilege</td><td>最小權限</td><td>Give the agent least-privilege access to the repo.</td></tr>\n      <tr><td>Prompt injection</td><td>提示注入</td><td>The web page contained a prompt injection.</td></tr>\n      <tr><td>Subagent</td><td>子代理</td><td>Delegate the codebase search to a subagent.</td></tr>\n      <tr><td>Retrieval</td><td>檢索</td><td>Hybrid retrieval combines BM25 and embeddings.</td></tr>\n      <tr><td>Embedding</td><td>向量嵌入</td><td>Re-embed the files after the refactor.</td></tr>\n      <tr><td>Chunking</td><td>切塊</td><td>Chunk the code by function boundaries.</td></tr>\n      <tr><td>Regression test</td><td>回歸測試</td><td>Run the regression suite before merging.</td></tr>\n      <tr><td>Revert</td><td>反向還原</td><td>Revert the faulty commit on main.</td></tr>\n      <tr><td>Hallucination</td><td>幻覺</td><td>The suggested package was a hallucination.</td></tr>\n      <tr><td>Scope creep</td><td>範圍蔓延</td><td>The diff shows scope creep beyond the bug fix.</td></tr>\n      <tr><td>Secret scanning</td><td>密鑰掃描</td><td>Secret scanning blocked the commit with an API key.</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "sources",
      "title": "出處",
      "blocks": [
        {
          "t": "html",
          "html": "<ol class=\"sources\">\n      <li><b>O01</b>　https://code.claude.com/docs/en/best-practices （驗證條件、先計畫、訪談後寫 spec、一句話描述得出的 diff 不必計畫）；https://alistairmavin.com/ears/ （EARS，Rolls-Royce 2009）；https://martinfowler.com/bliki/GivenWhenThen.html</li>\n      <li><b>O02</b>　https://arxiv.org/abs/2307.03172 （Lost in the Middle，Liu 等 2023）；https://www.trychroma.com/research/context-rot （18 個模型）；https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents （attention budget、compaction、just-in-time、混合策略）；https://code.claude.com/docs/en/memory （規則檔分層、200 行建議、建議非強制、壓縮後重新載入）；https://code.claude.com/docs/en/context-window</li>\n      <li><b>O03</b>　https://www.anthropic.com/news/model-context-protocol （2024-11-25）；https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation （2025-12-09）；https://modelcontextprotocol.io/specification/2025-06-18/basic/transports ；https://code.claude.com/docs/en/permissions （deny→ask→allow、指令規則非安全邊界）；https://code.claude.com/docs/en/sub-agents ；https://www.anthropic.com/engineering/multi-agent-research-system （4×／15× token）；https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks ；https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/</li>\n      <li><b>O04</b>　https://arxiv.org/abs/2005.11401 （RAG，Lewis 等 2020）；https://en.wikipedia.org/wiki/Okapi_BM25 ；https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion （RRF，k＝60）；https://www.anthropic.com/news/contextual-retrieval （35%／49%／67%、20 萬 token 門檻）</li>\n      <li><b>O05</b>　https://git-scm.com/docs/git-revert ；https://code.claude.com/docs/en/checkpointing （只追蹤編輯工具、不取代版控）；https://code.claude.com/docs/en/best-practices （Writer／Reviewer、reviewer 過度設計提醒）</li>\n      <li><b>O06</b>　https://arxiv.org/abs/2406.10279 （套件幻覺 5.2%／21.7%、205,474）；https://genai.owasp.org/llm-top-10/ （OWASP LLM Top 10 2025）；https://www.veracode.com/blog/genai-code-security-report/ （45%、Java 72%、C# 45%）；https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ （慢 19%、自覺快 20%）；https://techcrunch.com/2023/05/02/samsung-bans-use-of-generative-ai-tools-like-chatgpt-after-april-internal-data-leak/</li>\n      <li class=\"muted\">查證日 2026-10-02。未證實：主圖 context 比例為示意值；Cursor 等工具的程式碼索引實作細節（官方頁無法取得，未寫入）；GitClear 的 AI 程式碼重複率數據（無法取得，未寫入）；MCP Streamable HTTP 首次出現的規格版本號依相容性說明推定為 2025-03-26。</li>\n    </ol>"
        }
      ]
    }
  ],
  "css": ".kb-O svg.fig .c-rules { fill: var(--fg); }\n.kb-O svg.fig .c-conv { fill: var(--muted); }\n.kb-O svg.fig .c-file { fill: var(--faint); }\n.kb-O svg.fig .c-tool { fill: var(--line); }\n.kb-O svg.fig .gate { fill: var(--bg); stroke: var(--fg); stroke-width: 1; }\n.kb-O .stage-info dl { margin: 8px 0 0; display: grid; grid-template-columns: 7em 1fr; gap: 4px 12px; max-width: 68ch; }\n.kb-O .stage-info dt { color: var(--muted); font-size: 13px; padding-top: 2px; }\n.kb-O .stage-info dd { margin: 0; }\n@media (max-width: 600px) {\n.kb-O .stage-info dl { grid-template-columns: 1fr; }\n.kb-O .stage-info dt { padding-top: 6px; }\n}\n"
}

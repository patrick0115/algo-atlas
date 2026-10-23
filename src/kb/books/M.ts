// 原 SemiDrill 講義(git 歷史裡的 public/semi/ 原檔)搬進百科的資料;內容是原講義的 HTML 片段,改這裡就是改講義。
import type { Book } from '../types'

export const book: Book = {
  "id": "M",
  "file": "M-digital.html",
  "title": "數位邏輯與 FPGA 驗證：每個 flip-flop 都只在時脈邊緣看一眼",
  "lead": "同步數位電路的整套規矩，都建立在一個假設上：<b>資料在時脈邊緣前後那一小段時間（setup／hold 視窗）裡保持不動</b>。組合邏輯要在一個週期內算完（時序收斂）、不同時脈之間要靠同步器交接（CDC）、RTL 要寫成合成器看得懂的樣子、驗證要證明這些假設真的成立。大部分「模擬會過、上板就壞」的問題，都是這個假設在某處被打破。",
  "note": "<p class=\"muted small\">對應 taxonomy M01～M05。難度標籤：<span class=\"lv\">L1</span>是什麼　<span class=\"lv l2\">L2</span>為什麼　<span class=\"lv l3\">L3</span>出問題怎麼辦。</p>",
  "front": [
    {
      "id": "cdc",
      "title": "主圖：一個訊號跨時脈時，到底發生什麼事",
      "blocks": [
        {
          "t": "widget",
          "id": "M.cdc",
          "html": "<div class=\"controls\">\n      <div class=\"seg\" id=\"mode\">\n        <button data-m=\"none\" class=\"on\">沒有同步器</button>\n        <button data-m=\"sync2\">雙級同步器</button>\n        <button data-m=\"bus\">多 bit 直接同步（錯）</button>\n        <button data-m=\"gray\">改用 Gray code</button>\n      </div>\n    </div>\n<div class=\"stage\">\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" id=\"wv\" viewBox=\"0 0 900 300\" role=\"img\" aria-label=\"CDC 波形\" style=\"min-width:640px\"></svg>\n      </div>\n      <div class=\"controls\" style=\"margin:12px 0 0\">\n        <button class=\"btn\" id=\"prev\">← 上一段</button>\n        <button class=\"btn primary\" id=\"next\">下一段 →</button>\n        <span class=\"muted small\" id=\"phase\"></span>\n      </div>\n      <div class=\"stage-info\">\n        <h3 id=\"stTitle\"></h3>\n        <p id=\"stWhat\"></p>\n      </div>\n    </div>"
        },
        {
          "t": "html",
          "html": "<p class=\"muted small\">圖例：斜線區＝亞穩態（電壓停在 0 與 1 之間，多久才落定是機率問題）；虛線框＝clk_b 上升緣的 setup／hold 視窗；淡灰直線＝clk_b 的取樣邊緣。</p>"
        }
      ]
    },
    {
      "id": "pick",
      "title": "跨時脈訊號怎麼過：一張表選方法",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>要過去的是什麼</th><th>用什麼</th><th>關鍵條件</th><th>常見誤用</th></tr>\n      <tr><td>單 bit、慢變的準位（enable、模式設定）</td><td>雙級（或三級）同步器</td><td>來源端訊號要穩定得比目的端週期久</td><td>同一個訊號在目的端同步兩次，分給兩個模組 → 兩邊可能差一拍</td></tr>\n      <tr><td>單 bit 脈衝，快時脈 → 慢時脈</td><td>toggle 同步（脈衝轉成準位翻轉，過去後用 XOR 還原）或把脈衝拉寬</td><td>來源端兩個脈衝不能靠太近</td><td>單一週期的脈衝直接進雙級同步器，慢時脈根本沒取樣到</td></tr>\n      <tr><td>多 bit 計數器／指標（每次只加 1）</td><td>先轉 Gray code 再逐 bit 同步</td><td>值必須是「一次只變一格」</td><td>任意跳值的資料也用 Gray（跳兩格以上就不只變一個 bit）</td></tr>\n      <tr><td>多 bit 資料，偶爾才換一次（暫存器設定）</td><td>handshake（req／ack）或 MCP：資料先放著不動，只同步一個「資料好了」的控制訊號</td><td>控制訊號同步過去之前，資料不能改</td><td>每個 bit 各接一個同步器</td></tr>\n      <tr><td>多 bit 資料，連續一直來（視訊、封包）</td><td>非同步 FIFO（dual-port RAM＋Gray 讀寫指標）</td><td>深度要吃得下兩端速率差與突發量</td><td>FIFO 深度只按平均速率算，沒算突發</td></tr>\n      <tr><td>reset 解除</td><td>reset 同步器：非同步拉起、同步放開</td><td>每個時脈域各一個</td><td>非同步 reset 直接放開，各 flip-flop 在不同週期醒來</td></tr>\n    </tbody></table></div>"
        }
      ]
    }
  ],
  "entries": [
    {
      "id": "M01",
      "anchor": "m01",
      "tag": "M01",
      "name": "數位邏輯基礎",
      "sub": "組合、序向、FSM",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b><b>組合邏輯</b>只看現在的輸入；<b>序向邏輯</b>還會記住過去（靠 flip-flop），FSM 就是「狀態暫存器＋算下一個狀態的組合邏輯」。</p>"
        },
        {
          "t": "widget",
          "id": "M.m01",
          "html": "<figure>\n      <div class=\"controls\" style=\"margin-bottom:10px\">\n        <div class=\"seg\" id=\"fsmType\">\n          <button data-f=\"moore\" class=\"on\">Moore</button>\n          <button data-f=\"mealy\">Mealy</button>\n        </div>\n        <button class=\"btn\" id=\"fPrev\">← 上一週期</button>\n        <button class=\"btn primary\" id=\"fNext\">下一週期 →</button>\n        <span class=\"muted small\" id=\"fInfo\"></span>\n      </div>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" id=\"fsm\" viewBox=\"0 0 900 300\" role=\"img\" aria-label=\"FSM 逐步\" style=\"min-width:640px\"></svg>\n      </div>\n      <figcaption id=\"fCap\">偵測「連續兩個 1」的狀態機。切換 Moore／Mealy，逐週期看輸出在哪一拍出現。</figcaption>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>組合邏輯（combinational）</td><td>輸出只由當下輸入決定，沒有記憶：AND／OR、加法器、多工器（MUX）、比較器、解碼器</td></tr>\n        <tr><td>序向邏輯（sequential）</td><td>輸出還跟過去有關，靠 flip-flop 或 latch 記住狀態：計數器、移位暫存器、FSM</td></tr>\n        <tr><td>Flip-flop vs latch</td><td>flip-flop 是<b>邊緣觸發</b>，只在時脈上升（或下降）那一刻取樣；latch 是<b>準位觸發</b>，enable 為高的整段時間都透明</td></tr>\n        <tr><td>Setup／hold time</td><td>時脈邊緣<b>之前</b>資料要先穩定多久（setup）、<b>之後</b>還要保持多久（hold）。違反就可能取錯值或進入亞穩態</td></tr>\n        <tr><td>Clock-to-Q（t<sub>co</sub>）</td><td>時脈邊緣到 flip-flop 輸出真的改變所需的時間</td></tr>\n        <tr><td>FSM</td><td>有限狀態機：狀態暫存器＋下一狀態邏輯＋輸出邏輯</td></tr>\n        <tr><td>Moore vs Mealy</td><td>Moore：輸出只看<b>狀態</b>；Mealy：輸出看<b>狀態＋輸入</b>，所以反應早一拍，但輸入的毛刺會直接傳到輸出</td></tr>\n        <tr><td>狀態編碼</td><td>binary（最少 flip-flop）、one-hot（每個狀態一個 flip-flop，解碼簡單、速度快，FPGA 常用）、Gray（相鄰狀態只差 1 bit）</td></tr>\n        <tr><td>編碼器 vs 解碼器</td><td>解碼器：n 條輸入 → 2<sup>n</sup> 條中選一條為 1（位址解碼）；編碼器反過來。<b>優先編碼器</b>同時多條為 1 時只輸出優先權最高那條的編號（中斷控制器）</td></tr>\n        <tr><td>卡諾圖（K-map）</td><td>把真值表排成格子，相鄰格只差 1 個變數（行列用 Gray 順序排）。把相鄰的 1 圈成 1、2、4、8 格的矩形，每一圈就是一個化簡後的乘積項；don't care（X）可以當 1 用來圈大一點</td></tr>\n        <tr><td>Glitch／hazard</td><td>組合邏輯各路徑延遲不同，輸入變化時輸出短暫跳出錯誤脈衝。靜態 hazard 可以在卡諾圖上多圈一個「跨接」的冗餘項消除</td></tr>\n      </tbody></table></div>",
          "anchor": "m01-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼同步設計都只在時脈邊緣取樣？</b>組合邏輯輸出在變化過程中會有毛刺，只要所有毛刺在下一個邊緣前平息，flip-flop 只在邊緣「看一眼」，就完全看不到它們。這讓設計者只要管「一個週期內算不算得完」，不必管每條路徑的瞬間波形。</li>\n        <li><b>為什麼 FPGA 常用 one-hot，ASIC 常用 binary？</b>FPGA flip-flop 很多，邏輯是查表（LUT），one-hot 每個狀態的判斷只看一個 bit，下一狀態邏輯淺、跑得快；ASIC 面積錢多，binary 用最少暫存器。合成工具通常會自動重新編碼，可在報告裡看到它選了什麼。</li>\n        <li><b>Mealy 比 Moore 快一拍，為什麼不全部用 Mealy？</b>Mealy 輸出是輸入經過組合邏輯直接出去，輸入有毛刺或剛好在時脈附近變化，輸出就跟著抖，而且這條組合路徑會串進下一級的時序裡。要送出晶片或跨模組的控制訊號，常改用 Moore 或把 Mealy 輸出再打一拍（registered output）。</li>\n        <li><b>為什麼卡諾圖要用 Gray 順序排？</b>相鄰格必須只差一個變數，圈起來時那個變數才會被消掉（A·B + A·B' = A）。照 00、01、10、11 排，01 和 10 相鄰卻差兩個變數，就圈不起來。</li>\n        <li><b>為什麼 FSM 一定要有 default 或回到 idle 的路？</b>binary 編碼 3 個狀態用 2 bit，有 1 個沒用到的編碼；one-hot 更多非法組合。被雜訊、亞穩態或上電初值打到非法狀態時，沒有回歸路徑就永遠卡死。高可靠設計會用合成屬性要求「safe FSM」（偵測非法狀態並回復）。</li>\n      </ul>",
          "anchor": "m01-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>FSM 偶發卡死，reset 後恢復</td><td>落入未定義的狀態編碼，case 沒有 default／沒有回 idle 的轉移；或外部非同步輸入沒同步就進 FSM</td><td>補 default 回 idle、輸入先過同步器、需要時開 safe FSM 選項</td></tr>\n        <tr><td>FSM 輸出控制的訊號偶爾出現極短的毛刺</td><td>輸出是組合邏輯（Mealy 或 binary 狀態解碼），解碼時多個 bit 同時變化</td><td>輸出改成暫存器輸出（多打一拍或 Moore 加 one-hot）；當作時脈或非同步 reset 用的訊號一定要從 flip-flop 直接出</td></tr>\n        <tr><td>合成後狀態暫存器數量跟 RTL 不同</td><td>合成工具自動重新編碼（例如 binary 改 one-hot）</td><td>正常現象；要固定編碼時加合成屬性（例如 fsm_encoding），除錯時看合成報告的編碼對照表</td></tr>\n        <tr><td>同一個條件在面板端驅動（例如 TCON 的 gate 時序 FSM）偶爾晚一拍</td><td>Moore 本來就晚一拍，或輸入多經過一級同步器</td><td>畫出時序圖對齊；要提前就改 Mealy 再打一拍，或把判斷條件往前一個狀態</td></tr>\n        <tr><td>卡諾圖化簡的結果模擬對、但量到毛刺</td><td>只取最少項，留下靜態 hazard</td><td>同步電路裡下一級只在邊緣取樣通常不影響；若輸出直接當非同步控制，就補冗餘項或改暫存器輸出</td></tr>\n      </tbody></table></div>",
          "anchor": "m01-l3"
        }
      ]
    },
    {
      "id": "M02",
      "anchor": "m02",
      "tag": "M02",
      "name": "Clock／Reset 與 CDC",
      "sub": "同步器、亞穩態",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>兩個沒有固定相位關係的時脈之間，訊號遲早會落進 setup／hold 視窗，造成<b>亞穩態</b>；我們沒辦法消滅它，只能用同步器<b>多給它時間落定</b>，再用正確的結構確保多 bit 不會拆散。</p>\n<figure>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" viewBox=\"0 0 900 185\" role=\"img\" aria-label=\"reset 同步器\" style=\"min-width:640px\">\n          <defs><marker id=\"ahR\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n          <text x=\"10\" y=\"18\" class=\"t-strong\">reset 同步器：非同步拉起、同步放開（低有效 rst_n）</text>\n          <line class=\"ln-accent\" x1=\"90\" y1=\"38\" x2=\"555\" y2=\"38\"></line>\n          <line class=\"ln-accent\" x1=\"335\" y1=\"38\" x2=\"335\" y2=\"50\"></line><line class=\"ln-accent\" x1=\"555\" y1=\"38\" x2=\"555\" y2=\"50\"></line>\n          <text x=\"10\" y=\"42\" class=\"t-accent\">rst_n</text><text x=\"10\" y=\"60\" class=\"t-small\">外部、非同步</text>\n          <rect class=\"bx\" x=\"250\" y=\"50\" width=\"110\" height=\"84\" rx=\"4\"></rect><text x=\"318\" y=\"66\" class=\"t-small\">CLR</text><text x=\"258\" y=\"90\" class=\"t-small\">D</text><text x=\"344\" y=\"90\" class=\"t-small\">Q</text><text x=\"286\" y=\"112\" class=\"t-strong\">FF1</text><text x=\"258\" y=\"124\" class=\"t-small\">clk</text>\n          <rect class=\"bx-accent\" x=\"470\" y=\"50\" width=\"110\" height=\"84\" rx=\"4\"></rect><text x=\"538\" y=\"66\" class=\"t-small\">CLR</text><text x=\"478\" y=\"90\" class=\"t-small\">D</text><text x=\"564\" y=\"90\" class=\"t-small\">Q</text><text x=\"506\" y=\"112\" class=\"t-strong\">FF2</text><text x=\"478\" y=\"124\" class=\"t-small\">clk</text>\n          <text x=\"140\" y=\"90\" class=\"t-small\">固定接 1</text>\n          <line class=\"ln-fg\" x1=\"200\" y1=\"86\" x2=\"250\" y2=\"86\" marker-end=\"url(#ahR)\"></line>\n          <line class=\"ln-fg\" x1=\"360\" y1=\"86\" x2=\"470\" y2=\"86\" marker-end=\"url(#ahR)\"></line>\n          <line class=\"ln-fg\" x1=\"580\" y1=\"86\" x2=\"660\" y2=\"86\" marker-end=\"url(#ahR)\"></line>\n          <text x=\"668\" y=\"82\" class=\"t-accent\">rst_n_sync</text><text x=\"668\" y=\"100\" class=\"t-small\">給整個時脈域使用</text>\n          <line class=\"ln\" x1=\"120\" y1=\"152\" x2=\"455\" y2=\"152\"></line>\n          <line class=\"ln\" x1=\"235\" y1=\"152\" x2=\"235\" y2=\"120\"></line><line class=\"ln\" x1=\"235\" y1=\"120\" x2=\"250\" y2=\"120\"></line>\n          <line class=\"ln\" x1=\"455\" y1=\"152\" x2=\"455\" y2=\"120\"></line><line class=\"ln\" x1=\"455\" y1=\"120\" x2=\"470\" y2=\"120\"></line>\n          <text x=\"84\" y=\"156\" class=\"t-small\">clk</text>\n          <text x=\"500\" y=\"156\" class=\"t-small\">rst_n 拉低 → 兩顆立刻清 0（不等時脈）</text>\n          <text x=\"500\" y=\"176\" class=\"t-small\">rst_n 放開 → 1 要經過兩個 clk 邊緣才傳到輸出</text>\n        </svg>\n      </div>\n      <figcaption>拉起（進入 reset）不需要時脈，時脈還沒起來也能 reset；放開時兩級 flip-flop 就是一個同步器，保證整個時脈域在同一個邊緣離開 reset。</figcaption>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>時脈域（clock domain）</td><td>由同一個時脈（或同源、固定相位關係的時脈）驅動的一群 flip-flop。不同源的時脈之間就是非同步</td></tr>\n        <tr><td>CDC</td><td>Clock Domain Crossing：訊號從一個時脈域被另一個時脈域取樣</td></tr>\n        <tr><td>亞穩態（metastability）</td><td>flip-flop 在 setup／hold 視窗內取樣到變化中的資料，輸出卡在中間電位或振盪，經過一段<b>不確定</b>的時間才落到 0 或 1，而且落到哪邊也不確定</td></tr>\n        <tr><td>雙級同步器（2-FF synchronizer）</td><td>目的時脈域連續兩顆 flip-flop，中間不接任何邏輯。第一級可能亞穩態，給它一整個週期落定，第二級才拿去用。高速或高可靠時用三級</td></tr>\n        <tr><td>MTBF</td><td>平均多久會失敗一次。同步器失敗機率隨「可用的落定時間」<b>指數下降</b>，常見形式為 MTBF = e<sup>t<sub>r</sub>/τ</sup> ／（T<sub>0</sub> × f<sub>clk</sub> × f<sub>data</sub>），τ、T<sub>0</sub> 是製程與 flip-flop 的特性</td></tr>\n        <tr><td>同步 vs 非同步 reset</td><td>同步 reset：只在時脈邊緣生效，像一般資料輸入；非同步 reset：直接接到 flip-flop 的 CLR／PRE 腳，不等時脈立刻生效</td></tr>\n        <tr><td>Recovery／removal</td><td>非同步 reset 的「setup／hold」：reset 放開的那一刻離時脈邊緣要夠遠，否則一樣可能亞穩態</td></tr>\n        <tr><td>時脈閘控（clock gating）</td><td>模組閒置時把時脈關掉，flip-flop 不翻轉，省動態功耗。ASIC 用整合閘控單元 ICG（latch＋AND）避免毛刺</td></tr>\n        <tr><td>Clock enable</td><td>時脈一直在跑，只用 enable 讓 flip-flop 選擇「保持舊值」。功能等效閘控，但不碰時脈樹，FPGA 標準作法</td></tr>\n        <tr><td>Gray code</td><td>相鄰數字只差 1 bit 的編碼，binary 轉 Gray：<code>g = b ^ (b &gt;&gt; 1)</code></td></tr>\n        <tr><td>非同步 FIFO</td><td>寫端、讀端各用自己的時脈，中間是 dual-port RAM；讀寫指標轉成 Gray 後跨域同步，用來判斷空／滿</td></tr>\n        <tr><td>ASYNC_REG（AMD／Xilinx）</td><td>標在同步器 flip-flop 上的屬性：placer 會把它們放在同一個 slice 縮短走線（拉高 MTBF）、模擬時違反時序不輸出 X、可用 report_synchronizer_mtbf 報告</td></tr>\n      </tbody></table></div>",
          "anchor": "m02-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼不能「消除」亞穩態，只能降低機率？</b>flip-flop 內部是兩個反相器互鎖，取樣到中間電位時它停在不穩定的平衡點，靠雜訊推一把才倒向一邊，倒下所需時間沒有上限，只是越久越不可能。所以同步器的設計目標是 MTBF 長到遠超產品壽命，不是零。</li>\n        <li><b>為什麼多一級同步器差那麼多？</b>MTBF 對落定時間是<b>指數</b>關係，多一級等於多給一整個週期，MTBF 會乘上一個非常大的倍數。反過來，時脈頻率越高、可用時間越短、MTBF 掉得越快，所以高速設計常用三級。兩級之間走線越短越好（這就是 ASYNC_REG 要把它們放一起的原因）。</li>\n        <li><b>為什麼多 bit 不能每個 bit 各自同步？</b>每個 bit 的同步器各自決定「這拍看到新值還是舊值」，結果可能一半新一半舊，出現一個<b>從來沒存在過的值</b>（見主圖第 3 種）。Gray code 每次只變 1 bit，最壞只是晚一拍看到新值，不會看到錯值；任意資料就只能用 handshake 或 FIFO，讓資料在被取樣時保持不動。</li>\n        <li><b>為什麼 reset 要「非同步拉起、同步放開」？</b>拉起用非同步，時脈還沒穩、PLL 還沒鎖時也能讓電路進入已知狀態；放開若也非同步，reset 解除那一刻離時脈邊緣太近，就違反 recovery／removal，部分 flip-flop 這拍醒、部分下拍醒，FSM 一起步就錯。每個時脈域各放一個 reset 同步器。</li>\n        <li><b>為什麼不能用 AND 閘直接閘控時脈？</b>enable 在時脈為高時變化，AND 輸出會切出一段很窄的時脈脈衝（glitch），下游 flip-flop 可能多觸發一次。ICG 用一個在時脈低電位時透明的 latch 先鎖住 enable，保證 enable 只在時脈為低時改變。FPGA 上用 LUT 閘控時脈還會讓時脈離開專用時脈網路，skew 失控，所以用 clock enable 或專用的時脈 buffer（如 BUFGCE）。</li>\n        <li><b>快時脈的脈衝為什麼過不去？</b>來源端一拍寬的脈衝，可能剛好落在慢時脈兩個邊緣之間，慢時脈根本沒看到。作法是把脈衝轉成準位翻轉（toggle），過去後用前後兩拍 XOR 還原成脈衝；或回 ack 確認收到才能送下一個。</li>\n        <li><b>顯示驅動 IC 哪裡有 CDC？</b>主機透過 I²C／SPI 寫設定暫存器（SCL／SCLK 時脈域），內部時序電路跑在內部振盪器時脈；高速介面收資料的恢復時脈與內部 pixel／line 時脈也不同源，中間常放非同步 FIFO 或 line buffer。暫存器設定通常用「影子暫存器＋在 frame／VSYNC 邊界一次更新」，本質就是 MCP 加同步一個 load 訊號。</li>\n      </ul>",
          "anchor": "m02-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>上板幾小時才偶發一次錯，模擬永遠過、換一台板子頻率不同</td><td>CDC 沒同步或同步器 MTBF 不夠；RTL 模擬沒有亞穩態，看不出來</td><td>跑 CDC 檢查工具（Vivado report_cdc、商用 CDC 工具）、補同步器、標 ASYNC_REG、必要時改三級</td></tr>\n        <tr><td>跨域的設定值偶爾讀到「不在任何合法設定裡」的值</td><td>多 bit 匯流排每 bit 各自同步，被拆散</td><td>改 handshake／MCP：資料先穩定，只同步一個 load 或 valid；或在 frame 邊界一次更新影子暫存器</td></tr>\n        <tr><td>非同步 FIFO 偶爾溢位或讀到舊資料</td><td>指標沒轉 Gray 就跨域、Gray 指標在跨域前經過組合邏輯（又產生毛刺）、深度不夠</td><td>Gray 指標由暫存器直接輸出再進同步器；深度依突發量計算；約束用 set_max_delay -datapath_only 控制 Gray 匯流排的走線偏差</td></tr>\n        <tr><td>上電後某一顆晶片偶爾初始化失敗，重新 reset 就好</td><td>reset 非同步放開，違反 recovery／removal；或 reset 放開時 PLL 還沒鎖定</td><td>加 reset 同步器、reset 放開條件加上 PLL locked、多個時脈域依序放開</td></tr>\n        <tr><td>同一個跨域訊號到兩個模組，兩邊動作差一拍</td><td>同一個訊號在目的端被兩組同步器分別同步（reconvergence），各自落定時間不同</td><td>只同步一次，同步後的結果再扇出給所有使用者</td></tr>\n        <tr><td>快時脈送出的觸發脈衝，慢時脈偶爾沒收到</td><td>脈衝寬度小於慢時脈週期，被取樣漏掉</td><td>toggle 同步＋XOR 還原，或 req／ack handshake；脈衝間隔要大於往返同步延遲</td></tr>\n        <tr><td>FPGA 上自己用 LUT 做時脈閘控後，時序報告一片紅、偶發多觸發</td><td>閘控後的時脈走一般繞線，skew 很大，且有毛刺</td><td>改成 clock enable，或用專用時脈 buffer 的 enable（BUFGCE 一類）</td></tr>\n      </tbody></table></div>",
          "anchor": "m02-l3"
        }
      ]
    },
    {
      "id": "M03",
      "anchor": "m03",
      "tag": "M03",
      "name": "Verilog／RTL 撰寫",
      "sub": "可合成寫法",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>RTL 不是程式，是在<b>描述硬體</b>：時序區塊用 <code>&lt;=</code> 描述 flip-flop、組合區塊用 <code>=</code> 並且每條路都要給值；寫得模擬器和合成器理解成同一個電路，才不會「模擬過、上板壞」。</p>\n<p class=\"codecap\">① blocking（=）vs non-blocking（&lt;=）：同樣想做兩級移位暫存器</p>\n<pre><code>// 錯：blocking，q1 立刻變成 d，下一行讀到的是「新的」q1\nalways @(posedge clk) begin\n  q1 = d;\n  q2 = q1;     // q2 也等於 d → 合成出來只剩一級\nend\n\n// 對：non-blocking，右邊全部先取「邊緣前的舊值」，最後一起更新\nalways @(posedge clk) begin\n  q1 &lt;= d;\n  q2 &lt;= q1;    // 兩級，順序對調也一樣\nend\n\n// 錯：兩個 always 用 blocking 互相讀 → 誰先執行由模擬器決定（race）\nalways @(posedge clk) a = b;\nalways @(posedge clk) b = a;   // 改成 &lt;= 就是乾淨的交換</code></pre>\n<p class=\"codecap\">② 不完整的 if／case 生出 latch</p>\n<pre><code>// 錯：sel = 0 時 y 沒被指定 → 硬體要「記住舊值」→ 合成出 latch\nalways @* begin\n  if (sel) y = a;\nend\n\n// 對：開頭先給預設值（或補 else）\nalways @* begin\n  y = 1'b0;\n  if (sel) y = a;\nend\n\n// 錯：case 沒列完又沒有 default，nxt 在 2'd2、2'd3 時要保持 → latch\nalways @* begin\n  case (st)\n    2'd0: nxt = 2'd1;\n    2'd1: nxt = 2'd2;\n  endcase\nend\n// 對：開頭 nxt = st;（或補 default: nxt = 2'd0;）</code></pre>\n<p class=\"codecap\">③ 可合成 vs 只能在 testbench 用</p>\n<pre><code>// 只能模擬：#延遲、時脈產生、印訊息、亂數，合成器會忽略或報錯\ninitial begin rst_n = 0; #100 rst_n = 1; end\nalways #5 clk = ~clk;\ninitial $display(\"start\");\n\n// 錯：敏感清單漏了 b → 模擬時 b 變了 y 不更新，合成卻是普通 AND 閘\nalways @(a) y = a &amp; b;\n// 對：always @*（SystemVerilog 用 always_comb）\n\n// 可合成：固定次數的 for，會展開成平行的硬體（不是「跑迴圈」）\nalways @* begin\n  cnt = 4'd0;\n  for (i = 0; i &lt; 8; i = i + 1) cnt = cnt + din[i];\nend</code></pre>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>RTL</td><td>Register Transfer Level：描述「暫存器之間的資料怎麼在每個時脈搬動與運算」</td></tr>\n        <tr><td>Blocking（<code>=</code>）</td><td>依序執行，這一行做完下一行才看得到新值。用在組合邏輯</td></tr>\n        <tr><td>Non-blocking（<code>&lt;=</code>）</td><td>同一時間步內，右邊先全部取值，最後一起更新左邊。用在時序邏輯（flip-flop）</td></tr>\n        <tr><td><code>always @(posedge clk)</code></td><td>描述 flip-flop；加 <code>or negedge rst_n</code> 是非同步 reset</td></tr>\n        <tr><td><code>always @*</code>／<code>always_comb</code></td><td>描述組合邏輯，自動把所有讀到的訊號放進敏感清單</td></tr>\n        <tr><td>always_ff／always_latch</td><td>SystemVerilog 的意圖標記：工具會檢查 always_ff 裡真的是 flip-flop、always_comb 裡沒有 latch</td></tr>\n        <tr><td>Latch 誤生成（inferred latch）</td><td>組合區塊裡某條路徑沒有給輸出值，合成器只好用 latch 保持舊值</td></tr>\n        <tr><td>可合成子集</td><td>合成器看得懂、能對應成硬體的寫法。<code>#</code> 延遲、<code>$display</code>、fork／join、無界迴圈、浮點等只能模擬</td></tr>\n        <tr><td>Lint</td><td>不跑模擬的靜態檢查：latch、寬度不符、未接的腳、多重驅動、敏感清單不完整（Verilator --lint-only、商用 lint）</td></tr>\n        <tr><td>參數化（parameter／generate）</td><td>用參數控制寬度與數量，generate 依參數長出多份硬體</td></tr>\n      </tbody></table></div>",
          "anchor": "m03-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼時序區塊要用 &lt;=？</b>真實硬體裡所有 flip-flop 在同一個邊緣「同時」取樣舊值、同時更新。non-blocking 正好模擬這件事，所以結果和寫的先後順序無關；blocking 讓前一行的新值馬上被後一行看到，結果隨順序改變，兩個 always 之間還會出現模擬器決定先後的 race。</li>\n        <li><b>為什麼組合區塊反而用 =？</b>組合邏輯是一層層算下去的（先算 t、再用 t 算 y），blocking 才會在同一次執行內得到最終值。組合區塊用 &lt;= 會讓中間變數晚一個 delta 更新，模擬要多跑幾輪，敏感清單不完整時還會算錯。</li>\n        <li><b>為什麼 latch 是壞事？</b>不是 latch 本身有罪，而是「你沒打算要它」：它是準位觸發，時序分析難做、毛刺會穿過去，FPGA 上也沒有好的 latch 資源。看到合成報告出現 inferred latch，九成是組合區塊漏了 else／default。</li>\n        <li><b>為什麼模擬和合成會不一致？</b>模擬器照程式碼語意跑，合成器照「這段在描述什麼硬體」去生電路。敏感清單不完整、initial 給初值（ASIC 沒有）、<code>#</code> 延遲、<code>===</code> 比對 X、full_case／parallel_case 這類只給合成器看的指示，都會讓兩邊看到不同電路。所以合成後要跑 gate-level 模擬或等價性檢查。</li>\n        <li><b>為什麼 for 迴圈要小心？</b>它不是「跑 8 次」，是「複製 8 份硬體」。迴圈裡放乘法器或大比較器，面積和時序立刻爆掉；需要依序處理的，要改成 FSM 每拍處理一筆。</li>\n        <li><b>AI 幫忙寫 RTL 要看什麼？</b>AI 很容易寫出「軟體味」的 Verilog：組合區塊漏預設值、時序區塊用 =、把 for 當迴圈、跨時脈直接接。讓 AI 產生後，至少跑一次 lint 與合成，看 latch／多重驅動警告，再審跨時脈的每一條線。</li>\n      </ul>",
          "anchor": "m03-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>RTL 模擬正確，合成後（gate-level）或上板結果不同</td><td>敏感清單不完整、依賴 initial 初值、用了只給合成器的 full_case／parallel_case</td><td>改 always @*／always_comb、用 reset 給初值、跑 gate-level 模擬或等價性檢查</td></tr>\n        <tr><td>合成報告出現 inferred latch 警告</td><td>組合區塊 if 缺 else、case 缺 default，或某個輸出只在部分分支被指定</td><td>區塊開頭給所有輸出預設值；改用 always_comb 讓工具直接報錯</td></tr>\n        <tr><td>移位暫存器少了一級，或換行順序結果就變</td><td>時序區塊用了 blocking</td><td>時序區塊一律 &lt;=、組合區塊一律 =，同一個 always 不混用</td></tr>\n        <tr><td>模擬時某訊號是 X，或 lint 報多重驅動</td><td>同一個變數在兩個 always 裡被指定</td><td>每個訊號只在一個 always 裡指定</td></tr>\n        <tr><td>加了一個看似簡單的 for 迴圈後，資源暴增、時序過不了</td><td>迴圈被展開成大量平行硬體</td><td>確認迴圈次數與內容；改成 pipeline 或 FSM 分多拍處理</td></tr>\n        <tr><td>寬度不同的訊號相加，結果高位被截掉或符號錯</td><td>Verilog 依上下文決定運算寬度，signed 與 unsigned 混用時整個運算變 unsigned</td><td>明確寫出寬度、用 $signed()、開 lint 的寬度警告</td></tr>\n      </tbody></table></div>",
          "anchor": "m03-l3"
        }
      ]
    },
    {
      "id": "M04",
      "anchor": "m04",
      "tag": "M04",
      "name": "FPGA 開發流程",
      "sub": "時序與約束",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>RTL 加上<b>約束檔</b>，經過合成（變成 LUT／FF／BRAM／DSP）、實作（擺放與繞線）、產生 bitstream；每一步都要看報告：<b>資源用了多少、時序 slack 是不是都 ≥ 0、約束有沒有漏</b>。</p>\n<figure>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" viewBox=\"0 0 900 290\" role=\"img\" aria-label=\"FPGA 流程與 slack\" style=\"min-width:640px\">\n          <defs><marker id=\"ahF2\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n          <rect class=\"bx\" x=\"0\" y=\"20\" width=\"120\" height=\"56\" rx=\"6\"></rect><text x=\"12\" y=\"44\" class=\"t-strong\">RTL＋XDC</text><text x=\"12\" y=\"64\" class=\"t-small\">程式碼與約束</text>\n          <rect class=\"bx\" x=\"148\" y=\"20\" width=\"120\" height=\"56\" rx=\"6\"></rect><text x=\"160\" y=\"44\" class=\"t-strong\">合成</text><text x=\"160\" y=\"64\" class=\"t-small\">變成元件網表</text>\n          <rect class=\"bx\" x=\"296\" y=\"20\" width=\"120\" height=\"56\" rx=\"6\"></rect><text x=\"308\" y=\"44\" class=\"t-strong\">擺放 place</text><text x=\"308\" y=\"64\" class=\"t-small\">決定位置</text>\n          <rect class=\"bx\" x=\"444\" y=\"20\" width=\"120\" height=\"56\" rx=\"6\"></rect><text x=\"456\" y=\"44\" class=\"t-strong\">繞線 route</text><text x=\"456\" y=\"64\" class=\"t-small\">接線、修 hold</text>\n          <rect class=\"bx\" x=\"592\" y=\"20\" width=\"120\" height=\"56\" rx=\"6\"></rect><text x=\"604\" y=\"44\" class=\"t-strong\">bitstream</text><text x=\"604\" y=\"64\" class=\"t-small\">燒進 FPGA</text>\n          <rect class=\"bx-accent\" x=\"740\" y=\"20\" width=\"150\" height=\"56\" rx=\"6\"></rect><text x=\"752\" y=\"44\" class=\"t-strong\">上板驗證</text><text x=\"752\" y=\"64\" class=\"t-small\">ILA 抓內部訊號</text>\n          <line class=\"ln\" x1=\"122\" y1=\"48\" x2=\"146\" y2=\"48\" marker-end=\"url(#ahF2)\"></line><line class=\"ln\" x1=\"270\" y1=\"48\" x2=\"294\" y2=\"48\" marker-end=\"url(#ahF2)\"></line>\n          <line class=\"ln\" x1=\"418\" y1=\"48\" x2=\"442\" y2=\"48\" marker-end=\"url(#ahF2)\"></line><line class=\"ln\" x1=\"566\" y1=\"48\" x2=\"590\" y2=\"48\" marker-end=\"url(#ahF2)\"></line>\n          <line class=\"ln\" x1=\"714\" y1=\"48\" x2=\"738\" y2=\"48\" marker-end=\"url(#ahF2)\"></line>\n          <text x=\"148\" y=\"98\" class=\"t-small\">報告：資源使用率、latch</text>\n          <text x=\"296\" y=\"98\" class=\"t-small\">報告：時序（估計）</text>\n          <text x=\"444\" y=\"98\" class=\"t-small\">報告：最終時序 WNS／WHS</text>\n\n          <text x=\"10\" y=\"140\" class=\"t-strong\">setup slack＝要求時間 − 到達時間</text>\n          <line class=\"ln-fg\" x1=\"60\" y1=\"240\" x2=\"860\" y2=\"240\"></line>\n          <line class=\"ln-accent\" x1=\"60\" y1=\"170\" x2=\"60\" y2=\"250\"></line><text x=\"20\" y=\"268\" class=\"t-small\">launch 邊緣</text>\n          <line class=\"ln-accent\" x1=\"780\" y1=\"170\" x2=\"780\" y2=\"250\"></line><text x=\"736\" y=\"268\" class=\"t-small\">capture 邊緣</text>\n          <rect class=\"bx-soft\" x=\"60\" y=\"178\" width=\"60\" height=\"24\"></rect><text x=\"66\" y=\"195\" class=\"t-small\">t<tspan font-size=\"9\">co</tspan></text>\n          <rect class=\"bx\" x=\"120\" y=\"178\" width=\"200\" height=\"24\"></rect><text x=\"130\" y=\"195\" class=\"t-small\">邏輯延遲（LUT 層數）</text>\n          <rect class=\"bx-soft\" x=\"320\" y=\"178\" width=\"290\" height=\"24\"></rect><text x=\"330\" y=\"195\" class=\"t-small\">繞線延遲（net）</text>\n          <rect class=\"bx-accent\" x=\"610\" y=\"178\" width=\"110\" height=\"24\"></rect><text x=\"620\" y=\"195\" class=\"t-small\">slack</text>\n          <rect class=\"bx\" x=\"720\" y=\"178\" width=\"60\" height=\"24\"></rect><text x=\"726\" y=\"195\" class=\"t-small\">setup</text>\n          <line class=\"ln\" x1=\"610\" y1=\"214\" x2=\"610\" y2=\"236\"></line><text x=\"560\" y=\"230\" class=\"t-small\">到達</text>\n          <line class=\"ln\" x1=\"720\" y1=\"214\" x2=\"720\" y2=\"236\"></line><text x=\"726\" y=\"230\" class=\"t-small\">要求</text>\n          <text x=\"60\" y=\"288\" class=\"t-small\">一個時脈週期（另含時脈 skew 與 uncertainty）。到達點超過要求點 → slack 為負 → 違規</text>\n        </svg>\n      </div>\n      <figcaption>時序報告的每一條路徑都是這張圖：先看 slack 正負，再看紅掉的是「邏輯太多層」還是「繞線太遠」，對策完全不同。</figcaption>\n    </figure>\n<pre><code># 約束檔（XDC，Tcl 語法）常見指令\ncreate_clock -name clk_sys -period 10.000 [get_ports clk_in]         ;# 100 MHz\nset_input_delay  -clock clk_sys 2.000 [get_ports din*]                ;# 板上外部延遲\nset_output_delay -clock clk_sys 1.500 [get_ports dout*]\n\n# 兩個不相關的時脈：告訴工具不要分析它們之間的路徑（前提：RTL 已經用同步器處理）\nset_clock_groups -asynchronous -group [get_clocks clk_sys] -group [get_clocks clk_spi]\n\n# 靜態設定暫存器：上電後就不變，不必在一個週期內到\nset_false_path -from [get_cells cfg_mode_reg*]\n\n# 多週期路徑：資料每 3 拍才用一次 → setup 放寬到 3，hold 要跟著設 N−1 = 2\nset_multicycle_path 3 -setup -from [get_cells a_reg*] -to [get_cells b_reg*]\nset_multicycle_path 2 -hold  -from [get_cells a_reg*] -to [get_cells b_reg*]\n\n# Gray 指標跨域：不要整個 false path，而是限制走線延遲\nset_max_delay -datapath_only 5.000 -from [get_cells wptr_gray_reg*] -to [get_cells wptr_sync1_reg*]</code></pre>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>合成（synthesis）</td><td>RTL → 由 FPGA 基本元件組成的網表（LUT、FF、BRAM、DSP、IO）</td></tr>\n        <tr><td>實作（implementation）</td><td>opt（最佳化）→ place（擺放）→ phys_opt（實體最佳化）→ route（繞線），最後 write_bitstream</td></tr>\n        <tr><td>LUT</td><td>查表：把任意小型真值表存起來當組合邏輯（AMD 7 系列以後是 6 輸入）。邏輯層數＝資料經過幾個 LUT</td></tr>\n        <tr><td>FF／BRAM／DSP</td><td>FF：flip-flop；BRAM：晶片上的區塊記憶體；DSP：硬體乘加器。合成報告的資源使用率以這幾類分列</td></tr>\n        <tr><td>Slack</td><td>要求時間減到達時間。正的＝有餘裕；負的＝違規</td></tr>\n        <tr><td>WNS／TNS</td><td>Worst Negative Slack：所有 setup 路徑中最差的 slack；Total Negative Slack：所有違規端點的負 slack 加總。WNS ≥ 0 才算 setup 時序收斂</td></tr>\n        <tr><td>WHS／THS</td><td>同樣的概念換成 hold：最差 hold slack、hold 違規加總</td></tr>\n        <tr><td>TPWS</td><td>時脈脈寬（pulse width）的違規加總，例如時脈對某元件太快</td></tr>\n        <tr><td>create_clock</td><td>告訴工具時脈從哪裡進來、週期多少。沒有它，工具不知道要多快，等於沒做時序分析</td></tr>\n        <tr><td>set_input_delay／set_output_delay</td><td>描述 FPGA 腳位外面那一段延遲（外部元件的 clock-to-output、板上走線），工具才能分析「從外部晶片進來」與「送到外部晶片」的 IO 路徑。沒設的 IO 埠在報告裡是 unconstrained，根本沒被檢查</td></tr>\n        <tr><td>False path</td><td>告訴工具「這條路徑不用分析」，例如上電後不變的設定、已經用同步器處理的跨域</td></tr>\n        <tr><td>Multicycle path</td><td>資料允許花 N 個週期才到，放寬 setup；hold 要另外調整（通常 N−1），否則 hold 檢查跟著移走變得太嚴</td></tr>\n        <tr><td>ILA</td><td>Integrated Logic Analyzer：燒在 FPGA 裡的邏輯分析儀，透過 JTAG 抓內部訊號波形</td></tr>\n      </tbody></table></div>",
          "anchor": "m04-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>WNS 和 TNS 一起看在看什麼？</b>WNS 告訴你最糟那條差多少，TNS 告訴你壞的面有多廣。WNS −0.1 ns、TNS −0.3 ns：只有零星幾條，改那幾條或換實作策略就好；WNS −0.1 ns、TNS −500 ns：大量路徑都差一點，通常是時脈目標太激進或整體擁塞，要從架構（pipeline）或約束下手。</li>\n        <li><b>一條違規路徑怎麼判斷該改什麼？</b>看路徑明細的邏輯延遲與繞線延遲比例、邏輯層數、扇出。<b>邏輯層數多</b> → 插 pipeline 暫存器、重寫成較淺的邏輯；<b>繞線延遲佔大半</b> → 元件放太遠或扇出太大，複製高扇出暫存器、用 floorplan、降低使用率。</li>\n        <li><b>為什麼 hold 違規通常不用自己修？</b>hold 是資料「太快」到，router 會自動繞遠一點補延遲。繞線後還有 hold 違規，通常是時脈 skew 很大（時脈走了一般繞線、或閘控時脈）或約束錯（multicycle 只設 setup 沒設 hold）。</li>\n        <li><b>為什麼 hold 違規降低時脈頻率也修不好？</b>setup 比的是「資料能不能在<b>下一個</b>邊緣前到」，週期越長越寬鬆；hold 比的是「資料會不會在<b>同一個</b>邊緣剛取樣完就被新資料蓋掉」，launch 和 capture 是同一個邊緣，公式裡沒有週期這一項，只跟最短路徑延遲與時脈 skew 有關。所以只能加延遲或降低 skew，降頻沒用。</li>\n        <li><b>為什麼不相關的時脈一定要加約束？</b>Vivado 預設把所有時脈當成有關係的同步時脈來分析，兩個不相關時脈之間會算出一個毫無意義的極小 slack，整片紅。正確作法是 RTL 先放同步器，再用 set_clock_groups -asynchronous 或 false path 排除；Gray 指標這類多 bit 跨域則用 set_max_delay -datapath_only 限制偏差。</li>\n        <li><b>為什麼約束寫錯比沒寫更危險？</b>false path 範圍下太大（用萬用字元一把抓），會把真正需要分析的同步路徑也排除，報告全綠但上板壞。約束要窄、要能說出理由；每次改完看 check_timing 與 clock interaction 報告。</li>\n        <li><b>資源使用率怎麼看？</b>看 LUT、FF、BRAM、DSP、IO、時脈資源各自的百分比，以及跟預期差多少。使用率越接近滿，place／route 越難收斂；某類資源突然暴增或暴減，往往代表合成把東西推論成另一種資源（記憶體沒推論成 BRAM 而吃掉大量 LUT），或整塊邏輯因為輸出沒接而被最佳化掉。</li>\n      </ul>",
          "anchor": "m04-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>WNS 為負，違規路徑邏輯層數很多</td><td>一個週期內要做的組合運算太多</td><td>插 pipeline 暫存器、把大比較器或加法器拆成多拍、用 DSP 內建暫存器</td></tr>\n        <tr><td>WNS 為負，違規路徑大部分是繞線延遲</td><td>高扇出訊號（reset、enable）或使用率過高導致元件分散</td><td>複製高扇出暫存器、reset 改同步或減少 reset 的暫存器、降低使用率、試不同實作策略</td></tr>\n        <tr><td>兩個時脈之間大量違規，slack 小得離譜</td><td>非同步時脈之間沒有約束，工具當同步路徑分析</td><td>確認 RTL 有同步器後，加 set_clock_groups -asynchronous 或對應約束；看 clock interaction 報告</td></tr>\n        <tr><td>時序報告全綠，但上板功能不穩</td><td>某個時脈沒有 create_clock（路徑根本沒被分析）、false path 下太廣、CDC 沒處理</td><td>跑 check_timing 找未約束的端點、縮小 false path 範圍、跑 report_cdc</td></tr>\n        <tr><td>WNS 為正，但跟外部元件（ADC、記憶體、另一顆晶片）交換資料偶爾出錯</td><td>IO 埠沒有 set_input_delay／set_output_delay，報告列為 unconstrained，IO 路徑根本沒被分析</td><td>依外部元件規格書的輸出延遲與 setup／hold、加上板上走線，補 IO 延遲約束；用 check_timing 確認沒有未約束的埠</td></tr>\n        <tr><td>資源使用率比預期少很多，功能也不見了</td><td>模組輸出沒接到頂層或 IO，合成判定沒用而整塊移除</td><td>看合成警告的「removed」訊息、確認輸出有接、除錯訊號加 mark_debug／keep 屬性</td></tr>\n        <tr><td>改了 multicycle 後出現大量 hold 違規</td><td>只設了 -setup，hold 檢查跟著移到 N−1 個週期後，變得很嚴</td><td>補 set_multicycle_path N−1 -hold</td></tr>\n      </tbody></table></div>",
          "anchor": "m04-l3"
        }
      ]
    },
    {
      "id": "M05",
      "anchor": "m05",
      "tag": "M05",
      "name": "驗證與測試自動化",
      "sub": "testbench、覆蓋率",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>好的 testbench 是<b>自我檢查</b>的：自動產生激勵、自動比對參考答案、自動統計「測到哪裡」（覆蓋率），然後每次改 code 都在回歸裡重跑一遍，人只看失敗的那幾個波形。</p>\n<figure>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" viewBox=\"0 0 900 220\" role=\"img\" aria-label=\"testbench 架構\" style=\"min-width:640px\">\n          <defs><marker id=\"ahT\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n          <rect class=\"bx\" x=\"0\" y=\"30\" width=\"140\" height=\"56\" rx=\"6\"></rect><text x=\"12\" y=\"54\" class=\"t-strong\">激勵產生</text><text x=\"12\" y=\"74\" class=\"t-small\">指定＋隨機情境</text>\n          <rect class=\"bx\" x=\"180\" y=\"30\" width=\"120\" height=\"56\" rx=\"6\"></rect><text x=\"192\" y=\"54\" class=\"t-strong\">Driver</text><text x=\"192\" y=\"74\" class=\"t-small\">轉成腳位時序</text>\n          <rect class=\"bx-accent\" x=\"340\" y=\"30\" width=\"140\" height=\"56\" rx=\"6\"></rect><text x=\"352\" y=\"54\" class=\"t-strong\">DUT</text><text x=\"352\" y=\"74\" class=\"t-small\">被測的 RTL</text>\n          <rect class=\"bx\" x=\"520\" y=\"30\" width=\"120\" height=\"56\" rx=\"6\"></rect><text x=\"532\" y=\"54\" class=\"t-strong\">Monitor</text><text x=\"532\" y=\"74\" class=\"t-small\">把腳位讀回交易</text>\n          <rect class=\"bx\" x=\"680\" y=\"30\" width=\"200\" height=\"56\" rx=\"6\"></rect><text x=\"692\" y=\"54\" class=\"t-strong\">Scoreboard</text><text x=\"692\" y=\"74\" class=\"t-small\">實際 vs 預期，自動 pass／fail</text>\n          <rect class=\"bx\" x=\"340\" y=\"130\" width=\"300\" height=\"50\" rx=\"6\"></rect><text x=\"352\" y=\"152\" class=\"t-strong\">參考模型</text><text x=\"352\" y=\"170\" class=\"t-small\">C／Python／高階模型算出預期結果</text>\n          <rect class=\"bx-soft\" x=\"0\" y=\"130\" width=\"300\" height=\"50\" rx=\"6\"></rect><text x=\"12\" y=\"152\" class=\"t-strong\">覆蓋率收集</text><text x=\"12\" y=\"170\" class=\"t-small\">code coverage＋functional coverage</text>\n          <line class=\"ln\" x1=\"142\" y1=\"58\" x2=\"178\" y2=\"58\" marker-end=\"url(#ahT)\"></line>\n          <line class=\"ln\" x1=\"302\" y1=\"58\" x2=\"338\" y2=\"58\" marker-end=\"url(#ahT)\"></line>\n          <line class=\"ln\" x1=\"482\" y1=\"58\" x2=\"518\" y2=\"58\" marker-end=\"url(#ahT)\"></line>\n          <line class=\"ln\" x1=\"642\" y1=\"58\" x2=\"678\" y2=\"58\" marker-end=\"url(#ahT)\"></line>\n          <path class=\"ln\" d=\"M70,88 L70,110 L490,110 L490,128\" marker-end=\"url(#ahT)\"></path>\n          <path class=\"ln\" d=\"M642,155 L780,155 L780,88\" marker-end=\"url(#ahT)\"></path>\n          <text x=\"10\" y=\"210\" class=\"t-small\">assertion（SVA）掛在 DUT 介面上即時檢查時序規則；以上整組在 UVM 裡分別是 sequence、driver、monitor、scoreboard。</text>\n        </svg>\n      </div>\n      <figcaption>人眼看波形只適合除錯，不適合判斷對錯；判斷對錯交給 scoreboard 與 assertion。</figcaption>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>Testbench</td><td>不會被合成的模擬環境，負責產生時脈、reset、激勵，並檢查 DUT 的輸出</td></tr>\n        <tr><td>DUT</td><td>Design Under Test：被測的設計</td></tr>\n        <tr><td>Self-checking</td><td>testbench 自己判斷對錯並印出 PASS／FAIL，不靠人看波形</td></tr>\n        <tr><td>Directed vs constrained random</td><td>指定測試：手寫特定情境；受限隨機：在合法範圍內隨機產生大量情境，用來撞出沒想到的角落</td></tr>\n        <tr><td>Assertion（SVA）</td><td>寫在設計或介面上的時序規則，例如「req 拉起後 4 拍內必須有 ack」，違反就立刻報錯</td></tr>\n        <tr><td>Code coverage</td><td>程式碼被執行到多少：line／statement、branch、condition、toggle（每個 bit 有沒有 0→1、1→0）、FSM（狀態與轉移有沒有走到）</td></tr>\n        <tr><td>Functional coverage</td><td>驗證計畫裡列的功能情境有沒有被測到，用 covergroup／coverpoint 自己定義，例如「FIFO 滿的同時又寫入」</td></tr>\n        <tr><td>波形檔</td><td>VCD（文字、通用、大）、FST（GTKWave 的壓縮格式）或各工具專屬格式；X＝未知、Z＝高阻抗</td></tr>\n        <tr><td>UVM</td><td>SystemVerilog 的標準驗證方法學與類別庫，把 testbench 拆成可重用元件</td></tr>\n        <tr><td>cocotb</td><td>用 Python 寫 testbench 的框架，掛在 Icarus、Verilator 等模擬器上跑</td></tr>\n        <tr><td>Verilator</td><td>把 Verilog／SystemVerilog 編譯成 C++／SystemC 模型再執行的開源工具，速度快，也常拿來做 lint</td></tr>\n        <tr><td>回歸測試（regression）</td><td>一整組測試（含不同亂數種子）每次改 code 或每晚自動重跑，比較結果有沒有退步</td></tr>\n      </tbody></table></div>",
          "anchor": "m05-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 code coverage 100% 還不代表驗完？</b>它只證明每一行「被執行過」，不證明「結果被檢查過」，也不知道規格裡要求但程式根本沒寫的功能（漏寫的 code 不會有覆蓋率）。所以要搭配 functional coverage：先從規格列出要測的情境，再量有沒有測到。</li>\n        <li><b>為什麼要隨機測試，又要固定種子？</b>人想得到的情境有限，隨機能撞到兩個事件剛好同時發生這種角落；但失敗時必須能重現，所以每次執行都要把種子印進 log，失敗時用同一個種子重跑。</li>\n        <li><b>波形裡的 X 該怎麼讀？</b>X 通常代表沒 reset 的暫存器、多重驅動、或某個輸入沒接。X 在模擬中會傳染，但有些寫法（if 條件是 X 時走 else）會把它「吃掉」，模擬看起來正常、硬體卻是隨機值，所以 reset 後的 X 要追到源頭。</li>\n        <li><b>零延遲 RTL 模擬看不到什麼？</b>看不到亞穩態、時序違規、繞線延遲造成的毛刺。這些要靠 CDC 檢查、時序分析與上板（ILA）。也因此「模擬過了」只證明邏輯功能，不證明能在目標頻率下穩定跑。</li>\n        <li><b>testbench 驅動輸入為什麼常在負緣或用 &lt;=？</b>若 testbench 在時脈上升緣用 blocking 改輸入，DUT 在同一個時間點取樣，誰先誰後由模擬器決定（race）。在負緣驅動、或用 non-blocking／clocking block，就和真實硬體「輸入在邊緣前已穩定」一致。</li>\n        <li><b>自動化回歸跟 Patrick 寫工具的經驗怎麼接？</b>回歸本質是「批次跑模擬 → 解析 log → 彙整 pass／fail 與覆蓋率 → 只對失敗的保留波形」。這跟用 C# 寫批次測試 harness 判讀報告是同一件事，用 CI（Jenkins、GitLab CI 一類）或 Makefile 串起來，每次 commit 跑短回歸、每晚跑完整回歸。</li>\n      </ul>",
          "anchor": "m05-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>模擬全過，上板功能錯</td><td>CDC／時序問題（RTL 模擬看不到）、模擬與合成不一致、testbench 沒檢查到那個輸出</td><td>跑 CDC 與時序報告、gate-level 模擬、用 ILA 抓實際波形回頭補測試</td></tr>\n        <tr><td>某個隨機測試偶爾失敗，重跑又過</td><td>每次種子不同，失敗情境沒記下來</td><td>log 記錄種子、失敗時用同一種子重跑並存波形；把它加進固定回歸清單</td></tr>\n        <tr><td>code coverage 卡在 90% 上不去</td><td>剩下的是錯誤處理、reset 分支、不可能到達的 default 或參數化沒用到的分支</td><td>逐條判讀：該測的補 directed test，真的到不了的寫理由後排除（waiver），不要為了數字硬灌</td></tr>\n        <tr><td>coverage 很高，客戶還是撞到 bug</td><td>只看 code coverage，沒有對規格的 functional coverage；scoreboard 沒比對該輸出</td><td>從規格書建驗證計畫，每個功能點對應 coverpoint 與檢查項</td></tr>\n        <tr><td>reset 後一些訊號一直是 X</td><td>暫存器沒 reset、多重驅動、輸入腳沒接</td><td>從 X 開始的時間點往源頭追；必要時打開 X-propagation 檢查</td></tr>\n        <tr><td>回歸一次要跑整晚，大家不想跑</td><td>每個測試都存完整波形、測試沒平行、沒有分層</td><td>預設不存波形、只在失敗時重跑存；平行執行；分成每次 commit 的快速回歸和每晚完整回歸</td></tr>\n      </tbody></table></div>",
          "anchor": "m05-l3"
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
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>這兩個</th><th>差在哪</th></tr>\n      <tr><td>Flip-flop vs latch</td><td>邊緣觸發，只在一瞬間取樣 vs 準位觸發，enable 為高整段透明（M01）</td></tr>\n      <tr><td>Moore vs Mealy</td><td>輸出只看狀態、晚一拍但乾淨 vs 輸出看狀態＋輸入、早一拍但會跟著輸入抖（M01）</td></tr>\n      <tr><td>Setup vs hold 違規</td><td>資料太慢、降頻就能解 vs 資料太快、降頻也解不了，要加延遲（M04）</td></tr>\n      <tr><td>亞穩態 vs 毛刺</td><td>flip-flop 取樣在視窗內、輸出停在中間電位 vs 組合邏輯路徑延遲不同造成的短暫錯誤脈衝（M01、M02）</td></tr>\n      <tr><td>同步 reset vs 非同步 reset</td><td>等時脈邊緣才生效、像資料 vs 不等時脈立刻生效，但放開時要同步（M02）</td></tr>\n      <tr><td>時脈閘控 vs clock enable</td><td>真的把時脈關掉、省功耗但動到時脈樹 vs 時脈照跑、只讓暫存器保持，FPGA 標準作法（M02）</td></tr>\n      <tr><td>Gray code vs handshake</td><td>只適合一次變一格的計數器／指標 vs 任意資料都行，但比較慢（M02）</td></tr>\n      <tr><td>Blocking vs non-blocking</td><td>= 依序立即更新，用在組合 vs &lt;= 同時取舊值最後一起更新，用在時序（M03）</td></tr>\n      <tr><td>False path vs multicycle path</td><td>完全不分析 vs 還要分析，只是允許 N 個週期（M04）</td></tr>\n      <tr><td>WNS vs TNS</td><td>最差那一條差多少 vs 所有違規加起來，代表範圍多廣（M04）</td></tr>\n      <tr><td>Code vs functional coverage</td><td>程式碼有沒有被執行到（工具自動量）vs 規格情境有沒有被測到（自己定義）（M05）</td></tr>\n      <tr><td>RTL 模擬 vs gate-level 模擬</td><td>驗邏輯功能、快 vs 驗合成後網表（可帶延遲），慢但抓得到模擬與合成不一致（M03、M05）</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "terms",
      "title": "英文術語",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>英文</th><th>中文</th><th>常見用法</th></tr>\n      <tr><td>Metastability</td><td>亞穩態</td><td>The first flop may go metastable when sampling an async input.</td></tr>\n      <tr><td>Synchronizer</td><td>同步器</td><td>Add a two-flop synchronizer on every single-bit crossing.</td></tr>\n      <tr><td>Clock domain crossing</td><td>跨時脈域</td><td>Run a CDC check before tape-out.</td></tr>\n      <tr><td>Reset synchronizer</td><td>reset 同步器</td><td>Assert asynchronously, deassert synchronously.</td></tr>\n      <tr><td>Clock gating</td><td>時脈閘控</td><td>Use an ICG cell instead of an AND gate for clock gating.</td></tr>\n      <tr><td>Setup／hold violation</td><td>setup／hold 違規</td><td>Hold violations are fixed by the router adding delay.</td></tr>\n      <tr><td>Slack</td><td>時序餘裕</td><td>The critical path has −0.2 ns of slack.</td></tr>\n      <tr><td>Timing closure</td><td>時序收斂</td><td>We pipelined the multiplier to reach timing closure.</td></tr>\n      <tr><td>False path</td><td>不分析路徑</td><td>Set a false path on the static configuration registers.</td></tr>\n      <tr><td>Multicycle path</td><td>多週期路徑</td><td>Remember to adjust hold when you set a multicycle path.</td></tr>\n      <tr><td>Utilization</td><td>資源使用率</td><td>LUT utilization jumped after the RAM was inferred as distributed RAM.</td></tr>\n      <tr><td>Inferred latch</td><td>誤生成的 latch</td><td>Synthesis inferred a latch because the case statement had no default.</td></tr>\n      <tr><td>Non-blocking assignment</td><td>非阻塞指定</td><td>Use non-blocking assignments in clocked always blocks.</td></tr>\n      <tr><td>Testbench</td><td>測試平台</td><td>The testbench is self-checking and reports PASS or FAIL.</td></tr>\n      <tr><td>Functional coverage</td><td>功能覆蓋率</td><td>Functional coverage shows we never hit FIFO full.</td></tr>\n      <tr><td>Regression</td><td>回歸測試</td><td>The nightly regression failed on seed 1234.</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "sources",
      "title": "出處",
      "blocks": [
        {
          "t": "html",
          "html": "<ol class=\"sources\">\n      <li><b>M01</b>　未另行上網查證，內容為數位邏輯教科書通論（組合／序向、Moore／Mealy、卡諾圖、hazard）</li>\n      <li><b>M02</b>　https://en.wikipedia.org/wiki/Metastability_(electronics) ；https://docs.amd.com/r/en-US/ug912-vivado-properties/ASYNC_REG ；https://en.wikipedia.org/wiki/Gray_code ；https://www.fpga4fun.com/CrossClockDomain2.html ；https://en.wikipedia.org/wiki/Clock_gating</li>\n      <li><b>M03</b>　未另行上網查證，內容為 Verilog 通用寫作準則</li>\n      <li><b>M04</b>　https://docs.amd.com/r/en-US/ug906-vivado-design-analysis/Report-Timing-Summary ；https://docs.amd.com/r/en-US/ug903-vivado-using-constraints/Multicycle-Paths</li>\n      <li><b>M05</b>　https://en.wikipedia.org/wiki/Code_coverage ；https://docs.cocotb.org/en/stable/ ；https://www.verilator.org/guide/latest/overview.html</li>\n      <li class=\"muted\">查證日 2026-10-02。未證實：MTBF 公式寫法（未取得一手文件，只寫成常見形式、不給數值）；Cummings 的 CDC 與 non-blocking 論文原文未能下載，「快到慢脈衝需約 1.5 倍寬」等經驗值因此不寫數字；資源使用率的經驗上限未寫數字；AMD 對 FPGA reset 的建議（盡量少用、偏同步）與 Vivado 預設把所有時脈視為相關、BUFGCE 用法為既有知識，未在本輪重新查證。</li>\n    </ol>"
        }
      ]
    }
  ],
  "css": ".kb-M pre { background: var(--soft); border-radius: 6px; padding: 12px 14px; overflow-x: auto; font-size: 13px; line-height: 1.55; margin: 10px 0; }\n.kb-M pre code { background: none; padding: 0; font-size: 13px; }\n.kb-M .codecap { font-size: 12px; color: var(--muted); margin: 14px 0 0; }\n"
}

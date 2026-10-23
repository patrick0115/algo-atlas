// 原 SemiDrill 講義(git 歷史裡的 public/semi/ 原檔)搬進百科的資料;內容是原講義的 HTML 片段,改這裡就是改講義。
import type { Book } from '../types'

export const book: Book = {
  "id": "L",
  "file": "L-bus.html",
  "title": "通訊介面與總線：晶片之間怎麼講話",
  "lead": "每種介面都在回答同一組問題：<b>幾條線？時脈誰給？怎麼知道從哪裡開始？怎麼知道對方收到了？</b>答案不同，就決定了速度、腳位數、距離和抗雜訊能力。",
  "note": "<p class=\"muted small\">對應 taxonomy L01～L04，另附 ISP（透過這些介面燒錄韌體，交叉 K01）。難度標籤：<span class=\"lv\">L1</span>是什麼　<span class=\"lv l2\">L2</span>為什麼　<span class=\"lv l3\">L3</span>出問題怎麼辦。</p>",
  "front": [
    {
      "id": "wave",
      "title": "主圖：一步一步看一個 byte 怎麼送",
      "blocks": [
        {
          "t": "widget",
          "id": "L.wave",
          "html": "<div class=\"controls\">\n      <div class=\"seg\" id=\"proto\">\n        <button data-p=\"i2c\" class=\"on\">I²C</button>\n        <button data-p=\"spi\">SPI</button>\n        <button data-p=\"uart\">UART</button>\n        <button data-p=\"can\">CAN 仲裁</button>\n      </div>\n      <label class=\"inline\" id=\"optWrap\"></label>\n    </div>\n<div class=\"stage\">\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" id=\"wv\" viewBox=\"0 0 900 250\" role=\"img\" aria-label=\"通訊波形\" style=\"min-width:640px\"></svg>\n      </div>\n      <div class=\"controls\" style=\"margin:12px 0 0\">\n        <button class=\"btn\" id=\"prev\">← 上一段</button>\n        <button class=\"btn primary\" id=\"next\">下一段 →</button>\n        <span class=\"muted small\" id=\"phase\"></span>\n      </div>\n      <div class=\"stage-info\">\n        <h3 id=\"stTitle\"></h3>\n        <p id=\"stWhat\"></p>\n      </div>\n    </div>"
        }
      ]
    },
    {
      "id": "compare",
      "title": "四種介面一張表",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th></th><th>I²C</th><th>SPI</th><th>UART</th><th>CAN</th></tr>\n      <tr><td>線數</td><td>2（SCL、SDA）</td><td>4（CS、SCLK、MOSI、MISO），每多一個 slave 多一條 CS</td><td>2（TX、RX，交叉接）</td><td>2（CAN_H、CAN_L 差動）</td></tr>\n      <tr><td>時脈</td><td>同步，master 給</td><td>同步，master 給</td><td>非同步，雙方事先約好 baud rate</td><td>非同步，靠邊緣重新同步</td></tr>\n      <tr><td>定址</td><td>7／10-bit 位址</td><td>每顆一條 CS</td><td>點對點，不定址</td><td>訊息 ID（不是節點位址）</td></tr>\n      <tr><td>確認收到</td><td>每 byte 一個 ACK</td><td>沒有</td><td>沒有（可選同位檢查）</td><td>ACK slot＋CRC</td></tr>\n      <tr><td>雙工</td><td>半雙工</td><td>全雙工</td><td>全雙工</td><td>半雙工</td></tr>\n      <tr><td>典型速度</td><td>100 k／400 k／1 MHz</td><td>數十 MHz 以上</td><td>9600～數 Mbps</td><td>最高 1 Mbps（CAN FD 資料段更快）</td></tr>\n      <tr><td>距離</td><td>板內（匯流排電容上限 400 pF）</td><td>板內、短距</td><td>TTL 板內；RS-232／RS-485 可拉長</td><td>車內數十公尺以上</td></tr>\n      <tr><td>典型用途</td><td>感測器、EEPROM、PMIC、面板 IC 設定</td><td>Flash、顯示器、ADC 等高速週邊</td><td>除錯 console、模組間通訊、燒錄</td><td>車用、工控</td></tr>\n    </tbody></table></div>"
        }
      ]
    }
  ],
  "entries": [
    {
      "id": "L01",
      "anchor": "l01",
      "tag": "L01",
      "name": "I²C／SPI",
      "sub": "板內同步匯流排",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>I²C 用 2 條線掛很多顆，靠<b>位址</b>挑對象、靠 <b>ACK</b> 確認；SPI 用更多條線換<b>速度</b>，靠 <b>CS</b> 挑對象，不確認。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 900 170\" role=\"img\" aria-label=\"I2C 開汲極與上拉電阻\">\n        <text x=\"10\" y=\"18\" class=\"t-strong\">I²C：開汲極＋上拉電阻（wired-AND）</text>\n        <line class=\"ln-fg\" x1=\"60\" y1=\"50\" x2=\"840\" y2=\"50\"></line><text x=\"10\" y=\"54\" class=\"t-small\">VDD</text>\n        <rect class=\"bx\" x=\"160\" y=\"60\" width=\"16\" height=\"40\" rx=\"2\"></rect><text x=\"182\" y=\"84\" class=\"t-small\">Rp</text>\n        <line class=\"ln-fg\" x1=\"168\" y1=\"50\" x2=\"168\" y2=\"60\"></line><line class=\"ln-fg\" x1=\"168\" y1=\"100\" x2=\"168\" y2=\"120\"></line>\n        <line class=\"ln-accent\" x1=\"60\" y1=\"120\" x2=\"840\" y2=\"120\"></line><text x=\"10\" y=\"124\" class=\"t-accent\">SDA</text>\n        <rect class=\"bx\" x=\"300\" y=\"128\" width=\"110\" height=\"34\" rx=\"6\"></rect><text x=\"312\" y=\"150\" class=\"t-small\">Master：只會拉低</text>\n        <rect class=\"bx\" x=\"480\" y=\"128\" width=\"110\" height=\"34\" rx=\"6\"></rect><text x=\"492\" y=\"150\" class=\"t-small\">Slave 0x50</text>\n        <rect class=\"bx\" x=\"660\" y=\"128\" width=\"110\" height=\"34\" rx=\"6\"></rect><text x=\"672\" y=\"150\" class=\"t-small\">Slave 0x68</text>\n        <line class=\"ln\" x1=\"355\" y1=\"120\" x2=\"355\" y2=\"128\"></line><line class=\"ln\" x1=\"535\" y1=\"120\" x2=\"535\" y2=\"128\"></line><line class=\"ln\" x1=\"715\" y1=\"120\" x2=\"715\" y2=\"128\"></line>\n        <text x=\"420\" y=\"84\" class=\"t-small\">任何一顆拉低 → 線就是 0；全部放開 → 上拉電阻把線拉回 1（SCL 同樣接法）</text>\n      </svg>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>SCL／SDA</td><td>I²C 的時脈線與資料線，都是開汲極（open-drain）＋上拉電阻</td></tr>\n        <tr><td>速度模式</td><td>Standard 100 kHz、Fast 400 kHz、Fast-mode Plus 1 MHz、High-speed 3.4 MHz（要先送 master code 才切換）。Ultra-fast 5 MHz 是推挽、單向（只能寫），跟一般 I²C 元件不相容</td></tr>\n        <tr><td>START／STOP</td><td>SCL 為高時 SDA 由高變低是 START、由低變高是 STOP。平常 SDA 只在 SCL 為低時改變</td></tr>\n        <tr><td>Repeated START</td><td>不送 STOP 直接再送一次 START，常用在「先寫暫存器位址、再讀資料」，中間不放掉匯流排</td></tr>\n        <tr><td>位址＋R/W</td><td>START 後第一個 byte：7-bit 位址＋1 bit 讀寫（0 寫、1 讀）。10-bit 位址的第一個 byte 以保留碼 11110 開頭</td></tr>\n        <tr><td>ACK／NACK</td><td>每個 byte 後第 9 個 clock，接收方把 SDA 拉低＝ACK；沒拉低＝NACK（沒人回應，或讀取端表示「不用再送了」）</td></tr>\n        <tr><td>Clock stretching</td><td>slave 還沒準備好時，把 SCL 拉住在低電位，master 要等它放開</td></tr>\n        <tr><td>SPI 四條線</td><td>CS（片選，低有效）、SCLK、MOSI（master 出 slave 入）、MISO（master 入 slave 出）。新命名 SDO／SDI、PICO／POCI</td></tr>\n        <tr><td>CPOL／CPHA</td><td>CPOL：時脈閒置是低還是高；CPHA：在第一個還是第二個邊緣取樣。組合成 mode 0～3，兩端必須一致：mode 0（CPOL 0、CPHA 0，上升緣取樣）、mode 1（0、1，下降緣）、mode 2（1、0，下降緣）、mode 3（1、1，上升緣）</td></tr>\n        <tr><td>QSPI</td><td>資料線擴成 4 條，同一個 clock 送 4 bit，常用於外接 Flash</td></tr>\n        <tr><td>I³C</td><td>I²C 的後繼標準：同樣 2 線、可以和 I²C 元件共存；SCL 改推挽、最高 12.5 MHz，支援動態位址、slave 主動發中斷（in-band interrupt）與熱插入</td></tr>\n      </tbody></table></div>",
          "anchor": "l01-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 I²C 要用開汲極？</b>很多顆共用同一條線，若用推挽，有人輸出 1、有人輸出 0 就直接短路。開汲極只會「拉低或放開」，誰拉低線就是 0，不會打架；也因此可以做 ACK、clock stretching 和多 master 仲裁。</li>\n        <li><b>上拉電阻怎麼選？</b>太大：上升靠電阻對匯流排電容充電，RC 太慢，高速模式的 rise time 規格過不了。太小：拉低時要吸的電流超過元件的 I<sub>OL</sub>，低電位壓不到 V<sub>OL</sub> 以下。所以<b>最小值由 V<sub>OL</sub>／I<sub>OL</sub> 決定，最大值由 rise time 與匯流排電容決定</b>：<code>Rp(min) = (VDD − 0.4 V) / I<sub>OL</sub></code>（Standard／Fast 的 I<sub>OL</sub> 是 3 mA）；<code>Rp(max) = t<sub>r</sub> / (0.8473 × C<sub>b</sub>)</code>，rise time 上限 Standard 1000 ns、Fast 300 ns、Fast-mode Plus 120 ns；匯流排電容上限 400 pF（Fast-mode Plus 550 pF）。</li>\n        <li><b>為什麼 I²C 慢、SPI 快？</b>I²C 的上升邊靠被動上拉，速度受 RC 限制；每 byte 還要多一個 ACK。SPI 是推挽輸出，上下都主動推，沒有協定負擔，速度只受走線和元件限制。</li>\n        <li><b>多 master 仲裁怎麼運作？</b>兩個 master 同時送，各自一邊送一邊讀 SDA。送 1 卻讀到 0 的那一方就知道有人在送 0，立刻退出。因為線是 wired-AND，贏家的資料完全沒被破壞。</li>\n        <li><b>SPI 沒有 ACK 怎麼確認？</b>協定本身不確認，要靠上層：讀回 ID 暫存器、讀回剛寫的值、或 slave 自己的狀態位元／CRC。</li>\n        <li><b>SPI 為什麼腳位會爆？</b>每多一顆 slave 就多一條 CS。腳不夠時用 daisy chain（一顆的 MISO 接下一顆的 MOSI，全部共用一條 CS）或外接解碼器。</li>\n      </ul>",
          "anchor": "l01-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>I²C 整條匯流排卡死，SDA 一直是低</td><td>master 在傳輸中途 reset，slave 還在等 clock、把 SDA 拉著不放</td><td>master 手動在 SCL 上打最多 9 個 clock，直到 SDA 放開，再送 STOP；還不放就硬體 reset slave 或斷電重開</td></tr>\n        <tr><td>SCL 被長時間拉低，master 逾時</td><td>slave clock stretching 太久，或 slave 當機抓著 SCL</td><td>master 要支援 clock stretching 並設逾時；SCL 卡死只能 reset slave</td></tr>\n        <tr><td>低電位量起來超過 0.4 V，偶發讀錯</td><td>上拉電阻太小，拉低時電流超過元件的 I<sub>OL</sub></td><td>依 Rp(min) 公式加大上拉電阻</td></tr>\n        <tr><td>400 kHz 時偶發錯誤，100 kHz 正常</td><td>上拉電阻太大或匯流排電容太大，上升太慢</td><td>示波器量 rise time、換小一點的上拉電阻、減少掛載數或走線長度、加 buffer</td></tr>\n        <tr><td>每次都收到 NACK</td><td>位址錯（7-bit 與含 R/W 的 8-bit 寫法搞混）、slave 沒上電或還在 reset、腳位接反</td><td>確認規格書寫的是 7-bit 還是 8-bit 位址、用邏輯分析儀看位址 byte、先掃描整條匯流排</td></tr>\n        <tr><td>兩顆同型號 IC 掛同一條 I²C 打架</td><td>位址相同</td><td>用位址選擇腳設成不同位址；不能改就用 I²C 多工器（mux）或分兩條匯流排</td></tr>\n        <tr><td>SPI 讀到的資料整個錯位一個 bit 或全錯</td><td>CPOL／CPHA（mode）兩端設定不一致</td><td>對照 slave 規格書的時序圖設定 mode；用邏輯分析儀看在哪個邊緣取樣</td></tr>\n        <tr><td>SPI 掛多顆 slave 時，讀值互相干擾</td><td>沒被選中的 slave 沒有把 MISO 放成高阻抗（tri-state）</td><td>換支援 tri-state 的元件，或在 MISO 加 buffer</td></tr>\n        <tr><td>SPI 資料錯了，卻完全沒有錯誤回報</td><td>SPI 協定本身沒有 ACK、沒有錯誤檢查</td><td>上層加 CRC，或寫完讀回比對</td></tr>\n        <tr><td>SPI 拉高時脈後偶發錯誤</td><td>走線長、反射或 MISO 回程延遲超過半個週期</td><td>降速、加串聯電阻抑制反射、縮短走線、使用延遲取樣設定</td></tr>\n      </tbody></table></div>",
          "anchor": "l01-l3"
        }
      ]
    },
    {
      "id": "L02",
      "anchor": "l02",
      "tag": "L02",
      "name": "UART／CAN",
      "sub": "非同步序列",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>UART 沒有時脈線，雙方<b>事先約好速度</b>，靠 start bit 對齊；CAN 是差動、多節點共用的匯流排，用<b>訊息 ID 自動仲裁</b>，ID 越小越優先。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>UART frame</td><td>閒置為高 → start bit（0）→ 5～9 個資料位元（<b>LSB 先送</b>）→ 可選的同位位元 → stop bit（1 或 2 個 1，部分 UART 支援 1.5）。常見寫法 8N1＝8 資料、無同位、1 stop</td></tr>\n        <tr><td>Baud rate</td><td>每秒傳幾個 bit。常見 9600、115200。8N1 每個 byte 要 10 bit，所以 115200 baud 約每秒 11.5 KB</td></tr>\n        <tr><td>同位（parity）</td><td>偶同位：資料加同位位元後「1」的個數是偶數。只能抓到奇數個 bit 錯</td></tr>\n        <tr><td>過取樣</td><td>接收端用 16 倍（或 8 倍）baud 的時脈取樣，找到 start bit 的下降邊後，在每個 bit 的中間取樣</td></tr>\n        <tr><td>TTL／RS-232／RS-485</td><td>同一種 frame，不同電氣層：TTL 是晶片電位（0／3.3 V，正邏輯）；RS-232 用 ±3～±15 V 且邏輯反相（1 是負電壓）；RS-485 差動、可多點（32 個單位負載）、低速時可拉到約 1200 m</td></tr>\n        <tr><td>RTS／CTS</td><td>硬體流量控制：接收端快滿時拉掉 CTS，請對方暫停</td></tr>\n        <tr><td>CAN_H／CAN_L</td><td>差動雙絞線。dominant 時 CAN_H 約 3.5 V、CAN_L 約 1.5 V；recessive 時兩條都約 2.5 V。兩端各接 120 Ω 終端電阻</td></tr>\n        <tr><td>dominant／recessive</td><td>dominant（顯性）＝0，有人驅動；recessive（隱性）＝1，沒人驅動。只要有一個節點送 0，匯流排就是 0</td></tr>\n        <tr><td>仲裁</td><td>大家同時送 ID，一邊送一邊聽；送 1 卻聽到 0 的退出。ID 小的（前面 0 多）勝出，而且勝方訊息不受影響</td></tr>\n        <tr><td>Bit stuffing</td><td>連續 5 個相同位元後強制插入 1 個相反位元，讓接收端有邊緣可以重新同步</td></tr>\n        <tr><td>錯誤處理</td><td>每個節點有發送／接收錯誤計數（TEC／REC；發送錯一次 TEC +8）。超過 127 進 error passive，TEC 超過 255 進 bus off，把壞節點踢出匯流排；之後要偵測到 128 次「11 個連續 recessive」才能恢復</td></tr>\n        <tr><td>CAN FD</td><td>仲裁段維持原速，資料段切到更高速（最高約 8 Mbps），每個 frame 資料從 8 byte 擴到 64 byte。Classic CAN 最高 1 Mbps（線長約 40 m 內）；更新的 CAN XL 到 20 Mbps</td></tr>\n      </tbody></table></div>",
          "anchor": "l02-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>UART 沒有時脈，為什麼還能收對？</b>每個 frame 都由 start bit 的下降邊重新對齊，之後只要撐 10 個 bit 不漂移太多就行。所以雙方 baud rate 的誤差<b>兩端合計</b>要控制在約 ±3.3% 以內（雜訊大的環境建議 ±2%）；誤差累積到最後一個 bit 取樣點偏出 bit 範圍就會錯。</li>\n        <li><b>為什麼 RS-485、CAN 都用差動？</b>雜訊同時打在兩條線上，接收端只看兩線的差，共模雜訊就抵消了，所以能拉得長、抗干擾。</li>\n        <li><b>為什麼 CAN 用訊息 ID 而不是節點位址？</b>車上是「廣播」思維：煞車訊號送出去，所有關心的節點都收。ID 同時代表優先權，重要訊息（ID 小）一定先送，延遲可預期。</li>\n        <li><b>為什麼要 bit stuffing？</b>CAN 沒有時脈線，接收端靠訊號邊緣重新同步。如果一直都是 0 或 1，就沒有邊緣可對齊，所以強制插入反相位元。</li>\n        <li><b>為什麼終端電阻是 120 Ω、而且兩端都要？</b>要等於雙絞線的特性阻抗，訊號到線尾才不會反射回來。只接一端或沒接，反射會讓邊緣振鈴、取樣錯誤。</li>\n      </ul>",
          "anchor": "l02-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>UART 收到亂碼</td><td>baud rate 不一致、MCU 時脈不準（例如用內部 RC 振盪器）、8N1 等格式設定不同</td><td>確認兩端設定、量測實際 bit 寬度、改用晶振或校正 RC</td></tr>\n        <tr><td>UART 完全收不到</td><td>TX／RX 沒有交叉接、電位不相容（3.3 V 接 RS-232 或 5 V）、沒有共地</td><td>TX 接對方 RX、確認電氣層、加共地線</td></tr>\n        <tr><td>長時間傳大量資料偶爾掉 byte</td><td>接收端來不及讀，FIFO 溢位（overrun）</td><td>用 DMA（讓硬體直接把資料搬進記憶體、不經過 CPU，見 <a href=\"K-firmware.html#k03\">K03</a>）或中斷接收、加大 FIFO、啟用 RTS／CTS 流量控制</td></tr>\n        <tr><td>常常出現 framing error</td><td>stop bit 位置不是 1：baud 誤差太大、雜訊，或對方送了 break</td><td>修正 baud、檢查訊號品質；若是 break 則依協定處理</td></tr>\n        <tr><td>CAN 某節點一直進入 bus off</td><td>該節點 baud 設錯、收發器壞、線路接觸不良，錯誤計數一路累積</td><td>檢查 bit timing 設定、換收發器、量 CAN_H／CAN_L 波形</td></tr>\n        <tr><td>CAN 整條匯流排通訊不穩</td><td>終端電阻缺少或多接（量 CAN_H 到 CAN_L 應約 60 Ω）、分支太長</td><td>兩端各一顆 120 Ω、縮短分支</td></tr>\n        <tr><td>CAN 節點一直重送、報 ACK error</td><td>匯流排上只有它一個節點上電（沒人回 ACK）、bit rate 不一致或線斷了</td><td>確認至少兩個節點在線、bit rate 一致、檢查佈線</td></tr>\n        <tr><td>TTL UART 直接接 PC 的 RS-232 埠，不通甚至燒腳</td><td>電壓與邏輯極性都不同</td><td>中間加 RS-232 收發器（電位轉換）</td></tr>\n      </tbody></table></div>",
          "anchor": "l02-l3"
        }
      ]
    },
    {
      "id": "L03",
      "anchor": "l03",
      "tag": "L03",
      "name": "USB",
      "sub": "列舉與傳輸",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>USB 是<b>主機主導</b>的匯流排：裝置插上後，主機先問「你是誰」（讀描述子），再分配位址、選設定，之後所有傳輸都由主機發起。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 900 120\" role=\"img\" aria-label=\"USB 列舉流程\">\n        <defs><marker id=\"ahU\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n        <rect class=\"bx\" x=\"0\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"12\" y=\"44\" class=\"t-strong\">1 插入</text><text x=\"12\" y=\"66\" class=\"t-small\">D+／D− 上拉被偵測</text>\n        <rect class=\"bx\" x=\"152\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"164\" y=\"44\" class=\"t-strong\">2 Reset</text><text x=\"164\" y=\"66\" class=\"t-small\">裝置用位址 0</text>\n        <rect class=\"bx\" x=\"304\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"316\" y=\"44\" class=\"t-strong\">3 讀描述子</text><text x=\"316\" y=\"66\" class=\"t-small\">先要 Device 描述子</text>\n        <rect class=\"bx\" x=\"456\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"468\" y=\"44\" class=\"t-strong\">4 給位址</text><text x=\"468\" y=\"66\" class=\"t-small\">Set Address</text>\n        <rect class=\"bx\" x=\"608\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"620\" y=\"44\" class=\"t-strong\">5 讀完整描述子</text><text x=\"620\" y=\"66\" class=\"t-small\">設定／介面／端點</text>\n        <rect class=\"bx-accent\" x=\"760\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"772\" y=\"44\" class=\"t-strong\">6 選設定</text><text x=\"772\" y=\"66\" class=\"t-small\">Set Configuration</text>\n        <line class=\"ln\" x1=\"132\" y1=\"52\" x2=\"150\" y2=\"52\" marker-end=\"url(#ahU)\"></line><line class=\"ln\" x1=\"284\" y1=\"52\" x2=\"302\" y2=\"52\" marker-end=\"url(#ahU)\"></line>\n        <line class=\"ln\" x1=\"436\" y1=\"52\" x2=\"454\" y2=\"52\" marker-end=\"url(#ahU)\"></line><line class=\"ln\" x1=\"588\" y1=\"52\" x2=\"606\" y2=\"52\" marker-end=\"url(#ahU)\"></line>\n        <line class=\"ln\" x1=\"740\" y1=\"52\" x2=\"758\" y2=\"52\" marker-end=\"url(#ahU)\"></line>\n        <text x=\"0\" y=\"110\" class=\"t-small\">全部走端點 0 的 control 傳輸。列舉失敗時 Windows 顯示「無法辨識的 USB 裝置」，多半卡在 3～5。</text>\n      </svg>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>速度等級</td><td>Low 1.5 Mbps、Full 12 Mbps、High 480 Mbps（USB 2.0）；USB 3.2 Gen 1 5 Gbps、Gen 2 10 Gbps、Gen 2x2 20 Gbps；USB4 40 Gbps。時脈精度要求：Full ±2500 ppm、High ±500 ppm</td></tr>\n        <tr><td>描述子（descriptor）</td><td>裝置的自我介紹，階層是 Device → Configuration → Interface → Endpoint，另有 String 描述子放文字</td></tr>\n        <tr><td>VID／PID</td><td>Device 描述子裡的廠商 ID 與產品 ID，主機靠它找驅動程式</td></tr>\n        <tr><td>端點（endpoint）</td><td>裝置上的資料緩衝區，有編號與方向（IN 進主機、OUT 出主機）。端點 0 固定用於控制</td></tr>\n        <tr><td>四種傳輸</td><td><b>Control</b>：設定與查詢；<b>Bulk</b>：大量資料、保證正確、不保證時間（隨身碟）；<b>Interrupt</b>：少量、定期輪詢（鍵盤滑鼠）；<b>Isochronous</b>：保證頻寬與時間、錯了不重送（音訊、視訊）</td></tr>\n        <tr><td>列舉（enumeration）</td><td>見上圖</td></tr>\n        <tr><td>D+／D− 上拉</td><td>裝置端用 1.5 kΩ 上拉到 3.3 V：拉 D+ 表示 Full speed，拉 D− 表示 Low speed；High speed 先以 Full speed 連上，在 reset 期間另外握手（chirp）</td></tr>\n        <tr><td>供電</td><td>VBUS 5 V；USB 2.0 列舉前只能拉 100 mA（1 個單位負載），主機讀到 Configuration 描述子裡的 bMaxPower、確認供電預算夠，Set Configuration 之後才能拉到最多 500 mA；USB 3.x 900 mA；Type-C 可宣告 1.5 A／3 A；USB PD 最高 100 W（20 V／5 A），EPR 到 240 W（48 V／5 A）</td></tr>\n        <tr><td>Type-C CC 腳</td><td>偵測插入、正反面方向、供電能力，以及 PD 協商的通道。裝置端（sink）在 CC1、CC2 各放一顆 5.1 kΩ 下拉，電源端偵測到才開 VBUS</td></tr>\n        <tr><td>Class</td><td>標準化的裝置類別，例如 HID（鍵盤滑鼠）、MSC（隨身碟）、CDC（虛擬序列埠）、UVC（攝影機），作業系統內建驅動</td></tr>\n      </tbody></table></div>",
          "anchor": "l03-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼鍵盤用 interrupt、隨身碟用 bulk、喇叭用 isochronous？</b>鍵盤資料少但要即時回應，所以定期問；隨身碟資料多、一個 bit 都不能錯，但慢一點沒關係；聲音晚到就沒用了，寧可掉一點也不能延遲重送。</li>\n        <li><b>「Interrupt 傳輸」為什麼其實是輪詢？</b>USB 裝置不能主動講話，所有傳輸都由主機發起。interrupt 傳輸是主機保證「每隔固定時間來問一次」。</li>\n        <li><b>為什麼一開始要用位址 0？</b>剛插上的裝置還沒有位址，主機一次只 reset 一個埠，所以那一刻用位址 0 跟它講話不會撞到別人，問完再分配正式位址。</li>\n        <li><b>USB 2.0 怎麼在沒有時脈線下收對？</b>D+／D− 用 NRZI 編碼（0 代表電位翻轉、1 代表不變），接收端靠翻轉重新鎖時脈；連續 6 個 1 就沒有翻轉，所以發送端強制插入一個 0（bit stuffing）。道理跟 CAN 的 bit stuffing 一樣。</li>\n        <li><b>為什麼做 USB 轉 UART（CDC）很方便？</b>CDC 是標準 class，作業系統內建驅動，插上就是一個 COM port，不用另外安裝。</li>\n      </ul>",
          "anchor": "l03-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>插上顯示「無法辨識的 USB 裝置」</td><td>列舉失敗：描述子內容錯（長度、端點設定）、晶振不準、D+／D− 走線品質差</td><td>用 USB 分析儀看卡在哪一步、檢查描述子、確認 48 MHz 時脈精度</td></tr>\n        <tr><td>本來該是 High speed，卻只跑 Full speed</td><td>chirp 握手失敗：走線阻抗不對（應為 90 Ω 差動）、經過不支援 HS 的 hub 或線材</td><td>檢查差動阻抗與走線、換線材與 hub</td></tr>\n        <tr><td>裝置插上後主機斷線、重新列舉</td><td>電流超過埠的供電能力，VBUS 掉下去</td><td>描述子要正確宣告耗電、限制突波電流、改用外接電源或 Type-C 高電流</td></tr>\n        <tr><td>音訊斷斷續續</td><td>isochronous 頻寬不夠或主機排程不到，錯的封包不會重送</td><td>降低取樣率或通道數、避免同一個控制器上有其他大頻寬裝置</td></tr>\n        <tr><td>插上完全沒反應，連列舉都沒開始</td><td>D+／D− 上拉沒接、接錯腳，或上拉電源沒電</td><td>檢查 1.5 kΩ 上拉的位置與 3.3 V</td></tr>\n        <tr><td>Type-C 裝置用 A-to-C 線可以，用 C-to-C 線就沒電</td><td>裝置的 CC 腳沒放 5.1 kΩ 下拉（或兩個 CC 共用一顆），C-to-C 的電源端不肯開 VBUS</td><td>CC1、CC2 各放一顆 5.1 kΩ</td></tr>\n        <tr><td>Windows 顯示 Code 43「裝置描述元要求失敗」</td><td>Get Descriptor 回傳失敗；或 bcdUSB 寫 2.1 以上卻沒有 BOS 描述子</td><td>抓封包看哪一步失敗；補 BOS 描述子或改 bcdUSB</td></tr>\n      </tbody></table></div>",
          "anchor": "l03-l3"
        }
      ]
    },
    {
      "id": "L04",
      "anchor": "l04",
      "tag": "L04",
      "name": "PCIe 與高速介面",
      "sub": "lane 與 SI",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>PCIe 是點對點的高速序列連線，頻寬＝<b>每 lane 速率 × lane 數</b>；速度越高，訊號完整性越決定能不能跑到那個速度。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>世代</th><th class=\"num\">每 lane 傳輸率</th><th>編碼</th><th class=\"num\">x16 單向約略頻寬</th></tr>\n        <tr><td>Gen1</td><td class=\"num\">2.5 GT/s</td><td>8b/10b</td><td class=\"num\">4 GB/s</td></tr>\n        <tr><td>Gen2</td><td class=\"num\">5 GT/s</td><td>8b/10b</td><td class=\"num\">8 GB/s</td></tr>\n        <tr><td>Gen3</td><td class=\"num\">8 GT/s</td><td>128b/130b</td><td class=\"num\">約 16 GB/s</td></tr>\n        <tr><td>Gen4</td><td class=\"num\">16 GT/s</td><td>128b/130b</td><td class=\"num\">約 32 GB/s</td></tr>\n        <tr><td>Gen5</td><td class=\"num\">32 GT/s</td><td>128b/130b</td><td class=\"num\">約 64 GB/s</td></tr>\n        <tr><td>Gen6</td><td class=\"num\">64 GT/s</td><td>PAM4＋FEC＋FLIT</td><td class=\"num\">約 121 GB/s</td></tr>\n        <tr><td>Gen7</td><td class=\"num\">128 GT/s</td><td>PAM4＋FEC＋FLIT</td><td class=\"num\">約 242 GB/s</td></tr>\n      </tbody></table></div>\n<div class=\"table-wrap\" style=\"margin-top:12px\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>lane</td><td>一組發送差動對＋一組接收差動對，全雙工。x1、x4、x8、x16 是 lane 數</td></tr>\n        <tr><td>三層</td><td>Transaction 層（TLP：讀寫請求與資料）、Data Link 層（DLLP：ACK／NAK、流量控制、重送）、Physical 層（編碼、序列化、電氣）</td></tr>\n        <tr><td>Link training（LTSSM）</td><td>上電後兩端自動協商的狀態機：Detect（偵測對方的接收端）→ Polling（位元鎖定、極性）→ Configuration（決定 lane 寬度與順序）→ L0（正常傳輸）；出錯時進 Recovery，Gen3 起在這裡做等化（equalization）</td></tr>\n        <tr><td>眼圖（eye diagram）</td><td>把很多個 bit 疊在一起看。<b>眼高</b>是電壓方向的餘裕（雜訊、損耗吃掉它）；<b>眼寬</b>是時間方向的餘裕（抖動吃掉它）。張得越開越穩</td></tr>\n        <tr><td>AC 耦合電容</td><td>每條 TX 差動線上串一顆電容（約 75～265 nF），隔掉直流，讓兩端可以各自設定自己的共模偏壓；Detect 階段也靠它偵測對方的接收端</td></tr>\n        <tr><td>Retimer／Redriver</td><td>走線太長時放大訊號：redriver 只放大，retimer 會重新取出時脈、重送乾淨的訊號</td></tr>\n      </tbody></table></div>",
          "anchor": "l04-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼從平行匯流排（PCI）改成序列（PCIe）？</b>平行匯流排幾十條線要同時到，速度一高，每條線的長度差（skew）就讓資料對不齊。序列差動對把時脈嵌在資料裡，每條 lane 各自鎖時脈，lane 之間的偏差由接收端補償，速度才能一路往上。</li>\n        <li><b>為什麼 Gen3 改用 128b/130b？</b>8b/10b 每 10 bit 只有 8 bit 是資料，浪費 20%；128b/130b 只浪費約 1.5%。Gen3 傳輸率只從 5 提到 8 GT/s，實際頻寬卻接近翻倍。</li>\n        <li><b>為什麼 Gen6 要用 PAM4？</b>再提高 NRZ 的頻率，走線損耗太大。PAM4 一個符號用 4 個電位帶 2 bit，頻率不變、資料量加倍；代價是每個電位間距變小、對雜訊更敏感，所以配 FEC 與 FLIT 模式。</li>\n        <li><b>為什麼會自動降速或降寬？</b>link training 時某個速度的眼圖不夠開、或某條 lane 訓練不過，兩端就協商到較低的速度或較少的 lane，讓系統還能動，但效能掉了。</li>\n      </ul>",
          "anchor": "l04-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>x16 的卡只跑在 x8 或 Gen3</td><td>某幾條 lane 訓練失敗（接觸、走線損傷）、插槽本身只有 x8 電氣、BIOS 設定</td><td>查 link status、換插槽、檢查 BIOS；量測失敗 lane 的訊號品質</td></tr>\n        <tr><td>高速時 correctable error 很多、偶發掉卡</td><td>訊號完整性不足：插入損耗、反射、串擾、參考時脈抖動</td><td>縮短走線、改低損耗板材、加 retimer、調整等化參數、檢查參考時脈</td></tr>\n        <tr><td>眼圖閉合</td><td>走線太長、via stub 反射、阻抗不連續</td><td>背鑽 via stub、維持差動阻抗連續、AC 耦合電容位置最佳化</td></tr>\n        <tr><td>LTSSM 卡在 Detect，主機抓不到裝置</td><td>TX 端少了 AC 耦合電容、對端沒上電，或 PERST#／參考時脈時序不對</td><td>確認耦合電容（約 75～265 nF）、檢查 PERST# 放開與 REFCLK</td></tr>\n        <tr><td>Gen4 正常，Gen5 不穩</td><td>Nyquist 頻率從 8 GHz 變 16 GHz，損耗大增；通道總損耗預算 Gen4 約 28 dB、Gen5 約 36 dB</td><td>重算損耗預算，超過就加 retimer 或改低損耗板材</td></tr>\n      </tbody></table></div>",
          "anchor": "l04-l3"
        }
      ]
    },
    {
      "id": "L-isp",
      "anchor": "isp",
      "tag": "K01×L",
      "name": "ISP：透過這些介面燒錄韌體",
      "sub": "透過介面更新韌體",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>ISP（In-System Programming）是<b>晶片已經焊在板子上</b>，透過 UART、I²C、SPI、USB 或 SWD／JTAG 把韌體寫進去，不用拆下來放燒錄器。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>ISP</td><td>在板上燒錄。常見做法是晶片內建一段 ROM bootloader，開機時依 BOOT 腳位或特定指令進入燒錄模式，從 UART／I²C／USB 接收新韌體</td></tr>\n        <tr><td>IAP（In-Application Programming）</td><td>由使用者自己的程式（自寫的 bootloader）在執行中接收新韌體、寫進 Flash，例如 OTA 更新</td></tr>\n        <tr><td>SWD／JTAG</td><td>除錯介面，也能直接寫 Flash，不需要晶片裡的 bootloader</td></tr>\n        <tr><td>進入方式</td><td>BOOT 腳位在 reset 時的電位、特定 UART 同步字元、I²C 指令、或主程式收到更新命令後跳進 bootloader</td></tr>\n      </tbody></table></div>",
          "anchor": "isp-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>ISP 和 IAP 差在哪？</b>ISP 用的是晶片廠內建、不會被改掉的 ROM bootloader，所以就算 Flash 全空也救得回來；IAP 用自己的 bootloader，彈性大（可以加密、走任何介面、做 OTA），但它本身壞了就只能靠 ISP 或 SWD 救。</li>\n        <li><b>顯示驅動 IC、PMIC 為什麼常用 I²C 更新？</b>這些 IC 本來就透過 I²C 讓主機寫設定（gamma、VCOM、時序），沿用同一條線燒錄韌體或 OTP／MTP，不用多拉腳位。</li>\n        <li><b>為什麼要防磚？</b>燒到一半斷電，Flash 裡就是半新半舊的韌體，開機跑不起來。常見作法：<b>雙 bank</b>（新韌體寫到另一半，驗證 CRC／簽章後才切換）、保留不可覆寫的 bootloader、開機失敗自動回退（fallback）。</li>\n      </ul>",
          "anchor": "isp-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>UART ISP 一直連不上</td><td>沒進到燒錄模式（BOOT 腳位電位或 reset 時序不對）、baud 自動偵測失敗、TX／RX 接反</td><td>確認 reset 時 BOOT 腳位的電位、照規格書送同步字元（例：STM32 送 0x7F、回 0x79 是 ACK，而且要用偶同位 8E1）、降 baud 再試</td></tr>\n        <tr><td>OTA 更新到一半斷電，裝置變磚</td><td>單一 bank 直接覆寫，沒有回退機制</td><td>改雙 bank＋CRC／簽章驗證後才切換；保留 ROM ISP 路徑當最後救援</td></tr>\n        <tr><td>I²C 燒錄偶發失敗、寫進去的資料驗證不過</td><td>寫 Flash 期間 IC 會 clock stretching 或暫時不回 ACK，主機沒等就送下一筆</td><td>照規格書的寫入等待時間或輪詢狀態位元，支援 clock stretching，每塊寫完讀回比對</td></tr>\n        <tr><td>燒錄完 SWD 再也連不上</td><td>韌體把 SWD 腳改成 GPIO、進入低功耗，或開啟了讀保護</td><td>拉 BOOT 腳進 ROM bootloader 重燒，或用除錯器的「reset 時連線」模式；讀保護解除通常會整片清除</td></tr>\n        <tr><td>SWD 永久連不上，怎樣都解不開</td><td>讀保護設到最高等級（例：STM32 RDP Level 2），永久關閉除錯介面</td><td>不可逆。量產前確認 option byte 設定，開發板不要設最高等級</td></tr>\n      </tbody></table></div>",
          "anchor": "isp-l3"
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
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>這兩個</th><th>差在哪</th></tr>\n      <tr><td>7-bit vs 8-bit I²C 位址</td><td>7-bit 是真正的位址；8-bit 寫法是把 R/W 也算進去（左移一位）。0x50 的 7-bit 位址，8-bit 寫成 0xA0／0xA1</td></tr>\n      <tr><td>NACK 的兩種意思</td><td>寫入時：沒人回應或對方拒收；讀取時：master 用 NACK 告訴 slave「最後一個 byte，不用再送了」</td></tr>\n      <tr><td>CPOL vs CPHA</td><td>時脈閒置電位 vs 在第幾個邊緣取樣（L01）</td></tr>\n      <tr><td>Baud rate vs bit rate</td><td>每秒幾個符號 vs 每秒幾個 bit。UART、CAN 一個符號一個 bit，兩者相同；PAM4 一個符號 2 bit</td></tr>\n      <tr><td>dominant vs recessive</td><td>0、有人驅動、會贏 vs 1、沒人驅動、會被蓋掉（L02）</td></tr>\n      <tr><td>Bulk vs Isochronous</td><td>保證正確、不保證時間 vs 保證時間、不保證正確（L03）</td></tr>\n      <tr><td>GT/s vs GB/s</td><td>每秒傳幾次「transfer」（每 lane 的原始位元率）vs 扣掉編碼後實際每秒幾個 byte。Gen6 用 PAM4，64 GT/s 的符號率其實是 32 GBaud（每個符號 2 bit）（L04）</td></tr>\n      <tr><td>ISP vs IAP</td><td>晶片內建 bootloader 燒錄 vs 自己的程式在執行中更新（ISP 段）</td></tr>\n      <tr><td>RS-232 vs TTL UART</td><td>同樣的 frame；RS-232 是正負電壓且邏輯反相，直接接 MCU 腳會燒（L02）</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "terms",
      "title": "英文術語",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>英文</th><th>中文</th><th>常見用法</th></tr>\n      <tr><td>Open-drain</td><td>開汲極</td><td>I²C lines are open-drain with pull-up resistors.</td></tr>\n      <tr><td>Pull-up resistor</td><td>上拉電阻</td><td>A 2.2 kΩ pull-up meets the 400 kHz rise time.</td></tr>\n      <tr><td>Clock stretching</td><td>時脈延展</td><td>The slave uses clock stretching during flash writes.</td></tr>\n      <tr><td>Chip select</td><td>片選</td><td>Each SPI slave needs its own chip select.</td></tr>\n      <tr><td>Baud rate</td><td>鮑率</td><td>Both sides must use 115200 baud.</td></tr>\n      <tr><td>Framing error</td><td>訊框錯誤</td><td>A baud mismatch causes framing errors.</td></tr>\n      <tr><td>Arbitration</td><td>仲裁</td><td>The lower CAN ID wins arbitration.</td></tr>\n      <tr><td>Bus off</td><td>匯流排關閉</td><td>The node went bus off after too many errors.</td></tr>\n      <tr><td>Enumeration</td><td>列舉</td><td>Enumeration failed at Get Descriptor.</td></tr>\n      <tr><td>Endpoint</td><td>端點</td><td>Endpoint 0 is reserved for control transfers.</td></tr>\n      <tr><td>Link training</td><td>連結訓練</td><td>Link training fell back to Gen3 x8.</td></tr>\n      <tr><td>Eye diagram</td><td>眼圖</td><td>The eye is closed at 32 GT/s.</td></tr>\n      <tr><td>In-System Programming</td><td>線上燒錄</td><td>Update the firmware via UART ISP.</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "sources",
      "title": "出處",
      "blocks": [
        {
          "t": "html",
          "html": "<ol class=\"sources\" id=\"srcList\"><li><b>L01</b>　https://i2c-bus.org/fast-mode-plus ；TI SLVA689（I²C 上拉電阻計算）；TI SBAA565（I²C 速度模式）；https://totalphase.com/support/articles/200349176-7-bit-8-bit-and-10-bit-i2c-slave-addressing ；https://en.wikipedia.org/wiki/Serial_Peripheral_Interface ；https://oshwa.org/resources/a-resolution-to-redefine-spi-signal-names/ ；cnx-software（MIPI I3C）</li>\n      <li><b>L02</b>　https://en.wikipedia.org/wiki/Universal_asynchronous_receiver-transmitter ；https://www.analog.com/en/technical-articles/determining-clock-accuracy-requirements-for-uart-communications.html ；https://en.wikipedia.org/wiki/CAN_bus ；ST TN1367（CAN bus off 恢復）；https://blog.microcontrol.net/en/can-bus-troubleshooting/</li>\n      <li><b>L03</b>　https://www.beyondlogic.org/usbnutshell/usb2.shtml （速度、上拉、供電）；beyondlogic usb4／usb5（傳輸類型、描述子）；Microsoft Learn（USB 列舉流程）；TI SLYY228（USB Type-C／PD）；Plugable（Type-C CC 與 Code 43）</li>\n      <li><b>L04</b>　https://en.wikipedia.org/wiki/PCI_Express ；Cadence（PCIe 6.0 FLIT）；Granite River Labs（link equalization）；TI SNLA426（通道損耗預算與眼圖）；All About Circuits（redriver vs retimer）</li>\n      <li><b>ISP</b>　https://stm32world.com/wiki/STM32_Boot_Modes ；ST AN3155（STM32 USART bootloader 協定）；Arm Keil forum（ISP vs IAP）；ST Community（RDP 讀保護）</li>\n      <li class=\"muted\">查證日 2026-10-02。I²C 數值引自轉述 NXP UM10204 的二手來源；UART stop bit 1.5、「connect under reset」恢復手法未找到一手說明。</li></ol>"
        }
      ]
    }
  ]
}

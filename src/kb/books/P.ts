// 原 SemiDrill 講義(git 歷史裡的 public/semi/ 原檔)搬進百科的資料;內容是原講義的 HTML 片段,改這裡就是改講義。
import type { Book } from '../types'

export const book: Book = {
  "id": "P",
  "file": "P-leetcode.html",
  "title": "LeetCode 解題套路：看到題目先認套路，再寫程式",
  "lead": "LeetCode 的題目千變萬化，但解法大約只有十幾種<b>套路</b>。真正的功夫不是背題，而是<b>從題目的訊號認出該用哪一套</b>：「連續子陣列」想到滑動視窗或前綴和、「已排序」想到雙指標或二分、「下一個更大」想到單調堆疊、「所有組合」想到回溯、「最多幾種／最少幾步」想到 DP 或 BFS。再用 <b>n 的範圍</b>反推能接受的複雜度，確認選對了。",
  "note": "<p class=\"muted small\">對應 taxonomy P01～P14。難度標籤：<span class=\"lv\">L1</span>是什麼　<span class=\"lv l2\">L2</span>為什麼　<span class=\"lv l3\">L3</span>出問題怎麼辦。程式範例用 Python（LeetCode 最常見寫法），C# 對應寫在旁邊。</p>",
  "front": [
    {
      "id": "main",
      "title": "主圖：為什麼這些套路是 O(n)",
      "blocks": [
        {
          "t": "widget",
          "id": "P.main",
          "html": "<div class=\"controls\">\n      <div class=\"seg\" id=\"mode\">\n        <button data-m=\"win\" class=\"on\">滑動視窗逐步</button>\n        <button data-m=\"stk\">單調堆疊逐步</button>\n      </div>\n      <button class=\"btn\" id=\"prev\">← 上一步</button>\n      <button class=\"btn primary\" id=\"next\">下一步 →</button>\n      <span class=\"muted small\" id=\"phase\"></span>\n    </div>\n<div class=\"stage\">\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" id=\"mf\" viewBox=\"0 0 900 260\" role=\"img\" aria-label=\"滑動視窗與單調堆疊逐步圖\" style=\"min-width:640px\"></svg>\n      </div>\n      <div class=\"stage-info\">\n        <h3 id=\"stTitle\"></h3>\n        <p id=\"stWhat\"></p>\n      </div>\n    </div>"
        }
      ]
    },
    {
      "id": "signals",
      "title": "看到什麼，想到什麼",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>題目的訊號</th><th>先想這個套路</th><th>典型複雜度</th></tr>\n      <tr><td>已排序陣列、找一對／三個數加起來等於多少</td><td>對撞雙指標（P01）</td><td class=\"num\">O(n)／O(n²)</td></tr>\n      <tr><td>「連續子陣列／子字串」＋最長、最短、恰好</td><td>滑動視窗（P02）；有負數就改前綴和＋hash（P04）</td><td class=\"num\">O(n)</td></tr>\n      <tr><td>多次查詢區間和、多次區間加值</td><td>前綴和／差分陣列（P01）</td><td class=\"num\">O(1) 查／改</td></tr>\n      <tr><td>已排序、或「最小的最大值」「最少要多少才夠」</td><td>二分搜尋、對答案二分（P03）</td><td class=\"num\">O(log n)、O(n log 範圍)</td></tr>\n      <tr><td>「有沒有出現過」「出現幾次」「配對」</td><td>雜湊表（P04）</td><td class=\"num\">O(n)</td></tr>\n      <tr><td>「下一個更大／更小」「左右第一個比我矮」</td><td>單調堆疊（P05）</td><td class=\"num\">O(n)</td></tr>\n      <tr><td>鏈結串列：刪節點、找中點、判斷有沒有環</td><td>dummy head、快慢指標（P06）</td><td class=\"num\">O(n)、O(1) 空間</td></tr>\n      <tr><td>樹：深度、路徑、子樹性質</td><td>DFS 想清楚「子樹回傳什麼」（P07）</td><td class=\"num\">O(n)</td></tr>\n      <tr><td>格子、關係、依賴、最少步數</td><td>BFS／DFS／拓撲排序／Union-Find（P08）</td><td class=\"num\">O(V+E)</td></tr>\n      <tr><td>「列出所有」子集、排列、組合、解法</td><td>回溯（P09）</td><td class=\"num\">O(2ⁿ)、O(n!)</td></tr>\n      <tr><td>「有幾種方法」「最大／最小值」而且子問題會重複</td><td>動態規劃（P10）</td><td class=\"num\">狀態數 × 轉移成本</td></tr>\n      <tr><td>區間重疊、排程、每一步都選當下最好的</td><td>排序＋貪婪（P11），先找反例</td><td class=\"num\">O(n log n)</td></tr>\n      <tr><td>「前 K 大」「第 K 小」「一直加資料、隨時要中位數」</td><td>Heap（P12）</td><td class=\"num\">O(n log k)</td></tr>\n      <tr><td>「只出現一次」、n ≤ 20 的集合狀態</td><td>XOR、位元遮罩（P13）</td><td class=\"num\">O(n)、O(2ⁿ·n)</td></tr>\n    </tbody></table></div>"
        }
      ]
    }
  ],
  "entries": [
    {
      "id": "P01",
      "anchor": "p01",
      "tag": "P01",
      "name": "雙指標與前綴和",
      "sub": "對撞、快慢、差分",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>雙指標是用兩個索引一起走，<b>每一步都排除掉一個不可能的元素</b>，把 O(n²) 的「每對都試」變成 O(n)。前綴和是先花 O(n) 存「到第 i 個為止的總和」，之後任何區間和都是 O(1) 的一次減法。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>對撞指標</td><td><code>l</code> 從頭、<code>r</code> 從尾往中間走。典型：已排序陣列找兩數和（Two Sum II）、盛最多水的容器、判斷回文</td></tr>\n        <tr><td>快慢指標（同向）</td><td><code>slow</code> 指「下一個要寫入的位置」，<code>fast</code> 往前掃。典型：原地刪除重複、把 0 移到最後、刪除指定值。鏈結串列找環也是這招（P06）</td></tr>\n        <tr><td>原地覆寫</td><td>題目要求 O(1) 額外空間時，用 slow 把要留的元素依序寫回原陣列前段，回傳新長度</td></tr>\n        <tr><td>前綴和</td><td><code>pre[i] = a[0] + … + a[i-1]</code>，長度 n+1、<code>pre[0] = 0</code>。區間 <code>[l, r]</code> 的和 = <code>pre[r+1] - pre[l]</code></td></tr>\n        <tr><td>差分陣列</td><td>前綴和的反操作。對區間 <code>[l, r]</code> 全部加 v：<code>d[l] += v</code>、<code>d[r+1] -= v</code>，最後對 d 做一次前綴和還原。多次區間加值、最後才查詢時用</td></tr>\n        <tr><td>二維前綴和</td><td><code>S[i][j]</code> 為左上角矩形和；子矩形和 = 大矩形 − 上 − 左 ＋ 左上（容斥）</td></tr>\n      </tbody></table></div>",
          "anchor": "p01-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>對撞指標為什麼不會漏掉答案？</b>已排序時，若 <code>a[l] + a[r] &lt; target</code>，那 <code>a[l]</code> 跟 <code>r</code> 左邊任何一個配都更小，<code>a[l]</code> 不可能是答案的一部分，可以安心 <code>l++</code>。反之 <code>r--</code>。每步排除一個元素，最多 n 步。</li>\n        <li><b>盛水容器為什麼移較矮的那邊？</b>面積 = 寬 × 較矮那邊的高。寬一定會縮小；移較高的那邊，高度上限仍被較矮那邊卡住，面積只會變小。只有移較矮的那邊才有機會變大。</li>\n        <li><b>前綴和為什麼要開 n+1 格？</b>多一格 <code>pre[0] = 0</code>，從索引 0 開始的區間就不必特別處理，公式統一成 <code>pre[r+1] - pre[l]</code>。</li>\n        <li><b>差分陣列何時不夠用？</b>它適合「先改很多次、最後查一次」。如果改和查交錯進行，每次查都要重算前綴和，就退化成 O(n)；這時要用 Fenwick tree（樹狀陣列）或線段樹，改和查都 O(log n)。</li>\n        <li><b>前綴和與滑動視窗的分工？</b>滑動視窗需要「視窗變大，條件只會變得更難／更容易」的單調性；陣列有負數時區間和不單調，視窗就失效，要改用前綴和＋hash（P04）。</li>\n      </ul>\n<p class=\"codecap\">對撞指標：已排序陣列找兩數和</p>\n<pre><code>def two_sum_sorted(a, target):\n    l, r = 0, len(a) - 1\n    while l &lt; r:\n        s = a[l] + a[r]\n        if s == target: return [l, r]\n        if s &lt; target: l += 1    # a[l] 配誰都太小，排除\n        else:          r -= 1    # a[r] 配誰都太大，排除\n    return [-1, -1]</code></pre>\n<p class=\"codecap\">快慢指標：原地刪除已排序陣列的重複值，回傳新長度</p>\n<pre><code>def remove_duplicates(a):\n    slow = 0                       # 下一個要寫入的位置\n    for fast in range(len(a)):\n        if fast == 0 or a[fast] != a[fast - 1]:\n            a[slow] = a[fast]\n            slow += 1\n    return slow</code></pre>",
          "anchor": "p01-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>對撞指標在某些測資找不到明明存在的答案</td><td>陣列沒排序；或排序後回傳的是新索引，題目要原始索引</td><td>確認前提；要原索引時改用 hash（P04），或排序時帶著原索引</td></tr>\n        <tr><td>區間和差一格</td><td><code>pre</code> 的索引定義混用（<code>pre[i]</code> 含不含 <code>a[i]</code>）</td><td>固定用長度 n+1、<code>pre[i]</code> 不含 <code>a[i]</code> 的定義，寫一個 <code>[0, 0]</code> 的測資驗證</td></tr>\n        <tr><td>大測資答案變成負數或亂碼</td><td>前綴和超過 32 位元（C#／C++ 的 <code>int</code> 約 21 億）</td><td>改 <code>long</code>；題目要取模就每步取模</td></tr>\n        <tr><td>差分還原後最後一格多了一個值</td><td><code>d[r+1]</code> 越界或沒開 n+1 格</td><td>差分陣列開 n+1 格，還原時只取前 n 格</td></tr>\n      </tbody></table></div>",
          "anchor": "p01-l3"
        }
      ]
    },
    {
      "id": "P02",
      "anchor": "p02",
      "tag": "P02",
      "name": "滑動視窗",
      "sub": "何時收縮、單調佇列",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>處理「<b>連續</b>子陣列／子字串」時，右邊界一路往右擴，條件不成立時左邊界往右縮。左右邊界都只往右走，每個元素最多進出視窗各一次，所以是 O(n)。主圖的「滑動視窗逐步」就是這個過程。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>固定視窗</td><td>長度固定為 k：每步加進右邊一個、移除左邊一個。典型：長度 k 的最大平均、字串裡找異位詞（固定長度的計數比對）</td></tr>\n        <tr><td>可變視窗</td><td>右邊界每步 +1；<code>while</code> 視窗不合法就左邊界 +1。典型：最長無重複字元子字串、最小覆蓋子字串</td></tr>\n        <tr><td>收縮條件</td><td><b>求最長</b>：不合法時縮到合法，<b>縮完</b>再更新答案。<b>求最短</b>：合法時先更新答案，<b>再縮</b>，一直縮到不合法</td></tr>\n        <tr><td>視窗計數 map</td><td>用 hash 記視窗內每個字元的次數；「視窗內有幾種字元」看 map 的 key 數，次數歸零時要把 key 刪掉</td></tr>\n        <tr><td>單調佇列</td><td>求「每個長度 k 視窗的最大值」：deque 裡存索引、對應的值由前往後遞減；隊頭就是當前視窗最大值</td></tr>\n      </tbody></table></div>",
          "anchor": "p02-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼兩層迴圈還是 O(n)？</b>外層 <code>r</code> 走 n 次；內層 <code>while</code> 雖然看起來是迴圈，但 <code>l</code> 整個過程<b>只會往右</b>、總共最多走 n 次。總工作量是 2n，這叫<b>攤銷分析</b>（P14）。</li>\n        <li><b>什麼時候不能用滑動視窗？</b>要有單調性：視窗擴大時，「是否合法」只能朝一個方向變。全是正數的「和 ≥ target 的最短子陣列」可以；有負數的「和 = k 的子陣列個數」不行（加一個負數總和反而變小），改用前綴和＋hash（P04）。</li>\n        <li><b>「恰好 K 種」怎麼做？</b>「恰好 K」沒有單調性，但「至多 K」有。答案 = <code>atMost(K) - atMost(K-1)</code>。</li>\n        <li><b>單調佇列為什麼可以把比新元素小的直接丟掉？</b>新元素比它晚離開視窗、又比它大，只要新元素還在，那個舊元素就<b>永遠不可能</b>成為最大值。每個索引進出 deque 各一次，所以整體 O(n)，比每個視窗掃一次的 O(nk) 快。</li>\n      </ul>\n<p class=\"codecap\">可變視窗：最長無重複字元子字串（主圖示範的就是這段）</p>\n<pre><code>def longest_unique(s):\n    seen = set()\n    l = best = 0\n    for r, ch in enumerate(s):\n        while ch in seen:          # 不合法 → 縮左邊直到合法\n            seen.remove(s[l])\n            l += 1\n        seen.add(ch)\n        best = max(best, r - l + 1)  # 求最長：縮完再更新\n    return best</code></pre>\n<p class=\"codecap\">單調佇列：每個長度 k 視窗的最大值</p>\n<pre><code>from collections import deque\ndef max_sliding_window(a, k):\n    dq, out = deque(), []          # 存索引，對應值遞減\n    for i, x in enumerate(a):\n        while dq and a[dq[-1]] &lt;= x: dq.pop()   # 比 x 小的永遠當不了最大\n        dq.append(i)\n        if dq[0] &lt;= i - k: dq.popleft()          # 隊頭滑出視窗\n        if i &gt;= k - 1: out.append(a[dq[0]])\n    return out</code></pre>",
          "anchor": "p02-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>某些測資答案偏大</td><td>收縮用了 <code>if</code> 而不是 <code>while</code>，只縮一格視窗仍不合法</td><td>收縮一律寫 <code>while</code></td></tr>\n        <tr><td>「視窗內字元種類數」算錯</td><td>次數減到 0 時沒把 key 刪掉，<code>len(map)</code> 多算</td><td>減到 0 就 <code>del</code>；或另外維護一個「種類數」計數器</td></tr>\n        <tr><td>求最短時答案總是比正確值長</td><td>先縮再更新答案，錯過了合法時的最短長度</td><td>求最短：在 <code>while 合法</code> 迴圈<b>裡面</b>先更新，再縮</td></tr>\n        <tr><td>有負數的子陣列和題目，視窗答案錯</td><td>沒有單調性</td><td>改前綴和＋hash（P04）</td></tr>\n      </tbody></table></div>",
          "anchor": "p02-l3"
        }
      ]
    },
    {
      "id": "P03",
      "anchor": "p03",
      "tag": "P03",
      "name": "二分搜尋",
      "sub": "邊界、對答案二分",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>二分搜尋的本質不是「在排序陣列找一個數」，而是<b>找一個判斷式從 false 變成 true 的分界點</b>。只要答案空間有這種單調性（排序陣列、或「容量越大越裝得下」），就能每次丟掉一半。基本版的逐步動畫在 <a href=\"H-programming.html#main\">H 章主圖</a>。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>閉區間寫法</td><td>範圍 <code>[lo, hi]</code>：<code>while lo &lt;= hi</code>，更新 <code>lo = mid + 1</code>／<code>hi = mid - 1</code>。找「某個值在不在」最直覺</td></tr>\n        <tr><td>左閉右開寫法</td><td>範圍 <code>[lo, hi)</code>：<code>hi</code> 初值 n、<code>while lo &lt; hi</code>，更新 <code>lo = mid + 1</code>／<code>hi = mid</code>。找分界點最不容易錯，結束時 <code>lo == hi</code> 就是答案</td></tr>\n        <tr><td>lower_bound</td><td>第一個 <b>≥ x</b> 的位置（Python <code>bisect_left</code>、C++ <code>std::lower_bound</code>）</td></tr>\n        <tr><td>upper_bound</td><td>第一個 <b>&gt; x</b> 的位置（Python <code>bisect_right</code>）。x 出現的次數 = upper − lower</td></tr>\n        <tr><td>對答案二分</td><td>答案本身有範圍、而且「答案 = m 可不可行」是單調的，就二分 m。典型：Koko 吃香蕉、D 天內送完貨的最小載重、分割陣列的最大值最小</td></tr>\n        <tr><td>旋轉排序陣列</td><td>例如 <code>[4,5,6,7,0,1,2]</code>。從 mid 切開，<b>一定有一半是排好的</b>，判斷目標在不在排好的那半，就知道丟哪邊</td></tr>\n      </tbody></table></div>",
          "anchor": "p03-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼左閉右開比較不會錯？</b>迴圈不變式很單純：<code>lo</code> 左邊全部 false、<code>hi</code> 以右全部 true。每一步只要問 <code>check(mid)</code>：true 就 <code>hi = mid</code>（mid 可能就是答案，不能丟），false 就 <code>lo = mid + 1</code>。結束時 <code>lo</code> 正好是第一個 true。</li>\n        <li><b>為什麼有時會死迴圈？</b>寫成 <code>lo = mid</code> 時，若 <code>hi = lo + 1</code>，<code>mid = (lo + hi) // 2</code> 永遠等於 <code>lo</code>，範圍不再縮小。要嘛改用上面的 <code>lo = mid + 1</code> 模板，要嘛取上中位數 <code>mid = (lo + hi + 1) // 2</code>。</li>\n        <li><b>對答案二分的複雜度？</b>二分 log(答案範圍) 次，每次跑一遍 O(n) 的 <code>check</code>，總共 O(n log 範圍)。範圍到 10⁹ 也只要約 30 次。</li>\n        <li><b>旋轉陣列有重複值時？</b><code>a[lo] == a[mid] == a[hi]</code> 時分不出哪半排好，只能 <code>lo++</code>、<code>hi--</code>，最壞退化成 O(n)。</li>\n        <li><b>中點溢位：</b>C#／C++／Java 用 <code>lo + (hi - lo) / 2</code>，不要 <code>(lo + hi) / 2</code>（理由見 H06）。Python 整數無上限，沒有這個問題。</li>\n      </ul>\n<p class=\"codecap\">萬用模板：找第一個讓 check 為 true 的位置（左閉右開）</p>\n<pre><code>def first_true(lo, hi, check):     # 在 [lo, hi) 找；全 false 回傳 hi\n    while lo &lt; hi:\n        mid = (lo + hi) // 2\n        if check(mid): hi = mid      # mid 可能是答案，保留\n        else:          lo = mid + 1  # mid 不是，丟掉\n    return lo\n\n# lower_bound：first_true(0, len(a), lambda i: a[i] &gt;= x)\n# 對答案二分：first_true(1, max(piles) + 1, lambda k: hours(k) &lt;= h)</code></pre>",
          "anchor": "p03-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>只剩兩個元素時程式卡住</td><td><code>lo = mid</code> 搭配下取整的 mid</td><td>改用 <code>lo = mid + 1</code> 的模板，或 mid 取上中位數</td></tr>\n        <tr><td>找第一個出現位置，卻回傳中間某個重複值</td><td>用了「找到就 return」的版本</td><td>改找 lower_bound：找到也不停，繼續往左縮</td></tr>\n        <tr><td>對答案二分結果差 1</td><td>上界沒包含可能的答案（<code>hi</code> 開太小），或 check 的方向寫反</td><td>先寫清楚「check(m) 為 true 代表什麼」，確認 m 越大越容易 true；上界設成一定可行的值</td></tr>\n        <tr><td>旋轉陣列某些測資答錯</td><td>判斷「哪半排好」時 <code>&lt;</code>／<code>&lt;=</code> 用錯，mid 與 lo 同一格時誤判</td><td>用 <code>a[lo] &lt;= a[mid]</code> 判左半排好；拿長度 1、2 的陣列測</td></tr>\n      </tbody></table></div>",
          "anchor": "p03-l3"
        }
      ]
    },
    {
      "id": "P04",
      "anchor": "p04",
      "tag": "P04",
      "name": "雜湊與計數",
      "sub": "Two Sum、前綴和＋hash",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>用 hash 把「找有沒有某個值」從 O(n) 降到平均 O(1)，代價是額外 O(n) 的記憶體、而且沒有順序。最經典的兩招是 <b>Two Sum</b>（邊走邊查「我需要的另一半出現過沒」）和<b>前綴和＋hash</b>（查「有沒有一個更早的前綴和剛好差 k」）。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>Two Sum 型</td><td>走到 x 時，查 <code>target - x</code> 有沒有在 map 裡；沒有就把 <code>x → 索引</code> 存進去。一趟 O(n)</td></tr>\n        <tr><td>前綴和＋hash</td><td>「和為 k 的子陣列有幾個」：走到前綴和 <code>p</code> 時，答案加上 <code>count[p - k]</code>，再把 <code>count[p]</code> 加 1。<code>count</code> 初值 <code>{0: 1}</code></td></tr>\n        <tr><td>頻率統計</td><td>Python <code>collections.Counter</code>、C# <code>Dictionary&lt;T,int&gt;</code>。異位詞分組：用排序後的字串或 26 格計數 tuple 當 key</td></tr>\n        <tr><td>去重</td><td><code>set</code>／<code>HashSet&lt;T&gt;</code>。最長連續序列：放進 set 後，只從「<code>x-1</code> 不在 set 裡」的起點往上數，整體 O(n)</td></tr>\n      </tbody></table></div>",
          "anchor": "p04-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>Two Sum 為什麼要「先查再存」？</b>先存再查的話，<code>target = 2x</code> 時 x 會跟自己配對。先查，map 裡只有「前面」的元素，自然不會用到同一個。</li>\n        <li><b>前綴和＋hash 為什麼要 <code>{0: 1}</code>？</b>區間 <code>[i, j]</code> 的和 = <code>pre[j+1] - pre[i]</code>。從索引 0 開始的子陣列對應 <code>pre[0] = 0</code>，不先放進去就會漏掉「從頭開始剛好等於 k」的那幾個。</li>\n        <li><b>hash 和排序＋雙指標怎麼選？</b>hash：O(n) 時間、O(n) 空間、保留原索引。排序＋雙指標：O(n log n) 時間、O(1) 額外空間、但原索引會亂。題目要回傳索引 → hash；要求不用額外空間 → 排序。</li>\n        <li><b>hash 平均 O(1)，最壞呢？</b>大量碰撞時退化成 O(n)。要「有順序」或「找範圍」時改用平衡樹（C# <code>SortedDictionary</code>，O(log n)）。</li>\n      </ul>\n<p class=\"codecap\">前綴和＋hash：和為 k 的子陣列個數（可以有負數）</p>\n<pre><code>def subarray_sum(a, k):\n    count = {0: 1}                  # 空前綴，處理從頭開始的子陣列\n    p = ans = 0\n    for x in a:\n        p += x\n        ans += count.get(p - k, 0)  # 之前有幾個前綴和剛好差 k\n        count[p] = count.get(p, 0) + 1\n    return ans</code></pre>",
          "anchor": "p04-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>子陣列個數總是少幾個</td><td>忘了 <code>count = {0: 1}</code></td><td>補上空前綴</td></tr>\n        <tr><td>Python 丟 <code>TypeError: unhashable type: 'list'</code></td><td>拿 list 當 dict 的 key</td><td>改成 <code>tuple</code></td></tr>\n        <tr><td>C# 丟 <code>KeyNotFoundException</code></td><td>用索引子讀不存在的 key</td><td>改 <code>TryGetValue</code> 或 <code>GetValueOrDefault</code></td></tr>\n        <tr><td>Two Sum 回傳兩個相同索引</td><td>先存再查</td><td>改成先查再存</td></tr>\n        <tr><td>「最長連續序列」寫成 O(n²) 而超時</td><td>每個數都往上數一次</td><td>只從序列起點（<code>x-1</code> 不在 set）開始數</td></tr>\n      </tbody></table></div>",
          "anchor": "p04-l3"
        }
      ]
    },
    {
      "id": "P05",
      "anchor": "p05",
      "tag": "P05",
      "name": "堆疊與單調堆疊",
      "sub": "下一個更大、最大矩形",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>堆疊處理「最近一個還沒配對的東西」（括號、函式呼叫、復原）。<b>單調堆疊</b>是堆疊裡保持遞增或遞減，用來在 O(n) 內替每個元素找到「左邊／右邊第一個比我大（或小）的」。主圖的「單調堆疊逐步」示範每日溫度。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>括號配對</td><td>左括號 push；右括號時看堆疊頂是不是對應的左括號，是就 pop。結束時堆疊要是空的</td></tr>\n        <tr><td>下一個更大元素</td><td>維持一個<b>值遞減</b>的堆疊（存索引）。新元素比堆疊頂大 → 堆疊頂的「下一個更大」就是它，pop 並記錄；重複到不再比較大，再 push</td></tr>\n        <tr><td>每日溫度</td><td>同上，答案是索引差：<code>ans[j] = i - j</code></td></tr>\n        <tr><td>柱狀圖最大矩形</td><td>維持<b>高度遞增</b>的堆疊。被 pop 的柱子 h：右邊界是現在的 i（第一個比它矮的），左邊界是 pop 後的新堆疊頂；寬 = <code>i - 新頂 - 1</code></td></tr>\n        <tr><td>哨兵</td><td>在陣列尾端補一個 0（或極小值），保證最後所有元素都會被 pop、被結算</td></tr>\n      </tbody></table></div>",
          "anchor": "p05-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼是 O(n)？</b>每個索引最多 push 一次、pop 一次，總操作 2n。跟滑動視窗一樣是攤銷分析。</li>\n        <li><b>要遞增還是遞減？</b>找「下一個更<b>大</b>」→ 堆疊遞<b>減</b>（被更大的人踢出時就找到答案）。找「下一個更<b>小</b>」→ 堆疊遞<b>增</b>。口訣：<b>誰把你踢出去，誰就是你的答案。</b></li>\n        <li><b>為什麼存索引不存值？</b>大部分題目要的是距離或寬度；存索引可以從 <code>a[i]</code> 取回值，反過來不行。</li>\n        <li><b>pop 之後的新堆疊頂代表什麼？</b>是被 pop 的元素「<b>左邊</b>第一個比它小（或大）的」。所以一次掃描可以同時得到左右邊界，最大矩形就是靠這個。</li>\n      </ul>\n<p class=\"codecap\">單調堆疊：每日溫度（主圖示範的就是這段）</p>\n<pre><code>def daily_temperatures(t):\n    ans = [0] * len(t)\n    st = []                          # 存索引，溫度由底到頂遞減\n    for i, x in enumerate(t):\n        while st and t[st[-1]] &lt; x:  # x 把比它冷的都踢出去\n            j = st.pop()\n            ans[j] = i - j           # 誰踢你，誰就是你的答案\n        st.append(i)\n    return ans                       # 留在堆疊裡的：沒有更暖的一天，維持 0</code></pre>",
          "anchor": "p05-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>算得出「下一個更大的值」但算不出距離</td><td>堆疊存的是值</td><td>改存索引</td></tr>\n        <tr><td>最大矩形漏算了最後一段遞增的柱子</td><td>掃完後堆疊還有元素沒結算</td><td>尾端加哨兵 0，或掃完再清一次堆疊</td></tr>\n        <tr><td>有重複值時，「所有子陣列最小值的總和」重複計算</td><td>左右兩邊都用 <code>&lt;</code>（或都用 <code>&lt;=</code>），相同值的子陣列被兩個元素各算一次</td><td>一邊用嚴格 <code>&lt;</code>、另一邊用 <code>&lt;=</code></td></tr>\n        <tr><td>括號題對 <code>\")(\"</code> 回傳 true</td><td>只數左右括號的數量，沒檢查順序</td><td>用堆疊；遇到右括號時堆疊是空的就直接 false</td></tr>\n      </tbody></table></div>",
          "anchor": "p05-l3"
        }
      ]
    },
    {
      "id": "P06",
      "anchor": "p06",
      "tag": "P06",
      "name": "鏈結串列",
      "sub": "dummy、反轉、找環",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>鏈結串列題的難處不是演算法，而是<b>指標順序</b>：改 <code>next</code> 之前要先存好下一個節點，不然後面整串就丟了。兩個萬用工具：<b>dummy head</b>（不必特別處理頭節點）和<b>快慢指標</b>（找中點、找環、找倒數第 n 個）。</p>\n<figure>\n      <div class=\"table-wrap\">\n      <svg class=\"fig\" viewBox=\"0 0 900 200\" role=\"img\" aria-label=\"反轉鏈結串列的三個指標\" style=\"min-width:640px\">\n        <defs><marker id=\"ap6\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n        <text x=\"10\" y=\"22\" class=\"t-strong\">反轉的一步：先存 nxt，再把 cur.next 指回 prev，最後三個指標各往右一格</text>\n        <rect class=\"bx\" x=\"40\" y=\"70\" width=\"90\" height=\"40\" rx=\"6\"></rect><text x=\"85\" y=\"95\" text-anchor=\"middle\">1</text>\n        <rect class=\"bx-accent\" x=\"230\" y=\"70\" width=\"90\" height=\"40\" rx=\"6\"></rect><text x=\"275\" y=\"95\" text-anchor=\"middle\" class=\"t-accent\">2</text>\n        <rect class=\"bx\" x=\"420\" y=\"70\" width=\"90\" height=\"40\" rx=\"6\"></rect><text x=\"465\" y=\"95\" text-anchor=\"middle\">3</text>\n        <rect class=\"bx\" x=\"610\" y=\"70\" width=\"90\" height=\"40\" rx=\"6\"></rect><text x=\"655\" y=\"95\" text-anchor=\"middle\">4</text>\n        <text x=\"760\" y=\"95\" class=\"t-muted\">→ None</text>\n        <line class=\"ln-accent\" x1=\"228\" y1=\"90\" x2=\"133\" y2=\"90\" marker-end=\"url(#ap6)\"></line>\n        <line class=\"ln dash\" x1=\"320\" y1=\"98\" x2=\"418\" y2=\"98\" marker-end=\"url(#ap6)\"></line>\n        <line class=\"ln\" x1=\"510\" y1=\"90\" x2=\"608\" y2=\"90\" marker-end=\"url(#ap6)\"></line>\n        <text x=\"85\" y=\"135\" text-anchor=\"middle\" class=\"t-small\">prev</text>\n        <text x=\"275\" y=\"135\" text-anchor=\"middle\" class=\"t-small\">cur</text>\n        <text x=\"465\" y=\"135\" text-anchor=\"middle\" class=\"t-small\">nxt（先存）</text>\n        <text x=\"180\" y=\"62\" text-anchor=\"middle\" class=\"t-small\">cur.next = prev</text>\n        <text x=\"370\" y=\"120\" text-anchor=\"middle\" class=\"t-small\">原本的線（已斷）</text>\n        <text x=\"10\" y=\"180\" class=\"t-small\">左邊 1 已經反轉完（1 → None）。沒先存 nxt 就改 cur.next，3 → 4 這一整串就再也找不到了。</text>\n      </svg>\n      </div>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>dummy head</td><td>在頭前面放一個假節點，<code>dummy.next = head</code>。刪除頭節點、合併串列時不必寫特例，最後回傳 <code>dummy.next</code></td></tr>\n        <tr><td>反轉</td><td>三個指標 <code>prev / cur / nxt</code>：<code>nxt = cur.next; cur.next = prev; prev = cur; cur = nxt</code>，O(n) 時間、O(1) 空間</td></tr>\n        <tr><td>找中點</td><td>slow 一次走 1、fast 一次走 2，fast 到底時 slow 在中間</td></tr>\n        <tr><td>Floyd 找環</td><td>同上兩個速度，有環就一定會相遇；相遇後一個回到 head，兩個都一次走 1，再相遇處就是<b>環的入口</b></td></tr>\n        <tr><td>倒數第 n 個</td><td>fast 先走 n 步，再一起走；fast 到底時 slow 就在倒數第 n 個的前一個（從 dummy 出發時）</td></tr>\n        <tr><td>合併兩條已排序串列</td><td>dummy＋tail，每次接較小的那個；一條用完就把另一條整串接上</td></tr>\n      </tbody></table></div>",
          "anchor": "p06-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼有環一定會相遇？</b>進入環以後，fast 每步比 slow 多走 1，兩者的距離每步縮短 1，不會跳過，所以一定會相遇。</li>\n        <li><b>為什麼相遇後從 head 再走，會停在環入口？</b>設 head 到入口距離 a、入口到相遇點 b、環長 c。fast 走的是 slow 的兩倍：<code>2(a+b) = a+b+kc</code>，得 <code>a = kc - b</code>。從相遇點再走 a 步，等於繞 k 圈再退 b 步，剛好回到入口；從 head 走 a 步也到入口。</li>\n        <li><b>偶數長度時中點是哪個？</b><code>while fast and fast.next</code> 停下時，slow 在<b>後</b>半段第一個；要前半段最後一個就改成 <code>while fast.next and fast.next.next</code>。回文串列、重排串列要把串列切成兩半時，這個差別很關鍵。</li>\n        <li><b>鏈結串列 vs 陣列：</b>已經拿到節點時，插入刪除 O(1)；但沒有隨機存取（找第 k 個要 O(k)），節點分散在記憶體裡，cache 命中率差。實務上大多數情況陣列（<code>List&lt;T&gt;</code>）更快。</li>\n      </ul>\n<p class=\"codecap\">反轉鏈結串列</p>\n<pre><code>def reverse(head):\n    prev, cur = None, head\n    while cur:\n        nxt = cur.next      # 1. 先存下一個\n        cur.next = prev     # 2. 指回去\n        prev, cur = cur, nxt  # 3. 往前走\n    return prev</code></pre>",
          "anchor": "p06-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>反轉後只剩一兩個節點</td><td>改 <code>cur.next</code> 前沒先存 <code>nxt</code></td><td>照「存、指、走」三步的順序寫</td></tr>\n        <tr><td><code>NoneType has no attribute next</code>／NullReference</td><td>fast 走兩步前沒檢查 <code>fast.next</code></td><td>條件寫 <code>while fast and fast.next</code></td></tr>\n        <tr><td>刪除頭節點時答案錯、或要寫一堆 if</td><td>沒用 dummy</td><td>一律從 dummy 出發，回傳 <code>dummy.next</code></td></tr>\n        <tr><td>重排或切割後程式跑不完（印串列時無限迴圈）</td><td>前半段的尾巴沒切斷，還指向後半段，形成環</td><td>切成兩半時把前半尾巴的 <code>next</code> 設成 None</td></tr>\n      </tbody></table></div>",
          "anchor": "p06-l3"
        }
      ]
    },
    {
      "id": "P07",
      "anchor": "p07",
      "tag": "P07",
      "name": "樹與遞迴",
      "sub": "走訪、回傳值、BST、LCA",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>樹的題目幾乎都是同一個問題：<b>「這個節點要從左右子樹拿到什麼資訊，又要回傳什麼給父節點？」</b>想清楚回傳值，遞迴就自己寫出來了。要一層一層處理時改用 BFS。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>前序／中序／後序</td><td>根在「前、中、後」被處理：前序 根左右、中序 左根右、後序 左右根。<b>BST 的中序走訪是排好序的</b></td></tr>\n        <tr><td>層序走訪（BFS）</td><td>用 queue；每一層開始時先記下 <code>len(queue)</code>，只處理這麼多個，就能分層。典型：右視圖、每層平均、最小深度</td></tr>\n        <tr><td>深度 vs 高度</td><td>深度：從根往下數；高度：從葉往上數。遞迴回傳高度最常見：<code>1 + max(左, 右)</code></td></tr>\n        <tr><td>BST 性質</td><td>左子樹<b>全部</b>小於根、右子樹<b>全部</b>大於根（不只是直接的子節點）</td></tr>\n        <tr><td>LCA（最近共同祖先）</td><td>兩個節點往上走第一個交會的祖先。一般二元樹用後序遞迴；BST 直接比大小</td></tr>\n      </tbody></table></div>",
          "anchor": "p07-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>DFS 回傳值怎麼設計？</b>以「二元樹直徑」為例：答案是某個節點的「左高度＋右高度」，但父節點需要的是「我的高度」。所以函式<b>回傳高度</b>，順便用一個外部變數更新最大直徑。回傳給父節點的，和題目要的答案常常不是同一個東西。</li>\n        <li><b>什麼時候用後序？</b>需要先知道子樹的結果才能算自己時（高度、直徑、子樹和、平衡判斷、LCA）。前序適合由上往下帶資訊（目前路徑和、上下界）。</li>\n        <li><b>驗證 BST 為什麼要帶上下界？</b>只比對直接子節點會漏掉這種情況：根 5、右子 6、6 的左子 3。3 &lt; 6 沒錯，但 3 在 5 的右子樹裡，違反 BST。遞迴時要往下傳 <code>(low, high)</code>，或檢查中序是否嚴格遞增。</li>\n        <li><b>一般二元樹的 LCA 為什麼這樣寫就對？</b>遇到 p 或 q 就回傳自己；左右兩邊都找到東西，代表 p、q 分在兩側，目前節點就是 LCA；只有一邊找到，就把那邊的結果往上傳。</li>\n        <li><b>遞迴深度：</b>等於樹高。平衡樹約 log n，但退化成一條線的樹是 n；Python 預設遞迴上限約 1000，深度可能很大時改成迭代＋顯式 stack（H06）。</li>\n      </ul>\n<p class=\"codecap\">回傳值設計：二元樹直徑</p>\n<pre><code>def diameter(root):\n    best = 0\n    def height(node):\n        nonlocal best\n        if not node: return 0\n        l, r = height(node.left), height(node.right)\n        best = max(best, l + r)     # 題目要的：經過這個節點的最長路徑\n        return 1 + max(l, r)        # 父節點要的：我的高度\n    height(root)\n    return best</code></pre>",
          "anchor": "p07-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>驗證 BST 對某些樹誤判為合法</td><td>只比較直接子節點</td><td>往下傳上下界，或檢查中序是否嚴格遞增</td></tr>\n        <tr><td>層序走訪分層錯亂</td><td>迴圈裡直接用 <code>len(queue)</code> 判斷，但 queue 在迴圈中被加長了</td><td>每層開始時先把 <code>size = len(queue)</code> 存下來</td></tr>\n        <tr><td>單獨跑對、送出後某些測資答案怪</td><td>答案存在類別屬性或全域變數，多筆測資之間沒重設</td><td>用區域變數＋<code>nonlocal</code>，或每次呼叫開頭重設</td></tr>\n        <tr><td>最小深度回傳 1，但樹明明更深</td><td>把只有一邊子樹的節點當成葉子（<code>min(左, 右)</code> 取到空的那邊的 0）</td><td>只有左右都空才算葉子；有一邊空就只看另一邊</td></tr>\n        <tr><td>退化樹（一條線）時遞迴爆掉</td><td>深度等於節點數</td><td>改迭代，或用 BFS</td></tr>\n      </tbody></table></div>",
          "anchor": "p07-l3"
        }
      ]
    },
    {
      "id": "P08",
      "anchor": "p08",
      "tag": "P08",
      "name": "圖",
      "sub": "BFS、拓撲、並查集、Dijkstra",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>格子、人際關係、課程先修、城市道路，都是「點＋邊」。先決定要回答什麼：<b>最少幾步</b>用 BFS、<b>有幾塊連在一起</b>用 DFS 或 Union-Find、<b>先後順序</b>用拓撲排序、<b>帶權重的最短路</b>用 Dijkstra。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>鄰接表</td><td><code>graph[u] = [v1, v2, …]</code>。空間 O(V+E)，大多數題目都用這個；鄰接矩陣是 O(V²)，只在點很少或圖很密時用</td></tr>\n        <tr><td>BFS 最短路</td><td>無權重（每步成本相同）的圖，BFS 第一次碰到某點時的層數就是最短距離。典型：迷宮最少步數、單字接龍</td></tr>\n        <tr><td>DFS 連通分量</td><td>從每個沒走過的點出發，把能到的全部標記，出發幾次就有幾塊。典型：島嶼數量</td></tr>\n        <tr><td>拓撲排序（Kahn）</td><td>有向圖：入度為 0 的點進 queue，取出時把它指向的點入度減 1，減到 0 就進 queue。<b>輸出的點數少於 V 代表有環</b>。典型：課程表</td></tr>\n        <tr><td>Union-Find（並查集）</td><td><code>find(x)</code> 找代表、<code>union(a, b)</code> 合併兩群。加上路徑壓縮與依大小合併，每次操作近乎 O(1)（反阿克曼函數 α(n)）</td></tr>\n        <tr><td>Dijkstra</td><td>權重<b>不能為負</b>的最短路：用 min-heap 每次取目前距離最小的點去鬆弛鄰居，O((V+E) log V)</td></tr>\n      </tbody></table></div>",
          "anchor": "p08-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>BFS 為什麼保證最短？</b>它是一層一層往外擴：先走完所有距離 1 的點，才會碰到距離 2 的點。第一次到達時，不可能有更短的路還沒走。</li>\n        <li><b>visited 為什麼要在「放進 queue 時」標記？</b>如果等到取出時才標記，同一個點可能被好幾個鄰居重複放進 queue，格子題會多出好幾倍的工作量而超時。</li>\n        <li><b>Dijkstra 為什麼不能有負權重？</b>它假設「從 heap 取出的點，距離已經是最終答案」。有負邊時，之後可能經由一條負邊繞回來變得更短，這個假設就破了。有負邊要用 Bellman-Ford（O(VE)）。</li>\n        <li><b>Union-Find 和 DFS 怎麼選？</b>圖一次給完、只問一次 → DFS 簡單。邊是一條一條加進來、而且每加一條都要問「這兩點連通了沒」→ Union-Find。「冗餘連線」那種題（找出造成環的那條邊）也是 Union-Find 最直接。</li>\n        <li><b>格子就是圖：</b>每格是點，上下左右是邊。用方向陣列 <code>[(1,0),(-1,0),(0,1),(0,-1)]</code> 走，記得檢查越界。</li>\n      </ul>\n<p class=\"codecap\">BFS：格子最少步數（放進 queue 時就標記）</p>\n<pre><code>from collections import deque\ndef shortest(grid, start, goal):\n    R, C = len(grid), len(grid[0])\n    q, seen = deque([(start, 0)]), {start}\n    while q:\n        (r, c), d = q.popleft()\n        if (r, c) == goal: return d\n        for dr, dc in ((1,0), (-1,0), (0,1), (0,-1)):\n            nr, nc = r + dr, c + dc\n            if 0 &lt;= nr &lt; R and 0 &lt;= nc &lt; C and grid[nr][nc] == 0 and (nr, nc) not in seen:\n                seen.add((nr, nc))          # 放進去就標記\n                q.append(((nr, nc), d + 1))\n    return -1</code></pre>\n<p class=\"codecap\">Union-Find：路徑壓縮＋依大小合併</p>\n<pre><code>parent = list(range(n)); size = [1] * n\ndef find(x):\n    while parent[x] != x:\n        parent[x] = parent[parent[x]]   # 路徑壓縮（隔代指）\n        x = parent[x]\n    return x\ndef union(a, b):\n    ra, rb = find(a), find(b)\n    if ra == rb: return False           # 已經同一群 → 這條邊造成環\n    if size[ra] &lt; size[rb]: ra, rb = rb, ra\n    parent[rb] = ra; size[ra] += size[rb]\n    return True</code></pre>",
          "anchor": "p08-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>格子 BFS 超時或記憶體爆掉</td><td>取出時才標記 visited，同一格被重複放進 queue</td><td>放進 queue 時就標記</td></tr>\n        <tr><td>大格子（例如 1000×1000）用遞迴 DFS 直接當掉</td><td>遞迴深度可達 10⁶</td><td>改成 BFS 或迭代 DFS（顯式 stack）</td></tr>\n        <tr><td>Dijkstra 很慢或答案不對</td><td>heap 裡的舊紀錄沒跳過；或圖有負權重</td><td>取出時 <code>if d &gt; dist[u]: continue</code>；有負權重改 Bellman-Ford</td></tr>\n        <tr><td>課程表題目在有環時仍回傳一個順序</td><td>沒有檢查輸出的點數</td><td>輸出數量 &lt; V 就代表有環，回傳空</td></tr>\n        <tr><td>無向圖的 DFS 判環，每條邊都被當成環</td><td>走回剛剛來的父節點也算成環</td><td>DFS 時帶著父節點，跳過它；或改用 Union-Find</td></tr>\n      </tbody></table></div>",
          "anchor": "p08-l3"
        }
      ]
    },
    {
      "id": "P09",
      "anchor": "p09",
      "tag": "P09",
      "name": "回溯",
      "sub": "子集、排列、剪枝、去重",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>回溯就是<b>有系統地試遍所有選擇</b>：做一個選擇 → 遞迴往下 → 撤銷選擇，換下一個。題目要「列出所有」方案時用它；複雜度是指數級，所以 n 通常很小（≤ 20 左右）。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>基本骨架</td><td><code>選擇 → backtrack(...) → 撤銷</code>。狀態（目前路徑）只有一份，靠撤銷還原</td></tr>\n        <tr><td>子集</td><td>帶 <code>start</code> 參數，只往後選；<b>每個節點都是一個答案</b>。共 2ⁿ 個</td></tr>\n        <tr><td>組合</td><td>同子集，但路徑長度到 k 才收進答案。可剪枝：剩下的數不夠湊滿 k 就停</td></tr>\n        <tr><td>排列</td><td>不帶 start，每層從頭選；用 <code>used[]</code> 標記已用過的。共 n! 個</td></tr>\n        <tr><td>剪枝</td><td>提早判斷「這條路不可能成功」就不往下走。例：組合總和題，先排序，目前和超過 target 就 break</td></tr>\n        <tr><td>重複元素去重</td><td>先排序，同一層裡 <code>if i &gt; start and a[i] == a[i-1]: continue</code></td></tr>\n      </tbody></table></div>",
          "anchor": "p09-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>收答案時為什麼要複製一份？</b><code>path</code> 只有一份，之後會被撤銷、改掉。直接 <code>res.append(path)</code> 存的是同一個物件的參考，最後全部變成空 list。要 <code>res.append(path[:])</code>（C# 是 <code>new List&lt;int&gt;(path)</code>）。</li>\n        <li><b>去重為什麼是「同一層」跳過，不是「同一條路」跳過？</b>例如 <code>[1, 2, 2']</code>：同一條路先選 2 再選 2' 是合法的 <code>[1,2,2]</code>；但在同一層，選 2 和選 2' 開出來的子樹完全一樣，第二個要跳過。<code>i &gt; start</code> 這個條件就是在說「不是這一層第一個」。</li>\n        <li><b>子集和排列為什麼寫法不同？</b>子集、組合不在乎順序，<code>start</code> 保證只往後選，<code>[1,2]</code> 和 <code>[2,1]</code> 不會都出現；排列在乎順序，每層都要從頭看，靠 <code>used</code> 避免重複使用同一個元素。</li>\n        <li><b>回溯 vs DP：</b>要<b>列出每一個</b>方案 → 回溯（答案本身就有指數個）。只要<b>數量</b>或<b>最佳值</b>，而且子問題會重複 → 通常改 DP，從指數降到多項式。</li>\n      </ul>\n<p class=\"codecap\">回溯骨架：有重複元素的子集</p>\n<pre><code>def subsets_with_dup(a):\n    a.sort()\n    res, path = [], []\n    def bt(start):\n        res.append(path[:])               # 每個節點都是答案；要複製\n        for i in range(start, len(a)):\n            if i &gt; start and a[i] == a[i-1]: continue   # 同一層去重\n            path.append(a[i])             # 選擇\n            bt(i + 1)                     # 往下\n            path.pop()                    # 撤銷\n    bt(0)\n    return res</code></pre>",
          "anchor": "p09-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>結果全是空 list</td><td>收答案時沒複製 <code>path</code></td><td><code>path[:]</code>／<code>list(path)</code></td></tr>\n        <tr><td>答案有重複的組合</td><td>沒排序就去重，或用了 <code>i &gt; 0</code> 而不是 <code>i &gt; start</code></td><td>先排序，條件用 <code>i &gt; start</code></td></tr>\n        <tr><td>本來正確的答案被漏掉了</td><td>去重條件寫成 <code>i &gt; 0</code>，連同一條路上的重複值都跳過</td><td>同上</td></tr>\n        <tr><td>超時</td><td>沒剪枝；或題目其實只問數量</td><td>排序後超過就 break；只問數量就改 DP</td></tr>\n        <tr><td>結果亂七八糟、出現不該有的元素</td><td>某個分支 return 前沒撤銷（例如 <code>used[i]</code> 沒改回 false）</td><td>選擇和撤銷成對寫，中間不要提早 return</td></tr>\n      </tbody></table></div>",
          "anchor": "p09-l3"
        }
      ]
    },
    {
      "id": "P10",
      "anchor": "p10",
      "tag": "P10",
      "name": "動態規劃",
      "sub": "狀態、轉移、背包",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>DP 是「<b>把大問題拆成會重複出現的小問題，每個只算一次、存起來</b>」。寫 DP 的五個步驟：<b>狀態定義</b>（dp[i] 代表什麼）→ <b>轉移式</b>（dp[i] 從誰來）→ <b>初始值</b> → <b>計算順序</b> → <b>答案在哪一格</b>。狀態定義對了，其他四步通常就順了。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>狀態定義</td><td>用一句話講清楚 <code>dp[i]</code>（或 <code>dp[i][j]</code>）代表什麼。例：「以第 i 個結尾的最長遞增子序列長度」</td></tr>\n        <tr><td>轉移式</td><td>例：爬樓梯 <code>dp[i] = dp[i-1] + dp[i-2]</code>；打家劫舍 <code>dp[i] = max(dp[i-1], dp[i-2] + a[i])</code></td></tr>\n        <tr><td>Top-down vs Bottom-up</td><td>Top-down：遞迴＋memo（Python <code>@cache</code>），好寫。Bottom-up：迴圈填表，沒有遞迴深度問題、容易壓空間</td></tr>\n        <tr><td>滾動陣列</td><td><code>dp[i]</code> 只依賴 <code>dp[i-1]</code>（或前兩格）時，只留需要的那幾格，空間從 O(n) 降到 O(1)，二維降到一維</td></tr>\n        <tr><td>0/1 背包</td><td>每個物品最多拿一次：<code>dp[j] = max(dp[j], dp[j-w] + v)</code>，<b>j 由大到小</b>跑</td></tr>\n        <tr><td>完全背包</td><td>每個物品可拿無限次：同一個式子，<b>j 由小到大</b>跑。典型：零錢兌換</td></tr>\n        <tr><td>LIS／LCS</td><td>最長遞增子序列：O(n²) 的 DP，或 O(n log n) 的「tails 陣列＋二分」。最長共同子序列：<code>dp[i][j]</code> 看兩字串前 i、j 個字元</td></tr>\n        <tr><td>區間 DP</td><td><code>dp[i][j]</code> 代表區間 <code>[i, j]</code> 的答案，<b>按區間長度由短到長</b>填。典型：最長回文子序列、戳氣球</td></tr>\n      </tbody></table></div>",
          "anchor": "p10-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>什麼時候能用 DP？</b>兩個條件：<b>重疊子問題</b>（同一個小問題被問很多次，例如暴力費氏數列）和<b>最佳子結構</b>（大問題的最佳解由小問題的最佳解組成）。</li>\n        <li><b>0/1 背包為什麼 j 要倒著跑？</b>一維陣列裡，<code>dp[j-w]</code> 應該是「還沒考慮這個物品」時的值。正著跑的話，<code>dp[j-w]</code> 已經在這一輪被更新過（已經拿過這個物品），等於同一個物品拿了兩次，就變成完全背包。</li>\n        <li><b>零錢「組合數」和「排列數」差在迴圈順序：</b>外層跑硬幣、內層跑金額 → 每種硬幣依序考慮，<code>1+2</code> 和 <code>2+1</code> 只算一次（組合）。外層跑金額、內層跑硬幣 → 順序不同算不同（排列）。</li>\n        <li><b>為什麼貪婪不行、要 DP？</b>硬幣 <code>{1, 3, 4}</code> 湊 6：貪婪先拿最大的 4，得到 4+1+1 共 3 枚；最佳解是 3+3 共 2 枚。貪婪只看眼前，DP 會比較所有拆法。</li>\n        <li><b>LIS 的 O(n log n) 怎麼來？</b><code>tails[k]</code> 存「長度為 k+1 的遞增子序列，最小可能的結尾」。這個陣列是遞增的，所以每個新數字用二分（P03）找位置替換或接在尾端。</li>\n      </ul>\n<p class=\"codecap\">0/1 背包（一維）：容量由大到小</p>\n<pre><code>def knapsack(weights, values, cap):\n    dp = [0] * (cap + 1)            # dp[j]：容量 j 時的最大價值\n    for w, v in zip(weights, values):\n        for j in range(cap, w - 1, -1):   # 倒著跑，每個物品只用一次\n            dp[j] = max(dp[j], dp[j - w] + v)\n    return dp[cap]</code></pre>\n<p class=\"codecap\">零錢兌換（最少枚數，完全背包）：初始值是重點</p>\n<pre><code>def coin_change(coins, amount):\n    INF = float('inf')\n    dp = [0] + [INF] * amount       # 求最小 → 初值無限大；湊 0 元要 0 枚\n    for c in coins:\n        for j in range(c, amount + 1):    # 正著跑，硬幣可重複用\n            dp[j] = min(dp[j], dp[j - c] + 1)\n    return dp[amount] if dp[amount] != INF else -1</code></pre>",
          "anchor": "p10-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>0/1 背包的答案偏大</td><td>一維 dp 的容量迴圈正著跑，物品被重複拿</td><td>改倒著跑</td></tr>\n        <tr><td>求最小值的 DP 永遠回傳 0</td><td>初值設成 0，min 永遠取到 0</td><td>初值設無限大，只有起點（如 <code>dp[0]</code>）設 0</td></tr>\n        <tr><td>「有幾種方法」的答案比預期多</td><td>迴圈順序讓不同順序被重複計算（算成排列）</td><td>確認題目要組合還是排列，調整內外層</td></tr>\n        <tr><td>答案很大時變成負數</td><td>計數溢位</td><td>照題目每步 <code>% (10**9 + 7)</code>；C#／C++ 用 <code>long</code></td></tr>\n        <tr><td>Top-down 寫法在 n 很大時 <code>RecursionError</code></td><td>遞迴深度＝狀態鏈的長度</td><td>改 bottom-up 迴圈</td></tr>\n        <tr><td>區間 DP 用到還沒算的格子</td><td>依 i、j 的順序填，而不是依區間長度</td><td>外層跑長度，內層跑起點</td></tr>\n      </tbody></table></div>",
          "anchor": "p10-l3"
        }
      ]
    },
    {
      "id": "P11",
      "anchor": "p11",
      "tag": "P11",
      "name": "貪婪與區間",
      "sub": "排序鍵、反例",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>貪婪是「每一步都拿當下看起來最好的，而且不回頭」。它很快（通常就是一次排序 O(n log n)），但<b>不一定對</b>。用之前先想一個反例；想不到反例、又能用「交換論證」說服自己，才放心用。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>區間排程（最多不重疊）</td><td>依<b>結束時間</b>排序，能放就放。典型：無重疊區間（要刪幾個）、射氣球</td></tr>\n        <tr><td>區間合併</td><td>依<b>開始時間</b>排序，下一個的開始 ≤ 目前的結束就合併、結束取較大</td></tr>\n        <tr><td>會議室數量</td><td>同時重疊最多幾個：開始、結束時間分開排序後掃描；或依開始排序＋min-heap 存結束時間</td></tr>\n        <tr><td>跳躍遊戲</td><td>維護「目前能到的最遠位置」，掃描時若 i 超過它就到不了</td></tr>\n        <tr><td>反例檢驗</td><td>拿小例子試貪婪規則，找一個讓它失敗的輸入。找到就改用 DP</td></tr>\n      </tbody></table></div>",
          "anchor": "p11-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>區間排程為什麼依結束時間排，不依開始時間？</b>選最早<b>結束</b>的，留給後面的空間最多。依開始時間排會挑到「很早開始但拖很長」的區間，一個佔掉好幾個的位置。反例：<code>[1,10]、[2,3]、[4,5]</code>，依開始時間會選 [1,10] 只放得下 1 個，依結束時間可以放 2 個。</li>\n        <li><b>交換論證是什麼？</b>假設最佳解第一個選的不是貪婪選的那個，把它換成貪婪選的，結果不會變差。一路換下去，就證明貪婪解至少一樣好。</li>\n        <li><b>區間合併為什麼依開始時間？</b>依開始排序後，能跟目前區間合併的一定緊接在後面，一次掃描就能處理完。</li>\n        <li><b>端點相碰算不算重疊？</b><code>[1,2]</code> 和 <code>[2,3]</code>：會議室題通常算不重疊（2 點結束就能接 2 點開始）；合併區間題通常算重疊。<b>看題目</b>，決定用 <code>&lt;</code> 還是 <code>&lt;=</code>。</li>\n      </ul>\n<p class=\"codecap\">區間排程：最多能留幾個不重疊的區間</p>\n<pre><code>def max_non_overlap(iv):\n    iv.sort(key=lambda x: x[1])     # 依結束時間\n    cnt, end = 0, float('-inf')\n    for s, e in iv:\n        if s &gt;= end:                # 端點相碰算不重疊（依題意調整）\n            cnt += 1; end = e\n    return cnt</code></pre>",
          "anchor": "p11-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>區間排程留下的區間偏少</td><td>依開始時間排序</td><td>改依結束時間</td></tr>\n        <tr><td>端點剛好相等的測資答錯</td><td><code>&lt;</code>／<code>&lt;=</code> 跟題意不符</td><td>回頭讀題目怎麼定義重疊，寫一筆端點相等的測資</td></tr>\n        <tr><td>貪婪通過範例、送出後 Wrong Answer</td><td>貪婪規則本身不成立</td><td>用小例子找反例；找到就改 DP（P10）</td></tr>\n        <tr><td>合併區間後漏了最後一段</td><td>迴圈結束後沒把最後一個區間加進結果</td><td>迴圈後補一次加入，或一開始就把第一段放進結果，之後只改它的結束</td></tr>\n      </tbody></table></div>",
          "anchor": "p11-l3"
        }
      ]
    },
    {
      "id": "P12",
      "anchor": "p12",
      "tag": "P12",
      "name": "Heap 與 Top-K",
      "sub": "大小為 k 的堆、雙堆",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>Heap（優先佇列）能在 O(log n) 內加入元素、在 O(1) 內看到最小（或最大）值。題目一出現「前 K 大」「第 K 小」「一直有新資料、隨時要最值」，就想到它。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>二元 heap</td><td>完全二元樹存在陣列裡，父節點 ≤ 子節點（min-heap）。push／pop O(log n)、看頂端 O(1)、把整個陣列建成 heap（heapify）O(n)</td></tr>\n        <tr><td>Python <code>heapq</code></td><td>只有 min-heap；要 max-heap 就把值取負號存進去</td></tr>\n        <tr><td>C# <code>PriorityQueue&lt;TElement, TPriority&gt;</code></td><td>.NET 6 起內建，min-heap；要最大就傳反向的 comparer</td></tr>\n        <tr><td>Top-K 大</td><td>維持大小為 k 的 <b>min</b>-heap：新元素比頂端大就換掉頂端。O(n log k)</td></tr>\n        <tr><td>合併 K 條排序串列</td><td>把每條的頭放進 heap，每次取最小的，再把它的下一個放進去。O(N log k)</td></tr>\n        <tr><td>資料流中位數</td><td>兩個 heap：左半用 max-heap、右半用 min-heap，保持兩邊大小差 ≤ 1，中位數在兩個頂端</td></tr>\n      </tbody></table></div>",
          "anchor": "p12-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>找前 K 大為什麼用 min-heap？</b>heap 裡放的是「目前的前 K 名」，頂端是其中最小的那個，也就是<b>入圍門檻</b>。新來的比門檻大才有資格進來，把門檻踢掉。heap 永遠只有 k 個，所以每次操作是 log k 而不是 log n。</li>\n        <li><b>Heap、排序、Quickselect 怎麼選？</b>全部排序 O(n log n) 最簡單；k 遠小於 n 或資料是串流 → heap O(n log k)；只要第 K 個、不要順序 → Quickselect 平均 O(n)、最壞 O(n²)。</li>\n        <li><b>heapify 為什麼是 O(n) 不是 O(n log n)？</b>由下往上調整，大部分節點在底層、只需要往下調一兩層，加總起來是 O(n)。</li>\n        <li><b>雙 heap 為什麼能 O(1) 取中位數？</b>左邊 max-heap 的頂端是左半最大、右邊 min-heap 的頂端是右半最小，中位數就是其中一個或兩者平均。每次插入 O(log n)。</li>\n      </ul>\n<p class=\"codecap\">Top-K 大：大小為 k 的 min-heap</p>\n<pre><code>import heapq\ndef top_k(a, k):\n    h = []\n    for x in a:\n        if len(h) &lt; k: heapq.heappush(h, x)\n        elif x &gt; h[0]: heapq.heapreplace(h, x)   # 比門檻大才換\n    return sorted(h, reverse=True)</code></pre>",
          "anchor": "p12-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>Python 丟 <code>TypeError: '&lt;' not supported</code></td><td>heap 存 <code>(priority, 物件)</code>，priority 相同時去比物件</td><td>中間加一個遞增的計數器：<code>(priority, counter, 物件)</code></td></tr>\n        <tr><td>Top-K 拿到的是前 K 小</td><td>用 max-heap 存 k 個，或負號方向弄反</td><td>前 K 大用 min-heap；寫一筆小測資確認</td></tr>\n        <tr><td>中位數偶爾錯</td><td>兩個 heap 的大小沒平衡，或沒保證左頂 ≤ 右頂</td><td>每次插入先放進左邊，再把左頂搬到右邊，最後視大小搬回來</td></tr>\n        <tr><td>記憶體用量隨資料量一直漲</td><td>把 n 個元素全部放進 heap</td><td>heap 大小控制在 k</td></tr>\n      </tbody></table></div>",
          "anchor": "p12-l3"
        }
      ]
    },
    {
      "id": "P13",
      "anchor": "p13",
      "tag": "P13",
      "name": "位元運算",
      "sub": "XOR、lowbit、遮罩",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>把整數當成一排開關。三個最常用的性質：<b>相同的數 XOR 會抵銷</b>、<code>x &amp; (x-1)</code> 會關掉最低位的 1、<code>x &amp; -x</code> 會只留下最低位的 1。n ≤ 20 的「哪些元素被選了」可以用一個整數表示，這叫位元遮罩。韌體 register 操作也用同一套（K02）。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>運算</th><th>效果與典型用途</th></tr>\n        <tr><td><code>a ^ a = 0</code>、<code>a ^ 0 = a</code></td><td>XOR 可交換、可結合，成對的數全部抵銷。典型：只出現一次的數字、找缺少的數字</td></tr>\n        <tr><td><code>x &amp; (x - 1)</code></td><td>關掉最低位的 1。用途：數有幾個 1（迴圈做到 0 為止）；判斷 2 的冪：<code>x &gt; 0 and x &amp; (x-1) == 0</code></td></tr>\n        <tr><td><code>x &amp; -x</code>（lowbit）</td><td>只留下最低位的 1。Fenwick tree（樹狀陣列）的核心</td></tr>\n        <tr><td><code>(mask &gt;&gt; i) &amp; 1</code></td><td>第 i 位是不是 1（第 i 個元素有沒有被選）</td></tr>\n        <tr><td><code>mask | (1 &lt;&lt; i)</code>、<code>mask &amp; ~(1 &lt;&lt; i)</code></td><td>把第 i 位設 1／清 0</td></tr>\n        <tr><td><code>for m in range(1 &lt;&lt; n)</code></td><td>列舉 n 個元素的全部 2ⁿ 個子集</td></tr>\n      </tbody></table></div>",
          "anchor": "p13-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b><code>x &amp; -x</code> 為什麼只留最低位？</b>二補數裡 <code>-x = ~x + 1</code>。取反後最低位的 1 變成 0、它右邊的 0 全變成 1；加 1 會一路進位，剛好把那一位變回 1，其餘位都和 x 相反，AND 起來只剩那一位。</li>\n        <li><b>只出現一次的數字為什麼一路 XOR 就好？</b>XOR 不在乎順序，出現兩次的都兩兩抵銷成 0，最後剩下的就是只出現一次的那個。O(n) 時間、O(1) 空間，比 hash 省記憶體。</li>\n        <li><b>位元遮罩 DP：</b>n ≤ 20 左右時，用 <code>dp[mask]</code> 表示「已選了 mask 這些元素」的最佳值，狀態數 2ⁿ ≈ 100 萬。旅行推銷員問題就是 <code>dp[mask][最後停在哪]</code>，O(2ⁿ·n²)。</li>\n        <li><b>運算子優先順序陷阱（C／C#／C++）：</b><code>x &amp; 1 == 0</code> 會被解讀成 <code>x &amp; (1 == 0)</code>，因為 <code>==</code> 比 <code>&amp;</code> 優先。<code>1 &lt;&lt; i + 1</code> 是 <code>1 &lt;&lt; (i + 1)</code>。位元運算一律加括號。</li>\n      </ul>\n<p class=\"codecap\">只出現一次的數字／數 1 的個數</p>\n<pre><code>from functools import reduce\nsingle = reduce(lambda a, b: a ^ b, nums)\n\ndef popcount(x):\n    c = 0\n    while x:\n        x &amp;= x - 1      # 每次關掉一個 1\n        c += 1\n    return c            # Python 3.10+ 可直接 x.bit_count()</code></pre>",
          "anchor": "p13-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>判斷奇偶的 <code>if (x &amp; 1 == 0)</code> 永遠不成立</td><td>優先順序：先算 <code>1 == 0</code></td><td>寫成 <code>(x &amp; 1) == 0</code></td></tr>\n        <tr><td><code>1 &lt;&lt; 31</code> 變成負數</td><td><code>int</code> 是 32 位元有號數，第 31 位是符號位</td><td>用 <code>1u &lt;&lt; 31</code> 或 <code>1L &lt;&lt; 31</code></td></tr>\n        <tr><td>Python 處理負數的位元題結果怪異（無限迴圈）</td><td>Python 整數沒有固定位數，負數在概念上有無限個前導 1</td><td>先 <code>x &amp; 0xFFFFFFFF</code> 限制成 32 位元，最後再轉回有號數</td></tr>\n        <tr><td>右移負數得到意料外的值</td><td>有號數右移是算術右移（補符號位）</td><td>先轉成無號數再移（C# 11 起也有 <code>&gt;&gt;&gt;</code>）</td></tr>\n      </tbody></table></div>",
          "anchor": "p13-l3"
        }
      ]
    },
    {
      "id": "P14",
      "anchor": "p14",
      "tag": "P14",
      "name": "從限制反推解法",
      "sub": "n 範圍、攤銷、遞迴式",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>題目最下面的 <b>Constraints</b>（例如 <code>1 &lt;= n &lt;= 10^5</code>）其實是提示：一般線上評測約 1～2 秒，大約能跑 10⁸ 次簡單運算（數量級粗估），由 n 就能反推出可以接受的複雜度，再從複雜度推回可能的套路。Big-O 本身的觀念見 <a href=\"H-programming.html#h06\">H06</a>。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>n 的範圍</th><th>可接受的複雜度</th><th>常見套路</th></tr>\n        <tr><td class=\"num\">n ≤ 10</td><td class=\"num\">O(n!)</td><td>全排列、回溯暴力（P09）</td></tr>\n        <tr><td class=\"num\">n ≤ 20</td><td class=\"num\">O(2ⁿ)、O(2ⁿ·n)</td><td>子集列舉、位元遮罩 DP（P13）</td></tr>\n        <tr><td class=\"num\">n ≤ 500</td><td class=\"num\">O(n³)</td><td>區間 DP、Floyd 全點對最短路</td></tr>\n        <tr><td class=\"num\">n ≤ 5,000</td><td class=\"num\">O(n²)</td><td>二維 DP（LCS）、雙層迴圈</td></tr>\n        <tr><td class=\"num\">n ≤ 10⁵～10⁶</td><td class=\"num\">O(n log n)、O(n)</td><td>排序、heap、二分、雙指標、滑動視窗、hash、單調堆疊</td></tr>\n        <tr><td class=\"num\">n ≥ 10⁹</td><td class=\"num\">O(log n)、O(1)</td><td>對答案二分、數學公式、快速冪</td></tr>\n      </tbody></table></div>",
          "anchor": "p14-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>攤銷分析：</b>看的是「整個過程的總成本」，不是單一步的最壞情況。動態陣列 append 偶爾要搬全部（O(n)），但攤到每次只有 O(1)；滑動視窗、單調堆疊的內層 while 也是一樣：每個元素總共只進出一次。攤銷是<b>保證</b>的總量，跟「平均情況」（靠運氣，如 hash 不碰撞）不同。</li>\n        <li><b>遞迴的複雜度怎麼算？</b>寫出遞迴式：merge sort 是 <code>T(n) = 2T(n/2) + O(n)</code> → O(n log n)；二分是 <code>T(n) = T(n/2) + O(1)</code> → O(log n)；樹的 DFS 每個節點一次 → O(n)。暴力費氏數列 <code>T(n) = T(n-1) + T(n-2)</code> 是指數級，加 memo 後變 O(n)。</li>\n        <li><b>DP 的複雜度 = 狀態數 × 每個狀態的轉移成本。</b>例：LCS 有 m×n 個狀態、每個 O(1) 轉移 → O(mn)；LIS 的 O(n²) 版是 n 個狀態、每個看前面全部 → O(n²)。</li>\n        <li><b>空間也要算：</b>遞迴深度會佔 stack（樹高、回溯深度），DP 表格可能 O(n²)。滾動陣列可以把 DP 的空間壓下來（P10）。</li>\n      </ul>",
          "anchor": "p14-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>n = 10⁵，送出後 Time Limit Exceeded</td><td>寫了 O(n²)：雙層迴圈，或迴圈裡藏了 O(n) 的操作</td><td>對照上表找 O(n log n) 以下的套路</td></tr>\n        <tr><td>Python 看起來是 O(n) 卻超時</td><td>藏起來的 O(n)：<code>list.pop(0)</code>、<code>x in list</code>、<code>list.insert(0, x)</code>、迴圈裡字串相加</td><td>改 <code>deque.popleft()</code>、<code>set</code>、<code>\"\".join</code></td></tr>\n        <tr><td>記憶體超限（Memory Limit Exceeded）</td><td>開了 n×n 的 DP 表，或 memo 存太多</td><td>用滾動陣列；確認狀態是否真的要兩維</td></tr>\n        <tr><td>本機小測資秒過，大測資卡住</td><td>遞迴沒有 memo，重複算子問題</td><td>加 <code>@cache</code> 或改 bottom-up</td></tr>\n      </tbody></table></div>",
          "anchor": "p14-l3"
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
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>這兩個</th><th>差在哪</th></tr>\n      <tr><td>滑動視窗 vs 前綴和＋hash</td><td>視窗要單調性（通常全是正數）；有負數、或問「恰好等於 k 的個數」改用前綴和＋hash（P02、P04）</td></tr>\n      <tr><td>對撞指標 vs 快慢指標</td><td>對撞：兩頭往中間，通常要先排序；快慢：同方向，一個負責讀、一個負責寫或比速度（P01、P06）</td></tr>\n      <tr><td>閉區間 vs 左閉右開二分</td><td>前者 <code>while lo &lt;= hi</code>、<code>hi = mid - 1</code>；後者 <code>while lo &lt; hi</code>、<code>hi = mid</code>。不要混用（P03）</td></tr>\n      <tr><td>lower_bound vs upper_bound</td><td>第一個 ≥ x vs 第一個 &gt; x；兩者相減就是 x 的個數（P03）</td></tr>\n      <tr><td>單調堆疊 vs 單調佇列</td><td>堆疊：找每個元素左右第一個更大／更小；佇列：求滑動視窗的最大／最小值，兩頭都會出（P05、P02）</td></tr>\n      <tr><td>BFS vs DFS</td><td>BFS 一層一層走，無權重最短路用它；DFS 一路走到底，連通、回溯、樹的回傳值用它（P07、P08）</td></tr>\n      <tr><td>Dijkstra vs BFS</td><td>邊權重全相同 → BFS；權重不同但非負 → Dijkstra；有負權重 → Bellman-Ford（P08）</td></tr>\n      <tr><td>回溯 vs DP</td><td>要列出每個方案 → 回溯；只要數量或最佳值、子問題重複 → DP（P09、P10）</td></tr>\n      <tr><td>0/1 背包 vs 完全背包</td><td>一維寫法只差容量迴圈方向：倒著跑每個物品只用一次，正著跑可重複用（P10）</td></tr>\n      <tr><td>貪婪 vs DP</td><td>貪婪不回頭、快但可能錯；DP 比較所有拆法、慢但正確。貪婪要能用交換論證說明或找不到反例（P11）</td></tr>\n      <tr><td>區間排程 vs 區間合併</td><td>排程（最多不重疊）依結束時間排序；合併依開始時間排序（P11）</td></tr>\n      <tr><td>Top-K 大用 min-heap vs max-heap</td><td>min-heap 大小 k：O(n log k)，頂端是入圍門檻；max-heap 放全部再 pop k 次：O(n + k log n)（P12）</td></tr>\n      <tr><td>攤銷 vs 平均</td><td>攤銷是整個操作序列總量的保證；平均是看輸入分布的期望值（P14）</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "terms",
      "title": "英文術語",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>英文</th><th>中文</th><th>常見用法</th></tr>\n      <tr><td>Two pointers</td><td>雙指標</td><td>Use two pointers moving toward each other on the sorted array.</td></tr>\n      <tr><td>Prefix sum</td><td>前綴和</td><td>Precompute prefix sums to answer range queries in O(1).</td></tr>\n      <tr><td>Sliding window</td><td>滑動視窗</td><td>Shrink the sliding window while it contains a duplicate.</td></tr>\n      <tr><td>Monotonic stack</td><td>單調堆疊</td><td>A monotonic stack finds the next greater element in linear time.</td></tr>\n      <tr><td>Sentinel node</td><td>哨兵節點（dummy）</td><td>A sentinel node removes the special case for the head.</td></tr>\n      <tr><td>Topological sort</td><td>拓撲排序</td><td>Topological sort fails if the graph has a cycle.</td></tr>\n      <tr><td>Disjoint set union</td><td>並查集</td><td>Path compression makes disjoint set operations nearly constant time.</td></tr>\n      <tr><td>Backtracking</td><td>回溯</td><td>Prune the backtracking tree as early as possible.</td></tr>\n      <tr><td>Memoization</td><td>記憶化</td><td>Memoization turns the exponential recursion into O(n).</td></tr>\n      <tr><td>Overlapping subproblems</td><td>重疊子問題</td><td>DP applies when there are overlapping subproblems.</td></tr>\n      <tr><td>Exchange argument</td><td>交換論證</td><td>An exchange argument proves the greedy choice is safe.</td></tr>\n      <tr><td>Priority queue</td><td>優先佇列</td><td>Keep a priority queue of size k for the top k elements.</td></tr>\n      <tr><td>Bitmask</td><td>位元遮罩</td><td>Represent the chosen subset as a bitmask.</td></tr>\n      <tr><td>Amortized analysis</td><td>攤銷分析</td><td>Amortized analysis shows each element is pushed and popped once.</td></tr>\n      <tr><td>Time Limit Exceeded</td><td>超時</td><td>The O(n²) solution got Time Limit Exceeded at n = 10⁵.</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "sources",
      "title": "出處",
      "blocks": [
        {
          "t": "html",
          "html": "<ol class=\"sources\">\n      <li><b>P03</b>　https://docs.python.org/3/library/bisect.html （bisect_left／bisect_right 的定義）</li>\n      <li><b>P12</b>　https://docs.python.org/3/library/heapq.html （heapq 是 min-heap、heapify 線性時間、同優先權加計數器的建議）；https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.priorityqueue-2 （.NET 6 起的 PriorityQueue）</li>\n      <li><b>P13</b>　https://docs.python.org/3/library/stdtypes.html#int.bit_count （Python 3.10 起 bit_count）</li>\n      <li class=\"muted\">撰寫日 2026-10-14。其餘內容（各套路的正確性論證、Floyd 找環、交換論證、n 範圍對照表、每秒約 10⁸ 次運算）依演算法通論撰寫、未逐一附一手出處；n 範圍表與運算速度只是數量級經驗值，各評測平台的時間限制不同。</li>\n    </ol>"
        }
      ]
    }
  ],
  "css": ".kb-P pre { background: var(--soft); border-radius: 6px; padding: 12px 14px; overflow-x: auto; font-size: 13px; line-height: 1.55; margin: 12px 0; max-width: 100%; }\n.kb-P pre code { background: none; padding: 0; font-size: 13px; }\n.kb-P .codecap { font-size: 12px; color: var(--muted); margin: 14px 0 -6px; font-family: var(--mono); }\n.kb-P td.num { font-family: var(--mono); white-space: nowrap; }\n"
}

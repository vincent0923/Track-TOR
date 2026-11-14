# 更新日志 / Changelog

每个版本改了什么。格式参考 [Keep a Changelog](https://keepachangelog.com/)。

Everything that changed, version by version. Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [v1.55a] — 2026-11-14

### 新增 / Added
- 🥚 **蛋白质目标**：长按饮食页的蛋白质圆环，打开蛋白质目标。灰字是按你的性别、年龄、身高、体重每天算的推荐值，可以自己填一个目标，留空就跟着推荐；「i」里是增肌同时减脂的推荐范围（每公斤体重 1.6–2.2 g）和怎么吃。
  **Protein target**: long-press the protein ring on the food page. The grey number is a daily recommendation from your sex, age, height and weight; type your own target or leave it blank to follow it. The "i" explains the range for building muscle while losing fat (1.6–2.2 g per kg) and how to spread it.

### 改进 / Changed
- Spotify 面板去掉 Redirect URI 一栏；连接时一次要齐播放相关的权限；歌单按最近播放的歌出自哪个歌单排序；在歌单格子里滚动不会再把面板拉下来。
  The Spotify panel drops the Redirect URI field; connecting asks for every playback permission at once; playlists are ranked by how many recent plays they hold; scrolling the playlist grid no longer pulls the panel closed.

---

## [v1.54a] — 2026-11-14

### 新增 / Added
- 🎶 **选歌单**：完整播放器里点「歌单」，列出你的 Spotify 歌单，点一个就开始放；可以随机播放
- 🎶 **Pick a playlist**: tap Playlists in the full player to list your Spotify playlists and play one, shuffled if you like
- 🔀 **随机和循环**：播放器多了随机播放和循环（整个歌单 / 单曲）两个按钮
- 🔀 **Shuffle and repeat** buttons in the player (repeat the playlist or one track)
- 🏋️ **训练时也能听**：开练后播放器变成专注页顶上的一条细条；在播放器上左右划切歌；没在放时一点就接着放上次的歌单
- 🏋️ **Music while you train**: during a session the player becomes a slim bar at the top of the focus screen; swipe the player to change songs; when nothing is playing, one tap resumes your last playlist

## [v1.53a] — 2026-11-14

### 新增 / Added
- 🧭 **设定 › 进阶**：饮食表格链接、给记账 AI 的格式（可一键复制）、Spotify（自己粘贴 Client ID，一键复制回调地址）都放在这里；每连好一项奖励 1000 G
- 🧭 **Settings › Advanced**: the food table link, the format to give your food-logging AI (one tap to copy) and Spotify (paste your own Client ID, copy the redirect URI) live here; each one you connect earns 1000 G

### 改进 / Improved
- 设定里关掉一个面板会回到上一级菜单，不再直接回首页；语言改回一排三个按钮；G 积分商场换成调色盘图标
- Closing a panel in Settings returns to the menu above instead of the home page; language is a row of three buttons again; the G shop row has a palette icon

## [v1.52a] — 2026-11-14

### 新增 / Added
- 🎵 **迷你播放器**（设定 › 音乐）：遥控手机上的 Spotify，底栏上方一个小胶囊看正在放什么、暂停、下一首，点开是完整播放器（封面、进度、上一首 / 下一首、音量）。需要 Spotify Premium；没连之前可以先预览样子
- 🎵 **Mini player** (Settings › Music): a remote for Spotify on your phone, a capsule above the tab bar showing what's on with pause and next, and a full player on tap (artwork, progress, previous / next, volume). Needs Spotify Premium; a preview shows the look before you connect
- 🪙 **G 充值文件**：在备份里导入一个充值文件只加 G，别的数据不动，同一个文件只算一次
- 🪙 **G top-up file**: importing one from Backup adds G and nothing else; the same file counts once
- 🧱 **主项卡堆**：进展页的主项是两张积木卡（单组最好、每周总数），手指划过读每一列的数
- 🧱 **Main-exercise stack**: on Progress the main exercise is two brick cards (best set, weekly total); run a finger across to read each column

## [v1.51a] — 2026-11-14

### 新增 / Added
- 🧱 **每周总数**：进展页新卡片，主项最近 12 周每周做了多少次，用一块块积木摞出来，最多的一周换颜色；手指划过积木会依次弹起，带轻微振动。饮食页的缺口 / 盈余柱子也换成了积木
- 🧱 **Weekly total**: a new card on Progress stacks the last 12 weeks of your main exercise as bricks, the best week in a second colour; run a finger across and the bricks hop with a light buzz. The deficit/surplus bars on Diet are bricks too
- 🎛️ **旋钮**：图表的时间范围和语言改成旋钮，可以转、点一下跳下一档，或直接点标签
- 🎛️ **Knobs**: chart range and language are now knobs: turn them, tap for the next step, or tap a label
- ✨ **特效菜单**（设定 › 外观 › 特效）：光追强弱（关 / 柔 / 标准 / 极致）、天气、两天没练就落灰（越久越旧，一打勾就擦干净）、庆祝效果
- ✨ **Effects menu** (Settings › Appearance › Effects): ray-traced light strength (off / soft / standard / max), weather, dust after two days off (it gets older the longer you stay away and wipes clean on your next tick), celebrations
- 🎉 **每套主题自己的庆祝和声音**：玩具撒积木，钴蓝点阵爆闪，拉丝铝霓虹环和钢珠，米白飘圆片，黏土软泥团，随身机像素块，各配一套音效
- 🎉 **Celebrations and sounds per theme**: bricks for Toy, a dot-matrix strobe for Cobalt Synth, neon rings and steel balls for Brushed Alloy, fluttering discs for Cream · Persimmon, squishy blobs for Clay · Mint, pixels for Pocket Player, each with its own sound set
- 📻 **随身机主题**（120 G，亮暗两版）：油润塑料机身、凹碟方键、点阵屏
- 📻 **Pocket Player theme** (120 G, light and dark): oily plastic, dished square keys, a dot-matrix screen

### 改进 / Improved
- 页面标题自动缩小，不再碰到顶栏按钮；目标的名字不再折行
- Page titles shrink to fit beside the header buttons; goal names stay on one line

## [v1.50a] — 2026-11-13

### 新增 / Added
- 🌱 **自由练**：不用选计划。建议按你最近 3 周记过的动作（训练和加练都算）排，先练最久没练的部位，每个动作从上次接着加，每次至少 2 个动作、5 组；散步、骑车这类只记录不排。练法稳定后会提示存成你自己的计划。新用户默认就是它。
- 🌱 **Free training**: no plan needed. Suggestions come from the moves you've logged in the last 3 weeks (sessions and extra practice), the body part trained longest ago first, each move carrying on from last time, at least 2 moves and 5 sets; walks and rides are recorded, not planned. Once a pattern settles, it offers to keep it as your own plan. New users start here.

## [v1.49a] — 2026-11-13

### 新增 / Added
- 🧩 **自定义训练计划**：训练计划面板最下面选 1、2 或 3 种训练日，把你练过的每个动作放到某一天。每个动作从你上次的组数、次数、秒数接着练，一点点加难度，不换动作、不加新动作。
- 🧩 **Your own training plan**: at the bottom of the plan panel pick 1, 2 or 3 training days and put each move you've done on one of them. Every move carries on from your own last sets, reps and seconds and gets a little harder; no swapped or new moves.

## [v1.48a] — 2026-11-13

### 新增 / Added
- 🌗 **顶栏明暗开关**：同步按钮左边，点一下切换亮暗，长按进主题页。每个主题都有亮、暗两版。
- 🌗 **Light/dark switch in the header**: left of the sync button; tap to flip, hold for themes. Every theme has a light and a dark version.
- 🎨 **用 G 换主题**：新主题「暖砂 · 流金」60 G（亮色暖砂配绯橙，暗色黑曜石配流金）；草木 · 极光免费。
- 🎨 **Spend G on themes**: the new Sand · Amber theme costs 60 G (warm sand with signal orange by day, obsidian with liquid gold by night); Meadow · Aurora stays free.
- 📅 **日历上点练过的日子**，底部出现那天练的动作（同色小图标），旁边的笔才打开去改。
- 📅 **Tap a trained day on the calendar** to see what you did, with a matching icon; the pen beside it opens the day to edit.

### 改动 / Changed
- 日历照 SplitFlow 原稿缩小，练过的日子整格染色；亮色下训练卡是浅色。
- The calendar is smaller, after the SplitFlow original, with trained days tinted; in light mode the training card is light.

## [v1.47a] — 2026-11-13

### 新增 / Added
- ✏️ **进展页的卡片可以编辑**：长按任意一张，拖动换位置，× 隐藏，浮动的「+」把隐藏的加回来。
- ✏️ **Edit the Progress tiles**: long-press any tile, drag to reorder, × to hide, and the floating + brings hidden ones back.

### 改动 / Changed
- 日历默认展开；离开本月时出现复位按钮，只回到今天，不再打开加练（点日历上的今天那格才打开）。缺口卡片改成毛玻璃卡片叠；饮食记录一张七天，翻到旧的时出现复位按钮；「记一笔」换成一个小「+」。
- The calendar opens expanded; away from this month a reset button brings you back without opening anything (tap today's cell for extra practice). The calorie-gap card is a frosted card stack; food records come seven to a card with a reset button when you're looking at older ones; "Log" is now a small +.

## [v1.46a] — 2026-11-13

### 新增 / Added
- 🎯 **主项目标**：目标里的引体换成你自己选的主项。从训练计划的动作里选（打勾就自动记单组最好的一次，训练引擎不会把它换成别的动作，只让次数一直往上加），或者自己写一个（跑步 km、游泳分钟……），手动记。默认还是标准引体，原来的记录不变。
- 🎯 **Main exercise goal**: the pull-up goal becomes a main exercise you choose. Pick a move from your plan (your best ticked set is recorded automatically, and the engine never swaps it for another move, it just keeps adding reps), or name your own (running km, swimming minutes…) and log it by hand. Pull-ups stay the default; nothing changes in your records.
- 🃏 **日历和饮食记录也是毛玻璃卡片叠**：日历左右划换周或月（不再有箭头），右上角「今天」回来；饮食记录一张五天，更早的压在下面。
- 🃏 **The calendar and food records are frosted card stacks too**: swipe the calendar for weeks or months (no more arrows), Today brings you back; food records come five days to a card, older ones underneath.

### 修复 / Fixed
- 之前恢复进度文件时对错动作的训练（反向划船记成引体），打开 app 时自动改回来。
- Sessions an earlier restore put on the wrong moves (rows read as pull-ups) are put right when the app opens.

## [v1.45a] — 2026-11-13

### 新增 / Added
- 📤 **把一天的饮食分享成图片**：饮食记录点开某天，右上角的分享按钮把这天的表格画成一张图，发给朋友。表格加了蔬菜列，食物名太长就折行显示全。
- 📤 **Share a day's food as a picture**: open a day in the food log and the share button at the top turns its table into an image to send to friends. The table gains a veg column, and long food names wrap instead of being cut.
- 🌐 **切换语言不再重新打开页面**：在设定里点简中、繁中或 Eng，面板和页面当场换语言。
- 🌐 **Switching language no longer reloads**: tap 简中, 繁中 or Eng in Settings and the panel and page change on the spot.

### 改动 / Changed
- 可练的训练卡右上角就是「开练」，预告卡同一位置是 ✨；收起的卡片露出前几个动作、往下渐渐淡出。天气效果挪进设定 › 外观。
- Ready training cards have Grind at the top right, previews have ✨ in the same spot; folded cards show the first moves fading out. Weather effects moved under Settings › Appearance.

## [v1.44a] — 2026-11-13

### 新增 / Added
- 💾 **进度文件带上饮食表格链接**，恢复后不用再贴；**不再带高驰授权**，换手机恢复后重新连一次高驰（旧文件里的授权也不再恢复）。
- 💾 **Progress files carry the food table link**, so it's there after a restore; **they no longer carry the COROS sign-in**: connect COROS again on a new phone (sign-ins in older files aren't restored either).
- 📋 **饮食表格的输入框**：右边一个粘贴按钮（剪贴板里有别的字也只取链接），点输入框就全选原来的链接，回车直接拉取；下面一句提醒别把链接告诉别人。
- 📋 **The food table box**: a paste button on its right (takes just the link from whatever's on the clipboard), tapping the box selects the link that's there, Enter pulls; a line below reminds you to keep the link to yourself.

### 修复 / Fixed
- 新手机先选了训练计划再恢复进度文件时，早期训练的数会对到错的动作上（比如反向划船 20 个变成引体 20 个）。现在每次训练按它当时的动作单恢复。之前恢复错的，用同一个进度文件再恢复一次就对了。
- Restoring a progress file on a new phone that had already picked a plan could put early sessions' numbers on the wrong moves (20 inverted rows showing as 20 pull-ups). Each session now restores with the moves it was done with; restoring the same file again puts things right.

## [v1.43a] — 2026-11-13

### 新增 / Added
- 🎆 **庆祝效果搬过来了**：每打一个勾放一支烟花（带爆炸声），做完一个动作彩带加三支烟花，整次练完两边礼炮加一场烟花、最后一支大的；目标圆环每跨过一个新的 2% 放一场烟花；今天的加练每记一组也放一支。设定 › 外观里有「庆祝效果」开关。
- 🎆 **Celebrations are back**: a firework (with a bang) for every tick, confetti and three fireworks for each finished exercise, cannons and a firework show ending in a big one for a finished session, a show for each new 2% step on a goal ring, and one firework per extra set logged today. Settings › Appearance › Celebrations turns them off.
- 🀄 **繁体中文**：设定 › 语言是一行三格：简中、繁中、Eng。繁中用台湾用字，弹窗和确认框也是繁体。
- 🀄 **Traditional Chinese**: Settings › Language is one row of three: 简中, 繁中, Eng. 繁中 uses Taiwan forms, dialogs included.

### 移除 / Removed
- 经典界面（`classic.html`）和它的 29 套主题、Dock 排序、磨损、年度打卡图等都删掉了，只留现在的界面；之前选了经典界面的人打开后直接进现在的界面。数据不受影响，旧进度文件照样能导入。经典界面的代码留在 GitHub 分支 `backup-classic-v1.42a`。
- The classic interface (`classic.html`) with its 29 themes, dock reordering, wear, the year heatmap and the rest is gone; anyone who had picked it now opens the current interface. Data is untouched and old progress files still import. Its code is kept on the GitHub branch `backup-classic-v1.42a`.

## [v1.42a] — 2026-11-13

### 新增 / Added
- 🌧️ **天气**：设定 › 天气里搜任何一个城市，或者点「用我现在的位置」（只在点的时候要一次定位）。屏幕跟着那里现在的天气变：下雨时玻璃上挂着水珠，攒大了才滑下来，沿路带走小水珠、留下一道水痕，同时滑的最多三四颗，不挡字也不挡按钮；下雪飘几片雪；雷雨偶尔闪一下；有雾、阴天有一层淡雾；白天晴天角落一团暖光。效果可以关，也可以试看 15 秒。天气每 20 分钟更新一次，数据来自 Open-Meteo，不用注册。手机设了「减少动态效果」时只画静止的水珠。
- 🌧️ **Weather**: in Settings › Weather, search any city in the world or tap "Use where I am" (location is asked only on that tap). The screen follows that place's current weather: in rain, drops sit on the glass, grow, then slide down, picking up smaller drops and leaving a thin wet trail, never more than three or four at a time so text and buttons stay clear; a few flakes in snow; a faint flash now and then in a thunderstorm; a soft haze in fog or overcast; a warm glow in one corner on a clear day. The effect can be turned off or previewed for 15 s. Weather refreshes every 20 minutes, from Open-Meteo (no sign-up). With "reduce motion" on, the drops stay still.

## [v1.41a] — 2026-11-13

### 新增 / Added
- 🗂️ **训练计划预设**：设定 › 训练计划里选：骑行者 AB（引体 + 俯卧撑，就是原来那套）、全身 1 分、上下肢 AB、推 / 拉 / 腿 3 分；最多三种训练日，每天的名字可以改。换计划后接下来的训练从新计划的动作开始排，练过的同名动作的成绩照样用来定次数；练过的记录不动。新用户填完欢迎页接着选计划。新增深蹲、分腿蹲、保加利亚分腿蹲、臀桥、单腿臀桥、派克俯卧撑的动作阶梯。
  **Training-plan presets**: Settings › Training plan offers Cyclist AB (pull-ups + push-ups, the plan so far), Full body, Upper / lower AB and Push / pull / legs; up to three training days, each renamable. After a switch, upcoming sessions start from the new plan's moves while results on the same moves still set the numbers; past records stay. New users pick a plan right after the welcome. New ladders: squats → split squats → Bulgarian split squats, glute bridges → single-leg, pike push-ups → feet-up pike.

### 改进 / Changed
- G 积分商场只在设定里（显示余额），进展页不再放 G 的小标签；商场里预留「大家写的训练计划」，即将上线。
  The G shop lives only in Settings (with the balance); the Progress card drops its G badge. The shop has a slot for plans written by users, coming soon.
- 进度文件里第三种训练日用 `t` 开头的键；旧文件照常导入。
  Progress files key the third training day with `t`; older files import as before.

---

## [v1.40a] — 2026-11-13

### 新增 / Added
- 📅 **日历点某天**：新界面的日历（本周一行或整月）点一天，弹出那天完成的训练（每个动作每组做了多少）、当天的饮食和体重腰围。训练旁边点「修改」就能改每组的次数、补打或取消勾，改完引擎按新记录重新排后面的训练。
  **Tap a calendar day**: in the new interface, tapping a day (week row or month) shows that day's finished sessions (reps per set), food and body numbers. Edit next to a session changes reps and ticks per set; when you're done the engine replans from the corrected record.
- 💪 **加练**：同一个面板里记加练：引体向上、俯卧撑、深蹲、平板支撑、悬吊，或者自己起名字的动作（按个数或按秒）；调好数点「记一组」，点已记的组可以撤销。有训练的那天记进那次训练，没训练的那天单独存，和经典界面一样。练完的总结卡上也有「加练」。
  **Extra practice**: the same panel logs extras: pull-ups, push-ups, squats, plank, dead hang, or a move you name (reps or seconds); set the number and tap Log a set, tap a logged set to undo it. On a training day they go into that session, otherwise into the day, as on the classic page. The finish card has Extra practice too.

---

## [v1.39a] — 2026-11-13

### 新增 / Added
- ⌚ **高驰搬进新界面**：点顶栏的同步小圆点就同步（没连过就弹出连接），同步时小圆点在转，今天同步过是绿色；高驰登录回来直接回到新界面；打开推拉机时，连着高驰且上次同步超过 2 小时，就在后台悄悄同步一次。进展页睡眠、HRV、静息心率的「从高驰同步」也在新界面里完成。头像 › 备份进度与高驰里可以连接、登出（保留数据或清除同步来的数据）。新界面里已经没有要跳到经典界面的地方了。
  **COROS in the new interface**: tap the sync dot at the top to sync (or connect, the first time); it turns while syncing and is green once synced today. The COROS sign-in returns to the new interface, and opening track-TOR with a connected watch syncs quietly when the last sync is over two hours old. Sync from COROS on the sleep, HRV and resting-HR panels works in place; Backup & COROS under the avatar connects and signs out (keeping or deleting synced data). Nothing in the new interface opens the classic page any more.

---

## [v1.38a] — 2026-11-13

### 新增 / Added
- ⚙️ **设定搬进新界面**：头像 › 更多里的个人资料、目标、备份进度、饮食表格、图表和同步（含手表热量开关）都在新界面里打开，不再跳到经典界面；进展页的目标圆环点了直接设目标。关掉同步的睡眠、HRV、静息心率不再在进展页显示。
  **Settings move into the new interface**: Profile, Goals, Backup, Food table and Charts & sync (with the watch-calories switch) under the avatar › More open in place instead of the classic interface; the Progress goal rings open the goals. Sleep, HRV and resting HR hide from Progress when their sync is off.
- 💾 **新界面里备份和恢复**：保存进度文件（iPhone 走系统分享里的「存储到文件」），选进度文件恢复，先显示里面有什么再确认；和经典界面的进度文件互通。每 5 天提醒一次备份。
  **Backup and restore in the new interface**: save a progress file (on iPhone through the share sheet's Save to Files) or pick one to restore, with a summary before you confirm; files are the same as the classic page's. A reminder every 5 days.
- 👋 **欢迎页在新界面**：第一次打开就在新界面填资料和目标，都能留空。
  **The welcome sheet in the new interface**: a first visit fills in profile and goals right here, all optional.

### 改进 / Changed
- 进度文件的打包挪到 `js/backupcore.js`，两个界面共用；格式没变。
  Progress-file packing moves to `js/backupcore.js`, shared by both interfaces; the format is unchanged.

---

## [v1.37a] — 2026-11-13

### 新增 / Added
- 🧠 **训练引擎**：不靠 AI，App 自己排训练。每类训练（推、拉）看你前 3 次的做组表现，排下 2 次：每组都做到 10 个（核心动作 15 个），就换动作阶梯上更难的一级（例如钻石俯卧撑 → 弓箭手俯卧撑）或改成慢速 3-1-1，再不行加一组；上次全部达标就加次数，起点按你实际做到的最少那组算，进步快的人跟得上；连着没达标就减次数或退一级；后面几组掉得太多就先保持；连续两次多个动作没达标，下一次减量。每个动作 2–4 组，每次 5–12 组，超了先减支撑和核心，引体最后减。每练完一次重新排；开练过（打过勾或改过数）的那次不动。训练卡上「按你前 3 次调整 · 为什么」打开每个动作的安排和理由，第二次标「预告」。取代原来固定的 20 天推拉计划，练过的记录照常保留。
  **Training engine**: the app plans training itself, no AI. Each kind (push, pull) looks at your last 3 sessions to plan the next 2: every set at 10 reps (15 for core moves) moves you up the exercise ladder (e.g. diamond → archer push-ups) or to a slow 3-1-1 tempo, then adds a set; every set on target adds reps, starting from your weakest set so fast progress keeps up; missing twice eases off or steps back; a big drop-off over the sets holds; two rough sessions in a row bring a lighter one. 2–4 sets a move and 5–12 a session, trimming holds and core first and pull-ups last. It replans after every session and leaves a started session alone. "Tuned to your last 3 · why" on the training card shows each move's plan and reason, with the second session marked as a preview. It replaces the fixed 20-day programme; past records stay.
- 🙂 **每个动作练完问感觉**：轻松、刚好、很难，可以跳过；引擎优先用它判断。
  **How did that feel?** after each move: easy, right or hard, skippable; the engine weighs it first.
- 🌐 **新界面英文版**：头像 › 语言切换中文和 English。英文用户不再被转到经典界面。
  **The new interface in English**: switch under the avatar › Language. English users are no longer sent to the classic interface.

### 改进 / Changed
- 积分改名「G」（Grind），「开始」改成「开练」（Grind）。
  Points are now called G (for Grind); Start is now 开练 / Grind.
- 饮食页缺口卡片高度固定，切换天数时柱子在固定高度里缩放，卡片不再跳；下面的小点更明显，暗色下也看得清。
  The Diet gap card keeps a fixed height: bars scale inside it when the period changes; the dots below are clearer, also in dark.
- 进展页图表面板里的涨跌跟着选的天数走（14、30、90 天或全部）。
  The change shown in a Progress chart panel follows the period you pick (14, 30, 90 days or all).
- 进度文件追加 `pe` 字段，保存引擎排的动作和每个动作的感觉；旧进度文件照常导入。
  Progress files gain a `pe` field holding the engine's exercises and how each felt; older files import as before.

---

## [v1.36a] — 2026-11-13

### 新增 / Added
- 🔄 **新界面里同步饮食表格**：打开饮食页时自动拉一次表格（半分钟内不重复），想立刻拉就把饮食页往下拉。拉取时顶栏的同步小圆点在转。
  **Food table sync in the new interface**: opening Diet pulls the table quietly (not again within half a minute); pull the page down to pull it now. The header's sync dot turns while it runs.
- 👆 **左右滑切换统计天数**：饮食页的缺口卡片左右滑，在过去 7、14、30 天和有记录以来之间切换，下面的小点表示在哪一档，也可以点；大数字像翻牌一样翻过去，柱子跟着换（有记录以来按周画）。14 天以上的脂肪克数前面按体重对账写「约」「激进估计」或「保守估计」。
  **Swipe to change the period**: swipe the Diet gap card to step through the last 7, 14, 30 days and since the first log; the dots below show which (and can be tapped), the figure turns over like a split-flap board and the bars follow (by week since the first log). Over 14 days the grams of fat read "about", "aggressive estimate" or "conservative estimate" after the check against weight.

---

## [v1.35a] — 2026-11-13

### 新增 / Added
- 🪙 **推拉币**：力量、减脂、腰围有真实进步就拿币。练完一次训练 10；一周练够 3 天 30（连着几周每周多 5，最多 60）；训练里打勾的引体单组每创一个新高 50；每减 0.5 kg 脂肪 50（估算和 7 日均体重变化取小的，防虚高）；腰围比第一次每少 1 cm 50；计划完成 10、20、40 次 100、200、400；每达成一个自己设的目标 500。币全部从记录里算出来，不另存，换手机恢复进度文件就回来。进展页目标卡右上角是余额，点开看每一项拿了多少、离下一档还差多少；练完的总结卡上显示这次拿了多少。
  **Push-pull coins**: real progress in strength, fat loss and waist earns coins. 10 per finished session; 30 for a week with 3 training days (5 more for each week in a row, up to 60); 50 for each new best strict pull-up set ticked in training; 50 per 0.5 kg of fat (the smaller of the estimate and the 7-day average weight change, so it can't run ahead); 50 per cm off the waist since the first record; 100, 200 and 400 at 10, 20 and 40 sessions; 500 for each goal you set and reach. Coins are worked out from the records, not stored, so restoring a progress file brings them back. The balance sits on the Goals card on Progress; open it to see what each item has paid and how far the next step is; the finish card shows what the session earned.
- 🛍️ **主题商店**（设定 › 外观，或推拉币面板里）：像素 RPG 和 Low poly 小镇两个主题，各 2,000 币，即将上线；亮、暗两套永远免费。
  **Theme shop** (Settings › Appearance, or the coins panel): Pixel RPG and Low-poly town, 2,000 coins each, coming soon; light and dark stay free.

---

## [v1.34a] — 2026-11-13

### 新增 / Added
- 🍽️ **新界面里直接记饮食和身体数据**：饮食页的「记一笔」、每天明细里的「编辑这天」、进展页引体体重腰围的「记一笔」不再跳到经典界面，弹出的面板换成新界面的样子，存完当场刷新。
  **Log food and body measures in the new interface**: Log on the Diet page, Edit this day in a day's details, and Log on the pull-up, weight and waist cards no longer open the classic interface; the editors take the new look and the page refreshes as soon as you save.

### 移除 / Removed
- 年轮试验页留在手机里的记录和原型留下的几个设置，打开推拉机时自动清掉。
  The Rings experiment's log and the prototypes' leftover settings are cleared from the phone on the next open.

---

## [v1.33a] — 2026-11-13

### 新增 / Added
- ✨ **新界面成为默认**：打开推拉机就是新设计的界面（原型 P1）：训练、饮食、进展三个标签；训练首页是下一次训练的大卡片加「开始」，日历默认一周、可展开整月；专注训练模式一次一个动作，拇指位大勾、组间自动倒计时、按秒计的动作自动计时，打过的勾点一下能撤销，所有勾和完成都直接记进训练记录；饮食首页是今天的缺口和蛋白质圆环；进展是目标圆环和指标卡片。还没搬过来的功能（记饮食、记体重腰围引体、高驰同步、个人资料、目标、备份、饮食表格、图表设定）点了会打开经典界面的对应位置，左上角有「返回」。
  **The new interface is now the default**: track-TOR opens in the new design (prototype P1) with Train, Diet and Progress tabs; the next session as a large card with Start, a one-week calendar that opens to the month; a focus mode with one exercise at a time, a thumb-sized tick, automatic rest countdowns and timers for timed holds, a tap on a done set to undo it, and every tick and finish saved to the training records; today's gap and a protein ring on Diet; goal rings and metric cards on Progress. What hasn't moved over yet (logging food and body measures, COROS sync, profile, goals, backup, the food table, chart settings) opens the classic interface at that spot, with Back at the top left.
- 🎨 **经典界面保留**：原来的界面和 29 套主题在头像 →「经典界面」，选了以后打开就是经典界面；经典界面「设定 › 主题」里的「换回新界面」回来。英文用户默认进经典界面（新界面暂时只有中文）。
  **The classic interface stays**: the original interface and its 29 themes are under avatar → Classic interface, which then opens by default; Switch to the new interface in its Settings › Theme comes back. English users open the classic interface by default, as the new one is Chinese only for now.

### 移除 / Removed
- 试验页「年轮」和好玩版原型 P2「赛段」。
  The Rings experiment and the fun prototype P2 (Stages).

---

## [v1.32a] — 2026-11-13

### 新增 / Added
- ⌚ **手表热量可以全算**：「设定 › 图表和同步设定」新增「手表热量」开关，打折（默认：日常活动按步数封顶、运动记录 × 0.7、低强度运动 × 0.5、有功率计的骑行全算）或全算（手表报多少算多少）。只改估算的消耗、热量缺口和减脂，同步来的数字不变；「i」里说明两种算法。长按饮食页「摄入与消耗」里的热量缺口小面板直接跳到这个开关。
  **Watch calories can count in full**: a new Watch calories switch in Settings › Charts & sync, discounted (the default: everyday movement capped by steps, logged workouts × 0.7, low-intensity ones × 0.5, power-meter rides in full) or in full (every kcal the watch reports). Only the estimated burn, calorie gap and fat loss change; synced numbers stay as they are. The i explains both. Holding the calorie-gap tile on the Diet page jumps straight to this switch.
- ⚖️ **脂肪对账**：统计 14 天以上时，缺口面板的脂肪克数和同期 7 日均体重变化对一下：差 15% 以内写「约」，估算多 15% 以上写「激进估计」，少 15% 以上写「保守估计」；算法写在「i」里。
  **Fat cross-check**: over 14 days or more, the gap tile's grams of fat are checked against the 7-day average weight over the same days: within 15% reads "about", more than 15% above "aggressive estimate", more than 15% below "conservative estimate"; the i explains it.
- 🧹 **每天的饮食卡片更干净**：表格下面不再列「手表活动 → 计入 · 体重」那行小字；消耗、缺口随开关变。
  **Cleaner daily food cards**: the small "watch activity → counted · weight" line under the table is gone; burn and gap follow the switch.

---

## [v1.31a] — 2026-11-10

### 新增 / Added
- 🧭 **底部 Dock，五个标签**：训练、饮食、身体、目标、设定挪到屏幕底部，大屏手机拇指够得着。中间那格最大、写着名字，是首页，打开推拉机就停在这里。长按一个标签拿起来，左右拖到别的位置松手，像 macOS 的 Dock；顺序会记住。
  A dock at the bottom with five tabs: Train, Diet, Body, Goals and Settings sit along the bottom edge, within thumb reach on a big phone. The middle slot is the biggest, shows its name and is the home page the app opens on. Hold a tab to pick it up and drag it to a new place, like the macOS Dock; the order is remembered.
- 🫀 **身体仪表盘**：「数据」标签把引体、体重、腰围和睡眠、HRV、静息心率放在一页。关掉过的图，在最下面有一个带 + 的圆形按钮，点开就能加回来。
  Body dashboard: the Body tab puts the year of training, pull-ups, weight, waist, sleep, HRV and resting HR on one page. Charts you switched off can be added back from a round + at the bottom.
- 🎯 **目标标签**：目标卡和目标设定有了自己的标签。长按一个目标打开它的小面板：改目标、手动记录（引体、腰围、体重）、是否在面板显示。没显示的目标，卡片最下面有带 + 的圆形按钮加回来。隐私模式下，减脂显示热量缺口（kcal）而不是脂肪公斤数。
  Goals tab: the goal card and goal settings have their own tab. Hold a goal for its sheet: the goal, a manual record (pull-ups, waist, weight) and whether it shows on the panel. Goals not on the panel come back from a round + at the bottom. In privacy view, fat loss shows the calorie gap in kcal instead of kilograms of fat.
- 📅 **日历手势**：长按练过的日子，确认后就能修改那天的记录；过去日子的备注随时能改，不用另开面板。长按今天那一格打开今天的加练。在月份大字上左右滑动换月。
  Calendar gestures: hold a trained day and confirm to edit that day's records; notes on past days can be edited at any time without a separate panel. Hold today's square for today's extra practice. Swipe the month name left or right to change month.
- 💪🏼 **长按「练」**：滚到现在能练的两次训练（下一次推、下一次拉），卡片边上有一圈暗暗的光跑两圈。
  Hold Train: the page scrolls to the two sessions you can train now (the next push and the next pull day) and a dim ring of light runs round each card twice.
- 🟦 **扁平主题**：海军蓝底、石板蓝面板，没有阴影，大块青绿、粉红、天蓝、琥珀；目标是一圈进度环，今天是粉红实心圆。
  Flat theme: navy page and slate panels with no shadows, solid teal, pink, sky and amber blocks; goals are progress rings and today is a pink dot.

- 📌 **目标图钉**：目标卡右下角的图钉按下后，目标卡固定在顶端，除了设定以外每个标签都看得到。
  Goals pin: press the pin on the goals card and it stays at the top of every tab except Settings.
- 🔘 **图表的范围和均线各一个按钮**：点一下换（7、14、30、60、90 天、全部；均线 7、14、30），长按回到 14 天、均线 14。图表默认也改成 14 天 + 均线 14。
  One button each for a chart's range and moving average: tap to step (7, 14, 30, 60, 90 days, all; MA 7, 14, 30), hold to go back to 14 days and MA14, which are now the defaults.

### 修复 / Fixed
- 饮食表格里只填了一行「当日合计」的日子（事后回填）现在能同步了，原来合计行一律跳过；「备注：」开头的行变成这一天的备注，不再当成一样食物。
  Days entered in the food table as a single "daily total" row now sync (total rows used to be skipped always); a row starting with "备注：" / "Note:" becomes the day's note instead of a food.
- 主题的背景图改过以后，手机上不再一直显示旧图；每次更新也不再把上一版的脚本和样式留在手机缓存里越积越多。
  Theme pictures that were redrawn no longer stay stale on the phone, and old copies of scripts and styles are dropped from the offline cache on each update instead of piling up.
- 长按「练」或「今天」时手指滑开，不再误触发。
  Sliding the finger away while holding Train or Today no longer triggers the hold.
- 图表的范围和均线按钮有了切换范围的点按声；给某天写备注时，日历上的标记用和平时一样的画法更新。
  The range and MA buttons play the range sound; typing a day note updates that day's calendar mark the same way the calendar draws it.
- 同步高驰时每类数据只写一次存储（原来每一天写一次）；不在「数据」页时不再白画六张图表。
  A COROS sync writes storage once per kind of data instead of once per day; charts are no longer drawn while the Data tab is hidden.
- 有功率计的骑行热量不再打九折，按高驰给的数全算（功率是实测的）。
  Rides measured by a power meter now count in full instead of at 0.9: the work is measured, not estimated.
- 最大引体数不再被随手的加练拉低：取最近一次手动记录的数，和最近 3 个拉练日里单组最多的引体数，哪个大算哪个。其他日子加练的引体不算。
  Max pull-ups is no longer dragged down by casual extra sets: it is the larger of the latest number logged by hand and the best single set in the three most recent pull days; pull-ups added as extra practice on other days don't count.

### 改进 / Changed
- 「身体」标签改叫「数据」，图标换成折线图；「一年打卡」默认收起，从页面底部的 + 加回来。
  The Body tab is now Data with a chart icon; the year of training panel starts hidden and comes back from the + at the bottom.
- 图表上的手动记录和同步按钮跟当前主题的饮食同步按钮一个样；同步按钮带指示灯。
  The edit and sync buttons on charts match the look's food sync button; sync buttons carry the lamp.
- 右上角的全屏按钮去掉了。
  The fullscreen button is gone.

## [v1.30i] — 2026-11-10

i 代表 impeccable：按一次界面审查（启发式评分、检测器扫描、多主题截图）改的一版。想退回改动前，可以用仓库里的 `v1.30a` 分支。
i for impeccable: a pass driven by an interface review (heuristic scoring, a detector scan and screenshots across the themes). The `v1.30a` branch keeps the version from before it.

### 改进 / Changed
- 🎯 **目标卡变紧凑**：四个目标排成两列，每格只有图标、名字、数值、百分比和一根细进度条；起点和目标数在点图标打开的目标面板里。没设目标的那格仍显示「设目标」。
  Compact goals: the four goals sit in two columns, each with its icon, name, value, percent and a slim bar; start and goal figures live in the goal panel behind the icon. A goal without a target still shows "Set goal".
- 🏁 **「完成训练」是整宽按钮**：训练卡最下面的磁盘图标换成推、拉颜色的整宽按钮「🏁 完成 推练 D3」，和保存备注分开。
  Finishing is a full-width button: the disk icon at the bottom of a session is now a full-width, push- or pull-coloured "Finish Push D3" button, no longer the same as saving a note.
- 👍 **组间更好按**：打勾框和加减按钮放大到 44px 左右；每组那行不再重复动作名，只写单位和第几组。
  Easier between sets: the tick box and the − / + buttons are about 44 px; each set row no longer repeats the exercise name.
- ⬆️ **回到顶部按钮滚过一屏才出现**，不再挡住第一屏和「加一组」。
  Back to top only appears after a screen of scrolling, so it no longer covers the first screen.
- 📌 **标签栏所有主题都钉在顶部**；展开的面板箭头在所有主题里都朝上（玩具、Interior 之前朝下）。
  The tab bar stays pinned in every theme, and an open fold's chevron points up in every theme (toy and Interior pointed down).
- 🔍 **对比度**：默认主题「练」按钮的火焰色调深，白字更清楚；饮食「缺口」小标签、未解锁训练卡的字、深色主题目标进度条底槽都更看得清。
  Contrast: the default Train button's flame colours are deeper so the white label reads; the diet gap pill, locked session text and the dark theme's goal-bar groove are easier to see.

### 修复 / Fixed
- 机械主题的同步推杆在其他主题里也显示出来了，现在只在机械主题里出现。
  The machine looks' sync lever showed in every theme; it now appears only in the machine looks.
- 过去的日子没有加练时，不再显示一个空的「加练」标题。
  Past days without extra practice no longer show an empty Extra practice heading.
- 欢迎页把「资料 › 个人资料」写成了「数据 › 个人资料」。
  The welcome screen pointed to the profile under the wrong tab name.

## [v1.30a] — 2026-11-08

### 新增 / Added
试穿阶段：下面的主题都是试验，以后会删掉不合适的；这段时间只改外观，版本号停在 v1.30a。
Trying-on phase: the themes below are experiments and the ones that don't fit will be removed later; while it lasts only the look changes and the version stays at v1.30a.

- 🧸 **玩具主题**：右上角主题按钮现在在浅色、深色、玩具三套之间切换，图标显示下一个主题。玩具主题像塑料玩具：米色点点底，按钮是凸起的塑料键，按下去会下沉、松手弹回来；打勾框也是按键，打完变绿；选中的标签是一块红色塑料片，点别的标签会滑过去；日历里的训练日像塑料钉。只换外观，数据还是同一份。
  Toy theme: the theme button now cycles light, dark and toy, and shows the theme it switches to. Toy looks like moulded plastic: a dotted cream background, buttons are raised keys that sink when pressed and spring back, tick boxes are keys that turn green, the selected tab is a red plastic piece that slides to the tab you tap, and training days on the calendar look like plastic pegs. Only the look changes; the data stays the same.
- 🎨 **六套主题，点调色盘选**：右上角的主题按钮换成调色盘，点开是一排色板：浅色、深色、玩具、夜间玩具、夜光玩具、牛仔。夜间玩具是同一套塑料的深色版；夜光玩具是深蓝底配荧光绿、粉、青，彩色塑料会发光，适合晚上在外训练；牛仔是奶油底配帽子棕、牛仔蓝和衬衫黄，底纹是木板线。
  Six themes, picked from a palette: the theme button is now a palette that opens a row of swatches: Light, Dark, Toy, Toy night, Toy glow and Cowboy. Toy night is the same plastic in the dark; Toy glow is glow-in-the-dark plastic (lime, pink and cyan that give off light on navy) for training outside at night; Cowboy is cream with hat brown, denim blue and shirt yellow on plank lines.
- 🔊 **玩具主题有塑料声**：玩具一族的主题里，切换标签是塑料片滑入卡槽的声音，其他按钮是塑料按键声，保存是两块积木咔哒扣上。「资料 › 音效」里也能单独选这三个声音；自己选过的声音照旧。
  Plastic sounds for the toy themes: switching tabs sounds like a piece sliding into its slot, other buttons clack like plastic keys, and saving snaps like two bricks. The three sounds can also be picked in Profile › Sound effects; sounds you picked yourself stay.
- 🟩 **一年打卡热力图**：「图表 › 力量」最上面，最近 53 周每天一格，当天打勾的组越多颜色越深，标题旁是打卡天数。可以横向滑动，打开时停在最近几周。
  Year of training heatmap: at the top of Charts › Strength, one square per day for the last 53 weeks, darker the more sets you ticked, with the number of training days beside the title. It scrolls sideways and opens on the latest weeks.
- 🔢 **数字会滚动**：目标百分比、热量缺口和打卡天数变化时滚到新数字，打开时从 0 数上来。玩具主题里提示条会弹出来，目标进度条带回弹。
  Numbers roll: goal percentages, the calorie gap and the training-day count roll to their new value and count up from 0 when they first show. In the toy themes, toasts pop up and goal bars fill with a bounce.
- 🎨 **十二套主题，四种风格**：参考 Ovio 的四种风格全部做了。极简：白底细线、黑色胶囊标签。手作：奶油纸、胶带、柔和叠影，提示条像一张便签。玩具：原版、夜间、赛博、牛仔、霓虹五种配色。复古终端：像素字体、字会发光、扫描线，标签块一格一格跳过去，有绿屏、赛博、雨夜琥珀三种配色。
  Twelve themes in four looks: all four of Ovio's looks are in. Minimal: white, thin rules, a black pill on the tab. Craft: cream paper, tape and soft shadows, and toasts look like a sticky note. Toy: original, night, cyber, cowboy and neon palettes. Retro terminal: a pixel font that glows, scanlines and a tab block that jumps in steps, in phosphor green, cyber and rain-amber palettes.
- 🖌️ **主题按钮点一下换、长按选**：右上角主题按钮点一下换到下一个主题，提示条显示名字；长按打开「资料 › 主题」面板，每个主题一张预览小卡，点一下就换。
  Theme button: tap for the next theme (a toast names it); hold it to open Profile › Theme, where every theme has a preview tile.
- 🔊 **每种风格有自己的点按声**：复古是八位哔哔、保存是金币；手作是翻页和纸张轻拍、保存是盖章；极简是轻点；玩具是塑料声。自己选过的声音照旧。
  Each look has its own tap sounds: 8-bit blips with a coin on save for retro, page flips and paper taps with a stamp on save for craft, a soft click for minimal, plastic for toy. Sounds you picked yourself stay.

### 修复 / Fixed
- 手表整天心率偏高的日子（比如 11 月 9 日：5,377 步，运动以外却记了 958 kcal），日常活动被全额算进消耗，缺口虚大。现在日常活动最多按步数估算值的 1.5 倍再加 120 kcal 计入，超出的不算，日卡上会写「按步数封顶」；正常的日子不受影响。
  On days the watch reads a raised heart rate all day (e.g. 9 November: 5,377 steps but 958 kcal outside workouts), everyday movement counted in full and inflated the deficit. Everyday movement now counts up to 1.5 times what the steps account for plus 120 kcal; the day card says when it was capped. Normal days are unaffected.

---

## [v1.29a] — 2026-11-06

### 变更 / Changed
- 🔥 **低强度运动折得更多**：健走、家务等自定义活动、瑜伽这类低强度运动的手表热量改按 × 0.5 计（原来 × 0.7）。高驰的热量在这类活动里靠心率估，心率只比静息高一点时最容易高估。力量和有氧仍是 × 0.7，有功率计的骑行 × 0.9，日常活动全算。高驰的活动热量本来就不含基础代谢，所以不用再扣。同步一次后，最近 60 天按新规则重算。
  Low-intensity workouts count for less: walks, housework and other custom activities, and yoga now count at × 0.5 of their watch calories (was × 0.7). COROS estimates these from heart rate, which runs high when heart rate is barely above resting. Strength and cardio stay at × 0.7, power-meter rides at × 0.9, everyday movement in full. COROS active calories already leave out resting metabolism, so nothing more is subtracted. After one sync, the last 60 days are recalculated.

### 修复 / Fixed
- 高驰的运动记录在网页里有时是以转义文本传回来的，旧的解析只认出一条，其余日子都当成「没有运动」，运动热量被全额计入（× 0.7、× 0.5 实际没生效）。现在两种格式都能读，同步一次后最近 60 天重算。
  COROS workout records sometimes reach the browser as escaped text; the old parser then found only one record and treated every other day as having no workouts, so workout calories counted in full (the × 0.7 and × 0.5 never applied). Both forms are read now; one sync recalculates the last 60 days.
- 同步时如果读不到运动记录，当天全天热量又变了，不再沿用旧的运动拆分（会把新的运动当成日常活动全额计入、消耗偏高），改为按「运动未知」× 0.7 计。饮食记录每天的卡片上显示手表全天热量、其中运动多少、实际计入多少。
  If workouts can't be read during a sync and the day's total has changed, the old workout split is no longer kept (it counted new workouts as everyday movement at full value, inflating the burn); the day counts as "workouts unknown" at × 0.7. Each day card under Food logs shows the watch total, the workout part and what is counted.

---

## [v1.28a] — 2026-11-05

### 变更 / Changed
- 💾 **保存都用磁盘图标**：日历里每一天的加练面板加了磁盘图标的保存按钮，按了就收起；训练卡片里的「完成并记录」和修改后的「保存」也换成同一个磁盘图标。
  Save is a disk icon everywhere: each calendar day's extra-practice panel has a disk save button that closes it, and a session's "Finish & log" and the save after editing use the same icon.
- 🔒 **今天随便加，过去的要先点「修改记录」**：今天结束（午夜）之前，今天的加练怎么改、保存几次都不算修改记录。过去日子的加练和备注默认只读，点「修改记录」确认后才能改，和已完成的训练一样。今天完成的训练，里面的加练到午夜前也能直接加。
  Add freely today, edit the past on purpose: until midnight, changing and saving today's extra practice never counts as editing a record. Extra practice and notes on past days are read-only until you tap Edit record and confirm, like finished sessions. Extras inside a session finished today stay open until midnight too.

---

## [v1.27a] — 2026-11-05

### 新增 / Added
- 📝 日历里每一天的加练下面多了备注栏，可以写在哪练、用了多重的器械等。只写了备注的日子，日历上也会标出来；备注会存进进度文件。
  Each day on the calendar now has a notes box under its extra practice, for where you trained, the weight on the machine and so on. A day with only a note is marked on the calendar too, and notes go into the progress file.

---

## [v1.26a] — 2026-11-05

### 新增 / Added
- 📅 **训练日历**：训练页最上面是月历，练过的日子标上推练（橙）和拉练（蓝）的小圆点，只有加练的日子标一个空心圈。点哪天就在日历下面展开那天：当天完成的训练，加上当天的加练。下面只留接下来 5 次没练的训练，页面短了很多。
  Training calendar: the Train tab opens with a month calendar. Trained days carry push (orange) and pull (blue) dots, and days with only extra practice a hollow ring. Tap a day to open it below: the sessions finished that day plus that day's extra practice. Only the next five unfinished sessions are listed below, so the page is much shorter.
- 🏨 **哪天都能加练**：点今天（或之前任何一天），可以直接记加练，不用挂在某次训练下面。比如出差时酒店有高位下拉，就记一个「高位下拉」。引体加练照样算进引体趋势和目标，进度文件也会带上。
  Extra practice on any day: tap today (or any earlier day) to log extra practice without tying it to a session, say lat pulldowns on a hotel machine. Pull-up extras still count toward the pull-up trend and goal, and the progress file carries them.

---

## [v1.25a] — 2026-11-05

### 新增 / Added
- 🔄 **单独同步一张图**：「健康」里的睡眠、HRV、静息心率图，标题右边各有一个同步按钮，只从高驰拉这一项，比整体同步快。标题左边加了和同步设定里一样的图标。
  Sync one chart: the sleep, HRV and resting HR charts under Health each have a sync button beside the title that pulls only that data from COROS, faster than a full sync. Each title also gets the same icon as in the sync settings.

---

## [v1.24a] — 2026-11-05

### 变更 / Changed
- 🔥 **消化耗能按营养素算**：估算总消耗里的消化耗能，从「摄入 × 9%」改成蛋白质热量 × 25%、碳水 × 8%、脂肪 × 2%。蛋白质吃得多的日子，消耗会算得高一些，更接近实际；没记营养素的日子仍按 9%。
  Digestion burn now follows the nutrients: 25% of protein calories, 8% of carbs and 2% of fat, instead of 9% of all intake. High-protein days count a little more burn, closer to reality; days without nutrients still use 9%.
- 🥩 蛋白质的浅色带改叫「增肌够用区间」（体重 × 1.6 到 2.2 g）。超过上沿不再标成警告：减脂期间多吃蛋白质更顶饱、消化耗能高、更保肌肉。点只分两种：实心是吃够了，空心是没吃够。
  The protein band is now the muscle-building band (body weight × 1.6 to 2.2 g). Going above it is no longer flagged: while cutting, more protein keeps you fuller, costs more to digest and protects muscle. Dots are now just filled (enough) or hollow (short).

---

## [v1.23a] — 2026-11-05

### 新增 / Added
- 🥩 **蛋白质吃够了没**：「摄入与消耗」图右边加了蛋白质轴（g），画出每天记下的蛋白质和合适区间（体重 × 1.6 到 2.2 g，浅色带）。实心点在区间内，空心点是没吃够，带圈的点是超过上限；点图上某一天会显示吃了多少、还差或超出多少。
  Did you eat enough protein? The Intake vs burn chart has a protein axis on the right (grams), with each day's logged protein and the useful range (body weight × 1.6 to 2.2 g, a shaded band). A filled dot is inside the range, a hollow one is short, a ringed one is above the top; tap a day to see how much you had and how far off you were.

---

## [v1.22a] — 2026-11-03

### 变更 / Changed
- 🔄 **饮食同步不用再找**：存了表格链接的话，每次打开「饮食」页都会在后台拉取一次，进度动画直接显示在「饮食」标签上（半分钟内重复点不会重复拉）。
  Diet syncs without digging: with a sheet link saved, opening the Diet view pulls it in the background, with the progress fill on the Diet tab itself (tapping again within half a minute doesn't pull twice).
- 「每日记录」改名「饮食记录」，饮食页顶部的「饮食账本」标题和说明去掉了。「饮食记录」旁现在有两个图标：添加图标直接打开手动记录窗口；新的同步图标一按就拉取，同时打开「线上数据」面板。折起面板就关上。
  "Daily logs" is now "Food logs", and the Diet Ledger heading and note at the top of the Diet view are gone. Two icons sit beside Food logs: the add icon opens the manual food log straight away, and the new sync icon pulls at once and opens the Online table panel. Fold the panel to close it.

- 🔊 **音效自己配**：「资料」里新增「音效」（喇叭图标），给每种点击选声音：打勾、整天练完、烟花、切换标签、展开面板、保存、删除、同步开始/完成/失败等。选的时候就能试听，「恢复默认音效」一键还原。新增十几种声音，包括揉纸、剑气、拔剑、重拳、蓄力、金币、升级、号角、八音盒、星光等短旋律。另外加入开源的 ZzFX 音效 52 个（拾取、强化、跳跃、射击、短哔、击中、爆炸、音符各 6 个，加 4 个官方示例），以及经典 8-bit 音效生成器 jsfxr 的 54 个（金币、激光、爆破、升级、受击、弹跳、选择、合成音、点击各 6 个）。全部是手机现场合成，不用下载文件。
  Pick your own sounds: Profile has a new Sound effects panel (speaker icon) to choose a sound for every kind of tap, from ticking a set, finishing the day and fireworks to switching tabs, folding panels, saving, deleting and sync start/done/failed. You hear each one as you choose, and Reset sounds restores the defaults. More than a dozen new sounds, including crumple, sword slash, unsheathe, punch, power-up, coin, level-up, fanfare, music box and sparkle. Plus 52 open-source ZzFX sounds (six each of pickup, power-up, jump, shoot, blip, hit, explosion and note, and four official samples), and 54 from the classic 8-bit generator jsfxr (six each of coin, laser, blast, power-up, hurt, bounce, select, synth and click). All are synthesised on the phone, with nothing to download.

---

## [v1.21a] — 2026-11-03

### 变更 / Changed
- 🧭 **页面结构重排**：一级标签改成「训练 / 图表 / 资料」。「图表」下分三页：饮食、健康（睡眠、HRV、静息心率）、力量（引体、体重、腰围，都是自己填的身体数据）。标签图标统一换成简约线条风格。「资料」（人头加奖杯图标）里是个人资料、目标、备份进度、全部记录、要点，以及新的「图表和同步设定」。原来顶部的备份快捷按钮由「资料」标签取代。上次停在旧图表页的，会打开「健康」。
  The app is reorganised. The top tabs are Train / Charts / Profile. Charts has three views: Diet, Health (sleep, HRV, resting HR) and Strength (pull-ups, weight and waist, the body numbers you log yourself). Tab icons now share one simple line style. Profile (a person-and-trophy icon) holds your profile, goals, backup, all records, the guide, and the new Charts & sync settings. The old backup shortcut is replaced by the Profile tab. If you were last on the old charts view, Health opens.
- 🔌 **自己选同步什么**：「资料 › 图表和同步设定」里可以开关睡眠、HRV、静息心率、体重。关掉的项不再从高驰同步，也不显示它的图表；已经存下的数据保留。「重置图表」也挪到了这里。
  Choose what to sync: under Profile › Charts & sync, switch sleep, HRV, resting HR and weight on or off. What's off isn't synced from COROS and its chart is hidden; data already saved stays. Reset charts moved here too.
- 缺口卡片的「有记录以来」后面显示统计了几天，比如「有记录以来（10 天）」。
  "Since first log" on the gap tile now says how many days it covers, e.g. "Since first log (10 days)".

### 修复 / Fixed
- 隐私模式下，「减脂」目标那一行不再错误地显示成「腰高比 0.000 → …」，直接不显示。
  In privacy view, the fat-loss goal no longer shows a bogus waist-to-height line; that line is simply left out.

---

## [v1.20a] — 2026-11-03

### 变更 / Changed
- 🧩 **表格怎么写都尽量能读**：列名中文英文都认（「日期｜食物｜蛋白质｜脂肪｜碳水｜蔬菜｜热量」或 date, item…），顺序随意，带单位也行，多余的列忽略，没有列名就按默认顺序读。日期写成 2026/11/3、2026年11月3日、11月3日（没写年份按今年）都行，同一天后面几行日期留空会沿用上一行。数字里带「g」「约」、全角数字、千分位都能读，没填热量会按蛋白质、脂肪、碳水自动算。合计行自动跳过。AI 用竖线排的表格也能读。
  The table is read as forgivingly as possible. Column names work in Chinese or English, in any order, with units; extra columns are ignored, and without a header the default order is used. Dates like 2026/11/3, 2026年11月3日 or 11月3日 (this year) all work, and a blank date continues the day above. Numbers with units, full-width digits or thousands separators are read, missing calories are worked out from protein, fat and carbs, total rows are skipped, and pipe-separated tables from an AI are read too.
- 🤖 **记账 prompt 缩短一半**：格式上的规矩交给推拉机兜底，prompt 只讲要记什么。列名改成中文。
  The bookkeeping prompts are about half as long: formatting is left to track-TOR, so the prompt only says what to record. Column names are now in Chinese.
- 🔗 粘贴分享按钮复制来的整段文字（比如「【腾讯文档】饮食记录 https://…」）也行，推拉机只取里面的网址。
  Pasting the whole text a share button copies (like "【腾讯文档】饮食记录 https://…") works too; only the link is kept.
- 📋 **prompt 更短，不带链接**：两个版本都缩到几行固定文字，屏幕上看到的就是复制出来的内容，输入框里填什么都不会出现在 prompt 里。默认你还没有表格：第一次让 AI 建好「饮食记录」、写上列名、设成知道链接的人可查看并发回链接，已经有就直接用。只记吃了什么，不再要求 AI 额外汇报总计。准备步骤也缩成三步。
  Shorter, link-free prompts: both are a few lines of fixed text, and what you see is what you copy; nothing from the link box appears in them. They assume you have no sheet yet: on first use the AI creates 饮食记录 with the column names, shares it view-only by link and sends the link back. The AI only records what you ate, with no extra totals. The setup is down to three steps.
- ⓘ 按钮改成椭圆：左边 i，右边 + 表示可以展开，展开后变成 − 表示可以收起。
  The ⓘ button is now a pill: i on the left, + on the right to open, − to close.
- 📉 **饮食页两张图合成一张**：去掉了「热量缺口累计」图，只留「摄入与消耗」。标题下面一个小卡片显示「近 7 天热量缺口 1051 kcal（约 136 g 脂肪）」，点一下依次切换 3 / 7 / 14 / 30 天和有记录以来，会记住上次选的。计算公式收进标题旁的「i｜+」按钮，点开才显示。顶部「日均缺口 / 累计缺口 / 约合脂肪」三张卡片和这个卡片是重复信息，已删除。
  The diet page's two charts are now one, and the three summary cards above are gone because the tile says the same thing: the cumulative-gap chart is gone and Intake vs burn stays. A tile under its title shows e.g. "Last 7 days calorie deficit 1051 kcal (about 136 g fat)"; tap it to step through 3 / 7 / 14 / 30 days and since your first log, and it remembers your choice. The formulas sit behind the i | + button next to the title.
- 📋 **数据源输入框左边加了粘贴按钮**：每次点都用剪贴板里的内容覆盖输入框，复制来的是整段分享文字也只留网址。
  A paste button sits at the left of the data source box: each tap replaces the box with the clipboard, keeping only the link if more text came with it.
- 🔄 **拉取和同步互相带上对方**：点数据源的「拉取」会顺便从高驰拉活动热量（没登录高驰就只拉饮食）；点右上角的「同步」会顺便拉饮食数据（只要填了链接）。两个按钮在工作时都有一条从左往右推进的填充，它只是让你感到在进行，不代表真实进度，完成后会填满。
  Pull and Sync now bring the other along: Pull also fetches activity calories from COROS (only the table if you're not connected), and Sync also pulls your diet table when a link is filled in. Both buttons show a left-to-right fill while they work. It's a feeling of progress, not a measurement, and it fills completely when done.
- 📆 **热量缺口只统计过完的日子**：今天的饮食和消耗要到午夜才完整，所以「近 N 天」是指到昨天为止的 N 天，「有记录以来」也不含今天。
  The calorie gap only sums finished days: today isn't complete until midnight, so "last N days" ends yesterday and "since first log" excludes today.
- ⚖️ **消耗估算改了**：以前手表的全部活动热量一律 × 0.5，偏保守。现在按高驰全天卡路里拆开：日常活动（走动、站立等）全算；当天运动记录的热量 × 0.7，因为手表容易高估；骑行如果有功率计 × 0.9，推拉机会看骑行详情里有没有功率数据。读不到运动记录的日子整天按 0.7 算。用 10 月 24 日到 11 月 2 日的数据算，累计缺口从 1062 kcal 变成 2714 kcal（0.14 → 0.35 kg 脂肪），更接近同期体重的变化。
  The burn estimate changed. All watch activity used to count at 0.5, which was too cautious. COROS's daily calories are now split: everyday movement counts in full, logged workouts at 0.7 (watches tend to overestimate them), and rides with a power meter at 0.9 (track-TOR checks the ride details for power data). Days whose workouts can't be read count at 0.7. On the data from 24 Oct to 2 Nov, the total gap goes from 1062 to 2714 kcal (0.14 to 0.35 kg of fat), closer to the weight change in that period.
- 🎨 **图例和图一致**：摄入、估算总消耗是带圆点的线，基础代谢是虚线，缺口、盈余是半透明柱子，图例照着画。点 ⓘ 展开的说明拆成几条，每条前面放它解释的那个图例。
  The legend now matches the chart: intake and estimated burn are lines with dots, BMR is dashed, deficit and surplus are translucent bars. The ⓘ notes are split into short lines, each led by the mark it explains.
- 摄入与消耗图的「i｜+」挪到图表下方左侧，紧挨着它展开的说明，不常用，放在右手拇指不容易误碰的地方。
  The chart's i | + button moved to the bottom left, right above the notes it opens: it's rarely needed, so it's out of the right thumb's way.
- ✍️ **记录框里有测量提示**：图表上点笔图标记录时，空的输入框里显示半透明小字，告诉你怎么量：引体是「下巴过杠的标准引体向上」，体重是「清晨空腹体重」，腰围是「量三次肚脐眼位置，选最大值或者平均值」。一输入就消失，不会被存进去。腰围图下的说明也改成同样的量法。
  The record boxes now show a faint hint on how to measure: strict pull-ups with the chin over the bar, morning weight before eating, waist measured 3 times at the navel taking the largest or the average. It disappears as you type and is never saved. The waist chart caption uses the same method.
- 📥 **添加饮食记录的入口挪到「每日记录」旁边**：点那个列表加号图标，打开数据源面板，里面两项：「线上数据」（粘贴表格链接、拉取）和「手动添加饮食记录」。原来的「+ 记录饮食」按钮和页面上方的数据源区块去掉了。还没有任何记录时，面板默认打开。
  Adding food logs now starts from the icon next to "Daily logs": it opens the data source panel with two parts, "Online table" (paste the link, pull) and "Add a food log by hand". The old "+ Log food" button and the data source block at the top are gone. With no logs yet, the panel starts open.
- ⏱️ **每两小时自动拉一次饮食**：填了表格链接的话，打开推拉机时如果离上次拉取超过两小时，就在后台自动拉取。
  With a table link filled in, opening the app pulls your food in the background when the last pull is over two hours old.
- 「同步」「拉取」按钮的填充动画改成先慢后快，不会一开始冲很快、后面卡住。
  The Sync and Pull fill now starts slow and speeds up, instead of rushing ahead and then stalling.
- 🚫 **记录框只收合理的数字**：腰围 30–180 cm、体重 20–300 kg、引体 0–200 个整数。填的不对，输入框和提示变红，保存按钮变暗按不下去，面板也不会关。清空再保存，还是删除当天那条记录。输入框不再有上下箭头。
  The record boxes only accept sensible numbers: waist 30–180 cm, weight 20–300 kg, pull-ups a whole number from 0 to 200. Anything else turns the box and a hint red and the save button can't be pressed, so the panel stays open. Saving an empty box still deletes that day's record. The up/down arrows are gone.
- 📏 腰围图标换成腰上围一圈软尺，更好认。
  The waist icon is now a tape measure around a waist, which is easier to read.
- 🔥 **新目标：减脂**：把“有记录以来”的热量缺口折算成已经消灭的脂肪（7700 kcal = 1 kg），对比你设的目标公斤数，只算过完的日子。
  New goal, fat loss: the calorie gap since your first log, turned into fat burned (7700 kcal = 1 kg) and compared with your target in kg. Only finished days count.
- 🎯 **目标卡片的图标可以点了**：点引体、腰围、体重、减脂左边的图标，直接跳到「目标」面板里对应的输入框。
  Tap a goal's icon to jump straight to that goal's box in the Goals panel.
- 👁️ **首页显示哪些目标由你选**：「目标」面板顶部有四个开关，可以显示 0 到 4 个，都不选就隐藏首页那一块。
  Choose which goals the top card shows: four switches at the top of the Goals panel, from none to all four. With none, the card is hidden.
- 📏 **「同步」和「拉取」按钮大小固定**：按下后文字变成「同步中…」「读取中…」「已同步 21:24」时，按钮不再变长变短。
  The Sync and Pull buttons keep one size: they no longer grow or shrink when the label changes to Syncing…, Reading… or Synced 21:24.
- 缺口卡片改成两行（上面写时间段，下面写数字和脂肪克数），内容再长也不会把页面撑出屏幕。
  The gap tile is now two lines (the period on top, the number and fat below), so it can no longer push the page wider than the screen.
- 🧱 **更新后不再出现新旧混搭**：手机浏览器会把脚本和样式缓存 10 分钟，更新后可能出现新网页配旧脚本，比如缺口卡片是空的、按钮排版错乱。现在脚本和样式的网址带上内容指纹，文件一变网址就变，旧缓存对不上。
  No more mixed old and new files after an update: the phone's browser may cache scripts and styles for 10 minutes, so a new page could run with old scripts (an empty gap tile, a misplaced button). Scripts and styles now have a content stamp in their URL, so a changed file always has a new address and old cached copies can't be mixed in.

---

## [v1.19a] — 2026-11-03

### 变更 / Changed
- 🌐 **任何网址都能当数据源**：推拉机不再看表格放在谁家。Google 表格、腾讯文档、自己的电脑或服务器都行，只要能读到表头为 date,item,p,f,c,veg,kcal 的数据。逗号、制表符、分号分隔的文本，网页里的表格，JSON 都能读，常见云表格会自动换成它们的数据出口再读。表头上方有标题行也没关系。读不到时，状态区写明每种读取方式失败在哪一步。
  Any URL works as the data source. track-TOR no longer cares where the table is hosted (Google Sheets, Tencent Docs, your own computer or server), as long as it can read rows under the header date,item,p,f,c,veg,kcal: comma, tab or semicolon separated text, an HTML table, or JSON. Common cloud sheets are read through their data exports automatically, and title rows above the header are skipped. If nothing can be read, the status line says how each attempt failed.
- 腾讯文档版的说明里加上了「把链接粘贴到上面，点拉取」这一步。
  The Tencent Docs instructions now include pasting the link and tapping Pull.

---

## [v1.18a] — 2026-11-03

### 新增 / Added
- 🇨🇳 **记账 prompt 可选腾讯文档版**：说明面板顶部可以切换「Google 表格」和「腾讯文档」，国内时区默认选腾讯文档。腾讯文档版给腾讯 WorkBuddy 用：第一次会让它建好「饮食记录」表格、填表头、设成所有人可查看并把链接发给你，之后每天直接写进表格。复制时如果上面填了腾讯文档链接，会一起带上。推拉机读取腾讯文档的功能还在接入中，粘贴腾讯文档链接会如实提示。
  The bookkeeping prompt now comes in a Tencent Docs version for Tencent WorkBuddy, alongside Google Sheets; the info panel lets you switch, defaulting by time zone. The Tencent version has WorkBuddy set up a 饮食记录 sheet the first time. Reading Tencent Docs in track-TOR isn't connected yet, and pasting a Tencent Docs link says so.

---

## [v1.17a] — 2026-11-03

### 变更 / Changed
- 🤖 **记账 prompt 改成让 AI 直接写表格**：推荐用能连接并编辑 Google 表格的 AI 记账，它把每样食物直接追加到表格里，你只要在推拉机点「拉取」；AI 没法直接写表格时，会把新的行排成表格发给你复制粘贴。prompt 用大白话逐列说明，不再出现 CSV 这类术语。复制 prompt 时自动带上你填的表格链接。
  The bookkeeping prompt now has the AI write rows straight into your Google Sheet; if it can't, it sends the new rows as a table for you to paste. The prompt explains each column in plain words, with no file-format jargon. Copying the prompt fills in your sheet link.

---

## [v1.16a] — 2026-11-03

### 变更 / Changed
- 🔗 **数据源直接用分享链接**：在 Google 表格里点「共享」，把一般访问权限改成「知道链接的任何人」，复制链接粘进来就能拉取，不用再去「发布到网络」。「发布到网络」的 CSV 链接照样能用。读不到时会提示去改共享设置。
  The data source now takes the sheet's ordinary share link: set General access to "Anyone with the link", copy the link, paste it and pull. No more "Publish to web" step, though a published CSV link still works. If the sheet can't be read, it tells you to change the sharing setting.
- 日期写成 31/10/2026 这种日/月/年格式也能读。
  Dates written day-first, like 31/10/2026, are now read correctly.

---

## [v1.15a] — 2026-11-03

### 新增 / Added
- 📊 **饮食数据源：Google Sheets**：饮食页顶部新的「数据源」区块。粘贴 Google Sheets「发布到网络」得到的 CSV 链接，点「拉取」就把表格里的每日饮食读进来。表格里有的日期覆盖本地饮食，其他日期，以及体重、腰围、心率、训练都不动。点 ⓘ 展开说明：怎么准备表格，以及一段可以一键复制给 AI 的记账 prompt。链接只存在你的手机里，不会自动拉取。
  Diet data source: a new block at the top of the diet page. Paste the CSV link from Google Sheets "Publish to web" and tap Pull to bring in your daily food. Dates in the sheet replace the local diet for those days; other dates and your weight, waist, heart rate and training stay as they are. Tap ⓘ for how to set up the sheet and a prompt you can copy to your AI. The link stays on your phone and nothing is pulled until you tap Pull.

### 移除 / Removed
- 去掉 v1.14a 的「网上饮食账本」(diet.json) 读取，饮食只保留 Google Sheets 这一个数据源。
  Removed the v1.14a online diet ledger (diet.json); Google Sheets is now the single diet data source.

---

## [v1.14a] — 2026-11-03

### 新增 / Added
- ☁ **读取网上的饮食账本**：饮食页「+ 记录饮食」旁边的云朵按钮，填一次账本网址，以后每次打开推拉机都自动读取每日饮食。账本里有的日期以账本为准，在推拉机里改过的那天保留你的版本。来自账本的日子在日期旁标一个 ☁。
  Read an online diet ledger: tap the cloud button next to "Log food", enter the ledger link once, and track-TOR reads your daily food every time it opens. The ledger wins for its dates, except days you edited in the app. Days from the ledger show a ☁ next to the date.

---

## [v1.13a] — 2026-11-03

### 变更 / Changed
- 🗂️ **数据合成一份**：训练、身体数据和饮食以前分开存，体重和高驰活动热量还各存了两处。现在每天的身体和高驰数据放在一起，体重只存一份。第一次打开新版时自动搬过去，旧的进度文件照样能导入。
  All records now live in one place: each day's body and COROS numbers together, with weight stored once. Existing data moves over automatically the first time you open this version, and older progress files still import.
- 代码按功能拆成几个文件，网页结构、样式和程序分开。用起来没有变化。
  The code is split into files by feature, with page structure, styles, and scripts kept apart. Nothing changes in use.
- 更新后打开网页总会拿到最新的程序，没网时才用手机里缓存的版本。
  After an update the app always loads the latest code, falling back to the copy on your phone only when offline.

### 修复 / Fixed
- ⚖️ 计算某天的热量消耗时，如果那天没有体重，以前只看饮食里另存的少数几条体重，常常用 64 kg 之类的固定值。现在用你附近几天的真实体重，基础代谢更准。
  On days without a weight, calorie burn used to fall back on a few weights stored only in the diet log, often a fixed value. It now uses your real weights from the nearby days, so BMR is more accurate.
- 在饮食弹窗里记的体重现在也会出现在体重图和「全部记录」里。
  A weight entered in the diet window now also shows in the weight chart and the records list.
- 切换语言时饮食页也会一起切换。
  Switching language now updates the diet page too.

---

## [v1.12a] — 2026-11-03

### 新增 / Added
- 👤 **个人资料面板**：性别、出生年月、身高和现在体重从「目标」里拆出来，单独放在数据页。默认模糊显示，点眼睛或点输入框才看得清，收起面板又会模糊。改「现在体重」会记成当天的手动体重。
  A separate Profile panel on the Data page holds sex, birth month, height, and current weight. Values are blurred until you tap the eye or a field, and blur again when the panel closes. Changing "Weight now" logs a manual weight for today.

### 变更 / Changed
- 🎂 生日只填年和月。
  Birthday is now just year and month.
- 「目标」面板只留引体、体重和腰围三个目标。把目标清空就是取消这个目标。
  The Goals panel keeps only the pull-up, weight, and waist goals. Clearing a box removes that goal.
- ⚡ 数字字体放进仓库，不再从 Google Fonts 加载。打开网页不再访问任何外部网站，国内打开更快。
  The number font is now bundled instead of loaded from Google Fonts, so opening the app makes no outside requests and loads faster in China.
- 整理代码：训练和饮食两部分合到同一层，去掉重复的代码和没用的函数。
  Code cleanup: training and diet code now share one scope, and duplicated and unused code is gone.

### 修复 / Fixed
- 英文界面的目标进度卡不再出现中文括号。
  The goal cards in English no longer show Chinese full-width brackets.

---

## [v1.11a] — 2026-11-03

### 新增 / Added
- 👋 **第一次打开先填资料**：性别、生日、身高、现在体重和三个目标，都可以留空。也可以直接连接高驰，授权后自动同步，并填好性别、生日和身高。
  First open asks for your sex, birthday, height, current weight, and three goals. Everything is optional. You can also connect COROS instead: it syncs right after authorization and fills in sex, birthday, and height.
- 「目标」面板加了性别和生日。没设的目标在进度卡上显示「设目标」，点一下直接打开目标面板。
  The Goals panel now has sex and birthday. A goal you haven't set shows "Set goal" on its card; tap it to open the Goals panel.
- 🚪 **登出高驰**：在「备份进度」面板里。可以保留全部数据，也可以只清除高驰同步来的体重、睡眠、HRV、静息心率和活动热量，手动记录都留着。要确认两次才会登出。
  Log out of COROS from the Back up panel. Keep all data, or delete only what COROS synced (weight, sleep, HRV, resting heart rate, activity calories) while keeping your manual entries. Logging out takes two confirmations.

### 变更 / Changed
- 基础代谢按你自己的性别、生日和身高计算，不再用写死的默认值。
  Basal metabolic rate now uses your own sex, birthday, and height instead of built-in defaults.
- 连接高驰的窗口加了提示：授权失败就稍等一分钟再试，或换个区域，不要连续点。失败时的提示也一样。
  The COROS connect window now advises waiting a minute or trying another region if authorization fails, and not tapping repeatedly. Failure messages say the same.
- 高驰授权成功后自动关掉登录页，不用自己关。高驰拒绝授权时也会提示原因，不再没有反应。
  The COROS login page now closes itself after you authorize, and a refused authorization shows the reason instead of doing nothing.

### 移除 / Removed
- 去掉手动粘贴高驰令牌，只保留一键授权。
  Removed manual COROS token pasting; one-tap authorization is the only way to connect.

### 修复 / Fixed
- 新用户第一次打开不再立刻弹出「该备份进度了」，5 天后才提醒。
  New users no longer see "Time to back up" the moment they first open the app; the first reminder comes after 5 days.
- 😴 当晚还没出分时，高驰返回的 0 分不再被记成睡眠评分。之前存下的 0 分会自动清掉，等真实分数出来再补上。
  A 0 sleep score, which COROS returns before the night is scored, is no longer saved. Zeros already saved are removed automatically, and the real score fills in once it's ready.

---

## [v1.10a] — 2026-11-03

### 修复 / Fixed
- 😴 **睡眠评分同步不到**：高驰的回复格式解析得太死，整批睡眠评分都读不出来。现在能正确读取，第一次同步还会补回更早的记录。
  Sleep scores failed to sync because the COROS reply was parsed too strictly. They now come through, and the first sync also fills in older nights.
- 多行的同步提示不再被圆形背景裁掉文字。
  Long sync messages are no longer clipped by the rounded background.

---

## [v1.09a] — 2026-11-02

### 变更 / Changed
- 🧮 **估算不再覆盖已填的总热量**：总热量留空时，计算器按钮照常填入估算值；已有数字时只显示“估算 1592，差额 +252”。差额超过 100 kcal 时，提醒检查有无酒精、酱料等卡路里估算。
  The calculator no longer overwrites a total you've entered. It fills in the estimate only when the field is blank; otherwise it shows the estimate and the difference, and flags differences over 100 kcal so you can check for alcohol, sauces, and the like.

---

## [v1.08a] — 2026-11-02

### 新增 / Added
- 🧮 **估算总热量**：手动记录饮食时，蛋白质、脂肪、碳水都填好后，计算器按钮由灰变橙，按下按 4/9/4 填入估算的总热量，方便粗略核对。
  Estimate calories: once protein, fat, and carbs are filled in, the calculator button turns orange. Tap it to fill in an estimate (4/9/4 kcal per gram) as a rough cross-check.

### 变更 / Changed
- ✏️ 饮食页的编辑按钮改用手写图标，与图表上的记录按钮一致。
  The diet page's edit button now uses the same pencil icon as the charts.

---

## [v1.07a] — 2026-11-02

### 变更 / Changed
- 🍽️ **饮食记录更简单**：主界面只填总热量和蛋白质、脂肪、碳水、蔬菜，只有总热量必填，数字可以直接从别的 App 或 AI 抄过来。想逐项记就进「当日明细」。磁盘图标保存并收起面板。
  Simpler diet logging: enter total calories plus protein, fat, carbs, and veg. Only calories are required. Use Day details to log item by item. The disk icon saves and closes.
- 📊 **目标进度常驻**：数据页的饮食和图表两个 tab 都显示目标进度，切换时不再跳动。
  Goals stay visible on both data tabs, so switching no longer makes the page jump.

### 修复 / Fixed
- 弹窗关闭图标对正圆心，输入框的焦点边框不再被裁掉。
  The close icon is centred in its circle, and input focus borders are no longer cut off.

### 移除 / Removed
- 删除每日饮食的分享图片功能。
  Removes the daily diet share image.

---

## [v1.06a] — 2026-11-02

### 变更 / Changed
- 🧭 **导航更简洁**：数据和备份只留图标。饮食页搬进数据页，数据页分饮食和图表两个 tab。
  Simpler navigation: Data and Backup are icons only. Diet moves into the data page, which now has Diet and Charts tabs.
- ✏️ **图表上直接记录**：引体、体重和腰围的图表各有一个手写图标，点开填数字，日期默认当天，也可改，按磁盘图标保存并关闭。删除原来的手动记录面板。
  Log right from the chart: pull-ups, weight, and waist each have a pencil icon. Enter a number, keep today or pick another date, then tap the disk icon to save and close. The old manual record panel is gone.
- 🏷️ **标题下方改回 TOR 全称**：躯干优化记录 / Torso Optimisation Record。
  The header tagline is back to the full meaning of TOR.
- 📄 **README 去掉改代码的说明**。
  Removes the code setup instructions from the README.
- ⚖️ **许可证改为保留所有权利**：不再以 MIT 授权。此前已按 MIT 发布的版本仍适用 MIT。
  The license is now all rights reserved instead of MIT. Versions already published under MIT stay under MIT.

---

## [v1.05a] — 2026-11-02

### 变更 / Changed
- 🔑 **授权一次，长期有效**：高驰授权到期前自动续期，约半年内打开过一次就不用重新授权。断网或令牌到期时不再显示未连接，令牌被拒绝时先自动续期再试，都失败才请你重新授权。
  Authorize once and it lasts: COROS authorization renews itself, so opening the app about once every six months is enough. Being offline or having an expired token no longer shows you as disconnected. A rejected token renews and retries, and you're only asked to sign in again if that fails too.
- 💾 **进度文件带上高驰授权**：换手机恢复后不用重新授权。这台设备已连接时保留现有授权。
  Progress files include your COROS authorization again, so a new phone needs no new sign-in. A device that's already connected keeps its current authorization.
- ✍️ **重写 README、页面标语和应用描述**，新增[产品说明](docs/PRODUCT.md)，记录产品定位、设计取向和后续计划。
  Rewrites the README, app tagline, and description, and adds [product notes](docs/PRODUCT.md) covering positioning, design principles, and plans.

---

## [v1.04a] — 2026-11-02

### 移除 / Removed
- 🧹 **清掉后端时代的代码**：网页不再请求 `/api/*` 和 `coros-token.json`，保存时也不再把数据发给任何地方；同时删掉云端数据库逻辑和没用到的样式。
  Removes backend-era code: no more requests to `/api/*` or `coros-token.json`, and saving no longer sends data anywhere. Cloud database logic and unused styles are gone too.

### 修复 / Fixed
- ❤️ **静息心率同步**：高驰这个接口只接受 `days` 参数，之前传的是起止日期，现在按天数请求。
  Resting heart rate sync: this COROS tool only takes `days`, but the page was sending a date range. It now asks by number of days.

---

## [v1.03a] — 2026-11-02

### 变更 / Changed
- 💪 **加练搬进每个训练日的面板**：去掉单独的加练卡片，一天的练习都记在当天面板里，默认引体向上，也能加自定义项目。已完成的训练日也能直接加，不用先点「修改记录」。v1.02a 记下的加练会自动搬到对应的训练日。
  Extra practice moves into each session panel. The separate card is gone, so a day's work stays together. It defaults to pull-ups and takes custom exercises. Finished days accept extras without unlocking first. Extras logged in v1.02a move to the matching session automatically.

### 移除 / Removed
- 🧹 删除重复的主页面副本 `推拉机 track-TOR.html`，主页面只留 `index.html`，并精简 `.gitignore`。
  Removes the duplicate `推拉机 track-TOR.html`, keeps `index.html` as the only main page, and trims `.gitignore`.

---

## [v1.02a] — 2026-11-02

### 变更 / Changed
- 🍽️ **饮食页换成饮食账本的版式**：不再顶着目标进度卡，默认只展开最新一天，配色和字号与账本一致，图表默认看 14 天。
  The diet page now uses the ledger layout: no goal card on top, only the latest day expanded, ledger colours and type, and 14-day charts by default.
- 💾 **备份改成 txt 文件**：点一下存成 `推拉机进度-日期-时间.txt`，恢复时选这个文件。文件含饮食和训练数据，不再包含高驰令牌。旧版进度文本仍可粘贴导入。
  Backups are now a txt file holding diet and training data, without the COROS token. Old progress text can still be pasted in.
- 📖 **点击音效改成轻轻的翻书声**。
  The tap sound is now a soft page turn.

### 新增 / Added
- 💪 **每日加练**：训练页顶部新增加练卡片，不管当天是推日还是拉日都能练，默认引体向上，也能加自定义项目、补记之前的日子。每天最好的一组引体计入引体趋势和目标，不影响推拉训练进度，并随进度文件备份。
  Daily extra practice: a card at the top of the training page works on any day, push or pull. It defaults to pull-ups, takes custom exercises, and can backfill past days. Each day's best pull-up set counts toward the pull-up trend and goal. Program progress isn't affected, and extras are included in the progress file.
- ✍️ **手动记录**：一项一项加食物，加完立即保存；热量留空时按 4/9/4 由营养素算。体重、消耗和备注收进选填区。
  Manual logging: add foods one at a time, each saved right away. Blank kcal is calculated from macros at 4/9/4. Weight, burn and note move to an optional section.

### 移除 / Removed
- 🧹 删除 2026-10-24 之前不连续的饮食记录，图表也不再单独画没记账日子的消耗。
  Removes the patchy diet logs before 2026-10-24, and charts no longer draw burn for days with no food log.

---

## [v1.01a] — 2026-11-02

### 修复 / Fixed
- 🔒 **新用户不再收到开发者本人的数据**：网页不再加载 `diet-data.json` 和 `train-data.json`，两个文件也已移出仓库。
  New users no longer receive the developer's personal data: the page stops loading these two files, and they are removed from the repo.

### 新增 / Added
- 🌏 **高驰账号区域选择**：授权时可选中国大陆、欧洲、美国及其他地区，不再固定走美国区；默认值按已存令牌和时区判断。
  COROS account region picker: Mainland China, Europe, or US & other regions, instead of always using the US endpoint. The default comes from any saved token, then the time zone.

---

## [v1.00a] — 2026-11-01

### 变更 / Changed
- 可以独立运行和同步，不再依赖 AI 助手。还没做成独立 App，所以标为 alpha。
- 改成纯前端直连高驰，移除后端和相关文件。
- 版本号从 `v0.83` 升到 `v1.00a`。

### 修复 / Fixed
- 修复调用高驰的函数缺少 `async` 声明的问题。
- 连续快速推送会让 GitHub Pages 部署失败，现在改为逐次推送。

---

## [v0.83] — 2026-11-01

### 新增 / Added
- 🔐 高驰自动授权：点「授权登录高驰账号」，登录后自动跳回并连接，不用再手动粘贴令牌。
- ⏰ 每 3 天提醒备份。

---

## [v0.8x] — 2026-11-01

### 新增 / Added
- 手动粘贴 COROS token 的同步流程（GitHub Pages 直连时代的过渡方案）。

---

## [v0.x 早期] — 2026-10-31 及之前

### 新增 / Added
- 🏋️ 推拉训练体系（Push / Pull，解锁制进阶）
- 🎆 烟花 + 🔊 音效的游戏化记录
- 📈 趋势图表（MA7 移动平均）
- 🥗 饮食热量账本
- 📲 PWA 离线可用
- 🌗 深浅主题 / ⛶ 全屏
- 💾 微信备份

---

## 版本命名规则 / Versioning

| 段 | 含义 |
|---|---|
| `v1` | 主版本：产品已经能独立运行 |
| `.05` | 次版本：每次上线功能或修复时增加 |
| `a` | alpha：已在日常使用，但还没做成独立 App。做成后去掉 `a` |

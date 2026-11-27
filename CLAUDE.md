# 博G · bG：给 AI 助手的工作约定

## 沟通
- 用中文回复。
- 不写改代码或部署的教程。

## 提交与发布
- 改完并测试通过后，直接提交并推送到 `main`，不用等确认。GitHub Pages 会自动上线。
- 以下情况先问：会删除或覆盖用户已有数据的改动；用户说了“先别发”。
- 提交说明用英文，末尾加：`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- 仓库外的私人文档（例如长期规划）里的内容不写进仓库的任何文件、注释或提交说明。
- GitHub 只记录已经做完的改进（what's been done），不写打算做什么。研究、路线图、施工清单都在用户的私人 Claude 文档「推拉机：私人规划与施工清单」里；做完一项就在那里打勾，再把结果写进仓库。
- 高驰令牌、进度文件不提交。进度文件不带高驰授权（v1.44a 起），带饮食表格链接（顶层 `su`）。仓库里不留没用的文件。

## 交接（用户会随时 /clear）
- 这份文件每次新对话都会自动读，是唯一能跨 /clear 带过去的东西。每次推送前看一眼它还准不准：约定、文件结构、版本号、数据键变了就在同一个提交里改掉。
- 只写以后一直有效的约定和找东西的线索，保持简短。做过什么看 `git log` 和 `CHANGELOG.md`，产品现在什么样看 `docs/PRODUCT.md`，打算做什么看私人文档「推拉机：私人规划与施工清单」。

## 每次发版
- 现在的版本号是 v1.75a。
- 只有加了新功能才升版本号。只改视觉或音效、没有新功能的改动，不升版本号、不写 CHANGELOG，测试通过后直接提交推送，不用问。
- 版本号三处同步：`index.html` 里的 `#ver`，`README.md` 中英文各一处。
- `CHANGELOG.md` 加一条，中英双语。
- 产品有变化时同步 `docs/PRODUCT.md`。改产品前先读它，里面有设计取向和现在的功能。

## 设计取向（详见 docs/PRODUCT.md）
- 省事优先，授权越少越好；健身数据不算敏感。
- 能用图标就不写字，操作放在它影响的内容旁边。
- 不加不必要的标签和辅助说明，让布局、按钮和界面本身把意思讲清楚。要解释的放进「i」里，不常驻在页面上。
- 极简、做减法。一个强调色，字重三档，大圆角卡片，所有详情和编辑都用底部弹出面板，动效用同一条回弹曲线（详见 `docs/PRODUCT.md`「界面」）。
- 一组同类的卡片一律用毛玻璃 swipe stack（训练日、日历、饮食记录都是）：后面的牌是整张卡、整齐地一张比一张往右下错开一小步、颜色略深（照 codefronts 的 classic deck；手指按上去时整摞再拉开一点），最多露三张，只要还有别的牌就露出来；划动时下面一张是毛玻璃，划走后 0.3 秒变清晰；手指往右是往前的时间。不另做翻页按钮；离开最新一张时出现半透明的复位按钮（`.fsreset`，加号、完成等小按钮也用这个样子）。
- 爽感是核心：打勾放烟花、练完礼炮（`js/p1fx.js`）；每套主题的庆祝效果都写在 `THEME_FX`（新主题要加一套，还要截缩略图），音效在 `SFX_TH`（玩具在 `js/p1data.js` 的 `SFX_TOY`）。设定 › 外观 › 特效里天气、音乐律动（`tracktor-p1-groove`，彩蛋：放歌时积木、练过的日子、开练键按节拍动；BPM 和能量从 ReccoBeats 按 Spotify 歌曲编号查，`js/p1music.js` 的 `spTempo`/`spBeat`）、落灰（`tracktor-p1-dust`；三档做旧图 `img/grunge-*.webp` 从噪声生成，不用网上的图）、庆祝效果。数字的千位逗号只在英文界面出现（`fmt`）。
- 设定的层级：从设定菜单打开的面板关掉回到上一级（`js/p1.js` 的 `SHEET_UP`/`CUR_SHEET`，`js/p1settings.js` 的面板用 `P1_BACK`）。凡是要填外部链接或密钥的都放在 设定 › 进阶（饮食表格、记账 AI 的格式、Spotify）；每连好一项第一次给 1000 G（`settings.adv`，`advDone`）。
- 组件目录 `docs/catalog/`（`index.html` 外壳、`board.html` 组件板，直接用 `../../css/p1.css`，开本地服务器从仓库根目录打开）：每个组件按用途分七类（确认、开关、调节、选择、导航、展示、音乐），可以单个主题看或一个组件看全部主题；加了新主题记得在 `index.html` 的 `THEMES` 和 `FIXED` 里登记，加了新组件在 `board.html` 加一个 `.spec`。在线版是私人 artifact https://claude.ai/artifact/A1wrTkWRYeDqJwcRpEnQEY ：发布时把 `board.html` 里的 `../../` 路径换成同目录（`window.BASE=""`），一起带上 `css/p1.css`、`js/scratch.js`、`fonts/`、`img/tex-*`、`icon-192.png`；改了组件就同步更新它。
- 文字压印（反光主题等的 1px 硬阴影）一律用 `var(--emb)`：阴影颜色从文字自己的颜色反算（深字配白、浅字配黑，分界随明暗模式 `--emb-t`），不要再写死黑色或白色的 `0 ±1px 0` 阴影，否则浅色按键上的深字会出现重影。
- 会丢掉记录的操作（重置一次训练等）一律点两下：`js/p1.js` 的 `armTap`，第一下按钮变红并提示，3 秒内再点才执行；不用系统的 `confirm` 弹窗。
- 分段按钮（`.seg`、面板里的 `.mode-tabs`）所有主题同一个形状，照 Mac 的分段控件：一整条小圆角框、各段紧挨着、细分隔线、选中段整段填满；主题只在 `css/p1.css` 末尾用 `--sg-*` 换颜色（反光主题、水晶胶、墨水屏各有一套；选中段文字对比度要够，橙色铜色的用深色字）。
- 通用组件（`js/p1.js`）：积木柱状图 `bricksHtml`（每列可带 `t`，手指划过时显示在卡片的 `.bkread`；在卡堆里积木区域不翻牌）、旋钮 `knobHtml`（标签是普通按钮，带自己的 `data-act`）、专注页的动作 Cover Flow `cfBind`（浏览器原生横向滚动加吸附，唱片的转动是 CSS 滚动驱动动画 `cfTurn`（`view-timeline`，照 Bramus 的 CSS Cover Flow，Apache 2.0，`docs/SDA-LICENSE.txt`；关键帧里写死数字），脚本只管咔哒声 `cfTick`（照搬 Ashish Gogula 的 Cover Flow，MIT，`docs/COVERFLOW-LICENSE.txt`）和停稳后换当前动作；尺寸、角度、透视和倒影照 Bramus 的示例（滚动区域正好 6 个槽宽、超出屏幕也没关系，这样一屏 5 张；比例不对时紧挨中间的那张会被收到中间那张后面；唱片本身是中间那张的大小，两边用 `scale(.6667)` 缩小，字才清楚）；唱片 `.cf-card` 为了 GPU 轻装：不套 `.card`、不裁切、不加阴影（墨水屏不用封面、没有倒影；`-webkit-box-reflect` 关掉要写 `unset`，`none` 不认）；专注页打开时底下的页面 `html.infocus` 整个藏起来、页面背景换成纯色；封面是 `cfArt` 照 Apple Music 歌单封面用主题色板画的柔和渐变（`cfDesign` 八种变体、`cfFinish` 左上提亮右下压暗，`cfDes` 保证一次训练里不重复），或特效里 `tracktor-p1-cfart` 打开时用 `MD_COVERS` 里最近听过的歌在画布上预先模糊（不在动画里实时模糊）；布局规则写成 `.cflow .cf-card.cf-card` 压过主题；没练 / 练好两摞，另一摞是 `.cf-mini`（两张缩小的封面加角标）；不要在 3D 那一层（`.cf-rail`、`.cf-slot`）上做透明度动画，安卓会把唱片压扁变透明，淡入淡出放在外层 `.cflow`；咔哒声是 `SFX.detent`/`SFX.land`）。

## 代码结构
- 静态网页，无构建，只有一个界面 `index.html`（经典界面和 29 套主题 v1.43a 删了，代码在分支 `backup-classic-v1.42a`）。样式 `css/p1.css`。脚本都带 `defer`、按 `index.html` 里的顺序执行、共享全局作用域（`<head>` 里只有一个同步的 `js/early.js`：在一切之前把网页图标和 manifest 指到用户选的那套）：`js/hant.js`（繁体：把页面上的简体逐字换成台湾用字，`tracktor-lang` 是 `zht`）、`js/core.js`（计划、存储、`T`）、`js/diet.js`（热量算法、饮食面板）、`js/confetti.js`、`js/sheetcore.js`（饮食表格的解析和拉取）、`js/backupcore.js`（进度文件）、`js/p1data.js`（图表数据、下一次训练、记录面板、G、音效）、`js/p1fx.js`（烟花、彩带、目标 2% 庆祝）、`js/p1stack.js`（毛玻璃 swipe stack：`fsWrap`/`fsBind`/`fsGo`）、`js/coros.js`（高驰）、`js/engine.js`（训练引擎和计划预设）、`js/p1.js`（界面）、`js/p1settings.js`（设定面板、备份恢复、欢迎页、备份提醒）、`js/p1day.js`（日历点某天）、`js/p1weather.js`（天气；`p1settings.js` 用 `p1Sheet`/`p1Reg` 把面板借给它；打勾和记加练时 `wxMark` 把当天天气记进 `tracktor-wxlog`；运动分享图由 `drawTrain` 调 `wxPaint` 画上天气，分享那一刻屏幕上的天气优先，其他分享图不带）、`js/scratch.js`（刮刮卡，照搬 Ovio 的 ScratchToReveal，MIT，许可在 `docs/OVIO-LICENSE.txt`；四个世界 minimal / retro / toy / craft，主题盲盒按主题选世界）、`js/p1music.js`（迷你播放器：通过 Spotify Web API 遥控手机上的 Spotify，PKCE 登录不用服务器；用户自己的 Client ID 在 `tracktor-sp-cid`（设定 › 进阶 › Spotify 里粘贴），回调地址是网站根目录；令牌在 `tracktor-sp`，不进备份；`tracktor-p1-music` 是 on / demo）。
- 中英双语都用 `T(中文, English)`；繁体不用另写。
- 数据全部在 `localStorage` 的 `tracktor-data`：`sessions`（训练）、`metrics[日期]`（引体、体重、腰围、睡眠、HRV、静息心率、活动热量 active、其中运动记录的热量 ex、有功率计骑行的热量 exP、低强度运动的热量 exL、步数等；主项不是引体时手动记的数在 `gm[项目 id]`）、`diet[日期]`、`settings`（含 `plan` 训练计划、`pg` 自己定的每日蛋白质目标（不填就按 `js/diet.js` 的 `proteinRec` 推荐）、`weather` 天气城市、`mainEx` 主项，目标数是 `p`；`tiles` 进展页卡片的顺序和隐藏；`theme` 主题、`buys` 用 G 换购的记录）、`dayx[日期]`（没有训练的日子里的加练）。其他键都以 `tracktor-` 开头。
- 主项（目标里的那个运动，`js/p1data.js` 的 `mainEx`/`mainSeries`）：默认标准引体；从计划动作选的打勾自动记、训练引擎不换它（`isMain`），自己写的只能手动记。
- G 币图标 `COIN`（`js/p1.js`）是当下主题的 `.circ` 圆钮加金色 G、呼吸发光；商店叫「G 分商店 / barGain store」。
- G（积分，Grind）从记录现算（`js/p1data.js` 的 `coinBadges`），不另存；余额 = 赚的 − `settings.buys` 里花掉的。训练计划除了推拉二分（`cyclist`）、自由练、自定义，其他预设要 200 G 解锁（`js/p1settings.js` 的 `planOwned`，买的记 `plan:<id>`）。主题盲盒（`js/p1.js` 的 `openBox`，100 G）随机给一个还没有的主题，记在 `settings.buys`（带 `box:1`），都集齐了就不能开。
- App 图标：纸信封加刮刮卡，每个主题的每个明暗版本一种纸色、七种图案任选（`tracktor-p1-icon`），文件在 `icons/`（`<主题>-<light|dark>-<图案>.webp`、`-m.webp`、`-a.png`、`.json`），由 `python3 tools/icons.py` 从 `tools/icon-src/` 的原稿染色生成（要 Pillow 和 numpy，全部跑十几分钟；`--only=<主题>` 只做一套，`--manifests` 只重写 manifest）；加新主题要在脚本的 `LOOKS` 里加它的纸色再跑一遍，图片重做后把 `js/p1.js` 的 `ICON_V` 和 `index.html` 开头小脚本里的 `?v=` 一起加一。`js/p1.js` 的 `iconApply` 负责把网页图标和 manifest 指到当前那一套。
- 墨水屏主题 `eink`：`html[data-theme="eink"]` 上整页 `filter:grayscale(1)`（放在根元素上，固定的底栏不受影响），所有过渡和动画时长归零，`show()` 换页时 `einkFlash` 闪一下屏。新组件不用为它配颜色，但别用阴影和渐变表达层次，墨水屏靠黑色细框。
- iOS 6 玻璃反光：`THEMES` 里带 `gloss:1` 的主题（现在是 ember、toy、pocket、tm4、braun、dyson、clay）由 `applyMode` 加上 `html[data-gloss]`，`css/p1.css` 末尾那一段统一给按键、卡片、开关、底栏加反光，用双写的属性选择器压过各主题自己的材质规则；卡片、数据卡、目标板、面板都换成同色玻璃板，底色是 `--gb`（一般 `--card`；浅字的 `.dark` 板用 `--g-dk`，奶油塑料的训练卡用 `--g-hero`），加新主题时看它原来哪些板子是深底浅字，在这里补上。组件目录 `board.html` 里也要登记这份名单。
- 主题缩略图：`img/th/<id>-<light|dark>.webp`，训练、饮食、进展三页并排，开本地服务器后 `node tools/thumbs.js`（后面可跟主题 id，例如 `aqua,eink`，只截这几套）用假数据重截（英文界面，三种语言共用）。新主题或主页面样子明显变了就重截，并把 `js/p1.js` 的 `TH_V` 加一（图片不在 `sw.js` 预缓存列表里，用到时才缓存，换地址才会更新）。
- 主题（`js/p1.js` 的 `THEMES`，`css/p1.css` 里 `:root[data-theme=…]`，亮暗两版靠 `data-mode`）：一般要有亮、暗两版；只有一种样子的主题在 `THEMES` 里写 `fix:"light"|"dark"`，这时 `html[data-fixed]` 藏掉明暗开关和设定里的明暗选项（顶栏换成调色盘 `#themeBtn`，进主题列表），触感主题和奶油塑料（`THEMES` 里 `lit`）的高光和金属反光用固定的 `--lx`/`--ly`/`--rot`/`--rt`（`css/p1.css` 的 `:root`；跟着手机倾斜的光追已删掉）。水晶胶 `aqua` 的数值照搬 Igor Duca 的 Aqua 组件（MIT，`docs/AQUA-LICENSE.txt`），改它先回去对照原组件。多层背景（例如 `var(--fine),var(--page)`，而 `--page` 自己又是好几层）要把 `background-size`/`background-blend-mode` 每一层都写全，列表不够长会循环套用（粉瓷 · 铜蓝的渐变就这样被铺成了 200px 的小块）；用 `drop-shadow` 发光的 svg 要 `overflow:visible`，否则发光被方框切掉。主题字体放 `fonts/`（许可见 `fonts/THEMES-OFL.txt`；拉丁字体没有中文，点阵主题的中文用 `fonts/bg-pixel-sc.woff2`（Fusion Pixel 的子集，按许可改名，`unicode-range` 只管中文），界面里加了新汉字要重新切子集），材质颗粒（拉丝、细颗粒、黏土粉、压纹皮、喷砂）是 `img/tex-*.webp`（从 SVG 噪声预先渲染，比现场算快；新材质也这样做），标题和大数字用 `--disp`，小数字用 `--num`。草木 · 极光免费，其他用 G 换。顶栏的明暗开关点一下切换，长按进主题页。
- 训练计划：`settings.plan`（`js/engine.js` 的 `PRESETS`/`setPlan`）选 1–3 种训练日，内部类型固定是 `push`、`pull`、`third`（名字由计划定，`js/core.js` 的 `dayName`/`LAB`）；进度文件里训练的键前缀是 u、l、t。预设只是数据，以后用户写的计划也照这个格式。自由练 `id:"free"`（`js/engine.js` 的 `freeBase`/`freeLog`/`freePattern`）：没选过计划、也没练过正式训练的新用户默认是它；建议从最近 3 周的训练和加练里长出来（散步骑行这类不排），按部位多久没练排，每次至少 2 个动作 5 组；练法稳定后提示存成自定义计划。自定义计划 `id:"custom"`（`setCustomPlan`，面板 `openCustom`）：只用练过的动作（`engMoves`），每个动作从自己的上次记录接着练；自定义计划和自由练下引擎不换动作（`engCustom`）；一种训练日里找不到某动作的历史时，到所有训练和加练里找（`engMoveHist`）。
- 训练引擎排的训练存在训练记录本身：`sessions[sid].ex` 是这次的动作、`feel` 是每个动作的感觉、`edited` 表示用户手改过。`js/core.js` 的 `registerPlanned` 把它们挂进 `PROGRAM`/`BYID`（可以超过第 20 天，`third-NN` 只靠它注册）。进度文件里对应追加的字段是 `pe`。
- 新增文件要加进 `sw.js` 的缓存列表，资源列表变了就把 `CACHE_NAME` 的版本号加一。换默认 App 图标时，把 `manifest.json`、`index.html`、`sw.js` 里图标和 manifest 网址的 `?v=` 一起加一（现在是 v=5），手机才会认出新图标。
- 流畅度：会一直跑的动画（音乐律动）只用 `transform`/`opacity`（不要动画 `box-shadow`），关键帧里写死的数字，不要在关键帧里用 `var()`、不要给动画中的元素加 `filter`（都会让动画离开 GPU、每帧重算整页）；雨是两层画布（每颗水珠都实时画；试过把静止的水珠存成贴图再盖章，高光变淡、看着发灰，用户不要，已回滚）：`#wxs` 放静止的水珠，只在水珠变化或手机转过 4° 时重画、每秒最多 4 次，`#wx` 只画在滑和在化的水珠，没有东西在动就不画；雨雪在手指按着或 Cover Flow 还在滑（`WX.hold`）时停在最后一帧；测试截图一律存到仓库外，别用相对路径存。Cover Flow 只要还是同一摞、同样的动作（停稳换动作、打勾、加减组），那排唱片原地不动，只替换下面的部分、变了的唱片原地改字（把它拿下再放回会让手机重画、闪一下）；能量强弱用 `html[data-amp]` 选三套关键帧。手指在屏幕上时 `html.touching`，律动暂停；滚动、触摸的处理里别每次都写样式。
- 性能：会被拖动或移动的东西（卡堆顶牌、底栏高亮、底部面板、播放器）有 `will-change:transform`；不要再用 `backdrop-filter`（手机上最贵），面板一律不透明；唯一的例外是特效里的「半透明玻璃」开关（`html.glass`，`tracktor-p1-glass`，默认关），只给底栏和音乐播放器用，保留主题的样子、只把底色换成 `css/p1.css` 里按每个主题明暗取样的 `--gl-dock`/`--gl-mp` 的半透明版（加新主题要补这两个颜色）；面板打开时背后的页面用一次 `filter:blur` 虚焦（`css/p1.css` 末尾，`body:has(#sheet.on)`/`body:has(>.mask)`）；页面背景不用 `background-attachment:fixed`。
- `index.html` 有内容安全策略（CSP 的 `<meta>`）：脚本只能来自本站、不许写内联脚本或 `onclick=` 这类属性（要加启动时的小脚本就放进 `js/` 的文件里）；样式可以内联；图片和网络请求允许任何 https（饮食表格可以放在任何网站）。新功能要用别的协议或嵌别的页面时记得改这条。
- 无障碍：默认主题（草木亮色）的灰字 `--muted` 和强调色上的字 `--on-ac` 都调到对比度 4.5 以上；小圆钮（`.mini`、`.fsreset`、组胶囊）样子不变，但用透明的 `::after` 把点按区域撑到 44px；不要再用 `opacity` 调淡文字（会掉对比度），用 `--muted`。
- 改了 `css/` 或 `js/` 下的任何文件，提交前先运行 `python3 tools/stamp.py`。它给 `index.html` 里的脚本和样式网址加上内容指纹（`?v=…`），这样手机上缓存的旧文件不会和新网页配在一起。不运行的话，更新后可能出现新网页配旧脚本、功能错乱。
- 备份格式见 `js/backupcore.js`，新字段只能追加在 `MK` 末尾，旧版进度文件必须仍能导入。经典界面时期的进度文件也要能导入。用户说的「兼容到 v1.4」是一个里程碑，不是版本号 v1.40a：兼容一直保留，直到用户明确说可以停。顶层只能追加新字段（例如 v1.37a 加的 `pe`），旧文件没有它也要能导入。每次训练的数按它自己的动作单排：有 `pe` 用 `pe`，否则用 `js/core.js` 的 `baseEx`（原 20 天计划），绝不能用这台手机当前排的 `BYID`；恢复后用 `resetPlanned`。
- 改动后用无头浏览器（Playwright）实际打开页面测试，确认没有报错再提交。

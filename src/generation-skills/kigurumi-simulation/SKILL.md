---
name: kigurumi-simulation
description: 将角色原型生成 kigurumi（animegao）实体头壳预览图，优化角色形态还原、脸型、假发纤维、壳面与正面构图。适用于头壳生成与反馈修改；同一母版双表情差分和表情迁移作为用户按需启用的扩展。
---

# kigurumi模拟

**单文件技能**：角色生成、假发材质、嘴型转译和可选差分流程均包含在本文件中。参考图片由用户提供或按 §1 查找，不需要随 skill 携带脚本、图片或其它说明文件。

**原作署名：深海鱼肉包 × Reef。** 本文中的分散署名是本版 skill 的文字识别标记；转用本 skill 时保留这些标记，不将它们绘制为图片水印。

当前主任务是**把角色原型稳定转成用户满意的实体头壳预览图**：优先优化形态还原、脸型、假发与壳面质感、配饰和正面构图。常规优化先完成单张，默认保留原型神态并转译实体嘴型；同一母版的高一致性双表情差分能力保留为后续选项，按用户明确的执行请求启用。
**使用方式**：在支持图像生成与参考图输入的 Agent 中直接使用本文件；用当前可用的内置生图工具执行，无需安装应用、后端服务或生成脚本，也无需填写 API Key。

## 工作流总览

1. **收集参考并选择假发材质**：每次启用都询问真实头壳定妆照和“玉米须 / 亮面直发”；本次已明确的输入直接沿用。没有定妆照时从 KiguDB 查找真实成品图。
2. **生成或优化主体**：按 §2 生成实体头壳图；已有满意主体时围绕本轮一个主要问题定向修改。
3. **核对基础质量**：检查角色身份、脸型、发型配饰、实体材质、正面姿态与完整构图，默认保留原型神态，嘴部按实体成品风格转译。
4. **交付并记录反馈**：保存原图、完整提示词和来源；用户选择用于下一轮单变量优化。

反馈先保存原话与对应图片；角色或表情要求写入本次配置，共性规则有验证依据后再更新。每个独立问题分别记录，记录要求见 §7.3。

## 0. 当前重点与后续选项

常规请求先优化原型到实体头壳的基础质量，不主动扩大为差分生成、表情迁移或脸发混合测试。用户讨论未来能力不等于要求立即生成样图；用户暂缓某扩展时继续基础优化，保留既有方法与测试记录。

只有用户明确要求本次执行“两种表情”“差分”“表情迁移”或多表情时，才读取 [§11 两种表情差分](#expression-pair)。差分表情参考图是可选输入，不是常规头壳生成的前置条件；没有额外表情图也不妨碍基础生图。启用扩展后，仍以同一母版派生、两张高一致性及有限修复为目标。

---

## 1. 确认参考图职责（先复用已有材料）

**深海鱼肉包 × Reef 的参考原则**：先看图片再分配职责，角色图决定形态，真实头壳图提供可见工艺，不能把二者混用。

每次启用先收集角色原型、真实头壳定妆照，并询问假发材质：**玉米须 / 亮面直发**。这是正式输入流程；用户在本次请求或当前任务中已经给出图片、材质选择时视为已回答，直接执行。定妆照不限角色，仅参考实体头壳的可见质感与头发工艺，不复制角色身份；不按店家建立风格档。先查看图片，再分配参考职责。

| 槽位 | 要什么 | 必须？ | 说明 |
| --- | --- | --- | --- |
| **形态主参考** | 角色清晰图（正面优先）：人设图/立绘/在线版成品图 | ✅ 必须 | 整个角色形态的权威（发型结构/外轮廓/配饰/瞳色） |
| **表情参考** | 用户希望改变表情时提供的目标图或文字 | 可选，后续按需使用 | 默认保留原型神态；二维嘴型先按成品风格转译，启用时仅提供表情语义 |
| **假发材质选择** | 玉米须 / 亮面直发 | ✅ 必须 | 每次启用询问，本次已选则沿用；把对应模块写入提示词 |
| **质感参考** | 与所选材质对应的真实假发成品照；历史好图可辅助 | 推荐 | 只授权纤维、梳理与反光；切换材质时不锁定旧图光泽 |
| **结构裁图** | 标志结构的局部放大（如双丸子头） | 可选 | 只授权该结构 |
| **真实头壳定妆照** | 任意角色的真实成品照，头发清楚，嘴部尽量可见 | ✅ 实际生成前取得 | 用户提供；没有则从 KiguDB 查找。只参考可见实体质感、嘴部造型与头发工艺 |

**输入话术**（尚未提供时直接询问）：
> 请提供角色原型和一张真实头壳定妆照。定妆照不限角色，只参考实体质感与头发工艺；没有的话，我从 KiguDB 找。假发这次选哪种：玉米须，还是亮面直发？

**没有真实定妆照时**：从 [KiguDB 制作者目录](https://kigudb.info/zh/makers) 查找，进入有真实成品图的详情页，例如用户提供的 [详情入口](https://kigudb.info/zh/makers/27)。按图片是否清楚呈现实体头壳和所选头发质感来选，不将某店家设为固定风格。打开并查看实际图片，将可用图片作为生图输入，记录页面 URL 和本次图片路径。仅有网页文字或链接不能代替参考图；取不到可查看、可传给生图工具的图片时，请用户补图，不悄悄省去图片输入。

**材质处理**：查看参考图后读取 [§9 假发材质](#wig-material)，将选择及对应英文模块写入实际提示词。形态来源管发型结构与颜色，材质来源管纤维、梳理和反光。生成前必须已有真实成品图片和材质选择。

**用户只给一句话时**（如"继续生成"）：去用户指定的参考图目录逐张查看、按上表归类，拿不准的归类先问用户。

**用户给一个目录时**（常见情况，如"用 xxx 目录里的图生成"）：
1. 列出目录全部图片，**逐张查看内容**（不要只看文件名猜）；
2. 按上表归类，列出图 → 职责 → 本次允许参考的属性；
3. 用户命名、既有选图或本轮说明已经明确职责时直接沿用；有实质歧义才请用户确认对应项。

4. 用户说"已经写好分类"时，尊重其命名（如 `张嘴表情-N.jpg` = 张嘴变体表情参考），
   但仍需快速复核图片内容与命名一致。

**用户没给表情参考时**：默认保留角色原型的表情，不主动要求差分参考图。用户明确用文字要求改变表情时，再用具体的文字表情规格驱动，并注明该表情是文字驱动。

---

## 2. 拼提示词

### 2.1 母版与单张提示词

将本次参考图职责、具体角色特征、§9 所选假发模块和嘴型规格填入下面模板。工具只负责生成图片；文件保存与记录由 Agent 在工具返回后完成。差分任务使用 [§11](#expression-pair)，每次调用都写明完整目标。

```text
Generate one physical animegao kigurumi head-shell preview from the attached references.

Image roles:
- Character reference: [identity, face geometry, iris colors/patterns, hairstyle structure, colors and accessories].
- Real finished-head photo: only visible physical shell finish, mouth appearance and wig craftsmanship. Do not copy its character, hairstyle, colors, face shape, accessories, expression, background or watermark.
- Other references, if any: [one explicit role per image].

Character details:
[Describe visible identity features, parting, bangs, side locks, layers, length, color blocks, iris patterns, markings and every accessory. Mark unseen regions as uncertain.]

Selected wig material:
[Insert ONLY the chosen corn-silk microcrimped or glossy straight module from section 9.]

Expression and physical mouth:
[Preserve the prototype's mood unless a change is requested. Translate a flat illustrated mouth into a coherent physical lip seam or product-supported bounded opening. Do not trace an unsupported sideways pink wedge or anime interior-color patch.]

Composition:
Dead-on front view, level eye-socket axis, centered nose and chin.
Preserve intentional left/right differences such as a wink, streak, accessory or facial marking.
White seamless studio backdrop, centered portrait framing, complete visible crown and key accessories. Only the head shell and wig on a simple display support; no body or costume.

Physical rendering:
Smooth matte vinyl/resin face shell, weak nose, large animegao eye openings, printed/painted iris details and believable individual wig fibers.
Softbox light from both sides, a subtle rim light, sharp eye focus; an 85mm f/8 product-photo look.
Keep the selected wig finish distinct from the matte shell finish.
Within continuous hair locks, use clean, smoothly graduated color and preserve genuine overlap shadows, fine fibers and the selected microtexture.
No realistic human skin pores, waxy shell, molded plastic hair slabs, woven grid or dirty color patches.
Do not invent a new hairstyle, remove real structural features or duplicate asymmetric accessories.
Ignore reference watermarks and UI. Generate no text, logos, labels, watermarks, collage or extra character.

Output one portrait product-preview image.
```

### 2.2 参考图属性职责模板

**形态主参考**（成品图可辅助质感，本次假发材质选择优先）：
> 角色人设主参考（form authority）：<发型结构逐件描述：发型类型/分缝/刘海/侧发/发尾渐变；配饰逐件：位置+形态；瞳色>。本图决定角色身份、发型结构和颜色；假发纤维与反光按本次选择的玉米须或亮面直发，不锁定本图旧材质。忽略图内水印文字，不生成水印。<标志结构显式列为"必须完整保留">。头部严格正面平视，眼眶基础轴水平、鼻尖与下巴居中；保留母版脸部结构与角色原有的左右设计差异。表情中的闭眼、眉形与嘴角按目标执行，不得为了镜像对称而抹掉眨眼、单侧挑染、配饰或面纹。

**平面插画当形态参考时**追加：`注意：本图是平面插画，其发丝笔触与漫画嘴形不是实体造型目标。保留神态，发丝与嘴部按真实头壳成品转译。`

**表情参考**：
> 表情参考：仅参考其<表情>眼睑、眉眼和嘴部情绪，不要改变发型结构、发色、配饰或构图。二维嘴形须按真实成品风格转译，不直接描侧向楔形或漫画嘴内色块。<嘴型规格见 §5.3>

**质感参考**（对应所选材质的真实成品，历史好图可辅助）：
> 发丝质感参考（texture authority）：仅参考与所选材质一致的纤维、微皱或顺直、细腻层次、蓬松度及反光。切换材质时，不锁定旧主体的光泽或微纹理。发型结构与颜色仍以形态主参考为准，不采用材质图的角色、发型、发色、配饰、表情、背景或展示台。

**结构裁图**：
> <结构名>结构参考：仅参考其<结构>的位置、大小、做法。严禁采用图中其它元素。

**全身立绘**（设计上下文，可兼柔和眼神）：
> 角色全身设计参考 + 表情共参考：确认整体设计语言——<配色/配饰体系>；并参考其柔和、平静、温和的眼神与整体气质。只生成头壳，严禁生成身体、服装、四肢或 pose；<属性冲突裁决，如"瞳色以人设主参考的红橙渐变为准">；嘴部情绪参考表情图，实体造型与壳面过渡以清楚的真实成品为准。

**真实头壳定妆照**（任意角色，实际附加图片）：
> 仅参考可见实体质感、嘴部造型与所选头发工艺，不复制角色身份、脸型、发色、发型、配饰、表情或拍摄场景；不迁移店家整体风格。忽略水印，不在输出中生成水印。

**按属性裁决冲突**：身份、发型结构与颜色以主参考为准；纤维和反光按本次假发材质选择与对应实物图；二维表情提供神态，嘴部造型以真实成品为准。跨版本取属性见 §5.4。

### 2.3 把用户需求写成明确规格

用户提出更圆脸、更小脸、短下巴、更柔和眼神、保留瞳色、恢复挑染等要求时，写成具体的本次视觉目标；没有要求的属性不顺带修改。不依赖控件编号、参数芯片或应用配置。

可直接使用的英文规格：`preserve the bangs shape and direction`、`keep the original iris colors and motifs`、`preserve every visible accessory`、`use a subtle gentle smile`、`use a restrained slightly open physical mouth`。每条都应与参考图及目标表情一致。

---

## 3. 调用内置生图工具

- 先查看本地参考图，按当前工具实际支持的参数附图；不能只把文件路径写进提示词就当作传入了图片。
- 单张生成注明所有附图职责；已有满意成品时将它放第一张作为编辑目标，再放必要的材质或局部参考。
- 差分编辑时母版第一张、表情参考第二张，按 [§11](#expression-pair) 执行。
- 以当前工具的参考图上限为准，优先保留主体与真实定妆照，再选择关键补图；超限时减少重复输入或分步处理。
- 使用当前内置生图工具。工具不可用时如实说明，不用手工绘图或代码生成图片冒充结果。
- 从本次工具明确返回的产出路径保存原生图；记录实际尺寸、格式及提示词，不按固定像素尺寸判定成功与否。

## 4. 交付

### 4.0 交付前 QA 验证（先验证再交付，别让用户当测试员）
生成后**必须先逐项核对**。有缺陷时按本轮预算定向修复；差分组默认总预算四次调用，到上限保留候选并如实报告未达标项，不能无限重生成或把部分完成说成通过：

| # | 检查项 | 不过的修法 |
| --- | --- | --- |
| 1 | **正视图**：眼眶基础轴水平、鼻尖与下巴居中、无歪斜；允许目标中的眨眼和偏嘴角 | 按 §5.2 固定姿态，不能用左右眼相同消除目标表情 |
| 2 | **嘴型**：神态符合目标，同时嘴缘、唇缝或开口符合真实头壳风格；不能只按二维原型相似度通过 | 按 §5.3 对照真实成品，排除无成品依据的侧向楔形嘴 |
| 3 | **标志结构在**：丸子头/兽耳等角色标志结构无缺失 | 按 §5.1 显式列"必须完整保留"+ 结构裁图 |
| 4 | **配件完整簇**：每件配饰（头饰/花/丝带/耳饰/领结/胸饰）都在位 | 按 §5.1 配件逐件描述 |
| 5 | **身份一致**：脸型/瞳色/发型与形态主参考是同一角色 | 检查参考图角色授权是否写清 |
| 6 | **质感**：假发符合所选玉米须或亮面直发，细纤维可见；壳面无廉价塑料反光或蜡感 | 按 §9 假发材质 检查纤维、反光与形态；亮面直发的合理光泽不能当作壳面塑料感 |
| 7 | **无水印无文字** | 主提示词已含，仍出现则重写相关行 |

验证方法：直接查看生成图（放大脸部区域核对 1/2/3 项）。**核对结果写进交付说明**（如"已核对：正视图✓ 小嘴✓ 双丸子✓"），用户可追溯。

### 4.1 交付物
- **复用用户交付位置**：用户要求替换当前优化版时，沿用现有文件名覆盖更新，旧图保存在运行历史中。用户已有 Markdown 时，把本轮图片与说明追加在该文件末尾，保留原文；不为每轮另建预览 Markdown，也不在交付目录累加重复版本。
- **差分组**：交付两张独立原生图和同尺寸并排对照；记录同一母版、各表情来源及成对 QA，详见 [§11 两种表情差分](#expression-pair)。下面单张文件约定可复用于每张，但两张必须各自有独立记录。
- 成品：保存工具实际返回的原生图，保留真实格式与尺寸，不用修改扩展名冒充格式转换。
- **高清交付**：优先提供本次工具返回的原生图，记录实际宽高；不把缩放或修改扩展名当作增加细节。只有用户要求新的生成尺寸时，再核对当前工具支持范围。
- 每次生成的完整提示词存档，包含 wig_material、真实定妆照和材质图的来源及职责；网页补图同时记录页面 URL 和实际图片路径。
- **参考图目标可追溯（优化循环的硬性要求）**：每次生成的参考图→角色授权映射必须可重建。
  做法：① 完整提示词存档（含 Supplemental reference descriptions 段）② 交付说明里列版本表
  （名称/表情/各属性来源）③ 旧版成品图不删。这套资产让"每个参考图被当成什么用过"随时可查——
  跨版本授权（§5.4）的选择全靠它。
- **交付说明模板**：版本表（名称/表情/属性来源）+ QA 核对结果 + 文件路径 + "历史版本保留可回滚"。

---

## 5. 提示词工程规则

### 5.1 发型保护——负面禁令是双刃剑
- 模型确实会自行"丰富"发型，点名禁止能压住；但**只能禁"模型凭空发明"的结构**。
- **严重教训**：曾把模型生成的真实结构（双丸子头）误判为幻觉写进禁令，导致后续版本丢失角色标志结构。
  **规则：可疑结构先当"待确认"——问用户或查其他参考图交叉验证，绝不把用户未否认的真实特征写进禁令。**
- **标志性结构必须在形态描述里显式列为"必须完整保留"**，最好附专门的结构裁图。
- 在提示词中明确保护刘海、发束层次、发色与全部配饰。
- **配件描述写完整簇**：只写"骷髅发饰"会漏配花/浆果枝——逐件列明（主体+配花+丝带+耳饰+领结+胸饰）。

### 5.2 严格正视图与表情差异
姿态居中与角色、表情有意的左右差异分别约束；眨眼时检查眼眶布局，不能要求两只眼的开合与形状相同。
正面约束写入每次实际提示词，按角色保留有意的不对称设计：
> STRICT FRONT VIEW REQUIRED (dead-on front view): zero head tilt, zero rotation, zero yaw, no three-quarter angle, no perspective offset. Keep the underlying eye-socket axis level and the nose tip and chin on the vertical center line. Preserve the master face geometry. These constraints apply to camera pose and underlying facial structure, not to intentional expression or design differences. Preserve the specified eyelid closure, brow mood and asymmetric mouth corners, and keep the original left/right placement of bangs, color blocks, accessories and markings. Do not mirror a wink or smirk; do not tilt the head to create the expression.

在形态主参考说明和实际生成要求中明确相同的正面目标；不能只在交付说明里声称正面。

### 5.3 表情与实体嘴型
- 从原型生成头壳、修改嘴型或检查嘴部时，读取 [§10 实体嘴型](#physical-mouth)。**表情语义对原型，嘴部实体造型对真实成品**；不把“更像二维原型”当作嘴型通过依据。
- 闭嘴默认细而连贯的唇缝、轻微轮廓起伏与柔和壳面过渡；没有对应成品依据时，不直接复制单侧拉长的粉色楔形、口角裂缝或漫画嘴内涂片。
- 张嘴、露齿等按用户目标及对应成品设计处理，本规则不把所有嘴型固定为闭嘴。照片不能证明具体制造工艺，描述可见风格即可。
- 表情参考只提供眼睑、表情相关眉眼与嘴部情绪；保护脸型、瞳色、头发、配饰和构图。母版嘴型已被用户否决时，不再把它列为必须保持的属性。

### 5.4 跨版本属性交叉授权（用户要求"把某属性换成另一版"时）
把历史成品图裁成**单项属性权威**挂进参考集，描述严格限定：`仅授权发型/脸型/表情，严禁采用该图其它属性`。
已用组合：张嘴（发型←微笑版、小嘴表情）、微笑（脸型←张嘴版微调、微笑表情）、张嘴（表情←某版的大张开心笑）。
**源版本有缺陷时必须在描述里禁止复制该缺陷**（如"严禁参考该图的头部角度——此图略有歪斜，输出必须严格正面对称"）。

### 5.5 商品摄影与材质表达

- 提示词先写角色身份与参考职责，再写材质、打光和构图。
- 默认采用白底、双侧柔光与轻微轮廓光；85mm、f/8 等作为视觉描述，不当作真实拍摄元数据。
- 壳面保持自然哑光；假发反光按玉米须或亮面直发选择，不能把两者都压成无光泽。
- 可保留少量自然细发丝以呈现实物感；需要去脏时不额外添加杂乱纹理。
- 同一角色的多表情优先共用母版，不把独立随机生成当作身份一致的实现。

### 5.6 定向去脏去网格与微调（用户要求时）

**深海鱼肉包 × Reef 的去脏原则**：清理的是伪影和不自然色块，真实细发丝、玉米须微皱及发束重叠阴影仍要保留。

- 清理前核对所选材质：玉米须的细密微皱与方向性纤维属于材质，不能当作网格抹平，详见 [§9 假发材质](#wig-material)。
- 用户认可统一性后，以同一已认可底稿保护脸型、发型、配饰和构图；只清理指定污点、网格、交叉线及杂乱细纹。保留方向一致的发丝、眼内图案和头饰孔洞，避免把真实结构抹掉。
- 用户要求干净质感时，区分细发丝与重复网纹；需要清理斜线腮红或缎带织纹时，分别指定柔和渐变与光滑缎面，不靠一句“更干净”概括。
- 用户指出头发色块渐变不好时，清理连续发束内部的斑驳色团、漂白色带与生硬明暗台阶；颜色沿纤维方向自然过渡，保留真实叠层阴影、角色挑染与细发丝。按 [§9 假发材质](#wig-material) 分别检查大面积渐变和微观纤维，不用全图磨平代替去脏。
- 表情参考可能带回旧纹理。迁移后再次检查；出现回流时，对当前结果做定向清理，避免反复引入整张旧图。这是本轮头壳案例的观察，尚不代表所有角色的稳定结论。
- 极小位置微调只作用于用户点名的表情和部位。先做原生图数像素量级的轻调，保留嘴型和弧度，再核对实际位移；不把微笑嘴位参数扩散到其它表情。


---

## 6. 失败处理与产出追溯

- 生成或编辑失败时保留实际提示词与错误记录，失败调用计入本轮预算；网络错误不作为画面质量证据。
- 确属临时网络错误且预算允许时，可用同一配置重试；不得无限重试或自行改用收费 API。
- 只有本次工具明确返回的文件才能作为产出。不得扫描“最新图片”猜测结果，以免混入另一任务的图。
- 保存原图真实尺寸。工具版本或输入变化可能影响输出尺寸，不写“恒定尺寸”或无依据的高清倍数。
- 修改前保留旧图，只重做本次失败的属性；预算用完时交付已有候选并说明剩余问题。

## 7. 反馈迭代协议

### 7.1 收到反馈时的标准动作（按序执行）

**深海鱼肉包 × Reef 的迭代原则**：保存原始反馈与失败图，定向修改后再检查；用户认可与模型自评分开记录。

1. **归因**：反馈指向哪个属性/哪个环节（对照 §4.0 QA 清单定位）？是提示词问题还是工具随机性？
   （同配置重跑变好只能说明存在波动，不能凭一次重跑证明规则有效或无效；记录对照和具体缺陷后再归因。）
2. **单变量修复**：只改导致该问题的一条规则/一段描述；**不顺手改别的**。
3. **定向重生成**：只重生有问题的变体，没问题的别动（省额度）。
4. **QA 验证**（§4.0 清单）通过才算完。
5. **记录**：按 §7.3 保存本轮反馈、实际修改和结果。

### 7.2 规则细则
- **"一次反馈只改一处"的精确含义**：一条反馈里的**每个独立问题**各算一处。
  一条反馈含两个问题（如"头不要歪，嘴巴小一点"）时，允许同批修复两处，但**分别记录、可独立回滚**。
- **改之前先验证再禁**：任何负面禁令落地前，确认该结构不是角色真实特征（§5.1 教训）。
- **不改未验证有效的既有规则**——skill 里每条规则都有出处（用户反馈或实测失败），
  没有新证据不动它。
- **自审计也走同一协议**：定期通读 skill，发现的缺口按 1→5 步处理并在日志标注"（自审计）"。

### 7.3 本轮记录

将用户原话、输入职责、完整提示词、输出路径、实际尺寸、调用次数、检查结果与用户选择记录在本次工作目录或已有交付记录中。旧图与失败结果保留可追溯，不将私人对话、历史版本编号或项目运行日志打包进本 skill。

## 8. 生成前检查

确认已经取得角色原型、真实头壳定妆照及本次假发材质选择；用户给过的材料直接复用。没有角色原型时请用户补充，没有真实定妆照时按 §1 查找。确认本次目标、保护项、预算和交付位置后调用工具。

---

<a id="wig-material"></a>

## 9. 假发材质：玉米须 / 亮面直发

**深海鱼肉包 × Reef 的材质判断**：玉米须与亮面直发改变纤维和反光，不能顺带改掉角色原有发型。

每次启用都询问本次材质；本次请求已经选择则直接执行。记录 `wig_material: corn_silk` 或 `wig_material: glossy_straight`，将对应模块写入实际生图提示词，不能只在交付说明里备注。

真实定妆照不限角色，仅负责可见实体质感和头发工艺。学习纤维表面、梳理与反光，不推断化学成分、耐热等级或厂家的加工参数，不按店家建立风格档。

### 两档视觉目标

| 选项 | 纤维与反光 | 形态保护 |
| --- | --- | --- |
| 玉米须 | 细密微皱、细小不规则折纹，纤维间略有空气感，反光柔和分散，仍有自然缎光 | 保护分缝、刘海、发束轮廓、层次、长度和发色，不改成宏观卷发 |
| 亮面直发 | 顺直梳理的细纤维，方向连续的丝光与高光带，表面顺滑 | 保留角色原有弯曲发束与翘发，不拉直整个造型 |

以实际图片为准。玉米须不等于脏乱炸毛、织物网格或交叉刻线；亮面直发不等于整块塑料发片。不能仅靠换亮度、降饱和度、模糊或噪点冒充材质切换。

### 玉米须提示词

```text
Selected wig material: corn-silk-style microcrimped synthetic wig fiber (玉米须).
Use the real finished-wig references only for fiber-level texture and grooming.
Render dense, very fine irregular microcrimps and tiny rippled/kinked filaments following each existing lock, with slight airy fiber separation and soft, diffuse satin reflections. Keep believable individual synthetic wig fibers. Restrict irregularity to the tiny fiber scale; wider color and shading fields within each lock must stay clean and smoothly graduated. Preserve natural shadows at actual lock overlaps.
Preserve the character's parting, bangs, lock silhouette, layers, length, styled bends, color and accessories. This is a fiber-surface treatment, not a new curly hairstyle. Keep the wig neatly dressed and controlled.
Avoid broad mirror-like glossy streaks, molded plastic slabs, woven mesh, crosshatching, regular grid patterns, dirt, heavy frizz or large curls.
Do not copy the material-reference character, hair color, buns, ears, accessories, face, background or watermark.
```

### 亮面直发提示词

```text
Selected wig material: glossy straight synthetic wig fiber (亮面直发).
Render fine, smoothly combed, aligned straight filaments within each styled lock, with coherent directional silky reflections and controlled glossy highlight bands. Keep individual physical wig fibers visible.
Keep color and shading transitions within each lock clean and continuous; retain genuine gloss and structural shadows without patchy color blocks or stepped tonal bands.
Preserve the character's parting, bangs, lock silhouette, layers, length, styled bends, flicks, color and accessories; do not straighten the designed hairstyle merely because the fiber finish is straight and smooth.
Avoid microcrimped or cottony texture, woven mesh, dirt, greasy glare, molded plastic hair slabs or metallic reflections.
Do not copy the material-reference character, hair color, hairstyle, accessories, face, background or watermark.
```

### 编辑与验收

已有满意主体时，只编辑假发纤维和反光，保留脸、嘴、眼睛、配饰、发型结构、姿态、灯光、背景与构图。允许材质造成细小纤维分离，不任意改变外轮廓。

整头比较轮廓和身份，放大刘海、头顶与侧发比较材质。分别记录“材质变化是否可辨认”和“非目标属性是否保持”。去脏去网格时保护玉米须微皱，不能把有方向的真实微纹理抹成亮面。

用户指出色块渐变问题时，将大面积颜色与细纤维分开检查：清理连续发束内部斑驳色团、漂白色带和突变明暗台阶，保留真实叠层遮挡暗部、角色挑染及发色分区。颜色沿发丝方向自然过渡，细微皱纹和方向发丝仍在。不能用全图模糊、统一降对比或抹平所有阴影代替清理。

定向修复模块：

```text
Clean up patchy color fields, washed-out color stripes and stepped tonal bands inside continuous wig locks. Use coherent, smoothly graduated color and soft light falloff along the fiber direction. Retain the chosen wig material, fine directional fibers and microtexture. Preserve actual lock-overlap shadows, intentional color blocks, hair geometry and all non-hair content. Do not blur the whole wig, erase structural shadows or flatten fibers into a plastic surface.
```


---

<a id="physical-mouth"></a>

## 10. 实体头壳嘴型转译

**深海鱼肉包 × Reef 的嘴型判断**：原型负责神态，真实成品负责嘴部造型；像二维原型不等于符合实体头壳。

当角色原型来自插画、游戏截图或其它非实体图时，保留表情的情绪，嘴部造型按真实头壳成品的视觉语言转译。嘴型符合二维原型，不等于符合用户的实体头壳目标。

### 参考优先级

- 原型负责角色身份、神态及表情含义；脸型、瞳色和头发仍按已确定的形态来源保护。
- 真实成品照负责嘴部的边缘、唇缝、色彩和壳面过渡。与原型的夸张二维嘴形冲突时，优先满足实体成品风格。
- 已选生成图可锁定其它属性；其中被用户否决的嘴型不得因“保持母版”而继续保护。
- 同一张成品照可以提供材质与嘴型风格，但要分别注明职责，不抄它的角色、发色、脸型或表情。
- 无清楚成品嘴部可核对时，默认使用简洁、连贯、轻微上扬的闭合唇缝；不要自行创造复杂偏侧开口。

### 目标视觉

闭嘴或微笑采用细而连贯的唇缝、轻微轮廓起伏和柔和阴影过渡，色彩融入壳面。可以有克制的嘴角变化，不能把情绪主要表现为横向拉长的口角裂缝。

张嘴是独立的目标类型；有对应成品或用户确认的设计时保留开口。开口轮廓应连贯有界，与嘴缘和阴影一致。没有相关成品证据时，不照搬插画中一侧尖锐张开的粉色楔形、涂片或漫画嘴内色块。本规则不等于所有头壳只能闭嘴，也不禁止有真实成品依据的牙齿或其它设计。

照片只能支持可见的造型与质感，不能据此断言真实嘴部一定通过雕刻、开孔、贴片或某种工艺制作。提示词描述视觉目标，不虚构生产方法。

### 提示词模块

将下面模块加在嘴部描述处，并按本次目标替换闭嘴或张嘴规格：

```text
Translate the prototype's emotion into a finished physical animegao
head-shell mouth, using the real finished-product reference for mouth
construction and surface appearance. Preserve the character identity.

For the requested closed smile, use a fine, continuous, gently curved
lip seam with subtle shell relief, soft edge shading and restrained
lip color integrated into the face shell.
Keep the existing mouth position and face geometry unless requested otherwise.
Express playfulness primarily through the intended eyelids and brow mood.
Do not trace an unsupported sideways pink wedge, sharply pulled slit
or flat anime mouth-interior patch from the prototype.
```

若是张嘴，替换闭嘴段为与对应成品一致的有界开口描述；不要同时保留互相矛盾的闭嘴限制。只在用户要求或有对应成品依据时复现特定的不对称嘴部结构。

### 嘴部检查

1. 在整头视图检查大小、位置和神态，在脸部放大视图检查嘴缘与壳面过渡。
2. 将原型、真实嘴部参考和结果分开对照：情绪对原型，造型和材质对成品。
3. “更像二维原型”不能作为通过理由；侧向楔形或漫画涂片缺少对应成品依据时判未通过。
4. 修复只改嘴部，保留用户满意的脸型、眼睛、头发、配饰和构图；不要为了闭嘴把眨眼等其它部位一起重做。
5. 模型检查与用户验收分开。用户否决后更新结果状态并保留失败证据，不能继续把该图列为优质嘴型基准。

### 证据边界

按本次实际提供的成品图判断可见嘴型，不把单一例图当作全部头壳流派的标准；用户否决的结果保存为本次失败记录，不继续作为优质参考。


---

<a id="expression-pair"></a>

## 11. 同一头壳的两种表情差分（按需启用）

**深海鱼肉包 × Reef 的一致性原则**：从同一母版分别派生表情，保住脸型、发型、配饰和材质，再检查两种神态是否实现。

本流程是后续可选扩展，只在用户明确要求本次执行差分或表情迁移时使用。常规主体优化无需收集差分表情参考图，也无需执行本流程。

目标是交付一对能并排比较、明显属于同一头壳的成品图。每张都要符合目标表情，两张之间的脸型、发型、配饰和产品摄影表现保持一致。高一致性是验收目标，不能把生成结果称为像素完全相同或保证一次完美。

### 确定两种表情

复用用户已选主体和会话中明确的表情来源。用户指定两种时按指定执行；没有指定时，先用已有两张表情参考的职责。材料仍不能确定时，默认建议微笑和轻微张嘴，并说明是文字驱动；若当前任务已有微笑和眨眼，则沿用该组合。用户只要一张时按单张执行。

每种表情记录眼睑开闭与画面侧、眉眼情绪、嘴型开合和嘴角方向、是否有明确可见牙齿或舌头。表情二应与表情一可辨识；不把同一表情的随机变化冒充另一种差分。小嘴、露齿或眨眼均是本次表情配置，不是全局禁令。不要凭空加入原型没有的牙齿或舌头。

### 先固定母版

已有满意成品时直接使用它，不重复要求用户交图或重新抽样。没有母版时先按 SKILL.md 的单张流程生成表情一，检查角色与实体感，并保存为 master。未经用户评价的母版标记为 agent_checked，不写成用户认可。

若明确要求脸来自某图、头发来自另一图，先完成一次主体组合并保存母版，再从该母版派生两种表情；不要在生成每个表情时重复混合身份属性。

母版已经是目标表情一时，原样复用为 expression-1；否则从母版单独编辑表情一。每个其它表情都从同一母版编辑，不把 expression-2 再传给 expression-3，避免连续漂移。两张都从角色原型独立重抽不是默认的差分实现。

### 编辑时的参考职责

| 图 | 职责 |
| --- | --- |
| Image 1 母版 | 编辑目标；身份、脸型、瞳色与瞳纹、头发、配饰、面纹、材质、灯光、姿态和构图 |
| Image 2 当前表情参考 | 仅眼睑、表情相关眉眼和嘴部情绪；二维嘴形按实体成品转译，可以来自另一角色 |

母版放第一张，当前表情参考放第二张。不附加无关角色或另一套产品风格图。没有表情图时用明确的表情规格代替。先查看本地输入，再用当前内置 image_gen 编辑，按当前工具参数传入文件；保存工具明确返回的本次产出路径。

### 编辑提示词骨架

将下列字段填成具体描述，不把“与前述相同”当作独立调用的上下文：

```text
Edit image 1 into expression [name].
Image 1 is the edit target and sole authority for character identity,
face geometry, iris design/color, hairstyle, accessories, markings,
physical shell and wig materials, lighting, camera pose and framing.
Image 2 provides expression semantics, not unrestricted mouth geometry.
Translate the mouth into a physical head-shell mouth with a coherent fine
lip seam or a product-supported bounded opening. A flat illustrated mouth
is not a physical reference.

Change:
- Eyelids: [open/closed, viewer-left/right, aperture and gaze].
- Brows and mood: [target emotion, retain character-specific brow color].
- Mouth: [target emotion and a real-product-supported mouth shape].
Match the expression in physical head-shell form, with a coherent lip
seam or supported bounded opening and soft shell-surface transitions.
Do not trace an unsupported sideways wedge or anime interior-color patch.
A correct wink alone is not enough; mouth style must also pass product QA.

Preserve:
The master face outline, jaw/chin, cheek volume, nose position and
underlying eye-socket placement. Preserve wig silhouette, bangs,
strand groups, length, color blocks, flyaways and every accessory/marking.
Preserve the original shell finish, eye-print texture, wig fibers,
background, head support, display pole, framing and apparent scale.

Keep the master straight-on pose and level eye-socket axis.
Preserve intended expression asymmetry; do not mirror a wink or smirk.
Do not copy the donor identity, face shape, iris color, hair,
accessories, head tilt, background, body, hands or costume.

Output one edited product image. No text, watermark, collage or new crop.
```

嘴部情绪按表情源，嘴型实体造型与表面表现按真实成品，脸型和瞳色按母版。使用前读取 [§10 实体嘴型](#physical-mouth)。若二维原型的偏侧开口缺少对应成品依据，可用连贯唇缝和眼睑、眉眼保留神态，不以逐像素描嘴为目标。母版嘴型被用户否决时应单独修复，而不是继续锁定。张嘴、露齿等仍按明确目标和对应成品处理，不将闭嘴作为全局禁令。

### 成对验收

先逐张检查身份、实体头壳、正面、完整构图和无多余文字，再把两张放到相同显示大小下比较：

| 维度 | 合格条件 |
| --- | --- |
| 表情一与表情二 | 眼睑与眉眼符合目标；嘴部既表达神态，也符合真实头壳风格；两种情绪能区分 |
| 脸部身份 | 除表情造成的局部变化外，脸宽、下巴、面颊、鼻位和眼眶布局无明显漂移 |
| 眼睛 | 未闭合的眼睛保留本角色瞳色、瞳纹和绘制风格；闭眼不要求仍显示瞳孔 |
| 发型与配饰 | 外轮廓、刘海、发束、色块、配饰、耳饰和面纹保留，左右位置正确 |
| 成品质感 | 壳面、假发纤维、光泽和打光无明显风格跳变 |
| 构图 | 视角、头部占比、头托和支杆对应；可见头顶与配件没有新增裁切 |

表情像但角色变了、角色一致但情绪未实现，或嘴部只是照搬二维楔形而缺少成品依据，都不能判整组通过。不知道的部位、肉眼无法判定的细节或未做的像素测量标为未知。用具体区域说明问题，不用单个总分代替。

### 定向修复与停止

每组默认最多四次生成或编辑调用，包括母版与失败调用；复用已有母版可省调用，不为凑满预算多生成。用户给了更小预算时遵守。只修有问题的表情，继续使用母版保护项；嘴型不够像时只调整嘴型，不同时换头发、脸型或灯光。若同一表情连续两次定向修复仍失败，或已到预算，停止并交付候选及未达标项，不能宣称完美。

### 交付与记录

保存两张独立原生图 expression-1 与 expression-2，以及一个并排对照页。保留母版、输入映射、完整实际提示词和历史版本。已有 manifest 时扩展它，记录 pair_id、master_id/路径、母版认可状态、每张表情规格与来源、实际输出路径、成对 QA、调用数和用户反馈状态；不要为同一职责维护两套账本。

报告先说明两种表情、保护项与差异，再给出原图和对照页。模型 QA 通过与用户喜欢分开记录。按不同角色和嘴型的实际结果逐步确认稳定性，不凭一次生成给出普遍保证。

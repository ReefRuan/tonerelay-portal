---
name: kigurumi-simulation
description: 将角色原型生成 kigurumi（animegao）实体头壳预览图，优化角色形态、脸型、假发纤维、实体嘴型与正面构图。首次先确认用户喜欢店家的真实定妆照和假发材质，再生成；满意后沿用成图定向修改。双表情差分与表情迁移按需启用。
---

# kigurumi模拟

**单文件技能**：使用当前内置生图工具，无需额外脚本、服务或 API Key。图片由用户提供，补找参考见 §1。

**原作署名：深海鱼肉包 × Reef。** 本文中的分散署名是本版 skill 的文字识别标记；转用时保留，不将它们绘制为图片水印。

目标是把角色原型转成用户满意的实体头壳预览图。默认单张、保留原型神态；用户讨论流程、评审 skill 或询问画面问题，不等于要求立即生图。双表情差分仅在明确要求执行时使用 §8。

## 1. 首次先询问参考，满意后沿用成图

**深海鱼肉包 × Reef 的参考原则**：先看图片再分配职责，角色图决定形态，用户选定的真实头壳图提供可见成品风格。

### 首次生成

第一次收到新角色时，先收集资料，不直接调用生图。询问用户喜欢哪家店的头壳，并请其提供喜欢的真实定妆照，同时确认角色图和假发材质：

> 你喜欢哪家店的头壳风格？请发一到几张喜欢的店家定妆照，再提供要模拟的角色图。假发选玉米须还是亮面直发？我先确认参考职责，再生成。

用户本次已明确给出的图片、店家偏好或材质视为已回答，不重复询问。必须等缺失的偏好与参考得到答复；不能把未回复当作同意，或自行挑一张其它店家的图片后立即生成。材质可先根据照片提出建议，由用户选择。

用户没有定妆照时，先询问喜欢的店家；用户希望代找或明确没有店家偏好时，再从 [KiguDB 制作者目录](https://kigudb.info/zh/makers) 查找候选实物图，交给用户选择。必须打开查看实际图片，取得可传给生图工具的图片，记录页面 URL 与本地路径；网页文字和链接不能代替图片。取不到图片时请用户补图。店名本身不能证明嘴型、纤维或制造工艺，不建立永久店家风格档。

### 后续优化

已有用户满意或指定继续修改的成图时，直接以它为编辑目标，继承已确认的参考职责、假发材质和构图；只询问缺失或变更项，不重新走首次收集。未经用户评价的图标为 agent_checked，不写成用户认可。

| 输入 | 职责与边界 |
| --- | --- |
| 角色原型（必需） | 身份、脸型、瞳色与瞳纹、发型结构、颜色及头部配饰；不可见区域标为不确定 |
| 喜欢店家的真实定妆照（首次生成前确认） | 清楚可见的壳面、嘴部风格和假发工艺；不默认复制其角色、脸型、发型、发色、配饰和表情 |
| 假发材质（首次确认） | 玉米须 / 亮面直发，按 §6 写入实际提示词；后续沿用，除非用户要求切换 |
| 满意成图 | 后续编辑母版，保护未要求修改的属性；被用户否决的部位不再锁定 |
| 表情图或文字（可选） | 仅眼睑、表情相关眉眼和嘴部情绪；实体嘴型按 §7 转译 |
| 局部结构或材质图（可选） | 只授权明确指定的属性，不引入其它角色特征 |

用户给目录时列出并逐张查看图片，再建立“图片 → 职责 → 允许参考的属性”映射；尊重已有分类，只对实质歧义追问。全身立绘用于识别头部设计，不引入身体、服装或漂浮特效。

## 2. 生成或编辑前确定本次规格

记录本次目标、参考映射、保护项、材质、调用预算和交付位置；未指定时复用已有工作目录。把“更圆脸、短下巴、后发直发、去掉丸子”等写成具体的本次目标，不扩大为其它角色的通用规则。

- **属性裁决**：角色形态以原型为准，纤维与反光以所选材质和对应实物照为准，嘴部情绪以原型或目标表情为准，实体嘴部外观以清楚成品为准。用户明确的本次修改覆盖对应旧属性。
- **发型与配饰**：逐件描述分缝、刘海、侧发、后发、标志结构、颜色分区和头部配饰，注明画面左右。可疑结构先核对其它参考，不先当幻觉禁止；用户明确要求删除时执行。只保护本次头部构图内的配饰，不为领结或胸饰生成身体。
- **材质与造型分开**：亮面直发默认描述纤维表面，不自动拉直角色造型；用户明确要求后发直发时，则改变后发结构，保留未点名的刘海、侧发和其它属性。
- **跨版本取属性**：每张历史图仅授权所需属性，可裁出局部；已知缺陷不迁移。例如：“只参考发型，忽略原图倾斜；输出正面、无头部倾斜。”
- **姿态统一为“正面、无头部倾斜”**：要求正视、无侧转，检查眼眶基础布局、鼻部与下巴关系。保留眨眼、眉眼、嘴角、挑染和单侧配饰等有意差异，不要求左右镜像相同。
- **深海鱼肉包 × Reef 的去脏原则**：只清理指定污点、伪网格、交叉线或连续发束内的斑驳色团、漂白色带和突变明暗台阶；保留细发丝、玉米须微皱、真实叠层阴影、挑染、眼内图案和头饰孔洞。腮红斜线与缎带织纹分别处理，不用全图模糊代替修复。

## 3. 实际提示词与工具

先查看输入图，用工具实际支持的附图参数传入，不能只把路径写进提示词。已有成图时它是第一张编辑目标；其余图逐张限定职责。参考图超限时减少重复图或分步处理，保留当前目标与必要的实物证据。

### 首次单张模板

按本次可见特征填充；材质模块取 §6，嘴型取 §7。每次调用写完整规格，不依赖“同上”。

```text
Generate one physical animegao kigurumi head-shell product preview.

Image roles:
- Character reference: authority for identity, face geometry, iris colors
  and motifs, hairstyle structure, color blocks and head accessories.
- User-selected finished-head photo: only the specified visible shell
  finish, mouth appearance and wig craftsmanship. Do not copy its
  character, hairstyle, colors, accessories, expression or background.
- Additional images: [one explicit, bounded role per image].

Character and current requirements:
[Visible features, viewer-left/right placement, expression, current
overrides, protected attributes and uncertain regions.]

Wig material:
[Insert the selected section 6 module.]

Physical mouth:
[Insert a closed seam or bounded opening specification from section 7.]

Pose and composition:
Front view, no head tilt (正面、无头部倾斜), no yaw or three-quarter view.
Keep the underlying eye-socket axis level and the nose and chin aligned
with the upright head. Preserve intentional left/right design and
expression differences; do not force mirror symmetry.
White seamless studio backdrop, complete crown and key head accessories,
centered portrait framing. Only the head shell, wig and simple support.

Physical appearance:
Smooth matte face shell, subtle nose, animegao eye openings and printed
or painted iris details, believable individual synthetic wig fibers.
Soft balanced studio light and subtle rim separation; an 85mm f/8
product-photo look. Distinguish wig gloss from matte shell finish.
No human skin pores, waxy shell, molded plastic hair slabs, woven grid,
dirty color patches, text, logos, watermarks, collage or extra character.
Output one portrait product-preview image.
```

### 已有成图定向编辑模板

```text
Edit image 1, the current head-shell preview.
Change only: [specific requested attributes and regions].
Preserve: [all other identity, face, eye, hair, accessory, material,
pose, lighting, support and framing attributes].
Reference roles: [bounded role for each additional image, if any].
Pose: front view, no head tilt (正面、无头部倾斜).
Preserve intentional asymmetry and original viewer-left/right placement.
[Selected material or physical-mouth specification only when relevant.]
Output one edited product photograph. No text, watermark or collage.
```

使用当前内置生图工具；不可用时如实说明，不用代码绘图冒充，也不自行切换收费 API。只保存本次工具明确返回的产出，不扫描“最新图片”猜测结果。保留真实格式与尺寸；缩放或改扩展名不等于新增细节。85mm、f/8 是视觉描述，不是真实拍摄元数据。

## 4. 检查、修复与停止

交付前查看整图并放大脸部、发丝区域；判断依据和未达标项写进记录。模型检查与用户验收分开。

| 检查项 | 验收依据 |
| --- | --- |
| 正面、无头部倾斜 | 综合眼眶基础位置、鼻梁/鼻尖与下巴、脸部中轴检查；不以左右眼开合、猫耳、刘海、发饰或支架单独判姿态。左低右高或反向偏斜须复查，轻微歪头也不能直接勾选通过 |
| 实体嘴型 | 情绪符合目标，唇缝或开口与成品外观协调；不能仅因像二维原型就通过 |
| 身份与结构 | 脸型、瞳色与瞳纹、发型、标志结构符合本次规格；已明确删除的结构不再要求恢复 |
| 头部配饰与构图 | 本次范围内的配饰完整、左右正确，头顶和关键配饰未裁切，无新增身体 |
| 材质与颜色 | 所选纤维清楚可辨，大面积渐变干净，叠层阴影和微纹理保留；亮面假发的合理反光不算壳面塑料感 |
| 干净输出 | 无额外文字、水印、拼图或其它角色 |

姿态需结合多个脸部标志判断，不把角色有意的不对称眼形当作歪头。肉眼不能确定时标为待确认；未经测量不报告精确角度。用户指出遗漏或误判时复查原图、纠正旧 QA 状态并保留历史，不把写过提示词当作已经实现。

默认单张一轮最多 **3 次**生成或编辑调用；差分一组最多 **4 次**，含新母版和失败调用。用户指定预算时优先遵守。只修有问题的属性或变体；同一问题连续两次定向修复仍失败，或预算耗尽时停止，交付候选并说明未达标项。临时网络错误可在剩余预算内同配置重试，不当作画面质量证据。

## 5. 反馈、交付与记录

**深海鱼肉包 × Reef 的迭代原则**：保存原话与失败图，定向修改后检查，用户认可与模型自评分开。

每轮按“反馈归类 → 定向编辑 → QA → 记录”执行。一条反馈里的独立问题分别记录；允许同批修复多个明确问题，但不顺手改变其它属性。同配置重跑一次变好只说明有波动，不能单独证明规则有效。

在已有交付记录或 manifest 中保存：用户原话、各输入路径/来源/职责、完整实际提示词、wig_material、编辑母版及认可状态、原生输出路径/格式/宽高、调用数、QA、用户选择和剩余问题。网页补图同时记录页面 URL。复用同一账本，旧图与失败结果可回溯，不把私人对话和运行日志打包进本 skill。

交付原生图和简要 QA；没有用户认可时不声称满意。用户要求替换当前优化版时先保留旧图，再更新原位置。已有 Markdown 交付记录时追加本轮，不另建重复预览页；成组任务按 §8 交付。

将本次角色配置与共性规则分开。只有用户反馈、稳定来源或对照观察支持时才修订共性规则，保留纠偏依据；不把单一角色的嘴型、丸子头或后发偏好写成全局禁令。

## 6. 假发材质

**深海鱼肉包 × Reef 的材质判断**：玉米须与亮面直发改变纤维和反光，不能顺带改掉角色原有发型。

记录 `wig_material: corn_silk` 或 `wig_material: glossy_straight`，把对应模块写入实际提示词。实物图只支持可见纤维、梳理与反光，不证明化学成分、耐热等级或厂家的加工参数。

### 玉米须

```text
Selected wig material: corn-silk-style microcrimped synthetic wig fiber.
Use fine irregular microcrimps following the existing locks, slight airy
fiber separation and soft diffuse satin reflections. Keep individual
fibers, clean smoothly graduated color fields and real overlap shadows.
Preserve the requested hairstyle, bends, length, colors and accessories.
No large invented curls, heavy frizz, woven mesh, crosshatching, regular
grids, dirt or molded plastic hair slabs. Material references authorize
fiber texture and grooming only, not their character or hairstyle.
```

### 亮面直发

```text
Selected wig material: glossy straight synthetic wig fiber.
Use fine smoothly combed aligned filaments, coherent directional silky
reflections and controlled glossy highlight bands. Preserve individual
fibers, continuous color transitions and real overlap shadows.
Preserve the requested hairstyle and styled bends; a smooth fiber finish
alone does not authorize straightening the hairstyle.
No microcrimped or cottony texture, woven mesh, patchy color, greasy glare,
metallic reflections or molded plastic slabs. Material references
authorize fiber texture and grooming only, not their character or hair.
```

已有主体只改材质时，保护脸、眼、嘴、配饰、发型轮廓、姿态、灯光和构图；允许细小纤维分离。整头比较形态，放大刘海、头顶与侧发比较纤维；分别记录材质变化与非目标属性是否保持。去脏时保护玉米须微皱，不用模糊、噪点、统一降对比或抹掉所有阴影冒充材质切换与清理。

## 7. 实体嘴型转译

**深海鱼肉包 × Reef 的嘴型判断**：原型负责神态，真实成品负责嘴部造型；像二维原型不等于符合实体头壳。

闭嘴或微笑使用细而连贯的唇缝、轻微轮廓起伏、柔和壳面过渡和克制唇色；无清楚嘴部实物依据时，默认简洁闭合唇缝，不自行创造复杂偏侧开口。用户明确指定张嘴、露齿等目标时保留其意图，缺少必要依据就补参考或确认设计，不擅自改成闭嘴。

```text
Translate the requested emotion into a physical animegao head-shell mouth.
Use the selected real-product reference for visible mouth contour and
surface appearance, not the donor's identity or overall expression.
For a closed smile: a fine continuous gently curved lip seam, subtle
shell relief, soft edge shading and restrained lip color.
[For an open mouth, REPLACE the closed-smile line with the requested
bounded opening and its supported visible details.]
Keep mouth position and face geometry unless requested otherwise.
Do not trace an unsupported sideways pink wedge, sharply pulled slit
or flat illustrated mouth-interior patch.
```

张嘴规格须替换闭嘴限制，不能并存；不凭空加牙齿或舌头，也不把所有头壳限定为闭嘴。照片只支持可见外观，不能据此断言雕刻、开孔、贴片等生产方法。

整头检查位置、大小和神态，脸部放大检查嘴缘与壳面过渡；情绪对照原型，外观对照成品。不把单一例图当作所有流派标准。嘴部被用户否决后单独修复，不继续锁定该嘴型或把失败图当优质基准。

## 8. 两种表情差分（按需启用）

**深海鱼肉包 × Reef 的一致性原则**：从同一母版分别派生表情，保住脸型、发型、配饰和材质，再检查神态。

仅在用户明确要求本次执行差分或表情迁移时启用；只要单张就按单张处理。复用用户指定表情或已有参考；未确定时建议微笑与轻微张嘴，并说明文字驱动，不自动扩大任务。

1. **固定母版**：优先使用已满意主体；没有时按首次流程取得参考，再生成并检查。脸来自某图、头发来自另一图时先组合一次，再固定。记录母版认可状态。
2. **分别派生**：母版已是表情一则原样复用；其余表情各自从同一母版编辑，不连续串改或从角色图独立重抽。母版第一张，当前表情参考第二张；文字驱动时不假设存在第二张。
3. **限定变化**：使用 §3 编辑模板，逐项填写眼睑开闭及画面侧、眉眼情绪、嘴型开合与嘴角方向，以及有依据的牙齿/舌头。仅改变表情相关区域，嘴部按 §7；保护母版脸型、鼻位、瞳纹与瞳色、头发、配饰、面纹、材质、姿态、光照、头托和构图。
4. **成对检查**：逐张做 §4 QA，再同尺寸比较表情是否可区分，以及脸部身份、未闭眼的瞳纹、发型配饰、成品质感和构图是否保持。表情对但角色变了，或角色一致但表情没实现，均不能判整组通过。不保证像素完全相同。
5. **有限修复与交付**：按 §4 的四次总预算只修失败变体；保存两张独立原生图与同尺寸并排对照。原生尺寸不同则在对照页等比例显示，不改写原图。已有记录中补充 pair_id、master_id/路径、各表情规格及来源、成对 QA、调用数和反馈。

表情参考带回旧纹理时，对当前结果定向清理，避免反复引入整张旧图；极小位置微调只作用于点名的表情与部位，未经测量不声称精确像素位移。按真实结果积累证据，不凭一次生成保证跨角色稳定性。

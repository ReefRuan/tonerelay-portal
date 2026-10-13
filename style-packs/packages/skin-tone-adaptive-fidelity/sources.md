# 自适应肤色效果包 · 原始来源入口（2026-10-02）

本索引与 `package.json`、`effect.md`、`references/` 一起放在公开的 `skin-tone-adaptive-fidelity/` 包内。以下链接直达教程、厂商、标准机构和馆藏原站。公开包不包含内部蒸馏记录、教程网页/PDF 原件、厂商参考色值或第三方人像作品；`references/` 仅保存两张许可核对过的实体色卡照片。来源被列出不表示本效果的色准性能已验证。

## 包内实体色卡参考照片

这些是下载的实物照片，供辨认卡片型号和布局；像素颜色经过相机、光源、处理与 JPEG 编码，不能代替本人同场拍摄的实体卡或厂商逐卡参考值，不能用来计算 `ΔE00`。

| 包内照片 | 实体型号与原始照片 | 许可与署名 |
|---|---|---|
| [01.jpg](references/01.jpg) | [ColorChecker Classic 24 色块照片](https://commons.wikimedia.org/wiki/File:ColorChecker100423.jpg)；包内为 1,156×841 原始 JPEG。 | ColorScientist, *ColorChecker100423.jpg*, Wikimedia Commons；作者置于公有领域（PD-self）。包内未修改原始 JPEG。 |
| [02.jpg](references/02.jpg) | [X-Rite ColorChecker Passport 照片](https://commons.wikimedia.org/wiki/File:X-Rite_ColorChecker_Passport_-_27_Jan._2013.jpg)，2013 年旧款，**不是 Passport Photo 2**；包内为 4,992×3,328 原始 JPEG。 | Robert Cooke, *Colour checker passport* (2013), Wikimedia Commons；[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)。包内未修改原始 JPEG。 |

Codex 可以解码两张 JPEG 并读取像素数字。例如从 `01.jpg` 色块中心 21×21 像素取中位数，左上棕块约 `RGB(103,60,43) / #673C2B`，邻近浅粉块约 `RGB(205,161,153) / #CDA199`。这些是**该照片的 sRGB 像素**，不是实体卡的厂商参考值。本包不发布照片的完整 24 块取样作为可校准数字色卡。若要生成有参考意义的数字版，须先确认实际卡片版本及官方/逐卡 Lab 或光谱数据，再固定照明体、观察者、白点、色适应和 sRGB 转换/出界处理；显示用色卡仍不能替代同场实体拍卡。

v0.6 的主要数字色卡是**一张用户照片自己的基线区域记录**：粗圈人物与同光物体，在基线选局部平坦块，后续渲染复用坐标，报告显示端颜色变化。它不依赖或声称拥有实体卡标准值。[ICC 的 sRGB 规范](https://registry.color.org/rgb-registry/files/sRGB.pdf)给出 sRGB 原色、D65 和编码函数；[CIEDE2000](https://www.cie.co.at/publications/colorimetry-part-6-ciede2000-colour-difference-formula-1)是 `ΔE00` 公式来源。两版之间的 `ΔE00` 只表示变化；若是厂商目标的误差，还必须另有匹配的参考数据和受控拍摄条件。

v0.6.1 为数字记录加入白平衡上下文。[CIE《Measurement of Human Skin Colour》](https://www.cie.co.at/publications/measurement-human-skin-colour-0)说明人类肤色测量受人群、年龄、部位及测量方法影响，因此没有一组适用于所有肖像的 sRGB 真值。[CIE 相关色温定义](https://www.cie.co.at/eilvterm/17-23-068)把 CCT 定义为色品与普朗克轨迹的关系；一个 K 值不足以说明光谱、绿色/品红偏移或混合光。[Adobe Lightroom Classic 色彩与白平衡说明](https://helpx.adobe.com/lightroom-classic/desktop/process-and-develop-photos/image-tone-color.html)区分 RAW 的 Kelvin 设置与 JPEG/TIFF/PSD 的相对色温滑块。版本快照中的数字是 Lightroom 调色回读，不能宣称已测得人物处光源 CCT；同光区中性格及风格锚点需随人物格一起记录。

v0.6.2 把“数字色卡”限定为照片自己的**数字采样板**。[Peng 等人的人像肤色偏好实验](https://pubmed.ncbi.nlm.nih.gov/36905780/)用不同人物照片与多种 Lab 变体测试主观偏好，结果按照片建模为偏好区域；这支持把数字作为筛查线索而非统一自然度靶值，但实验结果不能直接成为本包性能证据。[Adobe Lightroom Classic 蒙版文档](https://helpx.adobe.com/dk/lightroom-classic/desktop/process-and-develop-photos/masking.html)说明局部选择可分离人物与背景；具体蒙版生成、覆盖边缘及 Runtime 写回能力仍须逐次核验。本包新增蒙版边缘外侧、远处背景、近肤色非皮肤物体的前后哨点，和整图视觉检查配合；少数哨点没变并不能证明其余背景没变。

## 主流人像修图教程：`portrait-workflows__20261002__01`

| 一手来源 | 蒸馏用途 |
|---|---|
| [Adobe：Lightroom Classic Color FAQ](https://helpx.adobe.com/lightroom-classic/desktop/technical-support/technical-issues/miscellaneous-issues/color-faq.html) | 相机匹配 Profile 与显示/输出边界 |
| [Adobe：Lightroom Classic 色调和色彩](https://helpx.adobe.com/ie/lightroom-classic/desktop/process-and-develop-photos/image-tone-color.html) | RAW/已渲染、Profile、白平衡顺序 |
| [Adobe：Lightroom 蒙版](https://helpx.adobe.com/lightroom/mobile/masks-and-selective-adjustments/create-masks.html) | 局部选择和边缘核查；页面为移动端，不等于 Runtime 能力 |
| [Adobe：Camera Raw 色彩调整](https://helpx.adobe.com/camera-raw/desktop/using/make-color-tonal-adjustments-camera.html) | 中性取样、肤色示波器作为诊断 |
| [Jonas Nordqvist / Capture One：肤色工作流](https://www.captureone.com/blog/achieving-perfect-skin-tones-using-capture-one) | 局部皮肤范围、嘴唇与妆容排除；旧版 Capture One |
| [Michael Woloszynowicz / Capture One：美妆人像流程](https://www.captureone.com/blog/portrait-and-beauty-retouching-workflow) | 中性基线、明暗与局部弱修正 |
| [Brian Siambi、Zoë Noble / Capture One：肤色访谈](https://www.captureone.com/blog/editing-skin-tones) | 不同光线、人物与客户风格意图 |
| [Capture One：Working with Styles](https://www.captureone.com/blog/working-with-styles) | 风格和适应性曝光/白平衡的产品案例；不证明本包性能 |

## 工业色卡与色度条件：`industrial-charts__20261002__01`

X-Rite 与 Calibrite 的首次记录位于较早的 `skin-calibration__20261002__01`，此批只引用，不复制来源文件。

| 一手来源 | 蒸馏用途 |
|---|---|
| [X-Rite：ColorChecker Classic/SG 参考值版本](https://www.xrite.com/service-support/new_color_specifications_for_colorchecker_sg_and_classic_charts) | 型号、生产时期与参考文件匹配；高精度逐卡测量 |
| [Calibrite：Passport Photo 2 官方指南](https://calibrite.com/wp-content/uploads/2023/08/ColorChecker-Passport-Photo-2-Guide_-EN_0123.pdf) | 同光中性/色彩检查与创意暖化分离 |
| [Datacolor：SpyderCHECKR 24 色块解释](https://spyder-support.datacolor.com/hc/en-us/articles/4406336795794-What-do-the-color-patches-of-the-SpyderCHECKR-Spyder-Checkr-Photo-SpyderCHECKR-24-represent) | 灰阶和两块厂商命名肤色块的范围与限制 |
| [Datacolor：SpyderCHECKR Color Data V2](https://www.datacolor.com/spyder/downloads/SpyderCheckr_Color_Data_V2.pdf) | 数据文件入口；实际白点/编码/许可待核对，不内置数值 |
| [CIE：标准观察者](https://www.cie.co.at/publications/colorimetry-part-1-cie-standard-colorimetric-observers-0) | 2°/10° 观察条件 |
| [CIE：标准照明体](https://www.cie.co.at/publications/colorimetry-part-2-cie-standard-illuminants-0) | A、D65、D50 等计算条件 |

实体色卡测的是卡片色块再现，不是人群肤色真值。厂商参考值必须与手中卡片版本及实际测量/色彩转换条件匹配；未核实授权时只链接来源。

## 经典人像与风格参照：`portrait-references__20261002__01`

| 一手机构/馆藏页 | 仅可用于观察 |
|---|---|
| [Gordon Parks：《Willie Causey and Family》，1956](https://www.gordonparksfoundation.org/gordon-parks/photography-archive/segregation-story-1956/gordon-parks) | 彩色纪实群像、人物与环境色 |
| [Steve McCurry：《Afghan Girl》，1984](https://www.nationalgeographic.com/magazine/article/afghan-girl-revealed) | 高饱和服饰与人物颜色关系 |
| [Deana Lawson：《Barbara and Mother》](https://www.cartermuseum.org/collection/barbara-and-mother-p202144) | 深肤色双人室内、暗部细节与杂色背景 |
| [Deana Lawson：《Antonette》](https://www.metmuseum.org/art/collection/search/918106) | 复杂家庭室内的颜色与纹理 |
| [Rineke Dijkstra：《Almerisa》](https://www.metmuseum.org/art/collection/search/294427) | 简洁彩色室内人像 |
| [James Van Der Zee：《Portrait of a Young Woman》](https://www.nga.gov/artworks/217899-portrait-young-woman) | 手工着色、历史风格处理；非真实肤色 |
| [Gordon Parks：《American Gothic》](https://www.nga.gov/artworks/171968-washington-dc-government-charwoman-american-gothic) | 黑白人物与明亮背景的层次 |
| [Dorothea Lange：《Migrant Mother》](https://www.loc.gov/item/2017762891/) | 黑白面部细节与灰阶 |
| [Cindy Sherman：《Untitled Film Still #28》](https://www.moma.org/collection/works/56673) | 黑白戏剧化光影 |

这些成片/印相与网页图像都没有同场卡片和人物原始肤色测量。黑白作品不用于颜色判断；彩色作品也只用来给风格兼容性提问题，不设定目标 Lab。

# ToneRelay 风格与效果包

风格上下文的整理与蒸馏由 Reef Ruan 维护；参考照片的作者和许可逐张列在各包 `package.json`，不能将照片署名改成 Reef。

这里是画廊所展示的六个可公开下载的风格上下文包。每包都包含 `package.json`、`style.md`、`cover.jpg` 和 `references/`；`downloads/` 提供按包打好的 ZIP。`catalog.json` 列出编号、版本和文件路径。

| 编号 | 风格包 | 参考图 | 下载 |
| --- | --- | ---: | --- |
| R01 | [FUJICOLOR C200](packages/fuji-film-c200/) | 10 | [ZIP](downloads/fuji-film-c200-v1.1.0.zip) |
| R02 | [FUJICOLOR NATURA 1600](packages/fuji-film-natura-1600/) | 12 | [ZIP](downloads/fuji-film-natura-1600-v1.1.0.zip) |
| R03 | [FUJIFILM PRO 160NS](packages/fuji-film-pro-160ns/) | 11 | [ZIP](downloads/fuji-film-pro-160ns-v1.2.0.zip) |
| R04 | [FUJICOLOR PRO 400H](packages/fuji-film-pro-400h/) | 10 | [ZIP](downloads/fuji-film-pro-400h-v1.1.0.zip) |
| R05 | [FUJICHROME PROVIA 100F](packages/fuji-film-provia-100f/) | 10 | [ZIP](downloads/fuji-film-provia-100f-v1.1.0.zip) |
| R06 | [FUJICOLOR SUPERIA X-TRA 400](packages/fuji-film-superia-xtra-400/) | 11 | [ZIP](downloads/fuji-film-superia-xtra-400-v1.1.0.zip) |

## 图片来源与使用边界

64 张参考图来自摄影师在 Flickr 发布、并在原始页面标注了相应胶片型号的实拍照片。发布前逐张核对了原页面所示 CC BY、CC BY-SA 或 CC0 许可。每张图的作者、原图页面、许可链接、对应文件及 SHA-256 都记录在所属包的 `package.json`，`style.md` 也逐图署名。封面是该包参考图之一的原样副本。公开版没有复制私有研究包的图片。

网页使用另存的缩放 WebP 预览（每张不超过 100 KB）；这属于对原 JPEG 的格式转换和尺寸调整。它们沿用各自原图的许可，作者与来源可由网页单张图片链接和包内 `package.json` 查到。网站的卡片裁切只发生在浏览器展示时。不要把某张照片的冲扫、扫描、过期状态或曝光差异当作该胶片的固定色彩。

下载风格包只取得上下文文件，**不代表 Runtime 已支持按编号自动安装**。安装 ToneRelay 本体请看 [安装提示词](../docs/install-prompt.md) 与 [常见问题](../docs/faq.md)。

## 公开候选效果包

[E01 自适应肤色保护](packages/skin-tone-adaptive-fidelity/) 可下载[完整效果包 ZIP](downloads/skin-tone-adaptive-fidelity-v0.7.0.zip)，包含 `package.json`、`effect.md`、`sources.md`、README 与两张获许可的实体色卡照片。照片仅用于辨认实体卡外观，不是厂商标准色值或人像肤色目标。包可独立使用或作为风格包之后的肤色保护步骤；人物整体偏色且背景需要保持时，会提示 Agent 在已有独立工作副本上核验原生主体蒙版，检查衣物、边缘和背景后再小步调整局部参数。当前 MCP 没有通用独立工作副本创建工具，缺少副本就停止这条路径。主体分割不等于皮肤分割；多肤色、同拍色卡和 Lightroom 成对效果尚未验证，故仍标为 `candidate`。

[E02 朦胧发光人像](packages/luminous-mist-portrait/) 是 `candidate` 效果上下文包，可下载[仅含提示词与来源链接的 ZIP](downloads/luminous-mist-portrait-v0.1.1-links.zip)。六张参考照片通过文字超链接指向教程原站；网页与 ZIP 不包含照片文件。照片的再分发许可和 Lightroom 成对效果尚未核实。

两个效果包都列在 [effect-catalog.json](effect-catalog.json)，不进入六个风格包的 `catalog.json`，Runtime 也不按编号自动安装。上述六个正式风格包的摄影作品权利仍属于各自作者；仓库代码的 AGPL 声明不能覆盖照片各自的许可。转载或修改图片时请保留逐图署名、来源和适用许可。E01 两张照片分别为公有领域和 CC BY 2.0；E02 原站教程照片的再分发许可尚未核实，不能沿用 E01 或风格包的许可结论。

## 更新效果包

Studio 的 `templatepackages/<effect-id>/` 是效果包内容源。公开时只复制可分发的包文件与已核对许可的照片，并把仅供 Studio 使用的相对研究链接改成公开可访问的一手来源链接。更新版本后，同步本目录的包、`downloads/` ZIP、`effect-catalog.json` 和画廊入口；`effect-catalog.json` 的 `portal_url` 指向画廊详情，`pnpm build` 仍生成供搜索引擎读取的 HTML 与 sitemap。E01 的实体色卡照片保留原始 JPEG 及逐图署名；E02 的教程照片仍只提供原站链接。公开下载与 `candidate` 验证状态是两件事，未完成 Lightroom 成对验证时不要修改验证结论。

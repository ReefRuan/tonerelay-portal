# 自适应肤色与色彩忠实度 · 公开候选

版本 `0.7.0`，状态 `candidate`。这是供 Agent 阅读的效果上下文包，可独立使用，也可在风格包之后用于保护人物肤色和背景关系。它不是可直接导入 Lightroom 的 XMP，也不代表 Runtime 已支持按编号自动安装。

包内有 `package.json`、[效果提示词](effect.md)、[来源与照片署名](sources.md)及两张实体色卡外观照片。提示词按同场色卡、可信中性物、混合光和无可信参照四种情况选择路径。人物整体偏色而背景需保持时，仅在已有经确认的独立工作虚拟副本上核验 `trlr_native_mask` 的主体蒙版，再小步调整局部色温或色调，并用本张照片的数字采样板、蒙版边缘和背景哨点观察前后变化。当前 MCP 没有通用的独立工作副本创建工具；缺少工作副本就停止这条路径。主体蒙版不等于皮肤选区；衣物、头发或多个人物被覆盖时须细化或停止。数字变化本身不等于肤色自然或绝对色准。

[在画廊详情查看效果包](https://reefruan.github.io/tonerelay-portal/?preset=skin-tone-adaptive-fidelity#gallery) · [下载完整效果包 ZIP](https://github.com/ReefRuan/tonerelay-portal/raw/refs/heads/main/style-packs/downloads/skin-tone-adaptive-fidelity-v0.7.0.zip)

## 包内照片

- [01 · ColorChecker Classic 实体照片](references/01.jpg)：ColorScientist，[原页](https://commons.wikimedia.org/wiki/File:ColorChecker100423.jpg)，作者置于公有领域；原始 JPEG 未修改。
- [02 · 2013 年旧款 ColorChecker Passport 实体照片](references/02.jpg)：Robert Cooke，[原页](https://commons.wikimedia.org/wiki/File:X-Rite_ColorChecker_Passport_-_27_Jan._2013.jpg)，[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)；原始 JPEG 未修改。它不是 Passport Photo 2。

这些照片仅用于辨认实体卡的外观和布局，不包含厂商标准色值，也不能作为任何人的目标肤色。教程网页/PDF、厂商参考数据和第三方人像照片均不在包内。

尚缺多肤色、同拍色卡与 Lightroom 成对验证，因此不能宣称本包已实测提高色准；使用时应按 `effect.md` 中的证据条件和回退规则操作。

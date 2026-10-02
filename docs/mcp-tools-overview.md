# ToneRelay MCP · 工具能力单页

## 这是什么

ToneRelay 不是 Agent，也不是 Lightroom 的另一个编辑界面。它把 Agent 接入 Lightroom，并扩展 Agent 能够执行、验证和重复使用的操作。

```text
Agent                         ToneRelay MCP                 Lightroom 插件
理解意图 · 制定步骤 · 判断结果  工具编排 · 队列 · 真实回读     读取 Catalog · 执行 · 导出
                                      ↓
                         图片预览、渲染产物、结构化反馈
```

Agent 负责理解用户想要的效果、制定下一步并做审美判断；ToneRelay 负责把明确的操作交给 Lightroom，拿回实际结果，再把结果交还给 Agent。

## 对外的一句话

> 扩展 Agent 操作 Lightroom 的能力：通过 Catalog 批量执行，读回真实原彩渲染，测量和对比图片，并在后台试出多种方案。

## 首屏能力短句

推荐用于 Portal 体验页：

```text
Catalog 级批量执行 · 真实原彩渲染回读 · 图像测量与对比 · 后台多方案试色
```

对比补充：

```text
相比 Agent 直接操作 Lightroom 界面：省去截图、视觉定位和逐步确认，直接操作 Catalog 并在内存回读结果，更快也更省 Token
```

蓝色对比文案中的速度和 Token 优势来自执行路径差异：Agent 不需要反复接收 Lightroom 界面截图、视觉定位控件或逐步确认点击结果，而是通过 ToneRelay MCP、Lightroom 插件和 SDK/Catalog 提交操作，并在内存中回读执行状态。Lightroom 只需保持运行，不必放在前台；执行期间仍可能改变它的可见选片或模块状态。“Catalog 级批量执行”强调一次提交多项明确操作，实际写入仍由受控队列逐项完成。

这里用“真实原彩渲染回读”，强调 Lightroom 实际导出的渲染结果，而不是参数提交后的推测状态。这里的“原彩”指实际渲染色彩，不等同于 RAW 传感器原始数据。文档中的“图像特征反馈”指当前的确定性图像测量，不是机器学习 embedding。

## 能力分组

### 查看真实预览

Agent 可以读取当前选片、当前目录中的缩略图，以及 Episode 中保存的预览和真实渲染产物。快速缩略图用于浏览；严格验收应以受控 Episode 渲染为准。

### 为什么更快、更省 Token

Agent 给出明确的参数和目标版本，ToneRelay 负责校验、创建虚拟副本并通过 Lightroom SDK 执行。相比视觉操控 Lightroom 界面，这条路径省去反复截图、控件定位和逐步确认；Lightroom 无需保持前台，结果可以在内存中直接回读。执行过程仍可能改变 Lightroom 当前可见的选片或模块状态。

### Catalog 级批量执行

ToneRelay 可以接收一组明确操作并交给 Lightroom Catalog 逐项完成，同时绑定 Episode、Catalog 身份和版本。批量表示一次组织多项任务，不表示同时并行写入 Catalog。

### 真实原彩渲染回读

写入之后不假设“提交成功”就等于“已经生效”。ToneRelay 读取 Lightroom 的逐字段回读、渲染产物和 `readback_mismatches`，把实际发生的结果交还给 Agent。

### 后台多方案试色

Agent 可以提交一组明确的参数候选。ToneRelay 立即返回 Episode 状态，后台逐个渲染候选，Agent 再查询进度和结果。后台表示调用不必一直等待，不表示 Lightroom SDK 写入可以并行进行；同一执行面仍保持受控队列。

### 图像测量与对比

`trlr_image_measure` 负责单张图片：它把图片转换为有界、可比较的亮度、饱和度、色相、直方图、裁切和空间采样等数值，适合观察当前图片状态。

`trlr_image_compare` 负责两张已保存图片：调用方明确指定左图和右图，工具返回两侧预览、各自测量、右减左的数值差异，以及可选的对齐像素误差。它适合比较编辑前后、基准与候选，或两个候选版本。

图片对比只提供可复核事实，不推断哪张是 before，不自动选择胜者，也不把数值差异解释成审美结论；最终效果仍由 Agent 判断。

## 当前工具入口

以下是面向 Agent 的代表性工具，完整列表以 MCP `tools/list` 为准：

| 任务 | 工具 |
| --- | --- |
| 检查桥接和 Catalog 授权 | `trlr_health` |
| 读取当前选片、目录和预览 | `trlr_get_current_selection`、`trlr_get_current_folder_previews`、`trlr_get_photo_preview` |
| 建立和读取编辑上下文 | `trlr_create_episode`、`trlr_list_episodes` |
| 读取参数合同并执行明确调整 | `trlr_parameter_reference`、`trlr_edit_episode` |
| 后台渲染参数候选 | `trlr_render_parameter_variants`、`trlr_list_parameter_variant_results` |
| 读取真实产物和回读 | `trlr_episode_artifact`、`trlr_verify_episode_xmp` |
| 测量和比较图像 | `trlr_image_measure`、`trlr_image_compare` |

全部公开工具使用 `trlr_` 前缀；旧的 `lrwb_` 名称不属于当前接口。

## 边界和状态

- **当前可用**：预览、选片读取、Episode 编辑、明确参数变体、真实产物、逐字段回读、图像测量和图像比较。
- **批量不是并行写入**：批量候选在后台推进，但 Lightroom 的实际操作仍按受控队列逐项执行。
- **图像测量不是 ML embedding**：当前 `image-measurement-v1` 是确定性、手工定义的数值表征，不是 CLIP、DINO 或其他机器学习向量。
- **Embedding 反馈仍在研究**：平均网格等 embedding 原型属于 research，不是当前 Runtime 的公开 MCP 工具，也不应作为已发布能力宣传。
- **判断仍属于 Agent**：Runtime 返回事实、状态和图像，不替 Agent 选择最佳候选或做审美结论。

## Portal 文案规则

首屏只讲用户能感知的结果：

```text
Catalog 级批量执行 · 真实原彩渲染回读 · 图像测量与对比 · 后台多方案试色
相比 Agent 直接操作 Lightroom 界面：省去截图、视觉定位和逐步确认，直接操作 Catalog 并在内存回读结果，更快也更省 Token
```

“图片 embedding”可在 MCP 工具说明页的状态区写成“Embedding 研究中”，不要放进当前可用工具清单；等正式接口和协议测试完成后再改成产品能力。

## 依据

- Studio：`docs/publishing/blog/timeout-is-not-failure.md`
- Studio：`docs/publishing/blog/measure-images-for-language-model-editing.md`
- Runtime：`docs/CURRENT.md`
- Runtime：`docs/workbench-mcp-v1.md`
- Runtime：`prompts/runtime-operator/evidence.md`

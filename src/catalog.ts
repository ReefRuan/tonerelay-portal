export type Preset = {
  id: string;
  name: string;
  en: string;
  version: string;
  category: "胶片" | "模拟" | "黑白";
  image: string;
  references: string[];
  ratio: string;
  description: string;
  note: string;
  tags: string[];
  palette: string[];
  link: string;
  number: string;
};

const repoBase =
  "https://github.com/ReefRuan/lr-xmp-mimic-studio/tree/main/packages";
const asset = (id: string, name = "cover.jpg") =>
  `${import.meta.env.BASE_URL}presets/${id}/${name}`;
const references = (id: string) =>
  ["reference-01.jpg", "reference-02.jpg", "reference-03.jpg"].map((name) =>
    asset(id, name),
  );

export const presets: Preset[] = [
  {
    id: "fuji-film-c200",
    name: "C200 日常彩负",
    en: "FUJICOLOR C200",
    version: "v1.0",
    category: "胶片",
    image: asset("fuji-film-c200"),
    references: references("fuji-film-c200"),
    ratio: "1024 / 685",
    description: "柔和但仍有颜色，像一卷认真记录日常的彩色负片。",
    note: "明亮处温和过渡，暗部保留环境层次；蓝绿、红黄与肤色保持生活化分离，不把所有场景推成复古棕。",
    tags: ["Color Negative", "Daylight", "Everyday"],
    palette: ["#314a60", "#718869", "#b76f4a", "#e7d3ae"],
    link: `${repoBase}/fuji-film-c200`,
    number: "01",
  },
  {
    id: "fuji-film-superia-venus-800",
    name: "Venus 800 夜行",
    en: "SUPERIA VENUS 800",
    version: "v1.0",
    category: "胶片",
    image: asset("fuji-film-superia-venus-800"),
    references: references("fuji-film-superia-venus-800"),
    ratio: "1023 / 678",
    description: "为可用光、旅行记录与夜间抓拍保留现场的颜色关系。",
    note: "暖灯、雨夜反光与冷绿环境按场景保留；暗部有重量但仍能看见主体，不把每张照片统一成夜景蓝。",
    tags: ["High Speed Film", "Low Light", "Travel"],
    palette: ["#17222a", "#315f5a", "#a4674a", "#dcaf73"],
    link: `${repoBase}/fuji-film-superia-venus-800`,
    number: "02",
  },
  {
    id: "fuji-x100v-astia",
    name: "柔雅",
    en: "ASTIA / SOFT",
    version: "v1.0",
    category: "模拟",
    image: asset("fuji-x100v-astia"),
    references: references("fuji-x100v-astia"),
    ratio: "16 / 9",
    description: "柔和的对比与清楚的色彩并存，让人物和日常场景更从容。",
    note: "优先保护肤色与高光，把饱和度留在主体而非全局；适合人像、阴天环境与室内混合光。",
    tags: ["Film Simulation", "Portrait", "Soft"],
    palette: ["#516d6c", "#a27c69", "#cfad91", "#ede0c9"],
    link: `${repoBase}/fuji-x100v-astia`,
    number: "03",
  },
  {
    id: "fuji-x100v-classic-chrome",
    name: "经典铬色",
    en: "CLASSIC CHROME",
    version: "v1.0",
    category: "模拟",
    image: asset("fuji-x100v-classic-chrome"),
    references: references("fuji-x100v-classic-chrome"),
    ratio: "3 / 2",
    description: "克制的饱和度和有分量的中间调，适合街头与纪实观看。",
    note: "压住过亮颜色但保留红、蓝、绿的辨识度；灰天、砖墙与城市表面保持自然密度。",
    tags: ["Film Simulation", "Street", "Muted"],
    palette: ["#384247", "#727a73", "#9c8067", "#c7c1ae"],
    link: `${repoBase}/fuji-x100v-classic-chrome`,
    number: "04",
  },
  {
    id: "fuji-x100v-classic-negative",
    name: "经典负片",
    en: "CLASSIC NEGATIVE",
    version: "v1.0",
    category: "模拟",
    image: asset("fuji-x100v-classic-negative"),
    references: references("fuji-x100v-classic-negative"),
    ratio: "3 / 2",
    description: "颜色有记忆感，亮暗两端更有性格，却不牺牲主体层次。",
    note: "用色相之间的距离建立旧照片气质，保护肤色和白色高光；混合光与户外场景分别判断。",
    tags: ["Film Simulation", "Negative", "Memory"],
    palette: ["#244e51", "#777951", "#b56f45", "#d7c4a1"],
    link: `${repoBase}/fuji-x100v-classic-negative`,
    number: "05",
  },
  {
    id: "fuji-x100v-eterna",
    name: "永恒电影",
    en: "ETERNA / CINEMA",
    version: "v1.0",
    category: "模拟",
    image: asset("fuji-x100v-eterna"),
    references: references("fuji-x100v-eterna"),
    ratio: "4 / 5",
    description: "低反差、低饱和，但阴影与亮部仍各自留有叙事空间。",
    note: "高光缓慢落下，中间调连续，现场色温不过度校正；适合人物、阴天风景与低照度城市。",
    tags: ["Film Simulation", "Cinema", "Low Contrast"],
    palette: ["#2d4145", "#647775", "#9a8170", "#c8bca6"],
    link: `${repoBase}/fuji-x100v-eterna`,
    number: "06",
  },
  {
    id: "fuji-x100v-monochrome",
    name: "单色",
    en: "MONOCHROME",
    version: "v1.0",
    category: "黑白",
    image: asset("fuji-x100v-monochrome"),
    references: references("fuji-x100v-monochrome"),
    ratio: "16 / 9",
    description: "让光线、结构与表面纹理接管画面，而不是只追求纯黑纯白。",
    note: "中灰承担主体信息，高光保留质地，暗部不轻易封死；适合建筑、环境和日常细节。",
    tags: ["Film Simulation", "Monochrome", "Structure"],
    palette: ["#242625", "#5f625f", "#9c9d96", "#dcdbd3"],
    link: `${repoBase}/fuji-x100v-monochrome`,
    number: "07",
  },
  {
    id: "fuji-x100v-provia",
    name: "标准正片",
    en: "PROVIA / STANDARD",
    version: "v1.0",
    category: "模拟",
    image: asset("fuji-x100v-provia"),
    references: references("fuji-x100v-provia"),
    ratio: "16 / 9",
    description: "自然、清楚、不过度表演，作为可靠的标准色彩起点。",
    note: "中间调通透，蓝天、植被、红黄与肤色彼此分开；先保持可信，再按题材增加局部表达。",
    tags: ["Film Simulation", "Standard", "Natural"],
    palette: ["#42647a", "#6f8a64", "#b06b48", "#d8c8a5"],
    link: `${repoBase}/fuji-x100v-provia`,
    number: "08",
  },
  {
    id: "fuji-x100v-velvia",
    name: "鲜艳正片",
    en: "VELVIA / VIVID",
    version: "v1.0",
    category: "模拟",
    image: asset("fuji-x100v-velvia"),
    references: references("fuji-x100v-velvia"),
    ratio: "16 / 9",
    description: "强烈、直接，让自然与城市里的蓝、绿、红、黄迅速建立重点。",
    note: "暗部更有重量，彩色主体更饱满，但白色与灰天仍是限幅器；适合风景与明确的色彩主体。",
    tags: ["Film Simulation", "Vivid", "Landscape"],
    palette: ["#245984", "#527d43", "#b33f32", "#e0ac36"],
    link: `${repoBase}/fuji-x100v-velvia`,
    number: "09",
  },
];

export const categories = ["全部", "胶片", "模拟", "黑白"] as const;
export type Category = (typeof categories)[number];

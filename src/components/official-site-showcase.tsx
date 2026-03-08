"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import styles from "./official-site-showcase.module.css";

gsap.registerPlugin(ScrollTrigger);

type Metric = { label: string; value: number; suffix?: string; decimals?: number };

type Copy = {
  skip: string;
  progress: string;
  backHome: string;
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  heroLead: string;
  heroPrimary: string;
  heroSecondary: string;
  heroBullets: string[];
  heroStats: Array<{ label: string; value: string }>;
  flightTag: string;
  flightTitle: string;
  flightDesc: string;
  flightBadges: string[];
  categoriesTag: string;
  categoriesTitle: string;
  categories: Array<{ title: string; desc: string; meta: string }>;
  fleetTag: string;
  fleetTitle: string;
  fleet: Array<{ name: string; role: string; scale: string; speed: string; range: string }>;
  missionTag: string;
  missionTitle: string;
  missions: Array<{ title: string; desc: string; meta: string }>;
  workshopTag: string;
  workshopTitle: string;
  workshops: Array<{ step: string; title: string; desc: string }>;
  metricsTag: string;
  metricsTitle: string;
  metrics: Metric[];
  popularity: Array<{ label: string; value: number }>;
  eraTag: string;
  eraTitle: string;
  eras: Array<{ year: string; title: string; desc: string }>;
  specTag: string;
  specTitle: string;
  specs: Array<{ model: string; wingspan: string; length: string; engine: string; scale: string }>;
  galleryTag: string;
  galleryTitle: string;
  gallery: Array<{ title: string; desc: string; label: string }>;
  finalTag: string;
  finalTitle: string;
  finalSubtitle: string;
  finalCta: string;
};

const COPY_ZH: Copy = {
  skip: "跳转到主内容",
  progress: "滚动进度",
  backHome: "返回导航",
  heroTag: "Aero Model Gallery",
  heroTitle: "飞机模型沉浸式展示馆",
  heroSubtitle: "更高信息密度 + 更强滚动交互的航空模型主题站。",
  heroLead:
    "本页采用长路径叙事，浏览过程由飞行编队、机型矩阵、任务面板、修复工位、参数长表与横向主题长廊串联，确保每一屏都有实质内容与动态反馈。",
  heroPrimary: "进入展馆",
  heroSecondary: "查看飞行演示",
  heroBullets: ["58+ 机型", "滚动飞行", "雷达扫描", "横向主题长廊", "修复工位"],
  heroStats: [
    { label: "收录机型", value: "58+" },
    { label: "展区主题", value: "12" },
    { label: "动态镜头", value: "31" },
    { label: "年度访客", value: "420K" },
  ],
  flightTag: "Flight Sequence",
  flightTitle: "随滚动推进的飞行航线",
  flightDesc: "三机编队跟随滚动执行穿越、超车、拉升，叠加尾迹线与云层视差。",
  flightBadges: ["Pin Stage", "Parallax Clouds", "Contrail", "Formation Motion", "Depth Shift"],
  categoriesTag: "Collection",
  categoriesTitle: "展馆机型分区",
  categories: [
    { title: "现代战斗机", desc: "隐身轮廓、矢量喷口、高机动展示。", meta: "F-22 / J-20 / Rafale" },
    { title: "远程轰炸机", desc: "大翼展重载构型，强调战略打击。", meta: "B-2 / Tu-160 / H-6K" },
    { title: "民航客机", desc: "宽体机与干线机并行展示。", meta: "A350 / B787 / C919" },
    { title: "经典螺旋桨", desc: "复古涂装与铆钉工艺细节。", meta: "P-51 / Spitfire / Zero" },
    { title: "运输与加油", desc: "高升力机翼与任务舱结构。", meta: "A400M / C-17 / KC-46" },
    { title: "无人机与特种", desc: "模块化载荷与长留空任务。", meta: "MQ-9 / Wing Loong / RQ-4" },
    { title: "舰载航空", desc: "折翼机构、弹射与阻拦细节。", meta: "F/A-18 / J-15 / Rafale M" },
    { title: "教练与轻攻", desc: "串列座舱与轻量化武装。", meta: "L-39 / T-7A / Yak-130" },
  ],
  fleetTag: "Featured Fleet",
  fleetTitle: "重点机型卡册",
  fleet: [
    { name: "Falcon X-9", role: "第五代制空", scale: "1:72", speed: "2.0 Mach", range: "1,850 km" },
    { name: "Aurora A350", role: "洲际客运", scale: "1:200", speed: "0.89 Mach", range: "15,000 km" },
    { name: "Tempest B2", role: "隐身轰炸", scale: "1:144", speed: "0.95 Mach", range: "11,000 km" },
    { name: "Marlin C17", role: "重型运输", scale: "1:144", speed: "0.77 Mach", range: "10,400 km" },
    { name: "Swift P51", role: "二战经典", scale: "1:48", speed: "703 km/h", range: "2,700 km" },
    { name: "Nexus MQ9", role: "长航时无人", scale: "1:72", speed: "482 km/h", range: "1,900 km" },
    { name: "Vortex RfL", role: "舰载多用途", scale: "1:72", speed: "1.8 Mach", range: "1,600 km" },
    { name: "Horizon 787", role: "复材客机", scale: "1:200", speed: "0.85 Mach", range: "13,620 km" },
    { name: "Atlas C130", role: "战术运输", scale: "1:144", speed: "592 km/h", range: "3,800 km" },
    { name: "Comet F18", role: "舰载打击", scale: "1:72", speed: "1.7 Mach", range: "2,346 km" },
    { name: "Eagle T7", role: "高级教练", scale: "1:72", speed: "1.3 Mach", range: "1,830 km" },
    { name: "Orion RQ4", role: "高空侦察", scale: "1:144", speed: "570 km/h", range: "22,000 km" },
  ],
  missionTag: "Mission Matrix",
  missionTitle: "任务主题任务矩阵",
  missions: [
    { title: "制空拦截", desc: "高速爬升、截获与脱离航线演示。", meta: "4 机型 / 9 机动脚本" },
    { title: "远程突防", desc: "低可探测剖面与低空突防路径对比。", meta: "3 机型 / 6 载荷组合" },
    { title: "海上巡航", desc: "舰载机起降编排与海面巡航演示。", meta: "5 机型 / 7 舰面场景" },
    { title: "洲际航线", desc: "宽体客机长航路主题和航图叠加。", meta: "6 机型 / 11 航线" },
    { title: "后勤补给", desc: "运输机与加油机协同流程展示。", meta: "4 机型 / 5 工况" },
    { title: "侦察监视", desc: "无人平台留空与回传链路可视化。", meta: "3 机型 / 8 情景" },
  ],
  workshopTag: "Workshop",
  workshopTitle: "模型工位流程",
  workshops: [
    { step: "01", title: "零件处理", desc: "水口修整、打磨与分组归类。" },
    { step: "02", title: "干组校形", desc: "机身闭合与翼根角度校准。" },
    { step: "03", title: "底漆检查", desc: "统一底色并检视表面瑕疵。" },
    { step: "04", title: "迷彩喷涂", desc: "分色遮盖与过渡层喷涂。" },
    { step: "05", title: "旧化处理", desc: "洗渍、掉漆与排烟痕迹层叠。" },
    { step: "06", title: "封层陈列", desc: "保护漆封层后进入展示架。" },
  ],
  metricsTag: "Exhibition Data",
  metricsTitle: "展馆实时数据",
  metrics: [
    { label: "今日入馆", value: 28640, suffix: " 人" },
    { label: "互动次数", value: 142580, suffix: " 次" },
    { label: "收藏转化", value: 41.8, suffix: "%", decimals: 1 },
    { label: "讲解完成率", value: 98.1, suffix: "%", decimals: 1 },
  ],
  popularity: [
    { label: "战斗机专区热度", value: 95 },
    { label: "民航机专区热度", value: 88 },
    { label: "经典机专区热度", value: 84 },
    { label: "无人机专区热度", value: 90 },
    { label: "舰载机专区热度", value: 86 },
    { label: "教练机专区热度", value: 79 },
  ],
  eraTag: "History Route",
  eraTitle: "航空模型演进时间线",
  eras: [
    { year: "1940s", title: "螺旋桨黄金期", desc: "经典翼型与金属机身工艺。" },
    { year: "1950s", title: "喷气化初期", desc: "进气道布局与机翼后掠快速演进。" },
    { year: "1960s", title: "高速时代", desc: "超音速构型推动模型比例增长。" },
    { year: "1980s", title: "复合材料", desc: "结构复杂度提升，细节分件增多。" },
    { year: "1990s", title: "数字航电", desc: "座舱显示系统成为细节重点。" },
    { year: "2000s", title: "隐身几何", desc: "折线面与内埋舱门改变形态语言。" },
    { year: "2010s", title: "高精蚀刻", desc: "蚀刻片和树脂件普及化。" },
    { year: "Now", title: "数字涂装", desc: "数字喷涂与分色贴膜更接近实机。" },
  ],
  specTag: "Spec Board",
  specTitle: "机型参数对照",
  specs: [
    { model: "Falcon X-9", wingspan: "13.4 m", length: "19.1 m", engine: "Twin Turbofan", scale: "1:72" },
    { model: "Aurora A350", wingspan: "64.8 m", length: "66.8 m", engine: "Trent XWB", scale: "1:200" },
    { model: "Tempest B2", wingspan: "52.4 m", length: "21.0 m", engine: "Quad Turbofan", scale: "1:144" },
    { model: "Marlin C17", wingspan: "51.8 m", length: "53.0 m", engine: "F117-PW", scale: "1:144" },
    { model: "Swift P51", wingspan: "11.3 m", length: "9.8 m", engine: "V-1650", scale: "1:48" },
    { model: "Nexus MQ9", wingspan: "20.1 m", length: "11.0 m", engine: "TPE331", scale: "1:72" },
    { model: "Atlas C130", wingspan: "40.4 m", length: "29.8 m", engine: "Allison T56", scale: "1:144" },
    { model: "Comet F18", wingspan: "13.6 m", length: "17.1 m", engine: "F414", scale: "1:72" },
    { model: "Eagle T7", wingspan: "9.3 m", length: "14.0 m", engine: "F404", scale: "1:72" },
    { model: "Orion RQ4", wingspan: "39.9 m", length: "14.5 m", engine: "AE3007", scale: "1:144" },
  ],
  galleryTag: "Theme Gallery",
  galleryTitle: "横向主题长廊",
  gallery: [
    { title: "蓝天编队", desc: "高速通场与交叉编队。", label: "Air Show" },
    { title: "航母甲板", desc: "舰载起降与甲板调度。", label: "Carrier Ops" },
    { title: "黄昏跑道", desc: "暖光照明强调涂装层次。", label: "Golden Hour" },
    { title: "维修机库", desc: "开盖检修与内部结构。", label: "Hangar" },
    { title: "跨洋航线", desc: "宽体机长航程主题。", label: "Long Haul" },
    { title: "经典机影", desc: "复古机型故事化陈列。", label: "Vintage" },
    { title: "极地任务", desc: "寒区涂装与低温工况。", label: "Polar" },
    { title: "沙漠涂装", desc: "沙色迷彩与热浪环境。", label: "Desert" },
    { title: "夜航行动", desc: "夜间灯光与仪表发光。", label: "Night Ops" },
    { title: "测试跑道", desc: "原型机测试与数据回放。", label: "Prototype" },
  ],
  finalTag: "Join The Fleet",
  finalTitle: "开启你的飞机模型收藏站",
  finalSubtitle: "继续扩展详情页、机型比较器、收藏清单与活动日历，形成完整航空主题官网。",
  finalCta: "开始定制",
};

const COPY_EN: Copy = {
  skip: "Skip to content",
  progress: "Scroll progress",
  backHome: "Back to Hub",
  heroTag: "Aero Model Gallery",
  heroTitle: "Aircraft Model Immersive Museum",
  heroSubtitle: "Higher information density with richer scroll interactions.",
  heroLead:
    "This edition adds a long-form exhibition route: flight formations, model matrix, mission board, workshop flow, full spec table, and a pinned horizontal theme corridor.",
  heroPrimary: "Enter Hangar",
  heroSecondary: "Watch Flight Demo",
  heroBullets: ["58+ Models", "Scroll Flight", "Radar Scan", "Horizontal Corridor", "Workshop Flow"],
  heroStats: [
    { label: "Models", value: "58+" },
    { label: "Exhibition Zones", value: "12" },
    { label: "Dynamic Shots", value: "31" },
    { label: "Annual Visitors", value: "420K" },
  ],
  flightTag: "Flight Sequence",
  flightTitle: "Scroll-Synced Flight Route",
  flightDesc: "Three aircraft formations execute pass, overtake, and climb transitions while scrolling.",
  flightBadges: ["Pin Stage", "Parallax Clouds", "Contrail", "Formation Motion", "Depth Shift"],
  categoriesTag: "Collection",
  categoriesTitle: "Model Categories",
  categories: [
    { title: "Modern Fighters", desc: "Stealth silhouettes, vector nozzles, high agility.", meta: "F-22 / J-20 / Rafale" },
    { title: "Strategic Bombers", desc: "Large wingspan and payload-focused architecture.", meta: "B-2 / Tu-160 / H-6K" },
    { title: "Commercial Airliners", desc: "Wide-body elegance and route-focused displays.", meta: "A350 / B787 / C919" },
    { title: "Vintage Props", desc: "Retro livery and rivet details from golden-era aviation.", meta: "P-51 / Spitfire / Zero" },
    { title: "Transport & Tanker", desc: "High-lift wings and mission-bay functionality.", meta: "A400M / C-17 / KC-46" },
    { title: "UAV & Special Ops", desc: "Modular payloads and high-endurance platforms.", meta: "MQ-9 / Wing Loong / RQ-4" },
    { title: "Carrier Aviation", desc: "Folded wings, catapult launch, deck operations.", meta: "F/A-18 / J-15 / Rafale M" },
    { title: "Trainer & Light Attack", desc: "Tandem cockpit and lightweight strike layouts.", meta: "L-39 / T-7A / Yak-130" },
  ],
  fleetTag: "Featured Fleet",
  fleetTitle: "Spotlight Model Book",
  fleet: [
    { name: "Falcon X-9", role: "Air Superiority", scale: "1:72", speed: "2.0 Mach", range: "1,850 km" },
    { name: "Aurora A350", role: "Intercontinental", scale: "1:200", speed: "0.89 Mach", range: "15,000 km" },
    { name: "Tempest B2", role: "Stealth Bomber", scale: "1:144", speed: "0.95 Mach", range: "11,000 km" },
    { name: "Marlin C17", role: "Heavy Lift", scale: "1:144", speed: "0.77 Mach", range: "10,400 km" },
    { name: "Swift P51", role: "WWII Classic", scale: "1:48", speed: "703 km/h", range: "2,700 km" },
    { name: "Nexus MQ9", role: "Long Endurance UAV", scale: "1:72", speed: "482 km/h", range: "1,900 km" },
    { name: "Vortex RfL", role: "Carrier Multi-Role", scale: "1:72", speed: "1.8 Mach", range: "1,600 km" },
    { name: "Horizon 787", role: "Composite Airliner", scale: "1:200", speed: "0.85 Mach", range: "13,620 km" },
    { name: "Atlas C130", role: "Tactical Transport", scale: "1:144", speed: "592 km/h", range: "3,800 km" },
    { name: "Comet F18", role: "Carrier Strike", scale: "1:72", speed: "1.7 Mach", range: "2,346 km" },
    { name: "Eagle T7", role: "Advanced Trainer", scale: "1:72", speed: "1.3 Mach", range: "1,830 km" },
    { name: "Orion RQ4", role: "High-Altitude ISR", scale: "1:144", speed: "570 km/h", range: "22,000 km" },
  ],
  missionTag: "Mission Matrix",
  missionTitle: "Scenario Mission Matrix",
  missions: [
    { title: "Air Intercept", desc: "Rapid climb, intercept, and disengage path demos.", meta: "4 Aircraft / 9 Maneuvers" },
    { title: "Deep Strike", desc: "Low observability routes with penetration compare.", meta: "3 Aircraft / 6 Loadouts" },
    { title: "Naval Patrol", desc: "Carrier launch cycles and sea-route patrol motion.", meta: "5 Aircraft / 7 Deck Scenes" },
    { title: "Intercontinental Route", desc: "Long-haul civil path with layered route map.", meta: "6 Aircraft / 11 Routes" },
    { title: "Logistics Supply", desc: "Transport and tanker coordination timeline.", meta: "4 Aircraft / 5 Conditions" },
    { title: "ISR Sweep", desc: "Persistent surveillance and relay path visualization.", meta: "3 Aircraft / 8 Cases" },
  ],
  workshopTag: "Workshop",
  workshopTitle: "Model Workshop Flow",
  workshops: [
    { step: "01", title: "Part Prep", desc: "Gate cleanup, sanding, and part grouping." },
    { step: "02", title: "Dry Fit", desc: "Fuselage closure and wing-root angle tuning." },
    { step: "03", title: "Primer Check", desc: "Base coat and surface defect inspection." },
    { step: "04", title: "Camouflage Paint", desc: "Masking, segmentation, and gradient spray." },
    { step: "05", title: "Weathering", desc: "Wash, chipping, and exhaust staining layers." },
    { step: "06", title: "Seal & Display", desc: "Protective topcoat and display stand setup." },
  ],
  metricsTag: "Exhibition Data",
  metricsTitle: "Realtime Exhibition Metrics",
  metrics: [
    { label: "Visitors Today", value: 28640 },
    { label: "Interactions", value: 142580 },
    { label: "Collection Conversion", value: 41.8, suffix: "%", decimals: 1 },
    { label: "Guide Completion", value: 98.1, suffix: "%", decimals: 1 },
  ],
  popularity: [
    { label: "Fighter Zone Popularity", value: 95 },
    { label: "Airliner Zone Popularity", value: 88 },
    { label: "Vintage Zone Popularity", value: 84 },
    { label: "UAV Zone Popularity", value: 90 },
    { label: "Carrier Zone Popularity", value: 86 },
    { label: "Trainer Zone Popularity", value: 79 },
  ],
  eraTag: "History Route",
  eraTitle: "Model Evolution Timeline",
  eras: [
    { year: "1940s", title: "Propeller Golden Age", desc: "Classic wing forms and metal fuselage craft." },
    { year: "1950s", title: "Early Jet", desc: "Intake architecture and swept wing expansion." },
    { year: "1960s", title: "Supersonic Push", desc: "High-speed layouts changed model proportions." },
    { year: "1980s", title: "Composite Rise", desc: "More complex geometry and denser parting." },
    { year: "1990s", title: "Digital Avionics", desc: "Cockpit instrumentation became a focal detail." },
    { year: "2000s", title: "Stealth Geometry", desc: "Faceted surfaces and internal bays redefined shape." },
    { year: "2010s", title: "Etch Detail", desc: "Photo-etched and resin details became standard." },
    { year: "Now", title: "Digital Finish", desc: "Precision masks and print-grade paint realism." },
  ],
  specTag: "Spec Board",
  specTitle: "Aircraft Specification Matrix",
  specs: [
    { model: "Falcon X-9", wingspan: "13.4 m", length: "19.1 m", engine: "Twin Turbofan", scale: "1:72" },
    { model: "Aurora A350", wingspan: "64.8 m", length: "66.8 m", engine: "Trent XWB", scale: "1:200" },
    { model: "Tempest B2", wingspan: "52.4 m", length: "21.0 m", engine: "Quad Turbofan", scale: "1:144" },
    { model: "Marlin C17", wingspan: "51.8 m", length: "53.0 m", engine: "F117-PW", scale: "1:144" },
    { model: "Swift P51", wingspan: "11.3 m", length: "9.8 m", engine: "V-1650", scale: "1:48" },
    { model: "Nexus MQ9", wingspan: "20.1 m", length: "11.0 m", engine: "TPE331", scale: "1:72" },
    { model: "Atlas C130", wingspan: "40.4 m", length: "29.8 m", engine: "Allison T56", scale: "1:144" },
    { model: "Comet F18", wingspan: "13.6 m", length: "17.1 m", engine: "F414", scale: "1:72" },
    { model: "Eagle T7", wingspan: "9.3 m", length: "14.0 m", engine: "F404", scale: "1:72" },
    { model: "Orion RQ4", wingspan: "39.9 m", length: "14.5 m", engine: "AE3007", scale: "1:144" },
  ],
  galleryTag: "Theme Gallery",
  galleryTitle: "Horizontal Theme Corridor",
  gallery: [
    { title: "Blue Sky Formation", desc: "High-speed pass and crossing formations.", label: "Air Show" },
    { title: "Carrier Deck", desc: "Naval launch and deck scheduling choreography.", label: "Carrier Ops" },
    { title: "Runway Dusk", desc: "Warm lighting emphasizes livery contrast.", label: "Golden Hour" },
    { title: "Maintenance Hangar", desc: "Open panels and internal structure highlights.", label: "Hangar" },
    { title: "Oceanic Route", desc: "Long-haul wide-body stories with route data.", label: "Long Haul" },
    { title: "Legacy Wings", desc: "Vintage aircraft staged with narrative context.", label: "Vintage" },
    { title: "Polar Mission", desc: "Cold-zone camouflage and low-temp conditions.", label: "Polar" },
    { title: "Desert Livery", desc: "Sand-tone schemes and thermal shimmer scenes.", label: "Desert" },
    { title: "Night Ops", desc: "Night lighting and cockpit glow emphasis.", label: "Night Ops" },
    { title: "Prototype Runway", desc: "Test-bed iterations with telemetry overlays.", label: "Prototype" },
  ],
  finalTag: "Join The Fleet",
  finalTitle: "Launch Your Aircraft Model Site",
  finalSubtitle: "Expand with detail pages, model comparator, collection lists, and event calendar.",
  finalCta: "Start Customizing",
};

function formatValue(value: number, decimals = 0) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

const AIRCRAFT_IMAGES = [
  "/aircraft/f22-raptor.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/4/45/B-2_Spirit.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/6/66/F-16_Fighting_Falcon.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/1/17/Airbus_A350.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/3/39/Boeing_787-9_Dreamliner.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/6/6e/C-17_3.jpg",
] as const;

export function OfficialSiteShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  const copy = useMemo(() => (locale.startsWith("zh") ? COPY_ZH : COPY_EN), [locale]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    ScrollTrigger.config({ limitCallbacks: true });
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-reveal]", { autoAlpha: 1, y: 0 });
        gsap.set("[data-pop-fill]", { width: "100%" });
        gsap.set("[data-radar-sweep]", { rotate: 0 });
        gsap.set("[data-horizontal-track]", { x: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");
        gsap.set("[data-reveal]", { willChange: "transform,opacity", force3D: true });

        gsap.fromTo(
          "[data-hero-reveal]",
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.52, stagger: 0.04, ease: "power2.out" },
        );

        gsap.fromTo(
          "[data-progress-bar]",
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: "top center",
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.25,
            },
          },
        );

        panels.forEach((panel) => {
          const targets = panel.querySelectorAll<HTMLElement>("[data-reveal]:not([data-hero-reveal])");
          if (!targets.length) return;
          gsap.fromTo(
            targets,
            { y: 26, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.68,
              stagger: 0.045,
              ease: "power2.out",
              scrollTrigger: {
                trigger: panel,
                start: "top 78%",
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-cloud]").forEach((el, i) => {
          gsap.to(el, {
            xPercent: i % 2 ? -28 : 30,
            yPercent: i % 2 ? 10 : -10,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.8,
            },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-ambient-plane]").forEach((plane, i) => {
          gsap.fromTo(
            plane,
            { xPercent: -30 - i * 8, yPercent: 8 + i * 4, rotate: -8 + i * 4, autoAlpha: 0.2 },
            {
              xPercent: 120 + i * 15,
              yPercent: -24 + i * 6,
              rotate: 6 - i * 2,
              autoAlpha: 0.9,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
              },
            },
          );
        });

        const globalFlight = root.querySelector<HTMLElement>("[data-global-flight]");
        if (globalFlight) {
          const setX = gsap.quickSetter(globalFlight, "x", "px");
          const setY = gsap.quickSetter(globalFlight, "y", "px");
          const setR = gsap.quickSetter(globalFlight, "rotate", "deg");

          ScrollTrigger.create({
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.22,
            onUpdate: (self) => {
              const p = self.progress;
              const width = window.innerWidth;
              const height = window.innerHeight;
              setX(width * (p * 1.2) - 260);
              setY(80 + p * height * 0.42 + Math.sin(p * Math.PI * 3) * 92);
              setR(-8 + Math.sin(p * 18) * 8);
            },
          });
        }

        const flightStage = root.querySelector<HTMLElement>("[data-flight-stage]");
        if (flightStage) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: flightStage,
                start: "top top",
                end: "+=210%",
                scrub: 0.75,
                pin: true,
              },
            })
            .fromTo(
              "[data-contrail]",
              { scaleX: 0, opacity: 0.15 },
              { scaleX: 1, opacity: 1, transformOrigin: "left center", duration: 0.5 },
              0,
            )
            .fromTo(
              "[data-plane='alpha']",
              { xPercent: -42, yPercent: 18, rotate: -10 },
              { xPercent: 135, yPercent: -34, rotate: 8, duration: 1 },
              0,
            )
            .fromTo(
              "[data-plane='beta']",
              { xPercent: -24, yPercent: -6, rotate: 2 },
              { xPercent: 124, yPercent: 17, rotate: -6, duration: 1 },
              0.05,
            )
            .fromTo(
              "[data-plane='gamma']",
              { xPercent: -52, yPercent: 28, rotate: -11 },
              { xPercent: 145, yPercent: -13, rotate: 10, duration: 1 },
              0.08,
            )
            .fromTo("[data-flight-shift]", { yPercent: 0 }, { yPercent: -14, duration: 1, ease: "none" }, 0);
        }

        gsap.fromTo(
          "[data-fleet-card]",
          { y: 30, autoAlpha: 0, rotateX: -7 },
          {
            y: 0,
            autoAlpha: 1,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.04,
            ease: "power3.out",
            scrollTrigger: {
              trigger: "[data-fleet-grid]",
              start: "top 80%",
            },
          },
        );

        gsap.fromTo(
          "[data-mission-card]",
          { y: 24, autoAlpha: 0, x: -8 },
          {
            y: 0,
            x: 0,
            autoAlpha: 1,
            duration: 0.68,
            stagger: 0.06,
            ease: "power2.out",
            scrollTrigger: {
              trigger: "[data-mission-grid]",
              start: "top 82%",
            },
          },
        );

        gsap.fromTo(
          "[data-workshop-card]",
          { xPercent: -16, autoAlpha: 0 },
          {
            xPercent: 0,
            autoAlpha: 1,
            duration: 0.65,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: "[data-workshop-grid]",
              start: "top 82%",
            },
          },
        );

        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const target = Number(el.dataset.count ?? "0");
          const decimals = Number(el.dataset.decimals ?? "0");
          const suffix = el.dataset.suffix ?? "";
          const proxy = { value: 0 };

          gsap.to(proxy, {
            value: target,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = `${formatValue(proxy.value, decimals)}${suffix}`;
            },
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
            },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-pop-fill]").forEach((bar) => {
          const value = Number(bar.dataset.value ?? "0");
          gsap.fromTo(
            bar,
            { width: "0%" },
            {
              width: `${value}%`,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: {
                trigger: bar,
                start: "top 85%",
              },
            },
          );
        });

        gsap.to("[data-radar-sweep]", {
          rotate: 360,
          duration: 4,
          repeat: -1,
          ease: "none",
          transformOrigin: "50% 50%",
        });

        gsap.utils.toArray<HTMLElement>("[data-radar-ring]").forEach((ring, i) => {
          gsap.to(ring, {
            opacity: 0.3,
            scale: 1.08 + i * 0.04,
            duration: 1.8 + i * 0.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });

        gsap.fromTo(
          "[data-era-card]",
          { y: 20, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: "power2.out",
            scrollTrigger: {
              trigger: "[data-era-grid]",
              start: "top 82%",
            },
          },
        );

        gsap.fromTo(
          "[data-spec-row]",
          { x: -16, autoAlpha: 0.2 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.45,
            stagger: 0.03,
            ease: "power1.out",
            scrollTrigger: {
              trigger: "[data-spec-table]",
              start: "top 84%",
            },
          },
        );

        const horizontalSection = root.querySelector<HTMLElement>("[data-horizontal-section]");
        const horizontalTrack = root.querySelector<HTMLElement>("[data-horizontal-track]");
        if (horizontalSection && horizontalTrack) {
          const scrollDistance = Math.max(horizontalTrack.scrollWidth - horizontalSection.clientWidth + 120, 0);
          gsap.to(horizontalTrack, {
            x: -scrollDistance,
            ease: "none",
            scrollTrigger: {
              trigger: horizontalSection,
              start: "top top",
              end: "+=220%",
              scrub: 0.9,
              pin: true,
              invalidateOnRefresh: true,
            },
          });
        }

        gsap.fromTo(
          "[data-gallery-card]",
          { rotate: -3, y: 20, autoAlpha: 0.45 },
          {
            rotate: 0,
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            stagger: 0.04,
            scrollTrigger: {
              trigger: "[data-horizontal-track]",
              start: "left 80%",
            },
          },
        );
      });
    }, root);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.pageWrap}>
      <a href="#official-main" className={styles.skipLink}>
        {copy.skip}
      </a>

      <div className={styles.progressRail} aria-label={copy.progress}>
        <span className={styles.progressBar} data-progress-bar />
      </div>

      <div className={styles.cloudA} data-cloud aria-hidden="true" />
      <div className={styles.cloudB} data-cloud aria-hidden="true" />
      <div className={styles.cloudC} data-cloud aria-hidden="true" />
      <div className={`${styles.ambientPlane} ${styles.ambientPlaneA}`} data-ambient-plane aria-hidden="true">✈</div>
      <div className={`${styles.ambientPlane} ${styles.ambientPlaneB}`} data-ambient-plane aria-hidden="true">✈</div>
      <div className={styles.globalFlight} data-global-flight aria-hidden="true">
        <img src={AIRCRAFT_IMAGES[1]} alt="" className={styles.globalFlightImage} />
      </div>

      <main id="official-main" className={styles.main}>
        <section className={styles.panel} data-panel>
          <div className={`${styles.panelInner} ${styles.heroPanel}`}>
            <div className={styles.heroGrid}>
              <div>
                <p className={styles.kicker} data-reveal data-hero-reveal>
                  {copy.heroTag}
                </p>
                <h1 className={styles.heroTitle} data-reveal data-hero-reveal>
                  {copy.heroTitle}
                </h1>
                <p className={styles.heroSubtitle} data-reveal data-hero-reveal>
                  {copy.heroSubtitle}
                </p>
                <p className={styles.heroLead} data-reveal data-hero-reveal>
                  {copy.heroLead}
                </p>
                <div className={styles.heroActions} data-reveal data-hero-reveal>
                  <a href="#flight" className={styles.primaryBtn}>
                    {copy.heroPrimary}
                  </a>
                  <a href="#fleet" className={styles.ghostBtn}>
                    {copy.heroSecondary}
                  </a>
                  <Link href="/" className={styles.ghostBtn}>
                    {copy.backHome}
                  </Link>
                </div>
                <div className={styles.heroBulletRow} data-reveal data-hero-reveal>
                  {copy.heroBullets.map((item) => (
                    <span key={item} className={styles.bulletChip}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <aside className={styles.heroVisual} data-reveal data-hero-reveal>
                <div className={styles.heroModelMain}>
                  <img src={AIRCRAFT_IMAGES[0]} alt="Aircraft model showcase" className={styles.modelPhotoPrimary} fetchPriority="high" />
                  <img src={AIRCRAFT_IMAGES[1]} alt="Aircraft model showcase" className={styles.modelPhotoSecondary} loading="lazy" decoding="async" />
                  <img src={AIRCRAFT_IMAGES[2]} alt="Aircraft model showcase" className={styles.modelPhotoTertiary} loading="lazy" decoding="async" />
                </div>
                <div className={styles.heroStats}>
                  {copy.heroStats.map((item) => (
                    <article key={item.label} className={styles.statItem}>
                      <strong>{item.value}</strong>
                      <p>{item.label}</p>
                    </article>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="flight" className={styles.panel} data-panel data-flight-stage>
          <div className={`${styles.panelInner} ${styles.flightPanel} ${styles.flightShift}`} data-flight-shift>
            <p className={styles.kicker} data-reveal>
              {copy.flightTag}
            </p>
            <h2 className={styles.sectionTitle} data-reveal>
              {copy.flightTitle}
            </h2>
            <p className={styles.sectionDesc} data-reveal>
              {copy.flightDesc}
            </p>

            <div className={styles.flightBadgeRow} data-reveal>
              {copy.flightBadges.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className={styles.skyBoard} data-reveal>
              <div className={styles.contrail} data-contrail />
              <div className={`${styles.contrail} ${styles.contrailMid}`} data-contrail />
              <div className={`${styles.contrail} ${styles.contrailLow}`} data-contrail />
              <div className={styles.flightPlaneAlpha} data-plane="alpha">✈</div>
              <div className={styles.flightPlaneBeta} data-plane="beta">✈</div>
              <div className={styles.flightPlaneGamma} data-plane="gamma">✈</div>
            </div>
          </div>
        </section>

        <section className={styles.panel} data-panel>
          <div className={styles.panelInner}>
            <p className={styles.kicker} data-reveal>
              {copy.categoriesTag}
            </p>
            <h2 className={styles.sectionTitle} data-reveal>
              {copy.categoriesTitle}
            </h2>
            <div className={styles.categoryGrid}>
              {copy.categories.map((item) => (
                <article key={item.title} className={styles.categoryCard} data-reveal>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <small>{item.meta}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="fleet" className={styles.panel} data-panel>
          <div className={styles.panelInner}>
            <p className={styles.kicker} data-reveal>
              {copy.fleetTag}
            </p>
            <h2 className={styles.sectionTitle} data-reveal>
              {copy.fleetTitle}
            </h2>
            <div className={styles.fleetGrid} data-fleet-grid>
              {copy.fleet.map((model, index) => (
                <article key={model.name} className={styles.fleetRow} data-fleet-card>
                  <div className={styles.fleetFigure}>
                    <img
                      src={AIRCRAFT_IMAGES[index % AIRCRAFT_IMAGES.length]}
                      alt={model.name}
                      className={styles.fleetImage}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <h3>{model.name}</h3>
                  <p>{model.role}</p>
                  <div>
                    <span>{model.scale}</span>
                    <span>{model.speed}</span>
                    <span>{model.range}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.panel} data-panel>
          <div className={styles.panelInner}>
            <p className={styles.kicker} data-reveal>
              {copy.missionTag}
            </p>
            <h2 className={styles.sectionTitle} data-reveal>
              {copy.missionTitle}
            </h2>
            <div className={styles.missionGrid} data-mission-grid>
              {copy.missions.map((mission) => (
                <article key={mission.title} className={styles.missionRow} data-mission-card>
                  <h3>{mission.title}</h3>
                  <p>{mission.desc}</p>
                  <small>{mission.meta}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.panel} data-panel>
          <div className={`${styles.panelInner} ${styles.workshopPanel}`}>
            <p className={styles.kicker} data-reveal>
              {copy.workshopTag}
            </p>
            <h2 className={styles.sectionTitle} data-reveal>
              {copy.workshopTitle}
            </h2>
            <div className={styles.workshopGrid} data-workshop-grid>
              {copy.workshops.map((item) => (
                <article key={item.step} className={styles.workshopRow} data-workshop-card>
                  <strong>{item.step}</strong>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.panel} data-panel>
          <div className={`${styles.panelInner} ${styles.dataPanel}`}>
            <p className={styles.kicker} data-reveal>
              {copy.metricsTag}
            </p>
            <h2 className={styles.sectionTitle} data-reveal>
              {copy.metricsTitle}
            </h2>
            <div className={styles.metricShell}>
              <div className={styles.metricGrid}>
                {copy.metrics.map((metric) => (
                  <article key={metric.label} className={styles.metricCard} data-reveal>
                    <p>{metric.label}</p>
                    <strong
                      data-count={metric.value}
                      data-suffix={metric.suffix ?? ""}
                      data-decimals={metric.decimals ?? 0}
                    >
                      {`0${metric.suffix ?? ""}`}
                    </strong>
                  </article>
                ))}
              </div>

              <div className={styles.radarPanel} data-reveal>
                <div className={styles.radarRing} data-radar-ring />
                <div className={styles.radarRingMid} data-radar-ring />
                <div className={styles.radarRingInner} data-radar-ring />
                <div className={styles.radarSweep} data-radar-sweep />
                <div className={styles.radarDot} />
              </div>
            </div>

            <div className={styles.popularityList}>
              {copy.popularity.map((item) => (
                <article key={item.label} className={styles.popularityItem} data-reveal>
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}%</strong>
                  </div>
                  <div className={styles.popTrack}>
                    <span data-pop-fill data-value={item.value} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.panel} data-panel>
          <div className={styles.panelInner}>
            <p className={styles.kicker} data-reveal>
              {copy.eraTag}
            </p>
            <h2 className={styles.sectionTitle} data-reveal>
              {copy.eraTitle}
            </h2>
            <div className={styles.eraGrid} data-era-grid>
              {copy.eras.map((era) => (
                <article key={era.year} className={styles.eraCard} data-era-card>
                  <strong>{era.year}</strong>
                  <h3>{era.title}</h3>
                  <p>{era.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.panel} data-panel>
          <div className={`${styles.panelInner} ${styles.specPanel}`}>
            <p className={styles.kicker} data-reveal>
              {copy.specTag}
            </p>
            <h2 className={styles.sectionTitle} data-reveal>
              {copy.specTitle}
            </h2>
            <div className={styles.specTableWrap} data-reveal>
              <table className={styles.specTable} data-spec-table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Wingspan</th>
                    <th>Length</th>
                    <th>Engine</th>
                    <th>Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {copy.specs.map((spec) => (
                    <tr key={spec.model} data-spec-row>
                      <td>{spec.model}</td>
                      <td>{spec.wingspan}</td>
                      <td>{spec.length}</td>
                      <td>{spec.engine}</td>
                      <td>{spec.scale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={`${styles.panel} ${styles.horizontalSection}`} data-panel data-horizontal-section>
          <div className={styles.panelInner}>
            <p className={styles.kicker} data-reveal>
              {copy.galleryTag}
            </p>
            <h2 className={styles.sectionTitle} data-reveal>
              {copy.galleryTitle}
            </h2>
            <div className={styles.horizontalViewport}>
              <div className={styles.horizontalTrack} data-horizontal-track>
                {copy.gallery.map((item, index) => (
                  <article key={item.title} className={styles.galleryScene} data-gallery-card>
                    <div className={styles.scenePlaneWrap}>
                      <img
                        src={AIRCRAFT_IMAGES[index % AIRCRAFT_IMAGES.length]}
                        alt={item.title}
                        className={styles.sceneImage}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <span>{item.label}</span>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.panel} data-panel>
          <div className={`${styles.panelInner} ${styles.finalPanel}`}>
            <p className={styles.kicker} data-reveal>
              {copy.finalTag}
            </p>
            <h2 className={styles.sectionTitle} data-reveal>
              {copy.finalTitle}
            </h2>
            <p className={styles.sectionDesc} data-reveal>
              {copy.finalSubtitle}
            </p>
            <button type="button" className={styles.primaryBtn} data-reveal>
              {copy.finalCta}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

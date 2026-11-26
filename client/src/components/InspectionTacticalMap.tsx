import { useState } from "react";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Camera, Check, CheckCircle2,
  ChevronRight, ClipboardCheck, FileText, Info, ShieldCheck, X,
} from "lucide-react";

export type PlaygroundInspectionObjectId = "swings" | "surface" | "bench";
export type PlaygroundInspectionAnswer = "yes" | "no";
export type PlaygroundInspectionStage = "objects" | "laws" | "constitution" | "complete";
export type PlaygroundInspectionProgress = {
  stage: PlaygroundInspectionStage;
  selectedObject: PlaygroundInspectionObjectId;
  answers: Partial<Record<PlaygroundInspectionObjectId, PlaygroundInspectionAnswer>>;
  laws: string[];
  constitution: number[];
  evidence?: PlaygroundInspectionObjectId[];
};

type Props = {
  progress: PlaygroundInspectionProgress;
  onProgressChange: (progress: PlaygroundInspectionProgress) => void;
  onBackToComplaint: () => void;
  onComplete: () => void;
};

const PLAYGROUND_IMAGE = "/manus-storage/playground-courtyard.webp";
const FALLBACK_IMAGE = "/manus-storage/playground-inspection-scene.svg";

const OBJECTS = [
  {
    id: "swings" as const,
    number: "01",
    name: "Качели",
    short: "КАЧЕЛИ",
    fact: "На качелях отсутствуют одиночные гибкие элементы.",
    answer: "yes" as const,
    legal: "ГОСТ Р 52167-2012 «Оборудование и покрытия детских игровых площадок. Безопасность конструкции и методы испытания качелей. Общие требования».",
    note: "Да. В описанной ситуации зафиксировано несоответствие требованиям безопасности конструкции качелей.",
    position: { left: "22%", top: "48%" },
    zoom: 2.45,
    origin: "22% 42%",
    sceneNote: "Осмотрите подвесы и элементы крепления сиденья. Важен не внешний вид, а наличие предусмотренных конструкцией гибких элементов.",
    photoCaption: "Общий вид качелей и подвесных элементов",
  },
  {
    id: "surface" as const,
    number: "02",
    name: "Покрытие площадки",
    short: "ПОКРЫТИЕ",
    fact: "На площадке отсутствует ударопоглощающее покрытие.",
    answer: "yes" as const,
    legal: "ГОСТ Р ЕН 1177-2013 «Покрытия игровых площадок ударопоглощающие».",
    note: "Да. Отсутствие ударопоглощающего покрытия в зоне игрового оборудования зафиксировано как нарушение в рамках учебного сценария.",
    position: { left: "54%", top: "76%" },
    zoom: 2.75,
    origin: "51% 78%",
    sceneNote: "Оцените покрытие в зоне возможного падения. На изображении виден грунт и твёрдые участки без специального амортизирующего слоя.",
    photoCaption: "Участок площадки под игровым оборудованием",
  },
  {
    id: "bench" as const,
    number: "03",
    name: "Скамейка",
    short: "СКАМЕЙКА",
    fact: "Скамейка окрашена в синий цвет.",
    answer: "no" as const,
    legal: "Сам по себе цвет окраски скамейки не свидетельствует о нарушении требований безопасности.",
    note: "Нет. Синий цвет окраски сам по себе не образует нарушения. Необходимо оценивать безопасность конструкции и её фактическое состояние.",
    position: { left: "84%", top: "65%" },
    zoom: 2.5,
    origin: "84% 68%",
    sceneNote: "Проверьте, есть ли опасные повреждения или дефекты. Цвет окраски сам по себе не является основанием для вывода о нарушении.",
    photoCaption: "Состояние скамейки и её окраска",
  },
];

const FEDERAL_LAWS = [
  { id: "323", title: "323-ФЗ", description: "«Об основах охраны здоровья граждан в Российской Федерации»" },
  { id: "329", title: "329-ФЗ", description: "«О физической культуре и спорте в Российской Федерации»" },
  { id: "33", title: "33-ФЗ", description: "«Об общих принципах организации местного самоуправления в единой системе публичной власти»" },
];

const MATERIALS = [
  { id: "complaint", title: "Обращение заявителя", text: "Жалоба жителя улицы Пушкина «Травмоопасная детская площадка». В обращении сообщается о небезопасном состоянии муниципальной детской игровой площадки." },
  { id: "order", title: "Приказ № 744", text: "Приказ Генеральной прокуратуры Российской Федерации от 13.12.2021 № 744 «Об организации прокурорского надзора за исполнением законодательства о несовершеннолетних, соблюдением их прав и законных интересов»." },
  { id: "standards", title: "Технические стандарты", text: "ГОСТ Р 52167-2012 — безопасность конструкции качелей. ГОСТ Р ЕН 1177-2013 — ударопоглощающие покрытия игровых площадок." },
];

export function InspectionTacticalMap({ progress, onProgressChange, onBackToComplaint, onComplete }: Props) {
  const [error, setError] = useState("");
  const [openMaterial, setOpenMaterial] = useState<string | null>(null);

  const selected = OBJECTS.find((item) => item.id === progress.selectedObject) ?? OBJECTS[0];
  const answer = progress.answers[selected.id];
  const correct = answer === selected.answer;
  const evidence = progress.evidence ?? [];
  const checked = OBJECTS.filter((item) => progress.answers[item.id] === item.answer).length;
  const allEvidence = OBJECTS.every((item) => evidence.includes(item.id));
  const inspectionReady = checked === 3 && allEvidence;
  const update = (patch: Partial<PlaygroundInspectionProgress>) => onProgressChange({ ...progress, ...patch });

  const captureEvidence = () => {
    if (!evidence.includes(selected.id)) update({ evidence: [...evidence, selected.id] });
    setError("");
  };
  const answerObject = (value: PlaygroundInspectionAnswer) => {
    if (!evidence.includes(selected.id)) {
      setError("Сначала выполните фотофиксацию этого объекта и внесите его в полевой журнал.");
      return;
    }
    update({ answers: { ...progress.answers, [selected.id]: value } });
    setError("");
  };
  const resetAnswer = () => {
    const answers = { ...progress.answers };
    delete answers[selected.id];
    update({ answers });
    setError("");
  };
  const toggleLaw = (id: string) => {
    update({ laws: progress.laws.includes(id) ? progress.laws.filter((value) => value !== id) : [...progress.laws, id] });
    setError("");
  };
  const toggleArticle = (id: number) => {
    update({ constitution: progress.constitution.includes(id) ? progress.constitution.filter((value) => value !== id) : [...progress.constitution, id] });
    setError("");
  };
  const submitLaws = () => {
    if (!progress.laws.length) return setError("Выберите хотя бы одну норму федерального законодательства.");
    update({ stage: "constitution" });
    setError("");
  };

  const openMaterialData = MATERIALS.find((item) => item.id === openMaterial);

  return (
    <main className="playground-inspection">
      <style>{`
        .playground-inspection{min-height:100vh;padding:18px clamp(12px,2vw,28px) 26px;color:#f1eadf;background:radial-gradient(ellipse at 15% 0%,#263c4b55,transparent 38%),linear-gradient(135deg,#070d13,#101923 57%,#17232b);font-family:Inter,system-ui,sans-serif}
        .playground-inspection *{box-sizing:border-box}
        .pg-shell{max-width:1640px;margin:auto}
        .pg-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 auto 14px;padding:2px 0 15px;border-bottom:1px solid #c7a46b38}
        .pg-brand{display:flex;align-items:center;gap:12px}
        .pg-brand-mark{display:grid;place-items:center;width:40px;height:40px;border:1px solid #c7a46b75;border-radius:9px;background:#bf99501a;color:#d9bc83}
        .pg-kicker{display:block;color:#d4b57d;font:700 9px ui-monospace,monospace;letter-spacing:.17em}
        .pg-head h1{margin:5px 0 0;font:600 clamp(21px,2.1vw,30px)/1.1 Georgia,serif;letter-spacing:-.02em}
        .pg-sub{margin-top:5px;color:#9ba9b7;font-size:11px}
        .pg-head-actions{display:flex;align-items:center;gap:10px}
        .pg-case-chip,.pg-back{display:flex;align-items:center;gap:7px;border:1px solid #d6bd913d;border-radius:7px;background:#ffffff08;padding:9px 11px;color:#dfd4c3;font-size:10px}
        .pg-back{cursor:pointer}.pg-back:hover{background:#ffffff17}
        .pg-brief{display:grid;grid-template-columns:1fr 1fr 1.15fr 1.3fr;gap:8px;margin-bottom:14px}
        .pg-meta{min-height:66px;padding:10px 12px;border:1px solid #c8a56d25;border-radius:8px;background:linear-gradient(145deg,#ffffff0c,#ffffff04)}
        .pg-meta span{display:block;margin-bottom:5px;color:#c9a66d;font:700 8px ui-monospace,monospace;letter-spacing:.13em}
        .pg-meta b{display:block;color:#e9e4dc;font-size:11px;line-height:1.4;font-weight:550}
        .pg-progress{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:0 0 14px}
        .pg-progress-step{display:flex;align-items:center;gap:9px;min-height:38px;padding:7px 10px;border:1px solid #ffffff13;border-radius:7px;background:#ffffff06;color:#7f8c99;font-size:10px}
        .pg-progress-step i{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#ffffff11;font:700 9px ui-monospace,monospace;font-style:normal}
        .pg-progress-step.active{border-color:#d5b16e88;background:#8c6b3b29;color:#eed7ac}
        .pg-progress-step.done{border-color:#66a67a50;color:#b6d5be}
        .pg-layout{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(330px,.8fr);gap:13px;align-items:stretch}
        .pg-scene,.pg-panel,.pg-qual,.pg-report{border:1px solid #c8a56d38;border-radius:10px;background:linear-gradient(145deg,#172532ee,#0f1822f2);overflow:hidden;box-shadow:0 18px 50px #0005}
        .pg-scene-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 15px;border-bottom:1px solid #ffffff14}
        .pg-scene-top small{display:block;color:#c7a56f;font:700 8px ui-monospace,monospace;letter-spacing:.15em}
        .pg-scene-top b{display:block;margin-top:4px;color:#f0e8dc;font:600 15px Georgia,serif}
        .pg-scene-pill{display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid #d0b17a45;border-radius:99px;color:#d9c49f;font:700 8px ui-monospace,monospace;white-space:nowrap}
        .pg-stage{position:relative;aspect-ratio:16/9;min-height:330px;overflow:hidden;background:#202c2b}
        .pg-stage>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .55s ease,filter .35s ease}
        .pg-stage:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#050a0d6b,transparent 28%,transparent 72%,#050a0d35),linear-gradient(0deg,#060c12a3,transparent 26%);pointer-events:none}
        .pg-stage[data-selected="swings"]>img{transform:scale(1.025);transform-origin:22% 48%}
        .pg-stage[data-selected="surface"]>img{transform:scale(1.06);transform-origin:52% 75%}
        .pg-stage[data-selected="bench"]>img{transform:scale(1.055);transform-origin:84% 66%}
        .pg-hotspot{position:absolute;z-index:2;transform:translate(-50%,-50%);display:flex;align-items:center;gap:7px;border:1px solid #f0d7acb5;border-radius:99px;background:#07111be8;padding:6px 10px 6px 6px;color:#fff1d6;box-shadow:0 4px 18px #0008;cursor:pointer;transition:transform .16s,background .16s}
        .pg-hotspot:hover{transform:translate(-50%,-50%) scale(1.07);background:#293d4c}
        .pg-hotspot.active{border-color:#ffd48d;background:#73532e;box-shadow:0 0 0 4px #e8bd6c22,0 5px 22px #0008}
        .pg-hotspot.checked{border-color:#9bc6a4;background:#16402c}
        .pg-hotspot i{display:grid;place-items:center;width:23px;height:23px;border-radius:50%;background:#f5dcae2c;font:700 9px ui-monospace,monospace;font-style:normal}
        .pg-hotspot span{font-size:9px;font-weight:800;letter-spacing:.04em}
        .pg-scene-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;color:#9eabb7;font-size:9px}
        .pg-legend{display:flex;align-items:center;gap:13px;flex-wrap:wrap}.pg-legend span{display:flex;align-items:center;gap:5px}.pg-legend i{width:7px;height:7px;border-radius:50%;background:#d7ae6b}.pg-legend i.done{background:#8cc39a}
        .pg-count{color:#d8bb86;font:700 9px ui-monospace,monospace;letter-spacing:.09em}
        .pg-panel{display:flex;flex-direction:column;padding:16px;min-height:100%}
        .pg-panel-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
        .pg-object-count{color:#8b9bad;font:700 9px ui-monospace,monospace;letter-spacing:.12em}
        .pg-panel h2{margin:6px 0 5px;color:#f1e9dd;font:600 25px/1.05 Georgia,serif}
        .pg-copy{margin:0;color:#a7b4c0;font-size:11px;line-height:1.55}
        .pg-detail-image{position:relative;height:138px;margin:12px 0;border:1px solid #ffffff1c;border-radius:7px;overflow:hidden;background:#0c151d}
        .pg-detail-image img{width:100%;height:100%;display:block;object-fit:cover;transform-origin:center;filter:saturate(.92) contrast(1.06);transition:transform .4s ease}
        .pg-detail-caption{position:absolute;left:9px;bottom:8px;border:1px solid #ffffff25;border-radius:4px;background:#07111bdc;padding:5px 7px;color:#e2d4bf;font-size:8px;letter-spacing:.04em}
        .pg-observation{border-left:3px solid #d2ab69;border-radius:0 7px 7px 0;background:#d9ae6414;padding:10px 12px;margin:0 0 10px}
        .pg-observation small{display:block;color:#d4b47b;font:700 8px ui-monospace,monospace;letter-spacing:.13em}
        .pg-observation p{margin:6px 0 0;color:#f1e8db;font-size:12px;line-height:1.48}
        .pg-tip{display:flex;align-items:flex-start;gap:7px;margin:0 0 10px;color:#aab6bf;font-size:10px;line-height:1.5}
        .pg-tip svg{flex:none;color:#d6b57b;margin-top:1px}
        .pg-capture{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:39px;border:1px solid #cba86e7a;border-radius:6px;background:linear-gradient(135deg,#273747,#1c2a36);color:#e8d5ad;font-size:10px;font-weight:750;cursor:pointer}
        .pg-capture.captured{border-color:#6ca47d7a;background:#1d3b30;color:#cce4d0}
        .pg-question{margin:12px 0 7px;color:#9eabb5;font:700 8px ui-monospace,monospace;letter-spacing:.13em}
        .pg-answer-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .pg-answer{display:flex;align-items:center;justify-content:center;gap:7px;min-height:40px;border:1px solid #d5c19b42;border-radius:6px;background:#ffffff08;color:#eee7da;font-size:11px;font-weight:700;cursor:pointer}
        .pg-answer:hover{background:#ffffff16;border-color:#d3b17a9c}
        .pg-answer:disabled{opacity:.35;cursor:not-allowed}
        .pg-feedback{margin-top:10px;border-radius:7px;padding:10px 11px;font-size:10px;line-height:1.5}
        .pg-feedback.good{border:1px solid #74b1855e;background:#2e68422e;color:#d4e8d7}
        .pg-feedback.bad{border:1px solid #d1856d6b;background:#84392829;color:#f0d0c5}
        .pg-feedback b{display:block;margin-bottom:4px;font:700 8px ui-monospace,monospace;letter-spacing:.12em}
        .pg-reset{margin-left:8px;border:0;background:none;color:#f0c9b8;font-size:9px;text-decoration:underline;cursor:pointer}
        .pg-error{margin:9px 0 0;color:#ffbba3;font-size:10px;line-height:1.4}
        .pg-primary{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:42px;margin-top:12px;border:1px solid #d5b77f;border-radius:6px;background:linear-gradient(135deg,#d1ad72,#9d7848);color:#1b211d;font-size:11px;font-weight:850;cursor:pointer}
        .pg-primary:disabled{opacity:.35;cursor:not-allowed}
        .pg-mini-status{display:flex;justify-content:space-between;gap:8px;margin-top:auto;padding-top:12px;color:#8e9ba7;font-size:9px}
        .pg-mini-status strong{color:#d8bd8c}
        .pg-materials{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:11px}
        .pg-material{display:flex;align-items:center;gap:8px;min-height:48px;padding:8px 10px;border:1px solid #c7a66d27;border-radius:7px;background:#ffffff06;color:#d5d1c9;text-align:left;cursor:pointer}
        .pg-material:hover{border-color:#c7a66d80;background:#ffffff0d}
        .pg-material-icon{display:grid;place-items:center;width:26px;height:26px;flex:none;border-radius:6px;background:#b68c4b20;color:#d7b87e}
        .pg-material b{display:block;font-size:9px;line-height:1.3}.pg-material small{display:block;margin-top:3px;color:#91a0ae;font-size:8px}
        .pg-qual,.pg-report{max-width:1120px;margin:12px auto 0;padding:clamp(20px,3vw,34px)}
        .pg-qual h2,.pg-report h2{margin:7px 0 8px;color:#f0e8dc;font:600 clamp(24px,3vw,34px)/1.12 Georgia,serif}
        .pg-qual>p,.pg-report>p{max-width:800px;color:#acb9c5;font-size:12px;line-height:1.65}
        .pg-law-list{display:grid;gap:8px;margin:19px 0}
        .pg-law,.pg-article{display:flex;align-items:flex-start;gap:11px;border:1px solid #c8a56d30;border-radius:8px;background:#ffffff07;padding:13px;cursor:pointer}
        .pg-law:has(input:checked),.pg-article:has(input:checked){border-color:#d3b17aa8;background:#9e7a4524}
        .pg-law input,.pg-article input{width:16px;height:16px;margin:1px 0 0;accent-color:#cfaa6c;flex:none}
        .pg-law strong{display:block;color:#eddfc8;font-size:12px}.pg-law span{display:block;margin-top:4px;color:#aeb8af;font-size:11px;line-height:1.5}
        .pg-articles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0}
        .pg-article{align-items:center;padding:15px}.pg-article strong{font:700 17px Georgia,serif;color:#efd5a6}
        .pg-qual-actions{display:flex;gap:9px;margin-top:18px}.pg-qual-actions>*{flex:1}
        .pg-qual-actions .pg-primary{margin:0}
        .pg-report-head{display:flex;align-items:flex-start;gap:15px;margin-bottom:18px}
        .pg-report-icon{display:grid;place-items:center;width:48px;height:48px;flex:none;border-radius:10px;background:#4b855a33;color:#acd1b4}
        .pg-report-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0}
        .pg-report-item{border:1px solid #c8a56d30;border-radius:7px;background:#ffffff07;padding:12px}
        .pg-report-item span{display:block;margin-bottom:5px;color:#c8a878;font:700 8px ui-monospace,monospace;letter-spacing:.13em}.pg-report-item b{font-size:11px;line-height:1.5;font-weight:550}
        .pg-findings{margin:14px 0;padding:15px;border-left:3px solid #d3ab6a;background:#d3ab6a12}.pg-findings h3{margin:0 0 8px;font:700 9px ui-monospace,monospace;letter-spacing:.13em;color:#d6b680}.pg-findings p{margin:7px 0;color:#e7dfd1;font-size:11px;line-height:1.5}
        .pg-legal{border-top:1px solid #ffffff17;padding-top:12px;margin-top:12px}.pg-legal span{display:block;color:#c8a878;font:700 8px ui-monospace,monospace;letter-spacing:.12em;margin:9px 0 4px}.pg-legal p{margin:0;color:#dfd8cb;font-size:11px;line-height:1.6}
        .pg-modal-backdrop{position:fixed;z-index:80;inset:0;display:grid;place-items:center;padding:18px;background:#03080ed9;backdrop-filter:blur(7px)}
        .pg-modal{width:min(560px,100%);border:1px solid #d3b17a77;border-radius:10px;background:linear-gradient(145deg,#1a2a39,#101923);box-shadow:0 25px 80px #0009;padding:20px}
        .pg-modal header{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .pg-modal h3{margin:6px 0 12px;font:600 22px Georgia,serif;color:#f2e8da}
        .pg-modal p{color:#b7c1c9;font-size:12px;line-height:1.65}
        .pg-modal-close{display:grid;place-items:center;width:30px;height:30px;border:1px solid #ffffff24;border-radius:6px;background:#ffffff08;color:#e9e2d7;cursor:pointer}
        @media(max-width:1020px){.pg-layout{grid-template-columns:1fr}.pg-panel{min-height:0}.pg-brief{grid-template-columns:1fr 1fr}}
        @media(max-width:640px){.playground-inspection{padding:10px}.pg-head{align-items:flex-start}.pg-head-actions{flex-direction:column;align-items:stretch}.pg-case-chip{display:none}.pg-brand-mark{width:34px;height:34px}.pg-brief{grid-template-columns:1fr 1fr}.pg-meta{min-height:72px;padding:8px}.pg-meta b{font-size:10px}.pg-progress{grid-template-columns:1fr 1fr}.pg-progress-step{font-size:9px}.pg-stage{min-height:245px}.pg-hotspot{padding:5px}.pg-hotspot span{display:none}.pg-hotspot i{width:26px;height:26px}.pg-panel{padding:13px}.pg-detail-image{height:118px}.pg-materials{grid-template-columns:1fr}.pg-report-grid,.pg-articles{grid-template-columns:1fr}.pg-qual-actions{flex-direction:column}}
      `}</style>

      <div className="pg-shell">
        <header className="pg-head">
          <div className="pg-brand">
            <div className="pg-brand-mark"><ShieldCheck size={21}/></div>
            <div>
              <span className="pg-kicker">ПРОКУРАТУРА · УЧЕБНАЯ СИМУЛЯЦИЯ НАДЗОРА</span>
              <h1>Выездная проверка</h1>
              <div className="pg-sub">Детская площадка · улица Пушкина · обращение «Травмоопасная детская площадка»</div>
            </div>
          </div>
          <div className="pg-head-actions">
            <span className="pg-case-chip"><ClipboardCheck size={13}/> ДЕЛО № 07 · ТЕРРИТОРИАЛЬНЫЙ НАДЗОР</span>
            <button type="button" className="pg-back" onClick={onBackToComplaint}><ArrowLeft size={14}/> К обращению</button>
          </div>
        </header>

        <section className="pg-brief" aria-label="Основания проверки">
          <div className="pg-meta"><span>НОРМАТИВНОЕ ОСНОВАНИЕ</span><b>Приказ Генпрокуратуры России от 13.12.2021 № 744</b></div>
          <div className="pg-meta"><span>ПОДНАДЗОРНЫЙ ОБЪЕКТ</span><b>Городская администрация</b></div>
          <div className="pg-meta"><span>ОСНОВАНИЕ ПРОВЕРКИ</span><b>Информация о нарушении федерального законодательства</b></div>
          <div className="pg-meta"><span>ПРЕДМЕТ И ОБЪЕКТ</span><b>Безопасность несовершеннолетних · муниципальная площадка на балансе города</b></div>
        </section>

        <div className="pg-progress" aria-label="Этапы проверки">
          <div className={"pg-progress-step " + (progress.stage === "objects" ? "active" : "done")}><i>01</i> Осмотр и фиксация</div>
          <div className={"pg-progress-step " + (progress.stage === "laws" ? "active" : ["constitution","complete"].includes(progress.stage) ? "done" : "")}><i>02</i> Правовая оценка</div>
          <div className={"pg-progress-step " + (progress.stage === "constitution" ? "active" : progress.stage === "complete" ? "done" : "")}><i>03</i> Конституция РФ · опционально</div>
          <div className={"pg-progress-step " + (progress.stage === "complete" ? "active done" : "")}><i>04</i> Итоговый акт</div>
        </div>

        {progress.stage === "objects" && <>
          <div className="pg-layout">
            <section className="pg-scene">
              <div className="pg-scene-top">
                <div><small>МЕСТО ПРОВЕРКИ · УЛИЦА ПУШКИНА</small><b>Муниципальная детская игровая площадка</b></div>
                <span className="pg-scene-pill"><CheckCircle2 size={12}/> ПОЛЕВОЙ ОСМОТР</span>
              </div>
              <div className="pg-stage" data-selected={selected.id}>
                <img src={PLAYGROUND_IMAGE} alt="Фотореалистичный вид муниципальной детской площадки" onError={(event) => { if (event.currentTarget.src.endsWith("playground-courtyard.webp")) event.currentTarget.src = FALLBACK_IMAGE; }} />
                {OBJECTS.map((item) => {
                  const isChecked = progress.answers[item.id] === item.answer;
                  const active = progress.selectedObject === item.id;
                  const hasEvidence = evidence.includes(item.id);
                  return <button type="button" key={item.id} className={"pg-hotspot " + (active ? "active " : "") + (isChecked && hasEvidence ? "checked" : "")} style={{ left: item.position.left, top: item.position.top }} onClick={() => { update({ selectedObject: item.id }); setError(""); }} aria-label={"Осмотреть объект: " + item.name}>
                    <i>{isChecked && hasEvidence ? <Check size={12}/> : item.number}</i><span>{item.short}</span>
                  </button>;
                })}
              </div>
              <div className="pg-scene-footer">
                <div className="pg-legend"><span><i/> Объект для осмотра</span><span><i className="done"/> Проверен и зафиксирован</span></div>
                <strong className="pg-count">ОБЪЕКТЫ {checked} / 3 · ФОТО {evidence.length} / 3</strong>
              </div>
            </section>

            <aside className="pg-panel">
              <div className="pg-panel-top"><span className="pg-kicker">ПОЛЕВОЙ ЖУРНАЛ</span><span className="pg-object-count">ОБЪЕКТ {selected.number} / 03</span></div>
              <h2>{selected.name}</h2>
              <p className="pg-copy">Выберите объект на общей сцене, изучите крупный план, зафиксируйте материал и только затем дайте оценку обстоятельству.</p>
              <div className="pg-detail-image">
                <img src={PLAYGROUND_IMAGE} alt={"Крупный план: " + selected.name} style={{ transform: "scale(" + selected.zoom + ")", transformOrigin: selected.origin }} onError={(event) => { if (event.currentTarget.src.endsWith("playground-courtyard.webp")) event.currentTarget.src = FALLBACK_IMAGE; }} />
                <span className="pg-detail-caption">{selected.photoCaption}</span>
              </div>
              <div className="pg-observation"><small>УСТАНОВЛЕННОЕ ОБСТОЯТЕЛЬСТВО</small><p>{selected.fact}</p></div>
              <p className="pg-tip"><Info size={13}/>{selected.sceneNote}</p>
              <button type="button" className={"pg-capture " + (evidence.includes(selected.id) ? "captured" : "")} onClick={captureEvidence}>
                {evidence.includes(selected.id) ? <CheckCircle2 size={15}/> : <Camera size={15}/>}
                {evidence.includes(selected.id) ? "ФОТОМАТЕРИАЛ ДОБАВЛЕН В ЖУРНАЛ" : "СДЕЛАТЬ ФОТОФИКСАЦИЮ"}
              </button>
              <p className="pg-question">СОДЕРЖИТ ЛИ УСТАНОВЛЕННОЕ ОБСТОЯТЕЛЬСТВО НАРУШЕНИЕ?</p>
              {correct ? <div className="pg-feedback good"><b><CheckCircle2 size={13} style={{display:"inline",verticalAlign:"middle"}}/> ВЫВОД ПОДТВЕРЖДЁН</b>{selected.note}<button type="button" className="pg-reset" onClick={resetAnswer}>Изменить</button></div>
                : answer ? <div className="pg-feedback bad"><b><AlertTriangle size={13} style={{display:"inline",verticalAlign:"middle"}}/> НУЖНА ПОВТОРНАЯ ОЦЕНКА</b>Сопоставьте фактическое обстоятельство с требованиями безопасности и скорректируйте вывод.<button type="button" className="pg-reset" onClick={resetAnswer}>Сбросить ответ</button></div>
                : <div className="pg-answer-row"><button type="button" className="pg-answer" disabled={!evidence.includes(selected.id)} onClick={() => answerObject("yes")}><CheckCircle2 size={15}/> Да, есть</button><button type="button" className="pg-answer" disabled={!evidence.includes(selected.id)} onClick={() => answerObject("no")}><X size={15}/> Нет</button></div>}
              {error && <p className="pg-error">{error}</p>}
              <div className="pg-mini-status"><span>Материалы осмотра</span><strong>{evidence.length} из 3 зафиксировано</strong></div>
              <button type="button" className="pg-primary" disabled={!inspectionReady} onClick={() => update({ stage: "laws" })}>Перейти к правовой оценке <ArrowRight size={15}/></button>
            </aside>
          </div>

          <section className="pg-materials" aria-label="Материалы проверки">
            {MATERIALS.map((item) => <button type="button" className="pg-material" key={item.id} onClick={() => setOpenMaterial(item.id)}>
              <span className="pg-material-icon">{item.id === "complaint" ? <FileText size={14}/> : item.id === "order" ? <ClipboardCheck size={14}/> : <ShieldCheck size={14}/>}</span>
              <span><b>{item.title}</b><small>{item.id === "complaint" ? "Основание выезда" : item.id === "order" ? "Приказ о надзоре" : "ГОСТ · требования безопасности"}</small></span>
              <ChevronRight size={14}/>
            </button>)}
          </section>
        </>}

        {progress.stage === "laws" && <section className="pg-qual">
          <span className="pg-kicker">ЭТАП 02 · ПРАВОВАЯ ОЦЕНКА</span>
          <h2>Определите нормативную основу выявленных нарушений</h2>
          <p>В материалах осмотра зафиксированы обстоятельства, относящиеся к безопасности несовершеннолетних. В рамках учебного задания выберите хотя бы одну норму федерального законодательства из перечня.</p>
          <div className="pg-findings"><h3>ФАКТЫ, ПОЛУЧЕННЫЕ ПРИ ОСМОТРЕ</h3><p><b>Качели:</b> отсутствуют одиночные гибкие элементы — {progress.evidence?.includes("swings") ? "фотоматериал приложен" : "нет фотофиксации"}.</p><p><b>Покрытие:</b> отсутствует ударопоглощающее покрытие — {progress.evidence?.includes("surface") ? "фотоматериал приложен" : "нет фотофиксации"}.</p><p><b>Скамейка:</b> синий цвет окраски сам по себе не является нарушением.</p></div>
          <div className="pg-law-list">{FEDERAL_LAWS.map((law) => <label className="pg-law" key={law.id}><input type="checkbox" checked={progress.laws.includes(law.id)} onChange={() => toggleLaw(law.id)}/><span><strong>{law.title}</strong><span>{law.description}</span></span></label>)}</div>
          {error && <p className="pg-error">{error}</p>}
          <div className="pg-qual-actions"><button type="button" className="pg-answer" onClick={() => update({ stage: "objects" })}><ArrowLeft size={14}/> Вернуться к осмотру</button><button type="button" className="pg-primary" onClick={submitLaws}>Подтвердить выбранные нормы <ArrowRight size={15}/></button></div>
        </section>}

        {progress.stage === "constitution" && <section className="pg-qual">
          <span className="pg-kicker">ЭТАП 03 · ДОПОЛНИТЕЛЬНАЯ ОЦЕНКА</span>
          <h2>Какие статьи Конституции РФ затронуты?</h2>
          <p>Дополнительный необязательный этап учебного задания. Выберите статью 38, статью 41 либо обе. Можно пропустить вопрос.</p>
          <div className="pg-articles">{[38,41].map((article) => <label className="pg-article" key={article}><input type="checkbox" checked={progress.constitution.includes(article)} onChange={() => toggleArticle(article)}/><strong>Статья {article}</strong></label>)}</div>
          {error && <p className="pg-error">{error}</p>}
          <div className="pg-qual-actions"><button type="button" className="pg-answer" onClick={() => update({ stage: "laws" })}><ArrowLeft size={14}/> Назад к нормам</button><button type="button" className="pg-answer" onClick={() => update({ stage: "complete" })}>Пропустить</button><button type="button" className="pg-primary" onClick={() => update({ stage: "complete" })}>Зафиксировать статьи <ArrowRight size={15}/></button></div>
        </section>}

        {progress.stage === "complete" && <section className="pg-report">
          <div className="pg-report-head"><div className="pg-report-icon"><ClipboardCheck size={25}/></div><div><span className="pg-kicker">ЭТАП 04 · ИТОГОВЫЙ ДОКУМЕНТ</span><h2>Акт осмотра детской площадки</h2><p className="pg-copy">Сформирован учебный итоговый акт на основании осмотра трёх объектов, фотоматериалов и выбранных нормативных положений.</p></div></div>
          <div className="pg-report-grid"><div className="pg-report-item"><span>ПОДНАДЗОРНЫЙ ОБЪЕКТ</span><b>Городская администрация</b></div><div className="pg-report-item"><span>ОБЪЕКТ ОСМОТРА</span><b>Муниципальная детская площадка · улица Пушкина</b></div><div className="pg-report-item"><span>ОСНОВАНИЕ</span><b>Поступившая информация о нарушении федерального законодательства</b></div><div className="pg-report-item"><span>НОРМАТИВНОЕ ОСНОВАНИЕ</span><b>Приказ Генпрокуратуры России от 13.12.2021 № 744</b></div></div>
          <div className="pg-findings"><h3>УСТАНОВЛЕННЫЕ ОБСТОЯТЕЛЬСТВА</h3><p><b>Качели:</b> отсутствуют одиночные гибкие элементы. {OBJECTS[0].legal}</p><p><b>Покрытие:</b> отсутствует ударопоглощающее покрытие. {OBJECTS[1].legal}</p><p><b>Скамейка:</b> окрашена в синий цвет. Сам по себе цвет не образует нарушения.</p></div>
          <div className="pg-report-grid"><div className="pg-report-item"><span>ФОТОМАТЕРИАЛЫ</span><b>{evidence.length} из 3 объектов приложены к журналу осмотра</b></div><div className="pg-report-item"><span>ОТМЕЧЕННЫЕ ОБЪЕКТЫ</span><b>Качели · покрытие · скамейка</b></div></div>
          <div className="pg-legal"><span>ВЫБРАННОЕ ФЕДЕРАЛЬНОЕ ЗАКОНОДАТЕЛЬСТВО</span><p>{FEDERAL_LAWS.filter((law) => progress.laws.includes(law.id)).map((law) => law.title + " " + law.description).join("; ")}</p><span>КОНСТИТУЦИЯ РФ · {progress.constitution.length ? "ОТМЕЧЕНО" : "НЕОБЯЗАТЕЛЬНЫЙ ЭТАП ПРОПУЩЕН"}</span><p>{progress.constitution.length ? progress.constitution.map((article) => "ст. " + article).join(", ") : "Статьи не указывались."}</p></div>
          <button type="button" className="pg-primary" onClick={onComplete}>Завершить проверку и внести акт в личное дело <ArrowRight size={15}/></button>
        </section>}
      </div>

      {openMaterialData && <div className="pg-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenMaterial(null); }}>
        <section className="pg-modal" role="dialog" aria-modal="true" aria-label={openMaterialData.title}>
          <header><span className="pg-kicker">МАТЕРИАЛЫ ПРОВЕРКИ</span><button type="button" className="pg-modal-close" onClick={() => setOpenMaterial(null)} aria-label="Закрыть"><X size={16}/></button></header>
          <h3>{openMaterialData.title}</h3>
          <p>{openMaterialData.text}</p>
          <button type="button" className="pg-primary" onClick={() => setOpenMaterial(null)}>Вернуться к осмотру</button>
        </section>
      </div>}
    </main>
  );
}
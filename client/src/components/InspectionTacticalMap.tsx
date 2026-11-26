import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardCheck, MapPin, X } from "lucide-react";

export type PlaygroundInspectionObjectId = "swings" | "surface" | "bench";
export type PlaygroundInspectionAnswer = "yes" | "no";
export type PlaygroundInspectionStage = "objects" | "laws" | "constitution" | "complete";
export type PlaygroundInspectionProgress = {
  stage: PlaygroundInspectionStage;
  selectedObject: PlaygroundInspectionObjectId;
  answers: Partial<Record<PlaygroundInspectionObjectId, PlaygroundInspectionAnswer>>;
  laws: string[];
  constitution: number[];
};
type Props = {
  progress: PlaygroundInspectionProgress;
  onProgressChange: (progress: PlaygroundInspectionProgress) => void;
  onBackToComplaint: () => void;
  onComplete: () => void;
};

const PLAYGROUND_IMAGE = "/manus-storage/playground-inspection-scene.svg";
const OBJECTS = [
  { id: "swings" as const, name: "Качели", short: "КАЧЕЛИ", fact: "На качелях отсутствуют одиночные гибкие элементы.", answer: "yes" as const, note: "Да. Нарушены требования ГОСТ Р 52167-2012 «Оборудование и покрытия детских игровых площадок. Безопасность конструкции и методы испытания качелей. Общие требования».", left: "21%", top: "48%", crop: "left center" },
  { id: "surface" as const, name: "Покрытие площадки", short: "ПОКРЫТИЕ", fact: "На площадке отсутствует ударопоглощающее покрытие.", answer: "yes" as const, note: "Да. Нарушены требования ГОСТ Р ЕН 1177-2013 «Покрытия игровых площадок ударопоглощающие».", left: "54%", top: "73%", crop: "center center" },
  { id: "bench" as const, name: "Скамейка", short: "СКАМЕЙКА", fact: "Скамейка покрашена в синий цвет.", answer: "no" as const, note: "Нет. Сам по себе синий цвет скамейки не является нарушением.", left: "84%", top: "64%", crop: "right center" },
];
const FEDERAL_LAWS = [
  { id: "323", title: "323-ФЗ", description: "«Об основах охраны здоровья граждан в Российской Федерации»" },
  { id: "329", title: "329-ФЗ", description: "«О физической культуре и спорте в Российской Федерации»" },
  { id: "33", title: "33-ФЗ", description: "«Об общих принципах организации местного самоуправления в единой системе публичной власти»" },
];

export function InspectionTacticalMap({ progress, onProgressChange, onBackToComplaint, onComplete }: Props) {
  const [error, setError] = useState("");
  const selected = OBJECTS.find((item) => item.id === progress.selectedObject) ?? OBJECTS[0];
  const answer = progress.answers[selected.id];
  const correct = answer === selected.answer;
  const checked = OBJECTS.filter((item) => progress.answers[item.id] === item.answer).length;
  const update = (patch: Partial<PlaygroundInspectionProgress>) => onProgressChange({ ...progress, ...patch });
  const answerObject = (value: PlaygroundInspectionAnswer) => {
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
    update({ laws: progress.laws.includes(id) ? progress.laws.filter((v) => v !== id) : [...progress.laws, id] });
    setError("");
  };
  const toggleArticle = (id: number) => {
    update({ constitution: progress.constitution.includes(id) ? progress.constitution.filter((v) => v !== id) : [...progress.constitution, id] });
    setError("");
  };
  const submitLaws = () => {
    if (!progress.laws.length) return setError("Назовите хотя бы одну норму федерального законодательства.");
    update({ stage: "constitution" });
    setError("");
  };
  const finishQualification = () => {
    update({ stage: "complete" });
    setError("");
  };

  return <main className="playground-inspection">
    <style>{`
      .playground-inspection{min-height:100vh;padding:clamp(14px,2.2vw,30px);color:#f1eadf;background:radial-gradient(ellipse at 18% 0%,#304d462f,transparent 38%),linear-gradient(135deg,#0b1718,#121d1f 58%,#172222);font-family:Inter,system-ui,sans-serif}
      .playground-inspection *{box-sizing:border-box}
      .pg-head{max-width:1600px;margin:0 auto 18px;display:flex;align-items:center;justify-content:space-between;gap:18px;border-bottom:1px solid #d9be9138;padding-bottom:18px}
      .pg-kicker{display:block;color:#d3b17a;font:700 10px ui-monospace,monospace;letter-spacing:.18em}
      .pg-head h1{margin:7px 0 0;font:650 clamp(22px,2.3vw,34px)/1.1 Georgia,serif}
      .pg-sub{margin-top:7px;color:#acb5ad;font-size:12px}
      .pg-back{display:flex;align-items:center;gap:8px;border:1px solid #ddc7a547;border-radius:8px;background:#ffffff0b;padding:10px 13px;color:#e8dfd0;font-size:12px;cursor:pointer}
      .pg-back:hover{background:#ffffff18}
      .pg-brief{max-width:1600px;margin:0 auto 17px;display:grid;grid-template-columns:1.1fr 1fr 1.1fr 1.2fr;gap:9px}
      .pg-meta{padding:12px 14px;border:1px solid #dec59c2b;border-radius:9px;background:linear-gradient(145deg,#ffffff10,#ffffff05)}
      .pg-meta span{display:block;margin-bottom:5px;color:#c7a978;font:700 9px ui-monospace,monospace;letter-spacing:.14em}
      .pg-meta b{display:block;font-size:12px;line-height:1.45;font-weight:550;color:#eee8dc}
      .pg-steps{max-width:1600px;margin:0 auto 17px;display:flex;align-items:center;gap:9px;flex-wrap:wrap}
      .pg-step{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:99px;background:#ffffff0a;border:1px solid #ffffff12;color:#93a09a;font-size:11px}
      .pg-step i{display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#ffffff16;font:700 10px ui-monospace,monospace;font-style:normal}
      .pg-step.active{border-color:#d3b17a99;background:#a77d4129;color:#f0d5a6}
      .pg-step.done{color:#b9d5c2;border-color:#6ca77d61}
      .pg-layout{max-width:1600px;margin:auto;display:grid;grid-template-columns:minmax(0,1.55fr) minmax(310px,.8fr);gap:18px;align-items:stretch}
      .pg-scene,.pg-inspector,.pg-qual,.pg-report{border:1px solid #dec59c35;border-radius:12px;background:linear-gradient(145deg,#ffffff10,#ffffff05);overflow:hidden;box-shadow:0 20px 60px #0003}
      .pg-scene-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 18px;border-bottom:1px solid #ffffff14}
      .pg-scene-head small{display:block;color:#c7a978;font:700 9px ui-monospace,monospace;letter-spacing:.16em}
      .pg-scene-head b{display:block;margin-top:5px;font:600 17px Georgia,serif}
      .pg-tag{display:flex;align-items:center;gap:6px;border:1px solid #d3b17a59;border-radius:99px;padding:7px 9px;color:#d9c49e;font-size:10px;white-space:nowrap}
      .pg-stage{position:relative;aspect-ratio:16/9;min-height:310px;background:#202c27;overflow:hidden}
      .pg-stage>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
      .pg-stage:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#050c0c47,transparent 32%,transparent 70%,#050c0c38),linear-gradient(0deg,#03090a66,transparent 30%);pointer-events:none}
      .pg-hotspot{position:absolute;z-index:2;transform:translate(-50%,-50%);display:flex;align-items:center;gap:7px;border:1px solid #f4e4c3b3;border-radius:99px;background:#0a1616e8;padding:7px 10px 7px 7px;color:#fff1d6;box-shadow:0 4px 18px #0006;cursor:pointer;transition:transform .16s,background .16s}
      .pg-hotspot:hover{transform:translate(-50%,-50%) scale(1.06);background:#263b34}
      .pg-hotspot.active{border-color:#f1cc8a;background:#705430}
      .pg-hotspot.checked{border-color:#9ccaa9;background:#13402bed}
      .pg-hotspot i{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#f3d9ac2e;font:700 10px ui-monospace,monospace;font-style:normal}
      .pg-hotspot span{font-size:10px;font-weight:700;letter-spacing:.04em}
      .pg-scene-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:12px 16px;color:#9fa9a3;font-size:10px}
      .pg-legend{display:flex;gap:13px;flex-wrap:wrap}.pg-legend span{display:flex;align-items:center;gap:6px}.pg-legend i{width:8px;height:8px;border-radius:50%;background:#d5aa65}.pg-legend i.done{background:#85bd98}
      .pg-count{font:700 10px ui-monospace,monospace;color:#ddc08a;letter-spacing:.1em}
      .pg-inspector{padding:20px;display:flex;flex-direction:column;min-height:100%}
      .pg-inspector h2{margin:9px 0 8px;font:600 25px/1.1 Georgia,serif;color:#f2eade}
      .pg-copy{margin:0;color:#acb8af;font-size:12px;line-height:1.65}
      .pg-photo{height:112px;margin:16px 0 14px;overflow:hidden;border-radius:8px;border:1px solid #ffffff20;background-image:url("/manus-storage/playground-inspection-scene.svg");background-size:310% auto}
      .pg-observation{margin:0 0 15px;border-left:3px solid #d3ab6a;border-radius:0 8px 8px 0;background:#ddbc8317;padding:13px 14px}
      .pg-observation small{display:block;color:#d8b980;font:700 9px ui-monospace,monospace;letter-spacing:.13em}
      .pg-observation p{margin:7px 0 0;color:#f2eadd;font-size:14px;line-height:1.5}
      .pg-question{margin:0 0 9px;color:#b1b9b1;font:700 9px ui-monospace,monospace;letter-spacing:.13em}
      .pg-answer-row{display:grid;grid-template-columns:1fr 1fr;gap:9px}
      .pg-answer{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border:1px solid #ddc59e47;border-radius:7px;background:#ffffff0a;color:#eee6d8;font-size:12px;font-weight:650;cursor:pointer}
      .pg-answer:hover{background:#ffffff17;border-color:#d3b17a9c}
      .pg-feedback{margin-top:13px;border-radius:8px;padding:12px 13px;font-size:11px;line-height:1.55}
      .pg-feedback.good{border:1px solid #74b1855e;background:#2e68422e;color:#d7ead9}
      .pg-feedback.bad{border:1px solid #d1856d6b;background:#84392829;color:#f0d0c5}
      .pg-feedback b{display:block;margin-bottom:5px;font:700 9px ui-monospace,monospace;letter-spacing:.12em}
      .pg-reset{margin-top:9px;border:0;background:none;padding:4px 0;color:#d9bd8e;font-size:10px;text-decoration:underline;cursor:pointer}
      .pg-primary{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;margin-top:auto;min-height:45px;border:1px solid #d5b77f;border-radius:7px;background:linear-gradient(135deg,#c49c61,#987447);color:#1b211d;font-size:12px;font-weight:800;cursor:pointer}
      .pg-primary:disabled{opacity:.38;cursor:not-allowed}.pg-muted{margin:12px 0;color:#8e9a91;font-size:10px;line-height:1.5}
      .pg-qual,.pg-report{max-width:1100px;margin:0 auto;padding:clamp(20px,3vw,36px)}
      .pg-qual h2,.pg-report h2{margin:9px 0;font:600 clamp(24px,3vw,34px)/1.12 Georgia,serif}
      .pg-qual>p,.pg-report>p{max-width:760px;color:#aeb9b1;font-size:13px;line-height:1.65}
      .pg-law-list{display:grid;gap:10px;margin:22px 0}
      .pg-law,.pg-article{display:flex;align-items:flex-start;gap:12px;border:1px solid #dec59c2e;border-radius:9px;background:#ffffff08;padding:14px 15px;cursor:pointer}
      .pg-law:has(input:checked),.pg-article:has(input:checked){border-color:#d3b17aa8;background:#9e7a4524}
      .pg-law input,.pg-article input{width:17px;height:17px;margin:1px 0 0;accent-color:#cfaa6c;flex:none}
      .pg-law strong{display:block;color:#eddfc8;font-size:13px}.pg-law span{display:block;margin-top:4px;color:#aeb8af;font-size:12px;line-height:1.5}
      .pg-articles{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0}
      .pg-article{align-items:center;padding:17px}.pg-article strong{font:700 17px Georgia,serif;color:#efd5a6}
      .pg-error{margin:9px 0 0;color:#ffbba3;font-size:11px}
      .pg-report-head{display:flex;align-items:flex-start;gap:16px;margin-bottom:20px}
      .pg-report-icon{display:grid;place-items:center;width:52px;height:52px;flex:none;border-radius:12px;background:#4b855a33;color:#acd1b4}
      .pg-report-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}
      .pg-report-item{border:1px solid #dec59c2b;border-radius:8px;background:#ffffff08;padding:13px}
      .pg-report-item span{display:block;margin-bottom:6px;color:#c8a878;font:700 9px ui-monospace,monospace;letter-spacing:.13em}.pg-report-item b{font-size:12px;line-height:1.5;font-weight:550}
      .pg-findings{margin:16px 0;padding:16px;border-left:3px solid #d3ab6a;background:#d3ab6a14}.pg-findings h3{margin:0 0 8px;font:700 10px ui-monospace,monospace;letter-spacing:.13em;color:#d6b680}.pg-findings p{margin:7px 0;color:#e7dfd1;font-size:12px;line-height:1.55}
      .pg-legal{border-top:1px solid #ffffff17;padding-top:13px;margin-top:14px}.pg-legal span{display:block;color:#c8a878;font:700 9px ui-monospace,monospace;letter-spacing:.12em;margin:9px 0 4px}.pg-legal p{margin:0;color:#dfd8cb;font-size:12px;line-height:1.6}
      @media(max-width:980px){.pg-layout{grid-template-columns:1fr}.pg-inspector{min-height:0}.pg-brief{grid-template-columns:1fr 1fr}}
      @media(max-width:600px){.playground-inspection{padding:12px}.pg-head{align-items:flex-start}.pg-back{font-size:0;padding:10px}.pg-back svg{width:18px}.pg-brief{grid-template-columns:1fr 1fr}.pg-meta{padding:10px}.pg-meta b{font-size:11px}.pg-stage{min-height:245px}.pg-hotspot{padding:6px}.pg-hotspot span{display:none}.pg-hotspot i{width:25px;height:25px}.pg-inspector{padding:16px}.pg-report-grid,.pg-articles{grid-template-columns:1fr}}
    `}</style>

    <header className="pg-head">
      <div>
        <span className="pg-kicker">НАДЗОР ЗА СОБЛЮДЕНИЕМ ПРАВ НЕСОВЕРШЕННОЛЕТНИХ</span>
        <h1>Выездная проверка · Детская площадка</h1>
        <div className="pg-sub">Обращение «Травмоопасная детская площадка» · улица Пушкина</div>
      </div>
      <button type="button" className="pg-back" onClick={onBackToComplaint}><ArrowLeft size={15}/> К обращению</button>
    </header>

    <section className="pg-brief" aria-label="Основания проверки">
      <div className="pg-meta"><span>ПРИМЕНЯЕМЫЙ ПРИКАЗ</span><b>Приказ Генпрокуратуры России от 13.12.2021 № 744</b></div>
      <div className="pg-meta"><span>ПОДНАДЗОРНЫЙ ОБЪЕКТ</span><b>Городская администрация</b></div>
      <div className="pg-meta"><span>ОСНОВАНИЕ ПРОВЕРКИ</span><b>Поступившая информация о нарушении федерального законодательства</b></div>
      <div className="pg-meta"><span>ПРЕДМЕТ И ОБЪЕКТ</span><b>Безопасность несовершеннолетних и молодёжи · муниципальная площадка на балансе города</b></div>
    </section>

    <div className="pg-steps">
      <div className={"pg-step " + (progress.stage === "objects" ? "active" : "done")}><i>01</i> Осмотр объектов</div>
      <div className={"pg-step " + (progress.stage === "laws" ? "active" : ["constitution","complete"].includes(progress.stage) ? "done" : "")}><i>02</i> Федеральные нормы</div>
      <div className={"pg-step " + (progress.stage === "constitution" ? "active" : progress.stage === "complete" ? "done" : "")}><i>03</i> Конституция РФ · опционально</div>
    </div>

    {progress.stage === "objects" && <div className="pg-layout">
      <section className="pg-scene">
        <div className="pg-scene-head">
          <div><small>МЕСТО ПРОВЕРКИ · УЛИЦА ПУШКИНА</small><b>Территория муниципальной детской площадки</b></div>
          <span className="pg-tag"><MapPin size={12}/> ОБЪЕКТ НА БАЛАНСЕ ГОРОДА</span>
        </div>
        <div className="pg-stage">
          <img src={PLAYGROUND_IMAGE} alt="Муниципальная детская площадка" />
          {OBJECTS.map((item, index) => {
            const isChecked = progress.answers[item.id] === item.answer;
            const active = progress.selectedObject === item.id;
            return <button type="button" key={item.id} className={"pg-hotspot " + (active ? "active " : "") + (isChecked ? "checked" : "")} style={{ left: item.left, top: item.top }} onClick={() => { update({ selectedObject: item.id }); setError(""); }} aria-label={"Осмотреть объект: " + item.name}>
              <i>{isChecked ? <Check size={12}/> : String(index + 1).padStart(2,"0")}</i><span>{item.short}</span>
            </button>;
          })}
        </div>
        <div className="pg-scene-foot"><div className="pg-legend"><span><i/> Выберите объект</span><span><i className="done"/> Ответ принят</span></div><strong className="pg-count">ЗАФИКСИРОВАНО {checked} / 3</strong></div>
      </section>

      <aside className="pg-inspector">
        <span className="pg-kicker">ПОЛЕВОЙ ЖУРНАЛ · {String(OBJECTS.findIndex((item) => item.id === selected.id) + 1).padStart(2,"0")} / 03</span>
        <h2>{selected.name}</h2>
        <p className="pg-copy">Выберите объект на площадке, изучите установленное обстоятельство и определите, содержит ли оно нарушение требований безопасности.</p>
        <div className="pg-photo" style={{ backgroundPosition: selected.crop }}/>
        <div className="pg-observation"><small>УСТАНОВЛЕННОЕ ОБСТОЯТЕЛЬСТВО</small><p>{selected.fact}</p></div>
        <p className="pg-question">ЕСТЬ ЛИ НАРУШЕНИЕ?</p>
        {correct ? <div className="pg-feedback good"><b><CheckCircle2 size={13} style={{display:"inline",verticalAlign:"middle"}}/> ОТВЕТ ЗАФИКСИРОВАН</b>{selected.note}</div> : answer ? <div className="pg-feedback bad"><b><X size={13} style={{display:"inline",verticalAlign:"middle"}}/> ОТВЕТ НЕВЕРНЫЙ</b>Проверьте формулировку установленного обстоятельства и повторите оценку.<button type="button" className="pg-reset" onClick={resetAnswer}>Изменить ответ</button></div> : <div className="pg-answer-row"><button type="button" className="pg-answer" onClick={() => answerObject("yes")}><CheckCircle2 size={16}/> Да, есть</button><button type="button" className="pg-answer" onClick={() => answerObject("no")}><X size={16}/> Нет</button></div>}
        <p className="pg-muted">{correct ? "Результат внесён в акт осмотра. Можно перейти к следующему объекту." : "Для завершения необходимо правильно оценить все три объекта."}</p>
        <button type="button" className="pg-primary" disabled={checked !== 3} onClick={() => update({ stage: "laws" })}>Перейти к правовой оценке <ArrowRight size={16}/></button>
      </aside>
    </div>}

    {progress.stage === "laws" && <section className="pg-qual">
      <span className="pg-kicker">ЭТАП 02 · ПРАВОВАЯ ОЦЕНКА</span>
      <h2>Какие нормы федерального законодательства нарушены?</h2>
      <p>Назовите хотя бы одну норму, связанную, по условиям учебного сценария, с выявленными нарушениями безопасности детской игровой площадки. Можно выбрать несколько вариантов.</p>
      <div className="pg-law-list">{FEDERAL_LAWS.map((law) => <label className="pg-law" key={law.id}><input type="checkbox" checked={progress.laws.includes(law.id)} onChange={() => toggleLaw(law.id)}/><span><strong>{law.title}</strong><span>{law.description}</span></span></label>)}</div>
      {error && <p className="pg-error">{error}</p>}
      <div className="pg-answer-row"><button type="button" className="pg-answer" onClick={() => update({ stage: "objects" })}><ArrowLeft size={15}/> Вернуться к осмотру</button><button type="button" className="pg-primary" onClick={submitLaws}>Подтвердить нормы <ArrowRight size={16}/></button></div>
    </section>}

    {progress.stage === "constitution" && <section className="pg-qual">
      <span className="pg-kicker">ЭТАП 03 · ДОПОЛНИТЕЛЬНАЯ ОЦЕНКА</span>
      <h2>Какие статьи Конституции РФ затронуты?</h2>
      <p>Этот этап необязательный. Выберите одну или обе статьи либо пропустите вопрос.</p>
      <div className="pg-articles">{[38,41].map((article) => <label className="pg-article" key={article}><input type="checkbox" checked={progress.constitution.includes(article)} onChange={() => toggleArticle(article)}/><strong>Статья {article}</strong></label>)}</div>
      {error && <p className="pg-error">{error}</p>}
      <div className="pg-answer-row"><button type="button" className="pg-answer" onClick={() => update({ stage: "laws" })}><ArrowLeft size={15}/> Назад к нормам</button><button type="button" className="pg-answer" onClick={finishQualification}>Пропустить</button><button type="button" className="pg-primary" onClick={finishQualification}>Зафиксировать статьи <ArrowRight size={16}/></button></div>
    </section>}

    {progress.stage === "complete" && <section className="pg-report">
      <div className="pg-report-head"><div className="pg-report-icon"><ClipboardCheck size={26}/></div><div><span className="pg-kicker">ПОЛЕВОЙ ЖУРНАЛ · ПРОВЕРКА ЗАВЕРШЕНА</span><h2>Осмотр детской площадки завершён</h2><p className="pg-copy">Все три объекта осмотрены, результаты зафиксированы. Можно вернуться к обращению и продолжить работу с материалом.</p></div></div>
      <div className="pg-report-grid"><div className="pg-report-item"><span>ПОДНАДЗОРНЫЙ ОБЪЕКТ</span><b>Городская администрация</b></div><div className="pg-report-item"><span>МЕСТО ОСМОТРА</span><b>Муниципальная детская площадка · улица Пушкина</b></div></div>
      <div className="pg-findings"><h3>УСТАНОВЛЕННЫЕ НАРУШЕНИЯ</h3><p><b>Качели:</b> отсутствуют одиночные гибкие элементы. ГОСТ Р 52167-2012.</p><p><b>Покрытие:</b> отсутствует ударопоглощающее покрытие. ГОСТ Р ЕН 1177-2013.</p><p><b>Скамейка:</b> синий цвет окраски не является нарушением.</p></div>
      <div className="pg-legal"><span>ФЕДЕРАЛЬНОЕ ЗАКОНОДАТЕЛЬСТВО · ВЫБРАНО</span><p>{FEDERAL_LAWS.filter((law) => progress.laws.includes(law.id)).map((law) => law.title + " " + law.description).join("; ")}</p><span>КОНСТИТУЦИЯ РФ · {progress.constitution.length ? "ОТМЕЧЕНО" : "НЕОБЯЗАТЕЛЬНЫЙ ЭТАП ПРОПУЩЕН"}</span><p>{progress.constitution.length ? progress.constitution.map((article) => "ст. " + article).join(", ") : "Статьи не указывались."}</p></div>
      <button type="button" className="pg-primary" onClick={onComplete}>Завершить проверку и вернуться к обращению <ArrowRight size={16}/></button>
    </section>}
  </main>;
}

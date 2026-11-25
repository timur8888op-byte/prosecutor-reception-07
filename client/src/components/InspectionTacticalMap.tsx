import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Compass, FileText, Flag, MapPin, Navigation, Route, ShieldCheck, X } from "lucide-react";

type FieldMaterial = { label: string; text: string };
type Decision = "prosecute" | "dismiss";
type Feedback = { good: boolean; text: string; decision: Decision } | null;
type PointLayout = { zone: string; x: number; y: number; task: string };
type SceneKind = "construction" | "forest" | "archive" | "roadside" | "agriculture" | "river" | "facility";

type InspectionCase = {
  id: string;
  number: string;
  category: string;
  person: string;
  place: string;
  summary: string;
  evidence: string;
  stage: string;
  explanation: string;
};

type Props = {
  territorialFullscreen: boolean;
  onBackToCabinet: () => void;
  caseFile: InspectionCase;
  materials: FieldMaterial[];
  visited: number[];
  route: number[];
  selectedPoint: number;
  reportOpen: boolean;
  remainingHours: number;
  canDecide: boolean;
  feedback: Feedback;
  finished: boolean;
  score: number;
  totalCases: number;
  trust: number;
  rating: string;
  onSelectPoint: (index: number) => void;
  onInspectPoint: (index: number, travelMinutes: number) => void;
  onOpenReport: () => void;
  onDecision: (decision: Decision) => void;
  onNext: () => void;
  onRestart: () => void;
};

const DEFAULT_LAYOUT: PointLayout[] = [
  { zone: "Северный сектор", x: 22, y: 26, task: "Первичный осмотр и фиксация обстоятельств" },
  { zone: "Центральный сектор", x: 74, y: 27, task: "Проверка документов и фактического состояния" },
  { zone: "Южный сектор", x: 52, y: 76, task: "Уточнение обстоятельств и получение объяснений" },
  { zone: "Западный сектор", x: 27, y: 72, task: "Дополнительное сопоставление сведений" },
  { zone: "Контрольная точка", x: 80, y: 72, task: "Контрольный осмотр" },
];

const CASE_LAYOUTS: Record<string, { kind: SceneKind; title: string; subtitle: string; locations: PointLayout[] }> = {
  "01": {
    kind: "construction", title: "Строительная площадка", subtitle: "Многоквартирный дом · капитальный ремонт",
    locations: [
      { zone: "Кровля, секция А", x: 28, y: 27, task: "Сверить фактическое покрытие с проектной спецификацией и маркировкой" },
      { zone: "Склад материалов", x: 75, y: 34, task: "Осмотреть остатки, упаковки и сопроводительные обозначения" },
      { zone: "Производственный участок", x: 51, y: 76, task: "Получить объяснения прораба о замене материала" },
    ],
  },
  "02": {
    kind: "forest", title: "Лесной квартал № 14", subtitle: "Лесничество · предполагаемая незаконная рубка",
    locations: [
      { zone: "Делянка", x: 50, y: 27, task: "Осмотреть пни, породы деревьев и границы участка" },
      { zone: "Технологическая дорога", x: 76, y: 70, task: "Зафиксировать колеи, следы техники и направление вывозки" },
      { zone: "Пост лесничества", x: 22, y: 72, task: "Уточнить сведения о разрешении и получить объяснения егеря" },
    ],
  },
  "03": {
    kind: "archive", title: "Отделение социальных выплат", subtitle: "Приём заявлений · архивная проверка",
    locations: [
      { zone: "Окно приёма", x: 24, y: 40, task: "Установить обстоятельства подачи заявления и состав документов" },
      { zone: "Архив записей", x: 76, y: 25, task: "Сопоставить реквизиты с архивными сведениями" },
      { zone: "Зона ожидания", x: 61, y: 75, task: "Получить объяснения получателя выплаты" },
    ],
  },
  "04": {
    kind: "roadside", title: "Место остановки автомобиля", subtitle: "Дорожный участок · служебный патруль",
    locations: [
      { zone: "Место остановки", x: 50, y: 23, task: "Сопоставить обстановку и расположение участников со схемой" },
      { zone: "Патрульный автомобиль", x: 76, y: 72, task: "Осмотреть салон и изучить доступную видеозапись" },
      { zone: "Пост инспектора", x: 22, y: 68, task: "Получить объяснения инспектора о последовательности событий" },
    ],
  },
  "05": {
    kind: "agriculture", title: "Агрокомплекс", subtitle: "Производственная территория · охрана труда и оплата",
    locations: [
      { zone: "Пост охраны", x: 23, y: 61, task: "Сверить фактический график дежурств и журнал поста" },
      { zone: "Административный корпус", x: 72, y: 25, task: "Сопоставить табель, график и расчётные листки" },
      { zone: "Бытовой корпус", x: 67, y: 76, task: "Получить самостоятельные объяснения работников" },
    ],
  },
};

const chooseFallbackKind = (category: string, place: string): SceneKind => {
  const text = (category + " " + place).toLowerCase();
  if (/лес|рубк|дерев|природ|эколог|вод|сброс|берег|рек/.test(text)) return /вод|сброс|берег|рек/.test(text) ? "river" : "forest";
  if (/транспорт|станц|аэропорт|перевоз|автомоб|дорог|инспектор/.test(text)) return "roadside";
  if (/труд|работ|зарплат|вахт|смен|агрокомплекс/.test(text)) return "agriculture";
  if (/выплат|архив|реестр|сертификат|социальн/.test(text)) return "archive";
  if (/строй|ремонт|кровл|подряд|смет/.test(text)) return "construction";
  if (/учрежден|осужд|колони|медицин/.test(text)) return "facility";
  return "facility";
};

const SCENE_TITLES: Record<SceneKind, { title: string; subtitle: string }> = {
  construction: { title: "Строительная площадка", subtitle: "Участок выполнения работ" },
  forest: { title: "Лесной участок", subtitle: "Квартальная сеть и технологические проезды" },
  archive: { title: "Административный объект", subtitle: "Зона приёма и архивные помещения" },
  roadside: { title: "Дорожный участок", subtitle: "Место события и прилегающая инфраструктура" },
  agriculture: { title: "Производственная территория", subtitle: "Корпуса, посты и хозяйственная зона" },
  river: { title: "Прибрежная территория", subtitle: "Береговая линия и контрольные точки" },
  facility: { title: "Территория учреждения", subtitle: "Корпуса и контрольные зоны" },
};

const SCENE_IMAGES: Record<SceneKind, string> = {
  construction: "/manus-storage/inspection-site-construction.svg",
  forest: "/manus-storage/inspection-site-forest.svg",
  archive: "/manus-storage/inspection-site-archive.svg",
  roadside: "/manus-storage/inspection-site-roadside.svg",
  agriculture: "/manus-storage/inspection-site-agriculture.svg",
  river: "/manus-storage/inspection-site-river.svg",
  facility: "/manus-storage/inspection-site-facility.svg",
};

const getTravelMinutes = (from: PointLayout | undefined, to: PointLayout) => {
  if (!from) return 0;
  const distance = Math.hypot(from.x - to.x, from.y - to.y);
  return Math.max(5, Math.min(20, Math.round(distance * 0.18)));
};

function SceneArtwork({ kind }: { kind: SceneKind }) {
  return (
    <svg className="inspection-map-art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="field-grid" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth=".12" opacity=".35" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#field-grid)" />
      {kind === "construction" && <>
        <path d="M5 10H95V91H5Z" className="map-boundary" />
        <path d="M8 14H92V22H8Z M8 82H92V89H8Z" className="map-road" />
        <path d="M15 31L54 24L64 36L59 66L18 70Z" className="map-building" />
        <path d="M20 35L51 29L58 37L54 61L21 65Z" className="map-roof" />
        <path d="M67 29H87V53H67Z" className="map-building-alt" />
        <path d="M68 57H91V76H68Z" className="map-yard" />
        <path d="M10 75L32 75L36 82H10Z" className="map-road" />
        <text x="25" y="18" className="map-label">ЖИЛОЙ ДОМ</text><text x="69" y="26" className="map-label">СКЛАД</text>
      </>}
      {kind === "forest" && <>
        <path d="M4 10L96 4L93 94L6 90Z" className="map-boundary" />
        <path d="M-5 83Q21 55 42 63T105 25" className="map-road" />
        <path d="M4 31Q25 13 46 28T96 17 M2 48Q27 29 49 47T99 37 M0 68Q27 51 48 66T100 56" className="map-contour" />
        {[[12,22],[22,18],[40,16],[63,13],[84,17],[12,42],[31,38],[70,42],[89,48],[14,61],[34,58],[83,68],[18,82],[42,84],[88,83]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="3.4" className="map-tree"/><circle cx={x} cy={y} r="1.5" className="map-tree-core"/></g>)}
        <path d="M37 20L61 25L69 49L60 67L35 60L29 41Z" className="map-clearing" />
        <text x="39" y="16" className="map-label">КВАРТАЛ 14</text>
      </>}
      {kind === "archive" && <>
        <path d="M4 8H96V92H4Z" className="map-boundary" />
        <path d="M5 48H95 M52 8V92" className="map-road" />
        <path d="M9 14H44V42H9Z M59 13H90V39H59Z" className="map-building" />
        <path d="M12 17H41V39H12Z M62 16H87V36H62Z" className="map-building-alt" />
        <path d="M10 57H47V86H10Z" className="map-yard" />
        <path d="M58 56H91V86H58Z" className="map-building" />
        <path d="M63 61H86V81H63Z" className="map-building-alt" />
        <text x="14" y="12" className="map-label">ПРИЁМ</text><text x="63" y="11" className="map-label">АРХИВ</text>
      </>}
      {kind === "roadside" && <>
        <path d="M-5 35L105 55" className="map-highway-shadow" />
        <path d="M-5 35L105 55" className="map-highway" />
        <path d="M-5 32L105 52 M-5 38L105 58" className="map-road-edge" />
        <path d="M-5 35L105 55" className="map-road-center" />
        <path d="M7 66H37V89H7Z M66 8H94V27H66Z" className="map-yard" />
        <path d="M12 70H32V85H12Z M70 12H90V23H70Z" className="map-building" />
        <path d="M39 66L51 63L57 72L45 76Z" className="map-vehicle" />
        <path d="M69 76L82 74L86 83L73 86Z" className="map-vehicle" />
        <text x="8" y="63" className="map-label">ОСТАНОВКА</text><text x="68" y="8" className="map-label">ПАТРУЛЬ</text>
      </>}
      {kind === "agriculture" && <>
        <path d="M5 8H95V92H5Z" className="map-boundary" />
        <path d="M8 18H48V48H8Z M56 13H91V43H56Z" className="map-field" />
        {Array.from({length:7},(_,i)=><path key={i} d={`M${10+i*5} 18V48`} className="map-crop-row" />)}
        <path d="M10 56H45V84H10Z M60 52H91V88H60Z" className="map-building" />
        <path d="M15 61H40V79H15Z M65 57H86V82H65Z" className="map-building-alt" />
        <path d="M48 50L56 50L56 89L48 89Z" className="map-road" />
        <text x="14" y="14" className="map-label">ПОЛЯ</text><text x="63" y="49" className="map-label">КОМПЛЕКС</text>
      </>}
      {kind === "river" && <>
        <path d="M-5 28Q26 5 49 30T106 23L106 47Q72 53 49 44T-5 52Z" className="map-water" />
        <path d="M-5 28Q26 5 49 30T106 23 M-5 52Q25 29 49 44T106 47" className="map-water-edge" />
        <path d="M7 65H92V91H7Z" className="map-boundary" />
        <path d="M18 62L35 55L43 68L25 78Z M61 60L85 57L91 71L66 78Z" className="map-building" />
        <path d="M12 82Q38 68 58 82T96 82" className="map-road" />
        <text x="9" y="20" className="map-label">ВОДНЫЙ ОБЪЕКТ</text><text x="64" y="55" className="map-label">ВЫПУСК</text>
      </>}
      {kind === "facility" && <>
        <path d="M4 8H96V92H4Z" className="map-boundary" />
        <path d="M10 17H44V42H10Z M57 14H90V45H57Z M13 58H42V84H13Z M60 60H90V85H60Z" className="map-building" />
        <path d="M15 22H39V37H15Z M62 19H85V40H62Z M18 63H37V79H18Z M65 65H85V80H65Z" className="map-building-alt" />
        <path d="M47 8V92 M4 51H96" className="map-road" />
        <text x="13" y="13" className="map-label">КОРПУС А</text><text x="61" y="10" className="map-label">КОРПУС Б</text>
      </>}
    </svg>
  );
}

export function InspectionTacticalMap(props: Props) {
  const {
    territorialFullscreen, onBackToCabinet, caseFile, materials, visited, route, selectedPoint, reportOpen, remainingHours, canDecide,
    feedback, finished, score, totalCases, trust, rating, onSelectPoint, onInspectPoint,
    onOpenReport, onDecision, onNext, onRestart,
  } = props;
  const explicit = CASE_LAYOUTS[caseFile.id];
  const kind = explicit?.kind ?? chooseFallbackKind(caseFile.category, caseFile.place);
  const scene = SCENE_TITLES[kind];
  const layouts = explicit?.locations ?? DEFAULT_LAYOUT;
  const points = materials.map((material, index) => ({
    ...layouts[index] ?? DEFAULT_LAYOUT[index % DEFAULT_LAYOUT.length],
    label: material.label,
    text: material.text,
  }));
  const safeSelected = Math.max(0, Math.min(selectedPoint, Math.max(points.length - 1, 0)));
  const selected = points[safeSelected];
  const selectedVisited = visited.includes(safeSelected);
  const complete = points.length > 0 && points.every((_, index) => visited.includes(index));
  const lastVisited = route.length ? points[route[route.length - 1]] : undefined;
  const travelMinutes = selected && !selectedVisited ? getTravelMinutes(lastVisited, selected) : 0;
  const routePoints = route.map((index) => points[index]).filter(Boolean).map((point) => `${point.x},${point.y}`).join(" ");
  const remainingLabel = remainingHours.toLocaleString("ru-RU", { minimumFractionDigits: Number.isInteger(remainingHours) ? 0 : 1, maximumFractionDigits: 1 });
  const inspectedCount = visited.length;
  const fullscreenHeader = territorialFullscreen ? <header className="inspection-fullscreen-header"><div className="inspection-fullscreen-brand"><span className="inspection-fullscreen-mark"><ShieldCheck size={19}/></span><span><b>ВЫЕЗДНАЯ ПРОВЕРКА</b><small>{caseFile.number} · {caseFile.place}</small></span></div><div className="inspection-fullscreen-title"><span>ТЕРРИТОРИАЛЬНАЯ ПРОКУРАТУРА</span><b>{caseFile.category}</b></div><div className="inspection-fullscreen-clock"><span>ОСТАЛОСЬ</span><b>{remainingLabel} ч.</b></div><button type="button" className="inspection-back-cabinet" onClick={onBackToCabinet}><ArrowLeft size={16}/> В кабинет</button></header> : null;

  if (finished) {
    return <>{fullscreenHeader}<section className="inspection-finish"><div className="inspection-finish-mark"><ShieldCheck size={30}/></div><span>ВЫЕЗДНАЯ РАБОТА · ДЕНЬ ЗАВЕРШЁН</span><h2>{rating}</h2><p>Проверка закончена. Верных решений: <b>{score} из {totalCases}</b>. Доверие канцелярии: <b>{trust}/5</b>.</p><button type="button" onClick={onRestart}>Начать новую смену <ArrowRight size={16}/></button></section></>;
  }

  if (reportOpen) {
    return (
      <>
      {fullscreenHeader}
      <section className="inspection-report-screen">
        <header className="inspection-report-head"><div><span>ПОЛЕВОЙ ЖУРНАЛ · {caseFile.number}</span><h2>Результаты выездной проверки</h2><p>{caseFile.category} · {caseFile.place}</p></div><div className="inspection-report-stamp"><ShieldCheck size={18}/> ОСМОТР ЗАВЕРШЁН</div></header>
        <div className="inspection-report-grid">
          <div className="inspection-report-main">
            <article className="inspection-report-paper"><span className="inspection-report-kicker">УСТАНОВЛЕННЫЕ ОБСТОЯТЕЛЬСТВА</span><h3>{caseFile.category}</h3><p>{caseFile.summary}</p><div className="inspection-report-facts"><div><span>ПРОВЕРЯЕМЫЙ СУБЪЕКТ</span><b>{caseFile.person}</b></div><div><span>МЕСТО ПРОВЕРКИ</span><b>{caseFile.place}</b></div></div><div className="inspection-report-findings"><b>ЗАФИКСИРОВАННЫЕ РЕЗУЛЬТАТЫ</b>{points.map((point,index)=><div key={point.label}><span>{String(index+1).padStart(2,"0")} · {point.label}</span><p>{point.text}</p></div>)}</div><div className="inspection-report-conclusion"><span>СВОДКА ПО МАТЕРИАЛАМ</span><p>{caseFile.evidence}</p></div><small className="inspection-report-disclaimer">Игровая сводка отражает сведения сценария и не заменяет процессуальные документы, оформляемые в установленном порядке.</small></article>
          </div>
          <aside className="inspection-report-side">
            {feedback ? <div className={"inspection-decision-result " + (feedback.good ? "good" : "bad")}><span>{feedback.good ? "РЕШЕНИЕ ОБОСНОВАНО" : "РЕШЕНИЕ НЕ СООТВЕТСТВУЕТ МАТЕРИАЛАМ"}</span><h3>{feedback.good ? "Проверка завершена" : "Нужна дополнительная оценка"}</h3><p>{feedback.text}</p><button type="button" className="inspection-primary-action" onClick={onNext}>Следующее дело <ArrowRight size={16}/></button></div> : <div className="inspection-decision-panel"><span>ИТОГОВОЕ РЕШЕНИЕ</span><h3>Оцените установленные обстоятельства</h3><p>Выберите решение по результатам осмотра и собранных материалов.</p><button type="button" className="inspection-choice dismiss" disabled={!canDecide} onClick={() => onDecision("dismiss")}><X size={17}/><span><b>Отказать</b><small>Материалы не подтверждают основания</small></span></button><button type="button" className="inspection-choice prosecute" disabled={!canDecide} onClick={() => onDecision("prosecute")}><CheckCircle2 size={17}/><span><b>Направить материалы</b><small>Основания для дальнейшего реагирования</small></span></button><small className="inspection-decision-hint">{canDecide ? "Решение занимает 1 час рабочего времени." : "Сначала осмотрите все точки и убедитесь, что осталось не менее 1 часа."}</small></div>}
          </aside>
        </div>
      </section>
      </>
    );
  }

  return (
    <>
    {fullscreenHeader}
    <section className={"inspection-tactical inspection-theme-" + kind}>
      <header className="inspection-tactical-head"><div><span className="inspection-eyebrow"><Navigation size={13}/> ВЫЕЗДНАЯ ПРОВЕРКА · МАРШРУТ 02</span><h2>{caseFile.category}</h2><p>{caseFile.number} · {caseFile.place}</p></div><div className="inspection-hud"><div><span>РАБОЧЕЕ ВРЕМЯ</span><b>{remainingLabel} ч.</b></div><div><span>ТОЧКИ ОСМОТРА</span><b>{inspectedCount}/{points.length}</b></div></div></header>
      <div className="inspection-objective"><div><Flag size={16}/><span><b>ЗАДАЧА ВЫЕЗДА</b>{caseFile.summary}</span></div><div className="inspection-progress"><i style={{ width: (points.length ? inspectedCount / points.length * 100 : 0) + "%" }}/></div></div>
      <div className="inspection-tactical-grid">
        <div className="inspection-map-column">
          <div className="inspection-map-title"><div><span>СХЕМА ТЕРРИТОРИИ</span><b>{explicit?.title ?? scene.title}</b><small>{explicit?.subtitle ?? scene.subtitle}</small></div><div className="inspection-compass"><Compass size={22}/><span>СЕВЕР</span></div></div>
          <div className="inspection-map-surface">
            <img className="inspection-site-image" src={SCENE_IMAGES[kind]} alt="" aria-hidden="true" />
            <SceneArtwork kind={kind}/>
            <svg className="inspection-route-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {routePoints && <polyline points={routePoints} className="inspection-route-line"/>}
              {route.map((index,order)=>{ const point=points[index]; return point ? <g key={index}><circle cx={point.x} cy={point.y} r="2.5" className="inspection-route-stop"/><text x={point.x+3} y={point.y-3} className="inspection-route-number">{order+1}</text></g> : null; })}
            </svg>
            {points.map((point,index)=>{
              const isVisited=visited.includes(index);
              const isSelected=safeSelected===index;
              const routeOrder=route.indexOf(index);
              return <button type="button" key={point.label} className={"inspection-map-marker " + (isVisited?"visited ":"") + (isSelected?"selected ":"")} style={{left:point.x+"%",top:point.y+"%"}} onClick={()=>onSelectPoint(index)} aria-label={"Выбрать точку осмотра: "+point.label}>
                <span className="inspection-marker-number">{isVisited ? routeOrder>=0?routeOrder+1:"✓" : String(index+1).padStart(2,"0")}</span><span className="inspection-marker-label">{point.label}</span>
              </button>;
            })}
            <div className="inspection-map-scale"><span/> СХЕМА УЧАСТКА · УСЛОВНЫЕ КООРДИНАТЫ</div>
            <div className="inspection-map-legend"><span><i className="open"/> Не осмотрено</span><span><i className="done"/> Зафиксировано</span></div>
          </div>
          <div className="inspection-route-strip"><div><Route size={15}/><span>ПОСЛЕДОВАТЕЛЬНОСТЬ МАРШРУТА</span></div><div className="inspection-route-chips">{route.length ? route.map((index,order)=><button type="button" key={index} onClick={()=>onSelectPoint(index)}><b>{order+1}</b>{points[index]?.label}</button>) : <small>Маршрут ещё не начат — выберите первую точку на схеме.</small>}</div></div>
        </div>
        <aside className="inspection-point-panel">
          <div className="inspection-panel-top"><span>ОБЪЕКТ ОСМОТРА</span><b>{String(safeSelected+1).padStart(2,"0")} / {String(points.length).padStart(2,"0")}</b></div>
          {selected ? <>
            <div className="inspection-selected-point"><span className="inspection-location-tag"><MapPin size={12}/>{selected.zone}</span><h3>{selected.label}</h3><p>{selected.task}</p></div>
            {selectedVisited ? <div className="inspection-observation"><span><CheckCircle2 size={14}/> РЕЗУЛЬТАТ ОСМОТРА ЗАФИКСИРОВАН</span><p>{selected.text}</p><small>Повторный просмотр не расходует рабочее время.</small></div> : <div className="inspection-unvisited"><span>ПЕРЕД НАЧАЛОМ ОСМОТРА</span><p>Осмотрите объект и зафиксируйте сведения в полевом журнале. Порядок посещения выбираете самостоятельно.</p><ul><li>Осмотр и фиксация — 30 минут</li><li>Переезд — {travelMinutes ? travelMinutes+" минут" : "без дополнительного переезда"}</li></ul></div>}
            <button type="button" className="inspection-primary-action" disabled={selectedVisited || remainingHours < 0.5 + travelMinutes / 60} onClick={()=>onInspectPoint(safeSelected,travelMinutes)}>{selectedVisited ? "Точка уже осмотрена" : "Осмотреть объект"} <ArrowRight size={16}/></button>
          </> : <p className="inspection-empty-point">Выберите точку на карте.</p>}
          <div className="inspection-panel-footer"><div><Clock3 size={14}/><span>ОСТАЛОСЬ <b>{remainingLabel} Ч.</b></span></div><span>{inspectedCount===points.length?"ВСЕ ТОЧКИ ПРОВЕРЕНЫ":"ВЫБЕРИТЕ СЛЕДУЮЩУЮ ТОЧКУ"}</span></div>
          <button type="button" className="inspection-report-button" disabled={!complete} onClick={onOpenReport}>{complete ? "Перейти к акту проверки" : "Осмотрите все точки для завершения"} <FileText size={16}/></button>
        </aside>
      </div>
    </section>
    </>
  );
}

import { ArrowRight, CarFront, UserRound } from "lucide-react";

type Props = {
  name: string;
  dayNumber: number;
  dateLabel: string;
  clockLabel: string;
  trust: number;
  quality: number;
  reputationLabel: string;
  featureImage: string;
  inspectionAvailable: boolean;
  inspectionComplete: boolean;
  onInspections: () => void;
  onPersonnel: () => void;
};

export function TerritorialOfficeDashboard({
  name, dayNumber, dateLabel, clockLabel, trust, quality, reputationLabel,
  featureImage, inspectionAvailable, inspectionComplete, onInspections, onPersonnel,
}: Props) {
  return (
    <section className="territorial-office-dashboard" aria-label="Рабочий кабинет территориальной прокуратуры">
      <div className="territorial-dashboard-main">
        <div className="territorial-dashboard-intro">
          <span className="territorial-dashboard-kicker"><i /> РАБОЧИЙ КАБИНЕТ</span>
          <h2>Кабинет прокурора</h2>
          <p>Организация надзорной деятельности, рассмотрение обращений, проведение проверок и принятие мер прокурорского реагирования.</p>
        </div>
        <div className="territorial-dashboard-content">
          <button type="button" className={"territorial-field-feature " + (!inspectionAvailable || inspectionComplete ? "locked" : "")} style={{ backgroundImage: `linear-gradient(90deg,rgba(8,17,18,.94) 0%,rgba(8,17,18,.72) 48%,rgba(8,17,18,.12) 100%),url("${featureImage}")` }} onClick={onInspections} disabled={!inspectionAvailable || inspectionComplete}>
            <span className="territorial-field-badge"><CarFront size={14} /> ЕДИНСТВЕННЫЙ ВЫЕЗДНОЙ СЦЕНАРИЙ</span>
            <span className="territorial-field-title">Проверка<br />детской площадки</span>
            <span className="territorial-field-description">{inspectionComplete ? "Осмотр по обращению жителя улицы Пушкина завершён. Акт внесён в материалы." : inspectionAvailable ? "Обращение принято. Проведите осмотр муниципальной площадки: качели, покрытие и скамейка." : "Проверка откроется после принятия жалобы мужчины — жителя улицы Пушкина и выбора представления."}</span>
            <span className="territorial-field-action">{inspectionComplete ? "ПРОВЕРКА ЗАВЕРШЕНА" : inspectionAvailable ? "НАЧАТЬ ИЛИ ПРОДОЛЖИТЬ ОСМОТР" : "ОЖИДАНИЕ ПРИНЯТИЯ ЖАЛОБЫ"} {!inspectionComplete && inspectionAvailable && <ArrowRight size={16} />}</span>
          </button>
        </div>
      </div>
      <footer className="territorial-dashboard-footer">
        <div className="territorial-dashboard-identity">
          <span className="territorial-dashboard-avatar"><UserRound size={17}/></span>
          <span><small>ПОМОЩНИК</small><b>{name}</b></span>
        </div>
        <div className="territorial-dashboard-divider" />
        <div className="territorial-dashboard-meta"><span>СТАЖ</span><b>День {dayNumber} · {dateLabel}</b></div>
        <div className="territorial-dashboard-divider" />
        <div className="territorial-dashboard-meta"><span>РАБОЧЕЕ ВРЕМЯ</span><b>{clockLabel} <small>· до 18:00</small></b></div>
        <div className="territorial-dashboard-divider" />
        <div className="territorial-dashboard-meta"><span>ДОВЕРИЕ</span><b>{trust}/5</b></div>
        <div className="territorial-dashboard-divider" />
        <div className="territorial-dashboard-meta"><span>РЕПУТАЦИЯ</span><b>{quality}/5 · {reputationLabel}</b></div>
        <button type="button" className="territorial-dashboard-profile" onClick={onPersonnel}>ЛИЧНОЕ ДЕЛО</button>
      </footer>
    </section>
  );
}

import { BarChart3, CalendarDays, CarFront, ChevronRight, ClipboardList, FileText, FolderOpen, Home, MessageSquare, UserRound } from "lucide-react";

type Props = {
  name: string;
  dayNumber: number;
  dateLabel: string;
  clockLabel: string;
  incomingCount: number;
  trust: number;
  quality: number;
  reputationLabel: string;
  featureImage: string;
  onAppeals: () => void;
  onInspections: () => void;
  onDocuments: () => void;
  onStatistics: () => void;
  onPlanning: () => void;
  onPersonnel: () => void;
};

export function TerritorialOfficeDashboard(props: Props) {
  const {
    name, dayNumber, dateLabel, clockLabel, incomingCount, trust, quality, reputationLabel,
    featureImage, onAppeals, onInspections, onDocuments, onStatistics, onPlanning, onPersonnel,
  } = props;

  const cards = [
    { title: "Обращения граждан", description: "Заявления и жалобы на рассмотрении", count: incomingCount ? `${incomingCount} новых материалов` : "Очередь обращений", icon: MessageSquare, action: onAppeals, tone: "appeals" },
    { title: "Проверки и надзор", description: "Материалы надзорной деятельности", count: "Текущие дела", icon: ClipboardList, action: onInspections, tone: "checks" },
    { title: "Журнал обращений", description: "Регистрация и движение заявлений", count: "Карточки и статусы", icon: FolderOpen, action: onDocuments, tone: "documents" },
    { title: "Статистика и отчётность", description: "Показатели работы и состояние районов", count: "Сводные показатели", icon: BarChart3, action: onStatistics, tone: "statistics" },
    { title: "Планирование работы", description: "Задачи и загрузка на текущую смену", count: "План рабочего дня", icon: CalendarDays, action: onPlanning, tone: "planning" },
    { title: "Личное дело сотрудника", description: "Служебная история и показатели", count: "Профиль и документы", icon: UserRound, action: onPersonnel, tone: "personnel" },
  ];

  return (
    <section className="territorial-office-dashboard" aria-label="Рабочий кабинет территориальной прокуратуры">
      <div className="territorial-dashboard-main">
        <div className="territorial-dashboard-intro">
          <span className="territorial-dashboard-kicker"><i /> РАБОЧИЙ КАБИНЕТ · ТЕРРИТОРИАЛЬНАЯ ПРОКУРАТУРА</span>
          <h2>Кабинет прокурора</h2>
          <p>Организация надзорной деятельности, рассмотрение обращений, проведение проверок и принятие мер прокурорского реагирования.</p>
        </div>

        <div className="territorial-dashboard-content">
          <div className="territorial-module-grid">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <button type="button" className={`territorial-module-card territorial-module-${card.tone}`} key={card.title} onClick={card.action}>
                  <span className="territorial-module-icon"><Icon size={21} strokeWidth={1.65} /></span>
                  <span className="territorial-module-copy">
                    <b>{card.title}</b>
                    <small>{card.description}</small>
                    <em>{card.count}</em>
                  </span>
                  <ChevronRight className="territorial-module-arrow" size={17} />
                  <span className="territorial-module-index">{String(index + 1).padStart(2, "0")}</span>
                </button>
              );
            })}
          </div>

          <button type="button" className="territorial-field-feature" style={{ backgroundImage: `linear-gradient(90deg,rgba(8,17,18,.95) 0%,rgba(8,17,18,.76) 50%,rgba(8,17,18,.24) 100%),url("${featureImage}")` }} onClick={onInspections}>
            <span className="territorial-field-badge"><CarFront size={14} /> ВЫЕЗДНАЯ РАБОТА</span>
            <span className="territorial-field-title">Выездные<br />проверки</span>
            <span className="territorial-field-description">Осмотр объектов, маршрут по территории, фиксация обстоятельств и сбор материалов на месте.</span>
            <span className="territorial-field-action">ОТКРЫТЬ ТАКТИЧЕСКУЮ КАРТУ <ChevronRight size={16} /></span>
          </button>
        </div>
      </div>

      <footer className="territorial-dashboard-footer">
        <div className="territorial-dashboard-identity"><span className="territorial-dashboard-avatar"><UserRound size={18}/></span><span><small>СОТРУДНИК ПРОКУРАТУРЫ</small><b>{name}</b></span></div>
        <div className="territorial-dashboard-divider" />
        <div className="territorial-dashboard-meta"><span>СМЕНА</span><b>День {dayNumber} · {dateLabel}</b></div>
        <div className="territorial-dashboard-divider" />
        <div className="territorial-dashboard-meta"><span>РАБОЧЕЕ ВРЕМЯ</span><b>{clockLabel} <small>· до 18:00</small></b></div>
        <div className="territorial-dashboard-divider" />
        <div className="territorial-dashboard-meta"><span>ДОВЕРИЕ КАНЦЕЛЯРИИ</span><b>{trust}/5</b></div>
        <div className="territorial-dashboard-divider" />
        <div className="territorial-dashboard-meta"><span>КАЧЕСТВО НАДЗОРА</span><b>{quality}/5 · {reputationLabel}</b></div>
        <div className="territorial-dashboard-spacer" />
        <button type="button" className="territorial-dashboard-profile" onClick={onPersonnel} aria-label="Открыть личное дело"><Home size={15}/> ЛИЧНОЕ ДЕЛО</button>
      </footer>
    </section>
  );
}

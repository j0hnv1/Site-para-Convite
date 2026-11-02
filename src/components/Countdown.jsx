import { inviteConfig } from '../config/inviteConfig.js';
import { rectStyle } from '../config/layout.js';
import { zonedTimeToEpoch } from '../lib/countdown.js';
import { useCountdown } from '../hooks/useCountdown.js';

const { date, time, timeZone } = inviteConfig.countdown;
const TARGET = zonedTimeToEpoch(date, time, timeZone);
const two = (n) => String(n).padStart(2, '0');

/** Cronômetro regressivo (dias, horas, minutos, segundos). Para em 00:00:00:00. */
export default function Countdown({ rect }) {
  const { days, hours, minutes, seconds } = useCountdown(TARGET);
  const cells = [
    [two(days), days === 1 ? 'dia' : 'dias'],
    [two(hours), 'horas'],
    [two(minutes), 'min'],
    [two(seconds), 'seg'],
  ];
  return (
    <div
      className="countdown"
      style={rectStyle(rect)}
      role="timer"
      aria-label={`Contagem regressiva: ${days} dias, ${hours} horas, ${minutes} minutos e ${seconds} segundos`}
    >
      {cells.map(([value, label]) => (
        <div className="countdown__cell" key={label}>
          <span className="countdown__num">{value}</span>
          <span className="countdown__label">{label}</span>
        </div>
      ))}
    </div>
  );
}

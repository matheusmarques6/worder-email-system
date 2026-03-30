'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft | null {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownBlock({ data }: { data: Record<string, unknown> }) {
  const endDate = (data.endDate as string) ?? '';
  const style = (data.style as string) ?? 'dark';
  const labels = (data.labels as Record<string, string>) ?? {
    days: 'dias',
    hours: 'horas',
    minutes: 'minutos',
    seconds: 'segundos',
  };
  const expiredText = (data.expiredText as string) ?? 'Oferta expirada!';
  const backgroundColor = (data.backgroundColor as string) ?? (style === 'light' ? '#FFFFFF' : style === 'dark' ? '#1a1a2e' : 'transparent');
  const numberColor = (data.numberColor as string) ?? (style === 'light' ? '#333333' : style === 'dark' ? '#FFFFFF' : '#333333');
  const labelColor = (data.labelColor as string) ?? (style === 'light' ? '#666666' : style === 'dark' ? '#cccccc' : '#666666');

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    endDate ? calculateTimeLeft(endDate) : { days: 0, hours: 0, minutes: 0, seconds: 0 }
  );

  useEffect(() => {
    if (!endDate) return;
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!endDate) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300 m-4 rounded-lg">
        <Timer size={32} />
        <p className="text-sm mt-2">Contagem regressiva</p>
        <p className="text-xs">Configure a data no painel de propriedades</p>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div
        style={{
          backgroundColor,
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: numberColor, fontSize: 18, fontWeight: 'bold', margin: 0 }}>
          {expiredText}
        </p>
      </div>
    );
  }

  const boxStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 6px',
    minWidth: 60,
    padding: '10px 8px',
    borderRadius: style === 'minimal' ? 0 : 8,
    backgroundColor: style === 'minimal' ? 'transparent' : (style === 'light' ? '#f3f4f6' : '#16213e'),
  };

  const numStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 'bold',
    color: numberColor,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  };

  const lblStyle: React.CSSProperties = {
    fontSize: 11,
    color: labelColor,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const units: { key: keyof TimeLeft; label: string }[] = [
    { key: 'days', label: labels.days ?? 'dias' },
    { key: 'hours', label: labels.hours ?? 'horas' },
    { key: 'minutes', label: labels.minutes ?? 'minutos' },
    { key: 'seconds', label: labels.seconds ?? 'segundos' },
  ];

  return (
    <div
      style={{
        backgroundColor,
        padding: '20px',
        textAlign: 'center',
      }}
    >
      {units.map((unit) => (
        <div key={unit.key} style={boxStyle}>
          <span style={numStyle}>{String(timeLeft[unit.key]).padStart(2, '0')}</span>
          <span style={lblStyle}>{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

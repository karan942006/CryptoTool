import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  sublabel?: string;
  type?: 'security' | 'pqc';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 180,
  label = 'Security Score',
  sublabel,
  type = 'security'
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Use a 270-degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, score))) / 100;

  const getColor = () => {
    if (type === 'pqc') {
      if (score >= 80) return '#00f2fe'; // Cyan for high PQC readiness
      if (score >= 50) return '#38a9f7';
      return '#f59e0b';
    }
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#38a9f7'; // Blue
    if (score >= 40) return '#f59e0b'; // Amber
    return '#f43f5e'; // Rose / Red
  };

  const getStatusText = () => {
    if (type === 'pqc') {
      if (score >= 80) return 'High Readiness';
      if (score >= 50) return 'Partial / Migration Needed';
      return 'Vulnerable to CRQC';
    }
    if (score >= 80) return 'Robust / Secure';
    if (score >= 60) return 'Moderate Posture';
    if (score >= 40) return 'Legacy Identified';
    return 'Critical Risk';
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-135">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active Score Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold font-mono text-white tracking-tight">
            {score}
          </span>
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider mt-0.5">
            / 100
          </span>
          <span
            className="text-[11px] font-semibold mt-1 px-2 py-0.5 rounded-full"
            style={{ color: color, backgroundColor: `${color}15` }}
          >
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="text-center mt-2">
        <p className="text-sm font-semibold text-slate-200">{label}</p>
        {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
};

import React from "react";

function CircularTimer({ timer, maxTime = 60, size = 32, strokeWidth = 2 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timer / maxTime;
  const strokeDashoffset = circumference * (1 - progress);
  const altText = `${timer} seconds until next update`;

  return (
    <svg
      width={size}
      height={size}
      className="circular-timer"
      style={{ transform: "rotate(-90deg)", verticalAlign: "middle" }}
      title={altText}
      aria-label={altText}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#333"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#ff9517"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{
          transition: "stroke-dashoffset 1s linear",
        }}
      />
      {/* Timer text */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size / 2}
        fill="#999"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: `${size / 2}px ${size / 2}px`,
        }}
      >
        {timer}
      </text>
    </svg>
  );
}

export default CircularTimer;

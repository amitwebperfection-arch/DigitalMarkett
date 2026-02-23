function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizeMap = { sm: 40, md: 60, lg: 80 };
  const s = sizeMap[size];

  const spinner = (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner-ring { transform-origin: 50px 50px; animation: spin 1s linear infinite; }
      `}</style>
      <g className="spinner-ring">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = i * 30;
          const opacity = 0.2 + (i / 12) * 0.8;
          const rad = (angle * Math.PI) / 180;
          const x1 = 50 + 28 * Math.sin(rad);
          const y1 = 50 - 28 * Math.cos(rad);
          const x2 = 50 + 40 * Math.sin(rad);
          const y2 = 50 - 40 * Math.cos(rad);
          return (
            <line
              key={i}
              x1={x1} y1={y1}
              x2={x2} y2={y2}
              stroke="#1AADDC"
              strokeWidth="8"
              strokeLinecap="round"
              opacity={opacity}
            />
          );
        })}
      </g>
    </svg>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      {spinner}
    </div>
  );
}

export default LoadingSpinner;
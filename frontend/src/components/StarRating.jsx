import React, { useState } from 'react';

const StarRating = ({ value = 0, maxStars = 5, onChange, size = 20, readOnly = true }) => {
  const [hoverValue, setHoverValue] = useState(null);

  const handleMouseEnter = (index) => {
    if (readOnly) return;
    setHoverValue(index);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };

  const handleClick = (index) => {
    if (readOnly || !onChange) return;
    onChange(index);
  };

  const activeValue = hoverValue !== null ? hoverValue : value;

  const renderStar = (index) => {
    const starId = `star-grad-${Math.random().toString(36).substr(2, 9)}`;
    let fillPercent = 0;

    if (activeValue >= index) {
      fillPercent = 100;
    } else if (activeValue > index - 1) {
      fillPercent = (activeValue - (index - 1)) * 100;
    }

    return (
      <span
        key={index}
        className={`inline-block relative ${
          readOnly ? 'cursor-default' : 'cursor-pointer'
        }`}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(index)}
        style={{
          width: size,
          height: size,
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease',
          transform: !readOnly && hoverValue === index ? 'scale(1.25)' : 'scale(1)',
          filter: fillPercent > 0 ? 'drop-shadow(0 0 3px oklch(70% 0.2 290 / 0.4))' : 'none',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="100%"
          height="100%"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1.5"
          className="block"
        >
          <defs>
            <linearGradient id={starId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset={`${fillPercent}%`} stopColor="var(--color-accent)" />
              <stop offset={`${fillPercent}%`} stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={fillPercent > 0 ? `url(#${starId})` : 'none'}
            stroke={fillPercent > 0 ? 'var(--color-accent)' : 'var(--color-ink-2)'}
            style={{
              transition: 'fill 0.2s ease-out, stroke 0.2s ease-out'
            }}
          />
        </svg>
      </span>
    );
  };

  const starArray = [];
  for (let i = 1; i <= maxStars; i++) {
    starArray.push(renderStar(i));
  }

  return (
    <div className="inline-flex items-center gap-1" aria-label={`Rating: ${value} out of ${maxStars}`}>
      {starArray}
      {hoverValue !== null && !readOnly && (
        <span className="font-mono text-xs font-bold text-accent ml-2">{hoverValue} / 5</span>
      )}
    </div>
  );
};

export default StarRating;

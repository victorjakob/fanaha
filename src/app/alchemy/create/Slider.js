"use client";

export function Slider({ value, min, max, step, onChange }) {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
      style={{
        background: `linear-gradient(to right, #9333ea 0%, #9333ea ${
          ((value - min) / (max - min)) * 100
        }%, #3f3f46 ${((value - min) / (max - min)) * 100}%, #3f3f46 100%)`,
      }}
    />
  );
}

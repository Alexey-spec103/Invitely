"use client";

import { COLOR_SWATCHES, GRADIENT_SWATCHES, TEXTURES, backgroundFillCss } from "@/lib/backgroundFills";
import type { BackgroundFill } from "@/lib/backgroundFills";
import styles from "./BackgroundPicker.module.css";

interface BackgroundPickerProps {
  value: BackgroundFill | undefined;
  onChange: (fill: BackgroundFill | undefined) => void;
}

function isActive(value: BackgroundFill | undefined, kind: BackgroundFill["kind"], swatchValue: string): boolean {
  return value?.kind === kind && value.value === swatchValue;
}

/** dashboard-audit.md B12: the shared swatch-grid + opacity-slider control
 * behind weddingpost.ru's "Фон" panels -- colors, gradients, and textures in
 * one ~24-swatch grid, a "None" reset, a native color input standing in for
 * their "Настроить мою палитру" link (pick any custom color -- not a saved,
 * reusable palette list, a deliberate scope cut), and an opacity slider that
 * applies to whichever fill is currently selected. Used identically by
 * Canvas/Paper's LayersPanel and Site's per-section background control. */
export default function BackgroundPicker({ value, onChange }: BackgroundPickerProps) {
  const opacity = value?.opacity ?? 100;

  const applyOpacity = (next: number) => {
    if (!value) return;
    onChange({ ...value, opacity: next });
  };

  return (
    <div className={styles.picker}>
      <div className={styles.grid}>
        <button
          type="button"
          className={!value ? styles.swatchActive : styles.swatch}
          style={{ background: "#fff" }}
          onClick={() => onChange(undefined)}
          aria-label="No background fill"
          title="None"
        >
          <span className={styles.noneMark}>&times;</span>
        </button>

        {COLOR_SWATCHES.map((color) => (
          <button
            key={color}
            type="button"
            className={isActive(value, "color", color) ? styles.swatchActive : styles.swatch}
            style={{ background: color }}
            onClick={() => onChange({ kind: "color", value: color, opacity })}
            aria-label={`Color ${color}`}
            title={color}
          />
        ))}

        {GRADIENT_SWATCHES.map((gradient) => (
          <button
            key={gradient.id}
            type="button"
            className={isActive(value, "gradient", gradient.css) ? styles.swatchActive : styles.swatch}
            style={{ background: gradient.css }}
            onClick={() => onChange({ kind: "gradient", value: gradient.css, opacity })}
            aria-label={gradient.label}
            title={gradient.label}
          />
        ))}

        {Object.entries(TEXTURES).map(([id, texture]) => (
          <button
            key={id}
            type="button"
            className={isActive(value, "texture", id) ? styles.swatchActive : styles.swatch}
            style={{ background: backgroundFillCss({ kind: "texture", value: id }) }}
            onClick={() => onChange({ kind: "texture", value: id, opacity })}
            aria-label={texture.label}
            title={texture.label}
          />
        ))}

        <label className={styles.customSwatch} title="Custom color">
          <input
            type="color"
            value={value?.kind === "color" ? value.value : "#ffffff"}
            onChange={(event) => onChange({ kind: "color", value: event.target.value, opacity })}
            className={styles.customInput}
            aria-label="Pick a custom color"
          />
          <span className={styles.customLabel}>+</span>
        </label>
      </div>

      <div className={styles.opacityRow}>
        <span className={styles.opacityLabel}>Opacity</span>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          disabled={!value}
          onChange={(event) => applyOpacity(Number(event.target.value))}
          className={styles.opacitySlider}
        />
        <span className={styles.opacityValue}>{opacity}%</span>
      </div>
    </div>
  );
}

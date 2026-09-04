"use client";

import { useEffect, useRef, type CSSProperties, type FocusEvent, type MouseEvent } from "react";
import { useEditableField } from "./EditableFieldContext";
import type { TextStyleOverride } from "./EditableFieldContext";

type EditableTag = "span" | "p" | "h2" | "div";

interface EditableTextProps {
  /** Stable key identifying this field within its section's content object
   * (e.g. "names.0", "date", "title", or "events.0.title" for a repeatable
   * item) -- matches the key `styleOverrides` and the save actions use. */
  field: string;
  value: string;
  /** This field's own style override, already looked up by the caller from
   * its section's `styleOverrides` prop (e.g. `styleOverrides?.["date"]`) --
   * a normal data prop, not read from context, so it renders identically on
   * the public site (no provider) and in the dashboard editor alike. */
  style?: TextStyleOverride;
  as?: EditableTag;
  className?: string;
}

function overrideToStyle(override: TextStyleOverride | undefined): CSSProperties {
  if (!override) return {};
  return {
    fontSize: override.fontSize ? `${override.fontSize}px` : undefined,
    fontWeight: override.fontWeight,
    color: override.color,
    textAlign: override.textAlign,
    // `text-align` has no visual effect on an inline element (every variant
    // renders EditableText as a bare <span> nested in a block parent, per
    // CenteredCard/EmbedStatic) -- forcing block + full width here is what
    // actually lets the align toolbar buttons move the text, confirmed live:
    // without this the buttons toggled active state but nothing moved.
    display: override.textAlign ? "block" : undefined,
    width: override.textAlign ? "100%" : undefined,
  };
}

/** The one reusable primitive threaded into section variant components in
 * place of a raw `{value}` text node. Outside an `EditableFieldProvider`
 * (the public site, HeroVariantPicker, etc.) this renders exactly what a
 * plain text node would -- no extra DOM, no behavior change. Inside a
 * provider, it becomes click-to-select + contentEditable, matching the
 * interaction confirmed live on weddingpost.ru's own constructor. */
export default function EditableText({ field, value, style, as = "span", className }: EditableTextProps) {
  const { editable, selectedField, selectField, commitText } = useEditableField();
  const cssStyle = overrideToStyle(style);
  const nodeRef = useRef<HTMLElement | null>(null);
  const setNodeRef = (el: HTMLElement | null) => {
    nodeRef.current = el;
  };
  const wasSelected = useRef(false);

  const isSelected = editable && selectedField === field;

  // React deliberately renders no children while editing (see below) so a
  // re-render triggered by something else (another field's toolbar, an
  // autosave tick) never clobbers what the user is actively typing with the
  // stale `value` prop. But that means the *first* render of an edit session
  // needs its starting text seeded imperatively, once, with the cursor
  // placed at the end -- otherwise the field would visually go blank the
  // instant it's clicked, forcing a full retype (caught live in this
  // session's own Chrome verification, on Letter's multi-line body text).
  useEffect(() => {
    if (isSelected && !wasSelected.current && nodeRef.current) {
      nodeRef.current.textContent = value;
      const range = document.createRange();
      range.selectNodeContents(nodeRef.current);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      nodeRef.current.focus();
    }
    wasSelected.current = isSelected;
  }, [isSelected, value]);

  if (!editable) {
    switch (as) {
      case "p":
        return (
          <p className={className} style={cssStyle}>
            {value}
          </p>
        );
      case "h2":
        return (
          <h2 className={className} style={cssStyle}>
            {value}
          </h2>
        );
      case "div":
        return (
          <div className={className} style={cssStyle}>
            {value}
          </div>
        );
      default:
        return (
          <span className={className} style={cssStyle}>
            {value}
          </span>
        );
    }
  }

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    // A field that happens to sit inside a real `<label htmlFor>` (RSVP's
    // question label, associated with its answer input for a11y) would
    // otherwise have the browser forward this click as focus onto that
    // input instead of selecting this field for editing -- confirmed live,
    // this session: clicking the label text focused the input below it
    // instead of making the label itself contentEditable.
    event.preventDefault();
    selectField(field);
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (isSelected) {
      commitText(field, event.currentTarget.textContent ?? "");
    }
  };

  // A variable tag name in JSX forces TS to intersect every possible
  // intrinsic element's ref type, which doesn't typecheck -- one explicit
  // branch per tag (only 4 exist) sidesteps that without an `any` escape.
  const sharedProps = {
    "data-field": field,
    className,
    style: cssStyle,
    contentEditable: isSelected,
    suppressContentEditableWarning: true,
    onClick: handleClick,
    onBlur: handleBlur,
    children: isSelected ? undefined : value,
  };

  switch (as) {
    case "p":
      return <p ref={setNodeRef} {...sharedProps} />;
    case "h2":
      return <h2 ref={setNodeRef} {...sharedProps} />;
    case "div":
      return <div ref={setNodeRef} {...sharedProps} />;
    default:
      return <span ref={setNodeRef} {...sharedProps} />;
  }
}

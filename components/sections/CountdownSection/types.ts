export type CountdownVariant = "simple-digits" | "circular-rings" | "minimal-inline";

export interface CountdownSectionVariantProps {
  title?: string;
  eventDateTime: string;
}

export interface CountdownSectionProps extends CountdownSectionVariantProps {
  variant: CountdownVariant;
}

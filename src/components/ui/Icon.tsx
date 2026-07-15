import { CircleDot, type LucideProps } from "lucide-react";
import { ICONS } from "./iconMap";

interface IconProps extends LucideProps {
  name: string;
}

export function Icon({ name, ...props }: IconProps) {
  const Cmp = ICONS[name] ?? CircleDot;
  return <Cmp {...props} />;
}

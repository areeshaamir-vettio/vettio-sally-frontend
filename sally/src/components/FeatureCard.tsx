import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: "primary" | "success" | "automation";
}

const iconColorClasses: Record<FeatureCardProps["iconColor"], string> = {
  primary: "text-primary",
  success: "text-green-500",
  automation: "text-purple-500",
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor,
}: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-md hover:shadow-lg transition-shadow text-center">
      <div className="flex justify-center mb-6">
        <Icon className={`w-12 h-12 ${iconColorClasses[iconColor]}`} />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard = ({ icon: Icon, title, description, className = "" }: FeatureCardProps) => {
  return (
    <div className={`
      group p-6 rounded-2xl bg-white border border-border 
      hover:shadow-card hover:border-primary/20 
      transition-all duration-300 hover:-translate-y-1
      ${className}
    `}>
      <div className="mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary-lighter flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
          <Icon className="h-6 w-6 text-primary group-hover:text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
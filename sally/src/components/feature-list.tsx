// components/feature-list.tsx
import { Check } from 'lucide-react';

const features = [
  'Reads 1000 CVs in seconds',
  'Interviews candidates for you', 
  'Keeps hiring fair and bias-free',
  'Helps you hire with confidence'
];

export function FeatureList() {
  return (
    <div className="space-y-6">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-[#8952E0] rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
          <span className="text-[#2C2B2A] text-sm leading-6">{feature}</span>
        </div>
      ))}
    </div>
  );
}

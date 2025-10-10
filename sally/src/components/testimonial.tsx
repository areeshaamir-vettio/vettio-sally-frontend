// components/testimonial.tsx
import { Star } from 'lucide-react';

export function Testimonial() {
  return (
    <div className="space-y-6">
      <hr className="border-[#4D4B4A]" />
      <div className="space-y-4">
        <blockquote className="text-[#2C2B2A] italic text-sm leading-6">
          &quot;No wasted time, my Fully Autonomous AI agent does the heavy lifting so I can focus on decisions.&quot;
        </blockquote>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 fill-[#8952E0] text-[#8952E0]" />
          ))}
        </div>
      </div>
    </div>
  );
}

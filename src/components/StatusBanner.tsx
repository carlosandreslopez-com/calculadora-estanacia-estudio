import React from 'react';
import { CheckIcon, XIcon, AlertTriangleIcon } from './IconComponents.tsx';

export type BannerVariant = 'incomplete' | 'error' | 'success';

interface StatusBannerProps {
  variant: BannerVariant;
  title: string;
  text: string;
}

const VARIANT_STYLES: Record<BannerVariant, {
  box: string;
  icon: string;
  title: string;
  Icon: React.FC<{ className?: string }>;
}> = {
  incomplete: {
    box: 'bg-warn-bg border-[#e1dccd]',
    icon: 'bg-[#ece2c6] text-warn-accent',
    title: 'text-warn-ink',
    Icon: AlertTriangleIcon,
  },
  error: {
    box: 'bg-error-bg border-error-border',
    icon: 'bg-[#f1d6d2] text-error',
    title: 'text-error-ink',
    Icon: XIcon,
  },
  success: {
    box: 'bg-success-bg border-success-border',
    icon: 'bg-[#d6ecdd] text-success',
    title: 'text-success-ink',
    Icon: CheckIcon,
  },
};

export const StatusBanner: React.FC<StatusBannerProps> = ({ variant, title, text }) => {
  const s = VARIANT_STYLES[variant];
  return (
    <div aria-live="polite" className={`rounded-[14px] px-5 py-[18px] mb-[22px] border ${s.box}`}>
      <div className="flex items-start gap-[13px]">
        <span className={`flex-shrink-0 w-[26px] h-[26px] rounded-full flex items-center justify-center ${s.icon}`}>
          <s.Icon className="w-3.5 h-3.5" />
        </span>
        <div>
          <div className={`font-bold text-[15.5px] mb-[3px] ${s.title}`}>{title}</div>
          <div className="text-sm leading-[1.55] text-[#5a6072]">{text}</div>
        </div>
      </div>
    </div>
  );
};

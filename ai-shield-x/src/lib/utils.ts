import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ATTEMPT_TYPES = [
  'Prompt Injection', 'Data Poisoning', 'Model Inversion', 
  'DDoS Attack', 'Adversarial Evasion', 'Credential Stuffing',
  'API Abuse', 'Membership Inference', 'Backdoor Trigger'
];

export const SEVERITIES = {
  CRITICAL: 'text-red-500 border-red-500/50 bg-red-500/10',
  HIGH: 'text-orange-500 border-orange-500/50 bg-orange-500/10',
  MEDIUM: 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10',
  LOW: 'text-blue-500 border-blue-500/50 bg-blue-500/10',
  INFO: 'text-slate-400 border-slate-500/50 bg-slate-500/10',
};

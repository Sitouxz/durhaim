'use client';

import { useCommerce } from '@/components/CommerceProvider';

type LocalizedTextProps = {
  en: string;
  id: string;
  uppercase?: boolean;
};

export default function LocalizedText({ en, id, uppercase = false }: LocalizedTextProps) {
  const { language } = useCommerce();
  const text = language === 'id' ? id : en;
  return <>{uppercase ? text.toUpperCase() : text}</>;
}

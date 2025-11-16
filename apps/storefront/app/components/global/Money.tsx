import React from 'react';

interface MoneyProps {
  amount: number;
  currency?: string;
  locale?: string;
  className?: string;
}

/**
 * Money component for formatting Vietnamese Dong (VND) or other currencies
 * Replaces Shopify's Money component
 */
export function Money({
  amount,
  currency = 'VND',
  locale = 'vi-VN',
  className,
}: MoneyProps) {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return <span className={className}>{formatted}</span>;
}

/**
 * Simple number formatter for VND without currency symbol
 */
export function MoneyNumber({
  amount,
  locale = 'vi-VN',
  className,
}: Omit<MoneyProps, 'currency'>) {
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return <span className={className}>{formatted} ₫</span>;
}

/**
 * Compact money formatter (e.g., 1.5M for 1,500,000)
 */
export function MoneyCompact({
  amount,
  locale = 'vi-VN',
  className,
}: Omit<MoneyProps, 'currency'>) {
  const formatted = new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount);

  return <span className={className}>{formatted} ₫</span>;
}

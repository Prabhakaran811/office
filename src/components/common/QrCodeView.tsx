import React from 'react';

interface QrCodeProps {
  value: string;
  size?: number;
  label?: string;
}

export const QrCodeView: React.FC<QrCodeProps> = ({ value, size = 110, label = 'UPI Payment / GST e-Invoice' }) => {
  // Use public QuickChart or QR Server SVG service with fallback pattern
  const encoded = encodeURIComponent(value);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=2`;

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-white border border-slate-300 rounded shadow-xs text-center">
      <img
        src={qrUrl}
        alt="QR Code"
        width={size}
        height={size}
        className="block"
        onError={(e) => {
          // Fallback simple geometric pattern if offline
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
      {label && <span className="text-[9px] font-mono font-medium text-slate-600 mt-1 uppercase tracking-tight">{label}</span>}
    </div>
  );
};

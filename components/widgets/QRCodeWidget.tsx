import React from 'react';
import { QrCode } from 'lucide-react';

const QRCodeWidget = ({ widget, updateData }) => {
    const { url = '' } = widget.data;
    return (
        <div className="h-full flex flex-col p-4 bg-white relative group">
            <h3 className="text-center font-bold text-slate-700 mb-2 flex items-center justify-center gap-2"><QrCode size={16} /> QR Code</h3>
            <input
                className="w-full border rounded p-2 mb-2 text-xs"
                placeholder="https://..."
                value={url}
                onChange={(e) => updateData(widget.id, { url: e.target.value })}
            />
            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg p-4 overflow-hidden">
                {url ? (
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`} alt="QR Code" className="w-full h-full object-contain mix-blend-multiply" />
                ) : (
                    <div className="text-gray-400 text-[10px] text-center italic">Paste a URL above</div>
                )}
            </div>
        </div>
    );
};

export default QRCodeWidget;

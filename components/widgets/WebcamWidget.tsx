import React, { useEffect, useRef } from 'react';
import { Camera, CameraOff, FlipHorizontal } from 'lucide-react';
import { WidgetProps } from '../../types';

const WebcamWidget: React.FC<WidgetProps> = ({ widget, updateData }) => {
  const { isMirrored = true, isActive = true } = widget.data;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      if (isActive) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (e) {
          console.error("Camera error", e);
          updateData(widget.id, { isActive: false });
        }
      } else {
        stopCamera();
      }
    };

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isActive, widget.id, updateData]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="w-full h-full bg-black relative flex flex-col group overflow-hidden select-none">
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
        {isActive ? 
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover pointer-events-none ${isMirrored ? 'scale-x-[-1]' : ''}`} 
            /> 
            : <div className="text-white/50 text-center flex flex-col items-center">
                <CameraOff size={48} className="mb-2 opacity-50"/>
                <span className="text-sm font-medium">Camera Off</span>
              </div>
        }
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/50 to-transparent pb-4 pt-8">
        <button 
            onClick={() => updateData(widget.id, { isActive: !isActive })} 
            className="p-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full text-white transition-all"
            title={isActive ? "Turn Off" : "Turn On"}
        >
            {isActive ? <CameraOff size={20}/> : <Camera size={20}/>}
        </button>
        {isActive && (
            <button 
                onClick={() => updateData(widget.id, { isMirrored: !isMirrored })} 
                className="p-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full text-white transition-all"
                title="Mirror Video"
            >
                <FlipHorizontal size={20}/>
            </button>
        )}
      </div>
    </div>
  );
};

export default WebcamWidget;
import React from 'react';
import { Shuffle, Camera } from 'lucide-react';
import TimerWidget from '../widgets/TimerWidget';
import DiceWidget from '../widgets/DiceWidget';
import SeatPickerWidget from '../widgets/SeatPickerWidget';
import GroupMakerWidget from '../widgets/GroupMakerWidget';
import TextWidget from '../widgets/TextWidget';
import TrafficLightWidget from '../widgets/TrafficLightWidget';
import VoteWidget from '../widgets/VoteWidget';
import WhiteboardWidget from '../widgets/WhiteboardWidget';
import ScheduleWidget from '../widgets/ScheduleWidget';
import QRCodeWidget from '../widgets/QRCodeWidget';
import EmbedWidget from '../widgets/EmbedWidget';
import CalculatorWidget from '../widgets/CalculatorWidget';
import CountdownWidget from '../widgets/CountdownWidget';
import SoundboardWidget from '../widgets/SoundboardWidget';
import PolypadWidget from '../widgets/PolypadWidget';
import CalendarWidget from '../widgets/CalendarWidget';

const WIDGET_COMPONENTS: Record<string, any> = {
    TIMER: TimerWidget,
    DICE: DiceWidget,
    SEAT_PICKER: SeatPickerWidget,
    GROUP_MAKER: GroupMakerWidget,
    TEXT: TextWidget,
    TRAFFIC: TrafficLightWidget,
    VOTE: VoteWidget,
    WHITEBOARD: WhiteboardWidget,
    SCHEDULE: ScheduleWidget,
    QR: QRCodeWidget,
    EMBED: EmbedWidget,
    CALCULATOR: CalculatorWidget,
    COUNTDOWN: CountdownWidget,
    SOUNDBOARD: SoundboardWidget,
    POLYPAD: PolypadWidget,
    CALENDAR: CalendarWidget
};

interface SlidePreviewProps {
    widgets: any[];
    background: any;
    scale?: number;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ widgets, background, scale = 0.15 }) => {
    // Determine background style
    const bgStyle = background?.type === 'image'
        ? { backgroundImage: `url(${background.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    const bgClass = background?.type === 'preset' ? background.preview : '';

    return (
        <div
            className="relative overflow-hidden shadow-inner border border-slate-200/50"
            style={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '8px',
                background: background?.type === 'image' ? 'none' : undefined
            }}
        >
            {/* The scaled "Canvas" */}
            <div
                className={`absolute inset-0 origin-top-left ${bgClass}`}
                style={{
                    width: `${100 / scale}%`,
                    height: `${100 / scale}%`,
                    transform: `scale(${scale})`,
                    ...bgStyle
                }}
            >
                {widgets.map((w: any) => {
                    const WidgetComp = WIDGET_COMPONENTS[w.type];

                    return (
                        <div
                            key={w.id}
                            className="absolute overflow-hidden rounded-xl border-2 border-slate-100 shadow-xl bg-white"
                            style={{
                                left: w.x ?? w.position?.x,
                                top: w.y ?? w.position?.y,
                                width: w.width ?? w.size?.width,
                                height: w.height ?? w.size?.height,
                                zIndex: w.zIndex || 1
                            }}
                        >
                            {WidgetComp ? (
                                <WidgetComp
                                    widget={w}
                                    updateData={() => { }}
                                    isPreview={true}
                                />
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
                                    {w.type === 'RANDOMIZER' && (
                                        <>
                                            <Shuffle size={32} className="text-indigo-400 mb-1" />
                                            <div className="text-xl font-black text-indigo-600 truncate w-full">{w.data?.student || 'Ready?'}</div>
                                        </>
                                    )}
                                    {w.type === 'WEBCAM' && (
                                        <div className="h-full w-full bg-black flex items-center justify-center rounded-lg">
                                            <Camera size={32} className="text-white opacity-20" />
                                        </div>
                                    )}
                                    {!['RANDOMIZER', 'WEBCAM'].includes(w.type) && (
                                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{w.type}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SlidePreview;

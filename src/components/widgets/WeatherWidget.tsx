import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Wind, Droplets, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Thermometer, X, RefreshCw, Navigation, Settings as SettingsIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { WidgetProps } from '../../types';

// --- Weather Icons Mapping ---
const WeatherIcons: Record<string, any> = {
    'Clear': <Sun className="text-amber-400" />,
    'Clouds': <Cloud className="text-slate-400" />,
    'Rain': <CloudRain className="text-blue-400" />,
    'Snow': <CloudSnow className="text-sky-200" />,
    'Thunderstorm': <CloudLightning className="text-purple-400" />,
    'Drizzle': <Droplets className="text-cyan-400" />,
    'Mist': <Wind className="text-slate-300" />,
};

// --- Dynamic Backgrounds ---
const WeatherGradients: Record<string, string> = {
    'Clear': 'from-sky-400 to-amber-200',
    'Clouds': 'from-slate-400 to-blue-200',
    'Rain': 'from-blue-600 to-slate-400',
    'Snow': 'from-sky-100 to-indigo-200',
    'Thunderstorm': 'from-purple-800 to-slate-900',
    'Drizzle': 'from-cyan-500 to-blue-300',
    'Mist': 'from-slate-300 to-slate-100',
};

const WeatherWidget: React.FC<WidgetProps> = ({ widget, updateData }) => {
    const data = widget.data || {};
    const city = data.city || 'London';
    const windUnit = data.windUnit || 'km/h';
    const forecastDays = data.forecastDays || 1;
    const forecast = data.forecast || [];
    const weather = data.weather || {
        temp: 22,
        condition: 'Clear',
        humidity: 45,
        wind: 12,
        high: 25,
        low: 18,
        description: 'Sunny intervals'
    };
    
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    // Mock Fetch (In a real app, you'd use OpenWeatherMap or similar)
    const fetchWeather = useCallback(async (query: string) => {
        setLoading(true);
        setError(null);
        try {
            // Simulated API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Generate some plausible mock data based on the string name
            const seed = query.length;
            const conditions = ['Clear', 'Clouds', 'Rain', 'Thunderstorm', 'Drizzle', 'Mist'];
            const condition = conditions[seed % conditions.length];
            const tempBase = (seed * 5) % 35;
            
            const newWeather = {
                temp: tempBase,
                condition,
                humidity: 40 + (seed * 3) % 40,
                wind: 5 + seed % 20,
                high: tempBase + 3,
                low: tempBase - 4,
                description: `Partly ${condition.toLowerCase()}`
            };

            const forecast = Array.from({ length: 3 }).map((_, i) => ({
                day: ['Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat'][i],
                temp: tempBase + (i * 2) - 3,
                condition: conditions[(seed + i + 1) % conditions.length]
            }));

            updateData(widget.id, { 
                city: query.toUpperCase(), 
                weather: newWeather,
                forecast
            });
            setSearchTerm('');
        } catch (e) {
            setError('City not found');
        } finally {
            setLoading(false);
        }
    }, [widget.id, updateData]);

    const getUserLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                () => fetchWeather('My Location'),
                () => setError('Location denied')
            );
        }
    };

    const convertTemp = (temp: number) => {
        const u = data.unit || 'C';
        if (u === 'F') return Math.round((temp * 9/5) + 32);
        return Math.round(temp);
    };

    const convertWind = (speed: number) => {
        if (windUnit === 'mph') return Math.round(speed * 0.621371);
        return Math.round(speed);
    };

    const currentGradient = WeatherGradients[weather.condition] || WeatherGradients['Clear'];

    return (
        <div className={`h-full flex flex-col bg-gradient-to-br ${currentGradient} rounded-3xl p-6 relative overflow-hidden select-none no-drag text-white`}>
            {/* Background Animations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white rounded-full blur-3xl opacity-50" />
            </div>

            {/* Header: Search & Location */}
            <div className="relative z-10 flex gap-2 mb-6 group">
                <div className="flex-1 relative">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchTerm && fetchWeather(searchTerm)}
                        placeholder="Search city..."
                        className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-4 py-2 text-sm placeholder-white/60 outline-none focus:bg-white/30 transition-all font-bold"
                    />
                    <button 
                        onClick={() => searchTerm && fetchWeather(searchTerm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    >
                        {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                </div>
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 backdrop-blur-md border border-white/30 rounded-2xl transition-all shadow-sm ${showSettings ? 'bg-white text-indigo-600' : 'bg-white/20 text-white/60 hover:text-white'}`}
                    title="Weather Settings"
                >
                    <SettingsIcon size={18} />
                </button>
            </div>

            {/* Settings Overlay */}
            {showSettings && (
                <div className="absolute inset-x-6 top-24 bottom-6 bg-white/10 backdrop-blur-xl rounded-3xl z-50 border border-white/20 p-4 animate-in zoom-in-95 duration-200 flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Settings</h3>
                        <button onClick={() => setShowSettings(false)} className="hover:rotate-90 transition-transform">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase">Temp Unit</span>
                            <div className="flex bg-white/10 rounded-lg p-0.5">
                                <button 
                                    onClick={() => updateData(widget.id, { unit: 'C' })}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${(data.unit || 'C') === 'C' ? 'bg-white text-indigo-600' : 'opacity-40'}`}
                                >C</button>
                                <button 
                                    onClick={() => updateData(widget.id, { unit: 'F' })}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${(data.unit || 'C') === 'F' ? 'bg-white text-indigo-600' : 'opacity-40'}`}
                                >F</button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase">Wind Unit</span>
                            <div className="flex bg-white/10 rounded-lg p-0.5">
                                <button 
                                    onClick={() => updateData(widget.id, { windUnit: 'km/h' })}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${windUnit === 'km/h' ? 'bg-white text-indigo-600' : 'opacity-40'}`}
                                >KM/H</button>
                                <button 
                                    onClick={() => updateData(widget.id, { windUnit: 'mph' })}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${windUnit === 'mph' ? 'bg-white text-indigo-600' : 'opacity-40'}`}
                                >MPH</button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase">Forecast</span>
                            <div className="flex bg-white/10 rounded-lg p-0.5">
                                <button 
                                    onClick={() => updateData(widget.id, { forecastDays: 1 })}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${forecastDays === 1 ? 'bg-white text-indigo-600' : 'opacity-40'}`}
                                >1 DAY</button>
                                <button 
                                    onClick={() => updateData(widget.id, { forecastDays: 3 })}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${forecastDays === 3 ? 'bg-white text-indigo-600' : 'opacity-40'}`}
                                >3 DAY</button>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowSettings(false)}
                        className="mt-auto w-full py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all"
                    >Save & Close</button>
                </div>
            )}

            {/* Main Weather Display */}
            {error ? (
                <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <X size={48} className="text-white/40 mb-2" />
                    <p className="font-bold uppercase text-[10px] tracking-widest">{error}</p>
                    <button onClick={() => setError(null)} className="mt-4 text-[10px] font-black underline">Try Again</button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-between z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <MapPin size={14} className="text-white/60" />
                            <h2 className="text-lg font-black uppercase tracking-widest leading-none mt-1">{city}</h2>
                        </div>
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{weather.description}</p>
                    </div>

                    <div className="flex items-center gap-4 py-4">
                        <div className="scale-[2.5] drop-shadow-lg">
                            {WeatherIcons[weather.condition] || <Sun />}
                        </div>
                        <div className="flex flex-col">
                            <div className="text-7xl font-black drop-shadow-md tracking-tighter flex items-start">
                                {convertTemp(weather.temp)}
                                <span className="text-3xl mt-2 opacity-50">°</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Stats or Forecast */}
                    {forecastDays === 1 ? (
                        <div className="w-full grid grid-cols-3 gap-2 bg-black/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 shadow-inner">
                            <div className="flex flex-col items-center gap-1 border-r border-white/10">
                                <Droplets size={12} className="text-white/40" />
                                <span className="text-[10px] font-bold">{weather.humidity}%</span>
                                <span className="text-[8px] font-bold uppercase opacity-40">Humidity</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 border-r border-white/10">
                                <Wind size={12} className="text-white/40" />
                                <span className="text-[10px] font-bold">{convertWind(weather.wind)} <span className="text-[8px] opacity-60">{windUnit}</span></span>
                                <span className="text-[8px] font-bold uppercase opacity-40">Wind</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Thermometer size={12} className="text-white/40" />
                                <span className="text-[10px] font-bold">{convertTemp(weather.high)}° / {convertTemp(weather.low)}°</span>
                                <span className="text-[8px] font-bold uppercase opacity-40">Range</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full grid grid-cols-3 gap-2 py-1">
                            {forecast.slice(0, 3).map((f: any, i: number) => (
                                <div key={i} className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/10">
                                    <span className="text-[8px] font-black uppercase opacity-60 mb-1">{f.day}</span>
                                    <div className="scale-75 mb-1">
                                        {WeatherIcons[f.condition] || <Sun />}
                                    </div>
                                    <span className="text-xs font-black">{convertTemp(f.temp)}°</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WeatherWidget;

import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Plane, 
  Utensils, 
  Home, 
  Camera, 
  Coffee, 
  Map as MapIcon, 
  ExternalLink 
} from 'lucide-react';

/**
 * 제주도 여행 일정을 지도로 시각화하는 메인 컴포넌트입니다.
 * 3월 28일 ~ 31일의 일정이 반영되어 있습니다.
 */
const App = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [cssLoaded, setCssLoaded] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  const getNaverMapLink = (place: string) => {
    return `https://map.naver.com/v5/search/${encodeURIComponent(place)}`;
  };

  const itinerary = [
    {
      date: '3월 28일',
      title: '제주 여행의 시작',
      color: '#3b82f6',
      items: [
        { time: '14:35', place: '제주국제공항', lat: 33.5113, lng: 126.4930, icon: <Plane size={14} /> },
        { time: '16:00', place: '제주명품렌터카', lat: 33.4975, lng: 126.4735, icon: <MapPin size={14} /> },
        { time: '16:30', place: '왕고모네국수', lat: 33.5350, lng: 126.6350, icon: <Utensils size={14} /> },
        { time: '19:00', place: '더포그레이스리조트', lat: 33.4750, lng: 126.9230, icon: <Home size={14} /> },
        { time: '20:00', place: '느랑', lat: 33.4513, lng: 126.9179, icon: <Utensils size={14} /> },
      ]
    },
    {
      date: '3월 29일',
      title: '동부 성산/구좌 탐방',
      color: '#10b981',
      items: [
        { time: '09:00', place: '한국폴로클럽', lat: 33.4350, lng: 126.7845, icon: <Camera size={14} /> },
        { time: '12:00', place: '맛나식당', lat: 33.4470, lng: 126.9150, icon: <Utensils size={14} /> },
        { time: '14:00', place: '애니네 빈티지', lat: 33.5280, lng: 126.8830, icon: <Camera size={14} /> },
        { time: '15:00', place: '마이피기팬트리', lat: 33.5230, lng: 126.8950, icon: <Camera size={14} /> },
        { time: '16:00', place: '카페 (미정)', lat: 33.5250, lng: 126.8550, icon: <Coffee size={14} /> },
        { time: '19:00', place: '귤이랑 저녁 (세화)', lat: 33.5240, lng: 126.8560, icon: <Utensils size={14} /> },
        { time: '21:00', place: '더포그레이스리조트', lat: 33.4750, lng: 126.9230, icon: <Home size={14} /> },
      ]
    },
    {
      date: '3월 30일',
      title: '서남부 경유 및 금능 이동',
      color: '#f59e0b',
      items: [
        { time: '11:00', place: '산방산유채꽃명소', lat: 33.2420, lng: 126.3120, icon: <Camera size={14} /> },
        { time: '13:00', place: '상원가든', lat: 33.2250, lng: 126.2650, icon: <Utensils size={14} /> },
        { time: '15:00', place: '위이 카페', lat: 33.2850, lng: 126.3350, icon: <Coffee size={14} /> },
        { time: '19:00', place: '뼈대감 본점', lat: 33.4120, lng: 126.2650, icon: <Utensils size={14} /> },
        { time: '21:00', place: '금능여관', lat: 33.3905, lng: 126.2285, icon: <Home size={14} /> },
      ]
    },
    {
      date: '3월 31일',
      title: '마지막 식사 및 복귀',
      color: '#ef4444',
      items: [
        { time: '07:30', place: '금능여관 출발', lat: 33.3905, lng: 126.2285, icon: <Home size={14} /> },
        { time: '08:30', place: '산지해장국 노형직영점', lat: 33.4842, lng: 126.4800, icon: <Utensils size={14} /> },
        { time: '10:00', place: '제주명품렌터카', lat: 33.4975, lng: 126.4735, icon: <MapPin size={14} /> },
        { time: '12:20', place: '제주공항', lat: 33.5113, lng: 126.4930, icon: <Plane size={14} /> },
      ]
    }
  ];

  useEffect(() => {
    let isMounted = true;
    const loadDependencies = () => {
      if (!document.getElementById('tailwind-script')) {
        const script = document.createElement('script');
        script.id = 'tailwind-script';
        script.src = 'https://cdn.tailwindcss.com';
        script.onload = () => { if (isMounted) setCssLoaded(true); };
        document.head.appendChild(script);
      } else { setCssLoaded(true); }

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css'; link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.crossOrigin = 'anonymous'; 
        script.onload = () => { if (isMounted) setMapLoaded(true); };
        document.head.appendChild(script);
      } else if ((window as any).L) { setMapLoaded(true); }
    };
    loadDependencies();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !cssLoaded || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    const L = (window as any).L;
    const map = L.map(mapRef.current, { zoomControl: false }).setView([33.38, 126.55], 10);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    layerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, [mapLoaded, cssLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    const currentDay = itinerary[selectedDay];
    const points = currentDay.items.map(item => [item.lat, item.lng]);

    if (points.length > 1) {
      (window as any).L.polyline(points, { color: currentDay.color, weight: 4, dashArray: '8, 8', opacity: 0.8 }).addTo(layerGroup);
    }

    currentDay.items.forEach((item, idx) => {
      const iconHtml = `<div style="background-color: ${currentDay.color}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); transform: translate(-50%, -50%);">${idx + 1}</div>`;
      const icon = (window as any).L.divIcon({ html: iconHtml, className: '', iconSize: [0, 0] });
      (window as any).L.marker([item.lat, item.lng], { icon }).bindTooltip(item.place, { permanent: true, direction: 'right', offset: [15, 0], className: 'custom-map-tooltip' }).addTo(layerGroup);
    });

    if (points.length > 0) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          const mapInst = mapInstanceRef.current;
          mapInst.invalidateSize(true);
          const size = mapInst.getSize();
          const bounds = (window as any).L.latLngBounds(points);
          if (bounds.isValid() && size.x > 0 && size.y > 0) {
            const safePadding = Math.min(size.x, size.y) > 120 ? 40 : 5;
            mapInst.flyToBounds(bounds, { padding: [safePadding, safePadding], duration: 1.2, maxZoom: 14 });
          }
        }
      }, 250);
    }
  }, [mapLoaded, selectedDay]);

  const currentDay = itinerary[selectedDay];
  if (!cssLoaded) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">지도를 그리는 중...</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <style>{`
        .custom-map-tooltip { background: rgba(255, 255, 255, 0.9); border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); font-weight: 800; color: #1e293b; padding: 4px 8px; font-size: 12px; }
        .custom-map-tooltip::before { display: none; }
        .leaflet-container { font-family: inherit; z-index: 10; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <header className="px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-white shadow-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2.5 rounded-xl text-white"><MapIcon size={20} /></div>
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Jeju Live Route</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Vercel Deployment Ready</p>
          </div>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto w-full md:w-auto hide-scrollbar">
          {itinerary.map((_, idx) => (
            <button key={idx} onClick={() => setSelectedDay(idx)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedDay === idx ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500'}`}>DAY {idx + 1}</button>
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="w-full md:flex-[2] relative bg-slate-200 z-10 shrink-0" style={{ minHeight: '45vh' }}>
          <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />
          <div className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-100 z-[400] pointer-events-none">
            <h3 className="font-black text-slate-900 text-xs truncate">{currentDay.title}</h3>
          </div>
        </div>

        <div className="flex-1 w-full bg-white border-t md:border-t-0 md:border-l border-slate-200 overflow-y-auto z-20 relative shadow-[-10px_0_20px_rgba(0,0,0,0.03)] pb-10">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="text-slate-400" size={24} />
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{currentDay.date}</h2>
            </div>

            <div className="space-y-6 relative">
              <div className="absolute left-[23px] top-6 bottom-6 w-1 bg-slate-100 rounded-full" />
              {currentDay.items.map((item, idx) => (
                <div key={idx} className="relative pl-14 group transition-all duration-300 hover:translate-x-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10" style={{ backgroundColor: currentDay.color }} />
                  <div onClick={() => window.open(getNaverMapLink(item.place), '_blank')} className="p-5 rounded-2xl border-2 border-transparent bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-md cursor-pointer group/card" >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 rounded-md bg-white text-[10px] font-black text-slate-400 border border-slate-200 flex items-center gap-1 shadow-sm">
                        <Clock size={10} /> {item.time}
                      </span>
                      <ExternalLink size={12} className="text-slate-300 group-hover/card:text-blue-500 transition-colors" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm text-slate-600 shrink-0">{item.icon}</div>
                      <div className="overflow-hidden">
                        <h4 className="font-black text-sm md:text-base text-slate-800 mb-1 truncate group-hover/card:text-blue-600 transition-colors">{item.place}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">네이버 지도로 확인</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex gap-3">
              <button disabled={selectedDay === 0} onClick={() => setSelectedDay(prev => prev - 1)} className="flex-1 py-4 rounded-xl border-2 border-slate-100 font-black text-slate-400 text-xs hover:bg-slate-50 disabled:opacity-20 transition-all flex items-center justify-center gap-2">
                <ChevronLeft size={16} /> 이전
              </button>
              <button disabled={selectedDay === itinerary.length - 1} onClick={() => setSelectedDay(prev => prev + 1)} className="flex-[2] py-4 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 disabled:opacity-20 transition-all shadow-lg flex items-center justify-center gap-2">
                다음 날짜 <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- 화면에 그리는 코드 (React 18 표준 방식) ---
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

export default App;

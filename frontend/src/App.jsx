import React, { useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';
import { Package, LayoutDashboard, RotateCcw, QrCode } from 'lucide-react';
import axios from 'axios';
import gsap from 'gsap';

// Import Components ของคุณ
import StaffScanner from './components/StaffScanner';
import Rack from './components/Rack';
import SceneManager from './components/SceneManager';

function App() {
  const [user, setUser] = useState(null);
  const [racks, setRacks] = useState([]);
  const [viewMode, setViewMode] = useState('overview');
  const [selectedRack, setSelectedRack] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [managerSearch, setManagerSearch] = useState("");

  // ดึงข้อมูลจาก Backend
  useEffect(() => {
    axios.get('http://localhost:5000/api/racks')
      .then(res => setRacks(res.data))
      .catch(err => console.error("โหลดข้อมูลไม่สำเร็จ", err));
  }, []);

  const getRackPosition = (id) => {
    switch (id) {
      case 'A1': return [-3, 0, 3];
      case 'A2': return [-3, 0, -3];
      case 'B1': return [3, 0, 3];
      case 'B2': return [3, 0, -3];
      default: return [0, 0, 0];
    }
  };

  const handleManagerSearch = (manualTerm = null) => {
    const searchTerm = (manualTerm || managerSearch || "").trim();
    if (!searchTerm) return;

    for (const rack of racks) {
      const slotIdx = rack.slots.findIndex(s => s.item === searchTerm);
      if (slotIdx !== -1) {
        setViewMode('focus');
        setSelectedRack(rack);
        setSelectedSlot({ ...rack.slots[slotIdx], rackId: rack.id, index: slotIdx });
        return;
      }
    }
    alert(`ไม่พบสินค้า "${searchTerm}" ในระบบ`);
  };

  // 1. หน้า Login
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-sans p-4">
        <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700 text-center animate-in fade-in zoom-in duration-500">
          <Package size={64} className="text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-2 italic tracking-tighter uppercase">Warehouse Demo</h2>
          <button
            onClick={() => setUser({ name: 'Staff', role: 'staff' })}
            className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl transition-all font-bold flex items-center justify-center gap-3"
          >
            <QrCode size={20} /> เข้าสู่ระบบ STAFF
          </button>
        </div>
      </div>
    );
  }

  // 2. หน้า Main Demo (จัด Layout 1:3 ใหม่)
  return (
    <div className="w-full h-screen bg-slate-950 text-slate-200 font-sans p-6 overflow-hidden">
      {/* Container หลัก: แบ่ง 4 ส่วน (1 ส่วนซ้าย, 3 ส่วนขวา) */}
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">

        {/* --- ฝั่งซ้าย: Scanner & Info (กว้าง 1 ส่วน) --- */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">

          {/* หัวข้อระบบ */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center shadow-xl">
            <Package size={32} className="text-blue-400 mx-auto mb-2" />
            <h1 className="text-xl font-black italic uppercase tracking-tighter">Warehouse Demo</h1>
          </div>

          {/* ตัวสแกน */}
          <StaffScanner onSearchResult={(name) => handleManagerSearch(name)} />

          {/* รายละเอียดสินค้าเมื่อสแกนเจอ */}
          {selectedSlot ? (
            <div className="bg-blue-600 p-6 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-left duration-500">
              <h3 className="text-white font-black mb-4 flex items-center gap-2 uppercase text-xs">
                <Package size={16} /> Slot Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-blue-200 font-bold uppercase">Product Name</p>
                  <p className="text-lg font-black text-white leading-tight">{selectedSlot.item}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-blue-500/50 pt-4">
                  <div>
                    <p className="text-[10px] text-blue-200 font-bold uppercase">Quantity</p>
                    <p className="text-xl font-black text-white">{selectedSlot.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-blue-200 font-bold uppercase">Rack ID</p>
                    <p className="text-xl font-black text-white">{selectedRack?.id}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700 p-6">
              <QrCode size={32} className="mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase">READY TO SCAN</p>
            </div>
          )}
        </div>

        {/* --- ฝั่งขวา: 3D Warehouse View (กว้าง 3 ส่วน) --- */}
        <div className="lg:col-span-3 bg-slate-900 rounded-[40px] border-4 border-slate-800 shadow-2xl overflow-hidden relative h-full">

          {/* Floating UI Overlay */}
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
            <div className="bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-xl">
              <p className="text-white font-black flex items-center gap-2 uppercase text-xs">
                <LayoutDashboard size={16} className="text-blue-400" />
                {viewMode === 'overview' ? 'Warehouse Overview' : `Focus: ${selectedRack?.id}`}
              </p>
            </div>
            {viewMode === 'focus' && (
              <button
                onClick={() => { setViewMode('overview'); setSelectedRack(null); setSelectedSlot(null); }}
                className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95 text-xs"
              >
                <RotateCcw size={16} /> RESET VIEW
              </button>
            )}
          </div>

          {/* 3D Canvas Viewport */}
          <Canvas camera={{ position: [8, 20, 8] }}>
            <color attach="background" args={['#020617']} />
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <gridHelper args={[40, 40, 0x1e293b, 0x0f172a]} />

            <SceneManager viewMode={viewMode} />

            {racks.map((rack) => (
              (viewMode === 'overview' || selectedRack?.id === rack.id) && (
                <Rack
                  key={rack._id}
                  position={viewMode === 'focus' ? [0, 0, 0] : getRackPosition(rack.id)}
                  name={rack.name}
                  slots={rack.slots}
                  selectedSlotId={selectedSlot?._id}
                  onSlotClick={(slot) => {
                    setSelectedRack(rack);
                    setSelectedSlot(slot);
                    setViewMode('focus');
                  }}
                />
              )
            ))}
            <OrbitControls makeDefault target={[0, 3, 0]} enablePan={viewMode === 'overview'} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}

export default App;
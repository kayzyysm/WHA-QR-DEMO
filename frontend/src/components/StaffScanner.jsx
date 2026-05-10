// frontend/src/components/StaffScanner.jsx
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, RotateCcw } from 'lucide-react';

const StaffScanner = ({ onSearchResult }) => {
    const [scanResult, setScanResult] = useState("");
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        if (isScanning) {
            const scanner = new Html5QrcodeScanner("reader", {
                fps: 10, qrbox: { width: 250, height: 250 }
            });

            scanner.render((decodedText) => {
                // --- ส่วนที่ตัดเอาแค่ชื่อสินค้าหลัง NAME: ---
                let productName = "";
                const nameMatch = decodedText.match(/NAME:\s*(.+?)(?=\s*QTY:|$|\n|\r)/i);
                productName = nameMatch ? nameMatch[1].trim() : decodedText.trim();

                setScanResult(productName);
                setIsScanning(false);
                scanner.clear();

                onSearchResult(productName); // ส่งชื่อไปหน้าหลักเพื่อสั่งซูม
            });

            return () => scanner.clear().catch(() => { });
        }
    }, [isScanning]);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-blue-600 font-black italic">
                <QrCode size={24} />
                <h2 className="uppercase">Staff QR Scanner</h2>
            </div>

            {isScanning ? (
                // ส่วนที่ 1: ขณะกำลังเปิดกล้อง
                <div id="reader" className="w-full overflow-hidden rounded-2xl border-4 border-blue-500 shadow-2xl"></div>
            ) : (
                // ส่วนที่ 2: เมื่อสแกนเจอสินค้าแล้ว (จากรูปของคุณคือส่วนนี้)
                <div className="flex-1 flex flex-col justify-center items-center gap-4 animate-in zoom-in duration-300">
                    <div className="w-full p-4 bg-blue-50 text-blue-700 rounded-2xl font-bold border border-blue-100 text-center">
                        พบสินค้า: <span className="text-blue-600 font-black underline">{scanResult}</span>
                    </div>

                    {/* --- เพิ่มปุ่มนี้เข้าไปครับ --- */}
                    <button
                        onClick={() => {
                            setIsScanning(true); // กลับไปเปิดกล้อง
                            setScanResult("");   // ล้างค่าเดิม
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
                    >
                        <RotateCcw size={18} />
                        สแกนรายการถัดไป
                    </button>
                </div>
            )}

            {/* ข้อความสถานะด้านล่าง */}
            <p className="text-[10px] text-slate-400 mt-4 text-center uppercase tracking-widest font-bold">
                {isScanning ? "Scanning for QR Code..." : "Product Identified"}
            </p>
        </div>
    );
};

export default StaffScanner;
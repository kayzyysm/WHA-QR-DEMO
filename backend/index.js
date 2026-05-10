const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. การเชื่อมต่อ DATABASE (MONGODB ATLAS)
// ==========================================
const mongoURI = "mongodb://kayzy:55n284k4@ac-avnuisi-shard-00-00.7mdbr1u.mongodb.net:27017,ac-avnuisi-shard-00-01.7mdbr1u.mongodb.net:27017,ac-avnuisi-shard-00-02.7mdbr1u.mongodb.net:27017/?ssl=true&replicaSet=atlas-80bsja-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- Mongoose Schema ---
const rackSchema = new mongoose.Schema({
    id: String,       // 'A1', 'A2', 'B1', 'B2'
    name: String,     // 'ZONE A-1'
    slots: [{
        id: Number,
        item: String,
        qty: Number,
        status: String, // 'Empty', 'Occupied', 'Critical'
        weight: { type: Number, default: 0.5 }
    }]
});

const Rack = mongoose.model('Rack', rackSchema);

// ==========================================
// 2. SEED DATA (ข้อมูลเริ่มต้นสินค้าไม่ซ้ำกัน)
// ==========================================
const seedDatabase = async () => {
    try {
        const count = await Rack.countDocuments();
        if (count === 0) {
            const initialData = [
                {
                    id: 'A1', name: 'ZONE A-1',
                    slots: [
                        { id: 1, item: 'น้ำดื่ม 600ml', qty: 45, status: 'Occupied', weight: 0.6 },
                        { id: 2, item: 'ปลากระป๋อง (แพ็ค)', qty: 12, status: 'Occupied', weight: 1.2 },
                        { id: 3, item: 'ข้าวหอมมะลิ 5kg', qty: 20, status: 'Occupied', weight: 5.0 },
                        { id: 4, item: 'น้ำมันพืช 1L', qty: 5, status: 'Critical', weight: 0.9 },
                        { id: 5, item: 'บะหมี่กึ่งสำเร็จรูป', qty: 120, status: 'Occupied', weight: 0.1 },
                        { id: 6, item: 'ซอสปรุงรส 500ml', qty: 15, status: 'Occupied', weight: 0.5 },
                        { id: 7, item: 'นมกล่อง UHT', qty: 60, status: 'Occupied', weight: 0.2 },
                        { id: 8, item: 'กาแฟปรุงสำเร็จ', qty: 8, status: 'Critical', weight: 0.4 },
                        { id: 9, item: 'ผงซักฟอก 800g', qty: 30, status: 'Occupied', weight: 0.8 },
                    ]
                },
                {
                    id: 'A2', name: 'ZONE A-2',
                    slots: [
                        { id: 1, item: 'สบู่ก้อน (แพ็ค 4)', qty: 25, status: 'Occupied', weight: 0.4 },
                        { id: 2, item: 'ยาสีฟันสูตรเกลือ', qty: 40, status: 'Occupied', weight: 0.15 },
                        { id: 3, item: 'แชมพูสระผม 450ml', qty: 3, status: 'Critical', weight: 0.5 },
                        { id: 4, item: 'น้ำยาล้างจาน', qty: 18, status: 'Occupied', weight: 0.8 },
                        { id: 5, item: 'กระดาษชำระ (ม้วน)', qty: 100, status: 'Occupied', weight: 0.1 },
                        { id: 6, item: 'แป้งเด็ก 350g', qty: 12, status: 'Occupied', weight: 0.35 },
                        { id: 7, item: 'น้ำยาปรับผ้านุ่ม', qty: 22, status: 'Occupied', weight: 0.6 },
                        { id: 8, item: 'โฟมล้างหน้า', qty: 4, status: 'Critical', weight: 0.1 },
                        { id: 9, item: 'แปรงสีฟัน (แพ็คคู่)', qty: 50, status: 'Occupied', weight: 0.05 },
                    ]
                },
                {
                    id: 'B1', name: 'ZONE B-1',
                    slots: [
                        { id: 1, item: 'Keyboard RGB', qty: 11, status: 'Occupied', weight: 1.2 },
                        { id: 2, item: 'Mouse Wireless', qty: 2, status: 'Critical', weight: 0.15 },
                        { id: 3, item: 'Monitor 24"', qty: 8, status: 'Occupied', weight: 4.5 },
                        { id: 4, item: 'USB-C Hub', qty: 25, status: 'Occupied', weight: 0.2 },
                        { id: 5, item: 'Laptop Stand', qty: 12, status: 'Occupied', weight: 0.8 },
                        { id: 6, item: 'Webcam 1080p', qty: 6, status: 'Occupied', weight: 0.3 },
                        { id: 7, item: 'Headset 7.1', qty: 1, status: 'Critical', weight: 0.6 },
                        { id: 8, item: 'Microphone USB', qty: 10, status: 'Occupied', weight: 1.1 },
                        { id: 9, item: 'Mouse Pad XL', qty: 30, status: 'Occupied', weight: 0.4 },
                    ]
                },
                {
                    id: 'B2', name: 'ZONE B-2',
                    slots: [
                        { id: 1, item: 'Gaming Chair', qty: 4, status: 'Occupied', weight: 18.0 },
                        { id: 2, item: 'Speaker 2.1', qty: 5, status: 'Occupied', weight: 3.2 },
                        { id: 3, item: 'Power Bank 20k', qty: 15, status: 'Occupied', weight: 0.4 },
                        { id: 4, item: 'HDMI Cable 2m', qty: 50, status: 'Occupied', weight: 0.1 },
                        { id: 5, item: 'SSD SATA 500GB', qty: 20, status: 'Occupied', weight: 0.1 },
                        { id: 6, item: 'RAM DDR4 16GB', qty: 12, status: 'Occupied', weight: 0.05 },
                        { id: 7, item: 'External HDD 1TB', qty: 3, status: 'Critical', weight: 0.2 },
                        { id: 8, item: 'Cooling Pad', qty: 14, status: 'Occupied', weight: 0.7 },
                        { id: 9, item: 'Graphic Card Holder', qty: 9, status: 'Occupied', weight: 0.3 },
                    ]
                }
            ];
            await Rack.insertMany(initialData);
            console.log("🌱 [Seed] Initial items created!");
        }
    } catch (err) {
        console.error("❌ [Seed] Error:", err);
    }
};
seedDatabase();

// ==========================================
// 3. API ROUTES (DATA)
// ==========================================

// Get all racks from DB
app.get('/api/racks', async (req, res) => {
    try {
        const racks = await Rack.find(); // ดึงข้อมูลจาก MongoDB Atlas จริงๆ
        res.json(racks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Slot (Inbound / Outbound / Delete)
// แก้ไขจากอันเดิม ให้เป็นแบบ Bulk Update (อัปเดตทั้งตะกร้า)
app.post('/api/slots/update-bulk', async (req, res) => {
    const { cart } = req.body; // รับตะกร้าสินค้ามาจาก Frontend

    try {
        if (!cart || !Array.isArray(cart)) {
            return res.status(400).json({ message: "Cart data is missing" });
        }

        // วนลูปตามรายการในตะกร้าเพื่อตัดสต็อก
        for (const item of cart) {
            // ค้นหา Rack และ Slot ที่ตรงกับ _id ของ MongoDB
            await Rack.updateOne(
                { id: item.rackId, "slots._id": item._id },
                {
                    $inc: { "slots.$.qty": -item.orderQty } // ลดจำนวนตามที่สั่งเบิก
                }
            );

            // อัปเดตสถานะเป็น Empty อัตโนมัติถ้าของหมด (Optional)
            const updatedRack = await Rack.findOne({ id: item.rackId });
            const slot = updatedRack.slots.id(item._id);
            if (slot.qty <= 0) {
                slot.qty = 0;
                slot.item = null;
                slot.status = 'Empty';
                await updatedRack.save();
            }
        }

        res.json({ success: true, message: "สต็อกถูกอัปเดตเรียบร้อยแล้ว" });
    } catch (err) {
        console.error("Bulk Update Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 4. API ROUTES (PDF GENERATION) - โค้ดเดิมที่คุณเคยใช้
// ==========================================

// --- Route: ใบเสร็จรับสินค้า (Inbound) ---
app.post('/generate-receipt', async (req, res) => {
    try {
        const { items } = req.body;
        const doc = new PDFDocument({ size: 'A4', margin: 40 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=receipt.pdf');
        doc.pipe(res);

        const fontPath = path.join(__dirname, 'THSarabun.ttf');
        doc.registerFont('ThaiFont', fontPath);
        doc.font('ThaiFont');

        // ==========================================
        // หน้าที่ 1: ใบเสร็จรับสินค้า
        // ==========================================

        // --- Header Section ---
        doc.rect(0, 0, 612, 115).fill('#1e293b'); // ขยายแถบดำเป็น 115 ให้พอดี QR
        doc.fillColor('white').fontSize(24).text('WMS AUTOMATION SYSTEM', 40, 35);
        doc.fontSize(10).text('INBOUND SHIPMENT RECEIPT', 40, 65);

        // จัดการ Document No และ Date ให้ชิดซ้ายของ QR ไม่ให้ทับกัน
        const docID = `WH-INV-${Date.now().toString().slice(-6)}`;
        doc.fillColor('white').fontSize(10);
        doc.text(`Document No: ${docID}`, 300, 40, { align: 'right', width: 210 });
        doc.text(`Date: ${new Date().toLocaleDateString('th-TH')}`, 300, 55, { align: 'right', width: 210 });

        // สร้าง QR Header
        const qrHeader = await bwipjs.toBuffer({
            bcid: 'qrcode',
            text: docID,
            scale: 2
        });
        doc.image(qrHeader, 520, 25, { width: 55 }); // วางที่พิกัด x=520, y=25

        // --- Table Section ---
        const tableTop = 150;
        doc.rect(40, tableTop, 520, 25).fill('#f1f5f9');
        doc.fillColor('#475569').fontSize(12);
        doc.text('รายการสินค้า', 60, tableTop + 7);
        doc.text('รหัสสินค้า (ID)', 220, tableTop + 7);
        doc.text('จำนวน', 380, tableTop + 7);
        doc.text('น้ำหนัก (KG)', 480, tableTop + 7);

        let rowY = tableTop + 25;
        doc.fillColor('black');

        items.forEach((item, index) => {
            if (index % 2 === 0) doc.rect(40, rowY, 520, 25).fill('#ffffff');
            else doc.rect(40, rowY, 520, 25).fill('#f8fafc');

            doc.fillColor('black').fontSize(11);
            doc.text(item.name, 60, rowY + 7);
            doc.fontSize(9).text(item.id, 220, rowY + 9);
            doc.fontSize(11).text(item.qty, 380, rowY + 7);
            doc.text(item.weight, 480, rowY + 7);
            rowY += 25;
        });

        doc.rect(40, tableTop, 520, rowY - tableTop).stroke('#e2e8f0');

        // --- ส่วนท้ายกระดาษ (ล่างสุดของหน้า 1) ---
        // กำหนดตำแหน่งลายเซ็นให้คงที่ (ประมาณ 150px จากขอบล่าง)
        const footerY = 700;

        doc.fontSize(12).fillColor('black');
        doc.text('ผู้รับสินค้า: ...........................................', 60, footerY);
        doc.text('เจ้าหน้าที่คลัง: ...........................................', 350, footerY);

        // หมายเหตุ (ล่างสุดจริงๆ)
        doc.fontSize(10).fillColor('#64748b');
        doc.text('หมายเหตุ: สินค้าถูกตรวจสอบเบื้องต้นแล้ว โปรดเก็บใบเสร็จนี้ไว้เพื่อการตรวจสอบสต็อก', 40, footerY + 50, { align: 'center', width: 520 });

        // ==========================================
        // หน้าที่ 2: Labels (QR Code & Barcode)
        // ==========================================
        doc.addPage();
        doc.fillColor('black').fontSize(18).text('PRODUCT LABELS (สำหรับติดสินค้า)', { align: 'center' });
        doc.moveDown();

        let labelY = 100;
        for (const item of items) {
            // วาดกรอบ Label
            doc.roundedRect(40, labelY, 520, 140, 10).stroke('#cbd5e1');

            // ข้อมูลสินค้าใน Label
            doc.fontSize(14).font('ThaiFont').text(`สินค้า: ${item.name}`, 60, labelY + 20);
            doc.fontSize(10).text(`ID: ${item.id}`, 60, labelY + 40);

            // สร้าง QR Code (ข้อมูลสรุป)
            const qrPng = await bwipjs.toBuffer({
                bcid: 'qrcode',
                text: `ID:${item.id}\nNAME:${item.name}\nQTY:${item.qty}`,
                scale: 2
            });

            // สร้าง Barcode (สำหรับเครื่องยิงบาร์โค้ด)
            const barPng = await bwipjs.toBuffer({
                bcid: 'code128',
                text: String(item.id),
                scale: 2,
                height: 12,
                includetext: true
            });

            // วางภาพประกอบ
            doc.image(qrPng, 60, labelY + 55, { width: 65 });
            doc.image(barPng, 150, labelY + 70, { width: 280 });

            labelY += 160; // ขยับลงไปอันถัดไป

            // ถ้าพื้นที่หน้ากระดาษหมดให้ขึ้นหน้าใหม่
            if (labelY > 650) {
                doc.addPage();
                labelY = 50;
            }
        }

        doc.end();
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).send("PDF Error");
    }
});

// --- Route: ใบเบิกสินค้า (Outbound) ---
app.post('/generate-outbound-receipt', async (req, res) => {
    try {
        const { cart, totalWeight } = req.body;
        const doc = new PDFDocument({ size: 'A4', margin: 40 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=outbound-order.pdf');
        doc.pipe(res);

        const fontPath = path.join(__dirname, 'THSarabun.ttf');
        doc.registerFont('ThaiFont', fontPath);
        doc.font('ThaiFont');

        // --- Header Section ---
        doc.rect(0, 0, 612, 115).fill('#f97316');
        doc.fillColor('white').fontSize(22).text('ใบเบิกสินค้า (Outbound Order)', 40, 30);
        doc.fontSize(10).text('WAREHOUSE MANAGEMENT SYSTEM - PICKING LIST', 40, 60);

        const orderID = `ORD-${Date.now().toString().slice(-6)}`;
        doc.fillColor('white').fontSize(10);
        doc.text(`Order ID: ${orderID}`, 300, 40, { align: 'right', width: 210 });
        doc.text(`Date: ${new Date().toLocaleDateString('th-TH')}`, 300, 55, { align: 'right', width: 210 });

        const qrPng = await bwipjs.toBuffer({ bcid: 'qrcode', text: orderID, scale: 2 });
        doc.image(qrPng, 520, 25, { width: 55 });

        // --- Table Header ---
        const tableTop = 160;
        doc.rect(40, tableTop, 520, 25).fill('#fff7ed');
        doc.fillColor('#9a3412').fontSize(12);
        doc.text('รายการสินค้าที่ต้องหยิบ', 60, tableTop + 7);
        doc.text('จำนวนเบิก', 350, tableTop + 7);
        doc.text('น้ำหนักรวม', 480, tableTop + 7);

        // --- Table Body ---
        let rowY = tableTop + 25;
        doc.fillColor('black');
        cart.forEach((item, index) => {
            if (index % 2 === 0) doc.rect(40, rowY, 520, 25).fill('#ffffff');
            else doc.rect(40, rowY, 520, 25).fill('#fffaf5');
            doc.fillColor('black').fontSize(11);
            doc.text(`${index + 1}. ${item.name} (ID: ${item.id})`, 60, rowY + 7);
            doc.text(`${item.orderQty} ชิ้น`, 350, rowY + 7);
            doc.text(`${(item.weight * item.orderQty).toFixed(2)} kg`, 480, rowY + 7);
            rowY += 25;
        });
        doc.rect(40, tableTop, 520, rowY - tableTop).stroke('#fed7aa');

        // สรุปน้ำหนัก (วางต่อจากตาราง)
        const summaryY = rowY + 15;
        doc.fontSize(14).font('ThaiFont').fillColor('#f97316').text(`น้ำหนักสุทธิรวม: ${totalWeight} kg`, 40, summaryY, { align: 'right', width: 520 });

        // --- Signature & Footer Section (ล่างสุดของหน้า) ---
        const footerY = 700; // ตำแหน่งเดียวกับหน้าแรก

        doc.fontSize(12).fillColor('black');
        doc.text('ผู้เบิกสินค้า: ...........................................', 60, footerY);
        doc.text('ผู้อนุมัติเบิก: ...........................................', 350, footerY);

        // Footer หมายเหตุสำหรับ Outbound
        doc.fontSize(10).fillColor('#64748b');
        doc.text('หมายเหตุ: ตรวจสอบรายการและจำนวนสินค้าให้ครบถ้วนก่อนนำออกจากคลังสินค้า หากพ้นพื้นที่คลังถือว่าการส่งมอบเสร็จสิ้น', 40, footerY + 50, { align: 'center', width: 520 });

        doc.end();
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).send("PDF Error");
    }
});

// ==========================================
// 5. SERVER LISTEN
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Warehouse Backend is running on http://localhost:${PORT}`);
});
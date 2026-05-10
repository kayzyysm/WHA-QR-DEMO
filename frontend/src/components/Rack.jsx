import React, { useRef } from 'react';
import { Box, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// 1. Component สำหรับกล่องที่กระพริบ
const BlinkingBox = ({ color, isSelected, onClick }) => {
    const materialRef = useRef();

    useFrame(({ clock }) => {
        if (isSelected && materialRef.current) {
            // ทำให้กระพริบโดยใช้ค่า Sine Wave
            const blink = (Math.sin(clock.getElapsedTime() * 10) + 1) / 2;
            materialRef.current.emissiveIntensity = blink * 3; // เพิ่มความแรงแสงเป็น 3 จะชัดมาก
        } else if (materialRef.current) {
            materialRef.current.emissiveIntensity = 0; // ถ้าไม่เลือกให้ดับไฟ
        }
    });

    return (
        <Box args={[0.8, 0.8, 0.8]} onClick={onClick}>
            <meshStandardMaterial
                ref={materialRef}
                color={color}
                emissive={isSelected ? color : 'black'}
                emissiveIntensity={0}
            />
        </Box>
    );
};

const Rack = ({ position, name, slots, onSlotClick, selectedSlotId }) => {
    return (
        <group position={position}>
            <Text position={[0, 7.5, 0]} fontSize={0.5} color="#ffffff" fontWeight="bold">
                {name}
            </Text>

            {/* โครงชั้นวาง */}
            <Box args={[0.2, 7, 0.2]} position={[-1.6, 3.5, 0.6]}><meshStandardMaterial color="#334155" /></Box>
            <Box args={[0.2, 7, 0.2]} position={[1.6, 3.5, 0.6]}><meshStandardMaterial color="#334155" /></Box>
            <Box args={[0.2, 7, 0.2]} position={[-1.6, 3.5, -0.6]}><meshStandardMaterial color="#334155" /></Box>
            <Box args={[0.2, 7, 0.2]} position={[1.6, 3.5, -0.6]}><meshStandardMaterial color="#334155" /></Box>

            {/* พื้นชั้นวาง */}
            {[0.5, 3.5, 6.5].map((y, i) => (
                <Box key={i} args={[3.2, 0.1, 1.2]} position={[0, y, 0]}>
                    <meshStandardMaterial color="#64748b" />
                </Box>
            ))}

            {/* วาดกล่องสินค้า */}
            {slots.map((slot, index) => {
                const x = (index % 3) - 1;
                const y = Math.floor(index / 3) * 2.5 + 1.2;

                // ตรวจสอบว่า ID ตรงกับที่เลือกหรือไม่ (เช็คทั้ง .id และ ._id ของ MongoDB)
                const isSelected = selectedSlotId === slot.id || selectedSlotId === slot._id;

                const getBoxColor = () => {
                    if (slot.status === 'Empty') return '#e2e8f0';
                    if (slot.status === 'Critical') return '#ef4444';
                    return '#3b82f6';
                };

                return (
                    <group key={slot.id || index} position={[x * 1.1, y, 0]}>
                        {/* เรียกใช้ BlinkingBox แบบนี้ครับ ส่งแค่ color และ isSelected */}
                        <BlinkingBox
                            color={getBoxColor()}
                            isSelected={isSelected}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSlotClick(slot, index + 1);
                            }}
                        />
                        
                        {slot.item && (
                            <Text position={[0, 0.6, 0]} fontSize={0.2} color="#ffffff" fontWeight="bold">
                                {slot.item}
                            </Text>
                        )}
                    </group>
                );
            })}
        </group>
    );
};

export default Rack;
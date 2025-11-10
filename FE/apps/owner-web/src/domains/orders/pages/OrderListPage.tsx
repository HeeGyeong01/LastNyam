import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@shared/src/components/Button";

export default function OrderListPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // 주문 목록 API 호출
  }, []);

  const handleManageMenu = () => {
    navigate('/owner/catalog/menu');
  };

  // 빈 상태 화면
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6">
        {/* 고양이 아이콘 */}
        <div className="relative w-[108px] h-[106px] rounded-full bg-[#FFF1C7] mb-6 overflow-hidden">
          <img 
            src="/nyamcat.png"
            alt="고양이" 
            className="w-[108px] h-[106px] mt-3 ml-2"
          />
        </div>

        {/* 메시지 */}
        <div className="text-center space-y-2 mb-3">
          <h2 className="p2-b text-primary">
            현재 마감세일·푸켓팅 주문이 없어요
          </h2>
          <p className="p3 text-secondary">
            가게 메뉴를 관리할까요?
          </p>
        </div>

        {/* 메뉴 관리 버튼 */}
        <Button
          btnStyle="filled-gray"
          onClick={handleManageMenu}
        >
          메뉴 관리
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1>Order List Page</h1>
      {/* TODO: 주문 목록 표시 */}
    </div>
  );
}
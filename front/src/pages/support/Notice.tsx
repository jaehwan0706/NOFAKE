import React, { useState } from "react";

const NOTICE_DATA = [
  {
    id: 1,
    title: "서비스 점검 안내 (5/10)",
    date: "2026.05.01",
    content: "서버 안정화를 위한 정기 점검 안내입니다...",
  },
  {
    id: 2,
    title: "개인정보처리방침 개정 공지",
    date: "2026.04.28",
    content: "개정된 약관 내용을 확인해 주세요.",
  },
  {
    id: 3,
    title: "래플 이벤트 참여 방법 안내",
    date: "2026.04.25",
    content: "래플 응모 및 당첨자 선정 기준 안내입니다.",
  },
];

export const Notice: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | null>(
    null,
  );

  return (
    // pt-32 또는 pt-40을 주어 헤더 뒤로 제목이 숨지 않게 합니다.
    <div className="max-w-5xl mx-auto pt-32 pb-20 px-6 min-h-screen bg-white">
      <div className="border-b-2 border-gray-900 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          공지사항
        </h1>
      </div>

      <div className="flex flex-col border-t border-gray-100">
        {NOTICE_DATA.map((item) => (
          <div
            key={item.id}
            className="border-b border-gray-100 last:border-none"
          >
            <div
              className="flex justify-between items-center py-6 px-4 cursor-pointer hover:bg-gray-50 transition-all"
              onClick={() =>
                setSelectedId(
                  selectedId === item.id ? null : item.id,
                )
              }
            >
              <span
                className={`text-lg transition-colors ${selectedId === item.id ? "font-bold text-blue-600" : "text-gray-800"}`}
              >
                {item.title}
              </span>
              <span className="text-sm text-gray-400">
                {item.date}
              </span>
            </div>

            {/* 아코디언 상세 내용 */}
            {selectedId === item.id && (
              <div className="bg-gray-50 p-8 text-gray-600 leading-relaxed border-t border-gray-100">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
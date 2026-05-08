import { User } from "@/types/auth";

type TabType = "info" | "posts" | "comments" | "scraps";

interface MyPageSidebarProps {
  user: User;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogout: () => void;
}

export default function MyPageSidebar({ user, activeTab, onTabChange, onLogout }: MyPageSidebarProps) {
  return (
    <aside className="w-full md:w-72 shrink-0 flex flex-col gap-6">
      {/* 프로필 카드 */}
      <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg shadow-indigo-200">
          {user.nickname[0]}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900">{user.nickname}</h2>
        <p className="text-gray-500 text-sm mt-1 mb-3">@{user.username}</p>
        
        {user.is_student_verified ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            🎓 학교 인증 완료
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            미인증 회원
          </span>
        )}
      </div>

      {/* 네비게이션 탭 */}
      <nav className="flex flex-col gap-2">
        <TabButton label="내 정보 관리" isActive={activeTab === "info"} onClick={() => onTabChange("info")} />
        <TabButton label="내가 쓴 글" isActive={activeTab === "posts"} onClick={() => onTabChange("posts")} />
        <TabButton label="내가 쓴 댓글" isActive={activeTab === "comments"} onClick={() => onTabChange("comments")} />
        <TabButton label="스크랩한 글" isActive={activeTab === "scraps"} onClick={() => onTabChange("scraps")} />
      </nav>

      <button
        onClick={onLogout}
        className="w-full py-3 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-medium transition duration-200 mt-auto"
      >
        로그아웃
      </button>
    </aside>
  );
}

// 탭 버튼 서브 컴포넌트
function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-3.5 rounded-xl transition-all duration-200 font-medium flex justify-between items-center ${
        isActive
          ? "bg-gray-900 text-white shadow-md"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {label}
      {isActive && <span>👉</span>}
    </button>
  );
}
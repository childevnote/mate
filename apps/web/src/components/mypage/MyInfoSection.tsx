import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useState } from "react";
import { userAtom } from "@/store/authStore";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { User, PasskeyItem } from "@/types/auth";
import { UserActionResponse } from "@/types/user";
import SchoolAuthModal from "./SchoolAuthModal";

interface MyInfoSectionProps {
  user: User;
}

export default function MyInfoSection({ user }: MyInfoSectionProps) {
  const router = useRouter();
  const [, setUser] = useAtom(userAtom);
  const queryClient = useQueryClient();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 1. 등록된 기기 목록 조회
  const { data: devices, isLoading: isDevicesLoading } = useQuery<PasskeyItem[]>({
    queryKey: ["myPasskeys", user.id],
    queryFn: authService.getMyPasskeys,
  });

  // 2. 기기 삭제 Mutation
  const deleteDeviceMutation = useMutation({
    mutationFn: authService.deletePasskey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPasskeys"] });
      alert("기기가 삭제되었습니다.");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      alert(error.response?.data?.detail || "기기 삭제에 실패했습니다.");
    },
  });

  // 3. 계정 삭제 Mutation
  const deleteAccountMutation = useMutation<UserActionResponse, AxiosError>({
    mutationFn: userService.deleteAccount,
    onSuccess: () => {
      alert("회원 탈퇴가 완료되었습니다.");
      authService.logout();
      setUser(null);
      router.push("/");
    },
    onError: () => alert("회원 탈퇴 중 오류가 발생했습니다."),
  });

  const handleDeleteDevice = (deviceId: number) => {
    if (confirm("정말 이 기기를 삭제하시겠습니까?\n삭제 후에는 이 기기로 로그인할 수 없습니다.")) {
      deleteDeviceMutation.mutate(deviceId);
    }
  };

  return (
    <div className="space-y-10 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 학교 인증 섹션 */}
      <section>
        <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
          🏫 학교 인증
          {user.is_student_verified && (
            <span className="text-green-500 text-sm font-normal">✔ 완료됨</span>
          )}
        </h3>
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
          {user.is_student_verified ? (
            <div>
              <p className="font-bold text-gray-800 text-lg mb-1">{user.university}</p>
              <p className="text-gray-500 text-sm">{user.school_email}</p>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">아직 인증되지 않았습니다.</p>
                <p className="text-sm text-gray-500 mt-1">
                  학교 인증을 완료하면 <strong>장터</strong>와 <strong>모든 게시판</strong>을 이용할 수 있습니다.
                </p>
              </div>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
              >
                인증하기
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 로그인 기기 관리 */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-bold text-gray-900">🔐 로그인 기기 관리</h3>
          <span className="text-xs text-gray-500">
            총 <strong className="text-indigo-600">{devices?.length || 0}</strong>개의 기기가 등록됨
          </span>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-600">등록된 기기 목록</span>
          </div>

          <div className="divide-y divide-gray-100">
            {isDevicesLoading ? (
              <div className="p-5 text-center text-sm text-gray-400">불러오는 중...</div>
            ) : devices && devices.length > 0 ? (
              devices.map((device) => (
                <div key={device.id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition duration-150">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl">
                      🔑
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        {device.device_name || "이름 없는 기기"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        등록일: {new Date(device.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteDevice(device.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                  >
                    삭제
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                등록된 기기가 없습니다.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 계정 관리 */}
      <section>
        <h3 className="text-xl font-bold mb-4 text-red-600">계정 관리</h3>
        <div className="p-5 bg-red-50 rounded-xl border border-red-100 flex justify-between items-center">
          <div>
            <p className="font-bold text-red-700">회원 탈퇴</p>
            <p className="text-xs text-red-500/80 mt-1">
              탈퇴 시 계정 정보는 즉시 삭제되며 복구할 수 없습니다.
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                deleteAccountMutation.mutate();
              }
            }}
            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-bold transition"
          >
            탈퇴하기
          </button>
        </div>
      </section>
      <SchoolAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
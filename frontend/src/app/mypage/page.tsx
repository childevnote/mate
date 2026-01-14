"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";

// 상태 및 서비스
import { userAtom } from "@/store/authStore";
import { postService } from "@/services/postService"; 
import { authService } from "@/services/authService";
import { userService } from "@/services/userService"; 

// 타입 정의
import { Post, PostSummary } from "@/types/post";
import { Comment as IComment } from "@/types/comment";
import { UserActionResponse } from "@/types/user";
import { PasskeyItem, User } from "@/types/auth";

import RegisterPasskeyButton from "@/components/auth/RegisterPasskeyButton"; 

type TabType = "info" | "posts" | "comments" | "scraps";

export default function MyPage() {
  const [user, setUser] = useAtom(userAtom);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("info");

  // 1. 내가 쓴 글 조회 (postService 사용)
  const { data: myPosts } = useQuery({
    queryKey: ["myPosts"], // 키 단순화
    queryFn: () => postService.getMyPosts(),
    enabled: !!user && activeTab === "posts",
  });

  // 2. 내가 쓴 댓글 조회 (postService 사용)
  const { data: myComments } = useQuery({
    queryKey: ["myComments", user?.id],
    queryFn: () => postService.getMyComments(user!.id),
    enabled: !!user && activeTab === "comments",
  });

  // 3. 스크랩한 글 조회 (postService 사용)
  const { data: scrappedPosts } = useQuery({
    queryKey: ["scrappedPosts"],
    queryFn: () => postService.getMyScraps(),
    enabled: !!user && activeTab === "scraps",
  });

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">로그인이 필요한 페이지입니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-10 text-gray-900">마이페이지</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* 왼쪽 사이드바 (프로필) */}
        <aside className="w-full md:w-72 shrink-0 flex flex-col gap-6">
          <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
            {/* 프로필 이미지 (이니셜) */}
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg shadow-indigo-200">
              {user.nickname[0]}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900">{user.nickname}</h2>
            <p className="text-gray-500 text-sm mt-1 mb-3">@{user.username}</p>
            
            {/* 인증 뱃지 */}
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

          <nav className="flex flex-col gap-2">
            <TabButton
              label="내 정보 관리"
              isActive={activeTab === "info"}
              onClick={() => setActiveTab("info")}
            />
            <TabButton
              label="내가 쓴 글"
              isActive={activeTab === "posts"}
              onClick={() => setActiveTab("posts")}
            />
            <TabButton
              label="내가 쓴 댓글"
              isActive={activeTab === "comments"}
              onClick={() => setActiveTab("comments")}
            />
            <TabButton
              label="스크랩한 글"
              isActive={activeTab === "scraps"}
              onClick={() => setActiveTab("scraps")}
            />
          </nav>

          <button
            onClick={handleLogout}
            className="w-full py-3 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-medium transition duration-200 mt-auto"
          >
            로그아웃
          </button>
        </aside>

        {/* 오른쪽 컨텐츠 영역 */}
        <main className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm min-h-[600px]">
          {activeTab === "info" && <MyInfoSection user={user} />}
          {activeTab === "posts" && (
            <PostList posts={myPosts} emptyMsg="아직 작성한 글이 없습니다." />
          )}
          {activeTab === "comments" && <CommentList comments={myComments} />}
          {activeTab === "scraps" && (
            <PostList
              posts={scrappedPosts}
              emptyMsg="스크랩한 글이 없습니다."
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
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

// 내 정보 섹션
function MyInfoSection({ user }: { user: User }) {
  const router = useRouter();
  const [, setUser] = useAtom(userAtom);
  const queryClient = useQueryClient();

  // 1. 등록된 기기 목록 조회 Query
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

  // 계정 삭제 Mutation
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
      {/* 1. 학교 인증 섹션 */}
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                인증하기
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. 로그인 기기 관리 */}
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

            <div className="p-5 bg-gray-50 border-t border-gray-100">
                 <p className="text-xs text-gray-500 mb-3">
                    현재 기기를 로그인 수단으로 추가하려면 아래 버튼을 누르세요.
                 </p>
                 <RegisterPasskeyButton user={user} />
            </div>
        </div>
      </section>

      {/* 3. 계정 삭제 */}
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
    </div>
  );
}

// ----------------------------------------------------------------------
// List Components
// ----------------------------------------------------------------------

interface PostListProps {
  posts: (PostSummary)[] | undefined; 
  emptyMsg: string;
}

function PostList({ posts, emptyMsg }: PostListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p>{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="group block p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              {post.category}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
          <h4 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-1">
            {post.title}
          </h4>
          <div className="flex gap-3 text-xs text-gray-500 font-medium">
            <span>👁️ {post.view_count}</span>
            <span>💬 {post.comment_count}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

interface CommentListProps {
  comments: IComment[] | undefined;
}

function CommentList({ comments }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p>작성한 댓글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <Link
          key={comment.id}
          href={`/posts/${comment.post_id}`}
          className="block p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition duration-200"
        >
          <p className="text-gray-800 text-sm mb-2 line-clamp-2">
            {comment.content}
          </p>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">
              {new Date(comment.created_at).toLocaleString()}
            </span>
            <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100">
              이동 →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
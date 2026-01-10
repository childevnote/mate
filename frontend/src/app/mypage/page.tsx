"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";

// 상태 및 서비스
import { userAtom } from "@/store/authStore";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";

// 타입 정의
import { Post } from "@/types/post";
import { Comment as IComment } from "@/types/comment";
import { UserActionResponse } from "@/types/user";
import { User } from "@/types/auth";

import RegisterPasskeyButton from "@/components/auth/RegisterPasskeyButton"; 

type TabType = "info" | "posts" | "comments" | "scraps";

export default function MyPage() {
  const [user, setUser] = useAtom(userAtom);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("info");

  // 1. 내가 쓴 글 조회
  const { data: myPosts } = useQuery<Post[]>({
    queryKey: ["myPosts", user?.id],
    queryFn: () => userService.getMyPosts(user!.id),
    enabled: !!user && activeTab === "posts",
  });

  // 2. 내가 쓴 댓글 조회
  const { data: myComments } = useQuery<IComment[]>({
    queryKey: ["myComments", user?.id],
    queryFn: () => userService.getMyComments(user!.id),
    enabled: !!user && activeTab === "comments",
  });

  // 3. 스크랩한 글 조회
  const { data: scrappedPosts } = useQuery<Post[]>({
    queryKey: ["scrappedPosts"],
    queryFn: () => userService.getScrappedPosts(),
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

// 내 정보 섹션 (비밀번호 변경 삭제, 기기/인증 관리 추가)
function MyInfoSection({ user }: { user: User }) { // user 타입은 auth.ts의 User 사용 권장
  const router = useRouter();
  const [, setUser] = useAtom(userAtom);

  // 계정 삭제 Mutation
  const deleteMutation = useMutation<UserActionResponse, AxiosError>({
    mutationFn: userService.deleteAccount,
    onSuccess: () => {
      alert("회원 탈퇴가 완료되었습니다.");
      authService.logout();
      setUser(null);
      router.push("/");
    },
    onError: () => alert("회원 탈퇴 중 오류가 발생했습니다."),
  });

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
              <Link
                href="/verify-school" // 학교 인증 페이지 (나중에 만들어야 함)
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition"
              >
                인증하기
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 2. 로그인 기기 관리 (패스키) */}
      <section>
        <h3 className="text-xl font-bold mb-4 text-gray-900">🔐 로그인 기기 관리</h3>
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-600 mb-4">
            현재 로그인된 기기 외에 다른 기기(핸드폰, 태블릿 등)에서도 로그인하려면<br/>
            해당 기기에서 로그인 후 <strong>[기기 등록]</strong>을 진행해주세요.
          </p>
          
          {/* 기기 등록 버튼 컴포넌트 */}
          <RegisterPasskeyButton user={user} />
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
                deleteMutation.mutate();
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
// List Components (기존 유지)
// ----------------------------------------------------------------------

interface PostListProps {
  posts: Post[] | undefined;
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
            <span>❤️ {post.like_count}</span>
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
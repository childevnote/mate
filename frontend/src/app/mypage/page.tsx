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
import { Post, PostListProps } from "@/types/post";
import { Comment as IComment } from "@/types/comment";
import { PasswordChangeRequest, UserActionResponse } from "@/types/user";
import { ApiErrorResponse } from "@/types/common";

type TabType = "info" | "posts" | "comments" | "scraps";

export default function MyPage() {
  const [user, setUser] = useAtom(userAtom);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("info");

  const { data: myPosts } = useQuery<Post[]>({
    queryKey: ["myPosts", user?.id],
    queryFn: () => userService.getMyPosts(user!.id),
    enabled: !!user && activeTab === "posts",
  });

  const { data: myComments } = useQuery<IComment[]>({
    queryKey: ["myComments", user?.id],
    queryFn: () => userService.getMyComments(user!.id),
    enabled: !!user && activeTab === "comments",
  });

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
        {/* 왼쪽 사이드바 */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 border border-primary/20">
              {user.nickname[0]}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.nickname}</h2>
            <p className="text-gray-500 text-sm mt-1">{user.username}</p>
          </div>

          <nav className="flex flex-col gap-1.5">
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
            className="w-full py-3 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-medium transition duration-200"
          >
            로그아웃
          </button>
        </aside>

        {/* 오른쪽 컨텐츠 영역 */}
        <main className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm min-h-[600px]">
          {activeTab === "info" && <MyInfoSection />}
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
      className={`w-full text-left px-5 py-3.5 rounded-xl transition-all duration-200 font-medium ${
        isActive
          ? "bg-primary text-white shadow-md shadow-primary/20"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {label}
    </button>
  );
}

function MyInfoSection() {
  const [passwords, setPasswords] = useState<PasswordChangeRequest>({
    old_password: "",
    new_password: "",
  });
  const router = useRouter();
  const [, setUser] = useAtom(userAtom);

  // AxiosError의 제네릭에 ApiErrorResponse 추가하여 any 제거
  const pwMutation = useMutation<
    UserActionResponse,
    AxiosError<ApiErrorResponse>,
    PasswordChangeRequest
  >({
    mutationFn: (data) => userService.changePassword(data),
    onSuccess: () => {
      alert("비밀번호가 성공적으로 변경되었습니다.");
      setPasswords({ old_password: "", new_password: "" });
    },
    onError: (err) => {
      // 🔥 [수정] 이제 err.response.data.error는 string으로 자동 추론됨 (No any)
      const msg = err.response?.data?.error || "비밀번호 변경에 실패했습니다.";
      alert(msg);
    },
  });

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
    <div className="space-y-12 max-w-lg">
      <section>
        <h3 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">
          비밀번호 변경
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              현재 비밀번호
            </label>
            <input
              type="password"
              value={passwords.old_password}
              onChange={(e) =>
                setPasswords({ ...passwords, old_password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호
            </label>
            <input
              type="password"
              value={passwords.new_password}
              onChange={(e) =>
                setPasswords({ ...passwords, new_password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              placeholder="••••••••"
            />
          </div>
          <button
            onClick={() => pwMutation.mutate(passwords)}
            disabled={
              !passwords.old_password ||
              !passwords.new_password ||
              pwMutation.isPending
            }
            className="mt-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {pwMutation.isPending ? "변경 중..." : "비밀번호 변경"}
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 text-red-600 border-b border-red-100 pb-4">
          계정 삭제
        </h3>
        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            회원 탈퇴 시 계정 정보는 즉시 삭제되며 복구할 수 없습니다.
            <br />
            작성하신 게시글과 댓글은 자동으로 삭제되지 않을 수 있습니다.
          </p>
          <button
            onClick={() => {
              if (
                confirm(
                  "정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                )
              ) {
                deleteMutation.mutate();
              }
            }}
            className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition font-medium text-sm"
          >
            회원 탈퇴하기
          </button>
        </div>
      </section>
    </div>
  );
}

function PostList({ posts, emptyMsg }: PostListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <p>{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="group block p-5 bg-white border border-gray-100 rounded-xl hover:border-primary/40 hover:shadow-md transition duration-200"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary">
              {post.category}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
          <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-3 line-clamp-1">
            {post.title}
          </h4>
          <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              👁️ {post.view_count}
            </span>
            <span className="flex items-center gap-1">
              ❤️ {post.like_count}
            </span>
            <span className="flex items-center gap-1">
              💬 {post.comment_count}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

interface CommentListProps {
  comments: IComment[] | undefined; // 🔥 IComment 필수
}

function CommentList({ comments }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <p>작성한 댓글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <Link
          key={comment.id}
          href={`/posts/${comment.post}`}
          className="block p-5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition duration-200"
        >
          <p className="text-gray-800 mb-3 line-clamp-2 leading-relaxed">
            {comment.content}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-400">
              {new Date(comment.created_at).toLocaleString()}
            </span>
            <span className="text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              게시글 보기 →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

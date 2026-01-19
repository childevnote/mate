"use client";

import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { X, Mail, Loader2, Search, ChevronRight } from "lucide-react";
import { useSetAtom } from "jotai";
import { userAtom } from "@/store/authStore";

import { authService } from "@/services/authService";
import { UNIVERSITY_LIST } from "@/data/universityList";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SchoolAuthModal({ isOpen, onClose }: Props) {
  const setUser = useSetAtom(userAtom);
  const [step, setStep] = useState<"SEARCH" | "EMAIL" | "CODE">("SEARCH");
  
  // 선택된 학교 정보 (직접 입력 모드일 경우 null)
  const [selectedUniv, setSelectedUniv] = useState<{ name: string; domain: string } | null>(null);
  
  // 입력 값들
  const [searchKeyword, setSearchKeyword] = useState("");
  const [localPart, setLocalPart] = useState(""); 
  const [fullEmail, setFullEmail] = useState("");
  const [code, setCode] = useState("");

  // 학교 검색 필터링
  const filteredUnivs = useMemo(() => {
    if (!searchKeyword.trim()) return [];
    return UNIVERSITY_LIST.filter((univ) => 
      univ.name.includes(searchKeyword) || univ.domain.includes(searchKeyword)
    );
  }, [searchKeyword]);

  // 1. 메일 발송
  const sendMutation = useMutation({
    mutationFn: (email: string) => authService.sendSchoolEmail(email),
    onSuccess: (data) => {
      alert(data.message);
      setStep("CODE");
    },
    onError: (err: AxiosError<{ detail: string }>) => {
      alert(err.response?.data?.detail || "메일 전송에 실패했습니다.");
    },
  });

  // 2. 코드 검증
const verifyMutation = useMutation({
    mutationFn: () => {
      const emailToVerify = selectedUniv 
        ? `${localPart}@${selectedUniv.domain}` 
        : fullEmail;
      return authService.verifySchoolCode(emailToVerify, code);
    },
    onSuccess: async (data) => {
      alert(data.message);
      
      try {
        const freshUser = await authService.getMe();
        localStorage.setItem("user", JSON.stringify(freshUser));
        setUser(freshUser);
        handleClose();
      } catch (e) {
        console.error("유저 정보 갱신 실패", e);
        window.location.reload();
      }
    },
    onError: (err: AxiosError<{ detail: string }>) => {
      alert(err.response?.data?.detail || "인증번호가 올바르지 않습니다.");
    },
  });

  const handleClose = () => {
    setStep("SEARCH");
    setSearchKeyword("");
    setSelectedUniv(null);
    setLocalPart("");
    setFullEmail("");
    setCode("");
    onClose();
  };

  const handleUnivSelect = (univ: { name: string; domain: string }) => {
    setSelectedUniv(univ);
    setStep("EMAIL");
  };

  const handleDirectInput = () => {
    setSelectedUniv(null); // 직접 입력 모드
    setStep("EMAIL");
  };

  const handleSendEmail = () => {
    const finalEmail = selectedUniv 
      ? `${localPart}@${selectedUniv.domain}` 
      : fullEmail;
      
    if (!finalEmail.includes("@")) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }
    sendMutation.mutate(finalEmail);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative min-h-[400px] flex flex-col">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            🏫 학교 인증
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          
          {step === "SEARCH" && (
            <div className="flex flex-col h-full">
              <h4 className="text-gray-900 font-bold text-lg mb-4 text-center">재학 중인 학교를 찾아보세요</h4>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="학교 이름 검색 (예: 서울대)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto max-h-[300px] space-y-1">
                {searchKeyword && filteredUnivs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-2">검색 결과가 없습니다.</p>
                    <button 
                      onClick={handleDirectInput}
                      className="text-indigo-600 font-bold text-sm hover:underline"
                    >
                      직접 이메일 입력하기 &rarr;
                    </button>
                  </div>
                ) : (
                  filteredUnivs.map((univ) => (
                    <button
                      key={univ.domain}
                      onClick={() => handleUnivSelect(univ)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex justify-between items-center group transition"
                    >
                      <div>
                        <span className="font-bold text-gray-800 block">{univ.name}</span>
                        <span className="text-xs text-gray-400">@{univ.domain}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500" />
                    </button>
                  ))
                )}
                
                {!searchKeyword && (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    학교 이름을 입력하시면<br/>이메일 주소를 자동으로 채워드립니다.
                  </div>
                )}
              </div>
              
               <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                 <button 
                   onClick={handleDirectInput}
                   className="text-xs text-gray-500 hover:text-gray-800 underline"
                 >
                   목록에 학교가 없나요? 직접 입력하기
                 </button>
               </div>
            </div>
          )}

          {step === "EMAIL" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-gray-900 font-bold text-lg">
                  {selectedUniv ? selectedUniv.name : "학교 이메일 입력"}
                </h4>
                <p className="text-gray-500 text-sm">
                  인증번호를 받을 웹메일 주소를 입력해주세요.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                {selectedUniv ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={localPart}
                      onChange={(e) => setLocalPart(e.target.value)}
                      placeholder="학번/아이디"
                      className="flex-1 bg-white px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none text-right font-bold text-gray-800"
                      autoFocus
                    />
                    <span className="text-gray-500 font-medium">@{selectedUniv.domain}</span>
                  </div>
                ) : (
                  <input
                    type="email"
                    value={fullEmail}
                    onChange={(e) => setFullEmail(e.target.value)}
                    placeholder="example@university.ac.kr"
                    className="w-full bg-white px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none font-medium"
                    autoFocus
                  />
                )}
              </div>

              <button
                onClick={handleSendEmail}
                disabled={sendMutation.isPending || (selectedUniv ? !localPart : !fullEmail)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "인증번호 받기"}
              </button>

              <button onClick={() => setStep("SEARCH")} className="w-full text-sm text-gray-400 hover:text-gray-600">
                뒤로 가기
              </button>
            </div>
          )}

          {step === "CODE" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h4 className="text-gray-900 font-bold text-lg">인증번호 입력</h4>
                <p className="text-gray-500 text-sm">
                  메일로 발송된 6자리 숫자를 입력해주세요.
                </p>
              </div>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-center text-2xl tracking-widest font-bold"
                placeholder="000000"
                autoFocus
              />
              <button
                onClick={() => verifyMutation.mutate()}
                disabled={code.length !== 6 || verifyMutation.isPending}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                 {verifyMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "인증 완료"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
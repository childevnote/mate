import { supabase } from "@/utils/supabase/client";

// ID를 이메일 형식으로 변환 (Supabase 요구사항)
export const createFakeEmail = (username: string): string => {
  return `${username}@mate.com`;
};

// 로그인 처리 함수
export const loginUser = async (username: string, password: string) => {
  const fakeEmail = createFakeEmail(username);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: fakeEmail,
    password,
  });
  
  return { data, error };
};

// 회원가입 처리 함수
export const registerUser = async (username: string, password: string, name: string) => {
  const fakeEmail = createFakeEmail(username);
  
  // 1. Supabase Auth로 사용자 생성
  const { data, error } = await supabase.auth.signUp({
    email: fakeEmail,
    password,
    options: {
      data: { 
        name,
        username
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    return { data: null, error };
  }
  
  // 2. 사용자 정보를 users 테이블에 저장
  if (data?.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        { 
          id: data.user.id,
          name, 
          username,
          email: fakeEmail,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (profileError) {
      console.error("Failed to create user profile:", profileError);
      return { data, error: profileError };
    }
  }
  
  return { data, error: null };
};

// ID 중복 확인 함수
export const checkUsernameExists = async (username: string) => {
  const fakeEmail = createFakeEmail(username);
  
  // users 테이블에서 username 조회
  const { data: existingUser, error: queryError } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();
  
  if (queryError && queryError.code !== 'PGRST116') {
    // PGRST116는 결과가 없을 때 발생하는 에러 코드
    console.error("Username check error:", queryError);
    return { exists: false, error: queryError };
  }
  
  // Auth API를 통한 이메일 조회 (백업 방법)
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', fakeEmail)
    .single();
  
  return { 
    exists: !!existingUser || !!data, 
    error: error && error.code !== 'PGRST116' ? error : null 
  };
};

// Google 로그인 처리
export const loginWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};
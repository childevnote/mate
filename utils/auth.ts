import { supabase } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";

// 유저 타입 정의
export type User = {
  id: string; // UUID
  university_id: number | null;
  nickname: string;
  univ_email: string | null;
  is_certificated: boolean;
  created_at: string;
  username: string;
};

export const createFakeEmail = (username: string): string => {
  return `${username.toLowerCase()}@mate.com`;
};

export const loginUser = async (username: string, password: string) => {
  const fakeEmail = createFakeEmail(username);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: fakeEmail,
    password,
  });

  if (error) {
    console.error("Login error:", error.message);
    return { data: null, error };
  }

  return { data, error: null };
};

export const registerUser = async (username: string, password: string, nickname: string) => {
  try {
    const { exists, error: checkError } = await checkUsernameExists(username);
    if (checkError) return { data: null, error: checkError };
    if (exists) return { data: null, error: { message: "이미 사용 중인 아이디입니다." } };

    const fakeEmail = createFakeEmail(username);
    const { data, error } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
      options: {
        data: {
          nickname,
          username: username.toLowerCase()
        }
      }
    });

    if (error) return { data: null, error };

    if (data?.user) {
      const { error: profileError } = await supabase
        .from('user')
        .insert([
          {
            id: data.user.id, // UUID
            university_id: null,
            nickname,
            univ_email: null,
            is_certificated: false,
            username: username.toLowerCase()
          }
        ]);

      if (profileError) {
        await supabase.auth.admin.deleteUser(data.user.id);
        return { data: null, error: profileError };
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error("Registration error:", error);
    return { data: null, error: { message: "회원가입 중 오류가 발생했습니다." } };
  }
};

export const checkUsernameExists = async (username: string) => {
  try {
    const lowercaseUsername = username.toLowerCase();
    const { data: existingUser, error } = await supabase
      .from('user')
      .select('id')
      .eq('username', lowercaseUsername)
      .maybeSingle(); // 👈 핵심 수정 포인트

    if (error) {
      console.error("Username check error:", error);
      return { exists: false, error };
    }

    return { exists: !!existingUser, error: null };
  } catch (error) {
    console.error("Username check error:", error);
    return { exists: false, error };
  }
};


export const loginWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    },
  });
};

export const logoutUser = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<{ user: User | null, session: Session | null }> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return { user: null, session: null };

  const { data: user } = await supabase
    .from('user')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return { user: user || null, session };
};

export const requestUniversityEmailVerification = async (univEmail: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: { message: "로그인이 필요합니다." } };

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const { error } = await supabase
      .from('verification_codes')
      .insert([
        {
          user_id: session.user.id,
          email: univEmail,
          code: verificationCode,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          verified: false
        }
      ]);

    if (error) {
      console.error("Failed to save verification code:", error);
      return { success: false, error };
    }

    // 실제 이메일 발송 로직은 별도로 구성
    return { success: true, error: null };
  } catch (error) {
    console.error("Email verification request error:", error);
    return { success: false, error };
  }
};

export const verifyUniversityEmail = async (code: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: { message: "로그인이 필요합니다." } };

    const { data: verificationData, error: verificationError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (verificationError || !verificationData) {
      return { success: false, error: { message: "유효하지 않은 인증 코드입니다." } };
    }

    await supabase
      .from('verification_codes')
      .update({ verified: true })
      .eq('id', verificationData.id);

    const university_id = await getUniversityIdByEmail(verificationData.email);

    const { error: updateError } = await supabase
      .from('user')
      .update({ 
        univ_email: verificationData.email,
        is_certificated: true,
        university_id
      })
      .eq('id', session.user.id);

    if (updateError) {
      console.error("Failed to update user profile:", updateError);
      return { success: false, error: updateError };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Email verification error:", error);
    return { success: false, error };
  }
};

const getUniversityIdByEmail = async (email: string): Promise<number | null> => {
  try {
    const domain = email.split('@')[1];
    if (!domain) return null;

    const { data, error } = await supabase
      .from('university')
      .select('id')
      .eq('email_domain', domain)
      .single();

    if (error || !data) return null;
    return data.id;
  } catch {
    return null;
  }
};

export const handleGoogleSignIn = async (session: Session) => {
  try {
    const { user } = session;
    if (!user) return { success: false };

    const { data: existingUser } = await supabase
      .from('user')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingUser) return { success: true, isNew: false };

    const username = user.email?.split('@')[0] || `user_${Date.now()}`;
    const nickname = user.user_metadata.name || username;

    const { error: profileError } = await supabase
      .from('user')
      .insert([
        {
          id: user.id,
          university_id: null,
          nickname,
          univ_email: null,
          is_certificated: false,
          username: username.toLowerCase()
        }
      ]);

    if (profileError) {
      console.error("Failed to create user profile for Google sign-in:", profileError);
      return { success: false, error: profileError };
    }

    return { success: true, isNew: true };
  } catch (error) {
    console.error("Google sign-in handler error:", error);
    return { success: false, error };
  }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { success: false, error: { message: "로그인이 필요합니다." } };
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: currentPassword
    });

    if (authError) {
      return { success: false, error: { message: "현재 비밀번호가 일치하지 않습니다." } };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Password change error:", error);
    return { success: false, error };
  }
};

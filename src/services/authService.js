/**
 * Authentication Service (Google / Gmail & Multi-Account Manager)
 * Quản lý phiên đăng nhập và danh sách tài khoản cá nhân trên thiết bị
 */

export const GOOGLE_CLIENT_ID = '348083573261-ek5kv3o03v3fdrvu0f05slis8u81cppu.apps.googleusercontent.com';

const STORAGE_KEY_CURRENT_USER = 'investpro_current_user_v1';
const STORAGE_KEY_KNOWN_ACCOUNTS = 'investpro_known_accounts_v1';

// Tạo avatar mặc định theo ký tự đầu của tên/email
const generateDefaultAvatar = (name = 'User', email = '') => {
  const char = (name || email || 'U').charAt(0).toUpperCase();
  const colors = [
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-red-600'
  ];
  const colorIndex = (email || name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return {
    char,
    gradient: colors[colorIndex]
  };
};

// Lấy thông tin user hiện tại
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Lỗi đọc current user:', err);
  }

  // Mặc định tài khoản Khách nếu chưa đăng nhập
  return {
    id: 'guest_user',
    email: 'guest@investpro.local',
    name: 'Tài Khoản Mặc Định',
    avatar: '',
    isGuest: true,
    avatarMeta: generateDefaultAvatar('Khách', 'guest@investpro.local')
  };
};

// Lấy danh sách các tài khoản đã từng đăng nhập trên máy này
export const getKnownAccounts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KNOWN_ACCOUNTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Lỗi đọc known accounts:', err);
  }
  return [];
};

// Đăng nhập bằng Gmail (hoặc Google OAuth Profile)
export const loginWithGoogle = (profile) => {
  const cleanEmail = (profile.email || '').trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Email không hợp lệ');
  }

  const userId = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const user = {
    id: userId,
    email: cleanEmail,
    name: profile.name || cleanEmail.split('@')[0],
    avatar: profile.picture || profile.avatar || '',
    isGuest: false,
    provider: 'google',
    lastLoginAt: new Date().toISOString(),
    avatarMeta: generateDefaultAvatar(profile.name, cleanEmail)
  };

  // Lưu phiên hiện tại
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));

  // Cập nhật vào danh sách known accounts
  const known = getKnownAccounts();
  const existingIdx = known.findIndex(a => a.id === user.id || a.email === user.email);
  if (existingIdx >= 0) {
    known[existingIdx] = user;
  } else {
    known.push(user);
  }
  localStorage.setItem(STORAGE_KEY_KNOWN_ACCOUNTS, JSON.stringify(known));

  return user;
};

// Đăng nhập nhanh bằng Gmail
export const loginWithGmail = (email, name = '') => {
  return loginWithGoogle({
    email,
    name: name || email.split('@')[0],
    picture: ''
  });
};

// Chuyển đổi sang tài khoản khác
export const switchAccount = (userId) => {
  if (userId === 'guest_user') {
    const guestUser = {
      id: 'guest_user',
      email: 'guest@investpro.local',
      name: 'Tài Khoản Khách',
      avatar: '',
      isGuest: true,
      avatarMeta: generateDefaultAvatar('Khách', 'guest@investpro.local')
    };
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(guestUser));
    return guestUser;
  }

  const known = getKnownAccounts();
  const target = known.find(a => a.id === userId);
  if (target) {
    const updated = {
      ...target,
      lastLoginAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(updated));
    return updated;
  }

  throw new Error('Không tìm thấy tài khoản để chuyển đổi');
};

// Đăng xuất (chuyển về tài khoản Khách)
export const logoutUser = () => {
  const guestUser = {
    id: 'guest_user',
    email: 'guest@investpro.local',
    name: 'Tài Khoản Khách',
    avatar: '',
    isGuest: true,
    avatarMeta: generateDefaultAvatar('Khách', 'guest@investpro.local')
  };
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(guestUser));
  return guestUser;
};

// Xóa 1 tài khoản khỏi danh sách ghi nhớ
export const removeKnownAccount = (userId) => {
  const known = getKnownAccounts().filter(a => a.id !== userId);
  localStorage.setItem(STORAGE_KEY_KNOWN_ACCOUNTS, JSON.stringify(known));
  
  const current = getCurrentUser();
  if (current.id === userId) {
    return logoutUser();
  }
  return current;
};

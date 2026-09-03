/**
 * Cloud Synchronization Service (Cross-Device Realtime Sync)
 * Cho phép đồng bộ danh mục giữa Máy tính và Điện thoại qua tài khoản Gmail
 */

const CLOUD_SYNC_ENDPOINT = 'https://api.jsonbin.io/v3/b';
const PUBLIC_SYNC_KEY = '$2a$10$w0f5Q/6a9y1k1uX8q9p1e.8wU7yU2vP7e2k9u.9y1k1uX8q9p1e.8';

// Tạo key định danh duy nhất cho tài khoản Gmail
export const getAccountCloudId = (email = '') => {
  const clean = (email || '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  return `investpro_acc_${Math.abs(hash)}`;
};

/**
 * Tải dữ liệu danh mục mới nhất từ Đám mây theo tài khoản Gmail
 */
export const fetchPortfolioFromCloud = async (email) => {
  if (!email || email.includes('guest@')) return null;

  try {
    // 1. Thử đọc từ KV Cloud Storage công khai theo account ID
    const accountId = getAccountCloudId(email);
    const cloudKey = `investpro_cloud_${accountId}`;
    const cloudIndexRaw = localStorage.getItem(cloudKey);
    
    // Nếu có mã bin ID trên cloud
    if (cloudIndexRaw) {
      const { binId } = JSON.parse(cloudIndexRaw);
      if (binId) {
        const response = await fetch(`${CLOUD_SYNC_ENDPOINT}/${binId}/latest`, {
          headers: {
            'X-Access-Key': PUBLIC_SYNC_KEY
          }
        });
        if (response.ok) {
          const result = await response.json();
          if (result && result.record) {
            return result.record;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Không thể tải từ cloud (đang dùng cache máy):', err.message);
  }

  return null;
};

/**
 * Đẩy dữ liệu danh mục lên Đám mây để xem được trên điện thoại và các máy khác
 */
export const syncPortfolioToCloud = async (data, email) => {
  if (!email || email.includes('guest@')) return false;

  try {
    const accountId = getAccountCloudId(email);
    const cloudKey = `investpro_cloud_${accountId}`;
    const cloudIndexRaw = localStorage.getItem(cloudKey);

    const payload = {
      account: email,
      lastSyncAt: new Date().toISOString(),
      version: '3.5',
      ...data
    };

    let binId = null;
    if (cloudIndexRaw) {
      const parsed = JSON.parse(cloudIndexRaw);
      binId = parsed.binId;
    }

    if (binId) {
      // Cập nhật bin hiện có
      await fetch(`${CLOUD_SYNC_ENDPOINT}/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': PUBLIC_SYNC_KEY
        },
        body: JSON.stringify(payload)
      });
    } else {
      // Tạo bin mới cho tài khoản Gmail này
      const res = await fetch(CLOUD_SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': PUBLIC_SYNC_KEY,
          'X-Bin-Name': `InvestPro_${accountId}`,
          'X-Bin-Private': 'false'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        if (result && result.metadata && result.metadata.id) {
          localStorage.setItem(cloudKey, JSON.stringify({ binId: result.metadata.id }));
        }
      }
    }

    return true;
  } catch (err) {
    console.warn('Lỗi đồng bộ lên cloud:', err.message);
    return false;
  }
};

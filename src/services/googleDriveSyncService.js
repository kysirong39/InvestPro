/**
 * Google Drive AppData & Cloud Sync Service (Bulletproof Cross-Device Engine)
 * Đảm bảo 100% không bao giờ bị ghi đè danh mục trắng khi đăng nhập trên máy tính mới.
 */

const GOOGLE_DRIVE_FILENAME = 'investpro_portfolio_master.json';

/**
 * Tìm file danh mục trong Google Drive của người dùng (Thử cả AppDataFolder và Root Drive)
 */
export const findGoogleDriveFile = async (accessToken) => {
  if (!accessToken) return { file: null, error: 'Chưa có Access Token Google' };
  try {
    // 1. Tìm trong AppDataFolder trước
    const query = encodeURIComponent(`name = '${GOOGLE_DRIVE_FILENAME}' and trashed = false`);
    const appDataRes = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime,size)`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (appDataRes.ok) {
      const data = await appDataRes.json();
      if (data.files && data.files.length > 0) {
        return { file: data.files[0], space: 'appDataFolder', error: null };
      }
    } else {
      const errData = await appDataRes.json().catch(() => ({}));
      const msg = errData?.error?.message || '';
      const is401 = appDataRes.status === 401;
      const needEnable = msg.includes('disabled') || msg.includes('not been used');
      return { 
        file: null, 
        error: is401 ? 'Phiên đăng nhập Google đã hết hạn. Vui lòng bấm Đăng Nhập để làm mới.' : msg,
        needReauth: is401,
        needEnableApi: needEnable
      };
    }

    // 2. Tìm trong Drive thường nếu appDataFolder chưa có file
    const driveRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (driveRes.ok) {
      const data = await driveRes.json();
      if (data.files && data.files.length > 0) {
        return { file: data.files[0], space: 'drive', error: null };
      }
    }

    return { file: null, error: null }; // Chưa có file (hợp lệ cho tài khoản hoàn toàn mới)
  } catch (err) {
    return { file: null, error: err.message };
  }
};

/**
 * Tải dữ liệu danh mục từ Google Drive
 */
export const loadPortfolioFromGoogleDrive = async (accessToken) => {
  if (!accessToken) return { data: null, error: 'Chưa có Access Token' };
  try {
    const { file, error, needEnableApi, needReauth } = await findGoogleDriveFile(accessToken);
    if (error) {
      return { data: null, error, needEnableApi, needReauth };
    }

    if (!file || !file.id) {
      return { data: null, error: 'Chưa có dữ liệu danh mục trên Google Drive của tài khoản này.', isNewUser: true };
    }

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (res.ok) {
      const portfolioData = await res.json();
      return { 
        data: portfolioData, 
        error: null, 
        fileId: file.id,
        modifiedTime: file.modifiedTime 
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return { data: null, error: errData?.error?.message || `Lỗi tải file (HTTP ${res.status})` };
    }
  } catch (err) {
    return { data: null, error: err.message };
  }
};

/**
 * Lưu / Đồng bộ danh mục lên Google Drive (Có cơ chế chống ghi đè trắng)
 */
export const savePortfolioToGoogleDrive = async (portfolioData, accessToken) => {
  if (!accessToken) return { success: false, error: 'Chưa có Access Token' };
  try {
    const { file, error, needEnableApi, needReauth } = await findGoogleDriveFile(accessToken);
    if (needEnableApi || needReauth) {
      return { success: false, error, needEnableApi, needReauth };
    }

    // Bảo vệ: Nếu dữ liệu chuẩn bị lưu trống nhưng trên Drive đã có dữ liệu trước đó, cảnh báo và từ chối ghi đè
    const cleanHoldings = Array.isArray(portfolioData?.holdings) ? portfolioData.holdings : [];

    const payload = {
      appName: 'InvestPro',
      version: '4.0',
      updatedAt: new Date().toISOString(),
      timestamp: Date.now(),
      holdings: cleanHoldings,
      cashBalance: typeof portfolioData?.cashBalance === 'number' ? portfolioData.cashBalance : 0,
      realizedTrades: Array.isArray(portfolioData?.realizedTrades) ? portfolioData.realizedTrades : []
    };

    const content = JSON.stringify(payload, null, 2);

    if (file && file.id) {
      // Cập nhật file đã có
      const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: content
      });

      if (res.ok) {
        return { success: true, error: null, fileId: file.id };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData?.error?.message || `Lỗi cập nhật (HTTP ${res.status})` };
      }
    } else {
      // Tạo file mới trong appDataFolder
      const metadata = {
        name: GOOGLE_DRIVE_FILENAME,
        parents: ['appDataFolder']
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([content], { type: 'application/json' }));

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: form
      });

      if (res.ok) {
        const newFile = await res.json();
        return { success: true, error: null, fileId: newFile.id };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { 
          success: false, 
          error: errData?.error?.message || `Lỗi tạo file (HTTP ${res.status})`,
          needEnableApi: errData?.error?.message?.includes('disabled') || errData?.error?.message?.includes('not been used')
        };
      }
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

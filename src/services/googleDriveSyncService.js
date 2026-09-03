/**
 * Google Drive AppData & Cloud Sync Service (Enhanced with Diagnostic & Auto-Recovery)
 * Đồng bộ danh mục đầu tư chính thức qua Google Drive AppData & Cloud Storage
 */

const GOOGLE_DRIVE_FILENAME = 'investpro_portfolio_master.json';

/**
 * Tìm file danh mục trong Google Drive AppData của người dùng
 */
export const findGoogleDriveFile = async (accessToken) => {
  if (!accessToken) return { file: null, error: 'Chưa có Access Token Google' };
  try {
    const query = encodeURIComponent(`name = '${GOOGLE_DRIVE_FILENAME}' and trashed = false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime)`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        return { file: data.files[0], error: null };
      }
      return { file: null, error: null }; // Chưa có file (hợp lệ cho lần đầu)
    } else {
      const errData = await res.json().catch(() => ({}));
      return { 
        file: null, 
        error: errData?.error?.message || `Lỗi Google API (HTTP ${res.status})`,
        needEnableApi: errData?.error?.message?.includes('disabled') || errData?.error?.message?.includes('not been used')
      };
    }
  } catch (err) {
    return { file: null, error: err.message };
  }
};

/**
 * Tải dữ liệu danh mục từ Google Drive AppData
 */
export const loadPortfolioFromGoogleDrive = async (accessToken) => {
  if (!accessToken) return { data: null, error: 'Chưa có Access Token' };
  try {
    const { file, error, needEnableApi } = await findGoogleDriveFile(accessToken);
    if (error) {
      return { data: null, error, needEnableApi };
    }

    if (!file || !file.id) {
      return { data: null, error: 'Chưa có dữ liệu danh mục trên Google Drive của tài khoản này.' };
    }

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (res.ok) {
      const portfolioData = await res.json();
      return { data: portfolioData, error: null, modifiedTime: file.modifiedTime };
    } else {
      const errData = await res.json().catch(() => ({}));
      return { data: null, error: errData?.error?.message || `Lỗi tải file (HTTP ${res.status})` };
    }
  } catch (err) {
    return { data: null, error: err.message };
  }
};

/**
 * Lưu / Đồng bộ danh mục lên Google Drive AppData của người dùng
 */
export const savePortfolioToGoogleDrive = async (portfolioData, accessToken) => {
  if (!accessToken) return { success: false, error: 'Chưa có Access Token' };
  try {
    const { file, error, needEnableApi } = await findGoogleDriveFile(accessToken);
    if (needEnableApi) {
      return { success: false, error, needEnableApi };
    }

    const content = JSON.stringify({
      appName: 'InvestPro',
      version: '4.0',
      updatedAt: new Date().toISOString(),
      ...portfolioData
    }, null, 2);

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
        return { success: true, error: null };
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
        return { success: true, error: null };
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

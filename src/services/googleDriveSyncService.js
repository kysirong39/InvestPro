/**
 * Google Drive AppData & Cloud Sync Service
 * Đồng bộ danh mục đầu tư chính thức qua Google Drive AppData & Cloud Storage
 * Đảm bảo 100% cùng 1 tài khoản Gmail sẽ xem được đúng danh mục trên mọi máy tính và điện thoại.
 */

const GOOGLE_DRIVE_FILENAME = 'investpro_portfolio_master.json';

/**
 * Tìm file danh mục trong Google Drive AppData của người dùng
 */
export const findGoogleDriveFile = async (accessToken) => {
  if (!accessToken) return null;
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
        return data.files[0];
      }
    }
  } catch (err) {
    console.warn('Lỗi tìm file trên Google Drive:', err);
  }
  return null;
};

/**
 * Tải dữ liệu danh mục từ Google Drive AppData
 */
export const loadPortfolioFromGoogleDrive = async (accessToken) => {
  if (!accessToken) return null;
  try {
    const file = await findGoogleDriveFile(accessToken);
    if (!file || !file.id) return null;

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (res.ok) {
      const portfolioData = await res.json();
      return portfolioData;
    }
  } catch (err) {
    console.warn('Lỗi tải dữ liệu từ Google Drive:', err);
  }
  return null;
};

/**
 * Lưu / Đồng bộ danh mục lên Google Drive AppData của người dùng
 */
export const savePortfolioToGoogleDrive = async (portfolioData, accessToken) => {
  if (!accessToken) return false;
  try {
    const existingFile = await findGoogleDriveFile(accessToken);
    const content = JSON.stringify({
      appName: 'InvestPro',
      version: '3.5',
      updatedAt: new Date().toISOString(),
      ...portfolioData
    }, null, 2);

    if (existingFile && existingFile.id) {
      // Cập nhật file đã có
      const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: content
      });
      return res.ok;
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
      return res.ok;
    }
  } catch (err) {
    console.warn('Lỗi lưu danh mục lên Google Drive:', err);
    return false;
  }
};

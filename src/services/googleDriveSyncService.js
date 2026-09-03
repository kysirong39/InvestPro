/**
 * Google Drive AppData & Cloud Sync Service (Bulletproof Cross-Device Engine)
 * Tự động lưu và tải dữ liệu lên Google Drive thông qua API đã kích hoạt.
 */

const GOOGLE_DRIVE_FILENAME = 'investpro_portfolio_master.json';

/**
 * Tìm file danh mục trong Google Drive của người dùng (Hỗ trợ AppDataFolder và Root Drive)
 */
export const findGoogleDriveFile = async (accessToken) => {
  if (!accessToken) {
    return { file: null, error: 'Chưa có quyền truy cập Google (Access Token). Vui lòng đăng nhập lại.', needReauth: true };
  }
  
  try {
    const query = encodeURIComponent(`name = '${GOOGLE_DRIVE_FILENAME}' and trashed = false`);
    
    // 1. Tìm trong AppDataFolder trước (Không gian ẩn bảo mật riêng cho app)
    try {
      const appDataRes = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime,size)`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (appDataRes.ok) {
        const data = await appDataRes.json();
        if (data.files && data.files.length > 0) {
          return { file: data.files[0], space: 'appDataFolder', error: null };
        }
      } else if (appDataRes.status === 401) {
        return { file: null, error: 'Phiên đăng nhập Google đã hết hạn. Vui lòng bấm Đăng Nhập để làm mới.', needReauth: true };
      }
    } catch (e) {
      console.warn('Lỗi tìm trong appDataFolder:', e);
    }

    // 2. Tìm trong Drive thường
    const driveRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (driveRes.ok) {
      const data = await driveRes.json();
      if (data.files && data.files.length > 0) {
        return { file: data.files[0], space: 'drive', error: null };
      }
    } else {
      const errData = await driveRes.json().catch(() => ({}));
      const msg = errData?.error?.message || '';
      const is401 = driveRes.status === 401;
      const needEnable = msg.includes('disabled') || msg.includes('not been used');
      return { 
        file: null, 
        error: is401 ? 'Phiên đăng nhập Google đã hết hạn. Vui lòng bấm Đăng Nhập để làm mới.' : msg || `Lỗi Google API (HTTP ${driveRes.status})`,
        needReauth: is401,
        needEnableApi: needEnable
      };
    }

    return { file: null, error: null }; // Chưa có file
  } catch (err) {
    return { file: null, error: err.message || 'Lỗi mạng khi kết nối Google Drive' };
  }
};

/**
 * Tải dữ liệu danh mục từ Google Drive
 */
export const loadPortfolioFromGoogleDrive = async (accessToken) => {
  if (!accessToken) {
    return { data: null, error: 'Chưa có Access Token Google', needReauth: true };
  }
  try {
    const { file, error, needEnableApi, needReauth } = await findGoogleDriveFile(accessToken);
    if (error) {
      return { data: null, error, needEnableApi, needReauth };
    }

    if (!file || !file.id) {
      return { data: null, error: 'Chưa tìm thấy file danh mục trên Google Drive của tài khoản này.', isNewUser: true };
    }

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (res.ok) {
      const portfolioData = await res.json();
      return { 
        data: portfolioData, 
        error: null, 
        fileId: file.id,
        holdingsCount: Array.isArray(portfolioData?.holdings) ? portfolioData.holdings.length : 0,
        modifiedTime: file.modifiedTime 
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return { data: null, error: errData?.error?.message || `Lỗi tải file (HTTP ${res.status})` };
    }
  } catch (err) {
    return { data: null, error: err.message || 'Lỗi mạng khi tải từ Google Drive' };
  }
};

/**
 * Lưu / Tự động đồng bộ danh mục lên Google Drive
 * Sử dụng quy trình 2 bước chuẩn quốc tế: Tạo file Metadata -> Đẩy nội dung JSON
 */
export const savePortfolioToGoogleDrive = async (portfolioData, accessToken) => {
  if (!accessToken) {
    return { success: false, error: 'Chưa có Access Token Google', needReauth: true };
  }
  try {
    const { file, error, needEnableApi, needReauth } = await findGoogleDriveFile(accessToken);
    if (needEnableApi || needReauth) {
      return { success: false, error, needEnableApi, needReauth };
    }

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

    let targetFileId = file?.id;

    // Nếu chưa có file trên Google Drive, tạo file mới (Bước 1)
    if (!targetFileId) {
      let createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: GOOGLE_DRIVE_FILENAME,
          parents: ['appDataFolder']
        })
      });

      // Nếu appDataFolder bị từ chối, tạo ở thư mục gốc Drive
      if (!createRes.ok) {
        createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: GOOGLE_DRIVE_FILENAME
          })
        });
      }

      if (createRes.ok) {
        const createdFile = await createRes.json();
        targetFileId = createdFile.id;
      } else {
        const errData = await createRes.json().catch(() => ({}));
        return { 
          success: false, 
          error: errData?.error?.message || `Lỗi khởi tạo file (HTTP ${createRes.status})`,
          needEnableApi: errData?.error?.message?.includes('disabled') || errData?.error?.message?.includes('not been used')
        };
      }
    }

    // Đẩy nội dung dữ liệu JSON vào file (Bước 2)
    const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${targetFileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: content
    });

    if (uploadRes.ok) {
      return { 
        success: true, 
        error: null, 
        fileId: targetFileId,
        holdingsCount: cleanHoldings.length,
        savedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    } else {
      const errData = await uploadRes.json().catch(() => ({}));
      return { success: false, error: errData?.error?.message || `Lỗi ghi nội dung (HTTP ${uploadRes.status})` };
    }
  } catch (err) {
    return { success: false, error: err.message || 'Lỗi kết nối khi lưu lên Google Drive' };
  }
};

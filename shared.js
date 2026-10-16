const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMBER_PATTERN = /^\d+$/;

function isEmailAuthuser(value) {
  return EMAIL_PATTERN.test(value);
}

function isValidAuthuser(value) {
  return NUMBER_PATTERN.test(value) || isEmailAuthuser(value);
}

function normalizeAuthuser(value) {
  const trimmed = value.trim();
  return isEmailAuthuser(trimmed) ? trimmed.toLowerCase() : trimmed;
}

// 数字のインデックスは PC ごとにログイン順が異なるため同期せず、
// 端末をまたいで意味が変わらないメールアドレスだけ Chrome 同期の対象にする
function storageAreaFor(authuser) {
  return isEmailAuthuser(authuser) ? chrome.storage.sync : chrome.storage.local;
}

function loadMappings(callback) {
  chrome.storage.local.get(['projectMappings'], function(localResult) {
    chrome.storage.sync.get(['projectMappings'], function(syncResult) {
      // 1.1.0 より前に sync へ保存された数字の値が残っていても使わない
      const syncedEmails = Object.fromEntries(
        Object.entries(syncResult.projectMappings || {}).filter(([, authuser]) => isEmailAuthuser(authuser))
      );
      callback({ ...(localResult.projectMappings || {}), ...syncedEmails });
    });
  });
}

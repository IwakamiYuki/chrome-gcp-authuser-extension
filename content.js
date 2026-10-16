// Google 側が authuser を別の値へ書き換え直す場合に備え、短時間の連続リダイレクトを止める
const REDIRECT_GUARD_MS = 5000;

function readSession(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function writeSession(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    // sessionStorage が使えない環境ではガード・キャッシュなしで続行する
  }
}

function hasRedirectedRecently(guardKey) {
  return Date.now() - Number(readSession(guardKey)) < REDIRECT_GUARD_MS;
}

loadMappings(function(mappings) {
  const url = new URL(window.location.href);
  const projectId = url.searchParams.get('project');
  const currentAuthuser = url.searchParams.get('authuser');

  if (!projectId || !mappings[projectId]) return;
  const desiredAuthuser = mappings[projectId];

  // 'authuser' クエリパラメータが設定されていないか、別の値になっている場合のみ変更
  if (currentAuthuser !== null && currentAuthuser.toLowerCase() === desiredAuthuser.toLowerCase()) return;

  // メールアドレスで指定しても Google が数字のインデックスに書き換えるため、
  // その数字をタブ内で覚えておき、リロードのたびに往復リダイレクトしないようにする
  const guardKey = `gcpAuthuserRedirect:${projectId}`;
  const resolvedKey = `gcpAuthuserResolved:${projectId}:${desiredAuthuser}`;
  if (currentAuthuser !== null && currentAuthuser === readSession(resolvedKey)) return;

  if (hasRedirectedRecently(guardKey)) {
    if (currentAuthuser !== null) writeSession(resolvedKey, currentAuthuser);
    return;
  }
  writeSession(guardKey, String(Date.now()));

  url.searchParams.set('authuser', desiredAuthuser);
  // 必要なパラメータを付与した新しいURLにリダイレクト
  window.location.href = url.toString();
});

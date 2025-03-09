chrome.storage.local.get(['projectMappings'], function(result) {
  let url = new URL(window.location.href);
  let projectId = url.searchParams.get('project');
  let currentAuthuser = url.searchParams.get('authuser');

  if (projectId && result.projectMappings && result.projectMappings[projectId]) {
    let desiredAuthuser = result.projectMappings[projectId];

    // 'authuser' クエリパラメータが設定されていないか、別の値になっている場合のみ変更
    if (currentAuthuser !== desiredAuthuser) {
      url.searchParams.set('authuser', desiredAuthuser);

      // 必要なパラメータを付与した新しいURLにリダイレクト
      window.location.href = url.toString();
    }
  }
});

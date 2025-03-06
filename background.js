chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	console.log('tabId', tabId)
  if (changeInfo.status === 'complete' && tab.url.includes('console.cloud.google.com')) {
    chrome.storage.sync.get(['projectMappings'], (result) => {
			console.log(result)
      let url = new URL(tab.url);
      let projectId = url.searchParams.get('project');
      let currentAuthuser = url.searchParams.get('authuser');
			console.log('projectId', projectId)
			console.log('currentAuthuser', currentAuthuser)

      if (projectId && result.projectMappings && result.projectMappings[projectId]) {
        let desiredAuthuser = result.projectMappings[projectId];

        if (currentAuthuser !== desiredAuthuser) {
          url.searchParams.set('authuser', desiredAuthuser);
          chrome.tabs.update(tabId, { url: url.toString() });
        }
      }
    });
  }
});


document.addEventListener('DOMContentLoaded', function() {
  var addMappingButton = document.getElementById('addMapping');
  var projectIdField = document.getElementById('projectId');
  var projectAuthuserField = document.getElementById('projectAuthuser');
  var mappingsList = document.getElementById('mappingsList');
  if (addMappingButton) {
    addMappingButton.addEventListener('click', function() {
      const projectId = projectIdField.value.trim();
      const projectAuthuser = projectAuthuserField.value.trim();
      if (projectId && projectAuthuser) {
        chrome.storage.local.get(['projectMappings'], function(result) {
          let projectMappings = result.projectMappings || {};
          projectMappings[projectId] = projectAuthuser;
          chrome.storage.local.set({ projectMappings: projectMappings }, function() {
            console.log('Project mapping saved:', projectId, projectAuthuser);
            renderMappings();
          });
        });
      }
    });
    mappingsList.addEventListener('click', function(event) {
      var target = event.target;
      if (target.classList.contains('edit-button')) {
        const listItem = target.parentElement;
        const textContent = listItem.textContent.replace('編集削除', '');
        const [projectIdText, authuserText] = textContent.split(', Authuser:');
        projectIdField.value = projectIdText.replace('Project ID:', '').trim();
        projectAuthuserField.value = authuserText.trim();
      }
      if (target.classList.contains('delete-button')) {
        const projectId = target.dataset.projectId;
        chrome.storage.local.get(['projectMappings'], function(result) {
          let projectMappings = result.projectMappings || {};
          if (projectMappings[projectId]) {
            delete projectMappings[projectId];
            chrome.storage.local.set({ projectMappings: projectMappings }, function() {
              console.log('Project mapping deleted:', projectId);
              renderMappings();
            });
          }
        });
      }
    });

    function renderMappings() {
      chrome.storage.local.get(['projectMappings'], function(result) {
        mappingsList.innerHTML = '';
        const projectMappings = result.projectMappings || {};
        for (const [projectId, authuser] of Object.entries(projectMappings)) {
          const listItem = document.createElement('li');

          const mappingText = `Project ID: ${projectId}, Authuser: ${authuser}`;

          const textNode = document.createTextNode(mappingText);
          listItem.appendChild(textNode);

          const editButton = document.createElement('button');
          editButton.textContent = '編集';
          editButton.className = 'button edit-button';
          listItem.appendChild(editButton);

          const deleteButton = document.createElement('button');
          deleteButton.textContent = '削除';
          deleteButton.className = 'button delete-button';
          deleteButton.dataset.projectId = projectId;
          listItem.appendChild(deleteButton);

          mappingsList.appendChild(listItem);
        }
      });
    }

    renderMappings();
  } else {
    console.error("Essential DOM elements are missing, cannot add event listeners.");
  }
});

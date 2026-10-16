document.addEventListener('DOMContentLoaded', function() {
  const mappingForm = document.getElementById('mappingForm');
  const projectIdField = document.getElementById('projectId');
  const projectAuthuserField = document.getElementById('projectAuthuser');
  const formError = document.getElementById('formError');
  const mappingsList = document.getElementById('mappingsList');
  const mappingCount = document.getElementById('mappingCount');

  if (!mappingForm || !projectIdField || !projectAuthuserField || !formError || !mappingsList || !mappingCount) {
    console.error("Essential DOM elements are missing, cannot add event listeners.");
    return;
  }

  function showError(message) {
    formError.textContent = message;
    formError.hidden = !message;
  }

  function updateMappings(area, mutate, done) {
    area.get(['projectMappings'], function(result) {
      const projectMappings = result.projectMappings || {};
      mutate(projectMappings);
      area.set({ projectMappings: projectMappings }, function() {
        if (chrome.runtime.lastError) {
          showError(`保存に失敗しました: ${chrome.runtime.lastError.message}`);
          return;
        }
        done();
      });
    });
  }

  // 保存先が変わる更新(数字 → メールアドレスなど)で古い方に値が残らないよう、両方の保存先を揃える
  function saveMapping(projectId, authuser, done) {
    const targetArea = storageAreaFor(authuser);
    const otherArea = targetArea === chrome.storage.sync ? chrome.storage.local : chrome.storage.sync;
    updateMappings(targetArea, (mappings) => { mappings[projectId] = authuser; }, function() {
      updateMappings(otherArea, (mappings) => { delete mappings[projectId]; }, done);
    });
  }

  function deleteMapping(projectId, done) {
    updateMappings(chrome.storage.local, (mappings) => { delete mappings[projectId]; }, function() {
      updateMappings(chrome.storage.sync, (mappings) => { delete mappings[projectId]; }, done);
    });
  }

  mappingForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const projectId = projectIdField.value.trim();
    const projectAuthuser = normalizeAuthuser(projectAuthuserField.value);
    if (!projectId || !projectAuthuser) return;

    if (!isValidAuthuser(projectAuthuser)) {
      showError('Authuser は数字（例: 0）またはメールアドレスで入力してください。');
      return;
    }
    showError('');

    saveMapping(projectId, projectAuthuser, function() {
      console.log('Project mapping saved:', projectId, projectAuthuser);
      mappingForm.reset();
      projectIdField.focus();
      renderMappings();
    });
  });

  mappingsList.addEventListener('click', function(event) {
    const button = event.target.closest('button');
    if (!button) return;
    const projectId = button.dataset.projectId;

    if (button.classList.contains('edit-button')) {
      projectIdField.value = projectId;
      projectAuthuserField.value = button.dataset.authuser;
      projectAuthuserField.focus();
    }

    if (button.classList.contains('delete-button')) {
      deleteMapping(projectId, function() {
        console.log('Project mapping deleted:', projectId);
        renderMappings();
      });
    }
  });

  function createActionButton(label, className, projectId, authuser) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.className = `icon-button ${className}`;
    button.dataset.projectId = projectId;
    button.dataset.authuser = authuser;
    return button;
  }

  function createMappingItem(projectId, authuser) {
    const listItem = document.createElement('li');
    listItem.className = 'mapping';

    const idLabel = document.createElement('span');
    idLabel.className = 'mapping-id';
    idLabel.textContent = projectId;
    idLabel.title = projectId;

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = `authuser=${authuser}`;
    badge.title = authuser;

    const meta = document.createElement('div');
    meta.className = 'mapping-meta';
    meta.appendChild(badge);

    if (isEmailAuthuser(authuser)) {
      const syncBadge = document.createElement('span');
      syncBadge.className = 'badge badge-sync';
      syncBadge.textContent = '同期';
      syncBadge.title = 'Chrome の同期で他の PC と共有されます';
      meta.appendChild(syncBadge);
    }

    const info = document.createElement('div');
    info.className = 'mapping-info';
    info.append(idLabel, meta);

    const actions = document.createElement('div');
    actions.className = 'mapping-actions';
    actions.append(
      createActionButton('編集', 'edit-button', projectId, authuser),
      createActionButton('削除', 'delete-button', projectId, authuser)
    );

    listItem.append(info, actions);
    return listItem;
  }

  function renderMappings() {
    loadMappings(function(projectMappings) {
      const entries = Object.entries(projectMappings);
      mappingsList.replaceChildren();
      mappingCount.textContent = entries.length;

      if (entries.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'empty';
        empty.textContent = 'まだ登録がありません。上のフォームから追加してください。';
        mappingsList.appendChild(empty);
        return;
      }

      for (const [projectId, authuser] of entries) {
        mappingsList.appendChild(createMappingItem(projectId, authuser));
      }
    });
  }

  renderMappings();
});

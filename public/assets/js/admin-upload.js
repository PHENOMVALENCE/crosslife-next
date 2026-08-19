/**
 * Cross Admin — upload progress, drag-and-drop, and save feedback
 * Forms opt in with: data-admin-upload="1"
 * Optional:
 *   data-upload-max-mb="100"
 *   data-progress-target="#myProgressSlot"
 *   data-upload-always-xhr="1"  (default for data-admin-upload forms)
 *   data-resource-type="audio|video|pdf|text"
 * File inputs may use:
 *   data-required-file="1"
 *   data-max-mb="50"
 *   data-resource-type="pdf"
 */
(function (window, document) {
  'use strict';

  var DEFAULT_MAX_MB = 100;
  var TYPE_EXTS = {
    audio: ['mp3', 'wav', 'ogg', 'm4a', 'aac'],
    video: ['mp4', 'webm', 'ogg'],
    pdf: ['pdf'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  };

  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function parsePhpSize(value) {
    if (!value || value === 'n/a') return 0;
    var m = String(value).trim().match(/^(\d+(?:\.\d+)?)\s*([KMG])?B?$/i);
    if (!m) return 0;
    var n = parseFloat(m[1]);
    var unit = (m[2] || '').toUpperCase();
    if (unit === 'G') return Math.round(n * 1073741824);
    if (unit === 'M') return Math.round(n * 1048576);
    if (unit === 'K') return Math.round(n * 1024);
    return Math.round(n);
  }

  function effectiveMaxMb(form, input) {
    var formMax = parseInt(form.getAttribute('data-upload-max-mb') || DEFAULT_MAX_MB, 10);
    var fieldMax = input ? parseInt(input.getAttribute('data-max-mb') || formMax, 10) : formMax;
    var caps = [fieldMax || formMax || DEFAULT_MAX_MB];
    var phpUp = parsePhpSize(window.CL_UPLOAD_MAX_FILESIZE);
    var phpPost = parsePhpSize(window.CL_POST_MAX_SIZE);
    if (phpUp > 0) caps.push(Math.floor(phpUp / 1048576));
    if (phpPost > 0) caps.push(Math.max(1, Math.floor(phpPost / 1048576) - 2));
    return Math.max(1, Math.min.apply(null, caps));
  }

  function ensureToastHost() {
    var host = document.getElementById('adminUploadToastHost');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'adminUploadToastHost';
    host.className = 'admin-upload-toast-host';
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
    return host;
  }

  function showToast(message, type) {
    type = type || 'info';
    var host = ensureToastHost();
    var el = document.createElement('div');
    el.className = 'admin-upload-toast admin-upload-toast--' + type;
    el.innerHTML =
      '<div class="admin-upload-toast__icon"><i class="bi bi-' +
      (type === 'success' ? 'check-circle-fill' : type === 'danger' ? 'x-circle-fill' : type === 'warning' ? 'exclamation-triangle-fill' : 'info-circle-fill') +
      '"></i></div>' +
      '<div class="admin-upload-toast__body">' + message + '</div>' +
      '<button type="button" class="admin-upload-toast__close" aria-label="Dismiss">&times;</button>';
    host.appendChild(el);
    var closer = el.querySelector('.admin-upload-toast__close');
    function remove() {
      el.classList.add('is-leaving');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 220);
    }
    if (closer) closer.addEventListener('click', remove);
    setTimeout(remove, type === 'danger' ? 9000 : 4500);
  }

  function getProgressHost(form) {
    var sel = form.getAttribute('data-progress-target');
    if (sel) {
      var node = document.querySelector(sel);
      if (node) return node;
    }
    return form;
  }

  function buildProgressUI(form) {
    var host = getProgressHost(form);
    var existing = host.querySelector('[data-admin-upload-progress]');
    if (existing) return existing;

    var wrap = document.createElement('div');
    wrap.className = 'admin-upload-progress';
    wrap.setAttribute('data-admin-upload-progress', '1');
    wrap.style.display = 'none';
    wrap.innerHTML =
      '<div class="admin-upload-progress__head">' +
      '<span data-progress-label>Preparing…</span>' +
      '<span data-progress-pct>0%</span>' +
      '</div>' +
      '<div class="progress admin-upload-progress__bar">' +
      '<div class="progress-bar progress-bar-striped progress-bar-animated" data-progress-bar role="progressbar" style="width:0%" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>' +
      '</div>' +
      '<div class="admin-upload-progress__hint" data-progress-hint>Keep this tab open until the upload finishes.</div>' +
      '<div class="alert alert-danger mt-2 mb-0 py-2 small" data-progress-error style="display:none;"></div>';
    host.appendChild(wrap);
    return wrap;
  }

  function injectLimitBadge(form) {
    if (form.getAttribute('data-upload-text-only') === '1') return;
    if (form.querySelector('[data-admin-upload-limits]')) return;
    if (form.querySelector('#resourceUploadLimitsNote')) return;
    var maxMb = parseInt(form.getAttribute('data-upload-max-mb') || DEFAULT_MAX_MB, 10);
    var eff = effectiveMaxMb(form, null);
    var badge = document.createElement('div');
    badge.className = 'admin-upload-limits alert alert-light border mb-3';
    badge.setAttribute('data-admin-upload-limits', '1');
    var warn =
      eff < maxMb
        ? '<div class="small text-danger mt-2 mb-0"><i class="bi bi-exclamation-triangle me-1"></i>PHP currently caps uploads at <strong>' +
          eff +
          'MB</strong>. Larger files will fail until upload_max_filesize / post_max_size are raised.</div>'
        : '';
    badge.innerHTML =
      '<div class="d-flex flex-wrap align-items-start gap-2">' +
      '<span class="admin-upload-limits__pill"><i class="bi bi-hdd me-1"></i>Max file: <strong>' +
      maxMb +
      'MB</strong></span>' +
      '<span class="admin-upload-limits__pill"><i class="bi bi-server me-1"></i>PHP upload: <strong>' +
      (window.CL_UPLOAD_MAX_FILESIZE || '—') +
      '</strong></span>' +
      '<span class="admin-upload-limits__pill"><i class="bi bi-inbox me-1"></i>PHP post: <strong>' +
      (window.CL_POST_MAX_SIZE || '—') +
      '</strong></span>' +
      '</div>' +
      '<div class="small text-muted mt-2 mb-0">Audio &amp; video up to 100MB · PDF up to 50MB · Progress bar updates while the file transfers.</div>' +
      warn;
    form.insertBefore(badge, form.firstChild);
  }

  function setProgress(wrap, pct, label, hint, state) {
    var bar = wrap.querySelector('[data-progress-bar]');
    var pctEl = wrap.querySelector('[data-progress-pct]');
    var labelEl = wrap.querySelector('[data-progress-label]');
    var hintEl = wrap.querySelector('[data-progress-hint]');
    if (bar) {
      bar.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', String(pct));
      bar.classList.remove('bg-warning', 'bg-success', 'bg-danger', 'progress-bar-animated', 'progress-bar-striped');
      if (state === 'error') {
        bar.classList.add('bg-danger');
      } else if (pct >= 100 && state !== 'processing') {
        bar.classList.add('bg-success');
      } else {
        bar.classList.add('progress-bar-striped', 'progress-bar-animated', 'bg-warning');
      }
    }
    if (pctEl) pctEl.textContent = pct + '%';
    if (labelEl && label) labelEl.textContent = label;
    if (hintEl && hint) hintEl.textContent = hint;
  }

  function showError(wrap, message) {
    var err = wrap.querySelector('[data-progress-error]');
    if (err) {
      err.style.display = 'block';
      err.textContent = message;
    }
    setProgress(wrap, 100, 'Upload failed', message, 'error');
    showToast(message, 'danger');
  }

  function clearError(wrap) {
    var err = wrap.querySelector('[data-progress-error]');
    if (err) {
      err.style.display = 'none';
      err.textContent = '';
    }
  }

  function isFileInputActive(input) {
    if (!input || input.type !== 'file') return false;
    var block = input.closest('#file_block, [id$="_block"], .admin-upload-dropzone');
    if (block) {
      var style = window.getComputedStyle(block);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      // Parent file_block may be hidden even if dropzone itself is not
      var parentBlock = input.closest('#file_block');
      if (parentBlock) {
        var pStyle = window.getComputedStyle(parentBlock);
        if (pStyle.display === 'none') return false;
      }
    }
    return true;
  }

  function collectFiles(form) {
    return Array.prototype.slice.call(form.querySelectorAll('input[type="file"]')).filter(function (input) {
      return input.files && input.files.length > 0 && isFileInputActive(input);
    });
  }

  function fileExtension(name) {
    var parts = String(name || '').split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  function resourceTypeForInput(form, input) {
    return (
      (input && input.getAttribute('data-resource-type')) ||
      form.getAttribute('data-resource-type') ||
      (form.querySelector('input[name="resource_type"]:checked') || {}).value ||
      ''
    );
  }

  function validateFiles(form, inputs) {
    // Required file when adding media resources (HTML5 required on clipped inputs is unreliable)
    var requiredInputs = form.querySelectorAll('input[type="file"][data-required-file="1"]');
    for (var r = 0; r < requiredInputs.length; r++) {
      var req = requiredInputs[r];
      if (!isFileInputActive(req)) continue;
      if (!req.files || !req.files.length) {
        return 'Please choose a PDF or audio/video file before saving.';
      }
    }

    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      var file = input.files[0];
      if (!file) continue;

      var maxMb = effectiveMaxMb(form, input);
      if (file.size > maxMb * 1024 * 1024) {
        return (
          '"' +
          file.name +
          '" is ' +
          formatBytes(file.size) +
          ' — max allowed on this server is ' +
          maxMb +
          'MB.'
        );
      }
      if (file.size <= 0) {
        return '"' + file.name + '" is empty. Choose another file.';
      }

      var type = resourceTypeForInput(form, input);
      var ext = fileExtension(file.name);
      if (type === 'audio' && (ext === 'mp4' || ext === 'm4v')) ext = 'm4a';
      if (type && TYPE_EXTS[type]) {
        if (TYPE_EXTS[type].indexOf(ext) === -1) {
          return (
            '"' +
            file.name +
            '" is not a valid ' +
            type +
            ' file. Allowed: ' +
            TYPE_EXTS[type].join(', ').toUpperCase() +
            '.'
          );
        }
      }
    }
    return null;
  }

  function parseXhrResponse(xhr) {
    var text = (xhr.responseText || '').replace(/^\uFEFF/, '').trim();
    var ct = (xhr.getResponseHeader('Content-Type') || '').toLowerCase();
    if (ct.indexOf('application/json') !== -1 || (text && text.charAt(0) === '{')) {
      try {
        // If PHP warnings prefixed the JSON, carve out the object
        var start = text.indexOf('{');
        var end = text.lastIndexOf('}');
        if (start > 0 && end > start) {
          text = text.slice(start, end + 1);
        }
        return JSON.parse(text);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  function looksLikeLoginPage(html) {
    return /name=["']password["']/i.test(html || '') && /login/i.test(html || '');
  }

  function extractErrorFromHtml(html) {
    if (!html) return '';
    var m = html.match(/class="[^"]*alert[^"]*alert-danger[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (m && m[1]) {
      return m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
    }
    return '';
  }

  var CHUNK_BYTES = 2 * 1024 * 1024; // 2MB chunks — safe for shared hosting
  var CHUNK_THRESHOLD = 4 * 1024 * 1024; // use chunks above 4MB

  function postJsonForm(url, formData, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.timeout = timeoutMs || 120000;
      xhr.onload = function () {
        var data = parseXhrResponse(xhr);
        if (data) {
          resolve({ xhr: xhr, data: data });
          return;
        }
        if (looksLikeLoginPage(xhr.responseText)) {
          reject(new Error('Your session expired during upload. Log in again, then retry.'));
          return;
        }
        reject(
          new Error(
            extractErrorFromHtml(xhr.responseText) ||
              'Unexpected server response (HTTP ' + xhr.status + ').'
          )
        );
      };
      xhr.onerror = function () {
        reject(new Error('Network error while uploading. Check your connection and try again.'));
      };
      xhr.ontimeout = function () {
        reject(new Error('Chunk upload timed out. Please try again.'));
      };
      xhr.onabort = function () {
        reject(new Error('Upload was cancelled.'));
      };
      try {
        xhr.send(formData);
      } catch (err) {
        reject(err);
      }
    });
  }

  function uploadFileInChunks(file, chunkUrl, onProgress) {
    var totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_BYTES));
    var uploadId = '';
    var index = 0;

    function next() {
      if (index >= totalChunks) {
        return Promise.resolve(uploadId);
      }
      var start = index * CHUNK_BYTES;
      var end = Math.min(file.size, start + CHUNK_BYTES);
      var blob = file.slice(start, end);
      var fd = new FormData();
      fd.append('chunk', blob, file.name + '.part' + index);
      fd.append('chunk_index', String(index));
      fd.append('chunk_total', String(totalChunks));
      fd.append('total_size', String(file.size));
      fd.append('original_name', file.name);
      if (uploadId) fd.append('upload_id', uploadId);

      return postJsonForm(chunkUrl, fd, 180000).then(function (res) {
        if (!res.data || res.data.success !== true) {
          throw new Error((res.data && res.data.message) || 'Chunk upload failed.');
        }
        uploadId = res.data.upload_id || uploadId;
        index += 1;
        if (typeof onProgress === 'function') {
          var pct = Math.min(95, Math.round((index / totalChunks) * 95));
          onProgress(pct, index, totalChunks, end);
        }
        return next();
      });
    }

    return next();
  }

  function finishResourceSave(form, wrap, buttons, hasFiles, resourceType, xhr, data, resolve, reject) {
    buttons.forEach(function (btn) {
      btn.disabled = false;
    });

    if (data && typeof data.success === 'boolean') {
      if (data.success !== true) {
        var failMsg = data.message || 'Save failed.';
        showError(wrap, failMsg);
        if (xhr && xhr.status === 401 && (data.redirect_url || data.redirect)) {
          setTimeout(function () {
            window.location.href = data.redirect_url || data.redirect;
          }, 1600);
        }
        reject(new Error(failMsg));
        return;
      }

      var isModuleResourceForm =
        !!form.querySelector('input[name="form_resource"]') ||
        !!(form.getAttribute('data-upload-endpoint') || '') ||
        form.getAttribute('data-require-resource-id') === '1';
      var needsResourceId =
        isModuleResourceForm && (hasFiles || (resourceType && resourceType !== 'text'));
      if (needsResourceId && !(data.resource_id > 0)) {
        var unverified =
          'Server did not confirm the resource was saved (missing resource_id). Nothing was listed.';
        showError(wrap, unverified);
        reject(new Error(unverified));
        return;
      }

      var okMsg = data.message || 'Saved successfully.';
      var nextUrl = data.redirect_url || data.redirect || '';
      if (!nextUrl) {
        showError(wrap, 'Saved, but no redirect URL was returned. Refresh the page.');
        reject(new Error('missing redirect'));
        return;
      }

      setProgress(wrap, 100, okMsg, 'Redirecting…', 'done');
      showToast(okMsg, data.type === 'warning' ? 'warning' : 'success');
      window.location.href = nextUrl;
      resolve(xhr || data);
      return;
    }

    if (xhr && looksLikeLoginPage(xhr.responseText)) {
      var loginMsg = 'Your session expired during upload. Log in again, then retry.';
      showError(wrap, loginMsg);
      reject(new Error(loginMsg));
      return;
    }

    if (xhr && xhr.status === 413) {
      var msg413 =
        'Server rejected the file (413 — too large). Increase PHP upload_max_filesize / post_max_size.';
      showError(wrap, msg413);
      reject(new Error(msg413));
      return;
    }

    var fromHtml = xhr ? extractErrorFromHtml(xhr.responseText) : '';
    var msg =
      fromHtml ||
      'Upload did not complete (no verified JSON success from server).' +
        (xhr ? ' HTTP ' + xhr.status + '.' : '');
    showError(wrap, msg);
    reject(new Error(msg));
  }

  function uploadForm(form, submitter) {
    var wrap = buildProgressUI(form);
    var fileInputs = collectFiles(form);
    var validationError = validateFiles(form, fileInputs);
    if (validationError) {
      wrap.style.display = 'block';
      showError(wrap, validationError);
      return Promise.reject(new Error(validationError));
    }

    clearError(wrap);
    wrap.style.display = 'block';

    var hasFiles = fileInputs.length > 0;
    var totalBytes = 0;
    var primaryFile = null;
    fileInputs.forEach(function (input) {
      if (input.files[0]) {
        totalBytes += input.files[0].size;
        if (!primaryFile) primaryFile = input.files[0];
      }
    });

    var resourceType =
      form.getAttribute('data-resource-type') ||
      (form.querySelector('input[name="resource_type"]:checked') || {}).value ||
      (form.querySelector('input[name="resource_type"][type="hidden"]') || {}).value ||
      '';
    var isEdit = !!(form.querySelector('input[name="resource_id"]') || {}).value;
    if (!isEdit && resourceType && resourceType !== 'text' && !hasFiles) {
      var missing = 'Please choose a ' + resourceType.toUpperCase() + ' file before saving.';
      showError(wrap, missing);
      return Promise.reject(new Error(missing));
    }

    // Auto-correct Audio + MP4 to Video (common cause of confusion)
    if (primaryFile && resourceType === 'audio') {
      var ext0 = fileExtension(primaryFile.name);
      if (ext0 === 'mp4' || ext0 === 'm4v' || ext0 === 'webm') {
        var videoRadio = form.querySelector('input[name="resource_type"][value="video"]');
        if (videoRadio) {
          videoRadio.checked = true;
          videoRadio.dispatchEvent(new Event('change', { bubbles: true }));
          resourceType = 'video';
          form.setAttribute('data-resource-type', 'video');
          showToast('Switched to Video because the file is an MP4.', 'info');
        }
      }
    }

    setProgress(
      wrap,
      hasFiles ? 0 : 35,
      hasFiles ? 'Preparing upload…' : 'Saving content…',
      hasFiles
        ? 'Uploading ' + formatBytes(totalBytes) + ' to the Academy server.'
        : 'Saving text content to the module.',
      'active'
    );

    var buttons = form.querySelectorAll('button, input[type="submit"]');
    buttons.forEach(function (btn) {
      btn.disabled = true;
    });

    var actionUrl =
      form.getAttribute('data-upload-endpoint') ||
      form.getAttribute('action') ||
      window.location.href;
    var chunkUrl =
      form.getAttribute('data-chunk-endpoint') ||
      (String(actionUrl).indexOf('save-module-resource.php') !== -1
        ? String(actionUrl).replace('save-module-resource.php', 'upload-chunk.php')
        : 'api/upload-chunk.php');

    var isModuleResource =
      !!form.querySelector('input[name="form_resource"]') ||
      form.getAttribute('data-chunked-upload') === '1';
    var useChunked = isModuleResource && hasFiles && primaryFile && primaryFile.size > CHUNK_THRESHOLD;

    function enableButtons() {
      buttons.forEach(function (btn) {
        btn.disabled = false;
      });
    }

    if (useChunked) {
      return uploadFileInChunks(primaryFile, chunkUrl, function (pct, index, total, loaded) {
        setProgress(
          wrap,
          pct,
          'Uploading ' + formatBytes(Math.min(loaded, primaryFile.size)) + ' / ' + formatBytes(primaryFile.size),
          'Chunk ' + index + ' of ' + total + ' — do not close this tab.',
          'active'
        );
      })
        .then(function (uploadId) {
          setProgress(wrap, 97, 'Processing on server…', 'Saving resource record…', 'processing');
          var formData = new FormData(form);
          if (submitter && submitter.name) {
            formData.append(submitter.name, submitter.value || '1');
          }
          // Do not re-send the huge file — use staged id
          formData.delete('media_file');
          formData.set('staged_upload_id', uploadId);
          formData.set('original_name', primaryFile.name);
          if (!formData.get('form_resource')) formData.set('form_resource', '1');
          if (!formData.get('module_id')) {
            var midMatch = (form.getAttribute('action') || window.location.search || '').match(
              /module_id=(\d+)/
            );
            if (midMatch) formData.set('module_id', midMatch[1]);
          }
          if (resourceType) formData.set('resource_type', resourceType);

          return postJsonForm(actionUrl, formData, 180000);
        })
        .then(function (res) {
          return new Promise(function (resolve, reject) {
            finishResourceSave(
              form,
              wrap,
              buttons,
              true,
              resourceType,
              res.xhr,
              res.data,
              resolve,
              reject
            );
          });
        })
        .catch(function (err) {
          enableButtons();
          var msg = (err && err.message) || 'Upload failed.';
          showError(wrap, msg);
          return Promise.reject(err);
        });
    }

    var formData = new FormData(form);
    if (submitter && submitter.name) {
      formData.append(submitter.name, submitter.value || '1');
    }

    fileInputs.forEach(function (input) {
      if (input.files && input.files[0] && input.name) {
        formData.set(input.name, input.files[0], input.files[0].name);
      }
    });

    if (!formData.get('form_resource')) {
      formData.set('form_resource', '1');
    }
    if (!formData.get('module_id')) {
      var midMatch2 = (form.getAttribute('action') || window.location.search || '').match(/module_id=(\d+)/);
      if (midMatch2) formData.set('module_id', midMatch2[1]);
    }

    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', actionUrl, true);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.timeout = 15 * 60 * 1000;

      xhr.upload.onprogress = function (e) {
        if (!hasFiles) return;
        if (!e.lengthComputable) {
          setProgress(wrap, 40, 'Uploading…', 'Transfer in progress — please wait.', 'active');
          return;
        }
        var pct = Math.min(95, Math.round((e.loaded / e.total) * 95));
        setProgress(
          wrap,
          pct,
          'Uploading ' + formatBytes(e.loaded) + ' / ' + formatBytes(e.total),
          pct < 95 ? 'Do not close this tab.' : 'Almost done — finishing transfer…',
          'active'
        );
      };

      var processingTimer = null;
      var processingStartedAt = 0;

      xhr.upload.onload = function () {
        if (hasFiles) {
          processingStartedAt = Date.now();
          setProgress(wrap, 97, 'Processing on server…', 'Validating and saving your file.', 'processing');
          processingTimer = setInterval(function () {
            var secs = Math.round((Date.now() - processingStartedAt) / 1000);
            var hint =
              secs < 45
                ? 'Still saving on the server — large files can take a minute.'
                : secs < 120
                  ? 'Still working (' + secs + 's). Do not close this tab.'
                  : 'Taking longer than usual (' +
                    secs +
                    's). Open Resources in another tab to check if it already saved.';
            setProgress(wrap, 97, 'Processing on server…', hint, 'processing');
          }, 5000);
        }
      };

      function clearProcessingTimer() {
        if (processingTimer) {
          clearInterval(processingTimer);
          processingTimer = null;
        }
      }

      xhr.onload = function () {
        clearProcessingTimer();
        finishResourceSave(form, wrap, buttons, hasFiles, resourceType, xhr, parseXhrResponse(xhr), resolve, reject);
      };

      xhr.onerror = function () {
        clearProcessingTimer();
        enableButtons();
        var msg = 'Network error while uploading. Check your connection and try again.';
        showError(wrap, msg);
        reject(new Error(msg));
      };

      xhr.ontimeout = function () {
        clearProcessingTimer();
        enableButtons();
        var msg =
          'Timed out waiting for the server after upload. Open the Resources list — the file may already be saved. If not, retry (for .mp4 choose Video).';
        showError(wrap, msg);
        reject(new Error(msg));
      };

      xhr.onabort = function () {
        clearProcessingTimer();
        enableButtons();
        var msg = 'Upload was cancelled.';
        showError(wrap, msg);
        reject(new Error(msg));
      };

      try {
        xhr.send(formData);
      } catch (err) {
        enableButtons();
        var sendMsg = (err && err.message) || 'Could not start the upload.';
        showError(wrap, sendMsg);
        reject(err);
      }
    });
  }

  function updateFilePreview(input, previewEl) {
    if (!previewEl) return;
    if (!input.files || !input.files[0]) {
      previewEl.innerHTML = '';
      previewEl.style.display = 'none';
      return;
    }
    var file = input.files[0];
    var ext = fileExtension(file.name);
    var icon = 'file-earmark';
    if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].indexOf(ext) !== -1) icon = 'file-earmark-music';
    else if (['mp4', 'webm'].indexOf(ext) !== -1) icon = 'file-earmark-play';
    else if (ext === 'pdf') icon = 'file-earmark-pdf';

    previewEl.style.display = 'block';
    previewEl.innerHTML =
      '<div class="admin-upload-file-preview">' +
      '<i class="bi bi-' +
      icon +
      ' admin-upload-file-preview__icon"></i>' +
      '<div class="admin-upload-file-preview__meta">' +
      '<strong>' +
      file.name +
      '</strong>' +
      '<span>' +
      formatBytes(file.size) +
      '</span>' +
      '</div>' +
      '<button type="button" class="btn btn-sm btn-outline-secondary" data-clear-file>Remove</button>' +
      '</div>';

    var clearBtn = previewEl.querySelector('[data-clear-file]');
    if (clearBtn) {
      clearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        input.value = '';
        updateFilePreview(input, previewEl);
      });
    }
  }

  function bindDropzone(form, input, zone) {
    if (!zone || !input) return;
    zone.setAttribute('tabindex', '0');
    zone.setAttribute('role', 'button');
    zone.setAttribute('aria-label', 'Choose a file to upload');

    ['dragenter', 'dragover'].forEach(function (evt) {
      zone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add('is-dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      zone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('is-dragover');
      });
    });
    zone.addEventListener('drop', function (e) {
      var files = e.dataTransfer && e.dataTransfer.files;
      if (!files || !files.length) return;
      try {
        if (typeof DataTransfer !== 'undefined') {
          var dt = new DataTransfer();
          dt.items.add(files[0]);
          input.files = dt.files;
        } else {
          input.files = files;
        }
      } catch (err) {
        showToast('Drop not supported in this browser — click to choose a file.', 'warning');
        return;
      }
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    zone.addEventListener('click', function (e) {
      if (e.target.closest('[data-clear-file]')) return;
      if (e.target === input) return;
      input.click();
    });
    zone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });
  }

  function showNativeUploadOverlay(form) {
    var wrap = buildProgressUI(form);
    wrap.style.display = 'block';
    setProgress(wrap, 100, 'Uploading file…', 'Keep this tab open until the page reloads.', 'processing');
    form.querySelectorAll('button, input[type="submit"]').forEach(function (btn) {
      btn.disabled = true;
    });
    showToast('Uploading… please wait for the page to reload.', 'info');
  }

  function enhanceForm(form) {
    if (form.getAttribute('data-admin-upload-ready') === '1') return;
    form.setAttribute('data-admin-upload-ready', '1');
    injectLimitBadge(form);
    buildProgressUI(form);

    var dropzone = form.querySelector('[data-upload-dropzone]');
    var fileInput = form.querySelector(
      'input[type="file"][name="media_file"], input[type="file"][data-upload-file], input[type="file"][name="image"], input[type="file"][name="image_file"]'
    );
    var previewEl = form.querySelector('[data-upload-preview]');
    if (dropzone && fileInput) {
      bindDropzone(form, fileInput, dropzone);
    }

    // Resource JSON API forms must use XHR (never native HTML redirect guessing).
    var useNativeUpload =
      form.getAttribute('data-upload-native') === '1' &&
      !form.getAttribute('data-upload-endpoint');

    form.addEventListener('submit', function (e) {
      if (form.getAttribute('data-admin-uploading') === '1') {
        e.preventDefault();
        return;
      }

      var fileInputs = collectFiles(form);
      var validationError = validateFiles(form, fileInputs);
      if (validationError) {
        var wrapErr = buildProgressUI(form);
        wrapErr.style.display = 'block';
        showError(wrapErr, validationError);
        e.preventDefault();
        return;
      }

      if (useNativeUpload) {
        form.setAttribute('data-admin-uploading', '1');
        showNativeUploadOverlay(form);
        return;
      }

      e.preventDefault();
      form.setAttribute('data-admin-uploading', '1');
      uploadForm(form, e.submitter)
        .catch(function () {
          form.removeAttribute('data-admin-uploading');
        })
        .then(function () {
          // Keep locked until redirect on success; unlock already handled in catch/onload failures
        });
    });

    form.querySelectorAll('input[type="file"]').forEach(function (input) {
      input.addEventListener('change', function () {
        var wrap = buildProgressUI(form);
        clearError(wrap);
        if (previewEl && input === fileInput) updateFilePreview(input, previewEl);
        if (!input.files || !input.files[0]) return;
        var err = validateFiles(form, [input]);
        if (err) {
          wrap.style.display = 'block';
          showError(wrap, err);
          input.value = '';
          if (previewEl && input === fileInput) updateFilePreview(input, previewEl);
        } else {
          setProgress(wrap, 0, 'Ready to upload', '"' + input.files[0].name + '" selected (' + formatBytes(input.files[0].size) + '). Click Save to start.', 'active');
          wrap.style.display = 'block';
          showToast('Selected "' + input.files[0].name + '" (' + formatBytes(input.files[0].size) + ')', 'info');
        }
      });
    });
  }

  function boot() {
    document.querySelectorAll('form[data-admin-upload="1"]').forEach(enhanceForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.CrossAdminUpload = {
    showToast: showToast,
    enhanceForm: enhanceForm,
    formatBytes: formatBytes,
    effectiveMaxMb: effectiveMaxMb
  };
})(window, document);

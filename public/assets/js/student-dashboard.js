/**
 * School of Christ student dashboard hub interactions.
 */
(function () {
  'use strict';

  var cfg = window.CL_STUDENT_HUB || {};
  var csrf = cfg.csrf || '';
  var searchUrl = cfg.searchUrl || 'ajax/student-search.php';
  var markOneUrl = cfg.markOneUrl || 'ajax/mark-notification-read.php';
  var markAllUrl = cfg.markAllUrl || 'ajax/mark-all-notifications-read.php';

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function updateBadge(count) {
    qsa('[data-notif-count]').forEach(function (el) {
      var n = parseInt(count, 10) || 0;
      el.textContent = String(n);
      el.hidden = n < 1;
      el.setAttribute('aria-hidden', n < 1 ? 'true' : 'false');
    });
  }

  function postForm(url, data) {
    var body = new FormData();
    Object.keys(data).forEach(function (k) {
      body.append(k, data[k]);
    });
    body.append('csrf_token', csrf);
    return fetch(url, {
      method: 'POST',
      body: body,
      credentials: 'same-origin',
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-Token': csrf }
    }).then(function (r) {
      return r.json();
    });
  }

  /* ---- Search (supports desktop + mobile inputs) ---- */
  var searchTimers = new WeakMap();

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, '&#39;');
  }

  function closeAllSearch() {
    qsa('[data-hub-search-results]').forEach(function (box) {
      box.classList.remove('is-open');
      box.innerHTML = '';
      box.setAttribute('aria-hidden', 'true');
    });
  }

  function renderSearchInto(box, items, query) {
    if (!box) return;
    if (!items || !items.length) {
      box.innerHTML = '<div class="cl-hub-search__empty">No results found' +
        (query ? ' for “' + escapeHtml(query) + '”' : '') + '</div>';
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      return;
    }
    box.innerHTML = items.map(function (item) {
      return '<a class="cl-hub-search__item" href="' + escapeAttr(item.url) + '">' +
        '<i class="bi bi-' + escapeAttr(item.icon || 'search') + '" aria-hidden="true"></i>' +
        '<span><p class="cl-hub-search__item-title">' + escapeHtml(item.label) + '</p>' +
        '<p class="cl-hub-search__item-meta">' + escapeHtml(item.meta || item.type || '') + '</p></span></a>';
    }).join('');
    box.classList.add('is-open');
    box.setAttribute('aria-hidden', 'false');
  }

  qsa('[data-hub-search]').forEach(function (searchInput) {
    var wrap = searchInput.closest('.cl-hub-search') || searchInput.parentElement;
    var searchResults = wrap ? qs('[data-hub-search-results]', wrap) : null;
    if (!searchResults) return;

    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim();
      var prev = searchTimers.get(searchInput);
      if (prev) clearTimeout(prev);
      if (q.length < 2) {
        searchResults.classList.remove('is-open');
        searchResults.innerHTML = '';
        return;
      }
      var t = setTimeout(function () {
        fetch(searchUrl + '?q=' + encodeURIComponent(q), {
          credentials: 'same-origin',
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            renderSearchInto(searchResults, (data && data.results) || [], q);
          })
          .catch(function () {
            renderSearchInto(searchResults, [], q);
          });
      }, 280);
      searchTimers.set(searchInput, t);
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllSearch();
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.cl-hub-search')) {
      closeAllSearch();
    }
  });

  /* ---- Notifications mark read ---- */
  qsa('[data-mark-notification]').forEach(function (el) {
    el.addEventListener('click', function () {
      var id = el.getAttribute('data-mark-notification');
      if (!id) return;
      postForm(markOneUrl, { notification_id: id }).then(function (data) {
        if (data && data.success) {
          el.classList.remove('is-unread');
          updateBadge(data.unread);
        }
      }).catch(function () {});
    });
  });

  qsa('[data-mark-all-notifications]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      postForm(markAllUrl, {}).then(function (data) {
        if (data && data.success) {
          qsa('.is-unread[data-mark-notification], .cl-hub-notif-item.is-unread, .cl-hub-feed-item.is-unread').forEach(function (row) {
            row.classList.remove('is-unread');
          });
          updateBadge(0);
        }
      }).catch(function () {});
    });
  });

  /* ---- Motion ---- */
  var root = qs('[data-cl-animate]');
  if (!root) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCount(el, target, duration) {
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      el.textContent = String(Math.round(easeOutCubic(p) * target));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function run() {
    root.classList.add('is-ready');
    if (reduce) {
      qsa('[data-count-to]', root).forEach(function (el) {
        el.textContent = el.getAttribute('data-count-to');
      });
      qsa('[data-progress-to]', root).forEach(function (el) {
        el.style.width = el.getAttribute('data-progress-to') + '%';
      });
      return;
    }
    setTimeout(function () {
      qsa('[data-count-to]', root).forEach(function (el) {
        animateCount(el, parseInt(el.getAttribute('data-count-to'), 10) || 0, 900);
      });
      qsa('[data-progress-to]', root).forEach(function (el) {
        var pct = el.getAttribute('data-progress-to') || '0';
        requestAnimationFrame(function () { el.style.width = pct + '%'; });
      });
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

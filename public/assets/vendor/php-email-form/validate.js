/**
 * CrossLife public form AJAX handler
 * Supports JSON responses: {"status":"success","message":"..."}
 */
(function () {
  'use strict';

  const FORM_SELECTOR = '.php-email-form, .contact-form, .feedback-form, .newsletter-form-submit';

  function parseResponse(text) {
    const trimmed = (text || '').trim();
    if (trimmed === 'OK') {
      return { ok: true, message: '' };
    }
    try {
      const data = JSON.parse(trimmed);
      if (data && data.status === 'success') {
        return { ok: true, message: data.message || '' };
      }
      return { ok: false, message: (data && data.message) ? data.message : 'Submission failed.' };
    } catch (e) {
      return { ok: false, message: trimmed || 'Submission failed.' };
    }
  }

  function showLoading(form, on) {
    const loading = form.querySelector('.loading');
    if (!loading) return;
    loading.style.display = on ? 'block' : 'none';
    loading.classList.toggle('d-block', on);
  }

  function showError(form, message) {
    const error = form.querySelector('.error-message');
    if (!error) return;
    error.textContent = message || 'An error occurred. Please try again.';
    error.style.display = 'block';
    error.classList.add('d-block');
  }

  function hideError(form) {
    const error = form.querySelector('.error-message');
    if (!error) return;
    error.textContent = '';
    error.style.display = 'none';
    error.classList.remove('d-block');
  }

  function showSuccess(form, message) {
    const sent = form.querySelector('.sent-message');
    if (!sent) return;
    if (message) {
      sent.textContent = message;
    }
    sent.style.display = 'block';
    sent.classList.add('d-block');
  }

  function hideSuccess(form) {
    const sent = form.querySelector('.sent-message');
    if (!sent) return;
    sent.style.display = 'none';
    sent.classList.remove('d-block');
  }

  function submitForm(form) {
    const action = form.getAttribute('action');
    if (!action) {
      showError(form, 'The form action property is not set.');
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    const originalHtml = submitButton ? submitButton.innerHTML : '';
    if (submitButton) {
      submitButton.disabled = true;
    }

    showLoading(form, true);
    hideError(form);
    hideSuccess(form);

    const formData = new FormData(form);

    // Default feedback type when omitted
    if (form.classList.contains('feedback-form') && !formData.get('feedback_type')) {
      formData.set('feedback_type', 'other');
    }

    fetch(action, {
      method: 'POST',
      body: formData,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Network error (' + response.status + '). Please try again.');
        }
        return response.text();
      })
      .then(function (text) {
        showLoading(form, false);
        const result = parseResponse(text);
        if (result.ok) {
          showSuccess(form, result.message);
          form.reset();
          if (form.classList.contains('feedback-form')) {
            const typeSelect = form.querySelector('[name="feedback_type"]');
            if (typeSelect) {
              typeSelect.selectedIndex = 0;
            }
          }
        } else {
          showError(form, result.message);
        }
      })
      .catch(function (err) {
        showLoading(form, false);
        showError(form, err.message || 'Network error. Please try again.');
      })
      .finally(function () {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalHtml;
        }
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll(FORM_SELECTOR).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitForm(form);
      });
    });
  });
})();

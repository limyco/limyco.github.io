(function () {
  'use strict';

  // ── Dark mode (apply before paint to avoid flash) ──
  var saved = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  document.addEventListener('DOMContentLoaded', function () {

    // ── Theme toggle ──
    var toggle = document.getElementById('theme-toggle');
    function syncToggleIcon() {
      if (!toggle) return;
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      toggle.textContent = isDark ? '☀' : '☾';
      toggle.title = isDark ? '切换亮色模式' : '切换暗色模式';
    }
    if (toggle) {
      syncToggleIcon();
      toggle.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        syncToggleIcon();
        // sync utterances if loaded
        var frame = document.querySelector('.utterances-frame');
        if (frame) {
          frame.contentWindow.postMessage(
            { type: 'set-theme', theme: next === 'dark' ? 'github-dark' : 'github-light' },
            'https://utteranc.es'
          );
        }
      });
    }

    // ── Reading progress bar ──
    var bar = document.getElementById('reading-progress');
    if (bar) {
      var onScroll = function () {
        var scrolled = window.scrollY;
        var total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // ── Back to top ──
    var backTop = document.getElementById('back-top');
    if (backTop) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 320) {
          backTop.classList.add('visible');
        } else {
          backTop.classList.remove('visible');
        }
      }, { passive: true });
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // ── Code copy buttons ──
    document.querySelectorAll('.post-content pre').forEach(function (pre) {
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = '复制';
      pre.appendChild(btn);
      btn.addEventListener('click', function () {
        var codeEl = pre.querySelector('code') || pre;
        var text = codeEl.innerText || codeEl.textContent;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = '✓ 已复制';
            btn.classList.add('copied');
            setTimeout(function () {
              btn.textContent = '复制';
              btn.classList.remove('copied');
            }, 2000);
          });
        } else {
          // fallback
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btn.textContent = '✓ 已复制';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = '复制';
            btn.classList.remove('copied');
          }, 2000);
        }
      });
    });

    // ── Auto TOC ──
    var tocEl = document.getElementById('toc');
    if (tocEl) {
      var headings = document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3');
      if (headings.length >= 2) {
        var ul = document.createElement('ul');
        headings.forEach(function (h, i) {
          if (!h.id) h.id = 'h-' + i;
          var li = document.createElement('li');
          li.className = 'toc-' + h.tagName.toLowerCase();
          var a = document.createElement('a');
          a.href = '#' + h.id;
          a.textContent = h.textContent.replace(/^#\s*/, '');
          li.appendChild(a);
          ul.appendChild(li);
        });
        tocEl.appendChild(ul);

        // Highlight active heading on scroll
        if (window.IntersectionObserver) {
          var links = tocEl.querySelectorAll('a');
          var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                links.forEach(function (a) { a.classList.remove('active'); });
                var active = tocEl.querySelector('a[href="#' + entry.target.id + '"]');
                if (active) active.classList.add('active');
              }
            });
          }, { rootMargin: '-10% 0px -80% 0px' });
          headings.forEach(function (h) { observer.observe(h); });
        }
      } else {
        // hide sidebar if not enough headings
        var sidebar = tocEl.closest('.toc-sidebar');
        if (sidebar) sidebar.style.display = 'none';
      }
    }

    // ── Post list entrance animation ──
    var items = document.querySelectorAll('.post-item');
    if (items.length) {
      if (window.IntersectionObserver) {
        var listObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              listObs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        items.forEach(function (item, i) {
          item.style.transitionDelay = (i * 0.07) + 's';
          listObs.observe(item);
        });
      } else {
        items.forEach(function (item) { item.classList.add('visible'); });
      }
    }

    // ── Post header fade in ──
    var postHeader = document.querySelector('.post-header');
    if (postHeader) {
      postHeader.style.animation = 'fadeUp 0.5s ease both';
    }

  });
})();

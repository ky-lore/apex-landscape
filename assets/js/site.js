/* Apex Landscape & Construction — shared behavior */
(function(){
  'use strict';

  /* ---- nav + utility-bar scroll state ---- */
  var nav = document.querySelector('.nav');
  var utility = document.querySelector('.utility');
  function onScroll(){
    var down = window.scrollY > 40;
    if(nav) nav.classList.toggle('scrolled', down);
    if(utility) utility.classList.toggle('hide', down);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---- utility promo rotator ---- */
  var rot = document.querySelector('.u-rotator');
  if(rot){
    var items = rot.querySelectorAll('span');
    if(items.length > 1){
      var ri = 0;
      items.forEach(function(s,i){ s.style.display = i===0?'block':'none'; });
      setInterval(function(){
        items[ri].style.display = 'none';
        ri = (ri+1) % items.length;
        items[ri].style.display = 'block';
      }, 4000);
    }
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.addEventListener('click', function(){
      var item = q.parentElement;
      var isOpen = item.classList.contains('open');
      var group = item.closest('.faq');
      if(group) group.querySelectorAll('.faq-item').forEach(function(i){ i.classList.remove('open'); });
      if(!isOpen) item.classList.add('open');
    });
  });

  /* ---- mobile menu ---- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.querySelector('.mobile-menu');
  function closeMenu(){ if(menu){menu.classList.remove('open'); document.body.style.overflow='';} }
  if(toggle && menu){
    toggle.addEventListener('click', function(){
      menu.classList.add('open'); document.body.style.overflow='hidden';
    });
    menu.querySelectorAll('a, .mm-close').forEach(function(el){
      el.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeMenu(); });
    window.addEventListener('resize', function(){ if(window.innerWidth>820) closeMenu(); });
  }

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && reveals.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---- forms (placeholder submit) ---- */
  document.querySelectorAll('form[data-mock]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      // honeypot
      var hp = form.querySelector('.hp input');
      if(hp && hp.value){ return; }
      var success = form.parentNode.querySelector('.form-success') || document.querySelector('#'+form.dataset.success);
      if(success){
        form.style.display='none';
        success.classList.add('show');
        success.scrollIntoView({behavior:'smooth', block:'center'});
      }
    });
  });

  /* ---- gallery filter + lightbox ---- */
  var masonry = document.querySelector('.masonry');
  if(masonry){
    var figures = Array.prototype.slice.call(masonry.querySelectorAll('figure'));
    var filters = document.querySelectorAll('.gal-filter button');
    filters.forEach(function(btn){
      btn.addEventListener('click', function(){
        filters.forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');
        var f = btn.dataset.filter;
        figures.forEach(function(fig){
          fig.style.display = (f==='all' || fig.dataset.cat===f) ? '' : 'none';
        });
      });
    });

    // lightbox
    var lb = document.querySelector('.lightbox');
    if(lb){
      var lbImg = lb.querySelector('img');
      var lbCount = lb.querySelector('.lb-count');
      var visible = function(){ return figures.filter(function(f){return f.style.display!=='none';}); };
      var idx = 0, list = [];
      function open(fig){
        list = visible();
        idx = list.indexOf(fig);
        show();
        lb.classList.add('open'); document.body.style.overflow='hidden';
      }
      function show(){
        var img = list[idx].querySelector('img');
        lbImg.src = img.dataset.full || img.src;
        lbImg.alt = img.alt;
        if(lbCount) lbCount.textContent = (idx+1)+' / '+list.length;
      }
      function move(d){ idx=(idx+d+list.length)%list.length; show(); }
      figures.forEach(function(fig){
        fig.addEventListener('click', function(){ open(fig); });
      });
      lb.querySelector('.lightbox__close').addEventListener('click', function(){
        lb.classList.remove('open'); document.body.style.overflow='';
      });
      lb.querySelector('.lb-prev').addEventListener('click', function(){move(-1);});
      lb.querySelector('.lb-next').addEventListener('click', function(){move(1);});
      lb.addEventListener('click', function(e){ if(e.target===lb){ lb.classList.remove('open'); document.body.style.overflow='';} });
      document.addEventListener('keydown', function(e){
        if(!lb.classList.contains('open')) return;
        if(e.key==='Escape'){ lb.classList.remove('open'); document.body.style.overflow=''; }
        if(e.key==='ArrowLeft') move(-1);
        if(e.key==='ArrowRight') move(1);
      });
    }
  }

  /* ---- service deep-link -> pre-filled estimate request ---- */
  var chips = document.querySelector('.chips');
  if(chips && window.location.search){
    var MAP = {
      patios:'Patio Renovation', walkways:'Paver Walkway', kitchens:'Outdoor Kitchen',
      walls:'Retaining Wall / Beds', turf:'Artificial Turf', irrigation:'Irrigation',
      drainage:'Drainage', lighting:'Landscape Lighting', design:'Design / Not Sure'
    };
    var LABEL = { 'Design / Not Sure':'landscape design' };
    var q = window.location.search.replace(/^\?/,'').split('&');
    var raw = '';
    q.forEach(function(pair){
      var kv = pair.split('=');
      if(decodeURIComponent(kv[0]) === 'service') raw = decodeURIComponent((kv[1]||'').replace(/\+/g,' '));
    });
    var picked = [];
    raw.split(',').forEach(function(slug){
      slug = slug.trim().toLowerCase();
      var val = MAP[slug];
      if(!val) return;
      var input = chips.querySelector('input[value="' + val + '"]');
      if(input && !input.checked){ input.checked = true; }
      if(picked.indexOf(val) === -1) picked.push(val);
    });
    if(picked.length){
      var names = picked.map(function(v){ return LABEL[v] || v.toLowerCase(); });
      var pretty = names.length > 1 ? names.slice(0,-1).join(', ') + ' and ' + names[names.length-1] : names[0];
      var notice = document.getElementById('svcNotice');
      var nName = document.getElementById('svcNoticeName');
      if(notice && nName){ nName.textContent = pretty; notice.hidden = false; }
      var msg = document.getElementById('msg');
      if(msg && !msg.value){
        msg.value = "I'm interested in " + pretty + " for my property.";
      }
    }
  }

  /* ---- footer year ---- */
  var y = document.querySelector('[data-year]');
  if(y) y.textContent = new Date().getFullYear();
})();

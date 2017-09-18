(function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})(loadAutocomplete)

function loadAutocomplete() {
  var autoCompleteTerm;
  var autoCompleteCB;
  var autoCompletePath = _hrsGlobalHelper._baseurl+'index.json';
  var xhr = new XMLHttpRequest();
  
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 400) {
      // Success!
      var data = parseAutoCompleteData(xhr.responseText, autoCompleteTerm);
      if (data.length === 0){
        document.querySelector('.autocomplete-noResults').setAttribute('style','display:block;');
      } else {
        document.querySelector('.autocomplete-noResults').removeAttribute('style');
      }
      autoCompleteCB(data);
    } else {
      // We reached our target server, but it returned an error
    }
  }
  
  new autoComplete({
    selector: 'input[name="auto"]',
    minChars: 2,
    source: function(term, response){
      try { xhr.abort(); } catch(e){}
      autoCompleteTerm = term;
      autoCompleteCB = response;
      xhr.open('GET', autoCompletePath, true);
      xhr.send();
    },
    renderItem: function (item, search) {
      var searchitem = item.title;
      search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
      return '<div class="autocomplete-suggestion" data-val="' + item.path + '">' + searchitem.replace(re, "<b>$1</b>") + '</div>';
    },
    onSelect: function (event, term, item) {
      window.location.assign(term);
    }
  });
}


function parseAutoCompleteData(source, searchTerm){
  var results = JSON.parse(source);
  if (!results.site) return [];

  var output = [];
  for(var i=0; i<results.site.length; i++){
    if (results.site[i].title && results.site[i].title.indexOf(searchTerm) !== -1) {
      output.push(results.site[i]);
    }
  }
  return output;
}

function searchChange(e){
  var label = document.querySelector('.header-search-label');
  if (!label) return;
  
  if (e.target.value === '') {
    label.setAttribute('style', '');
  } else {
    label.setAttribute('style', 'visibility: hidden;');
  }
}

(function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})(loadSidebarData)

function loadSidebarData() {
  var sidebarPath = _hrsGlobalHelper._baseurl+'sidebar/index.json';
  var xhr = new XMLHttpRequest();
  
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 400) {
      // Success!
      var data = JSON.parse(xhr.responseText).hrs_menu;
      sidebarCB(document.querySelector('.sidebar-menu'), data);
      sidebarScroll();
    } else {
      // We reached our target server, but it returned an error
    }
  };
  xhr.open('GET', sidebarPath, true);
  xhr.send();
}

function sidebarCB(element, submenu){

  for (var i=0; i<submenu.length; i++) {
    var li = document.createElement('li');
    Util.addClass(li, 'sidebar-item');
    if (_hrsGlobalHelper._identifier === submenu[i].URL) 
      Util.addClass(li, 'current');
    else if ((submenu[i].Name.toLowerCase() !== 'home') && (_hrsGlobalHelper._identifier.indexOf(submenu[i].URL) === 0) ) {
      Util.addClass(li, 'active');
      Util.addClass(li, 'show');
    }

    var anchor = document.createElement('a');
    anchor.setAttribute('href', submenu[i].URL);

    var span = document.createElement('span');
    span.innerText = submenu[i].Name;
    anchor.appendChild(span);
    li.appendChild(anchor);
    
    if (submenu[i].Children) {
      var button = document.createElement('button');
      button.setAttribute("class", "sidebar-item-button btn-flat");
      button.setAttribute("onclick", "sidebarExtendToggle(event)");
      if ((_hrsGlobalHelper._identifier !== submenu[i].URL) && (_hrsGlobalHelper._identifier.indexOf(submenu[i].URL) === 0) ) {
        button.setAttribute("aria-expanded", "true");
      } else {
        button.setAttribute("aria-expanded", "flase");
      }

      var buttonIcon = document.createElement('i');
      buttonIcon.setAttribute("aria-hidden", "true");
      buttonIcon.setAttribute("class", "fa fa-lg");
      if ((_hrsGlobalHelper._identifier !== submenu[i].URL) && (_hrsGlobalHelper._identifier.indexOf(submenu[i].URL) === 0) ) {
        Util.addClass(buttonIcon, 'fa-minus-square-o');
      } else {
        Util.addClass(buttonIcon, 'fa-plus-square-o');
      }
      button.appendChild(buttonIcon);
      anchor.appendChild(button);

      var childMenuDOM = document.createElement('ul');
      sidebarCB(childMenuDOM, submenu[i].Children);
      li.appendChild(childMenuDOM);
    }

    element.appendChild(li);
  }
  
}

function sidebarScroll() {
  var container = document.querySelector('.sidebar-menu-container');
  var currentElem = document.querySelector('.sidebar li.current');
  if (!currentElem || !container) return;

  var topPos = currentElem.offsetTop - (container.clientHeight/4);
  container.scrollTop = topPos;
}

function sidebarExtendToggle(e) {
  e.preventDefault();
  var listItem = Util.findAncestorByClass(e.currentTarget, 'sidebar-item');
  var iconItem = listItem.querySelector('i');
  var shouldExpand = !(e.currentTarget.getAttribute('aria-expanded') == 'true');

  if (shouldExpand) {
    Util.addClass(listItem, 'show');
    Util.addClass(iconItem, 'fa-minus-square-o');
    Util.removeClass(iconItem, 'fa-plus-square-o');
  } else {
    Util.removeClass(listItem, 'show');
    Util.addClass(iconItem, 'fa-plus-square-o');
    Util.removeClass(iconItem, 'fa-minus-square-o');
  }
  e.currentTarget.setAttribute('aria-expanded', shouldExpand);
}

function showMenu(e){
  var sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  var shouldExpand = !Util.hasClass(sidebar, 'sidebar--state-show');

  if (shouldExpand) {
    Util.addClass(sidebar, 'sidebar--state-show');
  } else {
    Util.removeClass(sidebar, 'sidebar--state-show');
  }

  var toggles = document.querySelectorAll('.sidebar-toggle');
  Array.prototype.forEach.call(toggles, function(el, i){
    el.setAttribute('aria-expanded', shouldExpand);
  });
}

Util = {

  hasClass: function(el, className) {
    if (!el) return;

    if (el.classList)
      return el.classList.contains(className);
    else
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
  },

  addClass: function(el, className) {
    if (!el) return;

    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  },

  removeClass: function(el, className){
    if (!el) return;

    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  },

  findAncestorByClass: function (el, className) {
    while ((el = el.parentElement) && !this.hasClass(el, className));
    return el;
  }
};
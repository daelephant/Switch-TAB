function save_options() 
{
  console.warn('save_options')
    var queryInfo = {windowId : chrome.windows.WINDOW_ID_CURRENT}
    console.warn(queryInfo)
    chrome.tabs.query(queryInfo, function(tabs){

      console.warn('tabs retrieved')
      
      for (var i = tabs.length - 1; i >= 0; i--) {
        if (isNormalTab(tabs[i]))
        {
          console.warn(tabs[i])
          console.warn('save option: ' + tabs[i].id)
          save_option("tabs_" + tabs[i].id)
        }
      };
      save_defaultVal(tabs);
      save_status();
      console.warn(localStorage)
  });
}
  

function save_status()
{
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

function save_option(optName)
{
  var select = document.getElementById(optName);
  var currentVal = localStorage.getItem(optName)
  var defaultVal = get_local_storage("rotate_seconds", 3);
  console.warn('optName: ' + optName + ' currentVal: ' + currentVal + " selectVal: " + select.value + " defaultVal: " + defaultVal) 
  if (currentVal === null && select.value != defaultVal)
    localStorage[optName] = select.value;
  if (currentVal !== null && select.value == defaultVal)
    localStorage.removeItem(optName)
}

function save_defaultVal(tabs)
{
   var defaultSelectId = "rotate_seconds"
   var select = document.getElementById(defaultSelectId);
   var currentVal = localStorage[defaultSelectId];
   localStorage[defaultSelectId] = select.value;
   for (var i = tabs.length - 1; i >= 0; i--) {
      if (isNormalTab(tabs[i]))
      {
        var tabSelect= document.getElementById("tabs_" + tabs[i].id)
        if (tabSelect.value == currentVal)
        {
          tabSelect.value = select.value;
          document.getElementById("tabs_" + tabs[i].id + "_desc").innerHTML = secondsToDuration(tabSelect.value);
        }
      }
    };
}

function get_local_storage(optName, defaultVal)
{
    var val = localStorage.getItem(optName)
    if (val === null) {
      val = defaultVal;
    }
    return val;
}
function restore_option(optName, defaultVal)
{
    var val = get_local_storage(optName, defaultVal)
    var select = document.getElementById(optName);
    select.value = val;
    return val;
}

function restore_options() {
  var queryInfo = {windowId : chrome.windows.WINDOW_ID_CURRENT}
  chrome.tabs.query(queryInfo, function(tabs){
    restore_option("rotate_seconds");
    for (var i = tabs.length - 1; i >= 0; i--) {
      restore_option("tabs_" + tabs[i].id, get_local_storage("rotate_seconds", 3))
    };
  });
}

function isNormalTab(tab)
{
  return tab.url.substring(0,6) != "chrome"
}

function buildOptionsPerTabDOM(tab, defaultRotationTime)
{
  var div = document.createElement('div');
      div.className = 'tabOptions'
  var span = document.createElement('span');
  if (tab.title.length > 80)
      span.innerHTML = tab.title.substring(0, 80) + "...";
  else
      span.innerHTML = tab.title
      span.className = 'tabName'
  var input = document.createElement('input');
      input.id = "tabs_" + tab.id;
      input.type = "number"
      input.min = "1"
      input.style.width = "50px"
      input.addEventListener("change", timeUpdated);
  var inputDescSpan = document.createElement('span');
      inputDescSpan.className = 'inputDesc';
      inputDescSpan.id = input.id + "_desc";
  var val = get_local_storage("tabs_" + tab.id, defaultRotationTime);
      input.value = val;
      inputDescSpan.innerHTML = secondsToDuration(val);
  var container = document.getElementById("tabOptions");
      container.appendChild(div);
      div.appendChild(span);
      div.appendChild(input);
      div.appendChild(inputDescSpan);
}

function timeUpdated()
{
  console.warn(this);
  console.warn(this.value);
  console.warn(secondsToDuration(this.value))
  document.getElementById(this.id + "_desc").innerHTML = secondsToDuration(this.value)
}

function getSingularOrPluralText(text, amount)
{
  return amount == 1 ? text : text + "s";
}

function secondsToDuration(totalSec)
{
  var hours = parseInt( totalSec / 3600 ) % 24;
  hours = hours ? hours + " " + getSingularOrPluralText("hour", hours) + " " : ""
  var minutes = parseInt( totalSec / 60 ) % 60;
  minutes = minutes ? minutes + " " + getSingularOrPluralText("minute", minutes) + " " : ""
  var seconds = totalSec % 60;
  seconds = seconds ? seconds + " " + getSingularOrPluralText("second", seconds) : ""

  var result = hours + minutes + seconds;
  return result;
}

function init()
{
  document.querySelector('#save').addEventListener('click', save_options);
  var queryInfo = {windowId : chrome.windows.WINDOW_ID_CURRENT}
  chrome.tabs.query(queryInfo, function(tabs){
    var rotate_seconds_val = restore_option("rotate_seconds", 3);
    tabs.sort(function(a,b){
      return a.index < b.index;
    });
    for (var i = tabs.length - 1; i >= 0; i--) {
      if (isNormalTab(tabs[i]))
      {
        buildOptionsPerTabDOM(tabs[i], rotate_seconds_val);
      }
    };
  });

}
document.addEventListener('DOMContentLoaded', init);

function getActiveTabWithIndex(tabs)
{
	for (var i = 0;i<tabs.length;i++)
	{
		var thisTab = tabs[i];
		//console.warn('tab with index: ' + i)
		//console.warn(thisTab);
		if (thisTab.active)
		{
			return {tab:thisTab, index:i};
		}
	}
}

function getNextTabAfterIndex(tabs, index)
{
	var counter = 0;
	var tab = null;
	while (tab == null)
	{
		if (index == tabs.length - 1)
			index = 0;
		else
			index = index + 1;
		var tabToCheck = tabs[index];
		if (isNormalTab(tabToCheck))
		{
			tab = tabToCheck;
			break;
		}
		if (counter > tabs.length)
			break;
		counter++;
	}
	return tab;
}

function isNormalTab(tab)
{
	return tab.url.substring(0,6) != "chrome"
}

function getTabRotateInMillisOrDefault(tabId)
{
	var tabSpecificInterval = localStorage.getItem(tabId);
	var interval = tabSpecificInterval !== null ? localStorage[tabId] : localStorage["rotate_seconds"]
	return (interval - 0) * 1000;
}

function tabActivated(tab) {
	//console.warn('Tab activated: ' + tab.id)
	var tabId = "tabs_" + tab.id;
	var interval = getTabRotateInMillisOrDefault(tabId);
	startCarousel(interval);
}
function tabsRetrieved(tabs){
	//console.warn("Tabs retrieved")
	//console.warn(tabs)
	var tabWithIndex = getActiveTabWithIndex(tabs);
	if (!isNormalTab(tabWithIndex.tab))
	{
		console.warn("Switching Paused while Chrome page is open.");
	}
	else
	{
		var nextTab = getNextTabAfterIndex(tabs, tabWithIndex.index)
		if (nextTab)
		{
			//console.warn("Switching to tab: " + nextTab.id)
			chrome.tabs.update(nextTab.id,{active:true}, function(){tabActivated(nextTab)})
			return;
		}
		else
		{
			console.warn("No tabs to switch to. Indefinitely paused.");
		}
	}
	var tabId = "tabs_" + tabWithIndex.id;
	var interval = getTabRotateInMillisOrDefault(tabId);
	startCarousel(interval);
}

function rotateTabs() {
	var windowId = localStorage["windowId"] - 0
	if (!windowId)
		windowId = chrome.windows.WINDOW_ID_CURRENT
	var queryInfo = {windowId : windowId}
	console.warn(queryInfo)
	chrome.tabs.query(queryInfo, tabsRetrieved)
}
var carouselId = null;
function startCarousel(interval)
{
	console.warn("INTERVAL: " + interval)
	//console.warn("starting carousel in " + interval + "ms" + " currentWindowId: " + localStorage["windowId"])

	carouselId = setTimeout(function(){
		rotateTabs()
	}, interval)
}
function stopCarousel()
{
	clearTimeout(carouselId);
}


chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.browserAction.getTitle({}, function(title){
		chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT, active:true}, function(tab){
			localStorage["windowId"] = tab[0].windowId; //ensures we know the window context that extension was started.
			if (title == "开始轮播页面")
			{
				var defaultInterval = localStorage.getItem("rotate_seconds")
				if (defaultInterval === null)
				{
					defaultInterval = 3;
					localStorage.setItem("rotate_seconds", 3);
				}
				var interval = localStorage.getItem("tabs_" + tab[0].id)
				if (interval === null)
					interval = defaultInterval
				startCarousel((interval - 0) * 1000);
				chrome.browserAction.setTitle({title:"停止轮播"})
				chrome.browserAction.setIcon({path:"icon.png"});
			}
			else
			{
				stopCarousel();
				chrome.browserAction.setTitle({title:"开始轮播页面"})
				chrome.browserAction.setIcon({path:"icon-stop.png"});
			}
		});
		
		
	});
	
});



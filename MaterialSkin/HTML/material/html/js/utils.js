/**
 * LMS-Material
 *
 * Copyright (c) 2018-2019 Craig Drummond <craig.p.drummond@gmail.com>
 * MIT license.
 */

const SEPARATOR = " \u2022 ";

var bus = new Vue();
var debug = undefined;

function logJsonMessage(type, msg) {
    if (debug && (debug.has("json") || debug.has("true"))) {
        console.log("[" + new Date().toLocaleTimeString()+"] JSON "+type+": "+JSON.stringify(msg));
    }
}

function logCometdMessage(type, msg) {
    if (debug && (debug.has("cometd") || debug.has("true"))) {
        console.log("[" + new Date().toLocaleTimeString()+"] COMETED "+type+": "+JSON.stringify(msg));
    }
}

function logCometdDebug(msg) {
    if (debug && (debug.has("cometd") || debug.has("true"))) {
        console.log("[" + new Date().toLocaleTimeString()+"] COMETED "+msg);
    }
}

function commandToLog(command, params, start, count) {
    var cmd = [];
    if (undefined!=command) {
        command.forEach(i => { cmd.push(i); });
    }
    if (undefined!=params) {
        if (undefined!=start) {
            cmd.push(start);
            cmd.push(undefined==count ? LMS_BATCH_SIZE : count);
        }
        params.forEach(i => { cmd.push(i); });
    }
    return cmd
}

function logError(err, command, params, start, count) {
    console.error("[" + new Date().toUTCString()+"] ERROR:" + err, commandToLog(command, params, start, count));
    console.trace();
}

function logAndShowError(err, message, command, params, start, count) {
    logError(err, command, params, start, count);
    bus.$emit('showError', err, message);
}

function formatSeconds(secs, showDays) {
    var numSeconds = parseInt(secs, 10)
    var days       = showDays ? Math.floor(numSeconds / (3600*24)) : 0;
    var hours      = showDays ? Math.floor(numSeconds / 3600) % 24 : Math.floor(numSeconds / 3600);
    var minutes    = Math.floor(numSeconds / 60) % 60
    var seconds    = numSeconds % 60
    if (days>0) {
        return i18np("1 day", "%1 days", days)+" "+
                 ([hours,minutes,seconds]
                 .map(v => v < 10 ? "0" + v : v)
                 .filter((v,i) => v !== "00" || i > 0)
                 .join(":"));
    }
    if (hours>0) {
        return [hours,minutes,seconds]
                 .map(v => v < 10 ? "0" + v : v)
                 .filter((v,i) => v !== "00" || i > 0)
                 .join(":");
    }
    return (minutes<1 ? "00:" : "") +
           [minutes,seconds]
             .map(v => v < 10 ? "0" + v : v)
             .filter((v,i) => v !== "00" || i > 0)
             .join(":");
}

function formatTime(secs, twentyFour) {
    var numSeconds = parseInt(secs, 10)
    var hours      = Math.floor(numSeconds / 3600) % 24
    var minutes    = Math.floor(numSeconds / 60) % 60
    if (twentyFour) {
        return [hours,minutes]
                 .map(v => v < 10 ? "0" + v : v)
                 .join(":");
    } else {
        return (hours%12 || 12)+":"+(minutes<10 ? "0" : "")+minutes+" "+(hours<12 ? "AM" : "PM");
    }
}

function formatDate(timestamp) {
    var date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

function resolveImage(icon, image, size) {
    if (!icon && !image) {
        return null;
    }
    if (image) {
        image=""+image; // Ensure its a string!
        if (image.includes("://") && !(image.startsWith('/imageproxy') || image.startsWith('imageproxy'))) {
            return image;
        }
        if (image.startsWith("/")) {
            return image+(size ? size : "");
        }
        return "/"+image+(size ? size : "");
    }
    icon=""+icon; // Ensure its a string!
    if (icon.includes("://") && !(icon.startsWith('/imageproxy') || icon.startsWith('imageproxy'))) {
        return '/imageproxy/' + encodeURIComponent(icon) + '/image' + (size ? size : LMS_LIST_IMAGE_SIZE);
    }
    
    var idx = icon.lastIndexOf(".png");
    if (idx < 0) {
        idx = icon.lastIndexOf(".jpg");
    }

    if (idx>0) {
        icon = icon.substring(0, idx)+(size ? size : LMS_LIST_IMAGE_SIZE)+icon.substring(idx);
    }
    if (icon.startsWith("/")) {
        return icon;
    }
    if (idx<0 && /^[0-9a-fA-F]+$/.test(icon)) {
        icon="music/"+icon+"/cover"+(size ? size : LMS_LIST_IMAGE_SIZE);
    }
    return "/"+icon;
}

function removeImageSizing(path) {
    if (undefined!=path) {
        var specs = [LMS_LIST_IMAGE_SIZE, LMS_GRID_IMAGE_SIZE, "_50x50_o"];
        for (var s=0, len=specs.length; s<len; ++s) {
            if (path.endsWith(specs[s]+".png")) {
                return path.replace(specs[s]+".png", ".png");
            }
            if (path.endsWith(specs[s])) {
                return path.substring(0, path.length - specs[s].length);
            }
        }
    }
    return path;
}

function fixTitle(str) {
    var prefixes = ["the", "el", "la", "los", "las", "le", "les"];
    for (var p=0, len=prefixes.length; p<len; ++p) {
        if (str.startsWith(prefixes[p]+" ")) {
            return str.substring(prefixes[p].length+1)+", "+prefixes[p];
        }
    }
    return str;
}

function titleSort(a, b) {
    var titleA = fixTitle(a.title.toLowerCase());
    var titleB = fixTitle(b.title.toLowerCase());
    if (titleA < titleB) {
        return -1;
    }
    if (titleA > titleB) {
        return 1;
    }
    return 0;
}

function itemSort(a, b) {
    var at = "group"==a.type ? 0 : "track"==a.type ? ("music_note"==a.icon ? 1 : 2) : 3;
    var bt = "group"==b.type ? 0 : "track"==b.type ? ("music_note"==b.icon ? 1 : 2) : 3;
    if (at!=bt) {
        return at<bt ? -1 : 1;
    }
    return titleSort(a, b);
}

function favSort(a, b) {
    var at = a.isFavFolder ? 0 : 1;
    var bt = b.isFavFolder ? 0 : 1;
    if (at!=bt) {
        return at<bt ? -1 : 1;
    }
    return titleSort(a, b);
}

function playerSort(a, b) {
    if (a.isgroup!=b.isgroup) {
        return a.isgroup ? -1 : 1;
    }
    var nameA = a.name.toLowerCase();
    var nameB = b.name.toLowerCase();
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    return 0;
}

function setScrollTop(el, val) {
    // When using RecycleScroller we need to wait for the next animation frame to scroll, so
    // just do this for all scrolls.
    window.requestAnimationFrame(function () {
        // https://popmotion.io/blog/20170704-manually-set-scroll-while-ios-momentum-scroll-bounces/
        el.style['-webkit-overflow-scrolling'] = 'auto';
        el.scrollTop=val;
        el.style['-webkit-overflow-scrolling'] = 'touch';
    });
}

const LS_PREFIX="lms-material::";

function getLocalStorageBool(key, def) {
    var val = window.localStorage.getItem(LS_PREFIX+key);
    return undefined!=val ? "true" == val : def;
}

function getLocalStorageVal(key, def) {
    var val = window.localStorage.getItem(LS_PREFIX+key);
    return undefined!=val ? val : def;
}

function setLocalStorageVal(key, val) {
    window.localStorage.setItem(LS_PREFIX+key, val);
}

function removeLocalStorage(key) {
    window.localStorage.removeItem(LS_PREFIX+key);
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
}
const IS_MOBILE = isMobile();

function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

function replaceNewLines(str) {
    return str ? str.replace(/\n/g, "<br/>").replace(/\\n/g, "<br/>") : str;
}

function changeCss(cssFile, index) {
    var oldlink = document.getElementsByTagName("link").item(index);
    var newlink = document.createElement("link");
    newlink.setAttribute("rel", "stylesheet");
    newlink.setAttribute("type", "text/css");
    newlink.setAttribute("href", cssFile);

    document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
}

function setTheme(dark) {
    if (dark) {
        changeCss("html/css/dark.css?r=" + LMS_MATERIAL_REVISION, 0);
    } else {
        changeCss("html/css/light.css?r=" + LMS_MATERIAL_REVISION, 0);
    }
}

function serverSettings(page) {
    window.open('../Default/settings/index.html' + (page ? '?activePage='+page : ''), '_blank');
}

function fixId(id, prefix) {
    var parts = id.split(".");
    if (parts.length>1) {
        parts.shift();
        return prefix + "."+parts.join(".");
    }
    return id;
}

function setBgndCover(elem, coverUrl, isDark) {
    if (elem) {
        elem.style.backgroundColor = isDark ? "#424242" : "#fff";
        if (undefined==coverUrl || coverUrl.endsWith(DEFAULT_COVER) || coverUrl.endsWith("/music/undefined/cover")) {
            elem.style.backgroundImage = "url()";
        } else {
            elem.style.backgroundImage = "url('"+coverUrl+"')";
        }
        if (isDark) {
            //if (coverUrl) {
                elem.style.boxShadow = "inset 0 0 120vw 120vh rgba(72,72,72,0.9)";
           // } else {
           //     elem.style.boxShadow = "";
           // }
        } else {
            //if (coverUrl) {
                elem.style.boxShadow = "inset 0 0 120vw 120vh rgba(255,255,255,0.9)";
            //} else {
            //    elem.style.boxShadow = "";
           // }
        }
    }
}

var volumeStep = 5;

function adjustVolume(vol, inc) {
    if (1==volumeStep) {
        if (inc) {
            return vol+1;
        } else if (0==vol) {
            return 0;
        } else {
            return vol-1;
        }
    }

    if (inc) {
        // Always send volume up, even if at 100% already. Some users trap LMS
        // volume commands and forward on
        return Math.floor((vol+volumeStep)/volumeStep)*volumeStep;
    }

    if (vol<=volumeStep) {
        return 0;
    }

    var adj = Math.floor(vol/volumeStep)*volumeStep;
    // If rounding down to volumeStep is 2% (or more) then use that, else make even lower
    if ((vol-adj)>=2) {
        return adj;
    }
    return Math.floor((vol-volumeStep)/volumeStep)*volumeStep;
}

function parseQueryParams() {
    var queryString = window.location.href.substring(window.location.href.indexOf('?')+1);
    var hash = queryString.indexOf('#');
    if (hash>0) {
        queryString=queryString.substring(0, hash);
    }
    var query = queryString.split('&');


    for (var i = query.length - 1; i >= 0; i--) {
        var kv = query[i].split('=');
        if ("player"==kv[0]) {
            setLocalStorageVal("player", kv[1]);
        } else if ("debug"==kv[0]) {
            var parts = kv[1].split(",");
            debug = new Set();
            for (var j=0, len=parts.length; j<len; ++j) {
                debug.add(parts[j]);
            }
        } else if ("clearcache"==kv[0] && "true"==kv[1]) {
            clearListCache(true);
        }
    }
}

function isLandscape() {
    return window.innerWidth > window.innerHeight;
}

function isWide() {
    return window.innerWidth>=900;
}

function incrementVolume() {
    bus.$emit("adjustVolume", true);
}

function decrementVolume() {
    bus.$emit("adjustVolume", false);
}

function isVisible(elem) {
    var rect = elem.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

function ensureVisible(elem, attempt) {
    elem.scrollIntoView();
    if (!isVisible(elem) && (undefined==attempt || attempt<15)) {
        window.setTimeout(function() {
            ensureVisible(elem, undefined==attempt ? 1 : attempt+1);
        }, 100);
    }
}

const LMS_LIST_CACHE_PREFIX = "cache:list:";
function cacheKey(command, params, start, batchSize) {
    return LMS_LIST_CACHE_PREFIX+LMS_CACHE_VERSION+":"+lmsLastScan+":"+
           (command ? command.join("-") : "") + ":" + (params ? params.join("-") : "") + ":"+start+":"+batchSize;
}

var canUseCache = true;
function clearListCache(force) {
    // Delete old local-storage cache
    for (var key in window.localStorage) {
        if (key.startsWith(LS_PREFIX+LMS_LIST_CACHE_PREFIX) &&
            (force || !key.startsWith(LS_PREFIX+LMS_LIST_CACHE_PREFIX+LMS_CACHE_VERSION+":"+lmsLastScan+":"))) {
            window.localStorage.removeItem(key);
        }
    }
    // Delete IndexedDB cache
    idbKeyval.keys().then(keys => {
        for (var i=0, len=keys.length; i<len; ++i) {
            if (keys[i].startsWith(LMS_LIST_CACHE_PREFIX) && (force || !keys[i].startsWith(LMS_LIST_CACHE_PREFIX+LMS_CACHE_VERSION+":"+lmsLastScan+":"))) {
                idbKeyval.del(keys[i]);
            }
        }
    }).catch(err => {
        canUseCache = false;
    });
}

const RATINGS=["",         // 0
               "<i class=\"rstar\">star_half</i>", // 0.5
               "<i class=\"rstar\">star</i>",  // 1
               "<i class=\"rstar\">star</i> <i class=\"rstar\">star_half</i>", // 1.5
               "<i class=\"rstar\">star</i> <i class=\"rstar\">star</i>", // 2
               "<i class=\"rstar\">star</i> <i class=\"rstar\">star</i> <i class=\"rstar\">star_half</i>", // 2.5
               "<i class=\"rstar\">star</i> <i class=\"rstar\">star</i> <i class=\"rstar\">star</i>", // 3
               "<i class=\"rstar\">star</i> <i class=\"rstar\">star</i> <i class=\"rstar\">star</i> <i class=\"rstar\">star_half</i>", // 3.5
               "<i class=\"rstar\">star</i> <i class=\"rstar\">star</i> <i class=\"rstar\">star</i> <i class=\"rstar\">star</i>", // 4
               "<i class=\"rstar\">star</i> <i class=\"rstar\">star</i> <i class=\"rstar\">star</i> <i class=\"rstar\">star</i> <i class=\"rstar\">star_half</i>", // 4.5
               "<i class=\"rstar\">star</i> <i class=\"rstar\">star</i> <i class=\"rstar\">star</i> <i class=\"rstar\">star</i> <i class=\"rstar\">star</i>"]; // 5

function ratingString(current, val) {
    var str = "";
    if (current) {
        var prev=current.indexOf("<i class=\"rstar\">");
        if (prev>-1) {
            str = current.substring(0, prev);
        } else {
            str += current;
        }
    }
    var index=Math.ceil(val*2.0);
    return str+"  "+RATINGS[index<0 ? 0 : (index>=RATINGS.length ? RATINGS.length-1 : index)];
}

function adjustRatingFromServer(val) {
    var rating = parseInt(val);
    if (rating<0) {
        rating=0;
    } else if (rating>100) {
        rating=100;
    }
    return Math.round(rating/10.0)/2.0;  // Round to nearest 5%
}

function adjustRatingToServer(val) {
    return (val*20)+"%";
}

function isEmpty(str) {
    return undefined==str || str.length<1;
}

function checkRemoteTitle(item) {
    return item && item.remote_title && !item.remote_title.startsWith("http:/") && !item.remote_title.startsWith("https:/")
        ? item.remote_title : undefined;
}

function hasPlayableId(item) {
    return item.item_id || item.track || item.track_id || item.album_id || item.artist_id || item.album || item.playlistid /* dynamic playlists*/ ||
           item.album || item.artist || item.variousartist || item.year || item.genre || item.playlist; // CustomBrowse
}

function shouldAddLibraryId(command) {
    if (command.command && command.command.length>0) {
        if (command.command[0]=="artists" || command.command[0]=="albums" || command.command[0]=="tracks" ||
            command.command[0]=="genres" || command.command[0]=="playlists" || "browselibrary"==command.command[0]) {
            return true;
        }
        if (command.command[0]=="playlistcontrol") {
            for (var i=1, len=command.command.length; i<len; ++i) {
                if (command.command[i].startsWith("artist_id:") || command.command[i].startsWith("album_id:") ||
                    command.command[i].startsWith("track_id:") || command.command[i].startsWith("genre_id:") || command.command[i].startsWith("year:")) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Determine if an item is a 'text' item - i.e. cannot browse into
function isTextItem(item) {
    return !item.weblink &&
           ( "text"==item.type ||
             // if group is not undefined, its probably a pinned app
             (undefined==item.type && undefined==item.group && (!item.menuActions || item.menuActions.length<1) && /*!item.params && Dynamic playlists have params?*/
              (!item.command || (item.command[0]!="browsejive" && (item.command.length<2 || item.command[1]!="browsejive")))));
}

function shrinkAray(array, limit) {
    if (array.length<=limit) {
        return array;
    }
    var res = [];
    var i = 0;
    var scale = array.length / limit;
    while (i < limit) {
        res.push(array[Math.round(i * scale)]);
        i++;
    }
    res[res.length-1]=array[array.length-1];
    return res;
}

function updateItemFavorites(item) {
    if ( (item.favUrl && item.favIcon) || (item.presetParams && item.presetParams.favorites_url)) {
        return;
    }

    var favTitle = item.origTitle ? item.origTitle : item.title;
    if (item.id.startsWith("genre_id:")) {
        item.favUrl="db:genre.name="+encodeURIComponent(favTitle);
        item.favIcon="html/images/genres.png";
    } else if (item.id.startsWith("artist_id:")) {
        item.favUrl="db:contributor.name="+encodeURIComponent(favTitle);
        item.favIcon=removeImageSizing(item.image);
    } else if (item.id.startsWith("album_id:")) {
        favUrl="db:album.title="+encodeURIComponent(favTitle);
        favIcon=removeImageSizing(item.image);
    } else if (item.id.startsWith("year:")) {
        item.favUrl="db:year.id="+encodeURIComponent(favTitle);
        item.favIcon="html/images/years.png";
    } else if (item.id.startsWith("playlist:")) {
        item.favIcon="html/images/playlists.png";
    }

    item.favUrl = item.favUrl ? item.favUrl : item.url;
    item.favIcon = item.favIcon ? item.favIcon : item.image
}

function isInFavorites(item) {
    updateItemFavorites(item);
    return undefined!=lmsFavorites[item.presetParams && item.presetParams.favorites_url ? item.presetParams.favorites_url : item.favUrl];
}

function uniqueId(id, listSize) {
    return id+"@index:"+listSize;
}

function originalId(id) {
    return id.split("@index:")[0];
}

function addPart(str, part) {
    return str ? str+SEPARATOR+part : part;
}

function commandGridKey(command) {
    return command.command[0]+"-grid";
}

function isSetToUseGrid(command) {
    return getLocalStorageBool(commandGridKey(command), true);
}

function setUseGrid(command, use) {
    setLocalStorageVal(commandGridKey(command), use);
}

function changeImageUrls(items, grid) {
    if (undefined==items || items.length<1) {
        return;
    }
    var f = grid ? LMS_LIST_IMAGE_SIZE : LMS_GRID_IMAGE_SIZE;
    var t = grid ? LMS_GRID_IMAGE_SIZE : LMS_LIST_IMAGE_SIZE;
    if (!items[0].image || !items[0].image.includes(f)) {
        return;
    }

    for (var i=0, len=items.length; i<len; ++i) {
        if (items[i].image) {
            items[i].image=items[i].image.replace(f, t);
        }
    }
}


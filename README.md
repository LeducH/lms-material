# Material skin for SlimServer (Logitech Media Server)

NOTE: The following screenshot is from the 0.0.1 release, and there have been
a few changes since.

![Now Playing](screenshots/now-playing.png)

See https://github.com/CDrummond/lms-material/wiki/Screenshots for more screenshots.


## Features

1. Mobile and desktop layouts
2. Browse local library - Artists, Album Artists (if not set for single list),
   Genres, Playlists, Years, Composers, etc.
3. Add random albums of artist, genre, or year
4. Browse Radio, Favourites, and Apps
5. Add, delete, and edit favourites
6. Add, delete, and rename playlists
7. Now playing
8. Play queue with drag'n'drop editing
9. UI settings; dark theme, album sort, auto scroll play queue
10. Player settings; crossfade, replay gain, don't stop the music, alarms
11. Sync support
12. Info dialog to show stats, and re-scan music
13. Manage players; control volume, play/pause, show current track
14. Group player control; add, edit, delete
15. Pin apps, etc, to main screen
16. Swipe left/right to change views with mobile layout
17. Lock screen controls when used with Chrome on Android

## Installation

1. Open the LMS web page (e.g. `http://localhost:9000`)
2. Click on Settings
3. Select the Plugins tab
4. At bottom of the page add the repo URL: `https://raw.githubusercontent.com/CDrummond/lms-material/master/public.xml`
5. Install the plugin and enable as usual

## Usage

1. Access the skin through `http://<yourserver>:9000/material/`
2. Select "Add to Home screen" on your device, if supported.

### Selecting mobile or desktop

The skin should automatically choose mobile or desktop layouts, but you may also
force one or the other.

1. `http://<yourserver>:9000/material/mobile` will force mobile layout
2. `http://<yourserver>:9000/material/desktop` will force desktop layout

## Donations

I develop this skin purely for fun, so no donations are required. However, seeing as I have been asked about this a few times, here is a link...

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=2X2CTDUH27V9L&source=url)

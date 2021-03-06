/**
 * LMS-Material
 *
 * Copyright (c) 2018 Craig-2019 Drummond <craig.p.drummond@gmail.com>
 * MIT license.
 */

const BIO_TAB = 0;
const REVIEW_TAB = 1;
const LYRICS_TAB = 2;

var lmsNowPlaying = Vue.component("lms-now-playing", {
    template: `
<div>
 <v-menu v-model="menu.show" :position-x="menu.x" :position-y="menu.y" absolute offset-y>
  <v-list>
   <v-list-tile @click="showPic()">
    <v-list-tile-title>{{menu.text[0]}}</v-list-tile-title>
   </v-list-tile>
   <v-list-tile @click="trackInfo()" :disabled="undefined==playerStatus.current.id">
    <v-list-tile-title>{{menu.text[1]}}</v-list-tile-title>
   </v-list-tile>
  </v-list>
 </v-menu>
<div v-if="desktop && !largeView" class="np-bar noselect" id="np-bar">
 <v-layout row class="np-controls-desktop" v-if="stopButton">
  <v-flex xs3>
   <v-btn flat icon @click="doAction(['button', 'jump_rew'])"><v-icon large>skip_previous</v-icon></v-btn>
  </v-flex>
  <v-flex xs3>
   <v-btn flat icon v-longpress="playPauseButton" @click.middle="showSleep" id="playPause"><v-icon large v-if="playerStatus.isplaying">pause</v-icon><v-icon large v-else>play_arrow</v-icon></v-btn>
  </v-flex>
  <v-flex xs3>
   <v-btn flat icon @click="doAction(['stop'])"><v-icon large>stop</v-icon></v-btn>
  </v-flex>
  <v-flex xs3>
   <v-btn flat icon @click="doAction(['playlist', 'index', '+1'])"><v-icon large>skip_next</v-icon></v-btn>
  </v-flex>
 </v-layout>
 <v-layout row class="np-controls-desktop" v-else>
  <v-flex xs4>
   <v-btn flat icon @click="doAction(['button', 'jump_rew'])" class="np-std-button"><v-icon large>skip_previous</v-icon></v-btn>
  </v-flex>
  <v-flex xs4>
   <v-btn flat icon v-longpress="playPauseButton" @click.middle="showSleep" id="playPause" class="np-playpause"><v-icon x-large v-if="playerStatus.isplaying">pause_circle_outline</v-icon><v-icon x-large v-else>play_circle_outline</v-icon></v-btn>
  </v-flex>
  <v-flex xs4>
   <v-btn flat icon @click="doAction(['playlist', 'index', '+1'])"class="np-std-button" ><v-icon large>skip_next</v-icon></v-btn>
  </v-flex>
 </v-layout>
 <img :src="coverUrl" class="np-image-desktop" @contextmenu="showMenu"></img>
 <div>
  <v-layout row wrap>
   <v-flex xs12>
    <p class="np-text-desktop ellipsis" v-if="playerStatus.current.title">{{title}}</p>
    <p class="np-text-desktop subtext ellipsis" v-else></p>
   </v-flex>
   <v-flex xs12>
    <p class="np-text-sub-desktop subtext ellipsis" v-if="playerStatus.current.artistAndComposer && playerStatus.current.album">{{playerStatus.current.artistAndComposer}}{{SEPARATOR}}{{playerStatus.current.album}}</p>
    <p class="np-text-sub-desktop subtext ellipsis" v-else-if="playerStatus.current.artistAndComposer && playerStatus.current.remote_title && playerStatus.current.remote_title!=playerStatus.current.title">{{playerStatus.current.artistAndComposer}}{{SEPARATOR}}{{playerStatus.current.remote_title}}</p>
    <p class="np-text-sub-desktop subtext ellipsis" v-else-if="playerStatus.current.artistAndComposer">{{playerStatus.current.artistAndComposer}}</p>
    <p class="np-text-sub-desktop subtext ellipsis" v-else-if="playerStatus.current.album">{{playerStatus.current.album}}</p>
    <p class="np-text-sub-desktop subtext ellipsis" v-else-if="playerStatus.current.remote_title && playerStatus.current.remote_title!=playerStatus.current.title">{{playerStatus.current.remote_title}}</p>
    <p class="np-text-sub-desktop subtext ellipsis" v-else-if="playerStatus.current.title">&#x22ef;</p>
    <p class="np-text-sub-desktop subtext ellipsis" v-else></p>
   </v-flex>
   <v-flex xs12>
    <v-progress-linear height="5" background-color="white" background-opacity="0.15" id="pos-slider" v-if="darkUi && playerStatus.current.duration>0" class="np-slider np-slider-desktop" :value="playerStatus.current.pospc" v-on:click="sliderChanged($event)"></v-progress-linear>
    <v-progress-linear height="5" background-color="black" background-opacity="0.15" id="pos-slider" v-else-if="playerStatus.current.duration>0" class="np-slider np-slider-desktop" :value="playerStatus.current.pospc" v-on:click="sliderChanged($event)"></v-progress-linear>
   </v-flex>
  </v-layout>
  <p v-if="showRatings && playerStatus.current.duration>0 && undefined!=rating.id" class="np-text-desktop np-tech-desktop np-tech-desktop-rating">
   <v-rating small v-if="maxRating>5" v-model="rating.value" half-increments hover clearable></v-rating>
   <v-rating small v-else v-model="rating.value" hover clearable></v-rating>
  </p>
  <p class="np-text-desktop np-tech-desktop ellipsis" v-else-if="techInfo" :title="playerStatus.current.technicalInfo">{{playerStatus.current.technicalInfo}}</p>
  <p class="np-text-desktop np-time-desktop cursor" @click="toggleTime()">{{formattedTime}}</p>
 </div>
 <div v-if="info.show" class="np-info np-info-desktop bgnd-cover np-info-cover" id="np-info">
  <v-tabs centered v-model="info.tab" v-if="info.showTabs" style="np-info-tab-cover">
   <template v-for="(tab, index) in info.tabs">
    <v-tab :key="index">{{tab.title}}</v-tab>
    <v-tab-item :key="index" transition="" reverse-transition=""> <!-- background image causes glitches with transitions -->
     <v-card flat class="np-info-card-cover">
      <v-card-text class="np-info-text-desktop" v-bind:class="{'np-info-lyrics': LYRICS_TAB==index}" v-html="tab.text"></v-card-text>
     </v-card>
    </v-tab-item>
   </template>
  </v-tabs>
  <div v-else>
   <v-layout row>
    <template v-for="(tab, index) in info.tabs">
     <v-flex xs4>
      <v-card flat class="np-info-card-cover">
       <v-card-title><p>{{tab.title}}</p></v-card-title>
       <v-card-text class="np-info-text-full-desktop" v-bind:class="{'np-info-lyrics': LYRICS_TAB==index}" v-html="tab.text"></v-card-text>
      </v-card>
     </v-flex>
    </template>
   </v-layout>
  </div>
  <v-card class="np-info-card-cover">
   <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn flat icon v-if="info.showTabs" @click="info.showTabs=false" :title="trans.collapse"><v-icon style="margin-right:-18px">chevron_left</v-icon><v-icon style="margin-left:-18px">chevron_right</v-icon></v-btn>
    <v-btn flat icon v-else @click="info.showTabs=true" :title="trans.expand"><v-icon style="margin-right:-18px">chevron_right</v-icon><v-icon style="margin-left:-18px">chevron_left</v-icon></v-btn>
    <div style="width:32px"></div>
    <v-btn flat icon v-if="info.sync" @click="info.sync = false" :title="trans.sync"><v-icon>link</v-icon></v-btn>
    <v-btn flat icon v-else @click="info.sync = true" :title="trans.unsync"><v-icon>link_off</v-icon></v-btn>
    <div style="width:32px"></div>
    <v-btn flat icon @click="trackInfo()" :title="trans.more"><img class="svg-img" :src="'more' | svgIcon(darkUi)"></img></v-btn>
    <div style="width:32px"></div>
    <v-btn flat icon @click="info.show = false" :title="trans.close"><v-icon>close</v-icon></v-btn>
    <v-spacer></v-spacer>
   </v-card-actions>
  </v-card>
 </div>
</div>
<div class="np-page bgnd-cover" v-else id="np-page">
 <div v-if="info.show" class="np-info bgnd-cover" id="np-info">
  <v-tabs centered v-model="info.tab" class="np-info-tab-cover">
   <template v-for="(tab, index) in info.tabs">
    <v-tab :key="index">{{tab.title}}</v-tab>
    <v-tab-item :key="index" transition="" reverse-transition=""> <!-- background image causes glitches with transitions -->
     <v-card flat class="np-info-card-cover">
      <v-card-text class="np-info-text" v-bind:class="{'np-info-lyrics': LYRICS_TAB==index}" v-html="tab.text"></v-card-text>
     </v-card>
    </v-tab-item>
   </template>
  </v-tabs>
  <v-card class="np-info-card-cover">
   <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn flat icon v-if="info.sync" @click="info.sync = false" :title="trans.sync"><v-icon>link</v-icon></v-btn>
    <v-btn flat icon v-else @click="info.sync = true" :title="trans.unsync"><v-icon>link_off</v-icon></v-btn>
    <div style="width:32px"></div>
    <v-btn flat icon @click="trackInfo()" :title="trans.more"><img class="svg-img" :src="'more' | svgIcon(darkUi)"></img></v-btn>
    <div style="width:32px"></div>
    <v-btn flat icon @click="info.show = false" :title="trans.close"><v-icon>close</v-icon></v-btn>
    <v-spacer></v-spacer>
   </v-card-actions>
  </v-card>
 </div>
 <div v-else>
  <div v-if="landscape">
   <img v-if="!info.show" :src="coverUrl" class="np-image-landscape" v-bind:class="{'np-image-landscape-wide': wide}" @contextmenu="showMenu"></img>
   <div class="np-details-landscape">
    <div class="np-text-landscape np-title" v-if="playerStatus.current.title">{{title}}</div>
    <div class="np-text-landscape" v-else>&nbsp;</div>
    <div class="np-text-landscape subtext" v-if="playerStatus.current.artistAndComposer">{{playerStatus.current.artistAndComposer}}</div>
    <div class="np-text-landscape" v-else>&nbsp;</div>
    <div class="np-text-landscape subtext" v-if="playerStatus.current.album">{{playerStatus.current.album}}</div>
    <div class="np-text-landscape subtext" v-else-if="playerStatus.current.remote_title && playerStatus.current.remote_title!=playerStatus.current.title">{{playerStatus.current.remote_title}}</div>
    <div class="np-text-landscape" v-else>&nbsp;</div>
    <div v-if="showRatings && playerStatus.current.duration>0 && undefined!=rating.id" class="np-text-landscape">
     <v-rating v-if="maxRating>5" v-model="rating.value" half-increments hover clearable></v-rating>
     <v-rating v-else v-model="rating.value" hover clearable></v-rating>
    </div>
    <div v-if="wide">

     <v-layout text-xs-center row wrap class="np-controls-wide">
      <v-flex xs12 class="np-tech ellipsis" v-if="techInfo">{{playerStatus.current.technicalInfo}}</v-flex>
      <v-flex xs12 v-if="!info.show && undefined!=playerStatus.current.time">
       <v-layout class="np-time-layout">
        <p class="np-pos" v-bind:class="{'np-pos-center': playerStatus.current.duration<=0}">{{playerStatus.current.time | displayTime}}</p>
        <v-progress-linear height="5" background-color="black" background-opacity="0.15" v-if="playerStatus.current.duration>0" id="pos-slider" class="np-slider" :value="playerStatus.current.pospc" v-on:click="sliderChanged($event)"></v-progress-linear>
        <p class="np-duration cursor" v-if="(showTotal || !playerStatus.current.time) && playerStatus.current.duration>0" @click="toggleTime()">{{playerStatus.current.duration | displayTime}}</p>
        <p class="np-duration cursor" v-else-if="playerStatus.current.duration>0" @click="toggleTime()">-{{playerStatus.current.duration-playerStatus.current.time | displayTime}}</p>
       </v-layout>
      </v-flex>
      <v-flex xs4>
       <v-layout text-xs-center>
        <v-flex xs6>
         <v-btn :title="trans.repeatOne" flat icon v-if="playerStatus.playlist.repeat===1" @click="doAction(['playlist', 'repeat', 0])" v-bind:class="{'np-std-button': !stopButton}"><v-icon>repeat_one</v-icon></v-btn>
         <v-btn :title="trans.repeatAll" flat icon v-else-if="playerStatus.playlist.repeat===2" @click="doAction(['playlist', 'repeat', 1])" v-bind:class="{'np-std-button': !stopButton}"><v-icon>repeat</v-icon></v-btn>
         <v-btn :title="trans.repeatOff" flat icon v-else @click="doAction(['playlist', 'repeat', 2])" class="dimmed" v-bind:class="{'np-std-button': !stopButton}"><v-icon>repeat</v-icon></v-btn>
        </v-flex>
        <v-flex xs6><v-btn flat icon @click="doAction(['button', 'jump_rew'])" v-bind:class="{'np-std-button': !stopButton}"><v-icon large>skip_previous</v-icon></v-btn></v-flex>
       </v-layout>
      </v-flex>
      <v-flex xs4>
       <v-layout v-if="stopButton" text-xs-center>
        <v-flex xs6>
         <v-btn flat icon v-longpress="playPauseButton" @click.middle="showSleep" id="playPause"><v-icon large v-if="playerStatus.isplaying">pause</v-icon><v-icon large v-else>play_arrow</v-icon></v-btn>
        </v-flex>
        <v-flex xs6>
         <v-btn flat icon @click="doAction(['stop'])"><v-icon large>stop</v-icon></v-btn>
        </v-flex>
       </v-layout>
       <v-btn flat icon large v-else v-longpress="playPauseButton" @click.middle="showSleep" id="playPause" class="np-playpause"><v-icon x-large v-if="playerStatus.isplaying">pause_circle_outline</v-icon><v-icon x-large v-else>play_circle_outline</v-icon></v-btn>
      </v-flex>
      <v-flex xs4>
       <v-layout text-xs-center>
        <v-flex xs6><v-btn flat icon @click="doAction(['playlist', 'index', '+1'])" v-bind:class="{'np-std-button': !stopButton}"><v-icon large>skip_next</v-icon></v-btn></v-flex>
        <v-flex xs6>
         <v-btn :title="trans.shuffleAlbums" flat icon v-if="playerStatus.playlist.shuffle===2" @click="doAction(['playlist', 'shuffle', 0])" v-bind:class="{'np-std-button': !stopButton}"><v-icon class="shuffle-albums">shuffle</v-icon></v-btn>
         <v-btn :title="trans.shuffleAll" flat icon v-else-if="playerStatus.playlist.shuffle===1" @click="doAction(['playlist', 'shuffle', 2])" v-bind:class="{'np-std-button': !stopButton}"><v-icon>shuffle</v-icon></v-btn>
         <v-btn :title="trans.shuffleOff" flat icon v-else @click="doAction(['playlist', 'shuffle', 1])" class="dimmed" v-bind:class="{'np-std-button': !stopButton}"><v-icon>shuffle</v-icon></v-btn>
        </v-flex>
       </v-layout>
      </v-flex>
     </v-layout>

    </div>
   </div>
  </div>
  <div v-else>
   <div v-bind:style="{height: portraitPad+'px'}"></div>
   <p class="np-text np-title ellipsis" v-if="playerStatus.current.title">{{title}}</p>
   <p class="np-text" v-else>&nbsp;</p>
   <p class="np-text subtext ellipsis" v-if="playerStatus.current.artistAndComposer">{{playerStatus.current.artistAndComposer}}</p>
   <p class="np-text" v-else>&nbsp;</p>
   <p class="np-text subtext ellipsis" v-if="playerStatus.current.album">{{playerStatus.current.album}}</p>
   <p class="np-text subtext ellipsis" v-else-if="playerStatus.current.remote_title && playerStatus.current.remote_title!=playerStatus.current.title">{{playerStatus.current.remote_title}}</p>
   <p class="np-text" v-else>&nbsp;</p>
   <img v-if="!info.show" :src="coverUrl" class="np-image" v-bind:class="{'np-image-large' : !techInfo && !showRatings}" @contextmenu="showMenu" v-bind:style="{'margin-top': -portraitPad+'px'}"></img>
  </div>
  <v-layout text-xs-center row wrap class="np-controls" v-if="!wide">
   <v-flex xs12 v-if="showRatings && playerStatus.current.duration>0 && undefined!=rating.id && !landscape" class="np-text" v-bind:class="{'np-rating-shadow' : techInfo}">
    <v-rating v-if="maxRating>5" v-model="rating.value" half-increments hover clearable></v-rating>
    <v-rating v-else v-model="rating.value" hover clearable></v-rating>
   </v-flex>
   <v-flex xs12 class="np-tech ellipsis" v-if="techInfo">{{playerStatus.current.technicalInfo}}</v-flex>

   <v-flex xs12 v-if="!info.show && undefined!=playerStatus.current.time">
    <v-layout>
     <p class="np-pos" v-bind:class="{'np-pos-center': playerStatus.current.duration<=0}">{{playerStatus.current.time | displayTime}}</p>
     <v-progress-linear height="5" background-color="black" background-opacity="0.15" v-if="playerStatus.current.duration>0" id="pos-slider" class="np-slider" :value="playerStatus.current.pospc" v-on:click="sliderChanged($event)"></v-progress-linear>
     <p class="np-duration cursor" v-if="(showTotal || !playerStatus.current.time) && playerStatus.current.duration>0" @click="toggleTime()">{{playerStatus.current.duration | displayTime}}</p>
     <p class="np-duration cursor" v-else-if="playerStatus.current.duration>0" @click="toggleTime()">-{{playerStatus.current.duration-playerStatus.current.time | displayTime}}</p>
    </v-layout>
   </v-flex>

   <v-flex xs4 class="no-control-adjust">
    <v-layout text-xs-center>
     <v-flex xs6>
      <v-btn :title="trans.repeatOne" flat icon v-if="playerStatus.playlist.repeat===1" @click="doAction(['playlist', 'repeat', 0])" v-bind:class="{'np-std-button': !stopButton}"><v-icon>repeat_one</v-icon></v-btn>
      <v-btn :title="trans.repeatAll" flat icon v-else-if="playerStatus.playlist.repeat===2" @click="doAction(['playlist', 'repeat', 1])" v-bind:class="{'np-std-button': !stopButton}"><v-icon>repeat</v-icon></v-btn>
      <v-btn :title="trans.repeatOff" flat icon v-else @click="doAction(['playlist', 'repeat', 2])" class="dimmed" v-bind:class="{'np-std-button': !stopButton}"><v-icon>repeat</v-icon></v-btn>
     </v-flex>
     <v-flex xs6><v-btn flat icon @click="doAction(['button', 'jump_rew'])" v-bind:class="{'np-std-button': !stopButton}"><v-icon large>skip_previous</v-icon></v-btn></v-flex>
    </v-layout>
   </v-flex>
   <v-flex xs4 class="no-control-adjust">
    <v-layout v-if="stopButton" text-xs-center>
     <v-flex xs6>
      <v-btn flat icon v-longpress="playPauseButton" @click.middle="showSleep" id="playPause"><v-icon large v-if="playerStatus.isplaying">pause</v-icon><v-icon large v-else>play_arrow</v-icon></v-btn>
     </v-flex>
     <v-flex xs6>
      <v-btn flat icon @click="doAction(['stop'])"><v-icon large>stop</v-icon></v-btn>
     </v-flex>
    </v-layout>
    <v-btn flat icon large v-else v-longpress="playPauseButton" @click.middle="showSleep" id="playPause" class="np-playpause"><v-icon x-large v-if="playerStatus.isplaying">pause_circle_outline</v-icon><v-icon x-large v-else>play_circle_outline</v-icon></v-btn>
   </v-flex>
   <v-flex xs4 class="no-control-adjust">
    <v-layout text-xs-center>
     <v-flex xs6><v-btn flat icon @click="doAction(['playlist', 'index', '+1'])" v-bind:class="{'np-std-button': !stopButton}"><v-icon large>skip_next</v-icon></v-btn></v-flex>
     <v-flex xs6>
      <v-btn :title="trans.shuffleAlbums" flat icon v-if="playerStatus.playlist.shuffle===2" @click="doAction(['playlist', 'shuffle', 0])" v-bind:class="{'np-std-button': !stopButton}"><v-icon class="shuffle-albums">shuffle</v-icon></v-btn>
      <v-btn :title="trans.shuffleAll" flat icon v-else-if="playerStatus.playlist.shuffle===1" @click="doAction(['playlist', 'shuffle', 2])" v-bind:class="{'np-std-button': !stopButton}"><v-icon>shuffle</v-icon></v-btn>
      <v-btn :title="trans.shuffleOff" flat icon v-else @click="doAction(['playlist', 'shuffle', 1])" class="dimmed" v-bind:class="{'np-std-button': !stopButton}"><v-icon>shuffle</v-icon></v-btn>
     </v-flex>
    </v-layout>
   </v-flex>
  </v-layout>
 </div>
</div></div>
`,
    props: [ 'desktop' ],
    data() {
        return { coverUrl:LMS_BLANK_COVER,
                 playerStatus: {
                    isplaying: false,
                    sleepTimer: false,
                    current: { canseek:1, duration:0, time:undefined, title:undefined, artist:undefined, artistAndComposer: undefined,
                               album:undefined, albumName:undefined, technicalInfo: "", pospc:0.0, tracknum:undefined },
                    playlist: { shuffle:0, repeat: 0 },
                 },
                 info: { show: false, tab:LYRICS_TAB, showTabs:false, sync: true,
                         tabs: [ { title:undefined, text:undefined }, { title:undefined, text:undefined }, { title:undefined, text:undefined } ] },
                 trans: { close: undefined, expand:undefined, collapse:undefined, sync:undefined, unsync:undefined, more:undefined,
                          repeatAll:undefined, repeatOne:undefined, repeatOff:undefined,
                          shuffleAll:undefined, shuffleAlbums:undefined, shuffleOff:undefined },
                 showTotal: true,
                 portraitPad: 0,
                 landscape: false,
                 wide: false,
                 largeView: false,
                 menu: { show: false, x:0, y:0, text: ["", ""] },
                 rating: {value:0, id:undefined, setting:false},
                };
    },
    mounted() {
        if (this.desktop) {
            this.info.showTabs=getLocalStorageBool("showTabs", false);
            bus.$on('largeView', function(val) {
                if (val) {
                    this.info.show = false;
                }
                this.largeView = val;
            }.bind(this));
        } else {
            this.portraitElem = document.getElementById("np-page");
            this.lastWidth = this.portraitElem ? this.portraitElem.offsetWidth : 0;
            this.lastHeight = this.portraitElem ? this.portraitElem.offsetHeight : 0;
            this.calcPortraitPad();
            var npView = this;
            window.addEventListener('resize', () => {
                if (npView.resizeTimeout) {
                    clearTimeout(npView.resizeTimeout);
                }
                npView.resizeTimeout = setTimeout(function () {
                    // Only update if changed
                    if (!npView.landscape && !npView.portraitElem) {
                        npView.portraitElem = document.getElementById("np-page");
                        npView.lastWidth = npView.portraitElem ? npView.portraitElem.offsetWidth : 0;
                        npView.lastHeight = npView.portraitElem ? npView.portraitElem.offsetHeight : 0;
                    }
                    if (npView.portraitElem &&
                        (Math.abs(npView.lastWidth-npView.portraitElem.offsetWidth)>4 || Math.abs(npView.lastHeight-npView.portraitElem.offsetHeight))) {
                        npView.lastWidth = npView.portraitElem.offsetWidth;
                        npView.lastHeight = npView.portraitElem.offsetHeight;
                        npView.calcPortraitPad();
                    }
                    npView.resizeTimeout = undefined;
                }, 50);
            }, false);
        }
        this.info.sync=getLocalStorageBool("syncInfo", true);
        bus.$on('playerStatus', function(playerStatus) {
            var playStateChanged = false;
            var trackChanged = false;

            // Have other items changed
            if (playerStatus.isplaying!=this.playerStatus.isplaying) {
                this.playerStatus.isplaying = playerStatus.isplaying;
                playStateChanged = true;
            }
            if (playerStatus.current.canseek!=this.playerStatus.current.canseek) {
                this.playerStatus.current.canseek = playerStatus.current.canseek;
            }
            if (playerStatus.current.duration!=this.playerStatus.current.duration) {
                this.playerStatus.current.duration = playerStatus.current.duration;
            }
            if (playerStatus.current.time!=this.playerStatus.current.time || playStateChanged) {
                this.playerStatus.current.time = playerStatus.current.time;
                this.playerStatus.current.updated = new Date();
                this.playerStatus.current.origTime = playerStatus.current.time;
            }
            this.setPosition();
            if (playerStatus.current.id!=this.playerStatus.current.id) {
                this.playerStatus.current.id = playerStatus.current.id;
            }
            if (playerStatus.current.title!=this.playerStatus.current.title) {
                this.playerStatus.current.title = playerStatus.current.title;
                trackChanged = true;
            }
            if (playerStatus.current.tracknum!=this.playerStatus.current.tracknum) {
                this.playerStatus.current.tracknum = playerStatus.current.tracknum;
                trackChanged = true;
            }
            if (playerStatus.will_sleep_in!=this.playerStatus.sleepTimer) {
                this.playerStatus.sleepTimer = playerStatus.will_sleep_in;
            }
            var artist = playerStatus.current.artist ? playerStatus.current.artist : playerStatus.current.trackartist;
            var artist_ids = playerStatus.current.artist_ids ? playerStatus.current.artist_ids : playerStatus.current.trackartist_ids;
            if (this.playerStatus.current.artist!=artist ||
                playerStatus.current.artist_id!=this.playerStatus.current.artist_id ||
                playerStatus.current.artist_ids!=artist_ids) {
                this.playerStatus.current.artist = artist;
                this.playerStatus.current.artist_id = playerStatus.current.artist_id;
                this.playerStatus.current.artist_ids = artist_ids;
                trackChanged = true;
            }
            if (playerStatus.current.albumartist!=this.playerStatus.current.albumartist ||
                playerStatus.current.albumartist_ids!=this.playerStatus.current.albumartist_ids ) {
                this.playerStatus.current.albumartist = playerStatus.current.albumartist;
                this.playerStatus.current.albumartist_ids = playerStatus.current.albumartist_ids;
                trackChanged = true;
            }
            if (playerStatus.current.album!=this.playerStatus.current.albumName ||
                playerStatus.current.album_id!=this.playerStatus.current.album_id) {
                this.playerStatus.current.albumName = playerStatus.current.album;
                this.playerStatus.current.album_id = playerStatus.current.album_id;
                if (playerStatus.current.year && playerStatus.current.year>0) {
                    this.playerStatus.current.album = this.playerStatus.current.albumName+" ("+ playerStatus.current.year+")";
                } else {
                    this.playerStatus.current.album = this.playerStatus.current.albumName;
                }
                trackChanged = true;
            }
            if (playerStatus.current.remote_title!=this.playerStatus.current.remote_title) {
                this.playerStatus.current.remote_title = playerStatus.current.remote_title;
                trackChanged = true;
            }
            var artistAndComposer;
            if (playerStatus.current.composer && playerStatus.current.genre && COMPOSER_GENRES.has(playerStatus.current.genre)) {
                artistAndComposer = addPart(this.playerStatus.current.artist, playerStatus.current.composer);
            } else {
                artistAndComposer = this.playerStatus.current.artist;
            }
            if (artistAndComposer!=this.playerStatus.current.artistAndComposer) {
                this.playerStatus.current.artistAndComposer = artistAndComposer;
            }
            if (playerStatus.playlist.shuffle!=this.playerStatus.playlist.shuffle) {
                this.playerStatus.playlist.shuffle = playerStatus.playlist.shuffle;
            }
            if (playerStatus.playlist.repeat!=this.playerStatus.playlist.repeat) {
                this.playerStatus.playlist.repeat = playerStatus.playlist.repeat;
            }
            var technical = [];
            if (playerStatus.current.bitrate) {
                technical.push(playerStatus.current.bitrate);
            }
            if (playerStatus.current.type) {
                var bracket = playerStatus.current.type.indexOf(" (");
                technical.push(bracket>0 ? playerStatus.current.type.substring(0, bracket) : playerStatus.current.type);
            }
            technical=technical.join(", ");
            if (technical!=this.playerStatus.current.technicalInfo) {
                this.playerStatus.current.technicalInfo = technical;
            }

            if (trackChanged && this.info.sync) {
                this.setInfoTrack();
                this.showInfo();
            }

            if (playStateChanged) {
                if (this.playerStatus.isplaying) {
                    this.startPositionInterval();
                } else {
                    this.stopPositionInterval();
                }
            } else if (this.playerStatus.isplaying && trackChanged) {
                this.startPositionInterval();
            }

            if (this.rating.id!=playerStatus.current.id) {
                this.rating.id = playerStatus.current.duration && playerStatus.current.duration>0 &&
                                 (!playerStatus.current.type || playerStatus.current.type.toLowerCase().indexOf("radio")<0)
                                    ? playerStatus.current.id : undefined;
                if (this.$store.state.ratingsSupport) {
                    this.getRating();
                }
            }
        }.bind(this));
        // Refresh status now, in case we were mounted after initial status call
        bus.$emit('refreshStatus');

        this.page = document.getElementById("np-page");
        bus.$on('themeChanged', function() {
            this.setBgndCover();
        }.bind(this));

        this.landscape = isLandscape();
        this.wide = this.landscape && isWide();
        bus.$on('screenLayoutChanged', function() {
            this.landscape = isLandscape();
            this.wide = this.landscape && isWide();
        }.bind(this));

        bus.$on('currentCover', function(coverUrl) {
            this.coverUrl = undefined==coverUrl ? LMS_BLANK_COVER : coverUrl;
            this.setBgndCover();
        }.bind(this));
        bus.$emit('getCurrentCover');

        bus.$on('langChanged', function() {
            this.initItems();
        }.bind(this));
        this.initItems();

        bus.$on('info', function() {
            if (this.playerStatus && this.playerStatus.current && this.playerStatus.current.artist) {
                this.largeView = false;
                this.info.show=!this.info.show;
            }
        }.bind(this));

        this.showTotal = getLocalStorageBool('showTotal', true);
    },
    methods: {
        initItems() {
            this.trans = { close:i18n("Close"), expand:i18n("Show all information"), collapse:i18n("Show information in tabs"),
                           sync:i18n("Update information when song changes"), unsync:i18n("Don't update information when song changes"),
                           more:i18n("More"),
                           repeatAll:i18n("Repeat queue"), repeatOne:i18n("Repeat single track"), repeatOff:i18n("No repeat"),
                           shuffleAll:i18n("Shuffle tracks"), shuffleAlbums:i18n("Shuffle albums"), shuffleOff:i18n("No shuffle") };
            this.info.tabs[LYRICS_TAB].title=i18n("Lyrics");
            this.info.tabs[BIO_TAB].title=i18n("Artist Biography");
            this.info.tabs[REVIEW_TAB].title=i18n("Album Review");
            this.menu.text[0]=i18n("Show image");
            this.menu.text[1]=i18n("Show track information");
        },
        calcPortraitPad() {
            // Calculate padding, so that (in portrait mode) text is not too far from cover
            if (!this.portraitElem || this.landscape) {
                this.portraitPad = 0;
            } else {
                var coverMax = this.portraitElem.offsetWidth-/*pad*/32;
                var topAndBotSpace = (this.portraitElem.offsetHeight - (coverMax + /*bottom*/120 + /*text*/80))/2;
                var portraitPad = Math.max(0, Math.floor(topAndBotSpace/2)-8);
                if (portraitPad!=this.portraitPad) {
                    this.portraitPad = portraitPad;
                }
            }
        },
        showMenu(event) {
            event.preventDefault();
            if (this.coverUrl && this.coverUrl!=LMS_BLANK_COVER) {
                this.menu.show = false;
                this.menu.x = event.clientX;
                this.menu.y = event.clientY;
                this.$nextTick(() => {
                    this.menu.show = true;
                });
            }
        },
        showPic() {
            var npPage = this;
            this.gallery = new PhotoSwipe(document.querySelectorAll('.pswp')[0], PhotoSwipeUI_Default, [{src:this.coverUrl, w:0, h:0}], {index: 0});
            this.gallery.listen('gettingData', function (index, item) {
                if (item.w < 1 || item.h < 1) {
                    var img = new Image();
                    img.onload = function () {
                        item.w = this.width;
                        item.h = this.height;
                        npPage.gallery.updateSize(true);
                    };
                    img.src = item.src;
                }
            });
            this.gallery.init();
            bus.$emit('dialogOpen', 'np-viewer', true);
            this.gallery.listen('close', function() { bus.$emit('dialogOpen', 'np-viewer', false); });
        },
        doAction(command) {
            bus.$emit('playerCommand', command);
        },
        setPosition() {
            var pc = this.playerStatus.current && undefined!=this.playerStatus.current.time && undefined!=this.playerStatus.current.duration &&
                     this.playerStatus.current.duration>0 ? 100*Math.floor(this.playerStatus.current.time*1000/this.playerStatus.current.duration)/1000 : 0.0;

            if (pc!=this.playerStatus.current.pospc) {
                this.playerStatus.current.pospc = pc;
            }
        },
        sliderChanged(e) {
            if (this.playerStatus.current.canseek && this.playerStatus.current.duration>3) {
                const rect = document.getElementById("pos-slider").getBoundingClientRect();
                const pos = e.clientX - rect.x;
                const width = rect.width;
                this.doAction(['time', Math.floor(this.playerStatus.current.duration * pos / rect.width)]);
            }
        },
        setInfoTrack() {
            this.infoTrack={ title: this.playerStatus.current.title, track_id: this.playerStatus.current.id,
                             artist: this.playerStatus.current.artist, artist_id: this.playerStatus.current.artist_id,
                             albumartist: this.playerStatus.current.albumartist, albumartist_ids: this.playerStatus.current.albumartist_ids,
                             artist_ids: this.playerStatus.current.artist_ids,
                             album: this.playerStatus.current.albumName, album_id: this.playerStatus.current.album_id };
        },
        trackInfo() {
            this.info.show=false;
            this.largeView=false;
            if (this.desktop) {
                bus.$emit('trackInfo', {id: "track_id:"+this.playerStatus.current.id, title:this.playerStatus.current.title, image: this.coverUrl});
            } else {
                this.$store.commit('setPage', 'browse');
                this.$nextTick(function () {
                    bus.$emit('trackInfo', {id: "track_id:"+this.playerStatus.current.id, title:this.playerStatus.current.title});
                });
            }
        },
        fetchLyrics() {
            if (this.info.tabs[LYRICS_TAB].artist!=this.infoTrack.artist || this.info.tabs[LYRICS_TAB].songtitle!=this.infoTrack.title ||
                (this.infoTrack.track_id && this.info.tabs[LYRICS_TAB].track_id!=this.infoTrack.track_id) ||
                (this.infoTrack.artist_id && this.info.tabs[LYRICS_TAB].artist_id!=this.infoTrack.artist_id)) {
                this.info.tabs[LYRICS_TAB].text=i18n("Fetching...");
                this.info.tabs[LYRICS_TAB].track_id=this.infoTrack.track_id;
                this.info.tabs[LYRICS_TAB].artist=this.infoTrack.artist;
                this.info.tabs[LYRICS_TAB].artist_id=this.infoTrack.artist_id;
                this.info.tabs[LYRICS_TAB].songtitle=this.infoTrack.title;
                var command = ["musicartistinfo", "lyrics", "html:1"];
                if (this.infoTrack.title!=undefined) {
                    command.push("title:"+this.infoTrack.title);
                }
                if (this.infoTrack.track_id!=undefined) {
                    command.push("track_id:"+this.infoTrack.track_id);
                }
                if (this.infoTrack.artist_id!=undefined) {
                    command.push("artist_id:"+this.infoTrack.artist_id);
                }
                if (this.infoTrack.artist!=undefined && (!this.infoTrack.artist_ids || this.infoTrack.artist_ids.split(", ").length==1)) {
                    command.push("artist:"+this.infoTrack.artist);
                }
                lmsCommand("", command).then(({data}) => {
                    if (data && data.result && (data.result.lyrics || data.result.error)) {
                        this.info.tabs[LYRICS_TAB].text=data.result.lyrics ? replaceNewLines(data.result.lyrics) : data.result.error;
                    }
                }).catch(error => {
                    this.info.tabs[LYRICS_TAB].text=i18n("Failed to retreive information.");
                });
            }
        },
        fetchBio() {
            if (this.info.tabs[BIO_TAB].artist!=this.infoTrack.artist ||
                (this.infoTrack.artist_id && this.info.tabs[BIO_TAB].artist_id!=this.infoTrack.artist_id)) {
                this.info.tabs[BIO_TAB].text=i18n("Fetching...");
                this.info.tabs[BIO_TAB].artist=this.infoTrack.artist;
                this.info.tabs[BIO_TAB].artist_id=this.infoTrack.artist_id;

                var ids = this.infoTrack.artist_ids ? this.infoTrack.artist_ids.split(", ") : [];
                if (ids.length>1) {
                    this.info.tabs[BIO_TAB].first = true;
                    this.info.tabs[BIO_TAB].found = false;
                    this.info.tabs[BIO_TAB].count = ids.length;
                    for (var i=0, len=ids.length; i<len; ++i) {
                        lmsCommand("", ["musicartistinfo", "biography", "artist_id:"+ids[i], "html:1"]).then(({data}) => {
                            if (data && data.result && (data.result.biography || data.result.error)) {
                                if (data.result.artist) {
                                    this.info.tabs[BIO_TAB].found = true;
                                    if (this.info.tabs[BIO_TAB].first) {
                                        this.info.tabs[BIO_TAB].text="";
                                        this.info.tabs[BIO_TAB].first = false;
                                    } else {
                                        this.info.tabs[BIO_TAB].text+="<br/><br/>";
                                    }
                                    this.info.tabs[BIO_TAB].text+="<b>"+data.result.artist+"</b><br/>"+(data.result.biography ? replaceNewLines(data.result.biography) : data.result.error);
                                }
                            }
                            this.info.tabs[BIO_TAB].count--;
                            if (0 == this.info.tabs[BIO_TAB].count && !this.info.tabs[BIO_TAB].found) {
                                this.info.tabs[BIO_TAB].text = i18n("No artist found");
                            }
                        });
                    }
                } else {
                    var command = ["musicartistinfo", "biography", "html:1"];
                    if (this.infoTrack.artist_id!=undefined) {
                        command.push("artist_id:"+this.infoTrack.artist_id);
                    }
                    if (this.infoTrack.artist!=undefined && (!this.infoTrack.artist_ids || this.infoTrack.artist_ids.split(", ").length==1)) {
                        command.push("artist:"+this.infoTrack.artist);
                    }
                    lmsCommand("", command).then(({data}) => {
                        if (data && data.result && (data.result.biography || data.result.error)) {
                            this.info.tabs[BIO_TAB].text=data.result.biography ? replaceNewLines(data.result.biography) : data.result.error;
                        }
                    }).catch(error => {
                        this.info.tabs[BIO_TAB].text=i18n("Failed to retreive information.");
                    });
                }
            }
        },
        fetchReview() {
            if (this.info.tabs[REVIEW_TAB].albumartist!=this.infoTrack.albumartist || this.info.tabs[REVIEW_TAB].album!=this.infoTrack.album ||
                (this.infoTrack.albumartist_ids && this.info.tabs[REVIEW_TAB].albumartist_ids!=this.infoTrack.albumartist_ids) ||
                (this.infoTrack.album_id && this.info.tabs[REVIEW_TAB].album_id!=this.infoTrack.album_id)) {
                this.info.tabs[REVIEW_TAB].text=i18n("Fetching...");
                this.info.tabs[REVIEW_TAB].albumartist=this.infoTrack.albumartist;
                this.info.tabs[REVIEW_TAB].albumartist_ids=this.infoTrack.albumartist_ids;
                this.info.tabs[REVIEW_TAB].album=this.infoTrack.album;
                this.info.tabs[REVIEW_TAB].artist_id=this.infoTrack.artist_id;
                this.info.tabs[REVIEW_TAB].album_id=this.infoTrack.album_id;
                var command = ["musicartistinfo", "albumreview", "html:1"];
                if (this.infoTrack.albumartist_ids!=undefined) {
                    command.push("artist_id:"+this.infoTrack.albumartist_ids.split(", ")[0]);
                } else if (this.infoTrack.artist_id!=undefined) {
                    command.push("artist_id:"+this.infoTrack.artist_id);
                }
                if (this.infoTrack.albumartist!=undefined) {
                    command.push("artist:"+this.infoTrack.albumartist);
                } else if (this.infoTrack.artist!=undefined) {
                    command.push("artist:"+this.infoTrack.artist);
                }
                if (this.infoTrack.album_id!=undefined) {
                    command.push("album_id:"+this.infoTrack.album_id);
                }
                if (this.infoTrack.album!=undefined) {
                    command.push("album:"+this.infoTrack.album);
                }

                lmsCommand("", command).then(({data}) => {
                    if (data && data.result && (data.result.albumreview || data.result.error)) {
                        this.info.tabs[REVIEW_TAB].text=data.result.albumreview ? replaceNewLines(data.result.albumreview) : data.result.error;
                    }
                }).catch(error => {
                    this.info.tabs[REVIEW_TAB].text=i18n("Failed to retreive information.");
                });
            }
        },
        showInfo() {
            if (!this.info.show || !this.infoTrack) {
                return;
            }
            this.$nextTick(function () {
                var elem = document.getElementById("np-info");
                if (elem) {
                    elem.style.backgroundImage = "url('"+(this.$store.state.infoBackdrop && this.coverUrl!=LMS_BLANK_COVER ? this.coverUrl : "") +"')";
                }
            });
            if (this.desktop && !this.showTabs) {
                this.fetchLyrics();
                this.fetchBio();
                this.fetchReview();
            } else if (LYRICS_TAB==this.info.tab) {
                this.fetchLyrics();
            } else if (BIO_TAB==this.info.tab) {
                this.fetchBio();
            } else {
                this.fetchReview();
            }
        },
        startPositionInterval() {
            this.stopPositionInterval();
            this.positionInterval = setInterval(function () {
                if (undefined!=this.playerStatus.current.time && this.playerStatus.current.time>=0) {
                    var current = new Date();
                    var diff = (current.getTime()-this.playerStatus.current.updated.getTime())/1000.0;
                    this.playerStatus.current.time = this.playerStatus.current.origTime + diff;
                    this.setPosition();
                    if (this.playerStatus.current.duration && this.playerStatus.current.duration>0 &&
                        this.playerStatus.current.time>=(this.playerStatus.current.duration+2)) {
                        bus.$emit('refreshStatus');
                    }
                }
            }.bind(this), 1000);
        },
        stopPositionInterval() {
            if (undefined!==this.positionInterval) {
                clearInterval(this.positionInterval);
                this.positionInterval = undefined;
            }
        },
        toggleTime() {
            this.showTotal = !this.showTotal;
            setLocalStorageVal("showTotal", this.showTotal);
        },
        setBgndCover() {
            if (this.page && (!this.desktop || this.largeView)) {
                setBgndCover(this.page, this.$store.state.nowPlayingBackdrop && this.coverUrl!=LMS_BLANK_COVER ? this.coverUrl : undefined, this.$store.state.darkUi);
            }
        },
        playPauseButton(showSleepMenu) {
            if (showSleepMenu) {
                bus.$emit('dlg.open', 'sleep', this.$store.state.player);
            } else {
                this.doAction([this.playerStatus.isplaying ? 'pause' : 'play']);
            }
        },
        showSleep() {
            bus.$emit('dlg.open', 'sleep', this.$store.state.player);
        },
        getRating() {
            if (undefined!=this.rating.id) {
                this.rating.setting = true;
                lmsCommand("", ["trackstat", "getrating", this.rating.id]).then(({data}) => {
                    if (data && data.result && undefined!=data.result.ratingpercentage) {
                        this.rating.value = adjustRatingFromServer(data.result.ratingpercentage);
                    }
                    this.rating.setting = false;
                }).catch(err => {
                    this.rating.setting = false;
                    //slogError(err);
                });
            }
        }
    },
    filters: {
        displayTime: function (value) {
            if (undefined==value || value<0) {
                return '';
            }
            return formatSeconds(Math.floor(value));
        },
        svgIcon: function (name, dark) {
            return "html/images/"+name+(dark ? "-dark" : "-light")+".svg?r=" + LMS_MATERIAL_REVISION;
        }
    },
    watch: {
        'info.show': function(val) {
            // Indicate that dialog is/isn't shown, so that swipe is controlled
            bus.$emit('dialogOpen', 'info-dialog', val);
            this.setInfoTrack();
            this.showInfo();
        },
        'info.tab': function(tab) {
            this.showInfo();
        },
        'info.showTabs': function() {
            setLocalStorageVal("showTabs", this.info.showTabs);
        },
        'info.sync': function() {
            setLocalStorageVal("syncInfo", this.info.sync);
            if (this.info.sync) {
                this.setInfoTrack();
                this.showInfo();
            }
        },
        'largeView': function(val) {
            if (val) {
                // Save current style so can reset when largeview disabled
                if (!this.before) {
                    var elem = document.getElementById("np-bar");
                    if (elem) {
                        this.before = elem.style;
                    }
                }
                this.$nextTick(function () {
                    this.page = document.getElementById("np-page");
                    this.setBgndCover();
                });
            } else {
                if (this.before) {
                    this.$nextTick(function () {
                        var elem = document.getElementById("np-bar");
                        if (elem) {
                            elem.style = this.before;
                        }
                    });
                }
                this.page = undefined;
            }
            bus.$emit('largeViewVisible', val);
        },
        'rating.value': function(newVal) {
            if (this.$store.state.ratingsSupport && !this.rating.setting && undefined!=this.rating.id) {
                lmsCommand(this.$store.state.player.id, ["trackstat", "setrating", this.rating.id, adjustRatingToServer(newVal)]).then(({data}) => {
                    this.getRating();
                });
            }
        },
        'landscape': function(val) {
            if (!val) {
                this.$nextTick(() => {
                    this.portraitElem = document.getElementById("np-page");
                    this.lastWidth = this.portraitElem ? this.portraitElem.offsetWidth : 0;
                    this.lastHeight = this.portraitElem ? this.portraitElem.offsetHeight : 0;
                    this.calcPortraitPad();
                });
            }
        }
    },
    computed: {
        infoPlugin() {
            return this.$store.state.infoPlugin
        },
        stopButton() {
            return this.$store.state.stopButton
        },
        techInfo() {
            return this.$store.state.techInfo
        },
        formattedTime() {
            return this.playerStatus && this.playerStatus.current
                        ? !this.showTotal && undefined!=this.playerStatus.current.time && this.playerStatus.current.duration>0
                            ? formatSeconds(Math.floor(this.playerStatus.current.time))+" / -"+
                              formatSeconds(Math.floor(this.playerStatus.current.duration-this.playerStatus.current.time))
                            : (undefined!=this.playerStatus.current.time ? formatSeconds(Math.floor(this.playerStatus.current.time)) : "") +
                              (undefined!=this.playerStatus.current.time && this.playerStatus.current.duration>0 ? " / " : "") +
                              (this.playerStatus.current.duration>0 ? formatSeconds(Math.floor(this.playerStatus.current.duration)) : "")
                        : undefined;
        },
        darkUi() {
            return this.$store.state.darkUi
        },
        showRatings() {
            return this.$store.state.ratingsSupport
        },
        maxRating() {
            return this.$store.state.maxRating
        },
        title() {
            if (this.$store.state.nowPlayingTrackNum && this.playerStatus.current.tracknum) {
                return (this.playerStatus.current.tracknum>9 ? this.playerStatus.current.tracknum : ("0" + this.playerStatus.current.tracknum))+SEPARATOR+this.playerStatus.current.title;
            }
            return this.playerStatus.current.title;
        }
    },
    beforeDestroy() {
        this.stopPositionInterval();
    }
});

var app = angular.module('withSong', ['ngCookies', 'ngDialog', 'ngTouch']);
app.controller('withSongController',['$scope','$http','$window', 'ngDialog', '$cookies', function($scope, $http, $window, ngDialog, $cookies) {

    $scope.stopActions = function ($event) {
        if ($event.stopPropagation) {
            $event.stopPropagation();
        }
        if ($event.preventDefault) {
            $event.preventDefault();
        }
        $event.cancelBubble = true;
        $event.returnValue = false;
    };

    $scope.leftSwipe = function($event){
        $scope.stopActions($event);
        if($scope.container == 'myList'){
            $scope.container = 'searchList'
        }else if($scope.container == 'rankList'){
            $scope.container = 'myList';
        }
    };

    $scope.rightSwipe = function($event){
        $scope.stopActions($event);
        if($scope.container == 'myList'){
            $scope.container = 'rankList';
        }else if($scope.container == 'searchList'){
            $scope.container = 'myList';
        }
    };

    var melonApiKey = "d1d6323f-b411-307d-8a36-12dd19c33646";
    var youtubeApiKey = "AIzaSyAYJcoUSoEpehRGo-0XYHd4zafkiSmt9Wk";

    var melonUrlList = {
        newest : "http://apis.skplanetx.com/melon/newreleases/songs?",      // 최신곡
        realtimeBest : "http://apis.skplanetx.com/melon/charts/realtime?"   // 현재 베스트
    };

    $scope.melonUrl = "";
    $scope.nowChart = "SELECT CHART";

    var youtubeUrl = "https://www.googleapis.com/youtube/v3/search?";

    // my song list
    $scope.mySongList = [];

    // array of video search on youtube.
    $scope.searchList = [];

    // list of songs taken from the melon.
    $scope.melonChartList = [];

    // current playing video info
    $scope.currentVideo = {
        list: "",
        index: "",
        element:""
    };

    // init cookies
    var cookies = $cookies.getAll();
    angular.forEach(cookies, function (v, k) {
        $cookies.remove(k);
    });

    // init for melon api
    function MelonParam(version, page, count, format, appKey){
        this.version = version; // api version
        this.page = page;       // where do you want page
        this.count = count;     // how many song per a page
        this.format = format;   // what is format for output
        this.appKey = appKey;   // api key
    }

    // init for youtube api
    function youtubeParam(q, part, key){
        this.q = q;         // search word
        this.part = part;   // resource identifier
        this.key = key;     // api key
    }

    // chart dropdown visible?
    $scope.chartMenuVisible = false;

    // chart dropdown toggle
    $scope.chartToggle = function(){
        $scope.chartMenuVisible = !$scope.chartMenuVisible;
    };

    // make url
    function makeUrl(base, require){
        var result = [];
        for(var i in require){
            result.push(i + "=" + require[i]);
        }
        return base + result.join("&")
    }

    // function for request failed
    function requestFail(res){
        console.log('getting "'+ res.config.url +'" failed' + '\n', res.status);
    }

    // about 'GET request
    function MelonRequest(url){
        $scope.melonChartList = [];
        var songList = [];
        $http.get(url)
            .then(
                // request for chart to melon is success
                function(res){
                    var songLists = res.data.melon.songs.song;
                    for(var i in songLists){
                        var pushStr = songLists[i].songName + ' ' + songLists[i].artists.artist[0].artistName;
                        songList.push(encodeURIComponent(pushStr));
                    }

                    // call youtube api
                    for(var j in songList){
                        var ytParamForChart = new youtubeParam(songList[j], 'snippet', youtubeApiKey);
                        var ytUrlForChart = makeUrl(youtubeUrl, ytParamForChart);
                        $http.get(ytUrlForChart + '&order=viewCount') //viewCount sort
                            .then(
                                // request for search to youtube is success
                                function(res){
                                    var items = res.data.items;
                                    if(items.length) {
                                        $scope.melonChartList.push(items[0]);   //일단 첫번째 오브젝트만
                                    }

                                },
                                // request for search to youtube is fail
                                requestFail
                            )
                    }
                },
                // request for chart to melon is fail
                requestFail
            )
    }

    // chart dropdown select
    $scope.selectChart = function(chart){
        $scope.melonUrl = melonUrlList[chart];
        $scope.nowChart = (chart == "newest")? "최신곡 100곡" : "실시간 100곡";
        $scope.chartToggle();

        // call melon api
        var myMelonParam = new MelonParam(1, 1, 100, "json", melonApiKey);
        var myMelonUrl = makeUrl($scope.melonUrl, myMelonParam);
        MelonRequest(myMelonUrl);
    };

    // youtube iframe api load
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var playerWidth = parseInt(getComputedStyle(document.getElementById("video-container")).width);
    var playerHight = Math.ceil(playerWidth * 9/16);
    $window.onYouTubeIframeAPIReady = function() {
        $scope.player = new YT.Player('player', {
            height: playerHight,
            width: playerWidth,
            videoId: '89ItUebEa8c', // 윤하 - 기다리다
            events: {
                //'onReady': onPlayerReady,
                'onStateChange': $scope.onPlayerStateChange
            }
        });
    };

    // change current video
    $scope.changeCurrentVideo = function(currentList, listIndex, element){
        var list = currentList;
        var index = listIndex;

        //// return highlighting
        //if($scope.currentVideo.element){
        //    $scope.currentVideo.element.css({backgroundColor:"#222222"});
        //}
        //
        //// change current video element
        $scope.currentVideo.element = element;
        //
        //// current video highlighting
        //element.css({backgroundColor:"#555555"});

        $scope.currentVideo.list = currentList;
        $scope.currentVideo.index = listIndex;

        var listArray = $scope[list];
        var videoId = listArray[index].id.videoId;

        // change current playing video
        $scope.player.loadVideoById(videoId);
    };

    // moving song between the lists
    $scope.toggleMylist = function(currentList, index){

        // synchronize currentVideo object
        if($scope.currentVideo.videoIndex > index){
            $scope.currentVideo.videoIndex -= 1;
        }

        var contextList = $scope[currentList];
        var songObj = {};
        songObj.data = contextList[index];

        if(currentList == "melonChartList" || currentList == "searchList"){

            // if there are login info, insert songData into database
            if($cookies.get('userInfo')){
                songObj['userInfo'] = $cookies.get('userInfo');
                $http.put('/', JSON.stringify(songObj), {headers: {'Content-Type': 'application/json'}}).then(function(res){
                    if(res.data == 'success'){
                        $scope.mySongList.push(contextList[index]);
                        contextList.splice(index, 1);
                    }else{
                        alert('server error');
                    }
                });
            }else{
                // if don't have loginInfo
                $scope.mySongList.push(contextList[index]);
                contextList.splice(index, 1);
            }
        }else if(currentList == "mySongList"){
            // delete data
            if($cookies.get('userInfo')){
                songObj['userInfo'] = $cookies.get('userInfo');
                $http.delete('/', {headers: {'Content-Type': 'application/json'}, data: JSON.stringify(songObj)}).then(function(res){
                    if(res.data){
                        contextList.splice(index, 1);
                    }else{
                        alert('server error');
                    }
                });
            }else{
                // if don't have loginInfo
                contextList.splice(index, 1);
            }

        }
    };

    // this function be called when change current video.
    $scope.onPlayerStateChange = function(event){
        if(event.data == 0){
            $scope.changeCurrentVideo($scope.currentVideo.list, parseInt($scope.currentVideo.index)+1, $scope.currentVideo.element);
        }
        //-1 (unstarted)
        //0 (ended)
        //1 (playing)
        //2 (paused)
        //3 (buffering)
        //5 (video cued).
    };

    // are there login info?
    $scope.isUser = function(){
        return $cookies.get('userInfo') || false;
    };

    // login function
    $scope.login = function(){
        var email = this.email;
        if(email){
            $http({
                url: "/?type=login",
                method: "POST",
                data: {email : this.email},
                headers: {'Content-Type': 'application/json'}
            }).then(
                function(res){
                    if(res.data.song){
                        $scope.mySongList = [];
                        for(var i in res.data.song){
                            $scope.mySongList.push(JSON.parse(res.data.song[i].contents));
                        }
                        $cookies.put('userInfo', email);
                        $scope.SignIndiaolg.close();
                    }else{
                        $scope.signInNotice = res.data
                    }
                });
        }
        // ???? register popup을 열면 login popup의 폼이 submit됨.
    };

    //register function
    $scope.register = function(){
        if(this.email){
            $http({
                url: "/?type=register",
                method: "POST",
                data: {email : this.email},
                headers: {'Content-Type': 'application/json'}
            })
                .then(
                    function(res){
                        if(res.data == 'success'){
                            $scope.SignUpdiaolg.close();
                        }else{
                            /////// input text value 초기화 코드
                            $scope.signUpNotice = res.data;
                        }

                    });
        }else{
            $scope.SignUpdiaolg = 'Email is Empty!'
        }

    };

    // search event
    $scope.searchForVideo= function(searchWord){
        $scope.searchParam = new youtubeParam(encodeURIComponent(searchWord), 'snippet', youtubeApiKey);
        $scope.searchUrl = makeUrl(youtubeUrl, $scope.searchParam) + '&maxResults=15';

        $http.get($scope.searchUrl)
            .then(
                function (res) {
                    $scope.searchList = [];
                    for(var i in res.data.items){
                        $scope.searchList.push(res.data.items[i]);
                    }
                },
                requestFail
            )
    };

    $scope.shuffleArray = function(array) {
        var m = array.length, t, i;

        // While there remain elements to shuffle
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    };

    // sign in popup with ngDialog
    $scope.signInNotice = 'welcome to withSong';
    $scope.openSingInPopup = function(){
        $scope.SignIndiaolg = ngDialog.open({
            template:
            '<div class="popupTitle">withSong - sign in</div>'+
            '<div class="popupNotice">{{signInNotice}}</div>'+
            '<form class="loginForm" name="loginForm" ng-submit="login()">'+
            '<input type="text" class="user-email" ng-model="email" placeholder="Your Email address">'+
            '<input type="image" name="submit" src="icon_button_login.png" border="0" alt="Submit" class="buttonIcon"/>'+
            '<div class="registerBtn" ng-click="openSignUpPopup()">if you want register...</div>'+
            '</form>',
            scope: $scope,
            plain: true
        })

    };

    // sign up popup with ngDialog
    $scope.signUpNotice = 'Will not be used for purposes to other than identification.';
    $scope.openSignUpPopup = function(){
        $scope.SignUpdiaolg = ngDialog.open({
            template:
            '<div class="popupTitle">withSong - sign up</div>'+
            '<div class="popupNotice">{{signUpNotice}}</div>'+
            '<form class="registerForm" name="registerForm" ng-submit="register()">'+
            '<input type="text" class="user-email" ng-model="email" placeholder="Please enter your e-mail use.">'+
            '<input type="image" name="submit" src="icon_button_register.png" border="0" alt="Submit" class="buttonIcon"/>'+
            '</form>',
            scope: $scope,
            plain: true
        })
    }
}])
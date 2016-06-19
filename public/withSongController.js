var app = angular.module('withSong', ['ngCookies', 'ngDialog']);
app.controller('withSongController',['$scope','$http','$window', 'ngDialog', '$cookies', function($scope, $http, $window, ngDialog, $cookies) {

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

    var playerWidth = getComputedStyle(document.getElementById("myList-container")).width;
    $window.onYouTubeIframeAPIReady = function() {
        $scope.player = new YT.Player('player', {
            height: '390',
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
            $scope.mySongList.push(contextList[index]);
            // if there are login info, insert songData into database
            if($cookies.get('userInfo')){
                songObj['userInfo'] = $cookies.get('userInfo');
                $http.put('/', JSON.stringify(songObj), {headers: {'Content-Type': 'application/json'}});
            }
        }else if(currentList == "mySongList"){
            console.log('aa');
            // delete data
            if($cookies.get('userInfo')){
                songObj['userInfo'] = $cookies.get('userInfo');
                $http.delete('/', {headers: {'Content-Type': 'application/json'}, data: JSON.stringify(songObj)});
            }

        }

        contextList.splice(index, 1);
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
    $scope.login = function(userInfo){
        $http({
            url: "/",
            method: "POST",
            data: userInfo,
            headers: {'Content-Type': 'application/json'
            }})
            .then(
                function(res){
                    $scope.mySongList = [];
                    for(var i in res.data){
                        $scope.mySongList.push(JSON.parse(res.data[i].contents));
                    }
                });
        $cookies.put('userInfo', userInfo.email);

    };

    // search for song
    $scope.searchForVideo = "";

    // watch event listener for search word
    $scope.$watch('searchForVideo', function(searchWord){
        $scope.searchParam = new youtubeParam(encodeURIComponent($scope.searchForVideo), 'snippet', youtubeApiKey);
        $scope.searchUrl = makeUrl(youtubeUrl, $scope.searchParam) + '&maxResults=15';

        if(searchWord && searchWord == $scope.searchForVideo) {
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
        }
    });

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

    // using ngDialog
    $scope.openSingUpPopup = function(){
        ngDialog.open({
            template:
            '<form name="loginForm" ng-submit="login(userInfo)">'+
            '<label for="user-email">email:</label>'+
            '<input type="text" id="user-email" ng-model="userInfo.email">'+
            '<button type="submit">Login</button>'+
            '</form>',
            scope: $scope,
            plain: true
        });
    }
}])
var app = angular.module('withSong', []);
app.controller('withSongController',['$scope','$http','$window', function($scope, $http, $window) {
        var melonApiKey = "d1d6323f-b411-307d-8a36-12dd19c33646";
        var youtubeApiKey = "AIzaSyAYJcoUSoEpehRGo-0XYHd4zafkiSmt9Wk";

        var melonUrlList = {
            newest : "http://apis.skplanetx.com/melon/newreleases/songs?",      // 최신곡
            realtimeBest : "http://apis.skplanetx.com/melon/charts/realtime?"   // 현재 베스트
        };

        $scope.melonUrl = "";
        $scope.nowChart = "select chart";

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

                        // youtube api 호출
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
            var myMelonParam = new MelonParam(1, 1, 20, "json", melonApiKey);
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

            if(currentList == "melonChartList" || currentList == "searchList"){
                $scope.mySongList.push(contextList[index]);
            }else if(currentList == "myList"){

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

        $scope.mySongListDownload = function(songList){
            var makeStr = "";
            for(var i in songList){
                makeStr += JSON.stringify(songList[i]);
            }
            var blob = new Blob([makeStr], {type: 'text/plain;charset=utf-8'});
            saveAs(blob, "hello world.txt");
        };

        //$scope.mySongListLoad = function($fileContent){
        //    console.log($fileContent);
        //}
    }])
    // this directive for korean input bug
    .directive('krInput', [ '$parse', function($parse) {
        return {
            priority : 2,
            restrict : 'A',
            compile : function(element) {
                element.on('compositionstart', function(e) {
                    e.stopImmediatePropagation();
                });
            }
        };
    } ])

    // this directive for read file
    .directive('onReadFile', function ($parse) {
        return {
            restrict: 'A',
            scope: false,
            link: function(scope, element, attrs) {
                var fn = $parse(attrs.onReadFile);

                element.on('change', function(onChangeEvent) {
                    var reader = new FileReader();

                    reader.onload = function(onLoadEvent) {
                        scope.$apply(function() {
                            fn(scope, {$fileContent:onLoadEvent.target.result});
                        });
                    };

                    reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                });
            }
        };
    });
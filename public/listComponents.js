app.directive('listComponents', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template:
        '<div id="songList-container">'+
        '<div ng-click="changeVideo()" class="row" ng-right-click="toggleList()">'+
        '<span class="thumnail"><img src="{{song.snippet.thumbnails.default.url}}"/></span>'+
        '<div class="name">{{song.snippet.title}}</div>'+
        '</div>'+
        '</div>',
        link: function(scope, element, attr){
            scope.changeVideo = function(){
                scope.changeCurrentVideo(attr.currentList, attr.listIndex, element);
            };

            scope.toggleList = function(){
                scope.toggleMylist(attr.currentList, attr.listIndex)
            };
        }
    };
})


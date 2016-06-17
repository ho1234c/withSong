app.controller('loginController',['$scope', '$http', '$cookies', function($scope, $http, $cookies){
    $scope.login = function(userInfo){
        $http({
            url: "/",
            method: "POST",
            data: userInfo,
            headers: {'Content-Type': 'application/json'
            }})
            .then(function(res){
            console.log(res);
        });
        $cookies.put('userInfo', userInfo.email);
    }
    
    $scope.cookieLog = function(){
        console.log($cookies.getAll());
    }
}])
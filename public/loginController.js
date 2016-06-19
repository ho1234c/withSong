app.controller('loginController',['$scope', '$http', '$cookies', function($scope, $http, $cookies){
    $scope.login = function(userInfo){
        $http({
            url: "/",
            method: "POST",
            data: userInfo,
            headers: {'Content-Type': 'application/json'
            }})
            .then(function(res){
            console.log(res.data);
        });
        $cookies.put('userInfo', userInfo.email);
    };

}])
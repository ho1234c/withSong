app.directive('ngScrollEnd', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngScrollEnd);
        element.bind('scroll', function(event) {
            if (this.scrollTop + this.offsetHeight == this.scrollHeight) {
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, {$event:event});
                });
            }

        });
    };
})
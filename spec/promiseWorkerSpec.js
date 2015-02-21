define(["src/index", "bower_components/bluebird/js/browser/bluebird"], function(PromiseWorker, bluebird) {

    describe('worker tests', function() {
        it('worker runs task and returns results as promise', function(done) {
            var myWorker = new PromiseWorker(bluebird, "../spec/testWorker", "../bower_components/requirejs/require.js");
            myWorker.runTask(10).then(function (result) {
                expect(result).toBe(15);
                done();
            });
        });

    });

});
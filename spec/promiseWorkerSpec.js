define(["src/index", "bower_components/bluebird/js/browser/bluebird"], function(PromiseWorker, bluebird) {
    describe('worker tests', function() {
        it('worker runs task and returns results as promise', function(done) {
            var myWorker = new PromiseWorker(bluebird, "../spec/testWorker", "../bower_components/requirejs/require.js");
            myWorker.runTask(10).then(function (result) {
                expect(result).toBe(15);
                done();
            });
        });

        it('worker runs task and rejects promise if an error occurs', function(done) {
            var myWorker = new PromiseWorker(bluebird, "../spec/testWorker", "../bower_components/requirejs/require.js");
            myWorker.runTask("bla").then(function (result) {
                fail();
                done();
            }, function (error) {
                expect(error.message).toEqual("yeha");
                done();
            });
        });
    });

    describe('test waiting features and exclusivity', function() {
        it('worker exclusively runs one task at once', function(done) {
            var myWorker = new PromiseWorker(bluebird, "../spec/timedWorker", "../bower_components/requirejs/require.js");

            var previousCalled = false;
            myWorker.runTask(100).then(function (result) {
                expect(result).toBe(1);
                previousCalled = true;
            });
            myWorker.runTask(100).then(function (result) {
                expect(result).toBe(1);
                expect(previousCalled).toBe(true);
                done();
            });
        });

        xit('worker calls waiters if ready', function(done) {
            
        });

        xit('worker doesnt call waiter if busy again', function(done) {
            var myWorker = new PromiseWorker(bluebird, "../spec/testWorker", "../bower_components/requirejs/require.js");
        });
    });
});

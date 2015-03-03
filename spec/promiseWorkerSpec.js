define(["src/index", "bower_components/bluebird/js/browser/bluebird"], function(PromiseWorker, bluebird) {
    describe('worker tests', function() {
        var myWorker;
        beforeEach(function () {
            myWorker = new PromiseWorker(bluebird, "spec/testWorker", "../bower_components/requirejs/require.js");
        });

        it('worker runs task and returns results as promise', function(done) {
            myWorker.runTask(10).then(function (result) {
                expect(result).toBe(15);
                done();
            });
        });

        it('worker runs task and rejects promise if an error occurs', function(done) {
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
        var myWorker;
        beforeEach(function () {
            myWorker = new PromiseWorker(bluebird, "spec/timedWorker", "../bower_components/requirejs/require.js");
        });

        it('worker exclusively runs one task at once', function(done) {

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

        it('worker calls waiters if ready', function(done) {
            var previousCalled = false;

            myWorker.runTask(100).then(function (result) {
                expect(result).toBe(1);
                expect(previousCalled).toEqual(true);
                done();
            });

            myWorker.onFree(function () {
                previousCalled = true;
                expect(myWorker.isBusy()).toBe(false);
            });
        });

        it('worker doesnt call listeners if busy again', function(done) {
            var previousCalled = false;

            myWorker.runTask(100).then(function (result) {
                expect(result).toBe(1);
                expect(previousCalled).toEqual(false);
            });

            myWorker.runTask(100).then(function (result) {
                expect(result).toBe(1);
                expect(previousCalled).toEqual(true);
                done();
            });

            myWorker.onFree(function () {
                previousCalled = true;
                expect(myWorker.isBusy()).toBe(false);
            });

        });

        it('doesnt run worker registered via runiffree if not free', function (done) {
            myWorker.runTask(100).then(function (result) {
                expect(result).toBe(1);
                myWorker.runIfFree(100).then(function (result) {
                    expect(result).toBe(1);
                    done();
                });
            });

            expect(myWorker.runIfFree(100)).toEqual(false);
        });
    });
});

# require-promise-worker.js

A small wrapper for worker. The require-promise-worker combines require, promises and web worker.

By using require, it is a lot easier to specify file paths.
The worker can be used to load any file. This file should return a javascript function,
which will be called for any task being executed.

## How to use

```js
//the worker will try to determine the requirejs path automatically, if it fails, it can be set manually
var myWorker = new PromiseWorker(PromiseLibrary, pathToJavascript, [requireJSPath]);

//execute a task
myWorker.runTask(taskData).then(function (result) {
  console.log(result);
});
```

The worker is exclusive, as soon as one task is running, other tasks will be added to a waiting queue.

If an error is thrown the Promise returned bei runTask will be rejected.
There are more options to use it:

```js
myWorker.onFree(function () {
	//called if task queue is empty.
});

var runIfFree = myWorker.runIfFree(taskData)
//runIfFree is either a promise or false (depending on if the queue is empty)

//returns the current busyness of the worker
myWorker.isBusy()
```

It is also possible to pass data back from the worker while the task is running (e.g. for progress):

```js
//worker
define([], function () {
	return function (data, progressCallback) {
		progressCallback(0.5);
		return 5;
	}
});
```

```js
//client
myWorker.runTask(taskData, function (progress) {
	console.log(progress);
})
```

## Tests

Tests are in spec/. They are a good way to get used to the code.
Simply run karma start --single-run to run the tests.

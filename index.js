//module uri:
// basic/path/package/path
// toUrl():
// basic/path
// worker path:
// ../../../../basic/path
// require path:
// assets/bower/require.js
// require worker path:
// ../../../../assets/bower/require.js

define(["module"], function (module) {
	function removeFileFromPath(path) {
		return path.replace(/\/[^\/]*$/g, "");
	}

	function isAbsolute(path) {
		return path.indexOf("/") === 0 || path.indexOf("://") > -1;
	}

	function pathToBack(path) {
		return path.replace(/\/[^\/]+\//g, "/../").replace(/^.+\//, "../").replace(/\/.+$/, "/..");
	}

	function calculateRequirePath(packageUri) {
		if (isAbsolute(packageUri)) {
			return;
		}

		var requireScripts = Array.prototype.slice.call(document.getElementsByTagName("script"))
									.map(function (e) { return e.src; })
									.filter(function (e) { return e.indexOf("require") > -1; });

		if (requireScripts.length !== 1) {
			return;
		}

		if (isAbsolute(requireScripts[0])) {
			requireScript = requireScripts[0];
		} else {
			requireScripts = pathToBack(packageUri) + requireScripts[0];
		}

	}

	var packageUri = removeFileFromPath(module.uri);
	var baseUri = require.toUrl();
	var requireScript = calculateRequirePath(packageUri);
	var workerBaseUrl = "";

	if (isAbsolute(packageUri)) {
		workerBaseUrl = packageUri;
	} else {
		workerBaseUrl = pathToBack(packageUri) + baseUri;
	}


	var Worker = function (Promise, workerScript, requireScriptOverride) {
		this._Promise = Promise;
		this._busy = true;
		this._worker = new Worker(packageUri + "worker.js");
		this._awaitFreeQueue = [];
		this._awaitResponse = null;
		this._metaListener = null;

		this._worker.onmessage = this._workerMessage.bind(this);
		this._worker.onerror = this._workerError.bind(this);

		this._worker.postMessage({
			action: "setup",
			data: {
				requireScript: requireScriptOverride || requireScript,
				workerBaseUrl: workerBaseUrl,
				workerScript: workerScript
			}
		});
	};

	Worker.prototype._workerMessage = function (event) {
		var data = event.data.data; var type = event.data.type;
		if (type === "meta" && this._metaListener) {
			this._metaListener(data);
		} else if (type === "resultTask") {
			this._awaitResponse.resolve(data);
			this._free();
		} else if (type === "setup") {
			this._free();
		}
	};

	Worker.prototype.isBusy = function () {
		return this._busy;
	};

	Worker.prototype.lockFree = function () {
		if (!this._busy) {
			this._busy = true;
			return this._Promise.resolve();
		}

		var that = this;

		return new this._Promise(function (resolve, reject) {
			this._awaitFreeQueue.push(function () {
				that._busy = true;
				resolve();
			});
		});
	};

	Worker.prototype.awaitFree = function () {
		if (!this._busy) {
			return this._Promise.resolve();
		}

		return new this._Promise(function (resolve, reject) {
			this._awaitFreeQueue.push(resolve);
		});
	};

	Worker.prototype._free = function () {
		this._busy = false;
		this._awaitFreeQueue.each(function (resolveFreePromise) {
			if (!this._busy) {
				resolveFreePromise();
			}
		});
	};

	Worker.prototype._saveCallbacks = function (resolve, reject) {
		this._awaitResponse = {
			resolve: resolve,
			reject: reject
		};
	};

	Worker.prototype.runTask = function (data, metaListener) {
		this._metaListener = metaListener;
		this.lockFree().bind(this).then(function () {
			var waitPromise = new Promise(this._saveCallbacks.bind(this));
			this._worker.postMessage({
				action: "runTask",
				data: data
			});
			return waitPromise;
		});
	};
});
/* global self, importScripts, requirejs */

"use strict";

var theHandler;

self.onmessage = function (event) {
	var action = event.data.action;
	var data = event.data.data;
	if (action == "setup") {
		if (typeof requirejs === "undefined") {
			importScripts(data.requireScript);
		}

		requirejs.config({
			baseUrl: data.workerBaseUrl
		});

		requirejs([data.workerScript], function (handler) {
			theHandler = handler;

			self.postMessage({ type: "setup" });
		});
	} else if (action === "runTask") {
		try {
			var result = theHandler(event.data.data, function (metaData) {
				self.postMessage({
					type: "meta",
					data: metaData
				});
			});
			self.postMessage({
				type: "resultTask",
				data: result
			});
		} catch (e) {
			self.postMessage({
				type: "error",
				data: {
					message: e.message,
					stack: e.stack
				}
			});
		}
	}


};

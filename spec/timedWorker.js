define([], function () {
	return function (data, metaListener) {
		if (typeof data !== "number") {
			throw new Error("not a number!");
		}
		var start = new Date().getTime(), u;
		while(new Date().getTime() - start < data) {
			u = 5;
			u = u * 5;
			u = u * 5;
			if ((new Date().getTime() - start) % 10 === 0) {
				metaListener(new Date().getTime() - start);
			}
		}
		return 1;
	};
});
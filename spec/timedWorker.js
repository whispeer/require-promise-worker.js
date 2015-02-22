define([], function () {
	return function (data) {
		if (typeof data !== "number") {
			throw new Error("not a number!");
		}
		var start = new Date().getTime(), u;
		while(new Date().getTime() - start < data) {
			u = 5;
			u = u * 5;
			u = u * 5;
		}
		return 1;
	};
});
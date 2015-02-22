define([], function () {
	return function (data) {
		if (typeof data === "number") {
			return data + 5;
		} else {
			throw new Error("yeha");
		}
	};
});
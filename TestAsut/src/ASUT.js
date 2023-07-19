/**
* @namespace ASUT
**/
var ASUT = ASUT || {};

/**
* @module p1
**/
ASUT.p1 = {
	/**
	* @function init
	* @example ASUT.p1.init();
	**/
	init: function () {
		console.log('Hello from page 1');
	}
};

/**
* @module p2
**/
ASUT.p2 = {
	/**
	* @function init
	* @example ASUT.p2.init();
	**/
	init: function () {
		console.log('Hello from page 2');
	}
};

$(document).ready(function () {
	var pageId = Number(document.getElementById("pFlowStepId").value);
  if (pageId === 1) ASUT.p1.init();
  if (pageId === 2) ASUT.p2.init();
});
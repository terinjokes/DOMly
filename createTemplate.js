var cheerio = require('cheerio');

var count = 0;

function safe(string) {
	return JSON.stringify(string);
}

function getElName() {
	return 'el'+(count++);
}

function createElement(elName, tag, elHandle) {
	var statement = 'var '+elName+' = ';
	if (elHandle) {
		statement += 'this['+safe(elHandle)+'] = ';
	}
	statement += 'document.createElement("'+tag+'");\n';
	return statement;
}

function setAttribute(elName, attr, value) {
	return elName+'.setAttribute('+safe(attr)+', '+safe(value)+');\n'
}

function setTextContent(elName, text) {
	return elName+'.textContent = '+safe(text)+';\n'
}

function buildFunctionBody($, $el, parentName) {
	var func = '';

	$el.each(function(index, el) {
		var $el = $(el);

		var elName = getElName();

		func += createElement(elName, el.name, $el.data('handle'));

		var attrs = el.attribs;
		for (var attr in attrs) {
			func += setAttribute(elName, attr, attrs[attr]);
		}

		var children = $el.children();
		var text = $el.text();
		if (children.length) {
			func += buildFunctionBody($, $(children), elName);
		}
		else if (text != '') {
			func += setTextContent(elName, text);
		}

		if (parentName) {
			func += parentName+'.appendChild('+elName+');\n';
		}
	});

	return func;
}

function compile(html) {
	var $ = cheerio.load('<div id="__template-root__">'+html+'</div>');

	var $first = $('#__template-root__').children(0);

	var functionBody = buildFunctionBody($, $first);

	functionBody += 'return el0;';

	return new Function(functionBody);
}

console.log(compile('<ul id="fruits" data-handle="ul"><li class="test1">Test1</li><li class="test2">Test2</li></ul>').toString());
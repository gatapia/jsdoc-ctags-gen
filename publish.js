/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {
  var symbols = symbolSet.toArray();
  function isaClass($) {
    return ($.is("CONSTRUCTOR") || $.isNamespace) && $.alias != "_global_";
  }

  var classes = symbols.filter(isaClass).sort(makeSortby("alias"));

	var allCtags = [];
	for (var i = 0, l = classes.length; i < l; i++) {
		var class = classes[i];
    class.events = class.getEvents();
    class.methods = class.getMethods();

    var ctags = addClassTags(class);
    for (var i = 0, len = ctags.length; i < len; i++) {
      allCtags.push(ctags[i]);
    }
	}
	var output = getHeader() + allCtags.join('\n');
  console.log('JSDOC.opt.d: ' + JSDOC.opt.d);
  // Make paths relative
  output = output.replace(new RegExp(JSDOC.opt.d, 'g'), '');;
	IO.saveFile(JSDOC.opt.d, 'tags', output);
}

function getHeader() {
  return '!_TAG_FILE_FORMAT 2 /extended format; --format=1 will not append ;" to lines/' +
    '\n!_TAG_FILE_SORTED 0 /0=unsorted, 1=sorted, 2=foldcase/' +
    '\n!_TAG_PROGRAM_AUTHOR  Guido Tapia  /guido@tapia.com.au/' +
    '\n!_TAG_PROGRAM_NAME  JSDoc CTag Template //' +
    '\n!_TAG_PROGRAM_URL https://github.com/gatapia/jsdoc-ctags-gen  /official site/' +
    '\n!_TAG_PROGRAM_VERSION 1.0 //\n';
};


function addClassTags(d) {
  var ctags = [];
  var name = d.alias;
  var file = d.srcFile;
  var excmd = '/^' + d.alias + ' = $/';
  var extags = [];
  extags.push('arity:' + (!d.params ? 0 : d.params.length));
  extags.push('class:' + d.name);
  extags.push('kind:c');
  pushCTag(ctags, name, file, excmd, extags);

  var methods = d.methods || [];
  for (var i = 0, len = methods.length; i < len; i++) {
    addMethodTag(ctags, methods[i]);
  }
  return ctags;
};

function addMethodTag(ctags, m) {
  var name = m.name;
  var file = m.srcFile;
  var excmd = '/^' + m.name + ' = $/';
  var extags = [];
  extags.push('kind:f');
  extags.push('arity:' + (!m.params ? 0 : m.params.length));
  extags.push('class:' + m.memberOf);
  pushCTag(ctags, name, file, excmd, extags);
};

function pushCTag(ctags, name, file, excmd, extags) {
  var ctag = name + '\t' + file + '\t' + excmd + '\t;"';
  for (var i = 0, len = extags.length; i < len; i++) {
    ctag += '\t' + extags[i];
  }
  ctags.push(ctag);
}


/** Make a symbol sorter by some attribute. */
function makeSortby(attribute) {
	return function(a, b) {
		if (a[attribute] != undefined && b[attribute] != undefined) {
			a = a[attribute].toLowerCase();
			b = b[attribute].toLowerCase();
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		}
	}
}
/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {
	publish.conf = {  // trailing slash expected for dirs
		ext:         ".html",
		outDir:      JSDOC.opt.d || SYS.pwd+"../out/jsdoc/",
		templatesDir: JSDOC.opt.t || SYS.pwd+"../templates/jsdoc/",
		staticDir:   "static/",
		symbolsDir:  "symbols/",
		srcDir:      "symbols/src/",
		cssDir:      "css/",
		fontsDir:    "css/fonts/",
		jsDir:       "javascript/",
		templateName: "Codeview",
		templateVersion: "1.2",
		templateLink: "http://www.thebrightlines.com/2010/05/06/new-template-for-jsdoctoolkit-codeview/"
	};


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
	var saveFilePath = JSDOC.opt.d + '..';
	IO.saveFile(saveFilePath, 'tags', output);
}

function getHeader() {
  return '!_TAG_FILE_FORMAT 2 /extended format; --format=1 will not append ;" to lines/' +
    '\n!_TAG_FILE_SORTED 0 /0=unsorted, 1=sorted, 2=foldcase/' +
    '\n!_TAG_PROGRAM_AUTHOR  Guido Tapia  /guido@tapia.com.au/' +
    '\n!_TAG_PROGRAM_NAME  JSDoc CTag Template //' +
    '\n!_TAG_PROGRAM_URL https://github.com/gatapia/jsdoc-ctags  /official site/' +
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
  var ctag = name + '\t' + file + '\t' + excmd + ';"';
  for (var i = 0, len = extags.length; i < len; i++) {
    ctag += '\t' + extags[i];
  }
  ctags.push(ctag);
}

/** Include a sub-template in the current template, specifying a data object */
function subtemplate(template, data) {
	try {
		return new JSDOC.JsPlate(publish.conf.templatesDir+template).process(data);
	}
	catch(e) { print(e.message); quit(); }
}

/** Just the first sentence (up to a full stop). Should not break on dotted variable names. */
function summarize(desc) {
	if (typeof desc != "undefined")
		return desc.match(/([\w\W]+?\.)[^a-z0-9_$]/i)? RegExp.$1 : desc;
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

function wordwrapNamespace(classLink) {
	var classText = classLink.match(/[^<>]+(?=[<])/) + "";
	var classTextNew = classText.replace(/\./g,  "<span class='break'> </span>.<span class='break'> </span>") + "";
	classLink = classLink.replace(/[^<>]+(?=[<])/,  classTextNew);
	return classLink;
}

/** Pull in the contents of an external file at the given path. */
function include(path) {
	var path = publish.conf.templatesDir+path;
	return IO.readFile(path);
}

/** Build output for displaying function parameters. */
function makeSignature(params) {
	if (!params) return "()";
	var signature = "("
	+
	params.filter(
		function($) {
			return $.name.indexOf(".") == -1; // don't show config params in signature
		}
	).map(
		function($) {
			return $.name;
		}
	).join(", ")
	+
	")";
	return signature;
}

/** Find symbol {@link ...} strings in text and turn into html links */
function resolveLinks(str, from) {
   str = str.replace(/\{@link ([^}]+)\}/gi,
     function(match, symbolName) {
	symbolName = symbolName.trim();
	var index = symbolName.indexOf(' ');
	if (index > 0) {
	   var label = symbolName.substring(index + 1);
	   symbolName = symbolName.substring(0, index);
	   return new Link().toSymbol(symbolName).withText(label);
	} else {
	   return new Link().toSymbol(symbolName);
	}
     }
   );
   return str;
}
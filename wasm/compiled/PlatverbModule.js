

// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module !== 'undefined' ? Module : {};

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)


// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = function(status, toThrow) {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === 'object';
ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)');
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

var nodeFS;
var nodePath;

if (ENVIRONMENT_IS_NODE) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = require('path').dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }

// include: node_shell_read.js


read_ = function shell_read(filename, binary) {
  var ret = tryParseAsDataURI(filename);
  if (ret) {
    return binary ? ret : ret.toString();
  }
  if (!nodeFS) nodeFS = require('fs');
  if (!nodePath) nodePath = require('path');
  filename = nodePath['normalize'](filename);
  return nodeFS['readFileSync'](filename, binary ? null : 'utf8');
};

readBinary = function readBinary(filename) {
  var ret = read_(filename, true);
  if (!ret.buffer) {
    ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
};

// end include: node_shell_read.js
  if (process['argv'].length > 1) {
    thisProgram = process['argv'][1].replace(/\\/g, '/');
  }

  arguments_ = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  process['on']('unhandledRejection', abort);

  quit_ = function(status) {
    process['exit'](status);
  };

  Module['inspect'] = function () { return '[Emscripten Module object]'; };

} else
if (ENVIRONMENT_IS_SHELL) {

  if (typeof read != 'undefined') {
    read_ = function shell_read(f) {
      var data = tryParseAsDataURI(f);
      if (data) {
        return intArrayToString(data);
      }
      return read(f);
    };
  }

  readBinary = function readBinary(f) {
    var data;
    data = tryParseAsDataURI(f);
    if (data) {
      return data;
    }
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit === 'function') {
    quit_ = function(status) {
      quit(status);
    };
  }

  if (typeof print !== 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console === 'undefined') console = /** @type{!Console} */({});
    console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
    console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr !== 'undefined' ? printErr : print);
  }

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document !== 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {

// include: web_or_worker_shell_read.js


  read_ = function(url) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    } catch (err) {
      var data = tryParseAsDataURI(url);
      if (data) {
        return intArrayToString(data);
      }
      throw err;
    }
  };

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = function(url) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return data;
        }
        throw err;
      }
    };
  }

  readAsync = function(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      var data = tryParseAsDataURI(url);
      if (data) {
        onload(data.buffer);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };

// end include: web_or_worker_shell_read.js
  }

  setWindowTitle = function(title) { document.title = title };
} else
{
  throw new Error('environment detection error');
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);

// Merge back in the overrides
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];
if (!Object.getOwnPropertyDescriptor(Module, 'arguments')) {
  Object.defineProperty(Module, 'arguments', {
    configurable: true,
    get: function() {
      abort('Module.arguments has been replaced with plain arguments_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

if (Module['thisProgram']) thisProgram = Module['thisProgram'];
if (!Object.getOwnPropertyDescriptor(Module, 'thisProgram')) {
  Object.defineProperty(Module, 'thisProgram', {
    configurable: true,
    get: function() {
      abort('Module.thisProgram has been replaced with plain thisProgram (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

if (Module['quit']) quit_ = Module['quit'];
if (!Object.getOwnPropertyDescriptor(Module, 'quit')) {
  Object.defineProperty(Module, 'quit', {
    configurable: true,
    get: function() {
      abort('Module.quit has been replaced with plain quit_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] === 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] === 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] === 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] === 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] === 'undefined', 'Module.read option was removed (modify read_ in JS)');
assert(typeof Module['readAsync'] === 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] === 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] === 'undefined', 'Module.setWindowTitle option was removed (modify setWindowTitle in JS)');
assert(typeof Module['TOTAL_MEMORY'] === 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');

if (!Object.getOwnPropertyDescriptor(Module, 'read')) {
  Object.defineProperty(Module, 'read', {
    configurable: true,
    get: function() {
      abort('Module.read has been replaced with plain read_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

if (!Object.getOwnPropertyDescriptor(Module, 'readAsync')) {
  Object.defineProperty(Module, 'readAsync', {
    configurable: true,
    get: function() {
      abort('Module.readAsync has been replaced with plain readAsync (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

if (!Object.getOwnPropertyDescriptor(Module, 'readBinary')) {
  Object.defineProperty(Module, 'readBinary', {
    configurable: true,
    get: function() {
      abort('Module.readBinary has been replaced with plain readBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

if (!Object.getOwnPropertyDescriptor(Module, 'setWindowTitle')) {
  Object.defineProperty(Module, 'setWindowTitle', {
    configurable: true,
    get: function() {
      abort('Module.setWindowTitle has been replaced with plain setWindowTitle (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';




var STACK_ALIGN = 16;

function alignMemory(size, factor) {
  if (!factor) factor = STACK_ALIGN; // stack alignment (16-byte) by default
  return Math.ceil(size / factor) * factor;
}

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': return 1;
    case 'i16': return 2;
    case 'i32': return 4;
    case 'i64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length-1] === '*') {
        return 4; // A pointer
      } else if (type[0] === 'i') {
        var bits = Number(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

// include: runtime_functions.js


// Wraps a JS function as a wasm function with a given signature.
function convertJsFunctionToWasm(func, sig) {

  // If the type reflection proposal is available, use the new
  // "WebAssembly.Function" constructor.
  // Otherwise, construct a minimal wasm module importing the JS function and
  // re-exporting it.
  if (typeof WebAssembly.Function === "function") {
    var typeNames = {
      'i': 'i32',
      'j': 'i64',
      'f': 'f32',
      'd': 'f64'
    };
    var type = {
      parameters: [],
      results: sig[0] == 'v' ? [] : [typeNames[sig[0]]]
    };
    for (var i = 1; i < sig.length; ++i) {
      type.parameters.push(typeNames[sig[i]]);
    }
    return new WebAssembly.Function(type, func);
  }

  // The module is static, with the exception of the type section, which is
  // generated based on the signature passed in.
  var typeSection = [
    0x01, // id: section,
    0x00, // length: 0 (placeholder)
    0x01, // count: 1
    0x60, // form: func
  ];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = {
    'i': 0x7f, // i32
    'j': 0x7e, // i64
    'f': 0x7d, // f32
    'd': 0x7c, // f64
  };

  // Parameters, length + signatures
  typeSection.push(sigParam.length);
  for (var i = 0; i < sigParam.length; ++i) {
    typeSection.push(typeCodes[sigParam[i]]);
  }

  // Return values, length + signatures
  // With no multi-return in MVP, either 0 (void) or 1 (anything else)
  if (sigRet == 'v') {
    typeSection.push(0x00);
  } else {
    typeSection = typeSection.concat([0x01, typeCodes[sigRet]]);
  }

  // Write the overall length of the type section back into the section header
  // (excepting the 2 bytes for the section id and length)
  typeSection[1] = typeSection.length - 2;

  // Rest of the module is static
  var bytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic ("\0asm")
    0x01, 0x00, 0x00, 0x00, // version: 1
  ].concat(typeSection, [
    0x02, 0x07, // import section
      // (import "e" "f" (func 0 (type 0)))
      0x01, 0x01, 0x65, 0x01, 0x66, 0x00, 0x00,
    0x07, 0x05, // export section
      // (export "f" (func 0 (type 0)))
      0x01, 0x01, 0x66, 0x00, 0x00,
  ]));

   // We can compile this wasm module synchronously because it is very small.
  // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, {
    'e': {
      'f': func
    }
  });
  var wrappedFunc = instance.exports['f'];
  return wrappedFunc;
}

var freeTableIndexes = [];

// Weak map of functions in the table to their indexes, created on first use.
var functionsInTableMap;

function getEmptyTableSlot() {
  // Reuse a free index if there is one, otherwise grow.
  if (freeTableIndexes.length) {
    return freeTableIndexes.pop();
  }
  // Grow the table
  try {
    wasmTable.grow(1);
  } catch (err) {
    if (!(err instanceof RangeError)) {
      throw err;
    }
    throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
  }
  return wasmTable.length - 1;
}

// Add a wasm function to the table.
function addFunctionWasm(func, sig) {
  // Check if the function is already in the table, to ensure each function
  // gets a unique index. First, create the map if this is the first use.
  if (!functionsInTableMap) {
    functionsInTableMap = new WeakMap();
    for (var i = 0; i < wasmTable.length; i++) {
      var item = wasmTable.get(i);
      // Ignore null values.
      if (item) {
        functionsInTableMap.set(item, i);
      }
    }
  }
  if (functionsInTableMap.has(func)) {
    return functionsInTableMap.get(func);
  }

  // It's not in the table, add it now.

  var ret = getEmptyTableSlot();

  // Set the new value.
  try {
    // Attempting to call this with JS function will cause of table.set() to fail
    wasmTable.set(ret, func);
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    assert(typeof sig !== 'undefined', 'Missing signature argument to addFunction: ' + func);
    var wrapped = convertJsFunctionToWasm(func, sig);
    wasmTable.set(ret, wrapped);
  }

  functionsInTableMap.set(func, ret);

  return ret;
}

function removeFunction(index) {
  functionsInTableMap.delete(wasmTable.get(index));
  freeTableIndexes.push(index);
}

// 'sig' parameter is required for the llvm backend but only when func is not
// already a WebAssembly function.
function addFunction(func, sig) {
  assert(typeof func !== 'undefined');

  return addFunctionWasm(func, sig);
}

// end include: runtime_functions.js
// include: runtime_debug.js


// end include: runtime_debug.js
var tempRet0 = 0;

var setTempRet0 = function(value) {
  tempRet0 = value;
};

var getTempRet0 = function() {
  return tempRet0;
};



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
if (!Object.getOwnPropertyDescriptor(Module, 'wasmBinary')) {
  Object.defineProperty(Module, 'wasmBinary', {
    configurable: true,
    get: function() {
      abort('Module.wasmBinary has been replaced with plain wasmBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}
var noExitRuntime = Module['noExitRuntime'] || true;
if (!Object.getOwnPropertyDescriptor(Module, 'noExitRuntime')) {
  Object.defineProperty(Module, 'noExitRuntime', {
    configurable: true,
    get: function() {
      abort('Module.noExitRuntime has been replaced with plain noExitRuntime (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

if (typeof WebAssembly !== 'object') {
  abort('no native wasm support detected');
}

// include: runtime_safe_heap.js


// In MINIMAL_RUNTIME, setValue() and getValue() are only available when building with safe heap enabled, for heap safety checking.
// In traditional runtime, setValue() and getValue() are always available (although their use is highly discouraged due to perf penalties)

/** @param {number} ptr
    @param {number} value
    @param {string} type
    @param {number|boolean=} noSafe */
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch (type) {
      case 'i1': HEAP8[((ptr)>>0)] = value; break;
      case 'i8': HEAP8[((ptr)>>0)] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)] = tempI64[0],HEAP32[(((ptr)+(4))>>2)] = tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}

/** @param {number} ptr
    @param {string} type
    @param {number|boolean=} noSafe */
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch (type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for getValue: ' + type);
    }
  return null;
}

// end include: runtime_safe_heap.js
// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
  return func;
}

// C calling interface.
/** @param {string|null=} returnType
    @param {Array=} argTypes
    @param {Arguments|Array=} args
    @param {Object=} opts */
function ccall(ident, returnType, argTypes, args, opts) {
  // For fast lookup of conversion functions
  var toC = {
    'string': function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    'array': function(arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };

  function convertReturnValue(ret) {
    if (returnType === 'string') return UTF8ToString(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  assert(returnType !== 'array', 'Return type should not be "array".');
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);

  ret = convertReturnValue(ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
}

/** @param {string=} returnType
    @param {Array=} argTypes
    @param {Object=} opts */
function cwrap(ident, returnType, argTypes, opts) {
  return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.
function _free() {
  // Show a helpful error since we used to include free by default in the past.
  abort("free() called but not included in the build - add '_free' to EXPORTED_FUNCTIONS");
}

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((Uint8Array|Array<number>), number)} */
function allocate(slab, allocator) {
  var ret;
  assert(typeof allocator === 'number', 'allocate no longer takes a type argument')
  assert(typeof slab !== 'number', 'allocate no longer takes a number as arg0')

  if (allocator == ALLOC_STACK) {
    ret = stackAlloc(slab.length);
  } else {
    ret = _malloc(slab.length);
  }

  if (slab.subarray || slab.slice) {
    HEAPU8.set(/** @type {!Uint8Array} */(slab), ret);
  } else {
    HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
}

// include: runtime_strings.js


// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;

/**
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(heap.subarray(idx, endPtr));
  } else {
    var str = '';
    // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
    while (idx < endPtr) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      var u0 = heap[idx++];
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      var u1 = heap[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      var u2 = heap[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte 0x' + u0.toString(16) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63);
      }

      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xC0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xE0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      if (u >= 0x200000) warnOnce('Invalid Unicode code point 0x' + u.toString(16) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x1FFFFF).');
      heap[outIdx++] = 0xF0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) ++len;
    else if (u <= 0x7FF) len += 2;
    else if (u <= 0xFFFF) len += 3;
    else len += 4;
  }
  return len;
}

// end include: runtime_strings.js
// include: runtime_strings_extra.js


// runtime_strings_extra.js: Strings related runtime functions that are available only in regular runtime.

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAPU8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;

function UTF16ToString(ptr, maxBytesToRead) {
  assert(ptr % 2 == 0, 'Pointer passed to UTF16ToString must be aligned to two bytes!');
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  var maxIdx = idx + maxBytesToRead / 2;
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var str = '';

    // If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
    // will always evaluate to true. The loop is then terminated on the first null char.
    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0) break;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }

    return str;
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 2 == 0, 'Pointer passed to stringToUTF16 must be aligned to two bytes!');
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)] = codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}

function UTF32ToString(ptr, maxBytesToRead) {
  assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
  var i = 0;

  var str = '';
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(i >= maxBytesToRead / 4)) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0) break;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
  return str;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)] = codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated
    @param {boolean=} dontAddNull */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
  HEAP8.set(array, buffer);
}

/** @param {boolean=} dontAddNull */
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[((buffer++)>>0)] = str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)] = 0;
}

// end include: runtime_strings_extra.js
// Memory management

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
/** @type {ArrayBuffer} */
  buffer,
/** @type {Int8Array} */
  HEAP8,
/** @type {Uint8Array} */
  HEAPU8,
/** @type {Int16Array} */
  HEAP16,
/** @type {Uint16Array} */
  HEAPU16,
/** @type {Int32Array} */
  HEAP32,
/** @type {Uint32Array} */
  HEAPU32,
/** @type {Float32Array} */
  HEAPF32,
/** @type {Float64Array} */
  HEAPF64;

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 5242880;
if (Module['TOTAL_STACK']) assert(TOTAL_STACK === Module['TOTAL_STACK'], 'the stack size can no longer be determined at runtime')

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;
if (!Object.getOwnPropertyDescriptor(Module, 'INITIAL_MEMORY')) {
  Object.defineProperty(Module, 'INITIAL_MEMORY', {
    configurable: true,
    get: function() {
      abort('Module.INITIAL_MEMORY has been replaced with plain INITIAL_MEMORY (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)')
    }
  });
}

assert(INITIAL_MEMORY >= TOTAL_STACK, 'INITIAL_MEMORY should be larger than TOTAL_STACK, was ' + INITIAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')');

// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined,
       'JS engine does not provide full typed array support');

// If memory is defined in wasm, the user can't provide it.
assert(!Module['wasmMemory'], 'Use of `wasmMemory` detected.  Use -s IMPORTED_MEMORY to define wasmMemory externally');
assert(INITIAL_MEMORY == 16777216, 'Detected runtime INITIAL_MEMORY setting.  Use -s IMPORTED_MEMORY to define wasmMemory dynamically');

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js


// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // The stack grows downwards
  HEAPU32[(max >> 2)+1] = 0x2135467;
  HEAPU32[(max >> 2)+2] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAP32[0] = 0x63736d65; /* 'emsc' */
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  var cookie1 = HEAPU32[(max >> 2)+1];
  var cookie2 = HEAPU32[(max >> 2)+2];
  if (cookie1 != 0x2135467 || cookie2 != 0x89BACDFE) {
    abort('Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x2135467, but received 0x' + cookie2.toString(16) + ' ' + cookie1.toString(16));
  }
  // Also test the global address 0 for integrity.
  if (HEAP32[0] !== 0x63736d65 /* 'emsc' */) abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
}

// end include: runtime_stack_check.js
// include: runtime_assertions.js


// Endianness check
(function() {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -s SUPPORT_BIG_ENDIAN=1 to bypass)';
})();

// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;

function preRun() {

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  checkStackCookie();
  assert(!runtimeInitialized);
  runtimeInitialized = true;

  
  callRuntimeCallbacks(__ATINIT__);
}

function exitRuntime() {
  checkStackCookie();
  runtimeExited = true;
}

function postRun() {
  checkStackCookie();

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err('dependency: ' + dep);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data

/** @param {string|number=} what */
function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  what += '';
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  var output = 'abort(' + what + ') at ' + stackTrace();
  what = output;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  var e = new WebAssembly.RuntimeError(what);

  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// {{MEM_INITIALIZER}}

// include: memoryprofiler.js


// end include: memoryprofiler.js
// show errors on likely calls to FS when it was not included
var FS = {
  error: function() {
    abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with  -s FORCE_FILESYSTEM=1');
  },
  init: function() { FS.error() },
  createDataFile: function() { FS.error() },
  createPreloadedFile: function() { FS.error() },
  createLazyFile: function() { FS.error() },
  open: function() { FS.error() },
  mkdev: function() { FS.error() },
  registerDevice: function() { FS.error() },
  analyzePath: function() { FS.error() },
  loadFilesFromDB: function() { FS.error() },

  ErrnoError: function ErrnoError() { FS.error() },
};
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;

// include: URIUtils.js


// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  // Prefix of data URIs emitted by SINGLE_FILE and related options.
  return filename.startsWith(dataURIPrefix);
}

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return filename.startsWith('file://');
}

// end include: URIUtils.js
function createExportWrapper(name, fixedasm) {
  return function() {
    var displayName = name;
    var asm = fixedasm;
    if (!fixedasm) {
      asm = Module['asm'];
    }
    assert(runtimeInitialized, 'native function `' + displayName + '` called before runtime initialization');
    assert(!runtimeExited, 'native function `' + displayName + '` called after runtime exit (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
    if (!asm[name]) {
      assert(asm[name], 'exported native function `' + displayName + '` not found');
    }
    return asm[name].apply(null, arguments);
  };
}

  var wasmBinaryFile = 'data:application/octet-stream;base64,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DQAgA0F8aiABOgAAIAAgAToAAyACQQlJDQAgAEEAIABrQQNxIgRqIgMgAUH/AXFBgYKECGwiATYCACADIAIgBGtBfHEiBGoiAkF8aiABNgIAIARBCUkNACADIAE2AgggAyABNgIEIAJBeGogATYCACACQXRqIAE2AgAgBEEZSQ0AIAMgATYCGCADIAE2AhQgAyABNgIQIAMgATYCDCACQXBqIAE2AgAgAkFsaiABNgIAIAJBaGogATYCACACQWRqIAE2AgAgBCADQQRxQRhyIgVrIgJBIEkNACABrUKBgICAEH4hBiADIAVqIQEDQCABIAY3AxggASAGNwMQIAEgBjcDCCABIAY3AwAgAUEgaiEBIAJBYGoiAkEfSw0ACwsgAAv3AgECfwJAIAAgAUYNAAJAIAEgACACaiIDa0EAIAJBAXRrSw0AIAAgASACEJMDDwsgASAAc0EDcSEEAkACQAJAIAAgAU8NAAJAIARFDQAgACEDDAMLAkAgAEEDcQ0AIAAhAwwCCyAAIQMDQCACRQ0EIAMgAS0AADoAACABQQFqIQEgAkF/aiECIANBAWoiA0EDcUUNAgwACwALAkAgBA0AAkAgA0EDcUUNAANAIAJFDQUgACACQX9qIgJqIgMgASACai0AADoAACADQQNxDQALCyACQQNNDQADQCAAIAJBfGoiAmogASACaigCADYCACACQQNLDQALCyACRQ0CA0AgACACQX9qIgJqIAEgAmotAAA6AAAgAg0ADAMLAAsgAkEDTQ0AA0AgAyABKAIANgIAIAFBBGohASADQQRqIQMgAkF8aiICQQNLDQALCyACRQ0AA0AgAyABLQAAOgAAIANBAWohAyABQQFqIQEgAkF/aiICDQALCyAACwQAQQELAgALhwEBA38gACEBAkACQCAAQQNxRQ0AIAAhAQNAIAEtAABFDQIgAUEBaiIBQQNxDQALCwNAIAEiAkEEaiEBIAIoAgAiA0F/cyADQf/9+3dqcUGAgYKEeHFFDQALAkAgA0H/AXENACACIABrDwsDQCACLQABIQMgAkEBaiIBIQIgAw0ACwsgASAAawsEACMACwYAIAAkAAsSAQJ/IwAgAGtBcHEiASQAIAELFABB4JXAAiQCQdgVQQ9qQXBxJAELBwAjACMBawsEACMBC7YBAQJ/AkACQCAARQ0AAkAgACgCTEF/Sg0AIAAQoAMPCyAAEJYDIQEgABCgAyECIAFFDQEgABCXAyACDwtBACECAkBBACgC4BFFDQBBACgC4BEQnwMhAgsCQBDIAigCACIARQ0AA0BBACEBAkAgACgCTEEASA0AIAAQlgMhAQsCQCAAKAIUIAAoAhxNDQAgABCgAyACciECCwJAIAFFDQAgABCXAwsgACgCOCIADQALCxDJAgsgAgtrAQJ/AkAgACgCFCAAKAIcTQ0AIABBAEEAIAAoAiQRBQAaIAAoAhQNAEF/DwsCQCAAKAIEIgEgACgCCCICTw0AIAAgASACa6xBASAAKAIoESIAGgsgAEEANgIcIABCADcDECAAQgA3AgRBAAsLpomAgAACAEGACAuUCQAAAABQBAAAAQAAAAIAAAADAAAABAAAAAUAAAAGAAAABwAAAAgAAAAJAAAACgAAAAsAAAAMAAAADQAAAE4zV0FNOVByb2Nlc3NvckUAAAAAGAgAADwEAAAAAAAAoAQAAA4AAAAPAAAAEAAAABEAAAASAAAAEwAAABQAAAAVAAAACQAAAAoAAAALAAAAFgAAABcAAAA4UGxhdHZlcmIAAABACAAAlAQAAFAEAAAKAQAAngsAAHkHAADMBwAAxgcAALsAAAAqBAAACgEAAJ4LAAB5BwAAzAcAAMYHAAC7AAAAKgQAAFByZS1kZWxheQBEZWNheQBEaWZmdXNlIElucHV0AElucHV0IExvdyBDdXQAUmV2ZXJiIExvdyBDdXQASW5wdXQgSGlnaCBDdXQAUmV2ZXJiIEhpZ2ggQ3V0AHZlY3RvcgBDbGVhcgBzdGQ6OmV4Y2VwdGlvbgBEaWZmdXNpb24ARHJ5IExldmVsAFdldCBMZXZlbABNb2R1bGF0aW9uIERlcHRoAERyeSBDViBEZXB0aABXZXQgQ1YgRGVwdGgAYmFzaWNfc3RyaW5nAGFsbG9jYXRvcjxUPjo6YWxsb2NhdGUoc2l6ZV90IG4pICduJyBleGNlZWRzIG1heGltdW0gc3VwcG9ydGVkIHNpemUAU2l6ZQBGcmVlemUATW9kdWxhdGlvbiBSYXRlAE1vZHVsYXRpb24gU2hhcGUARnJlZXplIFRvZ2dsZQBUdW5lZCBNb2RlAERlY2F5IENWAElucHV0IExvdyBDdXQgQ1YAUmV2ZXJiIExvdyBDdXQgQ1YASW5wdXQgSGlnaCBDdXQgQ1YAUmV2ZXJiIEhpZ2ggQ3V0IENWAERpZmZ1c2lvbiBDVgBNb2QgRGVwdGggQ1YAU2l6ZSBDVgBNb2QgU2hhcGUgQ1YATW9kIFNwZWVkIENWAFB1cmUgdmlydHVhbCBmdW5jdGlvbiBjYWxsZWQhAAAAAAAAAD8AAAC/AACAPwAAwD8AAAAA3M/RNQAAAAAAwBU/AAAAACwHAAAcAAAAHQAAAB4AAABTdDlleGNlcHRpb24AAAAAGAgAABwHAAAAAAAAWAcAABgAAAAfAAAAIAAAAFN0MTFsb2dpY19lcnJvcgBACAAASAcAACwHAAAAAAAAjAcAABgAAAAhAAAAIAAAAFN0MTJsZW5ndGhfZXJyb3IAAAAAQAgAAHgHAABYBwAAU3Q5dHlwZV9pbmZvAAAAABgIAACYBwAATjEwX19jeHhhYml2MTE2X19zaGltX3R5cGVfaW5mb0UAAAAAQAgAALAHAACoBwAATjEwX19jeHhhYml2MTE3X19jbGFzc190eXBlX2luZm9FAAAAQAgAAOAHAADUBwAAAAAAAAQIAAAiAAAAIwAAACQAAAAlAAAAJgAAACcAAAAoAAAAKQAAAAAAAACICAAAIgAAACoAAAAkAAAAJQAAACYAAAArAAAALAAAAC0AAABOMTBfX2N4eGFiaXYxMjBfX3NpX2NsYXNzX3R5cGVfaW5mb0UAAAAAQAgAAGAIAAAECAAAAEGUEQsE4ApQAA==';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    var binary = tryParseAsDataURI(file);
    if (binary) {
      return binary;
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw "sync fetching of the wasm failed: you can preload it to Module['wasmBinary'] manually, or emcc.py will do that for you when generating HTML (but not JS)";
    }
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, try to to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch === 'function'
      && !isFileURI(wasmBinaryFile)
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(function () {
          return getBinary(wasmBinaryFile);
      });
    }
    else {
      if (readAsync) {
        // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
        return new Promise(function(resolve, reject) {
          readAsync(wasmBinaryFile, function(response) { resolve(new Uint8Array(/** @type{!ArrayBuffer} */(response))) }, reject)
        });
      }
    }
  }

  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
}

function instantiateSync(file, info) {
  var instance;
  var module;
  var binary;
  try {
    binary = getBinary(file);
    module = new WebAssembly.Module(binary);
    instance = new WebAssembly.Instance(module, info);
  } catch (e) {
    var str = e.toString();
    err('failed to compile wasm module: ' + str);
    if (str.includes('imported Memory') ||
        str.includes('memory import')) {
      err('Memory size incompatibility issues may be due to changing INITIAL_MEMORY at runtime to something too large. Use ALLOW_MEMORY_GROWTH to allow any size memory (and also make sure not to set INITIAL_MEMORY at runtime to something smaller than it was at compile time).');
    }
    throw e;
  }
  return [instance, module];
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': asmLibraryArg,
    'wasi_snapshot_preview1': asmLibraryArg,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module['asm'] = exports;

    wasmMemory = Module['asm']['memory'];
    assert(wasmMemory, "memory not found in wasm exports");
    // This assertion doesn't hold when emscripten is run in --post-link
    // mode.
    // TODO(sbc): Read INITIAL_MEMORY out of the wasm file in post-link mode.
    //assert(wasmMemory.buffer.byteLength === 16777216);
    updateGlobalBufferAndViews(wasmMemory.buffer);

    wasmTable = Module['asm']['__indirect_function_table'];
    assert(wasmTable, "table not found in wasm exports");

    addOnInit(Module['asm']['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');
  }
  // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }

  var result = instantiateSync(wasmBinaryFile, info);
  // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193,
  // the above line no longer optimizes out down to the following line.
  // When the regression is fixed, we can remove this if/else.
  receiveInstance(result[0]);
  return Module['asm']; // exports were assigned here
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = {
  
};






  function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == 'function') {
          callback(Module); // Pass the module as the first argument.
          continue;
        }
        var func = callback.func;
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            wasmTable.get(func)();
          } else {
            wasmTable.get(func)(callback.arg);
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg);
        }
      }
    }

  function demangle(func) {
      warnOnce('warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
      return func;
    }

  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }

  function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
        // so try that as a special-case.
        try {
          throw new Error();
        } catch(e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }

  var runtimeKeepaliveCounter=0;
  function keepRuntimeAlive() {
      return noExitRuntime || runtimeKeepaliveCounter > 0;
    }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  var ExceptionInfoAttrs={DESTRUCTOR_OFFSET:0,REFCOUNT_OFFSET:4,TYPE_OFFSET:8,CAUGHT_OFFSET:12,RETHROWN_OFFSET:13,SIZE:16};
  function ___cxa_allocate_exception(size) {
      // Thrown object is prepended by exception metadata block
      return _malloc(size + ExceptionInfoAttrs.SIZE) + ExceptionInfoAttrs.SIZE;
    }

  function ExceptionInfo(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - ExceptionInfoAttrs.SIZE;
  
      this.set_type = function(type) {
        HEAP32[(((this.ptr)+(ExceptionInfoAttrs.TYPE_OFFSET))>>2)] = type;
      };
  
      this.get_type = function() {
        return HEAP32[(((this.ptr)+(ExceptionInfoAttrs.TYPE_OFFSET))>>2)];
      };
  
      this.set_destructor = function(destructor) {
        HEAP32[(((this.ptr)+(ExceptionInfoAttrs.DESTRUCTOR_OFFSET))>>2)] = destructor;
      };
  
      this.get_destructor = function() {
        return HEAP32[(((this.ptr)+(ExceptionInfoAttrs.DESTRUCTOR_OFFSET))>>2)];
      };
  
      this.set_refcount = function(refcount) {
        HEAP32[(((this.ptr)+(ExceptionInfoAttrs.REFCOUNT_OFFSET))>>2)] = refcount;
      };
  
      this.set_caught = function (caught) {
        caught = caught ? 1 : 0;
        HEAP8[(((this.ptr)+(ExceptionInfoAttrs.CAUGHT_OFFSET))>>0)] = caught;
      };
  
      this.get_caught = function () {
        return HEAP8[(((this.ptr)+(ExceptionInfoAttrs.CAUGHT_OFFSET))>>0)] != 0;
      };
  
      this.set_rethrown = function (rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[(((this.ptr)+(ExceptionInfoAttrs.RETHROWN_OFFSET))>>0)] = rethrown;
      };
  
      this.get_rethrown = function () {
        return HEAP8[(((this.ptr)+(ExceptionInfoAttrs.RETHROWN_OFFSET))>>0)] != 0;
      };
  
      // Initialize native structure fields. Should be called once after allocated.
      this.init = function(type, destructor) {
        this.set_type(type);
        this.set_destructor(destructor);
        this.set_refcount(0);
        this.set_caught(false);
        this.set_rethrown(false);
      }
  
      this.add_ref = function() {
        var value = HEAP32[(((this.ptr)+(ExceptionInfoAttrs.REFCOUNT_OFFSET))>>2)];
        HEAP32[(((this.ptr)+(ExceptionInfoAttrs.REFCOUNT_OFFSET))>>2)] = value + 1;
      };
  
      // Returns true if last reference released.
      this.release_ref = function() {
        var prev = HEAP32[(((this.ptr)+(ExceptionInfoAttrs.REFCOUNT_OFFSET))>>2)];
        HEAP32[(((this.ptr)+(ExceptionInfoAttrs.REFCOUNT_OFFSET))>>2)] = prev - 1;
        assert(prev > 0);
        return prev === 1;
      };
    }
  
  var exceptionLast=0;
  
  var uncaughtExceptionCount=0;
  function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr);
      // Initialize ExceptionInfo content after it was allocated in __cxa_allocate_exception.
      info.init(type, destructor);
      exceptionLast = ptr;
      uncaughtExceptionCount++;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s NO_DISABLE_EXCEPTION_CATCHING or -s EXCEPTION_CATCHING_ALLOWED=[..] to catch.";
    }

  function _abort() {
      abort();
    }

  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

  function emscripten_realloc_buffer(size) {
      try {
        // round size grow request up to wasm page size (fixed 64KB per spec)
        wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16); // .grow() takes a delta compared to the previous size
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1 /*success*/;
      } catch(e) {
        console.error('emscripten_realloc_buffer: Attempted to grow heap from ' + buffer.byteLength  + ' bytes to ' + size + ' bytes, but got error: ' + e);
      }
      // implicit 0 return to save code size (caller will cast "undefined" into 0
      // anyhow)
    }
  function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      // With pthreads, races can happen (another thread might increase the size in between), so return a failure, and let the caller retry.
      assert(requestedSize > oldSize);
  
      // Memory resize rules:
      // 1. Always increase heap size to at least the requested size, rounded up to next page multiple.
      // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap geometrically: increase the heap size according to 
      //                                         MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%),
      //                                         At most overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
      // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap linearly: increase the heap size by at least MEMORY_GROWTH_LINEAR_STEP bytes.
      // 3. Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
      // 4. If we were unable to allocate as much memory, it may be due to over-eager decision to excessively reserve due to (3) above.
      //    Hence if an allocation fails, cut down on the amount of excess growth, in an attempt to succeed to perform a smaller allocation.
  
      // A limit is set for how much we can grow. We should not exceed that
      // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
      // In CAN_ADDRESS_2GB mode, stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate full 4GB Wasm memories, the size will wrap
      // back to 0 bytes in Wasm side for any code that deals with heap sizes, which would require special casing all heap size related code to treat
      // 0 specially.
      var maxHeapSize = 2147483648;
      if (requestedSize > maxHeapSize) {
        err('Cannot enlarge memory, asked to go up to ' + requestedSize + ' bytes, but the limit is ' + maxHeapSize + ' bytes!');
        return false;
      }
  
      // Loop through potential heap size increases. If we attempt a too eager reservation that fails, cut down on the
      // attempted size and reserve a smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown); // ensure geometric growth
        // but limit overreserving (default to capping at +96MB overgrowth at most)
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296 );
  
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
  
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
  
          return true;
        }
      }
      err('Failed to grow the heap from ' + oldSize + ' bytes to ' + newSize + ' bytes, not enough memory!');
      return false;
    }
var ASSERTIONS = true;



/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      }
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}


// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 = typeof atob === 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE === 'boolean' && ENVIRONMENT_IS_NODE) {
    var buf;
    try {
      // TODO: Update Node.js externs, Closure does not recognize the following Buffer.from()
      /**@suppress{checkTypes}*/
      buf = Buffer.from(s, 'base64');
    } catch (_) {
      buf = new Buffer(s, 'base64');
    }
    return new Uint8Array(buf['buffer'], buf['byteOffset'], buf['byteLength']);
  }

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


var asmLibraryArg = {
  "__cxa_allocate_exception": ___cxa_allocate_exception,
  "__cxa_throw": ___cxa_throw,
  "abort": _abort,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = createExportWrapper("__wasm_call_ctors", asm);

/** @type {function(...*):?} */
var __ZN3WAM9Processor4initEjjPv = Module["__ZN3WAM9Processor4initEjjPv"] = createExportWrapper("_ZN3WAM9Processor4initEjjPv", asm);

/** @type {function(...*):?} */
var _wam_init = Module["_wam_init"] = createExportWrapper("wam_init", asm);

/** @type {function(...*):?} */
var _wam_terminate = Module["_wam_terminate"] = createExportWrapper("wam_terminate", asm);

/** @type {function(...*):?} */
var _wam_resize = Module["_wam_resize"] = createExportWrapper("wam_resize", asm);

/** @type {function(...*):?} */
var _wam_onparam = Module["_wam_onparam"] = createExportWrapper("wam_onparam", asm);

/** @type {function(...*):?} */
var _wam_onmidi = Module["_wam_onmidi"] = createExportWrapper("wam_onmidi", asm);

/** @type {function(...*):?} */
var _wam_onsysex = Module["_wam_onsysex"] = createExportWrapper("wam_onsysex", asm);

/** @type {function(...*):?} */
var _wam_onprocess = Module["_wam_onprocess"] = createExportWrapper("wam_onprocess", asm);

/** @type {function(...*):?} */
var _wam_onpatch = Module["_wam_onpatch"] = createExportWrapper("wam_onpatch", asm);

/** @type {function(...*):?} */
var _wam_onmessageN = Module["_wam_onmessageN"] = createExportWrapper("wam_onmessageN", asm);

/** @type {function(...*):?} */
var _wam_onmessageS = Module["_wam_onmessageS"] = createExportWrapper("wam_onmessageS", asm);

/** @type {function(...*):?} */
var _wam_onmessageA = Module["_wam_onmessageA"] = createExportWrapper("wam_onmessageA", asm);

/** @type {function(...*):?} */
var _createModule = Module["_createModule"] = createExportWrapper("createModule", asm);

/** @type {function(...*):?} */
var ___errno_location = Module["___errno_location"] = createExportWrapper("__errno_location", asm);

/** @type {function(...*):?} */
var _fflush = Module["_fflush"] = createExportWrapper("fflush", asm);

/** @type {function(...*):?} */
var stackSave = Module["stackSave"] = createExportWrapper("stackSave", asm);

/** @type {function(...*):?} */
var stackRestore = Module["stackRestore"] = createExportWrapper("stackRestore", asm);

/** @type {function(...*):?} */
var stackAlloc = Module["stackAlloc"] = createExportWrapper("stackAlloc", asm);

/** @type {function(...*):?} */
var _emscripten_stack_init = Module["_emscripten_stack_init"] = asm["emscripten_stack_init"]

/** @type {function(...*):?} */
var _emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = asm["emscripten_stack_get_free"]

/** @type {function(...*):?} */
var _emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = asm["emscripten_stack_get_end"]

/** @type {function(...*):?} */
var _malloc = Module["_malloc"] = createExportWrapper("malloc", asm);





// === Auto-generated postamble setup entry stuff ===

if (!Object.getOwnPropertyDescriptor(Module, "intArrayFromString")) Module["intArrayFromString"] = function() { abort("'intArrayFromString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "intArrayToString")) Module["intArrayToString"] = function() { abort("'intArrayToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
Module["setValue"] = setValue;
if (!Object.getOwnPropertyDescriptor(Module, "getValue")) Module["getValue"] = function() { abort("'getValue' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "allocate")) Module["allocate"] = function() { abort("'allocate' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UTF8ArrayToString")) Module["UTF8ArrayToString"] = function() { abort("'UTF8ArrayToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UTF8ToString")) Module["UTF8ToString"] = function() { abort("'UTF8ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8Array")) Module["stringToUTF8Array"] = function() { abort("'stringToUTF8Array' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8")) Module["stringToUTF8"] = function() { abort("'stringToUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF8")) Module["lengthBytesUTF8"] = function() { abort("'lengthBytesUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackTrace")) Module["stackTrace"] = function() { abort("'stackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnPreRun")) Module["addOnPreRun"] = function() { abort("'addOnPreRun' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnInit")) Module["addOnInit"] = function() { abort("'addOnInit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnPreMain")) Module["addOnPreMain"] = function() { abort("'addOnPreMain' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnExit")) Module["addOnExit"] = function() { abort("'addOnExit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnPostRun")) Module["addOnPostRun"] = function() { abort("'addOnPostRun' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeStringToMemory")) Module["writeStringToMemory"] = function() { abort("'writeStringToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeArrayToMemory")) Module["writeArrayToMemory"] = function() { abort("'writeArrayToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeAsciiToMemory")) Module["writeAsciiToMemory"] = function() { abort("'writeAsciiToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addRunDependency")) Module["addRunDependency"] = function() { abort("'addRunDependency' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "removeRunDependency")) Module["removeRunDependency"] = function() { abort("'removeRunDependency' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createFolder")) Module["FS_createFolder"] = function() { abort("'FS_createFolder' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createPath")) Module["FS_createPath"] = function() { abort("'FS_createPath' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createDataFile")) Module["FS_createDataFile"] = function() { abort("'FS_createDataFile' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createPreloadedFile")) Module["FS_createPreloadedFile"] = function() { abort("'FS_createPreloadedFile' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createLazyFile")) Module["FS_createLazyFile"] = function() { abort("'FS_createLazyFile' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createLink")) Module["FS_createLink"] = function() { abort("'FS_createLink' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createDevice")) Module["FS_createDevice"] = function() { abort("'FS_createDevice' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_unlink")) Module["FS_unlink"] = function() { abort("'FS_unlink' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "getLEB")) Module["getLEB"] = function() { abort("'getLEB' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getFunctionTables")) Module["getFunctionTables"] = function() { abort("'getFunctionTables' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "alignFunctionTables")) Module["alignFunctionTables"] = function() { abort("'alignFunctionTables' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerFunctions")) Module["registerFunctions"] = function() { abort("'registerFunctions' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addFunction")) Module["addFunction"] = function() { abort("'addFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "removeFunction")) Module["removeFunction"] = function() { abort("'removeFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getFuncWrapper")) Module["getFuncWrapper"] = function() { abort("'getFuncWrapper' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "prettyPrint")) Module["prettyPrint"] = function() { abort("'prettyPrint' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "dynCall")) Module["dynCall"] = function() { abort("'dynCall' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getCompilerSetting")) Module["getCompilerSetting"] = function() { abort("'getCompilerSetting' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "print")) Module["print"] = function() { abort("'print' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "printErr")) Module["printErr"] = function() { abort("'printErr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getTempRet0")) Module["getTempRet0"] = function() { abort("'getTempRet0' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setTempRet0")) Module["setTempRet0"] = function() { abort("'setTempRet0' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "callMain")) Module["callMain"] = function() { abort("'callMain' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "abort")) Module["abort"] = function() { abort("'abort' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToNewUTF8")) Module["stringToNewUTF8"] = function() { abort("'stringToNewUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setFileTime")) Module["setFileTime"] = function() { abort("'setFileTime' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscripten_realloc_buffer")) Module["emscripten_realloc_buffer"] = function() { abort("'emscripten_realloc_buffer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ENV")) Module["ENV"] = function() { abort("'ENV' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ERRNO_CODES")) Module["ERRNO_CODES"] = function() { abort("'ERRNO_CODES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ERRNO_MESSAGES")) Module["ERRNO_MESSAGES"] = function() { abort("'ERRNO_MESSAGES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setErrNo")) Module["setErrNo"] = function() { abort("'setErrNo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "inetPton4")) Module["inetPton4"] = function() { abort("'inetPton4' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "inetNtop4")) Module["inetNtop4"] = function() { abort("'inetNtop4' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "inetPton6")) Module["inetPton6"] = function() { abort("'inetPton6' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "inetNtop6")) Module["inetNtop6"] = function() { abort("'inetNtop6' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readSockaddr")) Module["readSockaddr"] = function() { abort("'readSockaddr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeSockaddr")) Module["writeSockaddr"] = function() { abort("'writeSockaddr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "DNS")) Module["DNS"] = function() { abort("'DNS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getHostByName")) Module["getHostByName"] = function() { abort("'getHostByName' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GAI_ERRNO_MESSAGES")) Module["GAI_ERRNO_MESSAGES"] = function() { abort("'GAI_ERRNO_MESSAGES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "Protocols")) Module["Protocols"] = function() { abort("'Protocols' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "Sockets")) Module["Sockets"] = function() { abort("'Sockets' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getRandomDevice")) Module["getRandomDevice"] = function() { abort("'getRandomDevice' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "traverseStack")) Module["traverseStack"] = function() { abort("'traverseStack' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UNWIND_CACHE")) Module["UNWIND_CACHE"] = function() { abort("'UNWIND_CACHE' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "withBuiltinMalloc")) Module["withBuiltinMalloc"] = function() { abort("'withBuiltinMalloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readAsmConstArgsArray")) Module["readAsmConstArgsArray"] = function() { abort("'readAsmConstArgsArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readAsmConstArgs")) Module["readAsmConstArgs"] = function() { abort("'readAsmConstArgs' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "mainThreadEM_ASM")) Module["mainThreadEM_ASM"] = function() { abort("'mainThreadEM_ASM' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "jstoi_q")) Module["jstoi_q"] = function() { abort("'jstoi_q' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "jstoi_s")) Module["jstoi_s"] = function() { abort("'jstoi_s' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getExecutableName")) Module["getExecutableName"] = function() { abort("'getExecutableName' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "listenOnce")) Module["listenOnce"] = function() { abort("'listenOnce' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "autoResumeAudioContext")) Module["autoResumeAudioContext"] = function() { abort("'autoResumeAudioContext' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "dynCallLegacy")) Module["dynCallLegacy"] = function() { abort("'dynCallLegacy' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getDynCaller")) Module["getDynCaller"] = function() { abort("'getDynCaller' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "dynCall")) Module["dynCall"] = function() { abort("'dynCall' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "callRuntimeCallbacks")) Module["callRuntimeCallbacks"] = function() { abort("'callRuntimeCallbacks' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "runtimeKeepaliveCounter")) Module["runtimeKeepaliveCounter"] = function() { abort("'runtimeKeepaliveCounter' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "keepRuntimeAlive")) Module["keepRuntimeAlive"] = function() { abort("'keepRuntimeAlive' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "runtimeKeepalivePush")) Module["runtimeKeepalivePush"] = function() { abort("'runtimeKeepalivePush' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "runtimeKeepalivePop")) Module["runtimeKeepalivePop"] = function() { abort("'runtimeKeepalivePop' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "callUserCallback")) Module["callUserCallback"] = function() { abort("'callUserCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "maybeExit")) Module["maybeExit"] = function() { abort("'maybeExit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "asmjsMangle")) Module["asmjsMangle"] = function() { abort("'asmjsMangle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "reallyNegative")) Module["reallyNegative"] = function() { abort("'reallyNegative' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "unSign")) Module["unSign"] = function() { abort("'unSign' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "reSign")) Module["reSign"] = function() { abort("'reSign' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "formatString")) Module["formatString"] = function() { abort("'formatString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "PATH")) Module["PATH"] = function() { abort("'PATH' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "PATH_FS")) Module["PATH_FS"] = function() { abort("'PATH_FS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SYSCALLS")) Module["SYSCALLS"] = function() { abort("'SYSCALLS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "syscallMmap2")) Module["syscallMmap2"] = function() { abort("'syscallMmap2' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "syscallMunmap")) Module["syscallMunmap"] = function() { abort("'syscallMunmap' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getSocketFromFD")) Module["getSocketFromFD"] = function() { abort("'getSocketFromFD' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getSocketAddress")) Module["getSocketAddress"] = function() { abort("'getSocketAddress' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "JSEvents")) Module["JSEvents"] = function() { abort("'JSEvents' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerKeyEventCallback")) Module["registerKeyEventCallback"] = function() { abort("'registerKeyEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "specialHTMLTargets")) Module["specialHTMLTargets"] = function() { abort("'specialHTMLTargets' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "maybeCStringToJsString")) Module["maybeCStringToJsString"] = function() { abort("'maybeCStringToJsString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "findEventTarget")) Module["findEventTarget"] = function() { abort("'findEventTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "findCanvasEventTarget")) Module["findCanvasEventTarget"] = function() { abort("'findCanvasEventTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getBoundingClientRect")) Module["getBoundingClientRect"] = function() { abort("'getBoundingClientRect' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillMouseEventData")) Module["fillMouseEventData"] = function() { abort("'fillMouseEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerMouseEventCallback")) Module["registerMouseEventCallback"] = function() { abort("'registerMouseEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerWheelEventCallback")) Module["registerWheelEventCallback"] = function() { abort("'registerWheelEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerUiEventCallback")) Module["registerUiEventCallback"] = function() { abort("'registerUiEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerFocusEventCallback")) Module["registerFocusEventCallback"] = function() { abort("'registerFocusEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillDeviceOrientationEventData")) Module["fillDeviceOrientationEventData"] = function() { abort("'fillDeviceOrientationEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerDeviceOrientationEventCallback")) Module["registerDeviceOrientationEventCallback"] = function() { abort("'registerDeviceOrientationEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillDeviceMotionEventData")) Module["fillDeviceMotionEventData"] = function() { abort("'fillDeviceMotionEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerDeviceMotionEventCallback")) Module["registerDeviceMotionEventCallback"] = function() { abort("'registerDeviceMotionEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "screenOrientation")) Module["screenOrientation"] = function() { abort("'screenOrientation' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillOrientationChangeEventData")) Module["fillOrientationChangeEventData"] = function() { abort("'fillOrientationChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerOrientationChangeEventCallback")) Module["registerOrientationChangeEventCallback"] = function() { abort("'registerOrientationChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillFullscreenChangeEventData")) Module["fillFullscreenChangeEventData"] = function() { abort("'fillFullscreenChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerFullscreenChangeEventCallback")) Module["registerFullscreenChangeEventCallback"] = function() { abort("'registerFullscreenChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerRestoreOldStyle")) Module["registerRestoreOldStyle"] = function() { abort("'registerRestoreOldStyle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "hideEverythingExceptGivenElement")) Module["hideEverythingExceptGivenElement"] = function() { abort("'hideEverythingExceptGivenElement' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "restoreHiddenElements")) Module["restoreHiddenElements"] = function() { abort("'restoreHiddenElements' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setLetterbox")) Module["setLetterbox"] = function() { abort("'setLetterbox' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "currentFullscreenStrategy")) Module["currentFullscreenStrategy"] = function() { abort("'currentFullscreenStrategy' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "restoreOldWindowedStyle")) Module["restoreOldWindowedStyle"] = function() { abort("'restoreOldWindowedStyle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "softFullscreenResizeWebGLRenderTarget")) Module["softFullscreenResizeWebGLRenderTarget"] = function() { abort("'softFullscreenResizeWebGLRenderTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "doRequestFullscreen")) Module["doRequestFullscreen"] = function() { abort("'doRequestFullscreen' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillPointerlockChangeEventData")) Module["fillPointerlockChangeEventData"] = function() { abort("'fillPointerlockChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerPointerlockChangeEventCallback")) Module["registerPointerlockChangeEventCallback"] = function() { abort("'registerPointerlockChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerPointerlockErrorEventCallback")) Module["registerPointerlockErrorEventCallback"] = function() { abort("'registerPointerlockErrorEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "requestPointerLock")) Module["requestPointerLock"] = function() { abort("'requestPointerLock' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillVisibilityChangeEventData")) Module["fillVisibilityChangeEventData"] = function() { abort("'fillVisibilityChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerVisibilityChangeEventCallback")) Module["registerVisibilityChangeEventCallback"] = function() { abort("'registerVisibilityChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerTouchEventCallback")) Module["registerTouchEventCallback"] = function() { abort("'registerTouchEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillGamepadEventData")) Module["fillGamepadEventData"] = function() { abort("'fillGamepadEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerGamepadEventCallback")) Module["registerGamepadEventCallback"] = function() { abort("'registerGamepadEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerBeforeUnloadEventCallback")) Module["registerBeforeUnloadEventCallback"] = function() { abort("'registerBeforeUnloadEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "fillBatteryEventData")) Module["fillBatteryEventData"] = function() { abort("'fillBatteryEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "battery")) Module["battery"] = function() { abort("'battery' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerBatteryEventCallback")) Module["registerBatteryEventCallback"] = function() { abort("'registerBatteryEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setCanvasElementSize")) Module["setCanvasElementSize"] = function() { abort("'setCanvasElementSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getCanvasElementSize")) Module["getCanvasElementSize"] = function() { abort("'getCanvasElementSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "polyfillSetImmediate")) Module["polyfillSetImmediate"] = function() { abort("'polyfillSetImmediate' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "demangle")) Module["demangle"] = function() { abort("'demangle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "demangleAll")) Module["demangleAll"] = function() { abort("'demangleAll' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "jsStackTrace")) Module["jsStackTrace"] = function() { abort("'jsStackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackTrace")) Module["stackTrace"] = function() { abort("'stackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getEnvStrings")) Module["getEnvStrings"] = function() { abort("'getEnvStrings' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "checkWasiClock")) Module["checkWasiClock"] = function() { abort("'checkWasiClock' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "flush_NO_FILESYSTEM")) Module["flush_NO_FILESYSTEM"] = function() { abort("'flush_NO_FILESYSTEM' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64")) Module["writeI53ToI64"] = function() { abort("'writeI53ToI64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64Clamped")) Module["writeI53ToI64Clamped"] = function() { abort("'writeI53ToI64Clamped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64Signaling")) Module["writeI53ToI64Signaling"] = function() { abort("'writeI53ToI64Signaling' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToU64Clamped")) Module["writeI53ToU64Clamped"] = function() { abort("'writeI53ToU64Clamped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToU64Signaling")) Module["writeI53ToU64Signaling"] = function() { abort("'writeI53ToU64Signaling' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readI53FromI64")) Module["readI53FromI64"] = function() { abort("'readI53FromI64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readI53FromU64")) Module["readI53FromU64"] = function() { abort("'readI53FromU64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "convertI32PairToI53")) Module["convertI32PairToI53"] = function() { abort("'convertI32PairToI53' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "convertU32PairToI53")) Module["convertU32PairToI53"] = function() { abort("'convertU32PairToI53' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "uncaughtExceptionCount")) Module["uncaughtExceptionCount"] = function() { abort("'uncaughtExceptionCount' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "exceptionLast")) Module["exceptionLast"] = function() { abort("'exceptionLast' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "exceptionCaught")) Module["exceptionCaught"] = function() { abort("'exceptionCaught' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ExceptionInfoAttrs")) Module["ExceptionInfoAttrs"] = function() { abort("'ExceptionInfoAttrs' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ExceptionInfo")) Module["ExceptionInfo"] = function() { abort("'ExceptionInfo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "CatchInfo")) Module["CatchInfo"] = function() { abort("'CatchInfo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "exception_addRef")) Module["exception_addRef"] = function() { abort("'exception_addRef' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "exception_decRef")) Module["exception_decRef"] = function() { abort("'exception_decRef' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "Browser")) Module["Browser"] = function() { abort("'Browser' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "funcWrappers")) Module["funcWrappers"] = function() { abort("'funcWrappers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getFuncWrapper")) Module["getFuncWrapper"] = function() { abort("'getFuncWrapper' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setMainLoop")) Module["setMainLoop"] = function() { abort("'setMainLoop' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "FS")) Module["FS"] = function() { abort("'FS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "mmapAlloc")) Module["mmapAlloc"] = function() { abort("'mmapAlloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "MEMFS")) Module["MEMFS"] = function() { abort("'MEMFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "TTY")) Module["TTY"] = function() { abort("'TTY' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "PIPEFS")) Module["PIPEFS"] = function() { abort("'PIPEFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SOCKFS")) Module["SOCKFS"] = function() { abort("'SOCKFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "_setNetworkCallback")) Module["_setNetworkCallback"] = function() { abort("'_setNetworkCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "tempFixedLengthArray")) Module["tempFixedLengthArray"] = function() { abort("'tempFixedLengthArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "miniTempWebGLFloatBuffers")) Module["miniTempWebGLFloatBuffers"] = function() { abort("'miniTempWebGLFloatBuffers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "heapObjectForWebGLType")) Module["heapObjectForWebGLType"] = function() { abort("'heapObjectForWebGLType' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "heapAccessShiftForWebGLHeap")) Module["heapAccessShiftForWebGLHeap"] = function() { abort("'heapAccessShiftForWebGLHeap' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GL")) Module["GL"] = function() { abort("'GL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGet")) Module["emscriptenWebGLGet"] = function() { abort("'emscriptenWebGLGet' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "computeUnpackAlignedImageSize")) Module["computeUnpackAlignedImageSize"] = function() { abort("'computeUnpackAlignedImageSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetTexPixelData")) Module["emscriptenWebGLGetTexPixelData"] = function() { abort("'emscriptenWebGLGetTexPixelData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetUniform")) Module["emscriptenWebGLGetUniform"] = function() { abort("'emscriptenWebGLGetUniform' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "webglGetUniformLocation")) Module["webglGetUniformLocation"] = function() { abort("'webglGetUniformLocation' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "webglPrepareUniformLocationsBeforeFirstUse")) Module["webglPrepareUniformLocationsBeforeFirstUse"] = function() { abort("'webglPrepareUniformLocationsBeforeFirstUse' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "webglGetLeftBracePos")) Module["webglGetLeftBracePos"] = function() { abort("'webglGetLeftBracePos' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetVertexAttrib")) Module["emscriptenWebGLGetVertexAttrib"] = function() { abort("'emscriptenWebGLGetVertexAttrib' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeGLArray")) Module["writeGLArray"] = function() { abort("'writeGLArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "AL")) Module["AL"] = function() { abort("'AL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL_unicode")) Module["SDL_unicode"] = function() { abort("'SDL_unicode' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL_ttfContext")) Module["SDL_ttfContext"] = function() { abort("'SDL_ttfContext' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL_audio")) Module["SDL_audio"] = function() { abort("'SDL_audio' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL")) Module["SDL"] = function() { abort("'SDL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL_gfx")) Module["SDL_gfx"] = function() { abort("'SDL_gfx' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GLUT")) Module["GLUT"] = function() { abort("'GLUT' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "EGL")) Module["EGL"] = function() { abort("'EGL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GLFW_Window")) Module["GLFW_Window"] = function() { abort("'GLFW_Window' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GLFW")) Module["GLFW"] = function() { abort("'GLFW' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GLEW")) Module["GLEW"] = function() { abort("'GLEW' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "IDBStore")) Module["IDBStore"] = function() { abort("'IDBStore' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "runAndAbortIfError")) Module["runAndAbortIfError"] = function() { abort("'runAndAbortIfError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "warnOnce")) Module["warnOnce"] = function() { abort("'warnOnce' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackSave")) Module["stackSave"] = function() { abort("'stackSave' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackRestore")) Module["stackRestore"] = function() { abort("'stackRestore' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackAlloc")) Module["stackAlloc"] = function() { abort("'stackAlloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "AsciiToString")) Module["AsciiToString"] = function() { abort("'AsciiToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToAscii")) Module["stringToAscii"] = function() { abort("'stringToAscii' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UTF16ToString")) Module["UTF16ToString"] = function() { abort("'UTF16ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF16")) Module["stringToUTF16"] = function() { abort("'stringToUTF16' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF16")) Module["lengthBytesUTF16"] = function() { abort("'lengthBytesUTF16' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UTF32ToString")) Module["UTF32ToString"] = function() { abort("'UTF32ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF32")) Module["stringToUTF32"] = function() { abort("'stringToUTF32' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF32")) Module["lengthBytesUTF32"] = function() { abort("'lengthBytesUTF32' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8")) Module["allocateUTF8"] = function() { abort("'allocateUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8OnStack")) Module["allocateUTF8OnStack"] = function() { abort("'allocateUTF8OnStack' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["writeStackCookie"] = writeStackCookie;
Module["checkStackCookie"] = checkStackCookie;
if (!Object.getOwnPropertyDescriptor(Module, "intArrayFromBase64")) Module["intArrayFromBase64"] = function() { abort("'intArrayFromBase64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "tryParseAsDataURI")) Module["tryParseAsDataURI"] = function() { abort("'tryParseAsDataURI' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_NORMAL")) Object.defineProperty(Module, "ALLOC_NORMAL", { configurable: true, get: function() { abort("'ALLOC_NORMAL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") } });
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_STACK")) Object.defineProperty(Module, "ALLOC_STACK", { configurable: true, get: function() { abort("'ALLOC_STACK' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)") } });

var calledRun;

/**
 * @constructor
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}

var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  _emscripten_stack_init();
  writeStackCookie();
}

/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }

  stackCheckInit();

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    assert(!Module['_main'], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
  checkStackCookie();
}
Module['run'] = run;

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = function(x) {
    has = true;
  }
  try { // it doesn't matter if it fails
    var flush = null;
    if (flush) flush();
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.');
    warnOnce('(this may also be due to not including full filesystem support - try building with -s FORCE_FILESYSTEM=1)');
  }
}

/** @param {boolean|number=} implicit */
function exit(status, implicit) {
  EXITSTATUS = status;

  checkUnflushedContent();

  // if this is just main exit-ing implicitly, and the status is 0, then we
  // don't need to do anything here and can just leave. if the status is
  // non-zero, though, then we need to report it.
  // (we may have warned about this earlier, if a situation justifies doing so)
  if (implicit && keepRuntimeAlive() && status === 0) {
    return;
  }

  if (keepRuntimeAlive()) {
    // if exit() was called, we may warn the user if the runtime isn't actually being shut down
    if (!implicit) {
      var msg = 'program exited (with status: ' + status + '), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)';
      err(msg);
    }
  } else {

    exitRuntime();

    if (Module['onExit']) Module['onExit'](status);

    ABORT = true;
  }

  quit_(status, new ExitStatus(status));
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

run();





// WAM AudioWorkletProcessor
// Jari Kleimola 2017-18 (jari@webaudiomodules.org)
//
// work in progress
// helper class for WASM data marshalling and C function call binding
// also provides midi, patch data, parameter and arbitrary message support

class WAMProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [];
  }

  constructor(options) {
    options = options || {};
    if (options.numberOfInputs === undefined) options.numberOfInputs = 0;
    if (options.numberOfOutputs === undefined) options.numberOfOutputs = 1;
    if (options.inputChannelCount === undefined) options.inputChannelCount = [];
    if (options.outputChannelCount === undefined)
      options.outputChannelCount = [2];
    if (options.inputChannelCount.length != options.numberOfInputs)
      throw new Error('InvalidArgumentException');
    if (options.outputChannelCount.length != options.numberOfOutputs)
      throw new Error('InvalidArgumentException');

    super(options);
    this.bufsize = 128;
    this.sr = AudioWorkletGlobalScope.sampleRate || sampleRate;
    this.audiobufs = [[], []];

    var WAM = options.mod;
    this.WAM = WAM;
    WAM.port = this.port;

    // -- construction C function wrappers
    var wam_ctor = WAM.cwrap('createModule', 'number', []);
    var wam_init = WAM.cwrap('wam_init', null, [
      'number',
      'number',
      'number',
      'string',
    ]);

    // -- runtime C function wrappers
    this.wam_terminate = WAM.cwrap('wam_terminate', null, ['number']);
    this.wam_onmidi = WAM.cwrap('wam_onmidi', null, [
      'number',
      'number',
      'number',
      'number',
    ]);
    this.wam_onpatch = WAM.cwrap('wam_onpatch', null, [
      'number',
      'number',
      'number',
    ]);
    this.wam_onprocess = WAM.cwrap('wam_onprocess', 'number', [
      'number',
      'number',
      'number',
    ]);
    this.wam_onparam = WAM.cwrap('wam_onparam', null, [
      'number',
      'number',
      'number',
    ]);
    this.wam_onsysex = WAM.cwrap('wam_onsysex', null, [
      'number',
      'number',
      'number',
    ]);
    this.wam_onmessageN = WAM.cwrap('wam_onmessageN', null, [
      'number',
      'string',
      'string',
      'number',
    ]);
    this.wam_onmessageS = WAM.cwrap('wam_onmessageS', null, [
      'number',
      'string',
      'string',
      'string',
    ]);

    // -- supress warnings for older WAMs
    if (WAM['_wam_onmessageA'])
      this.wam_onmessageA = WAM.cwrap('wam_onmessageA', null, [
        'number',
        'string',
        'string',
        'number',
        'number',
      ]);

    this.inst = wam_ctor();
    var desc = wam_init(this.inst, this.bufsize, this.sr, '');

    // -- audio io configuration
    this.numInputs = options.numberOfInputs;
    this.numOutputs = options.numberOfOutputs;
    this.numInChannels = options.inputChannelCount;
    this.numOutChannels = options.outputChannelCount;

    var ibufs = this.numInputs > 0 ? WAM._malloc(this.numInputs) : 0;
    var obufs = this.numOutputs > 0 ? WAM._malloc(this.numOutputs) : 0;
    this.audiobus = WAM._malloc(2 * 4);
    WAM.setValue(this.audiobus, ibufs, 'i32');
    WAM.setValue(this.audiobus + 4, obufs, 'i32');

    for (var i = 0; i < this.numInputs; i++) {
      var numChannels = this.numInChannels[i];
      for (var c = 0; c < numChannels; c++) {
        var buf = WAM._malloc(this.bufsize * 4);

        WAM.setValue(ibufs + (i * numChannels + c) * 4, buf, 'i32');
        this.audiobufs[0].push(buf / 4);
      }
    }
    for (var i = 0; i < this.numOutputs; i++) {
      var numChannels = this.numOutChannels[i];
      for (var c = 0; c < numChannels; c++) {
        var buf = WAM._malloc(this.bufsize * 4);

        WAM.setValue(obufs + (i * numChannels + c) * 4, buf, 'i32');
        this.audiobufs[1].push(buf / 4);
      }
    }

    this.port.onmessage = this.onmessage.bind(this);
    this.port.start();

    if (desc && WAM.UTF8ToString) {
      var msg =
        '{ "type":"descriptor", "data":' + WAM.UTF8ToString(desc) + ' }';
      this.port.postMessage(msg);
    }
  }

  onmessage(e) {
    var msg = e.data;
    var data = msg.data;
    switch (msg.type) {
      case 'midi':
        this.onmidi(data[0], data[1], data[2]);
        break;
      case 'sysex':
        this.onsysex(data);
        break;
      case 'patch':
        this.onpatch(data);
        break;
      case 'param':
        this.onparam(msg.key, msg.value);
        break;
      case 'msg':
        this.onmsg(msg.verb, msg.prop, msg.data);
        break;
      //case "osc":   this.onmsg(msg.prop, msg.type, msg.data); break;
    }
  }

  onmidi(status, data1, data2) {
    this.wam_onmidi(this.inst, status, data1, data2);
  }

  onparam(key, value) {
    if (typeof key === 'string')
      this.wam_onmessageN(this.inst, 'set', key, value);
    else this.wam_onparam(this.inst, key, value);
  }

  onmsg(verb, prop, data) {
    if (data instanceof ArrayBuffer) {
      var buffer = new Uint8Array(data);
      var len = data.byteLength;
      var WAM = this.WAM;
      var buf = WAM._malloc(data.byteLength);
      for (var i = 0; i < len; i++) WAM.setValue(buf + i, buffer[i], 'i8');
      this.wam_onmessageA(this.inst, verb, prop, buf, len);
      WAM._free(buf);
    } else if (typeof data === 'string')
      this.wam_onmessageS(this.inst, verb, prop, data);
    else this.wam_onmessageN(this.inst, verb, prop, data);
  }

  onpatch(data) {
    var buffer = new Uint8Array(data);
    var len = data.byteLength;
    var WAM = this.WAM;
    var buf = WAM._malloc(len);
    for (var i = 0; i < len; i++) WAM.setValue(buf + i, buffer[i], 'i8');
    this.wam_onpatch(this.inst, buf, len);
    WAM._free(buf);
  }

  onsysex(data) {
    var WAM = this.WAM;
    var buf = WAM._malloc(data.length);
    for (var i = 0; i < data.length; i++) WAM.setValue(buf + i, data[i], 'i8');
    this.wam_onsysex(this.inst, buf, data.length);
    WAM._free(buf);
  }

  process(inputs, outputs, params) {
    var WAM = this.WAM;

    // -- inputs
    for (var i = 0; i < this.numInputs; i++) {
      var numChannels = this.numInChannels[i];
      for (var c = 0; c < numChannels; c++) {
        var waain = inputs[i][c];
        var wamin = this.audiobufs[0][i * numChannels + c];
        WAM.HEAPF32.set(waain, wamin);
      }
    }

    this.wam_onprocess(this.inst, this.audiobus, 0);

    // -- outputs
    for (var i = 0; i < this.numOutputs; i++) {
      var numChannels = this.numOutChannels[i];
      for (var c = 0; c < numChannels; c++) {
        var waaout = outputs[i][c];
        var wamout = this.audiobufs[1][i * numChannels + c];
        waaout.set(WAM.HEAPF32.subarray(wamout, wamout + this.bufsize));
      }
    }

    // noop

    // const firstInput = inputs[0];
    // const firstOutput = outputs[0];
    // for (let ch = 0; ch < firstInput.length; ch++) {
    //   for (let sample = 0; sample < firstInput[ch].length; sample++) {
    //     firstOutput[ch][sample] = firstInput[ch][sample];
    //   }
    // }

    return true;
  }
}

class PlatverbProcessor extends WAMProcessor {
  constructor(options) {
    options = {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      inputChannelCount: [2],
      outputChannelCount: [2],
    };
    options.mod = Module; // the WASM module
    super(options);
  }
}

registerProcessor('Platverb', PlatverbProcessor);


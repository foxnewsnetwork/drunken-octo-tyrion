//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      rand = Math.floor(Math.random() * (index + 1));
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    // The `isSorted` flag is irrelevant if the array only contains two elements.
    if (array.length < 3) isSorted = true;
    _.reduce(initial, function (memo, value, index) {
      if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1), true);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        result = func.apply(context, args);
      }
      whenDone();
      throttling = true;
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(_.flatten(slice.call(arguments, 1)), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);
//     Backbone.js 0.9.2

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to slice/splice.
  var slice = Array.prototype.slice;
  var splice = Array.prototype.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.9.2';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  var $ = root.jQuery || root.Zepto || root.ender;

  // Set the JavaScript library that will be used for DOM manipulation and
  // Ajax calls (a.k.a. the `$` variable). By default Backbone will use: jQuery,
  // Zepto, or Ender; but the `setDomLibrary()` method lets you inject an
  // alternate JavaScript library (or a mock library for testing your views
  // outside of a browser).
  Backbone.setDomLibrary = function(lib) {
    $ = lib;
  };

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // Regular expression used to split event strings
  var eventSplitter = /\s+/;

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {

      var calls, event, node, tail, list;
      if (!callback) return this;
      events = events.split(eventSplitter);
      calls = this._callbacks || (this._callbacks = {});

      // Create an immutable callback list, allowing traversal during
      // modification.  The tail is an empty object that will always be used
      // as the next node.
      while (event = events.shift()) {
        list = calls[event];
        node = list ? list.tail : {};
        node.next = tail = {};
        node.context = context;
        node.callback = callback;
        calls[event] = {tail: tail, next: list ? list.next : node};
      }

      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, calls, node, tail, cb, ctx;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) return;
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      // Loop through the listed events and contexts, splicing them out of the
      // linked list of callbacks if appropriate.
      events = events ? events.split(eventSplitter) : _.keys(calls);
      while (event = events.shift()) {
        node = calls[event];
        delete calls[event];
        if (!node || !(callback || context)) continue;
        // Create a new list, omitting the indicated callbacks.
        tail = node.tail;
        while ((node = node.next) !== tail) {
          cb = node.callback;
          ctx = node.context;
          if ((callback && cb !== callback) || (context && ctx !== context)) {
            this.on(event, cb, ctx);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, node, calls, tail, args, all, rest;
      if (!(calls = this._callbacks)) return this;
      all = calls.all;
      events = events.split(eventSplitter);
      rest = slice.call(arguments, 1);

      // For each event, walk through the linked list of callbacks twice,
      // first to trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        if (node = calls[event]) {
          tail = node.tail;
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, rest);
          }
        }
        if (node = all) {
          tail = node.tail;
          args = [event].concat(rest);
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, args);
          }
        }
      }

      return this;
    }

  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var defaults;
    attributes || (attributes = {});
    if (options && options.parse) attributes = this.parse(attributes);
    if (defaults = getValue(this, 'defaults')) {
      attributes = _.extend({}, defaults, attributes);
    }
    if (options && options.collection) this.collection = options.collection;
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this.set(attributes, {silent: true});
    // Reset change tracking.
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this._previousAttributes = _.clone(this.attributes);
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // A hash of attributes that have silently changed since the last time
    // `change` was called.  Will become pending attributes on the next call.
    _silent: null,

    // A hash of attributes that have changed since the last `'change'` event
    // began.
    _pending: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.get(attr);
      return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    set: function(key, value, options) {
      var attrs, attr, val;

      // Handle both
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs instanceof Model) attrs = attrs.attributes;
      if (options.unset) for (attr in attrs) attrs[attr] = void 0;

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      var changes = options.changes = {};
      var now = this.attributes;
      var escaped = this._escapedAttributes;
      var prev = this._previousAttributes || {};

      // For each `set` attribute...
      for (attr in attrs) {
        val = attrs[attr];

        // If the new and current value differ, record the change.
        if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {
          delete escaped[attr];
          (options.silent ? this._silent : changes)[attr] = true;
        }

        // Update or delete the current value.
        options.unset ? delete now[attr] : now[attr] = val;

        // If the new and previous value differ, record the change.  If not,
        // then remove changes for this attribute.
        if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
          this.changed[attr] = val;
          if (!options.silent) this._pending[attr] = true;
        } else {
          delete this.changed[attr];
          delete this._pending[attr];
        }
      }

      // Fire the `"change"` events.
      if (!options.silent) this.change(options);
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset: function(attr, options) {
      (options || (options = {})).unset = true;
      return this.set(attr, null, options);
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear: function(options) {
      (options || (options = {})).unset = true;
      return this.set(_.clone(this.attributes), options);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp);
      };
      options.error = Backbone.wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, value, options) {
      var attrs, current;

      // Handle both `("key", value)` and `({key: value})` -style calls.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }
      options = options ? _.clone(options) : {};

      // If we're "wait"-ing to set changed attributes, validate early.
      if (options.wait) {
        if (!this._validate(attrs, options)) return false;
        current = _.clone(this.attributes);
      }

      // Regular saves `set` attributes before persisting to the server.
      var silentOptions = _.extend({}, options, {silent: true});
      if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        var serverAttrs = model.parse(resp, xhr);
        if (options.wait) {
          delete options.wait;
          serverAttrs = _.extend(attrs || {}, serverAttrs);
        }
        if (!model.set(serverAttrs, options)) return false;
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      // Finish configuring and sending the Ajax request.
      options.error = Backbone.wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
      if (options.wait) this.set(current, silentOptions);
      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var triggerDestroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      if (this.isNew()) {
        triggerDestroy();
        return false;
      }

      options.success = function(resp) {
        if (options.wait) triggerDestroy();
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      options.error = Backbone.wrapError(options.error, model, options);
      var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
      if (!options.wait) triggerDestroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, xhr) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Call this method to manually fire a `"change"` event for this model and
    // a `"change:attribute"` event for each changed attribute.
    // Calling this will cause all objects observing the model to update.
    change: function(options) {
      options || (options = {});
      var changing = this._changing;
      this._changing = true;

      // Silent changes become pending changes.
      for (var attr in this._silent) this._pending[attr] = true;

      // Silent changes are triggered.
      var changes = _.extend({}, options.changes, this._silent);
      this._silent = {};
      for (var attr in changes) {
        this.trigger('change:' + attr, this, this.get(attr), options);
      }
      if (changing) return this;

      // Continue firing `"change"` events while there are pending changes.
      while (!_.isEmpty(this._pending)) {
        this._pending = {};
        this.trigger('change', this, options);
        // Pending and silent changes still remain.
        for (var attr in this.changed) {
          if (this._pending[attr] || this._silent[attr]) continue;
          delete this.changed[attr];
        }
        this._previousAttributes = _.clone(this.attributes);
      }

      this._changing = false;
      return this;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (!arguments.length) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false, old = this._previousAttributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (!arguments.length || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Check if the model is currently in a valid state. It's only possible to
    // get into an *invalid* state if you're using silent changes.
    isValid: function() {
      return !this.validate(this.attributes);
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. If a specific `error` callback has
    // been passed, call that instead of firing the general `"error"` event.
    _validate: function(attrs, options) {
      if (options.silent || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validate(attrs, options);
      if (!error) return true;
      if (options && options.error) {
        options.error(this, error, options);
      } else {
        this.trigger('error', this, error, options);
      }
      return false;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, {silent: true, parse: options.parse});
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `add` event for every new model.
    add: function(models, options) {
      var i, index, length, model, cid, id, cids = {}, ids = {}, dups = [];
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];

      // Begin by turning bare objects into model references, and preventing
      // invalid models or duplicate models from being added.
      for (i = 0, length = models.length; i < length; i++) {
        if (!(model = models[i] = this._prepareModel(models[i], options))) {
          throw new Error("Can't add an invalid model to a collection");
        }
        cid = model.cid;
        id = model.id;
        if (cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {
          dups.push(i);
          continue;
        }
        cids[cid] = ids[id] = model;
      }

      // Remove duplicates.
      i = dups.length;
      while (i--) {
        models.splice(dups[i], 1);
      }

      // Listen to added models' events, and index models for lookup by
      // `id` and by `cid`.
      for (i = 0, length = models.length; i < length; i++) {
        (model = models[i]).on('all', this._onModelEvent, this);
        this._byCid[model.cid] = model;
        if (model.id != null) this._byId[model.id] = model;
      }

      // Insert models into the collection, re-sorting if needed, and triggering
      // `add` events unless silenced.
      this.length += length;
      index = options.at != null ? options.at : this.models.length;
      splice.apply(this.models, [index, 0].concat(models));
      if (this.comparator) this.sort({silent: true});
      if (options.silent) return this;
      for (i = 0, length = this.models.length; i < length; i++) {
        if (!cids[(model = this.models[i]).cid]) continue;
        options.index = i;
        model.trigger('add', model, this, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `remove` event for every model removed.
    remove: function(models, options) {
      var i, l, index, model;
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];
      for (i = 0, l = models.length; i < l; i++) {
        model = this.getByCid(models[i]) || this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byCid[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, options);
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: 0}, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Get a model from the set by id.
    get: function(id) {
      if (id == null) return void 0;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid: function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of `filter`.
    where: function(attrs) {
      if (_.isEmpty(attrs)) return [];
      return this.filter(function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      var boundComparator = _.bind(this.comparator, this);
      if (this.comparator.length == 1) {
        this.models = this.sortBy(boundComparator);
      } else {
        this.models.sort(boundComparator);
      }
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `add` or `remove` events. Fires `reset` when finished.
    reset: function(models, options) {
      models  || (models = []);
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      this._reset();
      this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `add: true` is passed, appends the
    // models to the collection instead of resetting.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === undefined) options.parse = true;
      var collection = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
        if (success) success(collection, resp);
      };
      options.error = Backbone.wrapError(options.error, collection, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      var coll = this;
      options = options ? _.clone(options) : {};
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!options.wait) coll.add(model, options);
      var success = options.success;
      options.success = function(nextModel, resp, xhr) {
        if (options.wait) coll.add(nextModel, options);
        if (success) {
          success(nextModel, resp);
        } else {
          nextModel.trigger('sync', model, resp, options);
        }
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, xhr) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is reset.
    _reset: function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(model, options) {
      options || (options = {});
      if (!(model instanceof Model)) {
        var attrs = model;
        options.collection = this;
        model = new this.model(attrs, options);
        if (!model._validate(model.attributes, options)) model = false;
      } else if (!model.collection) {
        model.collection = this;
      }
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference: function(model) {
      if (this == model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event == 'add' || event == 'remove') && collection != this) return;
      if (event == 'destroy') {
        this.remove(model, options);
      }
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Router
  // -------------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam    = /:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      Backbone.history || (Backbone.history = new History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (!callback) callback = this[name];
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
        Backbone.history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(namedParam, '([^\/]+)')
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters: function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning leading hashes and slashes .
  var routeStripper = /^[#\/]/;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(windowOverride) {
      var loc = windowOverride ? windowOverride.location : window.location;
      var match = loc.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || forcePushState) {
          fragment = window.location.pathname;
          var search = window.location.search;
          if (search) fragment += search;
        } else {
          fragment = this.getHash();
        }
      }
      if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        $(window).bind('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = window.location;
      var atRoot  = loc.pathname == this.options.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));
      if (current == this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: options};
      var frag = (fragment || '').replace(routeStripper, '');
      if (this.fragment == frag) return;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
        this.fragment = frag;
        window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this.fragment = frag;
        this._updateHash(window.location, frag, options.replace);
        if (this.iframe && (frag != this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.
          // When replace is true, we don't want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, frag, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        window.location.assign(this.options.root + fragment);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
      } else {
        location.hash = fragment;
      }
    }
  });

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove: function() {
      this.$el.remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make: function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = (element instanceof $) ? element : $(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = getValue(this, 'events')))) return;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) throw new Error('Method "' + events[key] + '" does not exist');
        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.bind(eventName, method);
        } else {
          this.$el.delegate(selector, eventName, method);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.unbind('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = getValue(this, 'attributes') || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.setElement(this.make(this.tagName, attrs), false);
      } else {
        this.setElement(this.el, false);
      }
    }

  });

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Model.extend = Collection.extend = Router.extend = View.extend = extend;

  // Backbone.sync
  // -------------

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    options || (options = {});

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = getValue(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!options.data && model && (method == 'create' || method == 'update')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
        };
      }
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !Backbone.emulateJSON) {
      params.processData = false;
    }

    // Make the request, allowing the user to override any Ajax options.
    return $.ajax(_.extend(params, options));
  };

  // Wrap an optional error callback with a fallback error event.
  Backbone.wrapError = function(onError, originalModel, options) {
    return function(model, resp) {
      resp = model === originalModel ? resp : model;
      if (onError) {
        onError(originalModel, resp, options);
      } else {
        originalModel.trigger('error', originalModel, resp, options);
      }
    };
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

}).call(this);
;(function(){


// CommonJS require()

function require(p){
    var path = require.resolve(p)
      , mod = require.modules[path];
    if (!mod) throw new Error('failed to require "' + p + '"');
    if (!mod.exports) {
      mod.exports = {};
      mod.call(mod.exports, mod, mod.exports, require.relative(path));
    }
    return mod.exports;
  }

require.modules = {};

require.resolve = function (path){
    var orig = path
      , reg = path + '.js'
      , index = path + '/index.js';
    return require.modules[reg] && reg
      || require.modules[index] && index
      || orig;
  };

require.register = function (path, fn){
    require.modules[path] = fn;
  };

require.relative = function (parent) {
    return function(p){
      if ('.' != p.charAt(0)) return require(p);
      
      var path = parent.split('/')
        , segs = p.split('/');
      path.pop();
      
      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        if ('..' == seg) path.pop();
        else if ('.' != seg) path.push(seg);
      }

      return require(path.join('/'));
    };
  };


require.register("browser/debug.js", function(module, exports, require){

module.exports = function(type){
  return function(){
    
  }
};
}); // module: browser/debug.js

require.register("browser/diff.js", function(module, exports, require){

}); // module: browser/diff.js

require.register("browser/events.js", function(module, exports, require){

/**
 * Module exports.
 */

exports.EventEmitter = EventEmitter;

/**
 * Check if `obj` is an array.
 */

function isArray(obj) {
  return '[object Array]' == {}.toString.call(obj);
}

/**
 * Event emitter constructor.
 *
 * @api public
 */

function EventEmitter(){};

/**
 * Adds a listener.
 *
 * @api public
 */

EventEmitter.prototype.on = function (name, fn) {
  if (!this.$events) {
    this.$events = {};
  }

  if (!this.$events[name]) {
    this.$events[name] = fn;
  } else if (isArray(this.$events[name])) {
    this.$events[name].push(fn);
  } else {
    this.$events[name] = [this.$events[name], fn];
  }

  return this;
};

EventEmitter.prototype.addListener = EventEmitter.prototype.on;

/**
 * Adds a volatile listener.
 *
 * @api public
 */

EventEmitter.prototype.once = function (name, fn) {
  var self = this;

  function on () {
    self.removeListener(name, on);
    fn.apply(this, arguments);
  };

  on.listener = fn;
  this.on(name, on);

  return this;
};

/**
 * Removes a listener.
 *
 * @api public
 */

EventEmitter.prototype.removeListener = function (name, fn) {
  if (this.$events && this.$events[name]) {
    var list = this.$events[name];

    if (isArray(list)) {
      var pos = -1;

      for (var i = 0, l = list.length; i < l; i++) {
        if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
          pos = i;
          break;
        }
      }

      if (pos < 0) {
        return this;
      }

      list.splice(pos, 1);

      if (!list.length) {
        delete this.$events[name];
      }
    } else if (list === fn || (list.listener && list.listener === fn)) {
      delete this.$events[name];
    }
  }

  return this;
};

/**
 * Removes all listeners for an event.
 *
 * @api public
 */

EventEmitter.prototype.removeAllListeners = function (name) {
  if (name === undefined) {
    this.$events = {};
    return this;
  }

  if (this.$events && this.$events[name]) {
    this.$events[name] = null;
  }

  return this;
};

/**
 * Gets all listeners for a certain event.
 *
 * @api public
 */

EventEmitter.prototype.listeners = function (name) {
  if (!this.$events) {
    this.$events = {};
  }

  if (!this.$events[name]) {
    this.$events[name] = [];
  }

  if (!isArray(this.$events[name])) {
    this.$events[name] = [this.$events[name]];
  }

  return this.$events[name];
};

/**
 * Emits an event.
 *
 * @api public
 */

EventEmitter.prototype.emit = function (name) {
  if (!this.$events) {
    return false;
  }

  var handler = this.$events[name];

  if (!handler) {
    return false;
  }

  var args = [].slice.call(arguments, 1);

  if ('function' == typeof handler) {
    handler.apply(this, args);
  } else if (isArray(handler)) {
    var listeners = handler.slice();

    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
  } else {
    return false;
  }

  return true;
};
}); // module: browser/events.js

require.register("browser/fs.js", function(module, exports, require){

}); // module: browser/fs.js

require.register("browser/path.js", function(module, exports, require){

}); // module: browser/path.js

require.register("browser/progress.js", function(module, exports, require){

/**
 * Expose `Progress`.
 */

module.exports = Progress;

/**
 * Initialize a new `Progress` indicator.
 */

function Progress() {
  this.percent = 0;
  this.size(0);
  this.fontSize(11);
  this.font('helvetica, arial, sans-serif');
}

/**
 * Set progress size to `n`.
 *
 * @param {Number} n
 * @return {Progress} for chaining
 * @api public
 */

Progress.prototype.size = function(n){
  this._size = n;
  return this;
};

/**
 * Set text to `str`.
 *
 * @param {String} str
 * @return {Progress} for chaining
 * @api public
 */

Progress.prototype.text = function(str){
  this._text = str;
  return this;
};

/**
 * Set font size to `n`.
 *
 * @param {Number} n
 * @return {Progress} for chaining
 * @api public
 */

Progress.prototype.fontSize = function(n){
  this._fontSize = n;
  return this;
};

/**
 * Set font `family`.
 *
 * @param {String} family
 * @return {Progress} for chaining
 */

Progress.prototype.font = function(family){
  this._font = family;
  return this;
};

/**
 * Update percentage to `n`.
 *
 * @param {Number} n
 * @return {Progress} for chaining
 */

Progress.prototype.update = function(n){
  this.percent = n;
  return this;
};

/**
 * Draw on `ctx`.
 *
 * @param {CanvasRenderingContext2d} ctx
 * @return {Progress} for chaining
 */

Progress.prototype.draw = function(ctx){
  var percent = Math.min(this.percent, 100)
    , size = this._size
    , half = size / 2
    , x = half
    , y = half
    , rad = half - 1
    , fontSize = this._fontSize;

  ctx.font = fontSize + 'px ' + this._font;

  var angle = Math.PI * 2 * (percent / 100);
  ctx.clearRect(0, 0, size, size);

  // outer circle
  ctx.strokeStyle = '#9f9f9f';
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, angle, false);
  ctx.stroke();

  // inner circle
  ctx.strokeStyle = '#eee';
  ctx.beginPath();
  ctx.arc(x, y, rad - 1, 0, angle, true);
  ctx.stroke();

  // text
  var text = this._text || (percent | 0) + '%'
    , w = ctx.measureText(text).width;

  ctx.fillText(
      text
    , x - w / 2 + 1
    , y + fontSize / 2 - 1);

  return this;
};

}); // module: browser/progress.js

require.register("browser/tty.js", function(module, exports, require){

exports.isatty = function(){
  return true;
};

exports.getWindowSize = function(){
  return [window.innerHeight, window.innerWidth];
};
}); // module: browser/tty.js

require.register("context.js", function(module, exports, require){

/**
 * Expose `Context`.
 */

module.exports = Context;

/**
 * Initialize a new `Context`.
 *
 * @api private
 */

function Context(){}

/**
 * Set or get the context `Runnable` to `runnable`.
 *
 * @param {Runnable} runnable
 * @return {Context}
 * @api private
 */

Context.prototype.runnable = function(runnable){
  if (0 == arguments.length) return this._runnable;
  this.test = this._runnable = runnable;
  return this;
};

/**
 * Set test timeout `ms`.
 *
 * @param {Number} ms
 * @return {Context} self
 * @api private
 */

Context.prototype.timeout = function(ms){
  this.runnable().timeout(ms);
  return this;
};

/**
 * Set test slowness threshold `ms`.
 *
 * @param {Number} ms
 * @return {Context} self
 * @api private
 */

Context.prototype.slow = function(ms){
  this.runnable().slow(ms);
  return this;
};

/**
 * Inspect the context void of `._runnable`.
 *
 * @return {String}
 * @api private
 */

Context.prototype.inspect = function(){
  return JSON.stringify(this, function(key, val){
    if ('_runnable' == key) return;
    if ('test' == key) return;
    return val;
  }, 2);
};

}); // module: context.js

require.register("hook.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Runnable = require('./runnable');

/**
 * Expose `Hook`.
 */

module.exports = Hook;

/**
 * Initialize a new `Hook` with the given `title` and callback `fn`.
 *
 * @param {String} title
 * @param {Function} fn
 * @api private
 */

function Hook(title, fn) {
  Runnable.call(this, title, fn);
  this.type = 'hook';
}

/**
 * Inherit from `Runnable.prototype`.
 */

Hook.prototype = new Runnable;
Hook.prototype.constructor = Hook;


/**
 * Get or set the test `err`.
 *
 * @param {Error} err
 * @return {Error}
 * @api public
 */

Hook.prototype.error = function(err){
  if (0 == arguments.length) {
    var err = this._error;
    this._error = null;
    return err;
  }

  this._error = err;
};


}); // module: hook.js

require.register("interfaces/bdd.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Suite = require('../suite')
  , Test = require('../test');

/**
 * BDD-style interface:
 * 
 *      describe('Array', function(){
 *        describe('#indexOf()', function(){
 *          it('should return -1 when not present', function(){
 *
 *          });
 *
 *          it('should return the index when present', function(){
 *
 *          });
 *        });
 *      });
 * 
 */

module.exports = function(suite){
  var suites = [suite];

  suite.on('pre-require', function(context, file, mocha){

    /**
     * Execute before running tests.
     */

    context.before = function(fn){
      suites[0].beforeAll(fn);
    };

    /**
     * Execute after running tests.
     */

    context.after = function(fn){
      suites[0].afterAll(fn);
    };

    /**
     * Execute before each test case.
     */

    context.beforeEach = function(fn){
      suites[0].beforeEach(fn);
    };

    /**
     * Execute after each test case.
     */

    context.afterEach = function(fn){
      suites[0].afterEach(fn);
    };

    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */
  
    context.describe = context.context = function(title, fn){
      var suite = Suite.create(suites[0], title);
      suites.unshift(suite);
      fn();
      suites.shift();
      return suite;
    };

    /**
     * Pending describe.
     */

    context.xdescribe =
    context.xcontext =
    context.describe.skip = function(title, fn){
      var suite = Suite.create(suites[0], title);
      suite.pending = true;
      suites.unshift(suite);
      fn();
      suites.shift();
    };

    /**
     * Exclusive suite.
     */

    context.describe.only = function(title, fn){
      var suite = context.describe(title, fn);
      mocha.grep(suite.fullTitle());
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.it = context.specify = function(title, fn){
      var suite = suites[0];
      if (suite.pending) var fn = null;
      var test = new Test(title, fn);
      suite.addTest(test);
      return test;
    };

    /**
     * Exclusive test-case.
     */

    context.it.only = function(title, fn){
      var test = context.it(title, fn);
      mocha.grep(test.fullTitle());
    };

    /**
     * Pending test case.
     */

    context.xit =
    context.xspecify =
    context.it.skip = function(title){
      context.it(title);
    };
  });
};

}); // module: interfaces/bdd.js

require.register("interfaces/exports.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Suite = require('../suite')
  , Test = require('../test');

/**
 * TDD-style interface:
 * 
 *     exports.Array = {
 *       '#indexOf()': {
 *         'should return -1 when the value is not present': function(){
 *           
 *         },
 *
 *         'should return the correct index when the value is present': function(){
 *           
 *         }
 *       }
 *     };
 * 
 */

module.exports = function(suite){
  var suites = [suite];

  suite.on('require', visit);

  function visit(obj) {
    var suite;
    for (var key in obj) {
      if ('function' == typeof obj[key]) {
        var fn = obj[key];
        switch (key) {
          case 'before':
            suites[0].beforeAll(fn);
            break;
          case 'after':
            suites[0].afterAll(fn);
            break;
          case 'beforeEach':
            suites[0].beforeEach(fn);
            break;
          case 'afterEach':
            suites[0].afterEach(fn);
            break;
          default:
            suites[0].addTest(new Test(key, fn));
        }
      } else {
        var suite = Suite.create(suites[0], key);
        suites.unshift(suite);
        visit(obj[key]);
        suites.shift();
      }
    }
  }
};
}); // module: interfaces/exports.js

require.register("interfaces/index.js", function(module, exports, require){

exports.bdd = require('./bdd');
exports.tdd = require('./tdd');
exports.qunit = require('./qunit');
exports.exports = require('./exports');

}); // module: interfaces/index.js

require.register("interfaces/qunit.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Suite = require('../suite')
  , Test = require('../test');

/**
 * QUnit-style interface:
 * 
 *     suite('Array');
 *     
 *     test('#length', function(){
 *       var arr = [1,2,3];
 *       ok(arr.length == 3);
 *     });
 *     
 *     test('#indexOf()', function(){
 *       var arr = [1,2,3];
 *       ok(arr.indexOf(1) == 0);
 *       ok(arr.indexOf(2) == 1);
 *       ok(arr.indexOf(3) == 2);
 *     });
 *     
 *     suite('String');
 *     
 *     test('#length', function(){
 *       ok('foo'.length == 3);
 *     });
 * 
 */

module.exports = function(suite){
  var suites = [suite];

  suite.on('pre-require', function(context){

    /**
     * Execute before running tests.
     */

    context.before = function(fn){
      suites[0].beforeAll(fn);
    };

    /**
     * Execute after running tests.
     */

    context.after = function(fn){
      suites[0].afterAll(fn);
    };

    /**
     * Execute before each test case.
     */

    context.beforeEach = function(fn){
      suites[0].beforeEach(fn);
    };

    /**
     * Execute after each test case.
     */

    context.afterEach = function(fn){
      suites[0].afterEach(fn);
    };

    /**
     * Describe a "suite" with the given `title`.
     */
  
    context.suite = function(title){
      if (suites.length > 1) suites.shift();
      var suite = Suite.create(suites[0], title);
      suites.unshift(suite);
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.test = function(title, fn){
      suites[0].addTest(new Test(title, fn));
    };
  });
};

}); // module: interfaces/qunit.js

require.register("interfaces/tdd.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Suite = require('../suite')
  , Test = require('../test');

/**
 * TDD-style interface:
 *
 *      suite('Array', function(){
 *        suite('#indexOf()', function(){
 *          suiteSetup(function(){
 *
 *          });
 *          
 *          test('should return -1 when not present', function(){
 *
 *          });
 *
 *          test('should return the index when present', function(){
 *
 *          });
 *
 *          suiteTeardown(function(){
 *
 *          });
 *        });
 *      });
 *
 */

module.exports = function(suite){
  var suites = [suite];

  suite.on('pre-require', function(context, file, mocha){

    /**
     * Execute before each test case.
     */

    context.setup = function(fn){
      suites[0].beforeEach(fn);
    };

    /**
     * Execute after each test case.
     */

    context.teardown = function(fn){
      suites[0].afterEach(fn);
    };

    /**
     * Execute before the suite.
     */

    context.suiteSetup = function(fn){
      suites[0].beforeAll(fn);
    };

    /**
     * Execute after the suite.
     */

    context.suiteTeardown = function(fn){
      suites[0].afterAll(fn);
    };

    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.suite = function(title, fn){
      var suite = Suite.create(suites[0], title);
      suites.unshift(suite);
      fn();
      suites.shift();
      return suite;
    };

    /**
     * Exclusive test-case.
     */

    context.suite.only = function(title, fn){
      var suite = context.suite(title, fn);
      mocha.grep(suite.fullTitle());
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.test = function(title, fn){
      var test = new Test(title, fn);
      suites[0].addTest(test);
      return test;
    };

    /**
     * Exclusive test-case.
     */

    context.test.only = function(title, fn){
      var test = context.test(title, fn);
      mocha.grep(test.fullTitle());
    };
  });
};

}); // module: interfaces/tdd.js

require.register("mocha.js", function(module, exports, require){
/*!
 * mocha
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var path = require('browser/path')
  , utils = require('./utils');

/**
 * Expose `Mocha`.
 */

exports = module.exports = Mocha;

/**
 * Expose internals.
 */

exports.utils = utils;
exports.interfaces = require('./interfaces');
exports.reporters = require('./reporters');
exports.Runnable = require('./runnable');
exports.Context = require('./context');
exports.Runner = require('./runner');
exports.Suite = require('./suite');
exports.Hook = require('./hook');
exports.Test = require('./test');

/**
 * Return image `name` path.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function image(name) {
  return __dirname + '/../images/' + name + '.png';
}

/**
 * Setup mocha with `options`.
 *
 * Options:
 *
 *   - `ui` name "bdd", "tdd", "exports" etc
 *   - `reporter` reporter instance, defaults to `mocha.reporters.Dot`
 *   - `globals` array of accepted globals
 *   - `timeout` timeout in milliseconds
 *   - `slow` milliseconds to wait before considering a test slow
 *   - `ignoreLeaks` ignore global leaks
 *   - `grep` string or regexp to filter tests with
 *
 * @param {Object} options
 * @api public
 */

function Mocha(options) {
  options = options || {};
  this.files = [];
  this.options = options;
  this.grep(options.grep);
  this.suite = new exports.Suite('', new exports.Context);
  this.ui(options.ui);
  this.reporter(options.reporter);
  if (options.timeout) this.timeout(options.timeout);
  if (options.slow) this.slow(options.slow);
}

/**
 * Add test `file`.
 *
 * @param {String} file
 * @api public
 */

Mocha.prototype.addFile = function(file){
  this.files.push(file);
  return this;
};

/**
 * Set reporter to `reporter`, defaults to "dot".
 *
 * @param {String|Function} reporter name of a reporter or a reporter constructor
 * @api public
 */

Mocha.prototype.reporter = function(reporter){
  if ('function' == typeof reporter) {
    this._reporter = reporter;
  } else {
    reporter = reporter || 'dot';
    try {
      this._reporter = require('./reporters/' + reporter);
    } catch (err) {
      this._reporter = require(reporter);
    }
    if (!this._reporter) throw new Error('invalid reporter "' + reporter + '"');
  }
  return this;
};

/**
 * Set test UI `name`, defaults to "bdd".
 *
 * @param {String} bdd
 * @api public
 */

Mocha.prototype.ui = function(name){
  name = name || 'bdd';
  this._ui = exports.interfaces[name];
  if (!this._ui) throw new Error('invalid interface "' + name + '"');
  this._ui = this._ui(this.suite);
  return this;
};

/**
 * Load registered files.
 *
 * @api private
 */

Mocha.prototype.loadFiles = function(fn){
  var self = this;
  var suite = this.suite;
  var pending = this.files.length;
  this.files.forEach(function(file){
    file = path.resolve(file);
    suite.emit('pre-require', global, file, self);
    suite.emit('require', require(file), file, self);
    suite.emit('post-require', global, file, self);
    --pending || (fn && fn());
  });
};

/**
 * Enable growl support.
 *
 * @api private
 */

Mocha.prototype._growl = function(runner, reporter) {
  var notify = require('growl');

  runner.on('end', function(){
    var stats = reporter.stats;
    if (stats.failures) {
      var msg = stats.failures + ' of ' + runner.total + ' tests failed';
      notify(msg, { name: 'mocha', title: 'Failed', image: image('error') });
    } else {
      notify(stats.passes + ' tests passed in ' + stats.duration + 'ms', {
          name: 'mocha'
        , title: 'Passed'
        , image: image('ok')
      });
    }
  });
};

/**
 * Add regexp to grep, if `re` is a string it is escaped.
 *
 * @param {RegExp|String} re
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.grep = function(re){
  this.options.grep = 'string' == typeof re
    ? new RegExp(utils.escapeRegexp(re))
    : re;
  return this;
};

/**
 * Invert `.grep()` matches.
 *
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.invert = function(){
  this.options.invert = true;
  return this;
};

/**
 * Ignore global leaks.
 *
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.ignoreLeaks = function(){
  this.options.ignoreLeaks = true;
  return this;
};

/**
 * Enable global leak checking.
 *
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.checkLeaks = function(){
  this.options.ignoreLeaks = false;
  return this;
};

/**
 * Enable growl support.
 *
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.growl = function(){
  this.options.growl = true;
  return this;
};

/**
 * Ignore `globals` array or string.
 *
 * @param {Array|String} globals
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.globals = function(globals){
  this.options.globals = (this.options.globals || []).concat(globals);
  return this;
};

/**
 * Set the timeout in milliseconds.
 *
 * @param {Number} timeout
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.timeout = function(timeout){
  this.suite.timeout(timeout);
  return this;
};

/**
 * Set slowness threshold in milliseconds.
 *
 * @param {Number} slow
 * @return {Mocha}
 * @api public
 */

Mocha.prototype.slow = function(slow){
  this.suite.slow(slow);
  return this;
};

/**
 * Run tests and invoke `fn()` when complete.
 *
 * @param {Function} fn
 * @return {Runner}
 * @api public
 */

Mocha.prototype.run = function(fn){
  if (this.files.length) this.loadFiles();
  var suite = this.suite;
  var options = this.options;
  var runner = new exports.Runner(suite);
  var reporter = new this._reporter(runner);
  runner.ignoreLeaks = options.ignoreLeaks;
  if (options.grep) runner.grep(options.grep, options.invert);
  if (options.globals) runner.globals(options.globals);
  if (options.growl) this._growl(runner, reporter);
  return runner.run(fn);
};

}); // module: mocha.js

require.register("ms.js", function(module, exports, require){

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;

/**
 * Parse or format the given `val`.
 *
 * @param {String|Number} val
 * @return {String|Number}
 * @api public
 */

module.exports = function(val){
  if ('string' == typeof val) return parse(val);
  return format(val);
}

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var m = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!m) return;
  var n = parseFloat(m[1]);
  var type = (m[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * 31557600000;
    case 'days':
    case 'day':
    case 'd':
      return n * 86400000;
    case 'hours':
    case 'hour':
    case 'h':
      return n * 3600000;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * 60000;
    case 'seconds':
    case 'second':
    case 's':
      return n * 1000;
    case 'ms':
      return n;
  }
}

/**
 * Format the given `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api public
 */

function format(ms) {
  if (ms == d) return (ms / d) + ' day';
  if (ms > d) return (ms / d) + ' days';
  if (ms == h) return (ms / h) + ' hour';
  if (ms > h) return (ms / h) + ' hours';
  if (ms == m) return (ms / m) + ' minute';
  if (ms > m) return (ms / m) + ' minutes';
  if (ms == s) return (ms / s) + ' second';
  if (ms > s) return (ms / s) + ' seconds';
  return ms + ' ms';
}
}); // module: ms.js

require.register("reporters/base.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var tty = require('browser/tty')
  , diff = require('browser/diff')
  , ms = require('../ms');

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var Date = global.Date
  , setTimeout = global.setTimeout
  , setInterval = global.setInterval
  , clearTimeout = global.clearTimeout
  , clearInterval = global.clearInterval;

/**
 * Check if both stdio streams are associated with a tty.
 */

var isatty = tty.isatty(1) && tty.isatty(2);

/**
 * Expose `Base`.
 */

exports = module.exports = Base;

/**
 * Enable coloring by default.
 */

exports.useColors = isatty;

/**
 * Default color map.
 */

exports.colors = {
    'pass': 90
  , 'fail': 31
  , 'bright pass': 92
  , 'bright fail': 91
  , 'bright yellow': 93
  , 'pending': 36
  , 'suite': 0
  , 'error title': 0
  , 'error message': 31
  , 'error stack': 90
  , 'checkmark': 32
  , 'fast': 90
  , 'medium': 33
  , 'slow': 31
  , 'green': 32
  , 'light': 90
  , 'diff gutter': 90
  , 'diff added': 42
  , 'diff removed': 41
};

/**
 * Color `str` with the given `type`,
 * allowing colors to be disabled,
 * as well as user-defined color
 * schemes.
 *
 * @param {String} type
 * @param {String} str
 * @return {String}
 * @api private
 */

var color = exports.color = function(type, str) {
  if (!exports.useColors) return str;
  return '\u001b[' + exports.colors[type] + 'm' + str + '\u001b[0m';
};

/**
 * Expose term window size, with some
 * defaults for when stderr is not a tty.
 */

exports.window = {
  width: isatty
    ? process.stdout.getWindowSize
      ? process.stdout.getWindowSize(1)[0]
      : tty.getWindowSize()[1]
    : 75
};

/**
 * Expose some basic cursor interactions
 * that are common among reporters.
 */

exports.cursor = {
  hide: function(){
    process.stdout.write('\u001b[?25l');
  },

  show: function(){
    process.stdout.write('\u001b[?25h');
  },

  deleteLine: function(){
    process.stdout.write('\u001b[2K');
  },

  beginningOfLine: function(){
    process.stdout.write('\u001b[0G');
  },

  CR: function(){
    exports.cursor.deleteLine();
    exports.cursor.beginningOfLine();
  }
};

/**
 * Outut the given `failures` as a list.
 *
 * @param {Array} failures
 * @api public
 */

exports.list = function(failures){
  console.error();
  failures.forEach(function(test, i){
    // format
    var fmt = color('error title', '  %s) %s:\n')
      + color('error message', '     %s')
      + color('error stack', '\n%s\n');

    // msg
    var err = test.err
      , message = err.message || ''
      , stack = err.stack || message
      , index = stack.indexOf(message) + message.length
      , msg = stack.slice(0, index)
      , actual = err.actual
      , expected = err.expected;

    // actual / expected diff
    if ('string' == typeof actual && 'string' == typeof expected) {
      var len = Math.max(actual.length, expected.length);

      if (len < 20) msg = errorDiff(err, 'Chars');
      else msg = errorDiff(err, 'Words');

      // linenos
      var lines = msg.split('\n');
      if (lines.length > 4) {
        var width = String(lines.length).length;
        msg = lines.map(function(str, i){
          return pad(++i, width) + ' |' + ' ' + str;
        }).join('\n');
      }

      // legend
      msg = '\n'
        + color('diff removed', 'actual')
        + ' '
        + color('diff added', 'expected')
        + '\n\n'
        + msg
        + '\n';

      // indent
      msg = msg.replace(/^/gm, '      ');

      fmt = color('error title', '  %s) %s:\n%s')
        + color('error stack', '\n%s\n');
    }

    // indent stack trace without msg
    stack = stack.slice(index ? index + 1 : index)
      .replace(/^/gm, '  ');

    console.error(fmt, (i + 1), test.fullTitle(), msg, stack);
  });
};

/**
 * Initialize a new `Base` reporter.
 *
 * All other reporters generally
 * inherit from this reporter, providing
 * stats such as test duration, number
 * of tests passed / failed etc.
 *
 * @param {Runner} runner
 * @api public
 */

function Base(runner) {
  var self = this
    , stats = this.stats = { suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 }
    , failures = this.failures = [];

  if (!runner) return;
  this.runner = runner;

  runner.on('start', function(){
    stats.start = new Date;
  });

  runner.on('suite', function(suite){
    stats.suites = stats.suites || 0;
    suite.root || stats.suites++;
  });

  runner.on('test end', function(test){
    stats.tests = stats.tests || 0;
    stats.tests++;
  });

  runner.on('pass', function(test){
    stats.passes = stats.passes || 0;

    var medium = test.slow() / 2;
    test.speed = test.duration > test.slow()
      ? 'slow'
      : test.duration > medium
        ? 'medium'
        : 'fast';

    stats.passes++;
  });

  runner.on('fail', function(test, err){
    stats.failures = stats.failures || 0;
    stats.failures++;
    test.err = err;
    failures.push(test);
  });

  runner.on('end', function(){
    stats.end = new Date;
    stats.duration = new Date - stats.start;
  });

  runner.on('pending', function(){
    stats.pending++;
  });
}

/**
 * Output common epilogue used by many of
 * the bundled reporters.
 *
 * @api public
 */

Base.prototype.epilogue = function(){
  var stats = this.stats
    , fmt
    , tests;

  console.log();

  function pluralize(n) {
    return 1 == n ? 'test' : 'tests';
  }

  // failure
  if (stats.failures) {
    fmt = color('bright fail', '  ✖')
      + color('fail', ' %d of %d %s failed')
      + color('light', ':')

    console.error(fmt,
      stats.failures,
      this.runner.total,
      pluralize(this.runner.total));

    Base.list(this.failures);
    console.error();
    return;
  }

  // pass
  fmt = color('bright pass', '  ✔')
    + color('green', ' %d %s complete')
    + color('light', ' (%s)');

  console.log(fmt,
    stats.tests || 0,
    pluralize(stats.tests),
    ms(stats.duration));

  // pending
  if (stats.pending) {
    fmt = color('pending', '  •')
      + color('pending', ' %d %s pending');

    console.log(fmt, stats.pending, pluralize(stats.pending));
  }

  console.log();
};

/**
 * Pad the given `str` to `len`.
 *
 * @param {String} str
 * @param {String} len
 * @return {String}
 * @api private
 */

function pad(str, len) {
  str = String(str);
  return Array(len - str.length + 1).join(' ') + str;
}

/**
 * Return a character diff for `err`.
 *
 * @param {Error} err
 * @return {String}
 * @api private
 */

function errorDiff(err, type) {
  return diff['diff' + type](err.actual, err.expected).map(function(str){
    str.value = str.value
      .replace(/\t/g, '<tab>')
      .replace(/\r/g, '<CR>')
      .replace(/\n/g, '<LF>\n');
    if (str.added) return colorLines('diff added', str.value);
    if (str.removed) return colorLines('diff removed', str.value);
    return str.value;
  }).join('');
}

/**
 * Color lines for `str`, using the color `name`.
 *
 * @param {String} name
 * @param {String} str
 * @return {String}
 * @api private
 */

function colorLines(name, str) {
  return str.split('\n').map(function(str){
    return color(name, str);
  }).join('\n');
}

}); // module: reporters/base.js

require.register("reporters/doc.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base')
  , utils = require('../utils');

/**
 * Expose `Doc`.
 */

exports = module.exports = Doc;

/**
 * Initialize a new `Doc` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Doc(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , total = runner.total
    , indents = 2;

  function indent() {
    return Array(indents).join('  ');
  }

  runner.on('suite', function(suite){
    if (suite.root) return;
    ++indents;
    console.log('%s<section class="suite">', indent());
    ++indents;
    console.log('%s<h1>%s</h1>', indent(), suite.title);
    console.log('%s<dl>', indent());
  });

  runner.on('suite end', function(suite){
    if (suite.root) return;
    console.log('%s</dl>', indent());
    --indents;
    console.log('%s</section>', indent());
    --indents;
  });

  runner.on('pass', function(test){
    console.log('%s  <dt>%s</dt>', indent(), test.title);
    var code = utils.escape(utils.clean(test.fn.toString()));
    console.log('%s  <dd><pre><code>%s</code></pre></dd>', indent(), code);
  });
}

}); // module: reporters/doc.js

require.register("reporters/dot.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base')
  , color = Base.color;

/**
 * Expose `Dot`.
 */

exports = module.exports = Dot;

/**
 * Initialize a new `Dot` matrix test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Dot(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , width = Base.window.width * .75 | 0
    , c = '․'
    , n = 0;

  runner.on('start', function(){
    process.stdout.write('\n  ');
  });

  runner.on('pending', function(test){
    process.stdout.write(color('pending', c));
  });

  runner.on('pass', function(test){
    if (++n % width == 0) process.stdout.write('\n  ');
    if ('slow' == test.speed) {
      process.stdout.write(color('bright yellow', c));
    } else {
      process.stdout.write(color(test.speed, c));
    }
  });

  runner.on('fail', function(test, err){
    if (++n % width == 0) process.stdout.write('\n  ');
    process.stdout.write(color('fail', c));
  });

  runner.on('end', function(){
    console.log();
    self.epilogue();
  });
}

/**
 * Inherit from `Base.prototype`.
 */

Dot.prototype = new Base;
Dot.prototype.constructor = Dot;

}); // module: reporters/dot.js

require.register("reporters/html-cov.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var JSONCov = require('./json-cov')
  , fs = require('browser/fs');

/**
 * Expose `HTMLCov`.
 */

exports = module.exports = HTMLCov;

/**
 * Initialize a new `JsCoverage` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function HTMLCov(runner) {
  var jade = require('jade')
    , file = __dirname + '/templates/coverage.jade'
    , str = fs.readFileSync(file, 'utf8')
    , fn = jade.compile(str, { filename: file })
    , self = this;

  JSONCov.call(this, runner, false);

  runner.on('end', function(){
    process.stdout.write(fn({
        cov: self.cov
      , coverageClass: coverageClass
    }));
  });
}

/**
 * Return coverage class for `n`.
 *
 * @return {String}
 * @api private
 */

function coverageClass(n) {
  if (n >= 75) return 'high';
  if (n >= 50) return 'medium';
  if (n >= 25) return 'low';
  return 'terrible';
}
}); // module: reporters/html-cov.js

require.register("reporters/html.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base')
  , utils = require('../utils')
  , Progress = require('../browser/progress')
  , escape = utils.escape;

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var Date = global.Date
  , setTimeout = global.setTimeout
  , setInterval = global.setInterval
  , clearTimeout = global.clearTimeout
  , clearInterval = global.clearInterval;

/**
 * Expose `Doc`.
 */

exports = module.exports = HTML;

/**
 * Stats template.
 */

var statsTemplate = '<ul id="stats">'
  + '<li class="progress"><canvas width="40" height="40"></canvas></li>'
  + '<li class="passes"><a href="#">passes:</a> <em>0</em></li>'
  + '<li class="failures"><a href="#">failures:</a> <em>0</em></li>'
  + '<li class="duration">duration: <em>0</em>s</li>'
  + '</ul>';

/**
 * Initialize a new `Doc` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function HTML(runner, root) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , total = runner.total
    , stat = fragment(statsTemplate)
    , items = stat.getElementsByTagName('li')
    , passes = items[1].getElementsByTagName('em')[0]
    , passesLink = items[1].getElementsByTagName('a')[0]
    , failures = items[2].getElementsByTagName('em')[0]
    , failuresLink = items[2].getElementsByTagName('a')[0]
    , duration = items[3].getElementsByTagName('em')[0]
    , canvas = stat.getElementsByTagName('canvas')[0]
    , report = fragment('<ul id="report"></ul>')
    , stack = [report]
    , progress
    , ctx

  root = root || document.getElementById('mocha');

  if (canvas.getContext) {
    var ratio = window.devicePixelRatio || 1;
    canvas.style.width = canvas.width;
    canvas.style.height = canvas.height;
    canvas.width *= ratio;
    canvas.height *= ratio;
    ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    progress = new Progress;
  }

  if (!root) return error('#mocha div missing, add it to your document');

  // pass toggle
  on(passesLink, 'click', function () {
    var className = /pass/.test(report.className) ? '' : ' pass';
    report.className = report.className.replace(/fail|pass/g, '') + className;
  });

  // failure toggle
  on(failuresLink, 'click', function () {
    var className = /fail/.test(report.className) ? '' : ' fail';
    report.className = report.className.replace(/fail|pass/g, '') + className;
  });

  root.appendChild(stat);
  root.appendChild(report);

  if (progress) progress.size(40);

  runner.on('suite', function(suite){
    if (suite.root) return;

    // suite
    var url = '?grep=' + encodeURIComponent(suite.fullTitle());
    var el = fragment('<li class="suite"><h1><a href="%s">%s</a></h1></li>', url, escape(suite.title));

    // container
    stack[0].appendChild(el);
    stack.unshift(document.createElement('ul'));
    el.appendChild(stack[0]);
  });

  runner.on('suite end', function(suite){
    if (suite.root) return;
    stack.shift();
  });

  runner.on('fail', function(test, err){
    if ('hook' == test.type || err.uncaught) runner.emit('test end', test);
  });

  runner.on('test end', function(test){
    window.scrollTo(0, document.body.scrollHeight);

    // TODO: add to stats
    var percent = stats.tests / total * 100 | 0;
    if (progress) progress.update(percent).draw(ctx);

    // update stats
    var ms = new Date - stats.start;
    text(passes, stats.passes);
    text(failures, stats.failures);
    text(duration, (ms / 1000).toFixed(2));

    // test
    if ('passed' == test.state) {
      var el = fragment('<li class="test pass %e"><h2>%e<span class="duration">%ems</span></h2></li>', test.speed, test.title, test.duration);
    } else if (test.pending) {
      var el = fragment('<li class="test pass pending"><h2>%e</h2></li>', test.title);
    } else {
      var el = fragment('<li class="test fail"><h2>%e</h2></li>', test.title);
      var str = test.err.stack || test.err.toString();

      // FF / Opera do not add the message
      if (!~str.indexOf(test.err.message)) {
        str = test.err.message + '\n' + str;
      }

      // <=IE7 stringifies to [Object Error]. Since it can be overloaded, we
      // check for the result of the stringifying.
      if ('[object Error]' == str) str = test.err.message;

      // Safari doesn't give you a stack. Let's at least provide a source line.
      if (!test.err.stack && test.err.sourceURL && test.err.line !== undefined) {
        str += "\n(" + test.err.sourceURL + ":" + test.err.line + ")";
      }

      el.appendChild(fragment('<pre class="error">%e</pre>', str));
    }

    // toggle code
    // TODO: defer
    if (!test.pending) {
      var h2 = el.getElementsByTagName('h2')[0];

      on(h2, 'click', function(){
        pre.style.display = 'none' == pre.style.display
          ? 'inline-block'
          : 'none';
      });

      var pre = fragment('<pre><code>%e</code></pre>', utils.clean(test.fn.toString()));
      el.appendChild(pre);
      pre.style.display = 'none';
    }

    stack[0].appendChild(el);
  });
}

/**
 * Display error `msg`.
 */

function error(msg) {
  document.body.appendChild(fragment('<div id="error">%s</div>', msg));
}

/**
 * Return a DOM fragment from `html`.
 */

function fragment(html) {
  var args = arguments
    , div = document.createElement('div')
    , i = 1;

  div.innerHTML = html.replace(/%([se])/g, function(_, type){
    switch (type) {
      case 's': return String(args[i++]);
      case 'e': return escape(args[i++]);
    }
  });

  return div.firstChild;
}

/**
 * Set `el` text to `str`.
 */

function text(el, str) {
  if (el.textContent) {
    el.textContent = str;
  } else {
    el.innerText = str;
  }
}

/**
 * Listen on `event` with callback `fn`.
 */

function on(el, event, fn) {
  if (el.addEventListener) {
    el.addEventListener(event, fn, false);
  } else {
    el.attachEvent('on' + event, fn);
  }
}

}); // module: reporters/html.js

require.register("reporters/index.js", function(module, exports, require){

exports.Base = require('./base');
exports.Dot = require('./dot');
exports.Doc = require('./doc');
exports.TAP = require('./tap');
exports.JSON = require('./json');
exports.HTML = require('./html');
exports.List = require('./list');
exports.Min = require('./min');
exports.Spec = require('./spec');
exports.Nyan = require('./nyan');
exports.XUnit = require('./xunit');
exports.Markdown = require('./markdown');
exports.Progress = require('./progress');
exports.Landing = require('./landing');
exports.JSONCov = require('./json-cov');
exports.HTMLCov = require('./html-cov');
exports.JSONStream = require('./json-stream');
exports.Teamcity = require('./teamcity');

}); // module: reporters/index.js

require.register("reporters/json-cov.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base');

/**
 * Expose `JSONCov`.
 */

exports = module.exports = JSONCov;

/**
 * Initialize a new `JsCoverage` reporter.
 *
 * @param {Runner} runner
 * @param {Boolean} output
 * @api public
 */

function JSONCov(runner, output) {
  var self = this
    , output = 1 == arguments.length ? true : output;

  Base.call(this, runner);

  var tests = []
    , failures = []
    , passes = [];

  runner.on('test end', function(test){
    tests.push(test);
  });

  runner.on('pass', function(test){
    passes.push(test);
  });

  runner.on('fail', function(test){
    failures.push(test);
  });

  runner.on('end', function(){
    var cov = global._$jscoverage || {};
    var result = self.cov = map(cov);
    result.stats = self.stats;
    result.tests = tests.map(clean);
    result.failures = failures.map(clean);
    result.passes = passes.map(clean);
    if (!output) return;
    process.stdout.write(JSON.stringify(result, null, 2 ));
  });
}

/**
 * Map jscoverage data to a JSON structure
 * suitable for reporting.
 *
 * @param {Object} cov
 * @return {Object}
 * @api private
 */

function map(cov) {
  var ret = {
      instrumentation: 'node-jscoverage'
    , sloc: 0
    , hits: 0
    , misses: 0
    , coverage: 0
    , files: []
  };

  for (var filename in cov) {
    var data = coverage(filename, cov[filename]);
    ret.files.push(data);
    ret.hits += data.hits;
    ret.misses += data.misses;
    ret.sloc += data.sloc;
  }

  if (ret.sloc > 0) {
    ret.coverage = (ret.hits / ret.sloc) * 100;
  }

  return ret;
};

/**
 * Map jscoverage data for a single source file
 * to a JSON structure suitable for reporting.
 *
 * @param {String} filename name of the source file
 * @param {Object} data jscoverage coverage data
 * @return {Object}
 * @api private
 */

function coverage(filename, data) {
  var ret = {
    filename: filename,
    coverage: 0,
    hits: 0,
    misses: 0,
    sloc: 0,
    source: {}
  };

  data.source.forEach(function(line, num){
    num++;

    if (data[num] === 0) {
      ret.misses++;
      ret.sloc++;
    } else if (data[num] !== undefined) {
      ret.hits++;
      ret.sloc++;
    }

    ret.source[num] = {
        source: line
      , coverage: data[num] === undefined
        ? ''
        : data[num]
    };
  });

  ret.coverage = ret.hits / ret.sloc * 100;

  return ret;
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
  return {
      title: test.title
    , fullTitle: test.fullTitle()
    , duration: test.duration
  }
}

}); // module: reporters/json-cov.js

require.register("reporters/json-stream.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base')
  , color = Base.color;

/**
 * Expose `List`.
 */

exports = module.exports = List;

/**
 * Initialize a new `List` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function List(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , total = runner.total;

  runner.on('start', function(){
    console.log(JSON.stringify(['start', { total: total }]));
  });

  runner.on('pass', function(test){
    console.log(JSON.stringify(['pass', clean(test)]));
  });

  runner.on('fail', function(test, err){
    console.log(JSON.stringify(['fail', clean(test)]));
  });

  runner.on('end', function(){
    process.stdout.write(JSON.stringify(['end', self.stats]));
  });
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
  return {
      title: test.title
    , fullTitle: test.fullTitle()
    , duration: test.duration
  }
}
}); // module: reporters/json-stream.js

require.register("reporters/json.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `JSON`.
 */

exports = module.exports = JSONReporter;

/**
 * Initialize a new `JSON` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function JSONReporter(runner) {
  var self = this;
  Base.call(this, runner);

  var tests = []
    , failures = []
    , passes = [];

  runner.on('test end', function(test){
    tests.push(test);
  });

  runner.on('pass', function(test){
    passes.push(test);
  });

  runner.on('fail', function(test){
    failures.push(test);
  });

  runner.on('end', function(){
    var obj = {
        stats: self.stats
      , tests: tests.map(clean)
      , failures: failures.map(clean)
      , passes: passes.map(clean)
    };

    process.stdout.write(JSON.stringify(obj, null, 2));
  });
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
  return {
      title: test.title
    , fullTitle: test.fullTitle()
    , duration: test.duration
  }
}
}); // module: reporters/json.js

require.register("reporters/landing.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `Landing`.
 */

exports = module.exports = Landing;

/**
 * Airplane color.
 */

Base.colors.plane = 0;

/**
 * Airplane crash color.
 */

Base.colors['plane crash'] = 31;

/**
 * Runway color.
 */

Base.colors.runway = 90;

/**
 * Initialize a new `Landing` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Landing(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , width = Base.window.width * .75 | 0
    , total = runner.total
    , stream = process.stdout
    , plane = color('plane', '✈')
    , crashed = -1
    , n = 0;

  function runway() {
    var buf = Array(width).join('-');
    return '  ' + color('runway', buf);
  }

  runner.on('start', function(){
    stream.write('\n  ');
    cursor.hide();
  });

  runner.on('test end', function(test){
    // check if the plane crashed
    var col = -1 == crashed
      ? width * ++n / total | 0
      : crashed;

    // show the crash
    if ('failed' == test.state) {
      plane = color('plane crash', '✈');
      crashed = col;
    }

    // render landing strip
    stream.write('\u001b[4F\n\n');
    stream.write(runway());
    stream.write('\n  ');
    stream.write(color('runway', Array(col).join('⋅')));
    stream.write(plane)
    stream.write(color('runway', Array(width - col).join('⋅') + '\n'));
    stream.write(runway());
    stream.write('\u001b[0m');
  });

  runner.on('end', function(){
    cursor.show();
    console.log();
    self.epilogue();
  });
}

/**
 * Inherit from `Base.prototype`.
 */

Landing.prototype = new Base;
Landing.prototype.constructor = Landing;

}); // module: reporters/landing.js

require.register("reporters/list.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `List`.
 */

exports = module.exports = List;

/**
 * Initialize a new `List` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function List(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , n = 0;

  runner.on('start', function(){
    console.log();
  });

  runner.on('test', function(test){
    process.stdout.write(color('pass', '    ' + test.fullTitle() + ': '));
  });

  runner.on('pending', function(test){
    var fmt = color('checkmark', '  -')
      + color('pending', ' %s');
    console.log(fmt, test.fullTitle());
  });

  runner.on('pass', function(test){
    var fmt = color('checkmark', '  ✓')
      + color('pass', ' %s: ')
      + color(test.speed, '%dms');
    cursor.CR();
    console.log(fmt, test.fullTitle(), test.duration);
  });

  runner.on('fail', function(test, err){
    cursor.CR();
    console.log(color('fail', '  %d) %s'), ++n, test.fullTitle());
  });

  runner.on('end', self.epilogue.bind(self));
}

/**
 * Inherit from `Base.prototype`.
 */

List.prototype = new Base;
List.prototype.constructor = List;


}); // module: reporters/list.js

require.register("reporters/markdown.js", function(module, exports, require){
/**
 * Module dependencies.
 */

var Base = require('./base')
  , utils = require('../utils');

/**
 * Expose `Markdown`.
 */

exports = module.exports = Markdown;

/**
 * Initialize a new `Markdown` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Markdown(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , total = runner.total
    , level = 0
    , buf = '';

  function title(str) {
    return Array(level).join('#') + ' ' + str;
  }

  function indent() {
    return Array(level).join('  ');
  }

  function mapTOC(suite, obj) {
    var ret = obj;
    obj = obj[suite.title] = obj[suite.title] || { suite: suite };
    suite.suites.forEach(function(suite){
      mapTOC(suite, obj);
    });
    return ret;
  }

  function stringifyTOC(obj, level) {
    ++level;
    var buf = '';
    var link;
    for (var key in obj) {
      if ('suite' == key) continue;
      if (key) link = ' - [' + key + '](#' + utils.slug(obj[key].suite.fullTitle()) + ')\n';
      if (key) buf += Array(level).join('  ') + link;
      buf += stringifyTOC(obj[key], level);
    }
    --level;
    return buf;
  }

  function generateTOC(suite) {
    var obj = mapTOC(suite, {});
    return stringifyTOC(obj, 0);
  }

  generateTOC(runner.suite);

  runner.on('suite', function(suite){
    ++level;
    var slug = utils.slug(suite.fullTitle());
    buf += '<a name="' + slug + '" />' + '\n';
    buf += title(suite.title) + '\n';
  });

  runner.on('suite end', function(suite){
    --level;
  });

  runner.on('pass', function(test){
    var code = utils.clean(test.fn.toString());
    buf += test.title + '.\n';
    buf += '\n```js\n';
    buf += code + '\n';
    buf += '```\n\n';
  });

  runner.on('end', function(){
    process.stdout.write('# TOC\n');
    process.stdout.write(generateTOC(runner.suite));
    process.stdout.write(buf);
  });
}
}); // module: reporters/markdown.js

require.register("reporters/min.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base');

/**
 * Expose `Min`.
 */

exports = module.exports = Min;

/**
 * Initialize a new `Min` minimal test reporter (best used with --watch).
 *
 * @param {Runner} runner
 * @api public
 */

function Min(runner) {
  Base.call(this, runner);
  
  runner.on('start', function(){
    // clear screen
    process.stdout.write('\u001b[2J');
    // set cursor position
    process.stdout.write('\u001b[1;3H');
  });

  runner.on('end', this.epilogue.bind(this));
}

/**
 * Inherit from `Base.prototype`.
 */

Min.prototype = new Base;
Min.prototype.constructor = Min;

}); // module: reporters/min.js

require.register("reporters/nyan.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base')
  , color = Base.color;

/**
 * Expose `Dot`.
 */

exports = module.exports = NyanCat;

/**
 * Initialize a new `Dot` matrix test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function NyanCat(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , width = Base.window.width * .75 | 0
    , rainbowColors = this.rainbowColors = self.generateColors()
    , colorIndex = this.colorIndex = 0
    , numerOfLines = this.numberOfLines = 4
    , trajectories = this.trajectories = [[], [], [], []]
    , nyanCatWidth = this.nyanCatWidth = 11
    , trajectoryWidthMax = this.trajectoryWidthMax = (width - nyanCatWidth)
    , scoreboardWidth = this.scoreboardWidth = 5
    , tick = this.tick = 0
    , n = 0;

  runner.on('start', function(){
    Base.cursor.hide();
    self.draw('start');
  });

  runner.on('pending', function(test){
    self.draw('pending');
  });

  runner.on('pass', function(test){
    self.draw('pass');
  });

  runner.on('fail', function(test, err){
    self.draw('fail');
  });

  runner.on('end', function(){
    Base.cursor.show();
    for (var i = 0; i < self.numberOfLines; i++) write('\n');
    self.epilogue();
  });
}

/**
 * Draw the nyan cat with runner `status`.
 *
 * @param {String} status
 * @api private
 */

NyanCat.prototype.draw = function(status){
  this.appendRainbow();
  this.drawScoreboard();
  this.drawRainbow();
  this.drawNyanCat(status);
  this.tick = !this.tick;
};

/**
 * Draw the "scoreboard" showing the number
 * of passes, failures and pending tests.
 *
 * @api private
 */

NyanCat.prototype.drawScoreboard = function(){
  var stats = this.stats;
  var colors = Base.colors;

  function draw(color, n) {
    write(' ');
    write('\u001b[' + color + 'm' + n + '\u001b[0m');
    write('\n');
  }

  draw(colors.green, stats.passes);
  draw(colors.fail, stats.failures);
  draw(colors.pending, stats.pending);
  write('\n');

  this.cursorUp(this.numberOfLines);
};

/**
 * Append the rainbow.
 *
 * @api private
 */

NyanCat.prototype.appendRainbow = function(){
  var segment = this.tick ? '_' : '-';
  var rainbowified = this.rainbowify(segment);

  for (var index = 0; index < this.numberOfLines; index++) {
    var trajectory = this.trajectories[index];
    if (trajectory.length >= this.trajectoryWidthMax) trajectory.shift();
    trajectory.push(rainbowified);
  }
};

/**
 * Draw the rainbow.
 *
 * @api private
 */

NyanCat.prototype.drawRainbow = function(){
  var self = this;

  this.trajectories.forEach(function(line, index) {
    write('\u001b[' + self.scoreboardWidth + 'C');
    write(line.join(''));
    write('\n');
  });

  this.cursorUp(this.numberOfLines);
};

/**
 * Draw the nyan cat with `status`.
 *
 * @param {String} status
 * @api private
 */

NyanCat.prototype.drawNyanCat = function(status) {
  var self = this;
  var startWidth = this.scoreboardWidth + this.trajectories[0].length;

  [0, 1, 2, 3].forEach(function(index) {
    write('\u001b[' + startWidth + 'C');

    switch (index) {
      case 0:
        write('_,------,');
        write('\n');
        break;
      case 1:
        var padding = self.tick ? '  ' : '   ';
        write('_|' + padding + '/\\_/\\ ');
        write('\n');
        break;
      case 2:
        var padding = self.tick ? '_' : '__';
        var tail = self.tick ? '~' : '^';
        var face;
        switch (status) {
          case 'pass':
            face = '( ^ .^)';
            break;
          case 'fail':
            face = '( o .o)';
            break;
          default:
            face = '( - .-)';
        }
        write(tail + '|' + padding + face + ' ');
        write('\n');
        break;
      case 3:
        var padding = self.tick ? ' ' : '  ';
        write(padding + '""  "" ');
        write('\n');
        break;
    }
  });

  this.cursorUp(this.numberOfLines);
};

/**
 * Move cursor up `n`.
 *
 * @param {Number} n
 * @api private
 */

NyanCat.prototype.cursorUp = function(n) {
  write('\u001b[' + n + 'A');
};

/**
 * Move cursor down `n`.
 *
 * @param {Number} n
 * @api private
 */

NyanCat.prototype.cursorDown = function(n) {
  write('\u001b[' + n + 'B');
};

/**
 * Generate rainbow colors.
 *
 * @return {Array}
 * @api private
 */

NyanCat.prototype.generateColors = function(){
  var colors = [];

  for (var i = 0; i < (6 * 7); i++) {
    var pi3 = Math.floor(Math.PI / 3);
    var n = (i * (1.0 / 6));
    var r = Math.floor(3 * Math.sin(n) + 3);
    var g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3);
    var b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3);
    colors.push(36 * r + 6 * g + b + 16);
  }

  return colors;
};

/**
 * Apply rainbow to the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

NyanCat.prototype.rainbowify = function(str){
  var color = this.rainbowColors[this.colorIndex % this.rainbowColors.length];
  this.colorIndex += 1;
  return '\u001b[38;5;' + color + 'm' + str + '\u001b[0m';
};

/**
 * Stdout helper.
 */

function write(string) {
  process.stdout.write(string);
}

/**
 * Inherit from `Base.prototype`.
 */

NyanCat.prototype = new Base;
NyanCat.prototype.constructor = NyanCat;


}); // module: reporters/nyan.js

require.register("reporters/progress.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `Progress`.
 */

exports = module.exports = Progress;

/**
 * General progress bar color.
 */

Base.colors.progress = 90;

/**
 * Initialize a new `Progress` bar test reporter.
 *
 * @param {Runner} runner
 * @param {Object} options
 * @api public
 */

function Progress(runner, options) {
  Base.call(this, runner);

  var self = this
    , options = options || {}
    , stats = this.stats
    , width = Base.window.width * .50 | 0
    , total = runner.total
    , complete = 0
    , max = Math.max;

  // default chars
  options.open = options.open || '[';
  options.complete = options.complete || '▬';
  options.incomplete = options.incomplete || '⋅';
  options.close = options.close || ']';
  options.verbose = false;

  // tests started
  runner.on('start', function(){
    console.log();
    cursor.hide();
  });

  // tests complete
  runner.on('test end', function(){
    complete++;
    var incomplete = total - complete
      , percent = complete / total
      , n = width * percent | 0
      , i = width - n;

    cursor.CR();
    process.stdout.write('\u001b[J');
    process.stdout.write(color('progress', '  ' + options.open));
    process.stdout.write(Array(n).join(options.complete));
    process.stdout.write(Array(i).join(options.incomplete));
    process.stdout.write(color('progress', options.close));
    if (options.verbose) {
      process.stdout.write(color('progress', ' ' + complete + ' of ' + total));
    }
  });

  // tests are complete, output some stats
  // and the failures if any
  runner.on('end', function(){
    cursor.show();
    console.log();
    self.epilogue();
  });
}

/**
 * Inherit from `Base.prototype`.
 */

Progress.prototype = new Base;
Progress.prototype.constructor = Progress;


}); // module: reporters/progress.js

require.register("reporters/spec.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `Spec`.
 */

exports = module.exports = Spec;

/**
 * Initialize a new `Spec` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Spec(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , indents = 0
    , n = 0;

  function indent() {
    return Array(indents).join('  ')
  }

  runner.on('start', function(){
    console.log();
  });

  runner.on('suite', function(suite){
    ++indents;
    console.log(color('suite', '%s%s'), indent(), suite.title);
  });

  runner.on('suite end', function(suite){
    --indents;
    if (1 == indents) console.log();
  });

  runner.on('test', function(test){
    process.stdout.write(indent() + color('pass', '  ◦ ' + test.title + ': '));
  });

  runner.on('pending', function(test){
    var fmt = indent() + color('pending', '  - %s');
    console.log(fmt, test.title);
  });

  runner.on('pass', function(test){
    if ('fast' == test.speed) {
      var fmt = indent()
        + color('checkmark', '  ✓')
        + color('pass', ' %s ');
      cursor.CR();
      console.log(fmt, test.title);
    } else {
      var fmt = indent()
        + color('checkmark', '  ✓')
        + color('pass', ' %s ')
        + color(test.speed, '(%dms)');
      cursor.CR();
      console.log(fmt, test.title, test.duration);
    }
  });

  runner.on('fail', function(test, err){
    cursor.CR();
    console.log(indent() + color('fail', '  %d) %s'), ++n, test.title);
  });

  runner.on('end', self.epilogue.bind(self));
}

/**
 * Inherit from `Base.prototype`.
 */

Spec.prototype = new Base;
Spec.prototype.constructor = Spec;


}); // module: reporters/spec.js

require.register("reporters/tap.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `TAP`.
 */

exports = module.exports = TAP;

/**
 * Initialize a new `TAP` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function TAP(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , n = 1;

  runner.on('start', function(){
    var total = runner.grepTotal(runner.suite);
    console.log('%d..%d', 1, total);
  });

  runner.on('test end', function(){
    ++n;
  });

  runner.on('pending', function(test){
    console.log('ok %d %s # SKIP -', n, title(test));
  });

  runner.on('pass', function(test){
    console.log('ok %d %s', n, title(test));
  });

  runner.on('fail', function(test, err){
    console.log('not ok %d %s', n, title(test));
    console.log(err.stack.replace(/^/gm, '  '));
  });
}

/**
 * Return a TAP-safe title of `test`
 *
 * @param {Object} test
 * @return {String}
 * @api private
 */

function title(test) {
  return test.fullTitle().replace(/#/g, '');
}

}); // module: reporters/tap.js

require.register("reporters/teamcity.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base');

/**
 * Expose `Teamcity`.
 */

exports = module.exports = Teamcity;

/**
 * Initialize a new `Teamcity` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Teamcity(runner) {
  Base.call(this, runner);
  var stats = this.stats;

  runner.on('start', function() {
    console.log("##teamcity[testSuiteStarted name='mocha.suite']");
  });

  runner.on('test', function(test) {
    console.log("##teamcity[testStarted name='" + escape(test.fullTitle()) + "']");
  });

  runner.on('fail', function(test, err) {
    console.log("##teamcity[testFailed name='" + escape(test.fullTitle()) + "' message='" + escape(err.message) + "']");
  });

  runner.on('pending', function(test) {
    console.log("##teamcity[testIgnored name='" + escape(test.fullTitle()) + "' message='pending']");
  });

  runner.on('test end', function(test) {
    console.log("##teamcity[testFinished name='" + escape(test.fullTitle()) + "' duration='" + test.duration + "']");
  });

  runner.on('end', function() {
    console.log("##teamcity[testSuiteFinished name='mocha.suite' duration='" + stats.duration + "']");
  });
}

/**
 * Escape the given `str`.
 */

function escape(str) {
  return str
    .replace(/\|/g, "||")
    .replace(/\n/g, "|n")
    .replace(/\r/g, "|r")
    .replace(/\[/g, "|[")
    .replace(/\]/g, "|]")
    .replace(/\u0085/g, "|x")
    .replace(/\u2028/g, "|l")
    .replace(/\u2029/g, "|p")
    .replace(/'/g, "|'");
}

}); // module: reporters/teamcity.js

require.register("reporters/xunit.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Base = require('./base')
  , utils = require('../utils')
  , escape = utils.escape;

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var Date = global.Date
  , setTimeout = global.setTimeout
  , setInterval = global.setInterval
  , clearTimeout = global.clearTimeout
  , clearInterval = global.clearInterval;

/**
 * Expose `XUnit`.
 */

exports = module.exports = XUnit;

/**
 * Initialize a new `XUnit` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function XUnit(runner) {
  Base.call(this, runner);
  var stats = this.stats
    , tests = []
    , self = this;

  runner.on('pass', function(test){
    tests.push(test);
  });
  
  runner.on('fail', function(test){
    tests.push(test);
  });

  runner.on('end', function(){
    console.log(tag('testsuite', {
        name: 'Mocha Tests'
      , tests: stats.tests
      , failures: stats.failures
      , errors: stats.failures
      , skip: stats.tests - stats.failures - stats.passes
      , timestamp: (new Date).toUTCString()
      , time: stats.duration / 1000
    }, false));

    tests.forEach(test);
    console.log('</testsuite>');    
  });
}

/**
 * Inherit from `Base.prototype`.
 */

XUnit.prototype = new Base;
XUnit.prototype.constructor = XUnit;


/**
 * Output tag for the given `test.`
 */

function test(test) {
  var attrs = {
      classname: test.parent.fullTitle()
    , name: test.title
    , time: test.duration / 1000
  };

  if ('failed' == test.state) {
    var err = test.err;
    attrs.message = escape(err.message);
    console.log(tag('testcase', attrs, false, tag('failure', attrs, false, cdata(err.stack))));
  } else if (test.pending) {
    console.log(tag('testcase', attrs, false, tag('skipped', {}, true)));
  } else {
    console.log(tag('testcase', attrs, true) );
  }
}

/**
 * HTML tag helper.
 */

function tag(name, attrs, close, content) {
  var end = close ? '/>' : '>'
    , pairs = []
    , tag;

  for (var key in attrs) {
    pairs.push(key + '="' + escape(attrs[key]) + '"');
  }

  tag = '<' + name + (pairs.length ? ' ' + pairs.join(' ') : '') + end;
  if (content) tag += content + '</' + name + end;
  return tag;
}

/**
 * Return cdata escaped CDATA `str`.
 */

function cdata(str) {
  return '<![CDATA[' + escape(str) + ']]>';
}

}); // module: reporters/xunit.js

require.register("runnable.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var EventEmitter = require('browser/events').EventEmitter
  , debug = require('browser/debug')('mocha:runnable');

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var Date = global.Date
  , setTimeout = global.setTimeout
  , setInterval = global.setInterval
  , clearTimeout = global.clearTimeout
  , clearInterval = global.clearInterval;

/**
 * Expose `Runnable`.
 */

module.exports = Runnable;

/**
 * Initialize a new `Runnable` with the given `title` and callback `fn`.
 *
 * @param {String} title
 * @param {Function} fn
 * @api private
 */

function Runnable(title, fn) {
  this.title = title;
  this.fn = fn;
  this.async = fn && fn.length;
  this.sync = ! this.async;
  this._timeout = 2000;
  this._slow = 75;
  this.timedOut = false;
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Runnable.prototype = new EventEmitter;
Runnable.prototype.constructor = Runnable;


/**
 * Set & get timeout `ms`.
 *
 * @param {Number} ms
 * @return {Runnable|Number} ms or self
 * @api private
 */

Runnable.prototype.timeout = function(ms){
  if (0 == arguments.length) return this._timeout;
  debug('timeout %d', ms);
  this._timeout = ms;
  if (this.timer) this.resetTimeout();
  return this;
};

/**
 * Set & get slow `ms`.
 *
 * @param {Number} ms
 * @return {Runnable|Number} ms or self
 * @api private
 */

Runnable.prototype.slow = function(ms){
  if (0 === arguments.length) return this._slow;
  debug('timeout %d', ms);
  this._slow = ms;
  return this;
};

/**
 * Return the full title generated by recursively
 * concatenating the parent's full title.
 *
 * @return {String}
 * @api public
 */

Runnable.prototype.fullTitle = function(){
  return this.parent.fullTitle() + ' ' + this.title;
};

/**
 * Clear the timeout.
 *
 * @api private
 */

Runnable.prototype.clearTimeout = function(){
  clearTimeout(this.timer);
};

/**
 * Inspect the runnable void of private properties.
 *
 * @return {String}
 * @api private
 */

Runnable.prototype.inspect = function(){
  return JSON.stringify(this, function(key, val){
    if ('_' == key[0]) return;
    if ('parent' == key) return '#<Suite>';
    if ('ctx' == key) return '#<Context>';
    return val;
  }, 2);
};

/**
 * Reset the timeout.
 *
 * @api private
 */

Runnable.prototype.resetTimeout = function(){
  var self = this
    , ms = this.timeout();

  this.clearTimeout();
  if (ms) {
    this.timer = setTimeout(function(){
      self.callback(new Error('timeout of ' + ms + 'ms exceeded'));
      self.timedOut = true;
    }, ms);
  }
};

/**
 * Run the test and invoke `fn(err)`.
 *
 * @param {Function} fn
 * @api private
 */

Runnable.prototype.run = function(fn){
  var self = this
    , ms = this.timeout()
    , start = new Date
    , ctx = this.ctx
    , finished
    , emitted;

  if (ctx) ctx.runnable(this);

  // timeout
  if (this.async) {
    if (ms) {
      this.timer = setTimeout(function(){
        done(new Error('timeout of ' + ms + 'ms exceeded'));
        self.timedOut = true;
      }, ms);
    }
  }

  // called multiple times
  function multiple(err) {
    if (emitted) return;
    emitted = true;
    self.emit('error', err || new Error('done() called multiple times'));
  }

  // finished
  function done(err) {
    if (self.timedOut) return;
    if (finished) return multiple(err);
    self.clearTimeout();
    self.duration = new Date - start;
    finished = true;
    fn(err);
  }

  // for .resetTimeout()
  this.callback = done;

  // async
  if (this.async) {
    try {
      this.fn.call(ctx, function(err){
        if (err instanceof Error) return done(err);
        if (null != err) return done(new Error('done() invoked with non-Error: ' + err));
        done();
      });
    } catch (err) {
      done(err);
    }
    return;
  }
  
  // sync
  try {
    if (!this.pending) this.fn.call(ctx);
    this.duration = new Date - start;
    fn();
  } catch (err) {
    fn(err);
  }
};

}); // module: runnable.js

require.register("runner.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var EventEmitter = require('browser/events').EventEmitter
  , debug = require('browser/debug')('mocha:runner')
  , Test = require('./test')
  , utils = require('./utils')
  , filter = utils.filter
  , keys = utils.keys
  , noop = function(){};

/**
 * Expose `Runner`.
 */

module.exports = Runner;

/**
 * Initialize a `Runner` for the given `suite`.
 *
 * Events:
 *
 *   - `start`  execution started
 *   - `end`  execution complete
 *   - `suite`  (suite) test suite execution started
 *   - `suite end`  (suite) all tests (and sub-suites) have finished
 *   - `test`  (test) test execution started
 *   - `test end`  (test) test completed
 *   - `hook`  (hook) hook execution started
 *   - `hook end`  (hook) hook complete
 *   - `pass`  (test) test passed
 *   - `fail`  (test, err) test failed
 *
 * @api public
 */

function Runner(suite) {
  var self = this;
  this._globals = [];
  this.suite = suite;
  this.total = suite.total();
  this.failures = 0;
  this.on('test end', function(test){ self.checkGlobals(test); });
  this.on('hook end', function(hook){ self.checkGlobals(hook); });
  this.grep(/.*/);
  this.globals(utils.keys(global).concat(['errno']));
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Runner.prototype = new EventEmitter;
Runner.prototype.constructor = Runner;


/**
 * Run tests with full titles matching `re`. Updates runner.total
 * with number of tests matched.
 *
 * @param {RegExp} re
 * @param {Boolean} invert
 * @return {Runner} for chaining
 * @api public
 */

Runner.prototype.grep = function(re, invert){
  debug('grep %s', re);
  this._grep = re;
  this._invert = invert;
  this.total = this.grepTotal(this.suite);
  return this;
};

/**
 * Returns the number of tests matching the grep search for the
 * given suite.
 *
 * @param {Suite} suite
 * @return {Number}
 * @api public
 */

Runner.prototype.grepTotal = function(suite) {
  var self = this;
  var total = 0;

  suite.eachTest(function(test){
    var match = self._grep.test(test.fullTitle());
    if (self._invert) match = !match;
    if (match) total++;
  });

  return total;
};

/**
 * Allow the given `arr` of globals.
 *
 * @param {Array} arr
 * @return {Runner} for chaining
 * @api public
 */

Runner.prototype.globals = function(arr){
  if (0 == arguments.length) return this._globals;
  debug('globals %j', arr);
  utils.forEach(arr, function(arr){
    this._globals.push(arr);
  }, this);
  return this;
};

/**
 * Check for global variable leaks.
 *
 * @api private
 */

Runner.prototype.checkGlobals = function(test){
  if (this.ignoreLeaks) return;
  var leaks = filterLeaks(this._globals);

  this._globals = this._globals.concat(leaks);

  if (leaks.length > 1) {
    this.fail(test, new Error('global leaks detected: ' + leaks.join(', ') + ''));
  } else if (leaks.length) {
    this.fail(test, new Error('global leak detected: ' + leaks[0]));
  }
};

/**
 * Fail the given `test`.
 *
 * @param {Test} test
 * @param {Error} err
 * @api private
 */

Runner.prototype.fail = function(test, err){
  ++this.failures;
  test.state = 'failed';
  if ('string' == typeof err) {
    err = new Error('the string "' + err + '" was thrown, throw an Error :)');
  }
  this.emit('fail', test, err);
};

/**
 * Fail the given `hook` with `err`.
 *
 * Hook failures (currently) hard-end due
 * to that fact that a failing hook will
 * surely cause subsequent tests to fail,
 * causing jumbled reporting.
 *
 * @param {Hook} hook
 * @param {Error} err
 * @api private
 */

Runner.prototype.failHook = function(hook, err){
  this.fail(hook, err);
  this.emit('end');
};

/**
 * Run hook `name` callbacks and then invoke `fn()`.
 *
 * @param {String} name
 * @param {Function} function
 * @api private
 */

Runner.prototype.hook = function(name, fn){
  var suite = this.suite
    , hooks = suite['_' + name]
    , self = this
    , timer;

  function next(i) {
    var hook = hooks[i];
    if (!hook) return fn();
    self.currentRunnable = hook;

    self.emit('hook', hook);

    hook.on('error', function(err){
      self.failHook(hook, err);
    });

    hook.run(function(err){
      hook.removeAllListeners('error');
      var testError = hook.error();
      if (testError) self.fail(self.test, testError);
      if (err) return self.failHook(hook, err);
      self.emit('hook end', hook);
      next(++i);
    });
  }

  process.nextTick(function(){
    next(0);
  });
};

/**
 * Run hook `name` for the given array of `suites`
 * in order, and callback `fn(err)`.
 *
 * @param {String} name
 * @param {Array} suites
 * @param {Function} fn
 * @api private
 */

Runner.prototype.hooks = function(name, suites, fn){
  var self = this
    , orig = this.suite;

  function next(suite) {
    self.suite = suite;

    if (!suite) {
      self.suite = orig;
      return fn();
    }

    self.hook(name, function(err){
      if (err) {
        self.suite = orig;
        return fn(err);
      }

      next(suites.pop());
    });
  }

  next(suites.pop());
};

/**
 * Run hooks from the top level down.
 *
 * @param {String} name
 * @param {Function} fn
 * @api private
 */

Runner.prototype.hookUp = function(name, fn){
  var suites = [this.suite].concat(this.parents()).reverse();
  this.hooks(name, suites, fn);
};

/**
 * Run hooks from the bottom up.
 *
 * @param {String} name
 * @param {Function} fn
 * @api private
 */

Runner.prototype.hookDown = function(name, fn){
  var suites = [this.suite].concat(this.parents());
  this.hooks(name, suites, fn);
};

/**
 * Return an array of parent Suites from
 * closest to furthest.
 *
 * @return {Array}
 * @api private
 */

Runner.prototype.parents = function(){
  var suite = this.suite
    , suites = [];
  while (suite = suite.parent) suites.push(suite);
  return suites;
};

/**
 * Run the current test and callback `fn(err)`.
 *
 * @param {Function} fn
 * @api private
 */

Runner.prototype.runTest = function(fn){
  var test = this.test
    , self = this;

  try {
    test.on('error', function(err){
      self.fail(test, err);
    });
    test.run(fn);
  } catch (err) {
    fn(err);
  }
};

/**
 * Run tests in the given `suite` and invoke
 * the callback `fn()` when complete.
 *
 * @param {Suite} suite
 * @param {Function} fn
 * @api private
 */

Runner.prototype.runTests = function(suite, fn){
  var self = this
    , tests = suite.tests
    , test;

  function next(err) {
    // if we bail after first err
    if (self.failures && suite._bail) return fn();

    // next test
    test = tests.shift();

    // all done
    if (!test) return fn();

    // grep
    var match = self._grep.test(test.fullTitle());
    if (self._invert) match = !match;
    if (!match) return next();

    // pending
    if (test.pending) {
      self.emit('pending', test);
      self.emit('test end', test);
      return next();
    }

    // execute test and hook(s)
    self.emit('test', self.test = test);
    self.hookDown('beforeEach', function(){
      self.currentRunnable = self.test;
      self.runTest(function(err){
        test = self.test;

        if (err) {
          self.fail(test, err);
          self.emit('test end', test);
          return self.hookUp('afterEach', next);
        }

        test.state = 'passed';
        self.emit('pass', test);
        self.emit('test end', test);
        self.hookUp('afterEach', next);
      });
    });
  }

  this.next = next;
  next();
};

/**
 * Run the given `suite` and invoke the
 * callback `fn()` when complete.
 *
 * @param {Suite} suite
 * @param {Function} fn
 * @api private
 */

Runner.prototype.runSuite = function(suite, fn){
  var total = this.grepTotal(suite)
    , self = this
    , i = 0;

  debug('run suite %s', suite.fullTitle());

  if (!total) return fn();

  this.emit('suite', this.suite = suite);

  function next() {
    var curr = suite.suites[i++];
    if (!curr) return done();
    self.runSuite(curr, next);
  }

  function done() {
    self.suite = suite;
    self.hook('afterAll', function(){
      self.emit('suite end', suite);
      fn();
    });
  }

  this.hook('beforeAll', function(){
    self.runTests(suite, next);
  });
};

/**
 * Handle uncaught exceptions.
 *
 * @param {Error} err
 * @api private
 */

Runner.prototype.uncaught = function(err){
  debug('uncaught exception %s', err.message);
  var runnable = this.currentRunnable;
  if (!runnable || 'failed' == runnable.state) return;
  runnable.clearTimeout();
  err.uncaught = true;
  this.fail(runnable, err);

  // recover from test
  if ('test' == runnable.type) {
    this.emit('test end', runnable);
    this.hookUp('afterEach', this.next);
    return;
  }

  // bail on hooks
  this.emit('end');
};

/**
 * Run the root suite and invoke `fn(failures)`
 * on completion.
 *
 * @param {Function} fn
 * @return {Runner} for chaining
 * @api public
 */

Runner.prototype.run = function(fn){
  var self = this
    , fn = fn || function(){};

  debug('start');

  // uncaught callback
  function uncaught(err) {
    self.uncaught(err);
  }

  // callback
  this.on('end', function(){
    debug('end');
    process.removeListener('uncaughtException', uncaught);
    fn(self.failures);
  });

  // run suites
  this.emit('start');
  this.runSuite(this.suite, function(){
    debug('finished running');
    self.emit('end');
  });

  // uncaught exception
  process.on('uncaughtException', uncaught);

  return this;
};

/**
 * Filter leaks with the given globals flagged as `ok`.
 *
 * @param {Array} ok
 * @return {Array}
 * @api private
 */

function filterLeaks(ok) {
  return filter(keys(global), function(key){
    var matched = filter(ok, function(ok){
      if (~ok.indexOf('*')) return 0 == key.indexOf(ok.split('*')[0]);
      return key == ok;
    });
    return matched.length == 0 && (!global.navigator || 'onerror' !== key);
  });
}

}); // module: runner.js

require.register("suite.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var EventEmitter = require('browser/events').EventEmitter
  , debug = require('browser/debug')('mocha:suite')
  , milliseconds = require('./ms')
  , utils = require('./utils')
  , Hook = require('./hook');

/**
 * Expose `Suite`.
 */

exports = module.exports = Suite;

/**
 * Create a new `Suite` with the given `title`
 * and parent `Suite`. When a suite with the
 * same title is already present, that suite
 * is returned to provide nicer reporter
 * and more flexible meta-testing.
 *
 * @param {Suite} parent
 * @param {String} title
 * @return {Suite}
 * @api public
 */

exports.create = function(parent, title){
  var suite = new Suite(title, parent.ctx);
  suite.parent = parent;
  if (parent.pending) suite.pending = true;
  title = suite.fullTitle();
  parent.addSuite(suite);
  return suite;
};

/**
 * Initialize a new `Suite` with the given
 * `title` and `ctx`.
 *
 * @param {String} title
 * @param {Context} ctx
 * @api private
 */

function Suite(title, ctx) {
  this.title = title;
  this.ctx = ctx;
  this.suites = [];
  this.tests = [];
  this.pending = false;
  this._beforeEach = [];
  this._beforeAll = [];
  this._afterEach = [];
  this._afterAll = [];
  this.root = !title;
  this._timeout = 2000;
  this._slow = 75;
  this._bail = false;
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Suite.prototype = new EventEmitter;
Suite.prototype.constructor = Suite;


/**
 * Return a clone of this `Suite`.
 *
 * @return {Suite}
 * @api private
 */

Suite.prototype.clone = function(){
  var suite = new Suite(this.title);
  debug('clone');
  suite.ctx = this.ctx;
  suite.timeout(this.timeout());
  suite.slow(this.slow());
  suite.bail(this.bail());
  return suite;
};

/**
 * Set timeout `ms` or short-hand such as "2s".
 *
 * @param {Number|String} ms
 * @return {Suite|Number} for chaining
 * @api private
 */

Suite.prototype.timeout = function(ms){
  if (0 == arguments.length) return this._timeout;
  if ('string' == typeof ms) ms = milliseconds(ms);
  debug('timeout %d', ms);
  this._timeout = parseInt(ms, 10);
  return this;
};

/**
 * Set slow `ms` or short-hand such as "2s".
 *
 * @param {Number|String} ms
 * @return {Suite|Number} for chaining
 * @api private
 */

Suite.prototype.slow = function(ms){
  if (0 === arguments.length) return this._slow;
  if ('string' == typeof ms) ms = milliseconds(ms);
  debug('slow %d', ms);
  this._slow = ms;
  return this;
};

/**
 * Sets whether to bail after first error.
 *
 * @parma {Boolean} bail
 * @return {Suite|Number} for chaining
 * @api private
 */

Suite.prototype.bail = function(bail){
  if (0 == arguments.length) return this._bail;
  debug('bail %s', bail);
  this._bail = bail;
  return this;
};

/**
 * Run `fn(test[, done])` before running tests.
 *
 * @param {Function} fn
 * @return {Suite} for chaining
 * @api private
 */

Suite.prototype.beforeAll = function(fn){
  if (this.pending) return this;
  var hook = new Hook('"before all" hook', fn);
  hook.parent = this;
  hook.timeout(this.timeout());
  hook.slow(this.slow());
  hook.ctx = this.ctx;
  this._beforeAll.push(hook);
  this.emit('beforeAll', hook);
  return this;
};

/**
 * Run `fn(test[, done])` after running tests.
 *
 * @param {Function} fn
 * @return {Suite} for chaining
 * @api private
 */

Suite.prototype.afterAll = function(fn){
  if (this.pending) return this;
  var hook = new Hook('"after all" hook', fn);
  hook.parent = this;
  hook.timeout(this.timeout());
  hook.slow(this.slow());
  hook.ctx = this.ctx;
  this._afterAll.push(hook);
  this.emit('afterAll', hook);
  return this;
};

/**
 * Run `fn(test[, done])` before each test case.
 *
 * @param {Function} fn
 * @return {Suite} for chaining
 * @api private
 */

Suite.prototype.beforeEach = function(fn){
  if (this.pending) return this;
  var hook = new Hook('"before each" hook', fn);
  hook.parent = this;
  hook.timeout(this.timeout());
  hook.slow(this.slow());
  hook.ctx = this.ctx;
  this._beforeEach.push(hook);
  this.emit('beforeEach', hook);
  return this;
};

/**
 * Run `fn(test[, done])` after each test case.
 *
 * @param {Function} fn
 * @return {Suite} for chaining
 * @api private
 */

Suite.prototype.afterEach = function(fn){
  if (this.pending) return this;
  var hook = new Hook('"after each" hook', fn);
  hook.parent = this;
  hook.timeout(this.timeout());
  hook.slow(this.slow());
  hook.ctx = this.ctx;
  this._afterEach.push(hook);
  this.emit('afterEach', hook);
  return this;
};

/**
 * Add a test `suite`.
 *
 * @param {Suite} suite
 * @return {Suite} for chaining
 * @api private
 */

Suite.prototype.addSuite = function(suite){
  suite.parent = this;
  suite.timeout(this.timeout());
  suite.slow(this.slow());
  suite.bail(this.bail());
  this.suites.push(suite);
  this.emit('suite', suite);
  return this;
};

/**
 * Add a `test` to this suite.
 *
 * @param {Test} test
 * @return {Suite} for chaining
 * @api private
 */

Suite.prototype.addTest = function(test){
  test.parent = this;
  test.timeout(this.timeout());
  test.slow(this.slow());
  test.ctx = this.ctx;
  this.tests.push(test);
  this.emit('test', test);
  return this;
};

/**
 * Return the full title generated by recursively
 * concatenating the parent's full title.
 *
 * @return {String}
 * @api public
 */

Suite.prototype.fullTitle = function(){
  if (this.parent) {
    var full = this.parent.fullTitle();
    if (full) return full + ' ' + this.title;
  }
  return this.title;
};

/**
 * Return the total number of tests.
 *
 * @return {Number}
 * @api public
 */

Suite.prototype.total = function(){
  return utils.reduce(this.suites, function(sum, suite){
    return sum + suite.total();
  }, 0) + this.tests.length;
};

/**
 * Iterates through each suite recursively to find
 * all tests. Applies a function in the format
 * `fn(test)`.
 *
 * @param {Function} fn
 * @return {Suite}
 * @api private
 */

Suite.prototype.eachTest = function(fn){
  utils.forEach(this.tests, fn);
  utils.forEach(this.suites, function(suite){
    suite.eachTest(fn);
  });
  return this;
};

}); // module: suite.js

require.register("test.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Runnable = require('./runnable');

/**
 * Expose `Test`.
 */

module.exports = Test;

/**
 * Initialize a new `Test` with the given `title` and callback `fn`.
 *
 * @param {String} title
 * @param {Function} fn
 * @api private
 */

function Test(title, fn) {
  Runnable.call(this, title, fn);
  this.pending = !fn;
  this.type = 'test';
}

/**
 * Inherit from `Runnable.prototype`.
 */

Test.prototype = new Runnable;
Test.prototype.constructor = Test;


}); // module: test.js

require.register("utils.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var fs = require('browser/fs')
  , path = require('browser/path')
  , join = path.join
  , debug = require('browser/debug')('mocha:watch');

/**
 * Ignored directories.
 */

var ignore = ['node_modules', '.git'];

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 * @api private
 */

exports.escape = function(html){
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Array#forEach (<=IE8)
 *
 * @param {Array} array
 * @param {Function} fn
 * @param {Object} scope
 * @api private
 */

exports.forEach = function(arr, fn, scope){
  for (var i = 0, l = arr.length; i < l; i++)
    fn.call(scope, arr[i], i);
};

/**
 * Array#indexOf (<=IE8)
 *
 * @parma {Array} arr
 * @param {Object} obj to find index of
 * @param {Number} start
 * @api private
 */

exports.indexOf = function(arr, obj, start){
  for (var i = start || 0, l = arr.length; i < l; i++) {
    if (arr[i] === obj)
      return i;
  }
  return -1;
};

/**
 * Array#reduce (<=IE8)
 * 
 * @param {Array} array
 * @param {Function} fn
 * @param {Object} initial value
 * @api private
 */

exports.reduce = function(arr, fn, val){
  var rval = val;

  for (var i = 0, l = arr.length; i < l; i++) {
    rval = fn(rval, arr[i], i, arr);
  }

  return rval;
};

/**
 * Array#filter (<=IE8)
 *
 * @param {Array} array
 * @param {Function} fn
 * @api private
 */

exports.filter = function(arr, fn){
  var ret = [];

  for (var i = 0, l = arr.length; i < l; i++) {
    var val = arr[i];
    if (fn(val, i, arr)) ret.push(val);
  }

  return ret;
};

/**
 * Object.keys (<=IE8)
 *
 * @param {Object} obj
 * @return {Array} keys
 * @api private
 */

exports.keys = Object.keys || function(obj) {
  var keys = []
    , has = Object.prototype.hasOwnProperty // for `window` on <=IE8

  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }

  return keys;
};

/**
 * Watch the given `files` for changes
 * and invoke `fn(file)` on modification.
 *
 * @param {Array} files
 * @param {Function} fn
 * @api private
 */

exports.watch = function(files, fn){
  var options = { interval: 100 };
  files.forEach(function(file){
    debug('file %s', file);
    fs.watchFile(file, options, function(curr, prev){
      if (prev.mtime < curr.mtime) fn(file);
    });
  });
};

/**
 * Ignored files.
 */

function ignored(path){
  return !~ignore.indexOf(path);
}

/**
 * Lookup files in the given `dir`.
 *
 * @return {Array}
 * @api private
 */

exports.files = function(dir, ret){
  ret = ret || [];

  fs.readdirSync(dir)
  .filter(ignored)
  .forEach(function(path){
    path = join(dir, path);
    if (fs.statSync(path).isDirectory()) {
      exports.files(path, ret);
    } else if (path.match(/\.(js|coffee)$/)) {
      ret.push(path);
    }
  });

  return ret;
};

/**
 * Compute a slug from the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.slug = function(str){
  return str
    .toLowerCase()
    .replace(/ +/g, '-')
    .replace(/[^-\w]/g, '');
};

/**
 * Strip the function definition from `str`,
 * and re-indent for pre whitespace.
 */

exports.clean = function(str) {
  str = str
    .replace(/^function *\(.*\) *{/, '')
    .replace(/\s+\}$/, '');

  var spaces = str.match(/^\n?( *)/)[1].length
    , re = new RegExp('^ {' + spaces + '}', 'gm');

  str = str.replace(re, '');

  return exports.trim(str);
};

/**
 * Escape regular expression characters in `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.escapeRegexp = function(str){
  return str.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
};

/**
 * Trim the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.trim = function(str){
  return str.replace(/^\s+|\s+$/g, '');
};

/**
 * Parse the given `qs`.
 *
 * @param {String} qs
 * @return {Object}
 * @api private
 */

exports.parseQuery = function(qs){
  return exports.reduce(qs.replace('?', '').split('&'), function(obj, pair){
    var i = pair.indexOf('=')
      , key = pair.slice(0, i)
      , val = pair.slice(++i);

    obj[key] = decodeURIComponent(val);
    return obj;
  }, {});
};

/**
 * Highlight the given string of `js`.
 *
 * @param {String} js
 * @return {String}
 * @api private
 */

function highlight(js) {
  return js
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\/\/(.*)/gm, '<span class="comment">//$1</span>')
    .replace(/('.*?')/gm, '<span class="string">$1</span>')
    .replace(/(\d+\.\d+)/gm, '<span class="number">$1</span>')
    .replace(/(\d+)/gm, '<span class="number">$1</span>')
    .replace(/\bnew *(\w+)/gm, '<span class="keyword">new</span> <span class="init">$1</span>')
    .replace(/\b(function|new|throw|return|var|if|else)\b/gm, '<span class="keyword">$1</span>')
}

/**
 * Highlight the contents of tag `name`.
 *
 * @param {String} name
 * @api private
 */

exports.highlightTags = function(name) {
  var code = document.getElementsByTagName(name);
  for (var i = 0, len = code.length; i < len; ++i) {
    code[i].innerHTML = highlight(code[i].innerHTML);
  }
};

}); // module: utils.js
/**
 * Node shims.
 *
 * These are meant only to allow
 * mocha.js to run untouched, not
 * to allow running node code in
 * the browser.
 */

process = {};
process.exit = function(status){};
process.stdout = {};
global = window;

/**
 * next tick implementation.
 */

process.nextTick = (function(){
  // postMessage behaves badly on IE8
  if (window.ActiveXObject || !window.postMessage) {
    return function(fn){ fn() };
  }

  // based on setZeroTimeout by David Baron
  // - http://dbaron.org/log/20100309-faster-timeouts
  var timeouts = []
    , name = 'mocha-zero-timeout'

  window.addEventListener('message', function(e){
    if (e.source == window && e.data == name) {
      if (e.stopPropagation) e.stopPropagation();
      if (timeouts.length) timeouts.shift()();
    }
  }, true);

  return function(fn){
    timeouts.push(fn);
    window.postMessage(name, '*');
  }
})();

/**
 * Remove uncaughtException listener.
 */

process.removeListener = function(e){
  if ('uncaughtException' == e) {
    window.onerror = null;
  }
};

/**
 * Implements uncaughtException listener.
 */

process.on = function(e, fn){
  if ('uncaughtException' == e) {
    window.onerror = fn;
  }
};

// boot
;(function(){

  /**
   * Expose mocha.
   */

  var Mocha = window.Mocha = require('mocha'),
      mocha = window.mocha = new Mocha({ reporter: 'html' });

  /**
   * Override ui to ensure that the ui functions are initialized.
   * Normally this would happen in Mocha.prototype.loadFiles.
   */

  mocha.ui = function(ui){
    Mocha.prototype.ui.call(this, ui);
    this.suite.emit('pre-require', window, null, this);
    return this;
  };

  /**
   * Setup mocha with the given setting options.
   */

  mocha.setup = function(opts){
    if ('string' == typeof opts) opts = { ui: opts };
    for (var opt in opts) this[opt](opts[opt]);
    return this;
  };

  /**
   * Run mocha, returning the Runner.
   */

  mocha.run = function(fn){
    var options = mocha.options;
    mocha.globals('location');

    var query = Mocha.utils.parseQuery(window.location.search || '');
    if (query.grep) mocha.grep(query.grep);

    return Mocha.prototype.run.call(mocha, function(){
      Mocha.utils.highlightTags('code');
      if (fn) fn();
    });
  };
})();
})();!function (name, context, definition) {
  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    module.exports = definition();
  } else if (typeof define === 'function' && typeof define.amd  === 'object') {
    define(function () {
      return definition();
    });
  } else {
    context[name] = definition();
  }
}('chai', this, function () {

  function require(p) {
    var path = require.resolve(p)
      , mod = require.modules[path];
    if (!mod) throw new Error('failed to require "' + p + '"');
    if (!mod.exports) {
      mod.exports = {};
      mod.call(mod.exports, mod, mod.exports, require.relative(path));
    }
    return mod.exports;
  }

  require.modules = {};

  require.resolve = function (path) {
    var orig = path
      , reg = path + '.js'
      , index = path + '/index.js';
    return require.modules[reg] && reg
      || require.modules[index] && index
      || orig;
  };

  require.register = function (path, fn) {
    require.modules[path] = fn;
  };

  require.relative = function (parent) {
    return function(p){
      if ('.' != p[0]) return require(p);

      var path = parent.split('/')
        , segs = p.split('/');
      path.pop();

      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        if ('..' == seg) path.pop();
        else if ('.' != seg) path.push(seg);
      }

      return require(path.join('/'));
    };
  };

  require.alias = function (from, to) {
    var fn = require.modules[from];
    require.modules[to] = fn;
  };


  require.register("chai.js", function(module, exports, require){
    /*!
     * chai
     * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    var used = []
      , exports = module.exports = {};

    /*!
     * Chai version
     */

    exports.version = '1.2.0';

    /*!
     * Primary `Assertion` prototype
     */

    exports.Assertion = require('./chai/assertion');

    /*!
     * Assertion Error
     */

    exports.AssertionError = require('./chai/browser/error');

    /*!
     * Utils for plugins (not exported)
     */

    var util = require('./chai/utils');

    /**
     * # .use(function)
     *
     * Provides a way to extend the internals of Chai
     *
     * @param {Function}
     * @returns {this} for chaining
     * @api public
     */

    exports.use = function (fn) {
      if (!~used.indexOf(fn)) {
        fn(this, util);
        used.push(fn);
      }

      return this;
    };

    /*!
     * Core Assertions
     */

    var core = require('./chai/core/assertions');
    exports.use(core);

    /*!
     * Expect interface
     */

    var expect = require('./chai/interface/expect');
    exports.use(expect);

    /*!
     * Should interface
     */

    var should = require('./chai/interface/should');
    exports.use(should);

    /*!
     * Assert interface
     */

    var assert = require('./chai/interface/assert');
    exports.use(assert);

  }); // module: chai.js

  require.register("chai/assertion.js", function(module, exports, require){
    /*!
     * chai
     * http://chaijs.com
     * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /*!
     * Module dependencies.
     */

    var AssertionError = require('./browser/error')
      , util = require('./utils')
      , flag = util.flag;

    /*!
     * Module export.
     */

    module.exports = Assertion;


    /*!
     * Assertion Constructor
     *
     * Creates object for chaining.
     *
     * @api private
     */

    function Assertion (obj, msg, stack) {
      flag(this, 'ssfi', stack || arguments.callee);
      flag(this, 'object', obj);
      flag(this, 'message', msg);
    }

    /*!
      * ### Assertion.includeStack
      *
      * User configurable property, influences whether stack trace
      * is included in Assertion error message. Default of false
      * suppresses stack trace in the error message
      *
      *     Assertion.includeStack = true;  // enable stack on error
      *
      * @api public
      */

    Assertion.includeStack = false;

    Assertion.addProperty = function (name, fn) {
      util.addProperty(this.prototype, name, fn);
    };

    Assertion.addMethod = function (name, fn) {
      util.addMethod(this.prototype, name, fn);
    };

    Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
      util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
    };

    Assertion.overwriteProperty = function (name, fn) {
      util.overwriteProperty(this.prototype, name, fn);
    };

    Assertion.overwriteMethod = function (name, fn) {
      util.overwriteMethod(this.prototype, name, fn);
    };

    /*!
     * ### .assert(expression, message, negateMessage, expected, actual)
     *
     * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
     *
     * @name assert
     * @param {Philosophical} expression to be tested
     * @param {String} message to display if fails
     * @param {String} negatedMessage to display if negated expression fails
     * @param {Mixed} expected value (remember to check for negation)
     * @param {Mixed} actual (optional) will default to `this.obj`
     * @api private
     */

    Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual) {
      var ok = util.test(this, arguments);

      if (!ok) {
        var msg = util.getMessage(this, arguments)
          , actual = util.getActual(this, arguments);
        throw new AssertionError({
            message: msg
          , actual: actual
          , expected: expected
          , stackStartFunction: (Assertion.includeStack) ? this.assert : flag(this, 'ssfi')
        });
      }
    };

    /*!
     * ### ._obj
     *
     * Quick reference to stored `actual` value for plugin developers.
     *
     * @api private
     */

    Object.defineProperty(Assertion.prototype, '_obj',
      { get: function () {
          return flag(this, 'object');
        }
      , set: function (val) {
          flag(this, 'object', val);
        }
    });

  }); // module: chai/assertion.js

  require.register("chai/browser/error.js", function(module, exports, require){
    /*!
     * chai
     * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    module.exports = AssertionError;

    function AssertionError (options) {
      options = options || {};
      this.message = options.message;
      this.actual = options.actual;
      this.expected = options.expected;
      this.operator = options.operator;

      if (options.stackStartFunction && Error.captureStackTrace) {
        var stackStartFunction = options.stackStartFunction;
        Error.captureStackTrace(this, stackStartFunction);
      }
    }

    AssertionError.prototype = Object.create(Error.prototype);
    AssertionError.prototype.name = 'AssertionError';
    AssertionError.prototype.constructor = AssertionError;

    AssertionError.prototype.toString = function() {
      return this.message;
    };

  }); // module: chai/browser/error.js

  require.register("chai/core/assertions.js", function(module, exports, require){
    /*!
     * chai
     * http://chaijs.com
     * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    module.exports = function (chai, _) {
      var Assertion = chai.Assertion
        , toString = Object.prototype.toString
        , flag = _.flag;

      /**
       * ### Language Chains
       *
       * The following are provide as chainable getters to
       * improve the readability of your assertions. They
       * do not provide an testing capability unless they
       * have been overwritten by a plugin.
       *
       * **Chains**
       *
       * - to
       * - be
       * - been
       * - is
       * - that
       * - and
       * - have
       * - with
       *
       * @name language chains
       * @api public
       */

      [ 'to', 'be', 'been'
      , 'is', 'and', 'have'
      , 'with', 'that' ].forEach(function (chain) {
        Assertion.addProperty(chain, function () {
          return this;
        });
      });

      /**
       * ### .not
       *
       * Negates any of assertions following in the chain.
       *
       *     expect(foo).to.not.equal('bar');
       *     expect(goodFn).to.not.throw(Error);
       *     expect({ foo: 'baz' }).to.have.property('foo')
       *       .and.not.equal('bar');
       *
       * @name not
       * @api public
       */

      Assertion.addProperty('not', function () {
        flag(this, 'negate', true);
      });

      /**
       * ### .deep
       *
       * Sets the `deep` flag, later used by the `equal` and
       * `property` assertions.
       *
       *     expect(foo).to.deep.equal({ bar: 'baz' });
       *     expect({ foo: { bar: { baz: 'quux' } } })
       *       .to.have.deep.property('foo.bar.baz', 'quux');
       *
       * @name deep
       * @api public
       */

      Assertion.addProperty('deep', function () {
        flag(this, 'deep', true);
      });

      /**
       * ### .a(type)
       *
       * The `a` and `an` assertions are aliases that can be
       * used either as language chains or to assert a value's
       * type (as revealed by `Object.prototype.toString`).
       *
       *     // typeof
       *     expect('test').to.be.a('string');
       *     expect({ foo: 'bar' }).to.be.an('object');
       *     expect(null).to.be.a('null');
       *     expect(undefined).to.be.an('undefined');
       *
       *     // language chain
       *     expect(foo).to.be.an.instanceof(Foo);
       *
       * @name a
       * @alias an
       * @param {String} type
       * @api public
       */

      function an(type) {
        var obj = flag(this, 'object')
          , klassStart = type.charAt(0).toUpperCase()
          , klass = klassStart + type.slice(1)
          , article = ~[ 'A', 'E', 'I', 'O', 'U' ].indexOf(klassStart) ? 'an ' : 'a ';

        this.assert(
            '[object ' + klass + ']' === toString.call(obj)
          , 'expected #{this} to be ' + article + type
          , 'expected #{this} not to be ' + article + type
        );
      }

      Assertion.addChainableMethod('an', an);
      Assertion.addChainableMethod('a', an);

      /**
       * ### .include(value)
       *
       * The `include` and `contain` assertions can be used as either property
       * based language chains or as methods to assert the inclusion of an object
       * in an array or a substring in a string. When used as language chains,
       * they toggle the `contain` flag for the `keys` assertion.
       *
       *     expect([1,2,3]).to.include(2);
       *     expect('foobar').to.contain('foo');
       *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');
       *
       * @name include
       * @alias contain
       * @param {Object|String|Number} obj
       * @api public
       */

      function includeChainingBehavior () {
        flag(this, 'contains', true);
      }

      function include (val) {
        var obj = flag(this, 'object')
        this.assert(
            ~obj.indexOf(val)
          , 'expected #{this} to include ' + _.inspect(val)
          , 'expected #{this} to not include ' + _.inspect(val));
      }

      Assertion.addChainableMethod('include', include, includeChainingBehavior);
      Assertion.addChainableMethod('contain', include, includeChainingBehavior);

      /**
       * ### .ok
       *
       * Asserts that the target is truthy.
       *
       *     expect('everthing').to.be.ok;
       *     expect(1).to.be.ok;
       *     expect(false).to.not.be.ok;
       *     expect(undefined).to.not.be.ok;
       *     expect(null).to.not.be.ok;
       *
       * @name ok
       * @api public
       */

      Assertion.addProperty('ok', function () {
        this.assert(
            flag(this, 'object')
          , 'expected #{this} to be truthy'
          , 'expected #{this} to be falsy');
      });

      /**
       * ### .true
       *
       * Asserts that the target is `true`.
       *
       *     expect(true).to.be.true;
       *     expect(1).to.not.be.true;
       *
       * @name true
       * @api public
       */

      Assertion.addProperty('true', function () {
        this.assert(
            true === flag(this, 'object')
          , 'expected #{this} to be true'
          , 'expected #{this} to be false'
          , this.negate ? false : true
        );
      });

      /**
       * ### .false
       *
       * Asserts that the target is `false`.
       *
       *     expect(false).to.be.false;
       *     expect(0).to.not.be.false;
       *
       * @name false
       * @api public
       */

      Assertion.addProperty('false', function () {
        this.assert(
            false === flag(this, 'object')
          , 'expected #{this} to be false'
          , 'expected #{this} to be true'
          , this.negate ? true : false
        );
      });

      /**
       * ### .null
       *
       * Asserts that the target is `null`.
       *
       *     expect(null).to.be.null;
       *     expect(undefined).not.to.be.null;
       *
       * @name null
       * @api public
       */

      Assertion.addProperty('null', function () {
        this.assert(
            null === flag(this, 'object')
          , 'expected #{this} to be null'
          , 'expected #{this} not to be null'
        );
      });

      /**
       * ### .undefined
       *
       * Asserts that the target is `undefined`.
       *
       *      expect(undefined).to.be.undefined;
       *      expect(null).to.not.be.undefined;
       *
       * @name undefined
       * @api public
       */

      Assertion.addProperty('undefined', function () {
        this.assert(
            undefined === flag(this, 'object')
          , 'expected #{this} to be undefined'
          , 'expected #{this} not to be undefined'
        );
      });

      /**
       * ### .exist
       *
       * Asserts that the target is neither `null` nor `undefined`.
       *
       *     var foo = 'hi'
       *       , bar = null
       *       , baz;
       *
       *     expect(foo).to.exist;
       *     expect(bar).to.not.exist;
       *     expect(baz).to.not.exist;
       *
       * @name exist
       * @api public
       */

      Assertion.addProperty('exist', function () {
        this.assert(
            null != flag(this, 'object')
          , 'expected #{this} to exist'
          , 'expected #{this} to not exist'
        );
      });


      /**
       * ### .empty
       *
       * Asserts that the target's length is `0`. For arrays, it checks
       * the `length` property. For objects, it gets the count of
       * enumerable keys.
       *
       *     expect([]).to.be.empty;
       *     expect('').to.be.empty;
       *     expect({}).to.be.empty;
       *
       * @name empty
       * @api public
       */

      Assertion.addProperty('empty', function () {
        var obj = flag(this, 'object')
          , expected = obj;

        if (Array.isArray(obj) || 'string' === typeof object) {
          expected = obj.length;
        } else if (typeof obj === 'object') {
          expected = Object.keys(obj).length;
        }

        this.assert(
            !expected
          , 'expected #{this} to be empty'
          , 'expected #{this} not to be empty'
        );
      });

      /**
       * ### .arguments
       *
       * Asserts that the target is an arguments object.
       *
       *     function test () {
       *       expect(arguments).to.be.arguments;
       *     }
       *
       * @name arguments
       * @alias Arguments
       * @api public
       */

      function checkArguments () {
        var obj = flag(this, 'object')
          , type = Object.prototype.toString.call(obj);
        this.assert(
            '[object Arguments]' === type
          , 'expected #{this} to be arguments but got ' + type
          , 'expected #{this} to not be arguments'
        );
      }

      Assertion.addProperty('arguments', checkArguments);
      Assertion.addProperty('Arguments', checkArguments);

      /**
       * ### .equal(value)
       *
       * Asserts that the target is strictly equal (`===`) to `value`.
       * Alternately, if the `deep` flag is set, asserts that
       * the target is deeply equal to `value`.
       *
       *     expect('hello').to.equal('hello');
       *     expect(42).to.equal(42);
       *     expect(1).to.not.equal(true);
       *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
       *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });
       *
       * @name equal
       * @alias equals
       * @alias eq
       * @alias deep.equal
       * @param {Mixed} value
       * @api public
       */

      function assertEqual (val) {
        var obj = flag(this, 'object');
        if (flag(this, 'deep')) {
          return this.eql(val);
        } else {
          this.assert(
              val === obj
            , 'expected #{this} to equal #{exp}'
            , 'expected #{this} to not equal #{exp}'
            , val
          );
        }
      }

      Assertion.addMethod('equal', assertEqual);
      Assertion.addMethod('equals', assertEqual);
      Assertion.addMethod('eq', assertEqual);

      /**
       * ### .eql(value)
       *
       * Asserts that the target is deeply equal to `value`.
       *
       *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
       *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);
       *
       * @name eql
       * @param {Mixed} value
       * @api public
       */

      Assertion.addMethod('eql', function (obj) {
        this.assert(
            _.eql(obj, flag(this, 'object'))
          , 'expected #{this} to deeply equal #{exp}'
          , 'expected #{this} to not deeply equal #{exp}'
          , obj
        );
      });

      /**
       * ### .above(value)
       *
       * Asserts that the target is greater than `value`.
       *
       *     expect(10).to.be.above(5);
       *
       * Can also be used in conjunction with `length` to
       * assert a minimum length. The benefit being a
       * more informative error message than if the length
       * was supplied directly.
       *
       *     expect('foo').to.have.length.above(2);
       *     expect([ 1, 2, 3 ]).to.have.length.above(2);
       *
       * @name above
       * @alias gt
       * @alias greaterThan
       * @param {Number} value
       * @api public
       */

      function assertAbove (n) {
        var obj = flag(this, 'object');
        if (flag(this, 'doLength')) {
          new Assertion(obj).to.have.property('length');
          var len = obj.length;
          this.assert(
              len > n
            , 'expected #{this} to have a length above #{exp} but got #{act}'
            , 'expected #{this} to not have a length above #{exp}'
            , n
            , len
          );
        } else {
          this.assert(
              obj > n
            , 'expected #{this} to be above ' + n
            , 'expected #{this} to be below ' + n
          );
        }
      }

      Assertion.addMethod('above', assertAbove);
      Assertion.addMethod('gt', assertAbove);
      Assertion.addMethod('greaterThan', assertAbove);

      /**
       * ### .below(value)
       *
       * Asserts that the target is less than `value`.
       *
       *     expect(5).to.be.below(10);
       *
       * Can also be used in conjunction with `length` to
       * assert a maximum length. The benefit being a
       * more informative error message than if the length
       * was supplied directly.
       *
       *     expect('foo').to.have.length.below(4);
       *     expect([ 1, 2, 3 ]).to.have.length.below(4);
       *
       * @name below
       * @alias lt
       * @alias lessThan
       * @param {Number} value
       * @api public
       */

      function assertBelow (n) {
        var obj = flag(this, 'object');
        if (flag(this, 'doLength')) {
          new Assertion(obj).to.have.property('length');
          var len = obj.length;
          this.assert(
              len < n
            , 'expected #{this} to have a length below #{exp} but got #{act}'
            , 'expected #{this} to not have a length below #{exp}'
            , n
            , len
          );
        } else {
          this.assert(
              obj < n
            , 'expected #{this} to be below ' + n
            , 'expected #{this} to be above ' + n
          );
        }
      }

      Assertion.addMethod('below', assertBelow);
      Assertion.addMethod('lt', assertBelow);
      Assertion.addMethod('lessThan', assertBelow);

      /**
       * ### .within(start, finish)
       *
       * Asserts that the target is within a range.
       *
       *     expect(7).to.be.within(5,10);
       *
       * Can also be used in conjunction with `length` to
       * assert a length range. The benefit being a
       * more informative error message than if the length
       * was supplied directly.
       *
       *     expect('foo').to.have.length.within(2,4);
       *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
       *
       * @name within
       * @param {Number} start lowerbound inclusive
       * @param {Number} finish upperbound inclusive
       * @api public
       */

      Assertion.addMethod('within', function (start, finish) {
        var obj = flag(this, 'object')
          , range = start + '..' + finish;
        if (flag(this, 'doLength')) {
          new Assertion(obj).to.have.property('length');
          var len = obj.length;
          this.assert(
              len >= start && len <= finish
            , 'expected #{this} to have a length within ' + range
            , 'expected #{this} to not have a length within ' + range
          );
        } else {
          this.assert(
              obj >= start && obj <= finish
            , 'expected #{this} to be within ' + range
            , 'expected #{this} to not be within ' + range
          );
        }
      });

      /**
       * ### .instanceof(constructor)
       *
       * Asserts that the target is an instance of `constructor`.
       *
       *     var Tea = function (name) { this.name = name; }
       *       , Chai = new Tea('chai');
       *
       *     expect(Chai).to.be.an.instanceof(Tea);
       *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);
       *
       * @name instanceof
       * @param {Constructor} constructor
       * @alias instanceOf
       * @api public
       */

      function assertInstanceOf (constructor) {
        var name = _.getName(constructor);
        this.assert(
            flag(this, 'object') instanceof constructor
          , 'expected #{this} to be an instance of ' + name
          , 'expected #{this} to not be an instance of ' + name
        );
      };

      Assertion.addMethod('instanceof', assertInstanceOf);
      Assertion.addMethod('instanceOf', assertInstanceOf);

      /**
       * ### .property(name, [value])
       *
       * Asserts that the target has a property `name`, optionally asserting that
       * the value of that property is strictly equal to  `value`.
       * If the `deep` flag is set, you can use dot- and bracket-notation for deep
       * references into objects and arrays.
       *
       *     // simple referencing
       *     var obj = { foo: 'bar' };
       *     expect(obj).to.have.property('foo');
       *     expect(obj).to.have.property('foo', 'bar');
       *
       *     // deep referencing
       *     var deepObj = {
       *         green: { tea: 'matcha' }
       *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]
       *     };

       *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');
       *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');
       *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');
       *
       * You can also use an array as the starting point of a `deep.property`
       * assertion, or traverse nested arrays.
       *
       *     var arr = [
       *         [ 'chai', 'matcha', 'konacha' ]
       *       , [ { tea: 'chai' }
       *         , { tea: 'matcha' }
       *         , { tea: 'konacha' } ]
       *     ];
       *
       *     expect(arr).to.have.deep.property('[0][1]', 'matcha');
       *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');
       *
       * Furthermore, `property` changes the subject of the assertion
       * to be the value of that property from the original object. This
       * permits for further chainable assertions on that property.
       *
       *     expect(obj).to.have.property('foo')
       *       .that.is.a('string');
       *     expect(deepObj).to.have.property('green')
       *       .that.is.an('object')
       *       .that.deep.equals({ tea: 'matcha' });
       *     expect(deepObj).to.have.property('teas')
       *       .that.is.an('array')
       *       .with.deep.property('[2]')
       *         .that.deep.equals({ tea: 'konacha' });
       *
       * @name property
       * @alias deep.property
       * @param {String} name
       * @param {Mixed} value (optional)
       * @returns value of property for chaining
       * @api public
       */

      Assertion.addMethod('property', function (name, val) {
        var descriptor = flag(this, 'deep') ? 'deep property ' : 'property '
          , negate = flag(this, 'negate')
          , obj = flag(this, 'object')
          , value = flag(this, 'deep')
            ? _.getPathValue(name, obj)
            : obj[name];

        if (negate && undefined !== val) {
          if (undefined === value) {
            throw new Error(_.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
          }
        } else {
          this.assert(
              undefined !== value
            , 'expected #{this} to have a ' + descriptor + _.inspect(name)
            , 'expected #{this} to not have ' + descriptor + _.inspect(name));
        }

        if (undefined !== val) {
          this.assert(
              val === value
            , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'
            , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'
            , val
            , value
          );
        }

        flag(this, 'object', value);
      });


      /**
       * ### .ownProperty(name)
       *
       * Asserts that the target has an own property `name`.
       *
       *     expect('test').to.have.ownProperty('length');
       *
       * @name ownProperty
       * @alias haveOwnProperty
       * @param {String} name
       * @api public
       */

      function assertOwnProperty (name) {
        var obj = flag(this, 'object');
        this.assert(
            obj.hasOwnProperty(name)
          , 'expected #{this} to have own property ' + _.inspect(name)
          , 'expected #{this} to not have own property ' + _.inspect(name)
        );
      }

      Assertion.addMethod('ownProperty', assertOwnProperty);
      Assertion.addMethod('haveOwnProperty', assertOwnProperty);

      /**
       * ### .length(value)
       *
       * Asserts that the target's `length` property has
       * the expected value.
       *
       *     expect([ 1, 2, 3]).to.have.length(3);
       *     expect('foobar').to.have.length(6);
       *
       * Can also be used as a chain precursor to a value
       * comparison for the length property.
       *
       *     expect('foo').to.have.length.above(2);
       *     expect([ 1, 2, 3 ]).to.have.length.above(2);
       *     expect('foo').to.have.length.below(4);
       *     expect([ 1, 2, 3 ]).to.have.length.below(4);
       *     expect('foo').to.have.length.within(2,4);
       *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
       *
       * @name length
       * @alias lengthOf
       * @param {Number} length
       * @api public
       */

      function assertLengthChain () {
        flag(this, 'doLength', true);
      }

      function assertLength (n) {
        var obj = flag(this, 'object');
        new Assertion(obj).to.have.property('length');
        var len = obj.length;

        this.assert(
            len == n
          , 'expected #{this} to have a length of #{exp} but got #{act}'
          , 'expected #{this} to not have a length of #{act}'
          , n
          , len
        );
      }

      Assertion.addChainableMethod('length', assertLength, assertLengthChain);
      Assertion.addMethod('lengthOf', assertLength, assertLengthChain);

      /**
       * ### .match(regexp)
       *
       * Asserts that the target matches a regular expression.
       *
       *     expect('foobar').to.match(/^foo/);
       *
       * @name match
       * @param {RegExp} RegularExpression
       * @api public
       */

      Assertion.addMethod('match', function (re) {
        var obj = flag(this, 'object');
        this.assert(
            re.exec(obj)
          , 'expected #{this} to match ' + re
          , 'expected #{this} not to match ' + re
        );
      });

      /**
       * ### .string(string)
       *
       * Asserts that the string target contains another string.
       *
       *     expect('foobar').to.have.string('bar');
       *
       * @name string
       * @param {String} string
       * @api public
       */

      Assertion.addMethod('string', function (str) {
        var obj = flag(this, 'object');
        new Assertion(obj).is.a('string');

        this.assert(
            ~obj.indexOf(str)
          , 'expected #{this} to contain ' + _.inspect(str)
          , 'expected #{this} to not contain ' + _.inspect(str)
        );
      });


      /**
       * ### .keys(key1, [key2], [...])
       *
       * Asserts that the target has exactly the given keys, or
       * asserts the inclusion of some keys when using the
       * `include` or `contain` modifiers.
       *
       *     expect({ foo: 1, bar: 2 }).to.have.keys(['foo', 'bar']);
       *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys('foo', 'bar');
       *
       * @name keys
       * @alias key
       * @param {String...|Array} keys
       * @api public
       */

      function assertKeys (keys) {
        var obj = flag(this, 'object')
          , str
          , ok = true;

        keys = keys instanceof Array
          ? keys
          : Array.prototype.slice.call(arguments);

        if (!keys.length) throw new Error('keys required');

        var actual = Object.keys(obj)
          , len = keys.length;

        // Inclusion
        ok = keys.every(function(key){
          return ~actual.indexOf(key);
        });

        // Strict
        if (!flag(this, 'negate') && !flag(this, 'contains')) {
          ok = ok && keys.length == actual.length;
        }

        // Key string
        if (len > 1) {
          keys = keys.map(function(key){
            return _.inspect(key);
          });
          var last = keys.pop();
          str = keys.join(', ') + ', and ' + last;
        } else {
          str = _.inspect(keys[0]);
        }

        // Form
        str = (len > 1 ? 'keys ' : 'key ') + str;

        // Have / include
        str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;

        // Assertion
        this.assert(
            ok
          , 'expected #{this} to ' + str
          , 'expected #{this} to not ' + str
        );
      }

      Assertion.addMethod('keys', assertKeys);
      Assertion.addMethod('key', assertKeys);

      /**
       * ### .throw(constructor)
       *
       * Asserts that the function target will throw a specific error, or specific type of error
       * (as determined using `instanceof`), optionally with a RegExp or string inclusion test
       * for the error's message.
       *
       *     var err = new ReferenceError('This is a bad function.');
       *     var fn = function () { throw err; }
       *     expect(fn).to.throw(ReferenceError);
       *     expect(fn).to.throw(Error);
       *     expect(fn).to.throw(/bad function/);
       *     expect(fn).to.not.throw('good function');
       *     expect(fn).to.throw(ReferenceError, /bad function/);
       *     expect(fn).to.throw(err);
       *     expect(fn).to.not.throw(new RangeError('Out of range.'));
       *
       * Please note that when a throw expectation is negated, it will check each
       * parameter independently, starting with error constructor type. The appropriate way
       * to check for the existence of a type of error but for a message that does not match
       * is to use `and`.
       *
       *     expect(fn).to.throw(ReferenceError)
       *        .and.not.throw(/good function/);
       *
       * @name throw
       * @alias throws
       * @alias Throw
       * @param {ErrorConstructor} constructor
       * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
       * @api public
       */

      function assertThrows (constructor, msg) {
        var obj = flag(this, 'object');
        new Assertion(obj).is.a('function');

        var thrown = false
          , desiredError = null
          , name = null;

        if (arguments.length === 0) {
          msg = null;
          constructor = null;
        } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
          msg = constructor;
          constructor = null;
        } else if (constructor && constructor instanceof Error) {
          desiredError = constructor;
          constructor = null;
          msg = null;
        } else if (typeof constructor === 'function') {
          name = (new constructor()).name;
        } else {
          constructor = null;
        }

        try {
          obj();
        } catch (err) {
          // first, check desired error
          if (desiredError) {
            this.assert(
                err === desiredError
              , 'expected #{this} to throw ' + _.inspect(desiredError) + ' but ' + _.inspect(err) + ' was thrown'
              , 'expected #{this} to not throw ' + _.inspect(desiredError)
            );
            return this;
          }
          // next, check constructor
          if (constructor) {
            this.assert(
                err instanceof constructor
              , 'expected #{this} to throw ' + name + ' but a ' + err.name + ' was thrown'
              , 'expected #{this} to not throw ' + name );
            if (!msg) return this;
          }
          // next, check message
          if (err.message && msg && msg instanceof RegExp) {
            this.assert(
                msg.exec(err.message)
              , 'expected #{this} to throw error matching ' + msg + ' but got ' + _.inspect(err.message)
              , 'expected #{this} to throw error not matching ' + msg
            );
            return this;
          } else if (err.message && msg && 'string' === typeof msg) {
            this.assert(
                ~err.message.indexOf(msg)
              , 'expected #{this} to throw error including #{exp} but got #{act}'
              , 'expected #{this} to throw error not including #{act}'
              , msg
              , err.message
            );
            return this;
          } else {
            thrown = true;
          }
        }

        var expectedThrown = name ? name : desiredError ? _.inspect(desiredError) : 'an error';

        this.assert(
            thrown === true
          , 'expected #{this} to throw ' + expectedThrown
          , 'expected #{this} to not throw ' + expectedThrown
        );
      };

      Assertion.addMethod('throw', assertThrows);
      Assertion.addMethod('throws', assertThrows);
      Assertion.addMethod('Throw', assertThrows);

      /**
       * ### .respondTo(method)
       *
       * Asserts that the object or class target will respond to a method.
       *
       *     Klass.prototype.bar = function(){};
       *     expect(Klass).to.respondTo('bar');
       *     expect(obj).to.respondTo('bar');
       *
       * To check if a constructor will respond to a static function,
       * set the `itself` flag.
       *
       *    Klass.baz = function(){};
       *    expect(Klass).itself.to.respondTo('baz');
       *
       * @name respondTo
       * @param {String} method
       * @api public
       */

      Assertion.addMethod('respondTo', function (method) {
        var obj = flag(this, 'object')
          , itself = flag(this, 'itself')
          , context = ('function' === typeof obj && !itself)
            ? obj.prototype[method]
            : obj[method];

        this.assert(
            'function' === typeof context
          , 'expected #{this} to respond to ' + _.inspect(method)
          , 'expected #{this} to not respond to ' + _.inspect(method)
        );
      });

      /**
       * ### .itself
       *
       * Sets the `itself` flag, later used by the `respondTo` assertion.
       *
       *    function Foo() {}
       *    Foo.bar = function() {}
       *    Foo.prototype.baz = function() {}
       *
       *    expect(Foo).itself.to.respondTo('bar');
       *    expect(Foo).itself.not.to.respondTo('baz');
       *
       * @name itself
       * @api public
       */

      Assertion.addProperty('itself', function () {
        flag(this, 'itself', true);
      });

      /**
       * ### .satisfy(method)
       *
       * Asserts that the target passes a given truth test.
       *
       *     expect(1).to.satisfy(function(num) { return num > 0; });
       *
       * @name satisfy
       * @param {Function} matcher
       * @api public
       */

      Assertion.addMethod('satisfy', function (matcher) {
        var obj = flag(this, 'object');
        this.assert(
            matcher(obj)
          , 'expected #{this} to satisfy ' + _.inspect(matcher)
          , 'expected #{this} to not satisfy' + _.inspect(matcher)
          , this.negate ? false : true
          , matcher(obj)
        );
      });

      /**
       * ### .closeTo(expected, delta)
       *
       * Asserts that the target is equal `expected`, to within a +/- `delta` range.
       *
       *     expect(1.5).to.be.closeTo(1, 0.5);
       *
       * @name closeTo
       * @param {Number} expected
       * @param {Number} delta
       * @api public
       */

      Assertion.addMethod('closeTo', function (expected, delta) {
        var obj = flag(this, 'object');
        this.assert(
            Math.abs(obj - expected) <= delta
          , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
          , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
        );
      });

    };

  }); // module: chai/core/assertions.js

  require.register("chai/interface/assert.js", function(module, exports, require){
    /*!
     * chai
     * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */


    module.exports = function (chai, util) {

      /*!
       * Chai dependencies.
       */

      var Assertion = chai.Assertion
        , flag = util.flag;

      /*!
       * Module export.
       */

      /**
       * ### assert(expression, message)
       *
       * Write your own test expressions.
       *
       *     assert('foo' !== 'bar', 'foo is not bar');
       *     assert(Array.isArray([]), 'empty arrays are arrays');
       *
       * @param {Mixed} expression to test for truthiness
       * @param {String} message to display on error
       * @name assert
       * @api public
       */

      var assert = chai.assert = function (express, errmsg) {
        var test = new Assertion(null);
        test.assert(
            express
          , errmsg
          , '[ negation message unavailable ]'
        );
      };

      /**
       * ### .fail(actual, expected, [message], [operator])
       *
       * Throw a failure. Node.js `assert` module-compatible.
       *
       * @name fail
       * @param {Mixed} actual
       * @param {Mixed} expected
       * @param {String} message
       * @param {String} operator
       * @api public
       */

      assert.fail = function (actual, expected, message, operator) {
        throw new chai.AssertionError({
            actual: actual
          , expected: expected
          , message: message
          , operator: operator
          , stackStartFunction: assert.fail
        });
      };

      /**
       * ### .ok(object, [message])
       *
       * Asserts that `object` is truthy.
       *
       *     assert.ok('everything', 'everything is ok');
       *     assert.ok(false, 'this will fail');
       *
       * @name ok
       * @param {Mixed} object to test
       * @param {String} message
       * @api public
       */

      assert.ok = function (val, msg) {
        new Assertion(val, msg).is.ok;
      };

      /**
       * ### .equal(actual, expected, [message])
       *
       * Asserts non-strict equality (`==`) of `actual` and `expected`.
       *
       *     assert.equal(3, '3', '== coerces values to strings');
       *
       * @name equal
       * @param {Mixed} actual
       * @param {Mixed} expected
       * @param {String} message
       * @api public
       */

      assert.equal = function (act, exp, msg) {
        var test = new Assertion(act, msg);

        test.assert(
            exp == flag(test, 'object')
          , 'expected #{this} to equal #{exp}'
          , 'expected #{this} to not equal #{act}'
          , exp
          , act
        );
      };

      /**
       * ### .notEqual(actual, expected, [message])
       *
       * Asserts non-strict inequality (`!=`) of `actual` and `expected`.
       *
       *     assert.notEqual(3, 4, 'these numbers are not equal');
       *
       * @name notEqual
       * @param {Mixed} actual
       * @param {Mixed} expected
       * @param {String} message
       * @api public
       */

      assert.notEqual = function (act, exp, msg) {
        var test = new Assertion(act, msg);

        test.assert(
            exp != flag(test, 'object')
          , 'expected #{this} to not equal #{exp}'
          , 'expected #{this} to equal #{act}'
          , exp
          , act
        );
      };

      /**
       * ### .strictEqual(actual, expected, [message])
       *
       * Asserts strict equality (`===`) of `actual` and `expected`.
       *
       *     assert.strictEqual(true, true, 'these booleans are strictly equal');
       *
       * @name strictEqual
       * @param {Mixed} actual
       * @param {Mixed} expected
       * @param {String} message
       * @api public
       */

      assert.strictEqual = function (act, exp, msg) {
        new Assertion(act, msg).to.equal(exp);
      };

      /**
       * ### .notStrictEqual(actual, expected, [message])
       *
       * Asserts strict inequality (`!==`) of `actual` and `expected`.
       *
       *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');
       *
       * @name notStrictEqual
       * @param {Mixed} actual
       * @param {Mixed} expected
       * @param {String} message
       * @api public
       */

      assert.notStrictEqual = function (act, exp, msg) {
        new Assertion(act, msg).to.not.equal(exp);
      };

      /**
       * ### .deepEqual(actual, expected, [message])
       *
       * Asserts that `actual` is deeply equal to `expected`.
       *
       *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });
       *
       * @name deepEqual
       * @param {Mixed} actual
       * @param {Mixed} expected
       * @param {String} message
       * @api public
       */

      assert.deepEqual = function (act, exp, msg) {
        new Assertion(act, msg).to.eql(exp);
      };

      /**
       * ### .notDeepEqual(actual, expected, [message])
       *
       * Assert that `actual` is not deeply equal to `expected`.
       *
       *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });
       *
       * @name notDeepEqual
       * @param {Mixed} actual
       * @param {Mixed} expected
       * @param {String} message
       * @api public
       */

      assert.notDeepEqual = function (act, exp, msg) {
        new Assertion(act, msg).to.not.eql(exp);
      };

      /**
       * ### .isTrue(value, [message])
       *
       * Asserts that `value` is true.
       *
       *     var teaServed = true;
       *     assert.isTrue(teaServed, 'the tea has been served');
       *
       * @name isTrue
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isTrue = function (val, msg) {
        new Assertion(val, msg).is['true'];
      };

      /**
       * ### .isFalse(value, [message])
       *
       * Asserts that `value` is false.
       *
       *     var teaServed = false;
       *     assert.isFalse(teaServed, 'no tea yet? hmm...');
       *
       * @name isFalse
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isFalse = function (val, msg) {
        new Assertion(val, msg).is['false'];
      };

      /**
       * ### .isNull(value, [message])
       *
       * Asserts that `value` is null.
       *
       *     assert.isNull(err, 'there was no error');
       *
       * @name isNull
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isNull = function (val, msg) {
        new Assertion(val, msg).to.equal(null);
      };

      /**
       * ### .isNotNull(value, [message])
       *
       * Asserts that `value` is not null.
       *
       *     var tea = 'tasty chai';
       *     assert.isNotNull(tea, 'great, time for tea!');
       *
       * @name isNotNull
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isNotNull = function (val, msg) {
        new Assertion(val, msg).to.not.equal(null);
      };

      /**
       * ### .isUndefined(value, [message])
       *
       * Asserts that `value` is `undefined`.
       *
       *     var tea;
       *     assert.isUndefined(tea, 'no tea defined');
       *
       * @name isUndefined
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isUndefined = function (val, msg) {
        new Assertion(val, msg).to.equal(undefined);
      };

      /**
       * ### .isDefined(value, [message])
       *
       * Asserts that `value` is not `undefined`.
       *
       *     var tea = 'cup of chai';
       *     assert.isDefined(tea, 'tea has been defined');
       *
       * @name isUndefined
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isDefined = function (val, msg) {
        new Assertion(val, msg).to.not.equal(undefined);
      };

      /**
       * ### .isFunction(value, [message])
       *
       * Asserts that `value` is a function.
       *
       *     function serveTea() { return 'cup of tea'; };
       *     assert.isFunction(serveTea, 'great, we can have tea now');
       *
       * @name isFunction
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isFunction = function (val, msg) {
        new Assertion(val, msg).to.be.a('function');
      };

      /**
       * ### .isNotFunction(value, [message])
       *
       * Asserts that `value` is _not_ a function.
       *
       *     var serveTea = [ 'heat', 'pour', 'sip' ];
       *     assert.isNotFunction(serveTea, 'great, we have listed the steps');
       *
       * @name isNotFunction
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isNotFunction = function (val, msg) {
        new Assertion(val, msg).to.not.be.a('function');
      };

      /**
       * ### .isObject(value, [message])
       *
       * Asserts that `value` is an object (as revealed by
       * `Object.prototype.toString`).
       *
       *     var selection = { name: 'Chai', serve: 'with spices' };
       *     assert.isObject(selection, 'tea selection is an object');
       *
       * @name isObject
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isObject = function (val, msg) {
        new Assertion(val, msg).to.be.a('object');
      };

      /**
       * ### .isNotObject(value, [message])
       *
       * Asserts that `value` is _not_ an object.
       *
       *     var selection = 'chai'
       *     assert.isObject(selection, 'tea selection is not an object');
       *     assert.isObject(null, 'null is not an object');
       *
       * @name isNotObject
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isNotObject = function (val, msg) {
        new Assertion(val, msg).to.not.be.a('object');
      };

      /**
       * ### .isArray(value, [message])
       *
       * Asserts that `value` is an array.
       *
       *     var menu = [ 'green', 'chai', 'oolong' ];
       *     assert.isArray(menu, 'what kind of tea do we want?');
       *
       * @name isArray
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isArray = function (val, msg) {
        new Assertion(val, msg).to.be.an('array');
      };

      /**
       * ### .isNotArray(value, [message])
       *
       * Asserts that `value` is _not_ an array.
       *
       *     var menu = 'green|chai|oolong';
       *     assert.isNotArray(menu, 'what kind of tea do we want?');
       *
       * @name isNotArray
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isNotArray = function (val, msg) {
        new Assertion(val, msg).to.not.be.an('array');
      };

      /**
       * ### .isString(value, [message])
       *
       * Asserts that `value` is a string.
       *
       *     var teaOrder = 'chai';
       *     assert.isString(teaOrder, 'order placed');
       *
       * @name isString
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isString = function (val, msg) {
        new Assertion(val, msg).to.be.a('string');
      };

      /**
       * ### .isNotString(value, [message])
       *
       * Asserts that `value` is _not_ a string.
       *
       *     var teaOrder = 4;
       *     assert.isNotString(teaOrder, 'order placed');
       *
       * @name isNotString
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isNotString = function (val, msg) {
        new Assertion(val, msg).to.not.be.a('string');
      };

      /**
       * ### .isNumber(value, [message])
       *
       * Asserts that `value` is a number.
       *
       *     var cups = 2;
       *     assert.isNumber(cups, 'how many cups');
       *
       * @name isNumber
       * @param {Number} value
       * @param {String} message
       * @api public
       */

      assert.isNumber = function (val, msg) {
        new Assertion(val, msg).to.be.a('number');
      };

      /**
       * ### .isNotNumber(value, [message])
       *
       * Asserts that `value` is _not_ a number.
       *
       *     var cups = '2 cups please';
       *     assert.isNotNumber(cups, 'how many cups');
       *
       * @name isNotNumber
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isNotNumber = function (val, msg) {
        new Assertion(val, msg).to.not.be.a('number');
      };

      /**
       * ### .isBoolean(value, [message])
       *
       * Asserts that `value` is a boolean.
       *
       *     var teaReady = true
       *       , teaServed = false;
       *
       *     assert.isBoolean(teaReady, 'is the tea ready');
       *     assert.isBoolean(teaServed, 'has tea been served');
       *
       * @name isBoolean
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isBoolean = function (val, msg) {
        new Assertion(val, msg).to.be.a('boolean');
      };

      /**
       * ### .isNotBoolean(value, [message])
       *
       * Asserts that `value` is _not_ a boolean.
       *
       *     var teaReady = 'yep'
       *       , teaServed = 'nope';
       *
       *     assert.isNotBoolean(teaReady, 'is the tea ready');
       *     assert.isNotBoolean(teaServed, 'has tea been served');
       *
       * @name isNotBoolean
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.isNotBoolean = function (val, msg) {
        new Assertion(val, msg).to.not.be.a('boolean');
      };

      /**
       * ### .typeOf(value, name, [message])
       *
       * Asserts that `value`'s type is `name`, as determined by
       * `Object.prototype.toString`.
       *
       *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');
       *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');
       *     assert.typeOf('tea', 'string', 'we have a string');
       *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');
       *     assert.typeOf(null, 'null', 'we have a null');
       *     assert.typeOf(undefined, 'undefined', 'we have an undefined');
       *
       * @name typeOf
       * @param {Mixed} value
       * @param {String} name
       * @param {String} message
       * @api public
       */

      assert.typeOf = function (val, type, msg) {
        new Assertion(val, msg).to.be.a(type);
      };

      /**
       * ### .notTypeOf(value, name, [message])
       *
       * Asserts that `value`'s type is _not_ `name`, as determined by
       * `Object.prototype.toString`.
       *
       *     assert.notTypeOf('tea', 'number', 'strings are not numbers');
       *
       * @name notTypeOf
       * @param {Mixed} value
       * @param {String} typeof name
       * @param {String} message
       * @api public
       */

      assert.notTypeOf = function (val, type, msg) {
        new Assertion(val, msg).to.not.be.a(type);
      };

      /**
       * ### .instanceOf(object, constructor, [message])
       *
       * Asserts that `value` is an instance of `constructor`.
       *
       *     var Tea = function (name) { this.name = name; }
       *       , chai = new Tea('chai');
       *
       *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');
       *
       * @name instanceOf
       * @param {Object} object
       * @param {Constructor} constructor
       * @param {String} message
       * @api public
       */

      assert.instanceOf = function (val, type, msg) {
        new Assertion(val, msg).to.be.instanceOf(type);
      };

      /**
       * ### .notInstanceOf(object, constructor, [message])
       *
       * Asserts `value` is not an instance of `constructor`.
       *
       *     var Tea = function (name) { this.name = name; }
       *       , chai = new String('chai');
       *
       *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');
       *
       * @name notInstanceOf
       * @param {Object} object
       * @param {Constructor} constructor
       * @param {String} message
       * @api public
       */

      assert.notInstanceOf = function (val, type, msg) {
        new Assertion(val, msg).to.not.be.instanceOf(type);
      };

      /**
       * ### .include(haystack, needle, [message])
       *
       * Asserts that `haystack` includes `needle`. Works
       * for strings and arrays.
       *
       *     assert.include('foobar', 'bar', 'foobar contains string "bar"');
       *     assert.include([ 1, 2, 3 ], 3, 'array contains value');
       *
       * @name include
       * @param {Array|String} haystack
       * @param {Mixed} needle
       * @param {String} message
       * @api public
       */

      assert.include = function (exp, inc, msg) {
        var obj = new Assertion(exp, msg);

        if (Array.isArray(exp)) {
          obj.to.include(inc);
        } else if ('string' === typeof exp) {
          obj.to.contain.string(inc);
        }
      };

      /**
       * ### .match(value, regexp, [message])
       *
       * Asserts that `value` matches the regular expression `regexp`.
       *
       *     assert.match('foobar', /^foo/, 'regexp matches');
       *
       * @name match
       * @param {Mixed} value
       * @param {RegExp} regexp
       * @param {String} message
       * @api public
       */

      assert.match = function (exp, re, msg) {
        new Assertion(exp, msg).to.match(re);
      };

      /**
       * ### .notMatch(value, regexp, [message])
       *
       * Asserts that `value` does not match the regular expression `regexp`.
       *
       *     assert.notMatch('foobar', /^foo/, 'regexp does not match');
       *
       * @name notMatch
       * @param {Mixed} value
       * @param {RegExp} regexp
       * @param {String} message
       * @api public
       */

      assert.notMatch = function (exp, re, msg) {
        new Assertion(exp, msg).to.not.match(re);
      };

      /**
       * ### .property(object, property, [message])
       *
       * Asserts that `object` has a property named by `property`.
       *
       *     assert.property({ tea: { green: 'matcha' }}, 'tea');
       *
       * @name property
       * @param {Object} object
       * @param {String} property
       * @param {String} message
       * @api public
       */

      assert.property = function (obj, prop, msg) {
        new Assertion(obj, msg).to.have.property(prop);
      };

      /**
       * ### .notProperty(object, property, [message])
       *
       * Asserts that `object` does _not_ have a property named by `property`.
       *
       *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');
       *
       * @name notProperty
       * @param {Object} object
       * @param {String} property
       * @param {String} message
       * @api public
       */

      assert.notProperty = function (obj, prop, msg) {
        new Assertion(obj, msg).to.not.have.property(prop);
      };

      /**
       * ### .deepProperty(object, property, [message])
       *
       * Asserts that `object` has a property named by `property`, which can be a
       * string using dot- and bracket-notation for deep reference.
       *
       *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');
       *
       * @name deepProperty
       * @param {Object} object
       * @param {String} property
       * @param {String} message
       * @api public
       */

      assert.deepProperty = function (obj, prop, msg) {
        new Assertion(obj, msg).to.have.deep.property(prop);
      };

      /**
       * ### .notDeepProperty(object, property, [message])
       *
       * Asserts that `object` does _not_ have a property named by `property`, which
       * can be a string using dot- and bracket-notation for deep reference.
       *
       *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');
       *
       * @name notDeepProperty
       * @param {Object} object
       * @param {String} property
       * @param {String} message
       * @api public
       */

      assert.notDeepProperty = function (obj, prop, msg) {
        new Assertion(obj, msg).to.not.have.deep.property(prop);
      };

      /**
       * ### .propertyVal(object, property, value, [message])
       *
       * Asserts that `object` has a property named by `property` with value given
       * by `value`.
       *
       *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');
       *
       * @name propertyVal
       * @param {Object} object
       * @param {String} property
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.propertyVal = function (obj, prop, val, msg) {
        new Assertion(obj, msg).to.have.property(prop, val);
      };

      /**
       * ### .propertyNotVal(object, property, value, [message])
       *
       * Asserts that `object` has a property named by `property`, but with a value
       * different from that given by `value`.
       *
       *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');
       *
       * @name propertyNotVal
       * @param {Object} object
       * @param {String} property
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.propertyNotVal = function (obj, prop, val, msg) {
        new Assertion(obj, msg).to.not.have.property(prop, val);
      };

      /**
       * ### .deepPropertyVal(object, property, value, [message])
       *
       * Asserts that `object` has a property named by `property` with value given
       * by `value`. `property` can use dot- and bracket-notation for deep
       * reference.
       *
       *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');
       *
       * @name deepPropertyVal
       * @param {Object} object
       * @param {String} property
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.deepPropertyVal = function (obj, prop, val, msg) {
        new Assertion(obj, msg).to.have.deep.property(prop, val);
      };

      /**
       * ### .deepPropertyNotVal(object, property, value, [message])
       *
       * Asserts that `object` has a property named by `property`, but with a value
       * different from that given by `value`. `property` can use dot- and
       * bracket-notation for deep reference.
       *
       *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');
       *
       * @name deepPropertyNotVal
       * @param {Object} object
       * @param {String} property
       * @param {Mixed} value
       * @param {String} message
       * @api public
       */

      assert.deepPropertyNotVal = function (obj, prop, val, msg) {
        new Assertion(obj, msg).to.not.have.deep.property(prop, val);
      };

      /**
       * ### .lengthOf(object, length, [message])
       *
       * Asserts that `object` has a `length` property with the expected value.
       *
       *     assert.lengthOf([1,2,3], 3, 'array has length of 3');
       *     assert.lengthOf('foobar', 5, 'string has length of 6');
       *
       * @name lengthOf
       * @param {Mixed} object
       * @param {Number} length
       * @param {String} message
       * @api public
       */

      assert.lengthOf = function (exp, len, msg) {
        new Assertion(exp, msg).to.have.length(len);
      };

      /**
       * ### .throws(function, [constructor/regexp], [message])
       *
       * Asserts that `function` will throw an error that is an instance of
       * `constructor`, or alternately that it will throw an error with message
       * matching `regexp`.
       *
       *     assert.throw(fn, ReferenceError, 'function throws a reference error');
       *
       * @name throws
       * @alias throw
       * @alias Throw
       * @param {Function} function
       * @param {ErrorConstructor} constructor
       * @param {RegExp} regexp
       * @param {String} message
       * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
       * @api public
       */

      assert.Throw = function (fn, type, msg) {
        if ('string' === typeof type) {
          msg = type;
          type = null;
        }

        new Assertion(fn, msg).to.Throw(type);
      };

      /**
       * ### .doesNotThrow(function, [constructor/regexp], [message])
       *
       * Asserts that `function` will _not_ throw an error that is an instance of
       * `constructor`, or alternately that it will not throw an error with message
       * matching `regexp`.
       *
       *     assert.doesNotThrow(fn, Error, 'function does not throw');
       *
       * @name doesNotThrow
       * @param {Function} function
       * @param {ErrorConstructor} constructor
       * @param {RegExp} regexp
       * @param {String} message
       * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
       * @api public
       */

      assert.doesNotThrow = function (fn, type, msg) {
        if ('string' === typeof type) {
          msg = type;
          type = null;
        }

        new Assertion(fn, msg).to.not.Throw(type);
      };

      /**
       * ### .operator(val1, operator, val2, [message])
       *
       * Compares two values using `operator`.
       *
       *     assert.operator(1, '<', 2, 'everything is ok');
       *     assert.operator(1, '>', 2, 'this will fail');
       *
       * @name operator
       * @param {Mixed} val1
       * @param {String} operator
       * @param {Mixed} val2
       * @param {String} message
       * @api public
       */

      assert.operator = function (val, operator, val2, msg) {
        if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {
          throw new Error('Invalid operator "' + operator + '"');
        }
        var test = new Assertion(eval(val + operator + val2), msg);
        test.assert(
            true === flag(test, 'object')
          , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)
          , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );
      };

      /**
       * ### .closeTo(actual, expected, delta, [message])
       *
       * Asserts that the target is equal `expected`, to within a +/- `delta` range.
       *
       *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');
       *
       * @name closeTo
       * @param {Number} actual
       * @param {Number} expected
       * @param {Number} delta
       * @param {String} message
       * @api public
       */

      assert.closeTo = function (act, exp, delta, msg) {
        new Assertion(act, msg).to.be.closeTo(exp, delta);
      };

      /*!
       * Undocumented / untested
       */

      assert.ifError = function (val, msg) {
        new Assertion(val, msg).to.not.be.ok;
      };

      /*!
       * Aliases.
       */

      (function alias(name, as){
        assert[as] = assert[name];
        return alias;
      })
      ('Throw', 'throw')
      ('Throw', 'throws');
    };

  }); // module: chai/interface/assert.js

  require.register("chai/interface/expect.js", function(module, exports, require){
    /*!
     * chai
     * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    module.exports = function (chai, util) {
      chai.expect = function (val, message) {
        return new chai.Assertion(val, message);
      };
    };


  }); // module: chai/interface/expect.js

  require.register("chai/interface/should.js", function(module, exports, require){
    /*!
     * chai
     * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    module.exports = function (chai, util) {
      var Assertion = chai.Assertion;

      function loadShould () {
        // modify Object.prototype to have `should`
        Object.defineProperty(Object.prototype, 'should',
          { set: function () {}
          , get: function(){
              if (this instanceof String || this instanceof Number) {
                return new Assertion(this.constructor(this));
              } else if (this instanceof Boolean) {
                return new Assertion(this == true);
              }
              return new Assertion(this);
            }
          , configurable: true
        });

        var should = {};

        should.equal = function (val1, val2) {
          new Assertion(val1).to.equal(val2);
        };

        should.Throw = function (fn, errt, errs) {
          new Assertion(fn).to.Throw(errt, errs);
        };

        should.exist = function (val) {
          new Assertion(val).to.exist;
        }

        // negation
        should.not = {}

        should.not.equal = function (val1, val2) {
          new Assertion(val1).to.not.equal(val2);
        };

        should.not.Throw = function (fn, errt, errs) {
          new Assertion(fn).to.not.Throw(errt, errs);
        };

        should.not.exist = function (val) {
          new Assertion(val).to.not.exist;
        }

        should['throw'] = should['Throw'];
        should.not['throw'] = should.not['Throw'];

        return should;
      };

      chai.should = loadShould;
      chai.Should = loadShould;
    };

  }); // module: chai/interface/should.js

  require.register("chai/utils/addChainableMethod.js", function(module, exports, require){
    /*!
     * Chai - addChainingMethod utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /*!
     * Module dependencies
     */

    var transferFlags = require('./transferFlags');

    /**
     * ### addChainableMethod (ctx, name, method, chainingBehavior)
     *
     * Adds a method to an object, such that the method can also be chained.
     *
     *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {
     *       var obj = utils.flag(this, 'object');
     *       new chai.Assertion(obj).to.be.equal(str);
     *     });
     *
     * Can also be accessed directly from `chai.Assertion`.
     *
     *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);
     *
     * The result can then be used as both a method assertion, executing both `method` and
     * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.
     *
     *     expect(fooStr).to.be.foo('bar');
     *     expect(fooStr).to.be.foo.equal('foo');
     *
     * @param {Object} ctx object to which the method is added
     * @param {String} name of method to add
     * @param {Function} method function to be used for `name`, when called
     * @param {Function} chainingBehavior function to be called every time the property is accessed
     * @name addChainableMethod
     * @api public
     */

    module.exports = function (ctx, name, method, chainingBehavior) {
      if (typeof chainingBehavior !== 'function')
        chainingBehavior = function () { };

      Object.defineProperty(ctx, name,
        { get: function () {
            chainingBehavior.call(this);

            var assert = function () {
              var result = method.apply(this, arguments);
              return result === undefined ? this : result;
            };

            // Re-enumerate every time to better accomodate plugins.
            var asserterNames = Object.getOwnPropertyNames(ctx);
            asserterNames.forEach(function (asserterName) {
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName)
                , functionProtoPD = Object.getOwnPropertyDescriptor(Function.prototype, asserterName);
              // Avoid trying to overwrite things that we can't, like `length` and `arguments`.
              if (functionProtoPD && !functionProtoPD.configurable) return;
              if (asserterName === 'arguments') return; // @see chaijs/chai/issues/69
              Object.defineProperty(assert, asserterName, pd);
            });

            transferFlags(this, assert);
            return assert;
          }
        , configurable: true
      });
    };

  }); // module: chai/utils/addChainableMethod.js

  require.register("chai/utils/addMethod.js", function(module, exports, require){
    /*!
     * Chai - addMethod utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /**
     * ### .addMethod (ctx, name, method)
     *
     * Adds a method to the prototype of an object.
     *
     *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {
     *       var obj = utils.flag(this, 'object');
     *       new chai.Assertion(obj).to.be.equal(str);
     *     });
     *
     * Can also be accessed directly from `chai.Assertion`.
     *
     *     chai.Assertion.addMethod('foo', fn);
     *
     * Then can be used as any other assertion.
     *
     *     expect(fooStr).to.be.foo('bar');
     *
     * @param {Object} ctx object to which the method is added
     * @param {String} name of method to add
     * @param {Function} method function to be used for name
     * @name addMethod
     * @api public
     */

    module.exports = function (ctx, name, method) {
      ctx[name] = function () {
        var result = method.apply(this, arguments);
        return result === undefined ? this : result;
      };
    };

  }); // module: chai/utils/addMethod.js

  require.register("chai/utils/addProperty.js", function(module, exports, require){
    /*!
     * Chai - addProperty utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /**
     * ### addProperty (ctx, name, getter)
     *
     * Adds a property to the prototype of an object.
     *
     *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {
     *       var obj = utils.flag(this, 'object');
     *       new chai.Assertion(obj).to.be.instanceof(Foo);
     *     });
     *
     * Can also be accessed directly from `chai.Assertion`.
     *
     *     chai.Assertion.addProperty('foo', fn);
     *
     * Then can be used as any other assertion.
     *
     *     expect(myFoo).to.be.foo;
     *
     * @param {Object} ctx object to which the property is added
     * @param {String} name of property to add
     * @param {Function} getter function to be used for name
     * @name addProperty
     * @api public
     */

    module.exports = function (ctx, name, getter) {
      Object.defineProperty(ctx, name,
        { get: function () {
            var result = getter.call(this);
            return result === undefined ? this : result;
          }
        , configurable: true
      });
    };

  }); // module: chai/utils/addProperty.js

  require.register("chai/utils/eql.js", function(module, exports, require){
    // This is directly from Node.js assert
    // https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/assert.js


    module.exports = _deepEqual;

    // For browser implementation
    if (!Buffer) {
      var Buffer = {
        isBuffer: function () {
          return false;
        }
      };
    }

    function _deepEqual(actual, expected) {
      // 7.1. All identical values are equivalent, as determined by ===.
      if (actual === expected) {
        return true;

      } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
        if (actual.length != expected.length) return false;

        for (var i = 0; i < actual.length; i++) {
          if (actual[i] !== expected[i]) return false;
        }

        return true;

      // 7.2. If the expected value is a Date object, the actual value is
      // equivalent if it is also a Date object that refers to the same time.
      } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();

      // 7.3. Other pairs that do not both pass typeof value == 'object',
      // equivalence is determined by ==.
      } else if (typeof actual != 'object' && typeof expected != 'object') {
        return actual === expected;

      // 7.4. For all other Object pairs, including Array objects, equivalence is
      // determined by having the same number of owned properties (as verified
      // with Object.prototype.hasOwnProperty.call), the same set of keys
      // (although not necessarily the same order), equivalent values for every
      // corresponding key, and an identical 'prototype' property. Note: this
      // accounts for both named and indexed properties on Arrays.
      } else {
        return objEquiv(actual, expected);
      }
    }

    function isUndefinedOrNull(value) {
      return value === null || value === undefined;
    }

    function isArguments(object) {
      return Object.prototype.toString.call(object) == '[object Arguments]';
    }

    function objEquiv(a, b) {
      if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
        return false;
      // an identical 'prototype' property.
      if (a.prototype !== b.prototype) return false;
      //~~~I've managed to break Object.keys through screwy arguments passing.
      //   Converting to array solves the problem.
      if (isArguments(a)) {
        if (!isArguments(b)) {
          return false;
        }
        a = pSlice.call(a);
        b = pSlice.call(b);
        return _deepEqual(a, b);
      }
      try {
        var ka = Object.keys(a),
            kb = Object.keys(b),
            key, i;
      } catch (e) {//happens when one is a string literal and the other isn't
        return false;
      }
      // having the same number of owned properties (keys incorporates
      // hasOwnProperty)
      if (ka.length != kb.length)
        return false;
      //the same set of keys (although not necessarily the same order),
      ka.sort();
      kb.sort();
      //~~~cheap key test
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i])
          return false;
      }
      //equivalent values for every corresponding key, and
      //~~~possibly expensive deep test
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!_deepEqual(a[key], b[key])) return false;
      }
      return true;
    }
  }); // module: chai/utils/eql.js

  require.register("chai/utils/flag.js", function(module, exports, require){
    /*!
     * Chai - flag utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /**
     * ### flag(object ,key, [value])
     *
     * Get or set a flag value on an object. If a
     * value is provided it will be set, else it will
     * return the currently set value or `undefined` if
     * the value is not set.
     *
     *     utils.flag(this, 'foo', 'bar'); // setter
     *     utils.flag(this, 'foo'); // getter, returns `bar`
     *
     * @param {Object} object (constructed Assertion
     * @param {String} key
     * @param {Mixed} value (optional)
     * @name flag
     * @api private
     */

    module.exports = function (obj, key, value) {
      var flags = obj.__flags || (obj.__flags = Object.create(null));
      if (arguments.length === 3) {
        flags[key] = value;
      } else {
        return flags[key];
      }
    };

  }); // module: chai/utils/flag.js

  require.register("chai/utils/getActual.js", function(module, exports, require){
    /*!
     * Chai - getActual utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /**
     * # getActual(object, [actual])
     *
     * Returns the `actual` value for an Assertion
     *
     * @param {Object} object (constructed Assertion)
     * @param {Arguments} chai.Assertion.prototype.assert arguments
     */

    module.exports = function (obj, args) {
      var actual = args[4];
      return 'undefined' !== actual ? actual : obj._obj;
    };

  }); // module: chai/utils/getActual.js

  require.register("chai/utils/getMessage.js", function(module, exports, require){
    /*!
     * Chai - message composition utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /*!
     * Module dependancies
     */

    var flag = require('./flag')
      , getActual = require('./getActual')
      , inspect = require('./inspect')
      , objDisplay = require('./objDisplay');

    /**
     * ### .getMessage(object, message, negateMessage)
     *
     * Construct the error message based on flags
     * and template tags. Template tags will return
     * a stringified inspection of the object referenced.
     *
     * Messsage template tags:
     * - `#{this}` current asserted object
     * - `#{act}` actual value
     * - `#{exp}` expected value
     *
     * @param {Object} object (constructed Assertion)
     * @param {Arguments} chai.Assertion.prototype.assert arguments
     * @name getMessage
     * @api public
     */

    module.exports = function (obj, args) {
      var negate = flag(obj, 'negate')
        , val = flag(obj, 'object')
        , expected = args[3]
        , actual = getActual(obj, args)
        , msg = negate ? args[2] : args[1]
        , flagMsg = flag(obj, 'message');

      msg = msg || '';
      msg = msg
        .replace(/#{this}/g, objDisplay(val))
        .replace(/#{act}/g, objDisplay(actual))
        .replace(/#{exp}/g, objDisplay(expected));

      return flagMsg ? flagMsg + ': ' + msg : msg;
    };

  }); // module: chai/utils/getMessage.js

  require.register("chai/utils/getName.js", function(module, exports, require){
    /*!
     * Chai - getName utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /**
     * # getName(func)
     *
     * Gets the name of a function, in a cross-browser way.
     *
     * @param {Function} a function (usually a constructor)
     */

    module.exports = function (func) {
      if (func.name) return func.name;

      var match = /^\s?function ([^(]*)\(/.exec(func);
      return match && match[1] ? match[1] : "";
    };

  }); // module: chai/utils/getName.js

  require.register("chai/utils/getPathValue.js", function(module, exports, require){
    /*!
     * Chai - getPathValue utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * @see https://github.com/logicalparadox/filtr
     * MIT Licensed
     */

    /**
     * ### .getPathValue(path, object)
     *
     * This allows the retrieval of values in an
     * object given a string path.
     *
     *     var obj = {
     *         prop1: {
     *             arr: ['a', 'b', 'c']
     *           , str: 'Hello'
     *         }
     *       , prop2: {
     *             arr: [ { nested: 'Universe' } ]
     *           , str: 'Hello again!'
     *         }
     *     }
     *
     * The following would be the results.
     *
     *     getPathValue('prop1.str', obj); // Hello
     *     getPathValue('prop1.att[2]', obj); // b
     *     getPathValue('prop2.arr[0].nested', obj); // Universe
     *
     * @param {String} path
     * @param {Object} object
     * @returns {Object} value or `undefined`
     * @name getPathValue
     * @api public
     */

    var getPathValue = module.exports = function (path, obj) {
      var parsed = parsePath(path);
      return _getPathValue(parsed, obj);
    };

    /*!
     * ## parsePath(path)
     *
     * Helper function used to parse string object
     * paths. Use in conjunction with `_getPathValue`.
     *
     *      var parsed = parsePath('myobject.property.subprop');
     *
     * ### Paths:
     *
     * * Can be as near infinitely deep and nested
     * * Arrays are also valid using the formal `myobject.document[3].property`.
     *
     * @param {String} path
     * @returns {Object} parsed
     * @api private
     */

    function parsePath (path) {
      var str = path.replace(/\[/g, '.[')
        , parts = str.match(/(\\\.|[^.]+?)+/g);
      return parts.map(function (value) {
        var re = /\[(\d+)\]$/
          , mArr = re.exec(value)
        if (mArr) return { i: parseFloat(mArr[1]) };
        else return { p: value };
      });
    };

    /*!
     * ## _getPathValue(parsed, obj)
     *
     * Helper companion function for `.parsePath` that returns
     * the value located at the parsed address.
     *
     *      var value = getPathValue(parsed, obj);
     *
     * @param {Object} parsed definition from `parsePath`.
     * @param {Object} object to search against
     * @returns {Object|Undefined} value
     * @api private
     */

    function _getPathValue (parsed, obj) {
      var tmp = obj
        , res;
      for (var i = 0, l = parsed.length; i < l; i++) {
        var part = parsed[i];
        if (tmp) {
          if ('undefined' !== typeof part.p)
            tmp = tmp[part.p];
          else if ('undefined' !== typeof part.i)
            tmp = tmp[part.i];
          if (i == (l - 1)) res = tmp;
        } else {
          res = undefined;
        }
      }
      return res;
    };

  }); // module: chai/utils/getPathValue.js

  require.register("chai/utils/index.js", function(module, exports, require){
    /*!
     * chai
     * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /*!
     * Main exports
     */

    var exports = module.exports = {};

    /*!
     * test utility
     */

    exports.test = require('./test');

    /*!
     * message utility
     */

    exports.getMessage = require('./getMessage');

    /*!
     * actual utility
     */

    exports.getActual = require('./getActual');

    /*!
     * Inspect util
     */

    exports.inspect = require('./inspect');

    /*!
     * Object Display util
     */

    exports.objDisplay = require('./objDisplay');

    /*!
     * Flag utility
     */

    exports.flag = require('./flag');

    /*!
     * Flag transferring utility
     */

    exports.transferFlags = require('./transferFlags');

    /*!
     * Deep equal utility
     */

    exports.eql = require('./eql');

    /*!
     * Deep path value
     */

    exports.getPathValue = require('./getPathValue');

    /*!
     * Function name
     */

    exports.getName = require('./getName');

    /*!
     * add Property
     */

    exports.addProperty = require('./addProperty');

    /*!
     * add Method
     */

    exports.addMethod = require('./addMethod');

    /*!
     * overwrite Property
     */

    exports.overwriteProperty = require('./overwriteProperty');

    /*!
     * overwrite Method
     */

    exports.overwriteMethod = require('./overwriteMethod');

    /*!
     * Add a chainable method
     */

    exports.addChainableMethod = require('./addChainableMethod');


  }); // module: chai/utils/index.js

  require.register("chai/utils/inspect.js", function(module, exports, require){
    // This is (almost) directly from Node.js utils
    // https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js

    var getName = require('./getName');

    module.exports = inspect;

    /**
     * Echos the value of a value. Trys to print the value out
     * in the best way possible given the different types.
     *
     * @param {Object} obj The object to print out.
     * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
     *    properties of objects.
     * @param {Number} depth Depth in which to descend in object. Default is 2.
     * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
     *    output. Default is false (no coloring).
     */
    function inspect(obj, showHidden, depth, colors) {
      var ctx = {
        showHidden: showHidden,
        seen: [],
        stylize: function (str) { return str; }
      };
      return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
    }

    // https://gist.github.com/1044128/
    var getOuterHTML = function(element) {
      if ('outerHTML' in element) return element.outerHTML;
      var ns = "http://www.w3.org/1999/xhtml";
      var container = document.createElementNS(ns, '_');
      var elemProto = (window.HTMLElement || window.Element).prototype;
      var xmlSerializer = new XMLSerializer();
      var html;
      if (document.xmlVersion) {
        return xmlSerializer.serializeToString(element);
      } else {
        container.appendChild(element.cloneNode(false));
        html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
        container.innerHTML = '';
        return html;
      }
    };
      
    // Returns true if object is a DOM element.
    var isDOMElement = function (object) {
      if (typeof HTMLElement === 'object') {
        return object instanceof HTMLElement;
      } else {
        return object &&
          typeof object === 'object' &&
          object.nodeType === 1 &&
          typeof object.nodeName === 'string';
      }
    };

    function formatValue(ctx, value, recurseTimes) {
      // Provide a hook for user-specified inspect functions.
      // Check that value is an object with an inspect function on it
      if (value && typeof value.inspect === 'function' &&
          // Filter out the util module, it's inspect function is special
          value.inspect !== exports.inspect &&
          // Also filter out any prototype objects using the circular check.
          !(value.constructor && value.constructor.prototype === value)) {
        return value.inspect(recurseTimes);
      }

      // Primitive types cannot have properties
      var primitive = formatPrimitive(ctx, value);
      if (primitive) {
        return primitive;
      }

      // If it's DOM elem, get outer HTML.
      if (isDOMElement(value)) {
        return getOuterHTML(value);
      }

      // Look up the keys of the object.
      var visibleKeys = Object.keys(value);
      var keys = ctx.showHidden ? Object.getOwnPropertyNames(value) : visibleKeys;

      // Some type of object without properties can be shortcutted.
      // In IE, errors have a single `stack` property, or if they are vanilla `Error`,
      // a `stack` plus `description` property; ignore those for consistency.
      if (keys.length === 0 || (isError(value) && (
          (keys.length === 1 && keys[0] === 'stack') ||
          (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')
         ))) {
        if (typeof value === 'function') {
          var name = getName(value);
          var nameSuffix = name ? ': ' + name : '';
          return ctx.stylize('[Function' + nameSuffix + ']', 'special');
        }
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
        }
        if (isDate(value)) {
          return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
        }
        if (isError(value)) {
          return formatError(value);
        }
      }

      var base = '', array = false, braces = ['{', '}'];

      // Make Array say that they are Array
      if (isArray(value)) {
        array = true;
        braces = ['[', ']'];
      }

      // Make functions say that they are functions
      if (typeof value === 'function') {
        var name = getName(value);
        var nameSuffix = name ? ': ' + name : '';
        base = ' [Function' + nameSuffix + ']';
      }

      // Make RegExps say that they are RegExps
      if (isRegExp(value)) {
        base = ' ' + RegExp.prototype.toString.call(value);
      }

      // Make dates with properties first say the date
      if (isDate(value)) {
        base = ' ' + Date.prototype.toUTCString.call(value);
      }

      // Make error with message first say the error
      if (isError(value)) {
        return formatError(value);
      }

      if (keys.length === 0 && (!array || value.length == 0)) {
        return braces[0] + base + braces[1];
      }

      if (recurseTimes < 0) {
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
        } else {
          return ctx.stylize('[Object]', 'special');
        }
      }

      ctx.seen.push(value);

      var output;
      if (array) {
        output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
      } else {
        output = keys.map(function(key) {
          return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
        });
      }

      ctx.seen.pop();

      return reduceToSingleString(output, base, braces);
    }


    function formatPrimitive(ctx, value) {
      switch (typeof value) {
        case 'undefined':
          return ctx.stylize('undefined', 'undefined');

        case 'string':
          var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                   .replace(/'/g, "\\'")
                                                   .replace(/\\"/g, '"') + '\'';
          return ctx.stylize(simple, 'string');

        case 'number':
          return ctx.stylize('' + value, 'number');

        case 'boolean':
          return ctx.stylize('' + value, 'boolean');
      }
      // For some reason typeof null is "object", so special case here.
      if (value === null) {
        return ctx.stylize('null', 'null');
      }
    }


    function formatError(value) {
      return '[' + Error.prototype.toString.call(value) + ']';
    }


    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
      var output = [];
      for (var i = 0, l = value.length; i < l; ++i) {
        if (Object.prototype.hasOwnProperty.call(value, String(i))) {
          output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              String(i), true));
        } else {
          output.push('');
        }
      }
      keys.forEach(function(key) {
        if (!key.match(/^\d+$/)) {
          output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              key, true));
        }
      });
      return output;
    }


    function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = ctx.stylize('[Getter/Setter]', 'special');
          } else {
            str = ctx.stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = ctx.stylize('[Setter]', 'special');
          }
        }
      }
      if (visibleKeys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (ctx.seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = formatValue(ctx, value[key], null);
          } else {
            str = formatValue(ctx, value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (array) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = ctx.stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (array && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = ctx.stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = ctx.stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    }


    function reduceToSingleString(output, base, braces) {
      var numLinesEst = 0;
      var length = output.reduce(function(prev, cur) {
        numLinesEst++;
        if (cur.indexOf('\n') >= 0) numLinesEst++;
        return prev + cur.length + 1;
      }, 0);

      if (length > 60) {
        return braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];
      }

      return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    function isArray(ar) {
      return Array.isArray(ar) ||
             (typeof ar === 'object' && objectToString(ar) === '[object Array]');
    }

    function isRegExp(re) {
      return typeof re === 'object' && objectToString(re) === '[object RegExp]';
    }

    function isDate(d) {
      return typeof d === 'object' && objectToString(d) === '[object Date]';
    }

    function isError(e) {
      return typeof e === 'object' && objectToString(e) === '[object Error]';
    }

    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }

  }); // module: chai/utils/inspect.js

  require.register("chai/utils/objDisplay.js", function(module, exports, require){
    /*!
     * Chai - flag utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /*!
     * Module dependancies
     */

    var inspect = require('./inspect');

    /**
     * ### .objDisplay (object)
     *
     * Determines if an object or an array matches
     * criteria to be inspected in-line for error
     * messages or should be truncated.
     *
     * @param {Mixed} javascript object to inspect
     * @name objDisplay
     * @api public
     */

    module.exports = function (obj) {
      var str = inspect(obj)
        , type = Object.prototype.toString.call(obj);

      if (str.length >= 40) {
        if (type === '[object Array]') {
          return '[ Array(' + obj.length + ') ]';
        } else if (type === '[object Object]') {
          var keys = Object.keys(obj)
            , kstr = keys.length > 2
              ? keys.splice(0, 2).join(', ') + ', ...'
              : keys.join(', ');
          return '{ Object (' + kstr + ') }';
        } else {
          return str;
        }
      } else {
        return str;
      }
    };

  }); // module: chai/utils/objDisplay.js

  require.register("chai/utils/overwriteMethod.js", function(module, exports, require){
    /*!
     * Chai - overwriteMethod utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /**
     * ### overwriteMethod (ctx, name, fn)
     *
     * Overwites an already existing method and provides
     * access to previous function. Must return function
     * to be used for name.
     *
     *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {
     *       return function (str) {
     *         var obj = utils.flag(this, 'object');
     *         if (obj instanceof Foo) {
     *           new chai.Assertion(obj.value).to.equal(str);
     *         } else {
     *           _super.apply(this, arguments);
     *         }
     *       }
     *     });
     *
     * Can also be accessed directly from `chai.Assertion`.
     *
     *     chai.Assertion.overwriteMethod('foo', fn);
     *
     * Then can be used as any other assertion.
     *
     *     expect(myFoo).to.equal('bar');
     *
     * @param {Object} ctx object whose method is to be overwritten
     * @param {String} name of method to overwrite
     * @param {Function} method function that returns a function to be used for name
     * @name overwriteMethod
     * @api public
     */

    module.exports = function (ctx, name, method) {
      var _method = ctx[name]
        , _super = function () { return this; };

      if (_method && 'function' === typeof _method)
        _super = _method;

      ctx[name] = function () {
        var result = method(_super).apply(this, arguments);
        return result === undefined ? this : result;
      }
    };

  }); // module: chai/utils/overwriteMethod.js

  require.register("chai/utils/overwriteProperty.js", function(module, exports, require){
    /*!
     * Chai - overwriteProperty utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /**
     * ### overwriteProperty (ctx, name, fn)
     *
     * Overwites an already existing property getter and provides
     * access to previous value. Must return function to use as getter.
     *
     *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {
     *       return function () {
     *         var obj = utils.flag(this, 'object');
     *         if (obj instanceof Foo) {
     *           new chai.Assertion(obj.name).to.equal('bar');
     *         } else {
     *           _super.call(this);
     *         }
     *       }
     *     });
     *
     *
     * Can also be accessed directly from `chai.Assertion`.
     *
     *     chai.Assertion.overwriteProperty('foo', fn);
     *
     * Then can be used as any other assertion.
     *
     *     expect(myFoo).to.be.ok;
     *
     * @param {Object} ctx object whose property is to be overwritten
     * @param {String} name of property to overwrite
     * @param {Function} getter function that returns a getter function to be used for name
     * @name overwriteProperty
     * @api public
     */

    module.exports = function (ctx, name, getter) {
      var _get = Object.getOwnPropertyDescriptor(ctx, name)
        , _super = function () {};

      if (_get && 'function' === typeof _get.get)
        _super = _get.get

      Object.defineProperty(ctx, name,
        { get: function () {
            var result = getter(_super).call(this);
            return result === undefined ? this : result;
          }
        , configurable: true
      });
    };

  }); // module: chai/utils/overwriteProperty.js

  require.register("chai/utils/test.js", function(module, exports, require){
    /*!
     * Chai - test utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /*!
     * Module dependancies
     */

    var flag = require('./flag');

    /**
     * # test(object, expression)
     *
     * Test and object for expression.
     *
     * @param {Object} object (constructed Assertion)
     * @param {Arguments} chai.Assertion.prototype.assert arguments
     */

    module.exports = function (obj, args) {
      var negate = flag(obj, 'negate')
        , expr = args[0];
      return negate ? !expr : expr;
    };

  }); // module: chai/utils/test.js

  require.register("chai/utils/transferFlags.js", function(module, exports, require){
    /*!
     * Chai - transferFlags utility
     * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /**
     * ### transferFlags(assertion, object, includeAll = true)
     *
     * Transfer all the flags for `assertion` to `object`. If
     * `includeAll` is set to `false`, then the base Chai
     * assertion flags (namely `object`, `ssfi`, and `message`)
     * will not be transferred.
     *
     *
     *     var newAssertion = new Assertion();
     *     utils.transferFlags(assertion, newAssertion);
     *
     *     var anotherAsseriton = new Assertion(myObj);
     *     utils.transferFlags(assertion, anotherAssertion, false);
     *
     * @param {Assertion} assertion the assertion to transfer the flags from
     * @param {Object} object the object to transfer the flags too; usually a new assertion
     * @param {Boolean} includeAll
     * @name getAllFlags
     * @api private
     */

    module.exports = function (assertion, object, includeAll) {
      var flags = assertion.__flags || (assertion.__flags = Object.create(null));

      if (!object.__flags) {
        object.__flags = Object.create(null);
      }

      includeAll = arguments.length === 3 ? includeAll : true;

      for (var flag in flags) {
        if (includeAll ||
            (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
          object.__flags[flag] = flags[flag];
        }
      }
    };

  }); // module: chai/utils/transferFlags.js

  require.alias("./chai.js", "chai");

  return require('chai');
});// Generated by CoffeeScript 1.4.0
(function() {
  var ArrayForm, expect, should,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ArrayForm = (function(_super) {

    __extends(ArrayForm, _super);

    function ArrayForm() {
      return ArrayForm.__super__.constructor.apply(this, arguments);
    }

    ArrayForm.prototype.initialize = function(form) {
      this.form = form;
    };

    return ArrayForm;

  })(Backbone.Model);

  expect = chai.expect;

  should = chai.should();

  mocha.setup("bdd");

  $("document").ready(function() {
    return mocha.globals(['ArrayForm']).run();
  });

  describe("array_form", function() {
    return describe("sanity", function() {
      return it("should exist", function() {
        return expect(ArrayForm).to.be.ok;
      });
    });
  });

}).call(this);

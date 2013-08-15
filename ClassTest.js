module('Class Tests');

QUnit.testStart(function(){
	window.MyClass = undefined;
	window.MyParent = undefined;
	window.MyChild = undefined;
	window.OtherClass = undefined;
	window.My = undefined;
	window.MyInterface = undefined;
});

test('Root \'Class\' can be instantiated', function(){
	
	// Create instance of Class
	var myObject = new Class();
	
	// Test it is an instance of Class
	ok(myObject instanceof Class);
	
});

// @todo Collect custom error
test('Defining class without name throws error', function(){
	
	// Test defining with no name
	// parameter errors
	raises(function(){
		Class.define();
	}, InvalidClassDeclarationFatal);
	
});

test('Class can be defined with name and instantiated', function(){
	
	// Define a new class
	Class.define('MyClass');
	
	// Test the class has been created
	ok(typeof MyClass == 'function');
	
	// Create an instance of new class
	var myObject = new MyClass();
	
	// Test is is an instance of new class
	ok(myObject instanceof MyClass);
	
});

test('Declared class property exists in object', function(){
	Class.define('MyClass', {
		myProperty: 'Value'
	});
	var myObject = new MyClass();
	ok(myObject.get('myProperty') == 'Value');
});

test('Class property can be set', function(){
	Class.define('MyClass', {
		myProperty: null
	});
	var myObject = new MyClass();
	myObject.set('myProperty', 'My String')
	ok(myObject.get('myProperty') == 'My String');
});

test('Class method can be called', function(){
	Class.define('MyClass', {
		myMethod: function(){return 'Return Value';}
	});
	var myObject = new MyClass();
	ok(myObject.call('myMethod') == 'Return Value');
});

test('Object method can be called magically by name', function(){
	Class.define('MyClass', {
		myMethod: function(){
			return 'My Value';
		}
	});
	var myObject = new MyClass();
	ok(myObject.myMethod() === 'My Value');
});

test('Single argument is passed to class method', function(){
	Class.define('MyClass', {
		myMethod: function(arg){
			return 'Your arg: ' + arg;
		}
	});
	var myObject = new MyClass();
	ok(myObject.myMethod('Something') == 'Your arg: Something');
});

test('Multiple arguments are passed to class method', function(){
	Class.define('MyClass', {
		myMethod: function(arg1, arg2, arg3){
			return [arg1, arg2, arg3];
		}
	});
	var myObject = new MyClass();
	var returnValue = myObject.myMethod('One', 'Two', 'Three');
	ok(returnValue[0] === 'One');
	ok(returnValue[1] === 'Two');
	ok(returnValue[2] === 'Three');
});

test('\'this\' keyword is bound to object within class method', function(){
	Class.define('MyClass', {
		myProperty: 'myValue',
		myMethod: function(){
			return this.get('myProperty');
		}
	});
	var myObject = new MyClass();
	ok(myObject.myMethod() == 'myValue');
});

test('New namespace is created if class name requires it', function(){
	Class.define('My.TestClass');
	ok(typeof My == 'object');
	ok(typeof My.TestClass == 'function');
});

test('Class is created within namespace if it already exists', function(){
	window.My = {};
	Class.define('My.TestClass');
	ok(typeof My == 'object');
	ok(typeof My.TestClass == 'function');
});

test('Classes can be subclassed using the Extends keyword', function(){
	Class.define('MyParent', {
		parentMethod: function(){return 'Returned from Parent';}
	});
	Class.define('MyChild', {
		Extends: MyParent
	});
	var myChild = new MyChild();
	ok(myChild.parentMethod() == 'Returned from Parent');
});

test('Child methods override parent methods', function(){
	Class.define('MyParent', {
		myMethod: function(){return 'Returned from Parent';}
	});
	Class.define('MyChild', {
		Extends: MyParent,
		myMethod: function(){return 'Returned from Child';}
	});
	var myChild = new MyChild();
	ok(myChild.myMethod() == 'Returned from Child');
});

test('Child methods can call overridden parent methods', function(){
	Class.define('MyParent', {
		myMethod: function(){return 'Returned from Parent';}
	});
	Class.define('MyChild', {
		Extends: MyParent,
		myMethod: function(){
			return this.parent.myMethod();
		}
	});
	var myChild = new MyChild();
	ok(myChild.myMethod() == 'Returned from Parent');
});

test('Child methods can call non overridden parent methods', function(){
	Class.define('MyParent', {
		myMethod: function(){return 'Returned from Parent';}
	});
	Class.define('MyChild', {
		Extends: MyParent,
		myOtherMethod: function(){
			return this.parent.myMethod();
		}
	});
	var myChild = new MyChild();
	ok(myChild.myOtherMethod() == 'Returned from Parent');
});

test('Child methods can call parent construct method', function(){
	Class.define('MyParent', {
		myProperty: null,
		construct: function(myProperty){
			this.set('myProperty', myProperty);
		}
	});
	Class.define('MyChild', {
		Extends: MyParent,
		construct: function(myProperty){
			this.parent.construct(myProperty);
		}
	});
	var myChild = new MyChild('My Value');
	ok(myChild.get('myProperty') == 'My Value');
});

test('Abstract classes cannot be instantiated', function(){
	Class.define('MyClass', {
		Abstract: true
	});
	raises(function(){
		var myObject = new MyClass();
	}, AbstractClassFatal);
});

test('Extending classes can implement abstract classes', function(){
	Class.define('MyParent', {
		Abstract: true,
		myProperty: 'myValue'
	});
	Class.define('MyChild', {
		Extends: MyParent
	});
	var myChild = new MyChild();
	ok(myChild.get('myProperty') == 'myValue');
});

test('Constructor method is called on instantiation', function(){
	Class.define('MyClass', {
		myProperty: undefined,
		construct: function(){
			this.set('myProperty', 'Some String');
		}
	});
	var myObject = new MyClass();
	ok(myObject.get('myProperty') == 'Some String');
});

test('Constructor arguments are passed to constuctor method', function(){
	Class.define('MyClass', {
		myProperty: undefined,
		construct: function(arg1, arg2, arg3){
			this.set('myProperty', [arg1, arg2, arg3]);
		}
	});
	var myObject = new MyClass('One', 'Two', 'Three');
	var returnValue = myObject.get('myProperty');
	ok(returnValue[0] == 'One');
	ok(returnValue[1] == 'Two');
	ok(returnValue[2] == 'Three');
});

test('Public properties can be accessed from inside of object', function(){
	Class.define('MyClass', {
		'public:myProperty': 'myValue',
		'public:myMethod': function(){
			return this.get('myProperty');
		}
	});
	var myObject = new MyClass();
	ok('myValue' == myObject.myMethod());
});

test('Public properties can be accessed from subclasses', function(){
	Class.define('MyParent', {
		'public:myProperty': 'myValue'
	});
	Class.define('MyChild', {
		Extends: MyParent,
		'public:myMethod': function(){
			return this.get('myProperty');
		}
	});
	var myChild = new MyChild();
	ok('myValue' == myChild.myMethod());
});

test('Public properties can be accessed from outside of object', function(){
	Class.define('MyClass', {
		'public:myProperty': 'myValue'
	});
	var myObject = new MyClass();
	ok('myValue' == myObject.get('myProperty'));
});

test('Protected properties can be accessed from inside of object', function(){
	Class.define('MyClass', {
		'protected:myProperty': 'myValue',
		'public:myMethod': function(){
			return this.get('myProperty');
		}
	});
	var myObject = new MyClass();
	ok('myValue' == myObject.myMethod());
});

test('Protected properties can be accessed from subclasses', function(){
	Class.define('MyClass', {
		'protected:myProperty': 'myValue'
	});
	Class.define('MySubClass', {
		Extends: MyClass,
		'public:myMethod': function(){
			return this.get('myProperty');
		}
	});
	var mySubObject = new MySubClass();
	ok('myValue' == mySubObject.myMethod());
});

test('Protected properties cannot be accessed from outside of object', function(){
	Class.define('MyClass', {
		'protected:myProperty': 'myValue'
	});
	var myObject = new MyClass();
	raises(function(){
		myObject.get('myProperty');
	}, ScopeFatal);
});

test('Private properties can be accessed from inside class', function(){
	Class.define('MyClass', {
		'private:myProperty': 'myValue',
		'public:myMethod': function(){
			return this.get('myProperty');
		}
	});
	var myObject = new MyClass();
	ok('myValue' == myObject.myMethod());
});

test('Private properties cannot be accessed from subclasses', function(){
	Class.define('MyParent', {
		'private:myProperty': 'myValue'
	});
	Class.define('MyChild', {
		Extends: MyParent,
		'public:myMethod': function(){
			return this.get('myProperty');
		}
	});
	var myChild = new MyChild();
	raises(function(){
		myChild.myMethod();
	}, ScopeFatal);
});

test('Private properties cannot be accessed from outside of object', function(){
	Class.define('MyClass', {
		'private:myProperty': 'myValue'
	});
	var myObject = new MyClass();
	raises(function(){
		myObject.get('myProperty');
	}, ScopeFatal);
});

test('Public methods can be accessed from inside of object', function(){
	Class.define('MyClass', {
		'public:myValueMethod': function(){
			return 'myValue';
		},
		'public:myAccessMethod': function(){
			return this.myValueMethod();
		}
	});
	var myObject = new MyClass();
	ok('myValue' == myObject.myAccessMethod());
});

test('Public methods can be accessed from subclasses', function(){
	Class.define('MyParent', {
		'public:myValueMethod': function(){
			return 'myValue';
		}
	});
	Class.define('MyChild', {
		Extends: MyParent,
		'public:myAccessMethod': function(){
			return this.myValueMethod();
		}
	});
	var myChild = new MyChild();
	ok('myValue' == myChild.myAccessMethod());
});

test('Public methods can be accessed from outside of object', function(){
	Class.define('MyClass', {
		'public:myValueMethod': function(){
			return 'myValue';
		}
	});
	var myObject = new MyClass();
	ok('myValue' == myObject.myValueMethod());
});

test('Protected methods can be accessed from inside of object', function(){
	Class.define('MyClass', {
		'protected:myValueMethod': function(){
			return 'myValue';
		},
		'public:myAccessMethod': function(){
			return this.myValueMethod();
		}
	});
	var myObject = new MyClass();
	ok('myValue' == myObject.myAccessMethod());
});

test('Protected methods can be accessed from subclasses', function(){
	Class.define('MyParent', {
		'protected:myValueMethod': function(){
			return 'myValue';
		}
	});
	Class.define('MyChild', {
		Extends: MyParent,
		'public:myAccessMethod': function(){
			return this.myValueMethod();
		}
	});
	var myChild = new MyChild();
	ok('myValue' == myChild.myAccessMethod());
});

test('Protected methods cannot be accessed from outside of object', function(){
	Class.define('MyClass', {
		'protected:myValueMethod': function(){
			return 'myValue';
		}
	});
	var myObject = new MyClass();
	raises(function(){
		myObject.myValueMethod();
	}, ScopeFatal);
});

test('Private methods can be accessed from inside class', function(){
	Class.define('MyClass', {
		'private:myValueMethod': function(){
			return 'myValue';
		},
		'public:myAccessMethod': function(){
			return this.myValueMethod();
		}
	});
	var myObject = new MyClass();
	ok('myValue' == myObject.myAccessMethod());
});

test('Private methods cannot be accessed from subclasses', function(){
	Class.define('MyParent', {
		'private:myValueMethod': function(){
			return 'myValue';
		}
	});
	Class.define('MyChild', {
		Extends: MyParent,
		'public:myAccessMethod': function(){
			return this.myValueMethod();
		}
	});
	var myChild = new MyChild();
	raises(function(){
		myChild.myAccessMethod();
	}, ScopeFatal);
});

test('Private methods cannot be accessed from outside of object', function(){
	Class.define('MyClass', {
		'private:myValueMethod': function(){
			return 'myValue';
		}
	});
	var myObject = new MyClass();
	raises(function(){
		myObject.myValueMethod();
	}, ScopeFatal);
});

test('Interface can be defined', function(){
	Interface.define('MyInterface');
	ok(typeof MyInterface != 'undefined');
});

test('Interface cannot be instantiated', function(){
	Interface.define('MyInterface');
	raises(function(){
		var myInterface = new MyInterface();
	}, CannotInstantiateInterfaceFatal);
});

test('Class can implement interface using keyword Implements', function(){
	Interface.define('MyInterface');
	Class.define('MyClass', {
		Implements: MyInterface
	});
	var myObject = new MyClass();
	ok(myObject instanceof MyClass);
});

test('Interface definition can specify array of methods', function(){
	Interface.define('MyInterface', [
		'myMethod()',
		'myOtherMethod(myArgument)'
	]);
	ok(typeof MyInterface != 'undefined');
});

test('Interface must have brackets after method name', function(){
	raises(function(){
		Interface.define('MyInterface', [
			'myMethod'
		]);
	}, InterfaceIncorrectlyDefinedFatal);
});

test('Class cannot be instantiated without interface methods', function(){
	Interface.define('MyInterface', [
		'myMethod()',
		'myOtherMethod()'
	]);
	Class.define('MyClass', {
		Implements: MyInterface
	});
	raises(function(){
		var myObject = new MyClass();
	}, InterfaceMethodNotImplementedFatal);
});

test('Class can be instantiated with interface methods', function(){
	Interface.define('MyInterface', [
		'myMethod()',
		'myOtherMethod()'
	]);
	Class.define('MyClass', {
		Implements: MyInterface,
		myMethod: function(){},
		myOtherMethod: function(){}
	});
	var myObject = new MyClass();
	ok(myObject instanceof MyClass);
});

test('Class must have arguments which match interface arguments', function(){
	Interface.define('MyInterface', [
		'myMethod(myArgument)',
		'myOtherMethod(arg1, arg2)'
	]);
	Class.define('MyClass', {
		Implements: MyInterface,
		myMethod: function(){},
		myOtherMethod: function(){}
	});
	Class.define('OtherClass', {
		Implements: MyInterface,
		myMethod: function(myArgument){},
		myOtherMethod: function(arg1, arg2){}
	});
	raises(function(){
		var myObject = new MyClass();
	}, InterfaceMethodNotImplementedFatal);
	var otherObject = new OtherClass();
	ok(otherObject instanceof OtherClass);
});

test('Object is instanceof interface', function(){
	Interface.define('MyInterface');
	Class.define('MyClass', {
		Implements: MyInterface
	});
	var myObject = new MyClass();
	ok(myObject.instanceOf(MyInterface));
});

test('Object is not instanceOf interface if not implemented', function(){
	Interface.define('MyInterface');
	Class.define('MyClass');
	var myObject = new MyClass();
	ok(!myObject.instanceOf(MyInterface));
});

test('Object is instanceof class', function(){
	Class.define('MyClass');
	var myObject = new MyClass();
	ok(myObject.instanceOf(MyClass));
});

test('Object is instanceof root Class', function(){
	Class.define('MyClass');
	var myObject = new MyClass();
	ok(myObject.instanceOf(Class));
});

test('Object is not instanceof other class', function(){
	Class.define('MyClass');
	Class.define('OtherClass');
	var myObject = new MyClass();
	ok(!myObject.instanceOf(OtherClass));
});

test('Object is instanceof parent class', function(){
	Class.define('MyParent');
	Class.define('MyChild', {
		Extends: MyParent
	});
	var myObject = new MyChild();
	ok(myObject.instanceOf(MyChild));
	ok(myObject.instanceOf(MyParent));
});

test('Call to unknown method is dispatched to call if present', function(){
	Class.define('MyClass', {
		'call': function(){
			return 'From Call';
		}
	})
	var myObject = new MyClass();
	ok('From Call' == myObject.call('invalidMethod'));
});

test('Call to overload method passes method name as first argument', function(){
	Class.define('MyClass', {
		'call': function(method){
			return method;
		}
	})
	var myObject = new MyClass();
	ok('invalidMethod' == myObject.call('invalidMethod'));
});

test('Call to overload method passes other arguments as array', function(){
	Class.define('MyClass', {
		'call': function(method, arguments){
			return arguments;
		}
	})
	var myObject = new MyClass();
	var returnValue = myObject.call('invalidMethod', 'One', 'Two', 'Three');
	ok(returnValue[0] === 'One');
	ok(returnValue[1] === 'Two');
	ok(returnValue[2] === 'Three');
});

test('Parent object methods can be called magically on child', function(){
	Class.define('MyParent', {
		'myMethod': function(){ return 'Returned from parent class'; }
	});
	Class.define('MyChild', {
		Extends: MyParent
	});
	var myObject = new MyChild();
	ok('Returned from parent class' === myObject.myMethod());
});

test('Instances of same class can have different property values', function(){
	Class.define('MyClass', {
		myProperty: null
	});
	var myObject1 = new MyClass();
	var myObject2 = new MyClass();
	ok(myObject1.get('myProperty') === null);
	ok(myObject2.get('myProperty') === null);
	myObject1.set('myProperty', 'My Value');
	ok(myObject1.get('myProperty') === 'My Value');
	ok(myObject2.get('myProperty') === null);
	myObject2.set('myProperty', 'My Other Value');
	ok(myObject1.get('myProperty') === 'My Value');
	ok(myObject2.get('myProperty') === 'My Other Value');
});

test('Object properties are not persisted between instantiations', function(){
	Class.define('MyClass', {
		myProperty: {}
	});
	var myObject = new MyClass();
	var myProperty = myObject.get('myProperty');
	myProperty.key = 'value';
	myObject = null;
	myObject = new MyClass();
	ok(typeof myObject.get('myProperty').key == 'undefined');
});

test('Object can be cloned and values can be set independently', function(){
	Class.define('MyClass', {
		myProperty: null
	});
	var myObject = new MyClass();
	myObject.set('myProperty', 'My Value');
	var otherObject = myObject.clone();
	otherObject.set('myProperty', 'Other Value');
	ok(myObject.get('myProperty') === 'My Value');
	ok(otherObject.get('myProperty') === 'Other Value');
});

test('Cloned object has higher ID', function(){
	Class.define('MyClass', {
		myProperty: null
	});
	var myObject = new MyClass();
	var otherObject = myObject.clone();
	ok(myObject.id < otherObject.id);
});

test('Objects can implement toString method', function(){
	Class.define('MyClass', {
		toString: function(){
			return 'Instance of MyClass';
		}
	});
	var myObject = new MyClass();
	ok(myObject.toString() === 'Instance of MyClass');
});

test('Objects that do not implement toString behave normally', function(){
	Class.define('MyClass');
	var myObject = new MyClass();
	ok(myObject.toString() === '[object Object]');
});

test('Child objects inherit parent toString method', function(){
	Class.define('MyParent', {
		toString: function(){return '[object MyObject]';}
	});
	Class.define('MyChild', {
		Extends: MyParent
	});
	var myChild = new MyChild();
	ok(myChild.toString() == '[object MyObject]');
});

test('Class can require a file', function(){
	Class.define('MyClass', {
		Require: 'includes/File-5ft78s.js'
	});
	ok(true);
});

test('Required file is included in the DOM on class declaration', function(){
	Class.define('MyClass', {
		Require: 'includes/File-7dgh20.js'
	});
	var scripts = document.getElementsByTagName('script');
	delete scripts.length;
	for (var i in scripts) {
		if (!scripts.hasOwnProperty(i)) continue;
		var script = scripts[i].src;
		if (script.substr(script.length - 14) == 'File-7dgh20.js') {
			ok(true);
			return;
		}
	}
});

asyncTest('Required file is included before class is instantiated', function(){
	Class.define('MyClass', {
		Require: 'includes/File-s8ay12.js',
		construct: function(){
			ok(typeof s8ay12 != 'undefined');
			start();
		}
	});
	var myObject = new MyClass();
});

test('File will not be re-included if required multiple times', function(){
	Class.define('MyClass', {
		Require: 'includes/File-3fb5gb.js'
	});
	Class.define('MyOtherClass', {
		Require: 'includes/File-3fb5gb.js'
	});
	var count = 0;
	var scripts = document.getElementsByTagName('script');
	delete scripts.length;
	for (var i in scripts) {
		if (!scripts.hasOwnProperty(i)) continue;
		var script = scripts[i].src;
		if (script.substr(script.length - 14) == 'File-3fb5gb.js') {
			count++
		}
	}
	ok(count == 1);
});

test('Multiple required files are included in the DOM on class declaration', function(){
	Class.define('MyClass', {
		Require: [
			'includes/File-p9s8ch.js',
			'includes/File-vdf5v8.js'
		]
	});
	var p9s8chExists = false;
	var vdf5v8Exists = false;
	var scripts = document.getElementsByTagName('script');
	delete scripts.length;
	for (var i in scripts) {
		if (!scripts.hasOwnProperty(i)) continue;
		var script = scripts[i].src;
		if (script.substr(script.length - 14) == 'File-p9s8ch.js') {
			p9s8chExists = true;
		}
		if (script.substr(script.length - 14) == 'File-vdf5v8.js') {
			vdf5v8Exists = true;
		}
	}
	ok(p9s8chExists && vdf5v8Exists);
});

/*test('CSS file is included in the DOM on class declaration', function(){
	Class.define('MyClass', {
		Require: 'includes/File-cd7hsa.css'
	});
	var links = document.getElementsByTagName('link');
	delete links.length;
	for (var i in links) {
		if (!links.hasOwnProperty(i)) continue;
		if (links[i].rel != 'stylesheet') continue;
		var link = links[i].href;
		if (link.substr(link.length - 15) == 'File-cd7hsa.css') {
			ok(true);
			return;
		}
	}
});

test('JPEG file is included in the DOM on class declaration', function(){
	Class.define('MyClass', {
		Require: 'includes/File-asedi8.jpg'
	});
	var images = document.getElementsByTagName('img');
	delete images.length;
	for (var i in images) {
		if (!images.hasOwnProperty(i)) continue;
		var image = images[i].src;
		if (image.substr(image.length - 15) == 'File-asedi8.jpg') {
			ok(true);
			return;
		}
	}
});*/

test('Class can be required', function(){
	Class.define('MyClass', {
		Require: 'My.Test.sd8uds'
	});
	var scripts = document.getElementsByTagName('script');
	delete scripts.length;
	for (var i in scripts) {
		if (!scripts.hasOwnProperty(i)) continue;
		var script = scripts[i].src;
		if (script.substr(script.length - 17) == 'My/Test/sd8uds.js') {
			ok(true);
			return;
		}
	}
});

test('Folder pattern matching can be set up for required classes', function(){
	Class.addClassAutoloadPattern('Test', 'subfolder');
	Class.define('MyClass', {
		Require: 'Test.p9c88c'
	});
	var scripts = document.getElementsByTagName('script');
	delete scripts.length;
	for (var i in scripts) {
		if (!scripts.hasOwnProperty(i)) continue;
		var script = scripts[i].src;
		if (script.substr(script.length - 19) == 'subfolder/p9c88c.js') {
			ok(true);
			return;
		}
	}
});

test('Multiple folder patterns can be set up for required classes', function(){
	Class.addClassAutoloadPattern('Test', 'subfolder');
	Class.addClassAutoloadPattern('Test.OtherTest', 'other/subfolder');
	Class.define('MyClass', {
		Require: [
			'Test.d46fvb',
			'Test.OtherTest.Example.ch732m'
		]
	});
	var d46fvbExists = false;
	var ch732mExists = false;
	var scripts = document.getElementsByTagName('script');
	delete scripts.length;
	for (var i in scripts) {
		if (!scripts.hasOwnProperty(i)) continue;
		var script = scripts[i].src;
		if (script.substr(script.length - 19) == 'subfolder/d46fvb.js') {
			d46fvbExists = true;
		}
		if (script.substr(script.length - 33) == 'other/subfolder/Example/ch732m.js') {
			ch732mExists = true;
		}
	}
	ok(d46fvbExists && ch732mExists);
});

test('Longest matching pattern is used to include class', function(){
	Class.addClassAutoloadPattern('My', 'folder1');
	Class.addClassAutoloadPattern('My.Test.Class', 'folder2');
	Class.addClassAutoloadPattern('My.Test', 'folder3');
	Class.define('MyClass', {
		Require: 'My.Test.Class.4rfc8u'
	});
	var scripts = document.getElementsByTagName('script');
	delete scripts.length;
	for (var i in scripts) {
		if (!scripts.hasOwnProperty(i)) continue;
		var script = scripts[i].src;
		if (script.substr(script.length - 17) == 'folder2/4rfc8u.js') {
			ok(true);
			return;
		}
	}
});

test('Folder pattern matching can be set up for required files', function(){
	Class.addFolderAutoloadPattern('Test', 'subfolder');
	Class.define('MyClass', {
		Require: 'Test/4fcf9a.js'
	});
	var scripts = document.getElementsByTagName('script');
	delete scripts.length;
	for (var i in scripts) {
		if (!scripts.hasOwnProperty(i)) continue;
		var script = scripts[i].src;
		if (script.substr(script.length - 19) == 'subfolder/4fcf9a.js') {
			ok(true);
			return;
		}
	}
});

test('Multiple folder patterns can be set up for required files', function(){
	Class.addFolderAutoloadPattern('Test', 'subfolder');
	Class.addFolderAutoloadPattern('Test/OtherTest', 'other/subfolder');
	Class.define('MyClass', {
		Require: [
			'Test/f54dh4.js',
			'Test/OtherTest/Example/gpodlk.js'
		]
	});
	var f54dh4Exists = false;
	var gpodlkExists = false;
	var scripts = document.getElementsByTagName('script');
	delete scripts.length;
	for (var i in scripts) {
		if (!scripts.hasOwnProperty(i)) continue;
		var script = scripts[i].src;
		if (script.substr(script.length - 19) == 'subfolder/f54dh4.js') {
			f54dh4Exists = true;
		}
		if (script.substr(script.length - 33) == 'other/subfolder/Example/gpodlk.js') {
			gpodlkExists = true;
		}
	}
	ok(f54dh4Exists && gpodlkExists);
});

test('Longest matching pattern is used to include file', function(){
	Class.addFolderAutoloadPattern('My', 'folder1');
	Class.addFolderAutoloadPattern('My/Test/Script', 'folder2');
	Class.addFolderAutoloadPattern('My/Test', 'folder3');
	Class.define('MyClass', {
		Require: 'My/Test/Script/ftr56h.js'
	});
	var scripts = document.getElementsByTagName('script');
	delete scripts.length;
	for (var i in scripts) {
		if (!scripts.hasOwnProperty(i)) continue;
		var script = scripts[i].src;
		if (script.substr(script.length - 17) == 'folder2/ftr56h.js') {
			ok(true);
			return;
		}
	}
});

test('Loaded classes can be declared and will not be auto loaded in future', function(){
	Class.registerLoadedClass('Pre.Loaded.Class.3fg9xh');
	Class.define('MyClass', {
		Require: 'Pre.Loaded.Class.3fg9xh'
	});
	var scripts = document.getElementsByTagName('script');
	delete scripts.length;
	for (var i in scripts) {
		if (!scripts.hasOwnProperty(i)) continue;
		var script = scripts[i].src;
		if (script.substr(script.length - 14) == 'Pre/Loaded/Class/3fg9xh.js') {
			ok(false);
			return;
		}
	}
	ok(true);
});

/**
 * @todo...
 * 
 * Handle failures?
 * Ensure delayed methods are run in order
 * Ensure leading and trailing slashes in folder patterns are handled
 */

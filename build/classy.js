if (!Object.create) {
	Object.create = (function(){
		function F(){}
		return function(o){
			if (arguments.length != 1) {
				throw new Error('Object.create implementation only accepts one parameter.');
			}
			F.prototype = o;
			return new F()
		}
	})()
}

(function(_){
	
	_.Fatal = {};
	
	_.Fatal.getFatal = function(name, messages){
		
		var fatal = function(messageKey, detailMessage){
			this.code = messageKey;
			this.message = messages[messageKey];
			if (detailMessage) this.message = this.message + ' (' + detailMessage + ')';
			this.stack = Error().stack;
		};
		
		fatal.prototype = Object.create(Error.prototype);
		fatal.prototype.name = 'Fatal Error: ' + name;
		
		return fatal;
		
	};
	
})(window.ClassyJS = window.ClassyJS || {});

(function(_){
	
	_.NamespaceManager = function(){};
	
	_.NamespaceManager.prototype.getNamespaceObject = function(name)
	{
		// @todo Verify name is string
		return getObjectFromString(name);
	};
	
	_.NamespaceManager.prototype.registerClassFunction = function(name, constructor)
	{
		// @todo Check constructor is function
		var namespaceParts = name.split('.');
		var className = namespaceParts.pop();
		var namespace = namespaceParts.join('.');
		if (namespace != '') ensureNamespaceExists(namespace);
		namespace = getObjectFromString(namespace);
		// @todo Check namespace[className] isn't some other type
		if (typeof namespace[className] == 'object') {
			var downstreamProperties = {};
			for (var i in namespace[className]) {
				downstreamProperties[i] = namespace[className][i];
			}
		}
		namespace[className] = constructor;
		if (typeof downstreamProperties) {
			for (var i in downstreamProperties) {
				namespace[className][i] = downstreamProperties[i];
			}
		}
	};
	
	var getObjectFromString = function(name)
	{
		if (name == '') return window;
		var nameParts = name.split('.');
		var namespace = window;
		for (var i = 0; i < nameParts.length; i++) {
			if (typeof namespace[nameParts[i]] == 'undefined') {
				throw new _.NamespaceManager.Fatal('NAMESPACE_OBJECT_DOES_NOT_EXIST');
			}
			namespace = namespace[nameParts[i]];
			if (i == nameParts.length - 1) return namespace;
		}
	};
	
	var ensureNamespaceExists = function(name)
	{
		var nameParts = name.split('.');
		var namespace = window;
		for (var i in nameParts) {
			if (typeof namespace[nameParts[i]] == 'undefined') {
				namespace[nameParts[i]] = {};
			}
			namespace = namespace[nameParts[i]];
		}
	};
	
})(window.ClassyJS = window.ClassyJS || {});

(function(_){
	
	_.TypeChecker = function(){};
	
	_.TypeChecker.prototype.isValidType = function(value, type)
	{
		if (typeof type != 'string') {
			throw new _.TypeChecker.Fatal('NON_STRING_TYPE_IDENTIFIER');
		}
		if (Object.prototype.toString.call(value) == '[object Array]') {
			var match = type.match(/^\[(.+)\]$/);
			if (match) {
				for (var i in value) if (!this.isValidType(value[i], match[1])) return false;
				return true;
			}
			return (type == 'array');
		}
		if (value === null) return (type == 'null');
		if (typeof value == type) return true;
		var typeParts = type.split('.');
		var namespace = window;
		do {
			var nextTypePart = typeParts.shift();
			if (typeof namespace[nextTypePart] == 'undefined') return false;
			namespace = namespace[nextTypePart];
		} while (typeParts.length);
		return value instanceof namespace;
	};
	
	_.TypeChecker.prototype.areValidTypes = function(values, types)
	{
		if (Object.prototype.toString.call(values) != '[object Array]') {
			throw new _.TypeChecker.Fatal(
				'NON_ARRAY_VALUES',
				'Provided type: ' + typeof values
			);
		}
		if (Object.prototype.toString.call(types) != '[object Array]') {
			throw new _.TypeChecker.Fatal(
				'NON_ARRAY_TYPES',
				'Provided type: ' + typeof types
			);
		}
		if (values.length != types.length) {
			throw new _.TypeChecker.Fatal(
				'VALUE_TYPE_MISMATCH',
				'Values length: ' + values.length + ', Types length: ' + types.length
			);
		}
		for (var i = 0; i < values.length; i++) {
			if (!this.isValidType(values[i], types[i])) return false;
		}
		return true;
	};
	
})(window.ClassyJS = window.ClassyJS || {});

;(function(ClassyJS, _){
	
	var messages = {
		NON_STRING_TYPE_IDENTIFIER:	'Provided type identifier must be a string',
		NON_ARRAY_VALUES:			'Provided values must be within an array',
		NON_ARRAY_TYPES:			'Provided type identifiers must be within an array',
		VALUE_TYPE_MISMATCH:		'Provided values must match length of provided type identifiers'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('TypeChecker.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.TypeChecker = window.ClassyJS.TypeChecker || {}
);

;(function(ClassyJS, _){
	
	_.Type = function(level)
	{
		if (typeof level != 'string') {
			throw new _.Type.Fatal('NON_STRING_IDENTIFIER');
		}
		if (['public', 'protected', 'private'].indexOf(level) == -1) {
			throw new _.Type.Fatal('INVALID_IDENTIFIER');
		}
		this._level = level;
	};
	
	_.Type.prototype.childAllowed = function()
	{
		return (this._level != 'private');
	};
	
	_.Type.prototype.allAllowed = function()
	{
		return (this._level == 'public');
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Access = window.ClassyJS.Access || {}
);

;(function(ClassyJS, Access, _){
	
	var messages = {
		NON_STRING_IDENTIFIER:	'Provided identifier must be a string',
		INVALID_IDENTIFIER:		'Provided identifier must be one of ' +
			'\'public\', \'protected\' or \'private\''
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Access.Type.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Access = window.ClassyJS.Access || {},
	window.ClassyJS.Access.Type = window.ClassyJS.Access.Type || {}
);

;(function(ClassyJS, _){
	
	_.Controller = function(){};
	
	_.Controller.prototype.canAccess = function(){ return true; };
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Access = window.ClassyJS.Access || {}
);

(function(ClassyJS, _){
	
	_.Class = function(definition, typeRegistry, memberRegistry, namespaceManager)
	{
		if (!(definition instanceof ClassyJS.Type.Class.Definition)) {
			throw new _.Class.Fatal(
				'NO_DEFINITION_PROVIDED',
				'Provided type: ' + typeof definition
			);
		}
		if (!(typeRegistry instanceof ClassyJS.Registry.Type)) {
			throw new _.Class.Fatal(
				'NO_TYPE_REGISTRY_PROVIDED',
				'Provided type: ' + typeof typeRegistry
			);
		}
		if (!(memberRegistry instanceof ClassyJS.Registry.Member)) {
			throw new _.Class.Fatal(
				'NO_MEMBER_REGISTRY_PROVIDED',
				'Provided type: ' + typeof memberRegistry
			);
		}
		if (!(namespaceManager instanceof ClassyJS.NamespaceManager)) {
			throw new _.Class.Fatal(
				'NO_NAMESPACE_MANAGER_PROVIDED',
				'Provided type: ' + typeof namespaceManager
			);
		}
		this._definition = definition;
		this._typeRegistry = typeRegistry;
		this._memberRegistry = memberRegistry;
		this._namespaceManager = namespaceManager;
	};
	
	_.Class.prototype.getName = function()
	{
		return this._definition.getName();
	};
	
	_.Class.prototype.isExtension = function()
	{
		return this._definition.isExtension();
	};
	
	_.Class.prototype.getParentClass = function()
	{
		if (!this.isExtension()) throw new _.Class.Fatal('NO_PARENT_CLASS_RELATIONSHIP');
		return this._typeRegistry.getClass(
			this._namespaceManager.getNamespaceObject(
				this._definition.getParentClass()
			)
		);
	};
	
	_.Class.prototype.getInterfaces = function()
	{
		// @todo Not tested method
		var interfaces = [];
		var interfaceNames = this._definition.getInterfaces();
		for (var i in interfaceNames) {
			interfaces.push(this._typeRegistry.getInterface(interfaceNames[i]));
		}
		return interfaces;
	};
	
	_.Class.prototype.requestInstantiation = function()
	{
		if (this._definition.isAbstract()) {
			throw new ClassyJS.Type.Class.Fatal('CANNOT_INSTANTIATE_ABSTRACT_CLASS');
		}
		if (this._memberRegistry.hasAbstractMembers(this)) {
			throw new ClassyJS.Type.Class.Fatal('CANNOT_INSTANTIATE_CLASS_WITH_ABSTRACT_MEMBERS');
		}
		if (this._memberRegistry.hasUnimplementedInterfaceMembers(this)) {
			throw new ClassyJS.Type.Class.Fatal(
				'CANNOT_INSTANTIATE_CLASS_WITH_UNIMPLEMENTED_INTERFACE_MEMBERS'
			);
		}
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {}
);

;(function(ClassyJS, Type, _){
	
	_.Constructor = function(typeRegistry, memberRegistry, fullClassName)
	{
		
		// @todo Type check class registry
		
		var classNameParts = fullClassName.split('.');
		var className = classNameParts.pop();
		var namespace = {};
		
		for (var i in classNameParts) {
			if (typeof namespace[classNameParts[i]] == 'undefined') {
				namespace[classNameParts[i]] = {};
			}
			namespace = namespace[classNameParts[i]];
			if (typeof rootNamespaceName == 'undefined') {
				var rootNamespaceName = classNameParts[i];
				var rootNamespaceValue = namespace;
			}
		}
		
		var Class = function()
		{
			
			/**
			 * Check can be instantiated (here??)
			 * 		Note that isAbstract should tell us if it's either explicit
			 * 		or implicit abstract. We shouldn't worry about whether the
			 * 		created instance obeys interface / abstract member rules - if
			 * 		the class isn't abstract, its valid (I think).
			 * Create parent and all ancestors
			 * If this is the instantiated one, register all instances in type registry
			 * Create dummy methods for all methods, constants and poss properties
			 */
			
			var classObject = typeRegistry.getClass(this)
			
			classObject.requestInstantiation();
			
			var properties = [];
			var methods = [];
			
			_appendMemberNames(properties, methods, classObject);
			
			if (typeRegistry.hasParent(classObject)) {
				
				var parentConstructors = [];
				var childObject = classObject;
				var childConstructor = namespace[className];
				
				while (typeRegistry.hasParent(childObject)) {
					childObject = typeRegistry.getParent(childObject);
					childConstructor = typeRegistry.getParent(childConstructor);
					parentConstructors.push(childConstructor);
					_appendMemberNames(properties, methods, childObject);
				}
				
				var parentObjects = [];
				
				for (var i = 0; i < parentConstructors.length; i++) {
					parentObjects[i] = new parentConstructors[i]();
				}
				
				parentObjects.unshift(this);
				
				typeRegistry.registerClassInstance(parentObjects);
				
			}
			
			for (var i in properties) {
				var name = properties[i];
				this[name] = (function(name){
					return function(value){
						if (typeof value != 'undefined') {
							return this.set(name, value);
						} else {
							return this.get(name);
						} 
					};
				})(name);
			}
			
			for (var i in methods) {
				var name = methods[i];
				this[name] = (function(name){
					return function(){
						return memberRegistry.callMethod(
							this,
							{},
							name,
							Array.prototype.slice.call(arguments, 0)
						);
					};
				})(name);
			}
			
			if (this.construct) {
				this.construct.apply(this, Array.prototype.slice.call(arguments, 0));
			}
			
		};
		
		if (typeof rootNamespaceName != 'undefined') {
			eval('var ' + rootNamespaceName + ' = rootNamespaceValue');
			eval(fullClassName + ' = ' + Class.toString());
		} else {
			eval('var ' + className + ' = ' + Class.toString());
			namespace[className] = eval(className);
		}
		
		namespace[className].prototype.get = function(name)
		{
			return memberRegistry.getPropertyValue(this, {}, name);
		};
		
		namespace[className].prototype.set = function(name, value)
		{
			memberRegistry.setPropertyValue(this, {}, name, value);
		};
		
		namespace[className].prototype.bind = function(name, targetMethod)
		{
			memberRegistry.bindEvent(this, name, arguments.callee.caller.$$owner, targetMethod);
		};
		
		namespace[className].prototype.trigger = function(name, arguments)
		{
			memberRegistry.triggerEvent(this, name, arguments);
		};
		
		namespace[className].prototype.conformsTo = function(interfaceName)
		{
			var interfaces = typeRegistry.getInterfacesFromClass(typeRegistry.getClass(this));
			for (var i in interfaces) if (interfaces[i].getName() == interfaceName) return true;
			return false;
		};
		
		var _appendMemberNames = function(properties, methods, classObject)
		{
			var members = memberRegistry.getMembers(classObject);
			for (var i in members) {
				if (members[i] instanceof ClassyJS.Member.Property) {
					properties.push(members[i].getName());
				} else if (members[i] instanceof ClassyJS.Member.Method) {
					methods.push(members[i].getName());
				}
			}
		};
		
		return namespace[className];
		
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.Class = window.ClassyJS.Type.Class || {}
);

;(function(ClassyJS, Type, Class, _){
	
	var messages = {
		ABSTRACT_CLASS_CANNOT_BE_INSTANTIATED: 'Abstract class cannot be instantiated'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Type.Class.Constructor.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.Class = window.ClassyJS.Type.Class || {},
	window.ClassyJS.Type.Class.Constructor = window.ClassyJS.Type.Class.Constructor || {}
);

;(function(ClassyJS, Type, _){
	
	_.Definition = function(signature)
	{
		if (typeof signature != 'string') {
			throw new _.Definition.Fatal(
				'NON_STRING_SIGNATURE',
				'Provided type: ' + typeof signature
			);
		}
		if (!signature.match(/\bclass\b/)) throw new _.Definition.Fatal('MISSING_KEYWORD_CLASS');
		var signatureRegex = new RegExp(
			'^(?:\\s+)?(?:(abstract)\\s+)?class\\s+([A-Z][A-Za-z0-9.]*)' +
			'(?:\\s+extends\\s+([A-Z][A-Za-z0-9.]*))?' +
			'(?:\\s+implements\\s+([A-Z][A-Za-z0-9., \\t]*))?(?:\\s+)?$'
		);
		var signatureMatch = signatureRegex.exec(signature);
		if (!signatureMatch) {
			throw new _.Definition.Fatal('SIGNATURE_NOT_RECOGNISED');
		}
		this._isAbstract = (signatureMatch[1]) ? true : false;
		this._name = signatureMatch[2];
		this._parent = signatureMatch[3];
		this._interfaces = (signatureMatch[4]) ? signatureMatch[4].replace(/\s+/g, '').split(',') : [];
	};
	
	_.Definition.prototype.getName = function()
	{
		return this._name;
	};
	
	_.Definition.prototype.isAbstract = function()
	{
		return this._isAbstract;
	};
	
	_.Definition.prototype.isExtension = function()
	{
		return (this._parent) ? true : false;
	};
	
	_.Definition.prototype.getParentClass = function()
	{
		return this._parent;
	};
	
	_.Definition.prototype.getInterfaces = function()
	{
		return this._interfaces;
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.Class = window.ClassyJS.Type.Class || {}
);

;(function(ClassyJS, Type, Class, _){
	
	var messages = {
		NON_STRING_SIGNATURE:		'Signature must be provided as a string',
		MISSING_KEYWORD_CLASS:		'Signature does not contain keywork \'class\'',
		SIGNATURE_NOT_RECOGNISED:	'Provided signature could not be understood'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Type.Class.Definition.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.Class = window.ClassyJS.Type.Class || {},
	window.ClassyJS.Type.Class.Definition = window.ClassyJS.Type.Class.Definition || {}
);

;(function(ClassyJS, Type, Class, _){
	
	_.Factory = function(){};
	
	_.Factory.prototype.build = function(signature)
	{
		return new _(signature);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.Class = window.ClassyJS.Type.Class || {},
	window.ClassyJS.Type.Class.Definition = window.ClassyJS.Type.Class.Definition || {}
);

(function(ClassyJS, Type, _){
	
	_.Factory = function(){};
	
	_.Factory.prototype.build = function(definition, typeRegistry, memberRegistry, namespaceManager)
	{
		return new _(definition, typeRegistry, memberRegistry, namespaceManager);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.Class = window.ClassyJS.Type.Class || {}
);

;(function(ClassyJS, Type, _){
	
	var messages = {
		NO_DEFINITION_PROVIDED:
			'An instance of ClassyJS.Type.Class.Definition must be provided to the constructor',
		NO_TYPE_REGISTRY_PROVIDED:
			'An instance of ClassyJS.Registry.Type must be provided to the constructor',
		NO_MEMBER_REGISTRY_PROVIDED:
			'An instance of ClassyJS.Registry.Member must be provided to the constructor',
		NO_NAMESPACE_MANAGER_PROVIDED:
			'An instance of ClassyJS.NamespaceManager must be provided to the constructor',
		NO_PARENT_CLASS_RELATIONSHIP:
			'Parent class was requested when no parent relationship exists',
		CANNOT_INSTANTIATE_ABSTRACT_CLASS:
			'Cannot instantiate a class marked explicitly as abstract',
		CANNOT_INSTANTIATE_CLASS_WITH_ABSTRACT_MEMBERS:
			'Cannot instantiate a class which contains abstract members',
		CANNOT_INSTANTIATE_CLASS_WITH_UNIMPLEMENTED_INTERFACE_MEMBERS:
			'Cannot instantiate a class with unimplemented interface members'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Type.Class.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.Class = window.ClassyJS.Type.Class || {}
);

(function(ClassyJS, _){
	
	_.Interface = function(definition)
	{
		this._definition = definition;
	};
	
	_.Interface.prototype.getName = function()
	{
		return this._definition.getName();
	}
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {}
);

;(function(TypeDefinition, Type, _){
	
	_.Definition = function(signature)
	{
		if (typeof signature != 'string') {
			throw new _.Definition.Fatal(
				'NON_STRING_SIGNATURE',
				'Provided type: ' + typeof signature
			);
		}
		if (!signature.match(/\binterface\b/)) {
			throw new _.Definition.Fatal('MISSING_KEYWORD_INTERFACE');
		}
		var signatureRegex = new RegExp(
			'^(?:\\s+)?interface(?:\\s+)?([A-Z](?:[A-Za-z0-9.]*)?)(?:\\s+)?$'
		);
		var signatureMatch = signatureRegex.exec(signature);
		if (!signatureMatch) {
			throw new _.Definition.Fatal('SIGNATURE_NOT_RECOGNISED');
		}
		this._name = signatureMatch[1];
	};
	
	_.Definition.prototype.getName = function()
	{
		return this._name;
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.Interface = window.ClassyJS.Type.Interface || {}
);

;(function(ClassyJS, Type, Interface, _){
	
	var messages = {
		NON_STRING_SIGNATURE:		'Signature must be provided as a string',
		MISSING_KEYWORD_INTERFACE:	'Signature does not contain keywork \'interface\'',
		SIGNATURE_NOT_RECOGNISED:	'Provided signature could not be understood'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Type.Interface.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.Interface = window.ClassyJS.Type.Interface || {},
	window.ClassyJS.Type.Interface.Definition = window.ClassyJS.Type.Interface.Definition || {}
);

;(function(ClassyJS, Type, Interface, _){
	
	_.Factory = function(){};
	
	_.Factory.prototype.build = function(signature)
	{
		return new _(signature);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.Interface = window.ClassyJS.Type.Interface || {},
	window.ClassyJS.Type.Interface.Definition = window.ClassyJS.Type.Interface.Definition || {}
);

(function(ClassyJS, Type, _){
	
	_.Factory = function(){};
	
	_.Factory.prototype.build = function(definition)
	{
		return new _(definition);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.Interface = window.ClassyJS.Type.Interface || {}
);

(function(ClassyJS, _){
	
	_.Factory = function(
		typeDefinitionFactory,
		classFactory,
		interfaceFactory,
		typeRegistry,
		memberRegistry,
		namespaceManager
	)
	{
		if (!(typeDefinitionFactory instanceof ClassyJS.Type.DefinitionFactory)) {
			throw new _.Factory.Fatal(
				'NO_DEFINITION_FACTORY_PROVIDED',
				'Provided type: ' + typeof typeDefinitionFactory
			);
		}
		if (!(classFactory instanceof ClassyJS.Type.Class.Factory)) {
			throw new _.Factory.Fatal(
				'NO_CLASS_FACTORY_PROVIDED',
				'Provided type: ' + typeof classFactory
			);
		}
		if (!(interfaceFactory instanceof ClassyJS.Type.Interface.Factory)) {
			throw new _.Factory.Fatal(
				'NO_INTERFACE_FACTORY_PROVIDED',
				'Provided type: ' + typeof interfaceFactory
			);
		}
		if (!(typeRegistry instanceof ClassyJS.Registry.Type)) {
			throw new _.Factory.Fatal(
				'NO_TYPE_REGISTRY_PROVIDED',
				'Provided type: ' + typeof typeRegistry
			);
		}
		if (!(memberRegistry instanceof ClassyJS.Registry.Member)) {
			throw new _.Factory.Fatal(
				'NO_MEMBER_REGISTRY_PROVIDED',
				'Provided type: ' + typeof memberRegistry
			);
		}
		if (!(namespaceManager instanceof ClassyJS.NamespaceManager)) {
			throw new _.Factory.Fatal(
				'NO_NAMESPACE_MANAGER_PROVIDED',
				'Provided type: ' + typeof namespaceManager
			);
		}
		this._typeDefinitionFactory = typeDefinitionFactory;
		this._classFactory = classFactory;
		this._interfaceFactory = interfaceFactory;
		this._typeRegistry = typeRegistry;
		this._memberRegistry = memberRegistry;
		this._namespaceManager = namespaceManager;
	};
	
	_.Factory.prototype.build = function(signature)
	{
		if (typeof signature != 'string') {
			throw new _.Factory.Fatal(
				'NON_STRING_SIGNATURE_PROVIDED',
				'Provided type: ' + typeof signature
			);
		}
		if (signature === '') {
			throw new _.Factory.Fatal('EMPTY_STRING_SIGNATURE_PROVIDED');
		}
		var definition = this._typeDefinitionFactory.build(signature);
		if (definition instanceof _.Class.Definition) {
			var classObject = this._classFactory.build(
				definition,
				this._typeRegistry,
				this._memberRegistry,
				this._namespaceManager
			);
			if (!(classObject instanceof ClassyJS.Type.Class)) {
				throw new _.Factory.Fatal(
					'NON_CLASS_RETURNED_FROM_FACTORY',
					'Returned type: ' + typeof classObject
				);
			}
			return classObject;
		} else if (definition instanceof _.Interface.Definition) {
			var interfaceObject = this._interfaceFactory.build(definition);
			if (!(interfaceObject instanceof ClassyJS.Type.Interface)) {
				throw new _.Factory.Fatal(
					'NON_INTERFACE_RETURNED_FROM_FACTORY',
					'Returned type: ' + typeof interfaceObject
				);
			}
			return interfaceObject;
		} else {
			throw new _.Factory.Fatal(
				'NON_DEFINITION_RETURNED_FROM_FACTORY',
				'Returned type: ' + typeof definition
			);
		}
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {}
);

;(function(ClassyJS, Type, _){
	
	var messages = {
		NO_DEFINITION_FACTORY_PROVIDED:
			'No instance of ClassyJS.Type.DefinitionFactory was provided to the constructor',
		NO_CLASS_FACTORY_PROVIDED:
			'No instance of ClassyJS.Type.Class.Factory was provided to the constructor',
		NO_INTERFACE_FACTORY_PROVIDED:
			'No instance of ClassyJS.Type.Interface.Factory was provided to the constructor',
		NO_TYPE_REGISTRY_PROVIDED:
			'No instance of ClassyJS.Registry.Type was provided to the constructor',
		NO_MEMBER_REGISTRY_PROVIDED:
			'No instance of ClassyJS.Registry.Member was provided to the constructor',
		NO_NAMESPACE_MANAGER_PROVIDED:
			'No instance of ClassyJS.NamespaceManager was provided to the constructor',
		NON_STRING_SIGNATURE_PROVIDED: 'Provided signature must be a string',
		EMPTY_STRING_SIGNATURE_PROVIDED: 'Provided signature must not be an empty string',
		NON_DEFINITION_RETURNED_FROM_FACTORY:
			'Provided definition factory did not return an instance of ' +
			'ClassyJS.Type.Class.Definition or ClassyJS.Type.Interface.Definition',
		NON_CLASS_RETURNED_FROM_FACTORY:
			'Provided class factory did not return an instance of ClassyJS.Type.Class',
		NON_INTERFACE_RETURNED_FROM_FACTORY:
			'Provided interface factory did not return an instance of ClassyJS.Type.Interface'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Type.Factory.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.Factory = window.ClassyJS.Type.Factory || {}
);

;(function(ClassyJS, _){
	
	_.DefinitionFactory = function(classDefinitionFactory, interfaceDefinitionFactory)
	{
		if (!(classDefinitionFactory instanceof _.Class.Definition.Factory)) {
			throw new _.DefinitionFactory.Fatal(
				'CLASS_DEFINITION_FACTORY_NOT_PROVIDED',
				'Provided type: ' + typeof classDefinitionFactory
			);
		}
		if (!(interfaceDefinitionFactory instanceof _.Interface.Definition.Factory)) {
			throw new _.DefinitionFactory.Fatal(
				'INTERFACE_DEFINITION_FACTORY_NOT_PROVIDED',
				'Provided type: ' + typeof interfaceDefinitionFactory
			);
		}
		this._classDefinitionFactory = classDefinitionFactory;
		this._interfaceDefinitionFactory = interfaceDefinitionFactory;
	};
	
	_.DefinitionFactory.prototype.build = function(signature)
	{
		if (typeof signature != 'string') {
			throw new _.DefinitionFactory.Fatal(
				'NON_STRING_SIGNATURE',
				'Provided type: ' + typeof signature
			);
		}
		var classMatch = signature.match(/\bclass\b/);
		var interfaceMatch = signature.match(/\binterface\b/);
		if (classMatch && interfaceMatch || !classMatch && !interfaceMatch) {
			throw new _.DefinitionFactory.Fatal('AMBIGUOUS_SIGNATURE');
		}
		var factory = (classMatch)
			? this._classDefinitionFactory
			: this._interfaceDefinitionFactory;
		var returnObject = factory.build(signature);
		if (typeof returnObject != 'object') {
			throw new _.DefinitionFactory.Fatal(
				'FACTORY_RETURNED_NON_OBJECT',
				'Returned type: ' + typeof returnObject
			);
		}
		return returnObject;
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {}
);

;(function(ClassyJS, Type, _){
	
	var messages = {
		CLASS_DEFINITION_FACTORY_NOT_PROVIDED:
			'Instance of Type.Class.Definition.Factory must be provided to the constructor',
		INTERFACE_DEFINITION_FACTORY_NOT_PROVIDED:
			'Instance of Type.Interface.Definition.Factory must be provided to the constructor',
		NON_STRING_SIGNATURE:			'Provided signature must be a string',
		AMBIGUOUS_SIGNATURE:			'Signature could not be identified as class or interface',
		FACTORY_RETURNED_NON_OBJECT:	'The selected downstream factory did not return an object'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Type.DefinitionFactory.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Type = window.ClassyJS.Type || {},
	window.ClassyJS.Type.DefinitionFactory = window.ClassyJS.Type.DefinitionFactory || {}
);

(function(ClassyJS, _){
	
	_.Property = function(definition, isFromInterface, value, typeChecker, accessController)
	{
		if (!(definition instanceof ClassyJS.Member.Property.Definition)) {
			throw new _.Property.Fatal(
				'NO_DEFINITION_PROVIDED',
				'Provided type: ' + typeof definition
			);
		}
		if (isFromInterface !== false) {
			throw new _.Property.Fatal('PROPERTY_CANNOT_BE_DEFINED_BY_INTERFACE');
		}
		if (typeof value == 'undefined') throw new _.Property.Fatal('NO_DEFAULT_VALUE_PROVIDED');
		if (!(typeChecker instanceof ClassyJS.TypeChecker)) {
			throw new _.Property.Fatal(
				'NO_TYPE_CHECKER_PROVIDED',
				'Provided type: ' + typeof typeChecker
			);
		}
		if (!(accessController instanceof ClassyJS.Access.Controller)) {
			throw new _.Property.Fatal(
				'NO_ACCESS_CONTROLLER_PROVIDED',
				'Provided type: ' + typeof accessController
			);
		}
		if (value !== null && typeof value != 'undefined' && value !== '') {
			var expectedType = definition.getTypeIdentifier();
			var isValidType = typeChecker.isValidType(value, expectedType);
			if (isValidType !== true) {
				throw new _.Property.Fatal(
					'INVALID_DEFAULT_VALUE',
					'Provided type: ' + typeof value + '; ' +
					'Expected type: ' + expectedType
				);
			}
		}
		this._definition = definition;
		this._defaultValue = value;
		this._typeChecker = typeChecker;
		this._accessController = accessController;
	};
	
	_.Property.prototype.getDefaultValue = function(targetInstance, accessInstance)
	{
		_requestAccess(this, targetInstance, accessInstance);
		return this._defaultValue;
	};
	
	_.Property.prototype.getName = function()
	{
		return this._definition.getName();
	};
	
	_.Property.prototype.set = function(targetInstance, accessInstance, value)
	{
		_requestAccess(this, targetInstance, accessInstance);
		_checkType(this, value);
		return value;
	};
	
	_.Property.prototype.get = function(targetInstance, accessInstance, value)
	{
		_requestAccess(this, targetInstance, accessInstance);
		_checkType(this, value);
		return value;
	};
	
	var _requestAccess = function(_this, targetInstance, accessInstance)
	{
		if (typeof targetInstance != 'object') {
			throw new _.Property.Fatal(
				'NON_OBJECT_TARGET_INSTANCE_PROVIDED',
				'Provided type: ' + typeof targetInstance
			);
		}
		if (typeof accessInstance != 'object') {
			throw new _.Property.Fatal(
				'NON_OBJECT_ACCESS_INSTANCE_PROVIDED',
				'Provided type: ' + typeof accessInstance
			);
		}
		var accessType = _this._definition.getAccessTypeIdentifier();
		var canAccess = _this._accessController.canAccess(
			targetInstance,
			accessInstance,
			accessType
		);
		if (canAccess !== true) {
			throw new _.Property.Fatal(
				'ACCESS_NOT_ALLOWED',
				'Access type: ' + accessType
			);
		}
	};
	
	var _checkType = function(_this, value)
	{
		var allowedType = _this._definition.getTypeIdentifier();
		var validType = _this._typeChecker.isValidType(
			value,
			allowedType
		);
		if (validType !== true) {
			throw new _.Property.Fatal(
				'INVALID_TYPE',
				'Allowed type: ' + allowedType + '; ' +
				'Provided type: ' + typeof value
			);
		}
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {}
);

;(function(ClassyJS, Member, _){
	
	_.Definition = function(signature)
	{
		if (typeof signature != 'string') {
			throw new _.Definition.Fatal(
				'NON_STRING_SIGNATURE',
				'Provided type: ' + typeof signature
			);
		}
		var signatureRegex = new RegExp(
			'^(?:\\s+)?(public|protected|private)\\s+([A-Za-z][A-Za-z0-9.]*)\\s+' +
			'\\((?:\\s+)?([A-Za-z\\[][A-Za-z0-9.\\]]*)(?:\\s+)?\\)(?:\\s+)?$'
		);
		var signatureMatch = signatureRegex.exec(signature);
		if (!signatureMatch) {
			throw new _.Definition.Fatal(
				'SIGNATURE_NOT_RECOGNISED',
				'Provided signature: ' + signature
			);
		}
		this._name = signatureMatch[2];
		this._accessTypeIdentifier = signatureMatch[1];
		this._typeIdentifier = signatureMatch[3];
	};
	
	_.Definition.prototype.getName = function()
	{
		return this._name;
	};
	
	_.Definition.prototype.getAccessTypeIdentifier = function()
	{
		return this._accessTypeIdentifier;
	};
	
	_.Definition.prototype.getTypeIdentifier = function()
	{
		return this._typeIdentifier;
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Property = window.ClassyJS.Member.Property || {}
);

;(function(ClassyJS, Member, Property, _){
	
	var messages = {
		NON_STRING_SIGNATURE:		'Signature must be provided as a string',
		SIGNATURE_NOT_RECOGNISED:	'Provided signature could not be understood' 
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Member.Property.Definition.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Property = window.ClassyJS.Member.Property || {},
	window.ClassyJS.Member.Property.Definition = window.ClassyJS.Member.Property.Definition || {}
);

;(function(ClassyJS, Member, Property, _){
	
	_.Factory = function(){};
	
	_.Factory.prototype.build = function(signature)
	{
		return new _(signature);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Property = window.ClassyJS.Member.Property || {},
	window.ClassyJS.Member.Property.Definition = window.ClassyJS.Member.Property.Definition || {}
);

(function(ClassyJS, Member, _){
	
	_.Factory = function(){};
	
	_.Factory.prototype.build = function(
		definition,
		isFromInterface,
		defaultValue,
		typeChecker,
		accessController
	)
	{
		return new _(definition, isFromInterface, defaultValue, typeChecker, accessController);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Property = window.ClassyJS.Member.Property || {}
);

;(function(ClassyJS, Member, _){
	
	var messages = {
		NO_DEFINITION_PROVIDED: 'Instance of ClassyJS.Member.Property.Definition must be provided',
		PROPERTY_CANNOT_BE_DEFINED_BY_INTERFACE:
			'Constructor argument indicated that this property was defined ' +
			'within an interface. Properties cannot be defined within interfaces',
		NO_TYPE_CHECKER_PROVIDED: 'Instance of ClassyJS.TypeChecker must be provided',
		NO_ACCESS_CONTROLLER_PROVIDED: 'Instance of ClassyJS.Access.Controller must be provided',
		INVALID_DEFAULT_VALUE:
			'Value provided as default does not match type specified in the property signature',
		NO_DEFAULT_VALUE_PROVIDED:
			'Valid default value or null must be provided',
		NON_OBJECT_TARGET_INSTANCE_PROVIDED:
			'Instance provided as property owner must be an object',
		NON_OBJECT_ACCESS_INSTANCE_PROVIDED:
			'Instance provided as accessing property must be an object',
		ACCESS_NOT_ALLOWED:
			'Provided object instance is not permitted to execute the requested behaviour',
		INVALID_TYPE: 'Property cannot be set to the provided type'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Member.Property.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Property = window.ClassyJS.Member.Property || {}
);

(function(ClassyJS, _){
	
	_.Method = function(definition, isFromInterface, value, typeChecker, accessController)
	{
		if (!(definition instanceof ClassyJS.Member.Method.Definition)) {
			throw new _.Method.Fatal(
				'NO_DEFINITION_PROVIDED',
				'Provided type: ' + typeof definition
			);
		}
		if (!(typeChecker instanceof ClassyJS.TypeChecker)) {
			throw new _.Method.Fatal(
				'NO_TYPE_CHECKER_PROVIDED',
				'Provided type: ' + typeof typeChecker
			);
		}
		if (!(accessController instanceof ClassyJS.Access.Controller)) {
			throw new _.Method.Fatal(
				'NO_ACCESS_CONTROLLER_PROVIDED',
				'Provided type: ' + typeof accessController
			);
		}
		if (isFromInterface === true || definition.isAbstract() === true) {
			if (value !== null && typeof value != 'undefined' && value !== '') {
				throw new _.Method.Fatal('UNEXPECTED_IMPLEMENTATION');
			}
			this._isAbstract = true;
		} else {
			if (typeof value != 'function') {
				throw new _.Method.Fatal(
					'NON_FUNCTION_IMPLEMENTATION',
					'Provided type: ' + typeof value
				);
			}
			this._isAbstract = false;
		}
		var types = definition.getArgumentTypeIdentifiers();
		for (var i = 0; i < types.length; i++) {
			if (types[i] === 'undefined') throw new _.Method.Fatal('UNDEFINED_ARGUMENT_TYPE');
			if (types[i] === 'null') throw new _.Method.Fatal('NULL_ARGUMENT_TYPE');
		}
		this._value = value;
		this._definition = definition;
		this._typeChecker = typeChecker;
		this._accessController = accessController;
	};
	
	_.Method.prototype.getName = function()
	{
		return this._definition.getName();
	};
	
	_.Method.prototype.getArgumentTypes = function()
	{
		return this._definition.getArgumentTypeIdentifiers();
	};
	
	_.Method.prototype.getReturnType = function()
	{
		// @todo Untested method
		return this._definition.getReturnTypeIdentifier();
	};
	
	_.Method.prototype.isStatic = function()
	{
		return this._definition.isStatic();
	};
	
	_.Method.prototype.isAbstract = function()
	{
		return this._isAbstract;
	};
	
	_.Method.prototype.call = function(target, accessInstance, arguments)
	{
		if (this._isAbstract) throw new _.Method.Fatal('INTERACTION_WITH_ABSTRACT');
		if (typeof target != 'object' && typeof target != 'function') {
			throw new _.Method.Fatal(
				'NON_OBJECT_OR_CONSTRUCTOR_TARGET_PROVIDED',
				'Provided type: ' + typeof target
			);
		}
		if (typeof accessInstance != 'object') {
			throw new _.Method.Fatal(
				'NON_OBJECT_ACCESS_INSTANCE_PROVIDED',
				'Provided type: ' + typeof accessInstance
			);
		}
		if (Object.prototype.toString.call(arguments) != '[object Array]') {
			throw new _.Method.Fatal(
				'NON_ARRAY_ARGUMENTS_PROVIDED',
				'Provided type: ' + typeof arguments
			);
		}
		var canAccess = this._accessController.canAccess(
			target,
			accessInstance,
			this._definition.getAccessTypeIdentifier()
		);
		if (canAccess !== true) throw new _.Method.Fatal('ACCESS_NOT_ALLOWED');
		var areValidTypes = this._typeChecker.areValidTypes(arguments, this.getArgumentTypes());
		if (areValidTypes !== true) throw new _.Method.Fatal('INVALID_ARGUMENTS');
		this._value.$$owner = target;
		var returnValue = this._value.apply(target, arguments);
		delete this._value.$$owner;
		var isValidType = this._typeChecker.isValidType(
			returnValue,
			this._definition.getReturnTypeIdentifier()
		);
		if (isValidType !== true) {
			throw new _.Method.Fatal(
				'INVALID_RETURN_VALUE',
				'Returned type: ' + typeof returnValue + '; ' +
				'Expected type: ' + this._definition.getReturnTypeIdentifier()
			);
		}
		return returnValue;
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {}
);

;(function(ClassyJS, Member, _){
	
	_.Definition = function(signature)
	{
		if (typeof signature != 'string') {
			throw new _.Definition.Fatal(
				'NON_STRING_SIGNATURE',
				'Provided type: ' + typeof signature
			);
		}
		var signatureRegex = new RegExp(
			'^(?:\\s+)?(?:(static|abstract)(?:\\s+))?(?:(static|abstract)(?:\\s+))?' +
			'(public|protected|private)\\s+(?:(static|abstract)(?:\\s+))?' +
			'(?:(static|abstract)(?:\\s+))?([a-z][A-Za-z0-9.]*)(?:\\s+)?' +
			'\\(([A-Za-z0-9,:.\\s\\[\\]]*)\\)\\s+->\\s+([A-Za-z0-9.[\\]]+)(?:\\s+)?$'
		);
		var signatureMatch = signatureRegex.exec(signature);
		if (!signatureMatch) {
			throw new _.Definition.Fatal(
				'SIGNATURE_NOT_RECOGNISED',
				'Provided signature: ' + signature
			);
		}
		this._name = signatureMatch[6];
		this._accessTypeIdentifier = signatureMatch[3];
		this._returnTypeIdentifier = signatureMatch[8];
		var staticAbstracts = [
			signatureMatch[1],
			signatureMatch[2],
			signatureMatch[4],
			signatureMatch[5]
		];
		this._isStatic = staticAbstracts.indexOf('static') > -1 ? true : false;
		this._isAbstract = staticAbstracts.indexOf('abstract') > -1 ? true : false;
		if (signatureMatch[7] == '') {
			this._argumentTypeIdentifiers = [];
		} else {
			this._argumentTypeIdentifiers = signatureMatch[7].replace(/\s+/g, '').split(',');
		}
	};
	
	_.Definition.prototype.getName = function()
	{
		return this._name;
	};
	
	_.Definition.prototype.getAccessTypeIdentifier = function()
	{
		return this._accessTypeIdentifier;
	};
	
	_.Definition.prototype.isStatic = function()
	{
		return this._isStatic;
	};
	
	_.Definition.prototype.isAbstract = function()
	{
		return this._isAbstract;
	};
	
	_.Definition.prototype.getArgumentTypeIdentifiers = function()
	{
		return this._argumentTypeIdentifiers;
	};
	
	_.Definition.prototype.getReturnTypeIdentifier = function()
	{
		return this._returnTypeIdentifier;
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Method = window.ClassyJS.Member.Method || {}
);

;(function(ClassyJS, Member, Method, _){
	
	var messages = {
		NON_STRING_SIGNATURE:		'Signature must be provided as a string',
		SIGNATURE_NOT_RECOGNISED:	'Provided signature could not be understood' 
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Member.Method.Definition.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Method = window.ClassyJS.Member.Method || {},
	window.ClassyJS.Member.Method.Definition = window.ClassyJS.Member.Method.Definition || {}
);

;(function(ClassyJS, Member, Method, _){
	
	_.Factory = function(){};
	
	_.Factory.prototype.build = function(signature)
	{
		return new _(signature);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Method = window.ClassyJS.Member.Method || {},
	window.ClassyJS.Member.Method.Definition = window.ClassyJS.Member.Method.Definition || {}
);

(function(ClassyJS, Member, _){
	
	_.Factory = function(){};
	
	_.Factory.prototype.build = function(
		definition,
		isFromInterface,
		value,
		typeChecker,
		accessController
	)
	{
		return new _(definition, isFromInterface, value, typeChecker, accessController);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Method = window.ClassyJS.Member.Method || {}
);

;(function(ClassyJS, Member, _){
	
	var messages = {
		NO_DEFINITION_PROVIDED: 'Instance of ClassyJS.Member.Method.Definition must be provided',
		NO_TYPE_CHECKER_PROVIDED: 'Instance of ClassyJS.TypeChecker must be provided',
		NO_ACCESS_CONTROLLER_PROVIDED: 'Instance of ClassyJS.Access.Controller must be provided',
		UNDEFINED_ARGUMENT_TYPE: 'Arguments cannot be defined as type undefined',
		NULL_ARGUMENT_TYPE: 'Arguments cannot be defined as type null',
		NON_OBJECT_OR_CONSTRUCTOR_TARGET_PROVIDED:
			'Argument provided as property owner must be an object or constructor',
		NON_OBJECT_ACCESS_INSTANCE_PROVIDED:
			'Instance provided as accessing property must be an object',
		NON_ARRAY_ARGUMENTS_PROVIDED:
			'Provided arguments must be within array',
		ACCESS_NOT_ALLOWED:
			'Provided object instance is not permitted to call method',
		INVALID_ARGUMENTS: 'Provided arguments are not valid',
		INVALID_RETURN_VALUE: 'Returned value is not valid',
		UNEXPECTED_IMPLEMENTATION:
			'Abstract or interface method should not provide an implementation',
		NON_FUNCTION_IMPLEMENTATION: 'implementation must be provided as a function',
		INTERACTION_WITH_ABSTRACT: 'This instance cannot be called as it is abstract'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Member.Method.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Method = window.ClassyJS.Member.Method || {}
);

(function(ClassyJS, _){
	
	_.Event = function(definition, isFromInterface, value, typeChecker, accessController)
	{
		if (!(definition instanceof ClassyJS.Member.Event.Definition)) {
			throw new _.Event.Fatal(
				'NO_DEFINITION_PROVIDED',
				'Provided type: ' + typeof definition
			);
		}
		if (!(typeChecker instanceof ClassyJS.TypeChecker)) {
			throw new _.Event.Fatal(
				'NO_TYPE_CHECKER_PROVIDED',
				'Provided type: ' + typeof typeChecker
			);
		}
		if (!(accessController instanceof ClassyJS.Access.Controller)) {
			throw new _.Event.Fatal(
				'NO_ACCESS_CONTROLLER_PROVIDED',
				'Provided type: ' + typeof accessController
			);
		}
		if (value !== null && value !== undefined && value !== '') {
			throw new _.Event.Fatal(
				'INVALID_VALUE_PROVIDED',
				'Provided type: ' + typeof value
			);
		}
		var types = definition.getArgumentTypeIdentifiers();
		for (var i = 0; i < types.length; i++) {
			if (types[i] === 'undefined') throw new _.Event.Fatal('UNDEFINED_ARGUMENT_TYPE');
			if (types[i] === 'null') throw new _.Event.Fatal('NULL_ARGUMENT_TYPE');
		}
		this._definition = definition;
		this._isAbstract = isFromInterface;
		this._typeChecker = typeChecker;
		this._accessController = accessController;
	};
	
	_.Event.prototype.getName = function()
	{
		return this._definition.getName();
	};
	
	_.Event.prototype.getArgumentTypes = function()
	{
		return this._definition.getArgumentTypeIdentifiers();
	};
	
	_.Event.prototype.requestBind = function(targetInstance, accessInstance)
	{
		if (this._isAbstract) throw new _.Event.Fatal('INTERACTION_WITH_ABSTRACT');
		if (typeof targetInstance != 'object') {
			throw new _.Event.Fatal(
				'NON_OBJECT_TARGET_INSTANCE_PROVIDED',
				'Provided type: ' + typeof targetInstance
			);
		}
		if (typeof accessInstance != 'object') {
			throw new _.Event.Fatal(
				'NON_OBJECT_ACCESS_INSTANCE_PROVIDED',
				'Provided type: ' + typeof accessInstance
			);
		}
		var accessType = this._definition.getAccessTypeIdentifier();
		var canAccess = this._accessController.canAccess(
			targetInstance,
			accessInstance,
			accessType
		);
		if (canAccess !== true) {
			throw new _.Event.Fatal(
				'ACCESS_NOT_ALLOWED',
				'Access type: ' + accessType
			);
		}
		this._accessController.canAccess(
			targetInstance,
			accessInstance,
			this._definition.getAccessTypeIdentifier()
		);
		return true;
	};
	
	_.Event.prototype.trigger = function(callbacks, arguments)
	{
		if (this._isAbstract) throw new _.Event.Fatal('INTERACTION_WITH_ABSTRACT');
		if (Object.prototype.toString.call(callbacks) != '[object Array]') {
			throw new _.Event.Fatal(
				'NON_ARRAY_CALLBACKS_PROVIDED',
				'Provided type: ' + typeof callbacks
			);
		}
		for (var i in callbacks) {
			if (Object.prototype.toString.call(callbacks[i]) != '[object Array]') {
				throw new _.Event.Fatal(
					'NON_ARRAY_CALLBACK_PROVIDED',
					'Provided type: ' + typeof callbacks[i]
				);
			}
			if (typeof callbacks[i][0] != 'object') {
				throw new _.Event.Fatal(
					'NON_OBJECT_CALLBACK_INSTANCE',
					'Provided type: ' + typeof callbacks[i][0]
				);
			}
			if (!(callbacks[i][1] instanceof ClassyJS.Member.Method)) {
				throw new _.Event.Fatal(
					'INVALID_CALLBACK_METHOD',
					'Provided type: ' + typeof callbacks[i][1]
				);
			}
		}
		if (Object.prototype.toString.call(arguments) != '[object Array]') {
			throw new _.Event.Fatal(
				'NON_ARRAY_ARGUMENTS_PROVIDED',
				'Provided type: ' + typeof arguments
			);
		}
		var areValid = this._typeChecker.areValidTypes(
			arguments,
			this._definition.getArgumentTypeIdentifiers()
		);
		if (areValid !== true) throw new _.Event.Fatal('INVALID_ARGUMENTS');
		for (var i in callbacks) callbacks[i][1].call(callbacks[i][0], callbacks[i][0], arguments);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {}
);

;(function(ClassyJS, Member, _){
	
	_.Definition = function(signature)
	{
		if (typeof signature != 'string') {
			throw new _.Definition.Fatal(
				'NON_STRING_SIGNATURE',
				'Provided type: ' + typeof signature
			);
		}
		var signatureRegex = new RegExp(
			'^(?:\\s+)?(public|protected)\\s+event\\s+([a-z][A-Za-z0-9]*)(?:\\s+)?' +
			'\\(([A-Za-z0-9,.\\s\\[\\]]*)\\)(?:\\s+)?$'
		);
		var signatureMatch = signatureRegex.exec(signature);
		if (!signatureMatch) {
			throw new _.Definition.Fatal(
					'SIGNATURE_NOT_RECOGNISED',
					'Provided signature: ' + signature
				);
		}
		this._name = signatureMatch[2];
		this._accessTypeIdentifier = signatureMatch[1];
		this._argumentTypeIdentifiers = [];
		if (signatureMatch[3] == '') return;
		var argumentTypeIdentifiers = signatureMatch[3].replace(/\s+/g, '').split(',');
		for (var i in argumentTypeIdentifiers) {
			if (!argumentTypeIdentifiers[i].match(/^[A-Za-z0-9.\[\]]+$/)) {
				throw new _.Definition.Fatal(
					'SIGNATURE_NOT_RECOGNISED',
					'Provided signature: ' + signature
				);
			}
			this._argumentTypeIdentifiers.push(argumentTypeIdentifiers[i]);
		}
	};
	
	_.Definition.prototype.getName = function()
	{
		return this._name;
	};
	
	_.Definition.prototype.getAccessTypeIdentifier = function()
	{
		return this._accessTypeIdentifier;
	};
	
	_.Definition.prototype.getArgumentTypeIdentifiers = function()
	{
		return this._argumentTypeIdentifiers;
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Event = window.ClassyJS.Member.Event || {}
);

;(function(ClassyJS, Member, Event, _){
	
	var messages = {
		NON_STRING_SIGNATURE:		'Signature must be provided as a string',
		SIGNATURE_NOT_RECOGNISED:	'Provided signature could not be understood' 
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Member.Event.Definition.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Event = window.ClassyJS.Member.Event || {},
	window.ClassyJS.Member.Event.Definition = window.ClassyJS.Member.Event.Definition || {}
);

;(function(ClassyJS, Member, Event, _){
	
	_.Factory = function(){};
	
	_.Factory.prototype.build = function(signature)
	{
		return new _(signature);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Event = window.ClassyJS.Member.Event || {},
	window.ClassyJS.Member.Event.Definition = window.ClassyJS.Member.Event.Definition || {}
);

(function(ClassyJS, Member, _){
	
	_.Factory = function(){};
	
	_.Factory.prototype.build = function(
		definition,
		isFromInterface,
		value,
		typeChecker,
		accessController
	)
	{
		return new _(definition, isFromInterface, value, typeChecker, accessController);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Event = window.ClassyJS.Member.Event || {}
);

;(function(ClassyJS, Member, _){
	
	var messages = {
		NO_DEFINITION_PROVIDED: 'Instance of ClassyJS.Member.Event.Definition must be provided',
		NO_TYPE_CHECKER_PROVIDED: 'Instance of ClassyJS.TypeChecker must be provided',
		NO_ACCESS_CONTROLLER_PROVIDED: 'Instance of ClassyJS.Access.Controller must be provided',
		INVALID_VALUE_PROVIDED: 'Event value must be undefined, null or empty string',
		UNDEFINED_ARGUMENT_TYPE: 'Arguments cannot be defined as type undefined',
		NULL_ARGUMENT_TYPE: 'Arguments cannot be defined as type null',
		NON_OBJECT_TARGET_INSTANCE_PROVIDED:
			'Instance provided as property owner must be an object',
		NON_OBJECT_ACCESS_INSTANCE_PROVIDED:
			'Instance provided as accessing property must be an object',
		ACCESS_NOT_ALLOWED:
			'Provided object instance is not permitted to execute the requested behaviour',
		NON_ARRAY_CALLBACKS_PROVIDED: 'Provided method callbacks are not provided within an array',
		NON_ARRAY_CALLBACK_PROVIDED: 'Provided method callback is not provided as an array',
		NON_OBJECT_CALLBACK_INSTANCE: 'Provided callback object instance is not an object',
		INVALID_CALLBACK_METHOD:
			'Provided callback method is not instance of ClassyJS.Member.Method',
		NON_ARRAY_ARGUMENTS_PROVIDED: 'Provided arguments are not provided within an array',
		INVALID_ARGUMENTS: 'The method arguments provided to trigger are not valid',
		INTERACTION_WITH_ABSTRACT: 'This instance cannot be bound or triggered as it is abstract'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Member.Event.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Event = window.ClassyJS.Member.Event || {}
);

(function(ClassyJS, _){
	
	_.Constant = function(definition, isFromInterface, value, typeChecker, accessController)
	{
		if (!(definition instanceof ClassyJS.Member.Constant.Definition)) {
			throw new _.Constant.Fatal(
				'NO_DEFINITION_PROVIDED',
				'Provided type: ' + typeof definition
			);
		}
		if (isFromInterface !== false) {
			throw new _.Constant.Fatal('IS_FROM_INTERFACE');
		}
		if (!(typeChecker instanceof ClassyJS.TypeChecker)) {
			throw new _.Constant.Fatal(
				'NO_TYPE_CHECKER_PROVIDED',
				'Provided type: ' + typeof typeChecker
			);
		}
		if (!(accessController instanceof ClassyJS.Access.Controller)) {
			throw new _.Constant.Fatal(
				'NO_ACCESS_CONTROLLER_PROVIDED',
				'Provided type: ' + typeof accessController
			);
		}
		if (['undefined', 'string', 'number'].indexOf(typeof value) == -1) {
			throw new _.Constant.Fatal(
				'INVALID_VALUE_TYPE',
				'Provided type: ' + typeof value
			);
		}
		if (typeof value != 'undefined') {
			var typeIdentifier = definition.getTypeIdentifier();
			var isValid = typeChecker.isValidType(value, typeIdentifier);
			if (isValid !== true) {
				throw new _.Constant.Fatal(
					'INVALID_VALUE',
					'Constant type: ' + typeIdentifier
				);
			}
		} else {
			value = _generateValue(definition.getTypeIdentifier());
		}
		this._value = value;
		this._definition = definition;
		this._accessController = accessController;
	};
	
	_.Constant.prototype.getName = function()
	{
		return this._definition.getName();
	};
	
	_.Constant.prototype.get = function(targetConstructor, accessInstance)
	{
		if (typeof targetConstructor != 'function') {
			throw new _.Constant.Fatal(
				'NON_FUNCTION_TARGET_CONSTRUCTOR_PROVIDED',
				'Provided type: ' + typeof targetConstructor
			);
		}
		if (typeof accessInstance != 'object') {
			throw new _.Constant.Fatal(
				'NON_OBJECT_ACCESS_INSTANCE_PROVIDED',
				'Provided type: ' + typeof accessInstance
			);
		}
		var canAccess = this._accessController.canAccess(
			targetConstructor,
			accessInstance,
			this._definition.getAccessTypeIdentifier()
		);
		if (canAccess !== true) throw new _.Constant.Fatal('ACCESS_NOT_ALLOWED');
		return this._value;
	};
	
	var _generateValue = function(type)
	{
		if (type == 'string') {
			var string = '';
			var chars = [
				'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
				'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
				'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
				'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
			];
			for (var i = 0; i < 32; i++) {
				var randomIndex = Math.floor(Math.random() * 26);
				string = string + chars[randomIndex];
			}
			return string;
		} else if (type == 'number') {
			return Math.floor(Math.random() * 9007199254740992);
		}
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {}
);

;(function(ClassyJS, Member, _){
	
	_.Definition = function(signature)
	{
		if (typeof signature != 'string') {
			throw new _.Definition.Fatal(
				'NON_STRING_SIGNATURE',
				'Provided type: ' + typeof signature
			);
		}
		var signatureRegex = new RegExp(
			'^(?:\\s+)?(public|protected|private)\\s+constant\\s+([A-Z][A-Z_]*)' +
			'(?:\\s+\\((?:\\s+)?([A-Za-z0-9.-\\[\\]]+)(?:\\s+)?\\))?(?:\\s+)?$'
		);
		var signatureMatch = signatureRegex.exec(signature);
		if (!signatureMatch) {
			throw new _.Definition.Fatal(
				'SIGNATURE_NOT_RECOGNISED',
				'Provided signature: ' + signature
			);
		}
		this._name = signatureMatch[2];
		this._accessTypeIdentifier = signatureMatch[1];
		this._typeIdentifier = signatureMatch[3];
	};
	
	_.Definition.prototype.getName = function()
	{
		return this._name;
	};
	
	_.Definition.prototype.getAccessTypeIdentifier = function()
	{
		return this._accessTypeIdentifier;
	};
	
	_.Definition.prototype.getTypeIdentifier = function()
	{
		return this._typeIdentifier;
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Constant = window.ClassyJS.Member.Constant || {}
);

;(function(ClassyJS, Member, Constant, _){
	
	var messages = {
		// NON_STRING_SIGNATURE:		'Signature must be provided as a string',
		// SIGNATURE_NOT_RECOGNISED:	'Provided signature could not be understood' 
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Member.Constant.Definition.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Constant = window.ClassyJS.Member.Constant || {},
	window.ClassyJS.Member.Constant.Definition = window.ClassyJS.Member.Constant.Definition || {}
);

;(function(ClassyJS, Member, Constant, _){
	
	_.Factory = function(){};
	
	_.Factory.prototype.build = function(signature)
	{
		return new _(signature);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Constant = window.ClassyJS.Member.Constant || {},
	window.ClassyJS.Member.Constant.Definition = window.ClassyJS.Member.Constant.Definition || {}
);

(function(ClassyJS, Member, _){
	
	_.Factory = function(){};
	
	_.Factory.prototype.build = function(
		definition,
		isFromInterface,
		value,
		typeChecker,
		accessController
	)
	{
		return new _(definition, isFromInterface, value, typeChecker, accessController);
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Constant = window.ClassyJS.Member.Constant || {}
);

;(function(ClassyJS, Member, _){
	
	var messages = {
		NO_DEFINITION_PROVIDED: 'Instance of ClassyJS.Member.Constant.Definition must be provided',
		IS_FROM_INTERFACE:
			'Constants cannot be abstract and therefore cannot be declared within an interface',
		NO_TYPE_CHECKER_PROVIDED: 'Instance of ClassyJS.TypeChecker must be provided',
		NO_ACCESS_CONTROLLER_PROVIDED: 'Instance of ClassyJS.Access.Controller must be provided',
		INVALID_VALUE_TYPE: 'Value must be string, number or undefined',
		INVALID_VALUE: 'Provided value did not match constant type',
		NON_FUNCTION_TARGET_CONSTRUCTOR_PROVIDED:
			'Constructor provided as property owner must be a function',
		NON_OBJECT_ACCESS_INSTANCE_PROVIDED:
			'Instance provided as accessing property must be an object',
		INVALID_TYPE: 'Constant cannot be set to the provided type',
		ACCESS_NOT_ALLOWED: 'Provided object instance is not permitted to access the constant value'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Member.Constant.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Constant = window.ClassyJS.Member.Constant || {}
);

(function(ClassyJS, _){
	
	_.Factory = function(
		memberDefinitionFactory,
		propertyFactory,
		methodFactory,
		eventFactory,
		constantFactory,
		typeChecker,
		accessController
	)
	{
		if (!(memberDefinitionFactory instanceof ClassyJS.Member.DefinitionFactory)) {
			throw new _.Factory.Fatal(
				'NO_DEFINITION_FACTORY_PROVIDED',
				'Provided type: ' + typeof memberDefinitionFactory
			);
		}
		if (!(propertyFactory instanceof ClassyJS.Member.Property.Factory)) {
			throw new _.Factory.Fatal(
				'NO_PROPERTY_FACTORY_PROVIDED',
				'Provided type: ' + typeof propertyFactory
			);
		}
		if (!(methodFactory instanceof ClassyJS.Member.Method.Factory)) {
			throw new _.Factory.Fatal(
				'NO_METHOD_FACTORY_PROVIDED',
				'Provided type: ' + typeof methodFactory
			);
		}
		if (!(eventFactory instanceof ClassyJS.Member.Event.Factory)) {
			throw new _.Factory.Fatal(
				'NO_EVENT_FACTORY_PROVIDED',
				'Provided type: ' + typeof eventFactory
			);
		}
		if (!(constantFactory instanceof ClassyJS.Member.Constant.Factory)) {
			throw new _.Factory.Fatal(
				'NO_CONSTANT_FACTORY_PROVIDED',
				'Provided type: ' + typeof constantFactory
			);
		}
		if (!(typeChecker instanceof ClassyJS.TypeChecker)) {
			throw new _.Factory.Fatal(
				'NO_TYPE_CHECKER_PROVIDED',
				'Provided type: ' + typeof typeChecker
			);
		}
		if (!(accessController instanceof ClassyJS.Access.Controller)) {
			throw new _.Factory.Fatal(
				'NO_ACCESS_CONTROLLER_PROVIDED',
				'Provided type: ' + typeof accessController
			);
		}
		this._memberDefinitionFactory = memberDefinitionFactory;
		this._propertyFactory = propertyFactory;
		this._methodFactory = methodFactory;
		this._eventFactory = eventFactory;
		this._constantFactory = constantFactory;
		this._typeChecker = typeChecker;
		this._accessController = accessController;
	};
	
	_.Factory.prototype.build = function(signature, isFromInterface, value)
	{
		if (typeof signature != 'string') {
			throw new _.Factory.Fatal(
				'NON_STRING_SIGNATURE_PROVIDED',
				'Provided type: ' + typeof signature
			);
		}
		if (signature === '') {
			throw new _.Factory.Fatal('EMPTY_STRING_SIGNATURE_PROVIDED');
		}
		if (typeof isFromInterface != 'boolean') {
			throw new _.Factory.Fatal(
				'NON_BOOLEAN_INTERFACE_INDICATOR_PROVIDED',
				'Provided type: ' + typeof isFromInterface
			);
		}
		var definition = this._memberDefinitionFactory.build(signature);
		if (definition instanceof _.Property.Definition) {
			var propertyObject = this._propertyFactory.build(
				definition,
				isFromInterface,
				value,
				this._typeChecker,
				this._accessController
			);
			if (!(propertyObject instanceof ClassyJS.Member.Property)) {
				throw new _.Factory.Fatal(
					'NON_PROPERTY_RETURNED_FROM_FACTORY',
					'Returned type: ' + typeof propertyObject
				);
			}
			return propertyObject;
		} else if (definition instanceof _.Method.Definition) {
			var methodObject = this._methodFactory.build(
				definition,
				isFromInterface,
				value,
				this._typeChecker,
				this._accessController
			);
			if (!(methodObject instanceof ClassyJS.Member.Method)) {
				throw new _.Factory.Fatal(
					'NON_METHOD_RETURNED_FROM_FACTORY',
					'Returned type: ' + typeof methodObject
				);
			}
			return methodObject;
		} else if (definition instanceof _.Event.Definition) {
			var eventObject = this._eventFactory.build(
				definition,
				isFromInterface,
				undefined,
				this._typeChecker,
				this._accessController
			);
			if (!(eventObject instanceof ClassyJS.Member.Event)) {
				throw new _.Factory.Fatal(
					'NON_EVENT_RETURNED_FROM_FACTORY',
					'Returned type: ' + typeof eventObject
				);
			}
			return eventObject;
		} else if (definition instanceof _.Constant.Definition) {
			var constantObject = this._constantFactory.build(
				definition,
				isFromInterface,
				value,
				this._typeChecker,
				this._accessController
			);
			if (!(constantObject instanceof ClassyJS.Member.Constant)) {
				throw new _.Factory.Fatal(
					'NON_CONSTANT_RETURNED_FROM_FACTORY',
					'Returned type: ' + typeof constantObject
				);
			}
			return constantObject;
		} else {
			throw new _.Factory.Fatal(
				'NON_DEFINITION_RETURNED_FROM_FACTORY',
				'Returned type: ' + typeof definition
			);
		}
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {}
);

;(function(ClassyJS, Member, _){
	
	var messages = {
		NO_DEFINITION_FACTORY_PROVIDED:
			'No instance of ClassyJS.Member.DefinitionFactory was provided to the constructor',
		NO_PROPERTY_FACTORY_PROVIDED:
			'No instance of ClassyJS.Member.Property.Factory was provided to the constructor',
		NO_METHOD_FACTORY_PROVIDED:
			'No instance of ClassyJS.Member.Method.Factory was provided to the constructor',
		NO_EVENT_FACTORY_PROVIDED:
			'No instance of ClassyJS.Member.Event.Factory was provided to the constructor',
		NO_CONSTANT_FACTORY_PROVIDED:
			'No instance of ClassyJS.Member.Constant.Factory was provided to the constructor',
		NO_TYPE_CHECKER_PROVIDED:
			'No instance of ClassyJS.TypeChecker was provided to the constructor',
		NO_ACCESS_CONTROLLER_PROVIDED:
			'No instance of ClassyJS.Access.Controller was provided to the constructor',
		NON_STRING_SIGNATURE_PROVIDED: 'Provided signature must be a string',
		EMPTY_STRING_SIGNATURE_PROVIDED: 'Provided signature must not be an empty string',
		NON_BOOLEAN_INTERFACE_INDICATOR_PROVIDED:
			'Argument provided to indicate whether the member is defined ' +
			'within an interface must be a boolean',
		NON_DEFINITION_RETURNED_FROM_FACTORY:
			'Provided definition factory did not return a member definition object',
		NON_PROPERTY_RETURNED_FROM_FACTORY:
			'Provided property factory did not return an instance of ClassyJS.Member.Property',
		NON_METHOD_RETURNED_FROM_FACTORY:
			'Provided method factory did not return an instance of ClassyJS.Member.Method',
		NON_EVENT_RETURNED_FROM_FACTORY:
			'Provided event factory did not return an instance of ClassyJS.Member.Event',
		NON_CONSTANT_RETURNED_FROM_FACTORY:
			'Provided constant factory did not return an instance of ClassyJS.Member.Constant'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Member.Factory.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.Factory = window.ClassyJS.Member.Factory || {}
);

;(function(ClassyJS, _){
	
	_.DefinitionFactory = function(
		propertyDefinitionFactory,
		methodDefinitionFactory,
		eventDefinitionFactory,
		constantDefinitionFactory
	)
	{
		if (!(propertyDefinitionFactory instanceof _.Property.Definition.Factory)) {
			throw new _.DefinitionFactory.Fatal('PROPERTY_DEFINITION_FACTORY_NOT_PROVIDED');
		}
		if (!(methodDefinitionFactory instanceof _.Method.Definition.Factory)) {
			throw new _.DefinitionFactory.Fatal('METHOD_DEFINITION_FACTORY_NOT_PROVIDED');
		}
		if (!(eventDefinitionFactory instanceof _.Event.Definition.Factory)) {
			throw new _.DefinitionFactory.Fatal('EVENT_DEFINITION_FACTORY_NOT_PROVIDED');
		}
		if (!(constantDefinitionFactory instanceof _.Constant.Definition.Factory)) {
			throw new _.DefinitionFactory.Fatal('CONSTANT_DEFINITION_FACTORY_NOT_PROVIDED');
		}
		this._propertyDefinitionFactory = propertyDefinitionFactory;
		this._methodDefinitionFactory = methodDefinitionFactory;
		this._eventDefinitionFactory = eventDefinitionFactory;
		this._constantDefinitionFactory = constantDefinitionFactory;
	};
	
	_.DefinitionFactory.prototype.build = function(signature)
	{
		if (typeof signature != 'string') {
			throw new _.DefinitionFactory.Fatal(
				'NON_STRING_SIGNATURE',
				'Provided type: ' + typeof signature
			);
		}
		var factories = ['Property', 'Method', 'Event', 'Constant'];
		for (var i in factories) {
			try {
				var factory = this['_' + factories[i].toLowerCase() + 'DefinitionFactory'];
				var returnObject = factory.build(signature);
				if (typeof returnObject != 'object') {
					throw new _.DefinitionFactory.Fatal(
						'FACTORY_RETURNED_NON_OBJECT',
						'Returned type: ' + typeof returnObject
					);
				}
				break;
			} catch (error) {
				if (!(error instanceof ClassyJS.Member[factories[i]].Definition.Fatal)
				||	error.code != 'SIGNATURE_NOT_RECOGNISED') {
					throw error;
				}
			}
		}
		if (typeof returnObject == 'undefined') {
			throw new _.DefinitionFactory.Fatal(
				'INVALID_SIGNATURE',
				'Provided signature: ' + signature
			);
		}
		return returnObject;
	};
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {}
);

;(function(ClassyJS, Member, _){
	
	var messages = {
		PROPERTY_DEFINITION_FACTORY_NOT_PROVIDED:
			'Instance of Member.Property.Definition.Factory must be provided to the constructor',
		METHOD_DEFINITION_FACTORY_NOT_PROVIDED:
			'Instance of Member.Method.Definition.Factory must be provided to the constructor',
		EVENT_DEFINITION_FACTORY_NOT_PROVIDED:
			'Instance of Member.Event.Definition.Factory must be provided to the constructor',
		CONSTANT_DEFINITION_FACTORY_NOT_PROVIDED:
			'Instance of Member.Constant.Definition.Factory must be provided to the constructor',
		NON_STRING_SIGNATURE: 'Signature must be provided as a string',
		INVALID_SIGNATURE:
			'Provided signature could not be understood by any of ' +
			'the available member definition classes' 
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Member.DefinitionFactory.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Member = window.ClassyJS.Member || {},
	window.ClassyJS.Member.DefinitionFactory = window.ClassyJS.Member.DefinitionFactory || {}
);

;(function(ClassyJS, _){
	
	_.Type = function()
	{
		this._classes = [];
		this._instances = [];
		this._interfaces = {};
	};
	
	_.Type.prototype.registerClass = function(classObject, classConstructor)
	{
		if (!(classObject instanceof ClassyJS.Type.Class)) {
			throw new _.Type.Fatal(
				'NON_CLASS_OBJECT_PROVIDED',
				'Provided type: ' + typeof classObject
			);
		}
		if (typeof classConstructor != 'function') {
			throw new _.Type.Fatal(
				'NON_CLASS_CONSTRUCTOR_PROVIDED',
				'Provided type: ' + typeof classConstructor
			);
		}
		if (_classObjectIsRegistered(this, classObject)) {
			throw new _.Type.Fatal('CLASS_ALREADY_REGISTERED');
		}
		this._classes.push({
			classObject:		classObject,
			constructor:		classConstructor,
			interfaces:			[],
			parentClassObject:	undefined
		});
	};
	
	_.Type.prototype.registerClassChild = function(parentClassObject, childClassObject)
	{
		if (!(parentClassObject instanceof ClassyJS.Type.Class)) {
			throw new _.Type.Fatal(
				'NON_CLASS_OBJECT_PROVIDED',
				'Provided type: ' + typeof parentClassObject
			);
		}
		if (!(childClassObject instanceof ClassyJS.Type.Class)) {
			throw new _.Type.Fatal(
				'NON_CLASS_OBJECT_PROVIDED',
				'Provided type: ' + typeof childClassObject
			);
		}
		if (!_classObjectIsRegistered(this, parentClassObject)) {
			throw new _.Type.Fatal('PARENT_CLASS_NOT_REGISTERED');
		}
		if (!_classObjectIsRegistered(this, childClassObject)) {
			throw new _.Type.Fatal('CHILD_CLASS_NOT_REGISTERED');
		}
		_getClassData(this, childClassObject).parentClassObject = parentClassObject;
	};
	
	_.Type.prototype.registerClassInstance = function(instanceObjects)
	{
		if (Object.prototype.toString.call(instanceObjects) != '[object Array]') {
			throw new _.Type.Fatal(
				'NON_ARRAY_CLASS_INSTANCE_PROVIDED',
				'Provided type: ' + typeof instanceObjects
			);
		}
		if (instanceObjects.length == 1 && typeof instanceObjects[0] == 'object') {
			throw new _.Type.Fatal('SINGLE_CLASS_INSTANCE_PROVIDED');
		}
		var expectedParent;
		for (var i = 0; i < instanceObjects.length; i++) {
			if (typeof instanceObjects[i] != 'object') {
				throw new _.Type.Fatal(
					'NON_OBJECT_CLASS_INSTANCE_PROVIDED',
					'Provided type: ' + typeof instanceObjects[i]
				);
			}
			var classObject = this.getClass(instanceObjects[i]);
			if (i > 0 && classObject !== expectedParent) {
				throw new _.Type.Fatal('INVALID_CLASS_HIERARCHY_INSTANCE_REGISTERED');
			}
			expectedParent = (this.hasParent(classObject))
				? this.getParent(classObject)
				: undefined;
		}
		if (expectedParent) {
			throw new _.Type.Fatal('INCOMPLETE_CLASS_HIERARCHY_INSTANCE_REGISTERED');
		}
		for (var i in this._instances) {
			if (this._instances[i][0] === instanceObjects[0]) {
				throw new _.Type.Fatal('CLASS_INSTANCE_ALREADY_REGISTERED');
			}
		}
		this._instances.push(instanceObjects);
	};
	
	_.Type.prototype.registerInterface = function(interfaceObject)
	{
		this._interfaces[interfaceObject.getName()] = interfaceObject;
	};
	
	_.Type.prototype.registerInterfaceAgainstClass = function(interfaceObject, classObject)
	{
		if (!(interfaceObject instanceof ClassyJS.Type.Interface)) {
			throw new _.Type.Fatal(
				'NON_INTERFACE_OBJECT_PROVIDED',
				'Provided type: ' + typeof interfaceObject
			);
		}
		if (!(classObject instanceof ClassyJS.Type.Class)) {
			throw new _.Type.Fatal(
				'NON_CLASS_OBJECT_PROVIDED',
				'Provided type: ' + typeof classObject
			);
		}
		if (!_classObjectIsRegistered(this, classObject)) {
			throw new _.Type.Fatal('CLASS_NOT_REGISTERED');
		}
		_getClassData(this, classObject).interfaces.push(interfaceObject);
	};
	
	_.Type.prototype.classExists = function(classIdentifier)
	{
		// @todo Method untested
		try {
			this.getClass(classIdentifier);
		} catch (error) {
			if (error instanceof _.Type.Fatal && error.code == 'CLASS_NOT_REGISTERED') return false;
			throw error;
		}
		return true;
	};
	
	_.Type.prototype.getClass = function(classIdentifier)
	{
		if (typeof classIdentifier != 'object' && typeof classIdentifier != 'function') {
			throw new _.Type.Fatal(
				'INVALID_CLASS_LOOKUP',
				'Provided type: ' + typeof classIdentifier
			);
		}
		if (typeof classIdentifier == 'object') classIdentifier = classIdentifier.constructor;
		var classData = _getClassData(this, classIdentifier);
		if (classData) return classData.classObject;
		throw new _.Type.Fatal('CLASS_NOT_REGISTERED');
	};
	
	_.Type.prototype.getInterface = function(name)
	{
		return this._interfaces[name];
	}
	
	_.Type.prototype.getInterfacesFromClass = function(classObject)
	{
		if (!(classObject instanceof ClassyJS.Type.Class)) {
			throw new _.Type.Fatal(
				'NON_CLASS_OBJECT_PROVIDED',
				'Provided type: ' + typeof classObject
			);
		}
		if (!_classObjectIsRegistered(this, classObject)) {
			throw new _.Type.Fatal('CLASS_NOT_REGISTERED');
		}
		return _getClassData(this, classObject).interfaces;
	};
	
	_.Type.prototype.hasParent = function(classObject)
	{
		try {
			this.getParent(classObject);
			return true;
		} catch (error) {
			if (error instanceof _.Type.Fatal && error.code == 'NON_EXISTENT_PARENT_REQUESTED') {
				return false;
			}
			throw error;
		}
	};
	
	_.Type.prototype.getParent = function(classObject)
	{
		var originalClassObject = classObject;
		var returnType = (typeof classObject == 'object')
			? ((classObject instanceof ClassyJS.Type.Class) ? 'classObject' : 'instance')
			: 'constructor';
		if (typeof classObject == 'object' && !(classObject instanceof ClassyJS.Type.Class)) {
			classObject = classObject.constructor;
		}
		if (typeof classObject == 'function') classObject = this.getClass(classObject);
		if (!(classObject instanceof ClassyJS.Type.Class)) {
			throw new _.Type.Fatal(
				'NON_CLASS_CONSTRUCTOR_OR_INSTANCE_PROVIDED',
				'Provided type: ' + typeof originalClassObject
			);
		}
		if (returnType == 'classObject' || returnType == 'constructor') {
			var classData = _getClassData(this, classObject);
			if (classData) {
				if (!classData.parentClassObject) {
					throw new _.Type.Fatal('NON_EXISTENT_PARENT_REQUESTED');
				}
				var parentClassObject = classData.parentClassObject;
				if (returnType == 'classObject') return parentClassObject;
				if (returnType == 'constructor') {
					return _getClassData(this, parentClassObject).constructor;
				}
			}
		} else if (returnType == 'instance') {
			for (var i in this._instances) {
				for (var j in this._instances[i]) {
					j = parseInt(j);
					if (this._instances[i][j] === originalClassObject) {
						if (typeof this._instances[i][j+1] == 'undefined') {
							throw new _.Type.Fatal('NON_EXISTENT_PARENT_REQUESTED');
						}
						return this._instances[i][j+1];
					}
				}
			}
			throw new _.Type.Fatal('NON_EXISTENT_PARENT_REQUESTED');
		}
		throw new _.Type.Fatal('CLASS_NOT_REGISTERED');
	};
	
	_.Type.prototype.getInstantiatedInstance = function(classInstance)
	{
		if (typeof classInstance != 'object') {
			throw new _.Type.Fatal(
				'NON_CLASS_INSTANCE_PROVIDED',
				'Provided type: ' + typeof classInstance
			);
		}
		this.getClass(classInstance);
		for (var i in this._instances) {
			for (var j in this._instances[i]) {
				if (this._instances[i][j] === classInstance) return this._instances[i][0];
			}
		}
		return classInstance;
	};
	
	var _getClassData = function(_this, classIdentifier)
	{
		for (var i in _this._classes) {
			if (_this._classes[i].classObject === classIdentifier) return _this._classes[i];
			if (_this._classes[i].constructor === classIdentifier) return _this._classes[i];
		}
	};
	
	var _classObjectIsRegistered = function(_this, classObject)
	{
		return (_getClassData(_this, classObject)) ? true : false;
	};
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Registry = window.ClassyJS.Registry || {}
);

;(function(ClassyJS, Registry, _){
	
	var messages = {
		NON_CLASS_OBJECT_PROVIDED:
			'Provided class object is not an instance of ClassyJS.Type.Class',
		NON_INTERFACE_OBJECT_PROVIDED:
			'Provided interface object is not an instance of ClassyJS.Type.Interface',
		NON_CLASS_CONSTRUCTOR_PROVIDED: 'Provided class constructor is not a function',
		INVALID_CLASS_LOOKUP: 'Class object was looked up using a non instance or constructor',
		CLASS_ALREADY_REGISTERED: 'Provided class object is already registered',
		CLASS_NOT_REGISTERED: 'No class object could be found matching ' +
			'the provided constructor or instance',
		PARENT_CLASS_NOT_REGISTERED: 'No class object could be found matching ' +
			'the provided parent class object',
		CHILD_CLASS_NOT_REGISTERED: 'No class object could be found matching ' +
			'the provided child class object',
		NON_EXISTENT_PARENT_REQUESTED:
			'A parent object, constructor or instance was requested where no association exists',
		NON_ARRAY_CLASS_INSTANCE_PROVIDED:
			'Class instance must be provided as array of parentally related instances',
		CLASS_INSTANCE_ALREADY_REGISTERED: 'The provided class instance is already registered',
		SINGLE_CLASS_INSTANCE_PROVIDED:
			'Class instance provided as single object instance; if there is no ' +
			'parental relationship, there is no need to register the instance.',
		NON_OBJECT_CLASS_INSTANCE_PROVIDED:
			'Provided class instance contains an entry that is not an object instance',
		INVALID_CLASS_HIERARCHY_INSTANCE_REGISTERED:
			'Provided class instance does not follow the class ' +
			'hierarchy already defined in the registry',
		INCOMPLETE_CLASS_HIERARCHY_INSTANCE_REGISTERED:
			'Provided class instance does not complete the class ' +
			'hierarchy already defined in the registry',
		NON_CLASS_CONSTRUCTOR_OR_INSTANCE_PROVIDED:
			'An argument which was neither class object, class ' +
			'constructor or class instance was provided',
		NON_CLASS_INSTANCE_PROVIDED: 'Provided argument is not a class instance'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Registry.Type.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Registry = window.ClassyJS.Registry || {},
	window.ClassyJS.Registry.Type = window.ClassyJS.Registry.Type || {}
);

;(function(ClassyJS, _){
	
	// @todo Ensure all public method args are type checked
	
	_.Member = function(typeRegistry, typeChecker)
	{
		if (!(typeRegistry instanceof _.Type)) {
			throw new _.Member.Fatal(
				'TYPE_REGISTRY_REQUIRED',
				'Provided type: ' + typeof typeRegistry
			);
		}
		if (!(typeChecker instanceof ClassyJS.TypeChecker)) {
			throw new _.Member.Fatal(
				'TYPE_CHECKER_REQUIRED',
				'Provided type: ' + typeof typeChecker
			);
		}
		this._typeRegistry = typeRegistry;
		this._typeChecker = typeChecker;
		this._typeMemberData = [];
		this._classInstanceData = [];
	};
	
	_.Member.prototype.register = function(memberObject, typeObject)
	{
		// @todo Type check first arg
		if (!(typeObject instanceof ClassyJS.Type.Class)
		&&	!(typeObject instanceof ClassyJS.Type.Interface)) {
			throw new _.Member.Fatal(
				'TARGET_NOT_CLASS_OR_INTERFACE',
				'Provided type: ' + typeof typeObject
			);
		}
		_ensureTypeIsInRegistry(this, typeObject);
		_storeMember(this, memberObject, typeObject);
	};
	
	_.Member.prototype.getMembers = function(typeObject)
	{
		if (!(typeObject instanceof ClassyJS.Type.Class)
		&&	!(typeObject instanceof ClassyJS.Type.Interface)) {
			throw new _.Member.Fatal(
				'TARGET_NOT_CLASS_OR_INTERFACE',
				'Provided type: ' + typeof typeObject
			);
		}
		var typeMemberData = _getTypeMemberDataFromTypeObject(this, typeObject);
		if (!typeMemberData) return [];
		var members = [];
		for (var i in typeMemberData.members.properties) {
			members.push(typeMemberData.members.properties[i]);
		}
		for (var i in typeMemberData.members.methods) {
			members.push(typeMemberData.members.methods[i]);
		}
		for (var i in typeMemberData.members.events) {
			members.push(typeMemberData.members.events[i]);
		}
		for (var i in typeMemberData.members.constants) {
			members.push(typeMemberData.members.constants[i]);
		}
		return members;
	};
	
	_.Member.prototype.hasAbstractMembers = function(classObject)
	{
		var members = _getAllMembers(this, classObject);
		return !_membersAreValid(members);
	};
	
	_.Member.prototype.hasUnimplementedInterfaceMembers = function(classObject)
	{
		// @todo Untested method
		var interfaces = this._typeRegistry.getInterfacesFromClass(classObject);
		var allMembers = [];
		var classMembers = _getAllMembers(this, classObject);
		for (var i in classMembers) {
			allMembers.push(classMembers[i]);
		}
		for (var i in interfaces) {
			var interfaceMembers = this.getMembers(interfaces[i]);
			for (var j in interfaceMembers) allMembers.push(interfaceMembers[j]);
		}
		return !_membersAreValid(allMembers);
	};
	
	_.Member.prototype.setPropertyValue = function(
		classInstance,
		accessInstance,
		name,
		value,
		originalClassInstance
	)
	{
		if (arguments.callee.caller != this.setPropertyValue) {
			return this.setPropertyValue(
				this._typeRegistry.getInstantiatedInstance(classInstance),
				accessInstance,
				name,
				value,
				originalClassInstance || classInstance
			);
		}
		var classObject = _getClassObjectFromInstanceOrConstructor(this, classInstance);
		try {
			var property = _getPropertyByName(this, classObject, name);
		} catch (error) {
			if (!(error instanceof _.Member.Fatal)
			||	error.code != 'PROPERTY_NOT_REGISTERED'
			||	!this._typeRegistry.hasParent(classInstance)) {
				throw error;
			}
			return this.setPropertyValue(
				this._typeRegistry.getParent(classInstance),
				accessInstance,
				name,
				value,
				originalClassInstance || classInstance
			);
		}
		value = property.set(originalClassInstance, accessInstance, value);
		_ensureClassInstanceIsInRegistry(this, classInstance);
		var classInstanceData = _getClassInstanceDataFromClassInstance(this, classInstance);
		classInstanceData.properties[name] = value;
	};
	
	_.Member.prototype.getPropertyValue = function(
		classInstance,
		accessInstance,
		name,
		originalClassInstance
	)
	{
		if (arguments.callee.caller != this.getPropertyValue) {
			return this.getPropertyValue(
				this._typeRegistry.getInstantiatedInstance(classInstance),
				accessInstance,
				name,
				originalClassInstance || classInstance
			);
		}
		var classInstanceData = _getClassInstanceDataFromClassInstance(this, classInstance);
		var classObject = _getClassObjectFromInstanceOrConstructor(this, classInstance);
		try {
			var property = _getPropertyByName(this, classObject, name);
		} catch (error) {
			if (!(error instanceof _.Member.Fatal)
			||	error.code != 'PROPERTY_NOT_REGISTERED'
			||	!this._typeRegistry.hasParent(classInstance)) {
				throw error;
			}
			return this.getPropertyValue(
				this._typeRegistry.getParent(classInstance),
				accessInstance,
				name,
				originalClassInstance || classInstance
			);
		}
		if (classInstanceData && classInstanceData.properties.hasOwnProperty(name)) {
			return property.get(
				originalClassInstance,
				accessInstance,
				classInstanceData.properties[name]
			);
		}
		return property.getDefaultValue(originalClassInstance, accessInstance);
	};
	
	_.Member.prototype.callMethod = function(callTarget, accessInstance, name, args)
	{
		if (typeof callTarget != 'object' && typeof callTarget != 'function') {
			throw new _.Member.Fatal(
				'NON_CLASS_INSTANCE_OR_CONSTRUCTOR_PROVIDED',
				'Provided type: ' + typeof callTarget
			);
		}
		if (typeof name != 'string') {
			throw new _.Member.Fatal(
				'NON_STRING_METHOD_NAME_PROVIDED',
				'Provided type: ' + typeof name
			);
		}
		if (Object.prototype.toString.call(args) != '[object Array]') {
			throw new _.Member.Fatal(
				'NON_ARRAY_METHOD_ARGUMENTS_PROVIDED',
				'Provided type: ' + typeof args
			);
		}
		var shouldBeStatic = (typeof callTarget == 'function') ? true : false;
		if (!shouldBeStatic && arguments.callee.caller != this.callMethod) {
			return this.callMethod(
				this._typeRegistry.getInstantiatedInstance(callTarget),
				accessInstance,
				name,
				args
			);
		}
		var classObject = _getClassObjectFromInstanceOrConstructor(this, callTarget);
		var methods = _getAllMethodsByName(this, classObject, name);
		for (var i = 0; i < methods.length; i++) {
			var argumentTypes = methods[i].getArgumentTypes();
			if (args.length != argumentTypes.length) continue;
			if (shouldBeStatic != methods[i].isStatic()) continue;
			if (!this._typeChecker.areValidTypes(args, argumentTypes)) continue;
			return methods[i].call(callTarget, accessInstance, args);
		}
		if (this._typeRegistry.hasParent(callTarget)) {
			return this.callMethod(
				this._typeRegistry.getParent(callTarget),
				accessInstance,
				name,
				args
			);
		}
		throw new _.Member.Fatal(
			'METHOD_NOT_REGISTERED',
			'Provided name: ' + name
		);
	};
	
	_.Member.prototype.bindEvent = function(
		classInstance,
		name,
		targetObject,
		targetMethod,
		originalCallClassInstance
	)
	{
		if (arguments.callee.caller != this.bindEvent) {
			return this.bindEvent(
				this._typeRegistry.getInstantiatedInstance(classInstance),
				name,
				targetObject,
				targetMethod,
				originalCallClassInstance
			);
		}
		var classObject = _getClassObjectFromInstanceOrConstructor(this, classInstance);
		try {
			var eventObject = _getEventByName(this, classObject, name);
		} catch (error) {
			if (!(error instanceof _.Member.Fatal)
			||	error.code != 'EVENT_NOT_REGISTERED'
			||	!this._typeRegistry.hasParent(classInstance)) {
				throw error;
			}
			return this.bindEvent(
				this._typeRegistry.getParent(classInstance),
				name,
				targetObject,
				targetMethod,
				originalCallClassInstance || classInstance
			);
		}
		originalCallClassInstance = originalCallClassInstance || classInstance;
		classObject = _getClassObjectFromInstanceOrConstructor(this, targetObject);
		var bindAllowed = eventObject.requestBind(originalCallClassInstance, targetObject);
		if (bindAllowed !== true) throw new _.Member.Fatal('EVENT_BIND_NOT_PERMITTED');
		try {
			var methodObject = _getMethodByNameArgumentTypesAndStaticState(
				this,
				classObject,
				targetMethod,
				eventObject.getArgumentTypes(),
				false
			);
		} catch (error) {
			if (!(error instanceof _.Member.Fatal) || error.code != 'METHOD_NOT_REGISTERED') {
				throw error;
			} else if (this._typeRegistry.hasParent(originalCallClassInstance)) {
				return this.bindEvent(
					classInstance,
					name,
					targetObject,
					targetMethod,
					this._typeRegistry.getParent(originalCallClassInstance)
				);
			} else {
				throw new _.Member.Fatal(
					'EVENT_TARGET_METHOD_NOT_REGISTERED',
					'Event name: ' + name + '; ' +
					'Method name: ' + targetMethod
				);
			}
		}
		_ensureClassInstanceIsInRegistry(this, classInstance);
		var classInstanceData = _getClassInstanceDataFromClassInstance(this, classInstance);
		// @todo Check method isn't already registered (possibly before this point)
		classInstanceData.eventCallbacks.push([targetObject, methodObject]);
	};
	
	_.Member.prototype.triggerEvent = function(classInstance, name, args)
	{
		if (arguments.callee.caller != this.triggerEvent) {
			return this.triggerEvent(
				this._typeRegistry.getInstantiatedInstance(classInstance),
				name,
				args
			);
		}
		var classObject = _getClassObjectFromInstanceOrConstructor(this, classInstance);
		var classInstanceData = _getClassInstanceDataFromClassInstance(this, classInstance);
		try {
			var eventObject = _getEventByName(this, classObject, name);
		} catch (error) {
			if (!(error instanceof _.Member.Fatal)
			||	error.code != 'EVENT_NOT_REGISTERED'
			||	!this._typeRegistry.hasParent(classInstance)) {
				throw error;
			}
			return this.triggerEvent(
				this._typeRegistry.getParent(classInstance),
				name,
				args
			);
		}
		eventObject.trigger(classInstanceData.eventCallbacks, args);
	};
	
	_.Member.prototype.getConstant = function(classConstructor, accessInstance, name)
	{
		if (typeof classConstructor != 'function') {
			throw new _.Member.Fatal('CONSTANT_RETRIEVED_AGAINST_CLASS_INSTANCE');
		}
		var classObject = _getClassObjectFromInstanceOrConstructor(this, classConstructor);
		try {
			var constantObject = _getConstantByName(this, classObject, name);
		} catch (error) {
			if (!(error instanceof _.Member.Fatal)
			||	error.code != 'CONSTANT_NOT_REGISTERED'
			||	!this._typeRegistry.hasParent(classConstructor)) {
				throw error;
			}
			return this.getConstant(
				this._typeRegistry.getParent(classConstructor),
				accessInstance,
				name
			);
		}
		return constantObject.get(classConstructor, accessInstance);
	};
	
	var _ensureTypeIsInRegistry = function(_this, typeObject)
	{
		for (var i = 0; i < _this._typeMemberData.length; i++) {
			if (_this._typeMemberData[i].typeObject === typeObject) return;
		}
		_this._typeMemberData.push({
			typeObject:	typeObject,
			members:		{
				properties:	[],
				methods:	[],
				events:		[],
				constants:	[],
			}
		});
	};
	
	var _ensureClassInstanceIsInRegistry = function(_this, classInstance)
	{
		for (var i = 0; i < _this._classInstanceData.length; i++) {
			if (_this._classInstanceData[i].classInstance === classInstance) return;
		}
		_this._classInstanceData.push({
			classInstance:	classInstance,
			properties:		{},
			eventCallbacks:	[]
		});
	};
	
	var _storeMember = function(_this, memberObject, typeObject)
	{
		var memberName = memberObject.getName();
		if (memberObject instanceof ClassyJS.Member.Property) {
			var propertyExists = true;
			try {
				_getPropertyByName(_this, typeObject, memberName);
			} catch (error) {
				if (error instanceof _.Member.Fatal && error.code == 'PROPERTY_NOT_REGISTERED') {
					propertyExists = false;
				} else {
					throw error;
				}
			}
			if (propertyExists) {
				throw new _.Member.Fatal(
					'PROPERTY_ALREADY_REGISTERED',
					'Property name: ' + memberName
				);
			}
			var typeMemberData = _getTypeMemberDataFromTypeObject(
				_this,
				typeObject
			);
			typeMemberData.members.properties.push(memberObject);
		} else if (memberObject instanceof ClassyJS.Member.Method) {
			var methodExists = true;
			try {
				_getMethodByNameArgumentTypesAndStaticState(
					_this,
					typeObject,
					memberName,
					memberObject.getArgumentTypes(),
					memberObject.isStatic()
				);
			} catch (error) {
				if (error instanceof _.Member.Fatal && error.code == 'METHOD_NOT_REGISTERED') {
					methodExists = false;
				} else {
					throw error;
				}
			}
			if (methodExists) {
				throw new _.Member.Fatal(
					'METHOD_ALREADY_REGISTERED',
					'Method name: ' + memberName + '; ' +
					'Argument types: ' + (memberObject.getArgumentTypes().join(', ') || '(none)') +
					'; ' +
					'Is static: ' + (memberObject.isStatic() ? 'true' : 'false')
				);
			}
			var typeMemberData = _getTypeMemberDataFromTypeObject(
				_this,
				typeObject
			);
			typeMemberData.members.methods.push(memberObject);
		} else if (memberObject instanceof ClassyJS.Member.Event) {
			var eventExists = true;
			try {
				_getEventByName(_this, typeObject, memberName);
			} catch (error) {
				if (error instanceof _.Member.Fatal && error.code == 'EVENT_NOT_REGISTERED') {
					eventExists = false;
				} else {
					throw error;
				}
			}
			if (eventExists) {
				throw new _.Member.Fatal(
					'EVENT_ALREADY_REGISTERED',
					'Event name: ' + memberName
				);
			}
			var typeMemberData = _getTypeMemberDataFromTypeObject(
				_this,
				typeObject
			);
			typeMemberData.members.events.push(memberObject);
		} else if (memberObject instanceof ClassyJS.Member.Constant) {
			var constantExists = true;
			try {
				_getConstantByName(_this, typeObject, memberName);
			} catch (error) {
				if (error instanceof _.Member.Fatal && error.code == 'CONSTANT_NOT_REGISTERED') {
					constantExists = false;
				} else {
					throw error;
				}
			}
			if (constantExists) {
				throw new _.Member.Fatal(
					'CONSTANT_ALREADY_REGISTERED',
					'Constant name: ' + memberName
				);
			}
			var typeMemberData = _getTypeMemberDataFromTypeObject(
				_this,
				typeObject
			);
			typeMemberData.members.constants.push(memberObject);
		}
	};
	
	var _getTypeMemberDataFromTypeObject = function(_this, typeObject)
	{
		for (var i = 0; i < _this._typeMemberData.length; i++) {
			if (_this._typeMemberData[i].typeObject === typeObject) return _this._typeMemberData[i];
		}
	};
	
	var _getClassInstanceDataFromClassInstance = function(_this, classInstance)
	{
		for (var i = 0; i < _this._classInstanceData.length; i++) {
			if (_this._classInstanceData[i].classInstance === classInstance) {
				return _this._classInstanceData[i];
			}
		}
	};
	
	var _getPropertyByName = function(_this, typeObject, propertyName)
	{
		var typeMemberData = _getTypeMemberDataFromTypeObject(_this, typeObject);
		if (typeMemberData) {
			var properties = typeMemberData.members.properties;
			for (var i = 0; i < properties.length; i++) {
				if (properties[i].getName() == propertyName) return properties[i];
			}
		}
		// @todo Unit test error
		throw new _.Member.Fatal(
			'PROPERTY_NOT_REGISTERED',
			'Provided name: ' + propertyName
		);
	};
	
	var _getMethodByNameArgumentTypesAndStaticState = function(
		_this,
		typeObject,
		methodName,
		argumentTypes,
		isStatic
	)
	{
		var typeMemberData = _getTypeMemberDataFromTypeObject(_this, typeObject);
		if (typeMemberData) {
			var methods = typeMemberData.members.methods;
			toLookThroughMethods:
			for (var i = 0; i < methods.length; i++) {
				if (methods[i].getName() == methodName
				&&	argumentTypes.length == methods[i].getArgumentTypes().length
				&&	isStatic === methods[i].isStatic()) {
					for (var j = 0; j < argumentTypes.length; j++) {
						if (argumentTypes[j] != methods[i].getArgumentTypes()[j]) {
							continue toLookThroughMethods;
						}
					}
					return methods[i];
				}
			}
		}
		throw new _.Member.Fatal(
			'METHOD_NOT_REGISTERED',
			'Provided name: ' + methodName
		);
	};
	
	var _getAllMethodsByName = function(_this, typeObject, methodName)
	{
		var returnMethods = [];
		var typeMemberData = _getTypeMemberDataFromTypeObject(_this, typeObject);
		if (!typeMemberData) return returnMethods;
		var methods = typeMemberData.members.methods;
		for (var i = 0; i < methods.length; i++) {
			if (methods[i].getName() == methodName) returnMethods.push(methods[i]);
		}
		return returnMethods;
	};
	
	var _getEventByName = function(_this, typeObject, eventName)
	{
		var typeMemberData = _getTypeMemberDataFromTypeObject(_this, typeObject);
		if (typeMemberData) {
			var events = typeMemberData.members.events;
			for (var i = 0; i < events.length; i++) {
				if (events[i].getName() == eventName) return events[i];
			}
		}
		throw new _.Member.Fatal(
			'EVENT_NOT_REGISTERED',
			'Provided name: ' + eventName
		);
	};
	
	var _getConstantByName = function(_this, typeObject, constantName)
	{
		var typeMemberData = _getTypeMemberDataFromTypeObject(_this, typeObject);
		if (typeMemberData) {
			var constants = typeMemberData.members.constants;
			for (var i = 0; i < constants.length; i++) {
				if (constants[i].getName() == constantName) return constants[i];
			}
		}
		throw new _.Member.Fatal(
			'CONSTANT_NOT_REGISTERED',
			'Provided name: ' + constantName
		);
	};
	
	var _getClassObjectFromInstanceOrConstructor = function(_this, instance)
	{
		// @todo Check instance is object
		var typeObject = _this._typeRegistry.getClass(instance);
		// @todo Check return is instance of ClassyJS.Type.Class
		return typeObject;
	};
	
	var _arraysEqual = function(array1, array2)
	{
		if (array1.length != array2.length) return false;
		for (var i = 0; i < array1.length; i++) if (array1[i] != array2[i]) return false;
		return true;
	};
	
	var _getAllMembers = function(_this, classObject)
	{
		var allMembers = [];
		var targetObject = classObject;
		var firstTime = true;
		do {
			if (firstTime) {
				firstTime = false;
			} else {
				targetObject = _this._typeRegistry.getParent(targetObject);
			}
			var members = _this.getMembers(targetObject);
			for (var i in members) allMembers.push(members[i]);
		} while (_this._typeRegistry.hasParent(targetObject));
		return allMembers;
	};
	
	var _membersAreValid = function(allMembers)
	{
		var abstractMembers = [];
		for (var i = allMembers.length; i > 0; i--) {
			if (typeof allMembers[i-1].isAbstract != 'undefined' && allMembers[i-1].isAbstract()) {
				abstractMembers.push(allMembers[i-1]);
			} else {
				for (var j in abstractMembers) {
					var abstractMember = abstractMembers[j];
					if (abstractMember.getName() === allMembers[i-1].getName()
					&&	abstractMember.isStatic() === allMembers[i-1].isStatic()
					&&	abstractMember.getReturnType() === allMembers[i-1].getReturnType()
					&&	_arraysEqual(
						abstractMember.getArgumentTypes(),
						allMembers[i-1].getArgumentTypes()
					)) {
						abstractMembers.splice(j, 1);
					}
				}
			}
		}
		return (abstractMembers.length > 0) ? false : true;
	};
	
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Registry = window.ClassyJS.Registry || {}
);

;(function(ClassyJS, Registry, _){
	
	var messages = {
		TYPE_REGISTRY_REQUIRED: 'Instance of ClassyJS.Registry.Type is required by constructor',
		TYPE_CHECKER_REQUIRED: 'Instance of ClassyJS.TypeChecker is required by constructor',
		NON_CLASS_INSTANCE_OR_CONSTRUCTOR_PROVIDED:
			'The provided call target was not an object instance or constructor',
		NON_STRING_METHOD_NAME_PROVIDED: 'The provided method name is not a string',
		NON_ARRAY_METHOD_ARGUMENTS_PROVIDED: 'The provided method arguments are not an array',
		TARGET_NOT_CLASS_OR_INTERFACE:
			'Object provided must be Type.Class or Type.Interface',
		PROPERTY_NOT_REGISTERED:
			'No property with the given name has been registered against the given type',
		PROPERTY_ALREADY_REGISTERED:
			'A property with the same name has already been registered against the given type',
		METHOD_NOT_REGISTERED:
			'No method with the given name and argument signature has been ' +
			'registered against the given type',
		METHOD_ALREADY_REGISTERED:
			'A method with the same name, argument signature and static setting has already ' +
			'been registered against the given type',
		EVENT_NOT_REGISTERED:
			'No event with the given name has been registered against the given type',
		EVENT_ALREADY_REGISTERED:
			'An event with the same name has already been registered against the given type',
		EVENT_TARGET_METHOD_NOT_REGISTERED:
			'The provided event target method does not exist',
		EVENT_BIND_NOT_PERMITTED: 'The event object did not indicate that the bind can be made',
		CONSTANT_NOT_REGISTERED:
			'No constant with the given name has been registered against the given type',
		CONSTANT_ALREADY_REGISTERED:
			'A constant with the same name has already been registered against the given type',
		CONSTANT_RETRIEVED_AGAINST_CLASS_INSTANCE:
			'A constant was requested using an instance of a class instead of its constructor'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Registry.Member.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Registry = window.ClassyJS.Registry || {},
	window.ClassyJS.Registry.Member = window.ClassyJS.Registry.Member || {}
);

(function(_){
	
	_.Instantiator = function()
	{
		this._typeFactory;
		this._classFactory;
		this._interfaceFactory;
		this._typeDefinitionFactory;
		this._classDefinitionFactory;
		this._interfaceDefinitionFactory;
		this._memberFactory;
		this._propertyFactory;
		this._methodFactory;
		this._eventFactory;
		this._constantFactory;
		this._memberDefinitionFactory;
		this._propertyDefinitionFactory;
		this._methodDefinitionFactory;
		this._eventDefinitionFactory;
		this._constantDefinitionFactory;
		this._namespaceManager;
		this._typeRegistry;
		this._memberRegistry;
		this._typeChecker;
		this._accessController;
	};
	
	_.Instantiator.prototype.getTypeFactory = function()
	{
		if (!this._typeFactory) {
			this._typeFactory = new ClassyJS.Type.Factory(
				this.getTypeDefinitionFactory(),
				this.getClassFactory(),
				this.getInterfaceFactory(),
				this.getTypeRegistry(),
				this.getMemberRegistry(),
				this.getNamespaceManager()
			);
		}
		return this._typeFactory;
	};
	
	_.Instantiator.prototype.getClassFactory = function()
	{
		if (!this._classFactory) {
			this._classFactory = new ClassyJS.Type.Class.Factory();
		}
		return this._classFactory;
	};
	
	_.Instantiator.prototype.getInterfaceFactory = function()
	{
		if (!this._interfaceFactory) {
			this._interfaceFactory = new ClassyJS.Type.Interface.Factory();
		}
		return this._interfaceFactory;
	};
	
	_.Instantiator.prototype.getTypeDefinitionFactory = function()
	{
		if (!this._typeDefinitionFactory) {
			this._typeDefinitionFactory = new ClassyJS.Type.DefinitionFactory(
				this.getClassDefinitionFactory(),
				this.getInterfaceDefinitionFactory()
			);
		}
		return this._typeDefinitionFactory;
	};
	
	_.Instantiator.prototype.getClassDefinitionFactory = function()
	{
		if (!this._classDefinitionFactory) {
			this._classDefinitionFactory = new ClassyJS.Type.Class.Definition.Factory();
		}
		return this._classDefinitionFactory;
	};
	
	_.Instantiator.prototype.getInterfaceDefinitionFactory = function()
	{
		if (!this._interfaceDefinitionFactory) {
			this._interfaceDefinitionFactory = new ClassyJS.Type.Interface.Definition.Factory();
		}
		return this._interfaceDefinitionFactory;
	};
	
	_.Instantiator.prototype.getMemberFactory = function()
	{
		if (!this._memberFactory) {
			this._memberFactory = new ClassyJS.Member.Factory(
				this.getMemberDefinitionFactory(),
				this.getPropertyFactory(),
				this.getMethodFactory(),
				this.getEventFactory(),
				this.getConstantFactory(),
				this.getTypeChecker(),
				this.getAccessController()
			);
		}
		return this._memberFactory;
	};
	
	_.Instantiator.prototype.getPropertyFactory = function()
	{
		if (!this._propertyFactory) {
			this._propertyFactory = new ClassyJS.Member.Property.Factory();
		}
		return this._propertyFactory;
	};
	
	_.Instantiator.prototype.getMethodFactory = function()
	{
		if (!this._methodFactory) {
			this._methodFactory = new ClassyJS.Member.Method.Factory();
		}
		return this._methodFactory;
	};
	
	_.Instantiator.prototype.getEventFactory = function()
	{
		if (!this._eventFactory) {
			this._eventFactory = new ClassyJS.Member.Event.Factory();
		}
		return this._eventFactory;
	};
	
	_.Instantiator.prototype.getConstantFactory = function()
	{
		if (!this._constantFactory) {
			this._constantFactory = new ClassyJS.Member.Constant.Factory();
		}
		return this._constantFactory;
	};
	
	_.Instantiator.prototype.getMemberDefinitionFactory = function()
	{
		if (!this._memberDefinitionFactory) {
			this._memberDefinitionFactory = new ClassyJS.Member.DefinitionFactory(
				this.getPropertyDefinitionFactory(),
				this.getMethodDefinitionFactory(),
				this.getEventDefinitionFactory(),
				this.getConstantDefinitionFactory()
			);
		}
		return this._memberDefinitionFactory;
	};
	
	_.Instantiator.prototype.getPropertyDefinitionFactory = function()
	{
		if (!this._propertyDefinitionFactory) {
			this._propertyDefinitionFactory = new ClassyJS.Member.Property.Definition.Factory();
		}
		return this._propertyDefinitionFactory;
	};
	
	_.Instantiator.prototype.getMethodDefinitionFactory = function()
	{
		if (!this._methodDefinitionFactory) {
			this._methodDefinitionFactory = new ClassyJS.Member.Method.Definition.Factory();
		}
		return this._methodDefinitionFactory;
	};
	
	_.Instantiator.prototype.getEventDefinitionFactory = function()
	{
		if (!this._eventDefinitionFactory) {
			this._eventDefinitionFactory = new ClassyJS.Member.Event.Definition.Factory();
		}
		return this._eventDefinitionFactory;
	};
	
	_.Instantiator.prototype.getConstantDefinitionFactory = function()
	{
		if (!this._constantDefinitionFactory) {
			this._constantDefinitionFactory = new ClassyJS.Member.Constant.Definition.Factory();
		}
		return this._constantDefinitionFactory;
	};
	
	_.Instantiator.prototype.getNamespaceManager = function()
	{
		if (!this._namespaceManager) {
			this._namespaceManager = new ClassyJS.NamespaceManager();
		}
		return this._namespaceManager;
	};
	
	_.Instantiator.prototype.getTypeRegistry = function()
	{
		if (!this._typeRegistry) {
			this._typeRegistry = new ClassyJS.Registry.Type();
		}
		return this._typeRegistry;
	};
	
	_.Instantiator.prototype.getMemberRegistry = function()
	{
		if (!this._memberRegistry) {
			this._memberRegistry = new ClassyJS.Registry.Member(
				this.getTypeRegistry(),
				this.getTypeChecker()
			);
		}
		return this._memberRegistry;
	};
	
	_.Instantiator.prototype.getTypeChecker = function()
	{
		if (!this._typeChecker) {
			this._typeChecker = new ClassyJS.TypeChecker();
		}
		return this._typeChecker;
	};
	
	_.Instantiator.prototype.getAccessController = function()
	{
		if (!this._accessController) {
			this._accessController = new ClassyJS.Access.Controller();
		}
		return this._accessController;
	};
	
})(window.ClassyJS = window.ClassyJS || {});

(function(){
	
	// Allow us to create basic objects
	// somewhere else and also ensure we
	// are creating single instances of
	// said classes
	var instantiator = new ClassyJS.Instantiator();
	var namespaceManager = instantiator.getNamespaceManager();
	
	// Create one global function which
	// is used to declare all types
	window.define = function(signature, members){
		
		/**
		 *	Read class/interface signature
		 *	Look for class vs interface
		 *	Get the constructor function
		 * Look for location so we can register the class/interface
		 * Register in directory with info about extensions and implementations and abstractiness
		 *	Loop through members and pass to front factory
		 *	Register each member against the class in a registry
		 *	Check members is array or object dependent on class/interface
		 */
		
		var typeObject = instantiator.getTypeFactory().build(signature);
		
		// Ensure members is provided as the relevant
		// format for the identified type
		_typeCheckMembers(members, typeObject);
		
		// If we are dealing with a class...
		if (typeObject instanceof ClassyJS.Type.Class) {
			
			// Create a new class constructor
			// providing it the class registry
			var constructor = new ClassyJS.Type.Class.Constructor(
				instantiator.getTypeRegistry(),
				instantiator.getMemberRegistry(),
				typeObject.getName()
			);
			
			// Register the class definition against
			// the class constructor in the class registry
			instantiator.getTypeRegistry().registerClass(typeObject, constructor);
			
			var staticMethods = [];
			var constants = [];
			
			if (typeObject.isExtension()) {
				var parentClass = typeObject.getParentClass();
				instantiator.getTypeRegistry().registerClassChild(parentClass, typeObject);
				var parentConstructor = instantiator.getTypeRegistry().getParent(constructor);
				constructor.prototype = _createObject(parentConstructor.prototype);
				constructor.prototype.constructor = constructor;
				_appendMemberNames(staticMethods, constants, parentClass);
			}
			
			constructor.prototype.toString = function(){
				return '[object ' + typeObject.getName() + ']'
			};
			
			// Place the constructor into the relevant
			// namespace location based on the name
			// identified in the class definition
			namespaceManager.registerClassFunction(
				typeObject.getName(),
				constructor
			);
			
			var interfaces = typeObject.getInterfaces();
			for (var i in interfaces) {
				instantiator.getTypeRegistry().registerInterfaceAgainstClass(
					interfaces[i],
					typeObject
				);
			}
			
		} else if (typeObject instanceof ClassyJS.Type.Interface) {
			
			instantiator.getTypeRegistry().registerInterface(typeObject);
			
		}
		
		for (var i in members) {
			
			if (Object.prototype.toString.call(members) == '[object Array]') {
				var member = instantiator.getMemberFactory().build(members[i], true);
			} else {
				var member = instantiator.getMemberFactory().build(i, false, members[i]);
			}
			
			instantiator.getMemberRegistry().register(member, typeObject);
			
			if (member instanceof ClassyJS.Member.Method && member.isStatic()) {
				
				staticMethods.push(member.getName());
				
			} else if (member instanceof ClassyJS.Member.Constant) {
				
				constants.push(member.getName());
				
			}
			
		}
		
		if (typeObject instanceof ClassyJS.Type.Class) {
			
			for (var i in staticMethods) {
				
				constructor[staticMethods[i]] = (function(name){
					return function(){
						return instantiator.getMemberRegistry().callMethod(
							constructor,
							{},
							name,
							Array.prototype.slice.call(arguments, 0)
						);
					};
				})(staticMethods[i]);
				
			}
			
			for (var i in constants) {
				
				constructor[constants[i]] = (function(name){
					return function(){
						return instantiator.getMemberRegistry().getConstant(
							constructor,
							{},
							name
						);
					};
				})(constants[i]);
			}
			
		}
		
	};
	
	var _typeCheckMembers = function(members, definition)
	{
		if (definition instanceof ClassyJS.Type.Class) {
			if (typeof members != 'undefined') {
				if (Object.prototype.toString.call(members) == '[object Array]') {
					throw new ClassyJS.Main.Fatal(
						'NON_OBJECT_CLASS_MEMBERS',
						'Provided type: array'
					);
				}
				if (typeof members != 'object') {
					throw new ClassyJS.Main.Fatal(
						'NON_OBJECT_CLASS_MEMBERS',
						'Provided type: ' + typeof members
					);
				}
			}
		} else if (definition instanceof ClassyJS.Type.Interface) {
			if (typeof members != 'undefined') {
				if (Object.prototype.toString.call(members) != '[object Array]') {
					throw new ClassyJS.Main.Fatal(
						'NON_ARRAY_INTERFACE_MEMBERS',
						'Provided type: ' + typeof members
					);
				}
			}
		}
	};
	
	var _createObject = function(prototype)
	{
		function F(){};
		F.prototype = prototype;
		return new F();
	};
	
	var _appendMemberNames = function(staticMethods, constants, classObject)
	{
		var members = instantiator.getMemberRegistry().getMembers(classObject);
		for (var i in members) {
			if (members[i] instanceof ClassyJS.Member.Method && members[i].isStatic()) {
				staticMethods.push(members[i].getName());
			} else if (members[i] instanceof ClassyJS.Member.Constant) {
				constants.push(members[i].getName());
			}
		}
	};
	
})();

;(function(ClassyJS, _){
	
	var messages = {
		NON_OBJECT_CLASS_MEMBERS:		'Provided class members must be defined as object',
		NON_ARRAY_INTERFACE_MEMBERS:	'Provided interface members must be defined as array'
	};
	
	_.Fatal = ClassyJS.Fatal.getFatal('Main.Fatal', messages);
	
})(
	window.ClassyJS = window.ClassyJS || {},
	window.ClassyJS.Main = window.ClassyJS.Main || {}
);
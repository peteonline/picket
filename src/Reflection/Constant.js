(function(Picket, _){
	
	_.Constant = function(classIdentifier, constantName)
	{
		
		if (typeof classIdentifier == 'string') {
			classIdentifier = Picket._instantiator.getNamespaceManager().getNamespaceObject(
				classIdentifier
			);
		}
		
		if (typeof classIdentifier != 'function' && typeof classIdentifier != 'object') {
			throw new _.Constant.Fatal(
				'INVALID_IDENTIFIER_PROVIDED',
				'Provided type: ' + typeof classIdentifier
			);
		}
		
		if (typeof constantName != 'string') {
			throw new _.Constant.Fatal(
				'NON_STRING_CONSTANT_NAME_PROVIDED',
				'Provided type: ' + typeof constantName
			);
		}
		
		if (!Picket._instantiator.getTypeRegistry().classExists(classIdentifier)) {
			throw new _.Constant.Fatal('CLASS_DOES_NOT_EXIST');
		}
		
		this._classObject = Picket._instantiator.getTypeRegistry().getClass(classIdentifier);
		
		var members = _getMembers(this);
		
		for (var i = 0; i < members.length; i++) {
			
			if (members[i] instanceof Picket.Member.Constant
			&&  members[i].getName() == constantName) {
				this._constantObject = members[i];
				return;
			}
			
		}
		
		throw new _.Constant.Fatal(
			'CONSTANT_DOES_NOT_EXIST',
			'Constant name: ' + constantName
		);
		
	};
	
	_.Constant.prototype.getName = function()
	{
		return this._constantObject.getName();
	};
	
	_.Constant.prototype.getType = function()
	{
		return Picket._instantiator.getReflectionFactory().buildType(
			this._constantObject.getTypeIdentifier()
		);
	};
	
	_.Constant.prototype.getAccessType = function()
	{
		return Picket._instantiator.getReflectionFactory().buildAccessType(
			this._constantObject.getAccessTypeIdentifier()
		);
	};
	
	_.Constant.prototype.getValue = function()
	{
		return this._constantObject.get();
	};
	
	_.Constant.prototype.isAutoGenerated = function()
	{
		return this._constantObject.isAutoGenerated();
	};
	
	_.Constant.prototype.getClass = function()
	{
		return Picket._instantiator.getReflectionFactory().buildClass(
			this._classObject.getName()
		);
	};
	
	var _getMembers = function(_this)
	{
		return Picket._instantiator.getMemberRegistry().getMembers(_this._classObject);
	};
	
	window.Reflection = window.Reflection || {};
	window.Reflection.Constant = _.Constant;
	
})(
	window.Picket = window.Picket || {},
	window.Picket.Reflection = window.Picket.Reflection || {}
);

describe('Events', function(){
	
	beforeEach(function(){
		window.My = undefined;
	});
	
	it('can be declared, bound and triggered', function(){
		define('class My.EventClass', {
			'public event myEvent ()': undefined,
			'public triggerEvent () -> undefined': function(){
				this.trigger('myEvent', []);
			}
		});
		define('class My.TargetClass', {
			'public targetMethodCalled (boolean)': false,
			'public construct (My.EventClass) -> undefined': function(eventObject){
				eventObject.bind('myEvent', 'targetMethod');
			},
			'public targetMethod () -> undefined': function(){
				this.targetMethodCalled(true);
			}
		});
		var eventObject = new My.EventClass();
		var targetObject = new My.TargetClass(eventObject);
		eventObject.triggerEvent();
		expect(targetObject.targetMethodCalled()).toBe(true);
	});
	
	it('can pass arguments', function(){
		define('class My.EventClass', {
			'public event myEvent (string, number)': undefined,
			'public triggerEvent () -> undefined': function(){
				this.trigger('myEvent', ['Example', 123]);
			}
		});
		define('class My.TargetClass', {
			'public eventArguments (array)': [],
			'public construct (My.EventClass) -> undefined': function(eventObject){
				eventObject.bind('myEvent', 'targetMethod');
			},
			'public targetMethod (string, number) -> undefined': function(string, number){
				this.eventArguments().push(string);
				this.eventArguments().push(number);
			}
		});
		var eventObject = new My.EventClass();
		var targetObject = new My.TargetClass(eventObject);
		eventObject.triggerEvent();
		expect(targetObject.eventArguments()).toEqual(['Example', 123]);
	});
	
	it('throws error if target method argument types do not match event types', function(){
		var expectedFatal = new ClassyJS.Registry.Member.Fatal(
			'EVENT_TARGET_METHOD_NOT_REGISTERED',
			'Event name: myEvent; Method name: targetMethod'
		);
		define('class My.EventClass', {
			'public event myEvent (string, number)': undefined
		});
		define('class My.TargetClass', {
			'public construct (My.EventClass) -> undefined': function(eventObject){
				eventObject.bind('myEvent', 'targetMethod');
			},
			'public targetMethod (string) -> undefined': function(){}
		});
		var eventObject = new My.EventClass();
		expect(function(){ new My.TargetClass(eventObject); }).toThrow(expectedFatal);
	});
	
});
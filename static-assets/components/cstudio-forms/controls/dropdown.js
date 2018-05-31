CStudioForms.Controls.Dropdown = CStudioForms.Controls.Dropdown ||  
function(id, form, owner, properties, constraints, readonly)  {
	this.owner = owner;
	this.owner.registerField(this);
	this.errors = []; 
	this.properties = properties;
	this.constraints = constraints;
	this.inputEl = null;
	this.countEl = null;
	this.required = false;
	this.value = "_not-set";
	this.form = form;
	this.id = id;
	this.readonly = readonly;
	
	amplify.subscribe("/datasource/loaded", this, this.onDatasourceLoaded);

	return this;
}

YAHOO.extend(CStudioForms.Controls.Dropdown, CStudioForms.CStudioFormField, {
    getLabel: function() {
        return CMgs.format(langBundle, "dropdown");
    },

	validate: function(obj) {
		if(obj.inputEl)
			obj.value = obj.inputEl.value;
		if(obj.required) {
			if(obj.value == "") {
				obj.setError("required", "Field is Required");
				obj.renderValidation(true, false);
			}
			else {
				obj.clearError("required");
				obj.renderValidation(true, true);
			}
		}
		else {
			obj.renderValidation(false, true);
		}
		obj.owner.notifyValidation();
	},

	_onChange: function(evt, obj) {
		this.validate(obj);
		obj.form.updateModel(obj.id, obj.getValue());
	},

    _onChangeVal: function(evt, obj) {
        obj.edited = true;
        obj._onChange(evt,obj);
    },

	onDatasourceLoaded: function ( data ) {		//TODO: is this being called? forms-engine 1439
		if (this.datasourceName === data.name && !this.datasource) {
    		var datasource = this.form.datasourceMap[this.datasourceName];
    		this.datasource = datasource;
			datasource.getList(this.callback);
    	}
	},
    	
	render: function(config, containerEl) {
		// we need to make the general layout of a control inherit from common
		// you should be able to override it -- but most of the time it wil be the same
		containerEl.id = this.id;
		
		var datasource = null;
		var showEmptyValue = false;
		var _self = this;

			for(var i=0; i<config.properties.length; i++) {
				var prop = config.properties[i];
				
				if(prop.name == "datasource") {
					if(prop.value && prop.value != "") {
						this.datasourceName = (Array.isArray(prop.value)) ? prop.value[0] : prop.value;
						this.datasourceName = this.datasourceName.replace("[\"","").replace("\"]","");
					}
				}
				
				if(prop.name == "emptyvalue"){
					showEmptyValue = eval(prop.value);
				}
				
				if(prop.name == "readonly" && prop.value == "true"){
					this.readonly = true;
				}
			}

			var keyValueList = null;

			var cb = {
				success: function(list) {
					keyValueList = list;
					var titleEl = document.createElement("span");

			  		    YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
						titleEl.innerHTML = config.title;

					if(!_self.controlWidgetContainerEl){
						var controlWidgetContainerEl = document.createElement("div");
						YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-dropdown-container');

						var validEl = document.createElement("span");
						YAHOO.util.Dom.addClass(validEl, 'validation-hint');
						YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation');
						controlWidgetContainerEl.appendChild(validEl);

						var inputEl = document.createElement("select");
						_self.inputEl = inputEl;
						YAHOO.util.Dom.addClass(inputEl, 'datum');
						YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-dropdown');

						if(showEmptyValue){
							var optionEl = document.createElement("option");
							optionEl.text = "";
							optionEl.value = "";
							inputEl.add(optionEl);
						}

						_self.controlWidgetContainerEl = controlWidgetContainerEl;
						_self.controlWidgetContainerEl.inputEl = inputEl;

						inputEl.value = (_self.value == "_not-set") ? config.defaultValue : _self.value;
						_self.controlWidgetContainerEl.appendChild(inputEl);
						YAHOO.util.Event.on(inputEl, 'focus', function(evt, context) { context.form.setFocusedField(context) }, _self);
						YAHOO.util.Event.on(inputEl, 'change', _self._onChangeVal, _self);

						_self.renderHelp(config, _self.controlWidgetContainerEl);

						var descriptionEl = document.createElement("span");
						YAHOO.util.Dom.addClass(descriptionEl, 'description');
						YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
						descriptionEl.innerHTML = config.description;

						containerEl.appendChild(titleEl);
						containerEl.appendChild(_self.controlWidgetContainerEl);
						containerEl.appendChild(descriptionEl);
					}

					if(keyValueList){
						for(var j=0; j<keyValueList.length; j++) {
							var item = keyValueList[j];
							var optionEl = document.createElement("option");
                            optionEl.text = item.value || item.value_f || item.value_smv || item.value_imv
                                || item.value_fmv || item.value_dtmv || item.value_htmlmv;
                            optionEl.value = item.key;
							_self.controlWidgetContainerEl.inputEl.add(optionEl);
						}
					}

					if(_self.readonly == true){
						inputEl.disabled = true;
					}

                    var configValue = _self.getValue();
                    for(var x = 0; x < _self.inputEl.options.length; x++) {
                        if(_self.inputEl.options[x].label.toLowerCase() === configValue.toLowerCase()) {
                            _self.inputEl.value = configValue; // set value after loading data source
                            _self.validate(_self);
                        }
                    }

                }
			};

			var dataSourceNames = this.datasourceName.split(","),
				datasources = [];

			for(var x = 0; x < dataSourceNames.length; x++) {
				var currentDatasource = this.form.datasourceMap[dataSourceNames[x]];
				datasources.push(currentDatasource);

				if(currentDatasource){
					currentDatasource.getList(cb);
				}else{
					this.callback = cb;
				}
			}

			var datasource = datasources[0];
			if(datasource){
				this.datasource = datasource;
				//datasource.getList(cb);
		    }else{
		    	this.callback = cb;
		    }
					
	},

	getValue: function() {
		return this.value;
	},
	
	setValue: function(value) {
		this.value = value;
        if(this.inputEl)
		    this.inputEl.value = value;
		this._onChange(null, this);
        this.edited = false;
	},
	
	getName: function() {
		return "dropdown";
	},
	
	getSupportedProperties: function() {
		return [ 
		   	{ label: CMgs.format(langBundle, "datasource"), name: "datasource", type: "datasource:item" },
		    { label: CMgs.format(langBundle, "allowEmptyValue"), name: "emptyvalue", type: "boolean" },
			{ label: CMgs.format(langBundle, "readonly"), name: "readonly", type: "boolean" }
		];
	},

	getSupportedConstraints: function() {
		return [
			{ label: CMgs.format(langBundle, "required"), name: "required", type: "boolean" }
		];
	}

});


CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-dropdown", CStudioForms.Controls.Dropdown);
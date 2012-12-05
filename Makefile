_FILES=array_form 
_TESTS=array_form initializer
_DEPS=underscore/underscore backbone/backbone mocha/mocha chai/chai

SRC=src
OUT=out
SPEC=spec/js

DEP=$(patsubst %, node_modules/%.js, $(_DEPS))
FILES=$(patsubst %, $(SRC)/%.coffee, $(_FILES))
TESTS=$(patsubst %, $(SPEC)/%_spec.coffee, $(_TESTS))

.PHONY: coffee_test playaround

playaround: Gemfile package.json
	@echo $<

prepare_tests: node_modules/mocha/mocha.css coffee_test
	@cp $< $(OUT)/mocha.css -f

coffee_test:  $(DEP) $(OUT)/coffee_spec.js
	@cat $^ > $(OUT)/coffee_test.js

$(OUT)/coffee_spec.js: $(OUT)/coffee_spec.coffee
	@coffee -co $(OUT) $<

$(OUT)/coffee_spec.coffee: $(FILES) $(TESTS)
	@cake tests
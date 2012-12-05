
class ArrayForm extends Backbone.Model
	initialize: (@form) ->


expect = chai.expect
should = chai.should()
mocha.setup "bdd"
$("document").ready ->
	mocha.globals(['ArrayForm']).run()
# document ready


describe "array_form", ->
	describe "sanity", ->
		it "should exist", ->
			expect(ArrayForm).to.be.ok
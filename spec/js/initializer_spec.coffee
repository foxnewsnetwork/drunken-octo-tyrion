expect = chai.expect
should = chai.should()
mocha.setup "bdd"
$("document").ready ->
	mocha.globals(['ArrayForm']).run()
# document ready
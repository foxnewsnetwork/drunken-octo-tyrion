
class ArrayForm extends Backbone.Model
	initialize: (@form, repeat) -> 
		# Step 1: attach submit
		form.submit =>
			@submit_form()
			return false

		# Step 2: grab the repeated items
		@repeats = grab_repeats repeat

		# Step 3: remove the original
		@form.children( repeat ).html(@repeats)

		# Step 4: inject the clone button
		

	, # initialize
	transform: ->
	, # transform
	submit_form: ->
	, # submit_form

# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

# class ArrayFormSmith
# 	initialize: (@repeats='array-fields') ->
# 	transform: (form) ->
# 		form.children(@repeats)
# 		# step 1: get fields
# 		tree = ArrayFormSmith.to_tree form 

# 		# step 2: map fields
# 		modded_tree = tree.map (node) =>
# 			@modify_attributes node

# 		# step 3: reconvert
# 		form.html( modded_tree )


# $( ->
# 	# Step 1: Inject + button
# 	maker = new ArrayFormSmith( 'array-fields' )
# 	maker.transform $(".array-form")
# ) 

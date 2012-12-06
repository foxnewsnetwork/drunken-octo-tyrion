# The sale class is an intermediary between transaction and controller
class Sale < Transaction
	def key
		"sale::" + plant.name.to_s + "::" + user.id.to_s
	end # key

	def initialize plant, *qs
		super plant, "sale", *qs
	end # initialize
end # sale
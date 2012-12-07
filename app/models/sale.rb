# The sale class is an intermediary between transaction and controller
class Sale < Transaction
	def key
		"sale-" + plant.id.to_s + "-" + user.id.to_s
	end # key

	def initialize plant, *qs
		if 1 == qs.count and qs.first.is_a? String
			super plant, "sale"
		else
			super plant, "sale", *qs
		end # else
	end # initialize
end # sale
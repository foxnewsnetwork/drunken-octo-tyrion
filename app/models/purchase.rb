class Purchase < Transaction
	def key
		"purchase-" + plant.id.to_s + "-" + user.id.to_s
	end # key

	def initialize plant, *qs
		if 1 == qs.count and qs.first.is_a? String
			super plant, "purchase"
		else
			super plant, "purchase", *qs
		end # else
	end # initialize
end # Purchase
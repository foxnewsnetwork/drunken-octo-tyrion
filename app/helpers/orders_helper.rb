module OrdersHelper
	def mtilify material
		price = material.unit_price
		price = price.abs <= 0.000001 ? 'unknown' : price.abs unless price.is_a? String
		{
			:image => "http://placehold.it/150x100" ,
			:header => material.name ,
			:content => material.mass.to_s + " @ $#{price} per #{material.units}" ,
			:link => "#"
		}
	end # tilify	
end # Orders

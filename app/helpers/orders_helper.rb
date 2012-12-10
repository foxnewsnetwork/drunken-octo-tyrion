module OrdersHelper
	def mtilify material
		{
			:image => "http://placehold.it/150x100" ,
			:header => material.name ,
			:content => material.mass.to_s + " @ $#{material.unit_price <= 0.00001 ? 'unknown' : material.unit_price } per #{material.units}" ,
			:link => "#"
		}
	end # tilify	
end # Orders

module PagesHelper

	def tilify duck
		case duck.class.to_s
		when Plant.to_s
			{
				:image => "http://placehold.it/150x100" ,
				:header => duck.name ,
				:content => "#{duck.address} in #{duck.city} #{duck.state}, #{duck.country}" ,
				:link => plant_path(duck)
			}
		else
			throw "No tilify implementation exists for #{duck}"
		end # case
	end # tilify

	
end

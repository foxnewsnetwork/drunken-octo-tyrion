# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

plant_attr = {
	:name => "Louisana Paper" ,
	:country => "USA" ,
	:state => "LA" ,
	:city => "Alexandria" ,
	:address => "400 Black Street" ,
	:sqft => 100000,
	:founding_date => 100.years.ago,
	:closing_date => 1.years.ago
} # plant
@plant = Plant.create plant_attr
@materials = []
@materials.push << { :name => "scrap steel", :price => 0.6, :units => "pounds" }
@materials.push << { :name => "stainless steel", :price => 0.86, :units => "pounds" }
@materials.push << { :name => "aluminum", :price => 0.86, :units => "pounds" }
@materials.push << { :name => "copper", :price => 4.96, :units => "pounds" }
@materials.push << { :name => "iron", :price => 0.66, :units => "pounds" }
@materials.push << { :name => "gold", :price => 27200, :units => "pounds" }
@materials.push << { :name => "platinum", :price => 25200, :units => "pounds" }
@companies = ["Cohen", "American Compressed Steel", "Harbor Metal Group", "BKB", "Hadalgo", "JW"]
@user = User.create( :name => "Young", :email => "yangshengchang@harbormetalinvestment.com", :password => 1234567)
@user.level = 4
@user.save
100.times do |n|
	material = @materials[n % @materials.count]
	company = @companies[n % @companies.count]
	@plant.sells.some(material.merge :quantity => 1000 + rand(40000)).signed_by(@user).to(company)
end # times do n

@invoices = []

40.times do |n|
	invoice = {
		:notes => "Check number: #{n*n*13}; for various services rendered" ,
		:amount => rand(9999) + 1000 ,
		:pay_method => "check" ,
		:status => "deposited"
	}
	company = Company.find_by_id( n % 6 )
	if 0 == n % 2
		out = @plant.invoices.new(invoice).from(@plant).to(company)
		out.save
		out.connect_to! n
		out.connect_to!( n * 17 % 100)
	end
	if 1 == n % 2
		inc = @plant.invoices.new(invoice).from(company).to(@plant)
		inc.save
	end

	
end # 10 times
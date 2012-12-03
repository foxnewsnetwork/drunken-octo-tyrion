# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
	sequence :metal do |n|
		"metal##{n}"
	end # metal

	sequence :quantities do |n|
		{ :quantity => (50*n).to_f, :units => "pounds" }
	end # quantites

  factory :material do
  	name FactoryGirl.generate(:metal)
	quantity 5000
	unit_price 15.0
	units 'tons'
	association :buyable, :factory => :plant, :strategy => :build
  end
end

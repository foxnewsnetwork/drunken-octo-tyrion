# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
	sequence :metal do |n|
		"metal##{n}"
	end # metal

	sequence :quantities do |n|
		{ :quantity => (50*n).to_f, :units => "pounds" }
	end # quantites

  factory :material do
  	name "steel"
	quantity 5000
	units 'tons'
	association :buyable, :factory => :plant, :strategy => :build
  end
end

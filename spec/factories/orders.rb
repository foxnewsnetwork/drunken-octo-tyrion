# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :order do
  	carrier Faker::Company.name
	external_id Faker::Name.first_name
	notes Faker::Company.bs
	association :company, :factory => :company, :strategy => :build
	association :plant, :factory => :plant, :strategy => :build
  end # order
end # factory

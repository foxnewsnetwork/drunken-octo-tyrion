# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :plant do
  	name Faker::Company.name
	country Faker::Address.country
	state Faker::Address.state
	city Faker::Address.city
	address Faker::Address.street_address
	sqft 10000
	founding_date Date.today - 10
	closing_date Date.today
  end
end

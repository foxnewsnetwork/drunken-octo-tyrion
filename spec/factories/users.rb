# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  sequence :email do |n|
  	Faker::Internet.email + n.to_s
  end # email
  factory :user do
    name Faker::Name.first_name
    email FactoryGirl.generate(:email)
    password "123456789"
    level 1
  end
end

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :invoice do
	notes Faker::Company.bs
	pay_method "check"
	amount 12225
	association :receivable
	association :payable
  end
end

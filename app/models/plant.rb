# == Schema Information
#
# Table name: plants
#
#  id            :integer          not null, primary key
#  name          :string(255)
#  country       :string(255)
#  state         :string(255)
#  city          :string(255)
#  address       :string(255)
#  sqft          :integer
#  founding_date :date
#  closing_date  :date
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class Plant < ActiveRecord::Base
  include Accountable
  attr_accessible :name, :country, :state, :city, :address, :sqft, :founding_date, :closing_date
  has_many :materials, :as => :buyable
  has_many :orders

  # Accountable package
  implement_income do |plant|
    plant.orders.inject(0) { |mem, order| mem += order.gross_income }
  end # income
  implement_expenses do |plant|
    plant.orders.inject(0) { |mem, order| mem += order.expenses }
  end # expenses

  # qs = [quantity, units]
  # qs = [{:quantity => , :units =>}, ...]
  def sells *qs
		if qs.first.is_a? Integer or qs.first.is_a? Float and qs.last.is_a? String
			Sale.new self, :quantity => qs.first, :units => qs.last
		else
      Sale.new self, *qs
    end
  end # sells

  def buys *qs
    if qs.first.is_a? Integer or qs.first.is_a? Float and qs.last.is_a? String
      Purchase.new self, :quantity => qs.first, :units => qs.last
    else
      Purchase.new self, *qs
    end
  end # buys
end # Plant



# == Schema Information
#
# Table name: companies
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Company < ActiveRecord::Base
  include Accountable
  attr_accessible :name
  has_many :orders

  # Accountable module
  implement_income do |company|
    company.orders.inject(0) do |mem, order| 
      mem += order.expenses
    end
  end # implement_income
  implement_expenses do |company|
    company.orders.inject(0) do |mem, order| 
      mem += order.gross_income
    end
  end # implement_expenses

  # qs = [quantity, units]
  # qs = [{:quantity => , :units =>}, ...]
  # note that from the plant's point of view, a 'buy' is a sale
  def buys *qs
  	if qs.first.is_a? Integer or qs.first.is_a? Float and qs.last.is_a? String
      Transaction.new self, "sale", :quantity => qs.first, :units => qs.last
    else
      Transaction.new self, "sale", *qs
    end
  end # buys
end # company

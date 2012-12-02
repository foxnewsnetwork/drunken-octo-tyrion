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
  attr_accessible :name
  has_many :orders

  # qs = [quantity, units]
  # qs = [{:quantity => , :units =>}, ...]
  def buys *qs
  	if qs.first.is_a? Integer or qs.first.is_a? Float and qs.last.is_a? String
      Transaction.new self, :quantity => qs.first, :units => qs.last
    else
      Transaction.new self, *qs
    end
  end # buys
end # company

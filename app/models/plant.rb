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
  attr_accessible :name, :country, :state, :city, :address, :sqft, :founding_date, :closing_date
  has_many :materials, :as => :buyable

  # qs = [quantity, units]
  # qs = [{:quantity => , :units =>}, ...]
  def sells *qs
		if qs.first.is_a? Integer or qs.first.is_a? Float and qs.last.is_a? String
			Transaction.new self, :quantity => qs.first, :units => qs.last
		else
      Transaction.new self, *qs
    end
  end # sells
end # Plant



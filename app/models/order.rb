# == Schema Information
#
# Table name: orders
#
#  id          :integer          not null, primary key
#  company_id  :integer
#  plant_id    :integer
#  carrier     :string(255)
#  external_id :string(255)
#  notes       :text
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class Order < ActiveRecord::Base
  # Accountable features:
  # gross_income, expenses, net_income
  include Accountable
  attr_accessible :carrier, :external_id, :notes
  belongs_to :company
  belongs_to :plant 
  has_many :materials, :as => :buyable, :include => :buyable
  # from Accountable
  implement_income do |order|
    order.materials.inject(0) do |mem, material| 
      mem += material.cost if 0 < material.cost  
    end
  end # implement_income
  implement_expenses do |order|
    order.materials.inject(0) { |mem, material| mem -= material.cost if 0 > material.cost  }
  end # 
end # Order


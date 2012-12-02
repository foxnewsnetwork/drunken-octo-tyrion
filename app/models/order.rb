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
  attr_accessible :carrier, :external_id, :notes
  belongs_to :company
  belongs_to :plant 
  has_many :materials, :as => :buyable
end # Order


# == Schema Information
#
# Table name: materials
#
#  id           :integer          not null, primary key
#  name         :string(255)
#  quantity     :decimal(12, 4)
#  units        :string(255)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  buyable_id   :integer
#  buyable_type :string(255)
#  unit_price   :decimal(12, 4)
#

class Material < ActiveRecord::Base
	belongs_to :buyable, :polymorphic => true
	attr_accessible :name, :quantity, :units, :unit_price
	
	def cost
		unit_price * quantity
	end # cost

	def mass
		Mass.new quantity, units
	end # mass
end # Material

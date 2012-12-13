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
	###
	# Tsundere
	###
	include Tsundere
	attr_tsundere :id, :mass, :name, :quantity, :units, :buyable, :created_at, :updated_at, :as => { :logistics => 2 }
	attr_tsundere :cost, :unit_price, :as => { :accounting => 4 }

	belongs_to :buyable, :polymorphic => true
	attr_accessible :name, :quantity, :units, :unit_price
	
	def cost
		if unit_price.nil? or quantity.nil?
			0
		else
			unit_price * quantity
		end
	end # cost

	def mass
		Mass.new quantity, units
	end # mass
end # Material

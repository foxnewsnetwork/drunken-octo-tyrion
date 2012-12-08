# == Schema Information
#
# Table name: invoices
#
#  id              :integer          not null, primary key
#  plant_id        :integer
#  notes           :text
#  pay_method      :string(255)
#  amount          :decimal(12, 2)
#  payable_id      :integer
#  payable_type    :string(255)
#  receivable_id   :integer
#  receivable_type :string(255)
#  status          :string(255)      default("out"), not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

class Invoice < ActiveRecord::Base
	###
	# Attributes
	###
	attr_accessible :notes, :pay_method, :amount, :status

	###
	# Relationships
	###
	has_many :connections
	has_many :orders, :through => :connections
	belongs_to :plant
	belongs_to :payable, :polymorphic => true
	belongs_to :receivable, :polymorphic => true

	###
	# Methods
	### 
	def connect_to! *orders
		orders.each do |order|
			case order.class.to_s
			when "Order"
				connection = connections.new :order_id => order.id 
			when "String"
				connection = connections.new :order_id => order.to_i
			when "Integer", "Fixnum"
				connection = connections.new :order_id => order
			else
				throw "Bad input error #{order}; expected either an Order, String, Integer, or Fixnum for ID"
			end # order
			throw "Unable to save #{connection} for #{self} and #{order} to db" unless connection.save!
		end # each orders
	end # connect_to

	def from(origin)
		self.receivable = origin
		self
	end # from

	def to(destination)
		self.payable = destination
		self
	end # to
end # Invoice

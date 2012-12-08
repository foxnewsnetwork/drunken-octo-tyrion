# == Schema Information
#
# Table name: connections
#
#  id         :integer          not null, primary key
#  invoice_id :integer
#  order_id   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Connection < ActiveRecord::Base
	belongs_to :invoice
	belongs_to :order
	attr_accessible :invoice_id, :order_id
	def tied_to duck
		case duck.class.to_s
		when Invoice.to_s
			invoice_id = duck.id if duck.is_a? Invoice
		when Order.to_s
			order_id = duck.id if duck.is_a? Order 
		else
			throw "Your duck #{duck} is actually a goose"
		end # case
		self
	end # tied_to
end
